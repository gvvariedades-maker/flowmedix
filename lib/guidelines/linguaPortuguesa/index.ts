import { mergeGuidelineTables } from '@/lib/guidelines/mergeGuidelines';
import { PT_CLASSES_PALAVRAS } from '@/lib/guidelines/linguaPortuguesa/classesPalavras';
import { PT_COESAO_CONECTIVOS } from '@/lib/guidelines/linguaPortuguesa/coesaoConectivos';
import { PT_COLOCACAO_PRONOMINAL } from '@/lib/guidelines/linguaPortuguesa/colocacaoPronominal';
import { PT_CONCORDANCIA } from '@/lib/guidelines/linguaPortuguesa/concordancia';
import { PT_CRASE_CONCURSOS } from '@/lib/guidelines/linguaPortuguesa/crase';
import { PT_DENOTACAO_CONOTACAO } from '@/lib/guidelines/linguaPortuguesa/denotacaoConotacao';
import { PT_FORMACAO_PALAVRAS } from '@/lib/guidelines/linguaPortuguesa/formacaoPalavras';
import { PT_ORACOES_SUBORDINADAS } from '@/lib/guidelines/linguaPortuguesa/oracoesSubordinadas';
import { PT_PONTUACAO } from '@/lib/guidelines/linguaPortuguesa/pontuacao';
import { PT_REGENCIA } from '@/lib/guidelines/linguaPortuguesa/regencia';
import { PT_SINONIMOS_POLISSEMIA } from '@/lib/guidelines/linguaPortuguesa/sinonimosPolissemia';
import { PT_SUJEITO_PREDICADO } from '@/lib/guidelines/linguaPortuguesa/sujeitoPredicado';
import { PT_TERMOS_ORACAO } from '@/lib/guidelines/linguaPortuguesa/termosOracao';
import { PT_TIPOLOGIA } from '@/lib/guidelines/linguaPortuguesa/tipologia';
import { PT_VOCABULO_QUE_SE } from '@/lib/guidelines/linguaPortuguesa/vocabuloQueSe';
import { PT_VERBOS } from '@/lib/guidelines/linguaPortuguesa/verbos';
import type { GuidelineTable } from '@/lib/guidelines/types';

export { PT_CRASE_CONCURSOS } from '@/lib/guidelines/linguaPortuguesa/crase';
export { PT_COLOCACAO_PRONOMINAL } from '@/lib/guidelines/linguaPortuguesa/colocacaoPronominal';
export { PT_PONTUACAO } from '@/lib/guidelines/linguaPortuguesa/pontuacao';
export { PT_CONCORDANCIA } from '@/lib/guidelines/linguaPortuguesa/concordancia';
export { PT_REGENCIA } from '@/lib/guidelines/linguaPortuguesa/regencia';
export { PT_TERMOS_ORACAO } from '@/lib/guidelines/linguaPortuguesa/termosOracao';
export { PT_ORACOES_SUBORDINADAS } from '@/lib/guidelines/linguaPortuguesa/oracoesSubordinadas';
export { PT_TIPOLOGIA } from '@/lib/guidelines/linguaPortuguesa/tipologia';
export { PT_SUJEITO_PREDICADO } from '@/lib/guidelines/linguaPortuguesa/sujeitoPredicado';
export { PT_CLASSES_PALAVRAS } from '@/lib/guidelines/linguaPortuguesa/classesPalavras';
export { PT_VERBOS } from '@/lib/guidelines/linguaPortuguesa/verbos';
export { PT_COESAO_CONECTIVOS } from '@/lib/guidelines/linguaPortuguesa/coesaoConectivos';
export { PT_SINONIMOS_POLISSEMIA } from '@/lib/guidelines/linguaPortuguesa/sinonimosPolissemia';
export { PT_DENOTACAO_CONOTACAO } from '@/lib/guidelines/linguaPortuguesa/denotacaoConotacao';
export { PT_VOCABULO_QUE_SE } from '@/lib/guidelines/linguaPortuguesa/vocabuloQueSe';
export { PT_FORMACAO_PALAVRAS } from '@/lib/guidelines/linguaPortuguesa/formacaoPalavras';

/** P0 — crase + colocação. */
export const PT_GUIDELINE_P0_TABLES: GuidelineTable[] = [
  PT_CRASE_CONCURSOS,
  PT_COLOCACAO_PRONOMINAL,
];

/** P1 — norma (pontuação, concordância, regência). */
export const PT_GUIDELINE_P1_TABLES: GuidelineTable[] = [
  PT_PONTUACAO,
  PT_CONCORDANCIA,
  PT_REGENCIA,
];

/** P2 — sintaxe e texto. */
export const PT_GUIDELINE_P2_TABLES: GuidelineTable[] = [
  PT_TERMOS_ORACAO,
  PT_ORACOES_SUBORDINADAS,
  PT_TIPOLOGIA,
  PT_SUJEITO_PREDICADO,
];

/** P3 — morfologia e vocabulário. */
export const PT_GUIDELINE_P3_TABLES: GuidelineTable[] = [
  PT_CLASSES_PALAVRAS,
  PT_FORMACAO_PALAVRAS,
  PT_VERBOS,
  PT_COESAO_CONECTIVOS,
  PT_SINONIMOS_POLISSEMIA,
  PT_DENOTACAO_CONOTACAO,
  PT_VOCABULO_QUE_SE,
];

export const PT_GUIDELINE_ALL_TABLES: GuidelineTable[] = [
  ...PT_GUIDELINE_P0_TABLES,
  ...PT_GUIDELINE_P1_TABLES,
  ...PT_GUIDELINE_P2_TABLES,
  ...PT_GUIDELINE_P3_TABLES,
];

export function getLinguaPortuguesaGuidelineP0(): GuidelineTable | null {
  return mergeGuidelineTables(PT_GUIDELINE_P0_TABLES);
}

export function getLinguaPortuguesaGuidelineP1(): GuidelineTable | null {
  return mergeGuidelineTables(PT_GUIDELINE_P1_TABLES);
}

export function getLinguaPortuguesaGuidelineP2(): GuidelineTable | null {
  return mergeGuidelineTables(PT_GUIDELINE_P2_TABLES);
}

export function getLinguaPortuguesaGuidelineP3(): GuidelineTable | null {
  return mergeGuidelineTables(PT_GUIDELINE_P3_TABLES);
}

export function getLinguaPortuguesaGuidelineAll(): GuidelineTable | null {
  return mergeGuidelineTables(PT_GUIDELINE_ALL_TABLES);
}
