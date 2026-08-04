/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g16 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g16.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g16';
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
const PRINCIPIOS = {
  id: 'modulo-principios-epidemiologia-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Princípios de epidemiologia para o controle de enfermidades',
  year: 2010,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/modulo_principios_epidemiologia_2.pdf',
};
const SURTOS = {
  id: 'investigacao-surtos-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Investigação de surtos — dez passos',
  year: 2009,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/',
};
const DESASTRES = {
  id: 'guia-desastres-saude-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Centro de Operações de Emergências em Saúde — COE',
  year: 2014,
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
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712242196-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Objetivo da epidemiologia: investigar determinantes de saúde/doença na população e auxiliar prevenção e controle de agravos — não só tratamento individual.',
    sources: [{ ...PRINCIPIOS, covers: ['objetivos da epidemiologia', 'determinantes', 'prevenção', 'controle'] }],
    slides: [
      conceptMap(
        'UBS notifica — o que a epidemiologia faz?',
        [
          {
            label: 'Cenário',
            detail: 'Técnico de enfermagem na Unidade Básica vê aumento de doença infecciosa e a equipe notifica a vigilância epidemiológica.',
            icon: 'Users',
          },
          {
            label: 'Campo',
            detail: 'Estuda distribuição e determinantes dos problemas de saúde na população (saúde pública).',
            icon: 'Map',
          },
          {
            label: 'Objetivo',
            detail: 'Investigar fatores determinantes e auxiliar monitoramento, prevenção e controle de agravos.',
            icon: 'Target',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Reduzir epidemiologia a tratamento individual ou só hospital de referência.',
            icon: 'AlertTriangle',
          },
        ],
        'População + determinantes + prevenção',
      ),
      logicFlow(
        [
          'Indique o objetivo correto da epidemiologia no cenário da UBS.',
          'Eliminar foco exclusivo no tratamento individual e no biológico isolado.',
          'Eliminar “só grandes surtos”, “só hospital” e desprezo a fatores sociais.',
          'Manter: investigar determinantes e auxiliar prevenção/controle de agravos.',
          'Marcar A.',
          'Em similares: epidemiologia serve à população — não só ao leito individual.',
        ],
        'Determinantes + prevenção → letra A',
      ),
      goldenRule(
        'Objetivo em uma linha',
        'Decore',
        [
          { label: 'Faz', value: 'Investigar determinantes · prevenir e controlar agravos.', badge: 'ok' },
          { label: 'Não faz', value: 'Só tratar indivíduo · só surto · só hospital.', badge: 'warn' },
        ],
        'UBS também é território da epidemiologia',
      ),
      dangerZone(
        'PEGADINHAS — objetivos',
        [
          {
            label: 'Letra B — só tratamento',
            detail: 'Focar exclusivamente no tratamento individual.',
            correct: 'Ignora determinantes sociais/ambientais — não é o objetivo.',
          },
          {
            label: 'Letra C — só surtos',
            detail: 'Aplicar estudos apenas em grandes surtos.',
            correct: 'Epidemiologia também orienta prevenção de crônicas e rotina.',
          },
          {
            label: 'Letra D — só biológico',
            detail: 'Desconsiderar fatores sociais e econômicos.',
            correct: 'Determinantes sociais entram na análise — não só o biológico.',
          },
          {
            label: 'Letra E — só hospital',
            detail: 'Atuar somente em hospitais de referência.',
            correct: 'Aplica-se também nas unidades básicas e na comunidade.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “notificar na UBS não é papel do técnico”.',
            correct: 'Equipe multiprofissional na UBS alimenta a vigilância.',
          },
        ],
        'Individualizar a epidemiologia → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712242196-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Incidência = casos novos em população específica em período determinado. Prevalência = estoque; letalidade = óbitos entre doentes; mortalidade = óbitos na população.',
    sources: [{ ...PRINCIPIOS, covers: ['incidência', 'prevalência', 'mortalidade', 'letalidade'] }],
    slides: [
      conceptMap(
        'Taxa de incidência — definição',
        [
          {
            label: 'Contexto',
            detail: 'Indicadores epidemiológicos (incidência, prevalência, mortalidade, letalidade) avaliam situação de saúde e políticas.',
            icon: 'BarChart3',
          },
          {
            label: 'Incidência',
            detail: 'Número de casos novos de uma doença em população específica dentro de um período determinado.',
            icon: 'Plus',
          },
          {
            label: 'Não confundir',
            detail: 'Prevalência = estoque total; letalidade = óbitos entre doentes; mortalidade = óbitos na população.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar incidência por prevalência (“todos os casos existentes”).',
            icon: 'AlertTriangle',
          },
        ],
        'Casos novos · período · população',
      ),
      logicFlow(
        [
          'Assinale a definição correta da taxa de incidência.',
          'Eliminar prevalência (casos existentes sem recorte de novos).',
          'Eliminar letalidade, mortalidade geral e “satisfação com serviços”.',
          'Manter: casos novos em população específica no período.',
          'Marcar B.',
          'Em similares: “novos” = incidência; “estoque” = prevalência.',
        ],
        'Casos novos → letra B',
      ),
      goldenRule(
        'Quatro indicadores',
        'Decore',
        [
          { label: 'Incidência', value: 'Casos novos / população / período.', badge: 'ok' },
          { label: 'Prevalência', value: 'Casos existentes (estoque).', badge: 'warn' },
          { label: 'Letalidade', value: 'Óbitos entre os doentes.', badge: 'warn' },
          { label: 'Mortalidade', value: 'Óbitos na população total.', badge: 'warn' },
        ],
        'Incidência conta o fluxo de novos casos',
      ),
      dangerZone(
        'PEGADINHAS — incidência',
        [
          {
            label: 'Letra A — prevalência',
            detail: 'Número total de casos existentes, sem tempo de evolução.',
            correct: 'Isso é prevalência — estoque, não fluxo de novos.',
          },
          {
            label: 'Letra C — letalidade',
            detail: 'Proporção de doentes que evoluem para óbito.',
            correct: 'É letalidade — não define incidência.',
          },
          {
            label: 'Letra D — mortalidade',
            detail: 'Óbitos por qualquer causa / população total.',
            correct: 'É mortalidade geral — outro indicador.',
          },
          {
            label: 'Letra E — satisfação',
            detail: 'Índice de satisfação com serviços de saúde.',
            correct: 'Não é indicador epidemiológico de incidência.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “incidência = todos os casos vivos no dia”.',
            correct: 'Isso aponta prevalência pontual — não incidência.',
          },
        ],
        'Trocar novos por estoque → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712242196-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Primeiro passo essencial na investigação de surtos (MS): determinar se há aumento de casos acima do esperado na região — antes de imprensa ou “só grave”.',
    sources: [{ ...SURTOS, covers: ['investigação de surtos', 'dez passos', 'acima do esperado'] }],
    slides: [
      conceptMap(
        'Surto alimentar — primeiro passo',
        [
          {
            label: 'Cenário',
            detail: 'Febre, diarreia e vômitos após alimentos do mesmo restaurante; equipe de vigilância inicia investigação.',
            icon: 'Utensils',
          },
          {
            label: 'Dez passos (MS)',
            detail: 'Roteiro do Ministério da Saúde para diagnóstico preciso e medidas de controle.',
            icon: 'ListOrdered',
          },
          {
            label: '1º essencial',
            detail: 'Determinar se há aumento de casos acima do esperado para a região.',
            icon: 'TrendingUp',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Saltar para imprensa, lab de todos ou controle sem confirmar o excesso.',
            icon: 'AlertTriangle',
          },
        ],
        'Confirmar o excesso antes de agir às cegas',
      ),
      logicFlow(
        [
          'Indique o primeiro passo essencial para investigar o surto.',
          'Eliminar lab obrigatório de todos e controle sem confirmar existência.',
          'Eliminar notificar imprensa antes dos dados e amostrar só graves.',
          'Manter: verificar aumento acima do esperado na região.',
          'Marcar C.',
          'Em similares: surto = excesso confirmado — depois vem causa e controle.',
        ],
        'Acima do esperado → letra C',
      ),
      goldenRule(
        'Abertura do surto',
        'Decore',
        [
          { label: '1º', value: 'Há casos acima do esperado na região?', badge: 'ok' },
          { label: 'Depois', value: 'Hipótese, lab, controle e comunicação com base.', badge: 'ok' },
          { label: 'Não', value: 'Imprensa antes dos dados · só casos graves.', badge: 'warn' },
        ],
        'Excesso confirmado abre a investigação',
      ),
      dangerZone(
        'PEGADINHAS — primeiro passo',
        [
          {
            label: 'Letra A — lab de todos',
            detail: 'Confirmar diagnóstico laboratorial de todos antes de qualquer controle.',
            correct: 'Lab ajuda, mas o 1º passo é confirmar o excesso de casos.',
          },
          {
            label: 'Letra B — controle cego',
            detail: 'Aplicar controle imediatamente sem confirmar o surto.',
            correct: 'Medidas sem confirmar existência do surto pulam o passo essencial.',
          },
          {
            label: 'Letra D — imprensa',
            detail: 'Notificar a imprensa antes de dados concretos.',
            correct: 'Comunicação pública vem com base — não como primeiro passo.',
          },
          {
            label: 'Letra E — só graves',
            detail: 'Coletar amostras apenas dos pacientes mais graves.',
            correct: 'Casos leves também informam a curva do surto.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “todo agrupamento de sintomas = surto confirmado”.',
            correct: 'Compare com o esperado da região antes de fechar o rótulo.',
          },
        ],
        'Pular a confirmação do excesso → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712242196-8.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Surto alimentar: caso-controle compara doentes e não doentes quanto à exposição para achar fator de risco — não transversal sem comparação nem só laboratório.',
    sources: [{ ...SURTOS, covers: ['caso-controle', 'surto', 'intoxicação alimentar', 'fatores de risco'] }],
    slides: [
      conceptMap(
        'Surto — doentes × não doentes',
        [
          {
            label: 'Pedido',
            detail: 'Comparar exposição dos doentes a fatores de risco com indivíduos não afetados no evento.',
            icon: 'GitCompare',
          },
          {
            label: 'Método',
            detail: 'Estudo de caso-controle: doentes versus não doentes para avaliar fatores de risco.',
            icon: 'Scale',
          },
          {
            label: 'Objetivo',
            detail: 'Identificar a causa provável da contaminação na intoxicação alimentar.',
            icon: 'Search',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Escolher transversal sem comparação ou lab exclusivo.',
            icon: 'AlertTriangle',
          },
        ],
        'Comparar afetados e não afetados',
      ),
      logicFlow(
        [
          'Método mais adequado: comparar doentes e não doentes quanto à exposição.',
          'Eliminar transversal sem comparações e análise só qualitativa.',
          'Eliminar lab exclusivo e estudo ecológico sem análise individual.',
          'Manter caso-controle.',
          'Marcar A.',
          'Em similares: surto pontual com “comeu ou não” → pense caso-controle.',
        ],
        'Caso-controle → letra A',
      ),
      goldenRule(
        'Desenho no surto',
        'Decore',
        [
          { label: 'Caso-controle', value: 'Doentes × não doentes → fator de risco.', badge: 'ok' },
          { label: 'Transversal', value: 'Prevalência em um momento — sem esse confronto.', badge: 'warn' },
          { label: 'Ecológico', value: 'Agregados ambientais — sem indivíduo.', badge: 'warn' },
        ],
        'Comparação individual fecha a causa',
      ),
      dangerZone(
        'PEGADINHAS — desenho',
        [
          {
            label: 'Letra B — transversal',
            detail: 'Estudo transversal sem comparações.',
            correct: 'Não confronta doentes e não doentes como pedido.',
          },
          {
            label: 'Letra C — qualitativa',
            detail: 'Só relatos sem testes estatísticos.',
            correct: 'Pode apoiar, mas não é o método comparativo indicado.',
          },
          {
            label: 'Letra D — só lab',
            detail: 'Investigação laboratorial exclusiva.',
            correct: 'Lab sozinho ignora a epidemiologia da exposição.',
          },
          {
            label: 'Letra E — ecológico',
            detail: 'Estudo ecológico sem análise individual.',
            correct: 'Não compara indivíduos afetados e não afetados.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “coorte retrospectiva = mesmo que caso-controle”.',
            correct: 'Coorte parte da exposição; caso-controle parte do desfecho.',
          },
        ],
        'Desistir da comparação → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712242196-9.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'COE articula setores do SUS em emergências: monitorar situação epidemiológica e avaliar riscos — não cria vacina, não substitui gestores, não fica só no hospital.',
    sources: [{ ...DESASTRES, covers: ['COE', 'emergências em saúde pública', 'monitoramento', 'riscos'] }],
    slides: [
      conceptMap(
        'COE — atribuição correta',
        [
          {
            label: 'Missão',
            detail: 'Emergências (epidemias, desastres): resposta coordenada e rápida no SUS.',
            icon: 'Siren',
          },
          {
            label: 'Articulação',
            detail: 'Centro de Operações de Emergências em Saúde articula setores e esferas.',
            icon: 'Network',
          },
          {
            label: 'Atribuição',
            detail: 'Monitorar a situação epidemiológica e avaliar riscos à saúde pública.',
            icon: 'Radar',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Transformar COE em lab de vacina ou substituto do gestor local.',
            icon: 'AlertTriangle',
          },
        ],
        'Monitorar + avaliar risco',
      ),
      logicFlow(
        [
          'Assinale uma atribuição correta do COE.',
          'Eliminar desenvolvimento de vacinas/medicamentos e “só municipal”.',
          'Eliminar resolver tudo no hospital e substituir gestores locais.',
          'Manter: monitorar situação epidemiológica e avaliar riscos.',
          'Marcar A.',
          'Em similares: COE coordena e analisa — não inventa vacina nem toma o lugar do gestor.',
        ],
        'Monitorar riscos → letra A',
      ),
      goldenRule(
        'Papel do COE',
        'Decore',
        [
          { label: 'Faz', value: 'Monitorar epidemiológico · avaliar riscos · articular SUS.', badge: 'ok' },
          { label: 'Não faz', value: 'Criar vacina · só hospital · substituir gestor.', badge: 'warn' },
        ],
        'COE = operação e análise, não P&D',
      ),
      dangerZone(
        'PEGADINHAS — COE',
        [
          {
            label: 'Letra B — vacinas',
            detail: 'Desenvolver pesquisas laboratoriais de vacinas e medicamentos.',
            correct: 'P&D não é atribuição típica do COE nesta chave.',
          },
          {
            label: 'Letra C — só municipal',
            detail: 'Atuar exclusivamente no nível municipal.',
            correct: 'COE articula esferas — não se fecha no município.',
          },
          {
            label: 'Letra D — só hospital',
            detail: 'Resolver emergências apenas no nível hospitalar.',
            correct: 'Inclui prevenção e articulação — não só leito.',
          },
          {
            label: 'Letra E — substitui gestor',
            detail: 'Substituir gestores locais nas decisões.',
            correct: 'Apoia e articula — não substitui a gestão local.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “COE só abre depois do desastre”.',
            correct: 'Também monitora risco e prepara resposta coordenada.',
          },
        ],
        'Trocar COE por lab ou gestor → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712256094-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Epidemiologia: analisa distribuição e determinantes de enfermidades/agravos à saúde coletiva e propõe prevenção e controle — não só cura individual nem só transmissíveis.',
    sources: [{ ...PRINCIPIOS, covers: ['definição de epidemiologia', 'distribuição', 'determinantes', 'saúde coletiva'] }],
    slides: [
      conceptMap(
        'O que é Epidemiologia?',
        [
          {
            label: 'Objeto',
            detail: 'Processo saúde-doença na comunidade e estratégias de intervenção em saúde pública.',
            icon: 'Heart',
          },
          {
            label: 'Definição',
            detail: 'Analisa distribuição e determinantes das enfermidades e agravos à saúde coletiva.',
            icon: 'BookOpen',
          },
          {
            label: 'Finalidade',
            detail: 'Propor medidas de prevenção e controle — não só cura individual.',
            icon: 'Shield',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Restringir a transmissíveis, terapia ou só surtos.',
            icon: 'AlertTriangle',
          },
        ],
        'Distribuição + determinantes + controle',
      ),
      logicFlow(
        [
          'Assinale a melhor definição de Epidemiologia.',
          'Eliminar “só transmissíveis”, “só terapêutica” e “só cura individual”.',
          'Eliminar “só surtos sem fatores sociais”.',
          'Manter: distribuição, determinantes, prevenção e controle coletivos.',
          'Marcar C.',
          'Em similares: se fala em população e determinantes, é epidemiologia clássica.',
        ],
        'Definição clássica → letra C',
      ),
      goldenRule(
        'Tríade da definição',
        'Decore',
        [
          { label: 'Analisa', value: 'Distribuição e determinantes na coletividade.', badge: 'ok' },
          { label: 'Propõe', value: 'Prevenção e controle de agravos.', badge: 'ok' },
          { label: 'Não é', value: 'Só clínica individual · só lab · só surto.', badge: 'warn' },
        ],
        'Coletivo e determinantes fecham a definição',
      ),
      dangerZone(
        'PEGADINHAS — definição',
        [
          {
            label: 'Letra A — só transmissíveis',
            detail: 'Estuda apenas doenças transmissíveis e impactos individuais.',
            correct: 'Abrange também não transmissíveis e visão coletiva.',
          },
          {
            label: 'Letra B — só terapia',
            detail: 'Aplicação exclusiva de medidas terapêuticas em crônicas.',
            correct: 'Não é definição de epidemiologia — é clínica terapêutica.',
          },
          {
            label: 'Letra D — cura individual',
            detail: 'Foco principal em cura e reabilitação individual.',
            correct: 'Isso é assistência clínica — não o núcleo da epidemiologia.',
          },
          {
            label: 'Letra E — só surtos',
            detail: 'Restringe-se a surtos sem fatores sociais.',
            correct: 'Monitora mais que surtos e inclui determinantes sociais.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “epidemiologia = estatística hospitalar”.',
            correct: 'É ciência de população e determinantes — não só contagem de leito.',
          },
        ],
        'Individualizar ou estreitar demais → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712256094-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Aplicações: descrever condições de saúde, identificar determinantes e avaliar impacto das ações — base para políticas, promoção e redução de riscos.',
    sources: [{ ...PRINCIPIOS, covers: ['aplicações da epidemiologia', 'políticas públicas', 'avaliação de impacto'] }],
    slides: [
      conceptMap(
        'Aplicações na saúde pública',
        [
          {
            label: 'Pilares',
            detail: 'Políticas e programas para qualidade de vida; análise epidemiológica com evidências.',
            icon: 'Landmark',
          },
          {
            label: 'Trio',
            detail: 'Descrever condições de saúde, identificar fatores determinantes e avaliar impacto das ações.',
            icon: 'Layers',
          },
          {
            label: 'Uso',
            detail: 'Promoção da saúde e redução de riscos para gestores e profissionais.',
            icon: 'Compass',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Reduzir a diagnóstico individual, só surto ou só laboratório de fármaco.',
            icon: 'AlertTriangle',
          },
        ],
        'Descrever · determinar · avaliar',
      ),
      logicFlow(
        [
          'Assinale as principais aplicações dessa ciência.',
          'Eliminar diagnóstico exclusivo individual e surto sem social/ambiental.',
          'Eliminar “só prevalência” e “desenvolver medicamentos”.',
          'Manter: descrever, identificar determinantes e avaliar impacto das ações.',
          'Marcar A.',
          'Em similares: aplicação = ciclo descrever→explicar→avaliar política.',
        ],
        'Trio de aplicações → letra A',
      ),
      goldenRule(
        'Ciclo de aplicação',
        'Decore',
        [
          { label: '1', value: 'Descrever condições de saúde da população.', badge: 'ok' },
          { label: '2', value: 'Identificar fatores determinantes.', badge: 'ok' },
          { label: '3', value: 'Avaliar impacto das ações propostas.', badge: 'ok' },
        ],
        'Três usos — não só contar casos',
      ),
      dangerZone(
        'PEGADINHAS — aplicações',
        [
          {
            label: 'Letra B — só clínico',
            detail: 'Diagnosticar doenças exclusivamente em indivíduos.',
            correct: 'É clínica assistencial — não a aplicação populacional pedida.',
          },
          {
            label: 'Letra C — surto sem contexto',
            detail: 'Investigar surtos sem aspectos sociais e ambientais.',
            correct: 'Determinantes sociais/ambientais fazem parte da aplicação.',
          },
          {
            label: 'Letra D — só prevalência',
            detail: 'Estudar exclusivamente prevalência sem determinantes.',
            correct: 'Aplicação completa inclui determinantes e impacto das ações.',
          },
          {
            label: 'Letra E — fármacos',
            detail: 'Aplicar métodos laboratoriais para novos medicamentos.',
            correct: 'Desenvolvimento de fármacos não é a aplicação central aqui.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “epidemiologia só descreve, nunca avalia programa”.',
            correct: 'Avaliar impacto das ações é aplicação clássica.',
          },
        ],
        'Trocar população por leito/lab → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712256094-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Função principal da VE: coletar, analisar e interpretar dados para orientar prevenção e controle. SNVE organiza notificações compulsórias — não é lab de fármacos nem só clínica individual.',
    sources: [{ ...GUIA, covers: ['vigilância epidemiológica', 'SNVE', 'coleta', 'análise', 'notificação compulsória'] }],
    slides: [
      conceptMap(
        'Função principal da VE',
        [
          {
            label: 'Conjunto',
            detail: 'Monitoramento contínuo: detecção precoce de surtos, fatores de risco e medidas oportunas.',
            icon: 'Activity',
          },
          {
            label: 'SNVE',
            detail: 'Sistema Nacional de Vigilância Epidemiológica organiza notificações compulsórias e agravos.',
            icon: 'Database',
          },
          {
            label: 'Núcleo',
            detail: 'Coletar, analisar e interpretar dados para orientar prevenção e controle de doenças.',
            icon: 'Workflow',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar VE por diagnóstico individual, lab de patógeno ou fábrica de vacina.',
            icon: 'AlertTriangle',
          },
        ],
        'Dado → análise → ação',
      ),
      logicFlow(
        [
          'Identifique a função principal da Vigilância Epidemiológica.',
          'Eliminar diagnósticos individuais, lab exclusivo e desenvolvimento de fármacos.',
          'Eliminar “somente transmissíveis”.',
          'Manter: coletar, analisar e interpretar dados para prevenção/controle.',
          'Marcar E.',
          'Em similares: VE = informação para ação — não consultório nem indústria.',
        ],
        'Coletar·analisar·interpretar → E',
      ),
      goldenRule(
        'Tríade da VE',
        'Decore',
        [
          { label: 'Função', value: 'Coletar · analisar · interpretar → prevenir/controlar.', badge: 'ok' },
          { label: 'SNVE', value: 'Organiza notificações compulsórias no Brasil.', badge: 'ok' },
          { label: 'Não é', value: 'Consultório · P&D de vacina · só lab.', badge: 'warn' },
        ],
        'Informação para ação contínua',
      ),
      dangerZone(
        'PEGADINHAS — função da VE',
        [
          {
            label: 'Letra A — clínico',
            detail: 'Elaborar diagnósticos individuais e encaminhar tratamento.',
            correct: 'É assistência — não a função principal da VE.',
          },
          {
            label: 'Letra B — só lab',
            detail: 'Realizar exclusivamente estudos laboratoriais de patógenos.',
            correct: 'Lab apoia; o núcleo é o ciclo de dados para ação.',
          },
          {
            label: 'Letra C — vacinas',
            detail: 'Desenvolver medicamentos e vacinas.',
            correct: 'P&D não descreve a função principal da VE.',
          },
          {
            label: 'Letra D — só transmissíveis',
            detail: 'Monitorar apenas doenças transmissíveis.',
            correct: 'VE também contempla outros agravos à saúde.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “VE = só preencher ficha do SINAN”.',
            correct: 'Notificar alimenta o ciclo — analisar e agir completa a função.',
          },
        ],
        'Virar VE em consultório/lab → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g16',
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
