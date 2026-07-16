import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  title, 
  subtitle, 
  headerAction,
  padding = 'p-6',
  ...props 
}) => {
  return (
    <div 
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-soft transition-all duration-300 hover:shadow-premium ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5">
          <div>
            {title && (
              <h3 className="font-display text-base font-semibold text-slate-800">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div className={padding}>
        {children}
      </div>
    </div>
  );
};

export default Card;
