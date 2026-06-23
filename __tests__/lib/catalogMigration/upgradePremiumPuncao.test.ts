import golden from '@/examples/questao-premium-admtec-puncao-venosa-cateteres.json';
import excetoGolden from '@/examples/questao-premium-cev-urca-puncao-exceto-med-endovenosa.json';
import flebiteGolden from '@/examples/questao-premium-avancasp-puncao-infiltracao-flebite.json';
import dispositivoGolden from '@/examples/questao-premium-gama-puncao-scalp-jelco-calibre.json';
import tempoGolden from '@/examples/questao-premium-cpcon-puncao-troca-equipos-intervalos.json';
import perifericaGolden from '@/examples/questao-premium-funpar-puncao-tecnica-periferica.json';
import { PREMIUM_STUB_MARKERS } from '@/lib/catalogMigration/upgradePremiumHybrid';
import {
  buildPuncaoChoiceSlides,
  buildPuncaoPremiumSlides,
  canBuildPuncaoPremiumSlides,
  inferPuncaoTopic,
  isPuncaoSubtopico,
  PUNCAO_EXCETO_GOLDEN_FILE,
  PUNCAO_PERIFERICA_GOLDEN_FILE,
  PUNCAO_TEMPO_GOLDEN_FILE,
  PUNCAO_DISPOSITIVO_GOLDEN_FILE,
  PUNCAO_FLEBITE_GOLDEN_FILE,
  PUNCAO_GOLDEN_FILE,
  puncaoGoldenReferenceForInput,
} from '@/lib/catalogMigration/upgradePremiumPuncao';
import { upgradePremiumHybrid } from '@/lib/catalogMigration/upgradePremiumHybrid';
import { QuestaoCompletaSchema } from '@/lib/validations';

const GENERIC_PUNCAO = {
  meta: {
    banca: 'Adm&Tec',
    topico: 'Enfermagem',
    subtopico: 'Punção Venosa e Cuidados com Cateteres',
    ano: '2025',
  },
  question_data: golden.question_data,
  reverse_study_slides: [
    { type: 'concept_map', items: [{ label: 'Ponto 1', detail: 'Relacione o tema' }] },
    { type: 'golden_rule', content: 'Regra essencial genérica' },
    { type: 'logic_flow', steps: ['Passo genérico'] },
    {
      type: 'danger_zone',
      content: 'Erros comuns',
      items: [{ label: 'Ponto 1', detail: 'Erro genérico' }],
    },
  ],
};

function slideText(slides: { type: string }[]): string {
  return JSON.stringify(slides).toLowerCase();
}

describe('upgradePremiumPuncao', () => {
  it('isPuncaoSubtopico reconhece nome canônico', () => {
    expect(isPuncaoSubtopico('Punção Venosa e Cuidados com Cateteres')).toBe(true);
    expect(isPuncaoSubtopico('Curativos e Manejo de Feridas')).toBe(false);
  });

  it('inferPuncaoTopic detecta IPCS no CVC', () => {
    const topic = inferPuncaoTopic(
      golden.question_data.instruction,
      golden.question_data.options,
    );
    expect(topic).toBe('Prevenção de IPCS no CVC');
  });

  it('buildPuncaoPremiumSlides gera 4 slides no padrão golden Adm&Tec', () => {
    const slides = buildPuncaoPremiumSlides({
      instruction: golden.question_data.instruction,
      options: golden.question_data.options,
      topico: 'Enfermagem',
      subtopico: 'Punção Venosa e Cuidados com Cateteres',
    });

    expect(slides.map((s) => s.type)).toEqual([
      'concept_map',
      'golden_rule',
      'logic_flow',
      'danger_zone',
    ]);

    const cm = slides[0] as { items?: { label: string }[] };
    expect(cm.items?.some((i) => i.label === 'Contexto')).toBe(true);
    expect(cm.items?.some((i) => i.label === 'Barreira estéril')).toBe(true);
    expect(cm.items?.some((i) => i.label === 'Gabarito')).toBe(true);

    const gr = slides[1] as { rows?: { label: string; badge?: string }[]; content?: string };
    expect(gr.content).toContain('BUNDLE');
    expect(gr.rows?.some((r) => r.label === 'Barreira')).toBe(true);
    expect(gr.rows?.some((r) => r.badge === 'hot')).toBe(true);

    const lf = slides[2] as { reveal_mode?: string; steps?: string[] };
    expect(lf.reveal_mode).toBe('tap');
    expect(lf.steps?.some((s) => s.includes('letra B'))).toBe(true);

    const dz = slides[3] as { items?: { correct?: string }[]; bullet_style?: string };
    expect(dz.bullet_style).toBe('x_icon');
    expect(dz.items?.every((i) => i.correct?.includes('Gabarito letra B'))).toBe(true);
  });

  it('inferPuncaoTopic detecta EXCETO em medicação endovenosa', () => {
    const topic = inferPuncaoTopic(
      excetoGolden.question_data.instruction,
      excetoGolden.question_data.options,
    );
    expect(topic).toBe('EXCETO — técnica / conduta');
  });

  it('buildPuncaoChoiceSlides EXCETO não usa vocabulário IPCS/CVC', () => {
    const slides = buildPuncaoChoiceSlides({
      instruction: excetoGolden.question_data.instruction,
      options: excetoGolden.question_data.options,
      topico: 'Enfermagem',
      subtopico: 'Punção Venosa e Cuidados com Cateteres',
    });
    const text = JSON.stringify(slides).toLowerCase();
    expect(text).not.toContain('bundle do cvc');
    expect(text).not.toContain('ipcs');
    const dz = slides[3] as { items?: { correct?: string }[] };
    expect(dz.items?.every((i) => i.correct?.includes('Gabarito letra D'))).toBe(true);
    const corrects = dz.items?.map((i) => i.correct ?? '') ?? [];
    expect(new Set(corrects).size).toBe(corrects.length);
    expect(corrects.some((c) => c.toLowerCase().includes('antissepsia'))).toBe(true);
    expect(corrects.some((c) => c.toLowerCase().includes('identificar'))).toBe(true);
    expect(corrects.some((c) => c.toLowerCase().includes('novo cateter'))).toBe(true);
  });

  it('inferPuncaoTopic detecta Flebite em infiltração × complicações', () => {
    const topic = inferPuncaoTopic(
      flebiteGolden.question_data.instruction,
      flebiteGolden.question_data.options,
    );
    expect(topic).toBe('Flebite e complicações');
  });

  it('buildPuncaoChoiceSlides Flebite não usa vocabulário IPCS/CVC', () => {
    const slides = buildPuncaoChoiceSlides({
      instruction: flebiteGolden.question_data.instruction,
      options: flebiteGolden.question_data.options,
      topico: 'Enfermagem',
      subtopico: 'Punção Venosa e Cuidados com Cateteres',
    });
    const text = JSON.stringify(slides).toLowerCase();
    expect(text).not.toContain('bundle do cvc');
    expect(text).not.toContain('ipcs');
    expect(text).toContain('infiltra');
    const gr = slides[1] as { slide_title?: string; rows?: { label: string }[] };
    expect(gr.slide_title).toContain('complicações');
    const dz = slides[3] as { items?: { correct?: string }[] };
    expect(dz.items?.every((i) => i.correct?.includes('Gabarito letra E'))).toBe(true);
  });

  it('inferPuncaoTopic detecta Punção periférica em técnica ANVISA', () => {
    const topic = inferPuncaoTopic(
      perifericaGolden.question_data.instruction,
      perifericaGolden.question_data.options,
    );
    expect(topic).toBe('Punção venosa periférica');
  });

  it('inferPuncaoTopic prioriza punção sobre tempo em garrote técnico', () => {
    const topic = inferPuncaoTopic(
      'Para realizar a punção venosa periférica, recomenda-se usar um garrote acima do local da punção. O tempo de uso do garrote não deve exceder',
      [
        { id: 'A', text: 'cinco minutos.', is_correct: false },
        { id: 'E', text: 'um minuto.', is_correct: true },
      ],
    );
    expect(topic).toBe('Punção venosa periférica');
  });

  it('buildPuncaoChoiceSlides Punção periférica não usa vocabulário IPCS/CVC', () => {
    const slides = buildPuncaoChoiceSlides({
      instruction: perifericaGolden.question_data.instruction,
      options: perifericaGolden.question_data.options,
      topico: 'Enfermagem',
      subtopico: 'Punção Venosa e Cuidados com Cateteres',
    });
    const text = JSON.stringify(slides).toLowerCase();
    expect(text).not.toContain('bundle do cvc');
    expect(text).not.toContain('ipcs');
    expect(text).toContain('garrote');
    const dz = slides[3] as { items?: { correct?: string }[] };
    expect(dz.items?.every((i) => i.correct?.includes('Gabarito letra A'))).toBe(true);
  });

  it('puncaoGoldenReferenceForInput roteia golden Punção periférica', () => {
    expect(
      puncaoGoldenReferenceForInput(
        perifericaGolden.question_data.instruction,
        perifericaGolden.question_data.options,
      ),
    ).toBe(PUNCAO_PERIFERICA_GOLDEN_FILE);
  });

  it('golden FUNPAR Punção periférica é válido no QuestaoCompletaSchema', () => {
    const parsed = QuestaoCompletaSchema.safeParse(perifericaGolden);
    expect(parsed.success).toBe(true);
  });

  it('inferPuncaoTopic detecta Tempo em troca de equipos', () => {
    const topic = inferPuncaoTopic(
      tempoGolden.question_data.instruction,
      tempoGolden.question_data.options,
    );
    expect(topic).toBe('Tempo / observação pós-procedimento');
  });

  it('buildPuncaoChoiceSlides Tempo não usa vocabulário IPCS/CVC', () => {
    const slides = buildPuncaoChoiceSlides({
      instruction: tempoGolden.question_data.instruction,
      options: tempoGolden.question_data.options,
      topico: 'Enfermagem',
      subtopico: 'Punção Venosa e Cuidados com Cateteres',
    });
    const text = JSON.stringify(slides).toLowerCase();
    expect(text).not.toContain('bundle do cvc');
    expect(text).toContain('96');
    const dz = slides[3] as { items?: { correct?: string }[] };
    expect(dz.items?.every((i) => i.correct?.includes('Gabarito letra E'))).toBe(true);
  });

  it('puncaoGoldenReferenceForInput roteia golden Tempo', () => {
    expect(
      puncaoGoldenReferenceForInput(
        tempoGolden.question_data.instruction,
        tempoGolden.question_data.options,
      ),
    ).toBe(PUNCAO_TEMPO_GOLDEN_FILE);
  });

  it('golden CPCON Tempo é válido no QuestaoCompletaSchema', () => {
    const parsed = QuestaoCompletaSchema.safeParse(tempoGolden);
    expect(parsed.success).toBe(true);
  });

  it('inferPuncaoTopic detecta Dispositivo em scalp × jelco', () => {
    const topic = inferPuncaoTopic(
      dispositivoGolden.question_data.instruction,
      dispositivoGolden.question_data.options,
    );
    expect(topic).toBe('Dispositivo / calibre / jelco');
  });

  it('buildPuncaoChoiceSlides Dispositivo não usa vocabulário IPCS/CVC', () => {
    const slides = buildPuncaoChoiceSlides({
      instruction: dispositivoGolden.question_data.instruction,
      options: dispositivoGolden.question_data.options,
      topico: 'Enfermagem',
      subtopico: 'Punção Venosa e Cuidados com Cateteres',
    });
    const text = JSON.stringify(slides).toLowerCase();
    expect(text).not.toContain('bundle do cvc');
    expect(text).not.toContain('ipcs');
    expect(text).toContain('scalp');
    expect(text).toContain('jelco');
    const gr = slides[1] as { slide_title?: string };
    expect(gr.slide_title).toContain('scalp');
    const dz = slides[3] as { items?: { correct?: string }[] };
    expect(dz.items?.every((i) => i.correct?.includes('Gabarito letra C'))).toBe(true);
  });

  it('puncaoGoldenReferenceForInput roteia golden Dispositivo', () => {
    expect(
      puncaoGoldenReferenceForInput(
        dispositivoGolden.question_data.instruction,
        dispositivoGolden.question_data.options,
      ),
    ).toBe(PUNCAO_DISPOSITIVO_GOLDEN_FILE);
  });

  it('golden GAMA Dispositivo é válido no QuestaoCompletaSchema', () => {
    const parsed = QuestaoCompletaSchema.safeParse(dispositivoGolden);
    expect(parsed.success).toBe(true);
  });

  it('puncaoGoldenReferenceForInput roteia golden EXCETO e Flebite', () => {
    expect(
      puncaoGoldenReferenceForInput(
        excetoGolden.question_data.instruction,
        excetoGolden.question_data.options,
      ),
    ).toBe(PUNCAO_EXCETO_GOLDEN_FILE);
    expect(
      puncaoGoldenReferenceForInput(
        flebiteGolden.question_data.instruction,
        flebiteGolden.question_data.options,
      ),
    ).toBe(PUNCAO_FLEBITE_GOLDEN_FILE);
    expect(
      puncaoGoldenReferenceForInput(
        golden.question_data.instruction,
        golden.question_data.options,
      ),
    ).toBe(PUNCAO_GOLDEN_FILE);
  });

  it('golden Flebite AVANÇASP é válido no QuestaoCompletaSchema', () => {
    const parsed = QuestaoCompletaSchema.safeParse(flebiteGolden);
    expect(parsed.success).toBe(true);
  });

  it('buildPuncaoChoiceSlides gera danger_zone compare por letra errada', () => {
    const slides = buildPuncaoChoiceSlides({
      instruction: golden.question_data.instruction,
      options: golden.question_data.options,
      topico: 'Enfermagem',
      subtopico: 'Punção Venosa e Cuidados com Cateteres',
    });
    const dz = slides[3] as { items?: { label: string; correct?: string }[] };
    expect(dz.items?.length).toBe(3);
    expect(dz.items?.some((i) => i.label.includes('Letra A'))).toBe(true);
    const corrects = dz.items?.map((i) => i.correct).filter(Boolean) ?? [];
    expect(new Set(corrects).size).toBeGreaterThan(1);
  });

  it('canBuildPuncaoPremiumSlides aceita múltipla escolha e VF', () => {
    expect(
      canBuildPuncaoPremiumSlides(golden.question_data.instruction, 'conceito'),
    ).toBe(true);
    const vfInstruction =
      'Sobre acesso venoso, julgue:\n' +
      'I- Clorexidina alcoólica antes da inserção.\n' +
      'II- Curativo trocado só quando sujo ou solto.\n' +
      'III- Femoral é preferência de rotina.\n' +
      'É CORRETO o que se afirma apenas em:';
    expect(canBuildPuncaoPremiumSlides(vfInstruction, 'vf')).toBe(true);
  });

  it('upgrade híbrido usa builder Punção para questão genérica IPCS', () => {
    const result = upgradePremiumHybrid(GENERIC_PUNCAO);
    expect(result.changed).toBe(true);
    expect(result.zodValid).toBe(true);
    expect(result.goldenReference).toBe(PUNCAO_GOLDEN_FILE);
    expect(result.changes).toEqual([
      'concept_map',
      'golden_rule',
      'logic_flow',
      'danger_zone',
    ]);

    const slides = result.payload.reverse_study_slides as { type: string }[];
    const text = slideText(slides);
    for (const marker of PREMIUM_STUB_MARKERS) {
      expect(text).not.toContain(marker);
    }

    const gr = slides.find((s) => s.type === 'golden_rule') as { rows?: unknown[] };
    expect(gr.rows?.length).toBeGreaterThanOrEqual(4);

    const parsed = QuestaoCompletaSchema.safeParse(result.payload);
    expect(parsed.success).toBe(true);
  });

  it('golden Adm&Tec permanece válido após upgrade idempotente', () => {
    const result = upgradePremiumHybrid(golden, { force: true });
    expect(result.zodValid).toBe(true);
    const text = slideText(result.payload.reverse_study_slides as { type: string }[]);
    for (const marker of PREMIUM_STUB_MARKERS) {
      expect(text).not.toContain(marker);
    }
  });

  it('inferPuncaoTopic roteia Default cluster para ramos corretos', () => {
    expect(
      inferPuncaoTopic('Paciente com infiltração no local da punção.', [
        { id: 'A', text: 'Manter infusão', is_correct: false },
        { id: 'B', text: 'Interromper e retirar cateter', is_correct: true },
      ]),
    ).toBe('Flebite e complicações');

    expect(
      inferPuncaoTopic('Riscos da punção da veia jugular interna:', [
        { id: 'A', text: 'Punção arterial acidental', is_correct: true },
        { id: 'B', text: 'Atrofia muscular', is_correct: false },
      ]),
    ).toBe('Acesso venoso central');

    expect(
      inferPuncaoTopic('PAM invasiva — artérias de escolha:', [
        { id: 'A', text: 'Radial e femoral', is_correct: true },
        { id: 'B', text: 'Braquial e poplítea', is_correct: false },
      ]),
    ).toBe('Acesso arterial / PAM');

    expect(
      inferPuncaoTopic('Venóclise é a infusão de fluidos por veia.', [
        { id: 'A', text: 'Certo', is_correct: true },
        { id: 'B', text: 'Errado', is_correct: false },
      ]),
    ).toBe('Punção venosa periférica');
  });

  it('inferPuncaoTopic não roteia IPCS só por alternativa (COGEPS venopunção)', () => {
    expect(
      inferPuncaoTopic('Sobre a técnica de venopunção periférica, É CORRETO:', [
        { id: 'A', text: 'Barreira estéril máxima na inserção do CVC.', is_correct: false },
        { id: 'B', text: 'Garrote 5–15 cm acima do sítio de punção.', is_correct: true },
      ]),
    ).toBe('Punção venosa periférica');
  });

  it('inferPuncaoTopic roteia caudas lote 09 (fundatec, selecon)', () => {
    expect(
      inferPuncaoTopic(
        'É de responsabilidade da equipe de enfermagem, durante o procedimento de punção venosa, a escolha do cateter. Qual é o cateter recomendado para punções decurta permanência em torno de 72 horas?',
        [
          { id: 'A', text: 'Dispositivo venoso periférico tipo agulhado.', is_correct: false },
          { id: 'E', text: 'Dispositivo venoso periférico flexível.', is_correct: true },
        ],
      ),
    ).toBe('Dispositivo / calibre / jelco');

    expect(
      inferPuncaoTopic(
        'Uma das medidas mais eficazes no bundle de manutenção de cateter venoso é a prática de desinfecção com álcool 70% dos canhões dos acessos vasculares e das torneirinhas, também chamadas de:',
        [
          { id: 'A', text: 'hubs', is_correct: false },
          { id: 'C', text: 'dânulas', is_correct: true },
        ],
      ),
    ).toBe('Manutenção de cateter');
  });

  it('buildPuncaoChoiceSlides Default não injeta vocabulário IPCS/CVC', () => {
    const slides = buildPuncaoChoiceSlides({
      instruction: 'Riscos da punção da veia jugular interna:',
      options: [
        { id: 'A', text: 'Punção arterial acidental', is_correct: true },
        { id: 'B', text: 'Lesão do nervo vago', is_correct: false },
        { id: 'C', text: 'Atrofia muscular', is_correct: false },
      ],
      topico: 'Enfermagem',
      subtopico: 'Punção Venosa e Cuidados com Cateteres',
    });
    const text = JSON.stringify(slides).toLowerCase();
    expect(text).not.toContain('bundle');
    expect(text).not.toContain('ipcs');
    expect(text).not.toContain('barreira estéril máxima');
    expect(text).not.toContain('remoção precoce');
    expect(text).toContain('jugular');
  });
});
