import React from 'react';
import Link from 'next/link';

type Seccion = 'inicio' | 'simulador';

interface NavbarProps {
  nombre?: string; // persona con sesión; sin nombre se muestra la versión pública
  activo?: Seccion;
}

const SECCIONES: { id: Seccion; titulo: string; href: string; icono: React.ReactNode }[] = [
  {
    id: 'inicio',
    titulo: 'Inicio',
    href: '/dashboard',
    icono: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9z" />
    ),
  },
  {
    id: 'simulador',
    titulo: 'Simulador',
    href: '/simulador',
    icono: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21V11m0 0C12 7 9 5 5 5c0 4 3 6 7 6zm0 0c0-4 3-6 7-6 0 4-3 6-7 6z" />
    ),
  },
];

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2E7D32]">
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 11a8 8 0 10-2.34 5.66M20 4v7h-7" />
          <path fill="currentColor" stroke="none" d="M12 16c0-2.5 1.5-4.2 4-4.2 0 2.5-1.5 4.2-4 4.2z" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-bold leading-tight tracking-tight text-gray-900">RotaMaya</p>
        <p className="text-sm font-semibold tracking-wide text-[#2E7D32]">Milpa Inteligente</p>
      </div>
    </Link>
  );
}

export function Navbar({ nombre, activo }: NavbarProps) {
  const conSesion = Boolean(nombre);

  return (
    <>
      <nav className="absolute top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white px-4 sm:px-6 lg:px-12">
        <Logo />

        {conSesion ? (
          <div className="hidden items-center gap-1 rounded-full border border-gray-100 bg-gray-50 p-1 md:flex">
            {SECCIONES.map((s) => (
              <Link
                key={s.id}
                href={s.href}
                aria-current={activo === s.id ? 'page' : undefined}
                className={`rounded-full px-5 py-1.5 text-sm font-semibold transition-colors ${
                  activo === s.id ? 'bg-white text-[#2E7D32] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {s.titulo}
              </Link>
            ))}
          </div>
        ) : null}

        {conSesion ? (
          <div className="flex items-center gap-2">
            <Link
              href="/?editar=1"
              title="Cambiar mi nombre o lugar"
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2E7D32] text-white">
                {nombre!.charAt(0).toUpperCase()}
              </span>
              <span className="hidden max-w-[10rem] truncate sm:inline">{nombre}</span>
            </Link>
            {/* <a> y no <Link>: /salir borra la sesión y no debe precargarse */}
            <a href="/salir" className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900">
              Salir
            </a>
          </div>
        ) : null}
      </nav>

      {conSesion ? (
        <nav
          aria-label="Secciones"
          className="fixed inset-x-0 bottom-0 z-50 flex border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          {SECCIONES.map((s) => (
            <Link
              key={s.id}
              href={s.href}
              aria-current={activo === s.id ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-bold ${
                activo === s.id ? 'text-[#2E7D32]' : 'text-gray-400'
              }`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {s.icono}
              </svg>
              {s.titulo}
            </Link>
          ))}
        </nav>
      ) : null}
    </>
  );
}
