import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogFrontmatterSchema, type BlogFrontmatter } from '@/lib/blog/schema';

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog');

export type BlogPost = {
  meta: BlogFrontmatter;
  /** Corpo MDX sem frontmatter */
  body: string;
};

function readSlugsFromFs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith('.mdx'))
    .map((name) => name.replace(/\.mdx$/i, ''));
}

/**
 * Lista todos os posts (ordenados do mais recente ao mais antigo).
 */
export function getAllBlogPosts(): BlogPost[] {
  const slugs = readSlugsFromFs();
  const posts: BlogPost[] = [];
  for (const slug of slugs) {
    const post = getBlogPostBySlug(slug);
    if (post) posts.push(post);
  }
  return posts.sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
}

/**
 * Retorna slugs válidos para generateStaticParams.
 */
export function getAllBlogSlugs(): string[] {
  return getAllBlogPosts().map((p) => p.meta.slug);
}

/**
 * Carrega um post pelo slug (nome do arquivo = slug).
 */
export function getBlogPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const parsed = BlogFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Frontmatter inválido em blog/${slug}.mdx: ${parsed.error.message}`);
  }
  if (parsed.data.slug !== slug) {
    throw new Error(`Em blog/${slug}.mdx o campo slug deve ser "${slug}" (igual ao nome do arquivo).`);
  }
  return { meta: parsed.data, body: content.trim() };
}
