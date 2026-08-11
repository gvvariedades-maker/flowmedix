import {
  CANONICAL_SUBTOPICOS,
  DCNT_MESCLADAS_LABEL,
  isCanonicalSubtopico,
  type CanonicalSubtopico,
} from '@/lib/catalogMigration/canonicalSubtopicos';
import { resolveCanonicalSubtopico } from '@/lib/catalogMigration/legacySubtopicoMap';

/**
 * Taxonomia pedagógica TE para o Hub Desempenho:
 * 41 subtópicos canônicos → 8 grandes áreas (CLAUDE.md §9) → 4 faixas de risco de prova.
 */

export type GrandeAreaId =
  | 'fundamentos_bases'
  | 'farmacologia'
  | 'procedimentos'
  | 'biosseguranca'
  | 'saude_publica'
  | 'doencas_transmissiveis'
  | 'cirurgicas_criticas'
  | 'mental_trabalho_ciclos'
  | 'outros';

export type RiskBandId =
  | 'alta_incidencia_protocolo'
  | 'clinico_critico'
  | 'ciclos_de_vida'
  | 'bases'
  | 'outros';

export type GrandeAreaMeta = {
  id: GrandeAreaId;
  label: string;
  riskBandId: RiskBandId;
  order: number;
};

export type RiskBandMeta = {
  id: RiskBandId;
  label: string;
  shortLabel: string;
  order: number;
};

export const RISK_BANDS: readonly RiskBandMeta[] = [
  {
    id: 'alta_incidencia_protocolo',
    label: 'Alta incidência / protocolo',
    shortLabel: 'Protocolo',
    order: 1,
  },
  {
    id: 'clinico_critico',
    label: 'Clínico crítico',
    shortLabel: 'Clínico',
    order: 2,
  },
  {
    id: 'ciclos_de_vida',
    label: 'Ciclos de vida',
    shortLabel: 'Ciclos',
    order: 3,
  },
  {
    id: 'bases',
    label: 'Bases',
    shortLabel: 'Bases',
    order: 4,
  },
  {
    id: 'outros',
    label: 'Outros',
    shortLabel: 'Outros',
    order: 99,
  },
] as const;

export const GRANDE_AREAS: readonly GrandeAreaMeta[] = [
  {
    id: 'fundamentos_bases',
    label: 'Fundamentos e Bases',
    riskBandId: 'bases',
    order: 1,
  },
  {
    id: 'farmacologia',
    label: 'Farmacologia e Medicamentos',
    riskBandId: 'alta_incidencia_protocolo',
    order: 2,
  },
  {
    id: 'procedimentos',
    label: 'Procedimentos de Enfermagem',
    riskBandId: 'clinico_critico',
    order: 3,
  },
  {
    id: 'biosseguranca',
    label: 'Biossegurança e Controle de Infecção',
    riskBandId: 'alta_incidencia_protocolo',
    order: 4,
  },
  {
    id: 'saude_publica',
    label: 'Saúde Pública e Epidemiologia',
    riskBandId: 'alta_incidencia_protocolo',
    order: 5,
  },
  {
    id: 'doencas_transmissiveis',
    label: 'Doenças Transmissíveis',
    riskBandId: 'clinico_critico',
    order: 6,
  },
  {
    id: 'cirurgicas_criticas',
    label: 'Especialidades Cirúrgicas e Críticas',
    riskBandId: 'clinico_critico',
    order: 7,
  },
  {
    id: 'mental_trabalho_ciclos',
    label: 'Saúde Mental, do Trabalho e Ciclos de Vida',
    riskBandId: 'ciclos_de_vida',
    order: 8,
  },
  {
    id: 'outros',
    label: 'Outros',
    riskBandId: 'outros',
    order: 99,
  },
] as const;

const AREA_BY_ID = new Map(GRANDE_AREAS.map((a) => [a.id, a]));
const RISK_BY_ID = new Map(RISK_BANDS.map((r) => [r.id, r]));

/** Índices 0–40 em CANONICAL_SUBTOPICOS → grande área (§9). */
const SUBTOPICO_AREA_INDEX: ReadonlyArray<{ start: number; end: number; areaId: GrandeAreaId }> = [
  { start: 0, end: 3, areaId: 'fundamentos_bases' },
  { start: 4, end: 7, areaId: 'farmacologia' },
  { start: 8, end: 16, areaId: 'procedimentos' },
  { start: 17, end: 21, areaId: 'biosseguranca' },
  { start: 22, end: 25, areaId: 'saude_publica' },
  { start: 26, end: 32, areaId: 'doencas_transmissiveis' },
  { start: 33, end: 35, areaId: 'cirurgicas_criticas' },
  { start: 36, end: 40, areaId: 'mental_trabalho_ciclos' },
];

const SUBTOPICO_TO_AREA = new Map<string, GrandeAreaId>();

for (const range of SUBTOPICO_AREA_INDEX) {
  for (let i = range.start; i <= range.end; i++) {
    const label = CANONICAL_SUBTOPICOS[i];
    if (label) SUBTOPICO_TO_AREA.set(label, range.areaId);
  }
}

/** Bucket legado DCNT → Doenças Transmissíveis (melhor encaixe no radar). */
SUBTOPICO_TO_AREA.set(DCNT_MESCLADAS_LABEL, 'doencas_transmissiveis');

export type TaxonomiaAssunto = {
  canonicalSubtopico: string | null;
  areaId: GrandeAreaId;
  areaLabel: string;
  riskBandId: RiskBandId;
  riskBandLabel: string;
};

export function isGrandeAreaId(value: string | null | undefined): value is GrandeAreaId {
  if (!value) return false;
  return AREA_BY_ID.has(value as GrandeAreaId);
}

/** Parse de `?area=` na URL do hub — inválido → null (sem filtro). */
export function parseGrandeAreaId(raw: string | null | undefined): GrandeAreaId | null {
  const key = raw?.trim();
  if (!key || !isGrandeAreaId(key)) return null;
  return key;
}

export function getGrandeAreaMeta(areaId: GrandeAreaId): GrandeAreaMeta {
  return AREA_BY_ID.get(areaId) ?? AREA_BY_ID.get('outros')!;
}

export function getRiskBandMeta(riskBandId: RiskBandId): RiskBandMeta {
  return RISK_BY_ID.get(riskBandId) ?? RISK_BY_ID.get('outros')!;
}

/**
 * Resolve `titulo_aula` → canônico:
 * 1) já canônico (41 + DCNT)
 * 2) mapa legado `resolveCanonicalSubtopico`
 * 3) null → cai em Outros no radar
 */
export function resolveCanonicalFromTituloAula(
  tituloAula: string | null | undefined,
): string | null {
  const key = tituloAula?.trim();
  if (!key) return null;
  if (isCanonicalSubtopico(key)) return key;
  return resolveCanonicalSubtopico(key)?.canonical ?? null;
}

export function resolveAreaIdForCanonical(canonical: string | null): GrandeAreaId {
  if (!canonical) return 'outros';
  return SUBTOPICO_TO_AREA.get(canonical) ?? 'outros';
}

export function resolveTaxonomiaAssunto(
  tituloAula: string | null | undefined,
): TaxonomiaAssunto {
  const canonical = resolveCanonicalFromTituloAula(tituloAula);
  const areaId = resolveAreaIdForCanonical(canonical);
  const area = getGrandeAreaMeta(areaId);
  const risk = getRiskBandMeta(area.riskBandId);
  return {
    canonicalSubtopico: canonical,
    areaId: area.id,
    areaLabel: area.label,
    riskBandId: risk.id,
    riskBandLabel: risk.label,
  };
}

/** Cobertura dos 41 canônicos na taxonomia (teste / auditoria). */
export function listCanonicalTaxonomiaCoverage(): Array<{
  subtopico: CanonicalSubtopico;
  areaId: GrandeAreaId;
  riskBandId: RiskBandId;
}> {
  return CANONICAL_SUBTOPICOS.map((subtopico) => {
    const areaId = resolveAreaIdForCanonical(subtopico);
    const area = getGrandeAreaMeta(areaId);
    return {
      subtopico,
      areaId,
      riskBandId: area.riskBandId,
    };
  });
}
