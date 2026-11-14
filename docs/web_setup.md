# Preparar la web (Rol 4)

Requisitos: Node.js 20 o superior y Git.

## 1. Crear la app (desde la raíz del repositorio)
```bash
git checkout -b web/RF-008-seleccion-zona
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd web
```

## 2. Componentes y librerías
```bash
npx shadcn@latest init
npm install @supabase/supabase-js @supabase/ssr drizzle-orm postgres zod react-hook-form @hookform/resolvers zustand leaflet react-leaflet @anthropic-ai/sdk
npm install -D drizzle-kit vitest @playwright/test @types/leaflet
```

## 3. Carpetas por feature
```bash
cd ..
bash scripts/crear_carpetas_web.sh
```

## 4. Variables de entorno
```bash
cp .env.example web/.env.local
```
Llenar los valores de Supabase (Project Settings -> API). `ANTHROPIC_API_KEY` solo en `.env.local` y en Vercel. Nunca en el cliente.

## 5. Supabase (una persona)
1. Crear proyecto en supabase.com.
2. Tablas `parcelas`, `siembras`, `cosechas` (RF-011, RF-013), cada una con `user_id`.
3. Activar RLS en las tres y crear políticas "cada usuario solo ve y modifica lo suyo" (RNF-004).
4. Crear 3 agricultores de ejemplo (RF-010).

## 6. Datos de ejemplo
```bash
python scripts/sync_datos_a_web.py
npm --prefix web run dev
```
Abrir http://localhost:3000. Los archivos `ejemplo_*` traen datos de muestra marcados como ejemplo.

## 7. Deploy
Importar el repositorio en Vercel, carpeta raíz `web`, y copiar las variables de `.env.local`.
