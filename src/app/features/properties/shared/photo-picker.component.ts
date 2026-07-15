import {
  Component,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { PropertyService } from '../property.service';
import { PropertyMedia } from '../../../core/models/database.types';
import {
  PHOTO_ACCEPT,
  PHOTO_MAX_BYTES,
  PHOTO_MAX_COUNT,
  PHOTO_MIME_TYPES,
} from '../../../core/config/constants';

/** Foto elegida pero todavía no subida. */
interface StagedPhoto {
  id: string;
  file: File;
  url: string; // object URL para la miniatura
}

/** Archivo rechazado: clave + parámetros, para poder re-traducir el motivo. */
interface RejectedFile {
  key: string;
  params: { name: string; mb?: number; max?: number };
}

/**
 * Selector de fotos: arrastrar y soltar, miniaturas, reordenar y eliminar.
 * No sube nada por su cuenta — expone las fotos elegidas con `staged()` y el
 * componente padre las sube cuando ya existe el id de la propiedad
 * (en el formulario la propiedad todavía no existe al elegir las fotos).
 *
 * `existing` son las fotos ya guardadas; se borran al momento (`existingRemove`).
 * La primera de la galería es la portada de la tarjeta.
 */
@Component({
  selector: 'app-photo-picker',
  standalone: true,
  imports: [TranslocoDirective],
  template: `
    <ng-container *transloco="let t">
    <div
      class="drop"
      [class.drop--over]="dragOver()"
      [class.drop--off]="full() || disabled()"
      (dragover)="onDragOver($event)"
      (dragleave)="dragOver.set(false)"
      (drop)="onDrop($event)"
    >
      <input
        #input
        type="file"
        multiple
        [accept]="accept"
        [disabled]="full() || disabled()"
        (change)="onInput($event)"
        hidden
      />
      <p class="drop__title">{{ t('property.photos.dropTitle') }}</p>
      <p class="drop__note">
        {{ t('property.photos.dropNote', { mb: maxMb, max: maxCount }) }}
      </p>
      <button
        type="button"
        class="btn btn--ghost"
        [disabled]="full() || disabled()"
        (click)="input.click()"
      >
        {{ t('property.photos.choose') }}
      </button>
      @if (full()) {
        <p class="drop__note">{{ t('property.photos.full', { max: maxCount }) }}</p>
      }
    </div>

    <!-- Los rechazos guardan clave + parámetros: se re-traducen al cambiar de idioma. -->
    @for (r of rejected(); track r.key + r.params.name) {
      <p class="msg msg--error">{{ t(r.key, r.params) }}</p>
    }

    @if (count() > 0) {
      <ul class="thumbs">
        @for (m of existing(); track m.id; let i = $index) {
          <li class="thumb">
            <img [src]="photoUrl(m)" alt="" />
            @if (i === 0) { <span class="cover">{{ t('property.photos.cover') }}</span> }
            <span class="saved">{{ t('property.photos.saved') }}</span>
            <div class="thumb__bar">
              <button type="button" class="icon icon--del" [disabled]="disabled()"
                (click)="existingRemove.emit(m)"
                [attr.aria-label]="t('property.photos.removeSaved')">×</button>
            </div>
          </li>
        }

        @for (p of staged(); track p.id; let i = $index; let last = $last) {
          <li class="thumb">
            <img [src]="p.url" [alt]="p.file.name" />
            @if (existing().length === 0 && i === 0) {
              <span class="cover">{{ t('property.photos.cover') }}</span>
            }
            <div class="thumb__bar">
              <button type="button" class="icon" [disabled]="i === 0 || disabled()"
                (click)="move(i, -1)" [attr.aria-label]="t('property.photos.movePrev')">‹</button>
              <button type="button" class="icon" [disabled]="last || disabled()"
                (click)="move(i, 1)" [attr.aria-label]="t('property.photos.moveNext')">›</button>
              <button type="button" class="icon icon--del" [disabled]="disabled()"
                (click)="remove(i)" [attr.aria-label]="t('property.photos.remove')">×</button>
            </div>
          </li>
        }
      </ul>
      <p class="note">{{ t('property.photos.count', { count: count(), max: maxCount }) }}</p>
    }
    </ng-container>
  `,
  styles: [`
    :host { display: block; }

    .drop {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 26px 20px; text-align: center;
      background: var(--surface-2);
      border: 1px dashed var(--line-2); border-radius: var(--radius-lg);
      transition: border-color .15s ease, background .15s ease;
    }
    .drop--over { border-color: var(--accent); background: var(--accent-050); }
    .drop--off { opacity: .6; }
    .drop__title { margin: 0; font-size: 14.5px; font-weight: 500; }
    .drop__note { margin: 0; font-size: 12px; color: var(--ink-3); }

    .thumbs {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(116px, 1fr));
      gap: 10px; list-style: none; margin: 14px 0 0; padding: 0;
    }
    .thumb {
      position: relative; aspect-ratio: 4 / 3; overflow: hidden;
      border: 1px solid var(--line-2); border-radius: var(--radius);
      background: var(--surface-2);
    }
    .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .cover, .saved {
      position: absolute; top: 6px; font-family: var(--font-mono);
      font-size: 10px; letter-spacing: .04em; text-transform: uppercase;
      padding: 3px 6px; border-radius: 4px;
    }
    .cover { left: 6px; background: var(--accent); color: var(--accent-ink); }
    .saved { right: 6px; background: var(--overlay); color: var(--accent-ink); }

    .thumb__bar {
      position: absolute; inset: auto 0 0 0;
      display: flex; justify-content: center; gap: 2px; padding: 4px;
      background: linear-gradient(transparent, var(--overlay));
      opacity: 0; transition: opacity var(--dur-fast) var(--ease-out);
    }
    .thumb:hover .thumb__bar, .thumb:focus-within .thumb__bar { opacity: 1; }

    .icon {
      width: 26px; height: 26px; display: grid; place-items: center;
      font: inherit; font-size: 15px; line-height: 1; color: var(--accent-ink);
      background: var(--overlay); border: 0; border-radius: 6px; cursor: pointer;
    }
    .icon:hover:not(:disabled) { background: var(--ink); }
    .icon:disabled { opacity: .35; cursor: not-allowed; }
    .icon--del:hover:not(:disabled) { background: var(--danger); }

    .note { margin: 10px 0 0; font-size: 12px; color: var(--ink-3); }
    .msg { margin-top: 10px; padding: 8px 12px; border-radius: var(--radius); font-size: 13px; }
    .msg--error { background: var(--danger-050); color: var(--danger); }
  `],
})
export class PhotoPickerComponent implements OnDestroy {
  private readonly svc = inject(PropertyService);

  /** Fotos ya subidas (vacío en el formulario de alta). */
  readonly existing = input<PropertyMedia[]>([]);
  readonly disabled = input(false);

  /** El padre pide borrar una foto ya guardada. */
  readonly existingRemove = output<PropertyMedia>();

  readonly staged = signal<StagedPhoto[]>([]);
  readonly rejected = signal<RejectedFile[]>([]);
  readonly dragOver = signal(false);

  readonly accept = PHOTO_ACCEPT;
  readonly maxCount = PHOTO_MAX_COUNT;
  readonly maxMb = PHOTO_MAX_BYTES / 1024 / 1024;

  readonly count = computed(() => this.existing().length + this.staged().length);
  readonly full = computed(() => this.count() >= PHOTO_MAX_COUNT);

  /** Los archivos a subir, en el orden elegido. */
  files(): File[] {
    return this.staged().map((p) => p.file);
  }

  /** Tras subirlas, el padre limpia la selección. */
  clear(): void {
    this.staged().forEach((p) => URL.revokeObjectURL(p.url));
    this.staged.set([]);
    this.rejected.set([]);
  }

  ngOnDestroy(): void {
    this.staged().forEach((p) => URL.revokeObjectURL(p.url));
  }

  photoUrl(m: PropertyMedia): string {
    return this.svc.photoUrl(m.storage_path) ?? '';
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    if (!this.full() && !this.disabled()) this.dragOver.set(true);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(false);
    if (this.full() || this.disabled()) return;
    this.add(Array.from(e.dataTransfer?.files ?? []));
  }

  onInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.add(Array.from(input.files ?? []));
    input.value = ''; // permite volver a elegir el mismo archivo
  }

  move(i: number, dir: -1 | 1): void {
    this.staged.update((rows) => {
      const next = [...rows];
      const j = i + dir;
      if (j < 0 || j >= next.length) return rows;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  remove(i: number): void {
    const p = this.staged()[i];
    if (p) URL.revokeObjectURL(p.url);
    this.staged.update((rows) => rows.filter((_, idx) => idx !== i));
  }

  /** Valida tipo, tamaño y cupo; lo que no pasa se explica al usuario. */
  private add(files: File[]): void {
    const errors: RejectedFile[] = [];
    const ok: StagedPhoto[] = [];
    let room = PHOTO_MAX_COUNT - this.count();

    for (const file of files) {
      if (!PHOTO_MIME_TYPES.includes(file.type)) {
        errors.push({ key: 'property.photos.rejected.type', params: { name: file.name } });
      } else if (file.size > PHOTO_MAX_BYTES) {
        errors.push({
          key: 'property.photos.rejected.size',
          params: { name: file.name, mb: this.maxMb },
        });
      } else if (room <= 0) {
        errors.push({
          key: 'property.photos.rejected.max',
          params: { name: file.name, max: PHOTO_MAX_COUNT },
        });
      } else {
        room--;
        ok.push({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) });
      }
    }

    this.rejected.set(errors);
    if (ok.length) this.staged.update((rows) => [...rows, ...ok]);
  }
}
