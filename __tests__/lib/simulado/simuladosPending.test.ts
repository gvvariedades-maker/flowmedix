/**
 * @jest-environment jsdom
 */
import {
  isSimuladosHubHref,
  resolveSimuladosNavAnchor,
  shouldClearSimuladosNavPendingOnPath,
  shouldMarkSimuladosNavPending,
  type SimuladosNavClickLike,
} from '@/lib/simulado/simuladosPendingMark';

const origin = 'http://localhost:3000';

function clickEvent(overrides: Partial<SimuladosNavClickLike> = {}): SimuladosNavClickLike {
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

describe('isSimuladosHubHref', () => {
  it('aceita só a lista /simulados, com ou sem query', () => {
    expect(isSimuladosHubHref('/simulados')).toBe(true);
    expect(isSimuladosHubHref('/simulados?wizard=1')).toBe(true);
    expect(isSimuladosHubHref('/simulados/novo')).toBe(false);
    expect(isSimuladosHubHref('/desempenho/simulados')).toBe(false);
    expect(isSimuladosHubHref('/cadernos')).toBe(false);
  });
});

describe('shouldMarkSimuladosNavPending', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  const fromEstudar = { pathname: '/estudar', origin };

  it('marca clique principal na lista a partir da vitrine', () => {
    const a = makeAnchor({ href: '/simulados' });
    expect(shouldMarkSimuladosNavPending(clickEvent(), a, fromEstudar)).toBe(true);
  });

  it('ignora analytics /desempenho/simulados, Ctrl/Meta/Shift/Alt e a rota atual', () => {
    const hub = makeAnchor({ href: '/simulados' });
    const analytics = makeAnchor({ href: '/desempenho/simulados' });
    expect(shouldMarkSimuladosNavPending(clickEvent(), analytics, fromEstudar)).toBe(false);
    expect(shouldMarkSimuladosNavPending(clickEvent({ altKey: true }), hub, fromEstudar)).toBe(
      false,
    );
    expect(
      shouldMarkSimuladosNavPending(clickEvent(), hub, { pathname: '/simulados', origin }),
    ).toBe(false);
  });

  it('resolve âncora a partir do alvo interno', () => {
    const a = makeAnchor({ href: '/simulados' });
    const span = document.createElement('span');
    a.appendChild(span);
    expect(resolveSimuladosNavAnchor(span)).toBe(a);
  });
});

describe('shouldClearSimuladosNavPendingOnPath', () => {
  it('mantém pending em estudar e simulados; limpa no restante', () => {
    expect(shouldClearSimuladosNavPendingOnPath('/estudar')).toBe(false);
    expect(shouldClearSimuladosNavPendingOnPath('/simulados')).toBe(false);
    expect(shouldClearSimuladosNavPendingOnPath('/simulados/novo')).toBe(false);
    expect(shouldClearSimuladosNavPendingOnPath('/desempenho')).toBe(true);
    expect(shouldClearSimuladosNavPendingOnPath('/desempenho/simulados')).toBe(true);
    expect(shouldClearSimuladosNavPendingOnPath('/cadernos')).toBe(true);
  });
});
