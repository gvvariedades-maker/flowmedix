/**
 * Decisões L1 — manifest conflict (6 casos).
 * Allowlist + prior_semantic_sha256 congelados em catálogo local pré-L1.
 */
export type ManifestConflictL1Target = {
  lote: string;
  prior_semantic_sha256: string;
};

export type ManifestConflictL1Decision = {
  case_id: string;
  slug: string;
  canonical_lote: string;
  authority_manifest: string;
  remove_from_manifests: string[];
  expected_semantic_sha256: string;
  align_targets: ManifestConflictL1Target[];
  rationale: string;
};

export const MANIFEST_CONFLICT_L1_AUTHORIZED_RELATIVE_PATHS = [
  "cuidados-na-administracao-de-medicamentos-completo/questions/fenix-instituto-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-4.json",
  "cuidados-na-administracao-de-medicamentos-g11/questions/fenix-instituto-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-4.json",
  "dtrans-mescladas-g02/questions/vunesp-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1779564125198-1.json",
  "farmacodinamica-classify-review/questions/instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0.json",
  "farmacodinamica-e-farmacocinetica-completo/questions/instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0.json",
  "farmacodinamica-e-farmacocinetica-g02/questions/instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0.json",
  "imunizacao-builder-lote-02/questions/vunesp-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1779564125198-1.json",
  "imunizacao-completo/questions/vunesp-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1779564125198-1.json",
  "imunizacao-g83/questions/vunesp-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1779564125198-1.json",
  "imunizacao-repair-lote-02/questions/vunesp-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1779564125198-1.json",
  "outras-doencas-e-questoes-mescladas-transmissiveis-lote-01/questions/vunesp-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1779564125198-1.json",
  "promocao-a-saude-e-prevencao-de-agravos-completo/questions/fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-9.json",
  "promocao-a-saude-e-prevencao-de-agravos-completo/questions/fenix-instituto-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-4.json",
  "promocao-a-saude-e-prevencao-de-agravos-completo/questions/instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-9.json",
  "promocao-a-saude-e-prevencao-de-agravos-completo/questions/vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-3.json",
  "promocao-a-saude-e-prevencao-de-agravos-g05/questions/fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-9.json",
  "promocao-a-saude-e-prevencao-de-agravos-g05/questions/fenix-instituto-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-4.json",
  "promocao-a-saude-e-prevencao-de-agravos-g09/questions/instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-9.json",
  "promocao-a-saude-e-prevencao-de-agravos-g12/questions/vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-3.json",
  "promocao-a-saude-e-prevencao-de-agravos-lote-01/questions/fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-9.json",
  "promocao-a-saude-e-prevencao-de-agravos-lote-01/questions/fenix-instituto-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-4.json",
  "promocao-a-saude-e-prevencao-de-agravos-lote-02/questions/instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-9.json",
  "promocao-a-saude-e-prevencao-de-agravos-lote-03/questions/vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-3.json",
  "saude-da-mulher-completo/questions/fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-9.json",
  "saude-da-mulher-completo/questions/instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-9.json",
  "saude-da-mulher-completo/questions/vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-3.json",
  "saude-da-mulher-g02/questions/fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-9.json",
  "saude-da-mulher-g20/questions/instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-9.json",
  "saude-da-mulher-g27/questions/vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-3.json",
  "vias-de-administracao-completo/questions/instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0.json",
  "vias-de-administracao-consulpam-repair/questions/instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0.json",
  "vias-de-administracao-lote-04/questions/instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0.json"
] as const;

export const MANIFEST_CONFLICT_L1_DECISIONS: ManifestConflictL1Decision[] = [
  {
    "case_id": "nc-g03-225887fc3e95248c",
    "slug": "fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-9",
    "canonical_lote": "promocao-a-saude-e-prevencao-de-agravos-completo",
    "authority_manifest": "data/catalog-migration/promocao-a-saude-e-prevencao-de-agravos-completo/manifest.json",
    "remove_from_manifests": [
      "data/catalog-migration/saude-da-mulher-completo/manifest.json"
    ],
    "expected_semantic_sha256": "f3a78cb95b52a7a9816fb942ecb52c857be5991274ca7bf5d2c93ca4aafac0e7",
    "align_targets": [
      {
        "lote": "promocao-a-saude-e-prevencao-de-agravos-completo",
        "prior_semantic_sha256": "f3a78cb95b52a7a9816fb942ecb52c857be5991274ca7bf5d2c93ca4aafac0e7"
      },
      {
        "lote": "promocao-a-saude-e-prevencao-de-agravos-g05",
        "prior_semantic_sha256": "17c1d81fe6463dfa7091b5c92055f93f55fa83e8035904aee3af1cc6291029fc"
      },
      {
        "lote": "promocao-a-saude-e-prevencao-de-agravos-lote-01",
        "prior_semantic_sha256": "b3b8da031f8aaf0ba23b428d054758149485cc5644305a44c81ce83b42729cec"
      },
      {
        "lote": "saude-da-mulher-completo",
        "prior_semantic_sha256": "28630245b6a073d2c3c4e42df1030fc49225710228288b4198db93f3b897e082"
      },
      {
        "lote": "saude-da-mulher-g02",
        "prior_semantic_sha256": "f3a78cb95b52a7a9816fb942ecb52c857be5991274ca7bf5d2c93ca4aafac0e7"
      }
    ],
    "rationale": "Slug de Promoção à Saúde — remover mis-tag Saúde da Mulher."
  },
  {
    "case_id": "nc-g03-c88d2342d4c4339d",
    "slug": "fenix-instituto-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-4",
    "canonical_lote": "promocao-a-saude-e-prevencao-de-agravos-completo",
    "authority_manifest": "data/catalog-migration/promocao-a-saude-e-prevencao-de-agravos-completo/manifest.json",
    "remove_from_manifests": [
      "data/catalog-migration/cuidados-na-administracao-de-medicamentos-completo/manifest.json"
    ],
    "expected_semantic_sha256": "13b44881f363b78864ba8cad482b4981899a026feb79ae2eaf60751b8d219289",
    "align_targets": [
      {
        "lote": "cuidados-na-administracao-de-medicamentos-completo",
        "prior_semantic_sha256": "71b8b98864776360f2a9c86e41c34b29ff5d9d6ee526293149cc7513adfd699c"
      },
      {
        "lote": "cuidados-na-administracao-de-medicamentos-g11",
        "prior_semantic_sha256": "13b44881f363b78864ba8cad482b4981899a026feb79ae2eaf60751b8d219289"
      },
      {
        "lote": "promocao-a-saude-e-prevencao-de-agravos-completo",
        "prior_semantic_sha256": "13b44881f363b78864ba8cad482b4981899a026feb79ae2eaf60751b8d219289"
      },
      {
        "lote": "promocao-a-saude-e-prevencao-de-agravos-g05",
        "prior_semantic_sha256": "cee94d63d991b302a79bfea5e601ab90fcc2893924a8f0a760d5232df888d1c8"
      },
      {
        "lote": "promocao-a-saude-e-prevencao-de-agravos-lote-01",
        "prior_semantic_sha256": "3df23a7b6cf3f3cfe92bab1f015e4850e68ab7a1d41c2d32981c88d670a154bd"
      }
    ],
    "rationale": "Slug de Promoção à Saúde — remover mis-tag Cuidados."
  },
  {
    "case_id": "nc-g03-ad9830a44db6eb6d",
    "slug": "instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0",
    "canonical_lote": "vias-de-administracao-completo",
    "authority_manifest": "data/catalog-migration/vias-de-administracao-completo/manifest.json",
    "remove_from_manifests": [
      "data/catalog-migration/farmacodinamica-e-farmacocinetica-completo/manifest.json"
    ],
    "expected_semantic_sha256": "0677b459308c394b0ff2d988ba6c3364d70f4f388b8ea3868c65b899f0d08302",
    "align_targets": [
      {
        "lote": "farmacodinamica-classify-review",
        "prior_semantic_sha256": "96ba414a059c8a6418e47633f7694dbd2935c58cd386710f5b3f6133835bd24b"
      },
      {
        "lote": "farmacodinamica-e-farmacocinetica-completo",
        "prior_semantic_sha256": "2aae3af54f75d842099e1dc61ad6769e5de48f0da19cc3c96b9146432c44e2d1"
      },
      {
        "lote": "farmacodinamica-e-farmacocinetica-g02",
        "prior_semantic_sha256": "2aae3af54f75d842099e1dc61ad6769e5de48f0da19cc3c96b9146432c44e2d1"
      },
      {
        "lote": "vias-de-administracao-completo",
        "prior_semantic_sha256": "0677b459308c394b0ff2d988ba6c3364d70f4f388b8ea3868c65b899f0d08302"
      },
      {
        "lote": "vias-de-administracao-consulpam-repair",
        "prior_semantic_sha256": "0677b459308c394b0ff2d988ba6c3364d70f4f388b8ea3868c65b899f0d08302"
      },
      {
        "lote": "vias-de-administracao-lote-04",
        "prior_semantic_sha256": "96ba414a059c8a6418e47633f7694dbd2935c58cd386710f5b3f6133835bd24b"
      }
    ],
    "rationale": "Slug Vias — remover mis-tag Farmacodinâmica."
  },
  {
    "case_id": "nc-g03-2499227c8b06b5a6",
    "slug": "instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-9",
    "canonical_lote": "promocao-a-saude-e-prevencao-de-agravos-completo",
    "authority_manifest": "data/catalog-migration/promocao-a-saude-e-prevencao-de-agravos-completo/manifest.json",
    "remove_from_manifests": [
      "data/catalog-migration/saude-da-mulher-completo/manifest.json"
    ],
    "expected_semantic_sha256": "7240d3af929494786b2be68ea8d39a6bcd3bea480ac7ca4c380950bd738f22f0",
    "align_targets": [
      {
        "lote": "promocao-a-saude-e-prevencao-de-agravos-completo",
        "prior_semantic_sha256": "7240d3af929494786b2be68ea8d39a6bcd3bea480ac7ca4c380950bd738f22f0"
      },
      {
        "lote": "promocao-a-saude-e-prevencao-de-agravos-g09",
        "prior_semantic_sha256": "3ac5f3dfc794f335eb2ad07d8cc66e0601b89fb155caf207a1b691580477e5b5"
      },
      {
        "lote": "promocao-a-saude-e-prevencao-de-agravos-lote-02",
        "prior_semantic_sha256": "9d91e5a419ef36702da813e3021995729cbac66f8bb8ad02cf2480a8e4db36df"
      },
      {
        "lote": "saude-da-mulher-completo",
        "prior_semantic_sha256": "77963bb500a8870d1134dc6ee676d39a584b088181f21f36f110d58633a94c01"
      },
      {
        "lote": "saude-da-mulher-g20",
        "prior_semantic_sha256": "7240d3af929494786b2be68ea8d39a6bcd3bea480ac7ca4c380950bd738f22f0"
      }
    ],
    "rationale": "Slug Promoção — remover mis-tag Saúde da Mulher."
  },
  {
    "case_id": "nc-g03-67e21cff1f55c246",
    "slug": "vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-3",
    "canonical_lote": "promocao-a-saude-e-prevencao-de-agravos-completo",
    "authority_manifest": "data/catalog-migration/promocao-a-saude-e-prevencao-de-agravos-completo/manifest.json",
    "remove_from_manifests": [
      "data/catalog-migration/saude-da-mulher-completo/manifest.json"
    ],
    "expected_semantic_sha256": "d9532e6ad4e5537b210adc6cb9c2371e9064abad03db926f87c44570fb4e2dbe",
    "align_targets": [
      {
        "lote": "promocao-a-saude-e-prevencao-de-agravos-completo",
        "prior_semantic_sha256": "d9532e6ad4e5537b210adc6cb9c2371e9064abad03db926f87c44570fb4e2dbe"
      },
      {
        "lote": "promocao-a-saude-e-prevencao-de-agravos-g12",
        "prior_semantic_sha256": "167126227acc9f468cdd175faefa82e2028d01d3187bee27b2432178c92a81b1"
      },
      {
        "lote": "promocao-a-saude-e-prevencao-de-agravos-lote-03",
        "prior_semantic_sha256": "0aecfe225d9a9503ed87afbad9d0122b8448b051656d486b34c837a4f0bc8611"
      },
      {
        "lote": "saude-da-mulher-completo",
        "prior_semantic_sha256": "8998dadf786fc210dc024fe90a7d7c1c9653aec1e57bb051cf9424c0cbf825fd"
      },
      {
        "lote": "saude-da-mulher-g27",
        "prior_semantic_sha256": "d9532e6ad4e5537b210adc6cb9c2371e9064abad03db926f87c44570fb4e2dbe"
      }
    ],
    "rationale": "Slug Promoção — remover mis-tag Saúde da Mulher."
  },
  {
    "case_id": "nc-g03-59bb8eacd42ac976",
    "slug": "vunesp-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1779564125198-1",
    "canonical_lote": "dtrans-mescladas-g02",
    "authority_manifest": "data/catalog-migration/dtrans-mescladas-g02/manifest.json",
    "remove_from_manifests": [
      "data/catalog-migration/imunizacao-completo/manifest.json"
    ],
    "expected_semantic_sha256": "59d5016ab3f621ce3ce95388dc1f0855f7f910bf7d31bf522b570f1e8818ca23",
    "align_targets": [
      {
        "lote": "dtrans-mescladas-g02",
        "prior_semantic_sha256": "59d5016ab3f621ce3ce95388dc1f0855f7f910bf7d31bf522b570f1e8818ca23"
      },
      {
        "lote": "imunizacao-builder-lote-02",
        "prior_semantic_sha256": "578344d9bf7719f22827d87f6150180cc69ffeac2e0388c317be0b5604f6fb80"
      },
      {
        "lote": "imunizacao-completo",
        "prior_semantic_sha256": "593a3fc1abebae765780346252b31bfcbaf64312c4cacdcf0d2bc6ae4af5617c"
      },
      {
        "lote": "imunizacao-g83",
        "prior_semantic_sha256": "7dd623d5744d31d4090b4a5a31cfc01daa85e35fcaee05e41304755a692a29d4"
      },
      {
        "lote": "imunizacao-repair-lote-02",
        "prior_semantic_sha256": "3d1f4050fbbd25746b03f499b8c2249f28abdcb24a8670f8f9a54183a5dfcc81"
      },
      {
        "lote": "outras-doencas-e-questoes-mescladas-transmissiveis-lote-01",
        "prior_semantic_sha256": "ad5bf6117909d620fcceeca47b500af646e1f1a83df54af7c90413ca68a9b9ae"
      }
    ],
    "rationale": "Slug DTrans — remover mis-tag Imunização."
  }
];
