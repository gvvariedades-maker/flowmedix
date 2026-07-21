/** AUTO-GENERATED — node scripts/generate-curativos-handcraft-specs.mjs */
export const CURATIVOS_HANDCRAFT_SPECS = {
  "adm-tec-enfermagem-curativos-e-manejo-de-feridas-1779344773456-1": {
    "branch": "curativos_termoterapia",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Um paciente com lesão musculoesquelética aguda foi submetido a sessões de aplicação de calor úmido para alívio da dor e redução de espasmos musculares.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Um paciente com lesão musculoesquelética aguda foi submetido a sessões de aplicação de calor úmido para alívio da dor e redução de espasmos musculares.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — TERMOTERAPIA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Prosseguir com o calor, pois o aumento da sensibilidade sugere apenas maior irr…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "Exercer pressão adicional sobre a região para intensificar a transmissão de cal…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "Substituir a aplicação de calor por uma solução hipertônica para compressa, vis…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "ameosc-enfermagem-curativos-e-manejo-de-feridas-1779340178514-0": {
    "branch": "curativos_ferida_cirurgica",
    "family": "certo_errado",
    "guideline": "Ferida cirúrgica — técnica e sinais de complicação",
    "concept_map": {
      "slide_title": "Ferida cirúrgica / pós-op",
      "chip_label": "PÓS-OP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Em relação as atividades realizadas na retirada de pontos, assinale a alternativa que corresponde a uma dessas atividades (procedimentos) que está INCORRETA .",
          "icon": "Target"
        },
        {
          "label": "Ferida operatória",
          "detail": "Curativo em ferida cirúrgica — técnica asséptica na troca.",
          "icon": "Bandage"
        },
        {
          "label": "Pós-operatório",
          "detail": "Observar exsudato, bordas e sinais de deiscência.",
          "icon": "Activity"
        },
        {
          "label": "Retirada de pontos",
          "detail": "Pinça anatômica no fio; campo estéril; comunicar alterações.",
          "icon": "Scissors"
        },
        {
          "label": "Sinais de alerta",
          "detail": "Exsudato purulento, odor fétido — comunicar equipe.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Manipulação diária ou técnica invertida na retirada de pontos.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Assépsia + observação na ferida cirúrgica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Ferida operatória",
      "content": "PÓS-OPERATÓRIO",
      "rows": [
        {
          "label": "Curativo",
          "value": "Troca asséptica conforme prescrição/protocolo",
          "badge": "ok"
        },
        {
          "label": "Observar",
          "value": "Exsudato, odor, bordas, deiscência",
          "badge": "info"
        },
        {
          "label": "Comunicar",
          "value": "Purulência ou odor fétido à equipe",
          "badge": "hot"
        },
        {
          "label": "Pontos",
          "value": "Pinça anatômica no fio; tesoura corta",
          "badge": "warn"
        }
      ],
      "footer_rule": "Não manipular sem indicação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.",
        "Enquadramento: Em relação as atividades realizadas na retirada de pontos, assinale a alternativa que corresponde a uma dessas atividades (procedimentos) que está INCORRETA .",
        "Letra A: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra B: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra D: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra C: única exceção — viola técnica asséptica ou indicação de cobertura.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — FERIDA_CIRURGICA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "Colocar uma gaze próxima à incisão para depositar os pontos retirados.",
          "correct": "Em EXCETO, A descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra B — conduta correta",
          "detail": "Fazer a limpeza da incisão cirúrgica, obedecendo à técnica do curativo. Umedece…",
          "correct": "Em EXCETO, B descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra C — exceção (gabarito)",
          "detail": "Segurar a extremidade do fio com a pinça anatômica e com a tesoura ou lâmina de…",
          "correct": "INCORRETA nesta prova: retirada de pontos: pinça anatômica segura o fio — tesoura corta, não segura — única exceção pedida no enunciado."
        },
        {
          "label": "Letra D — conduta correta",
          "detail": "Remover curativo anterior se houver, e retirar com pinça dente de rato, soltar…",
          "correct": "Em EXCETO, D descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "ameosc-enfermagem-curativos-e-manejo-de-feridas-1779344766321-8": {
    "branch": "curativos_ferida_cirurgica",
    "family": "vf",
    "guideline": "Ferida cirúrgica — técnica e sinais de complicação",
    "concept_map": {
      "slide_title": "Ferida cirúrgica / pós-op — itens I–IV",
      "chip_label": "PÓS-OP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Sobre os cuidados com feridas operatórias, julgue as afirmativas abaixo: I .",
          "icon": "Target"
        },
        {
          "label": "Ferida operatória",
          "detail": "Curativo em ferida cirúrgica — técnica asséptica na troca.",
          "icon": "Bandage"
        },
        {
          "label": "Pós-operatório",
          "detail": "Observar exsudato, bordas e sinais de deiscência.",
          "icon": "Activity"
        },
        {
          "label": "Retirada de pontos",
          "detail": "Pinça anatômica no fio; campo estéril; comunicar alterações.",
          "icon": "Scissors"
        },
        {
          "label": "Sinais de alerta",
          "detail": "Exsudato purulento, odor fétido — comunicar equipe.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Manipulação diária ou técnica invertida na retirada de pontos.",
          "icon": "XCircle"
        },
        {
          "label": "Afirmativa I",
          "detail": "A troca do curativo deve ser feita em ambiente limpo e com técnica asséptica.",
          "icon": "ListChecks"
        },
        {
          "label": "Afirmativa II",
          "detail": "A presença de exsudato purulento e odor fétido deve ser comunicada à equipe.",
          "icon": "ListChecks"
        }
      ],
      "footer_rule": "Assépsia + observação na ferida cirúrgica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Ferida operatória",
      "content": "PÓS-OPERATÓRIO",
      "rows": [
        {
          "label": "Curativo",
          "value": "Troca asséptica conforme prescrição/protocolo",
          "badge": "ok"
        },
        {
          "label": "Observar",
          "value": "Exsudato, odor, bordas, deiscência",
          "badge": "info"
        },
        {
          "label": "Comunicar",
          "value": "Purulência ou odor fétido à equipe",
          "badge": "hot"
        },
        {
          "label": "Pontos",
          "value": "Pinça anatômica no fio; tesoura corta",
          "badge": "warn"
        }
      ],
      "footer_rule": "Não manipular sem indicação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando V/F: julgar afirmativas I, II, III e IV antes de montar a combinação.",
        "Tema: Sobre os cuidados com feridas operatórias, julgue as afirmativas abaixo: I .",
        "I: “A troca do curativo deve ser feita em ambiente limpo e com técnica …” → V.",
        "II: “A presença de exsudato purulento e odor fétido deve ser comunicada …” → V.",
        "III: “A ferida cirúrgica deve ser manipulada diariamente, mesmo sem indic…” → ?.",
        "IV: “A limpeza da ferida deve seguir o sentido da área mais contaminada …” → ?.",
        "Eliminar letra B: combinação não reflete o julgamento item a item.",
        "Eliminar letra C: combinação não reflete o julgamento item a item.",
        "Eliminar letra D: combinação não reflete o julgamento item a item.",
        "Marcar letra A: combinação coerente com NPUAP/COFEN e meio úmido.",
        "Fixação: em V/F de curativo — teste assépsia, exsudato e indicação de cobertura por item."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — FERIDA_CIRURGICA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "III e IV , apenas.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "II e III , apenas.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "II , apenas.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "ameosc-enfermagem-curativos-e-manejo-de-feridas-1779344773456-0": {
    "branch": "curativos_ferida_cirurgica",
    "family": "conceito",
    "guideline": "Ferida cirúrgica — técnica e sinais de complicação",
    "concept_map": {
      "slide_title": "Ferida cirúrgica / pós-op",
      "chip_label": "PÓS-OP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Durante o turno em uma Unidade Básica de Saúde, o técnico de enfermagem realiza a troca de curativo em um paciente com ferida cirúrgica recente.",
          "icon": "Target"
        },
        {
          "label": "Ferida operatória",
          "detail": "Curativo em ferida cirúrgica — técnica asséptica na troca.",
          "icon": "Bandage"
        },
        {
          "label": "Pós-operatório",
          "detail": "Observar exsudato, bordas e sinais de deiscência.",
          "icon": "Activity"
        },
        {
          "label": "Retirada de pontos",
          "detail": "Pinça anatômica no fio; campo estéril; comunicar alterações.",
          "icon": "Scissors"
        },
        {
          "label": "Sinais de alerta",
          "detail": "Exsudato purulento, odor fétido — comunicar equipe.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Manipulação diária ou técnica invertida na retirada de pontos.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Assépsia + observação na ferida cirúrgica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Ferida operatória",
      "content": "PÓS-OPERATÓRIO",
      "rows": [
        {
          "label": "Curativo",
          "value": "Troca asséptica conforme prescrição/protocolo",
          "badge": "ok"
        },
        {
          "label": "Observar",
          "value": "Exsudato, odor, bordas, deiscência",
          "badge": "info"
        },
        {
          "label": "Comunicar",
          "value": "Purulência ou odor fétido à equipe",
          "badge": "hot"
        },
        {
          "label": "Pontos",
          "value": "Pinça anatômica no fio; tesoura corta",
          "badge": "warn"
        }
      ],
      "footer_rule": "Não manipular sem indicação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Durante o turno em uma Unidade Básica de Saúde, o técnico de enfermagem realiza a troca de curativo em um paciente com ferida cirúrgica recente.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — FERIDA_CIRURGICA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "A gaze utilizada pode ser reaproveitada se não houver contato com secreção.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "A ferida deve ser limpa de forma circular, começando pela borda externa.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "O curativo deve ser feito com luvas estéreis apenas se houver secreção purulent…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "ameosc-enfermagem-curativos-e-manejo-de-feridas-1779344773456-7": {
    "branch": "curativos_cobertura_selecao",
    "family": "conceito",
    "guideline": "Seleção de cobertura — exsudato e leito (NPUAP/COFEN)",
    "concept_map": {
      "slide_title": "Seleção de cobertura",
      "chip_label": "COBERTURA",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "O curativo é uma técnica ou material usado para cobrir, proteger e favorecer a cicatrização de feridas.",
          "icon": "Target"
        },
        {
          "label": "Exsudato",
          "detail": "Baixo → hidrocoloide/filme; moderado/alto → espuma/alginato.",
          "icon": "Droplets"
        },
        {
          "label": "Leito",
          "detail": "Necrose → hidrogel/autólise; granulação → espuma/hidrofibra.",
          "icon": "Layers"
        },
        {
          "label": "Meio úmido",
          "detail": "Ambiente úmido controlado acelera cicatrização — não expor ao ar.",
          "icon": "CloudRain"
        },
        {
          "label": "Pegadinha",
          "detail": "Inverter indicação de espuma/alginato ou usar antisséptico de rotina.",
          "icon": "AlertTriangle"
        },
        {
          "label": "SF no leito",
          "detail": "Limpeza padrão com soro fisiológico — evitar álcool rotineiro.",
          "icon": "FlaskConical"
        }
      ],
      "footer_rule": "Leito + exsudato → cobertura; limpeza = SF",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: O curativo é uma técnica ou material usado para cobrir, proteger e favorecer a cicatrização de feridas.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra A: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra A.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — COBERTURA_SELECAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Esfacelo.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "Compressivo.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "Aberto.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "ameosc-enfermagem-curativos-e-manejo-de-feridas-1779344779828-6": {
    "branch": "curativos_generico",
    "family": "vf",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas — itens I–IV",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A escolha adequada do material para curativos e a administração correta de medicamentos são essenciais para promover a cicatrização e prevenir complicações.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        },
        {
          "label": "Afirmativa I",
          "detail": "Durante a troca de curativos, a aplicação de pomadas tópicas pode ser realiza…",
          "icon": "ListChecks"
        },
        {
          "label": "Afirmativa II",
          "detail": "A administração de medicamentos intramusculares exige atenção à escolha do lo…",
          "icon": "ListChecks"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando V/F: julgar afirmativas I, II, III e IV antes de montar a combinação.",
        "Tema: A escolha adequada do material para curativos e a administração correta de medicamentos são essenciais para promover a cicatrização e prevenir complicações.",
        "I: “Durante a troca de curativos, a aplicação de pomadas tópicas pode s…” → ?.",
        "II: “A administração de medicamentos intramusculares exige atenção à esc…” → V.",
        "III: “O uso de curativos absorventes em lesões exsudativas pode ser dispe…” → ?.",
        "Eliminar letra B: combinação não reflete o julgamento item a item.",
        "Eliminar letra C: combinação não reflete o julgamento item a item.",
        "Eliminar letra D: combinação não reflete o julgamento item a item.",
        "Marcar letra A: combinação coerente com NPUAP/COFEN e meio úmido.",
        "Fixação: em V/F de curativo — teste assépsia, exsudato e indicação de cobertura por item."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "III, apenas.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "I, II e III.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "I e II, apenas.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "ameosc-enfermagem-curativos-e-manejo-de-feridas-1779344813448-7": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A segurança do paciente é um princípio essencial na prática da enfermagem, especialmente durante a execução de procedimentos técnicos.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: A segurança do paciente é um princípio essencial na prática da enfermagem, especialmente durante a execução de procedimentos técnicos.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Utilizar o material mesmo vencido, desde que a embalagem esteja íntegra e o con…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "Solicitar que outro profissional autorize o uso do material, para não atrasar o…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "Realizar o curativo apenas nas partes menos afetadas, deixando a troca completa…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "ameosc-enfermagem-curativos-e-manejo-de-feridas-1779562699843-5": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Observe a imagem: Observa-se:",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Observe a imagem: Observa-se:",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra B: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra B.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "um cateter venoso central.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra B."
        },
        {
          "label": "Letra C",
          "detail": "um cateter arterial.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra B."
        },
        {
          "label": "Letra D",
          "detail": "um cateter urinário.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra B."
        },
        {
          "label": "Letra E",
          "detail": "um cateter enteral.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra B."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "atame-enfermagem-curativos-e-manejo-de-feridas-1779269228428-3": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Uma paciente foi submetida à mastectomia e necessita de cuidados pós - operatórios.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Uma paciente foi submetida à mastectomia e necessita de cuidados pós - operatórios.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Orientar sobre os tipos de exercícios respiratórios.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "Avaliar risco de linfedema.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "Realizar a reconstrução mamária.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "avancasp-enfermagem-curativos-e-manejo-de-feridas-1779269212740-0": {
    "branch": "curativos_tecnica_assepsia",
    "family": "conceito",
    "guideline": "Técnica asséptica e limpeza com SF 0,9%",
    "concept_map": {
      "slide_title": "Técnica asséptica no curativo",
      "chip_label": "ASSÉPSIA",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A remoção do tecido necrótico de uma ferida, por meio de compressão , fricção ou irrigação , em que se emprega gaze, esponja ou jato de soro fisiológico sobpressão, recebe qual nome?",
          "icon": "Target"
        },
        {
          "label": "Sequência",
          "detail": "Da área menos contaminada para a mais contaminada.",
          "icon": "ArrowDown"
        },
        {
          "label": "Limpeza",
          "detail": "Soro fisiológico — movimentos do centro para periferia do leito.",
          "icon": "Droplets"
        },
        {
          "label": "Troca",
          "detail": "Material estéril; lavar mãos; campo limpo.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Ordem invertida ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Menos → mais contaminado; SF no leito",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Sequência asséptica",
      "content": "TÉCNICA DE CURATIVO",
      "rows": [
        {
          "label": "Limpeza",
          "value": "Soro fisiológico — centro para periferia",
          "badge": "ok"
        },
        {
          "label": "Ordem",
          "value": "Menos contaminado para mais contaminado",
          "badge": "hot"
        },
        {
          "label": "Material",
          "value": "Estéril e único uso quando indicado",
          "badge": "info"
        }
      ],
      "footer_rule": "Assépsia protege leito e perilesional",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: A remoção do tecido necrótico de uma ferida, por meio de compressão , fricção ou irrigação , em que se emprega gaze, esponja ou jato de soro fisiológico sobpressão, recebe qual nome?",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — TECNICA_ASSEPSIA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Desbridamento autolítico",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "Desbridamento biológico",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "Desbridamento instrumental",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        },
        {
          "label": "Letra E",
          "detail": "Desbridamento enzimático",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "avancasp-enfermagem-curativos-e-manejo-de-feridas-1779269212740-2": {
    "branch": "curativos_generico",
    "family": "certo_errado",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Sobre alguns cuidados pertinentes à assistência pós-cirúrgica específica para membro superior, destaque a alternativa que traz uma informação incorreta .",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.",
        "Enquadramento: Sobre alguns cuidados pertinentes à assistência pós-cirúrgica específica para membro superior, destaque a alternativa que traz uma informação incorreta .",
        "Letra A: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra B: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra C: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra E: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra D: única exceção — viola técnica asséptica ou indicação de cobertura.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "Posicionar o membro operado em elevação, entre 60 e 90 graus, apoiados em trave…",
          "correct": "Em EXCETO, A descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra B — conduta correta",
          "detail": "Realizar limpeza dos artelhos, secando bem os espaços interdigitais.",
          "correct": "Em EXCETO, B descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra C — conduta correta",
          "detail": "No caso de cirurgia de enxerto cutâneo, a frequência da troca do curativo da ár…",
          "correct": "Em EXCETO, C descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra D — exceção (gabarito)",
          "detail": "Caso o paciente esteja com tala gessada ou somente enfaixado, não retirar a tal…",
          "correct": "INCORRETA nesta prova: conduta correta em curativos — não é a exceção pedida — única exceção pedida no enunciado."
        },
        {
          "label": "Letra E — conduta correta",
          "detail": "Movimentar passiva e delicadamente as articulações não gessadas.",
          "correct": "Em EXCETO, E descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "avancasp-enfermagem-curativos-e-manejo-de-feridas-1779269212740-3": {
    "branch": "curativos_desbridamento",
    "family": "conceito",
    "guideline": "Desbridamento — tipos e indicações",
    "concept_map": {
      "slide_title": "Desbridamento",
      "chip_label": "DESBRIDAMENTO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "O desbridamento é um procedimento que visa a remoção do tecido necrótido ou contaminado de uma ferida, corroborando para sua cicatrização e prevenindo ainfecção.",
          "icon": "Target"
        },
        {
          "label": "Objetivo",
          "detail": "Remover tecido necrótico/não viável — preparar granulação.",
          "icon": "Scissors"
        },
        {
          "label": "Autolítico",
          "detail": "Hidrogel/hidrocoloide — lento, indolor.",
          "icon": "Clock"
        },
        {
          "label": "Mecânico",
          "detail": "Gaze úmida ou instrumental — risco de trauma se inadequado.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Gaze seca agressiva ou confundir com limpeza simples.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Tipo de desbridamento conforme leito e dor",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Tipos de desbridamento",
      "content": "DESBRIDAMENTO",
      "rows": [
        {
          "label": "Autolítico",
          "value": "Hidrogel/hidrocoloide — lento, indolor",
          "badge": "ok"
        },
        {
          "label": "Enzimático",
          "value": "Colagenase — necrose devitalizada",
          "badge": "info"
        },
        {
          "label": "Instrumental",
          "value": "Cirúrgico/afiado — tecido viável preservado",
          "badge": "hot"
        },
        {
          "label": "Mecânico",
          "value": "Gaze úmida — evitar trauma com gaze seca",
          "badge": "warn"
        }
      ],
      "footer_rule": "Remover não viável — preparar granulação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: O desbridamento é um procedimento que visa a remoção do tecido necrótido ou contaminado de uma ferida, corroborando para sua cicatrização e prevenindo ainfecção.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — DESBRIDAMENTO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Autolítico",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "Enzimático",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "Mecânico",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        },
        {
          "label": "Letra E",
          "detail": "Biológico",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "avancasp-enfermagem-curativos-e-manejo-de-feridas-1779269291153-7": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A cicatrização de feridas é influenciada por fatores de ordem psicológica, física e fisiológica.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: A cicatrização de feridas é influenciada por fatores de ordem psicológica, física e fisiológica.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Oclusivo hidrofóbico",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "Curativo combinado absorvente",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "Curativo impregnado de prata",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        },
        {
          "label": "Letra E",
          "detail": "Esponja de drenagem",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "avancasp-enfermagem-curativos-e-manejo-de-feridas-1779269305691-9": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Ao aplicar uma tração cutânea em um paciente idoso, se um excesso de peso for colocado, espera-se a seguinte complicação",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Ao aplicar uma tração cutânea em um paciente idoso, se um excesso de peso for colocado, espera-se a seguinte complicação",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "desvio da fratura do fêmur.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "trombose.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "amputação pela lesão no membro.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        },
        {
          "label": "Letra E",
          "detail": "lesão neurológica.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "avancasp-enfermagem-curativos-e-manejo-de-feridas-1779269315587-3": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "É um procedimento de enfermagem que deverá ser executado por meio de técnica, reservadamente, estéril:",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: É um procedimento de enfermagem que deverá ser executado por meio de técnica, reservadamente, estéril:",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra B: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra B.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Cateterismo Intermitente.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra B."
        },
        {
          "label": "Letra C",
          "detail": "Sondagem Gástrica.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra B."
        },
        {
          "label": "Letra D",
          "detail": "Lesão por pressão infectada.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra B."
        },
        {
          "label": "Letra E",
          "detail": "Coleta de citopatológico.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra B."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "avancasp-enfermagem-curativos-e-manejo-de-feridas-1779344759089-1": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Sobre os curativos convencionais, realizados com o uso de compressas de gaze, assinale a alternativa CORRETA:",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Sobre os curativos convencionais, realizados com o uso de compressas de gaze, assinale a alternativa CORRETA:",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra B: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra B.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "A água de torneira pode ser usada na limpeza da lesão, desde que seja filtrada.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra B."
        },
        {
          "label": "Letra C",
          "detail": "Antissépticos locais são recomendados para limpeza, pois evitam a lesão do teci…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra B."
        },
        {
          "label": "Letra D",
          "detail": "É recomendado retirar a gaze aderida diretamente, sem lavar, para garantir uma…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra B."
        },
        {
          "label": "Letra E",
          "detail": "Tecidos de granulação devem ser tratados com solução salina hiperosmolar para p…",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra B."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "avancasp-enfermagem-curativos-e-manejo-de-feridas-1779344766321-2": {
    "branch": "curativos_exceto_incorreta",
    "family": "certo_errado",
    "guideline": "EXCETO — conduta em curativo",
    "concept_map": {
      "slide_title": "EXCETO em curativo",
      "chip_label": "EXCETO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Um dos cuidados de enfermagem ao paciente cirúrgico envolve medidas preventivas no intuito de evitar as úlceras de pressão que decorrem de pacientes que têmum pós-operatório prolongado em leito.",
          "icon": "Target"
        },
        {
          "label": "Lógica",
          "detail": "Três condutas corretas + uma exceção — não inverta.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Assépsia",
          "detail": "SF, técnica, comunicação de sinais de infecção.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Cobertura",
          "detail": "Escolha por exsudato e leito — não antisséptico rotineiro.",
          "icon": "Bandage"
        }
      ],
      "footer_rule": "Valide cada letra como correta antes de achar a exceção",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.",
        "Enquadramento: Um dos cuidados de enfermagem ao paciente cirúrgico envolve medidas preventivas no intuito de evitar as úlceras de pressão que decorrem de pacientes que têmum pós-operatório prolongado em leito.",
        "Letra A: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra B: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra C: não massagear proeminências ósseas ou áreas hiperemiadas — distrator válido em EXCETO.",
        "Letra D: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra E: única exceção — viola técnica asséptica ou indicação de cobertura.",
        "Marcar letra E.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — EXCETO_INCORRETA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "Manter a pele sempre limpa.",
          "correct": "Em EXCETO, A descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra B — conduta correta",
          "detail": "Hidratar a pele com cremes ou óleos.",
          "correct": "Em EXCETO, B descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra C — conduta correta",
          "detail": "Evitar massagear as proeminências ósseas.",
          "correct": "Em EXCETO, C descreve conduta adequada: não massagear proeminências ósseas ou áreas hiperemiadas."
        },
        {
          "label": "Letra D — conduta correta",
          "detail": "Colocar coxins entre os joelhos.",
          "correct": "Em EXCETO, D descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra E — exceção (gabarito)",
          "detail": "Evitar a alternância de decúbito.",
          "correct": "INCORRETA nesta prova: conduta correta em curativos — não é a exceção pedida — única exceção pedida no enunciado."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "avancasp-enfermagem-curativos-e-manejo-de-feridas-1779344766321-3": {
    "branch": "curativos_exceto_incorreta",
    "family": "certo_errado",
    "guideline": "EXCETO — conduta em curativo",
    "concept_map": {
      "slide_title": "EXCETO em curativo",
      "chip_label": "EXCETO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Em relação ao tratamento de feridas crônicas, as terapia tópicas devem contribuir para uma cicatrização efetiva.",
          "icon": "Target"
        },
        {
          "label": "Lógica",
          "detail": "Três condutas corretas + uma exceção — não inverta.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Assépsia",
          "detail": "SF, técnica, comunicação de sinais de infecção.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Cobertura",
          "detail": "Escolha por exsudato e leito — não antisséptico rotineiro.",
          "icon": "Bandage"
        }
      ],
      "footer_rule": "Valide cada letra como correta antes de achar a exceção",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.",
        "Enquadramento: Em relação ao tratamento de feridas crônicas, as terapia tópicas devem contribuir para uma cicatrização efetiva.",
        "Letra A: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra B: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra C: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra E: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra D: única exceção — viola técnica asséptica ou indicação de cobertura.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — EXCETO_INCORRETA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "umidade",
          "correct": "Em EXCETO, A descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra B — conduta correta",
          "detail": "não-aderência",
          "correct": "Em EXCETO, B descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra C — conduta correta",
          "detail": "permeabilidade",
          "correct": "Em EXCETO, C descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra D — exceção (gabarito)",
          "detail": "toxicidade",
          "correct": "INCORRETA nesta prova: conduta correta em curativos — não é a exceção pedida — única exceção pedida no enunciado."
        },
        {
          "label": "Letra E — conduta correta",
          "detail": "isolamento térmico",
          "correct": "Em EXCETO, E descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "avancasp-enfermagem-curativos-e-manejo-de-feridas-1779344813448-0": {
    "branch": "curativos_tecnica_assepsia",
    "family": "conceito",
    "guideline": "Técnica asséptica e limpeza com SF 0,9%",
    "concept_map": {
      "slide_title": "Técnica asséptica no curativo",
      "chip_label": "ASSÉPSIA",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A técnica asséptica deve ser utilizada em:",
          "icon": "Target"
        },
        {
          "label": "Sequência",
          "detail": "Da área menos contaminada para a mais contaminada.",
          "icon": "ArrowDown"
        },
        {
          "label": "Limpeza",
          "detail": "Soro fisiológico — movimentos do centro para periferia do leito.",
          "icon": "Droplets"
        },
        {
          "label": "Troca",
          "detail": "Material estéril; lavar mãos; campo limpo.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Ordem invertida ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Menos → mais contaminado; SF no leito",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Sequência asséptica",
      "content": "TÉCNICA DE CURATIVO",
      "rows": [
        {
          "label": "Limpeza",
          "value": "Soro fisiológico — centro para periferia",
          "badge": "ok"
        },
        {
          "label": "Ordem",
          "value": "Menos contaminado para mais contaminado",
          "badge": "hot"
        },
        {
          "label": "Material",
          "value": "Estéril e único uso quando indicado",
          "badge": "info"
        }
      ],
      "footer_rule": "Assépsia protege leito e perilesional",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: A técnica asséptica deve ser utilizada em:",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra B: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra B.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — TECNICA_ASSEPSIA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Troca de roupa de cama.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra B."
        },
        {
          "label": "Letra C",
          "detail": "Banho no leito.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra B."
        },
        {
          "label": "Letra D",
          "detail": "Medição de peso.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra B."
        },
        {
          "label": "Letra E",
          "detail": "Aferição de temperatura.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra B."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "avancasp-enfermagem-curativos-e-manejo-de-feridas-1779344826734-1": {
    "branch": "curativos_bandagem_imobilizacao",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A técnica de bandagem 'em oito' é frequentemente utilizada para imobilizações de:",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: A técnica de bandagem 'em oito' é frequentemente utilizada para imobilizações de:",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — BANDAGEM_IMOBILIZACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Tornozelo.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "Cotovelo.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "Pulso.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        },
        {
          "label": "Letra E",
          "detail": "Joelho.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "avancasp-enfermagem-curativos-e-manejo-de-feridas-1779344826734-3": {
    "branch": "curativos_bandagem_imobilizacao",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Material de imobilização preferido para pacientes com fraturas que requerem ajustes frequentes devido ao inchaço inicial",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Material de imobilização preferido para pacientes com fraturas que requerem ajustes frequentes devido ao inchaço inicial",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — BANDAGEM_IMOBILIZACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Gesso Paris tradicional devido à sua durabilidade e rigidez.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "Fibra de vidro, pela sua rápida secagem e resistência.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "Bandagens elásticas, pela facilidade de aplicação e remoção.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        },
        {
          "label": "Letra E",
          "detail": "Ataduras de crepe, para ajuste da compressão conforme necessário.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "avancasp-enfermagem-curativos-e-manejo-de-feridas-1779344826734-4": {
    "branch": "curativos_generico",
    "family": "vf",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas — itens I–IV",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Sobre a realização do curativo da ferida com dreno, assinale a alternativa correta: I.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        },
        {
          "label": "Afirmativa I",
          "detail": "Limpar o dreno e a pele ao redor da ferida com gaze umedecida com álcool 70%.…",
          "icon": "ListChecks"
        },
        {
          "label": "Afirmativa II",
          "detail": "Colocar uma gaze sobre o dreno, isolando da superfície da pele.",
          "icon": "ListChecks"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando V/F: julgar afirmativas I, II, III e IV antes de montar a combinação.",
        "Tema: Sobre a realização do curativo da ferida com dreno, assinale a alternativa correta: I.",
        "I: “Limpar o dreno e a pele ao redor da ferida com gaze umedecida com á…” → F.",
        "II: “Colocar uma gaze sobre o dreno, isolando da superfície da pele.” → ?.",
        "III: “Aplicar uma gaze sobre o dreno, para protegê-lo” → ?.",
        "Eliminar letra A: combinação não reflete o julgamento item a item.",
        "Eliminar letra B: combinação não reflete o julgamento item a item.",
        "Eliminar letra C: combinação não reflete o julgamento item a item.",
        "Eliminar letra E: combinação não reflete o julgamento item a item.",
        "Marcar letra D: combinação coerente com NPUAP/COFEN e meio úmido.",
        "Fixação: em V/F de curativo — teste assépsia, exsudato e indicação de cobertura por item."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "I , apenas.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "II , apenas.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "I e III , apenas.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        },
        {
          "label": "Letra E",
          "detail": "I , II e III .",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "cebraspe-cespe-enfermagem-curativos-e-manejo-de-feridas-1779340178514-1": {
    "branch": "curativos_estomia",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Um paciente do sexo masculino, de 55 anos de idade, foi submetido a retossigmoidectomia em decorrência de doença oncológica (adenocarcinoma deretossigmoide).",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Um paciente do sexo masculino, de 55 anos de idade, foi submetido a retossigmoidectomia em decorrência de doença oncológica (adenocarcinoma deretossigmoide).",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Letra B: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra B.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — ESTOMIA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Certo",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra B."
        },
        {
          "label": "Transferência — exsudato × cobertura",
          "detail": "Escolher filme transparente em ferida exsudativa infectada.",
          "correct": "Alinhar exsudato ao tipo de cobertura: alginato/espuma para alto; hidrogel para necrose seca."
        },
        {
          "label": "Transferência — limpeza do leito",
          "detail": "Usar álcool 70% ou iodo de rotina no leito granulante.",
          "correct": "Limpeza padrão é soro fisiológico — antissépticos citotóxicos não são rotina no leito."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "cev-urca-enfermagem-curativos-e-manejo-de-feridas-1779269212740-7": {
    "branch": "curativos_lpp",
    "family": "conceito",
    "guideline": "LPP — prevenção e estágios NPUAP",
    "concept_map": {
      "slide_title": "LPP — prevenção e estágios",
      "chip_label": "LPP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "As lesões por pressão (LPP) causam danos consideráveis aos pacientes, dificultando o processo de recuperação funcional, ",
          "icon": "Target"
        },
        {
          "label": "Prevenção",
          "detail": "Pele limpa e seca; alívio de pressão; não massagear proeminências.",
          "icon": "Bed"
        },
        {
          "label": "Estágios",
          "detail": "I eritema; II derme; III subcutâneo; IV osso/tendão.",
          "icon": "Layers"
        },
        {
          "label": "Braden",
          "detail": "Escore de risco — reavaliar e intervir quando indicado.",
          "icon": "Calculator"
        },
        {
          "label": "Pegadinha",
          "detail": "Trocar seco por úmido ou confundir estágio III com IV.",
          "icon": "AlertTriangle"
        }
      ],
      "footer_rule": "Prevenir > tratar — classificar estágio antes da cobertura",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "LPP — estágios",
      "content": "ÚLCERA POR PRESSÃO",
      "rows": [
        {
          "label": "Estágio I",
          "value": "Eritema não branqueável — pele íntegra",
          "badge": "info"
        },
        {
          "label": "Estágio II",
          "value": "Perda parcial da derme",
          "badge": "ok"
        },
        {
          "label": "Estágio III",
          "value": "Perda total da espessura cutânea",
          "badge": "hot"
        },
        {
          "label": "Estágio IV",
          "value": "Osso, tendão ou músculo exposto",
          "badge": "hot"
        },
        {
          "label": "Prevenção",
          "value": "Pele limpa e seca; alívio de pressão",
          "badge": "warn"
        }
      ],
      "footer_rule": "Classificar estágio antes da cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: As lesões por pressão (LPP) causam danos consideráveis aos pacientes, dificultando o processo de recuperação funcional, ",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra E: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra E.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — LPP",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Realização de avaliação criteriosa da pele pelo menos uma vez por dia, especial…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra E."
        },
        {
          "label": "Letra B",
          "detail": "Manutenção da higiene corporal, mantendo a pele limpa e úmida.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra E."
        },
        {
          "label": "Letra C",
          "detail": "Mudança de posição a cada quatro horas para reduzir a pressão local.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra E."
        },
        {
          "label": "Letra D",
          "detail": "As evidências não apontam benefícios no uso de colchão especial, almofadas e/ou…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra E."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "cev-urca-enfermagem-curativos-e-manejo-de-feridas-1779344773456-2": {
    "branch": "curativos_cobertura_selecao",
    "family": "conceito",
    "guideline": "Seleção de cobertura — exsudato e leito (NPUAP/COFEN)",
    "concept_map": {
      "slide_title": "Seleção de cobertura",
      "chip_label": "COBERTURA",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "O produto utilizado para prevenção de lesões por pressão e para tratar feridas abertas vitalizadas, não infectadas, em f",
          "icon": "Target"
        },
        {
          "label": "Exsudato",
          "detail": "Baixo → hidrocoloide/filme; moderado/alto → espuma/alginato.",
          "icon": "Droplets"
        },
        {
          "label": "Leito",
          "detail": "Necrose → hidrogel/autólise; granulação → espuma/hidrofibra.",
          "icon": "Layers"
        },
        {
          "label": "Meio úmido",
          "detail": "Ambiente úmido controlado acelera cicatrização — não expor ao ar.",
          "icon": "CloudRain"
        },
        {
          "label": "Pegadinha",
          "detail": "Inverter indicação de espuma/alginato ou usar antisséptico de rotina.",
          "icon": "AlertTriangle"
        },
        {
          "label": "SF no leito",
          "detail": "Limpeza padrão com soro fisiológico — evitar álcool rotineiro.",
          "icon": "FlaskConical"
        }
      ],
      "footer_rule": "Leito + exsudato → cobertura; limpeza = SF",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: O produto utilizado para prevenção de lesões por pressão e para tratar feridas abertas vitalizadas, não infectadas, em f",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra A: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra A.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — COBERTURA_SELECAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Hidrocolóide.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "Hidrogel.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "Carvão ativado com prata.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        },
        {
          "label": "Letra E",
          "detail": "Papaína creme 10%.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "coseac-uff-enfermagem-curativos-e-manejo-de-feridas-1779340178514-9": {
    "branch": "curativos_tecnica_assepsia",
    "family": "conceito",
    "guideline": "Técnica asséptica e limpeza com SF 0,9%",
    "concept_map": {
      "slide_title": "Técnica asséptica no curativo",
      "chip_label": "ASSÉPSIA",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Para a realização do curativo, se faz necessário o emprego de técnica para a antissepsia de ferida.",
          "icon": "Target"
        },
        {
          "label": "Sequência",
          "detail": "Da área menos contaminada para a mais contaminada.",
          "icon": "ArrowDown"
        },
        {
          "label": "Limpeza",
          "detail": "Soro fisiológico — movimentos do centro para periferia do leito.",
          "icon": "Droplets"
        },
        {
          "label": "Troca",
          "detail": "Material estéril; lavar mãos; campo limpo.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Ordem invertida ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Menos → mais contaminado; SF no leito",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Sequência asséptica",
      "content": "TÉCNICA DE CURATIVO",
      "rows": [
        {
          "label": "Limpeza",
          "value": "Soro fisiológico — centro para periferia",
          "badge": "ok"
        },
        {
          "label": "Ordem",
          "value": "Menos contaminado para mais contaminado",
          "badge": "hot"
        },
        {
          "label": "Material",
          "value": "Estéril e único uso quando indicado",
          "badge": "info"
        }
      ],
      "footer_rule": "Assépsia protege leito e perilesional",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Para a realização do curativo, se faz necessário o emprego de técnica para a antissepsia de ferida.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — TECNICA_ASSEPSIA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Aplicar a medicação de acordo com a prescrição médica; drenar a infecção; propi…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "Ocluir a ferida; higienizar o local da ferida; drenar a infecção; aplicar medic…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "Limpar a lesão; ocluir a ferida; drenar a Infecção; promover a drenagem da feri…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        },
        {
          "label": "Letra E",
          "detail": "Ocluir a ferida; higienizar o local da ferida; evitar infecção; drenar a infecç…",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "decorp-enfermagem-curativos-e-manejo-de-feridas-1779344786992-0": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "O cuidado de feridas apoia-se em conceitos de equilíbrio de umidade, leito viável e barreira contra contaminação.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: O cuidado de feridas apoia-se em conceitos de equilíbrio de umidade, leito viável e barreira contra contaminação.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Curativo absorvente rígido remove umidade do leito até ressecamento total, favo…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "Curativo oclusivo universal acelera epitelização em toda situação clínica, inde…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "Curativo de contato seco é indicado para manter crosta estável em leitos granul…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "decorp-enfermagem-curativos-e-manejo-de-feridas-1779344786992-4": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Um paciente internado apresenta febre e sinais de infecção no local de um curativo recente.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Um paciente internado apresenta febre e sinais de infecção no local de um curativo recente.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Remover o curativo antigo e aplicar uma solução antisséptica de amplo espectro.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "Substituir o curativo por gaze seca para evitar umidade no local.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "Aumentar a frequência das trocas do curativo para prevenir complicações.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "decorp-enfermagem-curativos-e-manejo-de-feridas-1779344786992-5": {
    "branch": "curativos_lpp",
    "family": "conceito",
    "guideline": "LPP — prevenção e estágios NPUAP",
    "concept_map": {
      "slide_title": "LPP — prevenção e estágios",
      "chip_label": "LPP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Durante o atendimento de um paciente com lesão por pressão em estágio avançado, o técnico de enfermagem deve:",
          "icon": "Target"
        },
        {
          "label": "Prevenção",
          "detail": "Pele limpa e seca; alívio de pressão; não massagear proeminências.",
          "icon": "Bed"
        },
        {
          "label": "Estágios",
          "detail": "I eritema; II derme; III subcutâneo; IV osso/tendão.",
          "icon": "Layers"
        },
        {
          "label": "Braden",
          "detail": "Escore de risco — reavaliar e intervir quando indicado.",
          "icon": "Calculator"
        },
        {
          "label": "Pegadinha",
          "detail": "Trocar seco por úmido ou confundir estágio III com IV.",
          "icon": "AlertTriangle"
        }
      ],
      "footer_rule": "Prevenir > tratar — classificar estágio antes da cobertura",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "LPP — estágios",
      "content": "ÚLCERA POR PRESSÃO",
      "rows": [
        {
          "label": "Estágio I",
          "value": "Eritema não branqueável — pele íntegra",
          "badge": "info"
        },
        {
          "label": "Estágio II",
          "value": "Perda parcial da derme",
          "badge": "ok"
        },
        {
          "label": "Estágio III",
          "value": "Perda total da espessura cutânea",
          "badge": "hot"
        },
        {
          "label": "Estágio IV",
          "value": "Osso, tendão ou músculo exposto",
          "badge": "hot"
        },
        {
          "label": "Prevenção",
          "value": "Pele limpa e seca; alívio de pressão",
          "badge": "warn"
        }
      ],
      "footer_rule": "Classificar estágio antes da cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Durante o atendimento de um paciente com lesão por pressão em estágio avançado, o técnico de enfermagem deve:",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — LPP",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Aplicar pomadas antibióticas sem prescrição médica para reduzir a infecção.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "Realizar curativos oclusivos e trocá-los somente quando saturados.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "Aumentar a oferta de líquidos e proteínas para favorecer a cicatrização.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "decorp-enfermagem-curativos-e-manejo-de-feridas-1779344819753-0": {
    "branch": "curativos_lpp",
    "family": "conceito",
    "guideline": "LPP — prevenção e estágios NPUAP",
    "concept_map": {
      "slide_title": "LPP — prevenção e estágios",
      "chip_label": "LPP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Lesão por pressão sacral, estágio III apresenta base de granulação, exsudato moderado e bordas íntegras: identifique o curativo que atende a essascaracterísticas.",
          "icon": "Target"
        },
        {
          "label": "Prevenção",
          "detail": "Pele limpa e seca; alívio de pressão; não massagear proeminências.",
          "icon": "Bed"
        },
        {
          "label": "Estágios",
          "detail": "I eritema; II derme; III subcutâneo; IV osso/tendão.",
          "icon": "Layers"
        },
        {
          "label": "Braden",
          "detail": "Escore de risco — reavaliar e intervir quando indicado.",
          "icon": "Calculator"
        },
        {
          "label": "Pegadinha",
          "detail": "Trocar seco por úmido ou confundir estágio III com IV.",
          "icon": "AlertTriangle"
        }
      ],
      "footer_rule": "Prevenir > tratar — classificar estágio antes da cobertura",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "LPP — estágios",
      "content": "ÚLCERA POR PRESSÃO",
      "rows": [
        {
          "label": "Estágio I",
          "value": "Eritema não branqueável — pele íntegra",
          "badge": "info"
        },
        {
          "label": "Estágio II",
          "value": "Perda parcial da derme",
          "badge": "ok"
        },
        {
          "label": "Estágio III",
          "value": "Perda total da espessura cutânea",
          "badge": "hot"
        },
        {
          "label": "Estágio IV",
          "value": "Osso, tendão ou músculo exposto",
          "badge": "hot"
        },
        {
          "label": "Prevenção",
          "value": "Pele limpa e seca; alívio de pressão",
          "badge": "warn"
        }
      ],
      "footer_rule": "Classificar estágio antes da cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Lesão por pressão sacral, estágio III apresenta base de granulação, exsudato moderado e bordas íntegras: identifique o curativo que atende a essascaracterísticas.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra A: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra A.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — LPP",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Alginato de cálcio simples, substituído diariamente logo após irrigação salina.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "Hidrogel amorfo sob cobertura de gaze, renovado em intervalo máximo de vinte e…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "Filme de poliuretano semipermeável, mantido inalterado por até sete dias consec…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "decorp-enfermagem-curativos-e-manejo-de-feridas-1779344819753-1": {
    "branch": "curativos_ferida_cirurgica",
    "family": "conceito",
    "guideline": "Ferida cirúrgica — técnica e sinais de complicação",
    "concept_map": {
      "slide_title": "Ferida cirúrgica / pós-op",
      "chip_label": "PÓS-OP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "No preparo da sala de pequeno procedimento para sutura simples, qual verificação é responsabilidade direta do técnico antes da entrada do paciente?",
          "icon": "Target"
        },
        {
          "label": "Ferida operatória",
          "detail": "Curativo em ferida cirúrgica — técnica asséptica na troca.",
          "icon": "Bandage"
        },
        {
          "label": "Pós-operatório",
          "detail": "Observar exsudato, bordas e sinais de deiscência.",
          "icon": "Activity"
        },
        {
          "label": "Retirada de pontos",
          "detail": "Pinça anatômica no fio; campo estéril; comunicar alterações.",
          "icon": "Scissors"
        },
        {
          "label": "Sinais de alerta",
          "detail": "Exsudato purulento, odor fétido — comunicar equipe.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Manipulação diária ou técnica invertida na retirada de pontos.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Assépsia + observação na ferida cirúrgica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Ferida operatória",
      "content": "PÓS-OPERATÓRIO",
      "rows": [
        {
          "label": "Curativo",
          "value": "Troca asséptica conforme prescrição/protocolo",
          "badge": "ok"
        },
        {
          "label": "Observar",
          "value": "Exsudato, odor, bordas, deiscência",
          "badge": "info"
        },
        {
          "label": "Comunicar",
          "value": "Purulência ou odor fétido à equipe",
          "badge": "hot"
        },
        {
          "label": "Pontos",
          "value": "Pinça anatômica no fio; tesoura corta",
          "badge": "warn"
        }
      ],
      "footer_rule": "Não manipular sem indicação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: No preparo da sala de pequeno procedimento para sutura simples, qual verificação é responsabilidade direta do técnico antes da entrada do paciente?",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — FERIDA_CIRURGICA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Prescrever profilaxia antimicrobiana em consonância com antibiograma local.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "Regular parâmetros do ventilador mecânico para sedação consciente do usuário.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "Determinar tipo de fio cirúrgico considerado adequado à profundidade da lesão.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "educa-pb-enfermagem-curativos-e-manejo-de-feridas-1779269305691-7": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Nas Feridas altamente colonizadas, infectadas, ou com risco de infecção, com presença de biofilme, crônicas ou agudas e queimaduras (2° e 3° grau), sãoprocedimentos contraindicados: I .",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando V/F: julgar afirmativas I, II, III e IV antes de montar a combinação.",
        "Tema: Nas Feridas altamente colonizadas, infectadas, ou com risco de infecção, com presença de biofilme, crônicas ou agudas e queimaduras (2° e 3° grau), sãoprocedimentos contraindicados: I .",
        "I: “Não utilizar em conjunto com sabonetes, pomadas, óleos ou enzimas.” → ?.",
        "II: “Não associar com tensoativos aniônicos.” → ?.",
        "III: “Não utilizar em cartilagem hialina.” → ?.",
        "IV: “Drenos.” → ?.",
        "Eliminar letra A: combinação não reflete o julgamento item a item.",
        "Eliminar letra B: combinação não reflete o julgamento item a item.",
        "Eliminar letra D: combinação não reflete o julgamento item a item.",
        "Eliminar letra E: combinação não reflete o julgamento item a item.",
        "Marcar letra C: combinação coerente com NPUAP/COFEN e meio úmido.",
        "Fixação: em V/F de curativo — teste assépsia, exsudato e indicação de cobertura por item."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "I, III, IV , apenas.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "II, III , apenas.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "II, III, IV , apenas.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        },
        {
          "label": "Letra E",
          "detail": "I, II, III, IV .",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "facet-enfermagem-curativos-e-manejo-de-feridas-1779269305691-5": {
    "branch": "curativos_dreno",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Durante a troca de curativo em um paciente com dreno de penrose, quais cuidados devem ser priorizados para evitar infecções e garantir o correto funcionamentodo dreno?",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Durante a troca de curativo em um paciente com dreno de penrose, quais cuidados devem ser priorizados para evitar infecções e garantir o correto funcionamentodo dreno?",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — DRENO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Não é necessário utilizar luvas estéreis para realizar a troca do curativo.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "O dreno deve ser completamente retirado para a limpeza adequada do local.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "A troca do curativo deve ser realizada apenas uma vez ao dia, independentemente…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        },
        {
          "label": "Letra E",
          "detail": "O dreno deve ser fixado ao leito do paciente para evitar sua movimentação.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "facet-enfermagem-curativos-e-manejo-de-feridas-1779344751294-9": {
    "branch": "curativos_ferida_cirurgica",
    "family": "conceito",
    "guideline": "Ferida cirúrgica — técnica e sinais de complicação",
    "concept_map": {
      "slide_title": "Ferida cirúrgica / pós-op",
      "chip_label": "PÓS-OP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A avaliação de feridas cirúrgicas em pacientes pós-operatórios exige uma abordagem clínica aprofundada, envolvendo múlti",
          "icon": "Target"
        },
        {
          "label": "Ferida operatória",
          "detail": "Curativo em ferida cirúrgica — técnica asséptica na troca.",
          "icon": "Bandage"
        },
        {
          "label": "Pós-operatório",
          "detail": "Observar exsudato, bordas e sinais de deiscência.",
          "icon": "Activity"
        },
        {
          "label": "Retirada de pontos",
          "detail": "Pinça anatômica no fio; campo estéril; comunicar alterações.",
          "icon": "Scissors"
        },
        {
          "label": "Sinais de alerta",
          "detail": "Exsudato purulento, odor fétido — comunicar equipe.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Manipulação diária ou técnica invertida na retirada de pontos.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Assépsia + observação na ferida cirúrgica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Ferida operatória",
      "content": "PÓS-OPERATÓRIO",
      "rows": [
        {
          "label": "Curativo",
          "value": "Troca asséptica conforme prescrição/protocolo",
          "badge": "ok"
        },
        {
          "label": "Observar",
          "value": "Exsudato, odor, bordas, deiscência",
          "badge": "info"
        },
        {
          "label": "Comunicar",
          "value": "Purulência ou odor fétido à equipe",
          "badge": "hot"
        },
        {
          "label": "Pontos",
          "value": "Pinça anatômica no fio; tesoura corta",
          "badge": "warn"
        }
      ],
      "footer_rule": "Não manipular sem indicação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: A avaliação de feridas cirúrgicas em pacientes pós-operatórios exige uma abordagem clínica aprofundada, envolvendo múlti",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra B: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra B.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — FERIDA_CIRURGICA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Confiar primariamente nos relatos subjetivos de dor do paciente, uma vez que a…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra B."
        },
        {
          "label": "Letra C",
          "detail": "Priorizar a troca de curativos em intervalos regulares conforme o protocolo est…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra B."
        },
        {
          "label": "Letra D",
          "detail": "Realizar uma avaliação focada na sensibilidade cutânea perilesional, pois o des…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra B."
        },
        {
          "label": "Letra E",
          "detail": "Basear a avaliação na mensuração da quantidade de exsudato produzido, uma vez q…",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra B."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "facet-enfermagem-curativos-e-manejo-de-feridas-1779344779828-5": {
    "branch": "curativos_desbridamento",
    "family": "conceito",
    "guideline": "Desbridamento — tipos e indicações",
    "concept_map": {
      "slide_title": "Desbridamento",
      "chip_label": "DESBRIDAMENTO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Um paciente em regime de internação prolongada apresenta úlcera por pressão em trocânter esquerdo, estágio 4, com necrose seca aderida, odor fétido epresença de esfacelo.",
          "icon": "Target"
        },
        {
          "label": "Objetivo",
          "detail": "Remover tecido necrótico/não viável — preparar granulação.",
          "icon": "Scissors"
        },
        {
          "label": "Autolítico",
          "detail": "Hidrogel/hidrocoloide — lento, indolor.",
          "icon": "Clock"
        },
        {
          "label": "Mecânico",
          "detail": "Gaze úmida ou instrumental — risco de trauma se inadequado.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Gaze seca agressiva ou confundir com limpeza simples.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Tipo de desbridamento conforme leito e dor",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Tipos de desbridamento",
      "content": "DESBRIDAMENTO",
      "rows": [
        {
          "label": "Autolítico",
          "value": "Hidrogel/hidrocoloide — lento, indolor",
          "badge": "ok"
        },
        {
          "label": "Enzimático",
          "value": "Colagenase — necrose devitalizada",
          "badge": "info"
        },
        {
          "label": "Instrumental",
          "value": "Cirúrgico/afiado — tecido viável preservado",
          "badge": "hot"
        },
        {
          "label": "Mecânico",
          "value": "Gaze úmida — evitar trauma com gaze seca",
          "badge": "warn"
        }
      ],
      "footer_rule": "Remover não viável — preparar granulação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Um paciente em regime de internação prolongada apresenta úlcera por pressão em trocânter esquerdo, estágio 4, com necrose seca aderida, odor fétido epresença de esfacelo.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra A: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra A.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — DESBRIDAMENTO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Aplicar cobertura hidrocolóide, estimulando desbridamento autolítico e uso de a…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "Avaliar viabilidade de desbridamento cirúrgico, mesmo diante de comorbidades de…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "Manter curativo seco estéril com solução hipertônica, realizando trocas frequen…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        },
        {
          "label": "Letra E",
          "detail": "Iniciar terapia por pressão negativa sem desbridamento prévio, favorecendo cica…",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "facet-enfermagem-curativos-e-manejo-de-feridas-1779344786992-7": {
    "branch": "curativos_cobertura_selecao",
    "family": "conceito",
    "guideline": "Seleção de cobertura — exsudato e leito (NPUAP/COFEN)",
    "concept_map": {
      "slide_title": "Seleção de cobertura",
      "chip_label": "COBERTURA",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Paciente diabético, restrito ao leito há 4 semanas, com lesão calcânea apresentando perda total da espessura da pele, exposição de tecido subcutâneo, bordasregulares e exsudato seropurulento moderado.",
          "icon": "Target"
        },
        {
          "label": "Exsudato",
          "detail": "Baixo → hidrocoloide/filme; moderado/alto → espuma/alginato.",
          "icon": "Droplets"
        },
        {
          "label": "Leito",
          "detail": "Necrose → hidrogel/autólise; granulação → espuma/hidrofibra.",
          "icon": "Layers"
        },
        {
          "label": "Meio úmido",
          "detail": "Ambiente úmido controlado acelera cicatrização — não expor ao ar.",
          "icon": "CloudRain"
        },
        {
          "label": "Pegadinha",
          "detail": "Inverter indicação de espuma/alginato ou usar antisséptico de rotina.",
          "icon": "AlertTriangle"
        },
        {
          "label": "SF no leito",
          "detail": "Limpeza padrão com soro fisiológico — evitar álcool rotineiro.",
          "icon": "FlaskConical"
        }
      ],
      "footer_rule": "Leito + exsudato → cobertura; limpeza = SF",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Paciente diabético, restrito ao leito há 4 semanas, com lesão calcânea apresentando perda total da espessura da pele, exposição de tecido subcutâneo, bordasregulares e exsudato seropurulento moderado.",
        "Eliminar A: antisséptico citotóxico não é limpeza de rotina no leito — SF 0,9%.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar E: antisséptico citotóxico não é limpeza de rotina no leito — SF 0,9%.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — COBERTURA_SELECAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Classificar como estágio II, limpar com álcool 70% e manter cobertura seca troc…",
          "correct": "antisséptico citotóxico não é limpeza de rotina no leito — SF 0,9% — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "Classificar como estágio IV, realizar desbridamento mecânico imediato e aplicar…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "Classificar como estágio I, aplicar pomada antibiótica tópica e manter exposiçã…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        },
        {
          "label": "Letra E",
          "detail": "Classificar como estágio II, aplicar iodopovidona em alta concentração e gaze c…",
          "correct": "antisséptico citotóxico não é limpeza de rotina no leito — SF 0,9% — distrator E; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "facet-enfermagem-curativos-e-manejo-de-feridas-1779344786992-9": {
    "branch": "curativos_desbridamento",
    "family": "conceito",
    "guideline": "Desbridamento — tipos e indicações",
    "concept_map": {
      "slide_title": "Desbridamento",
      "chip_label": "DESBRIDAMENTO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Em atendimento domiciliar, idoso hipertenso e diabético apresenta ferida em pé direito com necrose seca, ausência de pulsos periféricos e queixa de dor intensanoturna.",
          "icon": "Target"
        },
        {
          "label": "Objetivo",
          "detail": "Remover tecido necrótico/não viável — preparar granulação.",
          "icon": "Scissors"
        },
        {
          "label": "Autolítico",
          "detail": "Hidrogel/hidrocoloide — lento, indolor.",
          "icon": "Clock"
        },
        {
          "label": "Mecânico",
          "detail": "Gaze úmida ou instrumental — risco de trauma se inadequado.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Gaze seca agressiva ou confundir com limpeza simples.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Tipo de desbridamento conforme leito e dor",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Tipos de desbridamento",
      "content": "DESBRIDAMENTO",
      "rows": [
        {
          "label": "Autolítico",
          "value": "Hidrogel/hidrocoloide — lento, indolor",
          "badge": "ok"
        },
        {
          "label": "Enzimático",
          "value": "Colagenase — necrose devitalizada",
          "badge": "info"
        },
        {
          "label": "Instrumental",
          "value": "Cirúrgico/afiado — tecido viável preservado",
          "badge": "hot"
        },
        {
          "label": "Mecânico",
          "value": "Gaze úmida — evitar trauma com gaze seca",
          "badge": "warn"
        }
      ],
      "footer_rule": "Remover não viável — preparar granulação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Em atendimento domiciliar, idoso hipertenso e diabético apresenta ferida em pé direito com necrose seca, ausência de pulsos periféricos e queixa de dor intensanoturna.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra E: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra E.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — DESBRIDAMENTO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Realizar desbridamento cirúrgico imediato, removendo tecido necrótico por incis…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra E."
        },
        {
          "label": "Letra B",
          "detail": "Indicar angioplastia periférica imediata, orientando paciente e familiares quan…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra E."
        },
        {
          "label": "Letra C",
          "detail": "Aplicar pomadas antibióticas de forma autônoma e prescrever analgésicos orais,…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra E."
        },
        {
          "label": "Letra D",
          "detail": "Efetuar irrigação vigorosa da ferida com SF 0,9% em jato, removendo mecanicamen…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra E."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "fau-unicentro-enfermagem-curativos-e-manejo-de-feridas-1779344759089-4": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Solução indicada para limpeza de feridas, queimaduras, escoriações, cortes e incisões cirúrgicas:",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Solução indicada para limpeza de feridas, queimaduras, escoriações, cortes e incisões cirúrgicas:",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra A: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra A.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Soro iodado.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "Soro muriático.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "Soro antiofídico.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        },
        {
          "label": "Letra E",
          "detail": "Soro hialurônico.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "fau-unicentro-enfermagem-curativos-e-manejo-de-feridas-1779344773456-4": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Assinale a única alternativa correta, que aponta uma recomendação internacional para prevenção de Lesões por Pressão.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Assinale a única alternativa correta, que aponta uma recomendação internacional para prevenção de Lesões por Pressão.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Manter a pele limpa e úmida.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "Utilizar um produto de limpeza da pele com um pH alcalino.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "Contraindicar a utilização de produtos contendo emolientes para hidratação cutâ…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        },
        {
          "label": "Letra E",
          "detail": "Evitar produtos que são recomendados para prevenção de Dermatites Associadas à…",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "fepese-enfermagem-curativos-e-manejo-de-feridas-1779340178514-6": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Assinale a alternativa correta acerca dos cuidados com curativos.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Assinale a alternativa correta acerca dos cuidados com curativos.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Um bom curativo deve manter a ferida sem umidade, já que a umidade no leito da…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "Se o mesmo paciente tiver mais de uma lesão, recomenda-se iniciar os curativos…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "Na ausência de pacote de curativos com as pinças, a troca de curativo poderá se…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        },
        {
          "label": "Letra E",
          "detail": "Na necessidade de tratamento com pomadas e cremes, o técnico de enfermagem está…",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "fepese-enfermagem-curativos-e-manejo-de-feridas-1779344779828-7": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Analise as afirmativas abaixo sobre úlceras de pressão e os cuidados necessários para sua prevenção.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Analise as afirmativas abaixo sobre úlceras de pressão e os cuidados necessários para sua prevenção.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "São corretas apenas as afirmativas 1 e 2.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "São corretas apenas as afirmativas 2 e 4.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "São corretas apenas as afirmativas 1, 3 e 4.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        },
        {
          "label": "Letra E",
          "detail": "São corretas apenas as afirmativas 2, 3 e 4.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "fepese-enfermagem-curativos-e-manejo-de-feridas-1779344819753-2": {
    "branch": "curativos_cobertura_selecao",
    "family": "vf",
    "guideline": "Seleção de cobertura — exsudato e leito (NPUAP/COFEN)",
    "concept_map": {
      "slide_title": "Seleção de cobertura",
      "chip_label": "COBERTURA",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Na realização de curativos, o profissional de enfermagem deve observar princípios que favorecem o processo de cicatrização tecidual.",
          "icon": "Target"
        },
        {
          "label": "Exsudato",
          "detail": "Baixo → hidrocoloide/filme; moderado/alto → espuma/alginato.",
          "icon": "Droplets"
        },
        {
          "label": "Leito",
          "detail": "Necrose → hidrogel/autólise; granulação → espuma/hidrofibra.",
          "icon": "Layers"
        },
        {
          "label": "Meio úmido",
          "detail": "Ambiente úmido controlado acelera cicatrização — não expor ao ar.",
          "icon": "CloudRain"
        },
        {
          "label": "Pegadinha",
          "detail": "Inverter indicação de espuma/alginato ou usar antisséptico de rotina.",
          "icon": "AlertTriangle"
        },
        {
          "label": "SF no leito",
          "detail": "Limpeza padrão com soro fisiológico — evitar álcool rotineiro.",
          "icon": "FlaskConical"
        }
      ],
      "footer_rule": "Leito + exsudato → cobertura; limpeza = SF",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Julgar cada afirmativa numerada sobre o curativo ideal.",
        "Tema: Na realização de curativos, o profissional de enfermagem deve observar princípios que favorecem o processo de cicatrização tecidual.",
        "1: “Protege de trocas gasosas.” → F.",
        "2: “Mantém o excesso de exsudato.” → F.",
        "3: “Promove isolamento térmico.” → V.",
        "4: “Protege de infecções secundárias.” → V.",
        "5: “Mantém a umidade no espaço entre a ferida e o curativo.” → ?.",
        "6: “Proporciona conforto ao paciente, inclusive durante as troc…” → ?.",
        "Eliminar A: combinação de afirmativas incorreta.",
        "Eliminar B: combinação de afirmativas incorreta.",
        "Eliminar C: combinação de afirmativas incorreta.",
        "Eliminar D: combinação de afirmativas incorreta.",
        "Marcar letra E.",
        "Fixação: curativo ideal = permeável, absorve exsudato, protege de infecção e mantém umidade controlada."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — COBERTURA_SELECAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "São corretas apenas as afirmativas 1, 3 e 5.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra E."
        },
        {
          "label": "Letra B",
          "detail": "São corretas apenas as afirmativas 2, 4 e 6.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra E."
        },
        {
          "label": "Letra C",
          "detail": "São corretas apenas as afirmativas 1, 2, 3 e 4.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra E."
        },
        {
          "label": "Letra D",
          "detail": "São corretas apenas as afirmativas 2, 3, 4 e 5.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra E."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "fepese-enfermagem-curativos-e-manejo-de-feridas-1779344819753-3": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Durante as trocas de curativos, um dos cuidados é a avaliação dos sinais flogísticos.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Durante as trocas de curativos, um dos cuidados é a avaliação dos sinais flogísticos.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra A: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra A.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Maceração, hiperqueratose e enduração",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "Fluidez, espessura, purulência",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "Seroso, sanguinolento, serosanguinolento e purulento",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        },
        {
          "label": "Letra E",
          "detail": "Esfacelo, necrose e granulação",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "fgv-enfermagem-curativos-e-manejo-de-feridas-1779344759089-5": {
    "branch": "curativos_cobertura_selecao",
    "family": "conceito",
    "guideline": "Seleção de cobertura — exsudato e leito (NPUAP/COFEN)",
    "concept_map": {
      "slide_title": "Seleção de cobertura",
      "chip_label": "COBERTURA",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Com base nas características e nas indicações dos vários tipos de coberturas utilizadas na realização de curativos, assinale a afirmativa correta.",
          "icon": "Target"
        },
        {
          "label": "Exsudato",
          "detail": "Baixo → hidrocoloide/filme; moderado/alto → espuma/alginato.",
          "icon": "Droplets"
        },
        {
          "label": "Leito",
          "detail": "Necrose → hidrogel/autólise; granulação → espuma/hidrofibra.",
          "icon": "Layers"
        },
        {
          "label": "Meio úmido",
          "detail": "Ambiente úmido controlado acelera cicatrização — não expor ao ar.",
          "icon": "CloudRain"
        },
        {
          "label": "Pegadinha",
          "detail": "Inverter indicação de espuma/alginato ou usar antisséptico de rotina.",
          "icon": "AlertTriangle"
        },
        {
          "label": "SF no leito",
          "detail": "Limpeza padrão com soro fisiológico — evitar álcool rotineiro.",
          "icon": "FlaskConical"
        }
      ],
      "footer_rule": "Leito + exsudato → cobertura; limpeza = SF",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Com base nas características e nas indicações dos vários tipos de coberturas utilizadas na realização de curativos, assinale a afirmativa correta.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: espuma absorve exsudato — indicada em exsudação moderada/alta.",
        "Eliminar D: alginato absorve exsudato — indicado em feridas cavitárias exsudativas.",
        "Letra E: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra E.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — COBERTURA_SELECAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "As coberturas de carvão ativado são recomendadas para feridas com pouco ou nenh…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra E."
        },
        {
          "label": "Letra B",
          "detail": "As películas transparentes são ideais para feridas infectadas, pois permitem a…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra E."
        },
        {
          "label": "Letra C",
          "detail": "As espumas de poliuretano são contraindicadas para feridas com exsudação modera…",
          "correct": "espuma absorve exsudato — indicada em exsudação moderada/alta — distrator C; gabarito é letra E."
        },
        {
          "label": "Letra D",
          "detail": "As coberturas com alginato de cálcio são contraindicadas em feridas cavitárias…",
          "correct": "alginato absorve exsudato — indicado em feridas cavitárias exsudativas — distrator D; gabarito é letra E."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "fgv-enfermagem-curativos-e-manejo-de-feridas-1779344819753-5": {
    "branch": "curativos_estomia",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Acerca dos cuidados de enfermagem ao paciente com ostomia , avalie se as afirmativas a seguir são verdadeiras ( V ) ou falsas ( F ).",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Acerca dos cuidados de enfermagem ao paciente com ostomia , avalie se as afirmativas a seguir são verdadeiras ( V ) ou falsas ( F ).",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra E: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra E.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — ESTOMIA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "F – F – F .",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra E."
        },
        {
          "label": "Letra B",
          "detail": "V – F – F .",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra E."
        },
        {
          "label": "Letra C",
          "detail": "F – V – V .",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra E."
        },
        {
          "label": "Letra D",
          "detail": "V – V – V .",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra E."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "fundep-enfermagem-curativos-e-manejo-de-feridas-1779269212740-6": {
    "branch": "curativos_ferida_cirurgica",
    "family": "conceito",
    "guideline": "Ferida cirúrgica — técnica e sinais de complicação",
    "concept_map": {
      "slide_title": "Ferida cirúrgica / pós-op",
      "chip_label": "PÓS-OP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Considere que um usuário compareceu à unidade de saúde em pós-operatório de apendicectomia para a realização de curativo de uma ferida operatória.",
          "icon": "Target"
        },
        {
          "label": "Ferida operatória",
          "detail": "Curativo em ferida cirúrgica — técnica asséptica na troca.",
          "icon": "Bandage"
        },
        {
          "label": "Pós-operatório",
          "detail": "Observar exsudato, bordas e sinais de deiscência.",
          "icon": "Activity"
        },
        {
          "label": "Retirada de pontos",
          "detail": "Pinça anatômica no fio; campo estéril; comunicar alterações.",
          "icon": "Scissors"
        },
        {
          "label": "Sinais de alerta",
          "detail": "Exsudato purulento, odor fétido — comunicar equipe.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Manipulação diária ou técnica invertida na retirada de pontos.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Assépsia + observação na ferida cirúrgica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Ferida operatória",
      "content": "PÓS-OPERATÓRIO",
      "rows": [
        {
          "label": "Curativo",
          "value": "Troca asséptica conforme prescrição/protocolo",
          "badge": "ok"
        },
        {
          "label": "Observar",
          "value": "Exsudato, odor, bordas, deiscência",
          "badge": "info"
        },
        {
          "label": "Comunicar",
          "value": "Purulência ou odor fétido à equipe",
          "badge": "hot"
        },
        {
          "label": "Pontos",
          "value": "Pinça anatômica no fio; tesoura corta",
          "badge": "warn"
        }
      ],
      "footer_rule": "Não manipular sem indicação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Considere que um usuário compareceu à unidade de saúde em pós-operatório de apendicectomia para a realização de curativo de uma ferida operatória.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra B: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra B.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — FERIDA_CIRURGICA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "imprudência.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra B."
        },
        {
          "label": "Letra C",
          "detail": "imperícia.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra B."
        },
        {
          "label": "Letra D",
          "detail": "inconsistência.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra B."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "funtef-enfermagem-curativos-e-manejo-de-feridas-1779269305691-4": {
    "branch": "curativos_tecnica_assepsia",
    "family": "conceito",
    "guideline": "Técnica asséptica e limpeza com SF 0,9%",
    "concept_map": {
      "slide_title": "Técnica asséptica no curativo",
      "chip_label": "ASSÉPSIA",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "O curativo é uma das técnicas mais realizadas pela equipe de enfermagem.",
          "icon": "Target"
        },
        {
          "label": "Sequência",
          "detail": "Da área menos contaminada para a mais contaminada.",
          "icon": "ArrowDown"
        },
        {
          "label": "Limpeza",
          "detail": "Soro fisiológico — movimentos do centro para periferia do leito.",
          "icon": "Droplets"
        },
        {
          "label": "Troca",
          "detail": "Material estéril; lavar mãos; campo limpo.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Ordem invertida ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Menos → mais contaminado; SF no leito",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Sequência asséptica",
      "content": "TÉCNICA DE CURATIVO",
      "rows": [
        {
          "label": "Limpeza",
          "value": "Soro fisiológico — centro para periferia",
          "badge": "ok"
        },
        {
          "label": "Ordem",
          "value": "Menos contaminado para mais contaminado",
          "badge": "hot"
        },
        {
          "label": "Material",
          "value": "Estéril e único uso quando indicado",
          "badge": "info"
        }
      ],
      "footer_rule": "Assépsia protege leito e perilesional",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: O curativo é uma das técnicas mais realizadas pela equipe de enfermagem.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra B: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra B.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — TECNICA_ASSEPSIA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Trocar o curativo 01x na semana com PVPI degermante, depois utilizar o tópico e…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra B."
        },
        {
          "label": "Letra C",
          "detail": "Trocar 01 x ao dia utilizando água oxigenada e SF a 20%; repassar a enfermeira…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra B."
        },
        {
          "label": "Letra D",
          "detail": "Trocar o curativo a cada 02 dias e manter a ferida sem micropore, independente…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra B."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "furb-enfermagem-curativos-e-manejo-de-feridas-1779344786992-1": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Considere as afirmativas relacionadas a lesões por pressão apresentadas a seguir.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Considere as afirmativas relacionadas a lesões por pressão apresentadas a seguir.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra E: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra E.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "F − F − V.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra E."
        },
        {
          "label": "Letra B",
          "detail": "V − F − F.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra E."
        },
        {
          "label": "Letra C",
          "detail": "V − F − V.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra E."
        },
        {
          "label": "Letra D",
          "detail": "F − V − F.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra E."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "gama-enfermagem-curativos-e-manejo-de-feridas-1779269291153-4": {
    "branch": "curativos_tecnica_assepsia",
    "family": "conceito",
    "guideline": "Técnica asséptica e limpeza com SF 0,9%",
    "concept_map": {
      "slide_title": "Técnica asséptica no curativo",
      "chip_label": "ASSÉPSIA",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Durante a realização de um curativo em uma ferida aberta, qual a sequência correta de procedimentos para garantir a assepsia e prevenir a infecção?",
          "icon": "Target"
        },
        {
          "label": "Sequência",
          "detail": "Da área menos contaminada para a mais contaminada.",
          "icon": "ArrowDown"
        },
        {
          "label": "Limpeza",
          "detail": "Soro fisiológico — movimentos do centro para periferia do leito.",
          "icon": "Droplets"
        },
        {
          "label": "Troca",
          "detail": "Material estéril; lavar mãos; campo limpo.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Ordem invertida ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Menos → mais contaminado; SF no leito",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Sequência asséptica",
      "content": "TÉCNICA DE CURATIVO",
      "rows": [
        {
          "label": "Limpeza",
          "value": "Soro fisiológico — centro para periferia",
          "badge": "ok"
        },
        {
          "label": "Ordem",
          "value": "Menos contaminado para mais contaminado",
          "badge": "hot"
        },
        {
          "label": "Material",
          "value": "Estéril e único uso quando indicado",
          "badge": "info"
        }
      ],
      "footer_rule": "Assépsia protege leito e perilesional",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Durante a realização de um curativo em uma ferida aberta, qual a sequência correta de procedimentos para garantir a assepsia e prevenir a infecção?",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — TECNICA_ASSEPSIA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Aplicar nova cobertura, limpar a ferida com solução antisséptica, remover a cob…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "Remover a cobertura antiga, realizar a higiene das mãos, limpar a ferida com so…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "Limpar a ferida com solução antisséptica, remover a cobertura antiga, aplicar n…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "iaupe-enfermagem-curativos-e-manejo-de-feridas-1779269228428-1": {
    "branch": "curativos_desbridamento",
    "family": "vf",
    "guideline": "Desbridamento — tipos e indicações",
    "concept_map": {
      "slide_title": "Desbridamento — itens I–IV",
      "chip_label": "DESBRIDAMENTO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "O uso de curativos requer um conhecimento extenso sobre o processo de cicatrização, a escolha de um tipo de curativo depende da avaliação da ferida e da fasede cicatrização em que se encontra.",
          "icon": "Target"
        },
        {
          "label": "Objetivo",
          "detail": "Remover tecido necrótico/não viável — preparar granulação.",
          "icon": "Scissors"
        },
        {
          "label": "Autolítico",
          "detail": "Hidrogel/hidrocoloide — lento, indolor.",
          "icon": "Clock"
        },
        {
          "label": "Mecânico",
          "detail": "Gaze úmida ou instrumental — risco de trauma se inadequado.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Gaze seca agressiva ou confundir com limpeza simples.",
          "icon": "XCircle"
        },
        {
          "label": "Afirmativa I",
          "detail": "Um curativo simples que não exerce nenhum tipo de pressão sob uma ferida tem …",
          "icon": "ListChecks"
        },
        {
          "label": "Afirmativa II",
          "detail": "Feridas com mínima perda tecidual e de pequena extensão, sem drenagem de exsu…",
          "icon": "ListChecks"
        }
      ],
      "footer_rule": "Tipo de desbridamento conforme leito e dor",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Tipos de desbridamento",
      "content": "DESBRIDAMENTO",
      "rows": [
        {
          "label": "Autolítico",
          "value": "Hidrogel/hidrocoloide — lento, indolor",
          "badge": "ok"
        },
        {
          "label": "Enzimático",
          "value": "Colagenase — necrose devitalizada",
          "badge": "info"
        },
        {
          "label": "Instrumental",
          "value": "Cirúrgico/afiado — tecido viável preservado",
          "badge": "hot"
        },
        {
          "label": "Mecânico",
          "value": "Gaze úmida — evitar trauma com gaze seca",
          "badge": "warn"
        }
      ],
      "footer_rule": "Remover não viável — preparar granulação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando V/F: julgar afirmativas I, II, III e IV antes de montar a combinação.",
        "Tema: O uso de curativos requer um conhecimento extenso sobre o processo de cicatrização, a escolha de um tipo de curativo depende da avaliação da ferida e da fasede cicatrização em que se encontra.",
        "I: “Um curativo simples que não exerce nenhum tipo de pressão sob uma f…” → ?.",
        "II: “Feridas com mínima perda tecidual e de pequena extensão, sem drenag…” → ?.",
        "III: “Em feridas que cicatrizam por segunda intenção, um curativo deve te…” → ?.",
        "IV: “Feridas com pouco exsudato e em processo de cicatrização devem ser …” → ?.",
        "Eliminar letra A: combinação não reflete o julgamento item a item.",
        "Eliminar letra B: combinação não reflete o julgamento item a item.",
        "Eliminar letra C: combinação não reflete o julgamento item a item.",
        "Eliminar letra D: combinação não reflete o julgamento item a item.",
        "Marcar letra E: combinação coerente com NPUAP/COFEN e meio úmido.",
        "Fixação: em V/F de curativo — teste assépsia, exsudato e indicação de cobertura por item."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — DESBRIDAMENTO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "I , II e III .",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra E."
        },
        {
          "label": "Letra B",
          "detail": "I , II e IV .",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra E."
        },
        {
          "label": "Letra C",
          "detail": "II e IV .",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra E."
        },
        {
          "label": "Letra D",
          "detail": "I e IV .",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra E."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "ibade-enfermagem-curativos-e-manejo-de-feridas-1779344819753-6": {
    "branch": "curativos_tecnica_assepsia",
    "family": "conceito",
    "guideline": "Técnica asséptica e limpeza com SF 0,9%",
    "concept_map": {
      "slide_title": "Técnica asséptica no curativo",
      "chip_label": "ASSÉPSIA",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Sobre procedimentos técnicos de enfermagem, avalie as afirmações abaixo como VERDADEIRAS ou FALSAS .",
          "icon": "Target"
        },
        {
          "label": "Sequência",
          "detail": "Da área menos contaminada para a mais contaminada.",
          "icon": "ArrowDown"
        },
        {
          "label": "Limpeza",
          "detail": "Soro fisiológico — movimentos do centro para periferia do leito.",
          "icon": "Droplets"
        },
        {
          "label": "Troca",
          "detail": "Material estéril; lavar mãos; campo limpo.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Ordem invertida ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Menos → mais contaminado; SF no leito",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Sequência asséptica",
      "content": "TÉCNICA DE CURATIVO",
      "rows": [
        {
          "label": "Limpeza",
          "value": "Soro fisiológico — centro para periferia",
          "badge": "ok"
        },
        {
          "label": "Ordem",
          "value": "Menos contaminado para mais contaminado",
          "badge": "hot"
        },
        {
          "label": "Material",
          "value": "Estéril e único uso quando indicado",
          "badge": "info"
        }
      ],
      "footer_rule": "Assépsia protege leito e perilesional",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Sobre procedimentos técnicos de enfermagem, avalie as afirmações abaixo como VERDADEIRAS ou FALSAS .",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra A: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra A.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — TECNICA_ASSEPSIA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "1.F, 2.V, 3.F;",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "1.V, 2.V, 3.F;",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "1.V, 2.F, 3.F;",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        },
        {
          "label": "Letra E",
          "detail": "1.F, 2.V, 3.V.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "ibfc-enfermagem-curativos-e-manejo-de-feridas-1779269291153-1": {
    "branch": "curativos_bandagem_imobilizacao",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Assinale a alternativa correta sobre a indicação de bandagem recorrente.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Assinale a alternativa correta sobre a indicação de bandagem recorrente.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra B: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra B.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — BANDAGEM_IMOBILIZACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Regiões cilíndricas como antebraço, dedos, troncos",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra B."
        },
        {
          "label": "Letra C",
          "detail": "Regiões em forma de cone como braço, pernas, coxas",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra B."
        },
        {
          "label": "Letra D",
          "detail": "Regiões cilíndricas e curtas do corpo como pescoço",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra B."
        },
        {
          "label": "Letra E",
          "detail": "Regiões de articulações como cotovelo",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra B."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "ibfc-enfermagem-curativos-e-manejo-de-feridas-1779344766321-1": {
    "branch": "curativos_exceto_incorreta",
    "family": "certo_errado",
    "guideline": "EXCETO — conduta em curativo",
    "concept_map": {
      "slide_title": "EXCETO em curativo",
      "chip_label": "EXCETO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "São contraindicações relativas nos curativos de feridas traumáticas, exceto :",
          "icon": "Target"
        },
        {
          "label": "Lógica",
          "detail": "Três condutas corretas + uma exceção — não inverta.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Assépsia",
          "detail": "SF, técnica, comunicação de sinais de infecção.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Cobertura",
          "detail": "Escolha por exsudato e leito — não antisséptico rotineiro.",
          "icon": "Bandage"
        }
      ],
      "footer_rule": "Valide cada letra como correta antes de achar a exceção",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.",
        "Enquadramento: São contraindicações relativas nos curativos de feridas traumáticas, exceto :",
        "Letra A: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra B: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra D: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra C: única exceção — viola técnica asséptica ou indicação de cobertura.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — EXCETO_INCORRETA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "feridas que sangram ativamente não devem ser irrigadas",
          "correct": "Em EXCETO, A descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra B — conduta correta",
          "detail": "feridas em área de pele altamente vascularizada podem não necessitar de irrigaç…",
          "correct": "Em EXCETO, B descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra C — exceção (gabarito)",
          "detail": "os curativos devem manter as feridas úmidas, mas não em excesso",
          "correct": "INCORRETA nesta prova: conduta correta em curativos — não é a exceção pedida — única exceção pedida no enunciado."
        },
        {
          "label": "Letra D — conduta correta",
          "detail": "deve-se avaliar cuidadosamente feridas profundas, antes da irrigação para evita…",
          "correct": "Em EXCETO, D descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "ibgp-enfermagem-curativos-e-manejo-de-feridas-1779340178514-8": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Um dos cuidados de enfermagem importantes, antes da aplicação da Bota de Unna, é SOLICITAR ao paciente que:",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Um dos cuidados de enfermagem importantes, antes da aplicação da Bota de Unna, é SOLICITAR ao paciente que:",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Venha, em jejum, à Unidade para aplicação.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "Higienize bem os membros afetados, com água e sabão e realize o enfaixamento an…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "Pulverize os membros afetados com álcool a 70%, 30 minutos antes do procediment…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "idecan-enfermagem-curativos-e-manejo-de-feridas-1778712165781-0": {
    "branch": "curativos_estomia",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Um paciente de 55 anos, em pós-operatório imediato de colostomia, apresenta sinais de vermelhidão na pele periestomal e queixa de desconforto na área de adesão do dispositivo coletor.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Um paciente de 55 anos, em pós-operatório imediato de colostomia, apresenta sinais de vermelhidão na pele periestomal e queixa de desconforto na área de adesão do dispositivo coletor.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — ESTOMIA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "A troca do dispositivo coletor deve ser diária, pois a exposição frequente do e…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "O protetor cutâneo precisa ser recortado sempre com uma folga maior que 5 mm pa…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "O uso de barreira protetora líquida dispensa a limpeza com água e sabão neutro,…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        },
        {
          "label": "Letra E",
          "detail": "Dispositivos de duas peças são contraindicados em todos os casos de colostomia…",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "idecan-enfermagem-curativos-e-manejo-de-feridas-1778712165781-1": {
    "branch": "curativos_ferida_cirurgica",
    "family": "conceito",
    "guideline": "Ferida cirúrgica — técnica e sinais de complicação",
    "concept_map": {
      "slide_title": "Ferida cirúrgica / pós-op",
      "chip_label": "PÓS-OP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Durante a realização de um curativo simples em uma ferida cirurgica com drenagem serossanguinolenta em cicatrização por ",
          "icon": "Target"
        },
        {
          "label": "Ferida operatória",
          "detail": "Curativo em ferida cirúrgica — técnica asséptica na troca.",
          "icon": "Bandage"
        },
        {
          "label": "Pós-operatório",
          "detail": "Observar exsudato, bordas e sinais de deiscência.",
          "icon": "Activity"
        },
        {
          "label": "Retirada de pontos",
          "detail": "Pinça anatômica no fio; campo estéril; comunicar alterações.",
          "icon": "Scissors"
        },
        {
          "label": "Sinais de alerta",
          "detail": "Exsudato purulento, odor fétido — comunicar equipe.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Manipulação diária ou técnica invertida na retirada de pontos.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Assépsia + observação na ferida cirúrgica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Ferida operatória",
      "content": "PÓS-OPERATÓRIO",
      "rows": [
        {
          "label": "Curativo",
          "value": "Troca asséptica conforme prescrição/protocolo",
          "badge": "ok"
        },
        {
          "label": "Observar",
          "value": "Exsudato, odor, bordas, deiscência",
          "badge": "info"
        },
        {
          "label": "Comunicar",
          "value": "Purulência ou odor fétido à equipe",
          "badge": "hot"
        },
        {
          "label": "Pontos",
          "value": "Pinça anatômica no fio; tesoura corta",
          "badge": "warn"
        }
      ],
      "footer_rule": "Não manipular sem indicação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Durante a realização de um curativo simples em uma ferida cirurgica com drenagem serossanguinolenta em cicatrização por ",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — FERIDA_CIRURGICA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "utilizar solução de cloreto de sódio 0,9% gelado diretamente no leito da ferida…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "aplicar PVPI alcoolico na pele perilesional, iniciando a antissepsia no ponto m…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "manter a ferida descoberta por 24 horas para ventilação, aplicando cobertura so…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        },
        {
          "label": "Letra E",
          "detail": "realizar limpeza vigorosa com gluconato de clorexidina 4% nao aquecido, reaprov…",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "idecan-enfermagem-curativos-e-manejo-de-feridas-1778712165781-2": {
    "branch": "curativos_bandagem_imobilizacao",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A bandagem é uma técnica utilizada para cobrir e proteger uma parte do corpo, geralmente com o uso de ataduras ou outros dispositivos.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: A bandagem é uma técnica utilizada para cobrir e proteger uma parte do corpo, geralmente com o uso de ataduras ou outros dispositivos.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra E: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra E.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — BANDAGEM_IMOBILIZACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Usar apenas um tipo de bandagem para todas as situações, independentemente da n…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra E."
        },
        {
          "label": "Letra B",
          "detail": "Não observar as condições da circulação local, pois a prioridade é a proteção d…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra E."
        },
        {
          "label": "Letra C",
          "detail": "Aplicar a bandagem sem verificar a presença de lesões pré-existentes na área a…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra E."
        },
        {
          "label": "Letra D",
          "detail": "Aplicar a bandagem o mais apertada possível para garantir a imobilização.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra E."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "idesg-enfermagem-curativos-e-manejo-de-feridas-1779344759089-7": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Sobre os tipos de curativos e suas indicações, assinale a alternativa correta .",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Sobre os tipos de curativos e suas indicações, assinale a alternativa correta .",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Os curativos oclusivos são indicados para feridas secas, pois promovem a desidr…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "O uso de gaze simples é a melhor escolha para feridas com necrose, pois favorec…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "Curativos com carvão ativado são indicados exclusivamente para controle de hemo…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "idesg-enfermagem-curativos-e-manejo-de-feridas-1779344766321-0": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Durante a realização de curativos em ambiente hospitalar, é essencial:",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Durante a realização de curativos em ambiente hospitalar, é essencial:",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra A: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra A.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Realizar o curativo sem luvas em feridas já cicatrizadas.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "Remover o curativo antigo sem qualquer precaução para evitar dor ao paciente.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "Utilizar apenas solução fisiológica, independentemente da prescrição médica.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "inaz-do-para-enfermagem-curativos-e-manejo-de-feridas-1779269228428-0": {
    "branch": "curativos_lpp",
    "family": "conceito",
    "guideline": "LPP — prevenção e estágios NPUAP",
    "concept_map": {
      "slide_title": "LPP — prevenção e estágios",
      "chip_label": "LPP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Um paciente idoso, internado em uma unidade de clínica médica, apresenta risco para úlcera de pressão devido à imobilidade e à fragilidade da pele.",
          "icon": "Target"
        },
        {
          "label": "Prevenção",
          "detail": "Pele limpa e seca; alívio de pressão; não massagear proeminências.",
          "icon": "Bed"
        },
        {
          "label": "Estágios",
          "detail": "I eritema; II derme; III subcutâneo; IV osso/tendão.",
          "icon": "Layers"
        },
        {
          "label": "Braden",
          "detail": "Escore de risco — reavaliar e intervir quando indicado.",
          "icon": "Calculator"
        },
        {
          "label": "Pegadinha",
          "detail": "Trocar seco por úmido ou confundir estágio III com IV.",
          "icon": "AlertTriangle"
        }
      ],
      "footer_rule": "Prevenir > tratar — classificar estágio antes da cobertura",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "LPP — estágios",
      "content": "ÚLCERA POR PRESSÃO",
      "rows": [
        {
          "label": "Estágio I",
          "value": "Eritema não branqueável — pele íntegra",
          "badge": "info"
        },
        {
          "label": "Estágio II",
          "value": "Perda parcial da derme",
          "badge": "ok"
        },
        {
          "label": "Estágio III",
          "value": "Perda total da espessura cutânea",
          "badge": "hot"
        },
        {
          "label": "Estágio IV",
          "value": "Osso, tendão ou músculo exposto",
          "badge": "hot"
        },
        {
          "label": "Prevenção",
          "value": "Pele limpa e seca; alívio de pressão",
          "badge": "warn"
        }
      ],
      "footer_rule": "Classificar estágio antes da cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Um paciente idoso, internado em uma unidade de clínica médica, apresenta risco para úlcera de pressão devido à imobilidade e à fragilidade da pele.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — LPP",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Manter a pele do paciente sempre seca, utilizando talco para absorver a umidade…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "Realizar mudanças de decúbito a cada 2 horas, massageando as proeminências ósse…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "Elevar a cabeceira do leito a 30 graus para prevenir a aspiração e realizar hig…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        },
        {
          "label": "Letra E",
          "detail": "Aplicar compressas mornas nas proeminências ósseas a cada 4 horas para aumentar…",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "inaz-do-para-enfermagem-curativos-e-manejo-de-feridas-1779269244710-7": {
    "branch": "curativos_ferida_cirurgica",
    "family": "conceito",
    "guideline": "Ferida cirúrgica — técnica e sinais de complicação",
    "concept_map": {
      "slide_title": "Ferida cirúrgica / pós-op",
      "chip_label": "PÓS-OP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Um paciente está no segundo dia pós-operatório de laparotomia exploradora.",
          "icon": "Target"
        },
        {
          "label": "Ferida operatória",
          "detail": "Curativo em ferida cirúrgica — técnica asséptica na troca.",
          "icon": "Bandage"
        },
        {
          "label": "Pós-operatório",
          "detail": "Observar exsudato, bordas e sinais de deiscência.",
          "icon": "Activity"
        },
        {
          "label": "Retirada de pontos",
          "detail": "Pinça anatômica no fio; campo estéril; comunicar alterações.",
          "icon": "Scissors"
        },
        {
          "label": "Sinais de alerta",
          "detail": "Exsudato purulento, odor fétido — comunicar equipe.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Manipulação diária ou técnica invertida na retirada de pontos.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Assépsia + observação na ferida cirúrgica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Ferida operatória",
      "content": "PÓS-OPERATÓRIO",
      "rows": [
        {
          "label": "Curativo",
          "value": "Troca asséptica conforme prescrição/protocolo",
          "badge": "ok"
        },
        {
          "label": "Observar",
          "value": "Exsudato, odor, bordas, deiscência",
          "badge": "info"
        },
        {
          "label": "Comunicar",
          "value": "Purulência ou odor fétido à equipe",
          "badge": "hot"
        },
        {
          "label": "Pontos",
          "value": "Pinça anatômica no fio; tesoura corta",
          "badge": "warn"
        }
      ],
      "footer_rule": "Não manipular sem indicação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Um paciente está no segundo dia pós-operatório de laparotomia exploradora.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra A: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra A.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — FERIDA_CIRURGICA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Realizar limpeza da ferida conforme protocolo, após orientação do enfermeiro.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "Aplicar pomada antibiótica na ferida e cobrir com curativo oclusivo.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "Suturar a ferida para evitar maior saída de secreção.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        },
        {
          "label": "Letra E",
          "detail": "Orientar o paciente a permanecer em repouso absoluto e evitar movimentar-se.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "instituto-access-enfermagem-curativos-e-manejo-de-feridas-1779269291153-8": {
    "branch": "curativos_desbridamento",
    "family": "conceito",
    "guideline": "Desbridamento — tipos e indicações",
    "concept_map": {
      "slide_title": "Desbridamento",
      "chip_label": "DESBRIDAMENTO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Leia as afirmativas abaixo e marque V , para verdadeiro, e F , para falso, sobre o tratamento de feridas: (__)A limpeza ",
          "icon": "Target"
        },
        {
          "label": "Objetivo",
          "detail": "Remover tecido necrótico/não viável — preparar granulação.",
          "icon": "Scissors"
        },
        {
          "label": "Autolítico",
          "detail": "Hidrogel/hidrocoloide — lento, indolor.",
          "icon": "Clock"
        },
        {
          "label": "Mecânico",
          "detail": "Gaze úmida ou instrumental — risco de trauma se inadequado.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Gaze seca agressiva ou confundir com limpeza simples.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Tipo de desbridamento conforme leito e dor",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Tipos de desbridamento",
      "content": "DESBRIDAMENTO",
      "rows": [
        {
          "label": "Autolítico",
          "value": "Hidrogel/hidrocoloide — lento, indolor",
          "badge": "ok"
        },
        {
          "label": "Enzimático",
          "value": "Colagenase — necrose devitalizada",
          "badge": "info"
        },
        {
          "label": "Instrumental",
          "value": "Cirúrgico/afiado — tecido viável preservado",
          "badge": "hot"
        },
        {
          "label": "Mecânico",
          "value": "Gaze úmida — evitar trauma com gaze seca",
          "badge": "warn"
        }
      ],
      "footer_rule": "Remover não viável — preparar granulação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Leia as afirmativas abaixo e marque V , para verdadeiro, e F , para falso, sobre o tratamento de feridas: (__)A limpeza ",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra B: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra B.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — DESBRIDAMENTO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "V, F, V, V.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra B."
        },
        {
          "label": "Letra C",
          "detail": "V, V, F, F.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra B."
        },
        {
          "label": "Letra D",
          "detail": "F, V, V, V.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra B."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "instituto-access-enfermagem-curativos-e-manejo-de-feridas-1779269305691-0": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Lesões por pressão são feridas que surgem em áreas do corpo sujeitas a pressão prolongada, especialmente em pacientes com mobilidade reduzida.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Lesões por pressão são feridas que surgem em áreas do corpo sujeitas a pressão prolongada, especialmente em pacientes com mobilidade reduzida.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "A hidratação não influencia no desenvolvimento de lesões por pressão em pacient…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "As áreas de maior risco para lesões por pressão são as regiões dos ombros e pan…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "Os pacientes com mobilidade limitada devem ser reposicionados a cada 4 horas pa…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "instituto-access-enfermagem-curativos-e-manejo-de-feridas-1779269305691-2": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Feridas podem surgir em peles, mucosas do corpo e no tecido celular cutâneo e, em alguns casos, em músculos, tendões e ossos.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Feridas podem surgir em peles, mucosas do corpo e no tecido celular cutâneo e, em alguns casos, em músculos, tendões e ossos.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra A: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra A.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Prescrever e/ou realizar desbridamento autolítico.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "Indicar a prescrição de medicamentos e coberturas utilizados na prevenção e cui…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "Estabelecer plano de intervenção ao identificar um indivíduo em estado de risco…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "instituto-access-enfermagem-curativos-e-manejo-de-feridas-1779269305691-3": {
    "branch": "curativos_desbridamento",
    "family": "conceito",
    "guideline": "Desbridamento — tipos e indicações",
    "concept_map": {
      "slide_title": "Desbridamento",
      "chip_label": "DESBRIDAMENTO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Em relação ao tratamento de feridas, o que é desbridamento?",
          "icon": "Target"
        },
        {
          "label": "Objetivo",
          "detail": "Remover tecido necrótico/não viável — preparar granulação.",
          "icon": "Scissors"
        },
        {
          "label": "Autolítico",
          "detail": "Hidrogel/hidrocoloide — lento, indolor.",
          "icon": "Clock"
        },
        {
          "label": "Mecânico",
          "detail": "Gaze úmida ou instrumental — risco de trauma se inadequado.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Gaze seca agressiva ou confundir com limpeza simples.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Tipo de desbridamento conforme leito e dor",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Tipos de desbridamento",
      "content": "DESBRIDAMENTO",
      "rows": [
        {
          "label": "Autolítico",
          "value": "Hidrogel/hidrocoloide — lento, indolor",
          "badge": "ok"
        },
        {
          "label": "Enzimático",
          "value": "Colagenase — necrose devitalizada",
          "badge": "info"
        },
        {
          "label": "Instrumental",
          "value": "Cirúrgico/afiado — tecido viável preservado",
          "badge": "hot"
        },
        {
          "label": "Mecânico",
          "value": "Gaze úmida — evitar trauma com gaze seca",
          "badge": "warn"
        }
      ],
      "footer_rule": "Remover não viável — preparar granulação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Em relação ao tratamento de feridas, o que é desbridamento?",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra B: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra B.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — DESBRIDAMENTO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Aplicação de curativos secos para absorver a exsudação.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra B."
        },
        {
          "label": "Letra C",
          "detail": "Uso de antibióticos tópicos para prevenir infecções secundárias.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra B."
        },
        {
          "label": "Letra D",
          "detail": "Imobilização da área para evitar a ruptura da ferida.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra B."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "instituto-access-enfermagem-curativos-e-manejo-de-feridas-1779344773456-6": {
    "branch": "curativos_cobertura_selecao",
    "family": "conceito",
    "guideline": "Seleção de cobertura — exsudato e leito (NPUAP/COFEN)",
    "concept_map": {
      "slide_title": "Seleção de cobertura",
      "chip_label": "COBERTURA",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Em uma unidade de cuidados prolongados, um Técnico de Enfermagem observa exsudato abundante e mau cheiro em uma úlcera venosa.",
          "icon": "Target"
        },
        {
          "label": "Exsudato",
          "detail": "Baixo → hidrocoloide/filme; moderado/alto → espuma/alginato.",
          "icon": "Droplets"
        },
        {
          "label": "Leito",
          "detail": "Necrose → hidrogel/autólise; granulação → espuma/hidrofibra.",
          "icon": "Layers"
        },
        {
          "label": "Meio úmido",
          "detail": "Ambiente úmido controlado acelera cicatrização — não expor ao ar.",
          "icon": "CloudRain"
        },
        {
          "label": "Pegadinha",
          "detail": "Inverter indicação de espuma/alginato ou usar antisséptico de rotina.",
          "icon": "AlertTriangle"
        },
        {
          "label": "SF no leito",
          "detail": "Limpeza padrão com soro fisiológico — evitar álcool rotineiro.",
          "icon": "FlaskConical"
        }
      ],
      "footer_rule": "Leito + exsudato → cobertura; limpeza = SF",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Em uma unidade de cuidados prolongados, um Técnico de Enfermagem observa exsudato abundante e mau cheiro em uma úlcera venosa.",
        "Eliminar B: limpeza padrão é SF 0,9% — antisséptico não é rotina no leito.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: desbridamento mecânico com gaze seca é traumático e inadequado.",
        "Letra A: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra A.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — COBERTURA_SELECAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Limpeza diária com antissépticos à base de iodo para evitar contaminações e odo…",
          "correct": "limpeza padrão é SF 0,9% — antisséptico não é rotina no leito — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "Exposição do leito da ferida ao ar livre para reduzir exsudato e melhorar a cic…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "Realização de desbridamento mecânico com gaze seca para remoção de exsudato e t…",
          "correct": "desbridamento mecânico com gaze seca é traumático e inadequado — distrator D; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "instituto-access-enfermagem-curativos-e-manejo-de-feridas-1779344779828-8": {
    "branch": "curativos_cobertura_selecao",
    "family": "vf",
    "guideline": "Seleção de cobertura — exsudato e leito (NPUAP/COFEN)",
    "concept_map": {
      "slide_title": "Seleção de cobertura — itens I–IV",
      "chip_label": "COBERTURA",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "O tratamento de feridas envolve uma abordagem multifacetada que visa promover a cicatrização e prevenir complicações, como infecções.",
          "icon": "Target"
        },
        {
          "label": "Exsudato",
          "detail": "Baixo → hidrocoloide/filme; moderado/alto → espuma/alginato.",
          "icon": "Droplets"
        },
        {
          "label": "Leito",
          "detail": "Necrose → hidrogel/autólise; granulação → espuma/hidrofibra.",
          "icon": "Layers"
        },
        {
          "label": "Meio úmido",
          "detail": "Ambiente úmido controlado acelera cicatrização — não expor ao ar.",
          "icon": "CloudRain"
        },
        {
          "label": "Pegadinha",
          "detail": "Inverter indicação de espuma/alginato ou usar antisséptico de rotina.",
          "icon": "AlertTriangle"
        },
        {
          "label": "SF no leito",
          "detail": "Limpeza padrão com soro fisiológico — evitar álcool rotineiro.",
          "icon": "FlaskConical"
        },
        {
          "label": "Afirmativa I",
          "detail": "A limpeza deve seguir a técnica asséptica, indo da área menos contaminada par…",
          "icon": "ListChecks"
        },
        {
          "label": "Afirmativa II",
          "detail": "A escolha do curativo deve considerar tipo de tecido presente e quantidade de…",
          "icon": "ListChecks"
        }
      ],
      "footer_rule": "Leito + exsudato → cobertura; limpeza = SF",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando V/F: julgar afirmativas I, II, III e IV antes de montar a combinação.",
        "Tema: O tratamento de feridas envolve uma abordagem multifacetada que visa promover a cicatrização e prevenir complicações, como infecções.",
        "I: “A limpeza deve seguir a técnica asséptica, indo da área menos conta…” → V.",
        "II: “A escolha do curativo deve considerar tipo de tecido presente e qua…” → ?.",
        "III: “A troca de curativo pode ser feita sem higiene das mãos se houver u…” → ?.",
        "Eliminar letra A: combinação não reflete o julgamento item a item.",
        "Eliminar letra B: combinação não reflete o julgamento item a item.",
        "Eliminar letra D: combinação não reflete o julgamento item a item.",
        "Marcar letra C: combinação coerente com NPUAP/COFEN e meio úmido.",
        "Fixação: em V/F de curativo — teste assépsia, exsudato e indicação de cobertura por item."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — COBERTURA_SELECAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "II e III , apenas.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "I , apenas.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "III , apenas.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "instituto-aocp-enfermagem-curativos-e-manejo-de-feridas-1779344826734-0": {
    "branch": "curativos_estomia",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Paciente do sexo feminino, 64 anos, hipertensa e diabética, foi diagnosticada com anemia crônica assintomática.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Paciente do sexo feminino, 64 anos, hipertensa e diabética, foi diagnosticada com anemia crônica assintomática.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: antisséptico citotóxico não é limpeza de rotina no leito — SF 0,9%.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — ESTOMIA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "a colostomia é a exteriorização da parte final do intestino delgado, decorrente…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "a equipe de saúde deve orientar a paciente que não é possível realizar a revers…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "no pós-operatório mediato, a antissepsia ao redor da lesão deve ser realizada c…",
          "correct": "antisséptico citotóxico não é limpeza de rotina no leito — SF 0,9% — distrator C; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "instituto-consulpam-enfermagem-curativos-e-manejo-de-feridas-1779269305691-6": {
    "branch": "curativos_generico",
    "family": "certo_errado",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Sobre os cuidados de enfermagem na realização de curativos, considere as afirmativas a seguir e assinale a INCORRETA .",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.",
        "Enquadramento: Sobre os cuidados de enfermagem na realização de curativos, considere as afirmativas a seguir e assinale a INCORRETA .",
        "Letra A: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra B: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra D: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra C: única exceção — viola técnica asséptica ou indicação de cobertura.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "Utilizar luvas estéreis em curativos de cavidades ou quando houver necessidade…",
          "correct": "Em EXCETO, A descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra B — conduta correta",
          "detail": "Ao aplicar ataduras, é necessário fazê-lo no sentido da circulação venenosa, co…",
          "correct": "Em EXCETO, B descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra C — exceção (gabarito)",
          "detail": "Em curativos de incisão cirúrgica, ou seja, de ferida asséptica, a limpeza deve…",
          "correct": "INCORRETA nesta prova: conduta correta em curativos — não é a exceção pedida — única exceção pedida no enunciado."
        },
        {
          "label": "Letra D — conduta correta",
          "detail": "Em um paciente com uma úlcera de membro inferior e uma incisão cirúrgica abdomi…",
          "correct": "Em EXCETO, D descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "objetiva-concursos-enfermagem-curativos-e-manejo-de-feridas-1779269315587-7": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Sobre a aplicação de compressas frias, É CORRETO afirmar que:",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Sobre a aplicação de compressas frias, É CORRETO afirmar que:",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra A: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra A.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Apenas pode ser usada com objetivo de vasodilatação local.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "Jamais se deve utilizar quando apresentar edema e hematomas locais.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "Tem o objetivo de promover a vasodilatação e a absorção de edemas locais.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "omni-enfermagem-curativos-e-manejo-de-feridas-1779340178514-7": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "É CORRETO afirmar que um curativo semi - oclusivo:",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: É CORRETO afirmar que um curativo semi - oclusivo:",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "É utilizado para reduzir o fluxo sanguíneo, promover a estase e ajudar, na apro…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "É realizado em ferimentos que não há necessidade de serem ocluídos.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "Não permite a entrada de ar ou fluídos, atua como barreira mecânica, impede a p…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "selecon-enfermagem-curativos-e-manejo-de-feridas-1779344773456-5": {
    "branch": "curativos_lpp",
    "family": "conceito",
    "guideline": "LPP — prevenção e estágios NPUAP",
    "concept_map": {
      "slide_title": "LPP — prevenção e estágios",
      "chip_label": "LPP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Um paciente idoso, acamado há duas semanas devido a uma fratura de fêmur, desenvolveu uma lesão por pressão estágio II na região sacral.",
          "icon": "Target"
        },
        {
          "label": "Prevenção",
          "detail": "Pele limpa e seca; alívio de pressão; não massagear proeminências.",
          "icon": "Bed"
        },
        {
          "label": "Estágios",
          "detail": "I eritema; II derme; III subcutâneo; IV osso/tendão.",
          "icon": "Layers"
        },
        {
          "label": "Braden",
          "detail": "Escore de risco — reavaliar e intervir quando indicado.",
          "icon": "Calculator"
        },
        {
          "label": "Pegadinha",
          "detail": "Trocar seco por úmido ou confundir estágio III com IV.",
          "icon": "AlertTriangle"
        }
      ],
      "footer_rule": "Prevenir > tratar — classificar estágio antes da cobertura",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "LPP — estágios",
      "content": "ÚLCERA POR PRESSÃO",
      "rows": [
        {
          "label": "Estágio I",
          "value": "Eritema não branqueável — pele íntegra",
          "badge": "info"
        },
        {
          "label": "Estágio II",
          "value": "Perda parcial da derme",
          "badge": "ok"
        },
        {
          "label": "Estágio III",
          "value": "Perda total da espessura cutânea",
          "badge": "hot"
        },
        {
          "label": "Estágio IV",
          "value": "Osso, tendão ou músculo exposto",
          "badge": "hot"
        },
        {
          "label": "Prevenção",
          "value": "Pele limpa e seca; alívio de pressão",
          "badge": "warn"
        }
      ],
      "footer_rule": "Classificar estágio antes da cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Um paciente idoso, acamado há duas semanas devido a uma fratura de fêmur, desenvolveu uma lesão por pressão estágio II na região sacral.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — LPP",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "realizar limpeza com solução de clorexidina alcoólica vigorosamente para garant…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "aplicar papaína a 10% para promover o desbridamento químico do tecido necrótico…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "deixar a ferida exposta ao ar para acelerar a secagem e formação de crosta, ori…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "selecon-enfermagem-curativos-e-manejo-de-feridas-1779344813448-4": {
    "branch": "curativos_ferida_cirurgica",
    "family": "conceito",
    "guideline": "Ferida cirúrgica — técnica e sinais de complicação",
    "concept_map": {
      "slide_title": "Ferida cirúrgica / pós-op",
      "chip_label": "PÓS-OP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Durante a troca de um curativo em ferida cirúrgica abdominal com secreção purulenta e odor fétido, o técnico de enfermagem observa tecido escurecido, odordesagradável e sinais de infecção local.",
          "icon": "Target"
        },
        {
          "label": "Ferida operatória",
          "detail": "Curativo em ferida cirúrgica — técnica asséptica na troca.",
          "icon": "Bandage"
        },
        {
          "label": "Pós-operatório",
          "detail": "Observar exsudato, bordas e sinais de deiscência.",
          "icon": "Activity"
        },
        {
          "label": "Retirada de pontos",
          "detail": "Pinça anatômica no fio; campo estéril; comunicar alterações.",
          "icon": "Scissors"
        },
        {
          "label": "Sinais de alerta",
          "detail": "Exsudato purulento, odor fétido — comunicar equipe.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Manipulação diária ou técnica invertida na retirada de pontos.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Assépsia + observação na ferida cirúrgica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Ferida operatória",
      "content": "PÓS-OPERATÓRIO",
      "rows": [
        {
          "label": "Curativo",
          "value": "Troca asséptica conforme prescrição/protocolo",
          "badge": "ok"
        },
        {
          "label": "Observar",
          "value": "Exsudato, odor, bordas, deiscência",
          "badge": "info"
        },
        {
          "label": "Comunicar",
          "value": "Purulência ou odor fétido à equipe",
          "badge": "hot"
        },
        {
          "label": "Pontos",
          "value": "Pinça anatômica no fio; tesoura corta",
          "badge": "warn"
        }
      ],
      "footer_rule": "Não manipular sem indicação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Durante a troca de um curativo em ferida cirúrgica abdominal com secreção purulenta e odor fétido, o técnico de enfermagem observa tecido escurecido, odordesagradável e sinais de infecção local.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — FERIDA_CIRURGICA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "irrigar a ferida com solução antisséptica à base de álcool e cobrir com gaze se…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "cobrir a ferida com curativo oclusivo impermeável sem limpeza prévia para evita…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "aplicar pomada antibiótica em toda a extensão da ferida, mesmo sem prescrição,…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "unesc-enfermagem-curativos-e-manejo-de-feridas-1779269291153-5": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Os curativos são uma forma de tratamento das feridas cutâneas e sua escolha depende de fatores intrínsecos e extrínsecos (Franco et al.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Os curativos são uma forma de tratamento das feridas cutâneas e sua escolha depende de fatores intrínsecos e extrínsecos (Franco et al.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Escolher um curativo apenas pela aparência.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "Escolher aleatoriamente qualquer tipo de curativo.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "Ignorar as instruções do fabricante.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        },
        {
          "label": "Letra E",
          "detail": "Usar o mesmo curativo para todos os pacientes.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "unesc-enfermagem-curativos-e-manejo-de-feridas-1779269291153-6": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Os curativos têm como principais objetivos a proteção da ferida, o auxílio ao seu fechamento e a prevenção das infecções",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Os curativos têm como principais objetivos a proteção da ferida, o auxílio ao seu fechamento e a prevenção das infecções",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra B: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra B.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Somente em feridas grandes e profundas.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra B."
        },
        {
          "label": "Letra C",
          "detail": "Em todas as feridas, independentemente do tipo.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra B."
        },
        {
          "label": "Letra D",
          "detail": "Em feridas secas e limpas.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra B."
        },
        {
          "label": "Letra E",
          "detail": "Em feridas infectadas sem supervisão médica.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra B."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "unesc-enfermagem-curativos-e-manejo-de-feridas-1779344751294-7": {
    "branch": "curativos_exceto_incorreta",
    "family": "certo_errado",
    "guideline": "EXCETO — conduta em curativo",
    "concept_map": {
      "slide_title": "EXCETO em curativo",
      "chip_label": "EXCETO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Os curativos são cuidados dispensados a uma área do corpo que sofreu solução de continuidade.",
          "icon": "Target"
        },
        {
          "label": "Lógica",
          "detail": "Três condutas corretas + uma exceção — não inverta.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Assépsia",
          "detail": "SF, técnica, comunicação de sinais de infecção.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Cobertura",
          "detail": "Escolha por exsudato e leito — não antisséptico rotineiro.",
          "icon": "Bandage"
        }
      ],
      "footer_rule": "Valide cada letra como correta antes de achar a exceção",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.",
        "Enquadramento: Os curativos são cuidados dispensados a uma área do corpo que sofreu solução de continuidade.",
        "Letra A: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra B: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra C: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra E: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra D: única exceção — viola técnica asséptica ou indicação de cobertura.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — EXCETO_INCORRETA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "Curativo úmido mantém o ambiente da ferida úmido com auxílio de soluções tópica…",
          "correct": "Em EXCETO, A descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra B — conduta correta",
          "detail": "Curativo compressivo tem objetivo de exercer pressão na ferida. Controla sangra…",
          "correct": "Em EXCETO, B descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra C — conduta correta",
          "detail": "Curativo simples tem objetivo de manter a ferida limpa e seca.",
          "correct": "Em EXCETO, C descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra D — exceção (gabarito)",
          "detail": "Curativo compressivo é realizado com objetivo de manter a ferida úmida.",
          "correct": "INCORRETA nesta prova: conduta correta em curativos — não é a exceção pedida — única exceção pedida no enunciado."
        },
        {
          "label": "Letra E — conduta correta",
          "detail": "Curativo oclusivo tem objetivo de criar uma barreira isolando a ferida do ambie…",
          "correct": "Em EXCETO, E descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "unesc-enfermagem-curativos-e-manejo-de-feridas-1779344759089-6": {
    "branch": "curativos_bandagem_imobilizacao",
    "family": "vf",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas — itens I–IV",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Bandagem é uma cobertura realizada em torno de uma parte do corpo com o uso atadura ou outros dispositivos.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        },
        {
          "label": "Afirmativa I",
          "detail": "Bandagem recorrente é aplicada em regiões ovoides como cabeça e cotos de memb…",
          "icon": "ListChecks"
        },
        {
          "label": "Afirmativa II",
          "detail": "Bandagem espiral reversa é utilizada obliquamente em um seguimento do corpo. …",
          "icon": "ListChecks"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando V/F: julgar afirmativas I, II, III e IV antes de montar a combinação.",
        "Tema: Bandagem é uma cobertura realizada em torno de uma parte do corpo com o uso atadura ou outros dispositivos.",
        "I: “Bandagem recorrente é aplicada em regiões ovoides como cabeça e cot…” → ?.",
        "II: “Bandagem espiral reversa é utilizada obliquamente em um seguimento …” → ?.",
        "III: “Bandagem circular é usada para fixação da atadura no início e no fi…” → ?.",
        "Eliminar letra B: combinação não reflete o julgamento item a item.",
        "Eliminar letra C: combinação não reflete o julgamento item a item.",
        "Eliminar letra D: combinação não reflete o julgamento item a item.",
        "Marcar letra A: combinação coerente com NPUAP/COFEN e meio úmido.",
        "Fixação: em V/F de curativo — teste assépsia, exsudato e indicação de cobertura por item."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — BANDAGEM_IMOBILIZACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "I , II e III .",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "I e II , apenas.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "III , apenas.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "unesc-enfermagem-curativos-e-manejo-de-feridas-1779344766321-6": {
    "branch": "curativos_ferida_cirurgica",
    "family": "conceito",
    "guideline": "Ferida cirúrgica — técnica e sinais de complicação",
    "concept_map": {
      "slide_title": "Ferida cirúrgica / pós-op",
      "chip_label": "PÓS-OP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "O cuidado pós-operatório de um paciente submetido a uma apendicectomia exige monitoramento para prevenir complicações.",
          "icon": "Target"
        },
        {
          "label": "Ferida operatória",
          "detail": "Curativo em ferida cirúrgica — técnica asséptica na troca.",
          "icon": "Bandage"
        },
        {
          "label": "Pós-operatório",
          "detail": "Observar exsudato, bordas e sinais de deiscência.",
          "icon": "Activity"
        },
        {
          "label": "Retirada de pontos",
          "detail": "Pinça anatômica no fio; campo estéril; comunicar alterações.",
          "icon": "Scissors"
        },
        {
          "label": "Sinais de alerta",
          "detail": "Exsudato purulento, odor fétido — comunicar equipe.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Manipulação diária ou técnica invertida na retirada de pontos.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Assépsia + observação na ferida cirúrgica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Ferida operatória",
      "content": "PÓS-OPERATÓRIO",
      "rows": [
        {
          "label": "Curativo",
          "value": "Troca asséptica conforme prescrição/protocolo",
          "badge": "ok"
        },
        {
          "label": "Observar",
          "value": "Exsudato, odor, bordas, deiscência",
          "badge": "info"
        },
        {
          "label": "Comunicar",
          "value": "Purulência ou odor fétido à equipe",
          "badge": "hot"
        },
        {
          "label": "Pontos",
          "value": "Pinça anatômica no fio; tesoura corta",
          "badge": "warn"
        }
      ],
      "footer_rule": "Não manipular sem indicação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: O cuidado pós-operatório de um paciente submetido a uma apendicectomia exige monitoramento para prevenir complicações.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — FERIDA_CIRURGICA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "F, F, V, V.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "V, F, V, F.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "V, V, V, V.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        },
        {
          "label": "Letra E",
          "detail": "V, F, F, F.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "unesc-enfermagem-curativos-e-manejo-de-feridas-1779344766321-7": {
    "branch": "curativos_ferida_cirurgica",
    "family": "conceito",
    "guideline": "Ferida cirúrgica — técnica e sinais de complicação",
    "concept_map": {
      "slide_title": "Ferida cirúrgica / pós-op",
      "chip_label": "PÓS-OP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "A realização de curativos em um paciente com ferida cirúrgica exige cuidados para prevenir infecções.",
          "icon": "Target"
        },
        {
          "label": "Ferida operatória",
          "detail": "Curativo em ferida cirúrgica — técnica asséptica na troca.",
          "icon": "Bandage"
        },
        {
          "label": "Pós-operatório",
          "detail": "Observar exsudato, bordas e sinais de deiscência.",
          "icon": "Activity"
        },
        {
          "label": "Retirada de pontos",
          "detail": "Pinça anatômica no fio; campo estéril; comunicar alterações.",
          "icon": "Scissors"
        },
        {
          "label": "Sinais de alerta",
          "detail": "Exsudato purulento, odor fétido — comunicar equipe.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Manipulação diária ou técnica invertida na retirada de pontos.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Assépsia + observação na ferida cirúrgica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Ferida operatória",
      "content": "PÓS-OPERATÓRIO",
      "rows": [
        {
          "label": "Curativo",
          "value": "Troca asséptica conforme prescrição/protocolo",
          "badge": "ok"
        },
        {
          "label": "Observar",
          "value": "Exsudato, odor, bordas, deiscência",
          "badge": "info"
        },
        {
          "label": "Comunicar",
          "value": "Purulência ou odor fétido à equipe",
          "badge": "hot"
        },
        {
          "label": "Pontos",
          "value": "Pinça anatômica no fio; tesoura corta",
          "badge": "warn"
        }
      ],
      "footer_rule": "Não manipular sem indicação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: A realização de curativos em um paciente com ferida cirúrgica exige cuidados para prevenir infecções.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar D: antisséptico citotóxico não é limpeza de rotina no leito — SF 0,9%.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra C: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra C.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — FERIDA_CIRURGICA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Realizar o curativo limpo com gaze saturada de solução salina acelera a cicatri…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra C."
        },
        {
          "label": "Letra B",
          "detail": "Realizar o curativo limpo sem luvas estéreis é permitido, desde que a ferida es…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra C."
        },
        {
          "label": "Letra D",
          "detail": "Realizar o curativo limpo com materiais reutilizados reduz custos, mantendo a s…",
          "correct": "antisséptico citotóxico não é limpeza de rotina no leito — SF 0,9% — distrator D; gabarito é letra C."
        },
        {
          "label": "Letra E",
          "detail": "Realizar o curativo limpo em ambiente não ventilado minimiza a contaminação, po…",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra C."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "unesc-enfermagem-curativos-e-manejo-de-feridas-1780000535393-1": {
    "branch": "curativos_exceto_incorreta",
    "family": "certo_errado",
    "guideline": "EXCETO — conduta em curativo",
    "concept_map": {
      "slide_title": "EXCETO em curativo",
      "chip_label": "EXCETO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Os curativos são cuidados dispensados a uma área do corpo que sofreu solução de continuidade.",
          "icon": "Target"
        },
        {
          "label": "Lógica",
          "detail": "Três condutas corretas + uma exceção — não inverta.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Assépsia",
          "detail": "SF, técnica, comunicação de sinais de infecção.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Cobertura",
          "detail": "Escolha por exsudato e leito — não antisséptico rotineiro.",
          "icon": "Bandage"
        }
      ],
      "footer_rule": "Valide cada letra como correta antes de achar a exceção",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.",
        "Enquadramento: Os curativos são cuidados dispensados a uma área do corpo que sofreu solução de continuidade.",
        "Letra A: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra B: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra C: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra E: conduta correta em curativos — não é a exceção pedida — distrator válido em EXCETO.",
        "Letra D: única exceção — viola técnica asséptica ou indicação de cobertura.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — EXCETO_INCORRETA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A — conduta correta",
          "detail": "Curativo úmido mantém o ambiente da ferida úmido com auxílio de soluções tópica…",
          "correct": "Em EXCETO, A descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra B — conduta correta",
          "detail": "Curativo compressivo tem objetivo de exercer pressão na ferida. Controla sangra…",
          "correct": "Em EXCETO, B descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra C — conduta correta",
          "detail": "Curativo simples tem objetivo de manter a ferida limpa e seca.",
          "correct": "Em EXCETO, C descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        },
        {
          "label": "Letra D — exceção (gabarito)",
          "detail": "Curativo compressivo é realizado com objetivo de manter a ferida úmida.",
          "correct": "INCORRETA nesta prova: conduta correta em curativos — não é a exceção pedida — única exceção pedida no enunciado."
        },
        {
          "label": "Letra E — conduta correta",
          "detail": "Curativo oclusivo tem objetivo de criar uma barreira isolando a ferida do ambie…",
          "correct": "Em EXCETO, E descreve conduta adequada: conduta correta em curativos — não é a exceção pedida."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "unifil-enfermagem-curativos-e-manejo-de-feridas-1779344813448-3": {
    "branch": "curativos_lpp",
    "family": "conceito",
    "guideline": "LPP — prevenção e estágios NPUAP",
    "concept_map": {
      "slide_title": "LPP — prevenção e estágios",
      "chip_label": "LPP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Uma paciente de 72 anos apresenta lesão por pressão em estágio 2.",
          "icon": "Target"
        },
        {
          "label": "Prevenção",
          "detail": "Pele limpa e seca; alívio de pressão; não massagear proeminências.",
          "icon": "Bed"
        },
        {
          "label": "Estágios",
          "detail": "I eritema; II derme; III subcutâneo; IV osso/tendão.",
          "icon": "Layers"
        },
        {
          "label": "Braden",
          "detail": "Escore de risco — reavaliar e intervir quando indicado.",
          "icon": "Calculator"
        },
        {
          "label": "Pegadinha",
          "detail": "Trocar seco por úmido ou confundir estágio III com IV.",
          "icon": "AlertTriangle"
        }
      ],
      "footer_rule": "Prevenir > tratar — classificar estágio antes da cobertura",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "LPP — estágios",
      "content": "ÚLCERA POR PRESSÃO",
      "rows": [
        {
          "label": "Estágio I",
          "value": "Eritema não branqueável — pele íntegra",
          "badge": "info"
        },
        {
          "label": "Estágio II",
          "value": "Perda parcial da derme",
          "badge": "ok"
        },
        {
          "label": "Estágio III",
          "value": "Perda total da espessura cutânea",
          "badge": "hot"
        },
        {
          "label": "Estágio IV",
          "value": "Osso, tendão ou músculo exposto",
          "badge": "hot"
        },
        {
          "label": "Prevenção",
          "value": "Pele limpa e seca; alívio de pressão",
          "badge": "warn"
        }
      ],
      "footer_rule": "Classificar estágio antes da cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Uma paciente de 72 anos apresenta lesão por pressão em estágio 2.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra A: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra A.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — LPP",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "Predomínio de tecido de granulação seguido por cicatrização secundária.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "Desenvolvimento de tecido de granulação exuberante com posterior reepitelização.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "Formação de tecido fibroso, com necessidade de remodelação cicatricial extensa.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        },
        {
          "label": "Letra E",
          "detail": "Formação de escara seca que evolui para cicatrização por terceira intenção.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "univali-enfermagem-curativos-e-manejo-de-feridas-1779269228428-5": {
    "branch": "curativos_cobertura_selecao",
    "family": "conceito",
    "guideline": "Seleção de cobertura — exsudato e leito (NPUAP/COFEN)",
    "concept_map": {
      "slide_title": "Seleção de cobertura",
      "chip_label": "COBERTURA",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Durante a realização de um curativo em uma ferida aberta, o Técnico em Enfermagem observa a presença de exsudato purulento.",
          "icon": "Target"
        },
        {
          "label": "Exsudato",
          "detail": "Baixo → hidrocoloide/filme; moderado/alto → espuma/alginato.",
          "icon": "Droplets"
        },
        {
          "label": "Leito",
          "detail": "Necrose → hidrogel/autólise; granulação → espuma/hidrofibra.",
          "icon": "Layers"
        },
        {
          "label": "Meio úmido",
          "detail": "Ambiente úmido controlado acelera cicatrização — não expor ao ar.",
          "icon": "CloudRain"
        },
        {
          "label": "Pegadinha",
          "detail": "Inverter indicação de espuma/alginato ou usar antisséptico de rotina.",
          "icon": "AlertTriangle"
        },
        {
          "label": "SF no leito",
          "detail": "Limpeza padrão com soro fisiológico — evitar álcool rotineiro.",
          "icon": "FlaskConical"
        }
      ],
      "footer_rule": "Leito + exsudato → cobertura; limpeza = SF",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Durante a realização de um curativo em uma ferida aberta, o Técnico em Enfermagem observa a presença de exsudato purulento.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra B: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra B.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — COBERTURA_SELECAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Deixar a ferida aberta para facilitar a drenagem do exsudato purulento e evitar…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra B."
        },
        {
          "label": "Letra C",
          "detail": "Aplicar antisséptico na ferida para eliminar as bactérias presentes no exsudato…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra B."
        },
        {
          "label": "Letra D",
          "detail": "Remover o exsudato purulento com gaze seca e aplicar pomada cicatrizante para a…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra B."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "univali-enfermagem-curativos-e-manejo-de-feridas-1779269255793-4": {
    "branch": "curativos_ferida_cirurgica",
    "family": "conceito",
    "guideline": "Ferida cirúrgica — técnica e sinais de complicação",
    "concept_map": {
      "slide_title": "Ferida cirúrgica / pós-op",
      "chip_label": "PÓS-OP",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Considerando que você, como auxiliar de enfermagem,precisa realizar a troca de curativo de uma ferida cirúrgica, assinal",
          "icon": "Target"
        },
        {
          "label": "Ferida operatória",
          "detail": "Curativo em ferida cirúrgica — técnica asséptica na troca.",
          "icon": "Bandage"
        },
        {
          "label": "Pós-operatório",
          "detail": "Observar exsudato, bordas e sinais de deiscência.",
          "icon": "Activity"
        },
        {
          "label": "Retirada de pontos",
          "detail": "Pinça anatômica no fio; campo estéril; comunicar alterações.",
          "icon": "Scissors"
        },
        {
          "label": "Sinais de alerta",
          "detail": "Exsudato purulento, odor fétido — comunicar equipe.",
          "icon": "AlertTriangle"
        },
        {
          "label": "Pegadinha",
          "detail": "Manipulação diária ou técnica invertida na retirada de pontos.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Assépsia + observação na ferida cirúrgica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Ferida operatória",
      "content": "PÓS-OPERATÓRIO",
      "rows": [
        {
          "label": "Curativo",
          "value": "Troca asséptica conforme prescrição/protocolo",
          "badge": "ok"
        },
        {
          "label": "Observar",
          "value": "Exsudato, odor, bordas, deiscência",
          "badge": "info"
        },
        {
          "label": "Comunicar",
          "value": "Purulência ou odor fétido à equipe",
          "badge": "hot"
        },
        {
          "label": "Pontos",
          "value": "Pinça anatômica no fio; tesoura corta",
          "badge": "warn"
        }
      ],
      "footer_rule": "Não manipular sem indicação",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Considerando que você, como auxiliar de enfermagem,precisa realizar a troca de curativo de uma ferida cirúrgica, assinal",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Letra D: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra D.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — FERIDA_CIRURGICA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Limpar a ferida com movimentos de vai e vem, das bordas para o centro.",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra D."
        },
        {
          "label": "Letra B",
          "detail": "Esfregar a ferida com força para remover crostas e secreções.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra D."
        },
        {
          "label": "Letra C",
          "detail": "Limpar a ferida com movimentos circulares, do centro para as bordas.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra D."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "vunesp-enfermagem-curativos-e-manejo-de-feridas-1779269315587-0": {
    "branch": "curativos_bandagem_imobilizacao",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "O ortopedista solicita a confecção de janela em um gesso circular para",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: O ortopedista solicita a confecção de janela em um gesso circular para",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra A: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra A.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — BANDAGEM_IMOBILIZACAO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "tratar uma síndrome compartimental.",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "diminuir o peso do gesso em um paciente idoso.",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "permitir que o edema da região extravase por essa janela.",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        },
        {
          "label": "Letra E",
          "detail": "que o paciente possa observar a incisão e ir ao pronto-socorro se necessário.",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "vunesp-enfermagem-curativos-e-manejo-de-feridas-1779269315587-4": {
    "branch": "curativos_estomia",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Considere os cuidados que devem ser observados pelo técnico de enfermagem ao realizar a troca de bolsa de colostomia e assinale a alternativa correta.",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Considere os cuidados que devem ser observados pelo técnico de enfermagem ao realizar a troca de bolsa de colostomia e assinale a alternativa correta.",
        "Eliminar A: critério da letra A não fecha com manejo de feridas atual.",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Letra E: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra E.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — ESTOMIA",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra A",
          "detail": "Após a retirada da bolsa a ser trocada, uma gaze enrolada deve ser colocada na…",
          "correct": "critério da letra A não fecha com manejo de feridas atual — distrator A; gabarito é letra E."
        },
        {
          "label": "Letra B",
          "detail": "A limpeza da pele periestoma deve ser realizada com solução antisséptica em veí…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra E."
        },
        {
          "label": "Letra C",
          "detail": "Após a retirada da bolsa, a pele periestoma deve ser friccionada com gaze para…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra E."
        },
        {
          "label": "Letra D",
          "detail": "Antes da colocação da bolsa limpa a região periestoma deve ser hidratada por me…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra E."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  },
  "vunesp-enfermagem-curativos-e-manejo-de-feridas-1779344779828-2": {
    "branch": "curativos_generico",
    "family": "conceito",
    "guideline": "Manejo de feridas — COFEN/NPUAP",
    "concept_map": {
      "slide_title": "Manejo de feridas",
      "chip_label": "CURATIVO",
      "items": [
        {
          "label": "Enquadramento",
          "detail": "Na realização de curativos de um paciente acamado, portador de duas ulceras de pressão, uma na região sacra, infectada, ",
          "icon": "Target"
        },
        {
          "label": "Cicatrização",
          "detail": "Ambiente úmido controlado e proteção do leito.",
          "icon": "Heart"
        },
        {
          "label": "Infecção",
          "detail": "Purulência, odor, eritema — avaliar e comunicar.",
          "icon": "Bug"
        },
        {
          "label": "Técnica",
          "detail": "Assépsia e material adequado por fase da ferida.",
          "icon": "ShieldCheck"
        },
        {
          "label": "Pegadinha",
          "detail": "Expor ao ar ou antisséptico de rotina no leito.",
          "icon": "XCircle"
        }
      ],
      "footer_rule": "Leito + exsudato + técnica asséptica",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      }
    },
    "golden_rule": {
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "slide_title": "Coberturas — referência",
      "content": "SELEÇÃO DE COBERTURA",
      "rows": [
        {
          "label": "Exsudato baixo",
          "value": "Hidrocoloide ou filme transparente",
          "badge": "info"
        },
        {
          "label": "Exsudato alto",
          "value": "Espuma ou alginato de cálcio",
          "badge": "hot"
        },
        {
          "label": "Necrose no leito",
          "value": "Hidrogel — desbridamento autolítico",
          "badge": "ok"
        },
        {
          "label": "Limpeza padrão",
          "value": "Soro fisiológico isotônico no leito",
          "badge": "warn"
        },
        {
          "label": "Evitar rotina",
          "value": "Álcool e iodo citotóxicos no leito",
          "badge": "hot"
        }
      ],
      "footer_rule": "Exsudato e leito definem a cobertura",
      "chip_label": "REFERÊNCIA"
    },
    "logic_flow": {
      "slide_title": "Raciocínio — passo a passo",
      "chip_label": "DECISÃO",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "reveal_mode": "tap",
      "steps": [
        "Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.",
        "Enquadramento: Na realização de curativos de um paciente acamado, portador de duas ulceras de pressão, uma na região sacra, infectada, ",
        "Eliminar B: critério da letra B não fecha com manejo de feridas atual.",
        "Eliminar C: critério da letra C não fecha com manejo de feridas atual.",
        "Eliminar D: critério da letra D não fecha com manejo de feridas atual.",
        "Eliminar E: critério da letra E não fecha com manejo de feridas atual.",
        "Letra A: única alternativa alinhada ao leito, exsudato e guideline.",
        "Marcar letra A.",
        "Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico."
      ],
      "footer_rule": "NPUAP/COFEN — leito, exsudato, assépsia"
    },
    "danger_zone": {
      "slide_title": "Armadilhas desta questão",
      "chip_label": "PEGADINHAS",
      "meta": {
        "topico": "Enfermagem",
        "subtopico": "Curativos e Manejo de Feridas"
      },
      "content": "PEGADINHAS — GENERICO",
      "bullet_style": "x_icon",
      "items": [
        {
          "label": "Letra B",
          "detail": "trocar as luvas ao se mover de um sítio a outro, sem necessidade de higienizar…",
          "correct": "critério da letra B não fecha com manejo de feridas atual — distrator B; gabarito é letra A."
        },
        {
          "label": "Letra C",
          "detail": "iniciar os curativos pela lesão sacra, infectada, usando luvas, lavando as mãos…",
          "correct": "critério da letra C não fecha com manejo de feridas atual — distrator C; gabarito é letra A."
        },
        {
          "label": "Letra D",
          "detail": "iniciar os curativos pela lesão do calcâneo, sem luvas porque é um procedimento…",
          "correct": "critério da letra D não fecha com manejo de feridas atual — distrator D; gabarito é letra A."
        },
        {
          "label": "Letra E",
          "detail": "na realização de dois procedimentos seguidos no mesmo paciente, a troca de luva…",
          "correct": "critério da letra E não fecha com manejo de feridas atual — distrator E; gabarito é letra A."
        }
      ],
      "footer_rule": "Cada distrator com justificativa única"
    }
  }
} as const;
