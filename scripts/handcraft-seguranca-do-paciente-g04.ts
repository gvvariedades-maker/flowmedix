#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — seguranca-do-paciente-g04 (32 slugs — cauda longa + drift residual).
 * Uso: npx tsx scripts/handcraft-seguranca-do-paciente-g04.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const SUBTOPICO = 'Segurança do Paciente';
const REVIEWED = '2026-06-30';
const MS_SOURCE = {
  id: 'ms-pnsp-geral',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / OMS',
  title: 'PNSP e metas internacionais de segurança do paciente',
  year: 2013,
  covers: ['segurança do paciente', 'qualidade', 'cultura de segurança'],
};

type Branch =
  | 'sp_generico'
  | 'sp_metas_internacionais'
  | 'sp_identificacao'
  | 'sp_prevencao_quedas'
  | 'sp_eventos_adversos';

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Danger = { label: string; detail: string; correct: string };
type Item = { label: string; detail: string; icon: string };
type Row = { label: string; value: string; badge?: string; emphasis?: string };

type Pack = {
  family: 'conceito' | 'vf' | 'protocolo' | 'certo_errado';
  branch: Branch;
  guideline: string;
  slides: unknown[];
};

const M = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, family: string, branch: Branch, guideline: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    content_standard: 'golden-v1',
    family,
    pedagogical_branch: branch,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: guideline,
      exam_vs_current: 'none',
    },
    sources: [MS_SOURCE],
  };
}

function slides(
  title: string,
  items: Item[],
  golden: { content?: string; rows?: Row[]; footer: string },
  steps: string[],
  dangers: Danger[],
  dangerTitle = 'PEGADINHAS',
  conceptFooter?: string,
  logicFooter?: string,
): unknown[] {
  return [
    {
      type: 'concept_map',
      slide_title: title,
      meta: M,
      items,
      footer_rule: conceptFooter ?? golden.footer,
    },
    {
      type: 'golden_rule',
      slide_title: title,
      meta: M,
      content: golden.content,
      rows: golden.rows,
      footer_rule: golden.footer,
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: M,
      steps,
      footer_rule: logicFooter ?? golden.footer,
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: M,
      content: dangerTitle,
      items: dangers,
      footer_rule: logicFooter ?? golden.footer,
    },
  ];
}

const SPECS: Record<string, Pack> = {
  'adm-tec-enfermagem-seguranca-do-paciente-1777102678563-7': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Assistência domiciliar — avaliação ambiental e segurança do paciente',
    slides: slides(
      'Internação domiciliar',
      [
        { label: 'Avaliação prévia', detail: 'Residência deve ser vistoriada antes do atendimento domiciliar.', icon: 'Home' },
        { label: 'Acessibilidade', detail: 'Lacuna (1): espaço adequado para mobilidade do paciente.', icon: 'Accessibility' },
        { label: 'Obstáculos', detail: 'Lacuna (2): ambiente livre de barreiras que comprometam mobilidade.', icon: 'AlertTriangle' },
        { label: 'Gabarito', detail: 'Letra A — acessibilidade + obstáculos.', icon: 'CheckCircle' },
      ],
      {
        content: 'DOMICÍLIO SEGURO',
        rows: [
          { label: '(1)', value: 'Acessibilidade adequada', badge: 'hot' },
          { label: '(2)', value: 'Sem obstáculos à mobilidade', badge: 'hot' },
          { label: 'Objetivo', value: 'Segurança e eficácia do cuidado', badge: 'ok' },
        ],
        footer: 'Atendimento domiciliar exige adaptação do ambiente físico',
      },
      [
        'Comando: preencher lacunas sobre internação domiciliar.',
        'Foco: segurança, eficácia e mobilidade do paciente em casa.',
        '(1) acessibilidade — não ventilação nem umidade isoladas.',
        '(2) obstáculos — barreiras físicas, não só alérgenos.',
        'Marcar letra A.',
      ],
      [
        { label: 'Letra B — ventilação/contaminantes', detail: 'Ventilação importa, mas lacunas pedem acesso e barreiras físicas.', correct: 'Acessibilidade e obstáculos respondem ao enunciado literal.' },
        { label: 'Letra C — iluminação/barreiras', detail: 'Iluminação ajuda, mas não substitui acessibilidade estrutural.', correct: 'Obstáculos é o termo usado na resposta oficial.' },
        { label: 'Letra D — umidade/alérgenos', detail: 'Alérgenos não são o foco da mobilidade domiciliar.', correct: 'Gabarito A cobre mobilidade e segurança do ambiente.' },
      ],
    ),
  },

  'amauc-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563685104-6': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Gestão de materiais — controle de estoque hospitalar',
    slides: slides(
      'Gestão de materiais',
      [
        { label: 'Recursos materiais', detail: 'Gestão eficiente impacta qualidade do atendimento hospitalar.', icon: 'Package' },
        { label: 'Inventário', detail: 'Contagem periódica evita ruptura e desperdício.', icon: 'ClipboardList' },
        { label: 'Controle de estoque', detail: 'Prática adequada de gestão de materiais.', icon: 'BarChart3' },
        { label: 'Gabarito', detail: 'Letra C — inventários periódicos.', icon: 'CheckCircle' },
      ],
      { content: 'INVENTÁRIO PERIÓDICO', footer: 'Sem controle de estoque não há segurança na assistência' },
      [
        'Tema: gestão de recursos materiais no hospital.',
        'Buscar prática de controle — inventários periódicos.',
        'Eliminar opções sem rastreabilidade de estoque.',
        'Marcar letra C.',
      ],
      [
        { label: 'Letra A — estoque elevado sempre', detail: 'Ignora demanda e gera desperdício.', correct: 'Inventário periódico equilibra disponibilidade e controle.' },
        { label: 'Letra B — estoque baixo sempre', detail: 'Risco de ruptura independente da demanda.', correct: 'Controle periódico orienta reposição conforme uso.' },
        { label: 'Letra D — ignorar validade', detail: 'Compromete segurança do paciente.', correct: 'Gestão de materiais inclui rastreio de validade.' },
        { label: 'Letra E — centralizar sem distribuir', detail: 'Atraso no abastecimento setorial.', correct: 'Gabarito C — inventários periódicos.' },
      ],
    ),
  },

  'avancasp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563701860-7': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Direitos do paciente — consentimento informado',
    slides: slides(
      'Consentimento informado',
      [
        { label: 'Direito do paciente', detail: 'Aceitar ou rejeitar tratamento oferecido.', icon: 'Scale' },
        { label: 'Documento', detail: 'Registro antes de procedimentos clínicos ou cirúrgicos.', icon: 'FileText' },
        { label: 'Autonomia', detail: 'Decisão livre após informação adequada.', icon: 'UserCheck' },
        { label: 'Gabarito', detail: 'Letra A — consentimento informado.', icon: 'CheckCircle' },
      ],
      { content: 'CONSENTIMENTO INFORMADO', footer: 'Segurança inclui respeito à autonomia do paciente' },
      [
        'Documento sobre aceitar ou rejeitar tratamento.',
        'Apresentado antes de procedimentos.',
        'Nome técnico: consentimento informado.',
        'Marcar letra A.',
      ],
      [
        { label: 'Letra B — certidão de internação', detail: 'Documento administrativo de admissão.', correct: 'Consentimento informado trata aceite ou recusa terapêutica.' },
        { label: 'Letra C — despacho de tratamento', detail: 'Termo inexistente na prática clínica.', correct: 'CI é documento padronizado de autonomia.' },
        { label: 'Letra D — ata de internamento', detail: 'Registro administrativo — não autorização.', correct: 'Gabarito A — consentimento informado.' },
        { label: 'Letra E — guia de encaminhamento', detail: 'Fluxo entre serviços — outro contexto.', correct: 'Documento pedido formaliza decisão do paciente.' },
      ],
    ),
  },

  'avancasp-enfermagem-processo-de-enfermagem-1780002834059-6': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Transporte intra-hospitalar — estabilidade clínica',
    slides: slides(
      'Transporte intra-hospitalar',
      [
        { label: 'Contexto', detail: 'Deslocamento do paciente entre setores do hospital.', icon: 'Ambulance' },
        { label: 'Estabilidade clínica', detail: 'Avaliar condição antes e durante o transporte.', icon: 'Activity' },
        { label: 'Segurança', detail: 'Monitorização e suporte conforme risco.', icon: 'Shield' },
        { label: 'Gabarito', detail: 'Letra B — estabilidade e segurança.', icon: 'CheckCircle' },
      ],
      { content: 'ESTABILIDADE + SEGURANÇA', footer: 'Transporte só após avaliar risco clínico' },
      [
        'Durante transporte intra-hospitalar, priorizar condição clínica.',
        'Estabilidade evita intercorrências no trajeto.',
        'Segurança inclui monitorização adequada.',
        'Marcar letra B.',
      ],
      [
        { label: 'Letra A — suspender monitorização', detail: 'Transporte exige vigilância contínua.', correct: 'Estabilidade clínica precede e acompanha deslocamento.' },
        { label: 'Letra C — evitar comunicação', detail: 'Handoff entre setores é obrigatório.', correct: 'Segurança inclui informar equipe receptora.' },
        { label: 'Letra D — sem equipamentos', detail: 'Oxigênio e suportes devem acompanhar o paciente.', correct: 'Gabarito B — estabilidade e segurança.' },
        { label: 'Letra E — sem identificação', detail: 'Viola Meta 1 de segurança.', correct: 'Pulseira e prontuário seguem no transporte.' },
      ],
    ),
  },

  'avancasp-enfermagem-processo-de-enfermagem-1780003137298-4': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Transporte intra-hospitalar — segurança do paciente',
    slides: slides(
      'Cuidado no transporte',
      [
        { label: 'Principal cuidado', detail: 'Segurança do paciente durante deslocamento.', icon: 'Shield' },
        { label: 'Identificação', detail: 'Pulseira e prontuário acompanham o paciente.', icon: 'IdCard' },
        { label: 'Oxigênio/dispositivos', detail: 'Manter suportes prescritos no trajeto.', icon: 'Wind' },
        { label: 'Gabarito', detail: 'Letra A — garantir segurança.', icon: 'CheckCircle' },
      ],
      { content: 'SEGURANÇA DO PACIENTE', footer: 'Transporte é momento de alto risco assistencial' },
      [
        'Comando: principal cuidado no transporte intra-hospitalar.',
        'Segurança do paciente é eixo da segurança assistencial.',
        'Eliminar opções que priorizam apenas logística.',
        'Marcar letra A.',
      ],
      [
        { label: 'Letra B — economia de tempo', detail: 'Agilidade não substitui cuidado seguro.', correct: 'Segurança do paciente é prioridade no deslocamento.' },
        { label: 'Letra C — sigilo absoluto', detail: 'Confidencialidade não é o foco do transporte.', correct: 'Risco físico e clínico domina o cuidado.' },
        { label: 'Letra D — rotina administrativa', detail: 'Burocracia não define assistência segura.', correct: 'Letra A responde ao comando literal.' },
      ],
    ),
  },

  'avancasp-enfermagem-processo-de-enfermagem-1780011872350-1': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Transporte — estabilização na unidade de origem',
    slides: slides(
      'Antes do transporte',
      [
        { label: 'Decisão de transportar', detail: 'Só após indicar necessidade clínica.', icon: 'GitBranch' },
        { label: 'Unidade de origem', detail: 'Estabilizar paciente antes de sair.', icon: 'Hospital' },
        { label: 'Intercorrências', detail: 'Minimizar risco no trajeto.', icon: 'AlertCircle' },
        { label: 'Gabarito', detail: 'Letra B — estabilizar na origem.', icon: 'CheckCircle' },
      ],
      { content: 'ESTABILIZAR NA ORIGEM', footer: 'Transporte prematuro agrava descompensação' },
      [
        'Após decidir transportar entre unidades.',
        'Recomenda-se estabilizar na unidade de origem.',
        'Objetivo: minimizar intercorrências clínicas.',
        'Marcar letra B.',
      ],
      [
        { label: 'Letra A — sair imediatamente', detail: 'Ignora preparo clínico.', correct: 'Estabilização na origem reduz eventos no trajeto.' },
        { label: 'Letra C — suspender monitorização', detail: 'Aumenta risco durante deslocamento.', correct: 'Preparo inclui suporte conforme gravidade.' },
        { label: 'Letra D — jejum prolongado', detail: 'Não é recomendação universal pós-decisão.', correct: 'Gabarito B foca estabilidade clínica.' },
      ],
    ),
  },

  'cotec-fadenor-enfermagem-processo-de-enfermagem-1780010579953-0': {
    family: 'vf',
    branch: 'sp_generico',
    guideline: 'Registros de enfermagem — documentação e segurança do paciente',
    slides: slides(
      'Registros de enfermagem',
      [
        { label: 'Equipe técnica', detail: 'Registros pertinentes à equipe técnica de enfermagem.', icon: 'Users' },
        { label: 'I — anotações', detail: 'Verdadeira — subsidiam prescrição de enfermagem e análise reflexiva.', icon: 'CheckCircle' },
        { label: 'II — evolução', detail: 'Falsa — evolução registra quadro clínico com linguagem científica.', icon: 'XCircle' },
        { label: 'III — prescrição', detail: 'Planejamento das ações — não correta isoladamente.', icon: 'XCircle' },
      ],
      {
        content: 'REGISTROS TÉCNICOS DE ENFERMAGEM',
        rows: [
          { label: 'I', value: 'V — anotações subsidiam prescrição', badge: 'hot' },
          { label: 'II', value: 'F — evolução do quadro clínico', badge: 'warn' },
          { label: 'III', value: 'F — prescrição/planejamento isolado', badge: 'warn' },
          { label: 'Função', value: 'Comunicação na equipe de saúde', badge: 'ok' },
          { label: 'Legal', value: 'Documento legal de defesa', badge: 'ok' },
          { label: 'Qualidade', value: 'Avaliação da atuação — autenticidade', badge: 'ok' },
          { label: 'Gabarito', value: 'Letra A — apenas I', badge: 'hot' },
        ],
        footer: 'Registros retratam realidade documentada — veracidade e segurança do paciente',
      },
      [
        'Enfermagem depende de informações precisas e oportunas no cuidado.',
        'Registros fazem parte do processo do cuidar e da comunicação na equipe.',
        'Documento legal de defesa — autenticidade e veracidade das informações.',
        'I: anotações de enfermagem subsidiam prescrição e análise reflexiva → V.',
        'II: evolução descreve quadro clínico com linguagem científica — redação da banca falha.',
        'III: prescrição planeja ações — não está correta sozinha.',
        'Somente I — marcar letra A.',
      ],
      [
        { label: 'Letra B — I e III', detail: 'III isolada não basta — gabarito restringe a I.', correct: 'Somente afirmativa I está integralmente correta.' },
        { label: 'Letra C — II', detail: 'Evolução exige registro clínico completo, não só jargão.', correct: 'II não atende definição cobrada.' },
        { label: 'Letra D — II e III', detail: 'Combina duas falsas.', correct: 'Apenas I permanece verdadeira.' },
        { label: 'Letra E — III', detail: 'Prescrição é instrumento, mas afirmativa III não é a única correta.', correct: 'Gabarito A — somente I.' },
      ],
      'PEGADINHAS — VF',
    ),
  },

  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-3': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Iatrogenia — dano relacionado ao cuidado',
    slides: slides(
      'Doença iatrogênica',
      [
        { label: 'Iatrogênico', detail: 'Dano causado pelo tratamento, não pela doença de base.', icon: 'AlertTriangle' },
        { label: 'Tratamento/diagnóstico', detail: 'Intervenção terapêutica como origem.', icon: 'Stethoscope' },
        { label: 'Morbidade/mortalidade', detail: 'Complicações evitáveis ligadas ao cuidado.', icon: 'HeartPulse' },
        { label: 'Gabarito', detail: 'Letra A — definição completa.', icon: 'CheckCircle' },
      ],
      { content: 'IATROGENIA', footer: 'Segurança do paciente busca reduzir dano iatrogênico' },
      [
        'Pergunta: definição de doenças iatrogênicas.',
        'Origem no tratamento ou diagnóstico — não progressão natural.',
        'Pode gerar morbidade ou mortalidade.',
        'Marcar letra A.',
      ],
      [
        { label: 'Letra B — doença congênita', detail: 'Origem genética — não iatrogênica.', correct: 'Iatrogenia decorre de intervenção em saúde.' },
        { label: 'Letra C — natural da doença', detail: 'Inverte o conceito.', correct: 'Iatrogênico é evitável e ligado ao cuidado.' },
        { label: 'Letra D — infecciosa apenas', detail: 'Iatrogenia não se limita a infecção.', correct: 'Definição ampla de dano pelo tratamento.' },
      ],
    ),
  },

  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002704012-7': {
    family: 'conceito',
    branch: 'sp_eventos_adversos',
    guideline: 'Classificação de gravidade de danos — eventos adversos',
    slides: slides(
      'Gravidade do dano',
      [
        { label: 'Dano leve', detail: 'Reação mínima — sem tratamento adicional.', icon: 'MinusCircle' },
        { label: 'Dano moderado', detail: 'Exige intervenção — não é mínimo.', icon: 'AlertCircle' },
        { label: 'Dano grave', detail: 'Comprometimento significativo ou permanente.', icon: 'XCircle' },
        { label: 'Gabarito', detail: 'Letra B — leve.', icon: 'CheckCircle' },
      ],
      {
        content: 'DANO LEVE',
        rows: [
          { label: 'Leve', value: 'Reação mínima, sem tratamento extra', badge: 'hot' },
          { label: 'Moderado', value: 'Requer intervenção', badge: 'ok' },
          { label: 'Grave', value: 'Dano significativo', badge: 'ok' },
        ],
        footer: 'Taxonomia de gravidade orienta notificação NSP',
      },
      [
        'Classificação de danos por gravidade.',
        'Enunciado: reação mínima, sem tratamento adicional.',
        'Corresponde a dano leve.',
        'Marcar letra B.',
      ],
      [
        { label: 'Letra A — moderado', detail: 'Moderado exige tratamento adicional.', correct: 'Leve = reação mínima sem conduta extra.' },
        { label: 'Letra C — grave', detail: 'Grave implica dano significativo.', correct: 'Não há reação mínima na definição de grave.' },
        { label: 'Letra D — catastrófico', detail: 'Desfecho extremo — não é mínimo.', correct: 'Gabarito B — dano leve.' },
      ],
    ),
  },

  'fauel-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-8': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'OMS — definição de qualidade em saúde',
    slides: slides(
      'Qualidade OMS',
      [
        { label: 'Excelência profissional', detail: 'Primeira lacuna — alto nível técnico.', icon: 'Award' },
        { label: 'Recursos', detail: 'Uso eficiente dos meios disponíveis.', icon: 'Coins' },
        { label: 'Riscos', detail: 'Mínimo de riscos ao paciente.', icon: 'ShieldAlert' },
        { label: 'Gabarito', detail: 'Letra B — excelência – recursos – riscos – paciente.', icon: 'CheckCircle' },
      ],
      {
        content: 'QUALIDADE = EXCELÊNCIA + EFICIÊNCIA + SEGURANÇA',
        rows: [
          { label: '1ª lacuna', value: 'Excelência profissional', badge: 'hot' },
          { label: '2ª lacuna', value: 'Recursos', badge: 'hot' },
          { label: '3ª lacuna', value: 'Riscos (mínimo)', badge: 'hot' },
          { label: '4ª lacuna', value: 'Paciente', badge: 'hot' },
        ],
        footer: 'Qualidade em saúde alinha eficiência e segurança do paciente',
      },
      [
        'Frase OMS sobre qualidade no atendimento.',
        'Preencher: excelência, recursos, riscos, paciente.',
        'Eliminar opções com ordem ou termos trocados.',
        'Marcar letra B.',
      ],
      [
        { label: 'Letra A — custo – tempo – erro', detail: 'Não reflete definição OMS clássica.', correct: 'OMS cita excelência profissional e mínimo de riscos.' },
        { label: 'Letra C — produtividade – lucro', detail: 'Foco mercadológico — não é definição assistencial.', correct: 'Paciente é centro da definição de qualidade.' },
        { label: 'Letra D — tecnologia – equipamento', detail: 'Recursos são mais amplos que equipamentos.', correct: 'Sequência B fecha as quatro lacunas.' },
      ],
    ),
  },

  'faurgs-enfermagem-seguranca-do-paciente-1779563436357-6': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Sistemas seguros — comunicação na organização',
    slides: slides(
      'Sistemas mais seguros',
      [
        { label: 'Estratégia', detail: 'Criar cultura e processos que reduzam dano.', icon: 'Shield' },
        { label: 'Comunicação', detail: 'Intensificar troca clara entre equipes.', icon: 'MessageSquare' },
        { label: 'Meta 2 OMS', detail: 'Comunicação efetiva é meta internacional.', icon: 'Globe' },
        { label: 'Gabarito', detail: 'Letra A — intensificar comunicação.', icon: 'CheckCircle' },
      ],
      { content: 'COMUNICAÇÃO EFETIVA', footer: 'Falhas de comunicação geram eventos adversos' },
      [
        'Estratégia para sistemas mais seguros nas organizações.',
        'Comunicação clara reduz erros evitáveis.',
        'Marcar letra A.',
      ],
      [
        { label: 'Letra B — reduzir equipe', detail: 'Menos pessoas não garante segurança.', correct: 'Comunicação estruturada previne incidentes.' },
        { label: 'Letra C — sigilo total', detail: 'Ocultar informação aumenta risco.', correct: 'Troca aberta entre profissionais é estratégia segura.' },
        { label: 'Letra D — automatizar tudo', detail: 'Tecnologia sem comunicação falha.', correct: 'Gabarito A — intensificar comunicação.' },
      ],
    ),
  },

  'fundatec-enfermagem-processo-de-enfermagem-1780006947080-1': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Radiofármacos — requisitos de quarto de internação',
    slides: slides(
      'Quarto de radiofármacos',
      [
        { label: 'Blindagem', detail: 'Obrigatória — proteção contra radiação.', icon: 'Shield' },
        { label: 'Sinalização', detail: 'Radiação ionizante — identificação externa.', icon: 'AlertTriangle' },
        { label: 'EXCETO', detail: 'Cantos 90° não são requisito — gabarito C.', icon: 'XCircle' },
        { label: 'Biombo blindado', detail: 'Proteção junto ao leito — necessário.', icon: 'Bed' },
      ],
      { content: 'EXCETO CANTOS 90°', footer: 'Normas de radioproteção exigem blindagem e sinalização' },
      [
        'Quarto para radiofármacos — comando EXCETO.',
        'Blindagem, sinalização, biombo e sanitário são exigências.',
        'Cantos em 90° não fazem parte do requisito.',
        'Marcar letra C.',
      ],
      [
        { label: 'Letra A — blindagem', detail: 'Essencial em ambiente com radiofármacos.', correct: 'EXCETO pede o que NÃO deve possuir — blindagem é obrigatória.' },
        { label: 'Letra B — sinalização', detail: 'Identifica radiação ionizante externamente.', correct: 'Não é a exceção — é requisito de segurança.' },
        { label: 'Letra D — biombo blindado', detail: 'Protege leito durante administração.', correct: 'Item obrigatório, não resposta EXCETO.' },
        { label: 'Letra E — sanitário privativo', detail: 'Requisito de conforto e biossegurança.', correct: 'Gabarito C — cantos 90° não são exigência.' },
      ],
      'PEGADINHAS — EXCETO',
    ),
  },

  'igeduc-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-1': {
    family: 'certo_errado',
    branch: 'sp_generico',
    guideline: 'Estilos de liderança — autocrático vs participativo',
    slides: slides(
      'Liderança autocrática',
      [
        { label: 'Afirmativa', detail: 'Texto descreve líder participativo/democrático.', icon: 'Users' },
        { label: 'Autocrático', detail: 'Decisão centralizada — não participativa.', icon: 'UserCog' },
        { label: 'Inversão', detail: 'Banca troca rótulo pelo comportamento oposto.', icon: 'Shuffle' },
        { label: 'Gabarito', detail: 'Letra B — Errado.', icon: 'XCircle' },
      ],
      { content: 'ITEM ERRADO', footer: 'Autocrático ≠ participativo' },
      [
        'Item associa autocrático a trabalho em conjunto.',
        'Participação e sugestões do grupo = estilo democrático.',
        'Afirmativa está incorreta.',
        'Marcar Errado — letra B.',
      ],
      [
        { label: 'Certo', detail: 'Descrição não corresponde a liderança autocrática.', correct: 'Autocrático concentra decisão; participativo divide autoridade.' },
        { label: 'Pegadinha — democrático', detail: 'Texto descreve trabalho em conjunto e sugestões do grupo.', correct: 'Esse perfil é democrático/participativo — julgar Errado.' },
      ],
      'PEGADINHA — C/E',
    ),
  },

  'igeduc-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-4': {
    family: 'certo_errado',
    branch: 'sp_generico',
    guideline: 'Gestão de materiais — provisão vs programação',
    slides: slides(
      'Provisão de materiais',
      [
        { label: 'Afirmativa', detail: 'Define provisão como levantamento de necessidades.', icon: 'FileText' },
        { label: 'Provisão', detail: 'Aquisição/reposição conforme estoque — não é só levantamento.', icon: 'Package' },
        { label: 'Levantamento', detail: 'Corresponde a programação/planejamento.', icon: 'ClipboardList' },
        { label: 'Gabarito', detail: 'Letra B — Errado.', icon: 'XCircle' },
      ],
      { content: 'PROVISÃO ≠ LEVANTAMENTO', footer: 'Termos de gestão de materiais têm sentidos distintos' },
      [
        'Julgar definição de provisão em gerenciamento de materiais.',
        'Levantamento de necessidades é etapa de programação.',
        'Provisão é suprir unidade — afirmativa troca conceitos.',
        'Marcar Errado — letra B.',
      ],
      [
        { label: 'Certo', detail: 'Confunde provisão com levantamento de necessidades.', correct: 'Provisão é obter materiais; levantamento precede programação.' },
        { label: 'Pegadinha — programação', detail: 'Levantamento de necessidades e quantidade é etapa de programação.', correct: 'Provisão ≠ levantamento — item Errado.' },
      ],
      'PEGADINHA — C/E',
    ),
  },

  'imparh-enfermagem-seguranca-do-paciente-1779563443877-5': {
    family: 'protocolo',
    branch: 'sp_identificacao',
    guideline: 'MS — Protocolo Nacional de Identificação do Paciente',
    slides: slides(
      'Erros na assistência',
      [
        { label: 'Carga horária', detail: 'Fator organizacional de erros na enfermagem.', icon: 'Clock' },
        { label: 'Remuneração e condições', detail: 'Más condições de trabalho afetam o cuidar.', icon: 'Building' },
        { label: 'Identificação', detail: 'Protocolo Nacional reduz troca de paciente.', icon: 'IdCard' },
        { label: 'Gabarito', detail: 'Letra A — Protocolo de Identificação.', icon: 'CheckCircle' },
      ],
      { content: 'PROTOCOLO DE IDENTIFICAÇÃO', footer: 'Meta 1 OMS — identificar corretamente o paciente' },
      [
        'Qualidade da assistência e processo do cuidar na enfermagem.',
        'Erros ligados a carga horária, remuneração e condições de trabalho.',
        'Instrumento de segurança: Protocolo de Identificação do Paciente.',
        'Marcar letra A.',
      ],
      [
        { label: 'Letra B — escala de Braden', detail: 'Avalia risco de lesão por pressão.', correct: 'Identificação é meta prioritária de segurança.' },
        { label: 'Letra C — SAE genérico', detail: 'Processo amplo — não é o protocolo específico.', correct: 'Protocolo Nacional de Identificação é resposta direta.' },
        { label: 'Letra D — curativos', detail: 'Técnica específica — não cobre identificação.', correct: 'Gabarito A — protocolo de identificação do paciente.' },
      ],
    ),
  },

  'inaz-do-para-enfermagem-processo-de-enfermagem-1780011947286-2': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Cultura de segurança — comunicação de deterioração clínica',
    slides: slides(
      'Cultura de segurança',
      [
        { label: 'Deterioração clínica', detail: 'Evolução sugere risco de piora.', icon: 'TrendingDown' },
        { label: 'Comunicação tempestiva', detail: 'Reportar alterações imediatamente.', icon: 'Bell' },
        { label: 'Eventos adversos', detail: 'Comunicação reduz dano evitável.', icon: 'ShieldAlert' },
        { label: 'Gabarito', detail: 'Letra A — comunicação tempestiva.', icon: 'CheckCircle' },
      ],
      { content: 'COMUNIQUE ALTERAÇÕES', footer: 'Cultura de segurança valoriza quem escala cuidado' },
      [
        'Contexto: cultura de segurança do paciente.',
        'Risco de deterioração clínica na evolução.',
        'Comunicação tempestiva é prática segura.',
        'Marcar letra A.',
      ],
      [
        { label: 'Letra B — aguardar próximo plantão', detail: 'Atraso aumenta dano.', correct: 'Alteração clínica exige comunicação imediata.' },
        { label: 'Letra C — registrar sem avisar', detail: 'Registro sem comunicação verbal falha.', correct: 'Tempestividade inclui acionar equipe na hora.' },
        { label: 'Letra D — omitir para evitar conflito', detail: 'Cultura punidora silencia riscos.', correct: 'Segurança exige reportar deterioração.' },
      ],
    ),
  },

  'instituto-access-enfermagem-seguranca-do-paciente-1777102742836-2': {
    family: 'conceito',
    branch: 'sp_metas_internacionais',
    guideline: 'JCI/OMS — seis metas internacionais de segurança do paciente',
    slides: slides(
      'Metas internacionais',
      [
        { label: 'Meta 1', detail: 'Identificar corretamente o paciente.', icon: 'UserCheck' },
        { label: 'Meta 2', detail: 'Melhorar comunicação entre profissionais.', icon: 'MessageSquare' },
        { label: 'Meta 3', detail: 'Medicamentos de alta vigilância.', icon: 'Pill' },
        { label: 'Meta 4', detail: 'Cirurgia segura — gabarito D.', icon: 'Scissors' },
      ],
      {
        content: 'SEIS METAS JCI/OMS',
        rows: [
          { label: '1', value: 'Identificação', badge: 'ok' },
          { label: '2', value: 'Comunicação', badge: 'ok' },
          { label: '3', value: 'Medicação alta vigilância', badge: 'ok' },
          { label: '4', value: 'Cirurgia segura', badge: 'hot', emphasis: 'highlight' },
          { label: '5', value: 'Higienização das mãos', badge: 'ok' },
          { label: '6', value: 'Prevenção de quedas', badge: 'ok' },
        ],
        footer: 'Memorize a ordem — banca pergunta meta por número',
      },
      [
        'JCI e OMS: seis metas de segurança do paciente.',
        'Pergunta: qual é a quarta meta?',
        'Sequência: identificação, comunicação, medicação, cirurgia…',
        'Marcar letra D — cirurgia segura.',
      ],
      [
        { label: 'Letra A — identificação', detail: 'É a Meta 1, não a quarta.', correct: 'Quarta meta é cirurgia segura.' },
        { label: 'Letra B — comunicação', detail: 'Meta 2 — troca de turno e handoff.', correct: 'Número 4 = cirurgia segura.' },
        { label: 'Letra C — alta vigilância', detail: 'Meta 3 — medicamentos críticos.', correct: 'Gabarito D — paciente, sítio e procedimento corretos.' },
      ],
    ),
  },

  'instituto-consulpam-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-6': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Qualidade no atendimento — equidade público/privado',
    slides: slides(
      'Atendimento de qualidade',
      [
        { label: 'Setor público', detail: 'Mesmo padrão de respeito e qualidade.', icon: 'Building2' },
        { label: 'NÃO é boa prática', detail: 'Tratar paciente público de forma diferente.', icon: 'XCircle' },
        { label: 'Fidelização', detail: 'Não justifica discriminação no SUS.', icon: 'Heart' },
        { label: 'Gabarito', detail: 'Letra B — prática inadequada.', icon: 'AlertTriangle' },
      ],
      { content: 'EQUIDADE NO ATENDIMENTO', footer: 'Qualidade independe de ser público ou privado' },
      [
        'Comando: alternativa que NÃO é boa prática.',
        'Paciente do setor público merece mesmo padrão.',
        'Tratamento diferenciado por não haver fidelidade → incorreto.',
        'Marcar letra B.',
      ],
      [
        { label: 'Letra A — escuta ativa', detail: 'Boa prática de qualidade.', correct: 'NÃO é a resposta — é conduta desejável.' },
        { label: 'Letra C — informação clara', detail: 'Direito do paciente.', correct: 'Banca pede a má prática — letra B.' },
        { label: 'Letra D — acolhimento', detail: 'Pilar da humanização.', correct: 'Gabarito B discrimina usuário do público.' },
      ],
      'PEGADINHA — NÃO / EXCETO',
    ),
  },

  'instituto-consulplan-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-3': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Planejamento em saúde — eficiência',
    slides: slides(
      'Eficiência em saúde',
      [
        { label: 'Planejamento', detail: 'Angariar recursos, definir destinos e metas.', icon: 'Target' },
        { label: 'Eficiência', detail: 'Máximo resultado com mínimo esforço/recursos.', icon: 'Zap' },
        { label: 'Eficácia', detail: 'Atingir objetivo — conceito distinto.', icon: 'CheckCircle' },
        { label: 'Gabarito', detail: 'Letra B — eficiência.', icon: 'Award' },
      ],
      { content: 'EFICIÊNCIA', footer: 'Eficácia = atingir meta; eficiência = gasto mínimo' },
      [
        'Atividades de planejamento de gastos em saúde.',
        'Competência: resultados com gasto mínimo de esforço.',
        'Definição clássica de eficiência.',
        'Marcar letra B.',
      ],
      [
        { label: 'Letra A — eficácia', detail: 'Foco no resultado, não no uso mínimo de recursos.', correct: 'Eficiência otimiza insumos para o mesmo fim.' },
        { label: 'Letra C — economicidade', detail: 'Conceito próximo, mas banca usa eficiência.', correct: 'Gabarito oficial: eficiência.' },
        { label: 'Letra D — produtividade', detail: 'Volume de trabalho — não definição pedida.', correct: 'Letra B fecha a lacuna do enunciado.' },
      ],
    ),
  },

  'instituto-ibed-enfermagem-processo-de-enfermagem-1780004917460-9': {
    family: 'certo_errado',
    branch: 'sp_prevencao_quedas',
    guideline: 'MS — prevenção de quedas não se resume a grades',
    slides: slides(
      'Grades da cama',
      [
        { label: 'Afirmativa', detail: 'Grades elevadas isoladas bastam para prevenir quedas.', icon: 'Bed' },
        { label: 'Paciente idoso', detail: 'Risco multifatorial — avaliação global.', icon: 'User' },
        { label: 'Medidas múltiplas', detail: 'Calçado, iluminação, campainha, supervisão.', icon: 'Shield' },
        { label: 'Gabarito', detail: 'Letra B — Errado.', icon: 'XCircle' },
      ],
      { content: 'GRADES NÃO BASTAM', footer: 'Meta 6 OMS — prevenção de quedas é pacote de cuidados' },
      [
        'Idoso hospitalizado — prevenção de quedas.',
        'Grades isoladas não são medida suficiente.',
        'Exige avaliação de risco e ambiente seguro.',
        'Marcar Errado — letra B.',
      ],
      [
        { label: 'Certo', detail: 'Prevenção exige escala de risco, calçado e supervisão.', correct: 'Grades são complemento — nunca medida única suficiente.' },
        { label: 'Pegadinha — só grades', detail: 'Elevar grades isoladamente parece suficiente em idosos.', correct: 'Pacote de prevenção inclui avaliação Morse e ambiente seguro.' },
      ],
      'PEGADINHA — C/E',
    ),
  },

  'instituto-verbena-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-4': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Trabalho em equipe — multidisciplinar vs interdisciplinar',
    slides: slides(
      'Equipe de saúde',
      [
        { label: 'Pareceres isolados', detail: 'Cada profissional opina sem integração.', icon: 'Users' },
        { label: 'Multidisciplinar', detail: 'Disciplinas paralelas — pouca cooperação.', icon: 'Layers' },
        { label: 'Interdisciplinar', detail: 'Integração e objetivo comum — não é o caso.', icon: 'HeartHandshake' },
        { label: 'Gabarito', detail: 'Letra B — multidisciplinaridade.', icon: 'CheckCircle' },
      ],
      { content: 'MULTIDISCIPLINAR', footer: 'Segurança exige equipe que comunica, não só opina' },
      [
        'Profissionais expressam parecer sem cooperação.',
        'Trabalho paralelo por especialidade.',
        'Define multidisciplinaridade.',
        'Marcar letra B.',
      ],
      [
        { label: 'Letra A — interdisciplinar', detail: 'Exige integração e plano comum.', correct: 'Cenário descreve soma de opiniões isoladas.' },
        { label: 'Letra C — transdisciplinar', detail: 'Superação de fronteiras — nível superior.', correct: 'Multidisciplinar = paralelo sem articulação.' },
        { label: 'Letra D — uniprofissional', detail: 'Um só profissional — não há equipe.', correct: 'Gabarito B — multidisciplinaridade.' },
      ],
    ),
  },

  'instituto-verbena-enfermagem-seguranca-do-paciente-1777102742836-1': {
    family: 'protocolo',
    branch: 'sp_metas_internacionais',
    guideline: 'OMS — cinco momentos para higienização das mãos (Meta 5)',
    slides: slides(
      'Higienização das mãos',
      [
        { label: 'Microrganismos', detail: 'Higienizar mãos reduz transmissão e infecções preveníveis.', icon: 'Bug' },
        { label: '1º momento', detail: 'Antes de tocar o paciente.', icon: 'Hand' },
        { label: '2º–5º momentos', detail: 'Procedimento asséptico, fluidos, após paciente e superfícies.', icon: 'Droplets' },
        { label: 'Gabarito', detail: 'Letra A — sequência completa dos 5 momentos.', icon: 'CheckCircle' },
      ],
      {
        content: '5 MOMENTOS OMS',
        rows: [
          { label: '1', value: 'Antes do paciente', badge: 'hot' },
          { label: '2', value: 'Antes do procedimento asséptico', badge: 'hot' },
          { label: '3', value: 'Após risco de fluidos', badge: 'ok' },
          { label: '4', value: 'Após tocar paciente', badge: 'ok' },
          { label: '5', value: 'Após superfícies do paciente', badge: 'ok' },
        ],
        footer: 'Meta 5 internacional — higienizar as mãos',
      },
      [
        'Meta 5: higienização das mãos reduz infecções preveníveis.',
        'Cinco momentos OMS para higienização das mãos.',
        'Letra A lista sequência oficial completa.',
        'Marcar letra A.',
      ],
      [
        { label: 'Letra B — só antes do procedimento', detail: 'Omite outros momentos obrigatórios.', correct: 'Protocolo exige cinco momentos, não um só.' },
        { label: 'Letra C — só após fluidos', detail: 'Incompleto — falta antes do contato.', correct: 'Sequência A cobre todos os momentos.' },
        { label: 'Letra D — ordem invertida', detail: 'Trocar momentos invalida prática segura.', correct: 'Gabarito A — ordem canônica OMS.' },
      ],
    ),
  },

  'ivin-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-8': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Dimensionamento de enfermagem — Escala de Fugulin',
    slides: slides(
      'Escala de Fugulin',
      [
        { label: 'Gestão de enfermagem', detail: 'Distribuir profissionais conforme dependência.', icon: 'Users' },
        { label: 'Grau de dependência', detail: 'Classifica cuidados necessários ao paciente.', icon: 'Activity' },
        { label: 'Fugulin', detail: 'Instrumento de dimensionamento de pessoal.', icon: 'BarChart3' },
        { label: 'Gabarito', detail: 'Letra C — Escala de Fugulin.', icon: 'CheckCircle' },
      ],
      { content: 'ESCALA DE FUGULIN', footer: 'Carga de trabalho deve refletir dependência do paciente' },
      [
        'Instrumento para distribuir enfermagem por dependência.',
        'Divisão equitativa conforme grau de cuidado.',
        'Nome: Escala de Fugulin.',
        'Marcar letra C.',
      ],
      [
        { label: 'Letra A — Morse', detail: 'Escala de risco de quedas.', correct: 'Fugulin mede dependência para dimensionamento.' },
        { label: 'Letra B — Braden', detail: 'Risco de lesão por pressão.', correct: 'Gestão de pessoal usa Fugulin neste contexto.' },
        { label: 'Letra D — Glasgow', detail: 'Nível de consciência — não dimensionamento.', correct: 'Gabarito C — Escala de Fugulin.' },
      ],
    ),
  },

  'objetiva-concursos-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563718396-1': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Direitos do paciente — controle adequado da dor (Dochterman)',
    slides: slides(
      'Direitos do paciente',
      [
        { label: 'Dochterman', detail: 'Referência em direitos e proteção do paciente.', icon: 'BookOpen' },
        { label: 'Controle da dor', detail: 'Direito em condições agudas, crônicas e terminais.', icon: 'HeartPulse' },
        { label: 'Autonomia', detail: 'Informação e alívio do sofrimento.', icon: 'Scale' },
        { label: 'Gabarito', detail: 'Letra D — controle adequado da dor.', icon: 'CheckCircle' },
      ],
      { content: 'DOR COMO DIREITO', footer: 'Negar analgesia adequada viola segurança e dignidade' },
      [
        'Proteção dos direitos do paciente — Dochterman.',
        'Buscar alternativa sobre controle da dor.',
        'Abrange quadros agudos, crônicos e terminais.',
        'Marcar letra D.',
      ],
      [
        { label: 'Letra A — recusa de tratamento', detail: 'Direito válido, mas não é o foco da questão.', correct: 'Enunciado cobra analgesia adequada.' },
        { label: 'Letra B — sigilo absoluto', detail: 'Confidencialidade — outro eixo.', correct: 'Gabarito D — controle da dor.' },
        { label: 'Letra C — alta imediata', detail: 'Não é direito incondicional.', correct: 'Dor mal controlada é falha de segurança e cuidado.' },
      ],
    ),
  },

  'ufmt-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-6': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Processo de trabalho em enfermagem — objeto, meios e trabalho',
    slides: slides(
      'Processo de trabalho',
      [
        { label: 'Objeto de trabalho', detail: 'Saúde-doença do usuário.', icon: 'User' },
        { label: 'Meios de trabalho', detail: 'Recursos humanos, materiais e ambiente.', icon: 'Wrench' },
        { label: 'Instrumentos', detail: 'Técnicas e conhecimentos aplicados.', icon: 'Stethoscope' },
        { label: 'Gabarito', detail: 'Letra B — objeto, meios, instrumentos e trabalho.', icon: 'CheckCircle' },
      ],
      { content: 'OBJETO + MEIOS + TRABALHO', footer: 'Segurança depende de organização do processo de trabalho' },
      [
        'Processo de trabalho em saúde e enfermagem.',
        'Componentes: objeto, meios/instrumentos e trabalho em si.',
        'Marcar letra B.',
      ],
      [
        { label: 'Letra A — só diagnóstico', detail: 'Reduz processo a uma fase do cuidar.', correct: 'Processo inclui objeto, meios e execução.' },
        { label: 'Letra C — administração financeira', detail: 'Gestão — não estrutura do processo.', correct: 'B descreve tripé clássico do trabalho em saúde.' },
        { label: 'Letra D — legislação apenas', detail: 'Marco legal não define componentes operativos.', correct: 'Gabarito B — estrutura completa.' },
      ],
    ),
  },

  'ufmt-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-7': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Administração — funções do gerenciamento',
    slides: slides(
      'Funções administrativas',
      [
        { label: 'Planejar', detail: 'Definir objetivos e rotas.', icon: 'Map' },
        { label: 'Organizar', detail: 'Distribuir recursos e tarefas.', icon: 'LayoutGrid' },
        { label: 'Liderar e controlar', detail: 'Dirigir equipe e avaliar resultados.', icon: 'Compass' },
        { label: 'Gabarito', detail: 'Letra A — organizar, planejar, controlar e liderar.', icon: 'CheckCircle' },
      ],
      { content: 'PLANEJAR · ORGANIZAR · LIDERAR · CONTROLAR', footer: 'Gestão estruturada reduz falhas na assistência' },
      [
        'Quatro funções do processo de gerenciamento.',
        'Conjunto clássico: planejar, organizar, liderar, controlar.',
        'Marcar letra A.',
      ],
      [
        { label: 'Letra B — só executar', detail: 'Execução é operação — não função gerencial completa.', correct: 'Gerenciamento inclui planejar e controlar.' },
        { label: 'Letra C — auditar apenas', detail: 'Auditoria é ferramenta — não as quatro funções.', correct: 'A lista as quatro funções pedidas.' },
        { label: 'Letra D — comprar e vender', detail: 'Atividade comercial — não núcleo gerencial em saúde.', correct: 'Gabarito A — funções administrativas clássicas.' },
      ],
    ),
  },

  'unesc-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563685104-5': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Qualidade em enfermagem — humanização, comunicação e segurança',
    slides: slides(
      'Pilares da qualidade',
      [
        { label: 'Humanização', detail: 'Cuidado centrado na pessoa.', icon: 'Heart' },
        { label: 'Comunicação eficaz', detail: 'Troca clara com paciente e equipe.', icon: 'MessageSquare' },
        { label: 'Segurança do paciente', detail: 'Terceiro pilar junto aos anteriores.', icon: 'Shield' },
        { label: 'Gabarito', detail: 'Letra A — os três pilares juntos.', icon: 'CheckCircle' },
      ],
      { content: 'HUMANIZAÇÃO + COMUNICAÇÃO + SEGURANÇA', footer: 'Qualidade assistencial é tripartite' },
      [
        'Princípios da qualidade no atendimento em enfermagem.',
        'Opção correta integra humanização, comunicação e segurança.',
        'Marcar letra A.',
      ],
      [
        { label: 'Letra B — só produtividade', detail: 'Volume não define qualidade assistencial.', correct: 'Pilares incluem segurança do paciente.' },
        { label: 'Letra C — só custo', detail: 'Eficiência financeira não é pilar ético-clínico.', correct: 'A articula os três fundamentos pedidos.' },
        { label: 'Letra D — tecnologia isolada', detail: 'Equipamento sem comunicação falha.', correct: 'Gabarito A — conjunto dos pilares.' },
      ],
    ),
  },

  'unifil-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563718396-2': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Manutenção hospitalar — preventiva programada',
    slides: slides(
      'Manutenção preventiva',
      [
        { label: 'Segurança operacional', detail: 'Objetivo da manutenção de equipamentos.', icon: 'Shield' },
        { label: 'Intervalos predeterminados', detail: 'Caracteriza manutenção preventiva.', icon: 'Calendar' },
        { label: 'Qualidade do produto', detail: 'Serviço confiável após calibragem.', icon: 'CheckCircle' },
        { label: 'Gabarito', detail: 'Letra A — manutenção preventiva.', icon: 'Wrench' },
      ],
      { content: 'MANUTENÇÃO PREVENTIVA', footer: 'Equipamento falho ameaça segurança do paciente' },
      [
        'Lacuna: manutenção em intervalos predeterminados.',
        'Tipo: manutenção preventiva.',
        'Marcar letra A.',
      ],
      [
        { label: 'Letra B — corretiva', detail: 'Após falha — não programada.', correct: 'Preventiva antecede quebra em cronograma.' },
        { label: 'Letra C — preditiva', detail: 'Usa indicadores de desgaste — conceito distinto.', correct: 'Intervalos fixos = preventiva clássica.' },
        { label: 'Letra D — emergencial', detail: 'Reparo imediato pós-incidente.', correct: 'Gabarito A — manutenção preventiva.' },
      ],
    ),
  },

  'vunesp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-3': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Triagem de urgência — identificação de gravidade na sala de espera',
    slides: slides(
      'Fluxo na urgência',
      [
        { label: 'Demanda respiratória', detail: 'Alta procura de sintomáticos respiratórios.', icon: 'Wind' },
        { label: 'Sala de espera', detail: 'Inspeção ativa identifica gravidade.', icon: 'Eye' },
        { label: 'Sinais de gravidade', detail: 'Priorizar quem deteriora na espera.', icon: 'AlertTriangle' },
        { label: 'Gabarito', detail: 'Letra E — identificar sinais na sala de espera.', icon: 'CheckCircle' },
      ],
      { content: 'TRIAGEM NA ESPERA', footer: 'Segurança em urgência exige vigilância contínua' },
      [
        'Reorganizar fluxo na recepção de urgência.',
        'Ouvir equipe sobre melhorias.',
        'Identificar gravidade ao inspecionar sala de espera.',
        'Marcar letra E.',
      ],
      [
        { label: 'Letra A — reduzir leitos', detail: 'Capacidade física — não triagem.', correct: 'Gravidade na espera exige inspeção ativa.' },
        { label: 'Letra B — encerrar plantão', detail: 'Gestão de RH — não fluxo clínico.', correct: 'E foca sinais de gravidade na espera.' },
        { label: 'Letra C — marketing', detail: 'Comunicação externa — irrelevante.', correct: 'Gabarito E — segurança na sala de espera.' },
        { label: 'Letra D — faturamento', detail: 'Administrativo — não clínico.', correct: 'Triagem visual reduz eventos adversos na espera.' },
      ],
    ),
  },

  'vunesp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563718396-3': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Trabalho em equipe multiprofissional — integralidade',
    slides: slides(
      'Equipe multiprofissional',
      [
        { label: 'Laccort e Oliveira', detail: 'Trabalho em equipe como ferramenta em saúde.', icon: 'BookOpen' },
        { label: 'Articulação', detail: 'Profissionais constroem saberes compartilhados.', icon: 'HeartHandshake' },
        { label: 'Integralidade', detail: 'Supera modelo biomédico isolado.', icon: 'Puzzle' },
        { label: 'Gabarito', detail: 'Letra D — equipe multiprofissional articulada.', icon: 'CheckCircle' },
      ],
      { content: 'INTEGRALIDADE EM EQUIPE', footer: 'Segurança melhora quando equipe comunica e integra' },
      [
        'Enfermagem como elo entre profissionais.',
        'Buscar afirmativa sobre equipe multiprofissional.',
        'Integralidade e saberes compartilhados.',
        'Marcar letra D.',
      ],
      [
        { label: 'Letra A — trabalho isolado', detail: 'Contradiz equipe multiprofissional.', correct: 'Articulação favorece integralidade.' },
        { label: 'Letra B — hierarquia rígida', detail: 'Impede troca entre disciplinas.', correct: 'D descreve prática colaborativa atual.' },
        { label: 'Letra C — só biomedicina', detail: 'Nega integralidade.', correct: 'Gabarito D — prática articulada multiprofissional.' },
      ],
    ),
  },

  'vunesp-enfermagem-seguranca-do-paciente-1779563448133-2': {
    family: 'conceito',
    branch: 'sp_metas_internacionais',
    guideline: 'Metas internacionais — ordem correta JCI/OMS',
    slides: slides(
      'Metas — ordem correta',
      [
        { label: 'Meta 1', detail: 'Identificar corretamente o paciente.', icon: 'UserCheck' },
        { label: 'Riscos na internação', detail: 'Tecnologias e medicamentos expõem pacientes a riscos.', icon: 'AlertTriangle' },
        { label: 'Meta 2', detail: 'Comunicação entre profissionais — gabarito B.', icon: 'MessageSquare' },
        { label: 'Meta 3', detail: 'Segurança na medicação de alta vigilância.', icon: 'Pill' },
        { label: 'Pegadinha', detail: 'Alternativas embaralham números das metas.', icon: 'Shuffle' },
      ],
      {
        content: 'METAS INTERNACIONAIS',
        rows: [
          { label: '1', value: 'Identificação do paciente', badge: 'ok' },
          { label: '2', value: 'Comunicação efetiva', badge: 'hot', emphasis: 'highlight' },
          { label: '3', value: 'Medicação alta vigilância', badge: 'ok' },
          { label: '4', value: 'Cirurgia segura', badge: 'ok' },
          { label: '5', value: 'Higienização das mãos', badge: 'ok' },
          { label: '6', value: 'Prevenção de quedas', badge: 'ok' },
        ],
        footer: 'Banca troca número da meta com conteúdo de outra',
      },
      [
        'Metas Internacionais — riscos durante internação com tecnologias e medicamentos.',
        'Achar alternativa com número e conteúdo da meta alinhados.',
        'Meta 2 = comunicação efetiva entre profissionais.',
        'Marcar letra B.',
      ],
      [
        { label: 'Letra A — cirurgia como Meta 3', detail: 'Cirurgia segura é Meta 4.', correct: 'Meta 3 é medicação de alta vigilância.' },
        { label: 'Letra C — infecção como Meta 1', detail: 'Meta 1 é identificação do paciente.', correct: 'Infecção relaciona-se à higiene — Meta 5.' },
        { label: 'Letra D — quedas como Meta 4', detail: 'Quedas são Meta 6.', correct: 'Gabarito B — Meta 2 comunicação.' },
        { label: 'Letra E — medicação como Meta 5', detail: 'Alta vigilância é Meta 3.', correct: 'Somente B acerta número e conteúdo.' },
      ],
    ),
  },

  'vunesp-enfermagem-seguranca-do-paciente-1779563448133-3': {
    family: 'conceito',
    branch: 'sp_generico',
    guideline: 'Humanização — informação clara ao paciente e família',
    slides: slides(
      'Humanização na enfermagem',
      [
        { label: 'Processo humanizador', detail: 'Profissionais em contato direto com o paciente.', icon: 'Heart' },
        { label: 'Informação clara', detail: 'Riscos, benefícios e inconvenientes explicados.', icon: 'MessageSquare' },
        { label: 'Família incluída', detail: 'Mesmo padrão de comunicação para familiares.', icon: 'Users' },
        { label: 'Gabarito', detail: 'Letra B — informações compreensíveis.', icon: 'CheckCircle' },
      ],
      { content: 'INFORMAR COM CLAREZA', footer: 'Consentimento e segurança exigem linguagem acessível' },
      [
        'Humanização na enfermagem para profissionais no cuidado direto.',
        'Paciente e família: informação clara sobre riscos e benefícios.',
        'Medidas diagnósticas e terapêuticas — linguagem compreensível.',
        'Marcar letra B.',
      ],
      [
        { label: 'Letra A — materiais e estrutura', detail: 'Humanização não depende só de insumos físicos.', correct: 'Informação clara ao paciente é eixo da humanização.' },
        { label: 'Letra C — só enfermeiro', detail: 'Humanização é multiprofissional.', correct: 'Técnico de Enfermagem participa do processo humanizador.' },
        { label: 'Letra D — acolhimento físico', detail: 'PNH: acolhimento é mais que espaço confortável.', correct: 'Gabarito B — riscos, benefícios e inconvenientes explicados.' },
        { label: 'Letra E — ambiência trocada', detail: 'Embaralha definição PNH de ambiência.', correct: 'B cobre comunicação clara com paciente e familiares.' },
      ],
    ),
  },
};

function main() {
  const dir = loteQuestionsDir('seguranca-do-paciente-g04');
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const out = {
      meta: metaBase(raw, pack.family, pack.branch, pack.guideline),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, JSON.stringify(out, null, 2) + '\n', 'utf8');
    ok++;
    console.log(`[handcraft:g04] OK ${slug}`);
  }
  console.log(`[handcraft:g04] total=${ok}`);
}

main();
