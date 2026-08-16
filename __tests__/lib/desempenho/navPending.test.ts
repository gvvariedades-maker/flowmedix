/**
 * @jest-environment jsdom
 */
import {
  isDesempenhoHubHref,
  resolveDesempenhoNavAnchor,
  shouldClearDesempenhoNavPendingOnPath,
  shouldMarkDesempenhoNavPending,
  type DesempenhoNavClickLike,
} from '@/lib/desempenho/desempenhoPendingMark';

const origin = 'http://localhost:3000';

function clickEvent(overrides: Partial<DesempenhoNavClickLike> = {}): DesempenhoNavClickLike {
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

describe('isDesempenhoHubHref', () => {
  it('aceita só o hub Estudo, com ou sem query', () => {
    expect(isDesempenhoHubHref('/desempenho')).toBe(true);
    expect(isDesempenhoHubHref('/desempenho?cidade=cg')).toBe(true);
    expect(isDesempenhoHubHref('/desempenho/mapa')).toBe(false);
    expect(isDesempenhoHubHref('/desempenho/simulados')).toBe(false);
    expect(isDesempenhoHubHref('/estudar')).toBe(false);
  });
});

describe('shouldMarkDesempenhoNavPending', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  const fromEstudar = { pathname: '/estudar', origin };

  it('marca clique principal no hub a partir da vitrine', () => {
    const a = makeAnchor({ href: '/desempenho' });
    expect(shouldMarkDesempenhoNavPending(clickEvent(), a, fromEstudar)).toBe(true);
  });

  it('aceita target _self ou ausente e query no href', () => {
    expect(
      shouldMarkDesempenhoNavPending(
        clickEvent(),
        makeAnchor({ href: '/desempenho?cidade=cg', target: '_self' }),
        fromEstudar,
      ),
    ).toBe(true);
  });

  it('ignora botão auxiliar', () => {
    const a = makeAnchor({ href: '/desempenho' });
    expect(shouldMarkDesempenhoNavPending(clickEvent({ button: 1 }), a, fromEstudar)).toBe(false);
    expect(shouldMarkDesempenhoNavPending(clickEvent({ button: 2 }), a, fromEstudar)).toBe(false);
  });

  it('ignora Ctrl/Meta/Shift/Alt', () => {
    const a = makeAnchor({ href: '/desempenho' });
    expect(shouldMarkDesempenhoNavPending(clickEvent({ ctrlKey: true }), a, fromEstudar)).toBe(false);
    expect(shouldMarkDesempenhoNavPending(clickEvent({ metaKey: true }), a, fromEstudar)).toBe(false);
    expect(shouldMarkDesempenhoNavPending(clickEvent({ shiftKey: true }), a, fromEstudar)).toBe(false);
    expect(shouldMarkDesempenhoNavPending(clickEvent({ altKey: true }), a, fromEstudar)).toBe(false);
  });

  it('ignora download, target que sai da aba e origem diferente', () => {
    expect(
      shouldMarkDesempenhoNavPending(clickEvent(), makeAnchor({ href: '/desempenho', download: true }), fromEstudar),
    ).toBe(false);
    expect(
      shouldMarkDesempenhoNavPending(
        clickEvent(),
        makeAnchor({ href: '/desempenho', target: '_blank' }),
        fromEstudar,
      ),
    ).toBe(false);
    expect(
      shouldMarkDesempenhoNavPending(
        clickEvent(),
        makeAnchor({ href: '/desempenho', target: '_parent' }),
        fromEstudar,
      ),
    ).toBe(false);
    expect(
      shouldMarkDesempenhoNavPending(
        clickEvent(),
        makeAnchor({ href: '/desempenho', target: '_top' }),
        fromEstudar,
      ),
    ).toBe(false);
    expect(
      shouldMarkDesempenhoNavPending(
        clickEvent(),
        makeAnchor({ href: '/desempenho', target: 'desempenhoPreview' }),
        fromEstudar,
      ),
    ).toBe(false);
    expect(
      shouldMarkDesempenhoNavPending(
        clickEvent(),
        makeAnchor({ href: 'https://exemplo.com/desempenho' }),
        fromEstudar,
      ),
    ).toBe(false);
  });

  it('ignora rota atual do hub e outros paths', () => {
    const a = makeAnchor({ href: '/desempenho' });
    expect(shouldMarkDesempenhoNavPending(clickEvent(), a, { pathname: '/desempenho', origin })).toBe(
      false,
    );
    expect(
      shouldMarkDesempenhoNavPending(clickEvent(), makeAnchor({ href: '/cadernos' }), fromEstudar),
    ).toBe(false);
  });

  it('resolve âncora a partir do alvo interno do clique', () => {
    const a = makeAnchor({ href: '/desempenho' });
    const span = document.createElement('span');
    a.appendChild(span);
    expect(resolveDesempenhoNavAnchor(span)).toBe(a);
    expect(resolveDesempenhoNavAnchor(document.body)).toBeNull();
  });
});

describe('shouldClearDesempenhoNavPendingOnPath', () => {
  it('mantém pending em estudar e desempenho; limpa no restante', () => {
    expect(shouldClearDesempenhoNavPendingOnPath('/estudar')).toBe(false);
    expect(shouldClearDesempenhoNavPendingOnPath('/desempenho')).toBe(false);
    expect(shouldClearDesempenhoNavPendingOnPath('/desempenho/mapa')).toBe(false);
    expect(shouldClearDesempenhoNavPendingOnPath('/cadernos')).toBe(true);
    expect(shouldClearDesempenhoNavPendingOnPath('/simulados')).toBe(true);
    expect(shouldClearDesempenhoNavPendingOnPath('/login')).toBe(true);
  });
});
