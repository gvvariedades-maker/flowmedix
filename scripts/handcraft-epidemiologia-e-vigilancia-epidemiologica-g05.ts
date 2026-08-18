/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g05 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g05.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g05';
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
  title: 'Módulo princípios de epidemiologia para o controle de enfermidades (cadeia epidemiológica)',
  year: 2010,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/modulo_principios_epidemiologia_2.pdf',
};
const VIGI = {
  id: 'vigilancia-ambiental-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Vigilância em Saúde Ambiental — programas de fatores de risco não biológicos',
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
    file: 'cotec-fadenor-geral-epidemiologia-e-vigilancia-epidemiologica-1777103452899-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_cadeia_transmissao',
    guideline_snapshot:
      'Aedes: só fêmea infectada transmite; ovo→adulto ~7–10 dias; pupa ≠ 5–7 dias; ovos podem incubar dias/meses na água.',
    exam_vs_current: 'Chave da prova: F, V, F, V (letra B).',
    sources: [{ ...GUIA, covers: ['Aedes aegypti', 'ciclo biológico', 'arboviroses'] }],
    slides: [
      conceptMap(
        'Fases do Aedes — o que é V ou F',
        [
          { label: 'Transmissão', detail: 'Não basta ser fêmea: precisa estar contaminada/infectada pelo vírus.', icon: 'Bug' },
          { label: 'Ciclo', detail: 'Do ovo ao adulto costuma levar cerca de 7 a 10 dias.', icon: 'Timer' },
          { label: 'Pupa', detail: 'Vive na água, mas o prazo 5–7 dias não é o da pupa (é típico da larva).', icon: 'Droplets' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar V em “todas as fêmeas transmitem, independentemente de contaminação”.', icon: 'AlertTriangle' },
        ],
        'Fêmea infectada · 7–10 dias · pupa curta',
      ),
      logicFlow(
        [
          'I — “todas as fêmeas transmitem independentemente de contaminação” → Falsa.',
          'II — ovo demora 7 a 10 dias para virar adulto → Verdadeira.',
          'III — pupas demoram 5 a 7 dias para virar adulto → Falsa.',
          'IV — incubação dos ovos na água pode durar dias ou meses → Verdadeira.',
          'Sequência de cima para baixo: F, V, F, V.',
          'Marcar B.',
          'Em similares: transmissão exige fêmea infectada; pupa ≠ prazo larval.',
        ],
        'Sequência F V F V → letra B',
      ),
      goldenRule(
        'Gabarito VF do Aedes',
        'Decore a ordem',
        [
          { label: 'I', value: 'F — fêmea precisa estar contaminada/infectada.', badge: 'warn' },
          { label: 'II', value: 'V — 7 a 10 dias ovo → adulto.', badge: 'ok' },
          { label: 'III', value: 'F — pupa não leva 5–7 dias até o adulto.', badge: 'warn' },
          { label: 'IV', value: 'V — incubação dos ovos: dias ou meses.', badge: 'ok' },
        ],
        'F · V · F · V',
      ),
      dangerZone(
        'PEGADINHAS — ciclo do Aedes',
        [
          {
            label: 'Letra A — V F F V',
            detail: 'Começa com V na transmissão universal.',
            correct: 'I é falsa: nem toda fêmea transmite sem estar infectada.',
          },
          {
            label: 'Letra C — F V V V',
            detail: 'Aceita pupa em 5–7 dias.',
            correct: 'III é falsa: esse prazo não descreve a pupa corretamente.',
          },
          {
            label: 'Letra D — V F V F',
            detail: 'Inverte quase tudo.',
            correct: 'I falsa, II verdadeira, III falsa, IV verdadeira — não casa com D.',
          },
          {
            label: 'Letra E — F V V F',
            detail: 'Mata a incubação longa dos ovos.',
            correct: 'IV é verdadeira: ovos podem incubar dias ou meses.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “macho Aedes transmite dengue”.',
            correct: 'Transmissão vetorial clássica é pela fêmea hematófaga infectada.',
          },
        ],
        'Confundir pupa com larva → distrator',
      ),
    ],
  },
  {
    file: 'cpcon-uepb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563843512-9.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Pandemia = ocorrência epidêmica de larga distribuição espacial atingindo várias nações. Endemia = incidência “normal” local.',
    sources: [{ ...GUIA, covers: ['pandemia', 'epidemia', 'endemia'] }],
    slides: [
      conceptMap(
        'O que é pandemia?',
        [
          { label: 'Escala', detail: 'É uma ocorrência epidêmica com larga distribuição espacial.', icon: 'Globe' },
          { label: 'Alcance', detail: 'Atinge várias nações — não fica numa comunidade só.', icon: 'Map' },
          { label: 'Não confundir', detail: 'Incidência “normal” local = endemia; intensidade endêmica ≠ pandemia.', icon: 'GitCompare' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Definir pandemia como “só via respiratória” ou “precisa de vacina bacteriana”.', icon: 'AlertTriangle' },
        ],
        'Epidemia + várias nações = pandemia',
      ),
      logicFlow(
        [
          'Comando: o que é uma pandemia.',
          'Eliminar incidência “normal” em área geográfica (endemia).',
          'Eliminar “intensidade de doença endêmica” e “só vias respiratórias”.',
          'Eliminar “precisa de vacina por ser bacteriana”.',
          'Manter ocorrência epidêmica de larga distribuição espacial em várias nações.',
          'Marcar B.',
          'Em similares: pandemia = epidemia em escala multi-nacional.',
        ],
        'Epidêmica em várias nações → B',
      ),
      goldenRule(
        'Três escalas em uma linha',
        'Decore',
        [
          { label: 'Endemia', value: 'Incidência dentro do esperado em área limitada.', badge: 'warn' },
          { label: 'Epidemia', value: 'Excesso em comunidade/período.', badge: 'warn' },
          { label: 'Pandemia', value: 'Epidêmica com larga distribuição em várias nações.', badge: 'ok' },
        ],
        'Várias nações = pandemia',
      ),
      dangerZone(
        'PEGADINHAS — pandemia',
        [
          {
            label: 'Letra A — “normal” local',
            detail: 'Incidência dentro dos limites normais em área geográfica.',
            correct: 'Isso descreve endemia — não pandemia.',
          },
          {
            label: 'Letra C — intensidade endêmica',
            detail: 'Intensidade de uma doença endêmica local.',
            correct: 'Fala de endemia hiperendêmica — escala errada.',
          },
          {
            label: 'Letra D — só respiratória',
            detail: 'Epidemia lenta só por vias respiratórias.',
            correct: 'Via de transmissão não define pandemia.',
          },
          {
            label: 'Letra E — vacina bacteriana',
            detail: 'Doença que precisa de vacina por ser bacteriana.',
            correct: 'Agente e vacina não definem o termo pandemia.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “pandemia = muitos casos num bairro”.',
            correct: 'Muitos casos locais = surto/epidemia; pandemia exige larga distribuição.',
          },
        ],
        'Colar endemia no lugar de pandemia → distrator',
      ),
    ],
  },
  {
    file: 'cpcon-uepb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563848614-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'SRAG associada a coronavírus (SARS-CoV / MERS-CoV) é agravo de notificação compulsória imediata — não semanal/mensal.',
    sources: [{ ...LISTA, covers: ['SRAG', 'coronavírus', 'notificação imediata'] }],
    slides: [
      conceptMap(
        'SRAG por coronavírus — qual o relógio?',
        [
          { label: 'Agravo', detail: 'Síndrome Respiratória Aguda Grave associada a coronavírus.', icon: 'Activity' },
          { label: 'Lista', detail: 'É de notificação compulsória no Brasil.', icon: 'ClipboardList' },
          { label: 'Periodicidade', detail: 'Notificação imediata — não quinzenal, semanal, mensal ou anual.', icon: 'Zap' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar semanal porque “quase tudo no SINAN é semanal”.', icon: 'AlertTriangle' },
        ],
        'SRAG coronavírus = imediata',
      ),
      logicFlow(
        [
          'Isolar o agravo: SRAG associada a coronavírus (SARS-CoV / MERS-CoV).',
          'Lembrar: notificação compulsória com periodicidade imediata.',
          'Eliminar quinzenal, semanal, mensal e anual.',
          'Marcar C.',
          'Em similares: SRAG/coronavírus e eventos de alto risco → imediata.',
        ],
        'Periodicidade imediata → letra C',
      ),
      goldenRule(
        'Relógio da SRAG',
        'Decore',
        [
          { label: 'Agravo', value: 'SRAG associada a coronavírus.', badge: 'ok' },
          { label: 'Periodicidade', value: 'Imediata.', badge: 'ok' },
          { label: 'Não marque', value: 'Quinzenal · semanal · mensal · anual.', badge: 'warn' },
        ],
        'Imediata — sem esperar a semana',
      ),
      dangerZone(
        'PEGADINHAS — periodicidade',
        [
          {
            label: 'Letra A — quinzenal',
            detail: 'Notificação quinzenal.',
            correct: 'SRAG por coronavírus não espera quinze dias.',
          },
          {
            label: 'Letra B — semanal',
            detail: 'Notificação semanal.',
            correct: 'Semanal é armadilha clássica; este agravo é imediato.',
          },
          {
            label: 'Letra D — mensal',
            detail: 'Notificação mensal.',
            correct: 'Mensal é incompatível com agravo de alto risco respiratório.',
          },
          {
            label: 'Letra E — anual',
            detail: 'Notificação anual.',
            correct: 'Anual não serve para vigilância de SRAG.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: dengue (casos) × SRAG coronavírus.',
            correct: 'Relógio muda com o agravo — leia a lista, não generalize.',
          },
        ],
        'Marcar semanal por hábito → distrator',
      ),
    ],
  },
  {
    file: 'cpcon-uepb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563848614-7.json',
    family: 'vf',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'PFA/pólio: manter Brasil livre de selvagem; vacina = principal prevenção; Américas livres de transmissão autóctone. RN não fica “sem proteção nenhuma”.',
    exam_vs_current: 'Chave: I, II e III apenas (IV falsa).',
    sources: [{ ...GUIA, covers: ['paralisia flácida aguda', 'poliomielite', 'vigilância PFA'] }],
    slides: [
      conceptMap(
        'PFA / poliomielite — o que é correto',
        [
          { label: 'VE', detail: 'Manter o Brasil livre da circulação de poliovírus selvagem.', icon: 'Shield' },
          { label: 'Prevenção', detail: 'Vacinação (VOP/rotina e campanhas) é a principal medida.', icon: 'Syringe' },
          { label: 'Américas', detail: 'Continente certificado livre de transmissão autóctone do selvagem.', icon: 'Globe2' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Aceitar que o recém-nascido “não tem proteção nenhuma”.', icon: 'AlertTriangle' },
        ],
        'I–III verdadeiras · IV falsa',
      ),
      logicFlow(
        [
          'I — objetivo: manter Brasil livre de poliovírus selvagem → Verdadeira.',
          'II — vacinação é a principal prevenção → Verdadeira.',
          'III — Américas livres de transmissão autóctone do selvagem → Verdadeira.',
          'IV — recém-nascido sem proteção nenhuma → Falsa.',
          'Correto: I, II e III, apenas.',
          'Marcar A.',
          'Em similares: IV absoluta (“nenhuma proteção”) costuma ser a falsa.',
        ],
        'I II III apenas → letra A',
      ),
      goldenRule(
        'Gabarito PFA',
        'Decore',
        [
          { label: 'I', value: 'V — Brasil livre de selvagem.', badge: 'ok' },
          { label: 'II', value: 'V — vacina = principal prevenção.', badge: 'ok' },
          { label: 'III', value: 'V — Américas livres de autóctone selvagem.', badge: 'ok' },
          { label: 'IV', value: 'F — RN não fica sem proteção nenhuma.', badge: 'warn' },
        ],
        'Só I · II · III',
      ),
      dangerZone(
        'PEGADINHAS — PFA',
        [
          {
            label: 'Letra B — inclui IV',
            detail: 'I, II, III e IV.',
            correct: 'IV é falsa: absolutizar “nenhuma proteção” no RN.',
          },
          {
            label: 'Letra C — sem I',
            detail: 'II, III e IV apenas.',
            correct: 'I é verdadeira e IV é falsa — não casa com C.',
          },
          {
            label: 'Letra D — II e IV',
            detail: 'Só vacina + RN sem proteção.',
            correct: 'Perde I e III verdadeiras e carrega IV falsa.',
          },
          {
            label: 'Letra E — III e IV',
            detail: 'Américas + RN sem proteção.',
            correct: 'IV derruba; faltam I e II.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só notifica PFA confirmada laboratorial”.',
            correct: 'Vigilância de PFA age na suspeita — não espera só o lab.',
          },
        ],
        'Absolutizar RN sem proteção → distrator',
      ),
    ],
  },
  {
    file: 'decorp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563608452-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Taxa de incidência = frequência de casos novos em período específico numa população definida. Prevalência = estoque; letalidade = óbitos/doentes.',
    sources: [{ ...GUIA, covers: ['incidência', 'prevalência', 'letalidade'] }],
    slides: [
      conceptMap(
        'Taxa de incidência — completa a lacuna',
        [
          { label: 'Termo', detail: 'Taxa de incidência na vigilância epidemiológica hospitalar.', icon: 'BarChart3' },
          { label: 'Núcleo', detail: 'Frequência com que surgem casos novos em um período.', icon: 'PlusCircle' },
          { label: 'Denominador', detail: 'População definida (exposta/em risco no serviço).', icon: 'Users' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Trocar por prevalência (estoque) ou letalidade (óbitos/doentes).', icon: 'AlertTriangle' },
        ],
        'Casos novos ÷ população no período',
      ),
      logicFlow(
        [
          'Lacuna: conceito de taxa de incidência.',
          'Eliminar quantidade de pessoas doentes no período (prevalência).',
          'Eliminar óbitos sobre doentes (letalidade).',
          'Eliminar só distribuição espacial sem o foco em casos novos.',
          'Manter frequência de novos casos em período específico numa população definida.',
          'Marcar A.',
          'Em similares: “novos” = incidência; “estoque” = prevalência.',
        ],
        'Casos novos no período → letra A',
      ),
      goldenRule(
        'Incidência × irmãos',
        'Decore',
        [
          { label: 'Incidência', value: 'Casos novos em período / população definida.', badge: 'ok' },
          { label: 'Prevalência', value: 'Quem está doente (estoque) no período/momento.', badge: 'warn' },
          { label: 'Letalidade', value: 'Óbitos entre os doentes do agravo.', badge: 'warn' },
        ],
        'Novos = incidência',
      ),
      dangerZone(
        'PEGADINHAS — indicadores',
        [
          {
            label: 'Letra B — estoque',
            detail: 'Quantidade de pessoas que apresentam a doença no período.',
            correct: 'É prevalência — não incidência.',
          },
          {
            label: 'Letra C — óbitos/doentes',
            detail: 'Óbitos sobre número de doentes pelo agravo.',
            correct: 'É letalidade — outro indicador.',
          },
          {
            label: 'Letra D — só mapa',
            detail: 'Distribuição espacial e disseminação no território.',
            correct: 'Descreve geografia do agravo — falta o núcleo “casos novos”.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “incidência acumulada × densidade de incidência”.',
            correct: 'Ambas falam de novos casos; a forma do denominador muda.',
          },
        ],
        'Trocar incidência por prevalência → distrator',
      ),
    ],
  },
  {
    file: 'educa-pb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563626015-1.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Caso autóctone = adquirido na zona do diagnóstico. “Contraído fora da zona” = importado/alóctone — definição INCORRETA para autóctone.',
    sources: [{ ...GUIA, covers: ['caso autóctone', 'caso-índice', 'agravo'] }],
    slides: [
      conceptMap(
        'Termos de campo — ache a INCORRETA',
        [
          { label: 'Comando', detail: 'Assinale a alternativa INCORRETA entre os termos de epidemiologia de campo.', icon: 'Search' },
          { label: 'Autóctone (certo)', detail: 'Caso adquirido na mesma zona onde se fez o diagnóstico.', icon: 'MapPin' },
          { label: 'Erro da prova', detail: 'Dizer que autóctone foi contraído fora da zona do diagnóstico.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Corrigir agravo/caso-índice e deixar passar a definição invertida.', icon: 'AlertTriangle' },
        ],
        'Autóctone = na zona · fora = importado',
      ),
      logicFlow(
        [
          'Comando: alternativa INCORRETA.',
          'Validar agravo, caso, caso esporádico e caso-índice (definições corretas).',
          'Isolar “caso autóctone = contraído fora da zona do diagnóstico”.',
          'Essa frase inverte o sentido (descreve caso importado/alóctone).',
          'Marcar C.',
          'Em similares: autóctone = aqui; importado = fora.',
        ],
        'Autóctone invertido → letra C',
      ),
      goldenRule(
        'Autóctone sem inverter',
        'Decore',
        [
          { label: 'Autóctone', value: 'Adquirido na zona onde se diagnosticou.', badge: 'ok' },
          { label: 'Importado', value: 'Contraído fora da zona do diagnóstico.', badge: 'warn' },
          { label: 'Caso-índice', value: 'Primeiro entre casos relacionados (pode ser fonte).', badge: 'ok' },
        ],
        'Fora da zona ≠ autóctone',
      ),
      dangerZone(
        'PEGADINHAS — termos de campo',
        [
          {
            label: 'Letra A — agravo',
            detail: 'Dano físico/mental/social por circunstâncias nocivas.',
            correct: 'Definição correta de agravo — não é a incorreta.',
          },
          {
            label: 'Letra B — caso',
            detail: 'Pessoa/animal com critérios clínicos/lab/epidemiológicos.',
            correct: 'Definição correta de caso.',
          },
          {
            label: 'Letra C — autóctone invertido',
            detail: 'Caso autóctone = contraído fora da zona do diagnóstico.',
            correct: 'Essa é a INCORRETA: autóctone se adquire na zona; “fora” = importado.',
          },
          {
            label: 'Letra D — esporádico',
            detail: 'Sem relação epidemiológica com outros conhecidos.',
            correct: 'Definição correta de caso esporádico.',
          },
          {
            label: 'Letra E — caso-índice',
            detail: 'Primeiro entre casos similares relacionados.',
            correct: 'Definição correta de caso-índice.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “autóctone = primeiro caso da epidemia”.',
            correct: 'Primeiro relacionado = caso-índice; autóctone fala de local de aquisição.',
          },
        ],
        'Inverter autóctone/importado → pegadinha',
      ),
    ],
  },
  {
    file: 'educa-pb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563843512-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_cadeia_transmissao',
    guideline_snapshot:
      'Cadeia epidemiológica: 1 agente → 2 reservatório → 3 porta de saída → 4 modo de transmissão → 5 porta de entrada → 6 suscetibilidade.',
    sources: [{ ...PRINCIPIOS, covers: ['cadeia epidemiológica', 'agente', 'reservatório', 'transmissão'] }],
    slides: [
      conceptMap(
        'Cadeia epidemiológica — ordem dos elos',
        [
          { label: 'Ideia', detail: 'Sequência contínua agente–hospedeiro–meio.', icon: 'Link' },
          { label: 'Início', detail: 'Começa no agente causal e no reservatório.', icon: 'Microscope' },
          { label: 'Meio', detail: 'Porta de saída → modo de transmissão → porta de entrada.', icon: 'ArrowRightLeft' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Começar pela porta de entrada ou pela suscetibilidade.', icon: 'AlertTriangle' },
        ],
        'Agente → reservatório → saída → transmissão → entrada → suscetível',
      ),
      logicFlow(
        [
          'Comando: organização e sequência correta da cadeia epidemiológica.',
          'Eliminar sequências que começam por porta de entrada, modo ou suscetibilidade.',
          'Montar: agente causal → reservatório → porta de saída → modo de transmissão.',
          'Fechar: porta de entrada do novo hospedeiro → suscetibilidade do hospedeiro.',
          'Marcar C.',
          'Em similares: o fluxo segue o agente saindo do reservatório até o suscetível.',
        ],
        'Ordem agente→…→suscetível → C',
      ),
      goldenRule(
        'Seis elos na ordem',
        'Decore a sequência',
        [
          { label: '1–2', value: 'Agente causal → Reservatório.', badge: 'ok' },
          { label: '3–4', value: 'Porta de saída → Modo de transmissão.', badge: 'ok' },
          { label: '5–6', value: 'Porta de entrada → Suscetibilidade do hospedeiro.', badge: 'ok' },
        ],
        'Não comece pela porta de entrada',
      ),
      dangerZone(
        'PEGADINHAS — ordem da cadeia',
        [
          {
            label: 'Letra A — começa na entrada',
            detail: 'Porta de entrada primeiro; agente no meio.',
            correct: 'Inverte o fluxo: agente/reservatório vêm antes da entrada.',
          },
          {
            label: 'Letra B — entrada → reservatório',
            detail: 'Porta de entrada antes do reservatório.',
            correct: 'Reservatório precede saída e transmissão.',
          },
          {
            label: 'Letra D — transmissão primeiro',
            detail: 'Modo de transmissão como elo 1.',
            correct: 'Transmissão vem depois da porta de saída do agente.',
          },
          {
            label: 'Letra E — suscetível primeiro',
            detail: 'Suscetibilidade do hospedeiro no início.',
            correct: 'Suscetibilidade fecha a cadeia — não abre.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: confundir porta de saída com porta de entrada.',
            correct: 'Saída = deixa o reservatório; entrada = chega ao novo hospedeiro.',
          },
        ],
        'Começar pelo hospedeiro → distrator',
      ),
    ],
  },
  {
    file: 'educa-pb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563843512-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Fatores de risco não biológicos: VIGIAGUA, VIGIAR, VIGIDESASTRES, VIGIAPP, VIGISOLO e VSPEA (agrotóxicos) — todos corretos nesta chave.',
    exam_vs_current: 'Chave da prova: I–VI corretas (letra A).',
    sources: [{ ...VIGI, covers: ['VIGIAGUA', 'VIGIAR', 'VIGIDESASTRES', 'VIGISOLO', 'VSPEA'] }],
    slides: [
      conceptMap(
        'Vigilância de riscos não biológicos',
        [
          { label: 'Escopo', detail: 'Programas de vigilância ambiental / fatores de risco não biológicos.', icon: 'Leaf' },
          { label: 'Água e ar', detail: 'VIGIAGUA (água) e VIGIAR (poluentes atmosféricos).', icon: 'Wind' },
          { label: 'Desastre e solo', detail: 'VIGIDESASTRES, VIGIAPP, VIGISOLO e VSPEA (agrotóxicos).', icon: 'Mountain' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Cortar um programa “com nome estranho” (ex.: VIGIAPP) sem base.', icon: 'AlertTriangle' },
        ],
        'I a VI entram nesta chave',
      ),
      logicFlow(
        [
          'I — VIGIAGUA (água para consumo) → correta.',
          'II — VIGIAR (poluentes atmosféricos) → correta.',
          'III — VIGIDESASTRES (desastres naturais) → correta.',
          'IV — VIGIAPP (desastres antropogênicos) → correta nesta prova.',
          'V — VIGISOLO (áreas contaminadas) → correta.',
          'VI — VSPEA (agrotóxicos) → correta.',
          'Todas corretas → Marcar A.',
          'Em similares: só elimine programa se a prova mostrar erro factual claro.',
        ],
        'I–VI todas corretas → letra A',
      ),
      goldenRule(
        'Mapa dos programas',
        'Decore os nomes',
        [
          { label: 'I–II', value: 'VIGIAGUA · VIGIAR.', badge: 'ok' },
          { label: 'III–IV', value: 'VIGIDESASTRES · VIGIAPP.', badge: 'ok' },
          { label: 'V–VI', value: 'VIGISOLO · VSPEA.', badge: 'ok' },
        ],
        'Seis programas · seis V',
      ),
      dangerZone(
        'PEGADINHAS — cortar programa',
        [
          {
            label: 'Letra B — sem V',
            detail: 'Tira VIGISOLO.',
            correct: 'VIGISOLO (áreas contaminadas) está no escopo — não corte.',
          },
          {
            label: 'Letra C — sem III',
            detail: 'Tira VIGIDESASTRES.',
            correct: 'Desastres naturais entram na vigilância ambiental.',
          },
          {
            label: 'Letra D — sem II',
            detail: 'Tira VIGIAR.',
            correct: 'Poluentes atmosféricos são eixo clássico (VIGIAR).',
          },
          {
            label: 'Letra E — sem V e VI',
            detail: 'Para em IV.',
            correct: 'VIGISOLO e VSPEA também estão corretas nesta chave.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: misturar VIGI com programa de imunização.',
            correct: 'Aqui o eixo é risco ambiental não biológico — não PNI.',
          },
        ],
        'Eliminar sigla por estranheza → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g05',
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
