// Tipos que reflejan el esquema de la base de datos (Fase 1).

export type UserRole = 'cliente' | 'escaner' | 'administrador';

/** Idiomas de la interfaz. Francés es el predeterminado (Quebec). */
export type AppLanguage = 'fr' | 'en' | 'es';

export type PropertyType =
  | 'cuarto'
  | 'casa'
  | 'apartamento'
  | 'edificio'
  | 'comercial'
  | 'condominio'
  | 'otro';

export type PropertyStatus = 'borrador' | 'disponible' | 'alquilada' | 'inactiva';

export type MediaType = 'photo' | 'video_3d' | 'tour_3d' | 'floor_plan';

export type ScanStatus = 'solicitado' | 'agendado' | 'completado' | 'cancelado';

export type CaProvince =
  | 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'NT'
  | 'NU' | 'ON' | 'PE' | 'QC' | 'SK' | 'YT';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: UserRole;
  /** Idioma preferido. Null mientras el usuario no elija uno. */
  language: AppLanguage | null;
  created_at: string;
}

export interface Property {
  id: string;
  expediente: string | null;
  owner_id: string;
  property_type: PropertyType;
  status: PropertyStatus;
  title: string | null;
  description: string | null;
  price: number | null;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  area_unit: string | null;
  contact_first_name: string;
  contact_last_name: string;
  contact_phone: string;
  contact_email: string;
  unit_number: string | null;
  street: string;
  city: string;
  province: CaProvince;
  postal_code: string;
  country: string;
  neighbourhood: string | null;
  latitude: number | null;
  longitude: number | null;
  scanned_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyMedia {
  id: string;
  property_id: string;
  media_type: MediaType;
  storage_path: string | null;
  embed_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface PropertyDimension {
  id: string;
  property_id: string;
  room_name: string;
  area: number | null;
  width: number | null;
  length: number | null;
  height: number | null;
  unit: string;
}

export interface ScanRequest {
  id: string;
  property_id: string;
  requested_by: string;
  scanner_id: string | null;
  status: ScanStatus;
  scheduled_at: string | null;
  notes: string | null;
  created_at: string;
}
