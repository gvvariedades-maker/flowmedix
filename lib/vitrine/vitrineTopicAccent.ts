export type TopicAccentClasses = { chip: string; icon: string };

/** Chip monocromático — card fechado / grid em repouso (sem arco-íris). */
export const TOPIC_ACCENT_NEUTRAL: TopicAccentClasses = {
  chip: 'bg-slate-50 border-slate-200',
  icon: 'text-slate-500',
};

/** Tailwind classes pré-definidas por accent — necessário para o purge não cortar. */
const ACCENT: Record<string, TopicAccentClasses> = {
  rose:    { chip: 'bg-rose-50 border-rose-200',     icon: 'text-rose-600' },
  pink:    { chip: 'bg-pink-50 border-pink-200',     icon: 'text-pink-600' },
  violet:  { chip: 'bg-violet-50 border-violet-200', icon: 'text-violet-600' },
  purple:  { chip: 'bg-purple-50 border-purple-200', icon: 'text-purple-600' },
  indigo:  { chip: 'bg-indigo-50 border-indigo-200', icon: 'text-indigo-600' },
  blue:    { chip: 'bg-blue-50 border-blue-200',     icon: 'text-blue-600' },
  sky:     { chip: 'bg-sky-50 border-sky-200',       icon: 'text-sky-600' },
  cyan:    { chip: 'bg-cyan-50 border-cyan-200',     icon: 'text-cyan-600' },
  teal:    { chip: 'bg-teal-50 border-teal-200',     icon: 'text-teal-600' },
  emerald: { chip: 'bg-emerald-50 border-emerald-200', icon: 'text-emerald-600' },
  green:   { chip: 'bg-green-50 border-green-200',   icon: 'text-green-700' },
  lime:    { chip: 'bg-lime-50 border-lime-200',     icon: 'text-lime-700' },
  amber:   { chip: 'bg-amber-50 border-amber-200',   icon: 'text-amber-600' },
  orange:  { chip: 'bg-orange-50 border-orange-200', icon: 'text-orange-600' },
  fuchsia: { chip: 'bg-fuchsia-50 border-fuchsia-200', icon: 'text-fuchsia-600' },
};

const DEFAULT = ACCENT.indigo;

/**
 * Matiz do tópico — usar no card **expandido** e no header do sheet.
 * No card fechado, preferir `TOPIC_ACCENT_NEUTRAL`.
 */
export function getTopicAccent(
  titulo_aula?: string | null,
  modulo_nome?: string | null,
): TopicAccentClasses {
  const src = `${titulo_aula ?? ''} ${modulo_nome ?? ''}`.toLowerCase();

  if (/urg[eê]n|emerg|rcp/.test(src))            return ACCENT.rose;
  if (/sinais?\s*vitais|sv\b/.test(src))          return ACCENT.rose;
  if (/card|cora[çc]|infarto/.test(src))          return ACCENT.rose;
  if (/obstet|gesta|ginec|mulher/.test(src))      return ACCENT.pink;
  if (/crian[çc]a|pedia|neonat/.test(src))        return ACCENT.pink;
  if (/adolescente/.test(src))                    return ACCENT.sky;
  if (/surg|cirug|peri[\s-]?op|centro cirurg/.test(src)) return ACCENT.violet;
  if (/neuro|cerebr/.test(src))                   return ACCENT.purple;
  if (/psiq|mental|sa[úu]de\s*ment/.test(src))    return ACCENT.purple;
  if (/farm|medic|dose|prescr|farmacocin/.test(src)) return ACCENT.purple;
  if (/infect|epidem|dst|hiv|ist/.test(src))      return ACCENT.teal;
  if (/vacin|imuniz/.test(src))                   return ACCENT.emerald;
  if (/aten[çc][aã]o\s*b[aá]s|famil|comun|aps/.test(src)) return ACCENT.emerald;
  if (/sa[úu]de\s*p[úu]bl|vigil[aâ]n/.test(src)) return ACCENT.teal;
  if (/exame|laborat|sorol|glicem/.test(src))     return ACCENT.sky;
  if (/biosseg|cme|esteriliz|precau|processamento/.test(src)) return ACCENT.cyan;
  if (/oxigeno|respirat/.test(src))               return ACCENT.cyan;
  if (/c[aá]lculo|infus[aã]o|dosagem/.test(src))  return ACCENT.blue;
  if (/curativo|ferida|queimad/.test(src))        return ACCENT.orange;
  if (/pun[çc][aã]o|cateter|sond/.test(src))      return ACCENT.indigo;
  if (/[eé]tica|legisl|lei\b|c[oó]d|cofen|coren/.test(src)) return ACCENT.amber;
  if (/trabalh|ocupac/.test(src))                 return ACCENT.amber;
  if (/histor|fundament|semiolog/.test(src))      return ACCENT.indigo;
  if (/mobiliz|posicion/.test(src))               return ACCENT.lime;
  if (/segur[a|an]/.test(src))                    return ACCENT.orange;

  return DEFAULT;
}
