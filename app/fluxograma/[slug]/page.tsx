import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { FlowchartContent } from '@/types/flow';

const Flowchart = dynamic(() => import('@/components/Flowchart'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-400">
      Carregando fluxograma...
    </div>
  ),
});

type FlowchartRecord = {
  id: string;
  title: string | null;
  content: FlowchartContent | null;
  modulo_id: string | null;
  slug: string;
};

export default async function FluxogramaPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const supabase = await createServerSupabase();
  const slugOrId = params.slug;

  // Tentar buscar primeiro por slug
  let { data, error } = await supabase
    .from('flowcharts')
    .select('id, title, content, modulo_id, slug')
    .eq('slug', slugOrId)
    .maybeSingle();

  // Se não encontrou por slug e o parâmetro parece ser um UUID, tentar buscar por ID
  if ((error || !data) && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId)) {
    console.log('🔄 Slug não encontrado, tentando buscar por ID:', slugOrId);
    const result = await supabase
      .from('flowcharts')
      .select('id, title, content, modulo_id, slug')
      .eq('id', slugOrId)
      .maybeSingle();
    
    data = result.data;
    error = result.error;
  }

  if (error || !data) {
    console.error('❌ Fluxograma não encontrado para slug/ID:', slugOrId, error);
    return notFound();
  }

  console.log('✅ Fluxograma encontrado:', { 
    id: data.id, 
    title: data.title, 
    temConteudo: !!data.content,
    tipoConteudo: typeof data.content,
    conteudoPreview: data.content ? (typeof data.content === 'string' ? data.content.substring(0, 100) : JSON.stringify(data.content).substring(0, 100)) : null
  });

  const flowchart = data as FlowchartRecord;
  const hasContent = !!flowchart.content;
  
  // Se o conteúdo for string, tentar parsear
  let parsedContent: FlowchartContent | null = flowchart.content;
  if (typeof flowchart.content === 'string') {
    try {
      parsedContent = JSON.parse(flowchart.content) as FlowchartContent;
      console.log('✅ Conteúdo parseado de string para objeto');
    } catch (e) {
      console.error('❌ Erro ao parsear conteúdo:', e);
      parsedContent = null;
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-[0.3em]">
            {flowchart.title || 'Fluxograma sem título'}
          </h1>
          <p className="text-sm text-slate-300">
            Slug: <span className="font-semibold text-white">{flowchart.slug}</span>
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/50">
          <h2 className="text-xl font-semibold mb-4">Visualização interativa</h2>
          {hasContent && parsedContent ? (
            <div className="w-full h-[600px] min-h-[500px] rounded-lg border border-slate-800 bg-slate-950/70 overflow-hidden">
              <Flowchart data={parsedContent} />
            </div>
          ) : (
            <p className="text-sm text-slate-300">
              Este fluxograma ainda não possui conteúdo visual registrado.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}


