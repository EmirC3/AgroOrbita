"""RF-003: evapotranspiración de referencia (ETo), la "sed del aire", en mm por día.

Fórmula FAO-56 Penman-Monteith (la estándar de la FAO, la que espera AquaCrop).
Idea simple: entre más calor, sol y viento, y menos humedad, más agua se lleva el aire.

Datos que usa (todos de NASA POWER, de un día):
    temp_max_c, temp_min_c   T2M_MAX, T2M_MIN
    punto_rocio_c            T2MDEW  (dice cuánta humedad trae el aire)
    viento_2m_ms             WS10M convertido a 2 m (columna viento_2m_fao_ms)
    sol_mj_m2                ALLSKY_SFC_SW_DWN  (sol que llegó, con nubes)
    sol_despejado_mj_m2      CLRSKY_SFC_SW_DWN  (sol que llegaría sin nubes)
    presion_kpa              PS
"""
import math

ALBEDO = 0.23              # parte del sol que rebota en el pasto de referencia (FAO)
STEFAN_BOLTZMANN = 4.903e-9  # constante para el calor que la tierra suelta de noche


def presion_vapor(temp_c):
    """Cuánta humedad cabe en el aire a esa temperatura (kPa). FAO-56 ec. 11."""
    return 0.6108 * math.exp(17.27 * temp_c / (temp_c + 237.3))


def eto(temp_max_c, temp_min_c, punto_rocio_c, viento_2m_ms,
        sol_mj_m2, sol_despejado_mj_m2, presion_kpa):
    """ETo de UN día en mm. Regresa None si falta algún dato."""
    datos = (temp_max_c, temp_min_c, punto_rocio_c, viento_2m_ms,
             sol_mj_m2, sol_despejado_mj_m2, presion_kpa)
    if any(d is None for d in datos):
        return None

    t = (temp_max_c + temp_min_c) / 2                         # temperatura media
    delta = 4098 * presion_vapor(t) / (t + 237.3) ** 2        # qué tan rápido sube la humedad posible con el calor
    gamma = 0.000665 * presion_kpa                            # constante que depende de la presión

    # Qué tan seco está el aire: humedad que cabría menos la que hay
    cabria = (presion_vapor(temp_max_c) + presion_vapor(temp_min_c)) / 2
    hay = presion_vapor(punto_rocio_c)
    falta_humedad = max(cabria - hay, 0)

    # Energía del sol que se queda en el suelo
    sol_que_se_queda = (1 - ALBEDO) * sol_mj_m2
    nubosidad = min(sol_mj_m2 / sol_despejado_mj_m2, 1.0) if sol_despejado_mj_m2 else 1.0
    calor_que_se_va = (STEFAN_BOLTZMANN
                       * ((temp_max_c + 273.16) ** 4 + (temp_min_c + 273.16) ** 4) / 2
                       * (0.34 - 0.14 * math.sqrt(hay))
                       * (1.35 * nubosidad - 0.35))
    energia = sol_que_se_queda - calor_que_se_va

    # FAO-56 ecuación 6
    arriba = 0.408 * delta * energia + gamma * 900 / (t + 273) * viento_2m_ms * falta_humedad
    abajo = delta + gamma * (1 + 0.34 * viento_2m_ms)
    return round(max(arriba / abajo, 0), 2)


if __name__ == "__main__":
    # Prueba con el ejemplo 18 del manual FAO-56 (Bruselas, 6 de julio): el resultado debe ser 3.9 mm
    r = eto(temp_max_c=21.5, temp_min_c=12.3, punto_rocio_c=12.08, viento_2m_ms=2.078,
            sol_mj_m2=22.07, sol_despejado_mj_m2=30.90, presion_kpa=100.1)
    assert abs(r - 3.9) < 0.15, r
    print(f"Prueba FAO-56 pasó: {r} mm (el manual dice 3.9)")
