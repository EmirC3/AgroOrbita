// Tipos del contrato de datos (docs/formato_resultados.md, versión 0.1).
// Si cambia el formato, se actualiza aquí y se avisa a los roles 1, 2 y 4.

export type Cultivo = "maiz" | "frijol";

export interface Municipio {
  municipio: string; // slug: "peto", "tizimin"
  nombre: string;
  lat: number;
  lon: number;
}

export interface ArchivoMunicipios {
  formato_version: string;
  municipios: Municipio[];
}

export interface MetricasAnio {
  anio: number;
  completo: boolean;
  inicio_lluvias: string | null;
  duracion_canicula_dias: number | null;
  dias_calor_mayor_35: number | null;
  lluvia_mayo_octubre_mm: number | null;
  deficit_agua_mm: number | null;
  humedad_suelo_semanal: (number | null)[];
  diferencia_vs_promedio: Record<string, number | null>;
}

export interface Metricas {
  formato_version: string;
  municipio: string;
  fuente: string;
  es_ejemplo: boolean;
  promedio_1985_2025: {
    inicio_lluvias_dia_del_anio: number | null;
    duracion_canicula_dias: number | null;
    dias_calor_mayor_35: number | null;
    lluvia_mayo_octubre_mm: number | null;
    deficit_agua_mm: number | null;
    humedad_suelo_semanal: (number | null)[];
  };
  anios: MetricasAnio[];
}

export interface Suelo {
  municipio: string;
  arcilla_pct: number | null;
  arena_pct: number | null;
  limo_pct: number | null;
  textura: string;
  tipo_aquacrop: string;
  fuente: string;
}

export interface ArchivoSuelos {
  formato_version: string;
  fuente: string;
  es_ejemplo: boolean;
  suelos: Suelo[];
}

export interface ResumenSemana {
  semana: string; // "S1" ... "S13"
  anios_buena_cosecha: number;
  anios_totales: number;
  probabilidad_pct: number;
  rendimiento_probable_t_ha: number;
}

export interface ResultadoCultivo {
  formato_version: string;
  municipio: string;
  cultivo: Cultivo;
  fuente: string;
  es_ejemplo: boolean;
  rendimiento_maximo_t_ha: number;
  umbral_buena_cosecha_t_ha: number;
  semanas_siembra: string[];
  rendimiento_por_anio: Record<string, Record<string, number | null>>;
  resumen_por_semana: ResumenSemana[];
  recomendacion: {
    semana: string;
    probabilidad_pct: number;
    rendimiento_probable_t_ha: number;
    frase: string;
    alerta_alto_riesgo: boolean;
  };
  ajuste: { factor: number; n_cosechas: number; preliminar: boolean };
  corridas_fallidas: unknown[];
}

export interface Rotacion {
  id: string;
  nombre: string;
  secuencia: Cultivo[];
  agua_usada_mm: number | null;
  meses_suelo_desnudo: number | null;
  aporte_suelo: "bajo" | "medio" | "alto" | string;
  puntaje: { agua: number; ingreso: number; suelo: number };
  por_que: string;
  evidencia: { texto: string; fuente: string }[];
  beneficios: string[];
  riesgos: string[];
  vacios_informacion: string[];
}

export interface ArchivoRotaciones {
  formato_version: string;
  municipio: string;
  fuente: string;
  es_ejemplo: boolean;
  rotaciones: Rotacion[];
}

export interface ContextoAsistente {
  formato_version: string;
  municipio: string;
  cultivo: Cultivo;
  es_ejemplo: boolean;
  zona: Record<string, unknown>;
  recomendacion: { semana: string; probabilidad_pct: number };
  rotaciones_resumen: { nombre: string; por_que: string }[];
  riesgos: string[];
  vacios_informacion: string[];
  fuentes: string[];
  explicaciones: {
    por_que_semana: string;
    por_que_riesgo: string;
    glosario: { termino: string; explicacion: string }[];
  };
}
