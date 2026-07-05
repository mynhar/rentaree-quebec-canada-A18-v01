import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth">
      <!-- Panel de marca con el plano de línea (firma visual) -->
      <aside class="brand">
        <a routerLink="/" class="brand__mark">
          Rentaree<span class="brand__tick" aria-hidden="true"></span>
        </a>

        <svg class="brand__plan" viewBox="0 0 260 200" fill="none" aria-hidden="true">
          <rect x="16" y="24" width="200" height="150" stroke="#2A2E2A" stroke-width="2"/>
          <line x1="128" y1="24" x2="128" y2="118" stroke="#2A2E2A" stroke-width="2"/>
          <line x1="128" y1="118" x2="216" y2="118" stroke="#2A2E2A" stroke-width="2"/>
          <line x1="128" y1="150" x2="128" y2="174" stroke="#2A2E2A" stroke-width="2"/>
          <path d="M128 150 A24 24 0 0 1 152 174" stroke="#1F4E6B" stroke-width="1.5"/>
          <line x1="16" y1="188" x2="216" y2="188" stroke="#9AA09A" stroke-width="1"/>
          <line x1="16" y1="183" x2="16" y2="193" stroke="#9AA09A" stroke-width="1"/>
          <line x1="216" y1="183" x2="216" y2="193" stroke="#9AA09A" stroke-width="1"/>
          <line x1="232" y1="24" x2="232" y2="174" stroke="#9AA09A" stroke-width="1"/>
          <line x1="227" y1="24" x2="237" y2="24" stroke="#9AA09A" stroke-width="1"/>
          <line x1="227" y1="174" x2="237" y2="174" stroke="#9AA09A" stroke-width="1"/>
        </svg>

        <div class="brand__dims">
          <span>6,40 m</span><span class="sep">×</span><span>4,10 m</span>
        </div>
        <p class="brand__note">
          Recorridos 3D y dimensiones reales de cada propiedad, en Quebec.
        </p>
      </aside>

      <!-- Panel del formulario -->
      <main class="panel">
        <div class="panel__inner">
          <div class="seg" role="group" aria-label="Iniciar sesión o registrarse">
            <button type="button" [class.on]="mode() === 'login'"
              [attr.aria-pressed]="mode() === 'login'" (click)="setMode('login')">
              Iniciar sesión
            </button>
            <button type="button" [class.on]="mode() === 'register'"
              [attr.aria-pressed]="mode() === 'register'" (click)="setMode('register')">
              Registrarse
            </button>
          </div>

          <button class="btn btn--ghost btn--block google" (click)="google()" [disabled]="busy()">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
            </svg>
            Continuar con Google
          </button>

          <div class="divider"><span>o</span></div>

          @if (mode() === 'login') {
            <form [formGroup]="loginForm" (ngSubmit)="submitLogin()" novalidate>
              <div class="field">
                <label for="l-email">Correo electrónico</label>
                <input id="l-email" class="input" type="email" autocomplete="email"
                  formControlName="email" [class.is-invalid]="invalid(loginForm, 'email')" />
                @if (invalid(loginForm, 'email')) {
                  <small class="hint">Ingresa un correo válido.</small>
                }
              </div>
              <div class="field">
                <label for="l-pass">Contraseña</label>
                <input id="l-pass" class="input" type="password" autocomplete="current-password"
                  formControlName="password" [class.is-invalid]="invalid(loginForm, 'password')" />
                @if (invalid(loginForm, 'password')) {
                  <small class="hint">Ingresa tu contraseña.</small>
                }
              </div>
              <button class="btn btn--primary btn--block" type="submit" [disabled]="busy()">
                {{ busy() ? 'Entrando…' : 'Iniciar sesión' }}
              </button>
            </form>
          } @else {
            <form [formGroup]="registerForm" (ngSubmit)="submitRegister()" novalidate>
              <div class="grid2">
                <div class="field">
                  <label for="r-first">Nombre</label>
                  <input id="r-first" class="input" type="text" autocomplete="given-name"
                    formControlName="firstName" [class.is-invalid]="invalid(registerForm, 'firstName')" />
                </div>
                <div class="field">
                  <label for="r-last">Apellido</label>
                  <input id="r-last" class="input" type="text" autocomplete="family-name"
                    formControlName="lastName" [class.is-invalid]="invalid(registerForm, 'lastName')" />
                </div>
              </div>
              <div class="field">
                <label for="r-email">Correo electrónico</label>
                <input id="r-email" class="input" type="email" autocomplete="email"
                  formControlName="email" [class.is-invalid]="invalid(registerForm, 'email')" />
                @if (invalid(registerForm, 'email')) {
                  <small class="hint">Ingresa un correo válido.</small>
                }
              </div>
              <div class="field">
                <label for="r-phone">Teléfono</label>
                <input id="r-phone" class="input" type="tel" autocomplete="tel" placeholder="(514) 555-0142"
                  formControlName="phone" [class.is-invalid]="invalid(registerForm, 'phone')" />
                @if (invalid(registerForm, 'phone')) {
                  <small class="hint">Ingresa un teléfono válido.</small>
                }
              </div>
              <div class="field">
                <label for="r-pass">Contraseña</label>
                <input id="r-pass" class="input" type="password" autocomplete="new-password"
                  formControlName="password" [class.is-invalid]="invalid(registerForm, 'password')" />
                @if (invalid(registerForm, 'password')) {
                  <small class="hint">Mínimo 8 caracteres.</small>
                }
              </div>
              <button class="btn btn--primary btn--block" type="submit" [disabled]="busy()">
                {{ busy() ? 'Creando cuenta…' : 'Crear cuenta' }}
              </button>
            </form>
          }

          @if (error()) { <p class="msg msg--error">{{ error() }}</p> }
          @if (notice()) { <p class="msg msg--ok">{{ notice() }}</p> }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .auth {
      min-height: 100dvh;
      display: grid;
      grid-template-columns: 1.05fr 1fr;
    }
    .brand {
      background: var(--surface-2);
      border-right: 1px solid var(--line);
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 22px;
    }
    .brand__mark {
      font-family: var(--font-display);
      font-weight: 600;
      font-size: 22px;
      color: var(--ink);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .brand__tick {
      width: 18px; height: 10px;
      border-left: 1px solid var(--ink-3);
      border-right: 1px solid var(--ink-3);
      border-bottom: 1px solid var(--ink-3);
    }
    .brand__plan { width: min(340px, 100%); height: auto; }
    .brand__dims {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--ink-2);
      letter-spacing: .02em;
      display: flex; gap: 8px; align-items: center;
    }
    .brand__dims .sep { color: var(--ink-3); }
    .brand__note {
      max-width: 30ch;
      color: var(--ink-2);
      font-size: 14px;
      margin: 0;
      line-height: 1.55;
    }
    .panel {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
    }
    .panel__inner { width: 100%; max-width: 380px; }
    .seg {
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: var(--surface-2);
      border-radius: var(--radius);
      padding: 3px;
      margin-bottom: 22px;
    }
    .seg button {
      border: 0; background: transparent; cursor: pointer;
      padding: 9px; border-radius: 8px;
      font: inherit; font-weight: 500; color: var(--ink-2);
      transition: background .15s ease, color .15s ease;
    }
    .seg button.on { background: var(--surface); color: var(--ink); box-shadow: var(--shadow); }
    .google { margin-bottom: 18px; }
    .divider {
      display: flex; align-items: center; gap: 12px;
      color: var(--ink-3); font-size: 13px;
      margin-bottom: 18px;
    }
    .divider::before, .divider::after {
      content: ""; flex: 1; height: 1px; background: var(--line);
    }
    .field { margin-bottom: 14px; }
    .field label {
      display: block; margin-bottom: 6px;
      font-size: 13px; font-weight: 500; color: var(--ink-2);
    }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .hint { display: block; margin-top: 5px; font-size: 12px; color: var(--danger); }
    .btn--primary.btn--block { margin-top: 6px; }
    .msg { margin: 16px 0 0; padding: 10px 12px; border-radius: var(--radius); font-size: 13.5px; }
    .msg--error { background: var(--danger-050); color: var(--danger); }
    .msg--ok { background: #E9F3EE; color: var(--ok); }
    @media (max-width: 760px) {
      .auth { grid-template-columns: 1fr; }
      .brand {
        border-right: 0; border-bottom: 1px solid var(--line);
        padding: 28px 24px; gap: 16px;
      }
      .brand__plan { display: none; }
    }
  `],
})
export class AuthComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly mode = signal<'login' | 'register'>('login');
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-()\s]{7,}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  setMode(m: 'login' | 'register'): void {
    this.mode.set(m);
    this.error.set(null);
    this.notice.set(null);
  }

  invalid(form: FormGroup, ctrl: string): boolean {
    const c = form.get(ctrl);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  async submitLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    await this.run(async () => {
      const { email, password } = this.loginForm.getRawValue();
      const { error } = await this.auth.signInWithEmail(email, password);
      if (error) return this.error.set(this.translate(error.message));
      await this.router.navigate(['/quebec-city']);
    });
  }

  async submitRegister(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    await this.run(async () => {
      const v = this.registerForm.getRawValue();
      const { data, error } = await this.auth.signUpWithEmail({
        email: v.email,
        password: v.password,
        firstName: v.firstName,
        lastName: v.lastName,
        phone: v.phone,
      });
      if (error) return this.error.set(this.translate(error.message));

      if (data.session) {
        await this.router.navigate(['/quebec-city']);
      } else {
        this.notice.set('Te enviamos un correo para confirmar tu cuenta. Revísalo para continuar.');
        this.mode.set('login');
      }
    });
  }

  async google(): Promise<void> {
    this.error.set(null);
    this.busy.set(true);
    const { error } = await this.auth.signInWithGoogle();
    if (error) {
      this.error.set(this.translate(error.message));
      this.busy.set(false);
    }
    // Si no hay error, el navegador redirige a Google.
  }

  private async run(fn: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    this.notice.set(null);
    try {
      await fn();
    } catch {
      this.error.set('Algo salió mal. Inténtalo de nuevo.');
    } finally {
      this.busy.set(false);
    }
  }

  private translate(message: string): string {
    const m = message.toLowerCase();
    if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
    if (m.includes('already registered') || m.includes('already been registered'))
      return 'Ese correo ya está registrado. Inicia sesión.';
    if (m.includes('email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.';
    if (m.includes('password')) return 'La contraseña no cumple los requisitos.';
    return message;
  }
}
