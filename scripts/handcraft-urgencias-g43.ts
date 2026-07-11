#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g43 (8 slugs · 14º lote urgencias_generico).
 * Drift: Glasgow/exames → generico · C/E coluna → trauma · SAE prontuário → generico · desidratação → choque · LJ urgencias · meningite LCR.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
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

const LOTE = 'urgencias-g43';
const REVIEWER = 'handcraft-urgencias-g43';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const CHOQUE_FOOTER = 'Volume perdido = hipovolêmico';

const GLASGOW_OBJETIVO = [
  { label: 'Objetivo', value: 'Quantificar nível de consciência — respostas ocular, verbal e motora', badge: 'hot' },
  { label: 'Uso clínico', value: 'TCE · rebaixamento · monitorização neurológica seriada', badge: 'ok' },
  { label: '× Função renal', value: 'Parâmetro nefrológico — não escala de Glasgow', badge: 'warn' },
  { label: '× Escala de dor', value: 'Intensidade dolorosa — instrumento distinto', badge: 'warn' },
  { label: '× Calor/temperatura', value: 'Termometria — sinal vital térmico, não consciência', badge: 'info' },
];

const COLUNA_NAO_MOVER = [
  { label: 'Cenário', value: 'Acidente automobilístico · dor cervical intensa', badge: 'hot' },
  { label: 'Conduta segura', value: 'Imobilizar coluna · aguardar socorro especializado', badge: 'ok' },
  { label: '× Levantar/caminhar', value: 'Movimentação agrava lesão medular', badge: 'warn' },
  { label: '× Transporte improvisado', value: 'Remoção sem prancha/imobilização aumenta risco', badge: 'warn' },
  { label: 'Pegadinha', value: 'Consciência preservada não exclui trauma raquimedular', badge: 'info' },
];

const PRONTUARIO_HIPOGLICEMIA = [
  { label: 'Registro completo', value: 'Sinais/sintomas + intervenção + horários e doses', badge: 'hot' },
  { label: 'Observação', value: 'Sudorese · tremores — documentar antes e após conduta', badge: 'ok' },
  { label: '× Só sinais vitais', value: 'Incompleto sem registrar glicose e horários', badge: 'warn' },
  { label: '× Só medicação', value: 'Relato sem sintomas clínicos é insuficiente', badge: 'warn' },
  { label: '× Só comunicação MD', value: 'Comunicar médico ≠ substituir registro de enfermagem', badge: 'info' },
];

const DESIDRATACAO_GRAVE_IV = [
  { label: 'Gravidade', value: 'Mucosas secas · hipotensão · taquicardia · oligúria', badge: 'hot' },
  { label: 'Mecanismo', value: 'Perda hídrica por diarreia → hipovolemia', badge: 'ok' },
  { label: 'Conduta inicial', value: 'Fluidos isotônicos EV + monitorar sinais vitais', badge: 'hot' },
  { label: '× Via oral isolada', value: 'Desidratação grave exige reposição venosa inicial', badge: 'warn' },
  { label: '× Glicose sem hipoglicemia', value: 'Salina isotônica — não glicose isolada', badge: 'warn' },
];

const VIA_AEREA_PRIORIDADE = [
  { label: 'ABC', value: 'Via aérea e respiração precedem exames e anamnese prolongada', badge: 'hot' },
  { label: 'Técnico', value: 'Verificar SpO₂ · estabilizar via aérea na avaliação inicial', badge: 'ok' },
  { label: '× Exame sangue', value: 'Laboratorial — não precede estabilização respiratória', badge: 'warn' },
  { label: '× História detalhada', value: 'Anamnese completa após ABC estabilizado', badge: 'info' },
  { label: '× Analgesia precoce', value: 'Dor importante — via aérea vem primeiro', badge: 'warn' },
];

const IC_SOBRECARGA_LIQUIDO = [
  { label: 'Problema', value: 'IC descompensada — sobrecarga hídrica pulmonar/periférica', badge: 'hot' },
  { label: 'Prioridade', value: 'Diurético de alça + monitorar potássio', badge: 'ok' },
  { label: '× Elevar pernas', value: 'Aumenta retorno venoso — agrava congestão', badge: 'warn' },
  { label: '× Fluidos EV', value: 'Expande volume em paciente congesto', badge: 'warn' },
  { label: 'Pegadinha', value: 'Banca troca vasodilatador/inotrópico por diurese', badge: 'info' },
];

const CRISE_HIPERTENSIVA = [
  { label: 'Crise', value: 'PA elevada com risco — controle imediato necessário', badge: 'hot' },
  { label: 'Prioridade', value: 'Anti-hipertensivo endovenoso titulado', badge: 'ok' },
  { label: '× ECG isolado', value: 'Avaliação complementar — não reduz PA', badge: 'warn' },
  { label: '× Posicionamento solo', value: 'Auxilia conforto — não substitui droga EV', badge: 'info' },
  { label: '× Só monitorizar PA', value: 'Monitorar ≠ tratar — crise exige medicação ativa', badge: 'warn' },
];

const MENINGITE_DIAGNOSTICO = [
  { label: 'Suspeita', value: 'Meningite/meningoencefalite — febre · rigidez · cefaleia · alteração consciência', badge: 'hot' },
  { label: 'Exame ouro', value: 'Punção lombar com análise do LCR', badge: 'hot' },
  { label: 'LCR', value: 'Confirma etiologia e orienta antibioticoterapia', badge: 'ok' },
  { label: '× Urocultivo', value: 'ITU — não confirma meningite meníngea', badge: 'warn' },
  { label: '× Hemocultivo isolado', value: 'Complementar — não substitui LCR para diagnóstico meníngeo', badge: 'info' },
];

type GenericoEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };
type ChoqueEntry = { branch: 'choque'; pack: ChoquePack; danger: Record<string, string> };
type HandcraftEntry = GenericoEntry | ChoqueEntry;

const SPECS: Record<string, HandcraftEntry> = {
  'instituto-evo-enfermagem-exames-complementares-1779563655698-7': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline: 'Escala de Glasgow — objetivo é quantificar o nível de consciência (respostas ocular, verbal e motora)',
      roi_error: 'glasgow_objetivo_consciencia',
      cluster: 'Glasgow — objetivo da escala (drift exames)',
      danger_footer: 'Gabarito B — nível de consciência',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Glasgow — para quê serve',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Qual o objetivo da escala de Glasgow na avaliação de pacientes?',
              icon: 'Brain',
            },
            {
              label: 'Resposta correta',
              detail: 'Avaliar o nível de consciência — soma ocular + verbal + motora.',
              icon: 'Activity',
            },
            {
              label: 'Contexto urgência',
              detail: 'TCE · rebaixamento · monitorização neurológica seriada.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Pegadinha — renal',
              detail: 'Função renal usa creatinina/diurese — não escala neurológica.',
              icon: 'Droplets',
            },
            {
              label: 'Pegadinha — dor/calor',
              detail: 'EVA mede dor · termômetro mede temperatura — distintos de Glasgow.',
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
            'Objetivo da escala de Glasgow — o que a banca pede?',
            'A função renal — eliminar — parâmetro nefrológico.',
            'C medir dor — eliminar — escala analgésica distinta.',
            'D medir calor — eliminar — termometria, não consciência.',
            'B avaliar nível de consciência — resposta ocular · verbal · motora.',
            'Marcar B.',
            'Fixação: Glasgow = consciência · não dor · não renal · não temperatura.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Glasgow — decore objetivo',
          meta: genericoSlideMeta,
          content: 'ESCALA DE GLASGOW',
          rows: GLASGOW_OBJETIVO,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Função renal é avaliada por creatinina, diurese e exames nefrológicos — não pelo escore de Glasgow.',
      C: 'Medir dor usa escalas analgésicas (EVA/EN) — instrumento distinto da escala de consciência.',
      D: 'Medir calor/temperatura é termometria — sinal vital térmico, não nível de consciência.',
    },
  },
  'instituto-ibed-enfermagem-processo-de-enfermagem-1780004982901-0': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'Trauma cervical — não levantar nem caminhar com a vítima; imobilizar coluna e aguardar socorro especializado',
      roi_error: 'trauma_cervical_nao_mover_vitima',
      cluster: 'Certo ou errado — trauma cervical APH (drift SAE · strict-v2 generico)',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Trauma cervical — julgar',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Acidente automobilístico · consciente · dor intensa cervical.',
              icon: 'Car',
            },
            {
              label: 'Afirmativa',
              detail: 'Ajudar a levantar e caminhar até local confortável — julgar.',
              icon: 'FileText',
            },
            {
              label: 'Risco',
              detail: 'Movimentação pode converter lesão cervical estável em irreversível.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Conduta segura',
              detail: 'Manter imobilização · aguardar equipe especializada.',
              icon: 'Shield',
            },
            {
              label: 'Pegadinha',
              detail: 'Consciência preservada não exclui trauma raquimedular.',
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
            'Acidente · dor cervical intensa — afirmativa propõe levantar e caminhar.',
            'Trauma raquimedular suspeito — movimentação é contraindicada.',
            'Primeiros socorros = imobilizar · não remover sem proteção cervical.',
            'Afirmativa descreve conduta insegura — julgar Errado.',
            'Marcar B (Errado).',
            'Fixação: coluna cervical = não mover · aguardar SAMU.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Coluna — decore APH',
          meta: genericoSlideMeta,
          content: 'TRAUMA CERVICAL — NÃO MOVER',
          rows: COLUNA_NAO_MOVER,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — levantar vítima cervical',
          items: [
            {
              label: 'Certo — aceitar afirmativa',
              detail: 'Marcar Certo valida levantar e caminhar com dor cervical pós-acidente.',
              correct:
                'Conduta insegura — imobilizar coluna e aguardar socorro; afirmativa é Errada.',
            },
            {
              label: 'Pegadinha — conforto vs segurança',
              detail: 'Parece humanizar cuidado, mas movimentação agrava lesão medular.',
              correct: 'Manter vítima imóvel até remoção adequada — gabarito Errado.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo valida levantar e caminhar — conduta perigosa com suspeita de trauma cervical pós-acidente.',
    },
  },
  'instituto-verbena-enfermagem-processo-de-enfermagem-1776056149404-1': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Registro de enfermagem na hipoglicemia — documentar sinais/sintomas, intervenção, horários e doses administradas',
      roi_error: 'prontuario_hipoglicemia_completo',
      cluster: 'SAE prontuário — hipoglicemia (drift processo)',
      danger_footer: 'Gabarito C — registro completo',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Prontuário — hipoglicemia',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Idoso DM2 · sudorese · tremores — hipoglicemia na enfermaria.',
              icon: 'ClipboardList',
            },
            {
              label: 'Registro ideal',
              detail: 'Sinais/sintomas + glicose administrada + horários e doses.',
              icon: 'CheckCircle',
            },
            {
              label: 'Legal',
              detail: 'Anotação é documento legal — precisão e completude.',
              icon: 'Scale',
            },
            {
              label: 'Pegadinha — parcial',
              detail: 'Só vitals ou só medicação — registro incompleto.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Pegadinha — comunicação',
              detail: 'Avisar médico não substitui documentar cuidados prestados.',
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
            'Hipoglicemia — quais informações essenciais no prontuário?',
            'A só sinais vitais/sintomas sem intervenção — eliminar — incompleto.',
            'B só glicose sem sintomas clínicos — eliminar — parcial.',
            'D só comunicação com médico — eliminar — não documenta cuidado.',
            'C registro completo: sintomas + glicose + horários e doses.',
            'Marcar C.',
            'Fixação: observou + fez + quando/quanto = registro de enfermagem.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Registro — decore',
          meta: genericoSlideMeta,
          content: 'PRONTUÁRIO — HIPOGLICEMIA',
          rows: PRONTUARIO_HIPOGLICEMIA,
          footer_rule: 'Observou + interveio + registrou = defesa profissional',
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Descrição de sinais vitais e sintomas sem mencionar intervenção deixa lacuna no registro legal da conduta.',
      B: 'Relato sucinto da glicose sem sintomas clínicos omite o quadro observado antes da administração.',
      D: 'Documentar apenas comunicação com médico não registra resposta do paciente nem cuidados prestados.',
    },
  },
  'iset-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340213288-8': {
    branch: 'choque',
    pack: {
      family: 'protocolo',
      guideline:
        'Desidratação grave por diarreia — reposição com fluidos isotônicos EV e monitorização de sinais vitais (hipovolemia)',
      roi_error: 'desidratacao_grave_fluidos_ev',
      cluster: 'Desidratação grave — fluidos EV (drift punção)',
      danger_footer: 'Gabarito E — fluidos isotônicos EV',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Desidratação — conduta',
          meta: choqueSlideMeta,
          items: [
            {
              label: 'Quadro',
              detail: '75 anos · diarreia · mucosas secas · hipotensão · taquicardia · oligúria.',
              icon: 'Droplets',
            },
            {
              label: 'Gravidade',
              detail: 'Desidratação grave — perda de volume intravascular.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Prioridade',
              detail: 'Repõe volume com cristaloides isotônicos por via venosa.',
              icon: 'Syringe',
            },
            {
              label: 'Monitorar',
              detail: 'PA · FC · FR · diurese — resposta à reposição.',
              icon: 'Activity',
            },
            {
              label: 'Pegadinha',
              detail: 'Oral isolada · antibiótico · antidiarreico · glicose sem hipoglicemia.',
              icon: 'Ban',
            },
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: choqueSlideMeta,
          steps: [
            'Desidratação grave — conduta inicial mais adequada?',
            'A líquidos orais isolados — eliminar — gravidade exige EV primeiro.',
            'B antibióticos — eliminar — não substituem reposição volêmica.',
            'C antidiarreicos — eliminar — diurese vem antes de sintomáticos.',
            'D glicose EV — eliminar — sem hipoglicemia; precisa cristaloide.',
            'E fluidos isotônicos EV + monitorar sinais vitais.',
            'Marcar E.',
            'Fixação: hipovolemia por diarreia = salina EV + vigilância hemodinâmica.',
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Desidratação — decore',
          meta: choqueSlideMeta,
          content: 'HIPOVOLEMIA — REPOSIÇÃO',
          rows: DESIDRATACAO_GRAVE_IV,
          footer_rule: CHOQUE_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Desidratação grave não se corrige inicialmente só com líquidos orais — reposição venosa precede reidratação oral.',
      B: 'Antibióticos tratam causa infecciosa, mas controle da desidratação e volume é prioridade imediata.',
      C: 'Antidiarreicos não substituem reposição hídrica — volume intravascular vem primeiro.',
      D: 'Glicose intravenosa isolada não trata desidratação hipovolêmica sem hipoglicemia associada.',
    },
  },
  'lj-assessoria-enfermagem-urgencias-e-emergencias-1777104077075-6': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Avaliação inicial na emergência — priorizar via aérea pérvia e oxigenação (SpO₂) antes de exames ou anamnese prolongada',
      roi_error: 'emergencia_prioridade_via_aerea',
      cluster: 'LJ Assessoria — prioridade via aérea ABC',
      danger_footer: 'Gabarito D — SpO₂ e via aérea',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Emergência — prioridade',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Avaliação inicial na emergência — prioridade da equipe de enfermagem?',
              icon: 'Target',
            },
            {
              label: 'ABC',
              detail: 'Via aérea e oxigenação precedem procedimentos secundários.',
              icon: 'Wind',
            },
            {
              label: 'SpO₂',
              detail: 'Monitorizar saturação · intervir se hipoxemia.',
              icon: 'Activity',
            },
            {
              label: 'Pegadinha — laboratório',
              detail: 'Hemograma não estabiliza paciente instável.',
              icon: 'TestTube',
            },
            {
              label: 'Pegadinha — história/dor',
              detail: 'Anamnese e analgesia após ABC garantido.',
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
            'Emergência — prioridade da enfermagem na avaliação inicial?',
            'A exame de sangue — eliminar — não estabiliza via aérea.',
            'B história clínica detalhada — eliminar — após ABC.',
            'C medicação para dor — eliminar — via aérea primeiro.',
            'E eletrocardiograma — eliminar — secundário à respiração.',
            'D verificar SpO₂ e estabelecer via aérea.',
            'Marcar D.',
            'Fixação: A antes de B — oxigenação antes de exames e história.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'ABC — decore prioridade',
          meta: genericoSlideMeta,
          content: 'AVALIAÇÃO INICIAL — VIA AÉREA',
          rows: VIA_AEREA_PRIORIDADE,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Exame de sangue completo é secundário — não garante permeabilidade de vias aéreas nem oxigenação imediata.',
      B: 'História clínica detalhada é importante, mas vem após estabilizar respiração e via aérea.',
      C: 'Analgesia não precede avaliação e garantia de via aérea pérvia na emergência.',
      E: 'Eletrocardiograma avalia coração — prioridade inicial é oxigenação e via aérea.',
    },
  },
  'lj-assessoria-enfermagem-urgencias-e-emergencias-1777104077075-7': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'IC descompensada com sobrecarga hídrica — diurético de alça com monitorização de potássio; evitar elevar pernas e expandir volume',
      roi_error: 'ic_descompensada_diuretico_alca',
      cluster: 'LJ Assessoria — IC sobrecarga hídrica',
      danger_footer: 'Gabarito A — diurético de alça',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'IC — sobrecarga hídrica',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Problema',
              detail: 'Insuficiência cardíaca descompensada — congestão por excesso de volume.',
              icon: 'HeartPulse',
            },
            {
              label: 'Intervenção',
              detail: 'Diurético de alça para eliminar líquido acumulado.',
              icon: 'Pill',
            },
            {
              label: 'Monitorar',
              detail: 'Potássio — risco de hipocalemia com diurese.',
              icon: 'Activity',
            },
            {
              label: 'Pegadinha — pernas elevadas',
              detail: 'Aumenta retorno venoso — piora congestão pulmonar.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Pegadinha — fluidos EV',
              detail: 'Expansão volêmica contraindicada na sobrecarga.',
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
            'IC descompensada — intervenção prioritária para sobrecarga hídrica?',
            'B elevar pernas + O₂ — eliminar — agrava congestão.',
            'C PA + vasodilatador — eliminar — não é prioridade diurética desta questão.',
            'D ausculta + inotrópico — eliminar — não trata excesso hídrico direto.',
            'E punção central + fluidos — eliminar — expande volume indevidamente.',
            'A diurético de alça + monitorar potássio.',
            'Marcar A.',
            'Fixação: congestão = diurese · cuidado com K+ · não expandir volume.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'IC — decore manejo',
          meta: genericoSlideMeta,
          content: 'SOBRECARGA HÍDRICA — IC',
          rows: IC_SOBRECARGA_LIQUIDO,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Elevar pernas aumenta retorno venoso e agrava congestão pulmonar na IC descompensada.',
      C: 'Vasodilatador pode ser útil em outros contextos — sobrecarga hídrica pede diurese de alça.',
      D: 'Inotrópico positivo não é intervenção prioritária para eliminar excesso de líquido.',
      E: 'Punção venosa central com fluidos expande volume — contraindicado na sobrecarga hídrica.',
    },
  },
  'lj-assessoria-enfermagem-urgencias-e-emergencias-1777104077075-8': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline: 'Crise hipertensiva — medida prioritária imediata é anti-hipertensivo endovenoso titulado',
      roi_error: 'crise_hipertensiva_anti_hipertensivo_ev',
      cluster: 'LJ Assessoria — crise hipertensiva',
      danger_footer: 'Gabarito A — anti-hipertensivo EV',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Crise hipertensiva',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Controle imediato da PA elevada — medida prioritária?',
              icon: 'Gauge',
            },
            {
              label: 'Prioridade',
              detail: 'Anti-hipertensivo intravenoso para redução controlada da PA.',
              icon: 'Syringe',
            },
            {
              label: 'Objetivo',
              detail: 'Evitar lesão aguda de órgão-alvo — não normalizar abruptamente.',
              icon: 'HeartPulse',
            },
            {
              label: 'Pegadinha — ECG',
              detail: 'Exame complementar — não trata hipertensão aguda.',
              icon: 'Activity',
            },
            {
              label: 'Pegadinha — monitor só',
              detail: 'Monitorizar PA ≠ intervir farmacologicamente na crise.',
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
            'Crise hipertensiva — controle imediato da PA — prioridade?',
            'B solicitar ECG — eliminar — não reduz PA agora.',
            'C decúbito dorsal elevado — eliminar — adjuvante, não tratamento principal.',
            'D oxigênio suplementar — eliminar — não controla hipertensão.',
            'E monitorização contínua de PA — eliminar — necessária mas insuficiente isolada.',
            'A anti-hipertensivo intravenoso.',
            'Marcar A.',
            'Fixação: crise = droga EV titulada · monitorizar resposta.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'HAS — decore crise',
          meta: genericoSlideMeta,
          content: 'CRISE HIPERTENSIVA',
          rows: CRISE_HIPERTENSIVA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Eletrocardiograma avalia ritmo/isquemia — não é medida prioritária para controle imediato da PA.',
      C: 'Decúbito elevado auxilia conforto respiratório — não substitui anti-hipertensivo endovenoso na crise.',
      D: 'Oxigênio suplementar trata hipoxemia — não reduz pressão arterial elevada.',
      E: 'Monitorização contínua é essencial, mas crise hipertensiva exige medicação anti-hipertensiva ativa.',
    },
  },
  'objetiva-concursos-enfermagem-exames-laboratoriais-1779563613404-8': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Meningite/meningoencefalite — exame principal para confirmação diagnóstica é punção lombar com análise do LCR',
      roi_error: 'meningite_puncao_lombar_lcr',
      cluster: 'Meningite — diagnóstico LCR (drift exames)',
      danger_footer: 'Gabarito A — punção lombar LCR',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Meningite — diagnosticar',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Quadro',
              detail: 'Meningite/meningoencefalite aguda — febre · rigidez · cefaleia · alteração consciência.',
              icon: 'Brain',
            },
            {
              label: 'Exame ouro',
              detail: 'Punção lombar — coleta e análise do liquor (LCR).',
              icon: 'Syringe',
            },
            {
              label: 'Finalidade',
              detail: 'Confirmar infecção meníngea e orientar antibioticoterapia.',
              icon: 'Target',
            },
            {
              label: 'Pegadinha — urocultivo',
              detail: 'Investiga ITU — não confirma meningite.',
              icon: 'Droplets',
            },
            {
              label: 'Pegadinha — fundo de olho',
              detail: 'Papiledema pode aparecer — não substitui LCR.',
              icon: 'Eye',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Meningite aguda — principal exame para confirmar diagnóstico?',
            'B urocultivo — eliminar — trato urinário, não meníngeo.',
            'C hemocultivo — eliminar — complementar, não substitui LCR.',
            'D fundo de olho — eliminar — adjuvante, não confirmação primária.',
            'A punção lombar — análise do LCR.',
            'Marcar A.',
            'Fixação: suspeita meníngea = liquor · etiologia · conduta.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Meningite — decore exame',
          meta: genericoSlideMeta,
          content: 'DIAGNÓSTICO — LCR',
          rows: MENINGITE_DIAGNOSTICO,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Urocultivo identifica infecção urinária — não confirma meningite ou meningoencefalite.',
      C: 'Hemocultivo pode ser complementar na sepse — exame principal meníngeo é punção lombar com LCR.',
      D: 'Fundo de olho pode mostrar papiledema — não substitui análise do liquor para confirmação.',
    },
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;

  for (const [slug, entry] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));

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
    }

    ok++;
    console.log(`[handcraft:urgencias-g43] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g43] total=${ok}`);
}

main();
