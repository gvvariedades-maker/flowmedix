import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  repairPedagogySignature,
} from '@/lib/catalogMigration/repairPedagogySignatures';
import { detectUnifiedPedagogy } from '@/lib/catalogMigration/unifiedPedagogyDetector';

function probe(dir: string, name: string, n = 2) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  const out: unknown[] = [];
  for (const f of files) {
    const q = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    const findings = detectUnifiedPedagogy(q).filter(
      (x) => x.code === 'pedagogy_letter_spoiler' && x.slide === 'golden_rule',
    );
    if (!findings.length) continue;
    const clone1 = structuredClone(q);
    const clone2 = structuredClone(q);
    const g = repairPedagogySignature('gabarito_item', clone1);
    const t = repairPedagogySignature('letter_truncation', clone2);
    // apply both to a third clone in order
    const both = structuredClone(q);
    repairPedagogySignature('gabarito_item', both);
    repairPedagogySignature('letter_truncation', both);
    const after = detectUnifiedPedagogy(both).filter((x) => x.code === 'pedagogy_letter_spoiler');
    const gr = q.reverse_study_slides.find((s: { type?: string }) => s.type === 'golden_rule');
    const grAfter = both.reverse_study_slides.find((s: { type?: string }) => s.type === 'golden_rule');
    out.push({
      file: f,
      findings_n: findings.length,
      sample_findings: findings.slice(0, 3),
      rows_before: (gr as { rows?: unknown })?.rows,
      gabarito: { changed: g.changed, edits: g.edits.slice(0, 5), skipped: g.skipped.slice(0, 3) },
      trunc: { changed: t.changed, edits: t.edits.slice(0, 5), skipped: t.skipped.slice(0, 3) },
      letter_after: after.length,
      rows_after: (grAfter as { rows?: unknown })?.rows,
    });
    if (out.length >= n) break;
  }
  writeFileSync(`artifacts/probe-f3-${name}.json`, JSON.stringify(out, null, 2));
  console.log(name, 'probed', out.length);
}

probe('data/catalog-migration/vias-de-administracao-completo/questions', 'vias');
probe('data/catalog-migration/imunizacao-completo/questions', 'imu');
