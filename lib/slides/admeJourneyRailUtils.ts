/**
 * Utilitários compartilhados entre AdmeJourneyRailConceptMap e moldSlotFit.
 */

export type PkSlot = 'cinetica' | 'dinamica' | 'meia-vida' | 'adme';
export type ConceptKind = PkSlot | 'compare' | 'exam' | 'mnemonic';

export type PkPdConceptLike = {
  title: string;
  description: string;
};

export function inferAdmeConceptKind(title: string, description: string): ConceptKind {
  const text = `${title} ${description}`.toLowerCase();
  if (/mnemônico|mnemonico|cinética =|cinetica =|corpo processa/.test(text)) return 'mnemonic';
  if (/comparativo|cinética ×|cinetica x|pk.*pd/.test(text)) return 'compare';
  if (/gabarito|pegadinha|banca|prova/.test(text)) return 'exam';
  if (/meia-vida|meia vida|t½|t1\/2|50%|eliminar 100/.test(text)) return 'meia-vida';
  if (/absorção|distribuição|metabolismo|excreção|\badme\b/.test(text)) return 'adme';
  if (/farmacodinâmica|farmacodinamica|dinâmica|dinamica|mecanismo|receptor|efeito/.test(text)) {
    return 'dinamica';
  }
  if (/farmacocinética|farmacocinetica|cinética|cinetica/.test(text)) return 'cinetica';
  return 'cinetica';
}

/** Conta slots PK/PD/t½/ADME reais (exclui exam/compare/mnemonic compartilhados). */
export function countAdmeJourneyRailPkSlots(concepts: PkPdConceptLike[]): number {
  const slots = new Set<PkSlot>();
  for (const concept of concepts) {
    const kind = inferAdmeConceptKind(concept.title, concept.description);
    if (kind === 'cinetica' || kind === 'dinamica' || kind === 'meia-vida' || kind === 'adme') {
      slots.add(kind);
    }
  }
  return slots.size;
}

export function conceptItemsFromSlide(slide: {
  items?: unknown[];
  concepts?: unknown[];
}): PkPdConceptLike[] {
  const raw = slide.items ?? slide.concepts;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      title: String(item.label ?? item.title ?? ''),
      description: String(item.detail ?? item.description ?? ''),
    }))
    .filter((c) => c.title.trim().length > 0 || c.description.trim().length > 0);
}
