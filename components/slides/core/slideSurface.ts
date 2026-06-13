/** Superfícies compartilhadas — NeuroSlides editorial (Opção B). */

export const SLIDE_PAGE_BG = 'bg-slate-50';

export const SLIDE_CARD =
  'rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300';

export const SLIDE_CARD_LG =
  'rounded-2xl md:rounded-3xl border border-slate-200 bg-white shadow-sm';

/** Shell imersivo — gradiente full-bleed, sem card branco por cima. */
export const SLIDE_SHELL_CARD =
  'flex min-h-0 flex-1 flex-col overflow-y-auto rounded-none border-0 bg-transparent shadow-none';

/** Fundo editorial por tipo de slide — identidade visual no estudo reverso. */
export function getSlideTypeBgClass(slideType: string | undefined): string {
  switch (slideType) {
    case 'concept_map':
      return 'bg-[linear-gradient(165deg,#FFFFFF_0%,#FCE7F3_50%,#E0ECFF_100%)]';
    case 'golden_rule':
      return 'bg-[linear-gradient(165deg,#FFFFFF_0%,#FEF3C7_50%,#FDE9B8_100%)]';
    case 'logic_flow':
      return 'bg-[linear-gradient(165deg,#FFFFFF_0%,#DBEAFE_50%,#C7DCFF_100%)]';
    case 'danger_zone':
      return 'bg-[linear-gradient(165deg,#FFFFFF_0%,#FEE2E2_50%,#FFD4D8_100%)]';
    default:
      return 'bg-slate-50';
  }
}

/** Cor de destaque do título por tipo — alinhado à referência AprovaEnf. */
export function getSlideTypeTitleClass(slideType: string | undefined): string {
  switch (slideType) {
    case 'concept_map':
      return 'text-pink-800';
    case 'golden_rule':
      return 'text-amber-700';
    case 'logic_flow':
      return 'text-blue-700';
    case 'danger_zone':
      return 'text-red-700';
    default:
      return 'text-slate-900';
  }
}
