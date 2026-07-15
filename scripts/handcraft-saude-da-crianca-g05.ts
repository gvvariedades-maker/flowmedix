#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-crianca-g05 (8 slugs).
 *
 *   npx tsx scripts/handcraft-saude-da-crianca-g05.ts
 *   npm run validate:goldens -- --lote=saude-da-crianca-g05 --strict
 *   npm run audit:questao-readiness -- --lote=saude-da-crianca-g05 --strict-v2-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { SAUDE_CRIANCA_MS } from '@/lib/guidelines/saudeCrianca';

const LOTE = 'saude-da-crianca-g05';
const SUBTOPICO = 'Saúde da Criança';
const REVIEWED = '2026-07-15';

const MS_CADERNETA_SOURCE = {
  id: SAUDE_CRIANCA_MS.id,
  tier: 'A' as const,
  issuer: SAUDE_CRIANCA_MS.issuer,
  title: SAUDE_CRIANCA_MS.title,
  year: SAUDE_CRIANCA_MS.year,
  url: SAUDE_CRIANCA_MS.url,
  covers: [
    'intolerância lactose',
    'alergia leite',
    'desenvolvimento infantil',
    'interocepção',
    'tétano neonatal',
    'policitemia RN',
    'fototerapia icterícia',
    'teste do pezinho',
    'plaquetas pediátricas',
    'convulsões neonatais',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[] };
  modulo_slug?: string;
};

type Branch =
  | 'crianca_generico'
  | 'crianca_dor'
  | 'crianca_vacinacao'
  | 'crianca_desidratacao'
  | 'crianca_neonatologia'
  | 'crianca_triagem_neonatal';

type Pack = {
  family: 'conceito' | 'vf' | 'certo_errado' | 'protocolo';
  branch: Branch;
  guideline: string;
  sources?: (typeof MS_CADERNETA_SOURCE)[];
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
    pedagogical_branch: pack.branch,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
    },
    sources: pack.sources ?? [MS_CADERNETA_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

const SPECS: Record<string, Pack> = {
  'idecan-enfermagem-saude-da-crianca-1778712426701-3': {
    family: 'conceito',
    branch: 'crianca_generico',
    guideline: 'Intolerância à lactose × alergia ao leite — mecanismos distintos (MS/OMS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lactose × alergia ao leite',
        meta: slideMeta,
        items: [
          { label: 'Intolerância', detail: 'Deficiência de lactase — dificuldade em digerir lactose (açúcar).', icon: 'Droplets' },
          { label: 'Alergia', detail: 'Reação imunológica às proteínas do leite — IgE ou não IgE.', icon: 'Shield' },
          { label: 'Gatilho alérgico', detail: 'Pequena porção de leite ou derivado pode desencadear manifestação.', icon: 'AlertTriangle' },
          { label: 'Pegadinha enzimática', detail: 'Lactase degrada lactose — não a impede de absorver.', icon: 'XCircle' },
        ],
        footer_rule: 'Lactose = enzima · Alergia = proteína + imunidade',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: item correto sobre intolerância à lactose e alergia ao leite.',
          'Eliminar B: lactase impossibilita decomposição — enzima facilita, não bloqueia.',
          'Eliminar C: peristalse no estômago não trata intolerância à lactose.',
          'Eliminar D: deficiência de lactase não é “prevenção do envelhecimento” com dados raciais invertidos.',
          'Testar A: alergia = reação imunológica às proteínas — manifesta mesmo com porção mínima.',
          'Marcar letra A.',
          'Fixação: alergia imunológica ≠ intolerância enzimática.',
        ],
        footer_rule: 'A = alergia imunológica às proteínas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Lactose × alergia — referência',
        meta: slideMeta,
        content: 'NUTRIÇÃO INFANTIL',
        rows: [
          { label: 'Intolerância', value: 'Deficiência/ausência de lactase — má digestão da lactose', badge: 'ok' },
          { label: 'Alergia', value: 'Reação imunológica às proteínas do leite', badge: 'hot', emphasis: 'highlight' },
          { label: 'Dose alérgica', value: 'Pode manifestar com porção mínima de leite/derivados', badge: 'warn' },
          { label: 'Lactase', value: 'Hidrolisa lactose em glicose + galactose', badge: 'info' },
        ],
        footer_rule: 'Não confundir enzima com imunidade',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LACTOSE × ALERGIA',
        items: [
          {
            label: 'Letra B — lactase impossibilita decomposição',
            detail: 'Inverte a função enzimática da lactase.',
            correct: 'Lactase decompõe lactose em monossacarídeos — facilita absorção.',
          },
          {
            label: 'Letra C — peristalse melhora intolerância',
            detail: 'Mistura motilidade gástrica com deficiência enzimática.',
            correct: 'Intolerância depende de lactase — não de peristalse estomacal.',
          },
          {
            label: 'Letra D — prevenção do envelhecimento e raças',
            detail: 'Dados epidemiológicos invertidos e mecanismo incorreto.',
            correct: 'Deficiência de lactase é genética/idade — não “prevenção” com prevalência trocada.',
          },
        ],
        footer_rule: 'Alergia = proteína + imune',
      },
    ],
  },

  'idecan-enfermagem-saude-da-crianca-1778712426701-4': {
    family: 'conceito',
    branch: 'crianca_dor',
    guideline: 'Primeira infância — interocepção e ambiente facilitador (Caderneta MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Primeira infância — interocepção',
        meta: slideMeta,
        items: [
          { label: 'Ambiente', detail: 'Cuidar e educar exige ambiente facilitador e vínculo afetivo.', icon: 'Home' },
          { label: 'Interocepção', detail: 'Sensações corporais comunicam fome, sede, cansaço, necessidade de banheiro.', icon: 'Heart' },
          { label: 'Desenvolvimento', detail: 'Crescimento + maturação neurológica + interações ambientais.', icon: 'Brain' },
          { label: 'Pegadinha', detail: 'Ambiente inflexível ou independência precoce sem mediação do adulto.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Interocepção = linguagem corporal do bem-estar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta sobre cuidar/educar na primeira infância.',
          'Eliminar B: ambiente dificulta desenvolvimento — interações facilitam habilidades.',
          'Eliminar C: organização inflexível limita exploração motora e criativa.',
          'Eliminar D: bebê independente antes de imitar — processo é gradual com mediação.',
          'Testar A: sensações corporais (fome, banheiro, descanso) pedem pausa na atividade.',
          'Marcar letra A.',
          'Fixação: interocepção orienta autocuidado mediado pelo adulto.',
        ],
        footer_rule: 'A = interocepção e necessidades fisiológicas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Desenvolvimento na primeira infância',
        meta: slideMeta,
        content: 'CUIDAR E EDUCAR',
        rows: [
          { label: 'Interocepção', value: 'Sensações internas guiam pausas e autocuidado', badge: 'hot', emphasis: 'highlight' },
          { label: 'Ambiente', value: 'Flexível, seguro e estimulante — não rígido', badge: 'ok' },
          { label: 'Imitação', value: 'Bebê observa o adulto antes de reproduzir condutas', badge: 'info' },
          { label: 'Autonomia', value: 'Emerge com suporte — não independência abrupta', badge: 'warn' },
        ],
        footer_rule: 'Corpo fala — adulto acolhe e media',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRIMEIRA INFÂNCIA',
        items: [
          {
            label: 'Letra B — ambiente dificulta desenvolvimento',
            detail: 'Nega papel das interações na aquisição de habilidades.',
            correct: 'Interações e oportunidades ambientais facilitam — não dificultam — o desenvolvimento.',
          },
          {
            label: 'Letra C — ambiente inflexível',
            detail: 'Rigidez limita exploração motora e brincadeira.',
            correct: 'Ambiente adaptável permite dançar, pedalar e construir — não inflexível.',
          },
          {
            label: 'Letra D — independência antes da imitação',
            detail: 'Inverte sequência do aprendizado social.',
            correct: 'Bebê imita e cria formas de agir após observar o adulto — não independência prévia.',
          },
        ],
        footer_rule: 'Vínculo + ambiente + interocepção',
      },
    ],
  },

  'idecan-enfermagem-saude-da-crianca-1778712426701-5': {
    family: 'certo_errado',
    branch: 'crianca_vacinacao',
    guideline: 'Tétano neonatal — prevenção por assepsia do parto e vacinação da gestante (PNI/MS)',
    exam_vs_current: 'Prova afirma vacinar RN nos primeiros dias — MS previne com assepsia + dTpa gestante, não vacina tetânica no RN.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tétano neonatal — prevenção',
        meta: slideMeta,
        items: [
          { label: 'Agente', detail: 'Clostridium tetani — porta de entrada umbilical em condições não assépticas.', icon: 'Bug' },
          { label: 'Assepsia', detail: 'Corte estéril do cordão + material limpo no parto — pilar da prevenção.', icon: 'Shield' },
          { label: 'Gestante', detail: 'Esquema vacinal adequado (dT/dTpa) transmite anticorpos ao RN.', icon: 'Syringe' },
          { label: 'Pegadinha', detail: 'Vacinar o RN contra tétano nos primeiros dias — não é conduta do calendário.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Prevenir tétano neonatal: parto limpo + mãe vacinada',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Item C/E: tétano neonatal evitado por assepsia no parto e vacinação do RN nos primeiros dias.',
          'Assepsia do parto e cuidados umbilicais estéreis são medidas fundamentais — verdadeiro.',
          'Vacinação preventiva é da gestante (dT/dTpa) — não do recém-nascido contra tétano.',
          'Calendário infantil não inclui vacina antitetânica para o RN nos primeiros dias.',
          'A afirmativa mistura verdade (assepsia) com erro (vacinar RN).',
          'Marcar Errado (letra B).',
          'Fixação: prevenção = parto asséptico + gestante imunizada.',
        ],
        footer_rule: 'Errado — não vacinar RN contra tétano',
      },
      {
        type: 'golden_rule',
        slide_title: 'Prevenção do tétano neonatal',
        meta: slideMeta,
        content: 'TÉTANO NEONATAL',
        rows: [
          { label: 'Parto', value: 'Assepsia rigorosa — corte estéril do cordão', badge: 'hot', emphasis: 'highlight' },
          { label: 'Gestante', value: 'Vacinação dT/dTpa conforme PNI', badge: 'ok' },
          { label: 'RN', value: 'Não recebe vacina antitetânica de rotina ao nascer', badge: 'warn' },
          { label: 'Cuidado umbilical', value: 'Material limpo e técnica asséptica', badge: 'info' },
        ],
        footer_rule: 'Mãe vacinada + parto limpo — não vacina no RN',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — C/E TÉTANO NEONATAL',
        items: [
          {
            label: 'Marcar Certo',
            detail: 'Aceita vacinação do RN nos primeiros dias como prevenção.',
            correct: 'Prevenção é assepsia do parto + vacinação da gestante — não vacinar RN contra tétano.',
          },
          {
            label: 'Confundir calendário do RN',
            detail: 'Mistura BCG/HB com antitetânica neonatal.',
            correct: 'Calendário do RN não prevê vacina antitetânica nos primeiros dias de vida.',
          },
        ],
        footer_rule: 'Assepsia sim · vacina no RN não',
      },
    ],
  },

  'idecan-enfermagem-saude-da-crianca-1780067024707-3': {
    family: 'conceito',
    branch: 'crianca_desidratacao',
    guideline: 'RN de mãe diabética — policitemia e hiperviscosidade (SBP/MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Policitemia no RN — DMG',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Filho de mãe com diabetes gestacional — hiperglicemia fetal → eritropoiese.', icon: 'Activity' },
          { label: 'Policitemia', detail: 'Hematócrito elevado → hiperviscosidade sanguínea.', icon: 'Droplets' },
          { label: 'Sinais', detail: 'Cianose, taquipneia, tremores, oligúria — perfusão comprometida.', icon: 'AlertTriangle' },
          { label: 'Pegadinha', detail: 'Bradipneia, pele rósea ou poliúria — não combinam com hiperviscosidade.', icon: 'XCircle' },
        ],
        footer_rule: 'Policitemia → cianose + taquipneia + oligúria',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sintomas de policitemia e hiperviscosidade no RN de mãe diabética.',
          'Eliminar A: bradipneia, pele rósea e poliúria — perfil oposto.',
          'Eliminar B: cianose com hipertensão e bradipneia — mistura sinais.',
          'Eliminar D: convulsões, priapismo e secreção sanguinolenta — outro espectro.',
          'Testar C: cianose, taquipneia, tremores e oligúria.',
          'Marcar letra C.',
          'Fixação: hiperviscosidade → hipóxia + baixo débito urinário.',
        ],
        footer_rule: 'C = cianose + taquipneia + tremores + oligúria',
      },
      {
        type: 'golden_rule',
        slide_title: 'Policitemia neonatal',
        meta: slideMeta,
        content: 'RN DE MÃE DIABÉTICA',
        rows: [
          { label: 'Mecanismo', value: 'Hiperglicemia fetal → policitemia → hiperviscosidade', badge: 'ok' },
          { label: 'Cianose', value: 'Perfusão periférica comprometida', badge: 'hot' },
          { label: 'Taquipneia', value: 'Compensação respiratória', badge: 'ok' },
          { label: 'Oligúria', value: 'Débito urinário reduzido', badge: 'warn', emphasis: 'highlight' },
        ],
        footer_rule: 'Monitorar glicemia, hematócrito e perfusão',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — POLICITEMIA',
        items: [
          {
            label: 'Letra A — bradipneia e poliúria',
            detail: 'Bradipneia e poliúria não indicam hiperviscosidade.',
            correct: 'Policitemia cursa com taquipneia e oligúria — não bradipneia/poliúria.',
          },
          {
            label: 'Letra B — hipertensão e bradipneia',
            detail: 'Combinação atípica para policitemia neonatal.',
            correct: 'Esperado: cianose, taquipneia, tremores e oligúria — gabarito C.',
          },
          {
            label: 'Letra D — priapismo e secreção sanguinolenta',
            detail: 'Sinais não característicos de hiperviscosidade por policitemia.',
            correct: 'Quadro clássico: cianose + taquipneia + tremores + oligúria.',
          },
        ],
        footer_rule: 'Hiperviscosidade ≠ poliúria',
      },
    ],
  },

  'idecan-enfermagem-saude-da-crianca-1780067024707-4': {
    family: 'conceito',
    branch: 'crianca_neonatologia',
    guideline: 'Fototerapia na icterícia neonatal — cuidados de enfermagem (MS/SBP)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Fototerapia — cuidados de enfermagem',
        meta: slideMeta,
        items: [
          { label: 'Icterícia', detail: 'Comum no RN — hiperbilirrubinemia indireta.', icon: 'Sun' },
          { label: 'Fototerapia', detail: 'Converte bilirrubina em isômeros excretáveis — monitorar resposta.', icon: 'Lightbulb' },
          { label: 'Cuidados', detail: 'Protetor ocular, temperatura, peso diário, bilirrubina seriada.', icon: 'Eye' },
          { label: 'EXCETO', detail: 'Dosar bilirrubina só na alta — abandona monitorização durante tratamento.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Fototerapia exige bilirrubina seriada — não só na alta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando EXCETO: cuidados de enfermagem em RN em fototerapia.',
          'A — pesar uma vez ao dia: cuidado válido (perdas insensíveis).',
          'B — controlar temperatura: cuidado válido (fototerapia aquece).',
          'C — protetores oculares: cuidado válido (proteção retiniana).',
          'D — dosar bilirrubina somente na alta: NÃO é conduta — exige dosagem seriada.',
          'Marcar letra D (EXCETO).',
          'Fixação: monitorar bilirrubina durante fototerapia.',
        ],
        footer_rule: 'EXCETO D — bilirrubina seriada, não só na alta',
      },
      {
        type: 'golden_rule',
        slide_title: 'Fototerapia — enfermagem',
        meta: slideMeta,
        content: 'ICTERÍCIA NEONATAL',
        rows: [
          { label: 'Protetor ocular', value: 'Obrigatório durante exposição à luz', badge: 'ok' },
          { label: 'Temperatura', value: 'Monitorar — risco de hipertermia', badge: 'ok' },
          { label: 'Peso', value: 'Diário — avaliar hidratação', badge: 'info' },
          { label: 'Bilirrubina', value: 'Dosagem seriada — não apenas na alta', badge: 'hot', emphasis: 'highlight' },
        ],
        footer_rule: 'Luz + olhos protegidos + bilirrubina controlada',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO FOTOTERAPIA',
        items: [
          {
            label: 'Letra A — pesar uma vez ao dia',
            detail: 'Pesagem diária é cuidado adequado em fototerapia.',
            correct: 'Monitorar peso diário é conduta correta — não é o EXCETO.',
          },
          {
            label: 'Letra B — controlar temperatura',
            detail: 'Fototerapia aumenta risco de desidratação e hipertermia.',
            correct: 'Controle térmico é cuidado essencial — alternativa correta.',
          },
          {
            label: 'Letra C — protetores oculares',
            detail: 'Proteção retiniana é obrigatória.',
            correct: 'Protetor ocular é conduta padrão — não marca o EXCETO.',
          },
        ],
        footer_rule: 'A–C são cuidados; D omite monitorização',
      },
    ],
  },

  'idecan-enfermagem-saude-da-crianca-1780067024707-5': {
    family: 'conceito',
    branch: 'crianca_triagem_neonatal',
    guideline: 'Teste do Pezinho — coleta preferencial 3º ao 5º dia (MS/PNTN)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Teste do Pezinho — momento',
        meta: slideMeta,
        items: [
          { label: 'Triagem', detail: 'Doenças genéticas, metabólicas e endócrinas no RN.', icon: 'Activity' },
          { label: 'Coleta', detail: 'Gotas de sangue no calcanhar — papel filtro.', icon: 'Syringe' },
          { label: 'Janela MS', detail: 'Preferencialmente do 3º ao 5º dia de vida.', icon: 'Calendar' },
          { label: 'Pegadinha', detail: '1º dia (falso +) ou adiar além da 1ª semana.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Pezinho: 3º–5º dia na 1ª semana',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: momento preferencial do teste do pezinho (MS).',
          'Eliminar A: 1º dia — risco de falso positivo, alimentação insuficiente.',
          'Eliminar C: 10º–15º dia — fora da janela ideal precoce.',
          'Eliminar D: 20º–30º dia — atraso prejudica detecção.',
          'Testar B: do 3º ao 5º dia de vida.',
          'Marcar letra B.',
          'Fixação: 1ª semana · preferência 3º–5º dia.',
        ],
        footer_rule: 'B = 3º ao 5º dia',
      },
      {
        type: 'golden_rule',
        slide_title: 'Pezinho — calendário MS',
        meta: slideMeta,
        content: 'TRIAGEM NEONATAL',
        rows: [
          { label: 'Momento ideal', value: '3º ao 5º dia de vida', badge: 'hot', emphasis: 'highlight' },
          { label: '1º dia', value: 'Evitar — falso positivo possível', badge: 'warn' },
          { label: 'Local', value: 'Calcanhar lateral', badge: 'ok' },
          { label: 'Atraso', value: 'Reduz sensibilidade da triagem', badge: 'info' },
        ],
        footer_rule: 'Não adiar além da 1ª semana',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MOMENTO DO PEZINHO',
        items: [
          {
            label: 'Letra A — 1º dia de vida',
            detail: 'Coleta muito precoce pode gerar falso positivo.',
            correct: 'MS recomenda 3º–5º dia — não o 1º dia como preferencial.',
          },
          {
            label: 'Letra C — 10º ao 15º dia',
            detail: 'Posterga triagem além da janela ideal.',
            correct: 'Preferência é 3º–5º dia — não segunda semana.',
          },
          {
            label: 'Letra D — 20º ao 30º dia',
            detail: 'Atraso significativo na detecção.',
            correct: 'Triagem precoce na 1ª semana — gabarito B.',
          },
        ],
        footer_rule: 'Janela precoce = melhor desfecho',
      },
    ],
  },

  'idib-enfermagem-nocoes-de-fisiologia-1778934944659-9': {
    family: 'conceito',
    branch: 'crianca_generico',
    guideline: 'Transfusão profilática de plaquetas — limiar <10.000/mm³ (protocolo hemato pediátrico)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Plaquetas — transfusão profilática',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Criança >4 meses, plaquetas 25.000/mm³, falha de produção.', icon: 'Activity' },
          { label: 'Profilaxia', detail: 'Prevenir sangramento espontâneo em trombocitopenia grave.', icon: 'Shield' },
          { label: 'Limiar clássico', detail: 'Transfusão profilática se <10.000/mm³ na maioria dos cenários.', icon: 'Target' },
          { label: 'Pegadinha', detail: 'Manter ≥30.000, ≥50.000 ou ≥100.000 sem indicação clínica.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Profilaxia: geralmente <10.000/mm³',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: indicação correta de transfusão profilática de plaquetas.',
          'Eliminar A: manter ≥100.000/mm³ — limiar excessivo para profilaxia.',
          'Eliminar C: manter ≥50.000/mm³ — indicação para procedimentos, não profilaxia rotineira.',
          'Eliminar D: manter ≥30.000/mm³ — acima do limiar profilático usual.',
          'Testar B: profilaxia se plaquetas <10.000/mm³.',
          'Marcar letra B.',
          'Fixação: <10.000 = risco de sangramento espontâneo.',
        ],
        footer_rule: 'B = profilaxia se <10.000/mm³',
      },
      {
        type: 'golden_rule',
        slide_title: 'Transfusão de plaquetas',
        meta: slideMeta,
        content: 'TROMBOCITOPENIA PEDIÁTRICA',
        rows: [
          { label: 'Profilática', value: 'Geralmente < 10.000/mm³', badge: 'hot', emphasis: 'highlight' },
          { label: 'Procedimentos', value: '≥50.000/mm³ conforme invasividade', badge: 'info' },
          { label: 'Cirurgia maior', value: 'Metas mais altas — caso a caso', badge: 'ok' },
          { label: 'Caso', value: '25.000/mm³ — ainda não atinge limiar profilático', badge: 'warn' },
        ],
        footer_rule: 'Decore limiares: 10k profilaxia · 50k procedimento',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PLAQUETAS',
        items: [
          {
            label: 'Letra A — manter ≥100.000/mm³',
            detail: 'Limiar muito alto para profilaxia rotineira.',
            correct: 'Profilaxia indicada com <10.000/mm³ — não manter 100.000.',
          },
          {
            label: 'Letra C — manter ≥50.000/mm³',
            detail: 'Meta para procedimentos invasivos, não profilaxia universal.',
            correct: '50.000/mm³ é para cirurgia/procedimento — profilaxia usa <10.000.',
          },
          {
            label: 'Letra D — manter ≥30.000/mm³',
            detail: 'Ainda acima do limiar profilático clássico.',
            correct: 'Transfusão profilática: plaquetas <10.000/mm³ — gabarito B.',
          },
        ],
        footer_rule: 'Não transfundir “por rotina” com 25.000',
      },
    ],
  },

  'idib-enfermagem-nocoes-de-fisiologia-1778934965770-5': {
    family: 'conceito',
    branch: 'crianca_generico',
    guideline: 'Convulsões neonatais — etiologias e padrões clínicos (neonatologia)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Convulsões neonatais — etiologia',
        meta: slideMeta,
        items: [
          { label: 'Frequência', detail: 'Manifestação neurológica comum no período neonatal.', icon: 'Zap' },
          { label: 'Metabólicas', detail: 'Hipoglicemia e distúrbios eletrolíticos — causas importantes.', icon: 'Activity' },
          { label: 'HIE', detail: 'Encefalopatia hipóxico-isquêmica — causa frequente precoce.', icon: 'Brain' },
          { label: 'Lesões locais', detail: 'Convulsões focais ↔ infarto/hemorragia intracerebral.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Focal clássica → lesão anatômica local',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: etiologia correta das convulsões neonatais.',
          'Eliminar A: hiperbilirrubinemia raramente associada — kernicterus pode convulsionar.',
          'Eliminar B: distúrbios metabólicos não são causa — são causas frequentes.',
          'Eliminar C: HIE é causa rara após 24 h — é causa comum nas primeiras horas.',
          'Testar D: convulsões focais associadas a lesões anatômicas locais (infarto/hemorragia).',
          'Marcar letra D.',
          'Fixação: padrão focal → lesão estrutural unilateral.',
        ],
        footer_rule: 'D = focal + lesão anatômica local',
      },
      {
        type: 'golden_rule',
        slide_title: 'Etiologias neonatais',
        meta: slideMeta,
        content: 'CONVULSÕES NO RN',
        rows: [
          { label: 'Focal + lesão local', value: 'Infarto/hemorragia intracerebral unilateral', badge: 'hot', emphasis: 'highlight' },
          { label: 'HIE', value: 'Causa comum nas primeiras horas de vida', badge: 'ok' },
          { label: 'Metabólicas', value: 'Hipoglicemia, hipocalcemia, hipomagnesemia', badge: 'ok' },
          { label: 'Kernicterus', value: 'Hiperbilirrubinemia grave pode convulsionar', badge: 'warn' },
        ],
        footer_rule: 'Investigar causa estrutural, metabólica e hipóxico-isquêmica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ETIOLOGIA NEONATAL',
        items: [
          {
            label: 'Letra A — hiperbilirrubinemia rara',
            detail: 'Minimiza kernicterus como causa de convulsão.',
            correct: 'Kernicterus por hiperbilirrubinemia grave pode causar convulsões neonatais.',
          },
          {
            label: 'Letra B — metabólicas não são causa',
            detail: 'Nega hipoglicemia e distúrbios eletrolíticos.',
            correct: 'Distúrbios metabólicos são causas importantes e frequentes no RN.',
          },
          {
            label: 'Letra C — HIE rara após 24 h',
            detail: 'Inverte temporalidade e frequência da HIE.',
            correct: 'HIE é causa comum precoce — não rara nas primeiras horas.',
          },
        ],
        footer_rule: 'Focal = pensar em lesão estrutural',
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
    console.log(`[handcraft:sc-g05] OK ${slug}`);
  }
  console.log(`[handcraft:sc-g05] total=${ok}`);
}

main();
