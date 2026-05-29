import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/supabase/server-auth';
import { userHasActiveMatricula } from '@/lib/concursos/entitlements';
import { isAdminSessionEmail } from '@/lib/constants';
import { getAbsoluteUrl } from '@/lib/siteUrl';
import { FREEMIUM_PLAN_LIMITS_COMPACT, FREEMIUM_PLAN_LIMITS_DESCRIPTION } from '@/lib/freemium';

/** Chunk separado evita erro do Turbopack ao misturar grafo de módulos com `not-found`. */
const AvantLP = dynamic(() => import('@/components/landing/AvantLP'), {
  ssr: true,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#010409] text-sm font-medium text-slate-500" aria-busy="true">
      Carregando…
    </div>
  ),
});

const v2Title = 'AVANT — O banco de questões feito por técnico, para técnico';
const v2Description =
  `Questões reais de concurso para Técnico em Enfermagem com Estudo Reverso e NeuroSlides. Aprenda só o que a banca cobra. Comece grátis: ${FREEMIUM_PLAN_LIMITS_DESCRIPTION}.`;

export const metadata: Metadata = {
  title: v2Title,
  description: v2Description,
  keywords: [
    'concurso técnico em enfermagem',
    'questões técnico enfermagem',
    'estudo reverso enfermagem',
    'NeuroSlides enfermagem',
    'plataforma técnico enfermagem',
  ],
  alternates: {
    canonical: '/v2',
  },
  openGraph: {
    title: v2Title,
    description: v2Description,
    url: getAbsoluteUrl('/v2'),
    siteName: 'AVANT',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: v2Title,
    description: `Estudo Reverso e simulados para treinar. ${FREEMIUM_PLAN_LIMITS_COMPACT} · sem cartão.`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function V2LandingPage() {
  const session = await getServerSession();

  if (session?.user?.id) {
    const isAdmin = isAdminSessionEmail(session.user.email);
    const hasActiveMatricula = await userHasActiveMatricula(session.user.id).catch(() => false);
    if (isAdmin) {
      redirect(hasActiveMatricula ? '/estudar' : '/admin');
    }
    redirect(hasActiveMatricula ? '/estudar' : '/planos');
  }

  return <AvantLP />;
}
