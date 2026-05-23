import { compareModuloCurriculum } from '@/lib/vitrineOrder';
import type { ModuloComStats } from '@/lib/vitrineFilters';
import type { VitrineGrupoSubtopico, VitrineQuestaoItem } from '@/lib/vitrine/types';

/**
 * Agrupa módulos filtrados por `titulo_aula` e ordena grupos/questões
 * como em `VitrineClient` e `orderedSlugsFromVitrineGrouping`.
 */
export function buildVitrineGroups(modulos: ModuloComStats[]): VitrineGrupoSubtopico[] {
  const map = new Map<string, VitrineGrupoSubtopico>();

  for (const m of modulos) {
    const topico = m.modulo_nome || 'Geral';
    const subtopico = m.titulo_aula || 'Sem subtópico';
    const banca = m.banca || '';
    const key = subtopico;

    if (!map.has(key)) {
      map.set(key, {
        titulo_aula: subtopico,
        modulo_nome: topico,
        banca,
        questoes: [],
        acertos: 0,
        erros: 0,
        totalResolvidas: 0,
        totalQuestoes: 0,
        trabalhadas: 0,
        percentual: 0,
        firstSlug: m.modulo_slug,
      });
    }

    const grupo = map.get(key)!;
    const status: VitrineQuestaoItem['status'] = m.estudoReversoConcluido ? 'estudada' : 'nao_estudada';

    grupo.questoes.push({
      slug: m.modulo_slug,
      numero: 0,
      status,
      avant_codigo: m.avant_codigo,
      created_at: m.created_at ?? null,
    });
    grupo.acertos += m.stats.acertos;
    grupo.erros += m.stats.total - m.stats.acertos;
    grupo.totalResolvidas += m.stats.total;
    grupo.totalQuestoes += 1;
    if (m.estudoReversoConcluido) grupo.trabalhadas += 1;
    const tentativas = grupo.acertos + grupo.erros;
    grupo.percentual = tentativas > 0 ? Math.round((grupo.acertos / tentativas) * 100) : 0;
  }

  map.forEach((grupo) => {
    grupo.questoes.sort((a, b) =>
      compareModuloCurriculum(
        { created_at: a.created_at, avant_codigo: a.avant_codigo, modulo_slug: a.slug },
        { created_at: b.created_at, avant_codigo: b.avant_codigo, modulo_slug: b.slug },
      ),
    );
    grupo.questoes.forEach((q, i) => {
      q.numero = i + 1;
    });
    const primeiroNao = grupo.questoes.find((q) => q.status === 'nao_estudada');
    grupo.firstSlug = primeiroNao?.slug ?? grupo.questoes[0]?.slug ?? grupo.firstSlug;
  });

  return Array.from(map.values()).sort((a, b) => {
    const pendentesA = a.totalQuestoes - a.trabalhadas;
    const pendentesB = b.totalQuestoes - b.trabalhadas;
    if (pendentesB !== pendentesA) return pendentesB - pendentesA;
    return a.titulo_aula.localeCompare(b.titulo_aula);
  });
}
