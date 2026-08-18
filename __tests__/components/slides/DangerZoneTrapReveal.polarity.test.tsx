import { render, screen } from '@testing-library/react';
import { DangerZoneTrapReveal } from '@/components/slides/variants/DangerZoneTrapReveal';
import { getThemeForSlide } from '@/components/slides/core/themeGenerator';

const theme = getThemeForSlide({ type: 'danger_zone' }, 'polarity-fixture', 3);

const ITEMS = [
  {
    label: 'Letra A — artéria braquial no membro superior',
    detail: 'Parece pegadinha por ser a conduta óbvia.',
    correct: 'Afirmativa correta: é o sítio clássico do membro superior.',
  },
  {
    label: 'Letra C — insuflar até 300 mmHg de rotina',
    detail: 'Sugere garantir a leitura.',
    correct: 'Insuflar 20–30 mmHg acima do desaparecimento do pulso.',
  },
];

describe('DangerZoneTrapReveal — chrome por polaridade', () => {
  it('sem polaridade, todo card é ERRO (comportamento histórico)', () => {
    render(
      <DangerZoneTrapReveal content="Pegadinhas" items={ITEMS} theme={theme} />,
    );
    expect(screen.getAllByText(/^ERRO #/)).toHaveLength(2);
    expect(screen.queryByText(/CONDUTA CORRETA #/)).toBeNull();
  });

  it('em comando negativo, conduta válida recebe chrome de acerto', () => {
    render(
      <DangerZoneTrapReveal
        content="Pegadinhas"
        items={ITEMS}
        theme={theme}
        itemPolarities={['valid_conduct', 'trap']}
      />,
    );
    expect(screen.getByText('CONDUTA CORRETA #1')).toBeInTheDocument();
    expect(screen.getByText('ERRO #2')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Revelar confirmação da conduta correta Letra A/),
    ).toBeInTheDocument();
  });
});
