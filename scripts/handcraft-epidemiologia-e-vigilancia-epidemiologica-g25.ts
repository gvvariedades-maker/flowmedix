/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g25 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g25.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g25';
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
  id: 'portaria-consolidacao-4-2017',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Portaria de Consolidação nº 4/2017 — notificação compulsória',
  year: 2017,
  url: 'https://www.gov.br/saude/pt-br',
};
const PRINCIPIOS = {
  id: 'modulo-principios-epidemiologia-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Princípios de epidemiologia — incidência, prevalência e morbidade',
  year: 2010,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/modulo_principios_epidemiologia_2.pdf',
};
const ROUQ = {
  id: 'rouquayrol-goldbaum-epidemiologia',
  tier: 'B' as const,
  issuer: 'Rouquayrol & Goldbaum',
  title: 'Epidemiologia — prevenção, controle ou erradicação; indicadores para gestão',
  year: 2003,
  url: 'https://bvsms.saude.gov.br/',
};
const AEDES = {
  id: 'controle-aedes-pesquisa-larvaria-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Controle de vetores — visita domiciliar e pesquisa larvária',
  year: 2009,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/',
};
const PECON = {
  id: 'acidentes-peconhentos-sinan-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Acidentes por animais peçonhentos — critérios de notificação (SINAN)',
  year: 2019,
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
    file: 'selecon-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563774121-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Peçonhentos (SINAN): notificar com evidências clínicas de envenenamento específicas do animal — mesmo sem identificar o animal. Só suspeita ou exigir ID do animal = pegadinha.',
    sources: [{ ...PECON, covers: ['peçonhentos', 'SINAN', 'envenenamento', 'notificação'] }],
    slides: [
      conceptMap(
        'Peçonhentos no SINAN — quando notificar?',
        [
          {
            label: 'Sistema',
            detail: 'SINAN — Sistema de Informação de Agravos de Notificação.',
            icon: 'Database',
          },
          {
            label: 'Critério',
            detail: 'Evidências clínicas de envenenamento, específicas para cada tipo de animal.',
            icon: 'Stethoscope',
          },
          {
            label: 'Identificação',
            detail: 'Notifica independentemente de o animal causador ter sido identificado ou não.',
            icon: 'Search',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Exigir identificação do animal ou bastar “só suspeita”.',
            icon: 'AlertTriangle',
          },
        ],
        'Clínica específica — com ou sem ID do animal',
      ),
      logicFlow(
        [
          'Pedido: critério SINAN para acidentes por animais peçonhentos.',
          'Eliminar “só se o animal for identificado”.',
          'Eliminar “só suspeita” sem evidências clínicas.',
          'Eliminar misturar suspeita + evidências como se fossem iguais.',
          'Manter evidências clínicas específicas, com ou sem ID do animal.',
          'Marcar C.',
          'Em similares: peçonhento = clínica de envenenamento, ID opcional.',
        ],
        'Evidência clínica ± ID → letra C',
      ),
      goldenRule(
        'Critério peçonhento',
        'Decore',
        [
          { label: 'Sim', value: 'Evidências clínicas específicas do tipo de animal.', badge: 'ok' },
          { label: 'ID do animal', value: 'Não é pré-requisito da notificação.', badge: 'ok' },
          { label: 'Só suspeita', value: 'Não fecha o critério desta chave.', badge: 'warn' },
        ],
        'Clínica guia — identificação não trava',
      ),
      dangerZone(
        'PEGADINHAS — peçonhentos',
        [
          {
            label: 'Letra A — só com ID',
            detail: 'Evidências clínicas somente se o animal puder ser identificado.',
            correct: 'ID não é condição — notifica mesmo sem identificar o animal.',
          },
          {
            label: 'Letra B — só suspeita',
            detail: 'Suspeita de envenenamento, independentemente do animal.',
            correct: 'A chave pede evidências clínicas — não só suspeita.',
          },
          {
            label: 'Letra D — suspeita e evidências',
            detail: 'Suspeita e evidências clínicas juntas como critério único.',
            correct: 'Mistura conceitos; o eixo correto é evidência clínica (± ID).',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “sem animal identificado = não notifica”.',
            correct: 'Sem ID ainda notifica se há evidência clínica de envenenamento.',
          },
        ],
        'Exigir ID ou só suspeita → distrator',
      ),
    ],
  },
  {
    file: 'selecon-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563774121-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Óbito com suspeita de Zika: notificação imediata (até 24 h) ao MS, SES e SMS. Não mensal/semanal; não 36 h.',
    sources: [
      { ...LISTA, covers: ['Zika', 'óbito', 'notificação imediata', '24 horas'] },
      { ...GUIA, covers: ['Zika', 'vigilância'] },
    ],
    slides: [
      conceptMap(
        'Óbito suspeito de Zika — como notificar?',
        [
          {
            label: 'Evento',
            detail: 'Casos de óbito com suspeita de doença pelo vírus da Zika.',
            icon: 'AlertOctagon',
          },
          {
            label: 'Ritmo',
            detail: 'Notificação imediata — até 24 horas.',
            icon: 'Clock',
          },
          {
            label: 'Destinos',
            detail: 'Ministério da Saúde, Secretaria Estadual e Secretaria Municipal de Saúde.',
            icon: 'Building2',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar 24 h por prazo alongado ou cair no ritmo mensal/semanal.',
            icon: 'AlertTriangle',
          },
        ],
        'Óbito Zika → imediato 24 h (MS/SES/SMS)',
      ),
      logicFlow(
        [
          'Evento: óbito com suspeita de Zika na lista compulsória.',
          'Eliminar mensal e semanal.',
          'Eliminar “imediato” com prazo alongado além de 24 h.',
          'Manter imediato até 24 h para MS, SES e SMS.',
          'Marcar C.',
          'Em similares: óbito Zika = imediato 24 h tripartite.',
        ],
        '24 h MS/SES/SMS → letra C',
      ),
      goldenRule(
        'Óbito Zika',
        'Decore',
        [
          { label: 'Prazo', value: 'Imediatamente — até 24 horas.', badge: 'ok' },
          { label: 'Para quem', value: 'MS + SES + SMS.', badge: 'ok' },
          { label: 'Não', value: 'Não alongar o prazo; não mensal/semanal.', badge: 'warn' },
        ],
        '24 h tripartite — sem alongar prazo',
      ),
      dangerZone(
        'PEGADINHAS — Zika óbito',
        [
          {
            label: 'Letra A — mensal',
            detail: 'Ritmo mensal para SES e SMS.',
            correct: 'Óbito Zika é imediato — não cabe ritmo mensal.',
          },
          {
            label: 'Letra B — semanal',
            detail: 'Ritmo semanal para SES e Anvisa.',
            correct: 'Errado o ritmo e o destino (não é o pacote MS/SES/SMS em 24 h).',
          },
          {
            label: 'Letra D — prazo alongado',
            detail: 'Imediato com prazo maior que um dia para MS, SES e SMS.',
            correct: 'Prazo correto é até 24 horas — alongar o prazo é distrator.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “Zika óbito = só SMS”.',
            correct: 'Comunica MS, SES e SMS no imediato.',
          },
        ],
        'Trocar 24 h ou destinos → distrator',
      ),
    ],
  },
  {
    file: 'selecon-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563774121-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Vigilância epidemiológica: observação sistemática e ativa de casos suspeitos/confirmados de doenças transmissíveis e contatos. Não confundir com sanitária, saúde do trabalhador ou acreditação.',
    sources: [{ ...GUIA, covers: ['vigilância epidemiológica', 'doenças transmissíveis', 'contatos'] }],
    slides: [
      conceptMap(
        'Qual vigilância controla transmissíveis?',
        [
          {
            label: 'Objeto',
            detail: 'Controle das doenças transmissíveis.',
            icon: 'Bug',
          },
          {
            label: 'Método',
            detail: 'Observação sistemática e ativa de casos suspeitos ou confirmados e de seus contatos.',
            icon: 'Eye',
          },
          {
            label: 'Nome',
            detail: 'Vigilância epidemiológica.',
            icon: 'Radar',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar por vigilância sanitária ou saúde do trabalhador.',
            icon: 'AlertTriangle',
          },
        ],
        'Casos + contatos = epidemiológica',
      ),
      logicFlow(
        [
          'Definição: observação ativa de casos e contatos de transmissíveis.',
          'Eliminar vigilância sanitária (produtos/serviços/ambiente).',
          'Eliminar saúde do trabalhador e acreditação hospitalar.',
          'Manter vigilância epidemiológica.',
          'Marcar D.',
          'Em similares: casos/contatos de transmissíveis = epidemiológica.',
        ],
        'Epidemiológica → letra D',
      ),
      goldenRule(
        'Quatro nomes',
        'Decore',
        [
          { label: 'Epidemiológica', value: 'Casos, contatos e agravos na população.', badge: 'ok' },
          { label: 'Sanitária', value: 'Riscos de produtos, serviços e ambiente.', badge: 'warn' },
          { label: 'Trabalhador / acreditação', value: 'Outros eixos — não este controle.', badge: 'warn' },
        ],
        'Transmissíveis ≠ sanitária',
      ),
      dangerZone(
        'PEGADINHAS — tipo de vigilância',
        [
          {
            label: 'Letra A — sanitária',
            detail: 'Vigilância sanitária.',
            correct: 'Foca produtos/serviços/ambiente — não o pacote casos/contatos.',
          },
          {
            label: 'Letra B — trabalhador',
            detail: 'Saúde do trabalhador.',
            correct: 'Eixo ocupacional — não a definição de transmissíveis dada.',
          },
          {
            label: 'Letra C — acreditação',
            detail: 'Acreditação hospitalar.',
            correct: 'Qualidade hospitalar — não vigilância de casos/contatos.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “epidemiológica = só inspeção de alimentos”.',
            correct: 'Alimentos → sanitária; casos/contatos → epidemiológica.',
          },
        ],
        'Trocar epidemiológica por sanitária → distrator',
      ),
    ],
  },
  {
    file: 'selecon-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563800137-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Prevalência = medida de eventos existentes em uma população em determinado período. Incidência = novos; risco/causalidade = outros conceitos.',
    sources: [{ ...PRINCIPIOS, covers: ['prevalência', 'incidência', 'eventos existentes'] }],
    slides: [
      conceptMap(
        'Eventos existentes no período = ?',
        [
          {
            label: 'Pedido',
            detail: 'Medida de eventos existentes em uma população em determinado período.',
            icon: 'PieChart',
          },
          {
            label: 'Nome',
            detail: 'Prevalência.',
            icon: 'BarChart3',
          },
          {
            label: 'Não confundir',
            detail: 'Incidência fala de novos casos; risco e causalidade são outros eixos.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Ver “período” e marcar incidência automaticamente.',
            icon: 'AlertTriangle',
          },
        ],
        'Existentes no período = prevalência',
      ),
      logicFlow(
        [
          'Medida: eventos existentes na população em um período.',
          'Eliminar incidência (ênfase em novos).',
          'Eliminar risco e causalidade.',
          'Manter prevalência.',
          'Marcar D.',
          'Em similares: “existentes” + período/população = prevalência.',
        ],
        'Prevalência → letra D',
      ),
      goldenRule(
        'Existentes × novos',
        'Decore',
        [
          { label: 'Prevalência', value: 'Eventos existentes no período/população.', badge: 'ok' },
          { label: 'Incidência', value: 'Novos casos no período.', badge: 'warn' },
          { label: 'Risco / causalidade', value: 'Outros conceitos — não esta medida.', badge: 'warn' },
        ],
        'Existentes ≠ incidência',
      ),
      dangerZone(
        'PEGADINHAS — medida',
        [
          {
            label: 'Letra A — risco',
            detail: 'Risco.',
            correct: 'Não é a medida de estoque de eventos existentes.',
          },
          {
            label: 'Letra B — incidência',
            detail: 'Incidência.',
            correct: 'Fala de novos — a chave pede existentes.',
          },
          {
            label: 'Letra C — causalidade',
            detail: 'Causalidade.',
            correct: 'Eixo etiológico — não a medida populacional pedida.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “prevalência ignora a população”.',
            correct: 'Prevalência relaciona eventos à população no tempo.',
          },
        ],
        'Trocar existentes por novos → distrator',
      ),
    ],
  },
  {
    file: 'selecon-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563809836-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Morbidade: comportamento das doenças na população (prevalência + incidência). Não é mortalidade, letalidade, vigilância nem morbimortalidade.',
    sources: [{ ...PRINCIPIOS, covers: ['morbidade', 'prevalência', 'incidência'] }],
    slides: [
      conceptMap(
        'Prevalência + incidência = que noção?',
        [
          {
            label: 'Excerto',
            detail: 'Comportamento das doenças numa população exposta ao adoecimento.',
            icon: 'Activity',
          },
          {
            label: 'Índices',
            detail: 'Prevalência (o que existe) e incidência (novos casos) na área/período/população.',
            icon: 'BarChart3',
          },
          {
            label: 'Nome',
            detail: 'Morbidade.',
            icon: 'HeartPulse',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar mortalidade/letalidade porque “também fala de doença”.',
            icon: 'AlertTriangle',
          },
        ],
        'Adoecimento populacional = morbidade',
      ),
      logicFlow(
        [
          'Texto une prevalência e incidência na população.',
          'Eliminar mortalidade e letalidade (eixo óbito).',
          'Eliminar vigilância (ação) e morbimortalidade (pacote misto).',
          'Manter morbidade.',
          'Marcar B.',
          'Em similares: prevalência + incidência = morbidade.',
        ],
        'Morbidade → letra B',
      ),
      goldenRule(
        'Morbidade vs óbito',
        'Decore',
        [
          { label: 'Morbidade', value: 'Doenças na população (P + I).', badge: 'ok' },
          { label: 'Mortalidade / letalidade', value: 'Óbitos — outro eixo.', badge: 'warn' },
          { label: 'Vigilância', value: 'Ação de monitoramento — não o nome do índice.', badge: 'warn' },
        ],
        'Adoecer ≠ morrer neste excerto',
      ),
      dangerZone(
        'PEGADINHAS — noção',
        [
          {
            label: 'Letra A — mortalidade',
            detail: 'Mortalidade.',
            correct: 'Fala de óbitos — o texto descreve adoecimento (P+I).',
          },
          {
            label: 'Letra C — letalidade',
            detail: 'Letalidade.',
            correct: 'Óbitos entre doentes — não o comportamento geral das doenças.',
          },
          {
            label: 'Letra D — vigilância',
            detail: 'Vigilância.',
            correct: 'É processo/ação — não a noção dos índices P+I.',
          },
          {
            label: 'Letra E — morbimortalidade',
            detail: 'Morbimortalidade.',
            correct: 'Pacote misto; o excerto fecha em morbidade.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “incidência sozinha = mortalidade”.',
            correct: 'Incidência integra morbidade; mortalidade é óbito.',
          },
        ],
        'Trocar morbidade por óbito/vigilância → distrator',
      ),
    ],
  },
  {
    file: 'selecon-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563843512-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Rouquayrol/Goldbaum: epidemiologia propõe prevenção, controle ou erradicação; indicadores para planejamento, administração e avaliação das ações de saúde.',
    sources: [{ ...ROUQ, covers: ['epidemiologia', 'prevenção', 'controle', 'erradicação', 'indicadores'] }],
    slides: [
      conceptMap(
        'Epidemiologia propõe medidas de…',
        [
          {
            label: 'Ciência',
            detail: 'Estuda o processo saúde-doença em coletividades humanas.',
            icon: 'Users',
          },
          {
            label: 'Análise',
            detail: 'Distribuição e determinantes de doenças, danos e eventos de saúde coletiva.',
            icon: 'GitBranch',
          },
          {
            label: 'Proposta',
            detail: 'Prevenção, controle ou erradicação — com indicadores para gestão.',
            icon: 'Target',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar “prevenção” por “provisão/previsão” ou mudar o suporte da gestão.',
            icon: 'AlertTriangle',
          },
        ],
        'Prevenção · controle · erradicação',
      ),
      logicFlow(
        [
          'Definição Rouquayrol/Goldbaum: o que a epidemiologia busca propor.',
          'Eliminar “provisão” e eixos de educação/trabalhador fora do pacote.',
          'Eliminar “previsão/monitoramento/eliminação” com suporte à educação.',
          'Manter prevenção, controle ou erradicação + indicadores de gestão.',
          'Marcar D.',
          'Em similares: P-C-E + planejamento/administração/avaliação.',
        ],
        'Prevenção/controle/erradicação → letra D',
      ),
      goldenRule(
        'Tríade + uso',
        'Decore',
        [
          { label: 'Medidas', value: 'Prevenção, controle ou erradicação.', badge: 'ok' },
          { label: 'Indicadores', value: 'Suporte a planejamento, administração e avaliação.', badge: 'ok' },
          { label: 'Pegadinha verbal', value: 'Provisão ≠ prevenção; previsão ≠ prevenção.', badge: 'warn' },
        ],
        'P-C-E para ações de saúde',
      ),
      dangerZone(
        'PEGADINHAS — definição',
        [
          {
            label: 'Letra A — provisão',
            detail: 'Provisão, eliminação ou erradicação…',
            correct: '“Provisão” distorce; o eixo canônico é prevenção.',
          },
          {
            label: 'Letra B — sanitária/trabalhador',
            detail: 'Vigilância sanitária / erradicação de vetores / saúde do trabalhador.',
            correct: 'Desvia o escopo da definição geral de epidemiologia.',
          },
          {
            label: 'Letra C — previsão/educação',
            detail: 'Previsão, monitoramento e eliminação… ações de educação.',
            correct: 'Troca prevenção e troca o suporte (educação ≠ gestão de saúde).',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “epidemiologia só descreve, nunca propõe medidas”.',
            correct: 'Propõe prevenção/controle/erradicação com indicadores.',
          },
        ],
        'Trocar prevenção por provisão/previsão → distrator',
      ),
    ],
  },
  {
    file: 'unesc-enfermagem-atencao-basica-saude-da-familia-1778967504475-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Vetores: visita (agente+supervisor) para criadouros; campo gera índices; orientar residentes; pesca-larva amostra. Não negar educação nem índices.',
    sources: [{ ...AEDES, covers: ['visita domiciliar', 'criadouros', 'pesquisa larvária', 'índices entomológicos'] }],
    slides: [
      conceptMap(
        'Visita domiciliar e pesquisa larvária',
        [
          {
            label: 'Vigilância de vetores',
            detail: 'Visita domiciliar (agente e supervisor) verifica presença de criadouros.',
            icon: 'Home',
          },
          {
            label: 'Campo',
            detail: 'Dados de campo permitem estimar índices entomológicos.',
            icon: 'MapPin',
          },
          {
            label: 'Pesquisa',
            detail: 'Foco em formas imaturas nos depósitos — não “só adultos em todos”.',
            icon: 'Search',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Negar orientação ao residente ou negar o pesca-larva.',
            icon: 'AlertTriangle',
          },
        ],
        'Visita = criadouros + educação',
      ),
      logicFlow(
        [
          'Pergunta: alternativa correta sobre visita e pesquisa larvária.',
          'Eliminar “campo não estima índices”.',
          'Eliminar “só inspeção de adultos em todos os depósitos”.',
          'Eliminar “nunca orientar” e “nunca usar pesca-larva”.',
          'Manter: visita agente+supervisor essencial para criadouros.',
          'Marcar B.',
          'Em similares: visita domiciliar = eixo do controle de vetores.',
        ],
        'Visita para criadouros → letra B',
      ),
      goldenRule(
        'Visita correta',
        'Decore',
        [
          { label: 'Quem', value: 'Agente e supervisor na visita domiciliar.', badge: 'ok' },
          { label: 'O quê', value: 'Verificar criadouros e orientar residentes.', badge: 'ok' },
          { label: 'Campo', value: 'Gera índices entomológicos; pesca-larva amostra.', badge: 'ok' },
        ],
        'Visita educa e detecta criadouro',
      ),
      dangerZone(
        'PEGADINHAS — vetores',
        [
          {
            label: 'Letra A — sem índices',
            detail: 'Dados de campo não estimam índices entomológicos.',
            correct: 'Campo alimenta índices — a negação é falsa.',
          },
          {
            label: 'Letra C — só adultos',
            detail: 'Inspeção de formas adultas em todos os depósitos.',
            correct: 'Pesquisa larvária mira imaturos/criadouros — não esse enunciado.',
          },
          {
            label: 'Letra D — nunca orientar',
            detail: 'Nunca orientar residentes sobre eliminação/prevenção.',
            correct: 'Orientação faz parte da visita — “nunca” é falso.',
          },
          {
            label: 'Letra E — nunca pesca-larva',
            detail: 'Nunca usar pesca-larva para amostrar larvas/pupas.',
            correct: 'Pesca-larva é ferramenta válida de coleta amostral.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só o supervisor visita; agente não”.',
            correct: 'Agente e supervisor participam da vigilância de criadouros.',
          },
        ],
        'Negar visita/orientação/índices → distrator',
      ),
    ],
  },
  {
    file: 'unesc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563725570-6.json',
    family: 'vf',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Chave da prova TB: V (notifica em 24 h no SINAN), F (não só após lab), V (dados paciente/tratamento), F (não só resistência).',
    exam_vs_current:
      'Prova marca 1ª afirmativa V (TB em até 24 h). Na lista vigente, tuberculose costuma ser notificação semanal — slides ensinam a chave da prova.',
    sources: [
      { ...LISTA, covers: ['tuberculose', 'SINAN', 'notificação compulsória'] },
      { ...GUIA, covers: ['tuberculose', 'vigilância'] },
    ],
    slides: [
      conceptMap(
        'VF — notificação de tuberculose',
        [
          {
            label: 'Cenário',
            detail: 'Caso de tuberculose pulmonar na unidade — ação de notificação compulsória.',
            icon: 'ClipboardList',
          },
          {
            label: 'I e II',
            detail: 'I: prazo/SINAN. II: só após confirmação laboratorial.',
            icon: 'ListChecks',
          },
          {
            label: 'III e IV',
            detail: 'III: dados do paciente e do tratamento. IV: só resistência a medicamentos.',
            icon: 'Database',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Exigir lab (II) ou restringir a resistência (IV).',
            icon: 'AlertTriangle',
          },
        ],
        'TB: I–IV prazo · lab · dados · resistência',
      ),
      logicFlow(
        [
          'Julgar I–IV sobre notificação compulsória de tuberculose.',
          'I: notificar em até 24 h via SINAN — V (chave da prova).',
          'II: só após confirmação laboratorial — F.',
          'III: inclui dados do paciente e do tratamento — V.',
          'IV: obrigatória só na resistência — F.',
          'Sequência V, F, V, F → marcar B.',
          'Em similares: TB notifica sem esperar só resistência/lab.',
        ],
        'I–IV = V F V F → letra B',
      ),
      goldenRule(
        'I–IV julgamentos',
        'Decore',
        [
          { label: 'I · prazo/SINAN', value: 'V — notifica (chave: até 24 h).', badge: 'ok' },
          { label: 'II · só lab', value: 'F — não trava na confirmação laboratorial.', badge: 'warn' },
          { label: 'III · dados', value: 'V — paciente e tratamento na vigilância.', badge: 'ok' },
          { label: 'IV · só resistência', value: 'F — não restringe a MDR.', badge: 'warn' },
        ],
        'II e IV falsas — lab/MDR não liberam omitir',
      ),
      dangerZone(
        'PEGADINHAS — VF tuberculose',
        [
          {
            label: 'Letra A — V F V V',
            detail: 'Aceita IV (só resistência) como verdadeira.',
            correct: 'IV é falsa — TB compulsória não se limita à resistência.',
          },
          {
            label: 'Letra C — tudo V',
            detail: 'V, V, V, V.',
            correct: 'II e IV são falsas — lab prévio e “só MDR” caem.',
          },
          {
            label: 'Letra D — F F V V',
            detail: 'Nega I (prazo/SINAN) e aceita IV.',
            correct: 'I é V na chave; IV continua F.',
          },
          {
            label: 'Letra E — V F F F',
            detail: 'Nega III (dados do paciente/tratamento).',
            correct: 'III é V — dados alimentam a vigilância.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “TB só notifica após cultura positiva”.',
            correct: 'Não condicionar a notificação só ao laboratório (II).',
          },
        ],
        'Errar II ou IV no VF → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g25',
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
