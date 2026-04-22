import { redirect } from 'next/navigation';
import { LandingHome } from '@/components/landing/LandingHome';
import { getServerSession } from '@/lib/supabase/server-auth';

export default async function IndexPage() {
  const session = await getServerSession();

  if (session) {
    redirect('/estudar');
  }

  return <LandingHome />;
}
