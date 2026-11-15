'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import cpData from '@/data/cp_yucatan.json'; // Importamos el catálogo real

// Definimos el tipo de datos para que TypeScript nos ayude
type CatalogoCP = Record<string, { municipio: string; zona: string }>;
const catalogCP: CatalogoCP = cpData;

export default function OnboardingPage() {
  const router = useRouter();
  const [cp, setCp] = useState('');
  
  // Lógica de Validación Dinámica
  const infoUbicacion = catalogCP[cp];
  const isValidCP = !!infoUbicacion; // true si el CP existe en el JSON
  const isError = cp.length === 5 && !isValidCP; // true si escribió 5 dígitos pero no existe

  // Mantiene el último CP válido para que /dashboard no lo pierda al recargar.
  useEffect(() => {
    if (!isValidCP) return;
    document.cookie = `rotamaya_cp=${encodeURIComponent(cp)}; path=/; max-age=31536000; SameSite=Lax`;
  }, [cp, isValidCP]);

  const irAlDashboard = () => {
    if (!isValidCP) return;

    // Guardamos el CP para que /dashboard funcione incluso si se recarga la página.
    document.cookie = `rotamaya_cp=${encodeURIComponent(cp)}; path=/; max-age=31536000; SameSite=Lax`;
    router.push(`/dashboard?cp=${encodeURIComponent(cp)}`);
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6] font-sans">
      <Navbar />

      {/* Columna Izquierda: Formulario Único */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              ¿Dónde está tu parcela?
            </h2>
            <p className="text-[16px] text-gray-600">
              Escribe tu Código Postal para empezar.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <Input
                id="cp"
                label="Código Postal"
                helperText="5 dígitos"
                placeholder="Ej. 97880"
                maxLength={5}
                inputMode="numeric"
                value={cp}
                onChange={(e) => setCp(e.target.value.replace(/\D/g, ''))} // Solo permite números
                isValid={isValidCP}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                rightIcon={isValidCP ? (
                  <svg className="w-6 h-6 text-[#2E7D32]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : null}
              />
              
              {/* Mensaje de Error (Se muestra si pone 12345, por ejemplo) */}
              {isError && (
                <div className="mt-2">
                  <p className="flex items-center gap-1 text-sm font-medium text-red-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Código postal no válido o fuera de cobertura.
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    Por ahora tenemos datos de: 97880, 97930, 97000, 97740, 97700, 97860,
                    97800 y 97390.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCp('97880')}
                    className="mt-1 text-sm font-semibold text-[#2E7D32] underline underline-offset-2 hover:text-[#1B5E20]"
                  >
                    Probar con 97880 (Oxkutzcab)
                  </button>
                </div>
              )}

              {/* Etiqueta de confirmación DINÁMICA */}
              <div className={`mt-3 flex items-center gap-1.5 transition-all duration-300 ${isValidCP ? 'opacity-100 translate-y-0 relative' : 'opacity-0 -translate-y-2 pointer-events-none absolute'}`}>
                <svg className="w-4 h-4 text-[#2E7D32]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="text-[14px] font-semibold text-[#1B5E20]">
                  {infoUbicacion?.municipio}, Yucatán
                </span>
                <span className="text-[13px] text-gray-500 ml-1">
                  ({infoUbicacion?.zona})
                </span>
              </div>
            </div>

            {/* Este botón guarda el CP y redirige a /dashboard */}
            <Button 
              type="button"
              fullWidth 
              disabled={!isValidCP}
              onClick={irAlDashboard}
            >
              Ir al Dashboard &rarr;
            </Button>
            
            <p className="text-center text-[13.5px] text-gray-500 mt-4">
              Revisaremos el clima y la tierra de tu municipio
            </p>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Imagen Fotográfica (Se mantiene estática) */}
      <div className="hidden md:flex w-1/2 relative bg-gray-900 flex-col justify-end">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('/Agricultor.png')" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090F16] via-[#090F16]/80 md:via-[#090F16]/50 to-transparent" />
        
        <div className="relative px-12 pb-10 text-white w-full max-w-2xl">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4 tracking-tight">
            Tecnología que transforma<br />el campo yucateco.
          </h1>
          <p className="text-lg text-gray-300 mb-10 font-light">
            Innovamos para fortalecer la agricultura local.
          </p>
          <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-white/20 pt-6 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <span>© 2026 RotaMaya</span>
            </div>
            <div className="flex gap-6">
              <span className="hover:text-white cursor-pointer transition-colors">Términos</span>
              <span className="hover:text-white cursor-pointer transition-colors">Soporte Agrícola</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}