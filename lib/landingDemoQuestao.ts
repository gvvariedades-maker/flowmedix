import landingDemoQuestaoRaw from '@/data/landing-demo-questao-gluconato.json';
import { QuestaoCompletaSchema } from '@/lib/validations';
import type { LessonData } from '@/types/lesson';

const parsed = QuestaoCompletaSchema.safeParse(landingDemoQuestaoRaw);

if (!parsed.success) {
  const message = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  throw new Error(`landing-demo-questao-gluconato.json inválido: ${message}`);
}

const { question_data, ...questaoRest } = parsed.data;

/** Questão estática da demo na landing (validada no build). */
export const landingDemoQuestao: LessonData = {
  ...questaoRest,
  question_data: {
    ...question_data,
    // Zod aceita null; LessonData só aceita string | undefined
    text_fragment: question_data.text_fragment ?? undefined,
  },
  modulo_slug: 'demo-landing-gluconato',
};
