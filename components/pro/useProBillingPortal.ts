'use client';

import { useCallback, useState } from 'react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';

export function useProBillingPortal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openBillingPortal = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth('/api/pro/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
      };

      if (!response.ok) {
        setError(payload.error || 'Não foi possível abrir o portal de assinatura.');
        return;
      }

      if (!payload.url) {
        setError('Portal indisponível no momento.');
        return;
      }

      window.location.href = payload.url;
    } catch {
      setError('Erro de rede ao abrir o portal.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { openBillingPortal, loading, error, clearError: () => setError(null) };
}
