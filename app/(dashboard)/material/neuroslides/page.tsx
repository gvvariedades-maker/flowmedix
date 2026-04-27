import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/supabase/server-auth';
import MaterialNeuroslidesClient from '../MaterialNeuroslidesClient';

export const metadata: Metadata = {
  title: 'NeuroSlides | Material de Apoio',
  description:
    'Escolha uma coleção de NeuroSlides para Técnico em Enfermagem: fundamentos, medicações, SUS, ética, doenças, urgência e biossegurança.',
};

export default async function MaterialNeuroslidesPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect(`/login?next=${encodeURIComponent('/material/neuroslides')}`);
  }
  return <MaterialNeuroslidesClient />;
}
