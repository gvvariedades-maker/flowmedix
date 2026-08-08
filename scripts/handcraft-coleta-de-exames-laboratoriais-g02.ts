#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — coleta-de-exames-laboratoriais-g02 (8 slugs coleta_nao_sanguinea).
 *
 *   npx tsx scripts/handcraft-coleta-de-exames-laboratoriais-g02.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'coleta-de-exames-laboratoriais-g02';
const SUBTOPICO = 'Coleta de Exames Laboratoriais';
const BRANCH = 'coleta_nao_sanguinea';
const REVIEWED = '2026-08-05';

const MS_SOURCE = {
  id: 'ms-manual-amostras-biologicas',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Manual de Coleta de Amostras Biológicas para Exames Laboratoriais',
  year: 2020,
  url: 'https://www.gov.br/saude/',
  covers: [
    'urina',
    'fezes',
    'escarro',
    'swab',
    'tuberculose',
    'sangue oculto',
    'sumário de urina',
    'RT-PCR',
    'higiene íntima',
    'jato médio',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-coleta-11ed',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Coleta de amostras',
  year: 2024,
  covers: ['escarro', 'urina', 'fezes', 'swab', 'transporte'],
};

const MS_TB_SOURCE = {
  id: 'ms-manual-recomendacoes-tb',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Manual de Recomendações para Controle da Tuberculose no Brasil',
  year: 2019,
  covers: ['escarro', 'coleta TB', 'ventilação', 'baciloscopia'],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[]; text_fragment?: string };
  modulo_slug?: string;
};

type Pack = {
  family: 'conceito' | 'vf' | 'certo_errado' | 'protocolo';
  guideline: string;
  exam_vs_current?: string;
  slides: unknown[];
  cleanInstruction?: (s: string) => string;
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: BRANCH,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft:coleta-g02',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
    },
    sources: slug.startsWith('cetrede')
      ? [MS_TB_SOURCE, MS_SOURCE, POTTER_SOURCE]
      : [MS_SOURCE, POTTER_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/paragarantir/gi, 'para garantir')
    .replace(/desecreção/gi, 'de secreção')
    .replace(/vias aréas/gi, 'vias aéreas')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'cetrede-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102785845-1': {
    family: 'conceito',
    guideline: 'MS TB — escarro: local ventilado/ar livre; amostra profunda pós-tosse; manhã preferencial',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Escarro TB — fase pré-analítica',
        meta: slideMeta,
        items: [
          {
            label: 'Responsabilidade APS',
            detail: 'Coleta, conservação e encaminhamento na unidade que identifica suspeita de TB.',
            icon: 'Building2',
          },
          {
            label: 'Amostra representativa',
            detail: 'Escarro profundo após esforço de tosse — não saliva superficial.',
            icon: 'Wind',
          },
          {
            label: 'Ambiente de coleta',
            detail: 'Local aberto/ventilado — ar livre ou sala com exaustão adequada.',
            icon: 'Sun',
          },
          {
            label: 'Horário',
            detail: 'Manhã costuma concentrar bacilos — mas qualidade > relógio isolado.',
            icon: 'Clock',
          },
          {
            label: 'Segurança',
            detail: 'Máscara N95/PFF2 para profissional; paciente orientado a não expectorar saliva.',
            icon: 'ShieldCheck',
          },
          {
            label: 'Pegadinha — qualquer horário',
            detail: 'Banca troca ventilação por “qualquer hora é melhor”.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'TB escarro = profundo + ventilado + encaminhar rápido',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: orientação correta na coleta de escarro para TB.',
          'A — amostra após tosse, não saliva: plausível, mas não é a chave desta prova.',
          'B — local aberto/ar livre ou ventilado adequado: gabarito Cetrede.',
          'Eliminar C — diagnóstico não depende só de “uma amostra preferencial” genérica.',
          'Eliminar D — duas amostras podem ser protocolo, mas não substitui orientação de ambiente.',
          'Eliminar E — “qualquer horário é melhor” inverte manhã/protocolo MS.',
          'Marcar B — coleta em local aberto/ventilado.',
          'Em similares: TB = ventilação + escarro profundo — não saliva.',
        ],
        footer_rule: 'B = ambiente ventilado/aberto',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — escarro TB',
        meta: slideMeta,
        content: 'TB — COLETA DE ESCARRO',
        rows: [
          { label: 'Ambiente', value: 'Ar livre ou sala ventilada/exaustão', badge: 'hot' },
          { label: 'Amostra', value: 'Pós-tosse profunda — evitar saliva', badge: 'ok' },
          { label: 'Horário', value: 'Preferência manhã — não “qualquer hora melhor”', badge: 'warn' },
          { label: 'Encaminhamento', value: 'Rápido ao laboratório conforme rede TB', badge: 'ok' },
        ],
        footer_rule: 'Ventilar protege equipe e paciente',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESCARRO TB CETREDE',
        items: [
          {
            label: 'Letra A — tosse vs saliva',
            detail: 'Descreve amostra adequada (profunda).',
            correct: 'Verdadeiro tecnicamente, mas gabarito desta questão é B (ambiente ventilado).',
          },
          {
            label: 'Letra C — uma amostra preferencial',
            detail: 'Generaliza diagnóstico sem citar ventilação.',
            correct: 'Não substitui orientação de local aberto — B é a correta pedida.',
          },
          {
            label: 'Letra D — duas amostras',
            detail: 'Protocolo pode prever segunda amostra.',
            correct: 'Duplicidade não responde ao foco “ambiente de coleta” — marcar B.',
          },
          {
            label: 'Letra E — qualquer horário',
            detail: 'Inverte preferência matinal e qualidade pré-analítica.',
            correct: 'MS não ensina “qualquer hora é melhor” — eliminar E.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Pergunta só “escarro profundo” sem ventilação.',
            correct: 'Aqui a chave é local aberto/ventilado — letra B.',
          },
        ],
        footer_rule: 'Ventilação = diferencial desta questão',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-coleta-de-exames-laboratoriais-1779562730776-6': {
    family: 'conceito',
    guideline: 'SBPC/MS — triglicerídeos: amostra sérica (soro) após centrifugação; jejum conforme protocolo lipídico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tipo de amostra — triglicerídeos',
        meta: slideMeta,
        items: [
          {
            label: 'Triglicerídeos',
            detail: 'Lipídio sérico — dosado em sangue processado (soro).',
            icon: 'Droplets',
          },
          {
            label: 'Soro',
            detail: 'Sangue coagulado e centrifugado — sem fibrina/anticoagulante.',
            icon: 'TestTube',
          },
          {
            label: 'Distratores não sanguíneos',
            detail: 'Urina, escarro, sêmen e líquor não são matriz para TG sérico.',
            icon: 'Ban',
          },
          {
            label: 'Pré-analítico',
            detail: 'Jejum e álcool alteram TG — orientação antes da coleta venosa.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — urina',
            detail: 'Banca lista fluidos comuns para confundir perfil lipídico.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'TG = lipídio no soro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: amostra biológica indicada para dosagem de triglicerídeos.',
          'Triglicerídeos são lipídios plasmáticos — exigem sangue → soro.',
          'Eliminar A — urina não dosagem TG sérico.',
          'Eliminar C — líquor não é matriz para perfil lipídico de rotina.',
          'Eliminar D — sêmen não substitui soro para TG.',
          'Eliminar E — escarro é amostra respiratória, não lipídica.',
          'Marcar B — soro.',
          'Em similares: perfil lipídico = soro/jejum — não urina.',
        ],
        footer_rule: 'Triglicerídeos séricos exigem soro — não urina nem escarro',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — matriz por exame',
        meta: slideMeta,
        content: 'AMOSTRA × EXAME — DECORE',
        rows: [
          { label: 'Triglicerídeos', value: 'Soro (sangue sem anticoagulante)', badge: 'hot' },
          { label: 'Urina', value: 'EAS, urocultura, microalbuminúria', badge: 'ok' },
          { label: 'Escarro', value: 'Baciloscopia, cultura respiratória', badge: 'ok' },
          { label: 'Jejum TG', value: 'Jejum conforme protocolo lipídico (MS/SBPC)', badge: 'warn' },
        ],
        footer_rule: 'Lipídio sérico = soro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TRIGLICERÍDEOS CPCON',
        items: [
          {
            label: 'Letra A — urina',
            detail: 'Fluido não sanguíneo comum em provas de coleta.',
            correct: 'Urina não dosagem triglicerídeos — eliminar A.',
          },
          {
            label: 'Letra C — líquor',
            detail: 'Amostra neurológica rara — parece “especial”.',
            correct: 'LCR não é matriz para TG de rotina — eliminar C.',
          },
          {
            label: 'Letra D — sêmen',
            detail: 'Fluido biológico citado em outras questões do pacote.',
            correct: 'Sêmen ≠ dosagem lipídica sérica — eliminar D.',
          },
          {
            label: 'Letra E — escarro',
            detail: 'Confunde ramo não sanguíneo com exame lipídico.',
            correct: 'Escarro é respiratório — TG exige soro (B).',
          },
          {
            label: 'Em similares…',
            detail: 'Colesterol/HDL/LDL aparecem no mesmo bloco lipídico.',
            correct: 'Perfil lipídico = soro com jejum — não confundir com urina ou escarro.',
          },
        ],
        footer_rule: 'Perfil lipídico sempre sangue/soro',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-coleta-de-exames-laboratoriais-1779562730776-7': {
    family: 'conceito',
    guideline: 'SBPC — hemograma e HbA1c: sangue total com anticoagulante (EDTA/citrato conforme exame)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sangue total anticoagulado',
        meta: slideMeta,
        items: [
          {
            label: 'Hemograma',
            detail: 'Contagem celular — sangue total com anticoagulante para preservar elementos figurados.',
            icon: 'Activity',
          },
          {
            label: 'Hemoglobina glicada',
            detail: 'HbA1c — também em sangue total anticoagulado na rotina laboratorial.',
            icon: 'TrendingUp',
          },
          {
            label: 'Anticoagulante',
            detail: 'Impede coagulação — preserva elementos figurados ou fraciona plasma.',
            icon: 'TestTube',
          },
          {
            label: 'Distratores urinários',
            detail: 'Proteinúria, microalbuminúria e urocultura = urina, não sangue total.',
            icon: 'Ban',
          },
          {
            label: 'Coombs indireto',
            detail: 'Soro/plasma — não combina com urocultura na mesma alternativa.',
            icon: 'Shuffle',
          },
          {
            label: 'Pegadinha — misturar matrizes',
            detail: 'Banca emparelha exame urinário + hematológico.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Hemograma + HbA1c = sangue total anticoagulado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: exames feitos em sangue total com anticoagulante.',
          'Hemograma e HbA1c usam sangue total anticoagulado — par B.',
          'Eliminar A — proteinúria é urina; hemograma ok mas par inválido.',
          'Eliminar C — tipagem pode ser sangue, microalbuminúria é urina.',
          'Eliminar D — Coombs indireto (soro) + urocultura (urina).',
          'Eliminar E — urocultura e microalbuminúria são urinários.',
          'Marcar B — hemograma + hemoglobina glicada.',
          'Em similares: julgar os dois exames do par — matriz única.',
        ],
        footer_rule: 'B = hematológico + glicada no sangue total',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — tubos hematológicos',
        meta: slideMeta,
        content: 'SANGUE TOTAL — PARES DE PROVA',
        rows: [
          { label: 'Hemograma', value: 'Sangue total com anticoagulante', badge: 'hot' },
          { label: 'HbA1c', value: 'Sangue total anticoagulado — rotina', badge: 'hot' },
          { label: 'Urocultura', value: 'Urina jato médio — não sangue', badge: 'warn' },
          { label: 'Microalbuminúria', value: 'Urina — não anticoagulante', badge: 'warn' },
        ],
        footer_rule: 'Anticoagulado = sangue, não urina',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PARES CPCON',
        items: [
          {
            label: 'Letra A — proteinúria + hemograma',
            detail: 'Metade certa (hemograma) mascara urina no par.',
            correct: 'Proteinúria é urinária — par inválido; B é o gabarito.',
          },
          {
            label: 'Letra C — tipagem + microalbuminúria',
            detail: 'Tipagem sangue + exame urinário.',
            correct: 'Matrizes diferentes no mesmo par — eliminar C.',
          },
          {
            label: 'Letra D — Coombs + urocultura',
            detail: 'Imunologia sérica + cultura urinária.',
            correct: 'Coombs não é sangue total anticoagulado com urocultura — eliminar D.',
          },
          {
            label: 'Letra E — urocultura + microalbuminúria',
            detail: 'Ambos urinários — zero sangue total.',
            correct: 'Pergunta pede sangue anticoagulado — E não atende.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Tipagem ou Coombs aparecem sozinhos como distrator.',
            correct: 'Julgar o par inteiro — hemograma + HbA1c no sangue anticoagulado (B).',
          },
        ],
        footer_rule: 'Os dois exames do par devem ser sangue total',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-coleta-de-exames-laboratoriais-1779562730776-8': {
    family: 'conceito',
    guideline: 'MS — sangue oculto nas fezes: dieta restrita (sem carnes vermelhas/vit C excessiva) antes da coleta',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preparo dietético — fezes',
        meta: slideMeta,
        items: [
          {
            label: 'Parasitológico simples',
            detail: 'Geralmente sem dieta especial prolongada — diferente de sangue oculto.',
            icon: 'Bug',
          },
          {
            label: 'Coprocultura',
            detail: 'Fezes frescas — evitar antibiótico recente; dieta específica não é foco.',
            icon: 'FlaskConical',
          },
          {
            label: 'Sangue oculto',
            detail: 'Dieta restrita pré-coleta — evitar carnes vermelhas, rúcula e vitamina C em excesso.',
            icon: 'Droplets',
          },
          {
            label: 'Larvas / leucócitos fecais',
            detail: 'Outros exames parasitológicos — preparo distinto do sangue oculto.',
            icon: 'Microscope',
          },
          {
            label: 'Pegadinha — “parasitológico” genérico',
            detail: 'Banca lista exames fecais parecidos sem citar dieta.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Dieta específica = sangue oculto',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: exame que exige dieta específica na preparação.',
          'Sangue oculto nas fezes exige restrição alimentar — carnes, certos vegetais, vit C.',
          'Eliminar A — pesquisa de larvas não exige dieta restrita clássica de sangue oculto.',
          'Eliminar B — parasitológico de fezes rotineiro sem dieta igual ao sangue oculto.',
          'Eliminar C — leucócitos fecais — outro protocolo.',
          'Eliminar D — coprocultura — antibiótico/contaminação, não dieta igual.',
          'Marcar E — pesquisa de sangue oculto nas fezes.',
          'Em similares: “dieta específica” em fezes = sangue oculto.',
        ],
        footer_rule: 'E = sangue oculto + dieta',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — preparo fezes',
        meta: slideMeta,
        content: 'FEZES — QUAL EXIGE DIETA?',
        rows: [
          { label: 'Sangue oculto', value: 'Dieta restrita — sem carne vermelha/rúcula/vit C ↑', badge: 'hot' },
          { label: 'Parasitológico', value: 'Sem dieta especial igual — amostra fresca', badge: 'ok' },
          { label: 'Coprocultura', value: 'Fezes recentes — ATB recente interfere', badge: 'ok' },
          { label: 'Transporte', value: '≤24 h refrigerado (MS)', badge: 'warn' },
        ],
        footer_rule: 'Dieta restrita = sangue oculto',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DIETA FECAL CPCON',
        items: [
          {
            label: 'Letra A — larvas',
            detail: 'Exame parasitológico — parece “especial”.',
            correct: 'Larvas não exigem dieta clássica de sangue oculto — eliminar A.',
          },
          {
            label: 'Letra B — parasitológico',
            detail: 'Mais frequente que sangue oculto em provas.',
            correct: 'Parasitológico simples ≠ dieta restrita de sangue oculto — eliminar B.',
          },
          {
            label: 'Letra C — leucócitos fecais',
            detail: 'Outro marcador inflamatório fecal.',
            correct: 'Preparo distinto — gabarito E (sangue oculto).',
          },
          {
            label: 'Letra D — coprocultura',
            detail: 'Cultura bacteriana — frescor importa mais que dieta restrita.',
            correct: 'Coprocultura não é a resposta “dieta específica” — E correto.',
          },
          {
            label: 'Em similares…',
            detail: 'Parasitológico e coprocultura competem no mesmo enunciado.',
            correct: 'Só sangue oculto exige dieta restrita clássica — letra E.',
          },
        ],
        footer_rule: 'Sangue oculto = dieta restrita pré-coleta',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-exames-laboratoriais-1779563553840-6': {
    family: 'conceito',
    guideline: 'MS/SBPC — sumário de urina (EAS): análise física, química e sedimentoscopia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sumário de urina — três etapas',
        meta: slideMeta,
        items: [
          {
            label: 'Sumário / EAS',
            detail: 'Urina tipo I — triagem renal e metabólica.',
            icon: 'FlaskConical',
          },
          {
            label: 'Análise física',
            detail: 'Cor, aspecto, densidade, odor.',
            icon: 'Eye',
          },
          {
            label: 'Análise química',
            detail: 'Dipstick — proteína, glicose, cetona, pH, sangue etc.',
            icon: 'TestTube',
          },
          {
            label: 'Sedimentoscopia',
            detail: 'Microscopia do sedimento — cilindros, hemácias, leucócitos.',
            icon: 'Microscope',
          },
          {
            label: 'Pegadinha — microbiológica',
            detail: 'Banca troca química por microbiológica ou citológica.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'EAS = física + química + sedimento',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: três etapas do sumário de urina.',
          'Sequência clássica: física → química → sedimentoscopia — A.',
          'Eliminar B — microbiológica não compõe EAS de rotina (é urocultura).',
          'Eliminar C — citológica não substitui sedimentoscopia no EAS.',
          'Eliminar D — falta sedimentoscopia; citologia não entra.',
          'Eliminar E — ordem errada e inclui microbiológica.',
          'Marcar A.',
          'Em similares: EAS ≠ urocultura — três blocos físico-químico-sedimento.',
        ],
        footer_rule: 'A = física · química · sedimentoscopia',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — EAS',
        meta: slideMeta,
        content: 'SUMÁRIO DE URINA — DECORE',
        rows: [
          { label: '1ª etapa', value: 'Análise física (cor, aspecto, densidade)', badge: 'ok' },
          { label: '2ª etapa', value: 'Análise química (fita reagente)', badge: 'ok' },
          { label: '3ª etapa', value: 'Sedimentoscopia microscópica', badge: 'hot' },
          { label: 'Não entra', value: 'Microbiológica/citológica no EAS de rotina', badge: 'warn' },
        ],
        footer_rule: 'Microbiologia = urocultura, não EAS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ETAPAS EAS CPCON',
        items: [
          {
            label: 'Letra B — microbiológica',
            detail: 'Parece lógico “achar bactéria”.',
            correct: 'EAS triagem ≠ cultura — eliminar B.',
          },
          {
            label: 'Letra C — citológica',
            detail: 'Substitui sedimento por citologia.',
            correct: 'Terceira etapa é sedimentoscopia — C errada.',
          },
          {
            label: 'Letra D — citológica no lugar do sedimento',
            detail: 'Mantém física e química corretas.',
            correct: 'Falta sedimentoscopia — A é completa.',
          },
          {
            label: 'Letra E — microbiológica + ordem errada',
            detail: 'Mistura blocos de urocultura.',
            correct: 'EAS clássico = A (física, química, sedimentoscopia).',
          },
          {
            label: 'Em outra banca…',
            detail: 'Pergunta só a 2ª etapa (química vs microbiológica).',
            correct: 'Tríade completa do sumário = física + química + sedimentoscopia (A).',
          },
        ],
        footer_rule: 'Sedimentoscopia ≠ citologia',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-exames-laboratoriais-1779563646977-2': {
    family: 'conceito',
    guideline: 'MS/Anvisa — COVID-19: RT-PCR em swab nasofaringe/orofaringe ou aspirado — não sorologia isolada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'COVID-19 — diagnóstico molecular',
        meta: slideMeta,
        items: [
          {
            label: 'Material de coleta',
            detail: 'Swab nasal/orofaringe, aspirado nasofaringe ou vias aéreas inferiores.',
            icon: 'Syringe',
          },
          {
            label: 'RT-PCR',
            detail: 'Detecta RNA viral em tempo real — padrão-ouro na fase aguda.',
            icon: 'Dna',
          },
          {
            label: 'Sorologia IgM/IgG',
            detail: 'Resposta humoral tardia — não substitui PCR na elucidação aguda.',
            icon: 'Clock',
          },
          {
            label: 'HbA1c / escarro',
            detail: 'Exames de outro eixo — distratores de banca.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — anticorpo',
            detail: 'IgG positivo não confirma infecção aguda isolada.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'COVID aguda = RT-PCR em swab',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: exame para elucidação COVID-19 em swab/aspirado respiratório.',
          'Enunciado cita swab nasal/orofaringe ou aspirado — buscar PCR molecular.',
          'Eliminar B — IgM isolado não é padrão de elucidação aguda descrita.',
          'Eliminar C — IgG reflete exposição/passado.',
          'Eliminar D — hemoglobina glicada é metabólico, não viral.',
          'Eliminar E — escarro pode ser usado em casos, mas alternativa A nomeia RT-PCR.',
          'Marcar A — RT-PCR em tempo real.',
          'Em similares: swab + PCR — não sorologia como primeira linha aguda.',
        ],
        footer_rule: 'A = RT-PCR tempo real',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — COVID laboratorial',
        meta: slideMeta,
        content: 'COVID-19 — COLETA × EXAME',
        rows: [
          { label: 'Agudo', value: 'RT-PCR em swab naso/orofaringe', badge: 'hot' },
          { label: 'Sorologia', value: 'IgM/IgG — complementar, não elucidação aguda isolada', badge: 'warn' },
          { label: 'Material', value: 'Swab, aspirado nasofaringe, BAAR/aspirado inferior', badge: 'ok' },
          { label: 'Transporte', value: 'Meio viral — tempo/temperatura conforme rede', badge: 'ok' },
        ],
        footer_rule: 'PCR detecta vírus; IgG detecta resposta',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COVID CPCON',
        items: [
          {
            label: 'Letra B — IgM',
            detail: 'Anticorpo parece “diagnóstico rápido”.',
            correct: 'Elucidação aguda com swab = RT-PCR — não IgM isolado.',
          },
          {
            label: 'Letra C — IgG',
            detail: 'Marca exposição prévia/vacina.',
            correct: 'IgG não elucida fase aguda como PCR — eliminar C.',
          },
          {
            label: 'Letra D — HbA1c',
            detail: 'Exame metabólico fora do tema viral.',
            correct: 'Glicemia média ≠ COVID — eliminar D.',
          },
          {
            label: 'Letra E — escarro',
            detail: 'Material respiratório plausível.',
            correct: 'Enunciado pede método molecular nomeado — A (RT-PCR) é gabarito.',
          },
          {
            label: 'Em similares…',
            detail: 'Antígeno rápido ou sorologia aparecem como alternativa.',
            correct: 'Swab naso/orofaringe na fase aguda = RT-PCR tempo real (A).',
          },
        ],
        footer_rule: 'Swab agudo = PCR, não sorologia',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'decorp-enfermagem-coleta-de-exames-laboratoriais-1779562725491-5': {
    family: 'conceito',
    guideline: 'MS — escarro microbiológico: manhã, antes de alimentos; higiene oral; amostra profunda',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Escarro representativo',
        meta: slideMeta,
        items: [
          {
            label: 'Vias inferiores',
            detail: 'Amostra deve refletir brônquios — não saliva orofaringe.',
            icon: 'Wind',
          },
          {
            label: 'Manhã em jejum',
            detail: 'Antes de alimentos/líquidos — muco noturno mais representativo.',
            icon: 'Sun',
          },
          {
            label: 'Swab orofaringe',
            detail: 'Não substitui escarro profundo para bacterioscopia respiratória.',
            icon: 'Ban',
          },
          {
            label: 'Antisséptico oral',
            detail: 'Clorexidina/alcohol pós-higiene contamina cultura — evitar antes da coleta.',
            icon: 'AlertCircle',
          },
          {
            label: 'Estímulo mecânico',
            detail: 'Indução deve ser protocolada (salina) — não “cutucar” orofaringe.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha — swab confortável',
            detail: 'Alternativa A parece menos invasiva — errada para escarro profundo.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Manhã + jejum + escarro profundo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: procedimento mais adequado para escarro microbiológico representativo.',
          'Eliminar A — swab orofaringe captura saliva, não vias inferiores.',
          'Eliminar B — antisséptico oral antes contamina/inibe microbiota.',
          'Eliminar D — estímulo mecânico na orofaringe gera saliva, não escarro profundo.',
          'C — coletar de manhã, antes de alimentos e líquidos: padrão MS.',
          'Marcar C.',
          'Em similares: escarro = manhã jejum + tosse profunda — não swab oral.',
        ],
        footer_rule: 'C = manhã antes de comer/beber',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — escarro Decorp',
        meta: slideMeta,
        content: 'ESCARRO MICROBIOLÓGICO',
        rows: [
          { label: 'Horário', value: 'Manhã, antes de alimentos/líquidos', badge: 'hot' },
          { label: 'Higiene', value: 'Enxágue com água — sem antisséptico imediato', badge: 'warn' },
          { label: 'Qualidade', value: 'Purulento/mucopurulento aceitável — evitar saliva', badge: 'ok' },
          { label: 'Evitar', value: 'Swab orofaringe como substituto de escarro', badge: 'warn' },
        ],
        footer_rule: 'Jejum matinal ↑ qualidade',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESCARRO DECORP',
        items: [
          {
            label: 'Letra A — swab orofaringe',
            detail: 'Menos desconforto — parece “cuidadoso”.',
            correct: 'Saliva/orofaringe ≠ vias inferiores — eliminar A.',
          },
          {
            label: 'Letra B — antisséptico oral',
            detail: 'Parece biossegurança rigorosa.',
            correct: 'Antisséptico antes da coleta altera microbiologia — eliminar B.',
          },
          {
            label: 'Letra D — estímulo mecânico orofaringe',
            detail: 'Garante secreção visível.',
            correct: 'Secreção induzida na orofaringe não representa vias inferiores — eliminar D.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Pergunta salina hipertônica para induzir.',
            correct: 'Decorp: manhã antes de alimentos — letra C.',
          },
        ],
        footer_rule: 'Representativo = profundo, não saliva',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'decorp-enfermagem-coleta-de-exames-laboratoriais-1779562735777-4': {
    family: 'conceito',
    guideline: 'MS/Potter — urocultura/EAS: higiene íntima antes da micção; jato médio; frasco estéril fechado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Urina microbiológica — anti-contaminação',
        meta: slideMeta,
        items: [
          {
            label: 'Contaminação uretral',
            detail: 'Flora perineal invalida urocultura — principal erro pré-analítico.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Higiene íntima',
            detail: 'Lavagem genital com água/sabão neutro antes da micção — passo-chave.',
            icon: 'Sparkles',
          },
          {
            label: 'Jato médio',
            detail: 'Descartar início e fim — coletar fluxo intermediário no estéril.',
            icon: 'Droplets',
          },
          {
            label: 'Cateter urinário',
            detail: 'Coleta por cateter só com indicação — não rotina para evitar contaminação.',
            icon: 'Ban',
          },
          {
            label: 'Frasco aberto',
            detail: 'Manter frasco fechado até o jato — exposição ao ar contamina.',
            icon: 'Package',
          },
          {
            label: 'Pegadinha — descartar só início',
            detail: 'Letra B omite higiene — metade certa ainda errada.',
            icon: 'Shuffle',
          },
        ],
        footer_rule: 'Higiene íntima = base anti-contaminação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: principal recomendação para evitar contaminação na urina microbiológica.',
          'Contaminação vem da flora perineal — higiene íntima antes da coleta (C).',
          'Eliminar A — cateter direto sem indicação aumenta risco iatrogênico.',
          'Eliminar B — descartar 1ª porção sem higiene deixa flora uretral.',
          'Eliminar D — frasco aberto expõe a amostra ao ambiente.',
          'Marcar C — higiene íntima adequada antes da coleta.',
          'Em similares: higiene + jato médio — pergunta foco “principal” = higiene.',
        ],
        footer_rule: 'C = higiene íntima pré-micção',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — urina microbiológica',
        meta: slideMeta,
        content: 'UROCULTURA / URINA — DECORE',
        rows: [
          { label: 'Principal', value: 'Higiene íntima antes da micção', badge: 'hot' },
          { label: 'Técnica', value: 'Desprezar 1º jato → jato médio no estéril', badge: 'ok' },
          { label: 'Frasco', value: 'Estéril com vedação até o momento da coleta', badge: 'ok' },
          { label: 'Cateter', value: 'Só se indicado — não rotina', badge: 'warn' },
        ],
        footer_rule: 'Sem higiene, jato médio não salva',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — URINA DECORP',
        items: [
          {
            label: 'Letra A — cateter direto',
            detail: 'Parece amostra “limpa” garantida.',
            correct: 'Cateter invasivo sem indicação — não é principal anti-contaminação.',
          },
          {
            label: 'Letra B — descartar 1ª porção',
            detail: 'Metade da técnica correta.',
            correct: 'Sem higiene íntima, ainda há contaminação — C é a principal.',
          },
          {
            label: 'Letra D — frasco aberto',
            detail: 'Facilita encaixar o jato.',
            correct: 'Frasco aberto contamina ambientalmente — eliminar D.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Pergunta jato médio como gabarito.',
            correct: 'Decorp pede “principal” — higiene íntima (C).',
          },
        ],
        footer_rule: 'Higiene antes > só jato médio',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const instruction = pack.cleanInstruction
      ? pack.cleanInstruction(raw.question_data.instruction)
      : raw.question_data.instruction;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: { ...raw.question_data, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:coleta-g02] OK ${slug}`);
  }
  console.log(`[handcraft:coleta-g02] total=${ok}`);
}

main();
