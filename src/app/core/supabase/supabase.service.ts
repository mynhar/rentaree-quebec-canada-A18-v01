import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Envuelve el cliente de @supabase/supabase-js como singleton de Angular.
 * Inyecta este servicio y usa `.client` para acceder a auth, from(), storage, etc.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // procesa el redirect de Google OAuth
        flowType: 'pkce',
      },
    },
  );
}
