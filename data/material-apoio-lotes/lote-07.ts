import type { MaterialApoioLoteItem } from './types';

/** Lote 7 (4) — Biossegurança + saúde da criança e da mulher */
export const materialSlidesLote7: readonly MaterialApoioLoteItem[] = [
  {
    id: 49,
    lote: 7,
    ordemNoLote: 1,
    categoria: 'Biossegurança e saúde da família',
    titulo: 'IRAS: precaução padrão, gotículas, contato e aerossóis (HIC)',
  },
  {
    id: 50,
    lote: 7,
    ordemNoLote: 2,
    categoria: 'Biossegurança e saúde da família',
    titulo: 'Higienização, esterilização e desinfecção: diferenças e quando usar',
  },
  {
    id: 51,
    lote: 7,
    ordemNoLote: 3,
    categoria: 'Biossegurança e saúde da família',
    titulo: 'EPI, descarte, resíduos e risco biológico (LBI, noções banca)',
  },
  {
    id: 52,
    lote: 7,
    ordemNoLote: 4,
    categoria: 'Biossegurança e saúde da família',
    titulo: 'Pré-natal, puericultura, teste do pezinho e saúde do adolescente (eixos de prova)',
  },
] as const;
