'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';

type ComprarConcursoCtaProps = {
  concursoSlug: string;
  isAuthenticated: boolean;
  loginHref: string;
};

export function ComprarConcursoCta({
  concursoSlug,
  isAuthenticated,
  loginHref,
}: ComprarConcursoCtaProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buttonClassName =
    'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#BEF264] px-5 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-lime-400/20 transition-all hover:scale-[1.01] hover:bg-[#d4f879] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto';

  if (!isAuthenticated) {
    return (
      <Link href={loginHref} className={buttonClassName}>
        Entrar para comprar
        <ArrowRight size={18} aria-hidden />
      </Link>
    );
  }

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pagamentos/criar-sessao', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concurso_slug: concursoSlug }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
        redirectUrl?: string;
      };

      if (response.status === 409 && payload.redirectUrl) {
        router.push(payload.redirectUrl);
        return;
      }

      if (response.status === 400 && payload.redirectUrl) {
        router.push(payload.redirectUrl);
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
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={buttonClassName}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden />
            Redirecionando…
          </>
        ) : (
          <>
            Comprar acesso
            <ArrowRight size={18} aria-hidden />
          </>
        )}
      </button>
      {error ? (
        <p className="text-sm font-medium text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
