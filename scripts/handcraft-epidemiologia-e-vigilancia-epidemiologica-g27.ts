/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g27 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g27.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g27';
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
const PORT264 = {
  id: 'portaria-ms-264-notificacao',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Portaria MS nº 264 — lista nacional de notificação compulsória',
  year: 2020,
  url: 'https://www.gov.br/saude/pt-br',
};
const PRINCIPIOS = {
  id: 'modulo-principios-epidemiologia-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Princípios de epidemiologia — incidência',
  year: 2010,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/modulo_principios_epidemiologia_2.pdf',
};
const COVID = {
  id: 'vigilancia-covid-srag-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Vigilância covid-19 / SRAG — sinais de agravamento',
  year: 2021,
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
    file: 'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563617321-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Incidência aumentada = ocorrência de casos novos. Não é estabilidade do estoque, epidemia, surto nem sazonalidade do exame.',
    sources: [{ ...PRINCIPIOS, covers: ['incidência', 'casos novos', 'PAINPSE'] }],
    slides: [
      conceptMap(
        'Incidência de PAINPSE aumentou — o que significa?',
        [
          {
            label: 'Contexto',
            detail: 'SESMT / Programa de Conservação Auditiva: incidência de PAINPSE no último ano.',
            icon: 'Ear',
          },
          {
            label: 'Incidência',
            detail: 'Medida de ocorrência de casos novos entre expostos ao ruído.',
            icon: 'TrendingUp',
          },
          {
            label: 'Leitura',
            detail: 'Aumento de incidência = mais casos novos no período.',
            icon: 'Plus',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar por surto/epidemia ou “só estabilidade dos já diagnosticados”.',
            icon: 'AlertTriangle',
          },
        ],
        'Incidência ↑ = casos novos',
      ),
      logicFlow(
        [
          'Dado: incidência de PAINPSE aumentou.',
          'Incidência fala de casos novos — não de estoque estável.',
          'Eliminar epidemia, surto e “sazonalidade do exame”.',
          'Manter ocorrência de casos novos.',
          'Marcar A.',
          'Em similares: incidência = novos no período.',
        ],
        'Casos novos → letra A',
      ),
      goldenRule(
        'Incidência em uma linha',
        'Decore',
        [
          { label: 'Incidência', value: 'Casos novos no período.', badge: 'ok' },
          { label: 'Não é', value: 'Só estabilidade do diagnóstico antigo.', badge: 'warn' },
          { label: 'Não é', value: 'Sinônimo automático de surto/epidemia.', badge: 'warn' },
        ],
        'Incidência ≠ surto automático',
      ),
      dangerZone(
        'PEGADINHAS — incidência',
        [
          {
            label: 'Letra B — estabilidade',
            detail: 'Estabilidade no número que já tinha o diagnóstico.',
            correct: 'Isso é estoque/prevalência — não aumento de incidência.',
          },
          {
            label: 'Letra C — epidemia',
            detail: 'Uma epidemia.',
            correct: 'Incidência ↑ não define epidemia sozinha.',
          },
          {
            label: 'Letra D — surto',
            detail: 'Um surto.',
            correct: 'Surto exige critério espacial/temporal — não é o significado direto.',
          },
          {
            label: 'Letra E — sazonalidade do exame',
            detail: 'Aumento sazonal por época do exame.',
            correct: 'A chave lê incidência = casos novos, não calendário do exame.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “incidência conta todos os antigos”.',
            correct: 'Antigos = prevalência; incidência = novos.',
          },
        ],
        'Trocar novos por surto/estoque → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563718396-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Chave da prova (TB): notificar após confirmação do caso. Não é privativa do médico; não exige notificação para liberar exames; não ao fim do tratamento; não imediata ao MS.',
    exam_vs_current:
      'Prova marca notificação de TB após confirmação. Na prática vigente, TB entra na lista compulsória (em geral semanal) já na suspeita — slides ensinam a chave da prova.',
    sources: [{ ...LISTA, covers: ['tuberculose', 'notificação compulsória'] }],
    slides: [
      conceptMap(
        'TB suspeita na UBS — notificação (chave)',
        [
          {
            label: 'Cenário',
            detail: 'Demanda espontânea: caso suspeito de tuberculose pulmonar (DNC).',
            icon: 'Stethoscope',
          },
          {
            label: 'Chave da prova',
            detail: 'Notificação deve ser realizada após a confirmação do caso.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'Não é',
            detail: 'Privativa do médico; nem imediata ao Ministério da Saúde nesta chave.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Notificar só no fim do tratamento ou “só o médico”.',
            icon: 'AlertTriangle',
          },
        ],
        'Chave: após confirmação (nesta prova)',
      ),
      logicFlow(
        [
          'TB é DNC — o que a prova afirma como correto?',
          'Eliminar “privativa do médico”.',
          'Eliminar “necessária para fazer exames confirmatórios”.',
          'Eliminar “ao término do tratamento”.',
          'Eliminar “imediata ao Ministério da Saúde”.',
          'Manter: após a confirmação do caso (chave).',
          'Marcar B.',
          'Em similares: ler a chave — aqui confirmação precede a notificação.',
        ],
        'Após confirmação → letra B',
      ),
      goldenRule(
        'O que a prova marca',
        'Decore',
        [
          { label: 'Momento (chave)', value: 'Após confirmação do caso.', badge: 'ok' },
          { label: 'Quem', value: 'Não é privativa do médico.', badge: 'warn' },
          { label: 'Não', value: 'Não só no fim do tratamento; não “imediata ao MS”.', badge: 'warn' },
        ],
        'Confirmação ≠ fim do tratamento',
      ),
      dangerZone(
        'PEGADINHAS — TB',
        [
          {
            label: 'Letra A — só médico',
            detail: 'Notificação privativa do médico.',
            correct: 'Equipe participa — não é privativa.',
          },
          {
            label: 'Letra C — para liberar exames',
            detail: 'Necessária para realizar exames confirmatórios.',
            correct: 'Exames não dependem da notificação como “ingresso”.',
          },
          {
            label: 'Letra D — fim do tratamento',
            detail: 'Realizada ao término do tratamento.',
            correct: 'Momento errado — a chave aponta confirmação.',
          },
          {
            label: 'Letra E — imediata ao MS',
            detail: 'Notificação imediata ao Ministério da Saúde.',
            correct: 'Nesta chave TB não é o eixo “imediata ao MS”.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “TB nunca notifica na suspeita”.',
            correct: 'Conferir a lista vigente — esta questão segue a chave da banca.',
          },
        ],
        'Adiar ao tratamento ou restringir ao médico → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563718396-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Covid-19 com teste rápido positivo: notificar imediatamente no Sinan. Não só grave; não esperar PCR; não só semanal; não só se houver contato.',
    sources: [
      { ...LISTA, covers: ['covid-19', 'Sinan', 'notificação'] },
      { ...COVID, covers: ['teste rápido', 'vigilância'] },
    ],
    slides: [
      conceptMap(
        'Teste rápido covid positivo — conduta Sinan',
        [
          {
            label: 'Cenário',
            detail: 'Auxiliar de enfermagem: teste rápido de covid-19 positivo.',
            icon: 'FlaskConical',
          },
          {
            label: 'Conduta',
            detail: 'Notificar o caso imediatamente no Sinan, registrando o resultado positivo.',
            icon: 'Bell',
          },
          {
            label: 'Para quê',
            detail: 'Monitoramento epidemiológico.',
            icon: 'Radar',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Esperar PCR, só grave, só semanal ou só com contato.',
            icon: 'AlertTriangle',
          },
        ],
        'Positivo no rápido → Sinan imediato',
      ),
      logicFlow(
        [
          'Resultado: teste rápido positivo para covid-19.',
          'Eliminar “só se agravar / só grave”.',
          'Eliminar “aguardar PCR”.',
          'Eliminar “só semanal” e “só o médico se houver contato”.',
          'Manter notificação imediata no Sinan.',
          'Marcar A.',
          'Em similares: positivo notificável → registrar no Sinan já.',
        ],
        'Sinan imediato → letra A',
      ),
      goldenRule(
        'Covid no Sinan',
        'Decore',
        [
          { label: 'Quando', value: 'Imediatamente após o positivo.', badge: 'ok' },
          { label: 'Onde', value: 'Sinan — monitoramento epidemiológico.', badge: 'ok' },
          { label: 'Não', value: 'Não condicionar a PCR/gravidade/contato.', badge: 'warn' },
        ],
        'Rápido positivo já notifica',
      ),
      dangerZone(
        'PEGADINHAS — covid/Sinan',
        [
          {
            label: 'Letra B — só grave',
            detail: 'Registrar só se agravar; só graves obrigatórios.',
            correct: 'Positivo já entra — não espera gravidade.',
          },
          {
            label: 'Letra C — aguardar PCR',
            detail: 'Esperar PCR por falso positivo do rápido.',
            correct: 'Não travar a notificação no PCR nesta chave.',
          },
          {
            label: 'Letra D — só semanal',
            detail: 'Registrar só de forma semanal.',
            correct: 'Conduta pedida: notificar imediatamente no Sinan.',
          },
          {
            label: 'Letra E — só médico/contato',
            detail: 'Médico notifica só se houver contato com suspeitos.',
            correct: 'Auxiliar age no Sinan; contato não é pré-requisito.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “teste rápido nunca alimenta vigilância”.',
            correct: 'Resultado positivo integra o monitoramento no Sinan.',
          },
        ],
        'Adiar ou restringir a notificação → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563725570-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Meningite bacteriana suspeita: notificar em até 24 h após a suspeita clínica. Não 48 h pós-confirmação; não 7 dias; não 72 h pós-tratamento; não “só em surto”.',
    sources: [
      { ...LISTA, covers: ['meningite bacteriana', 'notificação imediata', '24 horas'] },
      { ...GUIA, covers: ['meningite', 'suspeita clínica'] },
    ],
    slides: [
      conceptMap(
        'Meningite bacteriana suspeita — prazo',
        [
          {
            label: 'Evento',
            detail: 'Caso suspeito de meningite bacteriana (DNC).',
            icon: 'AlertCircle',
          },
          {
            label: 'Prazo',
            detail: 'Até 24 horas após a suspeita clínica.',
            icon: 'Clock',
          },
          {
            label: 'Gatilho',
            detail: 'Suspeita — não esperar só a confirmação laboratorial.',
            icon: 'Zap',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar 24 h por prazos alongados ou “só em surto”.',
            icon: 'AlertTriangle',
          },
        ],
        'Suspeita clínica → até 24 h',
      ),
      logicFlow(
        [
          'Pedido: quando notificar meningite bacteriana suspeita.',
          'Eliminar prazos após confirmação/tratamento alongados.',
          'Eliminar “até 7 dias após a suspeita”.',
          'Eliminar “só em surtos epidêmicos”.',
          'Manter até 24 h após a suspeita clínica.',
          'Marcar A.',
          'Em similares: meningite bacteriana = imediato na suspeita.',
        ],
        '24 h na suspeita → letra A',
      ),
      goldenRule(
        'Prazo meningite',
        'Decore',
        [
          { label: 'Quando', value: 'Na suspeita clínica.', badge: 'ok' },
          { label: 'Prazo', value: 'Até 24 horas.', badge: 'ok' },
          { label: 'Não', value: 'Não condicionar a surto nem alongar o prazo.', badge: 'warn' },
        ],
        'Suspeita já dispara o prazo',
      ),
      dangerZone(
        'PEGADINHAS — meningite',
        [
          {
            label: 'Letra B — após confirmação',
            detail: 'Prazo após o diagnóstico confirmado.',
            correct: 'Gatilho é a suspeita clínica — não só a confirmação.',
          },
          {
            label: 'Letra C — prazo semanal',
            detail: 'Prazo longo após a suspeita clínica.',
            correct: 'Imediata: até 24 h — não cabe ritmo semanal.',
          },
          {
            label: 'Letra D — após tratamento',
            detail: 'Prazo após o tratamento inicial.',
            correct: 'Notificar na suspeita — não depois de iniciar tratamento.',
          },
          {
            label: 'Letra E — só surto',
            detail: 'Apenas em surtos epidêmicos.',
            correct: 'Caso isolado suspeito também notifica.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “meningite espera liquor positivo”.',
            correct: 'Suspeita clínica já abre o prazo de 24 h.',
          },
        ],
        'Alongar prazo ou esperar surto → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563774121-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Doença meningocócica: notificar todos os casos suspeitos e confirmados. Não só hospital; quimioprofilaxia não é universal (todo contato / todo profissional).',
    sources: [{ ...GUIA, covers: ['doença meningocócica', 'notificação', 'quimioprofilaxia'] }],
    slides: [
      conceptMap(
        'Doença meningocócica — vigilância',
        [
          {
            label: 'Notificação',
            detail: 'Todos os casos suspeitos e confirmados às autoridades competentes.',
            icon: 'Bell',
          },
          {
            label: 'Quem',
            detail: 'Não é responsabilidade exclusiva do hospital do diagnóstico.',
            icon: 'Users',
          },
          {
            label: 'Profilaxia',
            detail: 'Quimioprofilaxia segue critério de contato — não “todo mundo” automático.',
            icon: 'Pill',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Prazo alongado de notificação ou profilaxia universal (todo contato / todo profissional).',
            icon: 'AlertTriangle',
          },
        ],
        'Suspeito e confirmado → notificar',
      ),
      logicFlow(
        [
          'Ação correta na vigilância da doença meningocócica.',
          'Eliminar notificação só com prazo alongado para SMS/SES/MS.',
          'Eliminar exclusividade hospitalar.',
          'Eliminar profilaxia para todos os contatos do período pré-sintomas.',
          'Eliminar profilaxia a todo profissional independentemente de EPI.',
          'Manter: notificar todos os suspeitos e confirmados.',
          'Marcar A.',
          'Em similares: meningocócica = suspeito + confirmado na rede.',
        ],
        'Todos suspeitos/confirmados → letra A',
      ),
      goldenRule(
        'Dois eixos',
        'Decore',
        [
          { label: 'Notificar', value: 'Suspeitos e confirmados.', badge: 'ok' },
          { label: 'Rede', value: 'Autoridades competentes — não só o hospital.', badge: 'ok' },
          { label: 'Profilaxia', value: 'Seletiva — não automática para todos.', badge: 'warn' },
        ],
        'Suspeito já entra na notificação',
      ),
      dangerZone(
        'PEGADINHAS — meningocócica',
        [
          {
            label: 'Letra B — prazo alongado',
            detail: 'Notificar confirmados com prazo alongado às três esferas.',
            correct: 'Eixo correto é notificar suspeitos e confirmados — não esse prazo.',
          },
          {
            label: 'Letra C — só hospital',
            detail: 'Responsabilidade exclusiva da instituição hospitalar.',
            correct: 'Rede de vigilância — não exclusividade hospitalar.',
          },
          {
            label: 'Letra D — profilaxia ampla',
            detail: 'Todos os contatos dos dias anteriores aos sintomas.',
            correct: 'Critério de contato é seletivo — não esse “todos”.',
          },
          {
            label: 'Letra E — todo profissional',
            detail: 'Todo profissional que atendeu recebe profilaxia, com ou sem EPI.',
            correct: 'EPI e avaliação de risco importam — não profilaxia universal.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só confirmação laboratorial notifica”.',
            correct: 'Suspeita clínica também alimenta a vigilância.',
          },
        ],
        'Restringir notificação ou alargar profilaxia → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563809836-8.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'SRAG (agravamento covid): dispneia ou saturação de O2 menor que 95% em ar ambiente. Não confundir com obstrução nasal, HAS, GI ou anosmia/ageusia isoladas.',
    sources: [{ ...COVID, covers: ['SRAG', 'dispneia', 'saturação', 'covid-19'] }],
    slides: [
      conceptMap(
        'Sinais definidores de SRAG',
        [
          {
            label: 'Objetivo',
            detail: 'Vigilância da covid-19: monitorar morbidade e reconhecer agravamento (SRAG).',
            icon: 'Activity',
          },
          {
            label: 'Definidores',
            detail: 'Dispneia ou saturação de O2 menor que 95% em ar ambiente.',
            icon: 'Wind',
          },
          {
            label: 'Não confundir',
            detail: 'Anosmia/ageusia e sintomas leves não definem SRAG sozinhos.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar febre+GI ou dor torácica/HAS como definidores de SRAG.',
            icon: 'AlertTriangle',
          },
        ],
        'Dispneia ou SpO2 < 95% = SRAG',
      ),
      logicFlow(
        [
          'Pedido: sinais definidores de SRAG no agravamento.',
          'Eliminar obstrução nasal + tiragem como pacote definidor.',
          'Eliminar PA elevada/dor torácica e febre+GI.',
          'Eliminar adinamia/anosmia/ageusia como definidores de SRAG.',
          'Manter dispneia ou SpO2 < 95% em ar ambiente.',
          'Marcar C.',
          'Em similares: SRAG = falta de ar / hipoxemia.',
        ],
        'Dispneia/SpO2 → letra C',
      ),
      goldenRule(
        'SRAG em uma linha',
        'Decore',
        [
          { label: 'SRAG', value: 'Dispneia ou SpO2 < 95% em ar ambiente.', badge: 'ok' },
          { label: 'Sintomas leves', value: 'Anosmia/ageusia ≠ definidor de SRAG.', badge: 'warn' },
          { label: 'Outros', value: 'GI/HAS não fecham o critério desta chave.', badge: 'warn' },
        ],
        'Hipoxemia/dispneia marcam SRAG',
      ),
      dangerZone(
        'PEGADINHAS — SRAG',
        [
          {
            label: 'Letra A — nasal + tiragem',
            detail: 'Obstrução nasal com tiragem intercostal.',
            correct: 'Não é o par definidor cobrado (dispneia/SpO2).',
          },
          {
            label: 'Letra B — PA / dor torácica',
            detail: 'Pressão arterial muito elevada ou dor torácica persistente.',
            correct: 'Pode ser alerta clínico — não o definidor de SRAG desta prova.',
          },
          {
            label: 'Letra D — febre + GI',
            detail: 'Febre alta com sintomas gastrointestinais.',
            correct: 'Não define SRAG nesta chave.',
          },
          {
            label: 'Letra E — anosmia/ageusia',
            detail: 'Adinamia, prostração, anosmia e ageusia.',
            correct: 'Sintomas frequentes de covid — não critérios de SRAG.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “SRAG = qualquer covid positivo”.',
            correct: 'SRAG exige marcadores de gravidade respiratória.',
          },
        ],
        'Trocar SpO2/dispneia por sintoma leve → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563814158-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Notificação semanal (até 7 dias): doença aguda pelo vírus Zika. Imediatos nesta chave: febre amarela, SRC, óbitos por dengue, acidente peçonhento.',
    sources: [{ ...PORT264, covers: ['Zika', 'notificação semanal', 'lista nacional'] }],
    slides: [
      conceptMap(
        'Qual é notificação semanal?',
        [
          {
            label: 'Lista',
            detail: 'Portaria MS — lista nacional de DNC (ritmo semanal × imediato).',
            icon: 'FileText',
          },
          {
            label: 'Semanal (chave)',
            detail: 'Doença aguda pelo vírus Zika — em até 7 dias da identificação.',
            icon: 'Calendar',
          },
          {
            label: 'Imediato (ex.)',
            detail: 'Febre amarela, SRC, óbitos por dengue, peçonhento.',
            icon: 'Zap',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar óbito por dengue ou febre amarela como semanal.',
            icon: 'AlertTriangle',
          },
        ],
        'Zika aguda = semanal nesta chave',
      ),
      logicFlow(
        [
          'Filtro: notificação semanal (até 7 dias).',
          'Eliminar febre amarela e síndrome da rubéola congênita.',
          'Eliminar dengue-óbitos e acidente por animal peçonhento.',
          'Manter doença aguda pelo vírus Zika.',
          'Marcar A.',
          'Em similares: Zika aguda no ritmo semanal da lista.',
        ],
        'Zika semanal → letra A',
      ),
      goldenRule(
        'Semanal × imediato',
        'Decore',
        [
          { label: 'Semanal', value: 'Zika aguda (até 7 dias).', badge: 'ok' },
          { label: 'Imediato (ex.)', value: 'Febre amarela, SRC, óbito dengue.', badge: 'warn' },
          { label: 'Peçonhento', value: 'Não é o semanal desta chave.', badge: 'warn' },
        ],
        'Óbito dengue ≠ semanal',
      ),
      dangerZone(
        'PEGADINHAS — ritmo',
        [
          {
            label: 'Letra B — febre amarela',
            detail: 'Febre amarela.',
            correct: 'Eixo imediato — não semanal.',
          },
          {
            label: 'Letra C — SRC',
            detail: 'Síndrome da rubéola congênita.',
            correct: 'Não é o item semanal da chave (Zika aguda).',
          },
          {
            label: 'Letra D — dengue-óbitos',
            detail: 'Dengue-óbitos.',
            correct: 'Óbito por dengue é imediato — não semanal.',
          },
          {
            label: 'Letra E — peçonhento',
            detail: 'Acidente por animal peçonhento.',
            correct: 'Não fecha o ritmo semanal pedido.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “toda Zika é imediata”.',
            correct: 'Zika aguda segue o ritmo da lista — aqui semanal.',
          },
        ],
        'Trocar semanal por imediato → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563814158-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Imediata: febre tifoide; violência sexual e tentativa de suicídio. Misturas semanais (TB, dengue casos, Zika/chikungunya, Chagas crônica) = pegadinha.',
    sources: [{ ...PORT264, covers: ['notificação imediata', 'febre tifoide', 'violência sexual', 'suicídio'] }],
    slides: [
      conceptMap(
        'Trio de notificação imediata',
        [
          {
            label: 'Pedido',
            detail: 'Doenças/agravos de notificação imediata na lista nacional.',
            icon: 'Zap',
          },
          {
            label: 'Trio-chave',
            detail: 'Febre tifoide; violência sexual e tentativa de suicídio.',
            icon: 'ShieldAlert',
          },
          {
            label: 'Semanal (ex.)',
            detail: 'Tuberculose, dengue (casos), Zika/chikungunya em misturas típicas.',
            icon: 'Calendar',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Juntar TB + violência ou dengue casos no pacote imediato.',
            icon: 'AlertTriangle',
          },
        ],
        'Tifoide + violência sexual + tentativa de suicídio',
      ),
      logicFlow(
        [
          'Filtro: somente o pacote imediato.',
          'Eliminar misturas com dengue (casos) e acidente com material biológico.',
          'Eliminar Chagas crônica / CJD e Zika/chikungunya.',
          'Eliminar tuberculose + violência doméstica como trio imediato.',
          'Manter febre tifoide + violência sexual + tentativa de suicídio.',
          'Marcar D.',
          'Em similares: violência sexual e tentativa de suicídio = imediato.',
        ],
        'Trio imediato → letra D',
      ),
      goldenRule(
        'Imediato desta chave',
        'Decore',
        [
          { label: 'Imediato', value: 'Febre tifoide; violência sexual; tentativa de suicídio.', badge: 'ok' },
          { label: 'Cuidado', value: 'TB e dengue (casos) não fecham o trio imediato.', badge: 'warn' },
          { label: 'Zika/chik', value: 'Não usar como “imediato automático” aqui.', badge: 'warn' },
        ],
        'Não misturar semanal no trio imediato',
      ),
      dangerZone(
        'PEGADINHAS — imediata',
        [
          {
            label: 'Letra A — AT + dengue',
            detail: 'Acidente com material biológico + dengue (casos).',
            correct: 'Pacote não corresponde ao trio imediato da chave.',
          },
          {
            label: 'Letra B — Chagas / CJD',
            detail: 'Chagas crônica e Creutzfeldt-Jakob.',
            correct: 'Não é o conjunto imediato cobrado.',
          },
          {
            label: 'Letra C — Zika / chikungunya',
            detail: 'Zika aguda e febre de Chikungunya.',
            correct: 'Não fecha o imediato desta alternativa correta.',
          },
          {
            label: 'Letra E — TB + violência doméstica',
            detail: 'Tuberculose e violência doméstica/outras.',
            correct: 'TB quebra o ritmo imediato do trio da chave.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “tentativa de suicídio nunca notifica”.',
            correct: 'É agravo de notificação imediata na lista.',
          },
        ],
        'Misturar semanal no imediato → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g27',
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
