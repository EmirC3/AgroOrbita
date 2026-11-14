import { TEMPORADAS_SUELO_CANSADO } from "@/constants";

interface SiembraHistorial {
  cultivo: string;
  temporada: number;
}

// RF-015: alerta si las últimas N temporadas tienen el mismo cultivo.
// Con menos de N temporadas en el historial no hay alerta.
export function sueloCansado(historial: SiembraHistorial[]): { alerta: boolean; cultivo: string | null; temporadas: number } {
  const orden = [...historial].sort((a, b) => b.temporada - a.temporada);
  if (orden.length < TEMPORADAS_SUELO_CANSADO) return { alerta: false, cultivo: null, temporadas: 0 };

  const ultimo = orden[0].cultivo;
  let seguidas = 0;
  for (const s of orden) {
    if (s.cultivo !== ultimo) break;
    seguidas++;
  }
  return {
    alerta: seguidas >= TEMPORADAS_SUELO_CANSADO,
    cultivo: ultimo,
    temporadas: seguidas,
  };
}
