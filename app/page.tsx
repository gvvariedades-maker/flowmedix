import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LandingHome } from '@/components/landing/LandingHome';
import { getServerSession } from '@/lib/supabase/server-auth';

const homeTitle = 'Avant | Concursos Enfermagem com estudo reverso';
const homeDescription =
  'Prepare-se para concursos de Técnico em Enfermagem com questões reais comentadas, diagnóstico de erro, estudo reverso e revisão inteligente no Avant.';

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: homeTitle,
    description:
      'Questões comentadas, diagnóstico de erro, estudo reverso e revisão inteligente para concursos de Técnico em Enfermagem.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: homeTitle,
    description: homeDescription,
  },
};

export default async function IndexPage() {
  const session = await getServerSession();

  if (session) {
    redirect('/estudar');
  }

  return <LandingHome />;
}
