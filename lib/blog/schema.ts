import { z } from 'zod';

/** YAML sem aspas vira `Date` no gray-matter; normalizamos para string ISO (YYYY-MM-DD). */
const blogDateSchema = z.preprocess(
  (val) => {
    if (val instanceof Date && !Number.isNaN(val.getTime())) {
      return val.toISOString().slice(0, 10);
    }
    return val;
  },
  z.string().refine((d) => !Number.isNaN(Date.parse(d)), 'Data inválida (use ISO, ex.: 2026-05-02)'),
);

/** Frontmatter obrigatório em cada `content/blog/*.mdx`. O `slug` deve ser igual ao nome do arquivo (sem `.mdx`). */
export const BlogFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: blogDateSchema,
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug: apenas minúsculas, números e hífens'),
});

export type BlogFrontmatter = z.infer<typeof BlogFrontmatterSchema>;
