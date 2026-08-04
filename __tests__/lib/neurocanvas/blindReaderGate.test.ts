import {
  BLIND_READER_SYSTEM_PROMPT,
  buildBlindReaderUserPrompt,
  buildBlindReaderView,
  correctLetterOf,
  evidenceIsLiteral,
  judgeBlindReader,
  parseBlindReaderAnswer,
  runBlindReaderOnQuestion,
  summarizeBlindReaderResults,
  type BlindReaderModelCall,
  type BlindReaderQuestionPayload,
} from '@/lib/neurocanvas/blindReaderGate';

const SPOILER_CONCEPT = {
  type: 'concept_map',
  items: [
    {
      label: 'PRESSÃO DIVERGENTE',
      detail:
        'Afastamento entre sistólica e diastólica — C erra ao dizer que máxima e mínima se aproximam.',
    },
    { label: 'PEGADINHA', detail: 'A banca troca convergente por divergente.' },
  ],
  footer_rule: 'Divergente = afasta',
};

const CLEAN_CONCEPT = {
  type: 'concept_map',
  items: [
    { label: 'PRESSÃO DIVERGENTE', detail: 'Sistólica e diastólica se afastam.' },
    { label: 'PRESSÃO CONVERGENTE', detail: 'Sistólica e diastólica se aproximam.' },
  ],
  footer_rule: 'Divergente afasta, convergente aproxima',
};

function payload(concept: Record<string, unknown>): BlindReaderQuestionPayload {
  return {
    question_data: {
      instruction: 'Sobre pressão arterial, assinale a alternativa correta.',
      options: [
        { id: 'A', text: 'alternativa a', is_correct: false },
        { id: 'B', text: 'alternativa b', is_correct: false },
        { id: 'C', text: 'alternativa c', is_correct: true },
      ],
    },
    reverse_study_slides: [
      concept,
      { type: 'logic_flow', steps: ['Julgar C', 'Marcar C'], reveal_mode: 'tap' },
      { type: 'golden_rule', rows: [{ label: 'PA', value: '120x80' }] },
      { type: 'danger_zone', content: 'Pegadinhas', items: [{ label: 'Letra A', correct: 'x' }] },
    ],
  };
}

describe('buildBlindReaderView', () => {
  it('expõe só label, detail e footer_rule do concept_map', () => {
    const view = buildBlindReaderView(payload(CLEAN_CONCEPT), 'slug-x');
    expect(view?.surfaces.map((s) => s.path)).toEqual([
      'concept_map.items[0].label',
      'concept_map.items[0].detail',
      'concept_map.items[1].label',
      'concept_map.items[1].detail',
      'concept_map.footer_rule',
    ]);
  });

  it('não vaza enunciado, alternativas nem os outros slides no prompt', () => {
    const view = buildBlindReaderView(payload(CLEAN_CONCEPT), 'slug-x')!;
    const prompt = buildBlindReaderUserPrompt(view);
    expect(prompt).not.toContain('assinale a alternativa correta');
    expect(prompt).not.toContain('alternativa c');
    expect(prompt).not.toContain('Marcar C');
    expect(prompt).not.toContain('120x80');
    expect(prompt).toContain('Sistólica e diastólica se afastam.');
  });

  it('devolve null sem concept_map', () => {
    expect(buildBlindReaderView({ reverse_study_slides: [{ type: 'logic_flow' }] }, 's')).toBeNull();
  });
});

describe('correctLetterOf', () => {
  it('lê a letra da alternativa marcada', () => {
    expect(correctLetterOf(payload(CLEAN_CONCEPT))).toBe('C');
  });

  it('devolve null sem gabarito', () => {
    expect(correctLetterOf({ question_data: { options: [{ id: 'A', is_correct: false }] } })).toBeNull();
  });
});

describe('parseBlindReaderAnswer', () => {
  it('normaliza letra minúscula e "letra C"', () => {
    expect(parseBlindReaderAnswer({ gabarito: 'c', evidencia: 'x' }).gabarito).toBe('C');
    expect(parseBlindReaderAnswer({ gabarito: 'Letra C', evidencia: '' }).gabarito).toBe('C');
  });

  it('resposta ilegível ou ausente vira indeterminavel', () => {
    expect(parseBlindReaderAnswer(null).gabarito).toBe('indeterminavel');
    expect(parseBlindReaderAnswer({ gabarito: 'não sei' }).gabarito).toBe('indeterminavel');
    expect(parseBlindReaderAnswer({ gabarito: 'INDETERMINÁVEL' }).gabarito).toBe('indeterminavel');
  });
});

describe('evidenceIsLiteral', () => {
  const view = buildBlindReaderView(payload(SPOILER_CONCEPT), 'slug-x')!;

  it('aceita citação com acento e espaçamento diferentes', () => {
    expect(evidenceIsLiteral('C erra ao dizer   que máxima e mínima se aproximam', view)).toBe(true);
  });

  it('rejeita paráfrase', () => {
    expect(evidenceIsLiteral('o material diz que a letra C está incorreta', view)).toBe(false);
  });

  it('rejeita trecho curto demais', () => {
    expect(evidenceIsLiteral('C erra', view)).toBe(false);
  });
});

describe('judgeBlindReader', () => {
  const view = buildBlindReaderView(payload(SPOILER_CONCEPT), 'slug-x')!;

  it('acertar a letra com citação literal reprova', () => {
    const res = judgeBlindReader({
      view,
      answer: { gabarito: 'C', evidencia: 'C erra ao dizer que máxima e mínima se aproximam' },
      correctLetter: 'C',
    });
    expect(res.verdict).toBe('fail_leak');
    expect(res.blocking).toBe(true);
  });

  it('acertar sem citação literal só avisa', () => {
    const res = judgeBlindReader({
      view,
      answer: { gabarito: 'C', evidencia: 'sei por experiência clínica' },
      correctLetter: 'C',
    });
    expect(res.verdict).toBe('warn_unsupported_hit');
    expect(res.blocking).toBe(false);
  });

  it('indeterminavel passa', () => {
    const res = judgeBlindReader({
      view,
      answer: { gabarito: 'indeterminavel', evidencia: '' },
      correctLetter: 'C',
    });
    expect(res.verdict).toBe('pass_indeterminate');
  });

  it('errar a letra passa', () => {
    const res = judgeBlindReader({
      view,
      answer: { gabarito: 'A', evidencia: 'PRESSÃO DIVERGENTE' },
      correctLetter: 'C',
    });
    expect(res.verdict).toBe('pass_wrong_letter');
  });

  it('sem gabarito nas alternativas não julga', () => {
    const res = judgeBlindReader({
      view,
      answer: { gabarito: 'C', evidencia: 'C erra ao dizer que máxima e mínima se aproximam' },
      correctLetter: null,
    });
    expect(res.verdict).toBe('skip_no_gabarito');
  });
});

describe('runBlindReaderOnQuestion', () => {
  const call: BlindReaderModelCall = async ({ system, user }) => {
    expect(system).toBe(BLIND_READER_SYSTEM_PROMPT);
    const leaked = user.match(/([A-E] erra ao dizer[^.]*)/);
    return {
      json: leaked
        ? { gabarito: leaked[1][0], evidencia: leaked[1] }
        : { gabarito: 'indeterminavel', evidencia: '' },
      model: 'fake-model',
    };
  };

  it('reprova o concept_map que entrega o gabarito', async () => {
    const res = await runBlindReaderOnQuestion(payload(SPOILER_CONCEPT), { slug: 'spoiler', call });
    expect(res.verdict).toBe('fail_leak');
    expect(res.model).toBe('fake-model');
  });

  it('aprova o concept_map que só ensina o conceito', async () => {
    const res = await runBlindReaderOnQuestion(payload(CLEAN_CONCEPT), { slug: 'clean', call });
    expect(res.verdict).toBe('pass_indeterminate');
  });

  it('pula questão sem concept_map sem chamar o modelo', async () => {
    const never: BlindReaderModelCall = async () => {
      throw new Error('não deveria chamar o modelo');
    };
    const res = await runBlindReaderOnQuestion(
      { reverse_study_slides: [{ type: 'logic_flow', steps: ['a'] }] },
      { slug: 'sem-mapa', call: never },
    );
    expect(res.verdict).toBe('skip_no_concept_map');
  });
});

describe('summarizeBlindReaderResults', () => {
  it('conta vereditos e exclui skips do total julgado', async () => {
    const call: BlindReaderModelCall = async () => ({
      json: { gabarito: 'C', evidencia: 'C erra ao dizer que máxima e mínima se aproximam' },
    });
    const results = [
      await runBlindReaderOnQuestion(payload(SPOILER_CONCEPT), { slug: 'a', call }),
      await runBlindReaderOnQuestion(
        { reverse_study_slides: [{ type: 'logic_flow' }] },
        { slug: 'b', call },
      ),
    ];
    const summary = summarizeBlindReaderResults(results, 'examples');
    expect(summary.total).toBe(2);
    expect(summary.judged).toBe(1);
    expect(summary.blocking).toBe(1);
    expect(summary.verdicts.skip_no_concept_map).toBe(1);
  });
});
