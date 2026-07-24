/**
 * Slides mínimos sem stub para testes do write spec v2 (subtópico sem molde bespoke).
 */
export const WRITE_SPEC_TEST_SLIDES = [
  {
    type: 'concept_map' as const,
    items: [
      { label: 'Contexto clínico', detail: 'Panorama da questão de teste.', icon: 'BookOpen' },
      { label: 'Foco da banca', detail: 'Recorte cobrado nesta prova.', icon: 'Target' },
    ],
  },
  {
    type: 'logic_flow' as const,
    steps: ['Ler enunciado e alternativas', 'Confrontar com protocolo', 'Marcar gabarito B'],
    reveal_mode: 'tap' as const,
  },
  {
    type: 'golden_rule' as const,
    content: 'Regra específica desta questão de teste — não genérica.',
  },
  {
    type: 'danger_zone' as const,
    content: 'Pegadinhas desta questão',
    items: [
      {
        label: 'A',
        detail: 'Por que a alternativa A parece certa',
        correct: 'Gabarito B: a opção A não atende o protocolo cobrado.',
      },
    ],
  },
];

export const WRITE_SPEC_TEST_QUESTION = {
  meta: {
    banca: 'EBSERH',
    ano: '2024',
    topico: 'Enfermagem',
    subtopico: 'História da Enfermagem',
  },
  question_data: {
    instruction: 'De acordo com a história da enfermagem, assinale a alternativa correta.',
    options: [
      { id: 'A', text: 'Opção A', is_correct: false },
      { id: 'B', text: 'Opção B', is_correct: true },
    ],
  },
  reverse_study_slides: WRITE_SPEC_TEST_SLIDES,
};
