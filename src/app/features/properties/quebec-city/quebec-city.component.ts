import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { PropertyService, PropertyCard } from '../property.service';
import { PropertyFilters, EMPTY_FILTERS } from '../property-filters';
import { PROPERTY_TYPES, DEFAULT_MAP_CENTER } from '../../../core/config/constants';
import { PropertyType } from '../../../core/models/database.types';
import { PropertyListComponent } from './property-list.component';
import { PropertyMapComponent } from './property-map.component';
import { TranslocoDirective } from '@jsverse/transloco';
import { AppHeaderComponent } from '../../../core/layout/app-header.component';

type ViewMode = 'tarjetas' | 'list' | 'map' | 'split';
type SortMode = 'relevantes' | 'recientes' | 'precio-asc' | 'precio-desc';

/** Distancia aproximada en km (haversine). Infinity si falta alguna coordenada. */
function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number | null,
  lng2: number | null,
): number {
  if (lat2 == null || lng2 == null) return Infinity;
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

@Component({
  selector: 'app-quebec-city',
  standalone: true,
  imports: [
    RouterLink,
    PropertyListComponent,
    PropertyMapComponent,
    TranslocoDirective,
    AppHeaderComponent,
  ],
  template: `
    <ng-container *transloco="let tr">
    <app-header />

    @if (auth.needsProfileCompletion()) {
      <div class="notice">
        {{ tr('property.notice.completePhone') }}
        <a routerLink="/completar-perfil">{{ tr('property.notice.completeNow') }}</a>
      </div>
    }

    <div class="toolbar">
      <div class="search">
        <input class="input" type="search" [placeholder]="tr('property.search.placeholder')"
          [value]="filters().text" (input)="onText($any($event.target).value)" />
      </div>

      <button class="chip-btn" [class.on]="filtersOpen()" (click)="filtersOpen.set(!filtersOpen())">
        {{ tr('property.filters.button') }}
        @if (activeFilterCount() > 0) { <span class="count">{{ activeFilterCount() }}</span> }
      </button>

      <label class="mine">
        <input type="checkbox" [checked]="filters().onlyMine" (change)="onMine($any($event.target).checked)" />
        {{ tr('property.filters.mine') }}
      </label>

      <span class="results">
        {{ loading() ? '…' : tr('property.results', { count: properties().length }) }}
      </span>

      <select class="input sort" [value]="sort()"
        (change)="sort.set($any($event.target).value)"
        [attr.aria-label]="tr('property.sort.label')">
        <option value="relevantes">{{ tr('property.sort.relevant') }}</option>
        <option value="recientes">{{ tr('property.sort.recent') }}</option>
        <option value="precio-asc">{{ tr('property.sort.priceAsc') }}</option>
        <option value="precio-desc">{{ tr('property.sort.priceDesc') }}</option>
      </select>

      <div class="seg">
        <button [class.on]="mode() === 'tarjetas'" (click)="mode.set('tarjetas')">{{ tr('property.view.cards') }}</button>
        <button [class.on]="mode() === 'list'" (click)="mode.set('list')">{{ tr('property.view.list') }}</button>
        <button [class.on]="mode() === 'map'" (click)="mode.set('map')">{{ tr('property.view.map') }}</button>
        <button [class.on]="mode() === 'split'" (click)="mode.set('split')">{{ tr('property.view.split') }}</button>
      </div>
    </div>

    @if (filtersOpen()) {
      <div class="filters">
        <div class="filters__group">
          <span class="filters__label">{{ tr('property.filters.type') }}</span>
          <div class="types">
            @for (type of types; track type.value) {
              <button class="type-chip" [class.on]="filters().types.includes(type.value)"
                (click)="toggleType(type.value)">{{ tr(type.labelKey) }}</button>
            }
          </div>
        </div>
        <div class="filters__group">
          <span class="filters__label">{{ tr('property.filters.price') }}</span>
          <div class="price">
            <input class="input" type="number" min="0" [placeholder]="tr('property.filters.min')"
              [value]="filters().priceMin ?? ''" (input)="onPrice('min', $any($event.target).value)" />
            <span>—</span>
            <input class="input" type="number" min="0" [placeholder]="tr('property.filters.max')"
              [value]="filters().priceMax ?? ''" (input)="onPrice('max', $any($event.target).value)" />
          </div>
        </div>
        <button class="clear" (click)="clearFilters()">{{ tr('property.filters.clear') }}</button>
      </div>
    }

    <div class="content" [class.content--map]="mode() === 'map'" [class.content--split]="mode() === 'split'">
      @if (mode() === 'tarjetas') {
        <div class="scroll">
          <app-property-list layout="grid" [properties]="sortedProperties()" [selectedId]="selectedId()"
            [loading]="loading()" (select)="onSelect($event)" />
        </div>
      } @else if (mode() === 'list') {
        <div class="scroll">
          <app-property-list [properties]="sortedProperties()" [selectedId]="selectedId()"
            [loading]="loading()" (select)="onSelect($event)" />
        </div>
      } @else if (mode() === 'map') {
        <app-property-map [properties]="sortedProperties()" [center]="center()"
          [selectedId]="selectedId()" (markerSelect)="onSelect($event)" />
      } @else {
        <div class="scroll">
          <app-property-list [properties]="sortedProperties()" [selectedId]="selectedId()"
            [loading]="loading()" (select)="onSelect($event)" />
        </div>
        <app-property-map [properties]="sortedProperties()" [center]="center()"
          [selectedId]="selectedId()" (markerSelect)="onSelect($event)" />
      }
    </div>
    </ng-container>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100dvh; }

    .notice { background: var(--warn-050); color: var(--warn); padding: 10px 20px; font-size: var(--text-sm); border-bottom: 1px solid var(--line); }
    .notice a { color: var(--warn); text-decoration: underline; margin-left: 4px; }

    .toolbar { display: flex; align-items: center; gap: 14px; padding: 10px 20px; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
    .search { flex: 1 1 220px; max-width: 420px; }
    .chip-btn { font: inherit; font-size: 13.5px; font-weight: 500; padding: 7px 13px; border: 1px solid var(--line-2); border-radius: 100px; background: var(--surface); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
    .chip-btn.on { border-color: var(--accent); color: var(--accent); }
    .count { background: var(--accent); color: var(--accent-ink); font-size: 11px; border-radius: 100px; padding: 1px 6px; }
    .mine { display: inline-flex; align-items: center; gap: 7px; font-size: 13.5px; color: var(--ink-2); cursor: pointer; }
    .results { font-family: var(--font-mono); font-size: 12.5px; color: var(--ink-3); }
    .sort { margin-left: auto; width: auto; padding: 7px 30px 7px 12px; font-size: 13.5px;
      appearance: none; cursor: pointer;
      background-image: linear-gradient(45deg, transparent 50%, var(--ink-3) 50%), linear-gradient(135deg, var(--ink-3) 50%, transparent 50%);
      background-position: calc(100% - 16px) 50%, calc(100% - 11px) 50%; background-size: 5px 5px, 5px 5px; background-repeat: no-repeat; }
    .seg { display: flex; background: var(--surface-2); border-radius: var(--radius); padding: 3px; }
    .seg button { border: 0; background: transparent; cursor: pointer; padding: 6px 14px; border-radius: 7px; font: inherit; font-size: 13.5px; font-weight: 500; color: var(--ink-2); }
    .seg button.on { background: var(--surface); color: var(--ink); box-shadow: var(--shadow); }

    .filters { display: flex; align-items: flex-end; gap: 28px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid var(--line); background: var(--surface-2); }
    .filters__label { display: block; font-size: 12px; font-weight: 500; color: var(--ink-2); margin-bottom: 8px; }
    .types { display: flex; flex-wrap: wrap; gap: 7px; }
    .type-chip { font: inherit; font-size: 13px; padding: 6px 12px; border: 1px solid var(--line-2); border-radius: 100px; background: var(--surface); color: var(--ink-2); cursor: pointer; }
    .type-chip.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
    .price { display: flex; align-items: center; gap: 8px; }
    .price .input { width: 96px; }
    .price span { color: var(--ink-3); }
    .clear { margin-left: auto; align-self: center; font: inherit; font-size: 13px; color: var(--ink-2); background: none; border: 0; cursor: pointer; text-decoration: underline; }

    .content { flex: 1; min-height: 0; }
    .content .scroll { height: 100%; overflow: auto; }
    .content--map { position: relative; }
    .content--split { display: grid; grid-template-columns: minmax(380px, 1fr) 1.2fr; }
    .content--split .scroll { border-right: 1px solid var(--line); }

    @media (max-width: 720px) {
      .user { display: none; }
      .content--split { grid-template-columns: 1fr; }
      .content--split app-property-map { display: none; }
    }
  `],
})
export class QuebecCityComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly svc = inject(PropertyService);

  readonly types = PROPERTY_TYPES;

  readonly mode = signal<ViewMode>('tarjetas');
  readonly filtersOpen = signal(false);
  readonly filters = signal<PropertyFilters>({ ...EMPTY_FILTERS });
  readonly properties = signal<PropertyCard[]>([]);
  readonly loading = signal(false);
  readonly selectedId = signal<string | null>(null);
  readonly center = signal<{ lat: number; lng: number }>(DEFAULT_MAP_CENTER);
  /** True cuando la geolocalización del usuario tuvo éxito (define "relevantes"). */
  readonly userLocated = signal(false);

  /** Orden del listado (la consulta llega por 'created_at' desc = recientes). */
  readonly sort = signal<SortMode>('relevantes');
  readonly sortedProperties = computed(() => {
    const rows = [...this.properties()]; // copia: Array.sort muta
    switch (this.sort()) {
      case 'recientes':
        return rows; // ya vienen por fecha desc
      case 'precio-asc':
        return rows.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
      case 'precio-desc':
        return rows.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
      case 'relevantes':
      default: {
        // Relevancia = cercanía al usuario (su zona/barrio). Sin geolocalización,
        // se queda como "más recientes" (el orden en que ya vienen).
        if (!this.userLocated()) return rows;
        const c = this.center();
        return rows.sort(
          (a, b) =>
            distanceKm(c.lat, c.lng, a.latitude, a.longitude) -
            distanceKm(c.lat, c.lng, b.latitude, b.longitude),
        );
      }
    }
  });

  private timer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    void this.load();
    this.locateUser();
  }

  activeFilterCount(): number {
    const f = this.filters();
    return f.types.length + (f.priceMin != null ? 1 : 0) + (f.priceMax != null ? 1 : 0);
  }

  // --- Cambios de filtro ---
  onText(text: string): void {
    this.filters.update((f) => ({ ...f, text }));
    this.schedule();
  }
  onMine(onlyMine: boolean): void {
    this.filters.update((f) => ({ ...f, onlyMine }));
    void this.load();
  }
  toggleType(type: PropertyType): void {
    this.filters.update((f) => ({
      ...f,
      types: f.types.includes(type) ? f.types.filter((t) => t !== type) : [...f.types, type],
    }));
    void this.load();
  }
  onPrice(which: 'min' | 'max', raw: string): void {
    const value = raw === '' ? null : Number(raw);
    this.filters.update((f) => ({ ...f, [which === 'min' ? 'priceMin' : 'priceMax']: value }));
    this.schedule();
  }
  clearFilters(): void {
    this.filters.set({ ...EMPTY_FILTERS });
    void this.load();
  }

  onSelect(id: string): void {
    this.selectedId.set(id);
  }

  // --- Datos ---
  private schedule(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.load(), 300);
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const userId = this.auth.session()?.user?.id ?? null;
      this.properties.set(await this.svc.search(this.filters(), userId));
    } catch {
      this.properties.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private locateUser(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.center.set({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        this.userLocated.set(true);
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000 },
    );
  }
}
