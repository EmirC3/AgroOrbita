// Lee los JSON precalculados de public/data/ (los copia scripts/sync_datos_a_web.py).
// Solo se usa en el servidor (Server Components y Route Handlers).
import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  ArchivoMunicipios,
  ArchivoRotaciones,
  ArchivoSuelos,
  ContextoAsistente,
  Cultivo,
  Metricas,
  Municipio,
  ResultadoCultivo,
  Suelo,
} from "@/types/datos";

const DIR_DATOS = path.join(process.cwd(), "public", "data");

// Evita rutas como "../../.env": solo letras minúsculas, números y guion bajo.
const SLUG_VALIDO = /^[a-z0-9_]+$/;

export function esSlugValido(slug: string): boolean {
  return SLUG_VALIDO.test(slug);
}

async function leerJson<T>(rutaRelativa: string): Promise<T | null> {
  try {
    const texto = await readFile(path.join(DIR_DATOS, rutaRelativa), "utf-8");
    return JSON.parse(texto) as T;
  } catch {
    return null; // archivo inexistente o mal formado: la pantalla muestra "sin dato"
  }
}

export async function getMunicipios(): Promise<Municipio[]> {
  const archivo = await leerJson<ArchivoMunicipios>("municipios.json");
  return archivo?.municipios ?? [];
}

export async function getMunicipio(slug: string): Promise<Municipio | null> {
  if (!esSlugValido(slug)) return null;
  const lista = await getMunicipios();
  return lista.find((m) => m.municipio === slug) ?? null;
}

export async function getMetricas(slug: string): Promise<Metricas | null> {
  if (!esSlugValido(slug)) return null;
  return leerJson<Metricas>(`metricas/${slug}.json`);
}

export async function getSuelo(slug: string): Promise<Suelo | null> {
  if (!esSlugValido(slug)) return null;
  const archivo = await leerJson<ArchivoSuelos>("suelo.json");
  return archivo?.suelos.find((s) => s.municipio === slug) ?? null;
}

export async function getResultado(
  slug: string,
  cultivo: Cultivo,
): Promise<ResultadoCultivo | null> {
  if (!esSlugValido(slug)) return null;
  return leerJson<ResultadoCultivo>(`resultados/${slug}_${cultivo}.json`);
}

export async function getRotaciones(slug: string): Promise<ArchivoRotaciones | null> {
  if (!esSlugValido(slug)) return null;
  return leerJson<ArchivoRotaciones>(`resultados/rotaciones_${slug}.json`);
}

export async function getContextoAsistente(
  slug: string,
  cultivo: Cultivo,
): Promise<ContextoAsistente | null> {
  if (!esSlugValido(slug)) return null;
  return leerJson<ContextoAsistente>(
    `resultados/contexto_asistente/${slug}_${cultivo}.json`,
  );
}
