/**
 * Proposta de proveniência — IGEDUC (3 casos official lane).
 * Materialização proibida até aprovação explícita (`pode materializar`)
 * após decisões choose/create (não aplicar em defer).
 */
export const OFFICIAL_LANE_PROVENANCE_IGEDUC_PROPOSAL = {
  schema: 'neurocanvas-official-lane-provenance-proposal-v1',
  lane: 'official_lane_provenance_repair',
  batch_id: 'IGEDUC-PROVENANCE',
  generated_at: '2026-07-28',
  status: 'proposal_only',
  materialization: 'forbidden_until_explicit_approval',
  baseline_ref: {
    baseline_id: 'G0.4',
    official_lane_count: 11,
    metrics: '339 / 104 / 11 / 0',
    note: 'Baseline e casos VUNESP-SJRP permanecem; sem aplicador/baseline neste PR.',
  },
  phase_0b: {
    ready: false,
    note: 'Fase 0B permanece bloqueada.',
  },
  decision_rule: {
    choose_existing_candidate: 'Tier A completo + um candidato já correto (meta+conteúdo)',
    create_corrected_candidate: 'Tier A completo + nenhum candidato com meta+conteúdo alinhados ao oficial',
    defer: 'Falta PDF oficial e/ou nº questão e/ou gabarito definitivo',
  },
  cases: [
    {
      case_id: 'nc-g03-9bc30daff9fcfbc0',
      current_catalog_slug: 'igeduc-enfermagem-processo-de-enfermagem-1780011859940-3',
      proposed_canonical_slug: 'igeduc-jati-ulcera-venosa-curativo-q38',
      severity: 'S2',
      attributed_origin_local: {
        banca: 'Igeduc',
        orgao: 'Pref Jati',
        cargo: 'Técnico de enfermagem',
        ano: '2026',
        prova: 'Tec Enf',
        local_gabarito: 'A',
        source: 'catalog copies Curativos repair + Processo completo/lote-14',
      },
      official_exam_research: {
        candidate_portal: {
          title: 'Município de Jati (CE) — Concurso 001/2025',
          url: 'https://www.igeduc.org.br/informacoes/136/',
          tier: 'A',
        },
        caderno_oficial: {
          title: 'CADERNO DE QUESTÕES - TÉCNICO EM ENFERMAGEM',
          published: '2026-04-26',
          url: 'https://anexos.cdn.selecao.net.br/uploads/797/concursos/136/anexos/9906a39d-2f1a-4257-88b9-3852177379b6.pdf',
          tier: 'A',
        },
        gabarito_definitivo: {
          title: 'GABARITO DEFINITIVO DAS PROVAS OBJETIVAS',
          published: '2026-05-11',
          url: 'https://anexos.cdn.selecao.net.br/uploads/797/concursos/136/anexos/0e15a8e7-8f82-447a-abae-229ede202eea.pdf',
          cargo_row: 'TÉCNICO EM ENFERMAGEM',
          tier: 'A',
        },
        found_on_official_prova_pdf: true,
        official_question_number: 38,
        official_page: null,
        official_gabarito_letra: 'A',
        instruction_match:
          'O técnico de enfermagem está realizando curativo em paciente de 58 anos com úlcera venosa em terço distal de perna direita há 3 meses…',
        content_gaps_vs_official: [
          'Cópias locais omitem a citação da prescrição após "indica:" ("Realizar limpeza com SF 0,9%, aplicar cobertura adequada e enfaixamento compressivo").',
          'Slug carrega segmento processo-de-enfermagem; tema oficial = curativo/úlcera venosa.',
        ],
        research_note_adjacent:
          'Q39 do mesmo caderno contém vazamento de prompt LLM ("Entendido! Vou reconstruir…"); fora do escopo deste case_id, mas documenta contaminação no PDF oficial.',
        gaps_blocking_tier_a: [],
      },
      candidates: [
        {
          path: 'data/catalog-migration/curativos-e-manejo-de-feridas-repair-lote-01/questions/igeduc-enfermagem-processo-de-enfermagem-1780011859940-3.json',
          semantic_sha256:
            '18992b897c8f2d6ae190c8ee2a3de3670b528e2e5392fe9dcc77098d97d561b7',
          meta_subtopico: 'Curativos e Manejo de Feridas',
          assessment:
            'Subtópico temático correto; gab. A alinhado; instruction incompleta vs caderno; slug mis-tag Processo.',
        },
        {
          path: 'data/catalog-migration/processo-de-enfermagem-completo/questions/igeduc-enfermagem-processo-de-enfermagem-1780011859940-3.json',
          semantic_sha256:
            '5aa519ffee38e1a083ac49d81923a3bfc81e7eedea21a200afdb4116490c9f74',
          meta_subtopico: 'Processo de Enfermagem',
          assessment: 'Mesmo question_data degradado; meta.subtopico incorreto.',
        },
        {
          path: 'data/catalog-migration/processo-de-enfermagem-lote-14/questions/igeduc-enfermagem-processo-de-enfermagem-1780011859940-3.json',
          semantic_sha256:
            '5aa519ffee38e1a083ac49d81923a3bfc81e7eedea21a200afdb4116490c9f74',
          meta_subtopico: 'Processo de Enfermagem',
          assessment: 'Alias do hash Processo; meta incorreta.',
        },
      ],
      decision: 'create_corrected_candidate',
      decision_rationale:
        'Tier A fechado (caderno Tec Enf Jati + gab. definitivo Q38=A). Nenhum candidato tem instruction fiel ao oficial + meta/slug canônicos; criar candidato corrigido (restituir prescrição + meta Curativos + slug canônico).',
      when_materializing: {
        authority_meta: {
          banca: 'Igeduc',
          orgao: 'Pref. Jati',
          prova: 'Tec Enf',
          ano: '2026',
          pedagogical_subtopico: 'Curativos e Manejo de Feridas',
          official_question_number: 38,
          official_gabarito: 'A',
        },
        preview_authorized_paths: [
          'curativos-e-manejo-de-feridas-repair-lote-01/questions/igeduc-enfermagem-processo-de-enfermagem-1780011859940-3.json',
          'processo-de-enfermagem-completo/questions/igeduc-enfermagem-processo-de-enfermagem-1780011859940-3.json',
          'processo-de-enfermagem-lote-14/questions/igeduc-enfermagem-processo-de-enfermagem-1780011859940-3.json',
        ],
      },
    },
    {
      case_id: 'nc-g03-7df66747dffa2e92',
      current_catalog_slug: 'igeduc-enfermagem-processo-de-enfermagem-1780011879977-3',
      proposed_canonical_slug: 'igeduc-cisrp-assistencia-crianca-sinais-q48',
      severity: 'S3',
      attributed_origin_local: {
        banca: 'Igeduc',
        orgao: 'Enfermagem',
        cargo: 'Técnico de enfermagem',
        ano: '2026',
        prova: 'Tec (CISRP)',
        local_gabarito: 'E',
        source: 'Processo completo/lote-14 + Sinais Vitais completo/repair',
      },
      official_exam_research: {
        candidate_portal: {
          title: 'CISRP Paulo Afonso (BA) — Concurso 001/2026',
          url: 'https://igeduc.org.br/informacoes/137/',
          tier: 'A',
        },
        caderno_oficial: {
          title: 'CADERNO DE QUESTÕES - TÉCNICO EM ENFERMAGEM',
          published: '2026-04-26',
          url: 'https://anexos.cdn.selecao.net.br/uploads/797/concursos/137/anexos/0a3bc759-d7a2-4ba0-90ca-7a323bb02dd5.pdf',
          tier: 'A',
        },
        gabarito_definitivo: {
          title: 'GABARITO DEFINITIVO DAS PROVAS OBJETIVAS - PAULO AFONSO',
          published: '2026-05-08',
          url: 'https://anexos.cdn.selecao.net.br/uploads/797/concursos/137/anexos/55662436-6a9d-4e11-be7e-a7efb2e3db14.pdf',
          cargo_row: 'TÉCNICO EM ENFERMAGEM',
          tier: 'A',
        },
        found_on_official_prova_pdf: true,
        official_question_number: 48,
        official_page: 16,
        official_gabarito_letra: 'E',
        instruction_match:
          'A assistência de enfermagem à criança… proposições I–IV (FC 100–160 bpm, vacinação, antitérmico, prevenção de acidentes).',
        content_gaps_vs_official: [
          'Cópias Sinais Vitais usam marcadores "I-" / "II-" etc.; caderno oficial usa "I." / "II." (S3 instruction drift).',
          'Cópias Processo usam pontuação oficial mas meta.subtopico Processo (tema = sinais/pediatria).',
          'meta.orgao local "Enfermagem" não é o órgão do certame (CISRP / Paulo Afonso).',
        ],
        gaps_blocking_tier_a: [],
      },
      candidates: [
        {
          path: 'data/catalog-migration/processo-de-enfermagem-lote-14/questions/igeduc-enfermagem-processo-de-enfermagem-1780011879977-3.json',
          semantic_sha256:
            'ea2a328508505273f93771da7918e12ba88681a2e2ac8a9af76254d18b7c6c60',
          meta_subtopico: 'Processo de Enfermagem',
          assessment: 'Pontuação I. alinhada ao caderno; subtópico/órgão incorretos.',
        },
        {
          path: 'data/catalog-migration/sinais-vitais-completo/questions/igeduc-enfermagem-processo-de-enfermagem-1780011879977-3.json',
          semantic_sha256:
            'd164363029ea9d2693c56a9be16446a862074fc587b0bc2165c276d87b428c41',
          meta_subtopico: 'Verificação de Sinais Vitais',
          assessment: 'Subtópico temático preferível; instruction com "I-" diverge do oficial.',
        },
        {
          path: 'data/catalog-migration/processo-de-enfermagem-completo/questions/igeduc-enfermagem-processo-de-enfermagem-1780011879977-3.json',
          semantic_sha256:
            'd164363029ea9d2693c56a9be16446a862074fc587b0bc2165c276d87b428c41',
          meta_subtopico: 'Verificação de Sinais Vitais',
          assessment: 'Hash Sinais; pasta Processo — inconsistência de lote.',
        },
        {
          path: 'data/catalog-migration/verificacao-de-sinais-vitais-repair-lote-02/questions/igeduc-enfermagem-processo-de-enfermagem-1780011879977-3.json',
          semantic_sha256:
            'd164363029ea9d2693c56a9be16446a862074fc587b0bc2165c276d87b428c41',
          meta_subtopico: 'Verificação de Sinais Vitais',
          assessment: 'Mesmo hash Sinais; slug ainda Processo.',
        },
      ],
      decision: 'create_corrected_candidate',
      decision_rationale:
        'Tier A fechado (caderno Tec Enf CISRP + gab. definitivo Q48=E). Nenhum candidato combina texto oficial (I.) + meta Sinais Vitais + órgão CISRP; criar candidato corrigido.',
      when_materializing: {
        authority_meta: {
          banca: 'Igeduc',
          orgao: 'CISRP Paulo Afonso',
          prova: 'Tec Enf',
          ano: '2026',
          pedagogical_subtopico: 'Verificação de Sinais Vitais',
          official_question_number: 48,
          official_gabarito: 'E',
        },
        preview_authorized_paths: [
          'processo-de-enfermagem-lote-14/questions/igeduc-enfermagem-processo-de-enfermagem-1780011879977-3.json',
          'sinais-vitais-completo/questions/igeduc-enfermagem-processo-de-enfermagem-1780011879977-3.json',
          'processo-de-enfermagem-completo/questions/igeduc-enfermagem-processo-de-enfermagem-1780011879977-3.json',
          'verificacao-de-sinais-vitais-repair-lote-02/questions/igeduc-enfermagem-processo-de-enfermagem-1780011879977-3.json',
        ],
      },
    },
    {
      case_id: 'nc-g03-d501060585489ef9',
      current_catalog_slug: 'igeduc-enfermagem-urgencias-e-emergencias-1777104031822-1',
      proposed_canonical_slug: 'igeduc-triunfo-prep-sobre-demanda',
      severity: 'S3',
      attributed_origin_local: {
        banca: 'Igeduc',
        orgao: 'Enfermagem',
        cargo: 'Técnico de enfermagem',
        ano: '2023',
        prova: 'Tec (Pref Triunfo)',
        local_gabarito: 'A',
        source: 'ISTS repair + Urgências completo/lote-03',
      },
      official_exam_research: {
        candidate_portal: {
          title: 'Pref. Triunfo/PE — Edital 001/2023 (IGEDUC)',
          url: 'https://www.agrobase.com.br/concursos/2023/concurso-prefeitura-triunfo-pe-edital-001-2023/',
          historical_portal_cited: 'https://concursos.igeduc.org.br/municipio-de-triunfo-pe',
          tier: 'B',
          note: 'Portal histórico citado no edital; DNS/arquivo IGEDUC Triunfo não recuperado nesta pesquisa.',
        },
        third_party_mirrors: [
          {
            tier: 'B',
            source: 'PCI Concursos',
            url: 'https://www.pciconcursos.com.br/provas/download/tecnico-de-enfermagem-psf-prefeitura-triunfo-pe-igeduc-2023',
            note: 'Lista tecnico-de-enfermagem-psf.pdf + gabaritos-definitivos.pdf atrás de verificação; PDFs não obtidos.',
          },
          {
            tier: 'B',
            source: 'Provas Brasil',
            url: 'https://www.provasbrasil.com.br/provas-anteriores/tecnico-de-enfermagem-psf-prefeitura-triunfo-pe-igeduc-2023/',
            note: 'Página de provas anteriores; sem URL direta de PDF nesta pesquisa.',
          },
        ],
        found_on_official_prova_pdf: false,
        official_question_number: null,
        official_page: null,
        official_gabarito_letra: null,
        local_content_note:
          'Certo/Errado sobre PrEP sob demanda (2+1+1); cópias diferem por "HIV- Deve" vs "HIV. Deve"; subtópico IST vs Urgências.',
        gaps_blocking_tier_a: [
          'PDF oficial da prova Tec Enf / Tec Enf-PSF Triunfo 2023 não obtido',
          'Número da questão no caderno oficial não determinado',
          'Gabarito definitivo oficial (letra por Q#) não obtido',
        ],
      },
      candidates: [
        {
          path: 'data/catalog-migration/infeccoes-sexualmente-transmissiveis-ists-repair-lote-01/questions/igeduc-enfermagem-urgencias-e-emergencias-1777104031822-1.json',
          semantic_sha256:
            'ca8936789d2db8945a698c0d4f63f0cdb3dc81847cf0dfde9690378cf3ea479a',
          meta_subtopico: 'Infecções Sexualmente Transmissíveis (ISTs)',
          assessment: 'Tema PrEP → IST preferível; pontuação "HIV- Deve"; slug Urgências.',
        },
        {
          path: 'data/catalog-migration/urgencias-e-emergencias-completo/questions/igeduc-enfermagem-urgencias-e-emergencias-1777104031822-1.json',
          semantic_sha256:
            '472b179c7dc7e10aa41a6bdb1b6a4e9076f5831fbaf2570c6ddf8c6b07788d33',
          meta_subtopico: 'Urgências e Emergências',
          assessment: 'Pontuação "HIV. Deve"; subtópico Urgências questionável para PrEP.',
        },
        {
          path: 'data/catalog-migration/urgencias-e-emergencias-lote-03/questions/igeduc-enfermagem-urgencias-e-emergencias-1777104031822-1.json',
          semantic_sha256:
            '472b179c7dc7e10aa41a6bdb1b6a4e9076f5831fbaf2570c6ddf8c6b07788d33',
          meta_subtopico: 'Urgências e Emergências',
          assessment: 'Alias Urgências.',
        },
      ],
      decision: 'defer',
      decision_rationale:
        'Origem local Pref. Triunfo 2023 é consistente (tier B espelhos), mas sem PDF oficial + Q# + gabarito definitivo a regra dura obriga defer. Atualizar proposta em novo PR quando os PDFs oficiais aparecerem.',
      when_tier_a_closes_expected: {
        decision: 'create_corrected_candidate_or_choose',
        prefer_subtopico: 'Infecções Sexualmente Transmissíveis (ISTs)',
        preview_authorized_paths: [
          'infeccoes-sexualmente-transmissiveis-ists-repair-lote-01/questions/igeduc-enfermagem-urgencias-e-emergencias-1777104031822-1.json',
          'urgencias-e-emergencias-completo/questions/igeduc-enfermagem-urgencias-e-emergencias-1777104031822-1.json',
          'urgencias-e-emergencias-lote-03/questions/igeduc-enfermagem-urgencias-e-emergencias-1777104031822-1.json',
        ],
      },
    },
  ],
  batch_summary: {
    decisions: {
      defer: 1,
      choose_existing_candidate: 0,
      create_corrected_candidate: 2,
    },
    materialization_authorized: false,
    materialization_eligible_case_ids: [
      'nc-g03-9bc30daff9fcfbc0',
      'nc-g03-7df66747dffa2e92',
    ],
    next_steps: [
      'Revisar esta proposta (2 create + 1 defer)',
      'Se aprovado create: responder explicitamente pode materializar (só Jati Q38 + CISRP Q48)',
      'Não materializar Triunfo enquanto defer',
      'Não abrir aplicador/baseline sem autorização; métricas permanecem 339/104/11/0',
      'Quando PDFs Triunfo oficiais aparecerem: atualizar proposta em novo PR',
    ],
  },
} as const;

export type OfficialLaneProvenanceIgeducProposal =
  typeof OFFICIAL_LANE_PROVENANCE_IGEDUC_PROPOSAL;
