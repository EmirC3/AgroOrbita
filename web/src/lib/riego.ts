// Cuánta agua dar y cada cuántos días, según la tierra y la raíz (FAO-56, cap. 8).
//   Agua que guarda la tierra (mm) = agua útil por metro × parte que es tierra (no piedra) × profundidad de raíz
//   Riego por vez (mm)            = p × esa agua (lo que la planta toma sin estresarse)
//   Días entre riegos             = riego por vez ÷ (Kc medio × ETo)

export type Suelo = 'kankab' | 'tzekel';

export const SUELOS: Record<Suelo, { nombre: string; descripcion: string; profundidadM: number; tierra: number }> = {
  // K'ankab (Luvisol rojo): arcilloso y profundo. Lo limita la raíz, no la tierra.
  kankab: { nombre: "Roja y profunda (k'ankab)", descripcion: 'Tierra roja, se puede escarbar sin topar con laja', profundidadM: 0.6, tierra: 1 },
  // Tzek'el (Leptosol): delgado, sobre laja y con mucha piedra.
  tzekel: { nombre: "Pedregosa (tzek'el)", descripcion: 'Poca tierra entre piedras, la laja está cerca', profundidadM: 0.2, tierra: 0.5 },
};

// Agua útil de un suelo arcilloso: 140 mm por metro (FAO-56, tabla 19).
const AGUA_UTIL_MM_POR_M = 140;

// ETo típica de junio a septiembre en Yucatán (~4.5 a 5.5 mm/día). Cambiar por la de cada
// municipio cuando data_engineering la exporte en metrics/<municipio>.json.
const ETO_TEMPORADA_MM = 5;

// FAO-56 tabla 22: profundidad de raíz (m, valor bajo del rango) y p (fracción que se puede secar).
// Kc medio de docs/investigacion/cultivos.csv.
const RAIZ: Record<string, { raizM: number; p: number; kcMedio: number }> = {
  MAIZ_01: { raizM: 1.0, p: 0.55, kcMedio: 1.15 },
  PEPI_02: { raizM: 0.7, p: 0.5, kcMedio: 1.0 },
  TOMA_03: { raizM: 0.7, p: 0.4, kcMedio: 1.15 },
  SOYA_04: { raizM: 0.6, p: 0.5, kcMedio: 1.15 },
  HENE_05: { raizM: 0.5, p: 0.8, kcMedio: 0.45 }, // sisal, el pariente más cercano en la tabla
  CALA_06: { raizM: 0.6, p: 0.5, kcMedio: 1.0 },
  FRIJ_07: { raizM: 0.6, p: 0.45, kcMedio: 1.05 },
  XPEL_08: { raizM: 0.6, p: 0.45, kcMedio: 1.05 }, // caupí
  CHIL_09: { raizM: 0.5, p: 0.3, kcMedio: 1.05 },
  SAND_10: { raizM: 0.8, p: 0.4, kcMedio: 1.0 },
  JICA_11: { raizM: 0.5, p: 0.5, kcMedio: 1.05 }, // sin dato en FAO-56: como tubérculo genérico
  MELO_12: { raizM: 0.8, p: 0.4, kcMedio: 1.05 },
};

export interface PlanRiego {
  mmPorRiego: number; // también son litros por metro cuadrado
  cadaDias: number;
  mmPorSemana: number;
  dividir: boolean; // la tierra guarda menos de lo que la planta gasta en un día: regar mañana y tarde
}

/** Plan de riego en la etapa que más agua pide (floración). null si no hay datos del cultivo. */
export function planRiego(cultivoId: string, suelo: Suelo): PlanRiego | null {
  const c = RAIZ[cultivoId];
  if (!c) return null;
  const s = SUELOS[suelo];
  const raiz = Math.min(c.raizM, s.profundidadM);
  const porRiego = c.p * AGUA_UTIL_MM_POR_M * s.tierra * raiz;
  const gastoDiario = c.kcMedio * ETO_TEMPORADA_MM;
  const cadaDias = Math.max(1, Math.floor(porRiego / gastoDiario));
  return {
    mmPorRiego: Math.round(gastoDiario * cadaDias),
    cadaDias,
    mmPorSemana: Math.round(gastoDiario * 7),
    dividir: porRiego < gastoDiario,
  };
}
