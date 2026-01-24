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
// MAPEAMENTO DE MATÉRIAS PARA TEMAS (Sistema Híbrido)
// ============================================================================
export const SUBJECT_THEME_MAP: Record<string, string> = {
  // Português
  'portugues': 'indigo',
  'português': 'indigo',
  'morfologia': 'indigo',
  'sintaxe': 'violet',
  'fonetica': 'emerald',
  'fonética': 'emerald',
  'acentuacao': 'emerald',
  'acentuação': 'emerald',
  'semantica': 'cyan',
  'semântica': 'cyan',
  'ortografia': 'sky',
  
  // Direito
  'direito': 'amber',
  'constitucional': 'amber',
  'administrativo': 'orange',
  'penal': 'rose',
  'civil': 'purple',
  'trabalhista': 'pink',
  
  // Outras matérias
  'matematica': 'blue',
  'matemática': 'blue',
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
    acentuacao: "from-emerald-600/20 to-teal-900/40 border-emerald-500/30 text-emerald-400",
    acentuação: "from-emerald-600/20 to-teal-900/40 border-emerald-500/30 text-emerald-400",
    morfologia: "from-indigo-600/20 to-violet-900/40 border-indigo-500/30 text-indigo-400",
    direito: "from-amber-600/20 to-orange-900/40 border-amber-500/30 text-amber-400",
    fonetica: "from-emerald-600/20 to-teal-900/40 border-emerald-500/30 text-emerald-400",
    fonética: "from-emerald-600/20 to-teal-900/40 border-emerald-500/30 text-emerald-400",
    sintaxe: "from-violet-600/20 to-purple-900/40 border-violet-500/30 text-violet-400",
    portugues: "from-indigo-600/20 to-violet-900/40 border-indigo-500/30 text-indigo-400",
    português: "from-indigo-600/20 to-violet-900/40 border-indigo-500/30 text-indigo-400",
  };
  return themes[subject.toLowerCase()] || themes.morfologia;
};

// ============================================================================
// PALETA DE TEMAS PREDEFINIDOS
// ============================================================================
const getThemeFromHash = (hash: number): ThemeColors => {
  const themes: ThemeColors[] = [
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

  return themes[hash % themes.length];
};

// ============================================================================
// FUNÇÃO HÍBRIDA: Prioriza Subject, Fallback para Hash
// ============================================================================
export const getThemeForSlide = (slide: any, questionHash: string): ThemeColors => {
  // 1. Tenta usar subject se disponível
  if (slide.subject) {
    const subjectKey = slide.subject.toLowerCase().trim();
    const mappedTheme = SUBJECT_THEME_MAP[subjectKey];
    if (mappedTheme) {
      // Gera hash baseado no nome do tema para consistência
      const themeHash = generateSimpleHash(mappedTheme);
      return getThemeFromHash(themeHash);
    }
  }
  
  // 2. Tenta usar topico/subtopico do meta se disponível
  if (slide.meta?.topico || slide.meta?.subtopico) {
    const topicoKey = (slide.meta.topico || slide.meta.subtopico).toLowerCase().trim();
    const mappedTheme = SUBJECT_THEME_MAP[topicoKey];
    if (mappedTheme) {
      const themeHash = generateSimpleHash(mappedTheme);
      return getThemeFromHash(themeHash);
    }
  }
  
  // 3. Fallback: usa hash da questão para tema único
  const hash = generateSimpleHash(questionHash);
  return getThemeFromHash(hash);
};
