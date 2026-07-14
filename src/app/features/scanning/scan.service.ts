import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../core/supabase/supabase.service';
import {
  Profile,
  Property,
  PropertyDimension,
  ScanRequest,
  ScanStatus,
} from '../../core/models/database.types';

/** Solicitud con la propiedad embebida (para listarlas con contexto). */
export interface ScanRequestFull extends ScanRequest {
  properties: Property;
}

/** Fila de dimensión que el escáner registra tras el escaneo. */
export interface DimensionInput {
  room_name: string;
  width: number | null;
  length: number | null;
  area: number | null;
  unit: string;
}

@Injectable({ providedIn: 'root' })
export class ScanService {
  private readonly sb = inject(SupabaseService).client;

  /**
   * Solicitudes visibles. RLS ya filtra: el escáner ve las suyas,
   * el administrador ve todas.
   */
  async listRequests(): Promise<ScanRequestFull[]> {
    const { data, error } = await this.sb
      .from('scan_requests')
      .select('*, properties(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as ScanRequestFull[];
  }

  async updateStatus(
    id: string,
    status: ScanStatus,
    scheduledAt?: string | null,
  ): Promise<void> {
    const patch: Record<string, unknown> = { status };
    if (scheduledAt !== undefined) patch['scheduled_at'] = scheduledAt;
    const { error } = await this.sb.from('scan_requests').update(patch).eq('id', id);
    if (error) throw error;
  }

  /** Guarda el enlace del recorrido 3D (Matterport) de una propiedad. */
  async saveTour(propertyId: string, embedUrl: string): Promise<void> {
    // Sustituye el recorrido anterior, si lo hubiera.
    await this.sb
      .from('property_media')
      .delete()
      .eq('property_id', propertyId)
      .eq('media_type', 'tour_3d');

    const { error } = await this.sb.from('property_media').insert({
      property_id: propertyId,
      media_type: 'tour_3d',
      embed_url: embedUrl,
      sort_order: 0,
    });
    if (error) throw error;
  }

  async listDimensions(propertyId: string): Promise<PropertyDimension[]> {
    const { data, error } = await this.sb
      .from('property_dimensions')
      .select('*')
      .eq('property_id', propertyId);
    if (error) throw error;
    return (data ?? []) as PropertyDimension[];
  }

  /** Reemplaza las dimensiones de la propiedad y actualiza la superficie total. */
  async saveDimensions(propertyId: string, rows: DimensionInput[]): Promise<void> {
    const { error: delErr } = await this.sb
      .from('property_dimensions')
      .delete()
      .eq('property_id', propertyId);
    if (delErr) throw delErr;

    const clean = rows.filter((r) => r.room_name.trim() !== '');
    if (clean.length) {
      const { error } = await this.sb
        .from('property_dimensions')
        .insert(clean.map((r) => ({ ...r, property_id: propertyId })));
      if (error) throw error;
    }

    // Superficie total = suma de los ambientes (la que se muestra en la tarjeta).
    const total = clean.reduce((sum, r) => sum + (r.area ?? 0), 0);
    if (total > 0) {
      const { error } = await this.sb
        .from('properties')
        .update({ area: Number(total.toFixed(2)), area_unit: 'm2' })
        .eq('id', propertyId);
      if (error) throw error;
    }
  }

  // --- Solo administrador ---

  async listProfiles(): Promise<Profile[]> {
    const { data, error } = await this.sb
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Profile[];
  }

  async setRole(userId: string, role: Profile['role']): Promise<void> {
    const { error } = await this.sb.from('profiles').update({ role }).eq('id', userId);
    if (error) throw error;
  }

  /** Asigna un escáner a la solicitud y a la propiedad (para que pueda editarla). */
  async assignScanner(
    requestId: string,
    propertyId: string,
    scannerId: string | null,
  ): Promise<void> {
    const { error: e1 } = await this.sb
      .from('scan_requests')
      .update({ scanner_id: scannerId, status: scannerId ? 'agendado' : 'solicitado' })
      .eq('id', requestId);
    if (e1) throw e1;

    const { error: e2 } = await this.sb
      .from('properties')
      .update({ scanned_by: scannerId })
      .eq('id', propertyId);
    if (e2) throw e2;
  }
}
