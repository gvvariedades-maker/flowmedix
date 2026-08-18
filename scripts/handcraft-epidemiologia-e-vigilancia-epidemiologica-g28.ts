/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g28 (2/2 residual).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g28.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g28';
const DIR = path.join('data/catalog-migration', LOTE, 'questions');
const SUB = 'Epidemiologia e Vigilância Epidemiológica';
const TOPICO = 'Enfermagem';

const PORT264 = {
  id: 'portaria-ms-264-notificacao',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Portaria MS nº 264 — lista nacional de notificação compulsória',
  year: 2020,
  url: 'https://www.gov.br/saude/pt-br',
};
const LISTA = {
  id: 'portaria-consolidacao-4-2017',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Portaria de Consolidação nº 4/2017 — notificação compulsória',
  year: 2017,
  url: 'https://www.gov.br/saude/pt-br',
};

type Item = { label: string; detail?: string; icon?: string; correct?: string };
type Row = { label: string; value: string; badge?: string };

const slideMeta = () => ({ topico: TOPICO, subtopico: SUB });
const conceptMap = (title: string, items: Item[], footer: string) => ({
  type: 'concept_map' as const,
  slide_title: title,
  meta: slideMeta(),
  items,
  footer_rule: footer,
});
const logicFlow = (steps: string[], footer: string) => ({
  type: 'logic_flow' as const,
  reveal_mode: 'tap' as const,
  meta: slideMeta(),
  steps,
  footer_rule: footer,
});
const goldenRule = (title: string, content: string, rows: Row[], footer: string) => ({
  type: 'golden_rule' as const,
  slide_title: title,
  subject: 'Enfermagem',
  meta: slideMeta(),
  content,
  rows,
  footer_rule: footer,
});
const dangerZone = (content: string, items: Item[], footer: string) => ({
  type: 'danger_zone' as const,
  bullet_style: 'x_icon' as const,
  meta: slideMeta(),
  content,
  items,
  footer_rule: footer,
});

type Patch = {
  file: string;
  family: string;
  pedagogical_branch: string;
  guideline_snapshot: string;
  exam_vs_current?: string;
  sources: Array<Record<string, unknown>>;
  slides: unknown[];
};

const PATCHES: Patch[] = [
  {
    file: 'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563818401-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Notificação semanal: tuberculose e hanseníase. Misturar imediatos (sarampo, FA, peçonhento, leptospirose) = pegadinha.',
    sources: [{ ...PORT264, covers: ['tuberculose', 'hanseníase', 'notificação semanal'] }],
    slides: [
      conceptMap(
        'Notificação semanal — qual par?',
        [
          {
            label: 'Pedido',
            detail: 'Casos suspeitos e/ou confirmados de notificação semanal na lista nacional.',
            icon: 'Calendar',
          },
          {
            label: 'Par-chave',
            detail: 'Tuberculose e hanseníase.',
            icon: 'ClipboardList',
          },
          {
            label: 'Imediato (ex.)',
            detail: 'Sarampo, febre amarela, peçonhento, leptospirose — outro ritmo.',
            icon: 'Zap',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Juntar dengue/FA ou peçonhento no pacote semanal.',
            icon: 'AlertTriangle',
          },
        ],
        'TB + hanseníase = semanal',
      ),
      logicFlow(
        [
          'Filtro: apenas o par de notificação semanal.',
          'Eliminar misturas com sarampo, febre amarela e peçonhento.',
          'Eliminar coqueluche/peçonhento e HIV/leptospirose nesta chave.',
          'Manter tuberculose e hanseníase.',
          'Marcar E.',
          'Em similares: TB e hanseníase = ritmo semanal clássico.',
        ],
        'TB + hanseníase → letra E',
      ),
      goldenRule(
        'Semanal clássico',
        'Decore',
        [
          { label: 'Semanal', value: 'Tuberculose e hanseníase.', badge: 'ok' },
          { label: 'Imediato (ex.)', value: 'Sarampo, febre amarela, peçonhento.', badge: 'warn' },
          { label: 'Regra', value: 'Não misturar ritmos no mesmo par.', badge: 'ok' },
        ],
        'Não misturar imediato no par semanal',
      ),
      dangerZone(
        'PEGADINHAS — semanal',
        [
          {
            label: 'Letra A — AT + sarampo',
            detail: 'Acidente com material biológico e sarampo.',
            correct: 'Sarampo quebra o ritmo — não é o par semanal da chave.',
          },
          {
            label: 'Letra B — dengue + FA',
            detail: 'Dengue e febre amarela.',
            correct: 'Febre amarela é eixo imediato — não fecha o semanal.',
          },
          {
            label: 'Letra C — coqueluche + peçonhento',
            detail: 'Coqueluche e acidente por animal peçonhento.',
            correct: 'Peçonhento não fecha o par semanal pedido.',
          },
          {
            label: 'Letra D — HIV + leptospirose',
            detail: 'Infecção pelo HIV e leptospirose.',
            correct: 'Não é o par semanal da chave (TB + hanseníase).',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “hanseníase é sempre imediata”.',
            correct: 'Hanseníase entra no ritmo semanal da lista.',
          },
        ],
        'Misturar imediato no semanal → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563838275-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Notificação semanal: toxoplasmose gestacional e congênita. Hantavirose, leptospirose e botulismo = imediatos típicos nesta chave.',
    sources: [
      { ...PORT264, covers: ['toxoplasmose gestacional', 'congênita', 'notificação semanal'] },
      { ...LISTA, covers: ['hantavirose', 'botulismo', 'leptospirose'] },
    ],
    slides: [
      conceptMap(
        'Notificação semanal — qual item?',
        [
          {
            label: 'Conceito',
            detail: 'Notificação compulsória: comunicar às autoridades para investigar e controlar.',
            icon: 'Bell',
          },
          {
            label: 'Pedido',
            detail: 'Qual requer notificação semanal.',
            icon: 'Calendar',
          },
          {
            label: 'Semanal (chave)',
            detail: 'Toxoplasmose gestacional e congênita.',
            icon: 'Baby',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar hantavirose, leptospirose ou botulismo como semanal.',
            icon: 'AlertTriangle',
          },
        ],
        'Toxoplasmose gestacional/congênita = semanal',
      ),
      logicFlow(
        [
          'Filtro: notificação semanal.',
          'Eliminar hantavirose (imediata típica).',
          'Eliminar leptospirose e botulismo (imediatos nesta chave).',
          'Manter toxoplasmose gestacional e congênita.',
          'Marcar C.',
          'Em similares: toxoplasmose gestacional/congênita = semanal.',
        ],
        'Toxoplasmose semanal → letra C',
      ),
      goldenRule(
        'Semanal × imediato',
        'Decore',
        [
          { label: 'Semanal', value: 'Toxoplasmose gestacional e congênita.', badge: 'ok' },
          { label: 'Imediato (ex.)', value: 'Hantavirose, leptospirose, botulismo.', badge: 'warn' },
          { label: 'Finalidade', value: 'Investigar e controlar casos/eventos.', badge: 'ok' },
        ],
        'Botulismo/hanta ≠ semanal',
      ),
      dangerZone(
        'PEGADINHAS — ritmo',
        [
          {
            label: 'Letra A — hantavirose',
            detail: 'Hantavirose.',
            correct: 'Eixo imediato típico — não semanal nesta chave.',
          },
          {
            label: 'Letra B — leptospirose',
            detail: 'Leptospirose.',
            correct: 'Não é o item semanal pedido (toxoplasmose).',
          },
          {
            label: 'Letra D — botulismo',
            detail: 'Botulismo.',
            correct: 'Imediato clássico — não semanal.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “toda congênita é imediata”.',
            correct: 'Toxoplasmose gestacional/congênita segue o ritmo semanal da lista.',
          },
        ],
        'Trocar semanal por imediato → distrator',
      ),
    ],
  },
];

function applyPatch(patch: Patch) {
  const filePath = path.join(DIR, patch.file);
  const questao = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
  const meta = { ...(questao.meta as Record<string, unknown>) };
  meta.content_standard = 'golden-v1';
  meta.family = patch.family;
  meta.pedagogical_branch = patch.pedagogical_branch;
  meta.subtopico = SUB;
  meta.topico = TOPICO;
  meta.content_review = {
    reviewed_at: '2026-08-03',
    reviewer: 'cursor-grok-4.5-epi-g28',
    guideline_snapshot: patch.guideline_snapshot,
    exam_vs_current: patch.exam_vs_current ?? 'none',
  };
  meta.sources = patch.sources;
  questao.meta = meta;
  questao.reverse_study_slides = patch.slides;
  delete (questao as { study_slides?: unknown }).study_slides;
  fs.writeFileSync(filePath, `${JSON.stringify(questao, null, 2)}\n`, 'utf8');
  console.log(`[ok] ${patch.file} → ${patch.family}/${patch.pedagogical_branch}`);
}

function main() {
  if (!fs.existsSync(DIR)) throw new Error(`missing ${DIR}`);
  for (const patch of PATCHES) applyPatch(patch);
  console.log(`\nHandcraft ${LOTE}: ${PATCHES.length} slugs (Cursor Grok 4.5).`);
}

main();
