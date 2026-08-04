/**
 * Handcraft golden-v1 — atencao-basica-saude-da-familia-g17 (8 slugs).
 * Run: npx tsx scripts/handcraft-atencao-basica-saude-da-familia-g17.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'atencao-basica-saude-da-familia-g17';
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

const COFEN_ATRIBUICOES = {
  id: 'cofen-atribuicoes-te',
  tier: 'A' as const,
  issuer: 'Conselho Federal de Enfermagem (Cofen)',
  title: 'Resolução Cofen — atribuições do Técnico de Enfermagem (execução sob supervisão)',
  year: 2017,
  url: 'http://www.cofen.gov.br/',
};

const ANVISA_HH = {
  id: 'anvisa-higienizacao-maos',
  tier: 'A' as const,
  issuer: 'Anvisa',
  title: 'Segurança do Paciente em Serviços de Saúde — Higienização das Mãos',
  year: 2009,
  url: 'https://www.gov.br/anvisa/pt-br',
};

const PNSP = {
  id: 'pnsp-529-2013',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Portaria GM/MS nº 529/2013 — Programa Nacional de Segurança do Paciente',
  year: 2013,
  url: 'https://bvsms.saude.gov.br/bvs/saudelegis/gm/2013/prt0529_01_04_2013.html',
};

const VIGILANCIA_MS = {
  id: 'ms-vigilancia-epidemiologica',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Guia de Vigilância em Saúde — notificação e controle de agravos',
  year: 2022,
  url: 'https://www.gov.br/saude/pt-br',
};

const POTTER_CALC = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — cálculo e diluição segura de medicamentos',
  year: 2020,
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
    file: 'igeduc-enfermagem-processo-de-enfermagem-1780010559720-0.json',
    family: 'vf',
    pedagogical_branch: 'ab_esf_composicao',
    guideline_snapshot:
      'AB e ESF são porta de entrada preferencial do SUS; técnico integra a equipe de Saúde da Família e atua também no território',
    sources: [{ ...PNAB, covers: ['porta de entrada', 'equipe de Saúde da Família', 'território'] }],
    slides: [
      conceptMap(
        'AB e ESF — porta de entrada',
        [
          {
            label: 'Afirmativas I e II',
            detail:
              'AB promove, previne e acompanha continuamente; ESF atua com foco no território e nas famílias adscritas — ambas verdadeiras.',
            icon: 'CheckCircle2',
          },
          {
            label: 'Afirmativa IV',
            detail: 'Trabalho em equipe é princípio fundamental da AB e da ESF — verdadeira.',
            icon: 'Users',
          },
          {
            label: 'Afirmativa III',
            detail: 'Diz que o técnico só atua dentro da unidade, sem território — contraria o enunciado.',
            icon: 'MapPin',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Negar a atuação do técnico no território quando o próprio enunciado descreve o contrário.',
            icon: 'AlertTriangle',
          },
        ],
        'I, II, IV verdadeiras · III falsa',
      ),
      logicFlow(
        [
          'Julgar as quatro afirmativas sobre Atenção Básica, ESF e atuação do técnico no território.',
          'I verdadeira: a Atenção Básica promove saúde, previne agravos e acompanha continuamente os usuários, conforme o enunciado.',
          'II verdadeira: a ESF atua com foco no território e no acompanhamento das famílias adscritas.',
          'III falsa: o enunciado diz que o técnico participa do desenvolvimento de ações no território — o oposto do que a afirmativa apresenta.',
          'IV verdadeira: o trabalho em equipe é citado como princípio fundamental tanto da AB quanto da ESF.',
          'Sequência V, V, F, V → marcar letra B.',
          'Em similares: quando uma afirmativa nega o que o texto-base já disse sobre o território, ela é a falsa da lista.',
        ],
        'Portátil: negar o território → afirmativa falsa',
      ),
      goldenRule(
        'Decore — AB e ESF no território',
        'PORTA DE ENTRADA + TERRITÓRIO',
        [
          { label: 'Porta de entrada', value: 'AB e ESF são a entrada preferencial no SUS.', badge: 'ok' },
          { label: 'Foco', value: 'Território e famílias adscritas, com acompanhamento contínuo.', badge: 'ok' },
          {
            label: 'Equipe',
            value: 'Técnico integra a equipe de Saúde da Família e atua também no território.',
            badge: 'ok',
          },
          { label: 'Armadilha', value: 'Dizer que o técnico só atua dentro da unidade, sem território.', badge: 'warn' },
        ],
        'Decore: técnico atua na unidade e no território',
      ),
      dangerZone(
        'PEGADINHAS — SEQUÊNCIA V/F',
        [
          {
            label: 'Letra A — F, V, V, F.',
            detail: 'Marca a I como falsa e a III como verdadeira.',
            correct: 'A afirmativa I é verdadeira (a AB promove, previne e acompanha); a III é falsa, pois o técnico participa do território.',
          },
          {
            label: 'Letra C — V, F, V, F.',
            detail: 'Marca a II como falsa e a III como verdadeira.',
            correct: 'A ESF de fato atua com foco no território (II verdadeira); a III nega essa atuação do técnico e por isso é falsa.',
          },
          {
            label: 'Letra D — F, F, V, V.',
            detail: 'Marca as duas primeiras afirmativas como falsas.',
            correct: 'I e II descrevem exatamente o que o enunciado afirma sobre AB e ESF — ambas verdadeiras, não falsas.',
          },
          {
            label: 'Transferência',
            detail: '"Toda afirmativa sobre o papel do técnico no território é verdadeira só por citar o tema."',
            correct: 'Em similares, confira se a afirmativa nega ou confirma o que o texto-base já disse sobre a atuação no território.',
          },
        ],
        'Negar o território sem checar o enunciado → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-processo-de-enfermagem-1780010559720-3.json',
    family: 'vf',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Registro e anotação de enfermagem são obrigatórios em toda assistência, claros, sem rasuras, com valor ético, legal e assistencial',
    sources: [{ ...COFEN_ETICA, covers: ['registro de enfermagem', 'anotação de enfermagem', 'segurança do paciente'] }],
    slides: [
      conceptMap(
        'Registro de enfermagem — atributos',
        [
          {
            label: 'Afirmativas I, II e IV',
            detail:
              'Anotações claras, sem rasuras; contribuem para continuidade e segurança; têm valor ético, legal e assistencial — todas verdadeiras.',
            icon: 'CheckCircle2',
          },
          {
            label: 'Afirmativa III',
            detail: 'Diz que anotar é facultativo quando não há intercorrência — contraria o dever de registro contínuo.',
            icon: 'FileX',
          },
          {
            label: 'Critério',
            detail: 'O registro de enfermagem é obrigatório em toda assistência, com ou sem intercorrência.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Transformar "registro contínuo" em "registro só quando há problema".',
            icon: 'AlertTriangle',
          },
        ],
        'I, II, IV verdadeiras · III falsa',
      ),
      logicFlow(
        [
          'Julgar as quatro afirmativas sobre registro e anotação de enfermagem.',
          'I verdadeira: anotações devem ser claras, objetivas, legíveis e sem rasuras — atributo básico do registro.',
          'II verdadeira: os registros garantem continuidade da assistência e segurança do paciente.',
          'III falsa: anotar não é facultativo — o dever de registro vale mesmo sem intercorrência.',
          'IV verdadeira: a anotação tem valor ético, legal e assistencial, conforme o Código de Ética.',
          'Sequência V, V, F, V → marcar letra B.',
          'Em similares: toda alternativa que trata o registro como "opcional quando nada aconteceu" é a falsa da lista.',
        ],
        'Portátil: registro é sempre obrigatório',
      ),
      goldenRule(
        'Decore — atributos do registro de enfermagem',
        'SEMPRE, CLARO E SEM RASURA',
        [
          { label: 'Sempre', value: 'Obrigatório em toda assistência, com ou sem intercorrência.', badge: 'ok' },
          { label: 'Como', value: 'Claro, objetivo, legível, sem rasuras.', badge: 'ok' },
          { label: 'Valor', value: 'Ético, legal e assistencial — não é burocracia opcional.', badge: 'ok' },
          { label: 'Armadilha', value: 'Tratar o registro como facultativo quando "nada aconteceu".', badge: 'warn' },
        ],
        'Decore: registrar é sempre obrigatório',
      ),
      dangerZone(
        'PEGADINHAS — SEQUÊNCIA V/F',
        [
          {
            label: 'Letra A — V, F, V, F.',
            detail: 'Marca a II como falsa e a III como verdadeira.',
            correct: 'A II também é verdadeira — o registro sustenta a segurança do paciente; a III é falsa, não verdadeira.',
          },
          {
            label: 'Letra C — F, V, V, F.',
            detail: 'Marca a I como falsa e a III como verdadeira.',
            correct: 'A I é verdadeira — clareza e ausência de rasura são exigências básicas do registro; a III continua falsa.',
          },
          {
            label: 'Letra D — F, F, V, V.',
            detail: 'Marca as duas primeiras afirmativas como falsas.',
            correct: 'I e II descrevem corretamente os atributos e a função do registro — ambas verdadeiras, não falsas.',
          },
          {
            label: 'Transferência',
            detail: '"Sem problema durante o atendimento, não precisa anotar."',
            correct: 'Em similares, o dever de registrar vale mesmo quando a assistência transcorre sem intercorrências.',
          },
        ],
        'Tratar registro como opcional → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-processo-de-enfermagem-1780010559720-4.json',
    family: 'conceito',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'Técnico de enfermagem aplica técnicas assépticas e antissépticas na Atenção Básica para reduzir/eliminar microrganismos e prevenir infecções',
    sources: [{ ...ANVISA_HH, covers: ['técnica asséptica', 'técnica antisséptica', 'higienização das mãos'] }],
    slides: [
      conceptMap(
        'Assepsia e antissepsia na AB',
        [
          {
            label: 'Cenário',
            detail: 'Técnicas assépticas e antissépticas evitam a introdução e a disseminação de microrganismos.',
            icon: 'Shield',
          },
          {
            label: 'Objetivo',
            detail: 'Reduzir ou eliminar microrganismos, prevenindo infecções durante os procedimentos.',
            icon: 'Target',
          },
          {
            label: 'Quem aplica',
            detail: 'O técnico de enfermagem realiza essas técnicas em diferentes procedimentos na Atenção Básica.',
            icon: 'UserCheck',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que o antisséptico substitui a higienização das mãos, ou que a técnica só vale em hospital.',
            icon: 'AlertTriangle',
          },
        ],
        'Reduzir ou eliminar microrganismos — sempre',
      ),
      logicFlow(
        [
          'Pergunta pede a definição correta de técnicas assépticas e antissépticas.',
          'Eliminar B: dizer que o antisséptico dispensa a higienização prévia das mãos contraria a sequência básica de biossegurança.',
          'Eliminar C: afirmar que a técnica não interfere na ocorrência de infecção nega o próprio objetivo da prática.',
          'Eliminar D: restringir a técnica a procedimentos cirúrgicos hospitalares ignora seu uso rotineiro na Atenção Básica.',
          'Correto: reduzir ou eliminar microrganismos, prevenindo infecções durante os procedimentos → marcar A.',
          'Em similares: técnica asséptica ou antisséptica sempre soma à higienização das mãos, nunca a substitui.',
        ],
        'Portátil: assepsia soma, nunca substitui HH',
      ),
      goldenRule(
        'Decore — assepsia x antissepsia',
        'REDUZIR OU ELIMINAR MICRORGANISMOS',
        [
          { label: 'Assepsia', value: 'Conjunto de medidas para impedir a entrada de microrganismos.', badge: 'ok' },
          { label: 'Antissepsia', value: 'Uso de substâncias sobre pele/mucosa para reduzir microrganismos.', badge: 'ok' },
          { label: 'Sempre soma', value: 'Higienização das mãos, técnica correta e materiais adequados juntos.', badge: 'ok' },
          { label: 'Armadilha', value: 'Achar que o antisséptico substitui a higienização das mãos.', badge: 'warn' },
        ],
        'Decore: HH + técnica + material — nunca isolado',
      ),
      dangerZone(
        'PEGADINHAS — ASSEPSIA E ANTISSEPSIA',
        [
          {
            label: 'Letra B — antisséptico dispensa HH',
            detail: 'A aplicação de antissépticos dispensa a higienização prévia das mãos antes dos procedimentos.',
            correct: 'A higienização das mãos é etapa prévia obrigatória; o antisséptico não a substitui.',
          },
          {
            label: 'Letra C — técnica não interfere',
            detail: 'O uso de técnicas assépticas não interfere na ocorrência de infecções relacionadas à assistência à saúde.',
            correct: 'A técnica asséptica reduz diretamente o risco de infecção — é o próprio objetivo da prática.',
          },
          {
            label: 'Letra D — só em cirurgia hospitalar',
            detail: 'As técnicas assépticas e antissépticas são necessárias apenas em procedimentos cirúrgicos realizados em ambiente hospitalar.',
            correct: 'A Atenção Básica também exige técnica asséptica em procedimentos de rotina, não só em cirurgia hospitalar.',
          },
          {
            label: 'Transferência',
            detail: '"Se não é cirurgia, técnica asséptica não importa."',
            correct: 'Em similares, toda punção, curativo ou administração de medicamento na AB exige técnica correta.',
          },
        ],
        'Isolar uma barreira das demais → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-processo-de-enfermagem-1780010559720-5.json',
    family: 'conceito',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'Técnico de enfermagem soma higienização das mãos, EPI adequado e manejo correto de materiais/resíduos no controle de infecção na Atenção Básica',
    sources: [{ ...ANVISA_HH, covers: ['controle de infecção', 'EPI', 'manejo de resíduos'] }],
    slides: [
      conceptMap(
        'Controle de infecção na AB',
        [
          {
            label: 'Cenário',
            detail: 'O controle de infecção previne a disseminação de microrganismos, inclusive fora do ambiente hospitalar.',
            icon: 'Shield',
          },
          {
            label: 'Conduta correta',
            detail: 'Higienização das mãos, uso adequado de EPIs e manejo correto de materiais e resíduos, sempre juntos.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'Quem aplica',
            detail: 'O técnico de enfermagem executa essas medidas em todos os procedimentos na Atenção Básica.',
            icon: 'UserCheck',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que o EPI sozinho basta, ou que a luva substitui a higienização das mãos.',
            icon: 'AlertTriangle',
          },
        ],
        'HH + EPI + manejo de resíduos — juntos',
      ),
      logicFlow(
        [
          'Pergunta pede a conduta correta de controle de infecção na Atenção Básica.',
          'Eliminar B: dizer que o EPI substitui outras medidas de prevenção contraria a lógica de barreiras combinadas.',
          'Eliminar C: afirmar que o controle de infecção só vale no hospital ignora o texto-base, que descreve a AB adotando as mesmas medidas.',
          'Eliminar D: achar que a luva dispensa a higienização das mãos contraria os momentos básicos de HH.',
          'Correto: somar higienização das mãos, EPI adequado e manejo correto de materiais e resíduos → marcar A.',
          'Em similares: controle de infecção é sempre soma de barreiras, nunca uma medida isolada substituindo as demais.',
        ],
        'Portátil: barreiras se somam, não se substituem',
      ),
      goldenRule(
        'Decore — barreiras de controle de infecção',
        'HH + EPI + MANEJO DE RESÍDUOS',
        [
          { label: 'Higienização das mãos', value: 'Antes e depois de cada contato ou procedimento.', badge: 'ok' },
          { label: 'EPI', value: 'Complementa, não substitui, a higienização das mãos.', badge: 'ok' },
          { label: 'Materiais e resíduos', value: 'Manejo correto evita disseminação de microrganismos.', badge: 'ok' },
          { label: 'Onde vale', value: 'Atenção Básica também exige as mesmas barreiras do ambiente hospitalar.', badge: 'warn' },
        ],
        'Decore: nenhuma barreira substitui as outras',
      ),
      dangerZone(
        'PEGADINHAS — CONTROLE DE INFECÇÃO',
        [
          {
            label: 'Letra B — EPI substitui outras medidas',
            detail: 'O uso de equipamentos de proteção individual substitui a necessidade de outras medidas de prevenção de infecção.',
            correct: 'O EPI é barreira complementar; não dispensa a higienização das mãos nem outras medidas.',
          },
          {
            label: 'Letra C — só vale no hospital',
            detail: 'O controle de infecção aplica-se apenas a unidades hospitalares, não sendo necessário na Atenção Básica.',
            correct: 'O próprio texto-base afirma que a Atenção Básica também adota medidas de prevenção de infecção, mesmo não sendo hospital.',
          },
          {
            label: 'Letra D — luva dispensa HH',
            detail: 'A higienização das mãos pode ser dispensada quando o profissional utiliza luvas durante o procedimento.',
            correct: 'Usar luvas não dispensa a higienização das mãos antes e depois do procedimento.',
          },
          {
            label: 'Transferência',
            detail: '"Fora do hospital, controle de infecção é menos importante."',
            correct: 'Em similares, toda unidade de saúde — inclusive a Atenção Básica — segue as mesmas barreiras básicas de prevenção.',
          },
        ],
        'Trocar soma de barreiras por medida isolada → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-processo-de-enfermagem-1780010559720-6.json',
    family: 'vf',
    pedagogical_branch: 'ab_pnab_principios',
    guideline_snapshot:
      'Educação em saúde na Atenção Primária à Saúde é dialógica e participativa, considera cultura local e admite ações individuais e coletivas do técnico',
    sources: [{ ...PNAB, covers: ['educação em saúde', 'Atenção Primária à Saúde', 'participação social'] }],
    slides: [
      conceptMap(
        'Educação em saúde na APS',
        [
          {
            label: 'Afirmativas I, II e IV',
            detail:
              'Educação em saúde previne doenças, respeita cultura local e o técnico atua individual e coletivamente — todas verdadeiras.',
            icon: 'CheckCircle2',
          },
          {
            label: 'Afirmativa III',
            detail:
              'Diz que a educação se limita a "transmitir informação" sem estimular participação — contraria a abordagem dialógica da Atenção Primária à Saúde.',
            icon: 'MessageSquareOff',
          },
          {
            label: 'Critério',
            detail: 'Educação em saúde na APS é sempre dialógica e participativa, nunca unilateral.',
            icon: 'MessagesSquare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Reduzir educação em saúde a "informar e pronto", sem espaço para escuta.',
            icon: 'AlertTriangle',
          },
        ],
        'I, II, IV verdadeiras · III falsa',
      ),
      logicFlow(
        [
          'Julgar as quatro afirmativas sobre educação em saúde na Atenção Básica.',
          'I verdadeira: a educação em saúde contribui para prevenção de doenças e promoção da qualidade de vida.',
          'II verdadeira: as ações devem considerar as características culturais e sociais da população atendida.',
          'III falsa: dizer que a educação "se limita a transmitir informação, sem estimular participação" contraria a abordagem dialógica esperada na Atenção Primária à Saúde.',
          'IV verdadeira: o técnico pode atuar em ações educativas individuais e coletivas.',
          'Sequência V, V, F, V → marcar letra D.',
          'Em similares: toda alternativa que reduz educação em saúde a "só informar", sem diálogo, é a falsa da lista.',
        ],
        'Portátil: educar é diálogo, não só informar',
      ),
      goldenRule(
        'Decore — educação em saúde na APS',
        'DIÁLOGO + CULTURA + PARTICIPAÇÃO',
        [
          { label: 'Abordagem', value: 'Dialógica e participativa, nunca só transmissão de informação.', badge: 'ok' },
          { label: 'Base', value: 'Características culturais e sociais da comunidade atendida.', badge: 'ok' },
          { label: 'Abrangência', value: 'Ações individuais e coletivas, feitas também pelo técnico de enfermagem.', badge: 'ok' },
          { label: 'Armadilha', value: 'Achar que "informar" já é suficiente, sem espaço de escuta.', badge: 'warn' },
        ],
        'Decore: educar = diálogo + cultura + participação',
      ),
      dangerZone(
        'PEGADINHAS — SEQUÊNCIA V/F',
        [
          {
            label: 'Letra A — F, V, V, F.',
            detail: 'Marca a I como falsa e a III como verdadeira.',
            correct: 'A I é verdadeira — a educação em saúde de fato previne doenças e promove qualidade de vida; a III continua falsa.',
          },
          {
            label: 'Letra B — F, F, V, V.',
            detail: 'Marca as duas primeiras afirmativas como falsas.',
            correct: 'I e II descrevem corretamente a educação em saúde na APS — ambas verdadeiras, não falsas.',
          },
          {
            label: 'Letra C — V, F, V, F.',
            detail: 'Marca a II como falsa e a III como verdadeira.',
            correct: 'A II também é verdadeira — respeitar cultura e contexto social é exigência da educação em saúde.',
          },
          {
            label: 'Transferência',
            detail: '"Educar é só passar a informação certa."',
            correct: 'Em similares, educação em saúde na Atenção Primária exige diálogo e participação, não só transmissão.',
          },
        ],
        'Trocar diálogo por transmissão unilateral → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-processo-de-enfermagem-1780010559720-7.json',
    family: 'vf',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Segurança do paciente reduz eventos adversos por identificação correta e cumprimento de protocolos, com responsabilidade de toda a equipe',
    sources: [{ ...PNSP, covers: ['segurança do paciente', 'identificação do paciente', 'protocolos assistenciais'] }],
    slides: [
      conceptMap(
        'Segurança do paciente na AB',
        [
          {
            label: 'Afirmativas I, II e IV',
            detail:
              'Reduzir eventos adversos, identificar corretamente o paciente e cumprir protocolos — todas verdadeiras.',
            icon: 'CheckCircle2',
          },
          {
            label: 'Afirmativa III',
            detail: 'Diz que a segurança do paciente é responsabilidade exclusiva do nível superior — contraria a atuação de toda a equipe.',
            icon: 'Users',
          },
          {
            label: 'Critério',
            detail: 'Segurança do paciente é responsabilidade compartilhada por toda a equipe multiprofissional.',
            icon: 'ShieldCheck',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Tirar o técnico de enfermagem da responsabilidade pela segurança do cuidado.',
            icon: 'AlertTriangle',
          },
        ],
        'I, II, IV verdadeiras · III falsa',
      ),
      logicFlow(
        [
          'Julgar as quatro afirmativas sobre segurança do paciente na Atenção Básica.',
          'I verdadeira: a segurança do paciente busca reduzir a ocorrência de eventos adversos durante a assistência.',
          'II verdadeira: a identificação correta do paciente é uma das práticas fundamentais de segurança.',
          'III falsa: segurança do paciente não é responsabilidade exclusiva do nível superior — toda a equipe participa, inclusive o técnico.',
          'IV verdadeira: o cumprimento de protocolos assistenciais contribui para a promoção da segurança do paciente.',
          'Sequência V, V, F, V → marcar letra A.',
          'Em similares: toda alternativa que isola a segurança do paciente em uma única categoria profissional tende a ser a falsa.',
        ],
        'Portátil: segurança do paciente é de toda a equipe',
      ),
      goldenRule(
        'Decore — pilares da segurança do paciente',
        'REDUZIR RISCO + IDENTIFICAR + SEGUIR PROTOCOLO',
        [
          { label: 'Objetivo', value: 'Reduzir eventos adversos e danos evitáveis durante a assistência.', badge: 'ok' },
          { label: 'Prática-chave', value: 'Identificação correta do paciente.', badge: 'ok' },
          { label: 'Base', value: 'Cumprimento de protocolos assistenciais institucionais.', badge: 'ok' },
          { label: 'Armadilha', value: 'Achar que é responsabilidade só do enfermeiro ou do médico.', badge: 'warn' },
        ],
        'Decore: toda a equipe responde pela segurança do paciente',
      ),
      dangerZone(
        'PEGADINHAS — SEQUÊNCIA V/F',
        [
          {
            label: 'Letra B — V, F, V, F.',
            detail: 'Marca a II como falsa e a III como verdadeira.',
            correct: 'A II também é verdadeira — identificar corretamente o paciente é uma das práticas fundamentais citadas no enunciado.',
          },
          {
            label: 'Letra C — F, F, V, V.',
            detail: 'Marca as duas primeiras afirmativas como falsas.',
            correct: 'I e II descrevem corretamente o objetivo e a prática de segurança do paciente — ambas verdadeiras.',
          },
          {
            label: 'Letra D — F, V, V, F.',
            detail: 'Marca a I como falsa e a III como verdadeira.',
            correct: 'A I é verdadeira — reduzir eventos adversos é o objetivo central da segurança do paciente.',
          },
          {
            label: 'Transferência',
            detail: '"Segurança do paciente é conduta só do enfermeiro."',
            correct: 'Em similares, toda a equipe — incluindo o técnico de enfermagem — participa da segurança do paciente.',
          },
        ],
        'Isolar a segurança do paciente em uma categoria → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-processo-de-enfermagem-1780010559720-8.json',
    family: 'conceito',
    pedagogical_branch: 'ab_vigilancia_ads',
    guideline_snapshot:
      'Doenças transmissíveis pedem ações de controle e vigilância no território; não transmissíveis exigem acompanhamento contínuo na Atenção Básica',
    sources: [{ ...VIGILANCIA_MS, covers: ['doenças transmissíveis', 'doenças crônicas', 'vigilância no território'] }],
    slides: [
      conceptMap(
        'Transmissíveis x não transmissíveis',
        [
          {
            label: 'Cenário',
            detail: 'A Atenção Básica enfrenta doenças transmissíveis e não transmissíveis com ações contínuas de prevenção e controle.',
            icon: 'Activity',
          },
          {
            label: 'Transmissíveis',
            detail: 'Prevenidas por ações de controle e vigilância em saúde no território.',
            icon: 'ShieldAlert',
          },
          {
            label: 'Não transmissíveis (crônicas)',
            detail: 'Exigem acompanhamento contínuo, não só um diagnóstico inicial.',
            icon: 'HeartPulse',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que uma categoria de doença dispensa cuidado continuado ou que o técnico só atua nas transmissíveis.',
            icon: 'AlertTriangle',
          },
        ],
        'Controle (transmissível) x acompanhamento contínuo (crônica)',
      ),
      logicFlow(
        [
          'Pergunta pede a alternativa correta sobre doenças transmissíveis e não transmissíveis na Atenção Básica.',
          'Eliminar A: dizer que doenças não transmissíveis não precisam de acompanhamento após o diagnóstico contraria o cuidado contínuo das crônicas.',
          'Eliminar B: restringir a atuação do técnico só ao tratamento das transmissíveis ignora seu papel nas duas frentes.',
          'Eliminar D: achar que as transmissíveis não demandam prevenção na AB, só em hospital, contraria a vigilância em saúde no território.',
          'Correto: transmissíveis são prevenidas por ações de controle; não transmissíveis pedem acompanhamento contínuo → marcar C.',
          'Em similares: transmissível pede controle e vigilância; crônica pede acompanhamento contínuo — nunca troque os dois.',
        ],
        'Portátil: controle para transmissível, acompanhamento para crônica',
      ),
      goldenRule(
        'Decore — transmissíveis x crônicas',
        'CONTROLE x ACOMPANHAMENTO CONTÍNUO',
        [
          { label: 'Transmissíveis', value: 'Foco em ações de controle e vigilância no território.', badge: 'ok' },
          { label: 'Não transmissíveis', value: 'Foco em acompanhamento contínuo, não só diagnóstico inicial.', badge: 'ok' },
          { label: 'Atuação do técnico', value: 'Participa das duas frentes, nunca só de uma.', badge: 'ok' },
          { label: 'Armadilha', value: 'Achar que uma categoria dispensa cuidado continuado na AB.', badge: 'warn' },
        ],
        'Decore: controle ≠ acompanhamento contínuo',
      ),
      dangerZone(
        'PEGADINHAS — TRANSMISSÍVEIS x CRÔNICAS',
        [
          {
            label: 'Letra A — não transmissível sem acompanhamento',
            detail: 'As doenças não transmissíveis não requerem acompanhamento pela Atenção Básica após o diagnóstico inicial.',
            correct: 'As doenças não transmissíveis exigem acompanhamento contínuo, não só um diagnóstico inicial.',
          },
          {
            label: 'Letra B — técnico só trata transmissíveis',
            detail: 'A atuação do Técnico em Enfermagem restringe-se apenas ao tratamento das doenças transmissíveis.',
            correct: 'O técnico atua tanto nas doenças transmissíveis quanto nas não transmissíveis, não só no tratamento das primeiras.',
          },
          {
            label: 'Letra D — transmissível só em hospital',
            detail: 'As doenças transmissíveis não demandam ações preventivas na Atenção Básica, pois são controladas apenas em ambiente hospitalar.',
            correct: 'A Atenção Básica também realiza ações preventivas para doenças transmissíveis, com vigilância no território, não só o hospital.',
          },
          {
            label: 'Transferência',
            detail: '"Uma vez diagnosticada, a doença crônica não precisa de mais acompanhamento."',
            correct: 'Em similares, doença não transmissível pede acompanhamento contínuo; transmissível pede controle e vigilância.',
          },
        ],
        'Trocar controle por acompanhamento (ou o contrário) → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-processo-de-enfermagem-1780010566816-0.json',
    family: 'calc',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Cálculo e diluição de medicamentos exigem seguir prescrição, concentração disponível e dose a administrar juntas, sem aproximações',
    sources: [{ ...POTTER_CALC, covers: ['cálculo de medicamentos', 'diluição', 'segurança do paciente'] }],
    slides: [
      conceptMap(
        'Cálculo e diluição segura',
        [
          {
            label: 'Cenário',
            detail: 'Cálculo e diluição de medicamentos exigem atenção e conhecimento técnico das prescrições.',
            icon: 'Calculator',
          },
          {
            label: 'Conduta correta',
            detail: 'Seguir a prescrição, a concentração disponível e a dose a ser administrada, sempre juntas.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'Risco',
            detail: 'Erro no cálculo compromete a eficácia terapêutica e a segurança do paciente.',
            icon: 'AlertOctagon',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que "aproximar" a concentração ou pular o cálculo exato não faz diferença.',
            icon: 'AlertTriangle',
          },
        ],
        'Prescrição + concentração + dose — sempre juntas',
      ),
      logicFlow(
        [
          'Pergunta pede a conduta correta no cálculo e na diluição de medicamentos.',
          'Eliminar B: dispensar o cálculo quando a concentração do frasco está "próxima" da dose prescrita ignora a exigência de precisão.',
          'Eliminar C: dizer que o volume final da diluição não influencia a administração contraria o próprio objetivo da diluição correta.',
          'Eliminar D: achar que a diluição não interfere na segurança quando o profissional é experiente ignora o risco de erro de cálculo.',
          'Correto: seguir a prescrição, a concentração disponível e a dose a ser administrada juntas → marcar A.',
          'Em similares: cálculo de medicamento nunca é "aproximação" — sempre prescrição, concentração e dose exatas.',
        ],
        'Portátil: nunca aproxime o cálculo de medicamento',
      ),
      goldenRule(
        'Decore — parâmetros do cálculo seguro',
        'PRESCRIÇÃO + CONCENTRAÇÃO + DOSE',
        [
          { label: 'Prescrição', value: 'O que foi determinado para o paciente.', badge: 'ok' },
          { label: 'Concentração disponível', value: 'O que existe no frasco ou na ampola.', badge: 'ok' },
          { label: 'Dose a administrar', value: 'Resultado do cálculo entre as duas anteriores.', badge: 'ok' },
          { label: 'Armadilha', value: '"Aproximar" valores em vez de calcular com exatidão.', badge: 'warn' },
        ],
        'Decore: sempre calcule, nunca aproxime',
      ),
      dangerZone(
        'PEGADINHAS — CÁLCULO E DILUIÇÃO',
        [
          {
            label: 'Letra B — concentração "próxima" dispensa cálculo',
            detail: 'O cálculo de medicamentos pode ser dispensado quando o frasco apresenta concentração próxima à dose prescrita.',
            correct: 'Concentração "próxima" da dose prescrita ainda exige o cálculo exato — aproximar gera erro de dose.',
          },
          {
            label: 'Letra C — volume final não influencia',
            detail: 'O volume final da diluição não influencia a administração do medicamento, desde que a dose prescrita seja mantida.',
            correct: 'O volume final da diluição interfere diretamente na dose administrada, mesmo mantendo a dose prescrita como referência.',
          },
          {
            label: 'Letra D — experiência dispensa cuidado',
            detail: 'A diluição de medicamentos não interfere na segurança do paciente quando realizada por profissional experiente.',
            correct: 'Erro de diluição compromete a segurança do paciente independentemente da experiência de quem executa.',
          },
          {
            label: 'Transferência',
            detail: '"Profissional experiente pode calcular por estimativa."',
            correct: 'Em similares, cálculo e diluição sempre seguem prescrição, concentração e dose exatas, sem estimativa.',
          },
        ],
        'Aproximar o cálculo em vez de calcular exato → distrator',
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
    reviewer: 'pipeline-ab-g17',
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
  console.log(`\nHandcraft g17: ${PATCHES.length} slugs escritos.`);
}

main();
