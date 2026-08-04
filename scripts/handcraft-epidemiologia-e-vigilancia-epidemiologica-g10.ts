/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g10 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g10.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g10';
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
  year: 2014,
  url: 'https://www.gov.br/saude/pt-br/composicao/svsa/notificacao-compulsoria',
};
const HANSE = {
  id: 'guia-hanseniase-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Diretrizes de hanseníase — controle, contatos e notificação',
  year: 2022,
  url: 'https://www.gov.br/saude/pt-br',
};
const TB = {
  id: 'protocolo-tuberculose-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Manual de recomendações para o controle da tuberculose no Brasil',
  year: 2019,
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
    file: 'funcepe-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'VE: imunizações, resposta a compulsórios, cooperação IST/HIV/hepatites. NÃO compete fiscalizar repasse financeiro/salários do SUS.',
    sources: [{ ...GUIA, covers: ['vigilância epidemiológica', 'competências', 'imunização'] }],
    slides: [
      conceptMap(
        'VE — o que NÃO compete',
        [
          { label: 'Compete', detail: 'Detecção/prevenção de agravos transmissíveis, normas, imunização, IST/HIV/hepatites.', icon: 'Shield' },
          { label: 'Resposta', detail: 'Coordenar resposta a compulsórios e riscos, com informação para o SUS.', icon: 'Activity' },
          { label: 'Fora', detail: 'Fiscalizar repasse financeiro, salários e previdência dos trabalhadores.', icon: 'Banknote' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Aceitar gestão financeira como “apoio à VE”.', icon: 'AlertTriangle' },
        ],
        'VE ≠ auditoria financeira do SUS',
      ),
      logicFlow(
        [
          'Comando: o que NÃO compete à vigilância epidemiológica.',
          'Validar imunizações, resposta a compulsórios, cooperação técnica e ações em IST/HIV/hepatites.',
          'Isolar fiscalização de repasse financeiro / salários / previdência.',
          'Marcar E.',
          'Em similares: VE age em informação e controle — não em folha de pagamento.',
        ],
        'Fiscalizar repasse/salários → E',
      ),
      goldenRule(
        'Limite da VE',
        'Decore',
        [
          { label: 'Sim', value: 'Imunização · compulsórios · IST/HIV/hepatites · informação.', badge: 'ok' },
          { label: 'Não', value: 'Fiscalizar dinheiro/salários/previdência do SUS.', badge: 'warn' },
        ],
        'Sanitário ≠ financeiro',
      ),
      dangerZone(
        'PEGADINHAS — competência da VE',
        [
          {
            label: 'Letra A — imunizações',
            detail: 'Gerir/apoiar o Programa de Imunizações.',
            correct: 'Imunização é eixo clássico da VE — compete sim.',
          },
          {
            label: 'Letra B — resposta compulsória',
            detail: 'Coordenar resposta a doenças de notificação compulsória.',
            correct: 'Resposta a compulsórios é núcleo da VE — não é o NÃO.',
          },
          {
            label: 'Letra C — cooperação IST/HIV',
            detail: 'Cooperação técnica em IST, HIV/Aids, hepatites e imunização.',
            correct: 'Cooperação nesses eixos cabe à VE — não é o NÃO.',
          },
          {
            label: 'Letra D — ações IST/HIV',
            detail: 'Instituir/avaliar ações de VE e assistenciais em IST/HIV/hepatites.',
            correct: 'Esse pacote está no escopo — não é o NÃO.',
          },
          {
            label: 'Letra E — dinheiro/salários',
            detail: 'Fiscalizar repasse financeiro, salários e previdência.',
            correct: 'NÃO compete: isso é gestão/controle financeiro — fora da VE.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “VE paga o ACS”.',
            correct: 'Remuneração é gestão — VE produz informação e ação sanitária.',
          },
        ],
        'Colar finanças na VE → distrator',
      ),
    ],
  },
  {
    file: 'funcepe-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Trio transmissível compulsório: dengue, febre amarela e malária extra-amazônica. Intrusos: diabetes, doença coronariana, Turner, Down.',
    sources: [{ ...LISTA, covers: ['dengue', 'febre amarela', 'malária', 'lista nacional'] }],
    slides: [
      conceptMap(
        'Apenas transmissíveis compulsórias',
        [
          { label: 'Comando', detail: 'Alternativa só com doenças transmissíveis de notificação compulsória.', icon: 'ClipboardCheck' },
          { label: 'Trio limpo', detail: 'Dengue, febre amarela e malária na região extra-amazônica.', icon: 'CheckCircle2' },
          { label: 'Intrusos', detail: 'Diabetes, coronariana, Turner, Down — não fecham o conjunto.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Aceitar trio com cólera/botulismo + doença genética.', icon: 'AlertTriangle' },
        ],
        'Dengue + FA + malária extra-amazônica',
      ),
      logicFlow(
        [
          'Exigir: todas transmissíveis E de notificação compulsória.',
          'Eliminar diabetes, doença coronariana, Turner e Down.',
          'Validar dengue + febre amarela + malária extra-amazônica.',
          'Marcar A.',
          'Em similares: um não transmissível/genético derruba o trio.',
        ],
        'Trio limpo → letra A',
      ),
      goldenRule(
        'Filtro do trio',
        'Decore',
        [
          { label: 'OK', value: 'Dengue · febre amarela · malária extra-amazônica.', badge: 'ok' },
          { label: 'Quebra', value: 'Diabetes · coronariana · Turner · Down.', badge: 'warn' },
        ],
        'Zero doença crônica/genética no pacote',
      ),
      dangerZone(
        'PEGADINHAS — só compulsórias transmissíveis',
        [
          {
            label: 'Letra B — diabetes',
            detail: 'Diabetes melito, cólera e esquistossomose.',
            correct: 'Diabetes não é transmissível compulsória — derruba o conjunto.',
          },
          {
            label: 'Letra C — coronariana',
            detail: 'Doença coronariana aguda, malária amazônica e cólera.',
            correct: 'Doença coronariana não fecha o critério transmissível compulsório.',
          },
          {
            label: 'Letra D — Turner',
            detail: 'Botulismo, coqueluche e síndrome de Turner.',
            correct: 'Turner é genética — não é doença transmissível notificável.',
          },
          {
            label: 'Letra E — Down',
            detail: 'Creutzfeldt-Jakob, síndrome de Down e leptospirose.',
            correct: 'Down derruba o trio — não é transmissível compulsória.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: HAS no meio de dengue e FA.',
            correct: 'Mesma lógica: procure o intruso não transmissível.',
          },
        ],
        'Intruso crônico/genético → distrator',
      ),
    ],
  },
  {
    file: 'funcern-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563774121-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Notificação negativa: serviço informa que, na semana epidemiológica, não houve agravo da lista. Compulsória é obrigatória (não optativa).',
    exam_vs_current: 'Portaria 1.271/2014 citada na prova; chave = notificação negativa (C).',
    sources: [{ ...LISTA, covers: ['notificação negativa', 'semana epidemiológica', 'Portaria 1271'] }],
    slides: [
      conceptMap(
        'Tipos de notificação — o correto',
        [
          { label: 'Negativa', detail: 'Serviço informa: na semana epidemiológica não houve agravo da lista.', icon: 'FileMinus' },
          { label: 'Compulsória', detail: 'Comunicação obrigatória — não optativa.', icon: 'ClipboardCheck' },
          { label: 'Relógios', detail: 'Imediata e semanal existem; não invente prazos fora da norma.', icon: 'Timer' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Ler compulsória como “optativa”.', icon: 'AlertTriangle' },
        ],
        'Negativa = “zero na semana”',
      ),
      logicFlow(
        [
          'Comando: definição correta dos tipos de notificação (Portaria 1.271/2014).',
          'Eliminar “semanal com prazo inventado” e “compulsória optativa”.',
          'Eliminar “imediata com prazo inventado (meio dia)”.',
          'Manter: notificação negativa = nenhum agravo da lista na semana epidemiológica.',
          'Marcar C.',
          'Em similares: negativa reporta ausência — não a ocorrência do caso.',
        ],
        'Notificação negativa → letra C',
      ),
      goldenRule(
        'Negativa em uma linha',
        'Decore',
        [
          { label: 'Negativa', value: 'Na semana epidemiológica: nenhum agravo da lista.', badge: 'ok' },
          { label: 'Compulsória', value: 'Obrigatória — nunca “optativa”.', badge: 'warn' },
        ],
        'Zero casos na semana = negativa',
      ),
      dangerZone(
        'PEGADINHAS — tipos de notificação',
        [
          {
            label: 'Letra A — semanal distorcida',
            detail: 'Semanal em prazo inventado após o conhecimento do caso.',
            correct: 'A definição correta cobrada aqui é a notificação negativa — não esse prazo.',
          },
          {
            label: 'Letra B — optativa',
            detail: 'Comunicação optativa à autoridade de saúde.',
            correct: 'Compulsória é obrigatória — optativa é o antônimo.',
          },
          {
            label: 'Letra D — imediata distorcida',
            detail: 'Imediata com prazo inventado (meio dia).',
            correct: 'Imediata clássica é em até 24h — e a chave desta questão é a negativa.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “negativa = caso descartado no lab”.',
            correct: 'Negativa = ausência de notificação na semana — não o desfecho do caso.',
          },
        ],
        'Optativa ou prazo inventado → distrator',
      ),
    ],
  },
  {
    file: 'funcern-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563778577-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'ACE no controle da hanseníase: encaminhar contatos intradomiciliares para avaliação na unidade. Não diagnostica sozinho nem preenche ficha de notificação como núcleo.',
    sources: [{ ...HANSE, covers: ['hanseníase', 'contatos', 'ACE', 'encaminhamento'] }],
    slides: [
      conceptMap(
        'ACE na hanseníase — o que fazer',
        [
          { label: 'Doença', detail: 'Hanseníase: pele e nervos; alto poder incapacitante.', icon: 'Hand' },
          { label: 'Ação do ACE', detail: 'Encaminhar contatos intradomiciliares para avaliação na unidade de saúde.', icon: 'UserPlus' },
          { label: 'Fora do escopo', detail: 'Diagnosticar sozinho ou fechar a ficha de notificação como atribuição central.', icon: 'Ban' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'ACE fazer avaliação dermatoneurológica diagnóstica.', icon: 'AlertTriangle' },
        ],
        'Contato → encaminhar à unidade',
      ),
      logicFlow(
        [
          'Comando: atribuição do ACE no controle da hanseníase.',
          'Eliminar diagnosticar/avaliar dermatoneurológico sozinho.',
          'Eliminar preencher ficha de notificação e atualizar Ficha A como resposta correta.',
          'Manter: encaminhar contatos intradomiciliares para avaliação na unidade.',
          'Marcar B.',
          'Em similares: ACE articula e encaminha — a unidade avalia/diagnostica.',
        ],
        'Encaminhar contatos → letra B',
      ),
      goldenRule(
        'Papel do ACE',
        'Decore',
        [
          { label: 'Fazer', value: 'Encaminhar contatos intradomiciliares à unidade.', badge: 'ok' },
          { label: 'Não', value: 'Diagnosticar sozinho · fechar notificação como núcleo.', badge: 'warn' },
        ],
        'Contato em casa → unidade avalia',
      ),
      dangerZone(
        'PEGADINHAS — ACE hanseníase',
        [
          {
            label: 'Letra A — diagnosticar',
            detail: 'Avaliação dermatoneurológica e diagnóstico precoce pelo ACE.',
            correct: 'Diagnóstico/avaliação clínica não é o núcleo do ACE nesta chave.',
          },
          {
            label: 'Letra C — ficha de notificação',
            detail: 'Preencher a ficha individual de notificação dos confirmados.',
            correct: 'Notificação formal não é a atribuição cobrada do ACE aqui.',
          },
          {
            label: 'Letra D — Ficha A',
            detail: 'Registrar na Ficha A a cada visita os dados de hanseníase.',
            correct: 'Cadastro ajuda, mas a resposta correta é encaminhar contatos.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “ACE inicia PQT sozinho”.',
            correct: 'Tratamento e diagnóstico ficam no serviço — ACE encaminha.',
          },
        ],
        'ACE diagnosticar sozinho → distrator',
      ),
    ],
  },
  {
    file: 'funcern-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563778577-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Tuberculose: notificação compulsória semanal (não imediata, quinzenal ou mensal).',
    sources: [{ ...TB, covers: ['tuberculose', 'notificação semanal'] }],
    slides: [
      conceptMap(
        'TB — qual o relógio?',
        [
          { label: 'Agravo', detail: 'Tuberculose — problema de saúde pública; notificação compulsória.', icon: 'Activity' },
          { label: 'Periodicidade', detail: 'Semanal.', icon: 'Calendar' },
          { label: 'Não é', detail: 'Imediata, quinzenal ou mensal nesta chave.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar imediata porque TB “é grave”.', icon: 'AlertTriangle' },
        ],
        'Tuberculose = semanal',
      ),
      logicFlow(
        [
          'Isolar o agravo: tuberculose no Brasil.',
          'Eliminar imediata, quinzenal e mensal.',
          'Manter: notificação compulsória semanal.',
          'Marcar B.',
          'Em similares: TB/hanseníase = semanal; raiva/FA = imediata.',
        ],
        'TB semanal → letra B',
      ),
      goldenRule(
        'Relógio da TB',
        'Decore',
        [
          { label: 'Tuberculose', value: 'Notificação compulsória semanal.', badge: 'ok' },
          { label: 'Armadilha', value: 'Imediata por gravidade clínica.', badge: 'warn' },
        ],
        'Grave ≠ imediata automática',
      ),
      dangerZone(
        'PEGADINHAS — prazo TB',
        [
          {
            label: 'Letra A — imediata',
            detail: 'Notificação imediata.',
            correct: 'TB é semanal — não imediata nesta chave.',
          },
          {
            label: 'Letra C — quinzenal',
            detail: 'Notificação quinzenal.',
            correct: 'Quinzenal não é o relógio da TB na lista.',
          },
          {
            label: 'Letra D — mensal',
            detail: 'Notificação mensal.',
            correct: 'Mensal é incompatível com o fluxo semanal da TB.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: meningite × TB.',
            correct: 'Relógio muda com o agravo — leia a lista, não a gravidade só.',
          },
        ],
        'Marcar imediata por hábito → distrator',
      ),
    ],
  },
  {
    file: 'funcern-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563778577-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Busca ativa e notificação de compulsórios/surtos/violências nas equipes de AB = vigilância epidemiológica (não sanitária/ambiental/estratégica).',
    sources: [{ ...GUIA, covers: ['vigilância epidemiológica', 'busca ativa', 'atenção básica'] }],
    slides: [
      conceptMap(
        'Busca ativa e notificação = qual vigilância?',
        [
          { label: 'Ação', detail: 'Busca ativa e notificar compulsórios, surtos, acidentes e violências.', icon: 'Search' },
          { label: 'Quem', detail: 'Atribuição comum das equipes de atenção básica (inclui TE).', icon: 'Users' },
          { label: 'Nome', detail: 'Vigilância epidemiológica.', icon: 'Radar' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar sanitária porque “fiscaliza”.', icon: 'AlertTriangle' },
        ],
        'Notificar/buscar = VE',
      ),
      logicFlow(
        [
          'Ler a atribuição: busca ativa + notificação de compulsórios/surtos/violências.',
          'Eliminar vigilância sanitária, ambiental e “estratégica”.',
          'Manter vigilância epidemiológica.',
          'Marcar D.',
          'Em similares: notificar agravos = VE; produtos/serviços = sanitária.',
        ],
        'Vigilância epidemiológica → D',
      ),
      goldenRule(
        'Nome certo',
        'Decore',
        [
          { label: 'VE', value: 'Busca ativa + notificação de agravos/surtos.', badge: 'ok' },
          { label: 'Outras', value: 'Sanitária/ambiental = outros eixos.', badge: 'warn' },
        ],
        'Notificar = epidemiológica',
      ),
      dangerZone(
        'PEGADINHAS — tipo de vigilância',
        [
          {
            label: 'Letra A — sanitária',
            detail: 'Vigilância sanitária.',
            correct: 'Sanitária foca produtos/serviços — não a busca ativa de agravos.',
          },
          {
            label: 'Letra B — ambiental',
            detail: 'Vigilância ambiental.',
            correct: 'Ambiental é risco ambiental — não o núcleo desta atribuição.',
          },
          {
            label: 'Letra C — estratégica',
            detail: 'Vigilância estratégica.',
            correct: 'Rótulo fora do trio clássico — a banca quer epidemiológica.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “ACS só faz sanitária”.',
            correct: 'Na AB o eixo de notificação/busca ativa é a VE.',
          },
        ],
        'Trocar VE por sanitária → distrator',
      ),
    ],
  },
  {
    file: 'funcern-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563778577-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Hanseníase (M. leprae): na lista nacional com notificação compulsória semanal — não mensal, quinzenal ou imediata.',
    sources: [{ ...HANSE, covers: ['hanseníase', 'notificação semanal', 'Mycobacterium leprae'] }],
    slides: [
      conceptMap(
        'Hanseníase — periodicidade',
        [
          { label: 'Agente', detail: 'Mycobacterium leprae — doença crônica, contagiosa.', icon: 'Microscope' },
          { label: 'Lista', detail: 'Notificação compulsória na lista nacional.', icon: 'ClipboardList' },
          { label: 'Relógio', detail: 'Periodicidade semanal.', icon: 'Calendar' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar imediata por “alto poder incapacitante”.', icon: 'AlertTriangle' },
        ],
        'Hanseníase = semanal',
      ),
      logicFlow(
        [
          'Isolar: hanseníase na lista nacional.',
          'Eliminar mensal, quinzenal e imediata.',
          'Manter: notificação semanal.',
          'Marcar C.',
          'Em similares: hanseníase e TB = semanal.',
        ],
        'Hanseníase semanal → letra C',
      ),
      goldenRule(
        'Relógio da hanseníase',
        'Decore',
        [
          { label: 'Hanseníase', value: 'Notificação compulsória semanal.', badge: 'ok' },
          { label: 'Não', value: 'Mensal · quinzenal · imediata.', badge: 'warn' },
        ],
        'Semanal — não imediata',
      ),
      dangerZone(
        'PEGADINHAS — prazo hanseníase',
        [
          {
            label: 'Letra A — mensal',
            detail: 'Notificação mensal.',
            correct: 'Mensal não é o relógio da hanseníase na lista.',
          },
          {
            label: 'Letra B — quinzenal',
            detail: 'Notificação quinzenal.',
            correct: 'Quinzenal não corresponde à periodicidade semanal.',
          },
          {
            label: 'Letra D — imediata',
            detail: 'Notificação imediata.',
            correct: 'Hanseníase é semanal — não imediata nesta chave.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: confundir com raiva humana.',
            correct: 'Raiva = imediata; hanseníase = semanal.',
          },
        ],
        'Marcar imediata por gravidade → distrator',
      ),
    ],
  },
  {
    file: 'funcern-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563778577-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Semanais juntas: tuberculose e esquistossomose. Raiva humana e febre amarela são imediatas — quebram o “semanal”.',
    sources: [{ ...LISTA, covers: ['tuberculose', 'esquistossomose', 'notificação semanal'] }],
    slides: [
      conceptMap(
        'Par só com semanais',
        [
          { label: 'Comando', detail: 'Doenças de notificação compulsória semanal.', icon: 'Calendar' },
          { label: 'Par limpo', detail: 'Tuberculose e esquistossomose.', icon: 'CheckCircle2' },
          { label: 'Quebra', detail: 'Raiva humana e febre amarela (imediatas) no meio do par.', icon: 'Zap' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Aceitar hanseníase + raiva porque “ambas são graves”.', icon: 'AlertTriangle' },
        ],
        'TB + esquistossomose = semanal',
      ),
      logicFlow(
        [
          'Exigir que AMBAS sejam de notificação semanal.',
          'Eliminar pares com raiva humana ou febre amarela (imediatas).',
          'Eliminar misturas que não fecham o par semanal limpo.',
          'Manter tuberculose e esquistossomose.',
          'Marcar D.',
          'Em similares: um imediato no par mata a opção “semanal”.',
        ],
        'TB + esquistossomose → D',
      ),
      goldenRule(
        'Filtro do par semanal',
        'Decore',
        [
          { label: 'Semanal (ex.)', value: 'Tuberculose · esquistossomose.', badge: 'ok' },
          { label: 'Imediata (quebra)', value: 'Raiva humana · febre amarela.', badge: 'warn' },
        ],
        'Imediata no par → opção morta',
      ),
      dangerZone(
        'PEGADINHAS — só semanal',
        [
          {
            label: 'Letra A — TB + leptospirose',
            detail: 'Tuberculose e leptospirose.',
            correct: 'Nesta chave o par semanal limpo é TB + esquistossomose.',
          },
          {
            label: 'Letra B — hanseníase + raiva',
            detail: 'Hanseníase e raiva humana.',
            correct: 'Raiva humana é imediata — quebra o “semanal”.',
          },
          {
            label: 'Letra C — leptospirose + FA',
            detail: 'Leptospirose e febre amarela.',
            correct: 'Febre amarela é imediata — não fecha o par semanal.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: dengue casos × FA.',
            correct: 'Mesma lógica: semanal × imediata no mesmo item.',
          },
        ],
        'Misturar imediata no par semanal → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g10',
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
