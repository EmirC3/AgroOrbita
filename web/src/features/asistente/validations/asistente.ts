import { z } from "zod";

export const esquemaPregunta = z.object({
  pregunta: z.string().trim().min(3, "Escribe tu pregunta").max(500, "Pregunta muy larga"),
  municipio: z.string().regex(/^[a-z0-9_]+$/),
  cultivo: z.enum(["maiz", "frijol"]),
});

export type PreguntaAsistente = z.infer<typeof esquemaPregunta>;

export interface RespuestaAsistente {
  respuesta: string;
  nivel: 1 | 2; // 1 = explicación ya redactada, 2 = IA en vivo
  fuentes: string[];
  es_ejemplo: boolean;
  aviso: string;
}
