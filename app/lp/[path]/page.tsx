import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LPConcurso } from '@/app/_components/LPConcurso';
import {
  getPublishedLpPageByPath,
  listPublishedLpPaths,
  resolveLpConcursoConfig,
  resolveLpSeo,
} from '@/lib/lp/pages';
import { getAbsoluteUrl } from '@/lib/siteUrl';

type PageProps = { params: Promise<{ path: string }> };

export async function generateStaticParams() {
  const paths = await listPublishedLpPaths();
  return paths.map((path) => ({ path }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { path } = await params;
  const page = await getPublishedLpPageByPath(path);
  if (!page) return { title: 'AVANT' };

  const seo = resolveLpSeo(page, page.path);
  if (!seo) return { title: 'AVANT' };

  const canonical = seo.canonical ?? `/lp/${page.path}`;
  const ogTitle = seo.ogTitle ?? seo.title;
  const ogDescription = seo.ogDescription ?? seo.description;

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: getAbsoluteUrl(canonical),
      type: 'website',
      locale: 'pt_BR',
    },
  };
}

export default async function LpDynamicPage({ params }: PageProps) {
  const { path } = await params;
  const page = await getPublishedLpPageByPath(path);
  if (!page) notFound();

  const config = resolveLpConcursoConfig(page);
  if (!config) notFound();

  return <LPConcurso config={config} />;
}
