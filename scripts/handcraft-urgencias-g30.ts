#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g30 (8 slugs · 1º lote urgencias_generico).
 * Inferência por enunciado: trauma ABC + fratura exposta → urgencias_xabcde_trauma.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  angioedemaRows,
  colinergicaRows,
  finalizeSlides as finalizeGenerico,
  metaBase as metaGenerico,
  samuPapeisRows,
  slideMeta as genericoSlideMeta,
  urgenciaPrioridadeRows,
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

const LOTE = 'urgencias-g30';
const REVIEWER = 'handcraft-urgencias-g30';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const FRATURA_FOOTER = 'Cobrir estéril úmido + imobilizar';

type HandcraftEntry =
  | { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> }
  | { branch: 'trauma'; pack: TraumaPack; danger: Record<string, string> };

const SPECS: Record<string, HandcraftEntry> = {
  'amauc-enfermagem-processo-de-enfermagem-1780001517858-1': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Intoxicação por organofosforados — síndrome colinérgica muscarínica (qualitativa)',
      roi_error: 'colinergica_vs_anticolinergica',
      cluster: 'Organofosforados — sinais muscarínicos',
      danger_footer: 'Gabarito E — miose · sialorreia · broncorreia',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Organofosforados — colinérgica',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Comando',
              detail:
                'Organofosforado inibe acetilcolinesterase → crise colinérgica. Assinale sinais muscarínicos a monitorar.',
              icon: 'Target',
            },
            {
              label: 'Mecanismo',
              detail: 'Acúmulo de acetilcolina nas fendas parassimpáticas — excesso colinérgico.',
              icon: 'Activity',
            },
            {
              label: 'Muscarínico',
              detail: 'Miose · sialorreia · broncorreia · lacrimejamento · bradicardia.',
              icon: 'Droplets',
            },
            {
              label: 'Nicotínico',
              detail: 'Fasciculações e fraqueza muscular — também presente, mas o comando pede muscarínico.',
              icon: 'Zap',
            },
            {
              label: 'Pegadinha',
              detail: 'A banca troca por perfil anticolinérgico (seco, midríase, taquicardia) ou outras síndromes.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Colinérgico = úmido + miose',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Ancorar: organofosforado → inibe acetilcolinesterase → crise colinérgica.',
            'Pergunta: quais sinais muscarínicos (parassimpático excessivo)?',
            'A midríase/boca seca/taquicardia → perfil anticolinérgico oposto; eliminar.',
            'B hipertensão/tremor/dopamina → não descreve muscarínico; eliminar.',
            'C hipertermia maligna/rabdomiólise → outra síndrome; eliminar.',
            'D pele seca/alucinação/anticolinérgico → oposto da colinérgica; eliminar.',
            'E miose · sialorreia · broncorreia · lacrimejamento · bradicardia → muscarínico clássico.',
            'Marcar E.',
            'Fixação: colinérgico = secreções + miose; anticolinérgico = seco + midríase.',
          ],
          footer_rule: 'Muscarínico = DUMBBELSS',
        },
        {
          type: 'golden_rule',
          slide_title: 'Colinérgica × anticolinérgica',
          meta: genericoSlideMeta,
          content: 'INTOXICAÇÃO — DECORE QUALITATIVO',
          rows: colinergicaRows(),
          footer_rule: 'Sem doses inventadas — foque sinais',
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Midríase, boca seca e taquicardia são anticolinérgicos — opostos à colinérgica do organofosforado.',
      B: 'Hipertensão com tremor por dopamina não descreve muscarínico parassimpático da crise colinérgica.',
      C: 'Hipertermia maligna com rigidez é síndrome anestésica — não o quadro muscarínico pedido.',
      D: 'Pele seca e alucinações são anticolinérgicos (ex.: tricíclicos) — invertem o perfil colinérgico.',
    },
  },
  'amauc-enfermagem-processo-de-enfermagem-1780002441285-5': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Priorização em emergência — gravidade e avaliação sistematizada (não ordem de chegada)',
      roi_error: 'priorizacao_ordem_chegada',
      cluster: 'I/II/III — priorização no PS',
      danger_footer: 'Gabarito E — I e II corretas',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Emergência — priorização',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Múltiplos pacientes simultâneos — técnico colabora na definição de prioridades.',
              icon: 'Users',
            },
            {
              label: 'Proposição I',
              detail: 'Priorizar pela gravidade e risco imediato à vida — correta.',
              icon: 'CheckCircle',
            },
            {
              label: 'Proposição II',
              detail: 'Avaliação rápida e sistematizada apoia decisão segura — correta.',
              icon: 'Activity',
            },
            {
              label: 'Proposição III',
              detail: 'Ordem de chegada como único critério — falsa em emergência.',
              icon: 'XCircle',
            },
            {
              label: 'Pegadinha',
              detail: 'A banca inclui III (ordem de chegada única) em combinações que parecem plausíveis.',
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
            'Formato I/II/III — julgar cada proposição antes da combinação.',
            'I — gravidade e risco à vida na priorização: verdadeira.',
            'II — avaliação rápida e sistematizada: verdadeira.',
            'III — só ordem de chegada: falsa (triagem por gravidade).',
            'Eliminar combinações que incluem III (B, C, D).',
            'Eliminar A — só I, esquece II verdadeira.',
            'Resta E — I e II corretas.',
            'Marcar E.',
            'Fixação: emergência prioriza quem morre primeiro, não quem chegou primeiro.',
          ],
          footer_rule: 'Gravidade > ordem de chegada',
        },
        {
          type: 'golden_rule',
          slide_title: 'Priorização — decore',
          meta: genericoSlideMeta,
          content: 'URGÊNCIA — PRINCÍPIOS',
          rows: urgenciaPrioridadeRows(),
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Só I está correta — ignora a II sobre avaliação sistematizada, também verdadeira.',
      B: 'Inclui proposição III (ordem de chegada única) — pegadinha central do enunciado.',
      C: 'Aceita III falsa e exclui I — inverte a priorização por gravidade.',
      D: 'Só III como correta — ordem de chegada isolada não define prioridade emergencial.',
    },
  },
  'amauc-enfermagem-processo-de-enfermagem-1780002549800-3': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Primeiros socorros — avaliação primária ABC (consciência, respiração, circulação)',
      roi_error: 'abc_primario_vs_lesao_visivel',
      cluster: 'Vítima de acidente — funções vitais primeiro',
      danger_footer: 'Gabarito B — consciência · respiração · circulação',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Emergência — avaliação primária',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Atendimento inicial à vítima de acidente — avaliação primária e primeiros socorros.',
              icon: 'Target',
            },
            {
              label: 'ABC',
              detail: 'Consciência · respiração · circulação — funções vitais antes de lesões visíveis.',
              icon: 'HeartPulse',
            },
            {
              label: 'Segurança',
              detail: 'Cena segura antes de abordar — mesmo com sinais vitais aparentemente preservados.',
              icon: 'Shield',
            },
            {
              label: 'Imobilização',
              detail: 'Não movimentar sem necessidade — suspeita de lesão na vítima de acidente.',
              icon: 'Bone',
            },
            {
              label: 'Pegadinha',
              detail: 'Focar só lesão visível ou oferecer líquido universal seduz fora do protocolo.',
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
            'Cenário: vítima de acidente — qual princípio da avaliação inicial?',
            'Prioridade: funções vitais (consciência, respiração, circulação) antes de lesões visíveis.',
            'A movimentar sempre → ignora imobilização e segurança; eliminar.',
            'C líquidos para todos conscientes → não é conduta universal; eliminar.',
            'D dispensar segurança do local → incorreto; eliminar.',
            'E só lesões visíveis → adia funções vitais; eliminar.',
            'B prioriza consciência, respiração e circulação — alinha avaliação primária.',
            'Marcar B.',
            'Fixação: funções vitais vêm antes do curativo da ferida visível.',
          ],
          footer_rule: 'ABC antes de lesão visível',
        },
        {
          type: 'golden_rule',
          slide_title: 'Avaliação primária',
          meta: genericoSlideMeta,
          content: 'PRIMEIROS SOCORROS — ABC',
          rows: urgenciaPrioridadeRows([
            { label: '1º passo', value: 'Consciência → respiração → circulação', badge: 'hot' },
            { label: 'Cena', value: 'Segurança do local sempre', badge: 'warn' },
            { label: '× Lesão visível', value: 'Não antecede funções vitais', badge: 'warn' },
          ]),
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Movimentar imediatamente ignora imobilização — pegadinha clássica em vítima de acidente.',
      C: 'Oferta universal de líquidos não é conduta de primeiros socorros para toda vítima consciente.',
      D: 'Segurança do local não pode ser dispensada — mesmo com sinais vitais aparentemente preservados.',
      E: 'Concentrar só em lesões visíveis adia avaliação de consciência, respiração e circulação.',
    },
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-8': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'SAMU 192 — médico regulador define destino hospitalar',
      roi_error: 'samu_papeis_destino',
      cluster: 'SAMU — autoridade técnica de regulação',
      danger_footer: 'Gabarito A — médico regulador',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'SAMU — regulação',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Quem tem autoridade técnica para decidir o destino hospitalar no SAMU 192?',
              icon: 'Target',
            },
            {
              label: 'Regulação médica',
              detail: 'Médico regulador assistente avalia gravidade e indica unidade adequada.',
              icon: 'Stethoscope',
            },
            {
              label: 'Equipe móvel',
              detail: 'Técnico/enfermeiro executam cuidados — não definem destino isoladamente.',
              icon: 'Ambulance',
            },
            {
              label: 'Condutor',
              detail: 'Opera o veículo com segurança — papel logístico, não clínico-regulatório.',
              icon: 'Car',
            },
            {
              label: 'Pegadinha',
              detail: 'Recepção hospitalar é administrativa — não regula pré-hospitalar.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Regulação = médico',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Pergunta: autoridade técnica sobre destino hospitalar no SAMU.',
            'B administrativo da recepção → função administrativa hospitalar; eliminar.',
            'C técnico socorrista na viatura → executa, não regula destino; eliminar.',
            'D condutor socorrista → condução do veículo; eliminar.',
            'A médico regulador assistente → papel de regulação médica e destino.',
            'Marcar A.',
            'Fixação: no SAMU, destino é decisão médica de regulação.',
          ],
          footer_rule: 'Médico regulador → destino',
        },
        {
          type: 'golden_rule',
          slide_title: 'Papéis SAMU',
          meta: genericoSlideMeta,
          content: 'SAMU 192 — DECORE',
          rows: samuPapeisRows(),
          footer_rule: 'Regulação médica define destino',
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Administrativo da recepção não exerce regulação pré-hospitalar nem define destino clínico.',
      C: 'Técnico socorrista presta cuidados na cena — decisão de destino é do regulador médico.',
      D: 'Condutor opera o veículo — papel de transporte, não autoridade técnica de destino.',
    },
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780002834059-5': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Emergência — prioridade é segurança e manutenção da vida',
      roi_error: 'prioridade_vida_vs_burocracia',
      cluster: 'Conceito geral — prioridade do atendimento',
      danger_footer: 'Gabarito A — segurança e vida',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Prioridade em emergência',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Em situações de emergência, qual a prioridade do atendimento?',
              icon: 'Target',
            },
            {
              label: 'Vida',
              detail: 'Preservar e manter funções vitais — objetivo central do socorro.',
              icon: 'HeartPulse',
            },
            {
              label: 'Segurança',
              detail: 'Cena segura para equipe e vítima antes de condutas arriscadas.',
              icon: 'Shield',
            },
            {
              label: 'Pegadinha',
              detail: 'Formulários, eletivos e burocracia não são prioridade na emergência.',
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
            'Comando direto: prioridade em emergência.',
            'B preencher formulários → burocracia não precede estabilização; eliminar.',
            'C procedimentos eletivos → fora do contexto emergencial; eliminar.',
            'D aguardar avaliação administrativa → atrasa cuidado; eliminar.',
            'E encaminhar sem avaliação → abandona função vital; eliminar.',
            'A garantir segurança e manutenção da vida — núcleo do atendimento emergencial.',
            'Marcar A.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: genericoSlideMeta,
          content: 'EMERGÊNCIA — NÚCLEO',
          rows: urgenciaPrioridadeRows([
            { label: 'Resposta desta prova', value: 'Segurança + manutenção da vida', badge: 'hot' },
          ]),
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Preencher formulários é registro posterior — não é prioridade frente a risco imediato à vida.',
      C: 'Procedimentos eletivos pertencem ao ambulatório — não à emergência aguda.',
      D: 'Avaliação administrativa não substitui estabilização clínica imediata.',
      E: 'Encaminhar sem avaliar ignora o dever de identificar gravidade e intervir.',
    },
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780003137298-6': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Urgência — atendimento imediato e organizado',
      roi_error: 'atendimento_imediato_vs_postergar',
      cluster: 'Conceito geral — ritmo do atendimento',
      danger_footer: 'Gabarito B — imediato e organizado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Ritmo do atendimento',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Em situações de urgência, o atendimento deve ser:',
              icon: 'Target',
            },
            {
              label: 'Imediato',
              detail: 'Sem postergar cuidados que reduzem risco de morte ou sequela.',
              icon: 'Zap',
            },
            {
              label: 'Organizado',
              detail: 'Sequência lógica e comunicação com equipe — rapidez sem improviso caótico.',
              icon: 'ListOrdered',
            },
            {
              label: 'Pegadinha',
              detail: 'Postergar, restringir ao médico ou omitir registro são distorções da prática.',
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
            'Comando: como deve ser o atendimento em urgência?',
            'A postergado → contradiz urgência; eliminar.',
            'C apenas pelo médico → técnico integra cuidados iniciais; eliminar.',
            'D só orientação telefônica → insuficiente quando presencial é necessário; eliminar.',
            'E sem registro → documentação faz parte da segurança do cuidado; eliminar.',
            'B imediato e organizado — síntese do atendimento emergencial.',
            'Marcar B.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: genericoSlideMeta,
          content: 'URGÊNCIA — RITMO',
          rows: [
            { label: 'Imediato', value: 'Intervir sem atrasar o necessário', badge: 'hot' },
            { label: 'Organizado', value: 'Sequência e equipe — evitar caos', badge: 'ok' },
            { label: '× Postergar', value: 'Incompatível com urgência', badge: 'warn' },
            { label: 'Técnico', value: 'Participa do cuidado inicial — não só médico', badge: 'info' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Postergar atendimento contradiz o conceito de urgência com risco imediato.',
      C: 'Técnico de enfermagem atua em cuidados iniciais — não é exclusividade médica.',
      D: 'Orientação telefônica não substitui avaliação presencial quando indicada.',
      E: 'Registro/documentação integra segurança — atendimento sem registro não é padrão.',
    },
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780006444165-0': {
    branch: 'trauma',
    pack: {
      family: 'protocolo',
      guideline: 'Fratura exposta — curativo estéril úmido + imobilização (sem redução no local)',
      roi_error: 'fratura_exposta_cobertura_imobilizacao',
      cluster: 'Fratura exposta de fêmur — conduta inicial',
      danger_footer: 'Gabarito E — estéril úmido + imobilizar',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Fratura exposta — PS',
          meta: traumaSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Fratura exposta de fêmur — medida técnica imediata essencial para não agravar.',
              icon: 'Target',
            },
            {
              label: 'Proteger',
              detail: 'Cobrir com curativo estéril úmido — mantém tecido e reduz contaminação.',
              icon: 'Bandage',
            },
            {
              label: 'Imobilizar',
              detail: 'Imobilizar a extremidade — limita movimento e dor do foco fraturário.',
              icon: 'Bone',
            },
            {
              label: 'Não fazer',
              detail: 'Reduzir osso, lavar profundamente ou gelo direto no osso exposto no local.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Pano limpo úmido sem esterilidade e sem imobilização é incompleto.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: FRATURA_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: traumaSlideMeta,
          steps: [
            'Cenário: fratura exposta de fêmur — conduta imediata do técnico.',
            'A redução/realinhamento no local → contraindicado na fratura exposta; eliminar.',
            'B limpeza profunda com antisséptico → não é 1ª medida essencial; eliminar.',
            'C gelo direto no osso exposto → inadequado; eliminar.',
            'D pano limpo úmido sem esterilidade e sem imobilizar → incompleto; eliminar.',
            'E curativo estéril úmido + imobilizar perna — protege e estabiliza.',
            'Marcar E.',
            'Fixação: exposta = cobrir estéril úmido + imobilizar — não reduzir no campo.',
          ],
          footer_rule: FRATURA_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Fratura exposta',
          meta: traumaSlideMeta,
          content: 'CONDUTA INICIAL',
          rows: [
            { label: 'Fazer', value: 'Curativo estéril úmido + imobilização', badge: 'hot' },
            { label: 'Não fazer', value: 'Reduzir osso no local', badge: 'warn' },
            { label: 'Não fazer', value: 'Gelo direto sobre osso exposto', badge: 'warn' },
            { label: 'Não fazer', value: 'Limpeza profunda como 1ª prioridade', badge: 'info' },
            { label: 'Objetivo', value: 'Prevenir agravamento até equipe definitiva', badge: 'ok' },
          ],
          footer_rule: FRATURA_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Redução e realinhamento no local aumentam risco de infecção e lesão neurovascular.',
      B: 'Limpeza profunda imediata não é a medida essencial — proteção estéril e imobilização vêm primeiro.',
      C: 'Gelo direto sobre osso exposto é inadequado e pode piorar lesão tecidual.',
      D: 'Pano limpo úmido sem esterilidade e sem imobilização deixa a fratura desprotegida e instável.',
    },
  },
  'avancasp-enfermagem-semiologia-em-enfermagem-1779563480978-1': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Angioedema — edema agudo profundo indolor em face, lábios, laringe e extremidades',
      roi_error: 'angioedema_vs_urticaria_rinite',
      cluster: 'Semiologia — definição de angioedema',
      danger_footer: 'Gabarito A — edema profundo indolor',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Angioedema — definição',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Qual descrição corresponde ao sintoma angioedema em urgência/emergência?',
              icon: 'Target',
            },
            {
              label: 'Angioedema',
              detail: 'Inchaço agudo, indolor, dérmico/subcutâneo/submucoso — face, lábios, laringe, mãos, pés.',
              icon: 'Activity',
            },
            {
              label: 'Urgência',
              detail: 'Edema de laringe compromete via aérea — reconhecer cedo.',
              icon: 'AlertTriangle',
            },
            {
              label: '× Urticária',
              detail: 'Lesões papulares pruriginosas superficiais — não é angioedema.',
              icon: 'XCircle',
            },
            {
              label: 'Pegadinha',
              detail: 'Rinite alérgica e prurido isolado descrevem outros quadros cutâneo-respiratórios.',
              icon: 'Shield',
            },
          ],
          footer_rule: 'Profundo · indolor · submucoso',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Comando: definir angioedema entre descrições semiológicas.',
            'B vesículas avermelhadas disseminadas → exantema vesicular, não angioedema; eliminar.',
            'C coceira genérica de erupções → prurido de urticária; eliminar.',
            'D rinite com rinorreia aquosa → mucosa nasal, não edema profundo; eliminar.',
            'E pápulas irregulares com halo → urticária; eliminar.',
            'A inchaço agudo indolor subcutâneo/submucoso em face e laringe → angioedema.',
            'Marcar A.',
            'Fixação: angioedema é profundo e indolor; urticária é superficial e pruriginosa.',
          ],
          footer_rule: 'Angioedema ≠ urticária',
        },
        {
          type: 'golden_rule',
          slide_title: 'Edemas — diferenciar',
          meta: genericoSlideMeta,
          content: 'SEMIOLOGIA — DECORE',
          rows: angioedemaRows(),
          footer_rule: 'Laringe = via aérea',
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Vesículas avermelhadas sugerem exantema vesicular — não edema subcutâneo profundo do angioedema.',
      C: 'Prurido predominante descreve urticária superficial — angioedema é tipicamente indolor.',
      D: 'Inflamação de mucosa nasal com secreção aquosa é rinite alérgica — não angioedema.',
      E: 'Pápulas com margem eritematosa e centro pálido são urticária — lesão superficial pruriginosa.',
    },
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;

  for (const [slug, entry] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8'));

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
    console.log(`[handcraft:urgencias-g30] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g30] total=${ok}`);
}

main();
