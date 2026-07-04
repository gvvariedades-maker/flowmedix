#!/usr/bin/env tsx
import { writeFileSync } from 'node:fs';
import { questionFilePath } from '@/lib/catalogMigration/paths';

const LOTE = 'imunizacao-g82';
const REVIEWED = '2026-07-03';

type Q = Record<string, unknown>;

const questions: Record<string, Q> = {
  'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712270872-0': {
    meta: {
      ano: '2023',
      banca: 'IDECAN',
      orgao: 'Pref Maracanaú',
      prova: 'ACE',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
      topico: 'Enfermagem',
      subtopico: 'Imunização',
      pedagogical_branch: 'imunizacao_exceto',
      content_standard: 'golden-v1',
      family: 'certo_errado',
      content_review: {
        reviewed_at: REVIEWED,
        reviewer: 'professor-para-concurso',
        guideline_snapshot: 'PNI/MS — Vigilância da Raiva Humana e Animal (casos suspeito, confirmado, critérios)',
        exam_vs_current: 'none',
        catalog_slug: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712270872-0',
        cluster: 'INCORRETA / EXCETO — vigilância raiva',
      },
      sources: [
        {
          id: 'pni-raiva-vigilancia',
          tier: 'A',
          issuer: 'Ministério da Saúde',
          title: 'Manual de Vigilância da Raiva Humana e Animal',
          year: 2022,
          url: 'https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/raiva',
          covers: ['caso suspeito', 'caso confirmado', 'critério clínico-epidemiológico', 'profilaxia pós-exposição'],
        },
      ],
    },
    question_data: {
      instruction:
        'A raiva é de extrema importância para saúde pública, devido a sua letalidade de aproximadamente 100%, por ser uma doença passível de eliminação no seu ciclo urbano (transmitido por cão e gato) e pela existência de medidas eficientes de prevenção, como a vacinação humana e animal, a disponibilização de soro antirrábico humano, a realização de bloqueios de foco, entre outras. Sobre a Vigilância da Raiva Animal, assinale a alternativa incorreta.',
      options: [
        {
          id: 'A',
          text: 'Critério clínico-epidemiológico: paciente com quadro neurológico agudo (encefalite), que apresente formas de hiperatividade, seguido de síndrome paralítica com progressão para coma, sem possibilidade de diagnóstico laboratorial, mas com antecedente de exposição a uma provável fonte de infecção.',
          is_correct: false,
        },
        {
          id: 'B',
          text: 'Caso suspeito é todo paciente com quadro clínico sugestivo de encefalite, exclusivamente, com antecedentes de exposição à infecção pelo vírus rábico.',
          is_correct: true,
        },
        {
          id: 'C',
          text: 'Caso confirmado se dá pelo Critério laboratorial: caso suspeito com sintomatologia compatível, para a qual a imunofluorescência direta (IFD), prova biológica (PB), ou reação em cadeia da polimerase (PCR), foi positiva para raiva.',
          is_correct: false,
        },
        {
          id: 'D',
          text: 'Na vigilância da raiva, os dados epidemiológicos são essenciais tanto para os profissionais de saúde, a fim de que seja tomada a decisão de profilaxia de pós-exposição em tempo oportuno, como para os médicos veterinários, que devem adotar medidas de bloqueio de foco e controle animal.',
          is_correct: false,
        },
      ],
    },
    reverse_study_slides: [
      {
        type: 'concept_map',
        slide_title: 'Vigilância da raiva — INCORRETA',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        items: [
          {
            label: 'Comando',
            detail: 'Marque a definição falsa sobre vigilância da raiva — três alternativas seguem o manual MS.',
            icon: 'Target',
          },
          {
            label: 'Letalidade',
            detail: 'Raiva ≈100% letal; prevenção humana (vacina/soro) e animal (bloqueio de foco).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Casos na vigilância',
            detail: 'Suspeito → compatível clínico + exposição; confirmado → laboratório positivo (IFD/PB/PCR).',
            icon: 'Microscope',
          },
          {
            label: 'Pegadinha “exclusivamente”',
            detail: 'Banca restringe caso suspeito só a encefalite — manual inclui outras apresentações neurológicas.',
            icon: 'Brain',
          },
        ],
        footer_rule: 'INCORRETA = definição estreita demais, não o critério laboratorial',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        steps: [
          'Comando: alternativa INCORRETA sobre vigilância da raiva animal/humana.',
          'A — critério clínico-epidemiológico (encefalite aguda + exposição, sem lab) → definição correta → eliminar.',
          'C — caso confirmado por IFD, PB ou PCR em suspeito compatível → verdadeiro → eliminar.',
          'D — dados epidemiológicos orientam PEP e bloqueio veterinário → afirmativa correta → eliminar.',
          'B — caso suspeito “exclusivamente” encefalite → estreita demais o conceito → INCORRETA.',
          'Gabarito: letra B.',
        ],
        footer_rule: 'Suspeito ≠ só encefalite — quadro neurológico compatível + exposição',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore — classificação de casos (raiva)',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: 'VIGILÂNCIA DA RAIVA — DEFINIÇÕES',
        rows: [
          { label: 'Caso suspeito', value: 'Quadro neurológico compatível + antecedente de exposição ao vírus' },
          { label: 'Critério clínico-epidemiológico', value: 'Encefalite aguda + exposição, sem confirmação laboratorial' },
          { label: 'Caso confirmado', value: 'Suspeito com IFD, PB ou PCR positiva para raiva' },
          { label: 'Uso epidemiológico', value: 'PEP oportuna (saúde) + bloqueio/controle animal (veterinária)' },
        ],
        footer_rule: 'Não confundir suspeito (amplo) com confirmação laboratorial',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: 'PEGADINHAS — VIGILÂNCIA DA RAIVA',
        items: [
          {
            label: 'Letra A — critério clínico-epidemiológico',
            detail: 'Parece definição de caso confirmado.',
            correct: 'Afirmativa correta — descreve caso clínico-epidemiológico sem laboratório.',
          },
          {
            label: 'Letra C — confirmação laboratorial',
            detail: 'Aluno confunde suspeito com confirmado.',
            correct: 'Definição correta de caso confirmado por IFD, PB ou PCR.',
          },
          {
            label: 'Letra D — papel epidemiológico',
            detail: 'Texto longo induz a marcar como falso.',
            correct: 'Verdadeiro — vigilância alimenta PEP humana e controle animal.',
          },
          {
            label: 'Letra B — “exclusivamente” encefalite',
            detail: 'Palavra “exclusivamente” parece precisão técnica.',
            correct: 'INCORRETA: caso suspeito não se limita só a encefalite — inclui quadros neurológicos compatíveis.',
          },
          {
            label: 'Transferência',
            detail: 'Paciente com paralisia progressiva pós-mordida sem lab.',
            correct: 'Classificar como suspeito/clínico-epidemiológico — não exige só encefalite hiperativa.',
          },
        ],
        footer_rule: 'INCORRETA = estreitar caso suspeito a um único quadro',
      },
    ],
  },

  'instituto-consulplan-enfermagem-atencao-basica-saude-da-familia-1778968194611-7': {
    meta: {
      ano: '2024',
      banca: 'Instituto Consulplan',
      orgao: 'Pref Cacoal',
      prova: 'TEnf',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
      topico: 'Enfermagem',
      subtopico: 'Imunização',
      pedagogical_branch: 'imunizacao_exceto',
      content_standard: 'golden-v1',
      family: 'conceito',
      content_review: {
        reviewed_at: REVIEWED,
        reviewer: 'professor-para-concurso',
        guideline_snapshot: 'PNI/MS — 10 passos para ampliação das coberturas vacinais na APS/ESF',
        exam_vs_current: 'none',
        catalog_slug: 'instituto-consulplan-enfermagem-atencao-basica-saude-da-familia-1778968194611-7',
        cluster: 'EXCETO — 10 passos cobertura vacinal',
      },
      sources: [
        {
          id: 'pni-10-passos',
          tier: 'A',
          issuer: 'Ministério da Saúde',
          title: '10 passos para ampliação das coberturas vacinais — PNI',
          year: 2025,
          url: 'https://www.gov.br/saude/pt-br/vacinacao',
          covers: ['ESF', 'registro vacinal', 'sala de vacinação', 'oportunidade de vacinação'],
        },
      ],
    },
    question_data: {
      instruction:
        'No contexto da vacinação, a participação da Estratégia Saúde da Família (ESF) é fundamental para a prevenção de doenças e agravos na perspectiva do controle,\nda erradicação e da eliminação de doenças imunopreveníveis. Para garantir a ampliação das coberturas vacinais, o processo de trabalho na Atenção Primária se organiza\nconsiderando os "10 passos para ampliação das coberturas vacinais". Fazem parte dos 10 passos para a ampliação das coberturas vacinais, EXCETO:',
      options: [
        { id: 'A', text: 'Evitar barreiras de acesso.', is_correct: false },
        {
          id: 'B',
          text: 'Garantir o registro adequado da vacinação no cartão de vacinação do usuário, apenas.',
          is_correct: true,
        },
        {
          id: 'C',
          text: 'Manter as salas de vacinação abertas durante todo o horário de funcionamento da unidade de saúde.',
          is_correct: false,
        },
        {
          id: 'D',
          text: 'Aproveitar as oportunidades de vacinação em consultas ou outros procedimentos na unidade de saúde.',
          is_correct: false,
        },
      ],
    },
    reverse_study_slides: [
      {
        type: 'concept_map',
        slide_title: '10 passos PNI — comando EXCETO',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        items: [
          {
            label: 'Comando',
            detail: 'Marque o passo que NÃO integra os 10 passos — três alternativas são ações oficiais da APS.',
            icon: 'Target',
          },
          {
            label: 'ESF × cobertura',
            detail: 'Ampliação vacinal na APS: acesso, sala aberta, vacinar em toda oportunidade.',
            icon: 'Users',
          },
          {
            label: 'Registro vacinal',
            detail: 'Cartão do usuário + sistemas de informação vacinal — registro completo.',
            icon: 'ClipboardList',
          },
        {
          label: 'Estratégia Saúde da Família',
          detail: 'ESF na Atenção Primária amplia coberturas vacinais e imunopreveníveis.',
          icon: 'Users',
        },
        {
          label: 'Pegadinha “apenas”',
            detail: 'B limita registro só ao cartão — omite sistema de informação vacinal e demais registros previstos.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'EXCETO = passo incompleto (só cartão), não acesso ou sala aberta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        steps: [
          'Comando: EXCETO entre os 10 passos para ampliação das coberturas vacinais.',
          'A — evitar barreiras de acesso → passo válido na APS → eliminar.',
          'C — manter sala de vacinação aberta no horário da US → passo válido → eliminar.',
          'D — aproveitar oportunidades em consultas/procedimentos → passo válido → eliminar.',
        'B — registro “no cartão, apenas” → incompleto (falta sistema de informação vacinal) → EXCETO.',
        'Gabarito: letra B.',
      ],
      footer_rule: 'Registro = cartão + sistema de informação — “apenas” invalida o passo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore — 10 passos (trecho da prova)',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: '10 PASSOS — AMPLIAÇÃO DE COBERTURAS',
        rows: [
          { label: 'Acesso', value: 'Evitar barreiras de acesso à vacinação' },
          { label: 'Sala de vacina', value: 'Manter aberta durante todo o horário da unidade' },
          { label: 'Oportunidade', value: 'Vacinar em consultas e outros procedimentos' },
          { label: 'Registro completo', value: 'Cartão do usuário + registro no sistema de informação vacinal' },
        ],
        footer_rule: '“Apenas cartão” não fecha o passo de registro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: 'PEGADINHAS — 10 PASSOS EXCETO',
        items: [
          {
            label: 'Letra A — evitar barreiras',
            detail: 'Parece meta genérica, não passo oficial.',
            correct: 'Afirmativa correta — evitar barreiras de acesso é conduta correta dos 10 passos na APS.',
          },
          {
            label: 'Letra C — sala aberta',
            detail: 'Aluno acha que horário reduzido é aceitável.',
            correct: 'Afirmativa correta — manter sala aberta no horário da US é conduta correta PNI.',
          },
          {
            label: 'Letra D — oportunidade',
            detail: 'Confunde com campanha pontual.',
            correct: 'Afirmativa correta — aproveitar consultas para vacinar é conduta correta na APS.',
          },
          {
            label: 'Letra B — cartão “apenas”',
            detail: '“Apenas” parece detalhe irrelevante.',
            correct: 'Mito do “apenas cartão”: EXCETO — registro exige cartão e sistema de informação vacinal.',
          },
          {
            label: 'Transferência',
          detail: 'Técnico registra só no cartão e não no sistema de informação.',
          correct: 'Registro parcial — passo oficial exige cartão e sistema de informação vacinal.',
          },
        ],
        footer_rule: 'EXCETO = registro parcial, não os passos de acesso',
      },
    ],
  },
};

// Part 2 — fundatec, funtef, decorp, objetiva, igeduc, vunesp
Object.assign(questions, {
  'fundatec-enfermagem-vias-de-administracao-1778968666352-6': {
    meta: {
      ano: '2023',
      banca: 'Fundatec',
      orgao: 'Pref P das Missões',
      prova: 'TEnf',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
      topico: 'Enfermagem',
      subtopico: 'Imunização',
      pedagogical_branch: 'imunizacao_vf_intervalos',
      content_standard: 'golden-v1',
      family: 'vf',
      content_review: {
        reviewed_at: REVIEWED,
        reviewer: 'professor-para-concurso',
        guideline_snapshot: 'PNI 2025 — Manual de Normas: vias ID, SC, IM e volumes máximos',
        exam_vs_current: 'none',
        catalog_slug: 'fundatec-enfermagem-vias-de-administracao-1778968666352-6',
      },
      sources: [
        {
          id: 'pni-2025-vias',
          tier: 'A',
          issuer: 'Ministério da Saúde',
          title: 'Manual de Normas e Procedimentos para Vacinação — vias e volumes',
          year: 2025,
          url: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
          covers: ['BCG intradérmica', 'SCR subcutânea', 'IM cinco mililitros', 'volume subcutâneo'],
        },
      ],
    },
    question_data: {
      instruction:
        'Os imunobiológicos são produtos seguros, eficazes e bastante custo-efetivos em saúde pública. Sua eficácia e segurança, entretanto, estão fortemente\nrelacionadas ao seu manuseio e à sua administração. Portanto, cada imunobiológico demanda uma via específica para a sua administração, a fim de se manter a sua\neficácia plena. Referente às vias de administração dos imunobiológicos, analise as assertivas abaixo:\nI- A vacina BCG e a vacina raiva humana em esquema de pré-exposição são administradas pela via intradérmica.\nII- São exemplos de vacinas administradas por via subcutânea: vacina sarampo, caxumba e rubéola e vacina febre amarela (atenuada).\nIII- Na utilização da via intramuscular, o imunobiológico é introduzido no tecido muscular, sendo apropriado para a administração o volume máximo até 5 mL.\nIV- Na utilização da via subcutânea, a vacina é introduzida na hipoderme, ou seja, na camada subcutânea da pele. O volume máximo a ser administrado por essa\nvia é de 0,5 mL.\nQuais estão corretas?',
      options: [
        { id: 'A', text: 'Apenas I.', is_correct: false },
        { id: 'B', text: 'Apenas IV.', is_correct: false },
        { id: 'C', text: 'Apenas I, II e III.', is_correct: true },
        { id: 'D', text: 'Apenas II, III e IV.', is_correct: false },
        { id: 'E', text: 'I, II, III e IV.', is_correct: false },
      ],
    },
    reverse_study_slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — vias de vacinação PNI',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        items: [
          { label: 'Afirmativa I — BCG e raiva pré', detail: 'BCG e raiva humana pré-exposição: via intradérmica no manual.', icon: 'Syringe' },
          { label: 'Afirmativa II — SCR e FA', detail: 'Tríplice viral e febre amarela atenuada: subcutânea.', icon: 'Shield' },
          { label: 'Afirmativa III — IM', detail: 'Intramuscular: volume máximo até 5 mL por aplicação.', icon: 'Activity' },
          {
            label: 'Pegadinha IV — volume SC',
            detail: 'IV cita meio mililitre como teto SC — manual admite volume maior; item falso.',
            icon: 'AlertTriangle',
          },
          {
          label: 'Imunobiológicos',
          detail: 'Os imunobiológicos demandam via específica para manter eficácia plena na administração.',
          icon: 'Syringe',
        },
        { label: 'Combinação', detail: 'I=V, II=V, III=V, IV=F → letra C.', icon: 'Target' },
        ],
        footer_rule: 'Vias: decore ID/SC/IM antes de montar combinação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        steps: [
          'Formato: quatro assertivas (I–IV) sobre vias + “Quais estão corretas?”.',
          'Julgar I: BCG e raiva pré-exposição intradérmicas? → VERDADEIRA.',
          'Julgar II: SCR e febre amarela subcutâneas? → VERDADEIRA.',
          'Julgar III: IM com volume máximo 5 mL? → VERDADEIRA.',
          'Julgar IV: SC com volume máximo de meio mililitre? → FALSA — manual PNI: volume máximo subcutâneo maior.',
          'Conjunto verdadeiro: I, II e III.',
          'Alternativa C = “Apenas I, II e III.”',
          'Eliminar A, B, D, E (incluem IV ou excluem itens verdadeiros).',
          'Marcar C.',
        ],
        footer_rule: 'Único falso: volume máximo SC na assertiva IV',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias e volumes PNI',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: 'DECORE — VIAS DE VACINAÇÃO',
        rows: [
          { label: 'Intradérmica (ID)', value: 'BCG · raiva humana pré-exposição — dose fracionada típica' },
          { label: 'Subcutânea (SC)', value: 'SCR, SCRV, febre amarela, varicela — volume conforme manual' },
          { label: 'Intramuscular (IM)', value: 'Pentavalente, VIP, hepatite B, influenza — até cinco mililitros' },
          { label: 'Armadilha SC', value: 'Assertiva IV erra o volume máximo da subcutânea no manual', badge: 'warn' },
        ],
        footer_rule: 'ID=BCG/raiva pré · SC=virais atenuadas · IM=pentavalente/VIP',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: 'PEGADINHAS — V/F VIAS (I–IV)',
        items: [
          {
            label: 'Letra A — Apenas I',
            detail: 'Descarta II e III verdadeiras.',
            correct: 'II (SCR/FA SC) e III (IM até cinco mililitros) são corretas — gabarito exige I, II e III.',
          },
          {
            label: 'Letra B — Apenas IV',
            detail: 'Aceita só o item falso.',
            correct: 'IV é falsa — volume máximo subcutâneo no manual não é meio mililitre.',
          },
          {
            label: 'Letra D — II, III e IV',
            detail: 'Inclui IV falsa no pacote.',
            correct: 'IV erra o volume máximo SC — combinação correta sem IV.',
          },
          {
            label: 'Letra E — I a IV',
            detail: 'Marca tudo verdadeiro.',
            correct: 'IV é falsa — incluir IV invalida a combinação; gabarito é I, II e III.',
          },
          {
            label: 'Confundir dose × máximo',
            detail: 'Dose de vacina SC pode ser meio mililitro, mas teto da via é outro no manual.',
            correct: 'Dose da vacina ≠ volume máximo da via — item IV generaliza errado.',
          },
        ],
        footer_rule: 'Testar IV (volume SC) antes de fechar combinação',
      },
    ],
  },

  'funtef-enfermagem-vias-de-administracao-1778968598934-4': {
    meta: {
      ano: '2024',
      banca: 'Funtef',
      orgao: 'Enfermagem I',
      prova: 'Tec (Pref Vitorino)',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
      topico: 'Enfermagem',
      subtopico: 'Imunização',
      pedagogical_branch: 'imunizacao_vf_intervalos',
      content_standard: 'golden-v1',
      family: 'vf',
      content_review: {
        reviewed_at: REVIEWED,
        reviewer: 'professor-para-concurso',
        guideline_snapshot: 'PNI 2025 — BCG intradérmica, deltoide, absorção lenta',
        exam_vs_current: 'none',
        catalog_slug: 'funtef-enfermagem-vias-de-administracao-1778968598934-4',
      },
      sources: [
        {
          id: 'pni-bcg-id',
          tier: 'A',
          issuer: 'Ministério da Saúde',
          title: 'Manual PNI — técnica BCG intradérmica',
          year: 2025,
          url: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
          covers: ['BCG intradérmica', 'dose padrão BCG', 'deltoide', 'absorção lenta'],
        },
      ],
    },
    question_data: {
      instruction:
        'No Brasil, a tuberculose (TB) ainda se constitui como um grave problema de Saúde Pública. Cerca de 70mil pessoas desenvolvem a TB ativa e mais de 40mil\nmorrem em decorrência deste agravo. Para evitar esses agravos, é indicada a vacina (BCG) que protege contra as formas graves de tuberculose (meníngea e miliar). É\nadministrada em crianças dentro dos primeiros 30 dias de vida e a aplicação é realizada geralmente pelo técnico ou enfermeiro da sala de vacinas, pela via intradérmica.\nDiante desse assunto, analise as afirmativas a seguir e assinale a CORRETA.\nI- Volume máximo indicado a ser introduzido por essa via é de 2 ml.\nII- A vacina BCG é administrada por via intradérmica com volume de 0,1 ml.\nIII- O local mais utilizado para injeções intradérmicas é a face anterior do antebraço, mas na vacina BCG é indicada no início da inserção do deltoide.\nIV- É uma via de absorção rápida.\nAssinale a alternativa que corresponde as opções CORRETAS.',
      options: [
        { id: 'A', text: 'II e III.', is_correct: true },
        { id: 'B', text: 'II, III e IV.', is_correct: false },
        { id: 'C', text: 'I, II e IV.', is_correct: false },
        { id: 'D', text: 'I e IV.', is_correct: false },
      ],
    },
    reverse_study_slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — técnica BCG intradérmica',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        items: [
          { label: 'Afirmativa II', detail: 'BCG: dose fracionada por via intradérmica — padrão PNI.', icon: 'Syringe' },
          { label: 'Afirmativa III', detail: 'BCG no deltoide (inserção muscular), não antebraço de rotina.', icon: 'MapPin' },
        {
          label: 'Tuberculose grave',
          detail: 'BCG protege formas meníngea e miliar — aplicação na sala de vacinas.',
          icon: 'Shield',
        },
        {
          label: 'Pegadinha I — volume exagerado',
            detail: 'Volume intradérmico máximo é fração de mililitro — dois mililitros é absurdo para ID.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha IV — absorção',
            detail: 'Intradérmica tem absorção lenta — IV inverte farmacocinética da via.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'BCG: dose ID no deltoide · absorção lenta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        steps: [
          'Formato: I–IV sobre técnica da BCG intradérmica.',
          'Julgar I: volume máximo ID de dois mililitros? → FALSA — ID usa frações de mililitro.',
          'Julgar II: BCG intradérmica com dose padrão? → VERDADEIRA.',
          'Julgar III: BCG no deltoide (não antebraço padrão)? → VERDADEIRA.',
          'Julgar IV: via de absorção rápida? → FALSA — intradérmica é absorção lenta.',
          'Conjunto: II e III.',
          'Alternativa A.',
          'Eliminar B (inclui IV), C (inclui I e IV), D (I e IV).',
          'Marcar A.',
        ],
        footer_rule: 'Falsos: I (volume) e IV (absorção)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore — BCG intradérmica',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: 'BCG NO PNI — TÉCNICA',
        rows: [
          { label: 'Via e dose', value: 'Intradérmica · dose única até 30 dias de vida' },
          { label: 'Sítio', value: 'Inserção do músculo deltoide (braço direito preferencial)' },
          { label: 'Volume ID', value: 'Frações de mililitro — não dois mililitros', badge: 'warn' },
          { label: 'Absorção', value: 'Lenta — barreira dérmica retarda entrada', badge: 'info' },
        ],
        footer_rule: 'Antebraço ID é regra geral; BCG é exceção no deltoide',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: 'PEGADINHAS — BCG I–IV',
        items: [
          {
            label: 'Letra B — II, III e IV',
            detail: 'Mantém IV verdadeira.',
            correct: 'IV é FALSA — intradérmica não é via de absorção rápida.',
          },
          {
            label: 'Letra C — I, II e IV',
            detail: 'Aceita volume intradérmico absurdo.',
            correct: 'I é FALSA — volume intradérmico não chega a dois mililitros.',
          },
          {
            label: 'Letra D — I e IV',
            detail: 'Só os dois itens falsos.',
            correct: 'Gabarito positivo é II e III — letra A.',
          },
          {
            label: 'Confundir sítio ID geral',
            detail: 'Antebraço é padrão de ID, mas BCG vai no deltoide.',
            correct: 'III é verdadeira — exceção técnica da BCG.',
          },
        ],
        footer_rule: 'Julgar I e IV primeiro — ambas falsas',
      },
    ],
  },
});

Object.assign(questions, {
  'decorp-enfermagem-vias-de-administracao-1776056357082-0': {
    meta: {
      banca: 'DECORP',
      prova: 'Tec Enf',
      orgao: 'Enfermagem',
      ano: '2025',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
      topico: 'Enfermagem',
      subtopico: 'Imunização',
      pedagogical_branch: 'imunizacao_calendario',
      content_standard: 'golden-v1',
      family: 'conceito',
      content_review: {
        reviewed_at: REVIEWED,
        reviewer: 'professor-para-concurso',
        guideline_snapshot: 'PNI 2025 — SCR 1ª dose aos 12 meses, via subcutânea',
        exam_vs_current: 'none',
        catalog_slug: 'decorp-enfermagem-vias-de-administracao-1776056357082-0',
        repair_lote: LOTE,
      },
      sources: [
        {
          id: 'pni-2025-scr',
          tier: 'A',
          issuer: 'Ministério da Saúde',
          title: 'Calendário Nacional de Vacinação — tríplice viral (SCR)',
          year: 2025,
          url: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
          covers: ['SCR 12 meses', 'via subcutânea', 'SCRV 15 meses'],
        },
      ],
    },
    question_data: {
      instruction:
        'Em relação a administração da vacina tríplice viral (sarampo, caxumba e rubéola) em uma criança de um ano, assinale a alternativa que apresenta a via de administração correta, considerando as diretrizes do PNI.',
      options: [
        { id: 'A', text: 'Via subcutânea.', is_correct: true },
        { id: 'B', text: 'Via intradérmica.', is_correct: false },
        { id: 'C', text: 'Via intramuscular.', is_correct: false },
        { id: 'D', text: 'Via endovenosa.', is_correct: false },
      ],
    },
    reverse_study_slides: [
      {
        type: 'concept_map',
        slide_title: 'SCR — via de administração',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        items: [
          {
            label: 'Comando',
            detail: 'Via correta da tríplice viral (sarampo, caxumba, rubéola) aos 12 meses — PNI.',
            icon: 'Target',
          },
          { label: 'Esquema', detail: '1ª dose aos 12 meses; 2ª dose aos 15 meses (SCRV ou SCR).', icon: 'Syringe' },
          { label: 'Via PNI', detail: 'Subcutânea — vacina atenuada, nunca endovenosa.', icon: 'Shield' },
          {
            label: 'Pegadinha via',
            detail: 'IM é para pentavalente/VIP — SCR não entra nesse grupo.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'SCR = subcutânea',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        steps: [
          'Cenário: criança de 1 ano → 1ª dose de tríplice viral no PNI.',
          'Recuperar regra: SCR = subcutânea.',
          'B intradérmica → BCG; eliminar.',
          'C intramuscular → pentavalente/VIP; eliminar.',
          'D endovenosa → vacina nunca EV; eliminar.',
          'A subcutânea → correta.',
          'Marcar A.',
        ],
        footer_rule: 'IM ≠ SCR — decore a via por vacina',
      },
      {
        type: 'golden_rule',
        slide_title: 'Vias — vacinas atenuadas × injetáveis',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: 'SCR NO PNI — VIA CORRETA',
        rows: [
          { label: 'SCR (12 meses)', value: 'Subcutânea', emphasis: 'success', badge: 'hot' },
          { label: 'SCRV / 2ª dose', value: 'Subcutânea', badge: 'ok' },
          { label: 'Pentavalente, VIP, hepatite B', value: 'Intramuscular', badge: 'info' },
          { label: 'BCG', value: 'Intradérmica', badge: 'warn' },
          { label: 'Febre amarela', value: 'Subcutânea', badge: 'info' },
        ],
        footer_rule: 'Atenuadas SC: SCR, SCRV, FA, varicela',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: 'PEGADINHAS — VIA DA SCR',
        items: [
          {
            label: 'Letra B — intradérmica',
            detail: 'Parece técnica de vacinação.',
            correct: 'Intradérmica é BCG — não tríplice viral.',
          },
          {
            label: 'Letra C — intramuscular',
            detail: 'Muitas vacinas do calendário são IM.',
            correct: 'SCR é subcutânea — erro clássico de prova.',
          },
          {
            label: 'Letra D — endovenosa',
            detail: 'Seduz quem busca ação rápida.',
            correct: 'Vacina nunca é administrada por via endovenosa.',
          },
          {
            label: 'Transferência',
            detail: 'Tetra viral aos 15 meses e febre amarela.',
            correct: 'Também são subcutâneas no PNI.',
          },
        ],
        footer_rule: 'Na dúvida: SCR/SCRV/FA = subcutânea',
      },
    ],
  },

  'objetiva-concursos-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563843512-8': {
    meta: {
      ano: '2021',
      banca: 'Objetiva Concursos',
      orgao: 'Pref Nova Itaberaba',
      prova: 'ACS (N Itaberaba)',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
      topico: 'Enfermagem',
      subtopico: 'Imunização',
      pedagogical_branch: 'imunizacao_generico',
      content_standard: 'golden-v1',
      family: 'conceito',
      content_review: {
        reviewed_at: REVIEWED,
        reviewer: 'professor-para-concurso',
        guideline_snapshot: 'OMS — erradicação da varíola (1980); sarampo ainda não erradicado globalmente',
        exam_vs_current: 'none',
        catalog_slug: 'objetiva-concursos-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563843512-8',
      },
      sources: [
        {
          id: 'oms-varíola',
          tier: 'A',
          issuer: 'Organização Mundial da Saúde',
          title: 'Erradicação da varíola — marco histórico da vacinação',
          year: 2025,
          url: 'https://www.who.int/news-room/fact-sheets/detail/smallpox',
          covers: ['única doença erradicada', 'campanha global OMS', 'marco histórico 1980'],
        },
      ],
    },
    question_data: {
      instruction:
        'A doença foi erradicada graças a um esforço global de 10 anos, liderado pela Organização Mundial da Saúde, que envolveu milhares de profissionais de saúde, emtodo o mundo, para administrar meio bilhão de vacinas.\nhttps://www.paho.org... - adaptado.\nDe acordo com a notícia acima, a única doença que foi erradicada até hoje é o(a):',
      options: [
        { id: 'A', text: 'Varíola.', is_correct: true },
        { id: 'B', text: 'HIV.', is_correct: false },
        { id: 'C', text: 'Doença de Chagas.', is_correct: false },
        { id: 'D', text: 'Influenza .', is_correct: false },
        { id: 'E', text: 'Sarampo.', is_correct: false },
      ],
    },
    reverse_study_slides: [
      {
        type: 'concept_map',
        slide_title: 'Erradicação — marco da saúde pública',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        items: [
          {
            label: 'Comando',
            detail: 'Identificar a única doença erradicada globalmente por vacinação em massa.',
            icon: 'Target',
          },
          {
            label: 'Pista do texto',
            detail: 'Campanha OMS ~10 anos, meio bilhão de doses — caso histórico da varíola.',
            icon: 'Globe',
          },
          {
            label: 'Varíola',
            detail: 'Declarada erradicada em 1980 — única até hoje.',
            icon: 'Award',
          },
          {
            label: 'Pegadinha sarampo',
            detail: 'Sarampo tem meta de eliminação regional, mas não erradicação global concluída.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Erradicada global = varíola',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        steps: [
          'Ler a notícia: esforço global OMS + vacinação em massa → erradicação.',
          'Recuperar marco histórico: varíola — única doença erradicada.',
          'B HIV → sem vacina erradicadora; eliminar.',
          'C Chagas → controle, não erradicação por vacina; eliminar.',
          'D Influenza → muta todo ano; eliminar.',
          'E Sarampo → eliminação em curso, não erradicado; eliminar.',
          'A Varíola → correta.',
          'Marcar A.',
        ],
        footer_rule: 'Não confundir eliminação regional com erradicação global',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore — erradicação × controle',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: 'IMPACTO DAS VACINAS — PROVA',
        rows: [
          { label: 'Erradicada (OMS)', value: 'Varíola (1980) — única até hoje', badge: 'hot' },
          { label: 'Sarampo', value: 'Meta de eliminação — surtos ainda ocorrem', badge: 'warn' },
          { label: 'Poliomielite', value: 'Eliminação regional avançada — não erradicada globalmente', badge: 'info' },
          { label: 'HIV / Influenza', value: 'Sem erradicação por vacina única', badge: 'info' },
        ],
        footer_rule: '“Única erradicada” = varíola',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: 'PEGADINHAS — ERRADICAÇÃO',
        items: [
          {
            label: 'Letra E — sarampo',
            detail: 'Tema quente de campanha — parece erradicado.',
            correct: 'Sarampo ainda não erradicado globalmente — eliminação em progresso.',
          },
          {
            label: 'Letra D — influenza',
            detail: 'Vacina anual confunde com sucesso total.',
            correct: 'Gripe não é erradicável com esquema atual — vírus muta.',
          },
          {
            label: 'Letra B — HIV',
            detail: 'Prevenção existe, mas sem vacina de erradicação.',
            correct: 'HIV não foi erradicado — alternativa absurda no contexto.',
          },
          {
            label: 'Letra C — Chagas',
            detail: 'Doença brasileira famosa em prova.',
            correct: 'Controle vetorial/medicamentoso — não erradicação vacinal global.',
          },
        ],
        footer_rule: 'Campanha OMS + meio bilhão de doses → varíola',
      },
    ],
  },

  'igeduc-enfermagem-urgencias-e-emergencias-1777104024064-3': {
    meta: {
      ano: '2023',
      banca: 'Igeduc',
      orgao: 'Pref Tupanatinga',
      prova: 'TEnf (Tupanatinga)',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
      topico: 'Enfermagem',
      subtopico: 'Imunização',
      pedagogical_branch: 'imunizacao_calendario',
      content_standard: 'golden-v1',
      family: 'certo_errado',
      content_review: {
        reviewed_at: REVIEWED,
        reviewer: 'professor-para-concurso',
        guideline_snapshot: 'PNI/MS — profilaxia pós-exposição raiva: esquema 4 doses ID dias 0-3-7-14, bilateral',
        exam_vs_current: 'none',
        catalog_slug: 'igeduc-enfermagem-urgencias-e-emergencias-1777104024064-3',
      },
      sources: [
        {
          id: 'pni-raiva-pep',
          tier: 'A',
          issuer: 'Ministério da Saúde',
          title: 'Manual de Profilaxia da Raiva Humana — esquema vacinal pós-exposição',
          year: 2022,
          url: 'https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/raiva',
          covers: ['4 doses', 'via intradérmica', 'dias 0-3-7-14', 'dois sítios'],
        },
      ],
    },
    question_data: {
      instruction:
        'A administração da vacina antirrábica na profilaxia pósexposição por via intradérmica deve ser realizada no esquema vacinal de 4 (quatro) doses, nos dias 0, 3, 7 e\n14. O volume da dose é de 0,2ml, dividido em duas aplicações de 0,1mL, cada e administradas em dois sítios distintos, independente da apresentação da vacina.',
      options: [
        { id: 'A', text: 'Certo', is_correct: true },
        { id: 'B', text: 'Errado', is_correct: false },
      ],
    },
    reverse_study_slides: [
      {
        type: 'concept_map',
        slide_title: 'Raiva PEP — esquema intradérmico',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        items: [
          {
            label: 'Comando',
            detail: 'Julgar item Certo/Errado sobre vacina antirrábica pós-exposição intradérmica.',
            icon: 'Target',
          },
          {
            label: 'Esquema 4 doses',
            detail: 'Dias 0, 3, 7 e 14 — profilaxia pós-exposição atual.',
            icon: 'Calendar',
          },
          {
            label: 'Técnica ID',
            detail: 'Dose dividida em dois sítios distintos (deltoide bilateral).',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha IM',
            detail: 'Banca troca para esquema intramuscular de cinco doses — aqui é ID 4 doses.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'PEP raiva ID: 0-3-7-14 · dois sítios',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        steps: [
          'Item afirma: PEP antirrábica intradérmica, 4 doses (0-3-7-14).',
          'Volume: dose dividida em duas aplicações em sítios distintos.',
          'Conferir manual MS: esquema ID pós-exposição com 4 aplicações nesses dias.',
          'Técnica bilateral confere com protocolo vigente.',
          'Afirmativa integralmente correta.',
          'Marcar A — Certo.',
        ],
        footer_rule: 'Não confundir com esquema IM de 5 doses',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore — PEP raiva (via ID)',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: 'PROFILAXIA PÓS-EXPOSIÇÃO — VACINA',
        rows: [
          { label: 'Via', value: 'Intradérmica (esquema preferencial quando indicado)' },
          { label: 'Doses', value: '4 aplicações — dias 0, 3, 7 e 14' },
          { label: 'Volume', value: 'Dose fracionada em dois sítios por aplicação' },
          { label: 'IM alternativo', value: 'Esquema intramuscular diferente — não é o item julgado', badge: 'warn' },
        ],
        footer_rule: 'Soro + vacina conforme categoria de exposição',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: 'PEGADINHAS — CERTO/ERRADO RAIVA',
        items: [
          {
            label: 'Letra B — Errado',
            detail: 'Aluno confunde com esquema IM de 5 doses.',
            correct: 'Item descreve corretamente o esquema ID 4 doses — marcar Certo.',
          },
          {
            label: 'Dias do esquema',
            detail: 'Trocar 7 por 28 ou omitir dia 3.',
            correct: 'Sequência 0-3-7-14 é a do protocolo ID pós-exposição.',
          },
          {
            label: 'Volume em um só sítio',
            detail: 'Aplicar dose inteira em um único local.',
            correct: 'São duas aplicações em sítios distintos — técnica bilateral do protocolo.',
          },
        ],
        footer_rule: 'PEP: conferir via + número de doses + volume',
      },
    ],
  },

  'vunesp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-2': {
    meta: {
      ano: '2023',
      banca: 'VUNESP',
      orgao: 'ESF',
      prova: 'TEnf (Pref Taubaté)',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
      topico: 'Enfermagem',
      subtopico: 'Imunização',
      pedagogical_branch: 'imunizacao_generico',
      content_standard: 'golden-v1',
      family: 'conceito',
      content_review: {
        reviewed_at: REVIEWED,
        reviewer: 'professor-para-concurso',
        guideline_snapshot: 'PNI — gestão sala de vacina: CMM = soma consumo trimestre ÷ 3 meses',
        exam_vs_current: 'none',
        catalog_slug: 'vunesp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-2',
      },
      sources: [
        {
          id: 'pni-sala-vacina',
          tier: 'A',
          issuer: 'Ministério da Saúde',
          title: 'Manual PNI — gestão de insumos na sala de vacinação',
          year: 2025,
          url: 'https://www.gov.br/saude/pt-br/vacinacao',
          covers: ['consumo médio mensal', 'previsão de materiais'],
        },
      ],
    },
    question_data: {
      instruction:
        'No início do mês de julho/2023, com o propósito de realizar a previsão de materiais para a sala de vacinas da unidade, o enfermeiro solicitou ao técnico deenfermagem (TE), entre outras informações, o consumo médio mensal (CMM) de seringas de 1 mL do segundo trimestre/2023. Ao conferir a planilha de consumo dessematerial, o TE constatou os seguintes registros:\n2023\n2022\njun\nmai\nabr\nmar\nfev\njan\ndez\nnov\nout\nset\nago\njul\n240\n200\n220\n210\n180\n150\n190\n200\n220\n200\n250\n240\nCom base nos registros observados, o TE deve informar que, para o período solicitado, o CMM de seringas de 1 mL é de',
      options: [
        { id: 'A', text: '230 unidades.', is_correct: false },
        { id: 'B', text: '220 unidades.', is_correct: true },
        { id: 'C', text: '209 unidades.', is_correct: false },
        { id: 'D', text: '204 unidades.', is_correct: false },
        { id: 'E', text: '180 unidades.', is_correct: false },
      ],
    },
    reverse_study_slides: [
      {
        type: 'concept_map',
        slide_title: 'Sala de vacina — CMM 2º trimestre',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        items: [
          {
            label: 'Comando',
            detail: 'Calcular CMM de seringas do segundo trimestre/2023 (abr–mai–jun).',
            icon: 'Target',
          },
          {
            label: 'Dados do trimestre',
            detail: 'Abr 220 · Mai 200 · Jun 240 unidades.',
            icon: 'BarChart',
          },
          {
            label: 'Fórmula CMM',
            detail: 'Soma dos 3 meses ÷ 3 = consumo médio mensal.',
            icon: 'Calculator',
          },
          {
            label: 'Pegadinha período',
            detail: 'Banca oferece média de 12 meses ou trimestre errado — ler “2º trimestre/2023”.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'CMM = (abr+mai+jun) ÷ 3',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        steps: [
          'Conferir material: seringas com unidade mililitro citada no enunciado.',
          'Identificar período: 2º trimestre/2023 = abril, maio, junho.',
          'Extrair consumos: abr 220, mai 200, jun 240.',
          'Somar: 220 + 200 + 240 = 660.',
          'Dividir por 3 meses: 660 ÷ 3 = 220.',
          'Conferir alternativas: B = 220 unidades.',
          'Eliminar A (230 — média de outro recorte), C, D, E.',
          'Marcar B.',
        ],
        footer_rule: 'Só os 3 meses pedidos — ignorar coluna 2022',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore — CMM na sala de vacina',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: 'GESTÃO DE INSUMOS — FÓRMULA',
        rows: [
          { label: 'CMM', value: 'Consumo médio mensal = Σ consumo do período ÷ nº de meses' },
          { label: '2º trimestre', value: 'Abril + maio + junho do ano pedido' },
          { label: 'Esta questão', value: '(220 + 200 + 240) ÷ 3 = 220', badge: 'hot' },
          { label: 'Erro comum', value: 'Incluir 2022 ou 12 meses na média', badge: 'warn' },
        ],
        footer_rule: 'Previsão de materiais usa CMM do período solicitado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: 'Imunização' },
        content: 'PEGADINHAS — CMM VUNESP',
        items: [
          {
            label: 'Letra A — 230',
            detail: 'Média aproximada de outros meses de 2023.',
            correct: 'CMM do 2º tri é 220 — não 230.',
          },
          {
            label: 'Letra C — 209',
            detail: 'Divisor ou meses errados na conta.',
            correct: '660 ÷ 3 = 220 — não 209.',
          },
          {
            label: 'Letra D — 204',
            detail: 'Inclui meses fora do trimestre.',
            correct: 'Usar só abr–mai–jun/2023 → 220.',
          },
          {
            label: 'Letra E — 180',
            detail: 'Valor isolado de janeiro/2023.',
            correct: 'CMM exige média dos três meses do trimestre — não um mês só.',
          },
        ],
        footer_rule: 'Ler o trimestre certo antes de somar',
      },
    ],
  },
});

for (const [slug, payload] of Object.entries(questions)) {
  const out = { ...payload, modulo_slug: slug };
  writeFileSync(questionFilePath(LOTE, slug), JSON.stringify(out, null, 2), 'utf8');
  console.log(`[handcraft-g82] wrote ${slug}`);
}

console.log(`[handcraft-g82] done ${Object.keys(questions).length} files`);
