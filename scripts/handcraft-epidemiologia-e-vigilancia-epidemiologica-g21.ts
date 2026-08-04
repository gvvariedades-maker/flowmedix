/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g21 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g21.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g21';
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
  title: 'Princípios de epidemiologia — surto, epidemia, pandemia',
  year: 2010,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/modulo_principios_epidemiologia_2.pdf',
};
const SINAN = {
  id: 'sinan-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'SINAN — Sistema de Informação de Agravos de Notificação',
  year: 2022,
  url: 'https://portalsinan.saude.gov.br/',
};
const AEDES = {
  id: 'diretrizes-controle-aedes-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Controle do Aedes aegypti — criadouros, fases e larvicidas',
  year: 2021,
  url: 'https://www.gov.br/saude/pt-br',
};
const PNVS = {
  id: 'politica-nacional-vigilancia-saude-2018',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Política Nacional de Vigilância em Saúde',
  year: 2018,
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
    file: 'instituto-verbena-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563800137-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Conhecer/detectar mudanças em determinantes e recomendar prevenção/controle de doenças e agravos = vigilância epidemiológica — não VisA, ambiental ou trabalhador.',
    sources: [{ ...PNVS, covers: ['vigilância epidemiológica', 'determinantes', 'PNVS'] }],
    slides: [
      conceptMap(
        'Qual vigilância é essa?',
        [
          {
            label: 'Texto',
            detail: 'Conhecer e detectar mudanças nos determinantes da saúde individual e coletiva.',
            icon: 'Search',
          },
          {
            label: 'Finalidade',
            detail: 'Recomendar e adotar prevenção/controle de doenças (transmissíveis e não) e agravos.',
            icon: 'Shield',
          },
          {
            label: 'Nome',
            detail: 'Vigilância epidemiológica.',
            icon: 'Activity',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar VisA só porque a PNVS fala em política de Estado.',
            icon: 'AlertTriangle',
          },
        ],
        'Determinantes + controle = VE',
      ),
      logicFlow(
        [
          'Completar a definição do conjunto de ações descrito.',
          'Eliminar ambiental, sanitária e saúde do trabalhador.',
          'Manter vigilância epidemiológica.',
          'Marcar A.',
          'Em similares: se o verbo é detectar agravo/determinante → VE.',
        ],
        'VE → letra A',
      ),
      goldenRule(
        'Quatro braços — um texto',
        'Decore',
        [
          { label: 'VE', value: 'Determinantes · prevenção/controle de agravos.', badge: 'ok' },
          { label: 'VisA', value: 'Regulamentar · fiscalizar práticas/produtos.', badge: 'warn' },
          { label: 'Ambiental / Trabalhador', value: 'Ambiente e saúde ocupacional.', badge: 'warn' },
        ],
        'Leia a finalidade do texto',
      ),
      dangerZone(
        'PEGADINHAS — rótulo',
        [
          {
            label: 'Letra B — ambiental',
            detail: 'Vigilância em saúde ambiental.',
            correct: 'Ambiental olha fatores do meio — não fecha esta definição.',
          },
          {
            label: 'Letra C — sanitária',
            detail: 'Vigilância sanitária.',
            correct: 'VisA fiscaliza práticas/produtos — outro núcleo.',
          },
          {
            label: 'Letra D — trabalhador',
            detail: 'Vigilância em saúde do trabalhador.',
            correct: 'Recorte ocupacional — não a definição dada.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “PNVS = só vigilância sanitária”.',
            correct: 'PNVS é guarda-chuva; o texto descreve a VE.',
          },
        ],
        'Trocar o braço pelo rótulo errado → distrator',
      ),
    ],
  },
  {
    file: 'instituto-verbena-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563838275-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Imediata (24 h): poliomielite, hantavirose e febre amarela. TB/hanseníase/tétano acidental e vários do pacote B/D não fecham o trio imediato.',
    sources: [{ ...LISTA, covers: ['notificação imediata', 'poliomielite', 'hantavirose', 'febre amarela'] }],
    slides: [
      conceptMap(
        'Compulsória imediata — exemplos',
        [
          {
            label: 'Relógio',
            detail: 'Notificação compulsória imediata: comunicar em até 24 horas às autoridades sanitárias.',
            icon: 'Zap',
          },
          {
            label: 'Trio (chave)',
            detail: 'Poliomielite, hantavirose e febre amarela.',
            icon: 'ListOrdered',
          },
          {
            label: 'Não imediato aqui',
            detail: 'TB, hanseníase, tétano acidental e misturas com toxoplasmose/sífilis.',
            icon: 'Calendar',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar qualquer pacote “conhecido” sem checar o prazo imediato.',
            icon: 'AlertTriangle',
          },
        ],
        'Imediata = trio certo',
      ),
      logicFlow(
        [
          'Exemplos de compulsória imediata (até 24 h).',
          'Eliminar TB/hanseníase/tétano acidental (outro prazo).',
          'Eliminar pacotes com leishmaniose/sífilis/toxoplasmose/dengue como trio imediato.',
          'Manter poliomielite, hantavirose e febre amarela.',
          'Marcar C.',
          'Em similares: compulsória ≠ mesmo relógio — leia “imediata”.',
        ],
        'Polio·hanta·FA → letra C',
      ),
      goldenRule(
        'Imediata nesta chave',
        'Decore',
        [
          { label: 'Entra', value: 'Poliomielite · hantavirose · febre amarela.', badge: 'ok' },
          { label: 'Não fecha', value: 'TB · hanseníase · toxoplasmose no trio.', badge: 'warn' },
        ],
        'Três nomes do bolso imediato',
      ),
      dangerZone(
        'PEGADINHAS — imediata',
        [
          {
            label: 'Letra A — TB/hanseníase',
            detail: 'Tuberculose, hanseníase e tétano acidental.',
            correct: 'Pacote típico de outro prazo — não o imediato desta chave.',
          },
          {
            label: 'Letra B — hepatite/HIV/LV',
            detail: 'Hepatite, HIV/Aids e leishmaniose visceral.',
            correct: 'Não é o trio de notificação imediata pedido aqui.',
          },
          {
            label: 'Letra D — sífilis/toxo/dengue',
            detail: 'Sífilis, toxoplasmose e dengue.',
            correct: 'Mistura que não fecha o bolso imediato desta prova.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “febre amarela = notificar só após óbito”.',
            correct: 'Suspeita já dispara a comunicação imediata.',
          },
        ],
        'Ignorar o prazo imediato → distrator',
      ),
    ],
  },
  {
    file: 'ivin-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563843512-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Creche: 10 casos de monkeypox interligados na mesma semana = surto (excesso delimitado). Não é pandemia, endemia nem “prevalência instantânea”.',
    sources: [{ ...PRINCIPIOS, covers: ['surto', 'epidemia', 'pandemia', 'endemia'] }],
    slides: [
      conceptMap(
        'Creche — 10 casos ligados = ?',
        [
          {
            label: 'Cenário',
            detail: 'Em uma semana, 10 casos de monkeypox interligados na mesma creche.',
            icon: 'Users',
          },
          {
            label: 'Escala',
            detail: 'Agrupamento limitado no tempo/espaço — excesso local.',
            icon: 'MapPin',
          },
          {
            label: 'Nome',
            detail: 'Surto.',
            icon: 'AlertCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Chamar de pandemia ou endemia por “vários casos”.',
            icon: 'AlertTriangle',
          },
        ],
        'Delimitado + ligado = surto',
      ),
      logicFlow(
        [
          'Classificar o evento da creche.',
          'Eliminar pandemia (escala mundial) e endemia (habitual).',
          'Eliminar “epidemia lenta” e “prevalência instantânea”.',
          'Manter surto.',
          'Marcar E.',
          'Em similares: instituição fechada + casos ligados → pense surto.',
        ],
        'Surto → letra E',
      ),
      goldenRule(
        'Escalas rápidas',
        'Decore',
        [
          { label: 'Surto', value: 'Excesso delimitado (ex.: creche).', badge: 'ok' },
          { label: 'Epidemia', value: 'Excesso em população/região maior.', badge: 'warn' },
          { label: 'Pandemia', value: 'Escala ampla entre países/continentes.', badge: 'warn' },
        ],
        'Lugar pequeno + cadeia = surto',
      ),
      dangerZone(
        'PEGADINHAS — ocorrência',
        [
          {
            label: 'Letra A — epidemia lenta',
            detail: 'Epidemia lenta.',
            correct: 'O recorte institucional aponta surto — não esse rótulo.',
          },
          {
            label: 'Letra B — endemia',
            detail: 'Endemia.',
            correct: 'Endemia é presença habitual — não um cluster de uma semana.',
          },
          {
            label: 'Letra C — prevalência',
            detail: 'Prevalência instantânea.',
            correct: 'Prevalência é indicador — não classifica o evento.',
          },
          {
            label: 'Letra D — pandemia',
            detail: 'Pandemia.',
            correct: 'Pandemia exige escala ampla — não uma creche.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “todo agrupamento em hospital = pandemia”.',
            correct: 'Hospital/creche = surto até prova em contrário.',
          },
        ],
        'Inflar a escala do evento → distrator',
      ),
    ],
  },
  {
    file: 'ivin-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563843512-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Pandemia (chave): I — mais de 2 continentes (V); II — limitada a grande área (F); III — diversos países, independente de clima local (V). Só I e III.',
    exam_vs_current:
      'Slides ensinam a chave da prova (I+III). Definições oficiais variam; distrator II descreve limite geográfico incompatível com pandemia.',
    sources: [{ ...PRINCIPIOS, covers: ['pandemia', 'continentes', 'disseminação'] }],
    slides: [
      conceptMap(
        'O que confere pandemia?',
        [
          {
            label: 'I',
            detail: 'Incidência em mais de dois continentes — verdadeira nesta chave.',
            icon: 'Globe',
          },
          {
            label: 'II',
            detail: 'Limitada a uma grande área geográfica — falsa (contraria a ideia de pandemia).',
            icon: 'XCircle',
          },
          {
            label: 'III',
            detail: 'Diversos países, independente de clima/ambiente local — verdadeira.',
            icon: 'Map',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar II porque “grande área” parece amplo.',
            icon: 'AlertTriangle',
          },
        ],
        'I e III · II fora',
      ),
      logicFlow(
        [
          'Julgar I: mais de 2 continentes → Verdadeira.',
          'Julgar II: limitada a grande área → Falsa.',
          'Julgar III: vários países sem depender do clima local → Verdadeira.',
          'Correto: apenas I e III.',
          'Marcar C.',
          'Em similares: pandemia atravessa fronteiras — não fica “limitada”.',
        ],
        'Apenas I e III → letra C',
      ),
      goldenRule(
        'Gabarito das assertivas',
        'Decore',
        [
          { label: 'I', value: 'V — mais de 2 continentes.', badge: 'ok' },
          { label: 'II', value: 'F — “limitada” não descreve pandemia.', badge: 'warn' },
          { label: 'III', value: 'V — vários países · além do clima local.', badge: 'ok' },
        ],
        'Só I e III fecham a pandemia',
      ),
      dangerZone(
        'PEGADINHAS — pandemia',
        [
          {
            label: 'Letra A — todas',
            detail: 'I, II e III.',
            correct: 'II é falsa — não pode marcar as três.',
          },
          {
            label: 'Letra B — I e II',
            detail: 'Apenas I e II.',
            correct: 'Carrega II falsa e perde a III verdadeira.',
          },
          {
            label: 'Letra D — II e III',
            detail: 'Apenas II e III.',
            correct: 'Inclui II falsa e perde a I verdadeira.',
          },
          {
            label: 'Letra E — só III',
            detail: 'Apenas III.',
            correct: 'I também está correta nesta chave.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “pandemia = surto em um hospital”.',
            correct: 'Surto é local; pandemia é escala entre países/continentes.',
          },
        ],
        'Aceitar “limitada” como pandemia → distrator',
      ),
    ],
  },
  {
    file: 'ivin-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563843512-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Notificação de agravos para contabilizar e orientar controle = SINAN. SIM = óbitos; SINASC = nascidos; SIVEP = influenza/SRAG; SUS não é o sistema de ficha.',
    sources: [{ ...SINAN, covers: ['SINAN', 'notificação', 'sistemas de informação'] }],
    slides: [
      conceptMap(
        'Sistema da notificação de doenças',
        [
          {
            label: 'Função',
            detail: 'Notificar agravos para contabilizar e planejar medidas de controle.',
            icon: 'Bell',
          },
          {
            label: 'Sistema',
            detail: 'SINAN — Sistema de Informação de Agravos de Notificação.',
            icon: 'Database',
          },
          {
            label: 'Vizinhos',
            detail: 'SIM (óbitos), SINASC (nascimentos), SIVEP (influenza/SRAG).',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar SUS como se fosse o sistema de ficha.',
            icon: 'AlertTriangle',
          },
        ],
        'Agravos notificados → SINAN',
      ),
      logicFlow(
        [
          'Qual sistema refere-se à notificação de doenças/agravos.',
          'Eliminar SIM, SINASC e SIVEP.',
          'Eliminar SUS (sistema de saúde, não a ficha).',
          'Manter SINAN.',
          'Marcar D.',
          'Em similares: notificação de agravo = SINAN.',
        ],
        'SINAN → letra D',
      ),
      goldenRule(
        'Siglas rápidas',
        'Decore',
        [
          { label: 'SINAN', value: 'Agravos de notificação.', badge: 'ok' },
          { label: 'SIM', value: 'Óbitos.', badge: 'warn' },
          { label: 'SINASC', value: 'Nascidos vivos.', badge: 'warn' },
          { label: 'SIVEP', value: 'Influenza / SRAG.', badge: 'warn' },
        ],
        'Cada sigla um fluxo',
      ),
      dangerZone(
        'PEGADINHAS — sistemas',
        [
          {
            label: 'Letra A — SIM',
            detail: 'SIM.',
            correct: 'SIM registra óbitos — não a notificação de agravos.',
          },
          {
            label: 'Letra B — SINASC',
            detail: 'SINASC.',
            correct: 'SINASC é nascimentos — outro sistema.',
          },
          {
            label: 'Letra C — SIVEP',
            detail: 'SIVEP.',
            correct: 'SIVEP é recorte influenza/SRAG — não o SINAN geral.',
          },
          {
            label: 'Letra E — SUS',
            detail: 'SUS.',
            correct: 'SUS é o sistema de saúde — não o SIS de notificação.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “toda notificação vai só no prontuário”.',
            correct: 'Agravos compulsórios alimentam o SINAN.',
          },
        ],
        'Trocar SINAN por outra sigla → distrator',
      ),
    ],
  },
  {
    file: 'ivin-geral-epidemiologia-e-vigilancia-epidemiologica-1777103597693-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Larvicida fosforado clássico no controle do Aedes no Brasil: Temephós. Deltametrina/cipermetrina = piretroides (adulto); carbaril = carbamato.',
    exam_vs_current:
      'Prova ancora Temephós como fosforado de uso no Brasil; diretrizes atuais diversificam larvicidas. Slides ensinam a chave da prova.',
    sources: [{ ...AEDES, covers: ['Temephós', 'larvicida', 'Aedes aegypti', 'fosforado'] }],
    slides: [
      conceptMap(
        'Inseticida fosforado — dengue',
        [
          {
            label: 'Pedido',
            detail: 'Inseticida fosforado muito aplicado no Brasil no controle dos vetores da dengue.',
            icon: 'Bug',
          },
          {
            label: 'Resposta',
            detail: 'Temephós (larvicida organofosforado).',
            icon: 'Droplets',
          },
          {
            label: 'Não confundir',
            detail: 'Deltametrina e cipermetrina = piretroides; carbaril = carbamato.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar piretroide adulto só porque também “mata mosquito”.',
            icon: 'AlertTriangle',
          },
        ],
        'Fosforado clássico = Temephós',
      ),
      logicFlow(
        [
          'Isolar: fosforado usado no controle do vetor da dengue.',
          'Eliminar deltametrina e cipermetrina (piretroides).',
          'Eliminar carbaril / carbaril B (carbamato).',
          'Manter Temephós.',
          'Marcar C.',
          'Em similares: classe química importa — fosforado ≠ piretroide.',
        ],
        'Temephós → letra C',
      ),
      goldenRule(
        'Classes rápidas',
        'Decore',
        [
          { label: 'Temephós', value: 'Organofosforado (larvicida clássico).', badge: 'ok' },
          { label: 'Piretroides', value: 'Deltametrina · cipermetrina.', badge: 'warn' },
          { label: 'Carbamato', value: 'Carbaril.', badge: 'warn' },
        ],
        'Leia a classe pedida no enunciado',
      ),
      dangerZone(
        'PEGADINHAS — inseticida',
        [
          {
            label: 'Letra A — deltametrina',
            detail: 'Deltametrina.',
            correct: 'Piretroide — não é o fosforado pedido.',
          },
          {
            label: 'Letra B — carbaril',
            detail: 'Carbaril.',
            correct: 'Carbamato — outra classe química.',
          },
          {
            label: 'Letra D — cipermetrina',
            detail: 'Cypermetrina.',
            correct: 'Piretroide — não fecha “fosforado”.',
          },
          {
            label: 'Letra E — carbaril B',
            detail: 'Carbaril B.',
            correct: 'Variação de carbamato — ainda não é Temephós.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “qualquer adulticida = larvicida fosforado”.',
            correct: 'Alvo e classe química são perguntas diferentes.',
          },
        ],
        'Trocar a classe do produto → distrator',
      ),
    ],
  },
  {
    file: 'ivin-geral-epidemiologia-e-vigilancia-epidemiologica-1777103597693-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'ACE deve conhecer fases evolutivas do Aedes para controlar fases aquáticas OU aladas — não só larva, só pupa ou só adulto.',
    sources: [{ ...AEDES, covers: ['Aedes aegypti', 'fases evolutivas', 'ACE', 'controle vetorial'] }],
    slides: [
      conceptMap(
        'Fases do Aedes — para quê?',
        [
          {
            label: 'Quem',
            detail: 'Agentes de combate a endemias precisam conhecer as fases evolutivas.',
            icon: 'UserCheck',
          },
          {
            label: 'Para quê',
            detail: 'Escolher a melhor estratégia de controle das fases aquáticas ou aladas.',
            icon: 'Target',
          },
          {
            label: 'Não estreitar',
            detail: 'Não limitar só à larva, só à pupa ou só ao adulto.',
            icon: 'Ban',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que “só larva” basta porque o criadouro é água.',
            icon: 'AlertTriangle',
          },
        ],
        'Aquática e alada no radar',
      ),
      logicFlow(
        [
          'Por que conhecer as fases evolutivas do Aedes.',
          'Eliminar estratégias só aquática, só alada, só pupa ou só larval.',
          'Manter: melhor estratégia para fases aquáticas ou aladas.',
          'Marcar A.',
          'Em similares: ciclo completo informa onde e como intervir.',
        ],
        'Aquática ou alada → letra A',
      ),
      goldenRule(
        'Ciclo → estratégia',
        'Decore',
        [
          { label: 'Conhecer fases', value: 'Orienta controle aquático e alado.', badge: 'ok' },
          { label: 'Erro', value: 'Fixar em uma fase só (larva/pupa/adulto).', badge: 'warn' },
        ],
        'Não controle “só um pedaço” do ciclo',
      ),
      dangerZone(
        'PEGADINHAS — fases',
        [
          {
            label: 'Letra B — só aquática',
            detail: 'Controle só da fase aquática.',
            correct: 'O enunciado pede estratégia para aquáticas ou aladas — não só uma.',
          },
          {
            label: 'Letra C — só alada',
            detail: 'Controle só da fase alada.',
            correct: 'Ignora o criadouro aquático — incompleto.',
          },
          {
            label: 'Letra D — só pupa',
            detail: 'Enfoque só na fase de pupa.',
            correct: 'Pupa é um recorte — não a estratégia completa.',
          },
          {
            label: 'Letra E — só larval',
            detail: 'Enfoque só na fase larval.',
            correct: 'Larva importa, mas o ACE age no ciclo inteiro.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “adulto voando = não há o que fazer no imóvel”.',
            correct: 'Fase alada também tem estratégia — e o criadouro segue prioridade.',
          },
        ],
        'Fixar em uma fase → distrator',
      ),
    ],
  },
  {
    file: 'ivin-geral-epidemiologia-e-vigilancia-epidemiologica-1777103597693-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Aedes: I — criadouros em água limpa e parada (V); II — água poluída/baixo O₂ (F, perfil de outro mosquito); III — só fêmeas transmitem (V). Só I e III.',
    sources: [{ ...AEDES, covers: ['Aedes aegypti', 'criadouros', 'água limpa', 'fêmeas transmissoras'] }],
    slides: [
      conceptMap(
        'Cartilha do Aedes — o que vale',
        [
          {
            label: 'I',
            detail: 'Criadouros em coleções de água limpa e parada — verdadeira.',
            icon: 'Droplets',
          },
          {
            label: 'II',
            detail: 'Água com baixo oxigênio e alta poluição — falsa para o Aedes.',
            icon: 'XCircle',
          },
          {
            label: 'III',
            detail: 'Só as fêmeas transmitem o vírus aos humanos — verdadeira.',
            icon: 'Bug',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar II misturando Aedes com mosquito de água suja.',
            icon: 'AlertTriangle',
          },
        ],
        'Água limpa + fêmea = I e III',
      ),
      logicFlow(
        [
          'I — água limpa e parada → Verdadeira.',
          'II — água poluída/baixo O₂ → Falsa.',
          'III — só fêmeas transmissoras → Verdadeira.',
          'Correto: apenas I e III.',
          'Marcar C.',
          'Em similares: Aedes ≠ criadouro de água suja típico.',
        ],
        'Apenas I e III → letra C',
      ),
      goldenRule(
        'Gabarito da cartilha',
        'Decore',
        [
          { label: 'I', value: 'V — água limpa e parada.', badge: 'ok' },
          { label: 'II', value: 'F — poluição/baixo O₂ não é o perfil do Aedes.', badge: 'warn' },
          { label: 'III', value: 'V — fêmea transmite.', badge: 'ok' },
        ],
        'Só I e III na educação em saúde',
      ),
      dangerZone(
        'PEGADINHAS — cartilha',
        [
          {
            label: 'Letra A — todas',
            detail: 'I, II e III.',
            correct: 'II é falsa — não marque as três.',
          },
          {
            label: 'Letra B — I e II',
            detail: 'Apenas I e II.',
            correct: 'Carrega II falsa e perde a III verdadeira.',
          },
          {
            label: 'Letra D — II e III',
            detail: 'Apenas II e III.',
            correct: 'Inclui II falsa e perde a I verdadeira.',
          },
          {
            label: 'Letra E — só III',
            detail: 'Apenas III.',
            correct: 'I também está correta.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “macho também inocula o vírus da dengue”.',
            correct: 'Transmissão ao humano é pela fêmea hematófaga.',
          },
        ],
        'Misturar Aedes com água suja → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g21',
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
