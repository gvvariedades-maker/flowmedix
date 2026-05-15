import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAdminConcursosList } from '@/lib/cache';
import { DataServiceUnavailableError } from '@/lib/dataServiceError';
import ConcursoBuilder from './ConcursoBuilder';
import { publishConcursoForm, unpublishConcursoForm } from './actions';

function statusLabel(status: string): string {
  if (status === 'ativo') return 'Ativo';
  if (status === 'rascunho') return 'Rascunho';
  if (status === 'arquivado') return 'Arquivado';
  return status;
}

export default async function AdminConcursoBuilderPage() {
  let concursos: Awaited<ReturnType<typeof getAdminConcursosList>> = [];
  let loadError: string | null = null;

  try {
    concursos = await getAdminConcursosList();
  } catch (e) {
    loadError =
      e instanceof DataServiceUnavailableError
        ? e.message
        : 'Não foi possível carregar a lista de concursos.';
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Link href="/admin/concursos" className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Builder — Concursos</h1>
          <p className="text-sm text-slate-500">
            Lista com contagem de questões vinculadas (`concurso_modulos`). Publicar ou voltar para rascunho.
          </p>
        </div>
        <Link
          href="/admin/concursos"
          className="ml-auto text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
        >
          Fluxo legado de matrículas →
        </Link>
      </div>

      {loadError ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{loadError}</div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-900">Concursos</h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 pr-4 font-semibold">Nome</th>
                <th className="pb-3 pr-4 font-semibold">Slug</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 pr-4 font-semibold text-right">Questões</th>
                <th className="pb-3 pr-4 font-semibold">Matrículas</th>
                <th className="pb-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {concursos.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4 font-medium text-slate-900">{c.nome}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-600">{c.slug}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={
                        c.status === 'ativo'
                          ? 'rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800'
                          : 'rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700'
                      }
                    >
                      {statusLabel(c.status)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-slate-800">{c.linked_modulos_count}</td>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/concursos/${c.id}/matriculas`}
                      className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
                    >
                      Ver matrículas
                    </Link>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <form action={publishConcursoForm}>
                        <input type="hidden" name="concursoId" value={c.id} />
                        <button
                          type="submit"
                          disabled={c.status === 'ativo'}
                          className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Publicar
                        </button>
                      </form>
                      <form action={unpublishConcursoForm}>
                        <input type="hidden" name="concursoId" value={c.id} />
                        <button
                          type="submit"
                          disabled={c.status === 'rascunho'}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wide text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Despublicar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loadError && concursos.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Nenhum concurso cadastrado.</p>
        ) : null}
      </section>

      {!loadError ? <ConcursoBuilder concursos={concursos} /> : null}
    </div>
  );
}
