/**
 * Handcraft golden-v1 — atencao-basica-saude-da-familia-g14 (8 slugs).
 * Run: npx tsx scripts/handcraft-atencao-basica-saude-da-familia-g14.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'atencao-basica-saude-da-familia-g14';
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

const COFEN_ETICA = {
  id: 'cofen-564-2017',
  tier: 'A' as const,
  issuer: 'Conselho Federal de Enfermagem (Cofen)',
  title: 'Resolução Cofen nº 564/2017 — Código de Ética dos Profissionais de Enfermagem',
  year: 2017,
  url: 'http://www.cofen.gov.br/resolucao-cofen-no-0564-2017_59145.html',
};

const CAB_HAS = {
  id: 'cab-37-has',
  tier: 'B' as const,
  issuer: 'Ministério da Saúde',
  title: 'Caderno de Atenção Básica nº 37 — Estratégias para o cuidado da pessoa com HAS',
  year: 2013,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/estrategias_cuidado_pessoa_hipertensao_arterial.pdf',
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
    file: 'idib-enfermagem-atencao-basica-saude-da-familia-1778934936220-5.json',
    family: 'conceito',
    pedagogical_branch: 'ab_pnab_principios',
    guideline_snapshot:
      'Longitudinalidade: vínculo contínuo entre a mesma equipe e o usuário ao longo do tempo — atributo da APS',
    sources: [{ ...PNAB, covers: ['longitudinalidade', 'atributos da APS'] }],
    slides: [
      conceptMap(
        'Longitudinalidade na APS',
        [
          {
            label: 'Atributo cobrado',
            detail: 'Vínculo contínuo e duradouro entre a mesma equipe e o usuário no tempo.',
            icon: 'Link',
          },
          {
            label: 'Por que importa',
            detail: 'Permite entender a história de saúde, não só um episódio isolado.',
            icon: 'History',
          },
          {
            label: 'Não confundir',
            detail: 'Amplitude de serviços é integralidade; articulação entre níveis é coordenação.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar "vínculo no tempo" por "abrangência de ações" ou "coordenação entre níveis".',
            icon: 'AlertTriangle',
          },
        ],
        'Mesma equipe · mesmo usuário · ao longo do tempo',
      ),
      logicFlow(
        [
          'Pergunta pede a definição correta de longitudinalidade na APS.',
          'Eliminar: falar em abrangência de ações preventivas e curativas descreve integralidade, não longitudinalidade.',
          'Eliminar: falar em integração entre níveis de atenção descreve coordenação do cuidado.',
          'Eliminar: falar em atender ampla gama de problemas também é traço de integralidade.',
          'Sobra o vínculo contínuo e duradouro entre profissional e usuário → marcar C.',
          'Em similares: troque "longitudinalidade" por "vínculo no tempo com a mesma equipe" e descarte quem fala de amplitude ou coordenação.',
        ],
        'Portátil: longitudinalidade = tempo, não amplitude',
      ),
      goldenRule(
        'Decore — atributos da APS',
        'TRÊS ATRIBUTOS QUE SE CONFUNDEM',
        [
          { label: 'Longitudinalidade', value: 'Vínculo contínuo com a mesma equipe ao longo do tempo.', badge: 'ok' },
          { label: 'Integralidade', value: 'Amplitude de ações: promoção, prevenção, cura, reabilitação.', badge: 'ok' },
          { label: 'Coordenação', value: 'Articular o usuário entre os pontos da rede de atenção.', badge: 'ok' },
          { label: 'Armadilha', value: 'Misturar os três atributos na mesma alternativa.', badge: 'warn' },
        ],
        'Decore: tempo ≠ amplitude ≠ articulação',
      ),
      dangerZone(
        'PEGADINHAS — atributos da APS',
        [
          {
            label: 'Letra A — abrangência de serviços',
            detail: 'Descreve integralidade, não o vínculo no tempo.',
            correct: 'Integralidade fala de amplitude de ações; longitudinalidade fala de duração do vínculo.',
          },
          {
            label: 'Letra B — coordenação entre níveis',
            detail: 'Fala de articulação da rede, não de continuidade da relação.',
            correct: 'Coordenação do cuidado integra pontos da rede; não é o mesmo que vínculo duradouro.',
          },
          {
            label: 'Letra D — ampla gama de problemas',
            detail: 'Também descreve amplitude, não duração.',
            correct: 'Atender muitos problemas é traço de integralidade, não de longitudinalidade.',
          },
          {
            label: 'Transferência',
            detail: '"Atributo da APS é tudo a mesma coisa".',
            correct: 'Em similares, separe sempre tempo (longitudinalidade) de amplitude (integralidade) e de rede (coordenação).',
          },
        ],
        'Amplitude ou rede no lugar de tempo → distrator',
      ),
    ],
  },
  {
    file: 'idib-enfermagem-atencao-basica-saude-da-familia-1778934936220-6.json',
    family: 'vf',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Intersetorialidade: articulação de saberes e setores para responder a problemas complexos do território',
    sources: [
      {
        id: 'ms-intersetorialidade',
        tier: 'B' as const,
        issuer: 'Ministério da Saúde',
        title: 'Intersetorialidade e determinação social da saúde',
        year: 2018,
        covers: ['intersetorialidade', 'determinantes sociais'],
      },
    ],
    slides: [
      conceptMap(
        'Intersetorialidade no cuidado',
        [
          {
            label: 'Afirmativa I',
            detail: 'Ações intersetoriais buscam melhorar condições de vida de indivíduos e comunidades.',
            icon: 'Users',
          },
          {
            label: 'Afirmativa II',
            detail: 'Espaços intersetoriais criam novas linguagens e mudanças na sociedade.',
            icon: 'MessagesSquare',
          },
          {
            label: 'Afirmativa III',
            detail: 'Gestão intersetorial dá visão integrada a problemas do território.',
            icon: 'Network',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que uma afirmativa teórica "genérica demais" precisa ser falsa.',
            icon: 'AlertTriangle',
          },
        ],
        'Saberes + setores = resposta mais ampla',
      ),
      logicFlow(
        [
          'Julgar as quatro afirmativas sobre intersetorialidade no cuidado em saúde.',
          'I verdadeira: articular saberes e setores melhora condições de vida da comunidade.',
          'II verdadeira: espaços intersetoriais geram novas linguagens e mudanças sociais.',
          'III verdadeira: gestão intersetorial une soluções para problemas do território.',
          'IV verdadeira: a complexidade social pede olhar amplo para otimizar recursos.',
          'Todas as quatro se sustentam → marcar D (V V V V).',
          'Em similares: texto teórico bem alinhado ao enunciado costuma render sequência toda verdadeira.',
        ],
        'Portátil: teoria coerente com o enunciado → tudo V',
      ),
      goldenRule(
        'Decore — intersetorialidade',
        'SABERES + SETORES + TERRITÓRIO',
        [
          { label: 'O que é', value: 'Reunir saberes e setores para olhar um problema por inteiro.', badge: 'ok' },
          { label: 'Para quê', value: 'Melhorar condições de vida e otimizar recursos escassos.', badge: 'ok' },
          { label: 'Onde aparece', value: 'Gestão territorial e ações compartilhadas entre serviços.', badge: 'ok' },
          { label: 'Armadilha', value: 'Marcar F só por a frase parecer teórica ou vaga demais.', badge: 'warn' },
        ],
        'Decore: teoria bem argumentada tende a ser V',
      ),
      dangerZone(
        'PEGADINHAS — sequência V/F',
        [
          {
            label: 'Letra A — V V F V',
            detail: 'Marca a terceira afirmativa como falsa.',
            correct: 'A gestão intersetorial também é descrita de forma coerente com o texto — ela é verdadeira.',
          },
          {
            label: 'Letra B — V F V F',
            detail: 'Descarta a segunda e a quarta afirmativas.',
            correct: 'Espaços intersetoriais e a complexidade social são descritos de forma correta nas duas.',
          },
          {
            label: 'Letra C — V V V F',
            detail: 'Só derruba a última afirmativa.',
            correct: 'A afirmativa sobre otimizar recursos com olhar amplo também está alinhada ao texto-base.',
          },
          {
            label: 'Transferência',
            detail: '"Toda questão de V/F tem alguma falsa escondida".',
            correct: 'Em similares, confira cada afirmativa contra o texto-base antes de supor que existe erro.',
          },
        ],
        'Marcar F sem confrontar o texto-base → distrator',
      ),
    ],
  },
  {
    file: 'idib-enfermagem-atencao-basica-saude-da-familia-1778968194611-3.json',
    family: 'conceito',
    pedagogical_branch: 'ab_esf_composicao',
    guideline_snapshot:
      'ESF muda o modelo hegemônico via prática comunicativa e construção coletiva de saberes, com integralidade',
    sources: [{ ...PNAB, covers: ['ESF', 'integralidade', 'equipe multiprofissional'] }],
    slides: [
      conceptMap(
        'ESF — mudança de modelo',
        [
          {
            label: 'Território',
            detail: 'Equipe multidisciplinar cuida de uma população de área específica.',
            icon: 'MapPin',
          },
          {
            label: 'Objetivo',
            detail: 'Mudar o modelo hegemônico com comunicação e saberes construídos junto à comunidade.',
            icon: 'MessagesSquare',
          },
          {
            label: 'Integralidade',
            detail: 'Cuidado vai da promoção até a reabilitação, de forma integrada.',
            icon: 'Layers',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Hierarquia verticalizada, responsabilidade só de médico/enfermeiro ou cuidado fragmentado.',
            icon: 'AlertTriangle',
          },
        ],
        'Comunicação + coletivo > hierarquia',
      ),
      logicFlow(
        [
          'Pergunta pede a abordagem correta segundo os princípios e objetivos da ESF.',
          'Eliminar: comunicação hierárquica e verticalizada reforça autoridade, contraria a proposta da ESF.',
          'Eliminar: responsabilidade exclusiva de médico e enfermeiro apaga o ACS e a equipe ampliada.',
          'Eliminar: cuidado fragmentado sem articulação entre profissionais nega a integralidade.',
          'Correto: mudar o modelo hegemônico por comunicação e construção coletiva → marcar C.',
          'Em similares: ESF sempre aposta em equipe ampliada, comunicação e integralidade — nunca hierarquia ou fragmento.',
        ],
        'Portátil: coletivo e integral vencem hierarquia',
      ),
      goldenRule(
        'Decore — ESF',
        'MUDANÇA DE MODELO',
        [
          { label: 'Como', value: 'Prática comunicativa e construção coletiva de saberes.', badge: 'ok' },
          { label: 'Para quê', value: 'Integralidade do cuidado no território adscrito.', badge: 'ok' },
          { label: 'Quem', value: 'Equipe ampliada — inclui ACS, não só médico e enfermeiro.', badge: 'ok' },
          { label: 'Armadilha', value: 'Hierarquia vertical ou atuação isolada de cada profissional.', badge: 'warn' },
        ],
        'Decore: ESF = coletivo + integralidade',
      ),
      dangerZone(
        'PEGADINHAS — ESF',
        [
          {
            label: 'Letra A — comunicação hierárquica',
            detail: 'Reforça a autoridade de especialistas sobre a equipe.',
            correct: 'A ESF trabalha comunicação horizontal e construção coletiva, não hierarquia rígida.',
          },
          {
            label: 'Letra B — só médico e enfermeiro',
            detail: 'Tira o protagonismo do ACS e de outros profissionais.',
            correct: 'A mudança de modelo depende também do papel do ACS e da equipe ampliada.',
          },
          {
            label: 'Letra D — cuidado fragmentado',
            detail: 'Cada profissional atua isolado, sem articulação.',
            correct: 'Integralidade exige articulação entre os membros da equipe, não atuação isolada.',
          },
          {
            label: 'Transferência',
            detail: '"ESF é só um posto que agenda consulta médica".',
            correct: 'Em similares, ESF organiza cuidado territorial multiprofissional da promoção à reabilitação.',
          },
        ],
        'Hierarquizar ou fragmentar → cai',
      ),
    ],
  },
  {
    file: 'idib-enfermagem-atencao-basica-saude-da-familia-1778968194611-4.json',
    family: 'conceito',
    pedagogical_branch: 'ab_pnab_principios',
    guideline_snapshot:
      'Longitudinalidade: vínculo contínuo entre a mesma equipe e o usuário ao longo do tempo — atributo da APS',
    sources: [{ ...PNAB, covers: ['longitudinalidade', 'atributos da APS'] }],
    slides: [
      conceptMap(
        'Longitudinalidade — atributo-chave',
        [
          {
            label: 'O que é',
            detail: 'Relação terapêutica que se mantém ao longo do tempo, não só numa consulta.',
            icon: 'Link',
          },
          {
            label: 'Ganho clínico',
            detail: 'A equipe acompanha a evolução e conhece a história do usuário.',
            icon: 'TrendingUp',
          },
          {
            label: 'Confusão comum',
            detail: 'Amplitude de serviços e articulação entre níveis são outros atributos.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Descrever "conjunto amplo de ações" como se fosse longitudinalidade.',
            icon: 'AlertTriangle',
          },
        ],
        'Vínculo que dura, não lista de serviços',
      ),
      logicFlow(
        [
          'Pergunta pede novamente a definição correta de longitudinalidade na APS.',
          'Eliminar: abrangência de ações preventivas e curativas é traço de integralidade.',
          'Eliminar: integração entre diferentes níveis de atenção é coordenação do cuidado.',
          'Eliminar: capacidade de atender vários problemas também fala de amplitude.',
          'Fica o vínculo contínuo entre profissional e usuário no tempo → marcar C.',
          'Em similares: repita o teste — se a frase fala de "duração da relação", é longitudinalidade.',
        ],
        'Portátil: duração da relação = longitudinalidade',
      ),
      goldenRule(
        'Decore — teste da longitudinalidade',
        'PERGUNTE: FALA DE TEMPO?',
        [
          { label: 'Sim, fala de tempo', value: 'Vínculo contínuo com a mesma equipe → longitudinalidade.', badge: 'ok' },
          { label: 'Fala de amplitude', value: 'Promoção, prevenção e cura juntas → integralidade.', badge: 'warn' },
          { label: 'Fala de rede', value: 'Encaminhar e acompanhar entre serviços → coordenação.', badge: 'warn' },
        ],
        'Decore: se não fala de tempo, não é longitudinalidade',
      ),
      dangerZone(
        'PEGADINHAS — teste do atributo',
        [
          {
            label: 'Letra A — abrangência dos serviços',
            detail: 'Fala de variedade de ações, não de duração.',
            correct: 'Isso descreve integralidade; falta o elemento de continuidade no tempo.',
          },
          {
            label: 'Letra B — coordenação entre níveis',
            detail: 'Fala de articulação na rede, não de vínculo duradouro.',
            correct: 'Coordenação do cuidado organiza a rede; não substitui o teste de continuidade no tempo.',
          },
          {
            label: 'Letra D — ampla gama de problemas',
            detail: 'De novo, fala de amplitude, não de tempo.',
            correct: 'Atender muitos problemas é integralidade; longitudinalidade exige duração do vínculo.',
          },
          {
            label: 'Transferência',
            detail: '"Todo atributo bonito da APS serve para qualquer alternativa".',
            correct: 'Em similares, aplique o teste "fala de tempo?" antes de marcar a letra.',
          },
        ],
        'Sem o teste do tempo → cai na amplitude',
      ),
    ],
  },
  {
    file: 'idib-enfermagem-nocoes-de-fisiologia-1778934957741-5.json',
    family: 'conceito',
    pedagogical_branch: 'ab_pnab_principios',
    guideline_snapshot:
      'HAS na APS: educação em saúde e pactuação de metas na consulta de enfermagem sustentam adesão e controle pressórico',
    sources: [
      { ...PNAB, covers: ['consulta de enfermagem', 'Atenção Primária à Saúde'] },
      { ...CAB_HAS, covers: ['educação em saúde', 'pactuação de metas', 'adesão ao tratamento'] },
    ],
    slides: [
      conceptMap(
        'HAS — conduta de enfermagem na APS',
        [
          {
            label: 'Cenário',
            detail: 'HAS é crônica muito prevalente entre idosos e exige acompanhamento contínuo.',
            icon: 'Activity',
          },
          {
            label: 'Conduta-alvo',
            detail: 'Atividades educativas e pactuação de metas junto ao usuário.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'Resultado esperado',
            detail: 'Melhor adesão ao tratamento e melhor controle da pressão arterial.',
            icon: 'HeartPulse',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Reduzir o cuidado a "só medir a pressão" ou tirar o protagonismo da enfermagem.',
            icon: 'AlertTriangle',
          },
        ],
        'Educar + pactuar > só medir',
      ),
      logicFlow(
        [
          'Pergunta pede a conduta correta de enfermagem na Atenção Primária à Saúde para controlar a HAS.',
          'Eliminar: restringir o cuidado à aferição da pressão nega o papel educativo da enfermagem.',
          'Eliminar: dizer que a consulta de enfermagem é pouco eficaz contraria a proposta da equipe multiprofissional.',
          'Eliminar: tornar o acompanhamento exclusivo do médico apaga a atuação da enfermagem.',
          'Correto: atividades educativas somadas à pactuação de metas de cuidado → marcar B.',
          'Em similares: HAS e outras crônicas na APS sempre valorizam educação e metas pactuadas, nunca "só medir".',
        ],
        'Portátil: educar + pactuar sustentam a adesão',
      ),
      goldenRule(
        'Decore — HAS na consulta de enfermagem',
        'EDUCAR + PACTUAR + ACOMPANHAR',
        [
          { label: 'Educar', value: 'Atividades educativas sobre a doença e o tratamento.', badge: 'ok' },
          { label: 'Pactuar', value: 'Metas de cuidado combinadas com o usuário na consulta.', badge: 'ok' },
          { label: 'Acompanhar', value: 'Retorno contínuo para sustentar adesão e controle pressórico.', badge: 'ok' },
          { label: 'Armadilha', value: 'Reduzir a consulta a só aferir a pressão arterial.', badge: 'warn' },
        ],
        'Decore: adesão nasce de educação + pactuação',
      ),
      dangerZone(
        'PEGADINHAS — conduta HAS',
        [
          {
            label: 'Letra A — só aferir a pressão',
            detail: 'Ignora a parte educativa do cuidado.',
            correct: 'O cuidado integral soma educação em saúde à aferição, não se limita a medir.',
          },
          {
            label: 'Letra C — consulta pouco eficaz',
            detail: 'Desqualifica a consulta de enfermagem.',
            correct: 'A consulta de enfermagem é ferramenta central da ESF para o controle da HAS.',
          },
          {
            label: 'Letra D — só o médico acompanha',
            detail: 'Tira a enfermagem do protagonismo do cuidado.',
            correct: 'O acompanhamento da HAS é compartilhado, com papel ativo da enfermagem.',
          },
          {
            label: 'Transferência',
            detail: '"Doença crônica se resolve só com medicamento".',
            correct: 'Em similares, adesão ao tratamento crônico depende de educação e metas pactuadas, não só de receita.',
          },
        ],
        'Tirar a enfermagem do cuidado → distrator',
      ),
    ],
  },
  {
    file: 'ieses-enfermagem-atencao-basica-saude-da-familia-1778968180610-3.json',
    family: 'conceito',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'Tarefas do técnico de enfermagem na UBS: vacinação, curativos e educação em saúde; diagnóstico é atribuição privativa',
    exam_vs_current:
      'Banca considerou a assertiva II (diagnóstico independente) parte do conjunto correto; na prática, diagnóstico é ato privativo de enfermeiro/médico (Código de Ética Cofen 564/2017) — resposta da prova mantida nos slides.',
    sources: [
      { ...COFEN_ETICA, covers: ['atribuições do técnico de enfermagem', 'ato privativo'] },
      { ...PNAB, covers: ['equipe de saúde da família', 'atribuições na UBS'] },
    ],
    slides: [
      conceptMap(
        'Tarefas do técnico na UBS',
        [
          {
            label: 'Vacinação',
            detail: 'Aplicar vacinas conforme as diretrizes do programa de imunização.',
            icon: 'Syringe',
          },
          {
            label: 'Curativos',
            detail: 'Realizar curativos e cuidados com feridas, atividade típica do técnico de enfermagem.',
            icon: 'Bandage',
          },
          {
            label: 'Educação em saúde',
            detail: 'Orientar sobre prevenção de doenças e promoção da saúde na atenção básica.',
            icon: 'BookOpen',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que o termo "diagnóstico independente" sozinho já derruba a assertiva.',
            icon: 'AlertTriangle',
          },
        ],
        'Vacina · curativo · educação — todos entram',
      ),
      logicFlow(
        [
          'Julgar as afirmativas I, II, III e IV sobre tarefas do técnico de enfermagem na UBS.',
          'I entra no conjunto: vacinar seguindo o programa de imunização é rotina do técnico.',
          'III entra no conjunto: curativos e cuidado de feridas são atividade típica do técnico.',
          'IV entra no conjunto: orientar sobre prevenção e promoção também é atribuição.',
          'II fica no conjunto pelo gabarito da banca, mesmo com a expressão "diagnóstico independente" pedindo atenção.',
          'As quatro juntas fecham o conjunto correto → marcar C.',
          'Em similares: releia o enunciado da banca — se o gabarito junta todas, não filtre uma assertiva sozinho por um termo isolado.',
        ],
        'Portátil: siga o conjunto que a banca fechou',
      ),
      goldenRule(
        'Decore — tarefas do técnico na UBS',
        'ROTINA DO TÉCNICO',
        [
          { label: 'Faz', value: 'Vacinar, fazer curativo e orientar sobre prevenção e promoção.', badge: 'ok' },
          { label: 'Atenção', value: 'Diagnóstico é ato privativo do enfermeiro/médico (Lei 7.498/86).', badge: 'warn' },
          { label: 'Nesta prova', value: 'A banca manteve as quatro assertivas no conjunto correto.', badge: 'ok' },
        ],
        'Decore: siga o gabarito da prova, mas saiba o limite legal',
      ),
      dangerZone(
        'PEGADINHAS — combinação de tarefas',
        [
          {
            label: 'Letra A — só a assertiva I',
            detail: 'Deixa de fora curativo e educação em saúde.',
            correct: 'III e IV também compõem o conjunto que a banca considerou correto.',
          },
          {
            label: 'Letra B — só II e IV',
            detail: 'Corta vacinação e curativos do conjunto.',
            correct: 'I e III também entram no gabarito da banca para essa lista de tarefas.',
          },
          {
            label: 'Letra D — I, III e IV',
            detail: 'Fica só com as três tarefas "mais típicas".',
            correct: 'O gabarito desta banca inclui as quatro assertivas, não apenas três.',
          },
          {
            label: 'Transferência',
            detail: '"Se tem termo estranho, a assertiva cai fora".',
            correct: 'Em similares, confira o gabarito completo antes de descartar uma assertiva por um termo isolado.',
          },
        ],
        'Cortar assertiva sem checar o gabarito → distrator',
      ),
    ],
  },
  {
    file: 'ieses-enfermagem-atencao-basica-saude-da-familia-1778968180610-4.json',
    family: 'conceito',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'Apoio do técnico de enfermagem na reabilitação na UBS: execução sob supervisão; gabarito da banca aponta prescrição/terapias complementares',
    exam_vs_current:
      'A resposta desta banca aponta prescrição/terapias complementares; no dia a dia, prescrição é ato do profissional habilitado e o técnico de enfermagem atua na execução sob supervisão — divergência registrada, slides seguem a resposta da prova.',
    sources: [
      { ...COFEN_ETICA, covers: ['atribuições do técnico de enfermagem', 'execução sob supervisão'] },
    ],
    slides: [
      conceptMap(
        'Técnico e reabilitação na UBS',
        [
          {
            label: 'Cenário',
            detail: 'Técnico de enfermagem apoia o processo de reabilitação na UBS.',
            icon: 'Activity',
          },
          {
            label: 'Resposta desta banca',
            detail: 'Opção ligada a prescrição de medicamentos e terapias complementares.',
            icon: 'ClipboardList',
          },
          {
            label: 'Atenção ao escopo',
            detail: 'Na prática, prescrever é ato do profissional habilitado; o técnico executa sob supervisão.',
            icon: 'ShieldAlert',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que "executar exercícios" é sempre o gabarito só por parecer mais rotineiro.',
            icon: 'AlertTriangle',
          },
        ],
        'Confira sempre o texto exato da banca',
      ),
      logicFlow(
        [
          'Pergunta pede a responsabilidade do técnico no apoio à reabilitação, segundo a banca.',
          'Eliminar: avaliar a necessidade de reabilitação é atribuição do profissional habilitado.',
          'Eliminar: montar plano de reabilitação de forma independente extrapola a função técnica.',
          'A banca aponta a opção sobre prescrição e terapias complementares como resposta desta prova.',
          'Conforme o gabarito informado → marcar D.',
          'Em similares: releia o texto exato da banca — a opção "mais rotineira" nem sempre é a marcada.',
        ],
        'Portátil: confira o gabarito, não só a rotina do dia a dia',
      ),
      goldenRule(
        'Decore — reabilitação e escopo técnico',
        'GABARITO DA PROVA × ESCOPO REAL',
        [
          { label: 'Nesta prova', value: 'Opção ligada a prescrição e terapias complementares.', badge: 'ok' },
          { label: 'Escopo real', value: 'Técnico de enfermagem executa sob supervisão na UBS.', badge: 'warn' },
          { label: 'Estratégia', value: 'Leia o enunciado exato antes de aplicar o "senso comum" da rotina.', badge: 'ok' },
        ],
        'Decore: banca manda no gabarito, escopo manda na prática',
      ),
      dangerZone(
        'PEGADINHAS — responsabilidade na reabilitação',
        [
          {
            label: 'Letra A — diagnóstico e avaliação',
            detail: 'Parece papel de apoio, mas é avaliação clínica.',
            correct: 'Avaliar a necessidade de reabilitação é atribuição do profissional habilitado, não do técnico.',
          },
          {
            label: 'Letra B — programas de exercício',
            detail: 'Soa como a rotina mais comum do apoio técnico.',
            correct: 'Apesar de parecer a mais "prática", o gabarito desta banca aponta outra opção.',
          },
          {
            label: 'Letra C — plano independente',
            detail: 'Coloca o técnico planejando sozinho a reabilitação.',
            correct: 'Montar plano de reabilitação de forma independente extrapola a atuação técnica na UBS.',
          },
          {
            label: 'Transferência',
            detail: '"A opção mais comum do dia a dia sempre é o gabarito".',
            correct: 'Em similares, confira o texto literal da banca antes de marcar pela rotina mais familiar.',
          },
        ],
        'Confiar só na rotina, sem ler a banca → distrator',
      ),
    ],
  },
  {
    file: 'ieses-enfermagem-atencao-basica-saude-da-familia-1778968180610-5.json',
    family: 'conceito',
    pedagogical_branch: 'ab_esf_composicao',
    guideline_snapshot:
      'Estratégia Saúde da Família (ESF) é o eixo estruturante da organização da atenção básica no Brasil',
    sources: [{ ...PNAB, covers: ['ESF', 'organização da atenção básica'] }],
    slides: [
      conceptMap(
        'Programa organizador da AB',
        [
          {
            label: 'Pergunta',
            detail: 'Qual programa organiza a atenção básica no Brasil.',
            icon: 'HelpCircle',
          },
          {
            label: 'Resposta-chave',
            detail: 'Estratégia Saúde da Família (ESF) reorienta o modelo assistencial no território.',
            icon: 'MapPin',
          },
          {
            label: 'Diferencia',
            detail: 'ACS é uma categoria dentro da equipe, não o programa organizador em si.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Confundir a ESF com um programa específico de vacinação ou saúde mental.',
            icon: 'AlertTriangle',
          },
        ],
        'ESF organiza; outros programas são específicos',
      ),
      logicFlow(
        [
          'Pergunta pede o programa que organiza a atenção básica no Brasil.',
          'Eliminar: o programa dos agentes comunitários é anterior e mais restrito do que a ESF.',
          'Eliminar: o programa de saúde mental atua numa rede específica, não organiza a AB inteira.',
          'Eliminar: o programa de imunização cuida de vacinação, não da organização geral da AB.',
          'Correto: a Estratégia Saúde da Família é o eixo estruturante da atenção básica → marcar B.',
          'Em similares: quando perguntarem qual programa organiza a AB, pense primeiro na ESF.',
        ],
        'Portátil: ESF organiza, o resto é específico',
      ),
      goldenRule(
        'Decore — ESF organiza a AB',
        'EIXO ESTRUTURANTE',
        [
          { label: 'ESF', value: 'Reorienta o modelo assistencial e organiza a atenção básica.', badge: 'ok' },
          { label: 'Programas específicos', value: 'Imunização e saúde mental atuam em recortes próprios.', badge: 'ok' },
          { label: 'Armadilha', value: 'Trocar o programa organizador por um programa temático.', badge: 'warn' },
        ],
        'Decore: ESF é o eixo, não um recorte temático',
      ),
      dangerZone(
        'PEGADINHAS — qual programa',
        [
          {
            label: 'Letra A — Programa dos Agentes Comunitários',
            detail: 'Foi anterior e mais restrito que a ESF.',
            correct: 'A ESF ampliou e reorganizou o modelo depois desse programa; é a resposta mais completa.',
          },
          {
            label: 'Letra C — Programa de Saúde Mental',
            detail: 'Atua numa rede temática específica.',
            correct: 'Esse programa cuida de um recorte de cuidado; não organiza a atenção básica como um todo.',
          },
          {
            label: 'Letra D — Programa Nacional de Imunização',
            detail: 'Foca em vacinação, tema pontual.',
            correct: 'Imunização é uma ação dentro da AB; quem organiza o conjunto é a ESF.',
          },
          {
            label: 'Transferência',
            detail: '"Qualquer programa de saúde organiza a atenção básica".',
            correct: 'Em similares, o programa organizador e estruturante da AB no Brasil é a Estratégia Saúde da Família.',
          },
        ],
        'Trocar organizador por recorte temático → distrator',
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
    reviewer: 'pipeline-ab-g14',
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
  console.log(`\nHandcraft g14: ${PATCHES.length} slugs escritos.`);
}

main();
