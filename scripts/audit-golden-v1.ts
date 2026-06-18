import fs from 'node:fs';
import path from 'node:path';

import { FAMILY_GOLDEN_FILE } from '@/lib/catalogMigration/classifyFamily';
import { lintGoldenContent } from '@/lib/goldenContentStandard';

const EXTRA_GOLDENS: Record<string, string> = {
  imunizacao_vf: 'questao-premium-cpcon-imunizacao-intervalos-vf.json',
  sinais_protocolo: 'questao-premium-fepese-sv-interpretacao-valores.json',
  sinais_ce: 'questao-premium-idecan-fc-radial-ce.json',
};

const dir = path.join(process.cwd(), 'examples');

function audit(file: string, family: string) {
  const p = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8')) as { meta?: Record<string, unknown> };
  data.meta = { ...data.meta, content_standard: 'golden-v1', family };
  const issues = lintGoldenContent(data);
  console.log(`${family}\t${file}\t${issues.length ? issues.map((i) => i.code).join(',') : 'OK'}`);
  if (issues.length) {
    for (const i of issues) console.log(`  - ${i.code}: ${i.message}`);
  }
}

for (const [family, file] of Object.entries(FAMILY_GOLDEN_FILE)) {
  audit(file, family);
}
for (const [family, file] of Object.entries(EXTRA_GOLDENS)) {
  audit(file, family);
}
