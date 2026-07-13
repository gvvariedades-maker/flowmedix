#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — puncao-venosa-e-cuidados-com-cateteres-g09 (3 slugs — fim cauda puncao_generico).
 *
 *   npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g09
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildPuncaoGuidelineSnapshot,
  buildPuncaoSourcesForSlug,
} from '@/lib/catalogMigration/puncaoPedagogy';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g09';
const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const BRANCH = 'puncao_generico';
const REVIEWED = '2026-07-12';

function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\bquedevem\b/gi, 'que devem')
    .replace(/\bAssociation\(\s*,/gi, 'Association (')
    .replace(/190X\s*168/gi, '190 × 168')
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
  'unifil-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562677534-2': {
    family: 'vf',
    guideline: 'Vasoativas — via central, bomba de infusão, monitorização hemodinâmica e fotossensibilidade',
    roi_error: 'vf_vasoativa_periferico_calibroso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Drogas vasoativas — I a IV',
        chip_label: 'PROTOCOLO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Cuidados na administração de drogas vasoativas — julgar afirmativas I a IV.',
            icon: 'Target',
          },
          {
            label: 'I — Acesso',
            detail: 'Preferir grande calibre no membro superior para “ver extravasamento” — INCORRETA.',
            icon: 'XCircle',
          },
          {
            label: 'II — Bomba',
            detail: 'Infusão lenta e rigidamente controlada por bomba infusora — correta.',
            icon: 'CheckCircle',
          },
          {
            label: 'III — Monitorização',
            detail: 'Sinais vitais, débito urinário, balanço hídrico e PVC — correta.',
            icon: 'CheckCircle',
          },
          {
            label: 'IV — Fotossensíveis',
            detail: 'Identificar drogas fotossensíveis e proteger da luz — correta.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: 'Vasoativa exige acesso profundo calibroso — não só periférico superficial.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Administração de vasoativas',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Via', value: 'Veia profunda de grande fluxo — diluição e segurança.', badge: 'hot' },
          { label: 'Bomba', value: 'Infusão lenta e controlada — nunca em bolus livre.', badge: 'ok' },
          { label: 'Monitorar', value: 'PA, FC, diurese, PVC e balanço hídrico.', badge: 'ok' },
          { label: 'Fotossensível', value: 'Proteger da luz — nitroprussiato e similares.', badge: 'warn' },
        ],
        footer_rule: 'Só a afirmativa I falha nesta questão.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Montar V-V-V',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: assertivas sobre drogas vasoativas — I a IV.',
          'Item I: infusão preferencial em grande calibre periférico — Falso (acesso profundo é o padrão).',
          'Item II: bomba infusora com controle rigoroso — Verdadeiro.',
          'Item III: monitorização contínua (SV, diurese, PVC) — Verdadeiro.',
          'Item IV: cuidados com fotossensíveis — Verdadeiro.',
          'Gabarito: apenas I está incorreta — letra D.',
          'Marcar letra D.',
        ],
        footer_rule: 'II + III + IV corretas; I é a intrusa.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Sequências erradas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — VASOATIVAS V/F',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Todas corretas',
            detail: 'Aceita item I (acesso periférico calibroso como preferência).',
            correct: 'I é falsa — vasoativa não vai em periférico de rotina.',
          },
          {
            label: 'Letra B — Só II e III',
            detail: 'Descarta IV (fotossensibilidade) — item verdadeiro.',
            correct: 'IV também está correta — eliminar B.',
          },
          {
            label: 'Letra C — Só IV',
            detail: 'Ignora II (bomba) e III (monitorização) — ambas corretas.',
            correct: 'D fecha: II, III e IV certas; só I errada.',
          },
        ],
        footer_rule: 'Memorize: acesso profundo + bomba + monitorar + luz.',
      },
    ],
  },

  'unifil-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562711132-2': {
    family: 'protocolo',
    guideline: 'Obstrução de cateter venoso — protocolo institucional; heparina é lock, não desobstrução de rotina',
    roi_error: 'obstrucao_cateter_agua_destilada_prova',
    exam_vs_current: 'obstrucao_cateter_agua_destilada_unifil',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Obstrução do cateter',
        chip_label: 'MANUTENÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Cateter venoso obstruído — qual substância a banca indica para recomposição de patência.',
            icon: 'Target',
          },
          {
            label: 'Obstrução',
            detail: 'Falha de fluxo por trombo/fibrina — não confundir com lock de manutenção.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Heparina',
            detail: 'Usada para salinização/heparinização entre usos — não é resposta da prova aqui.',
            icon: 'XCircle',
          },
          {
            label: 'Vitaminas / SG',
            detail: 'B12, vitamina C e SG5% não são agentes de desobstrução de cateter.',
            icon: 'Ban',
          },
          {
            label: 'Resposta banca',
            detail: 'Unifil marca água destilada — ensinar o que a banca cobrou.',
            icon: 'FileText',
          },
        ],
        footer_rule: 'Na prova: E — água destilada (diverge de protocolo atual).',
      },
      {
        type: 'golden_rule',
        slide_title: 'Patência do cateter',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Lock (manutenção)', value: 'SF ou heparina — prevenir trombose entre usos.', badge: 'ok' },
          { label: 'Obstrução', value: 'Avaliar causa — não forçar infusão.', badge: 'warn' },
          { label: 'Prova Unifil', value: 'Indica água destilada — registrar divergência.', badge: 'hot' },
          { label: 'Conduta atual', value: 'Trombolítico ou troca do dispositivo conforme protocolo.', badge: 'info' },
        ],
        footer_rule: 'Gabarito da questão = letra E.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Escolher a alternativa',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: obstrução do cateter venoso — substância recomendada.',
          'Eliminar A e B — vitaminas não desobstruem cateter.',
          'Eliminar C — SG5% não é agente de recomposição de patência na banca.',
          'Eliminar D — heparina é lock profilático, não resposta cobrada neste enunciado.',
          'Letra E: água destilada — gabarito Unifil.',
          'Marcar letra E.',
        ],
        footer_rule: 'Prova ≠ guideline — registrar em exam_vs_current.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Confundir lock × obstrução',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — CATETER OBSTRUÍDO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra D — Heparina',
            detail: 'Alternativa mais “técnica” — usada para manter patência, não desobstruir na prova.',
            correct: 'Banca escolheu E — não marcar D por senso clínico atual.',
          },
          {
            label: 'Letra C — SG5%',
            detail: 'Solução de manutenção/lock em outros contextos.',
            correct: 'Não fecha o comando de obstrução nesta questão.',
          },
          {
            label: 'Letra A — Vitamina B12',
            detail: 'Distrator sem relação com cateter venoso.',
            correct: 'E é a resposta literal da banca.',
          },
        ],
        footer_rule: 'Obstrução na prova → E (água destilada).',
      },
    ],
  },

  'vunesp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562687359-0': {
    family: 'protocolo',
    guideline: 'RCP na gestante — compressões de alta qualidade; acesso venoso acima do diafragma para medicações',
    roi_error: 'rcp_gestante_acesso_venoso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PCR na gestante — RCP',
        chip_label: 'PROTOCOLO',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário',
            detail: 'Gestante com eclâmpsia/instabilidade — intubação, acesso periférico, sulfato de magnésio — evolui para PCR.',
            icon: 'Target',
          },
          {
            label: 'RCP de qualidade',
            detail: 'Compressões torácicas efetivas — prioridade materna (salvar a mãe salva o feto).',
            icon: 'Heart',
          },
          {
            label: 'Acesso venoso',
            detail: 'Obter via acima do diafragma — facilita chegada de fármacos à circulação materna.',
            icon: 'Syringe',
          },
          {
            label: 'Deslocar útero',
            detail: 'Inclinação lateral manual do útero gravídico — reduz compressão da cava.',
            icon: 'User',
          },
          {
            label: 'Pegadinha',
            detail: 'Fowler baixo, monitor fetal antes da mãe estável ou acelerar magnésio na PCR.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Mãe primeiro — acesso EV alto + compressões eficazes.',
      },
      {
        type: 'golden_rule',
        slide_title: 'RCP — gestante (AHA)',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Prioridade', value: 'Reanimação materna de alta qualidade.', badge: 'hot' },
          { label: 'Acesso', value: 'Venoso acima do diafragma para drogas.', badge: 'hot' },
          { label: 'Útero', value: 'Deslocar manualmente para a esquerda durante compressões.', badge: 'ok' },
          { label: 'Evitar', value: 'Fowler baixo, foco fetal antes de estabilizar mãe.', badge: 'warn' },
        ],
        footer_rule: 'E = acesso venoso acima do diafragma.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Conduta na PCR gestacional',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Cenário: gestante em PCR após sulfato de magnésio e acesso periférico.',
          'Eliminar A — Fowler baixo não é posição padrão de RCP.',
          'Eliminar B — monitor fetal não precede reanimação materna eficaz.',
          'Eliminar C — ventilações isoladas sem sequência ACLS correta.',
          'Eliminar D — não aumentar magnésio na parada — manejo conforme protocolo.',
          'Letra E: obter acesso venoso acima do diafragma.',
          'Marcar letra E.',
        ],
        footer_rule: 'AHA: deslocar útero + acesso alto + compressões.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Erros na gestante em PCR',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — RCP OBSTÉTRICA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Fowler baixo',
            detail: 'Posição não facilita RCP nem descompressão da cava.',
            correct: 'Inclinação lateral do útero é o cuidado posicional específico.',
          },
          {
            label: 'Letra B — Monitor fetal',
            detail: 'Fetal só após início efetivo da reanimação materna.',
            correct: 'Prioridade = circulação materna.',
          },
          {
            label: 'Letra D — Magnésio rápido',
            detail: 'Na PCR não se acelera droga vasoativa sem protocolo.',
            correct: 'E descreve acesso adequado para medicações.',
          },
        ],
        footer_rule: 'Salvar a mãe é salvar o feto.',
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
    console.log(`[handcraft:puncao-g09] OK ${slug}`);
  }
  console.log(`[handcraft:puncao-g09] total=${ok}`);
}

main();
