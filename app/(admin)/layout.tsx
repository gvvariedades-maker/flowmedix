import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/supabase/server-auth';
import { ADMIN_EMAIL } from '@/lib/constants';

/**
 * Em builds de CI com NEXT_PUBLIC_E2E_ADMIN_BYPASS=true a verificação de auth
 * é ignorada para que os testes Playwright consigam acessar as páginas de admin
 * sem credenciais reais (o Supabase usa URL placeholder no CI).
 * Em produção essa variável NUNCA é definida.
 */
const E2E_BYPASS = process.env.NEXT_PUBLIC_E2E_ADMIN_BYPASS === 'true';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!E2E_BYPASS) {
    const session = await getServerSession();

    if (!session?.user) {
      redirect('/login');
    }

    const userEmail = session.user.email?.toLowerCase() ?? '';
    if (!ADMIN_EMAIL || userEmail !== ADMIN_EMAIL.toLowerCase()) {
      redirect('/');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {children}
    </div>
  );
}