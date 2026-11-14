# Formato acordado de los archivos de resultados

**Versión 0.1 (borrador). Anexo B del ERS: aprobar en la primera hora, antes de trabajar en paralelo.**
Dueños: Rol 1 (datos), Rol 2 (simulación), Rol 4 (web). Todo cambio entra por pull request y se avisa a los tres.

## Reglas generales
- JSON en UTF-8. Claves en `snake_case`, sin acentos ni espacios.
- `municipio`: identificador corto en minúsculas sin acentos (`merida`, `tizimin`). Es el nombre de archivo.
- `cultivo`: `maiz` o `frijol`.
- Fechas en formato `AAAA-MM-DD`. Unidades en el nombre de la clave: `_mm`, `_c`, `_t_ha`, `_pct`.
- Dato faltante: `null`. Nunca `-999` ni cadenas vacías.
- Todo archivo lleva `formato_version`, `fuente` y `es_ejemplo` (RN-002, RNF-003).
- Los datos de ejemplo usan el municipio `ejemplo` y `"es_ejemplo": true`.

## 1. `datos/municipios.json`  (RF-008)
```json
{ "formato_version": "0.1",
  "municipios": [ { "municipio": "merida", "nombre": "Mérida", "lat": 20.97, "lon": -89.62 } ] }
```

## 2. `datos/metricas/<municipio>.json`  (RF-002, RF-009)
Las 7 métricas de RF-002, por año y promedio 1985-2025.
```json
{ "formato_version": "0.1", "municipio": "merida", "fuente": "NASA POWER", "es_ejemplo": false,
  "promedio_1985_2025": {
    "inicio_lluvias_dia_del_anio": 160, "duracion_canicula_dias": 18, "dias_calor_mayor_35": 95,
    "lluvia_mayo_octubre_mm": 780, "deficit_agua_mm": 310,
    "humedad_suelo_semanal": [0.22, 0.25, "... 26 valores, mayo a octubre"] },
  "anios": [
    { "anio": 2020, "completo": true, "inicio_lluvias": "2020-06-08",
      "duracion_canicula_dias": 21, "dias_calor_mayor_35": 110, "lluvia_mayo_octubre_mm": 820,
      "deficit_agua_mm": 290, "humedad_suelo_semanal": [0.2, 0.24, "..."],
      "diferencia_vs_promedio": { "lluvia_mayo_octubre_mm": 40, "dias_calor_mayor_35": 15,
                                  "duracion_canicula_dias": 3 } } ] }
```
- `inicio_lluvias`: `null` si el año no tiene inicio claro (RD-001).
- `completo: false` si faltan más de 10 % de los días; ese año no entra al promedio (RF-002).

## 3. `datos/suelo.json`  (RF-004)
```json
{ "formato_version": "0.1", "fuente": "SoilGrids", "es_ejemplo": false,
  "suelos": [ { "municipio": "merida", "arcilla_pct": 28, "arena_pct": 35, "limo_pct": 37,
                "textura": "franco arcilloso", "tipo_aquacrop": "ClayLoam", "fuente": "SoilGrids" } ] }
```
Si se usó INEGI como respaldo, `fuente` lo dice.

## 4. `simulacion/resultados/<municipio>_<cultivo>.json`  (RF-005, RF-006, RF-014)
```json
{ "formato_version": "0.1", "municipio": "merida", "cultivo": "maiz",
  "fuente": "AquaCrop-OSPy con NASA POWER y SoilGrids", "es_ejemplo": false,
  "rendimiento_maximo_t_ha": 3.4, "umbral_buena_cosecha_t_ha": 2.38,
  "semanas_siembra": ["2024-05-06", "2024-05-13"],
  "rendimiento_por_anio": { "1985": { "S1": 2.1, "S2": 2.4 } },
  "resumen_por_semana": [ { "semana": "S1", "anios_buena_cosecha": 22, "anios_totales": 40,
                            "probabilidad_pct": 55, "rendimiento_probable_t_ha": 2.2 } ],
  "recomendacion": { "semana": "S4", "probabilidad_pct": 68, "rendimiento_probable_t_ha": 2.5,
                     "frase": "En 27 de 40 años sembrar esa semana dio buena cosecha.",
                     "alerta_alto_riesgo": false },
  "ajuste": { "factor": 1.0, "n_cosechas": 0, "preliminar": true },
  "corridas_fallidas": [] }
```
- Las semanas se nombran `S1` a `S13` (1 de mayo a 31 de julio). `semanas_siembra` da la fecha de referencia de cada una.
- Buena cosecha = rendimiento mayor o igual a 70 % del máximo simulado (RF-006).
- `alerta_alto_riesgo: true` si ninguna semana supera 50 %.

## 5. `simulacion/resultados/rotaciones_<municipio>.json`  (RF-007)
```json
{ "formato_version": "0.1", "municipio": "merida", "fuente": "AquaCrop-OSPy y tabla de cultivos", "es_ejemplo": false,
  "rotaciones": [
    { "id": "maiz_frijol", "nombre": "Maíz, frijol, maíz", "secuencia": ["maiz", "frijol", "maiz"],
      "agua_usada_mm": 540, "meses_suelo_desnudo": 4, "aporte_suelo": "medio",
      "puntaje": { "agua": 7, "ingreso": 6, "suelo": 7 },
      "por_que": "...", "evidencia": [ { "texto": "...", "fuente": "FAO" } ],
      "beneficios": ["..."], "riesgos": ["..."], "vacios_informacion": ["..."] } ] }
```
Mínimo 3 rotaciones. Un cultivo sin información se lista en `vacios_informacion`, no como dato (RF-007).
Pregunta abierta: cómo se identifica "la rotación actual" del agricultor (por coincidencia de secuencia en la web).

## 6. `simulacion/resultados/contexto_asistente/<municipio>_<cultivo>.json`  (RF-016, RF-017)
Resumen que usa el asistente de IA. **Es la única fuente de cifras que el asistente puede citar** (RNF-006).
```json
{ "formato_version": "0.1", "municipio": "merida", "cultivo": "maiz", "es_ejemplo": false,
  "zona": { "suelo": "franco arcilloso", "lluvia_mayo_octubre_mm": 780, "canicula_dias": 18 },
  "recomendacion": { "semana": "S4", "probabilidad_pct": 68 },
  "rotaciones_resumen": [ { "nombre": "Maíz, frijol, maíz", "por_que": "..." } ],
  "riesgos": ["..."], "vacios_informacion": ["..."], "fuentes": ["NASA POWER", "SoilGrids"],
  "explicaciones": { "por_que_semana": "...", "por_que_riesgo": "...",
                     "glosario": [ { "termino": "canícula", "explicacion": "..." } ] } }
```

## Preguntas abiertas (resolver al aprobar)
- ¿Humedad del suelo semanal: valor por semana de mayo a octubre (26 valores) o solo promedio mensual?
- ¿Se necesita guardar crecimiento semanal y estrés por agua de cada corrida, o solo el rendimiento final?
- ¿Cómo se representa la "rotación actual" del agricultor en `rotaciones_<municipio>.json`?
