/**
 * Prompts curtos por unidade — evitar anexar o pipeline completo em cada run SDK.
 * @see docs/PIPELINE_ORCHESTRATOR.md
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { PipelineRunState, PipelineUnit } from '@/lib/catalogMigration/pipelineRunState';

export type WorkerPromptOptions = {
  /** Autoriza apply após dry-run 100% OK nesta unidade. Default false. */
  autoApply?: boolean;
  /** Inclui Playwright visual-mold no ship. */
  includeVisualMolds?: boolean;
};

type PlaybookEstudoAtivo = {
  worker_checklist?: string[];
};

function loadEstudoAtivoChecklist(pacotePrefix: string): string[] {
  const path = join(
    process.cwd(),
    'data/catalog-migration/handcraft-playbooks',
    `${pacotePrefix}.json`,
  );
  if (!existsSync(path)) return [];
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as {
      estudo_ativo?: PlaybookEstudoAtivo;
    };
    const list = raw.estudo_ativo?.worker_checklist;
    return Array.isArray(list) ? list.filter((s) => typeof s === 'string' && s.trim()) : [];
  } catch {
    return [];
  }
}

export function buildWorkerPrompt(
  state: PipelineRunState,
  unit: PipelineUnit,
  options: WorkerPromptOptions = {},
): string {
  const runStateRef = `@artifacts/pipeline-run-state-${state.pacote_prefix}.json`;
  const playbookRef = `@data/catalog-migration/handcraft-playbooks/${state.pacote_prefix}.json`;
  const autoApply = options.autoApply === true;

  const common = [
    `Continuar pipeline: ${state.subtopico}`,
    `pacote_prefix: ${state.pacote_prefix}`,
    `Unidade ÚNICA desta sessão: ${unit.type}:${unit.id}`,
    `Ler obrigatório: ${runStateRef}`,
    `Registry: @data/catalog-migration/handcraft-registry.json`,
    '',
    'CONTRATO:',
    '- Execute SOMENTE esta unidade. Não inicie g(N+1) nem segundo molde.',
    '- Edite arquivos no disco; não cole JSONs inteiros no chat.',
    '- Ao terminar: atualize o run-state (completed_units + next via npm run pipeline:next-unit) e STOP.',
    '- Proibido: ai:generate, catalog:upgrade-premium.',
    autoApply
      ? '- Apply: dry-run 100% OK → catalog:apply-lote --apply autorizado NESTA unidade.'
      : '- Apply: NÃO --apply (só dry-run). Usuário autoriza depois.',
    '',
  ];

  switch (unit.type) {
    case 'bootstrap':
      return [
        ...common,
        'TAREFA: bootstrap do pacote no registry (Classify + inventory + taxonomy-gate + export se necessário).',
        'Docs: @docs/TAXONOMIA_CONVERSA.md',
        `Detail: ${unit.detail ?? ''}`,
      ].join('\n');

    case 'l3_map':
      return [
        ...common,
        `Mapeamento L3: ${state.subtopico}`,
        'Docs: @docs/L3_MAPEAMENTO_CONVERSA.md @docs/RAMO_FORTE_QUICK_REF.md',
        'Skill: @.cursor/skills/brief-enfermagem/SKILL.md',
        `Gerar artifacts/l3-brief-${state.pacote_prefix}-INDEX.md + briefs 4/4 por ramo forte.`,
        `npm run audit:l3-mold-gap -- --subtopico="${state.subtopico}"`,
        `Detail: ${unit.detail ?? ''}`,
      ].join('\n');

    case 'mold_branch':
      return [
        ...common,
        `Implementar molde: ${unit.branch_id ?? unit.id}`,
        'Docs: @docs/VARIANT_MOLDS.md @docs/PROMPT_VARIANTES_NEUROSLIDES.md',
        'Skill: @.cursor/skills/avant-neuroslides-visual/SKILL.md',
        `Brief: @artifacts/l3-brief-${state.pacote_prefix}-${unit.branch_id ?? unit.id}.md`,
        'GATE: Playwright do ramo PASS (desktop + mobile-375).',
        `Detail: ${unit.detail ?? ''}`,
      ].join('\n');

    case 'handcraft_lote': {
      const lote = unit.lote ?? unit.id;
      const estudoChecklist = loadEstudoAtivoChecklist(state.pacote_prefix);
      const estudoBlock =
        estudoChecklist.length > 0
          ? [
              '',
              'ESTUDO ATIVO (playbook.estudo_ativo) — obrigatório em conteúdo novo:',
              ...estudoChecklist.map((line) => `- ${line}`),
            ]
          : [
              '',
              'ESTUDO ATIVO (mínimo): danger_zone com Transferência + correct classificável;',
              'logic_flow reveal_mode tap + Em similares: no último step. Ver playbook se existir estudo_ativo.',
            ];

      return [
        ...common,
        `Handcraft golden-v1 — lote ${lote} somente.`,
        `Playbook (se existir): ${playbookRef}`,
        'Skills: @.cursor/skills/avant-golden-anchor-handcraft/SKILL.md @.cursor/skills/avant-json-template/SKILL.md @.cursor/skills/professor-para-concurso/SKILL.md',
        'Contrato slides v2: concept_map → logic_flow (reveal_mode tap) → golden_rule → danger_zone.',
        ...estudoBlock,
        'Gates obrigatórios ao fechar o lote:',
        `  npm run audit:questao-readiness -- --lote=${lote} --strict-v2-pedagogy`,
        `  npm run validate:goldens -- --lote=${lote} --strict`,
        `  npm run catalog:preflight -- --lote=${lote} --strict-v2-pedagogy`,
        `  npm run catalog:apply-lote -- --lote=${lote} --dry-run`,
        autoApply ? `  npm run catalog:apply-lote -- --lote=${lote} --apply` : '',
        'Atualizar lote-meta.json status=applied após apply OK; incrementar handcraft_applied no registry.',
        `Detail: ${unit.detail ?? ''}`,
      ]
        .filter(Boolean)
        .join('\n');
    }

    case 'ship':
      return [
        ...common,
        `Qualidade vendável: ${state.subtopico}`,
        'Docs: @docs/QUALITY_VENDAVEL_CONVERSA.md @docs/QUALITY_LAYERS_MODEL.md',
        `npm run reconcile:handcraft-manifest -- --subtopico="${state.subtopico}"`,
        'preflight todos g* · handcraft-dod · slug-alignment --strict · numeric-factcheck',
        'L6 anchor-review por lote · captures',
        options.includeVisualMolds !== false
          ? 'npx playwright test e2e/visual-mold-regression.spec.ts'
          : '',
        `npm run audit:subtopico-quality -- --subtopico="${state.subtopico}" --promote`,
        `Detail: ${unit.detail ?? ''}`,
      ]
        .filter(Boolean)
        .join('\n');

    case 'done':
      return [
        `Pipeline ${state.subtopico}: DONE.`,
        unit.detail ?? '',
        'Opcional: npm run audit:subtopico-health',
      ].join('\n');

    case 'blocked':
      return [
        `Pipeline ${state.subtopico}: BLOCKED.`,
        `Blockers: ${(unit.detail ?? state.blockers.join('; ')) || '—'}`,
        'Corrija blockers e rode npm run pipeline:next-unit de novo.',
      ].join('\n');

    default:
      return [...common, `Unidade: ${unit.type}:${unit.id}`, unit.detail ?? ''].join('\n');
  }
}
