#!/usr/bin/env tsx
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
  writeFileSync(
    resolve(process.cwd(), `${outDir}/batch-${batch}-inferred.json`),
    JSON.stringify({ batch, bucket, inferences: rows }, null, 2) + '\n',
  );
  const moves = rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
  console.log(`${bucket}: ${rows.length} scanned, ${moves} moves`);
}

const ADOLESCENTE: InferRow[] = [
  'agirh-enfermagem-saude-do-adolescente-1777104229064-4',
  'amauc-enfermagem-saude-do-adolescente-1777104229064-5',
  'amauc-enfermagem-saude-do-adolescente-1777104229064-6',
  'cogeps-unioeste-enfermagem-saude-do-adolescente-1777104229064-7',
  'fau-unicentro-enfermagem-saude-do-adolescente-1777104229064-3',
  'funcern-enfermagem-saude-do-adolescente-1777104229064-1',
  'ideap-enfermagem-saude-do-adolescente-1777104229064-2',
  'idecan-enfermagem-saude-do-adolescente-1778712426701-6',
  'idecan-enfermagem-saude-do-adolescente-1778712426701-7',
  'idecan-enfermagem-saude-do-adolescente-1778712426701-8',
  'nao-informado-geral-saude-do-adolescente-1777104229064-0',
].map((slug) => ({
  modulo_slug: slug,
  suggested_subtopico: 'Saúde do Adolescente',
  confidence: 0.95,
  keep_current: true,
  rationale: 'Tema central em saúde do adolescente (gravidez, TAs, violência, diretrizes).',
}));

const FERIDAS: InferRow[] = [
  { modulo_slug: 'avancasp-enfermagem-processo-de-enfermagem-1780011872350-0', suggested_subtopico: 'Feridas e Queimaduras', confidence: 0.95, keep_current: true, rationale: 'Orientação em queimadura.' },
  { modulo_slug: 'icece-enfermagem-feridas-e-queimaduras-1780001297464-5', suggested_subtopico: 'Feridas e Queimaduras', confidence: 0.96, keep_current: true, rationale: 'Queimadura térmica e extensão corporal.' },
  { modulo_slug: 'idecan-enfermagem-feridas-e-queimaduras-1778712409051-1', suggested_subtopico: 'Curativos e Manejo de Feridas', confidence: 0.91, keep_current: false, rationale: 'SF 0,9% no curativo — técnica de cobertura em curativos.' },
  { modulo_slug: 'idecan-enfermagem-feridas-e-queimaduras-1778712409051-2', suggested_subtopico: 'Curativos e Manejo de Feridas', confidence: 0.9, keep_current: false, rationale: 'Curativo de carvão ativado com prata — escolha de cobertura.' },
  { modulo_slug: 'idecan-enfermagem-feridas-e-queimaduras-1778712409051-3', suggested_subtopico: 'Curativos e Manejo de Feridas', confidence: 0.91, keep_current: false, rationale: 'Curativo de alginato — manejo de feridas com exsudato.' },
  { modulo_slug: 'idecan-enfermagem-feridas-e-queimaduras-1780067013432-7', suggested_subtopico: 'Feridas e Queimaduras', confidence: 0.95, keep_current: true, rationale: 'Classificação de feridas.' },
  { modulo_slug: 'idecan-enfermagem-feridas-e-queimaduras-1780067013432-8', suggested_subtopico: 'Feridas e Queimaduras', confidence: 0.94, keep_current: true, rationale: 'Tratamento individualizado de feridas.' },
  { modulo_slug: 'idecan-enfermagem-feridas-e-queimaduras-1780067013432-9', suggested_subtopico: 'Feridas e Queimaduras', confidence: 0.93, keep_current: true, rationale: 'Procedimento de curativo em lesões.' },
  { modulo_slug: 'idib-enfermagem-feridas-e-queimaduras-1778934936220-2', suggested_subtopico: 'Feridas e Queimaduras', confidence: 0.97, keep_current: true, rationale: 'Queimaduras extensas na emergência.' },
  { modulo_slug: 'instituto-aocp-enfermagem-processo-de-enfermagem-1780004272097-0', suggested_subtopico: 'Feridas e Queimaduras', confidence: 0.97, keep_current: true, rationale: 'SCQ e extensão de queimadura.' },
  { modulo_slug: 'ms-sarmento-enfermagem-processo-de-enfermagem-1780008225255-1', suggested_subtopico: 'Feridas e Queimaduras', confidence: 0.96, keep_current: true, rationale: 'Regra dos 9 em queimaduras.' },
  { modulo_slug: 'quadrix-enfermagem-feridas-e-queimaduras-1780001297464-4', suggested_subtopico: 'Curativos e Manejo de Feridas', confidence: 0.94, keep_current: false, rationale: 'Prevenção de LPP — núcleo de curativos, não queimaduras.' },
];

const DRC: InferRow[] = [
  { modulo_slug: 'idecan-geral-doencas-respiratorias-cronicas-asma-dpoc-1776056348175-7', suggested_subtopico: 'Doenças Respiratórias Crônicas (Asma, DPOC)', confidence: 0.98, keep_current: true, rationale: 'Asma grave e broncodilatadores — DRC respiratória.' },
  { modulo_slug: 'idib-enfermagem-outras-questoes-e-questoes-mescladas-sobre-doencas-cronicas-nao-transmissiveis-1778934918280-5', suggested_subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis', confidence: 0.94, keep_current: false, rationale: 'Afirmativas sobre DCNT em geral (HAS), não asma/DPOC.' },
];

const PROCESSAMENTO: InferRow[] = [
  { modulo_slug: 'ameosc-enfermagem-processo-de-enfermagem-1780011961798-9', suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde', confidence: 0.92, keep_current: true, rationale: 'Limpeza e desinfecção em ambulância — processamento.' },
  { modulo_slug: 'avancasp-enfermagem-processo-de-enfermagem-1780003031246-7', suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde', confidence: 0.95, keep_current: true, rationale: 'Material estéril — processamento.' },
  { modulo_slug: 'idecan-enfermagem-processamento-de-artigos-e-produtos-de-saude-1778712203076-5', suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde', confidence: 0.97, keep_current: true, rationale: 'Indicadores biológicos de esterilização.' },
  { modulo_slug: 'idecan-enfermagem-processamento-de-artigos-e-produtos-de-saude-1778712203076-6', suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde', confidence: 0.98, keep_current: true, rationale: 'Definição de produto estéril.' },
  { modulo_slug: 'idecan-enfermagem-processamento-de-artigos-e-produtos-de-saude-1778712203076-7', suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde', confidence: 0.96, keep_current: true, rationale: 'Criticidade de artigos para saúde.' },
  { modulo_slug: 'idecan-enfermagem-seguranca-do-paciente-1778712220716-7', suggested_subtopico: 'Enfermagem em Centro Cirúrgico', confidence: 0.91, keep_current: false, rationale: 'Hamper cirúrgico — centro cirúrgico, não processamento geral.' },
  { modulo_slug: 'instituto-verbena-enfermagem-processo-de-enfermagem-1780009303038-5', suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde', confidence: 0.93, keep_current: true, rationale: 'Classificação de equipamentos por contaminação.' },
  { modulo_slug: 'legalle-enfermagem-processo-de-enfermagem-1780011879977-7', suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde', confidence: 0.92, keep_current: true, rationale: 'Artigos hospitalares — processamento.' },
  { modulo_slug: 'unifil-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563718396-2', suggested_subtopico: 'Segurança do Paciente', confidence: 0.9, keep_current: false, rationale: 'Manutenção de equipamentos — gestão da qualidade/NSP.' },
];

writeInferred('artifacts/reclass/faixa-b/saude-adolescente', 'Saúde do Adolescente', '01', ADOLESCENTE);
writeInferred('artifacts/reclass/faixa-b/feridas-queimaduras', 'Feridas e Queimaduras', '01', FERIDAS);
writeInferred('artifacts/reclass/faixa-a/drc', 'Doenças Respiratórias Crônicas (Asma, DPOC)', '01', DRC);
writeInferred('artifacts/reclass/faixa-a/processamento-artigos', 'Processamento de Artigos e Produtos de Saúde', '01', PROCESSAMENTO);
