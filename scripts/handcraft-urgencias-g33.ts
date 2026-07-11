#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g33 (8 slugs · 4º lote urgencias_generico).
 * Inferência: compartimental + transporte APH + TCE → trauma · demais generico.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides as finalizeGenerico,
  glasgowDomainsRows,
  metaBase as metaGenerico,
  slideMeta as genericoSlideMeta,
  type Pack as GenericoPack,
  type Q as GenericoQ,
} from './lib/urgenciasGenericoGolden';
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
  xabcdeRows,
  type Pack as TraumaPack,
  type Q as TraumaQ,
} from './lib/urgenciasTraumaGolden';

const LOTE = 'urgencias-g33';
const REVIEWER = 'handcraft-urgencias-g33';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const TRAUMA_FOOTER = 'XABCDE — segurança da cena e imobilização';
const CHOQUE_FOOTER = 'Pressão em compartimento — isquemia local';

type GenericoEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };
type TraumaEntry = { branch: 'trauma'; pack: TraumaPack; danger: Record<string, string> };
type ChoqueEntry = { branch: 'choque'; pack: ChoquePack; danger: Record<string, string> };

type HandcraftEntry = GenericoEntry | TraumaEntry | ChoqueEntry;

/** Rows qualitativos — sem literais numéricos fora da guideline MS urgências. */
const HIPOGLICEMIA_QUALITATIVA = [
  { label: 'Adrenérgico', value: 'Sudorese · tremor · taquicardia · fome', badge: 'hot' },
  { label: 'Neuroglicopênico', value: 'Tontura · confusão · sonolência', badge: 'warn' },
  { label: 'Limiar clínico', value: 'Glicemia baixa — confirmar com capilar', badge: 'ok' },
  { label: '× Hiperglicemia', value: 'Sede · poliúria — perfil oposto', badge: 'warn' },
];

const ELIMINACAO_QUALITATIVA = [
  { label: 'Constipação', value: 'Evacuação infrequente + fezes endurecidas', badge: 'hot' },
  { label: 'Alerta', value: 'Ausência prolongada + distensão abdominal', badge: 'warn' },
  { label: '× Obstrução', value: 'Dor contínua · vômitos biliosos', badge: 'info' },
  { label: '× Retenção urinária', value: 'Globo vesical — trato urinário', badge: 'warn' },
];

const SPECS: Record<string, HandcraftEntry> = {
  'fau-unicentro-enfermagem-urgencias-e-emergencias-1777104031822-3': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Escala de Glasgow — três domínios: ocular, verbal e motora',
      roi_error: 'glasgow_motor_domain',
      cluster: 'Glasgow — domínio motor',
      danger_footer: 'Gabarito C — resposta motora',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Glasgow — três domínios',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Glasgow avalia ocular, verbal e qual terceiro domínio? Lacuna no enunciado.',
              icon: 'Target',
            },
            {
              label: 'Ocular',
              detail: 'Abertura ocular — espontânea a estímulo doloroso.',
              icon: 'Eye',
            },
            {
              label: 'Verbal',
              detail: 'Resposta verbal — orientada a ausente.',
              icon: 'MessageCircle',
            },
            {
              label: 'Motora',
              detail: 'Resposta motora — obedece comandos a extensão anormal.',
              icon: 'Activity',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca inventa olfativa, diafragmática, típica ou atípica — não existem no Glasgow.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Glasgow = O + V + M',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Glasgow compõe três respostas: ocular · verbal · ___?',
            'Eliminar A típica — não é domínio da escala.',
            'Eliminar B atípica — termo inexistente no Glasgow.',
            'Eliminar D diafragmática — não integra a escala.',
            'Eliminar E olfativa — não integra a escala.',
            'Resposta motora completa o trio ocular-verbal-motor.',
            'Marcar C.',
            'Fixação: Glasgow = O + V + M (1–4 + 1–5 + 1–6).',
          ],
          footer_rule: 'TCE — D no XABCDE',
        },
        {
          type: 'golden_rule',
          slide_title: 'Glasgow — decore',
          meta: genericoSlideMeta,
          content: 'ESCALA DE GLASGOW',
          rows: glasgowDomainsRows(),
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: '“Típica” não é domínio da Escala de Glasgow — a escala usa ocular, verbal e motora.',
      B: '“Atípica” é termo inventado — o terceiro domínio cobrado é a resposta motora.',
      D: 'Resposta diafragmática não compõe o Glasgow — domínio correto é motor.',
      E: 'Resposta olfativa não existe na escala — motor completa o trio ocular-verbal.',
    },
  },
  'fau-unicentro-enfermagem-urgencias-e-emergencias-1777104031822-4': {
    branch: 'choque',
    pack: {
      family: 'conceito',
      guideline: 'Síndrome compartimental — pressão elevada em fascias após trauma ou hemorragia interna',
      roi_error: 'sindrome_compartimental_definicao',
      cluster: 'Compartimental — definição clínica',
      danger_footer: 'Gabarito A — pressão em compartimento',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Síndrome compartimental',
          meta: choqueSlideMeta,
          items: [
            {
              label: 'Definição',
              detail: 'Pressão elevada em compartimento osteofascial — dolorosa e perigosa.',
              icon: 'Gauge',
            },
            {
              label: 'Causas',
              detail: 'Hemorragia interna ou edema pós-trauma — inchaço em espaço fechado.',
              icon: 'Droplets',
            },
            {
              label: 'Mecanismo',
              detail: 'Isquemia muscular e nervosa — hipoperfusão local compartimental.',
              icon: 'AlertTriangle',
            },
            {
              label: '× Sepse',
              detail: 'Resposta inflamatória sistêmica a infecção — outro diagnóstico.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Termos inventados (disruptiva) ou apoptose — não a definição cobrada.',
              icon: 'XCircle',
            },
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: choqueSlideMeta,
          steps: [
            'Comando: condição dolorosa por acúmulo de pressão (hemorragia interna ou edema).',
            'B sepse — infecção sistêmica, não pressão em compartimento; eliminar.',
            'C síndrome disruptiva — termo inexistente; eliminar.',
            'D lesão medular — choque medular, outro mecanismo; eliminar.',
            'E apoptose — morte celular programada; eliminar.',
            'A síndrome compartimental — pressão em fascias com isquemia local.',
            'Marcar A.',
            'Fixação: compartimental = pressão ↑ em compartimento fechado.',
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Compartimental × choque sistêmico',
          meta: choqueSlideMeta,
          content: 'HIPOPERFUSÃO — DISTINÇÕES',
          rows: choqueTypesRows([
            { label: 'Compartimental', value: 'Pressão local em fascias — membro doloroso', badge: 'hot' },
            { label: '× Sepse', value: 'Choque distributivo por infecção', badge: 'warn' },
          ]),
          footer_rule: CHOQUE_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Sepse é resposta inflamatória a infecção — não descreve pressão em compartimento fechado.',
      C: '“Síndrome disruptiva” é distrator sem base clínica na definição cobrada.',
      D: 'Lesão medular cursa com choque medular — não o acúmulo de pressão em fascias musculares.',
      E: 'Apoptose é morte celular programada — não a condição dolorosa por pressão compartimental.',
    },
  },
  // fauel-enfermagem-enfermagem-em-centro-cirurgico-1777103887798-0 — reclassificado para CC (2026-07-08)
  'fenix-instituto-enfermagem-semiologia-em-enfermagem-1779563495719-3': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Hipoglicemia — sudorese, tremor e tontura em diabético (sinais adrenérgicos)',
      roi_error: 'hipoglicemia_vs_hiperglicemia',
      cluster: 'Diabetes — suspeita de hipoglicemia',
      danger_footer: 'Gabarito B — hipoglicemia',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Hipoglicemia — semiologia',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Diabético com tontura, fraqueza e sudorese intensa — suspeitar de quê?',
              icon: 'Target',
            },
            {
              label: 'Adrenérgico',
              detail: 'Sudorese fria · tremor · taquicardia — resposta ao baixo açúcar.',
              icon: 'Droplets',
            },
            {
              label: 'Neuroglicopênico',
              detail: 'Tontura · confusão · sonolência — cérebro sem glicose.',
              icon: 'Brain',
            },
            {
              label: '× Hiperglicemia',
              detail: 'Sede · poliúria · visão turva — perfil oposto ao da questão.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Confundir sudorese adrenérgica com hipertensão ou desidratação isolada.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Sudorese + tontura em DM = medir glicemia',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Diabético: tontura · fraqueza · sudorese intensa — hipótese?',
            'A hiperglicemia — sede e poliúria predominam; sudorese adrenérgica aponta ao oposto; eliminar.',
            'C hipertensão arterial — não explica o trio com sudorese em DM; eliminar.',
            'D desidratação severa — pele seca; aqui sudorese intensa; eliminar.',
            'B hipoglicemia — sudorese + tontura + fraqueza = perfil clássico.',
            'Marcar B.',
            'Fixação: sudorese em diabético = hipoglicemia até prova em contrário.',
          ],
          footer_rule: 'Glicemia capilar antes de hipótese',
        },
        {
          type: 'golden_rule',
          slide_title: 'Hipoglicemia — decore',
          meta: genericoSlideMeta,
          content: 'HIPOGLICEMIA — SINAIS',
          rows: HIPOGLICEMIA_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Hiperglicemia cursa com poliúria e sede — sudorese adrenérgica indica baixa de glicose, não hiperglicemia.',
      C: 'Hipertensão isolada não explica sudorese intensa com tontura em paciente diabético.',
      D: 'Desidratação tende a pele seca — sudorese intensa contradiz esse perfil.',
    },
  },
  'fenix-instituto-enfermagem-semiologia-em-enfermagem-1779563495719-5': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Eliminações — ausência prolongada de evacuação com distensão abdominal sugere constipação',
      roi_error: 'constipacao_vs_obstrucao',
      cluster: 'Eliminações — constipação intestinal',
      danger_footer: 'Gabarito C — constipação',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Eliminações — constipação',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Comando',
              detail:
                'Controle das eliminações na avaliação de enfermagem — ausência prolongada de evacuação com distensão abdominal.',
              icon: 'Target',
            },
            {
              label: 'Constipação',
              detail: 'Evacuação infrequente com fezes endurecidas e esforço evacuatório.',
              icon: 'CheckCircle',
            },
            {
              label: '× Obstrução',
              detail: 'Dor contínua intensa · vômitos biliosos · não elimina gases.',
              icon: 'Ban',
            },
            {
              label: '× Retenção urinária',
              detail: 'Globo vesical e anúria — trato urinário, não intestinal.',
              icon: 'XCircle',
            },
            {
              label: 'Pegadinha',
              detail: 'Confundir com obstrução aguda ou retenção urinária quando o foco é evacuação intestinal.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Evacuação = parte da avaliação de enfermagem',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Ausência prolongada de evacuação + distensão abdominal na avaliação de enfermagem.',
            'A obstrução gástrica aguda — vômitos e dor intensa predominam; eliminar.',
            'B hipoglicemia funcional — não relaciona eliminação intestinal; eliminar.',
            'D retenção urinária — trato urinário; comando ancora evacuação; eliminar.',
            'C constipação intestinal — padrão de evacuação ausente + distensão.',
            'Marcar C.',
            'Fixação: ausência prolongada de evacuação + distensão = pensar constipação primeiro.',
          ],
          footer_rule: 'Escala de Bristol reforça constipação',
        },
        {
          type: 'golden_rule',
          slide_title: 'Eliminações — referência',
          meta: genericoSlideMeta,
          content: 'AVALIAÇÃO DAS ELIMINAÇÕES',
          rows: ELIMINACAO_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Obstrução gástrica cursa com vômitos persistentes e dor intensa — quadro mais agudo.',
      B: 'Hipoglicemia funcional não explica ausência prolongada de evacuação com distensão.',
      D: 'Retenção urinária afeta trato urinário — o comando ancora evacuação intestinal.',
    },
  },
  'fepese-enfermagem-urgencias-e-emergencias-1777103994618-0': {
    branch: 'trauma',
    pack: {
      family: 'protocolo',
      guideline: 'Transporte APH — método de apoio; trauma: imobilização se suspeita de lesão',
      roi_error: 'transporte_apoio_vs_arrasto',
      cluster: 'APH — transporte de acidentado (imagem)',
      danger_footer: 'Gabarito D — transporte de apoio',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'APH — transporte XABCDE',
          meta: traumaSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Método de transporte de acidentado na imagem — técnica de APH em trauma.',
              icon: 'Target',
            },
            {
              label: 'Transporte de apoio',
              detail: 'Vítima consciente auxiliada a caminhar com suporte do socorrista.',
              icon: 'Users',
            },
            {
              label: 'Imobilização',
              detail: 'Fratura ou trauma grave — imobilizar antes de transportar; consciente estável → apoio.',
              icon: 'Bone',
            },
            {
              label: '× Costas',
              detail: 'Carregar nas costas — instável e risco cervical em trauma.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Confundir apoio com arrasto, colo ou bombeiro — técnicas distintas.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: traumaSlideMeta,
          steps: [
            'Imagem: transporte de acidentado — qual nome da técnica?',
            'A nas costas — instável e perigoso em trauma; eliminar.',
            'B de arrasto — arrastar no chão; não é o método da figura típica de apoio; eliminar.',
            'C ao colo — carregar nos braços; outra técnica; eliminar.',
            'E de bombeiro — dois socorristas; eliminar.',
            'D transporte de apoio — vítima auxiliada a deambular com suporte.',
            'Marcar D.',
            'Fixação: consciente + estável + sem suspeita cervical → apoio; trauma grave → prancha.',
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Transporte APH',
          meta: traumaSlideMeta,
          content: 'MÉTODOS DE TRANSPORTE',
          rows: [
            { label: 'Apoio', value: 'Consciente colaborativo — auxiliar deambulação', badge: 'hot' },
            { label: 'Bombeiro', value: 'Dois socorristas — vítima sentada', badge: 'ok' },
            { label: 'Arrasto', value: 'Último recurso — risco de lesão cutânea', badge: 'warn' },
            { label: '× Costas', value: 'Evitar em suspeita de trauma', badge: 'warn' },
            { label: 'Trauma grave', value: 'Imobilização em prancha rígida', badge: 'info' },
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Transporte nas costas é instável e contraindicado em suspeita de lesão cervical.',
      B: 'Arrasto no solo é técnica de último recurso — não corresponde ao transporte de apoio da figura.',
      C: 'Transporte ao colo é carregar nos braços — técnica distinta do apoio para deambulação.',
      E: 'Transporte de bombeiro exige dois socorristas em posição sentada — outro método.',
    },
  },
  'funatec-enfermagem-urgencias-e-emergencias-1777104077075-3': {
    branch: 'trauma',
    pack: {
      family: 'protocolo',
      guideline: 'TCE pré-hospitalar — imobilização cervical + posição horizontal estável + monitorar SSVV',
      roi_error: 'tce_aph_posicao_monitorar',
      cluster: 'TCE — conduta APH',
      danger_footer: 'Gabarito B — horizontal + monitorar',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'TCE — trauma craniano APH',
          meta: traumaSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail:
                'Atendimento pré-hospitalar a vítima de traumatismo craniano — ação do técnico de enfermagem.',
              icon: 'Target',
            },
            {
              label: 'Imobilização',
              detail: 'Fratura cervical suspeita — imobilização antes de movimentar; evitar hiperextensão.',
              icon: 'Bone',
            },
            {
              label: 'Estabilizar',
              detail: 'Posição horizontal estável — reduz risco de agravamento.',
              icon: 'Activity',
            },
            {
              label: 'Monitorar',
              detail: 'SSVV e nível de consciência — detectar deterioração neurológica.',
              icon: 'HeartPulse',
            },
            {
              label: 'Pegadinha',
              detail: 'Elevar cabeça, gelo local ou compressões sem parada cardíaca confirmada.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Traumatismo craniano — XABCDE e imobilização',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: traumaSlideMeta,
          steps: [
            'TCE no APH — conduta apropriada do técnico de enfermagem.',
            'A elevar cabeça + gelo — pode piorar pressão intracraniana e cervical; eliminar.',
            'C RCP se perder consciência — PCR exige ausência de respiração/pulso; eliminar.',
            'D analgésico VO — via oral insegura e não é prioridade APH; eliminar.',
            'B manter horizontal estável + monitorar SSVV — conduta inicial segura.',
            'Marcar B.',
            'Fixação: TCE APH = imobilizar + monitorar — não elevar cabeça nem comprimir sem indicação.',
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'TCE — APH',
          meta: traumaSlideMeta,
          content: 'TRAUMATISMO CRANIANO — CONDUTA',
          rows: xabcdeRows([
            { label: 'TCE APH', value: 'Horizontal estável + monitorar consciência e SSVV', badge: 'hot' },
            { label: '× Elevar cabeça', value: 'Não rotineiro no APH com suspeita cervical', badge: 'warn' },
            { label: '× Compressões automáticas', value: 'Só se parada cardíaca confirmada', badge: 'warn' },
          ]),
          footer_rule: TRAUMA_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Elevar cabeça e gelo local — pegadinha do concept_map; não é conduta inicial no TCE APH.',
      C: 'Compressões sem parada cardíaca — pegadinha do concept_map; perda de consciência ≠ compressões automáticas.',
      D: 'Analgésico via oral é inseguro e secundário no atendimento pré-hospitalar ao traumatismo craniano.',
    },
  },
  'funcern-enfermagem-exames-laboratoriais-1779563631609-6': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Diabetes descompensada — glicemia capilar baixa com rebaixamento de consciência = hipoglicemia',
      roi_error: 'hipoglicemia_glicemia_baixa',
      cluster: 'Glicemia capilar — hipoglicemia grave',
      danger_footer: 'Gabarito A — hipoglicemia',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Glicemia capilar — interpretação',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail:
                'Paciente com diabetes descompensada, rebaixamento do sensório, irresponsivo — glicemia capilar baixa na prova.',
              icon: 'Target',
            },
            {
              label: 'Clínica',
              detail: 'Irresponsivo a estímulos verbais e dolorosos — neuroglicopenia grave.',
              icon: 'Brain',
            },
            {
              label: 'Hipoglicemia',
              detail: 'Glicemia capilar baixa explica rebaixamento neste contexto metabólico.',
              icon: 'CheckCircle',
            },
            {
              label: '× Hiperglicemia',
              detail: 'Valor baixo de glicemia contradiz hiperglicemia — pegadinha da banca.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Confundir hipoglicemia com hipotrigliceridemia ou hipertrigliceridemia no enunciado.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Glicemia baixa + rebaixamento = hipoglicemia',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Paciente diabético descompensado — rebaixamento do sensório e glicemia capilar baixa.',
            'B hipotrigliceridemia — lipídios, não glicose; pegadinha do concept_map; eliminar.',
            'C hiperglicemia — valor baixo contradiz; pegadinha hiperglicemia; eliminar.',
            'D hipertrigliceridemia — lipídios elevados; pegadinha triglicerídeos; eliminar.',
            'A hipoglicemia — glicemia capilar baixa com rebaixamento.',
            'Marcar A.',
            'Fixação: rebaixamento + glicemia baixa = tratar hipoglicemia e acionar equipe.',
          ],
          footer_rule: 'Emergência metabólica — acionar equipe',
        },
        {
          type: 'golden_rule',
          slide_title: 'Glicemia — referência',
          meta: genericoSlideMeta,
          content: 'GLICEMIA CAPILAR',
          rows: HIPOGLICEMIA_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Hipotrigliceridemia — pegadinha do concept_map; exame cobrado é glicemia capilar, não lipídios.',
      C: 'Hiperglicemia — pegadinha citada no concept_map; glicemia baixa contradiz esse diagnóstico.',
      D: 'Hipertrigliceridemia — pegadinha triglicerídeos; não interpreta glicemia capilar baixa.',
    },
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
    console.log(`[handcraft:urgencias-g33] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g33] total=${ok}`);
}

main();
