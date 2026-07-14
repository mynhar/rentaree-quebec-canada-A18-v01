import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../core/supabase/supabase.service';
import {
  CaProvince,
  MediaType,
  Property,
  PropertyStatus,
  PropertyType,
} from '../../core/models/database.types';
import { PropertyFilters } from './property-filters';

export interface PropertyCardMedia {
  storage_path: string | null;
  media_type: MediaType;
  sort_order: number;
}

export interface PropertyCard extends Property {
  property_media?: PropertyCardMedia[];
}

/** Datos para crear una propiedad (sin expediente: lo pone el trigger). */
export interface NewPropertyInput {
  property_type: PropertyType;
  status: PropertyStatus;
  title: string | null;
  description: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  area_unit: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_phone: string;
  contact_email: string;
  unit_number: string | null;
  street: string;
  city: string;
  province: CaProvince;
  postal_code: string;
  neighbourhood: string | null;
  latitude: number | null;
  longitude: number | null;
}

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly sb = inject(SupabaseService).client;

  /** Busca propiedades aplicando los filtros. RLS ya limita lo visible. */
  async search(filters: PropertyFilters, userId: string | null): Promise<PropertyCard[]> {
    let q = this.sb
      .from('properties')
      .select('*, property_media(storage_path, media_type, sort_order)')
      .order('created_at', { ascending: false });

    if (filters.onlyMine && userId) {
      q = q.eq('owner_id', userId);
    } else {
      q = q.eq('status', 'disponible');
    }

    if (filters.types.length) q = q.in('property_type', filters.types);
    if (filters.priceMin != null) q = q.gte('price', filters.priceMin);
    if (filters.priceMax != null) q = q.lte('price', filters.priceMax);

    const t = filters.text?.trim().replace(/[,()]/g, '');
    if (t) {
      const like = `%${t}%`;
      q = q.or(`city.ilike.${like},street.ilike.${like},neighbourhood.ilike.${like}`);
    }

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as PropertyCard[];
  }

  /** URL pública de una foto almacenada en el bucket property-photos. */
  photoUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    const { data } = this.sb.storage.from('property-photos').getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Crea una propiedad. El expediente (EXP-AAAAMM-DD-NNNN) lo genera el trigger
   * de la base de datos, así que NO se envía desde aquí.
   */
  async create(input: NewPropertyInput, ownerId: string): Promise<Property> {
    const { data, error } = await this.sb
      .from('properties')
      .insert({ ...input, owner_id: ownerId })
      .select()
      .single();
    if (error) throw error;
    return data as Property;
  }

  /** Solicita la visita de escaneo 3D para una propiedad. */
  async requestScan(propertyId: string, requestedBy: string, notes?: string | null): Promise<void> {
    const { error } = await this.sb.from('scan_requests').insert({
      property_id: propertyId,
      requested_by: requestedBy,
      status: 'solicitado',
      notes: notes ?? null,
    });
    if (error) throw error;
  }
}
