import type { AvantLessonPlayerProps, LessonData } from '@/types/lesson';
import type { EstudarQuestaoBuildResult } from '@/lib/estudar/questaoPlayerPayload';
import {
  resolveQuestionAttempt,
  type GabaritoTentativa,
} from '@/lib/estudar/questionPayload';
import {
  ESTUDAR_QUESTAO_LAYERS_DEFAULT,
  stripSlidesForCoreLayer,
  type EstudarQuestaoLayers,
} from '@/lib/estudar/questaoLayers';
import {
  buildEstudarContextQuerySuffix,
  parseEstudarSearchParams,
} from '@/lib/estudar/parseEstudarSearchParams';
import { stripQuestionAnswersForClient } from '@/lib/estudar/questionPayload';
import type { VitrineFacets, VitrinePageResponse } from '@/lib/vitrine/types';
import type { VitrineListQuery } from '@/lib/vitrine/parseListQuery';
import { VITRINE_ASSUNTOS_POR_PAGINA } from '@/lib/vitrine/constants';
import { parseQuestaoAlvo } from '@/lib/vitrine/parseQuestaoAlvo';
import type { ResolveQuestaoInAssuntoResult } from '@/lib/vitrine/resolveQuestao';
import {
  E2E_ESTUDAR_BANCA,
  E2E_ESTUDAR_SLUG_1,
  E2E_ESTUDAR_SLUG_2,
  E2E_ESTUDAR_SLUGS,
  E2E_ESTUDAR_TITULO_AULA,
  E2E_ESTUDAR_TITULO_AULA_PAGE2,
  isE2eEstudarSlug,
} from '@/lib/e2e/constants';

/** Pacote mínimo de 4 NeuroSlides para fluxo E2E de estudo reverso (slug 1). */
const E2E_REVERSE_STUDY_SLIDES: NonNullable<LessonData['reverse_study_slides']> = [
  {
    type: 'concept_map',
    meta: { topico: 'Urgências', subtopico: 'Urgências e Emergências' },
    items: [
      { label: 'RCP', detail: 'Compressões de alta qualidade primeiro.', icon: 'HeartPulse' },
      { label: 'DEA', detail: 'Usar assim que disponível.', icon: 'Zap' },
    ],
  },
  {
    type: 'golden_rule',
    meta: { topico: 'Urgências', subtopico: 'Urgências e Emergências' },
    content: 'RCP E2E',
    rows: [{ label: 'Proporção', value: '30:2' }],
  },
  {
    type: 'logic_flow',
    meta: { topico: 'Urgências', subtopico: 'Urgências e Emergências' },
    steps: ['Checar responsividade', 'Acionar ajuda', 'Iniciar compressões'],
  },
  {
    type: 'danger_zone',
    content: 'Pegadinhas E2E',
    meta: { topico: 'Urgências', subtopico: 'Urgências e Emergências' },
    items: [
      {
        label: 'Atropina na PCR',
        detail: 'Dar atropina como primeira droga.',
        correct: 'Adrenalina é a droga vasoativa na PCR.',
      },
    ],
  },
];

const e2eEstudarConcluidos = new Set<string>();

export function markE2eEstudarConcluido(slug: string): void {
  if (isE2eEstudarSlug(slug)) e2eEstudarConcluidos.add(slug);
}

export function isE2eEstudarConcluido(slug: string): boolean {
  return e2eEstudarConcluidos.has(slug);
}

export function resetE2eEstudarStore(): void {
  e2eEstudarConcluidos.clear();
}

export function resolveE2eEstudarAttempt(
  slug: string,
  opcaoId: string,
): GabaritoTentativa | null {
  if (!isE2eEstudarSlug(slug)) return null;
  return resolveQuestionAttempt(E2E_LESSONS[slug as (typeof E2E_ESTUDAR_SLUGS)[number]], opcaoId);
}

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
    reverse_study_slides: E2E_REVERSE_STUDY_SLIDES,
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
  return buildEstudarContextQuerySuffix(parseEstudarSearchParams(searchParams));
}

/** Assuntos extras para paginação E2E (page 1 = 12, page 2 = 13º). */
const E2E_VITRINE_PAGINATION_GROUP_COUNT = 13;

function buildE2eEstudarVitrineGroup(
  tituloAula: string = E2E_ESTUDAR_TITULO_AULA,
): VitrinePageResponse['groups'][number] {
  return {
    titulo_aula: tituloAula,
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
    totalNeuroSlides: E2E_ESTUDAR_SLUGS.length * E2E_REVERSE_STUDY_SLIDES.length,
    trabalhadas: 0,
    percentual: 0,
    firstSlug: E2E_ESTUDAR_SLUG_1,
  };
}

function buildE2eEstudarVitrineGroups(): VitrinePageResponse['groups'] {
  return Array.from({ length: E2E_VITRINE_PAGINATION_GROUP_COUNT }, (_, index) => {
    const titulo =
      index === 0
        ? E2E_ESTUDAR_TITULO_AULA
        : index === E2E_VITRINE_PAGINATION_GROUP_COUNT - 1
          ? E2E_ESTUDAR_TITULO_AULA_PAGE2
          : `Assunto E2E paginação ${index + 1}`;
    return buildE2eEstudarVitrineGroup(titulo);
  });
}

export function getE2eEstudarFacets(): VitrineFacets {
  return {
    bancas: [E2E_ESTUDAR_BANCA],
    assuntos: buildE2eEstudarVitrineGroups().map((group) => group.titulo_aula),
  };
}

function filterE2eEstudarVitrineGroups(
  groups: VitrinePageResponse['groups'],
  listQuery?: VitrineListQuery,
): VitrinePageResponse['groups'] {
  const bancas = listQuery?.bancas ?? [];
  const assuntos = listQuery?.assuntos ?? [];
  const q = listQuery?.q?.trim().toLowerCase() ?? '';
  const disciplina = listQuery?.disciplina ?? null;

  return groups.filter((group) => {
    if (bancas.length > 0 && !bancas.includes(group.banca)) return false;
    if (assuntos.length > 0 && !assuntos.includes(group.titulo_aula)) return false;
    if (q && !group.titulo_aula.toLowerCase().includes(q)) return false;
    if (disciplina === 'portugues') return false;
    if (disciplina === 'enfermagem') return true;
    return true;
  });
}

export function resolveE2eQuestaoInAssunto(input: {
  assunto: string;
  alvo: string;
  bancas?: string[];
}): ResolveQuestaoInAssuntoResult | null {
  const parsed = parseQuestaoAlvo(input.alvo);
  if (!parsed) return null;

  const groups = buildE2eEstudarVitrineGroups();
  const group = groups.find((g) => g.titulo_aula === input.assunto.trim());
  if (!group) return null;
  if (input.bancas?.length && !input.bancas.includes(group.banca)) return null;

  if (parsed.kind === 'codigo') {
    const questao = group.questoes.find((q) => q.avant_codigo === parsed.value);
    if (!questao) return null;
    return {
      slug: questao.slug,
      numero: questao.numero,
      totalQuestoes: group.totalQuestoes,
      avant_codigo: questao.avant_codigo,
    };
  }

  const questao = group.questoes.find((q) => q.numero === parsed.value);
  if (!questao) return null;
  return {
    slug: questao.slug,
    numero: questao.numero,
    totalQuestoes: group.totalQuestoes,
    avant_codigo: questao.avant_codigo,
  };
}

export function getE2eEstudarVitrinePage(listQuery?: VitrineListQuery): VitrinePageResponse {
  const facets = getE2eEstudarFacets();
  const page = Math.max(1, listQuery?.page ?? 1);
  const perPage = VITRINE_ASSUNTOS_POR_PAGINA;
  const allGroups = filterE2eEstudarVitrineGroups(buildE2eEstudarVitrineGroups(), listQuery);
  const totalGroups = allGroups.length;
  const totalPages = Math.max(1, Math.ceil(totalGroups / perPage));
  const pageClamped = Math.min(page, totalPages);
  const start = (pageClamped - 1) * perPage;

  return {
    groups: allGroups.slice(start, start + perPage),
    facets,
    disciplinas: [
      {
        id: 'enfermagem',
        label: 'Enfermagem',
        totalAssuntos: buildE2eEstudarVitrineGroups().length,
        totalQuestoes: E2E_ESTUDAR_SLUGS.length * buildE2eEstudarVitrineGroups().length,
        trabalhadas: 0,
        progressoPct: 0,
      },
      {
        id: 'portugues',
        label: 'Português',
        totalAssuntos: 0,
        totalQuestoes: 0,
        trabalhadas: 0,
        progressoPct: 0,
      },
    ],
    pagination: {
      page: pageClamped,
      perPage,
      totalGroups,
      totalPages,
    },
    totalModulosFiltrados: E2E_ESTUDAR_SLUGS.length * allGroups.length,
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

  const { fromPlano, fromRevisoes, fromCaderno, cadernoId } =
    parseEstudarSearchParams(searchParams);

  const suffix = buildVitrineQuerySuffix(searchParams);
  const navSlugs = fromRevisoes
    ? [E2E_ESTUDAR_SLUG_1]
    : [...E2E_ESTUDAR_SLUGS];
  const indexAtual = navSlugs.indexOf(slug);
  const anteriorSlug =
    indexAtual > 0 ? `${navSlugs[indexAtual - 1]}${suffix}` : null;
  const proximaSlug =
    indexAtual >= 0 && indexAtual < navSlugs.length - 1
      ? `${navSlugs[indexAtual + 1]}${suffix}`
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
    questoesDoAssunto: navSlugs.map((navSlug, index) => ({
      slug: navSlug,
      estudada: isE2eEstudarConcluido(navSlug),
      indice: index + 1,
    })),
    fromPlano,
    fromRevisoes,
    fromCaderno: fromCaderno ? cadernoId : undefined,
    listaContexto: {
      atual: Math.max(1, indexAtual + 1),
      total: navSlugs.length,
    },
    avantCodigo: 900001 + E2E_ESTUDAR_SLUGS.indexOf(slug as (typeof E2E_ESTUDAR_SLUGS)[number]),
    vitrineQuerySuffix: suffix,
    ...(fromRevisoes ? { sameStemFallback: false } : {}),
  };

  return { status: 'ok', payload };
}

/** Hint fixo para card "Continuar" no bypass E2E da vitrine. */
export function getE2eVitrineResumeHint() {
  return {
    moduloSlug: E2E_ESTUDAR_SLUG_1,
    questaoSlug: E2E_ESTUDAR_SLUG_1,
    tituloAula: E2E_ESTUDAR_TITULO_AULA,
    avantCodigo: 900001,
    studiedAt: '2026-01-15T10:00:00.000Z',
  };
}
