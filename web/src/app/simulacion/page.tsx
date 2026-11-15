import { Suspense } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { SimulacionCliente } from './SimulacionCliente';

interface SimulacionPageProps {
  searchParams: Promise<{ cultivos?: string | string[] }>;
}

function SimulacionFallback() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-24 sm:px-6 lg:px-8">
      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 h-9 w-2/3 animate-pulse rounded-lg bg-gray-200" />
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-gray-200" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

async function SimulacionContent({ searchParams }: SimulacionPageProps) {
  const params = await searchParams;
  const cultivos = Array.isArray(params.cultivos)
    ? params.cultivos.join(',')
    : (params.cultivos ?? '');

  return <SimulacionCliente initialCultivos={cultivos} />;
}

export default function SimulacionPage({ searchParams }: SimulacionPageProps) {
  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-16">
      <Navbar />
      <Suspense fallback={<SimulacionFallback />}>
        <SimulacionContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
