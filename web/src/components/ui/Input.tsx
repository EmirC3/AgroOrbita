import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isValid?: boolean;
}

export function Input({ 
  label, 
  helperText, 
  leftIcon, 
  rightIcon, 
  isValid,
  id, 
  className = '',
  ...props 
}: InputProps) {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <div className="flex justify-between items-baseline mb-2">
        <label htmlFor={id} className="text-[15px] font-medium text-gray-800">
          {label}
        </label>
        {helperText && (
          <span className="text-[13px] text-gray-500">{helperText}</span>
        )}
      </div>
      
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-4 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          id={id}
          className={`
            w-full h-14 rounded-xl border-[1.5px] bg-white px-4 text-lg font-semibold text-gray-900
            focus:outline-none focus:ring-4 transition-all placeholder:text-gray-400 placeholder:font-normal
            ${leftIcon ? 'pl-11' : ''} 
            ${rightIcon ? 'pr-11' : ''}
            ${isValid 
              ? 'border-[#2E7D32] focus:ring-green-100' 
              : 'border-gray-300 focus:border-[#2E7D32] focus:ring-green-100'}
          `}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-4 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
    </div>
  );
}