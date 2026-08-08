#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — coleta-de-exames-laboratoriais-g06 (8 slugs coleta_tubos_ordem + técnica).
 *
 *   npx tsx scripts/handcraft-coleta-de-exames-laboratoriais-g06.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'coleta-de-exames-laboratoriais-g06';
const SUBTOPICO = 'Coleta de Exames Laboratoriais';
const BRANCH_DEFAULT = 'coleta_tubos_ordem';
const REVIEWED = '2026-08-05';

const CLSI_SOURCE = {
  id: 'clsi-gp41-tube-order',
  tier: 'A' as const,
  issuer: 'CLSI',
  title: 'Collection of Diagnostic Venous Blood Specimens — ordem de tubos e aditivos',
  year: 2017,
  covers: ['sequência citrato → soro → heparina → fluoreto → EDTA', 'contaminação cruzada', 'tubos a vácuo por cor'],
};

const POTTER_SOURCE = {
  id: 'potter-coleta-11ed',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Coleta de amostras sanguíneas',
  year: 2024,
  covers: ['ordem de enchimento de tubos', 'identificação por tampa/cor', 'punção venosa'],
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
  branch?: string;
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
    pedagogical_branch: pack.branch ?? BRANCH_DEFAULT,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft:coleta-g06',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
    },
    sources: [CLSI_SOURCE, POTTER_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/quaisaditivos/gi, 'quais aditivos')
    .replace(/Essaprática/gi, 'Essa prática')
    .replace(/profissionaiscontribuem/gi, 'profissionais contribuem')
    .replace(/amostrasanguínea/gi, 'amostra sanguínea')
    .replace(/sangue dopaciente/gi, 'sangue do paciente')
    .replace(/etapas doprocesso/gi, 'etapas do processo')
    .replace(/para odiagnóstico/gi, 'para o diagnóstico')
    .replace(/membrosnos/gi, 'membros nos')
    .replace(/perfurocortante/gi, 'perfurocortante')
    .replace(/Clinical and Laboratory StandardsInstitute/gi, 'Clinical and Laboratory Standards Institute')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'adm-tec-enfermagem-coleta-de-exames-laboratoriais-1779562725491-1': {
    family: 'conceito',
    guideline: 'CLSI GP41 — ordem tubos a vácuo: citrato → soro → heparina → fluoreto → EDTA',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tubos a vácuo — mapa da sequência',
        meta: slideMeta,
        items: [
          { label: 'Contaminação cruzada', detail: 'Aditivo de um tubo altera o próximo se a ordem for invertida.', icon: 'AlertTriangle' },
          { label: 'Citrato primeiro (azul)', detail: 'Tubos com citrato vêm antes dos demais.', icon: 'Droplet' },
          { label: 'Soro e heparina', detail: 'Amarelo/vermelho (coágulo) e verde (heparina) após o azul.', icon: 'TestTube' },
          { label: 'Pegadinha cinza × roxo', detail: 'Fluoreto (cinza) antes do EDTA (lilás/roxo).', icon: 'Shuffle' },
          { label: 'Cores = aditivos', detail: 'A banca testa sequência normativa, não só cor isolada.', icon: 'Palette' },
        ],
        footer_rule: 'Azul → soro → heparina → cinza → EDTA',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: ordem correta de tubos a vácuo para evitar contaminação cruzada.',
          'Fixar 1º tubo: citrato (azul).',
          'Depois do azul: amarelo/vermelho (ativador) → verde (heparina).',
          'Últimos dois: cinza (fluoreto) antes de lilás/roxo (EDTA).',
          'Sequência completa bate com letra D.',
          'Eliminar A (soro antes do azul), B (heparina antes do soro) e C (EDTA antes do cinza).',
          'Marcar D.',
          'Em similares: trilho portátil azul → soro → heparina → cinza → roxo.',
        ],
        footer_rule: 'Trilho: azul → amarelo/vermelho → verde → cinza → lilás/roxo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Ordem CLSI — tubos a vácuo',
        meta: slideMeta,
        content: 'SEQUÊNCIA DE COLETA — TUBOS A VÁCUO',
        rows: [
          { label: '1º — citrato', value: 'Azul (citrato de sódio)', badge: 'ok' },
          { label: '2º — soro', value: 'Amarelo/vermelho (ativador de coágulo)', badge: 'ok' },
          { label: '3º — heparina', value: 'Verde (heparina)', badge: 'ok' },
          { label: '4º — fluoreto', value: 'Cinza (fluoreto de sódio/EDTA)', badge: 'hot' },
          { label: '5º — EDTA', value: 'Lilás/roxo (EDTA)', badge: 'hot' },
        ],
        footer_rule: 'Decore o trilho — cinza sempre antes do roxo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ORDEM DE TUBOS Adm&Tec',
        items: [
          { label: 'Letra A — soro antes do citrato', detail: 'Começa por amarelo/vermelho.', correct: 'Citrato (azul) deve ser o primeiro tubo da sequência.' },
          { label: 'Letra B — heparina antes do soro', detail: 'Verde vem antes do amarelo/vermelho.', correct: 'Após o azul, vem soro (amarelo/vermelho) e depois verde.' },
          { label: 'Letra C — EDTA antes do fluoreto', detail: 'Lilás/roxo antes do cinza.', correct: 'Fluoreto (cinza) coleta antes do EDTA (lilás/roxo).' },
          { label: 'Confundir cor com função', detail: 'Decorar só cor sem sequência.', correct: 'Sempre fechar com cinza → lilás/roxo nesta prova.' },
          { label: 'Em outra banca…', detail: 'Ordem com hemocultura primeiro.', correct: 'Hemocultura pode preceder citrato — mas o par cinza/roxo permanece pegadinha clássica.' },
        ],
        footer_rule: 'Pegadinha clássica: trocar cinza e roxo no fim',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'agirh-enfermagem-exames-laboratoriais-1779563631609-4': {
    family: 'certo_errado',
    branch: 'coleta_tecnica_venosa',
    guideline: 'Potter/CLSI — técnica venosa: evitar membros contraindicados; sistema fechado reduz acidente perfurocortante',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Coleta venosa — terreno',
        meta: slideMeta,
        items: [
          { label: 'Comando INCORRETA', detail: 'A banca pede a afirmativa FALSA — marque o erro.', icon: 'AlertTriangle' },
          { label: 'Veias a evitar', detail: 'Sensíveis, esclerosadas, trombose, queimadura, EV recente, mastectomia.', icon: 'Ban' },
          { label: 'Ângulo de punção', detail: '≈15–30° com bisel para cima — técnica correta (não é a INCORRETA).', icon: 'Syringe' },
          { label: 'Sistema fechado × aberto', detail: 'Vácuo/fechado = menos transferência seringa→tubo = menos acidente.', icon: 'Shield' },
          { label: 'Pegadinha D', detail: 'Inverte risco: aberto tem MAIOR risco de perfurocortante.', icon: 'XCircle' },
        ],
        footer_rule: 'INCORRETA = afirmativa falsa sobre coleta venosa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: assinale a afirmativa INCORRETA sobre coleta de sangue.',
          'A — evitar veias inadequadas: CORRETA (não marcar).',
          'B — ângulo ~30° bisel para cima: CORRETA (não marcar).',
          'C — pós-mastectomia risco linfático: CORRETA (não marcar).',
          'D — sistema aberto tem MENOR risco de acidente: FALSA.',
          'Sistema aberto exige transferência manual — MAIOR risco perfurocortante.',
          'Marcar D como INCORRETA.',
          'Em similares: sistema fechado (vácuo) reduz acidente — aberto aumenta risco na transferência.',
        ],
        footer_rule: 'D = erro clássico fechado × aberto',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica venosa',
        meta: slideMeta,
        content: 'COLETA VENOSA — DECORE',
        rows: [
          { label: 'Evitar punção', value: 'Fístula, mastectomia, EV, hematoma, esclerose', badge: 'warn' },
          { label: 'Ângulo', value: '15–30° — bisel voltado para cima', badge: 'ok' },
          { label: 'Sistema fechado', value: 'Menor risco de acidente com perfurocortante', badge: 'hot' },
          { label: 'Sistema aberto', value: 'Seringa + transferência = maior risco', badge: 'warn' },
        ],
        footer_rule: 'Fechado protege o profissional na transferência',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INCORRETA Agirh',
        items: [
          { label: 'Letra A — veias contraindicadas', detail: 'Lista clássica de exclusão.', correct: 'Afirmativa correta — não é a INCORRETA pedida.' },
          { label: 'Letra B — ângulo 30°', detail: 'Técnica de inserção padrão.', correct: 'Conduta correta — eliminar como resposta.' },
          { label: 'Letra C — mastectomia', detail: 'Risco linfático aumentado.', correct: 'Verdadeira — paciente pós-mastectomia exige cuidado.' },
          { label: 'Letra D — aberto menor risco', detail: 'Inverte a realidade de biossegurança.', correct: 'Sistema aberto aumenta risco na transferência — gabarito INCORRETA.' },
          { label: 'Em outra banca…', detail: 'Pergunta ordem de tubos.', correct: 'INCORRETA aqui = biossegurança fechado × aberto — leia o comando.' },
        ],
        footer_rule: 'Leia “INCORRETA” antes de marcar',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'amauc-enfermagem-exames-laboratoriais-1779563631609-3': {
    family: 'conceito',
    guideline: 'CLSI — tubo cinza (fluoreto/oxalato): glicose, lactato, HbA1c — inibidor glicolítico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tubos por analito — glicose',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Tubo/cor para glicose, HbA1c e lactato.', icon: 'FlaskConical' },
          { label: 'Cinza (fluoreto)', detail: 'Inibe glicólise — preserva glicose e lactato in vivo.', icon: 'Droplet' },
          { label: 'Roxo (EDTA)', detail: 'Hemograma/tipagem — não é tubo de glicemia de rotina.', icon: 'TestTube' },
          { label: 'Verde (heparina)', detail: 'Plasma para alguns exames — não triplete glicose/HbA1c/lactato.', icon: 'TestTube2' },
          { label: 'Pegadinha amarelo/vermelho', detail: 'Soro sem inibidor glicolítico — glicose cai pós-coleta.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Glicose + lactato + HbA1c → tampa cinza',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: tubo CORRETO para glicose, hemoglobina glicada e lactato.',
          'Esses analitos exigem inibição da glicólise pós-coleta.',
          'Tubo cinza contém fluoreto (± oxalato) — preserva glicose/lactato.',
          'Eliminar roxo (EDTA) — hematologia.',
          'Eliminar verde, vermelho, amarelo — não são padrão para esse trio.',
          'Marcar E — cinza.',
          'Em similares: glicose/lactato/HbA1c → tampa cinza (fluoreto anti-glicólise).',
        ],
        footer_rule: 'E = tampa cinza (fluoreto)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — cores × exames',
        meta: slideMeta,
        content: 'TUBOS — ANALITOS CHAVE',
        rows: [
          { label: 'Glicose / lactato / HbA1c', value: 'Cinza — fluoreto de sódio', badge: 'hot' },
          { label: 'Hemograma / tipagem', value: 'Roxo/lilás — EDTA', badge: 'ok' },
          { label: 'Coagulação / TAP', value: 'Azul — citrato', badge: 'ok' },
          { label: 'Soro / sorologia', value: 'Vermelho/amarelo — ativador/gel', badge: 'ok' },
        ],
        footer_rule: 'Cinza = anti-glicólise',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GLICOSE Amauc',
        items: [
          { label: 'Letra A — amarelo', detail: 'Soro com gel.', correct: 'Sem fluoreto a glicose diminui — não é tubo desse trio.' },
          { label: 'Letra B — verde', detail: 'Heparina/plasma.', correct: 'Não é padrão para glicose + HbA1c + lactato juntos.' },
          { label: 'Letra C — vermelho', detail: 'Soro seco.', correct: 'Glicólise altera glicose — exige cinza.' },
          { label: 'Letra D — roxo', detail: 'EDTA para hematologia.', correct: 'Hemograma sim — glicemia/lactato não.' },
          { label: 'Em outra banca…', detail: 'Pergunta só glicemia capilar.', correct: 'Fluoreto/cinza permanece padrão para glicose sérica e lactato.' },
        ],
        footer_rule: 'Não usar EDTA para glicose de rotina',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ameosc-enfermagem-coleta-de-exames-laboratoriais-1779562730776-0': {
    family: 'conceito',
    branch: 'coleta_tubos_ordem',
    guideline: 'CLSI vácuo — hemograma: tubo EDTA (roxo) + agulha + garrote; seringa não faz parte do sistema a vácuo rotineiro',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Material — hemograma a vácuo',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Qual item NÃO é usado na coleta para hemograma completo.', icon: 'Package' },
          { label: 'Sistema a vácuo', detail: 'Agulha holder + tubo EDTA — sangue entra direto no tubo.', icon: 'TestTube' },
          { label: 'Tubo EDTA (roxo)', detail: 'Anticoagulante do hemograma — item necessário.', icon: 'Droplet' },
          { label: 'Agulha + garrote + antisepsia', detail: 'Itens padrão da punção venosa com álcool.', icon: 'Syringe' },
          { label: 'Seringa 3 mL', detail: 'Usada em coleta aberta/transferência — não no vácuo rotineiro.', icon: 'XCircle' },
        ],
        footer_rule: 'Hemograma a vácuo = tubo EDTA, não seringa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: identificar item que NÃO é utilizado no hemograma completo.',
          'Hemograma = tubo com EDTA (roxo/lilás) no sistema a vácuo.',
          'Agulha, garrote, álcool/algodão fazem parte do procedimento.',
          'Seringa é típica de coleta aberta com transferência manual.',
          'No vácuo, o tubo coleta direto — seringa 3 mL sobra.',
          'Marcar B — seringa de 3 mL.',
          'Em similares: hemograma a vácuo = tubo EDTA direto — seringa indica coleta aberta.',
        ],
        footer_rule: 'B = item desnecessário no vácuo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — material hemograma',
        meta: slideMeta,
        content: 'HEMOGRAMA — KIT VÁCUO',
        rows: [
          { label: 'Tubo', value: 'EDTA — tampa roxa/lilás', badge: 'hot' },
          { label: 'Agulha/holder', value: 'Mult amostras ou butterfly conforme veia', badge: 'ok' },
          { label: 'Garrote + antisepsia', value: 'Algodão e antisepsia alcoólica', badge: 'ok' },
          { label: 'Não usar', value: 'Seringa para transferência (vácuo direto)', badge: 'warn' },
        ],
        footer_rule: 'Vácuo elimina seringa intermediária',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MATERIAL Ameosc',
        items: [
          { label: 'Letra A — agulha 40×12', detail: 'Item de punção.', correct: 'Necessária — não é a resposta “não utilizado”.' },
          { label: 'Letra C — tubo EDTA', detail: 'Anticoagulante do hemograma.', correct: 'Essencial para hemograma completo.' },
          { label: 'Letra D — algodão/antisepsia', detail: 'Antisepsia padrão.', correct: 'Usado antes e após punção.' },
          { label: 'Letra B — seringa 3 mL', detail: 'Parece “material de coleta”.', correct: 'No sistema a vácuo não entra — gabarito da questão.' },
          { label: 'Em outra banca…', detail: 'Pergunta ordem de tubos.', correct: 'Material hemograma: tubo EDTA roxo no vácuo — seringa só em coleta aberta.' },
        ],
        footer_rule: 'Confundir vácuo com seringa é pegadinha',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'avancasp-enfermagem-coleta-de-exames-laboratoriais-1779562780466-3': {
    family: 'conceito',
    guideline: 'ISO 6710 / CLSI — 1º tubo da sequência: citrato (azul)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ordem ISO 6710 — 1º tubo',
        meta: slideMeta,
        items: [
          { label: 'Norma ISO 6710:1995', detail: 'Cores padronizadas dos tubos — padrão internacional de cores.', icon: 'BookOpen' },
          { label: 'Contaminação cruzada', detail: 'Ordem correta garante amostra sanguínea íntegra para J. P. da Silva.', icon: 'AlertTriangle' },
          { label: 'Comando', detail: 'Primeiro tubo (cor da tampa) para evitar contaminação cruzada.', icon: 'ArrowRight' },
          { label: 'Citrato (azul)', detail: 'Sempre inicia a sequência quando citrato entra no pedido.', icon: 'Droplet' },
          { label: 'Demais cores', detail: 'Vermelho, verde, roxo, cinza vêm depois — nunca antes do azul.', icon: 'ListOrdered' },
          { label: 'Contaminação cruzada', detail: 'Aditivo arrastado altera coagulação e hematologia.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Primeiro tubo = azul (citrato)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: primeiro tubo na coleta multiparamétrica (ISO 6710).',
          'Sequência normativa começa pelo tubo de citrato de sódio.',
          'Citrato = tampa azul.',
          'Eliminar vermelho, verde, roxo, cinza como 1º tubo.',
          'Marcar A — azul.',
          'Em similares: ordem ISO 6710 — citrato (azul) abre a coleta multiparamétrica.',
        ],
        footer_rule: 'A = citrato primeiro',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — posição na sequência',
        meta: slideMeta,
        content: 'ORDEM ISO — INÍCIO',
        rows: [
          { label: '1º', value: 'Azul — citrato', badge: 'hot' },
          { label: '2º', value: 'Vermelho/amarelo — soro', badge: 'ok' },
          { label: '3º', value: 'Verde — heparina', badge: 'ok' },
          { label: '4º–5º', value: 'Cinza → roxo (fluoreto antes EDTA)', badge: 'warn' },
        ],
        footer_rule: 'Nunca iniciar por roxo ou cinza',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 1º TUBO AVANÇASP',
        items: [
          { label: 'Letra B — vermelho', detail: 'Soro com ativador.', correct: 'Vem após citrato — não é o primeiro.' },
          { label: 'Letra C — verde', detail: 'Heparina.', correct: 'Posição intermediária — nunca 1º.' },
          { label: 'Letra D — roxo', detail: 'EDTA.', correct: 'Hemograma — coleta tardiamente na sequência.' },
          { label: 'Letra E — cinza', detail: 'Fluoreto.', correct: 'Penúltimo na sequência Adm&Tec/CLSI — não primeiro.' },
          { label: 'Em outra banca…', detail: 'Pergunta último tubo da sequência.', correct: 'Primeiro sempre citrato azul — independente do tubo final.' },
        ],
        footer_rule: 'Azul abre a sequência multiparamétrica',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'avancasp-enfermagem-coleta-de-exames-laboratoriais-1779562780466-4': {
    family: 'conceito',
    guideline: 'ISO 6710 — tubo EDTA para hematologia: tampa roxa/lilás',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'EDTA ISO 6710 — cor da tampa',
        meta: slideMeta,
        items: [
          { label: 'Norma ISO 6710:1995', detail: 'Cores padronizadas — contaminação cruzada e amostra sanguínea íntegra.', icon: 'BookOpen' },
          { label: 'Comando', detail: 'Cor do tubo com EDTA para sangue total/hematologia (J. P. da Silva).', icon: 'TestTube' },
          { label: 'EDTA', detail: 'Anticoagulante por quelante de cálcio — hemograma, tipagem, morfologia.', icon: 'Droplet' },
          { label: 'Roxo/lilás', detail: 'Padronização ISO 6710 para EDTA.', icon: 'Palette' },
          { label: 'Pegadinha azul', detail: 'Azul = citrato (coagulação), não EDTA.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'EDTA = tampa roxa/lilás',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: cor do tubo com EDTA para testes hematológicos.',
          'EDTA anticoagula sangue total para hemograma e tipagem.',
          'Padronização internacional: tampa roxa/lilás.',
          'Eliminar azul (citrato), verde (heparina), vermelho (soro), cinza (fluoreto).',
          'Marcar D — roxo/lilás.',
          'Em similares: EDTA hematologia = tampa roxa/lilás na Norma ISO 6710.',
        ],
        footer_rule: 'D = EDTA roxo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — cores × aditivos',
        meta: slideMeta,
        content: 'MAPA RÁPIDO — TAMPAS',
        rows: [
          { label: 'Roxo/lilás', value: 'EDTA — hemograma/tipagem', badge: 'hot' },
          { label: 'Azul', value: 'Citrato — coagulação', badge: 'ok' },
          { label: 'Verde', value: 'Heparina — plasma', badge: 'ok' },
          { label: 'Cinza', value: 'Fluoreto — glicose', badge: 'ok' },
        ],
        footer_rule: 'Hematologia → roxo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COR EDTA',
        items: [
          { label: 'Letra A — azul', detail: 'Citrato de sódio.', correct: 'Coagulação/TAP — não EDTA hematológico.' },
          { label: 'Letra B — vermelho', detail: 'Soro seco/ativador.', correct: 'Bioquímica sorológica — sem EDTA.' },
          { label: 'Letra C — verde', detail: 'Heparina.', correct: 'Plasma — outro anticoagulante.' },
          { label: 'Letra E — cinza', detail: 'Fluoreto.', correct: 'Glicemia/lactato — não hemograma.' },
          { label: 'Em outra banca…', detail: 'Pergunta ordem de coleta.', correct: 'Cor EDTA roxo/lilás permanece fixa para hematologia.' },
        ],
        footer_rule: 'Não confundir EDTA com citrato',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'avancasp-enfermagem-coleta-de-exames-laboratoriais-1779562780466-5': {
    family: 'conceito',
    guideline: 'CLSI — último tubo da sequência Adm&Tec: EDTA (roxo) após fluoreto (cinza)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ordem ISO 6710 — último tubo',
        meta: slideMeta,
        items: [
          { label: 'Norma ISO 6710:1995', detail: 'Tubos em ordem aleatória na figura — seguir padrão internacional de cores.', icon: 'BookOpen' },
          { label: 'Contaminação cruzada', detail: 'Último tubo da coleta de amostra sanguínea de J. P. da Silva, 49 anos.', icon: 'AlertTriangle' },
          { label: 'Comando', detail: 'Último tubo da sequência para evitar contaminação cruzada.', icon: 'ArrowLeft' },
          { label: 'Sequência AVANÇASP', detail: 'Azul → vermelho → verde → roxo → cinza (figura desta prova).', icon: 'ListOrdered' },
          { label: 'Último cinza', detail: 'Fluoreto encerra a sequência apresentada — gabarito E.', icon: 'Droplet' },
        ],
        footer_rule: 'Nesta AVANÇASP: último = cinza (E)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: último tubo (cor) na coleta multiparamétrica ISO 6710.',
          'Gabarito oficial AVANÇASP: E — cinza (fluoreto).',
          'Sequência da figura: fluoreto encerra após EDTA roxo.',
          'Eliminar azul (1º), vermelho, verde (intermediários), roxo (penúltimo nesta figura).',
          'Marcar E — cinza.',
          'Em similares: leia a figura — último tubo pode ser cinza ou roxo conforme ordem da banca.',
        ],
        footer_rule: 'E = último tubo cinza (AVANÇASP)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — fim da sequência',
        meta: slideMeta,
        content: 'ÚLTIMO TUBO — ATENÇÃO BANCA',
        rows: [
          { label: 'AVANÇASP (esta)', value: 'Cinza — fluoreto (E)', badge: 'hot' },
          { label: 'Adm&Tec clássico', value: 'Roxo — EDTA após cinza', badge: 'warn' },
          { label: 'Regra-mãe', value: 'Seguir ordem da figura/enunciado da prova', badge: 'ok' },
        ],
        footer_rule: 'Gabarito AVANÇASP = E cinza',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ÚLTIMO TUBO',
        items: [
          { label: 'Letra D — roxo', detail: 'EDTA — comum como penúltimo.', correct: 'Nesta figura AVANÇASP o último é cinza — não marcar D.' },
          { label: 'Letra C — verde', detail: 'Heparina — posição intermediária.', correct: 'Verde nunca encerra a sequência multiparamétrica.' },
          { label: 'Letra A — azul', detail: 'Primeiro tubo citrato.', correct: 'Início da sequência — oposto do comando “último”.' },
          { label: 'Letra B — vermelho', detail: 'Soro com ativador.', correct: 'Posição intermediária — não o último tubo.' },
          { label: 'Em outra banca…', detail: 'Ordem Adm&Tec termina em roxo.', correct: 'Leia a figura ISO 6710 — aqui fluoreto cinza fecha (E).' },
        ],
        footer_rule: 'Último tubo depende da ordem da banca',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'avancasp-enfermagem-coleta-de-exames-laboratoriais-1779563165114-2': {
    family: 'conceito',
    guideline: 'CLSI GP41 — 1º tubo quando múltiplos analitos: citrato de sódio (azul)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'CLSI GP41 — sequência de coleta',
        meta: slideMeta,
        items: [
          { label: 'Clinical and Laboratory Standards Institute', detail: 'CLSI — ausência da sequência expõe a contaminação cruzada.', icon: 'Shield' },
          { label: 'Comando', detail: 'Primeiro tubo segundo CLSI para evitar contaminação.', icon: 'Shield' },
          { label: 'Citrato (B)', detail: 'Tubo azul — coagulação — sempre prioridade inicial.', icon: 'Droplet' },
          { label: 'EDTA (A)', detail: 'Roxo — hematologia — nunca antes do citrato.', icon: 'TestTube' },
          { label: 'Soro/heparina/fluoreto', detail: 'C, D, E vêm após citrato na ordem normativa.', icon: 'ListOrdered' },
        ],
        footer_rule: 'CLSI: citrato primeiro = B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sequência CLSI — qual tubo coletar primeiro.',
          'Contaminação cruzada: citrato deve ser o 1º quando presente.',
          'Eliminar A (EDTA), C (soro), D (heparina), E (fluoreto+EDTA).',
          'Marcar B — tubo de citrato de sódio.',
          'Em similares: CLSI GP41 — citrato azul abre quando múltiplos tubos são coletados.',
        ],
        footer_rule: 'B = citrato primeiro',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — CLSI ordem',
        meta: slideMeta,
        content: 'CLSI — PRIORIDADE INICIAL',
        rows: [
          { label: '1º', value: 'Citrato (azul) — coagulação', badge: 'hot' },
          { label: '2º', value: 'Ativador/gel — soro', badge: 'ok' },
          { label: '3º', value: 'Heparina (verde)', badge: 'ok' },
          { label: '4º–5º', value: 'Fluoreto → EDTA', badge: 'warn' },
        ],
        footer_rule: 'Sem citrato primeiro = erro pré-analítico',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CLSI AVANÇASP',
        items: [
          { label: 'Letra A — EDTA', detail: 'Hemograma.', correct: 'EDTA nunca antes de citrato na sequência multiparamétrica.' },
          { label: 'Letra C — ativador/gel', detail: 'Soro/plasma.', correct: 'Posição 2ª — não 1ª.' },
          { label: 'Letra D — heparina', detail: 'Plasma heparinizado.', correct: 'Após soro — não primeiro.' },
          { label: 'Letra E — fluoreto+EDTA', detail: 'Tubo cinza misto.', correct: 'Final da sequência — não inicial.' },
          { label: 'Em outra banca…', detail: 'Pergunta cor do tubo EDTA.', correct: 'Posição inicial permanece citrato azul segundo CLSI.' },
        ],
        footer_rule: 'CLSI = citrato abre',
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
    console.log(`[handcraft:coleta-g06] OK ${slug}`);
  }
  console.log(`[handcraft:coleta-g06] total=${ok}`);
}

main();
