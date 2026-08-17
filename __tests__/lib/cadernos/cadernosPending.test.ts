/**
 * @jest-environment jsdom
 */
import {
  isCadernosHubHref,
  resolveCadernosNavAnchor,
  shouldClearCadernosNavPendingOnPath,
  shouldMarkCadernosNavPending,
  type CadernosNavClickLike,
} from '@/lib/cadernos/cadernosPendingMark';

const origin = 'http://localhost:3000';

function clickEvent(overrides: Partial<CadernosNavClickLike> = {}): CadernosNavClickLike {
  return {
    button: 0,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    defaultPrevented: false,
    ...overrides,
  };
}

function makeAnchor(attrs: { href: string; target?: string; download?: boolean | string }) {
  const a = document.createElement('a');
  a.setAttribute('href', attrs.href);
  if (attrs.target !== undefined) a.setAttribute('target', attrs.target);
  if (attrs.download === true) a.setAttribute('download', '');
  if (typeof attrs.download === 'string') a.setAttribute('download', attrs.download);
  document.body.appendChild(a);
  return a;
}

describe('isCadernosHubHref', () => {
  it('aceita só a lista /cadernos, com ou sem query', () => {
    expect(isCadernosHubHref('/cadernos')).toBe(true);
    expect(isCadernosHubHref('/cadernos?wizard=1')).toBe(true);
    expect(isCadernosHubHref('/cadernos/novo')).toBe(false);
    expect(isCadernosHubHref('/desempenho')).toBe(false);
  });
});

describe('shouldMarkCadernosNavPending', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  const fromEstudar = { pathname: '/estudar', origin };

  it('marca clique principal na lista a partir da vitrine', () => {
    const a = makeAnchor({ href: '/cadernos' });
    expect(shouldMarkCadernosNavPending(clickEvent(), a, fromEstudar)).toBe(true);
  });

  it('ignora Ctrl/Meta/Shift/Alt e a rota atual', () => {
    const a = makeAnchor({ href: '/cadernos' });
    expect(shouldMarkCadernosNavPending(clickEvent({ altKey: true }), a, fromEstudar)).toBe(false);
    expect(shouldMarkCadernosNavPending(clickEvent(), a, { pathname: '/cadernos', origin })).toBe(
      false,
    );
  });

  it('resolve âncora a partir do alvo interno', () => {
    const a = makeAnchor({ href: '/cadernos' });
    const span = document.createElement('span');
    a.appendChild(span);
    expect(resolveCadernosNavAnchor(span)).toBe(a);
  });
});

describe('shouldClearCadernosNavPendingOnPath', () => {
  it('mantém pending em estudar e cadernos; limpa no restante', () => {
    expect(shouldClearCadernosNavPendingOnPath('/estudar')).toBe(false);
    expect(shouldClearCadernosNavPendingOnPath('/cadernos')).toBe(false);
    expect(shouldClearCadernosNavPendingOnPath('/cadernos/novo')).toBe(false);
    expect(shouldClearCadernosNavPendingOnPath('/desempenho')).toBe(true);
    expect(shouldClearCadernosNavPendingOnPath('/simulados')).toBe(true);
  });
});
