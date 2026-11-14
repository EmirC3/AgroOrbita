// RF-011 (parcelas) y RF-015 (alerta de suelo cansado).
// GET  /api/parcelas  → parcelas del agricultor con su historial y alerta
// POST /api/parcelas  → crea una parcela
import { esquemaParcela } from "@/features/parcelas/validations/parcela";
import { sueloCansado } from "@/features/rotaciones/services/suelo-cansado";
import { getMunicipio } from "@/lib/datos";
import { error, errorValidacion, ok, requiereUsuario } from "@/lib/http";

export async function GET() {
  const { supabase, respuesta } = await requiereUsuario();
  if (respuesta) return respuesta;

  // RLS filtra por usuario; no hace falta .eq("user_id", ...).
  const { data, error: e } = await supabase
    .from("parcelas")
    .select("*, siembras(id, cultivo, temporada, fecha_siembra, rendimiento_pronosticado_t_ha, cosechas(rendimiento_t_ha, diferencia_pct))")
    .order("created_at", { ascending: true });

  if (e) return error(500, "No pudimos cargar tus parcelas. Intenta de nuevo.");

  const parcelas = (data ?? []).map((p) => {
    const historial = [...(p.siembras ?? [])].sort((a, b) => a.temporada - b.temporada);
    return { ...p, siembras: historial, suelo_cansado: sueloCansado(historial) };
  });

  return ok({ parcelas });
}

export async function POST(request: Request) {
  const { supabase, user, respuesta } = await requiereUsuario();
  if (respuesta) return respuesta;

  const cuerpo = await request.json().catch(() => null);
  const parse = esquemaParcela.safeParse(cuerpo);
  if (!parse.success) return errorValidacion(parse.error);

  if (!(await getMunicipio(parse.data.municipio))) {
    return error(422, "Todavía no llegamos a ese municipio.");
  }

  const { data, error: e } = await supabase
    .from("parcelas")
    .insert({ ...parse.data, user_id: user!.id })
    .select()
    .single();

  if (e) return error(500, "No pudimos guardar la parcela. Intenta de nuevo.");
  return ok({ parcela: data }, 201);
}
