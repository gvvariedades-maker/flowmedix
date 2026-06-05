import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const vitrinePath = join(process.cwd(), 'components', 'vitrine', 'VitrineClient.tsx');

describe('VitrineClient paginação', () => {
  const source = readFileSync(vitrinePath, 'utf8');

  it('renderiza duas instâncias de VitrinePaginationBar quando totalPaginas > 1', () => {
    expect(source).toMatch(/totalPaginas\s*>\s*1\s*\?\s*\(\s*<VitrinePaginationBar/);
    expect(source.match(/<VitrinePaginationBar/g)?.length).toBe(2);
  });

  it('usa variantes inline (desktop) e sticky (mobile)', () => {
    expect(source).toContain('variant="inline"');
    expect(source).toContain('variant="sticky"');
    expect(source).toContain('ref={vitrinePaginationInlineRef}');
  });

  it('aplica padding da grade só no mobile quando há paginação', () => {
    expect(source).toContain('MOBILE_VITRINE_GRID_STICKY_PAGINATION_PADDING');
    expect(source).toMatch(
      /totalPaginas\s*>\s*1\s*&&\s*MOBILE_VITRINE_GRID_STICKY_PAGINATION_PADDING/,
    );
  });

  it('só monta barras de paginação dentro de condicionais totalPaginas > 1', () => {
    const paginationConditionals =
      source.match(/totalPaginas\s*>\s*1\s*\?[\s\S]*?<VitrinePaginationBar[\s\S]*?:\s*null/g) ?? [];
    expect(paginationConditionals).toHaveLength(2);
  });

  it('não duplica pb-nav-safe (reservado no main do shell)', () => {
    expect(source).not.toContain('pb-nav-safe');
    expect(source).not.toContain('MOBILE_MAIN_SCROLL_PADDING');
  });
});
