import {
  resolveOnboardingAreaFromTitulo,
  tituloMatchesOnboardingAreas,
} from '@/lib/onboarding/topicAreas';
import { clampDiagnosticoQuantidade, isDiagnosticoSessionFiltros } from '@/lib/simulado/diagnosticoConstants';

describe('onboarding topicAreas', () => {
  it('resolve área macro a partir de titulo_aula canônico', () => {
    expect(resolveOnboardingAreaFromTitulo('Imunização')).toBe(
      'Saúde Pública e Epidemiologia',
    );
    expect(resolveOnboardingAreaFromTitulo('Urgências e Emergências')).toBe(
      'Especialidades Cirúrgicas e Críticas',
    );
  });

  it('tituloMatchesOnboardingAreas compara áreas declaradas', () => {
    expect(
      tituloMatchesOnboardingAreas('Curativos e Manejo de Feridas', [
        'Procedimentos de Enfermagem',
      ]),
    ).toBe(true);
    expect(
      tituloMatchesOnboardingAreas('Imunização', ['Procedimentos de Enfermagem']),
    ).toBe(false);
  });
});

describe('diagnosticoConstants', () => {
  it('clampDiagnosticoQuantidade respeita faixa 8–12', () => {
    expect(clampDiagnosticoQuantidade(5)).toBe(8);
    expect(clampDiagnosticoQuantidade(10)).toBe(10);
    expect(clampDiagnosticoQuantidade(25)).toBe(12);
  });

  it('isDiagnosticoSessionFiltros identifica tipo diagnostico_inicial', () => {
    expect(isDiagnosticoSessionFiltros({ tipo: 'diagnostico_inicial' })).toBe(true);
    expect(isDiagnosticoSessionFiltros({ modo: 'treino' })).toBe(false);
  });
});
