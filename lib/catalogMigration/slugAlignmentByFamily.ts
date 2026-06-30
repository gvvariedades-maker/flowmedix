/**
 * Regras de alignment por família de questão (L2).
 */
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import type { AlignmentIssue } from '@/lib/catalogMigration/slugAlignment';

type SlideLike = Record<string, unknown>;
type QuestaoLike = {
  question_data?: {
    instruction?: string;
    text_fragment?: string;
    options?: { id: string; text: string; is_correct: boolean }[];
  };
  meta?: { sources?: { tier?: string }[] };
};

function findSlide(slides: SlideLike[], type: string): SlideLike | undefined {
  return slides.find((s) => s.type === type);
}

function slideText(slides: SlideLike[]): string {
  return JSON.stringify(slides).toLowerCase();
}

function collectStrings(node: unknown): string {
  if (typeof node === 'string') return node + ' ';
  if (Array.isArray(node)) return node.map(collectStrings).join('');
  if (node && typeof node === 'object') {
    return Object.values(node as Record<string, unknown>).map(collectStrings).join('');
  }
  return '';
}

export function lintFamilyAlignment(
  family: FamilyId,
  q: QuestaoLike,
  slides: SlideLike[],
): AlignmentIssue[] {
  const issues: AlignmentIssue[] = [];
  const fullText = slideText(slides);
  const concept = findSlide(slides, 'concept_map');
  const golden = findSlide(slides, 'golden_rule');
  const logic = findSlide(slides, 'logic_flow');
  const danger = findSlide(slides, 'danger_zone');

  switch (family) {
    case 'vf': {
      const hasRoman =
        /julgar\s+i\b|afirmativa\s+i\b|\bi\s*[-–:]/.test(fullText) ||
        /\bii\b|\biii\b|\biv\b/.test(fullText);
      if (!hasRoman) {
        issues.push({
          code: 'align_vf_roman',
          message: 'Família vf: slides devem referenciar afirmativas I–III/IV.',
          severity: 'error',
        });
      }
      const rows = Array.isArray(golden?.rows) ? golden!.rows : [];
      const items = Array.isArray(concept?.items) ? concept!.items : [];
      if (rows.length < 3 && items.length < 3) {
        issues.push({
          code: 'align_vf_density',
          message: 'Família vf: golden_rule.rows ≥3 ou concept_map.items ≥3.',
          severity: 'error',
        });
      }
      const steps = Array.isArray(logic?.steps) ? logic!.steps : [];
      if (steps.length < 4) {
        issues.push({
          code: 'align_vf_steps',
          message: 'Família vf: logic_flow deve ter ≥4 steps.',
          severity: 'error',
        });
      }
      break;
    }

    case 'certo_errado': {
      const dzItems = Array.isArray(danger?.items) ? (danger!.items as { correct?: string }[]) : [];
      const hasMcqLetters = dzItems.some((i) =>
        /\bgabarito\s+letra\s+[a-e]\b/i.test(i.correct ?? ''),
      );
      if (hasMcqLetters) {
        issues.push({
          code: 'align_ce_no_mcq_letters',
          message: 'Certo/Errado: danger_zone não deve usar gabarito letra A–E (MCQ).',
          severity: 'error',
        });
      }
      break;
    }

    case 'legis': {
      const tierA = (q.meta?.sources ?? []).some((s) => s.tier === 'A');
      if (!tierA) {
        issues.push({
          code: 'align_legis_tier_a',
          message: 'Família legis: meta.sources deve incluir tier A.',
          severity: 'warn',
        });
      }
      const inst = q.question_data?.instruction ?? '';
      const lawRef = inst.match(/\b(?:lei|decreto|resolu[cç][aã]o|rdc|portaria)\s*(?:n[ºo°.]?\s*)?[\d./-]+/i);
      if (lawRef) {
        const ref = lawRef[0].toLowerCase().replace(/\s+/g, ' ');
        if (!fullText.includes(ref.split(' ').slice(-1)[0] ?? '')) {
          issues.push({
            code: 'align_legis_device',
            message: `Dispositivo citado no enunciado (${lawRef[0]}) não aparece nos slides.`,
            severity: 'warn',
          });
        }
      }
      break;
    }

    case 'protocolo': {
      const rows = Array.isArray(golden?.rows) ? golden!.rows : [];
      if (rows.length === 0) {
        issues.push({
          code: 'align_protocolo_rows',
          message: 'Família protocolo: preferir golden_rule.rows com parâmetros.',
          severity: 'warn',
        });
      }
      break;
    }

    case 'calc': {
      const inst = q.question_data?.instruction ?? '';
      const units = inst.match(/\b(mg|ml|mcg|g\b|kg|%|gotas?|ampolas?)\b/gi) ?? [];
      const logicText = collectStrings(logic).toLowerCase();
      for (const u of [...new Set(units.map((x) => x.toLowerCase()))]) {
        if (!logicText.includes(u)) {
          issues.push({
            code: 'align_calc_units',
            message: `Unidade "${u}" do enunciado ausente em logic_flow.`,
            severity: 'error',
          });
        }
      }
      const steps = Array.isArray(logic?.steps) ? logic!.steps : [];
      const hasCalcStep = steps.some(
        (s) => typeof s === 'string' && /\d|calcular|dose|infus/i.test(s),
      );
      if (!hasCalcStep) {
        issues.push({
          code: 'align_calc_steps',
          message: 'Família calc: logic_flow deve incluir passos de cálculo.',
          severity: 'error',
        });
      }
      break;
    }

    case 'conceito': {
      const items = Array.isArray(concept?.items) ? concept!.items : [];
      if (items.length < 3) {
        issues.push({
          code: 'align_conceito_items',
          message: 'Família conceito: concept_map deve ter ≥3 items.',
          severity: 'error',
        });
      }
      break;
    }

    case 'text_fragment': {
      const fragment = q.question_data?.text_fragment ?? '';
      if (fragment.trim().length > 80) {
        const tokens = fragment
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .split(/[^a-z0-9]+/)
          .filter((w) => w.length >= 6)
          .slice(0, 10);
        const present = tokens.filter((t) => fullText.includes(t)).length;
        if (present < Math.min(2, tokens.length)) {
          issues.push({
            code: 'align_text_fragment_terms',
            message: 'text_fragment: termos do caso clínico devem aparecer nos slides.',
            severity: 'error',
          });
        }
      }
      break;
    }
  }

  return issues;
}
