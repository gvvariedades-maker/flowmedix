/**
 * Filtros e ordenação da vitrine (/estudar) replicados no servidor para a lista de
 * questões no player — mesmo conjunto que o aluno vê ao aplicar banca/assunto/busca.
 */

import { compareModuloCurriculum } from '@/lib/vitrineOrder';

export type ModuloEstudoRow = {
  id: string;
  modulo_slug: string;
  modulo_nome: string | null;
  titulo_aula: string | null;
  banca: string;
  avant_codigo: number | null;
  created_at?: string | null;
};

export type HistoricoQuestaoRow = {
  modulo_slug: string;
  acertou: boolean;
  estudo_reverso_concluido: boolean;
};

export type ModuloComStats = ModuloEstudoRow & {
  estudoReversoConcluido: boolean;
  stats: { acertos: number; total: number; percentual: number; priorityScore: number };
};

/** Anexa stats e prioridade como em `app/(dashboard)/estudar/page.tsx`. */
export function attachHistoricoStats(
  modulos: ModuloEstudoRow[],
  historico: HistoricoQuestaoRow[],
): ModuloComStats[] {
  const historicoMap = new Map<string, HistoricoQuestaoRow[]>();
  historico.forEach((h) => {
    const existing = historicoMap.get(h.modulo_slug) || [];
    historicoMap.set(h.modulo_slug, [...existing, h]);
  });

  return modulos.map((modulo) => {
    const tentativas = historicoMap.get(modulo.modulo_slug) || [];
    const acertos = tentativas.filter((t) => t.acertou).length;
    const total = tentativas.length;
    const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;
    const estudoReversoConcluido = tentativas.some((t) => t.estudo_reverso_concluido === true);

    let priorityScore = 0;
    if (!estudoReversoConcluido) priorityScore = 50;
    else if (percentual < 70) priorityScore = 100 + (70 - percentual);
    else if (percentual >= 90) priorityScore = 10;
    else priorityScore = 30;

    return {
      ...modulo,
      estudoReversoConcluido,
      stats: { acertos, total, percentual, priorityScore },
    };
  });
}

/** Mesma lógica de `filteredModulos` em `VitrineClient`. */
export function filterModulosLikeVitrine(
  modulos: ModuloComStats[],
  filters: { banca?: string; assunto?: string; q?: string },
): ModuloComStats[] {
  let result = modulos;
  const banca = filters.banca?.trim();
  const assunto = filters.assunto?.trim();
  const qRaw = filters.q?.trim();

  if (banca) result = result.filter((m) => m.banca === banca);
  if (assunto) result = result.filter((m) => m.titulo_aula === assunto);
  if (qRaw) {
    const q = qRaw.toLowerCase();
    const soNumero = q.replace(/^q-?/, '');
    result = result.filter((m) => {
      if (m.titulo_aula?.toLowerCase().includes(q) ?? false) return true;
      if (m.modulo_nome?.toLowerCase().includes(q) ?? false) return true;
      if (m.banca?.toLowerCase().includes(q) ?? false) return true;
      if (m.modulo_slug?.toLowerCase().includes(q) ?? false) return true;
      if (m.avant_codigo != null) {
        if (String(m.avant_codigo) === soNumero) return true;
        if (`q-${m.avant_codigo}`.includes(q)) return true;
      }
      return false;
    });
  }
  return result;
}

type QuestaoItem = {
  slug: string;
  status: 'nao_estudada' | 'estudada';
  created_at?: string | null;
  avant_codigo: number | null;
};

type GrupoSubtopico = {
  titulo_aula: string;
  questoes: QuestaoItem[];
  trabalhadas: number;
  totalQuestoes: number;
};

/** Ordem de grupos e questões igual a `VitrineClient` (grupos + ordenação interna). */
export function orderedSlugsFromVitrineGrouping(filteredModulos: ModuloComStats[]): string[] {
  const map = new Map<string, GrupoSubtopico>();

  filteredModulos.forEach((m) => {
    const subtopico = m.titulo_aula || 'Sem subtópico';
    const key = subtopico;

    if (!map.has(key)) {
      map.set(key, {
        titulo_aula: subtopico,
        questoes: [],
        trabalhadas: 0,
        totalQuestoes: 0,
      });
    }

    const grupo = map.get(key)!;
    const status: 'nao_estudada' | 'estudada' = m.estudoReversoConcluido ? 'estudada' : 'nao_estudada';

    grupo.questoes.push({
      slug: m.modulo_slug,
      status,
      created_at: m.created_at,
      avant_codigo: m.avant_codigo,
    });
    grupo.totalQuestoes += 1;
    if (m.estudoReversoConcluido) grupo.trabalhadas += 1;
  });

  map.forEach((grupo) => {
    /* Ordem de navegação = mesma de `getQuestoesByAssuntoCached` (created_at asc) */
    grupo.questoes.sort((a, b) =>
      compareModuloCurriculum(
        { created_at: a.created_at, avant_codigo: a.avant_codigo, modulo_slug: a.slug },
        { created_at: b.created_at, avant_codigo: b.avant_codigo, modulo_slug: b.slug },
      ),
    );
  });

  const grupos = Array.from(map.values()).sort((a, b) => {
    const pendentesA = a.totalQuestoes - a.trabalhadas;
    const pendentesB = b.totalQuestoes - b.trabalhadas;
    if (pendentesB !== pendentesA) return pendentesB - pendentesA;
    return a.titulo_aula.localeCompare(b.titulo_aula);
  });

  const slugs: string[] = [];
  for (const g of grupos) {
    for (const q of g.questoes) {
      slugs.push(q.slug);
    }
  }
  return slugs;
}

/** Lista ordenada de slugs para o player quando há filtro de vitrine na URL. */
export function buildVitrineFilteredSlugList(
  modulos: ModuloEstudoRow[],
  historico: HistoricoQuestaoRow[],
  filters: { banca?: string; assunto?: string; q?: string },
): string[] {
  const withStats = attachHistoricoStats(modulos, historico);
  const filtered = filterModulosLikeVitrine(withStats, filters);
  return orderedSlugsFromVitrineGrouping(filtered);
}
