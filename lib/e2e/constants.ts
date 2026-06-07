import type { LessonData } from '@/types/lesson';

/** IDs fixos para fluxo E2E do Modo Simulado (server seed + Playwright). */
/** UUID v4 válido (Zod `.uuid()` nas rotas/páginas do simulado). */
export const E2E_SIMULADO_SESSION_ID = '11111111-1111-4111-8111-111111111111';
export const E2E_SIMULADO_SLUG = 'questao-e2e-simulado';

export const E2E_SIMULADO_LESSON: LessonData = {
  meta: { banca: 'FGV', topico: 'Urgências', subtopico: 'RCP' },
  question_data: {
    instruction: 'Paciente em parada cardiorrespiratória. Qual a primeira conduta?',
    options: [
      { id: 'A', text: 'Iniciar compressões torácicas', is_correct: true },
      { id: 'B', text: 'Administrar atropina EV', is_correct: false },
    ],
  },
};

/** Fluxo E2E vitrine → questão → próxima (Playwright). */
export const E2E_ESTUDAR_SLUG_1 = 'questao-e2e-estudar-1';
export const E2E_ESTUDAR_SLUG_2 = 'questao-e2e-estudar-2';
export const E2E_ESTUDAR_BANCA = 'FGV';
export const E2E_ESTUDAR_TITULO_AULA = 'Urgências e Emergências E2E';
/** 13º assunto do seed paginado — único card na vitrine `page=2` (12/página). */
export const E2E_ESTUDAR_TITULO_AULA_PAGE2 = 'Assunto E2E paginação 13';

export const E2E_ESTUDAR_SLUGS = [E2E_ESTUDAR_SLUG_1, E2E_ESTUDAR_SLUG_2] as const;

export function isE2eEstudarSlug(slug: string): boolean {
  return (E2E_ESTUDAR_SLUGS as readonly string[]).includes(slug);
}
