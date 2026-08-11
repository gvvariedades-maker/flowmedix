import { aggregateStudyPerformance } from '@/lib/desempenho/studyPerformance';
import {
  DESEMPENHO_COACH_UNLOCK,
  DESEMPENHO_MIN_SAMPLE,
  type CatalogDesempenhoRow,
  type HistoricoDesempenhoRow,
} from '@/lib/desempenho/types';

const NOW = new Date('2026-08-11T15:00:00.000Z');

function cat(
  slug: string,
  titulo: string,
  opts?: Partial<CatalogDesempenhoRow>,
): CatalogDesempenhoRow {
  return {
    modulo_slug: slug,
    titulo_aula: titulo,
    modulo_nome: opts?.modulo_nome ?? 'Enfermagem',
    banca: opts?.banca ?? 'CPCON',
  };
}

function hist(
  partial: Partial<HistoricoDesempenhoRow> & Pick<HistoricoDesempenhoRow, 'id' | 'modulo_slug'>,
): HistoricoDesempenhoRow {
  return {
    acertou: partial.acertou ?? false,
    created_at: partial.created_at ?? '2026-08-10T12:00:00.000Z',
    banca: partial.banca ?? 'CPCON',
    estudo_reverso_concluido: partial.estudo_reverso_concluido ?? false,
    ...partial,
  };
}

describe('aggregateStudyPerformance', () => {
  it('faz join por modulo_slug e agrega por titulo_aula (não por historico.subtopico)', () => {
    const catalog = [
      cat('vias-1', 'Vias de Administração'),
      cat('vias-2', 'Vias de Administração'),
      cat('vias-3', 'Vias de Administração'),
      cat('imuno-1', 'Imunização'),
    ];
    const historico = [
      hist({ id: '1', modulo_slug: 'vias-1', acertou: true }),
      hist({ id: '2', modulo_slug: 'vias-2', acertou: false }),
      hist({ id: '3', modulo_slug: 'imuno-1', acertou: true }),
    ];

    const data = aggregateStudyPerformance(historico, catalog, { periodo: 'all' }, NOW);
    const vias = data.assuntos.find((a) => a.tituloAula === 'Vias de Administração');
    const imuno = data.assuntos.find((a) => a.tituloAula === 'Imunização');

    expect(vias).toMatchObject({
      respondidas: 2,
      acertos: 1,
      erros: 1,
      totalDisponivel: 3,
      coberturaPct: 67,
      areaId: 'farmacologia',
    });
    expect(imuno).toMatchObject({
      respondidas: 1,
      totalDisponivel: 1,
      coberturaPct: 100,
      areaId: 'saude_publica',
    });
    expect(data.placar.respondidas).toBe(3);
    expect(data.placar.acertos).toBe(2);
    expect(data.attemptSeries.available).toBe(false);
    expect(data.attemptSeries.unavailableReason).toBe('flag_off');
  });

  it('não expõe % abaixo da amostra mínima; ordena pior % com amostra ≥5 primeiro', () => {
    const catalog: CatalogDesempenhoRow[] = [];
    const historico: HistoricoDesempenhoRow[] = [];

    for (let i = 0; i < 6; i++) {
      catalog.push(cat(`fraco-${i}`, 'Urgências e Emergências'));
      historico.push(
        hist({
          id: `f-${i}`,
          modulo_slug: `fraco-${i}`,
          acertou: i === 0,
          created_at: '2026-08-10T10:00:00.000Z',
        }),
      );
    }
    for (let i = 0; i < 5; i++) {
      catalog.push(cat(`forte-${i}`, 'Imunização'));
      historico.push(
        hist({
          id: `s-${i}`,
          modulo_slug: `forte-${i}`,
          acertou: true,
          created_at: '2026-08-10T11:00:00.000Z',
        }),
      );
    }
    // amostra baixa
    catalog.push(cat('pouco-1', 'História da Enfermagem'));
    historico.push(
      hist({ id: 'p-1', modulo_slug: 'pouco-1', acertou: false, created_at: '2026-08-10T12:00:00.000Z' }),
    );

    const data = aggregateStudyPerformance(historico, catalog, null, NOW);
    const urg = data.assuntos.find((a) => a.tituloAula === 'Urgências e Emergências')!;
    const imuno = data.assuntos.find((a) => a.tituloAula === 'Imunização')!;
    const histAula = data.assuntos.find((a) => a.tituloAula === 'História da Enfermagem')!;

    expect(urg.respondidas).toBeGreaterThanOrEqual(DESEMPENHO_MIN_SAMPLE);
    expect(urg.percentual).toBe(17); // 1/6
    expect(imuno.percentual).toBe(100);
    expect(histAula.percentual).toBeNull();
    expect(histAula.amostraSuficiente).toBe(false);

    expect(data.assuntos[0]?.tituloAula).toBe('Urgências e Emergências');
    expect(data.weakAreas[0]?.tituloAula).toBe('Urgências e Emergências');
  });

  it('filtra atividade no período sem alterar totalDisponivel do catálogo', () => {
    const catalog = [
      cat('a-1', 'Imunização'),
      cat('a-2', 'Imunização'),
      cat('a-3', 'Imunização'),
    ];
    const historico = [
      hist({
        id: 'old',
        modulo_slug: 'a-1',
        acertou: true,
        created_at: '2026-01-01T00:00:00.000Z',
      }),
      hist({
        id: 'new',
        modulo_slug: 'a-2',
        acertou: false,
        created_at: '2026-08-09T00:00:00.000Z',
      }),
    ];

    const data = aggregateStudyPerformance(
      historico,
      catalog,
      { periodo: '7d' },
      NOW,
    );
    const imuno = data.assuntos.find((a) => a.tituloAula === 'Imunização')!;
    expect(imuno.respondidas).toBe(1);
    expect(imuno.acertos).toBe(0);
    expect(imuno.totalDisponivel).toBe(3);
    expect(imuno.coberturaPct).toBe(33);
    expect(data.placar.respondidas).toBe(1);
  });

  it('monta fila nextPractice com weak + errou sem reverso', () => {
    const catalog: CatalogDesempenhoRow[] = [];
    const historico: HistoricoDesempenhoRow[] = [];
    for (let i = 0; i < 5; i++) {
      catalog.push(cat(`w-${i}`, 'Saúde Mental'));
      historico.push(
        hist({
          id: `w-${i}`,
          modulo_slug: `w-${i}`,
          acertou: false,
          estudo_reverso_concluido: i === 0,
          created_at: '2026-08-10T10:00:00.000Z',
        }),
      );
    }

    const data = aggregateStudyPerformance(historico, catalog, null, NOW);
    expect(data.nextPractice.length).toBeGreaterThan(0);
    expect(data.nextPractice[0]).toMatchObject({
      tituloAula: 'Saúde Mental',
      reason: 'weak_accuracy',
      deepLinkAssunto: 'Saúde Mental',
    });
    expect(data.recentAttempts.some((r) => r.estudoReversoConcluido)).toBe(true);
  });

  it('libera coach a partir do limiar de respondidas', () => {
    const catalog = Array.from({ length: DESEMPENHO_COACH_UNLOCK }, (_, i) =>
      cat(`c-${i}`, 'Imunização'),
    );
    const historico = catalog.map((c, i) =>
      hist({ id: `h-${i}`, modulo_slug: c.modulo_slug, acertou: true }),
    );
    const locked = aggregateStudyPerformance(historico.slice(0, 3), catalog, null, NOW);
    const unlocked = aggregateStudyPerformance(historico, catalog, null, NOW);
    expect(locked.placar.coachUnlocked).toBe(false);
    expect(unlocked.placar.coachUnlocked).toBe(true);
  });

  it('assuntos sem canônico caem em Outros no radar e permanecem no mapa', () => {
    const catalog = [cat('x-1', 'Tópico Legado Sem Mapa')];
    const historico = [hist({ id: '1', modulo_slug: 'x-1', acertou: true })];
    const data = aggregateStudyPerformance(historico, catalog, null, NOW);
    const row = data.assuntos.find((a) => a.tituloAula === 'Tópico Legado Sem Mapa')!;
    expect(row.areaId).toBe('outros');
    expect(data.riskBands.some((b) => b.riskBandId === 'outros')).toBe(true);
  });

  it('ignora placeholder respondida=false no % e no placar (mantém catálogo)', () => {
    const catalog = [
      cat('v-1', 'Vias de Administração'),
      cat('v-2', 'Vias de Administração'),
      cat('v-3', 'Vias de Administração'),
    ];
    const historico = [
      hist({ id: '1', modulo_slug: 'v-1', acertou: true, respondida: true }),
      hist({
        id: '2',
        modulo_slug: 'v-2',
        acertou: false,
        respondida: false,
        estudo_reverso_concluido: true,
      }),
    ];

    const data = aggregateStudyPerformance(historico, catalog, null, NOW);
    const vias = data.assuntos.find((a) => a.tituloAula === 'Vias de Administração')!;

    expect(vias).toMatchObject({
      respondidas: 1,
      acertos: 1,
      erros: 0,
      totalDisponivel: 3,
      coberturaPct: 33,
    });
    expect(data.placar.respondidas).toBe(1);
    expect(data.placar.acertos).toBe(1);
    expect(data.recentAttempts).toHaveLength(1);
    expect(data.recentAttempts[0]?.moduloSlug).toBe('v-1');
  });
});
