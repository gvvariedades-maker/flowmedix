import { materialSlidesLote1 } from './lote-01';
import { materialSlidesLote2 } from './lote-02';
import { materialSlidesLote3 } from './lote-03';
import { materialSlidesLote4 } from './lote-04';
import { materialSlidesLote5 } from './lote-05';
import { materialSlidesLote6 } from './lote-06';
import { materialSlidesLote7 } from './lote-07';
import { TOTAL_ITENS, type MaterialApoioLoteItem } from './types';

export const LOTES: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, readonly MaterialApoioLoteItem[]> = {
  1: materialSlidesLote1,
  2: materialSlidesLote2,
  3: materialSlidesLote3,
  4: materialSlidesLote4,
  5: materialSlidesLote5,
  6: materialSlidesLote6,
  7: materialSlidesLote7,
};

export function getItensLote(
  n: 1 | 2 | 3 | 4 | 5 | 6 | 7,
): readonly MaterialApoioLoteItem[] {
  return LOTES[n];
}

export const todosItensMaterialApoio: MaterialApoioLoteItem[] = [
  ...materialSlidesLote1,
  ...materialSlidesLote2,
  ...materialSlidesLote3,
  ...materialSlidesLote4,
  ...materialSlidesLote5,
  ...materialSlidesLote6,
  ...materialSlidesLote7,
];

if (todosItensMaterialApoio.length !== TOTAL_ITENS) {
  throw new Error(
    `Inconsistência: esperava ${TOTAL_ITENS} itens, encontrou ${todosItensMaterialApoio.length}.`,
  );
}

for (let i = 0; i < todosItensMaterialApoio.length; i++) {
  if (todosItensMaterialApoio[i].id !== i + 1) {
    throw new Error(
      `IDs fora de ordem: posição ${i} esperava id ${i + 1}, veio ${todosItensMaterialApoio[i].id}.`,
    );
  }
}
