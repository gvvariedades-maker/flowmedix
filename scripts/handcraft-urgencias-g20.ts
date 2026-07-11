#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g20 (8 slugs · urgencias_choque · lote 2).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  choqueTypesRows,
  finalizeSlides,
  metaBase,
  perfusaoRows,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasChoqueGolden';

const LOTE = 'urgencias-g20';
const REVIEWER = 'handcraft-urgencias-g20';

const CHOQUE_L3_FOOTER =
  'Choque e hipoperfusão — tipos, sinais periféricos e segurança da cena elétrica';

const SPECS: Record<string, Pack> = {
  'fundatec-enfermagem-processo-de-enfermagem-1780006969552-8': {
    family: 'conceito',
    guideline: 'Choque cardiogênico — falência da bomba: hipotensão, estertores e oligúria',
    roi_error: 'choque_cardiogenico_sinais',
    cluster: 'Tipos de choque — cardiogênico × sinais de congestão',
    danger_footer: 'Gabarito D — hipotensão, estertores e oligúria',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Choque cardiogênico',
        meta: slideMeta,
        items: [
          { label: 'Mecanismo', detail: 'Falência primária da bomba cardíaca — débito cardíaco reduzido.', icon: 'Heart' },
          { label: 'Congestão', detail: 'Estase pulmonar — estertores e dispneia possíveis.', icon: 'Wind' },
          { label: 'Hipoperfusão', detail: 'Hipotensão e oligúria por baixo débito.', icon: 'Droplets' },
          { label: 'Pegadinha — extremidades quentes', detail: 'Pele quente e PA elevada sugerem hiperemia, não cardiogênico.', icon: 'AlertTriangle' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Choque cardiogênico — achados compatíveis:',
          'Eliminar extremidades quentes com PA elevada — não é perfil de baixo débito.',
          'Eliminar hiperglicemia leve isolada — não define choque.',
          'Eliminar saturação normal sem desconforto — ignora congestão pulmonar.',
          'Eliminar aumento do apetite — irrelevante hemodinamicamente.',
          'Hipotensão, estertores pulmonares e débito urinário reduzido — marcar D.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CARDIOGÊNICO — DECORE',
        rows: choqueTypesRows([{ label: 'Cardiogênico', value: 'Bomba falha → congestão + hipoperfusão', badge: 'hot' }]),
        footer_rule: CHOQUE_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006976703-4': {
    family: 'protocolo',
    guideline:
      'Choque séptico refratário — vasopressina associa vasoconstrição não adrenérgica à catecolamina',
    roi_error: 'choque_septico_vasopressina',
    cluster: 'Choque distributivo séptico — vasopressina na vasoplegia',
    danger_footer: 'Gabarito C — vasoconstrição não adrenérgica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Choque séptico refratário',
        meta: slideMeta,
        items: [
          { label: 'Vasoplegia', detail: 'Hipotensão persistente apesar de fluidos e catecolaminas.', icon: 'Activity' },
          { label: 'Hipoperfusão', detail: 'Pele fria, lactato elevado e oligúria — choque distributivo.', icon: 'HeartPulse' },
          { label: 'Vasopressina', detail: 'Agonista V1 — vasoconstrição por via não adrenérgica.', icon: 'Syringe' },
          { label: 'Pegadinha — antibiótico', detail: 'Antimicrobiano trata foco — não é o mecanismo da vasopressina.', icon: 'Ban' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Choque séptico refratário — objetivo da vasopressina associada:',
          'Eliminar reduzir glicemia — controle metabólico, não vasopressor adjuvante.',
          'Eliminar substituir antibiótico — terapia antimicrobiana é paralela.',
          'Eliminar broncodilatação — não é broncodilatador.',
          'Eliminar sedação profunda — não trata vasoplegia.',
          'Potencializar vasoconstrição por mecanismo não adrenérgico — marcar C.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SÉPTICO REFRATÁRIO',
        rows: [
          { label: 'Distributivo', value: 'Vasodilatação + hipoperfusão — choque séptico', badge: 'hot' },
          { label: 'Catecolamina', value: 'Vasopressor adrenérgico de 1ª linha', badge: 'ok' },
          { label: 'Vasopressina', value: 'Adjuvante — via V1 não adrenérgica', badge: 'warn' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712392541-6': {
    family: 'protocolo',
    guideline: 'Hematêmese com hipotensão — choque hipovolêmico: acesso calibroso e cristaloide imediato',
    roi_error: 'hematemese_choque_hipovolemico',
    cluster: 'Hemorragia digestiva — reposição volêmica urgente',
    danger_footer: 'Gabarito A — acesso calibroso + cristaloide',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hematêmese — choque hipovolêmico',
        meta: slideMeta,
        items: [
          { label: 'Quadro', detail: 'Hematêmese com hipotensão — perda volêmica aguda.', icon: 'Droplets' },
          { label: 'Hipovolêmico', detail: 'Menos volume circulante → hipoperfusão tecidual.', icon: 'HeartPulse' },
          { label: 'Conduta', detail: 'Acesso venoso calibroso + cristaloide + monitorização contínua.', icon: 'Syringe' },
          { label: 'Pegadinha — suspender oximetria', detail: 'Monitorização rigorosa inclui saturação e sinais vitais.', icon: 'AlertTriangle' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Hematêmese e hipotensão — conduta de enfermagem:',
          'Eliminar decúbito horizontal rígido sem elevação — posicionamento não substitui volume.',
          'Eliminar evitar sonda nasogástrica sempre — decisão médica; foco é estabilizar choque.',
          'Eliminar suspender oximetria — monitorização é obrigatória no choque.',
          'Eliminar compressão epigástrica manual — não é conduta de reposição volêmica.',
          'Acesso calibroso, cristaloide e checagem frequente de sinais vitais — marcar A.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HEMORRAGIA — CHOQUE',
        rows: [
          { label: '1º', value: 'Acesso venoso calibroso', badge: 'hot' },
          { label: 'Volume', value: 'Cristaloide conforme protocolo institucional', badge: 'ok' },
          { label: 'Monitor', value: 'PA, FC, perfusão e saturação em intervalos curtos', badge: 'warn' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'idib-enfermagem-questoes-mescladas-e-outras-doencas-agudas-1778934918280-2': {
    family: 'conceito',
    guideline: 'Choque distributivo — séptico, anafilático, neurogênico e crise adrenal compartilham vasodilatação',
    roi_error: 'choque_distributivo_tipos',
    cluster: 'Classificação — choque distributivo × outros mecanismos',
    danger_footer: 'Gabarito D — séptico, anafilático, neurogênico e crise adrenal',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Choque distributivo',
        meta: slideMeta,
        items: [
          { label: 'Mecanismo', detail: 'Vasodilatação periférica — PEC reduzida e hipoperfusão.', icon: 'Activity' },
          { label: 'Séptico', detail: 'Vasoplegia mediada por inflamação sistêmica.', icon: 'Flame' },
          { label: 'Neurogênico', detail: 'Perda de tônus simpático após lesão medular.', icon: 'Brain' },
          { label: 'Pegadinha — obstrutivo', detail: 'Tamponamento/TEP são choque obstrutivo, não distributivo.', icon: 'Ban' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Choque distributivo — tipos corretos:',
          'Eliminar A com obstrutivo — mecanismo mecânico, não vasodilatação global.',
          'Eliminar B com hipovolêmico e cardiogênico — outros mecanismos de choque.',
          'Eliminar C misturando cardiogênico e hipovolêmico.',
          'Eliminar E sem séptico e crise adrenal completos.',
          'Séptico, anafilático, neurogênico e crise adrenal — marcar D.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DISTRIBUTIVO — TIPOS',
        rows: [
          { label: 'Distributivo', value: 'Vasodilatação → hipoperfusão relativa', badge: 'hot' },
          { label: 'Inclui', value: 'Séptico · anafilático · neurogênico · adrenal', badge: 'ok' },
          { label: '≠', value: 'Hipovolêmico · cardiogênico · obstrutivo', badge: 'warn' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934936220-0': {
    family: 'protocolo',
    guideline: 'IRA grave — dispneia, musculatura acessória, tiragem e cianose são sinais de gravidade',
    roi_error: 'ira_gravidade_sinais',
    cluster: 'IRA aguda — sinais de gravidade respiratória',
    danger_footer: 'Gabarito B — dispneia, acessória, tiragem e cianose',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'IRA — sinais de gravidade',
        meta: slideMeta,
        items: [
          { label: 'IRA aguda', detail: 'Falha respiratória — risco de hipóxia e choque hipoxêmico.', icon: 'Wind' },
          { label: 'Esforço', detail: 'Musculatura acessória, fúrcula e batimento de asa nasal.', icon: 'Activity' },
          { label: 'Cianose', detail: 'Hipoperfusão e dessaturação — gravidade iminente.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — alopécia', detail: 'Sinal não respiratório — distrator em prova.', icon: 'Ban' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'IRA aguda — sinais de gravidade:',
          'Eliminar dislalia e hiperêmese — não núcleo respiratório agudo.',
          'Eliminar priaprismo e baqueteamento — outros contextos clínicos.',
          'Eliminar alopécia na lista — distrator sem valor semiológico respiratório.',
          'Dispneia, musculatura acessória, tiragem e cianose — marcar B.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IRA — GRAVIDADE',
        rows: [
          { label: 'Resp', value: 'Dispneia + uso de acessórios + tiragem', badge: 'hot' },
          { label: 'Oxigenação', value: 'Cianose — hipóxia grave', badge: 'warn' },
          { label: 'Choque', value: 'Hipóxia prolongada → hipoperfusão e colapso', badge: 'info' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104083571-5': {
    family: 'protocolo',
    guideline: 'Choque elétrico — desligar fonte de corrente como primeira ação do socorrista',
    roi_error: 'choque_eletrico_desligar_fonte',
    cluster: 'Choque elétrico — interromper corrente',
    danger_footer: 'Gabarito A — desligar fonte elétrica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Choque elétrico — 1ª ação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Primeira ação do socorrista em acidente elétrico.', icon: 'Zap' },
          { label: 'Desligar fonte', detail: 'Interromper corrente elétrica antes de qualquer contato.', icon: 'Power' },
          { label: 'Segurança', detail: 'Evitar segunda vítima — não puxar pelo corpo energizado.', icon: 'Shield' },
          { label: 'Pegadinha — puxar vítima', detail: 'Retirar pelo contato conduz eletricidade ao socorrista.', icon: 'AlertTriangle' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Acidente com choque elétrico — primeira ação:',
          'Eliminar avaliar queimaduras antes — vem após cena segura.',
          'Eliminar massagem e boca a boca imediatos — após desenergizar.',
          'Eliminar puxar vítima do contato — transmite corrente.',
          'Desligar a fonte de corrente elétrica — marcar A.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ELÉTRICO — 1ª AÇÃO',
        rows: [
          { label: '1º', value: 'Desligar fonte / interromper corrente', badge: 'hot' },
          { label: '2º', value: 'Checar consciência e respiração', badge: 'ok' },
          { label: '3º', value: 'Suporte básico e acionar 192', badge: 'info' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CHOQUE ELÉTRICO',
        items: [
          {
            label: 'Letra B — avaliar queimaduras',
            detail: 'Parece priorizar lesão visível logo no início.',
            correct: 'Queimaduras são avaliadas depois de desenergizar a cena.',
          },
          {
            label: 'Pegadinha — puxar vítima',
            detail: 'Retirar rapidamente pelo contato parece salvar tempo.',
            correct: 'Puxar pelo corpo energizado eletrocuta o socorrista — desligar fonte primeiro.',
          },
          {
            label: 'Letra C — RCP imediata',
            detail: 'Sem respiração, candidato inicia compressões de imediato.',
            correct: 'RCP só após interromper corrente elétrica e garantir segurança.',
          },
        ],
        footer_rule: 'Desligar corrente → depois socorrer',
      },
    ],
  },
  'instituto-verbena-enfermagem-semiologia-em-enfermagem-1779563531989-5': {
    family: 'conceito',
    guideline: 'Intoxicação por organofosforado — síndrome colinérgica: miose, bradicardia, hipertensão e sialorreia',
    roi_error: 'organofosforado_sindrome_colinergica',
    cluster: 'Intoxicação — semiologia colinérgica e hipoperfusão',
    danger_footer: 'Gabarito A — miose, bradicardia, hipertensão e sialorreia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Organofosforado — colinérgico',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Trabalhador rural — intoxicação por organofosforado na UPA.', icon: 'Skull' },
          { label: 'Miose', detail: 'Pupilas contraídas — excesso de acetilcolina.', icon: 'Eye' },
          { label: 'Bradicardia', detail: 'Efeito parassimpático — frequência cardíaca reduzida no caso.', icon: 'Heart' },
          { label: 'Pegadinha — midríase', detail: 'Midríase é anticolinérgico — oposto ao organofosforado.', icon: 'Ban' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Organofosforado — termos técnicos corretos no prontuário:',
          'Eliminar anisocoria e taquicardia — não descrevem o caso.',
          'Eliminar midríase — pupilas dilatadas, não contraídas.',
          'Eliminar isocoria com hipotensão — PA estava elevada no caso clínico.',
          'Miose, bradicardia, hipertensão e sialorreia — marcar A.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COLINÉRGICO — DECORE',
        rows: [
          { label: 'Miose', value: 'Pupilas puntiformes', badge: 'hot' },
          { label: 'Bradicardia', value: 'FC < 60 — parassimpático', badge: 'warn' },
          { label: 'Sialorreia', value: 'Salivação excessiva — hipersecreção', badge: 'ok' },
          { label: 'Choque', value: 'Bradicardia grave pode evoluir para hipoperfusão', badge: 'info' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ORGANOFOSFORADO',
        items: [
          {
            label: 'Letra B — anisocoria e taquicardia',
            detail: 'Pupilas assimétricas e FC elevada não descrevem o caso.',
            correct: 'Miose bilateral e bradicardia — gabarito A.',
          },
          {
            label: 'Pegadinha — midríase',
            detail: 'Pupilas dilatadas sugerem síndrome anticolinérgica.',
            correct: 'Organofosforado causa miose — pupilas contraídas, não midríase.',
          },
          {
            label: 'Letra D — hipotensão e taquicardia',
            detail: 'PA baixa e FC alta não batem com hipertensão e bradicardia do caso.',
            correct: 'Prontuário: miose, bradicardia, hipertensão e sialorreia — letra A.',
          },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
    ],
  },
  'quadrix-enfermagem-semiologia-em-enfermagem-1779563537258-8': {
    family: 'conceito',
    guideline: 'Hemorragia/choque hipovolêmico — pele fria, pulso fraco e confusão; hipertensão inicial não é típica',
    roi_error: 'hemorragia_sinais_choque',
    cluster: 'Semiologia — sinais de hemorragia e hipoperfusão',
    danger_footer: 'Gabarito D — itens II, III e IV',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hemorragia — sinais clínicos',
        meta: slideMeta,
        items: [
          { label: 'Hemorragia', detail: 'Perda sanguínea → choque hipovolêmico progressivo.', icon: 'Droplets' },
          { label: 'Pele fria', detail: 'Vasoconstrição periférica — item II.', icon: 'Thermometer' },
          { label: 'Pulso fraco', detail: 'Taquicardia com amplitude reduzida — item III.', icon: 'HeartPulse' },
          { label: 'Pegadinha — PA alta', detail: 'Item I: hipertensão não é sinal típico de hemorragia aguda.', icon: 'AlertTriangle' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Sinais de hemorragia — combinação correta:',
          'Item I — aumento da PA: eliminar (hipotensão aparece na evolução do choque).',
          'Item II — pele fria: manter.',
          'Item III — pulso rápido e fraco: manter.',
          'Item IV — confusão ou desmaio: manter (hipoperfusão cerebral).',
          'Apenas II, III e IV — marcar D.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HEMORRAGIA — SINAIS',
        rows: perfusaoRows([
          { label: 'Neuro', value: 'Confusão ou síncope — hipoperfusão cerebral', badge: 'warn' },
          { label: '≠ PA alta', value: 'Hipertensão não caracteriza hemorragia aguda', badge: 'info' },
        ]),
        footer_rule: CHOQUE_L3_FOOTER,
      },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'fundatec-enfermagem-processo-de-enfermagem-1780006969552-8': {
    A: 'Extremidades quentes e PA elevada não compõem perfil de baixo débito cardiogênico.',
    B: 'Hiperglicemia leve isolada não define choque cardiogênico.',
    C: 'Saturação normal sem desconforto ignora congestão pulmonar do cardiogênico.',
    E: 'Aumento do apetite não é manifestação hemodinâmica de choque.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006976703-4': {
    A: 'Controle glicêmico não é o mecanismo da vasopressina no choque séptico.',
    B: 'Antibiótico trata foco infeccioso — não substitui o papel vasopressor adjuvante.',
    D: 'Vasopressina não é broncodilatador.',
    E: 'Sedação profunda não reverte vasoplegia refratária.',
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712392541-6': {
    B: 'Decúbito horizontal isolado não repõe volume no choque hipovolêmico.',
    C: 'SNG é decisão médica — prioridade é acesso e cristaloide.',
    D: 'Oximetria é essencial na monitorização do choque hemorrágico.',
    E: 'Compressão epigástrica não substitui reposição volêmica.',
  },
  'idib-enfermagem-questoes-mescladas-e-outras-doencas-agudas-1778934918280-2': {
    A: 'Obstrutivo é mecanismo mecânico — não choque distributivo.',
    B: 'Hipovolêmico e cardiogênico pertencem a outras categorias.',
    C: 'Mistura cardiogênico e hipovolêmico com distributivo.',
    E: 'Lista incompleta — falta séptico e crise adrenal do distributivo.',
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934936220-0': {
    A: 'Dislalia e hiperêmese não são núcleo dos sinais respiratórios graves.',
    C: 'Priaprismo e baqueteamento pertencem a outros contextos clínicos.',
    D: 'Alopécia é distrator — não sinal de gravidade na IRA.',
  },
  'quadrix-enfermagem-semiologia-em-enfermagem-1779563537258-8': {
    A: 'Inclui item I (PA alta) — não típico de hemorragia aguda.',
    B: 'Mantém item I incorretamente junto com II e IV.',
    C: 'Mantém item I (hipertensão) que deve ser excluído.',
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const slides = finalizeSlides(slug, raw, pack, DANGER_OVERRIDES);
    const out = {
      meta: metaBase(raw, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER),
      question_data: raw.question_data,
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g20] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g20] total=${ok}`);
}

main();
