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
    <div className={cn('mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12', pageBottomPadding)}>
      <div className="mb-8">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">
          Minha conta
        </p>
        <h1 className="text-2xl font-[1000] tracking-tight text-white sm:text-3xl">
          Assinatura AVANT Pro
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-400 sm:text-base">
          Gerencie seu plano, forma de pagamento ou cancelamento. Você continua com acesso até o fim
          do período já pago.
        </p>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div
              className={`mb-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 ring-1 backdrop-blur-sm ${
                isPro ? 'bg-[#BEF264]/15 ring-[#BEF264]/30' : 'bg-white/8 ring-white/10'
              }`}
            >
              {isPro ? (
                <Zap size={12} className="shrink-0 text-[#BEF264]" fill="currentColor" aria-hidden />
              ) : (
                <Sparkles size={12} className="shrink-0 text-slate-400" aria-hidden />
              )}
              <span
                className={`text-[10px] font-black uppercase tracking-[0.15em] ${
                  isPro ? 'text-[#BEF264]' : 'text-slate-400'
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
              <p className="text-sm font-medium text-slate-300">
                Sua conta tem acesso administrativo ilimitado.
              </p>
            ) : showStripeManage ? (
              <p className="text-sm font-medium text-slate-300">
                Assinatura ativa via Stripe · R$ 14,90/mês · cancelável a qualquer momento.
              </p>
            ) : showInviteInfo ? (
              <p className="text-sm font-medium text-slate-300">
                Pro temporário por convite
                {expiryLabel ? (
                  <>
                    {' '}
                    · válido até <strong className="text-white">{expiryLabel}</strong>
                  </>
                ) : null}
                .
              </p>
            ) : (
              <p className="text-sm font-medium text-slate-300">
                {FREEMIUM_PLAN_LIMITS_DESCRIPTION} · sem cartão. Assine o Pro para estudar sem limite.
              </p>
            )}
          </div>
          <CreditCard size={28} className="shrink-0 text-slate-600" aria-hidden />
        </div>

        {showStripeManage ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-slate-400">
              No portal seguro do Stripe você pode cancelar a assinatura, atualizar o cartão ou ver
              faturas. O cancelamento mantém o acesso até o fim do ciclo já pago.
            </p>
            <button
              type="button"
              onClick={() => void openBillingPortal()}
              disabled={portalLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-60 sm:w-auto"
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
              <p className="text-sm font-medium text-rose-300" role="alert">
                {portalError}
              </p>
            ) : null}
          </div>
        ) : null}

        {showUpgrade && !isAdmin ? (
          <div className={showStripeManage ? 'mt-8 border-t border-white/10 pt-8' : ''}>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              {showInviteInfo
                ? 'Quando o Pro por convite terminar, assine para continuar sem limite.'
                : 'Estude sem limite com questões reais e NeuroSlides após cada questão.'}
            </p>
            <button
              type="button"
              onClick={() => void handleCheckout()}
              disabled={checkoutLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#BEF264] px-6 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 transition-all hover:bg-[#d4f879] disabled:opacity-60 sm:w-auto"
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
              <p className="mt-3 text-sm font-medium text-rose-300" role="alert">
                {checkoutError}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

    </div>
  );
}
