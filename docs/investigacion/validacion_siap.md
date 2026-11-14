# Validación Cruzada con Datos Históricos del SIAP (RD-003)

## 1. Objetivo
Garantizar que las recomendaciones de siembra y rendimientos estimados por el sistema para los 10 cultivos principales de Yucatán sean consistentes con las estadísticas oficiales del Servicio de Información Agroalimentaria y Pesquera (SIAP).

## 2. Parámetros de Referencia Estatal (Yucatán)
Cualquier salida generada por los modelos de simulación (Rol 2) debe contrastarse contra los siguientes promedios históricos estatales (modalidad temporal y riego según corresponda):

| Cultivo | Modalidad Predominante | Rendimiento Referencia (t/ha) | Zona Principal en Yucatán |
| :--- | :--- | :--- | :--- |
| **Maíz Grano** | Temporal | 1.8 - 2.3 | Todo el estado (Oriente y Sur) |
| **Pepino** | Riego | 22.0 - 30.0 | Sur y Centro (Oxkutzcab, Tekax) |
| **Tomate** | Riego / Invernadero | 25.0 - 38.0 | Sur, Centro y Oriente |
| **Soya** | Temporal | 2.0 - 2.6 | Sur y Oriente |
| **Henequén** | Temporal | 1.2 - 1.6 (fibra) | Centro-Norte (Motul, Baca) |
| **Calabaza Chihua** | Temporal | 0.6 - 0.9 (semilla) | Oriente y Sur |
| **Frijol** | Temporal | 0.7 - 1.1 | Todo el estado |
| **Xpelón** | Temporal | 0.8 - 1.2 | Todo el estado |
| **Chile Habanero** | Riego | 12.0 - 18.0 | Sur, Centro y Litoral |
| **Sandía** | Riego / Temporal | 20.0 - 28.0 | Sur y Oriente |

## 3. Reglas de Validación de Datos
1. **Filtro de Anomalías:** Si una simulación en temporal arroja rendimientos cercanos a cultivos de riego intensivo (ej. >4 t/ha en maíz de temporal), el sistema debe marcar una alerta de incertidumbre.
2. **Coherencia Geográfica:** Validar la aptitud por municipio (ej. no priorizar recomendaciones de hortalizas de riego intensivo como tomate o pepino en zonas sin infraestructura hídrica reportada en el SIAP).