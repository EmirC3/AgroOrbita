import { Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { CULTIVOS } from '../cultivos';
import { obtenerCalendario, recomendarMes } from '../calendario';
import { obtenerMunicipio, obtenerUbicacion } from '../datos';
import { CalendarioInteractivo } from './CalendarioInteractivo';

interface CalendarioPageProps {
  searchParams: Promise<{
    cultivos?: string | string[];
    cp?: string | string[];
    tamano?: string | string[];
  }>;
}

function CalendarioFallback() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-24 sm:px-6 lg:px-8">
      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 h-9 w-2/3 animate-pulse rounded-lg bg-gray-200" />
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-gray-200" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

async function CalendarioContent({ searchParams }: CalendarioPageProps) {
  const params = await searchParams;
  const cultivos = Array.isArray(params.cultivos)
    ? params.cultivos.join(',')
    : (params.cultivos ?? '');
  const cp = Array.isArray(params.cp) ? params.cp[0] : (params.cp ?? '');
  const tamano = Array.isArray(params.tamano) ? params.tamano[0] : (params.tamano ?? 'mediana');

  const ubicacion = obtenerUbicacion(cp);

  if (!ubicacion) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 pt-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Falta tu ubicación</h1>
        <p className="mt-2 text-base text-gray-600">
          Necesitamos tu código postal para revisar el calendario de lluvias de tu municipio.
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
  const calendario = obtenerCalendario(ubicacion.municipio);
  const recomendado = recomendarMes(calendario.datos);
  const ids = cultivos.split(',').filter(Boolean);
  const nombres = CULTIVOS.filter((cultivo) => ids.includes(cultivo.id))
    .map((cultivo) => cultivo.nombre)
    .join(' + ');

  return (
    <CalendarioInteractivo
      municipio={ubicacion.municipio}
      zona={municipioData?.zona ?? ubicacion.zona}
      cp={cp}
      cultivos={cultivos}
      tamano={tamano}
      cultivosNombres={nombres || 'tus cultivos'}
      datos={calendario.datos}
      recomendado={recomendado}
      esEjemplo={calendario.esEjemplo}
      fuente={calendario.fuente}
    />
  );
}

export default function CalendarioPage({ searchParams }: CalendarioPageProps) {
  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-16">
      <Navbar />
      <Suspense fallback={<CalendarioFallback />}>
        <CalendarioContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
