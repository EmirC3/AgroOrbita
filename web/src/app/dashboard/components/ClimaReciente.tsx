import { obtenerClimaReciente, type ClimaReciente as Datos } from '@/lib/clima-reciente';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function fechaLegible(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MESES[m - 1]}`;
}

function Dato({ icono, titulo, valor, detalle }: { icono: string; titulo: string; valor: string; detalle: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-3">
      <p className="text-xs font-semibold text-gray-600">
        <span aria-hidden="true">{icono}</span> {titulo}
      </p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{valor}</p>
      <p className="text-xs text-gray-600">{detalle}</p>
    </div>
  );
}

export async function ClimaReciente({ lat, lon, municipio }: { lat: number; lon: number; municipio: string }) {
  let datos: Datos;
  try {
    datos = await obtenerClimaReciente(lat, lon);
  } catch {
    return (
      <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
        No pudimos traer el clima reciente de NASA POWER en este momento. Intenta más tarde.
      </section>
    );
  }

  const h = datos.humedadSuelo;
  const cambio = h !== null && datos.humedadSueloHace7d !== null ? h - datos.humedadSueloHace7d : null;

  return (
    <section className="mt-6 rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5" aria-labelledby="clima-reciente">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="clima-reciente" className="text-xl font-bold text-gray-900">
          Así va el clima en {municipio}
        </h2>
        <p className="text-xs font-semibold text-sky-800">Datos NASA hasta el {fechaLegible(datos.ultimoDia)}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Dato icono="🌧️" titulo="Lluvia, últimos 30 días" valor={`${datos.lluvia30dMm} mm`} detalle={`${datos.diasConLluvia30d} días con lluvia`} />
        <Dato icono="🌡️" titulo="Máxima, últimos 7 días" valor={`${datos.tmaxProm7d} °C`} detalle="promedio de la temperatura más alta" />
        <Dato
          icono="🔥"
          titulo="Días de más de 35 °C"
          valor={String(datos.diasCalor35_30d)}
          detalle="en los últimos 30 días"
        />
        <Dato
          icono="🌱"
          titulo="Humedad del suelo"
          valor={h !== null ? `${Math.round(h * 100)}%` : 's/d'}
          detalle={
            cambio === null
              ? 'sin dato reciente'
              : Math.abs(cambio) < 0.02
                ? 'igual que hace una semana'
                : cambio > 0
                  ? 'más húmedo que hace una semana'
                  : 'más seco que hace una semana'
          }
        />
      </div>
    </section>
  );
}
