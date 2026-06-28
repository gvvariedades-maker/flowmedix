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
