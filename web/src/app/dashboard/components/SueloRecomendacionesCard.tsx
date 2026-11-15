import type { ContextoSuelo, RecomendacionSuelo } from '../types';

interface SueloRecomendacionesCardProps {
  municipio: string;
  suelo: string | null;
  contexto: ContextoSuelo;
  recomendaciones: RecomendacionSuelo[];
  limitaciones: string[];
}

export function SueloRecomendacionesCard({
  municipio,
  suelo,
  contexto,
  recomendaciones,
  limitaciones,
}: SueloRecomendacionesCardProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <header className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2E7D32]/10 text-[#2E7D32]">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 22V12m0 0a5 5 0 00-5-5H4a8 8 0 008 8m0-3a5 5 0 015-5h3a8 8 0 01-8 8"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">
            Suelo y recomendaciones
          </h2>
          <p className="text-sm text-gray-600">Qué cuidar en la tierra de {municipio}</p>
        </div>
      </header>

      <div className="mt-5 rounded-xl bg-[#FAF9F6] px-4 py-4">
        {suelo ? (
          <p className="text-base font-semibold text-gray-900">{suelo}</p>
        ) : (
          <p className="text-base font-semibold text-gray-800">
            Sin análisis de suelo verificado
          </p>
        )}
        <p className="mt-1 text-sm leading-relaxed text-gray-600">{contexto.estado}</p>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">
          Suelos predominantes en Yucatán
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {contexto.suelos_predominantes.map((tipo) => (
            <span
              key={tipo}
              className="inline-flex cursor-default select-none items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-sm font-medium text-gray-700"
            >
              {tipo}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {recomendaciones.map((recomendacion, indice) => (
          <div key={recomendacion.titulo} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2E7D32]/10 text-sm font-bold text-[#1B5E20]">
              {indice + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-800">{recomendacion.titulo}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-gray-600">
                {recomendacion.detalle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {limitaciones.length > 0 ? (
        <p className="mt-4 border-t border-gray-100 pt-3 text-sm leading-relaxed text-gray-600">
          {limitaciones[0]}
        </p>
      ) : null}
    </section>
  );
}
