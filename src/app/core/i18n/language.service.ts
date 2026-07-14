import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { SupabaseService } from '../supabase/supabase.service';
import { AppLanguage } from '../models/database.types';
import { setActiveLocale } from '../util/format';

export const LANGUAGES: AppLanguage[] = ['fr', 'en', 'es'];
export const DEFAULT_LANGUAGE: AppLanguage = 'fr';

/** Locale regional por idioma: la moneda siempre es CAD, cambia el formato. */
const LOCALES: Record<AppLanguage, string> = {
  fr: 'fr-CA',
  en: 'en-CA',
  es: 'es-CA',
};

const STORAGE_KEY = 'rentaree.lang';

/**
 * Idioma activo de la interfaz.
 *
 * Orden al arrancar: (1) preferencia guardada en localStorage, (2) idioma del
 * navegador si es en o es, (3) 'fr'. La preferencia del perfil (columna
 * profiles.language) llega después, al cargar la sesión: la aplica AuthService
 * llamando a `applyFromProfile()`, porque el perfil solo se conoce tras el login.
 *
 * No inyecta AuthService — sería una dependencia circular. Para persistir en la
 * base lee el usuario de la sesión de Supabase.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly sb = inject(SupabaseService).client;

  readonly lang = signal<AppLanguage>(DEFAULT_LANGUAGE);

  constructor() {
    this.apply(this.initial());
  }

  /** Cambio desde la interfaz: aplica, guarda en localStorage y en el perfil. */
  set(lang: AppLanguage): void {
    if (lang === this.lang()) return;
    this.apply(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    void this.persistToProfile(lang);
  }

  /**
   * Idioma guardado en el perfil, al iniciar sesión. No se re-guarda en la base;
   * solo se refleja en la interfaz y en localStorage para el próximo arranque.
   */
  applyFromProfile(lang: AppLanguage | null | undefined): void {
    if (!lang || !LANGUAGES.includes(lang) || lang === this.lang()) return;
    this.apply(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  private apply(lang: AppLanguage): void {
    this.lang.set(lang);
    this.transloco.setActiveLang(lang);
    setActiveLocale(LOCALES[lang]);   // precios y fechas siguen al idioma
    document.documentElement.lang = lang;
  }

  private initial(): AppLanguage {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.includes(saved as AppLanguage)) return saved as AppLanguage;

    const nav = navigator.language?.slice(0, 2).toLowerCase();
    if (nav === 'en' || nav === 'es') return nav;

    return DEFAULT_LANGUAGE;
  }

  /** Silencioso a propósito: si falla, el idioma ya está aplicado y en localStorage. */
  private async persistToProfile(lang: AppLanguage): Promise<void> {
    const { data } = await this.sb.auth.getSession();
    const userId = data.session?.user?.id;
    if (!userId) return;
    await this.sb.from('profiles').update({ language: lang }).eq('id', userId);
  }
}
