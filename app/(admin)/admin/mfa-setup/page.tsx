'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, AlertCircle, Copy, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function AdminMfaSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initEnrollment() {
      try {
        setLoading(true);
        setError(null);

        // Lista fatores existentes para reaproveitamento ou novo enrollment
        const { data: factorList, error: listError } = await supabase.auth.mfa.listFactors();
        if (!listError && factorList?.totp) {
          const unverified = factorList.totp.filter((f) => (f.status as string) === 'unverified');
          for (const f of unverified) {
            await supabase.auth.mfa.unenroll({ factorId: f.id }).catch(() => undefined);
          }
        }

        const { data, error: enrollError } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          issuer: 'AVANT',
          friendlyName: 'AVANT Admin TOTP',
        });

        if (enrollError || !data?.totp) {
          throw new Error(enrollError?.message || 'Falha ao gerar credencial MFA TOTP.');
        }

        if (isMounted) {
          setFactorId(data.id);
          setQrCode(data.totp.qr_code);
          setSecret(data.totp.secret);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erro ao inicializar configuração MFA.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initEnrollment();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopySecret = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().replace(/\s+/g, '');
    if (cleanCode.length !== 6 || !/^\d+$/.test(cleanCode)) {
      setError('O código TOTP deve conter exatamente 6 dígitos numéricos.');
      return;
    }
    if (!factorId) {
      setError('Fator MFA não identificado. Recarregue a página.');
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
        setError(verifyError.message || 'Código inválido. Verifique o aplicativo e tente novamente.');
        setSubmitting(false);
        return;
      }

      // Revalida assurance level e redireciona
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel !== 'aal2') {
        setError('Segundo fator ativado, mas a elevação da sessão falhou. Tente novamente.');
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
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Ativação de MFA Obrigatório</h1>
            <p className="text-xs text-slate-500">Defesa em profundidade para acesso administrativo</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Loader2 size={32} className="animate-spin text-emerald-600" />
            <p className="mt-3 text-sm font-medium">Gerando chave de segurança...</p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="mt-6 space-y-6">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs leading-relaxed text-emerald-900">
              <p className="font-semibold">Etapa obrigatória:</p>
              <ol className="mt-1.5 list-decimal space-y-1 pl-4">
                <li>Abra seu aplicativo autenticador (Google Authenticator, 1Password, etc.).</li>
                <li>Escaneie o QR Code abaixo ou insira a chave manual.</li>
                <li>Digite o código de 6 dígitos gerado para ativar seu acesso.</li>
              </ol>
            </div>

            {qrCode ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="overflow-hidden rounded-lg bg-white p-2 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCode}
                    alt="MFA QR Code"
                    className="h-48 w-48"
                  />
                </div>
                <div className="mt-3 flex w-full flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSecret((prev) => !prev)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showSecret ? 'Ocultar chave manual' : 'Inserir chave manualmente'}
                  </button>

                  {showSecret && secret ? (
                    <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-800">
                      <span className="truncate select-all">{secret}</span>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        title="Copiar chave"
                      >
                        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <label htmlFor="mfa-code" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Código de 6 dígitos
              </label>
              <input
                id="mfa-code"
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
                  <span>Validando e elevando sessão...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Ativar MFA e Acessar Painel</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400">
              Perda do dispositivo? A recuperação exige redefinição manual pelo operador de infraestrutura.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
