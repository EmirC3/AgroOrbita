import calendarioData from '@/data/calendario_mensual.json';

export interface MesCalendario {
  mes: number;
  lluvia_mm: number;
  tmax_c: number;
}

export interface CalendarioMunicipio {
  datos: MesCalendario[];
  esEjemplo: boolean;
  fuente: string;
}

interface CalendarioData {
  fuente: string;
  ejemplo: {
    es_ejemplo: boolean;
    fuente: string;
    datos: MesCalendario[];
  };
  municipios: Record<string, MesCalendario[]>;
}

export const MESES = [
  { numero: 1, corto: 'Ene', largo: 'Enero' },
  { numero: 2, corto: 'Feb', largo: 'Febrero' },
  { numero: 3, corto: 'Mar', largo: 'Marzo' },
  { numero: 4, corto: 'Abr', largo: 'Abril' },
  { numero: 5, corto: 'May', largo: 'Mayo' },
  { numero: 6, corto: 'Jun', largo: 'Junio' },
  { numero: 7, corto: 'Jul', largo: 'Julio' },
  { numero: 8, corto: 'Ago', largo: 'Agosto' },
  { numero: 9, corto: 'Sep', largo: 'Septiembre' },
  { numero: 10, corto: 'Oct', largo: 'Octubre' },
  { numero: 11, corto: 'Nov', largo: 'Noviembre' },
  { numero: 12, corto: 'Dic', largo: 'Diciembre' },
];

const ESTADOS = [
  'Seca',
  'Seca',
  'Preparación',
  'Calor fuerte',
  'Primeras aguas',
  'Recomendado',
  'Canícula',
  'Lluvias',
  'Temporal',
  'Nortes',
  'Maduración',
  'Cosecha',
];

export function obtenerCalendario(municipio: string): CalendarioMunicipio {
  const data = calendarioData as CalendarioData;
  const real = data.municipios[municipio];

  if (real) {
    return { datos: real, esEjemplo: false, fuente: data.fuente };
  }

  return {
    datos: data.ejemplo.datos,
    esEjemplo: true,
    fuente: data.ejemplo.fuente,
  };
}

export function recomendarMes(datos: MesCalendario[]): number {
  const primerasLluvias = datos.find(
    (mes) => mes.mes >= 5 && mes.mes <= 9 && mes.lluvia_mm >= 100
  );
  if (primerasLluvias) return primerasLluvias.mes;

  return [...datos].sort((a, b) => b.lluvia_mm - a.lluvia_mm)[0]?.mes ?? 6;
}

export function estadoMes(mes: number, recomendado: number): string {
  if (mes === recomendado) return '¡Recomendado!';
  return ESTADOS[mes - 1] ?? 'Revisar';
}

export function indiceLluvia(lluviaMm: number): number {
  return Math.max(0, Math.min(99, Math.round((lluviaMm / 200) * 100)));
}

export function nombreMes(mes: number): string {
  return MESES.find((item) => item.numero === mes)?.largo ?? 'Junio';
}
