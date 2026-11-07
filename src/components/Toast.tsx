import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-900/50 dark:text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-50/90 border-rose-200 text-rose-800 dark:bg-rose-950/90 dark:border-rose-900/50 dark:text-rose-200'
                : toast.type === 'warning'
                ? 'bg-amber-50/90 border-amber-200 text-amber-800 dark:bg-amber-950/90 dark:border-amber-900/50 dark:text-amber-200'
                : 'bg-slate-50/90 border-slate-200 text-slate-800 dark:bg-slate-900/90 dark:border-slate-800/50 dark:text-slate-200'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-500" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-500" />}
            </div>
            <div className="flex-1 text-sm font-medium pr-2">{toast.text}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-0.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
