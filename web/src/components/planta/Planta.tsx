// Mascota de RotaMaya: una maceta con cara y una planta que crece.
// Etapas: 0 semilla, 1 brote, 2 crecimiento, 3 floración, 4 con fruto.

export type Animo = 'feliz' | 'contenta' | 'sed' | 'calor' | 'mustia';

interface PlantaProps {
  etapa?: 0 | 1 | 2 | 3 | 4;
  animo?: Animo;
  fruto?: string; // color del fruto
  className?: string;
  titulo?: string;
}

const ALTURA_TALLO = [0, 26, 52, 76, 88];

const COLOR_HOJA: Record<Animo, string> = {
  feliz: '#43A047',
  contenta: '#66BB6A',
  sed: '#AFB42B',
  calor: '#7CB342',
  mustia: '#A1887F',
};

function Hoja({ x, y, lado, caida, color }: { x: number; y: number; lado: 1 | -1; caida: number; color: string }) {
  const angulo = lado === 1 ? -25 + caida : 205 - caida;
  return (
    <path
      d="M0 0 Q 14 -12 30 0 Q 14 9 0 0 Z"
      fill={color}
      transform={`translate(${x} ${y}) rotate(${angulo})`}
    />
  );
}

export function Planta({ etapa = 2, animo = 'feliz', fruto = '#E53935', className = '', titulo }: PlantaProps) {
  const alto = ALTURA_TALLO[etapa];
  const topeY = 142 - alto;
  const color = COLOR_HOJA[animo];
  const caida = animo === 'sed' || animo === 'mustia' ? 45 : animo === 'calor' ? 15 : 0;
  const pares = etapa === 0 ? 0 : etapa === 1 ? 1 : etapa === 2 ? 2 : 3;
  const hojas = Array.from({ length: pares }, (_, i) => 142 - ((i + 1) * alto) / (pares + 0.6));
  const curva = animo === 'sed' || animo === 'mustia' ? 14 : 4;

  const ojosCerrados = animo === 'mustia';
  const boca =
    animo === 'feliz'
      ? 'M88 186 Q100 199 112 186'
      : animo === 'contenta'
        ? 'M90 188 Q100 194 110 188'
        : animo === 'calor'
          ? 'M92 190 Q100 186 108 190'
          : 'M90 192 Q100 183 110 192';

  return (
    <svg viewBox="0 0 200 220" className={className} role="img" aria-label={titulo ?? `Planta ${animo}`}>
      {/* sombra */}
      <ellipse cx="100" cy="212" rx="48" ry="6" fill="currentColor" opacity="0.08" />

      <g className={animo === 'feliz' ? 'planta-mecer' : animo === 'mustia' ? '' : 'planta-mecer-lento'}>
        {etapa === 0 ? (
          <g>
            <ellipse cx="100" cy="138" rx="9" ry="6" fill="#8D6E63" />
            <path d="M100 133 Q104 126 109 127" stroke="#66BB6A" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <path
              d={`M100 142 Q ${100 + curva} ${142 - alto / 2} ${100 + curva * 0.6} ${topeY}`}
              stroke="#558B2F"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            {hojas.map((y, i) => (
              <g key={i}>
                <Hoja x={100 + curva * 0.4} y={y} lado={1} caida={caida} color={color} />
                <Hoja x={100 + curva * 0.4} y={y + 6} lado={-1} caida={caida} color={color} />
              </g>
            ))}
            {/* hoja de la punta */}
            <path
              d="M0 0 Q 8 -16 0 -30 Q -8 -16 0 0 Z"
              fill={color}
              transform={`translate(${100 + curva * 0.6} ${topeY}) rotate(${caida / 2})`}
            />
            {etapa === 3 ? (
              <g>
                {[-14, 0, 14].map((dx) => (
                  <g key={dx} transform={`translate(${100 + curva * 0.6 + dx} ${topeY - 4 + Math.abs(dx) / 2})`}>
                    {[0, 72, 144, 216, 288].map((r) => (
                      <circle key={r} cx={Math.cos((r * Math.PI) / 180) * 4} cy={Math.sin((r * Math.PI) / 180) * 4} r="3.2" fill="#FFD54F" />
                    ))}
                    <circle r="2.4" fill="#F57F17" />
                  </g>
                ))}
              </g>
            ) : null}
            {etapa === 4
              ? hojas.slice(0, 2).map((y, i) => (
                  <g key={i}>
                    <circle cx={100 + curva * 0.4 + 22} cy={y + 12} r="8" fill={fruto} />
                    <circle cx={100 + curva * 0.4 - 22} cy={y + 18} r="7" fill={fruto} />
                    <circle cx={100 + curva * 0.4 + 19} cy={y + 9} r="2" fill="#fff" opacity="0.5" />
                  </g>
                ))
              : null}
          </g>
        )}
      </g>

      {/* maceta */}
      <path d="M56 150 L144 150 L134 208 Q100 214 66 208 Z" fill="#C8693C" />
      <rect x="48" y="138" width="104" height="16" rx="7" fill="#D9804F" />
      <ellipse cx="100" cy="141" rx="46" ry="4" fill="#5D4037" />

      {/* cara */}
      <g className={ojosCerrados ? '' : 'planta-parpadeo'}>
        {ojosCerrados ? (
          <g stroke="#3E2723" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M80 174 Q85 178 90 174" />
            <path d="M110 174 Q115 178 120 174" />
          </g>
        ) : (
          <g fill="#3E2723">
            <ellipse cx="85" cy="174" rx="5" ry="6" />
            <ellipse cx="115" cy="174" rx="5" ry="6" />
            <circle cx="86.5" cy="172" r="1.6" fill="#fff" />
            <circle cx="116.5" cy="172" r="1.6" fill="#fff" />
          </g>
        )}
      </g>
      <path d={boca} stroke="#3E2723" strokeWidth="3" fill="none" strokeLinecap="round" />
      {animo === 'feliz' || animo === 'calor' ? (
        <g fill={animo === 'calor' ? '#E53935' : '#F48FB1'} opacity="0.55">
          <ellipse cx="74" cy="186" rx="6" ry="3.5" />
          <ellipse cx="126" cy="186" rx="6" ry="3.5" />
        </g>
      ) : null}
      {animo === 'calor' ? (
        <path d="M138 162 Q142 170 138 174 Q134 170 138 162 Z" fill="#4FC3F7" className="planta-gota" />
      ) : null}
      {animo === 'sed' ? (
        <g className="planta-gota">
          <path d="M150 112 Q156 122 150 127 Q144 122 150 112 Z" fill="#4FC3F7" opacity="0.9" />
          <text x="160" y="110" fontSize="14" fill="#0277BD" fontWeight="700">?</text>
        </g>
      ) : null}
    </svg>
  );
}
