/**
 * Catálogo de Cadernos Prontos — definições em código.
 * As regras são resolvidas em runtime por `resolvePacks` (packs se atualizam
 * quando entra questão nova no catálogo acessível).
 */

export type PackFamily = 'ativacao' | 'edital' | 'assunto' | 'revisao';

export type PackRule =
  | { kind: 'mix' }
  | { kind: 'assunto'; tituloAula: string }
  | { kind: 'edital' }
  | { kind: 'erros' };

export type PackDefinition = {
  /** Estável; vira `source_pack_id` no notebook clonado. */
  id: string;
  family: PackFamily;
  /** Pode conter `{banca}` (interpolado no resolver). */
  title: string;
  /** Uma linha — promessa do pack. */
  promise: string;
  /** Alvo de questões (capado por `PACK_MAX_SIZE`). */
  size: number;
  rule: PackRule;
  /** Abaixo disso o pack não aparece na vitrine. */
  minSize: number;
};

/** Teto de itens no clone / body da API `from-pack`. */
export const PACK_MAX_SIZE = 30;

/** Estimativa de tempo no card (minutos por questão). */
export const MINUTES_PER_QUESTAO = 3;

/**
 * Seeds do MVP — 5–7 cards visíveis conforme entitlement / histórico.
 * Assunto packs usam `titulo_aula` canônico (CLAUDE.md §9) dos pacotes
 * `production_ready` no handcraft-registry.
 */
export const CADERNO_PACKS: PackDefinition[] = [
  {
    id: 'comece-10min',
    family: 'ativacao',
    title: 'Comece em 10 minutos',
    promise: 'Amostra rápida do catálogo para destravar o estudo.',
    size: 8,
    rule: { kind: 'mix' },
    minSize: 4,
  },
  {
    id: 'meu-edital',
    family: 'edital',
    title: 'Meu edital — {banca}',
    promise: 'Questões da banca do edital em que você está matriculado.',
    size: 10,
    rule: { kind: 'edital' },
    minSize: 5,
  },
  {
    id: 'imunizacao',
    family: 'assunto',
    title: 'Imunização',
    promise: 'Calendário, cadeia de frio e pegadinhas do PNI.',
    size: 10,
    rule: { kind: 'assunto', tituloAula: 'Imunização' },
    minSize: 4,
  },
  {
    id: 'vias-administracao',
    family: 'assunto',
    title: 'Vias de Administração',
    promise: 'Absorção, técnica e erros clássicos de via.',
    size: 10,
    rule: { kind: 'assunto', tituloAula: 'Vias de Administração' },
    minSize: 4,
  },
  {
    id: 'urgencias',
    family: 'assunto',
    title: 'Urgências e Emergências',
    promise: 'RCP, prioridades e condutas que a prova cobra.',
    size: 10,
    rule: { kind: 'assunto', tituloAula: 'Urgências e Emergências' },
    minSize: 4,
  },
  {
    id: 'saude-adolescente',
    family: 'assunto',
    title: 'Saúde do Adolescente',
    promise: 'Ética, vacinas e escores do ciclo adolescente.',
    size: 8,
    rule: { kind: 'assunto', tituloAula: 'Saúde do Adolescente' },
    minSize: 4,
  },
  {
    id: 'seus-erros',
    family: 'revisao',
    title: 'Seus erros',
    promise: 'Releia as questões que você errou no histórico.',
    size: 10,
    rule: { kind: 'erros' },
    minSize: 3,
  },
];

const PACK_BY_ID = new Map(CADERNO_PACKS.map((p) => [p.id, p]));

export function getPackDefinition(packId: string): PackDefinition | undefined {
  return PACK_BY_ID.get(packId);
}
