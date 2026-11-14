"""RF-001 (parte 2): baja de NASA POWER las variables que faltaban para calcular la ETo (RF-003).

Qué hace, paso a paso:
1. Pregunta a NASA qué puntos de su cuadrícula caen en Yucatán. Usa la consulta "regional"
   (un rectángulo en el mapa) con un solo día, porque esa consulta solo acepta 366 días a la vez.
2. Para cada punto pide los 41 años completos (1985-2025) con la consulta "point",
   que sí acepta periodos largos y varias variables juntas.
3. Junta todo en una tabla: una fila por día y por punto de la cuadrícula.
4. Calcula el viento a 2 m con la fórmula de la FAO a partir del viento a 10 m
   (decisión del equipo: no se usa WS2M de NASA porque sale demasiado bajo, ~0.2 m/s).
5. Guarda la tabla comprimida en data_engineering/raw_data/power_yucatan_extra.csv.gz

Cómo correrlo (desde la carpeta AgroOrbita):
    python data_engineering/scripts/descarga_power_extra.py

Solo usa librerías que ya vienen con Python, no hay que instalar nada.
"""
import csv
import gzip
import json
import math
import time
import urllib.error
import urllib.request
from pathlib import Path

# --- Lo que vamos a pedir -----------------------------------------------------------------
# Rectángulo que cubre Yucatán (incluye algunos puntos de Campeche, Quintana Roo y el mar;
# se filtran después, cuando se asigne cada municipio a su punto más cercano).
LAT_MIN, LAT_MAX = 19.5, 21.75
LON_MIN, LON_MAX = -90.7, -87.4
INICIO, FIN = "19850101", "20251231"

# Variables que faltaban, con el nombre de columna que tendrán en nuestra tabla.
# La unidad va al final del nombre, como pide docs/formato_resultados.md.
VARIABLES = {
    "WS10M": "viento_10m_ms",                    # viento a 10 m (m/s)
    "T2MDEW": "punto_rocio_c",                   # punto de rocío (°C)
    "PS": "presion_kpa",                         # presión del aire (kPa)
    "CLRSKY_SFC_SW_DWN": "sol_despejado_mj_m2",  # sol si no hubiera nubes (MJ/m² por día)
    "T2M": "temp_media_c",                       # temperatura promedio (°C)
}

BASE = "https://power.larc.nasa.gov/api/temporal/daily"
URL_REGION = (BASE + "/regional?parameters=T2M&community=AG"
              f"&latitude-min={LAT_MIN}&latitude-max={LAT_MAX}"
              f"&longitude-min={LON_MIN}&longitude-max={LON_MAX}"
              "&start=20240101&end=20240101&format=JSON")
URL_PUNTO = (BASE + "/point?parameters=" + ",".join(VARIABLES) + "&community=AG"
             "&latitude={lat}&longitude={lon}&start=" + INICIO + "&end=" + FIN + "&format=JSON")

SALIDA = Path(__file__).resolve().parents[1] / "clima" / "power_yucatan_extra.csv.gz"


def pedir(url):
    """Hace la consulta a NASA. Si la red falla, reintenta 3 veces (RF-001).
    Si NASA dice que la consulta está mal hecha (error 4xx), se detiene y muestra el motivo."""
    for intento in range(1, 4):
        try:
            with urllib.request.urlopen(url, timeout=300) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as error:
            if 400 <= error.code < 500:
                raise RuntimeError(f"NASA rechazó la consulta: {error.read().decode()}")
            print(f"  intento {intento} de 3 falló: {error}")
        except Exception as error:  # falla de red
            print(f"  intento {intento} de 3 falló: {error}")
        time.sleep(10 * intento)
    raise RuntimeError("NASA POWER no respondió después de 3 intentos")


def viento_a_2m(viento_10m):
    """Fórmula FAO-56 (ecuación 47): pasa el viento medido a 10 m a la altura estándar de 2 m."""
    return viento_10m * 4.87 / math.log(67.8 * 10 - 5.42)  # = viento_10m × 0.748


def main():
    # Paso 1: qué puntos de la cuadrícula hay en el rectángulo de Yucatán
    region = pedir(URL_REGION)
    puntos = [p["geometry"]["coordinates"] for p in region["features"]]  # [lon, lat, altura]
    print(f"La cuadrícula de NASA tiene {len(puntos)} puntos en el rectángulo de Yucatán\n")

    columnas = ["fecha", "lat", "lon", "altura_m"] + list(VARIABLES.values()) + ["viento_2m_fao_ms"]
    faltantes = {c: 0 for c in VARIABLES.values()}
    filas = 0
    SALIDA.parent.mkdir(parents=True, exist_ok=True)

    with gzip.open(SALIDA, "wt", newline="", encoding="utf-8") as f:
        escritor = csv.writer(f)
        escritor.writerow(columnas)

        # Paso 2: los 41 años de cada punto
        for i, (lon, lat, altura) in enumerate(puntos, start=1):
            print(f"Punto {i} de {len(puntos)}: lat {lat}, lon {lon}")
            datos = pedir(URL_PUNTO.format(lat=lat, lon=lon))["properties"]["parameter"]
            for fecha in datos["T2M"]:  # recorre los días
                valores = []
                for var, columna in VARIABLES.items():
                    v = datos[var][fecha]
                    if v == -999:  # NASA marca así los datos faltantes; los dejamos vacíos
                        v = None
                        faltantes[columna] += 1
                    valores.append(v)
                v10 = valores[0]
                v2 = round(viento_a_2m(v10), 3) if v10 is not None else None
                escritor.writerow([f"{fecha[:4]}-{fecha[4:6]}-{fecha[6:]}", lat, lon, altura]
                                  + valores + [v2])
                filas += 1

    print(f"\nListo: {filas:,} filas de {len(puntos)} puntos en {SALIDA}")
    print("Datos faltantes por columna:", faltantes)


if __name__ == "__main__":
    main()
