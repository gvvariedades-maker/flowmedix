#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g29 (2 slugs · drift micro-clusters anafilaxia/queimadura no relatório).
 * Handcraft por enunciado real: choque hipovolêmico + BT16 esmagamento.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  choqueTypesRows,
  finalizeSlides as finalizeChoque,
  metaBase as metaChoque,
  slideMeta as choqueSlideMeta,
  type Pack as ChoquePack,
  type Q as ChoqueQ,
} from './lib/urgenciasChoqueGolden';
import {
  finalizeSlides as finalizeTrauma,
  metaBase as metaTrauma,
  slideMeta as traumaSlideMeta,
  type Pack as TraumaPack,
  type Q as TraumaQ,
} from './lib/urgenciasTraumaGolden';

const LOTE = 'urgencias-g29';
const REVIEWER = 'handcraft-urgencias-g29';

const CHOQUE_FOOTER = 'Volume perdido = hipovolêmico';
const TRAUMA_FOOTER = 'Soterramento + músculo = BT16';

type HandcraftEntry =
  | { branch: 'choque'; pack: ChoquePack; danger: Record<string, string> }
  | { branch: 'trauma'; pack: TraumaPack; danger: Record<string, string> };

const SPECS: Record<string, HandcraftEntry> = {
  'fepese-enfermagem-urgencias-e-emergencias-1777103994618-1': {
    branch: 'choque',
    pack: {
      family: 'conceito',
      guideline: 'Choque hipovolêmico — perda de volume intravascular (sangue, plasma, diarreia/vômito)',
      roi_error: 'tipos_choque_mecanismo_volume',
      cluster: 'Tipos de choque — hipovolêmico × hemorragia × desidratação',
      danger_footer: 'Gabarito E — choque hipovolêmico',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Choque — volume perdido',
          meta: choqueSlideMeta,
          items: [
            {
              label: 'Comando',
              detail:
                'Choque por redução do volume intravascular — sangue, plasma ou perda hídrica em diarreia e vômito.',
              icon: 'Target',
            },
            {
              label: 'Nome',
              detail: 'Choque hipovolêmico = menos volume circulante → perfusão insuficiente.',
              icon: 'Droplets',
            },
            {
              label: 'Causas da prova',
              detail: 'Sangramento · perda de plasma · gastroenterite com desidratação.',
              icon: 'Activity',
            },
            {
              label: 'Sinais clássicos',
              detail: 'Taquicardia, hipotensão, pele fria e úmida, TEC prolongado.',
              icon: 'HeartPulse',
            },
            {
              label: 'Pegadinha',
              detail: 'A banca lista outros choques pelo mecanismo — só hipovolêmico = perda de volume.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: choqueSlideMeta,
          steps: [
            'Comando: classificar o choque pela causa — queda do volume intravascular.',
            'Pergunta-chave: o que faltou no sangue? Volume (sangue/plasma/água).',
            'A anafilático → reação alérgica / vasodilatação distributiva; eliminar.',
            'B septicêmico → infecção sistêmica; eliminar.',
            'C neurogênico → lesão medular / perda de tônus vascular; eliminar.',
            'D cardiogênico → falha da bomba cardíaca; eliminar.',
            'E hipovolêmico → perda de volume (enunciado literal); marcar E.',
            'Fixação: leia o mecanismo do enunciado antes do nome do choque.',
          ],
          footer_rule: 'Mecanismo → tipo de choque',
        },
        {
          type: 'golden_rule',
          slide_title: 'Tipos de choque',
          meta: choqueSlideMeta,
          content: 'CHOQUE — DECORE MECANISMO',
          rows: choqueTypesRows([
            { label: 'Conduta inicial', value: 'O₂ · acesso venoso · tratar causa · 192', badge: 'ok' },
            { label: 'Sangramento', value: 'Compressão direta no foco de perda', badge: 'ok' },
          ]),
          footer_rule: CHOQUE_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Anafilático = distributivo por alergia — não é perda de volume intravascular do enunciado.',
      B: 'Séptico = infecção sistêmica com vasodilatação — volume pode estar relativo, não o mecanismo do texto.',
      C: 'Neurogênico = perda do tônus simpático após lesão medular — não perda de sangue/plasma.',
      D: 'Cardiogênico = bomba cardíaca falha; enunciado fala em redução de volume intravascular.',
    },
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104038968-4': {
    branch: 'trauma',
    pack: {
      family: 'protocolo',
      guideline: 'Protocolo SAMU 192 — BT16 síndrome do esmagamento (soterramento)',
      roi_error: 'bt16_esmagamento_soterramento',
      cluster: 'SAMU BT — síndrome do esmagamento × soterramento',
      danger_footer: 'Gabarito C — BT16 síndrome do esmagamento',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'SAMU — BT16 esmagamento',
          meta: traumaSlideMeta,
          items: [
            {
              label: 'Comando',
              detail:
                'SAMU acionado — soterramento com compressão de massa muscular em extremidades: qual Boletim Técnico (BT)?',
              icon: 'Target',
            },
            {
              label: 'Mecanismo',
              detail: 'Esmagamento prolongado de músculo → síndrome do esmagamento — risco de rabdomiólise.',
              icon: 'AlertTriangle',
            },
            {
              label: 'BT16',
              detail: 'Protocolo da síndrome do esmagamento — cenário clássico de colapso estrutural.',
              icon: 'FileText',
            },
            {
              label: 'Conduta-chave',
              detail: 'Monitorar volemia e eletrólitos; liberar compressão com suporte — hipercalemia e IRA são riscos.',
              icon: 'HeartPulse',
            },
            {
              label: 'Pegadinha',
              detail: 'BT troca tema: afogamento, queimadura e pneumotórax não são compressão muscular por soterramento.',
              icon: 'Shield',
            },
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: traumaSlideMeta,
          steps: [
            'Ancorar cenário: compressão de grande massa muscular em extremidades por soterramento.',
            'Pergunta: qual protocolo SAMU (BT) cobre esmagamento muscular?',
            'A BT22 afogamento → mecanismo aquático; eliminar.',
            'B BT18 queimadura térmica → agente calor; eliminar.',
            'D BT8 pneumotórax aberto → ferimento torácico; eliminar.',
            'C BT16 síndrome do esmagamento → alinha compressão muscular prolongada.',
            'Marcar C.',
            'Fixação: leia o mecanismo do enunciado antes do número do BT.',
          ],
          footer_rule: 'Mecanismo → código BT',
        },
        {
          type: 'golden_rule',
          slide_title: 'BT SAMU — decore',
          meta: traumaSlideMeta,
          content: 'BT DESTA PROVA',
          rows: [
            { label: 'BT16', value: 'Síndrome do esmagamento — compressão muscular', badge: 'hot' },
            { label: 'BT22', value: 'Afogamento', badge: 'info' },
            { label: 'BT18', value: 'Queimadura térmica (calor)', badge: 'info' },
            { label: 'BT8', value: 'Pneumotórax aberto — ferimento no tórax', badge: 'info' },
            { label: 'Crush — risco', value: 'Rabdomiólise · hipercalemia · lesão renal', badge: 'warn' },
            { label: 'Equipe', value: 'SAMU multidisciplinar + transporte urgente', badge: 'ok' },
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Afogamento é submersão/aspiração de líquido — não compressão muscular por soterramento.',
      B: 'Queimadura térmica = agente calor na pele — enunciado fala em esmagamento de músculo.',
      D: 'Pneumotórax aberto é ferimento torácico comunicante — não extremidade comprimida por escombros.',
    },
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;

  for (const [slug, entry] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8'));

    if (entry.branch === 'choque') {
      const q = raw as ChoqueQ;
      const slides = finalizeChoque(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaChoque(
          q,
          entry.pack.family,
          entry.pack.guideline,
          slug,
          entry.pack.roi_error,
          entry.pack.cluster,
          REVIEWER,
        ),
        question_data: q.question_data,
        reverse_study_slides: slides,
        modulo_slug: q.modulo_slug ?? slug,
      };
      writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    } else {
      const q = raw as TraumaQ;
      const slides = finalizeTrauma(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaTrauma(
          q,
          entry.pack.family,
          entry.pack.guideline,
          slug,
          entry.pack.roi_error,
          entry.pack.cluster,
          REVIEWER,
        ),
        question_data: q.question_data,
        reverse_study_slides: slides,
        modulo_slug: q.modulo_slug ?? slug,
      };
      writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    }

    ok++;
    console.log(`[handcraft:urgencias-g29] OK ${slug}`);
  }

  console.log(`[handcraft:urgencias-g29] total=${ok}`);
}

main();
