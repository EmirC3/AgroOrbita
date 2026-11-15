"""Copia los datos de data_engineering/ a la web.

1. web/public/data/  -> copias completas (municipios, suelo, métricas, resultados).
2. web/src/data/metricas.json -> resumen compacto de las métricas reales de cada
   municipio piloto. Es lo que leen el panel de inicio (/dashboard) y el simulador.

Correr después de rf002_generar_metricas.py:
    python data_engineering/scripts/sync_datos_a_web.py
"""
import json
from datetime import date
import shutil
import sys
from pathlib import Path

PROYECTO = Path(__file__).resolve().parents[2]
RAIZ = PROYECTO / "data_engineering"
DESTINO = PROYECTO / "web" / "public" / "data"
METRICAS_WEB = PROYECTO / "web" / "src" / "data" / "metricas.json"
ANIOS_RECIENTES = 15  # años completos que se mandan a la web para las gráficas

if not (PROYECTO / "web").exists():
    sys.exit("Aún no existe web/. Primero crea la app (ver docs/web_setup.md).")

COPIAS = [
    (RAIZ / "datasets" / "municipios.json", DESTINO / "municipios.json"),
    (RAIZ / "datasets" / "suelo.json", DESTINO / "suelo.json"),
]
DIRECTORIOS = [
    (RAIZ / "metrics", DESTINO / "metricas"),
    (RAIZ / "simulacion" / "resultados", DESTINO / "resultados"),
]


def resumen_metricas():
    """Junta metrics/<municipio>.json en un solo archivo, sin la tabla completa de años."""
    piloto = json.loads((RAIZ / "datasets" / "municipios.json").read_text(encoding="utf-8"))
    salida = {"formato_version": "0.1", "generado_desde": "data_engineering/metrics", "municipios": {}}
    for m in piloto["municipios"]:
        archivo = RAIZ / "metrics" / f"{m['municipio']}.json"
        if not archivo.exists():
            print(f"  aviso: falta {archivo.name}; corre rf002_generar_metricas.py")
            continue
        d = json.loads(archivo.read_text(encoding="utf-8"))
        if d.get("es_ejemplo"):
            continue
        completos = [a for a in d.get("anios", []) if a.get("completo")]
        salida["municipios"][m["municipio"]] = {
            "slug": m["municipio"],
            "nombre": m["nombre"],
            "lat": m["lat"],
            "lon": m["lon"],
            "fuente": d["fuente"],
            "punto_cuadricula_nasa": d["punto_cuadricula_nasa"],
            "promedio": d["promedio_1985_2025"],
            "tendencia_por_decada": d["tendencia_por_decada"],
            "rango_8_de_10_anios": d["rango_8_de_10_anios"],
            "cultivos": d["cultivos"],
            "rotaciones": d["rotaciones"],
            "anios_recientes": [
                {k: a[k] for k in ("anio", "inicio_lluvias", "lluvia_mayo_octubre_mm",
                                   "dias_calor_mayor_35", "deficit_agua_mm")}
                for a in completos[-ANIOS_RECIENTES:]
            ],
            "temporada_actual": temporada_actual(d.get("anios", []), completos),
        }
    return salida


def temporada_actual(anios, completos):
    """El año en curso (aún incompleto) si ya empezó su temporada: así la web muestra cómo va este año.
    Sin déficit: la ETo de ese año todavía no está en raw_data."""
    if not anios or anios[-1].get("completo") or (completos and anios[-1]["anio"] <= completos[-1]["anio"]):
        return None
    a = anios[-1]
    hoy = date.today()
    return {
        "anio": a["anio"],
        "inicio_lluvias": a["inicio_lluvias"],
        "lluvia_mayo_octubre_mm": a["lluvia_mayo_octubre_mm"],
        "dias_calor_mayor_35": a["dias_calor_mayor_35"],
        "temporada_terminada": hoy >= date(a["anio"], 11, 1),
        "calculado_el": hoy.isoformat(),
    }


DESTINO.mkdir(parents=True, exist_ok=True)
n = 0
for origen, destino in COPIAS:
    if origen.exists():
        shutil.copy2(origen, destino)
        n += 1
for origen, destino in DIRECTORIOS:
    if origen.exists():
        shutil.copytree(origen, destino, dirs_exist_ok=True,
                        ignore=shutil.ignore_patterns(".gitkeep"))
        n += sum(1 for _ in destino.rglob("*.json"))
print(f"Listo: {n} archivos copiados a {DESTINO}")

resumen = resumen_metricas()
METRICAS_WEB.write_text(json.dumps(resumen, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(f"Listo: {len(resumen['municipios'])} municipios en {METRICAS_WEB}")
