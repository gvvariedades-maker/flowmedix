import {
  PT_CLASSES_PALAVRAS,
  PT_COESAO_CONECTIVOS,
  PT_COLOCACAO_PRONOMINAL,
  PT_CONCORDANCIA,
  PT_CRASE_CONCURSOS,
  PT_DENOTACAO_CONOTACAO,
  PT_FORMACAO_PALAVRAS,
  PT_GUIDELINE_ALL_TABLES,
  PT_ORACOES_SUBORDINADAS,
  PT_PONTUACAO,
  PT_REGENCIA,
  PT_SINONIMOS_POLISSEMIA,
  PT_SUJEITO_PREDICADO,
  PT_TERMOS_ORACAO,
  PT_TIPOLOGIA,
  PT_VOCABULO_QUE_SE,
  PT_VERBOS,
  getLinguaPortuguesaGuidelineAll,
  getLinguaPortuguesaGuidelineP0,
  getLinguaPortuguesaGuidelineP1,
  getLinguaPortuguesaGuidelineP2,
  getLinguaPortuguesaGuidelineP3,
} from '@/lib/guidelines/linguaPortuguesa';
import { getGuidelineForSubtopico, GUIDELINE_TABLES } from '@/lib/guidelines';

const PT_TABLES_WITH_MIN_ENTRIES = [
  PT_CRASE_CONCURSOS,
  PT_COLOCACAO_PRONOMINAL,
  PT_PONTUACAO,
  PT_CONCORDANCIA,
  PT_REGENCIA,
  PT_TERMOS_ORACAO,
  PT_ORACOES_SUBORDINADAS,
  PT_TIPOLOGIA,
  PT_SUJEITO_PREDICADO,
  PT_CLASSES_PALAVRAS,
  PT_FORMACAO_PALAVRAS,
  PT_VERBOS,
  PT_COESAO_CONECTIVOS,
  PT_SINONIMOS_POLISSEMIA,
  PT_DENOTACAO_CONOTACAO,
  PT_VOCABULO_QUE_SE,
] as const;

describe('guidelines Língua Portuguesa P0', () => {
  it('crase tem ≥10 entries e está no índice', () => {
    expect(PT_CRASE_CONCURSOS.entries.length).toBeGreaterThanOrEqual(10);
    expect(GUIDELINE_TABLES[PT_CRASE_CONCURSOS.id]).toBe(PT_CRASE_CONCURSOS);
  });

  it('colocação tem ≥10 entries e está no índice', () => {
    expect(PT_COLOCACAO_PRONOMINAL.entries.length).toBeGreaterThanOrEqual(10);
    expect(GUIDELINE_TABLES[PT_COLOCACAO_PRONOMINAL.id]).toBe(PT_COLOCACAO_PRONOMINAL);
  });

  it('getLinguaPortuguesaGuidelineP0 mescla as duas tabelas', () => {
    const g = getLinguaPortuguesaGuidelineP0();
    expect(g?.entries.length).toBeGreaterThanOrEqual(20);
  });
});

describe('guidelines Língua Portuguesa P1 — Pontuação, Concordância, Regência', () => {
  it.each([
    ['pontuação', PT_PONTUACAO, 'pont-proibido-sujeito-verbo'],
    ['concordância', PT_CONCORDANCIA, 'conc-haver-impessoal'],
    ['regência', PT_REGENCIA, 'reg-assistir-duplo'],
  ] as const)('%s tem ≥10 entries e está no índice', (_label, table, sampleId) => {
    expect(table.entries.length).toBeGreaterThanOrEqual(10);
    expect(GUIDELINE_TABLES[table.id]).toBe(table);
    expect(table.entries.some((e) => e.id === sampleId)).toBe(true);
  });

  it('getGuidelineForSubtopico mapeia cards P1', () => {
    expect(getGuidelineForSubtopico('Pontuação')?.id).toBe(PT_PONTUACAO.id);
    expect(getGuidelineForSubtopico('Concordância verbal e nominal')?.id).toBe(PT_CONCORDANCIA.id);
    expect(getGuidelineForSubtopico('Regência verbal e nominal')?.id).toBe(PT_REGENCIA.id);
  });

  it('getLinguaPortuguesaGuidelineP1 mescla pontuação + concordância + regência', () => {
    const g = getLinguaPortuguesaGuidelineP1();
    expect(g?.entries.length).toBe(
      PT_PONTUACAO.entries.length + PT_CONCORDANCIA.entries.length + PT_REGENCIA.entries.length,
    );
  });
});

describe('guidelines Língua Portuguesa P2 — sintaxe e texto', () => {
  it.each([
    PT_TERMOS_ORACAO,
    PT_ORACOES_SUBORDINADAS,
    PT_TIPOLOGIA,
    PT_SUJEITO_PREDICADO,
  ] as const)('tabela %s tem ≥10 entries', (table) => {
    expect(table.entries.length).toBeGreaterThanOrEqual(10);
    expect(GUIDELINE_TABLES[table.id]).toBe(table);
  });

  it('getGuidelineForSubtopico mapeia cards P2', () => {
    expect(getGuidelineForSubtopico('Termos da oração')?.id).toBe(PT_TERMOS_ORACAO.id);
    expect(getGuidelineForSubtopico('Orações coordenadas e subordinadas')?.id).toBe(
      PT_ORACOES_SUBORDINADAS.id,
    );
    expect(getGuidelineForSubtopico('Tipologia e gêneros textuais')?.id).toBe(PT_TIPOLOGIA.id);
    expect(getGuidelineForSubtopico('Sujeito e predicado')?.id).toBe(PT_SUJEITO_PREDICADO.id);
    expect(getGuidelineForSubtopico('Frase, oração e período')?.id).toBe(PT_SUJEITO_PREDICADO.id);
  });

  it('getLinguaPortuguesaGuidelineP2 mescla quatro tabelas', () => {
    const g = getLinguaPortuguesaGuidelineP2();
    expect(g?.entries.length).toBe(
      PT_TERMOS_ORACAO.entries.length +
        PT_ORACOES_SUBORDINADAS.entries.length +
        PT_TIPOLOGIA.entries.length +
        PT_SUJEITO_PREDICADO.entries.length,
    );
  });
});

describe('guidelines Língua Portuguesa P3 — morfologia e vocabulário', () => {
  it.each([
    PT_CLASSES_PALAVRAS,
    PT_FORMACAO_PALAVRAS,
    PT_VERBOS,
    PT_COESAO_CONECTIVOS,
    PT_SINONIMOS_POLISSEMIA,
    PT_DENOTACAO_CONOTACAO,
    PT_VOCABULO_QUE_SE,
  ] as const)('tabela %s tem ≥10 entries', (table) => {
    expect(table.entries.length).toBeGreaterThanOrEqual(10);
    expect(GUIDELINE_TABLES[table.id]).toBe(table);
  });

  it('getGuidelineForSubtopico mapeia cards P3', () => {
    expect(getGuidelineForSubtopico('Classes de palavras')?.entries.length).toBeGreaterThanOrEqual(20);
    expect(getGuidelineForSubtopico('Verbos — tempos, modos e vozes')?.id).toBe(PT_VERBOS.id);
    expect(getGuidelineForSubtopico('Coesão, coerência e conectivos')?.id).toBe(PT_COESAO_CONECTIVOS.id);
    expect(getGuidelineForSubtopico('Sinônimos, antônimos e polissemia')?.id).toBe(
      PT_SINONIMOS_POLISSEMIA.id,
    );
    expect(getGuidelineForSubtopico('Denotação, conotação e figuras de linguagem')?.id).toBe(
      PT_DENOTACAO_CONOTACAO.id,
    );
    expect(getGuidelineForSubtopico('Vocábulo "que" e partícula "se"')?.id).toBe(PT_VOCABULO_QUE_SE.id);
  });

  it('getLinguaPortuguesaGuidelineP3 mescla sete tabelas', () => {
    const g = getLinguaPortuguesaGuidelineP3();
    const expected =
      PT_CLASSES_PALAVRAS.entries.length +
      PT_FORMACAO_PALAVRAS.entries.length +
      PT_VERBOS.entries.length +
      PT_COESAO_CONECTIVOS.entries.length +
      PT_SINONIMOS_POLISSEMIA.entries.length +
      PT_DENOTACAO_CONOTACAO.entries.length +
      PT_VOCABULO_QUE_SE.entries.length;
    expect(g?.entries.length).toBe(expected);
  });
});

describe('guidelines Língua Portuguesa — pacote completo', () => {
  it('todas as 16 tabelas PT estão no índice global', () => {
    for (const table of PT_TABLES_WITH_MIN_ENTRIES) {
      expect(GUIDELINE_TABLES[table.id]).toBe(table);
    }
    expect(PT_GUIDELINE_ALL_TABLES).toHaveLength(16);
  });

  it('getGuidelineForSubtopico mescla todas as tabelas em Língua Portuguesa', () => {
    const merged = getGuidelineForSubtopico('Língua Portuguesa');
    const expectedTotal = PT_GUIDELINE_ALL_TABLES.reduce((sum, t) => sum + t.entries.length, 0);
    expect(merged).not.toBeNull();
    expect(merged!.entries.length).toBe(expectedTotal);
  });

  it('getLinguaPortuguesaGuidelineAll equivale ao merge completo', () => {
    const all = getLinguaPortuguesaGuidelineAll();
    const expectedTotal = PT_GUIDELINE_ALL_TABLES.reduce((sum, t) => sum + t.entries.length, 0);
    expect(all?.entries.length).toBe(expectedTotal);
  });
});
