// Cliente Drizzle con conexión directa a Postgres (DATABASE_URL).
// OJO: esta conexión NO pasa por las reglas RLS. Úsala solo para scripts y tareas
// de administración. Las rutas de la API usan el cliente de Supabase (lib/supabase/server.ts)
// para que cada agricultor vea solo lo suyo (RNF-004).
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Falta DATABASE_URL en .env.local");

// prepare: false es necesario con el pooler de Supabase (modo transaction).
const conexion = postgres(url, { prepare: false });

export const db = drizzle(conexion, { schema });
