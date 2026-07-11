#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g38 (8 slugs · 9º lote urgencias_generico).
 * Inferência: fratura/imobilização + politrauma primário → trauma · VF PS → vf_protocolo · demais generico.
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

const LOTE = 'urgencias-g38';
const REVIEWER = 'handcraft-urgencias-g38';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const TRAUMA_FOOTER = 'Imobilizar sem reduzir · vigiar perfusão distal';
const VF_FOOTER = 'Julgar cada item antes da combinação';

/** Imobilização de fratura — primeiros socorros traumático. */
const IMOBILIZACAO_FRATURA = [
  { label: 'Talas', value: 'Prender com ataduras firmes — imobilizar acima e abaixo da fratura', badge: 'hot' },
  { label: 'Circulação', value: 'Apertar o suficiente sem comprometer perfusão distal', badge: 'ok' },
  { label: '× Reduzir', value: 'Recolocar osso no eixo no local — contraindicado', badge: 'warn' },
  { label: '× Forçar', value: 'Forçar membro desalinhado de volta — agrava lesão', badge: 'warn' },
  { label: '× Só articulação', value: 'Fixar só nas articulações sem estabilizar foco fraturário', badge: 'info' },
];

/** Peçonhentos — primeiros socorros (sem torniquete). */
const PECONHENTO_PS = [
  { label: 'Lavar', value: 'Água e sabão no local da picada', badge: 'hot' },
  { label: 'Encaminhar', value: 'Atendimento médico — observação e soroterapia se indicada', badge: 'ok' },
  { label: '× Torniquete', value: 'Garrote no membro — proibido em acidentes peçonhentos', badge: 'warn' },
  { label: '× Manipular', value: 'Furar · cortar · espremer · sucção — disseminam toxina', badge: 'warn' },
  { label: '× Caseiro', value: 'Folhas · café · terra no ferimento — risco de infecção', badge: 'info' },
];

/** Gestão de risco — fases de emergência em saúde pública. */
const GESTAO_RISCO_FASES = [
  { label: 'Manejo', value: 'Ações coordenadas e imediatas durante a emergência', badge: 'hot' },
  { label: 'Prevenção', value: 'Políticas educativas antes do evento — reduzir fatores de risco', badge: 'ok' },
  { label: 'Recuperação', value: 'Reabilitação e reconstrução pós-emergência', badge: 'info' },
  { label: 'Mitigação', value: 'Identificar ameaças e vulnerabilidades continuamente', badge: 'ok' },
  { label: 'Pegadinha', value: 'Confundir manejo (durante) com prevenção ou recuperação', badge: 'warn' },
];

/** SCO — comando unificado em crise. */
const SCO_OBJETIVOS = [
  { label: 'SCO', value: 'Sistema de Comando de Operações — estrutura de crise', badge: 'hot' },
  { label: 'Coordenação', value: 'Comando claro · atores integrados · resposta otimizada', badge: 'ok' },
  { label: '× Autonomia solta', value: 'Cada entidade age sem coordenação — oposto ao SCO', badge: 'warn' },
  { label: '× Independência', value: 'Órgãos isolados evitando sobreposição — fragmenta resposta', badge: 'warn' },
  { label: '× Só federal', value: 'Comunicação exclusiva federal — exclui estado e município', badge: 'info' },
];

/** Raiva pós-exposição — limpeza mecânica. */
const RAIVA_LIMPEZA = [
  { label: 'Limpeza', value: 'Água corrente abundante + sabão ou detergente no ferimento', badge: 'hot' },
  { label: 'Tempo', value: 'O quanto antes após a agressão — não adiar', badge: 'ok' },
  { label: 'Repetir', value: 'Reforçar lavagem na unidade de saúde — mesmo após intervalo', badge: 'ok' },
  { label: 'Objetivo', value: 'Reduzir carga viral no local da exposição', badge: 'info' },
  { label: '× Negligenciar', value: 'Adiar lavagem por tempo decorrido — erro grave', badge: 'warn' },
];

/** Hipoglicemia — sinais adrenérgicos sem limiar numérico. */
const HIPOGLICEMIA_QUALITATIVA = [
  { label: 'Adrenérgico', value: 'Sudorese · tremor · taquicardia · fome', badge: 'hot' },
  { label: 'Neuroglicopênico', value: 'Tontura · confusão · sonolência', badge: 'warn' },
  { label: '× Pele seca', value: 'Desidratação de hiperglicemia — perfil oposto', badge: 'warn' },
  { label: '× Poliúria', value: 'Aumento de sede e diurese — hiperglicemia', badge: 'info' },
  { label: 'Conduta', value: 'Oferecer carboidrato se consciente; acionar se rebaixado', badge: 'ok' },
];

type GenericoEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };
type TraumaEntry = { branch: 'trauma'; pack: TraumaPack; danger: Record<string, string> };
type VfEntry = { branch: 'vf_protocolo'; pack: VfPack; danger: Record<string, string> };

type HandcraftEntry = GenericoEntry | TraumaEntry | VfEntry;

const SPECS: Record<string, HandcraftEntry> = {
  'idecan-enfermagem-urgencias-e-emergencias-1778712400677-4': {
    branch: 'trauma',
    pack: {
      family: 'protocolo',
      guideline:
        'Fratura traumática — prender talas com ataduras firmes sem reduzir osso nem forçar realinhamento',
      roi_error: 'fratura_imobilizar_sem_reduzir',
      cluster: 'Emergência traumática — imobilização com talas',
      danger_footer: 'Gabarito C — talas firmes sem isquemia',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Fratura — imobilização',
          meta: traumaSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail:
                'Emergência traumática com ferimento e hemorragia — acalmar vítima e imobilizar fratura com segurança.',
              icon: 'Target',
            },
            {
              label: 'Talas e ataduras',
              detail: 'Prender firmemente para imobilizar — cuidado para não comprometer circulação distal.',
              icon: 'Bandage',
            },
            {
              label: '× Reduzir osso',
              detail: 'Recolocar fratura no eixo no local — manobra reservada ao ambiente hospitalar.',
              icon: 'Ban',
            },
            {
              label: '× Forçar membro',
              detail: 'Forçar retorno de membro desalinhado agrava lesão óssea e neurovascular.',
              icon: 'XCircle',
            },
            {
              label: 'Pegadinha',
              detail: 'Fixar só nas articulações sem estabilizar foco fraturário — incompleto.',
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
            'Emergência traumática — procedimento correto de imobilização?',
            'A fixar só articulações sem foco fraturário — imobilização incompleta; eliminar.',
            'B recolocar osso fraturado no eixo — redução no local contraindicada; eliminar.',
            'D forçar membro que não volta ao lugar — agrava lesão; eliminar.',
            'C prender talas com ataduras firmes — imobilizar sem isquemia distal.',
            'Marcar C.',
            'Fixação: imobilizar · não reduzir · vigiar perfusão.',
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Imobilização — decore',
          meta: traumaSlideMeta,
          content: 'FRATURA TRAUMÁTICA',
          rows: IMOBILIZACAO_FRATURA,
          footer_rule: TRAUMA_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Fixar apenas nas articulações sem estabilizar o foco fraturário deixa a área instável e incompleta.',
      B: 'Tentar recolocar o osso fraturado no local aumenta risco de lesão neurovascular e infecção.',
      D: 'Forçar o retorno de membro desalinhado agrava a fratura — imobilizar na posição encontrada.',
    },
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712400677-9': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'Politraumatismo — avaliação primária busca lesões com risco iminente à vida e trata imediatamente',
      roi_error: 'politrauma_avaliacao_primaria_risco_vida',
      cluster: 'Politrauma — exame primário e risco iminente',
      danger_footer: 'Gabarito A — Certo',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Politrauma — primário',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Politrauma',
              detail: 'Vítima com múltiplos traumas — atenção contínua do APH à alta.',
              icon: 'Users',
            },
            {
              label: 'Avaliação primária',
              detail: 'Exame físico rápido — identificar lesões com risco iminente à vida.',
              icon: 'Activity',
            },
            {
              label: 'Tratamento imediato',
              detail: 'Intervir na hora para restabelecer perfusão e estabilizar funções vitais.',
              icon: 'HeartPulse',
            },
            {
              label: 'Secundário',
              detail: 'Exame detalhado após estabilização primária — não confundir com primário.',
              icon: 'Search',
            },
            {
              label: 'Pegadinha — inverter fases',
              detail: 'Negar urgência do exame primário ou trocar ordem primário/secundário.',
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
            'Afirmativa: politrauma exige avaliação primária de lesões com risco iminente à vida + tratamento imediato.',
            'Exame primário rápido identifica ameaças imediatas — prioridade do trauma grave.',
            'Tratamento simultâneo à identificação — restabelecer perfusão e funções vitais.',
            'Afirmativa alinhada à avaliação primária sistematizada.',
            'Marcar A (Certo).',
            'Fixação: primário = vida em risco agora · secundário = depois.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Primário × secundário',
          meta: genericoSlideMeta,
          content: 'POLITRAUMA — AVALIAÇÃO',
          rows: [
            { label: 'Primário', value: 'Risco iminente à vida — tratar na hora', badge: 'hot' },
            { label: 'Secundário', value: 'Exame detalhado após estabilização', badge: 'ok' },
            { label: 'Objetivo', value: 'Reduzir mortalidade — agir ágil e eficaz', badge: 'ok' },
            { label: '× Só secundário', value: 'Detalhar lesões antes de estabilizar vida', badge: 'warn' },
            { label: 'Pegadinha', value: 'Negar continuidade do cuidado APH → alta', badge: 'info' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — negar primario politrauma',
          items: [
            {
              label: 'Errado — negar avaliação primária',
              detail: 'Marcar Errado nega o exame primário de risco iminente à vida.',
              correct:
                'A avaliação primária busca lesões com risco iminente à vida e trata imediatamente — afirmativa verdadeira.',
            },
            {
              label: 'Pegadinha — inverter primário/secundário',
              detail: 'Confundir exame detalhado (secundário) com estabilização imediata (primário).',
              correct:
                'Primário trata ameaças imediatas; secundário vem após estabilização — afirmativa descreve o primário.',
            },
          ],
          footer_rule: 'Gabarito A — Certo',
        },
      ],
    },
    danger: {
      B: 'Errado nega que a avaliação primária priorize lesões com risco iminente à vida no politraumatismo.',
    },
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712409051-0': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'Picada peçonhenta — lavar com água e sabão; proibido torniquete, espremer, cortar ou sucção',
      roi_error: 'pecohento_torniquete_errado',
      cluster: 'Certo ou errado — acidente peçonhento torniquete',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Peçonhentos — PS',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Afirmativa',
              detail:
                'Mistura lavagem correta com torniquete/garrote — torna a frase globalmente falsa.',
              icon: 'FileText',
            },
            {
              label: 'Lavar',
              detail: 'Água e sabão no local — medida inicial correta.',
              icon: 'Droplets',
            },
            {
              label: '× Torniquete',
              detail: 'Garrote no membro — conduta proibida em picadas de animais peçonhentos.',
              icon: 'Ban',
            },
            {
              label: '× Manipular ferida',
              detail: 'Furar · cortar · queimar · espremer · sucção — aumentam dano local.',
              icon: 'XCircle',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca embute conduta certa (lavar) com erro clássico (torniquete) na mesma frase.',
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
            'Picada peçonhenta — julgar afirmativa completa.',
            'Lavar com água e sabão — verdadeiro isoladamente.',
            'Fazer torniquete ou garrote — falso — proibido.',
            'Frase combina verdade + erro grave → afirmativa global falsa.',
            'Marcar B (Errado).',
            'Fixação: lavar sim · torniquete nunca.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Peçonhentos — decore',
          meta: genericoSlideMeta,
          content: 'ACIDENTE PEÇONHENTO',
          rows: PECONHENTO_PS,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — torniquete peconhento',
          items: [
            {
              label: 'Certo — aceitar torniquete',
              detail: 'Afirmativa inclui torniquete ou garrote — conduta proibida.',
              correct:
                'Torniquete em picada peçonhenta é contraindicado — a frase mistura lavagem correta com erro grave.',
            },
            {
              label: 'Pegadinha — lavar + torniquete',
              detail: 'Banca embute conduta certa (lavar) com erro clássico (garrote) na mesma frase.',
              correct:
                'Lavar com água e sabão é correto, mas torniquete invalida a afirmativa global — marcar Errado.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo valida torniquete na picada — conduta proibida que torna a afirmativa globalmente falsa.',
    },
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-0': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Manejo da emergência — ações coordenadas e imediatas durante o evento para minimizar impacto na saúde',
      roi_error: 'manejo_emergencia_saude_publica',
      cluster: 'Gestão de risco — manejo da emergência',
      danger_footer: 'Gabarito A — ações imediatas coordenadas',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Gestão de risco — manejo',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Gestão de risco',
              detail: 'Planejamento multidimensional para reduzir impacto de eventos adversos na população.',
              icon: 'Layers',
            },
            {
              label: 'Manejo',
              detail: 'Execução coordenada e imediata durante a emergência — proteger vidas afetadas.',
              icon: 'Zap',
            },
            {
              label: 'Prevenção',
              detail: 'Políticas educativas antes do evento — reduzir fatores de risco.',
              icon: 'Shield',
            },
            {
              label: 'Recuperação',
              detail: 'Reabilitação e reconstrução após a crise — fase posterior.',
              icon: 'Building2',
            },
            {
              label: 'Pegadinha — trocar fases',
              detail: 'Confundir manejo (durante) com prevenção, mitigação ou recuperação.',
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
            'Comando pede definição de manejo da emergência em saúde pública.',
            'B prevenção/educação — antes do evento; eliminar.',
            'C reabilitação pós-emergência — recuperação; eliminar.',
            'D identificar ameaças continuamente — mitigação/preparação; eliminar.',
            'A ações coordenadas e imediatas durante a emergência — manejo correto.',
            'Marcar A.',
            'Fixação: manejo = durante · prevenção = antes · recuperação = depois.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Fases — decore',
          meta: genericoSlideMeta,
          content: 'EMERGÊNCIA EM SAÚDE PÚBLICA',
          rows: GESTAO_RISCO_FASES,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Prevenção educativa ocorre antes do evento — não define manejo imediato da crise em curso.',
      C: 'Reabilitação pós-emergência é fase de recuperação — não manejo durante o evento.',
      D: 'Mitigação identifica ameaças futuras — distinta do manejo coordenado na emergência ativa.',
    },
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-1': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'SCO — estrutura clara de comando e coordenação integrada entre todos os atores na crise',
      roi_error: 'sco_coordenacao_integrada',
      cluster: 'SCO — Plano de Resposta Emergências Saúde Pública',
      danger_footer: 'Gabarito B — comando integrado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'SCO — objetivo',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'SCO',
              detail: 'Sistema de Comando de Operações — modelo gerencial do Plano de Resposta.',
              icon: 'Network',
            },
            {
              label: 'Coordenação',
              detail: 'Comando claro — todos os atores trabalham de forma integrada na crise.',
              icon: 'Users',
            },
            {
              label: '× Sem coordenação',
              detail: 'Autonomia de cada entidade sem articulação — fragmenta a resposta.',
              icon: 'Ban',
            },
            {
              label: '× Independência',
              detail: 'Cada órgão isolado evitando sobreposição — oposto à integração.',
              icon: 'XCircle',
            },
            {
              label: 'Pegadinha',
              detail: 'Comunicação só entre órgãos federais — exclui rede federativa.',
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
            'SCO em emergência de saúde pública — objetivo correto?',
            'A ações sem coordenação entre atores — oposto ao SCO; eliminar.',
            'C cada órgão independente — fragmenta resposta; eliminar.',
            'D comunicação só federal — exclui estado/município; eliminar.',
            'B estrutura clara de comando e coordenação integrada — essência do SCO.',
            'Marcar B.',
            'Fixação: SCO = comando único · atores integrados.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'SCO — decore',
          meta: genericoSlideMeta,
          content: 'SISTEMA DE COMANDO',
          rows: SCO_OBJETIVOS,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Executar resposta sem coordenação entre atores contradiz o propósito central do SCO.',
      C: 'Atuação independente de cada órgão fragmenta a resposta — SCO exige integração.',
      D: 'Comunicação exclusiva entre órgãos federais exclui a rede estadual e municipal da crise.',
    },
  },
  'igeduc-enfermagem-processo-de-enfermagem-1780009392850-5': {
    branch: 'vf_protocolo',
    pack: {
      family: 'vf',
      guideline:
        'Primeiros socorros — I e II verdadeiros · III falso (acionar emergência) · IV verdadeiro',
      roi_error: 'vf_primeiros_socorros_i_iv',
      cluster: 'V/F I–IV — primeiros socorros na Atenção Básica',
      danger_footer: 'Gabarito A — V, V, F, V',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Primeiros socorros — V/F',
          meta: vfSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Primeiros socorros na AB/ESF — julgar itens I a IV antes da combinação.',
              icon: 'Target',
            },
            {
              label: 'Afirmativa I',
              detail: 'VERDADEIRA — manter funções vitais e evitar agravamento.',
              icon: 'Heart',
            },
            {
              label: 'Afirmativa II',
              detail: 'VERDADEIRA — avaliar cena e segurança do socorrista primeiro.',
              icon: 'Shield',
            },
            {
              label: 'Afirmativa III',
              detail: 'FALSA — primeiros socorros não dispensam acionar emergência quando disponível.',
              icon: 'XCircle',
            },
            {
              label: 'Afirmativa IV',
              detail: 'VERDADEIRA — técnico atua dentro de protocolos e limites profissionais.',
              icon: 'UserCheck',
            },
          ],
          footer_rule: VF_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: vfSlideMeta,
          steps: [
            'Primeiros socorros — julgar itens I a IV:',
            'I — manter funções vitais e evitar agravamento → verdadeiro.',
            'II — avaliar cena e segurança do socorrista → verdadeiro.',
            'III — dispensar acionar emergência quando disponível → falso.',
            'IV — agir conforme protocolos e limites do técnico → verdadeiro.',
            'Sequência V, V, F, V — marcar A.',
            'Fixação: PS estabiliza · aciona SAMU · respeita escopo.',
          ],
          footer_rule: VF_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'PS — decore V/F',
          meta: vfSlideMeta,
          content: 'PRIMEIROS SOCORROS I–IV',
          rows: vfRows([
            { roman: 'I', verdict: 'V', note: 'Preservar funções vitais e evitar agravamento' },
            { roman: 'II', verdict: 'V', note: 'Avaliar cena e segurança do socorrista' },
            { roman: 'III', verdict: 'F', note: 'Acionar emergência quando disponível — obrigatório' },
            { roman: 'IV', verdict: 'V', note: 'Protocolos e limites de atuação do técnico' },
          ]),
          footer_rule: VF_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: vfSlideMeta,
          content: 'PEGADINHAS — item III dispensar samu',
          items: [
            {
              label: 'Letra B — F, F, V, V',
              detail: 'Nega itens I e II verdadeiros e aceita item III falso como verdadeiro.',
              correct: 'Itens I e II são verdadeiros — primeiros socorros preservam vida e incluem checagem da cena antes de agir.',
            },
            {
              label: 'Letra C — V, F, V, F',
              detail: 'Omite segurança da cena (II) e limites profissionais (IV).',
              correct: 'Item II (cena segura) e item IV (limites do técnico) são verdadeiros nesta sequência.',
            },
            {
              label: 'Letra D — F, V, V, F',
              detail: 'Aceita dispensar acionar emergência — item III é falso.',
              correct: 'Item III é falso — primeiros socorros não substituem acionar SAMU ou emergência disponível.',
            },
          ],
          footer_rule: 'Gabarito A — V, V, F, V',
        },
      ],
    },
    danger: {},
  },
  'igeduc-enfermagem-semiologia-em-enfermagem-1779563486900-7': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Hipoglicemia DM1 — sudorese excessiva é sinal adrenérgico típico (taquicardia · tremor · fome)',
      roi_error: 'hipoglicemia_sudorese_adrenergica',
      cluster: 'Hipoglicemia DM1 — semiologia adrenérgica',
      danger_footer: 'Gabarito A — sudorese excessiva',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Hipoglicemia — sinais',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Diabetes tipo 1 com hipoglicemia — reconhecer sinais típicos da queda glicêmica.',
              icon: 'Target',
            },
            {
              label: 'Adrenérgico',
              detail: 'Sudorese · tremor · taquicardia · fome — resposta catecolaminérgica.',
              icon: 'Droplets',
            },
            {
              label: '× Pele seca',
              detail: 'Perfil de hiperglicemia/desidratação — oposto da hipoglicemia adrenérgica.',
              icon: 'Ban',
            },
            {
              label: '× Poliúria',
              detail: 'Aumento de sede e diurese — hiperglicemia, não hipoglicemia.',
              icon: 'XCircle',
            },
            {
              label: 'Pegadinha — hiperglicemia',
              detail: 'Trocar sinais adrenérgicos por pele seca, sede ou poliúria de hiperglicemia.',
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
            'DM1 com hipoglicemia — sinal típico?',
            'B pele seca — hiperglicemia/desidratação; eliminar.',
            'C diminuição da frequência urinária — não descreve hipoglicemia; eliminar.',
            'D aumento de sede — polidipsia de hiperglicemia; eliminar.',
            'A sudorese excessiva — sinal adrenérgico clássico da hipoglicemia.',
            'Marcar A.',
            'Fixação: hipoglicemia úmida (sudorese) × hiperglicemia seca.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Hipoglicemia — decore',
          meta: genericoSlideMeta,
          content: 'SINAIS DA HIPOGLICEMIA',
          rows: HIPOGLICEMIA_QUALITATIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Pele seca é sinal de hiperglicemia/desidratação — pegadinha oposta à sudorese adrenérgica da hipoglicemia.',
      C: 'Diminuição da frequência urinária não descreve hipoglicemia aguda em DM1.',
      D: 'Aumento de sede (polidipsia) é manifestação de hiperglicemia — distrator clássico nesta pegadinha.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104018306-0': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'Exposição à raiva — limpeza abundante com água e sabão imediata e repetida na unidade, independente do tempo',
      roi_error: 'raiva_lavagem_imediata',
      cluster: 'Certo ou errado — profilaxia raiva limpeza ferimento',
      danger_footer: 'Gabarito A — Certo',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Raiva — limpeza',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Exposição',
              detail: 'Possível contato com vírus da raiva — agir na ferida antes de qualquer outra medida.',
              icon: 'Syringe',
            },
            {
              label: 'Limpeza mecânica',
              detail: 'Água corrente abundante + sabão ou detergente — reduz carga viral.',
              icon: 'Droplets',
            },
            {
              label: 'Imediatismo',
              detail: 'Lavar o quanto antes após a agressão — não adiar.',
              icon: 'Clock',
            },
            {
              label: 'Na unidade',
              detail: 'Repetir lavagem na unidade de saúde — mesmo após intervalo prolongado.',
              icon: 'Hospital',
            },
            {
              label: 'Pegadinha',
              detail: 'Negar lavagem por tempo decorrido ou subestimar limpeza mecânica.',
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
            'Exposição à raiva — julgar afirmativa sobre limpeza do ferimento.',
            'Limpeza com água corrente abundante e sabão — medida profilática mais eficaz.',
            'Realizar o quanto antes e repetir na unidade — independente do tempo transcorrido.',
            'Afirmativa alinhada ao protocolo MS de profilaxia antirrábica.',
            'Marcar A (Certo).',
            'Fixação: lavar sempre · rápido · repetir na UBS.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Raiva — decore',
          meta: genericoSlideMeta,
          content: 'PROFILAXIA DA RAIVA',
          rows: RAIVA_LIMPEZA,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — adiar lavagem raiva',
          items: [
            {
              label: 'Errado — negar limpeza',
              detail: 'Marcar Errado nega a lavagem mecânica imediata e repetida.',
              correct:
                'Limpeza abundante com água e sabão é imprescindível e deve ser repetida na unidade — afirmativa verdadeira.',
            },
            {
              label: 'Pegadinha — tempo decorrido',
              detail: 'Achar que o intervalo desde a mordida dispensa nova lavagem na unidade.',
              correct:
                'A lavagem deve ser repetida na unidade independentemente do tempo transcorrido — afirmativa verdadeira.',
            },
          ],
          footer_rule: 'Gabarito A — Certo',
        },
      ],
    },
    danger: {
      B: 'Errado nega a limpeza mecânica imediata — medida profilática mais eficaz contra a raiva.',
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
    console.log(`[handcraft:urgencias-g38] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g38] total=${ok}`);
}

main();
