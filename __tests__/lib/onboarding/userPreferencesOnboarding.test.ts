import { UserPreferencesOnboardingSchema } from '@/lib/validations';

describe('UserPreferencesOnboardingSchema', () => {
  it('aceita payload válido com carga horária', () => {
    const parsed = UserPreferencesOnboardingSchema.safeParse({
      topicos_afinidade: ['Fundamentos e Bases'],
      topicos_dificuldade: ['Farmacologia e Medicamentos'],
      bancas_foco: ['EBSERH', 'CPCON'],
      carga_horaria_semanal: 10,
    });
    expect(parsed.success).toBe(true);
  });

  it('aceita payload sem carga horária', () => {
    const parsed = UserPreferencesOnboardingSchema.safeParse({
      topicos_afinidade: ['Procedimentos de Enfermagem'],
      topicos_dificuldade: ['Doenças Transmissíveis'],
      bancas_foco: ['IDECAN'],
    });
    expect(parsed.success).toBe(true);
  });

  it('rejeita matéria fora do catálogo', () => {
    const parsed = UserPreferencesOnboardingSchema.safeParse({
      topicos_afinidade: ['Matéria Inventada'],
      topicos_dificuldade: ['Farmacologia e Medicamentos'],
      bancas_foco: ['EBSERH'],
    });
    expect(parsed.success).toBe(false);
  });

  it('rejeita arrays vazios', () => {
    const parsed = UserPreferencesOnboardingSchema.safeParse({
      topicos_afinidade: [],
      topicos_dificuldade: ['Farmacologia e Medicamentos'],
      bancas_foco: ['EBSERH'],
    });
    expect(parsed.success).toBe(false);
  });
});
