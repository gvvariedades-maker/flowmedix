import { notFound } from 'next/navigation';
import { LpPageEditor } from '@/components/admin/lp/LpPageEditor';
import { getLpPageByIdForAdmin } from '@/lib/lp/pages';
import { LpPageConfigSchema, LpPageSeoSchema } from '@/lib/validations';
import { EMPTY_LP_CONFIG, emptyLpSeo } from '@/lib/lp/formDefaults';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditLandingPage({ params }: PageProps) {
  const { id } = await params;
  const page = await getLpPageByIdForAdmin(id);
  if (!page) notFound();

  const configParsed = LpPageConfigSchema.safeParse(page.config);
  const seoParsed = LpPageSeoSchema.safeParse(page.seo);

  const initial = {
    id: page.id,
    path: page.path,
    template_id: page.template_id,
    status: page.status,
    internal_name: page.internal_name,
    config: configParsed.success ? configParsed.data : EMPTY_LP_CONFIG,
    seo: seoParsed.success ? seoParsed.data : emptyLpSeo(page.internal_name, page.path),
    utm_campaign: page.utm_campaign,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
      <LpPageEditor mode="edit" pageId={id} initial={initial} />
    </div>
  );
}
