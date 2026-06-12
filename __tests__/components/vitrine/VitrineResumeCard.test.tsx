import { render, screen } from '@testing-library/react';
import VitrineResumeCard from '@/components/vitrine/VitrineResumeCard';
import type { VitrineResumeHint } from '@/lib/vitrine/resume';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const resume: VitrineResumeHint = {
  moduloSlug: 'questao-1',
  questaoSlug: 'questao-1',
  tituloAula: 'Verificação de Sinais Vitais',
  avantCodigo: 42,
  studiedAt: '2026-06-01T12:00:00.000Z',
};

describe('VitrineResumeCard', () => {
  it('renderiza continuar com título, código e link de retomada', () => {
    render(<VitrineResumeCard resume={resume} estudarQuery="?page=1" />);

    expect(screen.getByTestId('vitrine-resume-card')).toBeInTheDocument();
    expect(screen.getByText('Continuar de onde parou')).toBeInTheDocument();
    expect(screen.getByText('Verificação de Sinais Vitais')).toBeInTheDocument();
    expect(screen.getByText('Q-42')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Retomar estudo/i })).toHaveAttribute(
      'href',
      '/estudar/questao-1?page=1',
    );
  });
});
