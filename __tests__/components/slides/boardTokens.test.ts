import { boardTone, boardEmptyPlaceholder } from '@/components/slides/primitives/boardTokens';

describe('boardTokens', () => {
  it('maps keep/exception/command to canonical polarity classes', () => {
    expect(boardTone('keep').panel).toContain('emerald');
    expect(boardTone('exception').panel).toContain('rose');
    expect(boardTone('command').panel).toContain('sky');
    expect(boardTone('transfer').panel).toContain('amber');
    expect(boardTone('rights').panel).toContain('indigo');
    expect(boardTone('lime').panel).toContain('lime');
  });

  it('falls back to neutral for unknown callers via default', () => {
    expect(boardTone().panel).toContain('slate');
  });

  it('builds dashed empty placeholder with tone border', () => {
    expect(boardEmptyPlaceholder('exception')).toContain('border-dashed');
    expect(boardEmptyPlaceholder('exception')).toContain('rose');
  });
});
