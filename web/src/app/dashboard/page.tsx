import { Suspense } from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { Button } from '@/components/ui/Button';
import { COOKIE_CP, COOKIE_MUNICIPIO, COOKIE_NOMBRE, lugarDesdeCP, nombreDesdeCookie } from '@/lib/metricas';
import { evaluar, fechaDesdeDia, rankingCultivos, type MetricasMunicipio } from '@/lib/metricas-tipos';
import { apariencia } from '@/lib/cultivos-juego';
import { PanelMascota } from './components/PanelMascota';
import { ClimaReciente } from './components/ClimaReciente';
import { GraficaHumedad, MetricaCard } from './components/Metricas';

interface DashboardPageProps {
  searchParams: Promise<{ cp?: string | string[] }>;
}

/** Consejo corto y verificable sacado de las métricas reales del municipio. */
function consejoDelLugar(m: MetricasMunicipio): string {
  const inicio = fechaDesdeDia(m.promedio.inicio_lluvias_dia_del_anio);
  const maiz = m.cultivos.MAIZ_01;
  if (maiz?.si_siembras?.length) {
    const tipica = maiz.si_siembras.find((o) => o.dias_desde_inicio_lluvias === 0) ?? maiz.si_siembras[0];
    const mejor = [...maiz.si_siembras].sort((a, b) => evaluar(maiz, b).salud - evaluar(maiz, a).salud)[0];
    if (mejor.dias_desde_inicio_lluvias !== tipica.dias_desde_inicio_lluvias) {
      const cuando =
        mejor.dias_desde_inicio_lluvias > 0
          ? `${mejor.dias_desde_inicio_lluvias / 7} semanas después`
          : `${-mejor.dias_desde_inicio_lluvias / 7} semanas antes`;
      return `Las lluvias suelen empezar el ${inicio}. Si siembras maíz ${cuando} de las primeras lluvias, solo tendrás que regar en la floración ${mejor.anios_con_falta_agua_de_cada_10} de cada 10 años (en vez de ${tipica.anios_con_falta_agua_de_cada_10}).`;
    }
    return `Las lluvias suelen empezar el ${inicio}. Para el maíz, sembrar con las primeras lluvias es lo que mejor ha funcionado aquí.`;
  }
  return `Las lluvias suelen empezar el ${inicio}.`;
}

function SinParcela() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col items-center justify-center px-4 pb-16 pt-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Primero elige tu parcela</h1>
      <p className="mt-2 text-base text-gray-600">Dinos tu nombre y tu código postal para ver el clima de tu municipio.</p>
      <Button href="/" fullWidth className="mt-6">
        Empezar
      </Button>
    </div>
  );
}

function DashboardFallback() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-24 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="h-72 animate-pulse rounded-3xl bg-gray-100 lg:col-span-3" />
        <div className="h-72 animate-pulse rounded-3xl bg-gray-100 lg:col-span-2" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

async function DashboardContent({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const jar = await cookies();
  const cpParam = Array.isArray(params.cp) ? params.cp[0] : params.cp;
  const nombre = nombreDesdeCookie(jar.get(COOKIE_NOMBRE)?.value);
  // ?cp= (enlace compartido) tiene prioridad sobre la sesión guardada.
  const lugar = lugarDesdeCP(cpParam) ?? lugarDesdeCP(jar.get(COOKIE_CP)?.value, jar.get(COOKIE_MUNICIPIO)?.value);

  if (!lugar) {
    return (
      <>
        <Navbar nombre={nombre || undefined} activo="inicio" />
        <SinParcela />
      </>
    );
  }

  const m = lugar.metricas;
  const p = m.promedio;
  const t = m.tendencia_por_decada;
  const r = m.rango_8_de_10_anios;
  const ranking = rankingCultivos(m);
  const rotacion = [...m.rotaciones]
    .filter((x) => x.id !== 'maiz_solo')
    .sort((a, b) => a.anios_con_falta_agua_de_cada_10 - b.anios_con_falta_agua_de_cada_10 || b.puntos_suelo - a.puntos_suelo)[0];
  const balance = p.deficit_agua_mm;

  return (
    <>
      <Navbar nombre={nombre || undefined} activo="inicio" />
      <div className="mx-auto w-full max-w-5xl px-4 pt-20 sm:px-6 lg:px-8">
        {lugar.aproximado ? (
          <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
            Aún no tenemos métricas propias de {lugar.municipioCP}; te mostramos las de{' '}
            <strong>{m.nombre}</strong>, el municipio piloto más cercano.
          </p>
        ) : null}

        <PanelMascota nombre={nombre || 'agricultor'} municipio={m.nombre} consejo={consejoDelLugar(m)} />

        <Suspense fallback={<div className="mt-6 h-40 animate-pulse rounded-3xl bg-sky-50" />}>
          <ClimaReciente lat={m.punto_cuadricula_nasa.lat} lon={m.punto_cuadricula_nasa.lon} municipio={m.nombre} />
        </Suspense>

        <section className="mt-8" aria-labelledby="clima">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="clima" className="text-xl font-bold text-gray-900">
                El clima de {m.nombre}
              </h2>
              <p className="text-sm text-gray-600">Historia de 1985 a 2025 · temporada de lluvias (mayo a octubre)</p>
            </div>
            <Link href="/?editar=1" className="text-sm font-semibold text-[#2E7D32] hover:text-[#1B5E20]">
              Cambiar lugar
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricaCard
              icono="🌧️"
              titulo="Empiezan las lluvias"
              valor={fechaDesdeDia(p.inicio_lluvias_dia_del_anio)}
              detalle={`8 de cada 10 años, entre el ${fechaDesdeDia(r.inicio_lluvias_dia_del_anio.bajo)} y el ${fechaDesdeDia(r.inicio_lluvias_dia_del_anio.alto)}.`}
              tendencia={{ t: t.inicio_lluvias_dia_del_anio, unidad: 'días', subirEsMalo: true }}
            />
            <MetricaCard
              icono="💧"
              titulo="Lluvia de mayo a octubre"
              valor={p.lluvia_mayo_octubre_mm.toLocaleString('es-MX')}
              unidad="mm"
              detalle={`Año seco: ${r.lluvia_mayo_octubre_mm.bajo} mm · año lluvioso: ${r.lluvia_mayo_octubre_mm.alto} mm.`}
              tendencia={{ t: t.lluvia_mayo_octubre_mm, unidad: 'mm', subirEsMalo: false }}
            />
            <MetricaCard
              icono="🔥"
              titulo="Días de más de 35 °C"
              valor={String(p.dias_calor_mayor_35)}
              unidad="al año"
              detalle={`Entre ${r.dias_calor_mayor_35.bajo} y ${r.dias_calor_mayor_35.alto} días, según el año.`}
              tendencia={{ t: t.dias_calor_mayor_35, unidad: 'días', subirEsMalo: true }}
            />
            <MetricaCard
              icono="☀️"
              titulo="Canícula"
              valor={String(p.duracion_canicula_dias)}
              unidad="días"
              detalle={`A media temporada llueve ${p.canicula_baja_lluvia_pct}% menos que antes y después.`}
              tendencia={{ t: t.canicula_baja_lluvia_pct, unidad: '%', subirEsMalo: true }}
            />
            <MetricaCard
              icono="⚖️"
              titulo="Balance de agua"
              valor={`${Math.abs(balance)}`}
              unidad={balance > 0 ? 'mm faltan' : 'mm sobran'}
              detalle={
                balance > 0
                  ? 'En temporada, el calor evapora más agua de la que llueve.'
                  : 'En temporada llueve un poco más de lo que el calor evapora.'
              }
              tendencia={{ t: t.deficit_agua_mm, unidad: 'mm', subirEsMalo: true }}
            />
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <span aria-hidden="true" className="text-lg">
                  🌱
                </span>
                Humedad del suelo
              </p>
              <GraficaHumedad semanas={p.humedad_suelo_semanal} />
            </div>
          </div>

        </section>

        <section className="mt-8" aria-labelledby="cultivos">
          <h2 id="cultivos" className="text-xl font-bold text-gray-900">
            ¿Qué aguanta mejor en {m.nombre}?
          </h2>
          <p className="text-sm text-gray-600">Sembrando con las primeras lluvias. Toca uno para simularlo.</p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {ranking.map(({ id, cultivo, evaluacion }, i) => (
              <li key={id}>
                <Link
                  href={`/simulador?cultivo=${id}`}
                  className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 transition-colors hover:border-[#2E7D32]"
                >
                  <span className="w-5 text-right text-sm font-bold text-gray-400">{i + 1}</span>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-2xl ${apariencia(id).fondo}`} aria-hidden="true">
                    {apariencia(id).emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-gray-900">{cultivo.nombre}</span>
                    <span className="block text-xs text-gray-600">
                      Falta agua {evaluacion.aniosFalta} de cada 10 años
                      {evaluacion.diasCalor > 0 ? ` · ${evaluacion.diasCalor} días de calor dañino` : ''}
                    </span>
                  </span>
                  <span className="w-16 shrink-0">
                    <span className="block text-right text-xs font-bold text-gray-700">{evaluacion.salud}/100</span>
                    <span className="mt-1 block h-2 overflow-hidden rounded-full bg-gray-100">
                      <span className="block h-full rounded-full bg-[#2E7D32]" style={{ width: `${evaluacion.salud}%` }} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {rotacion ? (
          <section className="mt-8 rounded-3xl border border-[#2E7D32]/20 bg-[#E8F5E9] p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#1B5E20]">Rotación recomendada</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{rotacion.nombre}</p>
            <p className="mt-1 text-sm text-gray-700">
              {rotacion.cultivos.map((c) => apariencia(c).emoji).join(' ')} · Falta agua{' '}
              {rotacion.anios_con_falta_agua_de_cada_10} de cada 10 años
              {rotacion.suelo.nitrogeno ? ' · aporta nitrógeno' : ''}
              {rotacion.suelo.cubre_suelo ? ' · cubre el suelo' : ''}
              {rotacion.suelo.corta_plagas ? ' · corta plagas' : ''}
            </p>
          </section>
        ) : null}

        <p className="mt-8 border-t border-gray-200 pt-4 text-xs leading-relaxed text-gray-500">
          Fuente: {m.fuente}. Punto NASA más cercano: {m.punto_cuadricula_nasa.lat}, {m.punto_cuadricula_nasa.lon}.
          RotaMaya te orienta; la decisión final es tuya.
        </p>
      </div>
    </>
  );
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-24 md:pb-14">
      <Suspense fallback={<DashboardFallback />}>
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
