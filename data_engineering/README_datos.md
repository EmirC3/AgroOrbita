# data_engineering/ (Rol 1)

Notebooks de Google Colab y funciones de Python para clima, ETo, métricas y verdor.
Salidas: `clima/`, `metricas/`, `verdor/`. Formato en `docs/formato_resultados.md`.
Funciones reutilizables en `src/` (`rd001_inicio_lluvias.py`, `rd002_canicula.py`, `eto_fao56.py`).

## Datos de NASA POWER

- `clima/power_yucatan_extra.csv.gz`: variables para la ETo (viento a 10 m, punto de rocío, presión,
  sol en cielo despejado, temperatura media) de los 30 puntos de la cuadrícula de NASA que cubren Yucatán,
  diario 1985-2025. Se genera con `python data_engineering/scripts/descarga_power_extra.py`.
- La cuadrícula de NASA mide 0.5° × 0.625° (unos 55 × 65 km). Cada municipio usa su punto más cercano.

## Decisiones

- **Viento:** se usa `WS10M` convertido a 2 m con la fórmula FAO-56 (× 0.748), columna `viento_2m_fao_ms`.
  No se usa `WS2M` de NASA porque sus valores (~0.2 m/s) no son creíbles para Yucatán.
- **Inicio de lluvias (RD-001):** la racha de 20 mm en 3 días debe empezar en un día con 1 mm o más.
- **Canícula (RD-002):** se mide como % que baja la lluvia diaria de julio-agosto contra junio y
  septiembre (`canicula_pct`). La racha seca en días sale irreal con NASA POWER (el modelo reparte
  lloviznas casi a diario). Propuesta para el formato: cambiar `duracion_canicula_dias` por
  `canicula_baja_lluvia_pct`; pendiente de acordar con Simulación y Web.
- **`EVPTRNS` no se usa:** es la evapotranspiración real del modelo de NASA, en unidades de energía.
  AquaCrop necesita la evapotranspiración de referencia (ETo), que calculamos con FAO-56 (RF-003).
