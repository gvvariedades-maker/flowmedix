import { toEditorialTheme } from '@/lib/slides/editorialTheme';

// ============================================================================
// SISTEMA DE TEMAS ÚNICOS POR QUESTÃO
// ============================================================================

export interface ThemeColors {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  bgGradient: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  iconBg: string;
  iconText: string;
  iconHoverBg: string;
  iconHoverText: string;
  glowGradient: string;
}

// ============================================================================
// FUNÇÃO DE HASH SIMPLES
// ============================================================================
export const generateSimpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// ============================================================================
// FUNÇÃO DE HASH ROBUSTO PARA UNICIDADE POR QUESTÃO
// ============================================================================
export const generateRobustQuestionHash = (
  questionHash: string,
  slideIndex?: number,
  slideType?: string
): number => {
  // Combina múltiplos fatores para garantir unicidade
  const combined = `${questionHash}-${slideIndex || 0}-${slideType || 'default'}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// ============================================================================
// GERADOR DE VARIAÇÕES ÚNICAS BASEADAS EM HASH (sutis — legibilidade > neon)
// ============================================================================
interface ThemeVariations {
  glowIntensity: number; // 0.08 - 0.22
  saturationShift: number; // -8% a +8%
  brightnessShift: number; // -4% a +4%
  rotation: number; // 0-360 graus para gradientes
  borderOpacity: number; // 18-32%
}

export const generateThemeVariations = (hash: number): ThemeVariations => {
  // Usa diferentes partes do hash para diferentes variações
  const hashStr = hash.toString().padStart(6, '0'); // Garante pelo menos 6 dígitos
  
  // Glow intensity: baseado nos últimos 2 dígitos — faixa baixa
  const glowHash = parseInt(hashStr.slice(-2) || '50', 10);
  const glowIntensity = 0.08 + (glowHash % 15) / 100; // 0.08 a 0.22
  
  // Saturation shift
  const satHash = parseInt(hashStr.slice(0, 2) || '50', 10);
  const saturationShift = ((satHash % 17) - 8) / 100; // -8% a +8%
  
  // Brightness shift
  const brightHash = parseInt(hashStr.slice(2, 4) || '50', 10);
  const brightnessShift = ((brightHash % 9) - 4) / 100; // -4% a +4%
  
  // Rotation: baseado no hash completo
  const rotation = hash % 360;
  
  // Border opacity
  const borderHash = parseInt(hashStr.slice(4, 6) || '30', 10);
  const borderOpacity = 18 + (borderHash % 15); // 18-32%
  
  return {
    glowIntensity,
    saturationShift,
    brightnessShift,
    rotation,
    borderOpacity,
  };
};

// ============================================================================
// MAPEAMENTO DE MATÉRIAS PARA TEMAS (Sistema Híbrido)
// ============================================================================
export const SUBJECT_THEME_MAP: Record<string, string> = {
  // Enfermagem (nicho principal)
  'enfermagem': 'indigo',
  'fundamentos de enfermagem': 'indigo',
  'fundamentos': 'indigo',
  'sae': 'violet',
  'sistematização': 'violet',
  'assistência de enfermagem': 'violet',
  'procedimentos': 'emerald',
  'técnicas': 'emerald',
  'biossegurança': 'cyan',
  'legislação em enfermagem': 'amber',
  'legislação': 'amber',
  'cofen': 'amber',
  'coren': 'amber',
  'saúde pública': 'teal',
  'epidemiologia': 'teal',
  'ética': 'sky',
  
  // Matemática e conteúdo comum em concursos
  'matematica': 'blue',
  'matemática': 'blue',
  'cálculos': 'blue',
  'dosagens': 'blue',
  'raciocinio': 'teal',
  'raciocínio': 'teal',
  'informatica': 'fuchsia',
  'informática': 'fuchsia',
  'atualidades': 'lime',
};

// ============================================================================
// FUNÇÃO SIMPLIFICADA: Retorna classes Tailwind diretas por subject
// ============================================================================
export const getThemeStyles = (subject: string): string => {
  const themes: Record<string, string> = {
    enfermagem: "from-indigo-600/20 to-violet-900/40 border-indigo-500/30 text-indigo-400",
    'fundamentos de enfermagem': "from-indigo-600/20 to-violet-900/40 border-indigo-500/30 text-indigo-400",
    fundamentos: "from-indigo-600/20 to-violet-900/40 border-indigo-500/30 text-indigo-400",
    sae: "from-violet-600/20 to-purple-900/40 border-violet-500/30 text-violet-400",
    legislação: "from-amber-600/20 to-orange-900/40 border-amber-500/30 text-amber-400",
    'legislação em enfermagem': "from-amber-600/20 to-orange-900/40 border-amber-500/30 text-amber-400",
    biossegurança: "from-cyan-600/20 to-teal-900/40 border-cyan-500/30 text-cyan-400",
    'saúde pública': "from-teal-600/20 to-emerald-900/40 border-teal-500/30 text-teal-400",
    matematica: "from-blue-600/20 to-indigo-900/40 border-blue-500/30 text-blue-400",
  };
  return themes[subject.toLowerCase()] || themes.enfermagem;
};

// ============================================================================
// MAPEAMENTO SUBTÓPICO → TEMPLATE + PACOTE DE LAYOUT VARIANTS
// Usado como fallback automático quando o JSON não especifica template
// ============================================================================
export interface SubtopicDesign {
  template: string;              // tema (nome ou tID)
  conceptMap: string;            // layout_variant para concept_map
  goldenRule: string;            // layout_variant para golden_rule
  logicFlow: string;             // layout_variant para logic_flow
  dangerZone: string;            // layout_variant para danger_zone
}

export const SUBTOPIC_DESIGN_MAP: Record<string, SubtopicDesign> = {

  // ============================================================
  // FUNDAMENTOS E BASES DA ENFERMAGEM
  // ============================================================

  // ---- História da Enfermagem ----
  'história da enfermagem': { template: 'amber', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'história': { template: 'amber', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },

  // ---- Noções de Anatomia ----
  'noções de anatomia': { template: 'rose', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },
  'anatomia': { template: 'rose', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },

  // ---- Noções de Fisiologia ----
  'noções de fisiologia': { template: 'cyan', conceptMap: 'molecular', goldenRule: 'banner', logicFlow: 'cards', dangerZone: 'cards' },
  'fisiologia': { template: 'cyan', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },

  // ---- Processo de Enfermagem / SAE (golden: sae-responsibility-matrix · sae-reference-board · sae-decision-tap · norm-reveal) ----
  'processo de enfermagem': { template: 'violet', conceptMap: 'sae-responsibility-matrix', goldenRule: 'sae-reference-board', logicFlow: 'sae-decision-tap', dangerZone: 'norm-reveal' },
  'sae': { template: 'violet', conceptMap: 'sae-responsibility-matrix', goldenRule: 'sae-reference-board', logicFlow: 'sae-decision-tap', dangerZone: 'norm-reveal' },
  'sistematização da assistência de enfermagem': { template: 'violet', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },
  'fundamentos de enfermagem': { template: 'indigo', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },

  // ============================================================
  // FARMACOLOGIA E MEDICAMENTOS
  // ============================================================

  // ---- Farmacodinâmica e Farmacocinética (golden: adme-journey-rail · pk-pd-reference-board · farmaco-vf-juggle-tap · farmaco-trap) ----
  'farmacodinâmica e farmacocinética': { template: 'purple', conceptMap: 'adme-journey-rail', goldenRule: 'pk-pd-reference-board', logicFlow: 'farmaco-vf-juggle-tap', dangerZone: 'farmaco-trap' },
  'farmacodinâmica': { template: 'purple', conceptMap: 'adme-journey-rail', goldenRule: 'pk-pd-reference-board', logicFlow: 'farmaco-vf-juggle-tap', dangerZone: 'farmaco-trap' },
  'farmacocinética': { template: 'purple', conceptMap: 'adme-journey-rail', goldenRule: 'pk-pd-reference-board', logicFlow: 'farmaco-vf-juggle-tap', dangerZone: 'farmaco-trap' },
  'farmacologia': { template: 'purple', conceptMap: 'adme-journey-rail', goldenRule: 'pk-pd-reference-board', logicFlow: 'farmaco-vf-juggle-tap', dangerZone: 'farmaco-trap' },

  // ---- Cálculo de Medicamentos ----
  // ---- Cálculos (golden: dose-equivalence-rail · soft-lens-board · dose-calc-tap · dose-trap) ----
  'cálculo de administração de medicamentos e infusões': { template: 'blue', conceptMap: 'dose-equivalence-rail', goldenRule: 'soft-lens-board', logicFlow: 'dose-calc-tap', dangerZone: 'dose-trap' },
  'cálculo de administração de medicamentos': { template: 'blue', conceptMap: 'dose-equivalence-rail', goldenRule: 'soft-lens-board', logicFlow: 'dose-calc-tap', dangerZone: 'dose-trap' },
  'cálculos de enfermagem': { template: 'blue', conceptMap: 'dose-equivalence-rail', goldenRule: 'soft-lens-board', logicFlow: 'dose-calc-tap', dangerZone: 'dose-trap' },
  'dosagens e cálculos': { template: 'blue', conceptMap: 'dose-equivalence-rail', goldenRule: 'soft-lens-board', logicFlow: 'dose-calc-tap', dangerZone: 'dose-trap' },

  // ---- Vias de Administração ----
  // ---- Vias de Administração (golden: absorption-speed-rail · via-reference-board · via-vf-juggle-tap · route-trap) ----
  'vias de administração': { template: 'emerald', conceptMap: 'absorption-speed-rail', goldenRule: 'via-reference-board', logicFlow: 'via-vf-juggle-tap', dangerZone: 'route-trap' },

  // ---- Cuidados na Administração de Medicamentos (golden: bridge · reference_table · cards · compare) ----
  'cuidados na administração de medicamentos': { template: 'teal', conceptMap: 'cam-certos-deck', goldenRule: 'cam-nine-rights-board', logicFlow: 'cam-vf-juggle-tap', dangerZone: 'cam-certos-trap-arena' },

  // ============================================================
  // PROCEDIMENTOS DE ENFERMAGEM
  // ============================================================

  // ---- Sinais Vitais (golden: vitals-panel · vitals-reference-board · vitals-translate-tap · vitals-classify-arena) ----
  'verificação de sinais vitais': { template: 'rose', conceptMap: 'vitals-panel', goldenRule: 'vitals-reference-board', logicFlow: 'vitals-translate-tap', dangerZone: 'vitals-classify-arena' },
  'sinais vitais': { template: 'rose', conceptMap: 'vitals-panel', goldenRule: 'vitals-reference-board', logicFlow: 'vitals-translate-tap', dangerZone: 'vitals-classify-arena' },

  // ---- Sondas (golden: procedure-protocol · reference_table · vertical · trap-reveal) ----
  'instalação e manejo de sondas': { template: 'indigo', conceptMap: 'procedure-protocol', goldenRule: 'sonda-measurement-board', logicFlow: 'sonda-decision-tap', dangerZone: 'trap-reveal' },
  'sondas': { template: 'indigo', conceptMap: 'procedure-protocol', goldenRule: 'sonda-measurement-board', logicFlow: 'sonda-decision-tap', dangerZone: 'trap-reveal' },

  // ---- Oxigenoterapia ----
  'oxigenoterapia e cuidados respiratórios': { template: 'cyan', conceptMap: 'oxygen-protocol-deck', goldenRule: 'oxygen-rule-carousel', logicFlow: 'oxygen-step-ladder', dangerZone: 'compare' },
  'oxigenoterapia': { template: 'cyan', conceptMap: 'oxygen-protocol-deck', goldenRule: 'oxygen-rule-carousel', logicFlow: 'oxygen-step-ladder', dangerZone: 'compare' },
  'cuidados respiratórios': { template: 'cyan', conceptMap: 'oxygen-protocol-deck', goldenRule: 'oxygen-rule-carousel', logicFlow: 'oxygen-step-ladder', dangerZone: 'compare' },

  // ---- Curativos e Feridas ----
  'curativos e manejo de feridas': { template: 'orange', conceptMap: 'wound-stage-tissue-deck', goldenRule: 'dressing-match-matrix', logicFlow: 'wound-prep-tap-flow', dangerZone: 'dressing-choice-arena' },
  'curativos': { template: 'orange', conceptMap: 'wound-stage-tissue-deck', goldenRule: 'dressing-match-matrix', logicFlow: 'wound-prep-tap-flow', dangerZone: 'dressing-choice-arena' },
  'manejo de feridas': { template: 'orange', conceptMap: 'wound-stage-tissue-deck', goldenRule: 'dressing-match-matrix', logicFlow: 'wound-prep-tap-flow', dangerZone: 'dressing-choice-arena' },
  // ---- Feridas e Queimaduras (golden: burn-rule-nine-board · burn-triage-tap-flow · burn-trap-arena) ----
  'feridas e queimaduras': { template: 'orange', conceptMap: 'burn-depth-layer-deck', goldenRule: 'burn-rule-nine-board', logicFlow: 'burn-triage-tap-flow', dangerZone: 'burn-trap-arena' },
  'feridas': { template: 'orange', conceptMap: 'burn-depth-layer-deck', goldenRule: 'burn-rule-nine-board', logicFlow: 'burn-triage-tap-flow', dangerZone: 'burn-trap-arena' },
  'queimaduras': { template: 'orange', conceptMap: 'burn-depth-layer-deck', goldenRule: 'burn-rule-nine-board', logicFlow: 'burn-triage-tap-flow', dangerZone: 'burn-trap-arena' },

  // ---- Punção Venosa / Cateteres (ramos L2.5 — ver BRANCH_DESIGN_MAP) ----
  'punção venosa e cuidados com cateteres': { template: 'indigo', conceptMap: 'bridge', goldenRule: 'reference_table', logicFlow: 'cards', dangerZone: 'compare' },
  'punção venosa': { template: 'indigo', conceptMap: 'bridge', goldenRule: 'reference_table', logicFlow: 'cards', dangerZone: 'compare' },
  'cateteres': { template: 'indigo', conceptMap: 'bridge', goldenRule: 'reference_table', logicFlow: 'cards', dangerZone: 'compare' },

  // ---- Coleta de Exames ----
  'coleta de exames laboratoriais': { template: 'sky', conceptMap: 'lab-specimen-chain', goldenRule: 'lab-prep-lens-board', logicFlow: 'lab-vf-soft-stack', dangerZone: 'lab-specimen-arena' },
  'coleta de exames': { template: 'sky', conceptMap: 'lab-specimen-chain', goldenRule: 'lab-prep-lens-board', logicFlow: 'lab-vf-soft-stack', dangerZone: 'lab-specimen-arena' },
  'exames laboratoriais': { template: 'sky', conceptMap: 'lab-specimen-chain', goldenRule: 'lab-prep-lens-board', logicFlow: 'lab-vf-soft-stack', dangerZone: 'lab-specimen-arena' },

  // ---- Mobilização e Posicionamento ----
  'mobilização e posicionamento do paciente': { template: 'teal', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },
  'mobilização': { template: 'teal', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },
  'posicionamento': { template: 'teal', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },

  // ---- Procedimentos Diversos ----
  'procedimentos diversos': { template: 'emerald', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'cards' },
  'procedimentos': { template: 'emerald', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'cards' },
  'técnicas de enfermagem': { template: 'emerald', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'cards' },

  // ============================================================
  // BIOSSEGURANÇA E CONTROLE DE INFECÇÃO
  // ============================================================

  // ---- CME / Processamento de Artigos ----
  'processamento de artigos e produtos de saúde': { template: 'teal', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'enfermagem em central de material e esterilização (cme)': { template: 'teal', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'central de material e esterilização': { template: 'teal', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'cme': { template: 'teal', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'esterilização': { template: 'teal', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },

  // ---- Precaução e Prevenção de Contato ----
  'medidas de prevenção e precaução de contato': { template: 'cyan', conceptMap: 'molecular', goldenRule: 'banner', logicFlow: 'cards', dangerZone: 'cards' },
  'precaução de contato': { template: 'cyan', conceptMap: 'molecular', goldenRule: 'banner', logicFlow: 'cards', dangerZone: 'cards' },
  'biossegurança': { template: 'cyan', conceptMap: 'molecular', goldenRule: 'banner', logicFlow: 'cards', dangerZone: 'cards' },

  // ---- Infecções e Biossegurança ----
  'infecções no contexto da biossegurança': { template: 'lime', conceptMap: 'molecular', goldenRule: 'banner', logicFlow: 'cards', dangerZone: 'cards' },

  // ---- Segurança do Paciente (default genérico; ramos fortes em BRANCH_DESIGN_MAP) ----
  'segurança do paciente': { template: 'amber', conceptMap: 'morphological', goldenRule: 'reference_table', logicFlow: 'vertical', dangerZone: 'compare' },

  // ============================================================
  // SAÚDE PÚBLICA E EPIDEMIOLOGIA
  // ============================================================

  // ---- Epidemiologia ----
  'epidemiologia e vigilância epidemiológica': { template: 'lime', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },
  'epidemiologia': { template: 'lime', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },
  'vigilância epidemiológica': { template: 'lime', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },
  'saúde pública': { template: 'teal', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },

  // ---- Promoção à Saúde (golden: sus-art4-orbit · reference_table · cards · scope-trap) ----
  'promoção à saúde e prevenção de agravos': { template: 'emerald', conceptMap: 'sus-art4-orbit', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'scope-trap' },
  'promoção à saúde': { template: 'emerald', conceptMap: 'sus-art4-orbit', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'scope-trap' },
  'prevenção de agravos': { template: 'emerald', conceptMap: 'sus-art4-orbit', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'scope-trap' },

  // ---- Imunização (golden: pni-rules-deck · pni-interval-matrix · pni-vf-juggle-tap · pni-trap-chips) ----
  'imunização': { template: 'lime', conceptMap: 'pni-rules-deck', goldenRule: 'pni-interval-matrix', logicFlow: 'pni-vf-juggle-tap', dangerZone: 'pni-trap-chips' },
  'vacinação': { template: 'lime', conceptMap: 'pni-rules-deck', goldenRule: 'pni-interval-matrix', logicFlow: 'pni-vf-juggle-tap', dangerZone: 'pni-trap-chips' },

  // ---- Atenção Básica / Saúde da Família ----
  'atenção básica / saúde da família': { template: 'emerald', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },
  'atenção básica': { template: 'emerald', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },
  'saúde da família': { template: 'emerald', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },

  // ============================================================
  // DOENÇAS TRANSMISSÍVEIS
  // ============================================================

  // ---- ISTs (golden: ist-risk-routes-deck · ist-reference-board · ist-vf-juggle-tap · ist-trap-chips) ----
  'infecções sexualmente transmissíveis (ists)': { template: 'purple', conceptMap: 'ist-risk-routes-deck', goldenRule: 'ist-reference-board', logicFlow: 'ist-vf-juggle-tap', dangerZone: 'ist-trap-chips' },
  'infecções sexualmente transmissíveis': { template: 'purple', conceptMap: 'ist-risk-routes-deck', goldenRule: 'ist-reference-board', logicFlow: 'ist-vf-juggle-tap', dangerZone: 'ist-trap-chips' },
  'ists': { template: 'purple', conceptMap: 'ist-risk-routes-deck', goldenRule: 'ist-reference-board', logicFlow: 'ist-vf-juggle-tap', dangerZone: 'ist-trap-chips' },

  // ---- Doenças Virais ----
  'doenças virais de interesse epidemiológico (covid, influenza, sarampo, polio etc.)': { template: 'rose', conceptMap: 'molecular', goldenRule: 'banner', logicFlow: 'cards', dangerZone: 'cards' },
  'doenças virais de interesse epidemiológico': { template: 'rose', conceptMap: 'molecular', goldenRule: 'banner', logicFlow: 'cards', dangerZone: 'cards' },
  'doenças virais': { template: 'rose', conceptMap: 'molecular', goldenRule: 'banner', logicFlow: 'cards', dangerZone: 'cards' },

  // ---- Doenças Bacterianas e Fúngicas ----
  'doenças bacterianas e fúngicas (tuberculose, tétano, candidíase etc.)': { template: 'orange', conceptMap: 'molecular', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'doenças bacterianas e fúngicas': { template: 'orange', conceptMap: 'molecular', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'tuberculose': { template: 'orange', conceptMap: 'morphological', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },

  // ---- Doenças Parasitárias e Zoonoses ----
  'doenças parasitárias e zoonoses': { template: 'lime', conceptMap: 'molecular', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'cards' },
  'zoonoses': { template: 'lime', conceptMap: 'molecular', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'cards' },

  // ---- Doenças Transmissíveis (mescladas) ----
  'outras doenças e questões mescladas sobre doenças transmissíveis': { template: 'teal', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },
  'questões mescladas e outras doenças agudas': { template: 'sky', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },

  // ---- Doenças Respiratórias Crônicas (golden: respiratorio-asma-dpoc-duel-deck · respiratorio-spo2-reference-board · respiratorio-vf-juggle-tap · respiratorio-spo2-trap-arena) ----
  'doenças respiratórias crônicas (asma, dpoc)': {
    template: 'cyan',
    conceptMap: 'respiratorio-asma-dpoc-duel-deck',
    goldenRule: 'respiratorio-spo2-reference-board',
    logicFlow: 'respiratorio-vf-juggle-tap',
    dangerZone: 'respiratorio-spo2-trap-arena',
  },
  'doenças respiratórias crônicas': {
    template: 'cyan',
    conceptMap: 'respiratorio-asma-dpoc-duel-deck',
    goldenRule: 'respiratorio-spo2-reference-board',
    logicFlow: 'respiratorio-vf-juggle-tap',
    dangerZone: 'respiratorio-spo2-trap-arena',
  },
  'asma': {
    template: 'cyan',
    conceptMap: 'respiratorio-asma-dpoc-duel-deck',
    goldenRule: 'respiratorio-spo2-reference-board',
    logicFlow: 'respiratorio-vf-juggle-tap',
    dangerZone: 'respiratorio-spo2-trap-arena',
  },
  'dpoc': {
    template: 'cyan',
    conceptMap: 'respiratorio-asma-dpoc-duel-deck',
    goldenRule: 'respiratorio-spo2-reference-board',
    logicFlow: 'respiratorio-vf-juggle-tap',
    dangerZone: 'respiratorio-spo2-trap-arena',
  },

  // ============================================================
  // ESPECIALIDADES CIRÚRGICAS E CRÍTICAS
  // ============================================================

  // ---- Assistência Perioperatória ----
  'assistência perioperatória (inclui srpa)': { template: 'violet', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'assistência perioperatória': { template: 'violet', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'perioperatório': { template: 'violet', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'srpa': { template: 'violet', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },

  // ---- Centro Cirúrgico ----
  'enfermagem em centro cirúrgico': { template: 'fuchsia', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'centro cirúrgico': { template: 'fuchsia', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'cirúrgico': { template: 'fuchsia', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },

  // ---- Urgências e Emergências (golden: survival-chain · reference_table · vertical · trap-reveal) ----
  'urgências e emergências': { template: 'rose', conceptMap: 'survival-chain', goldenRule: 'center', logicFlow: 'vertical', dangerZone: 'trap-reveal' },
  'urgência e emergência': { template: 'rose', conceptMap: 'survival-chain', goldenRule: 'center', logicFlow: 'vertical', dangerZone: 'trap-reveal' },
  'emergência': { template: 'rose', conceptMap: 'survival-chain', goldenRule: 'center', logicFlow: 'vertical', dangerZone: 'trap-reveal' },
  'urgência': { template: 'rose', conceptMap: 'survival-chain', goldenRule: 'center', logicFlow: 'vertical', dangerZone: 'trap-reveal' },

  // ============================================================
  // SAÚDE DO TRABALHADOR
  // ============================================================

  // ---- Enfermagem do Trabalho (golden: nr32-annex-deck · trabalho-nr32-reference-board · trabalho-vf-juggle-tap · trabalho-pep-trap-arena) ----
  'enfermagem do trabalho': {
    template: 'amber',
    conceptMap: 'nr32-annex-deck',
    goldenRule: 'trabalho-nr32-reference-board',
    logicFlow: 'trabalho-vf-juggle-tap',
    dangerZone: 'trabalho-pep-trap-arena',
  },

  // ============================================================
  // SAÚDE MENTAL
  // ============================================================

  // Ramo SM bespoke RAPS/legis + crise/CAPS (golden: mental-raps-network-rail · mental-raps-tier-board · mental-raps-classify-tap · mental-raps-trap-arena)
  'saúde mental': { template: 'violet', conceptMap: 'mental-raps-network-rail', goldenRule: 'mental-raps-tier-board', logicFlow: 'mental-raps-classify-tap', dangerZone: 'mental-raps-trap-arena' },
  'psiquiatria': { template: 'violet', conceptMap: 'mental-raps-network-rail', goldenRule: 'mental-raps-tier-board', logicFlow: 'mental-raps-classify-tap', dangerZone: 'mental-raps-trap-arena' },

  // ============================================================
  // SAÚDE DA FAMÍLIA E CICLOS DE VIDA
  // ============================================================

  // ---- Saúde da Criança ----
  'saúde da criança': { template: 'cyan', conceptMap: 'morphological', goldenRule: 'banner', logicFlow: 'cards', dangerZone: 'list' },
  'pediatria': { template: 'cyan', conceptMap: 'morphological', goldenRule: 'banner', logicFlow: 'cards', dangerZone: 'list' },

  // ---- Saúde do Adolescente (v2 ética: pillars · speak-barrier · exceto-isolate · compare) ----
  'saúde do adolescente': { template: 'sky', conceptMap: 'adolescent-care-pillars-deck', goldenRule: 'adolescent-speak-barrier-board', logicFlow: 'adolescent-exceto-isolate-tap', dangerZone: 'adolescent-exceto-compare' },
  'adolescente': { template: 'sky', conceptMap: 'adolescent-care-pillars-deck', goldenRule: 'adolescent-speak-barrier-board', logicFlow: 'adolescent-exceto-isolate-tap', dangerZone: 'adolescent-exceto-compare' },

  // ---- Saúde da Mulher ----
  'saúde da mulher': { template: 'pink', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },
  'obstetrícia': { template: 'pink', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },
  'ginecologia': { template: 'pink', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },

  // ============================================================
  // LEGISLAÇÃO
  // ============================================================

  'legislação': { template: 'amber', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'lei 7.498/86': { template: 'amber', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'cofen/coren': { template: 'orange', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'list' },
  'ética': { template: 'sky', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },

  // ============================================================
  // HISTOPATOLOGIA (área técnica/laboratório)
  // ============================================================

  'histopatologia': { template: 'sky', conceptMap: 'molecular', goldenRule: 'banner', logicFlow: 'cards', dangerZone: 'cards' },

  // ============================================================
  // DEMAIS MATÉRIAS DE CONCURSO
  // ============================================================

  'matemática': { template: 'blue', conceptMap: 'morphological', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'raciocínio lógico': { template: 'teal', conceptMap: 'bridge', goldenRule: 'minimal', logicFlow: 'cards', dangerZone: 'list' },
  'informática': { template: 'fuchsia', conceptMap: 'morphological', goldenRule: 'center', logicFlow: 'cards', dangerZone: 'cards' },
  'imobilização ortopédica': { template: 'rose', conceptMap: 'morphological', goldenRule: 'banner', logicFlow: 'cards', dangerZone: 'list' },

  // ============================================================
  // LÍNGUA PORTUGUESA (pacote bespoke pt-crase-funnel + pt-clitic-rail + pt-comma-rail + pt-term-matrix)
  // ============================================================

  // ---- Crase (golden: pt-crase-funnel-deck · pt-crase-funnel-board · pt-crase-funnel-tap-flow · pt-crase-trap-arena) ----
  'crase': { template: 'amber', conceptMap: 'pt-crase-funnel-deck', goldenRule: 'pt-crase-funnel-board', logicFlow: 'pt-crase-funnel-tap-flow', dangerZone: 'pt-crase-trap-arena' },
  // ---- Pronomes e colocação (golden: pt-clitic-rail 4/4) ----
  'pronomes e colocação pronominal': { template: 'sky', conceptMap: 'pt-clitic-rail-deck', goldenRule: 'pt-clitic-rail-board', logicFlow: 'pt-clitic-rail-tap-flow', dangerZone: 'pt-clitic-trap-arena' },
  'colocação pronominal': { template: 'sky', conceptMap: 'pt-clitic-rail-deck', goldenRule: 'pt-clitic-rail-board', logicFlow: 'pt-clitic-rail-tap-flow', dangerZone: 'pt-clitic-trap-arena' },
  'pronomes': { template: 'sky', conceptMap: 'pt-clitic-rail-deck', goldenRule: 'pt-clitic-rail-board', logicFlow: 'pt-clitic-rail-tap-flow', dangerZone: 'pt-clitic-trap-arena' },
  // ---- Pontuação (golden: pt-comma-rail 4/4) ----
  'pontuação': { template: 'violet', conceptMap: 'pt-comma-rail-deck', goldenRule: 'pt-comma-rail-board', logicFlow: 'pt-comma-rail-tap-flow', dangerZone: 'pt-comma-trap-arena' },
  'pontuacao': { template: 'violet', conceptMap: 'pt-comma-rail-deck', goldenRule: 'pt-comma-rail-board', logicFlow: 'pt-comma-rail-tap-flow', dangerZone: 'pt-comma-trap-arena' },
  // ---- Termos da oração (golden: pt-term-matrix 4/4) ----
  'termos da oração': { template: 'teal', conceptMap: 'pt-term-matrix-deck', goldenRule: 'pt-term-matrix-board', logicFlow: 'pt-term-matrix-tap-flow', dangerZone: 'pt-term-trap-arena' },
  'termos da oracao': { template: 'teal', conceptMap: 'pt-term-matrix-deck', goldenRule: 'pt-term-matrix-board', logicFlow: 'pt-term-matrix-tap-flow', dangerZone: 'pt-term-trap-arena' },
  'concordância verbal e nominal': { template: 'indigo', conceptMap: 'pt-subject-focus-deck', goldenRule: 'pt-subject-focus-board', logicFlow: 'pt-subject-focus-tap-flow', dangerZone: 'pt-subject-trap-arena' },
  'concordancia verbal e nominal': { template: 'indigo', conceptMap: 'pt-subject-focus-deck', goldenRule: 'pt-subject-focus-board', logicFlow: 'pt-subject-focus-tap-flow', dangerZone: 'pt-subject-trap-arena' },
};

/** Normaliza string de subtópico para busca no mapa */
const normalizeKey = (str: string): string =>
  str.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // remove acentos
    .replace(/\s+/g, ' ');

/**
 * Busca design por subtópico, com tentativas parciais.
 * Retorna o SubtopicDesign ou undefined se não encontrar.
 */
export const getDesignBySubtopic = (subtopico: string): SubtopicDesign | undefined => {
  const key = normalizeKey(subtopico);
  // Busca exata
  const exactMatch = Object.entries(SUBTOPIC_DESIGN_MAP).find(
    ([k]) => normalizeKey(k) === key
  );
  if (exactMatch) return exactMatch[1];
  // Busca parcial (subtópico contém a chave ou vice-versa)
  const partialMatch = Object.entries(SUBTOPIC_DESIGN_MAP).find(
    ([k]) => key.includes(normalizeKey(k)) || normalizeKey(k).includes(key)
  );
  return partialMatch ? partialMatch[1] : undefined;
};

/** Subtópico canônico no mapa → molde visual fixo (sem rotação por família/slug). */
export function hasSubtopicCanonicalDesign(subtopico: string | undefined): boolean {
  if (!subtopico?.trim()) return false;
  return getDesignBySubtopic(subtopico) !== undefined;
}

/**
 * Retorna o layout_variant correto dado o subtópico e tipo de slide.
 * Fallback: calcula pela lógica semântica padrão.
 */
export const getLayoutVariantBySubtopic = (
  subtopico: string,
  slideType: string,
  slide?: any
): string => {
  const design = getDesignBySubtopic(subtopico);
  if (!design) return calculateLayoutVariantFromType(slideType, slide);
  switch (slideType) {
    case 'concept_map': return design.conceptMap;
    case 'golden_rule': return design.goldenRule;
    case 'logic_flow': return design.logicFlow;
    case 'danger_zone': return design.dangerZone;
    default: return 'grid';
  }
};

// ============================================================================
// MAPEAMENTO TEMPLATE ID → TEMA (10–15 modelos visuais por assunto)
// Usado quando o JSON especifica "template": "t03" ou "theme_id": "t07"
// ============================================================================
export const TEMPLATE_THEME_MAP: Record<string, string> = {
  t01: 'indigo',
  t02: 'emerald',
  t03: 'rose',
  t04: 'amber',
  t05: 'violet',
  t06: 'cyan',
  t07: 'fuchsia',
  t08: 'sky',
  t09: 'lime',
  t10: 'teal',
  t11: 'orange',
  t12: 'blue',
  t13: 'purple',
  t14: 'pink',
  t15: 'indigo',
};

// ============================================================================
// PALETA DE TEMAS PREDEFINIDOS
// ============================================================================
const THEMES_PALETTE: ThemeColors[] = [
    {
      name: 'indigo',
      primary: 'from-indigo-600 via-purple-600 to-pink-600',
      secondary: 'from-cyan-500 to-blue-600',
      accent: 'indigo',
      glow: 'rgba(139, 92, 246, 0.22)',
      bgGradient: 'from-slate-900 via-indigo-950 to-slate-900',
      borderColor: 'border-indigo-500/30',
      textPrimary: 'text-indigo-100',
      textSecondary: 'text-indigo-300',
      iconBg: 'bg-indigo-500/10',
      iconText: 'text-indigo-400',
      iconHoverBg: 'group-hover:bg-indigo-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-indigo-500/10'
    },
    {
      name: 'emerald',
      primary: 'from-emerald-500 via-teal-500 to-cyan-500',
      secondary: 'from-green-400 to-emerald-600',
      accent: 'emerald',
      glow: 'rgba(16, 185, 129, 0.22)',
      bgGradient: 'from-slate-900 via-emerald-950 to-slate-900',
      borderColor: 'border-emerald-500/30',
      textPrimary: 'text-emerald-100',
      textSecondary: 'text-emerald-300',
      iconBg: 'bg-emerald-500/10',
      iconText: 'text-emerald-400',
      iconHoverBg: 'group-hover:bg-emerald-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-emerald-500/10'
    },
    {
      name: 'rose',
      primary: 'from-rose-500 via-pink-500 to-fuchsia-600',
      secondary: 'from-pink-400 to-rose-600',
      accent: 'rose',
      glow: 'rgba(244, 63, 94, 0.22)',
      bgGradient: 'from-slate-900 via-rose-950 to-slate-900',
      borderColor: 'border-rose-500/30',
      textPrimary: 'text-rose-100',
      textSecondary: 'text-rose-300',
      iconBg: 'bg-rose-500/10',
      iconText: 'text-rose-400',
      iconHoverBg: 'group-hover:bg-rose-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-rose-500/10'
    },
    {
      name: 'amber',
      primary: 'from-amber-500 via-orange-500 to-red-500',
      secondary: 'from-yellow-400 to-orange-600',
      accent: 'amber',
      glow: 'rgba(245, 158, 11, 0.22)',
      bgGradient: 'from-slate-900 via-amber-950 to-slate-900',
      borderColor: 'border-amber-500/30',
      textPrimary: 'text-amber-100',
      textSecondary: 'text-amber-300',
      iconBg: 'bg-amber-500/10',
      iconText: 'text-amber-400',
      iconHoverBg: 'group-hover:bg-amber-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-amber-500/10'
    },
    {
      name: 'violet',
      primary: 'from-violet-600 via-purple-600 to-indigo-600',
      secondary: 'from-purple-400 to-violet-600',
      accent: 'violet',
      glow: 'rgba(139, 92, 246, 0.22)',
      bgGradient: 'from-slate-900 via-violet-950 to-slate-900',
      borderColor: 'border-violet-500/30',
      textPrimary: 'text-violet-100',
      textSecondary: 'text-violet-300',
      iconBg: 'bg-violet-500/10',
      iconText: 'text-violet-400',
      iconHoverBg: 'group-hover:bg-violet-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-violet-500/10'
    },
    {
      name: 'cyan',
      primary: 'from-blue-500 via-cyan-500 to-teal-500',
      secondary: 'from-cyan-400 to-blue-600',
      accent: 'cyan',
      glow: 'rgba(6, 182, 212, 0.22)',
      bgGradient: 'from-slate-900 via-cyan-950 to-slate-900',
      borderColor: 'border-cyan-500/30',
      textPrimary: 'text-cyan-100',
      textSecondary: 'text-cyan-300',
      iconBg: 'bg-cyan-500/10',
      iconText: 'text-cyan-400',
      iconHoverBg: 'group-hover:bg-cyan-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-cyan-500/10'
    },
    {
      name: 'fuchsia',
      primary: 'from-fuchsia-600 via-pink-600 to-purple-600',
      secondary: 'from-pink-500 to-fuchsia-600',
      accent: 'fuchsia',
      glow: 'rgba(217, 70, 239, 0.22)',
      bgGradient: 'from-slate-900 via-fuchsia-950 to-slate-900',
      borderColor: 'border-fuchsia-500/30',
      textPrimary: 'text-fuchsia-100',
      textSecondary: 'text-fuchsia-300',
      iconBg: 'bg-fuchsia-500/10',
      iconText: 'text-fuchsia-400',
      iconHoverBg: 'group-hover:bg-fuchsia-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-fuchsia-500/10'
    },
    {
      name: 'sky',
      primary: 'from-sky-500 via-blue-500 to-indigo-600',
      secondary: 'from-blue-400 to-sky-600',
      accent: 'sky',
      glow: 'rgba(14, 165, 233, 0.22)',
      bgGradient: 'from-slate-900 via-sky-950 to-slate-900',
      borderColor: 'border-sky-500/30',
      textPrimary: 'text-sky-100',
      textSecondary: 'text-sky-300',
      iconBg: 'bg-sky-500/10',
      iconText: 'text-sky-400',
      iconHoverBg: 'group-hover:bg-sky-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-sky-500/10'
    },
    {
      name: 'lime',
      primary: 'from-lime-500 via-green-500 to-emerald-600',
      secondary: 'from-green-400 to-lime-600',
      accent: 'lime',
      glow: 'rgba(132, 204, 22, 0.22)',
      bgGradient: 'from-slate-900 via-lime-950 to-slate-900',
      borderColor: 'border-lime-500/30',
      textPrimary: 'text-lime-100',
      textSecondary: 'text-lime-300',
      iconBg: 'bg-lime-500/10',
      iconText: 'text-lime-400',
      iconHoverBg: 'group-hover:bg-lime-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-lime-500/10'
    },
    {
      name: 'teal',
      primary: 'from-teal-500 via-cyan-500 to-blue-600',
      secondary: 'from-cyan-400 to-teal-600',
      accent: 'teal',
      glow: 'rgba(20, 184, 166, 0.22)',
      bgGradient: 'from-slate-900 via-teal-950 to-slate-900',
      borderColor: 'border-teal-500/30',
      textPrimary: 'text-teal-100',
      textSecondary: 'text-teal-300',
      iconBg: 'bg-teal-500/10',
      iconText: 'text-teal-400',
      iconHoverBg: 'group-hover:bg-teal-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-teal-500/10'
    },
    {
      name: 'orange',
      primary: 'from-orange-500 via-red-500 to-pink-600',
      secondary: 'from-red-400 to-orange-600',
      accent: 'orange',
      glow: 'rgba(249, 115, 22, 0.22)',
      bgGradient: 'from-slate-900 via-orange-950 to-slate-900',
      borderColor: 'border-orange-500/30',
      textPrimary: 'text-orange-100',
      textSecondary: 'text-orange-300',
      iconBg: 'bg-orange-500/10',
      iconText: 'text-orange-400',
      iconHoverBg: 'group-hover:bg-orange-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-orange-500/10'
    },
    {
      name: 'blue',
      primary: 'from-blue-600 via-indigo-600 to-purple-600',
      secondary: 'from-indigo-400 to-blue-600',
      accent: 'blue',
      glow: 'rgba(37, 99, 235, 0.22)',
      bgGradient: 'from-slate-900 via-blue-950 to-slate-900',
      borderColor: 'border-blue-500/30',
      textPrimary: 'text-blue-100',
      textSecondary: 'text-blue-300',
      iconBg: 'bg-blue-500/10',
      iconText: 'text-blue-400',
      iconHoverBg: 'group-hover:bg-blue-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-blue-500/10'
    },
    {
      name: 'purple',
      primary: 'from-purple-600 via-violet-600 to-fuchsia-600',
      secondary: 'from-violet-400 to-purple-600',
      accent: 'purple',
      glow: 'rgba(168, 85, 247, 0.22)',
      bgGradient: 'from-slate-900 via-purple-950 to-slate-900',
      borderColor: 'border-purple-500/30',
      textPrimary: 'text-purple-100',
      textSecondary: 'text-purple-300',
      iconBg: 'bg-purple-500/10',
      iconText: 'text-purple-400',
      iconHoverBg: 'group-hover:bg-purple-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-purple-500/10'
    },
    {
      name: 'pink',
      primary: 'from-pink-500 via-rose-500 to-red-500',
      secondary: 'from-rose-400 to-pink-600',
      accent: 'pink',
      glow: 'rgba(236, 72, 153, 0.22)',
      bgGradient: 'from-slate-900 via-pink-950 to-slate-900',
      borderColor: 'border-pink-500/30',
      textPrimary: 'text-pink-100',
      textSecondary: 'text-pink-300',
      iconBg: 'bg-pink-500/10',
      iconText: 'text-pink-400',
      iconHoverBg: 'group-hover:bg-pink-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-pink-500/10'
    }
];

const getThemeFromHash = (hash: number): ThemeColors =>
  THEMES_PALETTE[hash % THEMES_PALETTE.length];

/** Retorna tema pelo nome (ex: "violet", "indigo") ou undefined se não existir */
const getThemeByName = (name: string): ThemeColors | undefined =>
  THEMES_PALETTE.find((t) => t.name === name.toLowerCase());

/** Retorna tema pelo template/theme_id do JSON (ex: "t03", "t10") */
const getThemeByTemplateId = (templateId: string): ThemeColors | undefined => {
  const id = String(templateId).toLowerCase().trim();
  const themeName = TEMPLATE_THEME_MAP[id] ?? (THEMES_PALETTE.some((t) => t.name === id) ? id : undefined);
  return themeName ? getThemeByName(themeName) : undefined;
};

// ============================================================================
// APLICA VARIAÇÕES ÚNICAS A UM TEMA BASE
// ============================================================================
const applyThemeVariations = (
  baseTheme: ThemeColors,
  variations: ThemeVariations,
  slideIndex: number = 0
): ThemeColors => {
  // Criar cópia do tema para não modificar o original
  const modifiedTheme = { ...baseTheme };
  
  // Ajustar glow com intensidade única (faixa baixa)
  const glowMatch = baseTheme.glow.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (glowMatch) {
    const [, r, g, b] = glowMatch;
    // Usa a intensidade calculada (range 0.08-0.22)
    modifiedTheme.glow = `rgba(${r}, ${g}, ${b}, ${variations.glowIntensity.toFixed(2)})`;
  }
  
  // Ajustar border opacity
  const borderMatch = baseTheme.borderColor.match(/border-(\w+)-500\/(\d+)/);
  if (borderMatch) {
    const [, color] = borderMatch;
    modifiedTheme.borderColor = `border-${color}-500/${variations.borderOpacity}`;
  } else {
    // Fallback: tentar extrair cor de outra forma
    const colorMatch = baseTheme.borderColor.match(/border-(\w+)-/);
    if (colorMatch) {
      const [, color] = colorMatch;
      modifiedTheme.borderColor = `border-${color}-500/${variations.borderOpacity}`;
    }
  }
  
  // Ajustar glowGradient opacity também para maior variação visual
  const glowGradientMatch = baseTheme.glowGradient.match(/from-(\w+)-500\/(\d+)/);
  if (glowGradientMatch) {
    const [, color] = glowGradientMatch;
    // Usa uma variação relacionada mas diferente do glow principal
    const gradientOpacity = Math.max(8, Math.min(16, variations.borderOpacity - 10));
    modifiedTheme.glowGradient = `from-${color}-500/${gradientOpacity}`;
  }
  
  return modifiedTheme;
};

/** Variações por questão + skin editorial (Opção B em produção). */
const finalizeSlideTheme = (
  baseTheme: ThemeColors,
  questionHash: string,
  slideIndex?: number,
  slideType?: string,
): ThemeColors => {
  const uniqueHash = generateRobustQuestionHash(questionHash, slideIndex, slideType);
  const variations = generateThemeVariations(uniqueHash);
  return toEditorialTheme(applyThemeVariations(baseTheme, variations, slideIndex ?? 0));
};

// ============================================================================
// FUNÇÃO HÍBRIDA: Prioriza Subject, Fallback para Hash ÚNICO POR QUESTÃO
// Suporta formato novo (semântico) e formato antigo (com design_system)
// GARANTE UNICIDADE VISUAL POR QUESTÃO
// ============================================================================
export const getThemeForSlide = (
  slide: any, 
  questionHash: string,
  slideIndex?: number
): ThemeColors => {
  // 0. TEMPLATE EXPLÍCITO: JSON especifica "template" ou "theme_id" (ex: "t03", "violet")
  const templateId = slide.template ?? slide.theme_id;
  if (templateId) {
    const baseTheme = getThemeByTemplateId(templateId);
    if (baseTheme) {
      return finalizeSlideTheme(baseTheme, questionHash, slideIndex, slide.type);
    }
  }

  // 1. COMPATIBILIDADE: Se tem design_system legado, converte para tema
  if (slide.design_system?.accent_color) {
    const accentColor = slide.design_system.accent_color.toLowerCase();
    const themeHash = generateSimpleHash(accentColor);
    const baseTheme = getThemeFromHash(themeHash);
    // Aplica variações únicas baseadas no questionHash completo
    return finalizeSlideTheme(baseTheme, questionHash, slideIndex, slide.type);
  }
  
  // 2. SUBTÓPICO: prioridade máxima sobre subject genérico
  // meta.subtopico é mais específico do que subject (ex: "Urgências" > "Enfermagem")
  if (slide.meta?.subtopico || slide.meta?.topico) {
    const subtopico = slide.meta.subtopico || slide.meta.topico;
    const design = getDesignBySubtopic(subtopico);
    if (design) {
      const baseTheme = getThemeByName(design.template) || getThemeFromHash(generateSimpleHash(design.template));
      return finalizeSlideTheme(baseTheme, `${questionHash}-${subtopico}`, slideIndex, slide.type);
    }
    // Subtópico não está no mapa: tenta SUBJECT_THEME_MAP com o mesmo valor
    const topicoKey = subtopico.toLowerCase().trim();
    const mappedTheme = SUBJECT_THEME_MAP[topicoKey];
    if (mappedTheme) {
      const themeHash = generateSimpleHash(mappedTheme);
      const baseTheme = getThemeFromHash(themeHash);
      return finalizeSlideTheme(baseTheme, `${questionHash}-${topicoKey}`, slideIndex, slide.type);
    }
  }

  // 3. SUBJECT GENÉRICO: usado quando não há subtópico ou subtópico não está mapeado
  if (slide.subject) {
    const subjectKey = slide.subject.toLowerCase().trim();
    const mappedTheme = SUBJECT_THEME_MAP[subjectKey];
    if (mappedTheme) {
      const themeHash = generateSimpleHash(mappedTheme);
      const baseTheme = getThemeFromHash(themeHash);
      return finalizeSlideTheme(baseTheme, `${questionHash}-${subjectKey}`, slideIndex, slide.type);
    }
  }
  
  // 4. ÚLTIMO FALLBACK: usa hash robusto da questão para tema único garantido
  const uniqueHash = generateRobustQuestionHash(questionHash, slideIndex, slide.type);
  const baseTheme = getThemeFromHash(uniqueHash);
  return finalizeSlideTheme(baseTheme, questionHash, slideIndex, slide.type);
};

// ============================================================================
// CALCULA LAYOUT VARIANT SOMENTE PELO TIPO (sem subtópico)
// ============================================================================
export const calculateLayoutVariantFromType = (slideType: string, slide?: any): string => {
  const itemsCount = slide?.items?.length || slide?.concepts?.length || 0;
  switch (slideType) {
    case 'concept_map':
      if (itemsCount >= 3) return 'morphological';
      if (itemsCount <= 2) return 'stack';
      return 'morphological';
    case 'golden_rule': {
      const rows = slide?.rows;
      if (
        Array.isArray(rows) &&
        rows.some(
          (r: { label?: string; value?: string }) =>
            typeof r.label === 'string' &&
            r.label.trim().length > 0 &&
            typeof r.value === 'string' &&
            r.value.trim().length > 0,
        )
      ) {
        return 'reference_table';
      }
      return 'center';
    }
    case 'logic_flow': return 'cards';
    case 'danger_zone': {
      const items = slide?.items;
      if (
        Array.isArray(items) &&
        items.some(
          (i: { correct?: string }) =>
            typeof i.correct === 'string' && i.correct.trim().length > 0,
        )
      ) {
        return 'compare';
      }
      return 'list';
    }
    case 'versus_arena': return 'split';
    default: return 'grid';
  }
};

// ============================================================================
// CALCULA LAYOUT VARIANT AUTOMATICAMENTE (Baseado em subtópico + contexto)
// Prioridade: subtópico do meta > subtópico do subject > tipo semântico
// ============================================================================
export const calculateLayoutVariant = (slide: any): string => {
  const slideType = slide.type || slide.layout_type;
  // Prioridade 1: subtópico do meta
  const subtopico = slide.meta?.subtopico || slide.meta?.topico;
  if (subtopico) {
    const variant = getLayoutVariantBySubtopic(subtopico, slideType, slide);
    if (variant) return variant;
  }
  // Prioridade 2: subject
  if (slide.subject) {
    const variant = getLayoutVariantBySubtopic(slide.subject, slideType, slide);
    if (variant) return variant;
  }
  // Fallback: lógica semântica padrão
  return calculateLayoutVariantFromType(slideType, slide);
};
