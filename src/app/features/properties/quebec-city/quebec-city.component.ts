import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { PropertyService, PropertyCard } from '../property.service';
import { PropertyFilters, EMPTY_FILTERS } from '../property-filters';
import { PROPERTY_TYPES, DEFAULT_MAP_CENTER } from '../../../core/config/constants';
import { PropertyType } from '../../../core/models/database.types';
import { PropertyListComponent } from './property-list.component';
import { PropertyMapComponent } from './property-map.component';

type ViewMode = 'list' | 'map' | 'split';

@Component({
  selector: 'app-quebec-city',
  standalone: true,
  imports: [RouterLink, PropertyListComponent, PropertyMapComponent],
  template: `
    <header class="bar">
      <a routerLink="/" class="mark">Rentaree<span class="mark__tick" aria-hidden="true"></span></a>

      <div class="search">
        <input class="input" type="search" placeholder="Ciudad, dirección o barrio"
          [value]="filters().text" (input)="onText($any($event.target).value)" />
      </div>

      <div class="bar__right">
        <a routerLink="/quebec-city/nueva" class="btn btn--primary">Nueva propiedad</a>
        <span class="user">{{ auth.profile()?.first_name }} {{ auth.profile()?.last_name }}</span>
        <button class="btn btn--ghost" (click)="salir()">Salir</button>
      </div>
    </header>

    @if (auth.needsProfileCompletion()) {
      <div class="notice">
        Completa tu teléfono para poder publicar propiedades.
        <a routerLink="/completar-perfil">Completar ahora</a>
      </div>
    }

    <div class="toolbar">
      <button class="chip-btn" [class.on]="filtersOpen()" (click)="filtersOpen.set(!filtersOpen())">
        Filtros @if (activeFilterCount() > 0) { <span class="count">{{ activeFilterCount() }}</span> }
      </button>

      <label class="mine">
        <input type="checkbox" [checked]="filters().onlyMine" (change)="onMine($any($event.target).checked)" />
        Mis propiedades
      </label>

      <span class="results">{{ loading() ? '…' : properties().length }} resultados</span>

      <div class="seg">
        <button [class.on]="mode() === 'list'" (click)="mode.set('list')">Lista</button>
        <button [class.on]="mode() === 'map'" (click)="mode.set('map')">Mapa</button>
        <button [class.on]="mode() === 'split'" (click)="mode.set('split')">Dividir</button>
      </div>
    </div>

    @if (filtersOpen()) {
      <div class="filters">
        <div class="filters__group">
          <span class="filters__label">Tipo</span>
          <div class="types">
            @for (t of types; track t.value) {
              <button class="type-chip" [class.on]="filters().types.includes(t.value)"
                (click)="toggleType(t.value)">{{ t.label }}</button>
            }
          </div>
        </div>
        <div class="filters__group">
          <span class="filters__label">Precio (CAD / mois)</span>
          <div class="price">
            <input class="input" type="number" min="0" placeholder="Mín"
              [value]="filters().priceMin ?? ''" (input)="onPrice('min', $any($event.target).value)" />
            <span>—</span>
            <input class="input" type="number" min="0" placeholder="Máx"
              [value]="filters().priceMax ?? ''" (input)="onPrice('max', $any($event.target).value)" />
          </div>
        </div>
        <button class="clear" (click)="clearFilters()">Limpiar filtros</button>
      </div>
    }

    <div class="content" [class.content--map]="mode() === 'map'" [class.content--split]="mode() === 'split'">
      @if (mode() === 'list') {
        <div class="scroll">
          <app-property-list [properties]="properties()" [selectedId]="selectedId()"
            [loading]="loading()" (select)="onSelect($event)" />
        </div>
      } @else if (mode() === 'map') {
        <app-property-map [properties]="properties()" [center]="center()"
          [selectedId]="selectedId()" (markerSelect)="onSelect($event)" />
      } @else {
        <div class="scroll">
          <app-property-list [properties]="properties()" [selectedId]="selectedId()"
            [loading]="loading()" (select)="onSelect($event)" />
        </div>
        <app-property-map [properties]="properties()" [center]="center()"
          [selectedId]="selectedId()" (markerSelect)="onSelect($event)" />
      }
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100dvh; }

    .bar { display: flex; align-items: center; gap: 16px; padding: 12px 20px; border-bottom: 1px solid var(--line); background: var(--surface); }
    .mark { font-family: var(--font-display); font-weight: 600; font-size: 19px; color: var(--ink); display: inline-flex; align-items: center; gap: 5px; }
    .mark__tick { width: 15px; height: 8px; border-left: 1px solid var(--ink-3); border-right: 1px solid var(--ink-3); border-bottom: 1px solid var(--ink-3); }
    .search { flex: 1; max-width: 420px; }
    .bar__right { margin-left: auto; display: flex; align-items: center; gap: 14px; }
    .user { font-size: 14px; color: var(--ink-2); }

    .notice { background: #FAEEDA; color: #8A5B00; padding: 10px 20px; font-size: 13.5px; }
    .notice a { color: #8A5B00; text-decoration: underline; margin-left: 4px; }

    .toolbar { display: flex; align-items: center; gap: 14px; padding: 10px 20px; border-bottom: 1px solid var(--line); }
    .chip-btn { font: inherit; font-size: 13.5px; font-weight: 500; padding: 7px 13px; border: 1px solid var(--line-2); border-radius: 100px; background: var(--surface); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
    .chip-btn.on { border-color: var(--accent); color: var(--accent); }
    .count { background: var(--accent); color: #fff; font-size: 11px; border-radius: 100px; padding: 1px 6px; }
    .mine { display: inline-flex; align-items: center; gap: 7px; font-size: 13.5px; color: var(--ink-2); cursor: pointer; }
    .results { font-family: var(--font-mono); font-size: 12.5px; color: var(--ink-3); }
    .seg { margin-left: auto; display: flex; background: var(--surface-2); border-radius: var(--radius); padding: 3px; }
    .seg button { border: 0; background: transparent; cursor: pointer; padding: 6px 14px; border-radius: 7px; font: inherit; font-size: 13.5px; font-weight: 500; color: var(--ink-2); }
    .seg button.on { background: var(--surface); color: var(--ink); box-shadow: var(--shadow); }

    .filters { display: flex; align-items: flex-end; gap: 28px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid var(--line); background: var(--surface-2); }
    .filters__label { display: block; font-size: 12px; font-weight: 500; color: var(--ink-2); margin-bottom: 8px; }
    .types { display: flex; flex-wrap: wrap; gap: 7px; }
    .type-chip { font: inherit; font-size: 13px; padding: 6px 12px; border: 1px solid var(--line-2); border-radius: 100px; background: var(--surface); color: var(--ink-2); cursor: pointer; }
    .type-chip.on { background: var(--accent); color: #fff; border-color: var(--accent); }
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
  private readonly router = inject(Router);

  readonly types = PROPERTY_TYPES;

  readonly mode = signal<ViewMode>('list');
  readonly filtersOpen = signal(false);
  readonly filters = signal<PropertyFilters>({ ...EMPTY_FILTERS });
  readonly properties = signal<PropertyCard[]>([]);
  readonly loading = signal(false);
  readonly selectedId = signal<string | null>(null);
  readonly center = signal<{ lat: number; lng: number }>(DEFAULT_MAP_CENTER);

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

  async salir(): Promise<void> {
    await this.auth.signOut();
    void this.router.navigate(['/']);
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
      (pos) => this.center.set({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 5000 },
    );
  }
}
