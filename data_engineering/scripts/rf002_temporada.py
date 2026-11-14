"""RF-002: lluvia de temporada, humedad del suelo semanal y déficit de agua de un año.

Temporada = 1 de mayo al 31 de octubre (temporal de Yucatán).
"""
from datetime import date

MESES_TEMPORADA = (5, 6, 7, 8, 9, 10)
SEMANAS = 26  # 26 semanas de 7 días desde el 1 de mayo (cubre hasta el 29 de octubre)


def _de_temporada(fechas, valores):
    """Solo los valores de mayo a octubre que sí tienen dato."""
    return [v for d, v in zip(fechas, valores) if d.month in MESES_TEMPORADA and v is not None]


def lluvia_temporada(fechas, lluvias):
    """mm que llovieron de mayo a octubre."""
    return round(sum(_de_temporada(fechas, lluvias)))


def deficit_agua(fechas, lluvias, etos):
    """Lo que el aire pidió menos lo que llovió, de mayo a octubre (mm).
    Positivo = le faltó agua a la planta; negativo = sobró."""
    return round(sum(_de_temporada(fechas, etos)) - sum(_de_temporada(fechas, lluvias)))


def humedad_semanal(fechas, humedades):
    """Promedio de humedad del suelo (GWETROOT, 0 seco a 1 empapado) de cada semana desde el 1 de mayo."""
    anio = fechas[0].year
    inicio = date(anio, 5, 1).toordinal()
    semanas = [[] for _ in range(SEMANAS)]
    for d, h in zip(fechas, humedades):
        n = (d.toordinal() - inicio) // 7  # en qué semana cae el día (0 = primera)
        if 0 <= n < SEMANAS and h is not None:
            semanas[n].append(h)
    return [round(sum(s) / len(s), 3) if s else None for s in semanas]


if __name__ == "__main__":
    from datetime import timedelta
    fechas = [date(2001, 1, 1) + timedelta(days=n) for n in range(365)]

    # 5 mm diarios todo el año -> 184 días de temporada x 5 = 920 mm
    assert lluvia_temporada(fechas, [5] * 365) == 920
    # El aire pide 6 mm y llueven 5 -> faltan 184 mm
    assert deficit_agua(fechas, [5] * 365, [6] * 365) == 184
    # Humedad constante 0.6 -> 26 semanas de 0.6
    assert humedad_semanal(fechas, [0.6] * 365) == [0.6] * 26
    print("Las 3 pruebas de RF-002 temporada pasaron")
