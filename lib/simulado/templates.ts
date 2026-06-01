import type { SupabaseClient } from '@supabase/supabase-js';
import type { RitmoMetaOption } from '@/lib/simulado/provaMeta';
import { ritmoToSecondsPerQuestion, secondsPerQuestionToRitmo } from '@/lib/simulado/provaMeta';
import type { SimuladoModo } from '@/lib/simulado/types';
import type { SimuladoTemplateCreateInput } from '@/lib/validations';

export type SimuladoTemplateRow = {
  id: string;
  user_id: string;
  titulo: string;
  modo: SimuladoModo;
  quantidade: number;
  filtros: Record<string, unknown>;
  ritmo_meta_segundos_por_questao: number | null;
  ultimo_uso_em: string | null;
  created_at: string;
};

export type SimuladoTemplateSummary = {
  id: string;
  titulo: string;
  modo: SimuladoModo;
  quantidade: number;
  filtros: Record<string, unknown>;
  ritmo_meta: RitmoMetaOption;
  ritmo_meta_segundos_por_questao: number | null;
  ultimo_uso_em: string | null;
  created_at: string;
};

export type SimuladoTemplateSessionConfig = {
  modo: SimuladoModo;
  quantidade: number;
  titulo: string;
  ritmo_meta: RitmoMetaOption;
  bancas?: string[];
  assuntos?: string[];
  q?: string;
};

const TEMPLATE_SELECT =
  'id, user_id, titulo, modo, quantidade, filtros, ritmo_meta_segundos_por_questao, ultimo_uso_em, created_at';

function extractStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  return items.length > 0 ? items : undefined;
}

export function mapSimuladoTemplateRow(row: SimuladoTemplateRow): SimuladoTemplateSummary {
  return {
    id: row.id,
    titulo: row.titulo.trim(),
    modo: row.modo,
    quantidade: row.quantidade,
    filtros: row.filtros ?? {},
    ritmo_meta: secondsPerQuestionToRitmo(row.ritmo_meta_segundos_por_questao),
    ritmo_meta_segundos_por_questao: row.ritmo_meta_segundos_por_questao,
    ultimo_uso_em: row.ultimo_uso_em,
    created_at: row.created_at,
  };
}

export function buildTemplateFiltros(input: {
  bancas?: string[];
  assuntos?: string[];
  q?: string;
}): Record<string, unknown> {
  return {
    bancas: input.bancas?.length ? input.bancas : null,
    assuntos: input.assuntos?.length ? input.assuntos : null,
    q: input.q?.trim() || null,
  };
}

export function templateToSessionConfig(template: SimuladoTemplateSummary): SimuladoTemplateSessionConfig {
  const filtros = template.filtros ?? {};
  return {
    modo: template.modo,
    quantidade: template.quantidade,
    titulo: template.titulo,
    ritmo_meta: template.ritmo_meta,
    bancas: extractStringArray(filtros.bancas),
    assuntos: extractStringArray(filtros.assuntos),
    q: typeof filtros.q === 'string' && filtros.q.trim() ? filtros.q.trim() : undefined,
  };
}

export async function listSimuladoTemplates(
  supabase: SupabaseClient,
  userId: string,
): Promise<SimuladoTemplateSummary[]> {
  const { data, error } = await supabase
    .from('simulado_templates')
    .select(TEMPLATE_SELECT)
    .eq('user_id', userId)
    .order('ultimo_uso_em', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return (data as SimuladoTemplateRow[]).map(mapSimuladoTemplateRow);
}

export async function getSimuladoTemplateById(
  supabase: SupabaseClient,
  userId: string,
  templateId: string,
): Promise<SimuladoTemplateSummary | null> {
  const { data, error } = await supabase
    .from('simulado_templates')
    .select(TEMPLATE_SELECT)
    .eq('user_id', userId)
    .eq('id', templateId)
    .maybeSingle();

  if (error || !data) return null;
  return mapSimuladoTemplateRow(data as SimuladoTemplateRow);
}

export async function createSimuladoTemplate(
  supabase: SupabaseClient,
  userId: string,
  input: SimuladoTemplateCreateInput,
): Promise<{ template: SimuladoTemplateSummary | null; error?: string }> {
  const ritmoMetaSegundos =
    input.modo === 'prova' ? ritmoToSecondsPerQuestion(input.ritmo_meta) : null;

  const { data, error } = await supabase
    .from('simulado_templates')
    .insert({
      user_id: userId,
      titulo: input.titulo.trim(),
      modo: input.modo,
      quantidade: input.quantidade,
      filtros: buildTemplateFiltros(input),
      ritmo_meta_segundos_por_questao: ritmoMetaSegundos,
    })
    .select(TEMPLATE_SELECT)
    .single();

  if (error || !data) {
    return { template: null, error: error?.message ?? 'insert_failed' };
  }

  return { template: mapSimuladoTemplateRow(data as SimuladoTemplateRow) };
}

export async function deleteSimuladoTemplate(
  supabase: SupabaseClient,
  userId: string,
  templateId: string,
): Promise<boolean> {
  const { error, count } = await supabase
    .from('simulado_templates')
    .delete({ count: 'exact' })
    .eq('user_id', userId)
    .eq('id', templateId);

  return !error && (count ?? 0) > 0;
}

export async function touchSimuladoTemplateUsage(
  supabase: SupabaseClient,
  userId: string,
  templateId: string,
): Promise<void> {
  await supabase
    .from('simulado_templates')
    .update({ ultimo_uso_em: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', templateId);
}
