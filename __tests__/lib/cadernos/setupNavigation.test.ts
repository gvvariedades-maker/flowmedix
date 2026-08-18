import { stripCadernoSetupDoneFromBrowserUrl } from '@/lib/cadernos/setupNavigation';

describe('stripCadernoSetupDoneFromBrowserUrl', () => {
  const notebookId = 'nb-test-123';

  beforeEach(() => {
    window.history.replaceState(window.history.state, '', '/');
  });

  it('remove ?setup=done sem alterar outros parâmetros', () => {
    window.history.replaceState(
      window.history.state,
      '',
      `/cadernos/${notebookId}?setup=done&foo=bar`,
    );

    const changed = stripCadernoSetupDoneFromBrowserUrl(notebookId);

    expect(changed).toBe(true);
    expect(window.location.pathname).toBe(`/cadernos/${notebookId}`);
    expect(window.location.search).toBe('?foo=bar');
  });

  it('remove ?setup=done quando é o único parâmetro', () => {
    window.history.replaceState(
      window.history.state,
      '',
      `/cadernos/${notebookId}?setup=done`,
    );

    const changed = stripCadernoSetupDoneFromBrowserUrl(notebookId);

    expect(changed).toBe(true);
    expect(window.location.pathname).toBe(`/cadernos/${notebookId}`);
    expect(window.location.search).toBe('');
  });

  it('não altera URL quando setup não é done', () => {
    window.history.replaceState(
      window.history.state,
      '',
      `/cadernos/${notebookId}?setup=1`,
    );

    const changed = stripCadernoSetupDoneFromBrowserUrl(notebookId);

    expect(changed).toBe(false);
    expect(window.location.search).toBe('?setup=1');
  });

  it('não altera URL de outro caderno', () => {
    window.history.replaceState(
      window.history.state,
      '',
      '/cadernos/other-id?setup=done',
    );

    const changed = stripCadernoSetupDoneFromBrowserUrl(notebookId);

    expect(changed).toBe(false);
    expect(window.location.search).toBe('?setup=done');
  });
});
