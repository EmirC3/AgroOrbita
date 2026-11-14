# Reporte Técnico de Progreso y Estado del Repositorio - Field Shift Yucatán

Este informe documenta el estado actual, el análisis detallado y el avance histórico de cada una de las ramas y componentes desarrollados en el repositorio del proyecto **Field Shift Yucatán** (`AgroOrbita`).

---

## 1. Inventario General y Estructura del Proyecto

Tras la reorganización general de la arquitectura del repositorio, los componentes se distribuyen de la siguiente manera:
- **`datos/`**: Almacena los datos climáticos procesados por municipio (`clima/`), métricas agroclimáticas (`metricas/`), tipos de suelo (`suelo.json`, `municipios.json`), y datos de verdor/satélites.
- **`simulacion/`**: Contiene los resultados de rendimiento para cultivos (ej. maíz, frijol) y esquemas de rotación de cultivos, así como el contexto para el asistente.
- **`docs/`**: Documentación técnica, especificaciones de requisitos de software (ERS), especificaciones de investigación (SIAP, rotaciones, fuentes) y diseño de la IA.
- **`web/`**: Aplicación frontend y backend en Next.js (App Router), esquemas de base de datos (Drizzle/Supabase), rutas de API y servicios modulares.
- **`scripts/`**: Herramientas de automatización y sincronización de datos entre el motor de datos y el frontend.

---

## 2. Resumen de Progreso por Rama

### A. Rama `1-datos-y-métricas`
- **Enfoque**: Adquisición, limpieza y cálculo de variables hidroclimáticas.
- **Avances**:
  - Descarga y procesamiento de series temporales diarias de **NASA POWER** (1985–2026) para los 5 municipios piloto: *Oxkutzcab, Tekax, Ticul, Valladolid y Tizimín*.
  - Implementación del cálculo de **ETo (Evapotranspiración de Referencia)** siguiendo la metodología estándar **FAO-56**.
  - Extracción de métricas clave de temporada: inicio de lluvias, duración de la canícula, días con temperatura superior a 35 °C y precipitación acumulada de mayo a octubre.
  - Ajuste y calibración de series de temperatura para Mérida utilizando datos de estaciones observadas del SMN.
  - Generación del informe detallado en `data_engineering/REPORTE_DATOS_YUCATAN_101.md`.

### B. Rama `2-investigacion`
- **Enfoque**: Análisis estadístico avanzado y pruebas de tendencia climática.
- **Avances**:
  - Aplicación del test estadístico de **Mann-Kendall** para identificar tendencias por década con su respectivo porcentaje de seguridad/significancia en las variables agroclimáticas.
  - Cálculo de rangos de incertidumbre probabilística (**8 de cada 10 años**) por cada métrica para evaluar la variabilidad interanual.
  - Documentación de metodologías estadísticas aplicadas al clima de la península de Yucatán.

### C. Rama `6-simulacion` (y carpeta `simulacion/`)
- **Enfoque**: Modelación de cultivos y rotaciones agrícolas.
- **Avances**:
  - Estructuración de los directorios de resultados de simulación.
  - Creación de datasets en formato JSON que almacenan ejemplos de rendimientos simulados para maíz y esquemas de rotación (`ejemplo_maiz.json`, `rotaciones_ejemplo.json`).
  - Preparación de contextos estructurados para alimentar las respuestas del asistente de recomendaciones agrícolas.

### D. Rama `7-datoscultivos` (y carpeta `docs/investigacion/`)
- **Enfoque**: Validación de datos agropecuarios locales y requerimientos de cultivos.
- **Avances**:
  - Configuración de documentos y tablas de validación frente a las estadísticas oficiales del **SIAP** (Servicio de Información Agroalimentaria y Pesquera), estableciendo el criterio de aceptación de $\pm 40\%$ para el periodo 2015–2024 en rendimiento de maíz.
  - Estructuración de tablas de requerimientos hídricos, ciclos fenológicos y temperaturas óptimas en `cultivos.csv`.
  - Definición de rotaciones candidatas (RF-007) para mitigar el cansancio de suelo.

### E. Rama `chore/reorganizacion-carpetas`
- **Enfoque**: Refactorización estructural del repositorio.
- **Avances**:
  - Separación limpia entre el pipeline de ingeniería de datos/simulación y la interfaz de la aplicación web.
  - Limpieza de rutas obsoletas y establecimiento de convenciones estandarizadas en todo el proyecto.

### F. Rama `web/RF-016-backend-base`
- **Enfoque**: Desarrollo del sistema web integral (Frontend & Backend).
- **Avances**:
  - Creación de la arquitectura base en **Next.js (App Router)** con TypeScript y Tailwind CSS.
  - Implementación de rutas de API robustas en `/api/`:
    - `/api/asistente`: Lógica del chatbot agroclimático y motor de prompts del sistema.
    - `/api/parcelas`: Gestión de registros y coordenadas de predios.
    - `/api/cosechas` y `/api/siembras`: Monitoreo de ciclos agrícolas.
    - `/api/ajuste`: Servicios de recomendación de fechas de siembra basadas en ETo y pronósticos.
  - Configuración de la capa de persistencia utilizando **Drizzle ORM** y políticas de seguridad/esquemas de **Supabase** (`supabase/rls.sql`, `supabase/seed.sql`).
  - Implementación de pruebas unitarias y de servicios con `vitest` (`web/tests/unit/servicios.test.ts`).

---

## 3. Conclusiones y Siguientes Pasos
1. **Integración Total**: Las ramas de datos, simulación e investigación se encuentran alineadas y conectadas con la estructura web gracias al script de sincronización (`sync_datos_a_web.py`).
2. **Pruebas y QA**: Se recomienda ejecutar la suite de pruebas unitarias en el módulo web y validar los despliegues de CI mediante GitHub Actions (`ci-datos.yml`, `ci-web.yml`).
3. **Despliegue**: El proyecto cuenta con bases sólidas para el lanzamiento del piloto interactivo enfocado en los agricultores de Yucatán.
