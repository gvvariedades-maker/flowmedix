import {
  buildNotebookSummaries,
  clonedByPackIdFromSummaries,
  estudadosSetFromHistorico,
  resolveStudyEntry,
  type NotebookItemRow,
  type NotebookRow,
} from '@/lib/cadernos/notebookSummary';

const notebook: NotebookRow = {
  id: 'nb-1',
  title: 'Imunização',
  description: null,
  source_pack_id: 'meu-edital',
  updated_at: '2026-08-01T00:00:00.000Z',
};

const items: NotebookItemRow[] = [
  { modulo_slug: 'a', position: 1, titulo_aula: 'Dose 1', topico: null },
  { modulo_slug: 'b', position: 2, titulo_aula: 'Dose 2', topico: null },
  { modulo_slug: 'c', position: 3, titulo_aula: 'Dose 3', topico: null },
];

describe('lib/cadernos/notebookSummary', () => {
  it('sem histórico a lista ainda tem itemCount e entra na primeira questão', () => {
    const summaries = buildNotebookSummaries(
      [notebook],
      new Map([['nb-1', items]]),
      new Set(),
    );

    expect(summaries).toHaveLength(1);
    expect(summaries[0].itemCount).toBe(3);
    expect(summaries[0].studiedCount).toBe(0);
    expect(summaries[0].studyEntrySlug).toBe('a');
    expect(summaries[0].studyEntryTitle).toBe('Dose 1');
    expect(summaries[0].studyEntryPosition).toBe(1);
  });

  it('com histórico pula questões já concluídas na ordem do caderno', () => {
    const estudados = estudadosSetFromHistorico([
      { modulo_slug: 'a', estudo_reverso_concluido: true },
      { modulo_slug: 'b', estudo_reverso_concluido: false },
    ]);
    expect(resolveStudyEntry(items, estudados)).toEqual({
      slug: 'b',
      title: 'Dose 2',
      position: 2,
    });

    const summaries = buildNotebookSummaries(
      [notebook],
      new Map([['nb-1', items]]),
      estudados,
    );
    expect(summaries[0].studiedCount).toBe(1);
    expect(summaries[0].studyEntrySlug).toBe('b');
  });

  it('monta clonedByPackId só com cadernos de pack', () => {
    const [summary] = buildNotebookSummaries(
      [notebook, { ...notebook, id: 'nb-2', source_pack_id: null, title: 'Manual' }],
      new Map([
        ['nb-1', items],
        ['nb-2', []],
      ]),
      new Set(['a']),
    );
    const cloned = clonedByPackIdFromSummaries([
      summary,
      {
        ...summary,
        id: 'nb-2',
        title: 'Manual',
        source_pack_id: null,
        itemCount: 0,
        studiedCount: 0,
        studyEntrySlug: null,
        studyEntryTitle: null,
        studyEntryPosition: null,
      },
    ]);
    expect(cloned.size).toBe(1);
    expect(cloned.get('meu-edital')?.id).toBe('nb-1');
  });
});
