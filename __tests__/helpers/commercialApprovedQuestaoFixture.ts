import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { fingerprintConteudoJson } from '@/lib/catalogMigration/contentFingerprint';
import { stampEfficacyContentFingerprint } from '@/lib/catalogMigration/commercialContentApproval';

export const COMMERCIAL_APPROVED_TITULO_AULA = 'Imunização';

const GOLDEN_IMUNIZACAO = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'examples/questao-premium-cpcon-imunizacao-intervalos-vf.json'),
    'utf8',
  ),
) as {
  meta: Record<string, unknown>;
  question_data: {
    instruction: string;
    options: Array<{ id: string; text: string; is_correct: boolean }>;
  };
  reverse_study_slides: unknown[];
};

/** Golden Imunização com aprovação vinculada — passa gate RC-004 default-on. */
export function buildCommercialApprovedConteudoJson() {
  const fp = fingerprintConteudoJson(GOLDEN_IMUNIZACAO);
  return stampEfficacyContentFingerprint(GOLDEN_IMUNIZACAO, fp);
}

export const COMMERCIAL_APPROVED_CONTEUDO_JSON = buildCommercialApprovedConteudoJson();

export const COMMERCIAL_APPROVED_CORRECT_OPTION_ID =
  COMMERCIAL_APPROVED_CONTEUDO_JSON.question_data.options.find((o) => o.is_correct)?.id ?? 'C';

export function commercialApprovedModuloEstudoRow() {
  const meta = COMMERCIAL_APPROVED_CONTEUDO_JSON.meta as { banca?: string };
  return {
    conteudo_json: COMMERCIAL_APPROVED_CONTEUDO_JSON,
    banca: meta.banca ?? 'CPCON UEPB',
    modulo_nome: COMMERCIAL_APPROVED_TITULO_AULA,
    titulo_aula: COMMERCIAL_APPROVED_TITULO_AULA,
  };
}
