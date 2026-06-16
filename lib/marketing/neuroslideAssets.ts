/** Proporção do frame de preview (player mobile). Slides são React ao vivo, não JPG. */
export const NEUROSLIDE_INTRINSIC = { width: 487, height: 1024 } as const;

/** Largura máxima do carrossel no hero (homepage e LPs de concurso). */
export const NEUROSLIDE_DISPLAY_MAX_WIDTH = 340;

/** Encolhe no viewport estreito; nunca ultrapassa a coluna do pai. */
export const NEUROSLIDE_MAX_WIDTH_CLASS = 'max-w-[min(100%,340px)]' as const;

export const NEUROSLIDE_ASPECT_CLASS = 'aspect-[487/1024]' as const;

export const NEUROSLIDE_IMAGE_SIZES = '(max-width: 1024px) 90vw, 340px';
