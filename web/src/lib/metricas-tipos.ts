// Tipos y utilidades puras de las métricas reales (data_engineering/metrics).
// Este archivo NO importa el JSON, así que se puede usar en componentes cliente.

export interface Tendencia {
  cambio: number;
  seguridad_pct: number;
}

export interface Rango {
  bajo: number;
  tipico: number;
  alto: number;
}

export type ClaveMetrica =
  | 'dias_calor_mayor_35'
  | 'lluvia_mayo_octubre_mm'
  | 'deficit_agua_mm'
  | 'canicula_baja_lluvia_pct'
  | 'inicio_lluvias_dia_del_anio';

export interface OpcionSiembra {
  dias_desde_inicio_lluvias: number;
  anios_con_falta_agua_de_cada_10: number;
  anios_con_falta_agua_final_de_cada_10: number;
  semanas_con_falta_agua_tipico: number;
  dias_calor_danino_tipico: number;
}

export interface CultivoMetrica {
  nombre: string;
  anios_revisados: number;
  anios_con_falta_agua_de_cada_10: number;
  anios_con_falta_agua_final_de_cada_10: number;
  semanas_con_falta_agua_tipico: number;
  semanas_del_ciclo: number;
  dias_calor_danino_tipico: number;
  temp_dano_c: number;
  medir_con: 'tmax' | 'tmedia' | 'tmin';
  si_siembras: OpcionSiembra[] | null;
}

export interface Rotacion {
  id: string;
  nombre: string;
  cultivos: string[];
  anios_con_falta_agua_de_cada_10: number;
  dias_calor_danino_tipico: number;
  puntos_suelo: number;
  suelo: { nitrogeno: boolean; cubre_suelo: boolean; corta_plagas: boolean };
}

export interface AnioReciente {
  anio: number;
  inicio_lluvias: string | null;
  lluvia_mayo_octubre_mm: number;
  dias_calor_mayor_35: number;
  deficit_agua_mm: number;
}

export interface MetricasMunicipio {
  slug: string;
  nombre: string;
  lat: number;
  lon: number;
  fuente: string;
  punto_cuadricula_nasa: { lat: number; lon: number };
  promedio: {
    inicio_lluvias_dia_del_anio: number;
    canicula_baja_lluvia_pct: number;
    duracion_canicula_dias: number;
    dias_calor_mayor_35: number;
    lluvia_mayo_octubre_mm: number;
    deficit_agua_mm: number;
    humedad_suelo_semanal: (number | null)[];
  };
  tendencia_por_decada: Record<ClaveMetrica, Tendencia>;
  rango_8_de_10_anios: Record<ClaveMetrica, Rango>;
  cultivos: Record<string, CultivoMetrica>;
  rotaciones: Rotacion[];
  anios_recientes: AnioReciente[];
}

/** Dónde está la persona y de qué municipio salen sus métricas. */
export interface LugarUsuario {
  cp: string;
  municipioCP: string; // municipio del código postal
  zona: string;
  metricas: MetricasMunicipio; // municipio piloto con datos reales
  aproximado: boolean; // true si el CP no es de un municipio piloto y usamos el más cercano
}

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** Día del año (1 = 1 de enero, año no bisiesto) a fecha legible: "29 may". */
export function fechaDesdeDia(dia: number): string {
  const fecha = new Date(Date.UTC(2025, 0, 1) + (dia - 1) * 86_400_000);
  return `${fecha.getUTCDate()} ${MESES_CORTOS[fecha.getUTCMonth()]}`;
}

/** Riesgo y salud de un cultivo sembrado en una fecha (0 a 100, más es mejor). */
export interface Evaluacion {
  salud: number;
  riesgoAgua: number; // 0-1, años con falta de agua en floración
  riesgoFinal: number; // 0-1, años con falta de agua al final del ciclo
  riesgoCalor: number; // 0-1, parte de la floración con calor dañino
  aniosFalta: number;
  semanasFalta: number;
  diasCalor: number;
}

export function evaluar(cultivo: CultivoMetrica, opcion?: OpcionSiembra | null): Evaluacion {
  const base = opcion ?? cultivo;
  // La floración (etapa delicada) es el 30 % central del ciclo (FAO-56, ver cruce_cultivos.py).
  const diasFloracion = Math.max(1, cultivo.semanas_del_ciclo * 7 * 0.3);
  const riesgoAgua = base.anios_con_falta_agua_de_cada_10 / 10;
  const riesgoFinal = base.anios_con_falta_agua_final_de_cada_10 / 10;
  const riesgoCalor = Math.min(1, base.dias_calor_danino_tipico / diasFloracion);
  const salud = Math.round(100 * (1 - 0.5 * riesgoAgua - 0.2 * riesgoFinal - 0.3 * riesgoCalor));
  return {
    salud: Math.max(0, Math.min(100, salud)),
    riesgoAgua,
    riesgoFinal,
    riesgoCalor,
    aniosFalta: base.anios_con_falta_agua_de_cada_10,
    semanasFalta: base.semanas_con_falta_agua_tipico,
    diasCalor: base.dias_calor_danino_tipico,
  };
}

/** Cultivos ordenados del que mejor aguanta al que peor, con su fecha típica. */
export function rankingCultivos(m: MetricasMunicipio) {
  return Object.entries(m.cultivos)
    .map(([id, c]) => ({ id, cultivo: c, evaluacion: evaluar(c) }))
    .sort((a, b) => b.evaluacion.salud - a.evaluacion.salud);
}
