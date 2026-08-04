/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g20 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g20.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g20';
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
  title: 'Lista Nacional de Notificação Compulsória',
  year: 2020,
  url: 'https://www.gov.br/saude/pt-br/composicao/svsa/notificacao-compulsoria',
};
const PRINCIPIOS = {
  id: 'modulo-principios-epidemiologia-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Princípios de epidemiologia — incidência e prevalência',
  year: 2010,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/modulo_principios_epidemiologia_2.pdf',
};
const PNVS = {
  id: 'politica-nacional-vigilancia-saude-2018',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Política Nacional de Vigilância em Saúde — quatro áreas',
  year: 2018,
  url: 'https://www.gov.br/saude/pt-br',
};
const PGR = {
  id: 'nr-01-pgr',
  tier: 'A' as const,
  issuer: 'Ministério do Trabalho / SST',
  title: 'Programa de Gerenciamento de Riscos — identificação de perigos biológicos',
  year: 2020,
  url: 'https://www.gov.br/trabalho-e-emprego',
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
    file: 'instituto-consulplan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563626015-8.json',
    family: 'vf',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'VE: coletar/processar/analisar/interpretar = V. Funcionamento/riscos a pacientes e adesão a regulamentos = VisA (F). “Eficácia + omissão de informações” = F.',
    sources: [{ ...GUIA, covers: ['funções da VE', 'coleta de dados', 'vigilância sanitária'] }],
    slides: [
      conceptMap(
        'Funções da VE — V ou F',
        [
          {
            label: 'Definição',
            detail: 'VE: conhecer/detectar mudanças em determinantes e recomendar prevenção/controle.',
            icon: 'BookOpen',
          },
          {
            label: 'Núcleo verdadeiro',
            detail: 'Coletar, processar, analisar e interpretar dados.',
            icon: 'Database',
          },
          {
            label: 'Outros braços',
            detail: 'Funcionamento/riscos a pacientes e adesão a regulamentos → VisA.',
            icon: 'Scale',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar “avaliar eficácia e ainda omissão de informações” como pacote da VE.',
            icon: 'AlertTriangle',
          },
        ],
        'Só o ciclo de dados é V aqui',
      ),
      logicFlow(
        [
          'I — condições de funcionamento/riscos a pacientes → VisA → Falsa.',
          'II — coletar, processar, analisar e interpretar → VE → Verdadeira.',
          'III — adesão a normas/regulamentos técnicos → VisA → Falsa.',
          'IV — eficácia/efetividade + omissão de informações → pacote falso → Falsa.',
          'Sequência F, V, F, F → marcar C.',
          'Em similares: separe VE (dado) de VisA (norma/fiscalização).',
        ],
        'F V F F → letra C',
      ),
      goldenRule(
        'Gabarito das afirmativas',
        'Decore',
        [
          { label: 'I', value: 'F — funcionamento/risco ao paciente (VisA).', badge: 'warn' },
          { label: 'II', value: 'V — ciclo de dados da VE.', badge: 'ok' },
          { label: 'III', value: 'F — adesão a regulamentos (VisA).', badge: 'warn' },
          { label: 'IV', value: 'F — “omissão de informações” invalida.', badge: 'warn' },
        ],
        'Uma verdadeira: o ciclo de dados',
      ),
      dangerZone(
        'PEGADINHAS — V/F funções',
        [
          {
            label: 'Letra A — V,V,F,F',
            detail: 'Marca I verdadeira.',
            correct: 'I é VisA — não função típica da VE nesta chave.',
          },
          {
            label: 'Letra B — tudo F',
            detail: 'Nega também a coleta/análise.',
            correct: 'II é verdadeira — o ciclo de dados é função da VE.',
          },
          {
            label: 'Letra D — F,V,F,V',
            detail: 'Aceita IV como verdadeira.',
            correct: 'IV mistura eficácia com “omissão de informações” — falsa.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “VE = fiscalizar rotulagem de alimento”.',
            correct: 'Fiscalizar produto/serviço é VisA — outro braço.',
          },
        ],
        'Colar VisA dentro da VE → distrator',
      ),
    ],
  },
  {
    file: 'instituto-consulplan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563774121-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Periodicidade: Covid-19 e febre amarela = até 24 h. TB não é 24 h; dengue continua notificável; clamidiose não fecha o pacote compulsório desta chave.',
    sources: [{ ...LISTA, covers: ['notificação 24h', 'Covid-19', 'febre amarela', 'tuberculose'] }],
    slides: [
      conceptMap(
        'Periodicidade na AB — qual está certa?',
        [
          {
            label: 'Tarefa',
            detail: 'Notificar à VE municipal é tarefa central do profissional da Atenção Básica.',
            icon: 'Bell',
          },
          {
            label: '24 h (chave)',
            detail: 'Covid-19 e febre amarela — notificáveis em até 24 horas.',
            icon: 'Zap',
          },
          {
            label: 'Não 24 h',
            detail: 'Tuberculose segue outro prazo (não imediato de 24 h nesta chave).',
            icon: 'Calendar',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Dizer que dengue “não se notifica mais” fora de epidemia.',
            icon: 'AlertTriangle',
          },
        ],
        'Leia o relógio da lista',
      ),
      logicFlow(
        [
          'Assinale a afirmativa correta sobre periodicidade.',
          'Eliminar TB em 24 h e “dengue não notifica mais”.',
          'Eliminar pacote sarampo/sífilis/clamidiose como está formulado.',
          'Manter: Covid-19 e febre amarela em até 24 h.',
          'Marcar B.',
          'Em similares: compulsória ≠ mesmo prazo para todos.',
        ],
        'Covid + FA em 24 h → letra B',
      ),
      goldenRule(
        'Prazos desta chave',
        'Decore',
        [
          { label: '24 h', value: 'Covid-19 · febre amarela.', badge: 'ok' },
          { label: 'Não 24 h', value: 'Tuberculose (nesta afirmativa).', badge: 'warn' },
          { label: 'Dengue', value: 'Continua notificável — não some fora de epidemia.', badge: 'warn' },
        ],
        'AB notifica no prazo certo',
      ),
      dangerZone(
        'PEGADINHAS — periodicidade',
        [
          {
            label: 'Letra A — TB 24 h',
            detail: 'Tuberculose deverá ser notificada em até 24 h.',
            correct: 'TB não entra no prazo de 24 h desta chave.',
          },
          {
            label: 'Letra C — clamidiose',
            detail: 'Sarampo, sífilis e clamidiose como pacote compulsório.',
            correct: 'Clamidiose não fecha o pacote compulsório desta afirmativa.',
          },
          {
            label: 'Letra D — dengue',
            detail: 'Dengue só se notifica em epidemias.',
            correct: 'Dengue/dengue grave seguem notificação — não “somem”.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “febre amarela = notificar só após óbito”.',
            correct: 'Suspeita já dispara o relógio imediato.',
          },
        ],
        'Errar o prazo da lista → distrator',
      ),
    ],
  },
  {
    file: 'instituto-consulplan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563800137-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Objetivo da VE: monitorar e avaliar a eficácia das intervenções de saúde pública — não só surto hospitalar, não substituir compulsória nem criar protocolo clínico de tudo.',
    sources: [{ ...GUIA, covers: ['objetivos da VE', 'monitoramento', 'eficácia das intervenções'] }],
    slides: [
      conceptMap(
        'Objetivo da VE',
        [
          {
            label: 'Ciclo',
            detail: 'Coleta, análise e interpretação de dados sobre ocorrência de doenças.',
            icon: 'RefreshCw',
          },
          {
            label: 'Objetivo',
            detail: 'Monitorar e avaliar a eficácia das intervenções de saúde pública.',
            icon: 'Target',
          },
          {
            label: 'Não é',
            detail: 'Só CCIH, pesquisas no lugar da compulsória ou protocolo de tratamento de tudo.',
            icon: 'XCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Reduzir VE a surto hospitalar.',
            icon: 'AlertTriangle',
          },
        ],
        'Dado → avaliar a intervenção',
      ),
      logicFlow(
        [
          'Assinale o objetivo correto da VE.',
          'Eliminar controle exclusivo de surtos hospitalares.',
          'Eliminar substituir compulsória e desenvolver protocolo de todas as doenças.',
          'Manter: monitorar e avaliar eficácia das intervenções.',
          'Marcar B.',
          'Em similares: VE informa se a ação de saúde pública funcionou.',
        ],
        'Avaliar intervenção → letra B',
      ),
      goldenRule(
        'Para que serve a VE',
        'Decore',
        [
          { label: 'Faz', value: 'Monitorar · avaliar eficácia das intervenções.', badge: 'ok' },
          { label: 'Não', value: 'Só hospital · acabar com compulsória · tratar tudo.', badge: 'warn' },
        ],
        'VE avalia ação populacional',
      ),
      dangerZone(
        'PEGADINHAS — objetivos',
        [
          {
            label: 'Letra A — só hospital',
            detail: 'Exclusivamente controle de surtos hospitalares.',
            correct: 'VE é mais ampla que a CCIH/hospital.',
          },
          {
            label: 'Letra C — sem compulsória',
            detail: 'Substituir notificação compulsória por pesquisas esporádicas.',
            correct: 'Compulsória é base contínua — não se substitui por pesquisa pontual.',
          },
          {
            label: 'Letra D — protocolos',
            detail: 'Desenvolver protocolos de tratamento para todas as doenças.',
            correct: 'Conduta clínica não é o objetivo central da VE.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “VE só coleta e nunca avalia resultado”.',
            correct: 'Avaliar eficácia da intervenção fecha o ciclo.',
          },
        ],
        'Estreitar ou clinicar a VE → distrator',
      ),
    ],
  },
  {
    file: 'instituto-consulplan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563814158-2.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'NCI (24 h): cólera, raiva humana, carbúnculo/antraz. EXCETO coqueluche — não é imediata nesta chave.',
    sources: [{ ...LISTA, covers: ['NCI', 'coqueluche', 'cólera', 'raiva humana', 'antraz'] }],
    slides: [
      conceptMap(
        'NCI 24 h — ache o EXCETO',
        [
          {
            label: 'NCI',
            detail: 'Notificação Compulsória Imediata: suspeitos/confirmados em até 24 horas.',
            icon: 'Zap',
          },
          {
            label: 'Imediatas típicas',
            detail: 'Cólera, raiva humana e carbúnculo/antraz.',
            icon: 'AlertCircle',
          },
          {
            label: 'Fora do bolso',
            detail: 'Coqueluche — não fecha o prazo imediato desta chave.',
            icon: 'Calendar',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Meter coqueluche no 24 h só porque é compulsória.',
            icon: 'AlertTriangle',
          },
        ],
        'Compulsória ≠ imediata',
      ),
      logicFlow(
        [
          'EXCETO: qual NÃO é NCI de 24 h.',
          'Validar cólera, raiva humana e antraz como imediatas.',
          'Isolar coqueluche → fora do imediato.',
          'Marcar B.',
          'Em similares: leia NCI × semanal antes de marcar a lista.',
        ],
        'Coqueluche fora do NCI → B',
      ),
      goldenRule(
        'Relógio NCI',
        'Decore',
        [
          { label: 'NCI (exemplos)', value: 'Cólera · raiva humana · antraz.', badge: 'ok' },
          { label: 'EXCETO', value: 'Coqueluche — não é imediata nesta chave.', badge: 'warn' },
        ],
        'Coqueluche não entra no 24 h aqui',
      ),
      dangerZone(
        'PEGADINHAS — NCI EXCETO',
        [
          {
            label: 'Letra A — cólera',
            detail: 'Cólera.',
            correct: 'É NCI típica — não é o EXCETO.',
          },
          {
            label: 'Letra B — coqueluche',
            detail: 'Coqueluche.',
            correct: 'EXCETO: coqueluche não é de notificação imediata (24 h) nesta chave.',
          },
          {
            label: 'Letra C — raiva',
            detail: 'Raiva humana.',
            correct: 'Raiva humana é imediata clássica — não é o EXCETO.',
          },
          {
            label: 'Letra D — antraz',
            detail: 'Carbúnculo ou antraz.',
            correct: 'Entra no NCI — não é o EXCETO.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “toda compulsória = 24 horas”.',
            correct: 'Há prazos diferentes — NCI é só o bolso imediato.',
          },
        ],
        'Confundir compulsória com NCI → distrator',
      ),
    ],
  },
  {
    file: 'instituto-consulplan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563838275-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_cadeia_transmissao',
    guideline_snapshot:
      'Identificação de perigos biológicos (transmissibilidade, patogenicidade, virulência, reservatórios) fica no PGR — não no PCMSO, PGRSS nem RH.',
    sources: [{ ...PGR, covers: ['PGR', 'agentes biológicos', 'identificação de perigos', 'saúde do trabalhador'] }],
    slides: [
      conceptMap(
        'Perigos biológicos — qual documento?',
        [
          {
            label: 'Conteúdo',
            detail: 'Agentes prováveis, fontes, reservatórios, transmissibilidade, patogenicidade e virulência.',
            icon: 'Bug',
          },
          {
            label: 'Etapa',
            detail: 'Identificação de perigos no gerenciamento de riscos do serviço de saúde.',
            icon: 'Search',
          },
          {
            label: 'Documento',
            detail: 'Programa de Gerenciamento de Riscos (PGR).',
            icon: 'FileText',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar PGR por PCMSO ou PGRSS.',
            icon: 'AlertTriangle',
          },
        ],
        'Perigo biológico → PGR',
      ),
      logicFlow(
        [
          'Onde especificar identificação de perigos biológicos.',
          'Eliminar PCMSO (controle médico ocupacional).',
          'Eliminar PGRSS (resíduos) e planejamento de RH.',
          'Manter PGR.',
          'Marcar A.',
          'Em similares: PGR mapeia perigo; PCMSO acompanha a saúde do trabalhador.',
        ],
        'PGR → letra A',
      ),
      goldenRule(
        'Documentos SST',
        'Decore',
        [
          { label: 'PGR', value: 'Identifica perigos/riscos (inclui biológicos).', badge: 'ok' },
          { label: 'PCMSO', value: 'Controle médico de saúde ocupacional.', badge: 'warn' },
          { label: 'PGRSS', value: 'Resíduos de serviços de saúde.', badge: 'warn' },
        ],
        'Perigo ≠ exame médico ≠ lixo',
      ),
      dangerZone(
        'PEGADINHAS — documento',
        [
          {
            label: 'Letra B — PCMSO',
            detail: 'Programa de Controle Médico de Saúde Ocupacional.',
            correct: 'PCMSO cuida do acompanhamento médico — não da etapa de perigos do PGR.',
          },
          {
            label: 'Letra C — PGRSS',
            detail: 'Plano de Gerenciamento de Resíduos de Serviço de Saúde.',
            correct: 'PGRSS trata resíduos — não a identificação de agentes biológicos.',
          },
          {
            label: 'Letra D — RH',
            detail: 'Planejamento do setor de gestão de pessoas.',
            correct: 'RH não é o documento de identificação de perigos biológicos.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “PGR = só risco químico, nunca biológico”.',
            correct: 'Biológicos (transmissibilidade/virulência) entram no PGR.',
          },
        ],
        'Trocar PGR por PCMSO/PGRSS → distrator',
      ),
    ],
  },
  {
    file: 'instituto-consulplan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563838275-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Compulsórias nesta chave: hepatites virais, HIV/AIDS, tuberculose e febre amarela. Cisticercose, giardíase, toxoplasmose e “todas as hepatites” não fecham.',
    sources: [{ ...LISTA, covers: ['notificação compulsória', 'HIV', 'tuberculose', 'hepatites virais', 'febre amarela'] }],
    slides: [
      conceptMap(
        'Doenças de notificação compulsória',
        [
          {
            label: 'Pacote certo',
            detail: 'Hepatites virais, HIV/AIDS, tuberculose e febre amarela.',
            icon: 'ListOrdered',
          },
          {
            label: 'Fora',
            detail: 'Cisticercose, giardíase, toxoplasmose e “todos os tipos de hepatites”.',
            icon: 'XCircle',
          },
          {
            label: 'Atenção',
            detail: 'Lista nacional é específica — não basta “parece infecciosa”.',
            icon: 'Search',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar cisticercose/giardíase no mesmo bolso das compulsórias clássicas.',
            icon: 'AlertTriangle',
          },
        ],
        'Lista certa · sem parasitose “coringa”',
      ),
      logicFlow(
        [
          'Assinale o conjunto de compulsórias correto.',
          'Eliminar opções com cisticercose, toxoplasmose ou giardíase.',
          'Eliminar “todos os tipos de hepatites”.',
          'Manter: hepatites virais + HIV/AIDS + TB + febre amarela.',
          'Marcar C.',
          'Em similares: cheque cada item da alternativa contra a lista.',
        ],
        'HV·HIV·TB·FA → letra C',
      ),
      goldenRule(
        'Pacote compulsório',
        'Decore',
        [
          { label: 'Entra', value: 'Hepatites virais · HIV/AIDS · TB · febre amarela.', badge: 'ok' },
          { label: 'Não fecha', value: 'Cisticercose · giardíase · “todas as hepatites”.', badge: 'warn' },
        ],
        'Um item errado derruba a alternativa',
      ),
      dangerZone(
        'PEGADINHAS — compulsória',
        [
          {
            label: 'Letra A — cisticercose',
            detail: 'HIV/AIDS, FA, cisticercose e sífilis.',
            correct: 'Cisticercose não fecha o pacote compulsório desta chave.',
          },
          {
            label: 'Letra B — toxoplasmose',
            detail: 'FA, cisticercose, sífilis e toxoplasmose.',
            correct: 'Mistura itens que não fecham a lista nacional aqui.',
          },
          {
            label: 'Letra D — todas hepatites',
            detail: 'Todos os tipos de hepatites, HIV, TB e giardíase.',
            correct: '“Todas as hepatites” + giardíase invalidam a alternativa.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “qualquer hepatite A/B/C/D/E = mesmo fluxo”.',
            correct: 'Lista fala em hepatites virais de interesse — não “todas” sem critério.',
          },
        ],
        'Colar parasitose na lista → distrator',
      ),
    ],
  },
  {
    file: 'instituto-ibed-enfermagem-processo-de-enfermagem-1780004926596-3.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'O texto define prevalência (casos novos + antigos em um momento) e chama de incidência — afirmativa Errada. Incidência = casos novos no período.',
    sources: [{ ...PRINCIPIOS, covers: ['incidência', 'prevalência'] }],
    slides: [
      conceptMap(
        'Incidência ou prevalência?',
        [
          {
            label: 'Texto do item',
            detail: 'Número total de casos, novos e antigos, em população e momento dados.',
            icon: 'Layers',
          },
          {
            label: 'Nome certo',
            detail: 'Isso é prevalência (estoque) — não incidência.',
            icon: 'BookOpen',
          },
          {
            label: 'Incidência',
            detail: 'Casos novos em um período determinado.',
            icon: 'Plus',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar o rótulo “incidência” porque cita doença e população.',
            icon: 'AlertTriangle',
          },
        ],
        'Estoque ≠ incidência',
      ),
      logicFlow(
        [
          'O item chama de incidência a definição de prevalência.',
          'Confrontar: novos no período = incidência.',
          'Confrontar: novos + antigos no momento = prevalência.',
          'Rótulo errado → afirmativa falsa.',
          'Marcar Errado (B).',
          'Em similares: se fala “novos e antigos”, pense prevalência.',
        ],
        'Rótulo trocado → Errado',
      ),
      goldenRule(
        'Duas frases',
        'Decore',
        [
          { label: 'Incidência', value: 'Casos novos / período.', badge: 'ok' },
          { label: 'Prevalência', value: 'Casos existentes (novos + antigos) / momento.', badge: 'ok' },
          { label: 'Armadilha', value: 'Colar prevalência no nome incidência.', badge: 'warn' },
        ],
        'Nome errado invalida o item',
      ),
      dangerZone(
        'PEGADINHAS — C/E incidência',
        [
          {
            label: 'Marcar Certo',
            detail: 'Aceitar o texto porque cita população e doença.',
            correct: 'O conteúdo é de prevalência — o nome incidência está errado.',
          },
          {
            label: 'Sinônimos',
            detail: 'Tratar incidência e prevalência como a mesma coisa.',
            correct: 'Fluxo de novos ≠ foto do estoque.',
          },
          {
            label: 'Só crônicas',
            detail: 'Achar que “novos e antigos” só vale para crônicas e por isso é incidência.',
            correct: 'Prevalência descreve estoque — independente do rótulo crônico/agudo.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “incidência ignora o tempo”.',
            correct: 'Incidência exige período — prevalência ancora o momento.',
          },
        ],
        'Trocar o nome da medida → distrator',
      ),
    ],
  },
  {
    file: 'instituto-verbena-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563800137-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Quatro áreas da Vigilância em Saúde (PNVS): Epidemiológica, Sanitária, Ambiental e Saúde do Trabalhador — não entomológica nem do óbito como “os quatro”.',
    sources: [{ ...PNVS, covers: ['Vigilância em Saúde', 'quatro áreas', 'PNVS 2018'] }],
    slides: [
      conceptMap(
        'Quatro áreas da Vigilância em Saúde',
        [
          {
            label: 'Política',
            detail: 'PNVS (2018): coleta, análise e disseminação contínuas para proteger e promover saúde.',
            icon: 'Flag',
          },
          {
            label: 'Quatro',
            detail: 'Epidemiológica, Sanitária, Ambiental e Saúde do Trabalhador.',
            icon: 'Layers',
          },
          {
            label: 'Não são “os quatro”',
            detail: 'Entomológica e Vigilância do Óbito como substitutas do quarteto oficial.',
            icon: 'XCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar Saúde do Trabalhador por entomologia/óbito.',
            icon: 'AlertTriangle',
          },
        ],
        'VE · VisA · Ambiental · Trabalhador',
      ),
      logicFlow(
        [
          'Quais quatro áreas compõem a Vigilância em Saúde.',
          'Eliminar pacotes com entomológica e/ou do óbito no lugar do quarteto.',
          'Manter: Epidemiológica, Sanitária, Ambiental e Saúde do Trabalhador.',
          'Marcar D.',
          'Em similares: entomologia apoia VE — não substitui uma das quatro áreas.',
        ],
        'Quatro áreas oficiais → letra D',
      ),
      goldenRule(
        'Quarteto PNVS',
        'Decore',
        [
          { label: '1–2', value: 'Epidemiológica · Sanitária.', badge: 'ok' },
          { label: '3–4', value: 'Ambiental · Saúde do Trabalhador.', badge: 'ok' },
          { label: 'Não', value: 'Entomológica / Óbito como “os quatro”.', badge: 'warn' },
        ],
        'Quatro nomes — sem atalho',
      ),
      dangerZone(
        'PEGADINHAS — quatro áreas',
        [
          {
            label: 'Letra A — entomológica/óbito',
            detail: 'Sanitária, Entomológica, Ambiental e do Óbito.',
            correct: 'Faltam VE e Trabalhador; entomológica/óbito não fecham o quarteto.',
          },
          {
            label: 'Letra B — entomológica',
            detail: 'Epidemiológica, Sanitária, Entomológica e do Óbito.',
            correct: 'Troca Ambiental/Trabalhador por entomológica/óbito.',
          },
          {
            label: 'Letra C — sem VE',
            detail: 'Sanitária, Ambiental, Óbito e Trabalhador.',
            correct: 'Omitiu a Vigilância Epidemiológica do pacote.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “Vigilância em Saúde = só VE”.',
            correct: 'É guarda-chuva de quatro áreas — VE é uma delas.',
          },
        ],
        'Trocar o quarteto oficial → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g20',
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
