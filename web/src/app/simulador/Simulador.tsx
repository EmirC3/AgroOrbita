'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Planta, type Animo } from '@/components/planta/Planta';
import { apariencia } from '@/lib/cultivos-juego';
import {
  evaluar,
  fechaDesdeDia,
  type CultivoMetrica,
  type Evaluacion,
  type OpcionSiembra,
  type Rotacion,
} from '@/lib/metricas-tipos';
import { registrarSimulacion, useProgreso } from '@/lib/progreso';

type Fase = 'elegir' | 'fecha' | 'creciendo' | 'resultado';

interface SimuladorProps {
  municipio: string;
  inicioLluviasDia: number;
  cultivos: Record<string, CultivoMetrica>;
  rotaciones: Rotacion[];
  cultivoInicial: string | null;
}

const DURACION_MS = 6000; // lo que tarda la animación de una temporada completa

function textoCorrimiento(dias: number): string {
  if (dias === 0) return 'Con las primeras lluvias';
  const semanas = Math.abs(dias) / 7;
  return `${semanas} ${semanas === 1 ? 'semana' : 'semanas'} ${dias < 0 ? 'antes' : 'después'}`;
}

function etapaPorAvance(avance: number): 0 | 1 | 2 | 3 | 4 {
  // Etapas FAO-56 de cruce_cultivos.py: inicial 15 %, desarrollo 30 %, media (floración) 30 %, final 25 %.
  if (avance < 0.05) return 0;
  if (avance < 0.15) return 1;
  if (avance < 0.45) return 2;
  if (avance < 0.75) return 3;
  return 4;
}

function nombreEtapa(etapa: number): string {
  return ['Siembra', 'Brota', 'Crece', 'Florece (etapa delicada)', 'Da fruto'][etapa];
}

function animoPorEvaluacion(e: Evaluacion): Animo {
  if (e.riesgoAgua >= 0.5) return 'sed';
  if (e.riesgoCalor >= 0.3) return 'calor';
  return e.salud >= 70 ? 'feliz' : 'contenta';
}

function estrellas(salud: number, mejor: number): 1 | 2 | 3 {
  const diferencia = mejor - salud;
  if (diferencia <= 2) return 3;
  if (diferencia <= 10) return 2;
  return 1;
}

export function Simulador({ municipio, inicioLluviasDia, cultivos, rotaciones, cultivoInicial }: SimuladorProps) {
  const progreso = useProgreso();
  const [fase, setFase] = useState<Fase>(cultivoInicial ? 'fecha' : 'elegir');
  const [cultivoId, setCultivoId] = useState<string | null>(cultivoInicial);
  const [corrimiento, setCorrimiento] = useState(0);
  const [semana, setSemana] = useState(0);
  const [xpGanado, setXpGanado] = useState(0);

  const cultivo = cultivoId ? cultivos[cultivoId] : null;
  const opciones: (OpcionSiembra | null)[] = cultivo?.si_siembras ?? [null];
  const opcion = cultivo?.si_siembras?.find((o) => o.dias_desde_inicio_lluvias === corrimiento) ?? null;
  const evaluacion = cultivo ? evaluar(cultivo, opcion) : null;
  const evaluaciones = cultivo ? opciones.map((o) => ({ o, e: evaluar(cultivo, o) })) : [];
  const mejorSalud = Math.max(0, ...evaluaciones.map((x) => x.e.salud));
  const totalSemanas = cultivo?.semanas_del_ciclo ?? 1;
  const perenne = cultivo ? !cultivo.si_siembras : false;
  const diaSiembra = inicioLluviasDia + corrimiento;

  // Animación de la temporada: avanza semana por semana y al final da el resultado.
  useEffect(() => {
    if (fase !== 'creciendo' || !cultivo || !cultivoId || !evaluacion) return;
    let s = 0;
    const id = window.setInterval(() => {
      s += 1;
      if (s >= totalSemanas) {
        window.clearInterval(id);
        const est = estrellas(evaluacion.salud, mejorSalud);
        const xp = registrarSimulacion(cultivoId, evaluacion.salud, Math.round(evaluacion.salud / 10) + 5 * est);
        setXpGanado(xp);
        setSemana(totalSemanas);
        setFase('resultado');
      } else {
        setSemana(s);
      }
    }, DURACION_MS / totalSemanas);
    return () => window.clearInterval(id);
    // Solo se reinicia al entrar a la fase de crecimiento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  const elegirCultivo = (id: string) => {
    setCultivoId(id);
    setCorrimiento(0);
    setFase('fecha');
  };

  const sembrar = () => {
    setSemana(0);
    setFase('creciendo');
  };

  const avance = semana / totalSemanas;
  const etapa = fase === 'resultado' ? 4 : etapaPorAvance(avance);
  const enFloracion = etapa >= 3;
  const paso = { elegir: 1, fecha: 2, creciendo: 3, resultado: 4 }[fase];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-20 sm:px-6">
      {/* Barra de avance estilo lección */}
      <div className="flex items-center gap-3">
        {fase !== 'elegir' ? (
          <button
            type="button"
            onClick={() => setFase(fase === 'resultado' ? 'fecha' : 'elegir')}
            disabled={fase === 'creciendo'}
            aria-label="Regresar"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          >
            ←
          </button>
        ) : (
          <Link href="/dashboard" aria-label="Volver al inicio" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
            ✕
          </Link>
        )}
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={paso} aria-label={`Paso ${paso} de 4`}>
          <div className="h-full rounded-full bg-[#58CC02] transition-all duration-500" style={{ width: `${(paso / 4) * 100}%` }} />
        </div>
        <span className="text-sm font-bold text-amber-700">⭐ {progreso.xp}</span>
      </div>

      {fase === 'elegir' ? (
        <section className="aparecer mt-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">¿Qué quieres sembrar?</h1>
          <p className="mt-1 text-gray-600">Simularemos tu cultivo con el clima real de {municipio} de 1985 a 2025.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.entries(cultivos).map(([id, c]) => {
              const a = apariencia(id);
              const record = progreso.cultivos[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => elegirCultivo(id)}
                  className={`group relative flex flex-col items-center rounded-2xl border-2 border-b-4 border-gray-200 p-4 text-center transition-transform hover:border-[#58CC02] active:translate-y-0.5 active:border-b-2 ${a.fondo}`}
                >
                  <span className="text-5xl transition-transform group-hover:scale-110" aria-hidden="true">
                    {a.emoji}
                  </span>
                  <span className="mt-2 font-bold text-gray-900">{c.nombre}</span>
                  <span className="text-xs text-gray-600">{c.semanas_del_ciclo} semanas</span>
                  {record !== undefined ? (
                    <span className="absolute right-2 top-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#2E7D32] shadow-sm">
                      Récord {record}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {fase === 'fecha' && cultivo && cultivoId ? (
        <section className="aparecer mt-6">
          <div className="flex items-center gap-3">
            <span className="text-5xl" aria-hidden="true">
              {apariencia(cultivoId).emoji}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#2E7D32]">{cultivo.nombre}</p>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">¿Cuándo siembras?</h1>
            </div>
          </div>
          {perenne ? (
            <p className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-gray-700">
              El {cultivo.nombre.toLowerCase()} es perenne: vive todo el año, así que revisamos el año completo de enero a diciembre.
            </p>
          ) : (
            <>
              <p className="mt-1 text-gray-600">
                En {municipio} las lluvias suelen empezar el <strong>{fechaDesdeDia(inicioLluviasDia)}</strong>. Elige tu fecha y adivina cuál le va mejor.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Fecha de siembra">
                {cultivo.si_siembras!.map((o) => {
                  const activo = o.dias_desde_inicio_lluvias === corrimiento;
                  return (
                    <button
                      key={o.dias_desde_inicio_lluvias}
                      type="button"
                      role="radio"
                      aria-checked={activo}
                      onClick={() => setCorrimiento(o.dias_desde_inicio_lluvias)}
                      className={`rounded-2xl border-2 border-b-4 p-4 text-left transition-colors ${
                        activo ? 'border-[#58CC02] bg-[#F1FBE8]' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-2xl font-bold text-gray-900">
                        {fechaDesdeDia(inicioLluviasDia + o.dias_desde_inicio_lluvias)}
                      </span>
                      <span className="block text-sm text-gray-600">{textoCorrimiento(o.dias_desde_inicio_lluvias)}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          <button
            type="button"
            onClick={sembrar}
            className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-2xl border-b-4 border-[#46A302] bg-[#58CC02] text-lg font-extrabold uppercase tracking-wide text-white transition-transform active:translate-y-0.5 active:border-b-2"
          >
            🌱 ¡Sembrar!
          </button>
        </section>
      ) : null}

      {(fase === 'creciendo' || fase === 'resultado') && cultivo && cultivoId && evaluacion ? (
        <section className="mt-6">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-b from-sky-100 via-sky-50 to-[#F1FBE8] p-5">
            <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
              <span>
                {apariencia(cultivoId).emoji} {cultivo.nombre}
                {perenne ? '' : ` · sembrado el ${fechaDesdeDia(diaSiembra)}`}
              </span>
              <span>
                Semana {Math.min(semana, totalSemanas)} de {totalSemanas}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/70">
              <div className="h-full rounded-full bg-[#58CC02] transition-all duration-150" style={{ width: `${Math.min(1, avance) * 100}%` }} />
            </div>

            <div className="flex flex-col items-center py-4 sm:flex-row sm:justify-center sm:gap-8">
              <Planta
                etapa={etapa}
                animo={enFloracion ? animoPorEvaluacion(evaluacion) : 'feliz'}
                fruto={apariencia(cultivoId).fruto}
                className="h-56 w-56 text-gray-900"
                titulo={`${cultivo.nombre}: ${nombreEtapa(etapa)}`}
              />
              <div className="w-full max-w-xs space-y-2" aria-live="polite">
                <p className="text-center text-lg font-bold text-gray-900 sm:text-left">{nombreEtapa(etapa)}</p>
                {enFloracion ? (
                  <>
                    <p className="aparecer rounded-xl bg-white/80 px-3 py-2 text-sm text-gray-800">
                      💧 Le faltó agua al florecer <strong>{evaluacion.aniosFalta} de cada 10 años</strong>.
                    </p>
                    <p className="aparecer rounded-xl bg-white/80 px-3 py-2 text-sm text-gray-800">
                      🔥{' '}
                      {evaluacion.diasCalor > 0 ? (
                        <>
                          <strong>{evaluacion.diasCalor} días</strong> pasaron de {cultivo.temp_dano_c} °C en floración (año típico).
                        </>
                      ) : (
                        <>Sin días de calor dañino en floración (año típico).</>
                      )}
                    </p>
                  </>
                ) : (
                  <p className="text-center text-sm text-gray-600 sm:text-left">Crece con el clima real de {municipio}…</p>
                )}
              </div>
            </div>
          </div>

          {fase === 'resultado' ? (
            <Resultado
              cultivoId={cultivoId}
              cultivo={cultivo}
              evaluacion={evaluacion}
              evaluaciones={evaluaciones}
              corrimiento={corrimiento}
              mejorSalud={mejorSalud}
              xpGanado={xpGanado}
              inicioLluviasDia={inicioLluviasDia}
              rotaciones={rotaciones.filter((r) => r.cultivos.includes(cultivoId) && r.id !== 'maiz_solo')}
              onOtraFecha={() => setFase('fecha')}
              onOtroCultivo={() => setFase('elegir')}
            />
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

interface ResultadoProps {
  cultivoId: string;
  cultivo: CultivoMetrica;
  evaluacion: Evaluacion;
  evaluaciones: { o: OpcionSiembra | null; e: Evaluacion }[];
  corrimiento: number;
  mejorSalud: number;
  xpGanado: number;
  inicioLluviasDia: number;
  rotaciones: Rotacion[];
  onOtraFecha: () => void;
  onOtroCultivo: () => void;
}

function Resultado({
  cultivoId,
  cultivo,
  evaluacion,
  evaluaciones,
  corrimiento,
  mejorSalud,
  xpGanado,
  inicioLluviasDia,
  rotaciones,
  onOtraFecha,
  onOtroCultivo,
}: ResultadoProps) {
  const est = estrellas(evaluacion.salud, mejorSalud);
  const mejor = evaluaciones.find((x) => x.e.salud === mejorSalud);
  const titulo = est === 3 ? '¡Excelente decisión!' : est === 2 ? '¡Bien hecho!' : 'Se puede mejorar';

  return (
    <div className="aparecer mt-4 space-y-4">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 text-center">
        <p className="text-4xl tracking-widest" aria-label={`${est} de 3 estrellas`}>
          {[1, 2, 3].map((i) => (
            <span key={i} className={i <= est ? '' : 'opacity-20 grayscale'}>
              ⭐
            </span>
          ))}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">{titulo}</h2>
        <p className="mt-1 text-gray-600">
          Salud de tu cultivo: <strong className="text-gray-900">{evaluacion.salud}/100</strong>
        </p>
        <p className="rebote mt-3 inline-block rounded-full bg-amber-100 px-4 py-1.5 font-bold text-amber-800">+{xpGanado} XP</p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-5">
        <h3 className="font-bold text-gray-900">Si lo siembras así 10 años…</h3>
        <p className="text-sm text-gray-600">Cada maceta es un año. Las que tienen sed son años en que le faltó agua al florecer.</p>
        <div className="mt-3 grid grid-cols-5 gap-1 sm:grid-cols-10">
          {Array.from({ length: 10 }).map((_, i) => {
            const conSed = i < evaluacion.aniosFalta;
            return (
              <Planta
                key={i}
                etapa={conSed ? 2 : 4}
                animo={conSed ? 'sed' : 'feliz'}
                fruto={apariencia(cultivoId).fruto}
                className="aparecer w-full text-gray-900"
                titulo={conSed ? 'Año con falta de agua' : 'Año bueno'}
              />
            );
          })}
        </div>
        <p className="mt-2 text-sm font-semibold text-gray-800">
          {10 - evaluacion.aniosFalta} años buenos · {evaluacion.aniosFalta} con sed
          {evaluacion.semanasFalta > 0 ? ` · en un año típico faltó agua ${evaluacion.semanasFalta} de ${cultivo.semanas_del_ciclo} semanas` : ''}
        </p>
      </div>

      {evaluaciones.length > 1 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-5">
          <h3 className="font-bold text-gray-900">¿Y con otra fecha?</h3>
          <ul className="mt-3 space-y-2">
            {evaluaciones.map(({ o, e }) => {
              const dias = o?.dias_desde_inicio_lluvias ?? 0;
              const elegida = dias === corrimiento;
              const esMejor = e.salud === mejorSalud;
              return (
                <li key={dias} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${elegida ? 'bg-[#F1FBE8] ring-2 ring-[#58CC02]' : 'bg-gray-50'}`}>
                  <span className="w-16 shrink-0 font-bold text-gray-900">{fechaDesdeDia(inicioLluviasDia + dias)}</span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <span className="block h-full rounded-full bg-[#2E7D32]" style={{ width: `${e.salud}%` }} />
                  </span>
                  <span className="w-12 text-right text-sm font-bold text-gray-800">{e.salud}</span>
                  <span className="w-20 text-xs font-semibold text-gray-600">
                    {esMejor ? '🏆 Mejor' : elegida ? 'Tu fecha' : `${e.aniosFalta}/10 sed`}
                  </span>
                </li>
              );
            })}
          </ul>
          {mejor && mejor.e.salud > evaluacion.salud ? (
            <p className="mt-3 text-sm text-gray-700">
              💡 Sembrando el <strong>{fechaDesdeDia(inicioLluviasDia + (mejor.o?.dias_desde_inicio_lluvias ?? 0))}</strong> le habría ido mejor.
            </p>
          ) : null}
        </div>
      ) : null}

      {rotaciones.length ? (
        <div className="rounded-3xl border border-[#2E7D32]/20 bg-[#E8F5E9] p-5">
          <h3 className="font-bold text-gray-900">Combínalo para cuidar tu tierra</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-800">
            {rotaciones.map((r) => (
              <li key={r.id}>
                {r.cultivos.map((c) => apariencia(c).emoji).join(' ')} {r.nombre} — falta agua {r.anios_con_falta_agua_de_cada_10} de cada 10 años
                {r.suelo.nitrogeno ? ', aporta nitrógeno' : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {evaluaciones.length > 1 ? (
          <button type="button" onClick={onOtraFecha} className="h-12 rounded-2xl border-2 border-b-4 border-gray-200 bg-white font-bold text-gray-700 active:translate-y-0.5 active:border-b-2">
            Otra fecha
          </button>
        ) : null}
        <button type="button" onClick={onOtroCultivo} className="h-12 rounded-2xl border-2 border-b-4 border-gray-200 bg-white font-bold text-gray-700 active:translate-y-0.5 active:border-b-2">
          Otro cultivo
        </button>
        <Link href="/dashboard" className="flex h-12 items-center justify-center rounded-2xl border-b-4 border-[#46A302] bg-[#58CC02] font-bold text-white active:translate-y-0.5 active:border-b-2">
          Ver a Ixi’im
        </Link>
      </div>
      <p className="text-center text-xs text-gray-500">
        Calculado con NASA POWER 1985–2025 y las necesidades de agua de cada cultivo (FAO-56). RotaMaya te orienta; la decisión final es tuya.
      </p>
    </div>
  );
}
