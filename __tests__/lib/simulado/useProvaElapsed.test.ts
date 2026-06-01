/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useProvaElapsed } from '@/lib/simulado/useProvaElapsed';

describe('useProvaElapsed', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-01T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calcula tempo decorrido a partir de prova_iniciada_em', () => {
    const { result } = renderHook(() =>
      useProvaElapsed({
        provaIniciadaEm: '2026-06-01T11:59:30.000Z',
        totalQuestoes: 20,
        ritmoMetaSegundosPorQuestao: 180,
      }),
    );

    expect(result.current.elapsedLabel).toBe('00:00:30');
    expect(result.current.metaLabel).toBe('01:00:00');
    expect(result.current.passedMeta).toBe(false);
    expect(result.current.tempoMetaTotalSegundos).toBe(3600);
  });

  it('marca passedMeta quando ultrapassa meta total', () => {
    const { result } = renderHook(() =>
      useProvaElapsed({
        provaIniciadaEm: '2026-06-01T10:59:00.000Z',
        totalQuestoes: 2,
        ritmoMetaSegundosPorQuestao: 60,
      }),
    );

    expect(result.current.passedMeta).toBe(true);
    expect(result.current.metaLabel).toBe('00:02:00');
  });

  it('exibe Sem meta quando ritmo é nulo', () => {
    const { result } = renderHook(() =>
      useProvaElapsed({
        provaIniciadaEm: '2026-06-01T11:00:00.000Z',
        totalQuestoes: 10,
        ritmoMetaSegundosPorQuestao: null,
      }),
    );

    expect(result.current.metaLabel).toBe('Sem meta');
    expect(result.current.passedMeta).toBe(false);
  });

  it('atualiza elapsedLabel a cada segundo', () => {
    const { result } = renderHook(() =>
      useProvaElapsed({
        provaIniciadaEm: '2026-06-01T11:59:58.000Z',
        totalQuestoes: 1,
        ritmoMetaSegundosPorQuestao: null,
      }),
    );

    expect(result.current.elapsedLabel).toBe('00:00:02');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.elapsedLabel).toBe('00:00:03');
  });
});
