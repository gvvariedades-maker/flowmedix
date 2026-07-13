#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — puncao-venosa-e-cuidados-com-cateteres-g10 (8 slugs puncao_flebite).
 *
 *   npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g10
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildPuncaoGuidelineSnapshot,
  buildPuncaoSourcesForSlug,
} from '@/lib/catalogMigration/puncaoPedagogy';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g10';
const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const BRANCH = 'puncao_flebite';
const REVIEWED = '2026-07-12';

/** Corrige colagens típicas de PDF importado (TecConcursos etc.). */
function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\bdaagulha\b/gi, 'da agulha')
    .replace(/\bÉindicada\b/gi, 'É indicada')
    .replace(/\bumprocedimento\b/gi, 'um procedimento')
    .replace(/\bumação\b/gi, 'uma ação')
    .replace(/\bmelhorescondições\b/gi, 'melhores condições')
    .replace(/\bainfusão\b/gi, 'a infusão')
    .replace(/\bamedicação\b/gi, 'a medicação')
    .replace(/\bamedicamentos\b/gi, 'a medicamentos')
    .replace(/\baoacesso\b/gi, 'ao acesso')
    .replace(/\bdepermanência\b/gi, 'de permanência')
    .replace(/\bodesaparecimento\b/gi, 'o desaparecimento')
    .replace(/\bvenosadeve\b/gi, 'venosa deve')
    .replace(/\bapermanência\b/gi, 'a permanência')
    .replace(/\bvalidade dapermanência\b/gi, 'validade da permanência')
    .replace(/\btempo depermanência\b/gi, 'tempo de permanência')
    .replace(/\bcausammenos\b/gi, 'causam menos')
    .replace(/\btentativassem\b/gi, 'tentativas sem')
    .replace(/\bmaisproximos\b/gi, 'mais próximos')
    .replace(/\bfrequenciaocorrem\b/gi, 'frequência ocorrem')
    .replace(/\bdecomprimento\b/gi, 'de comprimento')
    .replace(/\bedrenagem\b/gi, 'e drenagem')
    .replace(/\bocorreuma\b/gi, 'ocorre uma')
    .replace(/\brefere-seao\b/gi, 'refere-se ao')
    .replace(/([.!?])([A-Za-zÀ-ú])/g, '$1 $2');
}

function cleanQuestionData(qd: Q['question_data']): Q['question_data'] {
  return {
    ...qd,
    instruction: cleanPdfArtifacts(qd.instruction),
    options: qd.options.map((o) => ({ ...o, text: cleanPdfArtifacts(o.text) })),
  };
}

const EXAM_VS_BY_SLUG: Record<string, string> = {};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'calc';
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  const examVs = pack.exam_vs_current ?? EXAM_VS_BY_SLUG[slug] ?? 'none';
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
      exam_vs_current: examVs,
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: buildPuncaoSourcesForSlug(corpus),
  };
}

const SPECS: Record<string, Pack> = {
  'fepese-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340213288-6': {
    family: 'conceito',
    guideline: 'Flebite — dor, hiperemia e calor no sítio do AVP após punção/infusão',
    roi_error: 'flebite_vs_hematoma_anafilaxia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso clínico — sinais flogísticos no AVP',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário',
            detail:
              'Após punção venosa e fluidoterapia: dor, hiperemia e calor no local — complicação relacionada ao procedimento.',
            icon: 'User',
          },
          {
            label: 'Flebite (trilho)',
            detail: 'Inflamação do trajeto venoso — dor, rubor/hiperemia e calor local.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Hematoma',
            detail: 'Sangue extravasado no tecido — equimose; não explica hiperemia inflamatória típica sozinha.',
            icon: 'CircleX',
          },
          {
            label: 'Reação anafilática',
            detail: 'Resposta sistêmica imediata — urticária, broncoespasmo, choque; não só dor local.',
            icon: 'Zap',
          },
          {
            label: 'Lipotimia / venóclise',
            detail: 'Lipotimia = síncope vasovagal; venóclise = infusão volumosa — não são complicação local descrita.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Dor + hiperemia + calor no sítio do cateter = flebite até prova em contrário.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Complicações locais — sinais × nome',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'CLASSIFIQUE PELO MECANISMO NO SÍTIO',
        rows: [
          { label: 'Flebite', value: 'Inflamação venosa: dor, calor, rubor/hiperemia no trajeto.', badge: 'hot' },
          { label: 'Hematoma', value: 'Sangue no tecido por lesão vascular — equimose.', badge: 'info' },
          { label: 'Infiltração', value: 'Solução fora do vaso no subcutâneo.', badge: 'warn' },
          { label: 'Anafilaxia', value: 'Reação sistêmica imediata — fora do padrão só local.', badge: 'info' },
          { label: 'Lipotimia', value: 'Síncope vasovagal durante/ após procedimento.', badge: 'info' },
        ],
        footer_rule: 'Tríade flogística no cateter aponta flebite, não hematoma isolado.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Eliminação — complicação do caso',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Identificar sinais: dor + hiperemia + calor no local após punção e fluidoterapia.',
          'Mecanismo: inflamação do trajeto venoso no sítio do acesso.',
          'Eliminar A (hematoma): sangue no tecido — equimose; não fecha a tríade inflamatória típica.',
          'Eliminar B (anafilaxia): quadro sistêmico imediato — não só dor local.',
          'Eliminar C (lipotimia): síncope vasovagal — não complicação inflamatória do sítio.',
          'Eliminar E (venóclise): nome do procedimento de infusão volumosa, não complicação.',
          'Letra D (flebite): inflamação venosa com dor, calor e hiperemia — coerente.',
          'Marcar letra D.',
        ],
        footer_rule: 'Prova FEPESE troca flebite por hematoma ou reação sistêmica.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — qualquer “inchaço” local',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — SINAIS FLOGÍSTICOS',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Hematoma',
            detail: 'Aluno associa punção a equimose, ignorando calor e hiperemia inflamatória.',
            correct: 'Hematoma = sangue no tecido; flebite = inflamação venosa com calor e rubor.',
          },
          {
            label: 'Letra B — Reação anafilática',
            detail: 'Confunde complicação local com resposta alérgica sistêmica.',
            correct: 'Anafilaxia exige manifestações sistêmicas — não só dor no cateter.',
          },
          {
            label: 'Letra C — Lipotimia',
            detail: 'Evento neurovascular do paciente, não inflamação do vaso.',
            correct: 'Lipotimia ≠ flebite — avalie se há sinais no sítio do AVP.',
          },
          {
            label: 'Letra E — Venóclise',
            detail: 'Termo para infusão venosa de grande volume — procedimento, não complicação.',
            correct: 'Flebite nomeia a inflamação do trajeto após punção/infusão.',
          },
        ],
        footer_rule: 'Calor + hiperemia + dor local = flebite na prova de técnico.',
      },
    ],
  },

  'fepese-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340254185-0': {
    family: 'conceito',
    guideline: 'Hematoma — acúmulo de sangue sob a pele por lesão vascular na punção',
    roi_error: 'hematoma_vs_flebite_infiltracao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sangue sob a pele — definição',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Enunciado',
            detail:
              'Complicação frequente da punção venosa: acúmulo de sangue sob a pele devido à lesão vascular.',
            icon: 'Target',
          },
          {
            label: 'Hematoma',
            detail: 'Extravasamento de sangue no tecido subcutâneo — equimose local.',
            icon: 'CircleX',
          },
          {
            label: 'Flebite',
            detail: 'Inflamação do trajeto venoso — dor, calor, rubor; não é sangue sob a pele.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Infiltração',
            detail: 'Solução infundida fora do vaso — medicamento no subcutâneo.',
            icon: 'Droplets',
          },
          {
            label: 'Trombose / infecção',
            detail: 'Trombose = coágulo intravascular; infecção = processo infeccioso — mecanismos distintos.',
            icon: 'Shield',
          },
        ],
        footer_rule: 'Sangue no tecido por punção = hematoma.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Tabela — complicações por mecanismo',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'SANGUE NO TECIDO ≠ SOLUÇÃO NO SUBCUTÂNEO',
        rows: [
          { label: 'Hematoma', value: 'Sangue extravasado sob a pele por lesão vascular.', badge: 'hot' },
          { label: 'Flebite', value: 'Inflamação venosa: dor, calor, rubor no trajeto.', badge: 'warn' },
          { label: 'Infiltração', value: 'Infusato/medicamento fora do vaso.', badge: 'ok' },
          { label: 'Infecção', value: 'Colonização microbiana com sinais infecciosos.', badge: 'info' },
          { label: 'Trombose', value: 'Formação de coágulo no interior do vaso.', badge: 'info' },
        ],
        footer_rule: 'Leia “sangue sob a pele” literalmente — hematoma.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Raciocínio — lesão vascular',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: nome da complicação = acúmulo de sangue sob a pele por lesão vascular.',
          'Mecanismo: extravasamento sanguíneo no tecido — não inflamação venosa nem infusato.',
          'Eliminar A (flebite): inflamação do trajeto — não definição de sangue sob a pele.',
          'Eliminar B (infiltração): líquido medicamentoso no subcutâneo.',
          'Eliminar C (infecção): processo microbiano — não hematoma agudo por punção.',
          'Eliminar E (trombose): coágulo intravascular — não equimose subcutânea.',
          'Letra D (hematoma): sangue no tecido por trauma vascular na punção.',
          'Marcar letra D.',
        ],
        footer_rule: 'Hematoma, flebite e infiltração são as trocas clássicas em definição.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — definições trocadas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — SANGUE × INFLAMAÇÃO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Flebite',
            detail: 'Mesmo capítulo IV, mas flebite é inflamação venosa, não equimose.',
            correct: 'Hematoma = sangue extravasado; flebite = dor/calor/rubor no trajeto.',
          },
          {
            label: 'Letra B — Infiltração',
            detail: 'Também há “inchaço”, mas o fluido é da infusão, não sangue.',
            correct: 'Enunciado fala em sangue sob a pele — infiltração não fecha.',
          },
          {
            label: 'Letra C — Infecção',
            detail: 'Pode evoluir tardiamente, mas não define acúmulo imediato de sangue.',
            correct: 'Lesão vascular na punção → hematoma.',
          },
          {
            label: 'Letra E — Trombose',
            detail: 'Coágulo dentro da veia — não sangue no subcutâneo visível como equimose.',
            correct: 'Hematoma é extravasamento perivascular por punção.',
          },
        ],
        footer_rule: 'Decore: sangue sob a pele = hematoma.',
      },
    ],
  },

  'fundatec-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340254185-2': {
    family: 'vf',
    guideline: 'AVP — higiene das mãos, menor calibre/cânula, evitar MMII, cateter novo por tentativa, retirar se ocioso 24h',
    roi_error: 'vf_avp_membros_inferiores_calibre',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Assertivas I a V — cateter periférico',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Comando VF',
            detail: 'Julgar cinco assertivas sobre cateteres venosos periféricos — marcar V ou F em cada item.',
            icon: 'Target',
          },
          {
            label: 'I — Higiene das mãos',
            detail: 'Antes/depois da inserção e antes/depois de manipular dispositivos — Verdadeiro.',
            icon: 'CheckCircle',
          },
          {
            label: 'II — Menor calibre e cânula',
            detail: 'Menores calibres e comprimentos reduzem flebite mecânica e obstrução — Verdadeiro.',
            icon: 'CheckCircle',
          },
          {
            label: 'III — Membros inferiores',
            detail: 'Usar MMII após falha em MMSS — Falso (MMII não são rotina de escolha).',
            icon: 'XCircle',
          },
          {
            label: 'IV — Cateter novo',
            detail: 'Nova tentativa de punção exige novo cateter periférico — Verdadeiro.',
            icon: 'CheckCircle',
          },
          {
            label: 'V — Retirada 24h ocioso',
            detail: 'Remover se não usado em 24h e sem IV prescrito — Verdadeiro.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: 'Sequência correta: V – V – F – V – V.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Normas AVP — referência rápida',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'PREVENÇÃO DE FLEBITE MECÂNICA',
        rows: [
          { label: 'Higiene', value: 'Higienizar mãos antes/depois de inserir e manipular.', badge: 'ok' },
          { label: 'Calibre', value: 'Menor calibre e cânula adequados à terapia.', badge: 'hot' },
          { label: 'Sítio', value: 'Preferir membros superiores — evitar MMII de rotina.', badge: 'warn' },
          { label: 'Tentativa', value: 'Cateter novo a cada nova punção.', badge: 'ok' },
          { label: 'Ociosidade', value: 'Retirar se sem uso em 24h e sem prescrição IV.', badge: 'ok' },
        ],
        footer_rule: 'Item III (MMII) é o único falso nesta questão.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Montar V – V – F – V – V',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: cinco assertivas sobre cateter venoso periférico — I a V.',
          'Item I: higiene das mãos na inserção e manipulação — Verdadeiro.',
          'Item II: menores calibres/comprimentos → menos flebite mecânica — Verdadeiro.',
          'Item III: veias de MMII após falha em MMSS — Falso (MMII não são escolha preferencial).',
          'Item IV: novo cateter a cada tentativa de punção — Verdadeiro.',
          'Item V: retirar se ocioso 24h sem IV prescrito — Verdadeiro.',
          'Sequência: V – V – F – V – V — letra D.',
          'Marcar letra D.',
        ],
        footer_rule: 'III é a intrusa — MMII só em exceção, não “sempre que houver dificuldade”.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — sequências VF',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — ASSERTIVA III',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — III como verdadeira',
            detail: 'Aceita MMII como rotina após duas tentativas em MMSS.',
            correct: 'MMII aumentam risco — não são “sempre que houver dificuldade”.',
          },
          {
            label: 'Letra C — inverter II e III',
            detail: 'Marca calibre menor como falso e MMII como verdadeiro.',
            correct: 'Menor calibre reduz flebite mecânica — II é V; III é F.',
          },
          {
            label: 'Letra E — V falso',
            detail: 'Nega retirada do cateter ocioso sem prescrição IV.',
            correct: 'Dispositivo ocioso deve ser removido — item V é verdadeiro.',
          },
          {
            label: 'Confundir IV com falso',
            detail: 'Reutilizar cateter entre tentativas viola técnica asséptica.',
            correct: 'Cada punção = cateter novo — item IV é V.',
          },
        ],
        footer_rule: 'Decore: só III é F — gabarito D.',
      },
    ],
  },

  'fundatec-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562705224-0': {
    family: 'conceito',
    guideline: 'Flebite — inflamação da veia com dor, calor, edema e hiperemia após punção/infusão',
    roi_error: 'flebite_vs_extravasamento_hematoma',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Inflamação venosa pós-punção',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Conceito cobrado',
            detail:
              'Inflamação na veia após punção e/ou administração: dor local, calor, edema e hiperemia.',
            icon: 'Target',
          },
          {
            label: 'Flebite',
            detail: 'Resposta inflamatória do trajeto venoso — gabarito da questão.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Extravasamento',
            detail: 'Medicamento vesicante/irritante fora do vaso — mecanismo distinto, embora possa coexistir.',
            icon: 'Droplets',
          },
          {
            label: 'Hematoma',
            detail: 'Sangue no tecido — equimose; não define inflamação venosa com calor.',
            icon: 'CircleX',
          },
          {
            label: 'Obstrução / alergia',
            detail: 'Obstrução = fluxo bloqueado; alergia = processo imunológico — não o conceito descrito.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Inflamação + dor + calor + edema + hiperemia = flebite.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Complicações — pareamento',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'NOMEIE O MECANISMO LITERAL',
        rows: [
          { label: 'Flebite', value: 'Inflamação venosa: dor, calor, edema, hiperemia.', badge: 'hot' },
          { label: 'Extravasamento', value: 'Solução/medicamento fora do vaso — risco de necrose se vesicante.', badge: 'warn' },
          { label: 'Hematoma', value: 'Sangue extravasado no tecido por punção.', badge: 'info' },
          { label: 'Obstrução', value: 'Cateter/veia não pérvia — fluxo resistido.', badge: 'info' },
          { label: 'Alérgico', value: 'Reação imunológica — não sinônimo de flebite.', badge: 'info' },
        ],
        footer_rule: 'FUNDATEC descreve flebite com os quatro sinais flogísticos clássicos.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Qual complicação é essa?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Ler definição: inflamação na veia após punção/medicação com dor, calor, edema e hiperemia.',
          'Classificar: processo inflamatório do trajeto venoso.',
          'Eliminar A (extravasamento): foco em solução fora do vaso — não a definição completa aqui.',
          'Eliminar B (obstrução): impedimento de fluxo — não quadro inflamatório descrito.',
          'Eliminar C (hematoma): sangue no tecido — não inflamação venosa com calor/edema típicos.',
          'Eliminar E (alérgico): mecanismo imunológico — termo impreciso para o conceito.',
          'Letra D (flebite): inflamação venosa com sinais flogísticos — correto.',
          'Marcar letra D.',
        ],
        footer_rule: 'Enunciado é definição clássica de flebite.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — extravasamento × flebite',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — INFLAMAÇÃO VENOSA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Extravasamento',
            detail: 'Aluno generaliza qualquer complicação IV como extravasamento.',
            correct: 'Extravasamento = solução fora do vaso; flebite = inflamação do trajeto.',
          },
          {
            label: 'Letra C — Hematoma',
            detail: 'Confunde equimose por punção com inflamação venosa.',
            correct: 'Hematoma é sangue no tecido; aqui há inflamação da veia com calor.',
          },
          {
            label: 'Letra B — Obstrução',
            detail: 'Cateter obstruído pode coexistir, mas não nomeia inflamação venosa.',
            correct: 'Dor + calor + edema + hiperemia = flebite na definição da banca.',
          },
          {
            label: 'Letra E — Processo alérgico',
            detail: 'Termo vago para reação imunológica — distrator sem precisão.',
            correct: 'Flebite fecha o conceito inflamatório venoso local.',
          },
        ],
        footer_rule: 'Decore a definição FUNDATEC palavra a palavra.',
      },
    ],
  },

  'fuvest-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562699843-0': {
    family: 'conceito',
    guideline: 'Riscos locais IV — extravazamento, infiltração, flebite e hematoma (não sistêmicos)',
    roi_error: 'riscos_locais_vs_sistemicos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Riscos LOCAIS da via IV',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Possíveis riscos de ordem LOCAL na administração intravenosa — lista fechada.',
            icon: 'Target',
          },
          {
            label: 'Extravazamento',
            detail: 'Solução/medicamento fora do vaso — complicação local ao sítio.',
            icon: 'Droplets',
          },
          {
            label: 'Infiltração',
            detail: 'Infusato no subcutâneo — risco local do acesso.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Flebite / hematoma',
            detail: 'Inflamação venosa e sangue no tecido — ambos locais ao cateter.',
            icon: 'CircleX',
          },
          {
            label: 'Pegadinha sistêmica',
            detail: 'Choque anafilático, pirogênico, sobrecarga circulatória — ordem sistêmica, não local.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Local = ao sítio do cateter; sistêmico = reação generalizada.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Local × sistêmico — IV',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'LOCAL: SÍTIO DO ACESSO · SISTÊMICO: CORPO INTEIRO',
        rows: [
          { label: 'Extravazamento', value: 'Medicamento/solução fora da veia no local.', badge: 'hot' },
          { label: 'Infiltração', value: 'Infusato no subcutâneo — local.', badge: 'ok' },
          { label: 'Flebite', value: 'Inflamação do trajeto venoso — local.', badge: 'ok' },
          { label: 'Hematoma', value: 'Sangue no tecido por punção — local.', badge: 'ok' },
          { label: 'Evitar', value: 'Anafilaxia, choque pirogênico, sobrecarga — sistêmicos.', badge: 'warn' },
        ],
        footer_rule: 'FUVEST testa discriminar local vs reação generalizada.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Qual lista só tem riscos locais?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: riscos de ordem LOCAL da administração IV.',
          'Filtrar: complicações restritas ao sítio do acesso venoso.',
          'Letra A: extravazamento, infiltração, flebite e hematoma — todos locais.',
          'Eliminar B: inclui sobrecarga circulatória — risco sistêmico/volumétrico.',
          'Eliminar C: choque anafilático e soroma — mistura local com sistêmico/atípico.',
          'Eliminar D: choque pirogênico e superdosagem — sistêmicos.',
          'Marcar letra A.',
          'Fixação: local = extravazamento, infiltração, flebite, hematoma.',
        ],
        footer_rule: 'Leia “ordem local” antes de marcar qualquer lista.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — local × sistêmico',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — LISTAS MISTAS',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — Sobrecarga circulatória',
            detail: 'Complicação hemodinâmica sistêmica por volume, não só no sítio.',
            correct: 'Lista A traz só complicações locais ao cateter.',
          },
          {
            label: 'Letra C — Choque anafilático',
            detail: 'Reação imediata generalizada — não risco “local” da prova.',
            correct: 'Anafilaxia é sistêmica; extravazamento/flebite são locais.',
          },
          {
            label: 'Letra D — Choque pirogênico',
            detail: 'Febre/calafrios por contaminante na infusão — manifestação sistêmica.',
            correct: 'Não entra na lista de riscos locais FUVEST.',
          },
          {
            label: 'Letra D — Superdosagem',
            detail: 'Erro de dose — efeito farmacológico sistêmico.',
            correct: 'Local = ao cateter; dose errada ≠ complicação mecânica local.',
          },
        ],
        footer_rule: 'Decore a tetrade local: extravazamento · infiltração · flebite · hematoma.',
      },
    ],
  },

  'fuvest-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562699843-1': {
    family: 'protocolo',
    guideline: 'Escala de flebite — grau 0 sem sintomas; grau 4 com drenagem purulenta e cordão >1 cm',
    roi_error: 'escala_flebite_grau0_grau4',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Escala de flebite — extremos',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Observar sítio de inserção (cateter venoso central ou periférico): flogismo, drenagem, infiltração, permeabilidade.',
            icon: 'ClipboardList',
          },
          {
            label: 'Grau 0',
            detail: 'Ausência de sintomas — veia/cateter sem sinais flogísticos.',
            icon: 'CheckCircle',
          },
          {
            label: 'Grau 4',
            detail:
              'Dor, eritema/edema, endurecimento, cordão fibroso palpável >1 cm e drenagem purulenta.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha grau 1×2',
            detail: 'Banca troca ordem de eritema e dor entre graus adjacentes.',
            icon: 'XCircle',
          },
          {
            label: 'Pegadinha grau 4',
            detail: 'Alternativas omitem pus ou invertem grau 0 com “sem eritema” mal descrito.',
            icon: 'Shield',
          },
        ],
        footer_rule: 'Grau 0 = assintomático; grau 4 = pus + cordão palpável.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Escala — pontos de prova',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'GRAU 0 × GRAU 4 — DECORE OS EXTREMOS',
        rows: [
          { label: 'Grau 0', value: 'Ausência de sintomas no sítio.', badge: 'hot' },
          { label: 'Grau 1', value: 'Eritema na inserção com ou sem dor leve.', badge: 'info' },
          { label: 'Grau 2', value: 'Dor com ou sem eritema/edema.', badge: 'info' },
          { label: 'Grau 3', value: 'Dor + eritema/edema + endurecimento/palpação de cordão.', badge: 'warn' },
          {
            label: 'Grau 4',
            value: 'Cordão >1 cm + drenagem purulenta — gravidade máxima.',
            badge: 'hot',
          },
        ],
        footer_rule: 'Letra A acerta grau 0 e grau 4 na mesma alternativa.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Validar grau 0 e grau 4',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: relação correta entre grau de flebite e descrição.',
          'Grau 0 deve ser: ausência de sintomas — não confundir com “só sem eritema”.',
          'Grau 4 deve incluir: dor, eritema/edema, endurecimento, cordão >1 cm e drenagem purulenta.',
          'Eliminar B: inverte grau 1 e 2 (dor sem eritema no grau 2).',
          'Eliminar C: grau 3 sem endurecimento — incompleto.',
          'Eliminar D: grau 4 sem drenagem purulenta — errado.',
          'Letra A: grau 0 assintomático + grau 4 com pus e cordão — correto.',
          'Marcar letra A.',
        ],
        footer_rule: 'Prova FUVEST cobra extremos da escala — 0 e 4.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — graus trocados',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — ESCALA DE FLEBITE',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — Grau 2 sem eritema',
            detail: 'Descrição invertida entre graus 1 e 2.',
            correct: 'Grau 0 = ausência de sintomas; grau 4 = pus + cordão >1 cm.',
          },
          {
            label: 'Letra C — Grau 3 incompleto',
            detail: 'Omite endurecimento/cordão exigido antes do grau 4.',
            correct: 'Letra A fecha os dois extremos exigidos pela banca.',
          },
          {
            label: 'Letra D — Grau 4 sem pus',
            detail: 'Aceita grau 4 só com endurecimento — falta drenagem purulenta.',
            correct: 'Grau 4 exige drenagem purulenta na alternativa correta.',
          },
          {
            label: 'Grau 0 mal definido',
            detail: 'Confundir “sem eritema visível” com grau 0 absoluto.',
            correct: 'Grau 0 = ausência total de sintomas no sítio.',
          },
        ],
        footer_rule: 'Decore: 0 = nada · 4 = cordão + pus.',
      },
    ],
  },

  'idib-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1778934890864-3': {
    family: 'conceito',
    guideline: 'PICC — preserva rede venosa periférica, reduz punções repetidas; inserção periférica com ponta central',
    roi_error: 'picc_beneficio_vs_riscos_exagerados',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PICC — o que é e por que usar',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Definição',
            detail:
              'Cateter central de inserção periférica: longo, flexível, inserido por veia periférica com ponta no sistema venoso central.',
            icon: 'Syringe',
          },
          {
            label: 'Benefício-chave',
            detail: 'Indicação precoce evita punções repetidas — preserva rede venosa periférica.',
            icon: 'CheckCircle',
          },
          {
            label: 'Dor e manuseio',
            detail: 'Menos exposição à dor por múltiplas punções de curta permanência.',
            icon: 'Heart',
          },
          {
            label: 'Pegadinha “só cirurgião”',
            detail: 'Alternativas exageram risco e restringem punção ao cirurgião — incorreto.',
            icon: 'XCircle',
          },
          {
            label: 'Pegadinha “só curto prazo”',
            detail: 'PICC é dispositivo de longa permanência — não aumenta flebite química por definição.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'PICC = acesso duradouro com preservação venosa periférica.',
      },
      {
        type: 'golden_rule',
        slide_title: 'PICC — vantagens × mitos',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'PICC: MENOS PUNÇÕES · PRESERVA VEIAS PERIFÉRICAS',
        rows: [
          {
            label: 'Indicação',
            value: 'Terapia IV prolongada sem esgotar veias periféricas.',
            badge: 'hot',
          },
          { label: 'Inserção', value: 'Veia periférica (basílica/cefálica) — ponta central.', badge: 'ok' },
          { label: 'Benefício', value: 'Reduz punções repetidas e trauma venoso periférico.', badge: 'hot' },
          { label: 'Profissional', value: 'Enfermeiro habilitado pode inserir conforme protocolo.', badge: 'ok' },
          { label: 'Mito', value: 'Exige cirurgia ou “só curto prazo” — incorreto na prova.', badge: 'warn' },
        ],
        footer_rule: 'Letra A sintetiza o benefício vascular cobrado pelo IDIB.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Alternativa correta — PICC',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: alternativa correta sobre PICC (CCIP).',
          'Letra A: preserva rede venosa periférica, reduz punções e dor — benefício clássico.',
          'Eliminar B: exagera risco, exige cirurgia e restringe ao cirurgião — falso.',
          'Eliminar C: descreve PICC como curto prazo e alto risco de infiltração — distorce.',
          'Eliminar D: lista drogas proibidas no PICC — generalização incorreta.',
          'Marcar letra A.',
          'Fixação: PICC = longa permanência + poupar veias periféricas.',
        ],
        footer_rule: 'Prova cobra benefício vascular, não lista de contraindicações inventada.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — medo do PICC',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — PICC × MITOS',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — Só cirurgião',
            detail: 'Restringe inserção e infla pneumotórax como rotina.',
            correct: 'PICC é inserido por equipe habilitada — benefício é preservar veias periféricas.',
          },
          {
            label: 'Letra C — Curto prazo',
            detail: 'PICC é para terapia prolongada — não dispositivo de horas.',
            correct: 'Indicação precoce reduz punções repetidas no periférico.',
          },
          {
            label: 'Letra D — Drogas proibidas',
            detail: 'Lista fechada de medicamentos “não infundíveis” — distrator.',
            correct: 'Questão testa vantagem vascular, não contraindicação absoluta fictícia.',
          },
          {
            label: 'Confundir com AVP curto',
            detail: 'AVP esgota veias; PICC centraliza acesso duradouro.',
            correct: 'Letra A: preservação da rede venosa periférica.',
          },
        ],
        footer_rule: 'PICC poupa veias — letra A.',
      },
    ],
  },

  'instituto-access-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562693149-6': {
    family: 'conceito',
    guideline: 'Flebite mecânica — longa canulação e cateter mal fixado traumatizam endotélio',
    roi_error: 'flebite_mecanica_vs_quimica_bacteriana',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tipos de flebite — mecânica × química × bacteriana',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Enunciado',
            detail:
              'Flebite pode ser química, mecânica ou bacteriana — tipos frequentemente coexistem.',
            icon: 'Target',
          },
          {
            label: 'Flebite mecânica',
            detail: 'Trauma físico: longos períodos de canulação e cateter mal fixado.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Flebite química',
            detail: 'Irritantes — pH, osmolaridade, medicamentos/soluções.',
            icon: 'FlaskConical',
          },
          {
            label: 'Flebite bacteriana',
            detail: 'Contaminação microbiana — má higiene e quebra de técnica asséptica.',
            icon: 'Bug',
          },
          {
            label: 'Pegadinha',
            detail: 'Banca coloca causa química ou bacteriana no rótulo “mecânica”.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Mecânica = tempo + fixação; química = irritante; bacteriana = assepsia.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Tríade etiológica da flebite',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'MECÂNICA · QUÍMICA · BACTERIANA',
        rows: [
          {
            label: 'Mecânica',
            value: 'Canulação prolongada + cateter mal fixado — fricção/endotélio.',
            badge: 'hot',
          },
          {
            label: 'Química',
            value: 'Medicamento/solução irritante — pH ou osmolaridade elevada.',
            badge: 'warn',
          },
          {
            label: 'Bacteriana',
            value: 'Contaminação — higiene das mãos e técnica asséptica inadequadas.',
            badge: 'ok',
          },
          {
            label: 'Velocidade',
            value: 'Infusão rápida/incompatibilidade — mais química que mecânica pura.',
            badge: 'info',
          },
        ],
        footer_rule: 'Longa permanência + fixação ruim = mecânica — letra A.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Qual afirmativa sobre flebite mecânica?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: afirmativa correta sobre flebite (tipos química, mecânica, bacteriana).',
          'Letra A: flebite mecânica por longa canulação e cateter mal fixado — correto.',
          'Eliminar B: descreve higiene/assepsia — mecanismo bacteriano, não mecânico.',
          'Eliminar C: medicamento irritante/pH/osmolaridade — flebite química.',
          'Eliminar D: velocidade rápida e incompatibilidade — perfil químico/farmacológico.',
          'Marcar letra A.',
          'Fixação: mecânica = trauma físico do dispositivo no vaso.',
        ],
        footer_rule: 'Não rotule irritante químico como “mecânica”.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — tipos trocados',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — ETIOLOGIA DA FLEBITE',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — Higiene das mãos',
            detail: 'Causa bacteriana por contaminação — não mecânica.',
            correct: 'Mecânica = longa canulação + fixação inadequada (letra A).',
          },
          {
            label: 'Letra C — Irritante químico',
            detail: 'pH/osmolaridade define flebite química.',
            correct: 'Não confunda química com trauma físico do cateter.',
          },
          {
            label: 'Letra D — Velocidade/incompatibilidade',
            detail: 'Relaciona-se a irritação química/farmacológica na infusão.',
            correct: 'Flebite mecânica = dispositivo mal fixado por tempo prolongado.',
          },
          {
            label: 'Coexistência dos tipos',
            detail: 'Enunciado avisa que tipos podem ocorrer juntos — mas só A descreve mecânica.',
            correct: 'Escolha a afirmativa que nomeia corretamente o mecanismo mecânico.',
          },
        ],
        footer_rule: 'Decore: fixação + tempo = mecânica.',
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
    console.log(`[handcraft:puncao-g10] OK ${slug}`);
  }
  console.log(`[handcraft:puncao-g10] total=${ok}`);
}

main();
