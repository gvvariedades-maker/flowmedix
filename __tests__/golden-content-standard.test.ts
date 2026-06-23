import fs from 'node:fs';
import path from 'node:path';

import {
  GOLDEN_BANNED_PHRASES,
  GOLDEN_CONTENT_STANDARD_VERSION,
  hasQuestionSpecificity,
  isGoldenContentCompliant,
  lintClaimSourceBinding,
  lintGabaritoConsistency,
  lintGoldenContent,
  lintLogicFlowRecycling,
} from '@/lib/goldenContentStandard';
import { FAMILY_GOLDEN_FILE } from '@/lib/catalogMigration/classifyFamily';
import { GUIDELINE_TABLES } from '@/lib/guidelines';
import { QuestaoCompletaSchema } from '@/lib/validations';

const EXAMPLES_DIR = path.join(process.cwd(), 'examples');

function loadPremiumExamples(): { file: string; data: unknown }[] {
  return fs
    .readdirSync(EXAMPLES_DIR)
    .filter((f) => f.startsWith('questao-premium-') && f.endsWith('.json'))
    .sort()
    .map((file) => ({
      file,
      data: JSON.parse(fs.readFileSync(path.join(EXAMPLES_DIR, file), 'utf8')),
    }));
}

describe('golden-content-standard v1', () => {
  const premiums = loadPremiumExamples();

  it('template e constantes definidos', () => {
    expect(GOLDEN_CONTENT_STANDARD_VERSION).toBe('golden-v1');
    expect(GOLDEN_BANNED_PHRASES.length).toBeGreaterThan(5);
    expect(Object.keys(GUIDELINE_TABLES).length).toBeGreaterThanOrEqual(2);
  });

  it('piloto Imunização CPCON declara golden-v1', () => {
    const pilot = premiums.find((p) => p.file.includes('cpcon-imunizacao-intervalos-vf'));
    expect(pilot).toBeDefined();
    const meta = (pilot!.data as { meta?: { content_standard?: string } }).meta;
    expect(meta?.content_standard).toBe('golden-v1');
  });

  it.each(premiums.map((p) => [p.file, p.data] as const))(
    '%s valida QuestaoCompletaSchema',
    (_file, data) => {
      const parsed = QuestaoCompletaSchema.safeParse(data);
      expect(parsed.success).toBe(true);
    },
  );

  it.each(
    premiums
      .filter((p) => {
        const meta = (p.data as { meta?: { content_standard?: string } }).meta;
        return meta?.content_standard === GOLDEN_CONTENT_STANDARD_VERSION;
      })
      .map((p) => [p.file, p.data] as const),
  )('%s passa lintGoldenContent (golden-v1)', (file, data) => {
    const issues = lintGoldenContent(data);
    if (issues.length > 0) {
      const detail = issues.map((i) => `${i.code}: ${i.message}`).join('\n');
      throw new Error(`${file}\n${detail}`);
    }
    expect(isGoldenContentCompliant(data)).toBe(true);
  });

  it.each(Object.entries(FAMILY_GOLDEN_FILE))(
    'golden de referência %s declara golden-v1 e passa lint',
    (_family, filename) => {
      const filePath = path.join(EXAMPLES_DIR, filename);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const meta = (data as { meta?: { content_standard?: string } }).meta;
      expect(meta?.content_standard).toBe(GOLDEN_CONTENT_STANDARD_VERSION);
      const issues = lintGoldenContent(data);
      if (issues.length > 0) {
        const detail = issues.map((i) => `${i.code}: ${i.message}`).join('\n');
        throw new Error(`${filename}\n${detail}`);
      }
    },
  );

  it('hasQuestionSpecificity detecta letra e romano', () => {
    const q = {
      question_data: {
        instruction: 'Vacina pneumocócica VPC13 intervalo oito semanas',
        options: [
          { id: 'A', text: 'x', is_correct: false },
          { id: 'C', text: 'y', is_correct: true },
        ],
      },
    };
    expect(hasQuestionSpecificity('Localizar alternativa C após julgar I', q)).toBe(true);
  });

  it('lintGoldenContent ignora questões sem content_standard', () => {
    const generic = premiums.find((p) => !((p.data as { meta?: { content_standard?: string } }).meta?.content_standard));
    expect(generic).toBeDefined();
    expect(lintGoldenContent(generic!.data)).toEqual([]);
  });

  describe('consistência de gabarito', () => {
    const q = {
      question_data: {
        options: [
          { id: 'A', text: 'alternativa a', is_correct: false },
          { id: 'B', text: 'alternativa b', is_correct: true },
        ],
      },
    };

    it('detecta gabarito citado divergente do is_correct', () => {
      const slides = [{ type: 'danger_zone', items: [{ correct: 'Gabarito letra A — explicação' }] }];
      const codes = lintGabaritoConsistency(slides, q).map((i) => i.code);
      expect(codes).toContain('gabarito_mismatch');
    });

    it('aceita gabarito consistente em rows e concept_map', () => {
      const slides = [
        { type: 'concept_map', items: [{ label: 'Gabarito', detail: 'Letra B — correta' }] },
        { type: 'golden_rule', rows: [{ label: 'Gabarito', value: 'Letra B' }] },
        { type: 'danger_zone', items: [{ correct: 'Gabarito letra B — explicação' }] },
      ];
      expect(lintGabaritoConsistency(slides, q)).toEqual([]);
    });

    it('não confunde distrator "Letra D" do item seguinte com o gabarito', () => {
      const slides = [
        {
          type: 'danger_zone',
          items: [
            { correct: 'III e IV são verdadeiras — entram no gabarito.' },
            { label: 'Letra D — distrator', correct: 'Gabarito letra B — explica.' },
          ],
        },
      ];
      expect(lintGabaritoConsistency(slides, q)).toEqual([]);
    });
  });

  describe('anti-reciclagem de logic_flow', () => {
    const q = {
      question_data: {
        options: [
          {
            id: 'A',
            text: 'Pegar o cateter com a mão dominante com o bisel da agulha voltado para cima no sentido do retorno venoso',
            is_correct: false,
          },
          { id: 'B', text: 'segunda alternativa distinta', is_correct: true },
        ],
      },
    };

    it('reprova steps que copiam o texto das alternativas', () => {
      const slides = [
        {
          type: 'logic_flow',
          steps: [
            'Pegar o cateter com a mão dominante com o bisel da agulha voltado para cima no sentido',
            'Pegar o cateter com a mão dominante com o bisel da agulha voltado para cima',
          ],
        },
      ];
      expect(lintLogicFlowRecycling(slides, q).map((i) => i.code)).toContain('logic_flow_recycled');
    });

    it('aceita steps que ensinam estratégia (não cópia)', () => {
      const slides = [
        {
          type: 'logic_flow',
          steps: ['Ler o comando EXCETO', 'Eliminar A: técnica correta', 'Marcar B'],
        },
      ];
      expect(lintLogicFlowRecycling(slides, q)).toEqual([]);
    });
  });

  describe('claim↔source binding', () => {
    const numClaim = [{ type: 'golden_rule', rows: [{ label: 'Dose', value: '500 mg a cada 8 horas' }] }];

    it('reprova número normativo sem source substantiva (covers)', () => {
      const codes = lintClaimSourceBinding(numClaim, {
        sources: [{ id: 'x', tier: 'A', issuer: 'MS', title: 't', year: 2020 }],
      }).map((i) => i.code);
      expect(codes).toContain('numeric_claim_unsourced');
    });

    it('aceita número com source que tem covers', () => {
      expect(
        lintClaimSourceBinding(numClaim, {
          sources: [{ id: 'x', tier: 'A', issuer: 'MS', title: 't', year: 2020, covers: ['dose'] }],
        }),
      ).toEqual([]);
    });

    it('ignora slides sem claim numérico', () => {
      expect(
        lintClaimSourceBinding([{ type: 'golden_rule', content: 'sem números aqui' }], { sources: [] }),
      ).toEqual([]);
    });
  });

  describe('especificidade semântica', () => {
    it('inclui vocabulário da alternativa correta no pool (enunciado curto)', () => {
      const pilot = premiums.find((p) => p.file.includes('fundatec-meningococica-3meses'))!.data;
      const codes = lintGoldenContent(pilot).map((i) => i.code);
      expect(codes).not.toContain('specificity_semantic');
    });

    it('reprova slides genéricos que não citam o vocabulário da questão', () => {
      const base = premiums.find((p) => p.file.includes('idecan-saude-mental-reducao-danos'))!.data as Record<
        string,
        unknown
      >;
      const generic = {
        ...base,
        reverse_study_slides: [
          {
            type: 'concept_map',
            items: [
              { label: 'x', detail: 'texto totalmente abstrato sem vinculo', icon: 'Heart' },
              { label: 'y', detail: 'outra frase vazia qualquer', icon: 'Heart' },
              { label: 'z', detail: 'mais conteudo solto', icon: 'Heart' },
            ],
          },
          { type: 'golden_rule', content: 'REGRA', rows: [{ label: 'Gabarito', value: 'Letra B' }] },
          { type: 'logic_flow', reveal_mode: 'tap', steps: ['passo abstrato um', 'passo abstrato dois', 'passo abstrato tres'] },
          {
            type: 'danger_zone',
            content: 'X',
            items: [
              { label: 'p', detail: 'q', correct: 'Gabarito letra B — r' },
              { label: 's', detail: 't', correct: 'Gabarito letra B — u' },
            ],
          },
        ],
      };
      expect(lintGoldenContent(generic).map((i) => i.code)).toContain('specificity_semantic');
    });
  });

  it('rejeita golden-v1 sem sources', () => {
    const pilot = premiums.find((p) => p.file.includes('cpcon-imunizacao-intervalos-vf'))!.data as {
      meta: Record<string, unknown>;
    };
    const broken = {
      ...pilot,
      meta: { ...pilot.meta, sources: [] },
    };
    const codes = lintGoldenContent(broken).map((i) => i.code);
    expect(codes).toContain('meta_sources');
  });
});
