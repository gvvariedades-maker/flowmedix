'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import {
  getBlogCategoryLabel,
  type BlogCategoryLabel,
} from '@/lib/blog/postCategory';
import { PublicDarkSiteHeader } from '@/components/layout/PublicDarkSiteHeader';

type BlogIndexClientProps = {
  posts: BlogIndexPost[];
};

export type BlogIndexPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const categoryStyles: Record<BlogCategoryLabel, string> = {
  EBSERH: 'border-indigo-400/25 bg-indigo-500/10 text-indigo-200',
  Método: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200',
  Matérias: 'border-[#BEF264]/25 bg-[#BEF264]/10 text-[#BEF264]',
};

function getPostCategory(post: BlogIndexPost): { label: BlogCategoryLabel; className: string } {
  const label = getBlogCategoryLabel(post.slug, post.title, post.description);
  return { label, className: categoryStyles[label] };
}

function formatPostDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function BlogIndexClient({ posts }: BlogIndexClientProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#010409] text-slate-100 selection:bg-cyan-400/25 selection:text-white">
      <div className="fixed inset-0 pointer-events-none">
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
        <section className="mx-auto max-w-6xl px-4 pt-12 pb-14 sm:px-6 sm:pt-20 sm:pb-16">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-7 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-[10px] font-black tracking-[0.22em] text-cyan-200 uppercase sm:text-xs"
            >
              <BookOpen size={14} className="shrink-0" />
              Base de conhecimento · Técnico em Enfermagem
            </motion.div>

            <motion.h1
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mb-6 text-4xl leading-[1.08] font-[1000] tracking-tight text-white sm:text-5xl md:text-6xl"
            >
              <span className="bg-gradient-to-r from-white via-cyan-200 to-[#BEF264] bg-clip-text text-transparent">
                Tudo que você precisa saber para ser aprovado
              </span>
            </motion.h1>

            <motion.p
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mx-auto max-w-2xl text-lg leading-relaxed font-medium text-slate-400 sm:text-xl"
            >
              Conteúdo escrito para quem quer ser aprovado em concursos de Técnico em Enfermagem. Sem enrolação.
            </motion.p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          {posts.length === 0 ? (
            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 text-center shadow-[0_0_50px_rgba(0,242,255,0.08)] backdrop-blur-xl sm:p-8"
            >
              <p className="text-sm leading-relaxed font-medium text-slate-400">
                Ainda não há artigos. Adicione arquivos{' '}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-200">.mdx</code> em{' '}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-200">content/blog</code>.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post, idx) => {
                const category = getPostCategory(post);

                return (
                  <motion.article
                    key={post.slug}
                    custom={idx + 2}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="group relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_0_50px_rgba(0,242,255,0.08)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-cyan-400/[0.04] sm:p-7"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
                      <div className="mb-6 flex items-center justify-between gap-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-black tracking-[0.22em] uppercase ${category.className}`}
                        >
                          {category.label}
                        </span>
                        <ArrowRight
                          size={18}
                          className="translate-x-2 text-cyan-200 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </div>

                      <h2 className="text-xl leading-tight font-black tracking-tight text-white sm:text-2xl">
                        {post.title}
                      </h2>
                      <p className="mt-4 flex-1 text-sm leading-relaxed font-medium text-slate-400">
                        {post.description}
                      </p>
                      <p className="mt-7 text-xs font-bold tracking-wider text-slate-500 uppercase">
                        {formatPostDate(post.date)}
                      </p>
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>

        <section className="px-4 pb-24 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border border-cyan-400/25 bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-slate-950 p-10 text-center sm:p-14"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent" />
            <div className="relative z-10">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#BEF264]/25 bg-[#BEF264]/10 text-[#BEF264]">
                <Sparkles size={22} />
              </div>
              <h2 className="mb-4 text-2xl font-[1000] tracking-tight text-white sm:text-3xl md:text-4xl">
                Transforme leitura em aprovação com método.
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed font-medium text-slate-400 sm:text-lg">
                Crie sua conta gratuita no AVANT e comece a estudar por questões reais, diagnóstico e Estudo Reverso.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#BEF264] px-10 py-4 text-sm font-black tracking-widest text-slate-950 uppercase shadow-lg shadow-lime-400/25 transition-all hover:bg-[#d4f879] sm:w-auto"
                >
                  Criar conta gratuita
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-bold text-indigo-300 underline underline-offset-4 hover:text-indigo-200"
                >
                  Acessar minha conta
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
