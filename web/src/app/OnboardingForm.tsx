'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Planta } from '@/components/planta/Planta';
import cpData from '@/data/cp_yucatan.json';

type CatalogoCP = Record<string, { municipio: string; zona: string; lat?: number; lon?: number }>;
const catalogoCP: CatalogoCP = cpData;
const UN_ANIO = 60 * 60 * 24 * 365;

function cpMasCercano(lat: number, lon: number): string | null {
  let mejor: { cp: string; d: number } | null = null;
  for (const [cp, e] of Object.entries(catalogoCP)) {
    if (e.lat === undefined || e.lon === undefined) continue;
    const d = (e.lat - lat) ** 2 + (e.lon - lon) ** 2;
    if (!mejor || d < mejor.d) mejor = { cp, d };
  }
  return mejor?.cp ?? null;
}

interface OnboardingFormProps {
  nombreInicial: string;
  cpInicial: string;
  municipioInicial: string;
  pilotos: { slug: string; nombre: string }[]; // municipios con métricas reales
}

export function OnboardingForm({ nombreInicial, cpInicial, municipioInicial, pilotos }: OnboardingFormProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState(nombreInicial);
  const [cp, setCp] = useState(cpInicial);
  const [aviso, setAviso] = useState<string | null>(null);
  const [municipio, setMunicipio] = useState(municipioInicial);

  const enCatalogo = catalogoCP[cp];
  const esYucatan = /^97\d{3}$/.test(cp);
  // CP de Yucatán fuera del catálogo: la persona elige su municipio piloto.
  const pideMunicipio = esYucatan && !enCatalogo;
  const elegido = pilotos.find((m) => m.slug === municipio);
  const info = enCatalogo ?? (pideMunicipio && elegido ? { municipio: elegido.nombre, zona: 'Yucatán' } : undefined);
  const cpValido = Boolean(info);
  const cpError = cp.length === 5 && !esYucatan;
  const nombreLimpio = nombre.trim();
  const puedeEntrar = cpValido && nombreLimpio.length > 0;

  const usarUbicacion = () => {
    if (!navigator.geolocation) {
      setAviso('Tu navegador no permite usar la ubicación. Escribe tu código postal.');
      return;
    }
    setAviso('Buscando dónde estás…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const cercano = cpMasCercano(pos.coords.latitude, pos.coords.longitude);
        if (cercano) {
          setCp(cercano);
          setAviso(`Te ubicamos cerca de ${catalogoCP[cercano].municipio}.`);
        } else {
          setAviso('No encontramos un municipio cercano. Escribe tu código postal.');
        }
      },
      () => setAviso('No pudimos obtener tu ubicación. Escribe tu código postal.'),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeEntrar) return;
    document.cookie = `rotamaya_cp=${encodeURIComponent(cp)}; path=/; max-age=${UN_ANIO}; SameSite=Lax`;
    document.cookie = pideMunicipio
      ? `rotamaya_municipio=${encodeURIComponent(municipio)}; path=/; max-age=${UN_ANIO}; SameSite=Lax`
      : 'rotamaya_municipio=; path=/; max-age=0';
    document.cookie = `rotamaya_nombre=${encodeURIComponent(nombreLimpio.slice(0, 40))}; path=/; max-age=${UN_ANIO}; SameSite=Lax`;
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={entrar} className="w-full max-w-[420px] aparecer">
      <div className="mb-6 flex items-end gap-3">
        <Planta etapa={1} animo={puedeEntrar ? 'feliz' : 'contenta'} className="h-24 w-24 shrink-0 text-gray-900" titulo="Ixi'im, tu planta" />
        <div className="relative mb-6 rounded-2xl rounded-bl-none border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
          {puedeEntrar
            ? `¡Hola, ${nombreLimpio}! Vamos a ver tu tierra en ${info.municipio}.`
            : '¡Hola! Soy Ixi’im. Dime cómo te llamas y dónde siembras.'}
        </div>
      </div>

      <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900">Empecemos</h1>
      <p className="mb-6 text-base text-gray-600">
        Tu panel mostrará el clima y los riesgos de tu municipio con datos de la NASA.
      </p>

      <div className="space-y-5">
        <Input
          id="nombre"
          label="¿Cómo te llamas?"
          placeholder="Ej. Doña Rosa"
          maxLength={40}
          autoComplete="given-name"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          isValid={nombreLimpio.length > 0}
        />

        <div>
          <Input
            id="cp"
            label="Código postal de tu parcela"
            helperText="5 dígitos"
            placeholder="Ej. 97880"
            maxLength={5}
            inputMode="numeric"
            value={cp}
            onChange={(e) => setCp(e.target.value.replace(/\D/g, ''))}
            isValid={cpValido}
          />
          <button
            type="button"
            onClick={usarUbicacion}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2E7D32] hover:text-[#1B5E20]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Usar mi ubicación
          </button>
          {aviso ? (
            <p role="status" className="mt-1 text-sm text-gray-600">
              {aviso}
            </p>
          ) : null}
          {cpError ? (
            <p className="mt-2 text-sm font-medium text-red-600">
              Ese código postal no es de Yucatán (deben empezar con 97).
            </p>
          ) : null}
          {pideMunicipio ? (
            <div className="mt-3">
              <label htmlFor="municipio" className="text-[15px] font-medium text-gray-800">
                ¿Qué municipio te queda más cerca?
              </label>
              <select
                id="municipio"
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900"
              >
                <option value="">Elige uno…</option>
                {pilotos.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.nombre}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Por ahora tenemos datos de estos 5 municipios.</p>
            </div>
          ) : null}
          {cpValido ? (
            <p className="mt-2 text-sm font-semibold text-[#1B5E20]">
              {info.municipio}, Yucatán <span className="font-normal text-gray-500">({info.zona})</span>
            </p>
          ) : null}
        </div>

        <Button type="submit" fullWidth disabled={!puedeEntrar}>
          Entrar a mi panel →
        </Button>
      </div>
    </form>
  );
}
