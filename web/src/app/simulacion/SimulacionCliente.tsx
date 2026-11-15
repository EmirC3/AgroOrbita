'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CULTIVOS, type CultivoId } from './cultivos';
import { CultivoCard } from './components/CultivoCard';

type Idioma = 'es' | 'maya';

interface SimulacionClienteProps {
  initialCultivos: string;
}

function obtenerMensaje(seleccion: CultivoId[]): string {
  const elegidos = new Set(seleccion);

  if (elegidos.has('maiz') && elegidos.has('frijol')) {
    return 'El frijol alimenta la tierra y el maíz le da dónde trepar.';
  }
  if (elegidos.has('maiz') && elegidos.has('calabaza')) {
    return 'La calabaza cubre el suelo y mantiene la humedad para el maíz.';
  }
  if (elegidos.has('frijol') && elegidos.has('calabaza')) {
    return 'El frijol aporta nitrógeno y la calabaza protege el suelo.';
  }
  if (elegidos.has('maiz') && elegidos.has('chile')) {
    return 'El maíz da sombra y el chile aprovecha el espacio.';
  }
  return 'Mezclar cultivos ayuda a cuidar el suelo, retener humedad y reducir plagas.';
}

export function SimulacionCliente({ initialCultivos }: SimulacionClienteProps) {
  const router = useRouter();
  const iniciales = initialCultivos
    .split(',')
    .filter((id): id is CultivoId => CULTIVOS.some((cultivo) => cultivo.id === id));

  const [seleccion, setSeleccion] = useState<CultivoId[]>(iniciales);
  const [idioma, setIdioma] = useState<Idioma>('es');

  const alternar = (id: CultivoId) => {
    setSeleccion((actual) =>
      actual.includes(id) ? actual.filter((cultivo) => cultivo !== id) : [...actual, id]
    );
  };

  const reiniciar = () => setSeleccion([]);

  const puedeContinuar = seleccion.length >= 2;
  const mensaje = puedeContinuar ? obtenerMensaje(seleccion) : null;

  const escuchar = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const nombres = seleccion
      .map((id) => CULTIVOS.find((cultivo) => cultivo.id === id)?.nombre)
      .filter(Boolean)
      .join(', ');

    window.speechSynthesis.cancel();
    const texto = `¿Qué vas a sembrar? Toca dos o más semillas. ${
      nombres ? `Has elegido ${nombres}.` : 'Aún no has elegido ningún cultivo.'
    }`;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-MX';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const continuar = () => {
    if (!puedeContinuar) return;
    router.push(`/simulacion/ubicacion?cultivos=${seleccion.join(',')}`);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-24 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
        <div
          role="group"
          aria-label="Idioma"
          className="inline-flex rounded-full border border-gray-200 bg-white p-1"
        >
          <button
            type="button"
            onClick={() => setIdioma('es')}
            aria-pressed={idioma === 'es'}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
              idioma === 'es'
                ? 'bg-[#2E7D32] text-white'
                : 'text-gray-600 hover:text-[#2E7D32]'
            }`}
          >
            Español
          </button>
          <button
            type="button"
            onClick={() => setIdioma('maya')}
            aria-pressed={idioma === 'maya'}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
              idioma === 'maya'
                ? 'bg-[#2E7D32] text-white'
                : 'text-gray-600 hover:text-[#2E7D32]'
            }`}
          >
            Maya
          </button>
        </div>

        <button
          type="button"
          onClick={escuchar}
          aria-label="Escuchar instrucciones en voz alta"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#2E7D32] px-4 text-sm font-semibold text-[#2E7D32] transition-colors hover:bg-[#2E7D32]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M6 9v6h3l4 3V6L9 9H6z"
            />
          </svg>
          Escuchar
        </button>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-gray-700">Paso 1 de 4</p>
        <div
          className="h-2 w-24 overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={1}
          aria-label="Paso 1 de 4"
        >
          <div className="h-full w-1/4 rounded-full bg-[#2E7D32]" />
        </div>
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        ¿Qué vas a sembrar?
      </h1>
      <p className="mt-2 text-lg text-gray-600">Toca 2 o más semillas.</p>

      {idioma === 'maya' ? (
        <p role="status" className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600">
          La traducción al maya estará disponible pronto. Por ahora mostramos la pantalla en
          español.
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {CULTIVOS.map((cultivo) => (
          <CultivoCard
            key={cultivo.id}
            cultivo={cultivo}
            seleccionado={seleccion.includes(cultivo.id)}
            onToggle={alternar}
          />
        ))}
      </div>

      {mensaje ? (
        <div
          role="status"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-[#2E7D32]/20 bg-[#E8F5E9] px-4 py-4"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2E7D32] text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-[#1B5E20]">
              {seleccion.length > 2 ? '¡Buena combinación!' : '¡Buena pareja!'}
            </p>
            <p className="mt-0.5 text-sm leading-relaxed text-gray-700">{mensaje}</p>
          </div>
        </div>
      ) : (
        <p className="mt-5 text-sm text-gray-600">
          Elige al menos 2 cultivos para ver una recomendación de asociación.
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse items-stretch gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={reiniciar}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 transition-colors hover:text-[#2E7D32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 00-14.9-3M4 16a8 8 0 0014.9 3"
            />
          </svg>
          Empezar de nuevo
        </button>

        <Button
          type="button"
          onClick={continuar}
          disabled={!puedeContinuar}
          className="w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Siguiente →
        </Button>
      </div>

      <div className="mt-8 flex flex-col items-start gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:items-center">
        <span className="rounded-md bg-[#0B3954] px-2.5 py-1 text-sm font-semibold text-white">
          Datos de la NASA
        </span>
        <p className="text-sm text-gray-600">RotaMaya te orienta. La decisión final es tuya.</p>
      </div>
    </div>
  );
}
