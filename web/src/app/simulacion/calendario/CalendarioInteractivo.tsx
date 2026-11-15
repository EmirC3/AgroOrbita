'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MESES, estadoMes, indiceLluvia, nombreMes, type MesCalendario } from '../calendario';
import { EscucharBoton } from '../components/EscucharBoton';

interface CalendarioInteractivoProps {
  municipio: string;
  zona: string;
  cp: string;
  cultivos: string;
  tamano: string;
  cultivosNombres: string;
  datos: MesCalendario[];
  recomendado: number;
  esEjemplo: boolean;
  fuente: string;
}

function clasesEstado(estado: string): string {
  if (estado.includes('Recomendado')) return 'bg-[#E8F5E9] text-[#1B5E20]';
  if (['Seca', 'Canícula', 'Nortes', 'Calor fuerte'].includes(estado)) {
    return 'bg-amber-50 text-amber-800';
  }
  if (['Lluvias', 'Temporal', 'Primeras aguas'].includes(estado)) {
    return 'bg-sky-50 text-sky-800';
  }
  if (estado === 'Cosecha') return 'bg-green-50 text-green-800';
  return 'bg-gray-100 text-gray-700';
}

export function CalendarioInteractivo({
  municipio,
  zona,
  cp,
  cultivos,
  tamano,
  cultivosNombres,
  datos,
  recomendado,
  esEjemplo,
  fuente,
}: CalendarioInteractivoProps) {
  const [mesActivo, setMesActivo] = useState(recomendado);
  const seleccionado = datos.find((mes) => mes.mes === mesActivo) ?? datos[0];
  const esRecomendado = mesActivo === recomendado;
  const indice = indiceLluvia(seleccionado.lluvia_mm);
  const mesLargo = nombreMes(mesActivo);

  const queryBase = `cultivos=${encodeURIComponent(cultivos)}&cp=${cp}&tamano=${tamano}`;
  const backHref = `/simulacion/ubicacion?${queryBase}`;
  const nextHref = `/simulacion/resultado?${queryBase}&mes=${mesActivo}`;

  const resumenVoz = `${mesLargo} en ${municipio}. Lluvia estimada de ${Math.round(
    seleccionado.lluvia_mm
  )} milímetros y temperatura máxima de ${seleccionado.tmax_c.toFixed(
    1
  )} grados. ${esRecomendado ? 'Es el mes recomendado para sembrar.' : 'Revisa las condiciones antes de sembrar.'}`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-24 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-gray-700">Paso 3 de 4</p>
          <div
            className="h-2 w-24 overflow-hidden rounded-full bg-gray-200"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={4}
            aria-valuenow={3}
            aria-label="Paso 3 de 4"
          >
            <div className="h-full w-3/4 rounded-full bg-[#2E7D32]" />
          </div>
        </div>
        <EscucharBoton texto={resumenVoz} etiqueta="Escuchar voz alta" />
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        ¿Cuándo es mejor sembrar?
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-gray-600">
        La lluvia y la temperatura de {municipio} ({zona}) te ayudan a elegir el mes con mejores
        condiciones para tus semillas.
      </p>

      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Calendario del año: elige o revisa cada mes
          </p>
          <span
            className={`rounded-md px-2.5 py-1 text-sm font-semibold ${
              esEjemplo
                ? 'bg-amber-100 text-amber-800'
                : 'bg-[#2E7D32]/10 text-[#1B5E20]'
            }`}
          >
            {esEjemplo ? 'Datos de ejemplo' : 'NASA POWER'}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {datos.map((mes) => {
            const nombre = MESES.find((item) => item.numero === mes.mes)?.corto ?? '';
            const estado = estadoMes(mes.mes, recomendado);
            const activo = mes.mes === mesActivo;
            const esMesRecomendado = mes.mes === recomendado;
            return (
              <button
                key={mes.mes}
                type="button"
                onClick={() => setMesActivo(mes.mes)}
                aria-pressed={activo}
                aria-label={`${nombre}: ${Math.round(mes.lluvia_mm)} milímetros de lluvia, ${estado}`}
                className={`relative flex flex-col items-center rounded-xl border-2 bg-white px-2 py-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 ${
                  activo
                    ? 'border-[#2E7D32] ring-2 ring-[#2E7D32] ring-offset-2'
                    : esMesRecomendado
                      ? 'border-[#2E7D32]'
                      : 'border-gray-200 hover:border-[#2E7D32]/40'
                }`}
              >
                {esMesRecomendado ? (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#2E7D32] px-2 py-0.5 text-xs font-semibold text-white">
                    ¡Recomendado!
                  </span>
                ) : null}
                <span className="text-base font-semibold text-gray-900">{nombre}</span>
                <span className="mt-1 text-xs uppercase tracking-wide text-gray-600">
                  Lluvia
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {Math.round(mes.lluvia_mm)} mm
                </span>
                <span
                  className={`mt-1.5 rounded-md px-1.5 py-0.5 text-xs font-semibold ${clasesEstado(
                    estado
                  )}`}
                >
                  {estado}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-[#2E7D32]/20 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-3 py-1 text-sm font-semibold text-[#1B5E20]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]" />
              Recomendación para tu parcela
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
              {esRecomendado
                ? `${mesLargo} es tu mejor mes para sembrar`
                : `Así está ${mesLargo} en tu tierra`}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-gray-600">
              {esRecomendado
                ? 'La tierra tendrá humedad después de las primeras lluvias, antes de que llegue la canícula.'
                : 'Revisa la lluvia y la temperatura de este mes antes de decidir. Puedes elegir otro mes del calendario.'}
            </p>
          </div>

          <div className="min-w-40 rounded-2xl border border-green-100 bg-[#F1F8F2] px-5 py-4 text-center">
            <p className="text-4xl font-extrabold tracking-tight text-[#2E7D32]">{indice}%</p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-gray-600">
              Índice de lluvia
            </p>
            <p className="mt-1 text-sm leading-snug text-gray-600">
              Calculado con la lluvia mensual. No es una probabilidad validada.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[#FAF9F6] p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">
              Agua de lluvia
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {Math.round(seleccionado.lluvia_mm)}
              <span className="ml-1 text-sm font-semibold text-gray-600">mm</span>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {seleccionado.lluvia_mm >= 100
                ? 'Buena señal de humedad para el suelo.'
                : 'Poca lluvia: revisa el riego o espera otro mes.'}
            </p>
          </div>
          <div className="rounded-xl bg-[#FAF9F6] p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">
              Temperatura
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {seleccionado.tmax_c.toFixed(1)}
              <span className="ml-1 text-sm font-semibold text-gray-600">°C</span>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {seleccionado.tmax_c >= 35
                ? 'Calor fuerte: protege el suelo y siembra temprano.'
                : 'Temperatura más amable para el crecimiento.'}
            </p>
          </div>
          <div className="rounded-xl bg-[#FAF9F6] p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">
              Tus semillas
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">{cultivosNombres}</p>
            <p className="mt-1 text-sm text-gray-600">
              Listas para sembrar cuando la tierra tenga humedad.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-xl bg-[#FFF7ED] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-900">Consejo de la milpa</p>
            <p className="mt-1 text-sm leading-relaxed text-orange-800">
              “Sembrar con las primeras lluvias de {mesLargo} le da fuerza a la raíz antes del
              calor fuerte.”
            </p>
          </div>
          <EscucharBoton texto={resumenVoz} etiqueta="Escuchar consejo" />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-600">Fuente: {fuente}</p>
      </section>

      <div className="mt-8 flex flex-col-reverse items-stretch gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={backHref}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:text-[#2E7D32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2"
        >
          ← Volver a tu Tierra
        </Link>
        <Link
          href={nextHref}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2E7D32] px-6 text-base font-semibold text-white transition-colors hover:bg-[#1B5E20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2"
        >
          Ver Mi Diagnóstico Completo →
        </Link>
      </div>

      <div className="mt-8 flex flex-col items-start gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:items-center">
        <span className="rounded-md bg-[#0B3954] px-2.5 py-1 text-sm font-semibold text-white">
          Datos de la NASA
        </span>
        <p className="text-sm text-gray-600">
          Calibrado con datos satelitales · Humedad de suelo y precipitación peninsular.
        </p>
      </div>
    </div>
  );
}
