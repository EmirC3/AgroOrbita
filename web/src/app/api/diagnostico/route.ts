import { NextResponse } from 'next/server';
import cpYucatan from '@/data/cp_yucatan.json';
import climaHistorico from '@/data/clima_historico.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cp = searchParams.get('cp');
  const cultivoAnterior = searchParams.get('cultivo'); // Ej: "maiz"

  if (!cp || !cpYucatan[cp as keyof typeof cpYucatan]) {
    return NextResponse.json(
      { error: 'Código postal no válido o fuera de cobertura.' },
      { status: 404 }
    );
  }

  // 1. Obtener datos de ubicación
  const ubicacion = cpYucatan[cp as keyof typeof cpYucatan] as {
    municipio: string;
    zona: string;
  };

  // 2. Obtener datos históricos (puede no existir para todos los municipios)
  const historico = (
    climaHistorico as Record<
      string,
      { tmax_prom: number; dias_calor_35: number; lluvia_anual_mm: number; gwetroot_prom: number }
    >
  )[ubicacion.municipio];

  // 3. Simular la consulta del día a la NASA (En producción, aquí leerías de clima_hoy.json)
  // Para el hackathon, enviamos un dato calibrado creíble basado en su histórico
  const climaHoy = {
    humedad_raiz_pct: 26, // Dato estático para la demo (gwetroot)
    temperatura_actual: 34,
    condicion_suelo: cultivoAnterior === 'maiz' ? 'Cansada de Nitrógeno' : 'Estable'
  };

  // 4. Armar el objeto JSON perfecto para el Dashboard
  const payload = {
    parcela: {
      cp: cp,
      municipio: ubicacion.municipio,
      zona: ubicacion.zona
    },
    nasa_hoy: climaHoy,
    simulador_riesgo: historico
      ? {
          dias_calor_extremo: historico.dias_calor_35,
          lluvia_esperada_mm: historico.lluvia_anual_mm,
          nivel_riesgo_monocultivo: "Alto",
          nivel_riesgo_rotacion: "Bajo"
        }
      : null
  };

  return NextResponse.json(payload);
}