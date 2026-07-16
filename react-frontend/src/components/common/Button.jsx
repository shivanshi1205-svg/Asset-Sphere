import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  icon: Icon,
  iconPosition = 'left',
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20 focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-secondary/95 shadow-md shadow-secondary/15 hover:shadow-lg hover:shadow-secondary/20 focus:ring-secondary',
    accent: 'bg-accent text-white hover:bg-accent/95 shadow-md shadow-accent/15 hover:shadow-lg hover:shadow-accent/20 focus:ring-accent',
    outline: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 focus:ring-slate-500',
    ghost: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/15 focus:ring-rose-500',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon className={`h-4.5 w-4.5 mr-2 ${size === 'sm' ? 'h-4 w-4 mr-1.5' : ''}`} />
      ) : null}
      
      {children}
      
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className={`h-4.5 w-4.5 ml-2 ${size === 'sm' ? 'h-4 w-4 ml-1.5' : ''}`} />
      )}
    </button>
  );
};

export default Button;
