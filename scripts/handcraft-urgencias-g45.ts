#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g45 (8 slugs · 16º lote urgencias_generico).
 * Inferência strict-v2: jaw thrust trauma · SDRA · ortopedia gelo · luxação sinais · banda tensão · sepse · Glasgow/Cincinnati · químico ocular.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides as finalizeChoque,
  metaBase as metaChoque,
  slideMeta as choqueSlideMeta,
  type Pack as ChoquePack,
  type Q as ChoqueQ,
} from './lib/urgenciasChoqueGolden';
import {
  finalizeSlides as finalizeAvc,
  cincinnatiRows,
  metaBase as metaAvc,
  slideMeta as avcSlideMeta,
  type Pack as AvcPack,
  type Q as AvcQ,
} from './lib/urgenciasAvcGolden';
import {
  finalizeSlides as finalizeGenerico,
  metaBase as metaGenerico,
  slideMeta as genericoSlideMeta,
  type Pack as GenericoPack,
  type Q as GenericoQ,
} from './lib/urgenciasGenericoGolden';

const LOTE = 'urgencias-g45';
const REVIEWER = 'handcraft-urgencias-g45';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';

const JAW_THRUST_RAQUIMEDULAR = [
  { label: 'Cenário', value: 'Suspeita de lesão raquimedular — evitar hiperextensão cervical', badge: 'hot' },
  { label: 'Jaw thrust', value: 'Polegares no mento · demais dedos no ângulo da mandíbula — eleva mandíbula', badge: 'ok' },
  { label: 'Objetivo', value: 'Abrir via aérea sem mobilizar coluna cervical', badge: 'hot' },
  { label: '× Head-tilt/chin-lift', value: 'Hiperextensão do pescoço — contraindicada em trauma cervical', badge: 'warn' },
  { label: '× Ked block', value: 'Dispositivo de imobilização — não é manobra de abertura de VAA', badge: 'info' },
];

const SDRA_FATORES_RISCO = [
  { label: 'SDRA', value: 'Edema pulmonar não cardiogênico + hipoxemia persistente', badge: 'hot' },
  { label: 'Fatores comuns', value: 'Infecção pulmonar difusa · inalação tóxica', badge: 'ok' },
  { label: '× CIVD/pancreatite', value: 'Associações possíveis — não os fatores mais comuns cobrados', badge: 'warn' },
  { label: '× Embolia gordurosa', value: 'Contexto traumático — não par clássico da banca', badge: 'info' },
  { label: '× Contusão/politransfusão', value: 'Outros gatilhos — não o par mais frequente nesta questão', badge: 'warn' },
];

const SUBLUXACAO_GELO_TIPOIA = [
  { label: 'Fase aguda', value: 'Subluxação/luxação recente — gelo local nas primeiras 24–48 h', badge: 'hot' },
  { label: 'Analgesia', value: 'Controle da dor conforme prescrição médica', badge: 'ok' },
  { label: 'Proteção', value: 'Tipoia prolongada contra novos traumas', badge: 'ok' },
  { label: '× Calor agudo', value: 'Aumenta edema e sangramento na fase inicial', badge: 'warn' },
  { label: '× Antibiótico rotineiro', value: 'Sem indicação infecciosa — luxação fechada aguda', badge: 'warn' },
];

const LUXACAO_COTOVELO_SINAIS = [
  { label: 'Luxação aguda', value: 'Articulação deslocada — dor intensa local', badge: 'hot' },
  { label: 'Sinais típicos', value: 'Dor · equimose · edema', badge: 'ok' },
  { label: '× Febre', value: 'Não é sinal imediato de luxação traumática aguda', badge: 'warn' },
  { label: '× Icterícia', value: 'Hepatobiliar — não semiologia articular aguda', badge: 'info' },
  { label: '× Petéquias/espasmos', value: 'Perfis infeccioso/neurológico — não luxação de cotovelo', badge: 'warn' },
];

const BANDA_TENSAO_ORTOPEDIA = [
  { label: 'Estabilidade absoluta', value: 'Compressão dos fragmentos — redução firme', badge: 'hot' },
  { label: 'Banda de tensão', value: 'Fios junto às inserções tendinosas — ex.: patela', badge: 'ok' },
  { label: 'Face de tensão', value: 'Placa na face oposta à força de tração muscular', badge: 'info' },
  { label: '× Ponte', value: 'Estabilidade relativa — não compressão absoluta', badge: 'warn' },
  { label: '× Fixador externo', value: 'Estabilidade relativa temporária — perfil distinto', badge: 'warn' },
];

const SEPSE_DEFINICAO = [
  { label: 'Sepse', value: 'Disfunção orgânica com risco de vida por resposta desregulada à infecção', badge: 'hot' },
  { label: '× Iatrogenia', value: 'Complicação induzida por intervenção — não definição de sepse', badge: 'warn' },
  { label: '× Pancreatite', value: 'Inflamação pancreática — não resposta sistêmica à infecção', badge: 'warn' },
  { label: '× Infecção súbita', value: 'Infecção isolada sem disfunção orgânica — conceito anterior à sepse', badge: 'info' },
  { label: 'Pegadinha', value: 'Banca troca definição de sepse por doença aguda sem disfunção', badge: 'warn' },
];

const CINCINNATI_CRITERIOS = [
  { label: 'Glasgow', value: 'Quantifica nível de consciência — ocular · verbal · motora', badge: 'ok' },
  { label: 'Cincinnati', value: 'Rastreio rápido de AVC — face · braços · fala', badge: 'hot' },
  { label: '× Escala de sono', value: 'Instrumento de sono — não avaliação neurológica aguda', badge: 'warn' },
  { label: '× Inventário Beck', value: 'Rastreio depressivo — não neurológico de urgência', badge: 'info' },
  { label: '× Gasometria', value: 'Exame laboratorial — não escala clínica de consciência', badge: 'warn' },
];

const QUIMICO_OCULAR_PS = [
  { label: 'Conduta imediata', value: 'Irrigação com água corrente por tempo prolongado', badge: 'hot' },
  { label: 'Encaminhamento', value: 'Avaliação oftalmológica após irrigação inicial', badge: 'ok' },
  { label: '× Neutralizante', value: 'Risco de reação exotérmica — irrigação precede neutralização', badge: 'warn' },
  { label: '× Colírio anestésico', value: 'Não substitui lavagem nem adia avaliação especializada', badge: 'warn' },
  { label: '× Ocluir/aguardar', value: 'Retém agente químico — agrava lesão corneana', badge: 'hot' },
];

type GenericoEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };
type ChoqueEntry = { branch: 'choque'; pack: ChoquePack; danger: Record<string, string> };
type AvcEntry = { branch: 'avc'; pack: AvcPack; danger: Record<string, string> };
type HandcraftEntry = GenericoEntry | ChoqueEntry | AvcEntry;

const SPECS: Record<string, HandcraftEntry> = {
  'selecon-enfermagem-urgencias-e-emergencias-1777104038968-6': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Suspeita de lesão raquimedular — jaw thrust (elevação mandibular) abre via aérea sem hiperextensão cervical',
      roi_error: 'jaw_thrust_raquimedular',
      cluster: 'VAA trauma cervical — jaw thrust (generico strict-v2)',
      danger_footer: 'Gabarito C — jaw thrust',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'VAA em trauma cervical',
          meta: genericoSlideMeta,
          items: [
            { label: 'Cenário', detail: 'AAI · suspeita de lesão medular — coluna instável.', icon: 'AlertTriangle' },
            { label: 'Jaw thrust', detail: 'Polegares no mento · dedos no ângulo da mandíbula.', icon: 'Wind' },
            { label: 'Vantagem', detail: 'Abre via aérea sem hiperextender pescoço.', icon: 'Shield' },
            { label: 'Pegadinha — hiperextensão', detail: 'Chin-lift/head-tilt contraindicados em trauma cervical.', icon: 'Ban' },
            { label: '× Ked block', detail: 'Imobilização — não manobra de VAA.', icon: 'XCircle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'AAI com suspeita de lesão raquimedular — identificar manobra de VAA.',
            'Descrição: polegares no mento · demais dedos no ângulo da mandíbula.',
            'Corresponde à elevação mandibular — jaw thrust.',
            'Eliminar Gasglow (escala neurológica) e Ked block (imobilização).',
            'Eliminar hiperextensão cervical — contraindicada.',
            'Marcar C — jaw thrust.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Jaw thrust — decore',
          meta: genericoSlideMeta,
          content: 'TRAUMA CERVICAL — VAA',
          rows: JAW_THRUST_RAQUIMEDULAR,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Gasglow é escala de coma — não manobra de abertura de via aérea.',
      B: 'Ked block é dispositivo de imobilização — não técnica mandibular descrita.',
      D: 'Hiperextensão cervical agrava lesão medular — contraindicada; preferir jaw thrust.',
    },
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104048047-1': {
    branch: 'choque',
    pack: {
      family: 'conceito',
      guideline: 'SDRA — fatores de risco mais comuns: infecção pulmonar difusa e inalação tóxica',
      roi_error: 'sdra_fatores_risco',
      cluster: 'SDRA — fatores de risco (choque strict-v2: cardiogênico no enunciado)',
      danger_footer: 'Gabarito B — infecção difusa + inalação tóxica',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'SDRA — enquadramento',
          meta: choqueSlideMeta,
          items: [
            { label: 'Definição', detail: 'Edema pulmonar não cardiogênico + hipoxemia persistente.', icon: 'Wind' },
            { label: 'Gatilhos', detail: 'Infecção pulmonar difusa · inalação de agentes tóxicos.', icon: 'Flame' },
            { label: 'Pegadinha — pares alternativos', detail: 'Banca troca CIVD/pancreatite ou embolia gordurosa pelos fatores mais comuns.', icon: 'AlertTriangle' },
            { label: '× CIVD', detail: 'Coagulopatia — não par mais comum nesta questão.', icon: 'Ban' },
            { label: '× Embolia gordurosa', detail: 'Trauma — associação possível, não o par cobrado.', icon: 'XCircle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: choqueSlideMeta,
          steps: [
            'SDRA — identificar fatores de risco mais comumente relacionados.',
            'Edema pulmonar não cardiogênico + hipoxemia persistente — quadro agudo.',
            'Infecção pulmonar difusa e inalação tóxica — par clássico da banca.',
            'Eliminar CIVD/pancreatite · embolia gordurosa · contusão/politransfusão.',
            'Marcar B.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'SDRA — decore',
          meta: choqueSlideMeta,
          content: 'SDRA — FATORES DE RISCO',
          rows: SDRA_FATORES_RISCO,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'CIVD e pancreatite — associações possíveis, não os fatores mais comuns cobrados em SDRA.',
      C: 'Embolia gordurosa e grande queimado — contexto traumático, não o par mais frequente desta questão.',
      D: 'Contusão pulmonar e politransfusão — outros gatilhos, não os mais comuns relacionados à SDRA.',
    },
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104048047-3': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Subluxação aguda — analgesia + gelo local + proteção com tipoia por ~6 semanas; evitar calor na fase aguda',
      roi_error: 'subluxacao_gelo_tipoia',
      cluster: 'Ortopedia aguda — gelo + tipoia (drift generico)',
      danger_footer: 'Gabarito B — analgésico + gelo + tipoia',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Subluxação — conduta inicial',
          meta: genericoSlideMeta,
          items: [
            { label: 'Lesão', detail: 'Subluxação do úmero no treino — trauma articular agudo.', icon: 'Bone' },
            { label: 'Fase aguda', detail: 'Gelo local — reduz edema e dor nas primeiras 24–48 h.', icon: 'Snowflake' },
            { label: 'Analgesia', detail: 'Controle da dor conforme prescrição.', icon: 'Pill' },
            { label: 'Proteção', detail: 'Tipoia prolongada contra novos traumas.', icon: 'Shield' },
            { label: '× Calor', detail: 'Contraindicado na fase aguda traumática.', icon: 'Ban' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Subluxação aguda do úmero — conduta inicial prescrita.',
            'Fase aguda: gelo local + analgesia — padrão de primeiros socorros ortopédicos.',
            'Proteção com tipoia prolongada — evitar relesão.',
            'Eliminar calor local e antibiótico sem indicação infecciosa.',
            'Eliminar atadura curta ou imobilização inadequada com gaze.',
            'Marcar B.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Subluxação — decore PS',
          meta: genericoSlideMeta,
          content: 'ORTOPEDIA AGUDA — GELO',
          rows: SUBLUXACAO_GELO_TIPOIA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Antibiótico e calor na fase aguda — conduta incorreta; luxação fechada não exige antibiótico rotineiro.',
      C: 'Calor local e atadura por apenas uma semana — ignora gelo e tempo de proteção com tipoia.',
      D: 'Gelo adequado, mas imobilização com gaze/atadura e prazo inadequado — tipoia prolongada é o padrão cobrado.',
    },
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104048047-4': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Luxação aguda do cotovelo — sinais: dor, equimose e edema',
      roi_error: 'luxacao_cotovelo_sinais',
      cluster: 'Ortopedia — sinais de luxação aguda (generico)',
      danger_footer: 'Gabarito A — dor + equimose + edema',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Luxação de cotovelo',
          meta: genericoSlideMeta,
          items: [
            { label: 'Mecanismo', detail: 'Deslocamento articular agudo — dor intensa local.', icon: 'Bone' },
            { label: 'Sinais', detail: 'Dor · equimose · edema — tríade típica aguda.', icon: 'Activity' },
            { label: '× Febre', detail: 'Não é sinal imediato de luxação traumática.', icon: 'Ban' },
            { label: '× Icterícia', detail: 'Hepatobiliar — fora do contexto articular.', icon: 'XCircle' },
            { label: 'Pegadinha — febre/icterícia', detail: 'Banca mistura sinais sistêmicos (febre, icterícia, petéquias) com trauma articular agudo.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Luxação aguda do cotovelo — identificar sinais clínicos corretos.',
            'Trauma articular agudo → dor local intensa.',
            'Equimose e edema acompanham lesão dos tecidos moles.',
            'Eliminar febre/hemorragia sistêmica · icterícia · petéquias/espasmos.',
            'Marcar A — dor, equimose e edema.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Luxação — decore',
          meta: genericoSlideMeta,
          content: 'LUXAÇÃO AGUDA — SINAIS',
          rows: LUXACAO_COTOVELO_SINAIS,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Febre e hemorragia — perfil infeccioso/sistêmico, não semiologia clássica de luxação aguda de cotovelo.',
      C: 'Icterícia e deformidade isolada — mistura sinais hepáticos com articular sem edema/equimose típicos.',
      D: 'Petéquias e espasmos — sugerem outras síndromes, não luxação traumática de cotovelo.',
    },
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104048047-5': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Estabilidade absoluta com compressão por placa na face de tensão ou fios nas inserções tendinosas — banda de tensão (ex.: patela)',
      roi_error: 'banda_tensao_patela',
      cluster: 'Ortopedia — banda de tensão estabilidade absoluta',
      danger_footer: 'Gabarito C — banda de tensão',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Fixação ortopédica',
          meta: genericoSlideMeta,
          items: [
            { label: 'Estabilidade absoluta', detail: 'Compressão firme dos fragmentos ósseos.', icon: 'Wrench' },
            { label: 'Banda de tensão', detail: 'Fios junto às inserções tendinosas — patela clássica.', icon: 'Link' },
            { label: 'Face de tensão', detail: 'Placa posicionada para neutralizar força muscular.', icon: 'Activity' },
            { label: '× Ponte', detail: 'Estabilidade relativa — não compressão absoluta.', icon: 'Ban' },
            { label: '× Haste intramedular', detail: 'Fixação intramedular — perfil distinto.', icon: 'XCircle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Técnica de estabilidade absoluta com compressão dos fragmentos.',
            'Pode usar placa na face de tensão ou montagem com fios tendinosos.',
            'Exemplo clássico: fraturas da patela.',
            'Corresponde à banda de tensão — marcar C.',
            'Eliminar ponte · fixador externo · haste intramedular.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Banda de tensão — decore',
          meta: genericoSlideMeta,
          content: 'FIXAÇÃO — ESTABILIDADE ABSOLUTA',
          rows: BANDA_TENSAO_ORTOPEDIA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Placa-ponte — estabilidade relativa, não compressão absoluta descrita no enunciado.',
      B: 'Fixador externo — estabilização temporária relativa, não banda de tensão.',
      D: 'Haste intramedular — fixação intramedular, não montagem com fios nas inserções tendinosas.',
    },
  },
  'unifil-enfermagem-urgencias-e-emergencias-1777104012755-3': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Sepse — disfunção orgânica com risco de vida causada por resposta desregulada do hospedeiro à infecção',
      roi_error: 'sepse_definicao',
      cluster: 'Sepse — definição conceitual (generico, sem choque)',
      danger_footer: 'Gabarito B — sepse',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Sepse — definição',
          meta: genericoSlideMeta,
          items: [
            { label: 'Sepse', detail: 'Resposta desregulada à infecção + disfunção orgânica com risco de vida.', icon: 'AlertCircle' },
            { label: 'Componente', detail: 'Infecção desencadeia resposta sistêmica prejudicial.', icon: 'Bug' },
            { label: '× Iatrogenia', detail: 'Lesão induzida por tratamento — conceito distinto.', icon: 'Ban' },
            { label: '× Pancreatite', detail: 'Inflamação pancreática — não definição de sepse.', icon: 'XCircle' },
            { label: 'Pegadinha — infecção súbita', detail: 'Banca troca sepse (disfunção orgânica) por infecção aguda sem disfunção.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Definir: disfunção orgânica com risco de vida por resposta desregulada à infecção.',
            'Palavras-chave: infecção + resposta desregulada + disfunção orgânica.',
            'Corresponde à sepse — marcar B.',
            'Eliminar iatrogenia · pancreatite · infecção súbita sem disfunção.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Sepse — decore',
          meta: genericoSlideMeta,
          content: 'SEPSE — DEFINIÇÃO',
          rows: SEPSE_DEFINICAO,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Iatrogenia — complicação de intervenção médica, não resposta desregulada à infecção.',
      C: 'Pancreatite — inflamação pancreática autônoma, não definição de sepse.',
      D: 'Infecção súbita — infecção aguda sem disfunção orgânica — conceito anterior à sepse.',
    },
  },
  'vunesp-enfermagem-exames-complementares-1779563685104-0': {
    branch: 'avc',
    pack: {
      family: 'conceito',
      guideline:
        'Avaliação neurológica de urgência — Escala de Coma de Glasgow e Escala de Cincinnati (rastreio de AVC)',
      roi_error: 'glasgow_cincinnati_instrumentos',
      cluster: 'Neurológico — Glasgow + Cincinnati (avc_iam strict-v2)',
      danger_footer: 'Gabarito B — Glasgow + Cincinnati',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Instrumentos neurológicos',
          meta: avcSlideMeta,
          items: [
            { label: 'Glasgow', detail: 'Nível de consciência — respostas ocular, verbal e motora.', icon: 'Brain' },
            { label: 'Cincinnati', detail: 'Rastreio rápido de AVC — face, braços, fala.', icon: 'Activity' },
            { label: 'Pegadinha — nomes inventados', detail: 'Banca troca Glasgow/Cincinnati por Scotland, Sampla ou escalas de sono/depressão.', icon: 'AlertTriangle' },
            { label: '× Escala de sono', detail: 'Habbot — qualidade do sono, não consciência aguda.', icon: 'Ban' },
            { label: '× Gasometria', detail: 'Exame laboratorial — não escala clínica de consciência.', icon: 'XCircle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: avcSlideMeta,
          steps: [
            'Instrumentos corretos para avaliação do estado neurológico.',
            'Glasgow quantifica consciência — padrão em TCE e rebaixamento.',
            'Cincinnati rastreia sinais de AVC — face, braços, fala.',
            'Eliminar escalas de sono/depressão · nomes inventados · escala de dor/gasometria.',
            'Marcar B — Glasgow e Cincinnati.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Glasgow + Cincinnati',
          meta: avcSlideMeta,
          content: 'AVALIAÇÃO NEUROLÓGICA — AVC',
          rows: cincinnatiRows([
            { label: 'Glasgow', value: 'Consciência — ocular · verbal · motora', badge: 'ok' },
            { label: '× Escalas inventadas', value: 'Scotland · Sampla · Habbot — distratoras', badge: 'warn' },
          ]),
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Escala de sono Habbot e Edinburgh pós-parto — instrumentos de sono/depressão, não neurológicos de urgência.',
      C: 'Scotland e Beck — nomes incorretos/inventados; Cincinnati e Glasgow são os instrumentos corretos.',
      D: 'Escala de dor e gasometria — dor é sintoma; gasometria é exame laboratorial, não escala neurológica.',
      E: 'Edinburgh e Sampla — escalas inexistentes ou fora do contexto neurológico agudo de urgência.',
    },
  },
  'vunesp-enfermagem-processo-de-enfermagem-1780003637054-6': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Respingo químico ocular — irrigação imediata com água corrente prolongada + encaminhamento oftalmológico',
      roi_error: 'quimico_ocular_irrigacao',
      cluster: 'Primeiros socorros — respingo químico ocular',
      danger_footer: 'Gabarito A — irrigar + encaminhar',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Químico ocular — PS',
          meta: genericoSlideMeta,
          items: [
            { label: 'Emergência', detail: 'Respingo químico no laboratório — lesão corneana iminente.', icon: 'AlertTriangle' },
            { label: 'Irrigação', detail: 'Água corrente abundante por tempo prolongado — prioridade.', icon: 'Droplets' },
            { label: 'Encaminhamento', detail: 'Avaliação oftalmológica após lavagem inicial.', icon: 'Eye' },
            { label: '× Neutralizante', detail: 'Pode gerar calor — irrigação precede neutralização.', icon: 'Ban' },
            { label: '× Aguardar médico', detail: 'Retém agente químico — agrava queimadura ocular.', icon: 'XCircle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Respingo químico ocular — conduta imediata tecnicamente recomendada.',
            'Prioridade: remover agente químico com irrigação abundante.',
            'Água corrente por tempo prolongado — padrão de primeiros socorros.',
            'Encaminhar para avaliação oftalmológica após lavagem.',
            'Eliminar anestésico/ocluir · neutralizante sem lavagem · comprimir pálpebra · aguardar sem intervenção.',
            'Marcar A.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Químico ocular — decore',
          meta: genericoSlideMeta,
          content: 'RESPINGO QUÍMICO — OLHO',
          rows: QUIMICO_OCULAR_PS,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — respingo químico ocular',
          items: [
            {
              label: 'Letra B — colírio anestésico',
              detail: 'Anestésico e oclusão prolongada sem irrigação — conduta incorreta.',
              correct: 'Irrigar com água corrente prolongada e encaminhar — gabarito A.',
            },
            {
              label: 'Letra C — neutralizante',
              detail: 'Neutralizante sem lavagem prévia — risco de reação exotérmica.',
              correct: 'Irrigação abundante precede qualquer neutralização — gabarito A.',
            },
            {
              label: 'Letra D — comprimir pálpebra',
              detail: 'Compressão impede drenagem do agente químico.',
              correct: 'Lavagem contínua remove o agente — gabarito A.',
            },
            {
              label: 'Letra E — aguardar sem intervenção',
              detail: 'Olhos fechados retêm o químico na superfície ocular.',
              correct: 'Intervenção imediata com irrigação — gabarito A.',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
      ],
    },
    danger: {},
  },
};

function readQuestaoJson(path: string): unknown {
  const raw = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;

  for (const [slug, entry] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = readQuestaoJson(path);

    if (entry.branch === 'generico') {
      const q = raw as GenericoQ;
      const slides = finalizeGenerico(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaGenerico(
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
    } else if (entry.branch === 'choque') {
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
      const q = raw as AvcQ;
      const slides = finalizeAvc(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaAvc(
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
    console.log(`[handcraft:urgencias-g45] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g45] total=${ok}`);
}

main();
