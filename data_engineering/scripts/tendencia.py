"""Tendencia de una métrica a lo largo de los años, y si es real o casualidad.

- cambio_por_decada: la línea recta que mejor pasa entre los puntos (un punto por año);
  cuánto sube o baja esa línea en 10 años.
- seguridad_pct: prueba de Mann-Kendall. Compara cada año contra todos los que vienen después
  y cuenta cuántas veces sube y cuántas baja. Entre más se aleje eso de lo que saldría por
  casualidad, más seguros estamos de que la tendencia es real (0 a 100 %).
"""
import math


def cambio_por_decada(anios, valores):
    """Pendiente de la línea recta (mínimos cuadrados) multiplicada por 10 años."""
    n = len(anios)
    mx, my = sum(anios) / n, sum(valores) / n
    arriba = sum((x - mx) * (y - my) for x, y in zip(anios, valores))
    abajo = sum((x - mx) ** 2 for x in anios)
    return 10 * arriba / abajo


def mann_kendall(valores):
    """Regresa la probabilidad (p) de que la tendencia sea casualidad. Chica = tendencia real."""
    n = len(valores)
    s = sum((valores[j] > valores[i]) - (valores[j] < valores[i])
            for i in range(n - 1) for j in range(i + 1, n))   # subidas menos bajadas
    varianza = n * (n - 1) * (2 * n + 5) / 18               # cuánto brinca s por pura suerte
    if s == 0:
        return 1.0
    z = (s - 1 if s > 0 else s + 1) / math.sqrt(varianza)
    return math.erfc(abs(z) / math.sqrt(2))                # probabilidad de las dos colas


def tendencia(anios, valores):
    """{"cambio": cambio por década, "seguridad_pct": 0-100}. Ignora años sin dato."""
    pares = [(a, v) for a, v in zip(anios, valores) if v is not None]
    if len(pares) < 10:
        return {"cambio": None, "seguridad_pct": None}
    xs, ys = zip(*pares)
    return {"cambio": round(cambio_por_decada(xs, ys), 1),
            "seguridad_pct": round(100 * (1 - mann_kendall(ys)))}


if __name__ == "__main__":
    anios = list(range(1985, 2026))
    # Sube 2 por año, parejito -> +20 por década y 100 % seguro
    assert tendencia(anios, [2 * a for a in anios]) == {"cambio": 20.0, "seguridad_pct": 100}
    # Brinca arriba y abajo sin subir -> poca seguridad
    assert tendencia(anios, [100 if a % 2 else 0 for a in anios])["seguridad_pct"] < 50
    # Con menos de 10 años no se calcula
    assert tendencia(anios[:5], [1, 2, 3, 4, 5]) == {"cambio": None, "seguridad_pct": None}
    print("Las 3 pruebas de tendencia pasaron")
