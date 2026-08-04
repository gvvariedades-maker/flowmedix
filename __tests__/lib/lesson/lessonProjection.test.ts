import {
  LESSON_PROJECTION_SCHEMA_VERSION,
  buildLessonProjection,
  derivePredictionPrompt,
  gradeFixationCoverage,
  summarizeFixationCoverage,
  type LessonProjectionInput,
} from '@/lib/lesson/lessonProjection';

/** Espelha a âncora golden-v1 de Farmacodinâmica (FUNCAMP, family=vf). */
const farmacoVf = (): LessonProjectionInput => ({
  slug: 'funcamp-farmacodinamica-vf',
  meta: { subtopico: 'Farmacodinâmica e Farmacocinética', family: 'vf' },
  question_data: {
    instruction:
      'Sobre farmacocinética e farmacodinâmica, analise as afirmativas.\n\nI - Farmacocinética estuda o que o organismo faz com o fármaco.\nII - Farmacodinâmica estuda o que o fármaco faz no organismo.\nIII - A meia-vida corresponde ao tempo para eliminar 100% da dose.\n\nÉ CORRETO o que se afirma em:',
    options: [
      { id: 'A', text: 'I, apenas.', is_correct: false },
      { id: 'B', text: 'I e II, apenas.', is_correct: true },
      { id: 'C', text: 'II e III, apenas.', is_correct: false },
    ],
  },
  reverse_study_slides: [
    {
      type: 'concept_map',
      slide_title: 'Farmaco — mapa conceitual',
      items: [
        { label: 'Farmacocinética', detail: 'ADME: absorção, distribuição, metabolismo, excreção.' },
        { label: 'Farmacodinâmica', detail: 'Ação no receptor — efeito desejado e adverso.' },
      ],
      footer_rule: 'Cinética = ADME · Dinâmica = ação',
    },
    {
      type: 'golden_rule',
      content: 'CINÉTICA × DINÂMICA',
      rows: [
        { label: 'Farmacocinética', value: 'O que o organismo faz com o fármaco (ADME)' },
        { label: 'Meia-vida', value: 'Queda de 50% da concentração — não 100%' },
      ],
      footer_rule: 'III troca 50% por 100% — pegadinha numérica clássica',
    },
    {
      type: 'logic_flow',
      steps: [
        'I: definição de farmacocinética (ADME) → verdadeira.',
        'III: meia-vida = eliminar 100% → falsa.',
        'Marcar letra B.',
        'Fixação: meia-vida sempre é redução pela metade da concentração.',
      ],
      footer_rule: 'Separar definições antes de olhar alternativas',
    },
    {
      type: 'danger_zone',
      content: 'PEGADINHAS — FARMACOLOGIA',
      items: [
        {
          label: 'Letra A — I apenas',
          detail: 'Omite II, que também define corretamente a farmacodinâmica.',
          correct: 'II é verdadeira — dinâmica = ação no organismo.',
        },
        {
          label: 'Letra C — II e III',
          detail: 'Inclui III falsa (100%) e exclui I verdadeira.',
          correct: 'III erra meia-vida; I (ADME) também é verdadeira.',
        },
      ],
      footer_rule: 'Em farmaco, definição trocada ou 50%→100% são os erros mais frequentes',
    },
  ],
});

describe('buildLessonProjection', () => {
  it('projeta as duas telas sem tocar no schema da questão', () => {
    const input = farmacoVf();
    const snapshot = JSON.stringify(input);
    const projection = buildLessonProjection(input);

    expect(projection.schema_version).toBe(LESSON_PROJECTION_SCHEMA_VERSION);
    expect(projection.subtopico).toBe('Farmacodinâmica e Farmacocinética');
    expect(projection.aula.enquadramento.length).toBeGreaterThan(0);
    expect(projection.prova.elimination.length).toBeGreaterThan(0);
    expect(JSON.stringify(input)).toBe(snapshot);
  });

  it('é determinística: mesma entrada, mesma saída', () => {
    expect(buildLessonProjection(farmacoVf())).toEqual(buildLessonProjection(farmacoVf()));
  });

  it('portão de predição não carrega gabarito', () => {
    const { prediction_gate } = buildLessonProjection(farmacoVf()).prova;
    expect(prediction_gate.prompt).toBe('É CORRETO o que se afirma em:');
    expect(prediction_gate.reveals_answer).toBe(false);
    expect(prediction_gate.options).toEqual([
      { id: 'A', text: 'I, apenas.' },
      { id: 'B', text: 'I e II, apenas.' },
      { id: 'C', text: 'II e III, apenas.' },
    ]);
    expect(JSON.stringify(prediction_gate)).not.toContain('is_correct');
  });

  it('classifica os passos e move "Fixação:" para a transferência', () => {
    const { elimination, fixacao } = buildLessonProjection(farmacoVf()).prova;
    expect(elimination.map((s) => s.kind)).toEqual(['elimination', 'elimination', 'gabarito']);
    expect(elimination.some((s) => /^Fixação:/.test(s.text))).toBe(false);
    expect(fixacao.explicit_count).toBe(1);
    expect(fixacao.transfer[0]).toBe('meia-vida sempre é redução pela metade da concentração.');
    expect(fixacao.transfer).toContain(
      'Em farmaco, definição trocada ou 50%→100% são os erros mais frequentes',
    );
  });

  it('gera um card por distrator com a letra do rótulo', () => {
    const cards = buildLessonProjection(farmacoVf()).prova.distractor_cards;
    expect(cards).toHaveLength(2);
    expect(cards.map((c) => c.letter)).toEqual(['A', 'C']);
    expect(cards[0].trap).toContain('Omite II');
    expect(cards[0].correct).toContain('dinâmica = ação');
    expect(cards.every((c) => c.polarity === 'trap')).toBe(true);
  });

  it('em comando negativo, card de conduta válida não recebe polaridade de erro', () => {
    const input: LessonProjectionInput = {
      meta: { subtopico: 'Farmacodinâmica e Farmacocinética' },
      question_data: {
        instruction: 'Sobre a infusão de omeprazol EV, assinale a alternativa INCORRETA.',
        options: [
          { id: 'A', text: 'Infusão titulada.', is_correct: false },
          { id: 'B', text: 'Bólus rápido.', is_correct: true },
        ],
      },
      reverse_study_slides: [
        {
          type: 'danger_zone',
          content: 'PEGADINHAS',
          items: [
            { label: 'Letra A — infusão titulada', correct: 'Conduta correta: titular conforme pH.' },
            { label: 'Letra B — bólus rápido', correct: 'Contraria o perfil do IBP endovenoso.' },
          ],
        },
      ],
    };

    const projection = buildLessonProjection(input);
    expect(projection.negative_command).toBe(true);
    expect(projection.prova.distractor_cards.map((c) => c.polarity)).toEqual(['valid_conduct', 'trap']);
  });

  it('tira da tela Aula a proposição que a tela Prova já ensina', () => {
    const input = farmacoVf();
    input.reverse_study_slides![0].items = [
      { label: 'Farmacocinética', detail: 'ADME: absorção, distribuição, metabolismo, excreção.' },
      { label: 'Meia-vida', detail: 'Meia-vida sempre é redução pela metade da concentração.' },
    ];

    const projection = buildLessonProjection(input);
    expect(projection.aula.enquadramento.map((f) => f.label)).toEqual(['Farmacocinética']);
    expect(projection.dropped_redundant).toEqual([
      expect.objectContaining({ from: 'concept_map', duplicate_of: expect.stringContaining('metade') }),
    ]);
  });

  it('nunca esvazia a tela Aula, mesmo com tudo redundante', () => {
    const input: LessonProjectionInput = {
      question_data: { instruction: 'Assinale a correta.', options: [{ id: 'A', text: 'x' }] },
      reverse_study_slides: [
        { type: 'concept_map', items: [{ label: 'Meia-vida', detail: 'Redução pela metade da concentração.' }] },
        { type: 'logic_flow', steps: ['Fixação: redução pela metade da concentração.'] },
      ],
    };
    expect(buildLessonProjection(input).aula.enquadramento).toHaveLength(1);
  });

  it('funde o padding "Confirmar:" + "Marcar" em um passo só', () => {
    const input: LessonProjectionInput = {
      question_data: { instruction: 'Assinale a correta.', options: [] },
      reverse_study_slides: [
        { type: 'logic_flow', steps: ['A → eliminar.', 'Confirmar: só C.', 'Marcar letra C.'] },
      ],
    };
    const projection = buildLessonProjection(input);
    expect(projection.prova.elimination.map((s) => s.text)).toEqual(['A → eliminar.', 'Marcar letra C.']);
    expect(projection.dropped_redundant).toEqual([
      { text: 'Confirmar: só C.', from: 'logic_flow', duplicate_of: 'Marcar letra C.' },
    ]);
  });

  it('reporta lacunas sem lançar em JSON incompleto', () => {
    const projection = buildLessonProjection({ question_data: { instruction: '' } });
    expect(projection.aula.enquadramento).toEqual([]);
    expect(projection.prova.elimination).toEqual([]);
    expect(projection.diagnostics).toEqual(
      expect.arrayContaining([
        expect.stringContaining('sem concept_map'),
        expect.stringContaining('sem logic_flow'),
        expect.stringContaining('sem danger_zone'),
      ]),
    );
  });

  it('aceita study_slides como fallback do array principal', () => {
    const input = farmacoVf();
    input.study_slides = input.reverse_study_slides;
    delete input.reverse_study_slides;
    expect(buildLessonProjection(input).prova.distractor_cards).toHaveLength(2);
  });
});

describe('gradeFixationCoverage', () => {
  it('classifica como strong quando há transferência e cards com conduta correta', () => {
    const coverage = gradeFixationCoverage(buildLessonProjection(farmacoVf()));
    expect(coverage.grade).toBe('strong');
    expect(coverage.has_explicit_fixation).toBe(true);
    expect(coverage.transferable_cards).toBe(2);
  });

  it('classifica como missing quando nada generaliza', () => {
    const projection = buildLessonProjection({
      question_data: { instruction: 'Assinale a correta.', options: [] },
      reverse_study_slides: [{ type: 'logic_flow', steps: ['Marcar letra C.'] }],
    });
    const coverage = gradeFixationCoverage(projection);
    expect(coverage.grade).toBe('missing');
    expect(coverage.transfer_count).toBe(0);
    expect(coverage.reasons.join(' ')).toContain('transferência');
  });

  it('classifica como thin quando só o rodapé do danger_zone generaliza', () => {
    const projection = buildLessonProjection({
      question_data: { instruction: 'Assinale a correta.', options: [] },
      reverse_study_slides: [
        { type: 'logic_flow', steps: ['Marcar letra C.'] },
        {
          type: 'danger_zone',
          content: 'PEGADINHAS',
          items: [{ label: 'Letra A — x', detail: 'y' }],
          footer_rule: 'Trocar unidade é o erro mais frequente',
        },
      ],
    });
    expect(gradeFixationCoverage(projection).grade).toBe('thin');
  });
});

describe('summarizeFixationCoverage', () => {
  it('agrega a fila de expansão pedagógica', () => {
    const strong = gradeFixationCoverage(buildLessonProjection(farmacoVf()));
    const missing = gradeFixationCoverage(
      buildLessonProjection({ question_data: { instruction: 'x' }, reverse_study_slides: [] }),
    );
    expect(summarizeFixationCoverage([strong, missing])).toMatchObject({
      total: 2,
      strong: 1,
      missing: 1,
      thin: 0,
    });
  });

  it('média 0 sem linhas', () => {
    expect(summarizeFixationCoverage([]).avg_transfer).toBe(0);
  });
});

describe('derivePredictionPrompt', () => {
  it('usa a última linha do enunciado multilinha', () => {
    expect(derivePredictionPrompt('Contexto.\n\nI - a\nII - b\n\nÉ CORRETO afirmar:')).toBe(
      'É CORRETO afirmar:',
    );
  });

  it('mantém o enunciado inteiro quando é uma linha só', () => {
    expect(derivePredictionPrompt('Assinale a alternativa correta.')).toBe(
      'Assinale a alternativa correta.',
    );
  });

  it('devolve string vazia sem enunciado', () => {
    expect(derivePredictionPrompt(undefined)).toBe('');
  });
});
