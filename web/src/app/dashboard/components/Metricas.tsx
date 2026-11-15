import type { Tendencia } from '@/lib/metricas-tipos';

// ---------- Tarjeta de una métrica ----------

function etiquetaTendencia(t: Tendencia, unidad: string, subirEsMalo: boolean) {
  if (t.seguridad_pct < 50 || t.cambio === 0) {
    return { texto: 'Sin cambio claro en 40 años', clase: 'bg-gray-100 text-gray-600', icono: '→' };
  }
  const sube = t.cambio > 0;
  const malo = sube === subirEsMalo;
  const valor = `${sube ? '+' : ''}${Math.abs(t.cambio) >= 10 ? Math.round(t.cambio) : t.cambio.toFixed(1)} ${unidad}`;
  return {
    texto: `${valor} por década${t.seguridad_pct >= 80 ? '' : ' (posible)'}`,
    clase: malo ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700',
    icono: sube ? '↑' : '↓',
  };
}

interface MetricaCardProps {
  icono: string;
  titulo: string;
  valor: string;
  unidad?: string;
  detalle: string;
  tendencia?: { t: Tendencia; unidad: string; subirEsMalo: boolean };
}

export function MetricaCard({ icono, titulo, valor, unidad, detalle, tendencia }: MetricaCardProps) {
  const etiqueta = tendencia ? etiquetaTendencia(tendencia.t, tendencia.unidad, tendencia.subirEsMalo) : null;
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-gray-600">
        <span aria-hidden="true" className="text-lg">
          {icono}
        </span>
        {titulo}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
        {valor}
        {unidad ? <span className="ml-1 text-base font-semibold text-gray-500">{unidad}</span> : null}
      </p>
      <p className="mt-1 flex-1 text-sm leading-snug text-gray-600">{detalle}</p>
      {etiqueta ? (
        <p
          className={`mt-3 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${etiqueta.clase}`}
          title={`Seguridad estadística de la tendencia: ${tendencia!.t.seguridad_pct}%`}
        >
          <span aria-hidden="true">{etiqueta.icono}</span> {etiqueta.texto}
        </p>
      ) : null}
    </div>
  );
}

// ---------- Humedad del suelo, 26 semanas desde el 1 de mayo ----------

const MESES_SEMANA = [
  { semana: 0, mes: 'May' },
  { semana: 4.4, mes: 'Jun' },
  { semana: 8.7, mes: 'Jul' },
  { semana: 13.1, mes: 'Ago' },
  { semana: 17.6, mes: 'Sep' },
  { semana: 21.9, mes: 'Oct' },
];

export function GraficaHumedad({ semanas }: { semanas: (number | null)[] }) {
  const W = 320;
  const H = 120;
  const pad = { l: 8, r: 8, t: 12, b: 22 };
  const x = (i: number) => pad.l + (i / (semanas.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v) * (H - pad.t - pad.b); // escala 0 (seco) a 1 (empapado)
  const puntos = semanas
    .map((v, i) => (v === null ? null : { i, v }))
    .filter((p): p is { i: number; v: number } => p !== null);
  const linea = puntos.map((p, k) => `${k ? 'L' : 'M'}${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ');
  const area = `${linea} L${x(puntos[puntos.length - 1].i)} ${y(0)} L${x(puntos[0].i)} ${y(0)} Z`;
  const min = puntos.reduce((a, b) => (b.v < a.v ? b : a));
  const max = puntos.reduce((a, b) => (b.v > a.v ? b : a));

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Humedad del suelo por semana de mayo a octubre">
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} stroke="#E5E7EB" strokeWidth="1" />
        ))}
        <path d={area} fill="#2B7BB9" opacity="0.12" />
        <path d={linea} fill="none" stroke="#2B7BB9" strokeWidth="2" strokeLinejoin="round" />
        {puntos.map((p) => (
          <g key={p.i}>
            <rect x={x(p.i) - 6} y={pad.t} width="12" height={H - pad.t - pad.b} fill="transparent">
              <title>{`Semana ${p.i + 1}: humedad ${Math.round(p.v * 100)}%`}</title>
            </rect>
          </g>
        ))}
        {[min, max].map((p) => (
          <g key={p.i}>
            <circle cx={x(p.i)} cy={y(p.v)} r="4" fill="#2B7BB9" stroke="#fff" strokeWidth="2" />
            <text x={x(p.i)} y={y(p.v) - 8} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="600">
              {Math.round(p.v * 100)}%
            </text>
          </g>
        ))}
        {MESES_SEMANA.map((m) => (
          <text key={m.mes} x={x(m.semana)} y={H - 6} fontSize="10" fill="#6B7280" textAnchor={m.semana === 0 ? 'start' : 'middle'}>
            {m.mes}
          </text>
        ))}
      </svg>
      <figcaption className="sr-only">
        Humedad semanal (0% seco, 100% empapado): mínimo {Math.round(min.v * 100)}% en la semana {min.i + 1},
        máximo {Math.round(max.v * 100)}% en la semana {max.i + 1}.
      </figcaption>
    </figure>
  );
}
