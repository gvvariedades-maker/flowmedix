import {
  bespokeMoldHasContentAffinity,
  collectSlideTextCorpus,
  shouldApplySubtopicMold,
} from '@/lib/slides/moldAffinity';

describe('moldAffinity', () => {
  describe('Saúde do Adolescente — escore Z (IBAM)', () => {
    const subtopico = 'Saúde do Adolescente';

    const goldenRuleSlide = {
      type: 'golden_rule' as const,
      content: 'CLASSIFICAÇÃO NUTRICIONAL — ESCORE Z DO IMC (5–19 ANOS)',
      rows: [
        { label: 'Sobrepeso', value: '+1 < Z ≤ +2 — letra A' },
        { label: 'Obesidade', value: 'Z > +2' },
      ],
      footer_rule: 'Sobrepeso: +1 a +2 + orientação de alimentação',
    };

    const conceptMapSlide = {
      type: 'concept_map' as const,
      items: [
        { label: 'Escore Z', detail: 'Caderneta do Adolescente + curvas OMS', icon: 'BarChart3' },
        { label: 'Sobrepeso', detail: 'IMC com Z entre +1 e +2', icon: 'Apple' },
        { label: 'Conduta', detail: 'Orientar alimentação', icon: 'HeartPulse' },
      ],
    };

    it('rejeita adolescent-sigilo-spectrum para family calc + rows Z', () => {
      expect(
        bespokeMoldHasContentAffinity('adolescent-sigilo-spectrum', goldenRuleSlide, {
          familyId: 'calc',
          subtopico,
        }),
      ).toBe(false);
    });

    it('rejeita adolescent-privacy-curtain para concept_map nutricional', () => {
      expect(
        bespokeMoldHasContentAffinity('adolescent-privacy-curtain', conceptMapSlide, {
          familyId: 'calc',
          subtopico,
        }),
      ).toBe(false);
    });

    it('aceita adolescent-sigilo-spectrum para conteúdo de sigilo', () => {
      const ethicsSlide = {
        content: 'Sigilo e escuta qualificada na consulta do adolescente',
        rows: [{ label: 'Privacidade', value: 'Protegido por sigilo — I correta' }],
      };
      expect(
        bespokeMoldHasContentAffinity('adolescent-sigilo-spectrum', ethicsSlide, {
          familyId: 'vf',
          subtopico,
          pedagogicalBranch: 'adolescente_etica_sigilo',
        }),
      ).toBe(true);
    });

    it('rejeita adolescent-privacy-curtain (legado) para puberdade sem vocabulário de ética', () => {
      const slide = {
        items: [
          { label: 'Puberdade', detail: 'Marcos de desenvolvimento das mamas' },
          { label: 'Hormônios', detail: 'Metamorfose física na adolescência' },
        ],
      };
      expect(
        bespokeMoldHasContentAffinity('adolescent-privacy-curtain', slide, {
          familyId: 'certo_errado',
          subtopico: 'Saúde do Adolescente',
          pedagogicalBranch: 'adolescente_desenvolvimento',
        }),
      ).toBe(false);
    });

    it('aceita adolescent-violence-deck para violência/proteção', () => {
      const slide = {
        items: [
          { label: 'Acolher', detail: 'Acolhimento sem revitimização', icon: 'Heart' },
          { label: 'Proteger', detail: 'Rede de proteção e Conselho Tutelar', icon: 'Shield' },
          { label: 'Notificar', detail: 'Notificação compulsória SINAN', icon: 'Bell' },
        ],
      };
      expect(
        bespokeMoldHasContentAffinity('adolescent-violence-deck', slide, {
          familyId: 'protocolo',
          subtopico,
          pedagogicalBranch: 'adolescente_violencia_protecao',
        }),
      ).toBe(true);
    });

    it('aceita adolescent-violence-timeline para eliminação de alternativas', () => {
      const slide = {
        type: 'logic_flow',
        steps: [
          'Comando: afirmativa correta sobre violência sexual',
          'A: nega notificação compulsória → elimina',
          'C: residência como principal espaço → mantém',
          'Marcar C.',
        ],
      };
      expect(
        bespokeMoldHasContentAffinity('adolescent-violence-timeline', slide, {
          familyId: 'conceito',
          subtopico,
          pedagogicalBranch: 'adolescente_violencia_protecao',
        }),
      ).toBe(true);
    });

    it('aceita adolescent-mental-step-trap para saúde mental', () => {
      const slide = {
        content: 'Pegadinhas — transtorno alimentar',
        items: [
          {
            label: 'A — I falsa',
            detail: 'Nega anorexia apesar de IMC baixo.',
            correct: 'I é verdadeira: restrição + peso baixo + distorção.',
          },
        ],
      };
      expect(
        bespokeMoldHasContentAffinity('adolescent-mental-step-trap', slide, {
          familyId: 'conceito',
          subtopico,
          pedagogicalBranch: 'adolescente_saude_mental',
        }),
      ).toBe(true);
    });

    it('aceita pni-exceto-isolate-board para INCORRETA vacinal (Onda 3)', () => {
      const slide = {
        steps: [
          'Comando: INCORRETA — vigilância da raiva',
          'Manter: caso confirmado = laboratório',
          'Exceção: definição estreita demais',
        ],
      };
      expect(
        bespokeMoldHasContentAffinity('pni-exceto-isolate-board', slide, {
          familyId: 'certo_errado',
          subtopico: 'Imunização',
          pedagogicalBranch: 'imunizacao_exceto',
        }),
      ).toBe(true);
    });

    it('rejeita pni-exceto-compare fora do ramo imunizacao_exceto', () => {
      const slide = {
        content: 'Pegadinhas',
        items: [{ label: 'A', detail: 'x', correct: 'Exceção incorreta' }],
      };
      expect(
        bespokeMoldHasContentAffinity('pni-exceto-compare', slide, {
          familyId: 'certo_errado',
          subtopico: 'Imunização',
          pedagogicalBranch: 'imunizacao_calendario',
        }),
      ).toBe(false);
    });

    it('puberdade no ramo desenvolvimento usa o pacote dev, não o glanceable de ética', () => {
      const slide = {
        items: [
          { label: 'Puberdade', detail: 'Marcos Tanner e metamorfose física', icon: 'User' },
          { label: 'Menarca', detail: 'Evento de desenvolvimento', icon: 'Calendar' },
        ],
      };
      expect(
        bespokeMoldHasContentAffinity('adolescent-care-pillars-deck', slide, {
          familyId: 'certo_errado',
          subtopico,
          pedagogicalBranch: 'adolescente_desenvolvimento',
        }),
      ).toBe(false);
      expect(
        bespokeMoldHasContentAffinity('adolescent-dev-pair-rail', slide, {
          familyId: 'certo_errado',
          subtopico,
          pedagogicalBranch: 'adolescente_desenvolvimento',
        }),
      ).toBe(true);
    });

    it('aceita adolescent-growth-z-rail para escore Z + ramo antropometria', () => {
      expect(
        bespokeMoldHasContentAffinity('adolescent-growth-z-rail', conceptMapSlide, {
          familyId: 'calc',
          subtopico,
          pedagogicalBranch: 'adolescente_antropometria',
        }),
      ).toBe(true);
    });

    it('rejeita adolescent-growth-z-rail para obesidade sem escore Z (amauc)', () => {
      const slide = {
        type: 'concept_map' as const,
        items: [
          { label: 'Quadro', detail: 'Obesidade na adolescência e comorbidades', icon: 'Scale' },
          { label: 'Metabólico', detail: 'Diabetes tipo 2', icon: 'Activity' },
        ],
      };
      expect(
        bespokeMoldHasContentAffinity('adolescent-growth-z-rail', slide, {
          familyId: 'conceito',
          subtopico,
          pedagogicalBranch: 'adolescente_antropometria',
        }),
      ).toBe(false);
    });

    it('shouldApplySubtopicMold usa z-band-board quando afinidade passa', () => {
      expect(
        shouldApplySubtopicMold('adolescent-z-band-board', goldenRuleSlide, {
          familyId: 'calc',
          subtopico,
          pedagogicalBranch: 'adolescente_antropometria',
        }),
      ).toBe(true);
    });
  });

  describe('Doenças Respiratórias Crônicas — ramo pedagógico', () => {
    const subtopico = 'Doenças Respiratórias Crônicas (Asma, DPOC)';

    it('rejeita respiratorio-duel-deck quando ramo é crise EXCETO', () => {
      const slide = {
        items: [
          { label: 'Crise', detail: 'Broncoespasmo e sibilância' },
          { label: 'EXCETO', detail: 'Conduta inadequada' },
        ],
      };
      expect(
        bespokeMoldHasContentAffinity('respiratorio-asma-dpoc-duel-deck', slide, {
          subtopico,
          pedagogicalBranch: 'respiratorio_asma_crise',
        }),
      ).toBe(false);
    });

    it('aceita respiratorio-spo2-trap-arena para ramo dpoc_oxigenio', () => {
      const slide = {
        items: [
          {
            label: 'Hiperoxia',
            detail: 'Forçar SpO₂ ≥95% em DPOC',
            correct: 'Titular O₂ — alvo 88–92%',
          },
        ],
      };
      expect(
        bespokeMoldHasContentAffinity('respiratorio-spo2-trap-arena', slide, {
          subtopico,
          pedagogicalBranch: 'respiratorio_dpoc_oxigenio',
        }),
      ).toBe(true);
    });
  });

  describe('subtópico de casa — sondas', () => {
    it('aceita procedure-protocol no subtópico de sondas mesmo com labels genéricos', () => {
      expect(
        shouldApplySubtopicMold(
          'procedure-protocol',
          {
            items: [
              { label: 'A', detail: '1' },
              { label: 'B', detail: '2' },
              { label: 'C', detail: '3' },
            ],
          },
          { subtopico: 'Instalação e Manejo de Sondas' },
        ),
      ).toBe(true);
    });
  });

  describe('urgencias_rcp_sbv', () => {
    const subtopico = 'Urgências e Emergências';

    it('aceita urgencias-rcp-trap-arena para ramo rcp_sbv', () => {
      const slide = {
        items: [
          {
            label: '80–100/min',
            detail: 'Faixa abaixo do protocolo',
            correct: '100–120 compressões por minuto',
          },
        ],
      };
      expect(
        bespokeMoldHasContentAffinity('urgencias-rcp-trap-arena', slide, {
          subtopico,
          pedagogicalBranch: 'urgencias_rcp_sbv',
        }),
      ).toBe(true);
    });

    it('rejeita urgencias-rcp-trap-arena para ramo generico', () => {
      const slide = {
        items: [{ label: 'Pulso', detail: 'ciclo', correct: '2 min' }],
      };
      expect(
        bespokeMoldHasContentAffinity('urgencias-rcp-trap-arena', slide, {
          subtopico,
          pedagogicalBranch: 'urgencias_generico',
        }),
      ).toBe(false);
    });
  });

  describe('urgencias_xabcde_trauma', () => {
    const subtopico = 'Urgências e Emergências';

    it('aceita urgencias-trauma-trap-arena para ramo xabcde', () => {
      const slide = {
        items: [
          {
            label: 'Torniquete no pescoço',
            detail: 'Carótida',
            correct: 'Compressão direta em membro',
          },
        ],
      };
      expect(
        bespokeMoldHasContentAffinity('urgencias-trauma-trap-arena', slide, {
          subtopico,
          pedagogicalBranch: 'urgencias_xabcde_trauma',
        }),
      ).toBe(true);
    });

    it('rejeita urgencias-trauma-trap-arena para ramo generico', () => {
      const slide = {
        items: [{ label: 'Fratura', detail: 'tração', correct: 'imobilizar' }],
      };
      expect(
        bespokeMoldHasContentAffinity('urgencias-trauma-trap-arena', slide, {
          subtopico,
          pedagogicalBranch: 'urgencias_generico',
        }),
      ).toBe(false);
    });
  });

  describe('urgencias_engasgo', () => {
    const subtopico = 'Urgências e Emergências';

    it('aceita urgencias-choking-trap-arena para ramo engasgo', () => {
      expect(
        bespokeMoldHasContentAffinity('urgencias-choking-trap-arena', {
          items: [{ label: 'Abdome', detail: 'sinal', correct: 'pescoço' }],
        }, { subtopico, pedagogicalBranch: 'urgencias_engasgo' }),
      ).toBe(true);
    });

    it('rejeita urgencias-choking-trap-arena para ramo generico', () => {
      expect(
        bespokeMoldHasContentAffinity('urgencias-choking-trap-arena', {
          items: [{ label: 'Pescoço', detail: 'x', correct: 'y' }],
        }, { subtopico, pedagogicalBranch: 'urgencias_generico' }),
      ).toBe(false);
    });
  });

  describe('urgencias_manchester_triagem', () => {
    const subtopico = 'Urgências e Emergências';

    it('aceita urgencias-manchester-trap para ramo manchester', () => {
      expect(
        bespokeMoldHasContentAffinity(
          'urgencias-manchester-trap',
          { items: [{ label: 'Azul', detail: 'instável', correct: 'vermelho' }] },
          { subtopico, pedagogicalBranch: 'urgencias_manchester_triagem' },
        ),
      ).toBe(true);
    });

    it('rejeita urgencias-manchester-trap para ramo generico', () => {
      expect(
        bespokeMoldHasContentAffinity(
          'urgencias-manchester-trap',
          { items: [{ label: 'X', detail: 'y', correct: 'z' }] },
          { subtopico, pedagogicalBranch: 'urgencias_generico' },
        ),
      ).toBe(false);
    });
  });

  describe('collectSlideTextCorpus', () => {
    it('agrega rows, steps e items', () => {
      const corpus = collectSlideTextCorpus({
        content: 'Título',
        rows: [{ label: 'Magreza', value: 'Z < -2' }],
        steps: ['Julgar I → verdadeira'],
        items: [{ label: 'Letra A', correct: 'Sobrepeso +1 a +2' }],
      });
      expect(corpus).toContain('Magreza');
      expect(corpus).toContain('Julgar I');
      expect(corpus).toContain('Letra A');
    });
  });

  describe('variantes genéricas', () => {
    it('sempre aplica bridge / reference_table', () => {
      expect(shouldApplySubtopicMold('bridge', { items: [] }, {})).toBe(true);
      expect(shouldApplySubtopicMold('reference_table', { rows: [] }, {})).toBe(true);
    });
  });
});
