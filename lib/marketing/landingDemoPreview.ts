import { landingDemoQuestao } from '@/lib/landingDemoQuestao';
import { stripLeadingQuestionEnumeration } from '@/lib/questionHeader';

const { meta, question_data, reverse_study_slides } = landingDemoQuestao;

export const LANDING_DEMO_CORRECT_OPTION = question_data.options.find((o) => o.is_correct);

export const LANDING_DEMO_SUBTOPICO =
  meta.subtopico?.trim() || 'Cálculo de Administração de Medicamentos e Infusões';

/** Resumo curto da questão demo para chips e preview de progresso. */
export const LANDING_DEMO_QUESTION_SHORT = 'Gluconato diluído — 560 mg';

/** Linha de contexto compartilhada nos 4 passos do método. */
export const LANDING_DEMO_JOURNEY_LABEL = `${meta.banca} ${meta.ano} · ${LANDING_DEMO_QUESTION_SHORT}`;

export const LANDING_DEMO_INSTRUCTION_SNIPPET = stripLeadingQuestionEnumeration(
  question_data.instruction,
).slice(0, 72);

const goldenRuleSlide = reverse_study_slides?.find((s) => s.type === 'golden_rule');
const conceptSlide = reverse_study_slides?.find((s) => s.type === 'concept_map');

/** Feedback pós-gabarito alinhado ao estudo reverso da mesma questão. */
export const LANDING_DEMO_GABARITO_FEEDBACK =
  (goldenRuleSlide && 'footer_rule' in goldenRuleSlide && goldenRuleSlide.footer_rule) ||
  (conceptSlide && 'footer_rule' in conceptSlide && conceptSlide.footer_rule) ||
  'A dose infundida é proporcional ao volume administrado na solução final, não só à ampola.';

export const LANDING_DEMO_PROGRESSO_ITEMS = [
  { label: `Diagnóstico: ${LANDING_DEMO_QUESTION_SHORT}`, done: true },
  { label: `NeuroSlides: ${LANDING_DEMO_SUBTOPICO}`, done: true },
  { label: 'Missão semanal — 10 questões', done: false },
] as const;
