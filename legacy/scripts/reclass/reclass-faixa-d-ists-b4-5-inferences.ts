#!/usr/bin/env tsx
/**
 * Onda 7 — ISTs (faixa D), lotes 04–05.
 * Classificação agente por leitura de enunciado → batch-XX-inferred.json
 *
 *   npx tsx scripts/reclass-faixa-d-ists-b4-5-inferences.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const IST = 'Infecções Sexualmente Transmissíveis (ISTs)';
const OUT = 'artifacts/reclass/faixa-d/ists';
const PE = 'Processo de Enfermagem';
const PROMO = 'Promoção à Saúde e Prevenção de Agravos';
const BIOS = 'Infecções no Contexto da Biossegurança';
const PREC = 'Medidas de Prevenção e Precaução de Contato';
const EPID = 'Epidemiologia e Vigilância Epidemiológica';
const MED = 'Cuidados na Administração de Medicamentos';
const VIRAL =
  'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';
const BACT = 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)';
const DT_MESCL =
  'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis';
const APS = 'Atenção Básica / Saúde da Família';
const AUDIT = 'Segurança do Paciente';
const SC = 'Saúde da Criança';
const SM = 'Saúde da Mulher';
const SM_MENTAL = 'Saúde Mental';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const TRAB = 'Enfermagem do Trabalho';
const ANAT = 'Noções de Anatomia';
const MOB = 'Mobilização e Posicionamento do Paciente';
const PROC = 'Procedimentos Diversos';
const IMUN = 'Imunização';
const FERIDAS = 'Feridas e Queimaduras';

/** Overrides pós-leitura clínica (slug → [subtópico, rationale, confidence]) */
const MANUAL = new Map<string, [string, string, number]>([
  [
    'igeduc-enfermagem-processo-de-enfermagem-1780011879977-0',
    [BIOS, 'Higiene de mãos e prevenção de IRAS (ANVISA/OMS).', 0.96],
  ],
  [
    'igeduc-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563909811-2',
    [PROMO, 'Modelo biomédico curativo versus promoção da saúde.', 0.94],
  ],
  [
    'igeduc-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563909811-4',
    [PROMO, 'Promoção comunitária e uso de preservativos — conceito preventivo.', 0.91],
  ],
  [
    'inaz-do-para-enfermagem-processo-de-enfermagem-1780011947286-4',
    [PE, 'Fundamentos éticos e científicos do cuidado de enfermagem.', 0.93],
  ],
  [
    'inaz-do-para-enfermagem-processo-de-enfermagem-1780011947286-5',
    [PE, 'Processo de enfermagem, SAE e registros (Wanda Horta).', 0.95],
  ],
  [
    'inaz-do-para-enfermagem-processo-de-enfermagem-1780011947286-7',
    [BIOS, 'Prevenção de IRAS associada a cateter vesical de demora.', 0.96],
  ],
  [
    'instituto-aocp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563848614-0',
    [EPID, 'Notificação compulsória em 24 h — vigilância epidemiológica.', 0.95],
  ],
  [
    'instituto-consulpam-enfermagem-processo-de-enfermagem-1780006480333-9',
    [MED, 'Prescrição sem assinatura e execução segura de medicamentos.', 0.94],
  ],
  [
    'instituto-consulplan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563814158-0',
    [VIRAL, 'Monkeypox (Mpox) — vigilância de zoonose viral emergente.', 0.93],
  ],
  [
    'instituto-consulplan-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-9',
    [DT_MESCL, 'Doenças negligenciadas — HIV, TB, hanseníase e malária.', 0.92],
  ],
  [
    'instituto-darwin-enfermagem-processo-de-enfermagem-1776056140199-1',
    [PE, 'Anotação de enfermagem e registro assistencial.', 0.95],
  ],
  [
    'instituto-iacp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563961175-0',
    [PROMO, 'Saneamento básico e abastecimento de água.', 0.93],
  ],
  [
    'instituto-verbena-enfermagem-atencao-basica-saude-da-familia-1778968194611-2',
    [APS, 'Atenção domiciliar integrada à rede de atenção.', 0.94],
  ],
  [
    'instituto-verbena-enfermagem-processo-de-enfermagem-1776056140199-6',
    [PE, 'Etapas e documentação do processo de enfermagem.', 0.95],
  ],
  [
    'instituto-verbena-enfermagem-processo-de-enfermagem-1780008197597-3',
    [AUDIT, 'Admissão com foco em segurança e humanização do cuidado.', 0.92],
  ],
  [
    'instituto-verbena-enfermagem-processo-de-enfermagem-1780008197597-8',
    [SC, 'Assistência ao recém-nascido no período neonatal imediato.', 0.95],
  ],
  [
    'instituto-verbena-enfermagem-processo-de-enfermagem-1780009310940-0',
    [SM, 'Rastreamento citopatológico do colo uterino (Papanicolau).', 0.96],
  ],
  [
    'instituto-verbena-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-5',
    [PROMO, 'Educação permanente em saúde (EPS) no trabalho.', 0.94],
  ],
  [
    'legalle-enfermagem-processo-de-enfermagem-1780010579953-9',
    [VIRAL, 'Quadros respiratórios agudos virais na atenção básica.', 0.92],
  ],
  [
    'legalle-enfermagem-processo-de-enfermagem-1780010585356-0',
    [SM_MENTAL, 'Insônia e transtornos do sono na atenção primária.', 0.94],
  ],
  [
    'legalle-enfermagem-processo-de-enfermagem-1780010585356-4',
    [VIRAL, 'Varicela — infecção viral aguda e altamente contagiosa.', 0.95],
  ],
  [
    'legalle-enfermagem-processo-de-enfermagem-1780010911471-3',
    [DCNT, 'Doença de Parkinson — condição neurológica crônica.', 0.96],
  ],
  [
    'legalle-enfermagem-processo-de-enfermagem-1780011879977-8',
    [TRAB, 'Doenças do trabalho e fatores de risco ocupacional.', 0.95],
  ],
  [
    'legalle-enfermagem-processo-de-enfermagem-1780011887822-1',
    [ANAT, 'Anatomia e camadas do tubo digestório.', 0.94],
  ],
  [
    'legalle-enfermagem-processo-de-enfermagem-1780011887822-4',
    [VIRAL, 'Febre amarela — doença viral aguda de notificação.', 0.95],
  ],
  [
    'metrocapital-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-5',
    [BACT, 'Estratégia pelo fim da tuberculose — prevenção e cuidado.', 0.94],
  ],
  [
    'ms-sarmento-enfermagem-processo-de-enfermagem-1776056021381-2',
    [PE, 'Passagem de plantão e continuidade da assistência.', 0.94],
  ],
  [
    'ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-8',
    [DCNT, 'Diabetes mellitus tipo 1 versus tipo 2.', 0.95],
  ],
  [
    'objetiva-concursos-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563843512-8',
    [IMUN, 'Erradicação da varíola por campanha vacinal global.', 0.94],
  ],
  [
    'objetiva-concursos-enfermagem-nutricao-aplicada-a-enfermagem-1777102879099-1',
    [PROC, 'Avaliação do estado nutricional na assistência.', 0.91],
  ],
  [
    'quadrix-enfermagem-processo-de-enfermagem-1780009281546-2',
    [MOB, 'Prevenção e classificação de lesões por pressão (LPP).', 0.95],
  ],
  [
    'quadrix-enfermagem-processo-de-enfermagem-1780009281546-3',
    [MOB, 'Prevenção e classificação de lesões por pressão (LPP).', 0.95],
  ],
  [
    'quadrix-enfermagem-processo-de-enfermagem-1780009281546-4',
    [MOB, 'Prevenção e classificação de lesões por pressão (LPP).', 0.95],
  ],
  [
    'quadrix-enfermagem-processo-de-enfermagem-1780009281546-5',
    [MOB, 'Prevenção e classificação de lesões por pressão (LPP).', 0.95],
  ],
  [
    'selecon-enfermagem-atencao-basica-saude-da-familia-1778968207422-2',
    [APS, 'Acolhimento e escuta qualificada na atenção básica.', 0.94],
  ],
  [
    'selecon-enfermagem-processo-de-enfermagem-1780009310940-2',
    [PE, 'Passagem de plantão e continuidade do cuidado.', 0.93],
  ],
  [
    'selecon-enfermagem-processo-de-enfermagem-1780009322055-3',
    [DCNT, 'Diabetes mellitus — mecanismo da insulina e glicose.', 0.94],
  ],
  [
    'selecon-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1776581030438-0',
    [VIRAL, 'Dengue — quadro febril agudo sistêmico (arbovirose).', 0.96],
  ],
  [
    'ufmt-enfermagem-processo-de-enfermagem-1776055865890-1',
    [PE, 'Registro de enfermagem e aspectos legais.', 0.94],
  ],
  [
    'ufmt-enfermagem-processo-de-enfermagem-1776056021381-5',
    [PE, 'Anotações de enfermagem — regras e responsabilidades.', 0.95],
  ],
  [
    'unifil-enfermagem-processo-de-enfermagem-1780003645544-0',
    [BIOS, 'Cinco momentos OMS para higiene das mãos e IRAS.', 0.96],
  ],
  [
    'unifil-enfermagem-processo-de-enfermagem-1780003645544-1',
    [BIOS, 'Conceito de infecções relacionadas à assistência à saúde.', 0.95],
  ],
  [
    'unifil-enfermagem-processo-de-enfermagem-1780004452857-7',
    [PE, 'Admissão e sistematização da assistência de enfermagem.', 0.93],
  ],
  [
    'unifil-enfermagem-processo-de-enfermagem-1780004452857-9',
    [SM, 'Política Nacional de Atenção Integral à Saúde da Mulher.', 0.95],
  ],
  [
    'univali-enfermagem-processo-de-enfermagem-1780010594524-8',
    [DCNT, 'Diabetes mellitus — educação e monitoramento na UBS.', 0.94],
  ],
  [
    'univali-enfermagem-processo-de-enfermagem-1780010905023-0',
    [PE, 'Comunicação terapêutica e vínculo com o paciente.', 0.92],
  ],
  [
    'univali-enfermagem-processo-de-enfermagem-1780010905023-2',
    [TRAB, 'Saúde do trabalhador e notificação de acidentes.', 0.95],
  ],
  [
    'vunesp-enfermagem-atencao-basica-saude-da-familia-1778968180610-7',
    [APS, 'Programa Melhor em Casa (PMeC) na atenção básica.', 0.94],
  ],
  [
    'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563818401-1',
    [VIRAL, 'EPI e proteção na linha de frente da Covid-19.', 0.93],
  ],
  [
    'vunesp-enfermagem-processo-de-enfermagem-1780001742844-1',
    [FERIDAS, 'Primeiros socorros em queimadura de segundo grau.', 0.94],
  ],
  [
    'vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-7',
    [PROMO, 'Saneamento ambiental e salubridade (conceito ONU).', 0.93],
  ],
  [
    'vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-3',
    [SM, 'Planejamento familiar e métodos contraceptivos.', 0.94],
  ],
]);

const IST_CORE =
  /\bprep\b|\bpep\b|profilaxia (pré|pre|pós|pos)-exposição|hiv\b|aids\b|dst\b|\bist\b|sífilis|sifilis|gonorreia|clamídia|clamidia|hpv\b|herpes genital|treponema|condiloma|tricomoníase|linfogranuloma|infecções sexualmente transmissíveis|infeccoes sexualmente transmissiveis|doenças sexualmente transmissíveis|preservativo|camisinha|testagem.*hiv|centros de testagem|\bcta\b|hepatite [abcde]\b|\bhbv\b|\bhcv\b|programa nacional de dst/i;

function shortRationale(instruction: string): string {
  const one = instruction.replace(/\s+/g, ' ').trim();
  const cut = one.length > 72 ? `${one.slice(0, 69)}…` : one;
  return `Tema IST/DST: ${cut}`;
}

function classify(slug: string, instruction: string, options: string): InferRow {
  if (MANUAL.has(slug)) {
    const [suggested, rationale, confidence] = MANUAL.get(slug)!;
    return {
      modulo_slug: slug,
      suggested_subtopico: suggested,
      confidence,
      keep_current: suggested === IST,
      rationale,
    };
  }

  const text = `${instruction} ${options}`;

  if (slug.includes('infeccoes-sexualmente-transmissiveis-ists') || IST_CORE.test(text)) {
    return {
      modulo_slug: slug,
      suggested_subtopico: IST,
      confidence: 0.94,
      keep_current: true,
      rationale: shortRationale(instruction),
    };
  }

  if (/higiene de mãos|higienização das mãos|iras\b|infecções relacionadas à assistência/i.test(text)) {
    return {
      modulo_slug: slug,
      suggested_subtopico: BIOS,
      confidence: 0.92,
      keep_current: false,
      rationale: 'Prevenção de IRAS e higiene das mãos.',
    };
  }

  if (/processo de enfermagem|anotação de enfermagem|passagem de plantão|registro de enfermagem/i.test(text)) {
    return {
      modulo_slug: slug,
      suggested_subtopico: PE,
      confidence: 0.9,
      keep_current: false,
      rationale: 'Processo de enfermagem e documentação assistencial.',
    };
  }

  return {
    modulo_slug: slug,
    suggested_subtopico: IST,
    confidence: 0.78,
    keep_current: true,
    rationale: 'Sem tema dominante claro fora de ISTs — manter bucket.',
  };
}

let totalScanned = 0;
let totalMoves = 0;

for (const batch of ['04', '05']) {
  const data = JSON.parse(readFileSync(resolve(OUT, `batch-${batch}.json`), 'utf8')) as {
    items: { modulo_slug: string; instruction?: string; optionsPreview?: string }[];
  };
  const inferences = data.items.map((it) =>
    classify(it.modulo_slug, it.instruction || '', it.optionsPreview || ''),
  );
  writeFileSync(
    resolve(OUT, `batch-${batch}-inferred.json`),
    JSON.stringify({ batch, bucket: IST, inferences }, null, 2) + '\n',
  );
  const moves = inferences.filter((r) => !r.keep_current && r.confidence >= 0.9);
  totalScanned += inferences.length;
  totalMoves += moves.length;
  console.log(`batch-${batch}: ${inferences.length} scanned, ${moves.length} moves (>=0.90)`);
}

if (totalScanned !== 72) {
  throw new Error(`Esperado 72 questões, obtido ${totalScanned}`);
}

console.log(JSON.stringify({ scanned: totalScanned, moves: totalMoves }, null, 2));
