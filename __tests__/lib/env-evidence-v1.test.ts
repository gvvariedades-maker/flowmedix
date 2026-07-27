import {
  parseEvidenceV1InstrumentationFlag,
  parseEvidenceV1InternalEmails,
} from '@/lib/env';

describe('EE_V1_INSTRUMENTATION (Lote 3)', () => {
  it('default false quando ausente', () => {
    expect(parseEvidenceV1InstrumentationFlag(undefined)).toBe(false);
    expect(parseEvidenceV1InstrumentationFlag(null)).toBe(false);
    expect(parseEvidenceV1InstrumentationFlag('')).toBe(false);
    expect(parseEvidenceV1InstrumentationFlag('   ')).toBe(false);
  });

  it('aceita true e 1', () => {
    expect(parseEvidenceV1InstrumentationFlag('true')).toBe(true);
    expect(parseEvidenceV1InstrumentationFlag('TRUE')).toBe(true);
    expect(parseEvidenceV1InstrumentationFlag('1')).toBe(true);
  });

  it('aceita false e 0 como off', () => {
    expect(parseEvidenceV1InstrumentationFlag('false')).toBe(false);
    expect(parseEvidenceV1InstrumentationFlag('0')).toBe(false);
  });

  it('valores desconhecidos não ligam a flag', () => {
    expect(parseEvidenceV1InstrumentationFlag('yes')).toBe(false);
    expect(parseEvidenceV1InstrumentationFlag('on')).toBe(false);
  });
});

describe('EE_V1_INTERNAL_EMAILS (Lote 3)', () => {
  it('lista vazia quando ausente', () => {
    expect(parseEvidenceV1InternalEmails(undefined)).toEqual([]);
    expect(parseEvidenceV1InternalEmails(null)).toEqual([]);
    expect(parseEvidenceV1InternalEmails('')).toEqual([]);
  });

  it('parseia vírgula, trim e lowercase sem duplicatas', () => {
    expect(
      parseEvidenceV1InternalEmails(' Alpha@Exemplo.com , beta@exemplo.com,ALPHA@exemplo.com '),
    ).toEqual(['alpha@exemplo.com', 'beta@exemplo.com']);
  });
});
