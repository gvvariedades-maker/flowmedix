#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g35 (7 slugs · 6º lote urgencias_generico).
 * Inferência: pupilar V/F → vf_protocolo · Battle TCE → trauma · demais generico.
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
  type Pack as TraumaPack,
  type Q as TraumaQ,
} from './lib/urgenciasTraumaGolden';
import {
  finalizeSlides as finalizeVf,
  metaBase as metaVf,
  slideMeta as vfSlideMeta,
  vfRows,
  type Pack as VfPack,
  type Q as VfQ,
} from './lib/urgenciasVfProtocoloGolden';

const LOTE = 'urgencias-g35';
const REVIEWER = 'handcraft-urgencias-g35';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const TRAUMA_FOOTER = 'XABCDE — sinais de base de crânio no D';
const VF_FOOTER = 'V/F — julgue cada assertiva antes das letras';

/** Terminologia pupilar — sem spoiler de sequência. */
const PUPILAR_QUALITATIVA = [
  { label: 'Anisocoria', value: 'Pupilas com diâmetros diferentes entre si', badge: 'ok' },
  { label: 'Isocoria', value: 'Pupilas com o mesmo diâmetro', badge: 'ok' },
  { label: 'Miose', value: 'Contração pupilar — pupila menor', badge: 'hot' },
  { label: 'Midríase', value: 'Dilatação pupilar — pupila maior', badge: 'hot' },
  { label: 'Pegadinha', value: 'Trocar miose (contrai) por midríase (dilata)', badge: 'warn' },
];

/** Sinais de fratura de base de crânio — sem IAM/AVC drift. */
const BASE_CRANIO_QUALITATIVA = [
  { label: 'Battle', value: 'Hematoma retroauricular/mastoide — osso temporal', badge: 'hot' },
  { label: 'Guaxinim', value: 'Equimose periorbitária bilateral', badge: 'ok' },
  { label: 'Otorragia', value: 'Sangramento pelo ouvido — suspeita de fratura', badge: 'warn' },
  { label: '× Murphy', value: 'Sinal abdominal — colecistite, não crânio', badge: 'info' },
  { label: '× Halo', value: 'Duplo halo/halo invertido — outro contexto (TCE/hematoma)', badge: 'warn' },
];

/** Antagonista opioide — evitar vocabulário RCP dominante nos slides. */
const NALOXONA_QUALITATIVA = [
  { label: 'Cenário', value: 'Depressão respiratória por opioide com pulso presente', badge: 'hot' },
  { label: 'Ventilação', value: 'Suporte ventilatório enquanto prepara antídoto', badge: 'ok' },
  { label: 'Antídoto', value: 'Antagonista opioide — reverte depressão respiratória', badge: 'hot' },
  { label: '× Mais opioide', value: 'Fentanil/morfina agravam o quadro', badge: 'warn' },
  { label: '× Magnésio', value: 'Indicado em arritmias — não é antídoto opioide', badge: 'info' },
];

/** Bradicardia sintomática — primeira linha farmacológica. */
const BRADICARDIA_QUALITATIVA = [
  { label: 'Bradicardia', value: 'FC baixa — avaliar perfusão e sintomas', badge: 'ok' },
  { label: '1ª linha', value: 'Anticolinérgico — aumenta frequência cardíaca', badge: 'hot' },
  { label: '× Antiarrítmico', value: 'Amiodarona/lidocaína — taquiarritmias, não bradicardia', badge: 'warn' },
  { label: '× Bicarbonato', value: 'Acidose metabólica — outro contexto', badge: 'info' },
  { label: '× Inotrópico', value: 'Dobutamina — baixo débito cardíaco, não 1ª linha da bradicardia', badge: 'warn' },
];

/** Emergência em saúde pública — articulação SUS. */
const ESP_QUALITATIVA = [
  { label: 'Articulação', value: 'Governo + ONGs + sociedade no âmbito do SUS', badge: 'hot' },
  { label: 'Fases', value: 'Redução de risco · manejo · recuperação', badge: 'ok' },
  { label: 'Vulnerabilidade', value: 'Fatores sociais/ambientais AUMENTAM o dano — não eliminam risco', badge: 'warn' },
  { label: '× Suspender tudo', value: 'Não se suspendem todos os programas de rotina automaticamente', badge: 'info' },
  { label: '× Só pandemia', value: 'ESP não se restringe a desastres locais ou só pandemias', badge: 'warn' },
];

/** Desmaio inconsciente — avaliação neurológica inicial. */
const DESMAIO_NEURO_QUALITATIVA = [
  { label: 'Cenário', value: 'Inconsciente com pulso e respiração preservados', badge: 'hot' },
  { label: 'Prioridade', value: 'Escore de coma + avaliação pupilar — rebaixamento neurológico', badge: 'ok' },
  { label: '× Transporte imediato', value: 'Avaliar neurologicamente antes de remoção precipitada', badge: 'warn' },
  { label: '× Temperatura', value: 'Não é o próximo passo na avaliação primária neurológica', badge: 'info' },
  { label: '× Sonda vesical', value: 'Procedimento invasivo — não prioritário no desmaio agudo', badge: 'warn' },
];

/** Avaliação primária clínica — ABC inicial. */
const AVALIACAO_PRIMARIA_QUALITATIVA = [
  { label: 'A — Responsividade', value: 'Estímulo verbal e tátil — nível de consciência', badge: 'hot' },
  { label: 'B — Ventilação', value: 'Expansão torácica e padrão respiratório', badge: 'ok' },
  { label: '× Jugular', value: 'Distensão venosa — avaliação secundária/cardiovascular', badge: 'info' },
  { label: '× Queixa', value: 'Anamnese dirigida — após estabilização primária', badge: 'warn' },
  { label: '× Glicemia', value: 'Exame direcionado — não compõe o núcleo primário universal', badge: 'warn' },
];

type GenericoEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };
type TraumaEntry = { branch: 'trauma'; pack: TraumaPack; danger: Record<string, string> };
type VfEntry = { branch: 'vf_protocolo'; pack: VfPack; danger: Record<string, string> };

type HandcraftEntry = GenericoEntry | TraumaEntry | VfEntry;

const SPECS: Record<string, HandcraftEntry> = {
  'fundatec-enfermagem-semiologia-em-enfermagem-1779563495719-4': {
    branch: 'vf_protocolo',
    pack: {
      family: 'vf',
      guideline: 'Terminologia pupilar — anisocoria (V) · miose≠dilatação (F) · isocoria (V) · midríase≠contração (F)',
      roi_error: 'vf_pupilar_terminologia',
      cluster: 'V/F — exame pupilar (anisocoria · miose · isocoria · midríase)',
      danger_footer: 'Gabarito C — V, F, V, F',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Exame pupilar — V/F',
          meta: vfSlideMeta,
          items: [
            {
              label: 'Contexto clínico',
              detail:
                'Estado pupilar no exame neurológico — observar diâmetro, simetria e resposta à luz (comprometimentos neurológicos e substâncias).',
              icon: 'ScanEye',
            },
            {
              label: 'Comando',
              detail:
                'Exame pupilar neurológico — julgar anisocoria, miose, isocoria e midríase (diâmetro, simetria e resposta à luz).',
              icon: 'Target',
            },
            {
              label: 'Afirmativa I',
              detail: 'Anisocoria — pupilas com diâmetros diferentes (simetria alterada) — verdadeira.',
              icon: 'Eye',
            },
            {
              label: 'Afirmativa II',
              detail: 'Miose — contração pupilar; afirmar que miose é dilatação é falsa.',
              icon: 'Minus',
            },
            {
              label: 'Afirmativa III',
              detail: 'Isocoria — mesmo diâmetro entre as pupilas — verdadeira.',
              icon: 'Circle',
            },
            {
              label: 'Afirmativa IV',
              detail: 'Midríase — dilatação pupilar; afirmar que midríase é contração é falsa.',
              icon: 'Plus',
            },
          ],
          footer_rule: VF_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: vfSlideMeta,
          steps: [
            'Exame pupilar neurológico — julgar afirmativas I–IV (anisocoria · miose · isocoria · midríase) antes das letras.',
            'I — anisocoria = diâmetros diferentes → verdadeira (V).',
            'II — miose = dilatação → falsa; miose é contração pupilar (F).',
            'III — isocoria = mesmo diâmetro → verdadeira (V).',
            'IV — midríase = contração → falsa; midríase é dilatação (F).',
            'Sequência V, F, V, F — eliminar A, B, D e E.',
            'Marcar C.',
            'Fixação: miose ↓ · midríase ↑ — resposta pupilar à luz intensa envolve miose.',
          ],
          footer_rule: VF_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Pupilar — decore',
          meta: vfSlideMeta,
          content: 'TERMINOLOGIA PUPILAR',
          rows: vfRows([
            { roman: 'I', verdict: 'V', note: 'Anisocoria — pupilas com diâmetros diferentes' },
            { roman: 'II', verdict: 'F', note: 'Miose é contração pupilar, não dilatação' },
            { roman: 'III', verdict: 'V', note: 'Isocoria — mesmo diâmetro pupilar' },
            { roman: 'IV', verdict: 'F', note: 'Midríase é dilatação, não contração' },
          ]),
          footer_rule: 'V, F, V, F — letra C',
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'F-V-F-V inicia com falso na anisocoria — assertiva 1 é verdadeira (pupilas de tamanhos diferentes).',
      B: 'V-F-F-V marca isocoria como falsa — assertiva 3 é verdadeira (mesmo diâmetro).',
      D: 'F-V-V-F valida miose como dilatação e midríase como contração — inverte os termos.',
      E: 'V-V-F-F trata miose como verdadeira na forma “dilatação” — assertiva 2 é falsa.',
    },
  },
  'fundatec-enfermagem-semiologia-em-enfermagem-1779563531989-3': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Fratura de base de crânio — hematoma na apófise mastoide = sinal de Battle',
      roi_error: 'sinal_battle_mastoide',
      cluster: 'TCE — sinal de Battle (osso temporal)',
      danger_footer: 'Gabarito B — Battle',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Base de crânio — sinais',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Trauma craniano com suspeita de fratura da base — região temporal.',
              icon: 'Target',
            },
            {
              label: 'Local',
              detail: 'Hematoma junto à apófise mastoide — retroauricular.',
              icon: 'Ear',
            },
            {
              label: 'Sinal de Battle',
              detail: 'Equimose mastoide/retroauricular — fratura de base temporal.',
              icon: 'AlertTriangle',
            },
            {
              label: '× Guaxinim',
              detail: 'Equimose periorbitária — outro sinal de base de crânio.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Murphy (abdome) · halo (outro contexto) — distratores sem topografia mastoide.',
              icon: 'XCircle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Trauma craniano — hematoma na apófise mastoide. Nome do sinal?',
            'A Guaxinim — equimose periorbitária; local errado; eliminar.',
            'C Duplo halo — padrão de imagem/TCE; não é o epônimo mastoide; eliminar.',
            'D Halo invertido — distrator sem relação com mastoide; eliminar.',
            'E Murphy — sinal de colecistite; abdome; eliminar.',
            'B Battle — hematoma retroauricular/mastoide na fratura temporal.',
            'Marcar B.',
            'Fixação: mastoide = Battle · periorbita = guaxinim.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Base de crânio — decore',
          meta: genericoSlideMeta,
          content: 'SINAIS DE FRATURA',
          rows: BASE_CRANIO_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Sinal de guaxinim é equimose periorbitária — o enunciado ancora a apófise mastoide, não a órbita.',
      C: 'Duplo halo descreve padrão radiológico de hematoma — não é o epônimo do hematoma mastoide.',
      D: 'Halo invertido não corresponde ao sinal retroauricular clássico da fratura temporal.',
      E: 'Sinal de Murphy é semiologia abdominal — sem relação com trauma craniano.',
    },
  },
  'fundatec-enfermagem-urgencias-e-emergencias-1777103976379-5': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Intoxicação por opioide com pulso — ventilação de suporte + antagonista opioide (naloxona)',
      roi_error: 'naloxona_intoxicacao_opioide',
      cluster: 'Opioide — antídoto com pulso presente',
      danger_footer: 'Gabarito C — naloxona',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Opioide — antídoto',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'SAMU — jovem com suspeita de intoxicação por opioide; pulso presente, respiração deprimida.',
              icon: 'Target',
            },
            {
              label: 'Prioridade',
              detail: 'Ventilação de suporte — oxigenação enquanto reverte o efeito opioide.',
              icon: 'Wind',
            },
            {
              label: 'Antídoto',
              detail: 'Antagonista competitivo dos receptores opioide — restaura drive respiratório.',
              icon: 'Syringe',
            },
            {
              label: '× Mais opioide',
              detail: 'Fentanil e morfina são agonistas — agravam a depressão respiratória.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Magnésio (arritmia) · efedrina (PA) — não são antídotos opioide.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Ventilar + antagonista opioide',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Intoxicação por opioide com pulso — medicamento do algoritmo de emergência opioide?',
            'A sulfato de magnésio — arritmias/Torsades; não antídoto opioide; eliminar.',
            'B fentanil — agonista opioide; piora depressão respiratória; eliminar.',
            'D morfina — outro opioide; contraindicado; eliminar.',
            'E efedrina — vasopressor/simpaticomimético; não reverte opioide; eliminar.',
            'C naloxona — antagonista opioide indicado com ventilação de suporte.',
            'Marcar C.',
            'Fixação: pulso + depressão respiratória opioide = ventilar + naloxona.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Opioide — decore',
          meta: genericoSlideMeta,
          content: 'INTOXICAÇÃO OPIOIDE',
          rows: NALOXONA_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Sulfato de magnésio trata arritmias ventriculares — não antagoniza receptores opioide.',
      B: 'Fentanil é opioide agonista — intensifica a depressão respiratória, não a trata.',
      D: 'Morfina é agonista opioide — administrá-la agravaria a intoxicação.',
      E: 'Efedrina eleva pressão arterial — não reverte depressão respiratória por opioide.',
    },
  },
  'fundatec-enfermagem-urgencias-e-emergencias-1777104056718-7': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Bradicardia sintomática — primeira linha farmacológica: atropina',
      roi_error: 'bradicardia_atropina_primeira_linha',
      cluster: 'Bradicardia — tratamento de 1ª linha',
      danger_footer: 'Gabarito D — atropina',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Bradicardia — 1ª linha',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Emergência — bradicardia assintomática ou com instabilidade hemodinâmica.',
              icon: 'Target',
            },
            {
              label: 'Mecanismo',
              detail: 'Bloqueio vagal/AV — frequência cardíaca baixa com risco de baixo débito.',
              icon: 'HeartPulse',
            },
            {
              label: '1ª linha',
              detail: 'Anticolinérgico — aumenta FC bloqueando estímulo parassimpático.',
              icon: 'Syringe',
            },
            {
              label: '× Antiarrítmico',
              detail: 'Amiodarona e lidocaína — taquiarritmias ventriculares, não bradicardia.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Dobutamina — inotrópico para baixo débito; não 1ª linha da bradicardia.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Bradicardia sintomática → anticolinérgico',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Bradicardia assintomática/sintomática — medicamento de primeira linha?',
            'A lidocaína — antiarrítmico para TV/FV; não trata bradicardia; eliminar.',
            'B bicarbonato — acidose metabólica; outro contexto; eliminar.',
            'C amiodarona — taquiarritmia; não indicada na bradicardia; eliminar.',
            'E dobutamina — inotrópico para baixo débito; não 1ª linha da bradicardia; eliminar.',
            'D atropina — anticolinérgico de primeira escolha na bradicardia sintomática.',
            'Marcar D.',
            'Fixação: bradicardia com instabilidade → atropina antes de marcapasso.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Bradicardia — decore',
          meta: genericoSlideMeta,
          content: 'BRADICARDIA — 1ª LINHA',
          rows: BRADICARDIA_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Lidocaína estabiliza membrana em taquiarritmias ventriculares — não aumenta FC na bradicardia.',
      B: 'Bicarbonato corrige acidose metabólica — não é tratamento de primeira linha da bradicardia.',
      C: 'Amiodarona é antiarrítmico para taquicardias/FV — perfil oposto ao da bradicardia.',
      E: 'Dobutamina aumenta contratilidade em baixo débito cardíaco — não é 1ª linha da bradicardia.',
    },
  },
  'fundepes-copeve-ufal-enfermagem-urgencias-e-emergencias-1777104000896-2': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Emergência em saúde pública — articulação governo + ONGs + sociedade no SUS (redução de risco · manejo · recuperação)',
      roi_error: 'esp_articulacao_sus',
      cluster: 'Saúde pública — emergência e articulação SUS',
      danger_footer: 'Gabarito D — articulação tripartite',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'ESP — articulação SUS',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Contexto',
              detail: 'Emergências em saúde pública exigem resposta rápida e articulada da rede SUS.',
              icon: 'Target',
            },
            {
              label: 'Articulação',
              detail: 'Órgãos governamentais + não governamentais + sociedade civil.',
              icon: 'Users',
            },
            {
              label: 'Ações',
              detail: 'Redução de risco · manejo da emergência · recuperação pós-evento.',
              icon: 'Shield',
            },
            {
              label: '× Vulnerabilidade zero',
              detail: 'Desigualdade social e ambiental AUMENTA o dano — vigilância não elimina risco.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Suspender toda rotina ou restringir ESP a pandemia/desastre local.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'ESP = resposta coletiva no SUS',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Comando: afirmativa correta sobre emergências em saúde pública.',
            'A nega efeito da vulnerabilidade — falso; desigualdade aumenta danos; eliminar.',
            'B redefine ESP com agente não infeccioso sem risco nacional — definição inválida; eliminar.',
            'C suspende todos os programas de rotina — generalização indevida; eliminar.',
            'E restringe ESP a desastre local ou só pandemia — conceito estreito; eliminar.',
            'D articula governo + ONGs + sociedade no SUS para reduzir risco, manejar e recuperar.',
            'Marcar D.',
            'Fixação: ESP exige governança compartilhada — não atuação isolada.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'ESP — decore',
          meta: genericoSlideMeta,
          content: 'EMERGÊNCIA SAÚDE PÚBLICA',
          rows: ESP_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Vulnerabilidade social e ambiental aumenta o dano à saúde — a vigilância reduz mas não elimina esses riscos.',
      B: 'Emergência em saúde pública envolve risco de disseminação e capacidade de resposta — a definição da letra B é restritiva e inválida.',
      C: 'Suspender todos os programas de rotina não é conduta automática — a rede se reorganiza sem paralisar toda a atenção.',
      E: 'ESP não se limita a desastres locais ou pandemias — abrange eventos com efeito coletivo diversos.',
    },
  },
  'fundepes-copeve-ufal-enfermagem-urgencias-e-emergencias-1777104000896-3': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Desmaio com inconsciência e estabilidade hemodinâmica — escala de coma + avaliação pupilar na avaliação primária',
      roi_error: 'desmaio_glasgow_pupilas',
      cluster: 'Desmaio — avaliação neurológica inicial',
      danger_footer: 'Gabarito A — Glasgow + pupilas',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Desmaio — avaliação neurológica',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Trabalhador inconsciente no local — pulso cheio e respiração normal.',
              icon: 'Target',
            },
            {
              label: 'Estabilidade',
              detail: 'Circulação e ventilação preservadas — priorizar avaliação neurológica.',
              icon: 'Activity',
            },
            {
              label: 'Próximo passo',
              detail: 'Escala de coma de Glasgow + reatividade pupilar — quantificar rebaixamento.',
              icon: 'Brain',
            },
            {
              label: '× Remoção imediata',
              detail: 'Transporte sem avaliar neurologicamente — conduta incompleta.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Temperatura · sonda vesical · oximetria isolada — não substituem Glasgow+pupilas.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Inconsciente estável → neuro primeiro',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Desmaio — inconsciente, pulso e respiração OK. Próximo passo na avaliação primária?',
            'B enviar imediatamente — remoção sem quantificar rebaixamento; eliminar.',
            'C medir temperatura — não prioridade neurológica imediata; eliminar.',
            'D sonda vesical — invasivo, não urgente no desmaio agudo; eliminar.',
            'E oximetria — útil, mas Glasgow+pupilas respondem ao rebaixamento; eliminar.',
            'A Glasgow + avaliação pupilar — quantifica nível de consciência e sinais neurológicos.',
            'Marcar A.',
            'Fixação: inconsciente com ABC estável → D neurológico (Glasgow + pupilas).',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Desmaio — decore',
          meta: genericoSlideMeta,
          content: 'AVALIAÇÃO NEUROLÓGICA',
          rows: DESMAIO_NEURO_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Remoção imediata sem escala de coma ignora a quantificação do rebaixamento — avaliação neurológica precede o transporte.',
      C: 'Temperatura corporal não é o próximo passo prioritário diante de inconsciência com ABC preservado.',
      D: 'Sonda vesical é procedimento invasivo eletivo — não compõe a avaliação primária do desmaio.',
      E: 'Oximetria monitora saturação, mas não substitui Glasgow e pupilas para graduar o rebaixamento neurológico.',
    },
  },
  'fundepes-copeve-ufal-enfermagem-urgencias-e-emergencias-1777104007115-7': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Avaliação primária clínica — responsividade + expansão torácica (ABC inicial)',
      roi_error: 'avaliacao_primaria_responsividade_ventilacao',
      cluster: 'Emergência clínica — avaliação primária ABC',
      danger_footer: 'Gabarito A — responsividade + expansão torácica',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Avaliação primária — ABC',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Paciente chega em emergência clínica — estabilização primária imediata.',
              icon: 'Target',
            },
            {
              label: 'A — Responsividade',
              detail: 'Nível de consciência — responde a estímulos?',
              icon: 'Brain',
            },
            {
              label: 'B — Ventilação',
              detail: 'Expansão torácica e esforço respiratório — via aérea pérvia?',
              icon: 'Wind',
            },
            {
              label: '× Jugular',
              detail: 'Distensão de jugulares — avaliação cardiovascular secundária.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Queixa principal e glicemia — anamnese/exames dirigidos, não núcleo primário.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'ABC antes de detalhes',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Emergência clínica — o que incluir na avaliação primária?',
            'B distensão jugular — sinal de congestão; secundário; eliminar.',
            'C oximetria — monitorização útil, mas não define o núcleo primário cobrado; eliminar.',
            'D queixa principal — anamnese após ABC; eliminar.',
            'E glicemia capilar — exame direcionado; não universal na primária; eliminar.',
            'A responsividade + expansão torácica — consciência e ventilação (A e B do ABC).',
            'Marcar A.',
            'Fixação: primária = vida (consciência + respiração) antes de jugular/queixa/glicemia.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Primária — decore',
          meta: genericoSlideMeta,
          content: 'AVALIAÇÃO PRIMÁRIA',
          rows: AVALIACAO_PRIMARIA_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Distensão de jugulares avalia congestão venosa — pertence à avaliação cardiovascular, não ao núcleo primário inicial.',
      C: 'Oximetria complementa a avaliação respiratória, mas responsividade e expansão torácica definem o ABC primário cobrado.',
      D: 'Queixa principal é obtida na anamnese — após garantir consciência e ventilação na avaliação primária.',
      E: 'Glicemia capilar é exame direcionado (ex.: alteração neurológica) — não compõe o par universal da primária.',
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
    } else if (entry.branch === 'vf_protocolo') {
      const q = raw as VfQ;
      const slides = finalizeVf(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaVf(
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
    console.log(`[handcraft:urgencias-g35] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g35] total=${ok}`);
}

main();
