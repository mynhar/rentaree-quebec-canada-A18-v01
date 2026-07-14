import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { PropertyService, NewPropertyInput } from '../property.service';
import { GeocodingService } from '../../../core/util/geocoding.service';
import { CA_PROVINCES, PROPERTY_TYPES } from '../../../core/config/constants';
import { CaProvince, PropertyType } from '../../../core/models/database.types';
import { errorMessage } from '../../../core/util/errors';
import { PhotoPickerComponent } from '../shared/photo-picker.component';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PhotoPickerComponent],
  template: `
    <header class="bar">
      <a routerLink="/quebec-city" class="back">← Volver</a>
      <span class="mark">Rentaree<span class="mark__tick" aria-hidden="true"></span></span>
    </header>

    <main class="wrap">
      @if (created(); as exp) {
        <!-- Éxito: expediente generado -->
        <section class="done">
          <p class="eyebrow">Propiedad registrada</p>
          <h1>Tu expediente está abierto.</h1>
          <p class="exp">{{ exp }}</p>
          <p class="lead">
            Guarda este número: identifica toda la información de tu propiedad.
            @if (scanRequested()) {
              Te contactaremos para agendar la visita de escaneo 3D.
            }
          </p>
          @if (photoError(); as pe) {
            <p class="msg msg--error">{{ pe }}</p>
          }
          <div class="row">
            <a routerLink="/quebec-city" class="btn btn--primary">Ver mis propiedades</a>
            <button class="btn btn--ghost" (click)="reset()">Registrar otra</button>
          </div>
        </section>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <h1>Nueva propiedad</h1>
          <p class="lead">Registra una propiedad para ponerla en alquiler.</p>

          <!-- Contacto -->
          <section class="block">
            <div class="block__head">
              <h2>Datos de contacto</h2>
              <p>Pre-llenados desde tu perfil — modifícalos si es necesario.</p>
            </div>
            <div class="grid2">
              <div class="field">
                <label for="cf">Nombre <i>*</i></label>
                <input id="cf" class="input" formControlName="contact_first_name"
                  [class.is-invalid]="bad('contact_first_name')" />
              </div>
              <div class="field">
                <label for="cl">Apellido <i>*</i></label>
                <input id="cl" class="input" formControlName="contact_last_name"
                  [class.is-invalid]="bad('contact_last_name')" />
              </div>
            </div>
            <div class="grid2">
              <div class="field">
                <label for="cp">Teléfono <i>*</i></label>
                <input id="cp" class="input" type="tel" placeholder="(514) 555-0142"
                  formControlName="contact_phone" [class.is-invalid]="bad('contact_phone')" />
              </div>
              <div class="field">
                <label for="ce">Correo electrónico</label>
                <input id="ce" class="input" formControlName="contact_email" readonly />
                <small class="note">No se puede modificar aquí.</small>
              </div>
            </div>
          </section>

          <!-- Tipo -->
          <section class="block">
            <div class="block__head"><h2>Tipo de propiedad</h2></div>
            <div class="chips">
              @for (t of types; track t.value) {
                <button type="button" class="chip" [class.on]="form.value.property_type === t.value"
                  (click)="form.patchValue({ property_type: t.value })">{{ t.label }}</button>
              }
            </div>
          </section>

          <!-- Detalles -->
          <section class="block">
            <div class="block__head">
              <h2>Detalles</h2>
              <p>Las dimensiones se completan con el escaneo 3D; puedes dejarlas vacías.</p>
            </div>
            <div class="field">
              <label for="ti">Título</label>
              <input id="ti" class="input" placeholder="Lumineux 4½ au Plateau" formControlName="title" />
            </div>
            <div class="grid4">
              <div class="field">
                <label for="pr">Precio (CAD/mois) <i>*</i></label>
                <input id="pr" class="input" type="number" min="0" formControlName="price"
                  [class.is-invalid]="bad('price')" />
              </div>
              <div class="field">
                <label for="be">Camas</label>
                <input id="be" class="input" type="number" min="0" formControlName="bedrooms" />
              </div>
              <div class="field">
                <label for="ba">Baños</label>
                <input id="ba" class="input" type="number" min="0" step="0.5" formControlName="bathrooms" />
              </div>
              <div class="field">
                <label for="ar">Superficie (m²)</label>
                <input id="ar" class="input" type="number" min="0" formControlName="area" />
              </div>
            </div>
            <div class="field">
              <label for="de">Descripción</label>
              <textarea id="de" class="input" rows="3" formControlName="description"></textarea>
            </div>
          </section>

          <!-- Localización -->
          <section class="block">
            <div class="block__head">
              <h2>Localización del inmueble</h2>
              <p>¿Dónde se realizará la visita de estimación?</p>
            </div>
            <div class="grid-addr">
              <div class="field">
                <label for="un">Número de unidad</label>
                <input id="un" class="input" placeholder="5" formControlName="unit_number" />
                <small class="note">Opcional. Se combinará: 5-123 Main St.</small>
              </div>
              <div class="field">
                <label for="st">Número y nombre de calle <i>*</i></label>
                <input id="st" class="input" placeholder="1240 Rue Rachel E"
                  formControlName="street" [class.is-invalid]="bad('street')" />
              </div>
            </div>
            <div class="grid3">
              <div class="field">
                <label for="ci">Ciudad <i>*</i></label>
                <input id="ci" class="input" formControlName="city" [class.is-invalid]="bad('city')" />
              </div>
              <div class="field">
                <label for="pv">Provincia / Territorio <i>*</i></label>
                <select id="pv" class="input" formControlName="province">
                  @for (p of provinces; track p.code) {
                    <option [value]="p.code">{{ p.code }} — {{ p.name }}</option>
                  }
                </select>
              </div>
              <div class="field">
                <label for="pc">Código postal <i>*</i></label>
                <input id="pc" class="input" placeholder="H2J 2J5" formControlName="postal_code"
                  [class.is-invalid]="bad('postal_code')" />
              </div>
            </div>
            <div class="field">
              <label for="nb">Barrio</label>
              <input id="nb" class="input" placeholder="Le Plateau-Mont-Royal" formControlName="neighbourhood" />
            </div>
          </section>

          <!-- GPS -->
          <section class="block">
            <div class="block__head">
              <h2>Coordenadas GPS</h2>
              <p>Para mostrar la ubicación en el mapa.</p>
            </div>
            <div class="gps">
              <div class="field">
                <label for="la">Latitud</label>
                <input id="la" class="input mono" type="number" step="any" formControlName="latitude" />
              </div>
              <div class="field">
                <label for="lo">Longitud</label>
                <input id="lo" class="input mono" type="number" step="any" formControlName="longitude" />
              </div>
              <button type="button" class="btn btn--ghost" (click)="locate()" [disabled]="geocoding()">
                {{ geocoding() ? 'Buscando…' : 'Buscar desde la dirección' }}
              </button>
            </div>
            @if (geoMsg()) { <p class="note note--geo">{{ geoMsg() }}</p> }
          </section>

          <!-- Fotos -->
          <section class="block">
            <div class="block__head">
              <h2>Fotos</h2>
              <p>Opcionales. Se suben al registrar la propiedad; la primera es la portada.</p>
            </div>
            <app-photo-picker [disabled]="busy()" />
          </section>

          <!-- Escaneo 3D -->
          <section class="block">
            <label class="scan">
              <input type="checkbox" formControlName="request_scan" />
              <span>
                <strong>Solicitar escaneo 3D</strong>
                Un técnico visita la propiedad y captura el recorrido con Matterport.
              </span>
            </label>
          </section>

          @if (error()) { <p class="msg msg--error">{{ error() }}</p> }

          <div class="actions">
            <button class="btn btn--primary" type="submit" [disabled]="busy()">
              {{ busy() ? uploadLabel() : 'Registrar propiedad' }}
            </button>
            <a routerLink="/quebec-city" class="btn btn--ghost">Cancelar</a>
          </div>
        </form>
      }
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100dvh; }
    .bar { display: flex; align-items: center; gap: 16px; padding: 12px 20px; border-bottom: 1px solid var(--line); background: var(--surface); }
    .back { font-size: 14px; color: var(--ink-2); }
    .mark { margin-left: auto; font-family: var(--font-display); font-weight: 600; font-size: 18px; display: inline-flex; align-items: center; gap: 5px; }
    .mark__tick { width: 15px; height: 8px; border-left: 1px solid var(--ink-3); border-right: 1px solid var(--ink-3); border-bottom: 1px solid var(--ink-3); }

    .wrap { max-width: 720px; margin: 0 auto; padding: 40px 24px 80px; }
    h1 { font-size: 30px; margin-bottom: 6px; }
    .lead { color: var(--ink-2); font-size: 15px; margin: 0 0 8px; }

    .block { border-top: 1px solid var(--line); padding-top: 22px; margin-top: 28px; }
    .block__head { margin-bottom: 16px; }
    .block__head h2 { font-size: 17px; }
    .block__head p { margin: 4px 0 0; font-size: 13.5px; color: var(--ink-3); }

    .field { margin-bottom: 14px; }
    .field label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: var(--ink-2); }
    .field label i { color: var(--accent); font-style: normal; }
    .note { display: block; margin-top: 5px; font-size: 12px; color: var(--ink-3); }
    .note--geo { color: var(--ink-2); }
    .mono { font-family: var(--font-mono); }
    textarea.input { resize: vertical; }
    select.input { appearance: none; background-image: linear-gradient(45deg, transparent 50%, var(--ink-3) 50%), linear-gradient(135deg, var(--ink-3) 50%, transparent 50%); background-position: calc(100% - 16px) 50%, calc(100% - 11px) 50%; background-size: 5px 5px, 5px 5px; background-repeat: no-repeat; }
    input[readonly] { background: var(--surface-2); color: var(--ink-3); }

    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .grid3 { display: grid; grid-template-columns: 1.2fr 1.4fr 1fr; gap: 12px; }
    .grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .grid-addr { display: grid; grid-template-columns: 140px 1fr; gap: 12px; }

    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip { font: inherit; font-size: 13.5px; padding: 8px 15px; border: 1px solid var(--line-2); border-radius: 100px; background: var(--surface); color: var(--ink-2); cursor: pointer; }
    .chip.on { background: var(--accent); color: #fff; border-color: var(--accent); }

    .gps { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: end; }
    .gps .field { margin-bottom: 0; }

    .scan { display: flex; gap: 12px; align-items: flex-start; padding: 16px; background: var(--surface-2); border: 1px solid var(--line); border-radius: var(--radius-lg); cursor: pointer; }
    .scan span { display: flex; flex-direction: column; gap: 3px; font-size: 13.5px; color: var(--ink-2); }
    .scan strong { font-size: 14.5px; color: var(--ink); font-weight: 500; }

    .msg { margin-top: 20px; padding: 10px 12px; border-radius: var(--radius); font-size: 13.5px; }
    .msg--error { background: var(--danger-050); color: var(--danger); }

    .actions { display: flex; gap: 12px; margin-top: 28px; }

    /* Éxito */
    .done { text-align: center; padding: 56px 0; }
    .eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); margin: 0 0 14px; }
    .exp { font-family: var(--font-mono); font-size: 26px; font-weight: 700; letter-spacing: .02em; margin: 18px 0; padding: 16px; background: var(--surface-2); border: 1px dashed var(--line-2); border-radius: var(--radius-lg); }
    .done .lead { max-width: 44ch; margin: 0 auto 24px; }
    .row { display: flex; gap: 12px; justify-content: center; }

    @media (max-width: 640px) {
      .grid2, .grid3, .grid4, .grid-addr, .gps { grid-template-columns: 1fr; }
    }
  `],
})
export class PropertyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly svc = inject(PropertyService);
  private readonly geo = inject(GeocodingService);
  private readonly router = inject(Router);

  readonly types = PROPERTY_TYPES;
  readonly provinces = CA_PROVINCES;

  private readonly picker = viewChild(PhotoPickerComponent);

  readonly busy = signal(false);
  readonly geocoding = signal(false);
  readonly error = signal<string | null>(null);
  readonly geoMsg = signal<string | null>(null);
  readonly created = signal<string | null>(null);   // número de expediente
  readonly scanRequested = signal(false);
  readonly uploaded = signal<{ done: number; total: number } | null>(null);
  readonly photoError = signal<string | null>(null);

  /** Texto del botón: mientras suben fotos, dice por cuál va. */
  uploadLabel(): string {
    const u = this.uploaded();
    return u ? `Subiendo fotos ${u.done}/${u.total}…` : 'Registrando…';
  }

  readonly form: FormGroup = this.fb.group({
    // Contacto
    contact_first_name: ['', Validators.required],
    contact_last_name: ['', Validators.required],
    contact_phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-()\s]{7,}$/)]],
    contact_email: [{ value: '', disabled: true }],
    // Tipo
    property_type: ['apartamento' as PropertyType, Validators.required],
    // Detalles
    title: [''],
    description: [''],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    bedrooms: [null as number | null],
    bathrooms: [null as number | null],
    area: [null as number | null],
    // Localización
    unit_number: [''],
    street: ['', Validators.required],
    city: ['Montréal', Validators.required],
    province: ['QC' as CaProvince, Validators.required],
    postal_code: ['', [Validators.required, Validators.pattern(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/)]],
    neighbourhood: [''],
    // GPS
    latitude: [null as number | null],
    longitude: [null as number | null],
    // Escaneo
    request_scan: [true],
  });

  async ngOnInit(): Promise<void> {
    await this.auth.whenReady();
    const p = this.auth.profile();
    if (p) {
      this.form.patchValue({
        contact_first_name: p.first_name,
        contact_last_name: p.last_name,
        contact_phone: p.phone,
        contact_email: p.email,
      });
    }
  }

  bad(ctrl: string): boolean {
    const c = this.form.get(ctrl);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  /** Convierte la dirección escrita en coordenadas GPS. */
  async locate(): Promise<void> {
    const v = this.form.getRawValue();
    if (!v.street || !v.city || !v.postal_code) {
      this.geoMsg.set('Completa calle, ciudad y código postal para buscar las coordenadas.');
      return;
    }
    this.geocoding.set(true);
    this.geoMsg.set(null);
    try {
      const r = await this.geo.geocode({
        street: v.street,
        city: v.city,
        province: v.province,
        postalCode: v.postal_code,
      });
      if (r) {
        this.form.patchValue({ latitude: r.lat, longitude: r.lng });
        this.geoMsg.set(`Ubicación encontrada: ${r.displayName}`);
      } else {
        this.geoMsg.set('No encontramos esa dirección. Puedes escribir las coordenadas a mano.');
      }
    } catch {
      this.geoMsg.set('No se pudo buscar la dirección. Escribe las coordenadas a mano.');
    } finally {
      this.geocoding.set(false);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Revisa los campos marcados.');
      return;
    }
    const userId = this.auth.session()?.user?.id;
    if (!userId) return;

    this.busy.set(true);
    this.error.set(null);
    try {
      const v = this.form.getRawValue();
      const input: NewPropertyInput = {
        property_type: v.property_type,
        status: 'disponible',
        title: v.title || null,
        description: v.description || null,
        price: v.price,
        bedrooms: v.bedrooms,
        bathrooms: v.bathrooms,
        area: v.area,
        area_unit: 'm2',
        contact_first_name: v.contact_first_name,
        contact_last_name: v.contact_last_name,
        contact_phone: v.contact_phone,
        contact_email: v.contact_email,
        unit_number: v.unit_number || null,
        street: v.street,
        city: v.city,
        province: v.province,
        postal_code: v.postal_code.toUpperCase(),
        neighbourhood: v.neighbourhood || null,
        latitude: v.latitude,
        longitude: v.longitude,
      };

      const property = await this.svc.create(input, userId);

      // Las fotos solo se pueden subir ahora: su ruta lleva el id de la propiedad.
      // Si fallan, la propiedad ya está creada — se avisa, no se pierde el expediente.
      const photos = this.picker()?.files() ?? [];
      if (photos.length) {
        try {
          this.uploaded.set({ done: 0, total: photos.length });
          await this.svc.uploadPhotos(property.id, photos, {
            onProgress: (done, total) => this.uploaded.set({ done, total }),
          });
          this.picker()?.clear();
        } catch {
          this.photoError.set(
            'La propiedad se registró, pero no se pudieron subir las fotos. ' +
              'Añádelas más tarde desde la ficha.',
          );
        } finally {
          this.uploaded.set(null);
        }
      }

      if (v.request_scan) {
        await this.svc.requestScan(property.id, userId);
        this.scanRequested.set(true);
      }

      this.created.set(property.expediente);
    } catch (e) {
      this.error.set(errorMessage(e, 'No se pudo registrar la propiedad. Inténtalo de nuevo.'));
    } finally {
      this.busy.set(false);
    }
  }

  reset(): void {
    this.created.set(null);
    this.scanRequested.set(false);
    this.geoMsg.set(null);
    this.photoError.set(null);
    this.uploaded.set(null);
    this.form.reset({
      property_type: 'apartamento',
      city: 'Montréal',
      province: 'QC',
      request_scan: true,
    });
    void this.ngOnInit();
  }
}
