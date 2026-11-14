# AgroOrbita

Herramienta web que ayuda a agricultores de Yucatán a decidir **cuándo sembrar**, **qué cultivos son aptos** y **qué rotación conviene**, usando datos de observación de la Tierra de NASA.
Proyecto para el reto **Field Shift** del NASA Space Apps Challenge 2026 (piloto: Yucatán, con visión global).

> La herramienta apoya la decisión; no sustituye el criterio del agricultor ni de un agrónomo local (RN-001).

## Quién trabaja dónde

| Rol | Carpeta | Requisitos |
|---|---|---|
| 1 Datos y métricas | `datos/` | RF-001, RF-002, RF-003, RF-012, RD-001, RD-002, RNF-005 |
| 2 Simulación | `simulacion/` | RF-004, RF-005, RF-006, RF-007, RF-014, RNF-005 |
| 3 Investigación | `docs/investigacion/` | RF-007 (cultivos y rotaciones), RD-003, RNF-003 |
| 4 Página web | `web/` | RF-008 a RF-011, RF-013, RF-015, RF-016, RF-017, RNF-002, RNF-004 |
| 5 Diseño | `diseno/` | RNF-001, maquetas e íconos |
| 6 Presentación y coordinación | `presentacion/` | NEC-005, video, presentación y entrega |

## Reglas de trabajo

1. **Nadie sube directo a `main`.** Todo entra por pull request revisado por otra persona.
2. Ramas: `<area>/<ID>-<descripcion>`. Áreas: `datos`, `sim`, `docs`, `web`, `diseno`, `pres`.
   Ejemplos: `datos/RF-001-descarga-power`, `web/RF-008-seleccion-zona`.
3. Commits con el ID por delante: `RF-006: calcula semana con mayor probabilidad`.
4. Cada persona toca **solo su carpeta**. Archivos compartidos con un solo dueño:
   `docs/formato_resultados.md` y `datos/municipios.json`.
5. Si cambias el formato de un JSON, avisa en el pull request a los roles 1, 2 y 4.
6. Todo dato de ejemplo se marca `"es_ejemplo": true` (RN-002). Todo dato lleva su `fuente` (RNF-003).

## Cómo fluye la información

```
datos/ (Python, Colab)  ->  simulacion/ (Python, AquaCrop)  ->  scripts/sync_datos_a_web.py  ->  web/public/data  ->  web/ (Next.js)
```

La web **solo lee `web/public/data/`**. Nunca importa de `datos/` ni de `simulacion/`.
El contrato de los archivos está en [`docs/formato_resultados.md`](docs/formato_resultados.md).

## Orden de los notebooks (RNF-005)

`01` descarga clima -> `02` ETo -> `03` métricas -> `04` verdor (opcional) -> `05` suelo -> `06` AquaCrop -> `07` recomendación -> `08` rotaciones -> `09` ajuste -> `10` contexto del asistente.

## Primeros pasos

Ver [`LEEME_PRIMEROS_PASOS.md`](LEEME_PRIMEROS_PASOS.md).
