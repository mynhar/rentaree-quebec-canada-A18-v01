import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ScanService, ScanRequestFull } from '../scanning/scan.service';
import { Profile, UserRole, ScanStatus } from '../../core/models/database.types';
import { buildAddress } from '../../core/util/format';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'escaner', label: 'Escáner' },
  { value: 'administrador', label: 'Administrador' },
];

const STATUS_LABEL: Record<ScanStatus, string> = {
  solicitado: 'Solicitado',
  agendado: 'Agendado',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

type Tab = 'escaneos' | 'usuarios';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <header class="bar">
      <a routerLink="/quebec-city" class="back">← Propiedades</a>
      <span class="title">Administración</span>
      <span class="mark">Rentaree<span class="mark__tick" aria-hidden="true"></span></span>
    </header>

    <main class="wrap">
      <div class="seg">
        <button [class.on]="tab() === 'escaneos'" (click)="tab.set('escaneos')">Escaneos</button>
        <button [class.on]="tab() === 'usuarios'" (click)="tab.set('usuarios')">Usuarios</button>
      </div>

      @if (error()) { <p class="msg msg--error">{{ error() }}</p> }

      @if (tab() === 'escaneos') {
        <h1>Solicitudes de escaneo</h1>
        <p class="lead">Asigna un escáner a cada visita.</p>

        @if (loading()) {
          <p class="state">Cargando…</p>
        } @else if (requests().length === 0) {
          <p class="state">No hay solicitudes de escaneo.</p>
        } @else {
          <table class="tbl">
            <thead>
              <tr>
                <th>Expediente</th><th>Propiedad</th><th>Estado</th><th>Escáner asignado</th><th></th>
              </tr>
            </thead>
            <tbody>
              @for (r of requests(); track r.id) {
                <tr>
                  <td class="mono acc">{{ r.properties.expediente }}</td>
                  <td>{{ addr(r) }}</td>
                  <td><span class="status" [attr.data-s]="r.status">{{ label(r.status) }}</span></td>
                  <td>
                    <select class="input input--sm" [ngModel]="r.scanner_id ?? ''"
                      (ngModelChange)="assign(r, $event)">
                      <option value="">— Sin asignar —</option>
                      @for (s of scanners(); track s.id) {
                        <option [value]="s.id">{{ s.first_name }} {{ s.last_name }}</option>
                      }
                    </select>
                  </td>
                  <td>
                    <a class="link" [routerLink]="['/propiedad', r.property_id]">Ver ficha</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      } @else {
        <h1>Usuarios</h1>
        <p class="lead">Cambia el rol de acceso de cada persona.</p>

        @if (loading()) {
          <p class="state">Cargando…</p>
        } @else {
          <table class="tbl">
            <thead>
              <tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Rol</th></tr>
            </thead>
            <tbody>
              @for (p of profiles(); track p.id) {
                <tr>
                  <td class="strong">{{ p.first_name }} {{ p.last_name }}</td>
                  <td class="muted">{{ p.email }}</td>
                  <td class="mono">{{ p.phone || '—' }}</td>
                  <td>
                    <select class="input input--sm" [ngModel]="p.role"
                      (ngModelChange)="changeRole(p, $event)">
                      @for (r of roles; track r.value) {
                        <option [value]="r.value">{{ r.label }}</option>
                      }
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      }
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100dvh; }
    .bar { display: flex; align-items: center; gap: 16px; padding: 12px 20px; border-bottom: 1px solid var(--line); background: var(--surface); }
    .back { font-size: 14px; color: var(--ink-2); }
    .title { font-size: 14px; font-weight: 500; }
    .mark { margin-left: auto; font-family: var(--font-display); font-weight: 600; font-size: 18px; display: inline-flex; align-items: center; gap: 5px; }
    .mark__tick { width: 15px; height: 8px; border-left: 1px solid var(--ink-3); border-right: 1px solid var(--ink-3); border-bottom: 1px solid var(--ink-3); }

    .wrap { max-width: 1000px; margin: 0 auto; padding: 28px 24px 80px; }
    .seg { display: inline-flex; background: var(--surface-2); border-radius: var(--radius); padding: 3px; margin-bottom: 26px; }
    .seg button { border: 0; background: transparent; cursor: pointer; padding: 7px 16px; border-radius: 7px; font: inherit; font-size: 13.5px; font-weight: 500; color: var(--ink-2); }
    .seg button.on { background: var(--surface); color: var(--ink); box-shadow: var(--shadow); }

    h1 { font-size: 24px; margin-bottom: 5px; }
    .lead { color: var(--ink-2); font-size: 14.5px; margin: 0 0 22px; }
    .state { padding: 56px 0; text-align: center; color: var(--ink-3); }

    .tbl { width: 100%; border-collapse: collapse; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; }
    .tbl th { text-align: left; font-size: 12px; font-weight: 500; color: var(--ink-3); padding: 12px 14px; border-bottom: 1px solid var(--line); background: var(--surface-2); }
    .tbl td { padding: 12px 14px; border-bottom: 1px solid var(--line); font-size: 14px; vertical-align: middle; }
    .tbl tr:last-child td { border-bottom: 0; }
    .mono { font-family: var(--font-mono); font-size: 12.5px; }
    .acc { color: var(--accent); }
    .strong { font-weight: 500; }
    .muted { color: var(--ink-2); }
    .link { font-size: 13px; }

    .input--sm { padding: 7px 10px; font-size: 13px; width: auto; min-width: 160px; }
    .status { font-size: 12px; padding: 3px 9px; border-radius: 100px; background: var(--surface-2); color: var(--ink-2); white-space: nowrap; }
    .status[data-s="completado"] { background: #E9F3EE; color: var(--ok); }
    .status[data-s="agendado"] { background: var(--accent-050); color: var(--accent); }

    .msg { padding: 10px 12px; border-radius: var(--radius); font-size: 13.5px; margin-bottom: 16px; }
    .msg--error { background: var(--danger-050); color: var(--danger); }

    @media (max-width: 760px) {
      .tbl { display: block; overflow-x: auto; }
    }
  `],
})
export class AdminComponent implements OnInit {
  private readonly svc = inject(ScanService);

  readonly roles = ROLES;
  readonly tab = signal<Tab>('escaneos');
  readonly requests = signal<ScanRequestFull[]>([]);
  readonly profiles = signal<Profile[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly scanners = computed(() =>
    this.profiles().filter((p) => p.role === 'escaner' || p.role === 'administrador'),
  );

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      const [reqs, profs] = await Promise.all([
        this.svc.listRequests(),
        this.svc.listProfiles(),
      ]);
      this.requests.set(reqs);
      this.profiles.set(profs);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudieron cargar los datos.');
    } finally {
      this.loading.set(false);
    }
  }

  label(s: ScanStatus): string {
    return STATUS_LABEL[s];
  }

  addr(r: ScanRequestFull): string {
    return buildAddress(r.properties);
  }

  async assign(r: ScanRequestFull, scannerId: string): Promise<void> {
    this.error.set(null);
    try {
      await this.svc.assignScanner(r.id, r.property_id, scannerId || null);
      this.requests.set(await this.svc.listRequests());
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo asignar el escáner.');
    }
  }

  async changeRole(p: Profile, role: UserRole): Promise<void> {
    this.error.set(null);
    try {
      await this.svc.setRole(p.id, role);
      this.profiles.set(await this.svc.listProfiles());
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo cambiar el rol.');
    }
  }
}
