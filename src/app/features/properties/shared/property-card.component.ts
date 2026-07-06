import { Component, computed, inject, input } from '@angular/core';
import { PropertyCard, PropertyService } from '../property.service';
import { PROPERTY_TYPES } from '../../../core/config/constants';
import { buildAddress, formatCAD } from '../../../core/util/format';

@Component({
  selector: 'app-property-card',
  standalone: true,
  template: `
    <article class="card" [class.card--sel]="selected()">
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
        <span class="price">{{ price() }}<span>/mois</span></span>
      </div>
      <div class="body">
        <div class="row1">
          <span class="type">{{ typeLabel() }}</span>
          @if (property().area != null) {
            <span class="area">{{ property().area }} {{ property().area_unit }}</span>
          }
        </div>
        <p class="addr">{{ address() }}</p>
        <div class="meta">
          @if (property().bedrooms != null) { <span>{{ property().bedrooms }} ch.</span> }
          @if (property().bathrooms != null) { <span>{{ property().bathrooms }} sdb.</span> }
          @if (property().neighbourhood) { <span>{{ property().neighbourhood }}</span> }
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
  `],
})
export class PropertyCardComponent {
  private readonly svc = inject(PropertyService);

  readonly property = input.required<PropertyCard>();
  readonly selected = input<boolean>(false);

  readonly photo = computed(() => {
    const media = (this.property().property_media ?? [])
      .filter((m) => m.media_type === 'photo')
      .sort((a, b) => a.sort_order - b.sort_order);
    return media.length ? this.svc.photoUrl(media[0].storage_path) : null;
  });

  readonly price = computed(() => formatCAD(this.property().price));
  readonly address = computed(() => buildAddress(this.property()));
  readonly typeLabel = computed(
    () => PROPERTY_TYPES.find((t) => t.value === this.property().property_type)?.label ?? '',
  );
}
