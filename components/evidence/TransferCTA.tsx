'use client';

/**
 * CTA condicional pós-NeuroSlides "Testar em outra questão" — Fase 3 T1.
 * Âncoras: docs/DECISAO_EVIDENCE_ENGINE.md §2, §4.1, §18.
 *
 * Gated por `enabled` (default `false`): esta é a ÚNICA primitiva de UI nova
 * autorizada pelo ADR para T1, e o ADR proíbe habilitá-la globalmente antes
 * do RCT-1 (Fase 4). Quando `enabled` é `false` (padrão em qualquer render
 * fora do braço de tratamento/coorte técnica), o componente não renderiza
 * nada — não existe fallback "desabilitado visível" que ative percepção de
 * produto fora do experimento.
 *
 * Não decide sozinho se deve estar habilitado: o caller (fora do escopo
 * desta fase) é responsável por resolver braço/coorte antes de passar
 * `enabled`.
 */

import { FlaskConical } from 'lucide-react';

export type TransferCTAProps = {
  /** Gate explícito — nunca assumir `true` por padrão (ADR §4.1, §18). */
  enabled?: boolean;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function TransferCTA({
  enabled = false,
  onClick,
  loading = false,
  disabled = false,
}: TransferCTAProps) {
  if (!enabled) {
    return null;
  }

  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      data-evidence-cta="transfer-t1"
      className="btn-editorial-primary group flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black uppercase tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FlaskConical size={16} className="shrink-0" />
      <span>{loading ? 'Carregando...' : 'Testar em outra questão'}</span>
    </button>
  );
}
