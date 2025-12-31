'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert("Erro no login: " + error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-transparent relative">
      {/* Glow de Fundo */}
      <div className="bg-glow-main w-[500px] h-[500px] opacity-20" />
      
      <div className="glass-panel w-full max-w-md p-8 relative z-10 border-t-4 border-t-clinical-accent">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-neon-gradient">FLOWMEDIX</h1>
          <p className="text-slate-400 text-sm mt-2 uppercase tracking-widest">Acesso ao Sistema</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-clinical-accent mb-2 uppercase">Identificação (Email)</label>
            <input 
              type="email" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-clinical-accent outline-none transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-clinical-accent mb-2 uppercase">Código de Acesso</label>
            <input 
              type="password" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-clinical-accent outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-clinical-accent text-black font-black p-4 rounded-xl hover:shadow-neon-cyan transition-all disabled:opacity-50"
          >
            {loading ? 'AUTENTICANDO...' : 'INICIAR MISSÃO'}
          </button>
        </form>
      </div>
    </div>
  );
}