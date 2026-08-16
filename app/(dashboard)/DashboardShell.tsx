'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, LogOut, Search, CreditCard } from 'lucide-react';
import { CadernoOnboardingBanner } from '@/components/onboarding/CadernoOnboardingBanner';
import { EstudoReversoWelcomeModal } from '@/components/onboarding/EstudoReversoWelcomeModal';
import { OnboardingOnAccess } from '@/components/onboarding/OnboardingOnAccess';
import { useCadernoOnboarding } from '@/components/onboarding/useCadernoOnboarding';
import { subscribeNotebookActivationRefresh } from '@/lib/cadernos/notebookActivationBridge';
import { PwaInstallProvider } from '@/components/pwa/PwaInstallProvider';
import { PwaInstallNavButton } from '@/components/pwa/PwaInstallNavButton';
import { useEstudoReversoWelcome } from '@/components/onboarding/useEstudoReversoWelcome';
import { useOnboardingOnAccess } from '@/components/onboarding/useOnboardingOnAccess';
import { cn } from '@/lib/utils';
import type { NotebookActivationStatus } from '@/lib/cadernos/activation';
import { EMPTY_NOTEBOOK_ACTIVATION } from '@/lib/cadernos/activation';
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
import { useEstudarQuestaoImmersive } from '@/lib/layout/useEstudarQuestaoImmersive';
import { BottomNav } from '@/components/layout/BottomNav';
import { MobileDashboardDrawer } from '@/components/layout/MobileDashboardDrawer';
import {
  MENU_ICON_STROKE,
  MENU_NAV_ACTIVE,
  MENU_NAV_ROW_IDLE,
  MenuNavIconChip,
} from '@/components/layout/MenuNavIconChip';
import {
  buildHelpNavItems,
  buildMenuSections,
  type DashboardNavItem,
  type DashboardNavSection,
} from '@/lib/layout/dashboardNav';
import { AvantBrandMark } from '@/components/brand/AvantBrandMark';
import { PlanStatusCard } from '@/components/plan/PlanStatusCard';
import { getFocusableIn } from '@/lib/a11y/focusable';
import { useBodyScrollLock } from '@/lib/layout/useBodyScrollLock';
import { DASHBOARD_MAIN_SCROLL_ATTR } from '@/lib/layout/dashboardMainScroll';
import { useDashboardDesktop } from '@/lib/layout/useDashboardDesktop';
import { WhatsAppIcon } from '@/components/support/WhatsAppIcon';
import { openWhatsAppChat } from '@/lib/whatsapp';
import { useEditorialTheme } from '@/lib/layout/useEditorialTheme';
import { DesempenhoEstudoPendingView } from '@/components/dashboard/desempenho/DesempenhoEstudoPendingView';
import {
  DESEMPENHO_NAV_PENDING_TIMEOUT_MS,
  isDesempenhoHubHref,
  resolveDesempenhoNavAnchor,
  shouldClearDesempenhoNavPendingOnPath,
  shouldMarkDesempenhoNavPending,
} from '@/lib/desempenho/desempenhoPendingMark';

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

/** Avatar — fill de marca; sem anel/borda laranja decorativa. */
const USER_AVATAR_CLASSES =
  'bg-[var(--color-brand)] text-white shadow-sm';

type MatriculatedConcursoSummary = {
  slug: string;
  nome: string;
  tipo: 'geral' | 'edital';
  banca: string | null;
  orgao: string | null;
  ano: number | null;
};

function getAssinaturaNavLabel(isAdminUser: boolean, proSource: ProSource): string | null {
  if (isAdminUser) return null;
  if (proSource === 'stripe') return 'Gerenciar assinatura';
  if (proSource === 'invite') return 'Ver assinatura';
  return 'Minha assinatura';
}

function DashboardNavLink({
  item,
  createQueryString,
  onNavAction,
}: {
  item: DashboardNavItem;
  createQueryString: (path: string) => string;
  onNavAction?: () => void;
}) {
  const desempenhoHub = isDesempenhoHubHref(item.href);
  return (
    <Link
      href={createQueryString(item.href)}
      prefetch={desempenhoHub ? false : undefined}
      onClick={onNavAction}
      title={item.title}
      aria-current={item.active ? 'page' : undefined}
      className={cn(
        'group relative flex w-full items-center gap-2.5 rounded-xl py-2 pl-2.5 pr-2 text-sm transition-colors',
        item.active
          ? cn(MENU_NAV_ACTIVE.row, 'font-semibold', MENU_NAV_ACTIVE.label)
          : MENU_NAV_ROW_IDLE,
      )}
    >
      {item.active ? (
        <span
          className={cn(
            'absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full',
            MENU_NAV_ACTIVE.bar,
          )}
          aria-hidden
        />
      ) : null}
      <MenuNavIconChip icon={item.icon} accent={item.accent} active={item.active} />
      {item.label}
    </Link>
  );
}

function DashboardNav({
  menuSections,
  helpItems,
  createQueryString,
  isAdminUser,
  isAdminActive,
  onNavAction,
}: {
  menuSections: DashboardNavSection[];
  helpItems: DashboardNavItem[];
  createQueryString: (path: string) => string;
  isAdminUser: boolean;
  isAdminActive: boolean;
  onNavAction?: () => void;
}) {
  return (
    <nav className="space-y-0.5 px-1.5 pb-2" aria-label="Navegação principal">
      {menuSections.map((section, sectionIndex) => {
        const showHeading = section.items.length > 1;
        return (
          <div key={section.id} className="pb-1">
            {showHeading ? (
              <p
                className={cn(
                  'px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600',
                  sectionIndex === 0 ? 'pt-0' : 'border-t border-[var(--color-border-default)] pt-2',
                )}
              >
                {section.label}
              </p>
            ) : (
              <span className="sr-only">{section.label}</span>
            )}
            <div
              className={cn(
                'space-y-0.5',
                !showHeading && sectionIndex > 0 && 'border-t border-[var(--color-border-default)] pt-2',
              )}
            >
              {section.items.map((item) => (
                <DashboardNavLink
                  key={item.href}
                  item={item}
                  createQueryString={createQueryString}
                  onNavAction={onNavAction}
                />
              ))}
            </div>
          </div>
        );
      })}
      <div className="mt-2 border-t border-[var(--color-border-default)] pt-2">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          Suporte
        </p>
        <div className="space-y-0.5">
          {helpItems.map((item) => (
            <DashboardNavLink
              key={item.href}
              item={item}
              createQueryString={createQueryString}
              onNavAction={onNavAction}
            />
          ))}
          <button
            type="button"
            title="Tirar dúvidas pelo WhatsApp"
            onClick={() => {
              onNavAction?.();
              openWhatsAppChat();
            }}
            className={cn(
              'group flex w-full items-center gap-2.5 rounded-xl py-2 pl-2.5 pr-2 text-sm transition-colors',
              'text-slate-600 hover:bg-[#25D366]/12 hover:text-[#128C7E]',
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-transparent bg-transparent transition-all duration-200 group-hover:border-[#25D366]/30 group-hover:bg-[#25D366]/10">
              <WhatsAppIcon
                size={18}
                className="text-slate-500 transition-colors group-hover:text-[#25D366]"
              />
            </span>
            WhatsApp
          </button>
          <PwaInstallNavButton onNavigate={onNavAction} />
        </div>
      </div>
      {isAdminUser && (
        <div className="mt-4 pl-1 pt-1">
          <Link
            href="/admin"
            aria-current={isAdminActive ? 'page' : undefined}
            className="flex items-center gap-2.5 rounded-xl py-2 pl-2.5 pr-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-white/70 hover:text-slate-800"
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
    <div className="px-1.5 pb-safe pt-2">
      <div className="overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-white">
        <div className="flex items-start gap-2 p-2.5">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
              USER_AVATAR_CLASSES,
            )}
            aria-hidden
          >
            {userInitials}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-sm font-bold leading-tight text-slate-900">{name}</p>
            <p
              className="mt-0.5 truncate text-xs font-normal text-slate-500"
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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-[var(--color-brand-dim)] hover:text-slate-800"
          >
            <LogOut size={17} strokeWidth={MENU_ICON_STROKE} aria-hidden />
          </button>
        </div>
        {assinaturaLabel ? (
          <Link
            href={createQueryString('/conta/assinatura')}
            onClick={onNavAction}
            aria-current={isAssinaturaActive ? 'page' : undefined}
            className={cn(
              'flex w-full items-center gap-2.5 border-t border-[var(--color-border-default)] py-2 pl-2.5 pr-2 text-sm font-semibold transition-colors',
              isAssinaturaActive
                ? cn(MENU_NAV_ACTIVE.row, MENU_NAV_ACTIVE.label)
                : MENU_NAV_ROW_IDLE,
            )}
          >
            <MenuNavIconChip icon={CreditCard} accent="slate" active={isAssinaturaActive} />
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
  menuSections,
  helpItems,
  createQueryString,
  isAdminUser,
  isAdminActive,
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
  menuSections: DashboardNavSection[];
  helpItems: DashboardNavItem[];
  createQueryString: (path: string) => string;
  isAdminUser: boolean;
  isAdminActive: boolean;
  onNavAction?: () => void;
  userEmail: string | null;
  userDisplayName: string | null;
  userInitials: string;
  isAssinaturaActive: boolean;
  onLogout: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          'sticky top-0 z-10 shrink-0 border-b border-[var(--color-border-default)] bg-[var(--color-surface-0)] pb-2',
          identityClassName,
        )}
      >
        <PlanStatusCard
          cidadeExibicao={cidadeExibicao}
          isPro={isPro}
          proSource={proSource}
          proExpiresAt={proExpiresAt}
          brandHref={createQueryString('/estudar')}
        />
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pt-2">
        <DashboardNav
          menuSections={menuSections}
          helpItems={helpItems}
          createQueryString={createQueryString}
          isAdminUser={isAdminUser}
          isAdminActive={isAdminActive}
          onNavAction={onNavAction}
        />
      </div>

      <div className="shrink-0 border-t border-[var(--color-border-default)] bg-[var(--color-surface-0)] pt-2">
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
  initialNotebookActivation,
  initialOnboardingCompleted,
  isPro,
  proSource,
  proExpiresAt,
}: {
  children: React.ReactNode;
  initialUserEmail: string | null;
  initialDisplayName: string | null;
  initialIsAdmin: boolean;
  initialMatriculatedConcursos: MatriculatedConcursoSummary[];
  initialNotebookActivation: NotebookActivationStatus;
  initialOnboardingCompleted: boolean;
  isPro: boolean;
  proSource: ProSource;
  proExpiresAt: string | null;
}) {
  useEditorialTheme();

  const pathname = usePathname();
  const [desempenhoNavPending, setDesempenhoNavPending] = useState(false);
  const desempenhoPendingUi =
    desempenhoNavPending && !shouldClearDesempenhoNavPendingOnPath(pathname);
  const clearDesempenhoNavPending = useCallback(() => {
    document.documentElement.removeAttribute('data-desempenho-nav-pending');
    setDesempenhoNavPending(false);
  }, []);
  const markDesempenhoPending = useCallback(() => {
    document.documentElement.setAttribute('data-desempenho-nav-pending', 'true');
    flushSync(() => {
      setDesempenhoNavPending(true);
    });
  }, []);
  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      const anchor = resolveDesempenhoNavAnchor(event.target);
      if (!anchor) return;
      if (
        !shouldMarkDesempenhoNavPending(event, anchor, {
          pathname: window.location.pathname,
          origin: window.location.origin,
        })
      ) {
        return;
      }
      markDesempenhoPending();
    };
    document.addEventListener('click', onClickCapture, true);
    return () => document.removeEventListener('click', onClickCapture, true);
  }, [markDesempenhoPending]);
  useEffect(() => {
    if (!desempenhoNavPending) return;
    if (!shouldClearDesempenhoNavPendingOnPath(pathname)) return;
    document.documentElement.removeAttribute('data-desempenho-nav-pending');
    const timeoutId = window.setTimeout(clearDesempenhoNavPending, 0);
    return () => window.clearTimeout(timeoutId);
  }, [pathname, desempenhoNavPending, clearDesempenhoNavPending]);
  useEffect(() => {
    if (!desempenhoPendingUi) return;

    const revealHub = () => {
      if (!document.querySelector('[data-desempenho-hub="estudo"]')) return false;
      clearDesempenhoNavPending();
      return true;
    };

    const observer = new MutationObserver(() => {
      revealHub();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timeoutId = window.setTimeout(() => {
      clearDesempenhoNavPending();
    }, DESEMPENHO_NAV_PENDING_TIMEOUT_MS);
    const abandon = () => {
      clearDesempenhoNavPending();
    };
    window.addEventListener('popstate', abandon);
    window.addEventListener('pagehide', abandon);
    const existingHubId = window.setTimeout(() => {
      revealHub();
    }, 0);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
      window.clearTimeout(existingHubId);
      window.removeEventListener('popstate', abandon);
      window.removeEventListener('pagehide', abandon);
    };
  }, [desempenhoPendingUi, clearDesempenhoNavPending]);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(initialDisplayName);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(initialIsAdmin);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const modalQuestaoAtivo = useEstudarModalActive();
  const estudarQuestaoImmersive = useEstudarQuestaoImmersive();
  const isDashboardDesktop = useDashboardDesktop();
  const pageVariants = isDashboardDesktop ? pageVariantsDesktop : pageVariantsMobile;
  const onboardingOnAccess = useOnboardingOnAccess({
    enabled: userEmail != null,
    initialCompleted: initialOnboardingCompleted,
  });
  const estudoReversoWelcome = useEstudoReversoWelcome({
    enabled: userEmail != null && onboardingOnAccess.completed,
  });
  const cadernoOnboarding = useCadernoOnboarding({
    enabled: userEmail != null,
    initialActivation: initialNotebookActivation,
    isAdmin: isAdminUser,
    isPro,
    proSource,
    welcomeOpen: onboardingOnAccess.isOpen || estudoReversoWelcome.isOpen,
    questaoModalOpen: modalQuestaoAtivo,
    estudarQuestaoImmersive,
  });

  useEffect(() => {
    return subscribeNotebookActivationRefresh(() => {
      void cadernoOnboarding.refreshActivation();
    });
  }, [cadernoOnboarding]);

  /** Player inline no shell: main sem scroll externo para o card preencher a altura (desktop). */
  const estudarQuestaoFillViewport =
    parseEstudarSlugFromPathname(pathname) !== null && !modalQuestaoAtivo;
  /** Drawer acima de ER/modal só quando o modal de questão não está ativo (z-100). */
  const drawerAboveOverlays = mobileMenuOpen && !modalQuestaoAtivo;

  useBodyScrollLock(mobileMenuOpen && !isDashboardDesktop);

  /** Evita scroll no document — shell 100dvh é a única superfície rolável (main interno). */
  useEffect(() => {
    if (isDashboardDesktop) return;
    const root = document.documentElement;
    root.classList.add('dashboard-mobile-shell');
    return () => root.classList.remove('dashboard-mobile-shell');
  }, [isDashboardDesktop]);

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
    if (!onboardingOnAccess.isOpen) return;
    const id = requestAnimationFrame(() => setMobileMenuOpen(false));
    return () => cancelAnimationFrame(id);
  }, [onboardingOnAccess.isOpen]);

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

  const menuSections = buildMenuSections(isPathActive);
  const helpItems = buildHelpNavItems(isPathActive);
  const isAdminActive = pathname?.startsWith('/admin') ?? false;

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const isAssinaturaActive = isPathActive('/conta/assinatura');
  const hideMainFromAssistiveTech = mobileMenuOpen && !isDashboardDesktop;

  return (
    <PwaInstallProvider
      enabled={userEmail != null}
      blocked={onboardingOnAccess.isOpen || estudoReversoWelcome.isOpen}
    >
    <div className="dashboard-surface flex h-[100svh] max-h-[100svh] min-h-0 bg-background font-sans text-foreground md:h-[100dvh] md:max-h-[100dvh]">
      {/* --- SIDEBAR FIXA --- */}
      <aside className="relative z-20 hidden h-full min-h-0 w-[15.5rem] shrink-0 flex-col overflow-hidden border-r border-[var(--color-border-default)] bg-[var(--color-surface-0)] md:flex">
        <DashboardSidebarPanels
          cidadeExibicao={cidadeExibicao}
          isPro={isPro}
          proSource={proSource}
          proExpiresAt={proExpiresAt}
          menuSections={menuSections}
          helpItems={helpItems}
          createQueryString={createQueryString}
          isAdminUser={isAdminUser}
          isAdminActive={isAdminActive}
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
          menuSections={menuSections}
          helpItems={helpItems}
          createQueryString={createQueryString}
          isAdminUser={isAdminUser}
          isAdminActive={isAdminActive}
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
        {!estudarQuestaoImmersive ? (
          <div className="sticky top-0 z-30 shrink-0 border-b border-[var(--color-border-default)] bg-[var(--color-surface-2)] shadow-[var(--shadow-editorial-sm)] md:hidden">
            <header className="flex h-16 min-h-16 items-center justify-between px-4 pt-safe">
              <AvantBrandMark size="sm" variant="editorial" />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('avant:open-search'))}
                  aria-label="Abrir busca"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--color-border-default)] bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Search size={15} aria-hidden />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (modalQuestaoAtivo || onboardingOnAccess.isOpen || estudoReversoWelcome.isOpen) {
                      return;
                    }
                    setMobileMenuOpen(true);
                  }}
                  aria-label="Abrir menu da conta"
                  className={cn(
                    'flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-xs font-bold transition-opacity hover:opacity-90',
                    USER_AVATAR_CLASSES,
                  )}
                >
                  {userInitials}
                </button>
              </div>
            </header>
          </div>
        ) : null}

        <main
          {...{ [DASHBOARD_MAIN_SCROLL_ATTR]: '' }}
          className={cn(
            'relative flex min-h-0 flex-1 flex-col overflow-x-hidden',
            hideMainFromAssistiveTech || estudarQuestaoFillViewport
              ? 'overflow-hidden'
              : 'overflow-y-auto no-scrollbar',
          )}
        >
          {showBackToVitrine ? <BackToVitrineBar /> : null}
          {cadernoOnboarding.isVisible ? (
            <CadernoOnboardingBanner
              isPro={isPro}
              proSource={proSource}
              editalAtivo={editalAtivo}
              ctaHref={cadernoOnboarding.cta.href}
              ctaLabel={cadernoOnboarding.cta.label}
              onSnooze={cadernoOnboarding.snooze}
            />
          ) : null}
          {desempenhoPendingUi ? <DesempenhoEstudoPendingView /> : null}
          <div
            hidden={desempenhoPendingUi}
            className={cn(
              'flex min-h-0 flex-1 flex-col',
              estudarQuestaoFillViewport && 'h-full min-h-full',
            )}
          >
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
          </div>
        </main>
        </div>

        {!estudarQuestaoImmersive ? (
          <BottomNav
            ref={menuButtonRef}
            currentPath={pathname ?? ''}
            onMenuToggle={() => {
              if (modalQuestaoAtivo || onboardingOnAccess.isOpen || estudoReversoWelcome.isOpen) {
                return;
              }
              setMobileMenuOpen((open) => !open);
            }}
            menuOpen={mobileMenuOpen}
            questaoModalOpen={modalQuestaoAtivo}
            drawerOpen={mobileMenuOpen}
            welcomeOpen={onboardingOnAccess.isOpen || estudoReversoWelcome.isOpen}
          />
        ) : null}
      </div>

      <OnboardingOnAccess
        isOpen={onboardingOnAccess.isOpen}
        onComplete={onboardingOnAccess.markCompleted}
      />

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
  initialNotebookActivation = EMPTY_NOTEBOOK_ACTIVATION,
  initialOnboardingCompleted = false,
  isPro = false,
  proSource = null,
  proExpiresAt = null,
}: {
  children: React.ReactNode;
  initialUserEmail: string | null;
  initialDisplayName?: string | null;
  initialIsAdmin?: boolean;
  initialMatriculatedConcursos?: MatriculatedConcursoSummary[];
  initialNotebookActivation?: NotebookActivationStatus;
  initialOnboardingCompleted?: boolean;
  isPro?: boolean;
  proSource?: ProSource;
  proExpiresAt?: string | null;
}) {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="dashboard-surface min-h-[100svh] bg-background md:min-h-[100dvh]" />}>
        <DashboardContent
          initialUserEmail={initialUserEmail}
          initialDisplayName={initialDisplayName}
          initialIsAdmin={initialIsAdmin}
          initialMatriculatedConcursos={initialMatriculatedConcursos}
          initialNotebookActivation={initialNotebookActivation}
          initialOnboardingCompleted={initialOnboardingCompleted}
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
