import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Marca una URL como segura para usar en [src] de un <iframe>.
 * Solo se aceptan dominios de recorridos 3D conocidos; cualquier otra URL
 * se descarta para no abrir la puerta a contenido arbitrario.
 */
const ALLOWED = [
  'my.matterport.com',
  'matterport.com',
  'kuula.co',
  'poly.cam',
];

@Pipe({ name: 'safeTourUrl', standalone: true })
export class SafeTourUrlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(url: string | null | undefined): SafeResourceUrl | null {
    if (!url) return null;
    let host: string;
    try {
      host = new URL(url).hostname;
    } catch {
      return null;
    }
    const ok = ALLOWED.some((d) => host === d || host.endsWith(`.${d}`));
    return ok ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  }
}
