import type { Page } from '@playwright/test';
import { GABARITA_BASE } from './gabaritaAuditAuth';

export type GabaritaPageInventory = {
  path: string;
  url: string;
  title: string;
  headings: string[];
  navLinks: { text: string; href: string }[];
  buttons: string[];
  links: { text: string; href: string }[];
  labels: string[];
  placeholders: string[];
  selects: { name: string; options: string[] }[];
  filterChips: string[];
  tabs: string[];
};

export async function extractGabaritaPageInventory(
  page: Page,
  routePath: string,
): Promise<GabaritaPageInventory> {
  const url = page.url();
  const data = await page.evaluate(() => {
    const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map((el) => norm(el.textContent))
      .filter(Boolean)
      .slice(0, 30);

    const navLinks = Array.from(document.querySelectorAll('nav a[href], aside a[href], [role="navigation"] a[href]'))
      .map((a) => ({
        text: norm(a.textContent),
        href: (a as HTMLAnchorElement).href,
      }))
      .filter((x) => x.text && x.href);

    const buttons = Array.from(
      document.querySelectorAll('button, [role="button"], input[type="submit"]'),
    )
      .map((el) => norm(el.textContent || (el as HTMLInputElement).value))
      .filter(Boolean)
      .slice(0, 40);

    const links = Array.from(document.querySelectorAll('main a[href], [role="main"] a[href], body a[href]'))
      .map((a) => ({
        text: norm(a.textContent),
        href: (a as HTMLAnchorElement).href,
      }))
      .filter((x) => x.text && x.href && !x.href.startsWith('mailto:') && !x.href.startsWith('tel:'))
      .slice(0, 60);

    const labels = Array.from(document.querySelectorAll('label'))
      .map((el) => norm(el.textContent))
      .filter(Boolean)
      .slice(0, 30);

    const placeholders = Array.from(document.querySelectorAll('input, textarea'))
      .map((el) => norm((el as HTMLInputElement).placeholder))
      .filter(Boolean)
      .slice(0, 20);

    const selects = Array.from(document.querySelectorAll('select')).map((sel) => ({
      name:
        norm(sel.getAttribute('name')) ||
        norm(sel.getAttribute('aria-label')) ||
        norm(sel.id) ||
        'select',
      options: Array.from(sel.querySelectorAll('option'))
        .map((o) => norm(o.textContent))
        .filter(Boolean)
        .slice(0, 25),
    }));

    const filterChips = Array.from(
      document.querySelectorAll(
        '[data-state], [role="tab"], [role="tablist"] button, [class*="badge"], [class*="chip"], [class*="filter"]',
      ),
    )
      .map((el) => norm(el.textContent))
      .filter((t) => t.length > 0 && t.length < 80)
      .slice(0, 30);

    const tabs = Array.from(document.querySelectorAll('[role="tab"]'))
      .map((el) => norm(el.textContent))
      .filter(Boolean);

    return {
      title: document.title,
      headings,
      navLinks,
      buttons,
      links,
      labels,
      placeholders,
      selects,
      filterChips,
      tabs,
    };
  });

  const dedupe = <T extends { text: string; href: string }>(items: T[]) => {
    const seen = new Set<string>();
    return items.filter((x) => {
      const k = `${x.text}|${x.href}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  return {
    path: routePath,
    url,
    title: data.title,
    headings: [...new Set(data.headings)],
    navLinks: dedupe(data.navLinks),
    buttons: [...new Set(data.buttons)],
    links: dedupe(data.links).filter((l) => l.href.includes('gabaritaenfermagem.com.br')),
    labels: [...new Set(data.labels)],
    placeholders: [...new Set(data.placeholders)],
    selects: data.selects,
    filterChips: [...new Set(data.filterChips)],
    tabs: [...new Set(data.tabs)],
  };
}

export function discoverInternalPaths(inventories: GabaritaPageInventory[]): string[] {
  const paths = new Set<string>();
  for (const inv of inventories) {
    for (const item of [...inv.navLinks, ...inv.links]) {
      try {
        const u = new URL(item.href);
        if (u.origin !== GABARITA_BASE) continue;
        if (u.pathname.startsWith('/auth')) continue;
        paths.add(u.pathname);
      } catch {
        /* ignore */
      }
    }
  }
  return [...paths].sort();
}

export function inventoryToMarkdown(
  inventories: GabaritaPageInventory[],
  capturedAt: string,
): string {
  const lines: string[] = [
    '# Gabarita Enfermagem — mapa funcional (área logada)',
    '',
    `**Gerado:** ${capturedAt} · Playwright \`gabaritaAuditMap\``,
    '',
    '## Índice de rotas',
    '',
  ];

  for (const inv of inventories) {
    lines.push(`- [\`${inv.path}\`](#${inv.path.replace(/\//g, '').replace(/^$/, 'root')}) — ${inv.title || inv.headings[0] || '—'}`);
  }

  lines.push('', '---', '');

  for (const inv of inventories) {
    const anchor = inv.path.replace(/\//g, '').replace(/^$/, 'root') || 'root';
    lines.push(`## ${inv.path}`, '', `**URL:** ${inv.url}`, '');

    if (inv.headings.length) {
      lines.push('### Títulos / seções', '', ...inv.headings.map((h) => `- ${h}`), '');
    }
    if (inv.navLinks.length) {
      lines.push('### Navegação (nav/sidebar)', '', '| Item | Rota |', '|------|------|');
      for (const n of inv.navLinks.slice(0, 25)) {
        const p = safePath(n.href);
        lines.push(`| ${n.text} | \`${p}\` |`);
      }
      lines.push('');
    }
    if (inv.tabs.length) {
      lines.push('### Abas', '', ...inv.tabs.map((t) => `- ${t}`), '');
    }
    if (inv.labels.length || inv.placeholders.length || inv.selects.length) {
      lines.push('### Filtros / formulários', '');
      if (inv.labels.length) lines.push('**Labels:** ' + inv.labels.join(' · '));
      if (inv.placeholders.length) lines.push('**Placeholders:** ' + inv.placeholders.join(' · '));
      for (const sel of inv.selects) {
        lines.push(`- **${sel.name}:** ${sel.options.join(', ') || '(sem opções visíveis)'}`);
      }
      lines.push('');
    }
    if (inv.filterChips.length) {
      lines.push('### Chips / filtros rápidos', '', ...inv.filterChips.map((c) => `- ${c}`), '');
    }
    if (inv.buttons.length) {
      lines.push('### Ações (botões)', '', ...inv.buttons.slice(0, 20).map((b) => `- ${b}`), '');
    }
    lines.push('---', '');
  }

  return lines.join('\n');
}

function safePath(href: string): string {
  try {
    return new URL(href).pathname;
  } catch {
    return href;
  }
}
