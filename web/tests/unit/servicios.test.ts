// Pruebas de aceptación del ERS para la lógica del backend. Correr: npx vitest run
import { describe, expect, it } from "vitest";
import { diferenciaPct, fraseDiferencia } from "@/features/cosechas/services/diferencia";
import { calcularAjuste, aplicarAjuste } from "@/features/recomendacion/services/ajuste";
import { semanaDeSiembra } from "@/features/recomendacion/services/semana";
import { sueloCansado } from "@/features/rotaciones/services/suelo-cansado";

describe("RF-013 diferencia contra pronóstico", () => {
  it("calcula el porcentaje", () => {
    expect(diferenciaPct(0.8, 1)).toBe(-20);
    expect(fraseDiferencia(-20)).toBe("Cosechaste 20 % menos de lo pronosticado.");
  });
  it("sin pronóstico devuelve null", () => {
    expect(diferenciaPct(1, null)).toBeNull();
  });
});

describe("RF-014 ajuste de pronósticos", () => {
  it("cosechas 20 % menores bajan el pronóstico 20 %", () => {
    const a = calcularAjuste([
      { real: 0.8, pronosticado: 1 },
      { real: 1.6, pronosticado: 2 },
      { real: 2.4, pronosticado: 3 },
    ]);
    expect(a.factor).toBe(0.8);
    expect(a.preliminar).toBe(false);
    expect(aplicarAjuste(2.5, a.factor)).toBe(2);
  });
  it("con menos de 3 cosechas es preliminar", () => {
    expect(calcularAjuste([{ real: 1, pronosticado: 1 }]).preliminar).toBe(true);
  });
});

describe("RF-015 suelo cansado", () => {
  const h = (c: string[]) => c.map((cultivo, i) => ({ cultivo, temporada: 2023 + i }));
  it("3 temporadas de maíz seguidas → alerta", () => {
    expect(sueloCansado(h(["maiz", "maiz", "maiz"])).alerta).toBe(true);
  });
  it("2 temporadas → sin alerta", () => {
    expect(sueloCansado(h(["maiz", "maiz"])).alerta).toBe(false);
  });
  it("rotación reciente → sin alerta", () => {
    expect(sueloCansado(h(["maiz", "maiz", "frijol"])).alerta).toBe(false);
  });
});

describe("Semana de siembra", () => {
  it("1 de mayo es S1 y 31 de julio es S13", () => {
    expect(semanaDeSiembra("2026-05-01")).toBe("S1");
    expect(semanaDeSiembra("2026-07-31")).toBe("S13");
    expect(semanaDeSiembra("2026-08-15")).toBeNull();
  });
});
