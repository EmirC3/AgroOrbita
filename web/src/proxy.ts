import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import cpData from './data/cp_yucatan.json';

const catalogo = cpData as Record<string, { municipio: string; zona: string }>;

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== '/dashboard') {
    return NextResponse.next();
  }

  const cpUrl = request.nextUrl.searchParams.get('cp');
  const cpCookie = request.cookies.get('rotamaya_cp')?.value;
  const cpCookieValido = cpCookie && catalogo[cpCookie] ? cpCookie : undefined;

  // Si el CP de la URL falta o no existe, recuperamos el último CP válido guardado.
  // Solo redirigimos con una cookie válida para evitar bucles de redirección.
  if (cpCookieValido && (!cpUrl || !catalogo[cpUrl])) {
    const url = request.nextUrl.clone();
    url.searchParams.set('cp', cpCookieValido);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard'],
};
