'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowRight, Lock, MapPin, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Componente Interno para lidar com parâmetros de URL
function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  // Captura a cidade da URL (ex: ?cidade=Caicó - RN)
  const cidade = searchParams.get('cidade') 
    ? decodeURIComponent(searchParams.get('cidade')!) 
    : null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulação de Login (Aqui entraria o Supabase Auth)
    setTimeout(() => {
      // Redireciona mantendo a cidade na URL para o Dashboard pegar
      const destino = cidade 
        ? `/estudar?cidade=${encodeURIComponent(cidade)}`
        : '/estudar';
      router.push(destino);
    }, 1500);
  };

  return (
    <div className="w-full max-w-md">
      
      {/* --- HEADER DO LOGIN --- */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap size={24} className="text-[#BEF264]" fill="currentColor" />
          </div>
          <span className="text-3xl font-[1000] italic tracking-tighter text-slate-900">AVANT</span>
        </div>

        {/* MENSAGEM DINÂMICA (O Pulo do Gato) */}
        {cidade ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl mb-2"
          >
            <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1 flex justify-center items-center gap-1">
              <MapPin size={12} /> Turma Confirmada
            </p>
            <h1 className="text-xl font-black text-indigo-900 uppercase leading-tight">
              {cidade}
            </h1>
          </motion.div>
        ) : (
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Acesse sua Área
          </h1>
        )}

        <p className="text-slate-500 font-medium text-sm">
          Prepare-se com a metodologia de Estudo Reverso.
        </p>
      </div>

      {/* --- FORMULÁRIO --- */}
      <form onSubmit={handleLogin} className="space-y-5 bg-white p-8 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
        
        {/* Input E-mail */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">E-mail de Acesso</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 placeholder:font-normal"
          />
        </div>

        {/* Input Senha */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Senha</label>
          <input 
            type="password" 
            required
            placeholder="••••••••"
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
          />
          <div className="flex justify-end">
            <Link href="#" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 uppercase tracking-wide">
              Esqueci a senha
            </Link>
          </div>
        </div>

        {/* Botão de Ação */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <span className="animate-pulse">Entrando...</span>
          ) : (
            <>
              Acessar Plataforma <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* Rodapé Seguro */}
        <div className="pt-4 mt-2 border-t border-slate-50 flex justify-center items-center gap-2 text-slate-300">
          <Lock size={12} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Ambiente Seguro</span>
        </div>
      </form>

      {/* --- PROVA SOCIAL (Rodapé) --- */}
      <div className="mt-8 flex justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
         {/* Exemplo de logos de bancos ou selos */}
         <div className="flex items-center gap-2 text-slate-400">
           <CheckCircle2 size={16} /> <span className="text-xs font-bold">Metodologia Validada</span>
         </div>
         <div className="flex items-center gap-2 text-slate-400">
           <CheckCircle2 size={16} /> <span className="text-xs font-bold">Foco no Edital</span>
         </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#BEF264]/10 rounded-full blur-[100px]" />

      <Suspense fallback={<div className="text-indigo-600 font-bold animate-pulse">Carregando Acesso...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}