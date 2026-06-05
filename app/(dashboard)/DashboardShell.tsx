'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Zap,
  ShieldCheck,
  BarChart3,
  LogOut,
  Search,
  CalendarDays,
  BookMarked,
  ClipboardList,
  HelpCircle,
  BrainCircuit,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';
import { EstudoReversoWelcomeModal } from '@/components/onboarding/EstudoReversoWelcomeModal';
import { PwaInstallProvider } from '@/components/pwa/PwaInstallProvider';
import { PwaInstallNavButton } from '@/components/pwa/PwaInstallNavButton';
import { useEstudoReversoWelcome } from '@/components/onboarding/useEstudoReversoWelcome';
import { cn } from '@/lib/utils';
import type { ProSource } from '@/lib/freemium/constants';
import { supabase } from '@/lib/supabase/client';
import { ToastProvider } from '@/lib/toast-context';
import { ToastContainer } from '@/components/ui/toast-container';
import {
  BackToVitrineBar,
  shouldShowBackToVitrine,
} from '@/components/dashboard/BackToVitrineLink';
import { useEstudarModalActive } from '@/components/estudar/useEstudarModalActive';
import { parseEstudarSlugFromPathname } from '@/lib/estudar/navigation';
import { BottomNav } from '@/components/layout/BottomNav';
import { MobileDashboardDrawer } from '@/components/layout/MobileDashboardDrawer';
import { MOBILE_MAIN_SCROLL_PADDING } from '@/lib/layout/mobileBottomNav';
import { PlanStatusCard } from '@/components/plan/PlanStatusCard';
import { getFocusableIn } from '@/lib/a11y/focusable';
import { useBodyScrollLock } from '@/lib/layout/useBodyScrollLock';
import { useDashboardDesktop } from '@/lib/layout/useDashboardDesktop';

const pageVariantsDesktop = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.18, ease: 'easeOut' as const },
  },
};

/** Sem fade no mobile — menos flash entre rotas do dashboard. */
const pageVariantsMobile = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
};

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

type MenuItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  active: boolean;
};

type MatriculatedConcursoSummary = {
  slug: string;
  nome: string;
  tipo: 'geral' | 'edital';
};

function getAssinaturaNavLabel(isAdminUser: boolean, proSource: ProSource): string | null {
  if (isAdminUser) return null;
  if (proSource === 'stripe') return 'Gerenciar assinatura';
  if (proSource === 'invite') return 'Ver assinatura';
  return 'Minha assinatura';
}

function DashboardNav({
  menuItems,
  createQueryString,
  isAdminUser,
  onNavAction,
}: {
  menuItems: MenuItem[];
  createQueryString: (path: string) => string;
  isAdminUser: boolean;
  onNavAction?: () => void;
}) {
  return (
    <nav
      className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-2 pb-2"
      aria-label="Navegação principal"
    >
      {menuItems.map((item) => (
        <Link
          key={item.label}
          href={createQueryString(item.href)}
          onClick={onNavAction}
          className={cn(
            'group relative flex w-full items-center gap-3 rounded-xl py-2.5 pl-4 pr-3 text-sm transition-colors',
            item.active
              ? 'bg-[rgba(139,92,246,0.12)] font-medium text-white before:absolute before:left-0 before:top-1/2 before:h-8 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-[#8b5cf6]'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
          )}
        >
          <item.icon
            size={20}
            strokeWidth={MENU_ICON_STROKE}
            className={cn(
              'shrink-0 transition-colors',
              item.active
                ? 'text-white'
                : 'text-slate-500 group-hover:text-slate-300'
            )}
            aria-hidden
          />
          {item.label}
        </Link>
      ))}
      <PwaInstallNavButton onNavigate={onNavAction} />
      {isAdminUser && (
        <div className="mt-4 pl-1 pt-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl py-2.5 pl-3 pr-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
          >
            <ShieldCheck size={18} strokeWidth={MENU_ICON_STROKE} className="shrink-0 text-slate-600" aria-hidden />
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
  proSource,
  isAdminUser,
  createQueryString,
  isAssinaturaActive,
  onNavAction,
  onLogout,
}: {
  userEmail: string | null;
  userDisplayName: string | null;
  userInitials: string;
  proSource: ProSource;
  isAdminUser: boolean;
  createQueryString: (path: string) => string;
  isAssinaturaActive: boolean;
  onNavAction?: () => void;
  onLogout: () => void;
}) {
  const name = displayNameFromUser(userDisplayName, userEmail);
  const assinaturaLabel = getAssinaturaNavLabel(isAdminUser, proSource);

  return (
    <div className="px-1 pb-safe pt-2">
      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
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
          <p className="truncate text-sm font-bold leading-tight text-slate-100">{name}</p>
          <p
            className="mt-0.5 truncate text-xs font-normal text-slate-400"
            title={userEmail ?? undefined}
          >
            {userEmail ?? <span className="animate-pulse text-slate-500">carregando…</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          title="Sair da conta"
          aria-label="Sair da conta"
          className="mt-0.5 flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-300"
        >
          <LogOut size={17} strokeWidth={MENU_ICON_STROKE} aria-hidden />
        </button>
      </div>
      {assinaturaLabel ? (
        <Link
          href={createQueryString('/conta/assinatura')}
          onClick={onNavAction}
          className={cn(
            'mt-3 flex w-full items-center gap-2.5 rounded-xl py-2.5 pl-3 pr-3 text-sm font-semibold transition-colors',
            isAssinaturaActive
              ? 'bg-white/8 text-slate-100'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
          )}
        >
          <CreditCard
            size={18}
            strokeWidth={MENU_ICON_STROKE}
            className={cn(
              'shrink-0',
              isAssinaturaActive ? 'text-slate-300' : 'text-slate-500',
            )}
            aria-hidden
          />
          {assinaturaLabel}
        </Link>
      ) : null}
      </div>
    </div>
  );
}

function DashboardSidebarPanels({
  identityClassName = 'shrink-0',
  cidadeExibicao,
  isPro,
  proSource,
  proExpiresAt,
  menuItems,
  createQueryString,
  isAdminUser,
  onNavAction,
  userEmail,
  userDisplayName,
  userInitials,
  isAssinaturaActive,
  onLogout,
}: {
  identityClassName?: string;
  cidadeExibicao: string;
  isPro: boolean;
  proSource: ProSource;
  proExpiresAt: string | null;
  menuItems: MenuItem[];
  createQueryString: (path: string) => string;
  isAdminUser: boolean;
  onNavAction?: () => void;
  userEmail: string | null;
  userDisplayName: string | null;
  userInitials: string;
  isAssinaturaActive: boolean;
  onLogout: () => void;
}) {
  return (
    <>
      <div className={identityClassName}>
        <PlanStatusCard
          cidadeExibicao={cidadeExibicao}
          isPro={isPro}
          proSource={proSource}
          proExpiresAt={proExpiresAt}
        />
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        <DashboardNav
          menuItems={menuItems}
          createQueryString={createQueryString}
          isAdminUser={isAdminUser}
          onNavAction={onNavAction}
        />
      </div>

      <div className="mt-auto shrink-0 pt-4">
        <UserAccountFooter
          userEmail={userEmail}
          userDisplayName={userDisplayName}
          userInitials={userInitials}
          proSource={proSource}
          isAdminUser={isAdminUser}
          createQueryString={createQueryString}
          isAssinaturaActive={isAssinaturaActive}
          onNavAction={onNavAction}
          onLogout={onLogout}
        />
      </div>
    </>
  );
}

// Componente Wrapper para lidar com SearchParams (Evita erros de hidratação no Next.js)
function DashboardContent({
  children,
  initialUserEmail,
  initialDisplayName,
  initialIsAdmin,
  initialMatriculatedConcursos,
  isPro,
  proSource,
  proExpiresAt,
}: {
  children: React.ReactNode;
  initialUserEmail: string | null;
  initialDisplayName: string | null;
  initialIsAdmin: boolean;
  initialMatriculatedConcursos: MatriculatedConcursoSummary[];
  isPro: boolean;
  proSource: ProSource;
  proExpiresAt: string | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(initialDisplayName);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(initialIsAdmin);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const modalQuestaoAtivo = useEstudarModalActive();
  const isDashboardDesktop = useDashboardDesktop();
  const pageVariants = isDashboardDesktop ? pageVariantsDesktop : pageVariantsMobile;
  const estudoReversoWelcome = useEstudoReversoWelcome({ enabled: userEmail != null });
  /** Player inline no shell: main sem scroll externo para o card preencher a altura (desktop). */
  const estudarQuestaoFillViewport =
    parseEstudarSlugFromPathname(pathname) !== null && !modalQuestaoAtivo;
  /** Drawer acima de ER/modal só quando o modal de questão não está ativo (z-100). */
  const drawerAboveOverlays = mobileMenuOpen && !modalQuestaoAtivo;

  useBodyScrollLock(mobileMenuOpen && !isDashboardDesktop);

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

  const menuButtonRef = useRef<HTMLButtonElement>(null);
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
        // isAdmin vem do servidor via initialIsAdmin; não temos ADMIN_EMAIL no client.
        // Mantemos o valor inicial — ele é correto enquanto o email não mudar de sessão.
        return;
      }
      if (event === 'SIGNED_OUT') {
        setUserEmail(null);
        setUserDisplayName(null);
        setIsAdminUser(false);
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
  const concursoParamForLink = searchParams.get('concurso')?.trim() || null;
  const editalAtivo = initialMatriculatedConcursos.find((concurso) => concurso.tipo === 'edital');
  const cidadeExibicao =
    editalAtivo?.nome ??
    initialMatriculatedConcursos.find((concurso) => concurso.slug === 'geral')?.nome ??
    (rawCidade ? decodeURIComponent(rawCidade) : 'Técnico de Enfermagem');

  const createQueryString = (path: string) => {
    const params = new URLSearchParams();
    if (cidadeParamForLink != null) params.set('cidade', cidadeParamForLink);
    if (concursoParamForLink) params.set('concurso', concursoParamForLink);
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  };

  // Fechar menu ao navegar (requestAnimationFrame evita setState síncrono no effect — react-hooks/set-state-in-effect)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMobileMenuOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    if (!modalQuestaoAtivo) return;
    const id = requestAnimationFrame(() => setMobileMenuOpen(false));
    return () => cancelAnimationFrame(id);
  }, [modalQuestaoAtivo]);

  useEffect(() => {
    if (!estudoReversoWelcome.isOpen) return;
    const id = requestAnimationFrame(() => setMobileMenuOpen(false));
    return () => cancelAnimationFrame(id);
  }, [estudoReversoWelcome.isOpen]);

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
        menuButtonRef.current?.focus();
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

  const showBackToVitrine = shouldShowBackToVitrine(pathname);

  const menuItems: MenuItem[] = [
    { label: 'Vitrine de Aulas', icon: LayoutDashboard, href: '/estudar', active: isPathActive('/estudar') },
    { label: 'Como usar (tutorial)', icon: HelpCircle, href: '/ajuda', active: pathname === '/ajuda' },
    { label: 'Estudo Reverso (método)', icon: BrainCircuit, href: '/ajuda/estudo-reverso', active: pathname === '/ajuda/estudo-reverso' },
    {
      label: 'Progresso de estudo',
      icon: BarChart3,
      href: '/progresso',
      active: pathname === '/progresso' || pathname === '/analytics',
    },
    {
      label: 'Meu desempenho (simulados)',
      icon: ClipboardList,
      href: '/desempenho/simulados',
      active: isPathActive('/desempenho/simulados'),
    },
    { label: 'Simulados', icon: ClipboardList, href: '/simulados', active: isPathActive('/simulados') },
    { label: 'Plano de Estudo Diário', icon: CalendarDays, href: '/plano-diario', active: pathname === '/plano-diario' },
    { label: 'Cadernos de Estudo', icon: BookMarked, href: '/cadernos', active: isPathActive('/cadernos') },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const isAssinaturaActive = isPathActive('/conta/assinatura');
  const hideMainFromAssistiveTech = mobileMenuOpen && !isDashboardDesktop;

  return (
    <PwaInstallProvider enabled={userEmail != null} blocked={estudoReversoWelcome.isOpen}>
    <div className="dashboard-surface flex h-[100dvh] max-h-[100dvh] min-h-0 bg-background font-sans text-foreground">
      {/* --- SIDEBAR FIXA --- */}
      <aside className="relative z-20 hidden h-full w-[18rem] shrink-0 flex-col border-r border-white/10 bg-[#06090f] md:flex">
        <DashboardSidebarPanels
          cidadeExibicao={cidadeExibicao}
          isPro={isPro}
          proSource={proSource}
          proExpiresAt={proExpiresAt}
          menuItems={menuItems}
          createQueryString={createQueryString}
          isAdminUser={isAdminUser}
          onNavAction={closeMobileMenu}
          userEmail={userEmail}
          userDisplayName={userDisplayName}
          userInitials={userInitials}
          isAssinaturaActive={isAssinaturaActive}
          onLogout={handleLogout}
        />
      </aside>

      <MobileDashboardDrawer
        open={mobileMenuOpen}
        drawerAboveOverlays={drawerAboveOverlays}
        panelRef={drawerPanelRef}
        closeButtonRef={closeDrawerButtonRef}
        onClose={closeMobileMenu}
      >
        <DashboardSidebarPanels
          identityClassName="shrink-0 pt-0"
          cidadeExibicao={cidadeExibicao}
          isPro={isPro}
          proSource={proSource}
          proExpiresAt={proExpiresAt}
          menuItems={menuItems}
          createQueryString={createQueryString}
          isAdminUser={isAdminUser}
          onNavAction={closeMobileMenu}
          userEmail={userEmail}
          userDisplayName={userDisplayName}
          userInitials={userInitials}
          isAssinaturaActive={isAssinaturaActive}
          onLogout={handleLogout}
        />
      </MobileDashboardDrawer>

      {/* --- ÁREA PRINCIPAL ---
          Sombra interna só em md+: cobre artefatos escuros no encaixe com a sidebar; evita linha na barra quando não há sidebar. */}
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          aria-hidden={hideMainFromAssistiveTech ? true : undefined}
        >
        <div className="sticky top-0 z-30 shrink-0 border-b border-white/[0.08] bg-[#06090f]/90 backdrop-blur-xl md:hidden">
          <header className="flex items-center justify-between px-4 py-3 pt-safe">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500 shadow-md shadow-indigo-500/35">
                <Zap size={15} className="text-[#BEF264]" fill="currentColor" aria-hidden />
              </div>
              <span className="text-[17px] font-extrabold tracking-tight text-white">AVANT</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('avant:open-search'))}
                aria-label="Abrir busca"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-400 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                <Search size={15} aria-hidden />
              </button>

              <div
                className={cn(
                  'flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  USER_AVATAR_CLASSES,
                )}
                aria-hidden
              >
                {userInitials}
              </div>
            </div>
          </header>
        </div>

        <main
          className={cn(
            'relative flex min-h-0 flex-1 flex-col overflow-x-hidden md:pb-0',
            hideMainFromAssistiveTech || estudarQuestaoFillViewport
              ? 'overflow-hidden'
              : 'overflow-y-auto no-scrollbar',
            MOBILE_MAIN_SCROLL_PADDING,
          )}
        >
          {showBackToVitrine ? <BackToVitrineBar /> : null}
          <motion.div
            key={pathname?.split('/').slice(0, 2).join('/') ?? pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            className={cn(
              'flex min-h-0 flex-1 flex-col',
              estudarQuestaoFillViewport && 'h-full min-h-full',
            )}
          >
            {children}
          </motion.div>
        </main>
        </div>

        <BottomNav
          ref={menuButtonRef}
          currentPath={pathname ?? ''}
          onMenuToggle={() => {
            if (modalQuestaoAtivo || estudoReversoWelcome.isOpen) return;
            setMobileMenuOpen((open) => !open);
          }}
          menuOpen={mobileMenuOpen}
          questaoModalOpen={modalQuestaoAtivo}
          drawerOpen={mobileMenuOpen}
          welcomeOpen={estudoReversoWelcome.isOpen}
        />
      </div>

      <EstudoReversoWelcomeModal
        isOpen={estudoReversoWelcome.isOpen}
        onClose={estudoReversoWelcome.markSeenAndClose}
        onSkip={estudoReversoWelcome.markSeenAndClose}
      />
    </div>
    </PwaInstallProvider>
  );
}

export default function DashboardShell({
  children,
  initialUserEmail,
  initialDisplayName = null,
  initialIsAdmin = false,
  initialMatriculatedConcursos = [],
  isPro = false,
  proSource = null,
  proExpiresAt = null,
}: {
  children: React.ReactNode;
  initialUserEmail: string | null;
  initialDisplayName?: string | null;
  initialIsAdmin?: boolean;
  initialMatriculatedConcursos?: MatriculatedConcursoSummary[];
  isPro?: boolean;
  proSource?: ProSource;
  proExpiresAt?: string | null;
}) {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="dashboard-surface min-h-[100dvh] bg-background" />}>
        <DashboardContent
          initialUserEmail={initialUserEmail}
          initialDisplayName={initialDisplayName}
          initialIsAdmin={initialIsAdmin}
          initialMatriculatedConcursos={initialMatriculatedConcursos}
          isPro={isPro}
          proSource={proSource}
          proExpiresAt={proExpiresAt}
        >
          {children}
        </DashboardContent>
      </Suspense>
      <ToastContainer />
    </ToastProvider>
  );
}
