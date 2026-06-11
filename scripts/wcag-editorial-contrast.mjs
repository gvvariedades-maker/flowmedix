/**
 * Valida pares de contraste WCAG 2.1 (AA) dos tokens Editorial v2.
 * Uso: node scripts/wcag-editorial-contrast.mjs
 */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(hexToRgb(fg));
  const l2 = relativeLuminance(hexToRgb(bg));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const PAIRS = [
  { label: 'Texto primário / fundo app', fg: '#0f172a', bg: '#f8fafc', level: 'AA normal (4.5:1)' },
  { label: 'Texto secundário / fundo app', fg: '#64748b', bg: '#f8fafc', level: 'AA normal (4.5:1)' },
  { label: 'Texto terciário / fundo app', fg: '#94a3b8', bg: '#f8fafc', level: 'AA large/UI (3:1)' },
  { label: 'Brand text / card branco', fg: '#3d6b0f', bg: '#ffffff', level: 'AA normal (4.5:1)' },
  { label: 'CTA label / botão brand', fg: '#1a2e05', bg: '#8fe020', level: 'AA normal (4.5:1)' },
  { label: 'Sucesso / card branco', fg: '#16a34a', bg: '#ffffff', level: 'AA normal (4.5:1)' },
  { label: 'Perigo / card branco', fg: '#dc2626', bg: '#ffffff', level: 'AA normal (4.5:1)' },
  { label: 'Aviso / card branco', fg: '#d97706', bg: '#ffffff', level: 'AA normal (4.5:1)' },
  { label: 'Outline btn / branco', fg: '#334155', bg: '#ffffff', level: 'AA normal (4.5:1)' },
  { label: 'Texto primário / card branco', fg: '#0f172a', bg: '#ffffff', level: 'AA normal (4.5:1)' },
];

const THRESHOLD = { normal: 4.5, large: 3.0 };

console.log('WCAG 2.1 — Editorial v2 token pairs\n');
console.log('| Par | FG | BG | Ratio | AA |');
console.log('|-----|----|----|-------|-----|');

let allPass = true;
for (const p of PAIRS) {
  const ratio = contrastRatio(p.fg, p.bg);
  const min = p.level.includes('large') || p.level.includes('UI') ? THRESHOLD.large : THRESHOLD.normal;
  const pass = ratio >= min;
  if (!pass) allPass = false;
  console.log(
    `| ${p.label} | ${p.fg} | ${p.bg} | ${ratio.toFixed(2)}:1 | ${pass ? 'PASS' : 'FAIL'} (${p.level}) |`,
  );
}

console.log(`\nResultado: ${allPass ? 'TODOS PASSAM AA' : 'FALHAS DETECTADAS'}`);
process.exit(allPass ? 0 : 1);
