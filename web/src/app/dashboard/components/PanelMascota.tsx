'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Planta, type Animo } from '@/components/planta/Planta';
import {
  XP_MISION,
  XP_RIEGO,
  aguaMascota,
  hoy,
  nivel,
  regar,
  registrarVisita,
  useProgreso,
} from '@/lib/progreso';

interface PanelMascotaProps {
  nombre: string;
  municipio: string;
  consejo: string; // frase basada en las métricas reales del municipio
}

function animoPorAgua(agua: number): Animo {
  if (agua >= 100) return 'feliz';
  if (agua >= 60) return 'contenta';
  if (agua > 0) return 'sed';
  return 'mustia';
}

const FRASES: Record<Animo, string> = {
  feliz: '¡Gracias por el agua! Hoy me siento fuerte.',
  contenta: 'Estoy bien, pero un poco de agua no me caería mal.',
  sed: 'Tengo sed… ¿me riegas?',
  calor: '¡Qué calor!',
  mustia: 'Me estoy secando. ¡Riégame para volver a crecer!',
};

export function PanelMascota({ nombre, municipio, consejo }: PanelMascotaProps) {
  const progreso = useProgreso();
  const [ganado, setGanado] = useState<number | null>(null);

  useEffect(() => {
    registrarVisita();
  }, []);

  const agua = aguaMascota(progreso);
  const animo = animoPorAgua(agua);
  const yaRego = progreso.ultimoRiego === hoy();
  const misionHecha = progreso.misionDia === hoy();
  const { nivel: n, enNivel, siguiente } = nivel(progreso.xp);
  const etapa = Math.min(4, Math.floor(progreso.xp / 60)) as 0 | 1 | 2 | 3 | 4;

  const alRegar = () => {
    const xp = regar();
    if (xp > 0) setGanado(xp);
  };

  return (
    <section className="grid gap-4 lg:grid-cols-5">
      <div className="relative overflow-hidden rounded-3xl border border-[#2E7D32]/15 bg-gradient-to-b from-[#E8F5E9] to-white p-5 sm:p-6 lg:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[#2E7D32]">{municipio}, Yucatán</p>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">¡Hola, {nombre}!</h1>
          </div>
          <div className="flex gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700"
              title="Días seguidos entrando a RotaMaya"
            >
              🔥 {progreso.racha} {progreso.racha === 1 ? 'día' : 'días'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
              ⭐ {progreso.xp} XP
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 sm:gap-6">
          <div className={`relative shrink-0 ${ganado ? 'rebote' : ''}`} key={progreso.ultimoRiego ?? 'nunca'}>
            <Planta etapa={etapa} animo={animo} className="h-40 w-40 text-gray-900 sm:h-48 sm:w-48" titulo={`Ixi'im está ${animo}`} />
            {ganado ? (
              <span className="aparecer absolute right-0 top-2 rounded-full bg-[#2E7D32] px-2 py-0.5 text-xs font-bold text-white">
                +{ganado} XP
              </span>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="relative rounded-2xl rounded-tl-none border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
              <p className="font-semibold text-gray-900">Ixi’im</p>
              <p>{FRASES[animo]}</p>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600">
                  <span>💧 Agua</span>
                  <span>{agua}%</span>
                </div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-sky-100" role="progressbar" aria-valuenow={agua} aria-valuemin={0} aria-valuemax={100} aria-label="Agua de Ixi'im">
                  <div className="h-full rounded-full bg-sky-500 transition-all duration-700" style={{ width: `${agua}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600">
                  <span>🌱 Nivel {n}</span>
                  <span>
                    {enNivel}/{siguiente} XP
                  </span>
                </div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-amber-100" role="progressbar" aria-valuenow={enNivel} aria-valuemin={0} aria-valuemax={siguiente} aria-label="Nivel">
                  <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${enNivel}%` }} />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={alRegar}
              disabled={yaRego}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border-b-4 border-sky-700 bg-sky-500 px-4 text-sm font-bold text-white transition-transform active:translate-y-0.5 active:border-b-2 disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-500 sm:w-auto"
            >
              {yaRego ? '✓ Ya la regaste hoy' : `💧 Regar (+${XP_RIEGO} XP)`}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Misión de hoy</p>
          <p className="mt-1 text-lg font-bold text-gray-900">Simula un cultivo en tu parcela</p>
          <p className="mt-1 text-sm text-gray-600">
            Elige qué sembrar y cuándo; te decimos cómo le habría ido con 41 años de clima real.
          </p>
          <Link
            href="/simulador"
            className={`mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl border-b-4 text-base font-bold text-white transition-transform active:translate-y-0.5 active:border-b-2 ${
              misionHecha ? 'border-[#1B5E20] bg-[#43A047]' : 'border-[#1B5E20] bg-[#2E7D32]'
            }`}
          >
            {misionHecha ? '✓ Hecha · Jugar otra vez' : `Jugar (+${XP_MISION} XP)`}
          </Link>
        </div>
        <div className="flex-1 rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Consejo para {municipio}</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-800">{consejo}</p>
        </div>
      </div>
    </section>
  );
}
