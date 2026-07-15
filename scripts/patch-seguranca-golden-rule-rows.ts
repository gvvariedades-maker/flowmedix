/**
 * Adiciona rows em golden_rule para slugs de ramos bespoke SP sem contrato sp-nsp-reference-board.
 * Uso: npx tsx scripts/patch-seguranca-golden-rule-rows.ts
 */
import fs from 'fs';
import path from 'path';
import { premiumGateErrors } from '@/lib/catalogMigration/premiumGate';

const BESPOKE = new Set(['sp_identificacao', 'sp_prevencao_quedas', 'sp_eventos_adversos']);
const root = path.join(process.cwd(), 'data/catalog-migration');

let fixed = 0;

for (const name of fs.readdirSync(root)) {
  if (!name.startsWith('seguranca-do-paciente-g')) continue;
  const dir = path.join(root, name, 'questions');
  if (!fs.existsSync(dir)) continue;

  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const fp = path.join(dir, file);
    const q = JSON.parse(fs.readFileSync(fp, 'utf8')) as {
      meta?: { pedagogical_branch?: string };
      question_data?: { options?: { id?: string; text?: string; is_correct?: boolean }[] };
      reverse_study_slides?: Array<Record<string, unknown>>;
    };

    const branch = q.meta?.pedagogical_branch;
    if (!branch || !BESPOKE.has(branch)) continue;

    const errs = premiumGateErrors(q);
    if (!errs.some((e) => e.code === 'molde_golden_rule_sem_rows')) continue;

    const gr = q.reverse_study_slides?.find((s) => s.type === 'golden_rule');
    if (!gr) continue;

    const title = String(gr.content ?? 'Referência NSP').trim();
    const footer = String(gr.footer_rule ?? '').trim();
    const correct = q.question_data?.options?.find((o) => o.is_correct);
    const gabarito = correct
      ? `Letra ${correct.id} — ${String(correct.text ?? '').slice(0, 80)}`
      : 'Conferir alternativa marcada';

    gr.rows = [
      { label: 'Núcleo', value: title, emphasis: 'highlight' },
      { label: 'Conduta', value: footer || 'Aplicar protocolo do ramo no enunciado', badge: 'ok' },
      { label: 'Gabarito', value: gabarito, badge: 'hot' },
      { label: 'Fixação', value: 'Relacione meta OMS/PNSP com a pegadinha da banca', badge: 'warn' },
    ];

    fs.writeFileSync(fp, `${JSON.stringify(q, null, 2)}\n`);
    fixed += 1;
    console.log(`[patch] ${file} (${branch})`);
  }
}

console.log(`[patch-seguranca-golden-rule-rows] fixed=${fixed}`);
