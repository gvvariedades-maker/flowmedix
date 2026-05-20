import landingDemoQuestaoRaw from '@/data/landing-demo-questao-gluconato.json';
import { QuestaoCompletaSchema } from '@/lib/validations';
import type { LessonData } from '@/types/lesson';

const parsed = QuestaoCompletaSchema.safeParse(landingDemoQuestaoRaw);

if (!parsed.success) {
  const message = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  throw new Error(`landing-demo-questao-gluconato.json inválido: ${message}`);
}

/** Questão estática da demo na landing (validada no build). */
export const landingDemoQuestao: LessonData = {
  ...parsed.data,
  modulo_slug: 'demo-landing-gluconato',
};
