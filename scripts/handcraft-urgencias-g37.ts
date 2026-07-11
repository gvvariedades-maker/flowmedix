#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g37 (8 slugs · 8º lote urgencias_generico).
 * Inferência: TCE/Battle e AVE/Glasgow → generico · demais generico (sem drift trauma/IAM/choque).
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

const LOTE = 'urgencias-g37';
const REVIEWER = 'handcraft-urgencias-g37';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';

/** Sinais de fratura de base de crânio — sem drift IAM/AVC. */
const BASE_CRANIO_QUALITATIVA = [
  { label: 'Battle', value: 'Equimose retroauricular — osso temporal', badge: 'hot' },
  { label: 'Guaxinim', value: 'Equimose periorbitária bilateral', badge: 'ok' },
  { label: 'Liquor', value: 'Otorreia ou rinorreia clara — fístula liquórica', badge: 'warn' },
  { label: '× Frank', value: 'Epônimo de fratura etmoide — não é Battle', badge: 'info' },
  { label: '× Homans', value: 'Sinal venoso de membro — não craniano', badge: 'warn' },
];

/** Acidente escorpiônico — primeiros socorros. */
const ESCORPIAO_QUALITATIVA = [
  { label: 'Lavar', value: 'Água e sabão no local da picada', badge: 'hot' },
  { label: 'Encaminhar', value: 'Atendimento médico imediato — risco de gravidade', badge: 'ok' },
  { label: '× Espremer', value: 'Aumenta disseminação do veneno — proibido', badge: 'warn' },
  { label: '× Garrote', value: 'Torniquete/garrote no membro — conduta errada', badge: 'warn' },
  { label: 'Pegadinha', value: 'Banca mistura espremer + garrotear na mesma letra', badge: 'info' },
];

/** Receptor O− — compatibilidade transfusional. */
const TRANSFUSAO_O_NEGATIVO = [
  { label: 'Receptor O−', value: 'Só recebe O negativo — anticorpos anti-A e anti-B', badge: 'hot' },
  { label: '× O+', value: 'Rh positivo incompatível com receptor Rh negativo sensibilizado', badge: 'warn' },
  { label: '× Doador universal', value: 'O− é doador universal — AB− não é doador universal', badge: 'info' },
  { label: '× Crossmatch livre', value: 'Compatibilidade cruzada não substitui regra ABO/Rh', badge: 'warn' },
  { label: 'Risco', value: 'Reação hemolítica aguda se tipo errado', badge: 'warn' },
];

/** Primeiros socorros no ambiente escolar. */
const PS_ESCOLA_QUALITATIVA = [
  { label: 'Capacitação', value: 'Pessoas treinadas na escola para atendimento imediato', badge: 'hot' },
  { label: 'Promoção', value: 'Prevenção de acidentes + educação em saúde escolar', badge: 'ok' },
  { label: '× Só professor', value: 'Equipe ampla capacitada — não exclusividade docente', badge: 'warn' },
  { label: '× Escola rara', value: 'Escola é cenário frequente de acidentes na infância', badge: 'info' },
  { label: 'Definição PS', value: 'Condutas iniciais até equipe qualificada — qualquer cuidador', badge: 'ok' },
];

/** Ingestão de água sanitária (hipoclorito) — primeiros socorros. */
const AGUA_SANITARIA_PS = [
  { label: 'Diluir', value: 'Pequenas quantidades de água — reduzir irritação', badge: 'hot' },
  { label: 'Não vomitar', value: 'Evitar indução de êmese — risco de reaspiração/lesão', badge: 'ok' },
  { label: 'Encaminhar', value: 'Avaliação médica urgente após medidas iniciais', badge: 'ok' },
  { label: '× Êmese', value: 'Provocar vômito — conduta antiquada e perigosa', badge: 'warn' },
  { label: '× Neutralizar', value: 'Álcali/ácido caseiro ou lavagem invasiva sem indicação', badge: 'warn' },
];

/** PEP HIV — exposição percutânea ocupacional. */
const PEP_HIV_QUALITATIVA = [
  { label: 'Janela', value: 'Iniciar o quanto antes — limite protocolar pós-exposição', badge: 'hot' },
  { label: 'Esquema', value: 'TDF/3TC + dolutegravir — curso completo conforme guia', badge: 'ok' },
  { label: 'Fonte desconhecida', value: 'PEP indicada — não aguardar sorologia da fonte', badge: 'hot' },
  { label: 'Seguimento', value: 'Sorologias seriadas + status hepatite B', badge: 'info' },
  { label: '× Esperar HIV+', value: 'Adiar PEP até confirmar fonte — erro grave', badge: 'warn' },
];

/** Gestão de risco de desastres — fases. */
const DESASTRE_FASES = [
  { label: 'Prevenção', value: 'Reduzir vulnerabilidade antes do evento — ex.: estruturas resilientes', badge: 'hot' },
  { label: 'Mitigação', value: 'Plano de contingência e evacuação — preparação', badge: 'ok' },
  { label: 'Resposta', value: 'Busca · resgate · notificação pós-evento', badge: 'info' },
  { label: '× Pós apenas', value: 'Comando pede medida de prevenção — não resposta', badge: 'warn' },
  { label: '× Higiene genérica', value: 'Campanha de higiene — promoção, não gestão de desastre', badge: 'warn' },
];

type HandcraftEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };

const SPECS: Record<string, HandcraftEntry> = {
  'ibfc-enfermagem-semiologia-em-enfermagem-1779563512485-7': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'TCE com otorreia e equimose retroauricular — fratura de base de crânio e sinal de Battle',
      roi_error: 'battle_base_cranio_otorreia',
      cluster: 'TCE — sinal de Battle + fístula liquórica',
      danger_footer: 'Gabarito C — base de crânio + Battle',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Base de crânio — achados',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail:
                'TCE com líquido claro pelo ouvido e equimose atrás das orelhas — suspeita de fratura de base.',
              icon: 'Target',
            },
            {
              label: 'Otorreia clara',
              detail: 'Líquido transparente no ouvido — fístula liquórica por fratura temporal.',
              icon: 'Droplets',
            },
            {
              label: 'Battle',
              detail: 'Equimose retroauricular — sinal clássico de fratura de base temporal.',
              icon: 'Ear',
            },
            {
              label: '× Guaxinim',
              detail: 'Equimose periorbitária — outro sinal de base, mas local diferente.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Trocar Battle por Frank · Cullen · Jobert · Homans — epônimos de outras regiões.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Mastoide = Battle · periorbita = guaxinim',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'TCE — otorreia clara + equimose retroauricular. Principal suspeita?',
            'A Frank/etmoide — epônimo de outra fratura facial; eliminar.',
            'B Cullen/zigomático — equimose periumbilical ou zigoma; topografia errada; eliminar.',
            'D Jobert/nasal — sinal abdominal ou nasal; não craniano; eliminar.',
            'E Homans — sinal venoso de membro inferior; eliminar.',
            'C base de crânio + Battle — par correto para o quadro descrito.',
            'Marcar C.',
            'Fixação: liquor pelo ouvido + retroauricular = Battle.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Base de crânio — decore',
          meta: genericoSlideMeta,
          content: 'SINAIS DE FRATURA DE BASE',
          rows: BASE_CRANIO_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Sinal de Frank associa-se a fratura etmoide — não explica equimose retroauricular com otorreia.',
      B: 'Cullen é equimose periumbilical; zigomático é face média — topografia distinta do retroauricular.',
      D: 'Jobert é sinal de pneumoperitônio abdominal — sem relação com TCE e otorreia.',
      E: 'Homans é sinal de trombose venosa profunda — membro inferior, não base de crânio.',
    },
  },
  'ibfc-enfermagem-urgencias-e-emergencias-1777103988389-1': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Picada de escorpião — lavar com água e sabão + procurar atendimento médico imediato',
      roi_error: 'escorpiao_lavar_nao_espremer',
      cluster: 'Animal peçonhento — primeiros socorros escorpião',
      danger_footer: 'Gabarito B — lavar e encaminhar',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Escorpião — conduta inicial',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Risco',
              detail: 'Picada escorpiônica pode evoluir para gravidade — agir rápido.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Higiene local',
              detail: 'Lavar o local com água e sabão — remove sujidade sem espremer.',
              icon: 'Droplets',
            },
            {
              label: 'Encaminhamento',
              detail: 'Procurar atendimento médico — observação e soroterapia se indicada.',
              icon: 'Ambulance',
            },
            {
              label: '× Manipular',
              detail: 'Espremer ou garrotear espalha veneno e isquemia local — proibido.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca combina espremer + garrote na mesma alternativa.',
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
            'Picada de escorpião — cuidados imediatos corretos?',
            'A espremer até sangrar — dissemina toxina; eliminar.',
            'C garrotear o local — isquemia sem benefício; eliminar.',
            'D espremer e garrotear — dupla conduta errada; eliminar.',
            'B lavar com água e sabão + atendimento médico — protocolo de primeiros socorros.',
            'Marcar B.',
            'Fixação: lavar · não espremer · não garrotear · encaminhar.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Escorpião — decore',
          meta: genericoSlideMeta,
          content: 'ACIDENTE ESCORPIÔNICO',
          rows: ESCORPIAO_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Espremer o local propicia liberação e difusão do veneno — conduta contraindicada.',
      C: 'Garrote ou torniquete no membro não neutraliza escorpionismo e agrava perfusão local.',
      D: 'Combinar espremer com garrote soma dois erros clássicos de prova em acidentes peçonhentos.',
    },
  },
  'icece-enfermagem-outros-temas-de-enfermagem-1780001440222-3': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Receptor O negativo — somente sangue O negativo (doador universal ≠ receptor universal)',
      roi_error: 'receptor_o_negativo_compatibilidade',
      cluster: 'HDA grave — transfusão emergencial tipo O−',
      danger_footer: 'Gabarito B — apenas O negativo',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Transfusão — O negativo',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'HDA grave com indicação de transfusão imediata — tipagem O negativo.',
              icon: 'Target',
            },
            {
              label: 'Receptor O−',
              detail: 'Possui anti-A e anti-B — só pode receber hemácias O negativas.',
              icon: 'Droplets',
            },
            {
              label: 'Urgência',
              detail: 'Hematemese · palidez · taquicardia — repor volume com tipo seguro.',
              icon: 'Activity',
            },
            {
              label: '× O positivo',
              detail: 'Rh+ inaceitável para receptor Rh− em emergência sem reserva compatível.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Confundir doador universal (O−) com receptor universal (AB).',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'O− recebe só O−',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Paciente O negativo em HDA — qual sangue pode receber com segurança?',
            'A inclui O positivo — incompatibilidade Rh; eliminar.',
            'C AB negativo como doador universal — conceito invertido; eliminar.',
            'D qualquer tipo com crossmatch — ABO/Rh prevalece; eliminar.',
            'B somente O negativo — única opção segura para receptor O−.',
            'Marcar B.',
            'Fixação: O− = receptor restrito · O− = doador universal.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Compatibilidade — decore',
          meta: genericoSlideMeta,
          content: 'RECEPTOR O NEGATIVO',
          rows: TRANSFUSAO_O_NEGATIVO,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'O positivo e outros tipos ABO violam anticorpos do receptor O− — risco hemolítico.',
      C: 'AB negativo é receptor universal, não doador; O− é o doador universal do sistema.',
      D: 'Prova cruzada não autoriza transfundir tipo incompatível — regra ABO/Rh é mandatória.',
    },
  },
  'idecan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1778712270872-4': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Primeiros socorros escolares — capacitar equipe da escola + promoção e prevenção de acidentes',
      roi_error: 'primeiros_socorros_escola_capacitacao',
      cluster: 'Saúde escolar — primeiros socorros e prevenção',
      danger_footer: 'Gabarito C — capacitação ampla na escola',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Primeiros socorros — escola',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Definição',
              detail:
                'Condutas iniciais por qualquer cuidador até equipe qualificada — preservar funções vitais.',
              icon: 'Heart',
            },
            {
              label: 'Escola',
              detail: 'Ambiente onde crianças passam longas jornadas — risco de acidentes.',
              icon: 'School',
            },
            {
              label: 'Capacitação',
              detail: 'Pessoas treinadas para atendimento imediato aos alunos.',
              icon: 'Users',
            },
            {
              label: 'Promoção',
              detail: 'Medidas de prevenção de acidentes e educação em saúde no âmbito escolar.',
              icon: 'Shield',
            },
            {
              label: 'Pegadinha',
              detail: 'Restringir a “somente professores” ou negar papel da escola.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Primeiros socorros — afirmativa correta sobre o tema?',
            'A só professores capacitados — exclusão da equipe escolar; eliminar.',
            'B escola rara de acidentes — epidemiologia falsa; eliminar.',
            'D deficiência e lesões graves — dado parcial, não responde ao comando; eliminar.',
            'C pessoas capacitadas + promoção/prevenção escolar — integra PS e saúde coletiva.',
            'Marcar C.',
            'Fixação: escola capacita · previne · atende até o SAMU.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'PS escolar — decore',
          meta: genericoSlideMeta,
          content: 'SAÚDE ESCOLAR',
          rows: PS_ESCOLA_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Primeiros socorros não se restringem aos professores — toda equipe escolar pode ser capacitada.',
      B: 'A escola é cenário frequente de acidentes na infância — não é ambiente raro.',
      D: 'Risco em deficiência é verdade parcial, mas não responde à definição e estratégia de PS escolar.',
    },
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712392541-4': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Ingestão de água sanitária — pequenas quantidades de água, não induzir vômito, encaminhar urgente',
      roi_error: 'agua_sanitaria_nao_vomitar',
      cluster: 'Intoxicação — hipoclorito ingestão acidental',
      danger_footer: 'Gabarito A — diluir e encaminhar',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Água sanitária — ingestão',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Agente',
              detail: 'Hipoclorito de sódio — irritante corrosivo de mucosas digestivas.',
              icon: 'FlaskConical',
            },
            {
              label: 'Diluição',
              detail: 'Oferecer água em pequenas quantidades — atenuar irritação local.',
              icon: 'Droplets',
            },
            {
              label: 'Não vomitar',
              detail: 'Evitar indução de êmese — reexposição e nova lesão esofágica.',
              icon: 'Ban',
            },
            {
              label: 'Encaminhar',
              detail: 'Avaliação médica urgente após medidas iniciais de primeiros socorros.',
              icon: 'Ambulance',
            },
            {
              label: 'Pegadinha',
              detail: 'Provocar vômito · neutralizar caseiro · lavagem invasiva sem indicação.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Ingestão acidental de água sanitária — conduta imediata?',
            'B êmese + alcalinizante oral — agrava lesão; eliminar.',
            'C adiar hidratação + endoscopia sem avaliação — sequência errada; eliminar.',
            'D jejum prolongado + carvão — sem indicação rotineira; eliminar.',
            'E lavagem gástrica + ácido acético — neutralização perigosa; eliminar.',
            'A água em pequenas quantidades · sem vômito · encaminhar urgente.',
            'Marcar A.',
            'Fixação: diluir · não vomitar · não neutralizar · médico.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Hipoclorito — decore',
          meta: genericoSlideMeta,
          content: 'INGESTÃO ÁGUA SANITÁRIA',
          rows: AGUA_SANITARIA_PS,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — emese neutralizar jejum carvao lavagem invasiva',
          items: [
            {
              label: 'Letra B — êmese e alcalinizante',
              detail: 'Provocar vômito e neutralizar oralmente — reexpõe mucosa ao corrosivo.',
              correct:
                'Induzir vômito e neutralizar com álcali oral reexpõe mucosa ao corrosivo — contraindicado.',
            },
            {
              label: 'Letra C — adiar hidratação',
              detail: 'Postergar água e encaminhar direto à endoscopia sem avaliação clínica.',
              correct: 'Adiar hidratação e encaminhar direto à endoscopia ignora estabilização inicial.',
            },
            {
              label: 'Letra D — jejum e carvão',
              detail: 'Jejum absoluto prolongado com carvão ativado de rotina.',
              correct: 'Jejum prolongado e carvão não são rotina imediata em corrosivo ingestão.',
            },
            {
              label: 'Letra E — lavagem e ácido',
              detail: 'Lavagem gástrica invasiva com ácido para neutralizar hipoclorito.',
              correct:
                'Lavagem gástrica invasiva e ácido acético podem agravar perfuração e reação exotérmica.',
            },
          ],
          footer_rule: 'Gabarito A — diluir e encaminhar',
        },
      ],
    },
    danger: {},
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712392541-7': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'PEP HIV — TDF/3TC + dolutegravir na janela protocolar; fonte desconhecida não contraindica; seguimento sorológico',
      roi_error: 'pep_agulha_fonte_desconhecida',
      cluster: 'Exposição ocupacional — PEP HIV agulha',
      danger_footer: 'Gabarito A — PEP completa',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'PEP — agulha contaminada',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Exposição',
              detail: 'Acidente percutâneo — sangue de paciente com HIV desconhecido.',
              icon: 'Syringe',
            },
            {
              label: 'Tempo',
              detail: 'Iniciar PEP o quanto antes — dentro da janela protocolar pós-exposição.',
              icon: 'Clock',
            },
            {
              label: 'Esquema',
              detail: 'Tenofovir/lamivudina + dolutegravir — curso completo conforme protocolo vigente.',
              icon: 'Pill',
            },
            {
              label: 'Seguimento',
              detail: 'Checar vacina hepatite B · sorologias seriadas no seguimento.',
              icon: 'Calendar',
            },
            {
              label: 'Pegadinha',
              detail: 'Aguardar HIV da fonte · esquema obsoleto · interromper se TR negativo.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Agulha com sangue — sorologia HIV da fonte desconhecida. Conduta inicial?',
            'B PEP só se fonte HIV+ confirmado — atrasa profilaxia; eliminar.',
            'C esquema obsoleto fora da janela — drogas e duração erradas; eliminar.',
            'D imunoglobulina anti-HIV + AZT — confunde hepatite B e esquema antigo; eliminar.',
            'E interromper PEP se TR do exposto negativo — não suspende indicação; eliminar.',
            'A TDF/3TC + dolutegravir na janela · curso completo · HBV · sorologias seriadas.',
            'Marcar A.',
            'Fixação: fonte desconhecida = PEP · curso completo · seguimento.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'PEP HIV — decore',
          meta: genericoSlideMeta,
          content: 'PROFILAXIA PÓS-EXPOSIÇÃO',
          rows: PEP_HIV_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — aguardar fonte esquema obsoleto interromper pep',
          items: [
            {
              label: 'Letra B — aguardar HIV da fonte',
              detail: 'Instituir PEP somente após confirmar HIV positivo na fonte.',
              correct:
                'Sorologia desconhecida da fonte não contraindica PEP — iniciar sem aguardar confirmação.',
            },
            {
              label: 'Letra C — esquema obsoleto',
              detail: 'Lopinavir/ritonavir com efavirenz fora da janela por curto prazo.',
              correct:
                'Esquema com lopinavir/ritonavir e efavirenz por curto prazo não segue protocolo atual de PEP.',
            },
            {
              label: 'Letra D — imunoglobulina anti-HIV',
              detail: 'Imunoglobulina anti-HIV com AZT para não vacinados de hepatite B.',
              correct:
                'Imunoglobulina anti-HIV não existe; HBV usa imunoglobulina específica — mistura de conceitos.',
            },
            {
              label: 'Letra E — interromper PEP',
              detail: 'Suspender PEP se teste rápido inicial do exposto for não reagente.',
              correct:
                'Teste rápido negativo no exposto não cancela PEP indicada pela exposição de risco.',
            },
          ],
          footer_rule: 'Gabarito A — PEP completa',
        },
      ],
    },
    danger: {},
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712400677-2': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Sigla AVE — avaliação da resposta ocular, verbal e motora (domínios da escala de consciência)',
      roi_error: 'ave_glasgow_tres_dominios',
      cluster: 'Politrauma — definição AVE (Glasgow)',
      danger_footer: 'Gabarito D — ocular verbal motora',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'AVE — três respostas',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Contexto',
              detail: 'Avaliação neurológica no politrauma — nível de consciência e lesão neurológica.',
              icon: 'Brain',
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
              detail: 'Resposta motora — obedece a extensão anormal.',
              icon: 'Activity',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca inventa ventilação · dor · agilidade · aparência — não são domínios AVE.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'AVE = O + V + M',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Politrauma — o que significa AVE na avaliação neurológica?',
            'A ventilação · exaustão · circulação — confunde com ABC; eliminar.',
            'B dor · percepção · movimento — escala de dor, não consciência; eliminar.',
            'C agilidade · velocidade · eficiência — capacidade funcional futura; eliminar.',
            'E aparência · vibração · elasticidade — termos físicos sem sentido clínico; eliminar.',
            'D resposta ocular · verbal · motora — define nível de consciência.',
            'Marcar D.',
            'Fixação: AVE alinha ocular-verbal-motora da escala de Glasgow.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Glasgow — decore',
          meta: genericoSlideMeta,
          content: 'DOMÍNIOS DE CONSCIÊNCIA',
          rows: glasgowDomainsRows([
            { label: 'AVE', value: 'Avaliação resposta Ocular · Verbal · Motora', badge: 'hot' },
          ]),
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — ventilacao dor agilidade aparencia dominios inventados',
          items: [
            {
              label: 'Letra A — ventilacao exaustao circulacao',
              detail: 'Confunde avaliação primária respiratória com domínios neurológicos.',
              correct:
                'Ventilação e circulação pertencem ao ABCDE primário — não definem a sigla AVE neurológica.',
            },
            {
              label: 'Letra B — dor percepcao movimento',
              detail: 'Mistura escala de dor com avaliação de consciência.',
              correct:
                'Dor e percepção descrevem escala analgésica — não os três domínios de consciência.',
            },
            {
              label: 'Letra C — agilidade velocidade eficiencia',
              detail: 'Descreve capacidade funcional futura, não resposta neurológica aguda.',
              correct:
                'Agilidade e eficiência referem-se a reabilitação — não à avaliação aguda neurológica.',
            },
            {
              label: 'Letra E — aparencia vibracao elasticidade',
              detail: 'Termos físicos sem relação com escala de Glasgow.',
              correct: 'Aparência e elasticidade são distratores sem base na escala de Glasgow.',
            },
          ],
          footer_rule: 'Gabarito D — ocular verbal motora',
        },
      ],
    },
    danger: {},
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712400677-3': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Gestão de risco de desastres — prevenção inclui fortalecer estruturas de saúde antes do evento',
      roi_error: 'desastre_prevencao_estruturas',
      cluster: 'Desastres — medida de prevenção (não resposta)',
      danger_footer: 'Gabarito C — estruturas resilientes',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Desastres — prevenção',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Gestão de risco',
              detail: 'Ciclo: prevenção · mitigação · preparação · resposta · recuperação.',
              icon: 'Layers',
            },
            {
              label: 'Prevenção',
              detail: 'Ações antes do evento — reduzir vulnerabilidade estrutural.',
              icon: 'Shield',
            },
            {
              label: 'Estruturas',
              detail: 'Fortalecer unidades de saúde para resistir a desastres futuros.',
              icon: 'Building2',
            },
            {
              label: '× Resposta',
              detail: 'Busca · resgate · notificação pós-evento — fase posterior.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Confundir evacuação (preparação) com prevenção estrutural pedida.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Gestão de risco de desastres — medida de prevenção (antes do evento)?',
            'A busca e resgate após desastre — resposta, não prevenção; eliminar.',
            'B plano de contingência/evacuação — preparação/mitigação, não enunciado da letra C; eliminar.',
            'D campanhas de higiene — promoção geral, não gestão de desastre; eliminar.',
            'E notificar após ocorrência — vigilância pós-evento; eliminar.',
            'C fortalecer estruturas de saúde — prevenção estrutural antecipada.',
            'Marcar C.',
            'Fixação: prevenção = antes · resposta = depois.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Desastres — fases',
          meta: genericoSlideMeta,
          content: 'GESTÃO DE RISCO',
          rows: DESASTRE_FASES,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — evacuacao preparacao prevencao estrutural resposta',
          items: [
            {
              label: 'Letra A — busca e resgate',
              detail: 'Operações de busca e resgate após o desastre já ocorrido.',
              correct: 'Busca e resgate ocorre na fase de resposta imediata — após o desastre, não como prevenção.',
            },
            {
              label: 'Letra B — plano de evacuacao',
              detail: 'Contingência para evacuação — preparação, não prevenção estrutural pedida.',
              correct:
                'Plano de evacuação é preparação/mitigação — o gabarito pede prevenção estrutural em saúde.',
            },
            {
              label: 'Letra D — campanhas de higiene',
              detail: 'Educação em higiene genérica — não gestão de risco de desastres.',
              correct:
                'Campanhas de higiene são promoção à saúde geral — não medida específica de gestão de desastres.',
            },
            {
              label: 'Letra E — notificar apos evento',
              detail: 'Notificação após ocorrência — vigilância pós-evento.',
              correct: 'Notificação pós-evento é vigilância/resposta — não ação preventiva antecipada.',
            },
          ],
          footer_rule: 'Gabarito C — estruturas resilientes',
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
    ok++;
    console.log(`[handcraft:urgencias-g37] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g37] total=${ok}`);
}

main();
