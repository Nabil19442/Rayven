import React from 'react';
import { useStore } from '../contexts/StoreContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
        let bgClass = 'bg-white border-[#E5E5E3] text-[#1F2024] shadow-xl shadow-zinc-900/10';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />;
          bgClass = 'bg-red-50 border-red-200 text-red-950 shadow-xl shadow-red-900/5';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />;
          bgClass = 'bg-orange-50 border-orange-200 text-orange-950 shadow-xl shadow-orange-900/5';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-[#6D35C8] shrink-0" />;
          bgClass = 'bg-[#F3EEFC] border-[#8B5AD9]/30 text-[#1F2024] shadow-xl shadow-purple-900/5';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 ${bgClass}`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-zinc-700 p-1 rounded transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
