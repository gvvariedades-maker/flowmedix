/**
 * Erro levantado quando a leitura ao Supabase falha após retentativas
 * (evita cachear catálogo vazio). A error boundary do dashboard pode
 * exibir copy específica e o botão "Tentar de novo" (`reset()`).
 */
export const DATA_SERVICE_FRIENDLY_TITLE = 'Dados indisponíveis no momento';

export const DATA_SERVICE_FRIENDLY_DESCRIPTION =
  'A conexão com o banco de questões não respondeu. Isso costuma ser temporário. Tente de novo em alguns segundos.';

export class DataServiceUnavailableError extends Error {
  readonly code = 'AVANT_DATA_SERVICE' as const;

  constructor(message: string = DATA_SERVICE_FRIENDLY_DESCRIPTION) {
    super(message);
    this.name = 'DataServiceUnavailableError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isDataServiceUnavailableError(
  e: unknown,
): e is DataServiceUnavailableError {
  if (e instanceof DataServiceUnavailableError) return true;
  if (e instanceof Error && e.name === 'DataServiceUnavailableError') return true;
  // Next pode serializar o erro: resta a mensagem padrão para o mesmo efeito na UI
  if (e instanceof Error && e.message === DATA_SERVICE_FRIENDLY_DESCRIPTION) {
    return true;
  }
  return false;
}
