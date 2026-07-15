/**
 * Guideline golden-v1 — Processo de Enfermagem / SAE.
 * @see lib/guidelines/saeCofen.ts
 * @see docs/GOLDEN_CONTENT_STANDARD.md
 */
import type { ContentSource, GoldenContentLintIssue } from '@/lib/goldenContentStandard';
import { SAE_COFEN_358 } from '@/lib/guidelines/saeCofen';

export const SAE_SUBTOPICO = 'Processo de Enfermagem';

export type SaeBranchId = 'sae_documentacao' | 'sae_etapas' | 'sae_exceto' | 'sae_generico';

export function isSaeSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return n === 'processo de enfermagem' || n === 'sae';
}

function trimSnapshot(text: string, max = 200): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function inferSaeSourceCovers(corpus: string): string[] {
  const c = corpus.toLowerCase();
  const covers = new Set<string>();

  if (/anota[cç][aã]o|registro|prontu[aá]rio|documenta/.test(c)) covers.add('anotação de enfermagem');
  if (/diagn[oó]stico de enfermagem|nanda|pes\b/.test(c)) covers.add('diagnóstico de enfermagem');
  if (/prescri[cç][aã]o de enfermagem|\bnic\b/.test(c)) covers.add('prescrição de enfermagem');
  if (/\bnoc\b|avalia[cç][aã]o de enfermagem|evolu[cç][aã]o/.test(c)) covers.add('avaliação de enfermagem');
  if (/coleta de dados|anamnese/.test(c)) covers.add('coleta de dados');
  if (/implementa[cç][aã]o/.test(c)) covers.add('implementação');
  if (/planejamento/.test(c)) covers.add('planejamento');
  if (/5 etapas|cinco etapas|etapas do pe/.test(c)) covers.add('SAE — 5 etapas');
  if (/privativ|enfermeiro|t[eé]cnico|auxiliar/.test(c)) covers.add('competências por categoria');
  if (/carimbo|assinatura|identifica[cç][aã]o/.test(c)) covers.add('identificação no registro');
  if (/veracidade|rasura|l[aá]pis|integridade/.test(c)) covers.add('integridade do registro');
  if (/exceto|incorreta|afirmativa falsa/.test(c)) covers.add('pegadinha EXCETO');

  if (covers.size === 0) covers.add('Processo de Enfermagem');

  return [...covers].slice(0, 8);
}

export function buildSaeCofen358Source(corpus: string): ContentSource {
  return {
    id: SAE_COFEN_358.id,
    tier: 'A',
    issuer: SAE_COFEN_358.issuer,
    title: SAE_COFEN_358.title,
    year: SAE_COFEN_358.year,
    url: SAE_COFEN_358.url,
    covers: inferSaeSourceCovers(corpus),
  };
}

export function buildLei7498Source(corpus: string): ContentSource {
  return {
    id: 'lei-7498-86',
    tier: 'A',
    issuer: 'Presidência da República',
    title: 'Lei nº 7.498/86 — exercício profissional de enfermagem (Art. 11)',
    year: 2009,
    covers: inferSaeSourceCovers(corpus).filter((x) => /privativ|competência/i.test(x)).length
      ? ['Art. 11 — privativas do enfermeiro', 'competências técnico/auxiliar']
      : ['exercício profissional de enfermagem'],
  };
}

export function buildSaeGuidelineSnapshot(corpus: string, existing?: string): string {
  const c = corpus.toLowerCase();
  const themes: string[] = ['Res. COFEN 358/2009'];

  if (/anota[cç][aã]o|prontu[aá]rio|registro/.test(c)) themes.push('registro de enfermagem');
  if (/5 etapas|cinco etapas|coleta|planejamento|implementa/.test(c)) themes.push('5 etapas SAE');
  if (/nanda|\bnic\b|\bnoc\b/.test(c)) themes.push('NANDA-NIC-NOC');
  if (/privativ|diagn[oó]stico de enfermagem|evolu[cç][aã]o/.test(c)) themes.push('privativas Lei 7.498/86');
  if (/exceto|incorreta/.test(c)) themes.push('pegadinha privativa × técnico');

  const canonical = [...new Set(themes)].join(' · ');
  const trimmed = existing?.trim();
  if (!trimmed) return trimSnapshot(canonical);
  if (/cofen\s*358|lei\s*7\.498/i.test(trimmed)) return trimSnapshot(trimmed);
  return trimSnapshot(`${canonical} · ${trimmed}`);
}

export function buildSaeSourcesForSlug(corpus: string): ContentSource[] {
  const sources: ContentSource[] = [buildSaeCofen358Source(corpus)];
  if (/privativ|enfermeiro|diagn[oó]stico de enfermagem|art\.?\s*11|lei\s*7\.498/i.test(corpus)) {
    sources.push(buildLei7498Source(corpus));
  }
  return sources;
}

/** Códigos que bloqueiam [READY] em strict-v2 para SAE. */
export const SAE_ALWAYS_ERROR_CODES = new Set([
  'sae_concept_gabarito_spoiler',
  'sae_danger_mirror',
  'sae_exceto_coringa',
  'sae_exceto_semantic',
]);

export function isSaeAlwaysErrorCode(code: string): boolean {
  return SAE_ALWAYS_ERROR_CODES.has(code);
}

type SlideLike = Record<string, unknown>;

function slidesOf(payload: {
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): SlideLike[] {
  return payload.reverse_study_slides ?? payload.study_slides ?? [];
}

function collectCorpus(payload: {
  question_data?: { instruction?: string; options?: { text?: string }[] };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): string {
  const options = payload.question_data?.options?.map((o) => o.text).join(' ') ?? '';
  const slideText = slidesOf(payload).map((s) => JSON.stringify(s)).join(' ');
  return `${payload.question_data?.instruction ?? ''} ${options} ${slideText}`;
}

/** Lint pedagógico leve para SAE (complementa slideContract). */
export function lintSaePedagogy(payload: {
  question_data?: { instruction?: string; options?: { id: string; text: string; is_correct: boolean }[] };
  meta?: { pedagogical_branch?: string; family?: string };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): GoldenContentLintIssue[] {
  const issues: GoldenContentLintIssue[] = [];
  const slides = slidesOf(payload);
  const instruction = payload.question_data?.instruction ?? '';
  const isExceto = /exceto|incorreta|afirmativa falsa/i.test(instruction);

  const concept = slides.find((s) => s.type === 'concept_map') as { items?: { label?: string; detail?: string }[] } | undefined;
  if (concept?.items) {
    for (const item of concept.items) {
      const blob = `${item.label ?? ''} ${item.detail ?? ''}`;
      if (/gabarito|letra\s+[a-e]\b|marcar\s+letra/i.test(blob)) {
        issues.push({
          code: 'sae_concept_gabarito_spoiler',
          message: 'concept_map não deve revelar gabarito/letra',
          severity: 'error',
          path: 'reverse_study_slides.concept_map',
        });
        break;
      }
    }
  }

  const danger = slides.find((s) => s.type === 'danger_zone') as {
    items?: { label?: string; detail?: string; correct?: string }[];
  } | undefined;
  if (danger?.items) {
    const corrects = danger.items.map((i) => (i.correct ?? '').trim().toLowerCase()).filter(Boolean);
    const seen = new Set<string>();
    for (const c of corrects) {
      if (seen.has(c)) {
        issues.push({
          code: 'sae_danger_mirror',
          message: 'danger_zone.items[].correct duplicado',
          severity: 'error',
          path: 'reverse_study_slides.danger_zone',
        });
        break;
      }
      seen.add(c);
    }

    if (isExceto && payload.meta?.pedagogical_branch === 'sae_exceto') {
      const correctOpt = payload.question_data?.options?.find((o) => o.is_correct);
      for (const item of danger.items) {
        const label = item.label ?? '';
        if (correctOpt && label.includes(`Letra ${correctOpt.id}`)) {
          const correctText = item.correct ?? '';
          if (/conduta correta|é correto|procedimento adequado/i.test(correctText) && !/exceção|exceto|não cabe|privativ/i.test(correctText)) {
            issues.push({
              code: 'sae_exceto_semantic',
              message: 'EXCETO: card do gabarito deve apontar a exceção, não conduta correta genérica',
              severity: 'error',
              path: 'reverse_study_slides.danger_zone',
            });
          }
        }
      }
    }
  }

  return issues;
}

export function buildSaeCorpusFromPayload(payload: Parameters<typeof collectCorpus>[0]): string {
  return collectCorpus(payload);
}
