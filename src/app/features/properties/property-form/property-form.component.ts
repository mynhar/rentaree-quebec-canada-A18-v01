import { Component, OnInit, computed, inject, input, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { PropertyService, NewPropertyInput, canEditProperty } from '../property.service';
import { GeocodingService } from '../../../core/util/geocoding.service';
import {
  CA_PROVINCES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
} from '../../../core/config/constants';
import {
  CaProvince,
  PropertyMedia,
  PropertyStatus,
  PropertyType,
} from '../../../core/models/database.types';
import { errorMessage } from '../../../core/util/errors';
import { PhotoPickerComponent } from '../shared/photo-picker.component';
import { AppHeaderComponent } from '../../../core/layout/app-header.component';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PhotoPickerComponent, AppHeaderComponent, TranslocoDirective],
  template: `
    <ng-container *transloco="let t">
    <app-header />

    <main class="wrap">
      @if (created(); as exp) {
        <!-- Éxito: expediente generado -->
        <section class="done">
          <p class="eyebrow">{{ t('property.form.success.eyebrow') }}</p>
          <h1>{{ t('property.form.success.title') }}</h1>
          <p class="exp">{{ exp }}</p>
          <p class="lead">
            {{ t('property.form.success.lead') }}
            @if (scanRequested()) { {{ t('property.form.success.scanRequested') }} }
          </p>
          @if (photoError()) {
            <p class="msg msg--error">{{ t('property.form.photoError') }}</p>
          }
          <div class="row">
            <a routerLink="/quebec-city" class="btn btn--primary">
              {{ t('property.form.success.seeAll') }}
            </a>
            <button class="btn btn--ghost" (click)="reset()">
              {{ t('property.form.success.another') }}
            </button>
          </div>
        </section>
      } @else if (loadingProperty()) {
        <p class="state">{{ t('property.detail.loading') }}</p>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          @if (isEdit()) {
            <h1>{{ t('property.form.editTitle') }}</h1>
            <p class="lead">{{ t('property.form.editLead') }}</p>

            <!-- Expediente (solo lectura: lo genera la base) y estado -->
            <section class="block">
              <div class="block__head">
                <h2>{{ t('property.form.state.title') }}</h2>
                <p>{{ t('property.form.state.lead') }}</p>
              </div>
              <div class="grid2">
                <div class="field">
                  <label for="ex">{{ t('property.form.state.expediente') }}</label>
                  <input id="ex" class="input mono" [value]="expediente() ?? '—'" readonly />
                  <small class="note">{{ t('property.form.state.expedienteNote') }}</small>
                </div>
                <div class="field">
                  <label for="st-status">{{ t('property.form.state.status') }}</label>
                  <select id="st-status" class="input" formControlName="status">
                    @for (s of statuses; track s) {
                      <option [value]="s">{{ t('property.status.' + s) }}</option>
                    }
                  </select>
                </div>
              </div>
            </section>
          } @else {
            <h1>{{ t('property.form.title') }}</h1>
            <p class="lead">{{ t('property.form.lead') }}</p>
          }

          <!-- Contacto -->
          <section class="block">
            <div class="block__head">
              <h2>{{ t('property.form.contact.title') }}</h2>
              <p>{{ t('property.form.contact.lead') }}</p>
            </div>
            <div class="grid2">
              <div class="field">
                <label for="cf">{{ t('property.form.fields.firstName') }} <i>*</i></label>
                <input id="cf" class="input" formControlName="contact_first_name"
                  [class.is-invalid]="bad('contact_first_name')" />
              </div>
              <div class="field">
                <label for="cl">{{ t('property.form.fields.lastName') }} <i>*</i></label>
                <input id="cl" class="input" formControlName="contact_last_name"
                  [class.is-invalid]="bad('contact_last_name')" />
              </div>
            </div>
            <div class="grid2">
              <div class="field">
                <label for="cp">{{ t('property.form.fields.phone') }} <i>*</i></label>
                <input id="cp" class="input" type="tel" placeholder="(514) 555-0142"
                  formControlName="contact_phone" [class.is-invalid]="bad('contact_phone')" />
              </div>
              <div class="field">
                <label for="ce">{{ t('property.form.fields.email') }}</label>
                <input id="ce" class="input" formControlName="contact_email" readonly />
                <small class="note">{{ t('property.form.contact.emailNote') }}</small>
              </div>
            </div>
          </section>

          <!-- Tipo -->
          <section class="block">
            <div class="block__head"><h2>{{ t('property.form.typeTitle') }}</h2></div>
            <div class="chips">
              @for (type of types; track type.value) {
                <button type="button" class="chip"
                  [class.on]="form.value.property_type === type.value"
                  (click)="form.patchValue({ property_type: type.value })">
                  {{ t(type.labelKey) }}
                </button>
              }
            </div>
          </section>

          <!-- Detalles -->
          <section class="block">
            <div class="block__head">
              <h2>{{ t('property.form.details.title') }}</h2>
              <p>{{ t('property.form.details.lead') }}</p>
            </div>
            <div class="field">
              <label for="ti">{{ t('property.form.fields.title') }}</label>
              <input id="ti" class="input" [placeholder]="t('property.form.fields.titlePlaceholder')"
                formControlName="title" />
            </div>
            <div class="grid4">
              <div class="field">
                <label for="pr">{{ t('property.form.fields.price') }} <i>*</i></label>
                <input id="pr" class="input" type="number" min="0" formControlName="price"
                  [class.is-invalid]="bad('price')" />
              </div>
              <div class="field">
                <label for="be">{{ t('property.form.fields.bedrooms') }}</label>
                <input id="be" class="input" type="number" min="0" formControlName="bedrooms" />
              </div>
              <div class="field">
                <label for="ba">{{ t('property.form.fields.bathrooms') }}</label>
                <input id="ba" class="input" type="number" min="0" step="0.5" formControlName="bathrooms" />
              </div>
              <div class="field">
                <label for="ar">{{ t('property.form.fields.area') }}</label>
                <input id="ar" class="input" type="number" min="0" formControlName="area" />
              </div>
            </div>
            <div class="field">
              <label for="de">{{ t('property.form.fields.description') }}</label>
              <textarea id="de" class="input" rows="3" formControlName="description"></textarea>
            </div>
          </section>

          <!-- Localización -->
          <section class="block">
            <div class="block__head">
              <h2>{{ t('property.form.location.title') }}</h2>
              <p>{{ t('property.form.location.lead') }}</p>
            </div>
            <div class="grid-addr">
              <div class="field">
                <label for="un">{{ t('property.form.fields.unit') }}</label>
                <input id="un" class="input" placeholder="5" formControlName="unit_number" />
                <small class="note">{{ t('property.form.fields.unitNote') }}</small>
              </div>
              <div class="field">
                <label for="st">{{ t('property.form.fields.street') }} <i>*</i></label>
                <input id="st" class="input" placeholder="1240 Rue Rachel E"
                  formControlName="street" [class.is-invalid]="bad('street')" />
              </div>
            </div>
            <div class="grid3">
              <div class="field">
                <label for="ci">{{ t('property.form.fields.city') }} <i>*</i></label>
                <input id="ci" class="input" formControlName="city" [class.is-invalid]="bad('city')" />
              </div>
              <div class="field">
                <label for="pv">{{ t('property.form.fields.province') }} <i>*</i></label>
                <select id="pv" class="input" formControlName="province">
                  @for (p of provinces; track p.code) {
                    <option [value]="p.code">{{ p.code }} — {{ t(p.labelKey) }}</option>
                  }
                </select>
              </div>
              <div class="field">
                <label for="pc">{{ t('property.form.fields.postalCode') }} <i>*</i></label>
                <input id="pc" class="input" placeholder="H2J 2J5" formControlName="postal_code"
                  [class.is-invalid]="bad('postal_code')" />
              </div>
            </div>
            <div class="field">
              <label for="nb">{{ t('property.form.fields.neighbourhood') }}</label>
              <input id="nb" class="input" placeholder="Le Plateau-Mont-Royal" formControlName="neighbourhood" />
            </div>
          </section>

          <!-- GPS -->
          <section class="block">
            <div class="block__head">
              <h2>{{ t('property.form.gps.title') }}</h2>
              <p>{{ t('property.form.gps.lead') }}</p>
            </div>
            <div class="gps">
              <div class="field">
                <label for="la">{{ t('property.form.fields.latitude') }}</label>
                <input id="la" class="input mono" type="number" step="any" formControlName="latitude" />
              </div>
              <div class="field">
                <label for="lo">{{ t('property.form.fields.longitude') }}</label>
                <input id="lo" class="input mono" type="number" step="any" formControlName="longitude" />
              </div>
              <button type="button" class="btn btn--ghost" (click)="locate()" [disabled]="geocoding()">
                {{ geocoding() ? t('property.form.gps.locating') : t('property.form.gps.locate') }}
              </button>
            </div>
            @if (geoMsg(); as g) {
              <p class="note note--geo">{{ t(g.key, g.params) }}</p>
            }
          </section>

          <!-- Fotos -->
          <section class="block">
            <div class="block__head">
              <h2>{{ t('property.form.photos.title') }}</h2>
              <p>{{ t(isEdit() ? 'property.form.photos.editLead' : 'property.form.photos.lead') }}</p>
            </div>
            <app-photo-picker
              [existing]="photos()"
              [disabled]="busy()"
              (existingRemove)="deletePhoto($event)"
            />
          </section>

          <!-- Escaneo 3D: solo al dar de alta; después se gestiona desde el panel del escáner -->
          @if (!isEdit()) {
            <section class="block">
              <label class="scan">
                <input type="checkbox" formControlName="request_scan" />
                <span>
                  <strong>{{ t('property.form.scan.title') }}</strong>
                  {{ t('property.form.scan.lead') }}
                </span>
              </label>
            </section>
          }

          @if (errorKey(); as key) {
            <p class="msg msg--error">{{ t(key) }}</p>
          } @else if (errorText()) {
            <p class="msg msg--error">{{ errorText() }}</p>
          }

          <div class="actions">
            <button class="btn btn--primary" type="submit" [disabled]="busy()">
              @if (busy()) {
                @if (uploaded(); as u) {
                  {{ t('property.form.uploading', { done: u.done, total: u.total }) }}
                } @else {
                  {{ t(isEdit() ? 'common.saving' : 'property.form.submitting') }}
                }
              } @else {
                {{ t(isEdit() ? 'property.form.save' : 'property.form.submit') }}
              }
            </button>
            @if (isEdit()) {
              <a [routerLink]="['/propiedad', id()]" class="btn btn--ghost">{{ t('common.cancel') }}</a>
            } @else {
              <a routerLink="/quebec-city" class="btn btn--ghost">{{ t('common.cancel') }}</a>
            }
          </div>
        </form>
      }
    </main>
    </ng-container>
  `,
  styles: [`
    :host { display: block; min-height: 100dvh; }
    .wrap { max-width: 720px; margin: 0 auto; padding: var(--space-2xl) var(--space-lg) var(--space-4xl); }
    h1 { font-size: var(--text-3xl); margin-bottom: 6px; }
    .lead { color: var(--ink-2); font-size: var(--text-base); margin: 0 0 var(--space-sm); }

    .block { border-top: 1px solid var(--line); padding-top: var(--space-lg); margin-top: var(--space-xl); }
    .block__head { margin-bottom: var(--space-md); }
    .block__head h2 { font-size: var(--text-xl); }
    .block__head p { margin: 4px 0 0; font-size: var(--text-sm); color: var(--ink-3); }

    .field { margin-bottom: var(--space-md); }
    .field label { display: block; margin-bottom: 6px; font-size: var(--text-sm); font-weight: 500; color: var(--ink-2); }
    .field label i { color: var(--accent); font-style: normal; }
    .note { display: block; margin-top: 5px; font-size: var(--text-xs); color: var(--ink-3); }
    .note--geo { color: var(--ink-2); }
    .mono { font-family: var(--font-mono); }
    textarea.input { resize: vertical; }
    select.input { appearance: none; background-image: linear-gradient(45deg, transparent 50%, var(--ink-3) 50%), linear-gradient(135deg, var(--ink-3) 50%, transparent 50%); background-position: calc(100% - 16px) 50%, calc(100% - 11px) 50%; background-size: 5px 5px, 5px 5px; background-repeat: no-repeat; }
    input[readonly] { background: var(--surface-2); color: var(--ink-3); }

    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
    .grid3 { display: grid; grid-template-columns: 1.2fr 1.4fr 1fr; gap: var(--space-md); }
    .grid4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-md); }
    .grid-addr { display: grid; grid-template-columns: 140px 1fr; gap: var(--space-md); }

    .chips { display: flex; flex-wrap: wrap; gap: var(--space-sm); }
    .chip { font: inherit; font-size: var(--text-sm); padding: 8px 15px; border: 1px solid var(--line-2); border-radius: var(--radius-pill); background: var(--surface); color: var(--ink-2); cursor: pointer; transition: border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }
    .chip:hover { border-color: var(--ink-3); }
    .chip.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }

    .gps { display: grid; grid-template-columns: 1fr 1fr auto; gap: var(--space-md); align-items: end; }
    .gps .field { margin-bottom: 0; }

    .scan { display: flex; gap: var(--space-md); align-items: flex-start; padding: var(--space-md); background: var(--surface-2); border: 1px solid var(--line); border-radius: var(--radius-lg); cursor: pointer; }
    .scan span { display: flex; flex-direction: column; gap: 3px; font-size: var(--text-sm); color: var(--ink-2); }
    .scan strong { font-size: var(--text-base); color: var(--ink); font-weight: 500; }

    .msg { margin-top: var(--space-lg); padding: 10px 12px; border-radius: var(--radius); font-size: var(--text-sm); }
    .msg--error { background: var(--danger-050); color: var(--danger); }

    .actions { display: flex; gap: var(--space-md); margin-top: var(--space-xl); }

    /* Éxito — el expediente como tarjeta grafito (sello de datos) */
    .done { text-align: center; padding: var(--space-2xl) 0; }
    .eyebrow { font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: .08em; text-transform: uppercase; color: var(--accent); margin: 0 0 var(--space-md); }
    .exp { font-family: var(--font-mono); font-size: var(--text-2xl); font-weight: 700; letter-spacing: .04em; color: var(--on-graphite); margin: var(--space-md) auto; padding: var(--space-md) var(--space-lg); max-width: max-content; background: var(--graphite); border-radius: var(--radius-lg); }
    .done .lead { max-width: 44ch; margin: 0 auto var(--space-lg); }
    .row { display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap; }

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
  readonly statuses = PROPERTY_STATUSES;

  /**
   * Id de la ruta /propiedad/:id/editar (withComponentInputBinding).
   * Vacío en /quebec-city/nueva: es lo que distingue alta de edición.
   */
  readonly id = input<string | undefined>(undefined);
  readonly isEdit = computed(() => !!this.id());

  private readonly picker = viewChild(PhotoPickerComponent);

  readonly busy = signal(false);
  readonly geocoding = signal(false);
  readonly created = signal<string | null>(null);   // número de expediente
  readonly scanRequested = signal(false);
  readonly loadingProperty = signal(false);
  readonly expediente = signal<string | null>(null);
  readonly photos = signal<PropertyMedia[]>([]);
  readonly uploaded = signal<{ done: number; total: number } | null>(null);
  readonly photoError = signal(false);

  // Claves de traducción, no texto: los mensajes deben seguir al idioma activo.
  readonly errorKey = signal<string | null>(null);
  /** Mensaje crudo de Supabase cuando no hay clave para él. */
  readonly errorText = signal<string | null>(null);
  readonly geoMsg = signal<{ key: string; params?: Record<string, unknown> } | null>(null);

  readonly form: FormGroup = this.fb.group({
    // Estado (solo se edita; al dar de alta se publica como 'disponible')
    status: ['disponible' as PropertyStatus, Validators.required],
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

    const id = this.id();
    if (id) {
      await this.loadForEdit(id);
      return;
    }

    // Alta: el contacto se pre-llena con el perfil de quien publica.
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

  /**
   * Precarga la propiedad. Si el usuario no puede editarla, lo devuelve a la ficha:
   * es solo cortesía — quien de verdad lo impide es la política RLS del update.
   */
  private async loadForEdit(id: string): Promise<void> {
    this.loadingProperty.set(true);
    try {
      const p = await this.svc.getById(id);
      const userId = this.auth.session()?.user?.id ?? null;
      if (!p || !canEditProperty(p, userId, this.auth.role())) {
        await this.router.navigate(['/propiedad', id]);
        return;
      }

      this.expediente.set(p.expediente);
      this.photos.set(
        p.property_media
          .filter((m) => m.media_type === 'photo')
          .sort((a, b) => a.sort_order - b.sort_order),
      );

      this.form.patchValue({
        status: p.status,
        contact_first_name: p.contact_first_name,
        contact_last_name: p.contact_last_name,
        contact_phone: p.contact_phone,
        contact_email: p.contact_email,
        property_type: p.property_type,
        title: p.title,
        description: p.description,
        price: p.price,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        area: p.area,
        unit_number: p.unit_number,
        street: p.street,
        city: p.city,
        province: p.province,
        postal_code: p.postal_code,
        neighbourhood: p.neighbourhood,
        latitude: p.latitude,
        longitude: p.longitude,
      });
    } catch (e) {
      this.showError(e, 'property.form.error');
    } finally {
      this.loadingProperty.set(false);
    }
  }

  /** Borra una foto ya guardada (fila + archivo del bucket). */
  async deletePhoto(m: PropertyMedia): Promise<void> {
    try {
      await this.svc.deletePhoto(m);
      this.photos.update((rows) => rows.filter((p) => p.id !== m.id));
    } catch {
      this.errorKey.set('property.form.photoDeleteError');
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
      this.geoMsg.set({ key: 'property.form.gps.incomplete' });
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
        this.geoMsg.set({ key: 'property.form.gps.found', params: { place: r.displayName } });
      } else {
        this.geoMsg.set({ key: 'property.form.gps.notFound' });
      }
    } catch {
      this.geoMsg.set({ key: 'property.form.gps.failed' });
    } finally {
      this.geocoding.set(false);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorKey.set('property.form.invalid');
      return;
    }
    const userId = this.auth.session()?.user?.id;
    if (!userId) return;

    this.busy.set(true);
    this.errorKey.set(null);
    this.errorText.set(null);
    try {
      const v = this.form.getRawValue();
      const input: NewPropertyInput = {
        property_type: v.property_type,
        // Al dar de alta se publica; al editar, el dueño decide (así la retira del mercado).
        status: this.isEdit() ? v.status : 'disponible',
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

      const editId = this.id();
      if (editId) {
        await this.svc.update(editId, input);
        // Si fallan las fotos, no navegamos: el aviso debe verse donde está el usuario.
        if (!(await this.uploadNewPhotos(editId))) {
          this.errorKey.set('property.form.photoError');
          return;
        }
        await this.router.navigate(['/propiedad', editId]);
        return;
      }

      const property = await this.svc.create(input, userId);
      await this.uploadNewPhotos(property.id);

      if (v.request_scan) {
        await this.svc.requestScan(property.id, userId);
        this.scanRequested.set(true);
      }

      this.created.set(property.expediente);
    } catch (e) {
      this.showError(e, 'property.form.error');
    } finally {
      this.busy.set(false);
    }
  }

  /**
   * Sube las fotos nuevas del selector. Van detrás de las que ya existen.
   * Devuelve false si fallaron: la propiedad ya se guardó, así que el aviso
   * es sobre las fotos, no sobre la propiedad.
   */
  private async uploadNewPhotos(propertyId: string): Promise<boolean> {
    const files = this.picker()?.files() ?? [];
    if (!files.length) return true;

    const startOrder = this.photos().reduce((max, p) => Math.max(max, p.sort_order + 1), 0);
    try {
      this.uploaded.set({ done: 0, total: files.length });
      await this.svc.uploadPhotos(propertyId, files, {
        startOrder,
        onProgress: (done, total) => this.uploaded.set({ done, total }),
      });
      this.picker()?.clear();
      return true;
    } catch {
      this.photoError.set(true);
      return false;
    } finally {
      this.uploaded.set(null);
    }
  }

  /** Con mensaje de Supabase se muestra tal cual; sin él, la clave genérica. */
  private showError(e: unknown, fallbackKey: string): void {
    const raw = errorMessage(e, '');
    this.errorKey.set(raw ? null : fallbackKey);
    this.errorText.set(raw || null);
  }

  reset(): void {
    this.created.set(null);
    this.scanRequested.set(false);
    this.geoMsg.set(null);
    this.photoError.set(false);
    this.uploaded.set(null);
    this.errorKey.set(null);
    this.errorText.set(null);
    this.form.reset({
      property_type: 'apartamento',
      city: 'Montréal',
      province: 'QC',
      request_scan: true,
    });
    void this.ngOnInit();
  }
}
