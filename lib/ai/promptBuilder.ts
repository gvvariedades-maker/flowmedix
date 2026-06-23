import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { FAMILY_LABELS } from '@/lib/catalogMigration/classifyFamily';
import type { GuidelineTable } from '@/lib/guidelines';

import { getExemplarSlides } from './retrieval';

export type PromptQuestaoInput = {
  instruction: string;
  options: { id: string; text: string; is_correct: boolean }[];
  text_fragment?: string;
};

function buildFamilySlideHints(family: FamilyId): string {
  const label = FAMILY_LABELS[family];

  const logicVf = `## logic_flow (${label})
- Steps CURTOS (1–2 frases), um passo por decisão.
- Para cada afirmativa I–IV use: "Julgar I: <pergunta>? → VERDADEIRO — <motivo>" ou "→ FALSO — <motivo>".
- Depois: "Montar conjunto verdadeiro: ...", "Eliminar alternativas com I falsa...", "Marcar letra X.", "Fixação: ...".
- NÃO repita o enunciado inteiro; cite só trecho-chave entre aspas.`;

  const logicMcq = `## logic_flow (${label})
- Steps de ELIMINAÇÃO em múltipla escolha (strings curtas).
- Ordem sugerida: ler cenário → identificar o que a banca pede → validar alternativa correta → eliminar cada distrator → concluir com "Marcar letra X".
- Use "Avaliar alternativa X: \\"trecho curto\\" — eliminar porque ..." para distratores.
- NÃO use formato V/F (Julgar I/II/III) se a questão não tiver afirmativas I–IV.`;

  const goldenMcq = `## golden_rule (múltipla escolha)
- rows[] com label "Alternativa X (Correta)" ou "Alternativa X (Incorreta)" — o molde visual usa isso para badge certo/errado.
- Última row: "Gabarito da Questão" com letra e texto da alternativa correta.`;

  switch (family) {
    case 'vf':
    case 'certo_errado':
      return `${logicVf}

## golden_rule (V/F)
- rows[] por afirmativa I–IV com V/F explícito no value quando aplicável.
- Última row: combinação ou gabarito com letra.`;
    case 'calc':
    case 'protocolo':
    case 'legis':
    case 'text_fragment':
      return `${logicMcq}

${goldenMcq}`;
    default:
      return `${logicMcq}

${goldenMcq}`;
  }
}

export function buildSystemPrompt(): string {
  return `Você é especialista em conteúdo pedagógico para concursos de Técnico de Enfermagem no Brasil.
Gera EXATAMENTE 4 slides de estudo reverso no formato plano do AVANT:
concept_map → golden_rule → logic_flow → danger_zone.

REGRAS INVIOLÁVEIS:
- Responda SOMENTE JSON válido: { "reverse_study_slides": [ ...4 slides... ] }
- Formato plano: items, rows, steps, content no mesmo nível que type (não aninhar).
- NÃO invente números, intervalos, doses ou normas. Use APENAS valores da tabela GUIDELINE fornecida.
- Conteúdo ESPECÍFICO desta questão: cite letra correta, afirmativas I–IV e termos do enunciado.
- concept_map: ≥3 items com label, detail, icon (Lucide React válido).
- golden_rule: rows[] (label, value) quando o molde exigir tabela; última row com gabarito/letra.
- golden_rule rows.badge: SOMENTE "hot", "warn", "ok" ou "info" (nunca success/error/highlight).
- logic_flow: reveal_mode "tap", steps[] com ≥3 strings (decisões em ordem).
- danger_zone: content + items[] com label, detail, correct (texto da coluna certa).
- Ícones concept_map: apenas Lucide React reais (ex.: Syringe, Calendar, ShieldCheck, Baby, Hospital, BellRing, ClipboardList, Target, Mail, Monitor, BarChart2, AlertCircle).
- Números das alternativas e do enunciado podem ser citados; outros números normativos só da GUIDELINE.
- Repita meta.subtopico canônico em cada slide quando fornecido.
- Proibido: TecConcursos, [IA], "conceito central", "ponto 1", frases genéricas copiáveis.`;
}

export function buildUserPrompt(input: {
  questao: PromptQuestaoInput;
  subtopico: string;
  topico: string;
  family: FamilyId;
  guideline: GuidelineTable | null;
  moldeSummary: string | null;
  exemplar: unknown | null;
}): string {
  const correct = input.questao.options.find((o) => o.is_correct);
  const guidelineBlock = input.guideline
    ? input.guideline.entries
        .map(
          (e) =>
            `- [${e.id}] ${e.label}: ${e.value}${e.detail ? ` — ${e.detail}` : ''}`,
        )
        .join('\n')
    : '(sem tabela oficial — não afirme números normativos; foque raciocínio e gabarito)';

  const exemplarSlides = getExemplarSlides(input.exemplar);
  const exemplarBlock = exemplarSlides
    ? JSON.stringify(exemplarSlides, null, 2).slice(0, 12000)
    : '(nenhum exemplar — siga a gramática golden-v1)';

  const fragment = input.questao.text_fragment?.trim()
    ? `\n## FRAGMENTO DE TEXTO\n${input.questao.text_fragment.trim().slice(0, 3000)}\n`
    : '';

  return `## QUESTÃO
${input.questao.instruction}
${fragment}
## ALTERNATIVAS
${input.questao.options.map((o) => `${o.id}) ${o.text}${o.is_correct ? '  ← GABARITO' : ''}`).join('\n')}

Gabarito: letra ${correct?.id ?? '?'} — "${correct?.text ?? ''}"

## META
Tópico: ${input.topico}
Subtópico: ${input.subtopico}
Família: ${input.family}

## MOLDES VISUAIS DO SUBTÓPICO
${input.moldeSummary ?? '(layout automático)'}

## NÚMEROS OFICIAIS PERMITIDOS (${input.guideline?.snapshot ?? 'nenhuma tabela'})
${guidelineBlock}

## EXEMPLAR DE QUALIDADE (padrão estrutural — NÃO copie o conteúdo literal)
${exemplarBlock}

${buildFamilySlideHints(input.family)}

Gere os 4 slides desta questão específica.`;
}

export function buildCorrectionAppendix(issues: string[]): string {
  return `\n\n## CORRIJA ESTES ERROS DA TENTATIVA ANTERIOR\n${issues.map((i) => `- ${i}`).join('\n')}`;
}
