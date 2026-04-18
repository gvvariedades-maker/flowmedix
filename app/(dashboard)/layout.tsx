import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <DashboardShell initialUserEmail={user?.email ?? null}>{children}</DashboardShell>;
}
