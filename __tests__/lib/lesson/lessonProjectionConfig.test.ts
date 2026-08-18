import {
  LESSON_PROJECTION_PILOT_SUBTOPICOS,
  isLessonProjectionEnabled,
  isLessonProjectionEnabledForSubtopico,
  isLessonProjectionPilotSubtopico,
} from '@/lib/lesson/lessonProjectionConfig';

describe('isLessonProjectionEnabled', () => {
  it('off quando a env está ausente', () => {
    expect(isLessonProjectionEnabled(undefined)).toBe(false);
  });

  it('off em qualquer valor diferente de 1', () => {
    expect(isLessonProjectionEnabled('0')).toBe(false);
    expect(isLessonProjectionEnabled('true')).toBe(false);
  });

  it('on em 1', () => {
    expect(isLessonProjectionEnabled('1')).toBe(true);
  });
});

describe('isLessonProjectionPilotSubtopico', () => {
  it('reconhece o piloto ignorando acento e caixa', () => {
    expect(isLessonProjectionPilotSubtopico('Farmacodinâmica e Farmacocinética')).toBe(true);
    expect(isLessonProjectionPilotSubtopico('farmacodinamica e farmacocinetica')).toBe(true);
  });

  it('recusa subtópico fora do piloto', () => {
    expect(isLessonProjectionPilotSubtopico('Imunização')).toBe(false);
    expect(isLessonProjectionPilotSubtopico(undefined)).toBe(false);
  });

  it('piloto começa só com Farmacodinâmica', () => {
    expect(LESSON_PROJECTION_PILOT_SUBTOPICOS).toEqual(['Farmacodinâmica e Farmacocinética']);
  });
});

describe('isLessonProjectionEnabledForSubtopico', () => {
  it('exige flag ligada e subtópico no piloto', () => {
    expect(isLessonProjectionEnabledForSubtopico('Farmacodinâmica e Farmacocinética', '1')).toBe(true);
    expect(isLessonProjectionEnabledForSubtopico('Farmacodinâmica e Farmacocinética', undefined)).toBe(false);
    expect(isLessonProjectionEnabledForSubtopico('Imunização', '1')).toBe(false);
  });
});
