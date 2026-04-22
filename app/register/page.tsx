'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, UserPlus, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cidade = searchParams.get('cidade')
    ? decodeURIComponent(searchParams.get('cidade')!)
    : null;

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
    const destinoEstudar = cidade
      ? `/estudar?cidade=${encodeURIComponent(cidade)}`
      : '/estudar';

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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#BEF264]/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap size={24} className="text-[#BEF264]" fill="currentColor" />
            </div>
            <span className="text-3xl font-[1000] italic tracking-tighter text-slate-900">AVANT</span>
          </div>
          <div className="inline-flex items-center gap-2 mb-2 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full">
            <UserPlus size={14} className="text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Nova Conta</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
            Crie seu Acesso
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Prepare-se para concursos de Técnico de Enfermagem com Estudo Reverso.
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleRegister}
          className="space-y-5 bg-white p-8 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
        >

          {pendingEmailVerification ? (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <div className="flex items-start gap-2">
                  <Mail size={20} className="shrink-0 text-emerald-600 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-black">Confirme seu e-mail</p>
                    <p className="text-xs font-medium leading-relaxed">
                      Enviamos um link para <strong>{email.trim()}</strong>. Abra a mensagem e clique no link para
                      ativar sua conta; depois use o login para entrar na plataforma.
                    </p>
                  </div>
                </div>
              </div>
              <Link
                href={cidade ? `/login?cidade=${encodeURIComponent(cidade)}` : '/login'}
                className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all"
              >
                Ir para o login
              </Link>
            </div>
          ) : (
            <>
          {/* E-mail */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
              E-mail de Acesso
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 placeholder:font-normal"
            />
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo 6 caracteres"
                className="w-full bg-slate-50 border border-slate-200 p-4 pr-12 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 placeholder:font-normal"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-indigo-500 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
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
                className="w-full bg-slate-50 border border-slate-200 p-4 pr-12 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 placeholder:font-normal"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-indigo-500 transition-colors"
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
              className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700"
            >
              <AlertCircle size={16} className="shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </motion.div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading || pendingEmailVerification}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <span className="animate-pulse">Criando conta...</span>
            ) : (
              <>
                Criar Minha Conta <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Link login */}
          <p className="text-center text-sm text-slate-400 font-medium pt-1">
            Já tem acesso?{' '}
            <Link
              href={cidade ? `/login?cidade=${encodeURIComponent(cidade)}` : '/login'}
              className="text-indigo-600 font-black hover:text-indigo-700 transition-colors"
            >
              Entrar agora
            </Link>
          </p>

          {/* Rodapé Seguro */}
          <div className="pt-4 mt-2 border-t border-slate-50 flex justify-center items-center gap-2 text-slate-300">
            <Lock size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Ambiente Seguro</span>
          </div>
            </>
          )}
        </form>

        {/* Prova Social */}
        <div className="mt-8 flex justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 size={16} /> <span className="text-xs font-bold">Metodologia Validada</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 size={16} /> <span className="text-xs font-bold">Foco no Edital</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <p className="text-indigo-600 font-bold animate-pulse">Carregando cadastro...</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
