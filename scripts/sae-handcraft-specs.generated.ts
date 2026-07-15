/** AUTO-GENERATED — node scripts/generate-sae-handcraft-specs.mjs */
export const SAE_HANDCRAFT_SPECS = {
  "ameosc-enfermagem-processo-de-enfermagem-1776056129848-7": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "Registro em prontuário — V/F",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Tema",
          "detail": "Integridade, veracidade e identificação no registro de enfermagem.",
          "icon": "Target"
        },
        {
          "label": "Item 1 — alteração livre",
          "detail": "Prontuário não se corrige “livremente” — exige protocolo de retificação.",
          "icon": "XCircle"
        },
        {
          "label": "Item 2 — objetividade",
          "detail": "Anotação objetiva no momento do cuidado — veracidade.",
          "icon": "CheckCircle"
        },
        {
          "label": "Item 3 — comunicação",
          "detail": "Relatórios e boletins integram a comunicação interprofissional.",
          "icon": "MessageSquare"
        },
        {
          "label": "Item 4 — identificação",
          "detail": "Autoria deve constar no registro — não basta “a equipe saber”.",
          "icon": "Stamp"
        },
        {
          "label": "COFEN 358",
          "detail": "Base normativa para julgar cada afirmativa V ou F.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Julgue item a item antes de montar a sequência V-F"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando: julgar cada afirmativa V ou F antes de montar a sequência.",
        "Tema: O registro adequado das informações em prontuários e documentos hospitalares é essencial para garantir a continuidade do",
        "Item 1: “O prontuário do paciente pode ser alterado livremente pelo profissi…” → F (viola integridade/identificação/veracidade).",
        "Item 2: “As anotações de enfermagem devem ser objetivas, claras e registrada…” → V (alinhado à COFEN 358).",
        "Item 3: “O preenchimento correto dos relatórios e boletins diários é fundame…” → V (alinhado à COFEN 358).",
        "Item 4: “Relatórios de enfermagem não precisam conter a identificação do pro…” → F (viola integridade/identificação/veracidade).",
        "Montar sequência: F − V − V − F.",
        "Eliminar letra A: sequência não reflete o julgamento V/F item a item.",
        "Eliminar letra B: sequência não reflete o julgamento V/F item a item.",
        "Eliminar letra C: sequência não reflete o julgamento V/F item a item.",
        "Marcar letra D: única sequência coerente com Res. COFEN 358/2009.",
        "Fixação: em V/F de registro — teste identificação, integridade, veracidade e cronologia antes de escolher a letra."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "V − F − F − F.",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra B",
          "detail": "F − F − V − V.",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra C",
          "detail": "V − V − V − V.",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (D)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "ameosc-enfermagem-processo-de-enfermagem-1776056158507-0": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "O registro adequado das observações e intervenções realizadas é essencial para garantir a continuidade do cuidado e a rastreabilidade das informações.",
          "icon": "Target"
        },
        {
          "label": "Anotação de enfermagem",
          "detail": "Registro factual do cuidado executado pela equipe — integra o prontuário.",
          "icon": "FileText"
        },
        {
          "label": "Integridade",
          "detail": "Legível, cronológico, sem rasura indevida ou registro fictício.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Identificação",
          "detail": "Carimbo, nome legível e assinatura — obrigatórios no documento firmado.",
          "icon": "Stamp"
        },
        {
          "label": "Veracidade",
          "detail": "Registrar no momento do cuidado; vedado anotar o que não foi feito.",
          "icon": "CheckCircle"
        },
        {
          "label": "COFEN 358/2009",
          "detail": "Norma central do registro de enfermagem no Brasil.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: O registro adequado das observações e intervenções realizadas é essencial para garantir a continuidade do cuidado e a rastreabilidade das informações.",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Eliminar D: critério da letra D não fecha com COFEN 358.",
        "Letra A: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra A.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Descrever no prontuário apenas as intervenções que resultam em modificações na…",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra C",
          "detail": "Notificar os colegas apenas verbalmente durante a troca de plantão, sem necessi…",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra D",
          "detail": "Preencher os registros no final do turno de trabalho, para evitar interrupções…",
          "correct": "critério da letra D não fecha com COFEN 358 — por isso não é o gabarito (A)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "ameosc-enfermagem-processo-de-enfermagem-1780001613305-5": {
    "branch": "sae_exceto",
    "family": "certo_errado",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "SAE — pegadinha EXCETO",
      "chip_label": "EXCETO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Comando",
          "detail": "Os registros realizados pela equipe de enfermagem, referentes aos cuidados prestados, são denominados anotações de enfer",
          "icon": "Target"
        },
        {
          "label": "Lógica EXCETO",
          "detail": "Três alternativas corretas + uma exceção — não inverta o raciocínio.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Anotação × evolução",
          "detail": "Técnico anota cuidado; evolução reflexiva é camada distinta.",
          "icon": "FileText"
        },
        {
          "label": "Privativa",
          "detail": "Diagnóstico, prescrição e evolução — enfermeiro (Lei 7.498/86).",
          "icon": "UserCheck"
        },
        {
          "label": "Art. 5º COFEN 358",
          "detail": "Técnico/auxiliar executam o que lhes couber, supervisionados.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "EXCETO: valide cada letra como conduta correta antes de achar a exceção"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "EXCETO — privativa × técnico",
      "chip_label": "PEGADINHA",
      "content": "ANOTAÇÃO DO TÉCNICO — O QUE NÃO ENTRA",
      "rows": [
        {
          "label": "Pode anotar",
          "value": "Cuidados executados, sinais observados, intercorrências",
          "badge": "ok"
        },
        {
          "label": "Não anota",
          "value": "Evolução reflexiva, diagnóstico, anamnese completa formal",
          "badge": "hot"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnóstico, prescrição, evolução/avaliação",
          "badge": "warn"
        },
        {
          "label": "Lei 7.498/86",
          "value": "Art. 11 — privativas do enfermeiro",
          "badge": "info"
        },
        {
          "label": "EXCETO na prova",
          "value": "Três corretas + uma que extrapola competência do técnico",
          "badge": "hot"
        }
      ],
      "footer_rule": "Na dúvida: se exige julgamento clínico privativo → é exceção na anotação do técnico"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.",
        "Enquadramento: Os registros realizados pela equipe de enfermagem, referentes aos cuidados prestados, são denominados anotações de enfer",
        "Letra A: critério da letra A não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra B: critério da letra B não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra C: critério da letra C não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra D: única exceção — extrapola competência ou viola norma.",
        "Marcar letra D.",
        "Fixação: em EXCETO de anotação — técnico registra cuidado; evolução/diagnóstico/anamnese completa é privativa ou exceção."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — EXCETO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "O registro deve conter a identificação do profissional (nome, número do registr…",
          "correct": "Em EXCETO, A é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra B — conduta correta",
          "detail": "O registro deve ser precedido da especificação do horário e data.",
          "correct": "Em EXCETO, B é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra C — conduta correta",
          "detail": "Os registros devem ser em ordem cronológica.",
          "correct": "Em EXCETO, C é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra D — exceção (gabarito)",
          "detail": "A evolução de enfermagem (dados analíticos/registro reflexivo).",
          "correct": "INCORRETA na prova: critério da letra D não fecha com COFEN 358 — esta é a exceção pedida."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "ameosc-enfermagem-processo-de-enfermagem-1780003031246-4": {
    "branch": "sae_generico",
    "family": "conceito",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "Via IM — locais seguros",
      "chip_label": "IM",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Tema",
          "detail": "Técnica IM: locais seguros e volumes máximos — evitar complicações neurovasculares.",
          "icon": "Target"
        },
        {
          "label": "Item 1 — ventroglútea",
          "detail": "Hochstetter: mais segura, livre de grandes vasos e nervos importantes.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Item 2 — Z-track",
          "detail": "Não é exclusiva de vacinas oleosas em <2 anos — julgar F na prova.",
          "icon": "XCircle"
        },
        {
          "label": "Item 3 — vasto lateral",
          "detail": "Coxa em lactentes — desenvolvimento muscular; julgar V/F pelo enunciado.",
          "icon": "Activity"
        },
        {
          "label": "Item 4 — deltoide",
          "detail": "Evitar volumes elevados no deltoide — risco de irritação e compressão do nervo axilar.",
          "icon": "Syringe"
        },
        {
          "label": "Registro PE",
          "detail": "Local, hora e volume da IM na anotação de enfermagem.",
          "icon": "FileText"
        }
      ],
      "footer_rule": "Julgue cada item (__) antes de montar V-F-V-F"
    },
    "golden_rule": {
      "slide_title": "IM — referência rápida",
      "chip_label": "IM",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "VIA INTRAMUSCULAR — LOCAIS E SEGURANÇA",
      "rows": [
        {
          "label": "Ventroglútea",
          "value": "Mais segura (Hochstetter) — afastada de nervo ciático/vasos",
          "badge": "ok"
        },
        {
          "label": "Dorsoglútea",
          "value": "QSE da nádega — técnica de localização",
          "badge": "info"
        },
        {
          "label": "Deltoide",
          "value": "Volume reduzido — músculo deltoide",
          "badge": "warn"
        },
        {
          "label": "Vasto lateral",
          "value": "Face anterolateral da coxa",
          "badge": "info"
        },
        {
          "label": "Gabarito prova",
          "value": "Sequência V, F, V, F nesta questão",
          "badge": "hot"
        }
      ],
      "footer_rule": "Volume máximo varia por sítio — não extrapole"
    },
    "logic_flow": {
      "reveal_mode": "tap",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "steps": [
        "Comando: V/F nos quatro itens sobre IM (ventroglútea, Z-track, vasto lateral, deltoide).",
        "Item 1 ventroglútea/Hochstetter: mais segura — verdadeiro (V).",
        "Item 2 Z-track exclusivo em vacinas oleosas <2 anos — falso (F).",
        "Item 3 vasto lateral em lactentes — verdadeiro conforme enunciado (V).",
        "Item 4 deltoide com volume excessivo e nervo axilar — falso na sequência da prova (F).",
        "Sequência de cima para baixo: V, F, V, F.",
        "Marcar letra C.",
        "Fixação: ventroglútea = sítio mais seguro; deltoide tem limite de volume."
      ],
      "footer_rule": "IM segura = anatomia + volume + registro"
    },
    "danger_zone": {
      "items": [
        {
          "label": "Sequência A",
          "detail": "Combinação que omite V na ventroglútea.",
          "correct": "Item 1 é V — sequência incorreta."
        },
        {
          "label": "Sequência B",
          "detail": "Mantém Z-track exclusivo em lactentes.",
          "correct": "Item 2 é F — invalida a sequência."
        },
        {
          "label": "Sequência D",
          "detail": "Inverte julgamento do vasto lateral ou deltoide.",
          "correct": "Gabarito é V, F, V, F (letra C)."
        },
        {
          "label": "Transferência — deltoide",
          "detail": "Volume excessivo no deltoide comprime estruturas.",
          "correct": "Respeitar limite de volume no músculo deltoide."
        }
      ],
      "content": "PEGADINHAS — VF IM",
      "bullet_style": "x_icon",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Armadilhas — sequência V/F",
      "chip_label": "PEGADINHAS",
      "footer_rule": "Monte V-F-V-F item a item"
    }
  },
  "avancasp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-7": {
    "branch": "sae_etapas",
    "family": "conceito",
    "guideline": "5 etapas SAE + competências por categoria",
    "concept_map": {
      "slide_title": "SAE — etapas e competências",
      "chip_label": "ETAPAS SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Assinale o conceito a seguir que se refere à \"perspectiva de evolução do paciente e sua resposta às prescrições de enfermagem durante o período de internação\".",
          "icon": "Target"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "NANDA-NIC-NOC",
          "detail": "Diagnóstico padronizado, intervenções e resultados mensuráveis.",
          "icon": "Layers"
        },
        {
          "label": "Privativa do enfermeiro",
          "detail": "Diagnóstico, prescrição e evolução/avaliação de enfermagem.",
          "icon": "UserCheck"
        },
        {
          "label": "Técnico/auxiliar",
          "detail": "Implementação e anotação de cuidados sob supervisão — Art. 5º COFEN 358.",
          "icon": "Users"
        },
        {
          "label": "Processo cíclico",
          "detail": "SAE é contínuo — avaliação retroalimenta nova coleta.",
          "icon": "RefreshCw"
        }
      ],
      "footer_rule": "DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "SAE — 5 etapas integradas",
      "chip_label": "ETAPAS",
      "content": "PROCESSO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "1 — Coleta",
          "value": "Anamnese e dados objetivos/subjetivos",
          "badge": "info"
        },
        {
          "label": "2 — Diagnóstico",
          "value": "Julgamento clínico NANDA — privativo do enfermeiro",
          "badge": "hot"
        },
        {
          "label": "3 — Planejamento",
          "value": "Prescrição de enfermagem (NIC) com metas",
          "badge": "info"
        },
        {
          "label": "4 — Implementação",
          "value": "Execução e anotação de cuidados",
          "badge": "ok"
        },
        {
          "label": "5 — Avaliação",
          "value": "Comparar com NOC — evolução privativa",
          "badge": "hot"
        },
        {
          "label": "Técnico",
          "value": "Implementa e anota — não prescreve diagnóstico",
          "badge": "warn"
        }
      ],
      "footer_rule": "Técnico = implementação + anotação | Enfermeiro = diagnóstico + evolução"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Assinale o conceito a seguir que se refere à \"perspectiva de evolução do paciente e sua resposta às prescrições de enfermagem durante o período de internação\".",
        "Eliminar A: critério da letra A não fecha com COFEN 358.",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar D: critério da letra D não fecha com COFEN 358.",
        "Eliminar E: critério da letra E não fecha com COFEN 358.",
        "Letra C: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra C.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — ETAPAS",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Evolução",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (C)."
        },
        {
          "label": "Letra B",
          "detail": "Prescrição",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (C)."
        },
        {
          "label": "Letra D",
          "detail": "Atividades administrativas",
          "correct": "critério da letra D não fecha com COFEN 358 — por isso não é o gabarito (C)."
        },
        {
          "label": "Letra E",
          "detail": "Plano assistencial",
          "correct": "critério da letra E não fecha com COFEN 358 — por isso não é o gabarito (C)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "avancasp-enfermagem-processo-de-enfermagem-1780006456417-6": {
    "branch": "sae_etapas",
    "family": "conceito",
    "guideline": "5 etapas SAE + competências por categoria",
    "concept_map": {
      "slide_title": "SAE — etapas e competências",
      "chip_label": "ETAPAS SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Na mensuração de circunferência do braço para avaliação antropométrica, a fita métrica deve ser posicionada no ponto médio entre duas referências ósseas.",
          "icon": "Target"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "NANDA-NIC-NOC",
          "detail": "Diagnóstico padronizado, intervenções e resultados mensuráveis.",
          "icon": "Layers"
        },
        {
          "label": "Privativa do enfermeiro",
          "detail": "Diagnóstico, prescrição e evolução/avaliação de enfermagem.",
          "icon": "UserCheck"
        },
        {
          "label": "Técnico/auxiliar",
          "detail": "Implementação e anotação de cuidados sob supervisão — Art. 5º COFEN 358.",
          "icon": "Users"
        },
        {
          "label": "Processo cíclico",
          "detail": "SAE é contínuo — avaliação retroalimenta nova coleta.",
          "icon": "RefreshCw"
        }
      ],
      "footer_rule": "DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "SAE — 5 etapas integradas",
      "chip_label": "ETAPAS",
      "content": "PROCESSO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "1 — Coleta",
          "value": "Anamnese e dados objetivos/subjetivos",
          "badge": "info"
        },
        {
          "label": "2 — Diagnóstico",
          "value": "Julgamento clínico NANDA — privativo do enfermeiro",
          "badge": "hot"
        },
        {
          "label": "3 — Planejamento",
          "value": "Prescrição de enfermagem (NIC) com metas",
          "badge": "info"
        },
        {
          "label": "4 — Implementação",
          "value": "Execução e anotação de cuidados",
          "badge": "ok"
        },
        {
          "label": "5 — Avaliação",
          "value": "Comparar com NOC — evolução privativa",
          "badge": "hot"
        },
        {
          "label": "Técnico",
          "value": "Implementa e anota — não prescreve diagnóstico",
          "badge": "warn"
        }
      ],
      "footer_rule": "Técnico = implementação + anotação | Enfermeiro = diagnóstico + evolução"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Na mensuração de circunferência do braço para avaliação antropométrica, a fita métrica deve ser posicionada no ponto médio entre duas referências ósseas.",
        "Eliminar A: critério da letra A não fecha com COFEN 358.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Eliminar D: critério da letra D não fecha com COFEN 358.",
        "Eliminar E: critério da letra E não fecha com COFEN 358.",
        "Letra B: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra B.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — ETAPAS",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Entre a espinha ilíaca anterossuperior e a patela.",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (B)."
        },
        {
          "label": "Letra C",
          "detail": "Entre o punho e a prega do cotovelo.",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (B)."
        },
        {
          "label": "Letra D",
          "detail": "Entre o maléolo lateral e a cabeça da fíbula.",
          "correct": "critério da letra D não fecha com COFEN 358 — por isso não é o gabarito (B)."
        },
        {
          "label": "Letra E",
          "detail": "Entre o manúbrio e o apêndice xifoide",
          "correct": "critério da letra E não fecha com COFEN 358 — por isso não é o gabarito (B)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "cebraspe-cespe-enfermagem-processo-de-enfermagem-1780001790945-6": {
    "branch": "sae_documentacao",
    "family": "certo_errado",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "EM RELAÇÃO AO REGISTRO DAS AÇÕES DE ENFERMAGEM E AO USO ADEQUADO DO PRONTUÁRIO, JULGUE O PRÓXIMO ITEM.",
          "icon": "Target"
        },
        {
          "label": "Anotação de enfermagem",
          "detail": "Registro factual do cuidado executado pela equipe — integra o prontuário.",
          "icon": "FileText"
        },
        {
          "label": "Integridade",
          "detail": "Legível, cronológico, sem rasura indevida ou registro fictício.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Identificação",
          "detail": "Carimbo, nome legível e assinatura — obrigatórios no documento firmado.",
          "icon": "Stamp"
        },
        {
          "label": "Veracidade",
          "detail": "Registrar no momento do cuidado; vedado anotar o que não foi feito.",
          "icon": "CheckCircle"
        },
        {
          "label": "COFEN 358/2009",
          "detail": "Norma central do registro de enfermagem no Brasil.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Formato Certo/Errado: julgar a afirmativa isolada contra COFEN 358/2009 e Lei 7.498/86.",
        "Núcleo: A documentação do processo de enfermagem deve ser realizada pelos membros da equipe formalmente no…",
        "Afirmativa alinhada à norma de registro e SAE → marcar Certo.",
        "Resposta: Certo.",
        "Fixação: em C/E de SAE — privativa do enfermeiro (diagnóstico + evolução) e prontuário compartilhado são os eixos mais cobrados."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Errado",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Transferência — camadas do registro",
          "detail": "Misturar anotação com evolução ou diagnóstico.",
          "correct": "Anotação registra o executado; evolução/diagnóstico é privativa do enfermeiro."
        },
        {
          "label": "Transferência — momento do registro",
          "detail": "Adiar a anotação para o fim do plantão ou registrar só intercorrências.",
          "correct": "Registro deve ser contemporâneo ao cuidado — não postergar nem omitir ações executadas."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "cebraspe-cespe-enfermagem-processo-de-enfermagem-1780001790945-7": {
    "branch": "sae_documentacao",
    "family": "certo_errado",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "EM RELAÇÃO AO REGISTRO DAS AÇÕES DE ENFERMAGEM E AO USO ADEQUADO DO PRONTUÁRIO, JULGUE O PRÓXIMO ITEM.",
          "icon": "Target"
        },
        {
          "label": "Anotação de enfermagem",
          "detail": "Registro factual do cuidado executado pela equipe — integra o prontuário.",
          "icon": "FileText"
        },
        {
          "label": "Integridade",
          "detail": "Legível, cronológico, sem rasura indevida ou registro fictício.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Identificação",
          "detail": "Carimbo, nome legível e assinatura — obrigatórios no documento firmado.",
          "icon": "Stamp"
        },
        {
          "label": "Veracidade",
          "detail": "Registrar no momento do cuidado; vedado anotar o que não foi feito.",
          "icon": "CheckCircle"
        },
        {
          "label": "COFEN 358/2009",
          "detail": "Norma central do registro de enfermagem no Brasil.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Formato Certo/Errado: julgar a afirmativa isolada contra COFEN 358/2009 e Lei 7.498/86.",
        "Núcleo: O prontuário do paciente é de uso restrito da equipe de saúde, não podendo o próprio paciente ou se…",
        "Afirmativa contraria registro legal, privativa ou acesso ao prontuário → marcar Errado.",
        "Resposta: Errado.",
        "Fixação: em C/E de SAE — privativa do enfermeiro (diagnóstico + evolução) e prontuário compartilhado são os eixos mais cobrados."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Certo",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (B)."
        },
        {
          "label": "Transferência — camadas do registro",
          "detail": "Misturar anotação com evolução ou diagnóstico.",
          "correct": "Anotação registra o executado; evolução/diagnóstico é privativa do enfermeiro."
        },
        {
          "label": "Transferência — momento do registro",
          "detail": "Adiar a anotação para o fim do plantão ou registrar só intercorrências.",
          "correct": "Registro deve ser contemporâneo ao cuidado — não postergar nem omitir ações executadas."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "copese-uft-enfermagem-processo-de-enfermagem-1776056021381-8": {
    "branch": "sae_exceto",
    "family": "certo_errado",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "SAE — pegadinha EXCETO",
      "chip_label": "EXCETO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Comando",
          "detail": "O Processo de Enfermagem (PE) pode ser definido como método de trabalho que orienta o cuidado profissional de enfermagem",
          "icon": "Target"
        },
        {
          "label": "Lógica EXCETO",
          "detail": "Três alternativas corretas + uma exceção — não inverta o raciocínio.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Anotação × evolução",
          "detail": "Técnico anota cuidado; evolução reflexiva é camada distinta.",
          "icon": "FileText"
        },
        {
          "label": "Privativa",
          "detail": "Diagnóstico, prescrição e evolução — enfermeiro (Lei 7.498/86).",
          "icon": "UserCheck"
        },
        {
          "label": "Art. 5º COFEN 358",
          "detail": "Técnico/auxiliar executam o que lhes couber, supervisionados.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "EXCETO: valide cada letra como conduta correta antes de achar a exceção"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "EXCETO — privativa × técnico",
      "chip_label": "PEGADINHA",
      "content": "ANOTAÇÃO DO TÉCNICO — O QUE NÃO ENTRA",
      "rows": [
        {
          "label": "Pode anotar",
          "value": "Cuidados executados, sinais observados, intercorrências",
          "badge": "ok"
        },
        {
          "label": "Não anota",
          "value": "Evolução reflexiva, diagnóstico, anamnese completa formal",
          "badge": "hot"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnóstico, prescrição, evolução/avaliação",
          "badge": "warn"
        },
        {
          "label": "Lei 7.498/86",
          "value": "Art. 11 — privativas do enfermeiro",
          "badge": "info"
        },
        {
          "label": "EXCETO na prova",
          "value": "Três corretas + uma que extrapola competência do técnico",
          "badge": "hot"
        }
      ],
      "footer_rule": "Na dúvida: se exige julgamento clínico privativo → é exceção na anotação do técnico"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando INCORRETA sobre o Processo de Enfermagem — uma alternativa falsa entre quatro verdadeiras.",
        "Confirmar A: PE tem 5 etapas integradas (COFEN 358) — correta.",
        "Confirmar B: cada categoria tem papel no PE — correta.",
        "Confirmar D: lista completa das 5 etapas — correta.",
        "Confirmar E: Art. 5º COFEN 358 — técnico/auxiliar sob supervisão — correta.",
        "Testar C: “técnico participa da implementação e da avaliação” — avaliação de enfermagem é privativa do enfermeiro.",
        "Letra C é a INCORRETA: técnico implementa e anota; não realiza avaliação privativa.",
        "Marcar letra C.",
        "Fixação: implementação = técnico pode; avaliação/evolução = enfermeiro."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — EXCETO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — cinco etapas",
          "detail": "Afirmativa correta sobre estrutura do PE.",
          "correct": "PE = coleta, diagnóstico, planejamento, implementação, avaliação — manter como distrator válido."
        },
        {
          "label": "Letra B — papel da equipe",
          "detail": "Cada profissional tem função no PE.",
          "correct": "Verdadeira: equipe participa conforme competência — não é o gabarito INCORRETA."
        },
        {
          "label": "Letra C — técnico na avaliação",
          "detail": "Pegadinha clássica: mistura implementação com avaliação privativa.",
          "correct": "INCORRETA: avaliação de enfermagem é privativa do enfermeiro — técnico não “avalia” o plano."
        },
        {
          "label": "Letra D — etapas listadas",
          "detail": "Descrição completa e correta das etapas.",
          "correct": "Verdadeira — distrator que confunde por ser texto longo."
        },
        {
          "label": "Letra E — Art. 5º",
          "detail": "Cita a resolução corretamente.",
          "correct": "Verdadeira: execução supervisionada conforme Art. 5º da Res. COFEN 358/2009."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "cotec-fadenor-enfermagem-processo-de-enfermagem-1780002389285-3": {
    "branch": "sae_generico",
    "family": "certo_errado",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "PE — tema ancorado no enunciado",
      "chip_label": "SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Conteúdo programático: Cuidados e administração de medicamentos.",
          "icon": "Target"
        },
        {
          "label": "Implementação",
          "detail": "Etapa em que o técnico executa o cuidado e registra o feito.",
          "icon": "Syringe"
        },
        {
          "label": "Anotação",
          "detail": "Registro factual do procedimento no prontuário — COFEN 358.",
          "icon": "FileText"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "Privativa",
          "detail": "Diagnóstico e evolução — enfermeiro; técnico implementa e anota.",
          "icon": "UserCheck"
        },
        {
          "label": "Segurança",
          "detail": "Técnica correta + registro = continuidade e segurança do paciente.",
          "icon": "ShieldCheck"
        }
      ],
      "footer_rule": "Procedimento técnico integra a etapa de implementação do PE"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Implementação × registro",
      "chip_label": "SAE",
      "content": "CUIDADO TÉCNICO NO PROCESSO DE ENFERMAGEM",
      "rows": [
        {
          "label": "Implementação",
          "value": "Execução do cuidado prescrito/planejado",
          "badge": "ok"
        },
        {
          "label": "Anotação",
          "value": "Registro do que foi feito — prontuário",
          "badge": "info"
        },
        {
          "label": "Técnico",
          "value": "Executa e anota sob supervisão",
          "badge": "warn"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnostica, prescreve e avalia",
          "badge": "hot"
        },
        {
          "label": "COFEN 358",
          "value": "Base do registro de enfermagem",
          "badge": "info"
        }
      ],
      "footer_rule": "Técnica correta + registro = PE completo na prática"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.",
        "Enquadramento: Conteúdo programático: Cuidados e administração de medicamentos.",
        "Letra A: critério da letra A não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra B: critério da letra B não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra C: critério da letra C não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra E: critério da letra E não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra D: única exceção — extrapola competência ou viola norma.",
        "Marcar letra D.",
        "Fixação: em EXCETO de anotação — técnico registra cuidado; evolução/diagnóstico/anamnese completa é privativa ou exceção."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "Via intramuscular.",
          "correct": "Em EXCETO, A é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra B — conduta correta",
          "detail": "Via intratecal.",
          "correct": "Em EXCETO, B é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra C — conduta correta",
          "detail": "Via intravenosa.",
          "correct": "Em EXCETO, C é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra D — exceção (gabarito)",
          "detail": "Via sonda nasoentérica.",
          "correct": "INCORRETA na prova: critério da letra D não fecha com COFEN 358 — esta é a exceção pedida."
        },
        {
          "label": "Letra E — conduta correta",
          "detail": "Via subcutânea.",
          "correct": "Em EXCETO, E é conduta correta: atende norma de registro/SAE."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "cotec-fadenor-enfermagem-processo-de-enfermagem-1780002389285-4": {
    "branch": "sae_generico",
    "family": "vf",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "Vias × início de ação",
      "chip_label": "VIAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Comando",
          "detail": "Julgar I–III sobre início de ação das vias subcutânea, endovenosa e enteral.",
          "icon": "Target"
        },
        {
          "label": "I — subcutânea",
          "detail": "Via SC: absorção mais lenta — início de ação lento vs endovenosa.",
          "icon": "Syringe"
        },
        {
          "label": "II — endovenosa",
          "detail": "Via EV: acesso direto à corrente sanguínea — início rápido.",
          "icon": "Zap"
        },
        {
          "label": "III — enteral",
          "detail": "Via enteral: passa pelo TGI — início não é “rápido”; custo não é critério de início.",
          "icon": "Pill"
        },
        {
          "label": "Implementação PE",
          "detail": "Escolha da via integra planejamento e execução do cuidado medicamentoso.",
          "icon": "GitBranch"
        },
        {
          "label": "Registro",
          "detail": "Via e horário da administração devem constar na anotação de enfermagem.",
          "icon": "FileText"
        }
      ],
      "footer_rule": "Compare início de ação — não confunda enteral com EV"
    },
    "golden_rule": {
      "slide_title": "Referência — início de ação por via",
      "chip_label": "VIAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "INÍCIO DE AÇÃO — SUBCUTÂNEA × ENDOVENOSA × ENTERAL",
      "rows": [
        {
          "label": "Endovenosa",
          "value": "Início imediato/rápido — acesso venoso direto",
          "badge": "hot"
        },
        {
          "label": "Subcutânea",
          "value": "Início mais lento que EV — absorção tecidual",
          "badge": "info"
        },
        {
          "label": "Enteral",
          "value": "Absorção pelo TGI — não é via de ação rápida",
          "badge": "warn"
        },
        {
          "label": "I e II",
          "value": "Verdadeiras nesta questão",
          "badge": "ok"
        },
        {
          "label": "III",
          "value": "Falsa — enteral não tem início rápido “e alto custo” como regra",
          "badge": "hot"
        },
        {
          "label": "Gabarito",
          "value": "Letra B — apenas I e II",
          "badge": "ok"
        }
      ],
      "footer_rule": "EV rápida > SC > enteral (início de ação)"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — VF vias",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler I: subcutânea tem início lento comparada à endovenosa — verdadeira.",
        "Ler II: endovenosa tem início rápido comparada à subcutânea — verdadeira.",
        "Ler III: enteral com início rápido e alto custo — falsa (enteral não é via de ação rápida).",
        "Eliminar alternativas que incluem III (C, D, E).",
        "Eliminar A (só I) — falta II correta.",
        "Letra B: I e II — gabarito.",
        "Marcar letra B.",
        "Fixação: EV = rápida | SC = lenta | enteral ≠ início rápido."
      ],
      "footer_rule": "VF de vias — julgue cada item antes da combinação"
    },
    "danger_zone": {
      "items": [
        {
          "label": "Letra A — só I",
          "detail": "Omite II verdadeira.",
          "correct": "II também está correta — A incompleta."
        },
        {
          "label": "Letra C — I, II e III",
          "detail": "Inclui III falsa.",
          "correct": "Enteral não tem início rápido como afirmado — C errada."
        },
        {
          "label": "Letra D — I e III",
          "detail": "Mantém III falsa.",
          "correct": "III invalida a combinação — D errada."
        },
        {
          "label": "Letra E — II e III",
          "detail": "III falsa pesa contra E.",
          "correct": "Sem III, sobra B (I e II)."
        }
      ],
      "content": "PEGADINHAS — VF VIAS",
      "bullet_style": "x_icon",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Armadilhas — combinações com III",
      "chip_label": "PEGADINHAS",
      "footer_rule": "III é a afirmativa falsa — não marque combinações que a incluem"
    }
  },
  "educa-pb-enfermagem-processo-de-enfermagem-1776056149404-0": {
    "branch": "sae_etapas",
    "family": "vf",
    "guideline": "5 etapas SAE + competências por categoria",
    "concept_map": {
      "slide_title": "SAE — etapas e competências",
      "chip_label": "ETAPAS SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Comando",
          "detail": "Interação terapêutica na dor — conforto e comunicação.",
          "icon": "Target"
        },
        {
          "label": "I — expressão de sentimentos",
          "detail": "Facilitar fala do paciente aumenta sensação de cuidado.",
          "icon": "Heart"
        },
        {
          "label": "II — apoio e tranquilização",
          "detail": "Suporte emocional pode aliviar dor presente ou futura.",
          "icon": "HandHeart"
        },
        {
          "label": "III — educação para alívio",
          "detail": "Ensinar medidas não farmacológicas faz parte do cuidado.",
          "icon": "GraduationCap"
        },
        {
          "label": "Todas corretas",
          "detail": "I, II e III são intervenções de conforto válidas na dor.",
          "icon": "CheckCircle"
        },
        {
          "label": "SAE",
          "detail": "Implementação inclui ações de suporte e educação.",
          "icon": "Layers"
        }
      ],
      "footer_rule": "DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "SAE — 5 etapas integradas",
      "chip_label": "ETAPAS",
      "content": "PROCESSO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "1 — Coleta",
          "value": "Anamnese e dados objetivos/subjetivos",
          "badge": "info"
        },
        {
          "label": "2 — Diagnóstico",
          "value": "Julgamento clínico NANDA — privativo do enfermeiro",
          "badge": "hot"
        },
        {
          "label": "3 — Planejamento",
          "value": "Prescrição de enfermagem (NIC) com metas",
          "badge": "info"
        },
        {
          "label": "4 — Implementação",
          "value": "Execução e anotação de cuidados",
          "badge": "ok"
        },
        {
          "label": "5 — Avaliação",
          "value": "Comparar com NOC — evolução privativa",
          "badge": "hot"
        },
        {
          "label": "Técnico",
          "value": "Implementa e anota — não prescreve diagnóstico",
          "badge": "warn"
        }
      ],
      "footer_rule": "Técnico = implementação + anotação | Enfermeiro = diagnóstico + evolução"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Várias atividades de enfermagem podem ser usadas para auxiliar a pessoa que manifesta dor.",
        "Eliminar A: critério da letra A não fecha com COFEN 358.",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar D: critério da letra D não fecha com COFEN 358.",
        "Eliminar E: critério da letra E não fecha com COFEN 358.",
        "Letra C: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra C.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — ETAPAS",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — só II",
          "detail": "Omite I e III válidas.",
          "correct": "Apoio (II) sozinho não esgota as intervenções de conforto."
        },
        {
          "label": "Letra B — I e III",
          "detail": "Falta o apoio/tranquilização.",
          "correct": "II também é intervenção terapêutica na dor."
        },
        {
          "label": "Letra D — II e III",
          "detail": "Exclui facilitar expressão de sentimentos.",
          "correct": "I é parte do cuidado humanizado na dor."
        },
        {
          "label": "Letra E — só II (repetida)",
          "detail": "Combinação incompleta.",
          "correct": "Gabarito C: I, II e III estão corretas."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "fau-unicentro-enfermagem-processo-de-enfermagem-1776056129848-3": {
    "branch": "sae_etapas",
    "family": "conceito",
    "guideline": "5 etapas SAE + competências por categoria",
    "concept_map": {
      "slide_title": "SAE — etapas e competências",
      "chip_label": "ETAPAS SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "É o processo de analisar e descartar diferentes condições para chegar a um diagnóstico preciso.",
          "icon": "Target"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "NANDA-NIC-NOC",
          "detail": "Diagnóstico padronizado, intervenções e resultados mensuráveis.",
          "icon": "Layers"
        },
        {
          "label": "Privativa do enfermeiro",
          "detail": "Diagnóstico, prescrição e evolução/avaliação de enfermagem.",
          "icon": "UserCheck"
        },
        {
          "label": "Técnico/auxiliar",
          "detail": "Implementação e anotação de cuidados sob supervisão — Art. 5º COFEN 358.",
          "icon": "Users"
        },
        {
          "label": "Processo cíclico",
          "detail": "SAE é contínuo — avaliação retroalimenta nova coleta.",
          "icon": "RefreshCw"
        }
      ],
      "footer_rule": "DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "SAE — 5 etapas integradas",
      "chip_label": "ETAPAS",
      "content": "PROCESSO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "1 — Coleta",
          "value": "Anamnese e dados objetivos/subjetivos",
          "badge": "info"
        },
        {
          "label": "2 — Diagnóstico",
          "value": "Julgamento clínico NANDA — privativo do enfermeiro",
          "badge": "hot"
        },
        {
          "label": "3 — Planejamento",
          "value": "Prescrição de enfermagem (NIC) com metas",
          "badge": "info"
        },
        {
          "label": "4 — Implementação",
          "value": "Execução e anotação de cuidados",
          "badge": "ok"
        },
        {
          "label": "5 — Avaliação",
          "value": "Comparar com NOC — evolução privativa",
          "badge": "hot"
        },
        {
          "label": "Técnico",
          "value": "Implementa e anota — não prescreve diagnóstico",
          "badge": "warn"
        }
      ],
      "footer_rule": "Técnico = implementação + anotação | Enfermeiro = diagnóstico + evolução"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: É o processo de analisar e descartar diferentes condições para chegar a um diagnóstico preciso.",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Eliminar D: critério da letra D não fecha com COFEN 358.",
        "Eliminar E: critério da letra E não fecha com COFEN 358.",
        "Letra A: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra A.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — ETAPAS",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Diagnóstico situacional.",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra C",
          "detail": "Diagnóstico organizacional.",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra D",
          "detail": "Diagnóstico laboratorial.",
          "correct": "critério da letra D não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra E",
          "detail": "Diagnóstico geográfico.",
          "correct": "critério da letra E não fecha com COFEN 358 — por isso não é o gabarito (A)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "fau-unicentro-enfermagem-processo-de-enfermagem-1780009366805-2": {
    "branch": "sae_etapas",
    "family": "conceito",
    "guideline": "5 etapas SAE + competências por categoria",
    "concept_map": {
      "slide_title": "SAE — etapas e competências",
      "chip_label": "ETAPAS SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A escala numérica para avaliação de \"dor\" é pontuada:",
          "icon": "Target"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "NANDA-NIC-NOC",
          "detail": "Diagnóstico padronizado, intervenções e resultados mensuráveis.",
          "icon": "Layers"
        },
        {
          "label": "Privativa do enfermeiro",
          "detail": "Diagnóstico, prescrição e evolução/avaliação de enfermagem.",
          "icon": "UserCheck"
        },
        {
          "label": "Técnico/auxiliar",
          "detail": "Implementação e anotação de cuidados sob supervisão — Art. 5º COFEN 358.",
          "icon": "Users"
        },
        {
          "label": "Processo cíclico",
          "detail": "SAE é contínuo — avaliação retroalimenta nova coleta.",
          "icon": "RefreshCw"
        }
      ],
      "footer_rule": "DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "SAE — 5 etapas integradas",
      "chip_label": "ETAPAS",
      "content": "PROCESSO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "1 — Coleta",
          "value": "Anamnese e dados objetivos/subjetivos",
          "badge": "info"
        },
        {
          "label": "2 — Diagnóstico",
          "value": "Julgamento clínico NANDA — privativo do enfermeiro",
          "badge": "hot"
        },
        {
          "label": "3 — Planejamento",
          "value": "Prescrição de enfermagem (NIC) com metas",
          "badge": "info"
        },
        {
          "label": "4 — Implementação",
          "value": "Execução e anotação de cuidados",
          "badge": "ok"
        },
        {
          "label": "5 — Avaliação",
          "value": "Comparar com NOC — evolução privativa",
          "badge": "hot"
        },
        {
          "label": "Técnico",
          "value": "Implementa e anota — não prescreve diagnóstico",
          "badge": "warn"
        }
      ],
      "footer_rule": "Técnico = implementação + anotação | Enfermeiro = diagnóstico + evolução"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: A escala numérica para avaliação de \"dor\" é pontuada:",
        "Eliminar A: escala numérica de dor usa algarismos arábicos.",
        "Eliminar B: escala numérica de dor usa algarismos arábicos.",
        "Eliminar D: escala numérica de dor usa algarismos arábicos.",
        "Eliminar E: escala numérica de dor usa algarismos arábicos.",
        "Letra C: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra C.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "items": [
        {
          "label": "Letra A — pares",
          "detail": "Restrição inexistente na escala 0–10.",
          "correct": "Escala numérica admite pares e ímpares — A errada."
        },
        {
          "label": "Letra B — ímpares",
          "detail": "Restrição inexistente.",
          "correct": "Não há regra de só ímpares na escala numérica."
        },
        {
          "label": "Letra D — romanos",
          "detail": "Escala não usa numeração romana.",
          "correct": "Dor 0–10 = algarismos arábicos (C)."
        },
        {
          "label": "Letra E — letras",
          "detail": "Escala não é alfabética.",
          "correct": "Pontuação numérica, não letras."
        }
      ],
      "content": "PEGADINHAS — ESCALA NUMÉRICA DE DOR",
      "bullet_style": "x_icon",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Armadilhas — escala 0–10",
      "chip_label": "PEGADINHAS",
      "footer_rule": "Algarismos arábicos na escala numérica"
    }
  },
  "fau-unicentro-enfermagem-processo-de-enfermagem-1780009366805-9": {
    "branch": "sae_etapas",
    "family": "conceito",
    "guideline": "5 etapas SAE + competências por categoria",
    "concept_map": {
      "slide_title": "SAE — etapas e competências",
      "chip_label": "ETAPAS SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Assinale a alternativa que denomina um paciente que desfruta de boa saúde, estando sadio e sem doenças crônicas ou aguda",
          "icon": "Target"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "NANDA-NIC-NOC",
          "detail": "Diagnóstico padronizado, intervenções e resultados mensuráveis.",
          "icon": "Layers"
        },
        {
          "label": "Privativa do enfermeiro",
          "detail": "Diagnóstico, prescrição e evolução/avaliação de enfermagem.",
          "icon": "UserCheck"
        },
        {
          "label": "Técnico/auxiliar",
          "detail": "Implementação e anotação de cuidados sob supervisão — Art. 5º COFEN 358.",
          "icon": "Users"
        },
        {
          "label": "Processo cíclico",
          "detail": "SAE é contínuo — avaliação retroalimenta nova coleta.",
          "icon": "RefreshCw"
        }
      ],
      "footer_rule": "DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "SAE — 5 etapas integradas",
      "chip_label": "ETAPAS",
      "content": "PROCESSO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "1 — Coleta",
          "value": "Anamnese e dados objetivos/subjetivos",
          "badge": "info"
        },
        {
          "label": "2 — Diagnóstico",
          "value": "Julgamento clínico NANDA — privativo do enfermeiro",
          "badge": "hot"
        },
        {
          "label": "3 — Planejamento",
          "value": "Prescrição de enfermagem (NIC) com metas",
          "badge": "info"
        },
        {
          "label": "4 — Implementação",
          "value": "Execução e anotação de cuidados",
          "badge": "ok"
        },
        {
          "label": "5 — Avaliação",
          "value": "Comparar com NOC — evolução privativa",
          "badge": "hot"
        },
        {
          "label": "Técnico",
          "value": "Implementa e anota — não prescreve diagnóstico",
          "badge": "warn"
        }
      ],
      "footer_rule": "Técnico = implementação + anotação | Enfermeiro = diagnóstico + evolução"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Assinale a alternativa que denomina um paciente que desfruta de boa saúde, estando sadio e sem doenças crônicas ou aguda",
        "Eliminar A: estado geral — hígido = paciente sadio.",
        "Eliminar B: estado geral — hígido = paciente sadio.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Eliminar D: critério da letra D não fecha com COFEN 358.",
        "Letra E: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra E.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "items": [
        {
          "label": "Letra A — híbrido",
          "detail": "Termo não usado para paciente sadio.",
          "correct": "Híbrido não define estado de saúde plena."
        },
        {
          "label": "Letra B — hídrico",
          "detail": "Relaciona-se a água/balanço hídrico.",
          "correct": "Hídrico ≠ paciente sem doença conhecida."
        },
        {
          "label": "Letra C — comatoso",
          "detail": "Estado de consciência alterada.",
          "correct": "Comatoso é o oposto de sadio/hígido."
        },
        {
          "label": "Letra D — prostrado",
          "detail": "Fraqueza/extenuação — não “sem doença”.",
          "correct": "Prostrado indica debilidade, não hígido."
        }
      ],
      "content": "PEGADINHAS — ESTADO HÍGIDO",
      "bullet_style": "x_icon",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Armadilhas — vocabulário clínico",
      "chip_label": "PEGADINHAS",
      "footer_rule": "Hígido = sadio, sem doença crônica/aguda conhecida"
    }
  },
  "fenix-instituto-enfermagem-processo-de-enfermagem-1780006480333-5": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Após realizar um procedimento de enfermagem conforme prescrição e rotina institucional, uma conduta técnica e ética indi",
          "icon": "Target"
        },
        {
          "label": "Anotação de enfermagem",
          "detail": "Registro factual do cuidado executado pela equipe — integra o prontuário.",
          "icon": "FileText"
        },
        {
          "label": "Integridade",
          "detail": "Legível, cronológico, sem rasura indevida ou registro fictício.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Identificação",
          "detail": "Carimbo, nome legível e assinatura — obrigatórios no documento firmado.",
          "icon": "Stamp"
        },
        {
          "label": "Veracidade",
          "detail": "Registrar no momento do cuidado; vedado anotar o que não foi feito.",
          "icon": "CheckCircle"
        },
        {
          "label": "COFEN 358/2009",
          "detail": "Norma central do registro de enfermagem no Brasil.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Após realizar um procedimento de enfermagem conforme prescrição e rotina institucional, uma conduta técnica e ética indi",
        "Eliminar A: critério da letra A não fecha com COFEN 358.",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Letra D: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra D.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "aguardar intercorrência antes de anotar.",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra B",
          "detail": "comunicar oralmente e omitir o registro.",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra C",
          "detail": "delegar o registro a acompanhante presente.",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (D)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "funatec-enfermagem-processo-de-enfermagem-1776055865890-3": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Por que a anotação de enfermagem é considerada uma responsabilidade legal dos profissionais:",
          "icon": "Target"
        },
        {
          "label": "Anotação de enfermagem",
          "detail": "Registro factual do cuidado executado pela equipe — integra o prontuário.",
          "icon": "FileText"
        },
        {
          "label": "Integridade",
          "detail": "Legível, cronológico, sem rasura indevida ou registro fictício.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Identificação",
          "detail": "Carimbo, nome legível e assinatura — obrigatórios no documento firmado.",
          "icon": "Stamp"
        },
        {
          "label": "Veracidade",
          "detail": "Registrar no momento do cuidado; vedado anotar o que não foi feito.",
          "icon": "CheckCircle"
        },
        {
          "label": "COFEN 358/2009",
          "detail": "Norma central do registro de enfermagem no Brasil.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Por que a anotação de enfermagem é considerada uma responsabilidade legal dos profissionais:",
        "Eliminar A: motivo financeiro não fundamenta responsabilidade legal.",
        "Eliminar B: registro não é opcional na SAE.",
        "Eliminar D: nega dever legal de documentar.",
        "Letra C: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra C.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Porque é um requisito para obter aumento salarial.",
          "correct": "motivo financeiro não fundamenta responsabilidade legal — por isso não é o gabarito (C)."
        },
        {
          "label": "Letra B",
          "detail": "Porque é uma prática opcional que não possui obrigatoriedade legal.",
          "correct": "registro não é opcional na SAE — por isso não é o gabarito (C)."
        },
        {
          "label": "Letra D",
          "detail": "Porque os profissionais de enfermagem não são responsáveis pela documentação.",
          "correct": "nega dever legal de documentar — por isso não é o gabarito (C)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "funatec-enfermagem-processo-de-enfermagem-1776055865890-5": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "O que considerar ao escrever diferentes tipos de anotação de enfermagem:",
          "icon": "Target"
        },
        {
          "label": "Anotação de enfermagem",
          "detail": "Registro factual do cuidado executado pela equipe — integra o prontuário.",
          "icon": "FileText"
        },
        {
          "label": "Integridade",
          "detail": "Legível, cronológico, sem rasura indevida ou registro fictício.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Identificação",
          "detail": "Carimbo, nome legível e assinatura — obrigatórios no documento firmado.",
          "icon": "Stamp"
        },
        {
          "label": "Veracidade",
          "detail": "Registrar no momento do cuidado; vedado anotar o que não foi feito.",
          "icon": "CheckCircle"
        },
        {
          "label": "COFEN 358/2009",
          "detail": "Norma central do registro de enfermagem no Brasil.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: O que considerar ao escrever diferentes tipos de anotação de enfermagem:",
        "Eliminar A: critério da letra A não fecha com COFEN 358.",
        "Eliminar B: anotação não se limita à queixa.",
        "Eliminar D: contexto muda o formato do registro.",
        "Letra C: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra C.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "As anotações devem conter apenas informações sobre os procedimentos cirúrgicos…",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (C)."
        },
        {
          "label": "Letra B",
          "detail": "Deve-se considerar apenas as queixas do paciente, ignorando outros detalhes.",
          "correct": "anotação não se limita à queixa — por isso não é o gabarito (C)."
        },
        {
          "label": "Letra D",
          "detail": "Todas as anotações devem ser iguais, independente do contexto do paciente.",
          "correct": "contexto muda o formato do registro — por isso não é o gabarito (C)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "funatec-enfermagem-processo-de-enfermagem-1776055865890-6": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Quais são as regras para realizar a anotação de enfermagem:",
          "icon": "Target"
        },
        {
          "label": "Anotação de enfermagem",
          "detail": "Registro factual do cuidado executado pela equipe — integra o prontuário.",
          "icon": "FileText"
        },
        {
          "label": "Integridade",
          "detail": "Legível, cronológico, sem rasura indevida ou registro fictício.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Identificação",
          "detail": "Carimbo, nome legível e assinatura — obrigatórios no documento firmado.",
          "icon": "Stamp"
        },
        {
          "label": "Veracidade",
          "detail": "Registrar no momento do cuidado; vedado anotar o que não foi feito.",
          "icon": "CheckCircle"
        },
        {
          "label": "COFEN 358/2009",
          "detail": "Norma central do registro de enfermagem no Brasil.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Quais são as regras para realizar a anotação de enfermagem:",
        "Eliminar A: nega dever legal de documentar.",
        "Eliminar B: integridade exige registro permanente.",
        "Eliminar C: norma exige clareza e completude.",
        "Letra D: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra D.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Não é necessário realizar anotações após os cuidados prestados.",
          "correct": "nega dever legal de documentar — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra B",
          "detail": "É permitido utilizar lápis para fazer anotações, desde que seja bem legível.",
          "correct": "integridade exige registro permanente — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra C",
          "detail": "As anotações devem ser incompletas e pouco claras para evitar problemas legais.",
          "correct": "norma exige clareza e completude — por isso não é o gabarito (D)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "funatec-enfermagem-processo-de-enfermagem-1776056173194-0": {
    "branch": "sae_etapas",
    "family": "conceito",
    "guideline": "5 etapas SAE + competências por categoria",
    "concept_map": {
      "slide_title": "SAE — etapas e competências",
      "chip_label": "ETAPAS SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A enfermagem é uma área ampla que envolve diversas competências e conhecimentos.",
          "icon": "Target"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "NANDA-NIC-NOC",
          "detail": "Diagnóstico padronizado, intervenções e resultados mensuráveis.",
          "icon": "Layers"
        },
        {
          "label": "Privativa do enfermeiro",
          "detail": "Diagnóstico, prescrição e evolução/avaliação de enfermagem.",
          "icon": "UserCheck"
        },
        {
          "label": "Técnico/auxiliar",
          "detail": "Implementação e anotação de cuidados sob supervisão — Art. 5º COFEN 358.",
          "icon": "Users"
        },
        {
          "label": "Processo cíclico",
          "detail": "SAE é contínuo — avaliação retroalimenta nova coleta.",
          "icon": "RefreshCw"
        }
      ],
      "footer_rule": "DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "SAE — 5 etapas integradas",
      "chip_label": "ETAPAS",
      "content": "PROCESSO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "1 — Coleta",
          "value": "Anamnese e dados objetivos/subjetivos",
          "badge": "info"
        },
        {
          "label": "2 — Diagnóstico",
          "value": "Julgamento clínico NANDA — privativo do enfermeiro",
          "badge": "hot"
        },
        {
          "label": "3 — Planejamento",
          "value": "Prescrição de enfermagem (NIC) com metas",
          "badge": "info"
        },
        {
          "label": "4 — Implementação",
          "value": "Execução e anotação de cuidados",
          "badge": "ok"
        },
        {
          "label": "5 — Avaliação",
          "value": "Comparar com NOC — evolução privativa",
          "badge": "hot"
        },
        {
          "label": "Técnico",
          "value": "Implementa e anota — não prescreve diagnóstico",
          "badge": "warn"
        }
      ],
      "footer_rule": "Técnico = implementação + anotação | Enfermeiro = diagnóstico + evolução"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: A enfermagem é uma área ampla que envolve diversas competências e conhecimentos.",
        "Eliminar A: critério da letra A não fecha com COFEN 358.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Eliminar D: critério da letra D não fecha com COFEN 358.",
        "Eliminar E: critério da letra E não fecha com COFEN 358.",
        "Letra B: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra B.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — ETAPAS",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Avaliação.",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (B)."
        },
        {
          "label": "Letra C",
          "detail": "Planejamento.",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (B)."
        },
        {
          "label": "Letra D",
          "detail": "Implementação.",
          "correct": "critério da letra D não fecha com COFEN 358 — por isso não é o gabarito (B)."
        },
        {
          "label": "Letra E",
          "detail": "Análise.",
          "correct": "critério da letra E não fecha com COFEN 358 — por isso não é o gabarito (B)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "fundatec-enfermagem-processo-de-enfermagem-1780011961798-0": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Durante a anamnese de um paciente, o técnico de enfermagem observa que o paciente relata não conseguir perceber cheiros,",
          "icon": "Target"
        },
        {
          "label": "Anotação de enfermagem",
          "detail": "Registro factual do cuidado executado pela equipe — integra o prontuário.",
          "icon": "FileText"
        },
        {
          "label": "Integridade",
          "detail": "Legível, cronológico, sem rasura indevida ou registro fictício.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Identificação",
          "detail": "Carimbo, nome legível e assinatura — obrigatórios no documento firmado.",
          "icon": "Stamp"
        },
        {
          "label": "Veracidade",
          "detail": "Registrar no momento do cuidado; vedado anotar o que não foi feito.",
          "icon": "CheckCircle"
        },
        {
          "label": "COFEN 358/2009",
          "detail": "Norma central do registro de enfermagem no Brasil.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Durante a anamnese de um paciente, o técnico de enfermagem observa que o paciente relata não conseguir perceber cheiros,",
        "Eliminar A: perda do paladar — não olfato.",
        "Eliminar B: alteração do paladar.",
        "Eliminar C: perda da visão.",
        "Letra D: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra D.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — ageusia",
          "detail": "Alteração do paladar.",
          "correct": "Ageusia = paladar; olfato = anosmia (D)."
        },
        {
          "label": "Letra B — disgeusia",
          "detail": "Distúrbio do paladar.",
          "correct": "Disgeusia não descreve perda de olfato."
        },
        {
          "label": "Letra C — amaurose",
          "detail": "Relaciona-se à visão.",
          "correct": "Amaurose = olhos; enunciado fala em cheiros."
        },
        {
          "label": "Letra D — anosmia",
          "detail": "Perda/diminuição do olfato.",
          "correct": "Termo técnico para registrar na anamnese/coleta de dados."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "fundepes-copeve-ufal-enfermagem-processo-de-enfermagem-1776056149404-3": {
    "branch": "sae_etapas",
    "family": "vf",
    "guideline": "5 etapas SAE + competências por categoria",
    "concept_map": {
      "slide_title": "Registros evidenciam o PE",
      "chip_label": "ETAPAS SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Comando",
          "detail": "Afirmativas I–V sobre registros de enfermagem.",
          "icon": "Target"
        },
        {
          "label": "I — defesa legal",
          "detail": "Documentos legais da equipe de enfermagem.",
          "icon": "Scale"
        },
        {
          "label": "II — comparar respostas",
          "detail": "Acompanhar resposta do paciente aos cuidados.",
          "icon": "TrendingUp"
        },
        {
          "label": "III — evidencia PE",
          "detail": "Registros documentam o Processo de Enfermagem.",
          "icon": "GitBranch"
        },
        {
          "label": "IV — ensino/pesquisa",
          "detail": "Subsidiam ensino, pesquisa, extensão e auditoria.",
          "icon": "BookOpen"
        },
        {
          "label": "V — comunicação",
          "detail": "Comunicação entre equipe multiprofissional.",
          "icon": "MessageSquare"
        }
      ],
      "footer_rule": "Todas as funções dos registros estão corretas nesta prova"
    },
    "golden_rule": {
      "slide_title": "Registros × etapas SAE",
      "chip_label": "ETAPAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "REGISTROS NO PROCESSO DE ENFERMAGEM",
      "rows": [
        {
          "label": "Coleta/implementação",
          "value": "Registros documentam ações das etapas",
          "badge": "info"
        },
        {
          "label": "Avaliação",
          "value": "Comparar respostas retroalimenta o PE",
          "badge": "hot"
        },
        {
          "label": "PE evidenciado",
          "value": "III — registros mostram o método SAE",
          "badge": "ok"
        },
        {
          "label": "Todas corretas",
          "value": "I, II, III, IV e V nesta questão",
          "badge": "hot"
        }
      ],
      "footer_rule": "Registro documenta o PE em todas as dimensões cobradas"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Dadas as afirmativas sobre os registros de enfermagem, I.",
        "Eliminar A: critério da letra A não fecha com COFEN 358.",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Eliminar D: critério da letra D não fecha com COFEN 358.",
        "Letra E: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra E.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "items": [
        {
          "label": "Letra A — só III",
          "detail": "Omite funções legais e comunicação.",
          "correct": "I, II, IV e V também estão corretas — A incompleta."
        },
        {
          "label": "Letra B — II e V",
          "detail": "Falta I, III e IV.",
          "correct": "Combinação parcial — gabarito é E (todas)."
        },
        {
          "label": "Letra C — I, III e IV",
          "detail": "Exclui II e V.",
          "correct": "II (comparar respostas) e V (comunicação) também corretas."
        },
        {
          "label": "Letra D — I, II e IV",
          "detail": "Exclui III e V.",
          "correct": "III evidencia PE e V é comunicação — também corretas."
        }
      ],
      "content": "PEGADINHAS — VF REGISTROS",
      "bullet_style": "x_icon",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Armadilhas — combinações parciais",
      "chip_label": "PEGADINHAS",
      "footer_rule": "Quando todas I–V estão corretas, marque E"
    }
  },
  "fundepes-copeve-ufal-enfermagem-processo-de-enfermagem-1776056173194-1": {
    "branch": "sae_documentacao",
    "family": "vf",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Comando",
          "detail": "Dadas as afirmativas sobre as técnicas e procedimentos de admissão e alta, I.",
          "icon": "Target"
        },
        {
          "label": "I — admissão/alta",
          "detail": "Admissão padronizada; alta médica registrada; avaliação de enfermagem na admissão.",
          "icon": "LogIn"
        },
        {
          "label": "II — registros legais",
          "detail": "Documentos legais, continuidade do cuidado, comunicação e auditoria.",
          "icon": "FileText"
        },
        {
          "label": "III — PE evidenciado",
          "detail": "Registros evidenciam o Processo de Enfermagem no prontuário.",
          "icon": "GitBranch"
        },
        {
          "label": "IV — ensino/pesquisa",
          "detail": "Subsidiam ensino, pesquisa, extensão e auditoria quando ética permitir.",
          "icon": "BookOpen"
        },
        {
          "label": "COFEN 358",
          "detail": "Registro formal no prontuário físico ou eletrônico.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Dadas as afirmativas sobre as técnicas e procedimentos de admissão e alta, I.",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Eliminar D: critério da letra D não fecha com COFEN 358.",
        "Eliminar E: critério da letra E não fecha com COFEN 358.",
        "Letra A: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra A.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "l e Ill",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra C",
          "detail": "Il e ll",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra D",
          "detail": "Il e IV.",
          "correct": "critério da letra D não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra E",
          "detail": "I, llI e lV.",
          "correct": "critério da letra E não fecha com COFEN 358 — por isso não é o gabarito (A)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "fundepes-copeve-ufal-enfermagem-processo-de-enfermagem-1776056173194-4": {
    "branch": "sae_documentacao",
    "family": "vf",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Comando",
          "detail": "Afirmativas sobre registros de enfermagem I–IV.",
          "icon": "Target"
        },
        {
          "label": "I — ação de enfermagem",
          "detail": "Registro produz relato escrito de dados, decisões e respostas do paciente.",
          "icon": "FileText"
        },
        {
          "label": "II — vital no prontuário",
          "detail": "Registro preciso e abrangente na prática.",
          "icon": "Heart"
        },
        {
          "label": "III — qualidade do cuidado",
          "detail": "Relato resume o nível de qualidade prestado.",
          "icon": "BarChart"
        },
        {
          "label": "IV — continuidade e segurança",
          "detail": "Registro eficaz assegura continuidade e reduz erros.",
          "icon": "ShieldCheck"
        },
        {
          "label": "COFEN 358",
          "detail": "Documentação formal do Processo de Enfermagem.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Dadas as afirmativas sobre os registros de enfermagem, I.",
        "Eliminar A: critério da letra A não fecha com COFEN 358.",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Eliminar E: critério da letra E não fecha com COFEN 358.",
        "Letra D: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra D.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "III, apenas.",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra B",
          "detail": "I e IV, apenas.",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra C",
          "detail": "II e III, apenas.",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra E",
          "detail": "I, II, III e IV.",
          "correct": "critério da letra E não fecha com COFEN 358 — por isso não é o gabarito (D)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "furb-enfermagem-processo-de-enfermagem-1780011908736-0": {
    "branch": "sae_generico",
    "family": "conceito",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "PE — tema ancorado no enunciado",
      "chip_label": "SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A administração de medicamentos requer atenção quanto ao calibre e comprimento da agulha utilizada para garantir eficácia do fármaco e segurança do paciente.",
          "icon": "Target"
        },
        {
          "label": "Implementação",
          "detail": "Etapa em que o técnico executa o cuidado e registra o feito.",
          "icon": "Syringe"
        },
        {
          "label": "Anotação",
          "detail": "Registro factual do procedimento no prontuário — COFEN 358.",
          "icon": "FileText"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "Privativa",
          "detail": "Diagnóstico e evolução — enfermeiro; técnico implementa e anota.",
          "icon": "UserCheck"
        },
        {
          "label": "Segurança",
          "detail": "Técnica correta + registro = continuidade e segurança do paciente.",
          "icon": "ShieldCheck"
        }
      ],
      "footer_rule": "Procedimento técnico integra a etapa de implementação do PE"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Implementação × registro",
      "chip_label": "SAE",
      "content": "CUIDADO TÉCNICO NO PROCESSO DE ENFERMAGEM",
      "rows": [
        {
          "label": "Implementação",
          "value": "Execução do cuidado prescrito/planejado",
          "badge": "ok"
        },
        {
          "label": "Anotação",
          "value": "Registro do que foi feito — prontuário",
          "badge": "info"
        },
        {
          "label": "Técnico",
          "value": "Executa e anota sob supervisão",
          "badge": "warn"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnostica, prescreve e avalia",
          "badge": "hot"
        },
        {
          "label": "COFEN 358",
          "value": "Base do registro de enfermagem",
          "badge": "info"
        }
      ],
      "footer_rule": "Técnica correta + registro = PE completo na prática"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: A administração de medicamentos requer atenção quanto ao calibre e comprimento da agulha utilizada para garantir eficácia do fármaco e segurança do paciente.",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Eliminar D: critério da letra D não fecha com COFEN 358.",
        "Eliminar E: critério da letra E não fecha com COFEN 358.",
        "Letra A: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra A.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "13 x 8 mm.",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra C",
          "detail": "25 x 7 mm.",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra D",
          "detail": "40 x 12 mm.",
          "correct": "critério da letra D não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra E",
          "detail": "30 x 8 mm.",
          "correct": "critério da letra E não fecha com COFEN 358 — por isso não é o gabarito (A)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "furb-enfermagem-processo-de-enfermagem-1780011908736-6": {
    "branch": "sae_generico",
    "family": "vf",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "Técnica em Z — IM",
      "chip_label": "IM",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Contexto",
          "detail": "Via intramuscular (IM) — Técnica em Z para reduzir extravasamento/irritação.",
          "icon": "Target"
        },
        {
          "label": "I — parenteral",
          "detail": "Técnica em Z é administração parenteral por via IM.",
          "icon": "Syringe"
        },
        {
          "label": "II — deslocamento",
          "detail": "Pele e subcutâneo movidos lateralmente antes da injeção.",
          "icon": "Move"
        },
        {
          "label": "III — avaliar",
          "detail": "Julgar se descreve corretamente a sequência da técnica em Z.",
          "icon": "Search"
        },
        {
          "label": "IV — selante",
          "detail": "Após retirar agulha, pele retorna selando o trajeto — reduz vazamento.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Implementação",
          "detail": "Técnica correta integra etapa de implementação do PE + anotação.",
          "icon": "FileText"
        }
      ],
      "footer_rule": "Técnica em Z = deslocar pele → injetar → soltar para selar"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Implementação × registro",
      "chip_label": "SAE",
      "content": "CUIDADO TÉCNICO NO PROCESSO DE ENFERMAGEM",
      "rows": [
        {
          "label": "Implementação",
          "value": "Execução do cuidado prescrito/planejado",
          "badge": "ok"
        },
        {
          "label": "Anotação",
          "value": "Registro do que foi feito — prontuário",
          "badge": "info"
        },
        {
          "label": "Técnico",
          "value": "Executa e anota sob supervisão",
          "badge": "warn"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnostica, prescreve e avalia",
          "badge": "hot"
        },
        {
          "label": "COFEN 358",
          "value": "Base do registro de enfermagem",
          "badge": "info"
        }
      ],
      "footer_rule": "Técnica correta + registro = PE completo na prática"
    },
    "logic_flow": {
      "reveal_mode": "tap",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "steps": [
        "I: Técnica em Z é parenteral/IM — verdadeira.",
        "II: deslocamento lateral da pele e subcutâneo — verdadeira.",
        "III: julgar conforme enunciado — falsa se contradizer a técnica.",
        "IV: selamento do trajeto ao liberar a pele — verdadeira.",
        "Combinação correta: I, II e IV.",
        "Eliminar alternativas que incluem III ou omitem II/IV.",
        "Marcar letra B.",
        "Fixação: Z reduz extravasamento na IM."
      ],
      "footer_rule": "Parenteral IM — não confunda com SC ou ID"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "I, II, III e IV.",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (B)."
        },
        {
          "label": "Letra C",
          "detail": "III e IV, apenas.",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (B)."
        },
        {
          "label": "Letra D",
          "detail": "I e II, apenas.",
          "correct": "critério da letra D não fecha com COFEN 358 — por isso não é o gabarito (B)."
        },
        {
          "label": "Letra E",
          "detail": "III, apenas.",
          "correct": "critério da letra E não fecha com COFEN 358 — por isso não é o gabarito (B)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "furb-enfermagem-processo-de-enfermagem-1780011915153-1": {
    "branch": "sae_generico",
    "family": "conceito",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "PE — tema ancorado no enunciado",
      "chip_label": "SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Os medicamentos podem ser administrados por diferentes vias, sendo a via intramuscular (IM) uma das mais utilizadas.",
          "icon": "Target"
        },
        {
          "label": "Implementação",
          "detail": "Etapa em que o técnico executa o cuidado e registra o feito.",
          "icon": "Syringe"
        },
        {
          "label": "Anotação",
          "detail": "Registro factual do procedimento no prontuário — COFEN 358.",
          "icon": "FileText"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "Privativa",
          "detail": "Diagnóstico e evolução — enfermeiro; técnico implementa e anota.",
          "icon": "UserCheck"
        },
        {
          "label": "Segurança",
          "detail": "Técnica correta + registro = continuidade e segurança do paciente.",
          "icon": "ShieldCheck"
        }
      ],
      "footer_rule": "Procedimento técnico integra a etapa de implementação do PE"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Implementação × registro",
      "chip_label": "SAE",
      "content": "CUIDADO TÉCNICO NO PROCESSO DE ENFERMAGEM",
      "rows": [
        {
          "label": "Implementação",
          "value": "Execução do cuidado prescrito/planejado",
          "badge": "ok"
        },
        {
          "label": "Anotação",
          "value": "Registro do que foi feito — prontuário",
          "badge": "info"
        },
        {
          "label": "Técnico",
          "value": "Executa e anota sob supervisão",
          "badge": "warn"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnostica, prescreve e avalia",
          "badge": "hot"
        },
        {
          "label": "COFEN 358",
          "value": "Base do registro de enfermagem",
          "badge": "info"
        }
      ],
      "footer_rule": "Técnica correta + registro = PE completo na prática"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Os medicamentos podem ser administrados por diferentes vias, sendo a via intramuscular (IM) uma das mais utilizadas.",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Eliminar D: critério da letra D não fecha com COFEN 358.",
        "Eliminar E: critério da letra E não fecha com COFEN 358.",
        "Letra A: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra A.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "I, II, III e IV.",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra C",
          "detail": "I, II e IV, apenas.",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra D",
          "detail": "II e III, apenas.",
          "correct": "critério da letra D não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra E",
          "detail": "III, apenas.",
          "correct": "critério da letra E não fecha com COFEN 358 — por isso não é o gabarito (A)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "furb-enfermagem-processo-de-enfermagem-1780011915153-2": {
    "branch": "sae_etapas",
    "family": "conceito",
    "guideline": "5 etapas SAE + competências por categoria",
    "concept_map": {
      "slide_title": "SAE — etapas e competências",
      "chip_label": "ETAPAS SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A dor é considerada o quinto sinal vital e deve ser avaliada rotineiramente em todos os pacientes.",
          "icon": "Target"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "NANDA-NIC-NOC",
          "detail": "Diagnóstico padronizado, intervenções e resultados mensuráveis.",
          "icon": "Layers"
        },
        {
          "label": "Privativa do enfermeiro",
          "detail": "Diagnóstico, prescrição e evolução/avaliação de enfermagem.",
          "icon": "UserCheck"
        },
        {
          "label": "Técnico/auxiliar",
          "detail": "Implementação e anotação de cuidados sob supervisão — Art. 5º COFEN 358.",
          "icon": "Users"
        },
        {
          "label": "Processo cíclico",
          "detail": "SAE é contínuo — avaliação retroalimenta nova coleta.",
          "icon": "RefreshCw"
        }
      ],
      "footer_rule": "DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "SAE — 5 etapas integradas",
      "chip_label": "ETAPAS",
      "content": "PROCESSO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "1 — Coleta",
          "value": "Anamnese e dados objetivos/subjetivos",
          "badge": "info"
        },
        {
          "label": "2 — Diagnóstico",
          "value": "Julgamento clínico NANDA — privativo do enfermeiro",
          "badge": "hot"
        },
        {
          "label": "3 — Planejamento",
          "value": "Prescrição de enfermagem (NIC) com metas",
          "badge": "info"
        },
        {
          "label": "4 — Implementação",
          "value": "Execução e anotação de cuidados",
          "badge": "ok"
        },
        {
          "label": "5 — Avaliação",
          "value": "Comparar com NOC — evolução privativa",
          "badge": "hot"
        },
        {
          "label": "Técnico",
          "value": "Implementa e anota — não prescreve diagnóstico",
          "badge": "warn"
        }
      ],
      "footer_rule": "Técnico = implementação + anotação | Enfermeiro = diagnóstico + evolução"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: A dor é considerada o quinto sinal vital e deve ser avaliada rotineiramente em todos os pacientes.",
        "Eliminar A: critério da letra A não fecha com COFEN 358.",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Eliminar E: critério da letra E não fecha com COFEN 358.",
        "Letra D: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra D.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — ETAPAS",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Escala Likert.",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra B",
          "detail": "Escala de Borg.",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra C",
          "detail": "Questionário de Dor de McGill.",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra E",
          "detail": "Escala Numérica de 0 a 10.",
          "correct": "critério da letra E não fecha com COFEN 358 — por isso não é o gabarito (D)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "idecan-enfermagem-processo-de-enfermagem-1778712122855-5": {
    "branch": "sae_documentacao",
    "family": "certo_errado",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Prestar cuidados de enfermagem ao paciente diabético hospitalizado, como monitorar frequentemente a glicemia capilar, co",
          "icon": "Target"
        },
        {
          "label": "Anotação de enfermagem",
          "detail": "Registro factual do cuidado executado pela equipe — integra o prontuário.",
          "icon": "FileText"
        },
        {
          "label": "Integridade",
          "detail": "Legível, cronológico, sem rasura indevida ou registro fictício.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Identificação",
          "detail": "Carimbo, nome legível e assinatura — obrigatórios no documento firmado.",
          "icon": "Stamp"
        },
        {
          "label": "Veracidade",
          "detail": "Registrar no momento do cuidado; vedado anotar o que não foi feito.",
          "icon": "CheckCircle"
        },
        {
          "label": "COFEN 358/2009",
          "detail": "Norma central do registro de enfermagem no Brasil.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Formato Certo/Errado: julgar a afirmativa isolada contra COFEN 358/2009 e Lei 7.498/86.",
        "Núcleo: Prestar cuidados de enfermagem ao paciente diabético hospitalizado, como monitorar frequentemente a…",
        "Afirmativa alinhada à norma de registro e SAE → marcar Certo.",
        "Resposta: Certo.",
        "Fixação: em C/E de SAE — privativa do enfermeiro (diagnóstico + evolução) e prontuário compartilhado são os eixos mais cobrados."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Errado",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Transferência — camadas do registro",
          "detail": "Misturar anotação com evolução ou diagnóstico.",
          "correct": "Anotação registra o executado; evolução/diagnóstico é privativa do enfermeiro."
        },
        {
          "label": "Transferência — momento do registro",
          "detail": "Adiar a anotação para o fim do plantão ou registrar só intercorrências.",
          "correct": "Registro deve ser contemporâneo ao cuidado — não postergar nem omitir ações executadas."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "idib-enfermagem-nocoes-de-fisiologia-1778934944659-8": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Considerando as diretrizes sobre os registros de enfermagem e sua importância legal e clínica, assinale a alternativa correta.",
          "icon": "Target"
        },
        {
          "label": "Anotação de enfermagem",
          "detail": "Registro factual do cuidado executado pela equipe — integra o prontuário.",
          "icon": "FileText"
        },
        {
          "label": "Integridade",
          "detail": "Legível, cronológico, sem rasura indevida ou registro fictício.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Identificação",
          "detail": "Carimbo, nome legível e assinatura — obrigatórios no documento firmado.",
          "icon": "Stamp"
        },
        {
          "label": "Veracidade",
          "detail": "Registrar no momento do cuidado; vedado anotar o que não foi feito.",
          "icon": "CheckCircle"
        },
        {
          "label": "COFEN 358/2009",
          "detail": "Norma central do registro de enfermagem no Brasil.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Registro legal",
          "value": "Protege profissionais e paciente — autenticidade importa",
          "badge": "hot"
        },
        {
          "label": "PE no prontuário",
          "value": "Evolução de enfermagem integra o método SAE",
          "badge": "ok"
        },
        {
          "label": "Equipe registra",
          "value": "Técnico/auxiliar registram cuidados executados",
          "badge": "info"
        },
        {
          "label": "Pegadinha B",
          "value": "Percentual fixo sem critério normativo na COFEN",
          "badge": "warn"
        },
        {
          "label": "Privativa",
          "value": "Instrumento metodológico do enfermeiro — não monopólio do prontuário",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando: alternativa correta sobre registros de enfermagem e PE.",
        "Eliminar A: autenticidade legal não é secundária à precisão.",
        "Eliminar B: percentual fixo não é critério normativo de prova.",
        "Eliminar D: técnico/auxiliar também registram cuidados executados.",
        "Letra C: PE com evolução como instrumento metodológico do enfermeiro — coerente.",
        "Marcar letra C.",
        "Fixação: registro legal + PE documentado — sem inventar números na alternativa."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "items": [
        {
          "label": "Letra A — autenticidade secundária",
          "detail": "Minimiza valor legal do registro.",
          "correct": "Autenticidade e significado legal são centrais — A errada."
        },
        {
          "label": "Letra B — percentual inventado",
          "detail": "Distrator numérico sem base COFEN.",
          "correct": "Não decore percentuais — B errada."
        },
        {
          "label": "Letra D — só enfermeiro registra",
          "detail": "Exclui técnico/auxiliar do prontuário.",
          "correct": "Equipe registra o que executa — D errada."
        },
        {
          "label": "Letra C — PE e evolução",
          "detail": "Gabarito: método e evolução de enfermagem.",
          "correct": "C correta: PE documentado com evolução privativa do enfermeiro."
        }
      ],
      "content": "PEGADINHAS — REGISTRO E PE",
      "bullet_style": "x_icon",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Armadilhas — registro legal",
      "chip_label": "PEGADINHAS",
      "footer_rule": "Sem número inventado — julgue competência e PE"
    }
  },
  "igeduc-enfermagem-processo-de-enfermagem-1780010566816-2": {
    "branch": "sae_generico",
    "family": "conceito",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "Vias na Atenção Básica",
      "chip_label": "VIAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Vias influenciam absorção, ação terapêutica e segurança do paciente.",
          "icon": "Target"
        },
        {
          "label": "Atenção Básica",
          "detail": "Técnico conhece indicações, cuidados e técnicas de cada via.",
          "icon": "Home"
        },
        {
          "label": "Prescrição",
          "detail": "Seguir prescrição médica/enfermagem e protocolos institucionais.",
          "icon": "ClipboardList"
        },
        {
          "label": "Segurança",
          "detail": "Princípios de segurança do paciente — evitar eventos adversos.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Eficácia",
          "detail": "Via correta garante eficácia terapêutica esperada.",
          "icon": "CheckCircle"
        },
        {
          "label": "PE",
          "detail": "Administração = implementação; registrar via, hora e intercorrências.",
          "icon": "FileText"
        }
      ],
      "footer_rule": "Via certa + técnica certa + registro = cuidado seguro"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Implementação × registro",
      "chip_label": "SAE",
      "content": "CUIDADO TÉCNICO NO PROCESSO DE ENFERMAGEM",
      "rows": [
        {
          "label": "Implementação",
          "value": "Execução do cuidado prescrito/planejado",
          "badge": "ok"
        },
        {
          "label": "Anotação",
          "value": "Registro do que foi feito — prontuário",
          "badge": "info"
        },
        {
          "label": "Técnico",
          "value": "Executa e anota sob supervisão",
          "badge": "warn"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnostica, prescreve e avalia",
          "badge": "hot"
        },
        {
          "label": "COFEN 358",
          "value": "Base do registro de enfermagem",
          "badge": "info"
        }
      ],
      "footer_rule": "Técnica correta + registro = PE completo na prática"
    },
    "logic_flow": {
      "reveal_mode": "tap",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "steps": [
        "Comando: conduta correta sobre escolha/uso de vias na Atenção Básica.",
        "Priorizar alternativa que cita prescrição + características do medicamento + condição do paciente.",
        "Eliminar opções que ignoram prescrição ou protocolo institucional.",
        "Eliminar alternativas que violam segurança do paciente.",
        "Letra C: escolha da via deve respeitar prescrição, fármaco e paciente.",
        "Marcar letra C.",
        "Fixação: nunca trocar via sem avaliação/prescrição."
      ],
      "footer_rule": "AB: técnico executa conforme prescrição validada"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "A via de administração pode ser alterada pelo profissional conforme a disponibi…",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (C)."
        },
        {
          "label": "Letra B",
          "detail": "As diferentes vias de administração não interferem na velocidade de absorção do…",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (C)."
        },
        {
          "label": "Letra D",
          "detail": "A administração por via oral dispensa cuidados relacionados à posição e ao níve…",
          "correct": "critério da letra D não fecha com COFEN 358 — por isso não é o gabarito (C)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "inaz-do-para-enfermagem-processo-de-enfermagem-1776056140199-7": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "Itens do registro — o que é essencial",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Comando NÃO essencial",
          "detail": "Buscar o item que pode faltar sem violar norma técnica.",
          "icon": "Target"
        },
        {
          "label": "Data/hora",
          "detail": "Marca temporal — essencial.",
          "icon": "Clock"
        },
        {
          "label": "Identificação do paciente",
          "detail": "Vincula o registro ao titular do cuidado.",
          "icon": "User"
        },
        {
          "label": "Descrição do procedimento",
          "detail": "Objetividade do que foi feito.",
          "icon": "FileText"
        },
        {
          "label": "Assinatura",
          "detail": "Autoria profissional obrigatória.",
          "icon": "Stamp"
        },
        {
          "label": "Opinião pessoal",
          "detail": "Subjetividade/julgamento de valor — não entra na anotação técnica.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Registro = fato técnico, não opinião"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: No registro de enfermagem, qual dos seguintes itens NÃO é essencial?",
        "Eliminar A: marca temporal obrigatória.",
        "Eliminar B: identificação do paciente é essencial.",
        "Eliminar C: objetividade do procedimento é exigida.",
        "Eliminar D: autoria deve constar no documento.",
        "Letra E: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra E.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "items": [
        {
          "label": "Letra A — data/hora",
          "detail": "Essencial para cronologia.",
          "correct": "Data e hora são obrigatórias — não é o NÃO essencial."
        },
        {
          "label": "Letra B — nome do paciente",
          "detail": "Identificação do titular.",
          "correct": "Nome completo vincula o registro — essencial."
        },
        {
          "label": "Letra C — descrição",
          "detail": "Núcleo da anotação.",
          "correct": "Descrição objetiva do procedimento é essencial."
        },
        {
          "label": "Letra D — assinatura",
          "detail": "Autoria no documento.",
          "correct": "Assinatura identifica o executor — essencial."
        },
        {
          "label": "Letra E — opinião pessoal",
          "detail": "Gabarito: julgamento subjetivo.",
          "correct": "Opinião pessoal não é requisito técnico do registro — é o NÃO essencial."
        }
      ],
      "content": "PEGADINHAS — ITENS DO REGISTRO",
      "bullet_style": "x_icon",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Armadilhas — essencial × opinião",
      "chip_label": "PEGADINHAS",
      "footer_rule": "Opinião ≠ dado de enfermagem"
    }
  },
  "instituto-access-enfermagem-processo-de-enfermagem-1776056140199-2": {
    "branch": "sae_exceto",
    "family": "certo_errado",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "SAE — pegadinha EXCETO",
      "chip_label": "EXCETO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Comando",
          "detail": "A anotação de enfermagem é fundamental para o desenvolvimento do Processo de Enfermagem (PE).",
          "icon": "Target"
        },
        {
          "label": "Lógica EXCETO",
          "detail": "Três alternativas corretas + uma exceção — não inverta o raciocínio.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Anotação × evolução",
          "detail": "Técnico anota cuidado; evolução reflexiva é camada distinta.",
          "icon": "FileText"
        },
        {
          "label": "Privativa",
          "detail": "Diagnóstico, prescrição e evolução — enfermeiro (Lei 7.498/86).",
          "icon": "UserCheck"
        },
        {
          "label": "Art. 5º COFEN 358",
          "detail": "Técnico/auxiliar executam o que lhes couber, supervisionados.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "EXCETO: valide cada letra como conduta correta antes de achar a exceção"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "EXCETO — privativa × técnico",
      "chip_label": "PEGADINHA",
      "content": "ANOTAÇÃO DO TÉCNICO — O QUE NÃO ENTRA",
      "rows": [
        {
          "label": "Pode anotar",
          "value": "Cuidados executados, sinais observados, intercorrências",
          "badge": "ok"
        },
        {
          "label": "Não anota",
          "value": "Evolução reflexiva, diagnóstico, anamnese completa formal",
          "badge": "hot"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnóstico, prescrição, evolução/avaliação",
          "badge": "warn"
        },
        {
          "label": "Lei 7.498/86",
          "value": "Art. 11 — privativas do enfermeiro",
          "badge": "info"
        },
        {
          "label": "EXCETO na prova",
          "value": "Três corretas + uma que extrapola competência do técnico",
          "badge": "hot"
        }
      ],
      "footer_rule": "Na dúvida: se exige julgamento clínico privativo → é exceção na anotação do técnico"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.",
        "Enquadramento: A anotação de enfermagem é fundamental para o desenvolvimento do Processo de Enfermagem (PE).",
        "Letra A: critério da letra A não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra C: critério da letra C não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra D: critério da letra D não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra B: única exceção — extrapola competência ou viola norma.",
        "Marcar letra B.",
        "Fixação: em EXCETO de anotação — técnico registra cuidado; evolução/diagnóstico/anamnese completa é privativa ou exceção."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — EXCETO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "Não conter termos que deem conotação de valor (bem, mal, muito, pouco, etc.).",
          "correct": "Em EXCETO, A é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra B — exceção (gabarito)",
          "detail": "O técnico ou auxiliar de enfermagem devem anotar dados referentes ao exame físi…",
          "correct": "INCORRETA na prova: critério da letra B não fecha com COFEN 358 — esta é a exceção pedida."
        },
        {
          "label": "Letra C — conduta correta",
          "detail": "Não conter rasuras, entrelinhas, linhas em branco ou espaços, ou seja, deve ser…",
          "correct": "Em EXCETO, C é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra D — conduta correta",
          "detail": "Devem ser referentes aos dados simples, que não requeiram maior aprofundamento…",
          "correct": "Em EXCETO, D é conduta correta: atende norma de registro/SAE."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "instituto-aocp-enfermagem-processo-de-enfermagem-1776056140199-3": {
    "branch": "sae_exceto",
    "family": "certo_errado",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "SAE — pegadinha EXCETO",
      "chip_label": "EXCETO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Comando",
          "detail": "O técnico de enfermagem da clínica médica, ao realizar as anotações de enfermagem relacionadas aos cuidados prestados ao",
          "icon": "Target"
        },
        {
          "label": "Lógica EXCETO",
          "detail": "Três alternativas corretas + uma exceção — não inverta o raciocínio.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Anotação × evolução",
          "detail": "Técnico anota cuidado; evolução reflexiva é camada distinta.",
          "icon": "FileText"
        },
        {
          "label": "Privativa",
          "detail": "Diagnóstico, prescrição e evolução — enfermeiro (Lei 7.498/86).",
          "icon": "UserCheck"
        },
        {
          "label": "Art. 5º COFEN 358",
          "detail": "Técnico/auxiliar executam o que lhes couber, supervisionados.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "EXCETO: valide cada letra como conduta correta antes de achar a exceção"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "EXCETO — privativa × técnico",
      "chip_label": "PEGADINHA",
      "content": "ANOTAÇÃO DO TÉCNICO — O QUE NÃO ENTRA",
      "rows": [
        {
          "label": "Pode anotar",
          "value": "Cuidados executados, sinais observados, intercorrências",
          "badge": "ok"
        },
        {
          "label": "Não anota",
          "value": "Evolução reflexiva, diagnóstico, anamnese completa formal",
          "badge": "hot"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnóstico, prescrição, evolução/avaliação",
          "badge": "warn"
        },
        {
          "label": "Lei 7.498/86",
          "value": "Art. 11 — privativas do enfermeiro",
          "badge": "info"
        },
        {
          "label": "EXCETO na prova",
          "value": "Três corretas + uma que extrapola competência do técnico",
          "badge": "hot"
        }
      ],
      "footer_rule": "Na dúvida: se exige julgamento clínico privativo → é exceção na anotação do técnico"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.",
        "Enquadramento: O técnico de enfermagem da clínica médica, ao realizar as anotações de enfermagem relacionadas aos cuidados prestados ao",
        "Letra A: critério da letra A não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra C: critério da letra C não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra D: critério da letra D não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra B: única exceção — extrapola competência ou viola norma.",
        "Marcar letra B.",
        "Fixação: em EXCETO de anotação — técnico registra cuidado; evolução/diagnóstico/anamnese completa é privativa ou exceção."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — EXCETO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "anotar de forma sequencial, sem rasuras, entrelinhas, linhas em branco ou espaç…",
          "correct": "Em EXCETO, A é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra B — exceção (gabarito)",
          "detail": "anotar dados referentes ao exame físico do paciente, como abdome distendido, ti…",
          "correct": "INCORRETA na prova: critério da letra B não fecha com COFEN 358 — esta é a exceção pedida."
        },
        {
          "label": "Letra C — conduta correta",
          "detail": "anotar as observações efetuadas e os cuidados prestados, sejam eles os já padro…",
          "correct": "Em EXCETO, C é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra D — conduta correta",
          "detail": "realizar o registro imediatamente após o cuidado prestado, orientação fornecida…",
          "correct": "Em EXCETO, D é conduta correta: atende norma de registro/SAE."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "instituto-aocp-enfermagem-processo-de-enfermagem-1776056140199-4": {
    "branch": "sae_etapas",
    "family": "conceito",
    "guideline": "5 etapas SAE + competências por categoria",
    "concept_map": {
      "slide_title": "SAE — etapas e competências",
      "chip_label": "ETAPAS SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Uma técnica de enfermagem está cuidando de um paciente em seu 2o dia de internação por suspeita de pneumonia.",
          "icon": "Target"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "NANDA-NIC-NOC",
          "detail": "Diagnóstico padronizado, intervenções e resultados mensuráveis.",
          "icon": "Layers"
        },
        {
          "label": "Privativa do enfermeiro",
          "detail": "Diagnóstico, prescrição e evolução/avaliação de enfermagem.",
          "icon": "UserCheck"
        },
        {
          "label": "Técnico/auxiliar",
          "detail": "Implementação e anotação de cuidados sob supervisão — Art. 5º COFEN 358.",
          "icon": "Users"
        },
        {
          "label": "Processo cíclico",
          "detail": "SAE é contínuo — avaliação retroalimenta nova coleta.",
          "icon": "RefreshCw"
        }
      ],
      "footer_rule": "DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "SAE — 5 etapas integradas",
      "chip_label": "ETAPAS",
      "content": "PROCESSO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "1 — Coleta",
          "value": "Anamnese e dados objetivos/subjetivos",
          "badge": "info"
        },
        {
          "label": "2 — Diagnóstico",
          "value": "Julgamento clínico NANDA — privativo do enfermeiro",
          "badge": "hot"
        },
        {
          "label": "3 — Planejamento",
          "value": "Prescrição de enfermagem (NIC) com metas",
          "badge": "info"
        },
        {
          "label": "4 — Implementação",
          "value": "Execução e anotação de cuidados",
          "badge": "ok"
        },
        {
          "label": "5 — Avaliação",
          "value": "Comparar com NOC — evolução privativa",
          "badge": "hot"
        },
        {
          "label": "Técnico",
          "value": "Implementa e anota — não prescreve diagnóstico",
          "badge": "warn"
        }
      ],
      "footer_rule": "Técnico = implementação + anotação | Enfermeiro = diagnóstico + evolução"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Uma técnica de enfermagem está cuidando de um paciente em seu 2o dia de internação por suspeita de pneumonia.",
        "Eliminar B: prescrição é privativa do enfermeiro.",
        "Eliminar C: supervisão de auxiliar é do enfermeiro.",
        "Eliminar D: diagnóstico não é do técnico.",
        "Letra A: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra A.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — ETAPAS",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B — prescrição",
          "detail": "Técnico não elabora prescrição de enfermagem.",
          "correct": "Prescrição/planejamento é privativa do enfermeiro — B errada."
        },
        {
          "label": "Letra C — supervisão de auxiliar",
          "detail": "Orientar auxiliar é papel do enfermeiro.",
          "correct": "Técnico não substitui enfermeiro na supervisão — C errada."
        },
        {
          "label": "Letra D — diagnóstico",
          "detail": "Formulação de diagnóstico exige enfermeiro.",
          "correct": "Diagnóstico de enfermagem não é do técnico — D errada."
        },
        {
          "label": "Letra A — gabarito",
          "detail": "Anotação + implementação + checagem supervisionadas.",
          "correct": "Única correta: participação do técnico conforme Res. COFEN 358."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "instituto-aocp-enfermagem-processo-de-enfermagem-1780003868364-8": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "O Processo de Enfermagem deve ser realizado pelos membros da equipe formalmente no prontuário do paciente.",
          "icon": "Target"
        },
        {
          "label": "Anotação de enfermagem",
          "detail": "Registro factual do cuidado executado pela equipe — integra o prontuário.",
          "icon": "FileText"
        },
        {
          "label": "Integridade",
          "detail": "Legível, cronológico, sem rasura indevida ou registro fictício.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Identificação",
          "detail": "Carimbo, nome legível e assinatura — obrigatórios no documento firmado.",
          "icon": "Stamp"
        },
        {
          "label": "Veracidade",
          "detail": "Registrar no momento do cuidado; vedado anotar o que não foi feito.",
          "icon": "CheckCircle"
        },
        {
          "label": "COFEN 358/2009",
          "detail": "Norma central do registro de enfermagem no Brasil.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: O Processo de Enfermagem deve ser realizado pelos membros da equipe formalmente no prontuário do paciente.",
        "Eliminar A: critério da letra A não fecha com COFEN 358.",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Eliminar E: critério da letra E não fecha com COFEN 358.",
        "Letra D: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra D.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "apenas I, II e III.",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra B",
          "detail": "apenas I e IV.",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra C",
          "detail": "apenas II e III.",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra E",
          "detail": "apenas III e IV.",
          "correct": "critério da letra E não fecha com COFEN 358 — por isso não é o gabarito (D)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "instituto-aocp-enfermagem-processo-de-enfermagem-1780003950945-8": {
    "branch": "sae_generico",
    "family": "conceito",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "IM ventroglútea — passos",
      "chip_label": "IM",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Tema",
          "detail": "Técnica correta de IM na região ventroglútea.",
          "icon": "Target"
        },
        {
          "label": "1 — trocânter",
          "detail": "Espalmar a mão sobre a base do trocânter maior do fêmur.",
          "icon": "Hand"
        },
        {
          "label": "2 — EIAS",
          "detail": "Localizar espinha ilíaca anterossuperior com indicador ou médio.",
          "icon": "MapPin"
        },
        {
          "label": "3 — triângulo",
          "detail": "Injetar no centro do triângulo formado pelos dedos em “V”.",
          "icon": "Triangle"
        },
        {
          "label": "4 — extensão",
          "detail": "Estender dedo médio/indicador ao longo da linha ilíaca.",
          "icon": "MoveHorizontal"
        },
        {
          "label": "Registro",
          "detail": "Documentar local (ventroglútea), hora e medicamento administrado.",
          "icon": "FileText"
        }
      ],
      "footer_rule": "Ordem dos passos define segurança na ventroglútea"
    },
    "golden_rule": {
      "slide_title": "Sequência ventroglútea",
      "chip_label": "IM",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "TÉCNICA VENTROGLÚTEA — ORDEM DOS PASSOS",
      "rows": [
        {
          "label": "Passo 1",
          "value": "Mão sobre trocânter maior",
          "badge": "info"
        },
        {
          "label": "Passo 2",
          "value": "Palpar espinha ilíaca anterossuperior",
          "badge": "info"
        },
        {
          "label": "Passo 4",
          "value": "Estender dedo ao longo da linha ilíaca",
          "badge": "warn"
        },
        {
          "label": "Passo 3",
          "value": "Injetar no centro do triângulo em V",
          "badge": "hot"
        },
        {
          "label": "Gabarito",
          "value": "1 – 2 – 4 – 3 (letra D)",
          "badge": "ok"
        }
      ],
      "footer_rule": "Localizar antes de injetar — sequência importa na prova"
    },
    "logic_flow": {
      "reveal_mode": "tap",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "steps": [
        "Identificar região ventroglútea como sítio da IM.",
        "Passo 1: mão sobre trocânter maior — primeiro.",
        "Passo 2: localizar EIAS — segundo.",
        "Passo 4: estender dedo na linha ilíaca — antes da injeção no triângulo.",
        "Passo 3: injeção no centro do triângulo em V — após demarcar.",
        "Sequência correta: 1 – 2 – 4 – 3.",
        "Marcar letra D.",
        "Fixação: demarcar anatomia → depois punção."
      ],
      "footer_rule": "Ventroglútea = Hochstetter — técnica de triângulo"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "1 – 2 – 3 – 4.",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra B",
          "detail": "3 – 2 – 1 – 4.",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra C",
          "detail": "2 – 1 – 4 – 3.",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra E",
          "detail": "4 – 3 – 2 – 1.",
          "correct": "critério da letra E não fecha com COFEN 358 — por isso não é o gabarito (D)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "instituto-aocp-enfermagem-processo-de-enfermagem-1780005320352-9": {
    "branch": "sae_etapas",
    "family": "conceito",
    "guideline": "5 etapas SAE + competências por categoria",
    "concept_map": {
      "slide_title": "SAE — etapas e competências",
      "chip_label": "ETAPAS SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Sob a supervisão e a orientação do enfermeiro, os técnicos de enfermagem participam do processo de enfermagem, com",
          "icon": "Target"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "NANDA-NIC-NOC",
          "detail": "Diagnóstico padronizado, intervenções e resultados mensuráveis.",
          "icon": "Layers"
        },
        {
          "label": "Privativa do enfermeiro",
          "detail": "Diagnóstico, prescrição e evolução/avaliação de enfermagem.",
          "icon": "UserCheck"
        },
        {
          "label": "Técnico/auxiliar",
          "detail": "Implementação e anotação de cuidados sob supervisão — Art. 5º COFEN 358.",
          "icon": "Users"
        },
        {
          "label": "Processo cíclico",
          "detail": "SAE é contínuo — avaliação retroalimenta nova coleta.",
          "icon": "RefreshCw"
        }
      ],
      "footer_rule": "DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "SAE — 5 etapas integradas",
      "chip_label": "ETAPAS",
      "content": "PROCESSO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "1 — Coleta",
          "value": "Anamnese e dados objetivos/subjetivos",
          "badge": "info"
        },
        {
          "label": "2 — Diagnóstico",
          "value": "Julgamento clínico NANDA — privativo do enfermeiro",
          "badge": "hot"
        },
        {
          "label": "3 — Planejamento",
          "value": "Prescrição de enfermagem (NIC) com metas",
          "badge": "info"
        },
        {
          "label": "4 — Implementação",
          "value": "Execução e anotação de cuidados",
          "badge": "ok"
        },
        {
          "label": "5 — Avaliação",
          "value": "Comparar com NOC — evolução privativa",
          "badge": "hot"
        },
        {
          "label": "Técnico",
          "value": "Implementa e anota — não prescreve diagnóstico",
          "badge": "warn"
        }
      ],
      "footer_rule": "Técnico = implementação + anotação | Enfermeiro = diagnóstico + evolução"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Sob a supervisão e a orientação do enfermeiro, os técnicos de enfermagem participam do processo de enfermagem, com",
        "Eliminar B: julgamento clínico é privativa.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Eliminar D: avaliação de enfermagem é do enfermeiro.",
        "Eliminar E: decisão terapêutica não cabe ao técnico.",
        "Letra A: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra A.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — ETAPAS",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "o julgamento clínico das informações obtidas e prescrição das necessidades do c…",
          "correct": "julgamento clínico é privativa — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra C",
          "detail": "diagnóstico de enfermagem e identificação de problemas existentes.",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra D",
          "detail": "avaliação dos resultados alcançados, considerando o plano assistencial.",
          "correct": "avaliação de enfermagem é do enfermeiro — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra E",
          "detail": "tomada de decisão terapêutica, declarada pela prescrição de enfermagem.",
          "correct": "decisão terapêutica não cabe ao técnico — por isso não é o gabarito (A)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "instituto-aocp-enfermagem-processo-de-enfermagem-1780005556782-1": {
    "branch": "sae_exceto",
    "family": "certo_errado",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "SAE — pegadinha EXCETO",
      "chip_label": "EXCETO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Comando",
          "detail": "São anotações de enfermagem realizadas pelo técnico de enfermagem, EXCETO",
          "icon": "Target"
        },
        {
          "label": "Lógica EXCETO",
          "detail": "Três alternativas corretas + uma exceção — não inverta o raciocínio.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Anotação × evolução",
          "detail": "Técnico anota cuidado; evolução reflexiva é camada distinta.",
          "icon": "FileText"
        },
        {
          "label": "Privativa",
          "detail": "Diagnóstico, prescrição e evolução — enfermeiro (Lei 7.498/86).",
          "icon": "UserCheck"
        },
        {
          "label": "Art. 5º COFEN 358",
          "detail": "Técnico/auxiliar executam o que lhes couber, supervisionados.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "EXCETO: valide cada letra como conduta correta antes de achar a exceção"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "EXCETO — privativa × técnico",
      "chip_label": "PEGADINHA",
      "content": "ANOTAÇÃO DO TÉCNICO — O QUE NÃO ENTRA",
      "rows": [
        {
          "label": "Pode anotar",
          "value": "Cuidados executados, sinais observados, intercorrências",
          "badge": "ok"
        },
        {
          "label": "Não anota",
          "value": "Evolução reflexiva, diagnóstico, anamnese completa formal",
          "badge": "hot"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnóstico, prescrição, evolução/avaliação",
          "badge": "warn"
        },
        {
          "label": "Lei 7.498/86",
          "value": "Art. 11 — privativas do enfermeiro",
          "badge": "info"
        },
        {
          "label": "EXCETO na prova",
          "value": "Três corretas + uma que extrapola competência do técnico",
          "badge": "hot"
        }
      ],
      "footer_rule": "Na dúvida: se exige julgamento clínico privativo → é exceção na anotação do técnico"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.",
        "Enquadramento: São anotações de enfermagem realizadas pelo técnico de enfermagem, EXCETO",
        "Letra A: critério da letra A não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra B: critério da letra B não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra D: critério da letra D não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra E: critério da letra E não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra C: única exceção — extrapola competência ou viola norma.",
        "Marcar letra C.",
        "Fixação: em EXCETO de anotação — técnico registra cuidado; evolução/diagnóstico/anamnese completa é privativa ou exceção."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — EXCETO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "registro de todos os cuidados prestados.",
          "correct": "Em EXCETO, A é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra B — conduta correta",
          "detail": "registro de sinais e sintomas.",
          "correct": "Em EXCETO, B é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra C — exceção (gabarito)",
          "detail": "registro completo e formal da anamnese e exame físico.",
          "correct": "INCORRETA na prova: critério da letra C não fecha com COFEN 358 — esta é a exceção pedida."
        },
        {
          "label": "Letra D — conduta correta",
          "detail": "registro das respostas do paciente/cliente às ações realizadas.",
          "correct": "Em EXCETO, D é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra E — conduta correta",
          "detail": "registro das intercorrências.",
          "correct": "Em EXCETO, E é conduta correta: atende norma de registro/SAE."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "instituto-consulpam-enfermagem-processo-de-enfermagem-1776056149404-6": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Segundo Potter (2013), um prontuário médico é uma fonte valiosa de dados para toda a equipe de saúde.",
          "icon": "Target"
        },
        {
          "label": "Anotação de enfermagem",
          "detail": "Registro factual do cuidado executado pela equipe — integra o prontuário.",
          "icon": "FileText"
        },
        {
          "label": "Integridade",
          "detail": "Legível, cronológico, sem rasura indevida ou registro fictício.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Identificação",
          "detail": "Carimbo, nome legível e assinatura — obrigatórios no documento firmado.",
          "icon": "Stamp"
        },
        {
          "label": "Veracidade",
          "detail": "Registrar no momento do cuidado; vedado anotar o que não foi feito.",
          "icon": "CheckCircle"
        },
        {
          "label": "COFEN 358/2009",
          "detail": "Norma central do registro de enfermagem no Brasil.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Segundo Potter (2013), um prontuário médico é uma fonte valiosa de dados para toda a equipe de saúde.",
        "Eliminar B: prontuário é multiprofissional.",
        "Eliminar C: enfermagem deve registrar cuidados.",
        "Eliminar D: funções do prontuário mal descritas.",
        "Letra A: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra A.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "É de uso exclusivo da equipe médica, com apresentação de prescrições e diagnóst…",
          "correct": "prontuário é multiprofissional — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra C",
          "detail": "No prontuário médico, não há a necessidade de registro diário da equipe de enfe…",
          "correct": "enfermagem deve registrar cuidados — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra D",
          "detail": "Prontuários não podem, em hipótese alguma, ser usados como fontes de pesquisas…",
          "correct": "funções do prontuário mal descritas — por isso não é o gabarito (A)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "instituto-consulpam-enfermagem-processo-de-enfermagem-1780006486032-4": {
    "branch": "sae_generico",
    "family": "conceito",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "PE — tema ancorado no enunciado",
      "chip_label": "SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Durante a administração de um medicamento por via Intramuscular (IM) em um paciente adulto, o Auxiliar de Enfermagem dev",
          "icon": "Target"
        },
        {
          "label": "Implementação",
          "detail": "Etapa em que o técnico executa o cuidado e registra o feito.",
          "icon": "Syringe"
        },
        {
          "label": "Anotação",
          "detail": "Registro factual do procedimento no prontuário — COFEN 358.",
          "icon": "FileText"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "Privativa",
          "detail": "Diagnóstico e evolução — enfermeiro; técnico implementa e anota.",
          "icon": "UserCheck"
        },
        {
          "label": "Segurança",
          "detail": "Técnica correta + registro = continuidade e segurança do paciente.",
          "icon": "ShieldCheck"
        }
      ],
      "footer_rule": "Procedimento técnico integra a etapa de implementação do PE"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Implementação × registro",
      "chip_label": "SAE",
      "content": "CUIDADO TÉCNICO NO PROCESSO DE ENFERMAGEM",
      "rows": [
        {
          "label": "Implementação",
          "value": "Execução do cuidado prescrito/planejado",
          "badge": "ok"
        },
        {
          "label": "Anotação",
          "value": "Registro do que foi feito — prontuário",
          "badge": "info"
        },
        {
          "label": "Técnico",
          "value": "Executa e anota sob supervisão",
          "badge": "warn"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnostica, prescreve e avalia",
          "badge": "hot"
        },
        {
          "label": "COFEN 358",
          "value": "Base do registro de enfermagem",
          "badge": "info"
        }
      ],
      "footer_rule": "Técnica correta + registro = PE completo na prática"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Durante a administração de um medicamento por via Intramuscular (IM) em um paciente adulto, o Auxiliar de Enfermagem dev",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Eliminar D: critério da letra D não fecha com COFEN 358.",
        "Letra A: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra A.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "O músculo deltoide pode ser utilizado para qualquer volume de medicamento por v…",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra C",
          "detail": "O local dorsoglúteo é o mais seguro para a administração intramuscular, pois nã…",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra D",
          "detail": "A via intramuscular não oferece riscos significativos ao paciente, desde que o…",
          "correct": "critério da letra D não fecha com COFEN 358 — por isso não é o gabarito (A)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "instituto-iacp-enfermagem-processo-de-enfermagem-1780003349182-5": {
    "branch": "sae_generico",
    "family": "certo_errado",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "PE — tema ancorado no enunciado",
      "chip_label": "SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A região dorsoglútea (quadrante superior externo da nádega) tem sido cada vez menos recomendada, embora ainda utilizada.",
          "icon": "Target"
        },
        {
          "label": "Implementação",
          "detail": "Etapa em que o técnico executa o cuidado e registra o feito.",
          "icon": "Syringe"
        },
        {
          "label": "Anotação",
          "detail": "Registro factual do procedimento no prontuário — COFEN 358.",
          "icon": "FileText"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "Privativa",
          "detail": "Diagnóstico e evolução — enfermeiro; técnico implementa e anota.",
          "icon": "UserCheck"
        },
        {
          "label": "Segurança",
          "detail": "Técnica correta + registro = continuidade e segurança do paciente.",
          "icon": "ShieldCheck"
        }
      ],
      "footer_rule": "Procedimento técnico integra a etapa de implementação do PE"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Implementação × registro",
      "chip_label": "SAE",
      "content": "CUIDADO TÉCNICO NO PROCESSO DE ENFERMAGEM",
      "rows": [
        {
          "label": "Implementação",
          "value": "Execução do cuidado prescrito/planejado",
          "badge": "ok"
        },
        {
          "label": "Anotação",
          "value": "Registro do que foi feito — prontuário",
          "badge": "info"
        },
        {
          "label": "Técnico",
          "value": "Executa e anota sob supervisão",
          "badge": "warn"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnostica, prescreve e avalia",
          "badge": "hot"
        },
        {
          "label": "COFEN 358",
          "value": "Base do registro de enfermagem",
          "badge": "info"
        }
      ],
      "footer_rule": "Técnica correta + registro = PE completo na prática"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.",
        "Enquadramento: A região dorsoglútea (quadrante superior externo da nádega) tem sido cada vez menos recomendada, embora ainda utilizada.",
        "Letra A: critério da letra A não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra C: critério da letra C não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra D: critério da letra D não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra E: critério da letra E não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra B: única exceção — extrapola competência ou viola norma.",
        "Marcar letra B.",
        "Fixação: em EXCETO de anotação — técnico registra cuidado; evolução/diagnóstico/anamnese completa é privativa ou exceção."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "femoral.",
          "correct": "Em EXCETO, A é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra B — exceção (gabarito)",
          "detail": "ciático.",
          "correct": "INCORRETA na prova: critério da letra B não fecha com COFEN 358 — esta é a exceção pedida."
        },
        {
          "label": "Letra C — conduta correta",
          "detail": "obturatório.",
          "correct": "Em EXCETO, C é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra D — conduta correta",
          "detail": "pudendo.",
          "correct": "Em EXCETO, D é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra E — conduta correta",
          "detail": "fibular comum.",
          "correct": "Em EXCETO, E é conduta correta: atende norma de registro/SAE."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "instituto-iacp-enfermagem-processo-de-enfermagem-1780004280851-4": {
    "branch": "sae_generico",
    "family": "conceito",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "PE — tema ancorado no enunciado",
      "chip_label": "SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A administração de medicamentos pela via intramuscular requer conhecimento anatômico preciso para evitar lesões neurovasculares.",
          "icon": "Target"
        },
        {
          "label": "Implementação",
          "detail": "Etapa em que o técnico executa o cuidado e registra o feito.",
          "icon": "Syringe"
        },
        {
          "label": "Anotação",
          "detail": "Registro factual do procedimento no prontuário — COFEN 358.",
          "icon": "FileText"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "Privativa",
          "detail": "Diagnóstico e evolução — enfermeiro; técnico implementa e anota.",
          "icon": "UserCheck"
        },
        {
          "label": "Segurança",
          "detail": "Técnica correta + registro = continuidade e segurança do paciente.",
          "icon": "ShieldCheck"
        }
      ],
      "footer_rule": "Procedimento técnico integra a etapa de implementação do PE"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Implementação × registro",
      "chip_label": "SAE",
      "content": "CUIDADO TÉCNICO NO PROCESSO DE ENFERMAGEM",
      "rows": [
        {
          "label": "Implementação",
          "value": "Execução do cuidado prescrito/planejado",
          "badge": "ok"
        },
        {
          "label": "Anotação",
          "value": "Registro do que foi feito — prontuário",
          "badge": "info"
        },
        {
          "label": "Técnico",
          "value": "Executa e anota sob supervisão",
          "badge": "warn"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnostica, prescreve e avalia",
          "badge": "hot"
        },
        {
          "label": "COFEN 358",
          "value": "Base do registro de enfermagem",
          "badge": "info"
        }
      ],
      "footer_rule": "Técnica correta + registro = PE completo na prática"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: A administração de medicamentos pela via intramuscular requer conhecimento anatômico preciso para evitar lesões neurovasculares.",
        "Eliminar A: critério da letra A não fecha com COFEN 358.",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar C: critério da letra C não fecha com COFEN 358.",
        "Eliminar E: critério da letra E não fecha com COFEN 358.",
        "Letra D: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra D.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "deltoide.",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra B",
          "detail": "glúteo máximo.",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra C",
          "detail": "vasto lateral.",
          "correct": "critério da letra C não fecha com COFEN 358 — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra E",
          "detail": "reto femoral.",
          "correct": "critério da letra E não fecha com COFEN 358 — por isso não é o gabarito (D)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "instituto-ibed-enfermagem-processo-de-enfermagem-1780004926596-0": {
    "branch": "sae_generico",
    "family": "certo_errado",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "PE — tema ancorado no enunciado",
      "chip_label": "SAE",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A administração de medicamentos por via intradérmica, como no caso do teste tuberculínico (PPD), deve ser realizada com ",
          "icon": "Target"
        },
        {
          "label": "Implementação",
          "detail": "Etapa em que o técnico executa o cuidado e registra o feito.",
          "icon": "Syringe"
        },
        {
          "label": "Anotação",
          "detail": "Registro factual do procedimento no prontuário — COFEN 358.",
          "icon": "FileText"
        },
        {
          "label": "5 etapas",
          "detail": "Coleta → diagnóstico → planejamento → implementação → avaliação.",
          "icon": "GitBranch"
        },
        {
          "label": "Privativa",
          "detail": "Diagnóstico e evolução — enfermeiro; técnico implementa e anota.",
          "icon": "UserCheck"
        },
        {
          "label": "Segurança",
          "detail": "Técnica correta + registro = continuidade e segurança do paciente.",
          "icon": "ShieldCheck"
        }
      ],
      "footer_rule": "Procedimento técnico integra a etapa de implementação do PE"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Implementação × registro",
      "chip_label": "SAE",
      "content": "CUIDADO TÉCNICO NO PROCESSO DE ENFERMAGEM",
      "rows": [
        {
          "label": "Implementação",
          "value": "Execução do cuidado prescrito/planejado",
          "badge": "ok"
        },
        {
          "label": "Anotação",
          "value": "Registro do que foi feito — prontuário",
          "badge": "info"
        },
        {
          "label": "Técnico",
          "value": "Executa e anota sob supervisão",
          "badge": "warn"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnostica, prescreve e avalia",
          "badge": "hot"
        },
        {
          "label": "COFEN 358",
          "value": "Base do registro de enfermagem",
          "badge": "info"
        }
      ],
      "footer_rule": "Técnica correta + registro = PE completo na prática"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Formato Certo/Errado: julgar a afirmativa isolada contra COFEN 358/2009 e Lei 7.498/86.",
        "Núcleo: A administração de medicamentos por via intradérmica, como no caso do teste tuberculínico (PPD), de…",
        "Afirmativa alinhada à norma de registro e SAE → marcar Certo.",
        "Resposta: Certo.",
        "Fixação: em C/E de SAE — privativa do enfermeiro (diagnóstico + evolução) e prontuário compartilhado são os eixos mais cobrados."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Errado",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (A)."
        },
        {
          "label": "Transferência — camadas do registro",
          "detail": "Misturar anotação com evolução ou diagnóstico.",
          "correct": "Anotação registra o executado; evolução/diagnóstico é privativa do enfermeiro."
        },
        {
          "label": "Transferência — momento do registro",
          "detail": "Adiar a anotação para o fim do plantão ou registrar só intercorrências.",
          "correct": "Registro deve ser contemporâneo ao cuidado — não postergar nem omitir ações executadas."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "instituto-ibed-enfermagem-processo-de-enfermagem-1780004982901-2": {
    "branch": "sae_exceto",
    "family": "certo_errado",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "SAE — pegadinha EXCETO",
      "chip_label": "EXCETO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Comando",
          "detail": "O registro de enfermagem é um documento legal e, em caso de erro de escrita, o profissional deve utilizar corretivo líqu",
          "icon": "Target"
        },
        {
          "label": "Lógica EXCETO",
          "detail": "Três alternativas corretas + uma exceção — não inverta o raciocínio.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Anotação × evolução",
          "detail": "Técnico anota cuidado; evolução reflexiva é camada distinta.",
          "icon": "FileText"
        },
        {
          "label": "Privativa",
          "detail": "Diagnóstico, prescrição e evolução — enfermeiro (Lei 7.498/86).",
          "icon": "UserCheck"
        },
        {
          "label": "Art. 5º COFEN 358",
          "detail": "Técnico/auxiliar executam o que lhes couber, supervisionados.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "EXCETO: valide cada letra como conduta correta antes de achar a exceção"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "EXCETO — privativa × técnico",
      "chip_label": "PEGADINHA",
      "content": "ANOTAÇÃO DO TÉCNICO — O QUE NÃO ENTRA",
      "rows": [
        {
          "label": "Pode anotar",
          "value": "Cuidados executados, sinais observados, intercorrências",
          "badge": "ok"
        },
        {
          "label": "Não anota",
          "value": "Evolução reflexiva, diagnóstico, anamnese completa formal",
          "badge": "hot"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnóstico, prescrição, evolução/avaliação",
          "badge": "warn"
        },
        {
          "label": "Lei 7.498/86",
          "value": "Art. 11 — privativas do enfermeiro",
          "badge": "info"
        },
        {
          "label": "EXCETO na prova",
          "value": "Três corretas + uma que extrapola competência do técnico",
          "badge": "hot"
        }
      ],
      "footer_rule": "Na dúvida: se exige julgamento clínico privativo → é exceção na anotação do técnico"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Formato Certo/Errado: julgar a afirmativa isolada contra COFEN 358/2009 e Lei 7.498/86.",
        "Núcleo: O registro de enfermagem é um documento legal e, em caso de erro de escrita, o profissional deve ut…",
        "Afirmativa contraria registro legal, privativa ou acesso ao prontuário → marcar Errado.",
        "Resposta: Errado.",
        "Fixação: em C/E de SAE — privativa do enfermeiro (diagnóstico + evolução) e prontuário compartilhado são os eixos mais cobrados."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — EXCETO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "Certo",
          "correct": "Em EXCETO, A é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra B — exceção (gabarito)",
          "detail": "Errado",
          "correct": "INCORRETA na prova: critério da letra B não fecha com COFEN 358 — esta é a exceção pedida."
        },
        {
          "label": "Transferência — camadas do registro",
          "detail": "Misturar anotação com evolução ou diagnóstico.",
          "correct": "Anotação registra o executado; evolução/diagnóstico é privativa do enfermeiro."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "quadrix-enfermagem-processo-de-enfermagem-1776056181857-6": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Para garantir a qualidade e a segurança do cuidado, as anotações de enfermagem no prontuário do paciente devem seguir boas práticas.",
          "icon": "Target"
        },
        {
          "label": "Anotação de enfermagem",
          "detail": "Registro factual do cuidado executado pela equipe — integra o prontuário.",
          "icon": "FileText"
        },
        {
          "label": "Integridade",
          "detail": "Legível, cronológico, sem rasura indevida ou registro fictício.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Identificação",
          "detail": "Carimbo, nome legível e assinatura — obrigatórios no documento firmado.",
          "icon": "Stamp"
        },
        {
          "label": "Veracidade",
          "detail": "Registrar no momento do cuidado; vedado anotar o que não foi feito.",
          "icon": "CheckCircle"
        },
        {
          "label": "COFEN 358/2009",
          "detail": "Norma central do registro de enfermagem no Brasil.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Para garantir a qualidade e a segurança do cuidado, as anotações de enfermagem no prontuário do paciente devem seguir boas práticas.",
        "Eliminar B: técnico registra observações relevantes, não só ordem médica.",
        "Eliminar C: exige linguagem técnica objetiva.",
        "Eliminar D: registro profissional exige linguagem técnica.",
        "Eliminar E: identificação é obrigatória.",
        "Letra A: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra A.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Anotar somente as informações solicitadas pelo médico, ignorando observações re…",
          "correct": "técnico registra observações relevantes, não só ordem médica — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra C",
          "detail": "Registrar informações com termos genéricos, como \"paciente está mal\", para faci…",
          "correct": "exige linguagem técnica objetiva — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra D",
          "detail": "Utilizar linguagem informal durante o registro do paciente para que o próximo p…",
          "correct": "registro profissional exige linguagem técnica — por isso não é o gabarito (A)."
        },
        {
          "label": "Letra E",
          "detail": "Deixar de assinar as anotações para preservar a privacidade do profissional.",
          "correct": "identificação é obrigatória — por isso não é o gabarito (A)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "ufmt-enfermagem-processo-de-enfermagem-1776055865890-2": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "Anotação × evolução",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Comando",
          "detail": "Anotação de enfermagem refere-se a dados…",
          "icon": "Target"
        },
        {
          "label": "Dado pontual",
          "detail": "Fato objetivo do cuidado executado — sem análise reflexiva.",
          "icon": "FileText"
        },
        {
          "label": "Não é processado",
          "detail": "Processar/contextualizar é camada de evolução do enfermeiro.",
          "icon": "XCircle"
        },
        {
          "label": "Não é relatório diário",
          "detail": "Anotação é dado pontual do cuidado, não síntese de turno inteiro.",
          "icon": "Clock"
        },
        {
          "label": "COFEN 358",
          "detail": "Separa anotação (equipe) de evolução (enfermeiro).",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Pontual = fato | Processado = evolução"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando: o que caracteriza a anotação de enfermagem?",
        "Anotação = registro factual do cuidado executado — dado pontual.",
        "Eliminar B: processamento contextualizado é evolução, não anotação.",
        "Eliminar C: não há “tipo” de anotação definido por período fechado na norma.",
        "Eliminar D: reflexão/análise é camada privativa do enfermeiro.",
        "Letra A: dados pontuais — melhor definição.",
        "Marcar letra A.",
        "Fixação: anotação pontual ≠ evolução reflexiva."
      ],
      "footer_rule": "COFEN 358 — separe anotação de evolução"
    },
    "danger_zone": {
      "items": [
        {
          "label": "Letra B — processados",
          "detail": "Confunde anotação com evolução.",
          "correct": "Processar/contextualizar é evolução do enfermeiro — B errada."
        },
        {
          "label": "Letra C — período fixo",
          "detail": "Distrator de janela temporal.",
          "correct": "Anotação não se define por período fechado — C errada."
        },
        {
          "label": "Letra D — reflexão",
          "detail": "Análise reflexiva da situação.",
          "correct": "Reflexão/análise = evolução — D errada."
        },
        {
          "label": "Letra A — pontuais",
          "detail": "Gabarito: dados factuais do cuidado.",
          "correct": "Anotação registra fatos pontuais do momento do cuidado."
        }
      ],
      "content": "PEGADINHAS — ANOTAÇÃO PONTUAL",
      "bullet_style": "x_icon",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Armadilhas — anotação × evolução",
      "chip_label": "PEGADINHAS",
      "footer_rule": "Pontual = fato | Processado = evolução"
    }
  },
  "unesc-enfermagem-procedimentos-diversos-1780000535393-8": {
    "branch": "sae_exceto",
    "family": "certo_errado",
    "guideline": "EXCETO — privativa enfermeiro × anotação técnico",
    "concept_map": {
      "slide_title": "SAE — pegadinha EXCETO",
      "chip_label": "EXCETO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Comando",
          "detail": "Os procedimentos de enfermagem correspondem às técnicas executadas pela equipe de enfermagem na prestação dos cuidados com o paciente.",
          "icon": "Target"
        },
        {
          "label": "Lógica EXCETO",
          "detail": "Três alternativas corretas + uma exceção — não inverta o raciocínio.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Anotação × evolução",
          "detail": "Técnico anota cuidado; evolução reflexiva é camada distinta.",
          "icon": "FileText"
        },
        {
          "label": "Privativa",
          "detail": "Diagnóstico, prescrição e evolução — enfermeiro (Lei 7.498/86).",
          "icon": "UserCheck"
        },
        {
          "label": "Art. 5º COFEN 358",
          "detail": "Técnico/auxiliar executam o que lhes couber, supervisionados.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "EXCETO: valide cada letra como conduta correta antes de achar a exceção"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "EXCETO — privativa × técnico",
      "chip_label": "PEGADINHA",
      "content": "ANOTAÇÃO DO TÉCNICO — O QUE NÃO ENTRA",
      "rows": [
        {
          "label": "Pode anotar",
          "value": "Cuidados executados, sinais observados, intercorrências",
          "badge": "ok"
        },
        {
          "label": "Não anota",
          "value": "Evolução reflexiva, diagnóstico, anamnese completa formal",
          "badge": "hot"
        },
        {
          "label": "Enfermeiro",
          "value": "Diagnóstico, prescrição, evolução/avaliação",
          "badge": "warn"
        },
        {
          "label": "Lei 7.498/86",
          "value": "Art. 11 — privativas do enfermeiro",
          "badge": "info"
        },
        {
          "label": "EXCETO na prova",
          "value": "Três corretas + uma que extrapola competência do técnico",
          "badge": "hot"
        }
      ],
      "footer_rule": "Na dúvida: se exige julgamento clínico privativo → é exceção na anotação do técnico"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.",
        "Enquadramento: Os procedimentos de enfermagem correspondem às técnicas executadas pela equipe de enfermagem na prestação dos cuidados com o paciente.",
        "Letra A: critério da letra A não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra B: critério da letra B não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra C: critério da letra C não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra D: critério da letra D não fecha com COFEN 358 — distrator válido em EXCETO.",
        "Letra E: única exceção — extrapola competência ou viola norma.",
        "Marcar letra E.",
        "Fixação: em EXCETO de anotação — técnico registra cuidado; evolução/diagnóstico/anamnese completa é privativa ou exceção."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — EXCETO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "O profissional deve orientar o paciente e o acompanhante, se houver, sobre o qu…",
          "correct": "Em EXCETO, A é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra B — conduta correta",
          "detail": "Na hora da execução do procedimento, o profissional deve procurar ser cuidadoso…",
          "correct": "Em EXCETO, B é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra C — conduta correta",
          "detail": "Devem ser realizados com base nos princípios científicos e técnicos.",
          "correct": "Em EXCETO, C é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra D — conduta correta",
          "detail": "Após a realização do procedimento o profissional deve registrar o que foi feito.",
          "correct": "Em EXCETO, D é conduta correta: atende norma de registro/SAE."
        },
        {
          "label": "Letra E — exceção (gabarito)",
          "detail": "O profissional de enfermagem deve realizar os procedimentos sem explicá-los ao…",
          "correct": "INCORRETA na prova: viola comunicação e direito do paciente — esta é a exceção pedida."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "vunesp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-0": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "O preenchimento de documentos, a preparação de relatórios, formulários, planilhas e prontuários integram as atividades de apoio administrativo em saúde.",
          "icon": "Target"
        },
        {
          "label": "Anotação de enfermagem",
          "detail": "Registro factual do cuidado executado pela equipe — integra o prontuário.",
          "icon": "FileText"
        },
        {
          "label": "Integridade",
          "detail": "Legível, cronológico, sem rasura indevida ou registro fictício.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Identificação",
          "detail": "Carimbo, nome legível e assinatura — obrigatórios no documento firmado.",
          "icon": "Stamp"
        },
        {
          "label": "Veracidade",
          "detail": "Registrar no momento do cuidado; vedado anotar o que não foi feito.",
          "icon": "CheckCircle"
        },
        {
          "label": "COFEN 358/2009",
          "detail": "Norma central do registro de enfermagem no Brasil.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: O preenchimento de documentos, a preparação de relatórios, formulários, planilhas e prontuários integram as atividades de apoio administrativo em saúde.",
        "Eliminar A: critério da letra A não fecha com COFEN 358.",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar D: critério da letra D não fecha com COFEN 358.",
        "Eliminar E: critério da letra E não fecha com COFEN 358.",
        "Letra C: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra C.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "as informações devem ser anotadas, no prontuário, em data posterior à realizaçã…",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (C)."
        },
        {
          "label": "Letra B",
          "detail": "o registro das informações deve ser realizado de forma aleatória e sem a necess…",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (C)."
        },
        {
          "label": "Letra D",
          "detail": "as planilhas devem conter dados parciais sobre a saúde do paciente para a análi…",
          "correct": "critério da letra D não fecha com COFEN 358 — por isso não é o gabarito (C)."
        },
        {
          "label": "Letra E",
          "detail": "os formulários devem ser preenchidos, utilizando-se abreviações e símbolos para…",
          "correct": "critério da letra E não fecha com COFEN 358 — por isso não é o gabarito (C)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "vunesp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-1": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "SAE — registro e prontuário",
      "chip_label": "DOCUMENTAÇÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Assinale a alternativa correta no que tange ao prontuário médico.",
          "icon": "Target"
        },
        {
          "label": "Anotação de enfermagem",
          "detail": "Registro factual do cuidado executado pela equipe — integra o prontuário.",
          "icon": "FileText"
        },
        {
          "label": "Integridade",
          "detail": "Legível, cronológico, sem rasura indevida ou registro fictício.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Identificação",
          "detail": "Carimbo, nome legível e assinatura — obrigatórios no documento firmado.",
          "icon": "Stamp"
        },
        {
          "label": "Veracidade",
          "detail": "Registrar no momento do cuidado; vedado anotar o que não foi feito.",
          "icon": "CheckCircle"
        },
        {
          "label": "COFEN 358/2009",
          "detail": "Norma central do registro de enfermagem no Brasil.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Registro = continuidade do cuidado + respaldo legal"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: Assinale a alternativa correta no que tange ao prontuário médico.",
        "Eliminar A: prontuário é sigiloso e pertence ao paciente.",
        "Eliminar B: acesso exige consentimento do titular.",
        "Eliminar C: sigilo limita revelação a terceiros.",
        "Eliminar E: divulgação indevida pode ser ilícita.",
        "Letra D: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra D.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "O prontuário médico é o conjunto de documentos com dados pessoais do paciente e…",
          "correct": "prontuário é sigiloso e pertence ao paciente — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra B",
          "detail": "A cópia dos documentos do prontuário será autorizada sem a permissão por parte…",
          "correct": "acesso exige consentimento do titular — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra C",
          "detail": "O conteúdo do prontuário médico poderá ser revelado a familiares do paciente, d…",
          "correct": "sigilo limita revelação a terceiros — por isso não é o gabarito (D)."
        },
        {
          "label": "Letra E",
          "detail": "Os dados constantes do prontuário médico são de caráter científico e sua divulg…",
          "correct": "divulgação indevida pode ser ilícita — por isso não é o gabarito (D)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  },
  "vunesp-enfermagem-processo-de-enfermagem-1776056149404-8": {
    "branch": "sae_documentacao",
    "family": "conceito",
    "guideline": "Registro de enfermagem — COFEN 358/2009",
    "concept_map": {
      "slide_title": "Técnico na implementação",
      "chip_label": "COMPETÊNCIA",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "items": [
        {
          "label": "Comando",
          "detail": "Participação do técnico nas etapas do PE.",
          "icon": "Target"
        },
        {
          "label": "Implementação",
          "detail": "Executa e registra cuidados prescritos — etapa do técnico.",
          "icon": "Play"
        },
        {
          "label": "Não avalia plano",
          "detail": "Avaliação/evolução de enfermagem é privativa do enfermeiro.",
          "icon": "XCircle"
        },
        {
          "label": "Não diagnostica",
          "detail": "Diagnóstico de enfermagem — enfermeiro.",
          "icon": "UserCheck"
        },
        {
          "label": "Art. 5º COFEN 358",
          "detail": "Executa o que couber, supervisionado.",
          "icon": "Scale"
        }
      ],
      "footer_rule": "Técnico = implementação + anotação"
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "slide_title": "Referência — registro de enfermagem",
      "chip_label": "NORMA",
      "content": "ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009",
      "rows": [
        {
          "label": "Definição",
          "value": "Registro das ações executadas pela equipe de enfermagem",
          "badge": "info"
        },
        {
          "label": "Identificação",
          "value": "Carimbo, nome legível e assinatura obrigatórios",
          "badge": "hot"
        },
        {
          "label": "Integridade",
          "value": "Permanente, legível, sem rasura indevida",
          "badge": "warn"
        },
        {
          "label": "Veracidade",
          "value": "Contemporâneo ao cuidado — sem registro fictício",
          "badge": "ok"
        },
        {
          "label": "Prontuário",
          "value": "Documento compartilhado da equipe multiprofissional",
          "badge": "info"
        },
        {
          "label": "Privativa",
          "value": "Diagnóstico + evolução/avaliação → enfermeiro",
          "badge": "hot"
        }
      ],
      "footer_rule": "Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro"
    },
    "logic_flow": {
      "slide_title": "Raciocínio clínico — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo SAE/registro antes de testar letras.",
        "Enquadramento: O desenvolvimento e a aplicação do processo de enfermagem envolvem a atuação de profissionais de enfermagem de diferentes categorias em etapas específicas.",
        "Eliminar A: critério da letra A não fecha com COFEN 358.",
        "Eliminar B: critério da letra B não fecha com COFEN 358.",
        "Eliminar D: critério da letra D não fecha com COFEN 358.",
        "Eliminar E: critério da letra E não fecha com COFEN 358.",
        "Letra C: única alternativa alinhada ao comando e à COFEN 358.",
        "Marcar letra C.",
        "Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro)."
      ],
      "footer_rule": "COFEN 358/2009 + Lei 7.498/86 quando couber privativa"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Processo de Enfermagem"
      },
      "content": "PEGADINHAS — DOCUMENTACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "avaliação de enfermagem.",
          "correct": "critério da letra A não fecha com COFEN 358 — por isso não é o gabarito (C)."
        },
        {
          "label": "Letra B",
          "detail": "diagnóstico de enfermagem.",
          "correct": "critério da letra B não fecha com COFEN 358 — por isso não é o gabarito (C)."
        },
        {
          "label": "Letra D",
          "detail": "prescrição de enfermagem.",
          "correct": "critério da letra D não fecha com COFEN 358 — por isso não é o gabarito (C)."
        },
        {
          "label": "Letra E",
          "detail": "evolução de enfermagem.",
          "correct": "critério da letra E não fecha com COFEN 358 — por isso não é o gabarito (C)."
        }
      ],
      "footer_rule": "Cada distrator merece justificativa única — não recicle texto do gabarito"
    }
  }
} as const;
