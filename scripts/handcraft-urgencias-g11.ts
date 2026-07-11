#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g11 (8 slugs · urgencias_exceto_conduta).
 *
 *   npx tsx scripts/handcraft-urgencias-g11.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

import { dangerExceto, metaBase, slideMeta, type Q } from './lib/urgenciasExcetoGolden';

const LOTE = 'urgencias-g11';
const REVIEWER = 'handcraft-urgencias-g11';

type Spec = {
  family: 'protocolo' | 'conceito' | 'vf';
  guideline: string;
  roiError: string;
  cluster: string;
  buildSlides: (q: Q) => unknown[];
};

const SPECS: Record<string, Spec> = {
  // 1) Processo de Enfermagem (crise hipertensiva) — INCORRETA nifedipina sublingual
  'fundatec-enfermagem-processo-de-enfermagem-1780006962671-4': {
    family: 'protocolo',
    guideline:
      'Crise hipertensiva — urgência trata via oral com redução gradual; emergência (lesão de órgão-alvo) usa via parenteral monitorizada; nifedipina sublingual causa queda descontrolada, não recomendada',
    roiError: 'crise_hipertensiva_nifedipina_sublingual_incorreta',
    cluster: 'Crise hipertensiva — via de administração, alternativa INCORRETA',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'Crise hipertensiva — urgência x emergência',
        chip_label: 'CARDIO',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail:
              'Crise hipertensiva — a classificação em urgência ou emergência depende da presença de lesão aguda de órgão-alvo, e define via e velocidade de redução.',
            icon: 'Gauge',
          },
          {
            label: 'Urgência hipertensiva',
            detail: 'Sem lesão de órgão-alvo — tratamento inicial por via oral, com redução gradual da pressão.',
            icon: 'Pill',
          },
          {
            label: 'Emergência hipertensiva',
            detail: 'Com lesão aguda de órgão-alvo — via parenteral (ex.: nitroprussiato de sódio) sob monitorização rigorosa.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — nifedipina sublingual',
            detail:
              'A via sublingual da nifedipina não é recomendada — provoca queda descontrolada e imprevisível da pressão, com risco de isquemia.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Sublingual não é sinônimo de seguro em crise hipertensiva',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Manejo medicamentoso da crise hipertensiva — assinale a alternativa INCORRETA:',
          'Testar letra A — via oral é aceita na urgência hipertensiva, sem lesão de órgão-alvo → eliminar.',
          'Testar letra C — redução deve ser gradual, com atenção redobrada logo no início → eliminar.',
          'Testar letra D — via parenteral é reservada para emergências, sempre monitorizada → eliminar.',
          'Testar letra E — a decisão terapêutica sempre leva em conta a lesão de órgão-alvo → eliminar.',
          'Resta letra B — apontar a via sublingual como opção rápida e segura contraria a diretriz atual.',
          'Marcar B.',
        ],
        footer_rule: 'Queda rápida e descontrolada nunca é "segura"',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CRISE HIPERTENSIVA — URGÊNCIA X EMERGÊNCIA',
        rows: [
          { label: 'Urgência', value: 'Sem lesão de órgão-alvo — via oral, redução gradual', badge: 'ok' },
          { label: 'Emergência', value: 'Lesão aguda de órgão-alvo — via parenteral, monitorização rigorosa', badge: 'hot' },
          { label: 'Sublingual', value: 'Via não recomendada — queda descontrolada da pressão', badge: 'warn' },
          { label: 'Decisão', value: 'Sempre avaliar lesão de órgão-alvo antes de escolher via/velocidade', badge: 'info' },
        ],
        footer_rule: 'Via e velocidade de redução dependem da lesão de órgão-alvo',
      },
      dangerExceto(
        q,
        'INCORRETA — MANEJO DA CRISE HIPERTENSIVA',
        {
          A: 'Tratamento inicial por via oral na urgência hipertensiva, sem lesão de órgão-alvo, é conduta correta.',
          C: 'Redução gradual da pressão arterial, com atenção redobrada logo no início, é conduta correta.',
          D: 'Reservar a via parenteral para emergências selecionadas, sempre sob monitorização, é conduta correta.',
          E: 'Considerar a presença de lesão aguda de órgão-alvo na escolha da conduta terapêutica é premissa correta.',
        },
        'Apontar a via sublingual como opção rápida e segura é a afirmativa incorreta — essa via causa queda descontrolada da pressão, com risco de isquemia.',
        'Gabarito B — via sublingual não é rápida e segura, é contraindicada',
      ),
    ],
  },

  // 2) Manchester — INCORRETA tempo laranja
  'fundatec-enfermagem-urgencias-e-emergencias-1777103994618-3': {
    family: 'protocolo',
    guideline:
      'Protocolo de Manchester — laranja (muito urgente) atendimento em tempo curtíssimo; vermelho emergente imediato; amarelo tempo intermediário; verde espera maior; azul encaminhamento',
    roiError: 'manchester_laranja_tempo_incorreta',
    cluster: 'Manchester — alternativa INCORRETA sobre tempos de atendimento',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'Protocolo de Manchester',
        chip_label: 'TRIAGEM',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail: 'Classificação de risco na urgência — triagem rápida com cores e tempos máximos de atendimento.',
            icon: 'ClipboardList',
          },
          {
            label: 'Vermelho — emergente',
            detail: 'Infarto, politrauma, PCR — atendimento imediato.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — tempo laranja errado',
            detail: 'Muito urgente (laranja) exige tempo curtíssimo no Manchester — banca infla o prazo.',
            icon: 'Clock',
          },
          {
            label: 'Amarelo / verde / azul',
            detail: 'Urgente sem risco imediato · pouco urgente · não urgente (encaminhar).',
            icon: 'ListOrdered',
          },
        ],
        footer_rule: 'Laranja = tempo curtíssimo — não confundir com amarelo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Manchester — assinale a alternativa INCORRETA:',
          'Testar letra A — vermelho emergente (infarto, politrauma, PCR) → classificação correta, eliminar.',
          'Testar letra C — amarelo urgente sem risco imediato → classificação correta, eliminar.',
          'Testar letra D — verde pouco urgente com espera maior → classificação correta, eliminar.',
          'Testar letra E — azul não urgente encaminhável à APS → classificação correta, eliminar.',
          'Resta letra B — apontar tempo intermediário para o laranja é incorreto: esse nível exige tempo bem menor.',
          'Marcar B.',
        ],
        footer_rule: 'Decore os tempos — banca troca laranja por amarelo',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MANCHESTER — TEMPOS',
        rows: [
          { label: 'Vermelho', value: 'Emergente — atendimento imediato', badge: 'hot' },
          { label: 'Laranja', value: 'Muito urgente — tempo curtíssimo de espera', badge: 'warn' },
          { label: 'Amarelo', value: 'Urgente — tempo intermediário', badge: 'ok' },
          { label: 'Verde', value: 'Pouco urgente — espera maior', badge: 'ok' },
          { label: 'Azul', value: 'Não urgente — encaminhar à APS', badge: 'info' },
        ],
        footer_rule: 'Laranja tempo curtíssimo · amarelo intermediário',
      },
      dangerExceto(
        q,
        'INCORRETA — PROTOCOLO DE MANCHESTER',
        {
          A: 'Infarto, politrauma e PCR como prioridade emergente vermelha é afirmativa correta.',
          C: 'Amarelo para casos urgentes sem risco imediato de morte é classificação correta.',
          D: 'Verde pouco urgente com espera maior é afirmativa correta.',
          E: 'Azul para casos não urgentes encaminháveis à UBS é afirmativa correta.',
        },
        'Prioridade muito urgente laranja com tempo de espera intermediário é incorreta — no Manchester o laranja exige atendimento em tempo curtíssimo.',
        'Gabarito B — laranja exige tempo bem menor que o citado',
      ),
    ],
  },

  // 3) Convulsão — INCORRETA segurar firmemente
  'ibfc-enfermagem-urgencias-e-emergencias-1777103988389-2': {
    family: 'protocolo',
    guideline: 'Crise convulsiva — lateralizar, afrouxar roupa, proteger; não segurar/restringir movimentos nem forçar queixo',
    roiError: 'convulsao_segurar_firmemente_incorreta',
    cluster: 'Convulsão — alternativa INCORRETA sobre conduta',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'Convulsão — como agir',
        chip_label: 'NEURO',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail: 'Convulsão — contratura involuntária com perda de consciência; excitação do córtex cerebral.',
            icon: 'Zap',
          },
          {
            label: 'Lateralizar',
            detail: 'Cabeça voltada para o lado — evita aspiração de vômitos e secreções.',
            icon: 'Bed',
          },
          {
            label: 'Proteger',
            detail: 'Afrouxar roupas; observar sem restringir movimentação involuntária.',
            icon: 'Shield',
          },
          {
            label: 'Pegadinha — segurar firmemente',
            detail: 'Segurar a pessoa firmemente é INCORRETA — risco de trauma e não interrompe a crise.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Proteger sem imobilizar à força',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Convulsão — assinale a alternativa INCORRETA:',
          'Testar letra A — cabeça para o lado evita aspiração → conduta correta, eliminar.',
          'Testar letra B — afrouxar roupas facilita respiração → conduta correta, eliminar.',
          'Testar letra C — levantar o queixo é discutível, mas não é a pegadinha central desta questão.',
          'Resta letra D — segurar firmemente é a conduta claramente incorreta.',
          'Marcar D.',
        ],
        footer_rule: 'Nunca imobilizar à força na convulsão',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONVULSÃO — FAÇA / NÃO FAÇA',
        rows: [
          { label: 'Faça', value: 'Lateralizar · afrouxar roupa · proteger cabeça', badge: 'hot' },
          { label: 'Observe', value: 'Duração e recuperação — cronometrar', badge: 'ok' },
          { label: 'INCORRETA', value: 'Segurar/restringir movimentos firmemente', badge: 'warn' },
          { label: 'Não', value: 'Objeto na boca · forçar abertura', badge: 'warn' },
        ],
        footer_rule: 'Tempo da crise e via aérea pós-evento',
      },
      dangerExceto(
        q,
        'INCORRETA — CONDUTA NA CONVULSÃO',
        {
          A: 'Manter cabeça voltada para o lado evita aspiração — conduta correta.',
          B: 'Afrouxar roupas facilita respiração e conforto — conduta correta.',
          C: 'Elevar o queixo pode facilitar passagem de ar em alguns contextos — não é a pegadinha principal.',
        },
        'Segurar a pessoa firmemente é conduta incorreta — imobilização forçada causa trauma sem benefício e não interrompe a crise.',
        'Gabarito D — nunca segurar firmemente',
      ),
    ],
  },

  // 4) Convulsão — EXCETO objeto na boca
  'idecan-enfermagem-urgencias-e-emergencias-1780067013432-5': {
    family: 'protocolo',
    guideline:
      'Crise convulsiva — proporcionar tranquilidade e segurança, lateralizar para drenar saliva, não restringir movimentos (apenas afastar objetos); nunca introduzir objetos na boca',
    roiError: 'convulsao_abrir_boca_objeto_exceto',
    cluster: 'Convulsão — condutas corretas, EXCETO objeto na boca',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'Convulsão — condutas corretas',
        chip_label: 'NEURO',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail: 'Crise convulsiva tônico-clônica — proteger o paciente sem contê-lo à força.',
            icon: 'Zap',
          },
          {
            label: 'Segurança e ambiente',
            detail: 'Proporcionar tranquilidade, afastar objetos que possam machucar, sem restringir os movimentos.',
            icon: 'Shield',
          },
          {
            label: 'Lateralização',
            detail: 'Posicionar de lado para projeção da língua, drenar a saliva e evitar aspiração.',
            icon: 'Bed',
          },
          {
            label: 'Pegadinha — objeto na boca',
            detail:
              'Introduzir objeto na boca "para facilitar a respiração" é conduta EXCETO — risco de fratura dentária, obstrução de via aérea e lesão de mucosa.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Nunca introduzir qualquer objeto na boca durante a crise',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Procedimentos corretos durante a crise convulsiva, EXCETO:',
          'Testar letra A — proporcionar tranquilidade e segurança → conduta correta, eliminar.',
          'Testar letra C — lateralizar para drenar saliva e evitar aspiração → conduta correta, eliminar.',
          'Testar letra D — não restringir a movimentação, apenas afastar objetos → conduta correta, eliminar.',
          'Resta letra B — introduzir objeto na boca "para facilitar a respiração" é a conduta EXCETO.',
          'Marcar B.',
        ],
        footer_rule: 'Objeto na boca nunca é conduta correta na convulsão',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONVULSÃO — FAÇA / NUNCA FAÇA',
        rows: [
          { label: 'Faça', value: 'Lateralizar · afrouxar roupa · afastar objetos que machucam', badge: 'hot' },
          { label: 'Observe', value: 'Duração da crise e recuperação pós-ictal', badge: 'ok' },
          { label: 'Nunca', value: 'Introduzir qualquer objeto na boca durante a crise', badge: 'warn' },
          { label: 'Nunca', value: 'Restringir ou imobilizar os movimentos à força', badge: 'warn' },
        ],
        footer_rule: 'Proteger a via aérea sem invadir a boca',
      },
      dangerExceto(
        q,
        'EXCETO — CONDUTAS NA CRISE CONVULSIVA',
        {
          A: 'Proporcionar tranquilidade e segurança ao paciente é conduta correta durante a crise.',
          C: 'Posicionar o paciente lateralmente para drenar saliva e evitar aspiração é conduta correta.',
          D: 'Não restringir a movimentação do paciente, apenas afastar objetos, é conduta correta.',
        },
        'Introduzir objeto não cortante na boca para facilitar a respiração é conduta incorreta — nunca se deve colocar objetos na boca durante a crise convulsiva.',
        'Gabarito B — objeto na boca é sempre o EXCETO',
      ),
    ],
  },

  // 5) Semiologia — sinais de TCE, EXCETO logorreia
  'instituto-consulpam-enfermagem-semiologia-em-enfermagem-1779563521756-1': {
    family: 'conceito',
    guideline:
      'Sinais de fratura de base de crânio no TCE — sinal de Battle, sinal do guaxinim, otorreia/rinorreia (fuga de líquor); logorreia (fala excessiva) não é sinal de TCE',
    roiError: 'tce_sinais_logorreia_exceto',
    cluster: 'TCE — sinais de fratura de base de crânio, EXCETO',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'TCE — sinais de fratura de base de crânio',
        chip_label: 'TRAUMA',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail: 'Reconhecimento clínico de sinais de fratura de base de crânio no atendimento inicial ao TCE.',
            icon: 'Target',
          },
          {
            label: 'Sinal de Battle',
            detail: 'Equimose retroauricular — sugere fratura de fossa posterior.',
            icon: 'Eye',
          },
          {
            label: 'Sinal do guaxinim',
            detail: 'Equimose periorbitária — sugere fratura de fossa anterior.',
            icon: 'Eye',
          },
          {
            label: 'Otorreia',
            detail: 'Saída de líquor pelo ouvido — sinal de fratura de base de crânio.',
            icon: 'Droplet',
          },
          {
            label: 'Pegadinha — logorreia',
            detail: 'Fala excessiva (logorreia) não é sinal de TCE — termo parecido com "liquorreia/rinorreia" confunde o candidato.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Logorreia é fala excessiva — não tem relação com TCE',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Sinais de traumatismo cranioencefálico (TCE), EXCETO:',
          'Testar letra A — sinal de Battle (equimose retroauricular) → sinal real, eliminar.',
          'Testar letra B — equimose periorbitária (sinal do guaxinim) → sinal real, eliminar.',
          'Testar letra D — otorreia (fuga de líquor pelo ouvido) → sinal real, eliminar.',
          'Resta letra C — logorreia não corresponde a nenhum sinal de TCE.',
          'Marcar C.',
        ],
        footer_rule: 'Logorreia soa parecido com liquorreia, mas não é sinal de TCE',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TCE — SINAIS DE FRATURA DE BASE DE CRÂNIO',
        rows: [
          { label: 'Sinal de Battle', value: 'Equimose atrás da orelha', badge: 'hot' },
          { label: 'Sinal do guaxinim', value: 'Equimose ao redor dos olhos', badge: 'ok' },
          { label: 'Otorreia/rinorreia', value: 'Fuga de líquor (LCR)', badge: 'ok' },
          { label: 'Atenção', value: 'Logorreia (fala excessiva) não é sinal de TCE', badge: 'warn' },
        ],
        footer_rule: 'Não confundir logorreia com liquorreia/rinorreia',
      },
      dangerExceto(
        q,
        'EXCETO — SINAIS DE TCE',
        {
          A: 'Sinal de Battle (equimose retroauricular) é sinal real de fratura de base de crânio.',
          B: 'Equimose periorbitária (sinal do guaxinim) é sinal real de fratura de base de crânio.',
          D: 'Otorreia (fuga de líquor pelo ouvido) é sinal real de fratura de base de crânio.',
        },
        'Logorreia (fala excessiva) não é sinal de traumatismo cranioencefálico — o termo se assemelha a liquorreia/rinorreia, mas não indica fratura de base de crânio.',
        'Gabarito C — logorreia não é sinal de TCE',
      ),
    ],
  },

  // 6) Imobilização — síndrome compartimental, EXCETO aumento do pulso
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104056718-5': {
    family: 'conceito',
    guideline:
      'Síndrome compartimental — os 5 Ps: dor desproporcional, palidez, parestesia, paralisia e pulso diminuído/ausente por compressão vascular (nunca aumentado)',
    roiError: 'sindrome_compartimental_pulso_exceto',
    cluster: 'Síndrome compartimental — sinais (5 Ps), EXCETO aumento do pulso',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'Síndrome compartimental — sinais',
        chip_label: 'TRAUMA',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail: 'Síndrome compartimental pós-gesso — aumento da pressão dentro do compartimento muscular compromete a perfusão.',
            icon: 'Bone',
          },
          {
            label: 'Os 5 Ps',
            detail: 'Dor desproporcional, palidez, parestesia, paralisia e pulso diminuído/ausente.',
            icon: 'ListOrdered',
          },
          {
            label: 'Edema excessivo',
            detail: 'Sinal de alerta — compressão progressiva do compartimento muscular.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — aumento do pulso',
            detail: 'A síndrome compartimental cursa com pulso diminuído ou ausente por compressão vascular — nunca aumentado.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'Pulso diminuído/ausente — nunca aumentado — na síndrome compartimental',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Sinais sugestivos de síndrome compartimental, EXCETO:',
          'Testar letra A — palidez → sinal real (um dos 5 Ps), eliminar.',
          'Testar letra B — edema excessivo → sinal real de compressão progressiva, eliminar.',
          'Testar letra D — dor de forte intensidade, desproporcional → sinal real (um dos 5 Ps), eliminar.',
          'Resta letra C — aumento do pulso contraria o esperado, que é pulso diminuído ou ausente.',
          'Marcar C.',
        ],
        footer_rule: 'Compressão vascular reduz o pulso — não aumenta',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SÍNDROME COMPARTIMENTAL — OS 5 Ps',
        rows: [
          { label: 'Dor', value: 'Desproporcional ao trauma, piora à movimentação passiva', badge: 'hot' },
          { label: 'Palidez', value: 'Pele fria e pálida no segmento afetado', badge: 'ok' },
          { label: 'Parestesia/paralisia', value: 'Perda progressiva de sensibilidade e força', badge: 'ok' },
          { label: 'Pulso', value: 'Diminuído ou ausente — nunca aumentado', badge: 'warn' },
        ],
        footer_rule: 'Os 5 Ps fecham o diagnóstico clínico precoce',
      },
      dangerExceto(
        q,
        'EXCETO — SINAIS DE SÍNDROME COMPARTIMENTAL',
        {
          A: 'Palidez é sinal real de síndrome compartimental — um dos 5 Ps clássicos.',
          B: 'Edema excessivo é sinal real de compressão progressiva do compartimento.',
          D: 'Dor de forte intensidade, desproporcional ao trauma, é sinal real de síndrome compartimental.',
        },
        'Aumento do pulso é afirmativa incorreta — na síndrome compartimental a compressão vascular reduz ou abole o pulso, não o aumenta.',
        'Gabarito C — pulso diminui/desaparece, nunca aumenta',
      ),
    ],
  },

  // 7) ABCDE mnemônico PHTLS — EXCETO acesso venoso
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104090044-7': {
    family: 'protocolo',
    guideline:
      'PHTLS/ABCDE — A via aérea + cervical, B respiração, C circulação, D disability, E exposição; "acesso venoso" não é letra do mnemônico',
    roiError: 'abcde_acesso_venoso_exceto',
    cluster: 'ABCDE PHTLS — componentes do mnemônico, EXCETO',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'ABCDE — mnemônico PHTLS',
        chip_label: 'TRAUMA',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail: 'PHTLS — avaliação pré-hospitalar do trauma pela sequência ABCDE.',
            icon: 'Target',
          },
          {
            label: 'A — Airway',
            detail: 'Atendimento das vias aéreas e controle de coluna cervical.',
            icon: 'Wind',
          },
          {
            label: 'B — Breathing',
            detail: 'Respiração — ventilação e oxigenação.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — acesso venoso',
            detail:
              '"Acesso venoso" não compõe o mnemônico ABCDE — circulação (C) trata perfusão, mas acesso venoso não é letra do mnemônico.',
            icon: 'AlertTriangle',
          },
          {
            label: 'E — Exposure',
            detail: 'Exposição da vítima para exame completo e prevenção de hipotermia.',
            icon: 'Thermometer',
          },
        ],
        footer_rule: 'ABCDE = Airway · Breathing · Circulation · Disability · Exposure',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PHTLS — componentes do mnemônico ABCDE, EXCETO:',
          'Testar letra A — respiração pertence ao B (Breathing) → componente real, eliminar.',
          'Testar letra C — exposição da vítima pertence ao E (Exposure) → componente real, eliminar.',
          'Testar letra D — vias aéreas e coluna cervical pertencem ao A (Airway) → componente real, eliminar.',
          'Resta letra B — acesso venoso não é letra do mnemônico ABCDE.',
          'Marcar B.',
        ],
        footer_rule: 'Acesso venoso é conduta dentro de C — não letra do mnemônico',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ABCDE — MNEMÔNICO PHTLS',
        rows: [
          { label: 'A', value: 'Airway — via aérea + controle cervical', badge: 'hot' },
          { label: 'B', value: 'Breathing — respiração', badge: 'ok' },
          { label: 'C', value: 'Circulation — circulação e hemorragia', badge: 'ok' },
          { label: 'D', value: 'Disability — avaliação neurológica', badge: 'ok' },
          { label: 'E', value: 'Exposure — exposição e ambiente', badge: 'ok' },
          { label: 'EXCETO', value: 'Acesso venoso como letra do mnemônico', badge: 'warn' },
        ],
        footer_rule: 'Mnemônico ≠ lista de procedimentos',
      },
      dangerExceto(
        q,
        'EXCETO — COMPONENTES DO ABCDE',
        {
          A: 'Respiração compõe o "B" (Breathing) do mnemônico ABCDE — componente real.',
          C: 'Exposição da vítima compõe o "E" (Exposure) — componente real.',
          D: 'Atendimento das vias aéreas e controle de coluna cervical compõe o "A" — componente real.',
        },
        'Acesso venoso não compõe o mnemônico ABCDE como letra própria — é conduta dentro da circulação, não item do mnemônico listado.',
        'Gabarito B — acesso venoso é o EXCETO',
      ),
    ],
  },

  // 8) AVC hemorrágico — causas, EXCETO trombos/êmbolos
  'ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-7': {
    family: 'conceito',
    guideline:
      'AVC hemorrágico — ruptura vascular por aneurisma cerebral, uso de anticoagulantes ou trauma cranioencefálico; trombos ou êmbolos são mecanismo do AVC isquêmico, não do hemorrágico',
    roiError: 'avc_hemorragico_trombos_exceto',
    cluster: 'AVC hemorrágico — causas, EXCETO trombos/êmbolos (isquêmico)',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'AVC hemorrágico — causas',
        chip_label: 'NEURO',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail: 'AVC hemorrágico — ruptura de vaso cerebral com sangramento; distinto do AVC isquêmico (obstrução vascular).',
            icon: 'HeartPulse',
          },
          {
            label: 'Aneurismas cerebrais',
            detail: 'Dilatação da parede vascular que pode romper — causa clássica de AVC hemorrágico.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Uso de anticoagulantes',
            detail: 'Favorece o sangramento e a ruptura de vasos cerebrais.',
            icon: 'Pill',
          },
          {
            label: 'Pegadinha — trombos ou êmbolos',
            detail: 'Obstrução por trombo ou êmbolo é mecanismo do AVC isquêmico — banca troca o tipo de AVC.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Hemorrágico = ruptura de vaso · isquêmico = obstrução',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Causas de AVC hemorrágico, EXCETO:',
          'Testar letra A — aneurismas cerebrais → causa real (ruptura vascular), eliminar.',
          'Testar letra B — uso de anticoagulantes → causa real (favorece sangramento), eliminar.',
          'Testar letra D — traumas cranioencefálicos → causa real (ruptura por trauma), eliminar.',
          'Resta letra C — trombos ou êmbolos correspondem ao mecanismo do AVC isquêmico, não hemorrágico.',
          'Marcar C.',
        ],
        footer_rule: 'Trombo/êmbolo obstrui — não rompe o vaso',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'AVC — HEMORRÁGICO X ISQUÊMICO',
        rows: [
          { label: 'Hemorrágico', value: 'Ruptura vascular — aneurisma, anticoagulante, trauma', badge: 'hot' },
          { label: 'Isquêmico', value: 'Obstrução vascular — trombo ou êmbolo', badge: 'ok' },
          { label: 'Sinal comum', value: 'Déficit neurológico focal de início súbito', badge: 'info' },
          { label: 'Atenção', value: 'Banca troca o mecanismo entre os dois tipos de AVC', badge: 'warn' },
        ],
        footer_rule: 'Mecanismo define o tipo — não o sintoma isolado',
      },
      dangerExceto(
        q,
        'EXCETO — CAUSAS DE AVC HEMORRÁGICO',
        {
          A: 'Aneurismas cerebrais são causa real de AVC hemorrágico por ruptura vascular.',
          B: 'Uso de anticoagulantes é causa real de AVC hemorrágico por favorecer o sangramento.',
          D: 'Traumas cranioencefálicos são causa real de AVC hemorrágico por ruptura vascular traumática.',
        },
        'Trombos ou êmbolos são afirmativa incorreta como causa de AVC hemorrágico — esse mecanismo de obstrução vascular caracteriza o AVC isquêmico.',
        'Gabarito C — trombos/êmbolos causam AVC isquêmico, não hemorrágico',
      ),
    ],
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, spec] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const slides = spec.buildSlides(raw);
    const out = {
      meta: metaBase(raw, spec.family, spec.guideline, slug, spec.roiError, spec.cluster, REVIEWER),
      question_data: raw.question_data,
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g11] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g11] total=${ok}`);
}

main();
