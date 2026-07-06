import { Component, input, output } from '@angular/core';
import { PropertyCard } from '../property.service';
import { PropertyCardComponent } from '../shared/property-card.component';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [PropertyCardComponent],
  template: `
    @if (loading()) {
      <p class="state">Buscando propiedades…</p>
    } @else if (properties().length === 0) {
      <div class="state">
        <p class="state__title">Sin resultados</p>
        <p class="state__sub">Ajusta los filtros o amplía la zona de búsqueda.</p>
      </div>
    } @else {
      <div class="grid">
        @for (p of properties(); track p.id) {
          <div (click)="select.emit(p.id)" (mouseenter)="hover.emit(p.id)">
            <app-property-card [property]="p" [selected]="p.id === selectedId()" />
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .grid { display: grid; gap: 12px; padding: 16px; }
    .state { padding: 48px 24px; text-align: center; color: var(--ink-3); }
    .state__title { font-weight: 500; color: var(--ink); margin: 0 0 4px; }
    .state__sub { margin: 0; font-size: 14px; }
  `],
})
export class PropertyListComponent {
  readonly properties = input.required<PropertyCard[]>();
  readonly selectedId = input<string | null>(null);
  readonly loading = input<boolean>(false);

  readonly select = output<string>();
  readonly hover = output<string>();
}
