#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g32 (8 slugs · 3º lote urgencias_generico).
 * Inferência por enunciado: Cincinnati → avc · VF/PCR → rcp_sbv · BT1 segurança → trauma · demais generico.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  cincinnatiRows,
  finalizeSlides as finalizeAvc,
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
import {
  finalizeSlides as finalizeRcp,
  metaBase as metaRcp,
  rcpParamRows,
  slideMeta as rcpSlideMeta,
  type Pack as RcpPack,
  type Q as RcpQ,
} from './lib/urgenciasRcpGolden';
import {
  finalizeSlides as finalizeTrauma,
  metaBase as metaTrauma,
  slideMeta as traumaSlideMeta,
  type Pack as TraumaPack,
  type Q as TraumaQ,
} from './lib/urgenciasTraumaGolden';

const LOTE = 'urgencias-g32';
const REVIEWER = 'handcraft-urgencias-g32';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const RCP_FOOTER = 'RCP — ritmo e técnica da prova';
const TRAUMA_FOOTER = 'Segurança da cena antes do ABCDE';
const AVC_FOOTER = 'Face → braço → fala → acionar emergência';

type GenericoEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };
type AvcEntry = { branch: 'avc'; pack: AvcPack; danger: Record<string, string> };
type RcpEntry = { branch: 'rcp_sbv'; pack: RcpPack; danger: Record<string, string> };
type TraumaEntry = { branch: 'trauma'; pack: TraumaPack; danger: Record<string, string> };

type HandcraftEntry = GenericoEntry | AvcEntry | RcpEntry | TraumaEntry;

const SPECS: Record<string, HandcraftEntry> = {
  'amauc-enfermagem-semiologia-em-enfermagem-1779563500147-9': {
    branch: 'avc',
    pack: {
      family: 'protocolo',
      guideline: 'Escala de Cincinnati (CPSS) — triagem pré-hospitalar AVC · FAST MS/SAMU',
      roi_error: 'cincinnati_face_braco_fala',
      cluster: 'AVC — Escala de Cincinnati',
      danger_footer: 'Gabarito A — face · braço · fala',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Cincinnati — triagem AVC',
          meta: avcSlideMeta,
          items: [
            {
              label: 'Enquadramento',
              detail: 'Triagem pré-hospitalar de AVC — identificar os três itens da Escala de Cincinnati.',
              icon: 'Target',
            },
            {
              label: 'Face',
              detail: 'Sorriso: buscar assimetria facial (queda de um lado).',
              icon: 'Smile',
            },
            {
              label: 'Braços',
              detail: 'Elevar MMSS: observar queda ou fraqueza de um membro superior.',
              icon: 'Hand',
            },
            {
              label: 'Fala',
              detail: 'Repetir frase simples: disartria, afasia ou fala arrastada.',
              icon: 'MessageCircle',
            },
            {
              label: 'Pegadinha',
              detail: 'Glasgow, SSVV e tríade meníngea não entram — Cincinnati é face · braço · fala.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: AVC_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: avcSlideMeta,
          steps: [
            'Comando: três itens da Escala de Cincinnati para suspeita de AVC pré-hospitalar.',
            'Mnemônico: Face (sorriso) · Arms (braços) · Speech (fala) — qualquer alteração = suspeita.',
            'B tríade meníngea — cefaleia, vômito e rigidez de nuca não compõem Cincinnati; eliminar.',
            'C quadro coronariano — dor torácica com dispneia e sudorese aponta IAM; eliminar.',
            'D Glasgow — consciência, motor e verbal são outra escala neurológica; eliminar.',
            'E SSVV — PA, FC e FR não são os três eixos de triagem de AVC; eliminar.',
            'A face, braço e fala anormal — única alternativa com os três itens.',
            'Marcar A.',
            'Fixação: SAMU cobra Cincinnati literal — não troque por GCS nem SSVV.',
          ],
          footer_rule: AVC_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Cincinnati — decore',
          meta: avcSlideMeta,
          content: 'CINCINNATI = F · B · FALA',
          rows: cincinnatiRows(),
          footer_rule: 'Um item alterado já aciona suspeita',
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Cefaleia súbita, vômitos em jato e rigidez de nuca sugerem meningite/hemorragia subaracnóidea — não os itens de Cincinnati.',
      C: 'Dor torácica com dispneia e sudorese compõe quadro coronariano — não a escala de triagem de AVC.',
      D: 'Nível de consciência, resposta motora e verbal descrevem a Escala de Coma de Glasgow — ferramenta distinta.',
      E: 'Pressão arterial, frequência cardíaca e respiratória são sinais vitais — Cincinnati não lista parâmetros hemodinâmicos.',
    },
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780005556782-6': {
    branch: 'rcp_sbv',
    pack: {
      family: 'vf',
      guideline: 'Primeiros socorros V/F — RCP 5–6 cm (V) · pasta dente lesão química (F) · Heimlich (V) · café hemorragia (F)',
      roi_error: 'vf_primeiros_socorros_rcp_multiitem',
      cluster: 'V/F — primeiros socorros (RCP · agente químico · OVACE · hemorragia)',
      danger_footer: 'Gabarito D — V, F, V, F',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Primeiros socorros — V/F',
          meta: rcpSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Julgar quatro afirmativas sobre primeiros socorros e montar a sequência V/F correta.',
              icon: 'Target',
            },
            {
              label: 'Afirmativa I',
              detail: 'RCP adulto — profundidade das compressões de 5 a 6 cm — verdadeira (AHA).',
              icon: 'Activity',
            },
            {
              label: 'Afirmativa II',
              detail: 'Pasta de dente em lesão química cutânea — falsa; lavar com água corrente abundante.',
              icon: 'Flame',
            },
            {
              label: 'Afirmativa III',
              detail: 'Heimlich em adulto consciente com corpo estranho — verdadeira.',
              icon: 'Wind',
            },
            {
              label: 'Afirmativa IV',
              detail: 'Pó de café para hemorragia externa — falsa; compressão direta e curativo.',
              icon: 'Ban',
            },
          ],
          footer_rule: RCP_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: rcpSlideMeta,
          steps: [
            'Formato V/F — julgar afirmativas I a IV antes de cruzar com as letras A–D.',
            'I — profundidade RCP adulto 5–6 cm: verdadeira (diretriz AHA).',
            'II — pasta de dente em lesão química: falsa — irrigar com água, não aplicar pasta.',
            'III — Heimlich em adulto consciente com OVACE: verdadeira.',
            'IV — pó de café para estancar sangue: falsa — compressão direta e curativo estéril.',
            'Sequência V, F, V, F — eliminar A, B e C.',
            'Marcar D.',
            'Fixação: primeiros socorros cobram conduta correta item a item — não chutar a sequência.',
          ],
          footer_rule: RCP_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Primeiros socorros — decore',
          meta: rcpSlideMeta,
          content: 'V/F — PRIMEIROS SOCORROS',
          rows: [
            { label: 'I (RCP)', value: 'V — compressões 5–6 cm no adulto', badge: 'hot' },
            { label: 'II (químico)', value: 'F — água corrente, não pasta de dente', badge: 'warn' },
            { label: 'III (OVACE)', value: 'V — Heimlich se consciente e tosse ineficaz', badge: 'ok' },
            { label: 'IV (hemorragia)', value: 'F — compressão direta, não pó caseiro', badge: 'warn' },
          ],
          footer_rule: 'V, F, V, F — letra D',
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'F, F, V, V inverte a afirmativa I (RCP 5–6 cm é verdadeira) e valida a IV falsa (pó de café).',
      B: 'V, V, F, F erra a II (pasta de dente é falsa) e a III (Heimlich é verdadeira).',
      C: 'F, V, F, V trata pasta de dente como verdadeira e rejeita Heimlich — inverte o gabarito.',
    },
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-3': {
    branch: 'rcp_sbv',
    pack: {
      family: 'protocolo',
      guideline: 'SBV extra-hospitalar — PCR confirmada: iniciar compressões torácicas imediatamente (C-A-B)',
      roi_error: 'pcr_extra_hospitalar_compressoes_primeiro',
      cluster: 'PCR extra-hospitalar — prioridade compressões',
      danger_footer: 'Gabarito C — iniciar compressões rítmicas',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'PCR extra-hospitalar — SBV',
          meta: rcpSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Vítima jovem em parada cardiorrespiratória no ambiente extra-hospitalar.',
              icon: 'Target',
            },
            {
              label: 'Prioridade',
              detail: 'Compressões torácicas rítmicas de alta qualidade — perfusão cerebral e coronariana.',
              icon: 'HeartPulse',
            },
            {
              label: '× Aguardar SAMU',
              detail: 'Não postergar RCP até suporte avançado — tempo é cérebro e miocárdio.',
              icon: 'Clock',
            },
            {
              label: '× Ventilar antes',
              detail: 'Adulto: compressões primeiro (C-A-B) — ventilação após ciclo inicial.',
              icon: 'Wind',
            },
            {
              label: 'Pegadinha — pulso braquial',
              detail: 'Checagem prolongada de pulso atrasa início das compressões.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: RCP_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: rcpSlideMeta,
          steps: [
            'PCR extra-hospitalar em vítima jovem — conduta prioritária do socorrista?',
            'A verificar pulso braquial dez segundos — atrasa compressões; eliminar.',
            'B aguardar suporte avançado sem intervenção — morte cerebral progressiva; eliminar.',
            'D ventilar antes de comprimir — adulto segue C-A-B; eliminar.',
            'C iniciar compressões rítmicas — prioridade imediata na PCR confirmada.',
            'Marcar C.',
            'Fixação: comprimir cedo e bem — DEA e SAMU vêm em paralelo, não substituem compressões.',
          ],
          footer_rule: RCP_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: rcpSlideMeta,
          content: 'PCR EXTRA-HOSPITALAR',
          rows: rcpParamRows([
            { label: '1ª ação', value: 'Compressões torácicas imediatas', badge: 'hot' },
            { label: 'Não fazer', value: 'Aguardar SAMU sem RCP', badge: 'warn' },
          ]),
          footer_rule: RCP_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Verificar pulso braquial por dez segundos prolonga a pausa sem perfusão — compressões devem começar imediatamente.',
      B: 'Aguardar suporte avançado sem intervenção condena a vítima — RCP básica não pode ser postergada.',
      D: 'Ventilar antes de comprimir inverte a sequência C-A-B do adulto em PCR — compressões vêm primeiro.',
    },
  },
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780009366805-4': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Escala de Coma de Glasgow — três domínios: abertura ocular, resposta verbal e resposta motora',
      roi_error: 'glasgow_tres_dominios',
      cluster: 'Glasgow — domínios da escala',
      danger_footer: 'Gabarito D — ocular · verbal · motor',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Glasgow — domínios',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'ECG avalia consciência em três áreas padronizadas — quais são?',
              icon: 'Target',
            },
            {
              label: 'Abertura ocular',
              detail: 'Resposta ao estímulo — espontânea, à voz ou à dor.',
              icon: 'Eye',
            },
            {
              label: 'Resposta verbal',
              detail: 'Orientada, confusa, palavras inapropriadas, sons ou ausente.',
              icon: 'MessageCircle',
            },
            {
              label: 'Resposta motora',
              detail: 'Obedece comandos, localiza dor, flexão ou extensão.',
              icon: 'Hand',
            },
            {
              label: 'Pegadinha',
              detail: 'Pupilas, olfato e tronco não compõem os três domínios clássicos da Glasgow.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Glasgow = ocular + verbal + motor',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Comando: três áreas medidas pela Escala de Coma de Glasgow?',
            'A resposta visual, verbal e olfativa — olfato não entra na Glasgow; eliminar.',
            'B verbal, sensitiva e comportamental — não é a tríade padronizada; eliminar.',
            'C pupilar, reflexo mecânico e sensitiva — mistura exame neurológico amplo; eliminar.',
            'E tronco, movimento ocular e olfativa — não são os domínios clássicos; eliminar.',
            'D abertura ocular, resposta verbal e resposta motora — tríade canônica.',
            'Marcar D.',
            'Fixação: Glasgow = E + V + M (Eyes, Verbal, Motor).',
          ],
          footer_rule: '3–15 = soma dos três domínios',
        },
        {
          type: 'golden_rule',
          meta: genericoSlideMeta,
          content: 'GLASGOW — TRÍADE',
          rows: [
            { label: 'Ocular (E)', value: 'Abertura ocular — 1 a 4', badge: 'hot' },
            { label: 'Verbal (V)', value: 'Resposta verbal — 1 a 5', badge: 'ok' },
            { label: 'Motor (M)', value: 'Resposta motora — 1 a 6', badge: 'ok' },
            { label: '× Pupilas/olfato', value: 'Não são domínios da escala', badge: 'warn' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Resposta olfativa não compõe a Escala de Coma de Glasgow — os domínios são ocular, verbal e motor.',
      B: 'Resposta sensitiva e comportamental não correspondem à nomenclatura padronizada da escala neurológica.',
      C: 'Reação pupilar e reflexo mecânico integram exame neurológico, mas não os três eixos pontuados da Glasgow.',
      E: 'Movimento de tronco e resposta olfativa não formam a tríade clássica E + V + M da escala.',
    },
  },
  'fcpc-enfermagem-processo-de-enfermagem-1780004906875-4': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Reação transfusional aguda — interromper infusão e comunicar enfermeiro/médico imediatamente',
      roi_error: 'reacao_transfusional_interromper',
      cluster: 'Transfusão — reação aguda (calafrios · dor lombar · dispneia)',
      danger_footer: 'Gabarito C — interromper e comunicar',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Reação transfusional',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Início da transfusão de CH — calafrios, dor lombar e dispneia: suspeita de reação hemolítica/aguda.',
              icon: 'Target',
            },
            {
              label: 'Sinais de alerta',
              detail: 'Calafrios + dor lombar + dispneia = parar e investigar — não minimizar.',
              icon: 'AlertTriangle',
            },
            {
              label: '1ª ação',
              detail: 'Interromper a transfusão imediatamente — manter acesso com SF se indicado.',
              icon: 'Ban',
            },
            {
              label: 'Comunicar',
              detail: 'Acionar enfermeiro e médico — registrar horário e lote do hemocomponente.',
              icon: 'Phone',
            },
            {
              label: 'Pegadinha',
              detail: 'Acelerar, aguardar observação prolongada ou só antitérmico mascaram reação grave.',
              icon: 'XCircle',
            },
          ],
          footer_rule: 'Parar → comunicar → monitorar',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Transfusão de CH — calafrios, dor lombar e dispneia no início. Ação imediata?',
            'A aumentar velocidade para terminar — agrava reação; pegadinha de acelerar a infusão; eliminar.',
            'B manter e observar sem interromper — posterga conduta; pegadinha de aguardar; eliminar.',
            'D antitérmico e reduzir velocidade — mantém infusão ativa; pegadinha do antitérmico isolado; eliminar.',
            'C interromper transfusão e comunicar enfermeiro/médico — protocolo de segurança.',
            'Marcar C.',
            'Fixação: qualquer sinal de reação = parar sangue e acionar equipe.',
          ],
          footer_rule: 'Reação = STOP the blood',
        },
        {
          type: 'golden_rule',
          slide_title: 'Transfusão — reação',
          meta: genericoSlideMeta,
          content: 'REAÇÃO TRANSFUSIONAL — DECORE',
          rows: [
            { label: 'Parar', value: 'Interromper infusão do hemocomponente', badge: 'hot' },
            { label: 'Manter acesso', value: 'Soro fisiológico no mesmo equipo se protocolo orientar', badge: 'ok' },
            { label: 'Comunicar', value: 'Enfermeiro + médico imediatamente', badge: 'hot' },
            { label: '× Acelerar', value: 'Terminar rápido agrava reação', badge: 'warn' },
            { label: '× Aguardar', value: 'Observar sem parar é negligência', badge: 'warn' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — REAÇÃO TRANSFUSIONAL',
          items: [
            {
              label: 'Letra A — acelerar transfusão',
              detail: 'Terminar a infusão mais rápido.',
              correct:
                'Acelerar a transfusão expõe o paciente a mais hemocomponente suspeito — conduta perigosa.',
            },
            {
              label: 'Letra B — aguardar para agir',
              detail: 'Manter infusão e só observar.',
              correct:
                'Aguardar observação prolongada antes de agir posterga o manejo de possível reação hemolítica aguda.',
            },
            {
              label: 'Letra D — antitérmico isolado',
              detail: 'Reduzir velocidade e medicar febre.',
              correct:
                'Só antitérmico e redução de velocidade mantêm a infusão ativa — não substituem interrupção imediata.',
            },
          ],
          footer_rule: 'Gabarito C — interromper e comunicar',
        },
      ],
    },
    danger: {},
  },
  'fgv-enfermagem-processo-de-enfermagem-1780002110600-0': {
    branch: 'trauma',
    pack: {
      family: 'protocolo',
      guideline: 'BT1/avaliação primária trauma — garantir segurança do local antes de qualquer intervenção',
      roi_error: 'trauma_bt1_seguranca_cena',
      cluster: 'Trauma BT1 — primeira medida (segurança da cena)',
      danger_footer: 'Gabarito A — garantir segurança do local',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Trauma BT1 — cena segura',
          meta: traumaSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Explosão de caldeira no trabalho — vítima caída; avaliação primária trauma BT1 / XABCDE.',
              icon: 'Target',
            },
            {
              label: '1ª medida',
              detail: 'Garantir segurança do local — proteger socorrista e vítima de novos riscos no trauma.',
              icon: 'Shield',
            },
            {
              label: 'Depois',
              detail: 'XABCDE após cena segura — responsividade, VAA, circulação, Glasgow, exposição.',
              icon: 'ListOrdered',
            },
            {
              label: '× Pupilas primeiro',
              detail: 'Exame secundário — não precede segurança nem ABCDE primário.',
              icon: 'XCircle',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca oferece passos do ABCDE como “primeira medida” — segurança vem antes.',
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
            'Trauma após explosão — primeira medida na avaliação primária (BT1)?',
            'Regra de ouro: nenhum socorrista entra em cena insegura.',
            'B avaliar pupilas — exame neurológico secundário; eliminar como 1ª medida.',
            'C pulso central e radial — circulação vem após cena segura e VAA; eliminar.',
            'D manter vias aéreas — importante, mas não antes de garantir segurança; eliminar.',
            'E avaliar responsividade — passo inicial do atendimento, mas após cena segura; eliminar.',
            'A garantir segurança do local — única primeira medida absoluta.',
            'Marcar A.',
            'Fixação: cena segura → depois ABCDE.',
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: traumaSlideMeta,
          content: 'TRAUMA — ORDEM DA PROVA',
          rows: [
            { label: '1º', value: 'Segurança da cena e do socorrista', badge: 'hot' },
            { label: '2º', value: 'Responsividade e ativação do socorro', badge: 'ok' },
            { label: '3º', value: 'ABCDE com proteção cervical', badge: 'ok' },
            { label: '× Pupilas/PA', value: 'Exames secundários — não abrem o atendimento', badge: 'warn' },
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Avaliar pupilas é exame neurológico detalhado — não precede a garantia de segurança da cena.',
      C: 'Pulso central e radial integram avaliação de circulação — vem depois da cena segura e do ABCDE inicial.',
      D: 'Manter vias aéreas é essencial, mas a banca cobra o passo anterior absoluto: segurança do local.',
      E: 'Avaliar responsividade inicia o atendimento à vítima, porém somente após confirmar que a cena é segura.',
    },
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006969552-4': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Alta precoce da UTI — reinternação não planejada por deterioração nas 24–72 h',
      roi_error: 'alta_uti_reinternacao',
      cluster: 'Alta da UTI — evento adverso da alta inadequada',
      danger_footer: 'Gabarito B — reinternação não planejada',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Alta da UTI — risco',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Contexto',
              detail: 'Alta precoce ou mal planejada da UTI aumenta eventos adversos nas primeiras horas após transferência.',
              icon: 'Target',
            },
            {
              label: 'Estabilidade',
              detail: 'Critérios clínicos e comunicação multiprofissional antes da transferência.',
              icon: 'ClipboardCheck',
            },
            {
              label: 'Evento adverso',
              detail: 'Reinternação não planejada por deterioração precoce — indicador de falha na alta.',
              icon: 'AlertTriangle',
            },
            {
              label: '× Alopecia',
              detail: 'Efeito tardio do estresse — não é o evento agudo pós-alta inadequada.',
              icon: 'XCircle',
            },
            {
              label: 'Pegadinha',
              detail: 'Mobilidade acelerada ou reduzir vigilância/monitorização invertem o risco da alta precoce.',
              icon: 'Ban',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Comando: evento adverso mais ligado à alta inadequada ou mal planejada da UTI?',
            'A alopecia transitória — manifestação tardia de estresse, não evento agudo pós-transferência; eliminar.',
            'C ganho ponderal súbito — reposição volêmica esperada, não complicação da alta precoce; eliminar.',
            'D recuperação acelerada da mobilidade — evolução favorável; pegadinha de mobilidade; eliminar.',
            'E redução imediata da vigilância/monitorização — consequência de alta segura, não complicação; eliminar.',
            'B reinternação não planejada em UTI por deterioração precoce — desfecho clássico de alta inadequada.',
            'Marcar B.',
            'Fixação: alta segura = estabilidade consolidada + plano de continuidade.',
          ],
          footer_rule: 'Alta UTI = critérios + comunicação',
        },
        {
          type: 'golden_rule',
          meta: genericoSlideMeta,
          content: 'ALTA DA UTI — DECORE',
          rows: [
            { label: 'Risco', value: 'Alta precoce sem estabilidade fisiológica', badge: 'hot' },
            { label: 'Janela', value: 'Eventos adversos nas primeiras horas pós-transferência', badge: 'warn' },
            { label: 'Desfecho', value: 'Reinternação não planejada em UTI', badge: 'hot' },
            { label: '× Mobilidade/vigilância', value: 'Evolução favorável não é evento adverso', badge: 'info' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — ALTA DA UTI',
          items: [
            {
              label: 'Letra A — alopecia transitória',
              detail: 'Efeito tardio do estresse metabólico.',
              correct:
                'Alopecia transitória é manifestação tardia — não o evento agudo de deterioração pós-alta inadequada.',
            },
            {
              label: 'Letra C — ganho ponderal súbito',
              detail: 'Reposição volêmica fisiológica esperada.',
              correct:
                'Ganho ponderal por reposição volêmica não caracteriza complicação de alta inadequada da UTI.',
            },
            {
              label: 'Letra D — mobilidade acelerada',
              detail: 'Recuperação funcional precoce como desfecho favorável.',
              correct:
                'Mobilidade acelerada é evolução favorável — pegadinha que inverte o risco da alta precoce.',
            },
            {
              label: 'Letra E — menos vigilância',
              detail: 'Redução de monitorização após alta segura.',
              correct:
                'Redução da vigilância após alta segura é esperada — não é evento adverso de alta mal planejada.',
            },
          ],
          footer_rule: 'Gabarito B — reinternação não planejada',
        },
      ],
    },
    danger: {},
  },
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780006480333-1': {
    branch: 'rcp_sbv',
    pack: {
      family: 'protocolo',
      guideline: 'Cadeia de sobrevivência — 1º elo: avaliar responsividade e acionar socorro (192/equipe)',
      roi_error: 'cadeia_sobrevivencia_reconhecimento_acionamento',
      cluster: 'SBV — prioridade inicial inconsciente sem respiração',
      danger_footer: 'Gabarito D — responsividade e acionamento',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'SBV — 1º elo',
          meta: rcpSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Inconsciente, sem resposta a chamados e sem movimentos respiratórios eficazes.',
              icon: 'Target',
            },
            {
              label: '1ª prioridade',
              detail: 'Confirmar responsividade e acionar ajuda/socorro especializado.',
              icon: 'Phone',
            },
            {
              label: 'Cadeia',
              detail: 'Reconhecimento → RCP → DEA → suporte avançado — ordem da AHA.',
              icon: 'Link',
            },
            {
              label: '× Dieta/analgésico',
              detail: 'Procedimentos de rotina hospitalar não têm lugar na emergência pré-hospitalar.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Temperatura e conforto vêm depois de reconhecer parada e acionar socorro.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Reconhecer → acionar → comprimir',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: rcpSlideMeta,
          steps: [
            'Vítima inconsciente sem respiração eficaz — prioridade inicial no atendimento?',
            'A dieta por sonda — procedimento eletivo sem relação com emergência; eliminar.',
            'B analgésico oral — via oral em inconsciente é insegura e irrelevante; eliminar.',
            'C aferir temperatura depois — sinal vital secundário neste momento; eliminar.',
            'D avaliar responsividade e acionar — 1º elo da cadeia de sobrevivência.',
            'Marcar D.',
            'Fixação: antes de comprimir, confirme inconsciência e peça ajuda/DEA.',
          ],
          footer_rule: RCP_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: rcpSlideMeta,
          content: 'CADEIA DE SOBREVIVÊNCIA',
          rows: rcpParamRows([
            { label: '1º elo', value: 'Reconhecimento + acionamento (192/DEA)', badge: 'hot' },
            { label: '2º elo', value: 'RCP de alta qualidade', badge: 'ok' },
            { label: '× Procedimentos eletivos', value: 'Dieta/analgésico não são prioridade', badge: 'warn' },
          ]),
          footer_rule: RCP_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Oferta de dieta por sonda em vítima inconsciente sem respiração ignora emergência — prioridade é reconhecer parada e acionar socorro.',
      B: 'Analgésico por via oral é inseguro em inconsciente e não integra o atendimento inicial de emergência.',
      C: 'Aferição de temperatura é monitorização secundária — vem após confirmar responsividade e acionar ajuda.',
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
    } else if (entry.branch === 'avc') {
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
    } else if (entry.branch === 'trauma') {
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
    } else {
      const q = raw as RcpQ;
      const slides = finalizeRcp(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaRcp(
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
    console.log(`[handcraft:urgencias-g32] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g32] total=${ok}`);
}

main();
