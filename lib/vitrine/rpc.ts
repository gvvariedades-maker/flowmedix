import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { VitrineDisciplinaId } from '@/lib/vitrine/disciplina';
import type { VitrineFacets, VitrinePageResponse } from '@/lib/vitrine/types';

export const VITRINE_PAGE_RPC = 'get_vitrine_page' as const;
export const VITRINE_FACETS_RPC = 'get_vitrine_facets' as const;

const VitrineQuestaoItemSchema = z.object({
  slug: z.string(),
  numero: z.number(),
  status: z.enum(['nao_estudada', 'estudada']),
  avant_codigo: z.number().nullable(),
  created_at: z.string().nullable(),
});

const VitrineGrupoSchema = z.object({
  titulo_aula: z.string(),
  modulo_nome: z.string(),
  banca: z.string(),
  questoes: z.array(VitrineQuestaoItemSchema),
  acertos: z.number(),
  erros: z.number(),
  totalResolvidas: z.number(),
  totalQuestoes: z.number(),
  totalNeuroSlides: z.number().default(0),
  trabalhadas: z.number(),
  percentual: z.number(),
  firstSlug: z.string(),
});

const VitrineFacetsRpcSchema = z.object({
  bancas: z.array(z.string()),
  assuntos: z.array(z.string()),
});

const VitrineDisciplinaSummaryRpcSchema = z.object({
  id: z.enum(['enfermagem', 'portugues']),
  label: z.string(),
  totalAssuntos: z.number(),
  totalQuestoes: z.number(),
  trabalhadas: z.number(),
  progressoPct: z.number(),
});

const VitrinePageRpcSchema = z.object({
  groups: z.array(VitrineGrupoSchema),
  pagination: z.object({
    page: z.number(),
    perPage: z.number(),
    totalGroups: z.number(),
    totalPages: z.number(),
  }),
  totalModulosFiltrados: z.number(),
  /** Embutido na RPC Fase 2; opcional para rollout com migration pendente. */
  facets: VitrineFacetsRpcSchema.optional(),
  /** Embutido com p_disciplina; opcional para rollout com migration pendente. */
  disciplinas: z.array(VitrineDisciplinaSummaryRpcSchema).optional(),
});

export type VitrinePageRpcResult = Omit<VitrinePageResponse, 'facets' | 'disciplinas'> & {
  facets?: VitrineFacets;
  disciplinas?: VitrinePageResponse['disciplinas'];
};

export type VitrineRpcFilters = {
  bancas?: string[];
  assuntos?: string[];
  q?: string;
  disciplina?: VitrineDisciplinaId;
};

export type FetchVitrinePageRpcParams = {
  userId: string;
  page: number;
  filters?: VitrineRpcFilters;
};

function rpcBancaAssuntoParams(filters: VitrineRpcFilters = {}) {
  const bancas = filters.bancas?.filter((b) => b.trim()).map((b) => b.trim()) ?? [];
  const assuntos = filters.assuntos?.filter((a) => a.trim()).map((a) => a.trim()) ?? [];
  return {
    p_banca: null as string | null,
    p_assunto: null as string | null,
    p_bancas: bancas.length ? bancas : null,
    p_assuntos: assuntos.length ? assuntos : null,
    p_q: filters.q?.trim() || null,
    p_disciplina: filters.disciplina ?? null,
  };
}

export async function fetchVitrinePageFromRpc(
  params: FetchVitrinePageRpcParams,
): Promise<VitrinePageRpcResult> {
  const { userId, page, filters = {} } = params;
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.rpc(VITRINE_PAGE_RPC, {
    p_user_id: userId,
    p_page: page,
    ...rpcBancaAssuntoParams(filters),
  });

  if (error) {
    logger.warn('RPC get_vitrine_page falhou', { userId, page, code: error.code, message: error.message });
    throw error;
  }

  const parsed = VitrinePageRpcSchema.safeParse(data);
  if (!parsed.success) {
    logger.warn('RPC get_vitrine_page payload inválido', {
      userId,
      issues: parsed.error.issues.length,
    });
    throw new Error('Resposta RPC get_vitrine_page inválida');
  }

  return parsed.data;
}

export type FetchVitrineFacetsRpcParams = {
  userId: string;
  bancas?: string[];
};

export async function fetchVitrineFacetsFromRpc(
  params: FetchVitrineFacetsRpcParams,
): Promise<VitrineFacets> {
  const { userId, bancas = [] } = params;
  const supabase = await createServerSupabase();
  const normalizedBancas = bancas.filter((b) => b.trim()).map((b) => b.trim());

  const { data, error } = await supabase.rpc(VITRINE_FACETS_RPC, {
    p_user_id: userId,
    p_banca: null,
    p_bancas: normalizedBancas.length ? normalizedBancas : null,
  });

  if (error) {
    logger.warn('RPC get_vitrine_facets falhou', {
      userId,
      code: error.code,
      message: error.message,
    });
    throw error;
  }

  const parsed = VitrineFacetsRpcSchema.safeParse(data);
  if (!parsed.success) {
    logger.warn('RPC get_vitrine_facets payload inválido', {
      userId,
      issues: parsed.error.issues.length,
    });
    throw new Error('Resposta RPC get_vitrine_facets inválida');
  }

  return parsed.data;
}
