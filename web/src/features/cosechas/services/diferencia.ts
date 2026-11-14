// RF-013: diferencia en % entre lo cosechado y lo pronosticado.
export function diferenciaPct(real: number, pronosticado: number | null): number | null {
  if (pronosticado === null || pronosticado <= 0) return null;
  return Math.round(((real - pronosticado) / pronosticado) * 1000) / 10; // 1 decimal
}

// Mensaje "cosechaste X % más/menos de lo pronosticado".
export function fraseDiferencia(pct: number | null): string {
  if (pct === null) return "No había pronóstico para comparar esta siembra.";
  if (pct === 0) return "Cosechaste exactamente lo pronosticado.";
  const sentido = pct > 0 ? "más" : "menos";
  return `Cosechaste ${Math.abs(pct)} % ${sentido} de lo pronosticado.`;
}
