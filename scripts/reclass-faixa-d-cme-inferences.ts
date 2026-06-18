#!/usr/bin/env tsx
/** Classificações agente — CME (faixa D, wave 4). */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const BUCKET = 'Enfermagem em Central de Material e Esterilização (CME)';
const OUT = 'artifacts/reclass/faixa-d/cme';

const ROWS: InferRow[] = [
  { modulo_slug: 'amauc-enfermagem-processo-de-enfermagem-1780001440222-4', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Restrições de embalagem no esterilizador por plasma de peróxido.' },
  { modulo_slug: 'ameosc-enfermagem-processo-de-enfermagem-1780001613305-2', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Conceitos e métodos de esterilização de materiais em saúde.' },
  { modulo_slug: 'ameosc-enfermagem-processo-de-enfermagem-1780005791580-0', suggested_subtopico: BUCKET, confidence: 0.91, keep_current: true, rationale: 'V/F mescla biossegurança e esterilização sem tema dominante único.' },
  { modulo_slug: 'avancasp-enfermagem-processo-de-enfermagem-1780002714111-7', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Manuseio de material estéril com técnica asséptica.' },
  { modulo_slug: 'avancasp-enfermagem-processo-de-enfermagem-1780006444165-8', suggested_subtopico: 'Infecções no Contexto da Biossegurança', confidence: 0.92, keep_current: false, rationale: 'Distinção antissepsia em tecidos vivos no controle de infecção.' },
  { modulo_slug: 'avancasp-enfermagem-processo-de-enfermagem-1780011872350-4', suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde', confidence: 0.95, keep_current: false, rationale: 'Etapa de limpeza no processamento de produtos para saúde.' },
  { modulo_slug: 'cetrede-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-8', suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos', confidence: 0.96, keep_current: false, rationale: 'Legislação e direitos do planejamento familiar.' },
  { modulo_slug: 'cotec-fadenor-enfermagem-processo-de-enfermagem-1780002389285-8', suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde', confidence: 0.95, keep_current: false, rationale: 'Definição de limpeza na cadeia de processamento de materiais.' },
  { modulo_slug: 'fafipa-enfermagem-processo-de-enfermagem-1780009392850-3', suggested_subtopico: 'Saúde da Mulher', confidence: 0.97, keep_current: false, rationale: 'Critérios legais para laqueadura e vasectomia contraceptiva.' },
  { modulo_slug: 'fau-unicentro-enfermagem-processo-de-enfermagem-1780002217274-9', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Indicadores químicos e biológicos nas etapas da CME.' },
  { modulo_slug: 'fau-unicentro-enfermagem-processo-de-enfermagem-1780009379028-5', suggested_subtopico: BUCKET, confidence: 0.98, keep_current: true, rationale: 'Sigla CME — letra E de Esterilização.' },
  { modulo_slug: 'fcpc-enfermagem-processo-de-enfermagem-1780004906875-3', suggested_subtopico: 'Enfermagem em Centro Cirúrgico', confidence: 0.92, keep_current: false, rationale: 'Indicador de esterilização conferido pelo instrumentador na mesa cirúrgica.' },
  { modulo_slug: 'fcpc-enfermagem-processo-de-enfermagem-1780004906875-5', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Classificação de Spaulding e processamento de ventiladores na CME.' },
  { modulo_slug: 'fcpc-enfermagem-processo-de-enfermagem-1780004906875-6', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Desinfecção de artigos no fluxo do CME.' },
  { modulo_slug: 'fcpc-enfermagem-processo-de-enfermagem-1780004906875-7', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Indicadores de limpeza na etapa de processamento do CME.' },
  { modulo_slug: 'fcpc-enfermagem-processo-de-enfermagem-1780004906875-8', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Atribuições do técnico de enfermagem no CME.' },
  { modulo_slug: 'fenix-instituto-enfermagem-processo-de-enfermagem-1780001846202-3', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Autoclavação — vapor sob pressão na esterilização.' },
  { modulo_slug: 'fenix-instituto-enfermagem-processo-de-enfermagem-1780006471061-1', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Esterilização por calor úmido em autoclave.' },
  { modulo_slug: 'fenix-instituto-enfermagem-processo-de-enfermagem-1780006480333-4', suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde', confidence: 0.95, keep_current: false, rationale: 'Distinção conceitual entre desinfecção e esterilização.' },
  { modulo_slug: 'ibade-enfermagem-processo-de-enfermagem-1780005137458-8', suggested_subtopico: 'Infecções no Contexto da Biossegurança', confidence: 0.92, keep_current: false, rationale: 'Falhas de asepsia e reprocessamento na unidade de internação.' },
  { modulo_slug: 'icece-enfermagem-enfermagem-em-central-de-material-e-esterilizacao-cme-1780001220945-2', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Princípios técnicos do processamento de materiais na CME.' },
  { modulo_slug: 'idecan-enfermagem-enfermagem-em-central-de-material-e-esterilizacao-cme-1778712381105-2', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Protocolo de processamento de artigos na CME.' },
  { modulo_slug: 'idecan-enfermagem-enfermagem-em-central-de-material-e-esterilizacao-cme-1778712381105-3', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Papel do enfermeiro RT na CME.' },
  { modulo_slug: 'idecan-enfermagem-enfermagem-em-central-de-material-e-esterilizacao-cme-1778712381105-4', suggested_subtopico: 'Infecções no Contexto da Biossegurança', confidence: 0.91, keep_current: false, rationale: 'Limpeza terminal/concorrente no controle de infecção hospitalar.' },
  { modulo_slug: 'idecan-enfermagem-enfermagem-em-central-de-material-e-esterilizacao-cme-1778712381105-5', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Limpeza ultrassônica de instrumentais na CME.' },
  { modulo_slug: 'idecan-enfermagem-enfermagem-em-central-de-material-e-esterilizacao-cme-1778712381105-6', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Conduta incorreta no manuseio da autoclave.' },
  { modulo_slug: 'idecan-enfermagem-enfermagem-em-central-de-material-e-esterilizacao-cme-1778712381105-7', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Função da CME e níveis de desinfecção.' },
  { modulo_slug: 'idecan-enfermagem-enfermagem-em-central-de-material-e-esterilizacao-cme-1780067013432-0', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Normas de embalagem e rotulagem na CME.' },
  { modulo_slug: 'idecan-enfermagem-enfermagem-em-central-de-material-e-esterilizacao-cme-1780067013432-1', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Classificação dos indicadores químicos de esterilização.' },
  { modulo_slug: 'idib-enfermagem-enfermagem-em-central-de-material-e-esterilizacao-cme-1778934918280-9', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Classificação Spaulding de artigos críticos na CME.' },
  { modulo_slug: 'igecap-enfermagem-processo-de-enfermagem-1780004293191-5', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Autoclave como método de calor úmido sob pressão.' },
  { modulo_slug: 'igeduc-enfermagem-enfermagem-em-central-de-material-e-esterilizacao-cme-1780001220945-1', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'V/F sobre limpeza, desinfecção e esterilização na APS.' },
  { modulo_slug: 'igeduc-enfermagem-enfermagem-em-central-de-material-e-esterilizacao-cme-1780001220945-3', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Princípios de esterilização e EPI no processamento.' },
  { modulo_slug: 'instituto-aocp-enfermagem-processo-de-enfermagem-1780004272097-4', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Classificação de risco Spaulding no processamento da CME.' },
  { modulo_slug: 'instituto-aocp-enfermagem-processo-de-enfermagem-1780005556782-0', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Registro de indicadores físicos a cada ciclo de esterilização.' },
  { modulo_slug: 'instituto-iacp-enfermagem-processo-de-enfermagem-1780001903454-7', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Princípio termodinâmico da autoclave hospitalar.' },
  { modulo_slug: 'instituto-iacp-enfermagem-processo-de-enfermagem-1780003349182-4', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Artigos críticos exigem esterilização na CME.' },
  { modulo_slug: 'instituto-iacp-enfermagem-processo-de-enfermagem-1780004280851-1', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Parâmetros padrão de temperatura e pressão na autoclave.' },
  { modulo_slug: 'instituto-ibed-enfermagem-processo-de-enfermagem-1780004917460-7', suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde', confidence: 0.95, keep_current: false, rationale: 'Desinfecção de alto nível não é sinônimo de esterilização.' },
  { modulo_slug: 'quadrix-enfermagem-enfermagem-em-central-de-material-e-esterilizacao-cme-1780001220945-0', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Infraestrutura mínima da CME classe II.' },
  { modulo_slug: 'quadrix-enfermagem-processo-de-enfermagem-1780009281546-8', suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde', confidence: 0.94, keep_current: false, rationale: 'Limpeza não substitui desinfecção ou esterilização.' },
  { modulo_slug: 'quadrix-enfermagem-processo-de-enfermagem-1780009281546-9', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Esterilização obrigatória para materiais críticos.' },
  { modulo_slug: 'vunesp-enfermagem-processo-de-enfermagem-1780003637054-4', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Reprocessamento segundo classificação de Spaulding.' },
];

function writeInferred(batch: string, rows: InferRow[]) {
  const rel = `${OUT}/batch-${batch}-inferred.json`;
  writeFileSync(
    resolve(process.cwd(), rel),
    JSON.stringify({ batch, bucket: BUCKET, inferences: rows }, null, 2) + '\n',
  );
  const moves = rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
  console.log(`${BUCKET}: ${rows.length} scanned, ${moves} moves (>=0.90)`);
}

writeInferred('01', ROWS);
