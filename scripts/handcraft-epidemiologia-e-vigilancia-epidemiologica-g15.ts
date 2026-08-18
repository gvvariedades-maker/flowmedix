/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g15 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g15.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g15';
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
const AEDES = {
  id: 'diretrizes-controle-aedes-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Diretrizes nacionais para prevenção e controle do Aedes aegypti',
  year: 2021,
  url: 'https://www.gov.br/saude/pt-br',
};
const ROEDORES = {
  id: 'manual-controle-roedores-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Manual de controle de roedores — anti-ratização e desratização',
  year: 2002,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/manual_roedores.pdf',
};
const DESASTRES = {
  id: 'guia-desastres-saude-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Guia de preparação e resposta da saúde a desastres — COE Saúde',
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
    file: 'ibfc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563838275-2.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Imediata: botulismo, tularemia, poliomielite. Esquistossomose NÃO é imediata (fluxo semanal) — INCORRETA nesta chave.',
    sources: [{ ...LISTA, covers: ['notificação imediata', 'esquistossomose', 'botulismo', 'poliomielite'] }],
    slides: [
      conceptMap(
        'Imediata — ache a INCORRETA',
        [
          {
            label: 'Definição',
            detail: 'Notificação = comunicação obrigatória à autoridade de saúde (médicos, profissionais, estabelecimentos públicos/privados).',
            icon: 'Search',
          },
          { label: 'Escopo', detail: 'Suspeita ou confirmação de doença, agravo ou evento de saúde pública.', icon: 'FileWarning' },
          { label: 'Imediata típica', detail: 'Botulismo, tularemia e poliomielite pedem ação rápida.', icon: 'Zap' },
          { label: 'Fora do relógio', detail: 'Esquistossomose segue fluxo semanal — não é imediata.', icon: 'Calendar' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Meter esquistossomose no imediato só porque é compulsória.', icon: 'AlertTriangle' },
        ],
        'Compulsória ≠ mesmo prazo',
      ),
      logicFlow(
        [
          'Assinale a alternativa incorreta sobre notificação compulsória imediata.',
          'Validar botulismo, tularemia e poliomielite como imediatas típicas.',
          'Isolar esquistossomose → fora do bolso imediato (semanal).',
          'Marcar D.',
          'Em similares: leia o relógio — imediata × semanal — antes de marcar a lista.',
        ],
        'Esquistossomose fora do imediato → D',
      ),
      goldenRule(
        'Relógio imediato',
        'Decore',
        [
          { label: 'Imediata (exemplos)', value: 'Botulismo · tularemia · poliomielite.', badge: 'ok' },
          { label: 'Esquistossomose', value: 'Compulsória, mas não imediata nesta chave.', badge: 'warn' },
          { label: 'Quem notifica', value: 'Médicos, profissionais e responsáveis pelos estabelecimentos.', badge: 'ok' },
        ],
        'Imediato não cobre toda a lista compulsória',
      ),
      dangerZone(
        'PEGADINHAS — imediata INCORRETA',
        [
          {
            label: 'Letra A — botulismo',
            detail: 'Botulismo.',
            correct: 'É imediata típica — não é a INCORRETA.',
          },
          {
            label: 'Letra B — tularemia',
            detail: 'Tularemia.',
            correct: 'Entra no relógio imediato — não é a falha.',
          },
          {
            label: 'Letra C — poliomielite',
            detail: 'Poliomielite.',
            correct: 'Polio = imediata clássica — não é a INCORRETA.',
          },
          {
            label: 'Letra D — esquistossomose',
            detail: 'Esquistossomose.',
            correct: 'INCORRETA: esquistossomose não é de notificação imediata.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “toda compulsória = imediata”.',
            correct: 'Lista tem prazos diferentes — compulsória ≠ imediata.',
          },
        ],
        'Confundir compulsória com imediata → distrator',
      ),
    ],
  },
  {
    file: 'idcap-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563789263-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Vigilância em Saúde: transmissíveis, não-transmissíveis, situação de saúde, ambiental e sanitária.',
    sources: [{ ...GUIA, covers: ['vigilância em saúde', 'componentes', 'vigilância sanitária', 'ambiental'] }],
    slides: [
      conceptMap(
        'Cinco braços da Vigilância em Saúde',
        [
          { label: 'Transmissíveis', detail: 'Vigilância e controle de doenças transmissíveis.', icon: 'Bug' },
          { label: 'Não-transmissíveis', detail: 'DCNT e agravos crônicos no mesmo guarda-chuva.', icon: 'Activity' },
          { label: 'Situação + ambiente + sanitária', detail: 'Situação de saúde, ambiental em saúde e sanitária.', icon: 'Layers' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Trocar o pacote por “só VE + promoção + zoonoses”.', icon: 'AlertTriangle' },
        ],
        'Cinco componentes oficiais',
      ),
      logicFlow(
        [
          'Isolar o pacote completo de Vigilância em Saúde.',
          'Eliminar opções que trocam DCNTs por promoção/zoonoses/saúde mental.',
          'Eliminar as que omitem situação de saúde ou ambiental.',
          'Manter: transmissíveis + não-transmissíveis + situação + ambiental + sanitária.',
          'Marcar E.',
          'Em similares: Vigilância em Saúde ≠ só epidemiológica — conte os cinco braços.',
        ],
        'Cinco braços → letra E',
      ),
      goldenRule(
        'Pacote Vigilância em Saúde',
        'Decore',
        [
          { label: '1–2', value: 'Transmissíveis · não-transmissíveis.', badge: 'ok' },
          { label: '3–5', value: 'Situação de saúde · ambiental · sanitária.', badge: 'ok' },
          { label: 'Não confundir', value: 'Promoção/zoonoses sozinhas não fecham o pacote.', badge: 'warn' },
        ],
        'Cinco componentes — sem atalho',
      ),
      dangerZone(
        'PEGADINHAS — componentes',
        [
          {
            label: 'Letra A — zoonoses + trabalhador',
            detail: 'Mistura zoonoses, saúde do trabalhador e promoção.',
            correct: 'Não é o pacote canônico dos cinco componentes.',
          },
          {
            label: 'Letra B — alimentar + zoonoses',
            detail: 'Coloca vigilância alimentar e zoonoses no lugar das DCNTs.',
            correct: 'Falta não-transmissíveis e situação de saúde.',
          },
          {
            label: 'Letra C — endemias + saúde mental',
            detail: 'Troca DCNTs por endemias e saúde mental.',
            correct: 'Não reproduz o pacote oficial completo.',
          },
          {
            label: 'Letra D — vetores + promoção',
            detail: 'Prioriza vetores e promoção no lugar de DCNTs/situação.',
            correct: 'Omitiu não-transmissíveis e situação de saúde.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “VE sozinha = Vigilância em Saúde”.',
            correct: 'VE é um braço — o guarda-chuva tem cinco componentes.',
          },
        ],
        'Substituir DCNTs por promoção → distrator',
      ),
    ],
  },
  {
    file: 'idcap-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563789263-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Coleta e estruturação de dados na VE: subsidiar planejamento e avaliação dinâmicos das ações — não custo, exterior ou “só divulgação”.',
    sources: [{ ...GUIA, covers: ['vigilância epidemiológica', 'coleta de dados', 'planejamento', 'avaliação'] }],
    slides: [
      conceptMap(
        'Para que serve estruturar dados na VE?',
        [
          { label: 'Função', detail: 'Dados atualizados sobre incidência e fatores em área/população.', icon: 'Database' },
          { label: 'Uso', detail: 'Orientar decisão de medidas de controle no serviço.', icon: 'Compass' },
          { label: 'Papel da coleta', detail: 'Alimentar planejamento e avaliação contínuos das ações.', icon: 'RefreshCw' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Reduzir a coleta a “cortar custo” ou “só conscientizar”.', icon: 'AlertTriangle' },
        ],
        'Dado bom → planejar e avaliar',
      ),
      logicFlow(
        [
          'Isolar o papel primordial da coleta/estruturação.',
          'Eliminar custo operacional e compartilhamento entre países.',
          'Eliminar “só eficácia clínica” e conscientização pública isolada.',
          'Manter: subsidiar planejamento e avaliação dinâmicos.',
          'Marcar B.',
          'Em similares: dado de VE existe para decidir e reavaliar ação — não para marketing.',
        ],
        'Planejar + avaliar → letra B',
      ),
      goldenRule(
        'Coleta na VE',
        'Decore',
        [
          { label: 'Primordial', value: 'Subsidiar planejamento e avaliação das ações.', badge: 'ok' },
          { label: 'Não é', value: 'Cortar custo · só exterior · só campanha.', badge: 'warn' },
        ],
        'Dado serve à decisão contínua',
      ),
      dangerZone(
        'PEGADINHAS — papel da coleta',
        [
          {
            label: 'Letra A — custo',
            detail: 'Reduzir o custo operacional dos serviços.',
            correct: 'Pode ser efeito colateral — não é o papel primordial da coleta.',
          },
          {
            label: 'Letra C — países',
            detail: 'Facilitar compartilhamento entre países.',
            correct: 'Cooperação existe, mas o eixo local é planejar/avaliar ações.',
          },
          {
            label: 'Letra D — eficácia médica',
            detail: 'Contribuir para a eficácia das intervenções médicas.',
            correct: 'VE olha população/serviço — não só eficácia clínica isolada.',
          },
          {
            label: 'Letra E — conscientização',
            detail: 'Aumentar a conscientização pública.',
            correct: 'Educação ajuda, mas não é o papel primordial da coleta estruturada.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “SINAN serve só para estatística histórica”.',
            correct: 'Sistema alimenta ação — planejamento e avaliação em tempo útil.',
          },
        ],
        'Trocar decisão por custo/campanha → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-atencao-basica-saude-da-familia-1778712418722-0.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Larvicida é secundário ao controle mecânico. Pyriproxyfen NÃO é larvicida biológico (Bti é). Afirmar isso torna a alternativa incorreta.',
    exam_vs_current:
      'Prova trata Pyriproxyfen como “larvicida biológico” errado; Bti permanece o biológico de referência. Slides ensinam a chave da prova.',
    sources: [{ ...AEDES, covers: ['larvicida', 'Pyriproxyfen', 'Bti', 'controle mecânico', 'Aedes aegypti'] }],
    slides: [
      conceptMap(
        'Larvicida Aedes — ache a falha',
        [
          {
            label: 'Hierarquia',
            detail: 'Uso de larvicidas = medida secundária ao controle mecânico; só onde este se apresenta inviável.',
            icon: 'ListOrdered',
          },
          {
            label: 'Exemplos',
            detail: 'Coleções de água e fontes ornamentais sem criação de peixes; caixas d’água destampadas — larvicida transitório.',
            icon: 'Droplets',
          },
          {
            label: 'Fechamento',
            detail: 'Providências para fechamento das caixas devem ser desencadeadas imediatamente.',
            icon: 'Lock',
          },
          { label: 'Erro clássico', detail: 'Chamar Pyriproxyfen de “larvicida biológico”.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Aceitar qualquer nome “bio” sem checar a classe do produto.', icon: 'AlertTriangle' },
        ],
        'Biológico ≠ todo regulador',
      ),
      logicFlow(
        [
          'Assinale a alternativa incorreta sobre a temática dos larvicidas.',
          'Validar A/B/D: uso racional, critérios técnicos e perfil do biológico verdadeiro.',
          'Isolar C: Pyriproxyfen não é o larvicida biológico da diretriz.',
          'Marcar C.',
          'Em similares: Bti = biológico; Pyriproxyfen = outro perfil (não “bio” nesta chave).',
        ],
        'Pyriproxyfen ≠ biológico → C',
      ),
      goldenRule(
        'Classe do produto',
        'Decore',
        [
          { label: '1º', value: 'Controle mecânico (tampa, peixes, remoção de criadouros).', badge: 'ok' },
          { label: 'Secundário', value: 'Larvicida só em locais indicados — medida transitória.', badge: 'ok' },
          { label: 'Biológico', value: 'Bti — não Pyriproxyfen.', badge: 'ok' },
          { label: 'INCORRETA', value: 'Dizer que Pyriproxyfen é larvicida biológico.', badge: 'warn' },
        ],
        'Nome “bio” exige checar a classe do produto',
      ),
      dangerZone(
        'PEGADINHAS — larvicida INCORRETA',
        [
          {
            label: 'Letra A — química racional',
            detail: 'Evitar controle químico indiscriminado.',
            correct: 'Alinha à diretriz — não é a INCORRETA.',
          },
          {
            label: 'Letra B — dose e local',
            detail: 'Critérios técnicos de local, volume e monitoramento.',
            correct: 'Critérios técnicos de local, volume e monitoramento — não é a falha.',
          },
          {
            label: 'Letra C — Pyriproxyfen “bio”',
            detail: 'MS recomenda Pyriproxyfen como larvicida biológico.',
            correct: 'INCORRETA: Pyriproxyfen não é o larvicida biológico desta chave.',
          },
          {
            label: 'Letra D — perfil biológico',
            detail: 'Biológico com efeito menor, sem resíduo tóxico típico.',
            correct: 'Descreve o biológico verdadeiro — não é a INCORRETA.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “larvicida substitui tampas e limpeza”.',
            correct: 'Larvicida é secundário — mecânico vem primeiro.',
          },
        ],
        'Rotular Pyriproxyfen como bio → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-atencao-basica-saude-da-familia-1778712418722-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Anti-ratização: modificar ambiente (acesso, alimento, abrigo, água) + educação. Desratização = eliminar roedores já instalados.',
    sources: [{ ...ROEDORES, covers: ['anti-ratização', 'desratização', 'controle de roedores'] }],
    slides: [
      conceptMap(
        'Ambiente que não acolhe roedor = ?',
        [
          {
            label: 'Pista',
            detail: 'Conjunto de medidas que modificam características ambientais: acesso, alimento, abrigo e água.',
            icon: 'Home',
          },
          {
            label: 'Educação',
            detail: 'Informação, orientação e esclarecimento a pessoas, escolares e população em geral.',
            icon: 'GraduationCap',
          },
          {
            label: 'Viabilidade',
            detail: 'Agilidade dos serviços de coleta de lixo, aterros sanitários e legislação sanitária com a comunidade.',
            icon: 'Truck',
          },
          { label: 'Nome', detail: 'Anti-ratização — impede penetração, instalação e proliferação.', icon: 'ShieldCheck' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar desratização (matar) no lugar de prevenir.', icon: 'AlertTriangle' },
        ],
        'Prevenir ≠ exterminar',
      ),
      logicFlow(
        [
          'Leia o enunciado: medidas ambientais + educação contra penetração/proliferação.',
          'Eliminar exterminação e extinção (vocabulário de matar/acabar).',
          'Eliminar desratização (ação sobre infestação já instalada).',
          'Preencher com anti-ratização.',
          'Marcar D.',
          'Em similares: anti- = ambiente; desratizar = eliminar o que já entrou.',
        ],
        'Anti-ratização → letra D',
      ),
      goldenRule(
        'Dois tempos do controle',
        'Decore',
        [
          { label: 'Anti-ratização', value: 'Ambiente + educação — impede instalação e livre proliferação.', badge: 'ok' },
          { label: 'Desratização', value: 'Elimina roedores já presentes.', badge: 'warn' },
          { label: 'Apoio', value: 'Coleta de lixo ágil e participação da comunidade.', badge: 'ok' },
        ],
        'Anti- = prevenir · des- = eliminar',
      ),
      dangerZone(
        'PEGADINHAS — anti-ratização',
        [
          {
            label: 'Letra A — exterminação',
            detail: 'Exterminação.',
            correct: 'Fala em matar — não em modificar o ambiente.',
          },
          {
            label: 'Letra B — extinção',
            detail: 'Extinção.',
            correct: 'Não é o termo técnico do controle ambiental de roedores.',
          },
          {
            label: 'Letra C — desratização',
            detail: 'Desratização.',
            correct: 'É o combate ao roedor instalado — outro tempo da ação.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só raticida resolve o território”.',
            correct: 'Sem anti-ratização o roedor volta — ambiente manda.',
          },
        ],
        'Trocar prevenir por matar → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-atencao-basica-saude-da-familia-1778968239687-7.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Mesma chave larvicida: mecânico primeiro; Pyriproxyfen não é larvicida biológico — alternativa C incorreta.',
    exam_vs_current:
      'Mesma prova-irmã: slides ensinam a chave (Pyriproxyfen ≠ biológico); Bti permanece referência biológica.',
    sources: [{ ...AEDES, covers: ['larvicida', 'Pyriproxyfen', 'controle mecânico', 'resistência'] }],
    slides: [
      conceptMap(
        'Controle químico Aedes — falha',
        [
          {
            label: 'Ordem',
            detail: 'Larvicida é medida secundária: só onde o controle mecânico se apresenta inviável (fontes ornamentais, coleções de água).',
            icon: 'ArrowRight',
          },
          {
            label: 'Caixas',
            detail: 'Caixas d’água destampadas: larvicida transitório; fechamento deve ser desencadeado imediatamente.',
            icon: 'Box',
          },
          {
            label: 'Segurança',
            detail: 'Critérios técnicos de locais, quantidade, volume de água e monitoramento evitam dano e resistência.',
            icon: 'Scale',
          },
          { label: 'Afirmação falsa', detail: 'Tratar Pyriproxyfen como “larvicida biológico” do Ministério da Saúde.', icon: 'Ban' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Confundir regulador/IGR com o biológico de referência.', icon: 'AlertTriangle' },
        ],
        'Cheque a classe do larvicida',
      ),
      logicFlow(
        [
          'Assinale a alternativa incorreta sobre a temática apresentada.',
          'Manter A/B/D como coerentes com uso racional e perfil biológico.',
          'Cair em C: Pyriproxyfen rotulado como biológico — falha.',
          'Marcar C.',
          'Em similares: se a opção inventa classe do produto, é a INCORRETA.',
        ],
        'Classe errada do produto → C',
      ),
      goldenRule(
        'Mecânico → químico',
        'Decore',
        [
          { label: 'Secundário', value: 'Larvicida só quando mecânico não fecha o criadouro — peixes/tampa primeiro.', badge: 'ok' },
          { label: 'Falha', value: 'Chamar Pyriproxyfen de larvicida biológico.', badge: 'warn' },
          { label: 'Bio verdadeiro', value: 'Perfil sem resíduo tóxico típico (Bti) — duração menor, não cumulativo.', badge: 'ok' },
        ],
        'Classe errada = alternativa falsa nesta prova',
      ),
      dangerZone(
        'PEGADINHAS — Aedes INCORRETA',
        [
          {
            label: 'Letra A — evitar química',
            detail: 'Controle químico deve ser evitado quando há alternativa.',
            correct: 'É princípio da diretriz — não é a INCORRETA.',
          },
          {
            label: 'Letra B — critérios técnicos',
            detail: 'Local, quantidade e monitoramento.',
            correct: 'Uso correto do larvicida — não é a falha.',
          },
          {
            label: 'Letra C — Pyriproxyfen biológico',
            detail: 'MS recomenda Pyriproxyfen como larvicida biológico + rotatividade.',
            correct: 'INCORRETA nesta chave: Pyriproxyfen não é o biológico.',
          },
          {
            label: 'Letra D — efeito do biológico',
            detail: 'Biológico com duração menor e sem resíduo tóxico típico.',
            correct: 'Descreve o biológico — não é a INCORRETA.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “caixa d’água aberta = larvicida permanente”.',
            correct: 'Larvicida é transitório — feche a caixa.',
          },
        ],
        'Inventar classe “bio” → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-atencao-basica-saude-da-familia-1778968263411-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Mesma chave anti-ratização: modificar acesso/alimento/abrigo/água + educação; desratização é outro tempo.',
    sources: [{ ...ROEDORES, covers: ['anti-ratização', 'acesso', 'alimento', 'abrigo', 'água'] }],
    slides: [
      conceptMap(
        'Modificar acesso/alimento/abrigo = ?',
        [
          {
            label: 'Quatro portas',
            detail: 'Conjunto de medidas que visam modificar características ambientais: acesso, alimento, abrigo e água.',
            icon: 'Home',
          },
          {
            label: 'Educação',
            detail: 'Ações de educação em saúde: informação, orientação e esclarecimento a escolares e população.',
            icon: 'GraduationCap',
          },
          {
            label: 'Viabilidade',
            detail: 'Agilidade da coleta de lixo, aprimoramento de aterros sanitários, legislação e participação da comunidade.',
            icon: 'Truck',
          },
          { label: 'Termo', detail: 'Anti-ratização — impede penetração, instalação e livre proliferação.', icon: 'Shield' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Responder “desratização” por ser o termo mais ouvido.', icon: 'AlertTriangle' },
        ],
        'Ambiente primeiro — depois o veneno',
      ),
      logicFlow(
        [
          'Leia e responda: medidas que mudam o ambiente favorável ao roedor + educação.',
          'Cortar exterminação/extinção (não são o jargão técnico aqui).',
          'Cortar desratização (combate ao animal já instalado).',
          'Fechar em anti-ratização.',
          'Marcar D.',
          'Em similares: se o texto fala em lixo/saneamento/educação, pense anti-ratização.',
        ],
        'Ambiente + educação → D',
      ),
      goldenRule(
        'Anti- × des-',
        'Decore',
        [
          { label: 'Anti-ratização', value: 'Fecha portas ambientais + educa pessoas ligadas ao problema.', badge: 'ok' },
          { label: 'Desratização', value: 'Remove o roedor já presente.', badge: 'warn' },
          { label: 'Apoio', value: 'Serviços de coleta ágeis tornam as medidas viáveis.', badge: 'ok' },
        ],
        'Texto ambiental = anti-ratização nesta chave',
      ),
      dangerZone(
        'PEGADINHAS — roedores',
        [
          {
            label: 'Letra A — exterminação',
            detail: 'Exterminação.',
            correct: 'Não nomeia o pacote ambiental + educação da prova.',
          },
          {
            label: 'Letra B — extinção',
            detail: 'Extinção.',
            correct: 'Termo genérico — não é a definição dada.',
          },
          {
            label: 'Letra C — desratização',
            detail: 'Desratização.',
            correct: 'É eliminação do roedor — não a mudança ambiental descrita.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “educação sozinha sem coleta de lixo basta”.',
            correct: 'Anti-ratização precisa de serviço de limpeza viável.',
          },
        ],
        'Ouvir “rato” e marcar desratizar → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1778712242196-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'COE Saúde na fase de redução de risco: planejar ações para identificar e reduzir vulnerabilidades — prevenção/resiliência, não só resposta pós-desastre.',
    sources: [{ ...DESASTRES, covers: ['COE Saúde', 'redução de risco', 'vulnerabilidades', 'desastres'] }],
    slides: [
      conceptMap(
        'COE Saúde — fase de redução de risco',
        [
          { label: 'Fase', detail: 'Antes do desastre: reduzir vulnerabilidades do município.', icon: 'Map' },
          { label: 'Função', detail: 'Planejar identificação e mitigação + cultura de resiliência.', icon: 'ClipboardList' },
          { label: 'Não é agora', detail: 'Só coordenar socorro depois do evento (isso é resposta).', icon: 'Ambulance' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Colocar o COE só na emergência já instalada.', icon: 'AlertTriangle' },
        ],
        'Redução = antes · resposta = depois',
      ),
      logicFlow(
        [
          'Âncora: atuação do COE na fase de redução de risco.',
          'Eliminar resposta pós-desastre e monitoramento meteorológico isolado.',
          'Eliminar financiamento de obra e campanha endêmica genérica.',
          'Manter: planejar identificar/reduzir vulnerabilidades e resiliência.',
          'Marcar D.',
          'Em similares: leia a fase — redução ≠ resposta ≠ recuperação.',
        ],
        'Reduzir vulnerabilidade → letra D',
      ),
      goldenRule(
        'Fases × COE',
        'Decore',
        [
          { label: 'Redução de risco', value: 'Planejar e cortar vulnerabilidades.', badge: 'ok' },
          { label: 'Resposta', value: 'Coordenar socorro após o evento.', badge: 'warn' },
          { label: 'Não confundir', value: 'Meteorologia ou obra sozinha ≠ papel do COE nesta fase.', badge: 'warn' },
        ],
        'Fase define a função do COE',
      ),
      dangerZone(
        'PEGADINHAS — COE Saúde',
        [
          {
            label: 'Letra A — resposta',
            detail: 'Coordenar socorro após o desastre.',
            correct: 'É fase de resposta — não redução de risco.',
          },
          {
            label: 'Letra B — meteorologia',
            detail: 'Monitorar condições meteorológicas em tempo real.',
            correct: 'Pode apoiar alerta, mas não descreve a função pedida do COE.',
          },
          {
            label: 'Letra C — financiamento',
            detail: 'Elaborar programas de financiamento de infraestrutura.',
            correct: 'Não é o papel central do COE na redução de risco desta chave.',
          },
          {
            label: 'Letra E — endemias',
            detail: 'Campanhas sobre doenças endêmicas.',
            correct: 'Promoção genérica — não ancora redução de risco de desastre.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “COE só existe depois que o hospital lotou”.',
            correct: 'COE também age na redução — antes do colapso.',
          },
        ],
        'Colocar COE só no socorro → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g15',
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
