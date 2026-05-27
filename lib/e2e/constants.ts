/** IDs fixos para fluxo E2E do Modo Simulado (server seed + Playwright). */
/** UUID v4 válido (Zod `.uuid()` nas rotas/páginas do simulado). */
export const E2E_SIMULADO_SESSION_ID = '11111111-1111-4111-8111-111111111111';
export const E2E_SIMULADO_SLUG = 'questao-e2e-simulado';

export const E2E_SIMULADO_LESSON = {
  meta: { banca: 'FGV', topico: 'Urgências', subtopico: 'RCP' },
  question_data: {
    instruction: 'Paciente em parada cardiorrespiratória. Qual a primeira conduta?',
    options: [
      { id: 'A', text: 'Iniciar compressões torácicas', is_correct: true },
      { id: 'B', text: 'Administrar atropina EV', is_correct: false },
    ],
  },
} as const;
