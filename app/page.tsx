import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function IndexPage() {
  const cookieStore = cookies();
  
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

  const { data: { session } } = await supabase.auth.getSession();

  // 1. Se não está logado, manda para a tela de Login
  if (!session) {
    redirect('/login');
  }

  // 2. Se está logado, precisamos levar ele para um concurso padrão 
  // ou para uma página de seleção de concursos.
  // Por enquanto, vamos mandar para a dashboard geral de estudos.
  redirect('/estudar'); 
}