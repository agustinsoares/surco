// ===========================================================================
// CLIENTE DE SUPABASE (desactivado)
// ---------------------------------------------------------------------------
// La app ahora usa la base local (src/lib/local/). Este archivo se dejó
// comentado para poder volver a Supabase. Ver docs/datos-supabase.md.
// ===========================================================================
/*
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con la service role key: solo se usa en Server Actions del panel
// de administración (borrar un usuario de auth.users, por ejemplo), NUNCA
// se expone al navegador. Requiere SUPABASE_SERVICE_ROLE_KEY en el entorno.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
*/

export {};
