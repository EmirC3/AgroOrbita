# Plan de Migración de Carpetas — AgroOrbita

> Estado: **BORRADOR / SOLO ANÁLISIS**. No se ha movido, borrado ni renombrado ningún archivo.
> Fecha: 2026-11-14
> Alcance: raíz del repo, excluyendo `node_modules/` y `.git/`.

---

## 1. Resumen ejecutivo

El repositorio está dividido hoy en dos "mundos" mezclados en la raíz:

- **Web (Next.js)**: `app/`, `data/`, `.env.example`, más un `package.json` / `package-lock.json` / `node_modules/` legacy en la raíz. La app real ya vive en `web/` (con su propio `package.json`, `tsconfig.json`, `next.config.ts`, etc.), pero `web/src/app` y `web/src/data` solo contienen **placeholders vacíos (0 bytes)** que hay que reemplazar con el contenido real de la raíz.
- **Data Engineering (Python)**: `datos/`, `simulacion/`, `scripts/`, `REPORTE_DATOS_YUCATAN_101.md`. La carpeta `data_engineering/` ya existe pero está casi vacía (`README_datos.md` de 0 bytes + `raw_data/` y `scripts/` vacías).

**Riesgo principal detectado:** la raíz tiene un `package.json` + `package-lock.json` + `node_modules/` que **duplican** lo que ya existe en `web/`. No deben "moverse": deben **eliminarse** tras validar que `web/` funciona con su propio install.

**Segundo riesgo:** varios scripts, workflows de CI y `CODEOWNERS` tienen rutas hardcodeadas (`datos/`, `simulacion/`, `scripts/`) que dejarán de ser válidas después del movimiento. Se detallan en la sección 7.

---

## 2. Árbol actual relevante

```
AgroOrbita/
├── .github/
│   ├── CODEOWNERS
│   ├── pull_request_template.md
│   └── workflows/
│       ├── ci-datos.yml
│       └── ci-web.yml
├── app/
│   └── api/diagnostico/route.ts          (1.747 B — código real)
├── data/
│   ├── clima_historico.json              (214 B — dato real)
│   └── cp_yucatan.json                   (324 B — dato real)
├── data_engineering/
│   ├── README_datos.md                   (0 B — placeholder)
│   ├── raw_data/                         (VACÍA)
│   └── scripts/                          (VACÍA)
├── datos/
│   ├── clima/
│   │   ├── .gitkeep
│   │   └── power_yucatan_extra.csv.gz    (6,7 MB — dato crudo NASA)
│   ├── metricas/ejemplo.json
│   ├── notebooks/.gitkeep
│   ├── src/  (descarga_power_extra.py, eto_fao56.py, rd001_..., rd002_..., .gitkeep)
│   ├── verdor/.gitkeep
│   ├── README.md
│   ├── municipios.json
│   └── suelo.json
├── diseno/                (README.md, .gitkeep)          [fuera de alcance]
├── docs/                  (formato_resultados.md, web_setup.md, ers/, ia/, investigacion/) [fuera de alcance]
├── presentacion/          (README.md, .gitkeep)          [fuera de alcance]
├── scripts/
│   ├── crear_carpetas_web.sh
│   ├── sync_datos_a_web.py
│   └── validar_formato.py
├── simulacion/
│   ├── notebooks/.gitkeep
│   ├── resultados/
│   │   ├── contexto_asistente/ejemplo_maiz.json
│   │   ├── ejemplo_maiz.json
│   │   └── rotaciones_ejemplo.json
│   ├── src/.gitkeep
│   └── README.md
├── web/
│   ├── public/ (5 svg)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (onboarding)/page.tsx     (0 B — placeholder)
│   │   │   ├── api/diagnostico/route.ts  (0 B — placeholder A REEMPLAZAR)
│   │   │   ├── dashboard/page.tsx        (0 B — placeholder)
│   │   │   ├── lib/utils.ts              (0 B — placeholder)
│   │   │   ├── layout.tsx                (0 B — placeholder)
│   │   │   └── page.tsx                  (0 B — placeholder)
│   │   ├── components/ (forms/, ui/ — VACÍAS)
│   │   └── data/
│   │       ├── clima_historico.json      (0 B — placeholder A REEMPLAZAR)
│   │       └── cp_yucatan.json           (0 B — placeholder A REEMPLAZAR)
│   ├── .gitignore
│   ├── AGENTS.md
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── tsconfig.json
├── .env.example
├── .gitignore
├── LEEME_PRIMEROS_PASOS.md
├── package.json                          (legacy raíz)
├── package-lock.json                     (legacy raíz)
├── README.md
├── REPORTE_DATOS_YUCATAN_101.md
└── node_modules/                         (legacy raíz)
```

---

## 3. Estructura objetivo propuesta

```
AgroOrbita/
├── data_engineering/
│   ├── raw_data/
│   │   ├── .gitkeep
│   │   └── power_yucatan_extra.csv.gz
│   ├── scripts/
│   │   ├── descarga_power_extra.py
│   │   ├── eto_fao56.py
│   │   ├── rd001_inicio_lluvias.py
│   │   ├── rd002_canicula.py
│   │   ├── validar_formato.py
│   │   ├── sync_datos_a_web.py
│   │   └── crear_carpetas_web.sh          ← ver decisión D-2
│   ├── notebooks/.gitkeep
│   ├── datasets/
│   │   ├── municipios.json
│   │   └── suelo.json
│   ├── metrics/ejemplo.json
│   ├── verdor/.gitkeep
│   ├── simulacion/
│   │   ├── README.md
│   │   ├── notebooks/.gitkeep
│   │   ├── src/.gitkeep
│   │   └── resultados/
│   │       ├── ejemplo_maiz.json
│   │       ├── rotaciones_ejemplo.json
│   │       └── contexto_asistente/ejemplo_maiz.json
│   ├── README_datos.md                    ← contenido de datos/README.md
│   └── REPORTE_DATOS_YUCATAN_101.md
├── web/
│   ├── src/app/api/diagnostico/route.ts   ← contenido real
│   ├── src/data/clima_historico.json      ← contenido real
│   ├── src/data/cp_yucatan.json           ← contenido real
│   ├── .env.example                       ← ver decisión D-4
│   └── (resto de config ya presente)
├── docs/            [sin cambios]
├── diseno/          [sin cambios]
├── presentacion/    [sin cambios]
├── .github/         [solo actualizar rutas]
├── .gitignore       [se conserva en raíz]
├── README.md
└── LEEME_PRIMEROS_PASOS.md
```

> Las carpetas `data_engineering/notebooks`, `datasets`, `metrics`, `verdor` y `simulacion/` **no existen aún**; se crearían al ejecutar el plan. Alternativamente puedes aplanar `metricas`, `municipios` y `suelo` directamente bajo `data_engineering/` si prefieres menos niveles.

---

## 4. Tabla de mapeo — Mundo WEB (`web/`)

| # | Origen | Destino | Acción | Nota |
|---|--------|---------|--------|------|
| W1 | `app/api/diagnostico/route.ts` | `web/src/app/api/diagnostico/route.ts` | Mover + **sobrescribir** placeholder de 0 B | Importa `@/data/*`; el alias `@/*` está en `web/tsconfig.json` |
| W2 | `data/clima_historico.json` | `web/src/data/clima_historico.json` | Mover + **sobrescribir** placeholder de 0 B | Dato real (2 municipios) |
| W3 | `data/cp_yucatan.json` | `web/src/data/cp_yucatan.json` | Mover + **sobrescribir** placeholder de 0 B | Dato real (3 CP) |
| W4 | `.env.example` | `web/.env.example` | Mover | Ver D-4: `web/.gitignore` ignora `.env*` y lo ocultaría |
| W5 | `package.json` (raíz) | — | **Eliminar** | Es legacy; `web/package.json` es el oficial (ver D-1) |
| W6 | `package-lock.json` (raíz) | — | **Eliminar** | Legacy; usar `web/package-lock.json` |
| W7 | `node_modules/` (raíz) | — | **Eliminar** (no mover) | Reinstalar dentro de `web/` con `npm ci` |
| W8 | `.gitignore` (raíz) | `.gitignore` (raíz) | **Conservar** | Cubre Python + Node; complementa `web/.gitignore` |

Los placeholders de `web/src/app` que **se quedan vacíos** (no tienen origen en la raíz): `layout.tsx`, `page.tsx`, `(onboarding)/page.tsx`, `dashboard/page.tsx`, `lib/utils.ts`. Se conservan tal cual.

---

## 5. Tabla de mapeo — Mundo DATA ENGINEERING (`data_engineering/`)

| # | Origen | Destino | Acción | Nota |
|---|--------|---------|--------|------|
| D1 | `datos/clima/power_yucatan_extra.csv.gz` | `data_engineering/raw_data/power_yucatan_extra.csv.gz` | Mover | Dato crudo NASA POWER (6,7 MB) |
| D2 | `datos/clima/.gitkeep` | `data_engineering/raw_data/.gitkeep` | Mover | |
| D3 | `datos/src/descarga_power_extra.py` | `data_engineering/scripts/descarga_power_extra.py` | Mover | |
| D4 | `datos/src/eto_fao56.py` | `data_engineering/scripts/eto_fao56.py` | Mover | |
| D5 | `datos/src/rd001_inicio_lluvias.py` | `data_engineering/scripts/rd001_inicio_lluvias.py` | Mover | |
| D6 | `datos/src/rd002_canicula.py` | `data_engineering/scripts/rd002_canicula.py` | Mover | |
| D7 | `datos/src/.gitkeep` | `data_engineering/scripts/.gitkeep` | Mover / conservar | La carpeta ya existe |
| D8 | `datos/notebooks/.gitkeep` | `data_engineering/notebooks/.gitkeep` | Mover | Crea carpeta `notebooks/` |
| D9 | `datos/metricas/ejemplo.json` | `data_engineering/metrics/ejemplo.json` | Mover | Salida de métricas de ejemplo |
| D10 | `datos/municipios.json` | `data_engineering/datasets/municipios.json` | Mover | Dataset curado compartido |
| D11 | `datos/suelo.json` | `data_engineering/datasets/suelo.json` | Mover | Dataset curado (SoilGrids) |
| D12 | `datos/verdor/.gitkeep` | `data_engineering/verdor/.gitkeep` | Mover | Placeholder verdor MODIS |
| D13 | `datos/README.md` | `data_engineering/README_datos.md` | Mover + **sobrescribir** placeholder de 0 B | Ver D-3 (colisión de nombre) |
| D14 | `scripts/validar_formato.py` | `data_engineering/scripts/validar_formato.py` | Mover | **Requiere actualizar rutas internas** (sección 7) |
| D15 | `scripts/sync_datos_a_web.py` | `data_engineering/scripts/sync_datos_a_web.py` | Mover | **Requiere actualizar rutas internas** (sección 7) |
| D16 | `scripts/crear_carpetas_web.sh` | `data_engineering/scripts/crear_carpetas_web.sh` | Mover | Ver decisión D-2: es scaffolding de web, no de datos |
| D17 | `simulacion/README.md` | `data_engineering/simulacion/README.md` | Mover | |
| D18 | `simulacion/notebooks/.gitkeep` | `data_engineering/simulacion/notebooks/.gitkeep` | Mover | |
| D19 | `simulacion/src/.gitkeep` | `data_engineering/simulacion/src/.gitkeep` | Mover | |
| D20 | `simulacion/resultados/ejemplo_maiz.json` | `data_engineering/simulacion/resultados/ejemplo_maiz.json` | Mover | |
| D21 | `simulacion/resultados/rotaciones_ejemplo.json` | `data_engineering/simulacion/resultados/rotaciones_ejemplo.json` | Mover | |
| D22 | `simulacion/resultados/contexto_asistente/ejemplo_maiz.json` | `data_engineering/simulacion/resultados/contexto_asistente/ejemplo_maiz.json` | Mover | |
| D23 | `REPORTE_DATOS_YUCATAN_101.md` | `data_engineering/REPORTE_DATOS_YUCATAN_101.md` | Mover | Documento de datos (154 KB) |

---

## 6. Archivos fuera de alcance (se quedan donde están)

| Archivo / carpeta | Motivo |
|---|---|
| `docs/`, `diseno/`, `presentacion/` | Documentación, diseño y entrega; no son datos ni web. No los toca este plan. |
| `README.md`, `LEEME_PRIMEROS_PASOS.md` | Documentos raíz del repo. |
| `.github/` | Se conserva; solo se actualizan rutas (sección 7). |
| `web/` (config: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `.gitignore`, `AGENTS.md`, `public/`, `README.md`) | Ya está correctamente dentro de `web/`. |

---

## 7. Ajustes obligatorios DESPUÉS de mover (no son movimientos)

Estos archivos contienen rutas hardcodeadas a las carpetas antiguas y **romperán** si no se actualizan. No los mueve este plan, pero hay que editarlos en la misma PR:

| Archivo | Qué hay que cambiar |
|---|---|
| `data_engineering/scripts/validar_formato.py` | `RAIZ / "datos" / "metricas"` → `data_engineering/metrics`; `RAIZ / "simulacion" / "resultados"` → `data_engineering/simulacion/resultados`; `RAIZ / "datos" / "suelo.json"` y `municipios.json` → `data_engineering/datasets/...` |
| `data_engineering/scripts/sync_datos_a_web.py` | `RAIZ / "datos" / "municipios.json"`, `suelo.json`, `metricas`, `simulacion/resultados` → nuevas rutas en `data_engineering/` |
| `.github/workflows/ci-datos.yml` | `paths: ["datos/**", "simulacion/**", ...]` → `["data_engineering/**", ...]`; `run: python scripts/validar_formato.py` → `python data_engineering/scripts/validar_formato.py` |
| `.github/CODEOWNERS` | `/datos/` y `/simulacion/` → `/data_engineering/` |
| `docs/formato_resultados.md` | Las referencias `datos/...` y `simulacion/...` en el contrato de datos (opcional, pero recomendable para que el equipo no se confunda) |
| `README.md` | Tabla "Quién trabaja dónde", diagrama de flujo (`datos/ -> simulacion/ -> scripts/...`) y reglas de ramas |
| `LEEME_PRIMEROS_PASOS.md` | Comandos `python scripts/validar_formato.py` y `sync_datos_a_web.py` |
| `docs/web_setup.md` | `bash scripts/crear_carpetas_web.sh`, `cp .env.example web/.env.local` (según decisión D-4) |

---

## 8. Decisiones / archivos que NO sé dónde acomodar con certeza

### D-1. `package.json`, `package-lock.json` y `node_modules/` de la raíz
**No los movería a `web/`**: `web/` ya tiene su propio `package.json` completo (Next 16, React 19, Tailwind, ESLint, TypeScript) y su `package-lock.json`. El de la raíz solo declara `next`, `typescript`, `@types/*` y apunta a un `node_modules` duplicado. **Recomendación: eliminar los tres** y verificar con `npm ci` dentro de `web/`.
Si prefieres conservarlos por seguridad, dímelo y los dejo intactos (pero seguirán generando deuda técnica).

### D-2. `scripts/crear_carpetas_web.sh`
Tu regla dice "todo `scripts/` va a `data_engineering/`", pero este script **crea la estructura de `web/src`** (features, lib, stores, etc.), no procesa datos. Opciones:
- **A (recomendada):** `web/scripts/crear_carpetas_web.sh`.
- **B (estricta según tu regla):** `data_engineering/scripts/crear_carpetas_web.sh`.
Dime cuál prefieres.

### D-3. Colisión `datos/README.md` ↔ `data_engineering/README_datos.md`
Ya existe un `data_engineering/README_datos.md` vacío (0 B). Si muevo `datos/README.md` allí, lo sobrescribe sin pérdida real (el placeholder está vacío). **Recomendación: sobrescribir.** Alternativa: conservar el nombre original `data_engineering/datos/README.md`, pero ensucia la estructura.

### D-4. `.env.example` → `web/.env.example` vs dejarlo en la raíz
El contenido dice explícitamente "Copiar a `web/.env.local`". Moverlo a `web/` es lo natural, **pero** `web/.gitignore` tiene la línea `.env*`, que también ignoraría `web/.env.example`. Si lo movemos hay que añadir `!.env.example` a `web/.gitignore`. Alternativa: dejarlo en la raíz (como plantilla central). **Recomendación: mover a `web/.env.example` + añadir la excepción al `.gitignore`.** ¿Confirmas?

### D-5. Nombres de carpetas dentro de `data_engineering/`
Propongo `raw_data/`, `scripts/`, `notebooks/`, `datasets/`, `metrics/`, `verdor/`, `simulacion/`. Si prefieres mantener los nombres originales (`datos/clima` → `raw_data`, `datos/metricas` → `metrics`), o aplanar todo bajo `data_engineering/` sin subcarpetas, dímelo antes de ejecutar.

### D-6. `docs/`, `diseno/`, `presentacion/`
No los mencionaste y no aplican a ninguno de los dos mundos. **Los dejaría intactos.** Si quieres que `docs/` se divida entre ambos mundos, es otro alcance.

---

## 9. Orden de ejecución propuesto (NO ejecutado todavía)

1. Crear carpetas destino faltantes.
2. Mover mundo web (`W1`–`W4`) sobrescribiendo placeholders de 0 B.
3. Mover mundo data engineering (`D1`–`D23`).
4. Editar rutas de scripts, CI, `CODEOWNERS` y docs (sección 7).
5. Eliminar legacy raíz (`W5`–`W7`) tras validar `web/`.
6. Validar:
   ```powershell
   npm --prefix web ci
   npm --prefix web run lint
   npm --prefix web run build
   python data_engineering/scripts/validar_formato.py
   ```
7. Confirmar que no quedan archivos huérfanos en `app/`, `data/`, `datos/`, `scripts/`, `simulacion/` y borrar las carpetas vacías.

> Los comandos concretos (`git mv` / `Move-Item`) los entregaré y ejecutaré **solo cuando des luz verde**.

---

## 10. Checklist de aprobación

- [ ] Confirmo estructura objetivo de la sección 3 (o pido cambios).
- [ ] D-1: ¿eliminar `package.json`, `package-lock.json` y `node_modules/` de la raíz?
- [ ] D-2: ubicación de `crear_carpetas_web.sh` (A: `web/scripts/` | B: `data_engineering/scripts/`).
- [ ] D-3: sobrescribir `data_engineering/README_datos.md` con `datos/README.md`.
- [ ] D-4: mover `.env.example` a `web/` y ajustar `web/.gitignore`.
- [ ] D-5: nombres internos de `data_engineering/` aprobados.
- [ ] Autorizo ejecutar los movimientos.
