import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/auth.service';
import { PropertyService, PropertyDetail, canEditProperty } from '../property.service';
import { SafeTourUrlPipe } from '../../../core/util/safe-url.pipe';
import { propertyTypeKey } from '../../../core/config/constants';
import { buildAddress, formatCAD } from '../../../core/util/format';

type Tab = 'fotos' | 'tour' | 'plano';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [RouterLink, SafeTourUrlPipe, TranslocoDirective],
  template: `
    <ng-container *transloco="let tr">
    <header class="bar">
      <a routerLink="/quebec-city" class="back">{{ tr('common.back') }}</a>
      <span class="mark">Rentaree<span class="mark__tick" aria-hidden="true"></span></span>
    </header>

    @if (loading()) {
      <p class="state">{{ tr('property.detail.loading') }}</p>
    } @else if (!property()) {
      <div class="state">
        <p class="state__title">{{ tr('property.detail.notFoundTitle') }}</p>
        <a routerLink="/quebec-city">{{ tr('property.detail.notFoundBack') }}</a>
      </div>
    } @else {
      @let p = property()!;

      <main class="wrap">
        <!-- Encabezado -->
        <section class="head">
          <div>
            <p class="exp">{{ p.expediente }}</p>
            <h1>{{ p.title || tr(typeKey()) }}</h1>
            <p class="addr">{{ address() }}@if (p.neighbourhood) { · {{ p.neighbourhood }} }</p>
          </div>
          <div class="price">
            <span class="price__v">{{ price() }}</span>
            <span class="price__u">{{ tr('property.perMonth') }}</span>
            @if (canEdit()) {
              <a class="btn btn--ghost edit" [routerLink]="['/propiedad', p.id, 'editar']">
                {{ tr('property.detail.edit') }}
              </a>
            }
          </div>
        </section>

        <!-- Datos rápidos -->
        <section class="facts">
          <div class="fact">
            <span class="fact__k">{{ tr('property.detail.facts.type') }}</span>
            <span class="fact__v">{{ tr(typeKey()) }}</span>
          </div>
          <div class="fact">
            <span class="fact__k">{{ tr('property.detail.facts.area') }}</span>
            <span class="fact__v">{{ p.area != null ? p.area + ' ' + p.area_unit : '—' }}</span>
          </div>
          <div class="fact">
            <span class="fact__k">{{ tr('property.detail.facts.bedrooms') }}</span>
            <span class="fact__v">{{ p.bedrooms ?? '—' }}</span>
          </div>
          <div class="fact">
            <span class="fact__k">{{ tr('property.detail.facts.bathrooms') }}</span>
            <span class="fact__v">{{ p.bathrooms ?? '—' }}</span>
          </div>
        </section>

        <!-- Visor: fotos / recorrido 3D / plano -->
        <section class="viewer">
          <div class="seg">
            <button [class.on]="tab() === 'fotos'" (click)="tab.set('fotos')"
              [disabled]="photos().length === 0">
              {{ tr('property.detail.tabs.photos') }}
              @if (photos().length) { <span class="n">{{ photos().length }}</span> }
            </button>
            <button [class.on]="tab() === 'tour'" (click)="tab.set('tour')" [disabled]="!tourUrl()">
              {{ tr('property.detail.tabs.tour') }}
            </button>
            <button [class.on]="tab() === 'plano'" (click)="tab.set('plano')" [disabled]="!planUrl()">
              {{ tr('property.detail.tabs.plan') }}
            </button>
          </div>

          <div class="stage">
            @switch (tab()) {
              @case ('tour') {
                @if (tourUrl(); as tour) {
                  <iframe [src]="tour | safeTourUrl" [title]="tr('property.detail.tourTitle')"
                    allow="xr-spatial-tracking; fullscreen" allowfullscreen loading="lazy"></iframe>
                }
              }
              @case ('plano') {
                @if (planUrl(); as pl) {
                  <img [src]="pl" [alt]="tr('property.detail.planAlt')" class="plan" />
                }
              }
              @default {
                @if (photos().length) {
                  <img [src]="photos()[photoIndex()]" [alt]="tr('property.detail.photoAlt')" class="photo" />
                  @if (photos().length > 1) {
                    <button class="nav nav--prev" (click)="prevPhoto()"
                      [attr.aria-label]="tr('property.detail.prevPhoto')">‹</button>
                    <button class="nav nav--next" (click)="nextPhoto()"
                      [attr.aria-label]="tr('property.detail.nextPhoto')">›</button>
                    <span class="counter">{{ photoIndex() + 1 }} / {{ photos().length }}</span>
                  }
                } @else {
                  <div class="empty">
                    <svg viewBox="0 0 200 140" fill="none" aria-hidden="true">
                      <rect x="20" y="20" width="160" height="100" stroke="#C4C7C1" stroke-width="1.5"/>
                      <line x1="110" y1="20" x2="110" y2="74" stroke="#C4C7C1" stroke-width="1.5"/>
                      <line x1="110" y1="74" x2="180" y2="74" stroke="#C4C7C1" stroke-width="1.5"/>
                    </svg>
                    <p>{{ tr('property.detail.noScan') }}</p>
                  </div>
                }
              }
            }
          </div>
        </section>

        <div class="cols">
          <div>
            <!-- Dimensiones (del escaneo 3D) -->
            <section class="block">
              <div class="block__head">
                <h2>{{ tr('property.detail.dimensions.title') }}</h2>
                <p>{{ tr('property.detail.dimensions.lead') }}</p>
              </div>
              @if (p.property_dimensions.length) {
                <table class="dims">
                  <thead>
                    <tr>
                      <th>{{ tr('property.detail.dimensions.room') }}</th>
                      <th>{{ tr('property.detail.dimensions.width') }}</th>
                      <th>{{ tr('property.detail.dimensions.length') }}</th>
                      <th>{{ tr('property.detail.dimensions.area') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (d of p.property_dimensions; track d.id) {
                      <tr>
                        <td class="room">{{ d.room_name }}</td>
                        <td>{{ d.width != null ? d.width + ' ' + d.unit : '—' }}</td>
                        <td>{{ d.length != null ? d.length + ' ' + d.unit : '—' }}</td>
                        <td>{{ d.area != null ? d.area + ' ' + d.unit + '²' : '—' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <p class="muted">{{ tr('property.detail.dimensions.empty') }}</p>
              }
            </section>

            @if (p.description) {
              <section class="block">
                <div class="block__head"><h2>{{ tr('property.detail.description') }}</h2></div>
                <p class="desc">{{ p.description }}</p>
              </section>
            }
          </div>

          <!-- Contacto -->
          <aside class="contact">
            <p class="contact__k">{{ tr('property.detail.contact.title') }}</p>
            <p class="contact__name">{{ p.contact_first_name }} {{ p.contact_last_name }}</p>
            <a class="btn btn--primary btn--block" [href]="'tel:' + p.contact_phone">
              {{ p.contact_phone }}
            </a>
            <a class="btn btn--ghost btn--block" [href]="'mailto:' + p.contact_email">
              {{ tr('property.detail.contact.email') }}
            </a>
            <p class="contact__note">
              {{ tr('property.detail.contact.note', { expediente: p.expediente }) }}
            </p>
          </aside>
        </div>
      </main>
    }
    </ng-container>
  `,
  styles: [`
    :host { display: block; min-height: 100dvh; }
    .bar { display: flex; align-items: center; gap: 16px; padding: 12px 20px; border-bottom: 1px solid var(--line); background: var(--surface); }
    .back { font-size: 14px; color: var(--ink-2); }
    .mark { margin-left: auto; font-family: var(--font-display); font-weight: 600; font-size: 18px; display: inline-flex; align-items: center; gap: 5px; }
    .mark__tick { width: 15px; height: 8px; border-left: 1px solid var(--ink-3); border-right: 1px solid var(--ink-3); border-bottom: 1px solid var(--ink-3); }

    .state { padding: 80px 24px; text-align: center; color: var(--ink-3); }
    .state__title { font-weight: 500; color: var(--ink); margin: 0 0 8px; }

    .wrap { max-width: 980px; margin: 0 auto; padding: 32px 24px 80px; }

    .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
    .exp { font-family: var(--font-mono); font-size: 12px; color: var(--accent); margin: 0 0 8px; letter-spacing: .02em; }
    h1 { font-size: 28px; margin: 0; }
    .addr { color: var(--ink-2); font-size: 14.5px; margin: 6px 0 0; }
    .price { text-align: right; white-space: nowrap; }
    .price__v { font-family: var(--font-mono); font-size: 24px; font-weight: 700; }
    .price__u { color: var(--ink-3); font-size: 13px; }
    .edit { display: flex; margin-top: 10px; padding: 7px 14px; font-size: 13.5px; }

    .facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; margin: 24px 0; }
    .fact { background: var(--surface); padding: 14px 16px; display: flex; flex-direction: column; gap: 3px; }
    .fact__k { font-size: 12px; color: var(--ink-3); }
    .fact__v { font-family: var(--font-mono); font-size: 14.5px; }

    .seg { display: inline-flex; background: var(--surface-2); border-radius: var(--radius); padding: 3px; margin-bottom: 12px; }
    .seg button { border: 0; background: transparent; cursor: pointer; padding: 7px 15px; border-radius: 7px; font: inherit; font-size: 13.5px; font-weight: 500; color: var(--ink-2); display: inline-flex; align-items: center; gap: 6px; }
    .seg button.on { background: var(--surface); color: var(--ink); box-shadow: var(--shadow); }
    .seg button:disabled { opacity: .45; cursor: not-allowed; }
    .n { font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); }

    .stage { position: relative; aspect-ratio: 16 / 9; background: var(--surface-2); border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; display: flex; align-items: center; justify-content: center; }
    .stage iframe { width: 100%; height: 100%; border: 0; }
    .photo, .plan { width: 100%; height: 100%; object-fit: cover; }
    .plan { object-fit: contain; background: var(--surface); }
    .empty { text-align: center; color: var(--ink-3); }
    .empty svg { width: 160px; margin-bottom: 8px; }
    .empty p { margin: 0; font-size: 14px; }

    .nav { position: absolute; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--line-2); background: rgba(255,255,255,.92); font-size: 20px; line-height: 1; color: var(--ink); cursor: pointer; }
    .nav--prev { left: 12px; } .nav--next { right: 12px; }
    .counter { position: absolute; right: 12px; bottom: 12px; font-family: var(--font-mono); font-size: 11.5px; background: rgba(255,255,255,.92); padding: 3px 8px; border-radius: 100px; }

    .cols { display: grid; grid-template-columns: 1fr 280px; gap: 32px; margin-top: 32px; align-items: start; }

    .block { border-top: 1px solid var(--line); padding-top: 20px; margin-bottom: 28px; }
    .block__head { margin-bottom: 14px; }
    .block__head h2 { font-size: 17px; }
    .block__head p { margin: 4px 0 0; font-size: 13px; color: var(--ink-3); }
    .muted { color: var(--ink-3); font-size: 14px; margin: 0; }
    .desc { color: var(--ink-2); font-size: 14.5px; line-height: 1.6; margin: 0; white-space: pre-line; }

    .dims { width: 100%; border-collapse: collapse; }
    .dims th { text-align: left; font-size: 12px; font-weight: 500; color: var(--ink-3); padding: 0 0 8px; border-bottom: 1px solid var(--line); }
    .dims td { padding: 11px 0; border-bottom: 1px solid var(--line); font-family: var(--font-mono); font-size: 13px; color: var(--ink-2); }
    .dims .room { font-family: var(--font-body); font-size: 14px; color: var(--ink); font-weight: 500; }
    .dims tr:last-child td { border-bottom: 0; }

    .contact { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 20px; position: sticky; top: 20px; }
    .contact__k { font-size: 12px; color: var(--ink-3); margin: 0 0 4px; }
    .contact__name { font-weight: 500; font-size: 16px; margin: 0 0 14px; }
    .contact .btn { margin-bottom: 8px; text-decoration: none; }
    .contact__note { font-size: 12px; color: var(--ink-3); margin: 8px 0 0; line-height: 1.5; }

    @media (max-width: 820px) {
      .facts { grid-template-columns: repeat(2, 1fr); }
      .cols { grid-template-columns: 1fr; }
      .contact { position: static; }
      .head { flex-direction: column; }
      .price { text-align: left; }
    }
  `],
})
export class PropertyDetailComponent implements OnInit {
  private readonly svc = inject(PropertyService);
  private readonly auth = inject(AuthService);

  /** Viene de la ruta /propiedad/:id (withComponentInputBinding). */
  readonly id = input.required<string>();

  /** Espejo de la política RLS: solo decide si se ve el botón de editar. */
  readonly canEdit = computed(() =>
    canEditProperty(this.property(), this.auth.session()?.user?.id ?? null, this.auth.role()),
  );

  readonly property = signal<PropertyDetail | null>(null);
  readonly loading = signal(true);
  readonly tab = signal<Tab>('fotos');
  readonly photoIndex = signal(0);

  readonly photos = computed(() => {
    const p = this.property();
    if (!p) return [] as string[];
    return p.property_media
      .filter((m) => m.media_type === 'photo')
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((m) => this.svc.photoUrl(m.storage_path))
      .filter((u): u is string => !!u);
  });

  /** Recorrido 3D embebido (Matterport). */
  readonly tourUrl = computed(
    () => this.property()?.property_media.find((m) => m.media_type === 'tour_3d')?.embed_url ?? null,
  );

  readonly planUrl = computed(() => {
    const m = this.property()?.property_media.find((x) => x.media_type === 'floor_plan');
    return m ? this.svc.photoUrl(m.storage_path) : null;
  });

  readonly price = computed(() => formatCAD(this.property()?.price ?? null));
  readonly address = computed(() => {
    const p = this.property();
    return p ? buildAddress(p) : '';
  });
  /** Clave, no texto: se traduce en la plantilla para seguir al idioma activo. */
  readonly typeKey = computed(() => {
    const type = this.property()?.property_type;
    return type ? propertyTypeKey(type) : '';
  });

  async ngOnInit(): Promise<void> {
    try {
      const p = await this.svc.getById(this.id());
      this.property.set(p);
      // Abre en la pestaña más informativa disponible.
      if (p) {
        const hasPhoto = p.property_media.some((m) => m.media_type === 'photo');
        if (!hasPhoto && p.property_media.some((m) => m.media_type === 'tour_3d')) {
          this.tab.set('tour');
        }
      }
    } catch {
      this.property.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  nextPhoto(): void {
    this.photoIndex.update((i) => (i + 1) % this.photos().length);
  }
  prevPhoto(): void {
    this.photoIndex.update((i) => (i - 1 + this.photos().length) % this.photos().length);
  }
}
