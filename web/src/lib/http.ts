// Utilidades comunes para los Route Handlers.
import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { crearClienteServidor } from "@/lib/supabase/server";

export function ok<T>(datos: T, status = 200) {
  return NextResponse.json(datos, { status });
}

export function error(status: number, mensaje: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: mensaje, ...extra }, { status });
}

// Mensaje claro con el campo que falta (RF-011: "impedir guardar e indicar cuál falta").
export function errorValidacion(e: ZodError) {
  const campos = e.issues.map((i) => ({ campo: i.path.join("."), mensaje: i.message }));
  return error(422, "Revisa los datos marcados.", { campos });
}

// Devuelve el cliente con sesión y el usuario, o una respuesta 401 lista para regresar.
export async function requiereUsuario() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, user: null, respuesta: error(401, "Inicia sesión para continuar.") };
  }
  return { supabase, user, respuesta: null };
}
