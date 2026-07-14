import { CaProvince, PropertyStatus, PropertyType } from '../models/database.types';

// Provincias y territorios de Canadá (QC primero, es el predeterminado).
// Los nombres viven en los JSON de i18n: aquí solo va la clave.
export const CA_PROVINCES: { code: CaProvince; labelKey: string }[] = [
  'QC', 'ON', 'BC', 'AB', 'MB', 'SK', 'NS',
  'NB', 'NL', 'PE', 'NT', 'YT', 'NU',
].map((code) => ({ code: code as CaProvince, labelKey: `provinces.${code}` }));

// Tipos de propiedad. La etiqueta se traduce; el valor es el del enum de la base.
export const PROPERTY_TYPES: { value: PropertyType; labelKey: string }[] = [
  'cuarto', 'casa', 'apartamento', 'edificio', 'comercial', 'condominio', 'otro',
].map((value) => ({ value: value as PropertyType, labelKey: `property.types.${value}` }));

// Estados de una propiedad. El dueño la retira del mercado cambiando de estado.
export const PROPERTY_STATUSES: PropertyStatus[] = [
  'borrador',
  'disponible',
  'alquilada',
  'inactiva',
];

/** Clave de traducción del tipo de una propiedad. */
export function propertyTypeKey(type: PropertyType): string {
  return `property.types.${type}`;
}

// Coordenadas de respaldo para centrar el mapa si no hay geolocalización.
export const DEFAULT_MAP_CENTER = { lat: 45.5019, lng: -73.5674 }; // Montréal

// Fotos de propiedades (bucket property-photos).
export const PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const PHOTO_ACCEPT = '.jpg,.jpeg,.png,.webp';
export const PHOTO_MAX_BYTES = 8 * 1024 * 1024; // 8 MB por foto
export const PHOTO_MAX_COUNT = 15;              // por propiedad
