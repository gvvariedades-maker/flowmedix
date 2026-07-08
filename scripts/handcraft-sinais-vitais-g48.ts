#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g48 (4 slugs SHORT LOTE vitals_glasgow).
 * Cluster Glasgow / escala de coma (4 slugs — g48 fecha cluster inteiro).
 *
 *   npm run handcraft:sinais-vitais-g48
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g48';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN / ATLS',
  title: 'Escala de Coma de Glasgow — componentes e classificação',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'Glasgow — olhos 1–4 · verbal 1–5 · motor 1–6',
    'Total 3–15 · escore mínimo 3 (não zero)',
    'Grave ≤8 · moderado 9–12 · leve 13–15',
    'Ausência de abertura ocular = 1 ponto',
    'ECG 12 derivações — 4 membros + 6 precordiais',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: {
    instruction: string;
    text_fragment?: string;
    options: { id: string; text: string; is_correct: boolean }[];
  };
  modulo_slug?: string;
};

type Pack = {
  family: 'protocolo' | 'conceito';
  guideline: string;
  exam_vs_current?: string;
  roi_error: string;
  slides: unknown[];
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
    pedagogical_branch: 'vitals_glasgow',
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      roi_error: pack.roi_error,
    },
    sources: [SV_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'cpcon-uepb-enfermagem-verificacao-de-sinais-vitais-1779343945057-1': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — ECG 12 derivações: 4 eletrodos nos membros (2 braços + 2 pernas) geram as 6 derivações dos membros; 6 eletrodos precordiais no tórax (V1–V6)',
    exam_vs_current:
      'Questão catalogada no cluster Glasgow/ECG por builder legado — conteúdo cobrado é posicionamento de eletrodos do ECG cardíaco, não escala de coma',
    roi_error: 'ecg_eletrodos_12_derivações',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ECG 12 derivações — posicionamento',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Preparar o paciente para ECG de doze derivações — colocar eletrodos conforme técnica: membros e tórax.',
            icon: 'Target',
          },
          {
            label: 'Derivações dos membros',
            detail:
              'Quatro eletrodos nos membros (braços e pernas) formam a base das seis derivações dos membros (I, II, III, aVR, aVL, aVF).',
            icon: 'Activity',
          },
          {
            label: 'Derivações precordiais',
            detail:
              'Seis eletrodos no tórax (V1 a V6) registram as derivações precordiais — não confundir com membros.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — inverter nomes',
            detail:
              'Letra A troca “membros” e “precordiais” — banca testa se você sabe qual grupo fica no tórax.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — ECG em pediatria',
            detail:
              'Marcos precordiais V1–V6 mudam em lactente e pré-escolar — não aplicar posição de adulto em criança.',
            icon: 'Baby',
          },
          {
            label: 'Pegadinha — poucos eletrodos',
            detail:
              'Alternativas B, C e D reduzem ou alteram eletrodos nos membros — insuficientes para 6 derivações de membro.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '4 membros + 6 precordiais = ECG 12 derivações',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: preparar paciente para ECG de doze derivações — posicionar eletrodos.',
          'Fixar: ferramenta clínica com 12 derivações = 6 dos membros + 6 precordiais no tórax.',
          'Membros: quatro eletrodos (dois braços + duas pernas) → base das derivações dos membros.',
          'Tórax: seis eletrodos precordiais colocados conforme técnica (V1–V6).',
          'Testar A — inverte membros/precordiais → eliminar.',
          'Testar B — só dois eletrodos nos membros → eliminar.',
          'Testar C — padrão alternado braço/perna → eliminar.',
          'Testar D — três eletrodos nos membros → eliminar.',
          'Letra E: dois nos braços, dois nas pernas + seis no tórax → correta.',
          'Marcar E.',
        ],
        footer_rule: 'Membros = 4 eletrodos · tórax = 6 precordiais',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ECG 12 derivações',
        meta: slideMeta,
        content: 'ECG — DISTRIBUIÇÃO DOS ELETRODOS',
        rows: [
          { label: 'Membros', value: '4 eletrodos (2 braços + 2 pernas)', sv_kind: 'meta', badge: 'hot' },
          { label: 'Derivações de membro', value: 'I, II, III, aVR, aVL, aVF (6)', sv_kind: 'meta', badge: 'ok' },
          { label: 'Precordiais', value: '6 eletrodos no tórax (V1–V6)', sv_kind: 'meta', badge: 'hot' },
          { label: 'Total', value: '12 derivações simultâneas', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Não inverta membros × precordiais na prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ECG 12 DERIVAÇÕES',
        items: [
          {
            label: 'Letra A — trocar membros por precordiais',
            detail: 'Afirma que braços/pernas geram derivações precordiais e tórax gera derivações dos membros.',
            correct:
              'Derivações dos membros vêm dos 4 eletrodos em braços/pernas; precordiais (V1–V6) ficam no tórax.',
          },
          {
            label: 'Letra B — só dois eletrodos nos membros',
            detail: 'Um no braço esquerdo e um na perna esquerda — insuficiente para 6 derivações de membro.',
            correct:
              'São necessários quatro eletrodos nos membros (dois braços + duas pernas) para as derivações I–III e aVR/aVL/aVF.',
          },
          {
            label: 'Letra C — padrão alternado incorreto',
            detail: 'Braço esquerdo + perna direita — configuração que não corresponde ao padrão clássico de 4 membros.',
            correct:
              'O padrão cobrado é dois eletrodos nos braços e dois nas pernas, não alternância braço/perna opostos.',
          },
          {
            label: 'Letra D — três eletrodos nos membros',
            detail: 'Dois braços + uma perna — falta o quarto eletrodo para fechar as derivações dos membros.',
            correct:
              'Quatro eletrodos nos membros (ambos braços e ambas pernas) + seis precordiais no tórax = gabarito E.',
          },
        ],
        footer_rule: 'Confira membros (4) e precordiais (6) antes de marcar',
      },
    ],
  },

  'fau-unicentro-enfermagem-verificacao-de-sinais-vitais-1779344111854-0': {
    family: 'protocolo',
    guideline:
      'MS/ATLS — Glasgow abertura ocular: 4 espontânea · 3 ao comando verbal · 2 à dor · 1 nenhuma (mínimo 1, não zero)',
    roi_error: 'glasgow_ocular_minimo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Glasgow — componente ocular',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Pós-trauma: ausência persistente de abertura ocular, sem fatores de interferência — pontuação na escala de Glasgow.',
            icon: 'Target',
          },
          {
            label: 'Escala ocular',
            detail: 'Abertura ocular pontua de 1 (nenhuma) a 4 (espontânea) — escore mínimo do componente é 1.',
            icon: 'Eye',
          },
          {
            label: 'Ausência de abertura',
            detail:
              'Olhos não abrem espontaneamente nem ao estímulo — corresponde a 1 ponto, não a zero.',
            icon: 'EyeOff',
          },
          {
            label: 'Pegadinha — zero',
            detail: 'Letra A sugere 0 — Glasgow não usa zero em nenhum componente; mínimo total é 3.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — Glasgow pediátrico',
            detail:
              'Aplicar pontuação de adulto em lactente — escala pediátrica adapta resposta verbal/motora; não confundir com escore de RN.',
            icon: 'Baby',
          },
        ],
        footer_rule: 'Sem abertura ocular = 1 ponto (não zero)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: pontuação ocular na Glasgow — ausência persistente de abertura ocular.',
          'Identificar componente: abertura ocular (1 a 4).',
          'Ausência de abertura ocular, sem interferência = escore 1.',
          'Eliminar A (0) — Glasgow não tem zero; mínimo do componente é 1.',
          'Eliminar C (2) — abertura à dor, não ausência total.',
          'Eliminar D (3) — abertura ao comando verbal.',
          'Eliminar E (4) — abertura espontânea.',
          'Marcar B — 1 ponto.',
        ],
        footer_rule: 'Ausência ocular = 1 · mínimo Glasgow total = 3',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Glasgow ocular',
        meta: slideMeta,
        content: 'GLASGOW — ABERTURA OCULAR (1–4)',
        rows: [
          { label: '4', value: 'Espontânea', sv_kind: 'meta', badge: 'ok' },
          { label: '3', value: 'Ao comando verbal', sv_kind: 'meta', badge: 'ok' },
          { label: '2', value: 'À dor', sv_kind: 'meta', badge: 'warn' },
          { label: '1', value: 'Nenhuma — ausência persistente', sv_kind: 'meta', badge: 'hot' },
          { label: 'Pegadinha', value: 'Mínimo = 1 (não zero)', sv_kind: 'meta', badge: 'hot' },
        ],
        footer_rule: 'Glasgow total: 3–15 — nunca zero',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GLASGOW OCULAR',
        items: [
          {
            label: 'Letra A — escore zero',
            detail: 'Intuição de “ausência total = zero pontos”.',
            correct:
              'Glasgow não usa 0 — ausência de abertura ocular pontua 1; escore mínimo total da escala é 3.',
          },
          {
            label: 'Letra C — confundir com abertura à dor',
            detail: 'Achar que qualquer resposta mínima vale 2 pontos.',
            correct:
              'Abertura ocular à dor = 2; ausência persistente sem abertura = 1 — enunciado pede ausência total.',
          },
          {
            label: 'Letra D — abertura ao comando',
            detail: 'Confundir resposta ao estímulo verbal com ausência de abertura.',
            correct:
              'Abertura ao comando verbal = 3 pontos — paciente abre os olhos quando solicitado, não é ausência.',
          },
          {
            label: 'Letra E — abertura espontânea',
            detail: 'Marcar 4 por associação com “melhor resposta”.',
            correct:
              'Espontânea = 4 — incompatível com “ausência persistente de abertura ocular” do enunciado.',
          },
        ],
        footer_rule: 'Ausência ocular = 1 — gabarito B',
      },
    ],
  },

  'instituto-seletiva-enfermagem-verificacao-de-sinais-vitais-1779343865210-0': {
    family: 'protocolo',
    guideline:
      'MS/ATLS — Glasgow: somar olhos (1–4) + verbal (1–5) + motor (1–6); espontânea 4 + confuso 4 + obedece comandos 6 = 14',
    roi_error: 'glasgow_soma_componentes',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Glasgow — soma dos componentes',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Trauma por queda de moto: abertura espontânea, confuso, obedece comandos, pupilas isocóricas — pontuação total.',
            icon: 'Target',
          },
          {
            label: 'Abertura ocular',
            detail: 'Espontânea = 4 pontos no componente ocular.',
            icon: 'Eye',
          },
          {
            label: 'Resposta verbal',
            detail: 'Confuso (conversa desorientada) = 4 pontos no componente verbal.',
            icon: 'MessageCircle',
          },
          {
            label: 'Resposta motora',
            detail: 'Obedece a comandos = 6 pontos — melhor resposta motora.',
            icon: 'Hand',
          },
          {
            label: 'Pupilas — informação paralela',
            detail:
              'Isocóricas fotorreagentes na admissão — não entram na soma clássica Glasgow (olhos + verbal + motor).',
            icon: 'ScanEye',
          },
          {
            label: 'Pegadinha — soma parcial',
            detail:
              'Banca oferece 8, 9 ou 12 — erro reproduzível é não somar espontânea (4) + confuso (4) + obedece (6).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Some os três componentes — não invente escore',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: calcular pontuação total da Glasgow no caso clínico.',
          'Olhos: abertura espontânea → 4 pontos.',
          'Verbal: paciente confuso → 4 pontos.',
          'Motor: obedece a comandos → 6 pontos.',
          'Soma: 4 + 4 + 6 = 14.',
          'Eliminar A (8) — subestima componentes.',
          'Eliminar B (9) — típico de trauma grave, não deste caso.',
          'Eliminar C (12) — moderado; paciente obedece comandos e abre olhos espontaneamente.',
          'Marcar D — 14.',
        ],
        footer_rule: '4 + 4 + 6 = 14 — leve (13–15)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Glasgow completa',
        meta: slideMeta,
        content: 'GLASGOW — COMPONENTES E CLASSIFICAÇÃO',
        rows: [
          { label: 'Ocular (1–4)', value: '4 espontânea · 3 verbal · 2 dor · 1 nenhuma', sv_kind: 'meta', badge: 'ok' },
          { label: 'Verbal (1–5)', value: '5 orientado · 4 confuso · 3 palavras · 2 sons · 1 nenhuma', sv_kind: 'meta', badge: 'ok' },
          { label: 'Motor (1–6)', value: '6 obedece · 5 localiza · 4 retira · 3 flexão · 2 extensão · 1 nenhuma', sv_kind: 'meta', badge: 'ok' },
          { label: 'Total', value: '3 a 15 — grave ≤8 · moderado 9–12 · leve 13–15', sv_kind: 'meta', badge: 'hot' },
        ],
        footer_rule: 'Some olhos + verbal + motor antes de marcar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SOMA GLASGOW',
        items: [
          {
            label: 'Letra A — escore 8',
            detail: 'Associar trauma grave automaticamente sem somar componentes.',
            correct:
              '8 seria coma grave (≤8) — paciente com espontânea + confuso + obedece comandos soma 14, não 8.',
          },
          {
            label: 'Letra B — escore 9',
            detail: 'Confundir com limite inferior do moderado sem calcular.',
            correct:
              '9 = início do moderado — este caso tem olhos 4 e motor 6, impossível total tão baixo.',
          },
          {
            label: 'Letra C — escore 12',
            detail: 'Subestimar verbal ou motor — parar na soma parcial.',
            correct:
              '12 = teto do moderado — confuso (4) + espontânea (4) + obedece (6) = 14, acima de 12.',
          },
        ],
        footer_rule: 'Calcule cada componente — gabarito D (14)',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779344224014-0': {
    family: 'conceito',
    guideline:
      'MS/COFEN — Escala de Coma de Glasgow avalia consciência por abertura ocular, resposta verbal e resposta motora (3–15)',
    roi_error: 'glasgow_identificacao_escala',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Glasgow — identificação da escala',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Enfermaria neurológica: escala de admissão que pontua abertura ocular, resposta verbal e motora — nome da escala.',
            icon: 'Target',
          },
          {
            label: 'Tríade avaliada',
            detail:
              'Glasgow mede nível de consciência por olhos + verbal + motor — referência em trauma e neurologia.',
            icon: 'Brain',
          },
          {
            label: 'Pegadinha — Heimlich',
            detail: 'Manobra de desengasgo — banca induz confusão com “emergência”, não é escala de consciência.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — Cincinnati',
            detail: 'Escala pré-hospitalar de AVC (face, braços, fala) — confundir com escala de coma de Glasgow.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — Glasgow pediátrico',
            detail:
              'Aplicar escala de adulto em lactente — Glasgow pediátrico usa respostas adaptadas; não confundir com escala nominal de RN.',
            icon: 'Baby',
          },
        ],
        footer_rule: 'Olhos + verbal + motor = Glasgow',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: identificar escala que avalia olhos, verbal e motor na admissão neurológica.',
          'Reconhecer tríade: abertura ocular + resposta verbal + resposta motora.',
          'Eliminar A (Phillip) — nome sem vínculo com escala de coma.',
          'Eliminar B (Heimlich) — manobra de emergência respiratória.',
          'Eliminar C (Allen) — teste vascular de mão, não consciência.',
          'Eliminar D (Cincinnati) — triagem de AVC, não escala de coma.',
          'Marcar E — Glasgow.',
        ],
        footer_rule: 'Glasgow = escala de coma por tríade neurológica',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — escalas distintas',
        meta: slideMeta,
        content: 'GLASGOW × OUTRAS ESCALAS DE PROVA',
        rows: [
          { label: 'Glasgow', value: 'Olhos 1–4 + verbal 1–5 + motor 1–6 (total 3–15)', sv_kind: 'meta', badge: 'hot' },
          { label: 'Cincinnati', value: 'Triagem pré-hospitalar de AVC — face, braços, fala', sv_kind: 'meta', badge: 'warn' },
          { label: 'Heimlich', value: 'Manobra para corpo estranho em via aérea', sv_kind: 'meta', badge: 'warn' },
          { label: 'Classificação', value: 'Grave ≤8 · moderado 9–12 · leve 13–15', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Glasgow mede consciência — não confunda com AVC ou via aérea',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NOME DA ESCALA',
        items: [
          {
            label: 'Letra B — Heimlich',
            detail: 'Nome familiar em urgência — aluno associa “emergência” com consciência.',
            correct:
              'Heimlich é manobra de desobstrução de via aérea — não pontua olhos, verbal e motor.',
          },
          {
            label: 'Letra D — Cincinnati',
            detail: 'Também usada em neurologia/AVC — confusão por contexto de enfermaria neurológica.',
            correct:
              'Cincinnati tria déficit focal de AVC (face, braços, fala) — não é a escala de coma de Glasgow.',
          },
          {
            label: 'Letra C — Allen',
            detail: 'Termo técnico conhecido (teste de Allen) — parece “escala” por soar clínico.',
            correct:
              'Teste de Allen avalia perfusão palmar — não mede abertura ocular nem resposta verbal/motora.',
          },
          {
            label: 'Letra A — Phillip',
            detail: 'Nome aleatório que não corresponde a protocolo neurológico canônico.',
            correct:
              'Escala de coma com tríade olhos-verbal-motor é Glasgow — única alternativa com esse vínculo.',
          },
        ],
        footer_rule: 'Tríade neurológica = Glasgow — gabarito E',
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
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sv-g48] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g48] total=${ok}`);
}

main();
