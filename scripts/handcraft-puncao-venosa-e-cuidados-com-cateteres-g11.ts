#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — puncao-venosa-e-cuidados-com-cateteres-g11 (3 slugs — fim puncao_flebite).
 *
 *   npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g11
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildPuncaoGuidelineSnapshot,
  buildPuncaoSourcesForSlug,
} from '@/lib/catalogMigration/puncaoPedagogy';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g11';
const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const BRANCH = 'puncao_flebite';
const REVIEWED = '2026-07-12';

function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\bodesaparecimento\b/gi, 'o desaparecimento')
    .replace(/\bsemnecessidade\b/gi, 'sem necessidade')
    .replace(/\bapareçam,para\b/gi, 'apareçam, para')
    .replace(/\bAconduta\b/gi, 'A conduta')
    .replace(/\baconduta\b/gi, 'a conduta')
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
  'objetiva-concursos-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562705224-7': {
    family: 'conceito',
    guideline: 'Flebite — processo inflamatório da veia com dor e hiperemia no trajeto venoso',
    roi_error: 'flebite_vs_infiltracao_hematoma_equimose',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lacuna — complicação inflamatória venosa',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Pista do enunciado',
            detail:
              'Processo inflamatório nas veias, com área dolorosa e hiperemiada — nome da complicação do acesso.',
            icon: 'Search',
          },
          {
            label: 'Flebite',
            detail: 'Inflamação do endotélio/trajeto venoso — dor, calor e rubor ao longo da veia.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Infiltração',
            detail: 'Solução medicamentosa extravasa para o subcutâneo — mecanismo químico local, não “inflamação da parede venosa”.',
            icon: 'Droplets',
          },
          {
            label: 'Hematoma / equimose',
            detail: 'Sangue no tecido por punção — equimose; não descreve inflamação venosa primária.',
            icon: 'CircleX',
          },
        ],
        footer_rule: 'Inflamação + dor + hiperemia no trajeto venoso = flebite.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Complicações locais — mecanismo × nome',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'SEPARAR PELO QUE ACONTECEU NO VASO OU NO TECIDO',
        rows: [
          { label: 'Flebite', value: 'Inflamação da veia — dor, calor, rubor/hiperemia no trajeto.', badge: 'hot' },
          { label: 'Infiltração', value: 'Medicamento fora do lúmen venoso no subcutâneo.', badge: 'warn' },
          { label: 'Hematoma', value: 'Extravasamento de sangue no tecido pela punção.', badge: 'info' },
          { label: 'Equimose', value: 'Mancha roxa por sangue superficial — não é termo inflamatório venoso.', badge: 'info' },
        ],
        footer_rule: 'Lacuna pede inflamação venosa — não confunda com sangue ou solução no tecido.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Preencher lacuna — qual complicação?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Ler a definição: processo inflamatório nas veias + dor + hiperemia.',
          'Mecanismo-alvo: inflamação do trajeto venoso (endotélio), não extravasamento de sangue ou solução.',
          'Eliminar A (infiltração): solução fora do vaso — não é inflamação da parede venosa.',
          'Eliminar B (hematoma): sangue no tecido — equimose por punção.',
          'Eliminar D (equimose): manifestação de sangue superficial — não nomeia inflamação venosa.',
          'Letra C (flebite): inflamação venosa com dor e hiperemia — fecha a lacuna.',
          'Marcar letra C.',
          'Conduta associada: suspender infusão e retirar o dispositivo — não manter cateter inflamado.',
        ],
        footer_rule: 'Objetiva troca flebite por infiltração ou hematoma na definição.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — “inchaço” na punção',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — DEFINIÇÃO DE FLEBITE',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Infiltração',
            detail: 'Aluno associa qualquer complicação local à solução extravasada.',
            correct: 'Infiltração = medicamento no subcutâneo — a lacuna pede inflamação da veia.',
          },
          {
            label: 'Letra B — Hematoma',
            detail: 'Punção sempre “sangra”, mas hematoma não é processo inflamatório venoso.',
            correct: 'Hematoma é sangue no tecido — não explica hiperemia inflamatória do trajeto.',
          },
          {
            label: 'Letra D — Equimose',
            detail: 'Termo visual (mancha roxa), não definição de inflamação venosa.',
            correct: 'Equimose pode coexistir, mas não define flebite — escolha inflamação venosa (C).',
          },
        ],
        footer_rule: 'Definição clássica: flebite = inflamação + dor + hiperemia no trajeto.',
      },
    ],
  },

  'selecon-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340191984-1': {
    family: 'protocolo',
    guideline: 'Flebite no AVP — sinais locais intensos; conduta: suspender infusão, remover cateter e comunicar enfermeiro',
    roi_error: 'flebite_manter_infusao_vs_retirada_imediata',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sinais e conduta — flebite no AVP',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Contexto',
            detail: 'Técnico monitora AVP — identificar sinais de flebite e agir sem esperar sepse.',
            icon: 'Eye',
          },
          {
            label: 'Sinais típicos',
            detail: 'Dor intensa, eritema, calor, edema, endurecimento e cordão palpável no trajeto venoso.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Conduta imediata',
            detail: 'Suspender infusão, remover cateter e comunicar enfermeiro para novo acesso.',
            icon: 'CircleX',
          },
          {
            label: 'Pegadinha da banca',
            detail: 'Alternativas que pedem “só observar” ou manter infusão até febre/calafrios.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Flebite não espera infecção sistêmica — retire o cateter ao reconhecer sinais.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Flebite — reconhecer × agir',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'SINAIS LOCAIS INTENSOS → PARAR INFUSÃO → RETIRAR CATETER',
        rows: [
          { label: 'Dor / eritema', value: 'Intensidade acima de “leve desconforto” — sinal de alerta.', badge: 'warn' },
          { label: 'Calor + edema', value: 'Resposta inflamatória no sítio e trajeto.', badge: 'hot' },
          { label: 'Endurecimento / cordão', value: 'Veia palpável endurecida — flebite estabelecida.', badge: 'hot' },
          { label: 'Conduta', value: 'Suspender, remover, documentar e escalar ao enfermeiro.', badge: 'ok' },
          { label: 'Não fazer', value: 'Manter infusão “até sumir” ou até febre sistêmica.', badge: 'info' },
        ],
        footer_rule: 'Prova Selecon testa se você mantém ou retira o AVP inflamado.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Qual afirmativa está correta?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: afirmativa correta sobre sinais clínicos e conduta na flebite do AVP.',
          'Eliminar A: dor moderada com “só monitorar e manter infusão” — conduta passiva incorreta.',
          'Eliminar B: continuar infusão até febre/calafrios — espera sepse; flebite exige ação local imediata.',
          'Eliminar C: dor leve com observação sem interromper infusão — subestima gravidade.',
          'Letra D: descreve sinais completos (dor intensa, eritema, calor, edema, endurecimento, cordão) e conduta correta.',
          'Marcar letra D.',
          'Fixação: comunicar enfermeiro após retirada — novo acesso e registro.',
        ],
        footer_rule: 'Qualquer alternativa que mantém infusão no AVP inflamado está errada.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — “é só leve, observa”',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — CONDUTA NA FLEBITE',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Monitorar e manter',
            detail: 'Minimiza sinais e propõe manter infusão até desaparecer sintomas.',
            correct: 'Flebite exige suspender infusão e retirar cateter — não observação passiva.',
          },
          {
            label: 'Letra B — Esperar febre sistêmica',
            detail: 'Conduta tardia: só retirar com infecção sistêmica.',
            correct: 'Sinais locais já mandam parar — não aguarde calafrios para remover o AVP.',
          },
          {
            label: 'Letra C — Dor leve sem interromper',
            detail: 'Descreve quadro brando e mantém infusão.',
            correct: 'Endurecimento e cordão venoso indicam flebite — interrompa a infusão imediatamente.',
          },
        ],
        footer_rule: 'Selecon cobra retirada precoce do dispositivo — não “watch and wait”.',
      },
    ],
  },

  'unifil-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562677534-3': {
    family: 'conceito',
    guideline: 'Flebite — inflamação da camada interna da parede vascular relacionada ao dispositivo de acesso venoso',
    roi_error: 'flebite_vs_trombose_varizes_fistula',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Definição — inflamação vascular no acesso',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Enunciado',
            detail:
              'Inflamação da camada interna da parede do vaso, ligada à instalação de dispositivo para acesso venoso.',
            icon: 'BookOpen',
          },
          {
            label: 'Flebite',
            detail: 'Inflamação do endotélio/trajeto venoso no sítio do cateter — dor, calor e rubor.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Trombose venosa',
            detail: 'Coágulo obstruindo o lúmen — evento trombótico, não definição primária de inflamação por cateter.',
            icon: 'CircleX',
          },
          {
            label: 'Varizes / fístula',
            detail: 'Varizes = dilatação crônica; fístula = comunicação anormal entre estruturas — fora do conceito pedido.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Dispositivo venoso + inflamação da parede interna = flebite.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Termos que a banca mistura',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'INFLAMAÇÃO ENDOVENOSA × OUTRAS PATOLOGIAS VENOSAS',
        rows: [
          { label: 'Flebite', value: 'Inflamação da íntima venosa — frequentemente iatrogênica (cateter).', badge: 'hot' },
          { label: 'Trombose', value: 'Formação de trombo com obstrução — pode complicar flebite, mas não é a definição pedida.', badge: 'warn' },
          { label: 'Varizes', value: 'Dilatação venosa crônica insuficiente — não inflamação aguda por dispositivo.', badge: 'info' },
          { label: 'Fístula', value: 'Comunicação arteriovenosa ou anormal — outro mecanismo.', badge: 'info' },
        ],
        footer_rule: 'Lacuna conceitual: inflamação + dispositivo venoso → flebite.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Qual termo completa a definição?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Ler: inflamação da camada interna da parede vascular + relação com dispositivo de acesso venoso.',
          'Eliminar A (trombose venosa): ênfase em coágulo/obstrução — não definição inflamatória primária.',
          'Eliminar B (varizes): patologia crônica de insuficiência venosa — não inflamação aguda por cateter.',
          'Eliminar C (fístula): comunicação anormal entre vasos/estruturas — fora do enunciado.',
          'Letra D (flebite): inflamação do endotélio venoso no contexto do acesso — fecha a definição.',
          'Marcar letra D.',
          'Conduta clínica associada: retirar dispositivo e não reutilizar o mesmo acesso inflamado.',
        ],
        footer_rule: 'Unifil testa vocabulário — não troque flebite por trombose na definição.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — “tudo é trombose”',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — DEFINIÇÃO ANATÔMICA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Trombose venosa',
            detail: 'Aluno generaliza qualquer complicação venosa como trombose.',
            correct: 'Trombose é evento trombótico — o enunciado pede inflamação da íntima por dispositivo.',
          },
          {
            label: 'Letra B — Varizes',
            detail: 'Confunde patologia crônica com complicação aguda do cateter.',
            correct: 'Varizes não se instalam com dispositivo de acesso — escolha inflamação venosa (flebite).',
          },
          {
            label: 'Letra C — Fístula',
            detail: 'Termo de comunicação anormal — não inflamação endothelial por AVP.',
            correct: 'Fístula arteriovenosa é outro conceito — definição pede flebite.',
          },
        ],
        footer_rule: 'Memorize: íntima inflamada + cateter = flebite.',
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
    console.log(`[handcraft:puncao-g11] OK ${slug}`);
  }
  console.log(`[handcraft:puncao-g11] total=${ok}`);
}

main();
