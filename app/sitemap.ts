import type { MetadataRoute } from 'next';
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
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: getAbsoluteUrl(route.path),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
