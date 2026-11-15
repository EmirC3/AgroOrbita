export type NivelCondicion = 'favorable' | 'precaucion' | 'riesgo';

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

export interface RecomendacionSuelo {
  titulo: string;
  detalle: string;
  fuente: string;
}

export interface ContextoSuelo {
  estado: string;
  suelos_predominantes: string[];
  fuente: string;
}

export interface DiagnosticoData {
  formato_version: string;
  fuente_clima: string;
  nota: string;
  contexto_suelo: ContextoSuelo;
  recomendaciones_suelo: RecomendacionSuelo[];
  municipios: Record<string, MunicipioDiagnostico>;
}

export interface CatalogoCP {
  [cp: string]: {
    municipio: string;
    zona: string;
  };
}
