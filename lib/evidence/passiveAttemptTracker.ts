/**
 * EE-I01 — Instrumentação passiva do cliente (Lote 7).
 * Gera attempt_id, timers, answer_change_count e tab_backgrounded.
 * Convicção permanece `unknown` até o Lote 8.
 *
 * Sem I/O de rede; sem dependência de React (hook separado).
 */

import type {
  EvidenceAttemptClientFieldsInput,
  EvidenceConviction,
} from '@/lib/evidence/types';

export type PassiveAttemptConfirmPayload = EvidenceAttemptClientFieldsInput & {
  attempt_id: string;
  started_at: string;
  answered_at: string;
  conviction: EvidenceConviction;
  answer_change_count: number;
  response_time_ms: number;
  tab_backgrounded: boolean;
};

export type BeginConfirmOptions = {
  /**
   * Override de convicção (Lote 8) — só a UI de coorte técnica passa isto.
   * Omitido / ausente → `unknown` (comportamento Lote 7 preservado).
   */
  conviction?: EvidenceConviction;
};

export type PassiveAttemptTrackerOptions = {
  /** Relógio injetável (epoch ms). Default: Date.now */
  now?: () => number;
  /** UUID v4 injetável. Default: crypto.randomUUID */
  uuid?: () => string;
};

function defaultUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback determinístico-enough para ambientes sem crypto.randomUUID
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function toIsoUtc(ms: number): string {
  return new Date(ms).toISOString();
}

/**
 * Tracker de uma exposição de questão → confirmação.
 * Retry técnico reutiliza o mesmo `attempt_id` até `clearPendingAfterSuccess`.
 */
export function createPassiveAttemptTracker(options: PassiveAttemptTrackerOptions = {}) {
  const now = options.now ?? (() => Date.now());
  const uuid = options.uuid ?? defaultUuid;

  let startedAtMs = now();
  let answerChangeCount = 0;
  let tabBackgrounded = false;
  let pendingAttemptId: string | null = null;
  let selectionPrimed = false;

  return {
    /** Nova questão / remount — reseta timers e limpa pending. */
    resetForNewQuestion(): void {
      startedAtMs = now();
      answerChangeCount = 0;
      tabBackgrounded = false;
      pendingAttemptId = null;
      selectionPrimed = false;
    },

    /** Conta troca de alternativa após a primeira seleção. */
    noteSelectionChange(): void {
      if (!selectionPrimed) {
        selectionPrimed = true;
        return;
      }
      answerChangeCount += 1;
    },

    /** Page Visibility: aba oculta / background. */
    noteVisibilityHidden(): void {
      tabBackgrounded = true;
    },

    getAnswerChangeCount(): number {
      return answerChangeCount;
    },

    getTabBackgrounded(): boolean {
      return tabBackgrounded;
    },

    getPendingAttemptId(): string | null {
      return pendingAttemptId;
    },

    /**
     * Chamado no Confirmar (antes do fetch).
     * Retry da mesma submissão reutiliza o mesmo attempt_id.
     *
     * `opts.conviction` (Lote 8): quando informado, `answered_at` é calculado
     * **neste** momento — ou seja, após a escolha de convicção na UI da
     * coorte técnica (spec §1.5/§1.6). Fora da coorte / sem escolha:
     * `conviction = 'unknown'` (default, comportamento Lote 7).
     */
    beginConfirm(opts?: BeginConfirmOptions): PassiveAttemptConfirmPayload {
      if (!pendingAttemptId) {
        pendingAttemptId = uuid();
      }
      const answeredAtMs = now();
      const responseTimeMs = Math.max(0, answeredAtMs - startedAtMs);
      return {
        attempt_id: pendingAttemptId,
        started_at: toIsoUtc(startedAtMs),
        answered_at: toIsoUtc(answeredAtMs),
        conviction: opts?.conviction ?? 'unknown',
        answer_change_count: answerChangeCount,
        response_time_ms: responseTimeMs,
        tab_backgrounded: tabBackgrounded,
      };
    },

    /** Após HTTP 200 com gabarito — próxima confirmação humana gera novo id. */
    clearPendingAfterSuccess(): void {
      pendingAttemptId = null;
    },
  };
}

export type PassiveAttemptTracker = ReturnType<typeof createPassiveAttemptTracker>;
