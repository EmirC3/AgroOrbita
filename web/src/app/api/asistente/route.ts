// RF-016 y RF-017: asistente de IA.
// POST /api/asistente  { pregunta, municipio, cultivo }
// Nivel 1 (siempre funciona): explicaciones ya redactadas en el JSON de contexto.
// Nivel 2 (si ASISTENTE_ACTIVO=true): respuesta en vivo de la API de Claude.
// Si el nivel 2 falla, cae al nivel 1 (docs/ia/diseno_asistente.md).
import Anthropic from "@anthropic-ai/sdk";
import { AVISO_DECISION } from "@/constants";
import { promptSistema } from "@/features/asistente/services/prompt";
import {
  esquemaPregunta,
  type RespuestaAsistente,
} from "@/features/asistente/validations/asistente";
import { getContextoAsistente } from "@/lib/datos";
import { error, errorValidacion, ok } from "@/lib/http";
import type { ContextoAsistente } from "@/types/datos";

// Límite simple por IP: 10 preguntas por minuto (en memoria; suficiente para la demo).
const LIMITE = 10;
const ventana = new Map<string, number[]>();

function excedeLimite(ip: string): boolean {
  const ahora = Date.now();
  const recientes = (ventana.get(ip) ?? []).filter((t) => ahora - t < 60_000);
  recientes.push(ahora);
  ventana.set(ip, recientes);
  return recientes.length > LIMITE;
}

function respuestaNivel1(ctx: ContextoAsistente): RespuestaAsistente {
  return {
    respuesta: `${ctx.explicaciones.por_que_semana} ${ctx.explicaciones.por_que_riesgo}`.trim(),
    nivel: 1,
    fuentes: ctx.fuentes,
    es_ejemplo: ctx.es_ejemplo,
    aviso: AVISO_DECISION,
  };
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (excedeLimite(ip)) return error(429, "Muchas preguntas seguidas. Espera un minuto.");

  const cuerpo = await request.json().catch(() => null);
  const parse = esquemaPregunta.safeParse(cuerpo);
  if (!parse.success) return errorValidacion(parse.error);
  const { pregunta, municipio, cultivo } = parse.data;

  const ctx = await getContextoAsistente(municipio, cultivo);
  if (!ctx) return error(404, "Todavía no hay información para esa zona y cultivo.");

  const activo = process.env.ASISTENTE_ACTIVO === "true" && !!process.env.ANTHROPIC_API_KEY;
  if (!activo) return ok(respuestaNivel1(ctx));

  try {
    const cliente = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno
    const mensaje = await cliente.messages.create({
      model: process.env.ASISTENTE_MODELO ?? "claude-haiku-5-5",
      max_tokens: 400,
      system: promptSistema(ctx),
      messages: [{ role: "user", content: pregunta }],
    });
    const texto = mensaje.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    const r: RespuestaAsistente = {
      respuesta: texto || respuestaNivel1(ctx).respuesta,
      nivel: texto ? 2 : 1,
      fuentes: ctx.fuentes,
      es_ejemplo: ctx.es_ejemplo,
      aviso: AVISO_DECISION,
    };
    return ok(r);
  } catch {
    return ok(respuestaNivel1(ctx)); // sin internet o sin crédito: la demo sigue
  }
}
