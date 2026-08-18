/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g17 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g17.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g17';
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
  title: 'Princípios de epidemiologia — prevenção e morbidade',
  year: 2010,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/modulo_principios_epidemiologia_2.pdf',
};
const SURTOS = {
  id: 'investigacao-surtos-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Investigação de surtos — coleta de dados',
  year: 2009,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/',
};
const AEDES = {
  id: 'liraa-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Levantamento Rápido de Índices para Aedes aegypti — LIRAa',
  year: 2013,
  url: 'https://www.gov.br/saude/pt-br',
};
const VISA = {
  id: 'vigilancia-sanitaria-lei-8080',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Vigilância sanitária — regulamentar, controlar e fiscalizar',
  year: 1990,
  url: 'https://www.planalto.gov.br/ccivil_03/leis/l8080.htm',
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
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712256094-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Notificação: qualquer profissional de saúde e, em alguns casos, qualquer cidadão. Não exige lab prévio, autorização do paciente nem cobrir “todas” as doenças.',
    sources: [{ ...LISTA, covers: ['notificação compulsória', 'quem notifica', 'suspeita'] }],
    slides: [
      conceptMap(
        'Quem pode notificar?',
        [
          {
            label: 'Instrumento',
            detail: 'Notificação de doenças e agravos — identificação de padrões e intervenção rápida na Vigilância Epidemiológica.',
            icon: 'Bell',
          },
          {
            label: 'Compulsória',
            detail: 'No Brasil, lista específica deve ser comunicada obrigatoriamente às autoridades de saúde.',
            icon: 'FileWarning',
          },
          {
            label: 'Quem',
            detail: 'Qualquer profissional de saúde e, em alguns casos, qualquer cidadão.',
            icon: 'Users',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Exigir lab confirmado ou autorização do paciente antes de notificar.',
            icon: 'AlertTriangle',
          },
        ],
        'Suspeita já pode entrar — quem notifica é amplo',
      ),
      logicFlow(
        [
          'Assinale a alternativa correta sobre notificação na VE.',
          'Eliminar “só após lab”, “todas as doenças” e “só infecciosas”.',
          'Eliminar autorização prévia do paciente/familiares.',
          'Manter: profissional de saúde e, em alguns casos, qualquer cidadão.',
          'Marcar D.',
          'Em similares: compulsória ≠ todas as doenças; suspeita já conta.',
        ],
        'Profissional (e cidadão) → letra D',
      ),
      goldenRule(
        'Regras da notificação',
        'Decore',
        [
          { label: 'Quem', value: 'Profissional de saúde · às vezes cidadão.', badge: 'ok' },
          { label: 'Quando', value: 'Suspeita ou confirmação — sem esperar lab obrigatório.', badge: 'ok' },
          { label: 'Não', value: 'Autorização do paciente · todas as doenças do mundo.', badge: 'warn' },
        ],
        'Lista compulsória + quem notifica amplo',
      ),
      dangerZone(
        'PEGADINHAS — notificação',
        [
          {
            label: 'Letra A — só lab',
            detail: 'Só após confirmação laboratorial.',
            correct: 'Suspeita também notifica — lab não é pré-requisito.',
          },
          {
            label: 'Letra B — todas',
            detail: 'Obrigatória para todas as doenças.',
            correct: 'Só as da lista/relevância epidemiológica — não todas.',
          },
          {
            label: 'Letra C — só infecciosas',
            detail: 'Exclusivamente doenças infecciosas.',
            correct: 'Abrange outros agravos da lista compulsória.',
          },
          {
            label: 'Letra E — autorização',
            detail: 'Depende de autorização do paciente ou familiares.',
            correct: 'Notificação compulsória não depende desse consentimento.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só o médico pode notificar”.',
            correct: 'Qualquer profissional de saúde — e às vezes o cidadão.',
          },
        ],
        'Estreitar quem/quando notifica → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712256094-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Função direta da VE: monitoramento de tendências temporais e espaciais de doenças — não é saneamento, educação isolada nem tratamento clínico.',
    sources: [{ ...GUIA, covers: ['vigilância epidemiológica', 'tendências', 'monitoramento'] }],
    slides: [
      conceptMap(
        'Função direta da VE',
        [
          {
            label: 'Papel',
            detail: 'Ferramenta de prevenção e controle: dados para decisão em saúde pública.',
            icon: 'Activity',
          },
          {
            label: 'Direto',
            detail: 'Monitoramento de tendências temporais e espaciais de doenças.',
            icon: 'TrendingUp',
          },
          {
            label: 'Não é direto',
            detail: 'Saneamento, educação isolada, política de DCNT ou tratamento clínico imediato.',
            icon: 'XCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar monitoramento por ação assistencial ou de infraestrutura.',
            icon: 'AlertTriangle',
          },
        ],
        'Tendência no tempo e no espaço',
      ),
      logicFlow(
        [
          'Assinale a função direta da vigilância epidemiológica.',
          'Eliminar educação, saneamento e políticas só de não infecciosas.',
          'Eliminar diagnóstico precoce e tratamento imediato.',
          'Manter: monitorar tendências temporais e espaciais.',
          'Marcar B.',
          'Em similares: VE observa e informa — outros setores executam obras/clínica.',
        ],
        'Monitorar tendências → letra B',
      ),
      goldenRule(
        'Direto × indireto',
        'Decore',
        [
          { label: 'Direto', value: 'Tendências temporais e espaciais de doenças.', badge: 'ok' },
          { label: 'Indireto/outro', value: 'Educação · saneamento · tratamento clínico.', badge: 'warn' },
        ],
        'VE monitora — não substitui obra ou consultório',
      ),
      dangerZone(
        'PEGADINHAS — função direta',
        [
          {
            label: 'Letra A — educação',
            detail: 'Implementação de medidas de educação em saúde.',
            correct: 'Pode usar o dado da VE, mas não é a função direta pedida.',
          },
          {
            label: 'Letra C — saneamento',
            detail: 'Fornecimento de saneamento básico adequado.',
            correct: 'Infraestrutura — fora do núcleo direto da VE.',
          },
          {
            label: 'Letra D — políticas DCNT',
            detail: 'Criação de políticas só para não infecciosas.',
            correct: 'Política é uso do dado — e o enunciado ancora infecciosas/VE.',
          },
          {
            label: 'Letra E — tratamento',
            detail: 'Diagnóstico precoce e imediato tratamento.',
            correct: 'É assistência clínica — não a função direta da VE.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “VE = aplicar inseticida na rua”.',
            correct: 'Controle vetorial usa o alerta da VE — não a define.',
          },
        ],
        'Trocar monitoramento por execução → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712256094-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Coleta em surto: entrevistas com questionário padronizado. Evitar só demografia, entrevista informal, só secundário hospitalar ou estatística sem dado primário.',
    sources: [{ ...SURTOS, covers: ['investigação de surtos', 'questionário padronizado', 'coleta de dados'] }],
    slides: [
      conceptMap(
        'Coleta de dados no surto',
        [
          {
            label: 'Abordagem',
            detail: 'Investigação de surtos recomenda coleta padronizada e comparável.',
            icon: 'ClipboardList',
          },
          {
            label: 'Como',
            detail: 'Conduzir entrevistas utilizando um questionário padronizado.',
            icon: 'FileText',
          },
          {
            label: 'Evitar',
            detail: 'Só demografia, entrevista informal, só dado hospitalar ou estatística sem primário.',
            icon: 'Ban',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que “conversa livre” substitui o instrumento padronizado.',
            icon: 'AlertTriangle',
          },
        ],
        'Padronizar a entrevista',
      ),
      logicFlow(
        [
          'Indique a abordagem recomendada para coleta de dados no surto.',
          'Eliminar foco só demográfico e entrevistas informais.',
          'Eliminar depender só de dados secundários ou analisar sem coletar primário.',
          'Manter: entrevistas com questionário padronizado.',
          'Marcar A.',
          'Em similares: surto pede instrumento igual para todos os casos/controles.',
        ],
        'Questionário padronizado → letra A',
      ),
      goldenRule(
        'Coleta útil',
        'Decore',
        [
          { label: 'Faz', value: 'Entrevista + questionário padronizado.', badge: 'ok' },
          { label: 'Não basta', value: 'Informal · só demografia · só hospital · só estatística.', badge: 'warn' },
        ],
        'Padronizar permite comparar exposições',
      ),
      dangerZone(
        'PEGADINHAS — coleta',
        [
          {
            label: 'Letra B — só demografia',
            detail: 'Focar apenas em dados demográficos dos afetados.',
            correct: 'Falta exposição, clínica e tempo — insuficiente para surto.',
          },
          {
            label: 'Letra C — informal',
            detail: 'Utilizar entrevistas informais com os afetados.',
            correct: 'Informal perde comparabilidade entre casos.',
          },
          {
            label: 'Letra D — só hospital',
            detail: 'Depender exclusivamente de dados secundários de hospitais.',
            correct: 'Secundário ajuda, mas não substitui coleta primária padronizada.',
          },
          {
            label: 'Letra E — sem primário',
            detail: 'Análises estatísticas sem coleta de dados primários.',
            correct: 'Sem dado primário a análise do surto fica vazia.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “cada investigador inventa suas perguntas”.',
            correct: 'Padronização evita viés entre entrevistadores.',
          },
        ],
        'Soltar o questionário → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712256094-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Proteção específica (primária): vacinação, cessar tabaco, cinto de segurança. Secundária ≠ manutenção que evita ocorrência; reabilitação ≠ diagnóstico precoce.',
    sources: [{ ...PRINCIPIOS, covers: ['prevenção primária', 'proteção específica', 'história natural'] }],
    slides: [
      conceptMap(
        'Proteção específica — exemplos',
        [
          {
            label: 'Eixo',
            detail: 'Epidemiologia, história natural e prevenção das doenças — interligados.',
            icon: 'GitBranch',
          },
          {
            label: 'Proteção específica',
            detail: 'Vacinação, cessação de tabagismo e uso de cinto de segurança evitam agravos específicos.',
            icon: 'Shield',
          },
          {
            label: 'Níveis',
            detail: 'Primária evita ocorrência; secundária detecta cedo; terciária reabilita.',
            icon: 'Layers',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Chamar manutenção/evitar ocorrência de “secundária” ou misturar reabilitação com diagnóstico.',
            icon: 'AlertTriangle',
          },
        ],
        'Proteção específica = evitar o agravo',
      ),
      logicFlow(
        [
          'Identifique a alternativa correta sobre prevenção.',
          'Eliminar A: secundária não é “manutenção que evita ocorrência” (isso é primária).',
          'Eliminar B: reabilitação não é o pacote de diagnóstico precoce.',
          'Eliminar C: fase pré-clínica não é quando surgem os principais sintomas.',
          'Manter D: vacina, tabaco, cinto = proteção específica.',
          'Marcar D.',
          'Em similares: proteção específica cita alvo concreto (vacina, cinto, cigarro).',
        ],
        'Proteção específica → letra D',
      ),
      goldenRule(
        'Níveis em uma linha',
        'Decore',
        [
          { label: 'Proteção específica', value: 'Vacina · parar tabaco · cinto.', badge: 'ok' },
          { label: 'Primária', value: 'Evita ocorrência / promove saúde.', badge: 'ok' },
          { label: 'Secundária', value: 'Diagnóstico e tratamento precoce.', badge: 'warn' },
          { label: 'Terciária', value: 'Reabilitação e limitar sequelas.', badge: 'warn' },
        ],
        'Não troque o nível da prevenção',
      ),
      dangerZone(
        'PEGADINHAS — prevenção',
        [
          {
            label: 'Letra A — secundária errada',
            detail: 'Secundária = manutenção que evita ocorrência.',
            correct: 'Evitar ocorrência é primária — secundária detecta/trata cedo.',
          },
          {
            label: 'Letra B — reabilitação',
            detail: 'Reabilitação = identificar doença e limitar lesões.',
            correct: 'Isso mistura secundária com terciária — reabilitação é terciária.',
          },
          {
            label: 'Letra C — pré-clínica',
            detail: 'Pré-clínica já com principais sinais e sintomas.',
            correct: 'Sintomas marcam a fase clínica — pré-clínica é silenciosa.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “cinto de segurança = prevenção terciária”.',
            correct: 'Cinto evita o agravo do trauma — proteção específica/primária.',
          },
        ],
        'Inverter níveis da prevenção → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712256094-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Nesta chave: morbidade = indivíduos que adquirem doenças num intervalo em determinada população. A/B/C trocam pandemia, surto e endemia.',
    exam_vs_current:
      'Slides ensinam a chave da prova (D). Pandemia≠excesso local; surto≠definição de incidência; endemia≠aumento inesperado.',
    sources: [{ ...PRINCIPIOS, covers: ['morbidade', 'endemia', 'epidemia', 'pandemia', 'surto'] }],
    slides: [
      conceptMap(
        'Termos — ache a definição certa',
        [
          {
            label: 'Ciência',
            detail: 'Epidemiologia: saúde-doença em coletividades, distribuição, determinantes, prevenção/controle.',
            icon: 'BookOpen',
          },
          {
            label: 'Morbidade (chave)',
            detail: 'Conjunto de indivíduos que adquirem doenças num intervalo de tempo, em determinada população.',
            icon: 'Users',
          },
          {
            label: 'Armadilhas',
            detail: 'Pandemia ≠ excesso local; surto ≠ só “novos casos”; endemia ≠ aumento inesperado.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Usar COVID para justificar definição local de pandemia.',
            icon: 'AlertTriangle',
          },
        ],
        'Morbidade = aquisição no intervalo',
      ),
      logicFlow(
        [
          'Assinale a afirmativa correta sobre os termos.',
          'A: pandemia descrita como excesso local — erra a escala.',
          'B: surto definido como incidência — troca os conceitos.',
          'C: endemia como aumento inesperado — isso é epidemia/surto.',
          'D: morbidade como aquisição de doenças no intervalo populacional — correta nesta chave.',
          'Marcar D.',
          'Em similares: endemia = habitual; epidemia/surto = excesso; pandemia = ampla.',
        ],
        'Morbidade correta → letra D',
      ),
      goldenRule(
        'Glossário rápido',
        'Decore',
        [
          { label: 'Morbidade', value: 'Quem adquire doença no intervalo (população).', badge: 'ok' },
          { label: 'Endemia', value: 'Presença habitual — não “aumento súbito”.', badge: 'warn' },
          { label: 'Surto/epidemia', value: 'Excesso em relação ao esperado.', badge: 'warn' },
          { label: 'Pandemia', value: 'Escala ampla — não só uma comunidade.', badge: 'warn' },
        ],
        'Não troque escala por incidência',
      ),
      dangerZone(
        'PEGADINHAS — glossário',
        [
          {
            label: 'Letra A — pandemia',
            detail: 'Pandemia = excesso em comunidade/região.',
            correct: 'Isso descreve epidemia/surto — pandemia é escala maior.',
          },
          {
            label: 'Letra B — surto',
            detail: 'Surto = número de novos casos (incidência).',
            correct: 'Incidência é indicador; surto é excesso de ocorrência.',
          },
          {
            label: 'Letra C — endemia',
            detail: 'Endemia = aumento inesperado em área limitada.',
            correct: 'Aumento inesperado = epidemia/surto — endemia é habitual.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “morbidade = só óbitos”.',
            correct: 'Óbito aponta mortalidade; morbidade aponta adoecimento.',
          },
        ],
        'Trocar rótulos de ocorrência → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712256094-8.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Objetivo da vigilância sanitária: regulamentar, controlar e fiscalizar práticas/atividades para proteger a saúde. Não se reduz a bares, vacinação ou só infecciosas.',
    sources: [{ ...VISA, covers: ['vigilância sanitária', 'regulamentar', 'fiscalizar', 'proteger a saúde'] }],
    slides: [
      conceptMap(
        'Objetivo da vigilância sanitária',
        [
          {
            label: 'Núcleo',
            detail: 'Regulamentar, controlar e fiscalizar práticas e atividades.',
            icon: 'Scale',
          },
          {
            label: 'Fim',
            detail: 'Proteger a saúde da população — produtos, serviços e ambientes.',
            icon: 'Shield',
          },
          {
            label: 'Não confundir',
            detail: 'Não é só bar/restaurante, nem campanha de vacina, nem só VE de infecciosas.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Reduzir VisA a um setor (bares) ou misturar com imunização/VE.',
            icon: 'AlertTriangle',
          },
        ],
        'Regulamentar · controlar · fiscalizar',
      ),
      logicFlow(
        [
          'Assinale o principal objetivo da vigilância sanitária.',
          'Eliminar A: fiscalização só em bares/restaurantes — estreito demais.',
          'Eliminar C: campanhas de vacinação — eixo de imunização/AB.',
          'Eliminar D: prevenir só infecciosas — mais próximo da VE.',
          'Manter B: regulamentar, controlar e fiscalizar para proteger a saúde.',
          'Marcar B.',
          'Em similares: VisA = regra + fiscalização; VE = dado epidemiológico.',
        ],
        'Regulamentar/fiscalizar → letra B',
      ),
      goldenRule(
        'VisA em três verbos',
        'Decore',
        [
          { label: 'Objetivo', value: 'Regulamentar · controlar · fiscalizar → proteger.', badge: 'ok' },
          { label: 'Não é', value: 'Só bares · só vacina · só infecciosas.', badge: 'warn' },
        ],
        'VisA é regra e fiscalização ampla',
      ),
      dangerZone(
        'PEGADINHAS — VisA',
        [
          {
            label: 'Letra A — só bares',
            detail: 'Fiscalização estrita só em bares e restaurantes.',
            correct: 'É um recorte — o objetivo é bem mais amplo.',
          },
          {
            label: 'Letra C — vacinação',
            detail: 'Coordenar campanhas de vacinação.',
            correct: 'Imunização não é o objetivo principal da VisA.',
          },
          {
            label: 'Letra D — só infecciosas',
            detail: 'Prevenir doenças infecciosas e transmissíveis.',
            correct: 'Mais próximo da VE — não define VisA sozinha.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “VisA = notificar dengue no SINAN”.',
            correct: 'Notificar agravo é VE; VisA fiscaliza risco sanitário.',
          },
        ],
        'Estreitar VisA a um setor → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778712256094-9.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'LIRAa: metodologia rápida por amostragem da quantidade de imóveis com recipientes com larvas de Aedes — não satélite, não conta pessoas doentes, não “bairros/cidades”.',
    sources: [{ ...AEDES, covers: ['LIRAa', 'Aedes aegypti', 'larvas', 'amostragem', 'imóveis'] }],
    slides: [
      conceptMap(
        'O que é o LIRAa?',
        [
          {
            label: 'Nome',
            detail: 'Levantamento Rápido de Índices para o Aedes aegypti.',
            icon: 'Bug',
          },
          {
            label: 'Método',
            detail: 'Metodologia rápida, por amostragem, de imóveis com recipientes com larvas.',
            icon: 'Home',
          },
          {
            label: 'Vetores',
            detail: 'Aedes transmite Dengue, Chikungunya, Zika e Febre Amarela.',
            icon: 'AlertCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar imóveis/larvas por satélite, doentes ou “bairros/cidades”.',
            icon: 'AlertTriangle',
          },
        ],
        'Amostra de imóveis com larvas',
      ),
      logicFlow(
        [
          'Complete: LIRAa consiste em…',
          'Eliminar satélite/sistema informatizado espacial.',
          'Eliminar tabulação de pessoas doentes e amostragem de bairros/cidades.',
          'Manter: metodologia por amostragem de imóveis com recipientes com larvas.',
          'Marcar D.',
          'Em similares: LIRAa conta criadouro no imóvel — não casos clínicos.',
        ],
        'Imóveis + larvas → letra D',
      ),
      goldenRule(
        'LIRAa em uma linha',
        'Decore',
        [
          { label: 'É', value: 'Amostragem rápida de imóveis com recipientes/larvas.', badge: 'ok' },
          { label: 'Não é', value: 'Satélite · contagem de doentes · só bairro/cidade.', badge: 'warn' },
        ],
        'Unidade = imóvel com criadouro larval',
      ),
      dangerZone(
        'PEGADINHAS — LIRAa',
        [
          {
            label: 'Letra A — satélite',
            detail: 'Sistema informatizado por satélite de imóveis com larvas.',
            correct: 'Não é levantamento por satélite — é amostragem de campo.',
          },
          {
            label: 'Letra B — doentes',
            detail: 'Programa que conta pessoas com dengue/chik/zika/FA.',
            correct: 'LIRAa não enumera doentes — enumera criadouros/imóveis.',
          },
          {
            label: 'Letra C — bairros',
            detail: 'Amostragem de bairros e cidades com Aedes.',
            correct: 'A unidade correta é imóvel com recipiente/larva — não o bairro.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “LIRAa substitui a notificação de dengue”.',
            correct: 'LIRAa é entomológico; notificação clínica é outro fluxo.',
          },
        ],
        'Trocar larvas por doentes → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1780066961947-9.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'LIRAa: predial, recipiente e Breteau são índices válidos. EXCETO “índice de armazenamento” definido como recipientes com larvas ÷ quantidade de larvas — fórmula errada.',
    sources: [{ ...AEDES, covers: ['índice predial', 'Breteau', 'índice de recipiente', 'LIRAa'] }],
    slides: [
      conceptMap(
        'Índices do LIRAa — ache o EXCETO',
        [
          {
            label: 'Ferramenta',
            detail: 'LIRAa determina com rapidez índices de infestação por Aedes aegypti.',
            icon: 'Gauge',
          },
          {
            label: 'Válidos',
            detail: 'Infestação predial, índice de recipiente e índice de Breteau.',
            icon: 'CheckCircle',
          },
          {
            label: 'Falha',
            detail: '“Índice de armazenamento” como recipientes com larvas ÷ quantidade de larvas.',
            icon: 'XCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar qualquer fração com “larvas” no nome sem checar a fórmula.',
            icon: 'AlertTriangle',
          },
        ],
        'Fórmula invertida = EXCETO',
      ),
      logicFlow(
        [
          'EXCETO: qual índice NÃO é determinado assim pelo LIRAa.',
          'Validar predial (imóveis positivos/pesquisados), recipiente e Breteau.',
          'Isolar “armazenamento” com fórmula recipientes÷larvas — incorreta.',
          'Marcar A.',
          'Em similares: Breteau = recipientes positivos / imóveis (×100); predial = % imóveis positivos.',
        ],
        'Armazenamento falso → letra A',
      ),
      goldenRule(
        'Três índices reais',
        'Decore',
        [
          { label: 'Predial', value: '% imóveis positivos / pesquisados.', badge: 'ok' },
          { label: 'Recipiente', value: 'Tipos/recipientes positivos (qualitativo).', badge: 'ok' },
          { label: 'Breteau', value: 'Recipientes positivos / 100 imóveis.', badge: 'ok' },
          { label: 'EXCETO', value: '“Armazenamento” = recipientes ÷ larvas.', badge: 'warn' },
        ],
        'Não invente denominador de larvas',
      ),
      dangerZone(
        'PEGADINHAS — índices LIRAa',
        [
          {
            label: 'Letra A — armazenamento',
            detail: 'Recipientes com larvas ÷ quantidade de larvas.',
            correct: 'EXCETO: fórmula/índice inválido nesta chave do LIRAa.',
          },
          {
            label: 'Letra B — predial',
            detail: '% imóveis positivos / imóveis pesquisados.',
            correct: 'Índice de infestação predial válido — não é o EXCETO.',
          },
          {
            label: 'Letra C — recipiente',
            detail: 'Relação de tipos de recipientes positivos (qualitativo).',
            correct: 'Índice de recipiente válido — não é o EXCETO.',
          },
          {
            label: 'Letra D — Breteau',
            detail: 'Recipientes positivos / imóveis (densidade vetorial).',
            correct: 'Índice de Breteau válido — não é o EXCETO.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “Breteau = larvas por mosquito adulto”.',
            correct: 'Breteau liga recipiente positivo a imóvel pesquisado.',
          },
        ],
        'Inventar índice de armazenamento → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g17',
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
