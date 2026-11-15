# data_engineering/ (Rol 1)

Notebooks de Google Colab y funciones de Python para clima, ETo, métricas y verdor.
Salidas: `raw_data/` (clima), `metrics/`, `verdor/`. Formato en `docs/formato_resultados.md`.
Funciones reutilizables en `scripts/` (`rd001_inicio_lluvias.py`, `rd002_canicula.py`, `eto_fao56.py`).

## Datos de NASA POWER

- `raw_data/power_yucatan_extra.csv.gz`: variables para la ETo (viento a 10 m, punto de rocío, presión,
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
- **Días de calor en Mérida (ajustados):** NASA marca la temperatura máxima de 2 a 3 °C más baja que la
  estación oficial de Mérida (SMN, normales 1991-2020) de junio a octubre. Para Mérida se le suma a la
  máxima de NASA la diferencia de cada mes (`AJUSTE_TMAX_C` en `rf002_generar_metricas.py`) antes de
  contar los días de más de 35 °C: pasa de 75 a 117 días al año. El ajuste tiene ±0.5 °C de error
  porque la estación da números redondeados. Los demás municipios usan NASA tal cual hasta conseguir
  sus estaciones. La ETo no se ajusta.
- **Tendencia (`tendencia_por_decada`):** para cada métrica, cuánto cambia en 10 años (línea recta que
  mejor pasa entre los años completos 1985-2025) y qué tan seguros estamos de que es real
  (`seguridad_pct`, prueba de Mann-Kendall; 95 % o más se considera seguro).
  Funciones en `scripts/tendencia.py`.
- **Incertidumbre (`rango_8_de_10_anios`):** de los años completos 1985-2025 se quita el 10 % más bajo
  y el 10 % más alto. `bajo`-`alto` = entre qué valores cae 8 de cada 10 años; `tipico` = la mediana.
- **Cruce con cultivos (`cultivos`, `scripts/cruce_cultivos.py`):** cada cultivo de
  `docs/investigacion/cultivos.csv` se "siembra" el día que empiezan las lluvias de cada año
  (el henequén, de enero a diciembre). El agua que pide = Kc × ETo, con las etapas FAO-56
  (15 % inicial, 30 % desarrollo, 30 % media, 25 % final). La etapa delicada es la media.
  Se reporta en cuántos años de cada 10 le faltó agua en esa etapa, las semanas típicas con
  falta de agua y los días típicos arriba de su temperatura de daño. Ojo: en Mérida la
  temperatura está ajustada con la estación y en los demás no, así que el calor de los otros
  municipios probablemente sale bajo.
- **`EVPTRNS` no se usa:** es la evapotranspiración real del modelo de NASA, en unidades de energía.
  AquaCrop necesita la evapotranspiración de referencia (ETo), que calculamos con FAO-56 (RF-003).
