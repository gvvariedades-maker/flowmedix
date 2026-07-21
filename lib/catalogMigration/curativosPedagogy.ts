/**
 * Guideline golden-v1 — Curativos e Manejo de Feridas.
 * @see lib/guidelines/curativos.ts
 */
import type { ContentSource } from '@/lib/goldenContentStandard';
import { CURATIVOS_LPP_NPUAP } from '@/lib/guidelines/curativos';

export const CURATIVOS_SUBTOPICO = 'Curativos e Manejo de Feridas';

export type CurativosBranchId =
  | 'curativos_cobertura_selecao'
  | 'curativos_ferida_cirurgica'
  | 'curativos_lpp'
  | 'curativos_tecnica_assepsia'
  | 'curativos_desbridamento'
  | 'curativos_exceto_incorreta'
  | 'curativos_estomia'
  | 'curativos_bandagem_imobilizacao'
  | 'curativos_dreno'
  | 'curativos_termoterapia'
  | 'curativos_generico';

export function inferCurativosSourceCovers(corpus: string): string[] {
  const c = corpus.toLowerCase();
  const covers = new Set<string>();

  if (/exsudat|drenag|absorv/.test(c)) covers.add('exsudato e cobertura absorvente');
  if (/hidrocol|alginat|espuma|filme|hidrogel|carv[aã]o/.test(c)) covers.add('tipos de cobertura');
  if (/lpp|les[aã]o por press[aã]o|braden|npuap|est[aá]gio/.test(c)) covers.add('LPP e estágios NPUAP');
  if (/ferida (operat|quir|cir[uú]rg)|p[oó]s[- ]?op|pontos|sutura|deisc[eê]ncia/.test(c)) covers.add('ferida cirúrgica');
  if (/ass[eé]pt|limpeza|sf 0[,.]9|fisiol[oó]gic/.test(c)) covers.add('técnica asséptica e limpeza');
  if (/desbrid/.test(c)) covers.add('desbridamento');
  if (/estom|periestom|bolsa coletora/.test(c)) covers.add('estomia');
  if (/bandag|gesso|imobiliz/.test(c)) covers.add('bandagem e imobilização');
  if (/dreno/.test(c)) covers.add('dreno');
  if (/termoterap|calor|frio|crioterap/.test(c)) covers.add('termoterapia');
  if (/exceto|incorreta|afirmativa falsa/.test(c)) covers.add('pegadinha EXCETO');
  if (/meio [uú]mido|ambiente [uú]mido|cicatriz/.test(c)) covers.add('ambiente úmido controlado');
  if (/biofilme|purulent|odor|infec/.test(c)) covers.add('infecção e biofilme');

  if (covers.size === 0) covers.add('manejo de feridas');

  return [...covers].slice(0, 8);
}

export function buildCurativosNpuapSource(corpus: string): ContentSource {
  return {
    id: CURATIVOS_LPP_NPUAP.id,
    tier: 'A',
    issuer: CURATIVOS_LPP_NPUAP.issuer,
    title: CURATIVOS_LPP_NPUAP.title,
    year: CURATIVOS_LPP_NPUAP.year,
    url: CURATIVOS_LPP_NPUAP.url,
    covers: inferCurativosSourceCovers(corpus),
  };
}

export function buildCurativosGuidelineSnapshot(corpus: string, existing?: string): string {
  const c = corpus.toLowerCase();
  const themes: string[] = ['Curativos e manejo de feridas — NPUAP/COFEN'];

  if (/lpp|braden|est[aá]gio/.test(c)) themes.push('LPP — prevenção e estágios');
  if (/hidrocol|alginat|espuma|hidrogel|filme/.test(c)) themes.push('seleção de cobertura por exsudato/leito');
  if (/ferida operat|p[oó]s[- ]?op|pontos/.test(c)) themes.push('ferida cirúrgica');
  if (/ass[eé]pt|sf 0[,.]9/.test(c)) themes.push('técnica asséptica');
  if (/desbrid/.test(c)) themes.push('desbridamento');
  if (/exceto|incorreta/.test(c)) themes.push('pegadinha EXCETO em curativo');

  const snap = themes.join(' · ');
  if (existing && existing.length > 10) return existing;
  return snap.length > 200 ? `${snap.slice(0, 199)}…` : snap;
}

export function buildCurativosSourcesForSlug(corpus: string): ContentSource[] {
  return [buildCurativosNpuapSource(corpus)];
}
