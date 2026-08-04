/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g01 (4 slugs restantes).
 * Os primeiros 4 slugs do lote (adm-tec-...8972-2, ...8972-3, ...8577-5, ...8577-6) já
 * foram semeados a partir de âncoras de estilo — este script NÃO os toca.
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g01.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g01';
const DIR = path.join('data/catalog-migration', LOTE, 'questions');
const SUB = 'Epidemiologia e Vigilância Epidemiológica';
const TOPICO = 'Enfermagem';

const GUIA_VIGILANCIA = {
  id: 'guia-vigilancia-saude-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Guia de Vigilância em Saúde',
  year: 2022,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/guia_vigilancia_saude_5ed_2022.pdf',
};

const LEI_8080 = {
  id: 'lei-8080-1990',
  tier: 'A' as const,
  issuer: 'Presidência da República',
  title: 'Lei nº 8.080/1990 — Lei Orgânica da Saúde (art. 6º, §2º — definição de vigilância epidemiológica)',
  year: 1990,
  url: 'https://www.planalto.gov.br/ccivil_03/leis/l8080.htm',
};

const PLANEJASUS = {
  id: 'planejasus-instrumentos',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'PlanejaSUS — Sistema de Planejamento do SUS (instrumentos: Plano de Saúde, Programação Anual, Relatório de Gestão)',
  year: 2016,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/sistema_planejamento_sus_livro_4.pdf',
};

const OPAS_PANDEMIAS = {
  id: 'opas-historico-pandemias',
  tier: 'B' as const,
  issuer: 'OPAS/OMS — referência histórica (lista didática de concursos)',
  title: 'Histórico de pandemias: Peste Bubônica, Varíola, Cólera, Gripe Espanhola, Gripe Suína (H1N1)',
  year: 2020,
  url: 'https://www.paho.org/pt',
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
    subject: 'Enfermagem',
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
  metaFixes?: Record<string, string>;
  slides: unknown[];
};

const PATCHES: Patch[] = [
  {
    file: 'amauc-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'PlanejaSUS: Plano de Saúde é o instrumento quadrienal (4 anos) — análise situacional + objetivos/diretrizes/metas; distinto da Programação Anual (1 ano) e do Relatório de Gestão (anual)',
    sources: [
      { ...PLANEJASUS, covers: ['plano de saúde quadrienal', 'programação anual de saúde', 'relatório de gestão'] },
    ],
    metaFixes: { cargo_header: 'Técnico de enfermagem', orgao: 'Pref Peritiba' },
    slides: [
      conceptMap(
        'Plano de Saúde — instrumento quadrienal do SUS',
        [
          {
            label: 'Cenário da prova',
            detail:
              'A banca cobra o prazo do Plano de Saúde: análise situacional + definição de objetivos, diretrizes e metas.',
            icon: 'ClipboardList',
          },
          {
            label: 'Instrumento certo',
            detail:
              'O Plano de Saúde é a base do planejamento do SUS, com vigência de 4 anos (mesmo ciclo do PPA).',
            icon: 'FileText',
          },
          {
            label: 'Não confundir',
            detail:
              'Programação Anual de Saúde vale 1 ano; Relatório de Gestão é anual — nenhum dos dois é o Plano de Saúde.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'A banca troca 4 anos por prazos vizinhos (2, 5, 6 ou 10 anos).',
            icon: 'AlertTriangle',
          },
        ],
        'Plano de Saúde = 4 anos (alinhado ao PPA)',
      ),
      logicFlow(
        [
          'Ler o comando: a elaboração do Plano de Saúde tem dois momentos — análise situacional e definição de objetivos/diretrizes/metas — para qual período?',
          'Fixar o conceito: o Plano de Saúde é o instrumento central do planejamento do SUS, com vigência de 4 anos.',
          'Testar A (10 anos) e E (6 anos): prazos longos demais, não correspondem a instrumento algum do SUS — eliminar.',
          'Testar B (2 anos) e D (5 anos): confundem com outro ciclo de gestão — não é o prazo do Plano de Saúde — eliminar.',
          'Restar C (4 anos): coincide com o período do PPA e o ciclo de gestão do SUS.',
          'Marcar letra C.',
          'Em similares: separe sempre Plano de Saúde (4 anos) de Programação Anual (1 ano) e Relatório de Gestão (anual).',
        ],
        'Portátil: Plano de Saúde = 4 anos',
      ),
      goldenRule(
        'Decore — instrumentos de planejamento do SUS',
        'CICLO DE PLANEJAMENTO',
        [
          {
            label: 'Plano de Saúde',
            value: '4 anos — análise situacional + objetivos, diretrizes e metas.',
            badge: 'ok',
          },
          {
            label: 'Programação Anual de Saúde',
            value: '1 ano — operacionaliza o Plano de Saúde.',
            badge: 'ok',
          },
          {
            label: 'Relatório de Gestão',
            value: 'Anual — presta contas do que foi executado.',
            badge: 'ok',
          },
          {
            label: 'Armadilha',
            value: 'Trocar o prazo do Plano de Saúde por 2, 5, 6 ou 10 anos.',
            badge: 'warn',
          },
        ],
        'Decore: 4 anos é só do Plano de Saúde',
      ),
      dangerZone(
        'PEGADINHAS — prazo do Plano de Saúde',
        [
          {
            label: 'Letra A — 10 anos',
            detail: 'Prazo longo demais para o instrumento cobrado.',
            correct: 'O Plano de Saúde vigora por 4 anos, alinhado ao ciclo de gestão do SUS.',
          },
          {
            label: 'Letra B — 2 anos',
            detail: 'Prazo curto demais, sem correspondência com o instrumento.',
            correct: 'A análise situacional e as metas do Plano de Saúde cobrem um ciclo de 4 anos, não 2.',
          },
          {
            label: 'Letra D — 5 anos',
            detail: 'Confunde com outro ciclo de gestão pública.',
            correct: 'O Plano de Saúde acompanha o PPA — 4 anos, não 5.',
          },
          {
            label: 'Letra E — 6 anos',
            detail: 'Prazo sem relação com instrumentos do SUS.',
            correct: 'Nenhum instrumento do planejamento do SUS usa ciclo de 6 anos; o Plano de Saúde é quadrienal.',
          },
          {
            label: 'Transferência',
            detail:
              'Em outra prova: troca "Plano de Saúde" por "Programação Anual" ou "Relatório de Gestão" com prazos diferentes.',
            correct:
              'Pergunte sempre: qual instrumento do SUS está sendo citado — plano (4 anos), programação (1 ano) ou relatório (anual)?',
          },
        ],
        'Se o prazo não for 4 anos, não é o Plano de Saúde',
      ),
    ],
  },
  {
    file: 'amauc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563725570-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Ações de vigilância: notificação compulsória alimenta o SINAN; vacinação em massa não é automática em todo surto; investigação começa na suspeita, sem esperar laboratório',
    sources: [
      { ...GUIA_VIGILANCIA, covers: ['notificação compulsória', 'investigação epidemiológica', 'resposta a surtos'] },
    ],
    metaFixes: { orgao: 'Pref Jaborá' },
    slides: [
      conceptMap(
        'Vigilância epidemiológica — notificação, vacinação e investigação',
        [
          {
            label: 'Cenário da prova',
            detail: 'Três afirmativas sobre ações de vigilância — a banca pede quais resistem ao teste.',
            icon: 'ListChecks',
          },
          {
            label: 'Notificação',
            detail: 'A notificação compulsória alimenta o SINAN e aciona a vigilância epidemiológica.',
            icon: 'FileWarning',
          },
          {
            label: 'Investigação',
            detail: 'A investigação epidemiológica começa na suspeita clínica — não espera o laboratório.',
            icon: 'Search',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail:
              'A banca generaliza a vacinação em massa para "todo surto" e atrasa a investigação para "só após laboratório".',
            icon: 'AlertTriangle',
          },
        ],
        'Notificar cedo, investigar cedo — sem esperar o laboratório',
      ),
      logicFlow(
        [
          'Ler o comando: julgar I, II e III sobre ações de vigilância epidemiológica e marcar a combinação correta.',
          'Testar I: a notificação compulsória alimenta o sistema de vigilância e aciona a resposta — mantém-se correta.',
          'Testar II: vacinação em massa não é indicada em "todos" os surtos — depende do agente e da vacina disponível. Eliminar II.',
          'Testar III: a investigação epidemiológica inicia diante da suspeita clínica/epidemiológica, sem esperar confirmação laboratorial. Eliminar III.',
          'Resultado: só a afirmativa I resiste ao teste.',
          'Marcar letra B.',
          'Em similares: desconfie de "todos os surtos" e "apenas após confirmação laboratorial" — são generalizações típicas de pegadinha em vigilância.',
        ],
        'Portátil: notificar sempre; investigar sem esperar laboratório',
      ),
      goldenRule(
        'Decore — ações de vigilância epidemiológica',
        'TRÊS AÇÕES-CHAVE',
        [
          {
            label: 'Notificar',
            value: 'Notificação compulsória alimenta o SINAN e aciona a vigilância.',
            badge: 'ok',
          },
          {
            label: 'Investigar',
            value: 'Início imediato diante de suspeita clínica/epidemiológica — não espera laboratório.',
            badge: 'ok',
          },
          {
            label: 'Vacinar',
            value: 'Indicada conforme avaliação de risco do agravo — não é resposta automática a todo surto.',
            badge: 'warn',
          },
          {
            label: 'Armadilha',
            value: '"Todo surto pede vacinação em massa" e "só investiga após laboratório" são generalizações falsas.',
            badge: 'warn',
          },
        ],
        'Decore: suspeita move a investigação, não o laboratório',
      ),
      dangerZone(
        'PEGADINHAS — ações de vigilância',
        [
          {
            label: 'Letra A — II, apenas',
            detail: 'Mantém só a vacinação em massa como afirmativa correta.',
            correct:
              'II generaliza a resposta vacinal para qualquer surto; I também é correta (notificação compulsória), então A erra ao excluí-la.',
          },
          {
            label: 'Letra C — III, apenas',
            detail: 'Mantém só a investigação condicionada ao laboratório.',
            correct:
              'III erra ao esperar confirmação laboratorial para investigar; quem resiste ao teste é a afirmativa I.',
          },
          {
            label: 'Letra D — I e III, apenas',
            detail: 'Mantém a afirmativa III como se fosse correta.',
            correct: 'III erra ao condicionar a investigação à confirmação laboratorial — só I resiste ao teste.',
          },
          {
            label: 'Letra E — I, II e III',
            detail: 'Tenta validar as três afirmativas de uma vez.',
            correct: 'Só a afirmativa I resiste — II e III trazem generalizações incorretas.',
          },
          {
            label: 'Transferência',
            detail:
              'Em outra prova: troca "vacinação em massa" por "isolamento em todo caso suspeito" com a mesma armadilha de generalização.',
            correct: 'Pergunte sempre: essa conduta vale para TODO caso, ou depende de avaliação de risco?',
          },
        ],
        'Generalização ("todos", "apenas após") = pegadinha típica',
      ),
    ],
  },
  {
    file: 'amauc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563848614-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Lista tradicionalmente cobrada em concursos de TE como as "5 grandes pandemias" até 2019: Varíola, Cólera, Peste Bubônica, Gripe Espanhola e Gripe Suína (H1N1)',
    exam_vs_current:
      'A OMS (fundada em 1948) não publica uma lista oficial fechada de "5 pandemias até 2019"; Peste Bubônica (século XIV) e a erradicação da Varíola antecedem/extrapolam a existência da própria OMS. A combinação é um recorte didático amplamente cobrado em concursos de enfermagem — os slides ensinam o gabarito da prova (letra A) com a ressalva histórica.',
    sources: [{ ...OPAS_PANDEMIAS, covers: ['contexto histórico', 'lista tradicionalmente cobrada em concursos de enfermagem'] }],
    slides: [
      conceptMap(
        'OMS — pandemias históricas até 2019',
        [
          {
            label: 'Conceito cobrado',
            detail: 'Pandemia é a disseminação mundial de uma doença.',
            icon: 'Globe',
          },
          {
            label: 'Lista cobrada pela banca',
            detail:
              'Até 2019, o combo tradicionalmente cobrado reúne Varíola, Cólera, Peste Bubônica, Gripe Espanhola e Gripe Suína (H1N1).',
            icon: 'ListOrdered',
          },
          {
            label: 'Ressalva histórica',
            detail:
              'Peste Bubônica e Varíola antecedem a fundação da OMS (1948) — é um recorte didático de concurso, não um comunicado oficial atual.',
            icon: 'History',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'A banca troca um nome do combo clássico por AIDS, Sarampo ou Coronavírus.',
            icon: 'AlertTriangle',
          },
        ],
        'Decore o combo clássico: Varíola, Cólera, Peste, Espanhola, Suína',
      ),
      logicFlow(
        [
          'Ler o comando: segundo a OMS, até 2019 o mundo teve cinco pandemias — identificar a lista correta.',
          'Fixar o conceito: pandemia é a disseminação mundial de uma doença; a lista cobrada em prova reúne cinco eventos históricos clássicos.',
          'Testar B: troca Peste Bubônica e Gripe Suína por AIDS e Coronavírus — quebra o combo. Eliminar.',
          'Testar C: troca Gripe Espanhola e Gripe Suína por AIDS e Sarampo — quebra o combo. Eliminar.',
          'Testar D: troca Cólera por Sarampo — quebra o combo. Eliminar.',
          'Testar E: troca Cólera e Gripe Espanhola por Coronavírus — quebra o combo. Eliminar.',
          'Restar A: Varíola, Cólera, Peste Bubônica, Gripe Espanhola, Gripe Suína (H1N1) — combo clássico cobrado.',
          'Marcar letra A.',
          'Em similares: memorize o combo fechado; qualquer troca de um nome (AIDS, Sarampo, Coronavírus) já indica distrator.',
        ],
        'Portátil: 5 nomes fixos, nenhuma troca',
      ),
      goldenRule(
        'Decore — 5 pandemias clássicas (até 2019)',
        'COMBO FECHADO',
        [
          { label: 'Varíola', value: 'Erradicada globalmente em 1980 (certificação OMS).', badge: 'ok' },
          { label: 'Peste Bubônica', value: 'Peste Negra, século XIV — evento histórico.', badge: 'ok' },
          { label: 'Cólera', value: 'Ondas pandêmicas ao longo dos séculos XIX-XX.', badge: 'ok' },
          { label: 'Gripe Espanhola', value: '1918 (H1N1).', badge: 'ok' },
          { label: 'Gripe Suína', value: '2009 (H1N1).', badge: 'ok' },
          {
            label: 'Armadilha',
            value: 'AIDS, Sarampo e Coronavírus não entram nesse combo clássico de prova.',
            badge: 'warn',
          },
        ],
        'Decore: nenhum desses 5 nomes se troca por AIDS, Sarampo ou Coronavírus',
      ),
      dangerZone(
        'PEGADINHAS — lista de pandemias',
        [
          {
            label: 'Letra B — troca por AIDS e Coronavírus',
            detail: 'Varíola, AIDS, Gripe Espanhola, Cólera, Corona Vírus.',
            correct: 'AIDS e Coronavírus não fazem parte do combo clássico — o gabarito mantém Peste Bubônica e Gripe Suína.',
          },
          {
            label: 'Letra C — troca por AIDS e Sarampo',
            detail: 'AIDS, Sarampo, Peste Bubônica, Cólera, Varíola.',
            correct: 'AIDS e Sarampo substituem Gripe Espanhola e Gripe Suína, que são os itens corretos do combo.',
          },
          {
            label: 'Letra D — troca Cólera por Sarampo',
            detail: 'Gripe Espanhola, Gripe Suína (H1N1), Peste Bubônica, Varíola, Sarampo.',
            correct: 'Sarampo substitui a Cólera, que é o quinto item correto do combo clássico.',
          },
          {
            label: 'Letra E — troca por Coronavírus',
            detail: 'Corona Vírus, Varíola, Gripe Suína (H1N1), Peste Bubônica, Cólera.',
            correct: 'Coronavírus substitui a Gripe Espanhola, que integra o combo tradicionalmente cobrado.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: a banca pode trocar qualquer um dos 5 nomes por Covid-19 ou outra doença recente.',
            correct: 'Pergunte sempre: os 5 nomes batem exatamente com Varíola, Cólera, Peste, Espanhola e Suína?',
          },
        ],
        'Qualquer nome fora do combo clássico é distrator',
      ),
    ],
  },
  {
    file: 'amauc-enfermagem-processo-de-enfermagem-1780006486032-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Vigilância epidemiológica (Lei 8.080/1990, art. 6º §2º): ações que proporcionam conhecimento, detecção ou prevenção de mudanças nos fatores de saúde',
    sources: [{ ...LEI_8080, covers: ['definição de vigilância epidemiológica', 'fatores determinantes e condicionantes'] }],
    slides: [
      conceptMap(
        'Vigilância epidemiológica — definição legal no SUS',
        [
          {
            label: 'Conceito cobrado',
            detail:
              'Vigilância epidemiológica é o conjunto de ações que geram conhecimento, detecção ou prevenção de mudanças nos fatores de saúde.',
            icon: 'BookOpen',
          },
          {
            label: 'Abrangência',
            detail: 'Cobre fatores determinantes e condicionantes de saúde individual e coletiva, não só doença já instalada.',
            icon: 'Layers',
          },
          {
            label: 'Armadilha central',
            detail:
              'A banca estreita a definição para só coletar dados, só doenças de notificação obrigatória ou só laboratório.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Toda alternativa que "restringe" a vigilância a uma única frente é distrator.',
            icon: 'AlertTriangle',
          },
        ],
        'Vigilância epidemiológica é ação ampla, não uma frente isolada',
      ),
      logicFlow(
        [
          'Ler o comando: à luz do conceito legal, qual alternativa define corretamente a vigilância epidemiológica no SUS?',
          'Fixar o conceito-base: conjunto de ações que proporcionam conhecimento, detecção ou prevenção de mudanças nos fatores determinantes e condicionantes de saúde.',
          'Testar A: reduz a vigilância a "coleta de dados sem finalidade preventiva" — contraria a essência preventiva do conceito. Eliminar.',
          'Testar C: restringe a atuação a doenças de notificação obrigatória — a vigilância vai além, cobrindo fatores determinantes e condicionantes. Eliminar.',
          'Testar D: reduz a campanhas assistenciais para doença já diagnosticada — foge do caráter preventivo. Eliminar.',
          'Testar E: restringe a laboratórios de referência — a vigilância é ação de gestão e monitoramento, não só laboratorial. Eliminar.',
          'Restar B: reproduz a definição legal — conhecimento, detecção ou prevenção de mudanças nos fatores de saúde.',
          'Marcar letra B.',
          'Em similares: quando a alternativa "restringe" a vigilância a uma única frente, é distrator — a definição legal é ampla.',
        ],
        'Portátil: restringir = distrator; conceito legal é amplo',
      ),
      goldenRule(
        'Decore — definição legal de vigilância epidemiológica',
        'CONCEITO LEGAL',
        [
          {
            label: 'Definição',
            value: 'Conjunto de ações que proporcionam conhecimento, detecção ou prevenção de mudanças nos fatores de saúde.',
            badge: 'ok',
          },
          {
            label: 'Abrangência',
            value: 'Cobre fatores determinantes e condicionantes — individuais e coletivos.',
            badge: 'ok',
          },
          {
            label: 'Não é',
            value: 'Só coleta de dados, só doenças de notificação obrigatória, só campanha assistencial ou só laboratório.',
            badge: 'warn',
          },
        ],
        'Decore: a definição legal é ampla, nunca uma frente isolada',
      ),
      dangerZone(
        'PEGADINHAS — definição de vigilância epidemiológica',
        [
          {
            label: 'Letra A — só coleta de dados',
            detail: 'Limita-se à coleta de dados estatísticos sem finalidade preventiva.',
            correct: 'A vigilância epidemiológica tem finalidade preventiva — não é coleta neutra de dados.',
          },
          {
            label: 'Letra C — só doenças de notificação obrigatória',
            detail: 'Atua exclusivamente sobre doenças de notificação obrigatória.',
            correct: 'A vigilância cobre fatores determinantes e condicionantes de saúde, além das doenças notificáveis.',
          },
          {
            label: 'Letra D — só campanha para doença já diagnosticada',
            detail: 'Consiste na execução de campanhas assistenciais voltadas apenas ao tratamento de doenças já diagnosticadas.',
            correct: 'A vigilância atua na detecção e prevenção — não se limita ao tratamento de casos já diagnosticados.',
          },
          {
            label: 'Letra E — só laboratório de referência',
            detail: 'É atividade restrita a laboratórios de referência.',
            correct: 'A vigilância é ação de gestão e monitoramento em saúde, não uma atividade exclusiva de laboratório.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: troca "só laboratório" por "só hospital" ou "só nível federal" com a mesma armadilha de restrição.',
            correct: 'Pergunte sempre: essa alternativa restringe a vigilância a uma única frente, ou reproduz o conceito amplo da lei?',
          },
        ],
        'Restringir a vigilância a uma frente única → distrator',
      ),
    ],
  },
];

function applyPatch(patch: Patch) {
  const filePath = path.join(DIR, patch.file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const questao = JSON.parse(raw) as Record<string, unknown>;
  const meta = { ...(questao.meta as Record<string, unknown>) };
  if (patch.metaFixes) {
    for (const [key, value] of Object.entries(patch.metaFixes)) {
      meta[key] = value;
    }
  }
  meta.content_standard = 'golden-v1';
  meta.family = patch.family;
  meta.pedagogical_branch = patch.pedagogical_branch;
  meta.content_review = {
    reviewed_at: '2026-08-03',
    reviewer: 'pipeline-epi-g01',
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
  console.log(`\nHandcraft ${LOTE}: ${PATCHES.length} slugs escritos.`);
}

main();
