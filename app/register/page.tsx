'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useEditorialTheme } from '@/lib/layout/useEditorialTheme';
import { supabase } from '@/lib/supabase/client';
import { getPostLoginDestination } from '@/lib/getPostLoginDestination';
import { applyAdminPostLoginOverride } from '@/lib/postLoginRedirect';
import { buildAuthQueryPath } from '@/lib/authQueryPath';
import { redeemInviteFromClient } from '@/lib/invite/clientRedeem';
import { mapRegisterAuthError } from '@/lib/authErrorMessages';
import { AuthAtmosphericBackdrop } from '@/components/layout/AuthAtmosphericBackdrop';
import { PublicDarkAuthHeader } from '@/components/layout/PublicDarkAuthHeader';

function RegisterTopBar() {
  const searchParams = useSearchParams();
  const cidade = searchParams.get('cidade')
    ? decodeURIComponent(searchParams.get('cidade')!)
    : null;
  const concurso = searchParams.get('concurso')?.trim() || null;
  const invite = searchParams.get('invite')?.trim() || null;

  return (
    <PublicDarkAuthHeader
      variant="register"
      loginHref={buildAuthQueryPath('/login', cidade, concurso, invite)}
      appearance="editorial"
    />
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cidade = searchParams.get('cidade')
    ? decodeURIComponent(searchParams.get('cidade')!)
    : null;
  const concurso = searchParams.get('concurso')?.trim() || null;
  const inviteToken = searchParams.get('invite')?.trim() || null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmailVerification, setPendingEmailVerification] = useState(false);
  const [emailJaCadastrado, setEmailJaCadastrado] = useState(false);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailJaCadastrado(false);
    setInviteNotice(null);

    if (password.length < 6) {
      setError('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    let destinoEstudar = getPostLoginDestination(null, cidade, concurso);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: origin ? `${origin}/login` : undefined,
        },
      });

      if (authError) {
        const msg = mapRegisterAuthError(authError.message);
        setError(msg);
        setEmailJaCadastrado(msg.includes('já está cadastrado'));
        setLoading(false);
        return;
      }

      const identities = data.user?.identities;
      if (data.user && Array.isArray(identities) && identities.length === 0) {
        setError(mapRegisterAuthError('User already registered'));
        setEmailJaCadastrado(true);
        setLoading(false);
        return;
      }

      if (data.session) {
        await supabase.auth.getSession();

        void fetch('/api/auth/welcome-email', {
          method: 'POST',
          credentials: 'same-origin',
        }).catch(() => undefined);

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

        destinoEstudar = await applyAdminPostLoginOverride(destinoEstudar);
        router.push(destinoEstudar);
        router.refresh();
        return;
      }

      setPendingEmailVerification(true);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.');
      setLoading(false);
    }
  };

  const loginHref = buildAuthQueryPath('/login', cidade, concurso, inviteToken);

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

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Crie seu acesso</h1>

          {inviteToken ? (
            <p className="text-xs font-semibold text-[#9A3412]">
              Convite AVANT enf Pro — após criar a conta, o Pro temporário será ativado automaticamente.
            </p>
          ) : null}
        </div>

        {pendingEmailVerification ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
              <div className="flex items-start gap-2">
                <Mail size={20} className="mt-0.5 shrink-0 text-green-600" />
                <div className="space-y-2">
                  <p className="text-sm font-bold">Confirme seu e-mail</p>
                  <p className="text-xs font-medium leading-relaxed text-green-800">
                    Se a confirmação por e-mail estiver ativa, abra o link enviado para{' '}
                    <strong className="text-green-900">{email.trim()}</strong> e depois entre no login. Você também
                    deve receber um e-mail de boas-vindas do AVANT enf (verifique spam e promoções).
                  </p>
                </div>
              </div>
            </div>
            <Link href={loginHref} className="btn-editorial-primary group flex w-full items-center justify-center">
              Ir para o login
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="label-editorial" htmlFor="register-email">E-mail de acesso</label>
              <input
                id="register-email"
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
              <label className="label-editorial" htmlFor="register-password">Senha</label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="mínimo 6 caracteres"
                  autoComplete="new-password"
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
            </div>

            <div className="space-y-2">
              <label className="label-editorial" htmlFor="register-confirm-password">Confirmar senha</label>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="repita a senha"
                  autoComplete="new-password"
                  className="input-editorial pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 transition-colors hover:text-slate-700"
                  aria-label={showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <p className="text-xs font-bold">{error}</p>
                </div>
                {emailJaCadastrado ? (
                  <div className="flex flex-wrap gap-2 pl-6">
                    <Link
                      href={loginHref}
                      className="text-xs font-semibold text-[#9A3412] underline-offset-2 hover:underline"
                    >
                      Entrar agora
                    </Link>
                    <span className="text-xs text-red-400">·</span>
                    <Link href="/esqueci-senha" className="link-editorial-secondary text-xs">
                      Esqueci minha senha
                    </Link>
                  </div>
                ) : null}
              </motion.div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="btn-editorial-primary group w-full"
            >
              {loading ? (
                <span className="animate-pulse">Criando conta...</span>
              ) : (
                <>
                  Criar minha conta
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <p className="pt-1 text-center text-sm text-slate-600">
              Já tem acesso?{' '}
              <Link
                href={loginHref}
                className="font-semibold text-slate-700 underline-offset-2 transition-colors hover:text-slate-900 hover:underline"
              >
                Entrar agora
              </Link>
            </p>

            <div className="flex items-center justify-center gap-2 border-t border-slate-200 pt-4 text-slate-500">
              <Lock size={12} aria-hidden />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Ambiente seguro</span>
            </div>
          </form>
        )}
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

export default function RegisterPage() {
  useEditorialTheme();

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[var(--color-surface-0)] text-slate-900">
      <AuthAtmosphericBackdrop variant="editorial" />

      <Suspense
        fallback={
          <div className="min-h-[6.75rem] shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-xl sm:min-h-[73px]" />
        }
      >
        <RegisterTopBar />
      </Suspense>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6">
        <Suspense
          fallback={
            <div className="animate-pulse text-sm font-medium text-slate-500">Carregando cadastro...</div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
