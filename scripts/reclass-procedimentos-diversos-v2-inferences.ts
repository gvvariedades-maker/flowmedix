#!/usr/bin/env tsx
/**
 * Wave 3 — 12 restantes em Procedimentos Diversos (pós-piloto).
 * Gera batch-01-inferred.json para catalog-merge-agent-infer.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const ROWS: InferRow[] = [
  {
    modulo_slug: 'fepese-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-3',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.92,
    keep_current: true,
    rationale: 'Elementos da comunicação (códigos, mensagens, canais) — teoria aplicada à gestão; sem subtópico clínico-procedimental canônico.',
  },
  {
    modulo_slug: 'fundatec-enfermagem-processo-de-enfermagem-1780006947080-1',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.91,
    keep_current: true,
    rationale: 'Requisitos estruturais de quarto para radiofármacos — procedimento hospitalar especializado sem bucket canônico melhor.',
  },
  {
    modulo_slug: 'fundatec-enfermagem-processo-de-enfermagem-1780011961798-1',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.92,
    keep_current: true,
    rationale: 'Posicionamento de eletrodos para ECG de 12 derivações — técnica auxiliar de exame complementar; catch-all procedimental.',
  },
  {
    modulo_slug: 'idecan-enfermagem-cuidados-gerais-com-higiene-e-conforto-do-paciente-1778712184780-6',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.95,
    keep_current: true,
    rationale: 'Higiene íntima masculina e manejo do prepúcio — procedimento de conforto/higiene corporal.',
  },
  {
    modulo_slug: 'idecan-enfermagem-enfermagem-em-oncologia-1778712409051-5',
    suggested_subtopico: 'Cuidados na Administração de Medicamentos',
    confidence: 0.93,
    keep_current: false,
    rationale: 'Higiene oral durante administração de quimioterápicos — cuidado de enfermagem vinculado à administração de medicamentos.',
  },
  {
    modulo_slug: 'idib-enfermagem-saude-do-idoso-1778934944659-7',
    suggested_subtopico: 'Processo de Enfermagem',
    confidence: 0.92,
    keep_current: false,
    rationale: 'Avaliação geronto-geriátrica sistematizada — etapa de avaliação do processo de enfermagem no idoso.',
  },
  {
    modulo_slug: 'igeduc-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-1',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.93,
    keep_current: true,
    rationale: 'Estilos de liderança (autocrático vs participativo) — gestão administrativa, não procedimento técnico.',
  },
  {
    modulo_slug: 'instituto-verbena-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-4',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.9,
    keep_current: true,
    rationale: 'Multidisciplinaridade vs interdisciplinaridade em equipe — tema de gestão sem subtópico canônico específico.',
  },
  {
    modulo_slug: 'ufmt-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-5',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.91,
    keep_current: true,
    rationale: 'Trabalho em equipe, liderança e especialização — gestão da qualidade, não técnica procedimental.',
  },
  {
    modulo_slug: 'unesc-enfermagem-procedimentos-diversos-1780000535393-8',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.97,
    keep_current: true,
    rationale: 'Princípios gerais na execução de procedimentos de enfermagem — núcleo temático do bucket catch-all.',
  },
  {
    modulo_slug: 'vunesp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563718396-3',
    suggested_subtopico: 'Procedimentos Diversos',
    confidence: 0.9,
    keep_current: true,
    rationale: 'Trabalho em equipe multiprofissional e integralidade — gestão em enfermagem, permanece no catch-all.',
  },
];

const outDir = 'artifacts/reclass/faixa-c/procedimentos-diversos-v2';
writeFileSync(
  resolve(process.cwd(), `${outDir}/batch-01-inferred.json`),
  JSON.stringify({ batch: '01', bucket: 'Procedimentos Diversos', inferences: ROWS }, null, 2) + '\n',
);

const moves = ROWS.filter((r) => !r.keep_current && r.confidence >= 0.9);
console.log(
  JSON.stringify(
    {
      scanned: ROWS.length,
      keep: ROWS.filter((r) => r.keep_current).length,
      moves: moves.length,
      move_list: moves.map((m) => ({
        slug: m.modulo_slug,
        to: m.suggested_subtopico,
        confidence: m.confidence,
      })),
    },
    null,
    2,
  ),
);
