'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowRight, Lock, MapPin, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { getPostLoginDestination } from '@/lib/getPostLoginDestination';
import { PublicDarkAuthHeader } from '@/components/layout/PublicDarkAuthHeader';
import { AuthAtmosphericBackdrop } from '@/components/layout/AuthAtmosphericBackdrop';

function LoginTopBar() {
  const searchParams = useSearchParams();
  const cidade = searchParams.get('cidade')
    ? decodeURIComponent(searchParams.get('cidade')!)
    : null;
  const registerHref = cidade ? `/register?cidade=${encodeURIComponent(cidade)}` : '/register';

  return <PublicDarkAuthHeader variant="login" registerHref={registerHref} />;
}

// Componente Interno para lidar com parâmetros de URL
function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Captura a cidade da URL (ex: ?cidade=Caicó - RN) e destino interno (ex: ?next=/material)
  const cidade = searchParams.get('cidade')
    ? decodeURIComponent(searchParams.get('cidade')!)
    : null;
  const nextPath = searchParams.get('next');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Autenticação real com Supabase
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

      const destino = getPostLoginDestination(nextPath, cidade);

      router.push(destino);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao fazer login.';
      setError(message);
      setLoading(false);
    }
  };

  const inputClassName =
    'w-full rounded-xl border border-[rgba(255,255,255,0.10)] bg-white/[0.05] p-4 font-bold text-white outline-none transition-all placeholder:font-normal placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20';

  return (
    <div className="w-full max-w-md">
      {/* --- HEADER DO LOGIN --- */}
      <div className="mb-10 text-center">
        <div className="mb-6 inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
            <Zap size={24} className="text-[#BEF264]" fill="currentColor" />
          </div>
          <span className="text-3xl font-[1000] italic tracking-tighter text-white">AVANT</span>
        </div>

        {/* MENSAGEM DINÂMICA (Turma confirmada) */}
        {cidade ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 rounded-2xl border border-white/10 bg-indigo-500/10 p-4"
          >
            <p className="mb-1 flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-300">
              <MapPin size={12} /> Turma Confirmada
            </p>
            <h1 className="text-xl font-black uppercase leading-tight text-indigo-100">{cidade}</h1>
          </motion.div>
        ) : (
          <h1 className="mb-2 text-3xl font-black tracking-tight text-white">Acesse sua Área</h1>
        )}

        <p className="text-sm font-medium text-slate-400">
          Prepare-se para concursos de Técnico de Enfermagem com Estudo Reverso.
        </p>
      </div>

      {/* --- FORMULÁRIO --- */}
      <form
        onSubmit={handleLogin}
        className="relative space-y-5 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        {/* Input E-mail */}
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

        {/* Input Senha */}
        <div className="space-y-2">
          <label className="pl-1 text-xs font-black uppercase tracking-widest text-slate-400">
            Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
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
          <div className="flex justify-end">
            <Link
              href="/esqueci-senha"
              className="text-[10px] font-bold uppercase tracking-wide text-cyan-400 hover:text-cyan-300"
            >
              Esqueci a senha
            </Link>
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

        {/* Botão de Ação */}
        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-600 p-4 font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <span className="animate-pulse">Entrando...</span>
          ) : (
            <>
              Acessar Plataforma{' '}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        <p className="pt-1 text-center text-sm font-medium text-slate-400">
          Não tem conta?{' '}
          <Link
            href={cidade ? `/register?cidade=${encodeURIComponent(cidade)}` : '/register'}
            className="font-black text-cyan-400 transition-colors hover:text-cyan-300"
          >
            Cadastre-se na AVANT
          </Link>
        </p>

        {/* Rodapé Seguro */}
        <div className="mt-2 flex items-center justify-center gap-2 border-t border-white/10 pt-4 text-slate-500">
          <Lock size={12} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Ambiente Seguro</span>
        </div>
      </form>

      {/* --- PROVA SOCIAL (Rodapé) --- */}
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

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#010409] text-slate-100">
      <AuthAtmosphericBackdrop />

      <Suspense
        fallback={
          <div className="min-h-[73px] shrink-0 border-b border-white/5 bg-slate-950/55 backdrop-blur-xl" />
        }
      >
        <LoginTopBar />
      </Suspense>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6">
        <Suspense
          fallback={
            <div className="animate-pulse text-sm font-bold text-slate-400">Carregando Acesso...</div>
          }
        >
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
