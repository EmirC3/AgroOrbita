# datos/ (Rol 1)

Notebooks de Google Colab y funciones de Python para clima, ETo, métricas y verdor.
Salidas: `clima/`, `metricas/`, `verdor/`. Formato en `docs/formato_resultados.md`.
Funciones reutilizables en `src/` (`rd001_inicio_lluvias.py`, `rd002_canicula.py`, `eto_fao56.py`).

## Datos de NASA POWER

- `clima/power_yucatan_extra.csv.gz`: variables para la ETo (viento a 10 m, punto de rocío, presión,
  sol en cielo despejado, temperatura media) de los 30 puntos de la cuadrícula de NASA que cubren Yucatán,
  diario 1985-2025. Se genera con `python datos/src/descarga_power_extra.py`.
- La cuadrícula de NASA mide 0.5° × 0.625° (unos 55 × 65 km). Cada municipio usa su punto más cercano.

## Decisiones

- **Viento:** se usa `WS10M` convertido a 2 m con la fórmula FAO-56 (× 0.748), columna `viento_2m_fao_ms`.
  No se usa `WS2M` de NASA porque sus valores (~0.2 m/s) no son creíbles para Yucatán.
- **Inicio de lluvias (RD-001):** la racha de 20 mm en 3 días debe empezar en un día con 1 mm o más.
- **Canícula (RD-002):** se mide como % que baja la lluvia diaria de julio-agosto contra junio y
  septiembre (`canicula_pct`). La racha seca en días sale irreal con NASA POWER (el modelo reparte
  lloviznas casi a diario). Propuesta para el formato: cambiar `duracion_canicula_dias` por
  `canicula_baja_lluvia_pct`; pendiente de acordar con Simulación y Web.
- **Días de calor en Mérida (ajustados):** NASA marca la temperatura máxima de 2 a 3 °C más baja que la
  estación oficial de Mérida (SMN, normales 1991-2020) de junio a octubre. Para Mérida se le suma a la
  máxima de NASA la diferencia de cada mes (`AJUSTE_TMAX_C` en `rf002_generar_metricas.py`) antes de
  contar los días de más de 35 °C: pasa de 75 a 117 días al año. El ajuste tiene ±0.5 °C de error
  porque la estación da números redondeados. Los demás municipios usan NASA tal cual hasta conseguir
  sus estaciones. La ETo no se ajusta.
- **`EVPTRNS` no se usa:** es la evapotranspiración real del modelo de NASA, en unidades de energía.
  AquaCrop necesita la evapotranspiración de referencia (ETo), que calculamos con FAO-56 (RF-003).
