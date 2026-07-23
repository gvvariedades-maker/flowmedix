import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const vitrinePath = join(process.cwd(), 'components', 'vitrine', 'VitrineClient.tsx');

describe('VitrineClient paginação', () => {
  const source = readFileSync(vitrinePath, 'utf8');

  it('renderiza uma única VitrinePaginationBar quando totalPaginas > 1', () => {
    expect(source).toMatch(/totalPaginas\s*>\s*1\s*\?\s*\(\s*<VitrinePaginationBar/);
    expect(source.match(/<VitrinePaginationBar/g)?.length).toBe(1);
  });

  it('paginação inline no fim da lista com ref para scroll', () => {
    expect(source).toContain('ref={vitrinePaginationInlineRef}');
    expect(source).toContain('scrollDashboardMainToTop');
    expect(source).not.toContain('scrollIntoView');
    expect(source).not.toContain('variant="sticky"');
    expect(source).not.toContain('variant="inline"');
  });

  it('não reserva padding extra para barra sticky fixa', () => {
    expect(source).not.toContain('MOBILE_VITRINE_GRID_STICKY_PAGINATION_PADDING');
    expect(source).not.toContain('pb-vitrine-sticky-pagination');
  });

  it('só monta barra de paginação dentro de condicional totalPaginas > 1', () => {
    const paginationConditionals =
      source.match(/totalPaginas\s*>\s*1\s*\?[\s\S]*?<VitrinePaginationBar[\s\S]*?:\s*null/g) ?? [];
    expect(paginationConditionals).toHaveLength(1);
  });

  it('não duplica padding de nav (BottomNav no flex shell)', () => {
    expect(source).not.toContain('pb-nav-safe');
    expect(source).not.toContain('MOBILE_MAIN_SCROLL_PADDING');
    expect(source).not.toMatch(/calc\(5rem/);
  });

  it('hub de disciplina esconde o catálogo até escolher', () => {
    expect(source).toContain('isVitrineDisciplineHubMode');
    expect(source).toContain('showSubjectCatalog');
    expect(source).toContain('hubMode');
    expect(source).toMatch(/!hubMode\s*\?\s*\(\s*<VitrineToolbar/);
    expect(source).toContain("Vitrine de disciplinas");
    expect(source).toContain('max-w-none');
  });

  it('foca o título da página ao alternar hub ↔ assuntos', () => {
    expect(source).toContain('pageTitleRef');
    expect(source).toContain('prevHubModeRef');
    expect(source).toContain('titleRef={pageTitleRef}');
    expect(source).toMatch(/pageTitleRef\.current\?\.focus\(\)/);
    expect(source).toMatch(/prevHubModeRef\.current\s*=\s*hubMode/);
  });
});
