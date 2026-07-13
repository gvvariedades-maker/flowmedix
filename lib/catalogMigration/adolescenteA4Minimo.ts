/**
 * Protocolo A4-mínimo — Saúde do Adolescente (Onda 3).
 * Escuta, sigilo, HPV, violência, saúde mental, desenvolvimento.
 *
 * @see docs/PROTOCOLO_A4_MINIMO_ADOLESCENTE.md
 * @see docs/PROTOCOLO_A4_MINIMO.md
 */

import {
  applyA4MinimoMitigation,
  auditA4Minimo,
  buildA4MinimoEfficacyContract,
  scoreWithA4Minimo,
  type A4MinimoAudit,
  type A4MinimoPackageConfig,
  type A4MinimoWhitelistClaim,
  type QuestaoLike,
} from '@/lib/catalogMigration/a4MinimoCore';
import type { EfficacyContract, RiskResult, RiskScoringContext } from '@/lib/catalogMigration/riskScoring';

export const ADOLESCENTE_A4_MINIMO_AGENT = 'agent:adolescente-a4-minimo-v1';
export const ADOLESCENTE_SUBTOPICO = 'Saúde do Adolescente';

export type AdolescenteReviewAxis =
  | 'escuta'
  | 'sigilo'
  | 'gravidez'
  | 'sexual'
  | 'vacina'
  | 'violencia'
  | 'saude_mental'
  | 'desenvolvimento'
  | 'estilo_vida';

export type AdolescenteWhitelistClaim = A4MinimoWhitelistClaim & {
  axis: AdolescenteReviewAxis;
};
export type AdolescenteA4MinimoAudit = A4MinimoAudit;

export function isAdolescenteSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'saúde do adolescente' ||
    n === 'saude do adolescente' ||
    n === 'saúde adolescente' ||
    n === 'saude adolescente'
  );
}

export const ADOLESCENTE_CLAIM_WHITELIST: readonly AdolescenteWhitelistClaim[] = [
  {
    id: 'escuta-privacidade',
    axis: 'escuta',
    match:
      /escuta\s+qualificada|privacidade|autonomia\s+progressiva|acolhimento.{0,30}(?:sem\s+julgamento|v[ií]nculo)/i,
    canonical: 'Consulta: privacidade, escuta qualificada e autonomia progressiva',
    guidelineEntryId: 'adolescente-escuta',
    groundsNumeric: false,
  },
  {
    id: 'sigilo-com-limites',
    axis: 'sigilo',
    match:
      /sigilo.{0,50}(?:limites?|risco\s+grave|protegido|ponderad)|(?:n[aã]o\s+[eé]\s+absoluto).{0,40}sigilo|sigilo.{0,40}(?:n[aã]o\s+[eé]\s+absoluto)/i,
    canonical: 'Sigilo protegido com limites legais — quebra quando há risco grave',
    guidelineEntryId: 'sigilo-adolescente',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-sigilo-absoluto',
    axis: 'sigilo',
    match:
      /sigilo.{0,40}(?:absolut|sem\s+crit[eé]rio).{0,40}(?:fals|errad|pegadinha|eliminar)|(?:fals|errad|pegadinha).{0,40}sigilo/i,
    canonical: 'Sigilo absoluto / quebra sem critério é pegadinha',
    guidelineEntryId: 'pegadinha-sigilo-absoluto',
    groundsNumeric: false,
  },
  {
    id: 'gravidez-adolescente-risco',
    axis: 'gravidez',
    match:
      /gravidez.{0,40}adolesc|adolesc.{0,40}gravidez|pr[eé]-?natal\s+precoce|riscos?\s+materno/i,
    canonical: 'Gravidez na adolescência: riscos materno-fetais + pré-natal precoce',
    guidelineEntryId: 'gravidez-adolescente',
    groundsNumeric: false,
  },
  {
    id: 'contracepcao-orientacao',
    axis: 'sexual',
    match:
      /contracep|sa[uú]de\s+sexual|m[eé]todos?\s+contracept|dupla\s+prote[cç]/i,
    canonical: 'Orientação sobre contracepção integra o cuidado do adolescente',
    guidelineEntryId: 'contracepcao-adolescente',
    groundsNumeric: false,
  },
  {
    id: 'preservativo-dupla-protecao',
    axis: 'sexual',
    match: /preservativo|dupla\s+prote[cç]|barreira.{0,30}(?:ist|gravidez)/i,
    canonical: 'Dupla proteção: preservativo + outro método (IST + gravidez)',
    guidelineEntryId: 'preservativo-dupla-protecao',
    groundsNumeric: false,
  },
  {
    id: 'hpv-2-doses',
    axis: 'vacina',
    match:
      /hpv.{0,50}(?:2\s*doses?|9\s*a\s*14|0\s*e\s*6)|(?:9\s*a\s*14|duas\s+doses).{0,40}hpv/i,
    forbid: /hpv.{0,60}3\s*doses?|(?:9\s*a\s*14|<15).{0,40}3\s*doses?.{0,30}hpv|hpv.{0,40}(?:9\s*a\s*14|<15).{0,40}3\s*doses?/i,
    canonical: 'HPV PNI: 9–14 anos — 2 doses (0 e 6 meses)',
    guidelineEntryId: 'hpv-adolescente-pni',
    groundsNumeric: true,
  },
  {
    id: 'consentimento-eca-12',
    axis: 'sigilo',
    match:
      /(?:≥\s*12|>=\s*12|a\s+partir\s+dos?\s+12|ECA).{0,50}consent|consentimento.{0,40}(?:12|autonomia|ECA)/i,
    canonical: 'ECA: ≥12 anos — autonomia progressiva / consentimento baixa complexidade',
    guidelineEntryId: 'consentimento-adolescente-eca',
    groundsNumeric: true,
  },
  {
    id: 'violencia-sexual-acolhimento',
    axis: 'violencia',
    match:
      /viol[eê]ncia\s+sexual|notifica[cç][aã]o\s+compuls[oó]ria|profilaxia.{0,30}(?:ist|hiv)|contracep[cç][aã]o\s+de\s+emerg/i,
    canonical: 'Violência sexual: acolher, profilaxia, CE; notificação compulsória',
    guidelineEntryId: 'violencia-sexual-adolescente',
    groundsNumeric: false,
  },
  {
    id: 'bullying-violencia',
    axis: 'violencia',
    match: /bullying|cyberbullying|viol[eê]ncia\s+(?:escolar|interpessoal)/i,
    canonical: 'Bullying/cyberbullying: acolher, escutar e articular rede',
    guidelineEntryId: 'bullying-violencia-escolar',
    groundsNumeric: false,
  },
  {
    id: 'automutilacao-risco',
    axis: 'saude_mental',
    match: /automutila[cç]|nssi|autoles[aã]o|ide[aá][cç][aã]o\s+suicid/i,
    canonical: 'Automutilação/ideação: avaliar risco e encaminhar (não minimizar)',
    guidelineEntryId: 'automutilacao-risco',
    groundsNumeric: false,
  },
  {
    id: 'atividade-fisica-60min',
    axis: 'estilo_vida',
    match: /(?:≥\s*60|>=\s*60|60\s*min).{0,30}(?:dia|moderada)|atividade\s+f[ií]sica.{0,40}60/i,
    canonical: 'Atividade física: ≥60 min/dia moderada a vigorosa',
    guidelineEntryId: 'atividade-fisica-adolescente',
    groundsNumeric: true,
  },
  {
    id: 'alcool-drogas-prevencao',
    axis: 'estilo_vida',
    match: /[aá]lcool|drogas?|subst[aâ]ncias?|cannabis|tabaco.{0,40}adolesc|abstin[eê]ncia/i,
    canonical: 'Álcool/drogas: prevenção e acolhimento — início precoce aumenta dependência',
    guidelineEntryId: 'alcool-drogas-adolescente',
    groundsNumeric: false,
  },
  {
    id: 'puberdade-tardia-tanner',
    axis: 'desenvolvimento',
    match: /puberdade\s+tard|tanner|broto\s+mam[aá]rio|hipertrofia\s+testicular|4\s*m[lL]/i,
    canonical: 'Puberdade tardia / Tanner — marcos cronológicos no exame',
    guidelineEntryId: 'tanner-puberal',
    groundsNumeric: true,
  },
  {
    id: 'transtornos-alimentares-95',
    axis: 'saude_mental',
    match: /transtornos?\s+alimentares?|anorexia|bulimia|95\s*%.{0,40}mulher|distor[cç][aã]o.{0,20}imagem/i,
    canonical: 'Transtornos alimentares — ~95% em mulheres; anorexia/bulimia',
    guidelineEntryId: 'transtornos-alimentares-95-mulheres',
    groundsNumeric: true,
  },
  {
    id: 'ist-testagem',
    axis: 'sexual',
    match: /\bist\b|testagem|preven[cç][aã]o\s+combinada|hbv|hepatite\s+b/i,
    canonical: 'IST: prevenção combinada e oferta de testagem na APS',
    guidelineEntryId: 'ist-testagem-adolescente',
    groundsNumeric: false,
  },
  {
    id: 'obesidade-comorbidades',
    axis: 'estilo_vida',
    match:
      /obesidade.{0,60}(?:diabetes|depress|comorb)|(?:diabetes|depress).{0,40}obesidade|depress[aã]o\s+e\s+diabetes|diabetes\s+e\s+depress/i,
    canonical: 'Obesidade adolescente: comorbidades clássicas = diabetes + depressão',
    guidelineEntryId: 'obesidade-comorbidades-dm-depressao',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-gravidez-nao-comorbidade',
    axis: 'gravidez',
    match:
      /gravidez\s+precoce.{0,40}vitiligo|gravidez.{0,50}(?:n[aã]o\s+(?:[eé]|s[aã]o)\s+complica|n[aã]o\s+(?:comp[oõ]e|definem))/i,
    canonical: 'Gravidez precoce não é comorbidade típica da obesidade — pegadinha',
    guidelineEntryId: 'obesidade-comorbidades-dm-depressao',
    groundsNumeric: false,
  },
  {
    id: 'diu-larc-consentimento',
    axis: 'sexual',
    match:
      /DIU|LARC|implante.{0,30}contracept|vida\s+sexual\s+ativa.{0,40}(?:autoriza|consent|pais)|(?:autoriza|consent).{0,40}(?:DIU|<?\s*18)/i,
    canonical: 'DIU/LARC: vida sexual ativa; <18 com autorização de responsáveis (prova)',
    guidelineEntryId: 'metodos-contraceptivos',
    groundsNumeric: true,
  },
  {
    id: 'escore-z-imc-faixas',
    axis: 'desenvolvimento',
    match:
      /escore\s*z|sobrepeso.{0,30}(?:\+1|\+2)|IMC.{0,40}(?:escore|z\s*[><=])|magreza\s+acentuada|obesidade\s+grave/i,
    canonical: 'Escore Z IMC (Caderneta/OMS): sobrepeso +1 a +2; obesidade +2 a +3; grave > +3',
    guidelineEntryId: 'escore-z-imc-sobrepeso',
    groundsNumeric: true,
  },
];

const ADOLESCENTE_SENSITIVE_RE =
  /\b\d+\s*(?:doses?|anos?|min)|hpv|sigilo|gravidez|contracep|viol[eê]ncia|suic[ií]d|automutila|tanner|4\s*m[lL]|60\s*min|ECA|≥\s*12|preservativo|pr[eé]-?natal|obesidade|DIU|escore\s*z|\+1|\+2|\+3/i;

export const ADOLESCENTE_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'adolescente',
  label: 'Adolescente',
  agentId: ADOLESCENTE_A4_MINIMO_AGENT,
  isApplicable: isAdolescenteSubtopico,
  whitelist: ADOLESCENTE_CLAIM_WHITELIST,
  sensitiveClaimHintRe: ADOLESCENTE_SENSITIVE_RE,
  minDangerItems: 3,
  fixacaoStepRe:
    /similares|em outra|transfer|port[aá]til|fixa[cç][aã]o|sigilo|limites?\s+legais|n[aã]o\s+confund|autonomia/i,
};

export function auditAdolescenteA4Minimo(payload: QuestaoLike): AdolescenteA4MinimoAudit {
  return auditA4Minimo(ADOLESCENTE_A4_MINIMO_CONFIG, payload);
}

export function applyAdolescenteA4MinimoMitigation(
  risk: RiskResult,
  audit: AdolescenteA4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(ADOLESCENTE_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreQuestaoRiskWithAdolescenteA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: AdolescenteA4MinimoAudit } {
  return scoreWithA4Minimo(ADOLESCENTE_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildAdolescenteA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: AdolescenteA4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(ADOLESCENTE_A4_MINIMO_CONFIG, risk, audit, options);
}
