import type { AvantLessonPlayerProps, LessonData } from '@/types/lesson';
import type { EstudarQuestaoBuildResult } from '@/lib/estudar/questaoPlayerPayload';
import {
  ESTUDAR_QUESTAO_LAYERS_DEFAULT,
  stripSlidesForCoreLayer,
  type EstudarQuestaoLayers,
} from '@/lib/estudar/questaoLayers';
import { parseEstudarSearchParams } from '@/lib/estudar/parseEstudarSearchParams';
import { stripQuestionAnswersForClient } from '@/lib/estudar/questionPayload';
import type { VitrineFacets, VitrinePageResponse } from '@/lib/vitrine/types';
import type { VitrineListQuery } from '@/lib/vitrine/parseListQuery';
import {
  E2E_ESTUDAR_BANCA,
  E2E_ESTUDAR_SLUG_1,
  E2E_ESTUDAR_SLUG_2,
  E2E_ESTUDAR_SLUGS,
  E2E_ESTUDAR_TITULO_AULA,
  isE2eEstudarSlug,
} from '@/lib/e2e/constants';

const E2E_LESSONS: Record<(typeof E2E_ESTUDAR_SLUGS)[number], LessonData> = {
  [E2E_ESTUDAR_SLUG_1]: {
    meta: {
      banca: E2E_ESTUDAR_BANCA,
      topico: 'Urgências',
      subtopico: 'Urgências e Emergências',
    },
    question_data: {
      instruction: 'Questão E2E 1: paciente em PCR. Qual a primeira conduta?',
      options: [
        { id: 'A', text: 'Iniciar compressões torácicas', is_correct: true },
        { id: 'B', text: 'Administrar atropina EV', is_correct: false },
      ],
    },
  },
  [E2E_ESTUDAR_SLUG_2]: {
    meta: {
      banca: E2E_ESTUDAR_BANCA,
      topico: 'Urgências',
      subtopico: 'Urgências e Emergências',
    },
    question_data: {
      instruction: 'Questão E2E 2: após RCP, qual droga vasoativa de escolha?',
      options: [
        { id: 'A', text: 'Adrenalina 1 mg EV', is_correct: true },
        { id: 'B', text: 'Atropina 1 mg EV', is_correct: false },
      ],
    },
  },
};

function buildVitrineQuerySuffix(
  searchParams: Record<string, string | string[] | undefined> = {},
): string {
  const {
    vitrineBancas,
    vitrineAssuntos,
    vitrineQ,
    vitrinePage,
    fromPlano,
    fromCaderno,
    cadernoId,
  } = parseEstudarSearchParams(searchParams);

  if (fromPlano) return '?from=plano';
  if (fromCaderno && cadernoId) {
    return `?from=caderno&caderno_id=${encodeURIComponent(cadernoId)}`;
  }

  const p = new URLSearchParams();
  vitrineBancas.forEach((b) => p.append('banca', b));
  vitrineAssuntos.forEach((a) => p.append('assunto', a));
  if (vitrineQ) p.set('q', vitrineQ);
  if (vitrinePage > 1) p.set('page', String(vitrinePage));
  const s = p.toString();
  return s ? `?${s}` : '';
}

export function getE2eEstudarFacets(): VitrineFacets {
  return {
    bancas: [E2E_ESTUDAR_BANCA],
    assuntos: [E2E_ESTUDAR_TITULO_AULA],
  };
}

export function getE2eEstudarVitrinePage(_listQuery?: VitrineListQuery): VitrinePageResponse {
  const facets = getE2eEstudarFacets();
  return {
    groups: [
      {
        titulo_aula: E2E_ESTUDAR_TITULO_AULA,
        modulo_nome: 'Módulo E2E',
        banca: E2E_ESTUDAR_BANCA,
        questoes: E2E_ESTUDAR_SLUGS.map((slug, index) => ({
          slug,
          numero: index + 1,
          status: 'nao_estudada' as const,
          avant_codigo: 900001 + index,
          created_at: null,
        })),
        acertos: 0,
        erros: 0,
        totalResolvidas: 0,
        totalQuestoes: E2E_ESTUDAR_SLUGS.length,
        trabalhadas: 0,
        percentual: 0,
        firstSlug: E2E_ESTUDAR_SLUG_1,
      },
    ],
    facets,
    pagination: {
      page: 1,
      perPage: 12,
      totalGroups: 1,
      totalPages: 1,
    },
    totalModulosFiltrados: E2E_ESTUDAR_SLUGS.length,
  };
}

export function buildE2eEstudarQuestaoPayload(
  slug: string,
  searchParams: Record<string, string | string[] | undefined> = {},
  layers: EstudarQuestaoLayers = ESTUDAR_QUESTAO_LAYERS_DEFAULT,
): EstudarQuestaoBuildResult {
  if (!isE2eEstudarSlug(slug)) {
    return { status: 'not_found' };
  }

  const { fromPlano, fromCaderno, cadernoId } = parseEstudarSearchParams(searchParams);

  const suffix = buildVitrineQuerySuffix(searchParams);
  const indexAtual = E2E_ESTUDAR_SLUGS.indexOf(slug as (typeof E2E_ESTUDAR_SLUGS)[number]);
  const anteriorSlug =
    indexAtual > 0 ? `${E2E_ESTUDAR_SLUGS[indexAtual - 1]}${suffix}` : null;
  const proximaSlug =
    indexAtual >= 0 && indexAtual < E2E_ESTUDAR_SLUGS.length - 1
      ? `${E2E_ESTUDAR_SLUGS[indexAtual + 1]}${suffix}`
      : null;

  let dados = stripQuestionAnswersForClient(E2E_LESSONS[slug as (typeof E2E_ESTUDAR_SLUGS)[number]]);
  if (layers === 'core') {
    dados = stripSlidesForCoreLayer(dados);
  }

  const payload: AvantLessonPlayerProps = {
    dados,
    mode: 'live',
    proximaSlug,
    anteriorSlug,
    moduloSlug: slug,
    questoesDoAssunto: E2E_ESTUDAR_SLUGS.map((navSlug, index) => ({
      slug: navSlug,
      estudada: false,
      indice: index + 1,
    })),
    fromPlano,
    fromCaderno: fromCaderno ? cadernoId : undefined,
    listaContexto: { atual: indexAtual + 1, total: E2E_ESTUDAR_SLUGS.length },
    avantCodigo: 900001 + indexAtual,
    vitrineQuerySuffix: suffix,
  };

  return { status: 'ok', payload };
}
