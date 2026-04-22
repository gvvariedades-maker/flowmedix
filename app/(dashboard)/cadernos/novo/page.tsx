import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/supabase/server-auth';
import NovoCadernoClient from '@/components/dashboard/cadernos/NovoCadernoClient';

export default async function NovoCadernoPage() {
  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  return <NovoCadernoClient />;
}
