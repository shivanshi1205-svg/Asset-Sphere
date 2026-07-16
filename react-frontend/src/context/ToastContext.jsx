import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((msg, dur) => showToast(msg, 'success', dur), [showToast]);
  const error = useCallback((msg, dur) => showToast(msg, 'error', dur), [showToast]);
  const info = useCallback((msg, dur) => showToast(msg, 'info', dur), [showToast]);
  const warning = useCallback((msg, dur) => showToast(msg, 'warning', dur), [showToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, warning, showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let icon = <Info className="h-5 w-5 text-blue-500" />;
            let bgClass = 'bg-white border-blue-100 shadow-blue-50';
            
            if (toast.type === 'success') {
              icon = <CheckCircle className="h-5 w-5 text-emerald-500" />;
              bgClass = 'bg-white border-emerald-100 shadow-emerald-50';
            } else if (toast.type === 'error') {
              icon = <AlertCircle className="h-5 w-5 text-rose-500" />;
              bgClass = 'bg-white border-rose-100 shadow-rose-50';
            } else if (toast.type === 'warning') {
              icon = <AlertTriangle className="h-5 w-5 text-amber-500" />;
              bgClass = 'bg-white border-amber-100 shadow-amber-50';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                layout
                className={`pointer-events-auto flex items-start gap-3 w-full p-4 rounded-xl border shadow-premium transition-all duration-300 ${bgClass}`}
              >
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <div className="flex-1 text-sm font-medium text-slate-700 leading-snug">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5 hover:bg-slate-100 rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
