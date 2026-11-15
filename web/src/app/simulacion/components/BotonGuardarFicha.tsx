'use client';

interface BotonGuardarFichaProps {
  className?: string;
}

export function BotonGuardarFicha({ className = '' }: BotonGuardarFichaProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2E7D32] px-6 text-base font-semibold text-white transition-colors hover:bg-[#1B5E20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 ${className}`}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 4h9l3 3v3M6 4v5m0 0h12M6 9H4v7h2m12-7h2v7h-2M8 20h8v-6H8v6z"
        />
      </svg>
      Guardar Ficha de Siembra →
    </button>
  );
}
