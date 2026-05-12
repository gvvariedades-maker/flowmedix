"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { UserMetricsResponse } from "@/lib/validations";
import {
  ArrowLeft,
  Loader2,
  LogOut,
  LayoutDashboard,
  Users,
  Calendar,
  CheckCircle2,
  Download,
} from "lucide-react";
import { downloadUserMetricsCsv } from "@/lib/userMetricsCsv";

function formatShortDateUtc(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  if (!y || !m || !d) return yyyyMmDd;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
}

/** `weekEndExclusive` é o próximo domingo+1 = segunda; último dia da semana = um dia antes. */
function formatIsoWeekRangePt(weekStart: string, weekEndExclusive: string): string {
  const endDay = new Date(weekEndExclusive + "T00:00:00.000Z");
  endDay.setUTCDate(endDay.getUTCDate() - 1);
  return `${formatShortDateUtc(weekStart)} – ${formatShortDateUtc(
    endDay.toISOString().slice(0, 10)
  )}`;
}

export default function AdminMetricasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserMetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const maxDay = useMemo(
    () =>
      data?.last7DaysByDay.length
        ? Math.max(1, ...data.last7DaysByDay.map((x) => x.count))
        : 1,
    [data]
  );

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/admin/user-metrics", { method: "GET" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof body.error === "string"
            ? body.error
            : "Não foi possível carregar as métricas."
        );
        setLoading(false);
        return;
      }
      setData(body as UserMetricsResponse);
      setLoading(false);
    }

    void checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 pb-24 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex flex-wrap justify-between gap-3 mb-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-black uppercase italic text-[#4F46E5] hover:text-[#4338ca]"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin
          </Link>
          <div className="flex gap-3">
            <Link
              href="/estudar"
              className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-full text-xs font-black uppercase italic hover:bg-[#4338ca] transition-all"
            >
              <LayoutDashboard className="w-4 h-4" /> Área do aluno
            </Link>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-black uppercase italic hover:bg-[#4F46E5] transition-all"
            >
              <LogOut className="w-3 h-3" />
              Sair
            </button>
          </div>
        </div>

        <header>
          <h1 className="text-3xl sm:text-4xl font-[1000] italic uppercase tracking-tighter flex items-center gap-3">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-[#4F46E5] shrink-0" />
            Cadastros
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
            Contas em auth (Supabase) · Agrupamento diário em UTC
          </p>
        </header>

        {error && (
          <div className="bg-rose-50 border-2 border-rose-200 text-rose-800 rounded-2xl px-4 py-3 text-sm font-bold">
            {error}
          </div>
        )}

        {data && !error && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Atualizado:{" "}
                {new Date(data.generatedAt).toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })}{" "}
                (horário de Brasília)
              </p>
              <button
                type="button"
                onClick={() => downloadUserMetricsCsv(data)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-slate-900 bg-white text-slate-900 text-xs font-black uppercase italic hover:bg-slate-900 hover:text-[#BEF264] transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[28px] border-[1.5px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">
                  <Users className="w-4 h-4" />
                  Total de contas
                </div>
                <p className="text-4xl font-[1000] tabular-nums text-slate-900">
                  {data.totalUsers.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="bg-white p-6 rounded-[28px] border-[1.5px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  E-mail confirmado
                </div>
                <p className="text-4xl font-[1000] tabular-nums text-slate-900">
                  {data.confirmedTotal.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="bg-white p-6 rounded-[28px] border-[1.5px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">
                  <Calendar className="w-4 h-4" />
                  Novos (7 dias corridos, UTC)
                </div>
                <p className="text-3xl font-[1000] tabular-nums text-[#4F46E5]">
                  {data.newLast7Days.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="bg-white p-6 rounded-[28px] border-[1.5px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">
                  <Calendar className="w-4 h-4" />
                  Novos (30 dias corridos, UTC)
                </div>
                <p className="text-3xl font-[1000] tabular-nums text-[#4F46E5]">
                  {data.newLast30Days.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="bg-white p-6 rounded-[28px] border-[1.5px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] sm:col-span-2">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">
                  <Calendar className="w-4 h-4" />
                  Semana em curso (seg. UTC até hoje)
                </div>
                <p className="text-3xl font-[1000] tabular-nums text-[#4F46E5]">
                  {data.newWeekToDateUtc.toLocaleString("pt-BR")}
                </p>
                <p className="text-[11px] text-slate-500 mt-2 leading-snug">
                  Semana ISO em UTC: começa na segunda. O número inclui hoje ainda aberto, até a virada
                  do dia (UTC) na barra de cadastros.
                </p>
              </div>
            </div>

            <section className="bg-white p-6 sm:p-8 rounded-[32px] border-[1.5px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
              <h2 className="text-sm font-black italic uppercase text-slate-900 mb-4">
                Últimas 4 semanas fechadas (ISO, UTC, seg.–dom.)
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Não inclui a semana atual. Cada linha é uma semana completa, anterior à que está
                em andamento.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[320px]">
                  <thead>
                    <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-500 border-b-2 border-slate-200">
                      <th className="py-2 pr-3">Período (UTC)</th>
                      <th className="py-2 pr-3 text-right">Novos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.last4IsoWeeks.map((w) => (
                      <tr
                        key={w.weekStart + w.weekEndExclusive}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-3 pr-3 font-medium text-slate-800">
                          {formatIsoWeekRangePt(w.weekStart, w.weekEndExclusive)}
                        </td>
                        <td className="py-3 text-right font-[1000] tabular-nums text-[#4F46E5]">
                          {w.count.toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-[40px] border-[1.5px] border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
              <h2 className="text-lg font-black italic uppercase text-slate-900 mb-6">
                Últimos 7 dias (por dia, UTC)
              </h2>
              <div className="flex items-end justify-between gap-1 sm:gap-2">
                {data.last7DaysByDay.map((day) => {
                  const hPct = (day.count / maxDay) * 100;
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center justify-end min-w-0 h-40 border-b-2 border-slate-200"
                    >
                      <span className="text-[10px] sm:text-xs font-bold text-slate-600 mb-1 tabular-nums">
                        {day.count}
                      </span>
                      <div className="w-full max-w-[48px] mx-auto flex-1 flex items-end min-h-0">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-[#4F46E5] to-[#818cf8] min-h-1"
                          style={{ height: `${Math.max(5, hPct)}%` }}
                          title={`${day.date}: ${day.count}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between gap-1 sm:gap-2 mt-3 text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase text-center">
                {data.last7DaysByDay.map((day) => (
                  <div key={day.date} className="flex-1 min-w-0 truncate">
                    {formatShortDateUtc(day.date)}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
