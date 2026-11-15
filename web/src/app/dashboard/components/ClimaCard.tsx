import type { ClimaMunicipio, NivelCondicion } from '../types';

interface ClimaCardProps {
  clima: ClimaMunicipio | null;
}

interface EstadoMetrica {
  nivel: NivelCondicion;
  texto: string;
}

const entero = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('es-MX', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function evaluarCalor(diasCalor: number): EstadoMetrica {
  if (diasCalor >= 80) return { nivel: 'riesgo', texto: 'Calor intenso' };
  if (diasCalor >= 60) return { nivel: 'precaucion', texto: 'Calor moderado' };
  return { nivel: 'favorable', texto: 'Calor bajo' };
}

function evaluarLluvia(lluviaAnual: number): EstadoMetrica {
  if (lluviaAnual < 900) return { nivel: 'precaucion', texto: 'Lluvia baja' };
  if (lluviaAnual < 1150) return { nivel: 'favorable', texto: 'Lluvia media' };
  return { nivel: 'favorable', texto: 'Lluvia alta' };
}

const estilosCondicion: Record<NivelCondicion, string> = {
  favorable: 'bg-[#2E7D32]/10 text-[#1B5E20]',
  precaucion: 'bg-amber-100 text-amber-800',
  riesgo: 'bg-red-100 text-red-700',
};

const puntoCondicion: Record<NivelCondicion, string> = {
  favorable: 'bg-[#2E7D32]',
  precaucion: 'bg-amber-500',
  riesgo: 'bg-red-500',
};

function Indicador({ nivel, texto }: EstadoMetrica) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-sm font-semibold ${estilosCondicion[nivel]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${puntoCondicion[nivel]}`} />
      {texto}
    </span>
  );
}

function Metrica({
  etiqueta,
  valor,
  unidad,
  estado,
}: {
  etiqueta: string;
  valor: string;
  unidad?: string;
  estado?: EstadoMetrica;
}) {
  return (
    <div className="flex flex-col rounded-xl bg-[#FAF9F6] px-4 py-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">{etiqueta}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <p className="text-2xl font-bold leading-tight text-gray-900">
          {valor}
          {unidad ? (
            <span className="ml-1 text-sm font-semibold text-gray-600">{unidad}</span>
          ) : null}
        </p>
        {estado ? <Indicador {...estado} /> : null}
      </div>
    </div>
  );
}

export function ClimaCard({ clima }: ClimaCardProps) {
  const calor = clima ? evaluarCalor(clima.dias_calor_35) : null;
  const lluvia = clima ? evaluarLluvia(clima.lluvia_anual_mm) : null;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <header className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2E7D32]/10 text-[#2E7D32]">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">Datos climáticos</h2>
          <p className="text-sm text-gray-600">
            {clima ? `Promedios de ${clima.fuente}` : 'Sin registros verificados'}
          </p>
        </div>
      </header>

      {clima ? (
        <>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Metrica
              etiqueta="Lluvia anual"
              valor={entero.format(clima.lluvia_anual_mm)}
              unidad="mm"
              estado={lluvia ?? undefined}
            />
            <Metrica
              etiqueta="Lluvia may–oct"
              valor={
                clima.lluvia_may_oct_mm !== null
                  ? entero.format(clima.lluvia_may_oct_mm)
                  : 'Sin dato'
              }
              unidad={clima.lluvia_may_oct_mm !== null ? 'mm' : undefined}
            />
            <Metrica
              etiqueta="Temp. máxima"
              valor={
                clima.tmax_prom_c !== null ? decimal.format(clima.tmax_prom_c) : 'Sin dato'
              }
              unidad={clima.tmax_prom_c !== null ? '°C' : undefined}
            />
            <Metrica
              etiqueta="Temp. mínima"
              valor={
                clima.tmin_prom_c !== null ? decimal.format(clima.tmin_prom_c) : 'Sin dato'
              }
              unidad={clima.tmin_prom_c !== null ? '°C' : undefined}
            />
            <Metrica
              etiqueta="Días > 35 °C"
              valor={decimal.format(clima.dias_calor_35)}
              unidad="días/año"
              estado={calor ?? undefined}
            />
            <Metrica
              etiqueta="Humedad radicular"
              valor={decimal.format(clima.gwetroot_prom)}
              unidad="0–1"
            />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            Fuente: {clima.fuente}. La humedad radicular es el valor GWETROOT de NASA POWER.
          </p>
        </>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 px-4 py-5">
          <p className="text-base font-semibold text-gray-700">
            Aún no hay clima verificado para este municipio
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Preferimos no mostrar cifras estimadas. Cuando la ingeniería de datos publique los
            promedios, aparecerán aquí.
          </p>
        </div>
      )}
    </section>
  );
}
