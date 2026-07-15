#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-crianca-g08 (6 slugs).
 *
 *   npx tsx scripts/handcraft-saude-da-crianca-g08.ts
 *   npm run validate:goldens -- --lote=saude-da-crianca-g08 --strict
 *   npm run audit:questao-readiness -- --lote=saude-da-crianca-g08 --strict-v2-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { SAUDE_CRIANCA_MS } from '@/lib/guidelines/saudeCrianca';

const LOTE = 'saude-da-crianca-g08';
const SUBTOPICO = 'Saúde da Criança';
const REVIEWED = '2026-07-15';

const MS_CADERNETA_SOURCE = {
  id: SAUDE_CRIANCA_MS.id,
  tier: 'A' as const,
  issuer: SAUDE_CRIANCA_MS.issuer,
  title: SAUDE_CRIANCA_MS.title,
  year: SAUDE_CRIANCA_MS.year,
  url: SAUDE_CRIANCA_MS.url,
  covers: [
    'atribuições técnico APS',
    'vias pediátricas IM',
    'coleta teste do pezinho',
    'notificação sífilis congênita',
    'glicemia pós-prandial DM',
    'Plano B desidratação UPA',
  ],
};

const SBD_DM_SOURCE = {
  id: 'sbd-diretriz-2023',
  tier: 'B' as const,
  issuer: 'Sociedade Brasileira de Diabetes',
  title: 'Diretriz Oficial SBD 2023 — metas glicêmicas pediátricas',
  year: 2023,
  covers: ['glicemia pós-prandial criança', '180 mg/dL'],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[] };
  modulo_slug?: string;
};

type Branch =
  | 'crianca_aps_puericultura'
  | 'crianca_desenvolvimento'
  | 'crianca_triagem_neonatal'
  | 'crianca_generico'
  | 'crianca_dor'
  | 'crianca_desidratacao';

type Pack = {
  family: 'conceito' | 'vf' | 'certo_errado' | 'protocolo';
  branch: Branch;
  guideline: string;
  sources?: (typeof MS_CADERNETA_SOURCE | typeof SBD_DM_SOURCE)[];
  exam_vs_current?: string;
  slides: unknown[];
  cleanInstruction?: (s: string) => string;
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: pack.branch,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
    },
    sources: pack.sources ?? [MS_CADERNETA_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/dainstituição/gi, 'da instituição')
    .replace(/otécnico/gi, 'o técnico')
    .replace(/considera-senormal/gi, 'considera-se normal')
    .replace(/Trata-seda/gi, 'Trata-se da')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'unesc-enfermagem-saude-da-crianca-1780001362784-7': {
    family: 'conceito',
    branch: 'crianca_aps_puericultura',
    guideline: 'Atribuições do técnico de enfermagem — CAB Saúde da Criança (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnico — atribuições APS',
        meta: slideMeta,
        items: [
          { label: 'CAB', detail: 'Caderno de Atenção Básica — Saúde da Criança.', icon: 'BookOpen' },
          { label: 'Fazer', detail: 'PA, antropometria, vacinas, educação permanente.', icon: 'CheckCircle' },
          { label: 'Consulta de enfermagem', detail: 'Processo de enfermagem completo — competência do enfermeiro.', icon: 'UserCheck' },
          { label: 'EXCETO', detail: 'Realizar consulta de enfermagem — fora do escopo do técnico.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'TE executa procedimentos — consulta é do enfermeiro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando EXCETO: atribuições do técnico de enfermagem na APS (CAB).',
          'A — educação permanente: atribuição válida.',
          'B — aferir PA em crianças: atribuição válida.',
          'C — peso e altura: atribuição válida.',
          'D — aplicar vacinas: atribuição válida.',
          'E — consulta de enfermagem: NÃO é atribuição do técnico.',
          'Marcar letra E (EXCETO).',
          'Fixação: consulta de enfermagem = enfermeiro.',
        ],
        footer_rule: 'EXCETO E — consulta de enfermagem',
      },
      {
        type: 'golden_rule',
        slide_title: 'Técnico × enfermeiro',
        meta: slideMeta,
        content: 'ATENÇÃO BÁSICA',
        rows: [
          { label: 'Técnico', value: 'PA, peso, altura, vacinas, educação permanente', badge: 'ok' },
          { label: 'Enfermeiro', value: 'Consulta de enfermagem e prescrição', badge: 'hot', emphasis: 'highlight' },
          { label: 'EXCETO', value: 'Consulta de enfermagem pelo técnico', badge: 'warn' },
          { label: 'Equipe', value: 'Trabalho interprofissional na ESF', badge: 'info' },
        ],
        footer_rule: 'Consulta = enfermeiro · procedimentos = técnico',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO ATRIBUIÇÕES',
        items: [
          {
            label: 'Letra A — educação permanente',
            detail: 'Participação em capacitação é atribuição.',
            correct: 'Educação permanente integra atribuições do técnico — não é EXCETO.',
          },
          {
            label: 'Letra B — PA em crianças',
            detail: 'Aferição de sinais vitais no escopo do técnico.',
            correct: 'Aferir pressão arterial em crianças é atribuição — alternativa correta.',
          },
          {
            label: 'Letra C — peso e altura',
            detail: 'Antropometria na puericultura.',
            correct: 'Aferir dados antropométricos é atribuição do técnico.',
          },
          {
            label: 'Letra D — vacinas',
            detail: 'Aplicação vacinal prevista para o técnico.',
            correct: 'Aplicar vacinas conforme calendário é atribuição — não marca EXCETO.',
          },
        ],
        footer_rule: 'A–D são atribuições; E é do enfermeiro',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'unifil-enfermagem-vias-de-administracao-1778968956139-6': {
    family: 'conceito',
    branch: 'crianca_desenvolvimento',
    guideline: 'IM em crianças <3 anos — locais de aplicação pediátricos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'IM em crianças <3 anos',
        meta: slideMeta,
        items: [
          { label: 'Faixa etária', detail: 'Lactentes e crianças pequenas — músculo em desenvolvimento.', icon: 'Baby' },
          { label: 'Vasto lateral', detail: 'Coxa — local preferencial em lactentes.', icon: 'Syringe' },
          { label: 'Ventroglútea', detail: 'Indicada conforme idade e volume — técnica de localização.', icon: 'Target' },
          { label: 'Pegadinha', detail: '“Todos os locais” ou dorsoglútea/deltoide sem critério.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Prova marca E — todos os locais listados',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: local de IM em crianças menores de 3 anos.',
          'Eliminar A: ventroglútea — válida com técnica.',
          'Eliminar B: dorsoglútea — evitada pelo risco de lesão nervosa.',
          'Eliminar C: vasto lateral — preferencial em lactentes.',
          'Eliminar D: deltoide — volume/idade limitados.',
          'Testar E: todos os locais — gabarito da banca.',
          'Marcar letra E.',
          'Fixação: na prova, E agrupa opções como correta.',
        ],
        footer_rule: 'E = todos os locais (gabarito banca)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Locais IM pediátricos',
        meta: slideMeta,
        content: 'VIAS IM <3 ANOS',
        rows: [
          { label: 'Preferencial', value: 'Vasto lateral da coxa (lactente)', badge: 'ok' },
          { label: 'Ventroglútea', value: 'Possível com localização correta', badge: 'info' },
          { label: 'Deltoide', value: 'Possível conforme volume e idade', badge: 'info' },
          { label: 'Evitar', value: 'Dorsoglútea — risco neurovascular', badge: 'warn' },
        ],
        footer_rule: 'Na banca: E · na prática: vasto lateral',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — IM PEDIÁTRICA',
        items: [
          {
            label: 'Letra A — ventroglútea',
            detail: 'Local válido com técnica de localização.',
            correct: 'Ventroglútea pode ser usada — prova agrupa em “todos os locais”.',
          },
          {
            label: 'Letra B — dorsoglútea',
            detail: 'Historicamente desaconselhada em pediatria.',
            correct: 'Dorsoglútea tem risco — mas gabarito E inclui “todos”.',
          },
          {
            label: 'Letra C — vasto lateral',
            detail: 'Local mais seguro em lactentes.',
            correct: 'Vasto lateral é preferencial — gabarito da questão é E.',
          },
          {
            label: 'Letra D — deltoide',
            detail: 'Volume limitado em <3 anos.',
            correct: 'Deltoide tem restrições — banca marca E como correta.',
          },
        ],
        footer_rule: 'Seguir gabarito E na prova',
      },
    ],
  },

  'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779562730776-3': {
    family: 'protocolo',
    branch: 'crianca_triagem_neonatal',
    guideline: 'Coleta do Teste do Pezinho — lateral do calcanhar (PNTN/MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Coleta do pezinho — alta',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'RN de alta maternidade — coleta antes da saída.', icon: 'Baby' },
          { label: 'Local MS', detail: 'Face lateral da região plantar do calcanhar.', icon: 'Syringe' },
          { label: 'Técnica', detail: 'Assepsia, lanceta, preencher filtro, não usar luva estéril rotineira.', icon: 'Shield' },
          { label: 'Pegadinha', detail: 'Compressa fria, luva estéril obrigatória ou só após degermante exclusivo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Calcanhar lateral — punção capilar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: conduta do TE na coleta do pezinho (MS).',
          'Eliminar A: luvas estéreis — não é rotina; luva de procedimento.',
          'Eliminar B: compressa fria 5 min — não é passo do protocolo.',
          'Eliminar D: lanceta ou agulha 30x8 — lanceta é padrão; alternativa mistura calibres.',
          'Eliminar E: só após degermante — assepsia com álcool etílico é aceita.',
          'Testar C: lateral da região plantar do calcanhar.',
          'Marcar letra C.',
          'Fixação: calcanhar lateral plantar.',
        ],
        footer_rule: 'C = lateral do calcanhar',
      },
      {
        type: 'golden_rule',
        slide_title: 'Pezinho — técnica MS',
        meta: slideMeta,
        content: 'COLETA CAPILAR',
        rows: [
          { label: 'Local', value: 'Lateral plantar do calcanhar', badge: 'hot', emphasis: 'highlight' },
          { label: 'Assepsia', value: 'Álcool etílico — aguardar secar', badge: 'ok' },
          { label: 'Instrumento', value: 'Lanceta estéril descartável', badge: 'ok' },
          { label: 'Luva', value: 'Procedimento — não estéril obrigatória', badge: 'info' },
        ],
        footer_rule: 'Preencher círculos do filtro completamente',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COLETA PEZINHO',
        items: [
          {
            label: 'Letra A — luvas estéreis',
            detail: 'Protocolo usa luva de procedimento.',
            correct: 'Luva estéril não é exigência rotineira na coleta capilar do pezinho.',
          },
          {
            label: 'Letra B — compressa fria',
            detail: 'Não faz parte do procedimento padrão.',
            correct: 'Compressa fria não precede punção — técnica direta após assepsia.',
          },
          {
            label: 'Letra D — agulha hipodérmica 30x8',
            detail: 'Lanceta é instrumento preferencial.',
            correct: 'Punção com lanceta apropriada — não agulha como rotina.',
          },
          {
            label: 'Letra E — só degermante',
            detail: 'Assepsia com álcool etílico é aceita pelo MS.',
            correct: 'Álcool etílico é antissepsia adequada — letra C (local do calcanhar).',
          },
        ],
        footer_rule: 'Local correto = calcanhar lateral',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563784564-5': {
    family: 'conceito',
    branch: 'crianca_generico',
    guideline: 'Notificação compulsória — sífilis congênita no RN (Sinan/MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Notificação no 1º dia de vida',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'RN no 1º dia com doença de notificação compulsória.', icon: 'Baby' },
          { label: 'Sífilis congênita', detail: 'Transmissão vertical — diagnóstico neonatal notificável.', icon: 'AlertTriangle' },
          { label: 'Sinan', detail: 'Sistema de informação de agravos de notificação.', icon: 'FileText' },
          { label: 'Pegadinha', detail: 'Sífilis terciária, gonorreia, HPV ou escabiose no RN.', icon: 'XCircle' },
        ],
        footer_rule: 'RN 1º dia + notificável = sífilis congênita',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: doença de notificação compulsória no 1º dia de vida.',
          'Eliminar A: sífilis terciária — fase tardia em adulto.',
          'Eliminar B: gonorreia — IST, contexto diferente.',
          'Eliminar C: HPV — não diagnóstico típico do 1º dia.',
          'Eliminar E: escabiose — parasitose cutânea.',
          'Testar D: sífilis congênita.',
          'Marcar letra D.',
          'Fixação: vigilância vertical — notificar sífilis no RN.',
        ],
        footer_rule: 'D = sífilis congênita',
      },
      {
        type: 'golden_rule',
        slide_title: 'Notificação neonatal',
        meta: slideMeta,
        content: 'VIGILÂNCIA EPIDEMIOLÓGICA',
        rows: [
          { label: 'Sífilis congênita', value: 'Notificação compulsória imediata', badge: 'hot', emphasis: 'highlight' },
          { label: 'RN', value: 'Diagnóstico no 1º dia exige investigação vertical', badge: 'ok' },
          { label: 'Conduta', value: 'Notificar + tratar mãe/parceiro + RN', badge: 'warn' },
          { label: 'Sinan', value: 'Registro obrigatório na rede pública', badge: 'info' },
        ],
        footer_rule: 'Notificar e tratar par vertical',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NOTIFICAÇÃO RN',
        items: [
          {
            label: 'Letra A — sífilis terciária',
            detail: 'Fase tardia da sífilis adquirida.',
            correct: 'No RN: sífilis congênita — não terciária.',
          },
          {
            label: 'Letra B — gonorreia',
            detail: 'IST notificável, mas não o cenário clássico do 1º dia.',
            correct: 'Gabarito D: sífilis congênita no período neonatal.',
          },
          {
            label: 'Letra C — HPV',
            detail: 'Infecção viral — não diagnóstico típico ao nascer.',
            correct: 'Lista nacional no RN 1º dia: sífilis congênita.',
          },
          {
            label: 'Letra E — escabiose',
            detail: 'Ectoparasitose — notificação diferente.',
            correct: 'Sífilis congênita é notificação compulsória no RN — letra D.',
          },
        ],
        footer_rule: 'Congênita ≠ terciária',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-exames-laboratoriais-1779563621885-2': {
    family: 'conceito',
    branch: 'crianca_dor',
    guideline: 'Glicemia pós-prandial pediátrica — Diretriz SBD 2023',
    sources: [MS_CADERNETA_SOURCE, SBD_DM_SOURCE],
    exam_vs_current:
      'Meta glicêmica pós-prandial pediátrica (SBD 2023: 2 h · <180 mg/dL) — fora do snapshot MS Caderneta.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Glicemia pós-prandial — DM infantil',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Monitorização capilar na UBS — crianças/adolescentes com DM.', icon: 'Activity' },
          { label: 'Pós-prandial', detail: 'Medida após refeição — avalia pico glicêmico.', icon: 'Clock' },
          { label: 'SBD 2023', detail: 'Meta: <180 mg/dL após 2 horas da refeição.', icon: 'Target' },
          { label: 'Pegadinha', detail: '1 hora, 30 min ou 200 mg/dL — distratores próximos.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Pediátrico SBD: 2 h pós-refeição <180 mg/dL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: completar — glicemia pós-prandial normal em crianças (SBD 2023).',
          'Eliminar B: 1 hora ... 200 mg/dL — tempo e valor incorretos.',
          'Eliminar C: 30 minutos ... 180 mg/dL — tempo inadequado.',
          'Eliminar D: 2 horas ... 200 mg/dL — valor acima da meta.',
          'Eliminar E: 1 hora ... 180 mg/dL — tempo incorreto.',
          'Testar A: 2 horas ... 180 mg/dL.',
          'Marcar letra A.',
          'Fixação: 2h + <180 mg/dL.',
        ],
        footer_rule: 'A = 2 horas · 180 mg/dL',
      },
      {
        type: 'golden_rule',
        slide_title: 'Meta glicêmica SBD',
        meta: slideMeta,
        content: 'DM CRIANÇA/ADOLESCENTE',
        rows: [
          { label: 'Pós-prandial', value: '2 horas após refeição', badge: 'hot', emphasis: 'highlight' },
          { label: 'Normal', value: '< 180 mg/dL', badge: 'hot' },
          { label: 'Não usar', value: '1 hora ou 30 min como padrão', badge: 'warn' },
          { label: 'UBS', value: 'Glicemia capilar com técnica e registro', badge: 'info' },
        ],
        footer_rule: '2h + 180 — par SBD pediátrico',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GLICEMIA PÓS-PRANDIAL',
        items: [
          {
            label: 'Letra B — 1 hora · 200 mg/dL',
            detail: 'Tempo e limiar incorretos.',
            correct: 'SBD 2023: 2 horas e <180 mg/dL — não 1h/200.',
          },
          {
            label: 'Letra C — 30 minutos',
            detail: 'Muito precoce para pós-prandial.',
            correct: 'Medida padrão: 2 horas após refeição.',
          },
          {
            label: 'Letra D — 2 horas · 200 mg/dL',
            detail: 'Tempo certo, valor errado.',
            correct: 'Meta pediátrica: menor que 180 mg/dL — não 200.',
          },
          {
            label: 'Letra E — 1 hora · 180 mg/dL',
            detail: 'Valor próximo, tempo errado.',
            correct: 'Gabarito A: 2 horas e 180 mg/dL.',
          },
        ],
        footer_rule: 'Tempo e mg/dL andam juntos na prova',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-urgencias-e-emergencias-1777104083571-1': {
    family: 'protocolo',
    branch: 'crianca_desidratacao',
    guideline: 'Plano B — desidratação moderada na UPA (MS 2023)',
    exam_vs_current:
      'Volumes do Plano B (50–100 mL/kg SRO em 4–6 h) e ondansetrona 4 mg conforme MS 2023 — protocolo de diarreia pediátrica.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Plano B — UPA pediátrica',
        meta: slideMeta,
        items: [
          { label: 'Quadro', detail: '4 anos, diarreia, vômito, sede, mucosas secas — desidratação moderada.', icon: 'Droplets' },
          { label: 'Plano B', detail: 'SRO na unidade — 50–100 mL/kg em 4–6 horas.', icon: 'Hospital' },
          { label: 'Vômitos', detail: 'Ondansetrona 4 mg se vômitos persistentes (protocolo MS).', icon: 'Pill' },
          { label: 'Pegadinha', detail: 'Plano A domiciliar ou hidratação EV imediata (Plano C).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Moderada na UPA = Plano B 50–100 mL/kg',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: conduta MS 2023 — desidratação moderada na UPA (4 anos).',
          'Sinais: irritada, sede, pulso cheio, mucosas levemente secas — Plano B.',
          'Eliminar A: alta com Plano A + jejum 4 h — subtrata moderada.',
          'Eliminar B: só líquidos caseiros em casa — Plano A, não B na UPA.',
          'Eliminar D: gastróclise sem ondansetrona — incompleto vs gabarito.',
          'Eliminar E: reidratação EV 30+70 mL/kg — Plano C (grave).',
          'Testar C: 50–100 mL/kg SRO em 4–6 h + ondansetrona se vômitos + encaminhar se falha.',
          'Marcar letra C.',
        ],
        footer_rule: 'C = Plano B UPA + ondansetrona',
      },
      {
        type: 'golden_rule',
        slide_title: 'Planos A/B/C — MS',
        meta: slideMeta,
        content: 'DESIDRATAÇÃO PEDIÁTRICA',
        rows: [
          { label: 'Plano A', value: 'Sem desidratação — SRO domiciliar', badge: 'ok' },
          { label: 'Plano B', value: 'Moderada — 50–100 mL/kg SRO em 4–6 h na UPA', badge: 'hot', emphasis: 'highlight' },
          { label: 'Vômitos', value: 'Ondansetrona 4 mg se persistentes', badge: 'info' },
          { label: 'Plano C', value: 'Grave — hidratação EV', badge: 'warn' },
        ],
        footer_rule: 'Moderada = ficar na UPA com SRO',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PLANO B',
        items: [
          {
            label: 'Letra A — alta Plano A + jejum',
            detail: 'Conduta de sem desidratação ou leve.',
            correct: 'Desidratação moderada exige Plano B na unidade — não alta imediata.',
          },
          {
            label: 'Letra B — líquidos caseiros em casa',
            detail: 'Plano A domiciliar inadequado para moderada na UPA.',
            correct: 'Na UPA: SRO supervisionado 50–100 mL/kg — gabarito C.',
          },
          {
            label: 'Letra D — gastróclise sem ondansetrona',
            detail: 'Omite antiemético do protocolo quando vômitos persistem.',
            correct: 'MS 2023 inclui ondansetrona 4 mg — alternativa C mais completa.',
          },
          {
            label: 'Letra E — expansão EV 30+70 mL/kg',
            detail: 'Plano C para desidratação grave.',
            correct: 'Pulso cheio e mucosas levemente secas = Plano B — não EV imediata.',
          },
        ],
        footer_rule: 'Moderada ≠ grave — não ir direto ao EV',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const instruction = pack.cleanInstruction
      ? pack.cleanInstruction(raw.question_data.instruction)
      : raw.question_data.instruction;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: { ...raw.question_data, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sc-g08] OK ${slug}`);
  }
  console.log(`[handcraft:sc-g08] total=${ok}`);
}

main();
