import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LandingHome } from '@/components/landing/LandingHome';
import { getServerSession } from '@/lib/supabase/server-auth';

export const metadata: Metadata = {
  title: 'Avant | Estudo reverso para Técnico em Enfermagem',
  description:
    'Estude para concursos de Técnico em Enfermagem com questões reais, diagnóstico de erro, estudo reverso e revisão inteligente. Crie sua conta grátis no Avant.',
  openGraph: {
    title: 'Avant | Estudo reverso para Técnico em Enfermagem',
    description:
      'Questões reais, diagnóstico de erro, estudo reverso e revisão inteligente para concursos de Técnico em Enfermagem.',
    type: 'website',
  },
};

export default async function IndexPage() {
  const session = await getServerSession();

  if (session) {
    redirect('/estudar');
  }

  return <LandingHome />;
}
