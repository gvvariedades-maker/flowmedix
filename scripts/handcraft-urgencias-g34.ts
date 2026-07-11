#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g34 (8 slugs · 5º lote urgencias_generico).
 * Inferência: APH sinalização + fratura úmero → trauma · demais generico.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides as finalizeGenerico,
  metaBase as metaGenerico,
  slideMeta as genericoSlideMeta,
  type Pack as GenericoPack,
  type Q as GenericoQ,
} from './lib/urgenciasGenericoGolden';
import {
  finalizeSlides as finalizeTrauma,
  metaBase as metaTrauma,
  slideMeta as traumaSlideMeta,
  xabcdeRows,
  type Pack as TraumaPack,
  type Q as TraumaQ,
} from './lib/urgenciasTraumaGolden';

const LOTE = 'urgencias-g34';
const REVIEWER = 'handcraft-urgencias-g34';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const TRAUMA_FOOTER = 'XABCDE — segurança da cena antes do ABCDE';

/** Sem literais numéricos fora da guideline — deterioração precoce UTI. */
const DETERIORACAO_QUALITATIVA = [
  { label: 'Objetivo', value: 'Intervir antes da falência orgânica e PCR', badge: 'hot' },
  { label: 'Vigilância', value: 'Sinais sutis precedem colapso — comunicar equipe', badge: 'ok' },
  { label: '× Custos', value: 'Economia nunca vence risco clínico imediato', badge: 'warn' },
  { label: '× Restringir monitor', value: 'Menos vigilância agrava desfecho', badge: 'warn' },
  { label: '× Substituir médico', value: 'Enfermagem vigia e escala — não substitui avaliação médica', badge: 'info' },
];

/** Urgência × emergência hipertensiva — sem PA literal do enunciado. */
const CRISE_HIPERTENSIVA_QUALITATIVA = [
  { label: 'Urgência', value: 'PA muito elevada sem lesão aguda de órgão-alvo', badge: 'ok' },
  { label: 'Emergência', value: 'PA crítica + lesão aguda (encefalopatia · edema pulmonar agudo)', badge: 'hot' },
  { label: 'Órgão-alvo', value: 'Confusão · cefaleia intensa · papiledema = SNC', badge: 'warn' },
  { label: '× Estresse agudo', value: 'Elevação transitória sem disfunção orgânica', badge: 'info' },
  { label: '× HAS crônica', value: 'Adaptação crônica não explica encefalopatia aguda', badge: 'warn' },
];

/** Hipercalemia — shift intracelular (insulina + glicose). */
const HIPERCALEMIA_QUALITATIVA = [
  { label: 'Insulina + glicose', value: 'Desloca K⁺ para o meio intracelular — efeito rápido', badge: 'hot' },
  { label: 'Objetivo imediato', value: 'Reduzir risco de arritmia ventricular no ECG', badge: 'warn' },
  { label: '× Diurese imediata', value: 'Eliminação renal é mais lenta — não primeira medida', badge: 'info' },
  { label: '× Bicarbonato', value: 'Não “neutraliza” bicarbonato — outro mecanismo', badge: 'warn' },
  { label: '× Remoção definitiva', value: 'Shift é temporário — diálise/resina em outra fase', badge: 'ok' },
];

/** Broncoaspiração — rebaixamento de consciência. */
const BRONCOASPIRACAO_QUALITATIVA = [
  { label: 'Risco', value: 'Rebaixamento + reflexos VA reduzidos → regurgitação', badge: 'hot' },
  { label: 'Posição', value: 'Cabeceira 30°–45° + vigilância contínua', badge: 'ok' },
  { label: '× VO precoce', value: 'Via oral aumenta risco com rebaixamento', badge: 'warn' },
  { label: '× Dorsal plano', value: 'Facilita refluxo e aspiração', badge: 'warn' },
  { label: 'Escalar', value: 'Comunicar necessidade de via aérea definitiva', badge: 'info' },
];

/** Abdome agudo — associação doença × cuidado. */
const ABDOME_AGUDO_QUALITATIVA = [
  { label: 'Íleo paralítico', value: 'Jejum · distensão · RHA diminuídos', badge: 'ok' },
  { label: 'Diverticulite', value: 'Dor localizada · febre · processo infeccioso', badge: 'hot' },
  { label: 'Peritonite', value: 'Abdome agudo · rigidez · sepse', badge: 'warn' },
  { label: 'Hepática', value: 'Consciência · BH · sangramento', badge: 'info' },
  { label: 'Ordem', value: '1 → 2 → 3 → 4 (íleo · diverticulite · peritonite · hepática)', badge: 'ok' },
];

/** Obstrução intestinal — sinais de agravamento. */
const OBSTRUCAO_INTESTINAL_QUALITATIVA = [
  { label: 'Agravamento', value: 'Vômitos fecaloides + distensão progressiva', badge: 'hot' },
  { label: 'Fase inicial', value: 'Dor intermitente + RHA aumentados', badge: 'ok' },
  { label: 'Fezes líquidas', value: 'Pequeno volume — pode ocorrer em obstrução alta', badge: 'info' },
  { label: '× Analgesia', value: 'Alívio da dor não indica piora do quadro', badge: 'warn' },
  { label: '× Sonda', value: 'Diminuição de RHA após sonda pode ser esperada', badge: 'warn' },
];

/** Fratura úmero — nervo radial. */
const UMERO_RADIAL_QUALITATIVA = [
  { label: 'Anatomia', value: 'Nervo radial sulca espiral da diáfise do úmero', badge: 'hot' },
  { label: 'Lesão', value: 'Paresia de extensão de punho e dedos (“mão caída”)', badge: 'ok' },
  { label: '× Ciático', value: 'Membro inferior — não úmero', badge: 'warn' },
  { label: '× LCA', value: 'Ligamento do joelho — não complicação neurovascular do úmero', badge: 'info' },
  { label: '× Ulnar', value: 'Canal cubital/cotovelo — outra topografia', badge: 'warn' },
];

type GenericoEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };
type TraumaEntry = { branch: 'trauma'; pack: TraumaPack; danger: Record<string, string> };

type HandcraftEntry = GenericoEntry | TraumaEntry;

const SPECS: Record<string, HandcraftEntry> = {
  'fundatec-enfermagem-processo-de-enfermagem-1780006976703-5': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Paciente crítico — reconhecimento precoce de deterioração para intervenção antes de PCR/FMO',
      roi_error: 'deterioracao_precoce_uti_objetivo',
      cluster: 'UTI — deterioração clínica precoce',
      danger_footer: 'Gabarito C — prevenir FMO e PCR',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'UTI — deterioração precoce',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail:
                'UTI — alterações fisiológicas sutis precedem colapso; técnico vigia e comunica a equipe.',
              icon: 'Activity',
            },
            {
              label: 'Objetivo clínico',
              detail: 'Intervir cedo para evitar progressão a falência orgânica múltipla e parada cardiorrespiratória.',
              icon: 'HeartPulse',
            },
            {
              label: 'Papel do técnico',
              detail: 'Vigilância contínua + comunicação imediata — não substitui avaliação médica.',
              icon: 'Users',
            },
            {
              label: '× Custos',
              detail: 'Reduzir custos sem impacto clínico — distrator administrativo.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Limitar antimicrobianos, exames ou monitorização em todos os casos — falso princípio.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Detectar cedo → escalar → prevenir PCR',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Comando: principal objetivo do reconhecimento precoce de deterioração no paciente crítico.',
            'A custos hospitalares exclusivos — objetivo administrativo, não clínico; eliminar.',
            'B evitar antimicrobianos e terapias invasivas em todos — generalização absurda; eliminar.',
            'D restringir exames e monitorização — menos vigilância piora desfecho; eliminar.',
            'E substituir avaliação médica — enfermagem vigia e comunica, não substitui médico; eliminar.',
            'C prevenir FMO e PCR com intervenção imediata — único objetivo centrado no paciente.',
            'Marcar C.',
            'Fixação: deterioração precoce serve para salvar vida — não para economizar.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Deterioração — decore',
          meta: genericoSlideMeta,
          content: 'VIGILÂNCIA EM UTI',
          rows: DETERIORACAO_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Reduzir custos sem impacto clínico desvia o objetivo — deterioração precoce visa salvar vida, não economia.',
      B: 'Evitar antimicrobianos e terapias invasivas em todos os casos é conduta irresponsável — não é o objetivo da vigilância.',
      D: 'Restringir exames e monitorização reduz a chance de detectar piora — contradiz reconhecimento precoce.',
      E: 'Observação exclusiva da enfermagem não substitui avaliação médica — técnico vigia e comunica.',
    },
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006976703-7': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Crise hipertensiva — emergência = PA crítica + lesão aguda de órgão-alvo (encefalopatia hipertensiva)',
      roi_error: 'emergencia_hipertensiva_encefalopatia',
      cluster: 'HAS — urgência × emergência hipertensiva',
      danger_footer: 'Gabarito E — emergência com lesão de órgão-alvo',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Crise hipertensiva — classificação',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Achados',
              detail: 'PA muito elevada + confusão + cefaleia intensa + papiledema — SNC comprometido.',
              icon: 'Brain',
            },
            {
              label: 'Emergência',
              detail: 'Elevação crítica com lesão aguda de órgão-alvo — exige redução controlada e monitorização.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Urgência',
              detail: 'PA elevada importante sem dano agudo a órgão-alvo — outro perfil.',
              icon: 'Info',
            },
            {
              label: '× Estresse',
              detail: 'Elevação transitória autonômica sem disfunção orgânica — não explica papiledema.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Confundir HAS crônica compensada com encefalopatia hipertensiva aguda.',
              icon: 'Target',
            },
          ],
          footer_rule: 'Lesão de órgão-alvo = emergência',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'PA extremamente elevada + confusão + cefaleia + papiledema — classificar o quadro.',
            'A elevação transitória ao estresse sem disfunção orgânica — não há lesão de órgão-alvo; eliminar.',
            'B urgência hipertensiva sem dano agudo — papiledema e confusão indicam lesão; eliminar.',
            'C HAS crônica com adaptação — não explica encefalopatia aguda; eliminar.',
            'D desregulação autonômica autolimitada — quadro neurológico agudo contradiz; eliminar.',
            'E emergência hipertensiva com lesão de órgão-alvo — encefalopatia hipertensiva.',
            'Marcar E.',
            'Fixação: papiledema + rebaixamento = SNC — emergência, não urgência isolada.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'HAS aguda — referência',
          meta: genericoSlideMeta,
          content: 'URGÊNCIA × EMERGÊNCIA',
          rows: CRISE_HIPERTENSIVA_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Elevação transitória ao estresse não cursa com papiledema e confusão — faltam sinais de lesão de órgão-alvo.',
      B: 'Urgência hipertensiva exige ausência de dano agudo — papiledema e encefalopatia indicam emergência.',
      C: 'Adaptação cerebral crônica da HAS não explica confusão aguda e papiledema no pronto-socorro.',
      D: 'Quadro autolimitado com medidas sintomáticas não condiz com encefalopatia hipertensiva instalada.',
    },
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006976703-8': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Hipercalemia grave — insulina regular IV + glicose desloca K⁺ para o intracelular (medida temporária)',
      roi_error: 'hipercalemia_insulina_shift_intracelular',
      cluster: 'Hipercalemia — insulina + glicose emergência',
      danger_footer: 'Gabarito D — shift intracelular do potássio',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Hipercalemia — emergência',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Acidose metabólica + hipercalemia + alterações no ECG — risco de arritmia ventricular.',
              icon: 'Zap',
            },
            {
              label: 'Insulina + glicose',
              detail: 'Promovem entrada de K⁺ na célula — efeito rápido para estabilizar membrana.',
              icon: 'Syringe',
            },
            {
              label: 'Objetivo',
              detail: 'Reduzir potássio sérico rapidamente e prevenir arritmias fatais — não é remoção definitiva.',
              icon: 'HeartPulse',
            },
            {
              label: '× Diurese',
              detail: 'Eliminação renal é mais lenta — não explica a conduta de emergência imediata.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Confundir shift intracelular com neutralização de bicarbonato ou produção de lactato.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'ECG alterado = tratar K⁺ agora',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Hipercalemia grave com ECG de risco — objetivo da insulina regular IV + glicose.',
            'A eliminação renal imediata por diurese — mecanismo lento; não primeira medida; eliminar.',
            'B neutralizar bicarbonato sérico — insulina não age assim; eliminar.',
            'C estimular lactato hepático — não é o mecanismo da insulina no K⁺; eliminar.',
            'E diurese osmótica e remoção definitiva — shift é temporário; eliminar como objetivo principal.',
            'D deslocamento intracelular do potássio — reduz risco de arritmia rapidamente.',
            'Marcar D.',
            'Fixação: insulina + glicose = empurra K⁺ para dentro da célula — ponte até remoção definitiva.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Hipercalemia — decore',
          meta: genericoSlideMeta,
          content: 'MANEJO AGUDO DO K⁺',
          rows: HIPERCALEMIA_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Aumento da diurese elimina K⁺ lentamente — não explica a urgência da insulina com glicose no ECG alterado.',
      B: 'Insulina não neutraliza bicarbonato — mecanismo é transporte de potássio para o intracelular.',
      C: 'Produção hepática de lactato não é o efeito da insulina na hipercalemia aguda.',
      E: 'Remoção definitiva exige diálise ou resina — insulina + glicose são medida temporária de shift.',
    },
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780007230169-0': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Rebaixamento de consciência — elevar cabeceira 30°–45° para reduzir broncoaspiração',
      roi_error: 'broncoaspiracao_cabeceira_30_45',
      cluster: 'Via aérea — prevenção de broncoaspiração',
      danger_footer: 'Gabarito C — cabeceira 30°–45°',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Broncoaspiração — prevenção',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Risco',
              detail: 'Rebaixamento + reflexos de via aérea reduzidos + risco de vômito/regurgitação.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Conduta',
              detail: 'Elevar cabeceira entre 30° e 45° + monitorar consciência + escalar proteção de VA.',
              icon: 'Bed',
            },
            {
              label: '× Via oral',
              detail: 'Líquidos por VO com rebaixamento aumentam risco de aspiração.',
              icon: 'Ban',
            },
            {
              label: '× Dorsal',
              detail: 'Decúbito dorsal facilita refluxo — piora broncoaspiração.',
              icon: 'XCircle',
            },
            {
              label: 'Pegadinha',
              detail: 'Estimular alerta ou adiar cuidados de VA até avaliação médica isolada.',
              icon: 'Target',
            },
          ],
          footer_rule: 'Proteger via aérea antes de complicar',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Rebaixamento + risco de vômito — conduta do técnico para reduzir broncoaspiração.',
            'A ofertar líquidos VO — via oral insegura com reflexos reduzidos; eliminar.',
            'B decúbito dorsal para monitorar — posição favorece aspiração; eliminar.',
            'D estimular alerta e tosse — não substitui posicionamento seguro; eliminar.',
            'E evitar intervenções em VA até médico — posicionamento é medida imediata do técnico; eliminar.',
            'C cabeceira 30°–45° + vigilância + comunicar equipe — reduz regurgitação.',
            'Marcar C.',
            'Fixação: rebaixamento = posicionar cabeceira elevada e escalar via aérea definitiva.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Aspiração — referência',
          meta: genericoSlideMeta,
          content: 'VIA AÉREA — REBAIXAMENTO',
          rows: BRONCOASPIRACAO_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Líquidos por via oral com reflexos protetores reduzidos aumentam o risco imediato de broncoaspiração.',
      B: 'Decúbito dorsal facilita regurgitação para vias aéreas — posição incorreta para prevenção.',
      D: 'Estimular alerta e tosse não é a medida prioritária com rebaixamento e risco de vômito.',
      E: 'Posicionamento seguro e vigilância são condutas imediatas da enfermagem — não devem ser adiados.',
    },
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780007230169-4': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Abdome agudo — íleo (jejum/RHA) · diverticulite (dor/febre) · peritonite (rigidez/sepse) · hepática (consciência/BH)',
      roi_error: 'abdome_agudo_associacao_cuidados',
      cluster: 'Abdome agudo — associação doença × cuidado',
      danger_footer: 'Gabarito A — 1-2-3-4',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Abdome agudo — associações',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Íleo paralítico',
              detail: 'Jejum · observar distensão · RHA diminuídos ou ausentes.',
              icon: 'CirclePause',
            },
            {
              label: 'Diverticulite',
              detail: 'Dor abdominal localizada · febre · sinais infecciosos.',
              icon: 'Thermometer',
            },
            {
              label: 'Peritonite',
              detail: 'Abdome agudo · rigidez · dor intensa · sepse.',
              icon: 'AlertOctagon',
            },
            {
              label: 'Insuficiência hepática',
              detail: 'Nível de consciência · balanço hídrico · sangramento.',
              icon: 'Droplet',
            },
            {
              label: 'Pegadinha',
              detail: 'Trocar ordem — peritonite não combina com jejum de íleo isolado.',
              icon: 'Shuffle',
            },
          ],
          footer_rule: 'Fisiopatologia guia o cuidado',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Relacionar: íleo · diverticulite · peritonite · insuficiência hepática → cuidados da coluna 2.',
            '1 íleo → jejum + distensão + RHA diminuídos (primeiro parêntese).',
            '2 diverticulite → dor localizada + febre + infecção (segundo).',
            '3 peritonite → abdome agudo + rigidez + sepse (terceiro).',
            '4 hepática → consciência + BH + sangramento (quarto).',
            'Sequência 1-2-3-4 — letra A.',
            'Marcar A.',
            'Fixação: íleo = motilidade; diverticulite = foco inflamatório; peritonite = sepse abdominal.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Abdome — decore',
          meta: genericoSlideMeta,
          content: 'ASSOCIAÇÕES CLÁSSICAS',
          rows: ABDOME_AGUDO_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: '2-1-4-3 inverte íleo com diverticulite e troca peritonite com hepática — cuidados não correspondem.',
      C: '3-2-1-4 coloca peritonite no íleo e íleo na peritonite — rigidez abdominal não é jejum por íleo.',
      D: '4-3-2-1 reverte toda a lógica fisiopatológica — insuficiência hepática não pede jejum por íleo primeiro.',
      E: '1-3-4-2 associa íleo corretamente mas coloca peritonite antes da diverticulite — ordem incorreta.',
    },
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780007230169-5': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Obstrução intestinal — vômitos fecaloides + distensão progressiva indicam agravamento',
      roi_error: 'obstrucao_intestinal_vomitos_fecaloides',
      cluster: 'Obstrução intestinal — sinais de piora',
      danger_footer: 'Gabarito C — vômitos fecaloides',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Obstrução intestinal — evolução',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Contexto',
              detail: 'Paciente com obstrução intestinal em observação — reconhecer agravamento precoce.',
              icon: 'Target',
            },
            {
              label: 'Agravamento',
              detail: 'Vômitos fecaloides + distensão abdominal progressiva — obstrução avançada.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Fase inicial',
              detail: 'Dor intermitente + ruídos hidroaéreos aumentados — ainda não é piora máxima.',
              icon: 'Activity',
            },
            {
              label: '× Alívio da dor',
              detail: 'Analgesia eficaz não significa resolução ou agravamento do quadro.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Fezes líquidas em pequeno volume podem ocorrer em obstrução alta — não são melhora.',
              icon: 'Info',
            },
          ],
          footer_rule: 'Vômito fecaloide = sinal de alarme',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Obstrução intestinal — qual achado representa agravamento clínico?',
            'A dor intermitente + RHA aumentados — padrão inicial, não piora máxima; eliminar.',
            'B fezes líquidas em pequeno volume — pode ocorrer na obstrução alta; eliminar.',
            'D redução da dor após analgesia — alívio sintomático, não critério de agravamento; eliminar.',
            'E diminuição de RHA após sonda — pode ser efeito da descompressão; eliminar.',
            'C vômitos fecaloides + distensão progressiva — obstrução avançada com conteúdo distal.',
            'Marcar C.',
            'Fixação: fecaloide = conteúdo intestinal distal no vômito — escalar equipe.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Obstrução — referência',
          meta: genericoSlideMeta,
          content: 'SINAIS DE PIORA',
          rows: OBSTRUCAO_INTESTINAL_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Dor intermitente com RHA aumentados sugere fase inicial — não o agravamento com conteúdo fecaloide.',
      B: 'Eliminação de fezes líquidas em pequeno volume pode ocorrer na obstrução alta sem indicar melhora.',
      D: 'Redução da dor após analgesia é efeito do medicamento — não define progressão da obstrução.',
      E: 'Diminuição de RHA após passagem de sonda pode ser esperada — não equivale a vômito fecaloide.',
    },
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780011956256-6': {
    branch: 'trauma',
    pack: {
      family: 'protocolo',
      guideline: 'APH trauma — segurança da cena: sinalização a distância proporcional à velocidade antes de abordar vítimas',
      roi_error: 'aph_sinalizacao_cones_distancia',
      cluster: 'APH — segurança da cena e sinalização',
      danger_footer: 'Gabarito D — cones a distância segura',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'APH — segurança da cena',
          meta: traumaSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail:
                'Acidente automobilístico em via rápida — trauma em cena; fratura suspeita exige imobilização antes do transporte.',
              icon: 'Car',
            },
            {
              label: 'Prioridade',
              detail: 'Segurança da cena (X do XABCDE) — proteger equipe, vítimas e tráfego.',
              icon: 'Shield',
            },
            {
              label: 'Sinalização',
              detail: 'Cones ou luminosos a distância segura proporcional à velocidade da via — antes de aproximar.',
              icon: 'TriangleAlert',
            },
            {
              label: '× Só luzes',
              detail: 'Apenas luzes da viatura ao lado do acidente — insuficiente em via rápida.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Fita ao redor das vítimas ou sirene intermitente sem isolamento do tráfego.',
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
            'APH em via rápida — primeira medida crucial de sinalização na abordagem.',
            'A luzes + viatura bloqueando faixa ao lado — exposição imediata ao tráfego; eliminar.',
            'B fita zebrada ao redor das vítimas — perímetro interno sem proteger a via; eliminar.',
            'C sirene intermitente para dispersar — não substitui isolamento físico da pista; eliminar.',
            'D cones/luminosos a distância segura proporcional à velocidade — antes de aproximar das vítimas.',
            'Marcar D.',
            'Fixação: XABCDE começa em X — cena segura e sinalizada antes do ABCDE.',
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Sinalização APH',
          meta: traumaSlideMeta,
          content: 'SEGURANÇA DA CENA',
          rows: xabcdeRows([
            { label: '1ª medida', value: 'Sinalizar pista a distância — cones/luzes', badge: 'hot' },
            { label: 'Distância', value: 'Proporcional à velocidade da via', badge: 'ok' },
            { label: '× Viatura ao lado', value: 'Bloqueio imediato expõe equipe', badge: 'warn' },
            { label: '× Fita nas vítimas', value: 'Não protege do tráfego externo', badge: 'warn' },
          ]),
          footer_rule: TRAUMA_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Posicionar a viatura ao lado do acidente sem sinalização prévia expõe a equipe ao tráfego em via rápida.',
      B: 'Fita zebrada ao redor das vítimas isola o perímetro interno — não alerta motoristas a distância na pista.',
      C: 'Sirene intermitente não substitui cones ou luminosos posicionados a distância proporcional à velocidade.',
    },
  },
  'fundatec-enfermagem-semiologia-em-enfermagem-1779563480978-3': {
    branch: 'trauma',
    pack: {
      family: 'conceito',
      guideline: 'Fratura da diáfise do úmero — nervo radial no sulco espiral é a complicação neurovascular mais frequente',
      roi_error: 'fratura_umero_nervo_radial',
      cluster: 'Trauma — fratura de úmero × nervo radial',
      danger_footer: 'Gabarito A — lesão do nervo radial',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Úmero — nervo radial',
          meta: traumaSlideMeta,
          items: [
            {
              label: 'Anatomia',
              detail:
                'Fratura da diáfise do úmero — imobilizar o membro; nervo radial no sulco espiral é o mais lesado.',
              icon: 'Bone',
            },
            {
              label: 'Lesão típica',
              detail: 'Fratura da diáfise do úmero → lesão do nervo radial (mais frequente).',
              icon: 'Zap',
            },
            {
              label: 'Clínica',
              detail: 'Paresia de extensão de punho e dedos — “mão caída”.',
              icon: 'Hand',
            },
            {
              label: '× Ciático',
              detail: 'Nervo do membro inferior — não relacionado ao úmero.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Confundir com ulnar (cotovelo) ou ligamento cruzado anterior (joelho).',
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
            'Fratura da diáfise do úmero — complicação neurovascular mais frequente.',
            'B nervo ciático — membro inferior; eliminar.',
            'C ligamento cruzado anterior — joelho; eliminar.',
            'D nervo ulnar — topografia cubital; menos típico na diáfise do úmero; eliminar.',
            'A lesão do nervo radial — anatomia do sulco espiral do úmero.',
            'Marcar A.',
            'Fixação: úmero médio = radial — extensão de punho comprometida.',
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Úmero — decore',
          meta: traumaSlideMeta,
          content: 'FRATURA × NERVO',
          rows: UMERO_RADIAL_QUALITATIVA,
          footer_rule: TRAUMA_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Nervo ciático inerva o membro inferior — não tem relação anatômica com a diáfise do úmero.',
      C: 'Ligamento cruzado anterior é estrutura do joelho — distrator ortopédico sem vínculo neurovascular com o úmero.',
      D: 'Nervo ulnar é mais associado ao cotovelo/canal cubital — na diáfise do úmero predomina o radial.',
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
    console.log(`[handcraft:urgencias-g34] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g34] total=${ok}`);
}

main();
