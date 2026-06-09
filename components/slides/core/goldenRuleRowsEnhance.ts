import type { GoldenRuleRow } from '../variants/GoldenRule';

function rowText(row: GoldenRuleRow): string {
  return `${row.label ?? ''} ${row.value ?? ''}`.toLowerCase();
}

/**
 * Preenche `emphasis` e `badge` ausentes com heurísticas de prova (gabarito, pegadinha, norma).
 */
export function enhanceGoldenRuleRows(rows: GoldenRuleRow[]): GoldenRuleRow[] {
  if (!Array.isArray(rows) || rows.length === 0) return rows;

  return rows.map((row, index) => {
    if (row.emphasis && row.badge) return row;

    const text = rowText(row);
    let emphasis = row.emphasis;
    let badge = row.badge;

    if (!emphasis) {
      if (/gabarito|letra [a-e]|única alternativa|correta|certa\b/.test(text)) {
        emphasis = 'success';
      } else if (/pegadinha|não confundir|não confunda|errad|cuidado/.test(text)) {
        emphasis = 'alert';
      } else if (/norma|art\.|lei |dispositivo|mnemônico|decore/.test(text)) {
        emphasis = 'highlight';
      } else if (index === rows.length - 1 && rows.length > 2) {
        emphasis = 'highlight';
      }
    }

    if (!badge) {
      if (emphasis === 'success') badge = 'hot';
      else if (emphasis === 'alert') badge = 'warn';
      else if (/mnemônico|decore|fixar|regra/.test(text)) badge = 'ok';
      else if (emphasis === 'highlight') badge = 'hot';
      else if (/contexto|cf\/|princípio/.test(text)) badge = 'info';
    }

    if (!emphasis && !badge) return row;
    return {
      ...row,
      ...(emphasis ? { emphasis } : {}),
      ...(badge ? { badge } : {}),
    };
  });
}
