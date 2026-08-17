/**
 * @jest-environment jsdom
 */
import {
  applyHubNavPendingDom,
  clearHubNavPendingDom,
  HUB_NAV_PENDING_PHASE_ATTR,
  HUB_NAV_SLOW_LOADING_MS,
  isHubNavPrefetchDisabled,
  resolveHubNavPendingFromClick,
  resolveSlowLoadingPhase,
  shouldClearHubNavPendingOnPath,
  type HubNavClickLike,
} from '@/lib/layout/hubNavPending';

const origin = 'http://localhost:3000';

function clickEvent(overrides: Partial<HubNavClickLike> = {}): HubNavClickLike {
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

function makeAnchor(href: string, target?: string) {
  const a = document.createElement('a');
  a.setAttribute('href', href);
  if (target !== undefined) a.setAttribute('target', target);
  document.body.appendChild(a);
  return a;
}

describe('hubNavPending — máquina comum', () => {
  afterEach(() => {
    document.body.replaceChildren();
    clearHubNavPendingDom();
  });

  it('resolveSlowLoadingPhase só troca após o limiar', () => {
    expect(resolveSlowLoadingPhase(0)).toBe('loading');
    expect(resolveSlowLoadingPhase(HUB_NAV_SLOW_LOADING_MS - 1)).toBe('loading');
    expect(resolveSlowLoadingPhase(HUB_NAV_SLOW_LOADING_MS)).toBe('slow-loading');
    expect(resolveSlowLoadingPhase(9_880)).toBe('slow-loading');
  });

  it('resolveHubNavPendingFromClick distingue cadernos, desempenho e simulados', () => {
    const fromEstudar = { pathname: '/estudar', origin };
    expect(
      resolveHubNavPendingFromClick(clickEvent(), makeAnchor('/cadernos'), fromEstudar),
    ).toBe('cadernos');
    expect(
      resolveHubNavPendingFromClick(clickEvent(), makeAnchor('/desempenho'), fromEstudar),
    ).toBe('desempenho');
    expect(
      resolveHubNavPendingFromClick(clickEvent(), makeAnchor('/simulados'), fromEstudar),
    ).toBe('simulados');
    expect(
      resolveHubNavPendingFromClick(clickEvent(), makeAnchor('/desempenho/simulados'), fromEstudar),
    ).toBeNull();
    expect(
      resolveHubNavPendingFromClick(clickEvent({ ctrlKey: true }), makeAnchor('/cadernos'), fromEstudar),
    ).toBeNull();
  });

  it('applyHubNavPendingDom marca um hub e a fase; clear remove tudo', () => {
    applyHubNavPendingDom('cadernos', 'loading');
    expect(document.documentElement.getAttribute('data-cadernos-nav-pending')).toBe('true');
    expect(document.documentElement.getAttribute('data-desempenho-nav-pending')).toBeNull();
    expect(document.documentElement.getAttribute(HUB_NAV_PENDING_PHASE_ATTR)).toBe('loading');

    applyHubNavPendingDom('cadernos', 'slow-loading');
    expect(document.documentElement.getAttribute(HUB_NAV_PENDING_PHASE_ATTR)).toBe('slow-loading');
    expect(document.documentElement.getAttribute('data-cadernos-nav-pending')).toBe('true');

    clearHubNavPendingDom();
    expect(document.documentElement.getAttribute('data-cadernos-nav-pending')).toBeNull();
    expect(document.documentElement.getAttribute(HUB_NAV_PENDING_PHASE_ATTR)).toBeNull();
  });

  it('abandono por path limpa; vitrine e o próprio hub mantêm', () => {
    expect(shouldClearHubNavPendingOnPath('/estudar', '/cadernos')).toBe(false);
    expect(shouldClearHubNavPendingOnPath('/cadernos', '/cadernos')).toBe(false);
    expect(shouldClearHubNavPendingOnPath('/desempenho', '/cadernos')).toBe(true);
    expect(shouldClearHubNavPendingOnPath('/simulados', '/cadernos')).toBe(true);
    expect(shouldClearHubNavPendingOnPath('/desempenho/simulados', '/simulados')).toBe(true);
    expect(shouldClearHubNavPendingOnPath('/simulados', '/simulados')).toBe(false);
    expect(shouldClearHubNavPendingOnPath('/simulados/novo', '/simulados')).toBe(false);
  });

  it('desliga prefetch só nos hubs registrados', () => {
    expect(isHubNavPrefetchDisabled('/cadernos')).toBe(true);
    expect(isHubNavPrefetchDisabled('/desempenho')).toBe(true);
    expect(isHubNavPrefetchDisabled('/simulados')).toBe(true);
    expect(isHubNavPrefetchDisabled('/desempenho/simulados')).toBe(false);
  });
});
