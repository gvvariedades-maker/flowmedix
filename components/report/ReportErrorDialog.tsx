'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { useToast } from '@/lib/toast-context';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/lib/layout/useBodyScrollLock';
import type { ErrorReportCategoryInput, ErrorReportContextTypeInput } from '@/lib/validations';

const CATEGORY_OPTIONS: Array<{ value: ErrorReportCategoryInput; label: string }> = [
  { value: 'enunciado', label: 'Enunciado' },
  { value: 'alternativas', label: 'Alternativas' },
  { value: 'gabarito', label: 'Gabarito' },
  { value: 'slides', label: 'Slides' },
  { value: 'navegacao', label: 'Navegação' },
  { value: 'outro', label: 'Outro' },
];

type ReportErrorDialogProps = {
  contextType: ErrorReportContextTypeInput;
  moduloSlug?: string | null;
  simuladoSessionId?: string | null;
  metadata?: Record<string, unknown>;
  pageUrl?: string;
  trigger?: ReactNode;
  triggerClassName?: string;
  triggerLabel?: string;
  title?: string;
  description?: string;
  onSuccess?: (reportId?: string) => void;
};

type ReportApiResponse = {
  success?: boolean;
  error?: string;
  report?: { id?: string };
};

export function ReportErrorDialog({
  contextType,
  moduloSlug,
  simuladoSessionId,
  metadata,
  pageUrl,
  trigger,
  triggerClassName,
  triggerLabel = 'Reportar erro',
  title = 'Reportar problema nesta questão',
  description = 'Descreva rapidamente o que está errado para o time corrigir.',
  onSuccess,
}: ReportErrorDialogProps) {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState<ErrorReportCategoryInput>('outro');
  const [details, setDetails] = useState('');
  const [inlineError, setInlineError] = useState<string | null>(null);

  const canSubmit = category.length > 0 && details.trim().length > 0 && !submitting;
  const effectivePageUrl =
    pageUrl ?? (typeof window !== 'undefined' ? window.location.href : undefined);

  const payload = useMemo(
    () => ({
      context_type: contextType,
      category,
      description: details.trim(),
      modulo_slug: moduloSlug ?? undefined,
      simulado_session_id:
        contextType === 'simulado' ? (simuladoSessionId ?? undefined) : undefined,
      page_url: effectivePageUrl,
      metadata,
    }),
    [category, contextType, details, effectivePageUrl, metadata, moduloSlug, simuladoSessionId],
  );

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || submitting) return;
      event.preventDefault();
      setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, submitting]);

  const resetForm = () => {
    setCategory('outro');
    setDetails('');
    setInlineError(null);
  };

  const closeDialog = () => {
    if (submitting) return;
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setInlineError(null);
    try {
      const response = await fetchWithAuth('/api/reportar-erro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as ReportApiResponse;

      if (!response.ok || !data.success) {
        const fallbackMessage =
          response.status === 401
            ? 'Sua sessão expirou. Faça login novamente e tente enviar.'
            : response.status === 429
              ? 'Muitos envios em sequência. Aguarde alguns segundos e tente de novo.'
              : 'Não foi possível enviar o reporte agora.';
        const apiMessage = data.error?.trim();
        const finalMessage = response.status === 401 ? fallbackMessage : (apiMessage || fallbackMessage);
        setInlineError(finalMessage);
        addToast(finalMessage, 'danger');
        return;
      }

      addToast('Reporte enviado com sucesso. Obrigado por ajudar a melhorar o AVANT.', 'success');
      onSuccess?.(data.report?.id);
      resetForm();
      setOpen(false);
    } catch {
      const message = 'Erro de conexão ao enviar reporte. Tente novamente.';
      setInlineError(message);
      addToast(message, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {trigger ? (
        <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
          {trigger}
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          aria-label={triggerLabel}
          className={cn(
            'shrink-0 rounded-xl border-white/15 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08] hover:text-white',
            triggerClassName,
          )}
        >
          <AlertTriangle size={16} className="text-amber-300 sm:mr-2" aria-hidden />
          <span className="hidden sm:inline">{triggerLabel}</span>
        </Button>
      )}

      {open ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 pb-safe sm:items-center sm:pb-4">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Fechar modal de reporte"
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={closeDialog}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-error-title"
            className="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d1117] p-5 pb-safe shadow-2xl sm:p-6 sm:pb-6"
          >
            <button
              type="button"
              onClick={closeDialog}
              disabled={submitting}
              className="absolute right-3 top-3 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              aria-label="Fechar"
            >
              <X size={16} aria-hidden />
            </button>

            <div className="mb-4 pr-8">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-300">
                Feedback técnico
              </p>
              <h2 id="report-error-title" className="mt-2 text-xl font-black tracking-tight text-white">
                {title}
              </h2>
              <p className="mt-2 text-sm text-slate-400">{description}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="report-error-category" className="text-sm font-semibold text-slate-200">
                  Categoria
                </label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as ErrorReportCategoryInput)}
                  disabled={submitting}
                >
                  <SelectTrigger id="report-error-category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="report-error-description" className="text-sm font-semibold text-slate-200">
                  Descrição
                </label>
                <textarea
                  id="report-error-description"
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="Ex.: o gabarito está divergente do enunciado, ou o slide não condiz com a resposta..."
                  disabled={submitting}
                  rows={5}
                  maxLength={4000}
                  className="w-full resize-y rounded-xl border border-input bg-muted/50 px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-right text-xs text-slate-500">{details.length}/4000</p>
              </div>
            </div>

            {inlineError ? (
              <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {inlineError}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="button" onClick={() => void handleSubmit()} disabled={!canSubmit}>
                {submitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" aria-hidden />
                    Enviando...
                  </>
                ) : (
                  'Enviar reporte'
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
