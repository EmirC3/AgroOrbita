// Clima de los últimos días desde la API diaria de NASA POWER (llega con ~2 días de retraso).
// Se guarda en caché unas horas para no llamar a la NASA en cada visita.
import { cacheLife } from 'next/cache';

export interface ClimaReciente {
  ultimoDia: string; // YYYY-MM-DD del último dato disponible
  lluvia30dMm: number;
  diasConLluvia30d: number;
  tmaxProm7d: number;
  diasCalor35_30d: number;
  humedadSuelo: number | null; // 0 a 1
  humedadSueloHace7d: number | null;
}

function yyyymmdd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

/** Lanza error si la NASA no responde (así el error no se queda en caché). */
export async function obtenerClimaReciente(lat: number, lon: number): Promise<ClimaReciente> {
  'use cache';
  cacheLife('hours');

  const fin = new Date();
  const inicio = new Date(fin.getTime() - 40 * 86_400_000);
  const url =
    'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,PRECTOTCORR,GWETROOT' +
    `&community=AG&latitude=${lat}&longitude=${lon}&start=${yyyymmdd(inicio)}&end=${yyyymmdd(fin)}&format=JSON`;

  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`NASA POWER respondió ${res.status}`);
  const json = await res.json();
  const p = json.properties.parameter as Record<'T2M_MAX' | 'PRECTOTCORR' | 'GWETROOT', Record<string, number>>;

  // Solo días con lluvia y temperatura válidas (-999 = sin dato todavía).
  const dias = Object.keys(p.PRECTOTCORR)
    .sort()
    .filter((d) => p.PRECTOTCORR[d] > -900 && p.T2M_MAX[d] > -900);
  if (dias.length < 7) throw new Error('NASA POWER aún no tiene datos recientes');

  const ult30 = dias.slice(-30);
  const ult7 = dias.slice(-7);
  const humedad = (d: string | undefined) => (d && p.GWETROOT[d] > -900 ? p.GWETROOT[d] : null);
  const ultimo = dias[dias.length - 1];

  return {
    ultimoDia: `${ultimo.slice(0, 4)}-${ultimo.slice(4, 6)}-${ultimo.slice(6, 8)}`,
    lluvia30dMm: Math.round(ult30.reduce((s, d) => s + p.PRECTOTCORR[d], 0)),
    diasConLluvia30d: ult30.filter((d) => p.PRECTOTCORR[d] >= 1).length,
    tmaxProm7d: Math.round((ult7.reduce((s, d) => s + p.T2M_MAX[d], 0) / ult7.length) * 10) / 10,
    diasCalor35_30d: ult30.filter((d) => p.T2M_MAX[d] > 35).length,
    humedadSuelo: humedad(ultimo),
    humedadSueloHace7d: humedad(dias[dias.length - 8]),
  };
}
