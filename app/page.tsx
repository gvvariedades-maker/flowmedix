import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/supabase/server-auth';
import { userHasActiveMatricula } from '@/lib/concursos/entitlements';
import { isAdminSessionEmail } from '@/lib/constants';
import { getAbsoluteUrl } from '@/lib/siteUrl';
import { FREEMIUM_PLAN_LIMITS_COMPACT, FREEMIUM_PLAN_LIMITS_DESCRIPTION } from '@/lib/freemium';

/** Chunk separado evita erro do Turbopack ao misturar grafo de módulos com `not-found`. */
const LandingHome = dynamic(() => import('@/components/landing/LandingHomeClient'), {
  ssr: true,
  loading: () => (
    <div
      className="flex min-h-screen items-center justify-center bg-[#010409] text-sm font-medium text-slate-500"
      aria-busy="true"
    >
      Carregando…
    </div>
  ),
});

const homeTitle = 'AVANT — Plataforma de Concursos para Técnico em Enfermagem';
const homeDescription =
  `Prepare-se para concursos de Técnico em Enfermagem com Estudo Reverso, NeuroSlides, revisão espaçada e plano diário automático. Questões reais de EBSERH e prefeituras. Comece grátis: ${FREEMIUM_PLAN_LIMITS_DESCRIPTION}.`;

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDescription,
  keywords: [
    'concurso técnico em enfermagem',
    'questões EBSERH técnico enfermagem',
    'plataforma estudo enfermagem',
    'preparatório técnico enfermagem',
    'questões concurso enfermagem comentadas',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AVANT — Estudo Reverso para Técnico em Enfermagem',
    description:
      'A plataforma que transforma cada questão errada em aprendizado real. Foco total em concursos de Técnico em Enfermagem.',
    url: getAbsoluteUrl('/'),
    siteName: 'AVANT',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: getAbsoluteUrl('/images/compare-avant-2.jpg'),
        width: 750,
        height: 1334,
        alt: 'AVANT — NeuroSlides de estudo reverso para Técnico em Enfermagem',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: homeTitle,
    description: `Estudo Reverso, NeuroSlides e simulados. ${FREEMIUM_PLAN_LIMITS_COMPACT} · sem cartão.`,
    images: [getAbsoluteUrl('/images/compare-avant-2.jpg')],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function IndexPage({
  searchParams,
}: {
  searchParams: Promise<{ landing?: string }>;
}) {
  const { landing } = await searchParams;
  const session = await getServerSession();
  const forceLanding = landing === '1';

  if (session?.user?.id && !forceLanding) {
    const isAdmin = isAdminSessionEmail(session.user.email);
    const hasActiveMatricula = await userHasActiveMatricula(session.user.id).catch(() => false);
    if (isAdmin) {
      redirect(hasActiveMatricula ? '/estudar' : '/admin');
    }
    redirect(hasActiveMatricula ? '/estudar' : '/planos');
  }

  return <LandingHome />;
}
