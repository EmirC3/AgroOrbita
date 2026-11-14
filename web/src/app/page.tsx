'use client';

import { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// Lista de cultivos
const CULTIVOS = [
  { id: 'maiz', nombre: 'Maíz', icono: '🌽' },
  { id: 'frijol', nombre: 'Frijol Espelón', icono: '🫘' },
  { id: 'habanero', nombre: 'Chile Habanero', icono: '🌶️' },
  { id: 'calabacita', nombre: 'Calabacita', icono: '🥒' },
  { id: 'pepino', nombre: 'Pepino', icono: '🥒' },
  { id: 'citricos', nombre: 'Cítricos', icono: '🍊' },
];

export default function OnboardingPage() {
  // Estados para el flujo
  const [step, setStep] = useState(1);
  
  // Datos del formulario
  const [cp, setCp] = useState('');
  const [cultivo, setCultivo] = useState('');
  const [nombreMilpa, setNombreMilpa] = useState('');
  const [telefono, setTelefono] = useState('');
  
  // Validaciones
  const isValidCP = cp.length === 5 && cp.startsWith('97');
  const isValidFinal = nombreMilpa.trim().length >= 3 && telefono.length >= 10;

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6] font-sans">
      <Navbar />

      {/* Columna Izquierda: Formularios Dinámicos */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-[420px]">
          
          {step === 1 && (
            /* ==========================================
               PASO 1: CÓDIGO POSTAL
               ========================================== */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <p className="text-[13px] font-semibold text-[#2E7D32] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]"></span>
                  Paso 1 de 3 • Tu ubicación
                </p>
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
                    onChange={(e) => setCp(e.target.value.replace(/\D/g, ''))}
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
                  
                  {/* Etiqueta de confirmación */}
                  <div className={`mt-3 flex items-center gap-1.5 transition-all duration-300 ${isValidCP ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                    <svg className="w-4 h-4 text-[#2E7D32]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-[14px] font-semibold text-[#1B5E20]">Oxkutzcab, Yucatán</span>
                    <span className="text-[13px] text-gray-500 ml-1">(Zona Puuc)</span>
                  </div>
                </div>

                <Button fullWidth disabled={!isValidCP} onClick={() => setStep(2)}>
                  Continuar &rarr;
                </Button>
                <p className="text-center text-[13.5px] text-gray-500 mt-4">
                  Revisaremos el clima y la tierra de tu municipio
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            /* ==========================================
               PASO 2: CULTIVO
               ========================================== */
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="mb-8">
                <button onClick={() => setStep(1)} className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1.5 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Volver
                </button>

                <p className="text-[13px] font-semibold text-[#2E7D32] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]"></span>
                  Paso 2 de 3 • Tu Cultivo
                </p>
                <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                  ¿Qué sembraste en tu último ciclo?
                </h2>
                <p className="text-[16px] text-gray-600">
                  Selecciona la planta principal para analizar la mejor rotación.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {CULTIVOS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCultivo(item.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-[1.5px] transition-all text-left ${cultivo === item.id ? 'border-[#2E7D32] bg-green-50/50 ring-4 ring-green-50' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    <span className="text-2xl grayscale-0">{item.icono}</span>
                    <span className={`font-semibold text-[15px] ${cultivo === item.id ? 'text-[#1B5E20]' : 'text-gray-700'}`}>{item.nombre}</span>
                  </button>
                ))}
              </div>

              <Button fullWidth disabled={!cultivo} onClick={() => setStep(3)}>
                Continuar &rarr;
              </Button>
            </div>
          )}

          {step === 3 && (
            /* ==========================================
               PASO 3: DATOS FINALES
               ========================================== */
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="mb-8">
                <button onClick={() => setStep(2)} className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1.5 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Volver
                </button>

                <p className="text-[13px] font-semibold text-[#2E7D32] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]"></span>
                  Paso 3 de 3 • Datos Finales
                </p>
                <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                  Ya casi terminamos
                </h2>
                <p className="text-[16px] text-gray-600">
                  Danos un nombre para identificar tu parcela y un número para guardar tu progreso.
                </p>
              </div>

              <div className="space-y-5 mb-8">
                <Input
                  id="nombreMilpa"
                  label="Nombre de tu parcela"
                  placeholder="Ej. Milpa de Don José"
                  value={nombreMilpa}
                  onChange={(e) => setNombreMilpa(e.target.value)}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  }
                />

                <Input
                  id="telefono"
                  label="Número de Teléfono (WhatsApp)"
                  placeholder="Ej. 999 123 4567"
                  maxLength={10}
                  inputMode="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                />
              </div>

              <Button 
                fullWidth 
                disabled={!isValidFinal}
                href="/simulacion" 
              >
                Guardar y ver mi plan de rotación
              </Button>
            </div>
          )}
          
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
              <span>© 2026 Agrorbita</span>
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