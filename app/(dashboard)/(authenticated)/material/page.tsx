import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/supabase/server-auth';
import MaterialApoioClient from './MaterialApoioClient';

export default async function MaterialPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect(`/login?next=${encodeURIComponent('/material')}`);
  }
  return <MaterialApoioClient />;
}
