'use client';

import { useCallback, useState } from 'react';
import { GERAL_CONCURSO_SLUG } from '@/lib/concursos/entitlements';
import { proCheckoutLoginHref } from '@/lib/pro/checkoutPaths';

export function useProCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pagamentos/criar-sessao', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concurso_slug: GERAL_CONCURSO_SLUG }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
        redirectUrl?: string;
      };

      if (response.status === 401) {
        window.location.href = proCheckoutLoginHref();
        return;
      }

      if (response.status === 409 && payload.redirectUrl) {
        window.location.href = payload.redirectUrl;
        return;
      }

      if (!response.ok) {
        setError(payload.error || 'Não foi possível iniciar o pagamento.');
        return;
      }

      if (!payload.url) {
        setError('Checkout indisponível no momento.');
        return;
      }

      window.location.href = payload.url;
    } catch {
      setError('Erro de rede ao iniciar o pagamento.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { handleCheckout, loading, error };
}
