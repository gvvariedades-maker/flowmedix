/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g07 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g07.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g07';
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
const SISVAN = {
  id: 'sisvan-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Sistema de Vigilância Alimentar e Nutricional (SISVAN)',
  year: 2022,
  url: 'https://www.gov.br/saude/pt-br',
};
const SIAB = {
  id: 'siab-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Sistema de Informação da Atenção Básica (SIAB) — fichas A/B/D',
  year: 2013,
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
    file: 'fau-unicentro-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563608452-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Doenças sazonais: ocorrem com mais frequência em determinada estação do ano — não “climáticas/verticais/horizontais”.',
    sources: [{ ...GUIA, covers: ['sazonalidade', 'ocorrência de doenças'] }],
    slides: [
      conceptMap(
        'Mais casos em uma estação = ?',
        [
          { label: 'Pista', detail: 'Acontecem com mais frequência em determinada estação do ano.', icon: 'Calendar' },
          { label: 'Termo', detail: 'Doenças sazonais.', icon: 'Sun' },
          { label: 'Não é', detail: 'Verticais, horizontais, paliativas nem o rótulo solto “climáticas”.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar “climáticas” por causa da estação.', icon: 'AlertTriangle' },
        ],
        'Estação do ano → sazonal',
      ),
      logicFlow(
        [
          'Lacuna: doenças que ocorrem mais em determinada estação do ano.',
          'Eliminar verticais e horizontais (modos de transmissão, não sazonalidade).',
          'Eliminar climáticas e paliativas.',
          'Preencher com sazonais.',
          'Marcar D.',
          'Em similares: sazão = estação; vertical/horizontal = transmissão.',
        ],
        'Sazonais → letra D',
      ),
      goldenRule(
        'Sazonalidade em uma linha',
        'Decore',
        [
          { label: 'Sazonal', value: 'Pico ligado a uma estação do ano.', badge: 'ok' },
          { label: 'Armadilha', value: 'Climática / vertical / horizontal.', badge: 'warn' },
        ],
        'Estação = sazonal',
      ),
      dangerZone(
        'PEGADINHAS — lacuna sazonal',
        [
          {
            label: 'Letra A — verticais',
            detail: 'Doenças verticais.',
            correct: 'Vertical fala de transmissão mãe–filho — não de estação.',
          },
          {
            label: 'Letra B — horizontais',
            detail: 'Doenças horizontais.',
            correct: 'Horizontal é modo de transmissão entre indivíduos — não sazonalidade.',
          },
          {
            label: 'Letra C — climáticas',
            detail: 'Doenças climáticas.',
            correct: 'A banca quer o termo sazonal para frequência por estação.',
          },
          {
            label: 'Letra E — paliativas',
            detail: 'Doenças paliativas.',
            correct: 'Paliativo não descreve ocorrência sazonal.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “gripe só no inverno = endemia”.',
            correct: 'Pico sazonal ≠ endemia (presença contínua no território).',
          },
        ],
        'Trocar sazonal por climática → distrator',
      ),
    ],
  },
  {
    file: 'fau-unicentro-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563608452-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Chave desta prova: “doença totalmente erradicada” associa a cura. Em uso técnico, erradicação ≠ cura individual — ensinar o gabarito.',
    exam_vs_current:
      'Prova associa erradicação total a “cura”; tecnicamente erradicação é eliminação da doença na população.',
    sources: [{ ...GUIA, covers: ['erradicação', 'terminologia'] }],
    slides: [
      conceptMap(
        'Quando a doença foi totalmente erradicada',
        [
          { label: 'Comando', detail: 'Doença totalmente erradicada — qual termo a prova quer?', icon: 'HelpCircle' },
          { label: 'Gabarito', detail: 'Nesta chave: cura.', icon: 'Check' },
          { label: 'Não marque', detail: 'Profilaxia, subnotificada, afecção, cianose.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Procurar “erradicação” nas opções — ela não está listada.', icon: 'AlertTriangle' },
        ],
        'Gabarito da prova = cura',
      ),
      logicFlow(
        [
          'Comando: quando a doença foi totalmente erradicada.',
          'Eliminar profilaxia (prevenção), subnotificada, afecção e cianose.',
          'Entre as opções dadas, a chave aponta cura.',
          'Marcar D.',
          'Em similares: se a prova oferecer “erradicação/eliminação”, prefira o termo técnico; aqui só “cura” fecha.',
        ],
        'Chave da prova: cura → D',
      ),
      goldenRule(
        'Gabarito desta lacuna',
        'O que marcar',
        [
          { label: 'Nesta prova', value: 'Cura = doença totalmente erradicada (chave).', badge: 'ok' },
          { label: 'Na prática VE', value: 'Erradicação ≠ cura de um paciente.', badge: 'warn' },
        ],
        'Marque a chave — saiba o nuance',
      ),
      dangerZone(
        'PEGADINHAS — erradicada',
        [
          {
            label: 'Letra A — profilaxia',
            detail: 'Profilaxia.',
            correct: 'Profilaxia é prevenção — não descreve doença já erradicada.',
          },
          {
            label: 'Letra B — subnotificada',
            detail: 'Subnotificada.',
            correct: 'Subnotificação é falha de registro — não erradicação.',
          },
          {
            label: 'Letra C — afecção',
            detail: 'Afecção.',
            correct: 'Afecção = processo patológico — não o desfecho “erradicada”.',
          },
          {
            label: 'Letra E — cianose',
            detail: 'Cianose.',
            correct: 'Sinal clínico — nada a ver com erradicação.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “erradicação = zero casos no mundo”.',
            correct: 'Aí o termo técnico é eliminação/erradicação populacional — não “cura” individual.',
          },
        ],
        'Profilaxia/subnotificação ≠ erradicada',
      ),
    ],
  },
  {
    file: 'fau-unicentro-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563608452-8.json',
    family: 'conceito',
    pedagogical_branch: 'epi_cadeia_transmissao',
    guideline_snapshot:
      'Fase latente: infecção presente sem sintomas. Não é pico de sintomas, nem “não transmite”, nem puerpério/leite.',
    sources: [{ ...GUIA, covers: ['período de latência', 'infecção assintomática'] }],
    slides: [
      conceptMap(
        'Fase latente — o que é',
        [
          { label: 'Núcleo', detail: 'Infecção presente, mas sem sintomas.', icon: 'Moon' },
          { label: 'Não é', detail: 'Período de sintomas exacerbados (doença manifesta).', icon: 'Flame' },
          { label: 'Cuidado', detail: 'Latente ≠ “nunca transmite” nem “só puerpério”.', icon: 'AlertCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Colar latência com transmissão vertical no puerpério.', icon: 'AlertTriangle' },
        ],
        'Presente + sem sintomas = latente',
      ),
      logicFlow(
        [
          'Comando: fase latente de uma doença — alternativa correta.',
          'Eliminar “sintomas mais exacerbados”.',
          'Eliminar “não pode ser transmitida” (absolutização perigosa).',
          'Eliminar leite/mamas e puerpério/transmissão vertical.',
          'Manter: infecção presente sem sintomas.',
          'Marcar B.',
          'Em similares: latente = silenciosa; manifesta = com sintomas.',
        ],
        'Sem sintomas com infecção → B',
      ),
      goldenRule(
        'Latência em uma frase',
        'Decore',
        [
          { label: 'Latente', value: 'Infecção presente · sintomas ausentes.', badge: 'ok' },
          { label: 'Não confunda', value: 'Pico sintomático · puerpério · “nunca transmite”.', badge: 'warn' },
        ],
        'Latente = silenciosa',
      ),
      dangerZone(
        'PEGADINHAS — fase latente',
        [
          {
            label: 'Letra A — sintomas no pico',
            detail: 'Sintomas mais exacerbados após a infecção.',
            correct: 'Isso é doença manifesta — o oposto de latente.',
          },
          {
            label: 'Letra C — nunca transmite',
            detail: 'Nesse período a doença não pode ser transmitida.',
            correct: 'Absolutizar “não transmite” é falso em várias infecções latentes.',
          },
          {
            label: 'Letra D — leite',
            detail: 'Pequenas quantidades de leite pelas mamas.',
            correct: 'Descreve outro fenômeno — não latência infecciosa.',
          },
          {
            label: 'Letra E — puerpério vertical',
            detail: 'Período puerperal com transmissão vertical.',
            correct: 'Mistura puerpério com latência — conceitos distintos.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “latência = incubação”.',
            correct: 'Incubação leva ao início dos sintomas; latência pode permanecer silenciosa.',
          },
        ],
        'Confundir latente com sintomático → distrator',
      ),
    ],
  },
  {
    file: 'fau-unicentro-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563617321-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Caso-índice: primeiro caso detectado/documentado no grupo; dispara investigação, contatos e contenção (pode ser fora da zona do diagnóstico).',
    sources: [{ ...GUIA, covers: ['caso-índice', 'investigação epidemiológica', 'contatos'] }],
    slides: [
      conceptMap(
        'Quem dispara a investigação?',
        [
          { label: 'Papel', detail: 'Primeiro caso detectado/documentado no grupo/família/comunidade.', icon: 'Flag' },
          { label: 'Ação', detail: 'Dispara investigação, rastreamento de contatos e intervenções.', icon: 'Search' },
          { label: 'Nome', detail: 'Caso-índice — não “paciente um” nem siglas inventadas.', icon: 'Tag' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Aceitar “Paciente Um” por tradução literal.', icon: 'AlertTriangle' },
        ],
        'Primeiro caso documentado = caso-índice',
      ),
      logicFlow(
        [
          'Ler a definição completa: primeiro caso + dispara investigação/contatos/contenção.',
          'Eliminar Paciente Um, Caso P, Agente Z, Marco Transmissor (rótulos inventados).',
          'Reconhecer o termo oficial: caso-índice.',
          'Marcar B.',
          'Em similares: caso-índice abre o fio; autóctone fala de local de aquisição.',
        ],
        'Caso-índice → letra B',
      ),
      goldenRule(
        'Caso-índice',
        'Decore',
        [
          { label: 'Quem', value: 'Primeiro caso detectado/documentado no grupo.', badge: 'ok' },
          { label: 'Para quê', value: 'Investigação · contatos · isolamento/quarentena/vacina.', badge: 'ok' },
        ],
        'Índice = primeiro do fio',
      ),
      dangerZone(
        'PEGADINHAS — nome do primeiro caso',
        [
          {
            label: 'Letra A — Paciente Um',
            detail: 'Paciente Um.',
            correct: 'Tradução informal — a banca quer caso-índice.',
          },
          {
            label: 'Letra C — Caso P',
            detail: 'Caso P.',
            correct: 'Sigla inventada — não é o termo epidemiológico.',
          },
          {
            label: 'Letra D — Agente Z',
            detail: 'Agente Z.',
            correct: 'Não nomeia o primeiro caso do surto.',
          },
          {
            label: 'Letra E — Marco Transmissor',
            detail: 'Marco Transmissor.',
            correct: 'Rótulo inventado — responda caso-índice.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “caso-índice = caso autóctone”.',
            correct: 'Índice = ordem/detecção; autóctone = local de aquisição.',
          },
        ],
        'Rótulo inventado → distrator',
      ),
    ],
  },
  {
    file: 'fau-unicentro-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-9.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'SISVAN = Sistema de Vigilância Alimentar e Nutricional (sentinela alimentação/nutrição). SINAN = agravos; NOTIVISA = vigilância sanitária.',
    sources: [{ ...SISVAN, covers: ['SISVAN', 'alimentação', 'nutrição'] }],
    slides: [
      conceptMap(
        'Sentinela de alimentação e nutrição',
        [
          { label: 'Função', detail: 'Sistema de informação sentinela de alimentação e nutrição.', icon: 'Apple' },
          { label: 'Sigla', detail: 'SISVAN.', icon: 'Database' },
          { label: 'Não confunda', detail: 'SINAN (agravos), DNV, SISNUTRI inventado, NOTIVISA.', icon: 'GitCompare' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar SINAN porque “é o sistema famoso”.', icon: 'AlertTriangle' },
        ],
        'Alimentação/nutrição → SISVAN',
      ),
      logicFlow(
        [
          'Comando: sistema sentinela de alimentação e nutrição.',
          'Eliminar SINAN (agravos de notificação).',
          'Eliminar DNV, SISNUTRI e NOTIVISA.',
          'Manter SISVAN.',
          'Marcar A.',
          'Em similares: leia o tema do sistema — nutrição ≠ notificação de agravo.',
        ],
        'SISVAN → letra A',
      ),
      goldenRule(
        'Sigla certa',
        'Decore',
        [
          { label: 'SISVAN', value: 'Vigilância alimentar e nutricional.', badge: 'ok' },
          { label: 'SINAN', value: 'Agravos de notificação — outro sistema.', badge: 'warn' },
        ],
        'Nutrição = SISVAN',
      ),
      dangerZone(
        'PEGADINHAS — sistema sentinela',
        [
          {
            label: 'Letra B — SINAN',
            detail: 'SINAN.',
            correct: 'SINAN é agravos notificáveis — não sentinela de nutrição.',
          },
          {
            label: 'Letra C — DNV',
            detail: 'DNV.',
            correct: 'Não é o sistema de vigilância alimentar/nutricional.',
          },
          {
            label: 'Letra D — SISNUTRI',
            detail: 'SISNUTRI.',
            correct: 'Sigla inventada/parecida — a oficial é SISVAN.',
          },
          {
            label: 'Letra E — NOTIVISA',
            detail: 'NOTIVISA.',
            correct: 'Vigilância sanitária de produtos — outro eixo.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: confundir SISVAN com e-SUS AB.',
            correct: 'e-SUS AB é atenção básica ampla; SISVAN é o eixo alimentar/nutricional.',
          },
        ],
        'Colar SINAN no lugar de SISVAN → distrator',
      ),
    ],
  },
  {
    file: 'fau-unicentro-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563725570-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'SIAB: Ficha D registra diariamente atividades/procedimentos e notificações de doenças/condições de acompanhamento sistemático.',
    sources: [{ ...SIAB, covers: ['SIAB', 'Ficha D', 'atividades diárias'] }],
    slides: [
      conceptMap(
        'SIAB — qual ficha é o diário?',
        [
          { label: 'Sistema', detail: 'SIAB agrega dados da população visitada (cadastro e acompanhamento).', icon: 'FolderOpen' },
          { label: 'Instrumento', detail: 'Ficha D: atividades e procedimentos do dia + algumas notificações.', icon: 'ClipboardList' },
          { label: 'Outras', detail: 'Ficha A (cadastro), B (acompanhamento) — não são o diário de procedimentos.', icon: 'Files' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar Ficha A porque “é a mais citada”.', icon: 'AlertTriangle' },
        ],
        'Diário de atividades = Ficha D',
      ),
      logicFlow(
        [
          'Comando: instrumento com registro diário de atividades/procedimentos e notificações.',
          'Eliminar Ficha A (cadastramento) e Ficha B (acompanhamento típico).',
          'Eliminar Ficha SSA e Ficha R.',
          'Manter Ficha D.',
          'Marcar C.',
          'Em similares: A cadastra · B acompanha · D registra o dia a dia.',
        ],
        'Ficha D → letra C',
      ),
      goldenRule(
        'Fichas do SIAB',
        'Decore',
        [
          { label: 'A', value: 'Cadastramento da família/população.', badge: 'warn' },
          { label: 'B', value: 'Acompanhamento de grupos/condições.', badge: 'warn' },
          { label: 'D', value: 'Atividades/procedimentos diários + notificações.', badge: 'ok' },
        ],
        'D = diário operacional',
      ),
      dangerZone(
        'PEGADINHAS — ficha SIAB',
        [
          {
            label: 'Letra A — Ficha A',
            detail: 'Ficha A.',
            correct: 'A é cadastramento — não o registro diário de procedimentos.',
          },
          {
            label: 'Letra B — Ficha B',
            detail: 'Ficha B.',
            correct: 'B acompanha condições/grupos — não o diário de atividades.',
          },
          {
            label: 'Letra D — Ficha SSA',
            detail: 'Ficha SSA.',
            correct: 'Não é o instrumento descrito no enunciado do SIAB.',
          },
          {
            label: 'Letra E — Ficha R',
            detail: 'Ficha R.',
            correct: 'Não corresponde ao registro diário de atividades/procedimentos.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “e-SUS substituiu SIAB — fichas mudaram de nome”.',
            correct: 'A lógica A/B/D ajuda a ler provas antigas que ainda cobram SIAB.',
          },
        ],
        'Trocar D por A/B → distrator',
      ),
    ],
  },
  {
    file: 'fau-unicentro-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563725570-4.json',
    family: 'calc',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Taxa de mortalidade: óbitos ÷ total da população × constante (por mil ou 100 mil hab./ano) — não média, metade, dobro nem só doentes.',
    sources: [{ ...GUIA, covers: ['taxa de mortalidade', 'indicadores'] }],
    slides: [
      conceptMap(
        'Mortalidade — o denominador',
        [
          { label: 'Numerador', detail: 'Número total de óbitos no período e local.', icon: 'Hash' },
          { label: 'Denominador', detail: 'Total da população — depois multiplica pela constante.', icon: 'Users' },
          { label: 'Expressão', detail: 'Por mil ou cem mil habitantes/ano.', icon: 'BarChart3' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Dividir pelo total de doentes (isso puxa para letalidade).', icon: 'AlertTriangle' },
        ],
        'Óbitos ÷ população total',
      ),
      logicFlow(
        [
          'Lacuna: mortalidade = óbitos divididos por ___ × constante.',
          'Calcular: óbitos ÷ total da população × constante (por mil ou 100 mil).',
          'Eliminar média, metade e dobro da população.',
          'Eliminar total de indivíduos doentes (letalidade).',
          'Preencher com o total da população.',
          'Marcar C.',
          'Em similares: mortalidade usa população; letalidade usa doentes.',
        ],
        'Denominador = população total → C',
      ),
      goldenRule(
        'Fórmula da mortalidade',
        'Decore',
        [
          { label: 'Mortalidade', value: 'Óbitos ÷ total da população × constante.', badge: 'ok' },
          { label: 'Letalidade', value: 'Óbitos ÷ doentes pelo agravo.', badge: 'warn' },
        ],
        'População total no denominador',
      ),
      dangerZone(
        'PEGADINHAS — denominador',
        [
          {
            label: 'Letra A — média',
            detail: 'Pela média da população.',
            correct: 'A fórmula clássica desta prova usa o total da população.',
          },
          {
            label: 'Letra B — metade',
            detail: 'Pela metade da população.',
            correct: 'Não existe esse atalho no cálculo padrão.',
          },
          {
            label: 'Letra D — dobro',
            detail: 'Pelo dobro da população.',
            correct: 'Dobra o denominador sem base — distrator numérico.',
          },
          {
            label: 'Letra E — doentes',
            detail: 'Pelo total de indivíduos doentes.',
            correct: 'Isso é lógica de letalidade — não de mortalidade geral.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: mortalidade específica por causa.',
            correct: 'Ainda divide por população (ou subgrupo); o numerador é que muda.',
          },
        ],
        'Trocar população por doentes → distrator',
      ),
    ],
  },
  {
    file: 'fau-unicentro-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563768972-8.json',
    family: 'conceito',
    pedagogical_branch: 'epi_cadeia_transmissao',
    guideline_snapshot:
      'Agente etiológico = agente causador/responsável pela doença. Hospedeiro alberga; ACS não é agente etiológico.',
    sources: [{ ...GUIA, covers: ['agente etiológico', 'cadeia de transmissão'] }],
    slides: [
      conceptMap(
        'O que é agente etiológico?',
        [
          { label: 'Definição', detail: 'Agente causador ou responsável por uma doença.', icon: 'Microscope' },
          { label: 'Na cadeia', detail: 'É o elo inicial — o que provoca o agravo.', icon: 'Link' },
          { label: 'Não é', detail: 'Hospedeiro, “fator de profilaxia”, antisséptico ou o ACS.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar “organismo que alberga o parasita” (hospedeiro).', icon: 'AlertTriangle' },
        ],
        'Etiológico = causador',
      ),
      logicFlow(
        [
          'Comando: definição de agente etiológico.',
          'Eliminar organismo que alberga o parasita (hospedeiro).',
          'Eliminar “fator de profilaxia”, princípio ativo antisséptico e descrição de ACS.',
          'Manter: agente causador/responsável pela doença.',
          'Marcar C.',
          'Em similares: etiologia = causa; hospedeiro = quem abriga.',
        ],
        'Causador da doença → letra C',
      ),
      goldenRule(
        'Etiológico vs hospedeiro',
        'Decore',
        [
          { label: 'Agente etiológico', value: 'Causa / responsável pela doença.', badge: 'ok' },
          { label: 'Hospedeiro', value: 'Organismo que alberga o agente/parasita.', badge: 'warn' },
        ],
        'Causa ≠ quem abriga',
      ),
      dangerZone(
        'PEGADINHAS — agente etiológico',
        [
          {
            label: 'Letra A — hospedeiro',
            detail: 'Organismo que alberga o parasita.',
            correct: 'Isso é hospedeiro — não o agente etiológico.',
          },
          {
            label: 'Letra B — profilaxia',
            detail: 'Fator fundamental para profilaxia.',
            correct: 'Profilaxia é prevenção — não define o agente causador.',
          },
          {
            label: 'Letra D — antisséptico',
            detail: 'Princípio ativo para antissepsia de mãos/pele.',
            correct: 'Produto químico — não o agente da doença.',
          },
          {
            label: 'Letra E — ACS',
            detail: 'Membro da equipe de Saúde da Família / mediador.',
            correct: 'Descreve o ACS — pessoa da rede, não agente etiológico.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “vetor = agente etiológico”.',
            correct: 'Vetor transporta; o agente etiológico é o causador (ex.: vírus/bactéria).',
          },
        ],
        'Trocar causador por hospedeiro → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g07',
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
