import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_CP, COOKIE_MUNICIPIO, COOKIE_NOMBRE } from '@/lib/metricas';

// Cierra la sesión local: borra el nombre y el código postal guardados.
export function GET(request: NextRequest) {
  const respuesta = NextResponse.redirect(new URL('/', request.url));
  respuesta.cookies.delete(COOKIE_CP);
  respuesta.cookies.delete(COOKIE_NOMBRE);
  respuesta.cookies.delete(COOKIE_MUNICIPIO);
  return respuesta;
}
