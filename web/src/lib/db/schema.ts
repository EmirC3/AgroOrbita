// Esquema de la base de datos (Drizzle). Tablas de RF-011 y RF-013.
// Las tablas se crean con `npx drizzle-kit push`; luego se corre supabase/rls.sql (RNF-004).
import {
  date,
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const parcelas = pgTable("parcelas", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(), // = auth.uid(); ver supabase/rls.sql
  nombre: text("nombre").notNull(),
  municipio: text("municipio").notNull(), // slug de municipios.json
  lat: doublePrecision("lat").notNull(),
  lon: doublePrecision("lon").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siembras = pgTable("siembras", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  parcelaId: uuid("parcela_id")
    .notNull()
    .references(() => parcelas.id, { onDelete: "cascade" }),
  cultivo: text("cultivo").notNull(), // "maiz" | "frijol"
  temporada: integer("temporada").notNull(), // año, p. ej. 2026
  fechaSiembra: date("fecha_siembra").notNull(),
  // Pronóstico guardado al registrar la siembra, para comparar después (RF-013).
  rendimientoPronosticadoTHa: doublePrecision("rendimiento_pronosticado_t_ha"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cosechas = pgTable("cosechas", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  siembraId: uuid("siembra_id")
    .notNull()
    .unique()
    .references(() => siembras.id, { onDelete: "cascade" }),
  rendimientoTHa: doublePrecision("rendimiento_t_ha").notNull(),
  diferenciaPct: doublePrecision("diferencia_pct"), // vs. pronóstico; null si no había
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Parcela = typeof parcelas.$inferSelect;
export type Siembra = typeof siembras.$inferSelect;
export type Cosecha = typeof cosechas.$inferSelect;
