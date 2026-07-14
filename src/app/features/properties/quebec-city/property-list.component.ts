import { Component, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { PropertyCard } from '../property.service';
import { PropertyCardComponent } from '../shared/property-card.component';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [PropertyCardComponent, TranslocoDirective],
  template: `
    <ng-container *transloco="let t">
      @if (loading()) {
        <p class="state">{{ t('property.list.searching') }}</p>
      } @else if (properties().length === 0) {
        <div class="state">
          <p class="state__title">{{ t('property.list.emptyTitle') }}</p>
          <p class="state__sub">{{ t('property.list.emptySub') }}</p>
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
    </ng-container>
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
