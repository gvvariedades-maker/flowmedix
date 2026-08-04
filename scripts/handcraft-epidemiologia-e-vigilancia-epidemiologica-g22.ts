/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g22 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g22.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g22';
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
  id: 'portaria-204-2016-notificacao',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Portaria MS nº 204/2016 — Lista Nacional de Notificação Compulsória',
  year: 2016,
  url: 'https://www.gov.br/saude/pt-br',
};
const PRINCIPIOS = {
  id: 'modulo-principios-epidemiologia-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Princípios de epidemiologia — inquérito e modelos',
  year: 2010,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/modulo_principios_epidemiologia_2.pdf',
};
const OPAS = {
  id: 'opas-indicadores-saude',
  tier: 'B' as const,
  issuer: 'Organização Pan-Americana da Saúde',
  title: 'Indicadores de saúde — mortalidade e demais grupos',
  year: 2018,
  url: 'https://www.paho.org/',
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
    file: 'legalle-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563853014-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Notificação: comunicação de doença/agravo à autoridade sanitária por profissional ou cidadão, para medidas de intervenção.',
    sources: [{ ...GUIA, covers: ['notificação', 'autoridade sanitária', 'agravo'] }],
    slides: [
      conceptMap(
        'Comunicar o agravo à autoridade = ?',
        [
          {
            label: 'Ato',
            detail: 'Comunicação da ocorrência de doença ou agravo à saúde.',
            icon: 'Bell',
          },
          {
            label: 'Quem',
            detail: 'Profissionais de saúde ou qualquer cidadão.',
            icon: 'Users',
          },
          {
            label: 'Para quê',
            detail: 'Autoridade sanitária adotar medidas de intervenção pertinentes.',
            icon: 'Shield',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar notificação por “listagem” ou “apontamento”.',
            icon: 'AlertTriangle',
          },
        ],
        'Comunicar para intervir = notificação',
      ),
      logicFlow(
        [
          'Definir o termo da comunicação à autoridade sanitária.',
          'Eliminar verificação, apontamento e listagem.',
          'Manter notificação.',
          'Marcar B.',
          'Em similares: notificar = comunicar agravo para ação.',
        ],
        'Notificação → letra B',
      ),
      goldenRule(
        'Notificação em uma linha',
        'Decore',
        [
          { label: 'É', value: 'Comunicar doença/agravo à autoridade sanitária.', badge: 'ok' },
          { label: 'Quem', value: 'Profissional ou cidadão.', badge: 'ok' },
          { label: 'Fim', value: 'Medidas de intervenção.', badge: 'ok' },
        ],
        'Sem comunicação não há intervenção a tempo',
      ),
      dangerZone(
        'PEGADINHAS — termo',
        [
          {
            label: 'Letra A — verificação',
            detail: 'Verificação.',
            correct: 'Verificar não nomeia o ato de comunicar à autoridade.',
          },
          {
            label: 'Letra C — apontamento',
            detail: 'Apontamento.',
            correct: 'Não é o termo técnico da vigilância.',
          },
          {
            label: 'Letra D — listagem',
            detail: 'Listagem.',
            correct: 'Lista é inventário — não a comunicação do caso.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só o médico pode notificar”.',
            correct: 'Profissional de saúde ou qualquer cidadão podem comunicar.',
          },
        ],
        'Trocar o nome do ato → distrator',
      ),
    ],
  },
  {
    file: 'legalle-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563858390-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Portaria 204/2016: casos de dengue (exceto óbitos) = notificação semanal — não imediata de horas nem mensal.',
    exam_vs_current:
      'Slides ensinam a chave da Portaria 204/16 citada na prova (casos sem óbito = semanal). Conferir lista vigente se o prazo de dengue mudar.',
    sources: [{ ...LISTA, covers: ['dengue', 'notificação semanal', 'Portaria 204/2016'] }],
    slides: [
      conceptMap(
        'Dengue (sem óbito) — qual prazo?',
        [
          {
            label: 'Norma',
            detail: 'Portaria nº 204/2016 — Lista Nacional de Notificação Compulsória.',
            icon: 'FileText',
          },
          {
            label: 'Recorte',
            detail: 'Casos de dengue, não incluindo os óbitos.',
            icon: 'Filter',
          },
          {
            label: 'Periodicidade',
            detail: 'Notificação semanal.',
            icon: 'Calendar',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Tratar todo caso de dengue como imediato em horas.',
            icon: 'AlertTriangle',
          },
        ],
        'Caso de dengue (sem óbito) = semanal',
      ),
      logicFlow(
        [
          'Prazo dos casos de dengue sem óbito na Portaria 204/16.',
          'Eliminar imediata em poucas horas e mensal.',
          'Manter semanal.',
          'Marcar C.',
          'Em similares: leia se a prova exclui óbitos — o relógio muda.',
        ],
        'Semanal → letra C',
      ),
      goldenRule(
        'Dengue × relógio',
        'Decore',
        [
          { label: 'Casos (sem óbito)', value: 'Notificação semanal (Portaria 204/16).', badge: 'ok' },
          { label: 'Não nesta chave', value: 'Imediata em horas · mensal.', badge: 'warn' },
        ],
        'Óbito fora do enunciado = semanal',
      ),
      dangerZone(
        'PEGADINHAS — prazo dengue',
        [
          {
            label: 'Letra A — poucas horas',
            detail: 'Imediata em até 2 horas.',
            correct: 'Não é o prazo dos casos de dengue sem óbito nesta portaria.',
          },
          {
            label: 'Letra B — 24 h',
            detail: 'Imediata em até 24 horas.',
            correct: 'Casos (sem óbito) são semanais — não esse imediato.',
          },
          {
            label: 'Letra D — mensal',
            detail: 'Mensal.',
            correct: 'Mensal é mais lento que o prazo semanal da chave.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “óbito por dengue = mesmo prazo do caso leve”.',
            correct: 'Óbito pode ter fluxo mais urgente — leia o recorte da questão.',
          },
        ],
        'Acelerar o caso sem óbito → distrator',
      ),
    ],
  },
  {
    file: 'lj-assessoria-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563784564-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Modelo sanitarista: campanhas, programas especiais e vigilâncias — vacinação, controle de epidemias e erradicação de endemias.',
    sources: [{ ...PRINCIPIOS, covers: ['modelo sanitarista', 'campanhas', 'vigilância', 'vacinação'] }],
    slides: [
      conceptMap(
        'Campanhas + vigilâncias = qual modelo?',
        [
          {
            label: 'Composição',
            detail: 'Campanhas de saúde, programas especiais e vigilâncias.',
            icon: 'Flag',
          },
          {
            label: 'Exemplos',
            detail: 'Vacinação, controle de epidemias e erradicação de endemias.',
            icon: 'Syringe',
          },
          {
            label: 'Nome',
            detail: 'Modelo sanitarista.',
            icon: 'Building2',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Confundir com atenção gerenciada ou “propostas alternativas”.',
            icon: 'AlertTriangle',
          },
        ],
        'Sanitarista = campanha + programa + vigilância',
      ),
      logicFlow(
        [
          'Identificar o modelo assistencial descrito.',
          'Eliminar preventivo genérico, hegemônicos e atenção gerenciada.',
          'Eliminar propostas alternativas.',
          'Manter modelo sanitarista.',
          'Marcar D.',
          'Em similares: vacina + epidemia + endemia no texto → sanitarista.',
        ],
        'Sanitarista → letra D',
      ),
      goldenRule(
        'Modelo sanitarista',
        'Decore',
        [
          { label: 'Peças', value: 'Campanhas · programas especiais · vigilâncias.', badge: 'ok' },
          { label: 'Exemplos', value: 'Vacinação · epidemias · endemias.', badge: 'ok' },
        ],
        'Três peças · três exemplos clássicos',
      ),
      dangerZone(
        'PEGADINHAS — modelos',
        [
          {
            label: 'Letra A — preventivo',
            detail: 'Modelo assistencial preventivo.',
            correct: 'Nome genérico — não fecha o pacote campanha/vigilância da prova.',
          },
          {
            label: 'Letra B — hegemônicos',
            detail: 'Modelos hegemônios.',
            correct: 'Categoria ampla — não é o modelo descrito.',
          },
          {
            label: 'Letra C — gerenciada',
            detail: 'Modelo da atenção gerenciada.',
            correct: 'Gestão de cuidado/custo — outro arranjo.',
          },
          {
            label: 'Letra E — alternativas',
            detail: 'Propostas alternativas.',
            correct: 'Não nomeia o modelo sanitarista clássico.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “sanitarista = só hospital terciário”.',
            correct: 'O núcleo é campanha/programa/vigilância no território.',
          },
        ],
        'Trocar o nome do modelo → distrator',
      ),
    ],
  },
  {
    file: 'metrocapital-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563814158-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'NÃO é notificação compulsória imediata nesta chave: doença aguda pelo vírus Zika. Botulismo, cólera, varíola e febre de Lassa são imediatas.',
    sources: [{ ...LISTA, covers: ['notificação imediata', 'Zika', 'botulismo', 'cólera', 'varíola'] }],
    slides: [
      conceptMap(
        'Imediata — qual NÃO entra?',
        [
          {
            label: 'Comando',
            detail: 'Doença/agravo que NÃO é de notificação compulsória imediata.',
            icon: 'Search',
          },
          {
            label: 'Imediatas',
            detail: 'Botulismo, cólera, varíola e febre de Lassa (Lassae).',
            icon: 'Zap',
          },
          {
            label: 'Fora do bolso',
            detail: 'Doença aguda pelo vírus Zika — não é imediata nesta chave.',
            icon: 'Calendar',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Meter Zika no imediato só porque é arbovírus compulsório.',
            icon: 'AlertTriangle',
          },
        ],
        'Compulsória ≠ imediata',
      ),
      logicFlow(
        [
          'Qual NÃO é de notificação compulsória imediata.',
          'Validar botulismo, cólera, varíola e Lassa como imediatas.',
          'Isolar doença aguda pelo vírus Zika.',
          'Marcar E.',
          'Em similares: leia o relógio — imediata × outros prazos.',
        ],
        'Zika fora do imediato → E',
      ),
      goldenRule(
        'Relógio imediato',
        'Decore',
        [
          { label: 'Imediata', value: 'Botulismo · cólera · varíola · Lassa.', badge: 'ok' },
          { label: 'NÃO imediata (chave)', value: 'Doença aguda pelo vírus Zika.', badge: 'warn' },
        ],
        'Zika não fecha o bolso imediato aqui',
      ),
      dangerZone(
        'PEGADINHAS — imediata',
        [
          {
            label: 'Letra A — botulismo',
            detail: 'Botulismo.',
            correct: 'É imediata típica — não é a que “não apresenta”.',
          },
          {
            label: 'Letra B — cólera',
            detail: 'Cólera.',
            correct: 'Cólera é NCI clássica — não é a exceção pedida.',
          },
          {
            label: 'Letra C — varíola',
            detail: 'Varíola.',
            correct: 'Entra no imediato — não é a resposta.',
          },
          {
            label: 'Letra D — Lassa',
            detail: 'Lassae (febre de Lassa).',
            correct: 'É imediata — não é a que fica de fora.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “toda arbovirose = mesmo prazo da cólera”.',
            correct: 'Prazos diferem — Zika aguda não é o imediato desta chave.',
          },
        ],
        'Empurrar Zika para o imediato → distrator',
      ),
    ],
  },
  {
    file: 'metrocapital-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563814158-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Inquérito epidemiológico: estudo seccional amostral quando dados são inadequados (notificação deficiente, mudança de comportamento, vacinas, controle, agravos inusitados).',
    sources: [{ ...PRINCIPIOS, covers: ['inquérito epidemiológico', 'estudo seccional', 'amostragem'] }],
    slides: [
      conceptMap(
        'Estudo seccional amostral = ?',
        [
          {
            label: 'Formato',
            detail: 'Estudo seccional, em geral amostral, quando informações existentes não bastam.',
            icon: 'ClipboardList',
          },
          {
            label: 'Motivos',
            detail: 'Notificação deficiente, mudança epidemiológica, coberturas/eficácia vacinal, controle de programa, agravo inusitado.',
            icon: 'Search',
          },
          {
            label: 'Nome',
            detail: 'Inquérito epidemiológico.',
            icon: 'BookOpen',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar por bloqueio epidemiológico ou evento sentinela.',
            icon: 'AlertTriangle',
          },
        ],
        'Seccional amostral = inquérito',
      ),
      logicFlow(
        [
          'Nomear o estudo seccional amostral descrito.',
          'Eliminar levantamento genérico, evento sentinela e bloqueio.',
          'Eliminar “controle de agravos” como nome do estudo.',
          'Manter inquérito epidemiológico.',
          'Marcar A.',
          'Em similares: seccional + amostra + lacuna de dado = inquérito.',
        ],
        'Inquérito → letra A',
      ),
      goldenRule(
        'Inquérito',
        'Decore',
        [
          { label: 'É', value: 'Estudo seccional amostral por lacuna de informação.', badge: 'ok' },
          { label: 'Não é', value: 'Bloqueio · sentinela · só “controle”.', badge: 'warn' },
        ],
        'Quando o sistema não informa, faz-se inquérito',
      ),
      dangerZone(
        'PEGADINHAS — estudo',
        [
          {
            label: 'Letra B — levantamento',
            detail: 'Levantamento epidemiológico.',
            correct: 'Termo vago — a prova nomeia inquérito seccional amostral.',
          },
          {
            label: 'Letra C — sentinela',
            detail: 'Evento sentinela.',
            correct: 'Sentinela é outro desenho de vigilância — não este estudo.',
          },
          {
            label: 'Letra D — bloqueio',
            detail: 'Bloqueio epidemiológico.',
            correct: 'Bloqueio é ação de controle — não o estudo seccional.',
          },
          {
            label: 'Letra E — controle',
            detail: 'Controle de agravos.',
            correct: 'É finalidade possível — não o nome do estudo.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “inquérito = só censo de 100% da cidade”.',
            correct: 'Em geral é amostral — não precisa ser censo total.',
          },
        ],
        'Trocar inquérito por ação/sentinela → distrator',
      ),
    ],
  },
  {
    file: 'ms-sarmento-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Reemergente: doença conhecida, esteve controlada e voltou (ex.: dengue). Covid-19/Ebola = emergentes; pneumonia não fecha o conceito.',
    sources: [{ ...GUIA, covers: ['doenças reemergentes', 'dengue', 'emergentes'] }],
    slides: [
      conceptMap(
        'Doença reemergente — exemplo',
        [
          {
            label: 'Conceito',
            detail: 'Conhecida há tempo, esteve controlada e retornou causando preocupação.',
            icon: 'RefreshCw',
          },
          {
            label: 'Exemplo',
            detail: 'Dengue — reaparece com força e desafia a vigilância.',
            icon: 'Bug',
          },
          {
            label: 'Não é',
            detail: 'Covid-19 e Ebola como “novas” emergentes; pneumonia genérica.',
            icon: 'XCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar Covid-19 porque “voltou em ondas”.',
            icon: 'AlertTriangle',
          },
        ],
        'Conhecida + voltou = reemergente',
      ),
      logicFlow(
        [
          'Qual alternativa representa doença reemergente.',
          'Eliminar Covid-19 e Ebola (perfil emergente/novo).',
          'Eliminar pneumonia genérica.',
          'Manter dengue.',
          'Marcar C.',
          'Em similares: reemergente = velha conhecida que retorna.',
        ],
        'Dengue → letra C',
      ),
      goldenRule(
        'Emergente × reemergente',
        'Decore',
        [
          { label: 'Reemergente', value: 'Conhecida · controlada · voltou (ex.: dengue).', badge: 'ok' },
          { label: 'Emergente', value: 'Nova ou pouco conhecida (ex.: Covid-19, Ebola).', badge: 'warn' },
        ],
        'Voltar ≠ aparecer pela primeira vez',
      ),
      dangerZone(
        'PEGADINHAS — reemergente',
        [
          {
            label: 'Letra A — Covid-19',
            detail: 'Covid-19.',
            correct: 'Perfil de doença emergente — não o exemplo clássico de reemergente.',
          },
          {
            label: 'Letra B — Ebola',
            detail: 'Ebola.',
            correct: 'Tratada como emergente/surtos novos — não a chave aqui.',
          },
          {
            label: 'Letra D — pneumonia',
            detail: 'Pneumonia.',
            correct: 'Genérica demais — não ilustra reemergência nesta prova.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “reemergente = nunca existiu no país”.',
            correct: 'Reemergente pressupõe história prévia de controle.',
          },
        ],
        'Trocar reemergente por emergente → distrator',
      ),
    ],
  },
  {
    file: 'ms-sarmento-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563768972-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Definição correta = VE (determinantes → prevenção/controle). A/B/C trocam rótulos: VisA, hospitalar/trabalhador e ambiental com textos embaralhados.',
    sources: [{ ...GUIA, covers: ['vigilância epidemiológica', 'vigilância sanitária', 'ambiental', 'trabalhador'] }],
    slides: [
      conceptMap(
        'Qual definição está correta?',
        [
          {
            label: 'Guarda-chuva',
            detail: 'Vigilância em saúde: processo sistemático de coleta, consolidação e disseminação de dados para planejamento e implementação de ações.',
            icon: 'Layers',
          },
          {
            label: 'VE correta',
            detail: 'Conhecer/detectar mudanças em determinantes e condicionantes e recomendar prevenção/controle de doenças ou agravos.',
            icon: 'Activity',
          },
          {
            label: 'Armadilha A/C',
            detail: 'Textos de vigilância sanitária/ambiental com rótulos trocados (bens, serviços, meio ambiente).',
            icon: 'GitCompare',
          },
          {
            label: 'Armadilha B',
            detail: '“Vigilância hospitalar” com texto de promoção/proteção da saúde dos trabalhadores e condições de trabalho.',
            icon: 'XCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Escolher pelo nome familiar sem ler o conteúdo do parágrafo.',
            icon: 'AlertTriangle',
          },
        ],
        'Conteúdo de VE com rótulo certo',
      ),
      logicFlow(
        [
          'Assinale a alternativa correta sobre o tema da vigilância em saúde.',
          'Eliminar A: rótulo sanitária com texto inadequado de determinantes ambientais.',
          'Eliminar B: hospitalar com conteúdo de recuperação/reabilitação do trabalhador.',
          'Eliminar C: ambiental com texto de eliminar riscos em produção/circulação de bens e serviços.',
          'Manter D: definição clássica de vigilância epidemiológica.',
          'Marcar D.',
          'Em similares: bata o texto no rótulo — não o contrário.',
        ],
        'Definição de VE → letra D',
      ),
      goldenRule(
        'Rótulo = conteúdo',
        'Decore',
        [
          { label: 'VE', value: 'Determinantes · prevenção/controle de doenças ou agravos.', badge: 'ok' },
          { label: 'VisA', value: 'Riscos de bens, serviços e ambiente de interesse sanitário.', badge: 'warn' },
          { label: 'Trabalhador', value: 'Riscos e agravos das condições de trabalho.', badge: 'warn' },
          { label: 'Vigilância em saúde', value: 'Coleta · consolidação · disseminação → ações.', badge: 'ok' },
        ],
        'Não aceite definição com nome trocado',
      ),
      dangerZone(
        'PEGADINHAS — definições',
        [
          {
            label: 'Letra A — “sanitária”',
            detail: 'VisA descrita como detectar determinantes do ambiente na saúde.',
            correct: 'Rótulo e texto não fecham a VisA clássica nesta chave.',
          },
          {
            label: 'Letra B — “hospitalar”',
            detail: 'Texto de saúde do trabalhador sob rótulo hospitalar.',
            correct: 'Mistura hospitalar com vigilância do trabalhador.',
          },
          {
            label: 'Letra C — “ambiental”',
            detail: 'Texto de intervir em bens/serviços (VisA) sob rótulo ambiental.',
            correct: 'Conteúdo de VisA com nome ambiental — incorreto.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “todas as vigilâncias têm a mesma definição”.',
            correct: 'Cada braço tem núcleo próprio — leia finalidade e objeto.',
          },
        ],
        'Embaralhar rótulo e texto → distrator',
      ),
    ],
  },
  {
    file: 'ms-sarmento-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563778577-8.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Além da mortalidade, indicadores OPAS/MS: morbidade, nutrição, demográficos, socioeconômicos, saúde ambiental e serviços de saúde — não faturamento/giro de leitos.',
    sources: [{ ...OPAS, covers: ['indicadores de saúde', 'mortalidade', 'morbidade', 'OPAS'] }],
    slides: [
      conceptMap(
        'Indicadores além da mortalidade',
        [
          {
            label: 'Âncora',
            detail: 'OPAS/MS: mortalidade é um parâmetro; há outros grupos principais.',
            icon: 'BarChart3',
          },
          {
            label: 'Pacote',
            detail: 'Morbidade, nutrição, demográficos, socioeconômicos, saúde ambiental e serviços de saúde.',
            icon: 'Layers',
          },
          {
            label: 'Fora',
            detail: 'Faturamento, giro/ocupação de leitos, rentabilidade, “experiência do paciente”.',
            icon: 'XCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Colar indicadores hospitalares de gestão no pacote OPAS.',
            icon: 'AlertTriangle',
          },
        ],
        'Saúde populacional — não só leito',
      ),
      logicFlow(
        [
          'Principais indicadores além da mortalidade.',
          'Eliminar pacotes com faturamento, giro de leitos e rentabilidade.',
          'Eliminar experiência do paciente / taxa de ocupação como núcleo OPAS.',
          'Manter: morbidade, nutrição, demografia, socioeconômico, ambiental, serviços.',
          'Marcar B.',
          'Em similares: indicador de saúde pública ≠ KPI financeiro hospitalar.',
        ],
        'Pacote OPAS → letra B',
      ),
      goldenRule(
        'Grupos de indicadores',
        'Decore',
        [
          { label: 'Base', value: 'Mortalidade + morbidade.', badge: 'ok' },
          { label: 'Contexto', value: 'Nutrição · demografia · socioeconômico.', badge: 'ok' },
          { label: 'Sistema/meio', value: 'Saúde ambiental · serviços de saúde.', badge: 'ok' },
        ],
        'Sem faturamento no pacote OPAS',
      ),
      dangerZone(
        'PEGADINHAS — indicadores',
        [
          {
            label: 'Letra A — faturamento/leitos',
            detail: 'Inclui faturamento, produtividade clínica e giro de leitos.',
            correct: 'KPIs hospitalares — não o pacote OPAS desta chave.',
          },
          {
            label: 'Letra C — rentabilidade',
            detail: 'Inclui rentabilidade e experiência do paciente.',
            correct: 'Mistura gestão/financeiro — fora do conjunto pedido.',
          },
          {
            label: 'Letra D — ocupação',
            detail: 'Taxa de ocupação e produtividade clínica.',
            correct: 'Indicadores de leito — não substituem o pacote populacional.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “único indicador que importa = mortalidade”.',
            correct: 'OPAS trabalha um conjunto — mortalidade é um deles.',
          },
        ],
        'Trocar saúde pública por KPI de hospital → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g22',
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
