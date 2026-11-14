# Primeros pasos (orden recomendado)

Entrega: domingo 15/11/2026 antes de las 12:00. El código se congela a las 8:00 de ese día.

## Paso 1. Repositorio (15 min, Rol 6 o quien tenga la cuenta)
1. Crear en GitHub un repositorio **vacío** (sin README) llamado `agroorbita`.
2. Descomprimir este ZIP y, dentro de la carpeta:
   ```bash
   git init -b main
   git add .
   git commit -m "NEC-005: estructura inicial de AgroOrbita"
   git remote add origin https://github.com/<usuario-u-organizacion>/agroorbita.git
   git push -u origin main
   ```
3. En GitHub: Settings -> Branches -> proteger `main` (exigir pull request y 1 aprobación).
4. Invitar al equipo (Settings -> Collaborators).
5. En `.github/CODEOWNERS` reemplazar los `@REEMPLAZAR-...` por los usuarios reales.

## Paso 2. Decisiones del equipo (15 min, todos)
- Elegir los 5 municipios y completar `data_engineering/datasets/municipios.json` (hay una propuesta; coordenadas aproximadas, verificar).
- Asignar los roles 2 a 6 (Anexo A del ERS).

## Paso 3. Aprobar el contrato de datos (30 min, roles 1, 2 y 4)
- Leer `docs/formato_resultados.md`, corregir lo que haga falta y aprobarlo por pull request.
- Es lo que permite que datos, simulación y web trabajen en paralelo. Anexo B del ERS: se aprueba en la primera hora.

## Paso 4. Cada rol crea su rama y empieza (en paralelo)
```bash
git checkout -b datos/RF-001-descarga-power
```
| Rol | Primera rama | Primera tarea |
|---|---|---|
| 1 Datos | `datos/RF-001-descarga-power` | Descargar clima de NASA POWER de los 5 municipios |
| 2 Simulación | `sim/RF-004-suelo-soilgrids` | Suelo por municipio y probar AquaCrop con 1 municipio y 1 año |
| 3 Investigación | `docs/RD-003-tabla-cultivos` | Llenar `docs/investigacion/cultivos.csv` y bajar rendimientos de SIAP |
| 4 Web | `web/RF-008-seleccion-zona` | Crear la app (ver `docs/web_setup.md`) y la pantalla de zona con datos de ejemplo |
| 5 Diseño | `diseno/RNF-001-maquetas` | Maquetas de las 4 pantallas, paleta, semáforo |
| 6 Presentación | `pres/NEC-005-guion` | Guion, video y diapositivas |

## Paso 5. Web con datos de ejemplo (Rol 4)
Seguir `docs/web_setup.md`. Los archivos `ejemplo_*` ya traen datos de muestra marcados como ejemplo,
así la web avanza sin esperar a los notebooks. Luego se cambian por los reales con:
```bash
python data_engineering/scripts/sync_datos_a_web.py
```

## Paso 6. Integración y ensayo
- Cuando datos y simulación entreguen JSON reales: `python data_engineering/scripts/validar_formato.py` y luego `sync`.
- Revisar RNF-003 (cada dato con fuente) y RN-002 (ejemplos marcados).
- Ensayar la demo completa en la laptop de la presentación.
- 8:00 del domingo: congelar el código (sin más merges a `main`).

## Si falta tiempo, recortar en este orden
1. Asistente de IA en vivo (nivel 2). Dejar las explicaciones ya redactadas (nivel 1).
2. RF-012 (verdor MODIS), RF-014 (ajuste de pronósticos).
3. PWA, Realtime y Zustand.
4. Nunca recortar: RF-001 a RF-007, RF-008 a RF-011 y RN-001 a RN-003.
