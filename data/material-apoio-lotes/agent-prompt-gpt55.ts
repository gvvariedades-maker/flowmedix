import { getItensLote } from './lote-registry';

const REFERENCIA_ESTRUTURA = [
  'Referência de layout (não duplicar código fora do padrão do app): `components/shared/NeuroSlidePreviewCard.tsx` — `NeuroSlidePreview` (badge `tipo`, `titulo`, `conteúdo` em JSX, `gradiente`, `badgeColor`, ícone Lucide).',
  'Cada “slide” pode usar um destes _tipos_ de apresentação: Mapa/grade, lista chave–valor, lista de alerta, passos numerados, versus (2 colunas), memorização por níveis — como na vitrine `NeuroSlidesShowcaseGrid`.',
].join('\n');

/**
 * Texto base para colar no Cursor Agent com modelo **GPT-5.5** (ou equivalente).
 * Substitua `LOTE_N` (1 a 7) e rode **um lote por vez** para o modelo não misturar tópicos.
 */
export const AGENT_GPT55_MATERIAL_SLIDES_PROMPT = `Você está no repositório AVANT (Next.js, React, Tailwind).

Tarefa: gerar o **LOTE N** (conforme definido em \`data/material-apoio-lotes/lote-0N.ts\` — use o arquivo com zero à esquerda: lote-01 … lote-07) de **slides** no estilo NeuroSlide para o Material de Apoio.

Obrigatório:
- Português do Brasil, público: **Técnico em Enfermagem** e bancas de concurso.
- Conteúdo **didático e factual**; evite prescrição clínica detalhada, doses específicas de conduta se não forem padrão de prova. Se houver tópico sensível, priorize o que cai em questão (definição, sinais, regras legais, princípios OMS, direitos SUS, etc.).
- Não afirme “o mais cobrado” com estatística se não houver base no texto; use formulações como “tema recorrente em prova” só quando fizer sentido geral.
- Gere **exatamente** o número de slides do lote: lotes 1 a 6 têm **8** itens; lote 7 tem **4** itens. Um slide por item, na ordem do arquivo \`lote-0N.ts\` (id global e título respeitados).
- Respeite os \`id\` e títulos listados; o conteúdo interno (bullet, mapa, tabela) é seu, alinhado ao título.
- Cada slide deve mapear para **um** \`NeuroSlidePreview\` (ou registro de dados + render) reutilizando o padrão visual do projeto (gradientes discretos, borda branca/10, tipografia do showcase).

Proibido:
- Misturar itens de outro lote.
- Criar dependências de npm novas.
- Incluir PII, pacientes reais, ou conteúdo fora do escopo de técnico de enfermagem/SUS/legislação geral de prova.

Entrega esperada (escolha UMA, conforme pedir o usuário no chat):
- **A)** Trechos TS/TSX prontos para colar (array ou componente) com os N slides, **ou**
- **B)** Patch de arquivos sugeridos (ex. novo \`data/material-apoio-lotes/gerado/lote-0N-content.tsx\`) sem quebrar build.

Contexto de estrutura:
${REFERENCIA_ESTRUTURA}

Confirme no início da resposta: "Processando LOTE N" com o número correto e liste os títulos na ordem antes de entregar o código.`;

const NUMERO_PARA_LOTE: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, string> = {
  1: '01',
  2: '02',
  3: '03',
  4: '04',
  5: '05',
  6: '06',
  7: '07',
};

/**
 * Constrói o prompt com o lote e a lista de títulos do repo (evita o modelo alucinar itens).
 */
export function buildAgentPromptGpt55(
  n: 1 | 2 | 3 | 4 | 5 | 6 | 7,
): string {
  const itens = getItensLote(n);
  const fileName = `lote-${NUMERO_PARA_LOTE[n]}.ts`;
  const listagem = itens
    .map(
      (i) =>
        `  - id=${i.id} | categoria: ${i.categoria} | ${i.titulo}`,
    )
    .join('\n');
  return `${AGENT_GPT55_MATERIAL_SLIDES_PROMPT
    .replace(/LOTE N/g, `LOTE ${n}`)
    .replace(/lote-0N/g, `lote-${NUMERO_PARA_LOTE[n]}`)}

---

Itens oficiais do **LOTE ${n}** (arquivo \`data/material-apoio-lotes/${fileName}\`):

${listagem}
`;
}
