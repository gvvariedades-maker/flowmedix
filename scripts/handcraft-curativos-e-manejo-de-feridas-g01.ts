#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — curativos-e-manejo-de-feridas-g01 (8 slugs P0 curativos_cobertura_selecao).
 *
 *   npx tsx scripts/handcraft-curativos-e-manejo-de-feridas-g01.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { CURATIVOS_LPP_NPUAP } from '@/lib/guidelines/curativos';

const LOTE = 'curativos-e-manejo-de-feridas-g01';
const SUBTOPICO = 'Curativos e Manejo de Feridas';
const BRANCH = 'curativos_cobertura_selecao';
const REVIEWED = '2026-07-16';

const CURATIVOS_SOURCE = {
  id: CURATIVOS_LPP_NPUAP.id,
  tier: 'A' as const,
  issuer: CURATIVOS_LPP_NPUAP.issuer,
  title: CURATIVOS_LPP_NPUAP.title,
  year: CURATIVOS_LPP_NPUAP.year,
  url: CURATIVOS_LPP_NPUAP.url,
  covers: [
    'cobertura',
    'exsudato',
    'meio úmido',
    'hidrocoloide',
    'alginato',
    'hidrogel',
    'hidropolímero',
    'AGE',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[]; text_fragment?: string };
  modulo_slug?: string;
};

type Pack = {
  family: 'conceito' | 'vf' | 'certo_errado';
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
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
    },
    sources: [CURATIVOS_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/ambientesaudável/gi, 'ambiente saudável')
    .replace(/quecorresponde/gi, 'que corresponde')
    .replace(/indicações:/gi, 'indicações:')
    .replace(/ascaracterísticas/gi, 'as características')
    .replace(/coberto comfilme/gi, 'coberto com filme')
    .replace(/feridascom/gi, 'feridas com')
    .replace(/exsudação/gi, 'exsudação')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'ameosc-enfermagem-curativos-e-manejo-de-feridas-1779344773456-8': {
    family: 'conceito',
    guideline: 'Seleção de cobertura — lâmina (plana) × espuma de preenchimento (cavitária) = hidropolímero',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cobertura × morfologia da ferida',
        meta: slideMeta,
        items: [
          {
            label: 'Lâmina × plana',
            detail: 'Feridas planas recebem lâmina de hidropolímero aderida ao leito.',
            icon: 'Square',
          },
          {
            label: 'Espuma × cavitária',
            detail: 'Feridas cavitárias pedem espuma de preenchimento no espaço morto.',
            icon: 'Layers',
          },
          {
            label: 'Hidropolímero',
            detail: 'Oferece lâmina para planas e espuma de preenchimento para cavidades.',
            icon: 'Droplets',
          },
          {
            label: 'Hidrogel ≠ hidropolímero',
            detail: 'Hidrogel reidrata leito seco — não é a dupla lâmina/espuma da questão.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha enzima',
            detail: 'Enzima proteolítica da letra C — papel distinto da lâmina/espuma.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Plana = lâmina · Cavitária = espuma de preenchimento',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: parear cobertura com lâmina (plana) e espuma de preenchimento (cavitária).',
          'Lembrar: hidropolímero oferece ambas as apresentações conforme a morfologia.',
          'Eliminar A: hidrogel é gel úmido — não é a dupla lâmina/espuma pedida.',
          'Eliminar B: AGE nutre leito vitalizado — não preenche cavidade com espuma.',
          'Eliminar C: enzima proteolítica da alternativa — não é cobertura estrutural.',
          'Marcar D — hidropolímero.',
          'Em similares: cruze morfologia (plana vs cavitária) antes do nome comercial.',
        ],
        footer_rule: 'Morfologia da ferida guia a apresentação do curativo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Matriz rápida — cobertura × leito',
        meta: slideMeta,
        content: 'SELEÇÃO POR MORFOLOGIA',
        rows: [
          { label: 'Ferida plana', value: 'lâmina de hidropolímero ou filme/hidrocoloide conforme exsudato' },
          { label: 'Ferida cavitária', value: 'espuma de preenchimento (hidropolímero/alginato)' },
          { label: 'Exsudato alto', value: 'alginato ou espuma absorvente — não oclusivo oclusivo em maceração' },
          { label: 'Leito com fibrina', value: 'meio úmido: hidrogel, hidropolímero, alginato, AGE' },
        ],
        footer_rule: 'Nome comercial só depois de morfologia + exsudato',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COBERTURA × FORMA',
        items: [
          {
            label: 'Letra A — hidrogel',
            detail: 'Gel úmido para desidratação — não é lâmina/espuma estrutural da questão.',
            correct: 'Hidrogel reidrata leito seco; não substitui espuma de preenchimento.',
          },
          {
            label: 'Letra B — ácidos graxos essenciais',
            detail: 'AGE nutre epitélio e granulação — papel diferente da lâmina/espuma.',
            correct: 'AGE é adjuvante lipídico — não é a dupla plana/cavitária pedida.',
          },
          {
            label: 'Letra C — enzima proteolítica',
            detail: 'Alternativa C do enunciado — remove tecido necrótico, não conforma cavidade.',
            correct: 'Enzima prepara leito; cobertura estrutural é hidropolímero.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Trocam hidropolímero por alginato em cavidade exsudativa.',
            correct: 'Mantenha o eixo: morfologia + exsudato → depois o produto.',
          },
        ],
        footer_rule: 'Hidropolímero = lâmina plana + espuma cavitária',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'avancasp-enfermagem-curativos-e-manejo-de-feridas-1779269212740-1': {
    family: 'conceito',
    guideline: 'Planejamento de feridas — terapia tópica não depende só da ferida e estado geral',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Assistência holística em feridas',
        meta: slideMeta,
        items: [
          {
            label: 'Avaliação do leito',
            detail: 'Exsudato, tecido desvitalizado e biofilme orientam a conduta local.',
            icon: 'Search',
          },
          {
            label: 'Remoção do não viável',
            detail: 'Limpar tecido não viável antes de escolher a cobertura e terapia tópica.',
            icon: 'Scissors',
          },
          {
            label: 'Remoção do curativo',
            detail: 'Observar exsudato, aderência e dor — evita trauma ao trocar.',
            icon: 'Bandage',
          },
          {
            label: 'Controle da carga bacteriana',
            detail: 'Equilibrar infecção/inflamação para permitir cicatrização.',
            icon: 'Shield',
          },
          {
            label: 'Pegadinha “apenas”',
            detail: 'Terapia também considera preferência, custo, adesão e rede de cuidado.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Ferida + paciente + contexto — nunca “apenas” um fator',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando INCORRETA: achar a afirmativa mal elaborada no planejamento de feridas.',
          'Validar A, C, D e E — são condutas aceitas na avaliação e manejo.',
          'Isolar B: “dependerá apenas das características da ferida e do estado geral”.',
          'O “apenas” exclui contexto social, custo, adesão e preferência do paciente.',
          'Marcar B como a alternativa incorreta.',
          'Em similares: desconfie de “somente”, “apenas” e “exclusivamente” em holismo.',
        ],
        footer_rule: 'Holismo = leito + paciente + contexto',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PLANEJAMENTO DE FERIDAS — EIXOS',
        rows: [
          { label: 'Leito', value: 'exsudato, tecido viável, biofilme, infecção' },
          { label: 'Paciente', value: 'comorbidades, dor, mobilidade, nutrição' },
          { label: 'Terapia tópica', value: 'cobertura conforme exsudato — após leito viável' },
          { label: 'Seleção', value: 'tipo de cobertura após avaliar exsudato e leito' },
          { label: 'Contexto', value: 'custo, adesão, cuidador, ambiente domiciliar' },
        ],
        footer_rule: 'Nunca reduzir a escolha a um único par de variáveis',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'EXCETO — PLANEJAMENTO HOLÍSTICO',
        items: [
          {
            label: 'Letra A — avaliação do leito',
            detail: 'Exsudato, desvitalizado e biofilme são critérios reais de classificação.',
            correct: 'Conduta correta — não é a exceção.',
          },
          {
            label: 'Letra B — “apenas” ferida e estado geral',
            detail: 'Reduz holismo a dois fatores — afirmativa mal elaborada.',
            correct: 'Terapia também depende de contexto, custo e adesão — é a INCORRETA.',
          },
          {
            label: 'Letra C — remoção do não viável',
            detail: 'Limpar tecido não viável antes da cobertura — conduta correta no planejamento.',
            correct: 'Etapa válida — não é a alternativa mal elaborada.',
          },
          {
            label: 'Letra D — remoção do curativo',
            detail: 'Avaliar exsudato na retirada evita trauma e maceração.',
            correct: 'Boa prática na troca — não marcar como incorreta.',
          },
          {
            label: 'Letra E — controle bacteriano',
            detail: 'Equilibrar carga bacteriana/inflamação é premissa do tratamento.',
            correct: 'Conduta correta — só B erra pelo “apenas”.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Substituem “apenas” por “principalmente” para confundir.',
            correct: 'Holismo exige múltiplos fatores — leia o absolutismo.',
          },
        ],
        footer_rule: 'B erra: terapia não depende só de ferida + estado geral',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'avancasp-enfermagem-curativos-e-manejo-de-feridas-1779344766321-4': {
    family: 'conceito',
    guideline: 'Hidrocoloide — oclusivo, meio úmido, troca prolongada ou antes se vazamento',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hidrocoloide — perfil',
        meta: slideMeta,
        items: [
          {
            label: 'Composição',
            detail: 'CMC + polisobutileno + pectina sob filme de poliuretano.',
            icon: 'Layers',
          },
          {
            label: 'Mecanismo',
            detail: 'Oclusivo: gel autoadesivo mantém meio úmido e autólise leve.',
            icon: 'Droplets',
          },
          {
            label: 'Indicação típica',
            detail: 'Exsudato baixo a moderado, leito de granulação, bordas íntegras.',
            icon: 'CircleDot',
          },
          {
            label: 'Tempo de uso',
            detail: 'Permanência prolongada se íntegro; trocar antes se vazamento ou saturação.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha pH alcalino',
            detail: 'Meio ácido favorece cicatrização — não alcalino.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Hidrocoloide = oclusivo úmido · troca se vazar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa verdadeira sobre curativo hidrocoloide.',
          'Descartar A: impermeável a bactérias externas — não é o foco da alternativa correta.',
          'Descartar B: pH alcalino — oclusivo mantém ambiente ácido, não alcalino.',
          'Descartar C: visa impedir secreções — absorve exsudato leve, não bloqueia tudo.',
          'Descartar D: baixo exsudato sem granulação e sem oclusão — contradiz o mecanismo.',
          'Confirmar E: permanência prolongada ou trocar antes se vazamento de secreção.',
          'Em similares: hidrocoloide troca por integridade do selo, não só por calendário.',
        ],
        footer_rule: 'Troca do hidrocoloide = tempo OU vazamento',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HIDROCOLOIDE — DECORE A BANCA',
        rows: [
          { label: 'Exsudato', value: 'baixo a moderado — não abundante' },
          { label: 'Leito', value: 'granulação/epitelização com bordas íntegras' },
          { label: 'Permanência', value: 'prolongada se íntegro — trocar se vazamento/maceração' },
          { label: 'pH local', value: 'ambiente ácido úmido — não alcalino' },
        ],
        footer_rule: 'Vazou? Troca — mesmo antes do prazo habitual',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIDROCOLOIDE',
        items: [
          {
            label: 'Letra A — permeabilidade a bactérias',
            detail: 'Filme externo barreira — não é a verdadeira pedida no gabarito.',
            correct: 'Pode ser discutível; E é a afirmativa canônica de permanência.',
          },
          {
            label: 'Letra B — pH alcalino',
            detail: 'Oclusivo favorece pH ácido — alcalino erra o mecanismo.',
            correct: 'Meio ácido úmido estimula cicatrização — não alcalino.',
          },
          {
            label: 'Letra C — impedir secreções',
            detail: 'Absorve exsudato leve — não seca nem bloqueia totalmente.',
            correct: 'Hidrocoloide gerencia umidade, não impede toda secreção.',
          },
          {
            label: 'Letra D — sem granulação/oclusão',
            detail: 'Precisa de leito viável e oclusão — contraria indicação.',
            correct: 'Granulação + oclusão são premissas do hidrocoloide.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Cobram exsudato abundante como indicação — pegadinha clássica.',
            correct: 'Abundante = alginato/espuma — hidrocoloide é baixo/moderado.',
          },
        ],
        footer_rule: 'E certa: permanência prolongada ou troca precoce se vazar',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cebraspe-cespe-enfermagem-curativos-e-manejo-de-feridas-1779340178514-2': {
    family: 'certo_errado',
    guideline: 'Meio úmido em fibrina viável — hidropolímero, hidrogel, AGE, alginato, carvão, rayon petrolato',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Meio úmido × tecido viável',
        meta: slideMeta,
        items: [
          {
            label: 'Fibrina viável',
            detail: 'Tecido branco úmido no leito — precisa de ambiente úmido controlado.',
            icon: 'Droplets',
          },
          {
            label: 'Coberturas úmidas',
            detail: 'Hidrogel, hidropolímero, AGE, alginato mantêm umidade terapêutica.',
            icon: 'Bandage',
          },
          {
            label: 'Carvão ativado',
            detail: 'Absorvente com ação antimicrobiana em exsudato moderado.',
            icon: 'Flame',
          },
          {
            label: 'Rayon com petrolato',
            detail: 'Não aderente — protege leito úmido em tecido viável.',
            icon: 'Shield',
          },
          {
            label: 'Pegadinha seco',
            detail: 'Gaze seca desidrata fibrina — contraindicada para manter viabilidade.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Fibrina viável = meio úmido — nunca secar o leito',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Item C/E: coberturas de meio úmido em fibrina viável (branca).',
          'Listar: hidropolímero, hidrogel, AGE, alginato, carvão, rayon petrolato.',
          'Todas mantêm ou permitem umidade adequada ao leito viável.',
          'Conclusão: afirmativa correta — marcar Certo.',
          'Em similares: fibrina branca pede umidade — gaze seca é distrator clássico.',
        ],
        footer_rule: 'Tecido branco viável → cobertura úmida/oclusiva',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MEIO ÚMIDO — FIBRINA VIÁVEL',
        rows: [
          { label: 'Hidrogel / hidropolímero', value: 'reidratam e mantêm leito úmido' },
          { label: 'AGE', value: 'nutre leito vitalizado em granulação/epitelização' },
          { label: 'Alginato', value: 'gel úmido ao absorver — preenche e umedece' },
          { label: 'Evitar', value: 'gaze seca em leito com fibrina viável' },
        ],
        footer_rule: 'Winter: umidade controlada acelera epitelização',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'CERTO OU ERRADO — MEIO ÚMIDO',
        items: [
          {
            label: 'Marcar Errado',
            detail: 'Achar que fibrina viável deve ficar seca para “granular”.',
            correct: 'Fibrina viável exige umidade — item é Certo.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Incluem escara neca em “fibrina viável” para induzir erro.',
            correct: 'Branca viável ≠ escara negra — estadiar antes de cobrir.',
          },
        ],
        footer_rule: 'Lista do item = coberturas de meio úmido válidas',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-curativos-e-manejo-de-feridas-1779340178514-3': {
    family: 'certo_errado',
    guideline: 'Alginato de cálcio — hemostasia, meio úmido, absorção, preenchimento cavitário',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Alginato — quando usar',
        meta: slideMeta,
        items: [
          {
            label: 'Mecanismo',
            detail: 'Fibras de alginato formam gel ao contato com exsudato — hemostasia leve.',
            icon: 'Droplets',
          },
          {
            label: 'Exsudato',
            detail: 'Moderado a alto — absorve e mantém ambiente úmido.',
            icon: 'Waves',
          },
          {
            label: 'Cavidade',
            detail: 'Preenche espaço morto em feridas cavitárias ou túneis.',
            icon: 'Layers',
          },
          {
            label: 'Exposição óssea',
            detail: 'Pode ser usado em leito profundo com exsudação — avaliar protocolo.',
            icon: 'Bone',
          },
          {
            label: 'Pegadinha seco',
            detail: 'Alginato não é para leito seco sem exsudato — precisa umidade para gelificar.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Alginato = exsudato + cavidade + gel hemostático',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Item C/E: propriedades do alginato de cálcio.',
          'Checar hemostasia, meio úmido, absorção de exsudato e preenchimento.',
          'Indicação: cavitárias exsudativas, inclusive com exposição óssea.',
          'Todas as afirmações do item estão alinhadas à prática.',
          'Marcar Certo.',
          'Em similares: alginato = exsudato moderado/alto + cavidade.',
        ],
        footer_rule: 'Alginato gelifica com exsudato — preenche e absorve',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ALGINATO — CHECKLIST',
        rows: [
          { label: 'Hemostasia', value: 'pressiona e gelifica — sangramento leve' },
          { label: 'Umidade', value: 'mantém meio úmido no leito' },
          { label: 'Absorção', value: 'exsudato moderado a alto' },
          { label: 'Forma', value: 'fita, placa ou fibra — preenche cavidade' },
        ],
        footer_rule: 'Sem exsudato, alginato não forma gel — contraindicado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'CERTO OU ERRADO — ALGINATO',
        items: [
          {
            label: 'Marcar Errado',
            detail: 'Confundir com hidrocoloide de baixo exsudato ou leito seco.',
            correct: 'Item descreve alginato corretamente — Certo.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Negam uso com exposição óssea para forçar Errado.',
            correct: 'Com exsudação e protocolo, alginato pode preencher cavidade profunda.',
          },
        ],
        footer_rule: 'Quatro propriedades do item = verdadeiras para alginato',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-curativos-e-manejo-de-feridas-1779340178514-4': {
    family: 'certo_errado',
    guideline: 'Hidrocoloide — exsudato baixo/moderado; não indicado para exsudação abundante',
    exam_vs_current: 'Item erra ao citar exsudação abundante — hidrocoloide é para baixo/moderado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hidrocoloide — limites',
        meta: slideMeta,
        items: [
          {
            label: 'Meio úmido',
            detail: 'Gel autoadesivo oclusivo — autólise e neoangiogênese leves.',
            icon: 'Droplets',
          },
          {
            label: 'Exsudato esperado',
            detail: 'Baixo a moderado — saturação excessiva rompe a oclusão.',
            icon: 'Gauge',
          },
          {
            label: 'Granulação',
            detail: 'Leito vermelho viável com bordas íntegras — fase de preenchimento.',
            icon: 'Heart',
          },
          {
            label: 'Pegadinha abundante',
            detail: 'Exsudação abundante pede alginato/espuma — não hidrocoloide.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Impermeável',
            detail: 'Barreira externa a microrganismos — troca se maceração perilesional.',
            icon: 'Shield',
          },
        ],
        footer_rule: 'Abundante ≠ hidrocoloide — use absorvente',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Item C/E: hidrocoloide para exsudação abundante em granulação.',
          'Verdadeiro: meio úmido, aquecido, neoangiogênese, impermeável, absorve exsudato.',
          'Falso no item: “exsudação abundante” — hidrocoloide é baixo/moderado.',
          'Conclusão: afirmativa errada — marcar Errado.',
          'Em similares: abundante = alginato/espuma; hidrocoloide = exsudato contido.',
        ],
        footer_rule: 'Palavra “abundante” invalida o item',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HIDROCOLOIDE × EXSUDATO',
        rows: [
          { label: 'Indicado', value: 'exsudato baixo a moderado + granulação' },
          { label: 'Contraindicado', value: 'exsudação abundante — macera perilesional' },
          { label: 'Alternativa abundante', value: 'alginato ou espuma de poliuretano' },
          { label: 'Troca', value: 'vazamento ou saturação — o que ocorrer primeiro' },
        ],
        footer_rule: 'Abundante → absorvente; moderado → oclusivo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'CERTO OU ERRADO — EXSUDATO ABUNDANTE',
        items: [
          {
            label: 'Marcar Certo',
            detail: 'Aceitar “abundante” porque hidrocoloide absorve algo.',
            correct: 'Absorção limitada — abundante contraindica hidrocoloide.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Trocam por “moderado” para tornar o item Certo.',
            correct: 'Leia o adjetivo do exsudato — ele decide o gabarito.',
          },
        ],
        footer_rule: 'Item mistura verdades do produto com indicação falsa',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-curativos-e-manejo-de-feridas-1779340178514-5': {
    family: 'certo_errado',
    guideline: 'Princípios do curativo ideal (Winter) — umidade, exsudato, gás, isolamento, assépsia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Curativo ideal — princípios',
        meta: slideMeta,
        items: [
          {
            label: 'Umidade controlada',
            detail: 'Ambiente úmido acelera epitelização sem macerar perilesional.',
            icon: 'Droplets',
          },
          {
            label: 'Exsudato',
            detail: 'Remover excesso — evitar saturação e infecção.',
            icon: 'Waves',
          },
          {
            label: 'Troca gasosa',
            detail: 'Permeabilidade ao O₂ e vapor — não oclusão hermética absoluta.',
            icon: 'Wind',
          },
          {
            label: 'Barreira bacteriana',
            detail: 'Proteger leito de contaminação externa.',
            icon: 'Shield',
          },
          {
            label: 'Remoção atraumática',
            detail: 'Trocar sem dor nem trauma — adesão adequada.',
            icon: 'Heart',
          },
        ],
        footer_rule: 'Winter: úmido + limpo + protegido + atraumático',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Item C/E: lista princípios gerais do curativo ideal.',
          'Conferir cada bullet: umidade, exsudato, gás, térmico, barreira, assépsia, remoção.',
          'Todos são pilares clássicos da terapia por cobertura.',
          'Marcar Certo.',
          'Em similares: princípios Winter aparecem inteiros ou com um termo trocado.',
        ],
        footer_rule: 'Sete princípios do item = canônicos',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRINCÍPIOS WINTER — DECORE',
        rows: [
          { label: 'Umidade', value: 'alta entre ferida e cobertura — sem excesso' },
          { label: 'Exsudato', value: 'remover o excesso — manter equilíbrio' },
          { label: 'Gás', value: 'permitir troca gasosa (O₂/vapor)' },
          { label: 'Remoção', value: 'sem trauma nem dor — adesão controlada' },
        ],
        footer_rule: 'Um princípio faltando ou invertido = Errado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'CERTO OU ERRADO — PRINCÍPIOS',
        items: [
          {
            label: 'Marcar Errado',
            detail: 'Achar que curativo deve secar o leito ou ser totalmente impermeável ao gás.',
            correct: 'Lista completa está correta — Certo.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Omitem “troca gasosa” ou trocam por “impermeável total”.',
            correct: 'Cada princípio importa — leia a lista inteira.',
          },
        ],
        footer_rule: 'Curativo ideal = úmido + protegido + atraumático',
      },
    ],
  },

  'facet-enfermagem-curativos-e-manejo-de-feridas-1779344759089-0': {
    family: 'conceito',
    guideline: 'Exsudato alto — alginato de cálcio (absorção e gelificação)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Seleção por exsudato',
        meta: slideMeta,
        items: [
          {
            label: 'Exsudato alto',
            detail: 'Grande quantidade de secreção — precisa cobertura altamente absorvente.',
            icon: 'Waves',
          },
          {
            label: 'Alginato de cálcio',
            detail: 'Alta absorção; forma gel ao contato — primeira linha em exsudato abundante.',
            icon: 'Droplets',
          },
          {
            label: 'Hidrocoloide',
            detail: 'Exsudato mínimo a moderado — não suporta grande volume.',
            icon: 'Layers',
          },
          {
            label: 'Gaze seca',
            detail: 'Pode aderir à granulação e causar dor na troca.',
            icon: 'XCircle',
          },
          {
            label: 'Pegadinha carvão',
            detail: 'Controla odor e absorve, mas não é 1ª escolha para volume muito alto.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Muito exsudato → alginato (ou espuma) — não oclusivo leve',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: curativo para ferida com grande quantidade de exsudato.',
          'Cruzar exsudato alto com capacidade de absorção da cobertura.',
          'Eliminar A: gaze seca adere e machuca na troca.',
          'Eliminar B: hidrocoloide é para exsudato mínimo/moderado.',
          'Eliminar C: carvão não é primeira escolha para volume muito alto.',
          'Eliminar E: oclusivo simples não absorve exsudato abundante.',
          'Marcar D — alginato de cálcio.',
          'Em similares: quantidade de exsudato define absorvente vs oclusivo.',
        ],
        footer_rule: 'Exsudato alto = alginato ou espuma',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EXSUDATO × COBERTURA',
        rows: [
          { label: 'Alto / abundante', value: 'alginato de cálcio ou espuma de poliuretano' },
          { label: 'Moderado', value: 'espuma ou hidrofibra' },
          { label: 'Baixo', value: 'hidrocoloide ou filme transparente' },
          { label: 'Evitar', value: 'gaze seca em leito granulante exsudativo' },
        ],
        footer_rule: 'Leia o adjetivo do exsudato antes do produto',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXSUDATO ALTO',
        items: [
          {
            label: 'Letra A — gaze seca',
            detail: 'Protege mas adere à granulação — troca dolorosa.',
            correct: 'Não é escolha para grande exsudato em ferida crônica.',
          },
          {
            label: 'Letra B — hidrocoloide',
            detail: 'Ótimo em exsudato mínimo/moderado — satura se volume alto.',
            correct: 'Abundante contraindica hidrocoloide — macera perilesional.',
          },
          {
            label: 'Letra C — carvão ativado',
            detail: 'Absorve e neutraliza odor — adjuvante, não 1ª linha em volume alto.',
            correct: 'Alginato/espuma vêm antes do carvão em exsudato maciço.',
          },
          {
            label: 'Letra E — oclusivo simples',
            detail: 'Barreira sem absorção suficiente para muito exsudato.',
            correct: 'Oclusivo leve não gerencia secreção abundante.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Trocam “grande” por “moderado” para validar hidrocoloide.',
            correct: 'Grande quantidade = alginato — não reduza o adjetivo.',
          },
        ],
        footer_rule: 'D certa: alginato para exsudato em grande quantidade',
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
    console.log(`[handcraft:curativos-g01] OK ${slug}`);
  }
  console.log(`[handcraft:curativos-g01] total=${ok}`);
}

main();
