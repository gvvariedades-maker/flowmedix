import fs from 'node:fs';
import path from 'node:path';

import {
  CARD_DENSITY_LIMITS,
  GOLDEN_BANNED_PHRASES,
  GOLDEN_CONTENT_STANDARD_VERSION,
  dangerItemBoundLetter,
  hasQuestionSpecificity,
  isGoldenContentCompliant,
  lintCardDensity,
  lintClaimSourceBinding,
  lintDangerZoneMcqCoverage,
  lintGabaritoConsistency,
  lintGoldenContent,
  lintGoldenRuleGabaritoSpoiler,
  lintGoldenV2Pedagogy,
  lintLogicFlowPortableFixation,
  lintLogicFlowRecycling,
  lintSlideLayerRedundancy,
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

  describe('redundância entre camadas (v2)', () => {
    it('reprova golden_rule que copia logic_flow', () => {
      const notificacao =
        'violência sexual é agravo de notificação compulsória imediata suspeita ou confirmação';
      const local =
        'residência das crianças e dos adolescentes é o principal espaço da violência sexual';
      const slides = [
        {
          type: 'logic_flow',
          steps: [`A nega que ${notificacao}`, `C confirma que ${local}`, 'Marcar letra C'],
        },
        {
          type: 'golden_rule',
          rows: [
            { label: 'NOTIFICAÇÃO', value: notificacao },
            { label: 'LOCAL', value: local },
          ],
        },
      ];
      expect(lintSlideLayerRedundancy(slides).map((i) => i.code)).toContain(
        'slide_layer_redundancy_golden_logic',
      );
    });

    it('aceita camadas complementares (decore vs estratégia)', () => {
      const slides = [
        {
          type: 'concept_map',
          items: [{ label: 'Notificação', detail: 'Compulsória na suspeita' }],
        },
        {
          type: 'logic_flow',
          steps: ['Comando: afirmativa correta', 'Eliminar A: nega notificação', 'Marcar C'],
        },
        {
          type: 'golden_rule',
          rows: [{ label: 'Sinan', value: 'Notificação imediata — MS' }],
        },
      ];
      expect(lintSlideLayerRedundancy(slides)).toEqual([]);
    });

    it('detecta row de gabarito no golden_rule (v2)', () => {
      const slides = [
        {
          type: 'golden_rule',
          rows: [{ label: 'Gabarito', value: 'Letra C' }],
        },
      ];
      expect(lintGoldenRuleGabaritoSpoiler(slides).map((i) => i.code)).toContain(
        'golden_rule_gabarito_spoiler',
      );
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

  describe('handcraft v2 (strict-v2-pedagogy)', () => {
    const mcqQ = {
      meta: { family: 'conceito' as const },
      question_data: {
        instruction: 'Assinale a alternativa correta sobre absorção.',
        options: [
          { id: 'A', text: 'a', is_correct: false },
          { id: 'B', text: 'b', is_correct: true },
          { id: 'C', text: 'c', is_correct: false },
          { id: 'D', text: 'd', is_correct: false },
        ],
      },
    };

    it('dangerItemBoundLetter parseia label Letra X', () => {
      expect(dangerItemBoundLetter({ label: 'Letra B — IV' })).toBe('B');
      expect(dangerItemBoundLetter({ label: 'Confundir vias' })).toBeNull();
    });

    it('reprova danger_zone sem letra errada e sem transferência', () => {
      const slides = [
        {
          type: 'danger_zone',
          items: [
            { label: 'Letra A — x', detail: 'd', correct: 'c1' },
            { label: 'Letra B — gabarito', detail: 'd', correct: 'c2' },
          ],
        },
      ];
      const codes = lintDangerZoneMcqCoverage(slides, mcqQ, 'conceito').map((i) => i.code);
      expect(codes).toContain('danger_zone_letter_coverage');
      expect(codes).toContain('danger_zone_transfer_missing');
    });

    it('aceita danger_zone com letras erradas + transferência', () => {
      const slides = [
        {
          type: 'danger_zone',
          items: [
            { label: 'Letra A — x', detail: 'd', correct: 'c1' },
            { label: 'Letra C — y', detail: 'd', correct: 'c2' },
            { label: 'Letra D — z', detail: 'd', correct: 'c3' },
            {
              label: 'Confundir oral e retal',
              detail: 'Transferência: banca inverte 1ª passagem.',
              correct: 'Pergunte: passa pelo fígado?',
            },
          ],
        },
      ];
      expect(lintDangerZoneMcqCoverage(slides, mcqQ, 'conceito')).toEqual([]);
    });

    it('não exige letras em danger_zone temático (legado)', () => {
      const slides = [
        {
          type: 'danger_zone',
          items: [
            { label: 'Pulso a cada ciclo', detail: 'd', correct: 'c1' },
            { label: 'Hiperventilar', detail: 'd', correct: 'c2' },
          ],
        },
      ];
      expect(lintDangerZoneMcqCoverage(slides, mcqQ, 'protocolo')).toEqual([]);
    });

    it('reprova logic_flow MCQ sem fixação no último step', () => {
      const slides = [
        {
          type: 'logic_flow',
          steps: ['Eliminar A', 'Eliminar C', 'Marcar B'],
        },
      ];
      expect(lintLogicFlowPortableFixation(slides).map((i) => i.code)).toContain(
        'logic_flow_fixation_missing',
      );
    });

    it('aceita fixação no último step', () => {
      const slides = [
        {
          type: 'logic_flow',
          steps: ['Eliminar A', 'Marcar B', 'Em similares: teste mecanismo antes da letra.'],
        },
      ];
      expect(lintLogicFlowPortableFixation(slides)).toEqual([]);
    });

    it('ignora fixação em fluxo procedural sem eliminação por letra', () => {
      const slides = [
        {
          type: 'logic_flow',
          steps: ['Garantir segurança', 'Iniciar compressões', 'Aplicar DEA'],
        },
      ];
      expect(lintLogicFlowPortableFixation(slides)).toEqual([]);
    });

    it('reprova campo acima do limite duro §3b', () => {
      const long = 'x'.repeat(CARD_DENSITY_LIMITS.logic_flow_step.hard + 1);
      const slides = [{ type: 'logic_flow', steps: [long] }];
      expect(lintCardDensity(slides).map((i) => i.code)).toContain('card_density_logic_step');
    });

    it('âncoras FAMILY_GOLDEN_FILE passam gates handcraft v2 novos', () => {
      const handcraftCodes = new Set([
        'card_density_concept_label',
        'card_density_logic_step',
        'card_density_golden_value',
        'card_density_danger_detail',
        'card_density_danger_correct',
        'card_density_footer_rule',
        'danger_zone_letter_coverage',
        'danger_zone_transfer_missing',
        'logic_flow_fixation_missing',
      ]);
      for (const [, filename] of Object.entries(FAMILY_GOLDEN_FILE)) {
        const data = JSON.parse(
          fs.readFileSync(path.join(EXAMPLES_DIR, filename), 'utf8'),
        ) as {
          meta?: { family?: string };
          reverse_study_slides?: unknown[];
          study_slides?: unknown[];
        };
        const slides = data.reverse_study_slides ?? data.study_slides ?? [];
        const issues = lintGoldenV2Pedagogy(slides as never[], {
          q: data as never,
          family: data.meta?.family as never,
        }).filter((i) => handcraftCodes.has(i.code));
        if (issues.length > 0) {
          throw new Error(`${filename}: ${issues.map((i) => i.code).join(', ')}`);
        }
      }
    });
  });
});
