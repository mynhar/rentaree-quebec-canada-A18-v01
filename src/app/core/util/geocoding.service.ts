import { Injectable } from '@angular/core';

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

/**
 * Geocodificación con Nominatim (OpenStreetMap): gratuito y sin API key.
 * Política de uso: máx. 1 petición por segundo (por eso solo se llama bajo demanda,
 * con el botón "Buscar coordenadas", no en cada tecleo).
 * Para producción con alto volumen, cambia a un proveedor con contrato
 * (MapTiler, Mapbox, Google) sustituyendo el fetch de aquí.
 */
@Injectable({ providedIn: 'root' })
export class GeocodingService {
  async geocode(parts: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  }): Promise<GeocodeResult | null> {
    const params = new URLSearchParams({
      street: parts.street,
      city: parts.city,
      state: parts.province,
      postalcode: parts.postalCode,
      country: 'Canada',
      format: 'json',
      limit: '1',
    });

    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'Accept-Language': 'fr-CA' },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;
    if (!data.length) return null;

    return {
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
      displayName: data[0].display_name,
    };
  }
}
