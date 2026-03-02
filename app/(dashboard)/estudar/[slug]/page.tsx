import { notFound } from 'next/navigation';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import { 
  getQuestaoBySlugCached, 
  getQuestoesByBancaCached 
} from '@/lib/cache';

interface ModuloEstudoRow {
  id: string;
  modulo_slug: string;
  conteudo_json: any;
  banca: string;
  modulo_nome: string | null;
  [key: string]: any;
}

interface ModuloListItem {
  id: string;
  modulo_slug: string;
}

export default async function PaginaQuestaoDinamica({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;
  // OTIMIZAÇÃO: Busca questão primeiro (crítica para renderização)
  const atual = await getQuestaoBySlugCached(resolvedParams.slug);

  if (!atual) return notFound();

  // OTIMIZAÇÃO: Busca lista em paralelo após ter a questão (não bloqueia renderização)
  // A lista é usada apenas para navegação, pode carregar depois
  const listaPromise = getQuestoesByBancaCached(
    atual.banca,
    atual.modulo_nome
  );

  // Aguarda lista apenas para calcular navegação (não bloqueia renderização inicial)
  const lista = await listaPromise;

  const indexAtual = lista?.findIndex((item: ModuloListItem) => item.id === atual.id) ?? -1;
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
          moduloSlug={resolvedParams.slug}
        />
      </div>
    </div>
  );
}
