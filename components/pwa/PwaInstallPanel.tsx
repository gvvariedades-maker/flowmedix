'use client';

import { Share, Smartphone, X, Zap } from 'lucide-react';

type PwaInstallPanelProps = {
  isIos: boolean;
  canNativeInstall: boolean;
  onInstall: () => void;
  onDismiss: () => void;
  onClose: () => void;
  /** Banner automático — exibe «Agora não» que persiste dismiss. */
  showDismissAction?: boolean;
  className?: string;
};

export function PwaInstallPanel({
  isIos,
  canNativeInstall,
  onInstall,
  onDismiss,
  onClose,
  showDismissAction = true,
  className,
}: PwaInstallPanelProps) {
  return (
    <div
      className={
        className ??
        'mx-auto mb-3 max-w-md rounded-2xl border border-cyan-400/20 bg-slate-950/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl'
      }
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600">
          <Smartphone size={20} className="text-[#BEF264]" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p id="pwa-install-title" className="text-sm font-black tracking-tight text-white">
            Instale o AVANT no celular
          </p>
          <p id="pwa-install-desc" className="mt-1 text-xs leading-relaxed text-slate-400">
            {isIos ? (
              <>
                Toque em <Share size={12} className="inline -mt-0.5 text-cyan-300" aria-hidden />{' '}
                <strong className="font-semibold text-slate-300">Compartilhar</strong> e depois em{' '}
                <strong className="font-semibold text-slate-300">Adicionar à Tela de Início</strong>.
                Abre como app, sem barra do navegador.
              </>
            ) : canNativeInstall ? (
              'Adicione um atalho na tela inicial e abra o AVANT com um toque — ideal para estudar nos intervalos.'
            ) : (
              'No menu do navegador, escolha «Instalar app» ou «Adicionar à tela inicial» para acesso rápido.'
            )}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {canNativeInstall ? (
              <button
                type="button"
                onClick={() => void onInstall()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#BEF264] px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-950"
              >
                <Zap size={14} fill="currentColor" aria-hidden />
                Instalar
              </button>
            ) : null}
            {showDismissAction ? (
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/5"
              >
                Agora não
              </button>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-white/10 hover:text-slate-300"
          aria-label="Fechar"
        >
          <X size={16} aria-hidden />
        </button>
      </div>
    </div>
  );
}
