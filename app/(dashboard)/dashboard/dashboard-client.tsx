"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, ArrowRight, ShieldCheck, Zap, 
  GraduationCap, Sparkles, Bookmark, 
  LogOut, User, Lock, ChevronDown 
} from 'lucide-react';

export default function DashboardClient({ initialModules = [], user }: any) {
  const [activeTab, setActiveTab] = useState<'study' | 'exams'>('study');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  // 🛡️ VERIFICAÇÃO DE ADMIN CONFIGURADA PARA VOCÊ
  const isAdmin = user?.email?.toLowerCase() === 'gvvariedades@gmail.com'.toLowerCase();

  const moduleIds = Array.from(new Set(initialModules.map((m: any) => m.modulo_id)));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-slate-900 selection:text-white pb-20 font-sans">
      {/* Efeito de Glow no Fundo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/40 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-50 max-w-7xl mx-auto px-4">
        
        {/* TOP BAR - MENU DE CONTA */}
        <div className="flex justify-end pt-6 mb-4">
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 px-5 py-2.5 bg-white border-[1.5px] border-slate-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200"
            >
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-[1000] italic uppercase tracking-tight">Minha Conta</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-64 bg-white border-[2px] border-slate-900 rounded-[28px] shadow-2xl p-2 z-[60] overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-slate-100 mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Acesso Autorizado</p>
                    <p className="text-xs font-black truncate text-slate-900">{user?.email}</p>
                  </div>

                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors group">
                    <User className="w-4 h-4 text-slate-400 group-hover:text-slate-900" />
                    <span className="text-xs font-black uppercase italic">Meu Perfil</span>
                  </button>

                  {/* BOTÃO ADMIN EXCLUSIVO PARA GVVARIEDADES */}
                  {isAdmin && (
                    <Link href="/admin" className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50/50 hover:bg-blue-100 rounded-xl transition-colors group">
                      <Lock className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-black uppercase italic text-blue-700">Painel Admin</span>
                    </Link>
                  )}

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-colors group mt-1"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-black uppercase italic text-red-600">Encerrar Sessão</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* HEADER PRINCIPAL */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-slate-900 rounded-[22px] shadow-2xl rotate-3">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-[1000] italic tracking-tighter text-slate-900 uppercase leading-none">
                APROVA<span className="text-blue-600">TEC</span>
              </h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-blue-500" /> Sistema de Performance
              </p>
            </div>
          </div>

          <nav className="flex p-1.5 bg-slate-200/50 backdrop-blur-md rounded-[24px] border border-white shadow-inner">
            <button
              onClick={() => setActiveTab('study')}
              className={`flex items-center gap-2 px-10 py-3 rounded-[18px] text-sm font-black italic uppercase transition-all duration-500 ${
                activeTab === 'study' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Zap className="w-4 h-4" /> Estudo
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`flex items-center gap-2 px-10 py-3 rounded-[18px] text-sm font-black italic uppercase transition-all duration-500 ${
                activeTab === 'exams' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Simulados
            </button>
          </nav>
        </header>

        {/* ÁREA DE CONTEÚDO */}
        <AnimatePresence mode="wait">
          {activeTab === 'study' ? (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {moduleIds.map((modId, index) => {
                const items = initialModules.filter((f: any) => f.modulo_id === modId);
                const modNumber = (index + 1).toString().padStart(2, '0');
                return (
                  <motion.div key={modId} whileHover={{ y: -8 }} className="group relative">
                    <div className="absolute inset-0 bg-slate-900 rounded-[45px] translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300" />
                    <div className="relative h-full bg-white border-[1.5px] border-slate-900 p-10 rounded-[45px] transition-transform duration-300 flex flex-col">
                      <div className="flex justify-between items-start mb-10">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-blue-600 transition-colors duration-500">
                            <BookOpen className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-0.5">ESTRUTURA</p>
                            <h3 className="text-3xl font-[1000] italic uppercase text-slate-900 leading-none">MÓDULO <span className="text-blue-600">{modNumber}</span></h3>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4 flex-1">
                        {items.map((item: any) => (
                          <Link key={item.id} href={`/dashboard/fluxograma/${item.id}`} className="group/item flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-900 hover:bg-white transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-2 h-2 rounded-full bg-slate-300 group-hover/item:bg-blue-600 group-hover/item:scale-150 transition-all duration-300" />
                              <span className="text-xs font-black uppercase italic tracking-tight text-slate-600 group-hover/item:text-slate-900">{item.title}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover/item:text-slate-900 group-hover/item:translate-x-1 transition-all" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center bg-white border-[2px] border-slate-900 rounded-[50px] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
              <p className="text-slate-900 font-[1000] italic uppercase tracking-widest text-xl">Simulados Disponíveis em Breve</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}