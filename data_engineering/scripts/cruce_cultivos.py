"""RF-007: cruza cada cultivo de docs/investigacion/cultivos.csv con el clima de cada año.

Por cultivo y año:
1. Se siembra el día que empiezan las lluvias (RD-001). El henequén (perenne) se revisa
   de enero a diciembre.
2. Cada día, el agua que pide la planta = Kc x ETo (la "sed del aire").
   Kc cambia con la edad de la planta (etapas FAO-56): inicial 15 % del ciclo,
   desarrollo 30 %, media 30 %, final 25 %.
3. La etapa delicada (floración) es la etapa media, cuando la planta pide más agua.
4. Se mide:
   - si en la etapa delicada llovió menos de lo que pidió la planta (le faltó agua),
   - si le faltó agua en la etapa final (llenado y maduración; importa al sembrar tarde),
   - cuántas semanas del ciclo llovió menos de lo que pidió,
   - cuántos días de la etapa delicada pasaron la temperatura de daño del cultivo.
"""
import csv
import statistics
from datetime import date, timedelta
from pathlib import Path

ETAPA_INICIAL, ETAPA_DESARROLLO, ETAPA_MEDIA = 0.15, 0.30, 0.30   # lo que queda es la final
TABLA = Path(__file__).resolve().parents[2] / "docs" / "investigacion" / "cultivos.csv"


def leer_cultivos():
    with open(TABLA, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def kc_del_dia(dia, ciclo, kc_ini, kc_med, kc_fin):
    """Kc del día 'dia' (0 = siembra). Sube de kc_ini a kc_med, se queda, y baja a kc_fin."""
    f = dia / ciclo
    a = ETAPA_INICIAL
    b = a + ETAPA_DESARROLLO
    c = b + ETAPA_MEDIA
    if f < a:
        return kc_ini
    if f < b:
        return kc_ini + (kc_med - kc_ini) * (f - a) / ETAPA_DESARROLLO
    if f < c:
        return kc_med
    return kc_med + (kc_fin - kc_med) * (f - c) / (1 - c)


def un_ciclo(siembra, cultivo, dia_clima):
    """dia_clima(fecha) -> {"lluvia", "eto", "tmax", "tmin", "tmedia"} o None.
    Regresa lo que pasó en ese ciclo, o None si faltan datos."""
    ciclo = int(cultivo["ciclo_dias"])
    kcs = [float(cultivo[k]) for k in ("kc_inicial", "kc_medio", "kc_final")]
    dano, medir = float(cultivo["temp_dano_c"]), cultivo["medir_con"]
    pide, llueve, calor = [], [], []
    for i in range(ciclo):
        d = dia_clima(siembra + timedelta(days=i))
        if d is None or d["eto"] is None or d["lluvia"] is None or d[medir] is None:
            return None
        pide.append(kc_del_dia(i, ciclo, *kcs) * d["eto"])
        llueve.append(d["lluvia"])
        calor.append(d[medir] > dano)
    ini = round((ETAPA_INICIAL + ETAPA_DESARROLLO) * ciclo)   # round: 0.15 + 0.30 da 0.4499...
    fin = round((ETAPA_INICIAL + ETAPA_DESARROLLO + ETAPA_MEDIA) * ciclo)
    semanas = range(0, ciclo - 6, 7)
    return {
        "falta_agua_etapa_delicada": sum(llueve[ini:fin]) < sum(pide[ini:fin]),
        "falta_agua_etapa_final": sum(llueve[fin:]) < sum(pide[fin:]),
        "semanas_con_falta": sum(sum(llueve[w:w + 7]) < sum(pide[w:w + 7]) for w in semanas),
        "semanas_del_ciclo": len(semanas),
        "dias_calor_danino": sum(calor[ini:fin]),
    }


def resumen_cultivo(cultivo, siembras, dia_clima):
    """siembras = [(año, fecha de siembra o None)]. Junta todos los años en un resumen."""
    perenne = cultivo["tipo_ciclo"].lower().startswith("perenne")
    ciclos = []
    for anio, inicio in siembras:
        siembra = date(anio, 1, 1) if perenne else inicio
        if siembra:
            r = un_ciclo(siembra, cultivo, dia_clima)
            if r:
                ciclos.append(r)
    if len(ciclos) < 10:
        return None
    falta = sum(c["falta_agua_etapa_delicada"] for c in ciclos)
    falta_final = sum(c["falta_agua_etapa_final"] for c in ciclos)
    return {
        "nombre": cultivo["nombre_cultivo"],
        "anios_revisados": len(ciclos),
        "anios_con_falta_agua_de_cada_10": round(10 * falta / len(ciclos)),
        "anios_con_falta_agua_final_de_cada_10": round(10 * falta_final / len(ciclos)),
        "semanas_con_falta_agua_tipico": round(statistics.median(c["semanas_con_falta"] for c in ciclos)),
        "semanas_del_ciclo": ciclos[0]["semanas_del_ciclo"],
        "dias_calor_danino_tipico": round(statistics.median(c["dias_calor_danino"] for c in ciclos)),
        "temp_dano_c": float(cultivo["temp_dano_c"]),
        "medir_con": cultivo["medir_con"],
    }


CORRIMIENTOS_DIAS = (-14, 0, 14, 28)   # 2 semanas antes, fecha típica, 2 y 4 semanas después


def opciones_siembra(cultivo, siembras, dia_clima):
    """El mismo resumen, pero moviendo la siembra respecto al inicio de lluvias de cada año.
    Sirve para que el agricultor mueva la fecha y vea cómo cambia el riesgo.
    El henequén (perenne) no se mueve: regresa None."""
    if cultivo["tipo_ciclo"].lower().startswith("perenne"):
        return None
    opciones = []
    for dias in CORRIMIENTOS_DIAS:
        movidas = [(a, f + timedelta(days=dias) if f else None) for a, f in siembras]
        r = resumen_cultivo(cultivo, movidas, dia_clima)
        if r:
            opciones.append({"dias_desde_inicio_lluvias": dias,
                             "anios_con_falta_agua_de_cada_10": r["anios_con_falta_agua_de_cada_10"],
                             "anios_con_falta_agua_final_de_cada_10":
                                 r["anios_con_falta_agua_final_de_cada_10"],
                             "semanas_con_falta_agua_tipico": r["semanas_con_falta_agua_tipico"],
                             "dias_calor_danino_tipico": r["dias_calor_danino_tipico"]})
    return opciones


if __name__ == "__main__":
    # Kc: inicio, mitad y final del ciclo
    assert kc_del_dia(0, 100, 0.3, 1.15, 0.4) == 0.3
    assert kc_del_dia(60, 100, 0.3, 1.15, 0.4) == 1.15
    assert abs(kc_del_dia(99, 100, 0.3, 1.15, 0.4) - 0.43) < 0.01

    # Ciclo de prueba: pide 1.15 x 4 = 4.6 mm en floración, llueven 3.5 -> le falta agua;
    # máxima 36 > 35 en toda la floración (días 45 a 74) -> 30 días de calor dañino
    maiz = {"ciclo_dias": "100", "kc_inicial": "0.3", "kc_medio": "1.15", "kc_final": "0.4",
            "temp_dano_c": "35", "medir_con": "tmax"}
    clima = lambda f: {"lluvia": 3.5, "eto": 4, "tmax": 36, "tmin": 22, "tmedia": 29}
    r = un_ciclo(date(2001, 5, 20), maiz, clima)
    assert r["falta_agua_etapa_delicada"] is True and r["dias_calor_danino"] == 30, r
    # En la etapa final el Kc baja de 1.15 a 0.4: pide ~3.1 mm en promedio, menos que 3.5 -> no falta
    assert r["falta_agua_etapa_final"] is False, r
    print("Las 5 pruebas del cruce de cultivos pasaron")
