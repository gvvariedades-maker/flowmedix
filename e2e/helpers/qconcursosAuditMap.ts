import type { Page } from '@playwright/test';
import { QCONCURSOS_BASE } from './qconcursosAuditAuth';

export type QConcursosPageInventory = {
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
  checkboxes: string[];
  toolbarItems: string[];
};

export type QConcursosPlayerInventory = {
  url: string;
  questionRef: string;
  headings: string[];
  metaLines: string[];
  toolbarActions: string[];
  alternatives: string[];
  actionButtons: string[];
  tabs: string[];
  sidePanelLinks: string[];
  answered: boolean;
  postAnswerActions: string[];
  postAnswerMessages: string[];
};

const QC_HOSTS = ['qconcursos.com', 'www.qconcursos.com'];

/** Remove nomes de usuário da conta de auditoria antes de commitar docs. */
export function sanitizeQConcursosAuditText(text: string): string {
  return text
    .replace(/genilson rocha/gi, '[usuário-audit]')
    .replace(/genilson/gi, '[usuário-audit]')
    .replace(/gvvariedades/gi, '[perfil-audit]');
}

export function sanitizeInventory(inv: QConcursosPageInventory): QConcursosPageInventory {
  const s = (v: string) => sanitizeQConcursosAuditText(v);
  return {
    ...inv,
    title: s(inv.title),
    headings: inv.headings.map(s),
    navLinks: inv.navLinks.map((n) => ({ text: s(n.text), href: n.href.replace(/gvvariedades/gi, '[perfil-audit]') })),
    buttons: inv.buttons.map(s),
    links: inv.links.map((l) => ({
      text: s(l.text),
      href: l.href.replace(/gvvariedades/gi, '[perfil-audit]'),
    })),
    labels: inv.labels.map(s),
    placeholders: inv.placeholders.map(s),
    filterChips: inv.filterChips.map(s),
    tabs: inv.tabs.map(s),
    checkboxes: inv.checkboxes.map(s),
    toolbarItems: inv.toolbarItems.map(s),
  };
}

export async function extractQConcursosPageInventory(
  page: Page,
  routePath: string,
): Promise<QConcursosPageInventory> {
  const data = await page.evaluate(() => {
    const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'))
      .map((el) => norm(el.textContent))
      .filter(Boolean)
      .slice(0, 40);

    const navLinks = Array.from(
      document.querySelectorAll(
        'header a[href], nav a[href], aside a[href], [role="navigation"] a[href], [class*="menu"] a[href]',
      ),
    )
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
      .slice(0, 60);

    const links = Array.from(document.querySelectorAll('main a[href], [role="main"] a[href]'))
      .map((a) => ({
        text: norm(a.textContent),
        href: (a as HTMLAnchorElement).href,
      }))
      .filter((x) => x.text && x.href && !x.href.startsWith('mailto:') && !x.href.startsWith('tel:'))
      .slice(0, 80);

    const labels = Array.from(document.querySelectorAll('label'))
      .map((el) => norm(el.textContent))
      .filter(Boolean)
      .slice(0, 40);

    const placeholders = Array.from(document.querySelectorAll('input, textarea'))
      .map((el) => norm((el as HTMLInputElement).placeholder))
      .filter(Boolean)
      .slice(0, 25);

    const selects = Array.from(document.querySelectorAll('select')).map((sel) => ({
      name:
        norm(sel.getAttribute('name')) ||
        norm(sel.getAttribute('aria-label')) ||
        norm(sel.id) ||
        'select',
      options: Array.from(sel.querySelectorAll('option'))
        .map((o) => norm(o.textContent))
        .filter(Boolean)
        .slice(0, 30),
    }));

    const filterChips = Array.from(
      document.querySelectorAll(
        '[role="tab"], [role="tablist"] button, [class*="badge"], [class*="chip"], [class*="filter"], [class*="tag"]',
      ),
    )
      .map((el) => norm(el.textContent))
      .filter((t) => t.length > 0 && t.length < 100)
      .slice(0, 40);

    const tabs = Array.from(document.querySelectorAll('[role="tab"]'))
      .map((el) => norm(el.textContent))
      .filter(Boolean);

    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'))
      .map((el) => {
        const id = el.id;
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        return norm(label?.textContent) || norm(el.getAttribute('aria-label')) || norm(el.getAttribute('name'));
      })
      .filter(Boolean)
      .slice(0, 30);

    const toolbarItems = Array.from(
      document.querySelectorAll(
        '[class*="toolbar"] button, [class*="toolbar"] a, [aria-label], [title]',
      ),
    )
      .map((el) => norm(el.getAttribute('aria-label')) || norm(el.getAttribute('title')) || norm(el.textContent))
      .filter((t) => t.length > 0 && t.length < 80)
      .slice(0, 30);

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
      checkboxes,
      toolbarItems,
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
    url: page.url(),
    title: data.title,
    headings: [...new Set(data.headings)],
    navLinks: dedupe(data.navLinks),
    buttons: [...new Set(data.buttons)],
    links: dedupe(data.links).filter((l) => isQConcursosHref(l.href)),
    labels: [...new Set(data.labels)],
    placeholders: [...new Set(data.placeholders)],
    selects: data.selects,
    filterChips: [...new Set(data.filterChips)],
    tabs: [...new Set(data.tabs)],
    checkboxes: [...new Set(data.checkboxes)],
    toolbarItems: [...new Set(data.toolbarItems)],
  };
}

export async function extractQConcursosPlayerInventory(page: Page): Promise<QConcursosPlayerInventory> {
  return page.evaluate(() => {
    const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map((el) => norm(el.textContent))
      .filter(Boolean);

    const questionRef =
      norm(document.querySelector('[class*="question"] [class*="id"], [class*="q-id"]')?.textContent) ||
      (document.body.innerText.match(/Q\d{5,}/)?.[0] ?? '');

    const metaLines = Array.from(
      document.querySelectorAll(
        'main [class*="meta"], main [class*="breadcrumb"], main [class*="info"], main a[href*="/bancas/"], main a[href*="/provas/"]',
      ),
    )
      .map((el) => norm(el.textContent))
      .filter((t) => t.length > 0 && t.length < 200)
      .slice(0, 15);

    const toolbarActions = Array.from(
      document.querySelectorAll(
        'main button, main [role="button"], main [aria-label], main [title]',
      ),
    )
      .map((el) => norm(el.getAttribute('aria-label')) || norm(el.getAttribute('title')) || norm(el.textContent))
      .filter((t) => /A\+|A-|imprimir|noite|ordenar|itens|caderno|favorit|gabarito|coment/i.test(t))
      .slice(0, 25);

    const alternatives = Array.from(
      document.querySelectorAll(
        'main label, main [class*="alternative"], main [class*="option"], main input[type="radio"] + label, main li',
      ),
    )
      .map((el) => norm(el.textContent))
      .filter((t) => /^[A-E]\)|^[A-E]\s|^\([A-E]\)/i.test(t) || (t.length > 3 && t.length < 500))
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .slice(0, 10);

    const actionButtons = Array.from(document.querySelectorAll('main button, main input[type="submit"]'))
      .map((el) => norm(el.textContent || (el as HTMLInputElement).value))
      .filter(Boolean)
      .filter((t) => /responder|confirmar|próxim|anterior|gabarito|coment|caderno|salvar|reportar/i.test(t))
      .slice(0, 20);

    const tabs = Array.from(document.querySelectorAll('[role="tab"]'))
      .map((el) => norm(el.textContent))
      .filter(Boolean);

    const sidePanelLinks = Array.from(document.querySelectorAll('aside a[href], main a[href]'))
      .map((a) => norm((a as HTMLAnchorElement).textContent))
      .filter((t) => /coment|gabarito|estat|relacion|video|caderno|professor/i.test(t))
      .slice(0, 15);

    const answered =
      document.body.innerText.includes('Você acertou') ||
      document.body.innerText.includes('Você errou') ||
      document.body.innerText.includes('Resposta correta') ||
      document.body.innerText.includes('gabarito comentado') ||
      !!document.querySelector('[class*="correct"], [class*="incorrect"], [class*="answered"]');

    const postAnswerActions = answered
      ? Array.from(document.querySelectorAll('main button, main a'))
          .map((el) => norm(el.textContent))
          .filter((t) => /coment|próxim|caderno|estat|video|gabarito/i.test(t))
          .slice(0, 15)
      : [];

    const postAnswerMessages = answered
      ? Array.from(document.querySelectorAll('main [class*="alert"], main [class*="feedback"], main [class*="result"]'))
          .map((el) => norm(el.textContent))
          .filter(Boolean)
          .slice(0, 8)
      : [];

    return {
      url: location.href,
      questionRef,
      headings,
      metaLines: [...new Set(metaLines)],
      toolbarActions: [...new Set(toolbarActions)],
      alternatives,
      actionButtons: [...new Set(actionButtons)],
      tabs: [...new Set(tabs)],
      sidePanelLinks: [...new Set(sidePanelLinks)],
      answered,
      postAnswerActions: [...new Set(postAnswerActions)],
      postAnswerMessages: [...new Set(postAnswerMessages)],
    };
  });
}

export function isQConcursosHref(href: string): boolean {
  try {
    const host = new URL(href).hostname.replace(/^www\./, '');
    return QC_HOSTS.some((h) => host === h.replace(/^www\./, ''));
  } catch {
    return href.startsWith('/') || href.includes('qconcursos.com');
  }
}

export function discoverQConcursosPaths(inventories: QConcursosPageInventory[]): string[] {
  const paths = new Set<string>();
  for (const inv of inventories) {
    for (const item of [...inv.navLinks, ...inv.links]) {
      try {
        const u = new URL(item.href);
        if (!isQConcursosHref(item.href)) continue;
        if (u.pathname.startsWith('/conta/entrar')) continue;
        if (u.pathname.startsWith('/conta/cadastrar')) continue;
        paths.add(u.pathname);
      } catch {
        /* ignore */
      }
    }
  }
  return [...paths].sort();
}

export const QCONCURSOS_LOGGED_SEED_PATHS = [
  '/usuario/novo-inicio',
  '/questoes-de-concursos/questoes',
  '/questoes-de-concursos/disciplinas',
  '/usuario/questoes/cadernos',
  '/usuario/questoes/estatisticas',
  '/usuario/questoes/configuracoes',
  '/usuario/questoes/filtros',
  '/usuario/simulados',
  '/usuario/desempenho',
  '/usuario/mapa-de-progresso',
  '/usuario/guia-de-estudos',
  '/usuario/configuracoes',
  '/usuario/assinatura',
] as const;

export function inventoryToMarkdown(inventories: QConcursosPageInventory[], capturedAt: string): string {
  const lines: string[] = [
    '# QConcursos — mapa funcional',
    '',
    `**Gerado:** ${capturedAt} · Playwright \`qconcursosAuditMap\``,
    '',
    '## Índice de rotas',
    '',
  ];

  for (const inv of inventories) {
    const label = inv.headings[0] || inv.title || '—';
    lines.push(`- [\`${inv.path}\`](#${anchorFromPath(inv.path)}) — ${label}`);
  }

  lines.push('', '---', '');

  for (const inv of inventories) {
    lines.push(`## ${inv.path}`, '', `**URL:** ${inv.url}`, '');

    if (inv.headings.length) {
      lines.push('### Títulos / seções', '', ...inv.headings.map((h) => `- ${h}`), '');
    }
    if (inv.navLinks.length) {
      lines.push('### Navegação', '', '| Item | Rota |', '|------|------|');
      for (const n of inv.navLinks.slice(0, 30)) {
        lines.push(`| ${n.text} | \`${safePath(n.href)}\` |`);
      }
      lines.push('');
    }
    if (inv.tabs.length) {
      lines.push('### Abas', '', ...inv.tabs.map((t) => `- ${t}`), '');
    }
    if (inv.checkboxes.length) {
      lines.push('### Checkboxes / toggles', '', ...inv.checkboxes.map((c) => `- ${c}`), '');
    }
    if (inv.labels.length || inv.placeholders.length || inv.selects.length) {
      lines.push('### Filtros / formulários', '');
      if (inv.labels.length) lines.push('**Labels:** ' + inv.labels.join(' · '));
      if (inv.placeholders.length) lines.push('**Placeholders:** ' + inv.placeholders.join(' · '));
      for (const sel of inv.selects) {
        lines.push(`- **${sel.name}:** ${sel.options.join(', ') || '(opções dinâmicas)'}`);
      }
      lines.push('');
    }
    if (inv.filterChips.length) {
      lines.push('### Chips / filtros rápidos', '', ...inv.filterChips.slice(0, 25).map((c) => `- ${c}`), '');
    }
    if (inv.toolbarItems.length) {
      lines.push('### Toolbar', '', ...inv.toolbarItems.map((t) => `- ${t}`), '');
    }
    if (inv.buttons.length) {
      lines.push('### Ações (botões)', '', ...inv.buttons.slice(0, 25).map((b) => `- ${b}`), '');
    }
    lines.push('---', '');
  }

  return lines.join('\n');
}

export function playerInventoryToMarkdown(
  player: QConcursosPlayerInventory,
  capturedAt: string,
): string {
  const lines: string[] = [
    '# QConcursos — player de questão',
    '',
    `**Gerado:** ${capturedAt}`,
    `**URL:** ${player.url}`,
    `**Ref:** ${player.questionRef || '—'}`,
    '',
  ];

  if (player.headings.length) {
    lines.push('## Títulos', '', ...player.headings.map((h) => `- ${h}`), '');
  }
  if (player.metaLines.length) {
    lines.push('## Meta (banca / prova / órgão)', '', ...player.metaLines.map((m) => `- ${m}`), '');
  }
  if (player.toolbarActions.length) {
    lines.push('## Toolbar do player', '', ...player.toolbarActions.map((t) => `- ${t}`), '');
  }
  if (player.alternatives.length) {
    lines.push('## Alternativas (amostra)', '', ...player.alternatives.map((a) => `- ${a.slice(0, 200)}`), '');
  }
  if (player.actionButtons.length) {
    lines.push('## Ações primárias', '', ...player.actionButtons.map((b) => `- ${b}`), '');
  }
  if (player.tabs.length) {
    lines.push('## Abas pós-questão', '', ...player.tabs.map((t) => `- ${t}`), '');
  }
  if (player.sidePanelLinks.length) {
    lines.push('## Links laterais / secundários', '', ...player.sidePanelLinks.map((l) => `- ${l}`), '');
  }
  lines.push('## Estado pós-resposta', '', `- Respondida: **${player.answered ? 'sim' : 'não'}**`, '');
  if (player.postAnswerMessages.length) {
    lines.push('### Mensagens', '', ...player.postAnswerMessages.map((m) => `- ${m.slice(0, 300)}`), '');
  }
  if (player.postAnswerActions.length) {
    lines.push('### Ações pós-resposta', '', ...player.postAnswerActions.map((a) => `- ${a}`), '');
  }

  return lines.join('\n');
}

export function comparativoToMarkdown(capturedAt: string): string {
  return `# QConcursos A1 ↔ AVANT — funções e filtros

**Fonte:** \`A1-qconcursos-funcional.md\` + \`A1-qconcursos-map.json\` + player (captura ${capturedAt}).

---

## Menu / hub

| QConcursos | Rota | AVANT equivalente | Notas rebrand |
|------------|------|-------------------|---------------|
| Novo início | \`/usuario/novo-inicio\` | home logada / \`/estudar\` | QC: feed + atalhos; AVANT: vitrine como hub |
| Questões | \`/questoes-de-concursos/questoes\` | \`/estudar\` | QC: filtros densos horizontais; AVANT: RPC vitrine + facets |
| Disciplinas | \`/questoes-de-concursos/disciplinas\` | assuntos no catálogo | Árvore por disciplina |
| Cadernos | \`/usuario/questoes/cadernos\` | \`/cadernos\` | QC: cadernos por tema; AVANT: cadernos + edital |
| Estatísticas | \`/usuario/questoes/estatisticas\` | \`/analytics\` | Desempenho por disciplina/banca |
| Simulados | \`/usuario/simulados\` | \`/simulados\` | Cronometrado + provas |
| Desempenho / mapa | \`/usuario/desempenho\` | \`/analytics\` | Gráficos de evolução |
| Guia de estudos | \`/usuario/guia-de-estudos\` | plano + edital | Trilha sugerida |
| Configurações | \`/usuario/configuracoes\` | \`/conta\` | Perfil e preferências |
| Assinatura | \`/usuario/assinatura\` | \`/conta/assinatura\` | Planos PRO |

---

## Vitrine (T3) — filtros QC

| Filtro QConcursos | AVANT vitrine |
|-------------------|---------------|
| Palavra-chave | Busca \`q\` (trgm) |
| Disciplina / Assunto | Tópico / subtópico |
| Banca | \`meta.banca\` |
| Instituição / Órgão | \`meta.orgao\` |
| Ano | \`meta.ano\` |
| Cargo / Nível | \`cargo_header\` / edital |
| Excluir já resolvidas | Histórico do usuário |
| Com comentário de professor | — (AVANT: NeuroSlides) |
| Salvar filtros / Meus filtros | — (caderno/edital) |
| Itens por página / Ordenar | Paginação API vitrine |

**Visual:** fundo branco, grid de dropdowns, CTA laranja \`Filtrar\` — AVANT: claro + CTA laranja \`#F26522\`.

---

## Player (T5/T6)

| Elemento QConcursos | AVANT (\`AvantLessonPlayer\`) |
|---------------------|-------------------------------|
| Lista + questão inline ou URL única | Rota \`/estudar/[slug]\` |
| Meta banca/ano/órgão/prova | \`meta\` + \`questionHeader\` |
| Alternativas A–E (radio) | \`btn-option\` |
| Responder → gabarito imediato | Confirmar → feedback → NeuroSlides |
| Comentários de professor | Estudo Reverso (4 slides) |
| A+/A−, modo noturno, imprimir | Zoom toolbar (ver \`ZOOM_MOBILE_POLICY\`) |
| Adicionar ao caderno | Cadernos / histórico |
| Próxima questão | Navegação vitrine preservando query |

**Rebrand:** legibilidade QC (card branco, denso) + momento exclusivo AVANT pós-resposta (NeuroSlides, verde).

---

## O que NÃO copiar

- Laranja \`#FE6112\` como brand
- Upsell ELITE em top-bar agressivo (AVANT: CTA editorial)
- Comentário professor como substituto do reverso

`;
}

function anchorFromPath(p: string): string {
  return p.replace(/\//g, '').replace(/^$/, 'root') || 'root';
}

function safePath(href: string): string {
  try {
    return new URL(href).pathname;
  } catch {
    return href;
  }
}
