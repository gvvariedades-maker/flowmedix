/**
 * Testes herméticos do aplicador G0.4 (scripts/neurocanvas-g04-apply-editorial.ts).
 * Nenhum teste toca o catálogo real: tudo em diretório temporário.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import {
  applyPayloads,
  AUTHORIZED_RELATIVE_PATHS,
  G04_EDITORIAL_PAYLOADS,
  planApply,
  relativeTargetPath,
  semanticHashOf,
  serializePayload,
  validatePayloads,
  type G04EditorialPayload,
} from '@/scripts/neurocanvas-g04-apply-editorial';

const REAL_CATALOG = resolve(process.cwd(), 'data/catalog-migration');

let tempRoots: string[] = [];

function makeTempCatalog(): string {
  const root = mkdtempSync(join(tmpdir(), 'g04-test-'));
  tempRoots.push(root);
  return root;
}

function writeQuestion(root: string, lote: string, slug: string, question: unknown): void {
  const dir = join(root, lote, 'questions');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${slug}.json`), `${JSON.stringify(question, null, 2)}\n`, 'utf8');
}

/** Payload sintético válido, com prior hash derivado de um conteúdo controlado pelo teste. */
function syntheticPayload(overrides?: {
  priorQuestion?: Record<string, unknown>;
  lote?: string;
  slug?: string;
}): { payload: G04EditorialPayload; priorQuestion: Record<string, unknown> } {
  const lote = overrides?.lote ?? 'lote-sintetico';
  const slug = overrides?.slug ?? 'banca-sintetica-questao-1';

  const question: Record<string, unknown> = {
    meta: {
      banca: 'BANCA TESTE',
      topico: 'Procedimentos de Enfermagem',
      subtopico: 'Verificação de Sinais Vitais',
      ano: '2026',
    },
    question_data: {
      instruction: 'Qual é a faixa de normotermia no adulto?',
      options: [
        { id: 'A', text: '30 a 32 °C', is_correct: false },
        { id: 'B', text: '36 a 37,4 °C', is_correct: true },
      ],
    },
    reverse_study_slides: [
      { type: 'concept_map', items: [{ label: 'Normotermia', detail: '36 a 37,4 °C' }] },
      { type: 'logic_flow', steps: ['Ler a faixa', 'Comparar', 'Marcar B'], reveal_mode: 'tap' },
      { type: 'golden_rule', content: 'Normotermia: 36 a 37,4 °C.' },
      {
        type: 'danger_zone',
        content: 'Pegadinhas de faixa térmica.',
        items: [{ label: 'A', detail: 'Hipotermia grave', correct: 'A faixa não é 30 a 32 °C.' }],
      },
    ],
  };

  const priorQuestion =
    overrides?.priorQuestion ??
    ({
      ...question,
      question_data: {
        ...(question.question_data as Record<string, unknown>),
        instruction: 'Enunciado anterior, versão a ser substituída.',
      },
    } as Record<string, unknown>);

  const payload: G04EditorialPayload = {
    case_id: 'nc-test-0001',
    slug,
    decision: 'create_corrected_candidate',
    authority_manifest: 'data/catalog-migration/lote-sintetico/manifest.json',
    targets: [{ lote, prior_semantic_sha256: semanticHashOf(priorQuestion) }],
    expected_semantic_sha256: semanticHashOf(question),
    expected_byte_sha256: require('node:crypto')
      .createHash('sha256')
      .update(serializePayload(question), 'utf8')
      .digest('hex'),
    question,
  };

  return { payload, priorQuestion };
}

afterEach(() => {
  for (const root of tempRoots) rmSync(root, { recursive: true, force: true });
  tempRoots = [];
});

describe('aplicador G0.4 — payloads versionados', () => {
  it('tem 6 payloads e 17 paths autorizados coerentes entre si', () => {
    expect(G04_EDITORIAL_PAYLOADS).toHaveLength(6);
    expect(AUTHORIZED_RELATIVE_PATHS).toHaveLength(17);

    const derived = G04_EDITORIAL_PAYLOADS.flatMap((p) =>
      p.targets.map((t) => relativeTargetPath(t.lote, p.slug)),
    ).sort();
    expect(derived).toEqual([...AUTHORIZED_RELATIVE_PATHS].sort());
  });

  it('passa por QuestaoCompletaSchema e pelos 4 slides canônicos', () => {
    expect(validatePayloads()).toEqual([]);
  });

  it('catálogo temporário vazio recebe as 17 cópias com os hashes esperados', () => {
    const root = makeTempCatalog();
    const result = applyPayloads({ catalogRoot: root });

    expect(result.written).toHaveLength(17);
    expect(result.skipped).toHaveLength(0);

    for (const payload of G04_EDITORIAL_PAYLOADS) {
      for (const target of payload.targets) {
        const path = join(root, target.lote, 'questions', `${payload.slug}.json`);
        expect(existsSync(path)).toBe(true);
        const raw = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
        expect(semanticHashOf(raw)).toBe(payload.expected_semantic_sha256);
      }
    }
  });

  it('é idempotente: a segunda aplicação não reescreve nada', () => {
    const root = makeTempCatalog();
    applyPayloads({ catalogRoot: root });
    const second = applyPayloads({ catalogRoot: root });

    expect(second.written).toHaveLength(0);
    expect(second.skipped).toHaveLength(17);
    expect(second.plan.every((e) => e.action === 'skip_already_current')).toBe(true);
  });
});

describe('aplicador G0.4 — salvaguardas de escrita', () => {
  it('permite escrita quando a cópia está no hash anterior aprovado', () => {
    const root = makeTempCatalog();
    const { payload, priorQuestion } = syntheticPayload();
    const target = payload.targets[0]!;
    writeQuestion(root, target.lote, payload.slug, priorQuestion);

    const plan = planApply({
      catalogRoot: root,
      payloads: [payload],
      authorizedPaths: [relativeTargetPath(target.lote, payload.slug)],
    });
    expect(plan[0]!.action).toBe('write');

    const result = applyPayloads({
      catalogRoot: root,
      payloads: [payload],
      authorizedPaths: [relativeTargetPath(target.lote, payload.slug)],
    });
    expect(result.written).toHaveLength(1);

    const written = JSON.parse(
      readFileSync(join(root, target.lote, 'questions', `${payload.slug}.json`), 'utf8'),
    ) as Record<string, unknown>;
    expect(semanticHashOf(written)).toBe(payload.expected_semantic_sha256);
  });

  it('aborta sem escrever nada quando encontra um terceiro hash inesperado', () => {
    const root = makeTempCatalog();
    const { payload } = syntheticPayload();
    const target = payload.targets[0]!;

    const intruso = {
      ...(payload.question as Record<string, unknown>),
      meta: { banca: 'OUTRA BANCA', topico: 'Outro', subtopico: 'Outro' },
    };
    writeQuestion(root, target.lote, payload.slug, intruso);
    const path = join(root, target.lote, 'questions', `${payload.slug}.json`);
    const antes = readFileSync(path, 'utf8');

    const authorizedPaths = [relativeTargetPath(target.lote, payload.slug)];
    expect(() => planApply({ catalogRoot: root, payloads: [payload], authorizedPaths })).toThrow(
      /hash inesperado/,
    );
    expect(() => applyPayloads({ catalogRoot: root, payloads: [payload], authorizedPaths })).toThrow(
      /hash inesperado/,
    );

    expect(readFileSync(path, 'utf8')).toBe(antes);
  });

  it('não escreve nenhuma cópia se qualquer uma delas estiver divergente', () => {
    const root = makeTempCatalog();
    const { payload } = syntheticPayload();
    const segundoLote = 'lote-sintetico-2';
    const multi: G04EditorialPayload = {
      ...payload,
      targets: [
        payload.targets[0]!,
        { lote: segundoLote, prior_semantic_sha256: payload.targets[0]!.prior_semantic_sha256 },
      ],
    };
    const authorizedPaths = [
      relativeTargetPath(payload.targets[0]!.lote, payload.slug),
      relativeTargetPath(segundoLote, payload.slug),
    ];

    writeQuestion(root, segundoLote, payload.slug, {
      ...(payload.question as Record<string, unknown>),
      meta: { banca: 'INTRUSA', topico: 'X', subtopico: 'Y' },
    });

    expect(() => applyPayloads({ catalogRoot: root, payloads: [multi], authorizedPaths })).toThrow(
      /hash inesperado/,
    );

    const primeiro = join(root, payload.targets[0]!.lote, 'questions', `${payload.slug}.json`);
    expect(existsSync(primeiro)).toBe(false);
  });

  it('rejeita path fora da allowlist', () => {
    const root = makeTempCatalog();
    const { payload } = syntheticPayload({ lote: 'lote-nao-autorizado' });

    expect(() =>
      planApply({ catalogRoot: root, payloads: [payload], authorizedPaths: ['outro/questions/x.json'] }),
    ).toThrow(/não autorizado/);
  });

  it('rejeita path que escapa da raiz do catálogo', () => {
    const root = makeTempCatalog();
    const { payload } = syntheticPayload({ lote: '../fora-do-catalogo' });
    const escaped = relativeTargetPath('../fora-do-catalogo', payload.slug);

    expect(() =>
      planApply({ catalogRoot: root, payloads: [payload], authorizedPaths: [escaped] }),
    ).toThrow(/fora da raiz do catálogo/);
  });

  it('rejeita payload inválido pelo schema antes de qualquer escrita', () => {
    const root = makeTempCatalog();
    const { payload } = syntheticPayload();
    const invalido: G04EditorialPayload = {
      ...payload,
      question: { meta: { banca: 'X' } } as Record<string, unknown>,
    };

    expect(() =>
      applyPayloads({
        catalogRoot: root,
        payloads: [invalido],
        authorizedPaths: [relativeTargetPath(payload.targets[0]!.lote, payload.slug)],
      }),
    ).toThrow(/payload inválido, nada escrito/);

    expect(existsSync(join(root, payload.targets[0]!.lote))).toBe(false);
  });

  it('rejeita payload com número de slides diferente de quatro', () => {
    const { payload } = syntheticPayload();
    const slides = payload.question.reverse_study_slides as unknown[];
    const tresSlides: G04EditorialPayload = {
      ...payload,
      question: { ...payload.question, reverse_study_slides: slides.slice(0, 3) },
    };

    const errors = validatePayloads([tresSlides]);
    expect(errors.some((e) => /3 slides, esperado exatamente 4/.test(e))).toBe(true);
  });
});

describe('aplicador G0.4 — isolamento do catálogo real', () => {
  it('o plano contra catálogo temporário não referencia o catálogo real', () => {
    const root = makeTempCatalog();
    const plan = planApply({ catalogRoot: root });

    expect(plan).toHaveLength(17);
    for (const entry of plan) {
      expect(entry.absolute_path.startsWith(resolve(root))).toBe(true);
      expect(entry.absolute_path.startsWith(REAL_CATALOG)).toBe(false);
    }
  });

  it('aplicar em catálogo temporário não altera as cópias do catálogo real', () => {
    const antes = new Map<string, string>();
    for (const payload of G04_EDITORIAL_PAYLOADS) {
      for (const target of payload.targets) {
        const real = join(REAL_CATALOG, target.lote, 'questions', `${payload.slug}.json`);
        if (existsSync(real)) antes.set(real, readFileSync(real, 'utf8'));
      }
    }

    const root = makeTempCatalog();
    applyPayloads({ catalogRoot: root });

    for (const [path, conteudo] of antes) {
      expect(readFileSync(path, 'utf8')).toBe(conteudo);
    }
  });
});
