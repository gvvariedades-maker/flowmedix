'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, BookOpen, Target, 
  Settings, Zap, MapPin, ShieldCheck, Crown 
} from 'lucide-react';

// Componente Wrapper para lidar com SearchParams (Evita erros de hidratação no Next.js)
function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lógica de Captura da Cidade (Padrão: "Nível Médio" se não vier na URL)
  const cidadeParam = searchParams.get('cidade');
  const cidadeExibicao = cidadeParam ? decodeURIComponent(cidadeParam) : "Concursos Nível Médio";
  
  // Persistir o parâmetro da cidade nos links de navegação
  const createQueryString = (path: string) => {
    return cidadeParam ? `${path}?cidade=${encodeURIComponent(cidadeParam)}` : path;
  };

  const menuItems = [
    { label: 'Vitrine de Aulas', icon: LayoutDashboard, href: '/estudar', active: pathname === '/estudar' },
    { label: 'Meus Desempenho', icon: Target, href: '#', active: false },
    { label: 'Material de Apoio', icon: BookOpen, href: '#', active: false },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* --- SIDEBAR FIXA --- */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col relative z-20">
        
        {/* Logo AVANT */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Zap size={22} className="text-[#BEF264]" fill="currentColor" />
            </div>
            <span className="text-2xl font-[1000] italic tracking-tighter text-slate-900">AVANT</span>
          </div>
        </div>

        {/* --- O GRANDE DESTAQUE: CARD DA CIDADE --- */}
        {/* Esse card usa um gradiente forte para mostrar ao aluno onde ele está */}
        <div className="px-4 mb-2">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl p-5 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden group">
            {/* Efeitos de Fundo */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#BEF264]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#BEF264]/30 transition-all" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <MapPin size={14} className="text-[#BEF264]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Turma Exclusiva</span>
              </div>
              <h3 className="text-xl font-[1000] italic uppercase leading-tight tracking-tight text-white">
                {cidadeExibicao}
              </h3>
              <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-md border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-[#BEF264] animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Edital Ativo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <Link 
              key={item.label} 
              href={createQueryString(item.href)} // Mantém a cidade na URL ao navegar
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all group
                ${item.active 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            >
              <item.icon size={20} className={item.active ? 'text-indigo-600' : 'group-hover:text-indigo-500'} />
              {item.label}
            </Link>
          ))}
           
           {/* Link Admin (Discreto) */}
           <div className="pt-4 mt-2 border-t border-slate-100">
             <Link href="/admin" className="flex items-center gap-4 px-4 py-3 text-xs font-bold text-slate-300 hover:text-slate-500 transition-colors">
               <ShieldCheck size={16} /> Painel do Gestor
             </Link>
           </div>
        </nav>

        {/* Rodapé User */}
        <div className="p-4 bg-white border-t border-slate-100">
          <button className="flex items-center gap-3 w-full p-2 hover:bg-slate-50 rounded-xl transition-colors text-left">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
              AL
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-700 truncate">Aluno AVANT</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Plano Premium</p>
            </div>
          </button>
        </div>

      </aside>

      {/* --- ÁREA PRINCIPAL --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header Mobile com Cidade */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
               <Zap size={16} className="text-[#BEF264]" fill="currentColor" />
             </div>
             <div>
               <p className="text-[9px] font-black text-slate-400 uppercase">Foco:</p>
               <p className="text-xs font-black text-slate-800 uppercase leading-none">{cidadeExibicao}</p>
             </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar relative">
          {children}
        </main>
      </div>
    </div>
  );
}

// Exportação Principal com Suspense (Obrigatório para useSearchParams)
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="h-screen bg-slate-50" />}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}