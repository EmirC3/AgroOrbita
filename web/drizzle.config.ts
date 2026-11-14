import { defineConfig } from "drizzle-kit";

// Crear tablas: npx drizzle-kit push   (lee DATABASE_URL de .env.local)
try {
  process.loadEnvFile(".env.local");
} catch {
  // en CI la variable viene del entorno
}
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
