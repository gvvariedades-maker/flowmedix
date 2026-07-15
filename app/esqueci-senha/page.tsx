'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Mail, Send } from 'lucide-react';
import { AvantLogo } from '@/components/brand/AvantLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { PublicLightAuthHeader } from '@/components/layout/PublicLightAuthHeader';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/redefinir-senha`
          : '/redefinir-senha';

      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      );

      if (authError) {
        setError(authError.message || 'Erro ao enviar e-mail. Tente novamente.');
        setLoading(false);
        return;
      }

      setEnviado(true);
    } catch (err: any) {
      setError(err.message || 'Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50">
      <PublicLightAuthHeader variant="auth-other" />

      {/* Background Decorativo */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-300/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#BEF264]/10 blur-[100px]" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6">
        <div className="relative z-10 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="mb-6 flex justify-center">
            <AvantLogo size="lg" tone="light" animated={false} />
          </div>
          <div className="inline-flex items-center gap-2 mb-2 bg-amber-50 border border-amber-100 px-4 py-1.5 rounded-full">
            <Mail size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Recuperar Acesso</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
            Esqueceu a Senha?
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Digite seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {enviado ? (
            /* Estado de sucesso */
            <motion.div
              key="sucesso"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 text-center space-y-5"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={36} className="text-green-500" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-2">E-mail Enviado!</h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Verifique sua caixa de entrada em{' '}
                  <span className="font-black text-indigo-600">{email}</span>
                  {' '}e clique no link para redefinir sua senha.
                </p>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Não recebeu? Verifique também o spam.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-indigo-600 font-black text-sm hover:text-indigo-700 transition-colors"
              >
                <ArrowLeft size={16} /> Voltar para o Login
              </Link>
            </motion.div>
          ) : (
            /* Formulário */
            <motion.form
              key="formulario"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="space-y-5 bg-white p-8 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
                  E-mail Cadastrado
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="animate-pulse">Enviando...</span>
                ) : (
                  <>
                    Enviar Link de Recuperação <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center pt-1 space-y-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 font-bold hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft size={14} /> Voltar para o Login
                </Link>
                <p className="text-sm text-slate-500 font-medium">
                  Ainda não tem conta?{' '}
                  <Link href="/register" className="text-indigo-600 font-black hover:text-indigo-700">
                    Cadastre-se na AVANT enf
                  </Link>
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

      </div>
      </div>
    </div>
  );
}
