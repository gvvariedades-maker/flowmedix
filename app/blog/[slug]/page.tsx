import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ArrowRight } from 'lucide-react';
import remarkGfm from 'remark-gfm';
import { BlogPostCtaFinal } from '@/components/blog/BlogPostCtaFinal';
import { PublicDarkSiteHeader } from '@/components/layout/PublicDarkSiteHeader';
import { blogMdxComponents } from '@/components/blog/mdx-components';
import { getAllBlogPosts, getAllBlogSlugs, getBlogPostBySlug } from '@/lib/blog';
import { getBlogCategoryLabel } from '@/lib/blog/postCategory';
import { getAbsoluteUrl } from '@/lib/siteUrl';

type PageProps = { params: Promise<{ slug: string }> };

const DEFAULT_AUTHOR = 'Equipe AVANT';

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: 'Artigo | AVANT' };

  const { title, description, date } = post.meta;
  return {
    title: `${title} | Blog AVANT`,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: new Date(date).toISOString(),
      url: getAbsoluteUrl(`/blog/${slug}`),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const formatted = new Date(post.meta.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const categoryLabel = getBlogCategoryLabel(
    post.meta.slug,
    post.meta.title,
    post.meta.description,
  );

  const related = getAllBlogPosts()
    .filter((p) => p.meta.slug !== slug)
    .slice(0, 3);

  const mdx = await MDXRemote({
    source: post.body,
    components: blogMdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#010409] text-slate-100 selection:bg-cyan-400/25 selection:text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-22%] left-1/2 h-[520px] w-[min(140%,980px)] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[130px]" />
        <div className="absolute right-[-10%] bottom-[-12%] h-[500px] w-[500px] rounded-full bg-[#BEF264]/10 blur-[110px]" />
        <div className="absolute top-1/2 left-[-15%] h-[420px] w-[420px] rounded-full bg-indigo-600/20 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <PublicDarkSiteHeader
        ctaLabel="Comece grátis"
        ctaLabelShort="Grátis"
        ctaLabelTight="Grátis →"
      />

      <main className="relative z-10">
        <header className="mx-auto max-w-3xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
            <Link href="/blog" className="font-medium text-slate-500 transition-colors hover:text-slate-400">
              Blog
            </Link>
            <span className="mx-2 text-slate-600">→</span>
            <span className="line-clamp-2 text-slate-500">{post.meta.title}</span>
          </nav>

          <div className="mt-6">
            <span className="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-black tracking-[0.22em] text-cyan-200 uppercase">
              {categoryLabel}
            </span>
          </div>

          <h1 className="mt-6 text-4xl leading-[1.08] font-[1000] tracking-tight text-white sm:text-5xl">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-[#BEF264] bg-clip-text text-transparent">
              {post.meta.title}
            </span>
          </h1>

          <p className="mt-6 text-xl leading-relaxed font-medium text-slate-400">{post.meta.description}</p>

          <p className="mt-6 text-sm text-slate-500">
            {formatted} · {DEFAULT_AUTHOR}
          </p>

          <div className="mt-10 border-b border-white/10" />
        </header>

        <article className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">{mdx}</article>

        {related.length > 0 ? (
          <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
            <h2 className="mb-6 text-2xl font-black tracking-tight text-white">Continue estudando</h2>
            <ul className="grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <li key={item.meta.slug}>
                  <Link
                    href={`/blog/${item.meta.slug}`}
                    className="group flex h-full flex-col rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_0_50px_rgba(0,242,255,0.06)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-cyan-400/30"
                  >
                    <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                      {new Date(item.meta.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="mt-3 text-lg font-black tracking-tight text-white group-hover:text-cyan-200">
                      {item.meta.title}
                    </p>
                    <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-slate-400">
                      {item.meta.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-cyan-400">
                      Ler artigo
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <BlogPostCtaFinal />
      </main>
    </div>
  );
}
