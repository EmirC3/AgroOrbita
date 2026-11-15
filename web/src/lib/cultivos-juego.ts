// Apariencia de cada cultivo de docs/investigacion/cultivos.csv en el juego.
// Las claves son los IDs de data_engineering/metrics/<municipio>.json -> cultivos.

export interface AparienciaCultivo {
  emoji: string;
  fruto: string; // color del fruto en la mascota
  fondo: string; // clase tailwind de la tarjeta
}

const APARIENCIA: Record<string, AparienciaCultivo> = {
  MAIZ_01: { emoji: '🌽', fruto: '#FBC02D', fondo: 'bg-amber-50' },
  PEPI_02: { emoji: '🥒', fruto: '#7CB342', fondo: 'bg-lime-50' },
  TOMA_03: { emoji: '🍅', fruto: '#E53935', fondo: 'bg-red-50' },
  SOYA_04: { emoji: '🌱', fruto: '#C0A062', fondo: 'bg-yellow-50' },
  // El henequén es un agave, no un cactus; no hay emoji de agave y 🪴 es lo más parecido.
  HENE_05: { emoji: '🪴', fruto: '#26A69A', fondo: 'bg-teal-50' },
  CALA_06: { emoji: '🎃', fruto: '#FB8C00', fondo: 'bg-orange-50' },
  FRIJ_07: { emoji: '🫘', fruto: '#6D4C41', fondo: 'bg-rose-50' },
  XPEL_08: { emoji: '🫛', fruto: '#558B2F', fondo: 'bg-green-50' },
  CHIL_09: { emoji: '🌶️', fruto: '#FF5722', fondo: 'bg-orange-50' },
  SAND_10: { emoji: '🍉', fruto: '#388E3C', fondo: 'bg-sky-50' },
};

export function apariencia(id: string): AparienciaCultivo {
  return APARIENCIA[id] ?? { emoji: '🌿', fruto: '#E53935', fondo: 'bg-gray-50' };
}
