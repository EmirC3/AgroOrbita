"""RD-002: canícula y días de calor extremo de un año.

Reglas (ver ERS, ficha RD-002):
- Canícula: la racha más larga de días secos seguidos (menos de 1 mm) entre el 1 de julio
  y el 31 de agosto. Es la sequía de mitad de verano que le pega al maíz en floración.
- Día de calor extremo: un día con temperatura máxima mayor a 35 °C.

Los umbrales son supuestos iniciales, juntos aquí arriba para cambiarlos fácil.
"""
from rd001_inicio_lluvias import racha_seca_mas_larga  # la misma función de RD-001

MESES_CANICULA = (7, 8)   # julio y agosto
CALOR_EXTREMO_C = 35      # más de esto = día de calor extremo


def canicula(fechas, lluvias):
    """Días de la racha seca más larga entre el 1 de julio y el 31 de agosto de UN año.
    OJO: con datos de NASA POWER sale muy corta (el modelo reparte lloviznas casi diario).
    Por eso la métrica principal es canicula_pct()."""
    lluvias_jul_ago = [mm for dia, mm in zip(fechas, lluvias) if dia.month in MESES_CANICULA]
    return racha_seca_mas_larga(lluvias_jul_ago)


def canicula_pct(fechas, lluvias):
    """Cuánto baja la lluvia en julio-agosto comparada con junio y septiembre, en %.
    Ejemplo: 40 = en julio y agosto llovió 40 % menos por día que en junio y septiembre.
    Negativo = julio y agosto llovieron MÁS (ese año no hubo canícula)."""
    def promedio_diario(meses):
        v = [mm for dia, mm in zip(fechas, lluvias) if dia.month in meses and mm is not None]
        return sum(v) / len(v) if v else None

    alrededor = promedio_diario((6, 9))       # junio y septiembre
    centro = promedio_diario(MESES_CANICULA)  # julio y agosto
    if not alrededor or centro is None:
        return None
    return round(100 * (1 - centro / alrededor))


def dias_calor(temperaturas_max):
    """Cuántos días de UN año tuvieron máxima mayor a 35 °C. Los días sin dato no cuentan."""
    return sum(1 for t in temperaturas_max if t is not None and t > CALOR_EXTREMO_C)


if __name__ == "__main__":
    from datetime import date, timedelta
    fechas = [date(2001, 1, 1) + timedelta(days=n) for n in range(365)]

    # Caso 1: llueve todos los días menos del 10 al 24 de julio -> canícula de 15 días
    lluvias = [0 if date(2001, 7, 10) <= d <= date(2001, 7, 24) else 5 for d in fechas]
    assert canicula(fechas, lluvias) == 15, canicula(fechas, lluvias)

    # Caso 2: una sequía en junio NO cuenta, solo julio y agosto
    lluvias = [0 if d.month == 6 else 5 for d in fechas]
    assert canicula(fechas, lluvias) == 0, canicula(fechas, lluvias)

    # Caso 3: 35 °C exactos NO es calor extremo (tiene que ser MÁS de 35)
    assert dias_calor([34, 35, 35.1, 40, None]) == 2

    print("Las 3 pruebas de RD-002 pasaron")
