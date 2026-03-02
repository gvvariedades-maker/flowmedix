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
// GERADOR DE VARIAÇÕES ÚNICAS BASEADAS EM HASH
// INTENSIDADE AUMENTADA PARA MAIOR PERCEPTIBILIDADE
// ============================================================================
interface ThemeVariations {
  glowIntensity: number; // 0.25 - 0.75 (aumentado de 0.3-0.6)
  saturationShift: number; // -15% a +15% (aumentado de -10% a +10%)
  brightnessShift: number; // -8% a +8% (aumentado de -5% a +5%)
  rotation: number; // 0-360 graus para gradientes
  borderOpacity: number; // 15-50% (aumentado de 20-40%)
}

export const generateThemeVariations = (hash: number): ThemeVariations => {
  // Usa diferentes partes do hash para diferentes variações
  const hashStr = hash.toString().padStart(6, '0'); // Garante pelo menos 6 dígitos
  
  // Glow intensity: baseado nos últimos 2 dígitos - INTENSIDADE AUMENTADA
  const glowHash = parseInt(hashStr.slice(-2) || '50', 10);
  const glowIntensity = 0.25 + (glowHash % 51) / 100; // 0.25 a 0.75 (variação de 0.5)
  
  // Saturation shift: baseado nos primeiros 2 dígitos - INTENSIDADE AUMENTADA
  const satHash = parseInt(hashStr.slice(0, 2) || '50', 10);
  const saturationShift = ((satHash % 31) - 15) / 100; // -15% a +15% (variação de 30%)
  
  // Brightness shift: baseado no meio do hash - INTENSIDADE AUMENTADA
  const brightHash = parseInt(hashStr.slice(2, 4) || '50', 10);
  const brightnessShift = ((brightHash % 17) - 8) / 100; // -8% a +8% (variação de 16%)
  
  // Rotation: baseado no hash completo
  const rotation = hash % 360;
  
  // Border opacity: baseado em outro segmento - INTENSIDADE AUMENTADA
  const borderHash = parseInt(hashStr.slice(4, 6) || '30', 10);
  const borderOpacity = 15 + (borderHash % 36); // 15-50% (variação de 35%)
  
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
      glow: 'rgba(139, 92, 246, 0.4)',
      bgGradient: 'from-slate-900 via-indigo-950 to-slate-900',
      borderColor: 'border-indigo-500/30',
      textPrimary: 'text-indigo-100',
      textSecondary: 'text-indigo-300',
      iconBg: 'bg-indigo-500/20',
      iconText: 'text-indigo-400',
      iconHoverBg: 'group-hover:bg-indigo-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-indigo-500/20'
    },
    {
      name: 'emerald',
      primary: 'from-emerald-500 via-teal-500 to-cyan-500',
      secondary: 'from-green-400 to-emerald-600',
      accent: 'emerald',
      glow: 'rgba(16, 185, 129, 0.4)',
      bgGradient: 'from-slate-900 via-emerald-950 to-slate-900',
      borderColor: 'border-emerald-500/30',
      textPrimary: 'text-emerald-100',
      textSecondary: 'text-emerald-300',
      iconBg: 'bg-emerald-500/20',
      iconText: 'text-emerald-400',
      iconHoverBg: 'group-hover:bg-emerald-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-emerald-500/20'
    },
    {
      name: 'rose',
      primary: 'from-rose-500 via-pink-500 to-fuchsia-600',
      secondary: 'from-pink-400 to-rose-600',
      accent: 'rose',
      glow: 'rgba(244, 63, 94, 0.4)',
      bgGradient: 'from-slate-900 via-rose-950 to-slate-900',
      borderColor: 'border-rose-500/30',
      textPrimary: 'text-rose-100',
      textSecondary: 'text-rose-300',
      iconBg: 'bg-rose-500/20',
      iconText: 'text-rose-400',
      iconHoverBg: 'group-hover:bg-rose-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-rose-500/20'
    },
    {
      name: 'amber',
      primary: 'from-amber-500 via-orange-500 to-red-500',
      secondary: 'from-yellow-400 to-orange-600',
      accent: 'amber',
      glow: 'rgba(245, 158, 11, 0.4)',
      bgGradient: 'from-slate-900 via-amber-950 to-slate-900',
      borderColor: 'border-amber-500/30',
      textPrimary: 'text-amber-100',
      textSecondary: 'text-amber-300',
      iconBg: 'bg-amber-500/20',
      iconText: 'text-amber-400',
      iconHoverBg: 'group-hover:bg-amber-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-amber-500/20'
    },
    {
      name: 'violet',
      primary: 'from-violet-600 via-purple-600 to-indigo-600',
      secondary: 'from-purple-400 to-violet-600',
      accent: 'violet',
      glow: 'rgba(139, 92, 246, 0.4)',
      bgGradient: 'from-slate-900 via-violet-950 to-slate-900',
      borderColor: 'border-violet-500/30',
      textPrimary: 'text-violet-100',
      textSecondary: 'text-violet-300',
      iconBg: 'bg-violet-500/20',
      iconText: 'text-violet-400',
      iconHoverBg: 'group-hover:bg-violet-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-violet-500/20'
    },
    {
      name: 'cyan',
      primary: 'from-blue-500 via-cyan-500 to-teal-500',
      secondary: 'from-cyan-400 to-blue-600',
      accent: 'cyan',
      glow: 'rgba(6, 182, 212, 0.4)',
      bgGradient: 'from-slate-900 via-cyan-950 to-slate-900',
      borderColor: 'border-cyan-500/30',
      textPrimary: 'text-cyan-100',
      textSecondary: 'text-cyan-300',
      iconBg: 'bg-cyan-500/20',
      iconText: 'text-cyan-400',
      iconHoverBg: 'group-hover:bg-cyan-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-cyan-500/20'
    },
    {
      name: 'fuchsia',
      primary: 'from-fuchsia-600 via-pink-600 to-purple-600',
      secondary: 'from-pink-500 to-fuchsia-600',
      accent: 'fuchsia',
      glow: 'rgba(217, 70, 239, 0.4)',
      bgGradient: 'from-slate-900 via-fuchsia-950 to-slate-900',
      borderColor: 'border-fuchsia-500/30',
      textPrimary: 'text-fuchsia-100',
      textSecondary: 'text-fuchsia-300',
      iconBg: 'bg-fuchsia-500/20',
      iconText: 'text-fuchsia-400',
      iconHoverBg: 'group-hover:bg-fuchsia-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-fuchsia-500/20'
    },
    {
      name: 'sky',
      primary: 'from-sky-500 via-blue-500 to-indigo-600',
      secondary: 'from-blue-400 to-sky-600',
      accent: 'sky',
      glow: 'rgba(14, 165, 233, 0.4)',
      bgGradient: 'from-slate-900 via-sky-950 to-slate-900',
      borderColor: 'border-sky-500/30',
      textPrimary: 'text-sky-100',
      textSecondary: 'text-sky-300',
      iconBg: 'bg-sky-500/20',
      iconText: 'text-sky-400',
      iconHoverBg: 'group-hover:bg-sky-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-sky-500/20'
    },
    {
      name: 'lime',
      primary: 'from-lime-500 via-green-500 to-emerald-600',
      secondary: 'from-green-400 to-lime-600',
      accent: 'lime',
      glow: 'rgba(132, 204, 22, 0.4)',
      bgGradient: 'from-slate-900 via-lime-950 to-slate-900',
      borderColor: 'border-lime-500/30',
      textPrimary: 'text-lime-100',
      textSecondary: 'text-lime-300',
      iconBg: 'bg-lime-500/20',
      iconText: 'text-lime-400',
      iconHoverBg: 'group-hover:bg-lime-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-lime-500/20'
    },
    {
      name: 'teal',
      primary: 'from-teal-500 via-cyan-500 to-blue-600',
      secondary: 'from-cyan-400 to-teal-600',
      accent: 'teal',
      glow: 'rgba(20, 184, 166, 0.4)',
      bgGradient: 'from-slate-900 via-teal-950 to-slate-900',
      borderColor: 'border-teal-500/30',
      textPrimary: 'text-teal-100',
      textSecondary: 'text-teal-300',
      iconBg: 'bg-teal-500/20',
      iconText: 'text-teal-400',
      iconHoverBg: 'group-hover:bg-teal-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-teal-500/20'
    },
    {
      name: 'orange',
      primary: 'from-orange-500 via-red-500 to-pink-600',
      secondary: 'from-red-400 to-orange-600',
      accent: 'orange',
      glow: 'rgba(249, 115, 22, 0.4)',
      bgGradient: 'from-slate-900 via-orange-950 to-slate-900',
      borderColor: 'border-orange-500/30',
      textPrimary: 'text-orange-100',
      textSecondary: 'text-orange-300',
      iconBg: 'bg-orange-500/20',
      iconText: 'text-orange-400',
      iconHoverBg: 'group-hover:bg-orange-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-orange-500/20'
    },
    {
      name: 'blue',
      primary: 'from-blue-600 via-indigo-600 to-purple-600',
      secondary: 'from-indigo-400 to-blue-600',
      accent: 'blue',
      glow: 'rgba(37, 99, 235, 0.4)',
      bgGradient: 'from-slate-900 via-blue-950 to-slate-900',
      borderColor: 'border-blue-500/30',
      textPrimary: 'text-blue-100',
      textSecondary: 'text-blue-300',
      iconBg: 'bg-blue-500/20',
      iconText: 'text-blue-400',
      iconHoverBg: 'group-hover:bg-blue-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-blue-500/20'
    },
    {
      name: 'purple',
      primary: 'from-purple-600 via-violet-600 to-fuchsia-600',
      secondary: 'from-violet-400 to-purple-600',
      accent: 'purple',
      glow: 'rgba(168, 85, 247, 0.4)',
      bgGradient: 'from-slate-900 via-purple-950 to-slate-900',
      borderColor: 'border-purple-500/30',
      textPrimary: 'text-purple-100',
      textSecondary: 'text-purple-300',
      iconBg: 'bg-purple-500/20',
      iconText: 'text-purple-400',
      iconHoverBg: 'group-hover:bg-purple-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-purple-500/20'
    },
    {
      name: 'pink',
      primary: 'from-pink-500 via-rose-500 to-red-500',
      secondary: 'from-rose-400 to-pink-600',
      accent: 'pink',
      glow: 'rgba(236, 72, 153, 0.4)',
      bgGradient: 'from-slate-900 via-pink-950 to-slate-900',
      borderColor: 'border-pink-500/30',
      textPrimary: 'text-pink-100',
      textSecondary: 'text-pink-300',
      iconBg: 'bg-pink-500/20',
      iconText: 'text-pink-400',
      iconHoverBg: 'group-hover:bg-pink-500',
      iconHoverText: 'group-hover:text-white',
      glowGradient: 'from-pink-500/20'
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
  
  // Ajustar glow com intensidade única - INTENSIDADE AUMENTADA
  const glowMatch = baseTheme.glow.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (glowMatch) {
    const [, r, g, b] = glowMatch;
    // Usa a intensidade calculada diretamente (já está no range 0.25-0.75)
    modifiedTheme.glow = `rgba(${r}, ${g}, ${b}, ${variations.glowIntensity.toFixed(2)})`;
  }
  
  // Ajustar border opacity - INTENSIDADE AUMENTADA
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
    const gradientOpacity = Math.max(15, Math.min(35, variations.borderOpacity - 5));
    modifiedTheme.glowGradient = `from-${color}-500/${gradientOpacity}`;
  }
  
  return modifiedTheme;
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
      const uniqueHash = generateRobustQuestionHash(questionHash, slideIndex, slide.type);
      const variations = generateThemeVariations(uniqueHash);
      return applyThemeVariations(baseTheme, variations, slideIndex ?? 0);
    }
  }

  // 1. COMPATIBILIDADE: Se tem design_system legado, converte para tema
  if (slide.design_system?.accent_color) {
    const accentColor = slide.design_system.accent_color.toLowerCase();
    const themeHash = generateSimpleHash(accentColor);
    const baseTheme = getThemeFromHash(themeHash);
    // Aplica variações únicas baseadas no questionHash completo
    const uniqueHash = generateRobustQuestionHash(questionHash, slideIndex, slide.type);
    const variations = generateThemeVariations(uniqueHash);
    return applyThemeVariations(baseTheme, variations, slideIndex);
  }
  
  // 2. FORMATO NOVO: Tenta usar subject se disponível (RECOMENDADO)
  // MAS aplica variações únicas baseadas no questionHash
  if (slide.subject) {
    const subjectKey = slide.subject.toLowerCase().trim();
    const mappedTheme = SUBJECT_THEME_MAP[subjectKey];
    if (mappedTheme) {
      const themeHash = generateSimpleHash(mappedTheme);
      const baseTheme = getThemeFromHash(themeHash);
      // Variações únicas garantem que questões diferentes tenham visual diferente
      const uniqueHash = generateRobustQuestionHash(
        `${questionHash}-${subjectKey}`,
        slideIndex,
        slide.type
      );
      const variations = generateThemeVariations(uniqueHash);
      return applyThemeVariations(baseTheme, variations, slideIndex);
    }
  }
  
  // 3. FALLBACK: Tenta usar topico/subtopico do meta se disponível
  if (slide.meta?.topico || slide.meta?.subtopico) {
    const topicoKey = (slide.meta.topico || slide.meta.subtopico).toLowerCase().trim();
    const mappedTheme = SUBJECT_THEME_MAP[topicoKey];
    if (mappedTheme) {
      const themeHash = generateSimpleHash(mappedTheme);
      const baseTheme = getThemeFromHash(themeHash);
      // Variações únicas
      const uniqueHash = generateRobustQuestionHash(
        `${questionHash}-${topicoKey}`,
        slideIndex,
        slide.type
      );
      const variations = generateThemeVariations(uniqueHash);
      return applyThemeVariations(baseTheme, variations, slideIndex);
    }
  }
  
  // 4. ÚLTIMO FALLBACK: usa hash robusto da questão para tema único garantido
  const uniqueHash = generateRobustQuestionHash(questionHash, slideIndex, slide.type);
  const baseTheme = getThemeFromHash(uniqueHash);
  const variations = generateThemeVariations(uniqueHash);
  return applyThemeVariations(baseTheme, variations, slideIndex);
};

// ============================================================================
// CALCULA LAYOUT VARIANT AUTOMATICAMENTE (Baseado em contexto semântico)
// ============================================================================
export const calculateLayoutVariant = (slide: any): string => {
  const slideType = slide.type || slide.layout_type;
  const itemsCount = slide.items?.length || slide.concepts?.length || 0;
  
  switch (slideType) {
    case 'concept_map':
      // Layout Morfológico como padrão (alta performance, zero layout shift)
      // Grid CSS fluido se adapta automaticamente
      if (itemsCount >= 3) return 'morphological'; // 3+ items = morfológico (recomendado)
      if (itemsCount <= 2) return 'stack';
      return 'morphological'; // Padrão morfológico para melhor performance
      
    case 'golden_rule':
      return 'center'; // Sempre centralizado
      
    case 'logic_flow':
      return 'vertical'; // Sempre vertical
      
    case 'danger_zone':
      return 'list'; // Lista de alertas
      
    case 'versus_arena':
      return 'split'; // Divisão lado a lado
      
    default:
      return 'grid'; // Padrão
  }
};
