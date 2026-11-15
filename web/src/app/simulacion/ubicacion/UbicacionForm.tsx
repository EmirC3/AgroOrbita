'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerMunicipio, obtenerUbicacion, municipioMasCercano } from '../datos';
import { obtenerSueloDemo } from '../suelos';
import { EscucharBoton } from '../components/EscucharBoton';

interface UbicacionFormProps {
  cultivos: string;
}

const TAMANOS = [
  { id: 'pequena', titulo: 'Pequeña', detalle: 'Hasta 10 mecates' },
  { id: 'mediana', titulo: 'Mediana', detalle: 'De 10 a 49 mecates' },
  { id: 'grande', titulo: 'Grande', detalle: 'Más de 49 mecates' },
];

export function UbicacionForm({ cultivos }: UbicacionFormProps) {
  const router = useRouter();
  const [cp, setCp] = useState('');
  const [tamano, setTamano] = useState('mediana');
  const [aviso, setAviso] = useState<string | null>(null);

  const ubicacion = obtenerUbicacion(cp);
  const municipioData = ubicacion ? obtenerMunicipio(ubicacion.municipio) : null;
  const clima = municipioData?.clima ?? null;
  const suelo = ubicacion ? obtenerSueloDemo(ubicacion.municipio) : null;
  const esError = cp.length === 5 && !ubicacion;

  const lluvia = clima
    ? clima.lluvia_anual_mm >= 1150
      ? { texto: 'Alta', clase: 'bg-sky-50 text-sky-800' }
      : clima.lluvia_anual_mm < 900
        ? { texto: 'Baja', clase: 'bg-amber-50 text-amber-800' }
        : { texto: 'Normal', clase: 'bg-sky-50 text-sky-800' }
    : null;

  const calor = clima
    ? clima.dias_calor_35 >= 80
      ? { texto: 'Intenso', clase: 'bg-red-50 text-red-700' }
      : clima.dias_calor_35 >= 60
        ? { texto: 'Fuerte', clase: 'bg-amber-50 text-amber-800' }
        : { texto: 'Moderado', clase: 'bg-yellow-50 text-yellow-800' }
    : null;

  const resumenVoz = ubicacion
    ? `Estás en ${ubicacion.municipio}, ${ubicacion.zona}. ${
        suelo ? `${suelo.nombre}. ${suelo.descripcion}` : 'Suelo por verificar.'
      } ${lluvia ? `Lluvia ${lluvia.texto.toLowerCase()}.` : ''} ${
        calor ? `Calor ${calor.texto.toLowerCase()}.` : ''
      }`
    : 'Escribe tu código postal para conocer tu tierra.';

  const usarUbicacion = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setAviso('Tu navegador no permite usar la ubicación. Escribe tu código postal.');
      return;
    }

    setAviso('Buscando tu ubicación…');
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const cercano = municipioMasCercano(
          posicion.coords.latitude,
          posicion.coords.longitude
        );
        if (cercano) {
          setCp(cercano);
          setAviso('Usamos el municipio más cercano a tu ubicación.');
        } else {
          setAviso('No encontramos un municipio cercano. Escribe tu código postal.');
        }
      },
      () => {
        setAviso('No pudimos obtener tu ubicación. Escribe tu código postal.');
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const continuar = () => {
    if (!ubicacion) return;
    router.push(
      `/simulacion/calendario?cultivos=${encodeURIComponent(cultivos)}&cp=${cp}&tamano=${tamano}`
    );
  };

  const atras = () => {
    router.push(`/simulacion?cultivos=${encodeURIComponent(cultivos)}`);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-24 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-gray-700">Paso 2 de 4</p>
          <div
            className="h-2 w-24 overflow-hidden rounded-full bg-gray-200"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={4}
            aria-valuenow={2}
            aria-label="Paso 2 de 4"
          >
            <div className="h-full w-1/2 rounded-full bg-[#2E7D32]" />
          </div>
        </div>
        <EscucharBoton texto={resumenVoz} etiqueta="Escuchar" />
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        ¿Dónde está tu milpa?
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-gray-600">
        Usa tu ubicación o escribe tu código postal para revisar el clima y el suelo de tu
        municipio.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={usarUbicacion}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2E7D32] px-5 text-base font-semibold text-white transition-colors hover:bg-[#1B5E20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Usar mi ubicación
          </button>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-600">o escribe tu código postal</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <label htmlFor="cp" className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Código postal
          </label>
          <input
            id="cp"
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="Ej. 97880"
            value={cp}
            onChange={(event) => {
              setCp(event.target.value.replace(/\D/g, '').slice(0, 5));
              setAviso(null);
            }}
            aria-invalid={esError}
            aria-describedby={esError ? 'cp-error' : undefined}
            className={`mt-2 h-12 w-full rounded-xl border-2 bg-white px-4 text-lg font-semibold text-gray-900 outline-none transition-colors placeholder:font-normal placeholder:text-gray-400 focus:ring-4 focus:ring-green-100 ${
              ubicacion
                ? 'border-[#2E7D32]'
                : esError
                  ? 'border-red-400'
                  : 'border-gray-300 focus:border-[#2E7D32]'
            }`}
          />

          {ubicacion ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[#1B5E20]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {ubicacion.municipio}, Yucatán
            </p>
          ) : null}
          {esError ? (
            <p id="cp-error" className="mt-2 text-sm font-medium text-red-600">
              Código postal no válido o fuera de cobertura.
            </p>
          ) : null}
          {aviso ? (
            <p role="status" className="mt-2 text-sm text-gray-600">
              {aviso}
            </p>
          ) : null}

          <p className="mt-6 text-lg font-semibold text-gray-900">¿Qué tan grande es?</p>
          <div className="mt-3 space-y-2.5">
            {TAMANOS.map((opcion) => {
              const activo = tamano === opcion.id;
              return (
                <button
                  key={opcion.id}
                  type="button"
                  onClick={() => setTamano(opcion.id)}
                  aria-pressed={activo}
                  className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 ${
                    activo
                      ? 'border-[#2E7D32] bg-[#F1F8F2]'
                      : 'border-gray-200 bg-white hover:border-[#2E7D32]/40'
                  }`}
                >
                  <span>
                    <span className="block text-base font-semibold text-gray-900">
                      {opcion.titulo}
                    </span>
                    <span className="block text-sm text-gray-600">{opcion.detalle}</span>
                  </span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      activo ? 'border-[#2E7D32] bg-[#2E7D32]' : 'border-gray-300'
                    }`}
                    aria-hidden="true"
                  >
                    {activo ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="space-y-3">
          <section className="relative overflow-hidden rounded-2xl bg-[#1B5E20] p-6 text-white shadow-sm">
            <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/5" />
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-white/80">
                  Tu tierra en {ubicacion?.municipio ?? 'tu municipio'}
                </p>
                <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                  {suelo ? 'Datos de ejemplo' : 'Por verificar'}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <span
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${
                    suelo ? suelo.color : 'bg-white/15'
                  }`}
                  aria-hidden="true"
                >
                  <svg className="h-7 w-7 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"
                    />
                  </svg>
                </span>
                <div>
                  <h2 className="text-lg font-semibold">
                    {suelo?.nombre ?? (ubicacion ? 'Suelo por verificar' : 'Escribe tu código postal')}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-white/85">
                    {suelo?.descripcion ??
                      'Todavía no hay un análisis de suelo verificado para este municipio.'}
                  </p>
                </div>
              </div>

              <EscucharBoton
                texto={resumenVoz}
                etiqueta="Escuchar resumen"
                tono="claro"
                className="mt-5"
              />
            </div>
          </section>

          <div className="grid grid-cols-3 gap-2.5">
            <div className={`rounded-xl p-3 text-center ${lluvia?.clase ?? 'bg-gray-100'}`}>
              <span className="text-lg" aria-hidden="true">
                ☁️
              </span>
              <p className="mt-1 text-sm font-semibold">Lluvia</p>
              <p className="text-sm">{lluvia?.texto ?? 'Sin dato'}</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${calor?.clase ?? 'bg-gray-100'}`}>
              <span className="text-lg" aria-hidden="true">
                ☀️
              </span>
              <p className="mt-1 text-sm font-semibold">Calor</p>
              <p className="text-sm">{calor?.texto ?? 'Sin dato'}</p>
            </div>
            <div className="rounded-xl bg-orange-50 p-3 text-center text-orange-900">
              <span className="text-lg" aria-hidden="true">
                ⛰️
              </span>
              <p className="mt-1 text-sm font-semibold">Tierra</p>
              <p className="text-sm">{suelo?.cualidad ?? 'Por verificar'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse items-stretch gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={atras}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:text-[#2E7D32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2"
        >
          ← Atrás
        </button>
        <button
          type="button"
          onClick={continuar}
          disabled={!ubicacion}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2E7D32] px-6 text-base font-semibold text-white transition-colors hover:bg-[#1B5E20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ver cuándo sembrar →
        </button>
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
