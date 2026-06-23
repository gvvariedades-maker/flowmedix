import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { getDesignBySubtopic } from '@/components/slides/core/themeGenerator';
import {
  FAMILY_GOLDEN_FILE,
  type FamilyId,
} from '@/lib/catalogMigration/classifyFamily';
import { getGuidelineForSubtopico as getGuidelineFromIndex } from '@/lib/guidelines';

const SUBTOPICO_GUIDELINE: Record<string, string> = {
  Imunização: 'pni-2025-intervalos',
  'Verificação de Sinais Vitais': 'sv-adulto-referencia',
  'Urgências e Emergências': 'urgencias-rcp-sbv-ms',
  'Saúde da Mulher': 'sm-prenatal-baixo-risco-ms',
  'Cálculo de Administração de Medicamentos e Infusões': 'calc-equivalencias-br',
  'Oxigenoterapia e Cuidados Respiratórios': 'oxigenoterapia-dispositivos-ms',
  'Coleta de Exames Laboratoriais': 'coleta-exames-sbpc-ml',
  'Cuidados na Administração de Medicamentos': 'cuidados-admin-cofen',
  'Saúde da Criança': 'saude-crianca-ms',
  'Farmacodinâmica e Farmacocinética': 'farmaco-adme-anvisa',
  'Vias de Administração': 'vias-administracao-cofen',
  'Curativos e Manejo de Feridas': 'curativos-lpp-npuap',
  'Instalação e Manejo de Sondas': 'sondas-tecnica-cofen',
  'Punção Venosa e Cuidados com Cateteres': 'puncao-cateter-anvisa',
  'Infecções Sexualmente Transmissíveis (ISTs)': 'ists-prevencao-ms',
  'Processo de Enfermagem': 'sae-cofen-358',
  'Medidas de Prevenção e Precaução de Contato': 'biosseguranca-anvisa',
  'Infecções no Contexto da Biossegurança': 'biosseguranca-anvisa',
  'Segurança do Paciente': 'biosseguranca-anvisa',
  'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)': 'doencas-virais-ms',
  'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)': 'tuberculose-ms',
  'Processamento de Artigos e Produtos de Saúde': 'cme-anvisa-rdc15',
  'Enfermagem em Central de Material e Esterilização (CME)': 'cme-anvisa-rdc15',
  'Assistência Perioperatória (Inclui SRPA)': 'perioperatorio-cirurgia-segura',
  'Enfermagem em Centro Cirúrgico': 'perioperatorio-cirurgia-segura',
  'Epidemiologia e Vigilância Epidemiológica': 'epidemiologia-ms',
  'Atenção Básica / Saúde da Família': 'atencao-basica-pnab',
  'Doenças Respiratórias Crônicas (Asma, DPOC)': 'respiratorio-cronico-ms',
  'Saúde Mental': 'saude-mental-ms',
  'Promoção à Saúde e Prevenção de Agravos': 'promocao-saude-sus',
  'Enfermagem do Trabalho': 'enfermagem-trabalho-nr32',
  'Saúde do Adolescente': 'saude-adolescente-ms',
  'Doenças Parasitárias e Zoonoses': 'parasitarias-zoonoses-ms',
  'Feridas e Queimaduras': 'feridas-queimaduras-ms',
  'Mobilização e Posicionamento do Paciente': 'mobilizacao-posicionamento',
  'História da Enfermagem': 'historia-enfermagem-cofen',
  'Noções de Anatomia': 'anatomia-terminologia',
  'Noções de Fisiologia': 'fisiologia-homeostase',
  'Procedimentos Diversos': 'procedimentos-diversos-assepsia',
  'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis': 'doencas-virais-ms',
  'Questões Mescladas e Outras Doenças Agudas': 'urgencias-rcp-sbv-ms',
};

/** @deprecated Use getGuidelineForSubtopico — mantido para mapeamento de table id legado. */
export function getGuidelineTableIdForSubtopico(subtopico: string): string | null {
  return SUBTOPICO_GUIDELINE[subtopico.trim()] ?? null;
}

export function getGuidelineForSubtopico(subtopico: string): ReturnType<typeof getGuidelineFromIndex> {
  return getGuidelineFromIndex(subtopico);
}

export function getMoldeSummary(subtopico: string): string | null {
  const design = getDesignBySubtopic(subtopico);
  if (!design) return null;
  return [
    `concept_map: ${design.conceptMap}`,
    `golden_rule: ${design.goldenRule}`,
    `logic_flow: ${design.logicFlow}`,
    `danger_zone: ${design.dangerZone}`,
  ].join('\n');
}

function loadGoldenFile(filename: string): unknown | null {
  try {
    const path = resolve(process.cwd(), 'examples', filename);
    return JSON.parse(readFileSync(path, 'utf8')) as unknown;
  } catch {
    return null;
  }
}

/** Golden vizinho: mesma família+subtópico, senão arquivo padrão da família. */
export function getExemplar(subtopico: string, family: FamilyId): unknown | null {
  const examplesDir = resolve(process.cwd(), 'examples');
  try {
    const fromDir = readdirSync(examplesDir)
      .filter((f) => f.startsWith('questao-premium-') && f.endsWith('.json'))
      .map((f) => loadGoldenFile(f))
      .find((q) => {
        const meta = (q as { meta?: { subtopico?: string; family?: string } })?.meta;
        return meta?.subtopico === subtopico && meta?.family === family;
      });
    if (fromDir) return fromDir;
  } catch {
    // examples/ ausente em alguns ambientes de teste
  }

  const fallbackFile = FAMILY_GOLDEN_FILE[family];
  return fallbackFile ? loadGoldenFile(fallbackFile) : null;
}

export function getExemplarSlides(exemplar: unknown): unknown[] | null {
  if (!exemplar || typeof exemplar !== 'object') return null;
  const slides =
    (exemplar as { reverse_study_slides?: unknown }).reverse_study_slides ??
    (exemplar as { study_slides?: unknown }).study_slides;
  return Array.isArray(slides) ? slides : null;
}
