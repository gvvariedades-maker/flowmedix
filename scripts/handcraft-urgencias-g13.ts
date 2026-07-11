#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g13 (1 slug · urgencias_exceto_conduta · lote final EXCETO).
 *
 *   npx tsx scripts/handcraft-urgencias-g13.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

import { metaBase, slideMeta, type Q } from './lib/urgenciasExcetoGolden';

const LOTE = 'urgencias-g13';
const REVIEWER = 'handcraft-urgencias-g13';

const FRATURA_MS_SOURCE = {
  id: 'urgencias-fratura-ms-sbv',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo SBV/SAMU — fratura e imobilização',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_suporte_basico_vida.pdf',
  covers: [
    'fratura exposta imobilizacao',
    'posicao encontrada',
    'nao reposicionar com dor',
    'resistencia ao reposicionamento',
    'acionar 192',
  ],
};

type Spec = {
  family: 'protocolo' | 'conceito' | 'vf';
  guideline: string;
  roiError: string;
  cluster: string;
  buildSlides: (q: Q) => unknown[];
};

const SPECS: Record<string, Spec> = {
  'adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-5': {
    family: 'protocolo',
    guideline:
      'Protocolo SBV/SAMU — fratura exposta: imobilizar segmento afetado buscando posição anatômica quando viável, sem forçar reposicionamento na presença de dor significativa ou resistência do paciente',
    roiError: 'fratura_exposta_imobilizacao_exceto_dor_resistencia',
    cluster: 'Fratura exposta — imobilização com exceção clínica (dor/resistência)',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'Fratura exposta — conduta inicial',
        chip_label: 'TRAUMA',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail:
              'Fratura exposta de extremidade — osso visível na ferida; priorizar imobilização segura no atendimento inicial.',
            icon: 'Target',
          },
          {
            label: 'Objetivo',
            detail:
              'Estabilizar o segmento, reduzir movimento e proteger tecidos — sem agravar lesão vascular ou nervosa.',
            icon: 'Shield',
          },
          {
            label: 'Posição anatômica',
            detail: 'Buscar alinhamento quando viável — mas não é mandato absoluto em trauma.',
            icon: 'Bone',
          },
          {
            label: 'Exceção clínica',
            detail: 'Dor significativa ou resistência do paciente = sinal para não forçar reposicionamento.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha de prova',
            detail:
              'Alternativas quase idênticas variam só a cláusula de exceção — leia o qualificador final.',
            icon: 'ScanSearch',
          },
        ],
        footer_rule: 'Imobilizar com critério — não forçar alinhamento à custa da dor',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Fratura exposta de extremidade — assinalar a conduta correta no atendimento inicial.',
          'Eixo imobilização: estabilizar segmento; alinhar quando viável, sem agravar lesão.',
          'Regra de exceção: dor intensa ou resistência do paciente contraindica forçar reposicionamento.',
          'Testar letra B — ignora dor e resistência ao forçar alinhamento → eliminar.',
          'Testar letra C — ainda força reposicionamento apesar da resistência → eliminar.',
          'Testar letra D — conduta cega, sem critério clínico → eliminar.',
          'Resta letra A — imobilizar buscando anatomia, exceto dor significativa ou resistência.',
          'Marcar A.',
          'Fixação: em trauma, microvariação no final da frase define o gabarito — leia o qualificador.',
        ],
        footer_rule: 'Estratégia: achar a exceção clínica, não a frase mais longa',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IMOBILIZAÇÃO NO PRÉ-HOSPITALAR',
        rows: [
          { label: 'Prioridade', value: 'Imobilizar o segmento afetado; controlar sangramento; acionar 192', badge: 'hot' },
          { label: 'Alinhamento', value: 'Buscar posição anatômica quando possível — sem forçar', badge: 'ok' },
          {
            label: 'Pare a manipulação',
            value: 'Dor significativa ou resistência → imobilizar como encontrado',
            badge: 'warn',
          },
          { label: 'Nunca', value: 'Empurrar osso exposto de volta à ferida no local', badge: 'warn' },
          { label: 'Curativo', value: 'Cobrir ferida com gaze estéril úmida — não circular apertado', badge: 'info' },
          { label: 'Transporte', value: 'Manter imobilização até avaliação hospitalar', badge: 'info' },
        ],
        footer_rule: 'Posição encontrada > alinhamento forçado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FRATURA EXPOSTA',
        items: [
          {
            label: 'Letra B — forçar apesar da dor',
            detail: 'Parece decisivo e “técnico” — alinhar custe o que custar.',
            correct:
              'Forçar reposicionamento com dor significativa agrava lesão e sangramento — conduta incorreta.',
          },
          {
            label: 'Letra C — ignorar resistência',
            detail: 'Quase igual à correta, mas retira só parte da exceção.',
            correct:
              'Resistência do paciente ao reposicionamento é sinal para imobilizar na posição encontrada.',
          },
          {
            label: 'Letra D — independente de tudo',
            detail: 'Versão mais absoluta — banca testa quem não lê o final da alternativa.',
            correct:
              'Imobilização em trauma nunca é cega: dor, resistência e exposição óssea limitam manipulação.',
          },
          {
            label: 'Transferência — reduzir osso exposto',
            detail: 'Em outra questão, a banca oferece recolocar o osso na ferida.',
            correct:
              'No pré-hospitalar, não reduzir fratura exposta no local — cobrir, imobilizar e transportar.',
          },
        ],
        footer_rule: 'A exceção (dor/resistência) é o que separa A de B, C e D',
      },
    ],
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, spec] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const slides = spec.buildSlides(raw);
    const meta = metaBase(raw, spec.family, spec.guideline, slug, spec.roiError, spec.cluster, REVIEWER);
    meta.sources = [FRATURA_MS_SOURCE];
    const out = {
      meta,
      question_data: raw.question_data,
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g13] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g13] total=${ok}`);
}

main();
