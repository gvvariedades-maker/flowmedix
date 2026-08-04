/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g12 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g12.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g12';
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
  year: 2022,
  url: 'https://www.gov.br/saude/pt-br/composicao/svsa/notificacao-compulsoria',
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
    file: 'fundatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563843512-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Febre amarela = notificação compulsória imediata. HIV, hepatites, dengue (casos) e TB não fecham o bolso “imediata” nesta chave.',
    sources: [{ ...LISTA, covers: ['febre amarela', 'notificação imediata'] }],
    slides: [
      conceptMap(
        'Qual é imediata?',
        [
          { label: 'Compulsória', detail: 'Comunicação à autoridade sanitária para intervenção pertinente.', icon: 'Bell' },
          { label: 'Imediata', detail: 'Febre amarela — agravo de notificação imediata.', icon: 'Zap' },
          { label: 'Não imediata aqui', detail: 'HIV, hepatites virais, casos de dengue e tuberculose.', icon: 'Calendar' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar dengue porque “é arbovírus como FA”.', icon: 'AlertTriangle' },
        ],
        'Febre amarela = imediata',
      ),
      logicFlow(
        [
          'Comando: doença de notificação compulsória imediata.',
          'Eliminar HIV, hepatites virais, casos de dengue e tuberculose.',
          'Manter febre amarela.',
          'Marcar B.',
          'Em similares: FA/raiva/botulismo = imediata; dengue casos/TB = semanal.',
        ],
        'Febre amarela imediata → B',
      ),
      goldenRule(
        'Relógio da FA',
        'Decore',
        [
          { label: 'Imediata', value: 'Febre amarela.', badge: 'ok' },
          { label: 'Não nesta chave', value: 'HIV · hepatites · dengue casos · TB.', badge: 'warn' },
        ],
        'FA não espera a semana',
      ),
      dangerZone(
        'PEGADINHAS — imediata',
        [
          {
            label: 'Letra A — HIV',
            detail: 'HIV.',
            correct: 'HIV é compulsório, mas não é o exemplo de imediata desta chave.',
          },
          {
            label: 'Letra C — hepatites',
            detail: 'Hepatites virais.',
            correct: 'Hepatites não fecham o bolso imediato pedido aqui.',
          },
          {
            label: 'Letra D — dengue',
            detail: 'Casos de dengue.',
            correct: 'Casos de dengue costumam ser semanais — não a imediata cobrada.',
          },
          {
            label: 'Letra E — tuberculose',
            detail: 'Tuberculose.',
            correct: 'TB é semanal típica — não imediata nesta prova.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: óbito por dengue × casos de dengue.',
            correct: 'A forma do agravo pode mudar o relógio — leia o item.',
          },
        ],
        'Colar semanal no lugar de imediata → distrator',
      ),
    ],
  },
  {
    file: 'fundatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563853014-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Compulsórios: sífilis, coqueluche, HIV, leptospirose. NÃO: influenza (gripe sazonal comum) nesta chave.',
    sources: [{ ...LISTA, covers: ['sífilis', 'coqueluche', 'HIV', 'leptospirose', 'lista nacional'] }],
    slides: [
      conceptMap(
        'Compulsória — o que NÃO entra',
        [
          { label: 'Entram', detail: 'Sífilis, coqueluche, HIV e leptospirose.', icon: 'CheckCircle2' },
          { label: 'NÃO', detail: 'Influenza — não fecha a lista nesta chave.', icon: 'XCircle' },
          { label: 'Lógica', detail: 'Nem toda doença infecciosa “famosa” é compulsória nacional.', icon: 'Filter' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Achar que gripe = sempre notificável como as outras.', icon: 'AlertTriangle' },
        ],
        'Influenza = NÃO (desta chave)',
      ),
      logicFlow(
        [
          'Comando: alternativa que NÃO apresenta doença/agravo de notificação compulsória.',
          'Validar sífilis, coqueluche, HIV e leptospirose como compulsórios.',
          'Isolar influenza — fora da lista nesta prova.',
          'Marcar E.',
          'Em similares: SRAG/coronavírus ≠ influenza comum automaticamente.',
        ],
        'Influenza fora da lista → E',
      ),
      goldenRule(
        'Filtro do NÃO',
        'Decore',
        [
          { label: 'Compulsórios', value: 'Sífilis · coqueluche · HIV · leptospirose.', badge: 'ok' },
          { label: 'NÃO', value: 'Influenza.', badge: 'warn' },
        ],
        'Gripe comum ≠ lista automática',
      ),
      dangerZone(
        'PEGADINHAS — NÃO compulsória',
        [
          {
            label: 'Letra A — sífilis',
            detail: 'Sífilis.',
            correct: 'Sífilis é de notificação compulsória — não é o NÃO.',
          },
          {
            label: 'Letra B — coqueluche',
            detail: 'Coqueluche.',
            correct: 'Coqueluche entra na lista — não é o NÃO.',
          },
          {
            label: 'Letra C — HIV',
            detail: 'Infecção pelo HIV.',
            correct: 'HIV é compulsório — não é o NÃO.',
          },
          {
            label: 'Letra D — leptospirose',
            detail: 'Leptospirose.',
            correct: 'Leptospirose é compulsória — não é o NÃO.',
          },
          {
            label: 'Letra E — influenza',
            detail: 'Influenza.',
            correct: 'NÃO: influenza não apresenta agravo compulsório nesta chave.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “influenza = SRAG”.',
            correct: 'SRAG tem critério próprio — não generalize gripe comum.',
          },
        ],
        'Infecção famosa ≠ compulsória automática',
      ),
    ],
  },
  {
    file: 'fundep-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563800137-8.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'VE: conjunto de ações para conhecer/detectar/prevenir mudanças em determinantes e condicionantes, recomendando prevenção e controle (Brasil, 2010).',
    sources: [{ ...GUIA, covers: ['vigilância epidemiológica', 'determinantes', 'prevenção e controle'] }],
    slides: [
      conceptMap(
        'Qual é o nome do processo?',
        [
          { label: 'Definição', detail: 'Conhecer, detectar ou prevenir mudanças nos determinantes/condicionantes.', icon: 'Radar' },
          { label: 'Finalidade', detail: 'Recomendar e adotar prevenção e controle de doenças/agravos.', icon: 'Shield' },
          { label: 'Nome', detail: 'Vigilância Epidemiológica.', icon: 'Activity' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Trocar VE por notificação ou investigação isoladas.', icon: 'AlertTriangle' },
        ],
        'Detecção + prevenção/controle = VE',
      ),
      logicFlow(
        [
          'Ler a definição completa (Brasil, 2010).',
          'Eliminar notificação compulsória (ferramenta) e investigação (etapa).',
          'Eliminar vigilância sanitária (outro eixo).',
          'Manter Vigilância Epidemiológica.',
          'Marcar A.',
          'Em similares: notificar alimenta a VE — não a substitui.',
        ],
        'Vigilância Epidemiológica → A',
      ),
      goldenRule(
        'Definição clássica',
        'Decore',
        [
          { label: 'VE', value: 'Conhecer · detectar · prevenir · recomendar controle.', badge: 'ok' },
          { label: 'Não confunda', value: 'Notificação · investigação · sanitária.', badge: 'warn' },
        ],
        'VE = processo completo',
      ),
      dangerZone(
        'PEGADINHAS — nome do processo',
        [
          {
            label: 'Letra B — notificação',
            detail: 'Notificação Compulsória.',
            correct: 'Notificação é instrumento — a definição descreve a VE.',
          },
          {
            label: 'Letra C — investigação',
            detail: 'Investigação Epidemiológica.',
            correct: 'Investigação é etapa da VE — não o conjunto inteiro.',
          },
          {
            label: 'Letra D — sanitária',
            detail: 'Vigilância Sanitária.',
            correct: 'Sanitária é outro eixo (produtos/serviços).',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: VE = só SINAN.',
            correct: 'SINAN apoia; VE é o processo de vigilância.',
          },
        ],
        'Trocar processo por ferramenta → distrator',
      ),
    ],
  },
  {
    file: 'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563608452-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Indicadores: taxas/coeficientes para comparar populações (morbidade e mortalidade). Incidência = casos novos; prevalência = estoque — não inverter.',
    sources: [{ ...GUIA, covers: ['indicadores de saúde', 'incidência', 'prevalência', 'morbidade'] }],
    slides: [
      conceptMap(
        'Indicadores de saúde — o que é correto',
        [
          {
            label: 'Epidemiologia',
            detail: 'Estuda o processo saúde-doença, distribuição e fatores determinantes na coletividade.',
            icon: 'Users',
          },
          {
            label: 'Indicadores',
            detail: 'Números/taxas/coeficientes para analisar situação, comparar regiões e avaliar mudanças.',
            icon: 'BarChart3',
          },
          {
            label: 'Uso',
            detail: 'Avaliam morbidade e mortalidade — suporte a planejamento e avaliação das ações.',
            icon: 'Target',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Inverter incidência e prevalência (novos × estoque).',
            icon: 'AlertTriangle',
          },
        ],
        'Indicadores = taxas para comparar',
      ),
      logicFlow(
        [
          'Comando: alternativa correta sobre epidemiologia e indicadores.',
          'Eliminar “morbidade só com incidência” e inverter incidência/prevalência.',
          'Eliminar diagrama de controle só com prevalência absoluta e HAS/DM “sem incidência”.',
          'Manter: indicadores em taxas/coeficientes para morbidade e mortalidade.',
          'Marcar A.',
          'Em similares: incidência = novos; prevalência = todos conhecidos no período.',
        ],
        'Indicadores em taxas → letra A',
      ),
      goldenRule(
        'Incidência × prevalência',
        'Decore',
        [
          { label: 'Incidência', value: 'Casos novos no período.', badge: 'ok' },
          { label: 'Prevalência', value: 'Estoque (novos + antigos) no período.', badge: 'ok' },
          { label: 'Indicador', value: 'Taxa/coeficiente para comparar populações.', badge: 'ok' },
        ],
        'Não inverta novos e estoque',
      ),
      dangerZone(
        'PEGADINHAS — indicadores',
        [
          {
            label: 'Letra B — só incidência',
            detail: 'Morbidade tem apenas incidência; fórmula distorcida.',
            correct: 'Morbidade também usa prevalência — não “apenas incidência”.',
          },
          {
            label: 'Letra C — invertido',
            detail: 'Incidência = todos os casos; prevalência = só novos.',
            correct: 'Está invertido: incidência = novos; prevalência = estoque.',
          },
          {
            label: 'Letra D — diagrama',
            detail: 'Diagrama de controle usa prevalência absoluta para monitorar.',
            correct: 'Canal endêmico trabalha frequência no tempo — definição distorcida.',
          },
          {
            label: 'Letra E — HAS/DM',
            detail: 'Impossível calcular incidência/prevalência; só caso-controle.',
            correct: 'Crônicas têm desafios, mas a afirmação absoluta é falsa.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “coeficiente = número absoluto”.',
            correct: 'Coeficiente/taxa relativiza pela população para comparar.',
          },
        ],
        'Inverter incidência/prevalência → distrator',
      ),
    ],
  },
  {
    file: 'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563617321-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'VE: conhecimento, detecção e prevenção de alterações nos determinantes/condicionantes, com medidas de prevenção e controle. Não é coletiva/trabalhador/ambiental/sanitária.',
    sources: [{ ...GUIA, covers: ['vigilância epidemiológica'] }],
    slides: [
      conceptMap(
        'Função de qual vigilância?',
        [
          { label: 'Ações', detail: 'Conhecer, detectar e prevenir alterações nos determinantes/condicionantes.', icon: 'Radar' },
          { label: 'Objetivo', detail: 'Recomendar e adotar prevenção e controle de doenças/agravos.', icon: 'Shield' },
          { label: 'Nome', detail: 'Vigilância Epidemiológica.', icon: 'Activity' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar sanitária ou ambiental por hábito.', icon: 'AlertTriangle' },
        ],
        'Determinantes + controle = VE',
      ),
      logicFlow(
        [
          'Ler a função descrita no enunciado.',
          'Eliminar vigilância coletiva, do trabalhador, ambiental e sanitária.',
          'Manter Vigilância Epidemiológica.',
          'Marcar C.',
          'Em similares: se fala em agravos e determinantes, é VE.',
        ],
        'Vigilância Epidemiológica → C',
      ),
      goldenRule(
        'Nome certo',
        'Decore',
        [
          { label: 'VE', value: 'Determinantes + prevenção/controle de agravos.', badge: 'ok' },
          { label: 'Outras', value: 'Sanitária · ambiental · trabalhador.', badge: 'warn' },
        ],
        'VE = eixo dos agravos',
      ),
      dangerZone(
        'PEGADINHAS — tipo de vigilância',
        [
          {
            label: 'Letra A — coletiva',
            detail: 'Vigilância Coletiva.',
            correct: 'Rótulo não oficial — a banca quer epidemiológica.',
          },
          {
            label: 'Letra B — trabalhador',
            detail: 'Vigilância em Saúde do Trabalhador.',
            correct: 'Recorte ocupacional — não a definição ampla dada.',
          },
          {
            label: 'Letra D — ambiental',
            detail: 'Vigilância Ambiental.',
            correct: 'Foco ambiental — estreito demais para o texto.',
          },
          {
            label: 'Letra E — sanitária',
            detail: 'Vigilância Sanitária.',
            correct: 'Produtos/serviços — não o núcleo desta definição.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “Vigilância em Saúde” guarda-chuva.',
            correct: 'Aqui o texto clássico aponta especificamente a VE.',
          },
        ],
        'Trocar VE por outro eixo → distrator',
      ),
    ],
  },
  {
    file: 'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563768972-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Incidência = casos novos confirmados / população × constante. 150/5000×100 = 3%. Usar confirmados (150), não notificações brutas (200).',
    exam_vs_current: 'Chave: 3% (letra D) com constante 100.',
    sources: [{ ...GUIA, covers: ['taxa de incidência', 'febre amarela', 'cálculo'] }],
    slides: [
      conceptMap(
        'Incidência de FA — montar a conta',
        [
          { label: 'Numerador', detail: '150 casos confirmados (não os 200 notificados brutos).', icon: 'Hash' },
          { label: 'Denominador', detail: '5.000 pessoas acompanhadas pela USF.', icon: 'Users' },
          { label: 'Constante', detail: '100 → resultado em %.', icon: 'Percent' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Usar 200 no numerador (4%) em vez dos confirmados.', icon: 'AlertTriangle' },
        ],
        '150 ÷ 5000 × 100 = 3%',
      ),
      logicFlow(
        [
          'Identificar casos para incidência: confirmados = 150.',
          'População = 5.000; constante = 100.',
          'Calcular: 150 / 5000 = 0,03 → ×100 = 3%.',
          'Eliminar 2%, 4% (se usasse 200), 10% e 7%.',
          'Marcar D.',
          'Em similares: incidência usa casos novos válidos ÷ população × k.',
        ],
        '150/5000×100 = 3% → D',
      ),
      goldenRule(
        'Fórmula aplicada',
        'Decore',
        [
          { label: 'Incidência', value: 'Casos novos ÷ população × constante.', badge: 'ok' },
          { label: 'Nesta prova', value: '150 ÷ 5.000 × 100 = 3%.', badge: 'ok' },
          { label: 'Armadilha', value: 'Usar 200 notificados → 4%.', badge: 'warn' },
        ],
        'Confirmados no numerador',
      ),
      dangerZone(
        'PEGADINHAS — conta da incidência',
        [
          {
            label: 'Letra A — 2%',
            detail: 'Taxa de 2%.',
            correct: 'Não corresponde a 150/5000×100.',
          },
          {
            label: 'Letra B — 4%',
            detail: 'Taxa de 4%.',
            correct: 'É o erro de usar 200 notificados (200/5000×100).',
          },
          {
            label: 'Letra C — 10%',
            detail: 'Taxa de 10%.',
            correct: 'Numerador/denominador não batem com 10%.',
          },
          {
            label: 'Letra E — 7%',
            detail: 'Taxa de 7%.',
            correct: 'Não resulta da razão 150/5000 com constante 100.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: incidência com constante 1.000 ou 100.000.',
            correct: 'Mude só a constante — a razão casos/população é a mesma lógica.',
          },
        ],
        'Usar notificado bruto → distrator',
      ),
    ],
  },
  {
    file: 'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563768972-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Epidemiologia = ciência do processo saúde-doença, distribuição e determinantes dos problemas de saúde na população.',
    sources: [{ ...GUIA, covers: ['epidemiologia', 'determinantes', 'saúde-doença'] }],
    slides: [
      conceptMap(
        'Qual ciência preenche a lacuna?',
        [
          { label: 'Texto', detail: 'Ciência do processo saúde-doença e dos determinantes na população.', icon: 'BookOpen' },
          { label: 'Nome', detail: 'Epidemiologia.', icon: 'Users' },
          { label: 'Não é', detail: 'Doença, parasitologia, infectologia ou epidemia.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar epidemia (evento) no lugar da ciência.', icon: 'AlertTriangle' },
        ],
        'Ciência = epidemiologia',
      ),
      logicFlow(
        [
          'Lacuna: ciência que estuda saúde-doença, distribuição e determinantes.',
          'Eliminar doença, parasitologia, infectologia e epidemia.',
          'Preencher com epidemiologia.',
          'Marcar C.',
          'Em similares: epidemia é ocorrência; epidemiologia é a ciência.',
        ],
        'Epidemiologia → letra C',
      ),
      goldenRule(
        'Ciência × evento',
        'Decore',
        [
          { label: 'Epidemiologia', value: 'Ciência da distribuição e determinantes.', badge: 'ok' },
          { label: 'Epidemia', value: 'Evento de excesso de casos — não a ciência.', badge: 'warn' },
        ],
        'Ciência ≠ ocorrência',
      ),
      dangerZone(
        'PEGADINHAS — lacuna',
        [
          {
            label: 'Letra A — doença',
            detail: 'Doença.',
            correct: 'Doença é o objeto — não a ciência.',
          },
          {
            label: 'Letra B — parasitologia',
            detail: 'Parasitologia.',
            correct: 'Recorte de parasitos — não o conceito amplo.',
          },
          {
            label: 'Letra D — infectologia',
            detail: 'Infectologia.',
            correct: 'Especialidade clínica — não a definição populacional.',
          },
          {
            label: 'Letra E — epidemia',
            detail: 'Epidemia.',
            correct: 'É um tipo de ocorrência — não a ciência.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “endemia = ciência”.',
            correct: 'Endemia/epidemia/pandemia são escalas — epidemiologia estuda.',
          },
        ],
        'Trocar ciência por evento → distrator',
      ),
    ],
  },
  {
    file: 'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563793798-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Letalidade (%) = óbitos da doença no período ÷ doentes pela mesma doença no período × 100. Não multiplica incidência nem duração.',
    sources: [{ ...GUIA, covers: ['letalidade', 'severidade', 'mortalidade'] }],
    slides: [
      conceptMap(
        'Como calcular letalidade?',
        [
          { label: 'Ideia', detail: 'Mede severidade: proporção de mortes entre os doentes da causa.', icon: 'Skull' },
          { label: 'Fórmula', detail: 'Óbitos da doença ÷ doentes da doença × 100.', icon: 'Percent' },
          { label: 'Denominador', detail: 'Doentes (não a população geral — isso seria mortalidade).', icon: 'Users' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Multiplicar óbitos × doentes em vez de dividir.', icon: 'AlertTriangle' },
        ],
        'Óbitos ÷ doentes × 100',
      ),
      logicFlow(
        [
          'Lembrar: letalidade = severidade entre doentes.',
          'Eliminar fórmulas que multiplicam óbitos × doentes.',
          'Eliminar uso de incidência no numerador/denominador errado.',
          'Manter: óbitos ÷ doentes × 100.',
          'Marcar C.',
          'Em similares: mortalidade usa população; letalidade usa doentes.',
        ],
        'Óbitos ÷ doentes × 100 → C',
      ),
      goldenRule(
        'Letalidade vs mortalidade',
        'Decore',
        [
          { label: 'Letalidade', value: 'Óbitos ÷ doentes × 100.', badge: 'ok' },
          { label: 'Mortalidade', value: 'Óbitos ÷ população × constante.', badge: 'warn' },
        ],
        'Dividir — não multiplicar óbitos×doentes',
      ),
      dangerZone(
        'PEGADINHAS — fórmula da letalidade',
        [
          {
            label: 'Letra A — incidência × doentes',
            detail: 'Incidência multiplicada por doentes × 100.',
            correct: 'Não é a definição de letalidade.',
          },
          {
            label: 'Letra B — óbitos × doentes',
            detail: 'Óbitos multiplicados por doentes × 100.',
            correct: 'Multiplicar distorce — a operação correta é divisão.',
          },
          {
            label: 'Letra D — incidência ÷ doentes',
            detail: 'Incidência dividida por doentes × 100.',
            correct: 'Troca o numerador: letalidade usa óbitos, não incidência.',
          },
          {
            label: 'Letra E — óbitos × duração',
            detail: 'Óbitos multiplicados pela duração média.',
            correct: 'Duração não entra na letalidade clássica percentual.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: letalidade × mortalidade proporcional.',
            correct: 'Denominador muda: doentes vs população.',
          },
        ],
        'Multiplicar em vez de dividir → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g12',
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
