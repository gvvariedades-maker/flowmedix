import {
  cleanInstructionText,
  extractExamHeaderFromText,
  extractSubjectLineFromText,
  fixLegacyDangerZoneSlide,
  normalizeQuestaoCatalogPayload,
} from '@/lib/questaoCatalogNormalize';
import { QuestaoCompletaSchema } from '@/lib/validations';
import { buildQuestionSubjectLine } from '@/lib/questionHeader';

const QUADRIX_BLOCK = `QUESTÕES DE TEC DE ENFERMAGEM
Ordenação: Por Matéria e Assunto

QUADRIX - Tec (FUABC)/FUABC/Enfermagem/2025
Enfermagem - Imunização
5001) Quanto à vacinação durante a gestação, assinale a opção correta.`;

describe('questaoCatalogNormalize', () => {
  it('extractExamHeaderFromText parseia cabeçalho do PDF', () => {
    expect(extractExamHeaderFromText(QUADRIX_BLOCK)).toEqual({
      banca: 'QUADRIX',
      orgao: 'FUABC',
      ano: '2025',
    });
    expect(extractSubjectLineFromText(QUADRIX_BLOCK)).toBe('Imunização');
  });

  it('cleanInstructionText remove lixo e enumeração', () => {
    const cleaned = cleanInstructionText(QUADRIX_BLOCK, { subtopico: 'Imunização' });
    expect(cleaned).toBe(
      'Quanto à vacinação durante a gestação, assinale a opção correta.',
    );
  });

  it('cleanInstructionText remove Enfermagem + numeração no início', () => {
    const raw = 'Enfermagem\n227)\nA assistência de enfermagem à saúde da mulher durante o pré-natal.';
    expect(cleanInstructionText(raw)).toBe(
      'A assistência de enfermagem à saúde da mulher durante o pré-natal.',
    );
  });

  it('cleanInstructionText remove só numeração global', () => {
    expect(cleanInstructionText('8091) A intoxicação ou envenenamento é grave.')).toBe(
      'A intoxicação ou envenenamento é grave.',
    );
  });

  it('normalizeQuestaoCatalogPayload corrige meta e instruction', () => {
    const result = normalizeQuestaoCatalogPayload({
      meta: {
        ano: '2025',
        banca: 'QUADRIX',
        orgao: 'Não informado',
        prova: 'Não informado',
        topico: 'Geral',
        subtopico: 'Imunização',
      },
      question_data: {
        instruction: QUADRIX_BLOCK,
        options: [{ id: 'A', text: 'Opção A', is_correct: true }],
      },
      reverse_study_slides: [
        { type: 'concept_map', items: [{ label: 'A', detail: 'd' }] },
        { type: 'golden_rule', content: 'Regra' },
        { type: 'logic_flow', steps: ['Passo 1'] },
        { type: 'danger_zone', content: 'Alerta' },
      ],
    });

    expect(result.changed).toBe(true);
    expect(result.zodValid).toBe(true);
    const meta = (result.payload as { meta: Record<string, string> }).meta;
    expect(meta.topico).toBe('Enfermagem');
    expect(meta.orgao).toBe('FUABC');
    expect(meta.cargo_header).toBe('Técnico de Enfermagem');
    expect(meta.prova).toBe('Técnico de Enfermagem');
    const instruction = (result.payload as { question_data: { instruction: string } }).question_data
      .instruction;
    expect(instruction).toBe(
      'Quanto à vacinação durante a gestação, assinale a opção correta.',
    );
  });

  it('fixLegacyDangerZoneSlide corrige danger_zone sem content e itens com text', () => {
    const slide: Record<string, unknown> = {
      type: 'danger_zone',
      title: 'ZONA DE PERIGO: Erros',
      description: 'Evite armadilhas.',
      items: [{ id: '1', text: 'Erro comum: confundir unidades.' }],
      footer_rule: 'Regra',
    };
    expect(fixLegacyDangerZoneSlide(slide)).toBe(true);
    expect(slide.content).toBe('ZONA DE PERIGO: Erros');
    expect(slide.title).toBeUndefined();
    expect((slide.items as { label: string; detail: string }[])[0].label).toBe('Erro comum');
    expect((slide.items as { detail: string }[])[0].detail).toBe('confundir unidades.');
  });

  it('normaliza questão FAU com danger_zone legado para Zod válido', () => {
    const result = normalizeQuestaoCatalogPayload({
      meta: {
        ano: '2025',
        banca: 'Fau Unicentro',
        orgao: 'Enfermagem',
        topico: 'Enfermagem',
        subtopico: 'Noções de Fisiologia',
      },
      question_data: {
        instruction: 'Corresponde a um valor de pressão arterial.',
        options: [{ id: 'E', text: '120 mmHg.', is_correct: true }],
      },
      reverse_study_slides: [
        { type: 'concept_map', items: [{ label: 'PA', detail: 'd' }] },
        { type: 'golden_rule', content: 'Regra' },
        { type: 'logic_flow', steps: ['Passo'] },
        {
          type: 'danger_zone',
          title: 'ZONA DE PERIGO: Erros na Medição',
          description: 'Evite armadilhas.',
          items: [{ label: 'Manguito', detail: 'Tamanho errado.' }],
        },
      ],
    });
    expect(result.zodValid).toBe(true);
    expect(QuestaoCompletaSchema.safeParse(result.payload).success).toBe(true);
  });
});

describe('buildQuestionSubjectLine', () => {
  it('exibe só subtopico quando topico é exatamente Enfermagem', () => {
    expect(
      buildQuestionSubjectLine({ banca: 'Q', topico: 'Enfermagem', subtopico: 'Imunização' }),
    ).toBe('Imunização');
  });

  it('mantém topico composto fora de Enfermagem exato', () => {
    expect(
      buildQuestionSubjectLine({
        banca: 'Q',
        topico: 'Fundamentos de Enfermagem',
        subtopico: 'SAE',
      }),
    ).toBe('Fundamentos de Enfermagem - SAE');
  });
});
