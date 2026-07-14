import { Component, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageService, LANGUAGES } from './language.service';
import { AppLanguage } from '../models/database.types';

/**
 * Selector FR / EN / ES. Códigos de idioma, no banderas: una bandera representa
 * un país, no una lengua — y en Canadá eso no es un detalle menor.
 */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [TranslocoDirective],
  template: `
    <div class="langs" *transloco="let t" role="group" [attr.aria-label]="t('common.language')">
      @for (l of languages; track l) {
        <button
          type="button"
          class="lang"
          [class.on]="svc.lang() === l"
          [attr.aria-pressed]="svc.lang() === l"
          [attr.aria-label]="t('common.languages.' + l)"
          (click)="svc.set(l)"
        >{{ l.toUpperCase() }}</button>
      }
    </div>
  `,
  styles: [`
    .langs { display: inline-flex; align-items: center; gap: 2px; }
    .lang {
      font-family: var(--font-mono);
      font-size: 11px; letter-spacing: .04em;
      padding: 5px 7px;
      border: 0; border-radius: 6px;
      background: none; color: var(--ink-3);
      cursor: pointer;
      transition: color .12s ease, background .12s ease;
    }
    .lang:hover { color: var(--ink-2); }
    .lang.on { color: var(--ink); background: var(--surface-2); }
  `],
})
export class LanguageSwitcherComponent {
  readonly svc = inject(LanguageService);
  readonly languages: AppLanguage[] = LANGUAGES;
}
