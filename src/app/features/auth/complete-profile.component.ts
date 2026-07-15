import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthService } from '../../core/auth/auth.service';

// Se muestra tras el primer login con Google (que no entrega teléfono).
@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [ReactiveFormsModule, TranslocoDirective],
  template: `
    <main class="wrap" *transloco="let t">
      <div class="card">
        <h1>{{ t('profile.complete.title') }}</h1>
        <p class="lead">{{ t('profile.complete.lead') }}</p>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label for="phone">{{ t('profile.complete.phone') }}</label>
            <input id="phone" class="input" type="tel" autocomplete="tel"
              placeholder="(514) 555-0142" formControlName="phone"
              [class.is-invalid]="invalid" />
            @if (invalid) {
              <small class="hint">{{ t('profile.complete.hint') }}</small>
            }
          </div>
          <button class="btn btn--primary btn--block" type="submit" [disabled]="busy()">
            {{ busy() ? t('common.saving') : t('profile.complete.submit') }}
          </button>
        </form>
      </div>
    </main>
  `,
  styles: [`
    .wrap { min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: var(--space-lg); }
    .card {
      width: 100%; max-width: 400px;
      background: var(--surface); border: 1px solid var(--line);
      border-radius: var(--radius-lg); box-shadow: var(--shadow); padding: var(--space-xl);
    }
    h1 { font-size: var(--text-2xl); margin-bottom: var(--space-sm); }
    .lead { color: var(--ink-2); font-size: var(--text-sm); margin: 0 0 var(--space-lg); line-height: 1.55; }
    .field { margin-bottom: var(--space-md); }
    .field label { display: block; margin-bottom: 6px; font-size: var(--text-sm); font-weight: 500; color: var(--ink-2); }
    .hint { display: block; margin-top: 5px; font-size: var(--text-xs); color: var(--danger); }
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
