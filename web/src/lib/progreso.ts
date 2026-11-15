// Progreso del juego (XP, racha, riego de la mascota) guardado en este navegador.
// Es solo para la parte de juego: las métricas climáticas vienen siempre de los datos reales.
import { useSyncExternalStore } from 'react';
import type { Suelo } from './riego';

export interface Progreso {
  xp: number;
  racha: number;
  ultimoDia: string | null; // última visita (YYYY-MM-DD)
  ultimoRiego: string | null;
  misionDia: string | null; // día en que se completó la misión diaria
  cultivos: Record<string, number>; // mejor salud lograda por cultivo
  suelo: Suelo | null; // cómo es la tierra del agricultor (para el riego)
}

const CLAVE = 'rotamaya_progreso_v1';
const INICIAL: Progreso = {
  xp: 0,
  racha: 0,
  ultimoDia: null,
  ultimoRiego: null,
  misionDia: null,
  cultivos: {},
  suelo: null,
};

export const XP_RIEGO = 10;
export const XP_MISION = 20;

let crudoCache: string | null = null;
let progresoCache: Progreso = INICIAL;
const oyentes = new Set<() => void>();

function leerCrudo(): string | null {
  try {
    return window.localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

function leer(): Progreso {
  const crudo = leerCrudo();
  if (crudo !== crudoCache) {
    crudoCache = crudo;
    try {
      progresoCache = crudo ? { ...INICIAL, ...JSON.parse(crudo) } : INICIAL;
    } catch {
      progresoCache = INICIAL;
    }
  }
  return progresoCache;
}

function guardar(nuevo: Progreso) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(nuevo));
  } catch {
    // Sin almacenamiento (modo privado): el progreso vive solo en memoria.
    crudoCache = JSON.stringify(nuevo);
    progresoCache = nuevo;
  }
  oyentes.forEach((f) => f());
}

function suscribir(f: () => void) {
  oyentes.add(f);
  window.addEventListener('storage', f);
  return () => {
    oyentes.delete(f);
    window.removeEventListener('storage', f);
  };
}

export function useProgreso(): Progreso {
  return useSyncExternalStore(suscribir, leer, () => INICIAL);
}

export function hoy(fecha = new Date()): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function diasEntre(desde: string | null, hasta: string): number {
  if (!desde) return Infinity;
  const a = new Date(`${desde}T12:00:00`).getTime();
  const b = new Date(`${hasta}T12:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Cuenta la visita de hoy para la racha (como Duolingo). */
export function registrarVisita() {
  const p = leer();
  const dia = hoy();
  if (p.ultimoDia === dia) return;
  const racha = diasEntre(p.ultimoDia, dia) === 1 ? p.racha + 1 : 1;
  guardar({ ...p, ultimoDia: dia, racha });
}

/** Regar a la mascota una vez al día (como Pou). Devuelve el XP ganado. */
export function regar(): number {
  const p = leer();
  const dia = hoy();
  if (p.ultimoRiego === dia) return 0;
  guardar({ ...p, ultimoRiego: dia, xp: p.xp + XP_RIEGO });
  return XP_RIEGO;
}

/** Guarda una simulación terminada. Devuelve el XP total ganado (incluye misión diaria). */
export function registrarSimulacion(cultivoId: string, salud: number, xpBase: number): number {
  const p = leer();
  const dia = hoy();
  const bonoMision = p.misionDia === dia ? 0 : XP_MISION;
  const ganado = xpBase + bonoMision;
  guardar({
    ...p,
    xp: p.xp + ganado,
    misionDia: dia,
    cultivos: { ...p.cultivos, [cultivoId]: Math.max(p.cultivos[cultivoId] ?? 0, salud) },
  });
  return ganado;
}

export function guardarSuelo(suelo: Suelo) {
  guardar({ ...leer(), suelo });
}

/** Agua de la mascota (0-100): baja cada día que no la riegas. */
export function aguaMascota(p: Progreso, dia = hoy()): number {
  if (!p.ultimoRiego) return 70; // primera visita: llega contenta, no seca
  const d = diasEntre(p.ultimoRiego, dia);
  if (d <= 0) return 100;
  return Math.max(0, 100 - d * 35);
}

export function nivel(xp: number) {
  const n = Math.floor(xp / 100) + 1;
  return { nivel: n, enNivel: xp % 100, siguiente: 100 };
}
