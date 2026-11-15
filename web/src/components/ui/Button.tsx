import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  href?: string; 
  fullWidth?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  href, 
  fullWidth, 
  className = '', 
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";
  
  const variants = {
    primary: "bg-[#2E7D32] text-white hover:bg-[#1B5E20] focus:ring-[#2E7D32] h-14 px-6 text-lg",
    outline: "border-[1.5px] border-gray-300 text-gray-700 hover:bg-gray-50 h-10 px-4 text-sm",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-10 px-4 text-sm font-medium"
  };

  const classes = `${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
