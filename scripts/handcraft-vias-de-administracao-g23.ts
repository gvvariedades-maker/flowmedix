#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — vias-de-administracao-g23 (8 slugs P2 perfis + INCORRETA + técnica).
 *
 *   npx tsx scripts/handcraft-vias-de-administracao-g23.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const loteQuestionsDir = (lote: string) =>
  join(process.cwd(), 'data/catalog-migration', lote, 'questions');

const LOTE = 'vias-de-administracao-g23';
const SUBTOPICO = 'Vias de Administração';
const REVIEWED = '2026-07-03';

const PNI_SOURCE = {
  id: 'pni-calendario-vacinal',
  tier: 'A' as const,
  issuer: 'MS/PNI',
  title: 'Calendário Nacional de Vacinação',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
  covers: ['hepatite B IM', 'BCG intradérmica', 'sítio vacinal lactente'],
};

const COFEN_SOURCE = {
  id: 'vias-administracao-cofen',
  tier: 'A' as const,
  issuer: 'COFEN',
  title: 'Vias de administração de medicamentos',
  year: 2017,
  url: 'https://www.cofen.gov.br/',
  covers: [
    'absorção IM x SC x IV',
    'via oral enteral',
    'técnica IM 90°',
    'sítios SC',
    'ventroglúteo',
    'deltoide volume',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Vias e absorção',
  year: 2020,
  covers: ['absorção por via', 'técnica de punção', 'apresentação farmacêutica', 'hipodermóclise'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'certo_errado';
  branch: 'via_vf_absorcao' | 'via_tecnica_admin' | 'via_generico';
  guideline: string;
  roi_error?: string;
  cluster?: string;
  sources?: (typeof COFEN_SOURCE)[];
  slides: unknown[];
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
      cluster: pack.cluster ?? 'Perfis de via',
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: pack.sources ?? [COFEN_SOURCE, POTTER_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'fundatec-enfermagem-vias-de-administracao-1778968666352-7': {
    family: 'conceito',
    branch: 'via_tecnica_admin',
    cluster: 'Perfis de via',
    guideline: 'PNI/MS — vacina hepatite B em crianças por via intramuscular',
    roi_error: 'hepatite_b_sc_id',
    sources: [PNI_SOURCE, COFEN_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hepatite B pediátrica — via vacinal',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Vacina hepatite B em crianças — escolher a via de administração correta entre cinco opções.',
            icon: 'Target',
          },
          {
            label: 'Hepatite B (recombinante)',
            detail: 'Imunobiológico do calendário — aplicação IM no músculo adequado à idade.',
            icon: 'Syringe',
          },
          {
            label: 'Intramuscular (gabarito)',
            detail: 'Via padrão para hepatite B em lactentes e crianças — massa muscular segura.',
            icon: 'CheckCircle',
          },
          {
            label: 'Subcutânea / intradérmica',
            detail: 'Pegadinha: outras vacinas usam SC ou ID, mas hepatite B segue protocolo IM.',
            icon: 'XCircle',
          },
          {
            label: 'Oral / endovenosa',
            detail: 'Hepatite B não é vacina oral nem rotina EV em calendário pediátrico.',
            icon: 'Ban',
          },
          {
            label: 'Erro ROI desta prova',
            detail: 'Marcar SC ou ID por confundir com BCG/rotina de outras vacinas.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Hepatite B pediátrica = IM — não confunda com BCG (ID)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar o imunobiológico: vacina hepatite B em crianças.',
          'Eliminar oral (E): hepatite B não é vacina oral no calendário.',
          'Eliminar endovenosa (C): não é via vacinal de rotina.',
          'Eliminar subcutânea (A) e intradérmica (B): perfil de outras vacinas, não hepatite B.',
          'Confirmar intramuscular (D): protocolo PNI para hepatite B.',
          'Marcar D.',
          'Fixação: hepatite B = IM; BCG = ID; insulina = SC.',
        ],
        footer_rule: 'Cada vacina tem via própria — não generalize',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vacinas × via',
        meta: slideMeta,
        content: 'PARES VACINAIS CLÁSSICOS',
        rows: [
          { label: 'Hepatite B', value: 'Via IM — lactente e criança', badge: 'hot' },
          { label: 'BCG', value: 'Via intradérmica — deltoide direito', badge: 'ok' },
          { label: 'Pentavalente', value: 'Via IM — vasto lateral no lactente', badge: 'ok' },
          { label: 'Insulina', value: 'Via SC — não vacinal', badge: 'info' },
          { label: 'Pegadinha', value: 'Não trocar via entre imunobiológicos', emphasis: 'alert', badge: 'warn' },
        ],
        footer_rule: 'Memorize o par vacina–via do calendário',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS FUNDATEC — HEPATITE B',
        items: [
          {
            label: 'Letra A — subcutânea',
            detail: 'SC é via de insulina/heparina, não hepatite B vacinal.',
            correct: 'Hepatite B pediátrica administra-se por via intramuscular, não subcutânea.',
          },
          {
            label: 'Letra B — intradérmica',
            detail: 'ID é perfil da BCG e testes cutâneos.',
            correct: 'Hepatite B não segue via intradérmica no calendário — gabarito é IM.',
          },
          {
            label: 'Letra C — endovenosa',
            detail: 'EV não é rota vacinal de rotina em crianças.',
            correct: 'Vacina hepatite B não se administra por via endovenosa em prova de calendário.',
          },
          {
            label: 'Letra E — oral',
            detail: 'Vacina recombinante injetável — não deglutição.',
            correct: 'Hepatite B não é vacina oral — via correta é intramuscular (D).',
          },
        ],
        footer_rule: 'Hepatite B = D (IM)',
      },
    ],
  },

  'lj-assessoria-enfermagem-vias-de-administracao-1778968906156-2': {
    family: 'certo_errado',
    branch: 'via_generico',
    cluster: 'INCORRETA / EXCETO',
    guideline: 'PNI/MS — biossegurança em vacinas, soros e imunoglobulinas: higiene, validade, assepsia e EPI',
    roi_error: 'soro_ev_sem_assepsia',
    sources: [PNI_SOURCE, COFEN_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vacinas e soros — mapa INCORRETA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'INCORRETA sobre procedimentos de vacinas, soros e imunoglobulinas — quatro condutas corretas; uma nega biossegurança.',
            icon: 'Target',
          },
          {
            label: 'Higiene das mãos',
            detail: 'Antes e depois do manuseio — padrão de biossegurança em imunobiológicos.',
            icon: 'Hand',
          },
          {
            label: 'Validade do frasco',
            detail: 'Verificar prazo antes de abrir — integridade do produto.',
            icon: 'Calendar',
          },
          {
            label: 'BCG no deltoide direito',
            detail: 'Inserção inferior do deltoide direito — cicatriz vacinal identificável (PNI).',
            icon: 'Shield',
          },
          {
            label: 'Limpeza da pele',
            detail: 'Sujidade perceptível → água e sabão ou álcool 70% antes da punção.',
            icon: 'Droplets',
          },
          {
            label: 'Erro ROI — soros sem assepsia',
            detail: 'Letra E dispensa luvas e assepsia na EV — inaceitável em qualquer punção.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'INCORRETA = achar a falsa — nunca dispensar assepsia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: INCORRETA — quatro afirmativas verdadeiras, uma falsa.',
          'Testar A: higiene das mãos antes/depois → conduta correta → eliminar.',
          'Testar B: verificar validade antes de abrir → correta → eliminar.',
          'Testar C: BCG no deltoide direito inferior → padrão PNI → eliminar.',
          'Testar D: limpar pele suja com água/sabão ou álcool 70% → correta → eliminar.',
          'Testar E: soros EV sem luvas nem assepsia → FALSO — viola biossegurança.',
          'Confirmar: punção parenteral sempre exige técnica asséptica e EPI.',
          'Marcar E.',
        ],
        footer_rule: 'Nenhuma via parenteral dispensa assepsia',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — biossegurança vacinal',
        meta: slideMeta,
        content: 'IMUNOBIOLÓGICOS — CONDUTAS CORRETAS',
        rows: [
          { label: 'Higiene das mãos', value: 'Antes e depois do manuseio', badge: 'hot' },
          { label: 'Validade', value: 'Conferir antes de abrir o frasco', badge: 'ok' },
          { label: 'BCG', value: 'ID — inserção inferior deltoide direito', badge: 'ok' },
          { label: 'Pele suja', value: 'Água e sabão ou álcool 70%', badge: 'ok' },
          { label: 'Soros EV', value: 'Luvas + assepsia obrigatórias', emphasis: 'alert', badge: 'hot' },
        ],
        footer_rule: 'EPI e assepsia em toda punção',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS LJ — BIOSSEGURANÇA',
        items: [
          {
            label: 'Letra A — higiene das mãos',
            detail: 'Conduta padrão em qualquer manipulação de imunobiológicos.',
            correct: 'Afirmativa correta: higienizar mãos antes e depois do manuseio.',
          },
          {
            label: 'Letra B — validade',
            detail: 'Checagem obrigatória de integridade do produto.',
            correct: 'Afirmativa correta: verificar prazo de validade antes de abrir.',
          },
          {
            label: 'Letra C — BCG deltoide',
            detail: 'Localização para cicatriz vacinal identificável.',
            correct: 'Afirmativa correta: BCG na inserção inferior do deltoide direito (PNI).',
          },
          {
            label: 'Letra D — limpeza da pele',
            detail: 'Sujidade perceptível exige limpeza prévia.',
            correct: 'Afirmativa correta: pele suja deve ser limpa com água/sabão ou álcool 70%.',
          },
          {
            label: 'Letra E — soros sem assepsia',
            detail: 'Nega luvas e assepsia em administração endovenosa.',
            correct: 'INCORRETA: soros por EV exigem luvas e assepsia da pele — nunca dispensar.',
          },
        ],
        footer_rule: 'E é a única falsa — viola biossegurança',
      },
    ],
  },

  'fundatec-enfermagem-vias-de-administracao-1778968825263-0': {
    family: 'conceito',
    branch: 'via_tecnica_admin',
    cluster: 'Técnica de administração (ângulo, volume, sítio)',
    guideline: 'COFEN/Potter — IM no adulto: agulha perpendicular à pele (90°)',
    roi_error: 'angulo_im_sc_confusao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica IM — ângulo da agulha',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Ângulo da agulha ao administrar medicação IM no paciente adulto.',
            icon: 'Target',
          },
          {
            label: 'Via intramuscular',
            detail: 'Injeção no tecido muscular — atravessa pele e subcutâneo até o músculo.',
            icon: 'Syringe',
          },
          {
            label: '90° perpendicular',
            detail: 'Gabarito: agulha em ângulo reto à pele — penetração direta no músculo.',
            icon: 'CheckCircle',
          },
          {
            label: '45° — perfil SC',
            detail: 'Pegadinha clássica: 45° é técnica subcutânea, não IM.',
            icon: 'XCircle',
          },
          {
            label: '25°–60° — outras vias',
            detail: 'Ângulos intermediários não correspondem à IM padrão em prova.',
            icon: 'GitCompare',
          },
          {
            label: 'Erro ROI desta prova',
            detail: 'Marcar 45° por confundir IM com SC — banca oferece exatamente esse distrator.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'IM adulto = 90° · SC = 45°–90° (pinça)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Fixar a via: intramuscular no adulto.',
          'Eliminar 25° (A) e 30° (B): não correspondem à técnica IM padrão.',
          'Eliminar 45° (C): ângulo clássico de SC — distrator frequente.',
          'Eliminar 60° (D): não é referência de IM em fundamentos.',
          'Confirmar 90° (E): perpendicular à pele — técnica IM correta.',
          'Marcar E.',
          'Fixação: IM = 90° · SC = pinça + 45°.',
        ],
        footer_rule: 'Ângulo separa IM de SC na prova',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ângulos por via',
        meta: slideMeta,
        content: 'ÂNGULO DA AGULHA — MNEMÔNICO',
        rows: [
          { label: 'Intramuscular', value: '90° perpendicular à pele', badge: 'hot' },
          { label: 'Subcutânea', value: '45°–90° com pinça de pele', badge: 'ok' },
          { label: 'Intradérmica', value: '10°–15° — bevel quase paralelo', badge: 'info' },
          { label: 'Intravenosa', value: '15°–30° conforme acesso', badge: 'info' },
          { label: 'Pegadinha', value: '45° na IM = erro clássico de prova', emphasis: 'alert', badge: 'warn' },
        ],
        footer_rule: 'IM ≠ SC — ângulo é o primeiro filtro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS FUNDATEC — ÂNGULO IM',
        items: [
          {
            label: 'Letra A — 25°',
            detail: 'Ângulo baixo — não é referência de IM.',
            correct: 'IM no adulto exige 90°, não 25°.',
          },
          {
            label: 'Letra B — 30°',
            detail: 'Perfil de acesso venoso, não IM.',
            correct: '30° não é ângulo padrão de punção intramuscular.',
          },
          {
            label: 'Letra C — 45°',
            detail: 'Distrator clássico — técnica subcutânea.',
            correct: '45° pertence à SC com pinça — IM exige 90° perpendicular.',
          },
          {
            label: 'Letra D — 60°',
            detail: 'Valor intermediário sem respaldo em IM.',
            correct: '60° não fecha a técnica IM — gabarito é 90° (E).',
          },
        ],
        footer_rule: 'E (90°) é o único ângulo IM correto',
      },
    ],
  },

  'ms-sarmento-enfermagem-vias-de-administracao-1776056391403-5': {
    family: 'certo_errado',
    branch: 'via_tecnica_admin',
    cluster: 'INCORRETA / EXCETO',
    guideline: 'COFEN/Potter — sítios IM: ventroglúteo seguro; deltoide volume limitado; vasto lateral em lactentes',
    roi_error: 'deltoide_grande_volume',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sítios IM — mapa INCORRETA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'INCORRETA sobre administração IM — quatro afirmativas verdadeiras; uma erra volume ou sítio.',
            icon: 'Target',
          },
          {
            label: 'Ventroglúteo',
            detail: 'Glúteo médio — distante de nervos/vasos; sítio preferido e seguro em adultos.',
            icon: 'Shield',
          },
          {
            label: 'Localização ventroglútea',
            detail: 'Método do triângulo em V: palma no trocânter, indicador na EIAS, médio na crista ilíaca.',
            icon: 'MapPin',
          },
          {
            label: 'Vasto lateral',
            detail: 'Preferido para imunobiológicos em lactentes e crianças — massa muscular adequada.',
            icon: 'Baby',
          },
          {
            label: 'Trajeto em Z',
            detail: 'Técnica de pinçar a pele — recomendada em IM para selar o medicamento.',
            icon: 'Layers',
          },
          {
            label: 'Erro ROI — deltoide grande volume',
            detail: 'Letra B autoriza grandes volumes no deltoide — falso; deltoide tem limite (~1–2 mL).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Deltoide = volume pequeno · ventroglúteo = volume maior',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: INCORRETA sobre sítios e técnica IM.',
          'Testar A: ventroglúteo seguro, distante de nervos → correta → eliminar.',
          'Testar C: método de localização do ventroglúteo → correta → eliminar.',
          'Testar D: vasto lateral preferido em lactentes → correta → eliminar.',
          'Testar E: trajeto em Z na IM → correta → eliminar.',
          'Testar B: deltoide para grandes volumes em crianças e adultos → FALSO.',
          'Confirmar: deltoide limita volume; grandes volumes vão ao ventroglúteo/vasto.',
          'Marcar B.',
        ],
        footer_rule: 'Grande volume ≠ deltoide',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sítios IM',
        meta: slideMeta,
        content: 'SÍTIOS IM — VOLUME E SEGURANÇA',
        rows: [
          { label: 'Ventroglúteo', value: 'Preferido adultos — até ~3 mL', badge: 'hot' },
          { label: 'Deltoide', value: 'Volume limitado (~1–2 mL) — não “grandes volumes”', emphasis: 'alert', badge: 'warn' },
          { label: 'Vasto lateral', value: 'Preferido lactentes/crianças — vacinas', badge: 'ok' },
          { label: 'Trajeto Z', value: 'Técnica IM — pinçar pele', badge: 'info' },
          { label: 'Glúteo dorsal', value: 'Evitar — risco nervo ciático', badge: 'warn' },
        ],
        footer_rule: 'Volume define o sítio — deltoide é restrito',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS MS SARMENTO — SÍTIOS IM',
        items: [
          {
            label: 'Letra A — ventroglúteo',
            detail: 'Descrição anatômica e segurança corretas.',
            correct: 'Afirmativa correta: ventroglúteo é sítio preferido e seguro em adultos.',
          },
          {
            label: 'Letra C — localização ventroglútea',
            detail: 'Método do triângulo em V — técnica padrão.',
            correct: 'Afirmativa correta: localização por marcos ósseos no ventroglúteo.',
          },
          {
            label: 'Letra D — vasto lateral',
            detail: 'Sítio vacinal pediátrico de referência.',
            correct: 'Afirmativa correta: vasto lateral preferido para imunobiológicos em lactentes.',
          },
          {
            label: 'Letra E — trajeto Z',
            detail: 'Técnica de pinçar pele na IM.',
            correct: 'Afirmativa correta: trajeto em Z é técnica recomendada em IM.',
          },
          {
            label: 'Letra B — deltoide grandes volumes',
            detail: 'Deltoide tem massa e volume limitados.',
            correct: 'INCORRETA: deltoide não admite grandes volumes — limite ~1–2 mL.',
          },
        ],
        footer_rule: 'B inverte capacidade do deltoide',
      },
    ],
  },

  'furb-enfermagem-vias-de-administracao-1776056401060-8': {
    family: 'conceito',
    branch: 'via_vf_absorcao',
    cluster: 'Perfis de via',
    guideline: 'COFEN/Potter — via SC: insulina, heparina; alguns diuréticos em cuidados paliativos',
    roi_error: 'sc_todos_medicamentos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Medicação SC — perfil da via',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Medicamento que pode ser aplicado por via subcutânea entre cinco opções.',
            icon: 'Target',
          },
          {
            label: 'Via subcutânea',
            detail: 'Tecido adiposo hipodérmico — absorção lenta e constante.',
            icon: 'Droplets',
          },
          {
            label: 'Furosemida (gabarito)',
            detail: 'Diurético de alça — em cuidados paliativos pode ser administrado SC (hipodermóclise/off-label).',
            icon: 'CheckCircle',
          },
          {
            label: 'Fenitoína / diazepam / clorpromazina',
            detail: 'Anticonvulsivante, benzodiazepínico e antipsicótico — perfil IM/IV, não SC de rotina.',
            icon: 'XCircle',
          },
          {
            label: '“Todos os medicamentos”',
            detail: 'Pegadinha absoluta — nem todo fármaco tolera SC.',
            icon: 'Ban',
          },
          {
            label: 'Erro ROI desta prova',
            detail: 'Escolher anticonvulsivante IM ou aceitar “todos” — ignorar perfil SC paliativo.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'SC ≠ universal — insulina, heparina e alguns paliativos',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Fixar via: subcutânea — hipoderme.',
          'Eliminar A: “todos os medicamentos” — absoluto falso.',
          'Eliminar B fenitoína: anticonvulsivante — IM/IV, não SC clássica.',
          'Eliminar D diazepam e E clorpromazina: perfil injetável IM/IV.',
          'Confirmar C furosemida: admissível SC em contextos específicos (paliativo).',
          'Marcar C.',
          'Fixação: insulina/heparina = SC; furosemida SC em paliativo.',
        ],
        footer_rule: 'Leia o perfil farmacológico antes da via',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — fármacos SC',
        meta: slideMeta,
        content: 'MEDICAMENTOS × VIA SC',
        rows: [
          { label: 'Insulina', value: 'Via SC de referência', badge: 'hot' },
          { label: 'Heparina', value: 'Via SC — anticoagulação', badge: 'ok' },
          { label: 'Furosemida', value: 'SC em paliativo/hipodermóclise', badge: 'info' },
          { label: 'Fenitoína', value: 'IM/IV — não SC de rotina', badge: 'warn' },
          { label: 'Absoluto falso', value: '“Todos” na SC — eliminar sempre', emphasis: 'alert', badge: 'hot' },
        ],
        footer_rule: 'Pares clássicos: insulina e heparina = SC',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS FURB — VIA SC',
        items: [
          {
            label: 'Letra A — todos os medicamentos',
            detail: 'Generalização impossível — irritantes e vesicantes contraindicam SC.',
            correct: 'Falso: nem todo medicamento pode ser aplicado por via subcutânea.',
          },
          {
            label: 'Letra B — fenitoína',
            detail: 'Anticonvulsivante — via IM/IV em emergência.',
            correct: 'Fenitoína não é medicamento SC de rotina — perfil IM/IV.',
          },
          {
            label: 'Letra D — diazepam',
            detail: 'Benzodiazepínico injetável — IM/IV.',
            correct: 'Diazepam administra-se IM ou IV, não SC clássica.',
          },
          {
            label: 'Letra E — clorpromazina',
            detail: 'Antipsicótico — perfil IM em agitação.',
            correct: 'Clorpromazina segue via IM/IV — não é exemplo SC desta prova.',
          },
        ],
        footer_rule: 'C (furosemida) é o par SC aceito',
      },
    ],
  },

  'furb-enfermagem-vias-de-administracao-1778968629127-1': {
    family: 'conceito',
    branch: 'via_vf_absorcao',
    cluster: 'Perfis de via',
    guideline: 'COFEN — heparina e insulina: via subcutânea de referência',
    roi_error: 'heparina_im_iv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Heparina e insulina — via correta',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Via muito utilizada para heparina (trombose) e insulina (diabetes).',
            icon: 'Target',
          },
          {
            label: 'Heparina',
            detail: 'Anticoagulante — destruído no TGI; requer via parenteral não irritante.',
            icon: 'Droplets',
          },
          {
            label: 'Insulina',
            detail: 'Hormônio proteico — via SC clássica com rodízio de sítios.',
            icon: 'Syringe',
          },
          {
            label: 'Subcutânea (gabarito)',
            detail: 'Tecido adiposo — absorção lenta e previsível para ambos.',
            icon: 'CheckCircle',
          },
          {
            label: 'IM / IV / retal',
            detail: 'Pegadinhas: heparina não é IM de rotina; insulina não é oral nem retal.',
            icon: 'XCircle',
          },
          {
            label: 'Erro ROI desta prova',
            detail: 'Marcar IM ou IV por hábito de “injetável = muscular”.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Heparina + insulina = SC — par mais cobrado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar os fármacos: heparina e insulina.',
          'Eliminar retal (A): não é via desses medicamentos.',
          'Eliminar respiratória (B): não se aplica.',
          'Eliminar IM (D): insulina/heparina não são IM de rotina.',
          'Eliminar IV (E): insulina domiciliar é SC; heparina profilática também.',
          'Confirmar subcutânea (C): par clássico de prova.',
          'Marcar C.',
        ],
        footer_rule: 'Proteico/anticoagulante crônico → SC',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — pares SC',
        meta: slideMeta,
        content: 'FÁRMACOS SC — DECORE',
        rows: [
          { label: 'Insulina', value: 'Via SC — rodízio de sítios', badge: 'hot' },
          { label: 'Heparina', value: 'Via SC — anticoagulação profilática', badge: 'hot' },
          { label: 'Enoxaparina', value: 'Via SC — HBPM', badge: 'ok' },
          { label: 'Não é SC', value: 'Adrenalina IM em anafilaxia', badge: 'warn' },
          { label: 'Não é oral', value: 'Proteicos destruídos no TGI', emphasis: 'alert', badge: 'info' },
        ],
        footer_rule: 'Insulina + heparina = SC na prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS FURB — HEPARINA/INSULINA',
        items: [
          {
            label: 'Letra A — retal',
            detail: 'Nenhum dos dois usa via retal.',
            correct: 'Heparina e insulina não se administram por via retal.',
          },
          {
            label: 'Letra B — respiratória',
            detail: 'Via inalatória — não se aplica.',
            correct: 'Via respiratória não é rota de heparina nem insulina.',
          },
          {
            label: 'Letra D — intramuscular',
            detail: 'IM irrita e altera absorção — não é via de rotina.',
            correct: 'Insulina e heparina não são IM de rotina — via correta é SC.',
          },
          {
            label: 'Letra E — intravenosa',
            detail: 'Heparina terapêutica pode ser EV, mas par da prova é SC profilática.',
            correct: 'O par clássico heparina/insulina domiciliar é subcutâneo (C).',
          },
        ],
        footer_rule: 'C fecha o par mais cobrado em farmacologia',
      },
    ],
  },

  'gualimp-enfermagem-vias-de-administracao-1778968687469-3': {
    family: 'conceito',
    branch: 'via_vf_absorcao',
    cluster: 'Perfis de via',
    guideline: 'COFEN/Potter — via IV: soluções aquosas, suspensões e emulsões em infusão',
    roi_error: 'iv_aquosas_confusao_im',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preparações aquosas — via de infusão',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Via em que se administram preparações aquosas na maioria das vezes — suspensões ou emulsões óleo em água em menor caso.',
            icon: 'Target',
          },
          {
            label: 'Intravenosa (gabarito)',
            detail: 'Infusão direta na circulação — soluções aquosas, cristaloides e coloides.',
            icon: 'Zap',
          },
          {
            label: 'Intramuscular',
            detail: 'Volumes limitados no músculo — não é via de infusão contínua.',
            icon: 'XCircle',
          },
          {
            label: 'Subcutânea',
            detail: 'Hipoderme — volumes pequenos; hipodermóclise em casos específicos.',
            icon: 'XCircle',
          },
          {
            label: 'Intradérmica',
            detail: 'Gotícula na derme — testes e vacinas, não infusão aquosa.',
            icon: 'XCircle',
          },
          {
            label: 'Erro ROI desta prova',
            detail: 'Confundir IM (bolus muscular) com infusão de soluções aquosas.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Solução aquosa em volume = IV',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler o perfil: preparações aquosas, suspensões, emulsões — linguagem de infusão.',
          'Eliminar intradérmica (D): volume mínimo na derme.',
          'Eliminar SC (C): hipoderme não recebe infusão aquosa de rotina.',
          'Eliminar IM (B): bolus muscular, não linha de infusão.',
          'Confirmar intravenosa (A): via de soluções aquosas e emulsões.',
          'Marcar A.',
          'Fixação: cristaloide/coloide = IV.',
        ],
        footer_rule: 'Infusão contínua → sempre IV',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — apresentação × via',
        meta: slideMeta,
        content: 'PREPARAÇÕES × VIA',
        rows: [
          { label: 'Solução aquosa', value: 'Via IV — infusão ou bolus', badge: 'hot' },
          { label: 'Suspensão/emulsão', value: 'IV em menor caso — mistura compatível', badge: 'info' },
          { label: 'Insulina', value: 'SC — não infusão aquosa IV de rotina', badge: 'ok' },
          { label: 'IM', value: 'Bolus limitado — não infusão', badge: 'warn' },
          { label: 'ID', value: 'Gotícula — testes/vacinas', badge: 'info' },
        ],
        footer_rule: 'Aquoso em volume = acesso venoso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS GUALIMP — INFUSÃO',
        items: [
          {
            label: 'Letra B — intramuscular',
            detail: 'IM recebe bolus, não infusão de solução aquosa.',
            correct: 'Preparações aquosas em infusão não vão por via intramuscular.',
          },
          {
            label: 'Letra C — subcutânea',
            detail: 'SC admite volumes pequenos — não perfil de infusão aquosa majoritária.',
            correct: 'Via SC não é rota principal de soluções aquosas em volume.',
          },
          {
            label: 'Letra D — intradérmica',
            detail: 'Volume mínimo na derme.',
            correct: 'Intradérmica não administra preparações aquosas em infusão.',
          },
          {
            label: 'Confundir com hipodermóclise',
            detail: 'SC lenta é exceção paliativa, não “maioria das vezes”.',
            correct: 'A via IV concentra preparações aquosas — gabarito A.',
          },
        ],
        footer_rule: 'Maioria aquosa = IV',
      },
    ],
  },

  'ibade-enfermagem-vias-de-administracao-1778968862077-2': {
    family: 'conceito',
    branch: 'via_vf_absorcao',
    cluster: 'Perfis de via',
    guideline: 'COFEN — vias enterais: oral, sublingual, retal; parenteral = fora do TGI',
    roi_error: 'enteral_parenteral_confusao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via enteral — classificação',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Identificar qual alternativa é via enteral de administração de medicamentos.',
            icon: 'Target',
          },
          {
            label: 'Enteral',
            detail: 'Medicamento atravessa ou atinge o trato gastrointestinal — oral, sublingual, retal.',
            icon: 'Pill',
          },
          {
            label: 'Sublingual (gabarito)',
            detail: 'Mucosa oral sob a língua — absorção rápida, ainda classificada como enteral.',
            icon: 'CheckCircle',
          },
          {
            label: 'Parenteral',
            detail: 'IM, SC, IV, intracardíaca — fora do TGI; pegadinha em prova.',
            icon: 'Syringe',
          },
          {
            label: 'Erro ROI desta prova',
            detail: 'Marcar IM ou IV por focar em “injetável” e esquecer que enteral inclui sublingual.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Enteral = TGI · sublingual conta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Fixar conceito: enteral = via do trato digestório.',
          'Eliminar intramuscular (B): parenteral — fora do TGI.',
          'Eliminar subcutânea (C): parenteral.',
          'Eliminar intravenosa (D): parenteral.',
          'Eliminar intracardíaca (E): parenteral especial.',
          'Confirmar sublingual (A): mucosa oral — via enteral.',
          'Marcar A.',
        ],
        footer_rule: 'Sublingual é enteral — não confunda com parenteral',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — enteral × parenteral',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO DAS VIAS',
        rows: [
          { label: 'Enterais', value: 'Oral · sublingual · retal', badge: 'hot' },
          { label: 'Parenterais', value: 'IV · IM · SC · ID · intratecal…', badge: 'ok' },
          { label: 'Sublingual', value: 'Enteral — mucosa oral', emphasis: 'alert', badge: 'hot' },
          { label: 'Intramuscular', value: 'Parenteral — não enteral', badge: 'warn' },
          { label: 'Mnemônico', value: 'Enteral = passa pelo TGI (mesmo sublingual)', badge: 'info' },
        ],
        footer_rule: 'Sublingual entra no grupo enteral',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS IBADE — ENTERAL',
        items: [
          {
            label: 'Letra B — intramuscular',
            detail: 'Injeção no músculo — parenteral.',
            correct: 'IM é via parenteral, não enteral.',
          },
          {
            label: 'Letra C — subcutânea',
            detail: 'Hipoderme — fora do TGI.',
            correct: 'SC é parenteral — não classificada como enteral.',
          },
          {
            label: 'Letra D — intravenosa',
            detail: 'Acesso direto à circulação.',
            correct: 'IV é parenteral — gabarito é sublingual (A).',
          },
          {
            label: 'Letra E — intracardíaca',
            detail: 'Via de emergência extrema — parenteral.',
            correct: 'Intracardíaca é parenteral — enteral correta é sublingual.',
          },
        ],
        footer_rule: 'A (sublingual) é a única enteral',
      },
    ],
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:vias-g23] OK ${slug}`);
  }
  console.log(`[handcraft:vias-g23] total=${ok}`);
}

main();
