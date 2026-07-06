import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// Placeholder — el formulario completo de "Nueva propiedad" se construye en la Fase 6.
@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main style="max-width:560px;margin:0 auto;padding:64px 24px;">
      <a routerLink="/quebec-city" style="font-size:14px;">← Volver</a>
      <h1 style="font-family:var(--font-display);font-weight:500;margin:16px 0 8px;">Nueva propiedad</h1>
      <p style="color:var(--ink-2);">El formulario completo (expediente, localización, GPS) llega en la Fase 6.</p>
    </main>
  `,
})
export class PropertyFormComponent {}
