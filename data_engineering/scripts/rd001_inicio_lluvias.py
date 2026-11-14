"""RD-001: fecha de inicio de lluvias de un año.

Regla (ver ERS, ficha RD-001):
    El inicio de lluvias es el primer día desde el 1 de mayo en que se juntan 20 mm o más
    en 3 días seguidos, siempre que en los 30 días siguientes NO haya una racha de
    10 días secos seguidos (día seco = menos de 1 mm).

¿Por qué la segunda condición? Porque a veces cae un aguacero en mayo y luego deja de llover
dos semanas. Si el agricultor siembra con ese aguacero, la semilla nace y se seca.
A eso se le llama "falso inicio", y la regla lo descarta.

Los números (20 mm, 3 días, 10 días secos, 30 días) son supuestos iniciales y están
juntos aquí arriba para cambiarlos fácil cuando Investigación los valide.
"""
from datetime import date

LLUVIA_MINIMA_MM = 20      # lluvia que hay que juntar...
DIAS_PARA_JUNTAR = 3       # ...en estos días seguidos
DIA_SECO_MM = 1            # un día con menos de esto cuenta como seco
RACHA_SECA_DIAS = 10       # tantos días secos seguidos = falso inicio
DIAS_A_REVISAR = 30        # cuántos días después del posible inicio se revisan
MES_DESDE = 5              # se empieza a buscar el 1 de mayo


def racha_seca_mas_larga(lluvias):
    """Cuenta la racha más larga de días secos seguidos en una lista de lluvias diarias.
    Un día sin dato (None) corta la racha: no sabemos si fue seco (regla de RD-002)."""
    mas_larga = actual = 0
    for mm in lluvias:
        if mm is not None and mm < DIA_SECO_MM:
            actual += 1
            mas_larga = max(mas_larga, actual)
        else:
            actual = 0
    return mas_larga


def inicio_lluvias(fechas, lluvias):
    """Regresa la fecha de inicio de lluvias de UN año, o None si ningún día cumple la regla.

    fechas:  lista de fechas (datetime.date) de un solo año, en orden
    lluvias: lista de mm de lluvia de cada día (None si falta el dato), mismo orden
    """
    for i, dia in enumerate(fechas):
        if dia.month < MES_DESDE:
            continue  # todavía no es mayo

        # Condición 0: la racha empieza en un día con lluvia (no en un día seco).
        # Sin esto, un día de 0 mm seguido de dos de 10 mm se anotaba como inicio.
        if lluvias[i] is None or lluvias[i] < DIA_SECO_MM:
            continue

        # Condición 1: juntar 20 mm en 3 días (el día de hoy y los 2 siguientes)
        tres_dias = lluvias[i:i + DIAS_PARA_JUNTAR]
        if len(tres_dias) < DIAS_PARA_JUNTAR or None in tres_dias:
            continue
        if sum(tres_dias) < LLUVIA_MINIMA_MM:
            continue

        # Condición 2: que en los 30 días siguientes no haya 10 días secos seguidos
        siguientes = lluvias[i + 1:i + 1 + DIAS_A_REVISAR]
        if racha_seca_mas_larga(siguientes) >= RACHA_SECA_DIAS:
            continue  # falso inicio: sigue buscando

        return dia

    return None  # el año no tuvo un inicio claro


if __name__ == "__main__":
    # Pruebas pequeñas con años inventados, para comprobar que la regla funciona.
    from datetime import timedelta

    def anio_inventado(lluvia_por_dia):
        """Arma un año 2001 donde lluvia_por_dia(fecha) dice cuánto llovió."""
        inicio = date(2001, 1, 1)
        fechas = [inicio + timedelta(days=n) for n in range(365)]
        return fechas, [lluvia_por_dia(f) for f in fechas]

    # Caso 1: llueve 10 mm diarios desde el 10 de junio -> inicio el 10 de junio
    f, ll = anio_inventado(lambda d: 10 if d >= date(2001, 6, 10) else 0)
    assert inicio_lluvias(f, ll) == date(2001, 6, 10), inicio_lluvias(f, ll)

    # Caso 2: aguacero de 30 mm el 5 de mayo y luego nada hasta el 20 de junio
    # -> el 5 de mayo es falso inicio; el inicio real es el 20 de junio
    f, ll = anio_inventado(lambda d: 30 if d == date(2001, 5, 5)
                           else (10 if d >= date(2001, 6, 20) else 0))
    assert inicio_lluvias(f, ll) == date(2001, 6, 20), inicio_lluvias(f, ll)

    # Caso 3: un año sin lluvia -> no hay inicio
    f, ll = anio_inventado(lambda d: 0)
    assert inicio_lluvias(f, ll) is None

    # Caso 4: lluvia fuerte en marzo no cuenta, porque se busca desde mayo
    f, ll = anio_inventado(lambda d: 15 if d.month == 3 or d >= date(2001, 7, 1) else 0)
    assert inicio_lluvias(f, ll) == date(2001, 7, 1), inicio_lluvias(f, ll)

    # Caso 5 (ejercicio de Jime): 15 y 10 mm el 5 y 6 de mayo, 16 días secos, lluvia desde el 23
    # -> falso inicio el 5 de mayo; el 22 (0 mm) no cuenta; el inicio es el 23 de mayo
    def caso5(d):
        if d == date(2001, 5, 5):
            return 15
        if d == date(2001, 5, 6):
            return 10
        return 10 if d >= date(2001, 5, 23) else 0
    f, ll = anio_inventado(caso5)
    assert inicio_lluvias(f, ll) == date(2001, 5, 23), inicio_lluvias(f, ll)

    print("Las 5 pruebas de RD-001 pasaron")
