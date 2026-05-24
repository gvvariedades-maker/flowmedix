import {
  WELCOME_SALUTATION_FALLBACK,
  resolveWelcomeSalutation,
} from '@/lib/email/welcomeSalutation';
import { applyFirstNamePlaceholders } from '@/lib/email/templateContent';

describe('resolveWelcomeSalutation', () => {
  it('usa técnico de enfermagem quando não há nome', () => {
    expect(resolveWelcomeSalutation()).toBe(WELCOME_SALUTATION_FALLBACK);
    expect(resolveWelcomeSalutation('')).toBe(WELCOME_SALUTATION_FALLBACK);
    expect(resolveWelcomeSalutation('   ')).toBe(WELCOME_SALUTATION_FALLBACK);
  });

  it('substitui legado estudante pelo cargo padrão', () => {
    expect(resolveWelcomeSalutation('estudante')).toBe(WELCOME_SALUTATION_FALLBACK);
    expect(resolveWelcomeSalutation('Estudante')).toBe(WELCOME_SALUTATION_FALLBACK);
  });

  it('mantém o primeiro nome quando informado', () => {
    expect(resolveWelcomeSalutation('Maria')).toBe('Maria');
  });
});

describe('applyFirstNamePlaceholders', () => {
  it('monta título com técnico de enfermagem sem nome', () => {
    expect(applyFirstNamePlaceholders('Olá, {{firstName}}!', '')).toBe(
      'Olá, técnico de enfermagem!',
    );
  });
});
