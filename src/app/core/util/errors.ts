/**
 * Mensaje legible de un error cualquiera.
 *
 * Los errores de Supabase (PostgrestError, StorageError) son objetos planos con
 * `message`, NO instancias de Error: un `e instanceof Error` los descarta y deja
 * al usuario sin saber qué falló. Usa esto en los catch que muestran el error.
 */
export function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === 'object' && e !== null) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === 'string' && m) return m;
  }
  return fallback;
}
