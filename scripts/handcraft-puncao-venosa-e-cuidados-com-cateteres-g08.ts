#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — puncao-venosa-e-cuidados-com-cateteres-g08 (8 slugs cauda puncao_generico).
 *
 *   npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g08
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildPuncaoGuidelineSnapshot,
  buildPuncaoSourcesForSlug,
} from '@/lib/catalogMigration/puncaoPedagogy';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g08';
const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const BRANCH = 'puncao_generico';
const REVIEWED = '2026-07-12';

function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\bpararealização\b/gi, 'para realização')
    .replace(/\bestáinternado\b/gi, 'está internado')
    .replace(/\burinado\b/gi, 'urina do')
    .replace(/\bsegundorecomendações\b/gi, 'segundo recomendações')
    .replace(/\bextensãocom\b/gi, 'extensão com')
    .replace(/\bresidual,elevar\b/gi, 'residual, elevar')
    .replace(/\brecomendado,prescrito\b/gi, 'recomendado, prescrito')
    .replace(/([.!?])([A-Za-zÀ-ú])/g, '$1 $2');
}

function cleanQuestionData(qd: Q['question_data']): Q['question_data'] {
  return {
    ...qd,
    instruction: cleanPdfArtifacts(qd.instruction),
    options: qd.options.map((o) => ({ ...o, text: cleanPdfArtifacts(o.text) })),
  };
}

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'calc' | 'certo_errado';
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  const corpus = `${q.question_data.instruction} ${q.question_data.options.map((o) => o.text).join(' ')} ${JSON.stringify(pack.slides)}`;
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: BRANCH,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: buildPuncaoGuidelineSnapshot(corpus, pack.guideline),
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: buildPuncaoSourcesForSlug(corpus),
  };
}

const SPECS: Record<string, Pack> = {
  'igeduc-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562677534-9': {
    family: 'certo_errado',
    guideline: 'Extravasamento de quimioterápico — suspender infusão, aspirar, elevar membro, compressa e antídoto conforme protocolo',
    roi_error: 'ce_extravasamento_quimio',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Extravasamento — quimioterápico',
        chip_label: 'PROTOCOLO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Julgar conduta em extravasamento de drogas antineoplásicas — suspender, aspirar, elevar membro, compressa e antídoto.',
            icon: 'Target',
          },
          {
            label: 'Primeiro passo',
            detail: 'Suspender imediatamente a infusão do quimioterápico — interromper exposição.',
            icon: 'Ban',
          },
          {
            label: 'Aspiração',
            detail: 'Aspirar medicação residual no sítio — reduzir volume no tecido.',
            icon: 'Syringe',
          },
          {
            label: 'Membro e compressa',
            detail: 'Elevar o membro e aplicar compressa conforme protocolo da droga extravasada.',
            icon: 'Bandage',
          },
          {
            label: 'Antídoto',
            detail: 'Aplicar antídoto prescrito ou autorizado pelo protocolo institucional.',
            icon: 'Shield',
          },
        ],
        footer_rule: 'Extravasamento = parar infusão + protocolo específico da droga.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Sequência no extravasamento',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: '1. Parar', value: 'Suspender infusão do antineoplásico imediatamente.', badge: 'hot' },
          { label: '2. Aspirar', value: 'Retirar medicação residual no acesso.', badge: 'ok' },
          { label: '3. Posicionar', value: 'Elevar membro + compressa conforme a droga.', badge: 'ok' },
          { label: '4. Antídoto', value: 'Conforme prescrição ou protocolo da instituição.', badge: 'warn' },
        ],
        footer_rule: 'Cada quimioterápico tem antídoto e compressa específicos.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Julgar o item',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: julgar conduta no extravasamento de antineoplásicos.',
          'Suspender infusão imediatamente — conduta correta.',
          'Aspirar residual, elevar membro, compressa e antídoto por protocolo — alinhado à prática segura.',
          'Afirmativa global verdadeira.',
          'Marcar Certo — alternativa A.',
        ],
        footer_rule: 'Não retomar infusão sem avaliar extensão do extravasamento.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Se marcar Errado',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — EXTRAVASAMENTO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Manter infusão',
            detail: 'Continuar quimioterápico após extravasamento — agrava necrose tecidual.',
            correct: 'Primeiro passo é suspender a infusão imediatamente.',
          },
          {
            label: 'Omitir antídoto',
            detail: 'Tratar só com gelo ou compressa genérica sem protocolo da droga.',
            correct: 'Antídoto específico faz parte da conduta quando indicado.',
          },
          {
            label: 'Não elevar membro',
            detail: 'Deixar membro pendente após extravasamento vesicante.',
            correct: 'Elevação e compressa seguem protocolo — item descreve corretamente.',
          },
        ],
        footer_rule: 'Certo — sequência suspender → aspirar → elevar → antídoto.',
      },
    ],
  },

  'instituto-access-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340254185-6': {
    family: 'conceito',
    guideline: 'Hemodiálise — acesso vascular por fístula/shunt arteriovenoso; Tenckhoff é diálise peritoneal',
    roi_error: 'confundir_shunt_hd_tenckhoff',
    exam_vs_current: 'grafia_shilley_shunt_prova',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Acesso em hemodiálise',
        chip_label: 'DISPOSITIVO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Falência renal — hemodiálise, diálise peritoneal ou transplante. Dispositivo para realização de hemodiálise.',
            icon: 'Target',
          },
          {
            label: 'Fístula / shunt AV',
            detail: 'Acesso vascular nativo ou protético para hemodiálise — punção repetida na sessão.',
            icon: 'Activity',
          },
          {
            label: 'Tenckhoff',
            detail: 'Cateter intraperitoneal — diálise peritoneal, não hemodiálise.',
            icon: 'XCircle',
          },
          {
            label: 'Dobbhoff',
            detail: 'Sonda enteral de nutrição — via digestiva, não renal.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha',
            detail: 'Banca grafou “Shilley/Hubber” — reconhecer shunt arteriovenoso de HD.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'HD = shunt/fístula AV · DP = Tenckhoff.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Dispositivos — renal',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Hemodiálise', value: 'Fístula ou shunt arteriovenoso — acesso à máquina.', badge: 'hot' },
          { label: 'Diálise peritoneal', value: 'Cateter de Tenckhoff no peritônio.', badge: 'info' },
          { label: 'Dobbhoff', value: 'Nutrição enteral — não confundir com acesso dialítico.', badge: 'warn' },
        ],
        footer_rule: 'Tipo de diálise define o dispositivo.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Identificar o dispositivo',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: dispositivo instalado para hemodiálise.',
          'Eliminar D — Tenckhoff é cateter peritoneal (diálise peritoneal).',
          'Eliminar C — Dobbhoff é sonda enteral.',
          'Eliminar A — Hubber não é termo de acesso dialítico.',
          'Letra B: “Shilley” = grafia da banca para shunt/fístula de hemodiálise.',
          'Marcar letra B.',
        ],
        footer_rule: 'Na prova, shunt AV = acesso de hemodiálise.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Confusão de cateteres',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — ACESSO DIALÍTICO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra D — Tenckhoff',
            detail: 'Cateter clássico de diálise peritoneal no abdome.',
            correct: 'Não serve para hemodiálise extracorpórea.',
          },
          {
            label: 'Letra C — Dobbhoff',
            detail: 'Sonda fina para nutrição enteral.',
            correct: 'Sem relação com falência renal dialítica.',
          },
          {
            label: 'Letra A — Hubber',
            detail: 'Nome inventado ou distorcido — distrator fonético.',
            correct: 'B (shunt/shilley) fecha o acesso de HD.',
          },
        ],
        footer_rule: 'Hemodiálise exige acesso arterial-venoso para a máquina.',
      },
    ],
  },

  'instituto-access-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562693149-5': {
    family: 'conceito',
    guideline: 'Diálise peritoneal — cateter de Tenckhoff; shunt arteriovenoso é hemodiálise',
    roi_error: 'confundir_tenckhoff_shunt',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Diálise peritoneal — cateter',
        chip_label: 'DISPOSITIVO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Diálise peritoneal substitui função renal — exige colocação de cateter.',
            icon: 'Target',
          },
          {
            label: 'Tenckhoff',
            detail: 'Cateter intraperitoneal permanente — técnica de diálise peritoneal.',
            icon: 'CheckCircle',
          },
          {
            label: 'Shunt / Shilley',
            detail: 'Acesso arteriovenoso para hemodiálise — não é peritoneal.',
            icon: 'XCircle',
          },
          {
            label: 'Dobbhoff / Levine',
            detail: 'Sondas enterais — nutrição ou descompressão gástrica.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Peritoneal = Tenckhoff no abdome.',
      },
      {
        type: 'golden_rule',
        slide_title: 'DP × HD',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Diálise peritoneal', value: 'Cateter de Tenckhoff — dialisato no peritônio.', badge: 'hot' },
          { label: 'Hemodiálise', value: 'Fístula ou shunt AV — sangue na máquina.', badge: 'info' },
          { label: 'Enteral', value: 'Dobbhoff/Levine — via digestiva.', badge: 'warn' },
        ],
        footer_rule: 'Memorize o par técnica × cateter.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Achar o cateter correto',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: cateter na diálise peritoneal.',
          'Eliminar D — Shilley/shunt é hemodiálise.',
          'Eliminar A — Dobbhoff é enteral.',
          'Eliminar C — Levine é sonda gástrica.',
          'Letra B: Tenckhoff — padrão-ouro de cateter peritoneal.',
          'Marcar letra B.',
        ],
        footer_rule: 'Tenckhoff = nome que a banca cobra para DP.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Trocar técnica dialítica',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — CATETER PERITONEAL',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra D — Shilley',
            detail: 'Acesso vascular para máquina de hemodiálise.',
            correct: 'Peritoneal usa cateter abdominal, não fistula AV.',
          },
          {
            label: 'Letra A — Dobbhoff',
            detail: 'Nutrição enteral por via nasal.',
            correct: 'Não substitui função renal.',
          },
          {
            label: 'Letra C — Levine',
            detail: 'Sonda gástrica de descompressão/alimentação.',
            correct: 'Só B (Tenckhoff) fecha diálise peritoneal.',
          },
        ],
        footer_rule: 'DP = líquido no peritônio via Tenckhoff.',
      },
    ],
  },

  'instituto-aocp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562705224-2': {
    family: 'protocolo',
    guideline: 'Fístula/shunt arteriovenoso — compressão hemostática após punção; não garrotear, não aferir PA no membro',
    roi_error: 'conduta_incorreta_fistula_av',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Fístula AV — cuidados',
        chip_label: 'PROTOCOLO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Paciente com DRC portador de shunt ou fístula arteriovenosa — conduta adequada.',
            icon: 'Target',
          },
          {
            label: 'Compressão pós-punção',
            detail: 'Hemostasia adequada após acesso na fístula — técnica correta.',
            icon: 'CheckCircle',
          },
          {
            label: 'Não garrotear',
            detail: 'Curativo circunferencial que comprime o shunt compromete o acesso.',
            icon: 'Ban',
          },
          {
            label: 'Membro com shunt',
            detail: 'Não aferir PA nem punir venosa de rotina no braço da fístula.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Posição',
            detail: 'Manter membro “sempre para baixo” não é conduta padrão de proteção.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Fístula = vaso precioso — proteger fluxo e punção.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Regras da fístula AV',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Após punção', value: 'Compressão adequada para hemostasia.', badge: 'hot' },
          { label: 'Proibido', value: 'Garrotear, manguito de PA, punção venosa de rotina no membro.', badge: 'warn' },
          { label: 'ATB EV', value: 'Não usar fístula como via preferencial de antimicrobiano.', badge: 'info' },
        ],
        footer_rule: 'Um único braço viável para diálise — preserve-o.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Escolher a conduta',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: conduta adequada com shunt ou fístula arteriovenosa.',
          'Eliminar A — curativo que garroteia compromete fluxo.',
          'Eliminar B — membro sempre para baixo não é regra de cuidado.',
          'Eliminar D — não aferir PA no membro da fístula.',
          'Eliminar E — fístula não é via preferencial para antimicrobianos.',
          'Letra C: compressão adequada após punção para hemostasia.',
          'Marcar letra C.',
        ],
        footer_rule: 'Hemostasia sem obstruir a fístula.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Erros no membro da fístula',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — SHUNT AV',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Garrotear',
            detail: 'Curativo circunferencial apertado pode trombosar a fístula.',
            correct: 'Compressão localizada, não torniquete circunferencial.',
          },
          {
            label: 'Letra D — PA no membro',
            detail: 'Manguito comprime o shunt e prejudica maturação/uso.',
            correct: 'Aferir PA no membro contralateral.',
          },
          {
            label: 'Letra E — Via para ATB',
            detail: 'Fístula é exclusiva para hemodiálise — não abusar com medicações.',
            correct: 'C descreve cuidado pós-punção correto.',
          },
        ],
        footer_rule: 'Proteger fístula > conveniência de acesso venoso.',
      },
    ],
  },

  'iset-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340213288-8': {
    family: 'protocolo',
    guideline: 'Desidratação grave — reposição volêmica com cristaloide isotônico EV em acesso venoso',
    roi_error: 'desidratação_sem_reposicao_ev',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Desidratação grave — conduta',
        chip_label: 'PROTOCOLO',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário',
            detail: 'Idoso com mucosas secas, PA baixa, taquicardia, oligúria — diarreia persistente.',
            icon: 'User',
          },
          {
            label: 'Gravidade',
            detail: 'Desidratação grave exige reposição rápida — via oral isolada não basta.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Acesso venoso',
            detail: 'Infusão intravenosa de fluidos isotônicos — SF ou Ringer conforme prescrição.',
            icon: 'Droplets',
          },
          {
            label: 'Monitorar',
            detail: 'PA, FC, diurese e perfusão durante a reposição.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha',
            detail: 'Antibiótico, antidiarreico ou só glicose não substituem volume.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Volume primeiro — antibiótico e dieta depois.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Reposição na desidratação',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Conduta inicial', value: 'Cristaloide isotônico EV — repor perdas.', badge: 'hot' },
          { label: 'Oral', value: 'Insuficiente na desidratação grave com choque iminente.', badge: 'warn' },
          { label: 'Glicose isolada', value: 'Não repõe sódio/ volume — não é primeira linha.', badge: 'warn' },
        ],
        footer_rule: 'Isotônico EV = resposta à hipovolemia grave.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Conduta inicial',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Cenário: desidratação grave — mucosas secas, hipotensão, taquicardia, oligúria.',
          'Eliminar A — líquidos orais não são conduta inicial na gravidade.',
          'Eliminar B — antibiótico não trata hipovolemia primeiro.',
          'Eliminar C — antidiarreico não repõe volume perdido.',
          'Eliminar D — glicose IV isolada não é reposição isotônica de choque.',
          'Letra E: infusão intravenosa de fluidos isotônicos.',
          'Marcar letra E.',
        ],
        footer_rule: 'Punção venosa viabiliza reposição rápida.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Prioridades erradas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — DESIDRATAÇÃO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Só oral',
            detail: 'Paciente grave com oligúria — absorção e tolerância limitadas.',
            correct: 'Acesso venoso para cristaloide isotônico é prioridade.',
          },
          {
            label: 'Letra B — Antibiótico',
            detail: 'Diarreia infecciosa pode precisar ATB, mas não antes do volume.',
            correct: 'Estabilizar hemodinâmica com fluidos primeiro.',
          },
          {
            label: 'Letra D — Glicose',
            detail: 'SG não expande volume como SF/Ringer lactato.',
            correct: 'E descreve reposição isotônica adequada.',
          },
        ],
        footer_rule: 'Hipovolemia grave = fluido isotônico EV.',
      },
    ],
  },

  'objetiva-concursos-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340270805-1': {
    family: 'conceito',
    guideline: 'Lock de cateter periférico — extensão com conector; salinização ou heparinização entre usos',
    roi_error: 'confundir_lock_salinizado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Acesso salinizado — lock',
        chip_label: 'MANUTENÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Sem fluido contínuo, mas acesso necessário para medicamentos — extensão com conector, soro descontinuado.',
            icon: 'Target',
          },
          {
            label: 'Lock / salinizado',
            detail: 'Cateter periférico mantido patente com SF ou heparina entre administrações.',
            icon: 'Syringe',
          },
          {
            label: 'Extensão',
            detail: 'Tubo com conector para seringa — facilita bolus intermitente.',
            icon: 'Link',
          },
          {
            label: 'Pegadinha',
            detail: '“Central em bolo”, “obstruído” ou “calibroso de urgência” — termos incorretos.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Descontinuou soro + manteve acesso = lock salinizado/heparinizado.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Manutenção do periférico',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Lock', value: 'SF ou heparina no lúmen — patência entre usos.', badge: 'hot' },
          { label: 'Extensão', value: 'Conector para seringa — medicamentos intermitentes.', badge: 'ok' },
          { label: 'Não é', value: 'Infusão contínua nem cateter central de rotina.', badge: 'warn' },
        ],
        footer_rule: 'Salinizado/heparinizado = nomenclatura clássica de prova.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Nomear o acesso',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Cenário: paciente sem necessidade de fluido EV contínuo, mas com medicações intermitentes.',
          'Extensão com conector presa ao cateter — soro desligado.',
          'Eliminar A — “central em bolo” não descreve periférico lock.',
          'Eliminar B — acesso não está obstruído; está mantido patente.',
          'Eliminar D — “calibroso de urgência” não é termo técnico deste cuidado.',
          'Letra C: periférico salinizado ou heparinizado.',
          'Marcar letra C.',
        ],
        footer_rule: 'Lock preserva cateter entre doses.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Termos incorretos',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — LOCK',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Central em bolo',
            detail: 'Mistura via central com técnica de lock periférico.',
            correct: 'Enunciado descreve cateter periférico com extensão.',
          },
          {
            label: 'Letra B — Obstruído',
            detail: 'Lock visa evitar obstrução — não é diagnóstico do acesso.',
            correct: 'Acesso está mantido propositalmente patente.',
          },
          {
            label: 'Letra D — Calibroso urgência',
            detail: 'Termo inventado — distrator sem base técnica.',
            correct: 'C é a nomenclatura correta na prova.',
          },
        ],
        footer_rule: 'Salinizado/heparinizado = lock do periférico.',
      },
    ],
  },

  'quadrix-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340280693-1': {
    family: 'conceito',
    guideline: 'Piúria — urina turva com presença de pus; distinto de hematúria, disúria e oligúria',
    roi_error: 'confundir_piuria_hematuria',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Terminologia urinária',
        chip_label: 'CONCEITO',
        meta: slideMeta,
        items: [
          {
            label: 'Caso',
            detail: 'Urina turva com pus na bolsa coletora da sonda vesical de demora.',
            icon: 'Target',
          },
          {
            label: 'Piúria',
            detail: 'Presença de pus na urina — infecção/inflamação do trato urinário.',
            icon: 'Droplets',
          },
          {
            label: 'Hematúria',
            detail: 'Sangue na urina — cor vermelha/rosa, não “pus”.',
            icon: 'XCircle',
          },
          {
            label: 'Disúria',
            detail: 'Dor ou ardor ao urinar — sintoma, não descrição do aspecto.',
            icon: 'Ban',
          },
          {
            label: 'Anúria / poliúria',
            detail: 'Volume urinário — não descreve turvação por pus.',
            icon: 'Gauge',
          },
        ],
        footer_rule: 'Turva + pus = piúria.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore — termos',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Piúria', value: 'Pus na urina — aspecto turvo.', badge: 'hot' },
          { label: 'Hematúria', value: 'Sangue — hemácias na urina.', badge: 'warn' },
          { label: 'Disúria', value: 'Dor ao urinar.', badge: 'info' },
          { label: 'Anúria', value: 'Ausência ou volume mínimo de diurese.', badge: 'info' },
        ],
        footer_rule: 'Aspecto (turvo/pus) ≠ sintoma (disúria) ≠ volume (anúria).',
      },
      {
        type: 'logic_flow',
        slide_title: 'Nomear o achado',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Caso: urina turva com pus na bolsa coletora.',
          'Eliminar A — anúria é ausência de diurese.',
          'Eliminar B — poliúria é volume aumentado.',
          'Eliminar C — hematúria é sangue, não pus.',
          'Eliminar E — disúria é dor ao urinar.',
          'Letra D: piúria — pus na urina.',
          'Marcar letra D.',
        ],
        footer_rule: 'ITU com cateter pode cursar com piúria.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Trocar termos',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — URINA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra C — Hematúria',
            detail: 'Sangue deixa urina rosada/vermelha — não “pus”.',
            correct: 'Turva com pus = piúria.',
          },
          {
            label: 'Letra E — Disúria',
            detail: 'Sintoma subjetivo — enunciado descreve aspecto macroscópico.',
            correct: 'Piúria é o termo para pus na urina.',
          },
          {
            label: 'Letra A — Anúria',
            detail: 'Paciente com diurese na bolsa — não é ausência de urina.',
            correct: 'D fecha o achado turvo com pus.',
          },
        ],
        footer_rule: 'Piúria alerta para ITU — registrar e comunicar.',
      },
    ],
  },

  'unifil-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340232037-6': {
    family: 'vf',
    guideline: 'ITU-AC ANVISA 2017 — sem ATB profilático rotineiro; esvaziar bolsa coletora com técnica asséptica',
    roi_error: 'vf_itu_ac_anvisa_2017',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ITU-AC — prevenção ANVISA',
        chip_label: 'PROTOCOLO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Prevenção de ITU associada a cateter vesical (ITU-AC) — julgar I a IV (ANVISA 2017).',
            icon: 'Target',
          },
          {
            label: 'I — ATB profilático',
            detail: 'Uso rotineiro de antimicrobiano sistêmico profilático — FALSO.',
            icon: 'XCircle',
          },
          {
            label: 'II — Irrigação vesical',
            detail: 'Irrigação contínua com antimicrobianos de rotina — FALSO.',
            icon: 'XCircle',
          },
          {
            label: 'III — Bacteriúria assintomática',
            detail: 'Monitorização regular de bacteriúria assintomática — FALSO (não rastrear de rotina).',
            icon: 'XCircle',
          },
          {
            label: 'IV — Bolsa coletora',
            detail: 'Esvaziar regularmente com recipiente individual — sem contato do tubo — VERDADEIRO.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: 'Menos invasão + menos ATB de rotina + técnica na drenagem.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Medidas ITU-AC',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Não fazer', value: 'ATB profilático sistêmico de rotina.', badge: 'warn' },
          { label: 'Não fazer', value: 'Irrigação vesical contínua com ATB.', badge: 'warn' },
          { label: 'Não fazer', value: 'Rastrear bacteriúria assintomática regularmente.', badge: 'warn' },
          { label: 'Fazer', value: 'Esvaziar bolsa com recipiente individual — técnica fechada.', badge: 'hot' },
        ],
        footer_rule: 'Sequência I–IV: F – F – F – V.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Montar a sequência',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Item I: antimicrobiano profilático rotineiro — Falso.',
          'Item II: irrigação vesical contínua com ATB — Falso.',
          'Item III: monitorizar bacteriúria assintomática — Falso.',
          'Item IV: esvaziar bolsa regularmente sem contaminar tubo — Verdadeiro.',
          'Sequência I-II-III-IV: F – F – F – V.',
          'Marcar letra E.',
        ],
        footer_rule: 'Só IV é medida de rotina recomendada na lista.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Sequências incorretas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — ITU-AC V/F',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — V-F-F-V',
            detail: 'Aceita ATB profilático rotineiro (I verdadeiro).',
            correct: 'I é falso — antimicrobiano profilático não é recomendado de rotina.',
          },
          {
            label: 'Letra C — F-F-V-F',
            detail: 'Trata monitorização de bacteriúria assintomática como correta (III verdadeiro).',
            correct: 'III é falso — não rastrear assintomáticos de rotina.',
          },
          {
            label: 'Letra B — F-V-V-V',
            detail: 'Valida irrigação vesical contínua com ATB (II verdadeiro).',
            correct: 'II é falso — irrigação profilática não é rotina.',
          },
        ],
        footer_rule: 'F-F-F-V só na letra E.',
      },
    ],
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: cleanQuestionData(raw.question_data),
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:puncao-g08] OK ${slug}`);
  }
  console.log(`[handcraft:puncao-g08] total=${ok}`);
}

main();
