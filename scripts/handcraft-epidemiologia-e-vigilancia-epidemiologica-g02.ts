/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g02 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g02.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g02';
const DIR = path.join('data/catalog-migration', LOTE, 'questions');
const SUB = 'Epidemiologia e Vigilância Epidemiológica';
const TOPICO = 'Enfermagem';

const GUIA = {
  id: 'guia-vigilancia-saude-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Guia de Vigilância em Saúde',
  year: 2022,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/guia_vigilancia_saude_5ed_2022.pdf',
};
const LISTA = {
  id: 'lista-nacional-notificacao-compulsoria',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Lista Nacional de Notificação Compulsória (imediata x semanal)',
  year: 2020,
  url: 'https://www.gov.br/saude/pt-br/composicao/svsa/notificacao-compulsoria',
};
const LEI8080 = {
  id: 'lei-8080-1990',
  tier: 'A' as const,
  issuer: 'Presidência da República',
  title: 'Lei n. 8.080/1990 — vigilância epidemiológica',
  year: 1990,
  url: 'https://www.planalto.gov.br/ccivil_03/leis/l8080.htm',
};

type Item = { label: string; detail?: string; icon?: string; correct?: string };
type Row = { label: string; value: string; badge?: string };

const slideMeta = () => ({ topico: TOPICO, subtopico: SUB });
const conceptMap = (title: string, items: Item[], footer: string) => ({
  type: 'concept_map' as const,
  slide_title: title,
  meta: slideMeta(),
  items,
  footer_rule: footer,
});
const logicFlow = (steps: string[], footer: string) => ({
  type: 'logic_flow' as const,
  reveal_mode: 'tap' as const,
  meta: slideMeta(),
  steps,
  footer_rule: footer,
});
const goldenRule = (title: string, content: string, rows: Row[], footer: string) => ({
  type: 'golden_rule' as const,
  slide_title: title,
  subject: 'Enfermagem',
  meta: slideMeta(),
  content,
  rows,
  footer_rule: footer,
});
const dangerZone = (content: string, items: Item[], footer: string) => ({
  type: 'danger_zone' as const,
  bullet_style: 'x_icon' as const,
  meta: slideMeta(),
  content,
  items,
  footer_rule: footer,
});

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
    file: 'ameosc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563617321-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Surto comunitário de diarreia: coleta em frasco esteril, refrigeracao e envio no mesmo dia; prevencao e registro nao travam no laudo.',
    sources: [{ ...GUIA, covers: ['investigacao de surto', 'coleta de amostras', 'medidas preventivas'] }],
    slides: [
      conceptMap(
        'Surto de diarreia na comunidade — o que o TE faz',
        [
          { label: 'Cenario', detail: 'Varios casos de diarreia na mesma comunidade durante visita domiciliar.', icon: 'Home' },
          { label: 'Eixo da prova', detail: 'Medida correta de vigilancia/saude publica no manejo do surto.', icon: 'Activity' },
          { label: 'Trilho laboratorial', detail: 'Amostra esteril + cadeia de frio + envio agil sustentam a investigacao.', icon: 'FlaskConical' },
          { label: 'PEGADINHA-ANCORA', detail: 'Esperar o laboratorio para so entao notificar, registrar ou orientar agua/higiene.', icon: 'AlertTriangle' },
        ],
        'Surto: agir na coleta e na prevencao sem travar no resultado do lab',
      ),
      logicFlow(
        [
          'Comando pede a medida correta diante de cluster de diarreia no territorio.',
          'Eliminar: registrar no sistema so depois da confirmacao etiologica.',
          'Eliminar: orientar agua tratada/fervida so apos o laboratorio bater.',
          'Priorizar a cadeia da amostra: frasco esteril, refrigeracao e envio no mesmo dia.',
          'Marcar C.',
          'Em similares: no surto, coleta bem feita e prevencao imediata nao esperam o laudo.',
        ],
        'Surto comunitario → coleta imediata com cadeia de frio',
      ),
      goldenRule(
        'Cadeia da amostra no surto',
        'Decore o trilho da amostra',
        [
          { label: 'Frasco', value: 'Esteril e adequado ao material solicitado.', badge: 'ok' },
          { label: 'Tempo', value: 'Enviar no mesmo dia sempre que possivel.', badge: 'ok' },
          { label: 'Conservacao', value: 'Refrigeracao continua ate o laboratorio.', badge: 'ok' },
          { label: 'Armadilha', value: 'Congelar a acao de vigilancia ate o resultado laboratorial.', badge: 'warn' },
        ],
        'Esteril + frio + mesmo dia',
      ),
      dangerZone(
        'PEGADINHAS — surto de diarreia',
        [
          {
            label: 'Letra A — so gravidade',
            detail: 'Foca so em avisar sinais de gravidade, sem fechar a cadeia da amostra.',
            correct: 'Avisar gravidade importa, mas a banca cobrou a coleta esteril refrigerada e enviada no dia.',
          },
          {
            label: 'Letra B — espera o lab para registrar',
            detail: 'So registra apos confirmacao do agente etiologico.',
            correct: 'Registro/notificacao de surto nao fica presa ao laudo laboratorial.',
          },
          {
            label: 'Letra D — agua so pos-lab',
            detail: 'So recomenda agua tratada/fervida apos confirmacao bacteriana.',
            correct: 'Prevencao hidrica e de higiene comeca no suspeito — nao espera o agente isolado.',
          },
          {
            label: 'Transferencia',
            detail: 'Em outra prova: so notifica depois do PCR ou so orienta apos cultura.',
            correct: 'Pergunte: essa alternativa trava a vigilancia no laboratorio?',
          },
        ],
        'Travar vigilancia no laboratorio → distrator',
      ),
    ],
  },
  {
    file: 'ameosc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563617321-5.json',
    family: 'protocolo',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Notificacao compulsoria: suspeito tambem conta. Finalidade da VE: subsidiar decisao. Notificacao nao e monopolio do enfermeiro.',
    sources: [
      { ...LISTA, covers: ['notificacao compulsoria', 'caso suspeito'] },
      { ...LEI8080, covers: ['finalidade da vigilancia epidemiologica'] },
    ],
    slides: [
      conceptMap(
        'Notificacao e finalidade da vigilancia',
        [
          { label: 'Formato', detail: 'Julgar I, II e III sobre procedimentos de vigilancia epidemiologica.', icon: 'ListChecks' },
          { label: 'I — lab previo?', detail: 'Afirma que so notifica depois da confirmacao laboratorial.', icon: 'FlaskConical' },
          { label: 'II — finalidade', detail: 'VE fornece subsidio para decidir e adotar medidas de prevencao/controle.', icon: 'Target' },
          { label: 'III — so enfermeiro?', detail: 'Diz que notificar e atribuicao exclusiva do enfermeiro.', icon: 'UserX' },
          { label: 'PEGADINHA-ANCORA', detail: 'Misturar obrigacao ampla de notificar com exclusividade de categoria.', icon: 'AlertTriangle' },
        ],
        'Separe finalidade verdadeira de travas falsas (lab / categoria)',
      ),
      logicFlow(
        [
          'Formato I/II/III: marcar o conjunto verdadeiro.',
          'I falsa: a lista nacional admite notificacao de caso suspeito — nao exige lab antes.',
          'II verdadeira: a VE existe para apoiar decisao e medidas baseadas em evidencia.',
          'III falsa: a obrigacao de notificar nao e monopolio do enfermeiro.',
          'So II sobra.',
          'Marcar B.',
          'Em similares: so apos o lab e so o enfermeiro quase sempre caem.',
        ],
        'I falsa · II verdadeira · III falsa → so II',
      ),
      goldenRule(
        'Tres filtros da notificacao',
        'Decore o que e verdade sobre VE',
        [
          { label: 'Suspeito', value: 'Pode e deve entrar no fluxo — nao espera o laudo.', badge: 'ok' },
          { label: 'Finalidade', value: 'Subsidiar decisao + medidas de prevencao/controle.', badge: 'ok' },
          { label: 'Quem notifica', value: 'Obrigacao sanitaria ampla — nao e so enfermeiro.', badge: 'warn' },
        ],
        'Suspeito conta · finalidade ampla · sem monopolio',
      ),
      dangerZone(
        'PEGADINHAS — I/II/III da vigilancia',
        [
          {
            label: 'Letra A — I+II+III',
            detail: 'Aceita as tres afirmativas.',
            correct: 'I e III sao falsas: lab previo e exclusividade do enfermeiro nao batem com a norma.',
          },
          {
            label: 'Letra C — so I',
            detail: 'Mantem apenas a exigencia de confirmacao laboratorial.',
            correct: 'I e falsa; a verdadeira isolada e a II (finalidade da VE).',
          },
          {
            label: 'Letra D — I e III',
            detail: 'Combina lab previo + exclusividade do enfermeiro.',
            correct: 'As duas restricoes sao pegadinhas classicas — nenhuma e verdadeira.',
          },
          {
            label: 'Transferencia',
            detail: 'Em outra prova: so medico notifica ou so caso confirmado entra no SINAN.',
            correct: 'Teste: a frase restringe quem pode notificar ou exige lab antes do suspeito?',
          },
        ],
        'Restringir notificacao (lab/categoria) → distrator',
      ),
    ],
  },
  {
    file: 'ameosc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563804667-5.json',
    family: 'legis',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Lista nacional: Dengue (casos) — notificacao semanal; Febre Amarela, Febre Tifoide e acidente de trabalho grave/fatal — imediata (24h).',
    sources: [{ ...LISTA, covers: ['periodicidade semanal', 'dengue casos', 'notificacao imediata'] }],
    slides: [
      conceptMap(
        'Periodicidade: imediata x semanal',
        [
          { label: 'Comando', detail: 'Qual agravo entra na periodicidade semanal da lista nacional?', icon: 'Calendar' },
          { label: 'Imediata (24h)', detail: 'Exemplos tipicos: Febre Amarela, Febre Tifoide, acidente de trabalho grave/fatal.', icon: 'Zap' },
          { label: 'Semanal', detail: 'Dengue — casos (agregado semanal na lista).', icon: 'CalendarDays' },
          { label: 'PEGADINHA-ANCORA', detail: 'Colocar dengue no mesmo bolso da notificacao imediata de FA/tifoide.', icon: 'AlertTriangle' },
        ],
        'Separe o relogio: 24h versus fechamento semanal',
      ),
      logicFlow(
        [
          'Pergunta: qual opcao e de notificacao semanal?',
          'Eliminar Febre Amarela — imediata.',
          'Eliminar Febre Tifoide — imediata.',
          'Eliminar acidente de trabalho grave/fatal/em criancas — imediata.',
          'Sobram os casos de dengue na faixa semanal.',
          'Marcar C.',
          'Em similares: dengue (casos) != imediata; FA e agravos graves = 24h.',
        ],
        'Dengue casos → semanal',
      ),
      goldenRule(
        'Relogio da lista nacional',
        'Decore o bolso certo',
        [
          { label: 'Semanal', value: 'Dengue — casos.', badge: 'ok' },
          { label: 'Imediata', value: 'Febre Amarela · Febre Tifoide · acidente de trabalho grave/fatal.', badge: 'warn' },
          { label: 'Pergunta-teste', value: 'E urgencia sanitaria de 24h ou fechamento semanal?', badge: 'ok' },
        ],
        'Casos de dengue fecham na semana',
      ),
      dangerZone(
        'PEGADINHAS — periodicidade',
        [
          {
            label: 'Letra A — Febre Amarela',
            detail: 'Aponta FA como semanal.',
            correct: 'Febre Amarela e notificacao imediata (ate 24h), nao semanal.',
          },
          {
            label: 'Letra B — Febre Tifoide',
            detail: 'Aponta tifoide como semanal.',
            correct: 'Febre Tifoide tambem entra no bolso da notificacao imediata.',
          },
          {
            label: 'Letra D — acidente de trabalho grave',
            detail: 'Trata acidente grave/fatal/em criancas como semanal.',
            correct: 'Acidente de trabalho grave/fatal/em criancas e imediato.',
          },
          {
            label: 'Transferencia',
            detail: 'Em outra prova: troca casos de dengue por dengue grave ou obito por dengue.',
            correct: 'Confira o enunciado literal: casos versus formas graves/obitos mudam o relogio.',
          },
        ],
        'Colocar imediata no bolso semanal → distrator',
      ),
    ],
  },
  {
    file: 'ameosc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563853014-6.json',
    family: 'vf',
    pedagogical_branch: 'epi_cadeia_transmissao',
    guideline_snapshot:
      'Banca: V F V V — latencia (definicao da prova) V; ranking de infectividade F; infeccao inaparente V; especies patogenicas V.',
    exam_vs_current: 'Sequencia e definicoes conforme caderno da prova (Ameosc 2021).',
    sources: [{ ...GUIA, covers: ['periodos da infeccao', 'infectividade', 'infeccao inaparente'] }],
    slides: [
      conceptMap(
        'VF — latencia, infectividade e infeccao inaparente',
        [
          { label: 'Formato', detail: 'Quatro afirmativas V/F sobre conceitos da cadeia infecciosa.', icon: 'ListOrdered' },
          { label: 'Afirmacao 1', detail: 'Define periodo de latencia desde a infeccao ate o hospedeiro tornar-se infectante.', icon: 'Timer' },
          { label: 'Afirmacao 2', detail: 'Ranking de infectividade: sarampo/varicela baixa; lepra alta.', icon: 'Activity' },
          { label: 'Afirmacoes 3-4', detail: 'Infeccao inaparente sem sinais clinicos; agentes patogenicos causam doenca humana.', icon: 'Shield' },
          { label: 'PEGADINHA-ANCORA', detail: 'Aceitar ranking invertido de infectividade (sarampo baixa).', icon: 'AlertTriangle' },
        ],
        'Julgue cada afirmacao; o ranking costuma ser a falsa',
      ),
      logicFlow(
        [
          'Formato VF: montar a sequencia das quatro afirmacoes.',
          'Afirmacao 1 verdadeira na definicao cobrada pela banca (latencia).',
          'Afirmacao 2 falsa: o ranking de infectividade esta invertido/errado.',
          'Afirmacao 3 verdadeira: infeccao inaparente = agente presente sem sinais clinicos.',
          'Afirmacao 4 verdadeira: especies patogenicas causam doenca humana.',
          'Sequencia: V, F, V, V.',
          'Marcar C.',
          'Em similares: se o ranking coloca sarampo como baixa infectividade, desconfie.',
        ],
        'V F V V → C',
      ),
      goldenRule(
        'Mapa VF da cadeia',
        'O que costuma ser verdadeiro',
        [
          { label: 'Latencia (prova)', value: 'Intervalo ate o hospedeiro tornar-se infectante — na chave da banca.', badge: 'ok' },
          { label: 'Inaparente', value: 'Agente presente sem clinica manifesta.', badge: 'ok' },
          { label: 'Patogenico', value: 'Especie capaz de causar doenca humana.', badge: 'ok' },
          { label: 'Ranking', value: 'Sarampo/varicela baixa infectividade → falsa classica.', badge: 'warn' },
        ],
        'Tres V e um F no ranking',
      ),
      dangerZone(
        'PEGADINHAS — sequencia VF',
        [
          {
            label: 'Letra A — V F V F',
            detail: 'Torna falsa a ideia de especies patogenicas.',
            correct: 'A quarta afirmacao e verdadeira: patogenico = causa doenca humana.',
          },
          {
            label: 'Letra B — F V F F',
            detail: 'Inverte latencia e salva o ranking errado.',
            correct: 'Latencia (na prova) e V e o ranking e F — nao o contrario.',
          },
          {
            label: 'Letra D — F V F V',
            detail: 'Nega latencia/inaparente e valida o ranking.',
            correct: 'So o ranking e F; latencia e inaparente ficam V na chave.',
          },
          {
            label: 'Transferencia',
            detail: 'Em outra VF: troca infectividade por virulencia ou patogenicidade.',
            correct: 'Leia o termo exato antes de julgar V/F.',
          },
        ],
        'Salvar o ranking invertido → distrator',
      ),
    ],
  },
  {
    file: 'ameosc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563858390-1.json',
    family: 'vf',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Banca: V F F V — caracterizacao epidemiologica V; enfoque apenas F; causa insuficiente F; triade agente-hospedeiro-ambiente V.',
    exam_vs_current: 'Sequencia conforme caderno Ameosc 2021.',
    sources: [{ ...GUIA, covers: ['enfoque epidemiologico', 'triade epidemiologica', 'causalidade'] }],
    slides: [
      conceptMap(
        'VF — enfoque, causa e triade',
        [
          { label: 'Formato', detail: 'Quatro afirmativas V/F sobre bases da epidemiologia.', icon: 'ListOrdered' },
          { label: 'Afirmacao 1', detail: 'Caracterizar a doenca orienta o tipo de resposta de controle.', icon: 'Map' },
          { label: 'Afirmacao 2', detail: 'Enfoque apenas nao-acaso e nao-homogeneo — redacao restritiva.', icon: 'Filter' },
          { label: 'Afirmacao 3', detail: 'Chama de causa insuficiente o conjunto minimo que causa a doenca.', icon: 'GitBranch' },
          { label: 'Afirmacao 4', detail: 'Triade: agente x hospedeiro x ambiente.', icon: 'Triangle' },
          { label: 'PEGADINHA-ANCORA', detail: 'Palavras apenas e rotulos trocados de causa suficiente/insuficiente.', icon: 'AlertTriangle' },
        ],
        'Desconfie de apenas e de nome errado de causa',
      ),
      logicFlow(
        [
          'Montar V/F das quatro afirmacoes.',
          'Afirmacao 1 verdadeira: caracterizar orienta a resposta de controle.',
          'Afirmacao 2 falsa: o apenas restringe demais o enfoque epidemiologico.',
          'Afirmacao 3 falsa: o conjunto minimo causal nao se chama causa insuficiente.',
          'Afirmacao 4 verdadeira: triade agente-hospedeiro-ambiente.',
          'Sequencia: V, F, F, V.',
          'Marcar C.',
          'Em similares: apenas no enunciado VF costuma marcar a falsa.',
        ],
        'V F F V → C',
      ),
      goldenRule(
        'Ancoras do enfoque epidemiologico',
        'O que guardar',
        [
          { label: 'Caracterizar', value: 'Natureza/comportamento → tipo de resposta.', badge: 'ok' },
          { label: 'Triade', value: 'Agente + hospedeiro suscetivel + ambiente.', badge: 'ok' },
          { label: 'Cuidado', value: 'Apenas e rotulos trocados de causa → falsa.', badge: 'warn' },
        ],
        'V · cuidado com apenas · triade V',
      ),
      dangerZone(
        'PEGADINHAS — sequencia VF',
        [
          {
            label: 'Letra A — V V F F',
            detail: 'Aceita o apenas e nega a triade.',
            correct: 'Afirmacao 2 e F (apenas) e a 4 e V (triade) — nao o contrario.',
          },
          {
            label: 'Letra B — F V V F',
            detail: 'Nega a caracterizacao e salva as duas falsas do meio.',
            correct: '1 e V; 2 e 3 sao F; 4 e V.',
          },
          {
            label: 'Letra D — F F V V',
            detail: 'Inverte o bloco inicial e salva causa insuficiente.',
            correct: 'A terceira afirmacao e falsa; a sequencia correta abre com V.',
          },
          {
            label: 'Transferencia',
            detail: 'Em outra prova: causa necessaria no lugar de suficiente.',
            correct: 'Cheque o rotulo causal palavra por palavra.',
          },
        ],
        'Salvar apenas ou causa mal nomeada → distrator',
      ),
    ],
  },
  {
    file: 'avancasp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-0.json',
    family: 'calc',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Incidencia: casos novos / populacao no periodo x base. 30/600 x 1000 = 50 casos novos por 1.000 criancas/ano.',
    sources: [{ ...GUIA, covers: ['incidencia', 'casos novos', 'denominador populacional'] }],
    slides: [
      conceptMap(
        'Incidencia — casos novos na base 1.000',
        [
          { label: 'Dados', detail: '30 casos novos de anemia em 600 criancas acompanhadas por 1 ano.', icon: 'Hash' },
          { label: 'Pergunta', detail: 'Quantos casos novos por 1.000 criancas no ano?', icon: 'Calculator' },
          { label: 'Indicador', detail: 'Incidencia usa casos novos no numerador e a populacao no denominador.', icon: 'TrendingUp' },
          { label: 'PEGADINHA-ANCORA', detail: 'Devolver o 30 cru ou multiplicar a base errada.', icon: 'AlertTriangle' },
        ],
        'Incidencia = novos / populacao x base',
      ),
      logicFlow(
        [
          'Identificar incidencia: casos novos no periodo.',
          'Montar a fracao 30 / 600.',
          'Multiplicar pela base pedida (1.000).',
          '30/600 x 1000 = 50.',
          'Marcar A.',
          'Em similares: se pedir por 100 ou por 10.000, so muda a base — a fracao e a mesma.',
        ],
        '30/600 x 1000 = 50',
      ),
      goldenRule(
        'Formula da incidencia',
        'Decore o esqueleto',
        [
          { label: 'Numerador', value: 'Casos novos no periodo.', badge: 'ok' },
          { label: 'Denominador', value: 'Populacao sob risco no mesmo periodo.', badge: 'ok' },
          { label: 'Base', value: 'x 100, 1.000 ou 10.000 — conforme o enunciado.', badge: 'ok' },
          { label: 'Aqui', value: '30/600 x 1000 = 50.', badge: 'ok' },
        ],
        'Novos / populacao x base',
      ),
      dangerZone(
        'PEGADINHAS — conta da incidencia',
        [
          {
            label: 'Letra B — 120',
            detail: 'Resultado tipico de base/fracao trocada.',
            correct: 'Com 30/600 x 1000 o valor estavel e 50 — 120 indica conta invertida ou base errada.',
          },
          {
            label: 'Letra C — 30',
            detail: 'Devolve o numerador cru.',
            correct: '30 e o numero absoluto de casos; a taxa pede padronizacao por 1.000.',
          },
          {
            label: 'Letra D — 65',
            detail: 'Distrator numerico vizinho.',
            correct: 'Refaca 30/600=0,05 → x1000=50; 65 nao fecha.',
          },
          {
            label: 'Letra E — 75',
            detail: 'Outro vizinho da escala.',
            correct: '75 nao e 30/600 na base 1.000.',
          },
          {
            label: 'Transferencia',
            detail: 'Em outra prova: troca incidencia por prevalencia (estoque de casos).',
            correct: 'Novos no periodo = incidencia; total existente = prevalencia.',
          },
        ],
        'Devolver o absoluto ou errar a base → distrator',
      ),
    ],
  },
  {
    file: 'avancasp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563789263-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Na lista nacional: Sifilis; Toxoplasmose gestacional e congenita; Dengue. Asma, bronquite, otite e amigdalite nao fecham trio de notificacao compulsoria.',
    sources: [{ ...LISTA, covers: ['sifilis', 'toxoplasmose gestacional/congenita', 'dengue', 'lista nacional'] }],
    slides: [
      conceptMap(
        'Trio da lista nacional',
        [
          { label: 'Comando', detail: 'Qual conjunto traz so agravos de notificacao compulsoria?', icon: 'ClipboardList' },
          { label: 'Padrao dos distratores', detail: 'Misturam 1-2 notificaveis com doenca respiratoria comum (asma, bronquite, otite).', icon: 'Shuffle' },
          { label: 'Ancora valida', detail: 'Sifilis + toxoplasmose gestacional/congenita + dengue.', icon: 'CheckCircle2' },
          { label: 'PEGADINHA-ANCORA', detail: 'Aceitar o trio porque quase tudo parece grave.', icon: 'AlertTriangle' },
        ],
        'Exija tres notificaveis — um intruso derruba a alternativa',
      ),
      logicFlow(
        [
          'Comando: conjunto em que TODOS sao de notificacao compulsoria.',
          'Eliminar trios com asma, bronquite, otite ou amigdalite.',
          'Covid/ebola/variola podem confundir, mas o trio limpo da chave e outro.',
          'Validar: sifilis + toxoplasmose gestacional/congenita + dengue.',
          'Marcar E.',
          'Em similares: procure o intruso clinico comum no meio de doencas da lista.',
        ],
        'Trio limpo sem respiratoria comum → E',
      ),
      goldenRule(
        'Filtro do trio',
        'Como matar a questao rapido',
        [
          { label: 'Regra', value: 'Os tres nomes precisam estar na lista nacional.', badge: 'ok' },
          { label: 'Intruso tipico', value: 'Asma · bronquite · otite · amigdalite.', badge: 'warn' },
          { label: 'Gabarito desta prova', value: 'Sifilis + toxo gestacional/congenita + dengue.', badge: 'ok' },
        ],
        'Um intruso = alternativa morta',
      ),
      dangerZone(
        'PEGADINHAS — lista nacional',
        [
          {
            label: 'Letra A — Asma no trio',
            detail: 'Colera/Covid + asma.',
            correct: 'Asma nao fecha trio de notificacao compulsoria.',
          },
          {
            label: 'Letra B — Bronquite no trio',
            detail: 'Difteria/Chagas aguda + bronquite.',
            correct: 'Bronquite e o intruso que invalida o conjunto.',
          },
          {
            label: 'Letra C — Otite no trio',
            detail: 'Meningites/variola + otite media.',
            correct: 'Otite media nao sustenta notificacao compulsoria no trio.',
          },
          {
            label: 'Letra D — Amigdalite no trio',
            detail: 'Ebola/Zika + amigdalite.',
            correct: 'Amigdalite derruba o conjunto apesar de outros nomes graves.',
          },
          {
            label: 'Transferencia',
            detail: 'Em outra prova: troca asma por sinusite ou faringite.',
            correct: 'Mesma logica: doenca de vias aereas comuns != lista nacional.',
          },
        ],
        'Intruso respiratorio no trio → distrator',
      ),
    ],
  },
  {
    file: 'avancasp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563789263-7.json',
    family: 'legis',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Notificacao de casos de Dengue: periodicidade semanal (nao imediata 24/48h, nem quinzenal/mensal).',
    sources: [{ ...LISTA, covers: ['dengue casos', 'notificacao semanal'] }],
    slides: [
      conceptMap(
        'Dengue (casos) — qual o relogio?',
        [
          { label: 'Gatilho', detail: 'Reportagem com milhares de casos e obitos por dengue no municipio.', icon: 'Newspaper' },
          { label: 'Pergunta', detail: 'Com que periodicidade notificar os casos de dengue?', icon: 'Clock' },
          { label: 'Opcoes de relogio', detail: 'Imediata 24h/48h · semanal · quinzenal · mensal.', icon: 'Calendar' },
          { label: 'PEGADINHA-ANCORA', detail: 'Levar dengue (casos) para o bolso da notificacao imediata.', icon: 'AlertTriangle' },
        ],
        'Casos de dengue fecham na semana',
      ),
      logicFlow(
        [
          'Objeto: periodicidade dos casos de dengue.',
          'Eliminar imediata 24h e 48h — bolso errado para casos.',
          'Eliminar quinzenal e mensal — nao sao a faixa da lista para dengue casos.',
          'Restar a notificacao semanal.',
          'Marcar C.',
          'Em similares: casos de dengue → semanal; formas graves/obitos podem mudar o enunciado — leia o termo.',
        ],
        'Dengue casos → semanal → C',
      ),
      goldenRule(
        'Relogio da dengue (casos)',
        'Decore',
        [
          { label: 'Casos', value: 'Notificacao semanal.', badge: 'ok' },
          { label: 'Nao e', value: 'Imediata 24h/48h · quinzenal · mensal.', badge: 'warn' },
          { label: 'Pergunta-teste', value: 'O enunciado diz casos, grave ou obito?', badge: 'ok' },
        ],
        'Casos = semanal',
      ),
      dangerZone(
        'PEGADINHAS — periodicidade da dengue',
        [
          {
            label: 'Letra A — imediata 24h',
            detail: 'Trata casos como urgencia de 24h.',
            correct: 'Para casos de dengue a lista usa fechamento semanal, nao 24h.',
          },
          {
            label: 'Letra B — imediata 48h',
            detail: 'Variacao da mesma armadilha imediata.',
            correct: '48h tambem nao e a periodicidade dos casos de dengue.',
          },
          {
            label: 'Letra D — quinzenal',
            detail: 'Alonga demais o prazo.',
            correct: 'Quinzenal nao e a faixa da lista para dengue casos.',
          },
          {
            label: 'Letra E — mensal',
            detail: 'Prazo administrativo generico.',
            correct: 'Mensal nao substitui a notificacao semanal dos casos.',
          },
          {
            label: 'Transferencia',
            detail: 'Em outra prova: dengue grave ou obito por dengue.',
            correct: 'Relogio pode mudar com a forma clinica — ancore no termo do comando.',
          },
        ],
        'Empurrar casos para imediata → distrator',
      ),
    ],
  },
];

function applyPatch(patch: Patch) {
  const filePath = path.join(DIR, patch.file);
  const questao = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
  const meta = { ...(questao.meta as Record<string, unknown>) };
  meta.content_standard = 'golden-v1';
  meta.family = patch.family;
  meta.pedagogical_branch = patch.pedagogical_branch;
  meta.subtopico = SUB;
  meta.topico = TOPICO;
  meta.content_review = {
    reviewed_at: '2026-08-03',
    reviewer: 'cursor-grok-4.5-epi-g02',
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
  if (!fs.existsSync(DIR)) throw new Error(`missing ${DIR}`);
  for (const patch of PATCHES) applyPatch(patch);
  console.log(`\nHandcraft ${LOTE}: ${PATCHES.length} slugs (Cursor Grok 4.5).`);
}

main();
