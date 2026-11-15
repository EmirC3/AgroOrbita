import type { CultivoId } from '../cultivos';

interface CultivoIconProps {
  id: CultivoId;
  className?: string;
}

export function CultivoIcon({ id, className = 'h-10 w-10' }: CultivoIconProps) {
  switch (id) {
    case 'maiz':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
          <path d="M17 19c-4 3-6 8-4 14 4 0 7-3 8-7" fill="#8BC34A" />
          <path d="M31 19c4 3 6 8 4 14-4 0-7-3-8-7" fill="#7CB342" />
          <ellipse cx="24" cy="27" rx="7.5" ry="14" fill="#F6C445" />
          <g fill="#E0A800">
            <circle cx="21" cy="20" r="1.1" />
            <circle cx="27" cy="20" r="1.1" />
            <circle cx="21" cy="25" r="1.1" />
            <circle cx="27" cy="25" r="1.1" />
            <circle cx="21" cy="30" r="1.1" />
            <circle cx="27" cy="30" r="1.1" />
            <circle cx="24" cy="23" r="1.1" />
            <circle cx="24" cy="28" r="1.1" />
            <circle cx="24" cy="33" r="1.1" />
          </g>
        </svg>
      );
    case 'frijol':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
          <ellipse cx="17" cy="27" rx="7" ry="11" transform="rotate(-25 17 27)" fill="#795548" />
          <ellipse cx="31" cy="23" rx="7" ry="11" transform="rotate(25 31 23)" fill="#6D4C41" />
          <path
            d="M13 22c2-3 5-4 8-3M27 18c3-1 6 0 8 3"
            stroke="#A1887F"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'calabaza':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
          <circle cx="24" cy="29" r="14" fill="#66BB6A" />
          <path d="M24 15c0-3 2-5 5-6" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M16 20c-3 6-3 15 0 21M24 15c-2 8-2 21 0 29M32 20c3 6 3 15 0 21"
            stroke="#2E7D32"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'chile':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
          <path
            d="M21 16c4 0 8 4 9 10 1 7-3 14-8 16-4 1-7-2-6-6 1-4 4-6 5-10 1-3 0-5-2-7 0-2 1-3 2-3z"
            fill="#FB8C00"
          />
          <path
            d="M20 15c1-3 4-4 6-2 1 1 1 3 0 4"
            stroke="#2E7D32"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'tomate':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
          <circle cx="24" cy="29" r="13" fill="#EF5350" />
          <path
            d="M24 17c-4-4-9-3-9-3 1 4 4 6 6 7-3 0-6 1-8 3 4 2 8 2 11 1 3 1 7 1 11-1-2-2-5-3-8-3 2-1 5-3 6-7 0 0-5-1-9 3z"
            fill="#43A047"
          />
        </svg>
      );
    case 'sandia':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
          <circle cx="24" cy="27" r="15" fill="#66BB6A" />
          <path
            d="M15 14c-2 8-2 18 0 26M24 12c-2 10-2 20 0 30M33 14c2 8 2 18 0 26"
            stroke="#2E7D32"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path d="M24 12c2-3 5-4 8-3" stroke="#6D4C41" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
  }
}
