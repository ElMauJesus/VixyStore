import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-4 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-purple-200 border-t-purple-600 rounded-full animate-spin`}
        role="status"
        aria-label="Cargando"
      />
      {text && <p className="text-xs font-medium text-slate-500">{text}</p>}
    </div>
  );
}
