import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/supabase/server-auth';
import { getAbsoluteUrl } from '@/lib/siteUrl';

/** Chunk separado evita erro do Turbopack ao misturar grafo de módulos com `not-found`. */
const LandingHome = dynamic(() => import('@/components/landing/LandingHome'), {
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
  'Prepare-se para concursos de Técnico em Enfermagem com Estudo Reverso, NeuroSlides, revisão espaçada e plano diário automático. Questões reais de EBSERH e prefeituras. Beta gratuito.';

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
  },
  twitter: {
    card: 'summary_large_image',
    title: homeTitle,
    description: 'Estudo Reverso, NeuroSlides e revisão espaçada. Beta gratuito.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function IndexPage() {
  const session = await getServerSession();

  if (session) {
    redirect('/estudar');
  }

  return <LandingHome />;
}
