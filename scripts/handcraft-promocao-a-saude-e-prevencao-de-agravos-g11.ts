#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — promocao-a-saude-e-prevencao-de-agravos-g11 (8 slugs).
 *
 *   npm run handcraft:promocao-a-saude-e-prevencao-de-agravos-g11
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PROMOCAO_SAUDE_SUS } from '@/lib/guidelines/promocaoSaude';

const LOTE = 'promocao-a-saude-e-prevencao-de-agravos-g11';
const SUBTOPICO = 'Promoção à Saúde e Prevenção de Agravos';
const REVIEWED = '2026-07-20';

const MS_PROMOCAO_SOURCE = {
  id: PROMOCAO_SAUDE_SUS.id,
  tier: 'A' as const,
  issuer: PROMOCAO_SAUDE_SUS.issuer,
  title: PROMOCAO_SAUDE_SUS.title,
  year: PROMOCAO_SAUDE_SUS.year,
  url: PROMOCAO_SAUDE_SUS.url,
  covers: [
    'educação popular',
    'comissões intersetoriais',
    'pé diabético',
    'saneamento básico',
    'lesão por pressão',
    'hipertensão',
    'poluição ambiental',
    'Carta de Ottawa',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[] };
  modulo_slug?: string;
};

type Branch =
  | 'promocao_educacao_prevencao'
  | 'promocao_principios_direitos'
  | 'promocao_generico';

type Pack = {
  family: 'legis' | 'certo_errado' | 'conceito' | 'protocolo' | 'vf';
  branch: Branch;
  guideline: string;
  sources?: (typeof MS_PROMOCAO_SOURCE)[];
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  return {
    ...q.meta,
    topico: String(q.meta.topico ?? 'Enfermagem'),
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
    },
    sources: pack.sources ?? [MS_PROMOCAO_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\bPodemosafirmar\b/gi, 'Podemos afirmar')
    .replace(/\bgeralmente sobre\b/gi, 'geralmente, sobre')
    .replace(/\bmudança dedecúbito\b/gi, 'mudança de decúbito')
    .replace(/\bumamesma\b/gi, 'uma mesma')
    .replace(/\befeitosnegativo\b/gi, 'efeitos negativos')
    .replace(/\bseres vivosprovenientes\b/gi, 'seres vivos provenientes')
    .replace(/\bambien\b/gi, 'ambientes')
    .replace(/([.!?])([A-Za-zÀ-ú])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanQuestionData(qd: Q['question_data']): Q['question_data'] {
  return {
    ...qd,
    instruction: cleanPdfNoise(qd.instruction),
    options: qd.options.map((o) => ({ ...o, text: cleanPdfNoise(o.text) })),
  };
}

const SPECS: Record<string, Pack> = {
  'ivin-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-0': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Educação popular em saúde — Paulo Freire / SUS',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Educação popular',
        meta: slideMeta,
        items: [
          { label: 'Matéria-prima', detail: 'O povo e a comunidade como sujeito do processo.', icon: 'Users' },
          { label: 'Território', detail: 'Entorno social valorizado — não sala isolada.', icon: 'MapPin' },
          { label: 'Educação popular', detail: 'Diálogo, criticidade e transformação social.', icon: 'Heart' },
          { label: 'Não confundir', detail: 'Sanitária autoritária, elitista ou simplista.', icon: 'Ban' },
          { label: 'Promoção', detail: 'Estratégia educativa participativa no SUS.', icon: 'Megaphone' },
        ],
        footer_rule: 'Comunidade = sujeito da educação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: nome da estratégia educativa descrita (comunidade como matéria-prima).',
          'Eliminar A — primordial: termo inexistente no método.',
          'Eliminar B — elitista: oposto da valorização comunitária.',
          'Eliminar C — simplista: reducionismo — não é o conceito freireano.',
          'Eliminar E — educação sanitária: modelo vertical/transmissivo clássico.',
          'Manter D — educação popular.',
          'Marcar letra D.',
          'Em similares: “matéria-prima é o povo” → educação popular.',
        ],
        footer_rule: 'Freire = educação popular',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EDUCAÇÃO POPULAR',
        rows: [
          { label: 'Sujeito', value: 'Comunidade e entorno social', badge: 'hot' },
          { label: 'Método', value: 'Diálogo e problematização', badge: 'hot' },
          { label: '≠', value: 'Sanitária vertical ou elitista', badge: 'warn' },
          { label: 'SUS', value: 'Base da promoção participativa', badge: 'ok' },
        ],
        footer_rule: 'Povo protagonista do saber',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESTRATÉGIA',
        items: [
          {
            label: 'Letra A — primordial',
            detail: 'Termo inventado.',
            correct: 'Não nomeia a estratégia freireana.',
          },
          {
            label: 'Letra B — elitista',
            detail: 'Exclui a comunidade.',
            correct: 'Contradiz o texto — eliminar.',
          },
          {
            label: 'Letra C — simplista',
            detail: 'Redução do processo educativo.',
            correct: 'Não é educação popular.',
          },
          {
            label: 'Letra E — sanitária',
            detail: 'Modelo transmissivo tradicional.',
            correct: 'Diferente da valorização social do enunciado.',
          },
          {
            label: 'Transferência — palestra',
            detail: 'Técnico fala e comunidade ouve.',
            correct: 'Educação popular participativa — D.',
          },
        ],
        footer_rule: 'D = educação popular',
      },
    ],
  },

  'lj-assessoria-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-0': {
    family: 'certo_errado',
    branch: 'promocao_principios_direitos',
    guideline: 'Comissões intersetoriais — PNPS / políticas intersetoriais (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Comissão intersetorial',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Atividades das comissões intersetoriais — EXCETO.', icon: 'AlertTriangle' },
          { label: 'Alimentação', detail: 'Nutrição e segurança alimentar.', icon: 'Apple' },
          { label: 'Saneamento', detail: 'Meio ambiente e água/esgoto.', icon: 'Droplets' },
          { label: 'Vigilância', detail: 'Sanitária e farmacoepidemiologia.', icon: 'Shield' },
          { label: 'Trabalho', detail: 'Saúde do trabalhador.', icon: 'Briefcase' },
        ],
        footer_rule: 'Articulação intersetorial ampla',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: atividades das comissões intersetoriais — EXCETO.',
          'A: alimentação e nutrição — eixo clássico intersetorial.',
          'C: saneamento e meio ambiente — determinante estrutural.',
          'D: vigilância sanitária e farmacoepidemiologia — política pública articulada.',
          'E: saúde do trabalhador — campo obrigatório na intersetorialidade.',
          'B: “ciência e cultural” — formulação atípica/fora do rol usual da questão.',
          'Marcar letra B.',
          'Em similares: EXCETO em intersetorial — item mal formulado ou ausente no rol.',
        ],
        footer_rule: 'EXCETO = B (ciência e cultural)',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'INTERSETORIALIDADE',
        rows: [
          { label: 'Inclui', value: 'Alimentação · saneamento · vigilância', badge: 'hot' },
          { label: 'Inclui', value: 'Saúde do trabalhador', badge: 'ok' },
          { label: 'EXCETO', value: 'Ciência e cultural (B)', badge: 'warn' },
          { label: 'Base', value: 'PNPS e comissões locais', badge: 'info' },
        ],
        footer_rule: 'Políticas articuladas no território',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO',
        items: [
          {
            label: 'Letra A — alimentação',
            detail: 'Nutrição na intersetorial.',
            correct: 'Atividade típica — não é EXCETO.',
          },
          {
            label: 'Letra C — saneamento',
            detail: 'Meio ambiente e saneamento.',
            correct: 'Determinante — integra comissão.',
          },
          {
            label: 'Letra D — vigilância',
            detail: 'Sanitária e farmacoepidemiologia.',
            correct: 'Campo previsto — eliminar.',
          },
          {
            label: 'Letra E — trabalhador',
            detail: 'Saúde do trabalhador.',
            correct: 'Eixo intersetorial clássico.',
          },
          {
            label: 'Letra B — ciência e cultural',
            detail: 'Formulação fora do rol da questão.',
            correct: 'EXCETO apontado pela banca — gabarito.',
          },
          {
            label: 'Transferência — cultura',
            detail: 'Educação e cultura como eixo intersetorial.',
            correct: 'Formulação atípica — gabarito B.',
          },
        ],
        footer_rule: 'B = ciência e cultural (EXCETO)',
      },
    ],
  },

  'maranatha-assessoria-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-1': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Pé diabético — autocuidado na APS (MS/ADA)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pé diabético',
        meta: slideMeta,
        items: [
          { label: 'Inspeção diária', detail: 'Olhar pés, inclusive entre os dedos.', icon: 'Eye' },
          { label: 'Higiene segura', detail: 'Lavar e secar bem — sem água quente nem cortar cutícula.', icon: 'Droplets' },
          { label: 'Calçado', detail: 'Fechado, confortável — evitar andar descalço.', icon: 'Footprints' },
          { label: 'Sinal de alerta', detail: 'Ferida ou vermelhidão → avisar a unidade.', icon: 'AlertTriangle' },
          { label: 'Evitar', detail: 'Escalda-pés, talco, sapato apertado, corticoide por conta.', icon: 'Ban' },
        ],
        footer_rule: 'Autocuidado seguro do pé diabético',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: conjunto alinhado ao autocuidado seguro do pé diabético na APS.',
          'Eliminar B — escalda quente, cortar cutícula, andar descalço: condutas perigosas.',
          'Eliminar C — talco, sapato apertado, pouca troca de meia: aumentam risco.',
          'Eliminar D — corticoide próprio e só procurar com dor intensa: atrasa cuidado.',
          'Manter A — inspeção diária, lavagem/secação, calçado adequado e aviso precoce.',
          'Marcar letra A.',
          'Em similares: pé diabético = prevenção de lesão + detecção precoce.',
        ],
        footer_rule: 'Inspeção + calçado + aviso = A',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'AUTOCUIDADO PÉ DIABÉTICO',
        rows: [
          { label: 'Diário', value: 'Inspecionar e higienizar com secagem', badge: 'hot' },
          { label: 'Calçado', value: 'Fechado e confortável', badge: 'hot' },
          { label: 'Proibido', value: 'Escalda, cutícula, descalço', badge: 'warn' },
          { label: 'Alerta', value: 'Comunicar ferida à equipe', badge: 'ok' },
        ],
        footer_rule: 'Prevenir úlcera é autocuidado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PÉ DIABÉTICO',
        items: [
          {
            label: 'Letra B — escalda',
            detail: 'Água quente e cortar cutícula.',
            correct: 'Risco de queimadura e infecção — eliminar.',
          },
          {
            label: 'Letra C — talco e aperto',
            detail: 'Talco e sapato apertado.',
            correct: 'Favorece ferida e atrito.',
          },
          {
            label: 'Letra D — corticoide',
            detail: 'Pomada hormonal sem orientação.',
            correct: 'Atrasa procura e agrava lesão.',
          },
          {
            label: 'Transferência — unhas',
            detail: 'Cortar unhas em V profundo.',
            correct: 'Inspeção diária e calçado — A.',
          },
        ],
        footer_rule: 'A = pacote seguro de autocuidado',
      },
    ],
  },

  'ms-sarmento-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-1': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Saneamento básico e promoção — MS',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Saneamento e vida',
        meta: slideMeta,
        items: [
          { label: 'Indicador social', detail: 'Saneamento reflete qualidade de vida e desenvolvimento.', icon: 'TrendingUp' },
          { label: 'Educação em saúde', detail: 'Promoção por medidas pessoais e coletivas.', icon: 'BookOpen' },
          { label: 'Água e esgoto', detail: 'Tratamento adequado — não “aproximação” de esgoto.', icon: 'Droplets' },
          { label: 'Drenagem', detail: 'Falta de drenagem agrava risco — não é ação desejada.', icon: 'CloudRain' },
          { label: 'Pegadinha', detail: 'Negar impacto do esgoto domiciliar no trabalho e imóveis.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Saneamento + educação em saúde',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta sobre ações essenciais de saneamento.',
          'Manter A — educação em saúde e promoção por medidas pessoais e coletivas.',
          'Eliminar B — “aproximação” dos esgotos: formulação incorreta; o essencial é tratamento.',
          'Eliminar C — predominância da falta de drenagem: é problema, não ação.',
          'Eliminar D — rede de esgoto não afeta produtividade: falso.',
          'Eliminar E — saneamento não valoriza imóveis: falso.',
          'Marcar letra A.',
          'Em similares: saneamento integra promoção coletiva e educação.',
        ],
        footer_rule: 'Promoção + saneamento = A',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SANEAMENTO ESSENCIAL',
        rows: [
          { label: 'Ação correta', value: 'Educação e promoção coletiva', badge: 'hot' },
          { label: 'Infraestrutura', value: 'Água tratada e esgoto', badge: 'hot' },
          { label: 'Impacto', value: 'Saúde, trabalho e valor imobiliário', badge: 'ok' },
          { label: 'Erro', value: 'Celebrar falta de drenagem', badge: 'warn' },
        ],
        footer_rule: 'Educação em saúde no saneamento',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SANEAMENTO',
        items: [
          {
            label: 'Letra B — esgoto',
            detail: 'Aproximação dos esgotos sanitários.',
            correct: 'Formulação inadequada — não é ação essencial correta.',
          },
          {
            label: 'Letra C — drenagem',
            detail: 'Predominância da falta de drenagem.',
            correct: 'Problema estrutural — eliminar.',
          },
          {
            label: 'Letra D — produtividade',
            detail: 'Esgoto domiciliar não afeta trabalho.',
            correct: 'Saneamento impacta saúde e produtividade.',
          },
          {
            label: 'Letra E — imóveis',
            detail: 'Saneamento não valoriza imóveis.',
            correct: 'Afeta valorização — falsa.',
          },
          {
            label: 'Transferência — só obra',
            detail: 'Saneamento sem educação.',
            correct: 'Medidas pessoais e coletivas — A.',
          },
        ],
        footer_rule: 'A = educação e promoção',
      },
    ],
  },

  'ms-sarmento-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-2': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Prevenção de lesão por pressão — mudança de decúbito (MS/COFEN)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lesão por pressão',
        meta: slideMeta,
        items: [
          { label: 'Causa', detail: 'Pressão intensa em proeminências ósseas ou dispositivos.', icon: 'AlertCircle' },
          { label: 'Pele seca', detail: 'Manter livre de fluidos — higiene suave.', icon: 'Droplets' },
          { label: 'Sem massagear', detail: 'Área avermelhada não deve ser massageada.', icon: 'Ban' },
          { label: 'Decúbito', detail: 'Reposicionamento sistemático do acamado.', icon: 'RefreshCw' },
          { label: 'Pegadinha', detail: 'Água fria, massagear vermelhidão ou poucas mudanças ao dia.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Não massagear — reposicionar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: medidas de prevenção de lesão por pressão.',
          'Eliminar A — massagear regiões avermelhadas: contraindicado.',
          'Eliminar B — água fria na higiene: preferir morna.',
          'Eliminar C — massagear áreas avermelhadas com creme: repete erro.',
          'Eliminar D — mudança de decúbito só três vezes ao dia: frequência insuficiente.',
          'Manter E — pele seca, limpeza suave, sabonete neutro, hidratação e decúbito sistemático.',
          'Marcar letra E.',
          'Em similares: LPP — higiene + hidratação + reposicionamento, sem massagem em eritema.',
        ],
        footer_rule: 'Pacote completo de prevenção = E',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PREVENÇÃO LPP',
        rows: [
          { label: 'Pele', value: 'Limpa, seca e hidratada', badge: 'hot' },
          { label: 'Proibido', value: 'Massagear vermelhidão', badge: 'warn' },
          { label: 'Decúbito', value: 'Mudança sistemática e frequente', badge: 'hot' },
          { label: 'Higiene', value: 'Sabonete neutro e água morna', badge: 'ok' },
        ],
        footer_rule: 'Reposicionar sem massagear eritema',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LPP',
        items: [
          {
            label: 'Letra A — massagem',
            detail: 'Massagear áreas avermelhadas.',
            correct: 'Agrava microcirculação — contraindicado.',
          },
          {
            label: 'Letra B — água fria',
            detail: 'Higiene com água fria.',
            correct: 'Preferir morna — eliminar.',
          },
          {
            label: 'Letra C — creme + massagem',
            detail: 'Hidratar massageando eritema.',
            correct: 'Massagem em vermelhidão é erro.',
          },
          {
            label: 'Letra D — três mudanças',
            detail: 'Decúbito apenas três vezes ao dia.',
            correct: 'Frequência insuficiente para acamados.',
          },
          {
            label: 'Transferência — travesseiro',
            detail: 'Só almofada sem reposicionar.',
            correct: 'Pacote E — higiene, hidratação e decúbito.',
          },
        ],
        footer_rule: 'E = prevenção integrada',
      },
    ],
  },

  'nao-informado-geral-promocao-a-saude-e-prevencao-de-agravos-1779563909811-0': {
    family: 'certo_errado',
    branch: 'promocao_educacao_prevencao',
    guideline: 'HAS — redução de sal e temperos (MS/DG-SA)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sal e HAS',
        meta: slideMeta,
        items: [
          { label: 'Afirmativa', detail: 'Reduzir sal usando temperos que realçam o sabor.', icon: 'FileText' },
          { label: 'Sódio', detail: 'Excesso de sal eleva pressão arterial.', icon: 'HeartPulse' },
          { label: 'Temperos', detail: 'Ervas e especiarias substituem sal na culinária.', icon: 'Leaf' },
          { label: 'Prevenção', detail: 'Hábito alimentar na promoção da saúde.', icon: 'Shield' },
          { label: 'Pegadinha', detail: 'Achar que só remédio previne hipertensão.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Menos sal previne HAS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Afirmativa: reduzir sal substituindo por temperos previne hipertensão.',
          'Excesso de sódio é fator de risco para HAS — orientação do MS.',
          'Temperos naturais ajudam paladar sem aumentar sódio.',
          'Medida de prevenção primária e promoção alimentar.',
          'Afirmativa correta.',
          'Julgar Certo — letra A.',
          'Em similares: culinária com temperos = estratégia anti-HAS.',
        ],
        footer_rule: 'Prevenção alimentar = Certo',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PREVENÇÃO HAS',
        rows: [
          { label: 'Sal', value: 'Reduzir consumo diário', badge: 'hot' },
          { label: 'Substituto', value: 'Temperos naturais', badge: 'hot' },
          { label: 'Objetivo', value: 'Controlar pressão arterial', badge: 'ok' },
          { label: 'Nível', value: 'Prevenção primária', badge: 'info' },
        ],
        footer_rule: 'Menos sódio, mais tempero',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SAL',
        items: [
          {
            label: 'Marcar Errado',
            detail: 'Achar que tempero não previne.',
            correct: 'Reduzir sal com temperos é orientação clássica — Certo.',
          },
          {
            label: 'Confundir com cura',
            detail: 'Substituir medicação só com tempero.',
            correct: 'Questão fala de prevenção — afirmativa válida.',
          },
          {
            label: 'Transferência — sal light',
            detail: 'Só trocar marca de sal.',
            correct: 'Reduzir sódio com temperos — julgue Certo.',
          },
        ],
        footer_rule: 'Certo = prevenção da HAS',
      },
    ],
  },

  'nao-informado-geral-promocao-a-saude-e-prevencao-de-agravos-1779563909811-6': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Poluição ambiental e saúde — MS/OMS',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Poluição e saúde',
        meta: slideMeta,
        items: [
          { label: 'Tipos', detail: 'Atmosférica, hídrica, sonora, visual e do solo.', icon: 'Layers' },
          { label: 'Água contaminada', detail: 'Doença direta no consumo humano.', icon: 'Droplets' },
          { label: 'Via indireta', detail: 'Ingestão de animais de ambiente poluído.', icon: 'Fish' },
          { label: 'Chuva ácida', detail: 'Efeito da poluição atmosférica — não é “granizo misto”.', icon: 'Cloud' },
          { label: 'Pegadinha', detail: 'Restringir poluição visual a outdoors rurais.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Poluição hídrica: via direta e indireta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre poluição e saúde.',
          'Eliminar A — poluição visual só em outdoors rurais: reducionista.',
          'Eliminar B — chuva ácida como água+granizo+neve juntos: confunde fenômenos.',
          'Eliminar C — poluição sonora só por estilos musicais sem efeito: falso.',
          'Manter D — poluição hídrica causa doença direta e indireta.',
          'Marcar letra D.',
          'Em similares: água contaminada atinge humanos e cadeia alimentar.',
        ],
        footer_rule: 'Contaminação hídrica = D',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'POLUIÇÃO HÍDRICA',
        rows: [
          { label: 'Direta', value: 'Consumo de água contaminada', badge: 'hot' },
          { label: 'Indireta', value: 'Alimentos de ambiente poluído', badge: 'hot' },
          { label: 'Atmosférica', value: 'Pode gerar chuva ácida', badge: 'info' },
          { label: 'Saúde', value: 'Determinante ambiental', badge: 'ok' },
        ],
        footer_rule: 'Água suja adoece de várias formas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — POLUIÇÃO',
        items: [
          {
            label: 'Letra A — visual',
            detail: 'Outdoors só em área rural.',
            correct: 'Poluição visual é mais ampla — eliminar.',
          },
          {
            label: 'Letra B — chuva',
            detail: 'Precipitação múltipla granizo e neve.',
            correct: 'Confunde chuva ácida — falsa.',
          },
          {
            label: 'Letra C — sonora',
            detail: 'Só estilos musicais sem dano.',
            correct: 'Ruído excessivo afeta saúde.',
          },
          {
            label: 'Transferência — solo',
            detail: 'Poluição do solo sem efeito na água.',
            correct: 'Via direta e indireta na hídrica — D.',
          },
        ],
        footer_rule: 'D = poluição hídrica correta',
      },
    ],
  },

  'objetiva-concursos-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-8': {
    family: 'conceito',
    branch: 'promocao_principios_direitos',
    guideline: 'Carta de Ottawa — cinco campos de ação (OMS/MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Carta de Ottawa',
        meta: slideMeta,
        items: [
          { label: 'I — Políticas', detail: 'Elaborar e implementar políticas públicas saudáveis.', icon: 'FileText' },
          { label: 'II — Ambientes e habilidades', detail: 'Ambientes favoráveis e desenvolvimento de capacidades.', icon: 'Home' },
          { label: 'III — Comunidade e serviços', detail: 'Fortalecer comunidade e reorientar serviços.', icon: 'Users' },
          { label: 'Cinco ações', detail: 'Itens sintetizam os campos clássicos de Ottawa.', icon: 'Layers' },
          { label: 'Pegadinha', detail: 'Marcar só um item isolado.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'I, II e III estão corretos',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: itens corretos sobre campos de ação da Carta de Ottawa (1986).',
          'I: políticas públicas saudáveis — CORRETO.',
          'II: ambientes saudáveis e habilidades individuais/coletivas — CORRETO.',
          'III: capacitação comunitária e reorientação dos serviços — CORRETO.',
          'Os três reproduzem os eixos clássicos de Ottawa.',
          'Marcar letra D — todos os itens.',
          'Em similares: Ottawa = política + ambiente + comunidade/serviços.',
        ],
        footer_rule: 'Todos os itens = D',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'OTTAWA — CAMPOS',
        rows: [
          { label: 'I', value: 'Políticas públicas saudáveis', badge: 'hot' },
          { label: 'II', value: 'Ambientes + habilidades', badge: 'hot' },
          { label: 'III', value: 'Comunidade + reorientar serviços', badge: 'hot' },
          { label: 'Síntese', value: 'Três itens corretos juntos', badge: 'ok' },
        ],
        footer_rule: 'Decore os campos de Ottawa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — OTTAWA',
        items: [
          {
            label: 'Letra A — só I',
            detail: 'Apenas políticas públicas.',
            correct: 'II e III também corretos — eliminar.',
          },
          {
            label: 'Letra B — só II',
            detail: 'Só ambientes e habilidades.',
            correct: 'Conjunto incompleto.',
          },
          {
            label: 'Letra C — I e III',
            detail: 'Exclui ambientes e habilidades.',
            correct: 'Item II é correto — eliminar.',
          },
          {
            label: 'Transferência — só clínica',
            detail: 'Ottawa só no hospital.',
            correct: 'Políticas, ambientes e comunidade — D (todos).',
          },
        ],
        footer_rule: 'D = I, II e III',
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
      question_data: cleanQuestionData(raw.question_data),
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:promocao-g11] OK ${slug}`);
  }
  console.log(`[handcraft:promocao-g11] total=${ok}`);
}

main();
