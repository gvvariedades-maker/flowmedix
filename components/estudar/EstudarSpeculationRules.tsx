/**
 * Speculation Rules conservadoras para links /estudar/[slug] (passo 4.4).
 * Complementa prefetch explícito (VitrineQuestaoLink / QuestaoNavigationProvider);
 * não prerender — evita custo e risco com conteúdo autenticado.
 */
const SPECULATION_RULES = {
  prefetch: [
    {
      source: 'document',
      where: {
        and: [
          { href_matches: '/estudar/*' },
          { not: { href_matches: '/estudar' } },
          { not: { href_matches: '/estudar?*' } },
        ],
      },
      eagerness: 'conservative' as const,
    },
  ],
};

export function EstudarSpeculationRules() {
  return (
    <script
      type="speculationrules"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(SPECULATION_RULES) }}
    />
  );
}
