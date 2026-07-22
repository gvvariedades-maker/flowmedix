/**
 * GOLDEN — Route Handler admin (API:)
 *
 * Canônico: CLAUDE.md §2 (Validação em Route Handler) + §6 (logger)
 * Rule: .cursor/rules/eng-feature.mdc §3–§4
 * Guardrails: .cursor/rules/avant-engineering.mdc (fonte de verdade: API admin)
 *
 * Copie este padrão ao criar/editar `app/api/admin/<recurso>/route.ts`.
 * NÃO importe este arquivo em runtime — é referência para o agente.
 *
 * Invariantes:
 * - `requireAdminApi()` primeiro (authZ + service role); nunca confiar só no client
 * - Body/query com Zod (`safeParse`); 400/422 com `flatten()`
 * - Erros com `logger.error` — proibido `console.log` / `console.error`
 * - Respostas JSON estáveis (`{ error: string }` + status HTTP)
 * - Service role só via `auth.admin` (retorno de `requireAdminApi`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { logger } from '@/lib/logger';

/** Em produção, preferir schema em `lib/validations.ts` e reutilizar aqui. */
const ExampleAdminBodySchema = z.object({
  slug: z.string().min(1).max(200),
  note: z.string().max(500).optional(),
});

/**
 * Exemplo: POST /api/admin/example-resource
 *
 * Fluxo: auth → parse body → operação com `auth.admin` → resposta ou 500 logado.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = ExampleAdminBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { slug, note } = parsed.data;

  try {
    // `auth.admin` = createServerSupabase() (service role). Só no servidor, após requireAdminApi.
    const { data, error } = await auth.admin
      .from('modulos_estudo')
      .select('id, modulo_slug')
      .eq('modulo_slug', slug)
      .maybeSingle();

    if (error) {
      logger.error('POST /api/admin/example-resource falhou', error, {
        email: auth.email,
        slug,
      });
      return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Recurso não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
      slug: data.modulo_slug,
      note: note ?? null,
    });
  } catch (err) {
    logger.error('Erro inesperado em POST /api/admin/example-resource', err, {
      email: auth.email,
      slug,
    });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

/**
 * Anti-padrões (NÃO fazer):
 * - `createServerSupabase()` sem `requireAdminApi()` (pula whitelist de admin)
 * - `process.env.SUPABASE_SERVICE_ROLE_KEY` no bundle / client
 * - Body sem Zod
 * - `console.error(err)` em vez de `logger.error`
 * - Misturar esta rota com handcraft / apply de catálogo na mesma conversa
 */
