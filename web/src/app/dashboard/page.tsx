import { Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { Button } from '@/components/ui/Button';
import cpData from '@/data/cp_yucatan.json';
import diagnosticoData from '@/data/diagnostico.json';
import { ResumenZonaCard } from './components/ResumenZonaCard';
import { ClimaCard } from './components/ClimaCard';
import { SueloRecomendacionesCard } from './components/SueloRecomendacionesCard';
import type { CatalogoCP, DiagnosticoData, MunicipioDiagnostico } from './types';

const catalogo = cpData as CatalogoCP;
const diagnostico = diagnosticoData as DiagnosticoData;

interface DashboardPageProps {
  searchParams: Promise<{ cp?: string | string[] }>;
}

function SinParcela({ cp }: { cp?: string }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col items-center justify-center px-4 pb-16 pt-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32]">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-900">
        Primero elige tu parcela
      </h1>
      <p className="mt-2 text-base text-gray-600">
        {cp
          ? `No reconocemos el código postal ${cp}. Revisa que sea de Yucatán y que exista en el catálogo.`
          : 'Necesitamos tu código postal para mostrar el clima y el suelo de tu municipio.'}
      </p>
      <Button href="/" fullWidth className="mt-6">
        Ingresar mi código postal
      </Button>
    </div>
  );
}

function DashboardFallback() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-24 sm:px-6 lg:px-8">
      <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
      <div className="mt-3 h-9 w-3/4 animate-pulse rounded-lg bg-gray-200" />
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-gray-200" />
      <div className="mt-6 h-24 animate-pulse rounded-2xl bg-gray-100" />
      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <div className="h-72 animate-pulse rounded-2xl bg-gray-100 lg:col-span-3" />
        <div className="h-72 animate-pulse rounded-2xl bg-gray-100 lg:col-span-2" />
      </div>
    </div>
  );
}

async function DashboardContent({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const cp = Array.isArray(params.cp) ? params.cp[0] : params.cp;
  const ubicacion = cp ? catalogo[cp] : undefined;

  if (!cp || !ubicacion) {
    return <SinParcela cp={cp} />;
  }

  const municipioData: MunicipioDiagnostico | undefined =
    diagnostico.municipios[ubicacion.municipio];

  const clima = municipioData?.clima ?? null;
  const suelo = municipioData?.suelo ?? null;
  const limitaciones = municipioData?.limitaciones ?? [
    'Aún no hay datos verificados para este municipio.',
  ];
  const zona = municipioData?.zona ?? ubicacion.zona;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-24 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2E7D32]">
            Panel de diagnóstico
          </p>
          <Link
            href="/"
            className="text-sm font-semibold text-gray-600 transition-colors hover:text-[#2E7D32]"
          >
            Cambiar código postal
          </Link>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
          Tu parcela en {ubicacion.municipio}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-gray-600">
          Clima, suelo y recomendaciones para tu zona, con datos de NASA POWER y del proyecto.
        </p>
      </header>

      <ResumenZonaCard
        municipio={ubicacion.municipio}
        zona={zona}
        cp={cp}
        fuenteClima={clima?.fuente ?? diagnostico.fuente_clima}
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ClimaCard clima={clima} />
        </div>
        <div className="lg:col-span-2">
          <SueloRecomendacionesCard
            municipio={ubicacion.municipio}
            suelo={suelo}
            contexto={diagnostico.contexto_suelo}
            recomendaciones={diagnostico.recomendaciones_suelo}
            limitaciones={limitaciones}
          />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-white/70 p-6 text-sm leading-relaxed text-gray-600">
        <strong className="font-semibold text-gray-700">Sobre estos datos: </strong>
        {diagnostico.nota}
      </div>
    </div>
  );
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-14">
      <Navbar />
      <Suspense fallback={<DashboardFallback />}>
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
