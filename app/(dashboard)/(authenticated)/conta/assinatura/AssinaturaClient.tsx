'use client';

import { ArrowRight, CreditCard, Loader2, Sparkles, Zap } from 'lucide-react';
import type { ProSource } from '@/lib/freemium/constants';
import { FREEMIUM_PLAN_LIMITS_DESCRIPTION } from '@/lib/freemium/constants';
import { useProBillingPortal } from '@/components/pro/useProBillingPortal';
import { useProCheckout } from '@/components/pro/useProCheckout';
import { useDashboardBottomInset } from '@/lib/layout/useDashboardBottomInset';
import { cn } from '@/lib/utils';

function formatProExpiry(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  });
}

type AssinaturaClientProps = {
  isPro: boolean;
  proSource: ProSource;
  proExpiresAt: string | null;
  isAdmin: boolean;
};

export function AssinaturaClient({
  isPro,
  proSource,
  proExpiresAt,
  isAdmin,
}: AssinaturaClientProps) {
  const { pageBottomPadding } = useDashboardBottomInset('default');
  const { openBillingPortal, loading: portalLoading, error: portalError } = useProBillingPortal();
  const { handleCheckout, loading: checkoutLoading, error: checkoutError } = useProCheckout();

  const expiryLabel = formatProExpiry(proExpiresAt);
  const showStripeManage = isPro && proSource === 'stripe';
  const showInviteInfo = isPro && proSource === 'invite';
  const showUpgrade = !isPro || proSource === 'invite';

  return (
    <div className={cn('mx-auto max-w-2xl bg-background px-4 py-8 sm:px-6 sm:py-12', pageBottomPadding)}>
      <div className="mb-8">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-[#166534]">
          Minha conta
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Assinatura AVANT Pro
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
          Gerencie seu plano, forma de pagamento ou cancelamento. Você continua com acesso até o fim
          do período já pago.
        </p>
      </div>

      <div className="card-elevated-lg p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div
              className={`mb-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 ring-1 ${
                isPro ? 'bg-[rgba(34, 197, 94,0.12)] ring-[rgba(34, 197, 94,0.35)]' : 'bg-slate-100 ring-slate-200'
              }`}
            >
              {isPro ? (
                <Zap size={12} className="shrink-0 text-[#166534]" fill="currentColor" aria-hidden />
              ) : (
                <Sparkles size={12} className="shrink-0 text-slate-500" aria-hidden />
              )}
              <span
                className={`text-[10px] font-black uppercase tracking-[0.15em] ${
                  isPro ? 'text-[#166534]' : 'text-slate-500'
                }`}
              >
                {isAdmin && isPro
                  ? 'Acesso completo'
                  : isPro
                    ? 'AVANT PRO'
                    : 'Plano gratuito'}
              </span>
            </div>

            {isAdmin && isPro ? (
              <p className="text-sm font-medium text-slate-700">
                Sua conta tem acesso administrativo ilimitado.
              </p>
            ) : showStripeManage ? (
              <p className="text-sm font-medium text-slate-700">
                Assinatura ativa via Stripe · R$ 14,90/mês · cancelável a qualquer momento.
              </p>
            ) : showInviteInfo ? (
              <p className="text-sm font-medium text-slate-700">
                Pro temporário por convite
                {expiryLabel ? (
                  <>
                    {' '}
                    · válido até <strong className="text-slate-900">{expiryLabel}</strong>
                  </>
                ) : null}
                .
              </p>
            ) : (
              <p className="text-sm font-medium text-slate-700">
                {FREEMIUM_PLAN_LIMITS_DESCRIPTION} · sem cartão. Assine o Pro para estudar sem limite.
              </p>
            )}
          </div>
          <CreditCard size={28} className="shrink-0 text-slate-400" aria-hidden />
        </div>

        {showStripeManage ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-slate-600">
              No portal seguro do Stripe você pode cancelar a assinatura, atualizar o cartão ou ver
              faturas. O cancelamento mantém o acesso até o fim do ciclo já pago.
            </p>
            <button
              type="button"
              onClick={() => void openBillingPortal()}
              disabled={portalLoading}
              className="btn-editorial-outline inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold disabled:opacity-60 sm:w-auto"
            >
              {portalLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden />
                  Abrindo portal…
                </>
              ) : (
                <>
                  Gerenciar ou cancelar assinatura
                  <ArrowRight size={16} aria-hidden />
                </>
              )}
            </button>
            {portalError ? (
              <p className="text-sm font-medium text-rose-600" role="alert">
                {portalError}
              </p>
            ) : null}
          </div>
        ) : null}

        {showUpgrade && !isAdmin ? (
          <div className={showStripeManage ? 'mt-8 border-t border-slate-200 pt-8' : ''}>
            <p className="mb-4 text-sm leading-relaxed text-slate-600">
              {showInviteInfo
                ? 'Quando o Pro por convite terminar, assine para continuar sem limite.'
                : 'Estude sem limite com questões reais e NeuroSlides após cada questão.'}
            </p>
            <button
              type="button"
              onClick={() => void handleCheckout()}
              disabled={checkoutLoading}
              className="btn-editorial-primary inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-black uppercase tracking-wider disabled:opacity-60 sm:w-auto"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden />
                  Abrindo pagamento…
                </>
              ) : (
                <>
                  <Zap size={16} fill="currentColor" aria-hidden />
                  Assinar AVANT Pro
                </>
              )}
            </button>
            {checkoutError ? (
              <p className="mt-3 text-sm font-medium text-rose-600" role="alert">
                {checkoutError}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
