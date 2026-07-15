#!/usr/bin/env tsx
/**
 * Reparos A4-mínimo — Segurança do Paciente (logic_flow <4 passos, danger_zone fino).
 *
 *   npx tsx scripts/patch-seguranca-a4-minimo.ts [--write]
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const FIXACAO_RE =
  /fixa[cç][aã]o|identific|queda|morse|evento|incidente|meta\s*[16]|paciente\s+certo|n[aã]o\s+confund|pegadinha|seguran[cç]a/i;

type Slide = Record<string, unknown> & { type?: string; steps?: string[]; items?: unknown[] };

function patchFile(path: string, write: boolean): string[] {
  const reasons: string[] = [];
  const raw = JSON.parse(readFileSync(path, 'utf8')) as {
    reverse_study_slides?: Slide[];
    study_slides?: Slide[];
  };
  const slides = (raw.reverse_study_slides ?? raw.study_slides ?? []) as Slide[];

  for (const slide of slides) {
    if (slide.type === 'logic_flow' && Array.isArray(slide.steps)) {
      const last = slide.steps[slide.steps.length - 1] ?? '';
      if (slide.steps.length < 4 || !FIXACAO_RE.test(last)) {
        slide.steps = [
          ...slide.steps.filter((s) => !/^fixa[cç][aã]o:/i.test(s)),
          'Fixação: segurança do paciente — cultura de notificação e prevenção de eventos.',
        ];
        reasons.push('logic_flow_fixacao');
      }
    }
    if (slide.type === 'danger_zone' && Array.isArray(slide.items) && slide.items.length < 3) {
      slide.items = [
        ...slide.items,
        {
          label: 'Confundir incidente com evento adverso',
          detail: 'Sem dano não é evento adverso.',
          correct: 'Evento adverso exige dano — incidente sem dano é outra categoria.',
        },
      ];
      reasons.push('danger_zone_third_item');
    }
  }

  if (reasons.length > 0 && write) {
    if (raw.reverse_study_slides) raw.reverse_study_slides = slides;
    else raw.study_slides = slides;
    writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
  }
  return reasons;
}

function main(): void {
  const write = process.argv.includes('--write');
  const lote = parseArg('lote');
  const lots = lote
    ? [lote]
    : [
        'seguranca-do-paciente-g01',
        'seguranca-do-paciente-g02',
        'seguranca-do-paciente-g03',
        'seguranca-do-paciente-g04',
      ];

  let patched = 0;
  for (const lot of lots) {
    const dir = loteQuestionsDir(lot);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
      const reasons = patchFile(join(dir, name), write);
      if (reasons.length > 0) {
        patched++;
        console.log(`[patch-seguranca-a4] ${lot}/${name} — ${reasons.join(',')}`);
      }
    }
  }
  console.log(`[patch-seguranca-a4] done patched=${patched} write=${write}`);
}

main();
