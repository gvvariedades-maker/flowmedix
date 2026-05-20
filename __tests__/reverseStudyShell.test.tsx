import { render, screen } from '@testing-library/react';
import { ReverseStudyShell } from '@/components/slides/core/ReverseStudyShell';

describe('ReverseStudyShell', () => {
  it('renderiza chip padrão, banca e fio condutor', () => {
    render(
      <ReverseStudyShell
        slideType="logic_flow"
        slideIndex={1}
        totalSlides={4}
        banca="CPCON"
      >
        <p>Conteúdo do slide</p>
      </ReverseStudyShell>,
    );

    expect(screen.getByLabelText(/tipo de slide/i)).toHaveTextContent('FLUXO LÓGICO');
    expect(screen.getByText('CPCON')).toBeInTheDocument();
    expect(screen.getByText(/slide 2 de 4/i)).toBeInTheDocument();
    expect(screen.getByText(/raciocínio passo a passo/i)).toBeInTheDocument();
    expect(screen.getByText('Conteúdo do slide')).toBeInTheDocument();
  });

  it('usa chip_label override e slide_title', () => {
    render(
      <ReverseStudyShell
        slideType="golden_rule"
        chipLabel="mnemônico"
        slideTitle="Critérios de choque"
        slideIndex={0}
        totalSlides={4}
      >
        <span>Tabela</span>
      </ReverseStudyShell>,
    );

    expect(screen.getByLabelText(/tipo de slide/i)).toHaveTextContent('MNEMÔNICO');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Critérios de choque');
    expect(screen.queryByText('CPCON')).not.toBeInTheDocument();
  });
});
