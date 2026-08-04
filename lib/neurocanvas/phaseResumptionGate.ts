/**
 * F6 — condição explícita de retorno do NeuroCanvas.
 *
 * O plano estaciona duas frentes com condição de retorno declarada, e este módulo
 * transforma essa condição em verificação:
 *
 * - **Fase 0B** (cache por `questionHash` + baseline completa) volta quando o conteúdo
 *   estiver estável (pós-F3) **e** a proveniência estiver decidida (F5). Construir a
 *   baseline antes disso é pagar duas vezes: cada reparo de F3 reescreve `detail`/`steps`
 *   e muda o hash da questão.
 * - **Fase 2** (composições visuais) volta com o gate pedagógico verde e os blockers
 *   editoriais decididos — antes disso seria apresentação mais bonita de conteúdo que
 *   entrega o gabarito no slide 1.
 *
 * Dois sinais, ambos lidos de artefatos já produzidos pelas fases anteriores — este
 * módulo não mede nada por conta própria:
 *
 * | Sinal | Origem | Artefato |
 * |---|---|---|
 * | Proveniência decidida | F5 (decisão do fundador) | `artifacts/neurocanvas-f5-provenance-decision.json` |
 * | Conteúdo estável | F2b/F3/F4 | `artifacts/blind-reader-gate.json` |
 *
 * Os blockers de catálogo (unresolved, S3, live) continuam em `phaseReadiness.ts`:
 * aqui só entram os sinais de F5/F6, para as duas listas não repetirem a mesma frase.
 *
 * @see lib/neurocanvas/phaseReadiness.ts — compõe estes blockers com os de G0.2
 * @see lib/catalogMigration/pedagogyGate.ts — o mesmo artefato decide `production_ready` (F4)
 * @see scripts/audit-neurocanvas-phase-gate.ts
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { BLIND_READER_ARTIFACT } from '@/lib/catalogMigration/pedagogyGate';

/** Saída da F5 — decisão de proveniência do fundador. */
export const PROVENANCE_DECISION_ARTIFACT = 'artifacts/neurocanvas-f5-provenance-decision.json';

/** Único `status` de F5 que libera o retorno; qualquer outro é decisão pendente. */
export const PROVENANCE_DECIDED_STATUS = 'decided';

/**
 * O cache de Fase 0B indexa o catálogo inteiro. Medir estabilidade só nas âncoras de
 * `examples/` responde outra pergunta (a das fontes de estilo), então não serve de base.
 */
export const REQUIRED_STABILITY_CORPUS = 'catalog';

export type ProvenanceDecisionSignal = {
  present: boolean;
  status: string | null;
  decisions_required: string[];
  decisions_taken: string[];
  /** `phase_0b_ready` declarado pela própria F5 — vale só para a Fase 0B. */
  phase_0b_ready: boolean;
  unresolved: number | null;
  s3_count: number | null;
};

export type ContentStabilitySignal = {
  present: boolean;
  corpus: string | null;
  measured_at: string | null;
  total: number;
  judged: number;
  /** `fail_leak` do leitor cego — concept_map entregando o gabarito. */
  blocking: number;
  pedagogy_total: number;
  pedagogy_fail: number;
  pedagogy_warn: number;
};

export function missingProvenanceSignal(): ProvenanceDecisionSignal {
  return {
    present: false,
    status: null,
    decisions_required: [],
    decisions_taken: [],
    phase_0b_ready: false,
    unresolved: null,
    s3_count: null,
  };
}

export function missingContentSignal(): ContentStabilitySignal {
  return {
    present: false,
    corpus: null,
    measured_at: null,
    total: 0,
    judged: 0,
    blocking: 0,
    pedagogy_total: 0,
    pedagogy_fail: 0,
    pedagogy_warn: 0,
  };
}

function readJsonArtifact(artifactPath: string): Record<string, unknown> | null {
  const path = resolve(process.cwd(), artifactPath);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Artefato ausente ou ilegível vira "sem decisão" — nunca libera por omissão. */
export function loadProvenanceDecision(
  artifactPath = PROVENANCE_DECISION_ARTIFACT,
): ProvenanceDecisionSignal {
  const raw = readJsonArtifact(artifactPath);
  if (!raw) return missingProvenanceSignal();

  const catalog = (raw.catalog ?? {}) as Record<string, unknown>;
  const severity = (raw.severity ?? {}) as Record<string, unknown>;

  return {
    present: true,
    status: typeof raw.status === 'string' ? raw.status : null,
    decisions_required: stringList(raw.decisions_required),
    decisions_taken: stringList(raw.decisions_taken),
    phase_0b_ready: raw.phase_0b_ready === true,
    unresolved: finiteNumber(catalog.unresolved),
    s3_count: finiteNumber(severity.S3),
  };
}

/** Lê a última rodada do leitor cego (F2b) com as notas pedagógicas anexadas (F4). */
export function loadContentStability(artifactPath = BLIND_READER_ARTIFACT): ContentStabilitySignal {
  const raw = readJsonArtifact(artifactPath);
  if (!raw) return missingContentSignal();

  const pedagogy = (raw.pedagogical_summary ?? {}) as Record<string, unknown>;

  return {
    present: true,
    corpus: typeof raw.corpus === 'string' ? raw.corpus : null,
    measured_at: typeof raw.generated_at === 'string' ? raw.generated_at : null,
    total: finiteNumber(raw.total) ?? 0,
    judged: finiteNumber(raw.judged) ?? 0,
    blocking: finiteNumber(raw.blocking) ?? 0,
    pedagogy_total: finiteNumber(pedagogy.total) ?? 0,
    pedagogy_fail: finiteNumber(pedagogy.fail) ?? 0,
    pedagogy_warn: finiteNumber(pedagogy.warn) ?? 0,
  };
}

/** Decisões listadas em `decisions_required` que ainda não aparecem em `decisions_taken`. */
export function pendingProvenanceDecisions(signal: ProvenanceDecisionSignal): string[] {
  const taken = new Set(signal.decisions_taken);
  return signal.decisions_required.filter((d) => !taken.has(d));
}

/** Blockers da decisão editorial (F5) — comuns às duas fases estacionadas. */
export function provenanceBlockers(signal: ProvenanceDecisionSignal): string[] {
  if (!signal.present) {
    return [`F5 ausente (${PROVENANCE_DECISION_ARTIFACT}) — proveniência não decidida.`];
  }

  const blockers: string[] = [];
  if (signal.status !== PROVENANCE_DECIDED_STATUS) {
    blockers.push(`F5 status=${signal.status ?? 'desconhecido'} — decisão do fundador pendente.`);
  }
  const pending = pendingProvenanceDecisions(signal);
  if (pending.length > 0) {
    blockers.push(`F5: ${pending.length} decisão(ões) sem registro — ${pending.join(', ')}.`);
  }
  return blockers;
}

/** Blockers de estabilidade de conteúdo (F2b/F3/F4) — comuns às duas fases estacionadas. */
export function contentStabilityBlockers(signal: ContentStabilitySignal): string[] {
  if (!signal.present) {
    return [
      `Estabilidade de conteúdo não medida (${BLIND_READER_ARTIFACT} ausente) — ` +
        'rodar npm run audit:blind-reader -- --catalog.',
    ];
  }

  const blockers: string[] = [];
  if (signal.corpus !== REQUIRED_STABILITY_CORPUS) {
    blockers.push(
      `Estabilidade medida em corpus=${signal.corpus ?? 'desconhecido'} — ` +
        `F6 exige corpus=${REQUIRED_STABILITY_CORPUS} (o cache da Fase 0B indexa o catálogo inteiro).`,
    );
  }
  if (signal.blocking > 0) {
    blockers.push(`${signal.blocking} slug(s) com fail_leak no leitor cego — repair F3 pendente.`);
  }
  if (signal.pedagogy_fail > 0) {
    blockers.push(`${signal.pedagogy_fail} slug(s) com fail pedagógico — repair F3 pendente.`);
  }
  return blockers;
}

export type PhaseResumption = {
  resumable: boolean;
  blockers: string[];
};

export type PhaseResumptionGate = {
  gate: 'F6';
  provenance: ProvenanceDecisionSignal;
  content: ContentStabilitySignal;
  phase_0b: PhaseResumption;
  phase_2: PhaseResumption;
};

/**
 * Combina os dois sinais nas condições de retorno de cada fase.
 *
 * Fase 0B soma um requisito próprio: a F5 precisa declarar `phase_0b_ready`. A Fase 2
 * não depende desse flag — depende do gate pedagógico verde e da decisão editorial,
 * que é exatamente o que os dois blocos comuns medem.
 */
export function evaluatePhaseResumption(input: {
  provenance: ProvenanceDecisionSignal;
  content: ContentStabilitySignal;
}): PhaseResumptionGate {
  const { provenance, content } = input;

  const shared = [...provenanceBlockers(provenance), ...contentStabilityBlockers(content)];

  const phase0bBlockers = [...shared];
  if (provenance.present && !provenance.phase_0b_ready) {
    phase0bBlockers.push('F5 declara phase_0b_ready=false — fechamento editorial não concluído.');
  }

  return {
    gate: 'F6',
    provenance,
    content,
    phase_0b: { resumable: phase0bBlockers.length === 0, blockers: phase0bBlockers },
    phase_2: { resumable: shared.length === 0, blockers: [...shared] },
  };
}

/** Lê os dois artefatos e avalia — atalho usado por `phaseReadiness` e pela CLI. */
export function loadPhaseResumptionGate(paths?: {
  provenance?: string;
  content?: string;
}): PhaseResumptionGate {
  return evaluatePhaseResumption({
    provenance: loadProvenanceDecision(paths?.provenance ?? PROVENANCE_DECISION_ARTIFACT),
    content: loadContentStability(paths?.content ?? BLIND_READER_ARTIFACT),
  });
}

export function renderPhaseResumptionMarkdown(gate: PhaseResumptionGate): string {
  const renderPhase = (name: string, phase: PhaseResumption) =>
    [
      `### ${name}`,
      '',
      `**Retomar: ${phase.resumable ? 'sim' : 'não'}**`,
      '',
      phase.blockers.length
        ? phase.blockers.map((b) => `- ${b}`).join('\n')
        : 'Sem blockers de F6.',
      '',
    ].join('\n');

  const { provenance, content } = gate;

  return [
    '# NeuroCanvas — condição de retorno (F6)',
    '',
    '## Sinais',
    '',
    '| sinal | origem | valor |',
    '|---|---|---|',
    `| Proveniência decidida | \`${PROVENANCE_DECISION_ARTIFACT}\` | ${
      provenance.present ? `status=${provenance.status ?? 'n/d'} · phase_0b_ready=${provenance.phase_0b_ready}` : 'ausente'
    } |`,
    `| Conteúdo estável | \`${BLIND_READER_ARTIFACT}\` | ${
      content.present
        ? `corpus=${content.corpus ?? 'n/d'} · julgadas=${content.judged} · fail_leak=${content.blocking} · fail pedagógico=${content.pedagogy_fail}`
        : 'ausente'
    } |`,
    '',
    '## Fases estacionadas',
    '',
    renderPhase('Fase 0B — cache por questionHash + baseline', gate.phase_0b),
    renderPhase('Fase 2 — composições visuais', gate.phase_2),
  ].join('\n');
}
