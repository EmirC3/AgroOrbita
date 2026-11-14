import { MIN_COSECHAS_AJUSTE } from "@/constants";

export interface ParCosecha {
  real: number;
  pronosticado: number;
}

export interface Ajuste {
  factor: number;
  n_cosechas: number;
  preliminar: boolean;
  leyenda: string;
}

// RF-014: factor = promedio de (cosecha real / cosecha pronosticada).
// Ejemplo de aceptación: cosechas que dan 20 % menos → factor 0.8 → el pronóstico baja 20 %.
export function calcularAjuste(pares: ParCosecha[]): Ajuste {
  const validos = pares.filter((p) => p.pronosticado > 0 && p.real >= 0);
  if (validos.length === 0) {
    return { factor: 1, n_cosechas: 0, preliminar: true, leyenda: "Sin cosechas reales todavía." };
  }
  const suma = validos.reduce((acc, p) => acc + p.real / p.pronosticado, 0);
  const factor = Math.round((suma / validos.length) * 100) / 100;
  const n = validos.length;
  const preliminar = n < MIN_COSECHAS_AJUSTE;
  return {
    factor,
    n_cosechas: n,
    preliminar,
    leyenda: `Ajustado con ${n} cosecha${n === 1 ? "" : "s"} real${n === 1 ? "" : "es"}${preliminar ? " (preliminar)" : ""}.`,
  };
}

export function aplicarAjuste(rendimiento: number, factor: number): number {
  return Math.round(rendimiento * factor * 100) / 100;
}
