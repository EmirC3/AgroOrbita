import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { COOKIE_CP, COOKIE_MUNICIPIO, COOKIE_NOMBRE, lugarDesdeCP, nombreDesdeCookie } from '@/lib/metricas';
import { Simulador } from './Simulador';

interface SimuladorPageProps {
  searchParams: Promise<{ cultivo?: string | string[] }>;
}

async function SimuladorContent({ searchParams }: SimuladorPageProps) {
  const params = await searchParams;
  const jar = await cookies();
  const lugar = lugarDesdeCP(jar.get(COOKIE_CP)?.value, jar.get(COOKIE_MUNICIPIO)?.value);
  if (!lugar) redirect('/');

  const nombre = nombreDesdeCookie(jar.get(COOKIE_NOMBRE)?.value);
  const m = lugar.metricas;
  const cultivo = Array.isArray(params.cultivo) ? params.cultivo[0] : params.cultivo;

  return (
    <>
      <Navbar nombre={nombre || undefined} activo="simulador" />
      <Simulador
        municipio={m.nombre}
        inicioLluviasDia={m.promedio.inicio_lluvias_dia_del_anio}
        cultivos={m.cultivos}
        rotaciones={m.rotaciones}
        cultivoInicial={cultivo && m.cultivos[cultivo] ? cultivo : null}
      />
    </>
  );
}

export default function SimuladorPage({ searchParams }: SimuladorPageProps) {
  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-24 md:pb-14">
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-3xl px-4 pt-24">
            <div className="h-8 w-2/3 animate-pulse rounded-lg bg-gray-200" />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          </div>
        }
      >
        <SimuladorContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
