import { notFound } from 'next/navigation';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import { 
  getQuestaoBySlugCached, 
  getQuestoesByAssuntoCached 
} from '@/lib/cache';

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
  // Busca a questão atual
  const atual = await getQuestaoBySlugCached(resolvedParams.slug);

  if (!atual) return notFound();

  // Navegação por assunto (titulo_aula) — agrupa todas as questões do mesmo assunto
  const tituloAula: string =
    atual.titulo_aula ||
    atual.conteudo_json?.meta?.subtopico ||
    atual.modulo_nome ||
    '';

  const lista = tituloAula
    ? await getQuestoesByAssuntoCached(tituloAula)
    : [];

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
