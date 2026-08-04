import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  contentStabilityBlockers,
  evaluatePhaseResumption,
  loadContentStability,
  loadProvenanceDecision,
  missingContentSignal,
  missingProvenanceSignal,
  pendingProvenanceDecisions,
  provenanceBlockers,
  renderPhaseResumptionMarkdown,
  type ContentStabilitySignal,
  type ProvenanceDecisionSignal,
} from '@/lib/neurocanvas/phaseResumptionGate';

const decidedProvenance = (
  overrides: Partial<ProvenanceDecisionSignal> = {},
): ProvenanceDecisionSignal => ({
  present: true,
  status: 'decided',
  decisions_required: ['D1', 'D2'],
  decisions_taken: ['D1', 'D2'],
  phase_0b_ready: true,
  unresolved: 0,
  s3_count: 0,
  ...overrides,
});

const stableContent = (overrides: Partial<ContentStabilitySignal> = {}): ContentStabilitySignal => ({
  present: true,
  corpus: 'catalog',
  measured_at: '2026-07-31T00:00:00.000Z',
  total: 5651,
  judged: 5600,
  blocking: 0,
  pedagogy_total: 5651,
  pedagogy_fail: 0,
  pedagogy_warn: 12,
  ...overrides,
});

function writeTempJson(name: string, payload: unknown): string {
  const dir = mkdtempSync(join(tmpdir(), 'phase-resumption-'));
  const path = join(dir, name);
  writeFileSync(path, JSON.stringify(payload), 'utf8');
  return path;
}

describe('provenanceBlockers', () => {
  it('bloqueia quando a decisão de F5 não existe', () => {
    const blockers = provenanceBlockers(missingProvenanceSignal());
    expect(blockers).toHaveLength(1);
    expect(blockers[0]).toContain('F5 ausente');
  });

  it('bloqueia enquanto o fundador não decide', () => {
    const blockers = provenanceBlockers(
      decidedProvenance({ status: 'awaiting_founder_decision', decisions_taken: [] }),
    );
    expect(blockers.join(' ')).toContain('awaiting_founder_decision');
    expect(blockers.join(' ')).toContain('D1, D2');
  });

  it('libera com status decidido e todas as decisões registradas', () => {
    expect(provenanceBlockers(decidedProvenance())).toEqual([]);
    expect(pendingProvenanceDecisions(decidedProvenance())).toEqual([]);
  });
});

describe('contentStabilityBlockers', () => {
  it('bloqueia quando o leitor cego nunca rodou', () => {
    expect(contentStabilityBlockers(missingContentSignal())[0]).toContain('não medida');
  });

  it('não aceita estabilidade medida só nas âncoras', () => {
    const blockers = contentStabilityBlockers(stableContent({ corpus: 'examples' }));
    expect(blockers.join(' ')).toContain('corpus=examples');
  });

  it('bloqueia com fail_leak ou fail pedagógico pendente', () => {
    expect(contentStabilityBlockers(stableContent({ blocking: 3 })).join(' ')).toContain('fail_leak');
    expect(contentStabilityBlockers(stableContent({ pedagogy_fail: 7 })).join(' ')).toContain(
      'fail pedagógico',
    );
  });

  it('libera com catálogo medido e zero fail', () => {
    expect(contentStabilityBlockers(stableContent())).toEqual([]);
  });
});

describe('evaluatePhaseResumption', () => {
  it('mantém as duas fases estacionadas sem nenhum dos sinais', () => {
    const gate = evaluatePhaseResumption({
      provenance: missingProvenanceSignal(),
      content: missingContentSignal(),
    });
    expect(gate.phase_0b.resumable).toBe(false);
    expect(gate.phase_2.resumable).toBe(false);
  });

  it('libera a Fase 2 mas não a 0B quando F5 ainda não fechou o editorial', () => {
    const gate = evaluatePhaseResumption({
      provenance: decidedProvenance({ phase_0b_ready: false }),
      content: stableContent(),
    });
    expect(gate.phase_2.resumable).toBe(true);
    expect(gate.phase_0b.resumable).toBe(false);
    expect(gate.phase_0b.blockers.join(' ')).toContain('phase_0b_ready=false');
  });

  it('libera as duas com proveniência decidida e conteúdo estável', () => {
    const gate = evaluatePhaseResumption({
      provenance: decidedProvenance(),
      content: stableContent(),
    });
    expect(gate.phase_0b).toEqual({ resumable: true, blockers: [] });
    expect(gate.phase_2).toEqual({ resumable: true, blockers: [] });
  });

  it('conteúdo instável barra a Fase 2 mesmo com proveniência decidida', () => {
    const gate = evaluatePhaseResumption({
      provenance: decidedProvenance(),
      content: stableContent({ blocking: 2 }),
    });
    expect(gate.phase_2.resumable).toBe(false);
  });
});

describe('loaders', () => {
  it('lê o artefato de F5 no formato produzido pela decisão de proveniência', () => {
    const path = writeTempJson('f5.json', {
      gate: 'F5',
      status: 'awaiting_founder_decision',
      catalog: { unresolved: 342 },
      severity: { S3: 6 },
      decisions_required: ['D1', 'D2', 'D3'],
      phase_0b_ready: false,
    });

    const signal = loadProvenanceDecision(path);
    expect(signal.present).toBe(true);
    expect(signal.status).toBe('awaiting_founder_decision');
    expect(signal.unresolved).toBe(342);
    expect(signal.s3_count).toBe(6);
    expect(signal.phase_0b_ready).toBe(false);
  });

  it('lê o artefato do leitor cego com o resumo pedagógico anexado', () => {
    const path = writeTempJson('blind.json', {
      corpus: 'catalog',
      generated_at: '2026-07-31T00:00:00.000Z',
      total: 100,
      judged: 92,
      blocking: 4,
      pedagogical_summary: { total: 100, fail: 4, warn: 9, pass: 87, avg_score: 91.2 },
    });

    const signal = loadContentStability(path);
    expect(signal.corpus).toBe('catalog');
    expect(signal.blocking).toBe(4);
    expect(signal.pedagogy_fail).toBe(4);
  });

  it('artefato ausente ou ilegível nunca libera por omissão', () => {
    expect(loadProvenanceDecision('artifacts/__inexistente__.json').present).toBe(false);
    const broken = writeTempJson('broken.json', {});
    writeFileSync(broken, '{ nao é json', 'utf8');
    expect(loadContentStability(broken).present).toBe(false);
  });
});

describe('renderPhaseResumptionMarkdown', () => {
  it('mostra os dois sinais e o veredito de cada fase', () => {
    const md = renderPhaseResumptionMarkdown(
      evaluatePhaseResumption({
        provenance: decidedProvenance({ status: 'awaiting_founder_decision' }),
        content: stableContent(),
      }),
    );
    expect(md).toContain('condição de retorno (F6)');
    expect(md).toContain('awaiting_founder_decision');
    expect(md).toContain('Fase 0B');
    expect(md).toContain('Fase 2');
  });
});
