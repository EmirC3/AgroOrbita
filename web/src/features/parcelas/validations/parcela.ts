import { z } from "zod";

// RF-011: todos los campos son obligatorios.
export const esquemaParcela = z.object({
  nombre: z.string().trim().min(1, "Escribe el nombre de la parcela").max(80),
  municipio: z.string().regex(/^[a-z0-9_]+$/, "Elige un municipio"),
  lat: z.number().min(19, "El punto está fuera de Yucatán").max(22),
  lon: z.number().min(-91, "El punto está fuera de Yucatán").max(-87),
});

export const esquemaSiembra = z.object({
  parcela_id: z.string().uuid("Elige una parcela"),
  cultivo: z.enum(["maiz", "frijol"], { message: "Elige un cultivo" }),
  temporada: z.number().int().min(1985).max(2100),
  fecha_siembra: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Escribe la fecha de siembra"),
});

export type NuevaParcela = z.infer<typeof esquemaParcela>;
export type NuevaSiembra = z.infer<typeof esquemaSiembra>;
