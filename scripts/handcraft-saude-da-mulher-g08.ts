#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g08 (8 slugs pré-natal P0).
 *
 *   npm run handcraft:saude-da-mulher-g08
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g08 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g08';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-09';

const AB32_SOURCE = {
  id: 'caderno-ab-32-prenatal',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 32 — Atenção ao pré-natal de baixo risco',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: [
    'toxoplasmose gestacional',
    'atribuições TE pré-natal',
    'DHEG agravamento',
    'urgência obstétrica',
    'fatores alto risco',
    'pré-eclâmpsia',
    'síndromes hipertensivas',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis' | 'certo_errado';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  slides: unknown[];
  cleanInstruction?: (s: string) => string;
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: pack.branch,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: [AB32_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\n?\d{4}\)\s*/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

const TE_PSF_SLIDES = [
  {
    type: 'concept_map',
    slide_title: 'TE — pré-natal na UBS',
    meta: slideMeta,
    items: [
      { label: 'Comando', detail: 'Atribuições do Técnico de Enfermagem no pré-natal da Estratégia Saúde da Família.', icon: 'Target' },
      { label: 'Conduta (C)', detail: 'Aferir sinais vitais, orientar por protocolo e comunicar alterações à equipe.', icon: 'Activity' },
      { label: 'Pegadinha solicitar exames', detail: 'Exames sem prescrição de profissional habilitado — distrator A.', icon: 'AlertTriangle' },
      { label: 'Pegadinha prescrever/diagnosticar', detail: 'TE não prescreve suplementos nem define conduta autônoma — B e D.', icon: 'XCircle' },
    ],
    footer_rule: 'TE aferir, orientar e comunicar',
  },
  {
    type: 'golden_rule',
    slide_title: 'TE × equipe — AB 32',
    meta: slideMeta,
    content: 'ATRIBUIÇÕES DO TE',
    rows: [
      { label: 'Pode', value: 'Aferir sinais vitais e acolher gestante', badge: 'hot', emphasis: 'highlight' },
      { label: 'Orientar', value: 'Conforme protocolos institucionais', badge: 'info' },
      { label: 'Comunicar', value: 'Alterações à equipe de saúde', badge: 'hot' },
      { label: 'Não pode', value: 'Prescrever, solicitar exames ou diagnosticar sozinho', badge: 'warn' },
    ],
    footer_rule: 'SV + comunicação → C',
  },
  {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta,
    steps: [
      'Identificar conduta correta do TE no pré-natal.',
      'Eliminar A — solicitar exames sem prescrição.',
      'Eliminar B — prescrever suplementos por conta própria.',
      'Testar C — aferir SV, orientar e comunicar alterações.',
      'Eliminar D — diagnosticar risco e definir conduta autônoma.',
      'Marcar letra C.',
    ],
    footer_rule: 'Aferir + comunicar → C',
  },
  {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content: 'PEGADINHAS — TE NO PRÉ-NATAL',
    items: [
      { label: 'Letra A — exames sem prescrição', detail: 'Extrapola competência do TE.', correct: 'Exames dependem de prescrição médica/enfermagem.' },
      { label: 'Letra B — prescrever vitaminas', detail: 'Suplementação não é atribuição do TE.', correct: 'Aferir SV e comunicar alterações — letra C.' },
      { label: 'Letra D — diagnóstico autônomo', detail: 'Definir conduta assistencial exige profissional habilitado.', correct: 'Orientar e comunicar à equipe — C.' },
      { label: 'Pegadinha prescrever/diagnosticar', detail: 'TE apoia rotina — não substitui médico/enfermeiro.', correct: 'Sinais vitais + protocolo + comunicação — C.' },
    ],
    footer_rule: 'TE não prescreve nem diagnostica',
  },
];

const SPECS: Record<string, Pack> = {
  'igeduc-enfermagem-saude-da-mulher-1777104432986-7': {
    family: 'certo_errado',
    branch: 'mulher_prenatal',
    guideline: 'MS/AB 32 — toxoplasmose gestacional: tratamento reduz mas não elimina risco fetal',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Toxoplasmose — gestação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Julgar se tratamento elimina totalmente o risco de infecção fetal.', icon: 'Target' },
          { label: 'Tratamento precoce', detail: 'Reduz incidência e severidade da toxoplasmose congênita.', icon: 'Pill' },
          { label: 'Pegadinha elimina risco', detail: 'Afirmativa errada: tratamento não zera risco fetal.', icon: 'AlertTriangle' },
          { label: 'Rastreio', detail: 'Sorologia no pré-natal — acionar protocolo se suspeita.', icon: 'Microscope' },
        ],
        footer_rule: 'Trata ≠ elimina risco fetal',
      },
      {
        type: 'golden_rule',
        slide_title: 'Toxoplasmose — MS',
        meta: slideMeta,
        content: 'TOXOPLASMOSE GESTACIONAL',
        rows: [
          { label: 'Tratamento', value: 'Reduz transmissão e gravidade fetal', badge: 'hot', emphasis: 'highlight' },
          { label: 'Não faz', value: 'Eliminar completamente o risco de infecção fetal', badge: 'warn' },
          { label: 'Início precoce', value: 'Melhor prognóstico perinatal', badge: 'info' },
          { label: 'Prevenção', value: 'Higiene alimentar + sorologia pré-natal', badge: 'info' },
        ],
        footer_rule: 'Reduz risco — não anula',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Afirmativa: tratamento elimina risco fetal + início precoce reduz gravidade.',
          'Primeira parte FALSA — tratamento não elimina risco totalmente.',
          'Segunda parte verdadeira isoladamente, mas afirmativa conjunta é incorreta.',
          'Eliminar Certo.',
          'Marcar Errado — letra B.',
        ],
        footer_rule: 'Elimina risco = falso → Errado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TOXOPLASMOSE',
        items: [
          { label: 'Pegadinha elimina risco', detail: 'Tratamento reduz, mas não zera transmissão fetal.', correct: 'Afirmativa incorreta — marcar Errado.' },
          { label: 'Letra A — Certo', detail: 'Aceitar que tratamento elimina todo risco fetal.', correct: 'Risco residual permanece — gabarito Errado.' },
          { label: 'Confundir reduzir × eliminar', detail: 'Banca testa nuance do protocolo.', correct: 'Início precoce ajuda, mas não elimina risco — B.' },
          { label: 'Ignorar segunda cláusula', detail: 'Mesmo com benefício do tratamento precoce, a primeira parte invalida.', correct: 'Assertiva global falsa — Errado.' },
        ],
        footer_rule: 'Não elimina risco → Errado',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'igeduc-enfermagem-saude-da-mulher-1780001362784-8': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS 2012) — TE no pré-natal: aferir SV, orientar e comunicar alterações',
    slides: TE_PSF_SLIDES,
    cleanInstruction: cleanPdfNoise,
  },

  'inaz-do-para-enfermagem-saude-da-mulher-1777104347186-5': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — DHEG: cefaleia, escotomas, epigástrica, proteinúria; exantema não é sinal típico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'DHEG — sinais de agravamento',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Qual NÃO é sinal/sintoma de agravamento na suspeita de DHEG.', icon: 'Target' },
          { label: 'Proteinúria (A)', detail: 'Sinal de lesão renal — agravamento hipertensivo.', icon: 'Droplets' },
          { label: 'Cefaleia/visão (D/E)', detail: 'Cefaleia e visão embaçada — alerta neurológico.', icon: 'Eye' },
          { label: 'Pegadinha exantema', detail: 'Exantema maculopapular não é sinal típico de DHEG — gabarito.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Exantema ≠ agravamento DHEG',
      },
      {
        type: 'golden_rule',
        slide_title: 'DHEG — alerta',
        meta: slideMeta,
        content: 'SINAIS DE AGRAVAMENTO',
        rows: [
          { label: 'Neurológico', value: 'Cefaleia intensa, escotomas, visão turva', badge: 'hot' },
          { label: 'Renal', value: 'Proteinúria, oligúria', badge: 'hot' },
          { label: 'Edema', value: 'Edema súbito face/mãos — reavaliar', badge: 'info' },
          { label: 'NÃO é', value: 'Exantema maculopapular cutâneo', badge: 'warn', emphasis: 'highlight' },
        ],
        footer_rule: 'Exantema fora do quadro → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato negativo: achar o que NÃO é agravamento DHEG.',
          'Eliminar A — proteinúria: sinal de gravidade.',
          'Eliminar B — edema: pode indicar agravamento.',
          'Testar C — exantema maculopapular: não típico de DHEG.',
          'Eliminar D — cefaleia: sinal de alerta.',
          'Eliminar E — visão embaçada: sinal de alerta.',
          'Marcar letra C.',
        ],
        footer_rule: 'Exantema não é DHEG → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DHEG',
        items: [
          { label: 'Letra A — proteinúria', detail: 'Marca lesão glomerular na pré-eclâmpsia.', correct: 'É sinal de agravamento — não é o gabarito.' },
          { label: 'Letra B — edema', detail: 'Edema pode fazer parte do quadro hipertensivo.', correct: 'Sinal relacionado à DHEG — eliminar.' },
          { label: 'Letra D — cefaleia', detail: 'Cefaleia persistente = alerta neurológico.', correct: 'Agravamento hipertensivo — não marcar.' },
          { label: 'Letra E — visão embaçada', detail: 'Alteração visual indica agravamento neurológico.', correct: 'É sinal de DHEG — não é o gabarito negativo.' },
          { label: 'Pegadinha exantema', detail: 'Rash cutâneo não compõe síndrome hipertensiva.', correct: 'Exantema maculopapular — letra C.' },
        ],
        footer_rule: 'Cutâneo ≠ DHEG',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-aocp-enfermagem-processo-de-enfermagem-1780004272097-8': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'MS manual urgências obstétricas — TVP: emergência materna; DMG e anemia crônicas não são urgência aguda típica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Urgência obstétrica',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Caracteriza urgência/emergência obstétrica na gestação.', icon: 'Target' },
          { label: 'TVP (E)', detail: 'Suspeita de trombose venosa profunda — risco materno imediato.', icon: 'AlertCircle' },
          { label: 'Pegadinha DMG', detail: 'Diabetes gestacional — condição crônica, não urgência aguda típica.', icon: 'AlertTriangle' },
          { label: 'Pegadinha placenta prévia', detail: 'Prévia não sangrante — vigilância, não emergência neste momento.', icon: 'XCircle' },
        ],
        footer_rule: 'TVP = emergência materna',
      },
      {
        type: 'golden_rule',
        slide_title: 'Urgências × crônicos',
        meta: slideMeta,
        content: 'EMERGÊNCIA OBSTÉTRICA',
        rows: [
          { label: 'TVP', value: 'Trombose venosa profunda — encaminhar urgente', badge: 'hot', emphasis: 'highlight' },
          { label: 'DMG', value: 'Rastreio e controle — não urgência aguda', badge: 'info' },
          { label: 'Anemia', value: 'Investigar e tratar — raramente emergência isolada', badge: 'info' },
          { label: 'Prévia sem sangramento', value: 'Acompanhamento — não emergência imediata', badge: 'warn' },
        ],
        footer_rule: 'Trombose suspeita → E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Diferenciar urgência aguda de condição crônica/vigilância.',
          'Eliminar A — diabetes gestacional: manejo ambulatorial.',
          'Eliminar B — isoimunização Rh prévia: histórico, não emergência aguda.',
          'Eliminar C — anemia: tratar no pré-natal, não urgência típica.',
          'Eliminar D — placenta prévia não sangrante: observação.',
          'Testar E — suspeita de trombose venosa profunda.',
          'Marcar letra E.',
        ],
        footer_rule: 'TVP → emergência → E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — URGÊNCIA OBSTÉTRICA',
        items: [
          { label: 'Letra A — diabetes gestacional', detail: 'Condição metabólica crônica da gestação.', correct: 'Controle ambulatorial — não urgência aguda típica.' },
          { label: 'Letra C — anemia', detail: 'Comum no pré-natal — suplementar e investigar.', correct: 'Emergência obstétrica aguda é TVP — E.' },
          { label: 'Letra D — placenta prévia', detail: 'Sem sangramento ativo — vigilância.', correct: 'Suspeita de trombose exige urgência — E.' },
          { label: 'Letra B — isoimunização Rh', detail: 'Histórico de gestação anterior — não urgência aguda.', correct: 'Investigar no pré-natal — emergência aguda é TVP.' },
          { label: 'Pegadinha DMG', detail: 'Confundir crônico com emergência.', correct: 'Trombose venosa profunda — letra E.' },
        ],
        footer_rule: 'Agudo × crônico',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulplan-enfermagem-saude-da-mulher-1777104235003-5': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — alto risco: tabaco, álcool e drogas; pegadinha limiar IMC nas alternativas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Alto risco — gestação atual',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Condições clínicas de maior risco identificáveis na gestação atual.', icon: 'Target' },
          { label: 'Substâncias (D)', detail: 'Uso abusivo de tabaco, álcool ou outras drogas.', icon: 'Ban' },
          { label: 'Pegadinha limiar IMC', detail: 'Alternativas B/C usam cortes de IMC incorretos para a prova.', icon: 'AlertTriangle' },
          { label: 'Idade extrema (A)', detail: 'Menor de 15 ou maior de 35 anos — fator válido, mas não é o gabarito aqui.', icon: 'Calendar' },
        ],
        footer_rule: 'Tabaco/álcool/drogas → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Fatores de alto risco',
        meta: slideMeta,
        content: 'GESTAÇÃO DE RISCO',
        rows: [
          { label: 'Comportamental', value: 'Tabaco, álcool e drogas ilícitas', badge: 'hot', emphasis: 'highlight' },
          { label: 'Idade', value: 'Adolescente ou idade materna avançada', badge: 'info' },
          { label: 'IMC', value: 'Obesidade ou baixo peso — limiares corretos no AB 32', badge: 'warn' },
          { label: 'Pegadinha', value: 'Limiar IMC errado na alternativa', badge: 'warn' },
        ],
        footer_rule: 'Uso abusivo de substâncias → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar fator de alto risco na gestação atual.',
          'Testar A — idades extremas: fator válido, mas não fecha gabarito.',
          'Eliminar B — obesidade com limiar IMC inadequado na alternativa.',
          'Eliminar C — baixo peso com limiar IMC inadequado.',
          'Testar D — uso abusivo de tabaco, álcool ou drogas.',
          'Marcar letra D.',
        ],
        footer_rule: 'Substâncias → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ALTO RISCO',
        items: [
          { label: 'Pegadinha limiar IMC', detail: 'Cortes antropométricos incorretos nas letras B e C.', correct: 'Uso abusivo de substâncias — letra D.' },
          { label: 'Letra B — obesidade', detail: 'Limiar de IMC não confere com alternativa.', correct: 'Tabaco, álcool e drogas — D.' },
          { label: 'Letra C — baixo peso', detail: 'Corte de IMC inadequado na prova.', correct: 'Fator comportamental de alto risco — D.' },
          { label: 'Letra A — idade', detail: 'Fator válido, mas gabarito da questão é outro.', correct: 'Uso abusivo de tabaco/álcool/drogas — D.' },
        ],
        footer_rule: 'Limiar errado × substâncias',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulplan-enfermagem-saude-da-mulher-1777104335102-6': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — pré-eclâmpsia: edema + PA + proteinúria → encaminhar avaliação médica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pré-eclâmpsia — TE PSF',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Edema em MMII, hipertensão leve e proteinúria no pré-natal.', icon: 'AlertCircle' },
          { label: 'Conduta (D)', detail: 'Encaminhar imediatamente para avaliação médica.', icon: 'Ambulance' },
          { label: 'Pegadinha analgésico', detail: 'TE não administra analgésico por iniciativa — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha exercício/líquidos', detail: 'Exercício intenso ou mais líquidos não tratam pré-eclâmpsia.', icon: 'XCircle' },
        ],
        footer_rule: 'Tríade hipertensiva → referência',
      },
      {
        type: 'golden_rule',
        slide_title: 'TE — suspeita pré-eclâmpsia',
        meta: slideMeta,
        content: 'CONDUTA NA UBS',
        rows: [
          { label: 'Sinais', value: 'Edema + PA elevada + proteinúria', badge: 'hot' },
          { label: 'TE', value: 'Encaminhar para avaliação médica urgente', badge: 'hot', emphasis: 'highlight' },
          { label: 'Não fazer', value: 'Analgésico, diurético ou exercício por conta', badge: 'warn' },
          { label: 'Comunicar', value: 'Equipe e referência obstétrica', badge: 'info' },
        ],
        footer_rule: 'Encaminhar médico → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Gestante com edema, PA leve e proteinúria — suspeita pré-eclâmpsia.',
          'Eliminar A — analgésico por iniciativa do TE.',
          'Eliminar B — exercícios intensivos.',
          'Eliminar C — aumentar líquidos para edema.',
          'Testar D — encaminhar para avaliação médica imediata.',
          'Marcar letra D.',
        ],
        footer_rule: 'Referência médica → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRÉ-ECLÂMPSIA NA UBS',
        items: [
          { label: 'Letra A — analgésico', detail: 'TE não medicar por iniciativa.', correct: 'Encaminhar avaliação médica — D.' },
          { label: 'Letra B — exercício intenso', detail: 'Não reduz hipertensão gestacional.', correct: 'Risco de pré-eclâmpsia — referenciar — D.' },
          { label: 'Letra C — mais líquidos', detail: 'Edema gestacional não se trata com hidratação excessiva.', correct: 'Avaliação médica imediata — letra D.' },
          { label: 'Pegadinha analgésico paliativo', detail: 'Analgésico por iniciativa não substitui referência médica.', correct: 'Encaminhar gestante — D.' },
        ],
        footer_rule: 'Não paliativo — referenciar',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-jk-enfermagem-saude-da-mulher-1777104323066-3': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'MS — pré-eclâmpsia: vasoconstrição, resistência vascular, PA elevada e edema',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pré-eclâmpsia — fisiopatologia',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Caracterização fisiopatológica da pré-eclâmpsia gestacional.', icon: 'Target' },
          { label: 'Vasoconstrição (C)', detail: 'Substâncias vasoconstritoras, lesão endotelial, resistência vascular e edema.', icon: 'Activity' },
          { label: 'Pegadinha eclâmpsia', detail: 'Convulsão descreve eclâmpsia — não pré-eclâmpsia isolada — B.', icon: 'AlertTriangle' },
          { label: 'Pegadinha placenta prévia', detail: 'Inserção placentária baixa — outra patologia — D.', icon: 'XCircle' },
        ],
        footer_rule: 'Vasoconstrição + edema = pré-eclâmpsia',
      },
      {
        type: 'golden_rule',
        slide_title: 'Fisiopatologia — DHEG',
        meta: slideMeta,
        content: 'PRÉ-ECLÂMPSIA',
        rows: [
          { label: 'Mecanismo', value: 'Vasoconstrição e resistência vascular periférica', badge: 'hot', emphasis: 'highlight' },
          { label: 'PA', value: 'Elevação pressórica materna', badge: 'hot' },
          { label: 'Edema', value: 'Retenção hídrica e lesão endotelial', badge: 'info' },
          { label: 'Não é', value: 'Convulsão (eclâmpsia) ou placenta prévia', badge: 'warn' },
        ],
        footer_rule: 'Vascular + edema → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Pré-eclâmpsia = hipertensão + disfunção endotelial.',
          'Eliminar A — perda autorregulação intracraniana: quadro neurológico grave específico.',
          'Eliminar B — convulsão: define eclâmpsia, não pré-eclâmpsia.',
          'Testar C — vasoconstrição, resistência vascular, PA elevada e edema.',
          'Eliminar D — placenta prévia: patologia de inserção placentária.',
          'Marcar letra C.',
        ],
        footer_rule: 'Fisiopatologia vascular → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FISIOPATOLOGIA',
        items: [
          { label: 'Letra A — intracraniana', detail: 'Descreve hipertensão intracraniana/eclâmpsia grave.', correct: 'Mecanismo vascular periférico — letra C.' },
          { label: 'Pegadinha eclâmpsia', detail: 'Convulsão é eclâmpsia — estágio posterior.', correct: 'Vasoconstrição e edema — C.' },
          { label: 'Letra D — placenta prévia', detail: 'Patologia de implantação placentária.', correct: 'Pré-eclâmpsia = resistência vascular — C.' },
          { label: 'Letra B — convulsão', detail: 'Espasmos e convulsão definem eclâmpsia.', correct: 'Vasoconstrição e edema — mecanismo da pré-eclâmpsia — C.' },
          { label: 'Confundir com eclâmpsia', detail: 'Banca mistura síndromes hipertensivas.', correct: 'Substâncias vasoconstritoras — alternativa C.' },
        ],
        footer_rule: 'Pré-eclâmpsia ≠ eclâmpsia',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'legalle-enfermagem-processo-de-enfermagem-1780010579953-7': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS 2012) — PA em toda consulta de pré-natal para diagnóstico precoce de hipertensão',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hipertensão — pré-natal',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Síndromes hipertensivas na gestação e prevenção de morbimortalidade.', icon: 'Target' },
          { label: 'PA universal (B)', detail: 'Aferir pressão arterial em todas as consultas de pré-natal.', icon: 'HeartPulse' },
          { label: 'Pegadinha só alto risco', detail: 'PA não é só para gestantes com fator de risco — A falso.', icon: 'AlertTriangle' },
          { label: 'Pegadinha multípara', detail: 'Hipertensão não é exclusiva de multíparas — C falso.', icon: 'XCircle' },
        ],
        footer_rule: 'PA em toda consulta',
      },
      {
        type: 'golden_rule',
        slide_title: 'Monitorização — AB 32',
        meta: slideMeta,
        content: 'SÍNDROMES HIPERTENSIVAS',
        rows: [
          { label: 'PA', value: 'Aferir em toda consulta de pré-natal', badge: 'hot', emphasis: 'highlight' },
          { label: 'Objetivo', value: 'Diagnóstico precoce e redução de complicações', badge: 'hot' },
          { label: 'Fatores de risco', value: 'DM, doença renal, idade avançada influenciam', badge: 'info' },
          { label: 'Não é', value: 'PA só em alto risco ou pré-natal inútil', badge: 'warn' },
        ],
        footer_rule: 'Toda consulta → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Pré-eclâmpsia exige vigilância pressórica em toda consulta.',
          'Eliminar A — PA apenas com fator de risco.',
          'Testar B — aferição em todas as consultas de pré-natal.',
          'Eliminar C — hipertensão só em multíparas.',
          'Eliminar D — fatores de risco não influenciam.',
          'Eliminar E — pré-natal não reduz complicações.',
          'Marcar letra B.',
        ],
        footer_rule: 'PA universal → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIPERTENSÃO GESTACIONAL',
        items: [
          { label: 'Letra A — só alto risco', detail: 'PA é para todas as gestantes no pré-natal.', correct: 'Aferir em toda consulta — letra B.' },
          { label: 'Letra C — multíparas', detail: 'Nulíparas também desenvolvem pré-eclâmpsia.', correct: 'Monitorização universal — B.' },
          { label: 'Letra D — fatores irrelevantes', detail: 'DM e doença renal aumentam risco.', correct: 'PA em todas as consultas — B.' },
          { label: 'Letra E — pré-natal inútil', detail: 'Pré-natal reduz morbimortalidade hipertensiva.', correct: 'Diagnóstico precoce com PA serial — B.' },
        ],
        footer_rule: 'Vigilância universal',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const instruction = pack.cleanInstruction
      ? pack.cleanInstruction(raw.question_data.instruction)
      : raw.question_data.instruction;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: { ...raw.question_data, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sm-g08] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g08] total=${ok}`);
}

main();
