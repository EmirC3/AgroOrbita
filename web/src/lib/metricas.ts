// Lectura de métricas reales en el servidor. No importar desde componentes cliente:
// el JSON completo se quedaría en el bundle del navegador.
import metricasData from '@/data/metricas.json';
import cpData from '@/data/cp_yucatan.json';
import type { LugarUsuario, MetricasMunicipio } from './metricas-tipos';

interface EntradaCP {
  municipio: string;
  zona: string;
  lat?: number;
  lon?: number;
}

const METRICAS = (metricasData as unknown as { municipios: Record<string, MetricasMunicipio> })
  .municipios;
export const CATALOGO_CP = cpData as Record<string, EntradaCP>;

export const COOKIE_CP = 'rotamaya_cp';
export const COOKIE_NOMBRE = 'rotamaya_nombre';
export const COOKIE_MUNICIPIO = 'rotamaya_municipio'; // solo si el CP no está en el catálogo

/** Los CP de Yucatán van del 97000 al 97999. */
export function esCPYucatan(cp: string): boolean {
  return /^97\d{3}$/.test(cp);
}

/** "Tizimín" -> "tizimin" (mismo nombre de archivo que data_engineering/metrics). */
export function slugMunicipio(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function municipiosConMetricas(): MetricasMunicipio[] {
  return Object.values(METRICAS);
}

function pilotoMasCercano(lat: number, lon: number): MetricasMunicipio {
  return municipiosConMetricas().reduce((mejor, m) =>
    (m.lat - lat) ** 2 + (m.lon - lon) ** 2 < (mejor.lat - lat) ** 2 + (mejor.lon - lon) ** 2
      ? m
      : mejor
  );
}

/**
 * Convierte un CP en el lugar del usuario. Si el municipio del CP es piloto usa sus
 * métricas; si no, usa el municipio piloto más cercano y lo marca como aproximado.
 */
export function lugarDesdeCP(cp: string | undefined | null, municipioElegido?: string): LugarUsuario | null {
  if (!cp) return null;
  const entrada = CATALOGO_CP[cp];
  if (!entrada) {
    // CP de Yucatán que no está en el catálogo: usamos el municipio piloto que eligió la persona.
    const elegido = municipioElegido ? METRICAS[municipioElegido] : undefined;
    if (!esCPYucatan(cp) || !elegido) return null;
    return { cp, municipioCP: elegido.nombre, zona: 'Yucatán', metricas: elegido, aproximado: false };
  }

  const directo = METRICAS[slugMunicipio(entrada.municipio)];
  if (directo) {
    return { cp, municipioCP: entrada.municipio, zona: entrada.zona, metricas: directo, aproximado: false };
  }
  if (entrada.lat === undefined || entrada.lon === undefined) return null;
  return {
    cp,
    municipioCP: entrada.municipio,
    zona: entrada.zona,
    metricas: pilotoMasCercano(entrada.lat, entrada.lon),
    aproximado: true,
  };
}

export function nombreDesdeCookie(valor: string | undefined): string {
  if (!valor) return '';
  try {
    return decodeURIComponent(valor).slice(0, 40);
  } catch {
    return '';
  }
}
