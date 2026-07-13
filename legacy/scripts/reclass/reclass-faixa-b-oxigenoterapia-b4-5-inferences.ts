#!/usr/bin/env tsx
/**
 * Onda 7 — Oxigenoterapia faixa B, lotes 04–05.
 * Gera batch-04..05-inferred.json para catalog-merge-agent-infer.
 *
 *   npx tsx scripts/reclass-faixa-b-oxigenoterapia-b4-5-inferences.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const OXI = 'Oxigenoterapia e Cuidados Respiratórios';
const OUT = 'artifacts/reclass/faixa-b/oxigenoterapia';
const SV = 'Verificação de Sinais Vitais';
const DRC = 'Doenças Respiratórias Crônicas (Asma, DPOC)';
const FISIO = 'Noções de Fisiologia';
const URG = 'Urgências e Emergências';
const PE = 'Processo de Enfermagem';
const VIRAL =
  'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';
const PROC_ART = 'Processamento de Artigos e Produtos de Saúde';

/** Overrides manuais pós-leitura (slug → [subtopico, rationale, confidence]) */
const MANUAL = new Map<string, [string, string, number]>([
  // batch 04
  [
    'instituto-iacp-enfermagem-processo-de-enfermagem-1780004280851-6',
    [DRC, 'Critério espirométrico VEF1/CVF para diagnóstico de DPOC.', 0.95],
  ],
  [
    'instituto-jk-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1779344637595-3',
    [SV, 'Definição de taquipneia — parâmetro de frequência respiratória.', 0.94],
  ],
  [
    'instituto-verbena-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1779344712561-1',
    [SV, 'Ritmos respiratórios anormais no contexto de aferição de FR.', 0.93],
  ],
  [
    'legalle-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1779344742779-4',
    [SV, 'Taquipneia — alteração da frequência respiratória.', 0.94],
  ],
  [
    'legalle-enfermagem-processo-de-enfermagem-1780010585356-5',
    [FISIO, 'Função do sistema respiratório e divisão das vias aéreas.', 0.93],
  ],
  [
    'legalle-enfermagem-processo-de-enfermagem-1780010905023-8',
    [URG, 'Acidente vascular cerebral — emergência neurológica.', 0.96],
  ],
  [
    'legalle-enfermagem-processo-de-enfermagem-1780010905023-9',
    [FISIO, 'Função do sistema vascular e transporte de O2.', 0.92],
  ],
  [
    'ms-sarmento-enfermagem-processo-de-enfermagem-1780008210115-7',
    [URG, 'Obstrução de vias aéreas por corpo estranho — primeiros socorros.', 0.95],
  ],
  [
    'objetiva-concursos-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1779344651728-7',
    [PE, 'Avaliação cardiopulmonar e histórico no processo de enfermagem.', 0.91],
  ],
  [
    'objetiva-concursos-enfermagem-processo-de-enfermagem-1780010566816-9',
    [VIRAL, 'Varicela — doença viral infectocontagiosa.', 0.96],
  ],
  [
    'quadrix-enfermagem-processo-de-enfermagem-1780009294428-0',
    [PROC_ART, 'Classificação e desinfecção de materiais semicríticos (máscara de O2).', 0.94],
  ],
  [
    'selecon-enfermagem-processo-de-enfermagem-1780009310940-6',
    [FISIO, 'Fisiologia da anemia e hemácias.', 0.93],
  ],
  [
    'selecon-enfermagem-urgencias-e-emergencias-1777104038968-3',
    [URG, 'Ventilação e oxigenação pós-RCP no protocolo SAMU.', 0.95],
  ],
  [
    'selecon-enfermagem-urgencias-e-emergencias-1777104038968-5',
    [URG, 'Oxigenoterapia no protocolo de afogamento — emergência.', 0.94],
  ],
  // batch 05
  [
    'univali-enfermagem-processo-de-enfermagem-1780010600919-9',
    [DRC, 'Manejo de DPOC crônico na atenção básica.', 0.92],
  ],
  [
    'vunesp-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1776056600234-8',
    [SV, 'Interferências na leitura do oxímetro de pulso (SpO2).', 0.94],
  ],
  [
    'vunesp-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1776056600234-9',
    [URG, 'Manobra de Heimlich — obstrução de via aérea.', 0.97],
  ],
  [
    'vunesp-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1779344701804-5',
    [VIRAL, 'Quadro febril com tosse e anosmia — suspeita de Covid-19.', 0.95],
  ],
  [
    'vunesp-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1779344657661-1',
    [OXI, 'Aspiração de vias aéreas em paciente com traqueostomia.', 0.94],
  ],
]);

const OXI_CORE =
  /oxigenoterapia|oxigenioterapia|oxigênio (medicinal|suplementar)|inaloterapia|inalação|nebuliza|cateter nasal|máscara (de |facial|venturi|com reservatório)|dispositivos? de oxigênio|fluxo de o2|fio2|hipoxemia|hipóxia|aspiração (das |de )?vias aéreas|aspiração endotraqueal|aspiração da traqueostomia|traqueostomia.*aspira|capnógrafo|ventilação mecânica|umidificador|inaloterapia|desobstrução das vias aéreas superiores/i;

function classify(slug: string, instruction: string, options: string): InferRow {
  if (MANUAL.has(slug)) {
    const [suggested, rationale, confidence] = MANUAL.get(slug)!;
    return {
      modulo_slug: slug,
      suggested_subtopico: suggested,
      confidence,
      keep_current: suggested === OXI,
      rationale,
    };
  }

  const text = `${instruction} ${options}`.toLowerCase();

  if (OXI_CORE.test(text)) {
    const nonOxiDominant =
      /espirometria|vef1\/cvf|manobra de heimlich|engasgad|corpo estranho.*via aérea|acidente vascular cerebral|\bavc\b|varicela|anosmia|perda do olfato|materiais semicríticos|desinfecção de alto nível|anemia.*hemácias|sistema vascular.*transporte|função principal.*troca gasosa.*dividido em vias/i;
    if (!nonOxiDominant.test(text)) {
      return {
        modulo_slug: slug,
        suggested_subtopico: OXI,
        confidence: 0.94,
        keep_current: true,
        rationale: 'Oxigenoterapia, inalação, dispositivos ou cuidados respiratórios.',
      };
    }
  }

  const rules: { re: RegExp; to: string; r: string; c: number }[] = [
    {
      re: /manobra de heimlich.*consiste|engasgad|obstrução das vias aéreas.*(sólido|corpo estranho)|primeiros socorros.*via aérea/i,
      to: URG,
      r: 'Emergência — obstrução de via aérea.',
      c: 0.96,
    },
    {
      re: /acidente vascular cerebral|\bavc\b/i,
      to: URG,
      r: 'AVC — urgência neurológica.',
      c: 0.96,
    },
    {
      re: /varicela|varicela-zóster/i,
      to: VIRAL,
      r: 'Varicela — doença viral.',
      c: 0.96,
    },
    {
      re: /perda do olfato|anosmia.*febre.*tosse/i,
      to: VIRAL,
      r: 'Quadro viral respiratório (Covid-19).',
      c: 0.95,
    },
    {
      re: /espirometria|vef1\/cvf|limitação crônica ao fluxo aéreo/i,
      to: DRC,
      r: 'Diagnóstico ou manejo de DPOC/asma crônica.',
      c: 0.93,
    },
    {
      re: /taquipneia|bradipneia|ritmo de (cheyne|biot|kussmaul)|alterações dos ritmos respiratórios|frequência respiratória.*respirações\/minuto/i,
      to: SV,
      r: 'Frequência ou ritmo respiratório — sinal vital.',
      c: 0.92,
    },
    {
      re: /oxímetr|oximetria de pulso|spo2|saturação de oxigênio.*interfer/i,
      to: SV,
      r: 'Oximetria de pulso — técnica de SpO2.',
      c: 0.93,
    },
    {
      re: /materiais semicríticos|desinfecção de alto nível|processamento de artigos/i,
      to: PROC_ART,
      r: 'Processamento e desinfecção de materiais.',
      c: 0.93,
    },
    {
      re: /anemia.*hemoglobina|hemácias circulantes/i,
      to: FISIO,
      r: 'Fisiologia hematológica.',
      c: 0.92,
    },
    {
      re: /sistema (respiratório|vascular).*função|troca gasosa.*vias aéreas/i,
      to: FISIO,
      r: 'Fisiologia do sistema respiratório/vascular.',
      c: 0.91,
    },
    {
      re: /suporte básico de vida|pós-rcp|protocolo.*afogamento|samu.*ventilação/i,
      to: URG,
      r: 'Protocolo de urgência/emergência.',
      c: 0.94,
    },
    {
      re: /avaliação.*cardiopulmonar|histórico.*função cardiopulmonar/i,
      to: PE,
      r: 'Avaliação cardiopulmonar no processo de enfermagem.',
      c: 0.9,
    },
    {
      re: /dpoc.*unidade básica|manejo respiratório.*dpoc|doença pulmonar obstrutiva crônica.*monitoramento/i,
      to: DRC,
      r: 'Doença respiratória crônica — DPOC.',
      c: 0.91,
    },
  ];

  for (const rule of rules) {
    if (rule.re.test(text) || rule.re.test(slug)) {
      return {
        modulo_slug: slug,
        suggested_subtopico: rule.to,
        confidence: rule.c,
        keep_current: rule.to === OXI,
        rationale: rule.r,
      };
    }
  }

  if (slug.includes('oxigenoterapia-e-cuidados-respiratorios')) {
    return {
      modulo_slug: slug,
      suggested_subtopico: OXI,
      confidence: 0.9,
      keep_current: true,
      rationale: 'Conteúdo de oxigenoterapia e cuidados respiratórios.',
    };
  }

  return {
    modulo_slug: slug,
    suggested_subtopico: OXI,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Tema compatível com oxigenoterapia ou sem destino canônico claro ≥0,90.',
  };
}

let totalScanned = 0;
let totalMoves = 0;

for (const batch of ['04', '05']) {
  const data = JSON.parse(readFileSync(resolve(OUT, `batch-${batch}.json`), 'utf8')) as {
    items: { modulo_slug: string; instruction?: string; optionsPreview?: string }[];
  };
  const inferences = data.items.map((it) =>
    classify(it.modulo_slug, it.instruction || '', it.optionsPreview || ''),
  );
  writeFileSync(
    resolve(OUT, `batch-${batch}-inferred.json`),
    JSON.stringify({ batch, bucket: OXI, inferences }, null, 2) + '\n',
  );
  const moves = inferences.filter((r) => !r.keep_current && r.confidence >= 0.9);
  totalScanned += inferences.length;
  totalMoves += moves.length;
  console.log(`batch-${batch}: ${inferences.length} scanned, ${moves.length} moves (>=0.90)`);
}

console.log(JSON.stringify({ scanned: totalScanned, moves: totalMoves }, null, 2));
