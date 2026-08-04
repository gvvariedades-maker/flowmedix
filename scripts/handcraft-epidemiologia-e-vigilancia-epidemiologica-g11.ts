/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g11 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g11.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g11';
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
  title: 'Princípios de epidemiologia — cadeia de transmissão / atributos do agente',
  year: 2010,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/modulo_principios_epidemiologia_2.pdf',
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
    file: 'fundatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563617321-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Dermatose ocupacional: notificar suspeita/confirmação ligada ao trabalho. Não só grave; não só eritema; não exige biópsia para notificar.',
    exam_vs_current: 'Chave: F – F – V – F (letra A).',
    sources: [{ ...GUIA, covers: ['dermatose ocupacional', 'notificação', 'saúde do trabalhador'] }],
    slides: [
      conceptMap(
        'Dermatoses ocupacionais — V ou F',
        [
          { label: 'Quando notificar', detail: 'Suspeita ou confirmação de doença de pele causada/agravada no trabalho.', icon: 'Bell' },
          { label: 'Não restrinja', detail: 'Não é “só caso grave com incapacidade”.', icon: 'Ban' },
          { label: 'Clínica', detail: 'Não se limita a eritema/edema — pode ter complicações.', icon: 'Layers' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Exigir biópsia para só então notificar.', icon: 'AlertTriangle' },
        ],
        'Suspeita no trabalho já notifica',
      ),
      logicFlow(
        [
          'I — notificar só casos graves com incapacidade → Falsa.',
          'II — clínica só eritema/edema, sem complicações → Falsa.',
          'III — notificar suspeita/confirmação ligada ao trabalho → Verdadeira.',
          'IV — sempre determinada após biópsia → Falsa.',
          'Ordem: F – F – V – F.',
          'Marcar A.',
          'Em similares: VE age na suspeita ocupacional — sem esperar biópsia.',
        ],
        'Sequência F F V F → letra A',
      ),
      goldenRule(
        'Gabarito VF',
        'Decore a ordem',
        [
          { label: 'I', value: 'F — não só grave/incapacidade.', badge: 'warn' },
          { label: 'II', value: 'F — clínica não se limita a eritema/edema.', badge: 'warn' },
          { label: 'III', value: 'V — suspeita/confirmação no trabalho.', badge: 'ok' },
          { label: 'IV', value: 'F — biópsia não é pré-requisito.', badge: 'warn' },
        ],
        'F · F · V · F',
      ),
      dangerZone(
        'PEGADINHAS — dermatose ocupacional',
        [
          {
            label: 'Letra B — V F V V',
            detail: 'Aceita “só grave” e biópsia obrigatória.',
            correct: 'I e IV são falsas — não casa com B.',
          },
          {
            label: 'Letra C — F F V V',
            detail: 'Mantém biópsia como obrigatória.',
            correct: 'IV é falsa: notificar não depende de biópsia.',
          },
          {
            label: 'Letra D — V V F V',
            detail: 'Inverte quase tudo.',
            correct: 'I/II falsas e III verdadeira — ordem é F F V F.',
          },
          {
            label: 'Letra E — F V F F',
            detail: 'Mata a III verdadeira.',
            correct: 'III é a única verdadeira: notificar suspeita/confirmação.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só notifica se o INSS reconhecer o nexo”.',
            correct: 'Notificação de suspeita não espera o reconhecimento previdenciário.',
          },
        ],
        'Esperar gravidade/biópsia → distrator',
      ),
    ],
  },
  {
    file: 'fundatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563626015-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Diagnóstico confirmado de dengue grave: notificar dengue. Não “pula” notificação porque o médico confirmou; não notifica zika/chik/gripe sem base.',
    sources: [{ ...LISTA, covers: ['dengue', 'notificação compulsória', 'dengue grave'] }],
    slides: [
      conceptMap(
        'Dengue grave no PS — o que notificar',
        [
          { label: 'Caso', detail: '30 anos, dengue grave confirmada (febre, dor abdominal, hemorragia).', icon: 'Activity' },
          { label: 'Ação', detail: 'Notificar apenas dengue — o agravo diagnosticado.', icon: 'ClipboardCheck' },
          { label: 'Não misture', detail: 'Zika, chikungunya ou gripe sem evidência no caso.', icon: 'GitCompare' },
          { label: 'PEGADINHA-ÂNCORA', detail: '“Médico confirmou → não precisa notificar”.', icon: 'AlertTriangle' },
        ],
        'Confirmado dengue → notifica dengue',
      ),
      logicFlow(
        [
          'Isolar o diagnóstico: dengue grave confirmada.',
          'Eliminar “não notificar porque o médico confirmou”.',
          'Eliminar notificar zika, chikungunya ou gripe junto sem base.',
          'Manter: notificar apenas dengue.',
          'Marcar B.',
          'Em similares: notifique o agravo do caso — não “pacote arbovírus”.',
        ],
        'Notificar apenas dengue → B',
      ),
      goldenRule(
        'Regra do acolhimento',
        'Decore',
        [
          { label: 'Fazer', value: 'Notificar dengue (agravo confirmado).', badge: 'ok' },
          { label: 'Não fazer', value: 'Pular notificação · empilhar zika/chik/gripe sem critério.', badge: 'warn' },
        ],
        'Confirmação reforça — não cancela — a notificação',
      ),
      dangerZone(
        'PEGADINHAS — dengue no PS',
        [
          {
            label: 'Letra A — dengue + zika',
            detail: 'Notificar dengue e zika.',
            correct: 'Só há diagnóstico de dengue — não invente zika.',
          },
          {
            label: 'Letra C — não notificar',
            detail: 'Não notificar porque o médico confirmou.',
            correct: 'Confirmação reforça a compulsória — não a dispensa.',
          },
          {
            label: 'Letra D — dengue + gripe',
            detail: 'Notificar dengue e gripe sazonal.',
            correct: 'Gripe não está no diagnóstico deste caso.',
          },
          {
            label: 'Letra E — dengue + chik',
            detail: 'Notificar dengue e chikungunya.',
            correct: 'Sem evidência de chikungunya — notifique só dengue.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “suspeita de dengue sem lab → não notifica”.',
            correct: 'Suspeita também entra no fluxo — aqui ainda por cima está confirmada.',
          },
        ],
        'Empilhar arbovírus ou pular notificação → distrator',
      ),
    ],
  },
  {
    file: 'fundatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563626015-2.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Notificação semanal: hanseníase, TB, óbito materno, LV. EXCETO raiva humana — é imediata.',
    sources: [{ ...LISTA, covers: ['raiva humana', 'notificação imediata', 'notificação semanal'] }],
    slides: [
      conceptMap(
        'Semanal — ache o EXCETO',
        [
          { label: 'Comando', detail: 'Doenças/agravos de notificação semanal, EXCETO.', icon: 'Search' },
          { label: 'Semanal típico', detail: 'Hanseníase, tuberculose, óbito materno, leishmaniose visceral.', icon: 'Calendar' },
          { label: 'Imediata', detail: 'Raiva humana — não entra no bolso “semanal”.', icon: 'Zap' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Deixar raiva no semanal porque “também é compulsória”.', icon: 'AlertTriangle' },
        ],
        'Raiva humana = imediata (EXCETO)',
      ),
      logicFlow(
        [
          'Exigir o que NÃO é de notificação semanal.',
          'Validar hanseníase, TB, óbito materno e LV como semanais típicos nesta chave.',
          'Isolar raiva humana → notificação imediata.',
          'Marcar C.',
          'Em similares: compulsória ≠ mesmo relógio — leia imediata × semanal.',
        ],
        'Raiva humana fora do semanal → C',
      ),
      goldenRule(
        'Relógio da raiva',
        'Decore',
        [
          { label: 'Semanal (exemplos)', value: 'Hanseníase · TB · óbito materno · LV.', badge: 'ok' },
          { label: 'Imediata', value: 'Raiva humana.', badge: 'warn' },
        ],
        'Raiva não espera a semana',
      ),
      dangerZone(
        'PEGADINHAS — semanal EXCETO',
        [
          {
            label: 'Letra A — hanseníase',
            detail: 'Hanseníase.',
            correct: 'É de notificação semanal nesta chave — não é o EXCETO.',
          },
          {
            label: 'Letra B — tuberculose',
            detail: 'Tuberculose.',
            correct: 'TB é semanal típica — não é o EXCETO.',
          },
          {
            label: 'Letra C — raiva humana',
            detail: 'Raiva humana.',
            correct: 'EXCETO: raiva humana é imediata — fora do semanal.',
          },
          {
            label: 'Letra D — óbito materno',
            detail: 'Óbito materno.',
            correct: 'Entra no fluxo semanal desta lista — não é o EXCETO.',
          },
          {
            label: 'Letra E — leishmaniose visceral',
            detail: 'Leishmaniose visceral.',
            correct: 'LV semanal nesta chave — não é o EXCETO.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “raiva animal = mesmo relógio da humana”.',
            correct: 'Leia o agravo exato — o relógio pode mudar.',
          },
        ],
        'Compulsória semanal ≠ imediata',
      ),
    ],
  },
  {
    file: 'fundatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563626015-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Notificação pelo TE contribui para monitoramento epidemiológico e controle — não é burocracia vazia nem autonomia sem critério.',
    sources: [{ ...GUIA, covers: ['notificação compulsória', 'técnico de enfermagem', 'monitoramento'] }],
    slides: [
      conceptMap(
        'Para que o TE notifica?',
        [
          { label: 'Função', detail: 'Contribui para monitoramento epidemiológico e controle de doenças.', icon: 'LineChart' },
          { label: 'Não é', detail: 'Tarefa burocrática sem relevância assistencial.', icon: 'XCircle' },
          { label: 'Critério', detail: 'Há critérios/lista — não é decisão solta sem regra.', icon: 'ClipboardList' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Sigilo absoluto que impede comunicar à autoridade de saúde.', icon: 'AlertTriangle' },
        ],
        'Notificar = monitorar e controlar',
      ),
      logicFlow(
        [
          'Comando: rotina do TE na notificação compulsória — correta.',
          'Eliminar “só burocracia” e “precisa ser estatístico”.',
          'Eliminar autonomia sem critérios e sigilo contra a autoridade.',
          'Manter: contribui para monitoramento e controle.',
          'Marcar D.',
          'Em similares: notificar alimenta a VE — não é papelada morta.',
        ],
        'Monitoramento e controle → D',
      ),
      goldenRule(
        'Papel do técnico',
        'Decore',
        [
          { label: 'Sim', value: 'Monitoramento epidemiológico + controle.', badge: 'ok' },
          { label: 'Não', value: 'Burocracia vazia · sem critério · sigilo vs autoridade.', badge: 'warn' },
        ],
        'Notificar fortalece a VE',
      ),
      dangerZone(
        'PEGADINHAS — rotina do TE',
        [
          {
            label: 'Letra A — burocracia',
            detail: 'Tarefa burocrática sem relevância prática.',
            correct: 'Notificação tem impacto direto no controle coletivo.',
          },
          {
            label: 'Letra B — estatística profunda',
            detail: 'Exige estatísticas médicas aprofundadas.',
            correct: 'Exige critério de caso/fluxo — não mestrado em bioestatística.',
          },
          {
            label: 'Letra C — autonomia sem critério',
            detail: 'Notificar sem critérios específicos.',
            correct: 'Há lista e definições de caso — não é achismo.',
          },
          {
            label: 'Letra E — sigilo vs autoridade',
            detail: 'Prioriza confidencialidade contra comunicar autoridades.',
            correct: 'Sigilo não anula a obrigação de notificar à autoridade sanitária.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só o médico pode notificar”.',
            correct: 'Profissionais de saúde e estabelecimentos também notificam.',
          },
        ],
        'Tratar notificação como papel morto → distrator',
      ),
    ],
  },
  {
    file: 'fundatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563626015-4.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Compulsórios: tentativa de suicídio, violência doméstica, esquistossomose, intoxicação exógena. EXCETO candidíase sistêmica.',
    sources: [{ ...LISTA, covers: ['SINAN', 'lista nacional', 'candidíase'] }],
    slides: [
      conceptMap(
        'Compulsória no SINAN — EXCETO',
        [
          { label: 'Sistema', detail: 'SINAN recebe notificação de agravos da lista nacional.', icon: 'Database' },
          { label: 'Entram', detail: 'Tentativa de suicídio, violência doméstica, esquistossomose, intoxicação exógena.', icon: 'CheckCircle2' },
          { label: 'Não entra', detail: 'Candidíase sistêmica — EXCETO desta chave.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Achar que “toda infecção grave” é compulsória.', icon: 'AlertTriangle' },
        ],
        'Candidíase sistêmica fora da lista',
      ),
      logicFlow(
        [
          'Comando: doenças/eventos de notificação compulsória, EXCETO.',
          'Validar suicídio, violência doméstica, esquistossomose e intoxicação exógena.',
          'Isolar candidíase sistêmica — não fecha a lista nacional desta prova.',
          'Marcar E.',
          'Em similares: gravidade clínica ≠ presença automática na lista.',
        ],
        'Candidíase sistêmica = EXCETO → E',
      ),
      goldenRule(
        'Filtro do EXCETO',
        'Decore',
        [
          { label: 'Compulsórios (ex.)', value: 'Suicídio · violência · esquistossomose · intoxicação.', badge: 'ok' },
          { label: 'EXCETO', value: 'Candidíase sistêmica.', badge: 'warn' },
        ],
        'Lista > “parece grave”',
      ),
      dangerZone(
        'PEGADINHAS — EXCETO da lista',
        [
          {
            label: 'Letra A — suicídio',
            detail: 'Tentativa de suicídio.',
            correct: 'É de notificação compulsória — não é o EXCETO.',
          },
          {
            label: 'Letra B — violência',
            detail: 'Violência doméstica.',
            correct: 'Entra na compulsória — não é o EXCETO.',
          },
          {
            label: 'Letra C — esquistossomose',
            detail: 'Esquistossomose.',
            correct: 'Agravos da lista — não é o EXCETO.',
          },
          {
            label: 'Letra D — intoxicação',
            detail: 'Intoxicação exógena.',
            correct: 'É compulsória — não é o EXCETO.',
          },
          {
            label: 'Letra E — candidíase',
            detail: 'Candidíase sistêmica.',
            correct: 'EXCETO: não é agravo de notificação compulsória nesta chave.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “candidíase vaginal no trio notificável”.',
            correct: 'Mesma lógica: intruso clínico comum fora da lista.',
          },
        ],
        'Infecção grave ≠ compulsória automática',
      ),
    ],
  },
  {
    file: 'fundatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563784564-8.json',
    family: 'conceito',
    pedagogical_branch: 'epi_cadeia_transmissao',
    guideline_snapshot:
      'Infectividade = capacidade do bioagente de penetrar, desenvolver/multiplicar e causar infecção. Não confunda com patogenicidade, virulência ou imunogenicidade.',
    sources: [{ ...PRINCIPIOS, covers: ['infectividade', 'patogenicidade', 'virulência', 'imunogenicidade'] }],
    slides: [
      conceptMap(
        'Infectividade na cadeia',
        [
          { label: 'Definição', detail: 'Capacidade do bioagente de penetrar no organismo e desenvolver/multiplicar-se (causar infecção).', icon: 'Microscope' },
          { label: 'Elo', detail: 'Atributo do agente na cadeia de transmissão das doenças transmissíveis.', icon: 'Link' },
          { label: 'Não misture', detail: 'Patogenicidade, virulência e imunogenicidade são outros atributos.', icon: 'GitCompare' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Definir virulência como “capacidade de produzir dor”.', icon: 'AlertTriangle' },
        ],
        'Infectividade = penetrar e multiplicar',
      ),
      logicFlow(
        [
          'Comando: alternativa correta sobre elos/atributos da cadeia.',
          'Eliminar patogenicidade como “só resposta imune”.',
          'Eliminar virulência = produzir dor.',
          'Eliminar trocas absurdas (imunogenicidade = organismo vivo causador).',
          'Manter: infectividade = causar infecção (penetrar e se multiplicar).',
          'Marcar A.',
          'Em similares: infectar ≠ adoecer gravemente (virulência/patogenicidade).',
        ],
        'Infectividade correta → letra A',
      ),
      goldenRule(
        'Atributos do agente',
        'Decore',
        [
          { label: 'Infectividade', value: 'Penetrar + desenvolver/multiplicar = infecção.', badge: 'ok' },
          { label: 'Armadilhas', value: 'Virulência≠dor · imunogenicidade≠o próprio agente.', badge: 'warn' },
        ],
        'Infectar primeiro — depois gravidade',
      ),
      dangerZone(
        'PEGADINHAS — atributos',
        [
          {
            label: 'Letra B — patogenicidade',
            detail: 'Patogenicidade = só respostas imunológicas.',
            correct: 'Patogenicidade é capacidade de gerar doença — definição trocada.',
          },
          {
            label: 'Letra C — virulência = dor',
            detail: 'Virulência = produzir dor.',
            correct: 'Virulência fala de gravidade do dano — não “produzir dor”.',
          },
          {
            label: 'Letra D — virulência e imunidade',
            detail: 'Processos importantes = virulência e imunidade.',
            correct: 'Incompleto/desviado: a correta define infectividade.',
          },
          {
            label: 'Letra E — imunogenicidade',
            detail: 'Imunogenicidade = organismos vivos que causam infecção.',
            correct: 'Isso descreve o agente infeccioso — não imunogenicidade.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “alta infectividade = sempre alta letalidade”.',
            correct: 'Infectividade e virulência/letalidade são eixos diferentes.',
          },
        ],
        'Trocar rótulo do atributo → distrator',
      ),
    ],
  },
  {
    file: 'fundatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563789263-8.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Compulsórios: botulismo, tularemia, monkeypox, Marburg. EXCETO colelitíase (cálculo biliar — não é agravo da lista).',
    sources: [{ ...LISTA, covers: ['botulismo', 'monkeypox', 'lista nacional'] }],
    slides: [
      conceptMap(
        'Compulsória — ache o EXCETO',
        [
          { label: 'Comando', detail: 'Doenças que requerem notificação compulsória, EXCETO.', icon: 'Search' },
          { label: 'Entram', detail: 'Botulismo, tularemia, monkeypox, Marburg.', icon: 'CheckCircle2' },
          { label: 'Fora', detail: 'Colelitíase — doença de cálculo biliar, não da lista.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar monkeypox por ser “nome novo”.', icon: 'AlertTriangle' },
        ],
        'Colelitíase = EXCETO',
      ),
      logicFlow(
        [
          'Exigir o que NÃO é de notificação compulsória.',
          'Validar botulismo, tularemia, monkeypox e Marburg como compulsórios.',
          'Isolar colelitíase — agravo clínico cirúrgico fora da lista.',
          'Marcar C.',
          'Em similares: nome “médico” não garante compulsória.',
        ],
        'Colelitíase fora da lista → C',
      ),
      goldenRule(
        'Filtro rápido',
        'Decore',
        [
          { label: 'Compulsórios', value: 'Botulismo · tularemia · monkeypox · Marburg.', badge: 'ok' },
          { label: 'EXCETO', value: 'Colelitíase.', badge: 'warn' },
        ],
        'Cálculo biliar ≠ lista nacional',
      ),
      dangerZone(
        'PEGADINHAS — EXCETO compulsória',
        [
          {
            label: 'Letra A — botulismo',
            detail: 'Botulismo.',
            correct: 'É compulsório — não é o EXCETO.',
          },
          {
            label: 'Letra B — tularemia',
            detail: 'Tularemia.',
            correct: 'Entra na compulsória — não é o EXCETO.',
          },
          {
            label: 'Letra C — colelitíase',
            detail: 'Colelitíase.',
            correct: 'EXCETO: não requer notificação compulsória nesta chave.',
          },
          {
            label: 'Letra D — monkeypox',
            detail: 'Monkeypox.',
            correct: 'É de notificação — não é o EXCETO.',
          },
          {
            label: 'Letra E — Marburg',
            detail: 'Marburg.',
            correct: 'Evento de alto risco notificável — não é o EXCETO.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “colecistite = compulsória porque é infecção”.',
            correct: 'Infecção local comum ≠ lista nacional de notificação.',
          },
        ],
        'Doença cirúrgica comum ≠ compulsória',
      ),
    ],
  },
  {
    file: 'fundatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563838275-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Vigilância em Saúde = processo contínuo de coleta/análise/disseminação para proteger, prevenir, controlar e promover. Engloba epi/sanitária/ambiental/trabalhador.',
    sources: [{ ...GUIA, covers: ['vigilância em saúde', 'vigilância epidemiológica'] }],
    slides: [
      conceptMap(
        'Qual vigilância preenche a lacuna?',
        [
          { label: 'Texto', detail: 'Coleta, consolidação, análise e disseminação contínuas para proteção/prevenção/controle/promoção.', icon: 'Radar' },
          { label: 'Nome amplo', detail: 'Vigilância em Saúde — guarda-chuva do processo descrito.', icon: 'Umbrella' },
          { label: 'Recortes', detail: 'Epidemiológica, sanitária, ambiental e do trabalhador são componentes.', icon: 'Layers' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar só “Vigilância Epidemiológica” por hábito.', icon: 'AlertTriangle' },
        ],
        'Guarda-chuva = Vigilância em Saúde',
      ),
      logicFlow(
        [
          'Ler o trecho: processo contínuo + proteção + prevenção + controle + promoção.',
          'Eliminar recortes isolados (epidemiológica, sanitária, ambiental, trabalhador).',
          'Preencher com Vigilância em Saúde.',
          'Marcar D.',
          'Em similares: se o texto cobre vários eixos, prefira o termo guarda-chuva.',
        ],
        'Vigilância em Saúde → letra D',
      ),
      goldenRule(
        'Guarda-chuva × componentes',
        'Decore',
        [
          { label: 'Vigilância em Saúde', value: 'Processo amplo (coleta→ação→promoção).', badge: 'ok' },
          { label: 'Componentes', value: 'Epidemiológica · sanitária · ambiental · trabalhador.', badge: 'warn' },
        ],
        'Amplo = Vigilância em Saúde',
      ),
      dangerZone(
        'PEGADINHAS — nome da vigilância',
        [
          {
            label: 'Letra A — epidemiológica',
            detail: 'Vigilância Epidemiológica.',
            correct: 'É um componente — o trecho descreve o guarda-chuva.',
          },
          {
            label: 'Letra B — sanitária',
            detail: 'Vigilância Sanitária.',
            correct: 'Recorte de produtos/serviços — não cobre todo o texto.',
          },
          {
            label: 'Letra C — ambiental',
            detail: 'Vigilância Ambiental.',
            correct: 'Foco ambiental — estreito demais para a lacuna.',
          },
          {
            label: 'Letra E — trabalhador',
            detail: 'Vigilância em Saúde do Trabalhador.',
            correct: 'Recorte ocupacional — não o processo amplo descrito.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “VE = única forma de vigilância no SUS”.',
            correct: 'VE é central, mas Vigilância em Saúde articula vários eixos.',
          },
        ],
        'Marcar só o recorte epi → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g11',
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
