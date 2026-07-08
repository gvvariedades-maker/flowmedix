#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g45 (5 slugs SHORT LOTE vitals_pediatrico_faixas).
 * Cluster Faixas pediátricas por idade (5 slugs — g45 fecha cluster inteiro).
 *
 *   npm run handcraft:sinais-vitais-g45
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g45';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-pediatrico-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / SBP',
  title: 'Faixas de sinais vitais por idade — pediatria',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'FC adulto 60–100 bpm — bradicardia fisiológica em atletas',
    'FR lactente SBP 30–60 irpm',
    'FR pré-escolar ~24–40 irpm',
    'FC escolar MS COVID 75–118 bpm',
    'FR escolar ~18–25 irpm',
    'não aplicar 12–20 irpm adulto em criança',
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

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo';
  guideline: string;
  exam_vs_current?: string;
  roi_error: string;
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
    pedagogical_branch: 'vitals_pediatrico_faixas',
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      roi_error: pack.roi_error,
    },
    sources: [SV_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779344158323-5': {
    family: 'conceito',
    guideline:
      'MS — FC adulto em repouso 60–100 bpm; atletas bem condicionados podem apresentar FC basal mais baixa (bradicardia fisiológica)',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC adulta — exceção do atleta',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'FC normal do adulto em repouso (60–100 bpm) costuma ser mais baixa em qual grupo?',
            icon: 'Target',
          },
          {
            label: 'Faixa adulta',
            detail: '60 a 100 bpm em repouso — referência para comparar exceções.',
            icon: 'HeartPulse',
          },
          {
            label: 'Atleta condicionado',
            detail:
              'Treinamento aeróbico aumenta débito cardíaco — FC basal pode cair abaixo de 60 (fisiológica).',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — mulheres',
            detail: 'Letra A generaliza sexo — não é o fator clássico de FC basal mais baixa.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — drogas/ broncodilatador',
            detail:
              'Cocaína e broncodilatadores tendem a elevar FC — não explicam bradicardia basal.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Atleta = FC repouso mais baixa (fisiológica)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: em quem a FC normal de repouso tende a ser mais baixa.',
          'Fixar referência: adulto 60–100 bpm em repouso.',
          'Testar A — mulheres: sexo isolado não é exceção clássica → eliminar.',
          'Testar B — adolescentes: FC pediátrica costuma ser mais alta, não mais baixa → eliminar.',
          'Testar C — cocaína: estimulante — eleva FC → eliminar.',
          'Testar D — broncodilatadores: efeito simpaticomimético — tende a taquicardia → eliminar.',
          'Testar E — atletas bem condicionados: bradicardia fisiológica por condicionamento → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Gabarito AVANÇASP = atletas condicionados',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FC por contexto',
        meta: slideMeta,
        content: 'FAIXAS FC — ADULTO × PEDIÁTRICO',
        rows: [
          { label: 'FC adulto repouso', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Atleta condicionado', value: 'Pode <60 bpm — bradicardia fisiológica', sv_kind: 'fc', badge: 'hot' },
          { label: 'FC escolar', value: '~70 a 110 bpm (MS)', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC lactente', value: '~100 a 160 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR adulto (contraste)', value: '12 a 20 irpm — não usar em lactente', sv_kind: 'fr', badge: 'warn' },
        ],
        footer_rule: 'Idade e condicionamento mudam o normal',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FC MAIS BAIXA EM REPOUSO',
        items: [
          {
            label: 'Letra A — mulheres',
            detail: 'Frequência cardíaca basal mais baixa em mulheres.',
            correct:
              'Sexo isolado não é o fator clássico cobrado — condicionamento físico explica FC basal menor no atleta.',
          },
          {
            label: 'Letra B — adolescentes',
            detail: 'Adolescentes apresentam FC de repouso mais baixa.',
            correct:
              'Em pediatria/adolescência a FC costuma ser mais alta que no adulto sedentário — não mais baixa.',
          },
          {
            label: 'Letra C — usuários de cocaína',
            detail: 'Cocaína associada a FC basal reduzida.',
            correct:
              'Estimulante simpaticomimético — eleva FC e PA; não produz bradicardia de repouso.',
          },
          {
            label: 'Letra D — broncodilatadores',
            detail: 'Broncodilatadores deixam FC basal mais baixa.',
            correct:
              'Beta-agonistas aumentam FC — efeito oposto ao que a questão pede (FC mais baixa).',
          },
        ],
        footer_rule: 'Só E fecha bradicardia fisiológica do atleta',
      },
    ],
  },

  'ibfc-enfermagem-verificacao-de-sinais-vitais-1779343932809-7': {
    family: 'protocolo',
    guideline:
      'SBP/MS — FR lactente: 30 a 60 irpm (caderneta MS ~30–53); prova IBFC gabarita 30 a 50 irpm',
    exam_vs_current: 'Gabarito IBFC = 30–50 irpm; SBP amplia teto a 60 irpm',
    roi_error: 'faixa_pediatrica_adulto',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FR lactente — faixa etária',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assinalar a frequência respiratória normal para faixa etária lactente.',
            icon: 'Target',
          },
          {
            label: 'Lactente',
            detail: '<1 ano — FR mais alta que adulto; não usar 12–20 irpm.',
            icon: 'Baby',
          },
          {
            label: 'Referência prova',
            detail: 'Gabarito IBFC: 30 a 50 inspirações por minuto.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — faixa adulta',
            detail: 'Letra E (16–19 irpm) aproxima adulto — eliminar em lactente.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — pré-escolar',
            detail: 'Letras C e D (20–34 irpm) estreitam demais para lactente.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Lactente ≠ 12–20 irpm adulto',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: FR normal do lactente.',
          'Contexto: lactente respira mais rápido que adulto em repouso.',
          'Testar E — 16 a 19 irpm: faixa adulta → eliminar.',
          'Testar D — 20 a 30 irpm: teto baixo para lactente → eliminar.',
          'Testar C — 25 a 32 irpm: intervalo estreito → eliminar.',
          'Testar A — 30 a 60 irpm: inclui faixa SBP, mas prova pede alternativa exata.',
          'Testar B — 30 a 50 irpm: fecha gabarito IBFC → candidata.',
          'Marcar B.',
        ],
        footer_rule: 'Gabarito IBFC = 30 a 50 irpm',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FR por idade',
        meta: slideMeta,
        content: 'FR PEDIÁTRICA — LACTENTE × ADULTO',
        rows: [
          { label: 'FR lactente (prova)', value: '30 a 50 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'FR lactente (SBP)', value: '30 a 60 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'FR pré-escolar (~2 anos)', value: '24 a 40 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'FR escolar', value: '~18 a 25 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'FR adulto', value: '12 a 20 irpm', sv_kind: 'fr', badge: 'warn' },
        ],
        footer_rule: 'Leia a faixa etária antes de decidir',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FR LACTENTE',
        items: [
          {
            label: 'Letra A — 30 a 60 irpm',
            detail: 'Intervalo amplo compatível com SBP.',
            correct:
              'SBP aceita até 60 irpm — mas a banca IBFC fecha 30–50 irpm como alternativa correta única.',
          },
          {
            label: 'Letra C — 25 a 32 irpm',
            detail: 'Faixa estreita no meio da pediatria.',
            correct:
              '25–32 irpm subestima o teto respiratório do lactente — referência pediátrica é mais ampla.',
          },
          {
            label: 'Letra D — 20 a 30 irpm',
            detail: 'Aproxima limites de escolar/adulto.',
            correct:
              '20–30 irpm é baixo para lactente — não confundir com faixa de criança maior ou adulto.',
          },
          {
            label: 'Letra E — 16 a 19 irpm',
            detail: 'Intervalo de frequência respiratória reduzida.',
            correct:
              '16–19 irpm é faixa adulta (bradipneia se <12) — lactente respira mais rápido em repouso.',
          },
        ],
        footer_rule: 'Só B fecha lactente na prova IBFC',
      },
    ],
  },

  'ibgp-enfermagem-verificacao-de-sinais-vitais-1779344253939-3': {
    family: 'protocolo',
    guideline:
      'MS — Protocolo COVID-19: FC em criança escolar em vigília ~75 a 118 bpm; não aplicar 60–100 adulto isolado',
    exam_vs_current: 'Prova cita protocolo MS COVID-19 para escolar — faixa específica do documento',
    roi_error: 'faixa_pediatrica_adulto',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC escolar — protocolo MS',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Segundo protocolo MS COVID-19, FC em criança escolar em vigília varia em torno de:',
            icon: 'Target',
          },
          {
            label: 'Idade escolar',
            detail: '6–12 anos aproximadamente — faixa pediátrica distinta do adulto.',
            icon: 'User',
          },
          {
            label: 'Referência MS COVID',
            detail: 'Gabarito IBGP: 75 a 118 bpm em vigília.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — faixa adulta',
            detail: 'Letra A (58–90) aproxima adulto/bradicardia — não fecha protocolo.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — lactente/pré-escolar',
            detail: 'Letras B e D trazem tetos altos de faixas mais jovens.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Escolar MS COVID → 75–118 bpm',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: FC de criança escolar em vigília (protocolo MS COVID-19).',
          'Fixar: idade escolar ≠ adulto 60–100 bpm.',
          'Testar A — 58 a 90 bpm: limite inferior e teto baixos → eliminar.',
          'Testar B — 90 a 160 bpm: teto de lactente/pré-escolar → eliminar.',
          'Testar D — 100 a 205 bpm: hipertensão de FC para escolar → eliminar.',
          'Testar C — 75 a 118 bpm: intervalo do protocolo MS → candidata.',
          'Confirmar: só C fecha a referência do enunciado.',
          'Marcar C.',
        ],
        footer_rule: 'Gabarito IBGP = 75 a 118 bpm',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FC pediátrica',
        meta: slideMeta,
        content: 'FC POR FAIXA ETÁRIA',
        rows: [
          { label: 'FC escolar (MS COVID)', value: '75 a 118 bpm em vigília', sv_kind: 'fc', badge: 'hot' },
          { label: 'FC escolar (MS geral)', value: '~70 a 110 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC lactente', value: '~100 a 160 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'warn' },
          { label: 'FR escolar', value: '~18 a 25 irpm', sv_kind: 'fr', badge: 'ok' },
        ],
        footer_rule: 'Protocolo da prova define o intervalo cobrado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FC ESCOLAR',
        items: [
          {
            label: 'Letra A — 58 a 90 bpm',
            detail: 'Faixa com teto abaixo do protocolo escolar.',
            correct:
              '58–90 bpm subestima o teto de 118 bpm do protocolo MS COVID para escolar em vigília.',
          },
          {
            label: 'Letra B — 90 a 160 bpm',
            detail: 'Intervalo amplo com teto de lactente.',
            correct:
              '90–160 bpm mistura faixa de lactente/pré-escolar — escolar no protocolo fecha 75–118 bpm.',
          },
          {
            label: 'Letra D — 100 a 205 bpm',
            detail: 'Teto muito elevado para escolar.',
            correct:
              '205 bpm excede referência escolar — taquicardia extrema não é “variação normal” do protocolo.',
          },
        ],
        footer_rule: 'C = 75–118 bpm — protocolo MS COVID',
      },
    ],
  },

  'quadrix-enfermagem-verificacao-de-sinais-vitais-1779343967847-7': {
    family: 'protocolo',
    guideline:
      'MS/SBP — FR em criança de 2 anos (pré-escolar): 24 a 40 irpm; adulto 12–20 irpm não se aplica',
    roi_error: 'faixa_pediatrica_adulto',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FR pré-escolar — 2 anos',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Parâmetro normal de FR em criança de dois anos de idade.',
            icon: 'Target',
          },
          {
            label: 'Pré-escolar (~2 anos)',
            detail: 'Faixa etária entre lactente e escolar — FR intermediária.',
            icon: 'Baby',
          },
          {
            label: 'Referência QUADRIX',
            detail: 'Gabarito: 24 a 40 rpm.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — faixa adulta',
            detail: 'Letra A (12–20 rpm) é FR de adulto — eliminar.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — lactente',
            detail: 'Letra E (30–60 rpm) aproxima lactente — não 2 anos.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '2 anos → 24–40 rpm',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: FR normal em criança de 2 anos.',
          'Contexto: pré-escolar ≠ adulto (12–20) nem lactente (30–60).',
          'Testar A — 12 a 20 rpm: faixa adulta → eliminar.',
          'Testar E — 30 a 60 rpm: faixa lactente → eliminar.',
          'Testar B — 18 a 34 rpm: limite inferior baixo → eliminar.',
          'Testar C — 18 a 40 rpm: piso ainda abaixo do gabarito → eliminar.',
          'Testar D — 24 a 40 rpm: fecha referência pré-escolar → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Gabarito QUADRIX = 24 a 40 rpm',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FR por idade',
        meta: slideMeta,
        content: 'FR PRÉ-ESCOLAR × OUTRAS FAIXAS',
        rows: [
          { label: 'FR 2 anos (pré-escolar)', value: '24 a 40 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'FR lactente', value: '30 a 60 irpm (SBP)', sv_kind: 'fr', badge: 'ok' },
          { label: 'FR escolar', value: '~18 a 25 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'FR adulto', value: '12 a 20 irpm', sv_kind: 'fr', badge: 'warn' },
          { label: 'Taquipneia adulto', value: 'FR > 20 irpm', sv_kind: 'fr', badge: 'warn' },
        ],
        footer_rule: 'Dois anos = 24–40 — não 12–20',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FR 2 ANOS',
        items: [
          {
            label: 'Letra A — 12 a 20 rpm',
            detail: 'Faixa de frequência respiratória de adulto.',
            correct:
              '12–20 irpm é referência adulta — criança de 2 anos respira mais rápido em repouso.',
          },
          {
            label: 'Letra B — 18 a 34 rpm',
            detail: 'Intervalo com piso abaixo do gabarito.',
            correct:
              '18 irpm é baixo para pré-escolar de 2 anos — QUADRIX fecha piso em 24 rpm.',
          },
          {
            label: 'Letra C — 18 a 40 rpm',
            detail: 'Teto correto mas piso inadequado.',
            correct:
              'Teto 40 rpm coincide, mas piso 18 irpm antecipa faixa adulta — gabarito exige 24–40 rpm.',
          },
          {
            label: 'Letra E — 30 a 60 rpm',
            detail: 'Faixa de lactente aplicada ao pré-escolar.',
            correct:
              '30–60 irpm é típico de lactente — aos 2 anos a FR já reduz para faixa 24–40 irpm.',
          },
        ],
        footer_rule: 'Só D fecha pré-escolar 2 anos',
      },
    ],
  },

  'quadrix-enfermagem-verificacao-de-sinais-vitais-1780000468214-2': {
    family: 'protocolo',
    guideline:
      'MS/SBP — FR criança 2 anos: 24 a 40 irpm; não transpor 12–20 irpm de adulto nem 30–60 de lactente',
    roi_error: 'faixa_pediatrica_adulto',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV pediátrico — criança 2 anos',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Parâmetro normal da frequência respiratória em criança de dois anos.',
            icon: 'Target',
          },
          {
            label: 'Variação por idade',
            detail: 'Enunciado QUADRIX: SV mudam conforme faixa etária.',
            icon: 'Scale',
          },
          {
            label: 'FR pré-escolar',
            detail: 'Referência: 24 a 40 rpm para 2 anos.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — adulto',
            detail: 'Alternativa A copia 12–20 rpm — armadilha clássica.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — lactente',
            detail: 'Alternativa E (30–60) desloca faixa para <1 ano.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Idade no enunciado manda na faixa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: FR normal em criança de 2 anos (parâmetros variam por idade).',
          'Eliminar faixa adulta: 12–20 rpm não serve para pré-escolar.',
          'Eliminar lactente: 30–60 rpm é de <1 ano.',
          'Comparar B (18–34) e C (18–40): piso 18 irpm abaixo do normal de 2 anos.',
          'Testar D — 24 a 40 rpm: única faixa com piso e teto coerentes → candidata.',
          'Revisar: não confundir rpm com bpm.',
          'Descartar A, B, C e E pelos pisos/tetos incorretos.',
          'Marcar D.',
        ],
        footer_rule: 'Gabarito = letra D (24–40 rpm)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Tabela — FR pediátrica',
        meta: slideMeta,
        content: 'IDADE · FR NORMAL',
        rows: [
          { label: '2 anos', value: '24 a 40 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'Lactente (<1 ano)', value: '30 a 60 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Escolar (6–12 anos)', value: '~18 a 25 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Adulto', value: '12 a 20 irpm', sv_kind: 'fr', badge: 'warn' },
          { label: 'FC escolar (contraste)', value: '~70 a 110 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Pré-escolar 2 anos = 24–40 irpm',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TROCA DE FAIXA ETÁRIA',
        items: [
          {
            label: 'Letra A — 12 a 20 rpm',
            detail: 'Valor de referência para adulto em repouso.',
            correct:
              'Aos 2 anos a FR normal é mais alta — 12–20 irpm classificaria bradipneia pediátrica.',
          },
          {
            label: 'Letra B — 18 a 34 rpm',
            detail: 'Limite inferior compatível com adulto jovem.',
            correct:
              'Piso 18 irpm não atende pré-escolar de 2 anos — referência QUADRIX inicia em 24 rpm.',
          },
          {
            label: 'Letra C — 18 a 40 rpm',
            detail: 'Teto adequado com piso insuficiente.',
            correct:
              '40 rpm no teto é aceitável, mas 18 irpm no piso mistura faixa adulta — gabarito é 24–40 rpm.',
          },
          {
            label: 'Letra E — 30 a 60 rpm',
            detail: 'Padrão respiratório de lactente.',
            correct:
              'Criança de 2 anos já saiu da faixa lactente — 30–60 irpm não é o normal para essa idade.',
          },
        ],
        footer_rule: 'D = única faixa 24–40 rpm coerente',
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
    console.log(`[handcraft:sv-g45] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g45] total=${ok}`);
}

main();
