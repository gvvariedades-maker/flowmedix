import type {
  ErrorReportCategoryInput,
  ErrorReportContextTypeInput,
  ErrorReportPriorityInput,
  ErrorReportStatusInput,
} from '@/lib/validations';

export type ErrorReportRow = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  context_type: ErrorReportContextTypeInput;
  modulo_slug: string | null;
  simulado_session_id: string | null;
  page_url: string | null;
  category: ErrorReportCategoryInput;
  status: ErrorReportStatusInput;
  priority: ErrorReportPriorityInput;
  severity: string | null;
  description: string;
  metadata: Record<string, unknown>;
  admin_notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
};

export type ErrorReportListResponse = {
  reports: ErrorReportRow[];
  groups?: ErrorReportSlugGroup[];
  grouped?: boolean;
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
    grouped?: boolean;
    total_reports?: number;
  };
  filters: {
    status: ErrorReportStatusInput | null;
    priority: ErrorReportPriorityInput | null;
    context_type: ErrorReportContextTypeInput | null;
    category: ErrorReportCategoryInput | null;
    q: string | null;
    from: string | null;
    to: string | null;
    group_by_slug?: boolean;
  };
};

export type { ErrorReportSlugGroup } from '@/lib/admin/groupErrorReports';

export type ErrorReportSlugAggregate = {
  modulo_slug: string;
  count: number;
  latest_at: string;
  open_count: number;
  slide_reports: number;
};

export type ErrorReportSummaryResponse = {
  by_slug: ErrorReportSlugAggregate[];
  totals: {
    open: number;
    slides_open: number;
  };
};

export const ERROR_REPORT_STATUS_LABELS: Record<ErrorReportStatusInput, string> = {
  novo: 'Novo',
  triagem: 'Triagem',
  resolvido: 'Resolvido',
  descartado: 'Descartado',
};

export const ERROR_REPORT_PRIORITY_LABELS: Record<ErrorReportPriorityInput, string> = {
  p0: 'P0 — Crítico',
  p1: 'P1 — Alto',
  p2: 'P2 — Normal',
  p3: 'P3 — Baixo',
};

export const ERROR_REPORT_CATEGORY_LABELS: Record<ErrorReportCategoryInput, string> = {
  enunciado: 'Enunciado',
  alternativas: 'Alternativas',
  gabarito: 'Gabarito',
  slides: 'Slides',
  navegacao: 'Navegação',
  outro: 'Outro',
};

export function formatErrorReportMetadataPreview(metadata: Record<string, unknown> | null | undefined): string {
  if (!metadata || typeof metadata !== 'object') return '—';
  const parts: string[] = [];
  const etapa = metadata.etapa;
  if (typeof etapa === 'string' && etapa) parts.push(`etapa: ${etapa}`);
  const slideIndex = metadata.slide_index ?? metadata.slide_atual;
  if (typeof slideIndex === 'number') parts.push(`slide ${slideIndex + 1}`);
  const slideType = metadata.slide_type;
  if (typeof slideType === 'string' && slideType) parts.push(slideType);
  const subtopico = metadata.slide_subtopico ?? metadata.meta_subtopico;
  if (typeof subtopico === 'string' && subtopico) parts.push(subtopico);
  return parts.length > 0 ? parts.join(' · ') : '—';
}
