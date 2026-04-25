import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServerSupabase } from '@/lib/supabase/server';
import { getAdminEmail } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { UserMetricsResponseSchema } from '@/lib/validations';

const buildServerClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Next já cuida dos cookies em Server Components.
          }
        },
      },
    }
  );
};

const ensureAdmin = async (client: Awaited<ReturnType<typeof buildServerClient>>) => {
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Acesso não autenticado' }, { status: 401 });
  }
  if (session.user.email.toLowerCase() !== getAdminEmail()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  return null;
};

type AdminSupabase = Awaited<ReturnType<typeof createServerSupabase>>;

function utcStartOfDayWithOffsetFromToday(offsetDays: number, ref: Date): Date {
  return new Date(
    Date.UTC(
      ref.getUTCFullYear(),
      ref.getUTCMonth(),
      ref.getUTCDate() - offsetDays,
      0,
      0,
      0,
      0
    )
  );
}

/** Segunda-feira 00:00 UTC da semana ISO que contém `ref` (a semana começa na segunda). */
function utcStartOfIsoWeekMonday(ref: Date): Date {
  const day = ref.getUTCDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  return new Date(
    Date.UTC(
      ref.getUTCFullYear(),
      ref.getUTCMonth(),
      ref.getUTCDate() - daysFromMonday,
      0,
      0,
      0,
      0
    )
  );
}

async function countAuthUsers(
  admin: AdminSupabase,
  filters: { gte?: Date; lt?: Date; onlyConfirmed?: boolean } = {}
): Promise<{ count: number; error: Error | null }> {
  let q = admin.from('auth.users').select('*', { count: 'exact', head: true });
  if (filters.gte) {
    q = q.gte('created_at', filters.gte.toISOString());
  }
  if (filters.lt) {
    q = q.lt('created_at', filters.lt.toISOString());
  }
  if (filters.onlyConfirmed) {
    q = q.not('email_confirmed_at', 'is', null);
  }
  const { count, error } = await q;
  if (error) {
    return { count: 0, error: new Error(error.message) };
  }
  return { count: count ?? 0, error: null };
}

/** Fallback: pagina `listUsers` quando a contagem em PostgREST falha. */
async function countAuthUsersListFallback(admin: AdminSupabase): Promise<number> {
  const perPage = 1000;
  let page = 1;
  let total = 0;
  while (page <= 500) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(error.message);
    }
    const batch = data.users.length;
    total += batch;
    if (batch < perPage) break;
    page += 1;
  }
  return total;
}

export async function GET() {
  const client = await buildServerClient();
  const accessError = await ensureAdmin(client);
  if (accessError) {
    return accessError;
  }

  const admin = await createServerSupabase();
  const now = new Date();
  /** Início do dia (UTC) de 6 dias atrás; fim = meia-noite UTC do “dia seguinte” ao hoje = mesma janela do gráfico. */
  const startOf7CalendarDaysUtc = utcStartOfDayWithOffsetFromToday(6, now);
  const endOf7CalendarWindowUtc = new Date(utcStartOfDayWithOffsetFromToday(0, now));
  endOf7CalendarWindowUtc.setUTCDate(endOf7CalendarWindowUtc.getUTCDate() + 1);
  const startOf30CalendarDaysUtc = utcStartOfDayWithOffsetFromToday(29, now);
  const endOf30CalendarWindowUtc = new Date(endOf7CalendarWindowUtc);
  const thisWeekMondayUtc = utcStartOfIsoWeekMonday(now);
  const last4IsoWeekBoundaries = [1, 2, 3, 4].map((i) => {
    const wEnd = new Date(thisWeekMondayUtc);
    wEnd.setUTCDate(wEnd.getUTCDate() - 7 * (i - 1));
    const wStart = new Date(thisWeekMondayUtc);
    wStart.setUTCDate(wStart.getUTCDate() - 7 * i);
    return { wStart, wEnd, index: i };
  });

  const firstTotal = await countAuthUsers(admin);
  let total: number;
  if (firstTotal.error) {
    logger.warn('Contagem em auth.users falhou, tentando listUsers', {
      err: firstTotal.error.message,
    });
    try {
      total = await countAuthUsersListFallback(admin);
    } catch (e) {
      logger.error('Falha ao contar usuários (PostgREST e listUsers)', e);
      return NextResponse.json(
        { error: 'Não foi possível obter a quantidade de usuários.' },
        { status: 500 }
      );
    }
  } else {
    total = firstTotal.count;
  }

  const [d7, d30, conf, wtd, wk1, wk2, wk3, wk4, ...daysRes] = await Promise.all([
    countAuthUsers(admin, {
      gte: startOf7CalendarDaysUtc,
      lt: endOf7CalendarWindowUtc,
    }),
    countAuthUsers(admin, {
      gte: startOf30CalendarDaysUtc,
      lt: endOf30CalendarWindowUtc,
    }),
    countAuthUsers(admin, { onlyConfirmed: true }),
    countAuthUsers(admin, {
      gte: thisWeekMondayUtc,
      lt: endOf7CalendarWindowUtc,
    }),
    ...last4IsoWeekBoundaries.map((b) =>
      countAuthUsers(admin, { gte: b.wStart, lt: b.wEnd })
    ),
    ...Array.from({ length: 7 }, async (_, i) => {
      const daysAgo = 6 - i;
      const start = utcStartOfDayWithOffsetFromToday(daysAgo, now);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      return countAuthUsers(admin, { gte: start, lt: end });
    }),
  ]);

  if (d7.error) logger.error('count new 7d', d7.error);
  if (d30.error) logger.error('count new 30d', d30.error);
  if (conf.error) logger.error('count confirmed', conf.error);
  if (wtd.error) logger.error('count week to date', wtd.error);
  if (wk1.error) logger.error('count week -1', wk1.error);
  if (wk2.error) logger.error('count week -2', wk2.error);
  if (wk3.error) logger.error('count week -3', wk3.error);
  if (wk4.error) logger.error('count week -4', wk4.error);

  const newLast7Days = d7.error ? 0 : d7.count;
  const newLast30Days = d30.error ? 0 : d30.count;
  const newWeekToDateUtc = wtd.error ? 0 : wtd.count;
  const confirmedTotal = conf.error ? 0 : conf.count;

  const weekRowResults = [wk1, wk2, wk3, wk4];
  const last4IsoWeeks = last4IsoWeekBoundaries.map((b, j) => ({
    weekStart: b.wStart.toISOString().slice(0, 10),
    weekEndExclusive: b.wEnd.toISOString().slice(0, 10),
    count: weekRowResults[j]?.error ? 0 : (weekRowResults[j]?.count ?? 0),
  }));

  const last7DaysByDay: { date: string; count: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const daysAgo = 6 - i;
    const start = utcStartOfDayWithOffsetFromToday(daysAgo, now);
    const dateKey = start.toISOString().slice(0, 10);
    const r = daysRes[i];
    if (r.error) {
      logger.error('Métrica diária falhou', { dateKey, error: r.error.message });
      last7DaysByDay.push({ date: dateKey, count: 0 });
    } else {
      last7DaysByDay.push({ date: dateKey, count: r.count });
    }
  }

  const raw = {
    totalUsers: total,
    newLast7Days,
    newLast30Days,
    newWeekToDateUtc,
    confirmedTotal,
    last7DaysByDay,
    last4IsoWeeks,
    generatedAt: new Date().toISOString(),
  };

  const parsed = UserMetricsResponseSchema.safeParse(raw);
  if (!parsed.success) {
    logger.error('Resposta de métricas inválida', parsed.error.flatten());
    return NextResponse.json({ error: 'Resposta inválida' }, { status: 500 });
  }

  return NextResponse.json(parsed.data);
}
