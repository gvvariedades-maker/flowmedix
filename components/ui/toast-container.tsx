'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, type Toast, type ToastVariant } from '@/lib/toast-context';
import { cn } from '@/lib/utils';
import { MOBILE_TOAST_FIXED_BOTTOM } from '@/lib/layout/mobileBottomNav';

const variantConfig: Record<
  ToastVariant,
  { icon: React.ElementType; iconClass: string; borderClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-[#6ee7b7]',
    borderClass: 'border-[rgba(0,255,136,0.25)]',
  },
  danger: {
    icon: AlertCircle,
    iconClass: 'text-[#fda4af]',
    borderClass: 'border-[rgba(255,0,85,0.30)]',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-[#fbbf24]',
    borderClass: 'border-[rgba(255,184,0,0.30)]',
  },
  info: {
    icon: Info,
    iconClass: 'text-[#67e8f9]',
    borderClass: 'border-[rgba(0,242,255,0.25)]',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { icon: Icon, iconClass, borderClass } = variantConfig[toast.variant];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
      exit={{ opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.15 } }}
      className={cn(
        'avant-toast flex min-h-[48px] w-full max-w-[360px] items-center gap-3 rounded-[10px] border px-4 py-2.5',
        'bg-[#111827] shadow-lg shadow-black/40',
        borderClass,
      )}
      role="status"
      aria-live="polite"
    >
      <Icon size={16} className={cn('shrink-0', iconClass)} aria-hidden />
      <p className="flex-1 text-sm font-medium leading-snug text-[#e6edf3]">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fechar notificação"
        className="-mr-2 -my-1 flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md text-[#484f58] transition-colors hover:bg-white/10 hover:text-[#8b949e]"
      >
        <X size={18} />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      aria-label="Notificações"
      className={cn(
        'pointer-events-none fixed bottom-6 left-1/2 z-[99998] flex -translate-x-1/2 flex-col items-center gap-2',
        MOBILE_TOAST_FIXED_BOTTOM,
        'sm:left-auto sm:right-6 sm:translate-x-0 sm:items-end',
      )}
    >
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={() => removeToast(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
