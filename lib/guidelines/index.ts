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
import { PNI_CALENDARIO_2025 } from '@/lib/guidelines/pniCalendario';
import { PNI_INTERVALOS_2025 } from '@/lib/guidelines/pni';
import { PUNCAO_CATETER_ANVISA } from '@/lib/guidelines/puncaoVenosa';
import { SAUDE_CRIANCA_MS } from '@/lib/guidelines/saudeCrianca';
import { SAE_COFEN_358 } from '@/lib/guidelines/saeCofen';
import { SAUDE_MULHER_PRENATAL } from '@/lib/guidelines/saudeMulher';
import { SINAIS_VITAIS_ADULTO } from '@/lib/guidelines/sinaisVitais';
import { SONDAS_TECNICA_COFEN } from '@/lib/guidelines/sondas';
import { TUBERCULOSE_MS } from '@/lib/guidelines/tuberculose';
import { URGENCIAS_RCP_SBV } from '@/lib/guidelines/urgencias';
import { VIAS_ADMINISTRACAO_COFEN } from '@/lib/guidelines/viasAdministracao';
import type { GuidelineTable } from '@/lib/guidelines/types';

export type { GuidelineEntry, GuidelineTable } from '@/lib/guidelines/types';
export { mergeGuidelineTables } from '@/lib/guidelines/mergeGuidelines';
export { PNI_INTERVALOS_2025 } from '@/lib/guidelines/pni';
export { PNI_CALENDARIO_2025 } from '@/lib/guidelines/pniCalendario';
export { SINAIS_VITAIS_ADULTO } from '@/lib/guidelines/sinaisVitais';
export { URGENCIAS_RCP_SBV } from '@/lib/guidelines/urgencias';
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

/** Índice de tabelas oficiais — builders só devem usar entradas deste mapa. */
export const GUIDELINE_TABLES: Record<string, GuidelineTable> = {
  [PNI_INTERVALOS_2025.id]: PNI_INTERVALOS_2025,
  [PNI_CALENDARIO_2025.id]: PNI_CALENDARIO_2025,
  [SINAIS_VITAIS_ADULTO.id]: SINAIS_VITAIS_ADULTO,
  [URGENCIAS_RCP_SBV.id]: URGENCIAS_RCP_SBV,
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
};

/** Subtópico → uma ou mais tabelas (mescladas em runtime). */
export const SUBTOPICO_GUIDELINE_IDS: Record<string, string[]> = {
  Imunização: [PNI_INTERVALOS_2025.id, PNI_CALENDARIO_2025.id],
  'Verificação de Sinais Vitais': [SINAIS_VITAIS_ADULTO.id],
  'Urgências e Emergências': [URGENCIAS_RCP_SBV.id],
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
  'Punção Venosa e Cuidados com Cateteres': [PUNCAO_CATETER_ANVISA.id, COLETA_EXAMES_SBPC.id],
  'Infecções Sexualmente Transmissíveis (ISTs)': [ISTS_PREVENCAO_MS.id],
  'Processo de Enfermagem': [SAE_COFEN_358.id],
  'Medidas de Prevenção e Precaução de Contato': [BIOSSEGURANCA_ANVISA.id],
  'Infecções no Contexto da Biossegurança': [BIOSSEGURANCA_ANVISA.id],
  'Segurança do Paciente': [BIOSSEGURANCA_ANVISA.id],
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
    DOENCAS_VIRAIS_MS.id,
    RESPIRATORIO_CRONICO_MS.id,
    FERIDAS_QUEIMADURAS_MS.id,
  ],
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
