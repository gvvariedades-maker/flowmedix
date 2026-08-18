/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g08 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g08.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g08';
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
  title: 'Lista Nacional de Notificação Compulsória (Portaria GM/MS 420/2022)',
  year: 2022,
  url: 'https://www.gov.br/saude/pt-br/composicao/svsa/notificacao-compulsoria',
};
const SINAN = {
  id: 'sinan-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Sistema de Informação de Agravos de Notificação (SINAN)',
  year: 2017,
  url: 'https://www.gov.br/saude/pt-br/composicao/svsa/sinan',
};
const DNV = {
  id: 'dnv-sinasc-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Declaração de Nascido Vivo (DNV) / SINASC — registro civil',
  year: 2022,
  url: 'https://www.gov.br/saude/pt-br',
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
    file: 'fau-unicentro-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563768972-9.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Incidência = casos novos em período numa população específica. Não confundir com autóctone, pandemia, fômite ou mortalidade.',
    sources: [{ ...GUIA, covers: ['incidência', 'epidemiologia', 'indicadores'] }],
    slides: [
      conceptMap(
        'O que é incidência?',
        [
          {
            label: 'Epidemiologia',
            detail: 'Estuda o processo saúde-doença em coletividades humanas e a distribuição dos agravos.',
            icon: 'Users',
          },
          {
            label: 'Incidência',
            detail: 'Número de casos novos ocorridos em um período de tempo, em uma população específica.',
            icon: 'PlusCircle',
          },
          {
            label: 'Para que serve',
            detail: 'Indicador de suporte ao planejamento, administração e avaliação das ações.',
            icon: 'Target',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar incidência por mortalidade, pandemia, autóctone ou fômite.',
            icon: 'AlertTriangle',
          },
        ],
        'Casos novos no período = incidência',
      ),
      logicFlow(
        [
          'Contexto: epidemiologia analisa distribuição e fatores determinantes das enfermidades.',
          'Comando: alternativa que descreve incidência.',
          'Eliminar caso do mesmo local (autóctone) e séries em vários países (pandemia).',
          'Eliminar objeto inanimado (fômite) e índice de mortos (mortalidade).',
          'Manter: casos novos em certo período numa população específica.',
          'Marcar A.',
          'Em similares: incidência apoia prevenção, controle ou erradicação com indicadores.',
        ],
        'Casos novos → letra A',
      ),
      goldenRule(
        'Incidência em uma linha',
        'Decore',
        [
          { label: 'Incidência', value: 'Casos novos / período / população específica.', badge: 'ok' },
          { label: 'Uso na epi', value: 'Indicador para planejamento e avaliação das estratégias.', badge: 'ok' },
          { label: 'Armadilhas', value: 'Autóctone · pandemia · fômite · mortalidade.', badge: 'warn' },
        ],
        'Novos casos = incidência',
      ),
      dangerZone(
        'PEGADINHAS — incidência',
        [
          {
            label: 'Letra B — autóctone',
            detail: 'Caso oriundo do mesmo local da doença.',
            correct: 'Descreve caso autóctone — não o indicador de casos novos.',
          },
          {
            label: 'Letra C — pandemia',
            detail: 'Séries de epidemias em vários países ao mesmo tempo.',
            correct: 'É escala de pandemia — não a definição de incidência.',
          },
          {
            label: 'Letra D — fômite',
            detail: 'Objeto inanimado que transporta o agente.',
            correct: 'É fômite na cadeia de transmissão — não incidência.',
          },
          {
            label: 'Letra E — mortalidade',
            detail: 'Relação entre mortos e tempo.',
            correct: 'É mortalidade — conta óbitos, não casos novos da população.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “incidência = todos os doentes do momento”.',
            correct: 'Estoque de doentes = prevalência — incidência é fluxo de novos.',
          },
        ],
        'Trocar incidência por outro conceito → distrator',
      ),
    ],
  },
  {
    file: 'fau-unicentro-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563778577-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Notificação compulsória = notificação obrigatória (lista nacional / SINAN). Não é voluntária, transitória, tardia nem “pública” como sinônimo.',
    sources: [{ ...SINAN, covers: ['notificação compulsória', 'SINAN', 'lista nacional'] }],
    slides: [
      conceptMap(
        'Compulsória significa…',
        [
          {
            label: 'SINAN',
            detail: 'Alimentado pela notificação e investigação dos agravos da Lista Nacional de Doenças.',
            icon: 'Database',
          },
          {
            label: 'Uso efetivo',
            detail: 'Diagnóstico dinâmico, riscos, realidade epidemiológica de determinada área geográfica.',
            icon: 'Map',
          },
          {
            label: 'Termo',
            detail: 'Notificação compulsória = notificação obrigatória — instrumento para planejamento da saúde.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Ler compulsória como voluntária, transitória ou tardia.',
            icon: 'AlertTriangle',
          },
        ],
        'Compulsória = obrigatória',
      ),
      logicFlow(
        [
          'Contexto: SINAN, lista nacional, diagnóstico dinâmico e democratização das informações.',
          'Uso sistemático descentralizado ajuda a definir prioridades e avaliar impactos das intervenções.',
          'Comando: o que caracteriza o termo notificação compulsória.',
          'Eliminar notificação voluntária, transitória, tardia e “pública” como sinônimo frouxo.',
          'Manter: notificação obrigatória.',
          'Marcar C.',
          'Em similares: compulsório = obrigação legal sanitária aos profissionais de saúde.',
        ],
        'Obrigatória → letra C',
      ),
      goldenRule(
        'Sinônimo da prova',
        'Decore',
        [
          { label: 'Compulsória', value: 'Obrigatória (lista nacional / SINAN).', badge: 'ok' },
          { label: 'Para que', value: 'Planejamento, prioridades e impacto das intervenções.', badge: 'ok' },
          { label: 'Não é', value: 'Voluntária · transitória · tardia.', badge: 'warn' },
        ],
        'Compulsória = obrigação',
      ),
      dangerZone(
        'PEGADINHAS — compulsória',
        [
          {
            label: 'Letra A — voluntária',
            detail: 'Notificação voluntária.',
            correct: 'Compulsória é o oposto de voluntária na lista nacional.',
          },
          {
            label: 'Letra B — transitória',
            detail: 'Notificação transitória.',
            correct: 'Não descreve a obrigação permanente da compulsória.',
          },
          {
            label: 'Letra D — tardia',
            detail: 'Notificação tardia.',
            correct: 'Tardia descreve atraso — não o caráter obrigatório.',
          },
          {
            label: 'Letra E — pública',
            detail: 'Notificação pública.',
            correct: 'Termo vago; a banca quer obrigatória no SINAN.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “compulsória = só imediata”.',
            correct: 'Há imediata e semanal — ambas obrigatórias na lista.',
          },
        ],
        'Voluntária/tardia ≠ compulsória',
      ),
    ],
  },
  {
    file: 'fau-unicentro-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563778577-9.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Estabelecimento emite DNV (Declaração de Nascido Vivo); no cartório faz-se o Registro Civil de Nascimento (RCN) e a Certidão.',
    sources: [{ ...DNV, covers: ['DNV', 'registro civil', 'nascido vivo'] }],
    slides: [
      conceptMap(
        'Do hospital ao cartório',
        [
          { label: 'Documento do nascimento', detail: 'Declaração de Nascido Vivo (DNV) emitida pelo estabelecimento.', icon: 'FileText' },
          { label: 'No cartório', detail: 'Registro Civil de Nascimento (RCN) → Certidão de Nascimento.', icon: 'Stamp' },
          { label: 'Quem registra', detail: 'Pai, avô, padrinho ou amigo — gratuito na primeira certidão.', icon: 'Users' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Siglas inventadas (DOV, RNN, DH, DM…).', icon: 'AlertTriangle' },
        ],
        'DNV no serviço · RCN no cartório',
      ),
      logicFlow(
        [
          'Primeira lacuna: documento do estabelecimento de saúde = DNV.',
          'Segunda lacuna: ato no cartório = Registro Civil de Nascimento (RCN).',
          'Eliminar DOV/RNN, DH/RHN, DM/RMN, DO/RON.',
          'Marcar B.',
          'Em similares: DNV ≠ certidão; certidão sai depois do registro civil.',
        ],
        'DNV + RCN → letra B',
      ),
      goldenRule(
        'Duas palavras certas',
        'Decore',
        [
          { label: 'No serviço', value: 'Declaração de Nascido Vivo (DNV).', badge: 'ok' },
          { label: 'No cartório', value: 'Registro Civil de Nascimento (RCN).', badge: 'ok' },
        ],
        'DNV → RCN → Certidão',
      ),
      dangerZone(
        'PEGADINHAS — siglas do nascimento',
        [
          {
            label: 'Letra A — DOV/RNN',
            detail: 'Declaração de Orientação / Registro Nacional.',
            correct: 'Siglas inventadas — oficiais são DNV e RCN.',
          },
          {
            label: 'Letra C — DH/RHN',
            detail: 'Declaração Hospitalar / Registro Hospitalar.',
            correct: 'Não são os nomes legais do fluxo DNV → registro civil.',
          },
          {
            label: 'Letra D — DM/RMN',
            detail: 'Declaração da Maternidade / Registro Maternal.',
            correct: 'Rótulos inventados — responda DNV e RCN.',
          },
          {
            label: 'Letra E — DO/RON',
            detail: 'Declaração Original / Registro Original.',
            correct: 'Não corresponde ao par DNV + RCN.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: confundir DNV com DO (declaração de óbito).',
            correct: 'DNV = nascido vivo; DO = óbito — sistemas diferentes.',
          },
        ],
        'Sigla inventada → distrator',
      ),
    ],
  },
  {
    file: 'fau-unicentro-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563814158-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'VE: conjunto de ações para conhecer/detectar/prevenir mudanças em determinantes e condicionantes, recomendando prevenção e controle. Não é alimentar/nutricional/econômica.',
    sources: [{ ...GUIA, covers: ['vigilância epidemiológica', 'ACS', 'prevenção e controle'] }],
    slides: [
      conceptMap(
        'Qual vigilância o ACS usa?',
        [
          { label: 'Definição', detail: 'Conhecer, detectar ou prevenir mudanças nos determinantes/condicionantes.', icon: 'Radar' },
          { label: 'Finalidade', detail: 'Recomendar e adotar prevenção e controle de doenças/agravos.', icon: 'Shield' },
          { label: 'Nome', detail: 'Vigilância epidemiológica.', icon: 'Activity' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar vigilância alimentar/nutricional por causa do ACS.', icon: 'AlertTriangle' },
        ],
        'Detecção + prevenção/controle = VE',
      ),
      logicFlow(
        [
          'Ler a definição: determinantes/condicionantes + prevenção e controle.',
          'Eliminar vigilância alimentar, domiciliar, econômica e nutricional.',
          'Manter vigilância epidemiológica.',
          'Marcar C.',
          'Em similares: se fala em agravos/doenças e determinantes, é VE.',
        ],
        'Vigilância epidemiológica → C',
      ),
      goldenRule(
        'Definição clássica da VE',
        'Decore',
        [
          { label: 'Fazer', value: 'Conhecer · detectar · prevenir mudanças.', badge: 'ok' },
          { label: 'Para', value: 'Recomendar prevenção e controle.', badge: 'ok' },
        ],
        'VE = ver + agir no coletivo',
      ),
      dangerZone(
        'PEGADINHAS — nome da vigilância',
        [
          {
            label: 'Letra A — alimentar',
            detail: 'Vigilância alimentar.',
            correct: 'Eixo nutricional/alimentar — não a definição dada.',
          },
          {
            label: 'Letra B — domiciliar',
            detail: 'Vigilância domiciliar.',
            correct: 'Não é o conceito oficial descrito.',
          },
          {
            label: 'Letra D — econômica',
            detail: 'Vigilância econômica.',
            correct: 'Fora do campo sanitário da definição.',
          },
          {
            label: 'Letra E — nutricional',
            detail: 'Vigilância nutricional.',
            correct: 'SISVAN/nutrição — outro recorte.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: VE = só notificar no SINAN.',
            correct: 'Notificar é ferramenta; VE é o processo completo de vigilância.',
          },
        ],
        'Trocar VE por eixo nutricional → distrator',
      ),
    ],
  },
  {
    file: 'fauel-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563768972-4.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Portaria 420/2022: peçonhento, Zika congênita, EAG/óbito pós-vacina, violência sexual/suicídio são compulsórios. EXCETO gonorreia e clamídia.',
    sources: [{ ...LISTA, covers: ['Portaria 420/2022', 'lista nacional', 'IST'] }],
    slides: [
      conceptMap(
        'Lista 420/2022 — ache o EXCETO',
        [
          { label: 'Norma', detail: 'Portaria GM/MS nº 420/2022 atualiza a lista nacional.', icon: 'ScrollText' },
          { label: 'Entram', detail: 'Peçonhento, Zika congênita, EAG/óbito pós-vacina, violência sexual/suicídio.', icon: 'CheckCircle2' },
          { label: 'Fora', detail: 'Gonorreia e clamídia — EXCETO desta chave.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Achar que toda IST é compulsória nacional.', icon: 'AlertTriangle' },
        ],
        'Gonorreia/clamídia = EXCETO',
      ),
      logicFlow(
        [
          'Comando: compulsórios pela 420/2022, EXCETO.',
          'Validar peçonhento, síndrome Zika congênita, EAG/óbito pós-vacina, violência/suicídio.',
          'Isolar gonorreia e clamídia — fora da lista nacional desta prova.',
          'Marcar D.',
          'Em similares: IST comum ≠ automaticamente compulsória nacional.',
        ],
        'Gonorreia e clamídia → letra D',
      ),
      goldenRule(
        'Filtro do EXCETO',
        'Decore',
        [
          { label: 'Compulsórios (ex.)', value: 'Peçonhento · Zika congênita · EAG vacinal · violência/suicídio.', badge: 'ok' },
          { label: 'EXCETO', value: 'Gonorreia e clamídia.', badge: 'warn' },
        ],
        'Lista da portaria > “é IST”',
      ),
      dangerZone(
        'PEGADINHAS — EXCETO 420/2022',
        [
          {
            label: 'Letra A — peçonhento',
            detail: 'Acidente por animal peçonhento.',
            correct: 'Peçonhento entra na Portaria 420/2022 — não é o EXCETO.',
          },
          {
            label: 'Letra B — Zika congênita',
            detail: 'Síndrome congênita associada ao Zika.',
            correct: 'Zika congênita é compulsória na lista atualizada — mantenha.',
          },
          {
            label: 'Letra C — EAG vacinal',
            detail: 'Eventos adversos graves ou óbitos pós-vacinação.',
            correct: 'EAG/óbito pós-vacina deve ser notificado — não é o EXCETO.',
          },
          {
            label: 'Letra D — gonorreia/clamídia',
            detail: 'Gonorreia e clamídia.',
            correct: 'EXCETO: gonorreia e clamídia não fecham a lista nacional desta chave.',
          },
          {
            label: 'Letra E — violência/suicídio',
            detail: 'Violência sexual e tentativa de suicídio.',
            correct: 'Violência sexual e tentativa de suicídio são compulsórios — fora do EXCETO.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: sífilis/HIV no lugar de gonorreia.',
            correct: 'Leia o agravo exato da portaria vigente — não generalize toda IST.',
          },
        ],
        'IST comum ≠ compulsória automática',
      ),
    ],
  },
  {
    file: 'fauel-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563768972-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Surto = aumento súbito localizado relacionado (3). Endemia = presença constante na área/grupo (1). Epidemia = incidência acima do esperado (2).',
    exam_vs_current: 'Chave: x–3 / y–1 / z–2 (letra E).',
    sources: [{ ...GUIA, covers: ['surto', 'endemia', 'epidemia'] }],
    slides: [
      conceptMap(
        'Surto × endemia × epidemia',
        [
          { label: 'Surto (x)', detail: 'Aumento pouco comum, súbito, disseminação localizada (3).', icon: 'Zap' },
          { label: 'Endemia (y)', detail: 'Presença constante em área ou grupo determinado (1).', icon: 'MapPin' },
          { label: 'Epidemia (z)', detail: 'Incidência maior que a esperada em área e período (2).', icon: 'TrendingUp' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Trocar surto por epidemia (escala/localização).', icon: 'AlertTriangle' },
        ],
        'x=3 · y=1 · z=2',
      ),
      logicFlow(
        [
          'x Surto → 3 (súbito, localizado, relacionados).',
          'y Endemia → 1 (presença constante na área/grupo).',
          'z Epidemia → 2 (incidência acima do esperado).',
          'Associação: x–3 / y–1 / z–2.',
          'Marcar E.',
          'Em similares: constante = endemia; excesso = epidemia; foco súbito = surto.',
        ],
        'x3 y1 z2 → letra E',
      ),
      goldenRule(
        'Gabarito das colunas',
        'Decore',
        [
          { label: 'Surto', value: '3 — súbito e localizado.', badge: 'ok' },
          { label: 'Endemia', value: '1 — presença constante.', badge: 'ok' },
          { label: 'Epidemia', value: '2 — acima do esperado.', badge: 'ok' },
        ],
        'Surto local · endemia contínua · epidemia excesso',
      ),
      dangerZone(
        'PEGADINHAS — associação',
        [
          {
            label: 'Letra A — x1 y2 z3',
            detail: 'Surto=constante; endemia=excesso; epidemia=súbito.',
            correct: 'Inverte os três conceitos.',
          },
          {
            label: 'Letra B — x1 y3 z2',
            detail: 'Surto como presença constante.',
            correct: 'Constante é endemia — não surto.',
          },
          {
            label: 'Letra C — x2 y1 z3',
            detail: 'Surto=excesso; epidemia=súbito local.',
            correct: 'Troca surto e epidemia.',
          },
          {
            label: 'Letra D — x3 y2 z1',
            detail: 'Endemia=excesso; epidemia=constante.',
            correct: 'Inverte endemia e epidemia.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “surto = epidemia pequena”.',
            correct: 'Útil como intuíção, mas a prova cobra a definição de cada coluna.',
          },
        ],
        'Inverter constante e excesso → distrator',
      ),
    ],
  },
  {
    file: 'fcm-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563848614-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Trio só com compulsórios: coqueluche, dengue, difteria. Intrusos: criptococose e amebíase (rubéola é compulsória, mas o trio com intruso cai).',
    sources: [{ ...LISTA, covers: ['coqueluche', 'dengue', 'difteria', 'lista nacional'] }],
    slides: [
      conceptMap(
        'Trio só com compulsórios',
        [
          { label: 'Comando', detail: 'Sequência com apenas doenças de notificação compulsória.', icon: 'ClipboardCheck' },
          { label: 'Trio limpo', detail: 'Coqueluche / dengue / difteria.', icon: 'CheckCircle2' },
          { label: 'Intrusos', detail: 'Criptococose e amebíase derrubam o conjunto.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Aceitar trio com um compulsório famoso + um intruso.', icon: 'AlertTriangle' },
        ],
        'Os três precisam estar na lista',
      ),
      logicFlow(
        [
          'Exigir que TODOS os nomes sejam de notificação compulsória.',
          'Eliminar sequências com criptococose ou amebíase.',
          'Validar coqueluche + dengue + difteria.',
          'Marcar A.',
          'Em similares: um intruso clínico/micose derruba o trio.',
        ],
        'Coqueluche + dengue + difteria → A',
      ),
      goldenRule(
        'Filtro do trio',
        'Decore',
        [
          { label: 'OK', value: 'Coqueluche · dengue · difteria.', badge: 'ok' },
          { label: 'Intruso típico', value: 'Criptococose · amebíase.', badge: 'warn' },
        ],
        'Um intruso = sequência morta',
      ),
      dangerZone(
        'PEGADINHAS — trio compulsório',
        [
          {
            label: 'Letra B — criptococose',
            detail: 'Difteria / dengue / criptococose.',
            correct: 'Criptococose derruba o conjunto.',
          },
          {
            label: 'Letra C — amebíase',
            detail: 'Amebíase / rubéola / coqueluche.',
            correct: 'Amebíase é o intruso — mesmo com rubéola/coqueluche.',
          },
          {
            label: 'Letra D — dois intrusos',
            detail: 'Criptococose / amebíase / rubéola.',
            correct: 'Dois nomes fora do trio limpo desta chave.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: candidíase no meio de dengue e TB.',
            correct: 'Mesma lógica: procure o nome fora da lista.',
          },
        ],
        'Intruso no trio → distrator',
      ),
    ],
  },
  {
    file: 'fenix-instituto-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1780000630425-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Epidemiologia investiga distribuição e determinantes dos agravos em populações. Incidência≠estoque acumulado; prevalência≠só casos novos; foco não é clínico individual.',
    sources: [{ ...GUIA, covers: ['epidemiologia', 'incidência', 'prevalência', 'determinantes'] }],
    slides: [
      conceptMap(
        'Conceitos fundamentais — o certo',
        [
          { label: 'Epidemiologia', detail: 'Distribuição e fatores determinantes dos agravos em populações.', icon: 'Users' },
          { label: 'Incidência', detail: 'Casos novos no período — não o total acumulado/estoque.', icon: 'PlusCircle' },
          { label: 'Prevalência', detail: 'Estoque de casos — não “só novos”.', icon: 'Layers' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Dizer que o enfoque epi é clínico individual.', icon: 'AlertTriangle' },
        ],
        'População + distribuição + determinantes',
      ),
      logicFlow(
        [
          'Comando: alternativa correta à luz dos conceitos fundamentais.',
          'Eliminar incidência como total acumulado (isso puxa prevalência/estoque).',
          'Eliminar enfoque prioritário clínico individual.',
          'Eliminar prevalência como número de novos casos.',
          'Manter: epidemiologia investiga distribuição e determinantes em populações.',
          'Marcar B.',
          'Em similares: epi = coletivo; clínica = indivíduo.',
        ],
        'Distribuição + determinantes → B',
      ),
      goldenRule(
        'Três acertos rápidos',
        'Decore',
        [
          { label: 'Epi', value: 'Distribuição + determinantes em populações.', badge: 'ok' },
          { label: 'Incidência', value: 'Novos casos no período.', badge: 'warn' },
          { label: 'Prevalência', value: 'Casos existentes (estoque).', badge: 'warn' },
        ],
        'Coletivo ≠ clínico individual',
      ),
      dangerZone(
        'PEGADINHAS — conceitos base',
        [
          {
            label: 'Letra A — incidência = acumulado',
            detail: 'Incidência = total acumulado de casos ao longo do tempo.',
            correct: 'Confunde com estoque/prevalência — incidência é casos novos.',
          },
          {
            label: 'Letra C — clínico individual',
            detail: 'Enfoque prioritário na abordagem clínica individual.',
            correct: 'Epidemiologia prioriza o coletivo populacional.',
          },
          {
            label: 'Letra D — prevalência = novos',
            detail: 'Prevalência = número de novos casos no período.',
            correct: 'Isso é incidência — prevalência é o estoque.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “epidemiologia = só estatística de óbitos”.',
            correct: 'Cobre agravos, determinantes e ações — não só mortalidade.',
          },
        ],
        'Inverter incidência/prevalência → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g08',
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
