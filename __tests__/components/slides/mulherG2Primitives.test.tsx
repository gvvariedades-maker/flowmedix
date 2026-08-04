/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { MulherGestationTimelineConceptMap } from '@/components/slides/variants/MulherGestationTimelineConceptMap';
import { GoldenRuleMulherPrenatalBoard } from '@/components/slides/variants/GoldenRuleMulherPrenatalBoard';
import { DangerZoneMulherPrenatalTrapArena } from '@/components/slides/variants/DangerZoneMulherPrenatalTrapArena';
import type { ThemeColors } from '@/components/slides/core/themeGenerator';

const theme = {
  bgGradient: 'from-pink-100 to-white',
  textPrimary: 'text-slate-900',
  textSecondary: 'text-slate-600',
  borderColor: 'border-pink-200',
  iconBg: 'bg-pink-50',
  iconText: 'text-pink-700',
  glow: 'rgba(236,72,153,0.2)',
} as ThemeColors;

describe('Saúde da Mulher → G2 primitives', () => {
  it('gestation timeline uses BoardChrome + ProtocolRailRow', () => {
    render(
      <MulherGestationTimelineConceptMap
        concepts={[
          {
            icon: 'Heart',
            title: 'Captação precoce',
            description: 'Iniciar pré-natal até 12 semanas — Caderno AB 32.',
          },
        ]}
        theme={theme}
        footerRule="Na prova: marco gestacional antes de eliminar."
      />,
    );
    expect(screen.getByText(/trilho gestacional/i)).toBeInTheDocument();
    expect(screen.getByText(/transferência/i)).toBeInTheDocument();
    expect(screen.getByText(/captação precoce/i)).toBeInTheDocument();
  });

  it('prenatal board uses LabelBodyRow + TrimesterRail', () => {
    render(
      <GoldenRuleMulherPrenatalBoard
        content="Pré-natal — Caderno AB 32"
        rows={[
          { label: 'Consultas', value: 'Mínimo 6 consultas no pré-natal' },
          { label: '1º trimestre', value: 'Ácido fólico e captação precoce' },
        ]}
        theme={theme}
        footerRule="Decore periodicidade antes do V/F."
      />,
    );
    expect(screen.getByText('Pré-natal — Caderno AB 32')).toBeInTheDocument();
    expect(screen.getByText(/mínimo 6 consultas/i)).toBeInTheDocument();
    expect(screen.getByText(/transferência/i)).toBeInTheDocument();
  });

  it('prenatal trap arena uses PolarityPanel + tap reveal', () => {
    render(
      <DangerZoneMulherPrenatalTrapArena
        content="Pegadinhas do pré-natal"
        theme={theme}
        footerRule="Trimestre certo × pegadinha."
        items={[
          {
            label: 'Letra A — TTGO precoce',
            detail: 'Fazer TTGO na 1ª consulta para todas',
            correct: 'TTGO entre 24–28 semanas na gestante sem risco.',
          },
        ]}
      />,
    );
    expect(screen.getByText(/pegadinhas do pré-natal/i)).toBeInTheDocument();
    expect(screen.getByText(/fazer ttgo na 1ª consulta/i)).toBeInTheDocument();
    expect(screen.queryByText(/24–28 semanas/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/24–28 semanas/i)).toBeInTheDocument();
    expect(screen.getByText(/transferência/i)).toBeInTheDocument();
  });
});
