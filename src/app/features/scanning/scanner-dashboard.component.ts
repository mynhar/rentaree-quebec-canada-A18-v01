import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ScanService, ScanRequestFull, DimensionInput } from './scan.service';
import { PropertyService } from '../properties/property.service';
import { PhotoPickerComponent } from '../properties/shared/photo-picker.component';
import { PropertyMedia, ScanStatus } from '../../core/models/database.types';
import { buildAddress } from '../../core/util/format';
import { errorMessage } from '../../core/util/errors';
import { TranslocoDirective } from '@jsverse/transloco';

/** Clave de traducción del estado de una solicitud de escaneo. */
export function scanStatusKey(status: ScanStatus): string {
  return `scan.status.${status}`;
}

@Component({
  selector: 'app-scanner-dashboard',
  standalone: true,
  imports: [FormsModule, RouterLink, PhotoPickerComponent, TranslocoDirective],
  template: `
    <ng-container *transloco="let t">
    <header class="bar">
      <a routerLink="/quebec-city" class="back">{{ t('nav.backToProperties') }}</a>
      <span class="title">{{ t('scanner.title') }}</span>
      <span class="mark">Rentaree<span class="mark__tick" aria-hidden="true"></span></span>
    </header>

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
                </div>
                <span class="status" [attr.data-s]="r.status">{{ t(statusKey(r.status)) }}</span>
              </div>

              @if (openId() === r.id) {
                <div class="req__body">
                  <!-- Recorrido 3D -->
                  <div class="field">
                    <label [for]="'tour-' + r.id">{{ t('scanner.tour.label') }}</label>
                    <input [id]="'tour-' + r.id" class="input mono" type="url"
                      placeholder="https://my.matterport.com/show/?m=XXXXXXXX"
                      [(ngModel)]="tourUrl" />
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
    .bar { display: flex; align-items: center; gap: 16px; padding: 12px 20px; border-bottom: 1px solid var(--line); background: var(--surface); }
    .back { font-size: 14px; color: var(--ink-2); }
    .title { font-size: 14px; font-weight: 500; }
    .mark { margin-left: auto; font-family: var(--font-display); font-weight: 600; font-size: 18px; display: inline-flex; align-items: center; gap: 5px; }
    .mark__tick { width: 15px; height: 8px; border-left: 1px solid var(--ink-3); border-right: 1px solid var(--ink-3); border-bottom: 1px solid var(--ink-3); }

    .wrap { max-width: 860px; margin: 0 auto; padding: 32px 24px 80px; }
    h1 { font-size: 26px; margin-bottom: 6px; }
    .lead { color: var(--ink-2); font-size: 15px; margin: 0 0 24px; }
    .state { padding: 72px 24px; text-align: center; color: var(--ink-3); }
    .state__title { font-weight: 500; color: var(--ink); margin: 0 0 6px; }

    .list { display: grid; gap: 12px; }
    .req { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; }
    .req--open { border-color: var(--line-2); }
    .req__head { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 16px 18px; cursor: pointer; }
    .exp { font-family: var(--font-mono); font-size: 12px; color: var(--accent); margin: 0 0 4px; }
    .addr { margin: 0; font-size: 14.5px; font-weight: 500; }
    .status { font-size: 12px; padding: 4px 10px; border-radius: 100px; background: var(--surface-2); color: var(--ink-2); white-space: nowrap; }
    .status[data-s="completado"] { background: #E9F3EE; color: var(--ok); }
    .status[data-s="agendado"] { background: var(--accent-050); color: var(--accent); }

    .req__body { padding: 4px 18px 18px; border-top: 1px solid var(--line); }
    .field { margin: 16px 0; }
    .field label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: var(--ink-2); }
    .note { display: block; margin-top: 5px; font-size: 12px; color: var(--ink-3); }
    .mono { font-family: var(--font-mono); }

    .dims { margin-top: 20px; }
    .dims__head, .dims__row { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr 32px; gap: 8px; align-items: center; }
    .dims__head { font-size: 12px; color: var(--ink-3); margin-bottom: 8px; }
    .dims__row { margin-bottom: 8px; }
    .dims__row .input { padding: 8px 10px; }
    .del { border: 0; background: none; color: var(--ink-3); font-size: 20px; cursor: pointer; line-height: 1; }
    .del:hover { color: var(--danger); }
    .dims__foot { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
    .total { font-family: var(--font-mono); font-size: 13px; color: var(--ink-2); }

    .msg { margin-top: 16px; padding: 10px 12px; border-radius: var(--radius); font-size: 13.5px; }
    .msg--error { background: var(--danger-050); color: var(--danger); }
    .msg--ok { background: #E9F3EE; color: var(--ok); }
    .actions { display: flex; gap: 10px; margin-top: 20px; }
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

  // Claves de traducción; el texto crudo solo para errores de Supabase sin clave.
  readonly errorKey = signal<string | null>(null);
  readonly errorText = signal<string | null>(null);

  tourUrl = '';

  statusKey(s: ScanStatus): string {
    return scanStatusKey(s);
  }

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  addr(r: ScanRequestFull): string {
    return buildAddress(r.properties);
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
    this.tourUrl = '';
    this.photos.set([]);

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
      const url = this.tourUrl.trim();
      if (url) {
        if (!/^https:\/\/([\w-]+\.)*(matterport\.com|kuula\.co|poly\.cam)\//.test(url)) {
          this.errorKey.set('scanner.errors.tourHost');
          return;
        }
        await this.svc.saveTour(r.property_id, url);
      }

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
      this.requests.set(await this.svc.listRequests());
    } catch {
      this.requests.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
