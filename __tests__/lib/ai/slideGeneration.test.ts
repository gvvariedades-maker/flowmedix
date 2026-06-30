import { scoreConfidence } from '@/lib/ai/confidenceScore';
import { runFactCheck } from '@/lib/ai/factCheck';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/ai/promptBuilder';
import { extractSlidesFromModelJson } from '@/lib/ai/responseSchema';
import { getGuidelineForSubtopico } from '@/lib/ai/retrieval';
import { DEFAULT_GEMINI_SLIDES_MODEL, getGeminiSlidesModelId } from '@/lib/ai/geminiClient';
import { PNI_INTERVALOS_2025 } from '@/lib/guidelines/pni';
import { getGuidelineForSubtopico } from '@/lib/guidelines';
import fepeseSv from '@/examples/questao-premium-fepese-sv-interpretacao-valores.json';

describe('getGeminiSlidesModelId', () => {
  const prevSlides = process.env.GOOGLE_GEMINI_SLIDES_MODEL;
  const prevModel = process.env.GOOGLE_GEMINI_MODEL;

  afterEach(() => {
    if (prevSlides === undefined) delete process.env.GOOGLE_GEMINI_SLIDES_MODEL;
    else process.env.GOOGLE_GEMINI_SLIDES_MODEL = prevSlides;
    if (prevModel === undefined) delete process.env.GOOGLE_GEMINI_MODEL;
    else process.env.GOOGLE_GEMINI_MODEL = prevModel;
  });

  it('default é gemini-2.5-flash', () => {
    delete process.env.GOOGLE_GEMINI_SLIDES_MODEL;
    delete process.env.GOOGLE_GEMINI_MODEL;
    expect(getGeminiSlidesModelId()).toBe(DEFAULT_GEMINI_SLIDES_MODEL);
    expect(DEFAULT_GEMINI_SLIDES_MODEL).toBe('gemini-2.5-flash');
  });

  it('GOOGLE_GEMINI_SLIDES_MODEL tem prioridade', () => {
    process.env.GOOGLE_GEMINI_SLIDES_MODEL = 'gemini-2.5-flash-lite';
    expect(getGeminiSlidesModelId()).toBe('gemini-2.5-flash-lite');
  });
});

describe('extractSlidesFromModelJson', () => {
  it('aceita wrapper reverse_study_slides', () => {
    const slides = [{ type: 'concept_map', items: [] }];
    expect(extractSlidesFromModelJson({ reverse_study_slides: slides })).toEqual(slides);
  });

  it('aceita array direto', () => {
    const slides = [{ type: 'golden_rule', content: 'x' }];
    expect(extractSlidesFromModelJson(slides)).toEqual(slides);
  });
});

describe('runFactCheck', () => {
  it('rejeita número fora da guideline PNI', () => {
    const slides = [{ type: 'golden_rule', content: 'aguardar 10 dias entre doses' }];
    const result = runFactCheck(slides, PNI_INTERVALOS_2025);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('aceita número presente na guideline', () => {
    const slides = [{ type: 'golden_rule', content: 'intervalo mínimo de 8 semanas entre VPC13 e VPP23' }];
    const result = runFactCheck(slides, PNI_INTERVALOS_2025);
    expect(result.violations).toHaveLength(0);
  });

  it('sem guideline não viola', () => {
    const slides = [{ type: 'golden_rule', content: '10 dias qualquer' }];
    expect(runFactCheck(slides, null).violations).toHaveLength(0);
  });

  it('aceita números presentes no enunciado/alternativas', () => {
    const slides = [{ type: 'golden_rule', content: 'Febre amarela: primeira dose aos 9 meses' }];
    const result = runFactCheck(slides, PNI_INTERVALOS_2025, {
      allowedText: '6 meses 9 meses 12 meses 2 anos febre amarela',
    });
    expect(result.violations).toHaveLength(0);
  });

  it('guideline mesclada de Imunização aceita idades do calendário PNI', () => {
    const guideline = getGuidelineForSubtopico('Imunização');
    const slides = [
      {
        type: 'golden_rule',
        content: 'Pentavalente: 2 meses, 4 meses, 6 meses; reforço 15 meses e 4 anos',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Urgências aceita parâmetros RCP oficiais', () => {
    const guideline = getGuidelineForSubtopico('Urgências e Emergências');
    const slides = [
      {
        type: 'golden_rule',
        content: 'RCP: 30:2, 100-120/min, profundidade 5-6 cm, DEA assim que disponível',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Urgências aceita 100 bpm e 120 bpm nas compressões', () => {
    const guideline = getGuidelineForSubtopico('Urgências e Emergências');
    const slides = [
      {
        type: 'golden_rule',
        content: 'Manter compressões entre 100 bpm e 120 bpm com profundidade adequada',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Sinais Vitais aceita valores discretos do golden FEPESE', () => {
    const guideline = getGuidelineForSubtopico('Verificação de Sinais Vitais');
    const slides = fepeseSv.reverse_study_slides;
    const allowedText = [
      fepeseSv.question_data.instruction,
      ...fepeseSv.question_data.options.map((o) => o.text),
    ].join(' ');
    const result = runFactCheck(slides, guideline, { allowedText });
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Sinais Vitais aceita 38,5°C em caso de prova', () => {
    const guideline = getGuidelineForSubtopico('Verificação de Sinais Vitais');
    const slides = [{ type: 'golden_rule', content: 'Paciente com temperatura 38,5°C — interpretar como febre' }];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('ignora número embutido em referência golden no rodapé híbrido', () => {
    const guideline = getGuidelineForSubtopico('Cuidados na Administração de Medicamentos');
    const slides = [
      {
        type: 'golden_rule',
        footer_rule: 'Fixação: Conceito — ver questao-premium-fundatec-meningococica-3meses.json',
        content: 'FOCO EM PROVA — CUIDADOS NA ADMINISTRAÇÃO DE MEDICAMENTOS',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Saúde da Mulher aceita pré-natal MS', () => {
    const guideline = getGuidelineForSubtopico('Saúde da Mulher');
    const slides = [
      {
        type: 'golden_rule',
        content: 'Mínimo 6 consultas; TTGO 75g entre 24 e 28 semanas; puerpério até 42 dias',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Cálculo aceita equivalências padrão BR', () => {
    const guideline = getGuidelineForSubtopico('Cálculo de Administração de Medicamentos e Infusões');
    const slides = [{ type: 'golden_rule', content: '1 mL = 20 gotas = 60 microgotas; insulina U-100: 100 UI em 1 mL' }];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Coleta aceita temperatura e jejum SBPC', () => {
    const guideline = getGuidelineForSubtopico('Coleta de Exames Laboratoriais');
    const slides = [{ type: 'golden_rule', content: 'Transporte 2 °C a 8 °C; jejum 8 horas; torniquete máximo 1 minuto' }];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Saúde da Criança aceita aleitamento MS', () => {
    const guideline = getGuidelineForSubtopico('Saúde da Criança');
    const slides = [{ type: 'golden_rule', content: 'Aleitamento exclusivo até 6 meses; manter até 2 anos' }];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Vias aceita absorção IM > SC', () => {
    const guideline = getGuidelineForSubtopico('Vias de Administração');
    const slides = [{ type: 'golden_rule', content: 'IM mais rápida que SC; ventroglúteo recomendado' }];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Curativos aceita prevenção LPP', () => {
    const guideline = getGuidelineForSubtopico('Curativos e Manejo de Feridas');
    const slides = [{ type: 'golden_rule', content: 'Pele limpa e seca; Braden ≤18 pontos = risco de LPP' }];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Sondas aceita confirmação radiográfica', () => {
    const guideline = getGuidelineForSubtopico('Instalação e Manejo de Sondas');
    const slides = [{ type: 'golden_rule', content: 'SNG: NEX nariz-orelha-xifoide; radiografia padrão-ouro' }];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de ISTs aceita rotas de risco MS', () => {
    const guideline = getGuidelineForSubtopico('Infecções Sexualmente Transmissíveis (ISTs)');
    const slides = [{ type: 'golden_rule', content: 'Sexo sem preservativo; PEP até 72 horas' }];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Biossegurança aceita cadeia de infecção', () => {
    const guideline = getGuidelineForSubtopico('Infecções no Contexto da Biossegurança');
    const slides = [{ type: 'golden_rule', content: '6 elos na cadeia de infecção; EPI conforme risco' }];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de SAE aceita privativas COFEN 358', () => {
    const guideline = getGuidelineForSubtopico('Processo de Enfermagem');
    const slides = [{ type: 'golden_rule', content: 'Diagnóstico e evolução privativos do enfermeiro; carimbo obrigatório' }];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de TB aceita BAAR e notificação', () => {
    const guideline = getGuidelineForSubtopico(
      'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    );
    const slides = [{ type: 'golden_rule', content: 'Notificação compulsória; BAAR no escarro; precaução aerossóis' }];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de CME aceita fluxo e validade', () => {
    const guideline = getGuidelineForSubtopico('Enfermagem em Central de Material e Esterilização (CME)');
    const slides = [{ type: 'golden_rule', content: 'Fluxo suja → limpa → estéril; validade 30 dias' }];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline perioperatória aceita cirurgia segura', () => {
    const guideline = getGuidelineForSubtopico('Enfermagem em Centro Cirúrgico');
    const slides = [{ type: 'golden_rule', content: 'Time-out antes da incisão; contagem de compressas' }];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Epidemiologia aceita poliomielite e vigilância', () => {
    const guideline = getGuidelineForSubtopico('Epidemiologia e Vigilância Epidemiológica');
    const slides = [
      {
        type: 'golden_rule',
        content: 'Último caso selvagem no Brasil: 1989; vacinação é principal prevenção; PFA é sentinela',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Atenção Básica aceita PNAB e violência', () => {
    const guideline = getGuidelineForSubtopico('Atenção Básica / Saúde da Família');
    const slides = [
      {
        type: 'golden_rule',
        content: 'Porta de entrada do SUS; notificar violência e encaminhar multiprofissional',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline respiratória aceita SpO₂ 88–92% no DPOC retentor', () => {
    const guideline = getGuidelineForSubtopico('Doenças Respiratórias Crônicas (Asma, DPOC)');
    const slides = [
      {
        type: 'golden_rule',
        content: 'Asma: obstrução reversível; DPOC retentor: SpO₂ alvo 88 a 92%',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Saúde Mental aceita risco suicida e acolhimento', () => {
    const guideline = getGuidelineForSubtopico('Saúde Mental');
    const slides = [
      {
        type: 'golden_rule',
        content: 'Ideação suicida: acolher, avaliar risco e encaminhar; restrição não é primeira linha na ansiedade leve',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Promoção à Saúde aceita Lei 8.080 Art. 4º', () => {
    const guideline = getGuidelineForSubtopico('Promoção à Saúde e Prevenção de Agravos');
    const slides = [
      {
        type: 'golden_rule',
        content: 'SUS: ações e serviços de saúde — administração direta e indireta, fundações públicas',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Enfermagem do Trabalho aceita NR-32 e perfurocortante', () => {
    const guideline = getGuidelineForSubtopico('Enfermagem do Trabalho');
    const slides = [
      {
        type: 'golden_rule',
        content: 'NR-32: segurança em serviços de saúde; perfurocortante exige notificação e protocolo',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Adolescente aceita escuta e pré-natal precoce', () => {
    const guideline = getGuidelineForSubtopico('Saúde do Adolescente');
    const slides = [
      {
        type: 'golden_rule',
        content: 'Privacidade e escuta qualificada; gravidez adolescente exige pré-natal precoce',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Zoonoses aceita Aedes aegypti e controle ambiental', () => {
    const guideline = getGuidelineForSubtopico('Doenças Parasitárias e Zoonoses');
    const slides = [
      {
        type: 'golden_rule',
        content: 'Dengue: vetor Aedes aegypti, água parada limpa; eliminar criadouros',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Queimaduras aceita graus e dor no 3º grau', () => {
    const guideline = getGuidelineForSubtopico('Feridas e Queimaduras');
    const slides = [
      {
        type: 'golden_rule',
        content: '1º grau: epiderme sem bolha; 3º grau pode ter dor reduzida por lesão nervosa',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Mobilização aceita decúbito 2/2 h', () => {
    const guideline = getGuidelineForSubtopico('Mobilização e Posicionamento do Paciente');
    const slides = [
      {
        type: 'golden_rule',
        content: 'Mudança de decúbito a cada 2 horas; Trendelenburg não é rotina pós-op abdominal',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de História aceita Nightingale e Código de Ética COFEN', () => {
    const guideline = getGuidelineForSubtopico('História da Enfermagem');
    const slides = [
      {
        type: 'golden_rule',
        content: 'Nightingale: fundadora da enfermagem moderna; Código de Ética é norma do COFEN',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Anatomia aceita pares anterior/ventral', () => {
    const guideline = getGuidelineForSubtopico('Noções de Anatomia');
    const slides = [{ type: 'golden_rule', content: 'Anterior é sinônimo de ventral; medial é próximo da linha média' }];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Fisiologia aceita homeostase e temperatura oral', () => {
    const guideline = getGuidelineForSubtopico('Noções de Fisiologia');
    const slides = [
      {
        type: 'golden_rule',
        content: 'Homeostase: meio interno estável; temperatura oral 36,1 a 37,2 °C; taquicardia > 100 bpm',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });

  it('guideline de Procedimentos Diversos aceita antissepsia vs desinfecção', () => {
    const guideline = getGuidelineForSubtopico('Procedimentos Diversos');
    const slides = [
      {
        type: 'golden_rule',
        content: 'Antissepsia na pele do paciente; desinfecção em objetos; luva não dispensa higiene das mãos',
      },
    ];
    const result = runFactCheck(slides, guideline);
    expect(result.violations).toHaveLength(0);
  });
});

describe('buildUserPrompt', () => {
  it('inclui gabarito e guideline de Imunização', () => {
    const guideline = getGuidelineForSubtopico('Imunização');
    const prompt = buildUserPrompt({
      questao: {
        instruction: 'I - teste\nII - teste\nÉ CORRETO o que se afirma em:',
        options: [
          { id: 'A', text: 'I apenas', is_correct: false },
          { id: 'B', text: 'II apenas', is_correct: true },
        ],
      },
      subtopico: 'Imunização',
      topico: 'Enfermagem',
      family: 'vf',
      guideline,
      moldeSummary: 'concept_map: x',
      exemplar: null,
    });
    expect(prompt).toContain('GABARITO');
    expect(prompt).toContain('Imunização');
    expect(prompt).toContain('grace-period');
  });

  it('família vf inclui hints de Julgar I/II/III', () => {
    const prompt = buildUserPrompt({
      questao: {
        instruction: 'I - teste\nII - teste\nÉ CORRETO o que se afirma em:',
        options: [{ id: 'A', text: 'I apenas', is_correct: true }],
      },
      subtopico: 'Imunização',
      topico: 'Enfermagem',
      family: 'vf',
      guideline: null,
      moldeSummary: null,
      exemplar: null,
    });
    expect(prompt).toContain('Julgar I:');
    expect(prompt).toContain('Montar conjunto verdadeiro');
  });

  it('família conceito inclui hints de eliminação MCQ', () => {
    const prompt = buildUserPrompt({
      questao: {
        instruction: 'Qual benefício o SIS proporciona na vacinação infantil?',
        options: [
          { id: 'A', text: 'Produtividade', is_correct: false },
          { id: 'B', text: 'Lembretes de atraso vacinal', is_correct: true },
        ],
      },
      subtopico: 'Imunização',
      topico: 'Enfermagem',
      family: 'conceito',
      guideline: null,
      moldeSummary: null,
      exemplar: null,
    });
    expect(prompt).toContain('ELIMINAÇÃO');
    expect(prompt).toContain('Marcar letra X');
    expect(prompt).not.toContain('Julgar I:');
  });
});

describe('buildSystemPrompt', () => {
  it('exige 4 slides e formato plano', () => {
    const sys = buildSystemPrompt();
    expect(sys).toContain('concept_map');
    expect(sys).toContain('reverse_study_slides');
    expect(sys).toContain('NÃO invente números');
  });
});

describe('scoreConfidence', () => {
  it('penaliza múltiplas tentativas', () => {
    const a = scoreConfidence({
      attempts: 1,
      family: 'vf',
      guideline: PNI_INTERVALOS_2025,
      factViolations: 0,
      writeWarnings: 0,
      premiumSubtopico: true,
    });
    const b = scoreConfidence({
      attempts: 3,
      family: 'vf',
      guideline: PNI_INTERVALOS_2025,
      factViolations: 0,
      writeWarnings: 0,
      premiumSubtopico: true,
    });
    expect(a).toBeGreaterThan(b);
  });
});
