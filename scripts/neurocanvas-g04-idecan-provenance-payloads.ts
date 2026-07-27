import type { G04EditorialPayload } from './neurocanvas-g04-apply-editorial';

const UFBA_PROVA_5008_TIPO_A =
  'https://concursos.ufba.br/sites/concursos.ufba.br/files/tecnicos/5008_-_tecnico_em_enfermagem_-_tipo_a.pdf';
const UFBA_GABARITO_PRELIMINAR_TIPO_A =
  'https://concursos.ufba.br/sites/concursos.ufba.br/files/tecnicos/gabarito_preliminar_edital_5_-_tipo_a.pdf';
const UFBA_HOMOLOG_524 =
  'https://concursos.ufba.br/sites/concursos.ufba.br/files/tecnicos/portaria_ndeg_524_homologacao_edital_05-2022_dou.pdf';

const slideMeta = {
  topico: 'Enfermagem',
  subtopico: 'Coleta de Exames Laboratoriais',
};

const idecanMetaBase = {
  ano: '2022',
  banca: 'IDECAN',
  orgao: 'UFBA',
  prova: 'Tec Enfermagem (UFBA) — Tipo A',
  cargo_header: 'Técnico de enfermagem',
  topico: 'Enfermagem',
  subtopico: 'Coleta de Exames Laboratoriais',
  content_standard: 'golden-v1' as const,
  family: 'certo_errado' as const,
  content_review: {
    reviewed_at: '2026-07-27',
    reviewer: 'g04-idecan-provenance',
    guideline_snapshot:
      'Cores de tubo: azul = citrato de sódio (coagulação); verde = heparina; cinza = fluoreto de sódio (glicemia).',
    exam_vs_current: 'none' as const,
  },
};

const idecanSourcesQ78 = [
  {
    id: 'ufba-edital-05-2022-prova-5008-tipo-a-q78',
    tier: 'A' as const,
    issuer: 'UFBA / IDECAN',
    title: 'Prova objetiva 5008 — Técnico em Enfermagem Tipo A — Q78',
    year: 2022,
    url: UFBA_PROVA_5008_TIPO_A,
    covers: ['tampa verde', 'citrato', 'coagulação', 'Q78'],
  },
  {
    id: 'ufba-edital-05-2022-gabarito-tipo-a-q78',
    tier: 'A' as const,
    issuer: 'UFBA / IDECAN',
    title: 'Gabarito preliminar Edital 05/2022 Tipo A — Q78 = F (Errado)',
    year: 2023,
    url: UFBA_GABARITO_PRELIMINAR_TIPO_A,
    covers: ['gabarito F', 'Q78'],
  },
  {
    id: 'ufba-edital-05-2022-homologacao',
    tier: 'A' as const,
    issuer: 'UFBA',
    title:
      'Portaria 524/2023 — homologação Edital 05/2022 (gabarito efetivo sem retificação de Q78)',
    year: 2023,
    url: UFBA_HOMOLOG_524,
    covers: ['homologação', 'gabarito efetivo'],
  },
];

const idecanSourcesQ79 = [
  {
    id: 'ufba-edital-05-2022-prova-5008-tipo-a-q79',
    tier: 'A' as const,
    issuer: 'UFBA / IDECAN',
    title: 'Prova objetiva 5008 — Técnico em Enfermagem Tipo A — Q79',
    year: 2022,
    url: UFBA_PROVA_5008_TIPO_A,
    covers: ['tampa cinza', 'fluoreto de sódio', 'glicemia', 'Q79'],
  },
  {
    id: 'ufba-edital-05-2022-gabarito-tipo-a-q79',
    tier: 'A' as const,
    issuer: 'UFBA / IDECAN',
    title: 'Gabarito preliminar Edital 05/2022 Tipo A — Q79 = V (Certo)',
    year: 2023,
    url: UFBA_GABARITO_PRELIMINAR_TIPO_A,
    covers: ['gabarito V', 'Q79'],
  },
  {
    id: 'ufba-edital-05-2022-homologacao-q79',
    tier: 'A' as const,
    issuer: 'UFBA',
    title:
      'Portaria 524/2023 — homologação Edital 05/2022 (gabarito efetivo sem retificação de Q79)',
    year: 2023,
    url: UFBA_HOMOLOG_524,
    covers: ['homologação', 'gabarito efetivo'],
  },
];

/** Payloads IDECAN UFBA 2022 — proveniência oficial (portal UFBA: prova + gabarito preliminar homologado). */
export const G04_IDECAN_PROVENANCE_PAYLOADS: G04EditorialPayload[] = [
  {
    case_id: 'nc-g03-2a5a44fc12f93928',
    slug: 'idecan-enfermagem-coleta-de-exames-laboratoriais-1778712165781-7',
    decision: 'create_corrected_candidate',
    authority_manifest: 'data/catalog-migration/coleta-lote-01/manifest.json',
    targets: [
      {
        lote: 'coleta-lote-01',
        prior_semantic_sha256:
          '42e33f644d27d76c3cfd5f639264c5889ad72341112dbb5c3228696bde688645',
      },
      {
        lote: 'coleta-de-exames-laboratoriais-repair-lote-01',
        prior_semantic_sha256:
          '632e16c10e058080340149ab7433ddac5510fb4f8ec59a04eff8f36b1f3b691c',
      },
      {
        lote: 'coleta-de-exames-laboratoriais-lote-02',
        prior_semantic_sha256:
          '42e33f644d27d76c3cfd5f639264c5889ad72341112dbb5c3228696bde688645',
      },
    ],
    expected_semantic_sha256:
      '35836e819c3e25ff4f7800d81ac9fbcf94b72d15b75e91027568ce7966669aa2',
    expected_byte_sha256: 'db54d09f1885d0c232699902bb1e42a12b48c7ccfa57331e8d364d9a1c1f626f',
    question: {
      meta: {
        ...idecanMetaBase,
        sources: idecanSourcesQ78,
      },
      question_data: {
        instruction:
          'Os tubos para coleta de sangue têm cores diferentes porque cada um possui uma função de análise diferente. A escolha errada da ordem dos tubos pode comprometer o resultado do exame de sangue. Tampa verde: tubo com citrato de sódio para análise de coagulação.',
        options: [
          { id: 'A', text: 'Certo', is_correct: false },
          { id: 'B', text: 'Errado', is_correct: true },
        ],
      },
      reverse_study_slides: [
        {
          type: 'concept_map',
          slide_title: 'Tubos — cores e função',
          meta: slideMeta,
          items: [
            {
              label: 'Tema da prova',
              detail:
                'Cada tampa indica aditivo e exame — ordem de coleta evita contaminação cruzada.',
              icon: 'Droplet',
            },
            {
              label: 'Afirmativa cobrada',
              detail: 'Tampa verde associada a citrato de sódio para coagulação.',
              icon: 'FileText',
            },
            {
              label: 'Pegadinha de cor',
              detail: 'Verde = heparina (bioquímica); citrato para coagulação = tampa azul.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Julgamento',
              detail: 'Certo ou Errado — sem alternativas A–E de conteúdo.',
              icon: 'Scale',
            },
          ],
          footer_rule: 'Cor da tampa ≠ aditivo citrato na afirmativa.',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: slideMeta,
          steps: [
            'Ler a afirmativa: tampa verde com citrato de sódio para coagulação.',
            'Recordar mapa de cores: citrato de sódio → tubo de tampa azul (coagulação).',
            'Tampa verde → heparina (exames bioquímicos), não citrato.',
            'A afirmativa troca cor e aditivo — julgamento: Errado.',
            'Eliminar A (Certo).',
            'Marcar B (Errado).',
          ],
          footer_rule: 'Verde ≠ citrato — gabarito Errado (B).',
        },
        {
          type: 'golden_rule',
          slide_title: 'Mapa rápido — tubos',
          meta: slideMeta,
          content: 'CORES DOS TUBOS DE COLETA',
          rows: [
            {
              label: 'Azul',
              value: 'Citrato de sódio — coagulação / coagulograma',
              badge: 'hot',
              emphasis: 'highlight',
            },
            { label: 'Verde', value: 'Heparina — plasma para bioquímica', badge: 'info' },
            {
              label: 'Cinza',
              value: 'Fluoreto de sódio — glicemia (inibe glicólise)',
              badge: 'info',
            },
            {
              label: 'Pegadinha',
              value: 'Verde + citrato = troca de cor/aditivo',
              badge: 'warn',
            },
          ],
          footer_rule: 'Coagulação = azul + citrato, não verde.',
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: slideMeta,
          content: 'PEGADINHAS — TUBO VERDE',
          items: [
            {
              label: 'Marcar Certo (A)',
              detail: 'Confunde verde com azul — citrato não vai no tubo verde.',
              correct: 'Verde = heparina; coagulação = azul + citrato — Errado (B).',
            },
            {
              label: 'Memorizar só “verde”',
              detail: 'Sem checar o aditivo citrato citado no enunciado.',
              correct: 'Aditivo e cor precisam casar — gabarito B.',
            },
            {
              label: 'Trocar ordem de coleta',
              detail:
                'Ordem errada contamina aditivos — tema do enunciado, mas não torna a afirmativa verdadeira.',
              correct: 'Afirmativa é falsa no aditivo/cor — marcar Errado.',
            },
          ],
          footer_rule: 'Não validar citrato na tampa verde.',
        },
      ],
      modulo_slug: 'idecan-enfermagem-coleta-de-exames-laboratoriais-1778712165781-7',
    },
  },
  {
    case_id: 'nc-g03-6190f08e3ab3ead6',
    slug: 'idecan-enfermagem-coleta-de-exames-laboratoriais-1778712165781-8',
    decision: 'create_corrected_candidate',
    authority_manifest: 'data/catalog-migration/coleta-lote-01/manifest.json',
    targets: [
      {
        lote: 'coleta-lote-01',
        prior_semantic_sha256:
          '7ebccd4d734661467daa888de0c294a2dfdcb73f814c58c3180248ec7ba62cb7',
      },
      {
        lote: 'coleta-de-exames-laboratoriais-repair-lote-01',
        prior_semantic_sha256:
          '55a2fd2876bc01f0952d8c254f15d4bae5669105115f092c3502fbf9bed72f43',
      },
      {
        lote: 'coleta-de-exames-laboratoriais-lote-02',
        prior_semantic_sha256:
          '7ebccd4d734661467daa888de0c294a2dfdcb73f814c58c3180248ec7ba62cb7',
      },
    ],
    expected_semantic_sha256:
      '187944001ea50dd6c32573e9d30517ae9bb7c4ffd3bd27b865da7447bbcdd122',
    expected_byte_sha256: 'f8521a81ef8939b45079bd5ed0410315ef2c7b4af6e6c6c1b3f4952b747dfd1a',
    question: {
      meta: {
        ...idecanMetaBase,
        sources: idecanSourcesQ79,
      },
      question_data: {
        instruction:
          'Ainda em relação aos tubos para coleta de sangue, pode-se afirmar que o tubo com tampa cinza é um tubo com fluoreto de sódio para análise de glicemia.',
        options: [
          { id: 'A', text: 'Certo', is_correct: true },
          { id: 'B', text: 'Errado', is_correct: false },
        ],
      },
      reverse_study_slides: [
        {
          type: 'concept_map',
          slide_title: 'Tubo cinza — glicemia',
          meta: slideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Julgar se tampa cinza = fluoreto de sódio para dosagem de glicemia.',
              icon: 'Target',
            },
            {
              label: 'Função do fluoreto',
              detail:
                'Inibe a glicólise in vitro — preserva a glicose da coleta até o laboratório.',
              icon: 'FlaskConical',
            },
            {
              label: 'Material colhido',
              detail: 'Plasma para glicemia (e lactato em alguns protocolos).',
              icon: 'Droplet',
            },
            {
              label: 'Pegadinha',
              detail: 'Não usar tubo sem fluoreto para glicose — resultado falsamente baixo.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Cinza + fluoreto = trilho da glicemia.',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: slideMeta,
          steps: [
            'Ler: tubo tampa cinza com fluoreto de sódio para glicemia.',
            'Confirmar norma pré-analítica: tubo cinza contém fluoreto de sódio como estabilizador.',
            'Uso clínico: dosagem de glicose plasmática.',
            'Afirmativa alinha cor, aditivo e exame — julgamento: Certo.',
            'Eliminar B (Errado).',
            'Marcar A (Certo).',
          ],
          footer_rule: 'Cinza + fluoreto + glicemia — gabarito Certo (A).',
        },
        {
          type: 'golden_rule',
          slide_title: 'Tubo cinza — referência',
          meta: slideMeta,
          content: 'GLICEMIA — TUBO CINZA',
          rows: [
            {
              label: 'Aditivo',
              value: 'Fluoreto de sódio (inibidor glicolítico)',
              badge: 'hot',
              emphasis: 'highlight',
            },
            {
              label: 'Anticoagulante',
              value: 'EDTA ou oxalato (varia por fabricante)',
              badge: 'info',
            },
            { label: 'Exame', value: 'Glicemia plasmática / lactato', badge: 'hot' },
            {
              label: 'Erro comum',
              value: 'Coletar glicose em tubo sem fluoreto',
              badge: 'warn',
            },
          ],
          footer_rule: 'Sem fluoreto a glicose cai na amostra.',
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: slideMeta,
          content: 'PEGADINHAS — GLICEMIA',
          items: [
            {
              label: 'Marcar Errado (B)',
              detail: 'Confunde cinza com outro aditivo ou acha que fluoreto é só decorativo.',
              correct: 'Cinza + fluoreto é padrão para glicemia — Certo (A).',
            },
            {
              label: 'Usar soro comum',
              detail: 'Sem inibidor, hemácias consomem glicose após a coleta.',
              correct: 'Tubo cinza com fluoreto — afirmativa correta.',
            },
            {
              label: 'Trocar com lilás (EDTA)',
              detail: 'EDTA roxo é hematologia — não substitui fluoreto na glicemia.',
              correct: 'Glicemia = cinza + fluoreto — marcar Certo.',
            },
          ],
          footer_rule: 'Não eliminar por confundir com tubo roxo.',
        },
      ],
      modulo_slug: 'idecan-enfermagem-coleta-de-exames-laboratoriais-1778712165781-8',
    },
  },
];
