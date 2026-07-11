#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g31 (8 slugs · 2º lote urgencias_generico).
 * Inferência por enunciado: RCP pediátrica VAA → rcp_pediatrico · figura RCP → rcp_sbv · demais generico.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides as finalizeGenerico,
  metaBase as metaGenerico,
  samuPapeisRows,
  slideMeta as genericoSlideMeta,
  urgenciaPrioridadeRows,
  type Pack as GenericoPack,
  type Q as GenericoQ,
} from './lib/urgenciasGenericoGolden';
import {
  finalizeSlides as finalizeRcpPed,
  metaBase as metaRcpPed,
  slideMeta as rcpPedSlideMeta,
  type Pack as RcpPedPack,
  type Q as RcpPedQ,
} from './lib/urgenciasRcpPediatricGolden';
import {
  finalizeSlides as finalizeRcp,
  metaBase as metaRcp,
  slideMeta as rcpSlideMeta,
  type Pack as RcpPack,
  type Q as RcpQ,
} from './lib/urgenciasRcpGolden';

const LOTE = 'urgencias-g31';
const REVIEWER = 'handcraft-urgencias-g31';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const RCP_FOOTER = 'RCP — ritmo e técnica da prova';

type GenericoEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };
type RcpPedEntry = { branch: 'rcp_pediatrico'; pack: RcpPedPack; danger: Record<string, string> };
type RcpEntry = { branch: 'rcp_sbv'; pack: RcpPack; danger: Record<string, string> };

type HandcraftEntry = GenericoEntry | RcpPedEntry | RcpEntry;

const SPECS: Record<string, HandcraftEntry> = {
  'avancasp-enfermagem-urgencias-e-emergencias-1777104024064-5': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Crioterapia no entorse — ~15 min, temperatura próxima de 15 °C (literatura da prova)',
      roi_error: 'crioterapia_entorse_parametros',
      cluster: 'Entorse — aplicação de frio',
      danger_footer: 'Gabarito C — 15 min · ~15 °C',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Entorse — crioterapia',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Jogador com entorse de joelho no PS — compressas frias indicadas.',
              icon: 'Target',
            },
            {
              label: 'Objetivo',
              detail: 'Reduzir edema e dor nas primeiras horas — crioterapia local.',
              icon: 'Snowflake',
            },
            {
              label: 'Tempo',
              detail: 'Sessões curtas e repetidas — não horas contínuas de gelo.',
              icon: 'Timer',
            },
            {
              label: 'Temperatura',
              detail: 'Frio moderado com barreira — evita gelo direto na pele.',
              icon: 'Thermometer',
            },
            {
              label: 'Pegadinha',
              detail: '“Sem contraindicação”, ferida aberta ou sessão prolongada contínua seduzem fora do protocolo.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Frio local — tempo e temperatura controlados',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Comando: aplicação correta de frio no entorse.',
            'A ferida aberta — crioterapia não é indiscriminada em pele lesada; eliminar.',
            'B sem restrição de idade — crianças e idosos exigem cautela; eliminar.',
            'D sem contraindicações — existem (pele lesada, neuropatia, vasoconstrição excessiva); eliminar.',
            'E gelo prolongado contínuo — tempo excessivo e risco de lesão; eliminar.',
            'C alternativa com duração e temperatura literais da banca — parâmetros cobrados no gabarito.',
            'Marcar C.',
            'Fixação: crioterapia tem duração e temperatura — não é “sem limite”.',
          ],
          footer_rule: 'Parâmetros literais da alternativa C',
        },
        {
          type: 'golden_rule',
          slide_title: 'Crioterapia — entorse',
          meta: genericoSlideMeta,
          content: 'FRIO LOCAL — DECORE DA PROVA',
          rows: [
            { label: 'Duração', value: 'Sessão limitada — repetir com intervalo', badge: 'hot' },
            { label: 'Temperatura', value: 'Frio moderado com proteção cutânea', badge: 'hot' },
            { label: '× Ferida aberta', value: 'Não usar sem critério — pegadinha A', badge: 'warn' },
            { label: '× Sem limite', value: 'Há contraindicações e tempo máximo', badge: 'warn' },
            { label: '× Sessão longa', value: 'Contínuo excessivo — pegadinha E', badge: 'info' },
          ],
          footer_rule: 'Parâmetros literais da banca',
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — CRIOTERAPIA NO ENTORSE',
          items: [
            {
              label: 'Letra A — ferida aberta',
              detail: 'Uso indiscriminado em ferida.',
              correct:
                'Ferida aberta não recebe crioterapia indiscriminada — risco de lesão e atraso de cicatrização.',
            },
            {
              label: 'Letra B — sem restrição de idade',
              detail: 'Idade sem cautela.',
              correct: 'Idade influencia tolerância ao frio — não há “sem restrição” absoluta.',
            },
            {
              label: 'Letra D — sem contraindicações',
              detail: 'Afirmativa absoluta de segurança.',
              correct:
                'Existem contraindicações (pele lesada, circulação comprometida) — afirmativa absoluta é falsa.',
            },
            {
              label: 'Letra E — sessão prolongada',
              detail: 'Gelo contínuo excessivo.',
              correct:
                'Sessão prolongada e contínua com gelo excede o tempo seguro e pode causar lesão térmica.',
            },
          ],
          footer_rule: 'Gabarito C — parâmetros literais da banca',
        },
      ],
    },
    danger: {},
  },
  'avancasp-enfermagem-urgencias-e-emergencias-1777104083571-4': {
    branch: 'rcp_pediatrico',
    pack: {
      family: 'protocolo',
      guideline: 'AHA 2020 — RCP pediátrica com via aérea avançada: 1 ventilação a cada 2–3 s',
      roi_error: 'rcp_ped_vaa_ventilacao_2_3s',
      cluster: 'RCP pediátrica — VAA e ritmo ventilatório',
      danger_footer: 'Gabarito B — 1 ventilação/2–3 s',
      exam_vs_current: 'exam_pediatric_vaa_2_3s',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'RCP pediátrica — VAA',
          meta: rcpPedSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Bebês e crianças com via aérea avançada — ritmo de ventilação AHA 2020.',
              icon: 'Target',
            },
            {
              label: 'Via aérea avançada',
              detail: 'Tubo ou dispositivo avançado confirmado — compressões contínuas de alta qualidade.',
              icon: 'Wind',
            },
            {
              label: 'Ventilação pediátrica',
              detail: 'Aproximadamente 1 ventilação a cada 2 a 3 segundos — 20–30/min.',
              icon: 'Timer',
            },
            {
              label: 'Pegadinha — 6 s',
              detail: 'Ritmo de adulto pós-VAA não é gabarito desta questão pediátrica.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Pegadinha — hiperventilar',
              detail: '1 ventilação por segundo é ritmo excessivo — elimina E.',
              icon: 'Ban',
            },
          ],
          footer_rule: 'Pediatria + VAA = 2–3 s entre ventilações',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: rcpPedSlideMeta,
          steps: [
            'Cenário: RCP em bebês/crianças com via aérea avançada (AHA 2020).',
            'Com VAA fixada: compressões contínuas + ventilação espaçada.',
            'A 1 ventilação/6 s — ritmo de adulto pós-intubação; eliminar nesta prova pediátrica.',
            'C 1/4 s e D 1/3–4 s — intervalos fora do gabarito AHA pediátrico; eliminar.',
            'E 1/1 s — hiperventilação; eliminar.',
            'B 1 ventilação a cada 2 a 3 segundos — diretriz pediátrica com VAA.',
            'Marcar B.',
            'Fixação: pediatria com VAA ≠ copiar só o ritmo de 6 s do adulto.',
          ],
          footer_rule: '2–3 s — pediatria com VAA',
        },
        {
          type: 'golden_rule',
          slide_title: 'RCP ped — pós-VAA',
          meta: rcpPedSlideMeta,
          content: 'AHA 2020 — PEDIATRIA COM VAA',
          rows: [
            { label: 'Ventilação', value: '1 a cada 2–3 s (20–30/min)', badge: 'hot' },
            { label: 'Compressões', value: 'Contínuas após VAA confirmada', badge: 'ok' },
            { label: 'Sem VAA', value: '15:2 com 2 socorristas pediátricos', badge: 'info' },
            { label: '× 6 s', value: 'Ritmo adulto — não gabarito desta questão', badge: 'warn' },
            { label: '× 1/s', value: 'Hiperventilação — prejudica perfusão', badge: 'warn' },
          ],
          footer_rule: RCP_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Uma ventilação a cada 6 segundos é ritmo típico de adulto pós-VAA — não o gabarito pediátrico desta prova.',
      C: 'Intervalo de 4 segundos não corresponde à diretriz AHA 2020 para pediatria com via aérea avançada.',
      D: '3 a 4 segundos entre ventilações não é a faixa correta de 2 a 3 segundos cobrada no enunciado.',
      E: 'Uma ventilação por segundo é hiperventilação — reduz retorno venoso e perfusão coronariana.',
    },
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003261833-4': {
    branch: 'rcp_sbv',
    pack: {
      family: 'protocolo',
      guideline: 'Primeiros socorros — reconhecer manobras de ressuscitação cardiopulmonar na imagem',
      roi_error: 'primeiros_socorros_identificar_rcp',
      cluster: 'Figura — técnica de RCP',
      danger_footer: 'Gabarito A — ressuscitação cardiopulmonar',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Primeiros socorros — RCP',
          meta: rcpSlideMeta,
          items: [
            {
              label: 'Primeiros socorros',
              detail: 'Cuidados imediatos e provisórios até assistência qualificada — manter funções vitais.',
              icon: 'Target',
            },
            {
              label: 'Funções vitais',
              detail: 'Evitar agravamento — condutas rápidas enquanto aguarda equipe especializada.',
              icon: 'HeartPulse',
            },
            {
              label: 'RCP na figura',
              detail: 'Ressuscitação cardiopulmonar — compressões torácicas ritmadas na parada cardiorrespiratória.',
              icon: 'Activity',
            },
            {
              label: '× Corpo estranho',
              detail: 'Alternativa B — manobra para engolir mal, não compressão torácica de PCR.',
              icon: 'XCircle',
            },
            {
              label: '× Posição lateral',
              detail: 'Alternativa C — vítima inconsciente que respira, não RCP.',
              icon: 'XCircle',
            },
          ],
          footer_rule: 'Figura com compressão torácica = RCP',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: rcpSlideMeta,
          steps: [
            'Contexto: primeiros socorros — manter funções vitais até assistência qualificada.',
            'Analisar figura com compressão torácica — qual técnica corresponde?',
            'B corpo estranho — não descreve RCP; eliminar.',
            'C posição lateral de segurança — inconsciente com respiração; eliminar.',
            'D abertura isolada de vias aéreas — passo, não técnica completa da figura; eliminar.',
            'E avaliação de consciência — passo inicial do atendimento; eliminar.',
            'A ressuscitação cardiopulmonar — compressões na parada cardiorrespiratória.',
            'Marcar A.',
          ],
          footer_rule: RCP_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: rcpSlideMeta,
          content: 'PRIMEIROS SOCORROS — RECONHECER',
          rows: [
            { label: 'RCP', value: 'Compressões torácicas + ventilações na PCR', badge: 'hot' },
            { label: 'Desobstrução', value: 'Corpo estranho — tosse efetiva ou manobras OVACE', badge: 'info' },
            { label: 'Lateralização', value: 'Inconsciente respirando — posição lateral de segurança', badge: 'ok' },
            { label: 'Consciência', value: 'Avaliar antes — mas figura de compressão = RCP', badge: 'warn' },
          ],
          footer_rule: 'Identificar manobra antes de decorar números',
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Corpo estranho trata engolir mal — não a parada com compressões torácicas da figura.',
      C: 'Posição lateral é para vítima inconsciente que respira — não manobra de RCP na PCR.',
      D: 'Abertura de vias aéreas isolada precede ventilação, mas a figura cobrada é RCP completa.',
      E: 'Avaliação do nível de consciência integra primeiros socorros — não a técnica de compressão ilustrada.',
    },
  },
  'educa-pb-enfermagem-urgencias-e-emergencias-1777104070286-6': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Emergência — ação imediata com risco iminente de morte; avaliar consciência, vitais e vias aéreas',
      roi_error: 'emergencia_vs_urgencia_conceito',
      cluster: 'Conceito — emergência × urgência',
      danger_footer: 'Gabarito D — conceito de emergência',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Emergência — definição',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Texto-base',
              detail: 'Ação imediata · risco iminente de morte · consciência · parâmetros vitais · vias aéreas.',
              icon: 'Target',
            },
            {
              label: 'Emergência',
              detail: 'Ameaça imediata à vida — intervenção sem postergar.',
              icon: 'Zap',
            },
            {
              label: '× Urgência',
              detail: 'Grave, mas nem sempre risco iminente de morte no mesmo grau.',
              icon: 'Clock',
            },
            {
              label: '× Quadro clínico',
              detail: 'Asma, dengue ou luxação são exemplos — não definição conceitual.',
              icon: 'XCircle',
            },
            {
              label: 'Pegadinha',
              detail: 'A banca mistura conceito com quadro clínico específico.',
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
            'Comando: a qual conceito o texto se refere?',
            'A conceito de urgência — risco grave, mas texto enfatiza morte iminente; eliminar.',
            'B luxação/torção — quadro ortopédico, não definição; eliminar.',
            'C crise de asma — exemplo clínico, não conceito; eliminar.',
            'E dengue — doença específica, não definição; eliminar.',
            'D conceito de emergência — ação imediata com risco iminente de morte.',
            'Marcar D.',
            'Fixação: emergência = morte iminente + avaliação imediata de consciência, vitais e VAA.',
          ],
          footer_rule: 'Emergência = morte iminente',
        },
        {
          type: 'golden_rule',
          slide_title: 'Emergência × urgência',
          meta: genericoSlideMeta,
          content: 'CONCEITOS — DECORE',
          rows: [
            { label: 'Emergência', value: 'Risco iminente de morte — ação imediata', badge: 'hot' },
            { label: 'Avaliar', value: 'Consciência · vitais · permeabilidade VAA', badge: 'ok' },
            { label: 'Urgência', value: 'Grave, mas conceito distinto na prova', badge: 'info' },
            { label: '× Exemplo clínico', value: 'Asma/dengue/luxação ≠ definição', badge: 'warn' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Urgência é grave, mas o texto descreve risco iminente de morte e avaliação imediata — núcleo de emergência.',
      B: 'Luxação ou torção é quadro clínico ortopédico — não a definição conceitual pedida.',
      C: 'Crise de asma é exemplo de quadro respiratório — não o conceito abstrato do enunciado.',
      E: 'Dengue é diagnóstico específico — o comando pede o conceito de classificação assistencial.',
    },
  },
  'facape-enfermagem-semiologia-em-enfermagem-1779563486900-8': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Triagem na UBS — sinais de alerta (tosse seca, perda ponderal) exigem avaliação ampliada e encaminhamento',
      roi_error: 'triagem_ubs_sinais_alerta',
      cluster: 'UBS — ações imediatas do técnico na triagem',
      danger_footer: 'Gabarito B — SpO₂ · ausculta · encaminhar',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Triagem — sinais de alerta',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'HAS/DM controlados, mas tosse seca persistente e perda ponderal — sinais de alerta.',
              icon: 'Target',
            },
            {
              label: 'Não minimizar',
              detail: 'PA e glicemia “aceitáveis” não dispensam investigação de sintomas novos.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Monitorar',
              detail: 'Saturação, ausculta pulmonar e sinais vitais — buscar comprometimento oculto.',
              icon: 'Activity',
            },
            {
              label: 'Encaminhar',
              detail: 'Enfermeiro/médico para avaliação — possível insuficiência cardíaca compensada.',
              icon: 'UserCheck',
            },
            {
              label: 'Pegadinha',
              detail: 'Ordem de chegada, O₂ rotineiro ou aguardar só para repetir PA atrasam cuidado necessário.',
              icon: 'Ban',
            },
          ],
          footer_rule: 'Sintoma novo + perda ponderal = investigar',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Técnico na triagem — ações imediatas diante de tosse seca prolongada e perda ponderal?',
            'A risco baixo + ordem de chegada — ignora sinais de alerta; eliminar.',
            'C aguardar para repetir PA — posterga avaliação; eliminar.',
            'D O₂ 3 L/min + orientação domiciliar — conduta avançada sem avaliação prévia; eliminar.',
            'E normalizar cansaço/perda de peso — negligencia investigação; eliminar.',
            'B SpO₂, ausculta, monitorar vitais e encaminhar — conduta segura.',
            'Marcar B.',
            'Fixação: triagem identifica gravidade oculta — não só números “normais” de PA/glicemia.',
          ],
          footer_rule: 'Triagem = buscar gravidade oculta',
        },
        {
          type: 'golden_rule',
          meta: genericoSlideMeta,
          content: 'TRIAGEM UBS — ALERTA',
          rows: [
            { label: 'Fazer', value: 'SpO₂ · ausculta · sinais vitais · encaminhar', badge: 'hot' },
            { label: 'Sinais', value: 'Tosse seca persistente · perda ponderal não explicada', badge: 'warn' },
            { label: '× Ordem de chegada', value: 'Não ignora gravidade potencial', badge: 'warn' },
            { label: '× Postergar', value: 'Aguardar só PA não substitui avaliação clínica', badge: 'info' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — TRIAGEM UBS',
          items: [
            {
              label: 'Letra A — risco baixo',
              detail: 'Ordem de chegada isolada.',
              correct:
                'Classificar como risco baixo e ordem de chegada ignora tosse seca prolongada e perda ponderal — sinais de alerta.',
            },
            {
              label: 'Letra C — aguardar repouso',
              detail: 'Postergar aferição de PA.',
              correct:
                'Aguardar apenas para repetir PA posterga avaliação de possível comprometimento cardiorrespiratório.',
            },
            {
              label: 'Letra D — oxigênio precoce',
              detail: 'O₂ sem avaliação prévia.',
              correct:
                'Oxigênio suplementar e orientação domiciliar sem avaliação prévia adequada não é conduta inicial segura na triagem.',
            },
            {
              label: 'Letra E — normalizar sintomas',
              detail: 'Cansaço como “normal”.',
              correct:
                'Normalizar perda de peso e fadiga em diabético/hipertenso negligencia investigação de gravidade oculta.',
            },
          ],
          footer_rule: 'Gabarito B — SpO₂ · ausculta · encaminhar',
        },
      ],
    },
    danger: {},
  },
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-7': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Escala de Coma de Glasgow — pontuações numéricas (3–15) nos três domínios',
      roi_error: 'glasgow_pontuacao_numerica',
      cluster: 'Glasgow — formato da escala',
      danger_footer: 'Gabarito A — números',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Glasgow — formato',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'ECG avalia consciência por abertura ocular, verbal e motora — pontuações expressas em:',
              icon: 'Target',
            },
            {
              label: 'Números',
              detail: 'Cada domínio pontua de 1 a 4/5/6 — soma numérica total 3–15.',
              icon: 'Hash',
            },
            {
              label: 'Domínios',
              detail: 'Olhos + verbal + motor — tríade neurológica padronizada.',
              icon: 'Brain',
            },
            {
              label: 'Pegadinha',
              detail: 'Letras, cores ou símbolos não são o formato da escala de Glasgow.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Glasgow = escore numérico',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Comando: em que formato são expressas as pontuações da Glasgow?',
            'B letras — não é o sistema de pontuação; eliminar.',
            'C símbolos — não corresponde à escala; eliminar.',
            'D cores — não é parâmetro da Glasgow; eliminar.',
            'E gráficos — podem registrar, mas pontuação é numérica; eliminar.',
            'A números — cada resposta recebe valor inteiro na soma.',
            'Marcar A.',
            'Fixação: Glasgow soma números — não categorias alfabéticas.',
          ],
          footer_rule: '3–15 = soma numérica',
        },
        {
          type: 'golden_rule',
          meta: genericoSlideMeta,
          content: 'GLASGOW — DECORE',
          rows: [
            { label: 'Formato', value: 'Pontuações em números inteiros', badge: 'hot' },
            { label: 'Domínios', value: 'Ocular 1–4 · verbal 1–5 · motor 1–6', badge: 'ok' },
            { label: 'Total', value: '3 (mínimo) a 15 (máximo)', badge: 'info' },
            { label: '× Letras/cores', value: 'Não é o sistema de pontuação', badge: 'warn' },
          ],
          footer_rule: 'Escala numérica — trauma e neurologia',
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Letras não expressam as pontuações da Escala de Coma de Glasgow — cada domínio usa valores numéricos.',
      C: 'Símbolos não são o formato padronizado de pontuação da escala neurológica.',
      D: 'Cores não compõem o sistema de classificação numérica da Glasgow.',
      E: 'Gráficos podem documentar evolução, mas a pontuação em si é expressa em números.',
    },
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712400677-5': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline: 'USA — equipe de suporte avançado; enfermeiro integra urgência pré-hospitalar conforme norma',
      roi_error: 'usa_enfermeiro_membro',
      cluster: 'Certo ou errado — enfermeiro na Unidade de Suporte Avançado',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'USA e enfermagem',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Urgência pré-hospitalar',
              detail: 'Atendimento móvel com suporte básico e avançado de vida no SAMU.',
              icon: 'Ambulance',
            },
            {
              label: 'Unidade de Suporte Avançado',
              detail: 'Transporte com suporte avançado de vida (SAV) quando indicado.',
              icon: 'HeartPulse',
            },
            {
              label: 'Enfermeiro no SAMU',
              detail: 'Profissional atua na urgência pré-hospitalar — composição da USA conforme norma.',
              icon: 'UserCheck',
            },
            {
              label: 'Pegadinha — “não pode ser membro”',
              detail: 'Negar participação do enfermeiro na USA de forma absoluta.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Equipe multiprofissional no SAMU',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Afirmativa: enfermeiro não pode ser membro da USA que opera suporte básico e avançado de vida?',
            'Enfermeiro integra equipe de urgência pré-hospitalar — exclusão absoluta é falsa.',
            'Marcar B (Errado).',
            'Fixação: não confundir escopo da USA com proibição ao enfermeiro.',
          ],
          footer_rule: 'Enfermeiro pode integrar USA',
        },
        {
          type: 'golden_rule',
          meta: genericoSlideMeta,
          content: 'SAMU — PAPÉIS',
          rows: samuPapeisRows([
            { label: 'Enfermeiro', value: 'Atuação conforme regulação — não proibição absoluta', badge: 'hot' },
          ]),
          footer_rule: 'Legislação local define equipe mínima',
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — USA ENFERMEIRO',
          items: [
            {
              label: 'Certo — enfermeiro excluído',
              detail: 'Mesmo não podendo ser membro da USA — redação absoluta.',
              correct:
                'Errado — enfermeiro pode integrar equipes de urgência/SAV conforme norma; afirmativa é falsa.',
            },
            {
              label: 'Pegadinha — confundir USA com USB',
              detail: 'Banca testa conhecimento de siglas e escopo de suporte avançado.',
              correct: 'Suporte avançado de vida não exclui enfermeiro automaticamente da equipe móvel.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo afirma exclusão absoluta do enfermeiro na USA — contradiz atuação multiprofissional no SAMU.',
    },
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712400677-6': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline: 'Enfermeiro nas urgências — punção, medicamentos e manejo de via aérea conforme legislação',
      roi_error: 'enfermeiro_autonomia_urgencia',
      cluster: 'Certo ou errado — atuação do enfermeiro na urgência',
      danger_footer: 'Gabarito A — Certo',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Enfermeiro na urgência',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Afirmativa',
              detail: 'Enfermeiro atua diretamente: punção venosa, medicamentos, dispositivos supraglóticos, auxílio em intubação.',
              icon: 'FileText',
            },
            {
              label: 'Autonomia legal',
              detail: 'Procedimentos previstos na legislação e protocolos institucionais do COFEN.',
              icon: 'Scale',
            },
            {
              label: 'Via aérea',
              detail: 'Dispositivos supraglóticos e suporte em intubação — dentro do escopo regulado.',
              icon: 'Wind',
            },
            {
              label: 'Pegadinha — “só médico”',
              detail: 'Negar atuação direta do enfermeiro na urgência hospitalar.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Escopo legal do enfermeiro',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Enfermeiro realiza punção, medicamentos e manejo de via aérea conforme legislação?',
            'Procedimentos listados estão no escopo legal/protocolar do enfermeiro na urgência.',
            'Afirmativa verdadeira.',
            'Marcar A (Certo).',
            'Fixação: enfermeiro não é mero observador na urgência — atua com autonomia regulada.',
          ],
          footer_rule: 'Certo — escopo legal',
        },
        {
          type: 'golden_rule',
          meta: genericoSlideMeta,
          content: 'ENFERMEIRO — URGÊNCIA',
          rows: [
            { label: 'Punção venosa', value: 'Dentro do escopo na urgência', badge: 'ok' },
            { label: 'Medicamentos', value: 'Administração conforme prescrição e protocolo', badge: 'ok' },
            { label: 'Via aérea', value: 'Dispositivos supraglóticos conforme legislação', badge: 'hot' },
            { label: 'Intubação', value: 'Auxílio em procedimento médico — não exclusividade médica total', badge: 'info' },
          ],
          footer_rule: 'Protocolo vigente + COFEN',
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — ESCOPO ENFERMEIRO',
          items: [
            {
              label: 'Errado — só auxiliar passivo',
              detail: 'Negar autonomia do enfermeiro na urgência.',
              correct:
                'Certo — punção, medicamentos e manejo de via aérea supraglótica estão previstos na legislação para o enfermeiro.',
            },
            {
              label: 'Pegadinha — “só o médico intuba”',
              detail: 'Auxílio em intubação não elimina atuação direta do enfermeiro.',
              correct: 'Enfermeiro participa do manejo de via aérea conforme protocolo — gabarito Certo.',
            },
          ],
          footer_rule: 'Gabarito A — Certo',
        },
      ],
    },
    danger: {
      B: 'Errado nega atuação direta regulamentada do enfermeiro — punção, medicamentos e via aérea estão no escopo legal.',
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
          undefined,
          entry.pack.exam_vs_current,
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
    console.log(`[handcraft:urgencias-g31] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g31] total=${ok}`);
}

main();
