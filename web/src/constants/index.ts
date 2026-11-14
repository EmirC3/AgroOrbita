import type { Cultivo } from "@/types/datos";

export const CULTIVOS: readonly Cultivo[] = ["maiz", "frijol"] as const;

export const NOMBRE_CULTIVO: Record<Cultivo, string> = {
  maiz: "Maíz",
  frijol: "Frijol",
};

// Semanas de siembra S1..S13: del 1 de mayo al 31 de julio (RF-005).
export const NUM_SEMANAS = 13;
export const INICIO_SIEMBRA = { mes: 5, dia: 1 }; // 1 de mayo

// RF-013: valores fuera de este rango piden confirmación.
export const RENDIMIENTO_MAX_RAZONABLE_T_HA = 20;

// RF-014: con menos de estas cosechas, el ajuste es preliminar.
export const MIN_COSECHAS_AJUSTE = 3;

// RF-015: temporadas seguidas con el mismo cultivo para la alerta.
export const TEMPORADAS_SUELO_CANSADO = 3;

// RN-001: aviso obligatorio en toda recomendación.
export const AVISO_DECISION =
  "Esta herramienta te orienta; la decisión final es tuya o de un agrónomo local.";
