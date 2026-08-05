/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import {
  LogicFocusShell,
  LogicIsolateShell,
  LogicRailShell,
  focusStepTitle,
  letterEliminationFromSteps,
  letterStepsFromPtRoles,
  PROTOCOL_SHELL_ACCENTS,
} from '@/components/slides/logicFlowShells';
import type { ThemeColors } from '@/components/slides/core/themeGenerator';

const theme = {
  bgGradient: 'from-sky-100 to-white',
  textSecondary: 'text-sky-800',
  borderColor: 'border-sky-200',
  glow: 'rgba(14,165,233,0.2)',
} as ThemeColors;

describe('logicFlowShells (Fase A+B)', () => {
  it('focusStepTitle returns protocolo titles for xabcde', () => {
    expect(focusStepTitle('Comando trauma pré-hospitalar', 0, 'xabcde')).toMatch(/trauma/i);
    expect(PROTOCOL_SHELL_ACCENTS.has('xabcde')).toBe(true);
  });

  it('LogicFocusShell shows one card and budgets overflow to ≤3', () => {
    render(
      <LogicFocusShell
        steps={['a', 'b', 'c', 'd', 'e']}
        theme={theme}
        revealMode="tap"
        accent="clinical"
        applyTapBudget
      />,
    );
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.queryByText(/^d$/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /próximo passo/i }));
    expect(screen.getByText('2/3')).toBeInTheDocument();
  });

  it('LogicFocusShell uses G2 BoardChrome footer (TRANSFERÊNCIA)', () => {
    render(
      <LogicFocusShell
        steps={['Ler o comando', 'Eliminar distrator', 'Gabarito letra B']}
        theme={theme}
        revealMode="tap"
        accent="clinical"
        applyTapBudget={false}
        footerRule="Na prova: um passo por vez até a letra."
      />,
    );
    expect(screen.getByText(/transferência/i)).toBeInTheDocument();
    expect(screen.getByText(/na prova: um passo por vez/i)).toBeInTheDocument();
    expect(screen.getByText(/decisão clínica/i)).toBeInTheDocument();
  });

  it('LogicIsolateShell is glanceable (no próximo passo)', () => {
    render(
      <LogicIsolateShell
        steps={[
          'Ler o comando: assinale a INCORRETA',
          'Conduta A é adequada',
          'EXCETO: massagem em proeminência óssea',
          'Marcar a letra do gabarito',
        ]}
        theme={theme}
      />,
    );
    expect(screen.getByText(/exceção isolada/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /próximo/i })).not.toBeInTheDocument();
  });

  it('LogicRailShell reveals protocol rows with CTA', () => {
    render(
      <LogicRailShell
        steps={['Ler comando trauma', 'Eliminar A hemorragia', 'Marcar gabarito']}
        theme={theme}
        accent="xabcde"
        applyTapBudget={false}
      />,
    );
    expect(screen.getByText(/protocolo clínico/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /próximo elo/i }));
    expect(screen.getByText('2/3')).toBeInTheDocument();
  });
});

describe('P1 logic_tap → shells (lote Mulher/Peri/Mental/EXCETO)', () => {
  it('ItuExceto and AdolescentExceto wrap IsolateShell', async () => {
    const { LogicFlowItuExcetoTap } = await import(
      '@/components/slides/variants/LogicFlowItuExcetoTap'
    );
    const { LogicFlowAdolescentExcetoIsolateTap } = await import(
      '@/components/slides/variants/LogicFlowAdolescentExcetoIsolateTap'
    );
    const { rerender } = render(
      <LogicFlowItuExcetoTap
        steps={['Ler comando EXCETO', 'Conduta A ok', 'EXCETO: abrir sistema', 'Marcar letra']}
        theme={theme}
      />,
    );
    expect(screen.getByText(/itu \/ sistema fechado/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /próximo/i })).not.toBeInTheDocument();

    rerender(
      <LogicFlowAdolescentExcetoIsolateTap
        steps={['Ler INCORRETA', 'A adequada', 'EXCETO: quebrar sigilo', 'Marcar']}
        theme={theme}
      />,
    );
    expect(screen.getByText(/saúde do adolescente/i)).toBeInTheDocument();
  });

  it('PeriProtocol wraps RailShell; Mental/Etiology wrap FocusShell', async () => {
    const { LogicFlowPeriProtocolTapFlow } = await import(
      '@/components/slides/variants/LogicFlowPeriProtocolTapFlow'
    );
    const { LogicFlowMentalCrisisDecisionTap } = await import(
      '@/components/slides/variants/LogicFlowMentalCrisisDecisionTap'
    );
    const { LogicFlowEtiologyEliminationTap } = await import(
      '@/components/slides/variants/LogicFlowEtiologyEliminationTap'
    );

    const { rerender } = render(
      <LogicFlowPeriProtocolTapFlow
        steps={['Checklist safer', 'Eliminar distrator', 'Gabarito letra B']}
        theme={theme}
        revealMode="tap"
      />,
    );
    expect(screen.getByText(/protocolo perioperatório/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /próximo elo/i }));

    rerender(
      <LogicFlowMentalCrisisDecisionTap
        steps={['Âncora crise', 'Eliminar coerção', 'Gabarito']}
        theme={theme}
      />,
    );
    expect(screen.getByText(/crise · priorizar/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próximo passo/i })).toBeInTheDocument();

    rerender(
      <LogicFlowEtiologyEliminationTap
        steps={['Descartar A', 'Descartar B', 'Marcar C']}
        theme={theme}
      />,
    );
    expect(screen.getByText(/etiologia · eliminar/i)).toBeInTheDocument();
  });
});

describe('P1 lote 2 — Mulher letter rail + VF hub G2', () => {
  it('letterEliminationFromSteps marks eliminate and locate', () => {
    const { eliminated, winnerLetter } = letterEliminationFromSteps(
      [
        { kind: 'eliminate', letter: 'A' },
        { kind: 'eliminate', letter: 'C' },
        { kind: 'locate', letter: 'B' },
      ],
      2,
      true,
    );
    expect(eliminated.has('A')).toBe(true);
    expect(eliminated.has('C')).toBe(true);
    expect(winnerLetter).toBe('B');
  });

  it('MulherLabor uses FocusShell + letter rail', async () => {
    const { LogicFlowMulherLaborTapFlow } = await import(
      '@/components/slides/variants/LogicFlowMulherLaborTapFlow'
    );
    render(
      <LogicFlowMulherLaborTapFlow
        steps={[
          'Eliminar letra A — fase latente',
          'Eliminar letra C — expulsivo',
          'Localizar gabarito letra B',
        ]}
        theme={theme}
        footerRule="Na prova: fase × conduta."
      />,
    );
    expect(screen.getByText(/trilho do parto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/alternativas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próximo passo/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /próximo passo/i }));
    expect(screen.getByText(/transferência/i)).toBeInTheDocument();
  });

  it('PniVfJuggleTap uses BoardChrome G2 + keep judgement UX', async () => {
    const { LogicFlowPniVfJuggleTap } = await import(
      '@/components/slides/variants/LogicFlowPniVfJuggleTap'
    );
    render(
      <LogicFlowPniVfJuggleTap
        steps={[
          'Julgar afirmativa I: vacina X → VERDADEIRO',
          'Localizar alternativa letra C e marcar',
        ]}
        theme={theme}
        accentVariant="via"
        footerRule="Combine V/F antes da letra."
      />,
    );
    expect(screen.getByText(/juggle v\/f/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /julgar/i })).toBeInTheDocument();
  });
});

describe('P1 lote 4 — Adolescente VF/Z + Vitals', () => {
  it('AdolescentVfWeaveTap uses BoardChrome + fios V/F', async () => {
    const { LogicFlowAdolescentVfWeaveTap } = await import(
      '@/components/slides/variants/LogicFlowAdolescentVfWeaveTap'
    );
    render(
      <LogicFlowAdolescentVfWeaveTap
        steps={[
          'Afirmativa I verdadeira — sigilo em contracepção',
          'Afirmativa II falsa — quebra sem critério',
          'Combinar fios verdadeiros → letra B',
        ]}
        theme={theme}
        footerRule="Na prova: teça V/F antes da letra."
      />,
    );
    expect(screen.getByText(/saúde do adolescente/i)).toBeInTheDocument();
    expect(screen.getByText(/tece os fios/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fios v\/f/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próximo/i })).toBeInTheDocument();
  });

  it('AdolescentZClassifyTap uses FocusShell + trilho Z + letter rail', async () => {
    const { LogicFlowAdolescentZClassifyTap } = await import(
      '@/components/slides/variants/LogicFlowAdolescentZClassifyTap'
    );
    render(
      <LogicFlowAdolescentZClassifyTap
        steps={[
          'A: elimina — faixa Z errada (−1 a −2)',
          'B: correta conforme MS/OMS (+1 a +2)',
          'Marcar B',
        ]}
        theme={theme}
        footerRule="Classifique no trilho Z."
      />,
    );
    expect(screen.getByText(/escore z/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/trilho escore z/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/alternativas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próximo passo/i })).toBeInTheDocument();
  });

  it('VitalsTranslateTap uses BoardChrome + Traduzir', async () => {
    const { LogicFlowVitalsTranslateTap } = await import(
      '@/components/slides/variants/LogicFlowVitalsTranslateTap'
    );
    render(
      <LogicFlowVitalsTranslateTap
        steps={[
          'Interpretar a frequência cardíaca: 120 bpm = taquicardia.',
          'Combinar achados e marcar a alternativa correta.',
        ]}
        theme={theme}
        footerRule="Traduza o valor antes de marcar."
      />,
    );
    expect(screen.getByText(/tradução sv/i)).toBeInTheDocument();
    expect(screen.getByText(/valor → termo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /traduzir/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /traduzir/i }));
    expect(screen.getByText(/taquicardia/i)).toBeInTheDocument();
  });

  it('VitalsTranslateTap elimination board is glanceable (0 taps)', async () => {
    const { LogicFlowVitalsTranslateTap } = await import(
      '@/components/slides/variants/LogicFlowVitalsTranslateTap'
    );
    render(
      <LogicFlowVitalsTranslateTap
        steps={[
          'A: temperatura após exercício → eliminar.',
          'B: pulso com polegar → eliminar.',
          'Gabarito: letra D.',
          'Em similares: elimine erros de técnica antes do checklist de PA.',
        ]}
        theme={theme}
        footerRule="PA: nível do coração + manguito certo fecha a questão"
      />,
    );
    expect(screen.getByText(/eliminação/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/passos de eliminação/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /traduzir/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/valor → termo/i)).not.toBeInTheDocument();
    expect(screen.getByText(/gabarito: letra d/i)).toBeInTheDocument();
  });
});

describe('P1 lote 3 — PNI calendar/cold + Tb VF', () => {
  it('letterEliminationFromSteps treats catchup_eliminate as eliminate', () => {
    const { eliminated, winnerLetter } = letterEliminationFromSteps(
      [
        { kind: 'catchup_eliminate', letter: 'A' },
        { kind: 'eliminate', letter: 'D' },
        { kind: 'locate', letter: 'B' },
      ],
      2,
      true,
    );
    expect(eliminated.has('A')).toBe(true);
    expect(eliminated.has('D')).toBe(true);
    expect(winnerLetter).toBe('B');
  });

  it('PniCalendar renders Glance OS board (0 taps)', async () => {
    const { LogicFlowPniCalendarEliminationTap } = await import(
      '@/components/slides/variants/LogicFlowPniCalendarEliminationTap'
    );
    render(
      <LogicFlowPniCalendarEliminationTap
        steps={[
          'Fixar o marco etário: 3º mês de vida.',
          'Testar A — BCG: ao nascer → eliminar.',
          'Testar C — difteria: 2-4-6 → eliminar.',
          'Marcar B — única alinhada ao 3º mês no PNI.',
          'Em similares: idade → calendário → descartar vizinhos.',
        ]}
        theme={theme}
        footerRule="Na prova: idade × vacina do calendário."
      />,
    );
    expect(screen.getByText(/board — calendário pni/i)).toBeInTheDocument();
    expect(screen.getByText(/^B$/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /próximo passo/i })).not.toBeInTheDocument();
    expect(screen.getByText(/transferência/i)).toBeInTheDocument();
  });

  it('PniColdChain VF renders Glance OS board (0 taps)', async () => {
    const { LogicFlowPniColdChainTap } = await import(
      '@/components/slides/variants/LogicFlowPniColdChainTap'
    );
    render(
      <LogicFlowPniColdChainTap
        steps={[
          'I — BCG intradérmica → V.',
          'II — agitar recupera cadeia → F.',
          'III — pentavalente DTP+Hib → V.',
          'IV — técnico prescreve fora → F.',
          'Combinar sequência V, F, V, F → letra C.',
          'Marcar C.',
          'Em similares: agitar ≠ recuperar.',
        ]}
        theme={theme}
        footerRule="Julgue cada linha antes de combinar."
      />,
    );
    expect(screen.getByText(/board v\/f — cadeia de frio/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /próximo passo/i })).not.toBeInTheDocument();
    expect(screen.getByText(/transferência/i)).toBeInTheDocument();
  });

  it('PniColdChain MCQ renders board (0 taps)', async () => {
    const { LogicFlowPniColdChainTap } = await import(
      '@/components/slides/variants/LogicFlowPniColdChainTap'
    );
    render(
      <LogicFlowPniColdChainTap
        steps={[
          'Decore: temperatura positiva = 2 °C a 8 °C.',
          'Eliminar A: piso abaixo de 2 °C.',
          'Marcar B: única faixa 2–8 °C.',
          'Em similares: 2–8 °C é o piso/teto.',
        ]}
        theme={theme}
        footerRule="Na prova: 2–8 °C é o piso/teto."
      />,
    );
    expect(screen.getByText(/board — rede de frio/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /próximo passo/i })).not.toBeInTheDocument();
    expect(screen.getByText(/transferência/i)).toBeInTheDocument();
  });

  it('TbVfElimination wraps FocusShell + roman V/F rail', async () => {
    const { LogicFlowTbVfEliminationTap } = await import(
      '@/components/slides/variants/LogicFlowTbVfEliminationTap'
    );
    const { romanVfStatusFromSteps } = await import('@/components/slides/logicFlowShells');

    const status = romanVfStatusFromSteps(
      [
        { roman: 'I', status: 'verdadeira' },
        { roman: 'II', status: 'falsa' },
        { roman: null, status: 'neutra' },
      ],
      1,
    );
    expect(status.I).toBe('verdadeira');
    expect(status.II).toBe('falsa');
    expect(status.III).toBe('neutra');

    render(
      <LogicFlowTbVfEliminationTap
        steps={[
          'I — bacilo de Koch → verdadeira.',
          'II — transmissão por água → falsa.',
          'Marcar a combinação correta.',
        ]}
        theme={theme}
        footerRule="Na prova: julgue I–III antes da letra."
      />,
    );
    expect(screen.getByText(/tuberculose · v\/f/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/afirmativas v\/f/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próximo passo/i })).toBeInTheDocument();
  });
});

describe('P1 lote 5 — Pt taps (crase/clítico/vírgula/termo)', () => {
  it('letterStepsFromPtRoles + eliminar_letra/gabarito feed the rail', () => {
    const steps = letterStepsFromPtRoles(
      [
        'A: barra — sem crase no masculino',
        'B: barra — só prep a',
        'Gabarito C',
      ],
      (s) => {
        if (/gabarito/i.test(s)) return 'gabarito';
        if (/barra|sem crase/i.test(s)) return 'eliminar_letra';
        return 'generico';
      },
      (s) => s.match(/^([A-E])/i)?.[1]?.toUpperCase() ?? null,
    );
    const { eliminated, winnerLetter } = letterEliminationFromSteps(steps, 2, true);
    expect(eliminated.has('A')).toBe(true);
    expect(eliminated.has('B')).toBe(true);
    expect(winnerLetter).toBe('C');
  });

  it('PtCraseFunnel fallback uses FocusShell + letter rail', async () => {
    const { LogicFlowPtCraseFunnelTapFlow } = await import(
      '@/components/slides/variants/LogicFlowPtCraseFunnelTapFlow'
    );
    render(
      <LogicFlowPtCraseFunnelTapFlow
        steps={[
          'A: barra — sem crase no masculino',
          'B: barra — verbo pede a',
          'Gabarito D',
        ]}
        theme={theme}
        footerRule="Na prova: a + a antes de à."
      />,
    );
    expect(screen.getByText(/funil da crase/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/alternativas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próximo passo/i })).toBeInTheDocument();
  });

  it('PtCliticRail fallback uses FocusShell + letter rail', async () => {
    const { LogicFlowPtCliticRailTapFlow } = await import(
      '@/components/slides/variants/LogicFlowPtCliticRailTapFlow'
    );
    render(
      <LogicFlowPtCliticRailTapFlow
        steps={[
          'A: barrada — precisa proclise',
          'B: barrada — particípio sem ênclise',
          'Gabarito C',
        ]}
        theme={theme}
        footerRule="Há atrativo? → pró."
      />,
    );
    expect(screen.getByText(/trilho do clítico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/alternativas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próximo passo/i })).toBeInTheDocument();
  });

  it('PtCommaRail uses FocusShell + letter rail', async () => {
    const { LogicFlowPtCommaRailTapFlow } = await import(
      '@/components/slides/variants/LogicFlowPtCommaRailTapFlow'
    );
    render(
      <LogicFlowPtCommaRailTapFlow
        steps={[
          'A: barra — corta sujeito|verbo',
          'B: passa — isola vocativo',
          'Gabarito B',
        ]}
        theme={theme}
        footerRule="O que a vírgula isola?"
      />,
    );
    expect(screen.getByText(/trilho da vírgula/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/alternativas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próximo passo/i })).toBeInTheDocument();
  });

  it('PtTermMatrix uses FocusShell + letter rail + célula', async () => {
    const { LogicFlowPtTermMatrixTapFlow } = await import(
      '@/components/slides/variants/LogicFlowPtTermMatrixTapFlow'
    );
    render(
      <LogicFlowPtTermMatrixTapFlow
        steps={[
          'T1 classificar: circunstância de tempo',
          'A: eliminar — confunde adjunto',
          'Gabarito C',
        ]}
        theme={theme}
        footerRule="Pergunta-teste por termo."
      />,
    );
    expect(screen.getByText(/matriz de termos/i)).toBeInTheDocument();
    expect(screen.getByText(/^t1$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/alternativas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próximo passo/i })).toBeInTheDocument();
  });
});

describe('P1 lote 6 — SoftStack legado → FocusShell', () => {
  it('LogicFlowSoftStack wraps FocusShell (no pastel deck)', async () => {
    const { LogicFlowSoftStack } = await import(
      '@/components/slides/variants/LogicFlowSoftStack'
    );
    render(
      <LogicFlowSoftStack
        steps={['Ler o comando do cateter', 'Eliminar A — troca diária', 'Gabarito letra B']}
        theme={theme}
        footerRule="Na prova: um cuidado por passo."
      />,
    );
    expect(screen.getByText(/acesso venoso · decisão/i)).toBeInTheDocument();
    expect(screen.queryByText(/soft stack/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próximo passo/i })).toBeInTheDocument();
    expect(screen.getByText(/transferência/i)).toBeInTheDocument();
  });

  it('LabVfSoftStack wraps FocusShell + roman rail (no hardcoded gabarito)', async () => {
    const { LogicFlowLabVfSoftStack } = await import(
      '@/components/slides/variants/LogicFlowLabVfSoftStack'
    );
    render(
      <LogicFlowLabVfSoftStack
        steps={[
          'Julgar I: mediana cubital → verdadeira',
          'Julgar II: refrigerar a 2 °C → falsa',
          'Montar o conjunto e marcar letra',
        ]}
        theme={theme}
        footerRule="Na prova: julgue I–III antes da letra."
      />,
    );
    expect(screen.getByText(/coleta · v\/f/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/afirmativas v\/f/i)).toBeInTheDocument();
    expect(screen.queryByText(/letra d/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próximo passo/i })).toBeInTheDocument();
  });
});
