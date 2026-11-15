interface ResumenZonaCardProps {
  municipio: string;
  zona: string;
  cp: string;
  fuenteClima: string;
}

export function ResumenZonaCard({ municipio, zona, cp, fuenteClima }: ResumenZonaCardProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2E7D32] text-white shadow-sm">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#2E7D32]">
              Tu zona
            </p>
            <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-gray-900">{municipio}</h2>
            <p className="text-sm text-gray-600">{zona} · Yucatán</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700">
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
              />
            </svg>
            CP {cp}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2E7D32]/10 px-3 py-1.5 text-sm font-semibold text-[#1B5E20]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]" />
            {fuenteClima}
          </span>
        </div>
      </div>
    </section>
  );
}
