/**
 * Decisões L1 — manifest conflict (6 casos).
 * Autoridade: registry_completo do subtópico canônico; remoção de mis-tags em outros completo.
 */
export type ManifestConflictL1Decision = {
  case_id: string;
  slug: string;
  canonical_lote: string;
  authority_manifest: string;
  remove_from_manifests: string[];
  rationale: string;
};

export const MANIFEST_CONFLICT_L1_DECISIONS: ManifestConflictL1Decision[] = [
  {
    case_id: 'nc-g03-225887fc3e95248c',
    slug: 'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-9',
    canonical_lote: 'promocao-a-saude-e-prevencao-de-agravos-completo',
    authority_manifest:
      'data/catalog-migration/promocao-a-saude-e-prevencao-de-agravos-completo/manifest.json',
    remove_from_manifests: ['data/catalog-migration/saude-da-mulher-completo/manifest.json'],
    rationale:
      'Slug de Promoção à Saúde — remover mis-tag do pacote Saúde da Mulher (registry_completo duplicado).',
  },
  {
    case_id: 'nc-g03-c88d2342d4c4339d',
    slug: 'fenix-instituto-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-4',
    canonical_lote: 'promocao-a-saude-e-prevencao-de-agravos-completo',
    authority_manifest:
      'data/catalog-migration/promocao-a-saude-e-prevencao-de-agravos-completo/manifest.json',
    remove_from_manifests: [
      'data/catalog-migration/cuidados-na-administracao-de-medicamentos-completo/manifest.json',
    ],
    rationale:
      'Slug de Promoção à Saúde — remover mis-tag do pacote Cuidados na Administração (registry_completo duplicado).',
  },
  {
    case_id: 'nc-g03-ad9830a44db6eb6d',
    slug: 'instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0',
    canonical_lote: 'vias-de-administracao-completo',
    authority_manifest: 'data/catalog-migration/vias-de-administracao-completo/manifest.json',
    remove_from_manifests: [
      'data/catalog-migration/farmacodinamica-e-farmacocinetica-completo/manifest.json',
    ],
    rationale:
      'Slug de Vias de Administração — remover mis-tag do pacote Farmacodinâmica (registry_completo duplicado).',
  },
  {
    case_id: 'nc-g03-2499227c8b06b5a6',
    slug: 'instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-9',
    canonical_lote: 'promocao-a-saude-e-prevencao-de-agravos-completo',
    authority_manifest:
      'data/catalog-migration/promocao-a-saude-e-prevencao-de-agravos-completo/manifest.json',
    remove_from_manifests: ['data/catalog-migration/saude-da-mulher-completo/manifest.json'],
    rationale:
      'Slug de Promoção à Saúde — remover mis-tag do pacote Saúde da Mulher (registry_completo duplicado).',
  },
  {
    case_id: 'nc-g03-67e21cff1f55c246',
    slug: 'vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-3',
    canonical_lote: 'promocao-a-saude-e-prevencao-de-agravos-completo',
    authority_manifest:
      'data/catalog-migration/promocao-a-saude-e-prevencao-de-agravos-completo/manifest.json',
    remove_from_manifests: ['data/catalog-migration/saude-da-mulher-completo/manifest.json'],
    rationale:
      'Slug de Promoção à Saúde — remover mis-tag do pacote Saúde da Mulher (registry_completo duplicado).',
  },
  {
    case_id: 'nc-g03-59bb8eacd42ac976',
    slug: 'vunesp-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1779564125198-1',
    canonical_lote: 'dtrans-mescladas-g02',
    authority_manifest: 'data/catalog-migration/dtrans-mescladas-g02/manifest.json',
    remove_from_manifests: ['data/catalog-migration/imunizacao-completo/manifest.json'],
    rationale:
      'Slug de Doenças Transmissíveis mescladas — remover mis-tag do pacote Imunização (registry_completo duplicado).',
  },
];
