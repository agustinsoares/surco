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
