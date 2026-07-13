/**
 * Especificação de aprofundamento máximo por subtópico canônico.
 * Temas = eixos do edital técnico de enfermagem (não só contagem de entries).
 */

export type DeepeningPhase = 'P0_manter' | 'P1_critico' | 'P2_volume' | 'P3_complementar' | 'P4_conceitual';

export type DeepeningSpec = {
  phase: DeepeningPhase;
  /** Entries mescladas desejadas para factcheck robusto (meta “máximo”). */
  target_merged_entries: number;
  /** Temas do edital a cobrir com entries dedicadas. */
  edital_themes: string[];
  /** Fontes tier A prioritárias para extração literal. */
  sources_tier_a: string[];
  /** Critério de pronto (DoD). */
  done_when: string;
};

/** Meta entries ≈ max(15% do volume de questões, 5 × número de temas), piso 20. */
export function defaultTargetEntries(questionCount: number, themeCount: number): number {
  const fromVolume = Math.ceil(questionCount * 0.15);
  const fromThemes = themeCount * 5;
  return Math.max(20, fromVolume, fromThemes);
}

export const DEEPENING_BY_SUBTOPICO: Record<string, DeepeningSpec> = {
  'Imunização': {
    phase: 'P1_critico',
    target_merged_entries: 90,
    edital_themes: [
      'Calendário nacional por idade (criança, adolescente, adulto, idoso, gestante)',
      'Intervalos entre vacinas (vivas, inativadas, grace period 4 dias)',
      'Contraindicações e eventos adversos',
      'Cadeia de frio (2–8 °C, validade aberta, descarte)',
      'Técnicas de aplicação (via, local, dose)',
      'Bloqueio vacinal e surtos (sarampo, FA)',
      'Registros SIS/PNI e erros de imunização',
    ],
    sources_tier_a: [
      'Manual PNI 2025 — intervalos e procedimentos',
      'Calendário Nacional de Vacinação 2025',
      'Manual da Rede de Frio (MS)',
    ],
    done_when:
      'Toda vacina do calendário infantil/adulto com idade, dose, via e intervalo; factcheck PNI sem violações em lote piloto ≥20 slugs.',
  },
  'Verificação de Sinais Vitais': {
    phase: 'P1_critico',
    target_merged_entries: 75,
    edital_themes: [
      'Técnica de aferição (PA, FC, FR, Temp, SpO₂)',
      'Faixas adulto, idoso, gestante',
      'Faixas pediátricas por idade (RN, lactente, pré-escolar, escolar, adolescente)',
      'PA — métodos e valores (SBC/MS)',
      'Escalas (APGAR, Glasgow, dor EVA)',
      'Interpretação clínica e conduta inicial',
      'Registro e frequência de monitorização',
    ],
    sources_tier_a: [
      'Protocolos MS de aferição de sinais vitais',
      'Diretriz brasileira de hipertensão (SBC) — valores PA',
      'SBP — referências pediátricas',
    ],
    done_when:
      'Cada parâmetro × faixa etária com valor numérico; cobertura gestante/idoso; testes factcheck SV golden FEPese/CPCON passam.',
  },
  'Urgências e Emergências': {
    phase: 'P1_critico',
    target_merged_entries: 100,
    edital_themes: [
      'XABCDE / avaliação primária',
      'RCP adulto e pediátrico (30:2, 15:2, DEA)',
      'Via aérea e engasgo',
      'Choque (hipovolêmico, séptico — reconhecimento)',
      'AVC — FAST e tempo porta',
      'Anafilaxia e adrenalina',
      'Hemorragia e torniquete',
      'SAMU 192 e segurança da cena',
    ],
    sources_tier_a: [
      'Protocolo SBV/RCP MS SAMU 192',
      'Diretrizes AHA/ILCOR adotadas pelo MS',
      'Protocolos MS urgência/emergência',
    ],
    done_when:
      'Mescla RCP+protocolos (≥100 entries): RCP/DEA, trauma/XABCDE, triagem, anafilaxia, pegadinhas por ramo; factcheck sem falsos positivos.',
  },
  'Saúde da Mulher': {
    phase: 'P2_volume',
    target_merged_entries: 45,
    edital_themes: [
      'Pré-natal — consultas, exames, periodicidade',
      'Puerpério (imediato e tardio)',
      'Rastreamento colo uterino (Papanicolau/INCA)',
      'Climatério e contracepção',
      'Violência contra mulher — notificação',
      'Aleitamento e planejamento familiar',
    ],
    sources_tier_a: ['Caderno AB 32 — pré-natal baixo risco', 'INCA — rastreamento câncer colo', 'Linha de cuidado gestante MS'],
    done_when: 'Cronograma pré-natal completo com semanas; rastreamento com idade de início e intervalo.',
  },
  'Cálculo de Administração de Medicamentos e Infusões': {
    phase: 'P2_volume',
    target_merged_entries: 35,
    edital_themes: [
      'Equivalências mL/gotas/microgotas',
      'Regra de três e diluição',
      'mg/kg pediátrico',
      'Insulina U-100 e heparina',
      'Velocidade de infusão (gts/min, mL/h)',
      'Concentração percentual e mcg',
    ],
    sources_tier_a: ['COFEN administração de medicamentos', 'Anvisa — diluição/reconstituição'],
    done_when: 'Todas fórmulas de prova CPCON/FEPese cobertas com números na tabela.',
  },
  'Cuidados na Administração de Medicamentos': {
    phase: 'P2_volume',
    target_merged_entries: 40,
    edital_themes: [
      '5/9 certos',
      'Medicamentos de alto risco',
      'Dupla checagem e identificação do paciente',
      'Horário e interações',
      'Armazenamento e validade',
      'Recusa e erro de medicação',
    ],
    sources_tier_a: ['COFEN — administração segura', 'ANVISA farmácia clínica / NSP'],
    done_when: 'Lista COFEN de alto risco refletida; fluxo erro de medicação.',
  },
  'Oxigenoterapia e Cuidados Respiratórios': {
    phase: 'P2_volume',
    target_merged_entries: 35,
    edital_themes: [
      'Dispositivos (CN, máscara simples, Venturi, NRB, CNAF)',
      'FiO₂ e fluxo por dispositivo',
      'SpO₂ alvo (geral vs DPOC retentor)',
      'Higiene e umidificação',
      'Aspiração e fisioterapia respiratória (enfermagem)',
      'Sinais de hipoxemia',
    ],
    sources_tier_a: ['Manual MS oxigenoterapia', 'SBPT — oxigenoterapia (tier B complementar)'],
    done_when: 'Cada dispositivo com Faixa FiO₂ e fluxo; pegadinha DPOC documentada.',
  },
  'Instalação e Manejo de Sondas': {
    phase: 'P2_volume',
    target_merged_entries: 35,
    edital_themes: ['SNG/SNE — indicação, NEX, confirmação', 'SVD — técnica, balão, bolsa', 'Sonda retal', 'Complicações e cuidados', 'Nutrição enteral'],
    sources_tier_a: ['COFEN normas técnicas de sondas'],
    done_when: 'SNG vs SNE vs SVD diferenciados; confirmação posicional/radiografia.',
  },
  'Coleta de Exames Laboratoriais': {
    phase: 'P2_volume',
    target_merged_entries: 35,
    edital_themes: [
      'Ordem de tubos e anticoagulantes',
      'Jejum por exame',
      'Torniquete e punção',
      'Transporte e temperatura',
      'Identificação e segurança do paciente',
      'Hemocultura e coagulação',
    ],
    sources_tier_a: ['Manual MS coleta de sangue', 'SBPC/ML ordem de tubos (tier B)'],
    done_when: 'Ordem clássica de tubos + jejum glicemia/ lipídios cobertos.',
  },
  'Processo de Enfermagem': {
    phase: 'P2_volume',
    target_merged_entries: 35,
    edital_themes: [
      '5 etapas SAE (COFEN 358)',
      'Privativas do enfermeiro vs técnico',
      'NANDA / NIC / NOC (quando cobrado)',
      'Registro e prontuário',
      'Diagnóstico e prescrição de enfermagem',
    ],
    sources_tier_a: ['COFEN Res. 358/2009', 'NANDA-I (tier B)'],
    done_when: 'Privativas e etapas sem ambiguidade; 5+ diagnósticos frequentes em prova.',
  },
  'Atenção Básica / Saúde da Família': {
    phase: 'P2_volume',
    target_merged_entries: 35,
    edital_themes: [
      'PNAB — ESF, NASF/eMulti',
      'Territorialização e adscrição',
      'Acolhimento e classificação de risco',
      'Violência e vulnerabilidade',
      'Pacto pela saúde / atributos APS',
    ],
    sources_tier_a: ['PNAB 2017', 'Cadernos APS MS'],
    done_when: 'Composição ESF e parâmetros ACS; fluxo violência.',
  },
  'Epidemiologia e Vigilância Epidemiológica': {
    phase: 'P3_complementar',
    target_merged_entries: 40,
    edital_themes: [
      'Incidência, prevalência, letalidade',
      'Surto, endemia, epidemia, pandemia',
      'Notificação compulsória e SINAN',
      'Vigilância sentinela',
      'Poliomielite e eliminação',
    ],
    sources_tier_a: ['Guia de Vigilância Epidemiológica MS', 'Portaria notificação compulsiva'],
    done_when: 'Lista doenças notificação imediata vs semanal (principais).',
  },
  'Promoção à Saúde e Prevenção de Agravos': {
    phase: 'P3_complementar',
    target_merged_entries: 30,
    edital_themes: ['Lei 8.080/8.142', 'PNPS', 'Prevenção primária/secundária/terciária', 'Determinantes sociais', 'Carta de Ottawa'],
    sources_tier_a: ['Lei 8.080/1990', 'Lei 8.142/1990', 'PNPS Portaria 2.446/2014'],
    done_when: 'Art. 4º Lei 8080 e níveis de prevenção sem confusão.',
  },
  'Vias de Administração': {
    phase: 'P0_manter',
    target_merged_entries: 40,
    edital_themes: ['IM, SC, EV, VO, retal, inalatória', 'Absorção e técnica', 'Sites e ângulos'],
    sources_tier_a: ['COFEN vias de administração'],
    done_when: 'Manter; revisar após mudança COFEN.',
  },
  'Farmacodinâmica e Farmacocinética': {
    phase: 'P3_complementar',
    target_merged_entries: 30,
    edital_themes: ['ADME', 'Agonista/antagonista', 'Meia-vida', 'Índice terapêutico', 'Biodisponibilidade'],
    sources_tier_a: ['Anvisa bulário / farmacologia básica'],
    done_when: 'Conceitos + 5 fármacos frequentes em prova técnica.',
  },
  'Curativos e Manejo de Feridas': {
    phase: 'P0_manter',
    target_merged_entries: 35,
    edital_themes: ['LPP estágios I–IV', 'Braden', 'Tipos de cobertura', 'Desbridamento'],
    sources_tier_a: ['NPUAP/EPUAP', 'COFEN curativos'],
    done_when: 'Pacote premium referência — alinhar builder.',
  },
  'Punção Venosa e Cuidados com Cateteres': {
    phase: 'P0_manter',
    target_merged_entries: 40,
    edital_themes: ['Punção periférica', 'CVC/PICC bundle', 'Flebite', 'Manutenção e troca'],
    sources_tier_a: ['Anvisa dispositivos invasivos', 'COFEN punção venosa', 'COFEN 358/2009'],
    done_when: 'enrich:puncao-guideline-meta em todos os lotes golden-v1; factcheck L2b em claims numéricos.',
  },
  'Enfermagem em Centro Cirúrgico': {
    phase: 'P3_complementar',
    target_merged_entries: 30,
    edital_themes: ['Cirurgia segura OMS', 'Contagem compressas', 'Papéis circulante/instrumentador', 'Assepsia'],
    sources_tier_a: ['COFEN/CC', 'Anvisa centro cirúrgico'],
    done_when: 'Checklist 3 momentos + contagem.',
  },
  'Assistência Perioperatória (Inclui SRPA)': {
    phase: 'P3_complementar',
    target_merged_entries: 30,
    edital_themes: ['Jejum pré-op', 'SRPA — Aldrete', 'Checklist', 'Curativo e CME pós-op'],
    sources_tier_a: ['COFEN perioperatório'],
    done_when: 'Jejum sólidos/líquidos + escala Aldrete numérica.',
  },
  'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)': {
    phase: 'P3_complementar',
    target_merged_entries: 50,
    edital_themes: ['Sarampo/rubéola — notificação e bloqueio', 'Influenza', 'Poliomielite', 'Covid-19', 'Hepatites virais'],
    sources_tier_a: ['Guias MS vigilância viral', 'PNI calendário'],
    done_when: 'Uma entry por doença viral do edital EBSERH.',
  },
  'Infecções Sexualmente Transmissíveis (ISTs)': {
    phase: 'P3_complementar',
    target_merged_entries: 30,
    edital_themes: ['Rotas de transmissão', 'PEP HIV 72h', 'Sífilis, HIV, HBV, HPV', 'Preservativo e testagem'],
    sources_tier_a: ['PCDT IST MS'],
    done_when: 'PCDT: janela PEP e testagem por agente.',
  },
  'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)': {
    phase: 'P3_complementar',
    target_merged_entries: 40,
    edital_themes: ['TB — BAAR, TDO, precaução aerossóis', 'Tétano — profilaxia', 'Candidíase', 'Meningite bacteriana'],
    sources_tier_a: ['Manual TB MS', 'Protocolos MS'],
    done_when: 'TB completo + tétano esquema vacinal/profilaxia.',
  },
  'Medidas de Prevenção e Precaução de Contato': {
    phase: 'P3_complementar',
    target_merged_entries: 30,
    edital_themes: ['Precauções padrão', 'Contato, gotículas, aerossóis', 'EPI por risco', 'Higienização das mãos'],
    sources_tier_a: ['Anvisa precauções'],
    done_when: 'Cada precaução com indicação e EPI.',
  },
  'Infecções no Contexto da Biossegurança': {
    phase: 'P3_complementar',
    target_merged_entries: 30,
    edital_themes: ['IRAS', 'Cadeia de infecção', 'Perfurocortante', 'Resíduos'],
    sources_tier_a: ['Anvisa IRAS'],
    done_when: '6 elos + conduta perfurocortante completa.',
  },
  'Segurança do Paciente': {
    phase: 'P3_complementar',
    target_merged_entries: 30,
    edital_themes: ['NSP Anvisa', 'Identificação paciente', 'Erro de medicação', 'Queda', 'Úlcera por pressão'],
    sources_tier_a: ['Programa Nacional Segurança do Paciente'],
    done_when: '5 temas NSP com ação de enfermagem.',
  },
  'Processamento de Artigos e Produtos de Saúde': {
    phase: 'P3_complementar',
    target_merged_entries: 28,
    edital_themes: ['Limpeza, desinfecção, esterilização', 'Indicadores químico/biológico', 'Validade'],
    sources_tier_a: ['Anvisa RDC 15/2012'],
    done_when: 'Diferença L/D/E + parâmetros autoclave.',
  },
  'Enfermagem em Central de Material e Esterilização (CME)': {
    phase: 'P3_complementar',
    target_merged_entries: 28,
    edital_themes: ['Fluxo suja→limpa→estéril', 'Áreas físicas', 'Validade materiais'],
    sources_tier_a: ['Anvisa RDC CME'],
    done_when: 'Igual processamento + fluxo unidirecional.',
  },
  'Mobilização e Posicionamento do Paciente': {
    phase: 'P0_manter',
    target_merged_entries: 30,
    edital_themes: ['Decúbitos', 'LPP prevenção', 'Transferência', 'Trendelenburg/Fowler'],
    sources_tier_a: ['COFEN mobilização'],
    done_when: 'Manter — merge curativos cobre LPP.',
  },
  'Procedimentos Diversos': {
    phase: 'P0_manter',
    target_merged_entries: 35,
    edital_themes: ['Assepsia vs desinfecção', 'Higiene das mãos', 'Procedimentos pontuais (nebulização, glicemia capilar)'],
    sources_tier_a: ['Anvisa/OMS precauções padrão'],
    done_when: 'Manter; adicionar só se inferência de enunciado apontar gap.',
  },
  'Feridas e Queimaduras': {
    phase: 'P3_complementar',
    target_merged_entries: 30,
    edital_themes: ['Graus queimadura', 'Regra dos 9', 'Profilaxia tétano', 'Cicatrização'],
    sources_tier_a: ['MS atendimento queimaduras'],
    done_when: 'Regra 9 adulto/criança + profilaxia tétano.',
  },
  'Doenças Parasitárias e Zoonoses': {
    phase: 'P3_complementar',
    target_merged_entries: 28,
    edital_themes: ['Dengue', 'Zika/chikungunya', 'Malária', 'Leptospirose', 'Raiva', 'Esquistossomose'],
    sources_tier_a: ['Manuais vigilância zoonoses MS'],
    done_when: 'Vetor + controle por doença principal.',
  },
  'Doenças Respiratórias Crônicas (Asma, DPOC)': {
    phase: 'P3_complementar',
    target_merged_entries: 35,
    edital_themes: ['Asma — crise e controle', 'DPOC — O₂ titulado', 'SpO₂ 88–92%', 'Tabagismo'],
    sources_tier_a: ['PCDT Asma/DPOC MS'],
    done_when: 'PCDT doses resgate e O₂ DPOC.',
  },
  'Saúde da Criança': {
    phase: 'P3_complementar',
    target_merged_entries: 45,
    edital_themes: ['Aleitamento', 'Crescimento OMS', 'Desidratação', 'Vacinação', 'SV pediátrico'],
    sources_tier_a: ['Caderneta da criança MS', 'SBP SV pediátrico'],
    done_when: 'Plano A/B/C desidratação + curvas crescimento.',
  },
  'Saúde do Adolescente': {
    phase: 'P3_complementar',
    target_merged_entries: 25,
    edital_themes: ['Escuta e sigilo', 'Gravidez adolescente', 'IST e contracepção', 'Vacina HPV', 'Violência'],
    sources_tier_a: ['Linha de cuidado adolescente MS'],
    done_when: 'Sigilo limites legais + HPV PNI.',
  },
  'Saúde Mental': {
    phase: 'P3_complementar',
    target_merged_entries: 25,
    edital_themes: ['RAPS/CAPS', 'Risco suicida', 'Acolhimento', 'CVV 188', 'Estigma'],
    sources_tier_a: ['MS rede atenção psicossocial'],
    done_when: 'Fluxo ideação suicida + encaminhamento.',
  },
  'Enfermagem do Trabalho': {
    phase: 'P3_complementar',
    target_merged_entries: 25,
    edital_themes: ['NR-32', 'Perfurocortante', 'PEP ocupacional', 'Ergonomia', 'Vacinação trabalhador'],
    sources_tier_a: ['NR-32 MTE', 'Protocolos MS exposição biológica'],
    done_when: 'NR-32 escopo + fluxo acidente biológico.',
  },
  'História da Enfermagem': {
    phase: 'P4_conceitual',
    target_merged_entries: 22,
    edital_themes: ['Pioneiras BR', 'COFEN/COREN', 'Lei 7498', 'Código de ética', 'Marcos SUS'],
    sources_tier_a: ['COFEN — história e ética'],
    done_when: '10 marcos históricos frequentes em prova.',
  },
  'Noções de Anatomia': {
    phase: 'P4_conceitual',
    target_merged_entries: 25,
    edital_themes: ['Planos e direções', 'Cavidades', 'Sistemas principais', 'Terminologia'],
    sources_tier_a: ['Terminologia anatômica internacional (conceitual)'],
    done_when: 'Pares direcionais + 3 sistemas (cardiovascular, respiratório, digestório).',
  },
  'Noções de Fisiologia': {
    phase: 'P4_conceitual',
    target_merged_entries: 30,
    edital_themes: ['Homeostase', 'SV normais', 'Equilíbrio ácido-base', 'Termorregulação'],
    sources_tier_a: ['Referência clínica MS/SBP'],
    done_when: 'SV adulto sem duplicar SV subtópico; conceitos fisiológicos puros.',
  },
  'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis': {
    phase: 'P4_conceitual',
    target_merged_entries: 50,
    edital_themes: ['Reclassificar para subtópico canônico', 'Guideline composta até reclassificação'],
    sources_tier_a: ['Derivar de virais + TB + zoonoses + IST + biossegurança'],
    done_when: 'Catálogo reclassificado; bucket <50 questões ou tabela dedicada mínima.',
  },
  'Questões Mescladas e Outras Doenças Agudas': {
    phase: 'P4_conceitual',
    target_merged_entries: 40,
    edital_themes: ['Reclassificar questões', 'Guideline composta urgências + agudas'],
    sources_tier_a: ['Derivar de urgências + virais + respiratório'],
    done_when: 'Reclassificação inferSubtopico; bucket vazio ou <20 questões.',
  },
};

export const PHASE_ORDER: DeepeningPhase[] = [
  'P1_critico',
  'P2_volume',
  'P3_complementar',
  'P0_manter',
  'P4_conceitual',
];

export const PHASE_LABELS: Record<DeepeningPhase, string> = {
  P1_critico: 'Fase 1 — Crítico (volume × gap)',
  P2_volume: 'Fase 2 — Alto volume moderado',
  P3_complementar: 'Fase 3 — Complementar / adequar meta',
  P0_manter: 'Fase 0 — Manter (revisão pontual)',
  P4_conceitual: 'Fase 4 — Conceitual / reclassificação',
};
