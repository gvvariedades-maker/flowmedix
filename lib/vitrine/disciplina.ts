import type { LucideIcon } from 'lucide-react';
import { BookOpen, Stethoscope } from 'lucide-react';

/** Disciplinas da vitrine — extensível (futuras matérias). */
export type VitrineDisciplinaId = 'enfermagem' | 'portugues';

export type VitrineDisciplinaSummary = {
  id: VitrineDisciplinaId;
  label: string;
  totalAssuntos: number;
  totalQuestoes: number;
  /** Questões com estudo reverso concluído (CTA Iniciar/Continuar/Revisar). */
  trabalhadas: number;
  /**
   * Cobertura % (respondidas ÷ questões quando disponível; senão trabalhadas ÷ questões — RPC legada).
   */
  progressoPct: number;
  /** Soma de acertos no histórico (JS / RPC enriquecida). */
  acertos?: number;
  /** Questões distintas respondidas. */
  totalResolvidas?: number;
  /** % de acerto (acertos ÷ respondidas). */
  percentual?: number;
};

type DisciplinaGroupInput = {
  modulo_nome: string;
  totalQuestoes: number;
  trabalhadas: number;
  acertos?: number;
  totalResolvidas?: number;
};

export const VITRINE_DISCIPLINA_IDS: readonly VitrineDisciplinaId[] = [
  'enfermagem',
  'portugues',
] as const;

const DISCIPLINA_META: Record<
  VitrineDisciplinaId,
  { label: string; shortLabel: string; icon: LucideIcon }
> = {
  enfermagem: { label: 'Enfermagem', shortLabel: 'Enfermagem', icon: Stethoscope },
  portugues: { label: 'Português', shortLabel: 'Português', icon: BookOpen },
};

/** `modulo_nome` canônico do pacote Língua Portuguesa (handcraft-registry). */
const PORTUGUES_MODULO_NOME = /^l[ií]ngua\s+portuguesa$/i;

export function isPortuguesModuloNome(moduloNome?: string | null): boolean {
  return PORTUGUES_MODULO_NOME.test((moduloNome ?? '').trim());
}

export function resolveVitrineDisciplinaId(
  moduloNome?: string | null,
): VitrineDisciplinaId {
  return isPortuguesModuloNome(moduloNome) ? 'portugues' : 'enfermagem';
}

export function parseVitrineDisciplina(
  raw: string | null | undefined,
): VitrineDisciplinaId | null {
  if (raw === 'enfermagem' || raw === 'portugues') return raw;
  return null;
}

export function getVitrineDisciplinaMeta(id: VitrineDisciplinaId) {
  return DISCIPLINA_META[id];
}

export function resolveDisciplinaCtaLabel(summary: VitrineDisciplinaSummary): string {
  if (summary.totalQuestoes === 0) return 'Estudar';
  if (summary.trabalhadas === 0) return 'Iniciar';
  if (summary.trabalhadas >= summary.totalQuestoes) return 'Revisar';
  return 'Continuar';
}

/** Agrega assuntos da vitrine por disciplina (antes do filtro de disciplina). */
export function buildDisciplinaSummaries(
  groups: DisciplinaGroupInput[],
): VitrineDisciplinaSummary[] {
  const buckets = new Map<
    VitrineDisciplinaId,
    {
      assuntos: number;
      questoes: number;
      trabalhadas: number;
      acertos: number;
      totalResolvidas: number;
    }
  >();

  for (const id of VITRINE_DISCIPLINA_IDS) {
    buckets.set(id, {
      assuntos: 0,
      questoes: 0,
      trabalhadas: 0,
      acertos: 0,
      totalResolvidas: 0,
    });
  }

  for (const group of groups) {
    const id = resolveVitrineDisciplinaId(group.modulo_nome);
    const bucket = buckets.get(id)!;
    bucket.assuntos += 1;
    bucket.questoes += group.totalQuestoes;
    bucket.trabalhadas += group.trabalhadas;
    bucket.acertos += group.acertos ?? 0;
    bucket.totalResolvidas += group.totalResolvidas ?? 0;
  }

  return VITRINE_DISCIPLINA_IDS.map((id) => {
    const bucket = buckets.get(id)!;
    const hasRespondidas = bucket.totalResolvidas > 0;
    const coberturaBase = hasRespondidas ? bucket.totalResolvidas : bucket.trabalhadas;
    const progressoPct =
      bucket.questoes > 0 ? Math.round((coberturaBase / bucket.questoes) * 100) : 0;
    const percentual =
      bucket.totalResolvidas > 0
        ? Math.round((bucket.acertos / bucket.totalResolvidas) * 100)
        : 0;
    return {
      id,
      label: DISCIPLINA_META[id].label,
      totalAssuntos: bucket.assuntos,
      totalQuestoes: bucket.questoes,
      trabalhadas: bucket.trabalhadas,
      progressoPct,
      acertos: bucket.acertos,
      totalResolvidas: bucket.totalResolvidas,
      percentual,
    };
  });
}

/** Disciplinas com pelo menos 1 assunto — se ≤1, o picker some. */
export function disciplinasVisiveisNoPicker(
  summaries: VitrineDisciplinaSummary[],
): VitrineDisciplinaSummary[] {
  return summaries.filter((s) => s.totalAssuntos > 0);
}

/**
 * Hub = escolher disciplina antes do grid de assuntos.
 * Só quando há ≥2 disciplinas com conteúdo e nenhuma selecionada.
 */
export function isVitrineDisciplineHubMode(
  summaries: VitrineDisciplinaSummary[],
  selected: VitrineDisciplinaId | null,
): boolean {
  return !selected && disciplinasVisiveisNoPicker(summaries).length > 1;
}

/** Disciplinas presentes em uma lista de módulos (caderno / facets locais). */
export function disciplinasPresentesEmModulos(
  modulos: { modulo_nome?: string | null }[],
): VitrineDisciplinaId[] {
  const seen = new Set<VitrineDisciplinaId>();
  for (const m of modulos) {
    seen.add(resolveVitrineDisciplinaId(m.modulo_nome));
    if (seen.size >= VITRINE_DISCIPLINA_IDS.length) break;
  }
  return VITRINE_DISCIPLINA_IDS.filter((id) => seen.has(id));
}

/**
 * Heurística para retomar estudo / banners no drill-down
 * (resume hoje só traz `tituloAula`, sem `modulo_nome`).
 */
const PORTUGUES_TITULO_HINT =
  /\b(crase|classes?\s+de\s+palavras|pontua[cç]|concord[aâ]ncia|pronomes?|colo[cç]a[cç]|coes[aã]o|coer[eê]ncia|tipologia|g[eê]neros?\s+textuais|verbos?\b|ora[cç][oõ]es?|sintaxe|ortografia|interpreta[cç]|termos?\s+da\s+ora[cç]|figuras?\s+de\s+linguagem|reg[eê]ncia|voz(?:es)?\s+verbais?)\b/i;

export function guessDisciplinaFromTituloAula(
  tituloAula?: string | null,
): VitrineDisciplinaId {
  return PORTUGUES_TITULO_HINT.test((tituloAula ?? '').trim())
    ? 'portugues'
    : 'enfermagem';
}
