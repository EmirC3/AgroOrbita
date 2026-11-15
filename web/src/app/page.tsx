import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { Navbar } from '@/components/ui/Navbar';
import {
  COOKIE_CP,
  COOKIE_MUNICIPIO,
  COOKIE_NOMBRE,
  esCPYucatan,
  municipiosConMetricas,
  nombreDesdeCookie,
} from '@/lib/metricas';
import { OnboardingForm } from './OnboardingForm';

// Inicio de sesión local: nombre + código postal. Si ya hay sesión, proxy.ts manda a /dashboard
// (salvo con ?editar=1, que sirve para cambiar el nombre o el lugar).
async function FormularioConSesion() {
  const jar = await cookies();
  const cp = jar.get(COOKIE_CP)?.value ?? '';
  const nombre = nombreDesdeCookie(jar.get(COOKIE_NOMBRE)?.value);
  const pilotos = municipiosConMetricas().map((m) => ({ slug: m.slug, nombre: m.nombre }));
  return (
    <OnboardingForm
      nombreInicial={nombre}
      cpInicial={esCPYucatan(cp) ? cp : ''}
      municipioInicial={jar.get(COOKIE_MUNICIPIO)?.value ?? ''}
      pilotos={pilotos}
    />
  );
}

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#FAF9F6] font-sans md:flex-row">
      <Navbar />

      <div className="flex w-full items-center justify-center px-4 pb-12 pt-24 sm:px-6 md:w-1/2">
        <Suspense fallback={<div className="h-[520px] w-full max-w-[420px] animate-pulse rounded-2xl bg-gray-100" />}>
          <FormularioConSesion />
        </Suspense>
      </div>

      <div className="relative hidden w-1/2 flex-col justify-end bg-gray-900 md:flex">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/Agricultor.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090F16] via-[#090F16]/50 to-transparent" />
        <div className="relative w-full max-w-2xl px-12 pb-10 text-white">
          <h2 className="mb-4 text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
            Tecnología que transforma
            <br />
            el campo yucateco.
          </h2>
          <p className="mb-10 text-lg font-light text-gray-300">
            41 años de clima de NASA POWER para decidir qué y cuándo sembrar.
          </p>
          <div className="border-t border-white/20 pt-6 text-[11px] uppercase tracking-wider text-gray-400">
            © 2026 RotaMaya
          </div>
        </div>
      </div>
    </main>
  );
}
