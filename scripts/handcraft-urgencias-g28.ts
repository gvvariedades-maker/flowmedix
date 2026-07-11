#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g28 (4 slugs · urgencias_manchester_triagem · lote final 4/4).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides,
  manchesterColorRows,
  metaBase,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasManchesterGolden';

const LOTE = 'urgencias-g28';
const REVIEWER = 'handcraft-urgencias-g28';

const MANCHESTER_FOOTER = 'Vermelho imediato · verde/azul esperam';

const SPECS: Record<string, Pack> = {
  'ameosc-enfermagem-processo-de-enfermagem-1780011967989-1': {
    family: 'protocolo',
    guideline: 'Triagem vítimas múltiplas — vermelho emergência · amarelo monitorar · verde leve · azul não urgente',
    roi_error: 'etiquetas_inversao_cores',
    cluster: 'Triagem múltiplas vítimas — etiquetas coloridas',
    danger_footer: 'Gabarito A — vermelho = emergência',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Triagem — etiquetas',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Vítimas múltiplas com recursos limitados — assinale a afirmativa CORRETA sobre etiquetas coloridas.',
            icon: 'Target',
          },
          {
            label: 'Princípio',
            detail: 'Salvar o maior número — priorizar gravidade e chance de sobrevivência.',
            icon: 'Users',
          },
          {
            label: 'Vermelho',
            detail: 'Emergência/imediato — risco de morte, atendimento agora.',
            icon: 'Circle',
          },
          {
            label: 'Amarelo · Verde · Azul',
            detail: 'Amarelo = urgente (monitorar) · Verde = leve · Azul = não urgente.',
            icon: 'Tags',
          },
          {
            label: 'Pegadinha',
            detail: 'A banca inverte cores: azul não é instabilidade; amarelo não dispensa SSVV.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Vermelho = emergência',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: triagem de vítimas múltiplas — afirmativa CORRETA sobre etiquetas coloridas.',
          'Princípio: priorizar gravidade e chance de sobrevivência com recursos limitados.',
          'Mapa mental: vermelho = emergência imediata; amarelo = urgente com monitoramento.',
          'Verde = leve/pouco urgente; azul = não urgente — nunca instabilidade crítica.',
          'Eliminar afirmativa que dispensa monitoramento no amarelo.',
          'Eliminar afirmativa que coloca instabilidade no azul.',
          'Eliminar afirmativa que confunde verde com prioridade de transporte.',
          'Resta vermelho = emergência no atendimento.',
          'Marcar A.',
          'Fixação: em qualquer sistema de cores, vermelho é prioridade máxima.',
        ],
        footer_rule: 'Gravidade → cor → prioridade',
      },
      {
        type: 'golden_rule',
        slide_title: 'Cores da triagem',
        meta: slideMeta,
        content: 'ETIQUETAS — DECORE',
        rows: manchesterColorRows(),
        footer_rule: MANCHESTER_FOOTER,
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CORES DA TRIAGEM',
        items: [
          {
            label: 'Letra B — amarelo sem monitorar',
            detail: 'Parece que amarelo é “menos grave” e pode ficar sem vigilância.',
            correct: 'Amarelo = urgente/retardado — requer monitoramento de sinais e reavaliação.',
          },
          {
            label: 'Letra C — azul = instável',
            detail: 'Confunde azul (baixa urgência) com vermelho (crítico).',
            correct: 'Instabilidade prioriza vermelho; azul é não urgente no protocolo Manchester.',
          },
          {
            label: 'Letra D — verde = transporte rápido',
            detail: 'Verde parece “pode ir logo” e seduz como prioridade logística.',
            correct: 'Verde = vítima leve/ambulante — menor prioridade de atendimento imediato.',
          },
        ],
        footer_rule: 'Gabarito A — vermelho = emergência',
      },
    ],
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006947080-7': {
    family: 'protocolo',
    guideline: 'Classificação de risco Manchester — adaptação do triage militar americano (guerras séc. XX)',
    roi_error: 'manchester_origem_militar',
    cluster: 'Manchester — origem do protocolo de classificação de risco',
    danger_footer: 'Gabarito D — método militar americano',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Classificação de risco — origem',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Protocolo que classifica quem precisa ser acolhido primeiro — surgiu como adaptação de qual método?',
            icon: 'Target',
          },
          {
            label: 'Finalidade',
            detail: 'Evitar agravamento — priorizar estados mais críticos no pronto-socorro.',
            icon: 'Activity',
          },
          {
            label: 'Manchester',
            detail: 'Sistema de cores no PS — vermelho a azul conforme gravidade.',
            icon: 'Tags',
          },
          {
            label: 'Origem histórica',
            detail: 'Deriva do triage militar americano usado em guerras do século XX.',
            icon: 'History',
          },
          {
            label: 'Pegadinha',
            detail: 'Confundir com profilaxia, propedêutica ou Helsinque — não é o método de origem.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Manchester = triage militar adaptado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Classificação de risco — identificar a origem do método adaptado:',
          'Eliminar profilático — medida preventiva, não sistema de priorização em urgência.',
          'Eliminar propedêutico — investigação diagnóstica, não triagem de gravidade.',
          'Eliminar condutivo — termo genérico sem vínculo com Manchester.',
          'Eliminar protocolo de Helsinque — ética em pesquisa, não triagem hospitalar.',
          'Resta adaptação do método utilizado pelos militares americanos nas guerras do século XX.',
          'Marcar D.',
          'Fixação: Manchester no SUS deriva do triage militar — depois ganhou cores no PS.',
        ],
        footer_rule: 'Origem militar → cores no PS',
      },
      {
        type: 'golden_rule',
        slide_title: 'Manchester — decore',
        meta: slideMeta,
        content: 'MANCHESTER — ORIGEM E CORES',
        rows: [
          { label: 'Origem', value: 'Triage militar americano — guerras séc. XX', badge: 'hot' },
          { label: 'Objetivo PS', value: 'Acolher primeiro quem pode deteriorar', badge: 'ok' },
          ...manchesterColorRows().slice(0, 4),
        ],
        footer_rule: 'História + espectro cromático',
      },
      null as unknown,
    ],
  },
  'instituto-verbena-enfermagem-processo-de-enfermagem-1780008197597-9': {
    family: 'protocolo',
    guideline: 'Dor torácica no PS — sinais de gravidade isquêmica exigem comunicação imediata ao enfermeiro',
    roi_error: 'dor_toracica_subtriagem',
    cluster: 'Manchester aplicado — dor torácica e classificação de risco',
    danger_footer: 'Gabarito A — comunicar origem isquêmica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dor torácica — triagem',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário',
            detail: 'Paciente com dor torácica no serviço de urgência — classificação de risco ativa.',
            icon: 'Target',
          },
          {
            label: 'Papel do técnico',
            detail: 'Reconhecer sinais de gravidade e comunicar prontamente à equipe de enfermagem.',
            icon: 'Users',
          },
          {
            label: 'Origem isquêmica',
            detail: 'Dor que sugere isquemia miocárdica — prioridade alta (vermelho/amarelo no Manchester).',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — idade jovem',
            detail: 'Jovem sem fatores de risco não dispensa avaliação — IAM pode ocorrer em qualquer faixa.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Dor isquêmica = comunicar já',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Dor torácica no PS — conduta adequada do técnico conforme classificação de risco:',
          'Eliminar baixa prioridade só por idade jovem — gravidade não depende só de fatores de risco.',
          'Eliminar reduzir prioridade por dor atípica em mulher — apresentação atípica não é menos grave.',
          'Eliminar dispensar avaliação imediata se dor melhora no repouso — alívio transitório não exclui IAM.',
          'Comunicar imediatamente ao enfermeiro quando a dor sugerir origem isquêmica — marcar A.',
          'Fixação: no Manchester, sinais de gravidade isquêmica não esperam fila.',
        ],
        footer_rule: 'Gravidade clínica > perfil demográfico',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DOR TORÁCICA — TRIAGEM',
        rows: [
          { label: 'Sinais graves', value: 'Dor opressiva · irradiação · sudorese · náusea', badge: 'hot' },
          { label: 'Conduta técnico', value: 'Comunicar enfermeiro imediatamente se suspeita isquêmica', badge: 'hot' },
          { label: 'Não fazer', value: 'Subtriagem por idade, sexo ou melhora ao repouso', badge: 'warn' },
          { label: 'Manchester', value: 'Suspeita isquêmica = prioridade alta — não verde/azul', badge: 'warn' },
        ],
        footer_rule: 'Isquemia suspeita → acionar equipe',
      },
      null as unknown,
    ],
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104038968-9': {
    family: 'protocolo',
    guideline: 'Manchester no PS — verde = pouco urgente, prioridade sem emergência imediata',
    roi_error: 'verde_emergencia_inversao',
    cluster: 'Manchester PS — significado da cor verde',
    danger_footer: 'Gabarito D — prioridade, porém não urgente',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Manchester — cor verde',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Unidade de emergência — paciente classificado com cor verde receberá atendimento como?',
            icon: 'Target',
          },
          {
            label: 'Sistema',
            detail: 'Classificação de risco prioriza conforme grau de gravidade — não ordem de chegada isolada.',
            icon: 'Activity',
          },
          {
            label: 'Verde',
            detail: 'Pouco urgente — pode aguardar mais que vermelho e amarelo.',
            icon: 'Circle',
          },
          {
            label: 'Pegadinha',
            detail: 'Verde não é emergência nem urgência rápida — é prioridade sem caráter emergencial.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Verde = pouco urgente',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Manchester no PS — significado da classificação verde:',
          'Eliminar emergência com atendimento imediato — isso é vermelho, não verde.',
          'Eliminar urgência o mais rápido possível — isso é amarelo, não verde.',
          'Eliminar atendimento só por horário de chegada — triagem é por risco, não FIFO puro.',
          'Verde = prioridade, porém não urgente — marcar D.',
          'Fixação: verde ocupa o meio-baixo do espectro — aguarda após críticos.',
        ],
        footer_rule: MANCHESTER_FOOTER,
      },
      {
        type: 'golden_rule',
        slide_title: 'Verde no Manchester',
        meta: slideMeta,
        content: 'MANCHESTER — COR VERDE',
        rows: manchesterColorRows([
          { label: 'Verde (foco)', value: 'Pouco urgente — prioridade sem emergência', badge: 'ok' },
        ]),
        footer_rule: 'Verde ≠ vermelho nem amarelo',
      },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'fundatec-enfermagem-processo-de-enfermagem-1780006947080-7': {
    A: 'Profilático é medida preventiva — não descreve a origem do sistema Manchester de triagem.',
    B: 'Propedêutico refere-se à investigação clínica — não ao método de classificação de risco.',
    C: 'Condutivo é termo genérico sem relação com a adaptação do triage militar.',
    E: 'Protocolo de Helsinque trata de ética em pesquisa — não de triagem hospitalar.',
  },
  'instituto-verbena-enfermagem-processo-de-enfermagem-1780008197597-9': {
    B: 'Idade jovem e ausência de fatores de risco não dispensam priorização — dor isquêmica pode ocorrer.',
    C: 'Dor atípica em mulheres não reduz prioridade — apresentação atípica exige vigilância igual.',
    D: 'Melhora ao repouso não exclui síndrome isquêmica — avaliação imediata permanece indicada.',
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104038968-9': {
    A: 'Emergência com atendimento imediato é vermelho — verde é pouco urgente no Manchester.',
    B: 'Urgência o mais rápido possível é amarelo — verde aguarda após casos mais graves.',
    C: 'Triagem por risco não é atendimento apenas por horário de chegada — gravidade define a fila.',
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
      meta: metaBase(raw, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER),
      question_data: raw.question_data,
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g28] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g28] total=${ok}`);
}

main();
