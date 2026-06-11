import { render, screen } from '@testing-library/react';
import { ProvaTimerBar } from '@/components/simulados/ProvaTimerBar';

jest.mock('@/lib/simulado/useProvaElapsed', () => ({
  useProvaElapsed: jest.fn(),
}));

import { useProvaElapsed } from '@/lib/simulado/useProvaElapsed';

const mockUseProvaElapsed = useProvaElapsed as jest.MockedFunction<typeof useProvaElapsed>;

describe('ProvaTimerBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não renderiza sem prova_iniciada_em', () => {
    const { container } = render(
      <ProvaTimerBar
        provaIniciadaEm={null}
        totalQuestoes={20}
        ritmoMetaSegundosPorQuestao={180}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('exibe cronômetro e meta', () => {
    mockUseProvaElapsed.mockReturnValue({
      elapsedMs: 90_000,
      elapsedLabel: '00:01:30',
      metaLabel: '01:00:00',
      passedMeta: false,
      tempoMetaTotalSegundos: 3600,
    });

    render(
      <ProvaTimerBar
        provaIniciadaEm="2026-06-01T10:00:00.000Z"
        totalQuestoes={20}
        ritmoMetaSegundosPorQuestao={180}
      />,
    );

    expect(screen.getByText('00:01:30')).toBeInTheDocument();
    expect(screen.getByText(/Meta: 01:00:00/)).toBeInTheDocument();
  });

  it('aplica estilo de aviso quando passedMeta', () => {
    mockUseProvaElapsed.mockReturnValue({
      elapsedMs: 4_000_000,
      elapsedLabel: '01:06:40',
      metaLabel: '01:00:00',
      passedMeta: true,
      tempoMetaTotalSegundos: 3600,
    });

    const { container } = render(
      <ProvaTimerBar
        provaIniciadaEm="2026-06-01T10:00:00.000Z"
        totalQuestoes={20}
        ritmoMetaSegundosPorQuestao={180}
      />,
    );

    expect(container.querySelector('.border-amber-300')).toBeTruthy();
    expect(
      screen.getByText(/Tempo acima da meta sugerida/, { selector: '.sr-only' }),
    ).toBeInTheDocument();
  });
});
