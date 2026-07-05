import { Injectable, computed, inject, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';
import { Profile, UserRole } from '../models/database.types';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sb = inject(SupabaseService).client;

  // Estado reactivo
  readonly session = signal<Session | null>(null);
  readonly profile = signal<Profile | null>(null);
  readonly loading = signal(true);

  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly role = computed<UserRole | null>(() => this.profile()?.role ?? null);

  /** True si entró con Google y aún no tiene teléfono: pedir completar perfil. */
  readonly needsProfileCompletion = computed(() => {
    const p = this.profile();
    return !!p && (!p.phone || p.phone.trim() === '');
  });

  private readonly ready: Promise<void>;

  constructor() {
    this.ready = this.init();

    // Mantiene el estado sincronizado ante login/logout/refresh y el redirect de OAuth.
    this.sb.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      if (session?.user) {
        void this.loadProfile(session.user.id);
      } else {
        this.profile.set(null);
      }
    });
  }

  /** Los guards esperan esta promesa antes de decidir. */
  whenReady(): Promise<void> {
    return this.ready;
  }

  private async init(): Promise<void> {
    const { data } = await this.sb.auth.getSession();
    this.session.set(data.session);
    if (data.session?.user) {
      await this.loadProfile(data.session.user.id);
    }
    this.loading.set(false);
  }

  async loadProfile(userId: string): Promise<void> {
    const { data, error } = await this.sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) {
      this.profile.set(data as Profile);
    }
  }

  // --- Autenticación ---

  signUpWithEmail(d: SignUpData) {
    return this.sb.auth.signUp({
      email: d.email,
      password: d.password,
      options: {
        data: { first_name: d.firstName, last_name: d.lastName, phone: d.phone },
      },
    });
  }

  signInWithEmail(email: string, password: string) {
    return this.sb.auth.signInWithPassword({ email, password });
  }

  signInWithGoogle() {
    return this.sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/quebec-city`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    });
  }

  async signOut(): Promise<void> {
    await this.sb.auth.signOut();
    this.profile.set(null);
    this.session.set(null);
  }

  /** Completa el teléfono tras el primer login con Google. */
  async completeProfilePhone(phone: string): Promise<void> {
    const userId = this.session()?.user?.id;
    if (!userId) return;
    const { error } = await this.sb
      .from('profiles')
      .update({ phone })
      .eq('id', userId);
    if (!error) {
      await this.loadProfile(userId);
    }
  }
}
