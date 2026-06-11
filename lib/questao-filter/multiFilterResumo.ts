export function multiFilterResumo(items: string[], pluralLabel: string): string {
  if (items.length === 0) return '';
  if (items.length <= 2) return items.join(', ');
  return `${items.length} ${pluralLabel}`;
}
