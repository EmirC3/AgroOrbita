// RF-013: registrar cosecha y comparar con el pronóstico.
// GET  /api/cosechas → cosechas del agricultor
// POST /api/cosechas → guarda la cosecha y devuelve "cosechaste X % más/menos…"
import { RENDIMIENTO_MAX_RAZONABLE_T_HA } from "@/constants";
import { diferenciaPct, fraseDiferencia } from "@/features/cosechas/services/diferencia";
import { esquemaCosecha } from "@/features/cosechas/validations/cosecha";
import { error, errorValidacion, ok, requiereUsuario } from "@/lib/http";

export async function GET() {
  const { supabase, respuesta } = await requiereUsuario();
  if (respuesta) return respuesta;

  const { data, error: e } = await supabase
    .from("cosechas")
    .select("*, siembras(cultivo, temporada, fecha_siembra, rendimiento_pronosticado_t_ha, parcelas(nombre, municipio))")
    .order("created_at", { ascending: false });

  if (e) return error(500, "No pudimos cargar tus cosechas. Intenta de nuevo.");
  return ok({ cosechas: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, user, respuesta } = await requiereUsuario();
  if (respuesta) return respuesta;

  const cuerpo = await request.json().catch(() => null);
  const parse = esquemaCosecha.safeParse(cuerpo);
  if (!parse.success) return errorValidacion(parse.error);
  const { siembra_id, rendimiento_t_ha, confirmado } = parse.data;

  // RF-013: valor negativo o mayor a 20 t/ha → pedir confirmación.
  const fueraDeRango = rendimiento_t_ha < 0 || rendimiento_t_ha > RENDIMIENTO_MAX_RAZONABLE_T_HA;
  if (fueraDeRango && !confirmado) {
    return error(409, `¿Seguro? ${rendimiento_t_ha} t/ha es un valor poco común.`, {
      requiere_confirmacion: true,
    });
  }

  const { data: siembra } = await supabase
    .from("siembras")
    .select("id, rendimiento_pronosticado_t_ha")
    .eq("id", siembra_id)
    .single();
  if (!siembra) return error(404, "No encontramos esa siembra.");

  const pct = diferenciaPct(rendimiento_t_ha, siembra.rendimiento_pronosticado_t_ha);

  const { data, error: e } = await supabase
    .from("cosechas")
    .insert({ siembra_id, rendimiento_t_ha, diferencia_pct: pct, user_id: user!.id })
    .select()
    .single();

  if (e?.code === "23505") return error(409, "Esa siembra ya tiene una cosecha registrada.");
  if (e) return error(500, "No pudimos guardar la cosecha. Intenta de nuevo.");

  return ok({ cosecha: data, mensaje: fraseDiferencia(pct) }, 201);
}
