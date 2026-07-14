import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/auth.service';
import { PropertyCard, PropertyService, canEditProperty } from '../property.service';
import { propertyTypeKey } from '../../../core/config/constants';
import { buildAddress, formatCAD } from '../../../core/util/format';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [RouterLink, TranslocoDirective],
  template: `
    <article class="card" [class.card--sel]="selected()" *transloco="let t">
      <div class="thumb">
        @if (photo()) {
          <img [src]="photo()" alt="" loading="lazy" />
        } @else {
          <svg viewBox="0 0 120 90" fill="none" aria-hidden="true" class="thumb__plan">
            <rect x="12" y="12" width="96" height="66" stroke="#B4B7B1" stroke-width="1.5"/>
            <line x1="66" y1="12" x2="66" y2="48" stroke="#B4B7B1" stroke-width="1.5"/>
            <line x1="66" y1="48" x2="108" y2="48" stroke="#B4B7B1" stroke-width="1.5"/>
          </svg>
        }
        <span class="price">{{ price() }}<span>{{ t('property.perMonth') }}</span></span>
      </div>
      <div class="body">
        <div class="row1">
          <span class="type">{{ t(typeKey()) }}</span>
          @if (property().area != null) {
            <span class="area">{{ property().area }} {{ property().area_unit }}</span>
          }
        </div>
        <p class="addr">{{ address() }}</p>
        <div class="meta">
          @if (property().bedrooms != null) {
            <span>{{ property().bedrooms }} {{ t('property.card.bedroomsShort') }}</span>
          }
          @if (property().bathrooms != null) {
            <span>{{ property().bathrooms }} {{ t('property.card.bathroomsShort') }}</span>
          }
          @if (property().neighbourhood) { <span>{{ property().neighbourhood }}</span> }
        </div>
        <div class="links">
          <a class="see" [routerLink]="['/propiedad', property().id]" (click)="$event.stopPropagation()">
            {{ t('property.card.see') }}
          </a>
          @if (canEdit()) {
            <a class="see see--edit" [routerLink]="['/propiedad', property().id, 'editar']"
              (click)="$event.stopPropagation()">
              {{ t('property.card.edit') }}
            </a>
          }
        </div>
      </div>
    </article>
  `,
  styles: [`
    .card {
      display: grid;
      grid-template-columns: 116px 1fr;
      gap: 14px;
      padding: 10px;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: border-color .15s ease, box-shadow .15s ease;
    }
    .card:hover { border-color: var(--line-2); }
    .card--sel { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-050); }

    .thumb {
      position: relative;
      aspect-ratio: 4 / 3;
      background: var(--surface-2);
      border-radius: 8px;
      overflow: hidden;
      display: flex; align-items: center; justify-content: center;
    }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb__plan { width: 70%; }
    .price {
      position: absolute; left: 6px; bottom: 6px;
      font-family: var(--font-mono); font-size: 12px; font-weight: 700;
      color: var(--ink); background: rgba(255,255,255,.92);
      padding: 3px 7px; border-radius: 6px;
    }
    .price span { font-weight: 400; color: var(--ink-3); font-size: 10px; }

    .body { min-width: 0; padding: 2px 4px 2px 0; }
    .row1 { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
    .type { font-weight: 500; font-size: 14px; }
    .area { font-family: var(--font-mono); font-size: 12px; color: var(--ink-3); }
    .addr {
      margin: 4px 0 8px; font-size: 13px; color: var(--ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .meta { display: flex; flex-wrap: wrap; gap: 6px 12px; font-size: 12.5px; color: var(--ink-3); }
    .links { display: flex; gap: 14px; }
    .see { display: inline-block; margin-top: 8px; font-size: 13px; font-weight: 500; color: var(--accent); }
    .see--edit { color: var(--ink-2); }
    .see--edit:hover { color: var(--ink); }
  `],
})
export class PropertyCardComponent {
  private readonly svc = inject(PropertyService);
  private readonly auth = inject(AuthService);

  readonly property = input.required<PropertyCard>();
  readonly selected = input<boolean>(false);

  /** Espejo de la política RLS: solo decide si se ve el enlace de editar. */
  readonly canEdit = computed(() =>
    canEditProperty(this.property(), this.auth.session()?.user?.id ?? null, this.auth.role()),
  );

  readonly photo = computed(() => {
    const media = (this.property().property_media ?? [])
      .filter((m) => m.media_type === 'photo')
      .sort((a, b) => a.sort_order - b.sort_order);
    return media.length ? this.svc.photoUrl(media[0].storage_path) : null;
  });

  readonly price = computed(() => formatCAD(this.property().price));
  readonly address = computed(() => buildAddress(this.property()));
  /** Clave, no texto: traducirlo aquí lo congelaría en el idioma actual. */
  readonly typeKey = computed(() => propertyTypeKey(this.property().property_type));
}
