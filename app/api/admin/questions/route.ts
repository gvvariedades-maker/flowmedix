/**
 * API Admin — Publicação de questões (individual ou lote)
 *
 * POST /api/admin/questions
 * Body: objeto JSON (1 questão) ou array JSON (lote)
 *
 * Segurança:
 *  - Verifica sessão real do usuário (cookie SSR)
 *  - Compara e-mail com ADMIN_EMAIL
 *  - Insere usando service role (contorna RLS, mas só após autenticação admin)
 */

import type { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServerSupabase } from '@/lib/supabase/server';
import { getAdminEmail } from '@/lib/constants';
import {
  QuestaoCompletaSchema,
  payloadContainsTecconcursosReference,
  questaoPayloadTecconcursosZodError,
} from '@/lib/validations';
import { logger } from '@/lib/logger';
import { generateContentHash } from '@/lib/contentHash';
import { invalidateModulosCache, invalidateQuestoesCache } from '@/lib/cache';

const MAX_BATCH_SIZE = 100;
/** PostgREST: consultas .in() muito grandes podem falhar; fatiamos os hashes. */
const HASH_LOOKUP_CHUNK = 80;

const SKIP_LOTE = 'repetida neste lote (mesmo enunciado)';
const SKIP_BANCO = 'já cadastrada no AVANT (mesmo enunciado)';
const SKIP_BANCO_INSERT = 'já cadastrada no AVANT (índice único)';

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function generateSlug(data: { meta: { banca: string; topico: string; subtopico?: string } }, suffix: string): string {
  const subtopico = data.meta.subtopico || data.meta.topico || 'geral';
  const slugBase = `${data.meta.banca}-${data.meta.topico}-${subtopico}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slugBase}-${suffix}`;
}

export async function POST(request: NextRequest) {
  // 1. Verifica autenticação e autorização admin
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();
  if (email !== getAdminEmail()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  // 2. Parse do body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const isArray = Array.isArray(body);
  const items = isArray ? (body as unknown[]) : [body];

  if (items.length === 0) {
    return NextResponse.json({ error: 'Nenhuma questão fornecida' }, { status: 400 });
  }

  if (items.length > MAX_BATCH_SIZE) {
    return NextResponse.json(
      { error: `Máximo de ${MAX_BATCH_SIZE} questões por lote` },
      { status: 400 }
    );
  }

  // 3. Valida cada questão com Zod (mesmo schema do laboratório)
  type QuestaoValidada = z.infer<typeof QuestaoCompletaSchema>;
  type ValidatedItem =
    | { index: number; valid: true; data: QuestaoValidada }
    | { index: number; valid: false; errors: z.core.$ZodIssue[] };

  const validated: ValidatedItem[] = items.map((item, index) => {
    if (payloadContainsTecconcursosReference(item)) {
      return { index, valid: false as const, errors: questaoPayloadTecconcursosZodError().issues };
    }
    const result = QuestaoCompletaSchema.safeParse(item);
    if (!result.success) {
      return { index, valid: false as const, errors: result.error.issues };
    }
    const data = result.data;
    if (!data.meta.subtopico) data.meta.subtopico = data.meta.topico || 'Geral';
    return { index, valid: true as const, data };
  });

  // Para questão individual, falha rápido se inválida
  if (!isArray && !validated[0].valid) {
    const v = validated[0] as Extract<ValidatedItem, { valid: false }>;
    return NextResponse.json(
      { error: 'Questão inválida', validation_errors: v.errors },
      { status: 422 }
    );
  }

  // 4. Erros de validação Zod (índice da requisição original)
  const inserted: number[] = [];
  const skipped: Array<{ index: number; reason: string }> = [];
  const errors: Array<{ index: number; reason: string }> = [];

  for (const vr of validated) {
    if (!vr.valid) {
      const v = vr as Extract<ValidatedItem, { valid: false }>;
      errors.push({
        index: v.index,
        reason: v.errors.map((e) => e.message).join('; '),
      });
    }
  }

  type Entry = { index: number; data: QuestaoValidada; hash: string };

  const validRows = validated.filter((vr): vr is Extract<ValidatedItem, { valid: true }> => vr.valid);

  const withHashes: Entry[] = await Promise.all(
    validRows.map(async (v) => ({
      index: v.index,
      data: v.data,
      hash: await generateContentHash(v.data.question_data.instruction),
    }))
  );

  withHashes.sort((a, b) => a.index - b.index);

  const skipInsert = new Set<number>();

  // 4a. Repetição dentro do mesmo envio (mesmo hash = mesmo enunciado normalizado)
  const firstIndexByHash = new Map<string, number>();
  for (const row of withHashes) {
    const first = firstIndexByHash.get(row.hash);
    if (first !== undefined) {
      skipped.push({ index: row.index, reason: SKIP_LOTE });
      skipInsert.add(row.index);
    } else {
      firstIndexByHash.set(row.hash, row.index);
    }
  }

  const supabaseAdmin = await createServerSupabase();
  const timestamp = Date.now();

  // 4b. Já existe no banco (pré-checagem — evita insert desnecessário; UNIQUE ainda protege corrida)
  const candidateHashes = [
    ...new Set(withHashes.filter((w) => !skipInsert.has(w.index)).map((w) => w.hash)),
  ];

  const existingHashes = new Set<string>();
  if (candidateHashes.length > 0) {
    for (const part of chunkArray(candidateHashes, HASH_LOOKUP_CHUNK)) {
      const { data: rows, error: lookupError } = await supabaseAdmin
        .from('modulos_estudo')
        .select('content_hash')
        .in('content_hash', part);

      if (lookupError) {
        logger.warn('Falha ao consultar content_hash existentes', { message: lookupError.message });
      } else {
        rows?.forEach((r: { content_hash: string | null }) => {
          if (r.content_hash) existingHashes.add(r.content_hash);
        });
      }
    }
  }

  for (const row of withHashes) {
    if (skipInsert.has(row.index)) continue;
    if (existingHashes.has(row.hash)) {
      skipped.push({ index: row.index, reason: SKIP_BANCO });
      skipInsert.add(row.index);
    }
  }

  // 4c. Insere apenas o que passou pelos bloqueios de duplicata
  for (const row of withHashes) {
    if (skipInsert.has(row.index)) continue;

    try {
      const slug = generateSlug(row.data, `${timestamp}-${row.index}`);
      const jsonComSlug = { ...row.data, modulo_slug: slug };

      const { error: insertError } = await supabaseAdmin.from('modulos_estudo').insert([
        {
          modulo_nome: row.data.meta.topico,
          titulo_aula: row.data.meta.subtopico || row.data.meta.topico,
          modulo_slug: slug,
          conteudo_json: jsonComSlug,
          banca: row.data.meta.banca.toUpperCase(),
          content_hash: row.hash,
        },
      ]);

      if (insertError) {
        if (insertError.code === '23505') {
          skipped.push({ index: row.index, reason: SKIP_BANCO_INSERT });
        } else {
          errors.push({ index: row.index, reason: insertError.message });
        }
      } else {
        inserted.push(row.index);
        existingHashes.add(row.hash);
      }
    } catch (e: unknown) {
      errors.push({
        index: row.index,
        reason: e instanceof Error ? e.message : 'erro desconhecido',
      });
    }
  }

  logger.info('Questões processadas pelo admin', {
    email,
    total: items.length,
    inserted: inserted.length,
    skipped: skipped.length,
    errors: errors.length,
  });

  // 5. Invalida cache uma única vez se algo foi inserido
  if (inserted.length > 0) {
    try {
      await Promise.all([invalidateModulosCache(), invalidateQuestoesCache()]);
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/estudar', 'layout');
    } catch (e) {
      logger.warn('Cache revalidation failed (questões foram salvas)', {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({
    inserted: inserted.length,
    skipped: skipped.length,
    errors: errors.length,
    details: { inserted, skipped, errors },
  });
}
