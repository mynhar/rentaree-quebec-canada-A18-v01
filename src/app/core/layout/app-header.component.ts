import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthService } from '../auth/auth.service';
import { LanguageSwitcherComponent } from '../i18n/language-switcher.component';

/**
 * Barra superior compartida de la app autenticada. Se usa en todas las pantallas
 * tras el login (listado, ficha, formulario, escáner, admin) para que las opciones
 * de navegación estén siempre disponibles. Las opciones por rol (Escáner, Admin)
 * se muestran según `auth.role()`; la seguridad real la imponen los guards + RLS.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslocoDirective, LanguageSwitcherComponent],
  template: `
    <header class="appbar" *transloco="let t">
      <a routerLink="/quebec-city" class="mark">
        Rentaree<span class="mark__tick" aria-hidden="true"></span>
      </a>

      <div class="appbar__right">
        @if (auth.isAuthenticated()) {
          <a routerLink="/quebec-city" routerLinkActive="on"
            [routerLinkActiveOptions]="{ exact: true }" class="navlink">{{ t('nav.properties') }}</a>
        }
        <app-language-switcher />
        @if (auth.isAuthenticated()) {
          @if (auth.role() === 'escaner' || auth.role() === 'administrador') {
            <a routerLink="/escaner" routerLinkActive="on" class="navlink">{{ t('nav.scans') }}</a>
          }
          @if (auth.role() === 'administrador') {
            <a routerLink="/admin" routerLinkActive="on" class="navlink">{{ t('nav.admin') }}</a>
          }
          <a routerLink="/quebec-city/nueva" class="btn btn--primary">{{ t('nav.newProperty') }}</a>
          <span class="user">{{ auth.profile()?.first_name }} {{ auth.profile()?.last_name }}</span>
          <button class="btn btn--ghost" (click)="salir()">{{ t('nav.signOut') }}</button>
        }
      </div>
    </header>
  `,
  styles: [`
    .appbar {
      position: sticky; top: 0; z-index: 30;
      display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-md);
      padding: 10px var(--space-lg);
      background: color-mix(in oklch, var(--surface) 90%, transparent);
      backdrop-filter: blur(10px) saturate(140%);
      border-bottom: 1px solid var(--line);
    }
    .mark {
      font-family: var(--font-display); font-weight: 600; font-size: 19px; color: var(--ink);
      display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;
    }
    .mark__tick { width: 15px; height: 8px; border: 1px solid var(--ink-3); border-top: 0; }

    .appbar__right { margin-left: auto; display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap; justify-content: flex-end; }
    .appbar__right .btn { padding: 8px 14px; }
    .navlink {
      font-size: var(--text-sm); font-weight: 500; color: var(--ink-2);
      padding-block: 4px; border-bottom: 1px solid transparent;
      transition: color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
    }
    .navlink:hover { color: var(--ink); }
    .navlink.on { color: var(--ink); border-bottom-color: var(--accent); }
    .user { font-size: var(--text-sm); color: var(--ink-2); white-space: nowrap; }

    @media (max-width: 760px) {
      .user { display: none; }
    }
  `],
})
export class AppHeaderComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async salir(): Promise<void> {
    await this.auth.signOut();
    void this.router.navigate(['/']);
  }
}
