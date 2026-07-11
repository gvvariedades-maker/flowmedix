#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g22 (8 slugs mulher_mama P0).
 *
 *   npm run handcraft:saude-da-mulher-g22
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g22 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g22';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const INCA_MAMA_SOURCE = {
  id: 'inca-rastreio-mama',
  tier: 'A' as const,
  issuer: 'INCA / MS',
  title: 'Diretrizes para detecção precoce do câncer de mama no Brasil',
  year: 2015,
  url: 'https://www.inca.gov.br/publicacoes/livros/diretrizes-para-deteccao-precoce-do-cancer-de-mama-no-brasil',
  covers: ['50-69 anos', 'mamografia bienal', 'início aos 50 anos', 'autoexame complementar'],
};

const OMS_AM_SOURCE = {
  id: 'oms-am-exclusiva',
  tier: 'A' as const,
  issuer: 'OMS / MS',
  title: 'Política Nacional de Aleitamento Materno',
  year: 2015,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/politica_nacional_de_aleitamento_materno.pdf',
  covers: ['aleitamento exclusivo', '6 meses', 'puerpério', 'primeira hora de vida'],
};

const MS_NOTA_MAMA_SOURCE = {
  id: 'ms-nota-626-mamografia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Nota Técnica 626/2025 — acesso à mamografia no SUS',
  year: 2025,
  url: 'https://www.gov.br/saude/',
  covers: ['sinais suspeitos', 'referência urgente', 'nódulo endurecido'],
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

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto' | 'mulher_papanicolau' | 'mulher_mama';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis' | 'certo_errado';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  sources?: (typeof INCA_MAMA_SOURCE | typeof OMS_AM_SOURCE | typeof MS_NOTA_MAMA_SOURCE)[];
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
    sources: pack.sources ?? [INCA_MAMA_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\(__\)/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'ameosc-enfermagem-saude-da-mulher-1777104306781-6': {
    family: 'protocolo',
    branch: 'mulher_mama',
    guideline: 'OMS/MS — aleitamento materno exclusivo até os 6 meses; primeira mamada na primeira hora',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Amamentação — puerpério',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Primeira semana pós-parto — orientação sobre amamentação ao seio.', icon: 'Target' },
          { label: 'Exclusiva 6m (A)', detail: 'Aleitamento materno exclusivo até os 6 meses — OMS/MS.', icon: 'Baby' },
          { label: 'Pegadinha mamadeira', detail: 'Mamadeira não é incentivada no início — B.', icon: 'Ban' },
          { label: 'Pegadinha puerperio', detail: 'Consulta puerpéral aos 42º dia — acompanhamento materno.', icon: 'Calendar' },
        ],
        footer_rule: 'Exclusivo até 6 meses — A',
      },
      {
        type: 'golden_rule',
        slide_title: 'AM — recomendação',
        meta: slideMeta,
        content: 'ALEITAMENTO',
        rows: [
          { label: 'Exclusivo', value: 'Até os 6 meses de vida', badge: 'hot', emphasis: 'highlight' },
          { label: 'Início', value: 'Primeira hora de vida — pele a pele', badge: 'hot' },
          { label: 'Livre demanda', value: 'Sem horários rígidos — sinais do bebê', badge: 'info' },
          { label: 'Não é', value: 'Mamadeira rotineira ou relojizar mamadas', badge: 'warn' },
          { label: 'Primeira hora', value: 'Início na primeira hora — não adiar', badge: 'warn' },
        ],
        footer_rule: 'Política de AM → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Orientação de amamentação na primeira semana pós-parto.',
          'Testar A — amamentação exclusiva até os 6 meses.',
          'Eliminar B — mamadeira desde o início.',
          'Eliminar C — intervalo fixo de horas mesmo com choro.',
          'Eliminar D — adiar primeira mamada além da primeira hora.',
          'Marcar letra A.',
        ],
        footer_rule: 'OMS/MS — exclusivo 6 meses — A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AM',
        items: [
          { label: 'Letra B — mamadeira', detail: 'Facilita desmame precoce e nipple confusion.', correct: 'Mamadeira rotineira contraindicada — letra A.' },
          { label: 'Letra C — intervalo fixo', detail: 'Livre demanda — não relojizar.', correct: 'Sinais do bebê guiam mamadas — gabarito A.' },
          { label: 'Letra D — adiar mamada', detail: 'Primeira hora de vida é o marco OMS.', correct: 'Colostro na primeira hora — marcar A.' },
          { label: 'Pegadinha puerperio', detail: 'Acompanhamento materno até o 42º dia.', correct: 'Aleitamento exclusivo 6 meses — letra A.' },
        ],
        footer_rule: 'Puérpera e recém-nascido',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cotec-fadenor-enfermagem-saude-da-mulher-1777104323066-8': {
    family: 'protocolo',
    branch: 'mulher_mama',
    guideline: 'INCA/MS — achado clínico mamário: investigar com mamografia mesmo fora do rastreio populacional',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso — achado mamário',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Bianka 63 anos internada Hospital Municipal fratura queda secreção mama abcesso seio esquerdo banho aspersão mamografia caro cidade cirurgia.',
            icon: 'Target',
          },
          { label: 'Mamografia (C)', detail: 'Achado clínico exige investigação — discussão com equipe.', icon: 'Scan' },
          { label: 'Pegadinha inicio 40', detail: '63 anos com sintoma — não é só rastreio 50–69 — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha mama', detail: 'Secreção e abcesso — não drenar sem avaliação — B.', icon: 'Ban' },
        ],
        footer_rule: 'Sintomática investiga — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Investigação — mama',
        meta: slideMeta,
        content: 'ACHADO CLÍNICO',
        rows: [
          { label: 'Sinal', value: 'Secreção, abcesso ou nódulo — investigar', badge: 'hot', emphasis: 'highlight' },
          { label: 'Exame', value: 'Mamografia conforme indicação clínica', badge: 'hot' },
          { label: 'Rastreio', value: '50–69 anos bienal — assintomáticas', badge: 'info' },
          { label: 'Não é', value: 'Descartar mamografia só pela idade com sintoma', badge: 'warn' },
        ],
        footer_rule: 'Equipe discute mamografia — C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Caso clínico — secreção e abcesso mamário em internada.',
          'Eliminar A — descartar mamografia pela idade.',
          'Eliminar B — drenar secreção no banho sem avaliação.',
          'Testar C — discutir mamografia pelo achado clínico.',
          'Eliminar D — priorizar só gesso da fratura.',
          'Eliminar E — apenas escuta e ortopedia.',
          'Marcar letra C.',
        ],
        footer_rule: 'Sintomática ≠ rastreio rotineiro — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CASO',
        items: [
          { label: 'Letra A — faixa etária', detail: 'Sintomática investiga independente do programa.', correct: 'Secreção mamária exige mamografia — letra C.' },
          { label: 'Letra B — drenagem', detail: 'Procedimento sem prescrição e avaliação.', correct: 'Discussão multiprofissional — gabarito C.' },
          { label: 'Letra D — fratura', detail: 'Não negligenciar achado mamário.', correct: 'Achado clínico na internação — marcar C.' },
          { label: 'Letra E — ortopedia', detail: 'Escuta sem investigar mama.', correct: 'Equipe avalia mamografia — letra C.' },
        ],
        footer_rule: 'Integrar cuidado à fratura',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780007238824-8': {
    family: 'conceito',
    branch: 'mulher_mama',
    guideline: 'INCA/MS — fator de risco mama: sobrepeso e obesidade após a menopausa',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Fatores de risco — mama',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Roda de conversa internação alto risco gestantes — técnico enfermagem educação câncer mama — participante identifica fator de risco comprovado.', icon: 'Target' },
          { label: 'Obesidade (D)', detail: 'Sobrepeso e obesidade especialmente após menopausa.', icon: 'Scale' },
          { label: 'Pegadinha menarca tardia', detail: 'Menarca precoce é risco — não tardia — B.', icon: 'AlertTriangle' },
          { label: 'Pegadinha mama', detail: 'Alta densidade mamária aumenta risco — não baixa — A.', icon: 'Microscope' },
        ],
        footer_rule: 'Obesidade pós-menopausa — D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Risco — mama',
        meta: slideMeta,
        content: 'FATORES COMPROVADOS',
        rows: [
          { label: 'Obesidade', value: 'Sobrepeso/obesidade após menopausa', badge: 'hot', emphasis: 'highlight' },
          { label: 'Hormonal', value: 'Menarca precoce, menopausa tardia, nuliparidade', badge: 'info' },
          { label: 'Estilo de vida', value: 'Álcool, sedentarismo, radiação', badge: 'info' },
          { label: 'Não é', value: 'Baixa densidade, menarca tardia ou multiparidade isolada', badge: 'warn' },
        ],
        footer_rule: 'Peso corporal — D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Fator de risco comprovado para câncer de mama.',
          'Eliminar A — baixa densidade mamária.',
          'Eliminar B — menarca tardia.',
          'Eliminar C — menopausa precoce.',
          'Testar D — sobrepeso e obesidade após menopausa.',
          'Eliminar E — multiparidade.',
          'Marcar letra D.',
        ],
        footer_rule: 'Metabolismo e estrogênio adiposo — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — RISCO',
        items: [
          { label: 'Letra A — baixa densidade', detail: 'Alta densidade é fator de risco.', correct: 'Tecido adiposo pós-menopausa — letra D.' },
          { label: 'Letra B — menarca tardia', detail: 'Exposição estrogênica precoce aumenta risco.', correct: 'Sobrepeso e obesidade — gabarito D.' },
          { label: 'Letra C — menopausa precoce', detail: 'Menopausa tardia prolonga exposição hormonal.', correct: 'Fator hormonal metabólico — marcar D.' },
          { label: 'Letra E — multiparidade', detail: 'Multiparidade é fator protetor relativo.', correct: 'Obesidade após menopausa — letra D.' },
        ],
        footer_rule: 'Hormônios e adiposidade',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-saude-da-mulher-1777104382533-4': {
    family: 'conceito',
    branch: 'mulher_mama',
    guideline: 'MS/OMS — puerpério 7º dia: útero ao nível da cicatriz umbilical ou abaixo; involução uterina',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Puerpério — visita',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Visita domiciliar ESF — mamas lactantes fisiológicas — útero acima da cicatriz umbilical — invólucro alterado.',
            icon: 'Target',
          },
          { label: 'Útero (E)', detail: 'Na visita puerperal o fundo uterino deve estar ao nível ou abaixo do umbigo.', icon: 'Activity' },
          { label: 'Pegadinha puerperio', detail: 'Consulta puerpéral até o 42º dia pós-parto.', icon: 'Calendar' },
          { label: 'Pegadinha mama', detail: 'Mamas aumentadas e mamilos protusos — lactogênese — C normal.', icon: 'Baby' },
        ],
        footer_rule: 'Útero alto — invólucro lento — E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Involução — visita',
        meta: slideMeta,
        content: 'PUERPÉRIO',
        rows: [
          { label: 'Visita', value: 'Útero ao nível da cicatriz umbilical ou inferior', badge: 'hot', emphasis: 'highlight' },
          { label: 'Lóquios', value: 'Loquiação fisiológica — rubra/serosa', badge: 'info' },
          { label: 'Mamas', value: 'Ingurgitamento e mamilos protusos — normal', badge: 'info' },
          { label: 'Alterado', value: 'Útero palpável acima do umbigo', badge: 'warn' },
        ],
        footer_rule: 'Localização uterina — E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Visita domiciliar puerperal — qual achado está alterado.',
          'Eliminar A — colo fechado (fisiológico).',
          'Eliminar B — lóquios fisiológicos.',
          'Eliminar C — mamas aumentadas na lactação.',
          'Eliminar D — períneo íntegro.',
          'Testar E — útero acima da cicatriz umbilical.',
          'Marcar letra E.',
        ],
        footer_rule: 'Invólucro uterino — E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PUERPÉRIO',
        items: [
          { label: 'Letra A — colo', detail: 'Fechamento cervical progressivo.', correct: 'Útero alto — letra E.' },
          { label: 'Letra B — lóquios', detail: 'Transição rubra para serosa.', correct: 'Invólucro lento — gabarito E.' },
          { label: 'Letra C — mamas', detail: 'Lactogênese II — ingurgitamento esperado.', correct: 'Palpação uterina — marcar E.' },
          { label: 'Letra D — períneo', detail: 'Períneo íntegro na visita.', correct: 'Útero acima do umbigo — letra E.' },
          {
            label: 'Pegadinha puerperio',
            detail: 'Consulta puerpéral até o 42º dia pós-parto.',
            correct: 'Invólucro lento — localização uterina — gabarito E.',
          },
        ],
        footer_rule: 'Mama lactante + útero involuindo',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fadesp-enfermagem-saude-da-mulher-1777104347186-1': {
    family: 'conceito',
    branch: 'mulher_mama',
    guideline: 'INCA/MS — prevenção câncer de mama: atividade física, peso adequado, alimentação saudável, reduzir álcool',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Prevenção — mama',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Câncer de mama — incidência e mortalidade — medidas preventivas contra o tumor.',
            icon: 'Target',
          },
          { label: 'Estilo de vida (C)', detail: 'Atividade física, peso adequado, dieta saudável, menos álcool.', icon: 'Heart' },
          { label: 'Pegadinha mama', detail: 'Amamentação protege — não evitar livre demanda — B.', icon: 'Baby' },
          { label: 'Pegadinha autoexame', detail: 'Autoexame complementa — mamografia no rastreio 50–69.', icon: 'Hand' },
        ],
        footer_rule: 'Modificáveis de estilo de vida — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Prevenção — INCA',
        meta: slideMeta,
        content: 'MEDIDAS PREVENTIVAS',
        rows: [
          { label: 'Fazer', value: 'Atividade física regular e peso adequado', badge: 'hot', emphasis: 'highlight' },
          { label: 'Alimentação', value: 'Dieta saudável — frutas, verduras, fibras', badge: 'hot' },
          { label: 'Álcool', value: 'Evitar ou reduzir consumo', badge: 'info' },
          { label: 'AM', value: 'Amamentar protege — livre demanda', badge: 'info' },
          { label: 'Não é', value: 'Ganhar peso, evitar AM ou dieta só carboidrato', badge: 'warn' },
        ],
        footer_rule: 'Promoção da saúde — C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Medidas preventivas contra câncer de mama.',
          'Eliminar A — carboidratos, evitar perder peso, 4 L água.',
          'Eliminar B — evitar amamentação livre demanda.',
          'Testar C — atividade física, peso adequado, alimentação saudável, reduzir álcool.',
          'Eliminar D — alto impacto e reduzir peso como única medida.',
          'Marcar letra C.',
        ],
        footer_rule: 'Fatores modificáveis — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PREVENÇÃO',
        items: [
          { label: 'Letra A — carboidrato', detail: 'Evitar perder peso é incorreto.', correct: 'Estilo de vida saudável — letra C.' },
          { label: 'Letra B — mamadeira', detail: 'Amamentação é fator protetor.', correct: 'Atividade física e dieta — gabarito C.' },
          { label: 'Letra D — alto impacto', detail: 'Atividade moderada regular — não só alto impacto.', correct: 'Reduzir álcool — marcar C.' },
          { label: 'Pegadinha mama', detail: '73.610 casos estimados — INCA 2023.', correct: 'Prevenção modificável — letra C.' },
        ],
        footer_rule: 'INCA — redução de incidência',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fafipa-enfermagem-processo-de-enfermagem-1780009392850-1': {
    family: 'protocolo',
    branch: 'mulher_mama',
    guideline: 'MS Nota 626/2025 — nódulo endurecido e fixo em mulher adulta: referência urgente mamografia',
    sources: [MS_NOTA_MAMA_SOURCE, INCA_MAMA_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sinais suspeitos — MS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Nota Técnica MS 626/2025 — sinal/sintoma suspeito e referência urgente mamografia SUS.', icon: 'Target' },
          { label: 'Nódulo fixo (E)', detail: 'Endurecido e fixo — mulher adulta qualquer idade.', icon: 'AlertTriangle' },
          { label: 'Pegadinha mama', detail: 'Pele em casca de laranja — carcinoma inflamatório — D é sinal, mas E é gabarito.', icon: 'Scan' },
          { label: 'Pegadinha inicio 40', detail: 'Nódulo suspeito não se limita a maiores de 50 anos — C.', icon: 'Ban' },
        ],
        footer_rule: 'Nódulo endurecido fixo — E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — urgente',
        meta: slideMeta,
        content: 'NOTA MS 626',
        rows: [
          { label: 'Urgente', value: 'Nódulo endurecido, fixo — qualquer idade adulta', badge: 'hot', emphasis: 'highlight' },
          { label: 'Inflamatório', value: 'Edema, pele casca de laranja, vermelhidão', badge: 'info' },
          { label: 'Mastite', value: 'Com melhora antibiótica — reavaliar', badge: 'warn' },
          { label: 'Rastreio', value: '50–69 bienal — assintomáticas', badge: 'info' },
        ],
        footer_rule: 'Suspeita clínica → E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Nota MS 626 — sinal suspeito com referência urgente.',
          'Eliminar A — mastite com melhora antibiótica.',
          'Eliminar B — tumoração bilateral em homem.',
          'Eliminar C — nódulo crescente só acima de 50 anos.',
          'Eliminar D — diminuição de volume com edema (sinal, mas não gabarito).',
          'Testar E — nódulo endurecido e fixo em mulher adulta.',
          'Marcar letra E.',
        ],
        footer_rule: 'Critério de referência — E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SUSPEITA',
        items: [
          { label: 'Letra A — mastite', detail: 'Melhora com antibiótico — reavaliar.', correct: 'Nódulo fixo — letra E.' },
          { label: 'Letra B — homens', detail: 'Tumoração em homem — outro fluxo.', correct: 'Endurecido e fixo — gabarito E.' },
          { label: 'Letra C — só >50', detail: 'Suspeita em qualquer idade adulta.', correct: 'Referência urgente — marcar E.' },
          { label: 'Letra D — peau d orange', detail: 'Sinal inflamatório grave.', correct: 'Qualquer idade adulta — letra E.' },
        ],
        footer_rule: 'Nota técnica MS 626',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'funatec-enfermagem-saude-da-mulher-1777104415052-2': {
    family: 'conceito',
    branch: 'mulher_mama',
    guideline: 'INCA/MS — rastreio mama: 50–69 anos, mamografia bienal (prova: 40 anos anual)',
    exam_vs_current: 'Prova indica início aos 40 anos com mamografia anual (B); INCA/SUS atual: 50–69 anos bienal.',
    roi_error: 'mama_inicio_40 + mama_anual_universal',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mamografia — prova',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Prevenção câncer de mama — mamografia em mulheres assintomáticas.', icon: 'Target' },
          { label: 'Prova (B)', detail: 'Iniciar aos 40 anos e repetir anualmente — gabarito da banca.', icon: 'CheckCircle' },
          { label: 'Pegadinha inicio 40', detail: 'INCA/SUS: início aos 50 anos no rastreio populacional.', icon: 'AlertTriangle' },
          { label: 'Pegadinha mama', detail: 'Periodicidade bienal 50–69 — não anual universal — D.', icon: 'Clock' },
        ],
        footer_rule: 'Gabarito prova: 40 anual — B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Rastreio — dupla referência',
        meta: slideMeta,
        content: 'MAMOGRAFIA',
        rows: [
          { label: 'Prova', value: 'Início aos 40 anos — periodicidade anual', badge: 'hot', emphasis: 'highlight' },
          { label: 'INCA/SUS', value: '50 a 69 anos — bienal', badge: 'info' },
          { label: 'Assintomáticas', value: 'Rastreio populacional na faixa', badge: 'info' },
          { label: 'Pegadinha anual', value: 'Não é bienal na prova — banca cobra anual aos 40', badge: 'warn' },
        ],
        footer_rule: 'Marcar B na prova · INCA 50–69 bienal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Mamografia — recomendação geral para assintomáticas.',
          'Eliminar A — 35 anos bienal.',
          'Testar B — 40 anos anual (gabarito da prova).',
          'Eliminar C — 45 anos trienal.',
          'Eliminar D — 50 anos quinquenal.',
          'Eliminar E — 55 anos decenal.',
          'Marcar letra B.',
        ],
        footer_rule: 'Gabarito banca — B (ver INCA 50–69)',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — IDADE × INTERVALO',
        items: [
          { label: 'Letra A — 35 bienal', detail: 'Idade de início inferior à banca.', correct: '40 anos anual — letra B.' },
          { label: 'Letra C — 45 trienal', detail: 'Intervalo trienal não é o da prova.', correct: 'Gabarito prova — marcar B.' },
          { label: 'Letra D — 50 quinquenal', detail: 'Intervalo muito espaçado para a prova.', correct: '40 anual — letra B.' },
          { label: 'Letra E — 55 decenal', detail: 'Periodicidade inadequada.', correct: 'Alternativa B na prova.' },
        ],
        footer_rule: 'exam_vs_current documentado',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'funcern-enfermagem-saude-da-mulher-1777104288275-8': {
    family: 'conceito',
    branch: 'mulher_mama',
    guideline: 'INCA/MS — manifestações precoces mama: nódulo endurecido fixo indolor e linfonodos axilares',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sinais — mama',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Câncer de mama — manifestações clínicas para detecção precoce do tumor.',
            icon: 'Target',
          },
          { label: 'Nódulo axilar (B)', detail: 'Endurecido, fixo, geralmente indolor — linfonodos axilares.', icon: 'Search' },
          { label: 'Pegadinha mama', detail: 'Febre e calafrios — quadro infeccioso — A.', icon: 'Thermometer' },
          { label: 'Pegadinha autoexame', detail: 'Autopalpação orienta — mamografia no rastreio 50–69.', icon: 'Hand' },
        ],
        footer_rule: 'Nódulo + axila — B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Clínica — mama',
        meta: slideMeta,
        content: 'MANIFESTAÇÕES',
        rows: [
          { label: 'Nódulo', value: 'Endurecido, fixo, geralmente indolor', badge: 'hot', emphasis: 'highlight' },
          { label: 'Axila', value: 'Pequenos nódulos linfonodais', badge: 'hot' },
          { label: 'Outros', value: 'Retração, secreção, alteração cutânea', badge: 'info' },
          { label: 'Não é', value: 'Febre, sangramento vaginal ou desorientação', badge: 'warn' },
        ],
        footer_rule: 'Palpação mamária e axilar — B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Manifestações clínicas de detecção precoce do câncer de mama.',
          'Eliminar A — calafrios, febre e cansaço.',
          'Testar B — nódulo endurecido fixo indolor e nódulos axilares.',
          'Eliminar C — sangramento vaginal e dor pélvica.',
          'Eliminar D — perda de peso e desorientação.',
          'Marcar letra B.',
        ],
        footer_rule: 'Sinal mamário local — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CLÍNICA',
        items: [
          { label: 'Letra A — febre', detail: 'Sintomas sistêmicos inespecíficos.', correct: 'Nódulo mamário — letra B.' },
          { label: 'Letra C — gineco', detail: 'Sangramento vaginal — outro trato.', correct: 'Axila — gabarito B.' },
          { label: 'Letra D — abdominal', detail: 'Perda de peso inespecífica tardia.', correct: 'Endurecido e fixo — marcar B.' },
          { label: 'Pegadinha mama', detail: 'Diagnóstico precoce melhora prognóstico.', correct: 'Manifestação mamária — letra B.' },
        ],
        footer_rule: 'INCA — sinais de alerta',
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
    console.log(`[handcraft:sm-g22] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g22] total=${ok}`);
}

main();
