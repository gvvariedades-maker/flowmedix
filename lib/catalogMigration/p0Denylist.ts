/**
 * Denylist deterministica dos 16 P0s confirmados pela auditoria pedagogica R1.
 * Estes itens possuem defeitos estruturais criticos (envelope cru, ausencia de gabarito ou figura faltante indispensavel)
 * e NUNCA devem ser servidos comercialmente ao aluno em nenhuma superficie.
 */

export const P0_DENIED_SLUGS = new Set<string>([
  // CRITICAL — Envelope wrapper no payload / NeuroSlides ausentes na raiz (3)
  'inaz-do-para-enfermagem-nocoes-de-anatomia-1775448275334-4',
  'instituto-consulplan-enfermagem-nocoes-de-anatomia-1775448440742-3',
  'idecan-enfermagem-saude-do-idoso-1778712437306-6',

  // CRITICAL — Zero is_correct nas alternativas (2)
  'ivin-enfermagem-enfermagem-em-centro-cirurgico-1777103887798-5',
  'fundatec-enfermagem-exames-complementares-1779563679414-5',

  // HIGH — Figura/imagem obrigatoria no enunciado sem asset nem transcricao (11)
  'instituto-darwin-enfermagem-nocoes-de-anatomia-1775448491347-1',
  'ibest-enfermagem-nocoes-de-fisiologia-1775448283431-3',
  'vunesp-enfermagem-processo-de-enfermagem-1780001742844-0',
  'instituto-verbena-enfermagem-seguranca-do-paciente-1777102742836-1',
  'vunesp-enfermagem-urgencias-e-emergencias-1777103994618-7',
  'idecan-enfermagem-enfermagem-em-centro-cirurgico-1777103887798-8',
  'reis-e-reis-enfermagem-semiologia-em-enfermagem-1779563521756-5',
  'ivin-enfermagem-curativos-e-manejo-de-feridas-1779344819753-4',
  'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563212871-8',
  'idecan-enfermagem-enfermagem-em-centro-cirurgico-1777103874312-0',
  'idecan-enfermagem-enfermagem-em-centro-cirurgico-1777103874312-1',
]);

export function isSlugInP0Denylist(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return P0_DENIED_SLUGS.has(slug.trim().toLowerCase());
}
