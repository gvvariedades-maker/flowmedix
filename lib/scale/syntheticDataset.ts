import type { HistoricoQuestaoRow, ModuloEstudoRow } from '@/lib/vitrineFilters';

type SyntheticDatasetOptions = {
  totalModulos?: number;
  totalAssuntos?: number;
  totalBancas?: number;
  historicoRatio?: number;
};

export type SyntheticScaleDataset = {
  modulos: ModuloEstudoRow[];
  historico: HistoricoQuestaoRow[];
};

const DEFAULT_BANCAS = ['FGV', 'VUNESP', 'IDECAN', 'IBFC', 'FUNDATEC'] as const;

export function generateSyntheticScaleDataset(
  options: SyntheticDatasetOptions = {},
): SyntheticScaleDataset {
  const totalModulos = Math.max(1, options.totalModulos ?? 10_000);
  const totalAssuntos = Math.max(1, options.totalAssuntos ?? 120);
  const totalBancas = Math.max(1, Math.min(options.totalBancas ?? DEFAULT_BANCAS.length, 30));
  const historicoRatio = Math.min(1, Math.max(0, options.historicoRatio ?? 0.42));

  const bancas = Array.from({ length: totalBancas }, (_, i) => {
    if (i < DEFAULT_BANCAS.length) return DEFAULT_BANCAS[i];
    return `BANCA_${String(i + 1).padStart(2, '0')}`;
  });
  const assuntos = Array.from(
    { length: totalAssuntos },
    (_, i) => `Assunto ${String(i + 1).padStart(3, '0')}`,
  );

  const modulos: ModuloEstudoRow[] = [];
  const historico: HistoricoQuestaoRow[] = [];
  const baseTs = Date.UTC(2025, 0, 1, 0, 0, 0);

  for (let i = 0; i < totalModulos; i += 1) {
    const slug = `q-synth-${String(i + 1).padStart(5, '0')}`;
    const assunto = assuntos[i % assuntos.length];
    const banca = bancas[i % bancas.length];
    const createdAt = new Date(baseTs + i * 60_000).toISOString();

    modulos.push({
      id: `mod-${i + 1}`,
      modulo_slug: slug,
      modulo_nome: `Modulo ${String((i % 40) + 1).padStart(2, '0')}`,
      titulo_aula: assunto,
      banca,
      avant_codigo: i + 1,
      created_at: createdAt,
    });

    if (i / totalModulos <= historicoRatio) {
      const acertou = i % 3 !== 0;
      historico.push({
        modulo_slug: slug,
        acertou,
        estudo_reverso_concluido: i % 4 === 0,
      });
      if (i % 10 === 0) {
        historico.push({
          modulo_slug: slug,
          acertou: !acertou,
          estudo_reverso_concluido: i % 6 === 0,
        });
      }
    }
  }

  return { modulos, historico };
}
