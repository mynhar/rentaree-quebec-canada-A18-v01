import { CaProvince, PropertyType } from '../models/database.types';

// Provincias y territorios de Canadá (QC primero, es el predeterminado).
export const CA_PROVINCES: { code: CaProvince; name: string }[] = [
  { code: 'QC', name: 'Québec' },
  { code: 'ON', name: 'Ontario' },
  { code: 'BC', name: 'Colombie-Britannique' },
  { code: 'AB', name: 'Alberta' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'NS', name: 'Nouvelle-Écosse' },
  { code: 'NB', name: 'Nouveau-Brunswick' },
  { code: 'NL', name: 'Terre-Neuve-et-Labrador' },
  { code: 'PE', name: 'Île-du-Prince-Édouard' },
  { code: 'NT', name: 'Territoires du Nord-Ouest' },
  { code: 'YT', name: 'Yukon' },
  { code: 'NU', name: 'Nunavut' },
];

// Tipos de propiedad.
export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'cuarto', label: 'Cuarto' },
  { value: 'casa', label: 'Casa' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'edificio', label: 'Edificio' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'condominio', label: 'Condominio' },
  { value: 'otro', label: 'Otro' },
];

// Coordenadas de respaldo para centrar el mapa si no hay geolocalización.
export const DEFAULT_MAP_CENTER = { lat: 45.5019, lng: -73.5674 }; // Montréal

// Fotos de propiedades (bucket property-photos).
export const PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const PHOTO_ACCEPT = '.jpg,.jpeg,.png,.webp';
export const PHOTO_MAX_BYTES = 8 * 1024 * 1024; // 8 MB por foto
export const PHOTO_MAX_COUNT = 15;              // por propiedad
