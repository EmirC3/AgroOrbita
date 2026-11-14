# Asistente de IA (RF-016, RF-017, RNF-006)

## Principio
El asistente **no calcula ni inventa números**. Explica lo que ya calcularon los notebooks (RN-003).

## Funciones
- RF-016 Asistente conversacional sobre la zona y el cultivo elegidos.
- RF-017 Botón "¿Por qué?" que explica una recomendación o una rotación.
- RNF-006 Límites: solo cifras del contexto, siempre con fuente, admite lo que no sabe, recuerda RN-001.

## Flujo
1. `simulacion/notebooks/10_contexto_asistente.ipynb` genera `resultados/contexto_asistente/<municipio>_<cultivo>.json`.
2. La pantalla envía pregunta, municipio y cultivo a `web/src/app/api/asistente/route.ts`.
3. El Route Handler valida con Zod, carga el JSON, arma el prompt (`prompt_sistema.md`) y llama a la API de Claude.
4. Devuelve la respuesta con fuentes y el aviso de apoyo a la decisión.

## Dos niveles
- **Nivel 1 (seguro):** el botón "¿Por qué?" muestra `explicaciones` ya redactadas del JSON. No depende de internet ni de API.
- **Nivel 2 (si alcanza):** chat en vivo. Activar con `ASISTENTE_ACTIVO=true`. Si falla, se cae al nivel 1.

## Seguridad
- `ANTHROPIC_API_KEY` solo en variables de entorno del servidor.
- Limitar la longitud de la pregunta y el número de preguntas por minuto.
