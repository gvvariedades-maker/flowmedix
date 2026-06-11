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
        'card-elevated mx-auto mb-3 max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-lg'
      }
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(143,224,32,0.35)] bg-[rgba(143,224,32,0.12)]">
          <Smartphone size={20} className="text-[#3d6b0f]" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p id="pwa-install-title" className="text-sm font-black tracking-tight text-slate-900">
            Instale o AVANT no celular
          </p>
          <p id="pwa-install-desc" className="mt-1 text-xs leading-relaxed text-slate-600">
            {isIos ? (
              <>
                Toque em <Share size={12} className="inline -mt-0.5 text-[#3d6b0f]" aria-hidden />{' '}
                <strong className="font-semibold text-slate-800">Compartilhar</strong> e depois em{' '}
                <strong className="font-semibold text-slate-800">Adicionar à Tela de Início</strong>.
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
                className="btn-editorial-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider"
              >
                <Zap size={14} fill="currentColor" aria-hidden />
                Instalar
              </button>
            ) : null}
            {showDismissAction ? (
              <button
                type="button"
                onClick={onDismiss}
                className="btn-editorial-outline px-4 py-2 text-xs font-bold"
              >
                Agora não
              </button>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Fechar"
        >
          <X size={16} aria-hidden />
        </button>
      </div>
    </div>
  );
}
