'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ADMIN_EMAIL } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

/**
 * Em builds de CI com NEXT_PUBLIC_E2E_ADMIN_BYPASS=true a verificação de auth
 * é ignorada para que os testes Playwright consigam acessar as páginas de admin
 * sem credenciais reais (o Supabase usa URL placeholder no CI).
 * Em produção essa variável NUNCA é definida.
 */
const E2E_BYPASS = process.env.NEXT_PUBLIC_E2E_ADMIN_BYPASS === 'true';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(!E2E_BYPASS);
  const [isAuthorized, setIsAuthorized] = useState(E2E_BYPASS);

  useEffect(() => {
    if (E2E_BYPASS) return;

    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const userEmail = user.email?.toLowerCase();
      if (userEmail !== ADMIN_EMAIL.toLowerCase()) {
        router.push('/');
        return;
      }

      setIsAuthorized(true);
      setLoading(false);
    }

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Verificando Credenciais...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}