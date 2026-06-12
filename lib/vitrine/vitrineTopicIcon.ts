import {
  Activity,
  Baby,
  BookOpen,
  Brain,
  FlaskConical,
  HardHat,
  HeartPulse,
  Pill,
  Scale,
  Scissors,
  ShieldAlert,
  Siren,
  Stethoscope,
  Syringe,
  Users,
  type LucideIcon,
} from 'lucide-react';

/** Ícone por categoria de assunto — cor aplicada no chip do card. */
export function getTopicIcon(
  titulo_aula?: string | null,
  modulo_nome?: string | null,
): LucideIcon {
  const src = `${titulo_aula ?? ''} ${modulo_nome ?? ''}`.toLowerCase();

  if (/urg[eê]n|emerg|rcp/.test(src)) return Siren;
  if (/sinais?\s*vitais|sv\b/.test(src)) return Activity;
  if (/obstet|gesta|ginec|mulher/.test(src)) return Baby;
  if (/crian[çc]a|pedia|neonat/.test(src)) return Baby;
  if (/surg|cirug|peri[\s-]?op/.test(src)) return Scissors;
  if (/card|cora[çc]|infarto/.test(src)) return HeartPulse;
  if (/neuro|cerebr/.test(src)) return Brain;
  if (/psiq|mental|sa[úu]de\s*ment/.test(src)) return Brain;
  if (/infect|epidem|dst|hiv/.test(src)) return ShieldAlert;
  if (/vacin|imuniz/.test(src)) return Syringe;
  if (/farm|medic|dose|prescr/.test(src)) return Pill;
  if (/exame|laborat|sorol|glicem/.test(src)) return FlaskConical;
  if (/famil|comun|aps|b[aá]sic/.test(src)) return Users;
  if (/trabalh|ocupac/.test(src)) return HardHat;
  if (/[eé]tica|legisl|lei\b|c[oó]d/.test(src)) return Scale;
  if (/histor|fundament|semiolog/.test(src)) return BookOpen;

  return Stethoscope;
}
