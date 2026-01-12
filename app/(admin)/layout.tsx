'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ADMIN_EMAIL } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const userEmail = user.email?.toLowerCase();
      // O ADMIN_EMAIL deve estar definido em seu arquivo de constantes
      if (userEmail !== ADMIN_EMAIL.toLowerCase()) {
        router.push('/'); // Redireciona aluno para a Vitrine principal
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
    // Removi o bg-black para deixar o fundo branco/cinza do Laboratório brilhar
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}