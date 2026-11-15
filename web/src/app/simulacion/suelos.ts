export interface SueloDemo {
  nombre: string;
  descripcion: string;
  cualidad: string;
  color: string;
}

export const SUELOS_DEMO: Record<string, SueloDemo> = {
  Oxkutzcab: {
    nombre: "Tierra roja K'ankab",
    descripcion: 'Profunda y guarda bien el agua. Buena para maíz y frijol.',
    cualidad: 'Profunda',
    color: 'bg-[#8B4A2F]',
  },
  Peto: {
    nombre: "K'ankab / Tzek'el",
    descripcion: 'Suelo fértil con piedra caliza. Ideal para la milpa.',
    cualidad: 'Fértil',
    color: 'bg-[#8B4A2F]',
  },
  Motul: {
    nombre: "Tzek'el",
    descripcion: 'Suelo somero y pedregoso. Ayuda a cuidar la humedad.',
    cualidad: 'Pedregosa',
    color: 'bg-[#A67C52]',
  },
};

export function obtenerSueloDemo(municipio: string): SueloDemo | null {
  return SUELOS_DEMO[municipio] ?? null;
}
