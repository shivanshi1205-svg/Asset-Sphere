import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || Math.random().toString(36).substring(2, 9);
  
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-700 tracking-wide"
        >
          {label}
        </label>
      )}
      
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
        
        <input
          id={inputId}
          type={type}
          ref={ref}
          placeholder={placeholder}
          className={`
            w-full rounded-xl border bg-slate-50/50 py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all
            focus:bg-white focus:ring-4
            ${Icon ? 'pl-11' : ''}
            ${error 
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' 
              : 'border-slate-200 focus:border-primary focus:ring-primary/10'}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-xs font-medium text-rose-500 flex items-center gap-1">
          <span>&bull;</span> {error}
        </p>
      )}
      
      {!error && helperText && (
        <p className="text-xs text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
