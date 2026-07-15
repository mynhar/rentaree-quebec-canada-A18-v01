import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ScanService, ScanRequestFull, DimensionInput } from './scan.service';
import { PropertyService } from '../properties/property.service';
import { PhotoPickerComponent } from '../properties/shared/photo-picker.component';
import { PropertyMapComponent } from '../properties/quebec-city/property-map.component';
import { AppHeaderComponent } from '../../core/layout/app-header.component';
import { SafeTourUrlPipe } from '../../core/util/safe-url.pipe';
import { Property, PropertyMedia, ScanStatus } from '../../core/models/database.types';
import { buildAddress, formatDateTime } from '../../core/util/format';
import { errorMessage } from '../../core/util/errors';
import { TranslocoDirective } from '@jsverse/transloco';

/** Clave de traducción del estado de una solicitud de escaneo. */
export function scanStatusKey(status: ScanStatus): string {
  return `scan.status.${status}`;
}

@Component({
  selector: 'app-scanner-dashboard',
  standalone: true,
  imports: [FormsModule, RouterLink, PhotoPickerComponent, PropertyMapComponent, AppHeaderComponent, SafeTourUrlPipe, TranslocoDirective],
  template: `
    <ng-container *transloco="let t">
    <app-header />

    <main class="wrap">
      @if (loading()) {
        <p class="state">{{ t('scanner.loading') }}</p>
      } @else if (requests().length === 0) {
        <div class="state">
          <p class="state__title">{{ t('scanner.emptyTitle') }}</p>
          <p>{{ t('scanner.emptyText') }}</p>
        </div>
      } @else {
        <h1>{{ t('scanner.heading') }}</h1>
        <p class="lead">{{ t('scanner.lead') }}</p>

        <div class="list">
          @for (r of requests(); track r.id) {
            <article class="req" [class.req--open]="openId() === r.id">
              <div class="req__head" (click)="toggle(r)">
                <div>
                  <p class="exp">{{ r.properties.expediente }}</p>
                  <p class="addr">{{ addr(r) }}</p>
                  @if (r.scheduled_at) {
                    <p class="when">{{ t('scanner.schedule') }} · {{ when(r.scheduled_at) }}</p>
                  } @else {
                    <p class="when when--none">{{ t('scanner.notScheduled') }}</p>
                  }
                </div>
                <span class="status" [attr.data-s]="r.status">{{ t(statusKey(r.status)) }}</span>
              </div>

              @if (openId() === r.id) {
                <div class="req__body">
                  <!-- Cliente a visitar + ubicación -->
                  <div class="visit">
                    <div class="visit__client">
                      <span class="mono-label">{{ t('scanner.client') }}</span>
                      <p class="visit__name">{{ r.properties.contact_first_name }} {{ r.properties.contact_last_name }}</p>
                      <a class="visit__row" [href]="'tel:' + r.properties.contact_phone">{{ r.properties.contact_phone }}</a>
                      <a class="visit__row" [href]="'mailto:' + r.properties.contact_email">{{ r.properties.contact_email }}</a>
                    </div>
                    <div class="visit__map">
                      <span class="mono-label">{{ t('scanner.location') }}</span>
                      <p class="visit__addr">{{ addr(r) }}@if (r.properties.neighbourhood) { · {{ r.properties.neighbourhood }} }</p>
                      @if (r.properties.latitude != null && r.properties.longitude != null) {
                        <div class="map-box" [class.map-box--big]="mapBig()">
                          <button type="button" class="map-box__btn" (click)="mapBig.set(!mapBig())">
                            {{ mapBig() ? t('scanner.reduce') : t('scanner.enlarge') }}
                          </button>
                          <app-property-map
                            [properties]="mapProps(r)"
                            [center]="{ lat: r.properties.latitude, lng: r.properties.longitude }"
                            [selectedId]="r.property_id"
                            [fullscreen]="true" />
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Recorridos 3D (Matterport): varios, con layout por tamaños -->
                  <div class="field">
                    <label [for]="'tour-' + r.id">{{ t('scanner.tour.label') }}</label>

                    @if (tours().length) {
                      <div class="tours">
                        @for (tour of tours(); track $index) {
                          <figure class="tour">
                            <iframe class="tour__frame" [src]="tour.embed_url | safeTourUrl"
                              [title]="t('scanner.tour.label')"
                              allow="xr-spatial-tracking; fullscreen" allowfullscreen loading="lazy"></iframe>
                            <button type="button" class="tour__del" (click)="removeTour($index)"
                              [attr.aria-label]="t('scanner.tour.remove')">×</button>
                          </figure>
                        }
                      </div>
                    }

                    <div class="tour-add">
                      <input [id]="'tour-' + r.id" class="input mono" type="url"
                        placeholder="https://my.matterport.com/show/?m=XXXXXXXX"
                        [(ngModel)]="newTour" (keydown.enter)="$event.preventDefault(); addTour()" />
                      <button type="button" class="btn btn--ghost" (click)="addTour()">{{ t('scanner.tour.add') }}</button>
                    </div>
                    <small class="note">{{ t('scanner.tour.note') }}</small>
                  </div>

                  <!-- Fotos -->
                  <div class="field">
                    <label>{{ t('scanner.photos.label') }}</label>
                    <app-photo-picker
                      [existing]="photos()"
                      [disabled]="busy()"
                      (existingRemove)="deletePhoto($event)"
                    />
                  </div>

                  <!-- Dimensiones -->
                  <div class="dims">
                    <div class="dims__head">
                      <span>{{ t('scanner.dims.room') }}</span>
                      <span>{{ t('scanner.dims.width') }}</span>
                      <span>{{ t('scanner.dims.length') }}</span>
                      <span>{{ t('scanner.dims.area') }}</span>
                      <span></span>
                    </div>
                    @for (d of dims(); track $index) {
                      <div class="dims__row">
                        <input class="input" [placeholder]="t('scanner.dims.roomPlaceholder')"
                          [(ngModel)]="d.room_name" />
                        <input class="input mono" type="number" step="0.01" [(ngModel)]="d.width"
                          (ngModelChange)="recalc(d)" />
                        <input class="input mono" type="number" step="0.01" [(ngModel)]="d.length"
                          (ngModelChange)="recalc(d)" />
                        <input class="input mono" type="number" step="0.01" [(ngModel)]="d.area" />
                        <button class="del" type="button" (click)="removeRow($index)"
                          [attr.aria-label]="t('scanner.dims.remove')">×</button>
                      </div>
                    }
                    <div class="dims__foot">
                      <button class="btn btn--ghost" type="button" (click)="addRow()">
                        {{ t('scanner.dims.add') }}
                      </button>
                      <span class="total">{{ t('scanner.dims.total', { total: total() }) }}</span>
                    </div>
                  </div>

                  @if (errorKey(); as key) {
                    <p class="msg msg--error">{{ t(key) }}</p>
                  } @else if (errorText()) {
                    <p class="msg msg--error">{{ errorText() }}</p>
                  }
                  @if (saved()) { <p class="msg msg--ok">{{ t('scanner.saved') }}</p> }

                  <div class="actions">
                    <button class="btn btn--primary" (click)="save(r)" [disabled]="busy()">
                      @if (busy()) {
                        @if (uploaded(); as u) {
                          {{ t('scanner.uploading', { done: u.done, total: u.total }) }}
                        } @else {
                          {{ t('scanner.saving') }}
                        }
                      } @else {
                        {{ t('scanner.save') }}
                      }
                    </button>
                    <a class="btn btn--ghost" [routerLink]="['/propiedad', r.property_id]">
                      {{ t('scanner.viewProperty') }}
                    </a>
                  </div>
                </div>
              }
            </article>
          }
        </div>
      }
    </main>
    </ng-container>
  `,
  styles: [`
    :host { display: block; min-height: 100dvh; }
    .wrap { max-width: 860px; margin: 0 auto; padding: var(--space-2xl) var(--space-lg) var(--space-4xl); }
    h1 { font-size: var(--text-3xl); margin-bottom: 6px; }
    .lead { color: var(--ink-2); font-size: var(--text-base); margin: 0 0 var(--space-lg); }
    .state { padding: var(--space-4xl) var(--space-lg); text-align: center; color: var(--ink-3); }
    .state__title { font-weight: 500; color: var(--ink); margin: 0 0 6px; }

    .list { display: grid; gap: var(--space-md); }
    .req { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out); }
    .req:hover { box-shadow: var(--shadow); }
    .req--open { border-color: var(--line-2); }
    .req__head { display: flex; justify-content: space-between; align-items: center; gap: var(--space-md); padding: var(--space-md) var(--space-lg); cursor: pointer; }
    .exp { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--accent); margin: 0 0 4px; letter-spacing: .06em; text-transform: uppercase; }
    .addr { margin: 0; font-size: var(--text-base); font-weight: 500; color: var(--ink); }
    .when { margin: 6px 0 0; font-family: var(--font-mono); font-size: var(--text-xs); color: var(--ink-2); }
    .when--none { color: var(--ink-3); }
    .status { font-family: var(--font-mono); font-size: 11px; letter-spacing: .04em; text-transform: uppercase; padding: 4px 10px; border-radius: var(--radius-pill); background: var(--surface-2); color: var(--ink-2); white-space: nowrap; }
    .status[data-s="completado"] { background: var(--ok-050); color: var(--ok); }
    .status[data-s="agendado"] { background: var(--accent-050); color: var(--accent); }

    .req__body { padding: 4px var(--space-lg) var(--space-lg); border-top: 1px solid var(--line); }

    /* Cliente a visitar + ubicación en el mapa */
    .visit { display: flex; flex-direction: column; gap: var(--space-lg); margin: var(--space-md) 0 var(--space-lg); }
    .visit__client { display: flex; flex-direction: column; gap: 4px; }
    .visit__name { margin: 6px 0 8px; font-weight: 500; font-size: var(--text-base); color: var(--ink); }
    .visit__row { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--ink-2); }
    .visit__row:hover { color: var(--accent); }
    .visit__map { display: flex; flex-direction: column; gap: var(--space-sm); }
    .visit__addr { margin: 0; font-size: var(--text-sm); color: var(--ink-2); }
    /* Mismo formato que el visor de fotos/recorrido 3D de la ficha (16/9, ancho completo). */
    .map-box { position: relative; aspect-ratio: 16 / 9; border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; }
    .map-box--big { aspect-ratio: auto; height: 75vh; }
    .map-box__btn {
      position: absolute; top: 10px; left: 10px; z-index: 2;
      font: inherit; font-size: var(--text-sm); font-weight: 500; cursor: pointer;
      color: var(--ink); background: color-mix(in oklch, var(--surface) 92%, transparent);
      backdrop-filter: blur(6px); border: 1px solid var(--line-2);
      border-radius: var(--radius); padding: 7px 12px;
    }
    .map-box__btn:hover { border-color: var(--ink-3); }

    /* Recorridos 3D: los dos primeros a ancho completo (= mapa); el resto, 2 por fila */
    .tours { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-md); }
    .tour { position: relative; margin: 0; grid-column: span 1; aspect-ratio: 16 / 9;
      border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; background: var(--surface-2); }
    .tour:nth-child(1), .tour:nth-child(2) { grid-column: 1 / -1; }
    .tour__frame { width: 100%; height: 100%; border: 0; display: block; }
    .tour__del { position: absolute; top: 8px; right: 8px; z-index: 2;
      width: 28px; height: 28px; display: grid; place-items: center; cursor: pointer;
      font-size: 18px; line-height: 1; color: var(--accent-ink); background: var(--overlay);
      border: 0; border-radius: var(--radius); }
    .tour__del:hover { background: var(--danger); }
    .tour-add { display: flex; gap: var(--space-sm); align-items: center; }
    .tour-add .input { flex: 1; }
    @media (max-width: 640px) { .tours { grid-template-columns: 1fr; } }

    .field { margin: var(--space-md) 0; }
    .field label { display: block; margin-bottom: 6px; font-size: var(--text-sm); font-weight: 500; color: var(--ink-2); }
    .note { display: block; margin-top: 5px; font-size: var(--text-xs); color: var(--ink-3); }
    .mono { font-family: var(--font-mono); }

    .dims { margin-top: var(--space-lg); }
    .dims__head, .dims__row { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr 32px; gap: var(--space-sm); align-items: center; }
    .dims__head { font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: .04em; text-transform: uppercase; color: var(--ink-3); margin-bottom: var(--space-sm); }
    .dims__row { margin-bottom: var(--space-sm); }
    .dims__row .input { padding: 8px 10px; }
    .del { border: 0; background: none; color: var(--ink-3); font-size: 20px; cursor: pointer; line-height: 1; }
    .del:hover { color: var(--danger); }
    .dims__foot { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-md); }
    .total { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--ink); }

    .msg { margin-top: var(--space-md); padding: 10px 12px; border-radius: var(--radius); font-size: var(--text-sm); }
    .msg--error { background: var(--danger-050); color: var(--danger); }
    .msg--ok { background: var(--ok-050); color: var(--ok); }
    .actions { display: flex; gap: var(--space-sm); margin-top: var(--space-lg); flex-wrap: wrap; }
    .actions .btn { text-decoration: none; }

    @media (max-width: 720px) {
      .dims__head { display: none; }
      .dims__row { grid-template-columns: 1fr 1fr; }
    }
  `],
})
export class ScannerDashboardComponent implements OnInit {
  private readonly svc = inject(ScanService);
  private readonly props = inject(PropertyService);
  readonly auth = inject(AuthService);

  private readonly picker = viewChild(PhotoPickerComponent);

  readonly requests = signal<ScanRequestFull[]>([]);
  readonly loading = signal(true);
  readonly openId = signal<string | null>(null);
  readonly dims = signal<DimensionInput[]>([]);
  readonly photos = signal<PropertyMedia[]>([]);
  readonly uploaded = signal<{ done: number; total: number } | null>(null);
  readonly busy = signal(false);
  readonly saved = signal(false);
  /** Mapa de ubicación ampliado (solo hay una visita abierta a la vez). */
  readonly mapBig = signal(false);

  // Claves de traducción; el texto crudo solo para errores de Supabase sin clave.
  readonly errorKey = signal<string | null>(null);
  readonly errorText = signal<string | null>(null);

  /** Recorridos 3D guardados/añadidos de la propiedad. */
  readonly tours = signal<{ id?: string; embed_url: string }[]>([]);
  /** URL del recorrido que se está por añadir. */
  newTour = '';

  /** Hosts permitidos para el recorrido 3D (espejo de la validación RLS/allowlist). */
  private readonly TOUR_HOST = /^https:\/\/([\w-]+\.)*(matterport\.com|kuula\.co|poly\.cam)\//;

  statusKey(s: ScanStatus): string {
    return scanStatusKey(s);
  }

  /** Añade la URL escrita a la lista de recorridos (validando el host). */
  addTour(): void {
    const url = this.newTour.trim();
    if (!url) return;
    if (!this.TOUR_HOST.test(url)) {
      this.errorKey.set('scanner.errors.tourHost');
      return;
    }
    this.clearError();
    this.tours.update((rows) => [...rows, { embed_url: url }]);
    this.newTour = '';
  }

  removeTour(i: number): void {
    this.tours.update((rows) => rows.filter((_, idx) => idx !== i));
  }

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  addr(r: ScanRequestFull): string {
    return buildAddress(r.properties);
  }

  /** Fecha + hora de la visita en el idioma activo. */
  when(iso: string | null): string {
    return formatDateTime(iso);
  }

  /**
   * Array estable de una sola propiedad para el mapa. Evita crear un array nuevo
   * en cada ciclo de detección de cambios, que re-renderizaría los marcadores.
   */
  private readonly mapCache = new Map<string, Property[]>();
  mapProps(r: ScanRequestFull): Property[] {
    const cached = this.mapCache.get(r.id);
    if (cached && cached[0] === r.properties) return cached;
    const arr = [r.properties];
    this.mapCache.set(r.id, arr);
    return arr;
  }

  total(): string {
    const t = this.dims().reduce((sum, d) => sum + (Number(d.area) || 0), 0);
    return t.toFixed(2);
  }

  /** Abre una solicitud y carga lo ya registrado. */
  async toggle(r: ScanRequestFull): Promise<void> {
    this.clearError();
    this.saved.set(false);

    if (this.openId() === r.id) {
      this.openId.set(null);
      return;
    }
    this.openId.set(r.id);
    this.mapBig.set(false);
    this.newTour = '';
    this.tours.set([]);
    this.photos.set([]);

    // Recorridos 3D ya guardados (se muestran embebidos).
    this.tours.set(
      (await this.svc.listTours(r.property_id)).map((m) => ({ id: m.id, embed_url: m.embed_url ?? '' })),
    );
    this.photos.set(await this.props.listPhotos(r.property_id));

    const existing = await this.svc.listDimensions(r.property_id);
    this.dims.set(
      existing.length
        ? existing.map((d) => ({
            room_name: d.room_name,
            width: d.width,
            length: d.length,
            area: d.area,
            unit: d.unit,
          }))
        : [this.emptyRow()],
    );
  }

  addRow(): void {
    this.dims.update((rows) => [...rows, this.emptyRow()]);
  }

  removeRow(i: number): void {
    this.dims.update((rows) => rows.filter((_, idx) => idx !== i));
  }

  /** Al escribir ancho y largo, calcula la superficie. */
  recalc(d: DimensionInput): void {
    const w = Number(d.width);
    const l = Number(d.length);
    if (w > 0 && l > 0) d.area = Number((w * l).toFixed(2));
  }

  /** Borra una foto ya guardada (fila + archivo del bucket). */
  async deletePhoto(m: PropertyMedia): Promise<void> {
    this.clearError();
    try {
      await this.props.deletePhoto(m);
      this.photos.update((rows) => rows.filter((p) => p.id !== m.id));
    } catch {
      this.errorKey.set('scanner.errors.deletePhoto');
    }
  }

  async save(r: ScanRequestFull): Promise<void> {
    this.busy.set(true);
    this.clearError();
    this.saved.set(false);
    try {
      // Todos los recorridos (los guardados/añadidos + el que quede en el campo).
      const urls = [...this.tours().map((t) => t.embed_url), this.newTour]
        .map((u) => u.trim())
        .filter(Boolean);
      if (urls.some((u) => !this.TOUR_HOST.test(u))) {
        this.errorKey.set('scanner.errors.tourHost');
        return;
      }
      await this.svc.saveTours(r.property_id, urls);

      // Las nuevas fotos van detrás de las que ya estaban.
      const files = this.picker()?.files() ?? [];
      if (files.length) {
        const startOrder = this.photos().reduce((max, p) => Math.max(max, p.sort_order + 1), 0);
        this.uploaded.set({ done: 0, total: files.length });
        await this.props.uploadPhotos(r.property_id, files, {
          startOrder,
          onProgress: (done, total) => this.uploaded.set({ done, total }),
        });
        this.picker()?.clear();
        this.photos.set(await this.props.listPhotos(r.property_id));
      }

      await this.svc.saveDimensions(r.property_id, this.dims());
      await this.svc.updateStatus(r.id, 'completado');

      this.saved.set(true);
      await this.load();
    } catch (e) {
      const raw = errorMessage(e, '');
      this.errorKey.set(raw ? null : 'scanner.errors.save');
      this.errorText.set(raw || null);
    } finally {
      this.uploaded.set(null);
      this.busy.set(false);
    }
  }

  private clearError(): void {
    this.errorKey.set(null);
    this.errorText.set(null);
  }

  private emptyRow(): DimensionInput {
    return { room_name: '', width: null, length: null, area: null, unit: 'm' };
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      // Agenda: visitas ordenadas por fecha (las agendadas primero, sin fecha al final).
      const rows = await this.svc.listRequests();
      rows.sort((a, b) => {
        if (!a.scheduled_at && !b.scheduled_at) return 0;
        if (!a.scheduled_at) return 1;
        if (!b.scheduled_at) return -1;
        return a.scheduled_at.localeCompare(b.scheduled_at);
      });
      this.requests.set(rows);
    } catch {
      this.requests.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
