import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Fundamentos de Enfermagem — edição brasileira atual (tier B).
 * Potter, Perry, Stockert, Hall — Guanabara Koogan, 11ª ed., 2024.
 */
export const POTTER_PERRY_FUNDAMENTOS_11ED: GuidelineTable = {
  id: 'potter-perry-fundamentos-11ed-2024',
  snapshot: 'Fundamentos de Enfermagem — 11ª ed. Brasil',
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem',
  year: 2024,
  entries: [
    {
      id: 'avp-complicacoes',
      label: 'Complicações do acesso venoso periférico',
      value: 'infiltração, flebite, hematoma, êmbolo',
      detail: 'Infiltração = líquido no subcutâneo; flebite = inflamação do trajeto venoso.',
      sourceId: 'potter-perry-fundamentos-11ed-2024',
    },
    {
      id: 'avp-tecnica',
      label: 'Técnica de punção venosa periférica',
      value: 'assepsia, ângulo 15°–30°, fixação e observação',
      sourceId: 'potter-perry-fundamentos-11ed-2024',
    },
    {
      id: 'avp-manutencao',
      label: 'Manutenção de cateter venoso',
      value: 'curativo íntegro, troca de equipo conforme protocolo, documentação',
      sourceId: 'potter-perry-fundamentos-11ed-2024',
    },
  ],
};
