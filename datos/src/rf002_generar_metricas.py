"""RF-002: arma datos/metricas/<municipio>.json de los municipios del piloto.

Pasos por municipio:
1. Lee el clima diario: datos/clima/<municipio>.csv (lo de Pablo). Si aún no existe,
   lo baja de NASA POWER y lo guarda en una carpeta temporal (no en el repositorio).
2. Le junta las variables para la "sed del aire" (power_yucatan_extra.csv.gz) del punto
   de la cuadrícula de NASA más cercano.
3. Calcula las métricas de cada año y el promedio 1985-2025 (solo años completos).
4. Guarda el JSON con el formato de docs/formato_resultados.md.

Cómo correrlo (desde la carpeta AgroOrbita):
    python datos/src/rf002_generar_metricas.py
"""
import csv
import gzip
import json
import statistics
import tempfile
import urllib.request
from datetime import date
from pathlib import Path

from eto_fao56 import eto
from rd001_inicio_lluvias import inicio_lluvias
from rd002_canicula import canicula, canicula_pct, dias_calor
from rf002_temporada import deficit_agua, humedad_semanal, lluvia_temporada

DATOS = Path(__file__).resolve().parents[1]
ANIO_INICIO, ANIO_FIN_NORMAL = 1985, 2025   # el "normal" solo usa años completos
MAX_FALTANTES = 0.10                        # más de 10 % de días sin dato = año incompleto
BASE = ["T2M_MAX", "T2M_MIN", "PRECTOTCORR", "GWETROOT", "ALLSKY_SFC_SW_DWN"]
CACHE = Path(tempfile.gettempdir()) / "agroorbita_power"


def leer_clima_base(m):
    """Regresa {fecha 'AAAAMMDD': {variable: valor}} del municipio."""
    archivo = DATOS / "clima" / f"{m['municipio']}.csv"
    if archivo.exists():  # archivo de Pablo: se espera una columna por variable de NASA
        with open(archivo, encoding="utf-8") as f:
            filas = list(csv.DictReader(f))
        col_fecha = next(c for c in filas[0] if c.lower() in ("fecha", "date", "yyyymmdd"))
        return {r[col_fecha].replace("-", ""): {v: float(r[v]) for v in BASE} for r in filas}

    CACHE.mkdir(exist_ok=True)
    cache = CACHE / f"{m['municipio']}.json"
    if not cache.exists():
        print(f"  {archivo.name} aún no está; bajando de NASA POWER ...")
        hoy = date.today().strftime("%Y%m%d")
        url = ("https://power.larc.nasa.gov/api/temporal/daily/point?parameters=" + ",".join(BASE)
               + f"&community=AG&latitude={m['lat']}&longitude={m['lon']}"
               + f"&start={ANIO_INICIO}0101&end={hoy}&format=JSON")
        with urllib.request.urlopen(url, timeout=300) as r:
            cache.write_bytes(r.read())
    p = json.loads(cache.read_text())["properties"]["parameter"]
    return {d: {v: p[v][d] for v in BASE} for d in p["T2M_MAX"]}


def leer_extra(m):
    """Variables para la ETo del punto de la cuadrícula más cercano al municipio."""
    filas = list(csv.DictReader(gzip.open(DATOS / "clima" / "power_yucatan_extra.csv.gz",
                                          "rt", encoding="utf-8")))
    puntos = {(float(r["lat"]), float(r["lon"])) for r in filas}
    lat, lon = min(puntos, key=lambda q: (q[0] - m["lat"]) ** 2 + (q[1] - m["lon"]) ** 2)
    return {r["fecha"].replace("-", ""): r for r in filas
            if float(r["lat"]) == lat and float(r["lon"]) == lon}, (lat, lon)


def num(v):
    """Convierte a número; -999, vacío o None se vuelven None (dato faltante)."""
    if v in (None, ""):
        return None
    v = float(v)
    return None if v == -999 else v


def metricas_de_un_anio(anio, dias, base, extra):
    fechas = [date(anio, int(d[4:6]), int(d[6:])) for d in dias]
    lluvia = [num(base[d]["PRECTOTCORR"]) for d in dias]
    tmax = [num(base[d]["T2M_MAX"]) for d in dias]
    etos = []
    for d in dias:
        x = extra.get(d)
        etos.append(None if x is None else eto(
            num(base[d]["T2M_MAX"]), num(base[d]["T2M_MIN"]), num(x["punto_rocio_c"]),
            num(x["viento_2m_fao_ms"]), num(base[d]["ALLSKY_SFC_SW_DWN"]),
            num(x["sol_despejado_mj_m2"]), num(x["presion_kpa"])))
    dias_del_anio = 366 if anio % 4 == 0 else 365
    faltantes = dias_del_anio - sum(v is not None for v in lluvia)
    inicio = inicio_lluvias(fechas, lluvia)
    return {
        "anio": anio,
        "completo": faltantes <= MAX_FALTANTES * dias_del_anio,
        "inicio_lluvias": inicio.isoformat() if inicio else None,
        "canicula_baja_lluvia_pct": canicula_pct(fechas, lluvia),
        "duracion_canicula_dias": canicula(fechas, lluvia),
        "dias_calor_mayor_35": dias_calor(tmax),
        "lluvia_mayo_octubre_mm": lluvia_temporada(fechas, lluvia),
        "deficit_agua_mm": deficit_agua(fechas, lluvia, etos),
        "humedad_suelo_semanal": humedad_semanal(fechas, [num(base[d]["GWETROOT"]) for d in dias]),
    }


def promedio(anios, clave):
    v = [a[clave] for a in anios if a[clave] is not None]
    return round(statistics.mean(v)) if v else None


def generar(m):
    print(f"{m['nombre']}:")
    base = leer_clima_base(m)
    extra, punto = leer_extra(m)
    anios = []
    for anio in sorted({int(d[:4]) for d in base}):
        dias = sorted(d for d in base if d.startswith(str(anio)))
        anios.append(metricas_de_un_anio(anio, dias, base, extra))

    normales = [a for a in anios if a["completo"] and a["anio"] <= ANIO_FIN_NORMAL]
    doy = [date.fromisoformat(a["inicio_lluvias"]).timetuple().tm_yday
           for a in normales if a["inicio_lluvias"]]
    semanas = [[a["humedad_suelo_semanal"][i] for a in normales
                if a["humedad_suelo_semanal"][i] is not None] for i in range(26)]
    prom = {
        "inicio_lluvias_dia_del_anio": round(statistics.mean(doy)) if doy else None,
        "canicula_baja_lluvia_pct": promedio(normales, "canicula_baja_lluvia_pct"),
        "duracion_canicula_dias": promedio(normales, "duracion_canicula_dias"),
        "dias_calor_mayor_35": promedio(normales, "dias_calor_mayor_35"),
        "lluvia_mayo_octubre_mm": promedio(normales, "lluvia_mayo_octubre_mm"),
        "deficit_agua_mm": promedio(normales, "deficit_agua_mm"),
        "humedad_suelo_semanal": [round(statistics.mean(s), 3) if s else None for s in semanas],
    }
    for a in anios:
        a["diferencia_vs_promedio"] = {
            c: (a[c] - prom[c]) if a[c] is not None and prom[c] is not None else None
            for c in ("lluvia_mayo_octubre_mm", "dias_calor_mayor_35", "canicula_baja_lluvia_pct",
                      "deficit_agua_mm")}

    salida = {
        "formato_version": "0.1",
        "municipio": m["municipio"],
        "fuente": "NASA POWER (community AG); ETo FAO-56 calculada por el equipo",
        "es_ejemplo": False,
        "punto_cuadricula_nasa": {"lat": punto[0], "lon": punto[1]},
        "promedio_1985_2025": prom,
        "anios": anios,
    }
    ruta = DATOS / "metricas" / f"{m['municipio']}.json"
    ruta.write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"  {len(anios)} años ({len(normales)} completos en el normal) -> {ruta.name}")
    return salida


if __name__ == "__main__":
    municipios = json.loads((DATOS / "municipios.json").read_text(encoding="utf-8"))["municipios"]
    for m in municipios:
        generar(m)
