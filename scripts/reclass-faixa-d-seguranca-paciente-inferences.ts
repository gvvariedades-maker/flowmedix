#!/usr/bin/env tsx
/** Classificações agente — Segurança do Paciente (faixa D, wave 3). */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const BUCKET = 'Segurança do Paciente';
const OUT = 'artifacts/reclass/faixa-d/seguranca-paciente';

const BATCH01: InferRow[] = [
  { modulo_slug: 'adm-tec-enfermagem-seguranca-do-paciente-1777102678563-7', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Avaliação de ambiente domiciliar para segurança do atendimento.' },
  { modulo_slug: 'amauc-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563685104-6', suggested_subtopico: BUCKET, confidence: 0.92, keep_current: true, rationale: 'Gestão de materiais e qualidade do atendimento — permanece no bucket.' },
  { modulo_slug: 'ameosc-enfermagem-processo-de-enfermagem-1776056129848-7', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.95, keep_current: false, rationale: 'Regras de registro em prontuário e anotações de enfermagem.' },
  { modulo_slug: 'ameosc-enfermagem-processo-de-enfermagem-1776056158507-0', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.91, keep_current: false, rationale: 'Documentação objetiva de incidentes e intervenções no prontuário.' },
  { modulo_slug: 'avancasp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-7', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.95, keep_current: false, rationale: 'Conceito de evolução do paciente na documentação assistencial.' },
  { modulo_slug: 'avancasp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563701860-7', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Consentimento informado e direitos do paciente.' },
  { modulo_slug: 'avancasp-enfermagem-processo-de-enfermagem-1780002714111-6', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Prevenção de quedas — protocolo PNSP.' },
  { modulo_slug: 'avancasp-enfermagem-processo-de-enfermagem-1780002834059-6', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Transporte intra-hospitalar com segurança do paciente.' },
  { modulo_slug: 'avancasp-enfermagem-processo-de-enfermagem-1780003137298-4', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Cuidado principal no transporte intra-hospitalar é segurança.' },
  { modulo_slug: 'avancasp-enfermagem-processo-de-enfermagem-1780011859940-5', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Avaliação de risco de queda no protocolo PNSP.' },
  { modulo_slug: 'avancasp-enfermagem-processo-de-enfermagem-1780011872350-1', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Estabilização antes do transporte entre unidades.' },
  { modulo_slug: 'cebraspe-cespe-enfermagem-processo-de-enfermagem-1780001790945-7', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.96, keep_current: false, rationale: 'Acesso do paciente ao prontuário e registro de ações.' },
  { modulo_slug: 'com-exam-pref-bauru-enfermagem-seguranca-do-paciente-1777102918981-5', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Definição de evento adverso na segurança do paciente.' },
  { modulo_slug: 'cpcon-uepb-enfermagem-seguranca-do-paciente-1777102918981-8', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Política Nacional de Segurança do Paciente.' },
  { modulo_slug: 'cpcon-uepb-enfermagem-seguranca-do-paciente-1779563443877-1', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'PNSP Portaria 529/2013 e seis certos da medicação.' },
  { modulo_slug: 'educa-pb-enfermagem-processo-de-enfermagem-1780007246385-6', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Prevenção de quedas e lesões no contexto de segurança.' },
  { modulo_slug: 'facet-enfermagem-seguranca-do-paciente-1777102821787-6', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Estratégias de prevenção de quedas hospitalares.' },
  { modulo_slug: 'fadesp-enfermagem-seguranca-do-paciente-1777102821787-0', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Protocolo MS de prevenção de quedas e classificação de risco.' },
  { modulo_slug: 'fafipa-enfermagem-processo-de-enfermagem-1780009386446-1', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Classificação OMS: dano, risco, evento adverso e near miss.' },
  { modulo_slug: 'fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-3', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Doenças iatrogênicas — dano associado ao cuidado.' },
  { modulo_slug: 'fau-unicentro-enfermagem-processo-de-enfermagem-1780002704012-7', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Classificação de danos por gravidade (leve, moderado, grave).' },
  { modulo_slug: 'fau-unicentro-enfermagem-seguranca-do-paciente-1779563436357-5', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Ponto de assistência e higienização das mãos — meta OMS.' },
  { modulo_slug: 'fauel-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-8', suggested_subtopico: BUCKET, confidence: 0.92, keep_current: true, rationale: 'Definição OMS de qualidade em saúde — gestão/qualidade.' },
  { modulo_slug: 'faurgs-enfermagem-seguranca-do-paciente-1779563436357-6', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Estratégias para sistemas mais seguros no cuidado.' },
  { modulo_slug: 'faurgs-enfermagem-seguranca-do-paciente-1779563436357-7', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Protocolo de identificação do paciente.' },
  { modulo_slug: 'fcm-enfermagem-seguranca-do-paciente-1779563443877-3', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Definição de evento adverso.' },
  { modulo_slug: 'fenix-instituto-enfermagem-processo-de-enfermagem-1780006480333-5', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.93, keep_current: false, rationale: 'Registro do cuidado executado após procedimento.' },
  { modulo_slug: 'fgv-enfermagem-seguranca-do-paciente-1777102742836-4', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Protocolo MS de identificação do paciente.' },
  { modulo_slug: 'funatec-enfermagem-processo-de-enfermagem-1776055865890-3', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.94, keep_current: false, rationale: 'Anotação de enfermagem como responsabilidade legal (COFEN).' },
  { modulo_slug: 'funcepe-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-4', suggested_subtopico: BUCKET, confidence: 0.91, keep_current: true, rationale: 'Comunicação entre profissionais e qualidade do serviço.' },
  { modulo_slug: 'funcepe-enfermagem-seguranca-do-paciente-1777102678563-2', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Metas internacionais de segurança do paciente OMS/JCI.' },
  { modulo_slug: 'funcern-enfermagem-seguranca-do-paciente-1777102678563-5', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'PNSP e protocolos básicos de segurança.' },
  { modulo_slug: 'funcern-enfermagem-seguranca-do-paciente-1777102678563-6', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Escala de Morse para risco de quedas em idosos.' },
  { modulo_slug: 'fundatec-enfermagem-seguranca-do-paciente-1779563436357-2', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Metas internacionais de segurança do paciente.' },
  { modulo_slug: 'fundep-enfermagem-seguranca-do-paciente-1777102821787-1', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Medidas de segurança do paciente (identificação, higiene).' },
  { modulo_slug: 'fundepes-copeve-ufal-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-0', suggested_subtopico: BUCKET, confidence: 0.91, keep_current: true, rationale: 'Tipos de alta hospitalar — gestão/qualidade assistencial.' },
  { modulo_slug: 'funtef-enfermagem-seguranca-do-paciente-1777102821787-5', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Conceitos PNSP: segurança, dano, evento adverso, incidente.' },
  { modulo_slug: 'furb-enfermagem-seguranca-do-paciente-1777102918981-7', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Núcleos de Segurança do Paciente e notificação de eventos.' },
  { modulo_slug: 'iaupe-enfermagem-seguranca-do-paciente-1777102918981-0', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Relacionar definições de segurança do paciente.' },
  { modulo_slug: 'ibade-enfermagem-seguranca-do-paciente-1779563436357-1', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Metas internacionais aplicadas a procedimento cirúrgico.' },
  { modulo_slug: 'idcap-enfermagem-seguranca-do-paciente-1777102742836-0', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Terminologias de segurança do paciente (incidente, dano).' },
  { modulo_slug: 'idecan-enfermagem-seguranca-do-paciente-1778712220716-5', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Identificação segura do paciente.' },
  { modulo_slug: 'idecan-enfermagem-seguranca-do-paciente-1778712242196-0', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Prevenção de erros de medicação — segurança do paciente.' },
  { modulo_slug: 'idib-enfermagem-seguranca-do-paciente-1778934900821-4', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Checklist de cirurgia segura OMS em três fases.' },
  { modulo_slug: 'igeduc-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-4', suggested_subtopico: BUCKET, confidence: 0.91, keep_current: true, rationale: 'Provisão de recursos materiais — gestão hospitalar.' },
  { modulo_slug: 'imparh-enfermagem-seguranca-do-paciente-1777102936764-6', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Classificação de incidentes: quase-erro, sem dano, com dano.' },
  { modulo_slug: 'imparh-enfermagem-seguranca-do-paciente-1779563443877-5', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Protocolo de identificação do paciente para evitar eventos adversos.' },
  { modulo_slug: 'inaz-do-para-enfermagem-processo-de-enfermagem-1780011947286-2', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Comunicação de deterioração clínica na cultura de segurança.' },
  { modulo_slug: 'instituto-access-enfermagem-seguranca-do-paciente-1777102742836-2', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Quarta meta internacional: cirurgia segura.' },
  { modulo_slug: 'instituto-access-enfermagem-seguranca-do-paciente-1777102742836-3', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Near miss na administração de medicamento.' },
];

const BATCH02: InferRow[] = [
  { modulo_slug: 'instituto-consulpam-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-6', suggested_subtopico: BUCKET, confidence: 0.91, keep_current: true, rationale: 'Qualidade no atendimento ao público — gestão.' },
  { modulo_slug: 'instituto-consulplan-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-3', suggested_subtopico: BUCKET, confidence: 0.92, keep_current: true, rationale: 'Eficiência no planejamento de gastos em saúde.' },
  { modulo_slug: 'instituto-consulplan-enfermagem-seguranca-do-paciente-1777102678563-1', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Definição de evento adverso na Portaria 529.' },
  { modulo_slug: 'instituto-ibed-enfermagem-processo-de-enfermagem-1780004917460-9', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Grades do leito insuficientes isoladamente para prevenir quedas.' },
  { modulo_slug: 'instituto-verbena-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563701860-1', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'TCLE e princípio da autonomia — direitos do paciente.' },
  { modulo_slug: 'instituto-verbena-enfermagem-seguranca-do-paciente-1777102742836-1', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Cinco momentos para higienização das mãos — meta OMS.' },
  { modulo_slug: 'instituto-verbena-enfermagem-seguranca-do-paciente-1777102918981-4', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Prevenção de quedas em idosos no domicílio.' },
  { modulo_slug: 'ivin-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-8', suggested_subtopico: BUCKET, confidence: 0.91, keep_current: true, rationale: 'Escala de Fugulin para dimensionamento de equipe — gestão.' },
  { modulo_slug: 'ms-sarmento-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-2', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.92, keep_current: false, rationale: 'Passagem de plantão e continuidade da assistência.' },
  { modulo_slug: 'objetiva-concursos-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563718396-1', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Proteção dos direitos do paciente (Dochterman).' },
  { modulo_slug: 'objetiva-concursos-enfermagem-seguranca-do-paciente-1777102802022-9', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Protocolo de prevenção de quedas e indicadores.' },
  { modulo_slug: 'omni-enfermagem-seguranca-do-paciente-1779563467322-2', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Definição de risco na assistência.' },
  { modulo_slug: 'ufmt-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-6', suggested_subtopico: BUCKET, confidence: 0.91, keep_current: true, rationale: 'Processo de trabalho em saúde — gestão.' },
  { modulo_slug: 'ufmt-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-7', suggested_subtopico: BUCKET, confidence: 0.92, keep_current: true, rationale: 'Funções do gerenciamento (planejar, organizar, controlar, liderar).' },
  { modulo_slug: 'unesc-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563685104-5', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Pilares da qualidade incluindo segurança do paciente.' },
  { modulo_slug: 'unifil-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563718396-2', suggested_subtopico: BUCKET, confidence: 0.91, keep_current: true, rationale: 'Manutenção preventiva de equipamentos — gestão.' },
  { modulo_slug: 'unifil-enfermagem-seguranca-do-paciente-1779563443877-2', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Classificação do grau de dano segundo o MS.' },
  { modulo_slug: 'univali-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563701860-3', suggested_subtopico: 'Imunização', confidence: 0.96, keep_current: false, rationale: 'Ferramentas de qualidade na gestão da Rede de Frio.' },
  { modulo_slug: 'univali-enfermagem-seguranca-do-paciente-1777102821787-2', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Transporte seguro de paciente com risco de queda.' },
  { modulo_slug: 'univali-enfermagem-seguranca-do-paciente-1777102821787-3', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Reutilização de agulha fere redução de dano ao paciente.' },
  { modulo_slug: 'univali-enfermagem-seguranca-do-paciente-1777102821787-4', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Notificação de erro de medicação — cultura de segurança.' },
  { modulo_slug: 'vunesp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-0', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.91, keep_current: false, rationale: 'Diretrizes de registro em prontuário e documentação.' },
  { modulo_slug: 'vunesp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-1', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.92, keep_current: false, rationale: 'Regras e sigilo do prontuário médico.' },
  { modulo_slug: 'vunesp-enfermagem-seguranca-do-paciente-1777102821787-7', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Pulseira de risco de queda e medidas de segurança.' },
  { modulo_slug: 'vunesp-enfermagem-seguranca-do-paciente-1779563448133-1', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Checklist de cirurgia segura OMS (time out, sign in).' },
  { modulo_slug: 'vunesp-enfermagem-seguranca-do-paciente-1779563448133-2', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Metas internacionais de segurança do paciente.' },
  { modulo_slug: 'vunesp-enfermagem-seguranca-do-paciente-1779563448133-3', suggested_subtopico: BUCKET, confidence: 0.88, keep_current: true, rationale: 'Humanização — tema transversal sem destino canônico claro ≥0,90.' },
];

function writeInferred(batch: string, rows: InferRow[]) {
  const rel = `${OUT}/batch-${batch}-inferred.json`;
  writeFileSync(
    resolve(process.cwd(), rel),
    JSON.stringify({ batch, bucket: BUCKET, inferences: rows }, null, 2) + '\n',
  );
  const moves = rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
  console.log(`batch-${batch}: ${rows.length} scanned, ${moves} moves (>=0.90)`);
}

writeInferred('01', BATCH01);
writeInferred('02', BATCH02);

const all = [...BATCH01, ...BATCH02];
const moves = all.filter((r) => !r.keep_current && r.confidence >= 0.9);
console.log(`TOTAL: ${all.length} scanned, ${moves.length} moves (>=0.90)`);
