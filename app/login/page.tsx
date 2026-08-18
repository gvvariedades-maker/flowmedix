'use client';

import { Suspense, useState } from 'react';
import { useEditorialTheme } from '@/lib/layout/useEditorialTheme';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Lock, MapPin, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { getPostLoginDestination } from '@/lib/getPostLoginDestination';
import { applyAdminPostLoginOverride } from '@/lib/postLoginRedirect';
import { buildAuthQueryPath } from '@/lib/authQueryPath';
import { redeemInviteFromClient } from '@/lib/invite/clientRedeem';
import { PublicDarkAuthHeader } from '@/components/layout/PublicDarkAuthHeader';
import { AuthAtmosphericBackdrop } from '@/components/layout/AuthAtmosphericBackdrop';

function LoginTopBar() {
  const searchParams = useSearchParams();
  const cidade = searchParams.get('cidade')
    ? decodeURIComponent(searchParams.get('cidade')!)
    : null;
  const concurso = searchParams.get('concurso')?.trim() || null;
  const invite = searchParams.get('invite')?.trim() || null;
  const registerHref = buildAuthQueryPath('/register', cidade, concurso, invite);

  return (
    <PublicDarkAuthHeader variant="login" registerHref={registerHref} appearance="editorial" />
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);

  const cidade = searchParams.get('cidade')
    ? decodeURIComponent(searchParams.get('cidade')!)
    : null;
  const concurso = searchParams.get('concurso')?.trim() || null;
  const inviteToken = searchParams.get('invite')?.trim() || null;
  const nextPath = searchParams.get('next');
  const registerHref = buildAuthQueryPath('/register', cidade, concurso, inviteToken);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInviteNotice(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        setError(authError.message || 'Erro ao fazer login. Verifique suas credenciais.');
        setLoading(false);
        return;
      }

      if (!data.session) {
        setError('Não foi possível criar a sessão. Tente novamente.');
        setLoading(false);
        return;
      }

      await supabase.auth.getSession();

      await fetch('/api/concursos/matricular', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concursoSlug: 'geral' }),
      }).catch(() => undefined);

      if (concurso && concurso !== 'geral') {
        await fetch('/api/concursos/matricular', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ concursoSlug: concurso }),
        }).catch(() => undefined);
      }

      if (inviteToken) {
        const redeem = await redeemInviteFromClient(inviteToken);
        if (redeem.ok && redeem.message) {
          setInviteNotice(redeem.message);
        } else if (!redeem.ok) {
          setError(redeem.message);
          setLoading(false);
          return;
        }
      }

      let destino = getPostLoginDestination(nextPath, cidade, concurso);
      destino = await applyAdminPostLoginOverride(destino);

      router.push(destino);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao fazer login.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="login-auth-card space-y-6">
        <div className="space-y-4 text-center">
          {cidade ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[#F26522]/30 bg-[#F26522]/10 p-4"
            >
              <p className="mb-1 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#9A3412]">
                <MapPin size={12} /> Turma confirmada
              </p>
              <p className="text-lg font-bold leading-tight text-slate-900">{cidade}</p>
            </motion.div>
          ) : null}

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Acesse sua área</h1>

          {inviteToken ? (
            <p className="text-xs font-semibold text-[#9A3412]">
              Convite AVANT enf Pro detectado — ao entrar, o benefício será aplicado automaticamente.
            </p>
          ) : null}
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label className="label-editorial" htmlFor="login-email">E-mail de acesso</label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            className="input-editorial"
          />
        </div>

        <div className="space-y-2">
          <label className="label-editorial" htmlFor="login-password">Senha</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="input-editorial pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-4 flex items-center text-slate-400 transition-colors hover:text-slate-700"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex justify-end">
            <Link href="/esqueci-senha" className="link-editorial-secondary text-xs">
              Esqueci a senha
            </Link>
          </div>
        </div>

        {inviteNotice ? (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
            <CheckCircle2 size={16} className="shrink-0 text-green-600" />
            <p className="text-xs font-bold">{inviteNotice}</p>
          </div>
        ) : null}

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800"
          >
            <AlertCircle size={16} className="shrink-0" />
            <p className="text-xs font-bold">{error}</p>
          </motion.div>
        ) : null}

        <button type="submit" disabled={loading} className="btn-editorial-primary group w-full">
          {loading ? (
            <span className="animate-pulse">Entrando...</span>
          ) : (
            <>
              Acessar Plataforma{' '}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        <p className="pt-1 text-center text-sm text-slate-600">
          Não tem conta?{' '}
          <Link
            href={registerHref}
            className="font-semibold text-slate-700 underline-offset-2 transition-colors hover:text-slate-900 hover:underline"
          >
            Cadastre-se na AVANT enf
          </Link>
        </p>

        <div className="flex items-center justify-center gap-2 border-t border-slate-200 pt-4 text-slate-500">
          <Lock size={12} aria-hidden />
          <span className="text-[10px] font-semibold uppercase tracking-wide">Ambiente seguro</span>
        </div>
        </form>
      </div>

      <div className="mt-6 flex justify-center gap-6 text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} aria-hidden />
          <span className="text-[11px] font-medium">Metodologia validada</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} aria-hidden />
          <span className="text-[11px] font-medium">Foco no edital</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  useEditorialTheme();

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[var(--color-surface-0)] text-slate-900">
      <AuthAtmosphericBackdrop variant="editorial" />

      <Suspense
        fallback={
          <div className="min-h-[6.75rem] shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-xl sm:min-h-[73px]" />
        }
      >
        <LoginTopBar />
      </Suspense>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6">
        <Suspense
          fallback={
            <div className="animate-pulse text-sm font-medium text-slate-500">Carregando acesso...</div>
          }
        >
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
