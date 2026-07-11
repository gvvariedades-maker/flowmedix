#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g21 (8 slugs papanicolau P0).
 *
 *   npm run handcraft:saude-da-mulher-g21
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g21 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g21';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const INCA_SOURCE = {
  id: 'inca-rastreio-colo',
  tier: 'A' as const,
  issuer: 'INCA / MS',
  title: 'Diretrizes para o rastreamento do câncer do colo do útero',
  year: 2016,
  url: 'https://www.inca.gov.br/publicacoes/livros/diretrizes-para-o-rastreamento-do-cancer-do-colo-do-utero',
  covers: ['25-64 anos', 'citologia', 'Papanicolau', 'HPV', 'busca ativa'],
};

const PF_SOURCE = {
  id: 'ms-planejamento-familiar',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo de Atenção à Saúde das Mulheres — MS 2016',
  year: 2016,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_atencao_saude_mulheres.pdf',
  covers: ['atenção primária', 'educação em saúde', 'prevenção câncer'],
};

const COFEN_SOURCE = {
  id: 'cofen-resolucao-te',
  tier: 'A' as const,
  issuer: 'COFEN',
  title: 'Resoluções COFEN — atribuições do técnico de enfermagem',
  year: 2019,
  url: 'https://www.cofen.gov.br/',
  covers: ['técnico de enfermagem', 'atenção básica', 'educação em saúde'],
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

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto' | 'mulher_papanicolau';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis' | 'certo_errado';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  sources?: (typeof INCA_SOURCE | typeof PF_SOURCE | typeof COFEN_SOURCE)[];
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
    sources: pack.sources ?? [INCA_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\(__\)/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanParenToRoman(s: string): string {
  let n = 0;
  const romans = ['I', 'II', 'III', 'IV'];
  return cleanPdfNoise(s).replace(/\(\s*\)/g, () => {
    const r = romans[n++] ?? String(n);
    return `\n${r} -`;
  });
}

const SPECS: Record<string, Pack> = {
  'instituto-consulplan-enfermagem-saude-da-mulher-1777104235003-4': {
    family: 'protocolo',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS 2016 — rastreio colo: busca ativa na população-alvo; faixa 25–64 anos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Rastreio — estratégia',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Câncer cervical — maior potencial de prevenção com diagnóstico precoce; estratégia de rastreamento e lesões precursoras.',
            icon: 'Target',
          },
          { label: 'Busca ativa (A)', detail: 'População-alvo e exame citológico em atraso.', icon: 'Search' },
          { label: 'Pegadinha 15-64', detail: 'Faixa MS é 25 a 64 anos — não 15 — letra C.', icon: 'AlertTriangle' },
          { label: 'Pegadinha vacina HPV', detail: 'Vacina complementa — não substitui citologia — B.', icon: 'Syringe' },
        ],
        footer_rule: 'Busca ativa na população-alvo — A',
      },
      {
        type: 'golden_rule',
        slide_title: 'INCA — rastreio',
        meta: slideMeta,
        content: 'ESTRATÉGIA SUS',
        rows: [
          { label: 'Busca ativa', value: 'Mulheres na população-alvo com exame em atraso', badge: 'hot', emphasis: 'highlight' },
          { label: 'Faixa', value: '25 a 64 anos com vida sexual', badge: 'hot' },
          { label: 'Exame', value: 'Citopatologia (Papanicolau) periódica', badge: 'info' },
          { label: 'HPV', value: 'Vacina 9–14 anos — prevenção primária', badge: 'info' },
          { label: 'Preparo', value: 'Evitar relações e duchas antes do exame', badge: 'warn' },
        ],
        footer_rule: 'Organização do rastreio → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Rastreamento do câncer de colo — ação importante na estratégia.',
          'Testar A — busca ativa na população-alvo e exame em atraso.',
          'Eliminar B — vacina HPV 9–24 (prevenção, não organização do rastreio citológico).',
          'Eliminar C — faixa 15–64 anos (início aos 25).',
          'Eliminar D — preparo pré-exame (orientação válida, mas não a estratégia central).',
          'Marcar letra A.',
        ],
        footer_rule: 'Cobertura e busca ativa — A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — RASTREIO',
        items: [
          { label: 'Letra B — vacina HPV', detail: 'Imunização não organiza o rastreio citológico.', correct: 'Busca ativa na população-alvo — letra A.' },
          { label: 'Letra C — 15-64', detail: 'Início do rastreio aos 25 anos.', correct: 'Estratégia de cobertura — gabarito A.' },
          { label: 'Letra D — preparo', detail: 'Orientação individual de preparo citológico.', correct: 'Exame em atraso — marcar A.' },
          { label: 'Pegadinha trienal', detail: 'Periodicidade trienal após esquema inicial de anuais.', correct: 'População-alvo — letra A.' },
        ],
        footer_rule: 'INCA — organização do rastreio',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulplan-enfermagem-saude-da-mulher-1777104235003-7': {
    family: 'vf',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — mama e colo: fatores de risco × métodos de prevenção; Papanicolau trienal',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mama e colo — V/F',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Programas de câncer de colo e mama — julgar quatro afirmativas V ou F.', icon: 'Target' },
          { label: 'Ordem (A)', detail: 'V, V, V, F — gabarito da prova.', icon: 'CheckCircle' },
          { label: 'Pegadinha IV prevenção', detail: 'Múltiplos parceiros e gravidez tardia são risco — não prevenção.', icon: 'AlertTriangle' },
          { label: 'Pegadinha trienal', detail: 'Papanicolau a cada três anos é prevenção correta no item.', icon: 'Clock' },
        ],
        footer_rule: 'Item IV falso — confunde risco com prevenção',
      },
      {
        type: 'golden_rule',
        slide_title: 'Julgamento — I a IV',
        meta: slideMeta,
        content: 'V / F',
        rows: [
          { label: 'I', value: 'Mama — nódulo indolor, duro, irregular; também brando e glososo — V', badge: 'info' },
          { label: 'II', value: 'Mama — gravidez após 30, álcool, sedentarismo, radiação — V', badge: 'hot' },
          { label: 'III', value: 'Colo — ACO prolongado, sexo precoce, HPV — V', badge: 'hot' },
          { label: 'IV', value: 'Parceiros múltiplos e gravidez tardia como prevenção — F', badge: 'warn', emphasis: 'highlight' },
        ],
        footer_rule: 'I–IV: V,V,V,F → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Saúde da mulher — mama e colo — julgar afirmativas I a IV.',
          'Julgar I — sintomas do câncer de mama → verdadeiro.',
          'Julgar II — fatores de risco da mama → verdadeiro.',
          'Julgar III — fatores de risco do colo (HPV, ACO, sexo precoce) → verdadeiro.',
          'Julgar IV — parceiros múltiplos e gravidez tardia como prevenção → falso.',
          'Combinação V-V-V-F.',
          'Marcar letra A.',
        ],
        footer_rule: 'Prevenção ≠ fator de risco — A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VF MAMA/COLO',
        items: [
          { label: 'Letra B — V,V,F,F', detail: 'Aceita III falsa.', correct: 'HPV é fator de risco — letra A.' },
          { label: 'Letra C — V,F,V,V', detail: 'II e IV incorretos na sequência.', correct: 'V-V-V-F — gabarito A.' },
          { label: 'Letra D — todas V', detail: 'Item IV é falso.', correct: 'Trienal sim — prevenção — marcar A.' },
          { label: 'Pegadinha trienal', detail: 'Papanicolau trienal está correto no enunciado.', correct: 'Ordem V-V-V-F — letra A.' },
        ],
        footer_rule: 'Distinguir risco de prevenção',
      },
    ],
    cleanInstruction: cleanParenToRoman,
  },

  'instituto-consulplan-enfermagem-saude-da-mulher-1777104335102-7': {
    family: 'protocolo',
    branch: 'mulher_papanicolau',
    guideline: 'COFEN/MS — TE PSF: cuidado pelo plano do enfermeiro; não consulta nem tratamento autônomo',
    sources: [INCA_SOURCE, COFEN_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TE PSF — rastreio',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'HPV e lesões precursoras — atribuição do técnico de enfermagem PSF no rastreamento do câncer de colo.',
            icon: 'Target',
          },
          { label: 'Plano assistencial (C)', detail: 'Cuidado norteado pelo plano do enfermeiro e prevenção de riscos.', icon: 'ClipboardList' },
          { label: 'Pegadinha consulta', detail: 'Consulta e solicitação de exames — enfermeiro/médico — B.', icon: 'Ban' },
          { label: 'Pegadinha tratar', detail: 'Avaliar e tratar resultados — não atribuição do TE — A.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'TE executa plano — não prescreve',
      },
      {
        type: 'golden_rule',
        slide_title: 'TE — atribuições',
        meta: slideMeta,
        content: 'PSF — COLO',
        rows: [
          { label: 'TE faz', value: 'Cuidado pelo plano do enfermeiro + prevenção de riscos', badge: 'hot', emphasis: 'highlight' },
          { label: 'Enfermeiro', value: 'Consulta, solicitação e plano assistencial', badge: 'info' },
          { label: 'Não é TE', value: 'Tratar resultados ou abordagem sindrômica autônoma', badge: 'warn' },
          { label: 'Rastreio', value: 'Educação, apoio e encaminhamento conforme protocolo', badge: 'info' },
        ],
        footer_rule: 'Participar da prevenção → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Atribuição do TE PSF no rastreio do câncer de colo.',
          'Eliminar A — avaliar e tratar exames autonomamente.',
          'Eliminar B — consulta de enfermagem e solicitar exames.',
          'Testar C — cuidado pelo plano do enfermeiro e prevenção de fatores de risco.',
          'Eliminar D — coletar e tratar secreção com abordagem sindrômica.',
          'Marcar letra C.',
        ],
        footer_rule: 'Plano assistencial do enfermeiro — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TE PSF',
        items: [
          { label: 'Letra A — tratar', detail: 'Tratamento conforme protocolo é médico/enfermeiro.', correct: 'Plano do enfermeiro — letra C.' },
          { label: 'Letra B — consulta', detail: 'Consulta de enfermagem não é atribuição do técnico.', correct: 'Prevenção de riscos — gabarito C.' },
          { label: 'Letra D — sindrômica', detail: 'Coleta e tratamento autônomo — incorreto.', correct: 'Cuidado norteado — marcar C.' },
          { label: 'Pegadinha HPV', detail: 'HPV persistente — educação e encaminhamento na APS.', correct: 'Participar da prevenção — letra C.' },
        ],
        footer_rule: 'Escopo do técnico na APS',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-verbena-enfermagem-processo-de-enfermagem-1780009310940-0': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — faixa etária citopatológica: 25 a 64 anos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Faixa etária — MS',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Papanicolau — citopatologia do colo — faixa etária recomendada pelo Ministério da Saúde.',
            icon: 'Target',
          },
          { label: '25-64 (B)', detail: 'População-alvo do rastreio citológico no SUS.', icon: 'Calendar' },
          { label: 'Pegadinha anual universal', detail: 'Periodicidade trienal após esquema inicial — não anual isolado.', icon: 'Clock' },
          { label: 'Pegadinha 18-64', detail: 'Início aos 25 anos — não 18 — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha 29-59', detail: 'Recorte etário incompleto — C.', icon: 'XCircle' },
        ],
        footer_rule: 'MS: 25 a 64 anos — B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Citologia — perfil',
        meta: slideMeta,
        content: 'FAIXA ETÁRIA',
        rows: [
          { label: 'SUS/INCA', value: '25 a 64 anos', badge: 'hot', emphasis: 'highlight' },
          { label: 'Início', value: 'Aos 25 anos após início da vida sexual', badge: 'hot' },
          { label: 'Término', value: 'Até 64 anos na política brasileira', badge: 'info' },
          { label: 'Não é', value: '18–64, 29–59 ou 30–80 isolados', badge: 'warn' },
        ],
        footer_rule: 'Preventivo — 25–64 → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Faixa etária do exame citopatológico — MS.',
          'Eliminar A — 18 a 64 anos.',
          'Testar B — 25 a 64 anos.',
          'Eliminar C — 29 a 59 anos.',
          'Eliminar D — 30 a 80 anos.',
          'Marcar letra B.',
        ],
        footer_rule: 'População-alvo SUS — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FAIXA',
        items: [
          { label: 'Letra A — 18-64', detail: 'Marco de início aos 25 anos.', correct: '25 a 64 anos — letra B.' },
          { label: 'Letra C — 29-59', detail: 'Omite mulheres de 25–28 e 60–64.', correct: 'Citopatologia MS — gabarito B.' },
          { label: 'Letra D — 30-80', detail: 'Teto de rastreio até 64 anos.', correct: 'Faixa SUS — marcar B.' },
          { label: 'Pegadinha trienal', detail: 'Periodicidade trienal após esquema inicial.', correct: '25–64 anos — letra B.' },
        ],
        footer_rule: 'Marco etário do rastreio',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'legalle-enfermagem-processo-de-enfermagem-1780010917301-0': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — principal fator de risco câncer de colo: infecção persistente por HPV',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Fator de risco — HPV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Neoplasia maligna incidente nas regiões Norte Nordeste Centro-Oeste Sul Sudeste — mortalidade — detecção precoce citopatológico colo — principal fator de risco.',
            icon: 'Target',
          },
          { label: 'HPV (C)', detail: 'Papilomavírus humano — infecção persistente.', icon: 'Microscope' },
          { label: 'Pegadinha genética', detail: 'Herança exclusiva — não é principal — A.', icon: 'Ban' },
          { label: 'Pegadinha vacina HPV', detail: 'Vacina previne — não substitui rastreio citológico.', icon: 'Syringe' },
        ],
        footer_rule: 'HPV oncogênico — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Etiologia — colo',
        meta: slideMeta,
        content: 'FATOR DE RISCO',
        rows: [
          { label: 'Principal', value: 'Infecção persistente por HPV', badge: 'hot', emphasis: 'highlight' },
          { label: 'Subtipos', value: 'Oncogênicos 16 e 18', badge: 'hot' },
          { label: 'Rastreio', value: 'Citopatologia detecta lesões precursoras', badge: 'info' },
          { label: 'Não é', value: 'Genética exclusiva, antibióticos ou estresse isolado', badge: 'warn' },
        ],
        footer_rule: 'HPV persistente → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Principal fator de risco do câncer de colo do útero.',
          'Eliminar A — herança genética exclusiva.',
          'Eliminar B — antibióticos prolongados.',
          'Testar C — infecção pelo papilomavírus humano (HPV).',
          'Eliminar D — estresse emocional prolongado.',
          'Marcar letra C.',
        ],
        footer_rule: 'Etiologia viral — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ETIOLOGIA',
        items: [
          { label: 'Letra A — genética', detail: 'Câncer cervical é associado ao HPV.', correct: 'Infecção por HPV — letra C.' },
          { label: 'Letra B — antibióticos', detail: 'Não é causa direta do câncer de colo.', correct: 'Papilomavírus — gabarito C.' },
          { label: 'Letra D — estresse', detail: 'Fator psicossocial — não etiologia principal.', correct: 'HPV persistente — marcar C.' },
          { label: 'Pegadinha vacina HPV', detail: 'Vacina não elimina necessidade de citologia.', correct: 'Principal fator HPV — letra C.' },
        ],
        footer_rule: 'Infecção viral persistente',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-9': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — causa principal câncer de colo: HPV persistente oncogênico (16, 18)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Causa — HPV',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Câncer de colo — causas e fatores de risco — alternativa correta.', icon: 'Target' },
          { label: 'HPV oncogênico (C)', detail: 'Infecção persistente — subtipos 16 e 18.', icon: 'Microscope' },
          { label: 'Pegadinha bacteriana', detail: 'Infecção bacteriana de repetição — não causa principal — A.', icon: 'Ban' },
          { label: 'Pegadinha ACO isolado', detail: 'Anticoncepcional oral não é causa direta isolada — D.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'HPV 16/18 — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Etiologia — SUS',
        meta: slideMeta,
        content: 'HPV PERSISTENTE',
        rows: [
          { label: 'Causal', value: 'HPV persistente — subtipos oncogênicos 16 e 18', badge: 'hot', emphasis: 'highlight' },
          { label: 'Transmissão', value: 'Principalmente via sexual', badge: 'info' },
          { label: 'Cofatores', value: 'Tabagismo, imunossupressão, ACO prolongado', badge: 'info' },
          { label: 'Não é', value: 'Bactérias, hereditariedade isolada ou ACO como causa única', badge: 'warn' },
        ],
        footer_rule: 'Infecção viral — C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Causas e fatores de risco do câncer de colo.',
          'Eliminar A — infecções bacterianas de repetição.',
          'Eliminar B — hereditariedade como principal fator.',
          'Testar C — HPV persistente oncogênico 16 e 18.',
          'Eliminar D — anticoncepcional oral como causa direta isolada.',
          'Marcar letra C.',
        ],
        footer_rule: 'Oncogênicos 16/18 — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CAUSA',
        items: [
          { label: 'Letra A — bactérias', detail: 'Etiologia viral — não bacteriana primária.', correct: 'HPV oncogênico — letra C.' },
          { label: 'Letra B — hereditariedade', detail: 'Não é o principal fator causal.', correct: 'Subtipos 16 e 18 — gabarito C.' },
          { label: 'Letra D — ACO isolado', detail: 'Cofator — não causa direta única.', correct: 'Infecção persistente — marcar C.' },
          { label: 'Pegadinha vacina HPV', detail: 'Vacina complementa prevenção primária.', correct: 'HPV persistente — letra C.' },
        ],
        footer_rule: 'Papilomavírus oncogênico',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ms-sarmento-enfermagem-saude-da-mulher-1777104301763-4': {
    family: 'conceito',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — primeiro Papanicolau aos 25 anos após início da vida sexual',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Primeiro exame — idade',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Papiloma vírus sexualmente transmissível — preventivo Papanicolau lesões pré-cancerosas — vacina calendário nove quatorze anos doses seis meses — primeiro exame após vida sexual.',
            icon: 'Target',
          },
          { label: '25 anos (B)', detail: 'Marco MS/INCA para início do rastreio citológico.', icon: 'Calendar' },
          { label: 'Pegadinha inicio 40', detail: 'Não iniciar aos 30 ou 35 isolados — C e D.', icon: 'AlertTriangle' },
          { label: 'Pegadinha vacina HPV', detail: 'Vacina 9–14 anos — não substitui citologia aos 25.', icon: 'Syringe' },
        ],
        footer_rule: 'Primeiro exame aos 25 anos — B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Início — rastreio',
        meta: slideMeta,
        content: 'PRIMEIRO PAPELANICOLAU',
        rows: [
          { label: 'Idade', value: '25 anos após início da vida sexual', badge: 'hot', emphasis: 'highlight' },
          { label: 'Faixa', value: 'Rastreio até 64 anos', badge: 'info' },
          { label: 'Vacina HPV', value: '9–14 anos — duas doses intervalo seis meses', badge: 'info' },
          { label: 'Não é', value: '20, 30 ou 35 anos como marco único do SUS', badge: 'warn' },
        ],
        footer_rule: 'Vida sexual + 25 anos → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Primeiro exame preventivo após início da vida sexual ativa.',
          'Eliminar A — 20 anos.',
          'Testar B — 25 anos.',
          'Eliminar C — 30 anos.',
          'Eliminar D — 35 anos.',
          'Marcar letra B.',
        ],
        footer_rule: 'Marco etário INCA — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INÍCIO',
        items: [
          { label: 'Letra A — 20 anos', detail: 'Política brasileira inicia aos 25.', correct: '25 anos — letra B.' },
          { label: 'Letra C — 30 anos', detail: 'Atraso desnecessário do rastreio.', correct: 'Após vida sexual — gabarito B.' },
          { label: 'Letra D — 35 anos', detail: 'Muito tardio para primeiro exame.', correct: 'Marco MS/INCA — marcar B.' },
          { label: 'Pegadinha trienal', detail: 'Periodicidade trienal após anuais normais.', correct: 'Início aos 25 — letra B.' },
        ],
        footer_rule: 'Detecção precoce — 25 anos',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-atencao-basica-saude-da-familia-1778968357339-4': {
    family: 'protocolo',
    branch: 'mulher_papanicolau',
    guideline: 'COFEN/MS — TE na AB: educação em saúde na prevenção do câncer de colo',
    sources: [INCA_SOURCE, COFEN_SOURCE, PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TE AB — prevenção',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Técnico de enfermagem na atenção básica — prevenção do câncer do colo do útero — atribuição correta.',
            icon: 'Target',
          },
          { label: 'Educação (C)', detail: 'Contribuir, participar e realizar educação em saúde.', icon: 'GraduationCap' },
          { label: 'Pegadinha plano', detail: 'Elaborar plano assistencial — enfermeiro — A.', icon: 'Ban' },
          { label: 'Pegadinha consulta', detail: 'Consulta de enfermagem com enfoque em riscos — E.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'TE educa — não prescreve plano',
      },
      {
        type: 'golden_rule',
        slide_title: 'TE — atribuições AB',
        meta: slideMeta,
        content: 'ATENÇÃO BÁSICA',
        rows: [
          { label: 'TE faz', value: 'Educação em saúde e participação nas ações preventivas', badge: 'hot', emphasis: 'highlight' },
          { label: 'Enfermeiro', value: 'Plano assistencial e consulta de enfermagem', badge: 'info' },
          { label: 'Equipe', value: 'Encaminhamento e gerenciamento conforme protocolo', badge: 'info' },
          { label: 'Não é TE', value: 'Elaborar plano ou consulta privativa de enfermagem', badge: 'warn' },
        ],
        footer_rule: 'Educação em saúde → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Atribuições do técnico na prevenção do câncer de colo na AB.',
          'Eliminar A — elaborar plano assistencial.',
          'Eliminar B — gerenciar insumos da citologia.',
          'Testar C — contribuir e realizar educação em saúde.',
          'Eliminar D — encaminhamento (papel da equipe, não única atribuição do TE).',
          'Eliminar E — consulta de enfermagem com identificação de riscos.',
          'Marcar letra C.',
        ],
        footer_rule: 'Promoção e educação — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TE AB',
        items: [
          { label: 'Letra A — plano', detail: 'Plano assistencial é do enfermeiro.', correct: 'Educação em saúde — letra C.' },
          { label: 'Letra B — insumos', detail: 'Gerenciamento não é atribuição exclusiva do TE.', correct: 'Atividades educativas — gabarito C.' },
          { label: 'Letra D — encaminhar', detail: 'Encaminhamento é ação interprofissional.', correct: 'Participar da educação — marcar C.' },
          { label: 'Letra E — consulta', detail: 'Consulta de enfermagem — enfermeiro.', correct: 'Prevenção do colo — letra C.' },
        ],
        footer_rule: 'Escopo do técnico na ESF',
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
    const { text_fragment: _drop, ...questionRest } = raw.question_data;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: { ...questionRest, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sm-g21] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g21] total=${ok}`);
}

main();
