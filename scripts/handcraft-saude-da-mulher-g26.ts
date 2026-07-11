#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g26 (9 slugs mulher_puerperio P2).
 *
 *   npm run handcraft:saude-da-mulher-g26
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g26 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g26';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const AB32_SOURCE = {
  id: 'caderno-ab-32-prenatal',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 32 — Atenção ao pré-natal de baixo risco',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: [
    'consulta puerpério até 42 dias',
    'visita domiciliar primeira semana',
    'aleitamento materno exclusivo 6 meses',
    'colostro',
    'atribuições técnico enfermagem APS',
    'direitos previdenciários puerpério',
  ],
};

const OMS_AM_SOURCE = {
  id: 'oms-am-exclusiva',
  tier: 'A' as const,
  issuer: 'OMS / MS',
  title: 'Política Nacional de Aleitamento Materno',
  year: 2015,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/politica_nacional_de_aleitamento_materno.pdf',
  covers: [
    'aleitamento exclusivo 6 meses',
    'pega correta',
    'contraindicações amamentação',
    'benefícios saúde pública',
    'colostro imunidade',
  ],
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

type Branch = 'mulher_puerperio' | 'mulher_planejamento';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis' | 'certo_errado';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  sources?: (typeof AB32_SOURCE | typeof OMS_AM_SOURCE)[];
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
    sources: pack.sources ?? [AB32_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/Fonte:\s*/gi, '')
    .replace(/após30/g, 'após 30')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'amauc-enfermagem-processo-de-enfermagem-1780004982901-6': {
    family: 'conceito',
    branch: 'mulher_puerperio',
    guideline: 'OMS/MS — aleitamento materno: benefícios individuais, coletivos e redução de custos em saúde',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'AM — benefícios',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Benefícios do aleitamento materno — alternativa correta.', icon: 'Target' },
          { label: 'Saúde pública (E)', detail: 'Previne doenças e reduz custos do sistema de saúde.', icon: 'TrendingUp' },
          { label: 'Pegadinha só bebê', detail: 'Benefícios também para mãe e sociedade — C.', icon: 'Users' },
          { label: 'Pegadinha só lactação', detail: 'Impactos de longo prazo — não só período de amamentar — B.', icon: 'Clock' },
        ],
        footer_rule: 'AM = promoção coletiva',
      },
      {
        type: 'golden_rule',
        slide_title: 'AM — impacto',
        meta: slideMeta,
        content: 'POLÍTICA NACIONAL AM',
        rows: [
          { label: 'Bebê', value: 'Imunidade, nutrição e desenvolvimento', badge: 'info' },
          { label: 'Mãe', value: 'Involução uterina, vínculo e saúde mental', badge: 'info' },
          { label: 'Sociedade', value: 'Redução de custos e doenças evitáveis', badge: 'hot', emphasis: 'highlight' },
          { label: 'Pegadinha', value: 'Não é prática só individual ou nutricional', badge: 'warn' },
        ],
        footer_rule: 'Custo-efetividade — E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Benefícios da amamentação — MS.',
          'Eliminar A — repercussões sociais e ambientais existem.',
          'Eliminar B — efeitos de longo prazo documentados.',
          'Eliminar C — benefícios para mãe e sociedade.',
          'Eliminar D — além do nutricional — saúde pública.',
          'Testar E — prevenção e redução de custos.',
          'Marcar letra E.',
        ],
        footer_rule: 'Saúde coletiva — E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BENEFÍCIOS AM',
        items: [
          { label: 'Letra A — individual', detail: 'AM tem impacto ambiental e social.', correct: 'Redução de custos em saúde — eliminar A.' },
          { label: 'Letra B — só lactação', detail: 'Proteção prolongada na vida adulta.', correct: 'Benefício coletivo — eliminar B.' },
          { label: 'Letra C — só bebê', detail: 'Mãe e sociedade também ganham.', correct: 'Prevenção populacional — eliminar C.' },
          { label: 'Letra D — só nutricional', detail: 'Influencia indicadores de saúde pública.', correct: 'Custo-efetividade — marcar E.' },
          { label: 'Pegadinha só lactação', detail: 'Efeitos extrapolam o período de amamentar.', correct: 'Impacto sistêmico — letra E.' },
        ],
        footer_rule: 'AM é política pública',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cebraspe-cespe-enfermagem-saude-da-mulher-1777104288275-0': {
    family: 'certo_errado',
    branch: 'mulher_puerperio',
    guideline: 'Caderno AB 32 / MS — atendimento puerperal de qualidade inclui orientação sobre direitos previdenciários',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Puerpério — direitos',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Certo ou errado — atendimento puerperal de qualidade e Previdência Social.', icon: 'Target' },
          { label: 'Certo (A)', detail: 'Mães devem receber esclarecimentos sobre direitos previdenciários.', icon: 'CheckCircle' },
          { label: 'Pegadinha puerpério 30 dias', detail: 'Cuidado integral vai até consulta aos 42º dia — não só 30.', icon: 'Calendar' },
          { label: 'Pegadinha AM 3 meses', detail: 'AM exclusivo até 6 meses — não encerrar orientação cedo.', icon: 'Baby' },
        ],
        footer_rule: 'Direitos sociais no puerpério — certo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Cuidado puerperal',
        meta: slideMeta,
        content: 'ATENÇÃO PUERPERAL',
        rows: [
          { label: 'Consulta', value: 'Até o 42º dia após o parto', badge: 'hot', emphasis: 'highlight' },
          { label: 'Visita', value: 'Primeira semana após alta do RN', badge: 'info' },
          { label: 'Direitos', value: 'Orientar Previdência e benefícios — cuidado de qualidade', badge: 'hot' },
          { label: 'AM', value: 'Apoio à amamentação e pega', badge: 'info' },
        ],
        footer_rule: 'Holístico — inclui direitos',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Julgar item — atendimento puerperal de qualidade.',
          'MS prevê orientação sobre direitos previdenciários.',
          'Afirmativa está alinhada ao cuidado integral.',
          'Marcar Certo — letra A.',
        ],
        footer_rule: 'Certo — direitos previdenciários — A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PUERPÉRIO',
        items: [
          { label: 'Letra B — errado', detail: 'Negar orientação previdenciária contraria MS.', correct: 'Esclarecer direitos — certo — letra A.' },
          { label: 'Pegadinha puerpério 30 dias', detail: 'Assistência não encerra aos 30 dias.', correct: 'Cuidado integral inclui direitos — marcar A.' },
          { label: 'Pegadinha AM 3 meses', detail: 'AM exclusivo recomendado até 6 meses.', correct: 'Atendimento de qualidade — certo — A.' },
        ],
        footer_rule: 'Previdência faz parte do cuidado',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'consulplan-enfermagem-nutricao-aplicada-a-enfermagem-1777102944034-6': {
    family: 'conceito',
    branch: 'mulher_puerperio',
    guideline: 'OMS/MS — colostro: leite inicial rico em anticorpos nas primeiras horas/dias pós-parto',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lactogênese I',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Leite amarelado grosso rico em anticorpos nos primeiros dias — nome.', icon: 'Target' },
          { label: 'Colostro (B)', detail: 'Primeira secreção láctea — imunidade e nutrição inicial.', icon: 'Droplet' },
          { label: 'Pegadinha maduro', detail: 'Leite maduro vem após apojadura — A.', icon: 'Clock' },
          { label: 'Pegadinha transição', detail: 'Leite de transição é fase após colostro — C.', icon: 'ArrowRight' },
        ],
        footer_rule: 'Colostro = primeiros dias',
      },
      {
        type: 'golden_rule',
        slide_title: 'Fases do leite',
        meta: slideMeta,
        content: 'LACTOGÊNESE',
        rows: [
          { label: 'Colostro', value: 'Amarelado, denso, anticorpos — dias iniciais', badge: 'hot', emphasis: 'highlight' },
          { label: 'Transição', value: 'Mudança gradual do leite após colostro', badge: 'info' },
          { label: 'Maduro', value: 'Após estabilização da produção', badge: 'info' },
          { label: 'Pegadinha', value: 'Não confundir com pasteurizado de banco', badge: 'warn' },
        ],
        footer_rule: 'Colostro → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Secreção láctea inicial pós-parto.',
          'Eliminar A — maduro é fase posterior.',
          'Testar B — colostro.',
          'Eliminar C — transição é etapa distinta.',
          'Eliminar D — pasteurizado é processamento de BLH.',
          'Eliminar E — leite materno posterior não é o termo clássico.',
          'Marcar letra B.',
        ],
        footer_rule: 'Colostro — imunidade — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LEITE',
        items: [
          { label: 'Letra A — maduro', detail: 'Maduro surge após colostro e transição.', correct: 'Primeiros dias — colostro — letra B.' },
          { label: 'Letra C — transição', detail: 'Fase intermediária, não inicial.', correct: 'Anticorpos no colostro — gabarito B.' },
          { label: 'Letra D — pasteurizado', detail: 'Processo industrial de BLH.', correct: 'Secreção fisiológica — marcar B.' },
          { label: 'Letra E — posterior', detail: 'Termo inexistente na classificação.', correct: 'Colostro — letra B.' },
        ],
        footer_rule: 'Primeira mamada = colostro',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'facet-enfermagem-saude-da-mulher-1777104261182-4': {
    family: 'protocolo',
    branch: 'mulher_puerperio',
    guideline: 'OMS/MS — puerpério: avaliar pega, orientar posição, pele a pele e amamentação em livre demanda',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'AM — puerpério',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Intervenção de enfermagem que promove aleitamento no puerpério.', icon: 'Target' },
          { label: 'Pega (B)', detail: 'Avaliar eficácia da pega e orientar posição correta.', icon: 'Baby' },
          { label: 'Pegadinha suspender', detail: 'Interromper por desconforto leve — A — incorreto.', icon: 'Ban' },
          { label: 'Pegadinha fórmula', detail: 'Suplemento artificial de rotina — C — não recomendado.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Pega correta — B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Promoção AM',
        meta: slideMeta,
        content: 'PUERPÉRIO — ENFERMAGEM',
        rows: [
          { label: 'Fazer', value: 'Avaliar pega, posição e apoio à mãe', badge: 'hot', emphasis: 'highlight' },
          { label: 'Pele a pele', value: 'Contato imediato favorece pega e vínculo', badge: 'hot' },
          { label: 'Evitar', value: 'Horários rígidos e fórmula de rotina', badge: 'warn' },
          { label: 'Evitar', value: 'Suspender AM por desconforto sem orientação', badge: 'warn' },
        ],
        footer_rule: 'Técnica de amamentação — B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Promoção do aleitamento no puerpério.',
          'Eliminar A — suspender imediatamente por desconforto.',
          'Testar B — avaliar pega e orientar posição.',
          'Eliminar C — suplemento artificial preventivo.',
          'Eliminar D — horários rígidos.',
          'Eliminar E — evitar pele a pele.',
          'Marcar letra B.',
        ],
        footer_rule: 'Pega e posição — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AM PUERPÉRIO',
        items: [
          { label: 'Letra A — suspender', detail: 'Desconforto exige suporte à pega, não interrupção.', correct: 'Orientar posição — eliminar A.' },
          { label: 'Letra C — fórmula', detail: 'Suplementação só com indicação.', correct: 'Avaliar pega — eliminar C.' },
          { label: 'Letra D — horários', detail: 'Livre demanda é recomendação OMS.', correct: 'Pega correta — eliminar D.' },
          { label: 'Letra E — sem pele a pele', detail: 'Contato pele a pele é protetor.', correct: 'Intervenção adequada — marcar B.' },
          { label: 'Pegadinha suspender', detail: 'Interromper AM agrava ingurgitamento.', correct: 'Avaliar pega — letra B.' },
        ],
        footer_rule: 'OMS — apoio técnico à pega',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fgv-enfermagem-saude-da-mulher-1777104323066-0': {
    family: 'protocolo',
    branch: 'mulher_puerperio',
    guideline: 'OMS/MS — contraindicação absoluta AM: radiofármacos; hepatite B com imunoprofilaxia do RN não contraindica',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Contraindicações — AM',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Condição materna que contraindica amamentação — MS.', icon: 'Target' },
          { label: 'Radiofármacos (B)', detail: 'Medicamentos radioativos — suspender AM conforme orientação.', icon: 'Ban' },
          { label: 'Pegadinha puerpério 30 dias', detail: 'AM não encerra aos 30 dias — consulta até 42º dia.', icon: 'Calendar' },
          { label: 'Pegadinha hepatite B', detail: 'Hepatite B — vacina e IG no RN — C não contraindica.', icon: 'Syringe' },
          { label: 'Pegadinha tuberculose', detail: 'TB tratada — AM com máscara — E não é contraindicação absoluta.', icon: 'Shield' },
        ],
        footer_rule: 'Radiofármaco — contraindica',
      },
      {
        type: 'golden_rule',
        slide_title: 'AM — quando suspender',
        meta: slideMeta,
        content: 'MS / OMS',
        rows: [
          { label: 'Contraindica', value: 'Radiofármacos e galactosemia clássica', badge: 'hot', emphasis: 'highlight' },
          { label: 'Não contraindica', value: 'Hepatite B (profilaxia do RN), dengue, antibiótico usual', badge: 'info' },
          { label: 'TB', value: 'Avaliar caso — muitas vezes AM mantido com precaução', badge: 'info' },
          { label: 'Pegadinha', value: 'Antibiótico compatível com AM na maioria dos casos', badge: 'warn' },
        ],
        footer_rule: 'Radiofármacos — B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contraindicação materna à amamentação.',
          'Eliminar A — dengue não contraindica de rotina.',
          'Testar B — uso de radiofármacos.',
          'Eliminar C — hepatite B com profilaxia neonatal.',
          'Eliminar D — antibiótico usualmente compatível.',
          'Eliminar E — tuberculose não é contraindicação absoluta universal.',
          'Marcar letra B.',
        ],
        footer_rule: 'Radiofármacos — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONTRAINDICAÇÃO',
        items: [
          { label: 'Letra A — dengue', detail: 'Febre viral não contraindica AM isoladamente.', correct: 'Radiofármacos — eliminar A.' },
          { label: 'Letra C — hepatite B', detail: 'RN recebe vacina e imunoglobulina.', correct: 'Contraindicação absoluta — eliminar C.' },
          { label: 'Letra D — antibiótico', detail: 'Maioria é compatível com aleitamento.', correct: 'Uso de radiofármacos — eliminar D.' },
          { label: 'Letra E — tuberculose', detail: 'Protocolo permite AM com cuidados.', correct: 'Suspender por radiofármaco — marcar B.' },
        ],
        footer_rule: 'Medicamento radioativo — interromper',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'funcern-enfermagem-saude-da-mulher-1777104415052-8': {
    family: 'conceito',
    branch: 'mulher_puerperio',
    guideline: 'MS — métodos comportamentais: temperatura basal e Billings; anticoncepcional combinado não é primeira escolha na lactação',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Contracepção — puerpério',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Afirmativa correta sobre métodos contraceptivos.', icon: 'Target' },
          { label: 'Comportamentais (D)', detail: 'Temperatura basal e Billings — métodos comportamentais.', icon: 'Calendar' },
          { label: 'Pegadinha ACO lactação', detail: 'Combinado na amamentação — A — não é rotina na lactação.', icon: 'Pill' },
          { label: 'Pegadinha laqueadura', detail: 'Prazo legal para esterilização — B — pegadinha de prazo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Billings e basal — comportamentais',
      },
      {
        type: 'golden_rule',
        slide_title: 'Métodos — classificação',
        meta: slideMeta,
        content: 'PLANEJAMENTO FAMILIAR',
        rows: [
          { label: 'Comportamentais', value: 'Billings, temperatura basal, tabelinha', badge: 'hot', emphasis: 'highlight' },
          { label: 'Lactação', value: 'Priorizar progestagênio ou LARC quando indicado', badge: 'info' },
          { label: 'Laqueadura', value: 'Critérios legais de idade e prazo — não 30 dias isolado', badge: 'warn' },
          { label: 'Diafragma', value: 'Retirada conforme orientação — não horas fixas universais', badge: 'info' },
        ],
        footer_rule: 'D = comportamentais',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Métodos contraceptivos — julgar alternativas.',
          'Eliminar A — ACO combinado na lactação.',
          'Eliminar B — prazo laqueadura incorreto.',
          'Eliminar C — diafragma com tempo fixo errado.',
          'Testar D — basal e Billings comportamentais.',
          'Marcar letra D.',
        ],
        footer_rule: 'Comportamentais — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MÉTODOS',
        items: [
          { label: 'Letra A — ACO lactação', detail: 'Combinado não é primeira escolha na amamentação.', correct: 'Comportamentais — eliminar A.' },
          { label: 'Letra B — laqueadura', detail: 'Lei exige critérios além de prazo curto.', correct: 'Billings e basal — eliminar B.' },
          { label: 'Letra C — diafragma', detail: 'Tempo de permanência não é regra fixa de horas.', correct: 'Métodos comportamentais — eliminar C.' },
          { label: 'Pegadinha ACO lactação', detail: 'Lactante: progestagênio ou barreira preferíveis.', correct: 'Temperatura basal e Billings — marcar D.' },
        ],
        footer_rule: 'Comportamental ≠ hormonal',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idib-enfermagem-saude-da-mulher-1778934944659-2': {
    family: 'conceito',
    branch: 'mulher_puerperio',
    guideline: 'COFEN/MS — auxiliar de enfermagem: educação em saúde e procedimentos; não realiza consulta de enfermagem nem solicita exames',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Auxiliar — EXCETO',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Atribuições do auxiliar na atenção à mulher — assinalar o EXCETO.', icon: 'Target' },
          { label: 'EXCETO (D)', detail: 'Consulta de enfermagem e solicitar exames — atribuição do enfermeiro.', icon: 'Ban' },
          { label: 'Pegadinha consulta', detail: 'Auxiliar não substitui enfermeiro na consulta de pré-natal.', icon: 'AlertTriangle' },
          { label: 'Conduta A', detail: 'Educação em saúde sobre AM na UBS — correto.', icon: 'CheckCircle' },
          { label: 'Conduta C', detail: 'SV e antropometria na caderneta — correto.', icon: 'ClipboardList' },
        ],
        footer_rule: 'Consulta = enfermeiro',
      },
      {
        type: 'golden_rule',
        slide_title: 'Escopo — auxiliar',
        meta: slideMeta,
        content: 'COFEN / APS',
        rows: [
          { label: 'Auxiliar faz', value: 'Educação em saúde, vacinas sob supervisão, SV', badge: 'hot', emphasis: 'highlight' },
          { label: 'Enfermeiro faz', value: 'Consulta de enfermagem e solicitação de exames', badge: 'hot' },
          { label: 'TE', value: 'Apoio, registro e procedimentos técnicos', badge: 'info' },
          { label: 'Pegadinha', value: 'Auxiliar não substitui enfermeiro na consulta', badge: 'warn' },
        ],
        footer_rule: 'EXCETO = consulta — D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando EXCETO — auxiliar de enfermagem.',
          'Letra A — educação AM → conduta correta.',
          'Letra B — vacina antitetânica → conduta correta.',
          'Letra C — SV e caderneta → conduta correta.',
          'Letra D — consulta e exames → fora do escopo.',
          'Marcar letra D.',
        ],
        footer_rule: 'Fora do escopo — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO',
        items: [
          { label: 'Letra A — educação AM', detail: 'Promoção à saúde é atribuição do auxiliar.', correct: 'Educação sobre AM na UBS é conduta correta — não é o EXCETO.' },
          { label: 'Letra B — vacina', detail: 'Aplicação sob protocolo é permitida.', correct: 'Vacina antitetânica sob supervisão é conduta correta — não é o EXCETO.' },
          { label: 'Letra C — SV caderneta', detail: 'Registro de dados antropométricos é apoio.', correct: 'SV na caderneta é atribuição adequada — não é o EXCETO.' },
          { label: 'Pegadinha consulta', detail: 'Consulta de enfermagem exige formação superior.', correct: 'Exceção: letra D — consulta e solicitar exames.' },
        ],
        footer_rule: 'Hierarquia profissional',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'unesc-enfermagem-atencao-basica-saude-da-familia-1778968028412-1': {
    family: 'conceito',
    branch: 'mulher_puerperio',
    guideline: 'Caderno AB 32 — TE na APS: orientação, identificação e educação; consulta de enfermagem é atribuição do enfermeiro',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TE — AB EXCETO',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Atribuições do TE no AB — Caderno 32 — assinalar EXCETO.', icon: 'Target' },
          { label: 'EXCETO (D)', detail: 'Consulta de enfermagem de pré-natal — enfermeiro.', icon: 'Ban' },
          { label: 'Pegadinha puerpério 30 dias', detail: 'Acompanhamento materno até 42º dia — não aos 30.', icon: 'Calendar' },
          { label: 'Conduta A', detail: 'Orientar pré-natal, AM e vacinas — correto.', icon: 'Heart' },
          { label: 'Conduta E', detail: 'Atividades educativas individuais e em grupo — correto.', icon: 'Users' },
        ],
        footer_rule: 'TE não consulta pré-natal',
      },
      {
        type: 'golden_rule',
        slide_title: 'TE — Caderno 32',
        meta: slideMeta,
        content: 'ATENÇÃO BÁSICA',
        rows: [
          { label: 'TE faz', value: 'Orientar, conferir cartão, identificar gestantes', badge: 'hot', emphasis: 'highlight' },
          { label: 'TE faz', value: 'Educação em saúde individual e em grupo', badge: 'info' },
          { label: 'Enfermeiro', value: 'Consulta de enfermagem de pré-natal', badge: 'warn' },
          { label: 'Puerpério', value: 'Apoio à AM e visita na primeira semana', badge: 'info' },
        ],
        footer_rule: 'EXCETO consulta — D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Caderno AB 32 — atribuições do TE — EXCETO.',
          'Letra A — orientar famílias → correta.',
          'Letra B — conferir cartão → correta.',
          'Letra C — identificar gestantes → correta.',
          'Letra D — consulta pré-natal → fora do escopo do TE.',
          'Letra E — educação em grupo → correta.',
          'Marcar letra D.',
        ],
        footer_rule: 'Consulta enfermeiro — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TE APS',
        items: [
          { label: 'Letra A — orientar', detail: 'Orientação sobre AM e vacinas é TE.', correct: 'Orientar famílias sobre pré-natal e AM é conduta correta — não é o EXCETO.' },
          { label: 'Letra B — cartão', detail: 'Conferir dados preenchidos é apoio técnico.', correct: 'Conferir cartão da gestante é atribuição do TE — não é o EXCETO.' },
          { label: 'Letra C — identificar', detail: 'Busca ativa no território é função do TE.', correct: 'Identificar gestantes no território é conduta correta — não é o EXCETO.' },
          { label: 'Letra E — educação grupo', detail: 'Educação coletiva é atribuição prevista.', correct: 'Atividades educativas em grupo são conduta correta — não é o EXCETO.' },
          { label: 'Pegadinha puerpério 30 dias', detail: 'Acompanhamento materno vai até 42º dia.', correct: 'Consulta de enfermagem pré-natal — exceção letra D.' },
        ],
        footer_rule: 'Consulta = enfermeiro obstétrico',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'unesc-enfermagem-atencao-basica-saude-da-familia-1780001297464-7': {
    family: 'conceito',
    branch: 'mulher_puerperio',
    guideline: 'Caderno AB 32 — TE: registro e educação em saúde; não conduz consulta de enfermagem de pré-natal',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TE — escopo AB',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'TE na APS — Caderno de Atenção Básica — qual NÃO é atribuição.', icon: 'Target' },
          { label: 'Fora do escopo (D)', detail: 'Consulta de enfermagem de pré-natal — competência do enfermeiro.', icon: 'Ban' },
          { label: 'Pegadinha puerpério 30 dias', detail: 'Acompanhamento materno até 42º dia — não confundir com escopo TE.', icon: 'Calendar' },
          { label: 'Conduta C', detail: 'Identificação de gestantes no território — atribuição TE.', icon: 'MapPin' },
        ],
        footer_rule: 'TE apoia — não consulta',
      },
      {
        type: 'golden_rule',
        slide_title: 'Divisão — APS',
        meta: slideMeta,
        content: 'CADERNO AB 32',
        rows: [
          { label: 'TE', value: 'Orientação, cartão gestante, educação e busca ativa', badge: 'hot', emphasis: 'highlight' },
          { label: 'Enfermeiro', value: 'Consulta de enfermagem e prescrição de cuidados', badge: 'hot' },
          { label: 'Puerpério', value: 'Consulta até 42º dia — equipe multiprofissional', badge: 'info' },
          { label: 'Pegadinha 30 dias', value: 'Não encerrar puerpério aos 30 dias', badge: 'warn' },
        ],
        footer_rule: 'NÃO = consulta D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Atribuições TE — EXCETO no Caderno 32.',
          'Letra A — orientação familiar → correta.',
          'Letra B — conferir cartão → correta.',
          'Letra C — identificar gestantes → correta.',
          'Letra D — consulta pré-natal → não é TE.',
          'Letra E — educação → correta.',
          'Marcar letra D.',
        ],
        footer_rule: 'Escopo profissional — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO TE',
        items: [
          { label: 'Letra A — orientação', detail: 'Pré-natal, AM e vacinas — papel educativo do TE.', correct: 'Orientação familiar é conduta correta do TE — não é o EXCETO.' },
          { label: 'Letra B — cartão', detail: 'Conferência de dados é suporte ao cuidado.', correct: 'Conferir cartão gestante é atribuição prevista — não é o EXCETO.' },
          { label: 'Letra C — território', detail: 'Identificar gestantes é vigilância em saúde.', correct: 'Busca ativa no território é conduta correta — não é o EXCETO.' },
          { label: 'Letra E — educação grupo', detail: 'Educação coletiva integra ações do TE na APS.', correct: 'Atividades educativas em grupo são conduta correta — não é o EXCETO.' },
          { label: 'Pegadinha puerpério 30 dias', detail: 'Cuidado puerperal estende-se até 42 dias.', correct: 'Consulta de enfermagem pré-natal — exceção letra D.' },
        ],
        footer_rule: 'Hierarquia COFEN no AB',
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
    console.log(`[handcraft:sm-g26] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g26] total=${ok}`);
}

main();
