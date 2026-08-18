import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

export type CatalogFixtureRoots = {
  repoRoot: string;
  catalogRoot: string;
  cleanup: () => void;
};

type QuestionOverrides = {
  instruction?: string;
  subtopico?: string;
  family?: string;
  pedagogical_branch?: string;
  options?: { id: string; text: string; is_correct: boolean }[];
};

export function makeFourSlideQuestion(overrides: QuestionOverrides = {}): Record<string, unknown> {
  const subtopico = overrides.subtopico ?? 'Imunização';
  const instruction = overrides.instruction ?? 'Enunciado fixture padrão.';
  const options = overrides.options ?? [
    { id: 'A', text: 'Certo', is_correct: true },
    { id: 'B', text: 'Errado', is_correct: false },
  ];

  return {
    meta: {
      banca: 'FIXTURE',
      topico: 'Enfermagem',
      subtopico,
      family: overrides.family ?? 'certo_errado',
      pedagogical_branch: overrides.pedagogical_branch,
      content_standard: 'golden-v1',
    },
    question_data: { instruction, options },
    reverse_study_slides: [
      {
        type: 'concept_map',
        meta: { topico: 'Enfermagem', subtopico },
        items: [{ label: 'Tema', detail: 'Enquadramento', icon: 'Target' }],
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        steps: ['Passo 1', 'Passo 2'],
      },
      {
        type: 'golden_rule',
        content: 'Regra fixture',
        rows: [{ label: 'Critério', value: 'Valor' }],
      },
      {
        type: 'danger_zone',
        content: 'Pegadinhas',
        items: [{ label: 'A', detail: 'd', correct: 'c' }],
      },
    ],
  };
}

function writeJson(path: string, data: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
}

function writeBomJson(path: string, data: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `\uFEFF${JSON.stringify(data, null, 2)}`, 'utf8');
}

function questionPath(catalogRoot: string, lote: string, slug: string): string {
  return join(catalogRoot, lote, 'questions', `${slug}.json`);
}

/** Catálogo mínimo em disco temporário — cenários G0.2 para test-unit hermético. */
export function materializeCatalogFixture(): CatalogFixtureRoots {
  const repoRoot = mkdtempSync(join(tmpdir(), 'avant-neurocanvas-fixture-'));
  const catalogRoot = join(repoRoot, 'data', 'catalog-migration');
  const cleanup = () => {
    try {
      rmSync(repoRoot, { recursive: true, force: true });
    } catch {
      // ignore
    }
  };

  writeJson(join(catalogRoot, 'handcraft-registry.json'), {
    pacotes: {
      fixture: { manifest: 'data/catalog-migration/fixture-completo/manifest.json' },
      'fixture-conflict-a': { manifest: 'data/catalog-migration/fixture-conflict-a/manifest.json' },
      'fixture-conflict-b': { manifest: 'data/catalog-migration/fixture-conflict-b/manifest.json' },
    },
  });

  writeJson(join(catalogRoot, 'fixture-completo', 'manifest.json'), {
    slugs: ['q-singleton', 'q-byte-dup', 'q-divergent-resolved', 'q-precedence', 'q-resolver-vf', 'q-bom'],
  });
  writeJson(join(catalogRoot, 'fixture-byte-b', 'manifest.json'), { slugs: ['q-byte-dup'] });
  writeJson(join(catalogRoot, 'fixture-semantic-b', 'manifest.json'), { slugs: ['q-semantic-dup'] });
  writeJson(join(catalogRoot, 'fixture-divergent-resolved-b', 'manifest.json'), {
    parent: 'data/catalog-migration/fixture-completo/manifest.json',
    slugs: ['q-divergent-resolved'],
  });
  writeJson(join(catalogRoot, 'fixture-g01', 'manifest.json'), {
    parent: 'data/catalog-migration/fixture-completo/manifest.json',
    slugs: ['q-precedence'],
  });
  writeJson(join(catalogRoot, 'fixture-conflict-a', 'manifest.json'), { slugs: ['q-manifest-conflict'] });
  writeJson(join(catalogRoot, 'fixture-conflict-b', 'manifest.json'), { slugs: ['q-manifest-conflict'] });

  const singleton = makeFourSlideQuestion({ instruction: 'Singleton fixture.' });
  writeJson(questionPath(catalogRoot, 'fixture-completo', 'q-singleton'), singleton);

  const bytePayload = makeFourSlideQuestion({ instruction: 'Byte dup fixture.' });
  writeJson(questionPath(catalogRoot, 'fixture-completo', 'q-byte-dup'), bytePayload);
  writeJson(questionPath(catalogRoot, 'fixture-byte-b', 'q-byte-dup'), bytePayload);

  const semanticBase = makeFourSlideQuestion({ instruction: 'Semantic dup fixture.' });
  writeJson(questionPath(catalogRoot, 'fixture-completo', 'q-semantic-dup'), semanticBase);
  writeBomJson(questionPath(catalogRoot, 'fixture-semantic-b', 'q-semantic-dup'), semanticBase);

  writeJson(
    questionPath(catalogRoot, 'fixture-completo', 'q-divergent-resolved'),
    makeFourSlideQuestion({ instruction: 'Divergente resolvido — completo.' }),
  );
  writeJson(
    questionPath(catalogRoot, 'fixture-divergent-resolved-b', 'q-divergent-resolved'),
    makeFourSlideQuestion({ instruction: 'Divergente resolvido — cópia g01 divergente.' }),
  );

  writeJson(
    questionPath(catalogRoot, 'fixture-completo', 'q-divergent-unresolved'),
    makeFourSlideQuestion({ instruction: 'Unresolved A.' }),
  );
  writeJson(
    questionPath(catalogRoot, 'fixture-divergent-orphan', 'q-divergent-unresolved'),
    makeFourSlideQuestion({ instruction: 'Unresolved B.' }),
  );

  writeJson(
    questionPath(catalogRoot, 'fixture-completo', 'q-precedence'),
    makeFourSlideQuestion({ instruction: 'Precedência documentada.' }),
  );
  writeJson(
    questionPath(catalogRoot, 'fixture-g01', 'q-precedence'),
    makeFourSlideQuestion({ instruction: 'Precedência documentada.' }),
  );

  writeJson(
    questionPath(catalogRoot, 'fixture-conflict-a', 'q-manifest-conflict'),
    makeFourSlideQuestion({ instruction: 'Conflito manifest A.' }),
  );
  writeJson(
    questionPath(catalogRoot, 'fixture-conflict-b', 'q-manifest-conflict'),
    makeFourSlideQuestion({ instruction: 'Conflito manifest B.' }),
  );

  writeBomJson(
    questionPath(catalogRoot, 'fixture-completo', 'q-bom'),
    makeFourSlideQuestion({ instruction: 'Questão com BOM UTF-8.' }),
  );

  writeJson(
    questionPath(catalogRoot, 'fixture-completo', 'q-resolver-vf'),
    makeFourSlideQuestion({
      instruction: 'I - Afirmativa.\nÉ CORRETO o que se afirma em:',
      family: 'vf',
      subtopico: 'Imunização',
      pedagogical_branch: 'imunizacao_vf_intervalos',
      options: [
        { id: 'A', text: 'I apenas.', is_correct: true },
        { id: 'B', text: 'II apenas.', is_correct: false },
      ],
    }),
  );

  return { repoRoot, catalogRoot, cleanup };
}
