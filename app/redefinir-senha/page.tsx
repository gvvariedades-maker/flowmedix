'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { AvantLogo } from '@/components/brand/AvantLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { PublicLightAuthHeader } from '@/components/layout/PublicLightAuthHeader';

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);
  const [sessaoValida, setSessaoValida] = useState<boolean | null>(null);

  // Supabase envia o token no hash da URL; o cliente SSR troca automaticamente por sessão
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessaoValida(true);
      }
    });

    // Verifica se já há sessão ativa (token já processado)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessaoValida(true);
      else setSessaoValida(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRedefinir = async (e: React.FormEvent) => {
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

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message || 'Erro ao redefinir senha. Tente novamente.');
        setLoading(false);
        return;
      }

      setConcluido(true);
      setTimeout(() => {
        router.push('/estudar');
        router.refresh();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Erro inesperado. Tente novamente.');
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
          <div className="inline-flex items-center gap-2 mb-2 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full">
            <Lock size={14} className="text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Nova Senha</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
            Redefinir Senha
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Escolha uma nova senha segura para sua conta.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {concluido ? (
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
                <h2 className="text-xl font-black text-slate-900 mb-2">Senha Atualizada!</h2>
                <p className="text-slate-500 text-sm font-medium">
                  Sua senha foi redefinida com sucesso. Redirecionando...
                </p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5, ease: 'linear' }}
                />
              </div>
            </motion.div>
          ) : sessaoValida === false ? (
            /* Link inválido ou expirado */
            <motion.div
              key="invalido"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 text-center space-y-5"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle size={36} className="text-red-500" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Link Inválido</h2>
                <p className="text-slate-500 text-sm font-medium">
                  Este link de recuperação é inválido ou expirou. Solicite um novo.
                </p>
              </div>
              <Link
                href="/esqueci-senha"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all"
              >
                Solicitar Novo Link <ArrowRight size={16} />
              </Link>
            </motion.div>
          ) : (
            /* Formulário de nova senha */
            <motion.form
              key="formulario"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleRedefinir}
              className="space-y-5 bg-white p-8 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100"
            >
              {/* Nova senha */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
                  Nova Senha
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

              {/* Confirmar nova senha */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="repita a nova senha"
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

              {/* Indicador de força da senha */}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-1.5"
                >
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((n) => {
                      const forca =
                        password.length >= 12 ? 4
                        : password.length >= 8 ? 3
                        : password.length >= 6 ? 2
                        : 1;
                      return (
                        <div
                          key={n}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            n <= forca
                              ? forca <= 1 ? 'bg-red-400'
                                : forca === 2 ? 'bg-amber-400'
                                : forca === 3 ? 'bg-blue-400'
                                : 'bg-green-400'
                              : 'bg-slate-100'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 pl-1">
                    {password.length < 6 ? 'Muito curta'
                      : password.length < 8 ? 'Fraca'
                      : password.length < 12 ? 'Boa'
                      : 'Forte'}
                  </p>
                </motion.div>
              )}

              {/* Erro */}
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
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="animate-pulse">Salvando...</span>
                ) : (
                  <>
                    Salvar Nova Senha <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Rodapé Seguro */}
              <div className="pt-4 mt-2 border-t border-slate-50 flex justify-center items-center gap-2 text-slate-300">
                <Lock size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Ambiente Seguro</span>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

      </div>
      </div>
    </div>
  );
}
