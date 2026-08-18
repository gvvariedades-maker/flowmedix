import { resolveCadernoSetupMode } from '@/lib/cadernos/setupMode';

describe('lib/cadernos/setupMode', () => {
  it('mapeia ?setup=done para modo done', () => {
    expect(resolveCadernoSetupMode('done')).toBe('done');
  });

  it('mapeia ?setup=1 para modo setup', () => {
    expect(resolveCadernoSetupMode('1')).toBe('setup');
  });

  it('trata parâmetro desconhecido como none', () => {
    expect(resolveCadernoSetupMode('x')).toBe('none');
    expect(resolveCadernoSetupMode('')).toBe('none');
    expect(resolveCadernoSetupMode(undefined)).toBe('none');
  });
});
