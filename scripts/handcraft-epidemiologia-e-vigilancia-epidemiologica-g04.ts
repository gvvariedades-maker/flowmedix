/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g04 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g04.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g04';
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
const SINAN = {
  id: 'sinan-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Sistema de Informação de Agravos de Notificação (SINAN)',
  year: 2022,
  url: 'https://www.gov.br/saude/pt-br/composicao/svsa/sinan',
};
const HANSE = {
  id: 'guia-hanseniase-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Guia de Vigilância / diretrizes de hanseníase — detecção precoce e interrupção da transmissão',
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
    file: 'copese-ufpi-enfermagem-atencao-basica-saude-da-familia-1778967776515-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Manejo integrado de vetores: controle mecânico de criadouros (remoção, vedação, limpeza, drenagem) + educação — reduz uso de químicos.',
    sources: [{ ...GUIA, covers: ['manejo integrado de vetores', 'controle mecânico', 'criadouros'] }],
    slides: [
      conceptMap(
        'Eliminar vetores sem depender só do químico',
        [
          { label: 'Eixo', detail: 'Manejo integrado com ênfase em controle mecânico e educação em saúde.', icon: 'Leaf' },
          { label: 'Ação correta', detail: 'Remover, vedar, limpar e drenar criadouros — controle mecânico.', icon: 'Wrench' },
          { label: 'Benefício', detail: 'Menos produto químico → trabalhador, ambiente e população.', icon: 'HeartHandshake' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Aceitar esgoto inadequado ou educação sem participação da população.', icon: 'AlertTriangle' },
        ],
        'Mecânico + educação > só químico',
      ),
      logicFlow(
        [
          'Comando: exemplo que colabora com eliminação de vetores no manejo integrado.',
          'Eliminar esgotamento inadequado e crescimento urbano desordenado (pioram o risco).',
          'Eliminar limpeza urbana “só quando necessário” e educação sem a população.',
          'Manter controle mecânico dos criadouros: remoção, vedação, limpeza e drenagem.',
          'Marcar B.',
          'Em similares: se a alternativa piora o ambiente ou exclui a comunidade, mate.',
        ],
        'Controle mecânico de criadouros → B',
      ),
      goldenRule(
        'Controle mecânico em 4 verbos',
        'Decore',
        [
          { label: 'Fazer', value: 'Remoção · vedação · limpeza · drenagem dos criadouros.', badge: 'ok' },
          { label: 'Junto', value: 'Educação com participação da população.', badge: 'ok' },
          { label: 'Evitar', value: 'Esgoto ruim, limpeza esporádica, exclusão da comunidade.', badge: 'warn' },
        ],
        'Remover · vedar · limpar · drenar',
      ),
      dangerZone(
        'PEGADINHAS — manejo de vetores',
        [
          {
            label: 'Letra A — esgoto inadequado',
            detail: 'Esgotamento sanitário inadequado.',
            correct: 'Isso favorece criadouros — não elimina vetores.',
          },
          {
            label: 'Letra C — limpeza só às vezes',
            detail: 'Limpeza urbana somente quando se fizer necessária.',
            correct: 'Controle mecânico exige rotina nos criadouros — não ação eventual.',
          },
          {
            label: 'Letra D — crescimento desordenado',
            detail: 'Aumento populacional e território urbano desordenado.',
            correct: 'É fator de risco ambiental — não medida de eliminação.',
          },
          {
            label: 'Letra E — educação sem povo',
            detail: 'Educação sem participação da população nos criadouros.',
            correct: 'Manejo integrado precisa da comunidade na eliminação dos criadouros.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só fogger resolve o Aedes”.',
            correct: 'Químico pode complementar — a base é mecânico + educação.',
          },
        ],
        'Piorar ambiente ou excluir povo → distrator',
      ),
    ],
  },
  {
    file: 'copese-ufpi-enfermagem-atencao-basica-saude-da-familia-1778967776515-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Substituição na origem do perigo: processos/substâncias menos perigosas — emprego de manejo integrado de vetores (não produto mais tóxico/volátil).',
    sources: [{ ...GUIA, covers: ['substituição de risco', 'manejo integrado de vetores', 'ACE'] }],
    slides: [
      conceptMap(
        'Substituir o perigo na origem (ACE)',
        [
          { label: 'Ideia', detail: 'Trocar substância/processo por opção menos perigosa.', icon: 'Replace' },
          { label: 'Exemplo válido', detail: 'Sistemas de manejo integrado de vetores.', icon: 'Layers' },
          { label: 'Upgrade perigoso', detail: 'Mais tóxico, mais impacto ambiental ou mais volátil.', icon: 'Skull' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Trocar mochila por bolsa lateral e achar que resolve o perigo químico.', icon: 'AlertTriangle' },
        ],
        'Menos perigo na origem = manejo integrado',
      ),
      logicFlow(
        [
          'Comando: exemplo adequado de substituição por processo menos perigoso.',
          'Eliminar produtos mais seletivos porém mais tóxicos ou com maior impacto.',
          'Eliminar inseticida de maior volatilidade.',
          'Eliminar troca só de equipamento de aplicação (bolsa × mochila).',
          'Manter emprego de sistemas de manejo integrado de vetores.',
          'Marcar E.',
          'Em similares: substituição verdadeira muda o processo — não só a embalagem.',
        ],
        'Manejo integrado = substituição adequada',
      ),
      goldenRule(
        'Substituição de verdade',
        'O que vale',
        [
          { label: 'Sim', value: 'Manejo integrado de vetores (menos dependência do químico).', badge: 'ok' },
          { label: 'Não', value: 'Mais tóxico · mais impacto · mais volátil · só trocar bolsa/mochila.', badge: 'warn' },
        ],
        'Origem do perigo ≠ acessório',
      ),
      dangerZone(
        'PEGADINHAS — substituição ACE',
        [
          {
            label: 'Letra A — mais tóxico',
            detail: 'Produtos mais seletivos, mais tóxicos.',
            correct: 'Mais tóxico aumenta o perigo — não é substituição segura.',
          },
          {
            label: 'Letra B — maior impacto',
            detail: 'Produtos mais seletivos com maior impacto ambiental.',
            correct: 'Maior impacto ambiental contradiz a lógica de reduzir o perigo.',
          },
          {
            label: 'Letra C — mais volátil',
            detail: 'Inseticidas de maior volatilidade.',
            correct: 'Maior volatilidade eleva exposição — não é opção menos perigosa.',
          },
          {
            label: 'Letra D — bolsa lateral',
            detail: 'Bolsas laterais em vez de mochilas.',
            correct: 'Troca de equipamento não substitui o processo perigoso na origem.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “EPI mais grosso no lugar de eliminar o criadouro”.',
            correct: 'EPI protege; substituição ataca a origem do perigo.',
          },
        ],
        'Aumentar toxicidade/volatilidade → distrator',
      ),
    ],
  },
  {
    file: 'copese-ufpi-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563804667-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Endemia = presença contínua de enfermidade/agente em zona geográfica determinada. Epidemia/surto = excesso; pandemia = vários continentes.',
    sources: [{ ...GUIA, covers: ['endemia', 'epidemia', 'pandemia'] }],
    slides: [
      conceptMap(
        'Endemia × epidemia × pandemia',
        [
          { label: 'Pergunta', detail: 'Qual definição corresponde à ENDEMIA?', icon: 'MapPin' },
          { label: 'Endemia', detail: 'Presença contínua em zona geográfica determinada.', icon: 'Map' },
          { label: 'Excesso', detail: 'Aumento acima do esperado = epidemia/surto (não endemia).', icon: 'TrendingUp' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Descrever endemia com linguagem de epidemia ou pandemia.', icon: 'AlertTriangle' },
        ],
        'Contínua + área determinada = endemia',
      ),
      logicFlow(
        [
          'Isolar a palavra ENDEMIA no comando.',
          'Eliminar aumento repentino / acima do esperado (epidemia/surto).',
          'Eliminar vários continentes ao mesmo tempo (pandemia).',
          'Eliminar “larga área + grande número” genérico sem o traço contínuo local.',
          'Manter: presença contínua em zona geográfica determinada.',
          'Marcar C.',
          'Em similares: contínuo + território fixo → endemia.',
        ],
        'Presença contínua em zona determinada → C',
      ),
      goldenRule(
        'Três escalas',
        'Decore em uma linha',
        [
          { label: 'Endemia', value: 'Presença contínua em área determinada.', badge: 'ok' },
          { label: 'Epidemia/surto', value: 'Frequência acima do esperado.', badge: 'warn' },
          { label: 'Pandemia', value: 'Excesso em vários continentes.', badge: 'warn' },
        ],
        'Contínua ≠ pico',
      ),
      dangerZone(
        'PEGADINHAS — ocorrência',
        [
          {
            label: 'Letra A — aumento repentino',
            detail: 'Aumento repentino da frequência de casos.',
            correct: 'Descreve surto/epidemia — não endemia.',
          },
          {
            label: 'Letra B — vários continentes',
            detail: 'Surtos em vários continentes ao mesmo tempo.',
            correct: 'É linguagem de pandemia.',
          },
          {
            label: 'Letra D — larga área genérica',
            detail: 'Grande número de pessoas em larga área.',
            correct: 'Falta o traço de presença contínua em zona determinada.',
          },
          {
            label: 'Letra E — acima do esperado',
            detail: 'Aumento acima do esperado em área/grupo/período.',
            correct: 'Definição clássica de epidemia/surto.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “endemia = surto controlado”.',
            correct: 'Surto é excesso; endemia é habitualidade no território.',
          },
        ],
        'Colar pico no lugar de contínuo → distrator',
      ),
    ],
  },
  {
    file: 'copese-ufpi-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563804667-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Vigilância entomológica de arboviroses: calcular indicadores de larva (IIP), ovo (positividade) e adulto (densidade/armadilhas) para orientar manejo.',
    sources: [{ ...GUIA, covers: ['vigilância entomológica', 'IIP', 'ovitrampas', 'Aedes'] }],
    slides: [
      conceptMap(
        'Vigilância entomológica — o que medir',
        [
          { label: 'Finalidade', detail: 'Detectar presença, distribuição e densidade do vetor no tempo/espaço.', icon: 'Bug' },
          { label: 'Indicadores', detail: 'Fase larva (IIP), ovo (positividade) e adulto (densidade/armadilhas).', icon: 'BarChart3' },
          { label: 'Uso', detail: 'Estimar risco e direcionar manejo integrado.', icon: 'Target' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Dizer que ovitrampa “saiu de moda” ou que mapa do vetor é dispensável.', icon: 'AlertTriangle' },
        ],
        'Medir larva + ovo + adulto',
      ),
      logicFlow(
        [
          'Comando: objetivo/atividade da vigilância entomológica das arboviroses.',
          'Eliminar “ovitrampa em desuso” e “mapa do vetor dispensável”.',
          'Eliminar foco só em pontos com baixa concentração de depósitos e “helmintos”.',
          'Manter cálculo dos indicadores de larva, ovo e adulto.',
          'Marcar E.',
          'Em similares: se a alternativa despreza indicador ou troca arbovírus por helminto, mate.',
        ],
        'Indicadores larva/ovo/adulto → E',
      ),
      goldenRule(
        'Três fases, três índices',
        'Decore',
        [
          { label: 'Larva', value: 'Índice de Infestação Predial (IIP).', badge: 'ok' },
          { label: 'Ovo', value: 'Índice de Positividade de Ovo.', badge: 'ok' },
          { label: 'Adulto', value: 'Densidade/positividade de armadilhas nas residências.', badge: 'ok' },
        ],
        'IIP · ovo · adulto',
      ),
      dangerZone(
        'PEGADINHAS — entomologia',
        [
          {
            label: 'Letra A — ovitrampa fora',
            detail: 'Ovitrampas/larvitrampas em desuso.',
            correct: 'Armadilhas de ovo/larva seguem no monitoramento — não “sairam de moda”.',
          },
          {
            label: 'Letra B — só ponto “vazio”',
            detail: 'Pesquisa indispensável só onde há baixa concentração de depósitos.',
            correct: 'Pontos estratégicos (cemitério, borracharia) têm alta — não baixa — concentração típica.',
          },
          {
            label: 'Letra C — mapa dispensável',
            detail: 'Distribuição/densidade dispensáveis para áreas de risco.',
            correct: 'Mapear o vetor é o núcleo da vigilância entomológica.',
          },
          {
            label: 'Letra D — helmintos',
            detail: 'Monitoramento para introdução dos helmintos.',
            correct: 'Arboviroses ≠ helmintos — o alvo é o vetor das arboviroses.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só adulticida, sem índice larval”.',
            correct: 'Sem indicador larval/ovo o risco fica cego.',
          },
        ],
        'Desprezar indicador ou trocar o alvo → distrator',
      ),
    ],
  },
  {
    file: 'copese-ufpi-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563804667-8.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Hanseníase: detectar/tratar cedo casos novos (corta transmissão e incapacidades). Notificação obrigatória; contatos sempre; público e privado.',
    sources: [{ ...HANSE, covers: ['detecção precoce', 'contatos', 'notificação hanseníase'] }],
    slides: [
      conceptMap(
        'Vigilância da hanseníase — objetivo central',
        [
          { label: 'Meta', detail: 'Detectar e tratar cedo os casos novos.', icon: 'Stethoscope' },
          { label: 'Por quê', detail: 'Interromper a cadeia de transmissão e prevenir incapacidades.', icon: 'Shield' },
          { label: 'Contatos', detail: 'Examinar e orientar contatos dos casos novos (não só se “grave”).', icon: 'Users' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Notificação opcional ou só em serviço público.', icon: 'AlertTriangle' },
        ],
        'Cedo: detectar + tratar + proteger contatos',
      ),
      logicFlow(
        [
          'Comando: objetivos da vigilância epidemiológica da hanseníase.',
          'Eliminar exame de contatos “só se grave” e notificação opcional.',
          'Eliminar “não notificar na semana” e isenção de serviços privados.',
          'Manter detectar e tratar precocemente para cortar transmissão e incapacidades.',
          'Marcar A.',
          'Em similares: hanseníase = notificação de todos os casos + busca de contatos.',
        ],
        'Detecção precoce + tratamento → A',
      ),
      goldenRule(
        'Três pilares',
        'O que a VE busca',
        [
          { label: 'Caso novo', value: 'Detectar e tratar precocemente.', badge: 'ok' },
          { label: 'Efeito', value: 'Cortar transmissão e prevenir incapacidade.', badge: 'ok' },
          { label: 'Sistema', value: 'Notificar todos; contatos sempre; público e privado.', badge: 'warn' },
        ],
        'Precoce · transmissão · incapacidade',
      ),
      dangerZone(
        'PEGADINHAS — hanseníase',
        [
          {
            label: 'Letra B — contato só se grave',
            detail: 'Examinar contatos só se houver notificação de casos graves.',
            correct: 'Contatos de casos novos entram na rotina — não dependem de “grave”.',
          },
          {
            label: 'Letra C — notificação opcional',
            detail: 'Notificar opcionalmente e investigar só o obrigatório.',
            correct: 'Hanseníase é de notificação compulsória — não opcional.',
          },
          {
            label: 'Letra D — sem semana epidemiológica',
            detail: 'Não precisa notificar na semana do diagnóstico para todos.',
            correct: 'Todos os casos devem ser notificados conforme o fluxo da ficha.',
          },
          {
            label: 'Letra E — privado isento',
            detail: 'Ficha só em serviços públicos; privados isentos.',
            correct: 'A obrigação de notificar alcança também serviços privados.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só notifica multibacilar”.',
            correct: 'Caso novo de hanseníase notifica — independente da forma clínica.',
          },
        ],
        'Afrouxar notificação/contatos → distrator',
      ),
    ],
  },
  {
    file: 'cotec-fadenor-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Sistema oficial de notificação compulsória no Brasil: SINAN (Sistema de Informação de Agravos de Notificação). Estados/municípios podem incluir agravos locais.',
    sources: [{ ...SINAN, covers: ['SINAN', 'notificação compulsória'] }],
    slides: [
      conceptMap(
        'Qual sistema notifica?',
        [
          { label: 'Função', detail: 'Notificação e investigação dos agravos da lista nacional.', icon: 'Database' },
          { label: 'Nome certo', detail: 'Sistema de Informação de Agravos de Notificação — SINAN.', icon: 'FileInput' },
          { label: 'Flexível', detail: 'Estados e municípios podem incluir problemas locais.', icon: 'MapPin' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Siglas inventadas (SISN, SIDNC, SIDN, SISC).', icon: 'AlertTriangle' },
        ],
        'SINAN = agravos de notificação',
      ),
      logicFlow(
        [
          'Comando: sistema oficial de notificação compulsória no Brasil.',
          'Eliminar siglas inventadas (SISN, SIDNC, SIDN, SISC).',
          'Reconhecer SINAN — Sistema de Informação de Agravos de Notificação.',
          'Marcar B.',
          'Em similares: se a sigla não for SINAN, desconfie.',
        ],
        'Sistema oficial = SINAN → B',
      ),
      goldenRule(
        'Nome por extenso',
        'Decore',
        [
          { label: 'SINAN', value: 'Sistema de Informação de Agravos de Notificação.', badge: 'ok' },
          { label: 'Armadilha', value: 'Siglas parecidas com “suspeita/compulsória” inventadas.', badge: 'warn' },
        ],
        'SINAN = oficial',
      ),
      dangerZone(
        'PEGADINHAS — sigla do sistema',
        [
          {
            label: 'Letra A — SISN',
            detail: 'Sistema de Informação de Suspeitas de Notificação.',
            correct: 'Sigla inventada — o oficial é SINAN.',
          },
          {
            label: 'Letra C — SIDNC',
            detail: 'Sistema de Informação de Doenças de Notificação Compulsória.',
            correct: 'Nome inventado; a banca quer SINAN.',
          },
          {
            label: 'Letra D — SIDN',
            detail: 'Sistema de Informação de Doenças de Notificáveis.',
            correct: 'Não é o sistema oficial brasileiro.',
          },
          {
            label: 'Letra E — SISC',
            detail: 'Sistema de Informação de Suspeitas Compulsórias.',
            correct: 'Sigla falsa — responda SINAN.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: confundir SINAN com SIM ou SINASC.',
            correct: 'SIM = mortalidade; SINASC = nascidos; SINAN = agravos notificáveis.',
          },
        ],
        'Sigla inventada → distrator',
      ),
    ],
  },
  {
    file: 'cotec-fadenor-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563800137-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Trio notificável: tuberculose, caso suspeito de dengue, meningite. Intrusos: cefaleia, HAS, candidíase, varicocele.',
    sources: [{ ...LISTA, covers: ['tuberculose', 'dengue', 'meningite', 'lista nacional'] }],
    slides: [
      conceptMap(
        'Trio só com notificáveis',
        [
          {
            label: 'Sistema',
            detail: 'Sinan alimentado pela notificação e investigação da lista nacional de doenças.',
            icon: 'Database',
          },
          {
            label: 'Comando',
            detail: 'Todas as doenças informadas são de notificação compulsória no Brasil.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'Trio limpo',
            detail: 'Tuberculose, caso suspeito de dengue e meningite.',
            icon: 'CheckCircle2',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar cefaleia, hipertensão arterial, candidíase vaginal ou varicocele no conjunto.',
            icon: 'AlertTriangle',
          },
        ],
        'Os três precisam estar na lista nacional',
      ),
      logicFlow(
        [
          'Comando: todas as doenças informadas são de notificação compulsória no Brasil.',
          'Lembrar: Sinan recebe notificação e investigação dos agravos da lista nacional.',
          'Eliminar trios com cefaleia, hipertensão arterial, candidíase vaginal ou varicocele.',
          'Validar tuberculose + caso suspeito de dengue + meningite.',
          'Marcar A.',
          'Em similares: um intruso clínico comum derruba o conjunto da lista.',
        ],
        'Tuberculose + dengue suspeita + meningite → A',
      ),
      goldenRule(
        'Filtro do conjunto',
        'Como matar rápido',
        [
          { label: 'Regra', value: 'Três doenças de notificação compulsória — zero intruso.', badge: 'ok' },
          { label: 'Intruso típico', value: 'Cefaleia · hipertensão arterial · candidíase vaginal · varicocele.', badge: 'warn' },
          { label: 'Trio desta prova', value: 'Tuberculose · caso suspeito de dengue · meningite.', badge: 'ok' },
        ],
        'Um intruso = alternativa morta',
      ),
      dangerZone(
        'PEGADINHAS — lista no trio',
        [
          {
            label: 'Letra B — cefaleia',
            detail: 'Caso suspeito de dengue, cefaleia, leptospirose.',
            correct: 'Cefaleia não fecha notificação compulsória no Brasil nesse conjunto.',
          },
          {
            label: 'Letra C — hipertensão',
            detail: 'Leptospirose, hipertensão arterial, varicela.',
            correct: 'Hipertensão arterial derruba o conjunto da lista nacional.',
          },
          {
            label: 'Letra D — varicocele/candidíase',
            detail: 'Varicocele, candidíase vaginal, meningite.',
            correct: 'Dois intrusos — só meningite não salva o trio.',
          },
          {
            label: 'Letra E — candidíase/varicocele',
            detail: 'Candidíase vaginal, sarampo e varicocele.',
            correct: 'Intrusos clínicos comuns invalidam doenças de notificação compulsória.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “gripe comum” no meio de tuberculose e meningite.',
            correct: 'Mesma lógica: procure o nome fora da lista nacional.',
          },
        ],
        'Intruso no trio → distrator',
      ),
    ],
  },
  {
    file: 'cotec-fadenor-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563853014-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Só imediata: peçonhento, Chagas aguda, Hib invasiva, Zika gestante, FA, peste, raiva, SRAG, violência/suicídio. Dengue casos/Chagas crônica quebram.',
    sources: [{ ...LISTA, covers: ['notificação imediata', 'Chagas aguda', 'dengue semanal'] }],
    exam_vs_current: 'Conjunto conforme caderno da prova; dengue casos não é imediata.',
    slides: [
      conceptMap(
        'APENAS notificação imediata',
        [
          { label: 'Comando', detail: 'Conjunto só com eventos de notificação compulsória imediata.', icon: 'Zap' },
          { label: 'Imediatas típicas', detail: 'Chagas aguda, FA, peste, raiva, SRAG coronavírus, violência sexual/suicídio, peçonhento.', icon: 'BellRing' },
          { label: 'Quebra o “apenas”', detail: 'Casos de dengue, Chagas crônica, Chikungunya, Zika sem o recorte gestante.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Colar dengue (casos) no meio de um combo imediato.', icon: 'AlertTriangle' },
        ],
        'Um semanal/crônico derruba o conjunto',
      ),
      logicFlow(
        [
          'Exigir APENAS imediata — um intruso de outra periodicidade mata a opção.',
          'Eliminar listas com casos de dengue, Chagas crônica, Chikungunya ou Zika genérica.',
          'Manter o combo com Chagas aguda (não crônica) e demais imediatas.',
          'Marcar E.',
          'Em similares: leia “aguda” versus “crônica” e “casos de dengue” versus imediata.',
        ],
        'Chagas aguda no combo limpo → E',
      ),
      goldenRule(
        'Filtro “apenas imediata”',
        'Como varrer a lista',
        [
          { label: 'OK imediato', value: 'Peçonhento · Chagas aguda · FA · peste · raiva · SRAG · violência/suicídio.', badge: 'ok' },
          { label: 'Quebra', value: 'Dengue (casos) · Chagas crônica · Chikungunya · Zika sem gestante.', badge: 'warn' },
        ],
        'Aguda sim · crônica/dengue casos não',
      ),
      dangerZone(
        'PEGADINHAS — só imediata',
        [
          {
            label: 'Letra A — dengue casos',
            detail: 'Inclui casos de dengue no combo.',
            correct: 'Casos de dengue não são o bolso da notificação imediata.',
          },
          {
            label: 'Letra B — Chagas crônica',
            detail: 'Troca aguda por doença de Chagas crônica.',
            correct: 'Crônica quebra o critério “apenas imediata”; a aguda entra.',
          },
          {
            label: 'Letra C — Zika genérica',
            detail: 'Doença aguda pelo vírus Zika (sem recorte gestante) no meio.',
            correct: 'O recorte imediato clássico da lista enfatiza Zika em gestante — a genérica quebra o “apenas”.',
          },
          {
            label: 'Letra D — Chikungunya',
            detail: 'Inclui febre Chikungunya.',
            correct: 'Chikungunya não fecha o conjunto “apenas imediata” desta chave.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “dengue grave” no lugar de “casos”.',
            correct: 'Relógio muda com a forma — leia o termo exato da lista.',
          },
        ],
        'Intruso semanal/crônico → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g04',
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
