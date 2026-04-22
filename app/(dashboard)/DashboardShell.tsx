'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Zap,
  MapPin,
  ShieldCheck,
  BarChart3,
  LogOut,
  Menu,
  X,
  CalendarDays,
  BookMarked,
  type LucideIcon,
} from 'lucide-react';
import { getAdminEmail } from '@/lib/constants';
import { TextSizeControl } from '@/components/accessibility/TextSizeControl';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';

const drawerSpring = { type: 'spring' as const, stiffness: 300, damping: 30 };

function initialsFromEmail(email: string | null): string {
  if (!email) return '...';
  const parts = email.split('@')[0].split(/[._-]/);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
  return initials || email[0].toUpperCase();
}

/** Seletor de elementos focáveis para armadilha de foco no drawer (a11y). */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableIn(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
    if (el.getAttribute('tabindex') === '-1') return false;
    if (el.hasAttribute('disabled')) return false;
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') return false;
    return typeof el.tabIndex === 'number' && el.tabIndex >= 0;
  });
}

type MenuItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  active: boolean;
};

function LogoMark({ compact }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg bg-foreground text-background',
          compact ? 'h-7 w-7' : 'h-9 w-9'
        )}
      >
        <Zap size={compact ? 14 : 18} fill="currentColor" />
      </div>
      <span className={cn('truncate font-bold tracking-tight text-foreground', compact ? 'text-base' : 'text-xl')}>
        AVANT
      </span>
    </div>
  );
}

function CityCard({ cidadeExibicao }: { cidadeExibicao: string }) {
  return (
    <div className="mb-2 px-4">
      <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/40 text-card-foreground shadow-sm">
        <div className="flex items-center gap-2 bg-black px-4 py-2.5">
          <MapPin size={14} className="shrink-0 text-emerald-400" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide text-white">Turma exclusiva</span>
        </div>
        <div className="p-4 pt-3">
          <h3 className="text-base font-semibold leading-snug text-foreground">{cidadeExibicao}</h3>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden />
            <span className="text-xs font-medium text-muted-foreground">Edital ativo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardNav({
  menuItems,
  createQueryString,
  isAdminUser,
}: {
  menuItems: MenuItem[];
  createQueryString: (path: string) => string;
  isAdminUser: boolean;
}) {
  return (
    <nav className="custom-scrollbar mt-4 flex-1 space-y-1 overflow-y-auto px-4">
      {menuItems.map((item) => (
        <Link
          key={item.label}
          href={createQueryString(item.href)}
          className={cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            item.active
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
          )}
        >
          <item.icon
            size={20}
            className={cn(
              'shrink-0 transition-colors',
              item.active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
            )}
          />
          {item.label}
        </Link>
      ))}
      {isAdminUser && (
        <div className="mt-3 border-t border-border pt-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <ShieldCheck size={16} /> Painel do Gestor
          </Link>
        </div>
      )}
    </nav>
  );
}

function UserAccountFooter({
  userEmail,
  userInitials,
  onLogout,
}: {
  userEmail: string | null;
  userInitials: string;
  onLogout: () => void;
}) {
  return (
    <div className="border-t border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-xs font-medium text-foreground">
              {userEmail ?? <span className="animate-pulse text-muted-foreground">carregando...</span>}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">Conta ativa</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          title="Sair da conta"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

// Componente Wrapper para lidar com SearchParams (Evita erros de hidratação no Next.js)
function DashboardContent({
  children,
  initialUserEmail,
}: {
  children: React.ReactNode;
  initialUserEmail: string | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail);
  const [userInitials, setUserInitials] = useState(() => initialsFromEmail(initialUserEmail));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openMenuButtonRef = useRef<HTMLButtonElement>(null);
  const closeDrawerButtonRef = useRef<HTMLButtonElement>(null);
  const drawerPanelRef = useRef<HTMLDivElement>(null);
  /** Evita devolver foco ao botão "Abrir" na montagem inicial (menu já fechado). */
  const drawerWasOpenRef = useRef(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // NUNCA redirecionar automaticamente aqui.
      //
      // O Supabase dispara `SIGNED_OUT` em várias situações transitórias
      // (refresh falhou num request, re-hidratação do storage, troca de aba),
      // e o redirect em cima disso produzia o clássico "saiu de novo".
      //
      // A expulsão correta ocorre no servidor: cada página protegida chama
      // `getSession()` em RSC e, se for `null`, usa `redirect('/login')`.
      // Se a sessão cair de verdade, o próximo request SSR manda pra login.
      // O logout explícito (botão "Sair") já faz o push manualmente.
      if (session?.user) {
        const email = session.user.email ?? null;
        setUserEmail(email);
        setUserInitials(initialsFromEmail(email));
        return;
      }
      if (event === 'SIGNED_OUT') {
        setUserEmail(null);
        setUserInitials('...');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  /** Derivado da URL no render (evita effect + setState em cima de searchParams). */
  const rawCidade = searchParams.get('cidade');
  const cidadeParamForLink = rawCidade;
  const cidadeExibicao = rawCidade ? decodeURIComponent(rawCidade) : 'Técnico de Enfermagem';

  const createQueryString = (path: string) =>
    cidadeParamForLink != null ? `${path}?cidade=${encodeURIComponent(cidadeParamForLink)}` : path;

  // Fechar menu ao navegar (requestAnimationFrame evita setState síncrono no effect — react-hooks/set-state-in-effect)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMobileMenuOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Escape fecha o drawer
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  // Ao abrir: foco no botão fechar | Ao fechar: devolver foco ao botão "Abrir menu"
  useEffect(() => {
    if (mobileMenuOpen) {
      drawerWasOpenRef.current = true;
      const id = requestAnimationFrame(() => {
        closeDrawerButtonRef.current?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
    if (drawerWasOpenRef.current) {
      drawerWasOpenRef.current = false;
      requestAnimationFrame(() => {
        openMenuButtonRef.current?.focus();
      });
    }
  }, [mobileMenuOpen]);

  // Armadilha de foco (Tab / Shift+Tab): captura no documento para cobrir foco fora do painel
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const panel = drawerPanelRef.current;
    if (!panel) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusableIn(panel);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !panel.contains(active)) {
        e.preventDefault();
        first.focus();
        return;
      }
      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [mobileMenuOpen]);

  const isPathActive = (path: string, exact = false) => {
    if (!pathname) return false;
    if (exact) return pathname === path;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const isAdminUser = userEmail != null && userEmail.toLowerCase() === getAdminEmail();

  const menuItems: MenuItem[] = [
    { label: 'Vitrine de Aulas', icon: LayoutDashboard, href: '/estudar', active: isPathActive('/estudar') },
    { label: 'Meu Desempenho', icon: BarChart3, href: '/analytics', active: pathname === '/analytics' },
    { label: 'Plano de Estudo Diário', icon: CalendarDays, href: '/plano-diario', active: pathname === '/plano-diario' },
    { label: 'Cadernos de Estudo', icon: BookMarked, href: '/cadernos', active: isPathActive('/cadernos') },
    { label: 'Material de Apoio', icon: BookOpen, href: '/material', active: isPathActive('/material') },
  ];

  return (
    <div className="dashboard-surface flex h-[100dvh] max-h-[100dvh] min-h-0 bg-background font-sans text-foreground">
      {/* --- SIDEBAR FIXA --- */}
      <aside className="relative z-20 hidden w-72 flex-col border-r border-border bg-card md:flex">
        <div className="p-6 pb-4 pt-8">
          <LogoMark />
        </div>

        <CityCard cidadeExibicao={cidadeExibicao} />

        <DashboardNav menuItems={menuItems} createQueryString={createQueryString} isAdminUser={isAdminUser} />

        <div className="shrink-0 px-4 pb-1 pt-3">
          <TextSizeControl />
        </div>

        <UserAccountFooter userEmail={userEmail} userInitials={userInitials} onLogout={handleLogout} />
      </aside>

      {/* --- DRAWER MOBILE (framer-motion) --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="dashboard-drawer-overlay"
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="dashboard-drawer-panel"
              ref={drawerPanelRef}
              id="dashboard-mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegação"
              className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-border bg-card shadow-xl outline-none md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={drawerSpring}
            >
              <div className="flex items-center justify-between p-6 pb-4">
                <LogoMark />
                <button
                  ref={closeDrawerButtonRef}
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Fechar menu"
                >
                  <X size={18} />
                </button>
              </div>

              <CityCard cidadeExibicao={cidadeExibicao} />

              <DashboardNav menuItems={menuItems} createQueryString={createQueryString} isAdminUser={isAdminUser} />

              <div className="shrink-0 px-4 pb-1 pt-3">
                <TextSizeControl />
              </div>

              <UserAccountFooter userEmail={userEmail} userInitials={userInitials} onLogout={handleLogout} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- ÁREA PRINCIPAL --- */}
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border bg-background/85 px-4 py-3 pt-safe backdrop-blur-md md:hidden">
          <button
            ref={openMenuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Abrir menu"
            aria-expanded={mobileMenuOpen}
            aria-controls={mobileMenuOpen ? 'dashboard-mobile-drawer' : undefined}
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <LogoMark compact />
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <TextSizeControl compact className="origin-right scale-[0.92]" />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
              {userInitials}
            </div>
          </div>
        </header>

        <main className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardShell({
  children,
  initialUserEmail,
}: {
  children: React.ReactNode;
  initialUserEmail: string | null;
}) {
  return (
    <Suspense fallback={<div className="dashboard-surface min-h-[100dvh] bg-background" />}>
      <DashboardContent initialUserEmail={initialUserEmail}>{children}</DashboardContent>
    </Suspense>
  );
}
