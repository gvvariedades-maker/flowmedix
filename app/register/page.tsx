'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 6) {
      alert('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert('Erro ao criar conta: ' + error.message);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-transparent relative">
      <div className="bg-glow-main w-[520px] h-[520px] opacity-20" />
      <div className="glass-panel w-full max-w-md p-8 relative z-10 border-t-4 border-t-clinical-accent">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-black text-neon-gradient">CRIAR CONTA MÉDICA</h1>
          <p className="text-slate-400 text-sm uppercase tracking-widest">
            Experimente o centro de comando do FlowMedix
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-clinical-accent mb-2 uppercase">
              Identificação institucional (Email)
            </label>
            <input
              type="email"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-clinical-accent outline-none transition-all"
              placeholder="nome@instituicao.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-bold text-clinical-accent mb-2 uppercase">
              Código de acesso (Senha)
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pr-12 focus:border-clinical-accent outline-none transition-all"
              placeholder="mínimo 6 caracteres"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-white/70 transition-colors hover:text-clinical-accent"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-clinical-accent text-black font-black p-4 rounded-xl hover:shadow-neon-cyan transition-all disabled:opacity-50"
          >
            {loading ? 'ENVIANDO...' : 'CRIAR MINHA CONTA'}
          </button>
          <p className="text-center text-sm text-slate-400">
            Já possui acesso?{' '}
            <a href="/login" className="text-clinical-accent underline-offset-4 hover:underline">
              Entrar agora
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}









