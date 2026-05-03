/** Junta fragments de classe (sem importar `cn`). */
function joinClasses(...parts: string[]): string {
  return parts.filter(Boolean).join(' ');
}

/** Valor sentinela Radix Select para opção \"Todos\", sem colidir com bancas/assuntos. */
export const FILTER_ALL_VALUE = '__all__';

/** Dropdown escuro — portal do Radix escapa do tema; igual à vitrine. */
export const SELECT_CONTENT_DARK = joinClasses(
  'bg-[#0d1117] border-[rgba(255,255,255,0.10)] text-slate-200 rounded-2xl',
  'shadow-[0_8px_32px_-4px_rgba(0,242,255,0.08),0_4px_16px_-4px_rgba(0,0,0,0.6)]',
);

export const SELECT_ITEM_DARK = joinClasses(
  'text-slate-200 focus:bg-cyan-400/10 focus:text-cyan-300 rounded-xl',
  '[&>span:first-child]:text-[#00f2ff]',
);

/** Trigger em painéis #0d1117 ou fundo escuro (#010409). */
export const SELECT_TRIGGER_DARK_PANEL = joinClasses(
  'flex h-11 w-full items-center justify-between rounded-xl border border-[rgba(255,255,255,0.15)]',
  'bg-[#0d1117] px-3 py-2 text-sm text-slate-200 shadow-sm [&>span]:line-clamp-1',
  'focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:ring-offset-2 focus:ring-offset-[#0d1117]',
  'disabled:cursor-not-allowed disabled:opacity-50',
);
