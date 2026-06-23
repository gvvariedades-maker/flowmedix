#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const report = JSON.parse(
  readFileSync(resolve(process.cwd(), 'artifacts/perioperatoria-topic-cluster-report.json'), 'utf8'),
) as {
  total: number;
  generated_at: string;
  stub_total: number;
  contract_fail_total: number;
  rows: { modulo_slug: string; banca: string | null; premium_status: string; pedagogical_cluster: string }[];
};

const base = 'http://localhost:3000/estudar/';
const clusters = [...new Set(report.rows.map((r) => r.pedagogical_cluster))].sort(
  (a, b) =>
    report.rows.filter((r) => r.pedagogical_cluster === b).length -
    report.rows.filter((r) => r.pedagogical_cluster === a).length,
);

let tables = '';
for (const cluster of clusters) {
  const items = report.rows.filter((r) => r.pedagogical_cluster === cluster);
  tables += `<h2>${cluster} <span class="note">(${items.length})</span></h2><table><thead><tr><th>Link</th><th>Banca</th><th>Status</th></tr></thead><tbody>`;
  for (const row of items) {
    tables += `<tr><td><a href="${base}${row.modulo_slug}" target="_blank" rel="noopener">${row.modulo_slug}</a></td><td>${row.banca ?? ''}</td><td><span class="badge ${row.premium_status}">${row.premium_status}</span></td></tr>`;
  }
  tables += '</tbody></table>';
}

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Perioperatória — links player</title>
<style>
body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;padding:1.5rem;line-height:1.5}
h1{margin:0 0 .25rem}h2{font-size:1rem;color:#7dd3fc;border-bottom:1px solid #334155;padding-bottom:.35rem;margin:1.5rem 0 .5rem}
.note{color:#94a3b8;font-weight:normal;font-size:.875rem}
table{width:100%;border-collapse:collapse;font-size:.85rem;margin-bottom:1rem}
td,th{padding:.45rem .5rem;border-bottom:1px solid #334155;text-align:left}
a{color:#38bdf8;word-break:break-all}
.badge{padding:.1rem .45rem;border-radius:4px;font-size:.7rem;text-transform:uppercase}
.stub{background:rgba(251,191,36,.15);color:#fbbf24}
.hybrid_ok{background:rgba(52,211,153,.15);color:#34d399}
.golden{background:rgba(167,139,250,.15);color:#c4b5fd}
footer{margin-top:2rem;padding-top:1rem;border-top:1px solid #334155;color:#94a3b8;font-size:.8rem}
</style>
</head>
<body>
<h1>Assistência Perioperatória (Inclui SRPA)</h1>
<p class="note">${report.total} questões · cluster ${new Date(report.generated_at).toISOString()} · stub=${report.stub_total} · contract_fail=${report.contract_fail_total}</p>
${tables}
<h2>Goldens golden-v1 (Fase 1)</h2>
<ul>
<li><code>examples/questao-premium-idecan-srpa-curativo-cpd-ce.json</code></li>
<li><code>examples/questao-premium-idecan-perioperatoria-aldrete-srpa.json</code></li>
<li><code>examples/questao-premium-consulplan-perioperatoria-srpa-monitorizacao.json</code></li>
<li><code>examples/questao-premium-avancasp-perioperatoria-pre-operatorio.json</code></li>
<li><code>examples/questao-premium-furb-perioperatoria-isc-classificacao.json</code></li>
<li><code>examples/questao-premium-cogeps-perioperatoria-cirurgia-segura-cdc.json</code></li>
</ul>
<footer>Export: <code>data/catalog-migration/perioperatoria-completo</code> — apply no DB pendente</footer>
</body></html>`;

writeFileSync(resolve(process.cwd(), 'artifacts/perioperatoria-links.html'), html, 'utf8');
console.log('[perioperatoria-links] artifacts/perioperatoria-links.html');
