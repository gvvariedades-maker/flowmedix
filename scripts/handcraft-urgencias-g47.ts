#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g47 (8 slugs · 18º lote reconcile outside-tail).
 * HDA decúbito · APH equipe · KED · IAM O2 · intoxicação UBS · pré-eclâmpsia DLE · Cushing · AHA VF RCP.
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
  finalizeSlides as finalizeChoque,
  metaBase as metaChoque,
  slideMeta as choqueSlideMeta,
  type Pack as ChoquePack,
  type Q as ChoqueQ,
} from './lib/urgenciasChoqueGolden';
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

const LOTE = 'urgencias-g47';
const REVIEWER = 'handcraft-urgencias-g47';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const AVC_FOOTER = 'IAM/AVC — tempo é tecido · oxigênio se indicado';
const CHOQUE_FOOTER = 'Choque/HTIC — perfusão e sinais de alarme';
const RCP_FOOTER = 'AHA SBV — parada respiratória · OVACE · obeso';

const HDA_DECUBITO_ROWS = [
  { label: 'HDA gástrica', value: 'Risco de vômito/hematêmese — proteger via aérea', badge: 'hot' },
  { label: 'Posição', value: 'Decúbito lateral — reduz aspiração', badge: 'ok' },
  { label: '× Bochechos', value: 'Salina hipertônica na boca — não conduta de HDA aguda', badge: 'warn' },
  { label: '× Líquidos frios', value: 'Estimular ingestão — contraindicado no sangramento ativo', badge: 'warn' },
  { label: '× Aspiração rotina', value: 'Aspiração frequente isolada — não substitui posicionamento', badge: 'info' },
];

const APH_EQUIPE_ROWS = [
  { label: 'APH integrado', value: 'Ações conjuntas — agilidade e assistência adequada', badge: 'hot' },
  { label: 'Trabalho em equipe', value: 'Sintonia entre profissionais na cena', badge: 'ok' },
  { label: '× Competitivo', value: 'Rivalidade individual — não caracteriza APH', badge: 'warn' },
  { label: '× Tecnicista', value: 'Procedimentos isolados sem integração — pegadinha clássica', badge: 'warn' },
  { label: '× Agrupamento', value: 'Mera proximidade física — não é trabalho coordenado', badge: 'info' },
];

const KED_COLETE_ROWS = [
  { label: 'KED', value: 'Kendrick Extrication Device — colete de extricação', badge: 'hot' },
  { label: 'Função', value: 'Estabilizar coluna durante remoção da vítima do veículo', badge: 'ok' },
  { label: '× Alicate', value: 'Ferramenta de desencarceramento — não é o KED', badge: 'warn' },
  { label: '× Colar cervical', value: 'Proteção cervical — dispositivo distinto do colete KED', badge: 'warn' },
  { label: '× Pranchas longas', value: 'Transporte — não definição do colete de extricação', badge: 'info' },
];

const INTOX_ALCOOL_UBS_ROWS = [
  { label: 'Cenário', value: 'Intoxicação exógena/alcoólica · SV alterados na porta da UBS', badge: 'hot' },
  { label: 'Prioridade', value: 'Acolher · sala adequada · reduzir risco de acidentes', badge: 'ok' },
  { label: 'Encaminhar', value: 'Avaliação médica após estabilização inicial', badge: 'ok' },
  { label: '× Intervenção breve', value: 'Prevenção de recaída — após estabilização, não na urgência aguda', badge: 'warn' },
  { label: '× Alta domiciliar', value: 'Enviar para casa com família — ignora SV alterados', badge: 'warn' },
];

const PRE_ECLAMPSIA_DLE_ROWS = [
  { label: 'DLE', value: 'Lateral esquerdo — retorno venoso e perfusão uteroplacentária', badge: 'hot' },
  { label: 'Acesso', value: 'Via calibrosa mantida para medicação se prescrita', badge: 'ok' },
  { label: 'Ambiente', value: 'Repouso · reduzir luminosidade e ruídos', badge: 'ok' },
  { label: '× Dorsal', value: 'Supino comprime veia cava inferior', badge: 'warn' },
  { label: '× DLD', value: 'Lateral direito — não favorece retorno venoso materno', badge: 'warn' },
  { label: '× Trendelenburg', value: 'Cabeça rebaixada — contraindicado com PA elevada', badge: 'warn' },
];

const CUSHING_REFLEX_ROWS = [
  { label: 'Tríade', value: 'PA elevada + bradicardia + alteração respiratória', badge: 'hot' },
  { label: 'Mecanismo', value: 'Hipertensão intracraniana — reflexo de Cushing', badge: 'ok' },
  { label: 'Sinais', value: 'Anisocoria · Glasgow em queda · risco de herniação', badge: 'warn' },
  { label: 'Choque neuro', value: 'Perfusão cerebral crítica — emergência neurológica', badge: 'hot' },
  { label: '× Sedação', value: 'Depressão por sedação — não explica tríade hipertensiva', badge: 'info' },
];

const AHA_PARADA_RESPIRATORIA_ROWS = [
  { label: 'Parada respiratória', value: '1 ventilação a cada 6 segundos (adulto)', badge: 'hot' },
  { label: 'PCR obeso', value: 'Mesma técnica de compressões que não obeso', badge: 'ok' },
  { label: 'OVACE grave', value: 'Ciclos de 5 golpes nas costas + 5 compressões abdominais', badge: 'ok' },
  { label: 'Corpo estranho', value: 'Repetir até expelir ou inconsciência', badge: 'warn' },
  { label: 'AHA 2020', value: 'Diretrizes ILCOR — SBV adulto', badge: 'info' },
];

type GenericoEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };
type AvcEntry = { branch: 'avc_iam'; pack: AvcPack; danger: Record<string, string> };
type ChoqueEntry = { branch: 'choque'; pack: ChoquePack; danger: Record<string, string> };
type RcpEntry = { branch: 'rcp_sbv'; pack: RcpPack; danger: Record<string, string> };
type HandcraftEntry = GenericoEntry | AvcEntry | ChoqueEntry | RcpEntry;

const SPECS: Record<string, HandcraftEntry> = {
  'vunesp-enfermagem-urgencias-e-emergencias-1777104070286-2': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Hemorragia digestiva alta gástrica — manter decúbito lateral para reduzir risco de aspiração de sangue/vômito',
      roi_error: 'hda_decubito_lateral_protecao_va',
      cluster: 'HDA gástrica — posicionamento e proteção de via aérea',
      danger_footer: 'Gabarito D — decúbito lateral',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'HDA — cuidados imediatos',
          meta: genericoSlideMeta,
          items: [
            { label: 'Cenário', detail: 'Hemorragia digestiva alta gástrica — sangramento com risco de vômito.', icon: 'Droplet' },
            { label: 'Prioridade', detail: 'Proteger via aérea — posicionar para evitar aspiração.', icon: 'Shield' },
            { label: 'Decúbito lateral', detail: 'Posição que facilita drenagem e reduz broncoaspiração.', icon: 'User' },
            { label: '× Bochechos', detail: 'Solução salina hipertônica — não conduta de HDA aguda.', icon: 'Ban' },
            { label: '× Líquidos frios', detail: 'Estimular ingestão — contraindicado no sangramento ativo.', icon: 'XCircle' },
            { label: 'Pegadinha — condutas ativas erradas', detail: 'Banca troca decúbito lateral por bochechos, aspiração ou líquidos.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'HDA gástrica — cuidado de enfermagem correto?',
            'Risco: vômito/hematêmese com aspiração.',
            'Eliminar bochechos hipertônicos · aspiração rotina · líquidos frios · inspirações profundas isoladas.',
            'D manter decúbito lateral — protege via aérea.',
            'Marcar D.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'HDA — decore',
          meta: genericoSlideMeta,
          content: 'HDA GÁSTRICA — POSIÇÃO',
          rows: HDA_DECUBITO_ROWS,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — hda decubito lateral protecao va',
          items: [
            {
              label: 'Letra A — bochechos hipertônicos',
              detail: 'Orientar bochechos com solução salina hipertônica.',
              correct: 'Não é conduta de HDA aguda — decúbito lateral protege via aérea (D).',
            },
            {
              label: 'Letra B — aspiração frequente',
              detail: 'Aspirar orofaringe com frequência isolada.',
              correct: 'Aspiração rotina não substitui posicionamento — gabarito D.',
            },
            {
              label: 'Letra C — líquidos frios',
              detail: 'Estimular ingestão de líquidos frios.',
              correct: 'Ingestão contraindicada no sangramento ativo — marcar D.',
            },
            {
              label: 'Letra E — inspirações profundas',
              detail: 'Orientar inspirações profundas isoladas.',
              correct: 'Não protege de aspiração — decúbito lateral (D).',
            },
          ],
          footer_rule: 'Gabarito D — decúbito lateral',
        },
      ],
    },
    danger: {},
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104070286-3': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Atendimento pré-hospitalar integrado — trabalho em equipe com ações conjuntas garante agilidade e assistência adequada às vítimas',
      roi_error: 'aph_trabalho_equipe_competitivo_tecnicista',
      cluster: 'APH/SAMU — trabalho em equipe',
      danger_footer: 'Gabarito A — em equipe',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'APH — integração na cena',
          meta: genericoSlideMeta,
          items: [
            { label: 'Cenário', detail: 'APH em acidentes e traumas — equipe do SAMU na cena.', icon: 'Ambulance' },
            { label: 'Integração', detail: 'Trabalhadores atuam de forma coordenada — ações conjuntas.', icon: 'Users' },
            { label: 'Em equipe', detail: 'Sintonia viabiliza atendimento rápido e adequado.', icon: 'HeartHandshake' },
            { label: '× Competitivo', detail: 'Rivalidade individual — oposto da integração APH.', icon: 'Ban' },
            { label: '× Tecnicista', detail: 'Foco só em procedimento técnico — ignora coordenação.', icon: 'XCircle' },
            { label: 'Pegadinha — competitivo × tecnicista', detail: 'Banca oferece competitivo ou tecnicista em vez de trabalho em equipe.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'APH integrado — como caracterizar o trabalho na cena?',
            'Ações conjuntas + agilidade = trabalho em equipe.',
            'Eliminar competitivo (rivalidade) · tecnicista (procedimento isolado) · agrupamento · unidimensional.',
            'Marcar A — em equipe.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'APH — decore',
          meta: genericoSlideMeta,
          content: 'TRABALHO EM EQUIPE — APH',
          rows: APH_EQUIPE_ROWS,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — aph trabalho equipe competitivo tecnicista',
          items: [
            {
              label: 'Letra B — competitivo',
              detail: 'Trabalho competitivo — rivalidade entre profissionais na cena.',
              correct: 'APH exige coordenação, não competição — gabarito A (em equipe).',
            },
            {
              label: 'Letra C — tecnicista',
              detail: 'Trabalho tecnicista — foco em procedimentos sem integração.',
              correct: 'Tecnicismo isolado não caracteriza APH integrado — marcar A.',
            },
            {
              label: 'Letra D — em agrupamento',
              detail: 'Trabalho em agrupamento — mera proximidade sem coordenação.',
              correct: 'Agrupamento ≠ equipe integrada — gabarito A.',
            },
            {
              label: 'Letra E — unidimensional',
              detail: 'Trabalho unidimensional — visão limitada sem ação conjunta.',
              correct: 'APH requer sintonia multidisciplinar — A (em equipe).',
            },
          ],
          footer_rule: 'Gabarito A — em equipe',
        },
      ],
    },
    danger: {},
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104070286-4': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'KED (Kendrick Extrication Device) — colete de extricação que estabiliza a coluna durante remoção da vítima do veículo',
      roi_error: 'ked_colete_extricacao_coluna',
      cluster: 'SAMU — KED colete de extricação',
      danger_footer: 'Gabarito C — colete KED',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'KED — extricação veicular',
          meta: genericoSlideMeta,
          items: [
            { label: 'Cenário', detail: 'Acidente automobilístico grave — SAMU estabiliza coluna na extricação.', icon: 'Car' },
            { label: 'KED', detail: 'Kendrick Extrication Device — dispositivo de imobilização.', icon: 'Shield' },
            { label: 'Colete', detail: 'Colete que estabiliza coluna durante remoção da vítima.', icon: 'Activity' },
            { label: '× Alicate', detail: 'Ferramenta de desencarceramento — não é o KED.', icon: 'Ban' },
            { label: '× Colar cervical', detail: 'Colar cervical — proteção distinta do colete de extricação.', icon: 'XCircle' },
            { label: 'Pegadinha — equipamentos trocados', detail: 'Banca confunde KED com alicate, colar ou pranchas longas.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'KED no socorro pré-hospitalar — o que é?',
            'Colete de extricação — estabiliza coluna na remoção do veículo.',
            'Eliminar alicate de lataria · colar cervical isolado · pranchas longas · monitor cardioversor.',
            'Marcar C.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'KED — decore',
          meta: genericoSlideMeta,
          content: 'KED — COLETE DE EXTRICAÇÃO',
          rows: KED_COLETE_ROWS,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — ked colete extricacao coluna',
          items: [
            {
              label: 'Letra A — alicate de lataria',
              detail: 'Alicate para abrir lataria e liberar vítima presa.',
              correct: 'Ferramenta de desencarceramento — KED é colete de extricação (C).',
            },
            {
              label: 'Letra B — colar cervical',
              detail: 'Colar utilizado para proteger a coluna cervical.',
              correct: 'Colar é dispositivo distinto — gabarito C (colete KED).',
            },
            {
              label: 'Letra D — pranchas longas',
              detail: 'Conjunto de pranchas longas para transporte na ambulância.',
              correct: 'Pranchas não definem o KED — marcar C.',
            },
            {
              label: 'Letra E — monitor cardioversor',
              detail: 'Monitor cardioversor com marcapasso externo.',
              correct: 'Equipamento cardíaco — não colete de extricação (C).',
            },
          ],
          footer_rule: 'Gabarito C — colete KED',
        },
      ],
    },
    danger: {},
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104083571-0': {
    branch: 'avc_iam',
    pack: {
      family: 'protocolo',
      guideline:
        'Infarto agudo do miocárdio — cuidados imediatos incluem oxigenoterapia quando indicada no protocolo de síndrome coronariana aguda',
      roi_error: 'iam_oxigenoterapia_cuidado_imediato',
      cluster: 'IAM — oxigenoterapia no protocolo agudo',
      danger_footer: 'Gabarito C — oxigenoterapia',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'IAM — cuidados imediatos',
          meta: avcSlideMeta,
          items: [
            { label: 'Cenário', detail: 'Protocolo de cuidado por infarto agudo do miocárdio.', icon: 'Heart' },
            { label: 'IAM', detail: 'Síndrome coronariana aguda — suprir oxigênio se indicado.', icon: 'Activity' },
            { label: 'Oxigenoterapia', detail: 'Instalação de O₂ conforme protocolo e saturação.', icon: 'Wind' },
            { label: '× Decúbito lateral', detail: 'Posição lateral direita — não conduta padrão do IAM.', icon: 'Ban' },
            { label: '× Elevação MMII', detail: 'Elevar membros — manobra de choque, não IAM.', icon: 'XCircle' },
            { label: 'Pegadinha — condutas de choque', detail: 'Banca troca oxigenoterapia por posição ou bolus de eletrólitos.', icon: 'AlertTriangle' },
          ],
          footer_rule: AVC_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: avcSlideMeta,
          steps: [
            'IAM — cuidado imediato correto no protocolo?',
            'Síndrome isquêmica aguda — suprir oxigênio quando indicado.',
            'Eliminar decúbito lateral direito · elevação de MMII · bolus de eletrólitos · ingesta oral imediata.',
            'C instalação de oxigenoterapia — conduta adequada.',
            'Marcar C.',
          ],
          footer_rule: AVC_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'IAM — sinais e conduta',
          meta: avcSlideMeta,
          content: 'IAM — SUPORTE INICIAL',
          rows: iamSinaisRows(),
          footer_rule: AVC_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Decúbito lateral direito não é posicionamento padrão no IAM — oxigenoterapia quando indicada (C).',
      B: 'Elevação de membros inferiores é manobra de choque/hipotensão — não cuidado imediato do IAM.',
      D: 'Bolus de eletrólitos não compõe o cuidado imediato cobrado — marcar C (oxigenoterapia).',
      E: 'Ingesta oral imediata é contraindicada na suspeita de IAM agudo — gabarito C.',
    },
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104090044-0': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Intoxicação alcoólica aguda na UBS — acolher em sala adequada, reduzir riscos e encaminhar para avaliação médica (SV alterados)',
      roi_error: 'intoxicacao_alcoolica_ubs_acolhimento',
      cluster: 'Intoxicação exógena — manejo na UBS',
      danger_footer: 'Gabarito E — sala adequada + médico',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Intoxicação — porta da UBS',
          meta: genericoSlideMeta,
          items: [
            { label: 'Cenário', detail: 'Intoxicação alcoólica provável · SV alterados · porta da UBS.', icon: 'User' },
            { label: 'Urgência', detail: 'Estabilizar ambiente — não alta precoce.', icon: 'AlertTriangle' },
            { label: 'Sala adequada', detail: 'Acolher e avaliar em espaço seguro — reduzir acidentes.', icon: 'Home' },
            { label: 'Médico', detail: 'Encaminhar para avaliação médica após acolhimento.', icon: 'Stethoscope' },
            { label: '× Alta domiciliar', detail: 'Enviar para casa — ignora SV alterados.', icon: 'Ban' },
            { label: 'Pegadinha — prevenção antes de estabilizar', detail: 'Banca oferece intervenção breve ou contenção antes do acolhimento seguro.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Intoxicação alcoólica · SV alterados na UBS — conduta correta?',
            'Prioridade: ambiente seguro + avaliação + encaminhamento médico.',
            'Eliminar intervenção breve isolada · alta com família · contenção rotineira · orientar ir a outro serviço sem acolher.',
            'E atendimento em sala adequada + encaminhamento médico.',
            'Marcar E.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Intoxicação UBS — decore',
          meta: genericoSlideMeta,
          content: 'INTOXICAÇÃO AGUDA — UBS',
          rows: INTOX_ALCOOL_UBS_ROWS,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — intoxicacao alcoolica ubs acolhimento',
          items: [
            {
              label: 'Letra A — intervenção breve',
              detail: 'Intervenção breve sobre riscos do álcool — antes de estabilizar.',
              correct: 'Prevenção de recaída vem após estabilização — gabarito E.',
            },
            {
              label: 'Letra B — alta domiciliar',
              detail: 'Chamar família/ACS para levar para casa.',
              correct: 'SV alterados exigem acolhimento na unidade — marcar E.',
            },
            {
              label: 'Letra C — contenção mecânica',
              detail: 'Contenção mecânica e medicamentosa de rotina.',
              correct: 'Contenção não é 1ª linha com SV alterados — E (sala adequada + médico).',
            },
            {
              label: 'Letra D — orientar outro serviço',
              detail: 'Evitar confronto e orientar buscar outro serviço sem acolher.',
              correct: 'UBS deve acolher urgência na porta — gabarito E.',
            },
          ],
          footer_rule: 'Gabarito E — sala adequada + médico',
        },
      ],
    },
    danger: {},
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104090044-1': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Pré-eclâmpsia grave na gestante — repouso em decúbito lateral esquerdo (DLE), acesso venoso calibroso e ambiente calmo enquanto aguarda médico',
      roi_error: 'pre_eclampsia_gestante_dle_repouso',
      cluster: 'Pré-eclâmpsia — cuidados do técnico na espera',
      danger_footer: 'Gabarito B — DLE + acesso venoso',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Gestante — pré-eclâmpsia',
          meta: genericoSlideMeta,
          items: [
            { label: 'Tríade', detail: 'Cefaleia refratária · fotopsias/escotomas · dor em hipocôndrio direito.', icon: 'AlertTriangle' },
            { label: 'PA', detail: 'Pressão arterial descompensada com taquicardia — urgência obstétrica.', icon: 'Activity' },
            { label: 'Papel do técnico', detail: 'Suporte enquanto aguarda obstetra — posicionar e monitorar.', icon: 'User' },
            { label: '× Alta precoce', detail: 'Repouso domiciliar com PA elevada — conduta inadequada.', icon: 'Ban' },
            { label: '× Toque de rotina', detail: 'Toque vaginal para trabalho de parto — não prioridade imediata.', icon: 'XCircle' },
            { label: 'Pegadinha — inversão de decúbito', detail: 'Banca troca lateral esquerdo por direito, dorsal ou Trendelenburg.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Gestante com cefaleia, escotomas e PA elevada — cuidados do técnico na espera?',
            'Pré-eclâmpsia: DLE + acesso venoso + ambiente calmo.',
            'Eliminar DLD · sonda vesical de rotina · dorsal com toque · Trendelenburg.',
            'Marcar B.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Pré-eclâmpsia — decore',
          meta: genericoSlideMeta,
          content: 'GESTANTE — DLE E SUPORTE',
          rows: PRE_ECLAMPSIA_DLE_ROWS,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — pre eclampsia gestante dle repouso',
          items: [
            {
              label: 'Letra A — DLD + alta domiciliar',
              detail: 'Decúbito lateral direito e repouso domiciliar após saída.',
              correct: 'DLE é posição correta — não alta com PA elevada; gabarito B.',
            },
            {
              label: 'Letra C — DLD + sonda vesical',
              detail: 'Manter em DLD com sonda vesical de demora.',
              correct: 'DLE, não DLD — marcar B.',
            },
            {
              label: 'Letra D — dorsal + toque vaginal',
              detail: 'Decúbito dorsal horizontal com toque vaginal.',
              correct: 'Dorsal comprime veia cava — DLE é conduta (B).',
            },
            {
              label: 'Letra E — Trendelenburg',
              detail: 'Posição de Trendelenburg e acordada para vigilância.',
              correct: 'Trendelenburg inadequado na gestante hipertensa — gabarito B.',
            },
          ],
          footer_rule: 'Gabarito B — DLE + acesso venoso',
        },
      ],
    },
    danger: {},
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006969552-9': {
    branch: 'choque',
    pack: {
      family: 'protocolo',
      guideline:
        'TCE grave com anisocoria, queda de Glasgow, hipertensão e bradicardia — tríade de Cushing por hipertensão intracraniana crítica',
      roi_error: 'tce_reflexo_cushing_hipertensao_intracraniana',
      cluster: 'TCE — reflexo de Cushing (choque neurológico)',
      danger_footer: 'Gabarito E — reflexo de Cushing',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'TCE — deterioração neurológica',
          meta: choqueSlideMeta,
          items: [
            { label: 'Cenário', detail: 'TCE grave em UTI — piora neurológica aguda.', icon: 'Brain' },
            { label: 'Sinais', detail: 'Anisocoria · Glasgow em queda · PA elevada · bradicardia.', icon: 'Activity' },
            { label: 'Cushing', detail: 'Reflexo de Cushing — hipertensão intracraniana crítica.', icon: 'AlertTriangle' },
            { label: 'Choque neuro', detail: 'Perfusão cerebral comprometida — risco de herniação.', icon: 'HeartPulse' },
            { label: '× Sedação', detail: 'Depressão por sedação — não explica tríade hipertensiva.', icon: 'Ban' },
            { label: 'Pegadinha — causas metabólicas', detail: 'Banca oferece hipoglicemia, delirium ou choque hipovolêmico oculto.', icon: 'AlertTriangle' },
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: choqueSlideMeta,
          steps: [
            'TCE grave — anisocoria + Glasgow em queda + PA alta + bradicardia?',
            'Tríade: hipertensão arterial + bradicardia + alteração respiratória = reflexo de Cushing.',
            'Eliminar sedação isolada · hipoglicemia · choque hemorrágico oculto · delirium.',
            'E ativação do reflexo de Cushing — hipertensão intracraniana crítica.',
            'Marcar E.',
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Cushing — decore',
          meta: choqueSlideMeta,
          content: 'REFLEXO DE CUSHING — TCE',
          rows: CUSHING_REFLEX_ROWS,
          footer_rule: CHOQUE_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Sedação contínua deprime consciência, mas não explica PA elevada com bradicardia e anisocoria — tríade de Cushing (E).',
      B: 'Hipoglicemia grave não produz anisocoria fixa com hipertensão e bradicardia — gabarito E.',
      C: 'Choque hipovolêmico cursa com hipotensão — o caso tem hipertensão arterial (Cushing).',
      D: 'Delirium metabólico não explica midríase fixa e queda progressiva de Glasgow no TCE — marcar E.',
    },
  },
  'furb-enfermagem-processo-de-enfermagem-1780011908736-9': {
    branch: 'rcp_sbv',
    pack: {
      family: 'vf',
      guideline:
        'AHA SBV adulto — parada respiratória: 1 ventilação/6 s · RCP em obeso igual ao não obeso · OVACE grave: 5 costas + 5 abdominais',
      roi_error: 'aha_vf_parada_respiratoria_ovace_obeso',
      cluster: 'AHA — VF I/II/III PCR e OVACE',
      danger_footer: 'Gabarito E — I, II e III',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'AHA — SBV adulto V/F',
          meta: rcpSlideMeta,
          items: [
            { label: 'Comando', detail: 'AHA — PCR, parada respiratória, RCP e OVACE em adulto.', icon: 'BookOpen' },
            { label: 'I — parada respiratória', detail: 'Ventilações: 1 a cada 6 segundos — aceitável na parada respiratória.', icon: 'Wind' },
            { label: 'II — obeso em PCR', detail: 'RCP em obeso — mesma forma que em não obeso.', icon: 'User' },
            { label: 'III — OVACE grave', detail: 'Corpo estranho: ciclos de 5 golpes nas costas + 5 compressões abdominais.', icon: 'Hand' },
            { label: 'Pegadinha — omitir item', detail: 'Banca omite I (ventilações) ou III (OVACE 5+5).', icon: 'AlertTriangle' },
          ],
          footer_rule: RCP_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: rcpSlideMeta,
          steps: [
            'AHA — julgar I, II e III sobre SBV adulto.',
            'I parada respiratória — 1 ventilação a cada 6 segundos — verdadeira.',
            'II RCP em obeso — mesma técnica que não obeso — verdadeira.',
            'III OVACE grave — 5 costas + 5 abdominais até expelir — verdadeira.',
            'Todas corretas — marcar E (I, II e III).',
          ],
          footer_rule: RCP_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'AHA — parâmetros SBV',
          meta: rcpSlideMeta,
          content: 'AHA SBV ADULTO — DECORE',
          rows: [...rcpParamRows(), ...AHA_PARADA_RESPIRATORIA_ROWS],
          footer_rule: RCP_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: rcpSlideMeta,
          content: 'PEGADINHAS — aha vf parada respiratoria ovace obeso',
          items: [
            {
              label: 'Letra A — I e II apenas',
              detail: 'Aceita I e II, mas omite III (OVACE 5+5).',
              correct: 'III também é verdadeira — gabarito E (I, II e III).',
            },
            {
              label: 'Letra B — III apenas',
              detail: 'Isola OVACE e exclui I (ventilações) e II (obeso).',
              correct: 'I e II são verdadeiras — marcar E.',
            },
            {
              label: 'Letra C — I apenas',
              detail: 'Só parada respiratória — ignora RCP obeso e OVACE.',
              correct: 'II e III também corretas — gabarito E.',
            },
            {
              label: 'Letra D — II e III apenas',
              detail: 'Omite I (ventilação a cada 6 s na parada respiratória).',
              correct: 'I é verdadeira — todas corretas, marcar E.',
            },
          ],
          footer_rule: 'Gabarito E — I, II e III',
        },
      ],
    },
    danger: {},
  },
};

function readQuestaoJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

function sanitizePreEclampsiaInstruction(instruction: string): string {
  return instruction.replace(
    /Após passar por classificação de risco,/i,
    'Após acolhimento na unidade,',
  );
}

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;

  for (const [slug, entry] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = readQuestaoJson(path);

    if (entry.branch === 'avc_iam') {
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
    } else if (entry.branch === 'rcp_sbv') {
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
    } else {
      const q = raw as GenericoQ;
      const slides = finalizeGenerico(slug, q, entry.pack, { [slug]: entry.danger });
      const questionData =
        slug === 'vunesp-enfermagem-urgencias-e-emergencias-1777104090044-1'
          ? {
              ...q.question_data,
              instruction: sanitizePreEclampsiaInstruction(q.question_data.instruction),
            }
          : q.question_data;
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
        question_data: questionData,
        reverse_study_slides: slides,
        modulo_slug: q.modulo_slug ?? slug,
      };
      writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    }

    ok++;
    console.log(`[handcraft:urgencias-g47] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g47] total=${ok}`);
}

main();
