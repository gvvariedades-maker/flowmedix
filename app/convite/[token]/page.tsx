import Link from 'next/link';
import { Gift, AlertCircle, Clock, Ban } from 'lucide-react';
import { AvantLogo } from '@/components/brand/AvantLogo';

import { AuthAtmosphericBackdrop } from '@/components/layout/AuthAtmosphericBackdrop';
import { PublicDarkAuthHeader } from '@/components/layout/PublicDarkAuthHeader';
import { buildAuthQueryPath } from '@/lib/authQueryPath';
import { FREEMIUM_PLAN_LIMITS_DESCRIPTION } from '@/lib/freemium';
import { getInviteLinkPreview } from '@/lib/invite/links';
import type { InviteLinkPublicStatus } from '@/lib/invite/shared';

type PageProps = { params: Promise<{ token: string }> };

function formatDatePt(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function statusCopy(status: InviteLinkPublicStatus): { title: string; detail: string; icon: typeof Gift } {
  switch (status) {
    case 'revoked':
      return {
        title: 'Link revogado',
        detail: 'Este convite não está mais disponível.',
        icon: Ban,
      };
    case 'expired':
      return {
        title: 'Link expirado',
        detail: 'O prazo para usar este convite terminou.',
        icon: Clock,
      };
    case 'exhausted':
      return {
        title: 'Convite esgotado',
        detail: 'Este link já atingiu o número máximo de resgates.',
        icon: AlertCircle,
      };
    default:
      return {
        title: 'Convite AVANT Enf Pro',
        detail: 'Estudo ilimitado por um período — crie sua conta ou entre para resgatar.',
        icon: Gift,
      };
  }
}

export default async function ConvitePage({ params }: PageProps) {
  const { token: rawToken } = await params;
  const token = decodeURIComponent(rawToken).trim();

  let preview: Awaited<ReturnType<typeof getInviteLinkPreview>> = null;
  let loadError = false;
  if (token) {
    try {
      preview = await getInviteLinkPreview(token);
    } catch {
      loadError = true;
    }
  }

  const isValid = preview?.status === 'active';
  const copy = loadError
    ? {
        title: 'Erro ao carregar convite',
        detail: 'Não foi possível validar este link agora. Tente de novo em instantes.',
        icon: AlertCircle,
      }
    : preview
      ? statusCopy(preview.status)
      : statusCopy('expired');
  const StatusIcon = copy.icon;

  const registerHref = buildAuthQueryPath('/register', null, null, isValid ? token : null);
  const loginHref = buildAuthQueryPath('/login', null, null, isValid ? token : null);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#010409] text-slate-100">
      <AuthAtmosphericBackdrop />
      <PublicDarkAuthHeader variant="login" registerHref={registerHref} />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <AvantLogo size="lg" />
            </div>
          </div>

          <div className="space-y-6 rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  isValid ? 'bg-indigo-600/30 text-indigo-200' : 'bg-rose-950/40 text-rose-300'
                }`}
              >
                <StatusIcon size={28} />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">{copy.title}</h1>
              <p className="text-sm font-medium text-slate-400">{copy.detail}</p>
            </div>

            {isValid && preview ? (
              <ul className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                <li>
                  <span className="font-black text-cyan-400">{preview.proDays} dias</span> de AVANT Enf Pro
                  ilimitado após o resgate
                </li>
                <li>
                  Link válido até{' '}
                  <span className="font-bold text-slate-200">{formatDatePt(preview.linkExpiresAt)}</span>
                </li>
                {preview.maxUses > 1 ? (
                  <li>
                    Restam{' '}
                    <span className="font-bold text-slate-200">{preview.usesRemaining}</span> de{' '}
                    {preview.maxUses} usos
                  </li>
                ) : null}
              </ul>
            ) : null}

            {isValid ? (
              <div className="flex flex-col gap-3">
                <Link
                  href={registerHref}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 p-4 text-center font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700"
                >
                  Criar conta e resgatar
                </Link>
                <Link
                  href={loginHref}
                  className="flex w-full items-center justify-center rounded-xl border border-white/15 p-4 text-center text-sm font-black uppercase tracking-widest text-cyan-400 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
                >
                  Já tenho conta — entrar
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-center text-xs text-slate-500">
                  Você ainda pode estudar no freemium ({FREEMIUM_PLAN_LIMITS_DESCRIPTION}).
                </p>
                <Link
                  href="/register"
                  className="flex w-full items-center justify-center rounded-xl bg-indigo-600 p-4 text-center font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700"
                >
                  Criar conta grátis
                </Link>
                <Link
                  href="/planos"
                  className="flex w-full items-center justify-center rounded-xl border border-white/15 p-4 text-center text-sm font-black uppercase tracking-widest text-slate-300 transition-colors hover:text-white"
                >
                  Ver planos AVANT Enf Pro
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
