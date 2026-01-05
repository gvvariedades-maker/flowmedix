import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // BUSCA DINÂMICA: Traz os módulos e os assuntos relacionados
  const [modulosRes, assuntosRes] = await Promise.all([
    supabase
      .from('modulos')
      .select('*')
      .eq('concurso_slug', 'cuite-pb') // Filtro que preparamos para o futuro
      .order('ordem', { ascending: true }),
    supabase
      .from('assuntos')
      .select('*')
  ]);

  // Prepara os dados para o visual (DashboardClient)
  const initialModules = (assuntosRes.data || []).map(assunto => ({
    id: assunto.id,
    title: assunto.nome,
    modulo_id: assunto.modulo_id, // O ELO DE CONEXÃO
    content: assunto.conteudo_json
  }));

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardClient 
          initialModules={initialModules} 
          user={user} 
        />
      </div>
    </div>
  );
}