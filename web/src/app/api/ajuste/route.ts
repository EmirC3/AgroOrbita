// RF-014: factor de ajuste por municipio y cultivo con las cosechas de TODOS los agricultores.
// GET /api/ajuste?municipio=peto&cultivo=maiz
// Usa la llave de servicio porque RLS no deja leer cosechas ajenas, pero SOLO devuelve
// el agregado (factor y número de cosechas), nunca filas de otros usuarios (RNF-004).
import { CULTIVOS } from "@/constants";
import { aplicarAjuste, calcularAjuste } from "@/features/recomendacion/services/ajuste";
import { esSlugValido, getResultado } from "@/lib/datos";
import { error, ok } from "@/lib/http";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import type { Cultivo } from "@/types/datos";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const municipio = searchParams.get("municipio") ?? "";
  const cultivo = searchParams.get("cultivo") as Cultivo;

  if (!esSlugValido(municipio) || !CULTIVOS.includes(cultivo)) {
    return error(400, "Municipio o cultivo no válido.");
  }

  const admin = crearClienteAdmin();
  const { data, error: e } = await admin
    .from("cosechas")
    .select("rendimiento_t_ha, siembras!inner(cultivo, rendimiento_pronosticado_t_ha, parcelas!inner(municipio))")
    .eq("siembras.cultivo", cultivo)
    .eq("siembras.parcelas.municipio", municipio);

  if (e) return error(500, "No pudimos calcular el ajuste.");

  type Fila = { rendimiento_t_ha: number; siembras: { rendimiento_pronosticado_t_ha: number | null } };
  const pares = ((data ?? []) as unknown as Fila[])
    .filter((f) => f.siembras.rendimiento_pronosticado_t_ha !== null)
    .map((f) => ({ real: f.rendimiento_t_ha, pronosticado: f.siembras.rendimiento_pronosticado_t_ha! }));

  const ajuste = calcularAjuste(pares);
  const resultado = await getResultado(municipio, cultivo);
  const base = resultado?.recomendacion.rendimiento_probable_t_ha ?? null;

  return ok({
    municipio,
    cultivo,
    ...ajuste,
    rendimiento_base_t_ha: base,
    rendimiento_ajustado_t_ha: base === null ? null : aplicarAjuste(base, ajuste.factor),
  });
}
