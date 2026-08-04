/**
 * Handcraft golden-v1 — atencao-basica-saude-da-familia-g19 (8 slugs).
 * Run: npx tsx scripts/handcraft-atencao-basica-saude-da-familia-g19.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'atencao-basica-saude-da-familia-g19';
const DIR = path.join('data/catalog-migration', LOTE, 'questions');
const SUB = 'Atenção Básica / Saúde da Família';
const TOPICO = 'Enfermagem';

const PNAB = {
  id: 'pnab-2436-2017',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Portaria GM/MS nº 2.436/2017 — Política Nacional de Atenção Básica',
  year: 2017,
  url: 'https://bvsms.saude.gov.br/bvs/saudelegis/gm/2017/prt2436_22_09_2017.html',
};

const PORTARIA_CONSOLIDACAO_5 = {
  id: 'portaria-consolidacao-5-2017-ad',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Portaria de Consolidação nº 5/2017 — Título III, Anexo (Atenção Domiciliar no SUS)',
  year: 2017,
  url: 'https://bvsms.saude.gov.br/bvs/saudelegis/gm/2017/prc0005_03_10_2017.html',
};

const CAB_FAMILIA = {
  id: 'cab-39-familia',
  tier: 'B' as const,
  issuer: 'Ministério da Saúde',
  title: 'Caderno de Atenção Básica nº 39 — Núcleo de Apoio à Saúde da Família (arranjos familiares)',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/nucleo_apoio_saude_familia_cab39.pdf',
};

const CAB_DENGUE = {
  id: 'ms-dengue-manejo-vetorial',
  tier: 'B' as const,
  issuer: 'Ministério da Saúde',
  title: 'Diretrizes Nacionais para a Prevenção e Controle de Epidemias de Dengue (manejo integrado de vetores)',
  year: 2009,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/diretrizes_nacionais_prevencao_controle_dengue.pdf',
};

const CAB_OBESIDADE = {
  id: 'cab-38-obesidade',
  tier: 'B' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 38 — Estratégias para o cuidado da pessoa com doença crônica: obesidade',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/estrategias_cuidado_pessoa_doenca_cronica_obesidade_cab38.pdf',
};

type Item = { label: string; detail?: string; icon?: string; correct?: string };
type Row = { label: string; value: string; badge?: string };

function slideMeta() {
  return { topico: TOPICO, subtopico: SUB };
}

function conceptMap(title: string, items: Item[], footer: string) {
  return {
    type: 'concept_map' as const,
    slide_title: title,
    meta: slideMeta(),
    items,
    footer_rule: footer,
  };
}

function logicFlow(steps: string[], footer: string) {
  return {
    type: 'logic_flow' as const,
    reveal_mode: 'tap' as const,
    meta: slideMeta(),
    steps,
    footer_rule: footer,
  };
}

function goldenRule(title: string, content: string, rows: Row[], footer: string) {
  return {
    type: 'golden_rule' as const,
    slide_title: title,
    meta: slideMeta(),
    content,
    rows,
    footer_rule: footer,
  };
}

function dangerZone(content: string, items: Item[], footer: string) {
  return {
    type: 'danger_zone' as const,
    bullet_style: 'x_icon' as const,
    meta: slideMeta(),
    content,
    items,
    footer_rule: footer,
  };
}

type Patch = {
  file: string;
  family: string;
  pedagogical_branch: string;
  guideline_snapshot: string;
  exam_vs_current?: string;
  sources: Array<Record<string, unknown>>;
  slides: unknown[];
};

const PATCHES: Patch[] = [
  {
    file: 'instituto-consulplan-enfermagem-atencao-basica-saude-da-familia-1778968125784-3.json',
    family: 'conceito',
    pedagogical_branch: 'ab_esf_composicao',
    guideline_snapshot:
      'Família nuclear: progenitores e seus descendentes diretos — um dos arranjos familiares reconhecidos pela ESF no cuidado centrado na família',
    sources: [{ ...CAB_FAMILIA, covers: ['família nuclear', 'arranjos familiares', 'ESF'] }],
    slides: [
      conceptMap(
        'Arranjos familiares — família nuclear',
        [
          {
            label: 'Contexto ESF',
            detail: 'A equipe de Saúde da Família elege a família como foco de atenção, respeitando seus vários formatos.',
            icon: 'Users',
          },
          {
            label: 'Vínculo, não só sangue',
            detail: 'Laços afetivos são essenciais e nem sempre coincidem com parentesco biológico.',
            icon: 'Heart',
          },
          {
            label: 'Termo cobrado',
            detail: 'Família nuclear é o arranjo formado por progenitores e seus descendentes diretos.',
            icon: 'Home',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar "progenitores e filhos" por só um progenitor, extensos ou recasamento.',
            icon: 'AlertTriangle',
          },
        ],
        'Nuclear = pais + filhos diretos, nada além',
      ),
      logicFlow(
        [
          'Pergunta pede a definição correta de família nuclear no cuidado da ESF.',
          'Eliminar: um só progenitor cuidando dos filhos descreve família monoparental.',
          'Eliminar: novas uniões com parceiros de relações anteriores descreve família reconstituída.',
          'Eliminar: incluir tios, primos, avós descreve família extensa, não nuclear.',
          'Sobra progenitores e seus descendentes diretos → marcar A.',
          'Em similares: "nuclear" sempre é o arranjo mais restrito — pais e filhos, sem terceiros.',
        ],
        'Portátil: nuclear é o arranjo mais restrito',
      ),
      goldenRule(
        'Decore — arranjos familiares na ESF',
        'QUATRO ARRANJOS QUE SE CONFUNDEM',
        [
          { label: 'Nuclear', value: 'Progenitores e seus descendentes diretos (os filhos).', badge: 'ok' },
          { label: 'Monoparental', value: 'Apenas um dos progenitores assume a criação dos filhos.', badge: 'ok' },
          { label: 'Reconstituída', value: 'Novas uniões entre parceiros de relações anteriores, com ou sem filhos.', badge: 'ok' },
          { label: 'Extensa', value: 'Inclui parentes além dos pais e filhos: tios, avós, primos.', badge: 'warn' },
        ],
        'Decore: cada arranjo tem um traço exclusivo',
      ),
      dangerZone(
        'PEGADINHAS — arranjos familiares',
        [
          {
            label: 'Letra B — apenas um progenitor cria os filhos',
            detail: 'Descreve a família monoparental, não a nuclear.',
            correct: 'Nuclear exige os dois progenitores e os filhos diretos; um só progenitor é outro arranjo.',
          },
          {
            label: 'Letra C — novas uniões com filhos de relações anteriores',
            detail: 'Descreve a família reconstituída (ou recomposta).',
            correct: 'Reconstituída combina uniões posteriores; nuclear é a primeira união com os filhos diretos.',
          },
          {
            label: 'Letra D — inclui tios, primos, avós',
            detail: 'Descreve a família extensa.',
            correct: 'Extensa amplia para parentes além do núcleo; nuclear se limita a pais e filhos.',
          },
          {
            label: 'Transferência',
            detail: '"Qualquer grupo de parentes morando junto é família nuclear".',
            correct: 'Em similares, teste se a definição fala só de pais e filhos diretos — só assim é nuclear.',
          },
        ],
        'Confundir arranjos familiares → distrator',
      ),
    ],
  },
  {
    file: 'instituto-consulplan-enfermagem-atencao-basica-saude-da-familia-1778968125784-5.json',
    family: 'conceito',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Família monoparental: apenas um dos progenitores assume a criação dos filhos — arranjo determinado historicamente, sem forma única de família',
    sources: [{ ...CAB_FAMILIA, covers: ['família monoparental', 'arranjos familiares'] }],
    slides: [
      conceptMap(
        'Arranjos familiares — família monoparental',
        [
          {
            label: 'Contexto',
            detail: 'Trajetórias, visões de mundo e condições de vida moldam como as famílias se organizam e usam suas estratégias e autonomia diante dos serviços de saúde.',
            icon: 'History',
          },
          {
            label: 'Sem concepção única',
            detail: 'Não existe uma só concepção de família: a ideia é historicamente determinada e muda de formato e finalidade ao longo do tempo.',
            icon: 'RefreshCcw',
          },
          {
            label: 'Termo cobrado',
            detail: 'Família monoparental é aquela em que só um dos progenitores assume a criação dos filhos.',
            icon: 'UserRound',
          },
          {
            label: 'Impacto no cuidado',
            detail: 'Reconhecer esse formato de família ajuda a equipe a processar informações e orientações sobre os cuidados com a saúde de cada usuário.',
            icon: 'HeartHandshake',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Confundir monoparental com nuclear, reconstituída ou homoafetiva.',
            icon: 'AlertTriangle',
          },
        ],
        'Monoparental = um progenitor sozinho na criação',
      ),
      logicFlow(
        [
          'Pergunta pede a definição correta de família monoparental, considerando os diferentes formatos de família.',
          'Fixar: trajetórias, visões de mundo e condições de vida moldam as estratégias de cada família diante dos serviços de saúde.',
          'Eliminar: casal homoafetivo com ou sem filhos descreve orientação do casal, não define monoparentalidade.',
          'Eliminar: progenitores e descendentes diretos descreve família nuclear (dois progenitores).',
          'Eliminar: novas uniões entre parceiros de relações anteriores descreve família reconstituída.',
          'Sobra apenas um progenitor assumindo a criação dos filhos → marcar C.',
          'Em similares: monoparental sempre destaca "um só" responsável pelos filhos, independente de trajetória ou condição de vida.',
        ],
        'Portátil: monoparental = "um só" cuidando',
      ),
      goldenRule(
        'Decore — teste do arranjo familiar',
        'QUANTOS PROGENITORES CRIAM OS FILHOS?',
        [
          { label: 'Um só', value: 'Família monoparental.', badge: 'ok' },
          { label: 'Dois, primeira união', value: 'Família nuclear.', badge: 'warn' },
          { label: 'Dois, de uniões anteriores', value: 'Família reconstituída.', badge: 'warn' },
          { label: 'Orientação do casal', value: 'Não define por si a monoparentalidade (pode ser nuclear ou não).', badge: 'warn' },
        ],
        'Decore: pergunte "quantos progenitores criam?"',
      ),
      dangerZone(
        'PEGADINHAS — qual arranjo',
        [
          {
            label: 'Letra A — casal homoafetivo com ou sem filhos',
            detail: 'Fala da orientação do casal, não de quantos progenitores criam os filhos.',
            correct: 'Isso não define monoparentalidade; o traço decisivo é ter só um progenitor responsável.',
          },
          {
            label: 'Letra B — progenitores e descendentes diretos',
            detail: 'Fala de dois progenitores.',
            correct: 'Essa é a definição de família nuclear, não monoparental.',
          },
          {
            label: 'Letra D — novas uniões com filhos de uniões anteriores',
            detail: 'Também tem mais de um adulto responsável.',
            correct: 'Isso descreve família reconstituída; monoparental tem só um progenitor.',
          },
          {
            label: 'Transferência',
            detail: '"Família diferente do padrão tradicional já é monoparental".',
            correct: 'Em similares, o teste é sempre "quantos progenitores criam os filhos?" — só um = monoparental.',
          },
        ],
        'Trocar critério "um progenitor" por outro traço → cai',
      ),
    ],
  },
  {
    file: 'instituto-ibed-enfermagem-processo-de-enfermagem-1780004926596-7.json',
    family: 'certo_errado',
    pedagogical_branch: 'ab_esf_composicao',
    guideline_snapshot:
      'Técnico de enfermagem na ESF participa de visitas domiciliares como parte da equipe multiprofissional — atribuição não se restringe à UBS',
    sources: [{ ...PNAB, covers: ['ESF', 'atribuições do técnico de enfermagem', 'visita domiciliar'] }],
    slides: [
      conceptMap(
        'Técnico de enfermagem — visita domiciliar na ESF',
        [
          {
            label: 'Afirmativa da prova',
            detail: 'Atribuições do técnico de enfermagem restringem-se a procedimentos dentro da UBS, sendo vedada visita domiciliar.',
            icon: 'FileText',
          },
          {
            label: 'Realidade da ESF',
            detail: 'O cuidado no território inclui visitas domiciliares feitas por toda a equipe, incluindo o técnico de enfermagem.',
            icon: 'MapPin',
          },
          {
            label: 'Por que participa',
            detail: 'Vacinação, curativos e orientações também acontecem no domicílio do usuário adscrito.',
            icon: 'HomeIcon',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que "vedada" é palavra neutra e não decisiva para julgar a afirmativa.',
            icon: 'AlertTriangle',
          },
        ],
        'ESF trabalha no território, não só na UBS',
      ),
      logicFlow(
        [
          'Ler a afirmativa: atribuições do técnico restringem-se à UBS, vedada participação em visitas domiciliares.',
          'Fixar que a ESF organiza o cuidado por território adscrito, não só dentro do prédio da unidade.',
          'Testar: o técnico de enfermagem participa sim de visitas domiciliares, junto com a equipe.',
          'A palavra "vedada" contraria a prática real da Estratégia Saúde da Família.',
          'Afirmativa contém erro → marcar Errado (B).',
          'Em similares: quando a frase "restringe" ou "veda" atuação no território, desconfie — ESF é atuação territorial.',
        ],
        'Portátil: "vedada atuação no território" costuma ser Errado',
      ),
      goldenRule(
        'Decore — técnico e o território da ESF',
        'ATUAÇÃO NÃO SE LIMITA À UBS',
        [
          { label: 'Na UBS', value: 'Procedimentos de rotina, vacinação, curativos, sala de espera.', badge: 'ok' },
          { label: 'No domicílio', value: 'Visitas domiciliares em conjunto com a equipe de Saúde da Família.', badge: 'ok' },
          { label: 'Armadilha', value: 'Frases que "vedam" ou "restringem" a atuação ao prédio da UBS.', badge: 'warn' },
        ],
        'Decore: ESF cuida do território, não só do prédio',
      ),
      dangerZone(
        'PEGADINHAS — restrição à UBS',
        [
          {
            label: 'Marcar Certo por "parecer" atribuição só interna',
            detail: 'Supor que procedimento técnico só acontece dentro da unidade.',
            correct: 'A ESF é organizada por território; o técnico de enfermagem também atua em visitas domiciliares.',
          },
          {
            label: 'Ignorar a palavra "vedada"',
            detail: 'Passar direto pelo termo que nega a participação em visitas.',
            correct: 'Vedar visita domiciliar contraria a lógica da Saúde da Família — a frase erra por isso.',
          },
          {
            label: 'Achar que só o ACS visita domicílios',
            detail: 'Restringir a visita domiciliar a um único profissional.',
            correct: 'Visitas domiciliares na ESF envolvem toda a equipe conforme a necessidade do usuário, não só o ACS.',
          },
          {
            label: 'Transferência',
            detail: '"Técnico de enfermagem só trabalha dentro da unidade de saúde".',
            correct: 'Em similares, lembre que a ESF é territorial: a equipe toda pode atuar no domicílio do usuário.',
          },
        ],
        'Vedar atuação no território → Errado',
      ),
    ],
  },
  {
    file: 'instituto-verbena-enfermagem-atencao-basica-saude-da-familia-1778968194611-0.json',
    family: 'conceito',
    pedagogical_branch: 'ab_acs_territorio',
    guideline_snapshot:
      'Controle mecânico do Aedes: eliminação ou destinação adequada de criadouros (pneus, recicláveis, vasos) feita pelo ACS no território',
    sources: [{ ...CAB_DENGUE, covers: ['controle mecânico', 'manejo integrado de vetores', 'ACS'] }],
    slides: [
      conceptMap(
        'Controle do Aedes — método mecânico',
        [
          {
            label: 'Cenário',
            detail: 'ACS orienta uso de telas e repelentes durante viremia, evitando transmissão a familiares e vizinhos.',
            icon: 'ShieldAlert',
          },
          {
            label: 'Método cobrado',
            detail: 'Controle mecânico: eliminar ou destinar corretamente pneus, recicláveis, vasos e outros resíduos.',
            icon: 'Trash2',
          },
          {
            label: 'Não confundir',
            detail: 'Biológico usa predadores/patógenos naturais; químico usa inseticidas por fase de vida ou nebulização.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Chamar de "mecânico" o uso de inseticida ou de agente biológico.',
            icon: 'AlertTriangle',
          },
        ],
        'Mecânico = eliminar criadouro físico, sem produto',
      ),
      logicFlow(
        [
          'Pergunta pede o que é o método mecânico de controle de vetores.',
          'Eliminar: uso de parasitas, patógenos ou predadores naturais é controle biológico.',
          'Eliminar: inseticidas conforme fase de vida (larva/adulto) é controle químico.',
          'Eliminar: nebulização espacial de inseticida no ar também é controle químico.',
          'Sobra eliminar/destinar corretamente pneus, recicláveis e vasos → marcar A.',
          'Em similares: mecânico = agir sobre o criadouro físico; biológico = ser vivo; químico = inseticida.',
        ],
        'Portátil: mecânico age no criadouro, sem produto',
      ),
      goldenRule(
        'Decore — três métodos de controle vetorial',
        'MECÂNICO × BIOLÓGICO × QUÍMICO',
        [
          { label: 'Mecânico', value: 'Eliminar/destinar pneus, recicláveis, vasos e resíduos que acumulam água.', badge: 'ok' },
          { label: 'Biológico', value: 'Predadores, patógenos ou parasitas naturais do vetor.', badge: 'ok' },
          { label: 'Químico', value: 'Inseticida por fase de vida (larvicida/adulticida) ou nebulização espacial (UBV).', badge: 'ok' },
          { label: 'Armadilha', value: 'Trocar o método pelo nome de outro na mesma prova.', badge: 'warn' },
        ],
        'Decore: criadouro = mecânico; ser vivo = biológico; produto = químico',
      ),
      dangerZone(
        'PEGADINHAS — método de controle',
        [
          {
            label: 'Letra B — parasitas, patógenos ou predadores naturais',
            detail: 'Usa organismos vivos contra o vetor.',
            correct: 'Isso é controle biológico, não mecânico.',
          },
          {
            label: 'Letra C — inseticida por fase de vida',
            detail: 'Aplica produto químico conforme larva ou adulto.',
            correct: 'Isso é controle químico direcionado por estágio do vetor, não mecânico.',
          },
          {
            label: 'Letra D — nebulização espacial de inseticida',
            detail: 'Distribui partículas químicas no ar.',
            correct: 'Isso também é controle químico (UBV), não mecânico.',
          },
          {
            label: 'Transferência',
            detail: '"Qualquer ação contra o mosquito é controle mecânico".',
            correct: 'Em similares, mecânico é só a eliminação física do criadouro — sem produto nem ser vivo.',
          },
        ],
        'Chamar produto ou ser vivo de "mecânico" → distrator',
      ),
    ],
  },
  {
    file: 'instituto-verbena-enfermagem-atencao-basica-saude-da-familia-1778968194611-2.json',
    family: 'conceito',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Diretrizes da Atenção Domiciliar (AD) integrada à RAS incluem cuidado multiprofissional, participação ativa do usuário/família e estruturação por equidade e integralidade',
    sources: [{ ...PORTARIA_CONSOLIDACAO_5, covers: ['Atenção Domiciliar', 'diretrizes da AD', 'RAS'] }],
    slides: [
      conceptMap(
        'Diretrizes da Atenção Domiciliar (AD)',
        [
          {
            label: 'O que é AD',
            detail: 'Modalidade de assistência integrada à RAS, com ações de prevenção, tratamento, reabilitação, paliação e promoção no domicílio.',
            icon: 'HomeIcon',
          },
          {
            label: 'Cuidado multiprofissional',
            detail: 'Linhas de cuidado por práticas clínicas cuidadoras, reduzindo fragmentação da assistência.',
            icon: 'Users',
          },
          {
            label: 'Participação + estrutura',
            detail: 'Estimula participação ativa do usuário/família e se estrutura por equidade, acolhimento e integralidade na RAS.',
            icon: 'HeartHandshake',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Todas as alternativas citam diretrizes reais da AD, mas combinadas de formas diferentes.',
            icon: 'AlertTriangle',
          },
        ],
        'Todas citam diretrizes reais — o conjunto exato decide',
      ),
      logicFlow(
        [
          'Pergunta pede as diretrizes da AD conforme a Portaria de Consolidação nº 5/2017.',
          'Testar A: reúne diminuir demanda hospitalar, reduzir permanência, humanizar e desinstitucionalizar — diretrizes reais, mas não o conjunto cobrado aqui.',
          'Testar B: repete desinstitucionalizar e diminuir demanda, soma regulação e estruturação por equidade — mistura válida, mas fora do conjunto pedido.',
          'Testar C: soma participação ativa, permanência, linhas de cuidado e humanização — de novo mistura diretrizes reais noutra combinação.',
          'D reúne linhas de cuidado multiprofissional, participação ativa, estruturação por equidade/integralidade na RAS e incorporação à regulação → marcar D.',
          'Em similares: quando a prova cobra "diretrizes da AD", confira o texto de cada alternativa item a item antes de marcar.',
        ],
        'Portátil: confira o conjunto exato, não só se soa correto',
      ),
      goldenRule(
        'Decore — pilares da AD',
        'CUIDADO NO DOMICÍLIO, INTEGRADO À RAS',
        [
          { label: 'Cuidado', value: 'Linhas de cuidado multiprofissionais e interdisciplinares, sem fragmentação.', badge: 'ok' },
          { label: 'Participação', value: 'Usuário, família e cuidadores participam ativamente do plano.', badge: 'ok' },
          { label: 'Estrutura', value: 'Equidade, acolhimento, humanização e integralidade na perspectiva da RAS.', badge: 'ok' },
          { label: 'Armadilha', value: 'Misturar diretrizes reais em conjuntos que a banca não cobrou.', badge: 'warn' },
        ],
        'Decore: AD combina cuidado + participação + estrutura na RAS',
      ),
      dangerZone(
        'PEGADINHAS — qual conjunto de diretrizes',
        [
          {
            label: 'Letra A — demanda, permanência, humanização, desinstitucionalização',
            detail: 'Junta diretrizes reais, mas não o conjunto cobrado nesta prova.',
            correct: 'São diretrizes válidas da AD, porém a banca pediu o conjunto reunido na alternativa D.',
          },
          {
            label: 'Letra B — desinstitucionalização, regulação, demanda, estruturação',
            detail: 'Repete itens de outra combinação.',
            correct: 'Mistura diretrizes verdadeiras fora da sequência exata cobrada pela banca.',
          },
          {
            label: 'Letra C — participação, permanência, linhas de cuidado, humanização',
            detail: 'Quase acerta, mas troca dois itens do conjunto certo.',
            correct: 'Falta a estruturação por equidade/RAS e a incorporação à regulação, presentes só na letra D.',
          },
          {
            label: 'Transferência',
            detail: '"Se cita palavras certas da norma, a alternativa está certa".',
            correct: 'Em similares, confira o conjunto completo e exato de itens, não só palavras-chave soltas.',
          },
        ],
        'Misturar diretrizes reais fora do conjunto pedido → distrator',
      ),
    ],
  },
  {
    file: 'instituto-verbena-enfermagem-atencao-basica-saude-da-familia-1778968194611-5.json',
    family: 'conceito',
    pedagogical_branch: 'ab_esf_composicao',
    guideline_snapshot:
      'PNAB — atribuição do técnico de enfermagem na ESF: realizar ações de educação em saúde para a população adstrita conforme planejamento da equipe',
    sources: [{ ...PNAB, covers: ['atribuições do técnico de enfermagem', 'educação em saúde'] }],
    slides: [
      conceptMap(
        'Atribuição do técnico na ESF (PNAB)',
        [
          {
            label: 'Atribuição cobrada',
            detail: 'Realizar ações de educação em saúde para a população adstrita, conforme planejamento da equipe.',
            icon: 'BookOpen',
          },
          {
            label: 'Quem planeja/gerencia',
            detail: 'Planejar, gerenciar e avaliar ações dos ACS é atribuição do enfermeiro, não do técnico.',
            icon: 'ClipboardList',
          },
          {
            label: 'Quem cadastra a microárea',
            detail: 'Cadastrar toda a população da microárea é atribuição do Agente Comunitário de Saúde.',
            icon: 'MapPin',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Atribuir ao técnico tarefas de gestão de equipe ou de indicação de internação.',
            icon: 'AlertTriangle',
          },
        ],
        'Técnico educa a população, não gerencia a equipe',
      ),
      logicFlow(
        [
          'Pergunta pede a atribuição do técnico de enfermagem conforme a PNAB.',
          'Eliminar: planejar, gerenciar e avaliar ações dos ACS é atribuição do enfermeiro da equipe.',
          'Eliminar: cadastrar toda a microárea e manter atualizado é atribuição do Agente Comunitário de Saúde.',
          'Eliminar: indicar necessidade de internação de forma compartilhada é atribuição de nível superior (médico/enfermeiro).',
          'Sobra realizar ações de educação em saúde para a população adstrita → marcar C.',
          'Em similares: técnico executa cuidado e educação em saúde; planejar/gerenciar/indicar é de nível superior.',
        ],
        'Portátil: técnico executa e educa, não gerencia',
      ),
      goldenRule(
        'Decore — quem faz o quê na ESF',
        'TÉCNICO × ENFERMEIRO × ACS',
        [
          { label: 'Técnico de enfermagem', value: 'Educação em saúde e procedimentos conforme planejamento da equipe.', badge: 'ok' },
          { label: 'Enfermeiro', value: 'Planeja, gerencia e avalia as ações dos ACS e da equipe.', badge: 'warn' },
          { label: 'ACS', value: 'Cadastra e mantém atualizada a população da microárea.', badge: 'warn' },
          { label: 'Armadilha', value: 'Trocar a atribuição do técnico pela do enfermeiro ou do ACS.', badge: 'warn' },
        ],
        'Decore: cada função da ESF tem seu escopo próprio',
      ),
      dangerZone(
        'PEGADINHAS — atribuição do técnico',
        [
          {
            label: 'Letra A — planejar, gerenciar e avaliar ações dos ACS',
            detail: 'Parece rotina de equipe, mas é escopo de gestão.',
            correct: 'Essa atribuição é do enfermeiro; o técnico não gerencia as ações dos ACS.',
          },
          {
            label: 'Letra B — cadastrar toda a microárea',
            detail: 'Soa como trabalho de território.',
            correct: 'Cadastro e atualização da microárea é atribuição do Agente Comunitário de Saúde, não do técnico.',
          },
          {
            label: 'Letra D — indicar necessidade de internação',
            detail: 'Parece decisão clínica compartilhada.',
            correct: 'Indicar internação é atribuição de nível superior; o técnico executa cuidado, não decide internação.',
          },
          {
            label: 'Transferência',
            detail: '"Qualquer tarefa da equipe pode ser atribuída ao técnico de enfermagem".',
            correct: 'Em similares, confira se a tarefa é de gestão/decisão (enfermeiro) ou de território (ACS) antes de marcar o técnico.',
          },
        ],
        'Atribuir tarefa de outro cargo ao técnico → distrator',
      ),
    ],
  },
  {
    file: 'instituto-verbena-geral-epidemiologia-e-vigilancia-epidemiologica-1777103590498-0.json',
    family: 'conceito',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Prevenção de dengue/Zika/chikungunya na Atenção Primária: controle vetorial executado por ACS e agentes de controle de endemias',
    sources: [{ ...CAB_DENGUE, covers: ['controle vetorial', 'ACS', 'agentes de controle de endemias'] }],
    slides: [
      conceptMap(
        'Prevenção de arboviroses na APS',
        [
          {
            label: 'Cenário',
            detail: 'Dengue, Zika e chikungunya afetam número relevante de pessoas a cada ano.',
            icon: 'Bug',
          },
          {
            label: 'Ação principal',
            detail: 'Controle vetorial executado por ACS e agentes de controle de endemias.',
            icon: 'ShieldAlert',
          },
          {
            label: 'Não confundir',
            detail: 'Acolhimento/tratamento do doente e consolidar dados epidemiológicos são ações complementares, não a principal ação preventiva.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar controle vetorial por vacinação (não existe vacina de rotina para os três agravos citados).',
            icon: 'AlertTriangle',
          },
        ],
        'Sem vetor controlado, sem prevenção primária',
      ),
      logicFlow(
        [
          'Pergunta pede a principal ação de prevenção dessas arboviroses na Atenção Primária.',
          'Eliminar: acolhimento, diagnóstico e tratamento do paciente já doente é ação assistencial, não preventiva primária.',
          'Eliminar: educação em saúde somada a vacinação e tratamento mistura ações válidas, mas cita vacinação inexistente de rotina para esses agravos.',
          'Eliminar: consolidar informações epidemiológicas é vigilância/gestão, não a ação preventiva de campo.',
          'Sobra o controle vetorial feito por ACS e agentes de controle de endemias → marcar A.',
          'Em similares: para dengue/Zika/chikungunya, a prevenção primária sempre passa pelo controle do vetor.',
        ],
        'Portátil: arbovirose = prevenção pelo vetor',
      ),
      goldenRule(
        'Decore — prevenção de arboviroses',
        'CONTROLE VETORIAL É A BASE',
        [
          { label: 'Quem executa', value: 'Agentes comunitários de saúde e agentes de controle de endemias.', badge: 'ok' },
          { label: 'Onde atua', value: 'Eliminação de criadouros no território, ação de campo.', badge: 'ok' },
          { label: 'Armadilha', value: 'Citar vacinação como prevenção principal — não há vacina de rotina para os três agravos.', badge: 'warn' },
        ],
        'Decore: vetor controlado é a prevenção primária',
      ),
      dangerZone(
        'PEGADINHAS — qual é a ação principal',
        [
          {
            label: 'Letra B — acolhimento, diagnóstico e tratamento',
            detail: 'Cuida de quem já está doente.',
            correct: 'Isso é assistência ao caso confirmado, não a prevenção primária que evita novos casos.',
          },
          {
            label: 'Letra C — educação, vacinação, tratamento e controle de endemias',
            detail: 'Mistura ações válidas com vacinação, que não é rotina para esses agravos.',
            correct: 'Não há vacina de rotina para dengue/Zika/chikungunya na APS; a base preventiva é o controle vetorial.',
          },
          {
            label: 'Letra D — consolidar informações epidemiológicas',
            detail: 'Organiza dados para decisão, mas não age no vetor.',
            correct: 'Consolidar dados apoia a vigilância; a ação preventiva de campo é o controle vetorial.',
          },
          {
            label: 'Transferência',
            detail: '"Toda doença transmissível se previne com vacina".',
            correct: 'Em similares, cheque se existe vetor envolvido — nesse caso a prevenção primária é controlar o vetor, não vacinar.',
          },
        ],
        'Trocar controle vetorial por vacina ou assistência → cai',
      ),
    ],
  },
  {
    file: 'intec-enfermagem-atencao-basica-saude-da-familia-1778968357339-5.json',
    family: 'protocolo',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Encaminhamento para clínica especializada em obesidade: IMC elevado (>35) associado a causa endócrina exige investigação especializada',
    exam_vs_current:
      'Critérios de referência da rede podem variar por protocolo local (IMC e comorbidades); os slides seguem a alternativa apontada como gabarito nesta prova, destacando a causa endócrina como sinal de alerta que justifica encaminhamento.',
    sources: [{ ...CAB_OBESIDADE, covers: ['obesidade', 'encaminhamento especializado', 'atenção básica'] }],
    slides: [
      conceptMap(
        'Encaminhamento — obesidade na Atenção Básica',
        [
          {
            label: 'Regra geral',
            detail: 'A Atenção Básica trata a maioria dos casos de obesidade; encaminha quando há sinal de alerta ou causa secundária.',
            icon: 'Stethoscope',
          },
          {
            label: 'Sinal de encaminhamento',
            detail: 'IMC muito elevado (acima de 35) associado a problema endócrino que exige investigação especializada.',
            icon: 'AlertCircle',
          },
          {
            label: 'Permanece na AB',
            detail: 'Comorbidade controlada ou tratamento clínico longitudinal recém-iniciado seguem sendo acompanhados na equipe.',
            icon: 'Home',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que qualquer IMC alto já indica encaminhamento, mesmo sem causa secundária ou descontrole.',
            icon: 'AlertTriangle',
          },
        ],
        'Causa endócrina + IMC alto pede especialista',
      ),
      logicFlow(
        [
          'Pergunta pede a indicação correta para encaminhar a uma clínica especializada em obesidade.',
          'Eliminar: suspeita de obesidade primária com hipertensão controlada não justifica encaminhamento — segue na AB.',
          'Eliminar: diabetes controlada com tratamento clínico recém-iniciado ainda deve ser acompanhado pela equipe da AB.',
          'Eliminar: sem apneia do sono e já com seis meses de tratamento clínico longitudinal não configura o sinal de alerta pedido.',
          'Correto: IMC acima de 35 provocada por problema endócrino exige investigação especializada → marcar C.',
          'Em similares: causa secundária (endócrina) somada a IMC muito alto é o sinal que desloca o caso da AB para o especialista.',
        ],
        'Portátil: causa endócrina + IMC alto = encaminhar',
      ),
      goldenRule(
        'Decore — encaminhar ou manter na AB',
        'SINAL DE ALERTA DECIDE',
        [
          { label: 'Manter na AB', value: 'Comorbidade controlada ou tratamento clínico recém-iniciado.', badge: 'ok' },
          { label: 'Encaminhar', value: 'IMC muito elevado associado a causa endócrina (obesidade secundária).', badge: 'warn' },
          { label: 'Armadilha', value: 'Confundir "IMC alto" isolado com critério suficiente para encaminhar.', badge: 'warn' },
        ],
        'Decore: causa secundária muda a conduta',
      ),
      dangerZone(
        'PEGADINHAS — quando encaminhar',
        [
          {
            label: 'Letra A — obesidade primária com hipertensão controlada',
            detail: 'Comorbidade já está sob controle.',
            correct: 'Sem descontrole nem causa secundária, o caso segue sendo acompanhado na Atenção Básica.',
          },
          {
            label: 'Letra B — diabetes controlada, tratamento recém-iniciado',
            detail: 'Tratamento clínico ainda no início.',
            correct: 'Início de tratamento longitudinal com comorbidade controlada não é sinal de encaminhamento imediato.',
          },
          {
            label: 'Letra D — sem apneia, seis meses de tratamento clínico',
            detail: 'Faltam sinais de alerta ou causa secundária.',
            correct: 'Sem apneia e já em acompanhamento longitudinal, o quadro não indica a mesma urgência de investigação especializada.',
          },
          {
            label: 'Transferência',
            detail: '"IMC alto sempre precisa de especialista".',
            correct: 'Em similares, o encaminhamento depende de sinal de alerta ou causa secundária, não só do valor do IMC.',
          },
        ],
        'Encaminhar por IMC isolado, sem sinal de alerta → distrator',
      ),
    ],
  },
];

function applyPatch(patch: Patch) {
  const filePath = path.join(DIR, patch.file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const questao = JSON.parse(raw) as Record<string, unknown>;
  const meta = { ...(questao.meta as Record<string, unknown>) };
  meta.content_standard = 'golden-v1';
  meta.family = patch.family;
  meta.pedagogical_branch = patch.pedagogical_branch;
  meta.content_review = {
    reviewed_at: '2026-08-03',
    reviewer: 'pipeline-ab-g19',
    guideline_snapshot: patch.guideline_snapshot,
    exam_vs_current: patch.exam_vs_current ?? 'none',
  };
  meta.sources = patch.sources;
  questao.meta = meta;
  questao.reverse_study_slides = patch.slides;
  delete (questao as { study_slides?: unknown }).study_slides;
  fs.writeFileSync(filePath, `${JSON.stringify(questao, null, 2)}\n`, 'utf8');
  console.log(`[ok] ${patch.file} → ${patch.family}/${patch.pedagogical_branch}`);
}

function main() {
  if (!fs.existsSync(DIR)) {
    throw new Error(`Lote dir missing: ${DIR}`);
  }
  for (const patch of PATCHES) {
    applyPatch(patch);
  }
  console.log(`\nHandcraft g19: ${PATCHES.length} slugs escritos.`);
}

main();
