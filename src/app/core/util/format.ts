import { signal } from '@angular/core';

// Utilidades de formato. La moneda es siempre CAD; lo que cambia con el idioma
// es el locale: fr-CA (1 650 $), en-CA ($1,650), es-CA.

/**
 * Locale activo. Lo escribe LanguageService al cambiar de idioma.
 *
 * Es una señal, no una constante, para que los `computed()` que llaman a
 * formatCAD()/formatDate() se recalculen solos al cambiar el idioma: así los
 * precios de las tarjetas y los pines del mapa se reformatean sin recargar.
 */
const activeLocale = signal('fr-CA');

export function setActiveLocale(locale: string): void {
  activeLocale.set(locale);
}

/** 1650 -> "1 650 $" en fr-CA, "$1,650" en en-CA. */
export function formatCAD(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat(activeLocale(), {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Fecha ISO -> fecha larga en el idioma activo (14 juillet 2026). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(activeLocale(), { dateStyle: 'long' }).format(d);
}

/** Combina unidad + calle + ciudad: "5-123 Main St, Montréal". */
export function buildAddress(p: {
  unit_number?: string | null;
  street: string;
  city: string;
}): string {
  const base = p.unit_number ? `${p.unit_number}-${p.street}` : p.street;
  return `${base}, ${p.city}`;
}
