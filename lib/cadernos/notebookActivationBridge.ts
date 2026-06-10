const NOTEBOOK_ACTIVATION_REFRESH_EVENT = 'avant:notebook-activation-refresh';

/** Solicita refresh do status de ativação no DashboardShell (ex.: após 1ª questão no caderno). */
export function requestNotebookActivationRefresh(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(NOTEBOOK_ACTIVATION_REFRESH_EVENT));
}

export function subscribeNotebookActivationRefresh(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const handler = () => listener();
  window.addEventListener(NOTEBOOK_ACTIVATION_REFRESH_EVENT, handler);
  return () => window.removeEventListener(NOTEBOOK_ACTIVATION_REFRESH_EVENT, handler);
}

/** Apenas testes — reset entre casos. */
export function resetNotebookActivationRefreshListenersForTests(): void {
  // Event listeners são removidos pelos unsubscribes dos testes.
}
