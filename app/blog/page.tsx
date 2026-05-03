import type { Metadata } from 'next';
import { BlogIndexClient, type BlogIndexPost } from '@/components/blog/BlogIndexClient';
import { getAllBlogPosts } from '@/lib/blog';
import { getAbsoluteUrl } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Blog | AVANT',
  description:
    'Artigos sobre Estudo Reverso, NeuroSlides e preparação para concursos de Técnico em Enfermagem (EBSERH, prefeituras e mais).',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | AVANT',
    description:
      'Artigos sobre método de estudo, concursos de Técnico em Enfermagem e novidades da plataforma.',
    url: getAbsoluteUrl('/blog'),
    type: 'website',
  },
};

export default function BlogIndexPage() {
  const posts: BlogIndexPost[] = getAllBlogPosts().map((post) => ({
    slug: post.meta.slug,
    title: post.meta.title,
    description: post.meta.description,
    date: post.meta.date,
  }));

  return <BlogIndexClient posts={posts} />;
}
