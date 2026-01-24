import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';

interface ModuloEstudoRow {
  id: string;
  modulo_slug: string;
  conteudo_json: any;
  banca: string;
  modulo_nome: string | null;
  [key: string]: any;
}

export default async function PaginaQuestaoDinamica({ params }: { params: { slug: string } }) {
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

  const { data: atual } = await supabase
    .from('modulos_estudo')
    .select('*')
    .eq('modulo_slug', params.slug)
    .single();

  if (!atual) return notFound();

  const { data: lista } = await supabase
    .from('modulos_estudo')
    .select('modulo_slug, id')
    .eq('banca', atual.banca)
    .eq('modulo_nome', atual.modulo_nome)
    .order('created_at', { ascending: true });

  const indexAtual = lista?.findIndex((item: ModuloEstudoRow) => item.id === atual.id) ?? -1;
  const anteriorSlug = indexAtual > 0 ? lista![indexAtual - 1].modulo_slug : null;
  const proximaSlug = (lista && indexAtual < lista.length - 1) ? lista[indexAtual + 1].modulo_slug : null;

  return (
    <div className="h-screen bg-slate-50 p-4 md:p-6 flex items-center justify-center font-sans">
      <div className="w-full h-full max-w-6xl max-h-[90vh]">
        <AvantLessonPlayer 
          dados={atual.conteudo_json} 
          mode="live" 
          proximaSlug={proximaSlug}
          anteriorSlug={anteriorSlug}
          moduloSlug={params.slug}
        />
      </div>
    </div>
  );
}
