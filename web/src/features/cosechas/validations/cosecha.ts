import { z } from "zod";

// RF-013: el rendimiento se registra en t/ha.
// Valores negativos o mayores a 20 t/ha se aceptan solo con confirmado = true.
export const esquemaCosecha = z.object({
  siembra_id: z.string().uuid("Elige la siembra que cosechaste"),
  rendimiento_t_ha: z.number({ message: "Escribe cuánto cosechaste" }),
  confirmado: z.boolean().optional().default(false),
});

export type NuevaCosecha = z.infer<typeof esquemaCosecha>;
