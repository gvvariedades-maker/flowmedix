import { PNI_INTERVALOS_2025 } from '@/lib/guidelines/pni';
import { SINAIS_VITAIS_ADULTO } from '@/lib/guidelines/sinaisVitais';
import type { GuidelineTable } from '@/lib/guidelines/types';

export type { GuidelineEntry, GuidelineTable } from '@/lib/guidelines/types';
export { PNI_INTERVALOS_2025 } from '@/lib/guidelines/pni';
export { SINAIS_VITAIS_ADULTO } from '@/lib/guidelines/sinaisVitais';

/** Índice de tabelas oficiais — builders só devem usar entradas deste mapa. */
export const GUIDELINE_TABLES: Record<string, GuidelineTable> = {
  [PNI_INTERVALOS_2025.id]: PNI_INTERVALOS_2025,
  [SINAIS_VITAIS_ADULTO.id]: SINAIS_VITAIS_ADULTO,
};

export function getGuidelineTable(id: string): GuidelineTable | undefined {
  return GUIDELINE_TABLES[id];
}

export function getGuidelineEntry(tableId: string, entryId: string) {
  const table = GUIDELINE_TABLES[tableId];
  return table?.entries.find((e) => e.id === entryId);
}
