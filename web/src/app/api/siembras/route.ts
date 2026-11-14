// RF-011: registrar una siembra en una parcela.
// POST /api/siembras → guarda la siembra y su rendimiento pronosticado (para RF-013).
import { esquemaSiembra } from "@/features/parcelas/validations/parcela";
import { pronosticoParaFecha } from "@/features/recomendacion/services/semana";
import { getResultado } from "@/lib/datos";
import { error, errorValidacion, ok, requiereUsuario } from "@/lib/http";

export async function POST(request: Request) {
  const { supabase, user, respuesta } = await requiereUsuario();
  if (respuesta) return respuesta;

  const cuerpo = await request.json().catch(() => null);
  const parse = esquemaSiembra.safeParse(cuerpo);
  if (!parse.success) return errorValidacion(parse.error);
  const s = parse.data;

  // La parcela debe ser del agricultor (RLS ya lo garantiza: si no es suya, no aparece).
  const { data: parcela } = await supabase
    .from("parcelas")
    .select("id, municipio")
    .eq("id", s.parcela_id)
    .single();
  if (!parcela) return error(404, "No encontramos esa parcela.");

  const resultado = await getResultado(parcela.municipio, s.cultivo);
  const pronostico = pronosticoParaFecha(resultado, s.fecha_siembra);

  const { data, error: e } = await supabase
    .from("siembras")
    .insert({ ...s, user_id: user!.id, rendimiento_pronosticado_t_ha: pronostico })
    .select()
    .single();

  if (e) return error(500, "No pudimos guardar la siembra. Intenta de nuevo.");
  return ok({ siembra: data }, 201);
}
