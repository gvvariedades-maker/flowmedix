#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — coleta-de-exames-laboratoriais-g03 (8 slugs coleta_nao_sanguinea).
 *
 *   npx tsx scripts/handcraft-coleta-de-exames-laboratoriais-g03.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'coleta-de-exames-laboratoriais-g03';
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
    'urocultura',
    'escarro',
    'swab orofaringe',
    'fezes',
    'jato médio',
    'coprocultura',
    'fita reagente',
    'cateter urinário',
    '4 °C',
    '1 hora',
    '3 mL',
    'Luer-Lok',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-coleta-11ed',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Coleta de amostras',
  year: 2024,
  covers: ['jato médio', 'escarro', 'urina cateter', 'validade'],
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
      reviewer: 'handcraft:coleta-g03',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
    },
    sources: [MS_SOURCE, POTTER_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/daamostra/gi, 'da amostra')
    .replace(/emrecipiente/gi, 'em recipiente')
    .replace(/norótulo/gi, 'no rótulo')
    .replace(/não énecessário/gi, 'não é necessário')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'decorp-enfermagem-exames-laboratoriais-1779563553840-3': {
    family: 'calc',
    guideline: 'Coma hiperglicêmico — glicemia elevada; hipoglicemia é outro quadro; chave Decorp I+III',
    exam_vs_current:
      'Gabarito prova = C (I e III). II (acidose) e IV (cetonúria) são achados clássicos de CAD na prática — ensinar chave da banca.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Coma diabético — terreno laboratorial',
        meta: slideMeta,
        items: [
          {
            label: 'Coma diabético na prova',
            detail: 'Quadro grave por descompensação glicêmica — banca cobra achados laboratoriais associados.',
            icon: 'Activity',
          },
          {
            label: 'Hiperglicemia severa',
            detail: 'Glicemia muito elevada (>600 mg/dL) com osmolaridade plasmática alta — eixo HHS/CAD grave.',
            icon: 'TrendingUp',
          },
          {
            label: 'Hipoglicemia',
            detail: 'Glicemia <70 mg/dL — outro mecanismo de alteração de consciência, citada na questão.',
            icon: 'TrendingDown',
          },
          {
            label: 'Acidose metabólica',
            detail: 'pH baixo com distúrbio ácido-base — classicamente ligado à CAD, mas julgar pela chave.',
            icon: 'FlaskConical',
          },
          {
            label: 'Cetonúria',
            detail: 'Corpos cetônicos na urina — marcador de CAD; banca pode excluir na combinação pedida.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha — misturar CAD e hipoglicemia',
            detail: 'Afirmativas opostas (hiper vs hipo) aparecem juntas para testar leitura item a item.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Julgar I–IV antes de montar combinação A–D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: quais características se relacionam ao coma diabético (I–IV).',
          'I — glicemia >600 mg/dL + osmolaridade elevada: julgar verdadeira pela chave.',
          'II — acidose metabólica grave pH <7: chave marca falsa nesta prova — eliminar combinações com II.',
          'III — hipoglicemia severa <70 mg/dL: chave marca verdadeira — incluir III.',
          'IV — cetonúria elevada na urina: chave marca falsa — não incluir IV.',
          'Combinação válida: apenas I e III — letra C.',
          'Marcar C.',
          'Em similares: VF de emergência — julgue cada romano antes de olhar as letras.',
        ],
        footer_rule: 'Chave C = I + III apenas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — distúrbios glicêmicos graves',
        meta: slideMeta,
        content: 'COMA / CRISE GLICÊMICA — DECORE PROVA',
        rows: [
          { label: 'Hiperglicemia extrema', value: 'Glicemia >600 mg/dL + osmolaridade ↑ (I)', badge: 'hot' },
          { label: 'Hipoglicemia', value: '<70 mg/dL — mecanismo distinto (III na chave)', badge: 'warn' },
          { label: 'Acidose / cetonúria', value: 'CAD clássica — chave desta prova exclui II e IV', badge: 'ok' },
          { label: 'Estratégia VF', value: 'Montar conjunto só após V/F individual', badge: 'ok' },
        ],
        footer_rule: 'Seguir chave da banca quando divergir da CAD clássica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COMA DIABÉTICO DECORP',
        items: [
          {
            label: 'Letra A — só I',
            detail: 'Esquece III marcada verdadeira na chave.',
            correct: 'Chave inclui I e III — A incompleta.',
          },
          {
            label: 'Letra B — II e III',
            detail: 'II é falsa nesta prova apesar de ser achado clássico de CAD.',
            correct: 'Acidose grave (II) não entra na combinação correta desta questão.',
          },
          {
            label: 'Letra D — II e IV',
            detail: 'Parece perfil “CAD completa” clínico.',
            correct: 'Ambas II e IV são falsas pela chave Decorp — não marque D.',
          },
          {
            label: 'Em outra banca…',
            detail: 'CAD clássica inclui acidose e cetonúria.',
            correct: 'Nesta prova, ensinar C (I+III) — registrar divergência em exam_vs_current.',
          },
        ],
        footer_rule: 'II e IV clínicas ≠ chave desta prova',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fau-unicentro-enfermagem-exames-laboratoriais-1779563553840-1': {
    family: 'conceito',
    guideline: 'Hipercalemia = K+ sérico elevado; distingui de cálcio, ureia, creatinina e sódio urinário',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hipercalemia — terreno',
        meta: slideMeta,
        items: [
          {
            label: 'Hipercalemia',
            detail: 'Elevação do potássio plasmático — achado laboratorial de risco cardíaco.',
            icon: 'Zap',
          },
          {
            label: 'Potássio (K+)',
            detail: 'Principal cátion intracelular; nível sérico reflete equilíbrio renal e celular.',
            icon: 'Activity',
          },
          {
            label: 'Distratores iônicos',
            detail: 'Banca troca K+ por Ca++, Na+, ureia ou creatinina.',
            icon: 'Shuffle',
          },
          {
            label: 'Contexto laboratorial',
            detail: 'Eletrolitos séricos exigem coleta e processamento adequados — tema transversal.',
            icon: 'TestTube',
          },
          {
            label: 'Pegadinha — creatinina no músculo',
            detail: 'Creatinina é marcador renal/muscular, não definição de hipercalemia.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Hipercalemia = ↑ potássio no sangue',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: definição de hipercalemia.',
          'Hipercalemia = excesso de potássio no sangue — buscar K+ elevado.',
          'Eliminar A — hipocalcemia (Ca++ baixo) é outro distúrbio.',
          'Eliminar B — ureia baixa não define hipercalemia.',
          'Eliminar C — creatinina muscular não é o termo da pergunta.',
          'Eliminar E — sódio urinário baixo ≠ hipercalemia.',
          'Marcar D — aumento dos níveis de potássio no sangue.',
          'Em similares: prefixo hiper- + eletrólito certo — K+ na hipercalemia.',
        ],
        footer_rule: 'D = ↑ K+ sérico',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — potássio sérico',
        meta: slideMeta,
        content: 'POTÁSSIO — VALORES DE REFERÊNCIA',
        rows: [
          { label: 'Normal', value: '3,5 a 5,0 mEq/L (ou mmol/L)', badge: 'ok' },
          { label: 'Hipercalemia leve', value: '5,1 a 5,9 mEq/L', badge: 'warn' },
          { label: 'Hipercalemia grave', value: '>6,5 mEq/L — risco de arritmia', badge: 'hot' },
          { label: 'Definição prova', value: 'Aumento do K+ no sangue', badge: 'ok' },
        ],
        footer_rule: 'Hiper = alto · calemia = potássio',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIPERCALEMIA FAU',
        items: [
          {
            label: 'Letra A — cálcio baixo',
            detail: 'Parece distúrbio eletrolítico genérico.',
            correct: 'Hipocalcemia ≠ hipercalemia — outro íon.',
          },
          {
            label: 'Letra B — ureia baixa',
            detail: 'Marcador renal, mas não define K+ alto.',
            correct: 'Ureia mede função renal — não é sinônimo de hipercalemia.',
          },
          {
            label: 'Letra C — creatinina no músculo',
            detail: 'Confunde compartimento (músculo) com definição sérica.',
            correct: 'Creatinina não caracteriza hipercalemia.',
          },
          {
            label: 'Letra E — sódio na urina',
            detail: 'Troca compartimento (urina) e íon (Na+).',
            correct: 'Hipercalemia é K+ no sangue — não sódio urinário baixo.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Pode trocar hipercalemia por hiponatremia ou hipocalcemia.',
            correct: 'Prefixo hiper- + calemia = sempre potássio elevado no sangue.',
          },
        ],
        footer_rule: 'Nome do distúrbio = íon + direção',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fau-unicentro-enfermagem-exames-laboratoriais-1779563553840-4': {
    family: 'conceito',
    guideline: 'Hipocolia = fezes claras por ↓ bilirrubina estercobilinogênica; não confundir com consistência',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hipocolia fecal — terreno',
        meta: slideMeta,
        items: [
          {
            label: 'Hipocolia',
            detail: 'Diminuição da pigmentação fecal por redução de bilirrubina/bile.',
            icon: 'Palette',
          },
          {
            label: 'Mecanismo',
            detail: 'Menos bile no intestino → fezes mais claras/amareladas.',
            icon: 'Droplets',
          },
          {
            label: 'Acolia',
            detail: 'Extremo — fezes esbranquiçadas (obstrução biliar).',
            icon: 'Circle',
          },
          {
            label: 'Consistência ≠ cor',
            detail: 'Endurecidas, amolecidas, pastosas falam de trânsito — não de hipocolia.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — fezes escuras',
            detail: 'Melena = escurecimento por sangue digerido — oposto de hipocolia.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Hipocolia = cor clara, não consistência',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: hipocolia = ↓ bilirrubina → fezes como?',
          'Hipocolia é alteração de coloração — fezes claras/amareladas.',
          'Eliminar B — escuras sugerem melena ou dieta, não hipocolia.',
          'Eliminar C, D, E — endurecidas/amolecidas/pastosas = consistência, não cor.',
          'Marcar A — fezes claras.',
          'Em similares: hipocolia vs acolia vs melena — sempre eixo cor.',
        ],
        footer_rule: 'A = claras (↓ pigmento biliar)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — coloração das fezes',
        meta: slideMeta,
        content: 'ALTERAÇÕES FECAIS — COR',
        rows: [
          { label: 'Hipocolia', value: 'Fezes claras/amareladas (↓ bile)', badge: 'hot' },
          { label: 'Acolia', value: 'Fezes esbranquiçadas (obstrução biliar)', badge: 'warn' },
          { label: 'Melena', value: 'Pretas — sangue digerido', badge: 'ok' },
          { label: 'Enterorragia', value: 'Vermelho vivo — sangramento baixo', badge: 'ok' },
        ],
        footer_rule: 'Cor ≠ consistência na prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIPOCOLIA FAU',
        items: [
          {
            label: 'Letra B — escuras',
            detail: 'Confunde com melena ou dieta rica em ferro.',
            correct: 'Hipocolia = claras — escuro é outro padrão.',
          },
          {
            label: 'Letra C — endurecidas',
            detail: 'Descreve constipação, não pigmentação.',
            correct: 'Consistência dura não define hipocolia.',
          },
          {
            label: 'Letra D — amolecidas',
            detail: 'Pode sugerir diarreia — eixo errado.',
            correct: 'Amolecidas ≠ cor clara por ↓ bilirrubina.',
          },
          {
            label: 'Letra E — pastosas',
            detail: 'Textura intermediária sem relação com bile.',
            correct: 'Hipocolia pede cor — pastosa não responde.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Pode cobrar acolia (esbranquiçada) em vez de hipocolia.',
            correct: 'Hipocolia = claras; acolia = esbranquiçada — ambas ↓ bile.',
          },
        ],
        footer_rule: 'Banca mistura cor e consistência',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fgv-enfermagem-coleta-de-exames-laboratoriais-1779563225798-8': {
    family: 'conceito',
    guideline: 'MS — urocultura jato médio; escarro com higiene oral; swab orofaringe sem tocar língua; coprocultura ≤24h geladeira',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Coleta não sanguínea — MS',
        meta: slideMeta,
        items: [
          {
            label: 'Materiais diversos',
            detail: 'Urina, fezes, escarro, swabs — cada um com protocolo MS próprio.',
            icon: 'Package',
          },
          {
            label: 'Urocultura',
            detail: 'Jato médio estéril — não pool de 24 h nem só desprezar 1º jato.',
            icon: 'FlaskConical',
          },
          {
            label: 'Escarro',
            detail: 'Higiene oral + expectoração profunda — não jejum 6 h sem escovar.',
            icon: 'Wind',
          },
          {
            label: 'Swab orofaringe',
            detail: 'Posterior de faringe/tonsila — evitar contato com língua.',
            icon: 'Microscope',
          },
          {
            label: 'Coprocultura',
            detail: 'Entregar rápido; refrigerar 4 °C — prazo máximo típico 24 h, não 36 h.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — urina 24 h',
            detail: 'Banca troca urocultura por coleta urinária de 24 horas.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'MS: material define técnica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre coleta segundo MS.',
          'Eliminar A — secreção uretral: timing de micção difere do descrito.',
          'Eliminar B — coprocultura 36 h excede validade usual refrigerada (24 h).',
          'Eliminar C — escarro: exige higiene oral, não jejum sem escovação.',
          'Eliminar D — urocultura não é coleta de 24 h com restante da micção.',
          'E — swab orofaringe na área posterior, evitando língua: conduta correta.',
          'Marcar E.',
          'Em similares: MS orofaringe = posterior faringe/tonsila, sem língua.',
        ],
        footer_rule: 'E = swab orofaringe correto',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — MS coleta',
        meta: slideMeta,
        content: 'MS — COLETA NÃO SANGUÍNEA',
        rows: [
          { label: 'Urocultura', value: 'Jato médio, 1ª urina, frasco estéril', badge: 'hot' },
          { label: 'Escarro', value: 'Higiene oral + amostra profunda', badge: 'ok' },
          { label: 'Orofaringe', value: 'Swab posterior — não tocar língua', badge: 'hot' },
          { label: 'Coprocultura', value: '≤1 h ideal; geladeira 4 °C até ~24 h', badge: 'warn' },
        ],
        footer_rule: '36 h coprocultura = pegadinha FGV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MS FGV',
        items: [
          {
            label: 'Letra A — uretral pós-micção',
            detail: 'Timing de secreção uretral invertido.',
            correct: 'Secreção uretral tem protocolo específico — afirmativa incorreta.',
          },
          {
            label: 'Letra B — coprocultura 36 h',
            detail: 'Prazo generoso parece “margem de segurança”.',
            correct: 'MS usa até 24 h refrigerada — 36 h invalida.',
          },
          {
            label: 'Letra C — escarro jejum sem higiene',
            detail: 'Omite escovação e induz expectoração errada.',
            correct: 'Escarro exige higiene oral — jejum 6 h sem escovar está errado.',
          },
          {
            label: 'Letra D — urocultura 24 h',
            detail: 'Confunde urocultura com urina de 24 horas.',
            correct: 'Urocultura = jato médio isolado, não pool de 24 h.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Coprocultura com prazo 48 h ou uretral após micção.',
            correct: 'MS: coprocultura ≤24 h geladeira; orofaringe = swab posterior sem língua.',
          },
        ],
        footer_rule: 'Pool 24 h ≠ urocultura',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'gama-enfermagem-coleta-de-exames-laboratoriais-1779562716126-6': {
    family: 'conceito',
    guideline: 'MS — escarro: salina hipertônica inalatória pode induzir expectoração; evitar saliva; muco purulento é desejável',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Escarro microbiológico — terreno',
        meta: slideMeta,
        items: [
          {
            label: 'Escarro profundo',
            detail: 'Secreção das vias aéreas inferiores — não saliva da orofaringe.',
            icon: 'Wind',
          },
          {
            label: 'Qualidade da amostra',
            detail: 'Purulento/mucopurulento indica origem brônquica — muco não é contraindicação.',
            icon: 'TestTube',
          },
          {
            label: 'Indução',
            detail: 'Salina hipertônica inalatória auxilia expectoração quando necessário.',
            icon: 'Droplets',
          },
          {
            label: 'Contaminação',
            detail: 'Deglutir saliva antes da coleta aumenta flora oral na amostra.',
            icon: 'Ban',
          },
          {
            label: 'Aspiração traqueal',
            detail: 'Reservada a casos específicos — não rotina independente de consciência.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha — evitar muco',
            detail: 'Banca inverte: amostra mucopurulenta é desejável, não descartável.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Escarro = profundo · sem saliva · muco ok',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: cuidado correto na coleta de escarro para microbiologia.',
          'Eliminar A — deglutir saliva contamina com flora oral.',
          'Eliminar C — aspirador traqueal não é padrão para todo paciente consciente.',
          'Eliminar D — muco purulento é característica desejável, não evitar.',
          'B — salina hipertônica inalatória antes da coleta para induzir expectoração: correto.',
          'Marcar B.',
          'Em similares: escarro = induzir se preciso · nunca priorizar saliva.',
        ],
        footer_rule: 'B = salina hipertônica inalatória',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — escarro',
        meta: slideMeta,
        content: 'ESCARRO — COLETA MICROBIOLÓGICA',
        rows: [
          { label: 'Indução', value: 'Salina hipertônica inalatória se necessário', badge: 'hot' },
          { label: 'Aspecto ideal', value: 'Purulento/mucopurulento — vias inferiores', badge: 'ok' },
          { label: 'Evitar', value: 'Saliva, deglutir antes, amostra aquosa só oral', badge: 'warn' },
          { label: 'Higiene', value: 'Enxágue oral (sem pasta) antes — reduzir contaminação', badge: 'ok' },
        ],
        footer_rule: 'Muco ≠ amostra inválida',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESCARRO GAMA',
        items: [
          {
            label: 'Letra A — deglutir saliva',
            detail: 'Parece “limpar” a boca antes de expectorar.',
            correct: 'Saliva contamina — não deglutir imediatamente antes da coleta.',
          },
          {
            label: 'Letra C — aspirador sempre',
            detail: 'Generaliza procedimento invasivo.',
            correct: 'Aspiração traqueal é exceção — não rotina para todo paciente.',
          },
          {
            label: 'Letra D — evitar muco',
            detail: 'Inverte critério de qualidade microbiológica.',
            correct: 'Muco purulento indica escarro profundo — desejável.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Cobra higiene oral sem indução.',
            correct: 'Gama: salina hipertônica inalatória = gabarito B.',
          },
        ],
        footer_rule: 'Saliva contamina · muco confirma origem',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ibade-enfermagem-coleta-de-exames-laboratoriais-1779563288910-1': {
    family: 'certo_errado',
    guideline: 'MS — urocultura: água e sabão na higiene; antisséptico é contraindicado; jato médio; 1ª urina; ≤1 h',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Urocultura — terreno',
        meta: slideMeta,
        items: [
          {
            label: 'Comando EXCETO',
            detail: 'Quatro alternativas são condutas corretas — uma é a exceção.',
            icon: 'Search',
          },
          {
            label: 'Jato médio',
            detail: 'Desprezar início da micção — reduz contaminação uretral.',
            icon: 'Droplets',
          },
          {
            label: '1ª urina da manhã',
            detail: 'Preferencial para concentrar bacteriúria.',
            icon: 'Sun',
          },
          {
            label: 'Transporte ≤1 h',
            detail: 'Urina fresca — prazo curto até o laboratório.',
            icon: 'Timer',
          },
          {
            label: 'Higiene sem antisséptico',
            detail: 'Água e sabão — antisséptico pode suprimir crescimento bacteriano.',
            icon: 'Sparkles',
          },
          {
            label: 'Pegadinha — clorexidina',
            detail: 'Antisséptico parece “mais asséptico”, mas invalida urocultura.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Urocultura: higiene com água e sabão, não antisséptico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: recomendações de urocultura — assinale EXCETO.',
          'A — sondagem em incontinência: conduta correta quando necessário.',
          'B — 1ª urina da manhã: recomendação correta.',
          'C — encaminhar em até 1 h: conduta correta.',
          'E — não alterar ingestão hídrica: orientação correta.',
          'Isolar D — antisséptico na higiene íntima: contraindicado na urocultura.',
          'Marcar D (EXCETO).',
          'Em similares: EXCETO urocultura = antisséptico genital é clássico.',
        ],
        footer_rule: 'EXCETO = D (antisséptico)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — urocultura',
        meta: slideMeta,
        content: 'UROCULTURA — ORIENTAÇÃO MS',
        rows: [
          { label: 'Higiene', value: 'Água e sabão — sem antisséptico', badge: 'hot' },
          { label: 'Coleta', value: 'Jato médio, frasco estéril', badge: 'ok' },
          { label: 'Momento', value: '1ª urina da manhã (preferencial)', badge: 'ok' },
          { label: 'Transporte', value: 'Até 1 h ao laboratório', badge: 'warn' },
        ],
        footer_rule: 'Antisséptico mata bactéria da amostra',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — UROCULTURA EXCETO IBADE',
        items: [
          {
            label: 'Letra A — sondagem incontinência',
            detail: 'Parece invasivo demais para ser “correto”.',
            correct: 'Incontinência pode exigir sondagem de alívio — conduta válida.',
          },
          {
            label: 'Letra B — 1ª urina manhã',
            detail: 'Pode parecer opcional demais.',
            correct: 'Preferencial na urocultura — afirmativa correta, não é EXCETO.',
          },
          {
            label: 'Letra C — 1 hora transporte',
            detail: 'Prazo curto parece restritivo.',
            correct: 'Urina fresca — conduta correta, não marque como exceção.',
          },
          {
            label: 'Letra E — hidratação habitual',
            detail: 'Paciente pode achar que deve beber mais.',
            correct: 'Não alterar hábito hídrico — orientação correta.',
          },
          {
            label: 'Letra D — antisséptico',
            detail: 'Parece máxima barreira asséptica.',
            correct: 'EXCEÇÃO: antisséptico suprime flora e invalida cultura.',
          },
          {
            label: 'Em outra banca…',
            detail: 'EXCETO pode trocar antisséptico por “coletar 1º jato”.',
            correct: 'Antisséptico genital e 1º jato são exceções clássicas em urocultura.',
          },
        ],
        footer_rule: 'Mais asséptico ≠ melhor na urocultura',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ibfc-enfermagem-coleta-de-exames-laboratoriais-1779563200105-2': {
    family: 'conceito',
    guideline: 'MS — urocultura estéril jato médio; urina 24h reinicia se perder volume; dipstick no tempo do fabricante',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Urina — tipos de exame',
        meta: slideMeta,
        items: [
          {
            label: 'Técnica por exame',
            detail: 'Cultura, gravidez, 24 h e dipstick — preparos diferentes.',
            icon: 'ListChecks',
          },
          {
            label: 'Urocultura',
            detail: 'Estéril, jato médio, 1ª urina — não “2ª micção sem cuidados”.',
            icon: 'FlaskConical',
          },
          {
            label: 'Urina 24 h',
            detail: 'Perda de volume invalida — deve reiniciar coleta.',
            icon: 'Clock',
          },
          {
            label: 'Dipstick',
            detail: 'Glicosúria/cetonúria: mergulhar fita e ler no tempo do rótulo.',
            icon: 'TestTube',
          },
          {
            label: 'Teste gravidez',
            detail: 'Pode usar jato médio, mas frasco limpo ≠ estéril de cultura.',
            icon: 'Package',
          },
          {
            label: 'Pegadinha — 24 h sem reinício',
            detail: 'Banca diz que perda de volume não exige reiniciar — falso.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Cada exame urinário = protocolo próprio',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta sobre técnica de coleta de urina.',
          'Eliminar A — cultura na 2ª micção sem cuidados: errado para urocultura.',
          'Eliminar B — teste gravidez: jato médio ok, mas “limpo e seco” não substitui esterilidade de cultura.',
          'Eliminar C — urina 24 h: perda de volume exige reiniciar — afirmativa falsa.',
          'D — glicosúria/cetonúria: imergir fita após micção e ler no tempo do fabricante: correto.',
          'Marcar D.',
          'Em similares: dipstick = tempo de leitura do rótulo — urina 24 h perdeu = reinicia.',
        ],
        footer_rule: 'D = fita reagente no tempo certo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — urina por finalidade',
        meta: slideMeta,
        content: 'URINA — TÉCNICAS DISTINTAS',
        rows: [
          { label: 'Urocultura', value: 'Estéril, jato médio, 1ª urina', badge: 'hot' },
          { label: 'Urina 24 h', value: 'Perda de volume → reiniciar coleta', badge: 'warn' },
          { label: 'Dipstick', value: 'Imersão + leitura no tempo do fabricante', badge: 'hot' },
          { label: 'Gravidez', value: 'Jato médio possível — frasco conforme protocolo', badge: 'ok' },
        ],
        footer_rule: '24 h completa = zero perda',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — URINA IBFC',
        items: [
          {
            label: 'Letra A — 2ª micção sem cuidados',
            detail: 'Minimiza técnica estéril da cultura.',
            correct: 'Urocultura exige jato médio estéril — não 2ª micção sem preparo.',
          },
          {
            label: 'Letra B — gravidez frasco seco',
            detail: 'Mistura técnica de cultura com teste rápido.',
            correct: 'Teste gravidez tem protocolo próprio — alternativa incorreta como “correta geral”.',
          },
          {
            label: 'Letra C — 24 h sem reinício',
            detail: 'Parece tolerância operacional amigável.',
            correct: 'Perda de volume invalida urina de 24 h — deve reiniciar.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Confunde dipstick com sedimento microscópico.',
            correct: 'Glicosúria/cetonúria na unidade = fita + tempo do rótulo.',
          },
        ],
        footer_rule: 'Perda na 24 h = recomeça coleta',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idcap-enfermagem-coleta-de-exames-laboratoriais-1779563140631-5': {
    family: 'conceito',
    guideline: 'MS/Potter — amostra urinária de cateter: seringa Luer-Lok 3 mL na porta de amostra; técnica asséptica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Urina de cateter — terreno',
        meta: slideMeta,
        items: [
          {
            label: 'Amostra estéril',
            detail: 'Urina de cateter urinário para análise — técnica asséptica rigorosa.',
            icon: 'ShieldCheck',
          },
          {
            label: 'Porta de amostra',
            detail: 'Coletar do dispositivo de amostragem do cateter — não saco coletor.',
            icon: 'Syringe',
          },
          {
            label: 'Luer-Lok',
            detail: 'Conexão rosqueada segura — evita desconexão e vazamento na punção.',
            icon: 'Link',
          },
          {
            label: 'Volume 3 mL',
            detail: 'Seringa pequena suficiente para cultura/EAS — protocolo INOVA/Idcap.',
            icon: 'Droplets',
          },
          {
            label: 'Luer-Slip vs cateter',
            detail: 'Slip encaixa por pressão; “cateter seringa” não é o dispositivo padrão.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — volume incorreto',
            detail: 'Banca troca volume ou tipo de conexão (Slip/Eccentric).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Cateter urinário = Luer-Lok 3 mL na porta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: seringa para urina estéril de cateter urinário.',
          'Precisa conexão segura (Luer-Lok) + volume adequado para amostra laboratorial.',
          'Eliminar A e E — “cateter de seringa” não é nomenclatura do dispositivo correto.',
          'Eliminar B — Luer-Slip 3 mL: encaixe por pressão, menos seguro que Lok.',
          'Eliminar D — Eccentric Luer-Slip: tipo e volume incorretos.',
          'Marcar C — Luer-Lok de 3 mL.',
          'Em similares: amostra de cateter = porta asséptica + Luer-Lok.',
        ],
        footer_rule: 'C = Luer-Lok 3 mL',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — cateter urinário',
        meta: slideMeta,
        content: 'URINA DE CATETER — COLETA',
        rows: [
          { label: 'Dispositivo', value: 'Seringa Luer-Lok 3 mL', badge: 'hot' },
          { label: 'Local', value: 'Porta de amostra do cateter (não saco)', badge: 'ok' },
          { label: 'Técnica', value: 'Asséptica — antissepsia da porta antes da punção', badge: 'warn' },
          { label: 'Volume mínimo', value: 'Conforme protocolo do laboratório destino', badge: 'ok' },
        ],
        footer_rule: 'Lok = rosqueado · Slip = pressão',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CATETER IDCAP',
        items: [
          {
            label: 'Letra A — cateter (volume errado)',
            detail: 'Confunde ponta de seringa com cateter urinário.',
            correct: 'Coleta é na porta do cateter com seringa Luer-Lok — não “cateter” como dispositivo.',
          },
          {
            label: 'Letra B — Luer-Slip 3 mL',
            detail: 'Volume certo, conexão errada.',
            correct: 'Slip encaixa por pressão — Lok é padrão para amostra segura.',
          },
          {
            label: 'Letra D — Eccentric Luer-Slip',
            detail: 'Tipo especializado de seringa irrelevante aqui.',
            correct: 'Eccentric Luer-Slip não é dispositivo padrão para porta de cateter.',
          },
          {
            label: 'Letra E — cateter 3 mL',
            detail: 'Mesma confusão de nomenclatura com volume menor.',
            correct: 'Seringa Luer-Lok — não “cateter de seringa”.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Troca Luer-Lok por Luer-Slip ou volume inadequado.',
            correct: 'Porta de cateter = Luer-Lok rosqueado — conexão segura na amostra estéril.',
          },
        ],
        footer_rule: 'Luer-Lok ≠ Luer-Slip na prova',
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
    console.log(`[handcraft:coleta-g03] OK ${slug}`);
  }
  console.log(`[handcraft:coleta-g03] total=${ok}`);
}

main();
