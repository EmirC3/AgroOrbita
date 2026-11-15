"""RF-007: califica las rotaciones de docs/investigacion/rotaciones.md en cada municipio.

Por rotación:
- Agua y calor: promedio de sus cultivos (lo que salió en el cruce de cultivos).
- Suelo, de 0 a 3 puntos (uno por cada cosa que cumple):
    nitrógeno     tiene una leguminosa (frijol, xpelón, soya o mucuna)
    cubre suelo   tiene calabaza, mucuna o henequén (menos erosión y evaporación)
    corta plagas  junta plantas de familias distintas
"""

# Mucuna (frijol terciopelo) es abono verde: no está en cultivos.csv porque no se cosecha.
FAMILIA = {
    "MAIZ_01": "pastos", "FRIJ_07": "leguminosas", "XPEL_08": "leguminosas",
    "SOYA_04": "leguminosas", "MUCUNA": "leguminosas", "CALA_06": "calabazas",
    "PEPI_02": "calabazas", "SAND_10": "calabazas", "CHIL_09": "solanáceas",
    "TOMA_03": "solanáceas", "HENE_05": "agaves",
}
DAN_NITROGENO = {"FRIJ_07", "XPEL_08", "SOYA_04", "MUCUNA"}
CUBREN_SUELO = {"CALA_06", "MUCUNA", "HENE_05"}

ROTACIONES = [
    {"id": "maiz_solo", "nombre": "Maíz solo cada año (para comparar)", "cultivos": ["MAIZ_01"]},
    {"id": "A_milpa", "nombre": "Milpa: maíz + frijol + calabaza",
     "cultivos": ["MAIZ_01", "FRIJ_07", "CALA_06"]},
    {"id": "B_abono_verde", "nombre": "Maíz y después abono verde (mucuna)",
     "cultivos": ["MAIZ_01", "MUCUNA"]},
    {"id": "C_hortalizas", "nombre": "Hortalizas: chile habanero, pepino y xpelón",
     "cultivos": ["CHIL_09", "PEPI_02", "XPEL_08"]},
    {"id": "D_henequen", "nombre": "Henequén con xpelón o calabaza entre las filas",
     "cultivos": ["HENE_05", "XPEL_08", "CALA_06"]},
]


def puntos_suelo(cultivos):
    suelo = {
        "nitrogeno": any(c in DAN_NITROGENO for c in cultivos),
        "cubre_suelo": any(c in CUBREN_SUELO for c in cultivos),
        "corta_plagas": len({FAMILIA[c] for c in cultivos}) >= 2,
    }
    return sum(suelo.values()), suelo


def calificar(rotacion, cruce):
    """cruce = el diccionario "cultivos" del municipio (resultado de cruce_cultivos)."""
    con_clima = [cruce[c] for c in rotacion["cultivos"] if cruce.get(c)]
    total, suelo = puntos_suelo(rotacion["cultivos"])
    return {
        "id": rotacion["id"],
        "nombre": rotacion["nombre"],
        "cultivos": rotacion["cultivos"],
        "anios_con_falta_agua_de_cada_10": round(
            sum(c["anios_con_falta_agua_de_cada_10"] for c in con_clima) / len(con_clima), 1),
        "dias_calor_danino_tipico": round(
            sum(c["dias_calor_danino_tipico"] for c in con_clima) / len(con_clima)),
        "puntos_suelo": total,
        "suelo": suelo,
    }


def calificar_todas(cruce):
    return [calificar(r, cruce) for r in ROTACIONES]


if __name__ == "__main__":
    assert puntos_suelo(["MAIZ_01"]) == (0, {"nitrogeno": False, "cubre_suelo": False,
                                             "corta_plagas": False})
    assert puntos_suelo(["MAIZ_01", "FRIJ_07", "CALA_06"])[0] == 3
    assert puntos_suelo(["CHIL_09", "PEPI_02", "XPEL_08"])[0] == 2
    # Agua y calor: promedio de los cultivos que sí tienen clima (la mucuna no cuenta)
    cruce = {"MAIZ_01": {"anios_con_falta_agua_de_cada_10": 6, "dias_calor_danino_tipico": 10}}
    r = calificar(ROTACIONES[2], cruce)
    assert r["anios_con_falta_agua_de_cada_10"] == 6 and r["puntos_suelo"] == 3, r
    print("Las 4 pruebas de rotaciones pasaron")
