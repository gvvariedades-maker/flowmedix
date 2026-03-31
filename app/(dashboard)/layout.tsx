'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  LayoutDashboard, BookOpen, 
  Zap, MapPin, ShieldCheck, BarChart3, LogOut,
  Menu, X, CalendarDays, BookMarked
} from 'lucide-react';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Componente Wrapper para lidar com SearchParams (Evita erros de hidratação no Next.js)
function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState('...');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? null;
      setUserEmail(email);
      if (email) {
        const parts = email.split('@')[0].split(/[._-]/);
        const initials = parts
          .slice(0, 2)
          .map((p) => p[0]?.toUpperCase() ?? '')
          .join('');
        setUserInitials(initials || email[0].toUpperCase());
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Lógica de Captura da Cidade (Padrão: "Nível Médio" se não vier na URL)
  const cidadeParam = searchParams.get('cidade');
  const cidadeExibicao = cidadeParam ? decodeURIComponent(cidadeParam) : "Técnico de Enfermagem";
  
  // Persistir o parâmetro da cidade nos links de navegação
  const createQueryString = (path: string) => {
    return cidadeParam ? `${path}?cidade=${encodeURIComponent(cidadeParam)}` : path;
  };

  // Fechar menu ao navegar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isPathActive = (path: string, exact = false) => {
    if (!pathname) return false;
    if (exact) return pathname === path;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    { label: 'Vitrine de Aulas', icon: LayoutDashboard, href: '/estudar', active: isPathActive('/estudar') },
    { label: 'Meu Desempenho', icon: BarChart3, href: '/analytics', active: pathname === '/analytics' },
    { label: 'Plano de Estudo Diário', icon: CalendarDays, href: '/plano-diario', active: pathname === '/plano-diario' },
    { label: 'Cadernos de Estudo', icon: BookMarked, href: '/cadernos', active: isPathActive('/cadernos') },
    { label: 'Material de Apoio', icon: BookOpen, href: '/material', active: isPathActive('/material') },
  ];

  return (
    <div className="flex min-h-0 h-[100dvh] max-h-[100dvh] bg-slate-50 font-sans">
      
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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 flex-1 p-2 rounded-xl min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs shrink-0">
                {userInitials}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-700 truncate">
                  {userEmail ?? <span className="animate-pulse text-slate-300">carregando...</span>}
                </p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Conta Ativa</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sair da conta"
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

      </aside>

      {/* --- DRAWER MOBILE --- */}
      {/* Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Painel do Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        {/* Cabeçalho do Drawer */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Zap size={22} className="text-[#BEF264]" fill="currentColor" />
            </div>
            <span className="text-2xl font-[1000] italic tracking-tighter text-slate-900">AVANT</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Card da Cidade */}
        <div className="px-4 mb-2">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl p-5 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#BEF264]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
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

        {/* Itens de Navegação */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={createQueryString(item.href)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all group
                ${item.active
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            >
              <item.icon size={20} className={item.active ? 'text-indigo-600' : 'group-hover:text-indigo-500'} />
              {item.label}
            </Link>
          ))}

          <div className="pt-4 mt-2 border-t border-slate-100">
            <Link href="/admin" className="flex items-center gap-4 px-4 py-3 text-xs font-bold text-slate-300 hover:text-slate-500 transition-colors">
              <ShieldCheck size={16} /> Painel do Gestor
            </Link>
          </div>
        </nav>

        {/* Rodapé User */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 flex-1 p-2 rounded-xl min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs shrink-0">
                {userInitials}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-700 truncate">
                  {userEmail ?? <span className="animate-pulse text-slate-300">carregando...</span>}
                </p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Conta Ativa</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sair da conta"
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* --- ÁREA PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
        {/* Header Mobile */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 pt-safe flex items-center justify-between sticky top-0 z-30 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-[#BEF264]" fill="currentColor" />
            </div>
            <span className="text-base font-[1000] italic tracking-tighter text-slate-900">AVANT</span>
          </div>

          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
            {userInitials}
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar relative flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}

// Exportação Principal com Suspense (Obrigatório para useSearchParams)
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-slate-50" />}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}