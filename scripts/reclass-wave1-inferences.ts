#!/usr/bin/env tsx
/** Classificações agente — onda 1 (4 subtópicos menores). */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

function writeInferred(outDir: string, bucket: string, batch: string, rows: InferRow[]) {
  const rel = `${outDir}/batch-${batch}-inferred.json`;
  writeFileSync(
    resolve(process.cwd(), rel),
    JSON.stringify({ batch, bucket, inferences: rows }, null, 2) + '\n',
  );
  const moves = rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
  console.log(`${bucket}: ${rows.length} scanned, ${moves} moves (>=0.90)`);
}

const FARMACO: InferRow[] = [
  { modulo_slug: 'fundatec-enfermagem-processo-de-enfermagem-1780011956256-8', suggested_subtopico: 'Farmacodinâmica e Farmacocinética', confidence: 0.96, keep_current: true, rationale: 'Anestésicos locais — farmacologia de anestesia.' },
  { modulo_slug: 'idecan-enfermagem-efeitos-adversos-dos-medicamentos-1780066909125-3', suggested_subtopico: 'Cuidados na Administração de Medicamentos', confidence: 0.92, keep_current: false, rationale: 'Reações alérgicas a medicamentos — vigilância na administração.' },
  { modulo_slug: 'idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-6', suggested_subtopico: 'Farmacodinâmica e Farmacocinética', confidence: 0.97, keep_current: true, rationale: 'Omeprazol EV — farmacocinética e administração.' },
  { modulo_slug: 'idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-7', suggested_subtopico: 'Farmacodinâmica e Farmacocinética', confidence: 0.97, keep_current: true, rationale: 'Diazepam — farmacologia e meia-vida.' },
  { modulo_slug: 'idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-8', suggested_subtopico: 'Cuidados na Administração de Medicamentos', confidence: 0.91, keep_current: false, rationale: 'Contraste radiológico — cuidados na administração de medicamentos/exames.' },
  { modulo_slug: 'instituto-aocp-enfermagem-processo-de-enfermagem-1780003950945-2', suggested_subtopico: 'Farmacodinâmica e Farmacocinética', confidence: 0.94, keep_current: true, rationale: 'Fármacos para angina (propranolol, isossorbida) — farmacodinâmica cardiovascular.' },
];

const HISTORIA: InferRow[] = [
  { modulo_slug: 'avancasp-enfermagem-historia-da-enfermagem-1775331667969-1', suggested_subtopico: 'História da Enfermagem', confidence: 0.97, keep_current: true, rationale: 'Código de Ética — marco histórico e ético da profissão.' },
  { modulo_slug: 'avancasp-enfermagem-historia-da-enfermagem-1775331667969-2', suggested_subtopico: 'História da Enfermagem', confidence: 0.96, keep_current: true, rationale: 'Lei 7.498/86 — regulamentação histórica da enfermagem.' },
  { modulo_slug: 'cogeps-unioeste-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-7', suggested_subtopico: 'História da Enfermagem', confidence: 0.93, keep_current: true, rationale: 'Direitos do profissional — ética e história profissional.' },
  { modulo_slug: 'funatec-enfermagem-teorias-em-enfermagem-1776055843703-3', suggested_subtopico: 'História da Enfermagem', confidence: 0.9, keep_current: true, rationale: 'Humanização hospitalar — teorias e evolução do cuidado.' },
  { modulo_slug: 'funatec-enfermagem-teorias-em-enfermagem-1776055843703-4', suggested_subtopico: 'História da Enfermagem', confidence: 0.91, keep_current: true, rationale: 'Abordagem holística — teorias de enfermagem.' },
  { modulo_slug: 'ibec-enfermagem-teorias-em-enfermagem-1776055843703-5', suggested_subtopico: 'História da Enfermagem', confidence: 0.95, keep_current: true, rationale: 'Código de Ética de Enfermagem.' },
  { modulo_slug: 'idcap-enfermagem-historia-da-enfermagem-1775331667969-3', suggested_subtopico: 'História da Enfermagem', confidence: 0.97, keep_current: true, rationale: 'Eventos históricos da enfermagem no Brasil.' },
  { modulo_slug: 'idecan-enfermagem-historia-da-enfermagem-1778712122855-0', suggested_subtopico: 'História da Enfermagem', confidence: 0.96, keep_current: true, rationale: 'Evolução da saúde pública no Brasil.' },
  { modulo_slug: 'idecan-enfermagem-teorias-em-enfermagem-1778712122855-2', suggested_subtopico: 'História da Enfermagem', confidence: 0.91, keep_current: true, rationale: 'Humanização do cuidado — teorias de enfermagem.' },
  { modulo_slug: 'idecan-enfermagem-teorias-em-enfermagem-1778712122855-3', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.94, keep_current: false, rationale: 'Teoria de Orem e autocuidado — núcleo do processo de enfermagem.' },
  { modulo_slug: 'idib-enfermagem-teorias-em-enfermagem-1778934863952-1', suggested_subtopico: 'História da Enfermagem', confidence: 0.92, keep_current: true, rationale: 'Teorias administrativas e Wanda Horta.' },
  { modulo_slug: 'ieses-enfermagem-historia-da-enfermagem-1775331667969-5', suggested_subtopico: 'História da Enfermagem', confidence: 0.98, keep_current: true, rationale: 'Importância do estudo da história da enfermagem.' },
  { modulo_slug: 'igeduc-enfermagem-teorias-em-enfermagem-1776055843703-7', suggested_subtopico: 'História da Enfermagem', confidence: 0.89, keep_current: true, rationale: 'Liderança democrática — teorias administrativas em enfermagem.' },
  { modulo_slug: 'inaz-do-para-enfermagem-teorias-em-enfermagem-1776055843703-1', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.91, keep_current: false, rationale: 'Comunicação terapêutica — técnica do processo de enfermagem.' },
  { modulo_slug: 'instituto-aocp-enfermagem-processo-de-enfermagem-1780003868364-9', suggested_subtopico: 'História da Enfermagem', confidence: 0.95, keep_current: true, rationale: 'Teoria de Wanda Horta — história e teorias da enfermagem.' },
  { modulo_slug: 'instituto-consulpam-enfermagem-teorias-em-enfermagem-1776056009428-2', suggested_subtopico: 'História da Enfermagem', confidence: 0.9, keep_current: true, rationale: 'Humanização na saúde — teorias do cuidado.' },
  { modulo_slug: 'instituto-consulplan-enfermagem-teorias-em-enfermagem-1776056009428-1', suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos', confidence: 0.9, keep_current: false, rationale: 'Empatia no atendimento ao público — promoção e relação de cuidado.' },
  { modulo_slug: 'lj-assessoria-enfermagem-teorias-em-enfermagem-1776056009428-0', suggested_subtopico: 'História da Enfermagem', confidence: 0.96, keep_current: true, rationale: 'Definição de enfermagem segundo Wanda Horta.' },
  { modulo_slug: 'selecon-enfermagem-teorias-em-enfermagem-1776055843703-6', suggested_subtopico: 'História da Enfermagem', confidence: 0.94, keep_current: true, rationale: 'Wanda Horta e ciência da enfermagem.' },
  { modulo_slug: 'ufmt-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-6', suggested_subtopico: 'Segurança do Paciente', confidence: 0.9, keep_current: false, rationale: 'Processo de trabalho em saúde — gestão da qualidade/NSP.' },
  { modulo_slug: 'univali-enfermagem-teorias-em-enfermagem-1776055843703-2', suggested_subtopico: 'Urgências e Emergências', confidence: 0.93, keep_current: false, rationale: 'Paciente com IAM e ansiedade — conduta em urgência cardíaca, não história.' },
];

const TRABALHO: InferRow[] = [
  { modulo_slug: 'avancasp-enfermagem-enfermagem-do-trabalho-1778967789485-7', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.96, keep_current: true, rationale: 'Ergonomia de concepção — saúde ocupacional.' },
  { modulo_slug: 'copese-ufpi-enfermagem-atencao-basica-saude-da-familia-1778967776515-6', suggested_subtopico: 'Atenção Básica / Saúde da Família', confidence: 0.93, keep_current: false, rationale: 'Proteção dos ACE na atenção básica — não enfermagem do trabalho hospitalar.' },
  { modulo_slug: 'copese-ufpi-enfermagem-enfermagem-do-trabalho-1778967789485-1', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.95, keep_current: true, rationale: 'ANVISA e prevenção de acidentes ocupacionais.' },
  { modulo_slug: 'copese-ufpi-geral-enfermagem-do-trabalho-1777103554284-3', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.94, keep_current: true, rationale: 'Riscos do Agente de Combate a Endemias.' },
  { modulo_slug: 'fau-unicentro-enfermagem-seguranca-do-paciente-1777102678563-4', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.93, keep_current: true, rationale: 'EPC e sinalização — segurança ocupacional do trabalhador.' },
  { modulo_slug: 'fgv-enfermagem-processo-de-enfermagem-1780002110600-1', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.97, keep_current: true, rationale: 'Câncer de pele por exposição solar ocupacional.' },
  { modulo_slug: 'fgv-enfermagem-processo-de-enfermagem-1780002110600-2', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.97, keep_current: true, rationale: 'Síndrome do túnel do carpo — LER/DORT.' },
  { modulo_slug: 'fgv-enfermagem-processo-de-enfermagem-1780002110600-5', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.96, keep_current: true, rationale: 'Dermatoses ocupacionais.' },
  { modulo_slug: 'fgv-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-7', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.94, keep_current: true, rationale: 'Radiação não ionizante — risco ocupacional físico.' },
  { modulo_slug: 'ibade-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563875555-5', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.93, keep_current: true, rationale: 'Técnico na promoção/prevenção em saúde do trabalhador.' },
  { modulo_slug: 'ibfc-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563909811-8', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.96, keep_current: true, rationale: 'Exposição a ruído (NR-15) — saúde ocupacional.' },
  { modulo_slug: 'idecan-enfermagem-enfermagem-do-trabalho-1778712409051-6', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.97, keep_current: true, rationale: 'Ergonomia e excesso de força.' },
  { modulo_slug: 'idecan-enfermagem-enfermagem-do-trabalho-1778712409051-7', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.96, keep_current: true, rationale: 'Iluminação inadequada no trabalho.' },
  { modulo_slug: 'idecan-enfermagem-enfermagem-do-trabalho-1778712409051-8', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.97, keep_current: true, rationale: 'Causas de acidentes de trabalho.' },
  { modulo_slug: 'imparh-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-9', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.91, keep_current: true, rationale: 'Relacionamento interpessoal no trabalho — clima organizacional.' },
  { modulo_slug: 'instituto-consulplan-enfermagem-enfermagem-do-trabalho-1778967789485-2', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.95, keep_current: true, rationale: 'Patologias do trabalhador e agentes químicos.' },
  { modulo_slug: 'instituto-consulplan-enfermagem-enfermagem-do-trabalho-1778967789485-3', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.96, keep_current: true, rationale: 'PCMSO — programa de saúde ocupacional.' },
  { modulo_slug: 'instituto-consulplan-enfermagem-enfermagem-do-trabalho-1778967789485-4', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.96, keep_current: true, rationale: 'Exames do PCMSO.' },
  { modulo_slug: 'instituto-consulplan-enfermagem-enfermagem-do-trabalho-1778967789485-5', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.97, keep_current: true, rationale: 'ASO — atestado de saúde ocupacional.' },
  { modulo_slug: 'instituto-consulplan-enfermagem-enfermagem-do-trabalho-1778967789485-6', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.96, keep_current: true, rationale: 'Síndrome de Burnout — saúde mental ocupacional.' },
  { modulo_slug: 'unesc-enfermagem-enfermagem-do-trabalho-1780001297464-6', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.95, keep_current: true, rationale: 'RDC 32 e exposição a agentes biológicos.' },
  { modulo_slug: 'vunesp-enfermagem-enfermagem-do-trabalho-1778967935713-0', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.94, keep_current: true, rationale: 'Exposição radiológica em hemodinâmica.' },
  { modulo_slug: 'vunesp-enfermagem-enfermagem-do-trabalho-1778967935713-1', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.95, keep_current: true, rationale: 'Dermatose de contato em trabalhador de limpeza.' },
  { modulo_slug: 'vunesp-enfermagem-processo-de-enfermagem-1780003637054-6', suggested_subtopico: 'Urgências e Emergências', confidence: 0.94, keep_current: false, rationale: 'Respingo químico ocular — conduta de emergência imediata.' },
  { modulo_slug: 'vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-6', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.95, keep_current: true, rationale: 'NR-9 e exposições ocupacionais — já no bucket correto.' },
];

const PROCESSO: InferRow[] = [
  { modulo_slug: 'ameosc-enfermagem-processo-de-enfermagem-1780001613305-5', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.97, keep_current: true, rationale: 'Anotações de enfermagem — documentação do PE.' },
  { modulo_slug: 'avancasp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563695950-7', suggested_subtopico: 'Segurança do Paciente', confidence: 0.91, keep_current: false, rationale: 'Evolução do paciente na gestão da qualidade — NSP, não PE.' },
  { modulo_slug: 'cebraspe-cespe-enfermagem-processo-de-enfermagem-1780001790945-6', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.96, keep_current: true, rationale: 'Documentação do PE no prontuário.' },
  { modulo_slug: 'copese-uft-enfermagem-processo-de-enfermagem-1776056021381-8', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.98, keep_current: true, rationale: 'Definição e etapas do processo de enfermagem.' },
  { modulo_slug: 'cotec-fadenor-enfermagem-processo-de-enfermagem-1780010579953-0', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.95, keep_current: true, rationale: 'Registros de enfermagem no PE.' },
  { modulo_slug: 'decorp-enfermagem-processo-de-enfermagem-1776056158507-1', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.96, keep_current: true, rationale: 'Anotação de enfermagem e validade legal.' },
  { modulo_slug: 'educa-pb-enfermagem-processo-de-enfermagem-1776056149404-0', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.94, keep_current: true, rationale: 'Interação terapêutica na avaliação da dor.' },
  { modulo_slug: 'fau-unicentro-enfermagem-processo-de-enfermagem-1776056129848-3', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.93, keep_current: true, rationale: 'Diagnóstico diferencial — etapa do PE.' },
  { modulo_slug: 'fau-unicentro-enfermagem-processo-de-enfermagem-1780009366805-2', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.95, keep_current: true, rationale: 'Escala numérica da dor — avaliação no PE.' },
  { modulo_slug: 'fau-unicentro-enfermagem-processo-de-enfermagem-1780009366805-9', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.88, keep_current: true, rationale: 'Conceito de paciente hígido — terminologia em avaliação.' },
  { modulo_slug: 'fenix-instituto-enfermagem-processo-de-enfermagem-1780006480333-3', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.92, keep_current: true, rationale: 'Balanço hídrico e aceitação alimentar — monitorização no PE.' },
  { modulo_slug: 'fepese-enfermagem-processo-de-enfermagem-1776056021381-0', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.97, keep_current: true, rationale: 'Anotação de enfermagem — registro do PE.' },
  { modulo_slug: 'funatec-enfermagem-processo-de-enfermagem-1776055865890-5', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.96, keep_current: true, rationale: 'Tipos de anotação de enfermagem.' },
  { modulo_slug: 'funatec-enfermagem-processo-de-enfermagem-1776055865890-6', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.96, keep_current: true, rationale: 'Regras da anotação de enfermagem.' },
  { modulo_slug: 'funatec-enfermagem-processo-de-enfermagem-1776056173194-0', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.98, keep_current: true, rationale: 'Fase de diagnóstico do PE.' },
  { modulo_slug: 'fundatec-enfermagem-processo-de-enfermagem-1780006954613-1', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.96, keep_current: true, rationale: 'Guia COFEN de registro de enfermagem.' },
  { modulo_slug: 'fundatec-enfermagem-processo-de-enfermagem-1780011961798-0', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.91, keep_current: true, rationale: 'Anosmia na anamnese — registro no PE.' },
  { modulo_slug: 'fundepes-copeve-ufal-enfermagem-processo-de-enfermagem-1776056149404-3', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.95, keep_current: true, rationale: 'Registros de enfermagem como documento legal.' },
  { modulo_slug: 'fundepes-copeve-ufal-enfermagem-processo-de-enfermagem-1776056173194-1', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.94, keep_current: true, rationale: 'Admissão e alta — documentação de enfermagem.' },
  { modulo_slug: 'fundepes-copeve-ufal-enfermagem-processo-de-enfermagem-1776056173194-4', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.95, keep_current: true, rationale: 'Registro como ação de enfermagem.' },
  { modulo_slug: 'furb-enfermagem-processo-de-enfermagem-1780011915153-2', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.94, keep_current: true, rationale: 'Dor como 5º sinal vital — avaliação no PE.' },
  { modulo_slug: 'inaz-do-para-enfermagem-processo-de-enfermagem-1776056140199-7', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.95, keep_current: true, rationale: 'Itens essenciais no registro de enfermagem.' },
  { modulo_slug: 'inaz-do-para-enfermagem-processo-de-enfermagem-1780011947286-3', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.94, keep_current: true, rationale: 'Registro de intercorrências no prontuário.' },
  { modulo_slug: 'instituto-access-enfermagem-processo-de-enfermagem-1776056140199-2', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.95, keep_current: true, rationale: 'Anotação de enfermagem no PE.' },
  { modulo_slug: 'instituto-aocp-enfermagem-processo-de-enfermagem-1776056140199-3', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.96, keep_current: true, rationale: 'Regras de anotação de enfermagem.' },
  { modulo_slug: 'instituto-aocp-enfermagem-processo-de-enfermagem-1776056140199-4', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.96, keep_current: true, rationale: 'Participação do técnico no PE.' },
  { modulo_slug: 'instituto-aocp-enfermagem-processo-de-enfermagem-1780003868364-8', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.96, keep_current: true, rationale: 'Atribuições do técnico no PE.' },
  { modulo_slug: 'instituto-aocp-enfermagem-processo-de-enfermagem-1780005320352-9', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.96, keep_current: true, rationale: 'Técnico no PE sob supervisão.' },
  { modulo_slug: 'instituto-aocp-enfermagem-processo-de-enfermagem-1780005556782-1', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.95, keep_current: true, rationale: 'Anotações do técnico de enfermagem.' },
  { modulo_slug: 'instituto-consulpam-enfermagem-processo-de-enfermagem-1776056149404-6', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.94, keep_current: true, rationale: 'Prontuário como fonte de dados no PE.' },
  { modulo_slug: 'instituto-ibed-enfermagem-processo-de-enfermagem-1780004982901-2', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.95, keep_current: true, rationale: 'Correção em registro de enfermagem.' },
  { modulo_slug: 'ivin-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-8', suggested_subtopico: 'Segurança do Paciente', confidence: 0.93, keep_current: false, rationale: 'Escala de Fugulin — gestão/classificação de pacientes (NSP).' },
  { modulo_slug: 'objetiva-concursos-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563701860-6', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.93, keep_current: true, rationale: 'Avaliação da dor — componente do PE.' },
  { modulo_slug: 'quadrix-enfermagem-processo-de-enfermagem-1776056181857-6', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.96, keep_current: true, rationale: 'Boas práticas em anotação de enfermagem.' },
  { modulo_slug: 'ufmt-enfermagem-processo-de-enfermagem-1776055865890-2', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.94, keep_current: true, rationale: 'Anotação de enfermagem — dados processados.' },
  { modulo_slug: 'vunesp-enfermagem-processo-de-enfermagem-1776056149404-8', suggested_subtopico: 'Processo de Enfermagem', confidence: 0.97, keep_current: true, rationale: 'Atribuições do técnico nas etapas do PE.' },
];

writeInferred('artifacts/reclass/faixa-a/farmacodinamica', 'Farmacodinâmica e Farmacocinética', '01', FARMACO);
writeInferred('artifacts/reclass/faixa-b/historia-enfermagem', 'História da Enfermagem', '01', HISTORIA);
writeInferred('artifacts/reclass/faixa-c/enfermagem-trabalho', 'Enfermagem do Trabalho', '01', TRABALHO);
writeInferred('artifacts/reclass/faixa-d/processo-enfermagem', 'Processo de Enfermagem', '01', PROCESSO);
