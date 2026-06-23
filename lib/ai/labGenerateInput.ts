/** Extrai e valida payload mínimo para geração de slides no Laboratório. */

export type LabGenerateQuestaoInput = {
  meta: {
    banca: string;
    topico: string;
    subtopico?: string;
    ano?: string;
    orgao?: string;
    prova?: string;
    cargo_header?: string;
    header_line?: string;
    [key: string]: unknown;
  };
  question_data: {
    instruction: string;
    text_fragment?: string;
    options: { id: string; text: string; is_correct: boolean }[];
  };
  [key: string]: unknown;
};

export type ExtractLabGenerateResult =
  | { ok: true; questao: LabGenerateQuestaoInput }
  | { ok: false; error: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function extractLabGenerateInput(questaoRaw: unknown): ExtractLabGenerateResult {
  const root = asRecord(questaoRaw);
  if (!root) {
    return { ok: false, error: 'JSON deve ser um objeto de questão' };
  }

  const meta = asRecord(root.meta);
  const qd = asRecord(root.question_data);
  if (!qd) {
    return { ok: false, error: 'Falta question_data no JSON' };
  }

  const instruction = typeof qd.instruction === 'string' ? qd.instruction.trim() : '';
  if (instruction.length < 10) {
    return { ok: false, error: 'question_data.instruction muito curto (mín. 10 caracteres)' };
  }

  const optionsRaw = qd.options;
  if (!Array.isArray(optionsRaw) || optionsRaw.length < 2) {
    return { ok: false, error: 'question_data.options precisa de pelo menos 2 alternativas' };
  }

  const options: { id: string; text: string; is_correct: boolean }[] = [];
  for (let i = 0; i < optionsRaw.length; i++) {
    const opt = asRecord(optionsRaw[i]);
    if (!opt) {
      return { ok: false, error: `Alternativa ${i + 1} inválida` };
    }
    const id = typeof opt.id === 'string' ? opt.id.trim() : '';
    const text = typeof opt.text === 'string' ? opt.text.trim() : '';
    if (!id || !text) {
      return { ok: false, error: `Alternativa ${id || i + 1} sem id ou text` };
    }
    options.push({
      id,
      text,
      is_correct: Boolean(opt.is_correct),
    });
  }

  if (!options.some((o) => o.is_correct)) {
    return { ok: false, error: 'Nenhuma alternativa marcada como is_correct: true' };
  }

  const banca =
    (typeof meta?.banca === 'string' && meta.banca.trim()) ||
    (typeof meta?.prova === 'string' && meta.prova.trim()) ||
    'Banca';
  const topico =
    (typeof meta?.topico === 'string' && meta.topico.trim()) || 'Enfermagem';

  const questao: LabGenerateQuestaoInput = {
    ...root,
    meta: {
      ...(meta ?? {}),
      banca,
      topico,
      subtopico:
        typeof meta?.subtopico === 'string' && meta.subtopico.trim()
          ? meta.subtopico.trim()
          : undefined,
      ano: typeof meta?.ano === 'string' ? meta.ano : undefined,
      orgao: typeof meta?.orgao === 'string' ? meta.orgao : undefined,
      prova: typeof meta?.prova === 'string' ? meta.prova : undefined,
      cargo_header: typeof meta?.cargo_header === 'string' ? meta.cargo_header : undefined,
      header_line: typeof meta?.header_line === 'string' ? meta.header_line : undefined,
    },
    question_data: {
      instruction,
      text_fragment: typeof qd.text_fragment === 'string' ? qd.text_fragment : undefined,
      options,
    },
  };

  return { ok: true, questao };
}
