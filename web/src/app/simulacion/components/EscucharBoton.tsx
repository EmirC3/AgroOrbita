'use client';

interface EscucharBotonProps {
  texto: string;
  etiqueta?: string;
  tono?: 'verde' | 'claro';
  className?: string;
}

export function EscucharBoton({
  texto,
  etiqueta = 'Escuchar',
  tono = 'verde',
  className = '',
}: EscucharBotonProps) {
  const escuchar = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-MX';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const estilos =
    tono === 'claro'
      ? 'border-white/60 bg-white/10 text-white hover:bg-white/20'
      : 'border-[#2E7D32] bg-white text-[#2E7D32] hover:bg-[#2E7D32]/5';

  return (
    <button
      type="button"
      onClick={escuchar}
      aria-label={`${etiqueta} en voz alta`}
      className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 ${estilos} ${className}`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M6 9v6h3l4 3V6L9 9H6z"
        />
      </svg>
      {etiqueta}
    </button>
  );
}
