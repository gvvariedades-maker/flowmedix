export type BlogCategoryLabel = 'EBSERH' | 'Método' | 'Matérias';

export function getBlogCategoryLabel(slug: string, title: string, description: string): BlogCategoryLabel {
  const searchable = `${slug} ${title} ${description}`.toLowerCase();
  if (searchable.includes('ebserh')) return 'EBSERH';
  if (searchable.includes('matéria') || searchable.includes('materia')) return 'Matérias';
  return 'Método';
}
