import cpData from '@/data/cp_yucatan.json';
import diagnosticoData from '@/data/diagnostico.json';

export interface ClimaMunicipio {
  tmax_prom_c: number | null;
  tmin_prom_c: number | null;
  dias_calor_35: number;
  lluvia_anual_mm: number;
  lluvia_may_oct_mm: number | null;
  gwetroot_prom: number;
  fuente: string;
}

export interface MunicipioDiagnostico {
  zona: string;
  clima: ClimaMunicipio | null;
  suelo: string | null;
  canicula_dias: number | null;
  limitaciones: string[];
}

interface DiagnosticoData {
  municipios: Record<string, MunicipioDiagnostico>;
}

export interface CPEntry {
  municipio: string;
  zona: string;
  lat?: number;
  lon?: number;
}

export interface Ubicacion {
  cp: string;
  municipio: string;
  zona: string;
}

export const CATALOGO_CP = cpData as Record<string, CPEntry>;

const diagnostico = diagnosticoData as unknown as DiagnosticoData;

export function obtenerUbicacion(cp: string): Ubicacion | null {
  const entry = CATALOGO_CP[cp];
  if (!entry) return null;
  return { cp, municipio: entry.municipio, zona: entry.zona };
}

export function obtenerMunicipio(municipio: string): MunicipioDiagnostico | null {
  return diagnostico.municipios[municipio] ?? null;
}

export function municipioMasCercano(lat: number, lon: number): string | null {
  let mejor: { cp: string; distancia: number } | null = null;

  for (const [cp, entry] of Object.entries(CATALOGO_CP)) {
    if (entry.lat === undefined || entry.lon === undefined) continue;
    const distancia = (entry.lat - lat) ** 2 + (entry.lon - lon) ** 2;
    if (!mejor || distancia < mejor.distancia) {
      mejor = { cp, distancia };
    }
  }

  return mejor?.cp ?? null;
}
