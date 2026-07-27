/**
 * Taxonomia pura do Evidence Engine — Fase 2 (piloto PT).
 * Âncoras: docs/DECISAO_EVIDENCE_ENGINE.md §5–§6; docs/EVIDENCE_FASE2_PILOTO_PT.md.
 *
 * Estrutura obrigatória (§5):
 *   disciplina → subtopico → cluster de conhecimento → skill_id → misconception
 *
 * Regra (§5): `skill_id` só é criado quando há inventário suficiente para medir
 * a competência (múltiplas questões elegíveis a ensino, T1 e holdout). Proibido
 * criar centenas de skills com uma única questão cada.
 *
 * Regra (§6): `meta.family` e `meta.pedagogical_branch` NÃO são `skill_id`.
 * Proibido qualquer alias automático `branch → skill` ou `family → skill`.
 *
 * Sem I/O, sem env, sem wiring em recommendations.ts / vitrine.
 */

/** Disciplina canônica (mapa CLAUDE.md §9 para Técnico de Enfermagem; mapa próprio para outras disciplinas, ex. Língua Portuguesa). */
export type EvidenceDisciplina = string;

/** `misconception_code` normalizado (pipeline offline §10 — proposta IA + revisão humana obrigatória). */
export type EvidenceMisconception = {
  code: string;
  description: string;
};

/** Nó completo de uma competência medível. */
export type EvidenceSkillDefinition = {
  skill_id: string;
  disciplina: EvidenceDisciplina;
  subtopico: string;
  cluster: string;
  label: string;
  misconceptions: EvidenceMisconception[];
  /**
   * Inventário mínimo comprovado (§5) — presença de múltiplas questões
   * elegíveis a ensino/T1/holdout. Este campo é declarativo (contagem
   * conhecida no momento do handcraft); a spec operacional decide o limiar.
   */
  minimum_inventory_confirmed: boolean;
};

/** Registro imutável de skills (chave = skill_id). */
export type EvidenceTaxonomyRegistry = Readonly<Record<string, EvidenceSkillDefinition>>;

const SKILL_ID_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*(?:\.[a-z0-9]+(?:_[a-z0-9]+)*)+$/;

/**
 * `skill_id` no formato `disciplina.cluster_ou_subtopico.competencia` (snake_case
 * por segmento, segmentos separados por `.`). Formato ilustrativo — nome final
 * na spec operacional; aqui apenas validamos consistência estrutural.
 */
export function isValidSkillIdFormat(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && SKILL_ID_PATTERN.test(value);
}

export function buildSkillId(
  disciplina: string,
  cluster: string,
  competencia: string,
): string {
  return `${disciplina}.${cluster}.${competencia}`;
}

export function createTaxonomyRegistry(
  definitions: readonly EvidenceSkillDefinition[],
): EvidenceTaxonomyRegistry {
  const registry: Record<string, EvidenceSkillDefinition> = {};
  for (const def of definitions) {
    if (!isValidSkillIdFormat(def.skill_id)) {
      throw new Error(`skill_id inválido: '${def.skill_id}' (esperado formato disciplina.cluster.competencia)`);
    }
    if (registry[def.skill_id]) {
      throw new Error(`skill_id duplicado no registro: '${def.skill_id}'`);
    }
    registry[def.skill_id] = def;
  }
  return registry;
}

export function getSkillDefinition(
  registry: EvidenceTaxonomyRegistry,
  skillId: string,
): EvidenceSkillDefinition | null {
  return registry[skillId] ?? null;
}

export function listSkillsByDisciplina(
  registry: EvidenceTaxonomyRegistry,
  disciplina: EvidenceDisciplina,
): EvidenceSkillDefinition[] {
  return Object.values(registry).filter((s) => s.disciplina === disciplina);
}

export function listSkillsBySubtopico(
  registry: EvidenceTaxonomyRegistry,
  subtopico: string,
): EvidenceSkillDefinition[] {
  return Object.values(registry).filter((s) => s.subtopico === subtopico);
}

/**
 * Guarda anti-alias (§6): rejeita `skill_id` que seja, na verdade, um valor de
 * `pedagogical_branch` ou `family` do catálogo. O caller fornece as listas
 * conhecidas (este módulo não importa `lib/slides/pedagogicalBranch.ts` para
 * permanecer puro e desacoplado do wiring de produto).
 */
export function isSkillIdAliasOfBranchOrFamily(
  skillId: string,
  knownBranches: readonly string[],
  knownFamilies: readonly string[],
): boolean {
  return knownBranches.includes(skillId) || knownFamilies.includes(skillId);
}

/** Verifica se o registro tem inventário mínimo confirmado para a skill. */
export function hasMinimumInventory(
  registry: EvidenceTaxonomyRegistry,
  skillId: string,
): boolean {
  return registry[skillId]?.minimum_inventory_confirmed ?? false;
}
