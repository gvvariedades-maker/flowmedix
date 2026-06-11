'use client';

import { forwardRef, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, LockKeyhole, Sparkles, X, Zap } from 'lucide-react';
import { GERAL_CONCURSO_SLUG } from '@/lib/concursos/catalogSlugs';
import {
  FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT,
  FREEMIUM_PLAN_LIMITS_DESCRIPTION,
  FREEMIUM_SIMULADO_DAILY_LIMIT,
} from '@/lib/freemium/constants';
import { useBodyScrollLock } from '@/lib/layout/useBodyScrollLock';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableIn(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
    if (el.getAttribute('tabindex') === '-1') return false;
    if (el.hasAttribute('disabled')) return false;
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') return false;
    return typeof el.tabIndex === 'number' && el.tabIndex >= 0;
  });
}

function formatResetEm(resetEm: string | null): string | null {
  if (!resetEm) return null;
  const date = new Date(resetEm);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

export type PaywallModalVariant = 'estudo_reverso' | 'simulado';

type PaywallModalProps = {
  open: boolean;
  onClose: () => void;
  resetEm: string | null;
  loginHref?: string;
  isAuthenticated?: boolean;
  variant?: PaywallModalVariant;
};

const PAYWALL_COPY: Record<
  PaywallModalVariant,
  { title: string; body: ReactNode; dailyLimit: number }
> = {
  estudo_reverso: {
    title: 'Você já respondeu sua questão de hoje',
    dailyLimit: FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT,
    body: (
      <>
        No plano gratuito:{' '}
        <span className="font-semibold text-slate-800">{FREEMIUM_PLAN_LIMITS_DESCRIPTION}</span>{' '}
        (estudo reverso com NeuroSlides). Com o{' '}
        <span className="font-semibold text-[#3d6b0f]">AVANT Pro</span>, estude sem limite.
      </>
    ),
  },
  simulado: {
    title: 'Limite diário de simulado atingido',
    dailyLimit: FREEMIUM_SIMULADO_DAILY_LIMIT,
    body: (
      <>
        No plano gratuito:{' '}
        <span className="font-semibold text-slate-800">{FREEMIUM_PLAN_LIMITS_DESCRIPTION}</span>.
        Com o <span className="font-semibold text-[#3d6b0f]">AVANT Pro</span>, simule sem limite.
      </>
    ),
  },
};

export function PaywallModal({
  open,
  onClose,
  resetEm,
  loginHref = '/login?next=/planos',
  isAuthenticated = true,
  variant = 'estudo_reverso',
}: PaywallModalProps) {
  const copy = PAYWALL_COPY[variant];
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetLabel = formatResetEm(resetEm);

  useEffect(() => {
    if (!open) return;
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    const id = window.requestAnimationFrame(() => {
      getFocusableIn(panelRef.current)[0]?.focus();
    });
    return () => {
      window.cancelAnimationFrame(id);
      previousActiveElementRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useBodyScrollLock(open);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/pagamentos/criar-sessao', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concurso_slug: GERAL_CONCURSO_SLUG }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
        redirectUrl?: string;
      };

      if (response.status === 409 && payload.redirectUrl) {
        window.location.href = payload.redirectUrl;
        return;
      }

      if (!response.ok) {
        setError(payload.error || 'Não foi possível iniciar o pagamento.');
        return;
      }

      if (!payload.url) {
        setError('Checkout indisponível no momento.');
        return;
      }

      window.location.href = payload.url;
    } catch {
      setError('Erro de rede ao iniciar o pagamento.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <PaywallDialogPanel ref={panelRef}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
          aria-label="Fechar"
        >
          <X size={18} aria-hidden />
        </button>

        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(143,224,32,0.35)] bg-[rgba(143,224,32,0.12)] text-[#3d6b0f]">
            <LockKeyhole size={28} aria-hidden />
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] font-black uppercase tracking-[0.22em] text-[#3d6b0f]">
          <Sparkles size={12} className="mr-1 inline" aria-hidden />
          Limite diário
        </p>

        <h2
          id="paywall-title"
          className="mt-3 text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl"
        >
          {copy.title}
        </h2>

        <p className="mt-4 text-center text-sm leading-relaxed text-slate-600">{copy.body}</p>

        {resetLabel ? (
          <p className="mt-3 text-center text-xs text-slate-500">
            {variant === 'simulado'
              ? 'Próximas questões gratuitas de simulado liberadas às '
              : 'Próxima questão gratuita liberada às '}
            <span className="font-semibold text-slate-700">{resetLabel}</span> (horário de Brasília).
          </p>
        ) : null}

        <ul className="mt-6 space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <Zap size={16} className="mt-0.5 shrink-0 text-[#3d6b0f]" aria-hidden />
            Questões ilimitadas em todos os editais
          </li>
          <li className="flex items-start gap-2">
            <Zap size={16} className="mt-0.5 shrink-0 text-[#3d6b0f]" aria-hidden />
            {variant === 'simulado'
              ? 'Simulados e estudo reverso sem limite diário'
              : 'Estudo Reverso completo após cada tentativa'}
          </li>
        </ul>

        <div className="mt-8 flex flex-col gap-3">
          {!isAuthenticated ? (
            <Link href={loginHref} className="btn-editorial-primary inline-flex w-full items-center justify-center gap-2 px-5 py-3.5 text-sm font-black uppercase tracking-wider">
              Entrar para assinar
              <ArrowRight size={18} aria-hidden />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="btn-editorial-primary inline-flex w-full items-center justify-center gap-2 px-5 py-3.5 text-sm font-black uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden />
                  Redirecionando…
                </>
              ) : (
                <>
                  Assinar AVANT Pro
                  <ArrowRight size={18} aria-hidden />
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="btn-editorial-outline w-full px-5 py-3 text-sm font-semibold"
          >
            Voltar depois
          </button>

          {error ? (
            <p className="text-center text-sm font-medium text-rose-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </PaywallDialogPanel>
    </div>
  );
}

const PaywallDialogPanel = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  function PaywallDialogPanel({ children }, ref) {
    return (
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        className="card-elevated-lg relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
      >
        {children}
      </div>
    );
  },
);
