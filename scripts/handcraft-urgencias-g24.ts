#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g24 (8 slugs · urgencias_rcp_pediatrico · lote 1).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides,
  metaBase,
  MS_ANAFILAXIA_SOURCE,
  pedRcpRows,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasRcpPediatricGolden';

const LOTE = 'urgencias-g24';
const REVIEWER = 'handcraft-urgencias-g24';

const PED_L3_FOOTER = 'RCP pediátrica — 15:2 · ~⅓ AP · 100–120/min';

const SPECS: Record<string, Pack> = {
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-6': {
    family: 'vf',
    guideline: 'VF RCP adulto — Afirmativa I V · II F (15:2 pediatria) · III V · IV F (pulso prolongado)',
    roi_error: 'vf_rcp_adulto_contraste_pediatrico',
    cluster: 'VF I–IV — RCP adulto (contraste com pediatria)',
    danger_footer: 'Gabarito A — V,F,V,F',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'VF — RCP adulto',
        meta: slideMeta,
        items: [
          { label: 'Suporte Básico de Vida', detail: 'Atendimento inicial na parada cardiorrespiratória ou engasgo — manter oxigenação cerebral.', icon: 'HeartPulse' },
          { label: 'Afirmativa I', detail: 'Frequência 100–120/min na RCP em adultos — verdadeira.', icon: 'Activity' },
          { label: 'Afirmativa II', detail: '15:2 com dois socorristas é pediatria — falsa no adulto (30:2).', icon: 'Users' },
          { label: 'Afirmativa III', detail: 'DEA ligado imediatamente após chegada — verdadeira.', icon: 'Zap' },
          { label: 'Pegadinha — Afirmativa IV', detail: 'Checar pulso carotídeo por um minuto inteiro — falsa; checagem breve.', icon: 'Ban' },
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Suporte Básico de Vida — RCP em adultos — julgar afirmativas I a IV:',
          'Afirmativa I — frequência 100–120/min: V.',
          'Afirmativa II — 15:2 com dois socorristas: F (adulto = 30:2; 15:2 é pediatria).',
          'Afirmativa III — DEA imediato: V.',
          'Afirmativa IV — pulso carotídeo por um minuto inteiro: F.',
          'Sequência V,F,V,F — marcar A.',
          'Fixação: 15:2 no VF adulto é isca pediátrica.',
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADULTO × PEDIATRIA',
        rows: [
          { label: 'Afirmativa II (adulto)', value: '30:2 — não 15:2', badge: 'hot' },
          { label: 'Afirmativa IV (pulso)', value: 'Checagem breve — não sessenta segundos', badge: 'warn' },
          { label: 'Frequência', value: '100–120/min — ambos', badge: 'ok' },
          { label: 'DEA', value: 'Ligar assim que disponível', badge: 'info' },
        ],
        footer_rule: PED_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'avancasp-geral-urgencias-e-emergencias-1777104083571-3': {
    family: 'protocolo',
    guideline: 'AHA 2020 — PCR na gravidez: monitorar feto durante RCP materna',
    roi_error: 'aha2020_gravidez_monitor_fetal',
    cluster: 'AHA 2020 — atualizações PCR gravidez/pediatria',
    danger_footer: 'Gabarito B — monitorar feto na PCR gestante',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'AHA 2020 — gravidez',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Atualizações AHA 2020 — PCR na gestante e pediatria.', icon: 'BookOpen' },
          { label: 'Feto', detail: 'Monitoramento fetal não deve ser ignorado durante RCP materna.', icon: 'Baby' },
          { label: 'Compressões', detail: 'Priorizar compressão torácica na gestante com hipóxia.', icon: 'HeartPulse' },
          { label: 'Pegadinha — leigos', detail: 'Leigos devem iniciar RCP se não responsiva — não evitar por medo.', icon: 'Ban' },
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'AHA 2020 — assinalar afirmativa correta:',
          'Eliminar leigos não iniciarem RCP — risco de não fazer é maior que fazer em não-PCR.',
          'Eliminar só compressão sem considerar feto — monitoramento fetal continua na gestante.',
          'Eliminar cuff obrigatório em bebês — tubo sem cuff também é permitido.',
          'Eliminar pressão cricoide rotineira em pediatria — não é recomendação atual.',
          'Monitorar feto durante PCR na gravidez — marcar B.',
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PCR NA GESTANTE',
        rows: [
          { label: 'Feto', value: 'Monitorar durante RCP materna', badge: 'hot' },
          { label: 'Compressões', value: 'Priorizar na hipóxia gestacional', badge: 'ok' },
          { label: 'Leigos', value: 'Iniciar RCP se não responsiva', badge: 'info' },
          { label: 'Cricoide pediátrica', value: 'Não rotineira na intubação', badge: 'warn' },
        ],
        footer_rule: PED_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780007246385-3': {
    family: 'protocolo',
    guideline: 'Anafilaxia pediátrica — epinefrina IM coxa imediata; IV só PCR/choque refratário',
    roi_error: 'anafilaxia_ped_epinefrina_im_iv',
    cluster: 'Criança 7 anos — anafilaxia pós-dipirona (asserções I/II)',
    danger_footer: 'Gabarito C — I e II verdadeiras, II justifica I',
    branch: 'urgencias_anafilaxia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Anafilaxia pediátrica',
        meta: slideMeta,
        items: [
          { label: 'Quadro', detail: 'Urticária, angioedema, dispneia após medicamento — anafilaxia.', icon: 'AlertTriangle' },
          { label: 'Via IM', detail: 'Epinefrina IM imediata na face ântero-lateral da coxa.', icon: 'Syringe' },
          { label: 'Via IV', detail: 'Reservada a PCR ou hipotensão refratária após IM/volume.', icon: 'Activity' },
          { label: 'Asserções', detail: 'I verdadeira + II explica por que IM vem antes de IV.', icon: 'Link' },
        ],
        footer_rule: 'Anafilaxia pediátrica — epinefrina IM imediata',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Asserções sobre epinefrina na anafilaxia da criança:',
          'Avaliar I — via IM na coxa é correta na anafilaxia: verdadeira.',
          'Avaliar II — IV só em PCR/choque refratário: verdadeira.',
          'II justifica I — IM é primeira linha porque IV é reserva crítica.',
          'Marcar C — ambas verdadeiras e II justifica I.',
        ],
        footer_rule: 'IM primeiro — IV só crítico',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EPINEFRINA — ANAFILAXIA',
        rows: [
          { label: '1ª linha', value: 'IM face ântero-lateral da coxa — imediata', badge: 'hot' },
          { label: 'IV', value: 'PCR ou hipotensão refratária após IM/volume', badge: 'warn' },
          { label: 'Contexto', value: 'Criança com urticária + angioedema + dispneia', badge: 'info' },
        ],
        footer_rule: 'Anafilaxia: IM na coxa sem atrasar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ASSERÇÕES ANAFILAXIA',
        items: [
          {
            label: 'Letra A — II falsa',
            detail: 'Sugere que reserva de IV para crise não procede.',
            correct: 'IV em anafilaxia existe sim — mas só em PCR ou refratariedade após IM.',
          },
          {
            label: 'Letra B — sem justificativa',
            detail: 'Aceita ambas verdadeiras mas nega o vínculo causal.',
            correct: 'II explica por que IM é via de escolha: IV é reserva para cenário crítico.',
          },
          {
            label: 'Letra D — I falsa',
            detail: 'Nega a via IM correta na anafilaxia pediátrica.',
            correct: 'IM na coxa é conduta imediata de suporte básico na anafilaxia.',
          },
          {
            label: 'Letra E — ambas falsas',
            detail: 'Descarta protocolo institucional vigente.',
            correct: 'I e II estão alinhadas ao protocolo — ambas verdadeiras.',
          },
        ],
        footer_rule: 'C = I verdadeira + II justifica',
      },
    ],
  },
  'fcpc-enfermagem-processo-de-enfermagem-1780004628956-5': {
    family: 'protocolo',
    guideline: 'PCR hospitalar — técnico isolado inicia 30:2 a 100–120/min até equipe chegar',
    roi_error: 'rcp_hospitalar_isolado_30_2',
    cluster: 'Internação — acompanhante avisa que familiar está passando mal',
    danger_footer: 'Gabarito B — 30:2 isolado até reforço',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'RCP — técnico isolado',
        meta: slideMeta,
        items: [
          { label: 'Cenário', detail: 'Acompanhante na enfermaria — paciente internado inconsciente, sem movimentos respiratórios e sem pulso.', icon: 'Bed' },
          { label: 'Acionamento', detail: 'Outra técnica chama enfermeiro e médico; você inicia manobras de reanimação cardiopulmonar.', icon: 'User' },
          { label: 'AHA', detail: 'American Heart Association — conduta imediata com compressões e ventilações 30:2.', icon: 'HeartPulse' },
          { label: 'Pegadinha — medicação', detail: 'Epinefrina em bolus por ordem verbal do médico não antecede compressões.', icon: 'Ban' },
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Paciente inconsciente sem pulso — recomendações atuais American Heart Association:',
          'Eliminar bolus medicamentoso antes de compressões — ciclo começa nas compressões.',
          'Eliminar 15:2 isolado — 15:2 exige dois socorristas; técnico prontamente inicia sozinho com 30:2.',
          'Eliminar só 2 ventilações de resgate e depois comprimir — sequência integrada 30:2.',
          'Iniciar compressões torácicas 30:2 a 100–120/min até demais membros da equipe chegarem — marcar B.',
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SOCORRISTAS × PROPORÇÃO',
        rows: pedRcpRows(),
        footer_rule: PED_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-2': {
    family: 'protocolo',
    guideline: 'American Heart Association — adulto sem via aérea definitiva: 30:2',
    roi_error: 'adulto_30_2_contraste_ped',
    cluster: 'AHA — relação compressão-ventilação no adulto',
    danger_footer: 'Gabarito A — 30:2 adulto',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'AHA — proporção adulto',
        meta: slideMeta,
        items: [
          { label: 'American Heart Association', detail: 'Relação compressão-ventilação no adulto sem via aérea definitiva.', icon: 'BookOpen' },
          { label: 'Adulto', detail: '30 compressões : 2 ventilações.', icon: 'Users' },
          { label: 'Pediatria (contraste)', detail: 'Dois socorristas: 15:2 — não confundir no mesmo ramo.', icon: 'Baby' },
          { label: 'Pegadinha — 15:2', detail: '15:2 é isca pediátrica em questão de adulto.', icon: 'Ban' },
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Segundo a American Heart Association — adultos sem via aérea definitiva:',
          'Eliminar 3:1 — neonatal com VA avançada, não adulto SBV.',
          'Eliminar 15:2 — proporção pediátrica com dois socorristas.',
          'Eliminar 20:2 e 30:1 — não são padrão AHA adulto SBV.',
          'Relação compressão-ventilação 30:2 — marcar A.',
          'Fixação: mesmo ramo pediátrico cobra 15:2 em outro card — leia o enunciado.',
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PROPORÇÃO C:V',
        rows: pedRcpRows(),
        footer_rule: PED_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'instituto-access-enfermagem-urgencias-e-emergencias-1777104007115-1': {
    family: 'protocolo',
    guideline: 'RCP pediátrica sem VA avançada — 15:2 · ~⅓ AP · 100–120/min · retorno total',
    roi_error: 'rcp_ped_15_2_terco_ap',
    cluster: 'PCR pediátrica — parâmetros de alta qualidade',
    danger_footer: 'Gabarito D — terço AP + 15:2',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'RCP pediátrica — parâmetros',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'PCR pediátrica sem VA avançada — alta qualidade.', icon: 'Target' },
          { label: 'Proporção', detail: 'Dois socorristas: 15:2 — não 30:2 do adulto.', icon: 'Users' },
          { label: 'Profundidade', detail: 'Cerca de um terço do diâmetro AP — não metade.', icon: 'Activity' },
          { label: 'Ritmo', detail: '100–120/min com retorno total do tórax.', icon: 'HeartPulse' },
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR pediátrica sem VA avançada — parâmetros corretos:',
          'Eixo proporção: pediatria com 2 socorristas = 15:2.',
          'Eixo profundidade: ~⅓ do diâmetro AP — metade é excessivo.',
          'Eliminar 30:2 mesmo com terço correto.',
          'Eliminar 15:2 com metade do tórax.',
          'Terço AP + 15:2 + 100–120 + retorno total — marcar D.',
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PEDIATRIA × ADULTO',
        rows: pedRcpRows([
          { label: 'Retorno torácico', value: 'Completo entre compressões', badge: 'ok' },
          { label: 'Adulto (contraste)', value: '30:2 · 5–6 cm', badge: 'warn' },
        ]),
        footer_rule: PED_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780005311822-4': {
    family: 'conceito',
    guideline: 'PCR pediátrica — causa respiratória/choque · reconhecimento precoce · RCP + DEA',
    roi_error: 'pcr_ped_conceito_causa_respiratoria',
    cluster: 'PCR pediátrica — epidemiologia e princípios',
    danger_footer: 'Gabarito A — insuficiência respiratória/choque',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PCR pediátrica — panorama',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Princípios SBV em bebês e crianças.', icon: 'Target' },
          { label: 'Causa usual', detail: 'Hipóxia/insuficiência respiratória ou choque — não causa cardíaca primária.', icon: 'Wind' },
          { label: 'Tempo', detail: 'Reconhecimento precoce evita PCR.', icon: 'Clock' },
          { label: 'Conduta', detail: 'RCP alta qualidade + DEA quando indicado.', icon: 'HeartPulse' },
          { label: 'Pegadinha — mini-adulto', detail: 'Banca transfere lógica cardíaca do adulto para bebês e crianças.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Pediatria: respiração/choque → RCP precoce',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Princípios PCR em bebês e crianças:',
          'Eliminar causa cardíaca primária como regra pediátrica.',
          'Eliminar reconhecimento tardio sem impacto.',
          'Eliminar adiar RCP até estabilização respiratória completa.',
          'Insuficiência respiratória/choque + reconhecimento + RCP + DEA — marcar A.',
        ],
        footer_rule: 'Causa respiratória/choque → RCP sem atrasar',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DIFERENÇA DO ADULTO',
        rows: [
          { label: 'Causa frequente', value: 'Insuficiência respiratória ou choque', badge: 'hot' },
          { label: 'Adulto (contraste)', value: 'Causa cardíaca primária mais comum', badge: 'info' },
          { label: 'Prevenção', value: 'Reconhecimento precoce do estado crítico', badge: 'ok' },
          { label: 'Tratamento', value: 'RCP alta qualidade + desfibrilação se indicada', badge: 'warn' },
        ],
        footer_rule: 'Prevenir · reconhecer · reanimar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PCR PEDIÁTRICA CONCEITUAL',
        items: [
          {
            label: 'Letra B — causa cardíaca primária',
            detail: 'Parece lógico priorizar desfibrilação como no adulto.',
            correct: 'Em bebês/crianças, PCR costuma ser secundária a hipóxia ou choque — não inverter a sequência.',
          },
          {
            label: 'Letra C — reconhecimento tardio basta',
            detail: 'Minimiza deterioração pré-PCR.',
            correct: 'Reconhecimento precoce do estado crítico melhora desfecho — tempo importa.',
          },
          {
            label: 'Letra D — RCP só após estabilizar',
            detail: 'Parece prudente “arrumar respiração” antes de comprimir.',
            correct: 'PCR estabelecida exige RCP imediata — não adiar compressões por estabilização completa.',
          },
          {
            label: 'Pegadinha — mini-adulto cardíaco',
            detail: 'Em outra questão, a banca cobra 15:2 e terço do tórax na RCP pediátrica.',
            correct: 'Conceito (causa respiratória/choque) e parâmetro (15:2 · terço AP) são cards diferentes no mesmo ramo.',
          },
        ],
        footer_rule: 'Não trate criança como mini-adulto cardíaco',
      },
    ],
  },
  'quadrix-enfermagem-urgencias-e-emergencias-1777103988389-7': {
    family: 'protocolo',
    guideline: 'Afogamento pediátrico — sem pulso e sem respiração: iniciar reanimação cardiopulmonar',
    roi_error: 'afogamento_ped_iniciar_rcp',
    cluster: 'Primeiros-socorros — acidente envolvendo criança',
    danger_footer: 'Gabarito C — RCP no afogamento sem pulso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Primeiros-socorros — criança',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Diante de acidente com criança — prestar primeiros-socorros corretos.', icon: 'Target' },
          { label: 'Afogamento', detail: 'Sem pulso e sem respiração = reanimação cardiopulmonar imediata.', icon: 'Waves' },
          { label: 'Escoriação leve', detail: 'Lavar com soro fisiológico — sem esponja abrasiva.', icon: 'Bandage' },
          { label: 'Pegadinha — álcool', detail: 'Álcool em queimadura ou choque elétrico é conduta errada.', icon: 'Ban' },
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Acidente envolvendo criança — primeiros-socorros — alternativa correta:',
          'Eliminar esponja abrasiva em escoriação — irrita e infecta.',
          'Eliminar obstruir vias aéreas no engasgo — conduta oposta.',
          'Eliminar álcool no nariz após choque elétrico — inútil e irritante.',
          'Eliminar álcool concentrado em queimadura de terceiro grau — agrava lesão.',
          'Afogamento sem pulso/respiração — iniciar reanimação cardiopulmonar — marcar C.',
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'AFOGAMENTO PEDIÁTRICO',
        rows: [
          { label: 'Sem pulso/respiração', value: 'Iniciar reanimação cardiopulmonar imediatamente', badge: 'hot' },
          { label: 'Retirada da água', value: 'Segurança da cena + acionar socorro', badge: 'info' },
          { label: 'Não fazer', value: 'Álcool em ferida · obstruir VA · esperar', badge: 'warn' },
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRIMEIROS-SOCORROS CRIANÇA',
        items: [
          {
            label: 'Letra A — esponja abrasiva',
            detail: 'Propõe lavar escoriação leve com esponja abrasiva.',
            correct: 'Escoriação leve — lavar com soro fisiológico, sem abrasivo.',
          },
          {
            label: 'Letra B — obstruir vias aéreas',
            detail: 'Sugere posicionar para obstruir vias aéreas no engasgo.',
            correct: 'No engasgo, desobstruir — nunca obstruir as vias aéreas.',
          },
          {
            label: 'Letra D — álcool no nariz',
            detail: 'Propõe álcool perto do nariz após choque elétrico.',
            correct: 'Álcool no nariz não avalia consciência com segurança após choque.',
          },
          {
            label: 'Letra E — álcool em queimadura',
            detail: 'Propõe lavar queimadura de terceiro grau com álcool concentrado.',
            correct: 'Álcool em queimadura grau III agrava a lesão — usar água corrente.',
          },
        ],
        footer_rule: 'Gabarito C — RCP no afogamento',
      },
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-6': {
    B: 'Inverte V/F — aceita 15:2 no adulto e pulso prolongado.',
    C: 'Marca 15:2 como verdadeiro no adulto — é parâmetro pediátrico.',
    D: 'Pulso por um minuto inteiro como verdadeiro — checagem deve ser breve.',
  },
  'avancasp-geral-urgencias-e-emergencias-1777104083571-3': {
    A: 'Leigos devem iniciar RCP em vítima não responsiva — hesitar aumenta mortalidade.',
    C: 'Ignorar monitoramento fetal na gestante — AHA mantém vigilância fetal na RCP materna.',
    D: 'Cuff obrigatório em bebês — tubo sem cuff também é opção válida.',
    E: 'Pressão cricoide rotineira em pediatria — não é recomendação atual AHA.',
  },
  'fcpc-enfermagem-processo-de-enfermagem-1780004628956-5': {
    A: 'Bolus medicamentoso não antecede compressões no SBV — iniciar 30:2 primeiro.',
    C: '15:2 exige dois socorristas — técnico isolado usa 30:2.',
    D: 'Duas ventilações isoladas atrasam compressões contínuas — ciclo integrado 30:2.',
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-2': {
    B: '3:1 é relação neonatal com VA avançada — não adulto SBV.',
    C: '15:2 é pediatria com dois socorristas — enunciado pede adulto.',
    D: '20:2 não é proporção padrão AHA para adulto sem VA definitiva.',
    E: '30:1 não corresponde ao protocolo SBV adulto vigente.',
  },
  'instituto-access-enfermagem-urgencias-e-emergencias-1777104007115-1': {
    A: '30:2 é adulto — pediatria com dois socorristas exige 15:2.',
    B: 'Metade do tórax comprime demais; 30:2 também é adulto.',
    C: 'Acerta 15:2 mas profundidade deve ser ~⅓ AP, não metade.',
  },
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780005311822-4': {
    B: 'PCR pediátrica raramente é cardíaca primária — desfibrilar antes de reconhecer é erro.',
    C: 'Reconhecimento precoce melhora desfecho — não é irrelevante.',
    D: 'PCR estabelecida exige RCP imediata — não após estabilização completa.',
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const slides = finalizeSlides(slug, raw, pack, DANGER_OVERRIDES);
    const out = {
      meta: metaBase(
        raw,
        pack.family,
        pack.guideline,
        slug,
        pack.roi_error,
        pack.cluster,
        REVIEWER,
        pack.branch,
        pack.exam_vs_current,
        pack.branch === 'urgencias_anafilaxia' ? [MS_ANAFILAXIA_SOURCE] : undefined,
      ),
      question_data: raw.question_data,
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g24] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g24] total=${ok}`);
}

main();
