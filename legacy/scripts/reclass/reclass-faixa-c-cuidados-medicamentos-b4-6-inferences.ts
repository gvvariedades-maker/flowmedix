#!/usr/bin/env tsx
/**
 * Onda 6 — Cuidados na Administração de Medicamentos, lotes 04–06 (faixa C).
 * Classificação agente por leitura de enunciado → batch-XX-inferred.json
 *
 *   npx tsx scripts/reclass-faixa-c-cuidados-medicamentos-b4-6-inferences.ts
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

const MED = 'Cuidados na Administração de Medicamentos';
const OUT = 'artifacts/reclass/faixa-c/cuidados-medicamentos';
const CALC = 'Cálculo de Administração de Medicamentos e Infusões';
const VIAS = 'Vias de Administração';
const FARMA = 'Farmacodinâmica e Farmacocinética';
const PE = 'Processo de Enfermagem';
const AUDIT = 'Segurança do Paciente';
const SM = 'Saúde Mental';
const SCM = 'Saúde da Mulher';
const ATB = 'Atenção Básica / Saúde da Família';
const PROMO = 'Promoção à Saúde e Prevenção de Agravos';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const PROC = 'Procedimentos Diversos';
const SONDA = 'Instalação e Manejo de Sondas';
const PUNCAO = 'Punção Venosa e Cuidados com Cateteres';
const CME = 'Enfermagem em Central de Material e Esterilização (CME)';
const PERI = 'Assistência Perioperatória (Inclui SRPA)';
const URG = 'Urgências e Emergências';
const VIRAL = 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';
const IST = 'Infecções Sexualmente Transmissíveis (ISTs)';
const FISIO = 'Noções de Fisiologia';
const EPID = 'Epidemiologia e Vigilância Epidemiológica';

/** Overrides manuais pós-leitura (slug → [subtopico, rationale, confidence]) */
const MANUAL = new Map<string, [string, string, number]>([
  ['ibade-enfermagem-processo-de-enfermagem-1780005128081-8', [SM, 'Atendimento em CAPS e abordagem em saúde mental.', 0.95]],
  ['idcap-enfermagem-cuidados-na-administracao-de-medicamentos-1778969633568-4', [FARMA, 'Conceitos de farmacocinética, farmacodinâmica e princípio ativo.', 0.94]],
  ['idcap-enfermagem-processo-de-enfermagem-1776056021381-7', [PE, 'Finalidade da fase inicial da SAE.', 0.94]],
  ['idecan-enfermagem-atencao-basica-saude-da-familia-1778712409051-9', [ATB, 'Papel da APS no cuidado de doenças crônicas.', 0.92]],
  ['idecan-enfermagem-cuidados-na-administracao-de-medicamentos-1778712108887-8', [DCNT, 'Fisiopatologia do diabetes mellitus e glicosímetro.', 0.93]],
  ['idecan-enfermagem-enfermagem-em-oncologia-1778712409051-5', [PROC, 'Higiene oral na quimioterapia — cuidado oncológico.', 0.91]],
  ['idecan-enfermagem-procedimentos-diversos-1778712203076-1', [PROC, 'Preparo de diabético para tomografia com contraste.', 0.92]],
  ['idecan-enfermagem-procedimentos-diversos-1778712203076-4', [FISIO, 'Balanço hídrico e monitoração de líquidos.', 0.91]],
  ['idib-enfermagem-doencas-autoimunes-e-reumatologicas-1778934918280-3', [DCNT, 'Surto de esclerose múltipla — doença crônica neurológica.', 0.92]],
  ['ieses-enfermagem-atencao-basica-saude-da-familia-1778968180610-4', [ATB, 'Papel do técnico na reabilitação na atenção básica.', 0.91]],
  ['ieses-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-3', [PROMO, 'Educação em saúde de pacientes e famílias.', 0.93]],
  ['igecap-enfermagem-processo-de-enfermagem-1780004280851-9', [CALC, 'Cálculo de volume a aspirar (300 mg em frasco 1 g/10 mL).', 0.95]],
  ['igeduc-enfermagem-processo-de-enfermagem-1780001148264-3', [VIRAL, 'Atribuições do técnico frente a viroses na atenção básica.', 0.92]],
  ['igeduc-enfermagem-processo-de-enfermagem-1780010566816-0', [CALC, 'Cálculo e diluição de medicamentos na atenção básica.', 0.94]],
  ['igeduc-enfermagem-processo-de-enfermagem-1780010566816-2', [VIAS, 'Indicações e técnicas das vias de administração.', 0.94]],
  ['instituto-access-enfermagem-cuidados-na-administracao-de-medicamentos-1778969633568-8', [SONDA, 'Administração de medicamentos por sonda nasoenteral.', 0.93]],
  ['instituto-access-enfermagem-processo-de-enfermagem-1780005797734-6', [AUDIT, 'Metas internacionais de segurança do paciente (OMS).', 0.93]],
  ['instituto-aocp-enfermagem-processo-de-enfermagem-1780003950945-0', [CALC, 'Cálculo de volume a aspirar (4 mg EV, ampola 0,4%).', 0.95]],
  ['instituto-aocp-enfermagem-processo-de-enfermagem-1780005540776-2', [PROC, 'Terapia nutricional parenteral — indicação e cuidados.', 0.92]],
  ['instituto-aocp-enfermagem-processo-de-enfermagem-1780005550040-6', [PERI, 'Vantagens da cirurgia ambulatorial de pequeno porte.', 0.93]],
  ['instituto-consulpam-enfermagem-processo-de-enfermagem-1780006486032-3', [CALC, 'Cálculo de dose após reconstituição (ceftriaxona 500 mg).', 0.95]],
  ['instituto-consulplan-enfermagem-cuidados-na-administracao-de-medicamentos-1778969554207-7', [DCNT, 'Hipoglicemiantes orais no tratamento do diabetes.', 0.91]],
  ['instituto-iacp-enfermagem-processo-de-enfermagem-1780004280851-4', [VIAS, 'Anatomia e local seguro para injeção IM (ventroglútea).', 0.93]],
  ['instituto-ibed-enfermagem-processo-de-enfermagem-1780004917460-0', [CALC, 'Cálculo de volume para 500 mg (frasco 1 g/10 mL).', 0.95]],
  ['instituto-ibed-enfermagem-processo-de-enfermagem-1780004926596-0', [VIAS, 'Técnica de aplicação intradérmica (PPD).', 0.94]],
  ['instituto-verbena-enfermagem-processo-de-enfermagem-1780008197597-7', [CME, 'Central de Material e Esterilização — processamento.', 0.95]],
  ['instituto-verbena-enfermagem-processo-de-enfermagem-1780008210115-3', [CALC, 'Cálculo de frascos para tratamento com dexametasona.', 0.94]],
  ['legalle-enfermagem-processo-de-enfermagem-1780010579953-6', [SCM, 'Orientações para coleta de citopatológico do colo uterino.', 0.94]],
  ['legalle-enfermagem-processo-de-enfermagem-1780010585356-8', [URG, 'Causas de crise epiléptica reativa (febre aguda).', 0.91]],
  ['legalle-enfermagem-processo-de-enfermagem-1780010911471-8', [DCNT, 'Fatores associados ao ganho de peso e manejo da obesidade.', 0.92]],
  ['objetiva-concursos-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563793798-6', [AUDIT, 'Definição de evento sentinela em segurança do paciente.', 0.93]],
  ['objetiva-concursos-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563853014-1', [FARMA, 'Farmacovigilância e monitoramento de efeitos adversos.', 0.94]],
  ['quadrix-enfermagem-cuidados-na-administracao-de-medicamentos-1778969018962-1', [FARMA, 'Tipos de ação das insulinas prescritas (rápida/ultrarrápida).', 0.93]],
  ['quadrix-enfermagem-cuidados-na-administracao-de-medicamentos-1780000237780-3', [FARMA, 'Tipos de ação das insulinas prescritas (rápida/ultrarrápida).', 0.93]],
  ['selecon-enfermagem-processo-de-enfermagem-1780009310940-5', [PROC, 'Mucosite oral em paciente oncológico — cuidados específicos.', 0.92]],
  ['selecon-enfermagem-processo-de-enfermagem-1780009322055-9', [SM, 'Atenção em saúde mental no CAPS — abordagem não coercitiva.', 0.95]],
  ['unifil-enfermagem-processo-de-enfermagem-1780003637054-8', [AUDIT, 'Seis metas internacionais de segurança do paciente (JCI/OMS).', 0.93]],
  ['vunesp-enfermagem-atencao-basica-saude-da-familia-1778968094018-0', [ATB, 'Grupos educativos por patologia na atenção básica.', 0.92]],
  ['vunesp-enfermagem-atencao-basica-saude-da-familia-1778968221218-3', [IST, 'Papel do técnico em CTA para ISTs.', 0.94]],
  ['vunesp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-2', [PROC, 'POPs na gestão de estoque hospitalar.', 0.91]],
  ['vunesp-enfermagem-processo-de-enfermagem-1780001673873-5', [SCM, 'Uso de anticoncepcional oral combinado.', 0.93]],
  ['vunesp-enfermagem-processo-de-enfermagem-1780001673873-8', [PUNCAO, 'Flebite/extravasamento no cateter periférico.', 0.94]],
  ['vunesp-enfermagem-processo-de-enfermagem-1780001742844-3', [PROMO, 'Ação de promoção da saúde proposta pelo técnico na APS.', 0.92]],
  ['vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-8', [PROMO, 'Educação em saúde em grupos de doenças crônicas.', 0.93]],
]);

const MED_CORE =
  /administração (de |segura de )?medicamento|administrar.*medicamento|preparo.*medicamento|6 certos|5 certos|9 certos|nove certos|mav\b|alta vigilância|tripla checagem|erro de medicação|medicamento certo|dose certa|via certa|horário certo|paciente certo|interação medicamentosa|medicamento potencialmente perigoso|insulinoterapia|lipodistrofia|lipohipertrofia|fotossensíve|reconstituição.*medicamento|heparina.*administra|droga vasoativa|reações alérgicas.*medicamento|efeitos adversos.*medicamento|uso racional de medicamento|regra dos nove certos|prescrição.*administração de medicamento/i;

function classify(slug: string, instruction: string, options: string): InferRow {
  if (MANUAL.has(slug)) {
    const [suggested, rationale, confidence] = MANUAL.get(slug)!;
    return {
      modulo_slug: slug,
      suggested_subtopico: suggested,
      confidence,
      keep_current: suggested === MED,
      rationale,
    };
  }

  const text = `${instruction} ${options}`.toLowerCase();

  if (MED_CORE.test(text)) {
    const nonMedDominant =
      /centro de atenção psicossocial|\bcaps\b|transtorno mental|saúde mental|psicossocial|citopatológico do colo|anticoncepcional oral|esclerose múltipla|obesidade.*adultos|terapia nutricional parenteral|cirurgia ambulatorial|central de material e esterilização|\bcme\b|evento sentinela|farmacovigilância|viroses.*atenção básica|grupos por patologias|centros de testagem|\bcta\b|pop\b.*estoque|crise epiléptica reativa|mucosite oral.*oncológico/i;
    if (!nonMedDominant.test(text)) {
      return {
        modulo_slug: slug,
        suggested_subtopico: MED,
        confidence: 0.94,
        keep_current: true,
        rationale: '6 certos, MAV, preparo, vigilância ou administração segura de medicamentos.',
      };
    }
  }

  const rules: { re: RegExp; to: string; r: string; c: number; skipMedSlug?: boolean }[] = [
    { re: /centro de atenção psicossocial|\bcaps\b|transtorno mental|saúde mental|psicossocial|psiquiatr/i, to: SM, r: 'Assistência em saúde mental.', c: 0.94 },
    { re: /gestante|gestação|citopatológico|colo do útero|anticoncepcional oral|benzilpenicilina.*sífilis/i, to: SCM, r: 'Saúde da mulher/gestação.', c: 0.93, skipMedSlug: true },
    { re: /centros de testagem|\bcta\b|doenças sexualmente transmissíveis|\bists?\b/i, to: IST, r: 'ISTs e testagem.', c: 0.93 },
    { re: /viroses.*atenção básica|viroses constituem/i, to: VIRAL, r: 'Viroses na atenção primária.', c: 0.92 },
    { re: /esclerose múltipla|obesidade.*adultos|diabetes mellitus consiste|diabetes mellitus \(dm\)|hipoglicemiantes orais/i, to: DCNT, r: 'DCNT — diabetes, obesidade ou neurológica crônica.', c: 0.91 },
    { re: /quantos ml|aspirar dessa ampola|volume correto a ser aspirado|frascos-ampola serão necessários|regra de três|cálculo.*diluição|calcular.*dose|volume a ser aspirado/i, to: CALC, r: 'Cálculo de dose, diluição ou volume.', c: 0.94 },
    { re: /farmacocinética|farmacodinâmica|farmacovigilância|mecanismo de ação|absorção.*metabolismo|ação das insulinas|insulinas prescritas.*ação/i, to: FARMA, r: 'Farmacologia — mecanismo, cinética ou vigilância.', c: 0.93 },
    { re: /via intramuscular.*ângulo|via oral.*vantagem|via subcutânea|via intradérmica|injeção intramuscular.*volume|diâmetro da agulha|região ventroglútea|terapia nutricional parenteral|lipodistrofia.*técnica|técnicas de aplicação de injeções/i, to: VIAS, r: 'Técnica e indicação de vias de administração.', c: 0.92 },
    { re: /central de material e esterilização|\bcme\b/i, to: CME, r: 'Processamento e esterilização no CME.', c: 0.94 },
    { re: /cirurgia ambulatorial|pré-operat|pós-operat|perioperat/i, to: PERI, r: 'Assistência perioperatória.', c: 0.92 },
    { re: /cateter periférico|flebite|extravasamento|acesso venoso periférico.*edema/i, to: PUNCAO, r: 'Acesso venoso e complicações de cateter.', c: 0.93 },
    { re: /sonda nasoenteral|sonda enteral.*medicamento/i, to: SONDA, r: 'Medicamentos por sonda enteral.', c: 0.93 },
    { re: /evento sentinela|metas internacionais de segurança|nove certos.*oms|protocolo de segurança na prescrição/i, to: AUDIT, r: 'Segurança do paciente e protocolos NSP.', c: 0.91 },
    { re: /atenção primária|atenção básica|estratégia saúde da família|população adscrita|grupos por patologias/i, to: ATB, r: 'Atenção básica/saúde da família.', c: 0.9 },
    { re: /promoção da saúde|educação em saúde|educação para a saúde|prevenção de agravos/i, to: PROMO, r: 'Promoção à saúde e educação em saúde.', c: 0.91 },
    { re: /processo de enfermagem|sae\b|fase inicial da sistematização/i, to: PE, r: 'Processo de enfermagem.', c: 0.9 },
    { re: /quimioterápico|mucosite|oncologia|higiene oral.*quimio/i, to: PROC, r: 'Cuidados oncológicos ou procedimentos diversos.', c: 0.9 },
    { re: /balanço hídrico|equilíbrio hídrico/i, to: FISIO, r: 'Balanço hídrico e fisiologia aplicada.', c: 0.9 },
    { re: /crise epiléptica|convulsão/i, to: URG, r: 'Urgência — crise convulsiva.', c: 0.9 },
    { re: /\bpops?\b|gestão.*estoque/i, to: PROC, r: 'Gestão e procedimentos operacionais.', c: 0.9 },
    { re: /tomografia.*contraste|exames radiológicos.*contraste/i, to: PROC, r: 'Preparo para exame com contraste.', c: 0.91 },
  ];

  for (const rule of rules) {
    if (rule.skipMedSlug && slug.includes('cuidados-na-administracao-de-medicamentos')) continue;
    if (rule.re.test(text) || rule.re.test(slug)) {
      return {
        modulo_slug: slug,
        suggested_subtopico: rule.to,
        confidence: rule.c,
        keep_current: rule.to === MED,
        rationale: rule.r,
      };
    }
  }

  if (slug.includes('cuidados-na-administracao-de-medicamentos') || slug.includes('seguranca-do-paciente')) {
    return {
      modulo_slug: slug,
      suggested_subtopico: MED,
      confidence: 0.9,
      keep_current: true,
      rationale: 'Conteúdo de administração segura de medicamentos.',
    };
  }

  return {
    modulo_slug: slug,
    suggested_subtopico: MED,
    confidence: 0.78,
    keep_current: true,
    rationale: 'Sem tema dominante claro fora de medicamentos — manter bucket.',
  };
}

let totalScanned = 0;
let totalMoves = 0;

for (const batch of ['04', '05', '06']) {
  const data = JSON.parse(readFileSync(resolve(OUT, `batch-${batch}.json`), 'utf8')) as {
    items: { modulo_slug: string; instruction?: string; optionsPreview?: string }[];
  };
  const inferences = data.items.map((it) =>
    classify(it.modulo_slug, it.instruction || '', it.optionsPreview || ''),
  );
  writeFileSync(
    resolve(OUT, `batch-${batch}-inferred.json`),
    JSON.stringify({ batch, bucket: MED, inferences }, null, 2) + '\n',
  );
  const moves = inferences.filter((r) => !r.keep_current && r.confidence >= 0.9);
  totalScanned += inferences.length;
  totalMoves += moves.length;
  console.log(`batch-${batch}: ${inferences.length} scanned, ${moves.length} moves (>=0.90)`);
}

console.log(JSON.stringify({ scanned: totalScanned, moves: totalMoves }, null, 2));
