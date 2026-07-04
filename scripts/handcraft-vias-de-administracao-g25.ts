#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — vias-de-administracao-g25 (8 slugs P2 Consulplan + perfis + técnica).
 *
 *   npx tsx scripts/handcraft-vias-de-administracao-g25.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const loteQuestionsDir = (lote: string) =>
  join(process.cwd(), 'data/catalog-migration', lote, 'questions');

const LOTE = 'vias-de-administracao-g25';
const SUBTOPICO = 'Vias de Administração';
const REVIEWED = '2026-07-04';

const COFEN_SOURCE = {
  id: 'vias-administracao-cofen',
  tier: 'A' as const,
  issuer: 'COFEN',
  title: 'Vias de administração de medicamentos',
  year: 2017,
  url: 'https://www.cofen.gov.br/',
  covers: [
    'via oral enteral',
    'técnica IM',
    'técnica SC',
    'volume intradérmico',
    'via intratecal',
    'vias tópicas pediátricas',
    'benzilpenicilina benzatina IM',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Vias e absorção',
  year: 2020,
  covers: ['absorção por via', 'técnica de punção', 'vias tópicas pediátricas', 'volumes ID'],
};

const PNI_SOURCE = {
  id: 'pni-calendario-vip',
  tier: 'A' as const,
  issuer: 'MS / PNI',
  title: 'Calendário Nacional de Vacinação — VIP (poliomielite inativada)',
  year: 2024,
  url: 'https://www.gov.br/saude/',
  covers: ['VIP IM 2-4-6 meses', 'esquema vacinal lactente'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'conceito';
  branch: 'via_vf_absorcao' | 'via_tecnica_admin' | 'via_generico';
  guideline: string;
  roi_error?: string;
  cluster?: string;
  sources?: (typeof COFEN_SOURCE)[];
  slides: unknown[];
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
    pedagogical_branch: pack.branch,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: 'none',
      catalog_slug: slug,
      cluster: pack.cluster ?? 'Perfis de via',
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: pack.sources ?? [COFEN_SOURCE, POTTER_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'imparh-enfermagem-vias-de-administracao-1778968956139-0': {
    family: 'conceito',
    branch: 'via_tecnica_admin',
    cluster: 'Vias tópicas pediátricas — oftálmica, otológica, nasal',
    guideline: 'Potter/COFEN — oftálmica: saco conjuntival inferior (não globo); otológica: decúbito lateral + permanência; nasal: leve flexão (não hiperflexão)',
    roi_error: 'topica_pediatrica_posicao_erro',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vias tópicas pediátricas — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Diferenças entre medicamentos oftálmicos, otológicos e nasais em crianças — cooperação e técnica correta.',
            icon: 'Target',
          },
          {
            label: 'Via oftálmica',
            detail: 'Criança em decúbito dorsal ou sentada com cabeça levemente inclinada para trás — olhar para cima facilita instilação no saco inferior.',
            icon: 'Eye',
          },
          {
            label: 'Saco conjuntival',
            detail: 'Pálpebra inferior puxada forma bolsa — colírio/pomada vai no saco, nunca diretamente sobre córnea/globo ocular.',
            icon: 'Droplets',
          },
          {
            label: 'Via otológica (gabarito)',
            detail: 'Decúbito ventral ou dorsal com cabeça virada para o ouvido tratado; após gotas, manter deitado no lado oposto alguns minutos.',
            icon: 'CheckCircle',
          },
          {
            label: 'Via nasal',
            detail: 'Limpar muco; cabeça levemente flexionada (não hiperflexionada) — evita escoamento para garganta e sensação de engasgo.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — decúbito ventral oftálmico',
            detail: 'Erro reproduzível: posicionar criança em prona para colírio — técnica inadequada para via ocular.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Cada via local tem posição e destino anatômico próprios',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: assinale a alternativa CORRETA sobre oftálmica, otológica e nasal em crianças.',
          'Testar A oftálmica: decúbito ventral + cabeça estendida — posição inadequada para colírio → eliminar.',
          'Testar B oftálmica: aplicar no globo ocular — contraindicado; destino é saco conjuntival inferior → eliminar.',
          'Testar D nasal: hiperflexão da cabeça — inverte técnica; flexão leve evita escoamento → eliminar.',
          'Confirmar C otológica: decúbito com cabeça virada + permanência no lado oposto — técnica correta.',
          'Marcar C.',
          'Fixação: otológica = lateralização + tempo de permanência.',
        ],
        footer_rule: 'Oftálmica ≠ prona · nasal ≠ hiperflexão',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias tópicas pediátricas',
        meta: slideMeta,
        content: 'TÓPICAS PEDIÁTRICAS — POSIÇÃO E DESTINO',
        rows: [
          { label: 'Oftálmica', value: 'Dorsal/sentada · cabeça para trás · saco conjuntival inferior', badge: 'hot' },
          { label: 'Não no globo', value: 'Nunca aplicar diretamente na córnea', emphasis: 'alert', badge: 'warn' },
          { label: 'Otológica', value: 'Decúbito lateral · permanência no lado oposto', badge: 'ok' },
          { label: 'Nasal', value: 'Leve flexão cervical — não hiperflexão', badge: 'ok' },
          { label: 'Cooperação', value: 'Contenção gentil + explicação adaptada à idade', badge: 'info' },
        ],
        footer_rule: 'Posição + destino anatômico fecham cada via',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS IMPARH — TÓPICAS PEDIÁTRICAS',
        items: [
          {
            label: 'Letra A — oftálmica em prona',
            detail: 'Decúbito ventral com cabeça estendida para colírio.',
            correct: 'Posição inadequada: oftálmica pediátrica usa dorsal ou sentada com cabeça inclinada para trás.',
          },
          {
            label: 'Letra B — no globo ocular',
            detail: 'Aplicar solução ou pomada diretamente no globo.',
            correct: 'Contraindicado: destino correto é o saco conjuntival inferior — não a córnea.',
          },
          {
            label: 'Letra D — nasal hiperflexionada',
            detail: 'Cabeça hiperfletida para “evitar estrangulamento”.',
            correct: 'Técnica errada: via nasal pediátrica pede leve flexão — hiperflexão favorece escoamento para faringe.',
          },
          {
            label: 'Confundir otológica com oftálmica',
            detail: 'Mesma posição para todas as vias locais.',
            correct: 'Otológica exige lateralização e permanência no lado oposto — única alternativa correta é C.',
          },
        ],
        footer_rule: 'C integra posição otológica completa',
      },
    ],
  },

  'instituto-consulplan-enfermagem-vias-de-administracao-1778968646731-4': {
    family: 'conceito',
    branch: 'via_vf_absorcao',
    cluster: 'Penicilina benzatina — via de administração',
    guideline: 'COFEN/MS — penicilina benzatina (Benzetacil®): suspensão oleosa IM profunda; sífilis e febre reumática',
    roi_error: 'benzatina_via_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Benzetacil® — via de administração',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Identificar a via de administração da penicilina benzatina para sífilis e febre reumática.',
            icon: 'Target',
          },
          {
            label: 'Penicilina benzatina',
            detail: 'Antibiótico depot de ação prolongada — suspensão oleosa de liberação lenta.',
            icon: 'Syringe',
          },
          {
            label: 'Via intramuscular',
            detail: 'IM profunda no músculo — única via que comporta depot oleoso de grande volume.',
            icon: 'CheckCircle',
          },
          {
            label: 'Indicações clássicas',
            detail: 'Sífilis latente/tardia · profilaxia de febre reumática — esquemas semanais IM.',
            icon: 'Shield',
          },
          {
            label: 'Pegadinha — SC ou ID',
            detail: 'Erro reproduzível: oferecer subcutânea ou intradérmica para suspensão oleosa depot.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — intratecal',
            detail: 'Confundir antibiótico sistêmico depot com via espinal — rota completamente distinta.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Benzatina = IM profunda — nunca SC/ID/intratecal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar fármaco: penicilina benzatina — suspensão depot oleosa.',
          'Eliminar A intratecal: via espinal para anestesia/quimio — não antibiótico sistêmico depot.',
          'Eliminar B subcutânea: hipoderme não recebe suspensão oleosa de grande volume.',
          'Eliminar C intradérmica: volume mínimo na derme — perfil de teste/BCG, não benzatina.',
          'Confirmar D intramuscular: depot oleoso IM profunda — padrão para sífilis e febre reumática.',
          'Marcar D.',
          'Fixação: Benzetacil® sempre IM.',
        ],
        footer_rule: 'Depot oleoso fecha IM',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — benzatina',
        meta: slideMeta,
        content: 'PENICILINA BENZATINA — VIA',
        rows: [
          { label: 'Via', value: 'Intramuscular profunda', badge: 'hot' },
          { label: 'Formulação', value: 'Suspensão oleosa depot — liberação prolongada', badge: 'ok' },
          { label: 'Indicação', value: 'Sífilis · febre reumática', badge: 'info' },
          { label: 'Não é SC', value: 'Hipoderme não comporta depot oleoso', badge: 'warn' },
          { label: 'Não é ID', value: 'Volume e viscosidade incompatíveis com derme', badge: 'warn' },
        ],
        footer_rule: 'Decore: Benzetacil® = IM',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS CONSULPLAN — BENZATINA',
        items: [
          {
            label: 'Letra A — intratecal',
            detail: 'Via no espaço subaracnóideo.',
            correct: 'Intratecal é rota espinal — penicilina benzatina sistêmica é IM, não intratecal.',
          },
          {
            label: 'Letra B — subcutânea',
            detail: 'Aplicação no tecido subcutâneo.',
            correct: 'SC não recebe suspensão oleosa depot — absorção e volume inadequados para benzatina.',
          },
          {
            label: 'Letra C — intradérmica',
            detail: 'Injeção entre derme e epiderme.',
            correct: 'ID admite frações de mililitro — benzatina exige IM profunda com volume maior.',
          },
          {
            label: 'Confundir com penicilina cristalina',
            detail: 'Achar que toda penicilina é EV.',
            correct: 'Benzatina é depot IM — formulação e via distintas da penicilina cristalina EV.',
          },
        ],
        footer_rule: 'Só D fecha o perfil depot IM',
      },
    ],
  },

  'instituto-consulplan-enfermagem-vias-de-administracao-1778968646731-6': {
    family: 'conceito',
    branch: 'via_tecnica_admin',
    cluster: 'Volume intradérmico — faixa permitida',
    guideline: 'COFEN/Potter — via intradérmica: tecido pouco distensível; volume usual 0,1 a 0,5 ml',
    roi_error: 'id_volume_sc_im_confusao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via intradérmica — volume máximo',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Volume de medicação na via intradérmica — tecido entre derme e epiderme, pouco distensível.',
            icon: 'Target',
          },
          {
            label: 'Via intradérmica',
            detail: 'Camada rasa da pele — pápula visível (teste PPD, BCG).',
            icon: 'Layers',
          },
          {
            label: 'Volume permitido',
            detail: '0,1 a 0,5 ml — faixa clássica de prova para ID.',
            icon: 'CheckCircle',
          },
          {
            label: 'Técnica',
            detail: 'Bevel quase paralelo à pele (10°–15°) — depósito superficial.',
            icon: 'Move',
          },
          {
            label: 'Pegadinha — volume SC/IM',
            detail: 'Erro reproduzível: oferecer 1–5 ml como se coubessem na derme.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'ID = mililitros fracionados — não mililitros de IM',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Fixar via: intradérmica — tecido pouco distensível.',
          'Eliminar B 0,5–1,5 ml: limite superior já extrapola derme em muitos protocolos.',
          'Eliminar C 1–3 ml: perfil de IM em sítios pequenos, não ID.',
          'Eliminar D 3–5 ml: volume típico de IM em deltoide/vasto — impossível na derme.',
          'Confirmar A 0,1 a 0,5 ml — faixa normativa da via ID.',
          'Marcar A.',
          'Fixação: teto ID ≈ 0,5 ml — volumes maiores são SC/IM.',
        ],
        footer_rule: 'Derme não comporta mililitros inteiros',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — volumes por via',
        meta: slideMeta,
        content: 'VOLUME MÁXIMO — ID × SC × IM',
        rows: [
          { label: 'Intradérmica', value: 'Até 0,5 ml por aplicação', badge: 'hot' },
          { label: 'Subcutânea', value: 'Até ~1,5 ml por sítio (insulina/heparina)', badge: 'ok' },
          { label: 'Intramuscular', value: '1–5 ml conforme sítio e músculo', badge: 'info' },
          { label: 'PPD / BCG', value: 'Dose fracionada na derme — pápula visível', badge: 'ok' },
          { label: 'Pegadinha', value: 'Confundir faixa ID com IM', emphasis: 'alert', badge: 'warn' },
        ],
        footer_rule: 'ID = décimos de ml · IM = ml inteiros',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS CONSULPLAN — VOLUME ID',
        items: [
          {
            label: 'Letra B — 0,5 a 1,5 ml',
            detail: 'Faixa que ultrapassa o teto clássico da derme.',
            correct: 'Volume excessivo para ID — parte superior já invade perfil SC/IM pequeno.',
          },
          {
            label: 'Letra C — 1 a 3 ml',
            detail: 'Mililitros inteiros na derme.',
            correct: 'Impossível na intradérmica — faixa compatível com IM em sítios restritos.',
          },
          {
            label: 'Letra D — 3 a 5 ml',
            detail: 'Volume grande como se coubesse na pele superficial.',
            correct: 'Perfil intramuscular — derme não distende para três a cinco mililitros.',
          },
          {
            label: 'Confundir com SC',
            detail: 'Achar que hipoderme e derme têm o mesmo teto.',
            correct: 'ID é mais restritiva que SC — gabarito A (0,1–0,5 ml) é a faixa ID.',
          },
        ],
        footer_rule: 'A — única faixa compatível com derme',
      },
    ],
  },

  'instituto-consulplan-enfermagem-vias-de-administracao-1778968687469-9': {
    family: 'conceito',
    branch: 'via_vf_absorcao',
    cluster: 'Via intratecal — local anatômico',
    guideline: 'Potter/COFEN — intratecal: espaço subaracnóideo ao redor da medula espinhal; punção lombar',
    roi_error: 'confundir_via_intratecal',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via intratecal — anatomia',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Local de administração quando o medicamento segue via intratecal.',
            icon: 'Target',
          },
          {
            label: 'Via intratecal',
            detail: 'Medicação no espaço subaracnóideo — alcança líquor e medula espinhal.',
            icon: 'Brain',
          },
          {
            label: 'Sítio anatômico',
            detail: 'Espaço ao redor da medula espinhal — entre vértebras lombares.',
            icon: 'CheckCircle',
          },
          {
            label: 'Não é ocular',
            detail: 'Olhos = via oftálmica/local — sem relação com coluna vertebral.',
            icon: 'Eye',
          },
          {
            label: 'Pegadinha — transdérmica',
            detail: 'Erro reproduzível: adesivo na pele confundido com acesso ao líquor.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Intratecal = coluna · subaracnóideo · líquor',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: local da via intratecal.',
          'Eliminar A nos olhos: via oftálmica — mucosa ocular.',
          'Eliminar B sob a pele: descrição genérica de SC — não acessa medula.',
          'Eliminar C adesivo na pele: via transdérmica — absorção cutânea lenta.',
          'Confirmar D espaço ao redor da medula espinhal — definição anatômica da intratecal.',
          'Marcar D.',
          'Fixação: intratecal ≠ ocular ≠ SC ≠ transdérmica.',
        ],
        footer_rule: 'Medula espinhal = palavra-chave do gabarito',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias especiais',
        meta: slideMeta,
        content: 'INTRATECAL — LOCAL',
        rows: [
          { label: 'Destino', value: 'Espaço subaracnóideo — líquor', badge: 'hot' },
          { label: 'Anatomia', value: 'Ao redor da medula espinhal', badge: 'ok' },
          { label: 'Sítio', value: 'Punção intervertebral lombar', badge: 'info' },
          { label: '≠ Ocular', value: 'Olhos — via local superficial', badge: 'warn' },
          { label: '≠ Transdérmica', value: 'Adesivo — absorção pela pele', badge: 'warn' },
        ],
        footer_rule: 'Decore: medula espinhal + subaracnóideo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS CONSULPLAN — INTRATECAL',
        items: [
          {
            label: 'Letra A — nos olhos',
            detail: 'Administração ocular.',
            correct: 'Via oftálmica atinge mucosa do olho — intratecal é punção espinal na coluna.',
          },
          {
            label: 'Letra B — sob a pele',
            detail: 'Descrição vaga de hipoderme.',
            correct: 'Subcutânea deposita no tecido adiposo — não alcança espaço perimedular.',
          },
          {
            label: 'Letra C — adesivo na pele',
            detail: 'Sistema transdérmico de liberação lenta.',
            correct: 'Transdérmica absorve pela epiderme — sem acesso ao líquor cefalorraquidiano.',
          },
          {
            label: 'Confundir com epidural',
            detail: 'Espaço fora da dura-máter.',
            correct: 'Epidural é espaço diferente — enunciado pede intratecal (subaracnóideo/medula).',
          },
        ],
        footer_rule: 'D — espaço perimedular',
      },
    ],
  },

  'instituto-evo-enfermagem-vias-de-administracao-1776056348175-2': {
    family: 'conceito',
    branch: 'via_vf_absorcao',
    cluster: 'Identificação visual — via endovenosa',
    guideline: 'COFEN/Potter — acesso venoso periférico: cateter na veia; infusão direta na corrente sanguínea',
    roi_error: 'confundir_via_ev_visual',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via endovenosa — identificação',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Figura representando forma de administração medicamentosa — identificar a via.',
            icon: 'Target',
          },
          {
            label: 'Via intravenosa',
            detail: 'Cateter ou agulha na veia — medicamento entra direto na corrente sanguínea.',
            icon: 'CheckCircle',
          },
          {
            label: 'Sinal visual',
            detail: 'Equipamento de infusão venosa, equipo, acesso periférico ou central na veia.',
            icon: 'Activity',
          },
          {
            label: 'Velocidade',
            detail: 'Ação imediata — maior biodisponibilidade entre vias parenterais clássicas.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha — transdérmica',
            detail: 'Erro reproduzível: confundir adesivo cutâneo com punção venosa.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'EV = veia + infusão direta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Analisar figura: buscar cateter/agulha em veia ou sistema de infusão venosa.',
          'Eliminar A transdérmica: adesivo na pele — sem punção venosa.',
          'Eliminar B implantação: dispositivo subcutâneo de liberação — não acesso venoso.',
          'Eliminar D subcutâneo: depósito no tecido adiposo — ângulo e profundidade distintos.',
          'Confirmar C intravenosa: acesso venoso com infusão na corrente sanguínea.',
          'Marcar C.',
          'Fixação: figura com veia canulada = EV.',
        ],
        footer_rule: 'Veia visível na figura fecha intravenosa',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — perfis de via',
        meta: slideMeta,
        content: 'IDENTIFICAÇÃO — VIAS PARENTERAIS',
        rows: [
          { label: 'Intravenosa', value: 'Veia — ação imediata · equipo/infusão', badge: 'hot' },
          { label: 'Subcutânea', value: 'Hipoderme — agulha curta inclinada', badge: 'ok' },
          { label: 'Transdérmica', value: 'Adesivo — absorção lenta pela pele', badge: 'info' },
          { label: 'Implantação', value: 'Dispositivo SC de liberação prolongada', badge: 'info' },
          { label: 'Pegadinha', value: 'Misturar adesivo com cateter venoso', emphasis: 'alert', badge: 'warn' },
        ],
        footer_rule: 'Cateter na veia = EV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS EVO — IDENTIFICAÇÃO EV',
        items: [
          {
            label: 'Letra A — transdérmica',
            detail: 'Medicamento liberado por adesivo cutâneo.',
            correct: 'Transdérmica não usa punção venosa — figura de cateter na veia é EV.',
          },
          {
            label: 'Letra B — implantação',
            detail: 'Dispositivo inserido para liberação prolongada.',
            correct: 'Implante subcutâneo não é infusão venosa direta — gabarito é intravenosa.',
          },
          {
            label: 'Letra D — subcutâneo',
            detail: 'Depósito no tecido adiposo superficial.',
            correct: 'SC usa agulha curta na hipoderme — figura de acesso venoso indica EV.',
          },
          {
            label: 'Confundir EV com IM',
            detail: 'Qualquer seringa na figura.',
            correct: 'IM vai ao músculo sem equipo de infusão venosa — figura típica de veia = C.',
          },
        ],
        footer_rule: 'C — perfil venoso da figura',
      },
    ],
  },

  'ivin-enfermagem-vias-de-administracao-1778968877204-5': {
    family: 'conceito',
    branch: 'via_tecnica_admin',
    cluster: 'VIP poliomielite inativada — esquema de vias',
    guideline: 'PNI/MS — VIP (poliomielite inativada): doses aos 2, 4 e 6 meses por via intramuscular',
    roi_error: 'vip_oral_confusao',
    sources: [PNI_SOURCE, COFEN_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'VIP — vias no calendário vacinal',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Vacina Poliomielite 1, 2 e 3 (inativada) — vias aos 2, 4 e 6 meses respectivamente.',
            icon: 'Target',
          },
          {
            label: 'VIP inativada',
            detail: 'Vacina injetável de vírus inativado — não é VOP oral (atenuada).',
            icon: 'Syringe',
          },
          {
            label: 'Esquema PNI',
            detail: 'Três doses IM aos 2, 4 e 6 meses de idade — todas intramusculares.',
            icon: 'CheckCircle',
          },
          {
            label: 'Sítio lactente',
            detail: 'Vasto lateral da coxa — referência para IM em bebês.',
            icon: 'MapPin',
          },
          {
            label: 'Pegadinha — VOP oral',
            detail: 'Erro reproduzível: misturar VIP inativada com poliomielite oral (gotas).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'VIP = IM nas três doses — não oral',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar vacina: VIP = poliomielite INATIVADA (injetável).',
          'Lembrar: VOP oral é outra vacina — VIP não usa gotas.',
          'Eliminar A: terceira dose oral — VIP é IM em todas as doses.',
          'Eliminar C e D: esquemas com oral nas primeiras doses — perfil VOP, não VIP.',
          'Eliminar E: sequência IM-oral-oral — inverte esquema PNI da VIP.',
          'Confirmar B: intramuscular, intramuscular e intramuscular.',
          'Marcar B.',
        ],
        footer_rule: 'Inativada = IM · Oral = VOP',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — VIP × VOP',
        meta: slideMeta,
        content: 'POLIOMIELITE — VIA NO PNI',
        rows: [
          { label: 'VIP (inativada)', value: 'IM aos 2, 4 e 6 meses', badge: 'hot' },
          { label: 'Sítio lactente', value: 'Vasto lateral da coxa', badge: 'ok' },
          { label: 'VOP (oral)', value: 'Gotas VO — esquema distinto', badge: 'info' },
          { label: 'Pegadinha', value: 'Misturar VIP IM com VOP oral', emphasis: 'alert', badge: 'warn' },
          { label: 'Calendário', value: 'Três doses IM iguais — 2-4-6 meses', badge: 'hot' },
        ],
        footer_rule: 'VIP = três IM · VOP = oral',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS IVIN — VIP',
        items: [
          {
            label: 'Letra A — IM, IM, oral',
            detail: 'Terceira dose por via oral.',
            correct: 'VIP inativada mantém IM nas três doses — terceira não é oral.',
          },
          {
            label: 'Letra C — oral, oral, IM',
            detail: 'Duas primeiras doses orais.',
            correct: 'Perfil da VOP oral — VIP inativada é IM desde a primeira dose.',
          },
          {
            label: 'Letra D — oral, oral, oral',
            detail: 'Esquema totalmente oral.',
            correct: 'Descreve VOP (vacina oral poliomielite) — não a VIP inativada do enunciado.',
          },
          {
            label: 'Letra E — IM, oral, oral',
            detail: 'Primeira IM e demais orais.',
            correct: 'Sequência inexistente no PNI para VIP — todas as doses são intramusculares.',
          },
        ],
        footer_rule: 'B — IM em 2, 4 e 6 meses',
      },
    ],
  },

  'lj-assessoria-enfermagem-vias-de-administracao-1778968877204-7': {
    family: 'conceito',
    branch: 'via_tecnica_admin',
    cluster: 'Volume máximo intradérmico',
    guideline: 'COFEN/Potter — volume máximo por via intradérmica: 0,5 ml (tecido pouco distensível)',
    roi_error: 'id_volume_maximo_erro',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Volume máximo — via ID',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Volume máximo de medicamento administrável por via intradérmica.',
            icon: 'Target',
          },
          {
            label: 'Via intradérmica',
            detail: 'Camada rasa entre epiderme e derme — baixa capacidade de distensão.',
            icon: 'Layers',
          },
          {
            label: 'Teto de volume',
            detail: '0,5 ml — máximo clássico cobrado em prova para ID.',
            icon: 'CheckCircle',
          },
          {
            label: 'Referência prática',
            detail: 'PPD e BCG confirmam escala de mililitros fracionados na derme.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha — mililitros inteiros',
            detail: 'Erro reproduzível: transferir limite SC/IM para a derme — volumes além de meio mililitro não cabem na ID.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'ID = no máximo meio mililitro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Fixar via: intradérmica — tecido pouco distensível.',
          'Eliminar B um mililitro: já excede teto clássico da derme.',
          'Eliminar C um vírgula cinco mililitros: perfil SC, não ID.',
          'Eliminar D dois mililitros: volume de IM pequeno.',
          'Eliminar E cinco mililitros: claramente intramuscular.',
          'Confirmar A 0,5 ml — máximo para via intradérmica.',
          'Marcar A.',
        ],
        footer_rule: 'Meio mililitro = teto ID na banca',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — teto ID',
        meta: slideMeta,
        content: 'VOLUME MÁXIMO — INTRADÉRMICA',
        rows: [
          { label: 'Máximo ID', value: '0,5 ml', badge: 'hot' },
          { label: 'PPD / BCG', value: 'Dose fracionada na derme', badge: 'ok' },
          { label: 'Faixa ID', value: 'Até 0,5 ml por aplicação', badge: 'ok' },
          { label: 'Acima do teto', value: 'Um mililitro já excede ID — perfil SC', badge: 'warn' },
          { label: 'Volumes IM', value: 'Dois a cinco mililitros — não cabem na derme', badge: 'warn' },
        ],
        footer_rule: 'Decore: 0,5 ml = máximo ID',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS LJ — VOLUME ID',
        items: [
          {
            label: 'Letra B — um mililitro',
            detail: 'Volume de um mililitro na derme.',
            correct: 'Um mililitro ultrapassa o máximo intradérmico — teto é 0,5 ml.',
          },
          {
            label: 'Letra C — um vírgula cinco mililitros',
            detail: 'Volume intermediário.',
            correct: 'Um vírgula cinco mililitros é compatível com SC em alguns sítios — não com intradérmica.',
          },
          {
            label: 'Letra D — dois mililitros',
            detail: 'Dois mililitros.',
            correct: 'Dois mililitros é faixa de IM — impossível na camada intradérmica.',
          },
          {
            label: 'Letra E — cinco mililitros',
            detail: 'Cinco mililitros.',
            correct: 'Volume típico de IM em músculos grandes — não tem relação com ID.',
          },
          {
            label: 'Pegadinha — mililitros inteiros na derme',
            detail: 'Transferir teto SC/IM para a intradérmica.',
            correct: 'ID comporta frações até 0,5 ml — volumes de um mililitro ou mais são perfil SC/IM, não derme.',
          },
        ],
        footer_rule: 'A — 0,5 ml fecha o teto',
      },
    ],
  },

  'objetiva-concursos-enfermagem-vias-de-administracao-1776056374837-0': {
    family: 'conceito',
    branch: 'via_generico',
    cluster: 'Intratecal — cateter subaracnóideo/ventricular',
    guideline: 'Potter — via intratecal: cateter no espaço subaracnóideo ou ventrículo cerebral; tratamentos prolongados',
    roi_error: 'confundir_intratecal_epidural',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Intratecal — cateter prolongado',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Medicamentos em cavidades corporais — cateteres inseridos cirurgicamente no espaço subaracnóideo ou ventrículo do encéfalo para tratamentos a longo prazo.',
            icon: 'Target',
          },
          {
            label: 'Via intratecal',
            detail: 'Medicação no líquor — alcança SNC diretamente pelo espaço subaracnóideo.',
            icon: 'Brain',
          },
          {
            label: 'Cateter cirúrgico',
            detail: 'Inserção no subaracnóideo ou ventrículo cerebral — infusão prolongada.',
            icon: 'CheckCircle',
          },
          {
            label: 'Tratamento a longo prazo',
            detail: 'Quimioterapia intratecal · analgesia espinal crônica em cavidade do SNC.',
            icon: 'Shield',
          },
          {
            label: 'Pegadinha — epidural',
            detail: 'Erro reproduzível: confundir espaço epidural (fora da dura) com subaracnóideo.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Subaracnóideo/ventrículo = intratecal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler: cateteres inseridos cirurgicamente no espaço subaracnóideo ou ventrículo do encéfalo — tratamentos a longo prazo.',
          'Eliminar A epidural: espaço fora da dura-máter — não é subaracnóideo.',
          'Eliminar B intraperitoneal: cavidade abdominal — sem relação com encéfalo.',
          'Eliminar D intrapleural: cavidade pleural torácica — rota distinta.',
          'Confirmar C intratecal: cateter no subaracnóideo ou ventrículo para terapia prolongada.',
          'Marcar C.',
          'Fixação: subaracnóideo + ventrículo = intratecal.',
        ],
        footer_rule: 'Epidural ≠ intratecal',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias de cavidade',
        meta: slideMeta,
        content: 'VIAS ESPECIAIS — SNC E CAVIDADES',
        rows: [
          { label: 'Intratecal', value: 'Cateter no subaracnóideo ou ventrículo do encéfalo', badge: 'hot' },
          { label: 'Longo prazo', value: 'Infusão crônica em cavidade do SNC', badge: 'ok' },
          { label: 'Epidural', value: 'Fora da dura — anestesia obstétrica', badge: 'info' },
          { label: 'Intraperitoneal', value: 'Cavidade abdominal — não encéfalo', badge: 'warn' },
          { label: 'Pegadinha', value: 'Epidural × intratecal', emphasis: 'alert', badge: 'hot' },
        ],
        footer_rule: 'Subaracnóideo = intratecal',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS OBJETIVA — INTRATECAL',
        items: [
          {
            label: 'Letra A — epidural',
            detail: 'Cateter no espaço epidural.',
            correct: 'Epidural fica fora da dura-máter — enunciado pede subaracnóideo/ventrículo (intratecal).',
          },
          {
            label: 'Letra B — intraperitoneal',
            detail: 'Cavidade peritoneal.',
            correct: 'Intraperitoneal é via abdominal — não acessa líquor nem ventrículos cerebrais.',
          },
          {
            label: 'Letra D — intrapleural',
            detail: 'Espaço entre pleuras.',
            correct: 'Intrapleural trata cavidade torácica — sem cateter no SNC.',
          },
          {
            label: 'Confundir com acesso venoso central',
            detail: 'Qualquer cateter prolongado.',
            correct: 'Cateter no subaracnóideo/ventrículo define intratecal — gabarito C.',
          },
        ],
        footer_rule: 'C — única via do SNC listada',
      },
    ],
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:vias-g25] OK ${slug}`);
  }
  console.log(`[handcraft:vias-g25] total=${ok}`);
}

main();
