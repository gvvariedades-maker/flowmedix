#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g36 (8 slugs · 7º lote urgencias_generico).
 * Inferência: IAM → avc_iam · RCP pediátrica → rcp_pediatrico · V/F atribuições → vf_protocolo · demais generico.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides as finalizeAvc,
  iamSinaisRows,
  metaBase as metaAvc,
  slideMeta as avcSlideMeta,
  type Pack as AvcPack,
  type Q as AvcQ,
} from './lib/urgenciasAvcGolden';
import {
  finalizeSlides as finalizeGenerico,
  metaBase as metaGenerico,
  slideMeta as genericoSlideMeta,
  urgenciaPrioridadeRows,
  type Pack as GenericoPack,
  type Q as GenericoQ,
} from './lib/urgenciasGenericoGolden';
import {
  finalizeSlides as finalizeRcpPed,
  metaBase as metaRcpPed,
  pedRcpRows,
  slideMeta as rcpPedSlideMeta,
  type Pack as RcpPedPack,
  type Q as RcpPedQ,
} from './lib/urgenciasRcpPediatricGolden';
import {
  finalizeSlides as finalizeVf,
  metaBase as metaVf,
  slideMeta as vfSlideMeta,
  vfRows,
  type Pack as VfPack,
  type Q as VfQ,
} from './lib/urgenciasVfProtocoloGolden';

const LOTE = 'urgencias-g36';
const REVIEWER = 'handcraft-urgencias-g36';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const AVC_FOOTER = 'Dor torácica isquêmica — acionar equipe e monitorar';
const RCP_PED_FOOTER = 'RCP pediátrica — pausas mínimas nas compressões';
const VF_FOOTER = 'V/F — julgue cada assertiva antes das letras';

/** Prescrição EV — seguir via e ordem médica. */
const PRESCRICAO_EV_QUALITATIVA = [
  { label: 'Prescrição', value: 'Solução fisiológica EV rápido + antiemético EV agora — ambos endovenosos', badge: 'hot' },
  { label: 'Sequência', value: 'Punção venosa → soroterapia + medicamento conforme receita', badge: 'ok' },
  { label: '× Aguardar soro', value: 'Não postergar medicamento EV prescrito “agora”', badge: 'warn' },
  { label: '× Via IM', value: 'Prescrição define EV — não trocar via sem ordem médica', badge: 'warn' },
  { label: 'Técnico', value: 'Executar prescrição validada — não alterar via ou ordem', badge: 'info' },
];

/** Epistaxe — posicionamento e compressão. */
const EPISTAXE_QUALITATIVA = [
  { label: 'Posição', value: 'Inclinar tronco levemente à frente — evita deglutição de sangue', badge: 'hot' },
  { label: 'Compressão', value: 'Comprimir narina afetada por alguns minutos', badge: 'ok' },
  { label: '× Cabeça para trás', value: 'Sangue escorre para faringe — conduta clássica errada', badge: 'warn' },
  { label: '× Vasoconstritor', value: 'Medicamento sem prescrição médica imediata', badge: 'info' },
  { label: '× Tamponamento', value: 'Invasivo — reservado a falha da compressão/médico', badge: 'warn' },
];

/** Sinais semiológicos — abdome agudo. */
const ABDOME_AGUDO_SINAIS = [
  { label: 'Jobert', value: 'Perda de macicez hepática — ar livre (pneumoperitônio)', badge: 'hot' },
  { label: 'Gersuny', value: 'Massa moldável que recupera forma — fecaloma', badge: 'ok' },
  { label: 'Murphy', value: 'Dor no hipocôndrio direito à inspiração — vesícula biliar', badge: 'hot' },
  { label: '× Blumberg', value: 'Descompressão dolorosa — irritação peritoneal geral', badge: 'info' },
  { label: 'Pegadinha', value: 'Trocar Jobert (ar) por Murphy (vesícula)', badge: 'warn' },
];

/** Definições pleurais — hemotórax × pneumotórax. */
const PLEURA_DEFINICOES = [
  { label: 'Hemotórax', value: 'Sangue no espaço pleural', badge: 'hot' },
  { label: 'Pneumotórax', value: 'Ar no espaço pleural — não é hemotórax', badge: 'ok' },
  { label: '× Parede', value: 'Sangue na parede torácica — hematoma externo', badge: 'warn' },
  { label: '× Parênquima', value: 'Sangue no tecido pulmonar — hemorragia parenquimatosa', badge: 'warn' },
  { label: '× Hipertensivo', value: 'Entrada contínua de ar sem saída — outro mecanismo', badge: 'info' },
];

type GenericoEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };
type AvcEntry = { branch: 'avc_iam'; pack: AvcPack; danger: Record<string, string> };
type RcpPedEntry = { branch: 'rcp_pediatrico'; pack: RcpPedPack; danger: Record<string, string> };
type VfEntry = { branch: 'vf_protocolo'; pack: VfPack; danger: Record<string, string> };

type HandcraftEntry = GenericoEntry | AvcEntry | RcpPedEntry | VfEntry;

const SPECS: Record<string, HandcraftEntry> = {
  'funtef-enfermagem-urgencias-e-emergencias-1777103970505-3': {
    branch: 'avc_iam',
    pack: {
      family: 'protocolo',
      guideline:
        'Síndrome coronariana aguda — dor torácica intensa + sudorese + náuseas + palidez; técnico avisa médico e realiza ECG conforme prescrição',
      roi_error: 'iam_dor_toracica_papel_tecnico',
      cluster: 'IAM — reconhecimento clínico + função do técnico',
      danger_footer: 'Gabarito A — IAM + avisar médico + ECG',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Dor torácica — suspeita isquêmica',
          meta: avcSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail:
                'Homem de 38 anos — dor intensa no peito, náuseas, sudorese, palidez; PA elevada.',
              icon: 'Target',
            },
            {
              label: 'Sinais',
              detail: 'Dor precordial + autonômicos (náusea, sudorese) — padrão isquêmico agudo.',
              icon: 'Heart',
            },
            {
              label: 'Diagnóstico',
              detail: 'Infarto agudo do miocárdio — síndrome coronariana com necrose miocárdica.',
              icon: 'Activity',
            },
            {
              label: 'Papel do técnico',
              detail: 'Comunicar médico imediatamente + realizar eletrocardiograma conforme prescrição.',
              icon: 'Stethoscope',
            },
            {
              label: '× EAP',
              detail: 'Edema agudo de pulmão — dispneia paroxística e estertores; quadro não ancora pulmão.',
              icon: 'Ban',
            },
            {
              label: '× AVC',
              detail: 'Acidente vascular cerebral — déficit neurológico focal; sem sinais de Cincinnati.',
              icon: 'XCircle',
            },
          ],
          footer_rule: AVC_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: avcSlideMeta,
          steps: [
            'Dor torácica intensa com sudorese e náuseas — diagnóstico provável e função do técnico?',
            'B edema agudo de pulmão — foco respiratório/estertores ausentes; eliminar.',
            'C AVC — sem assimetria facial, fala alterada ou déficit motor; eliminar.',
            'D intoxicação alimentar — quadro gastrointestinal isolado; eliminar.',
            'A infarto agudo do miocárdio — avisar médico e realizar ECG conforme prescrição.',
            'Marcar A.',
            'Fixação: dor torácica isquêmica + autonômicos = acionar equipe + ECG precoce.',
          ],
          footer_rule: AVC_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'IAM — sinais clássicos',
          meta: avcSlideMeta,
          content: 'SÍNDROME CORONARIANA AGUDA',
          rows: iamSinaisRows(),
          footer_rule: AVC_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Edema agudo de pulmão cursa com dispneia intensa e estertores — o caso ancora dor precordial isquêmica, não congestão pulmonar.',
      C: 'AVC exige déficit neurológico focal (face, fala, força) — ausente no quadro de dor torácica com sudorese.',
      D: 'Intoxicação alimentar manifesta vômitos/diarreia predominantes — não explica dor torácica intensa com palidez.',
    },
  },
  'funtef-enfermagem-vias-de-administracao-1778968598934-3': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Prescrição médica — solução fisiológica EV rápido + plasil EV agora: punção venosa e administrar ambos por via endovenosa',
      roi_error: 'prescricao_ev_sf_plasil',
      cluster: 'Administração medicamentosa — executar prescrição EV',
      danger_footer: 'Gabarito D — punção + SF EV + plasil EV',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Prescrição — hidratação e antiemético',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail:
                'Paciente com diarreia intensa — receita: solução fisiológica EV rápido + plasil EV agora.',
              icon: 'Target',
            },
            {
              label: 'Via prescrita',
              detail: 'Ambos endovenosos — punção venosa necessária antes da infusão.',
              icon: 'Syringe',
            },
            {
              label: 'Ordem',
              detail: 'Iniciar soroterapia e aplicar antiemético EV conforme receita — sem postergar o “agora”.',
              icon: 'ListOrdered',
            },
            {
              label: '× Aguardar soro',
              detail: 'Medicamento prescrito para aplicação imediata — não esperar término do volume.',
              icon: 'Ban',
            },
            {
              label: '× Via IM',
              detail: 'Prescrição define EV — técnico não altera via de administração.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Executar prescrição — via e ordem médicas',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Receita: SF EV rápido + plasil EV agora — conduta correta do técnico?',
            'A aguardar término do soro para plasil — posterga medicamento prescrito “agora”; eliminar.',
            'B plasil IM antes da punção — prescrição define EV; eliminar.',
            'C plasil diluído IM — via diferente da prescrita; eliminar.',
            'D punção venosa + SF EV + plasil EV conforme prescrição.',
            'Marcar D.',
            'Fixação: respeitar via EV e não atrasar medicamento de aplicação imediata.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Prescrição EV — decore',
          meta: genericoSlideMeta,
          content: 'ADMINISTRAÇÃO CONFORME RECEITA',
          rows: PRESCRICAO_EV_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — prescrição ev sf plasil',
          items: [
            {
              label: 'Letra A — aguardar término do soro',
              detail: 'Administrar SF e só depois plasil — posterga o antiemético prescrito para aplicação imediata.',
              correct: 'Medicamento “agora” não deve aguardar o fim do volume de hidratação.',
            },
            {
              label: 'Letra B — plasil IM antes da punção',
              detail: 'Aplicar plasil por via intramuscular antes de puncionar — prescrição define via endovenosa.',
              correct: 'Executar punção venosa e administrar ambos medicamentos por EV conforme receita.',
            },
            {
              label: 'Letra C — plasil diluído IM',
              detail: 'Diluir e aplicar plasil por via intramuscular — altera a via prescrita pelo médico.',
              correct: 'Plasil endovenoso conforme prescrição — não substituir por IM.',
            },
          ],
          footer_rule: 'Gabarito D — punção + SF EV + plasil EV',
        },
      ],
    },
    danger: {},
  },
  'furb-enfermagem-processo-de-enfermagem-1780011908736-3': {
    branch: 'rcp_pediatrico',
    pack: {
      family: 'protocolo',
      guideline: 'AHA SBV pediátrico — minimizar interrupções na RCP; pausas nas compressões inferiores a 10 segundos',
      roi_error: 'rcp_ped_pausa_compressao_10s',
      cluster: 'RCP pediátrica — interrupção mínima nas compressões',
      danger_footer: 'Gabarito B — pausas < 10 s',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'RCP pediátrica — qualidade',
          meta: rcpPedSlideMeta,
          items: [
            {
              label: 'Excerto',
              detail:
                'Lacuna no excerto de SBV pediátrico — preencher corretamente a alternativa sobre pausas na RCP.',
              icon: 'FileText',
            },
            {
              label: 'Contexto',
              detail:
                'Bebês e crianças em parada cardiorrespiratória — ressuscitação cardiopulmonar com compressões torácicas.',
              icon: 'Target',
            },
            {
              label: 'Prioridade',
              detail: 'Minimizar interrupções — perfusão coronária e cerebral depende de compressões contínuas.',
              icon: 'HeartPulse',
            },
            {
              label: 'Pausas',
              detail: 'Interrupções nas compressões devem ser inferiores a dez segundos.',
              icon: 'Timer',
            },
            {
              label: '× Pausa longa',
              detail: 'Quinze ou vinte segundos sem compressão reduzem drasticamente a sobrevida.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Cinco segundos como meta fixa ou pausas de vinte e cinco segundos — valores fora da diretriz.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: RCP_PED_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: rcpPedSlideMeta,
          steps: [
            'Excerto SBV pediátrico — parada cardiorrespiratória: minimizar interrupções na ressuscitação cardiopulmonar.',
            'Lacuna: pausas nas compressões torácicas devem ser inferiores a ___ segundos — preencher corretamente.',
            'A 25 s — pausa excessiva; eliminar.',
            'C 5 s — valor abaixo do limite cobrado pela lacuna; eliminar.',
            'D 20 s — interrupção prolongada; eliminar.',
            'E 15 s — ainda acima do teto de dez segundos; eliminar.',
            'B 10 s — limite superior aceito para interrupção nas compressões pediátricas.',
            'Marcar B.',
            'Fixação: RCP pediátrica = compressões contínuas com pausas breves (< 10 s).',
          ],
          footer_rule: RCP_PED_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'RCP pediátrica — decore',
          meta: rcpPedSlideMeta,
          content: 'QUALIDADE DAS COMPRESSÕES',
          rows: pedRcpRows([
            { label: 'Interrupção', value: 'Pausas nas compressões < 10 segundos', badge: 'hot' },
            { label: 'Objetivo', value: 'Manter perfusão — minimizar tempo sem compressão', badge: 'warn' },
          ]),
          footer_rule: RCP_PED_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Pausa de vinte e cinco segundos interrompe a perfusão por tempo inaceitável na RCP pediátrica.',
      C: 'Cinco segundos não é o valor preenchido na lacuna — a diretriz usa limite inferior a dez segundos.',
      D: 'Vinte segundos de interrupção excede o teto permitido nas compressões torácicas.',
      E: 'Quinze segundos ainda ultrapassa o máximo de dez segundos para pausas nas compressões.',
    },
  },
  'furb-enfermagem-processo-de-enfermagem-1780011915153-3': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Epistaxe em espera — inclinar tronco à frente e comprimir a cavidade nasal afetada',
      roi_error: 'epistaxe_posicionamento_compressao',
      cluster: 'Epistaxe — primeiros cuidados enquanto aguarda médico',
      danger_footer: 'Gabarito B — inclinar à frente + comprimir',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Epistaxe — cuidado inicial',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Adulto com sangramento nasal aguardando atendimento médico.',
              icon: 'Target',
            },
            {
              label: 'Posição',
              detail: 'Inclinar levemente o tronco para frente — sangue escorre para fora, não para garganta.',
              icon: 'User',
            },
            {
              label: 'Compressão',
              detail: 'Comprimir a narina afetada por alguns minutos — tamponamento digital inicial.',
              icon: 'Hand',
            },
            {
              label: '× Cabeça para trás',
              detail: 'Inclinar para trás faz deglutir sangue — risco de náusea e aspiração.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Vasoconstritor sem prescrição · tamponamento invasivo · calor local.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Epistaxe — posição + compressão digital',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Epistaxe aguardando médico — conduta correta enquanto espera?',
            'A vasoconstritor — medicamento sem prescrição imediata; eliminar.',
            'C compressas mornas — calor não é primeira linha na epistaxe ativa; eliminar.',
            'D tamponamento com material absorvente — invasivo sem indicação inicial; eliminar.',
            'E inclinar para trás + frio — posição errada (deve ser à frente); eliminar.',
            'B inclinar à frente + comprimir cavidade afetada.',
            'Marcar B.',
            'Fixação: frente + compressão digital — nunca cabeça para trás.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Epistaxe — decore',
          meta: genericoSlideMeta,
          content: 'SANGRAMENTO NASAL',
          rows: EPISTAXE_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Solução vasoconstritora exige prescrição e avaliação médica — não é conduta inicial do técnico na espera.',
      C: 'Compressas mornas não controlam o sangramento ativo — primeira linha é posicionamento e compressão.',
      D: 'Tamponamento com material absorvente é procedimento invasivo reservado a falha da compressão ou médico.',
      E: 'Inclinar para trás com compressas frias favorece deglutição de sangue — posição clássica errada na epistaxe.',
    },
  },
  'iaupe-enfermagem-processo-de-enfermagem-1776056149404-2': {
    branch: 'vf_protocolo',
    pack: {
      family: 'vf',
      guideline:
        'Atribuições COFEN — técnico não diagnostica nem prescreve (F,F); monitora SSVV e cuida sob supervisão (V); não elabora alta (F)',
      roi_error: 'vf_atribuicoes_tecnico_urgencia',
      cluster: 'V/F — atribuições do técnico em urgência/emergência',
      danger_footer: 'Gabarito C — F, F, V, F',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Técnico — atribuições V/F',
          meta: vfSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Atuação do técnico em urgência/emergência — julgar quatro assertivas antes das letras.',
              icon: 'Target',
            },
            {
              label: 'Item I',
              detail: 'Diagnosticar e prescrever em urgência — FALSA (atribuição médica/enfermeiro).',
              icon: 'XCircle',
            },
            {
              label: 'Item II',
              detail: 'Diagnosticar e prescrever em emergência — FALSA (mesmo limite de escopo).',
              icon: 'XCircle',
            },
            {
              label: 'Item III',
              detail: 'Controlar sinais vitais e cuidar de grave sob supervisão — VERDADEIRA.',
              icon: 'Activity',
            },
            {
              label: 'Pegadinha',
              detail:
                'Banca induz a marcar prescrição/diagnóstico como atribuição do técnico — escopo COFEN limita a execução e monitorização.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Item IV',
              detail: 'Elaborar plano de alta hospitalar — FALSA (não é atribuição do técnico).',
              icon: 'Ban',
            },
          ],
          footer_rule: VF_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: vfSlideMeta,
          steps: [
            'Atribuições do técnico em urgência/emergência — julgar assertivas 1 a 4:',
            'I — diagnosticar/prescrever em urgência? → falsa (F).',
            'II — diagnosticar/prescrever em emergência? → falsa (F).',
            'III — sinais vitais + cuidados a grave sob supervisão? → verdadeira (V).',
            'IV — elaborar plano de alta? → falsa (F).',
            'Sequência F, F, V, F — eliminar A, B, D e E.',
            'Marcar C.',
            'Fixação: técnico executa e monitora — não diagnostica, prescreve nem define alta.',
          ],
          footer_rule: VF_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Atribuições — decore',
          meta: vfSlideMeta,
          content: 'TÉCNICO EM URGÊNCIA',
          rows: vfRows([
            { roman: 'I', verdict: 'F', note: 'Não diagnosticar nem prescrever em urgência' },
            { roman: 'II', verdict: 'F', note: 'Não diagnosticar nem prescrever em emergência' },
            { roman: 'III', verdict: 'V', note: 'SSVV + cuidados a grave sob supervisão do enfermeiro' },
            { roman: 'IV', verdict: 'F', note: 'Plano de alta — não é atribuição do técnico' },
          ]),
          footer_rule: 'F, F, V, F — letra C',
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Pegadinha COFEN — diagnosticar e prescrever não são do técnico; V-F-V-F erra ao validar prescrição no item I.',
      B: 'Pegadinha COFEN — prescrever em emergência parece plausível, mas é atribuição médica; item II é falso.',
      D: 'V-V-F-V trata diagnóstico/prescrição como verdadeiros — itens I e II são falsos.',
      E: 'F-V-V-V inclui plano de alta como verdadeiro — item IV é falso.',
    },
  },
  'ibade-enfermagem-processo-de-enfermagem-1780005137458-2': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Priorização clínica — pacientes com dor torácica + hipotensão e dispneia grave + hipoxemia têm instabilidade e risco imediato à vida',
      roi_error: 'priorizacao_instabilidade_multipla',
      cluster: 'Classificação — priorizar instabilidade hemodinâmica e respiratória',
      danger_footer: 'Gabarito C — priorizar A e C',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Sala de classificação — 4 pacientes',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Contexto',
              detail:
                'Quatro adultos chegam em curto intervalo — técnico na classificação deve priorizar gravidade.',
              icon: 'Target',
            },
            {
              label: 'Paciente A',
              detail: 'Dor torácica súbita + taquicardia + hipotensão — suspeita isquêmica com instabilidade.',
              icon: 'Heart',
            },
            {
              label: 'Paciente C',
              detail: 'Dispneia intensa (asma) + saturação baixa + confusão — insuficiência respiratória.',
              icon: 'Wind',
            },
            {
              label: '× Sangramento leve',
              detail: 'Ferimento em perna estável — lesão visível não vence instabilidade hemodinâmica.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Ordem de chegada · vômitos sem sinais de gravidade · “alerta” com PA baixa.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Gravidade clínica > ordem de chegada',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Quatro pacientes — quem priorizar na classificação?',
            'A priorizar B — sangramento leve em perna; estável; eliminar.',
            'B priorizar D — vômitos prolongados sem instabilidade aguda; eliminar.',
            'D aguardar paciente A — PA baixa + dor torácica = risco imediato; eliminar.',
            'E ordem de chegada — ignora critérios de gravidade; eliminar.',
            'C pacientes A e C — instabilidade hemodinâmica e respiratória; monitorizar e comunicar equipe.',
            'Marcar C.',
            'Fixação: dor torácica com hipotensão + dispneia com hipoxemia = prioridade máxima.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Priorização — decore',
          meta: genericoSlideMeta,
          content: 'CLASSIFICAÇÃO CLÍNICA',
          rows: urgenciaPrioridadeRows([
            { label: 'A — torácica', value: 'Dor súbita + hipotensão → risco imediato', badge: 'hot' },
            { label: 'C — respiratório', value: 'Dispneia + SpO2 baixa + confusão → prioridade', badge: 'hot' },
            { label: '× Lesão visível', value: 'Sangramento leve estável — não antecede instabilidade', badge: 'warn' },
          ]),
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — priorizacao instabilidade multipla',
          items: [
            {
              label: 'Letra A — priorizar sangramento leve',
              detail: 'Lesão visível em perna com sangramento leve — paciente estável hemodinamicamente.',
              correct: 'Instabilidade hemodinâmica e respiratória (A e C) vencem lesão periférica leve.',
            },
            {
              label: 'Letra B — vômitos prolongados',
              detail: 'Náuseas e vômitos por horas sem sinais de gravidade aguda.',
              correct: 'Vômitos sem instabilidade não superam dor torácica com hipotensão ou dispneia grave.',
            },
            {
              label: 'Letra D — aguardar paciente A',
              detail: 'Consciência preservada e saturação aceitável não excluem hipotensão com dor torácica.',
              correct: 'Hipotensão com dor torácica súbita exige priorização imediata — não aguardar.',
            },
            {
              label: 'Letra E — ordem de chegada',
              detail: 'Atender na sequência de entrada ignorando critérios de gravidade clínica.',
              correct: 'Classificação prioriza risco à vida — não fila cronológica.',
            },
          ],
          footer_rule: 'Gabarito C — priorizar A e C',
        },
      ],
    },
    danger: {},
  },
  'ibam-enfermagem-semiologia-em-enfermagem-1779563495719-1': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Abdome agudo — Jobert: ar livre (perda macicez hepática) · Gersuny: fecaloma · Murphy: colecistite (dor HD à inspiração)',
      roi_error: 'abdome_agudo_sinais_associacao',
      cluster: 'Abdome agudo — sinais semiológicos (Jobert · Gersuny · Murphy)',
      danger_footer: 'Gabarito A — 3, 1, 2',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Abdome agudo — sinais',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Contexto',
              detail: 'Dor abdominal súbita e intensa — associar epônimos às descrições semiológicas.',
              icon: 'Target',
            },
            {
              label: 'Jobert',
              detail: 'Perda de macicez à percussão hepática — pneumoperitônio (ar livre).',
              icon: 'Scan',
            },
            {
              label: 'Gersuny',
              detail: 'Massa moldável que recupera forma lentamente — fecaloma.',
              icon: 'Circle',
            },
            {
              label: 'Murphy',
              detail: 'Dor no hipocôndrio direito à inspiração profunda — inflamação da vesícula.',
              icon: 'Hand',
            },
            {
              label: 'Pegadinha',
              detail: 'Trocar Jobert (ar) por Murphy (vesícula) ou Gersuny (fecaloma).',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Epônimo + manobra + significado clínico',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Relacionar sinais do abdome agudo — Jobert, Gersuny e Murphy às descrições.',
            'Descrição 1 (ar livre/perda macicez hepática) → Jobert = item 3.',
            'Descrição 2 (massa moldável/fecaloma) → Gersuny = item 1.',
            'Descrição 3 (dor HD à inspiração) → Murphy = item 2.',
            'Sequência 3, 1, 2 — eliminar B, C e D.',
            'Marcar A.',
            'Fixação: Jobert = ar · Gersuny = fecaloma · Murphy = vesícula biliar.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Sinais — decore',
          meta: genericoSlideMeta,
          content: 'ABDOME AGUDO — EPÔNIMOS',
          rows: ABDOME_AGUDO_SINAIS,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Sequência 3, 2, 1 associa Murphy ao fecaloma — Gersuny é o sinal da massa moldável.',
      C: 'Sequência 1, 2, 3 inverte Jobert e Murphy — Jobert é pneumoperitônio, não colecistite.',
      D: 'Sequência 2, 3, 1 coloca Murphy no ar livre — Murphy é dor à inspiração no hipocôndrio direito.',
    },
  },
  'ibfc-enfermagem-nocoes-de-anatomia-1775448458316-0': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Hemotórax — presença de sangue no espaço pleural (não ar, não parede, não parênquima)',
      roi_error: 'hemotorax_definicao_pleural',
      cluster: 'Trauma torácico — definição de hemotórax',
      danger_footer: 'Gabarito C — sangue no espaço pleural',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Hemotórax — definição',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Definição de hemotórax — acúmulo patológico na cavidade pleural.',
              icon: 'Target',
            },
            {
              label: 'Hemotórax',
              detail: 'Sangue no espaço pleural — entre pleura visceral e parietal.',
              icon: 'Droplets',
            },
            {
              label: '× Pneumotórax',
              detail: 'Ar no espaço pleural — mecanismo e tratamento distintos.',
              icon: 'Wind',
            },
            {
              label: '× Parede torácica',
              detail: 'Hematoma externo — sangue não está na cavidade pleural.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Confundir com sangue no parênquima pulmonar ou pneumotórax hipertensivo.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Pleura = espaço entre pulmão e parede',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Hemotórax é definido por:',
            'A ar no espaço pleural — define pneumotórax; eliminar.',
            'B entrada contínua de ar sem saída — pneumotórax hipertensivo; eliminar.',
            'D sangue na parede torácica — hematoma de parede, não pleural; eliminar.',
            'E sangue no tecido pulmonar — hemorragia parenquimatosa; eliminar.',
            'C sangue no espaço pleural — definição clássica de hemotórax.',
            'Marcar C.',
            'Fixação: hemotórax = sangue na pleura · pneumotórax = ar na pleura.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Pleura — decore',
          meta: genericoSlideMeta,
          content: 'COLEÇÕES PLEURAIS',
          rows: PLEURA_DEFINICOES,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Presença de ar no espaço pleural define pneumotórax — o prefixo “hemo-” indica sangue, não ar.',
      B: 'Entrada contínua de ar sem saída descreve pneumotórax hipertensivo — mecanismo valvular, não hemorragia pleural.',
      D: 'Sangue na parede torácica é hematoma de partes moles — não preenche o espaço pleural.',
      E: 'Sangue no tecido pulmonar é hemorragia parenquimatosa — hemotórax é coleção no espaço pleural.',
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
    } else if (entry.branch === 'avc_iam') {
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
    } else if (entry.branch === 'rcp_pediatrico') {
      const q = raw as RcpPedQ;
      const slides = finalizeRcpPed(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaRcpPed(
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
    }

    ok++;
    console.log(`[handcraft:urgencias-g36] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g36] total=${ok}`);
}

main();
