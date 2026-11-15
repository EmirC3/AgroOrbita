import { Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { CULTIVOS } from '../cultivos';
import { CultivoIcon } from '../components/CultivoIcon';
import { EscucharBoton } from '../components/EscucharBoton';
import { BotonGuardarFicha } from '../components/BotonGuardarFicha';
import { obtenerCalendario, nombreMes } from '../calendario';
import { obtenerMunicipio, obtenerUbicacion } from '../datos';
import { obtenerSueloDemo } from '../suelos';

interface ResultadoPageProps {
  searchParams: Promise<{
    cultivos?: string | string[];
    cp?: string | string[];
    tamano?: string | string[];
    mes?: string | string[];
  }>;
}

function ResultadoFallback() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-24 sm:px-6 lg:px-8">
      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 h-9 w-2/3 animate-pulse rounded-lg bg-gray-200" />
      <div className="mt-6 h-32 animate-pulse rounded-2xl bg-gray-100" />
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-48 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

async function ResultadoContent({ searchParams }: ResultadoPageProps) {
  const params = await searchParams;
  const cultivos = Array.isArray(params.cultivos)
    ? params.cultivos.join(',')
    : (params.cultivos ?? '');
  const cp = Array.isArray(params.cp) ? params.cp[0] : (params.cp ?? '');
  const tamano = Array.isArray(params.tamano) ? params.tamano[0] : (params.tamano ?? 'mediana');
  const mesParam = Array.isArray(params.mes) ? params.mes[0] : params.mes;

  const ubicacion = obtenerUbicacion(cp);

  if (!ubicacion) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 pt-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Falta tu ubicación</h1>
        <p className="mt-2 text-base text-gray-600">
          Necesitamos tu código postal para mostrarte el diagnóstico de tu tierra.
        </p>
        <Link
          href={`/simulacion/ubicacion?cultivos=${encodeURIComponent(cultivos)}`}
          className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-[#2E7D32] px-6 text-base font-semibold text-white transition-colors hover:bg-[#1B5E20]"
        >
          Elegir mi ubicación
        </Link>
      </div>
    );
  }

  const municipioData = obtenerMunicipio(ubicacion.municipio);
  const clima = municipioData?.clima ?? null;
  const calendario = obtenerCalendario(ubicacion.municipio);
  const mesNumero = Number(mesParam);
  const mesValido =
    Number.isInteger(mesNumero) && mesNumero >= 1 && mesNumero <= 12
      ? mesNumero
      : undefined;
  const mesData =
    calendario.datos.find((mes) => mes.mes === mesValido) ?? calendario.datos[5] ?? calendario.datos[0];
  const mesLargo = nombreMes(mesData.mes);

  const ids = cultivos.split(',').filter(Boolean);
  const seleccionados = CULTIVOS.filter((cultivo) => ids.includes(cultivo.id));
  const cultivosNombres =
    seleccionados.map((cultivo) => cultivo.nombre).join(' + ') || 'tus cultivos';

  const humedadPct = clima ? Math.round(clima.gwetroot_prom * 100) : null;
  const favorable = humedadPct !== null && humedadPct >= 60;
  const nitrogeno = ids.includes('frijol');
  const suelo = obtenerSueloDemo(ubicacion.municipio);
  const incluyeEjemplo = calendario.esEjemplo || suelo !== null;

  const resumenVoz = `Diagnóstico para ${ubicacion.municipio}. ${
    humedadPct !== null ? `Humedad radicular de ${humedadPct} por ciento.` : 'Sin dato de humedad.'
  } Mes sugerido: ${mesLargo}. ${cultivosNombres}. ${
    nitrogeno ? 'El frijol aporta nitrógeno.' : 'Puedes agregar una leguminosa para aportar nitrógeno.'
  }`;

  const queryBase = `cultivos=${encodeURIComponent(cultivos)}&cp=${cp}&tamano=${tamano}`;
  const calendarioHref = `/simulacion/calendario?${queryBase}`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-24 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-gray-700">Paso 4 de 4</p>
        <div
          className="h-2 w-24 overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={4}
          aria-label="Paso 4 de 4"
        >
          <div className="h-full w-full rounded-full bg-[#2E7D32]" />
        </div>
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        ¿Está lista tu tierra?
      </h1>
      <p className="mt-2 text-base text-gray-600">
        {ubicacion.municipio}, Yucatán · Datos de NASA POWER
        {incluyeEjemplo ? ' · Incluye datos de ejemplo' : ''}
      </p>

      <section
        className={`mt-6 rounded-2xl p-6 text-white shadow-sm ${
          favorable ? 'bg-[#1B5E20]' : 'bg-amber-700'
        }`}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {favorable ? 'Condiciones favorables' : 'Revisa con cautela'}
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">
              {favorable
                ? '¡Tu tierra muestra señales para sembrar!'
                : 'Tu tierra necesita una revisión más'}
            </h2>
            <p className="mt-2 max-w-xl text-base leading-relaxed text-white/85">
              {humedadPct !== null
                ? `Humedad radicular de ${humedadPct}% y temperatura máxima promedio de ${
                    clima?.tmax_prom_c != null ? `${clima.tmax_prom_c.toFixed(1)} °C` : 'sin dato'
                  }.`
                : 'Todavía no hay suficiente información climática para este municipio.'}
            </p>
          </div>

          <div className="rounded-xl bg-white/15 px-5 py-4 text-center sm:min-w-44">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Ventana sugerida
            </p>
            <p className="mt-1 text-2xl font-bold">{mesLargo}</p>
            <p className="mt-1 text-sm leading-snug text-white/80">
              Según la lluvia mensual
            </p>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3s6 6.45 6 10.5a6 6 0 11-12 0C6 9.45 12 3 12 3z" />
              </svg>
            </span>
            <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-800">
              GWETROOT
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">
            {humedadPct !== null ? `${humedadPct}%` : 'Sin dato'}
          </p>
          <p className="text-sm font-semibold text-gray-700">Agua en raíz</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            {humedadPct !== null
              ? humedadPct >= 60
                ? 'Buena reserva de humedad para el arranque del cultivo.'
                : 'Humedad baja: conviene esperar lluvias o prever riego.'
              : 'Sin dato de humedad radicular para este municipio.'}
          </p>
          {humedadPct !== null ? (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-sky-600"
                style={{ width: `${humedadPct}%` }}
              />
            </div>
          ) : null}
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 21c8 0 14-6 14-14V4h-3C8 4 4 10 5 21z" />
              </svg>
            </span>
            <span className="rounded-md bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-800">
              {suelo ? 'Datos de ejemplo' : 'Por verificar'}
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900">
            {suelo?.nombre ?? 'Por verificar'}
          </p>
          <p className="text-sm font-semibold text-gray-700">Suelo</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            {suelo?.descripcion ??
              'Sin análisis de suelo verificado para este municipio. No mostramos una calificación inventada.'}
          </p>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2E7D32]/10 text-[#2E7D32]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 00-14.9-3M4 16a8 8 0 0014.9 3" />
              </svg>
            </span>
            <span className="rounded-md bg-[#2E7D32]/10 px-2 py-0.5 text-xs font-semibold text-[#1B5E20]">
              {nitrogeno ? 'Buena pareja' : 'Sugerencia'}
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900">
            {nitrogeno ? 'Aporte natural' : 'Agrega leguminosa'}
          </p>
          <p className="text-sm font-semibold text-gray-700">Nitrógeno</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            {nitrogeno
              ? 'El frijol o xpelón fija nitrógeno y ayuda al maíz a crecer con mejor suelo.'
              : 'Incluye frijol o xpelón en tu milpa para aportar nitrógeno de forma natural.'}
          </p>
        </article>
      </div>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">Tu selección</p>
        {seleccionados.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {seleccionados.map((cultivo) => (
              <span
                key={cultivo.id}
                className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32]/10 px-3 py-1.5 text-sm font-semibold text-[#1B5E20]"
              >
                <CultivoIcon id={cultivo.id} className="h-5 w-5" />
                {cultivo.nombre}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-600">No hay cultivos seleccionados.</p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Recomendación para {cultivosNombres} en la {municipioData?.zona ?? ubicacion.zona} de{' '}
          {ubicacion.municipio}.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-[#FFF7ED] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-900">Consejo de la milpa</p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-orange-800">
            “Sembrar con las primeras lluvias de {mesLargo} le da fuerza a la raíz antes del calor
            fuerte. La decisión final siempre es tuya.”
          </p>
        </div>
        <EscucharBoton texto={resumenVoz} etiqueta="Escuchar resumen" />
      </div>

      <div className="mt-8 flex flex-col-reverse items-stretch gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={calendarioHref}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:text-[#2E7D32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2"
        >
          ← Volver al Calendario
        </Link>
        <BotonGuardarFicha className="w-full sm:w-auto" />
      </div>

      <div className="mt-8 flex flex-col items-start gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span className="rounded-md bg-[#0B3954] px-2.5 py-1 text-sm font-semibold text-white">
            NASA CALIBRATED
          </span>
          Landsat-9 / Sentinel-2 / SMAP Telemetry Protocol
        </p>
        <p className="text-sm text-gray-600">RotaMaya · 2026</p>
      </div>
    </div>
  );
}

export default function ResultadoPage({ searchParams }: ResultadoPageProps) {
  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-16">
      <Navbar />
      <Suspense fallback={<ResultadoFallback />}>
        <ResultadoContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
