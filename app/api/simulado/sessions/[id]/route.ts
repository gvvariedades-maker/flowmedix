import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { logger } from '@/lib/logger';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { getE2eSimuladoSession } from '@/lib/e2e/simuladoSeed';

const SessionIdSchema = z.string().uuid('ID de sessão inválido');

type SimuladoSessionRow = {
  id: string;
  status: 'aberto' | 'concluido' | 'cancelado';
  total_questoes: number;
  filtros: Record<string, unknown>;
  created_at: string;
  concluida_em: string | null;
};

type SimuladoRespostaSummaryRow = {
  ordem: number;
  modulo_slug: string;
  opcao_id: string | null;
  opcao_correta_id: string | null;
  acertou: boolean | null;
  respondida_em: string | null;
  modulos_estudo: {
    banca: string | null;
    titulo_aula: string | null;
    modulo_nome: string | null;
    conteudo_json: { meta?: { topico?: string; subtopico?: string; banca?: string } } | null;
  } | null;
};

type ModuloEstudoEmbed = NonNullable<SimuladoRespostaSummaryRow['modulos_estudo']>;

function normalizeModuloEstudoEmbed(
  raw: ModuloEstudoEmbed | ModuloEstudoEmbed[] | null | undefined,
): ModuloEstudoEmbed | null {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

function extractQuestaoMeta(conteudoJson: ModuloEstudoEmbed | ModuloEstudoEmbed[] | null | undefined) {
  const modulo = normalizeModuloEstudoEmbed(conteudoJson);
  const meta = modulo?.conteudo_json?.meta;
  return {
    banca: meta?.banca ?? modulo?.banca ?? null,
    topico: meta?.topico ?? modulo?.modulo_nome ?? null,
    subtopico: meta?.subtopico ?? modulo?.titulo_aula ?? null,
  };
}

/** GET /api/simulado/sessions/[id] — resumo da sessão e progresso por questão. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const parsedId = SessionIdSchema.safeParse(rawId);
    if (!parsedId.success) {
      return NextResponse.json({ error: 'ID de sessão inválido' }, { status: 400 });
    }

    const sessionId = parsedId.data;

    if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
      const seeded = getE2eSimuladoSession(sessionId);
      if (!seeded) {
        return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
      }
      return NextResponse.json(seeded);
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { user, supabase } = auth;

    const { data: session, error: sessionError } = await supabase
      .from('simulado_sessions')
      .select('id, status, total_questoes, filtros, created_at, concluida_em')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle<SimuladoSessionRow>();

    if (sessionError) {
      logger.error('Falha ao buscar sessão de simulado', sessionError, {
        userId: user.id,
        sessionId,
      });
      return NextResponse.json({ error: 'Erro ao carregar simulado' }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    const { data: respostas, error: respostasError } = await supabase
      .from('simulado_respostas')
      .select(
        `
        ordem,
        modulo_slug,
        opcao_id,
        opcao_correta_id,
        acertou,
        respondida_em,
        modulos_estudo (
          banca,
          titulo_aula,
          modulo_nome,
          conteudo_json
        )
      `,
      )
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .order('ordem', { ascending: true });

    if (respostasError) {
      logger.error('Falha ao listar respostas do simulado', respostasError, {
        userId: user.id,
        sessionId,
      });
      return NextResponse.json({ error: 'Erro ao carregar questões do simulado' }, { status: 500 });
    }

    type RespostaDbRow = Omit<SimuladoRespostaSummaryRow, 'modulos_estudo'> & {
      modulos_estudo: ModuloEstudoEmbed | ModuloEstudoEmbed[] | null;
    };

    const rows = (respostas ?? []) as RespostaDbRow[];

    let respondidas = 0;
    let acertos = 0;
    let erros = 0;

    const questoes = rows.map((row) => {
      const respondida = row.acertou !== null;
      if (respondida) {
        respondidas += 1;
        if (row.acertou) acertos += 1;
        else erros += 1;
      }

      const base = {
        ordem: row.ordem,
        modulo_slug: row.modulo_slug,
        respondida,
        meta: extractQuestaoMeta(row.modulos_estudo),
      };

      if (!respondida) {
        return base;
      }

      return {
        ...base,
        acertou: row.acertou,
        opcao_id: row.opcao_id,
        opcao_correta_id: row.opcao_correta_id,
        respondida_em: row.respondida_em,
      };
    });

    const pendentes = session.total_questoes - respondidas;
    const percentualAcerto =
      respondidas > 0 ? Math.round((acertos / respondidas) * 100) : 0;

    return NextResponse.json({
      session,
      resumo: {
        respondidas,
        pendentes,
        acertos,
        erros,
        percentual_acerto: percentualAcerto,
      },
      questoes,
    });
  } catch (error) {
    logger.error('Erro inesperado em GET /api/simulado/sessions/[id]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
