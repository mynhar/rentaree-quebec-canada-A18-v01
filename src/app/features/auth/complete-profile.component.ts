import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

// Se muestra tras el primer login con Google (que no entrega teléfono).
@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <main class="wrap">
      <div class="card">
        <h1>Completa tu perfil</h1>
        <p class="lead">
          Necesitamos tu teléfono para publicar propiedades y coordinar las visitas de escaneo.
        </p>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label for="phone">Teléfono</label>
            <input id="phone" class="input" type="tel" autocomplete="tel"
              placeholder="(514) 555-0142" formControlName="phone"
              [class.is-invalid]="invalid" />
            @if (invalid) {
              <small class="hint">Ingresa un teléfono válido.</small>
            }
          </div>
          <button class="btn btn--primary btn--block" type="submit" [disabled]="busy()">
            {{ busy() ? 'Guardando…' : 'Guardar y continuar' }}
          </button>
        </form>
      </div>
    </main>
  `,
  styles: [`
    .wrap {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      width: 100%;
      max-width: 400px;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      padding: 32px;
    }
    h1 { font-size: 22px; margin-bottom: 8px; }
    .lead { color: var(--ink-2); font-size: 14px; margin: 0 0 22px; line-height: 1.55; }
    .field { margin-bottom: 16px; }
    .field label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: var(--ink-2); }
    .hint { display: block; margin-top: 5px; font-size: 12px; color: var(--danger); }
  `],
})
export class CompleteProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly busy = signal(false);

  readonly form: FormGroup = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-()\s]{7,}$/)]],
  });

  constructor() {
    void this.guard();
  }

  get invalid(): boolean {
    const c = this.form.get('phone');
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  /** Si ya tiene teléfono, no hay nada que completar: sigue a la app. */
  private async guard(): Promise<void> {
    await this.auth.whenReady();
    if (!this.auth.needsProfileCompletion()) {
      await this.router.navigate(['/quebec-city']);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    try {
      await this.auth.completeProfilePhone(this.form.getRawValue().phone);
      await this.router.navigate(['/quebec-city']);
    } finally {
      this.busy.set(false);
    }
  }
}
