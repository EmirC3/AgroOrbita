// Cliente con la llave de servicio: SALTA las reglas RLS.
// Solo para cálculos agregados que no exponen datos personales (RF-014: factor de ajuste).
// Nunca lo importes en un componente de cliente ni devuelvas filas crudas con él.
import { createClient } from "@supabase/supabase-js";

export function crearClienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const llave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !llave) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  return createClient(url, llave, { auth: { persistSession: false } });
}
