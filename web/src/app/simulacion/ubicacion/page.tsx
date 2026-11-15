import { Suspense } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { UbicacionForm } from './UbicacionForm';

interface UbicacionPageProps {
  searchParams: Promise<{ cultivos?: string | string[] }>;
}

function UbicacionFallback() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-24 sm:px-6 lg:px-8">
      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 h-9 w-2/3 animate-pulse rounded-lg bg-gray-200" />
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-gray-200" />
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}

async function UbicacionContent({ searchParams }: UbicacionPageProps) {
  const params = await searchParams;
  const cultivos = Array.isArray(params.cultivos)
    ? params.cultivos.join(',')
    : (params.cultivos ?? '');

  return <UbicacionForm cultivos={cultivos} />;
}

export default function UbicacionPage({ searchParams }: UbicacionPageProps) {
  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-16">
      <Navbar />
      <Suspense fallback={<UbicacionFallback />}>
        <UbicacionContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
