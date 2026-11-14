import React from 'react';
import Link from 'next/link';
import { Button } from './Button';

export function Navbar() {
  return (
    <nav className="w-full h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-12 absolute top-0 z-50">
      {/* Logo y Marca */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {/* Ícono de hoja/planta simplificado usando SVG nativo */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight tracking-tight">Agrorbita</h1>
          <p className="text-[10px] text-[#2E7D32] font-semibold tracking-wide">Milpa Inteligente</p>
        </div>
      </Link>

      {/* Enlaces Centrales (Solo Inicio y Simulación como pediste) */}
      <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-full px-1 py-1 border border-gray-100">
        <Button variant="ghost" href="/" className="bg-white shadow-sm rounded-full !h-8 !px-5">
          Inicio
        </Button>
        <Button variant="ghost" href="/simulacion" className="rounded-full !h-8 !px-5 text-gray-500">
          Simulación
        </Button>
      </div>

      {/* Acciones de la Derecha */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" href="/recuperar" className="hidden sm:inline-flex !h-8">
          Ya tengo mi código
        </Button>
        <button className="w-9 h-9 bg-[#2E7D32] rounded-full flex items-center justify-center text-white hover:bg-[#1B5E20] transition-colors shadow-sm">
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {/* Ícono de usuario genérico */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </nav>
  );
}