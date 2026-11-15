import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import cpData from './data/cp_yucatan.json';

const catalogo = cpData as Record<string, { municipio: string; zona: string }>;

// Sesión local = cookies rotamaya_cp + rotamaya_nombre (las pone el formulario de "/").
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const cp = request.cookies.get('rotamaya_cp')?.value;
  const nombre = request.cookies.get('rotamaya_nombre')?.value;
  const municipio = request.cookies.get('rotamaya_municipio')?.value;
  // CP del catálogo, o cualquier CP de Yucatán (97xxx) con municipio elegido a mano.
  const cpOk = Boolean(cp && (catalogo[cp] || (/^97\d{3}$/.test(cp) && municipio)));
  const conSesion = Boolean(cpOk && nombre);

  // Con sesión, abrir la app lleva directo al panel con las métricas de su municipio.
  if (pathname === '/' && conSesion && !searchParams.has('editar')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Sin sesión, el panel y el simulador piden primero nombre y código postal.
  // /dashboard?cp=XXXXX se sigue permitiendo para enlaces compartidos.
  const cpUrl = searchParams.get('cp');
  const cpUrlValido = Boolean(cpUrl && catalogo[cpUrl]);
  if ((pathname === '/dashboard' && !conSesion && !cpUrlValido) || (pathname === '/simulador' && !conSesion)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard', '/simulador'],
};
