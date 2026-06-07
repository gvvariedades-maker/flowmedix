import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { LPConcurso } from '@/app/_components/LPConcurso';
import { getServerUser } from '@/lib/supabase/server-auth';
import { isAdminSessionEmail } from '@/lib/constants';
import { getLpPageByIdForAdmin } from '@/lib/lp/pages';
import { lpPublicHref, resolveLpConcursoConfig } from '@/lib/lp/shared';

type PageProps = { params: Promise<{ id: string }> };

export default async function LpPreviewPage({ params }: PageProps) {
  const user = await getServerUser();
  if (!isAdminSessionEmail(user?.email)) {
    redirect('/login');
  }

  const { id } = await params;
  const page = await getLpPageByIdForAdmin(id);
  if (!page) notFound();

  const config = resolveLpConcursoConfig(page);
  if (!config) notFound();

  return (
    <div>
      <div className="fixed left-4 top-4 z-[100] flex flex-wrap gap-2">
        <Link
          href={`/admin/landings/${id}`}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/90 px-4 py-2 text-[10px] font-black uppercase italic text-white backdrop-blur"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao editor
        </Link>
        {page.status === 'ativo' ? (
          <a
            href={lpPublicHref(page.path)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-[10px] font-black uppercase italic text-cyan-100 backdrop-blur"
          >
            LP publicada
          </a>
        ) : (
          <span className="rounded-full border border-amber-400/40 bg-amber-500/20 px-4 py-2 text-[10px] font-black uppercase italic text-amber-100 backdrop-blur">
            Preview — {page.status}
          </span>
        )}
      </div>
      <LPConcurso config={config} />
    </div>
  );
}
