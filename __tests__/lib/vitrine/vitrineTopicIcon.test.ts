import { Activity, Siren, Stethoscope, Syringe } from 'lucide-react';
import { getTopicIcon } from '@/lib/vitrine/vitrineTopicIcon';

describe('getTopicIcon', () => {
  it('retorna Siren para urgências', () => {
    expect(getTopicIcon('Urgências e Emergências', null)).toBe(Siren);
  });

  it('retorna Activity para sinais vitais', () => {
    expect(getTopicIcon('Verificação de Sinais Vitais', null)).toBe(Activity);
  });

  it('retorna Syringe para imunização', () => {
    expect(getTopicIcon('Imunização', null)).toBe(Syringe);
  });

  it('retorna Stethoscope como fallback', () => {
    expect(getTopicIcon('Tópico genérico', null)).toBe(Stethoscope);
  });
});
