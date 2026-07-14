import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../core/supabase/supabase.service';
import {
  CaProvince,
  MediaType,
  Property,
  PropertyDimension,
  PropertyMedia,
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

/** Propiedad completa para la ficha: con medios y dimensiones. */
export interface PropertyDetail extends Property {
  property_media: PropertyMedia[];
  property_dimensions: PropertyDimension[];
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

  /** URL pública de un video en el bucket property-videos. */
  videoUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    const { data } = this.sb.storage.from('property-videos').getPublicUrl(path);
    return data.publicUrl;
  }

  /** Trae una propiedad con sus medios y dimensiones (para la ficha). */
  async getById(id: string): Promise<PropertyDetail | null> {
    const { data, error } = await this.sb
      .from('properties')
      .select('*, property_media(*), property_dimensions(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return (data as PropertyDetail | null) ?? null;
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

  // --- Fotos (bucket property-photos + filas en property_media) ---

  /** Fotos ya guardadas de una propiedad, en orden de portada. */
  async listPhotos(propertyId: string): Promise<PropertyMedia[]> {
    const { data, error } = await this.sb
      .from('property_media')
      .select('*')
      .eq('property_id', propertyId)
      .eq('media_type', 'photo')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []) as PropertyMedia[];
  }

  /**
   * Sube las fotos al bucket y crea sus filas en property_media.
   * El orden del array es el orden de la galería: la primera es la portada.
   * `startOrder` permite añadir fotos detrás de las que ya existen.
   * Si una subida falla, se borran los archivos ya subidos para no dejar huérfanos.
   */
  async uploadPhotos(
    propertyId: string,
    files: File[],
    opts: { startOrder?: number; onProgress?: (done: number, total: number) => void } = {},
  ): Promise<void> {
    if (!files.length) return;
    const { startOrder = 0, onProgress } = opts;
    const bucket = this.sb.storage.from('property-photos');
    const paths: string[] = [];

    try {
      for (const [i, file] of files.entries()) {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${propertyId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await bucket.upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
        if (error) throw error;
        paths.push(path);
        onProgress?.(i + 1, files.length);
      }

      const { error } = await this.sb.from('property_media').insert(
        paths.map((storage_path, i) => ({
          property_id: propertyId,
          media_type: 'photo' as MediaType,
          storage_path,
          sort_order: startOrder + i,
        })),
      );
      if (error) throw error;
    } catch (e) {
      if (paths.length) await bucket.remove(paths);
      throw e;
    }
  }

  /** Borra una foto: primero la fila, luego el archivo del bucket. */
  async deletePhoto(media: PropertyMedia): Promise<void> {
    const { error } = await this.sb.from('property_media').delete().eq('id', media.id);
    if (error) throw error;
    if (media.storage_path) {
      await this.sb.storage.from('property-photos').remove([media.storage_path]);
    }
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
