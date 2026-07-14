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
    {
      id: 'avp-dispositivo-calibre',
      label: 'Dispositivo e calibre do AVP',
      value: 'escolher calibre conforme terapia, veia e tempo previsto',
      detail: 'Cateter muito fino para hemólise/risco de extravasamento; muito grosso aumenta trauma venoso.',
      sourceId: 'potter-perry-fundamentos-11ed-2024',
    },
    {
      id: 'avp-hematoma',
      label: 'Hematoma pós-punção',
      value: 'compressão local, elevação do membro e reavaliação',
      sourceId: 'potter-perry-fundamentos-11ed-2024',
    },
    {
      id: 'avp-documentacao',
      label: 'Documentação do acesso venoso',
      value: 'data, hora, local, calibre, número de punções e resposta do paciente',
      sourceId: 'potter-perry-fundamentos-11ed-2024',
    },
    {
      id: 'higiene-maos-puncao',
      label: 'Higiene das mãos antes da punção',
      value: 'lavagem ou fricção com álcool 70% antes de tocar o paciente ou o material',
      sourceId: 'potter-perry-fundamentos-11ed-2024',
    },
    {
      id: 'avp-remocao',
      label: 'Remoção do cateter periférico',
      value: 'retirar quando não houver indicação, complicação ou fim da terapia',
      sourceId: 'potter-perry-fundamentos-11ed-2024',
    },
    {
      id: 'avp-flush',
      label: 'Permeabilização do cateter (flush)',
      value: 'SF 0,9% após administração e conforme protocolo — não só na inserção',
      sourceId: 'potter-perry-fundamentos-11ed-2024',
    },
    {
      id: 'avp-sitio-inferior',
      label: 'Preferência de sítio em AVP',
      value: 'membro superior, veia distal com progressão proximal conforme necessidade',
      sourceId: 'potter-perry-fundamentos-11ed-2024',
    },
    {
      id: 'avp-observacao-pos',
      label: 'Observação pós-punção',
      value: 'verificar permeabilidade, sinais de complicação e conforto do paciente',
      sourceId: 'potter-perry-fundamentos-11ed-2024',
    },
    {
      id: 'avp-equipo-troca',
      label: 'Troca de equipo/conector',
      value: 'seguir protocolo institucional — fricção na conexão e técnica asséptica',
      sourceId: 'potter-perry-fundamentos-11ed-2024',
    },
  ],
};
