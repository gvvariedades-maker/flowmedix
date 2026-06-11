/** Junta fragments de classe (sem importar `cn`). */
function joinClasses(...parts: string[]): string {
  return parts.filter(Boolean).join(' ');
}

/** Valor sentinela Radix Select para opção "Todos", sem colidir com bancas/assuntos. */
export const FILTER_ALL_VALUE = '__all__';

/** Dropdown claro — portal do Radix escapa do tema editorial. */
export const SELECT_CONTENT_EDITORIAL = joinClasses(
  'rounded-xl border border-slate-200 bg-white text-slate-900',
  'shadow-[0_4px_12px_rgba(15,23,42,0.10)]',
);

export const SELECT_ITEM_EDITORIAL = joinClasses(
  'rounded-lg text-slate-700 focus:bg-[rgba(143,224,32,0.08)] focus:text-[#3d6b0f]',
  '[&>span:first-child]:text-[#3d6b0f]',
);

/** Trigger em painéis claros (vitrine, dashboard editorial). */
export const SELECT_TRIGGER_EDITORIAL_PANEL = joinClasses(
  'flex h-11 w-full items-center justify-between rounded-xl border border-slate-200',
  'bg-white px-3 py-2 text-sm text-slate-900 shadow-sm [&>span]:line-clamp-1',
  'focus:outline-none focus:ring-2 focus:ring-[rgba(143,224,32,0.35)] focus:ring-offset-2 focus:ring-offset-white',
  'disabled:cursor-not-allowed disabled:opacity-50',
);
