'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function AdminMfaChallengePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFactors() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: listError } = await supabase.auth.mfa.listFactors();
        if (listError) {
          throw new Error(listError.message || 'Falha ao buscar fatores MFA.');
        }

        const verifiedTotp = data?.totp?.find((f) => f.status === 'verified');
        if (!verifiedTotp) {
          // Nenhum fator verificado encontrado -> redireciona para setup
          if (isMounted) {
            router.push('/admin/mfa-setup');
          }
          return;
        }

        if (isMounted) {
          setFactorId(verifiedTotp.id);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar fatores MFA.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadFactors();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().replace(/\s+/g, '');
    if (cleanCode.length !== 6 || !/^\d+$/.test(cleanCode)) {
      setError('O código TOTP deve conter exatamente 6 dígitos numéricos.');
      return;
    }
    if (!factorId) {
      setError('Fator MFA não encontrado. Recarregue a página.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: cleanCode,
      });

      if (verifyError) {
        setError(verifyError.message || 'Código inválido ou expirado. Tente novamente.');
        setSubmitting(false);
        return;
      }

      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel !== 'aal2') {
        setError('Código aceito, mas a elevação da sessão falhou. Tente novamente.');
        setSubmitting(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao validar código MFA.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Verificação em Duas Etapas</h1>
            <p className="text-xs text-slate-500">MFA AAL2 obrigatório para sessão admin</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Loader2 size={32} className="animate-spin text-emerald-600" />
            <p className="mt-3 text-sm font-medium">Carregando autenticação...</p>
          </div>
        ) : (
          <form onSubmit={handleChallenge} className="mt-6 space-y-6">
            <p className="text-xs leading-relaxed text-slate-600">
              Digite o código de 6 dígitos gerado no seu aplicativo autenticador cadastrado para liberar o painel.
            </p>

            <div className="space-y-2">
              <label htmlFor="mfa-challenge-code" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Código de 6 dígitos
              </label>
              <input
                id="mfa-challenge-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoFocus
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl font-mono tracking-widest text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {error ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
                <AlertCircle size={16} className="shrink-0" />
                <p className="text-xs font-bold">{error}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting || code.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verificando código...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Confirmar Acesso</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400">
              Perdeu o dispositivo autenticador? A recuperação exige intervenção segura do operador de infraestrutura.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
