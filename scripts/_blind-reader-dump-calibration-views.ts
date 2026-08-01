#!/usr/bin/env tsx
/**
 * F2c — dump das 20 âncoras de calibração (só concept_map) para revisão humana.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildBlindReaderView,
  correctLetterOf,
  type BlindReaderQuestionPayload,
} from '@/lib/neurocanvas/blindReaderGate';

const samplePath = resolve(process.cwd(), 'artifacts/blind-reader-calibration-sample.json');
if (!existsSync(samplePath)) {
  console.error('missing calibration sample — run scripts/_blind-reader-pick-calibration.ts first');
  process.exit(1);
}

const sample = JSON.parse(readFileSync(samplePath, 'utf8')) as {
  calibration_sample: {
    slug: string;
    expected_bucket: string;
    family: string | null;
    correct: string | null;
  }[];
};

const LETTER_HINT_RE =
  /\b([A-E])\b\s*(?:é|erra|está|são|correta|incorreta)|letra\s+([A-E])\b/gi;
const VF_PREFIX_RE = /^(FALSA|VERDADEIRA|FALSO|VERDADEIRO)\b/gim;

type CalibRow = {
  slug: string;
  expected_bucket: string;
  family: string | null;
  correct_letter: string | null;
  surfaces_count: number;
  redacted_text: string;
  heuristic_letter_hits: string[];
  vf_verdict_prefixes: string[];
  /**
   * Julgamento humano a priori (só do texto do concept_map):
   * - leak: o texto revela a letra do gabarito
   * - indeterminate: não dá para saber a letra
   * - ambiguous: menciona letra(s) mas não amarra ao gabarito com clareza
   */
  human_a_priori: 'leak' | 'indeterminate' | 'ambiguous';
  human_notes: string;
};

const rows: CalibRow[] = [];

for (const s of sample.calibration_sample) {
  const path = resolve(process.cwd(), 'examples', `${s.slug}.json`);
  const payload = JSON.parse(readFileSync(path, 'utf8')) as BlindReaderQuestionPayload;
  const view = buildBlindReaderView(payload, s.slug);
  const correct = correctLetterOf(payload);
  const text = view?.redacted_text ?? '';

  const letterHits = new Set<string>();
  for (const m of text.matchAll(LETTER_HINT_RE)) {
    const letter = (m[1] ?? m[2] ?? '').toUpperCase();
    if (letter) letterHits.add(letter);
  }
  const vfPrefixes = [...text.matchAll(VF_PREFIX_RE)].map((m) => m[1].toUpperCase());

  let human_a_priori: CalibRow['human_a_priori'] = 'indeterminate';
  let human_notes = 'Sem citação de letra A–E amarrada ao gabarito.';

  if (letterHits.size > 0 && correct && letterHits.has(correct)) {
    human_a_priori = 'leak';
    human_notes = `Texto cita a letra do gabarito (${correct}) de forma legível sem enunciado.`;
  } else if (letterHits.size > 0) {
    human_a_priori = 'ambiguous';
    human_notes = `Cita letra(s) ${[...letterHits].join(',')} mas não a do gabarito (${correct ?? '?'}).`;
  } else if (vfPrefixes.length > 0 && s.expected_bucket === 'regex_spoiler') {
    // V/F verdicts alone don't reveal WHICH alternative letter — but they spoil item polarity.
    // For the blind reader question ("which letter?"), VF-only usually stays indeterminate
    // unless paired with "afirmativa N" mapping. Mark as ambiguous when spoiler regex fired.
    human_a_priori = 'ambiguous';
    human_notes =
      'Veredito V/F no concept_map (spoiler de polaridade); letra da alternativa pode permanecer indeterminável.';
  }

  rows.push({
    slug: s.slug,
    expected_bucket: s.expected_bucket,
    family: s.family,
    correct_letter: correct,
    surfaces_count: view?.surfaces.length ?? 0,
    redacted_text: text,
    heuristic_letter_hits: [...letterHits],
    vf_verdict_prefixes: vfPrefixes,
    human_a_priori,
    human_notes,
  });
}

const outJson = resolve(process.cwd(), 'artifacts/blind-reader-calibration-views.json');
mkdirSync(resolve(process.cwd(), 'artifacts'), { recursive: true });
writeFileSync(
  outJson,
  JSON.stringify({ generated_at: new Date().toISOString(), total: rows.length, rows }, null, 2),
  'utf8',
);

console.log(`wrote ${outJson} (${rows.length})`);
for (const r of rows) {
  console.log(`==== ${r.slug} correct=${r.correct_letter} human=${r.human_a_priori} bucket=${r.expected_bucket}`);
  console.log(r.redacted_text.slice(0, 420).replace(/\n/g, ' | '));
  console.log(`notes: ${r.human_notes}`);
  console.log('');
}
