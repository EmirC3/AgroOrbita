import { INICIO_SIEMBRA, NUM_SEMANAS } from "@/constants";
import type { ResultadoCultivo } from "@/types/datos";

// Convierte una fecha de siembra a su semana S1..S13 (del 1 de mayo al 31 de julio).
// La ventana tiene 92 días: el día 92 (31 de julio) se suma a S13.
// Devuelve null si cae fuera de la ventana de siembra.
export function semanaDeSiembra(fechaISO: string): string | null {
  const fecha = new Date(`${fechaISO}T00:00:00Z`);
  if (Number.isNaN(fecha.getTime())) return null;
  const anio = fecha.getUTCFullYear();
  const inicio = Date.UTC(anio, INICIO_SIEMBRA.mes - 1, INICIO_SIEMBRA.dia);
  const fin = Date.UTC(anio, 6, 31); // 31 de julio
  if (fecha.getTime() < inicio || fecha.getTime() > fin) return null;
  const dias = Math.floor((fecha.getTime() - inicio) / 86_400_000);
  const n = Math.min(Math.floor(dias / 7) + 1, NUM_SEMANAS);
  return `S${n}`;
}

// Rendimiento probable para la semana en que se sembró (para guardarlo como pronóstico).
export function pronosticoParaFecha(
  resultado: ResultadoCultivo | null,
  fechaISO: string,
): number | null {
  if (!resultado) return null;
  const semana = semanaDeSiembra(fechaISO);
  if (!semana) return null;
  const fila = resultado.resumen_por_semana.find((s) => s.semana === semana);
  return fila?.rendimiento_probable_t_ha ?? null;
}
