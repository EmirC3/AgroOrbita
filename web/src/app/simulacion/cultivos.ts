export type CultivoId = 'maiz' | 'frijol' | 'calabaza' | 'chile' | 'tomate' | 'sandia';

export interface Cultivo {
  id: CultivoId;
  nombre: string;
  descripcion: string;
  fondo: string;
}

export const CULTIVOS: Cultivo[] = [
  {
    id: 'maiz',
    nombre: 'Maíz',
    descripcion: 'La base de la milpa',
    fondo: 'bg-amber-100',
  },
  {
    id: 'frijol',
    nombre: 'Frijol',
    descripcion: 'Alimenta la tierra',
    fondo: 'bg-rose-100',
  },
  {
    id: 'calabaza',
    nombre: 'Calabaza',
    descripcion: 'Cuida la humedad',
    fondo: 'bg-lime-100',
  },
  {
    id: 'chile',
    nombre: 'Chile',
    descripcion: 'Se vende bien',
    fondo: 'bg-orange-100',
  },
  {
    id: 'tomate',
    nombre: 'Tomate',
    descripcion: 'Cosecha rápida',
    fondo: 'bg-red-100',
  },
  {
    id: 'sandia',
    nombre: 'Sandía',
    descripcion: 'Cubre el suelo',
    fondo: 'bg-sky-100',
  },
];
