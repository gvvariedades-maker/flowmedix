/**
 * L2c repair: logic_flow must match /marcar|gabarito|letra\s+[A-E]/i
 * Uso: npx tsx scripts/repair-nocoes-de-anatomia-l2c-gabarito.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LOGIC_GABARITO_RE = /marcar|gabarito|letra\s+[A-E]/i;

function main() {
  let files = 0;
  let patched = 0;
  for (let i = 1; i <= 6; i++) {
    const nn = String(i).padStart(2, '0');
    const lote = `nocoes-de-anatomia-g${nn}`;
    const man = JSON.parse(
      readFileSync(resolve('data/catalog-migration', lote, 'manifest.json'), 'utf8'),
    ) as { slugs: string[] };
    for (const slug of man.slugs) {
      const fp = resolve('data/catalog-migration', lote, 'questions', `${slug}.json`);
      const q = JSON.parse(readFileSync(fp, 'utf8')) as {
        question_data?: { options?: { id: string; is_correct: boolean }[] };
        reverse_study_slides?: { type?: string; steps?: string[] }[];
      };
      files += 1;
      const logic = q.reverse_study_slides?.find((s) => s.type === 'logic_flow');
      if (!logic?.steps?.length) continue;
      if (logic.steps.some((s) => LOGIC_GABARITO_RE.test(String(s)))) continue;

      const correct =
        q.question_data?.options?.find((o) => o.is_correct)?.id ?? '';
      let changed = false;
      logic.steps = logic.steps.map((s) => {
        let n = String(s);
        const before = n;
        n = n.replace(/^Validar ([A-E]):/i, 'Marcar $1:');
        n = n.replace(/→\s*alternativa\s+([A-E])/gi, '— marcar letra $1');
        n = n.replace(/\balternativa\s+([A-E])\b/gi, 'letra $1');
        if (/^Concluir:/i.test(n) && correct && !LOGIC_GABARITO_RE.test(n)) {
          n = `${n.replace(/\.\s*$/, '')} — marcar letra ${correct}.`;
        }
        if (n !== before) changed = true;
        return n;
      });

      if (!logic.steps.some((s) => LOGIC_GABARITO_RE.test(String(s))) && correct) {
        const insertAt = Math.max(logic.steps.length - 1, 0);
        logic.steps.splice(insertAt, 0, `Marcar letra ${correct} — gabarito desta prova.`);
        changed = true;
      }

      if (changed) {
        writeFileSync(fp, `${JSON.stringify(q, null, 2)}\n`, 'utf8');
        patched += 1;
        console.log(`[repair:anat-l2c] patched ${slug}`);
      } else {
        console.warn(`[repair:anat-l2c] STILL FAIL ${slug}`);
      }
    }
  }
  console.log(`[repair:anat-l2c] files=${files} patched=${patched}`);
}

main();
