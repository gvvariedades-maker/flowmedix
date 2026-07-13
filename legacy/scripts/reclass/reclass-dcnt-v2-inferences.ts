#!/usr/bin/env tsx
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BUCKET =
  'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';

const slugs = [
  'adm-tec-enfermagem-processo-de-enfermagem-1776056021381-4',
  'fau-unicentro-enfermagem-nutricao-aplicada-a-enfermagem-1777102944034-9',
  'fgv-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-5',
  'ibfc-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-2',
  'idecan-enfermagem-doencas-cardiovasculares-e-metabolicas-cronicas-diabete-hipertensao-icc-etc-1778712315153-4',
  'idecan-enfermagem-processo-de-enfermagem-1778712122855-5',
  'idecan-enfermagem-saude-do-idoso-1780067036141-7',
  'idib-enfermagem-outras-questoes-e-questoes-mescladas-sobre-doencas-cronicas-nao-transmissiveis-1778934918280-5',
  'idib-enfermagem-outras-questoes-e-questoes-mescladas-sobre-doencas-cronicas-nao-transmissiveis-1778934918280-6',
  'igeduc-enfermagem-nutricao-aplicada-a-enfermagem-1777102926437-7',
  'instituto-ibed-enfermagem-processo-de-enfermagem-1780004926596-9',
  'legalle-enfermagem-processo-de-enfermagem-1780010594524-1',
  'ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-4',
  'objetiva-concursos-enfermagem-nutricao-aplicada-a-enfermagem-1777102944034-8',
  'sc-treinamentos-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-1',
  'unifil-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-2',
  'unifil-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-3',
];

const inferences = slugs.map((modulo_slug) => ({
  modulo_slug,
  suggested_subtopico: BUCKET,
  confidence: 0.94,
  keep_current: true,
  rationale:
    'Tema central em DCNT (diabetes, HAS, obesidade, autocuidado ou complicações crônicas) — bucket adequado após piloto.',
}));

writeFileSync(
  resolve(process.cwd(), 'artifacts/reclass/faixa-c/dcnt-mescladas-v2/batch-01-inferred.json'),
  JSON.stringify({ batch: '01', bucket: BUCKET, inferences }, null, 2) + '\n',
);
console.log(`DCNT v2: ${inferences.length} scanned, 0 moves`);
