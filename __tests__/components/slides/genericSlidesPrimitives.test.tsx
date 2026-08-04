/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { ConceptMap } from '@/components/slides/variants/ConceptMap';
import { GoldenRule } from '@/components/slides/variants/GoldenRule';
import { DangerZone } from '@/components/slides/variants/DangerZone';
import type { ThemeColors } from '@/components/slides/core/themeGenerator';

const theme = {
  bgGradient: 'from-sky-100 to-white',
  textPrimary: 'text-slate-900',
  textSecondary: 'text-slate-600',
  borderColor: 'border-sky-200',
  iconBg: 'bg-sky-50',
  iconText: 'text-sky-700',
  glow: 'rgba(14,165,233,0.2)',
} as ThemeColors;

describe('generic slides → G2 primitives', () => {
  it('ConceptMap grid uses BoardChrome eyebrow + PillarDeck', () => {
    render(
      <ConceptMap
        concepts={[
          { icon: 'Heart', title: 'Vínculo', description: 'Acolher sem julgamento' },
          { icon: 'Shield', title: 'Sigilo', description: 'Privacidade do adolescente' },
        ]}
        theme={theme}
        layoutVariant="grid"
        footerRule="Na prova: 4 pilares do encontro."
      />,
    );
    expect(screen.getByText(/mapa da cobrança/i)).toBeInTheDocument();
    expect(screen.getByText(/transferência/i)).toBeInTheDocument();
    expect(screen.getByText('Vínculo')).toBeInTheDocument();
  });

  it('GoldenRule reference_table uses LabelBodyRow rail + FIXAÇÃO footer', () => {
    render(
      <GoldenRule
        content="Parâmetros SV"
        rows={[
          { label: 'FC adulto', value: '60–100 bpm', emphasis: 'success', badge: 'ok' },
          { label: 'FR adulto', value: '12–20 irpm', emphasis: 'highlight' },
        ]}
        theme={theme}
        layoutVariant="reference_table"
        footerRule="Decore a faixa antes de eliminar."
      />,
    );
    expect(screen.getByText(/decore clínico/i)).toBeInTheDocument();
    expect(screen.getByText(/fixação/i)).toBeInTheDocument();
    expect(screen.getByText('60–100 bpm')).toBeInTheDocument();
  });

  it('DangerZone compare uses PolarityPanel + tap reveal', () => {
    render(
      <DangerZone
        content="Assinale a INCORRETA"
        theme={theme}
        layoutVariant="compare"
        compareRevealMode="tap"
        footerRule="Pegadinha × conduta certa."
        items={[
          {
            label: 'A',
            detail: 'Massagem em proeminência óssea',
            correct: 'Evitar proeminências — massagear tecido muscular.',
          },
        ]}
      />,
    );
    expect(screen.getByText(/arena da pegadinha/i)).toBeInTheDocument();
    expect(screen.getByText(/massagem em proeminência/i)).toBeInTheDocument();
    expect(screen.queryByText(/evitar proeminências/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /ver resposta correta/i }));
    expect(screen.getByText(/evitar proeminências/i)).toBeInTheDocument();
    expect(screen.getByText(/transferência/i)).toBeInTheDocument();
  });
});
