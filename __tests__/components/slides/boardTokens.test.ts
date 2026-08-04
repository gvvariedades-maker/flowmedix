import {
  boardTone,
  boardEmptyPlaceholder,
  BOARD_FOOTER,
  BOARD_FOOTER_LABEL,
} from '@/components/slides/primitives/boardTokens';

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

  it('G2 bar: decision tones use solid badges and hero rings', () => {
    expect(boardTone('keep').badge).toContain('emerald');
    expect(boardTone('keep').badgeText).toContain('text-white');
    expect(boardTone('exception').heroRing).toContain('scale');
    expect(boardTone('exception').heroRing).toContain('shadow');
  });

  it('G2 bar: transfer footer is dark slate with cyan accent', () => {
    expect(BOARD_FOOTER).toContain('bg-slate-950');
    expect(BOARD_FOOTER).toContain('cyan');
    expect(BOARD_FOOTER_LABEL).toContain('cyan');
  });
});
