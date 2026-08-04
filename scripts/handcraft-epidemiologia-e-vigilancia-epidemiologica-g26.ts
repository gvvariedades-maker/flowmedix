/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g26 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g26.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g26';
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
const AEDES = {
  id: 'controle-aedes-larvicida-inseticida-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Controle de vetores — larvicidas, inseticidas e monitoramento de resistência',
  year: 2009,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/',
};
const ENTO = {
  id: 'entomologia-basica-insetos',
  tier: 'B' as const,
  issuer: 'Referência acadêmica / entomologia',
  title: 'Insetos — apêndices pareados e articulados; tagmose cabeça-tórax-abdômen',
  year: 2010,
  url: 'https://bvsms.saude.gov.br/',
};
const LEI = {
  id: 'lei-8080-vigilancia-epidemiologica',
  tier: 'A' as const,
  issuer: 'Brasil',
  title: 'Lei 8.080/1990 — definição de vigilância epidemiológica',
  year: 1990,
  url: 'https://www.planalto.gov.br/ccivil_03/leis/l8080.htm',
};
const TRAB = {
  id: 'saude-trabalhador-notificacao',
  tier: 'B' as const,
  issuer: 'Ministério da Saúde',
  title: 'Saúde do trabalhador — subnotificação e planejamento de prevenção',
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
    file: 'unesc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563784564-9.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Chave da prova: em larvicida, não exige luvas nem máscara semi-facial. Inseticida ≠ controle mecânico; MS monitora resistência do Aedes; larvicida em água de consumo não é “sempre”.',
    exam_vs_current:
      'Prova marca D (luvas desnecessárias no larvicida). Protocolos atuais de EPI podem exigir proteção — slides ensinam a chave da prova.',
    sources: [{ ...AEDES, covers: ['larvicida', 'inseticida', 'resistência', 'Aedes', 'EPI'] }],
    slides: [
      conceptMap(
        'Larvicida e normas de segurança',
        [
          {
            label: 'Tema',
            detail: 'Uso de larvicidas e inseticidas no controle de endemias e normas de segurança.',
            icon: 'Shield',
          },
          {
            label: 'Larvicida (chave)',
            detail: 'Na prova: não é necessário uso de luvas na aplicação de larvicidas.',
            icon: 'Droplets',
          },
          {
            label: 'Não confundir',
            detail: 'Inseticida não é “sempre” controle mecânico; MS monitora resistência do Aedes.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar máscara semi-facial como essencial ou larvicida “sempre” em água de consumo.',
            icon: 'AlertTriangle',
          },
        ],
        'Chave: larvicida sem luvas obrigatórias',
      ),
      logicFlow(
        [
          'Eliminar “larvicida sempre” em depósitos de água para consumo.',
          'Eliminar “inseticida = sempre controle mecânico”.',
          'Eliminar “MS não monitora resistência do Aedes”.',
          'Eliminar “máscara semi-facial essencial” no larvicida.',
          'Manter: luvas não necessárias na aplicação de larvicidas (chave).',
          'Marcar D.',
          'Em similares: distinguir larvicida × inseticida × mecânico.',
        ],
        'Sem luvas no larvicida → letra D',
      ),
      goldenRule(
        'O que a prova cobra',
        'Decore',
        [
          { label: 'Larvicida', value: 'Chave: luvas não obrigatórias.', badge: 'ok' },
          { label: 'Inseticida', value: 'Controle químico — não mecânico.', badge: 'warn' },
          { label: 'Resistência', value: 'MS possui rede de monitoramento (Aedes).', badge: 'ok' },
        ],
        'Mecânico ≠ químico; água ≠ sempre larvicida',
      ),
      dangerZone(
        'PEGADINHAS — larvicida/inseticida',
        [
          {
            label: 'Letra A — sempre na água',
            detail: 'Larvicida sempre em depósitos de água para consumo humano.',
            correct: 'Não é “sempre” — há critérios e alternativas de manejo.',
          },
          {
            label: 'Letra B — sempre mecânico',
            detail: 'Inseticida classificado sempre como controle mecânico.',
            correct: 'Inseticida é químico — mecânico é outro eixo (remoção física).',
          },
          {
            label: 'Letra C — sem monitoramento',
            detail: 'MS não monitora resistência do Aedes a inseticidas.',
            correct: 'Há rede de monitoramento de resistência — a negação é falsa.',
          },
          {
            label: 'Letra E — máscara essencial',
            detail: 'Máscara semi-facial essencial na aplicação do larvicida.',
            correct: 'Na chave da prova, isso não é o item correto.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “todo inseticida = eliminação de criadouro”.',
            correct: 'Eliminar criadouro é mecânico/ambiental — não o rótulo do inseticida.',
          },
        ],
        'Trocar químico por mecânico ou negar monitoramento → distrator',
      ),
    ],
  },
  {
    file: 'unesc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563793798-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Insetos: apêndices pareados e articulados. Não: dois pares de mandíbulas; músculo liso; só cabeça+tórax; simetria unilateral.',
    sources: [{ ...ENTO, covers: ['insetos', 'apêndices', 'articulados', 'tagmose'] }],
    slides: [
      conceptMap(
        'Insetos — o que é correto?',
        [
          {
            label: 'Apêndices',
            detail: 'Possuem apêndices pareados e articulados.',
            icon: 'Bug',
          },
          {
            label: 'Corpo',
            detail: 'Divisão clássica em cabeça, tórax e abdômen — não só cabeça e tórax.',
            icon: 'Layers',
          },
          {
            label: 'Simetria',
            detail: 'Simetria bilateral — não “unilateral”.',
            icon: 'FlipHorizontal',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar musculatura lisa ou “dois pares de mandíbulas”.',
            icon: 'AlertTriangle',
          },
        ],
        'Pareados + articulados = correto',
      ),
      logicFlow(
        [
          'Afirmação correta sobre insetos.',
          'Eliminar dois pares de mandíbulas.',
          'Eliminar fibras musculares lisas.',
          'Eliminar corpo só em cabeça e tórax.',
          'Eliminar simetria unilateral.',
          'Manter apêndices pareados e articulados.',
          'Marcar E.',
          'Em similares: inseto = apêndices articulados pareados.',
        ],
        'Apêndices articulados → letra E',
      ),
      goldenRule(
        'Traço anatômico',
        'Decore',
        [
          { label: 'Correto', value: 'Apêndices pareados e articulados.', badge: 'ok' },
          { label: 'Corpo', value: 'Cabeça + tórax + abdômen.', badge: 'ok' },
          { label: 'Não', value: 'Simetria unilateral; só cabeça/tórax.', badge: 'warn' },
        ],
        'Articulado ≠ unilateral',
      ),
      dangerZone(
        'PEGADINHAS — insetos',
        [
          {
            label: 'Letra A — mandíbulas',
            detail: 'Dois pares de mandíbulas.',
            correct: 'Não é o traço correto cobrado nesta chave.',
          },
          {
            label: 'Letra B — músculo liso',
            detail: 'Musculatura de fibras lisas.',
            correct: 'Insetos têm musculatura estriada típica — não esse item.',
          },
          {
            label: 'Letra C — só cabeça/tórax',
            detail: 'Corpo dividido somente em cabeça e tórax.',
            correct: 'Falta o abdômen na tagmose clássica.',
          },
          {
            label: 'Letra D — simetria unilateral',
            detail: 'Simetria unilateral.',
            correct: 'É bilateral — “unilateral” é falso.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “inseto sem articulação nos apêndices”.',
            correct: 'Apêndices articulados são marca do grupo.',
          },
        ],
        'Negar articulação ou cortar o abdômen → distrator',
      ),
    ],
  },
  {
    file: 'unesc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563793798-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Notificação imediata: hantavirose. Semanal/não imediato nesta chave: Chagas crônica, esquistossomose, hanseníase, chikungunya.',
    sources: [{ ...LISTA, covers: ['hantavirose', 'notificação imediata', 'lista compulsória'] }],
    slides: [
      conceptMap(
        'Qual é notificação imediata?',
        [
          {
            label: 'Pedido',
            detail: 'Doença de notificação compulsória imediata.',
            icon: 'Zap',
          },
          {
            label: 'Imediata (chave)',
            detail: 'Hantavirose.',
            icon: 'Bell',
          },
          {
            label: 'Não imediato (ex.)',
            detail: 'Hanseníase, esquistossomose, Chagas crônica — ritmo/lista diferente.',
            icon: 'Calendar',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar chikungunya ou hanseníase como se fossem o imediato desta prova.',
            icon: 'AlertTriangle',
          },
        ],
        'Hantavirose = imediata nesta chave',
      ),
      logicFlow(
        [
          'Filtro: apenas notificação imediata.',
          'Eliminar Chagas crônica, esquistossomose e hanseníase.',
          'Eliminar febre de chikungunya nesta chave.',
          'Manter hantavirose.',
          'Marcar D.',
          'Em similares: hantavirose = eixo imediato.',
        ],
        'Hantavirose → letra D',
      ),
      goldenRule(
        'Imediato × outros',
        'Decore',
        [
          { label: 'Imediata', value: 'Hantavirose.', badge: 'ok' },
          { label: 'Semanal/outro', value: 'Hanseníase, esquistossomose (ex.).', badge: 'warn' },
          { label: 'Chagas crônica', value: 'Não é o imediato desta lista.', badge: 'warn' },
        ],
        'Não misturar imediato com semanal',
      ),
      dangerZone(
        'PEGADINHAS — imediata',
        [
          {
            label: 'Letra A — Chagas crônica',
            detail: 'Doença de Chagas crônica.',
            correct: 'Não fecha o critério imediato desta questão.',
          },
          {
            label: 'Letra B — esquistossomose',
            detail: 'Esquistossomose.',
            correct: 'Não é a imediata cobrada (hantavirose).',
          },
          {
            label: 'Letra C — hanseníase',
            detail: 'Hanseníase.',
            correct: 'Ritmo típico semanal — não imediata nesta chave.',
          },
          {
            label: 'Letra E — chikungunya',
            detail: 'Febre de Chikungunya.',
            correct: 'Não é o item imediato marcado como gabarito.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “toda arbovirose é imediata”.',
            correct: 'Conferir a lista — hantavirose é o imediato aqui.',
          },
        ],
        'Trocar hantavirose por semanal → distrator',
      ),
    ],
  },
  {
    file: 'unesc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563793798-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'I e II corretas: investigar local provável + pedir pesquisa de Aedes; acompanhar curva/tendência por bairro. III falsa: estadual consolida e produz boletins.',
    sources: [
      { ...GUIA, covers: ['vigilância epidemiológica', 'dengue', 'Aedes', 'boletins'] },
      { ...AEDES, covers: ['pesquisa de Aedes', 'controle vetorial'] },
    ],
    slides: [
      conceptMap(
        'Vigilância epidemiológica — I, II e III',
        [
          {
            label: 'I',
            detail:
              'Fora de epidemia: investigar local provável; se suspeita local, pedir pesquisa de Aedes à equipe vetorial.',
            icon: 'Search',
          },
          {
            label: 'II',
            detail: 'Municipal acompanha curva, tendência e perfil — dados por bairro.',
            icon: 'BarChart3',
          },
          {
            label: 'III',
            detail: 'Diz que estadual NÃO consolida nem faz boletins — isso é falso.',
            icon: 'FileText',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar III porque “boletim parece federal”.',
            icon: 'AlertTriangle',
          },
        ],
        'I e II certas · III nega dever estadual',
      ),
      logicFlow(
        [
          'Julgar I–III sobre vigilância epidemiológica.',
          'I correta: investigação + pesquisa de Aedes quando couber.',
          'II correta: curva/tendência/perfil por bairro no município.',
          'III falsa: estadual consolida e produz boletins.',
          'Corretas: apenas I e II.',
          'Marcar E.',
          'Em similares: negar boletim estadual = armadilha.',
        ],
        'Apenas I e II → letra E',
      ),
      goldenRule(
        'Papéis',
        'Decore',
        [
          { label: 'I', value: 'Investigar + pesquisa de Aedes no município.', badge: 'ok' },
          { label: 'II', value: 'Curva/tendência desagregada por bairro.', badge: 'ok' },
          { label: 'III', value: 'Estadual consolida e divulga — não “não é responsabilidade”.', badge: 'warn' },
        ],
        'Estadual consolida — III cai',
      ),
      dangerZone(
        'PEGADINHAS — I/II/III',
        [
          {
            label: 'Letra A — só II',
            detail: 'Apenas II.',
            correct: 'I também está correta — pesquisa de Aedes no eixo local.',
          },
          {
            label: 'Letra B — II e III',
            detail: 'Apenas II e III.',
            correct: 'III é falsa; I deveria entrar.',
          },
          {
            label: 'Letra C — só I',
            detail: 'Apenas I.',
            correct: 'II também é correta (curva por bairro).',
          },
          {
            label: 'Letra D — I e III',
            detail: 'Apenas I e III.',
            correct: 'III é falsa — estadual sim consolida/boletim.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “municipal não desagrega por bairro”.',
            correct: 'Perfil local exige desagregação territorial.',
          },
        ],
        'Incluir III ou excluir I/II → distrator',
      ),
    ],
  },
  {
    file: 'unifil-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563848614-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Lei 8.080: VE = conhecimento/detecção de mudanças nos determinantes + prevenção/controle. Não confundir com sanitária, ambiental ou “em saúde”.',
    sources: [{ ...LEI, covers: ['vigilância epidemiológica', 'Lei 8.080', 'definição'] }],
    slides: [
      conceptMap(
        'Qual vigilância é esta definição?',
        [
          {
            label: 'Texto',
            detail:
              'Conjunto de ações: conhecimento, detecção ou prevenção de mudanças nos determinantes da saúde.',
            icon: 'BookOpen',
          },
          {
            label: 'Finalidade',
            detail: 'Recomendar e adotar medidas de prevenção e controle de doenças ou agravos.',
            icon: 'Target',
          },
          {
            label: 'Nome',
            detail: 'Vigilância Epidemiológica (definição legal clássica).',
            icon: 'Radar',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar Vigilância em Saúde ou Sanitária pelo texto parecido.',
            icon: 'AlertTriangle',
          },
        ],
        'Definição legal = epidemiológica',
      ),
      logicFlow(
        [
          'Ler a definição (conhecimento/detecção + prevenção/controle).',
          'Eliminar sanitária e ambiental.',
          'Eliminar “vigilância em saúde” genérica nesta chave.',
          'Manter vigilância epidemiológica.',
          'Marcar D.',
          'Em similares: texto da 8.080 = epidemiológica.',
        ],
        'Epidemiológica → letra D',
      ),
      goldenRule(
        'Nome da definição',
        'Decore',
        [
          { label: 'Epidemiológica', value: 'Mudanças nos determinantes + prevenção/controle.', badge: 'ok' },
          { label: 'Sanitária', value: 'Produtos, serviços, ambiente — outro escopo.', badge: 'warn' },
          { label: 'Em Saúde', value: 'Guarda-chuva — não é o rótulo desta frase.', badge: 'warn' },
        ],
        'Texto clássico ≠ sanitária',
      ),
      dangerZone(
        'PEGADINHAS — definição',
        [
          {
            label: 'Letra A — sanitária',
            detail: 'Vigilância Sanitária.',
            correct: 'Escopo de riscos de produtos/serviços — não esta definição.',
          },
          {
            label: 'Letra B — ambiental',
            detail: 'Vigilância Ambiental.',
            correct: 'Eixo ambiental — não o texto clássico da epidemiológica.',
          },
          {
            label: 'Letra C — em saúde',
            detail: 'Vigilância em Saúde.',
            correct: 'Conceito amplo; a prova quer o nome epidemiológica.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “epidemiológica = só inspeção de água”.',
            correct: 'Água/produtos → sanitária; esta definição → epidemiológica.',
          },
        ],
        'Trocar epidemiológica por guarda-chuva → distrator',
      ),
    ],
  },
  {
    file: 'unifil-enfermagem-processo-de-enfermagem-1780004469060-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'I, III e IV corretas (definição, funções clássicas, notificação). II falsa: não “documentos proibitórios”; VE não se reduz a isso.',
    sources: [
      { ...LEI, covers: ['vigilância epidemiológica', 'definição'] },
      { ...GUIA, covers: ['funções da vigilância', 'notificação'] },
    ],
    slides: [
      conceptMap(
        'Assertivas I–IV da vigilância',
        [
          {
            label: 'I',
            detail: 'Definição: conhecimento/detecção + prevenção e controle de agravos.',
            icon: 'BookOpen',
          },
          {
            label: 'II',
            detail: 'Fala em “documentos proibitórios” — distorce o papel da VE (falsa).',
            icon: 'Ban',
          },
          {
            label: 'III',
            detail: 'Funções: coletar, processar, analisar, recomendar, promover, avaliar, divulgar.',
            icon: 'ListChecks',
          },
          {
            label: 'IV',
            detail: 'Notificação: comunicar ocorrência à autoridade sanitária para intervenção.',
            icon: 'Bell',
          },
        ],
        'I · III · IV certas · II cai',
      ),
      logicFlow(
        [
          'Julgar I–IV.',
          'I correta: definição clássica de VE.',
          'II falsa: “documentos proibitórios” não descreve a VE.',
          'III correta: ciclo de funções da vigilância.',
          'IV correta: notificação para intervenção.',
          'Corretas: apenas I, III e IV → marcar C.',
          'Em similares: VE recomenda/controla — não “proíbe em papel”.',
        ],
        'I III IV → letra C',
      ),
      goldenRule(
        'O que sobra',
        'Decore',
        [
          { label: 'I + III + IV', value: 'Definição, funções e notificação.', badge: 'ok' },
          { label: 'II', value: 'Cai: “documentos proibitórios”.', badge: 'warn' },
          { label: 'Notificação', value: 'Comunicação à autoridade para agir.', badge: 'ok' },
        ],
        'II é a armadilha do pacote',
      ),
      dangerZone(
        'PEGADINHAS — I–IV',
        [
          {
            label: 'Letra A — todas',
            detail: 'Todas estão corretas.',
            correct: 'II é falsa — não leve o pacote inteiro.',
          },
          {
            label: 'Letra B — I II IV',
            detail: 'Apenas I, II e IV.',
            correct: 'Inclui II (errada) e omite III (certa).',
          },
          {
            label: 'Letra D — só III IV',
            detail: 'Apenas III e IV.',
            correct: 'I também está correta — definição legal.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “VE = só fiscalizar e multar”.',
            correct: 'VE coleta/analisa/recomenda/avalia — não o eixo proibitório.',
          },
        ],
        'Incluir II ou excluir I → distrator',
      ),
    ],
  },
  {
    file: 'univali-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563809836-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Subnotificação ocupacional: principal consequência = dificulta planejamento de prevenção/controle (dados não refletem a realidade).',
    sources: [{ ...TRAB, covers: ['subnotificação', 'saúde do trabalhador', 'planejamento'] }],
    slides: [
      conceptMap(
        'Subnotificação — principal consequência',
        [
          {
            label: 'Problema',
            detail: 'Subnotificação de doenças profissionais é grave na saúde do trabalhador.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Consequência-chave',
            detail: 'Dados não refletem a realidade → dificulta planejamento de prevenção e controle.',
            icon: 'ClipboardList',
          },
          {
            label: 'Não é o eixo',
            detail: 'Não confundir com benefício previdenciário, “causar” insalubridade ou só custo.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar auxílio-doença/aposentadoria como a principal consequência.',
            icon: 'AlertCircle',
          },
        ],
        'Sem dado real → planejamento fraco',
      ),
      logicFlow(
        [
          'Pergunta: principal consequência da subnotificação.',
          'Eliminar “impede benefício previdenciário” como eixo principal.',
          'Eliminar “causa aumento da insalubridade” (efeito indireto/errado).',
          'Eliminar “só aumenta custos hospitalares”.',
          'Manter: dificulta planejamento porque os dados mentem a realidade.',
          'Marcar B.',
          'Em similares: subnotificar = cegar a gestão de risco.',
        ],
        'Planejamento cego → letra B',
      ),
      goldenRule(
        'Por que notificar importa',
        'Decore',
        [
          { label: 'Dado', value: 'Precisa refletir a realidade ocupacional.', badge: 'ok' },
          { label: 'Uso', value: 'Planejar prevenção e controle.', badge: 'ok' },
          { label: 'Pegadinha', value: 'Benefício/custo ≠ consequência principal aqui.', badge: 'warn' },
        ],
        'Subnotificar cega o planejamento',
      ),
      dangerZone(
        'PEGADINHAS — subnotificação',
        [
          {
            label: 'Letra A — benefício',
            detail: 'Impede auxílio-doença e aposentadoria por invalidez.',
            correct: 'Pode haver impacto individual, mas não é a consequência principal pedida.',
          },
          {
            label: 'Letra C — insalubridade',
            detail: 'Causa aumento da insalubridade nos ambientes.',
            correct: 'Subnotificar não “cria” insalubridade — esconde o problema.',
          },
          {
            label: 'Letra D — custos',
            detail: 'Aumenta custos porque não há diagnóstico precoce.',
            correct: 'Pode ocorrer, mas o eixo da chave é o planejamento cego.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “subnotificar melhora os indicadores”.',
            correct: 'Melhora falsa — a realidade some do mapa.',
          },
        ],
        'Trocar planejamento por benefício/custo → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563608452-9.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Violência sexual: notificar à SMS em até 24 h, qualquer idade. Não exclusivo médico/enfermeiro; sarampo na suspeita; hanseníase não é imediata 24 h; privado também notifica.',
    sources: [
      { ...LISTA, covers: ['violência sexual', 'notificação imediata', '24 horas', 'SINAN'] },
      { ...GUIA, covers: ['sarampo', 'hanseníase', 'quem notifica'] },
    ],
    slides: [
      conceptMap(
        'Notificação compulsória — o que é correto?',
        [
          {
            label: 'Violência sexual',
            detail: 'Notificar à SMS em até 24 horas, independentemente da idade da vítima.',
            icon: 'ShieldAlert',
          },
          {
            label: 'Quem notifica',
            detail: 'Não é atribuição exclusiva do médico ou do enfermeiro.',
            icon: 'Users',
          },
          {
            label: 'Sarampo',
            detail: 'Na suspeita já se notifica — não esperar só o laboratório.',
            icon: 'Bell',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Hanseníase em 24 h ou dispensar o serviço privado.',
            icon: 'AlertTriangle',
          },
        ],
        'Violência sexual → SMS em 24 h',
      ),
      logicFlow(
        [
          'Afirmação correta sobre DNC.',
          'Eliminar “só médico/enfermeiro preenche ficha”.',
          'Eliminar “sarampo só após confirmação lab/clínica”.',
          'Eliminar hanseníase imediata em 24 h.',
          'Eliminar dispensa dos serviços privados.',
          'Manter violência sexual → SMS em até 24 h (qualquer idade).',
          'Marcar C.',
          'Em similares: violência sexual = imediato municipal.',
        ],
        'Violência sexual 24 h → letra C',
      ),
      goldenRule(
        'Regras rápidas',
        'Decore',
        [
          { label: 'Violência sexual', value: 'SMS em até 24 h — qualquer idade.', badge: 'ok' },
          { label: 'Equipe/privado', value: 'Notificam — não exclusivo nem dispensado.', badge: 'ok' },
          { label: 'Hanseníase', value: 'Não tratar como imediata 24 h nesta chave.', badge: 'warn' },
        ],
        'Suspeita de sarampo já notifica',
      ),
      dangerZone(
        'PEGADINHAS — DNC',
        [
          {
            label: 'Letra A — só médico/enfermeiro',
            detail: 'Preenchimento exclusivo do médico ou enfermeiro.',
            correct: 'Outros profissionais e cidadãos podem comunicar.',
          },
          {
            label: 'Letra B — sarampo só após confirmação',
            detail: 'SINAN só após lab ou clínica confirmada.',
            correct: 'Suspeita de sarampo já dispara notificação.',
          },
          {
            label: 'Letra D — hanseníase 24 h',
            detail: 'Hanseníase em até 24 h por alta transmissibilidade.',
            correct: 'Não é o ritmo imediato desta chave (violência sexual sim).',
          },
          {
            label: 'Letra E — privado dispensado',
            detail: 'Serviços privados dispensados de notificar.',
            correct: 'Público e privado notificam agravos/eventos.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “violência sexual só se a vítima for criança”.',
            correct: 'Independe da idade — notifica à SMS a tempo.',
          },
        ],
        'Restringir quem/quando notifica → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g26',
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
