#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g14 (8 slugs parto P0).
 *
 *   npm run handcraft:saude-da-mulher-g14
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g14 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g14';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const AB32_SOURCE = {
  id: 'caderno-ab-32-prenatal',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 32 — Atenção ao pré-natal de baixo risco',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: ['puerpério', 'consulta pós-parto', 'trauma perineal', 'HPP'],
};

const OMS_PARTO_SOURCE = {
  id: 'oms-parto-humanizado',
  tier: 'A' as const,
  issuer: 'OMS / MS — PNH',
  title: 'Recomendações OMS — parto humanizado e cuidados intraparto',
  year: 2018,
  url: 'https://www.who.int/publications/i/item/9789241550215',
  covers: [
    'posição vertical parto',
    'segunda fase trabalho de parto',
    'episiotomia não rotineira',
    'pré-parto',
  ],
};

const PF_SOURCE = {
  id: 'ms-planejamento-familiar',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica — Planejamento familiar / Lei esterilização',
  year: 2013,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_26_planejamento_familiar.pdf',
  covers: ['esterilização voluntária', 'laqueadura', 'prazo manifestação vontade', 'idade mínima'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: {
    instruction: string;
    text_fragment?: string;
    options: { id: string; text: string; is_correct: boolean }[];
  };
  modulo_slug?: string;
};

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis' | 'certo_errado';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  sources?: (typeof AB32_SOURCE | typeof OMS_PARTO_SOURCE | typeof PF_SOURCE)[];
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
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: pack.sources ?? [OMS_PARTO_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function cleanHppNoise(s: string): string {
  return s
    .replace(/500\s*mL/gi, 'volume-limite após parto vaginal')
    .replace(/1\.?000\s*mL/gi, 'volume-limite após cesárea')
    .replace(/24\s*horas/gi, 'período inicial pós-parto')
    .replace(/\s+/g, ' ')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'fgv-enfermagem-saude-da-mulher-1777104222222-6': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'MS/FEGO — trauma perineal: 2º grau = músculos perineais sem lesão do esfíncter anal',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Laceração perineal',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Pós-parto — lesão muscular perineal sem atingir esfíncter anal.', icon: 'Target' },
          { label: 'Segundo grau (B)', detail: 'Músculos perineais acometidos — esfíncter preservado.', icon: 'Layers' },
          { label: 'Pegadinha 1º grau', detail: 'Só pele/mucosa — não atinge músculo — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha esfíncter', detail: 'Terceiro/quarto grau envolvem esfíncter — C e D.', icon: 'XCircle' },
        ],
        footer_rule: 'Músculo sem esfíncter = 2º grau',
      },
      {
        type: 'golden_rule',
        slide_title: 'Graus — trauma perineal',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO',
        rows: [
          { label: '1º grau', value: 'Pele ou mucosa apenas', badge: 'info' },
          { label: '2º grau', value: 'Músculos perineais — esfíncter íntegro', badge: 'hot', emphasis: 'highlight' },
          { label: '3º grau', value: 'Esfíncter anal comprometido', badge: 'warn' },
          { label: '4º grau', value: 'Esfíncter e mucosa retal', badge: 'warn' },
        ],
        footer_rule: 'Sem esfíncter → segundo grau — B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trauma perineal — classificar grau pela profundidade.',
          'Eliminar A — primeiro grau: só superfície.',
          'Testar B — músculos sem esfíncter.',
          'Eliminar C — terceiro grau: esfíncter.',
          'Eliminar D — quarto grau: reto.',
          'Marcar letra B.',
        ],
        footer_rule: 'Músculo sem esfíncter → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GRAUS',
        items: [
          { label: 'Letra A — 1º grau', detail: 'Lesão superficial apenas.', correct: 'Músculos perineais sem esfíncter — letra B.' },
          { label: 'Letra C — 3º grau', detail: 'Exige lesão esfincteriana.', correct: 'Segundo grau no caso — gabarito B.' },
          { label: 'Letra D — 4º grau', detail: 'Atinge mucosa retal.', correct: 'Músculos sem esfíncter — marcar B.' },
          { label: 'Pegadinha esfíncter', detail: 'Confundir profundidade da laceração.', correct: 'Segundo grau — letra B.' },
        ],
        footer_rule: 'Profundidade define grau',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fgv-enfermagem-saude-da-mulher-1777104340484-3': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS — puerpério: consulta precoce pós-alta e acompanhamento até o 42º dia',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Puerpério — MS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Orientações pós-parto conforme protocolos do Ministério da Saúde.', icon: 'Target' },
          { label: 'Consulta precoce (A)', detail: 'Primeira consulta após alta e retorno até o 42º dia.', icon: 'Calendar' },
          { label: 'Pegadinha puerpério curto', detail: 'Assistência não encerra no primeiro mês — até 42º dia.', icon: 'Clock' },
          { label: 'Pegadinha lóquios', detail: 'Eliminação gradual — não desaparecem no 3º dia — B.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Acompanhamento até 42º dia',
      },
      {
        type: 'golden_rule',
        slide_title: 'Puerpério — conduta',
        meta: slideMeta,
        content: 'PUERPÉRIO MS',
        rows: [
          { label: 'Consulta', value: 'Precoce pós-alta e retorno até o 42º dia', badge: 'hot', emphasis: 'highlight' },
          { label: 'Amamentação', value: 'Início precoce na hora de ouro', badge: 'hot' },
          { label: 'Atividade', value: 'Deambulação orientada — não repouso absoluto prolongado', badge: 'info' },
          { label: 'Planejamento', value: 'Abordar contracepção no puerpério', badge: 'info' },
        ],
        footer_rule: 'Consulta precoce → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Puerpério — orientações MS.',
          'Testar A — consulta precoce e retorno até 42º dia.',
          'Eliminar B — lóquios no 3º dia.',
          'Eliminar C — amamentação só após descida do leite.',
          'Eliminar D — repouso absoluto prolongado.',
          'Eliminar E — adiar planejamento reprodutivo.',
          'Marcar letra A.',
        ],
        footer_rule: 'Consulta precoce e retorno até 42º dia — A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PUERPÉRIO',
        items: [
          { label: 'Letra B — lóquios', detail: 'Rubra e serosa persistem além do terceiro dia pós-parto.', correct: 'Lóquios não cessam tão cedo — consulta precoce é A.' },
          { label: 'Letra C — amamentação', detail: 'Peia precoce na hora de ouro é recomendação MS.', correct: 'Não aguardar descida do leite — gabarito A.' },
          { label: 'Letra D — repouso', detail: 'Deambulação puerperal é estimulada.', correct: 'Atividade gradual permitida — marcar A.' },
          { label: 'Letra E — planejamento', detail: 'Contracepção deve ser abordada no puerpério.', correct: 'Fertilidade pode retornar antes do desmame — A.' },
          { label: 'Pegadinha puerpério curto', detail: 'Acompanhamento vai além do primeiro mês.', correct: 'Retorno até o 42º dia — letra A.' },
        ],
        footer_rule: '42º dia = limite consulta',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'funatec-enfermagem-saude-da-mulher-1777104415052-1': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS/OMS — segunda fase do TP: suporte à expulsão; ocitocina conforme protocolo médico',
    sources: [OMS_PARTO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: '2ª fase — TP',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Ação de enfermagem adequada na fase expulsiva do parto normal.', icon: 'Target' },
          { label: 'Ocitocina (A)', detail: 'Estimular contrações uterinas na 2ª fase — conforme prova.', icon: 'Syringe' },
          { label: 'Pegadinha dilatação', detail: 'Monitorar dilatação é 1ª fase — B.', icon: 'AlertTriangle' },
          { label: 'Pegadinha episiotomia', detail: 'Episiotomia não é rotina — C.', icon: 'Ban' },
        ],
        footer_rule: 'Fase expulsiva — suporte uterino',
      },
      {
        type: 'golden_rule',
        slide_title: 'Fases — TP',
        meta: slideMeta,
        content: 'PARTO NORMAL',
        rows: [
          { label: '1ª fase', value: 'Dilatação cervical e progressão', badge: 'info' },
          { label: '2ª fase', value: 'Expulsão fetal — suporte e uterotônicos se indicados', badge: 'hot', emphasis: 'highlight' },
          { label: 'Não rotina', value: 'Episiotomia, fórceps ou vácuo sem indicação', badge: 'warn' },
          { label: 'Analgesia', value: 'Epidural é conduta médica — não ação típica do TE isolada', badge: 'info' },
        ],
        footer_rule: '2ª fase → ocitocina — A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Segunda fase do trabalho de parto — expulsão.',
          'Testar A — ocitocina para estimular contrações.',
          'Eliminar B — dilatação é primeira fase.',
          'Eliminar C — episiotomia de rotina.',
          'Eliminar D — analgesia epidural isolada.',
          'Eliminar E — fórceps ou vácuo.',
          'Marcar letra A.',
        ],
        footer_rule: 'Fase expulsiva → A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 2ª FASE',
        items: [
          { label: 'Letra B — dilatação', detail: 'Pertence à primeira fase.', correct: 'Ocitocina na expulsão — letra A.' },
          { label: 'Letra C — episiotomia', detail: 'OMS não recomenda rotina.', correct: 'Segunda fase — gabarito A.' },
          { label: 'Letra D — epidural', detail: 'Conduta anestésica médica.', correct: 'Estimular contrações — marcar A.' },
          { label: 'Letra E — fórceps', detail: 'Instrumentalização obstétrica.', correct: 'Ocitocina conforme prova — A.' },
        ],
        footer_rule: 'Distinguir fases do TP',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'funatec-enfermagem-saude-da-mulher-1777104415052-4': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'OMS/PNH — posição vertical ou cócoras favorece progressão e alívio da dor',
    roi_error: 'parto_supina_expulsivo',
    sources: [OMS_PARTO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Posição — TP',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Posição que facilita progressão do TP e alívio da dor.', icon: 'Target' },
          { label: 'Cócoras (C)', detail: 'Posição vertical — gravidade auxilia descida fetal.', icon: 'ArrowDown' },
          { label: 'Pegadinha supina', detail: 'Dorsal supina dificulta progressão — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha litotomia', detail: 'Litotomia é posição médica clássica — não humanização — B.', icon: 'XCircle' },
        ],
        footer_rule: 'Vertical > supina no TP',
      },
      {
        type: 'golden_rule',
        slide_title: 'Posições — parto',
        meta: slideMeta,
        content: 'PARTO HUMANIZADO',
        rows: [
          { label: 'Favorecem', value: 'Cócoras, vertical, lateral ativa', badge: 'hot', emphasis: 'highlight' },
          { label: 'Evitar', value: 'Supina fixa e litotomia rotineira', badge: 'warn' },
          { label: 'Benefício', value: 'Progressão do TP e analgesia não farmacológica', badge: 'info' },
        ],
        footer_rule: 'Posição vertical humanizada — cócoras — C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trabalho de parto — escolher posição materna.',
          'Eliminar A — supina.',
          'Eliminar B — litotomia.',
          'Testar C — cócoras.',
          'Eliminar D — lateral passiva isolada.',
          'Eliminar E — sentada sem mobilidade.',
          'Marcar letra C.',
        ],
        footer_rule: 'Posição vertical humanizada — cócoras — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — POSIÇÃO',
        items: [
          { label: 'Letra A — supina', detail: 'Reduz abertura pélvica e dificulta expulsão fetal.', correct: 'Supina fixa contraria humanização — preferir cócoras.' },
          { label: 'Letra B — litotomia', detail: 'Posição passiva comum em sala cirúrgica.', correct: 'Litotomia não é posição de alívio ativo — gabarito C.' },
          { label: 'Letra D — lateral', detail: 'Útil em alguns casos mas banca prioriza vertical.', correct: 'Lateral passiva é inferior à cócoras nesta questão.' },
          { label: 'Letra E — sentada', detail: 'Sem abertura pélvica ampla como cócoras.', correct: 'Sentada limita progressão — marcar C.' },
          { label: 'Pegadinha supina', detail: 'OMS desaconselha dorsal fixa no expulsivo.', correct: 'Cócoras facilita trabalho de parto — letra C.' },
        ],
        footer_rule: 'Humanização vertical',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fundatec-enfermagem-saude-da-mulher-1777104382533-8': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS/Lei 14.443/2022 — esterilização voluntária: idade mínima e prazo de manifestação de vontade',
    sources: [PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Laqueadura — lei',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Requisitos legais da esterilização voluntária no SUS.', icon: 'Target' },
          { label: 'Idade mínima (A)', detail: 'Capacidade civil plena — idade mínima atualizada na lei.', icon: 'Scale' },
          { label: 'Pegadinha cônjuge', detail: 'Consentimento do parceiro não é mais exigido — E.', icon: 'AlertTriangle' },
          { label: 'Pegadinha clampeamento', detail: 'Clampeamento tardio do cordão — tema distinto da laqueadura.', icon: 'Baby' },
        ],
        footer_rule: 'Lei atual — idade e prazo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Esterilização — SUS',
        meta: slideMeta,
        content: 'LAQUEADURA',
        rows: [
          { label: 'Idade', value: 'Mínima reduzida na lei vigente — 21 anos', badge: 'hot', emphasis: 'highlight' },
          { label: 'Prazo', value: 'Intervalo legal entre manifestação e cirurgia', badge: 'hot' },
          { label: 'Cônjuge', value: 'Consentimento do parceiro não é requisito', badge: 'warn' },
          { label: 'Reversão', value: 'Possível — não é irreversível por definição', badge: 'info' },
        ],
        footer_rule: '21 anos capacidade plena → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Laqueadura tubária — requisitos legais.',
          'Testar A — idade mínima atualizada.',
          'Eliminar B — reversão é possível.',
          'Eliminar C — critério de filhos/idade desatualizado.',
          'Eliminar D — prazo de manifestação incorreto.',
          'Eliminar E — autorização do cônjuge.',
          'Marcar letra A.',
        ],
        footer_rule: 'Lei vigente → A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LAQUEADURA',
        items: [
          { label: 'Letra B — irreversível', detail: 'Reversão tubária existe com baixa taxa de sucesso.', correct: 'Procedimento não é irreversível por definição — A certa.' },
          { label: 'Letra C — 3 filhos', detail: 'Critério antigo da lei de esterilização.', correct: 'Idade mínima atualizada na lei vigente — gabarito A.' },
          { label: 'Letra D — prazo parto', detail: 'Intervalo entre manifestação e cesárea segue prazo legal maior.', correct: 'Prazo legal não é abreviado — marcar A.' },
          { label: 'Letra E — cônjuge', detail: 'Autonomia da pessoa — sem consentimento do parceiro.', correct: 'Esterilização voluntária individual — letra A.' },
          { label: 'Pegadinha clampeamento', detail: 'Clampeamento tardio do cordão é tema de puerpério imediato.', correct: 'Idade mínima na lei vigente — gabarito A.' },
        ],
        footer_rule: 'Lei 14.443/2022',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'gama-enfermagem-saude-da-mulher-1777104382533-1': {
    family: 'certo_errado',
    branch: 'mulher_parto',
    guideline: 'MS/OMS — pré-parto: vigilância fetal e hidratação conforme necessidade clínica',
    exam_vs_current: 'gama_hidratacao_vs_deambulacao_oms',
    sources: [OMS_PARTO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pré-parto — condutas',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Conduta prioritária da enfermagem no pré-parto.', icon: 'Target' },
          { label: 'Hidratação venosa (C)', detail: 'Iniciar venosa rotineiramente — gabarito da prova.', icon: 'Droplet' },
          { label: 'Pegadinha CTG universal', detail: 'Vigilância fetal não deve ser negligenciada — A falsa.', icon: 'AlertTriangle' },
          { label: 'Pegadinha vertical', detail: 'Deambulação e posição vertical ajudam TP — D é conduta OMS.', icon: 'XCircle' },
        ],
        footer_rule: 'Gabarito prova → hidratação venosa',
      },
      {
        type: 'golden_rule',
        slide_title: 'Pré-parto — enfermagem',
        meta: slideMeta,
        content: 'CUIDADOS PRÉ-PARTO',
        rows: [
          { label: 'Prova (C)', value: 'Hidratação venosa rotineira — gabarito banca', badge: 'hot', emphasis: 'highlight' },
          { label: 'OMS', value: 'Deambulação e posições verticais favorecem TP', badge: 'info' },
          { label: 'Vigilância', value: 'Monitorar BCF e progressão do TP', badge: 'info' },
          { label: 'Pegadinha', value: 'Não suspender vigilância fetal por “ansiedade”', badge: 'warn' },
        ],
        footer_rule: 'Conforme prova → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Pré-parto — conduta correta segundo a banca.',
          'Eliminar A — negligenciar BCF.',
          'Eliminar B — intervalo fixo sem individualizar.',
          'Testar C — hidratação venosa rotineira.',
          'Eliminar D — deambulação (conduta OMS, não gabarito).',
          'Marcar letra C.',
        ],
        footer_rule: 'Gabarito prova → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRÉ-PARTO',
        items: [
          { label: 'Letra A — sem BCF', detail: 'Vigilância fetal é essencial.', correct: 'Hidratação venosa rotineira — letra C.' },
          { label: 'Letra B — dilatação fixa', detail: 'Avaliação individualizada.', correct: 'Gabarito da banca — C.' },
          { label: 'Letra D — deambulação', detail: 'OMS recomenda vertical — diverge da prova.', correct: 'Marcar C conforme gabarito.' },
          { label: 'Pegadinha CTG universal', detail: 'Não omitir monitorização fetal.', correct: 'Hidratação venosa — letra C.' },
        ],
        footer_rule: 'Prova × OMS registrada',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'iaupe-enfermagem-saude-da-mulher-1777104288275-1': {
    family: 'vf',
    branch: 'mulher_parto',
    guideline: 'MS/Caderno AB 26 — esterilização voluntária e laqueadura (Lei 14.443/2022)',
    sources: [PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Laqueadura — VF SUS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Esterilização voluntária — ligadura tubária, manifestação de vontade no SUS.', icon: 'Target' },
          { label: 'II e IV (B)', detail: 'Prazo entre manifestação e ato cirúrgico; laqueadura na cesárea.', icon: 'CheckCircle' },
          { label: 'Pegadinha cônjuge', detail: 'III exige consentimento de cônjuges — falso na lei atual.', icon: 'AlertTriangle' },
          { label: 'Pegadinha idade', detail: 'I cita idade mínima e filhos vivos desatualizados — falso.', icon: 'XCircle' },
        ],
        footer_rule: 'Manifestação de vontade e laqueadura no parto',
      },
      {
        type: 'golden_rule',
        slide_title: 'Laqueadura — requisitos',
        meta: slideMeta,
        content: 'ESTERILIZAÇÃO VOLUNTÁRIA',
        rows: [
          { label: 'Prazo', value: 'Intervalo mínimo entre manifestação de vontade e cirurgia', badge: 'hot', emphasis: 'highlight' },
          { label: 'Cesárea', value: 'Laqueadura tubária no parto se requisitos legais atendidos', badge: 'hot' },
          { label: 'Cônjuge', value: 'Consentimento de cônjuges não é exigido', badge: 'warn' },
          { label: 'Capacidade', value: 'Civil plena — critério de idade atualizado na lei', badge: 'warn' },
        ],
        footer_rule: 'Itens II e IV corretos — combinação B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Laqueadura tubária — esterilização voluntária no SUS.',
          'Julgar I — capacidade civil e idade mínima 25 anos ou filhos → falso.',
          'Julgar II — prazo entre manifestação de vontade e cirurgia → verdadeiro.',
          'Julgar III — consentimento expresso de cônjuges → falso.',
          'Julgar IV — laqueadura na cesárea sem cesáreas sucessivas → verdadeiro.',
          'Combinação correta: II e IV.',
          'Marcar letra B.',
        ],
        footer_rule: 'Prazo legal e laqueadura no parto — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LAQUEADURA VF',
        items: [
          { label: 'Letra A — I,II,III', detail: 'Inclui III falsa (cônjuge).', correct: 'II e IV corretos — letra B.' },
          { label: 'Letra C — I,II,IV', detail: 'Inclui I falsa (idade).', correct: 'Só II e IV — gabarito B.' },
          { label: 'Letra D — II,III', detail: 'III é falsa.', correct: 'II e IV — marcar B.' },
          { label: 'Letra E — só II', detail: 'Omite IV verdadeira.', correct: 'II e IV — letra B.' },
        ],
        footer_rule: 'Autonomia reprodutiva',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'iaupe-enfermagem-saude-da-mulher-1777104288275-4': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS/FEGO — HPP: alto risco inclui pré-eclâmpsia grave, placenta prévia e descolamento prematuro de placenta',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'HPP — alto risco',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Apenas fatores de alto risco para hemorragia pós-parto.', icon: 'Target' },
          { label: 'Gravidade obstétrica (B)', detail: 'Pré-eclâmpsia grave, placenta prévia e DPP.', icon: 'AlertTriangle' },
          { label: 'Pegadinha puerpério curto', detail: 'Estratificação contínua no ciclo gravídico-puerperal.', icon: 'Clock' },
          { label: 'Pegadinha mista', detail: 'Alternativas misturam moderado e alto risco — A, C, D, E.', icon: 'XCircle' },
        ],
        footer_rule: 'Só alto risco absoluto',
      },
      {
        type: 'golden_rule',
        slide_title: 'HPP — estratificação',
        meta: slideMeta,
        content: 'ALTO RISCO HPP',
        rows: [
          { label: 'Alto risco', value: 'Pré-eclâmpsia grave, placenta prévia, DPP', badge: 'hot', emphasis: 'highlight' },
          { label: 'Moderado', value: 'Anemia, mioma, macrossomia, multiparidade isolada', badge: 'warn' },
          { label: 'Vigilância', value: 'Estratificação em todo ciclo gravídico-puerperal', badge: 'info' },
          { label: 'Equipe', value: 'Todos os profissionais obstétricos preparados', badge: 'info' },
        ],
        footer_rule: 'Gravidade placentária → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'HPP — selecionar só alto risco.',
          'Eliminar A — obesidade e corioamnionite mistos.',
          'Testar B — pré-eclâmpsia grave, placenta prévia, DPP.',
          'Eliminar C — anemia e mioma moderados.',
          'Eliminar D — polidrâmnio e multiparidade.',
          'Eliminar E — cesárea prévia e RCIU mistos.',
          'Marcar letra B.',
        ],
        footer_rule: 'Alto risco grave → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HPP',
        items: [
          { label: 'Letra A — obesidade', detail: 'Fator associado mas mistura corioamnionite e falta de pré-natal.', correct: 'Obesidade isolada não compõe trio de alto risco absoluto.' },
          { label: 'Letra C — anemia', detail: 'Anemia gestacional é fator moderado frequente.', correct: 'Mioma e macrossomia não elevam ao mesmo nível que DPP.' },
          { label: 'Letra D — multiparidade', detail: 'Multiparidade e polidrâmnio são fatores moderados.', correct: 'Malformação uterina não fecha lista só de alto risco.' },
          { label: 'Letra E — cesárea prévia', detail: 'Mistura RCIU e história de HPP com fatores moderados.', correct: 'Cesárea prévia isolada não equivale a placenta prévia.' },
          { label: 'Pegadinha puerpério curto', detail: 'Estratificação contínua no ciclo gravídico-puerperal.', correct: 'Pré-eclâmpsia grave, placenta prévia e DPP — B.' },
        ],
        footer_rule: 'DPP + placenta prévia',
      },
    ],
    cleanInstruction: cleanHppNoise,
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
    console.log(`[handcraft:sm-g14] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g14] total=${ok}`);
}

main();
