/**
 * Handcraft golden-v1 — atencao-basica-saude-da-familia-g13 (8 slugs).
 * Run: npx tsx scripts/handcraft-atencao-basica-saude-da-familia-g13.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'atencao-basica-saude-da-familia-g13';
const DIR = path.join('data/catalog-migration', LOTE, 'questions');
const SUB = 'Atenção Básica / Saúde da Família';
const TOPICO = 'Enfermagem';

const PNAB = {
  id: 'pnab-2436-2017',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Portaria GM/MS nº 2.436/2017 — Política Nacional de Atenção Básica',
  year: 2017,
  url: 'https://bvsms.saude.gov.br/bvs/saudelegis/gm/2017/prt2436_22_09_2017.html',
};

const LEI_ACS = {
  id: 'lei-11350-acs',
  tier: 'A' as const,
  issuer: 'Presidência da República',
  title: 'Lei nº 11.350/2006 (alterações Lei nº 13.595/2018) — ACS e ACE',
  year: 2018,
  url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13595.htm',
};

const VIOLENCIA_MS = {
  id: 'ms-violencia-aps',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Linha de cuidado / notificação de violência na Atenção Básica',
  year: 2016,
  url: 'https://www.gov.br/saude/pt-br',
  covers: ['vulnerabilidade', 'notificação', 'rede intersetorial'],
};

type Item = { label: string; detail?: string; icon?: string; correct?: string };
type Row = { label: string; value: string; badge?: string };

function slideMeta() {
  return { topico: TOPICO, subtopico: SUB };
}

function conceptMap(
  title: string,
  items: Item[],
  footer: string,
) {
  return {
    type: 'concept_map' as const,
    slide_title: title,
    meta: slideMeta(),
    items,
    footer_rule: footer,
  };
}

function logicFlow(steps: string[], footer: string) {
  return {
    type: 'logic_flow' as const,
    reveal_mode: 'tap' as const,
    meta: slideMeta(),
    steps,
    footer_rule: footer,
  };
}

function goldenRule(
  title: string,
  content: string,
  rows: Row[],
  footer: string,
) {
  return {
    type: 'golden_rule' as const,
    slide_title: title,
    meta: slideMeta(),
    content,
    rows,
    footer_rule: footer,
  };
}

function dangerZone(content: string, items: Item[], footer: string) {
  return {
    type: 'danger_zone' as const,
    bullet_style: 'x_icon' as const,
    meta: slideMeta(),
    content,
    items,
    footer_rule: footer,
  };
}

type Patch = {
  file: string;
  family: string;
  pedagogical_branch: string;
  guideline_snapshot: string;
  sources: Array<Record<string, unknown>>;
  slides: unknown[];
};

const PATCHES: Patch[] = [
  {
    file: 'ibade-enfermagem-atencao-basica-saude-da-familia-1778968144588-2.json',
    family: 'conceito',
    pedagogical_branch: 'ab_acs_territorio',
    guideline_snapshot:
      'ACS identifica risco/vulnerabilidade: determinantes sociais, mapa epidemiológico e abordagem interdisciplinar',
    sources: [
      { ...LEI_ACS, covers: ['risco', 'vulnerabilidade', 'território'] },
      { ...PNAB, covers: ['determinantes sociais', 'intersetorialidade'] },
    ],
    slides: [
      conceptMap(
        'Risco e vulnerabilidade — ACS',
        [
          {
            label: 'Afirmativa I',
            detail:
              'Determinantes sociais explicam por que certos grupos ficam mais vulneráveis.',
            icon: 'Users',
          },
          {
            label: 'Afirmativa II',
            detail:
              'Mapa epidemiológico localiza risco e orienta prevenção/promoção.',
            icon: 'Map',
          },
          {
            label: 'Afirmativa III',
            detail:
              'Saúde + assistência social leem a vulnerabilidade de forma holística.',
            icon: 'HeartHandshake',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail:
              'Aceitar só “assistência social” e cortar determinantes ou mapa.',
            icon: 'AlertTriangle',
          },
        ],
        'Determinantes · mapa · intersetorial',
      ),
      logicFlow(
        [
          'Julgar I, II e III no papel do ACS em risco/vulnerabilidade.',
          'I verdadeira: determinantes sociais revelam vulnerabilidade de grupos.',
          'II verdadeira: mapeamento epidemiológico guia prevenção e promoção.',
          'III verdadeira: abordagem interdisciplinar (saúde + assistência) é essencial.',
          'I+II+III corretas → marcar C.',
          'Em similares: risco no território junta dado social, mapa e rede intersetorial.',
        ],
        'Portátil: I+II+III',
      ),
      goldenRule(
        'Decore — risco ACS',
        'TRÊS LENTES',
        [
          {
            label: 'Social',
            value: 'Determinantes sociais → vulnerabilidade de grupos.',
            badge: 'ok',
          },
          {
            label: 'Epidemiológico',
            value: 'Mapa de risco → ações preventivas no território.',
            badge: 'ok',
          },
          {
            label: 'Intersetorial',
            value: 'Saúde + assistência = leitura holística.',
            badge: 'ok',
          },
          {
            label: 'Armadilha',
            value: 'Escolher combinação parcial e “cortar” uma lente.',
            badge: 'warn',
          },
        ],
        'Decore: as três lentes entram juntas',
      ),
      dangerZone(
        'PEGADINHAS — combinação',
        [
          {
            label: 'Letra A — só III',
            detail: 'Mantém só a interdisciplinaridade.',
            correct:
              'I (determinantes) e II (mapa) também descrevem a atuação do ACS.',
          },
          {
            label: 'Letra B — I e III',
            detail: 'Corta o mapeamento epidemiológico.',
            correct:
              'II também é correta: mapa de risco orienta prevenção/promoção.',
          },
          {
            label: 'Letra D — só II',
            detail: 'Fica só no mapa.',
            correct:
              'I e III também são corretas (determinantes + interdisciplinaridade).',
          },
          {
            label: 'Letra E — só I',
            detail: 'Fica só nos determinantes.',
            correct:
              'II e III também valem (mapa + abordagem interdisciplinar).',
          },
          {
            label: 'Transferência',
            detail: '“Vulnerabilidade é só dado clínico”.',
            correct:
              'No território, ACS cruza social, epidemiológico e rede intersetorial.',
          },
        ],
        'Combinação parcial → distrator',
      ),
    ],
  },
  {
    file: 'ibade-enfermagem-atencao-basica-saude-da-familia-1778968144588-4.json',
    family: 'conceito',
    pedagogical_branch: 'ab_acs_territorio',
    guideline_snapshot:
      'Condicionalidades Bolsa Família — análise interdisciplinar do acesso à educação (ACS/território)',
    sources: [
      { ...LEI_ACS, covers: ['condicionalidades', 'CRAS', 'território'] },
      { ...PNAB, covers: ['intersetorialidade', 'cuidado longitudinal'] },
    ],
    slides: [
      conceptMap(
        'Bolsa Família — condicionalidade educação',
        [
          {
            label: 'Cenário',
            detail:
              'Família com dificuldade de cumprir a condicionalidade de educação.',
            icon: 'Home',
          },
          {
            label: 'Conduta-alvo',
            detail:
              'Análise interdisciplinar dos fatores que travam o acesso à escola.',
            icon: 'Search',
          },
          {
            label: 'Rede',
            detail:
              'Saúde articula com assistência/educação — não age só no “dado clínico”.',
            icon: 'Network',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail:
              'Coagir, ignorar educação ou ficar só em norma genérica.',
            icon: 'AlertTriangle',
          },
        ],
        'Interdisciplinar > coerção',
      ),
      logicFlow(
        [
          'Problema: falha na condicionalidade de educação do Bolsa Família.',
          'ACS/equipe precisa entender por que a escola não está sendo acessada.',
          'Eliminar: ignorar educação e olhar só saúde/nutrição.',
          'Eliminar: coerção e “só norma recente” sem ler o contexto.',
          'Melhor: análise interdisciplinar do acesso → marcar A.',
          'Em similares: condicionalidade quebrada pede leitura intersetorial, não punição.',
        ],
        'Portátil: analisar antes de punir',
      ),
      goldenRule(
        'Decore — condicionalidades',
        'LEIA O CONTEXTO',
        [
          {
            label: 'Fazer',
            value:
              'Análise interdisciplinar dos fatores que impactam a educação.',
            badge: 'ok',
          },
          {
            label: 'Evitar',
            value: 'Coagir, ignorar a frente educacional ou generalizar.',
            badge: 'warn',
          },
          {
            label: 'Parceiros',
            value: 'CRAS / educação / saúde no mesmo território.',
            badge: 'ok',
          },
        ],
        'Decore: intersetorial antes de coercitivo',
      ),
      dangerZone(
        'PEGADINHAS — conduta',
        [
          {
            label: 'Letra B — só saúde/nutrição',
            detail: 'Ignora a frente educacional.',
            correct:
              'A condicionalidade quebrada é de educação — precisa análise interdisciplinar.',
          },
          {
            label: 'Letra C — coerção',
            detail: 'Aplica pressão para “cumprir”.',
            correct:
              'Primeiro identificar barreiras de acesso; coerção não resolve o vínculo.',
          },
          {
            label: 'Letra D — só norma recente',
            detail: 'Fica no regulamento sem ler o caso.',
            correct:
              'A intervenção parte da análise dos fatores concretos da família.',
          },
          {
            label: 'Letra E — aspectos gerais',
            detail: 'Discurso vago sem foco no acesso.',
            correct:
              'O alvo é identificar fatores que impactam o acesso à educação.',
          },
          {
            label: 'Transferência',
            detail: '“Bolsa Família = problema só do CRAS”.',
            correct:
              'No território, ACS/equipe participa da leitura interdisciplinar do caso.',
          },
        ],
        'Ignorar educação ou coagir → cai',
      ),
    ],
  },
  {
    file: 'ibade-enfermagem-atencao-basica-saude-da-familia-1778968144588-5.json',
    family: 'conceito',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Mobilização social na APS — conscientização com lideranças locais (não coerção)',
    sources: [
      { ...PNAB, covers: ['participação social', 'promoção da saúde'] },
      {
        id: 'pni-mobilizacao',
        tier: 'B',
        issuer: 'Ministério da Saúde',
        title: 'Estratégias de comunicação e mobilização para vacinação',
        year: 2023,
        covers: ['hesitação vacinal', 'lideranças comunitárias'],
      },
    ],
    slides: [
      conceptMap(
        'Mobilização — hesitação vacinal',
        [
          {
            label: 'Cenário',
            detail:
              'Resistência à vacina por crença religiosa e desinformação.',
            icon: 'Church',
          },
          {
            label: 'Estratégia',
            detail:
              'Campanha de conscientização com líderes e pessoas de confiança.',
            icon: 'Megaphone',
          },
          {
            label: 'Conteúdo',
            detail:
              'Desfazer mitos com informação precisa sobre benefícios.',
            icon: 'BookOpen',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Impor, multar ou “deixar pra lá”.',
            icon: 'AlertTriangle',
          },
        ],
        'Diálogo com lideranças > coerção',
      ),
      logicFlow(
        [
          'Problema: hesitação vacinal ligada a crença e mito.',
          'APS prioriza mobilização e educação em saúde no território.',
          'Eliminar: imposição obrigatória ignorando crenças.',
          'Eliminar: desconsiderar preocupações, não intervir ou multar.',
          'Melhor: campanha com líderes religiosos/respeitados → marcar B.',
          'Em similares: resistência cultural pede escuta + rede local, não punição.',
        ],
        'Portátil: mobilizar quem a comunidade ouve',
      ),
      goldenRule(
        'Decore — mobilização',
        'ESCUTA + REDE',
        [
          {
            label: 'Fazer',
            value:
              'Conscientizar com lideranças e informação precisa.',
            badge: 'ok',
          },
          {
            label: 'Evitar',
            value: 'Impor, multar ou abandonar o diálogo.',
            badge: 'warn',
          },
          {
            label: 'Por quê',
            value:
              'Participação social aumenta adesão sem romper vínculo.',
            badge: 'ok',
          },
        ],
        'Decore: líder local + mito esclarecido',
      ),
      dangerZone(
        'PEGADINHAS — mobilização',
        [
          {
            label: 'Letra A — imposição',
            detail: 'Obriga e ignora crenças.',
            correct:
              'A conduta preferencial é conscientizar com lideranças da comunidade.',
          },
          {
            label: 'Letra C — desconsiderar',
            detail: 'Coloca “coletivo” contra escuta.',
            correct:
              'Escutar preocupações e esclarecer mitos é parte da mobilização.',
          },
          {
            label: 'Letra D — não intervir',
            detail: 'Deixa a comunidade “se virar”.',
            correct:
              'A equipe deve mediar campanha educativa com atores locais.',
          },
          {
            label: 'Letra E — multa',
            detail: 'Usa punição financeira.',
            correct:
              'Mobilização social trabalha adesão por informação e confiança, não multa.',
          },
          {
            label: 'Transferência',
            detail: '“Hesitação = só problema clínico”.',
            correct:
              'No território, crença e desinformação pedem abordagem comunitária.',
          },
        ],
        'Coagir ou abandonar → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-atencao-basica-saude-da-familia-1778712409051-9.json',
    family: 'conceito',
    pedagogical_branch: 'ab_pnab_principios',
    guideline_snapshot:
      'APS nas crônicas: promoção, prevenção, diagnóstico precoce e manejo contínuo (PNAB)',
    sources: [
      {
        ...PNAB,
        covers: [
          'APS',
          'doenças crônicas',
          'promoção',
          'prevenção',
          'longitudinalidade',
        ],
      },
    ],
    slides: [
      conceptMap(
        'APS e doenças crônicas',
        [
          {
            label: 'Problema',
            detail:
              'Crônicos só chegam à UBS com doença avançada.',
            icon: 'Activity',
          },
          {
            label: 'Papel da APS',
            detail:
              'Promoção, prevenção, diagnóstico precoce e manejo adequado.',
            icon: 'Stethoscope',
          },
          {
            label: 'Vínculo',
            detail:
              'Acompanhamento contínuo na UBS — não só encaminhar ou medicar.',
            icon: 'Link',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail:
              'Reduzir APS a urgência, farmácia ou “só hospital”.',
            icon: 'AlertTriangle',
          },
        ],
        'Contínuo na UBS > pontual',
      ),
      logicFlow(
        [
          'Pergunta: papel da APS no cuidado das crônicas.',
          'APS organiza cuidado contínuo e previne complicações.',
          'Eliminar: só urgência; só encaminhar; só medicamento; papel secundário.',
          'Correto: promoção + prevenção + diagnóstico precoce + manejo → C.',
          'Em similares: crônica bem cuidada começa na APS, não no hospital.',
        ],
        'Portátil: quatro verbos da APS',
      ),
      goldenRule(
        'Decore — APS crônicas',
        'QUATRO VERBOS',
        [
          {
            label: 'Promover',
            value: 'Educação e hábitos no território.',
            badge: 'ok',
          },
          {
            label: 'Prevenir',
            value: 'Evitar agravos e complicações.',
            badge: 'ok',
          },
          {
            label: 'Diagnosticar cedo',
            value: 'Detectar hipertensão/diabetes a tempo.',
            badge: 'ok',
          },
          {
            label: 'Manejar',
            value: 'Acompanhar e tratar na UBS com continuidade.',
            badge: 'ok',
          },
        ],
        'Decore: APS não é “só passar adiante”',
      ),
      dangerZone(
        'PEGADINHAS — papel da APS',
        [
          {
            label: 'Letra A — só urgência',
            detail: 'Nega acompanhamento contínuo.',
            correct:
              'APS garante promoção, prevenção, diagnóstico precoce e manejo das crônicas.',
          },
          {
            label: 'Letra B — só encaminhar',
            detail: 'Tira o vínculo da UBS.',
            correct:
              'Especialista complementa; a APS mantém o acompanhamento longitudinal.',
          },
          {
            label: 'Letra D — só medicamento',
            detail: 'Reduz a APS à farmácia.',
            correct:
              'Medicamento entra no manejo, mas promoção/prevenção também são eixo.',
          },
          {
            label: 'Letra E — secundária',
            detail: 'Hospital “substitui” a APS.',
            correct:
              'Na rede, a APS é coordenadora do cuidado crônico no território.',
          },
          {
            label: 'Transferência',
            detail: '“Crônico bem tratado = só ambulatorio especializado”.',
            correct:
              'Sem APS resolutiva, o usuário volta só na crise.',
          },
        ],
        'Reduzir APS a urgência/farmácia → cai',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-atencao-basica-saude-da-familia-1780067024707-0.json',
    family: 'certo_errado',
    pedagogical_branch: 'ab_acs_territorio',
    guideline_snapshot:
      'ACS no pré-natal: orientar, identificar risco, visitar — NÃO aplicar vacinas (atribuição de enfermagem)',
    sources: [
      {
        ...LEI_ACS,
        covers: ['atribuições ACS', 'pré-natal', 'visita domiciliar'],
      },
      {
        ...PNAB,
        covers: ['ACS', 'equipe multiprofissional', 'limites de atribuição'],
      },
    ],
    slides: [
      conceptMap(
        'ACS no pré-natal — limites',
        [
          {
            label: 'Orienta',
            detail:
              'Pré-natal, amamentação e vacinação — educação no território.',
            icon: 'MessageCircle',
          },
          {
            label: 'Identifica risco',
            detail:
              'Vulnerabilidade → encaminha para consulta de enfermagem/médica.',
            icon: 'AlertCircle',
          },
          {
            label: 'Visita',
            detail:
              'Acompanha gestação/puerpério, aleitamento e planejamento familiar.',
            icon: 'Home',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail:
              'Confundir ACS com quem aplica vacina (ato da enfermagem).',
            icon: 'AlertTriangle',
          },
        ],
        'ACS educa e encaminha — não injeta',
      ),
      logicFlow(
        [
          'Comando EXCETO: achar o que NÃO é atribuição do ACS no pré-natal.',
          'Orientar, identificar risco e visitar domiciliar = tipicamente ACS.',
          'Aplicar vacina antitetânica/hepatite B = procedimento da enfermagem.',
          'Exceção (o que o ACS não faz) → marcar A.',
          'Em similares: EXCETO de ACS costuma ser ato invasivo/procedimento.',
        ],
        'Portátil: ACS ≠ aplicador de vacina',
      ),
      goldenRule(
        'Decore — ACS × enfermagem',
        'DIVISÃO DE PAPÉIS',
        [
          {
            label: 'ACS',
            value:
              'Orientar · mapear risco · visitar · articular família.',
            badge: 'ok',
          },
          {
            label: 'Enfermagem',
            value: 'Aplicar vacinas e demais procedimentos clínicos.',
            badge: 'ok',
          },
          {
            label: 'Armadilha EXCETO',
            value: 'Colocar procedimento invasivo como “tarefa do ACS”.',
            badge: 'warn',
          },
        ],
        'Decore: vacina no pré-natal ≠ ACS',
      ),
      dangerZone(
        'PEGADINHAS — EXCETO pré-natal',
        [
          {
            label: 'Letra A — aplicar vacinas',
            detail: 'Coloca procedimento invasivo no ACS.',
            correct:
              'Aplicar antitetânica/hepatite B é da enfermagem — esta é a exceção do comando.',
          },
          {
            label: 'Letra B — orientar',
            detail: 'Parece “só conversa”, mas é atribuição.',
            correct:
              'Orientar pré-natal/amamentação/vacinação é típico do ACS — não é a exceção.',
          },
          {
            label: 'Letra C — risco + encaminhar',
            detail: 'Confunde com papel clínico exclusivo.',
            correct:
              'Identificar risco/vulnerabilidade e encaminhar é atribuição do ACS.',
          },
          {
            label: 'Letra D — visita gestacional',
            detail: 'Parece “avançado demais” para ACS.',
            correct:
              'Visita no pré-natal/puerpério e orientação de planejamento familiar cabem ao ACS.',
          },
          {
            label: 'Transferência',
            detail: '“ACS faz tudo que a UBS faz”.',
            correct:
              'ACS articula território; procedimentos como vacinar ficam com a enfermagem.',
          },
        ],
        'No EXCETO, distrator = conduta correta do ACS',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-outras-questoes-e-questoes-mescladas-sobre-doencas-cronicas-nao-transmissiveis-1778712315153-8.json',
    family: 'conceito',
    pedagogical_branch: 'ab_pnab_principios',
    guideline_snapshot:
      'Crônicas pedem modelo em redes de atenção — promoção/prevenção/tratamento/reabilitação contínuos',
    sources: [
      {
        ...PNAB,
        covers: ['redes de atenção', 'continuidade', 'coordenação do cuidado'],
      },
      {
        id: 'ras-ms',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Redes de Atenção à Saúde — modelo para crônicas',
        year: 2010,
        covers: ['integralidade', 'continuidade'],
      },
    ],
    slides: [
      conceptMap(
        'Modelo para crônicas',
        [
          {
            label: 'Problema',
            detail:
              'Fragmentação quebra o acompanhamento contínuo.',
            icon: 'Unlink',
          },
          {
            label: 'Modelo-alvo',
            detail:
              'Redes de atenção integradas com cuidado contínuo.',
            icon: 'Network',
          },
          {
            label: 'Ciclo',
            detail:
              'Promoção → prevenção → tratamento → reabilitação.',
            icon: 'RefreshCw',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail:
              'Demanda espontânea, hospital-centrado ou “só tecnologia”.',
            icon: 'AlertTriangle',
          },
        ],
        'Rede contínua > fragmento',
      ),
      logicFlow(
        [
          'Problema: fragmentação atrapalha crônicos.',
          'Precisa de modelo com integralidade e continuidade de vínculo.',
          'Eliminar: só demanda espontânea; serviços isolados; só hospital; só tech.',
          'Correto: redes de atenção com promoção→reabilitação contínuas → D.',
          'Em similares: crônica bem cuidada = rede integrada, não episódio isolado.',
        ],
        'Portátil: rede > fragmento',
      ),
      goldenRule(
        'Decore — redes',
        'CUIDADO CONTÍNUO',
        [
          {
            label: 'Integrar',
            value: 'Serviços e profissionais se comunicam na rede.',
            badge: 'ok',
          },
          {
            label: 'Continuar',
            value: 'Vínculo ao longo do tempo (não só na crise).',
            badge: 'ok',
          },
          {
            label: 'Ciclo completo',
            value: 'Promoção, prevenção, tratamento e reabilitação.',
            badge: 'ok',
          },
          {
            label: 'Armadilha',
            value: 'Hospital ou tecnologia como substituto do vínculo.',
            badge: 'warn',
          },
        ],
        'Decore: RAS contínua para crônicas',
      ),
      dangerZone(
        'PEGADINHAS — modelo',
        [
          {
            label: 'Letra A — demanda espontânea',
            detail: 'Só busca o serviço na gravidade.',
            correct:
              'Crônicas precisam de rede com acompanhamento contínuo, não só crise.',
          },
          {
            label: 'Letra B — fragmentado',
            detail: 'Serviços isolados sem comunicação.',
            correct:
              'O modelo adequado integra a rede e a comunicação entre pontos.',
          },
          {
            label: 'Letra C — hospital-centrado',
            detail: 'Cuidado só na internação.',
            correct:
              'O eixo é a rede (com APS), não o hospital como único locus.',
          },
          {
            label: 'Letra E — só tecnologia',
            detail: 'Dispensa acompanhamento presencial.',
            correct:
              'Tecnologia apoia; não substitui o cuidado contínuo na rede.',
          },
          {
            label: 'Transferência',
            detail: '“Especialista resolve sozinho a crônica”.',
            correct:
              'Sem coordenação na rede, o usuário perde o fio do cuidado.',
          },
        ],
        'Fragmento ou hospital-só → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-processo-de-enfermagem-1778712122855-4.json',
    family: 'conceito',
    pedagogical_branch: 'ab_vigilancia_ads',
    guideline_snapshot:
      'Violência na AB: avaliar vulnerabilidade + notificar + encaminhar multiprofissional/intersetorial',
    sources: [
      { ...VIOLENCIA_MS },
      {
        ...PNAB,
        covers: ['violência', 'notificação', 'intersetorialidade'],
      },
    ],
    slides: [
      conceptMap(
        'Violência na Atenção Básica',
        [
          {
            label: 'Avaliar',
            detail:
              'Contexto de vulnerabilidade — não só lesão visível.',
            icon: 'Eye',
          },
          {
            label: 'Notificar',
            detail:
              'Registro sistemático dos casos (cultura de paz / vigilância).',
            icon: 'FileWarning',
          },
          {
            label: 'Encaminhar',
            detail:
              'Rede multiprofissional e proteção social / saúde mental.',
            icon: 'Share2',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail:
              'Só lesão urgente, só hospital, ou “privacidade sem registro”.',
            icon: 'AlertTriangle',
          },
        ],
        'Avaliar · notificar · articular rede',
      ),
      logicFlow(
        [
          'Pergunta: conduta do TE na AB frente à violência.',
          'Diretriz: vulnerabilidade + notificação + encaminhamento multiprofissional.',
          'Eliminar: só agravo visível; biossegurança no lugar da rede; sem registro; só hospital.',
          'Correto: avaliação + notificação sistemática + encaminhamento → C.',
          'Em similares: violência na APS = tríade avaliar–notificar–rede.',
        ],
        'Portátil: tríade da violência na AB',
      ),
      goldenRule(
        'Decore — violência AB',
        'TRÍADE',
        [
          {
            label: '1. Avaliar',
            value: 'Contexto de vulnerabilidade da vítima.',
            badge: 'ok',
          },
          {
            label: '2. Notificar',
            value: 'Registro sistemático — não só “ética oral”.',
            badge: 'ok',
          },
          {
            label: '3. Articular',
            value: 'Encaminhamento multiprofissional e proteção social.',
            badge: 'ok',
          },
          {
            label: 'Armadilha',
            value: 'Restringir a lesão física urgente ou ao hospital.',
            badge: 'warn',
          },
        ],
        'Decore: não calar nem “só curativo”',
      ),
      dangerZone(
        'PEGADINHAS — violência',
        [
          {
            label: 'Letra A — só lesão visível',
            detail: 'Notificação só se urgente/física.',
            correct:
              'Manejo integral avalia vulnerabilidade e notifica de forma sistemática.',
          },
          {
            label: 'Letra B — só biossegurança',
            detail: 'Descarta abordagem intersetorial.',
            correct:
              'Proteção do profissional não substitui avaliação multiprofissional da vítima.',
          },
          {
            label: 'Letra D — sem registro',
            detail: 'Usa privacidade para não notificar.',
            correct:
              'Ética exige cuidado e também registro/notificação quando indicado.',
          },
          {
            label: 'Letra E — só hospital',
            detail: 'Plano de cuidado fora da AB/rede.',
            correct:
              'AB articula proteção social e saúde mental no território.',
          },
          {
            label: 'Transferência',
            detail: '“Violência é caso de polícia, não de UBS”.',
            correct:
              'Na APS, notificar e articular a rede de proteção faz parte do cuidado.',
          },
        ],
        'Calar ou só curativo → distrator',
      ),
    ],
  },
  {
    file: 'idib-enfermagem-atencao-basica-saude-da-familia-1778934936220-4.json',
    family: 'conceito',
    pedagogical_branch: 'ab_esf_composicao',
    guideline_snapshot:
      'ESF muda modelo hegemônico via comunicação, construção coletiva de saberes e integralidade',
    sources: [
      {
        ...PNAB,
        covers: ['ESF', 'integralidade', 'equipe multiprofissional', 'território'],
      },
    ],
    slides: [
      conceptMap(
        'ESF — mudança de modelo',
        [
          {
            label: 'Território',
            detail:
              'Equipe multiprofissional cuida de população adscrita.',
            icon: 'MapPin',
          },
          {
            label: 'Integralidade',
            detail:
              'Da promoção à reabilitação — cuidado integrado.',
            icon: 'Layers',
          },
          {
            label: 'Comunicação',
            detail:
              'Prática comunicativa e construção coletiva de saberes.',
            icon: 'MessagesSquare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail:
              'Hierarquia vertical, só médico/enfermeiro ou cuidado fragmentado.',
            icon: 'AlertTriangle',
          },
        ],
        'Coletivo + integral > hierarquia',
      ),
      logicFlow(
        [
          'Pergunta: prática alinhada aos princípios/objetivos da ESF.',
          'ESF busca mudar o modelo hegemônico com comunicação e saberes coletivos.',
          'Eliminar: hierarquia vertical; só médico/enfermeiro; cuidado fragmentado.',
          'Correto: mudança de modelo + comunicação + integralidade → C.',
          'Em similares: ESF = território + equipe ampla + cuidado integral.',
        ],
        'Portátil: coletivo vence fragmento',
      ),
      goldenRule(
        'Decore — ESF',
        'MUDANÇA DE MODELO',
        [
          {
            label: 'Como',
            value:
              'Prática comunicativa e construção coletiva de saberes.',
            badge: 'ok',
          },
          {
            label: 'Para quê',
            value: 'Integralidade do cuidado no território.',
            badge: 'ok',
          },
          {
            label: 'Quem',
            value:
              'Equipe ampliada (inclui ACS) — não só médico/enfermeiro.',
            badge: 'ok',
          },
          {
            label: 'Armadilha',
            value: 'Hierarquia vertical ou atuação isolada.',
            badge: 'warn',
          },
        ],
        'Decore: ESF = coletivo + integralidade',
      ),
      dangerZone(
        'PEGADINHAS — ESF',
        [
          {
            label: 'Letra A — hierarquia vertical',
            detail: 'Especialista manda na equipe.',
            correct:
              'A ESF trabalha comunicação e construção coletiva, não hierarquia rígida.',
          },
          {
            label: 'Letra B — só médico/enfermeiro',
            detail: 'Apaga ACS e outros.',
            correct:
              'A mudança de modelo inclui o papel dos ACS e da equipe ampliada.',
          },
          {
            label: 'Letra D — fragmentado',
            detail: 'Cada um age isolado.',
            correct:
              'Integralidade exige articulação entre os profissionais da equipe.',
          },
          {
            label: 'Transferência',
            detail: '“ESF = posto que só agenda consulta médica”.',
            correct:
              'ESF organiza cuidado territorial multiprofissional da promoção à reabilitação.',
          },
        ],
        'Verticalizar ou fragmentar → cai',
      ),
    ],
  },
];

function applyPatch(patch: Patch) {
  const filePath = path.join(DIR, patch.file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const questao = JSON.parse(raw) as Record<string, unknown>;
  const meta = { ...(questao.meta as Record<string, unknown>) };
  meta.content_standard = 'golden-v1';
  meta.family = patch.family;
  meta.pedagogical_branch = patch.pedagogical_branch;
  meta.content_review = {
    reviewed_at: '2026-08-03',
    reviewer: 'pipeline-ab-g13',
    guideline_snapshot: patch.guideline_snapshot,
    exam_vs_current: 'none',
  };
  meta.sources = patch.sources;
  questao.meta = meta;
  questao.reverse_study_slides = patch.slides;
  delete (questao as { study_slides?: unknown }).study_slides;
  fs.writeFileSync(filePath, `${JSON.stringify(questao, null, 2)}\n`, 'utf8');
  console.log(`[ok] ${patch.file} → ${patch.family}/${patch.pedagogical_branch}`);
}

function main() {
  if (!fs.existsSync(DIR)) {
    throw new Error(`Lote dir missing: ${DIR}`);
  }
  for (const patch of PATCHES) {
    applyPatch(patch);
  }
  console.log(`\nHandcraft g13: ${PATCHES.length} slugs escritos.`);
}

main();
