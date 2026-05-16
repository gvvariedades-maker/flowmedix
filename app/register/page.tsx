'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, MapPin, UserPlus, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getPostLoginDestination } from '@/lib/getPostLoginDestination';
import { applyAdminPostLoginOverride } from '@/lib/postLoginRedirect';
import { buildAuthQueryPath } from '@/lib/authQueryPath';
import { AuthAtmosphericBackdrop } from '@/components/layout/AuthAtmosphericBackdrop';
import { PublicDarkAuthHeader } from '@/components/layout/PublicDarkAuthHeader';

function RegisterTopBar() {
  const searchParams = useSearchParams();
  const cidade = searchParams.get('cidade')
    ? decodeURIComponent(searchParams.get('cidade')!)
    : null;
  const concurso = searchParams.get('concurso')?.trim() || null;

  return (
    <PublicDarkAuthHeader
      variant="register"
      loginHref={buildAuthQueryPath('/login', cidade, concurso)}
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Quando o Supabase exige confirmação por e-mail antes de criar sessão */
  const [pendingEmailVerification, setPendingEmailVerification] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
        setError(authError.message || 'Erro ao criar conta. Tente novamente.');
        setLoading(false);
        return;
      }

      if (data.session) {
        await supabase.auth.getSession();

        if (concurso) {
          await fetch('/api/concursos/matricular', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ concursoSlug: concurso }),
          }).catch(() => undefined);
        }

        destinoEstudar = await applyAdminPostLoginOverride(destinoEstudar);
        router.push(destinoEstudar);
        router.refresh();
        return;
      }

      // Confirmação por e-mail ativa no Supabase: sem sessão até o usuário clicar no link
      setPendingEmailVerification(true);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.');
      setLoading(false);
    }
  };

  const loginHref = buildAuthQueryPath('/login', cidade, concurso);

  const inputClassName =
    'w-full rounded-xl border border-[rgba(255,255,255,0.10)] bg-white/[0.05] p-4 font-bold text-white outline-none transition-all placeholder:font-normal placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20';

  return (
    <div className="relative z-10 w-full max-w-md">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-6 inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
            <Zap size={24} className="text-[#BEF264]" fill="currentColor" />
          </div>
          <span className="text-3xl font-[1000] italic tracking-tighter text-white">AVANT</span>
        </div>

        {cidade ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl border border-white/10 bg-indigo-500/10 p-4"
          >
            <p className="mb-1 flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-300">
              <MapPin size={12} /> Turma Confirmada
            </p>
            <h2 className="text-xl font-black uppercase leading-tight text-indigo-100">{cidade}</h2>
          </motion.div>
        ) : null}

        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5">
          <UserPlus size={14} className="text-cyan-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">Nova Conta</span>
        </div>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Crie seu Acesso</h1>
        <p className="mt-1 text-sm font-medium text-slate-400">
          Prepare-se para concursos de Técnico de Enfermagem com Estudo Reverso.
        </p>
      </div>

      {/* Formulário */}
      <form
        onSubmit={handleRegister}
        className="relative space-y-5 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        {pendingEmailVerification ? (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2 rounded-xl border border-emerald-500/25 bg-emerald-950/35 p-4 text-emerald-100">
              <div className="flex items-start gap-2">
                <Mail size={20} className="mt-0.5 shrink-0 text-emerald-400" />
                <div className="space-y-2">
                  <p className="text-sm font-black">Confirme seu e-mail</p>
                  <p className="text-xs font-medium leading-relaxed">
                    Enviamos um link para <strong className="text-emerald-50">{email.trim()}</strong>. Abra a mensagem e
                    clique no link para ativar sua conta; depois use o login para entrar na plataforma.
                  </p>
                </div>
              </div>
            </div>
            <Link
              href={loginHref}
              className="flex w-full items-center justify-center rounded-xl bg-indigo-600 p-4 text-center font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700"
            >
              Ir para o login
            </Link>
          </div>
        ) : (
          <>
            {/* E-mail */}
            <div className="space-y-2">
              <label className="pl-1 text-xs font-black uppercase tracking-widest text-slate-400">
                E-mail de Acesso
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={inputClassName}
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label className="pl-1 text-xs font-black uppercase tracking-widest text-slate-400">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="mínimo 6 caracteres"
                  className={`${inputClassName} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-500 transition-colors hover:text-cyan-400"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <label className="pl-1 text-xs font-black uppercase tracking-widest text-slate-400">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="repita a senha"
                  className={`${inputClassName} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-500 transition-colors hover:text-cyan-400"
                  aria-label={showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-rose-200"
              >
                <AlertCircle size={16} className="shrink-0" />
                <p className="text-xs font-bold">{error}</p>
              </motion.div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading || pendingEmailVerification}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-600 p-4 font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="animate-pulse">Criando conta...</span>
              ) : (
                <>
                  Criar Minha Conta{' '}
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Link login */}
            <p className="pt-1 text-center text-sm font-medium text-slate-400">
              Já tem acesso?{' '}
              <Link href={loginHref} className="font-black text-cyan-400 transition-colors hover:text-cyan-300">
                Entrar agora
              </Link>
            </p>

            {/* Rodapé Seguro */}
            <div className="mt-2 flex items-center justify-center gap-2 border-t border-white/10 pt-4 text-slate-500">
              <Lock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Ambiente Seguro</span>
            </div>
          </>
        )}
      </form>

      {/* Prova Social */}
      <div className="mt-8 flex justify-center gap-6 text-slate-500 transition-colors duration-500 hover:text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-slate-500" />{' '}
          <span className="text-xs font-bold">Metodologia Validada</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-slate-500" />{' '}
          <span className="text-xs font-bold">Foco no Edital</span>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#010409] text-slate-100">
      <AuthAtmosphericBackdrop />

      <Suspense
        fallback={
          <div className="min-h-[73px] shrink-0 border-b border-white/5 bg-slate-950/55 backdrop-blur-xl" />
        }
      >
        <RegisterTopBar />
      </Suspense>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6">
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center">
              <p className="animate-pulse text-sm font-medium text-slate-400">Carregando cadastro...</p>
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
