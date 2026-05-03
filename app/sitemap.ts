import type { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/lib/blog';
import { getAbsoluteUrl } from '@/lib/siteUrl';

const publicRoutes = [
  {
    path: '/',
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    path: '/ajuda',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    path: '/ajuda/estudo-reverso',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/blog',
    changeFrequency: 'weekly',
    priority: 0.75,
  },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: getAbsoluteUrl(route.path),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogPosts = getAllBlogPosts().map((post) => ({
    url: getAbsoluteUrl(`/blog/${post.meta.slug}`),
    lastModified: new Date(post.meta.date),
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }));

  return [...staticEntries, ...blogPosts];
}
