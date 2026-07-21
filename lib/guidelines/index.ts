import { mergeGuidelineTables } from '@/lib/guidelines/mergeGuidelines';
import { BIOSSEGURANCA_ANVISA } from '@/lib/guidelines/biosseguranca';
import { CME_ANVISA } from '@/lib/guidelines/cme';
import { CALCULO_EQUIVALENCIAS_BR } from '@/lib/guidelines/calculoMedicamentos';
import { COLETA_EXAMES_SBPC } from '@/lib/guidelines/coletaExames';
import { CURATIVOS_LPP_NPUAP } from '@/lib/guidelines/curativos';
import { CUIDADOS_ADMIN_COFEN } from '@/lib/guidelines/cuidadosMedicamentos';
import { ANATOMIA_TERMINOLOGIA } from '@/lib/guidelines/anatomiaBasica';
import { ATENCAO_BASICA_PNAB } from '@/lib/guidelines/atencaoBasica';
import { DOENCAS_VIRAIS_MS } from '@/lib/guidelines/doencasVirais';
import { EPIDEMIOLOGIA_MS } from '@/lib/guidelines/epidemiologia';
import { ENFERMAGEM_TRABALHO_NR32 } from '@/lib/guidelines/enfermagemTrabalho';
import { FARMACO_ADME_BR } from '@/lib/guidelines/farmacodinamica';
import { FISIOLOGIA_HOMEOSTASE } from '@/lib/guidelines/fisiologiaBasica';
import { FERIDAS_QUEIMADURAS_MS } from '@/lib/guidelines/feridasQueimaduras';
import { HISTORIA_ENFERMAGEM_COFEN } from '@/lib/guidelines/historiaEnfermagem';
import { ISTS_PREVENCAO_MS } from '@/lib/guidelines/ists';
import { OXIGENOTERAPIA_DISPOSITIVOS_MS } from '@/lib/guidelines/oxigenoterapia';
import { MOBILIZACAO_POSICIONAMENTO } from '@/lib/guidelines/mobilizacaoPosicionamento';
import { PARASITARIAS_ZOONOSES_MS } from '@/lib/guidelines/parasitariasZoonoses';
import { PERIOPERATORIO_CIRURGIA_SEGURA } from '@/lib/guidelines/perioperatorio';
import { PROCEDIMENTOS_DIVERSOS_ASSEPSIA } from '@/lib/guidelines/procedimentosDiversos';
import { PROMOCAO_SAUDE_SUS } from '@/lib/guidelines/promocaoSaude';
import { RESPIRATORIO_CRONICO_MS } from '@/lib/guidelines/respiratorioCronico';
import { SAUDE_ADOLESCENTE_MS } from '@/lib/guidelines/saudeAdolescente';
import { SAUDE_MENTAL_MS } from '@/lib/guidelines/saudeMental';
import { SEGURANCA_PACIENTE_PNSP } from '@/lib/guidelines/segurancaPaciente';
import { PNI_CALENDARIO_2025 } from '@/lib/guidelines/pniCalendario';
import { PNI_INTERVALOS_2025 } from '@/lib/guidelines/pni';
import { POTTER_PERRY_FUNDAMENTOS_11ED } from '@/lib/guidelines/potterPerryFundamentos';
import { PUNCAO_CATETER_ANVISA } from '@/lib/guidelines/puncaoVenosa';
import { SAUDE_CRIANCA_MS } from '@/lib/guidelines/saudeCrianca';
import { SAE_COFEN_358 } from '@/lib/guidelines/saeCofen';
import { SAUDE_MULHER_PRENATAL } from '@/lib/guidelines/saudeMulher';
import { SINAIS_VITAIS_ADULTO } from '@/lib/guidelines/sinaisVitais';
import { SONDAS_TECNICA_COFEN } from '@/lib/guidelines/sondas';
import { TUBERCULOSE_MS } from '@/lib/guidelines/tuberculose';
import { URGENCIAS_RCP_SBV } from '@/lib/guidelines/urgencias';
import { URGENCIAS_PROTOCOLOS_EMERGENCIA } from '@/lib/guidelines/urgenciasProtocolos';
import { VIAS_ADMINISTRACAO_COFEN } from '@/lib/guidelines/viasAdministracao';
import {
  PT_CLASSES_PALAVRAS,
  PT_COESAO_CONECTIVOS,
  PT_COLOCACAO_PRONOMINAL,
  PT_CONCORDANCIA,
  PT_CRASE_CONCURSOS,
  PT_DENOTACAO_CONOTACAO,
  PT_FORMACAO_PALAVRAS,
  PT_ORACOES_SUBORDINADAS,
  PT_PONTUACAO,
  PT_REGENCIA,
  PT_SINONIMOS_POLISSEMIA,
  PT_SUJEITO_PREDICADO,
  PT_TERMOS_ORACAO,
  PT_TIPOLOGIA,
  PT_VOCABULO_QUE_SE,
  PT_VERBOS,
} from '@/lib/guidelines/linguaPortuguesa';
import type { GuidelineTable } from '@/lib/guidelines/types';

export type { GuidelineEntry, GuidelineTable } from '@/lib/guidelines/types';
export { mergeGuidelineTables } from '@/lib/guidelines/mergeGuidelines';
export { PNI_INTERVALOS_2025 } from '@/lib/guidelines/pni';
export { PNI_CALENDARIO_2025 } from '@/lib/guidelines/pniCalendario';
export { SINAIS_VITAIS_ADULTO } from '@/lib/guidelines/sinaisVitais';
export { URGENCIAS_RCP_SBV } from '@/lib/guidelines/urgencias';
export { URGENCIAS_PROTOCOLOS_EMERGENCIA } from '@/lib/guidelines/urgenciasProtocolos';
export { SAUDE_MULHER_PRENATAL } from '@/lib/guidelines/saudeMulher';
export { CALCULO_EQUIVALENCIAS_BR } from '@/lib/guidelines/calculoMedicamentos';
export { OXIGENOTERAPIA_DISPOSITIVOS_MS } from '@/lib/guidelines/oxigenoterapia';
export { COLETA_EXAMES_SBPC } from '@/lib/guidelines/coletaExames';
export { CUIDADOS_ADMIN_COFEN } from '@/lib/guidelines/cuidadosMedicamentos';
export { SAUDE_CRIANCA_MS } from '@/lib/guidelines/saudeCrianca';
export { FARMACO_ADME_BR } from '@/lib/guidelines/farmacodinamica';
export { VIAS_ADMINISTRACAO_COFEN } from '@/lib/guidelines/viasAdministracao';
export { CURATIVOS_LPP_NPUAP } from '@/lib/guidelines/curativos';
export { SONDAS_TECNICA_COFEN } from '@/lib/guidelines/sondas';
export { POTTER_PERRY_FUNDAMENTOS_11ED } from '@/lib/guidelines/potterPerryFundamentos';
export { PUNCAO_CATETER_ANVISA } from '@/lib/guidelines/puncaoVenosa';
export { ISTS_PREVENCAO_MS } from '@/lib/guidelines/ists';
export { BIOSSEGURANCA_ANVISA } from '@/lib/guidelines/biosseguranca';
export { SAE_COFEN_358 } from '@/lib/guidelines/saeCofen';
export { DOENCAS_VIRAIS_MS } from '@/lib/guidelines/doencasVirais';
export { TUBERCULOSE_MS } from '@/lib/guidelines/tuberculose';
export { CME_ANVISA } from '@/lib/guidelines/cme';
export { PERIOPERATORIO_CIRURGIA_SEGURA } from '@/lib/guidelines/perioperatorio';
export { EPIDEMIOLOGIA_MS } from '@/lib/guidelines/epidemiologia';
export { HISTORIA_ENFERMAGEM_COFEN } from '@/lib/guidelines/historiaEnfermagem';
export { ANATOMIA_TERMINOLOGIA } from '@/lib/guidelines/anatomiaBasica';
export { FISIOLOGIA_HOMEOSTASE } from '@/lib/guidelines/fisiologiaBasica';
export { PROCEDIMENTOS_DIVERSOS_ASSEPSIA } from '@/lib/guidelines/procedimentosDiversos';
export { PROMOCAO_SAUDE_SUS } from '@/lib/guidelines/promocaoSaude';
export { ENFERMAGEM_TRABALHO_NR32 } from '@/lib/guidelines/enfermagemTrabalho';
export { SAUDE_ADOLESCENTE_MS } from '@/lib/guidelines/saudeAdolescente';
export { PARASITARIAS_ZOONOSES_MS } from '@/lib/guidelines/parasitariasZoonoses';
export { FERIDAS_QUEIMADURAS_MS } from '@/lib/guidelines/feridasQueimaduras';
export { MOBILIZACAO_POSICIONAMENTO } from '@/lib/guidelines/mobilizacaoPosicionamento';
export { ATENCAO_BASICA_PNAB } from '@/lib/guidelines/atencaoBasica';
export { RESPIRATORIO_CRONICO_MS } from '@/lib/guidelines/respiratorioCronico';
export { SAUDE_MENTAL_MS } from '@/lib/guidelines/saudeMental';
export { SEGURANCA_PACIENTE_PNSP } from '@/lib/guidelines/segurancaPaciente';
export {
  PT_CLASSES_PALAVRAS,
  PT_COESAO_CONECTIVOS,
  PT_COLOCACAO_PRONOMINAL,
  PT_CONCORDANCIA,
  PT_CRASE_CONCURSOS,
  PT_DENOTACAO_CONOTACAO,
  PT_FORMACAO_PALAVRAS,
  PT_ORACOES_SUBORDINADAS,
  PT_PONTUACAO,
  PT_REGENCIA,
  PT_SINONIMOS_POLISSEMIA,
  PT_SUJEITO_PREDICADO,
  PT_TERMOS_ORACAO,
  PT_TIPOLOGIA,
  PT_VOCABULO_QUE_SE,
  PT_VERBOS,
  getLinguaPortuguesaGuidelineP0,
  getLinguaPortuguesaGuidelineP1,
  getLinguaPortuguesaGuidelineP2,
  getLinguaPortuguesaGuidelineP3,
  getLinguaPortuguesaGuidelineAll,
} from '@/lib/guidelines/linguaPortuguesa';

/** Índice de tabelas oficiais — builders só devem usar entradas deste mapa. */
export const GUIDELINE_TABLES: Record<string, GuidelineTable> = {
  [PNI_INTERVALOS_2025.id]: PNI_INTERVALOS_2025,
  [PNI_CALENDARIO_2025.id]: PNI_CALENDARIO_2025,
  [SINAIS_VITAIS_ADULTO.id]: SINAIS_VITAIS_ADULTO,
  [URGENCIAS_RCP_SBV.id]: URGENCIAS_RCP_SBV,
  [URGENCIAS_PROTOCOLOS_EMERGENCIA.id]: URGENCIAS_PROTOCOLOS_EMERGENCIA,
  [SAUDE_MULHER_PRENATAL.id]: SAUDE_MULHER_PRENATAL,
  [CALCULO_EQUIVALENCIAS_BR.id]: CALCULO_EQUIVALENCIAS_BR,
  [OXIGENOTERAPIA_DISPOSITIVOS_MS.id]: OXIGENOTERAPIA_DISPOSITIVOS_MS,
  [COLETA_EXAMES_SBPC.id]: COLETA_EXAMES_SBPC,
  [CUIDADOS_ADMIN_COFEN.id]: CUIDADOS_ADMIN_COFEN,
  [SAUDE_CRIANCA_MS.id]: SAUDE_CRIANCA_MS,
  [FARMACO_ADME_BR.id]: FARMACO_ADME_BR,
  [VIAS_ADMINISTRACAO_COFEN.id]: VIAS_ADMINISTRACAO_COFEN,
  [CURATIVOS_LPP_NPUAP.id]: CURATIVOS_LPP_NPUAP,
  [SONDAS_TECNICA_COFEN.id]: SONDAS_TECNICA_COFEN,
  [PUNCAO_CATETER_ANVISA.id]: PUNCAO_CATETER_ANVISA,
  [POTTER_PERRY_FUNDAMENTOS_11ED.id]: POTTER_PERRY_FUNDAMENTOS_11ED,
  [ISTS_PREVENCAO_MS.id]: ISTS_PREVENCAO_MS,
  [BIOSSEGURANCA_ANVISA.id]: BIOSSEGURANCA_ANVISA,
  [SAE_COFEN_358.id]: SAE_COFEN_358,
  [DOENCAS_VIRAIS_MS.id]: DOENCAS_VIRAIS_MS,
  [TUBERCULOSE_MS.id]: TUBERCULOSE_MS,
  [CME_ANVISA.id]: CME_ANVISA,
  [PERIOPERATORIO_CIRURGIA_SEGURA.id]: PERIOPERATORIO_CIRURGIA_SEGURA,
  [EPIDEMIOLOGIA_MS.id]: EPIDEMIOLOGIA_MS,
  [ATENCAO_BASICA_PNAB.id]: ATENCAO_BASICA_PNAB,
  [RESPIRATORIO_CRONICO_MS.id]: RESPIRATORIO_CRONICO_MS,
  [SAUDE_MENTAL_MS.id]: SAUDE_MENTAL_MS,
  [SEGURANCA_PACIENTE_PNSP.id]: SEGURANCA_PACIENTE_PNSP,
  [PROMOCAO_SAUDE_SUS.id]: PROMOCAO_SAUDE_SUS,
  [ENFERMAGEM_TRABALHO_NR32.id]: ENFERMAGEM_TRABALHO_NR32,
  [SAUDE_ADOLESCENTE_MS.id]: SAUDE_ADOLESCENTE_MS,
  [PARASITARIAS_ZOONOSES_MS.id]: PARASITARIAS_ZOONOSES_MS,
  [FERIDAS_QUEIMADURAS_MS.id]: FERIDAS_QUEIMADURAS_MS,
  [MOBILIZACAO_POSICIONAMENTO.id]: MOBILIZACAO_POSICIONAMENTO,
  [HISTORIA_ENFERMAGEM_COFEN.id]: HISTORIA_ENFERMAGEM_COFEN,
  [ANATOMIA_TERMINOLOGIA.id]: ANATOMIA_TERMINOLOGIA,
  [FISIOLOGIA_HOMEOSTASE.id]: FISIOLOGIA_HOMEOSTASE,
  [PROCEDIMENTOS_DIVERSOS_ASSEPSIA.id]: PROCEDIMENTOS_DIVERSOS_ASSEPSIA,
  [PT_CRASE_CONCURSOS.id]: PT_CRASE_CONCURSOS,
  [PT_COLOCACAO_PRONOMINAL.id]: PT_COLOCACAO_PRONOMINAL,
  [PT_PONTUACAO.id]: PT_PONTUACAO,
  [PT_CONCORDANCIA.id]: PT_CONCORDANCIA,
  [PT_REGENCIA.id]: PT_REGENCIA,
  [PT_TERMOS_ORACAO.id]: PT_TERMOS_ORACAO,
  [PT_ORACOES_SUBORDINADAS.id]: PT_ORACOES_SUBORDINADAS,
  [PT_TIPOLOGIA.id]: PT_TIPOLOGIA,
  [PT_SUJEITO_PREDICADO.id]: PT_SUJEITO_PREDICADO,
  [PT_CLASSES_PALAVRAS.id]: PT_CLASSES_PALAVRAS,
  [PT_FORMACAO_PALAVRAS.id]: PT_FORMACAO_PALAVRAS,
  [PT_VERBOS.id]: PT_VERBOS,
  [PT_COESAO_CONECTIVOS.id]: PT_COESAO_CONECTIVOS,
  [PT_SINONIMOS_POLISSEMIA.id]: PT_SINONIMOS_POLISSEMIA,
  [PT_DENOTACAO_CONOTACAO.id]: PT_DENOTACAO_CONOTACAO,
  [PT_VOCABULO_QUE_SE.id]: PT_VOCABULO_QUE_SE,
};

/** Subtópico → uma ou mais tabelas (mescladas em runtime). */
export const SUBTOPICO_GUIDELINE_IDS: Record<string, string[]> = {
  Imunização: [PNI_INTERVALOS_2025.id, PNI_CALENDARIO_2025.id],
  'Verificação de Sinais Vitais': [SINAIS_VITAIS_ADULTO.id],
  'Urgências e Emergências': [URGENCIAS_RCP_SBV.id, URGENCIAS_PROTOCOLOS_EMERGENCIA.id],
  'Saúde da Mulher': [SAUDE_MULHER_PRENATAL.id],
  'Cálculo de Administração de Medicamentos e Infusões': [CALCULO_EQUIVALENCIAS_BR.id],
  'Oxigenoterapia e Cuidados Respiratórios': [OXIGENOTERAPIA_DISPOSITIVOS_MS.id],
  'Coleta de Exames Laboratoriais': [COLETA_EXAMES_SBPC.id],
  'Cuidados na Administração de Medicamentos': [CUIDADOS_ADMIN_COFEN.id],
  'Saúde da Criança': [SAUDE_CRIANCA_MS.id, SINAIS_VITAIS_ADULTO.id],
  'Farmacodinâmica e Farmacocinética': [FARMACO_ADME_BR.id],
  'Vias de Administração': [VIAS_ADMINISTRACAO_COFEN.id, CUIDADOS_ADMIN_COFEN.id],
  'Curativos e Manejo de Feridas': [CURATIVOS_LPP_NPUAP.id],
  'Instalação e Manejo de Sondas': [SONDAS_TECNICA_COFEN.id],
  'Punção Venosa e Cuidados com Cateteres': [
    PUNCAO_CATETER_ANVISA.id,
    SAE_COFEN_358.id,
    POTTER_PERRY_FUNDAMENTOS_11ED.id,
  ],
  'Infecções Sexualmente Transmissíveis (ISTs)': [ISTS_PREVENCAO_MS.id],
  'Processo de Enfermagem': [SAE_COFEN_358.id],
  'Medidas de Prevenção e Precaução de Contato': [BIOSSEGURANCA_ANVISA.id],
  'Infecções no Contexto da Biossegurança': [BIOSSEGURANCA_ANVISA.id],
  'Segurança do Paciente': [SEGURANCA_PACIENTE_PNSP.id, BIOSSEGURANCA_ANVISA.id],
  'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)': [
    DOENCAS_VIRAIS_MS.id,
    PNI_CALENDARIO_2025.id,
  ],
  'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)': [
    TUBERCULOSE_MS.id,
    BIOSSEGURANCA_ANVISA.id,
  ],
  'Processamento de Artigos e Produtos de Saúde': [CME_ANVISA.id],
  'Enfermagem em Central de Material e Esterilização (CME)': [CME_ANVISA.id],
  'Assistência Perioperatória (Inclui SRPA)': [PERIOPERATORIO_CIRURGIA_SEGURA.id],
  'Enfermagem em Centro Cirúrgico': [PERIOPERATORIO_CIRURGIA_SEGURA.id],
  'Epidemiologia e Vigilância Epidemiológica': [EPIDEMIOLOGIA_MS.id, PNI_CALENDARIO_2025.id],
  'Atenção Básica / Saúde da Família': [ATENCAO_BASICA_PNAB.id],
  'Doenças Respiratórias Crônicas (Asma, DPOC)': [
    RESPIRATORIO_CRONICO_MS.id,
    OXIGENOTERAPIA_DISPOSITIVOS_MS.id,
  ],
  'Saúde Mental': [SAUDE_MENTAL_MS.id],
  'Promoção à Saúde e Prevenção de Agravos': [PROMOCAO_SAUDE_SUS.id],
  'Enfermagem do Trabalho': [ENFERMAGEM_TRABALHO_NR32.id],
  'Saúde do Adolescente': [SAUDE_ADOLESCENTE_MS.id],
  'Doenças Parasitárias e Zoonoses': [PARASITARIAS_ZOONOSES_MS.id],
  'Feridas e Queimaduras': [FERIDAS_QUEIMADURAS_MS.id, CURATIVOS_LPP_NPUAP.id],
  'Mobilização e Posicionamento do Paciente': [MOBILIZACAO_POSICIONAMENTO.id, CURATIVOS_LPP_NPUAP.id],
  'História da Enfermagem': [HISTORIA_ENFERMAGEM_COFEN.id],
  'Noções de Anatomia': [ANATOMIA_TERMINOLOGIA.id],
  'Noções de Fisiologia': [FISIOLOGIA_HOMEOSTASE.id, SINAIS_VITAIS_ADULTO.id],
  'Procedimentos Diversos': [PROCEDIMENTOS_DIVERSOS_ASSEPSIA.id, BIOSSEGURANCA_ANVISA.id],
  'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis': [
    DOENCAS_VIRAIS_MS.id,
    TUBERCULOSE_MS.id,
    PARASITARIAS_ZOONOSES_MS.id,
    ISTS_PREVENCAO_MS.id,
    BIOSSEGURANCA_ANVISA.id,
  ],
  'Questões Mescladas e Outras Doenças Agudas': [
    URGENCIAS_RCP_SBV.id,
    URGENCIAS_PROTOCOLOS_EMERGENCIA.id,
    DOENCAS_VIRAIS_MS.id,
    RESPIRATORIO_CRONICO_MS.id,
    FERIDAS_QUEIMADURAS_MS.id,
  ],
  /** Conhecimentos Básicos — fora dos 41 de Enfermagem; cards PT (17 cards) */
  'Língua Portuguesa': [
    PT_CRASE_CONCURSOS.id,
    PT_COLOCACAO_PRONOMINAL.id,
    PT_PONTUACAO.id,
    PT_CONCORDANCIA.id,
    PT_REGENCIA.id,
    PT_TERMOS_ORACAO.id,
    PT_ORACOES_SUBORDINADAS.id,
    PT_TIPOLOGIA.id,
    PT_SUJEITO_PREDICADO.id,
    PT_CLASSES_PALAVRAS.id,
    PT_FORMACAO_PALAVRAS.id,
    PT_VERBOS.id,
    PT_COESAO_CONECTIVOS.id,
    PT_SINONIMOS_POLISSEMIA.id,
    PT_DENOTACAO_CONOTACAO.id,
    PT_VOCABULO_QUE_SE.id,
  ],
  Crase: [PT_CRASE_CONCURSOS.id],
  'Pronomes e colocação pronominal': [PT_COLOCACAO_PRONOMINAL.id],
  Pontuação: [PT_PONTUACAO.id],
  'Concordância verbal e nominal': [PT_CONCORDANCIA.id],
  'Regência verbal e nominal': [PT_REGENCIA.id],
  'Termos da oração': [PT_TERMOS_ORACAO.id],
  'Orações coordenadas e subordinadas': [PT_ORACOES_SUBORDINADAS.id],
  'Tipologia e gêneros textuais': [PT_TIPOLOGIA.id],
  'Coesão, coerência e conectivos': [PT_COESAO_CONECTIVOS.id],
  'Classes de palavras': [PT_CLASSES_PALAVRAS.id, PT_FORMACAO_PALAVRAS.id],
  'Verbos — tempos, modos e vozes': [PT_VERBOS.id],
  'Frase, oração e período': [PT_SUJEITO_PREDICADO.id],
  'Sujeito e predicado': [PT_SUJEITO_PREDICADO.id],
  'Sintaxe — questões mescladas': [
    PT_SUJEITO_PREDICADO.id,
    PT_TERMOS_ORACAO.id,
    PT_ORACOES_SUBORDINADAS.id,
  ],
  'Sinônimos, antônimos e polissemia': [PT_SINONIMOS_POLISSEMIA.id],
  'Denotação, conotação e figuras de linguagem': [PT_DENOTACAO_CONOTACAO.id],
  'Vocábulo "que" e partícula "se"': [PT_VOCABULO_QUE_SE.id],
};

export function getGuidelineTablesForSubtopico(subtopico: string): GuidelineTable[] {
  const ids = SUBTOPICO_GUIDELINE_IDS[subtopico.trim()];
  if (!ids?.length) return [];
  return ids.map((id) => GUIDELINE_TABLES[id]).filter((t): t is GuidelineTable => Boolean(t));
}

export function getGuidelineForSubtopico(subtopico: string): GuidelineTable | null {
  return mergeGuidelineTables(getGuidelineTablesForSubtopico(subtopico));
}

export function getGuidelineTable(id: string): GuidelineTable | undefined {
  return GUIDELINE_TABLES[id];
}

export function getGuidelineEntry(tableId: string, entryId: string) {
  const table = GUIDELINE_TABLES[tableId];
  return table?.entries.find((e) => e.id === entryId);
}
