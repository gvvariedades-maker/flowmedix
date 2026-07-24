/**
 * Prompts curtos por unidade — evitar anexar o pipeline completo em cada run.
 * Usado por `pipeline:next-unit --print-prompt`, programa IDE e (opcional) SDK.
 * @see docs/PIPELINE_ORCHESTRATOR.md
 * @see docs/PROMPT_PROGRAMA_COMPLETO_IDE.md
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { PipelineRunState, PipelineUnit } from '@/lib/catalogMigration/pipelineRunState';
import {
  loadHandcraftPlaybook,
  resolveRegistryPackage,
  type HandcraftPlaybook,
  type HandcraftRegistryPackage,
} from '@/lib/catalogMigration/handcraftPlaybook';

export type WorkerPromptOptions = {
  /** Autoriza apply após dry-run 100% OK nesta unidade. Default false. */
  autoApply?: boolean;
  /** Inclui Playwright visual-mold no ship. */
  includeVisualMolds?: boolean;
};

type PlaybookEstudoAtivo = {
  worker_checklist?: string[];
};

type PlaybookWithExtras = HandcraftPlaybook & {
  skills?: string[];
  disciplina?: string;
  estudo_ativo?: PlaybookEstudoAtivo;
};

const TE_HANDCRAFT_SKILLS = [
  '@.cursor/skills/avant-golden-anchor-handcraft/SKILL.md',
  '@.cursor/skills/avant-json-template/SKILL.md',
  '@.cursor/skills/professor-para-concurso/SKILL.md',
] as const;

const PT_HANDCRAFT_SKILLS = [
  '@.cursor/skills/avant-golden-anchor-handcraft/SKILL.md',
  '@.cursor/skills/avant-json-template/SKILL.md',
  '@.cursor/skills/professor-elias-santana-metodo/SKILL.md',
  '@.cursor/skills/professor-lingua-portuguesa-concurso/SKILL.md',
] as const;

function resolvePlaybookContext(state: PipelineRunState): {
  pkg: HandcraftRegistryPackage | null;
  playbook: PlaybookWithExtras | null;
  playbookAtRef: string;
} {
  const resolved = resolveRegistryPackage(state.subtopico);
  const pkg = (resolved?.pkg ?? null) as HandcraftRegistryPackage | null;
  const playbook = loadHandcraftPlaybook(state.subtopico, pkg) as PlaybookWithExtras | null;

  const explicit = pkg?.handcraft_playbook?.trim();
  const playbookAtRef = explicit
    ? `@${explicit.replace(/\\/g, '/')}`
    : `@data/catalog-migration/handcraft-playbooks/${state.pacote_prefix}.json`;

  return { pkg, playbook, playbookAtRef };
}

function loadEstudoAtivoChecklist(playbook: PlaybookWithExtras | null, playbookAtRef: string): string[] {
  const fromLoaded = playbook?.estudo_ativo?.worker_checklist;
  if (Array.isArray(fromLoaded) && fromLoaded.length > 0) {
    return fromLoaded.filter((s) => typeof s === 'string' && s.trim());
  }

  // Fallback: ler o path do @ref se o tipo em memória não tiver estudo_ativo
  const rel = playbookAtRef.replace(/^@/, '');
  const abs = resolve(process.cwd(), rel);
  if (!existsSync(abs)) return [];
  try {
    const raw = JSON.parse(readFileSync(abs, 'utf8')) as PlaybookWithExtras;
    const list = raw.estudo_ativo?.worker_checklist;
    return Array.isArray(list) ? list.filter((s) => typeof s === 'string' && s.trim()) : [];
  } catch {
    return [];
  }
}

function isLinguaPortuguesaContext(
  state: PipelineRunState,
  playbook: PlaybookWithExtras | null,
  playbookAtRef: string,
): boolean {
  if (playbook?.disciplina === 'Conhecimentos Básicos') return true;
  if (playbookAtRef.includes('lingua-portuguesa')) return true;
  if (/l[ií]ngua portuguesa/i.test(state.subtopico)) return true;
  if (playbook?.subtopico && /l[ií]ngua portuguesa/i.test(playbook.subtopico)) return true;
  // Cards PT no registry compartilham playbook lingua-portuguesa
  if (playbook?.pacote_prefix === 'lingua-portuguesa') return true;
  return false;
}

function skillsForHandcraft(
  state: PipelineRunState,
  playbook: PlaybookWithExtras | null,
  playbookAtRef: string,
): string[] {
  const fromPlaybook = playbook?.skills;
  if (Array.isArray(fromPlaybook) && fromPlaybook.length > 0) {
    return fromPlaybook.map((s) => (s.startsWith('@') ? s : `@${s.replace(/\\/g, '/')}`));
  }
  return isLinguaPortuguesaContext(state, playbook, playbookAtRef)
    ? [...PT_HANDCRAFT_SKILLS]
    : [...TE_HANDCRAFT_SKILLS];
}

function briefSkillForL3(
  state: PipelineRunState,
  playbook: PlaybookWithExtras | null,
  playbookAtRef: string,
): string {
  return isLinguaPortuguesaContext(state, playbook, playbookAtRef)
    ? '@.cursor/skills/brief-lingua-portuguesa/SKILL.md'
    : '@.cursor/skills/brief-enfermagem/SKILL.md';
}

export function buildWorkerPrompt(
  state: PipelineRunState,
  unit: PipelineUnit,
  options: WorkerPromptOptions = {},
): string {
  const runStateRef = `@artifacts/pipeline-run-state-${state.pacote_prefix}.json`;
  const { playbook, playbookAtRef } = resolvePlaybookContext(state);
  const autoApply = options.autoApply === true;

  const common = [
    `Continuar programa: ${state.subtopico}`,
    `(alias aceito: Continuar pipeline: ${state.subtopico})`,
    `pacote_prefix: ${state.pacote_prefix}`,
    `Unidade ÚNICA desta sessão: ${unit.type}:${unit.id}`,
    `Ler obrigatório: ${runStateRef}`,
    `Registry: @data/catalog-migration/handcraft-registry.json`,
    `Playbook: ${playbookAtRef}`,
    '',
    'CONTRATO:',
    '- Execute SOMENTE esta unidade. Não inicie g(N+1) nem segundo molde.',
    '- Edite arquivos no disco; não cole JSONs inteiros no chat.',
    '- Ao terminar: atualize o run-state (completed_units + next via npm run pipeline:next-unit) e STOP + HANDOFF.',
    '- Proibido: ai:generate, catalog:upgrade-premium, pipeline:orchestrate --sdk neste handoff IDE.',
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
        'Docs: @docs/TAXONOMIA_CONVERSA.md @docs/PROMPT_PROGRAMA_COMPLETO_IDE.md',
        `Detail: ${unit.detail ?? ''}`,
      ].join('\n');

    case 'l3_map':
      return [
        ...common,
        `Mapeamento L3: ${state.subtopico}`,
        'Docs: @docs/L3_MAPEAMENTO_CONVERSA.md @docs/RAMO_FORTE_QUICK_REF.md @docs/PROMPT_PROGRAMA_COMPLETO_IDE.md',
        `Skill brief: ${briefSkillForL3(state, playbook, playbookAtRef)}`,
        'Skill visual: @.cursor/skills/avant-neuroslides-visual/SKILL.md',
        `Gerar briefs 4/4 + INDEX; APÓS cada brief de ramo forte: neuroslides-visual (gesto no brief).`,
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
      const estudoChecklist = loadEstudoAtivoChecklist(playbook, playbookAtRef);
      const skills = skillsForHandcraft(state, playbook, playbookAtRef);
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
        `Skills: ${skills.join(' ')}`,
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
        'Docs: @docs/QUALITY_VENDAVEL_CONVERSA.md @docs/QUALITY_LAYERS_MODEL.md @docs/PROGRAMA_COMPLETO_IDE_DOD.md',
        `npm run reconcile:handcraft-manifest -- --subtopico="${state.subtopico}"`,
        'preflight todos g* · handcraft-dod · slug-alignment --strict · numeric-factcheck',
        'L6 anchor-review por lote · captures',
        options.includeVisualMolds !== false
          ? 'npx playwright test e2e/visual-mold-regression.spec.ts'
          : '',
        `npm run audit:subtopico-quality -- --subtopico="${state.subtopico}" --promote`,
        `Relatório: artifacts/${state.pacote_prefix}-nota10-report.md (template docs/_TEMPLATE-nota10-report.md)`,
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
