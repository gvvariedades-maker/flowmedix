'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
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

/**
 * Iniciais: 1ª letra do nome + 1ª letra do sobrenome.
 * Nome único: duas primeiras letras. Sem nome: fallback pelo e-mail.
 */
function initialsFromDisplayName(displayName: string | null, email: string | null): string {
  const raw = displayName?.trim();
  if (raw) {
    const words = raw.split(/\s+/).filter((w) => w.length > 0);
    if (words.length >= 2) {
      const first = words[0]!;
      const last = words[words.length - 1]!;
      return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase() || initialsFromEmail(email);
    }
    if (words.length === 1) {
      const w = words[0]!;
      if (w.length >= 2) return `${w[0]!}${w[1]!}`.toUpperCase();
      return w[0]!.toUpperCase();
    }
  }
  return initialsFromEmail(email);
}

function titleCaseName(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/** Nome de exibição legível a partir do e-mail (parte local humanizada). */
function displayNameFromEmail(email: string | null): string {
  if (!email) return 'Aluno';
  const local = email.split('@')[0] ?? '';
  const cleaned = local.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return 'Aluno';
  return cleaned
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function displayNameFromUser(displayName: string | null, email: string | null): string {
  if (displayName?.trim()) return titleCaseName(displayName.trim());
  return displayNameFromEmail(email);
}

/** Avatar — verde remete ao tom de enfermagem / saúde (esmeralda). */
const USER_AVATAR_CLASSES =
  'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm ring-2 ring-emerald-200/90';

const MENU_ICON_STROKE = 2 as const;

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
    <div className="flex min-w-0 items-center gap-2.5">
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-[#BEF264] shadow-md shadow-indigo-500/35',
          compact ? 'h-7 w-7' : 'h-10 w-10'
        )}
      >
        <Zap size={compact ? 15 : 18} className="text-[#BEF264]" fill="currentColor" />
      </div>
      <span
        className={cn(
          'truncate font-extrabold tracking-tight text-slate-900',
          compact ? 'text-base' : 'text-[1.3rem] leading-tight'
        )}
      >
        AVANT
      </span>
    </div>
  );
}

function CityCard({ cidadeExibicao }: { cidadeExibicao: string }) {
  return (
    <div className="mb-1 px-3">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-[1px] shadow-lg shadow-slate-900/25">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-800/98 to-indigo-950/95 p-4 text-center">
          <div className="mb-3 flex justify-center">
            <div className="inline-flex max-w-full items-center justify-center gap-2 rounded-md bg-white/10 px-2.5 py-1.5 ring-1 ring-white/10 backdrop-blur-sm">
              <MapPin
                size={14}
                className="shrink-0 text-emerald-300"
                strokeWidth={MENU_ICON_STROKE}
                aria-hidden
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/95">
                Turma exclusiva
              </span>
            </div>
          </div>
          <h3 className="text-balance text-base font-bold leading-snug tracking-tight text-white sm:text-[1.05rem]">
            {cidadeExibicao}
          </h3>
          <div className="mt-3.5 flex justify-center">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold text-emerald-100/95 backdrop-blur-sm sm:text-[0.9375rem]">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.85)]"
                aria-hidden
              />
              Estudo Reverso
            </span>
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
    <nav className="custom-scrollbar mt-2 flex-1 space-y-2 overflow-y-auto px-2 pb-2">
      {menuItems.map((item) => (
        <Link
          key={item.label}
          href={createQueryString(item.href)}
          className={cn(
            'group relative flex w-full items-center gap-3 rounded-xl py-3 pl-4 pr-3 text-sm font-semibold transition-colors',
            item.active
              ? 'bg-indigo-500/[0.09] text-slate-900 before:absolute before:left-0 before:top-1/2 before:h-8 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-indigo-600'
              : 'text-slate-500 hover:bg-slate-100/90 hover:text-slate-900'
          )}
        >
          <item.icon
            size={20}
            strokeWidth={MENU_ICON_STROKE}
            className={cn(
              'shrink-0 transition-colors',
              item.active
                ? 'text-indigo-800'
                : 'text-slate-400 group-hover:text-slate-700'
            )}
            aria-hidden
          />
          {item.label}
        </Link>
      ))}
      {isAdminUser && (
        <div className="mt-4 pl-1 pt-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl py-2.5 pl-3 pr-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100/90 hover:text-slate-800"
          >
            <ShieldCheck size={18} strokeWidth={MENU_ICON_STROKE} className="shrink-0 text-slate-400" aria-hidden />
            Painel do Gestor
          </Link>
        </div>
      )}
    </nav>
  );
}

function UserAccountFooter({
  userEmail,
  userDisplayName,
  userInitials,
  onLogout,
}: {
  userEmail: string | null;
  userDisplayName: string | null;
  userInitials: string;
  onLogout: () => void;
}) {
  const name = displayNameFromUser(userDisplayName, userEmail);
  return (
    <div className="px-3 pb-5 pt-2">
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            USER_AVATAR_CLASSES,
          )}
          aria-hidden
        >
          {userInitials}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-sm font-bold leading-tight text-slate-900">{name}</p>
          <p className="mt-0.5 truncate text-xs font-normal text-slate-500">
            {userEmail ?? <span className="animate-pulse text-slate-400">carregando…</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          title="Sair da conta"
          aria-label="Sair da conta"
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-700"
        >
          <LogOut size={17} strokeWidth={MENU_ICON_STROKE} aria-hidden />
        </button>
      </div>
    </div>
  );
}

// Componente Wrapper para lidar com SearchParams (Evita erros de hidratação no Next.js)
function DashboardContent({
  children,
  initialUserEmail,
  initialDisplayName,
}: {
  children: React.ReactNode;
  initialUserEmail: string | null;
  initialDisplayName: string | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(initialDisplayName);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userInitials = useMemo(() => {
    const fromMeta = userDisplayName?.trim() ?? null;
    if (fromMeta) return initialsFromDisplayName(fromMeta, userEmail);
    if (userEmail) {
      const fromEmail = displayNameFromEmail(userEmail);
      if (fromEmail !== 'Aluno') {
        return initialsFromDisplayName(fromEmail, userEmail);
      }
    }
    return initialsFromEmail(userEmail);
  }, [userDisplayName, userEmail]);

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
      // `getServerSession()` em RSC e, se for `null`, usa `redirect('/login')`.
      // Se a sessão cair de verdade, o próximo request SSR manda pra login.
      // O logout explícito (botão "Sair") já faz o push manualmente.
      if (session?.user) {
        const email = session.user.email ?? null;
        setUserEmail(email);
        const meta = session.user.user_metadata as Record<string, unknown> | undefined;
        const fromMeta =
          typeof meta?.full_name === 'string' && meta.full_name.trim()
            ? meta.full_name.trim()
            : typeof meta?.name === 'string' && meta.name.trim()
              ? meta.name.trim()
              : null;
        setUserDisplayName(fromMeta);
        return;
      }
      if (event === 'SIGNED_OUT') {
        setUserEmail(null);
        setUserDisplayName(null);
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
      <aside className="relative z-20 hidden w-[18rem] flex-col bg-[#f8fafc] shadow-[4px_0_32px_-6px_rgba(15,23,42,0.09)] md:flex">
        <div className="px-5 pb-3 pt-10">
          <LogoMark />
        </div>

        <CityCard cidadeExibicao={cidadeExibicao} />

        <DashboardNav menuItems={menuItems} createQueryString={createQueryString} isAdminUser={isAdminUser} />

        <div className="mt-auto shrink-0 px-4 pb-1 pt-6">
          <TextSizeControl embedded />
        </div>

        <UserAccountFooter
          userEmail={userEmail}
          userDisplayName={userDisplayName}
          userInitials={userInitials}
          onLogout={handleLogout}
        />
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
              className="fixed left-0 top-0 z-50 flex h-full w-[18rem] flex-col overflow-hidden bg-[#f8fafc] shadow-[4px_0_32px_-6px_rgba(15,23,42,0.12)] outline-none md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={drawerSpring}
            >
              <div className="flex items-center justify-between px-5 pb-2 pt-8">
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

              <div className="mt-auto shrink-0 px-4 pb-1 pt-6">
                <TextSizeControl embedded />
              </div>

              <UserAccountFooter
                userEmail={userEmail}
                userDisplayName={userDisplayName}
                userInitials={userInitials}
                onLogout={handleLogout}
              />
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
            <TextSizeControl compact embedded className="origin-right scale-[0.92]" />
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold',
                USER_AVATAR_CLASSES,
              )}
              aria-hidden
            >
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
  initialDisplayName = null,
}: {
  children: React.ReactNode;
  initialUserEmail: string | null;
  initialDisplayName?: string | null;
}) {
  return (
    <Suspense fallback={<div className="dashboard-surface min-h-[100dvh] bg-background" />}>
      <DashboardContent initialUserEmail={initialUserEmail} initialDisplayName={initialDisplayName}>
        {children}
      </DashboardContent>
    </Suspense>
  );
}
