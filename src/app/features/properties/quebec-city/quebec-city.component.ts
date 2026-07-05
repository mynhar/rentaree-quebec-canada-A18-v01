import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

// Placeholder — Lista/Mapa/Dividir + búsqueda se construyen en la Fase 5.
// Ruta protegida por authGuard: solo se ve con sesión activa.
@Component({
  selector: 'app-quebec-city',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header style="display:flex;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #eae8e1;">
      <strong>Rentaree</strong>
      <span>
        {{ auth.profile()?.first_name }} {{ auth.profile()?.last_name }}
        <button (click)="salir()" style="margin-left:12px;">Salir</button>
      </span>
    </header>

    <main style="padding:24px;">
      @if (auth.needsProfileCompletion()) {
        <p style="background:#faeeda;padding:12px;border-radius:8px;">
          Completa tu teléfono para poder publicar propiedades.
          <a routerLink="/completar-perfil">Completar ahora</a>
        </p>
      }
      <p>Aquí irán las propiedades disponibles (Lista / Mapa / Dividir).</p>
    </main>
  `,
})
export class QuebecCityComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async salir(): Promise<void> {
    await this.auth.signOut();
    void this.router.navigate(['/']);
  }
}
