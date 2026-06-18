#!/usr/bin/env tsx
/** Classificações agente — Infecções no Contexto da Biossegurança (faixa D). */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const BUCKET = 'Infecções no Contexto da Biossegurança';
const OUT = 'artifacts/reclass/faixa-d/infeccoes-biosseguranca';

const ROWS: InferRow[] = [
  { modulo_slug: 'ameosc-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102785845-2', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Conceitos e controle de infecções hospitalares (IRAS).' },
  { modulo_slug: 'avancasp-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102719125-2', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Higienização das mãos e prevenção de IRAS (itens I–III).' },
  { modulo_slug: 'avancasp-enfermagem-processo-de-enfermagem-1780002834059-7', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Diretrizes de higiene e prevenção de infecção hospitalar.' },
  { modulo_slug: 'cebraspe-cespe-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102785845-8', suggested_subtopico: 'Cuidados na Administração de Medicamentos', confidence: 0.91, keep_current: false, rationale: 'Descarte de parenterais abertos após emergência — protocolo de administração segura.' },
  { modulo_slug: 'cetrede-enfermagem-assistencia-perioperatoria-inclui-srpa-1777103796215-1', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Classificação de área crítica e risco de IRAS no hospital.' },
  { modulo_slug: 'cetrede-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102719125-8', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Definição e princípios de biossegurança e contenção biológica.' },
  { modulo_slug: 'cetrede-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102785845-1', suggested_subtopico: 'Coleta de Exames Laboratoriais', confidence: 0.92, keep_current: false, rationale: 'Técnica de coleta e encaminhamento de escarro para TB.' },
  { modulo_slug: 'cogeps-unioeste-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102719125-9', suggested_subtopico: BUCKET, confidence: 0.91, keep_current: true, rationale: 'Controle de infecção no paciente diabético — técnica asséptica e higiene.' },
  { modulo_slug: 'cogeps-unioeste-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102785845-0', suggested_subtopico: 'Medidas de Prevenção e Precaução de Contato', confidence: 0.96, keep_current: false, rationale: 'Tipos de precauções: padrão, contato, gotículas e aerossóis.' },
  { modulo_slug: 'coseac-uff-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102813845-0', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Fontes de microrganismos infectantes no ambiente hospitalar.' },
  { modulo_slug: 'coseac-uff-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102813845-1', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Origem endógena versus exógena das infecções hospitalares.' },
  { modulo_slug: 'coseac-uff-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102813845-2', suggested_subtopico: 'Medidas de Prevenção e Precaução de Contato', confidence: 0.92, keep_current: false, rationale: 'Modalidades de transmissão respiratória: gotículas e aerossóis.' },
  { modulo_slug: 'coseac-uff-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102813845-3', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Risco de pneumonia associada à ventilação mecânica (IRAS).' },
  { modulo_slug: 'ibade-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102785845-3', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Cinco momentos OMS para higienização das mãos na assistência.' },
  { modulo_slug: 'icece-enfermagem-infeccoes-no-contexto-da-biosseguranca-1780000569658-8', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Noções de prevenção de IH com foco em lavagem das mãos.' },
  { modulo_slug: 'icece-enfermagem-infeccoes-no-contexto-da-biosseguranca-1780000569658-9', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Higienização das mãos e limpeza no transporte intersetorial.' },
  { modulo_slug: 'idecan-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102785845-4', suggested_subtopico: 'Instalação e Manejo de Sondas', confidence: 0.93, keep_current: false, rationale: 'Piúria em paciente com SVD — complicação urinária e sonda.' },
  { modulo_slug: 'idecan-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102785845-5', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Definição normativa de infecção hospitalar (pós-admissão).' },
  { modulo_slug: 'idecan-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102785845-6', suggested_subtopico: 'Punção Venosa e Cuidados com Cateteres', confidence: 0.94, keep_current: false, rationale: 'Prevenção de IRAS em cateteres: flushing, lock e avaliação do sítio.' },
  { modulo_slug: 'idecan-enfermagem-infeccoes-no-contexto-da-biosseguranca-1778712220716-2', suggested_subtopico: 'Instalação e Manejo de Sondas', confidence: 0.93, keep_current: false, rationale: 'Piúria em paciente com SVD — complicação urinária e sonda.' },
  { modulo_slug: 'idecan-enfermagem-infeccoes-no-contexto-da-biosseguranca-1778712220716-3', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Definição normativa de infecção hospitalar (pós-admissão).' },
  { modulo_slug: 'idecan-enfermagem-infeccoes-no-contexto-da-biosseguranca-1778712220716-4', suggested_subtopico: 'Punção Venosa e Cuidados com Cateteres', confidence: 0.94, keep_current: false, rationale: 'Prevenção de IRAS em cateteres: flushing, lock e avaliação do sítio.' },
  { modulo_slug: 'idecan-enfermagem-seguranca-do-paciente-1778712220716-8', suggested_subtopico: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Fatores do paciente e aquisição de IRAS — conceito de infecção relacionada à assistência.' },
  { modulo_slug: 'idib-enfermagem-infeccoes-no-contexto-da-biosseguranca-1778934900821-1', suggested_subtopico: BUCKET, confidence: 0.97, keep_current: true, rationale: 'Cinco momentos OMS para higienização das mãos.' },
  { modulo_slug: 'idib-enfermagem-infeccoes-no-contexto-da-biosseguranca-1778934900821-2', suggested_subtopico: 'Enfermagem do Trabalho', confidence: 0.92, keep_current: false, rationale: 'Exposição ocupacional a material biológico (HIV, hepatites B/C).' },
  { modulo_slug: 'idib-enfermagem-infeccoes-no-contexto-da-biosseguranca-1778934900821-3', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Definição e manifestação clínica das IRAS.' },
  { modulo_slug: 'igeduc-enfermagem-infeccoes-no-contexto-da-biosseguranca-1780000569658-7', suggested_subtopico: 'Coleta de Exames Laboratoriais', confidence: 0.95, keep_current: false, rationale: 'Boas práticas na coleta de sangue venoso na ESF/UBS.' },
  { modulo_slug: 'instituto-access-enfermagem-seguranca-do-paciente-1777102766050-3', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Duração mínima da higiene das mãos para prevenir IRAS.' },
  { modulo_slug: 'instituto-verbena-enfermagem-processo-de-enfermagem-1780009303038-1', suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde', confidence: 0.91, keep_current: false, rationale: 'Classificação de área semicrítica para limpeza e desinfecção.' },
  { modulo_slug: 'itame-enfermagem-seguranca-do-paciente-1779563467322-1', suggested_subtopico: 'Medidas de Prevenção e Precaução de Contato', confidence: 0.90, keep_current: false, rationale: 'Lavar as mãos como primeira medida antes do cuidado (precaução padrão).' },
  { modulo_slug: 'legalle-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563718396-4', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Definição de infecção hospitalar pós-admissão.' },
  { modulo_slug: 'legalle-enfermagem-processo-de-enfermagem-1780010911471-1', suggested_subtopico: BUCKET, confidence: 0.86, keep_current: true, rationale: 'Microbiologia básica (formas bacterianas) — conteúdo genérico sem foco IRAS.' },
  { modulo_slug: 'objetiva-concursos-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102719125-1', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Portaria 2.616/98 — critérios de infecção hospitalar.' },
  { modulo_slug: 'omni-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102719125-3', suggested_subtopico: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Atribuições da Comissão de Biossegurança em Saúde (CBS).' },
  { modulo_slug: 'omni-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102719125-4', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Conceito de biossegurança e prevenção de riscos biológicos.' },
  { modulo_slug: 'omni-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102719125-5', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Infecção comunitária versus infecção hospitalar na admissão.' },
  { modulo_slug: 'omni-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102719125-6', suggested_subtopico: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Definição de infecção hospitalar e relação com procedimentos.' },
  { modulo_slug: 'omni-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102719125-7', suggested_subtopico: 'Processamento de Artigos e Produtos de Saúde', confidence: 0.92, keep_current: false, rationale: 'Conceitos de assepsia versus antissepsia na prevenção de infecção.' },
  { modulo_slug: 'omni-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102785845-7', suggested_subtopico: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Fonte exógena das infecções hospitalares (cruzada/ambiente).' },
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
