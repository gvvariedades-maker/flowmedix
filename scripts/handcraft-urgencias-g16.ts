#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g16 (6 slugs · urgencias_avc_iam · lote final 23/23).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  cincinnatiRows,
  finalizeSlides,
  iamSinaisRows,
  metaBase,
  MS_AVC_SOURCE,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasAvcGolden';

const LOTE = 'urgencias-g16';
const REVIEWER = 'handcraft-urgencias-g16';

const SAMU_IAM_SOURCE = {
  id: 'urgencias-iam-samu-o2-2016',
  tier: 'A' as const,
  issuer: 'SAMU / MS',
  title: 'Protocolo de Intervenção SAMU 192 — IAM (oxigenoterapia)',
  year: 2016,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_suporte_basico_vida.pdf',
  covers: [
    'Oxigênio em IAM se dispneia ou saturação inferior a 94%',
    'SpO2 abaixo de 94% — limiar protocolar SAMU 2016',
  ],
};

function shockSignsRows() {
  return [
    { label: 'Pele', value: 'Fria, pegajosa e pálida — perfusão periférica reduzida', badge: 'hot' },
    { label: 'Estado mental', value: 'Confusão ou agitação — hipoperfusão cerebral', badge: 'warn' },
    { label: 'FC', value: 'Taquicardia compensatória', badge: 'ok' },
    { label: 'PA', value: 'Hipotensão — queda da pressão de perfusão', badge: 'hot' },
    { label: 'Pegadinha', value: 'AVC hemorrágico não cursa com hipotensão inicial típica deste quadro', badge: 'info' },
  ];
}

const SPECS: Record<string, Pack> = {
  'fgv-enfermagem-semiologia-em-enfermagem-1779563491765-8': {
    family: 'conceito',
    guideline:
      'UPA — pele fria pegajosa, sudorese, palidez, taquicardia e hipotensão com confusão mental = choque potencialmente grave, não AVC hemorrágico isolado',
    roi_error: 'choque_sinais_hipoperfusao_upa',
    cluster: 'Choque — reconhecimento semiológico (diferencial AVC)',
    danger_footer: 'Gabarito A — choque potencialmente grave',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'UPA — perfil de choque',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Paciente na UPA com sinais sistêmicos de hipoperfusão — priorizar choque.', icon: 'Gauge' },
          { label: 'Pele', detail: 'Fria, pegajosa e pálida — vasoconstrição periférica.', icon: 'Thermometer' },
          { label: 'Autonômicos', detail: 'Sudorese intensa + taquicardia — resposta compensatória.', icon: 'Droplets' },
          { label: 'Hemodinâmica', detail: 'Hipotensão + confusão mental — órgãos-alvo comprometidos.', icon: 'Activity' },
          { label: 'Pegadinha — AVC', detail: 'AVC hemorrágico cursa com déficit focal neurológico — não explica hipotensão + pele fria isoladas.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Hipoperfusão sistêmica = choque até prova contrária',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sinais sugestivos de qual condição na UPA?',
          'Quadro: confusão, pele fria pegajosa, sudorese, palidez, taquicardia, hipotensão.',
          'Eliminar hiperglicemia leve — sem glicemia ou poliúria/polidipsia descritas.',
          'Eliminar AVC hemorrágico — ausência de déficit focal neurológico (face, fala, motor).',
          'Eliminar ansiedade leve — autonômicos + hipotensão indicam instabilidade hemodinâmica.',
          'Eliminar crise hipertensiva — PA está baixa, não elevada.',
          'Choque potencialmente grave — marcar A.',
          'Fixação: pele fria + hipotensão + taquicardia = tríade de choque.',
        ],
        footer_rule: 'Não confundir choque com AVC quando PA cai',
      },
      { type: 'golden_rule', meta: slideMeta, content: 'CHOQUE — SINAIS DE ALERTA', rows: shockSignsRows(), footer_rule: 'Perfusão antes de diferencial neurológico' },
      null as unknown,
    ],
  },
  'iaupe-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-8': {
    family: 'vf',
    guideline:
      'Epidemiologia do trauma — perfil masculino e óbito infantil (I e IV corretos); idosos têm alta letalidade (III); cabeça maior em criança aumenta risco craniano (II falsa)',
    roi_error: 'trauma_epidemiologia_vf_mortalidade',
    cluster: 'Trauma — epidemiologia e mortalidade (V/F I–IV)',
    danger_footer: 'Gabarito B — I, III e IV',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Trauma — perfil epidemiológico',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Trauma = 3ª causa de morte após doenças cardiovasculares (IAM/AVC) e neoplasias.', icon: 'BarChart' },
          { label: 'I — masculino', detail: 'Maior incidência e mortalidade no sexo masculino — verdadeira.', icon: 'Users' },
          { label: 'II — criança', detail: 'Cabeça proporcionalmente maior aumenta risco de lesão craniana — afirmativa invertida.', icon: 'Baby' },
          { label: 'III — idoso', detail: 'Alta letalidade por comorbidades e reserva fisiológica reduzida — verdadeira.', icon: 'Heart' },
          { label: 'IV — infância', detail: 'Trauma = principal causa de morte e invalidez na infância — verdadeira.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Cardiovascular lidera — trauma é terceiro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: analisar I–IV sobre epidemiologia do trauma.',
          'I — mortalidade associada ao perfil masculino: verdadeira.',
          'II — cabeça maior diminui risco craniano: falsa — aumenta o risco.',
          'III — óbito elevado em idosos por gravidade e comorbidades: verdadeira.',
          'IV — trauma principal causa de morte/invalidez na infância: verdadeira.',
          'Combinação correta: I, III e IV — marcar B.',
          'Fixação: II inverte a proporção cefálica pediátrica — pegadinha clássica.',
        ],
        footer_rule: 'Julgar cada item antes de cruzar combinação',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TRAUMA — EPIDEMIOLOGIA',
        rows: [
          { label: 'Ranking', value: '3ª causa de morte — após cardiovascular (IAM/AVC) e câncer', badge: 'hot' },
          { label: 'Masculino', value: 'Maior incidência e mortalidade', badge: 'ok' },
          { label: 'Infância', value: 'Principal causa de óbito e invalidez', badge: 'warn' },
          { label: 'Idoso', value: 'Alta letalidade — comorbidades + fragilidade', badge: 'warn' },
          { label: 'Pediatria', value: 'Cabeça grande × corpo pequeno = mais TCE', badge: 'info' },
        ],
        footer_rule: 'IAM/AVC lideram mortalidade — trauma vem em seguida',
      },
      null as unknown,
    ],
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-3': {
    family: 'protocolo',
    guideline:
      'Protocolo SAMU 192 (2016) — oxigenoterapia no IAM quando dispneia ou saturação inferior a 94%',
    roi_error: 'iam_samu_oxigenio_saturacao_94',
    cluster: 'IAM — oxigenoterapia pré-hospitalar (limiar SpO2)',
    danger_footer: 'Gabarito E — 94%',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'IAM — oxigênio no APH',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Emergência hipertensiva com complicação IAM — seguir protocolo SAMU.', icon: 'Ambulance' },
          { label: 'Indicação O2', detail: 'Dispneia ou saturação abaixo do limiar protocolar.', icon: 'Wind' },
          { label: 'Limiar SAMU', detail: 'SpO2 inferior a 94% — acionar oxigenoterapia.', icon: 'Activity' },
          { label: 'Pegadinha — 95%', detail: '95% está acima do corte — não é o limiar pedido.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — rotina', detail: 'Oxigênio não é automático em todo IAM — depende de SpO2/dispneia.', icon: 'Ban' },
        ],
        footer_rule: 'O2 no IAM = hipóxia ou dispneia — não profilaxia universal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: saturação abaixo da qual indicar oxigênio no IAM (Protocolo SAMU 2016).',
          'Contexto: emergência hipertensiva com IAM/angina instável.',
          'Eliminar 95% — acima do limiar protocolar desta prova.',
          'Eliminar 89%, 90% e 92% — valores abaixo do limiar, mas o protocolo cita 94%.',
          '94% — marcar E.',
          'Fixação: decorar limiar do protocolo SAMU — pegadinha numérica clássica.',
        ],
        footer_rule: 'Protocolo SAMU 2016 — SpO2 < 94% ou dispneia',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IAM — OXIGENOTERAPIA SAMU',
        rows: [
          { label: 'Indicação', value: 'Dispneia ou SpO2 abaixo do limiar protocolar SAMU', badge: 'hot' },
          { label: 'Limiar', value: 'Saturação inferior ao corte do Protocolo SAMU 2016', badge: 'hot' },
          { label: 'Evitar', value: 'O2 de rotina se eupneico e saturando bem', badge: 'warn' },
          { label: 'Contexto', value: 'IAM integra emergências hipertensivas com dano de órgão-alvo', badge: 'info' },
        ],
        footer_rule: 'Hipóxia ou dispneia — não oxigenar por hábito',
      },
      null as unknown,
    ],
  },
  'instituto-seletiva-enfermagem-urgencias-e-emergencias-1777103976379-6': {
    family: 'conceito',
    guideline:
      'Choque hipovolêmico — perda de volume por hemorragia intra-abdominal; IAM e AVC isquêmico não causam hipovolemia primária',
    roi_error: 'choque_hipovolemico_hemorragia_intraabdominal',
    cluster: 'Choque hipovolêmico — causa principal (diferencial IAM/AVC)',
    danger_footer: 'Gabarito C — hemorragia intra-abdominal',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Choque hipovolêmico',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail:
              'Choque = diminuição da oferta de oxigênio às células — perfusão tecidual comprometida (circulatório ou neurológico).',
            icon: 'Gauge',
          },
          { label: 'Hipovolêmico', detail: 'Perda de volume intravascular — principal mecanismo de choque hipovolêmico.', icon: 'Droplet' },
          { label: 'Hemorragia intra-abdominal', detail: 'Sangramento oculto no abdome — causa clássica de hipovolemia.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — IAM', detail: 'Infarto agudo do miocárdio — evento cardiogênico, não perda de volume primária.', icon: 'Heart' },
          { label: 'Pegadinha — AVC isquêmico', detail: 'Acidente vascular cerebral isquêmico — neurológico, não hipovolêmico.', icon: 'Brain' },
        ],
        footer_rule: 'Hipovolêmico = sangrou ou desidratou',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: principal causa de choque hipovolêmico.',
          'Eliminar IAM — mecanismo isquêmico cardíaco, não perda de volume.',
          'Eliminar AVC isquêmico — evento neurológico vascular, não hipovolemia.',
          'Eliminar fratura de punho fechada — sangramento localizado, volume insuficiente para choque grave.',
          'Hemorragia intra-abdominal — marcar C.',
          'Fixação: banca usa IAM/AVC como distrator — mecanismo diferente de choque hipovolêmico.',
        ],
        footer_rule: 'Volume perdido = hipovolêmico',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CHOQUE — TIPOS × MECANISMO',
        rows: [
          { label: 'Hipovolêmico', value: 'Perda de volume — hemorragia intra-abdominal', badge: 'hot' },
          { label: 'Cardiogênico', value: 'Falência de bomba — IAM complicado', badge: 'warn' },
          { label: 'Obstrutivo', value: 'Tamponamento/TEP — não perda de volume', badge: 'info' },
          { label: 'Distributivo', value: 'Vasodilatação — sepse/anafilaxia', badge: 'info' },
        ],
        footer_rule: 'IAM ≠ hipovolêmico primário',
      },
      null as unknown,
    ],
  },
  'ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-0': {
    family: 'conceito',
    guideline:
      'Caso Marina — dor HCD, febre, Murphy positivo e irradiação para ombro = colecistite aguda; irradiação para ombro não afasta vesícula — pegadinha IAM',
    roi_error: 'colecistite_murphy_vs_iam',
    cluster: 'Abdominal agudo — colecistite vs síndrome coronariana (pegadinha IAM)',
    danger_footer: 'Gabarito B — colecistite aguda',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso Marina — HCD',
        meta: slideMeta,
        items: [
          { label: 'Quadro', detail: 'Dor intensa HCD + febre + náusea/vômito — abdomen agudo.', icon: 'User' },
          { label: 'Murphy +', detail: 'Dor à palpação do hipocôndrio direito na inspiração — colecistite.', icon: 'Search' },
          { label: 'Irradiação ombro', detail: 'Dor referida ao ombro direito (nervo frênico) — compatível com vesícula.', icon: 'ArrowRight' },
          { label: 'Colecistite', detail: 'Inflamação aguda da vesícula — diagnóstico mais provável.', icon: 'CheckCircle' },
          { label: 'Pegadinha — IAM', detail: 'Irradiação para ombro não exclui colecistite — letra C inverte a lógica.', icon: 'Heart' },
        ],
        footer_rule: 'Murphy + febre + HCD = colecistite',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa verdadeira diante do quadro clínico.',
          'Eliminar apendicite — dor em FID/RLQ, não HCD com Murphy.',
          'Eliminar letra C — irradiação para ombro NÃO afasta vesícula; é sinal clássico de colecistite.',
          'Eliminar gastrite — dor epigástrica sem febre/Murphy típicos.',
          'Colecistite aguda — marcar B.',
          'Fixação: banca usa IAM como distrator quando dor irradia — contexto abdominal prevalece.',
        ],
        footer_rule: 'Sinal de Murphy fecha vesícula biliar',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COLECISTITE × IAM — DIFERENCIAL',
        rows: [
          { label: 'Murphy', value: 'Positivo — inflamação da vesícula biliar', badge: 'hot' },
          { label: 'Local', value: 'HCD + irradiação ombro direito (frênico)', badge: 'ok' },
          { label: 'Febre', value: 'Processo inflamatório/infeccioso biliar', badge: 'warn' },
          { label: 'IAM', value: 'Dor precordial + autonômicos — sem Murphy abdominal', badge: 'info' },
        ],
        footer_rule: 'Abdome agudo ≠ dor torácica isquêmica',
      },
      null as unknown,
    ],
  },
  'quadrix-enfermagem-urgencias-e-emergencias-1777103988389-8': {
    family: 'conceito',
    guideline:
      'Sudorese, vertigens, cefaleia e angina no PS = infarto agudo do miocárdio — não AVE (focal neurológico) nem choque cardiogênico isolado',
    roi_error: 'iam_angina_sudorese_vertigem',
    cluster: 'IAM — reconhecimento clínico (angina + autonômicos)',
    danger_footer: 'Gabarito B — infarto agudo do miocárdio',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PS — dor torácica aguda',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Homem no PS com sintomas autonômicos e angina — pensar IAM.', icon: 'Heart' },
          { label: 'Angina', detail: 'Dor/ desconforto torácico — isquemia miocárdica.', icon: 'Zap' },
          { label: 'Autonômicos', detail: 'Sudorese + vertigens + cefaleia — resposta simpática.', icon: 'Droplets' },
          { label: 'IAM', detail: 'Conjunto angina + sudorese = infarto agudo do miocárdio.', icon: 'Activity' },
          { label: 'Pegadinha — AVE', detail: 'AVE exige déficit neurológico focal (face, fala, motor) — ausente aqui.', icon: 'Brain' },
        ],
        footer_rule: 'Angina + sudorese = isquemia miocárdica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sintomas característicos de qual condição?',
          'Quadro: sudorese, vertigens, cefaleia e angina.',
          'Eliminar diabetes — sem poliúria, polidipsia ou hiperglicemia descritas.',
          'Eliminar choque cardiogênico — quadro agudo inicial, não colapso hemodinâmico estabelecido.',
          'Eliminar AVE — sem assimetria facial, fala alterada ou paresia.',
          'Eliminar sepse — sem febre, foco infeccioso ou hipotensão descritos.',
          'Infarto agudo do miocárdio — marcar B.',
          'Fixação: vertigem e cefaleia isoladas lembram AVE — angina ancora IAM.',
        ],
        footer_rule: 'Cincinnati negativo + angina = IAM',
      },
      { type: 'golden_rule', meta: slideMeta, content: 'IAM — SINAIS CLÍNICOS', rows: iamSinaisRows(), footer_rule: 'Angina + sudorese — tempo is miocárdio' },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'fgv-enfermagem-semiologia-em-enfermagem-1779563491765-8': {
    B: 'Hiperglicemia leve não explica pele fria pegajosa com hipotensão e confusão aguda.',
    C: 'AVC hemorrágico exige déficit neurológico focal — não perfil de choque sistêmico isolado.',
    D: 'Ansiedade leve não cursa com hipotensão e pele fria pegajosa.',
    E: 'Crise hipertensiva implica PA elevada — paciente está hipotenso.',
  },
  'iaupe-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-8': {
    A: 'Item II é falso — cabeça maior aumenta (não diminui) risco craniano infantil.',
    C: 'Item II é falso — invalida combinação com II incluído.',
    D: 'Falta item I — combinação incompleta.',
    E: 'Item II é falso — não pode compor gabarito com II.',
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-3': {
    A: '95% está acima do limiar de 94% do Protocolo SAMU 2016.',
    B: '89% está abaixo do limiar, mas o protocolo cita corte em 94%.',
    C: '90% não é o valor protocolar pedido nesta prova.',
    D: '92% não corresponde ao limiar SAMU 2016 para oxigenoterapia no IAM.',
  },
  'instituto-seletiva-enfermagem-urgencias-e-emergencias-1777103976379-6': {
    A: 'IAM é evento isquêmico cardíaco — não causa hipovolemia primária.',
    B: 'AVC isquêmico é evento neurológico — mecanismo distinto de choque hipovolêmico.',
    D: 'Fratura fechada de punho raramente gera perda volêmica massiva.',
  },
  'ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-0': {
    A: 'Apendicite localiza dor em FID — Murphy positivo em HCD aponta vesícula.',
    C: 'Irradiação para ombro direito é clássica em colecistite (nervo frênico) — não indica IAM.',
    D: 'Gastrite cursa com dor epigástrica sem febre alta e Murphy positivo.',
  },
  'quadrix-enfermagem-urgencias-e-emergencias-1777103988389-8': {
    A: 'Diabetes melito agudo não explica angina com sudorese no PS.',
    C: 'Choque cardiogênico é complicação avançada — quadro inicial descreve IAM.',
    D: 'AVE exige déficit neurológico focal — face, fala ou motor alterados.',
    E: 'Sepse requer contexto infeccioso e instabilidade — não descritos.',
  },
};

const EXTRA_SOURCES: Record<string, typeof MS_AVC_SOURCE[]> = {
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-3': [MS_AVC_SOURCE, SAMU_IAM_SOURCE],
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, '')) as Q;
    const slides = finalizeSlides(slug, raw, pack, DANGER_OVERRIDES);
    const meta = metaBase(raw, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER);
    if (EXTRA_SOURCES[slug]) {
      (meta as Record<string, unknown>).sources = EXTRA_SOURCES[slug];
    }
    if (slug === 'idib-enfermagem-urgencias-e-emergencias-1778934926888-3') {
      (meta as Record<string, unknown>).content_review = {
        ...(meta.content_review as Record<string, unknown>),
        exam_vs_current: 'samu_2016_spo2_94_exam_answer',
      };
    }
    const out = {
      meta,
      question_data: raw.question_data,
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g16] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g16] total=${ok}`);
}

main();
