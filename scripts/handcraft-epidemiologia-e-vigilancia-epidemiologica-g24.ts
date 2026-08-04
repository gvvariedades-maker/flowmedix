/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g24 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g24.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g24';
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
  title: 'Princípios de epidemiologia — incidência e prevalência',
  year: 2010,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/modulo_principios_epidemiologia_2.pdf',
};
const NOB = {
  id: 'nob-sus-96',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'NOB/SUS 96 — Programação Pactuada e Integrada (PPI)',
  year: 1996,
  url: 'https://bvsms.saude.gov.br/',
};
const JANELA = {
  id: 'janela-diagnostica-ms',
  tier: 'B' as const,
  issuer: 'Ministério da Saúde / hemoterapia',
  title: 'Janela diagnóstica — tempo infecção → marcador detectável',
  year: 2015,
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
    file: 'quadrix-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563818401-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Notificação imediata: botulismo, cólera, óbitos por dengue. Misturar semanal (TB, hanseníase) com imediatos = pegadinha.',
    sources: [{ ...LISTA, covers: ['notificação imediata', 'botulismo', 'cólera', 'dengue óbito'] }],
    slides: [
      conceptMap(
        'Notificação imediata — o que entra?',
        [
          {
            label: 'Compulsória',
            detail:
              'Comunicação obrigatória de doença, agravo ou evento de saúde pública à autoridade de saúde.',
            icon: 'Bell',
          },
          {
            label: 'Quem notifica',
            detail:
              'Diversos profissionais de saúde ou responsáveis pelos estabelecimentos públicos ou privados.',
            icon: 'Users',
          },
          {
            label: 'Para quê',
            detail: 'Facilita identificação de surtos e a organização das respostas às ocorrências.',
            icon: 'Radar',
          },
          {
            label: 'Pedido da prova',
            detail: 'Doenças/agravos de notificação imediata — não a lista semanal misturada.',
            icon: 'Zap',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Misturar um imediato com tuberculose/hanseníase e achar que “tudo é imediato”.',
            icon: 'AlertTriangle',
          },
        ],
        'Imediato ≠ lista semanal misturada',
      ),
      logicFlow(
        [
          'Lembrar: notificação compulsória comunica agravo à autoridade de saúde.',
          'Filtro: só trios de notificação imediata.',
          'Descartar misturas com tuberculose/hanseníase no ritmo semanal.',
          'Descartar esquistossomose e pares que não fecham o pacote imediato.',
          'Manter botulismo + cólera + óbitos por dengue.',
          'Marcar D.',
          'Em similares: óbito por dengue e botulismo/cólera = imediato.',
        ],
        'Trio imediato → letra D',
      ),
      goldenRule(
        'Imediato vs semanal',
        'Decore o eixo',
        [
          { label: 'Imediato (ex.)', value: 'Botulismo, cólera, óbito por dengue.', badge: 'ok' },
          { label: 'Semanal (ex.)', value: 'Tuberculose, hanseníase (ritmo semanal).', badge: 'warn' },
          { label: 'Compulsória', value: 'Obrigatória em estabelecimentos públicos/privados.', badge: 'ok' },
        ],
        'Não misturar imediato com semanal',
      ),
      dangerZone(
        'PEGADINHAS — lista imediata',
        [
          {
            label: 'Letra A — SRAG + TB + violência',
            detail: 'SRAG por coronavírus, tuberculose e violência doméstica.',
            correct: 'Mistura ritmos/listas — TB não fecha o trio imediato pedido.',
          },
          {
            label: 'Letra B — esquistossomose + cólera + Zika',
            detail: 'Esquistossomose, cólera e Zika aguda.',
            correct: 'Esquistossomose quebra o pacote imediato desta chave.',
          },
          {
            label: 'Letra C — LV + malária + pólio',
            detail: 'Leishmaniose visceral, malária e poliomielite.',
            correct: 'Não é o trio imediato cobrado (botulismo/cólera/óbito dengue).',
          },
          {
            label: 'Letra E — hanseníase + hanta + dengue',
            detail: 'Hanseníase, hantavirose e dengue.',
            correct: 'Hanseníase é eixo semanal — não fecha imediato.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “toda dengue é imediata”.',
            correct: 'Óbito por dengue é imediato; caso comum segue a lista vigente.',
          },
        ],
        'Misturar semanal no trio imediato → distrator',
      ),
    ],
  },
  {
    file: 'quadrix-enfermagem-processo-de-enfermagem-1780009294428-8.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Tétano (não só neonatal) é DNC. Afirmar que só tétano neonatal notifica = ERRADO.',
    sources: [{ ...LISTA, covers: ['tétano', 'DNC', 'notificação compulsória'] }],
    slides: [
      conceptMap(
        'Tétano na lista de DNC',
        [
          {
            label: 'Saúde coletiva',
            detail:
              'Doenças de notificação compulsória (DNC) têm relevância epidemiológica elevada.',
            icon: 'HeartPulse',
          },
          {
            label: 'Demanda',
            detail:
              'Identificação precoce, notificação imediata e medidas de vigilância e controle.',
            icon: 'Radar',
          },
          {
            label: 'Enfermagem',
            detail:
              'Papel dos serviços de saúde na detecção, investigação e prevenção dessas doenças.',
            icon: 'Stethoscope',
          },
          {
            label: 'Doença',
            detail: 'Tétano — doença bacteriana por Clostridium tetani; é DNC.',
            icon: 'Bug',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: '“Só tétano neonatal notifica; adultos dispensam”.',
            icon: 'AlertTriangle',
          },
        ],
        'Tétano DNC ≠ só neonatal',
      ),
      logicFlow(
        [
          'Item: tétano é DNC, mas só neonatal obrigaria a notificação.',
          'Em saúde coletiva, DNC exige identificação precoce e vigilância.',
          'Lista: tétano (não só neonatal) — adultos também notificam.',
          'Conclusão: a restrição a neonatal está falsa.',
          'Julgamento: Errado.',
          'Marcar B.',
          'Em similares: DNC de tétano cobre além do neonatal.',
        ],
        'Só neonatal = falso → letra B',
      ),
      goldenRule(
        'Tétano e DNC',
        'Decore',
        [
          { label: 'DNC', value: 'Tétano entra na lista compulsória.', badge: 'ok' },
          { label: 'Neonatal', value: 'Forma crítica — sem exclusividade.', badge: 'warn' },
          { label: 'Adultos', value: 'Também exigem notificação e controle.', badge: 'ok' },
        ],
        'Não restringir tétano só ao neonatal',
      ),
      dangerZone(
        'PEGADINHAS — tétano',
        [
          {
            label: 'Letra A — Certo',
            detail: 'Aceitar que só neonatal obriga notificar.',
            correct: 'A restrição a neonatal é falsa — adultos também notificam.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “tétano nunca é DNC”.',
            correct: 'Tétano é DNC; o erro era limitar ao neonatal.',
          },
        ],
        'Restringir DNC ao neonatal → distrator',
      ),
    ],
  },
  {
    file: 'selecon-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563685104-8.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'NOB/SUS 96 instituiu a PPI (Programação Pactuada e Integrada) para regionalização e hierarquização. Não centralizou só nos estados nem extinguiu gestão plena/avançada.',
    sources: [{ ...NOB, covers: ['NOB/SUS 96', 'PPI', 'regionalização'] }],
    slides: [
      conceptMap(
        'NOB/SUS 96 — o que avançou?',
        [
          {
            label: 'Norma',
            detail: 'NOB/SUS 96 — avanços na gestão do SUS.',
            icon: 'FileText',
          },
          {
            label: 'PPI',
            detail: 'Instituiu a Programação Pactuada e Integrada.',
            icon: 'Network',
          },
          {
            label: 'Finalidade',
            detail: 'Regionalização e hierarquização da assistência.',
            icon: 'Map',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Dizer que a NOB tirou o município da gestão ou “só federalizou”.',
            icon: 'AlertTriangle',
          },
        ],
        'NOB 96 → PPI + regionalização',
      ),
      logicFlow(
        [
          'Pergunta: disposição correta da NOB/SUS 96.',
          'Eliminar “município fora da gestão” / só estados.',
          'Eliminar financiamento só estadual da AB.',
          'Eliminar extinção das modalidades plena/avançada.',
          'Manter PPI com regionalização/hierarquização.',
          'Marcar B.',
          'Em similares: NOB 96 = PPI pactuada.',
        ],
        'PPI → letra B',
      ),
      goldenRule(
        'NOB 96 em uma linha',
        'Decore',
        [
          { label: 'PPI', value: 'Programação Pactuada e Integrada.', badge: 'ok' },
          { label: 'Eixo', value: 'Regionalizar e hierarquizar assistência.', badge: 'ok' },
          { label: 'Não', value: 'Não “federalizou tudo” nem tirou o município.', badge: 'warn' },
        ],
        'PPI é o marco da NOB 96',
      ),
      dangerZone(
        'PEGADINHAS — NOB 96',
        [
          {
            label: 'Letra A — só estados',
            detail: 'Eliminou gestão municipal; só estados administram.',
            correct: 'Falso: NOB reforçou pactuação — não tirou o município.',
          },
          {
            label: 'Letra C — AB só estadual',
            detail: 'Financiamento da AB só com recursos estaduais.',
            correct: 'Financiamento do SUS é tripartite — não exclusividade estadual.',
          },
          {
            label: 'Letra D — só federalizada',
            detail: 'Extinguiu plena/avançada; só gestão federalizada.',
            correct: 'Não é o avanço cobrado; o marco é a PPI.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “NOB 96 = só teto federal”.',
            correct: 'Lembre PPI + regionalização/hierarquização.',
          },
        ],
        'Centralizar/federalizar no lugar da PPI → distrator',
      ),
    ],
  },
  {
    file: 'selecon-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563617321-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Meningite meningocócica: notificação compulsória imediata na suspeita (até 24 h). Não esperar laboratório; equipe multiprofissional participa.',
    sources: [
      { ...LISTA, covers: ['meningite', 'notificação imediata', '24 horas'] },
      { ...GUIA, covers: ['vigilância meningocócica', 'suspeita'] },
    ],
    slides: [
      conceptMap(
        'Suspeita de meningite meningocócica',
        [
          {
            label: 'Quadro',
            detail: 'Febre alta, cefaleia, rigidez de nuca, vômitos — suspeita meningocócica.',
            icon: 'Thermometer',
          },
          {
            label: 'Ação',
            detail: 'Notificação compulsória imediata — na suspeita.',
            icon: 'Bell',
          },
          {
            label: 'Prazo',
            detail: 'Comunicar em até 24 horas após a suspeita.',
            icon: 'Clock',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Esperar laboratório ou “só o médico notifica”.',
            icon: 'AlertTriangle',
          },
        ],
        'Suspeita meningocócica → imediato 24 h',
      ),
      logicFlow(
        [
          'Cenário: suspeita de meningite meningocócica na UBS.',
          'Eliminar “só após confirmação laboratorial”.',
          'Eliminar “suspeita não basta” / esperar evolução.',
          'Eliminar “só médico notifica”.',
          'Manter notificação imediata em até 24 h na suspeita.',
          'Marcar C.',
          'Em similares: meningocócica = imediato na suspeita.',
        ],
        'Imediato 24 h → letra C',
      ),
      goldenRule(
        'Meningite e prazo',
        'Decore',
        [
          { label: 'Quando', value: 'Na suspeita clínica — não só no lab.', badge: 'ok' },
          { label: 'Prazo', value: 'Até 24 horas (imediata).', badge: 'ok' },
          { label: 'Quem', value: 'Equipe de saúde — não exclusivo do médico.', badge: 'warn' },
        ],
        'Suspeita já dispara a notificação',
      ),
      dangerZone(
        'PEGADINHAS — meningite',
        [
          {
            label: 'Letra A — só após lab',
            detail: 'Notificar só após confirmação laboratorial.',
            correct: 'Imediata na suspeita — lab não libera o atraso.',
          },
          {
            label: 'Letra B — aguardar evolução',
            detail: 'Esperar evolução porque suspeita não basta.',
            correct: 'Suspeita já obriga notificação imediata.',
          },
          {
            label: 'Letra D — só médico',
            detail: 'Notificação exclusiva do médico; TE sem ação.',
            correct: 'Equipe participa; TE não fica de fora da vigilância.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “imediata = 7 dias”.',
            correct: 'Imediata meningocócica = até 24 h na suspeita.',
          },
        ],
        'Esperar lab ou só médico → distrator',
      ),
    ],
  },
  {
    file: 'selecon-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Sinan: lista nacional de DNC inclui acidente de trabalho. Hipertensão, diabetes tipo I e fibrose cística não são o exemplo típico da lista compulsória pedida.',
    sources: [{ ...LISTA, covers: ['Sinan', 'acidente de trabalho', 'lista nacional'] }],
    slides: [
      conceptMap(
        'Sinan — o que alimenta a lista?',
        [
          {
            label: 'Sistema',
            detail: 'Sinan — notificação e investigação de agravos da lista nacional.',
            icon: 'Database',
          },
          {
            label: 'Exemplo',
            detail: 'Acidente de trabalho está entre os agravos de notificação compulsória.',
            icon: 'HardHat',
          },
          {
            label: 'Não confundir',
            detail: 'Doenças crônicas comuns (HAS, DM) ≠ exemplo da lista DNC desta prova.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar hipertensão/diabetes por “serem frequentes”.',
            icon: 'AlertTriangle',
          },
        ],
        'Sinan lista DNC → acidente de trabalho',
      ),
      logicFlow(
        [
          'Pedido: exemplo da lista nacional no Sinan.',
          'Eliminar hipertensão, diabetes tipo I e fibrose cística.',
          'Manter acidente de trabalho.',
          'Marcar D.',
          'Em similares: agravo de trabalho entra no Sinan/DNC.',
        ],
        'Acidente de trabalho → letra D',
      ),
      goldenRule(
        'Lista × crônica comum',
        'Decore',
        [
          { label: 'DNC (ex.)', value: 'Acidente de trabalho.', badge: 'ok' },
          { label: 'Não é o exemplo', value: 'HAS, DM tipo I, fibrose cística nesta chave.', badge: 'warn' },
          { label: 'Sinan', value: 'Alimentado pela lista compulsória.', badge: 'ok' },
        ],
        'Frequente ≠ compulsório nesta lista',
      ),
      dangerZone(
        'PEGADINHAS — Sinan',
        [
          {
            label: 'Letra A — hipertensão',
            detail: 'Hipertensão.',
            correct: 'Crônica frequente — não é o exemplo DNC cobrado.',
          },
          {
            label: 'Letra B — diabetes tipo I',
            detail: 'Diabetes tipo I.',
            correct: 'Não fecha o exemplo da lista nacional desta questão.',
          },
          {
            label: 'Letra C — fibrose cística',
            detail: 'Fibrose cística.',
            correct: 'Não é o agravo de notificação da chave (acidente de trabalho).',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “Sinan só infecciosas”.',
            correct: 'Há agravos não infecciosos — ex.: acidente de trabalho.',
          },
        ],
        'Trocar DNC por crônica comum → distrator',
      ),
    ],
  },
  {
    file: 'selecon-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563718396-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Notificação compulsória: instrumento legal (identificar/monitorar/controlar); obrigatória a toda a equipe. Não só surto; não só médico; omissão não é aceitável.',
    sources: [{ ...LISTA, covers: ['notificação compulsória', 'obrigatoriedade', 'equipe'] }],
    slides: [
      conceptMap(
        'O que é notificação compulsória?',
        [
          {
            label: 'Natureza',
            detail: 'Instrumento legal de vigilância — identificar, monitorar e controlar.',
            icon: 'Scale',
          },
          {
            label: 'Quem',
            detail: 'Obrigatória para todos os profissionais de saúde da equipe.',
            icon: 'Users',
          },
          {
            label: 'Quando',
            detail: 'Casos isolados e endêmicos também — não só surto/epidemia.',
            icon: 'Bell',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: '“Só médico / só mortalidade alta / omitir se risco baixo”.',
            icon: 'AlertTriangle',
          },
        ],
        'Legal + equipe + sempre na lista',
      ),
      logicFlow(
        [
          'Afirmação correta sobre notificação compulsória.',
          'Eliminar “só em surto/epidemia”.',
          'Eliminar “só médico / só alta mortalidade”.',
          'Eliminar “omitir se risco baixo”.',
          'Manter instrumento legal + obrigação de toda a equipe.',
          'Marcar D.',
          'Em similares: compulsória = legal + multiprofissional.',
        ],
        'Instrumento legal da equipe → letra D',
      ),
      goldenRule(
        'Três eixos',
        'Decore',
        [
          { label: 'Legal', value: 'Identificar, monitorar e controlar.', badge: 'ok' },
          { label: 'Equipe', value: 'Médicos, enfermeiros e demais da saúde.', badge: 'ok' },
          { label: 'Não', value: 'Não restringir a surto ou só ao médico.', badge: 'warn' },
        ],
        'Compulsória não é opcional',
      ),
      dangerZone(
        'PEGADINHAS — compulsória',
        [
          {
            label: 'Letra A — só surto',
            detail: 'Só em surtos/epidemias; isolados dispensam.',
            correct: 'Lista vale também fora de surto — caso isolado notifica.',
          },
          {
            label: 'Letra B — só médico/mortalidade',
            detail: 'Só doenças de alta mortalidade; só médicos.',
            correct: 'Equipe inteira; critério é a lista, não “só mortalidade”.',
          },
          {
            label: 'Letra C — omitir se risco baixo',
            detail: 'Aceitável não notificar se risco “baixo”.',
            correct: 'Omissão não é aceitável — obrigação legal.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “TE não participa da notificação”.',
            correct: 'Equipe multiprofissional — TE integra a vigilância.',
          },
        ],
        'Restringir surto/médico/omitir → distrator',
      ),
    ],
  },
  {
    file: 'selecon-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563718396-8.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Proporção de crianças que apresentaram o evento no período em relação ao total da população = prevalência (período). Incidência = novos; mortalidade = óbitos; RR = comparação de grupos.',
    exam_vs_current:
      'Cenário com 120/1000 em 12 meses pode confundir com incidência de novos; a chave da prova pede prevalência como proporção no período.',
    sources: [{ ...PRINCIPIOS, covers: ['prevalência', 'incidência', 'proporção'] }],
    slides: [
      conceptMap(
        '120 em 1.000 no ano — qual medida?',
        [
          {
            label: 'Pedido',
            detail: 'Proporção de crianças que apresentaram doenças respiratórias no período.',
            icon: 'PieChart',
          },
          {
            label: 'Medida',
            detail: 'Prevalência — casos no período / população.',
            icon: 'BarChart3',
          },
          {
            label: 'Não é',
            detail: 'Incidência (só novos), mortalidade (óbito) ou risco relativo (comparação).',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Ver “12 meses” e marcar incidência automaticamente.',
            icon: 'AlertTriangle',
          },
        ],
        'Proporção no período = prevalência',
      ),
      logicFlow(
        [
          'Medida: proporção que apresentou o evento no ano / total.',
          'Eliminar incidência se o enunciado pede proporção no período (estoque relativo).',
          'Eliminar mortalidade (não há óbitos no pedido).',
          'Eliminar risco relativo (não compara grupos).',
          'Manter prevalência.',
          'Marcar C.',
          'Em similares: “proporção no período” → prevalência.',
        ],
        'Prevalência → letra C',
      ),
      goldenRule(
        'Quatro medidas',
        'Decore',
        [
          { label: 'Prevalência', value: 'Proporção com o evento no período/população.', badge: 'ok' },
          { label: 'Incidência', value: 'Ênfase em casos novos.', badge: 'warn' },
          { label: 'Mortalidade / RR', value: 'Óbitos ou comparação entre grupos.', badge: 'warn' },
        ],
        'Proporção ≠ só “novos”',
      ),
      dangerZone(
        'PEGADINHAS — indicador',
        [
          {
            label: 'Letra A — incidência',
            detail: 'Incidência porque “há período de 12 meses”.',
            correct: 'A chave pede proporção no período = prevalência.',
          },
          {
            label: 'Letra B — mortalidade',
            detail: 'Taxa de mortalidade por doenças respiratórias.',
            correct: 'Não há óbitos no enunciado — só ocorrência.',
          },
          {
            label: 'Letra D — risco relativo',
            detail: 'Risco relativo entre grupos.',
            correct: 'Não há comparação de grupos — só uma proporção.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “prevalência ignora a população”.',
            correct: 'Prevalência relaciona casos à população de referência.',
          },
        ],
        'Trocar proporção por incidência/óbito/RR → distrator',
      ),
    ],
  },
  {
    file: 'selecon-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563774121-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Janela diagnóstica: tempo entre infecção e aparecimento/detecção de marcador. Não confundir com primo-infecção, terapêutica ou “transdisciplinar”.',
    sources: [{ ...JANELA, covers: ['janela diagnóstica', 'marcador', 'infecção'] }],
    slides: [
      conceptMap(
        'Janela entre infecção e marcador',
        [
          {
            label: 'Definição',
            detail: 'Tempo da infecção até aparecer/detectar um marcador.',
            icon: 'Hourglass',
          },
          {
            label: 'Nome',
            detail: 'Janela diagnóstica.',
            icon: 'ScanSearch',
          },
          {
            label: 'Uso',
            detail: 'Explica período em que o teste ainda pode ser negativo.',
            icon: 'FlaskConical',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar por “janela terapêutica” ou “primo-infecção”.',
            icon: 'AlertTriangle',
          },
        ],
        'Infecção → marcador = diagnóstica',
      ),
      logicFlow(
        [
          'Definição: tempo infecção → detecção do marcador.',
          'Eliminar primo-infecção (fase clínica, não o nome da janela).',
          'Eliminar transdisciplinar (jargão fora do conceito).',
          'Eliminar terapêutica (janela de tratamento ≠ marcador).',
          'Manter diagnóstica.',
          'Marcar D.',
          'Em similares: marcador laboratorial = janela diagnóstica.',
        ],
        'Janela diagnóstica → letra D',
      ),
      goldenRule(
        'Nome da janela',
        'Decore',
        [
          { label: 'Diagnóstica', value: 'Infecção → marcador detectável.', badge: 'ok' },
          { label: 'Terapêutica', value: 'Janela de tratamento — outro conceito.', badge: 'warn' },
          { label: 'Primo-infecção', value: 'Fase/clínica — não o nome desta janela.', badge: 'warn' },
        ],
        'Marcador = diagnóstica',
      ),
      dangerZone(
        'PEGADINHAS — janela',
        [
          {
            label: 'Letra A — primo-infecção',
            detail: 'Janela primo-infecção.',
            correct: 'Primo-infecção não nomeia o intervalo até o marcador.',
          },
          {
            label: 'Letra B — transdisciplinar',
            detail: 'Janela transdisciplinar.',
            correct: 'Termo fora do conceito epidemiológico/laboratorial.',
          },
          {
            label: 'Letra C — terapêutica',
            detail: 'Janela terapêutica.',
            correct: 'Fala de tratamento — não de detecção do marcador.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “janela diagnóstica = tempo até o tratamento”.',
            correct: 'É até o marcador ser detectável — não até tratar.',
          },
        ],
        'Trocar diagnóstica por terapêutica → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g24',
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
