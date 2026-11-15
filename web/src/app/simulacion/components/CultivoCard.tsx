import type { Cultivo, CultivoId } from '../cultivos';
import { CultivoIcon } from './CultivoIcon';

interface CultivoCardProps {
  cultivo: Cultivo;
  seleccionado: boolean;
  onToggle: (id: CultivoId) => void;
}

export function CultivoCard({ cultivo, seleccionado, onToggle }: CultivoCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(cultivo.id)}
      aria-pressed={seleccionado}
      aria-label={`${cultivo.nombre}: ${cultivo.descripcion}`}
      className={`relative flex flex-col items-center rounded-2xl border-2 p-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 sm:p-5 ${
        seleccionado
          ? 'border-[#2E7D32] bg-[#F1F8F2] shadow-sm'
          : 'border-gray-200 bg-white hover:border-[#2E7D32]/40 hover:bg-[#2E7D32]/5'
      }`}
    >
      {seleccionado ? (
        <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2E7D32] text-white sm:right-3 sm:top-3">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      ) : null}

      <span
        className={`flex h-16 w-16 items-center justify-center rounded-full ${cultivo.fondo} sm:h-20 sm:w-20`}
      >
        <CultivoIcon id={cultivo.id} className="h-9 w-9 sm:h-11 sm:w-11" />
      </span>

      <span className="mt-3 text-base font-semibold text-gray-900 sm:text-lg">{cultivo.nombre}</span>
      <span className="mt-1 text-sm leading-snug text-gray-600">{cultivo.descripcion}</span>
    </button>
  );
}
