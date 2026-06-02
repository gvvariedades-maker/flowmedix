# Política de zoom mobile — AVANT

Leitura estimada: **~3 minutos**. Define como o app trata pinch-to-zoom e controles de tamanho de texto em telas estreitas.

## Frase-guia

**Pinch na página; botões no player.**

| Modelo | Onde | Pinch (dedos) | Controle |
|--------|------|---------------|----------|
| **A — Nativo** | Simulado, vitrine, ajuda, listagens | Permitido | Navegador |
| **B — Passos** | Questão `/estudar`, NeuroSlides ER, Material modal | Bloqueado (`touch-pan-y` no scroll) | Toolbar A− / A+ / reset |
| **E — Fixo** | BottomNav, modais, logic flow tap | Bloqueado | — |

---

## Módulo compartilhado

Implementação central: [`components/accessibility/ReadableTextZoom.tsx`](../components/accessibility/ReadableTextZoom.tsx).

| Export | Responsabilidade |
|--------|------------------|
| `TEXT_SCALE_STEPS` | 5 degraus: `[1, 1.12, 1.24, 1.36, 1.48]` |
| `MAX_WIDTH_MOBILE_CONTROLS_PX` | `767` — alinhado ao breakpoint `md` do Tailwind |
| `computeZoomInnerWidthPx` | Largura lógica pré-zoom para evitar overflow horizontal |
| `ReadableTextZoomProvider` | Estado `textStep`; reinicia ao mudar `contentKey`; desktop zera escala |
| `ReadableTextZoomToolbar` | Botões A− / A+ / reset (só viewport ≤ 767px) |
| `ReadableTextZoomContent` | Aplica CSS `zoom` + `ResizeObserver`; classes `break-words` / `[&_*]:min-w-0` |

Testes unitários: [`__tests__/readableTextZoom.test.ts`](../__tests__/readableTextZoom.test.ts).

---

## Tabela de rotas e zonas

| Zona | Rotas / componentes | Modelo | Pinch | Toolbar mobile |
|------|---------------------|--------|-------|----------------|
| 🟢 Verde | `/simulados/[id]`, vitrine `/estudar`, `/ajuda`, listagens dashboard | A | Sim | Não |
| 🟡 Amarelo | `/estudar/[slug]` — etapas `pergunta` e `gabarito` | B | Não | Sim — "Tamanho do texto da questão" |
| 🟡 Amarelo | `/estudar/[slug]` — etapa `estudo` (NeuroSlides ER) | B | Não | Sim — "Tamanho do texto do slide" |
| 🟡 Amarelo | `/material` → modal NeuroSlides | B | Não | Sim — "Tamanho do texto do NeuroSlide" |
| 🔴 Vermelho | BottomNav, modais (paywall, lot picker), logic flow `reveal_mode: "tap"` | E | Não | Não |
| ⚪ Cinza | Desktop (`md+`) | — | N/A | Toolbar oculta; escala sempre 1 |

---

## Consumidores (Modelo B)

### Estudo reverso (NeuroSlides no player)

Wrapper fino sobre o módulo compartilhado: [`components/lesson/EstudoReversoSlideZoom.tsx`](../components/lesson/EstudoReversoSlideZoom.tsx).

- `EstudoReversoSlideZoomProvider` → `contentKey={slideKey}`
- `EstudoReversoSlideZoomToolbar` → toolbar no header do modal ER
- `EstudoReversoSlideZoom` → scroll `touch-pan-y`, centralização via `useCenterIfFitsScroll`, conteúdo em `ReadableTextZoomContent`

### Questão `/estudar`

[`components/lesson/AvantLessonPlayer.tsx`](../components/lesson/AvantLessonPlayer.tsx):

- Provider ativo só em `etapa === 'pergunta' || etapa === 'gabarito'` (`showQuestionZoom`)
- `contentKey`: `` `${moduloSlug ?? questionHash}-${etapa}` `` — reset ao trocar questão ou etapa
- Toolbar no header live, ao lado do contador de lista / ReportErrorDialog
- **Dentro do zoom:** `text_fragment`, enunciado, alternativas, bloco "Confirmar Resposta"
- **Fora do zoom:** voltar, cabeçalho CPCON, código AVANT
- Scroll externo: `[data-testid="lesson-scroll-body"]` com `touch-pan-y`

### Material NeuroSlides

[`components/material/MaterialSlidesModal.tsx`](../components/material/MaterialSlidesModal.tsx) + [`MaterialSlidesPlayer.tsx`](../components/material/MaterialSlidesPlayer.tsx):

- Provider: `contentKey={`${selectedLot}-${slideIndex}`}`
- Toolbar no header absoluto do modal (mobile)
- Zoom de leitura **adicional** ao `transform: scale(fit)` do stage 360×520
- Frame: `overflow-auto touch-pan-y` quando `textStep > 0`; `overflow-hidden` no padrão

---

## Modelo A — pinch nativo (referência)

[`components/simulados/SimuladoRunnerClient.tsx`](../components/simulados/SimuladoRunnerClient.tsx) **não** importa `ReadableTextZoom`. O simulado usa scroll de página normal; o pinch do navegador continua disponível.

Viewport global em [`app/layout.tsx`](../app/layout.tsx):

```typescript
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Sem maximum-scale=1 nem user-scalable=no
};
```

---

## O que **não** fazer

| Anti-padrão | Motivo |
|-------------|--------|
| Pinch global bloqueado (`maximum-scale=1`, `user-scalable=no`) | Prejudica simulado, vitrine e páginas de ajuda (Modelo A) |
| Remover `touch-pan-y` dos slides ER / questão | Scroll vertical deixa de funcionar bem no mobile |
| Mapear pinch → `textStep` nos NeuroSlides | Fora de escopo; conflita com scroll e tap do logic flow |
| Dois providers simultâneos (questão + ER) | Provider da questão desmonta ao `etapa === 'estudo'` |
| Toolbar em desktop | `narrowViewport` false zera escala; toolbar retorna `null` |

---

## Checklist de verificação manual (mobile ≤ 767px)

1. **`/estudar/[slug]` — pergunta:** toolbar visível; A+/A− escalam enunciado e alternativas; cabeçalho CPCON fora do zoom; pinch da página não amplia o card.
2. **`/estudar/[slug]` — gabarito:** mesma toolbar; reset ao voltar para pergunta (key muda).
3. **`/estudar/[slug]` — estudo reverso:** toolbar do slide; scroll vertical ok; provider da questão desmontado.
4. **`/material` — modal NeuroSlides:** toolbar no header; fit do slide preservado; scroll no frame quando ampliado.
5. **`/simulados/[id]`:** pinch do navegador continua funcionando (sem toolbar AVANT).

Comandos automatizados:

```bash
npm run build
npm test -- readableTextZoom
```

---

## Referências cruzadas

| Arquivo | Papel |
|---------|-------|
| [`ReadableTextZoom.tsx`](../components/accessibility/ReadableTextZoom.tsx) | Módulo compartilhado |
| [`EstudoReversoSlideZoom.tsx`](../components/lesson/EstudoReversoSlideZoom.tsx) | Wrapper ER + scroll/centering |
| [`AvantLessonPlayer.tsx`](../components/lesson/AvantLessonPlayer.tsx) | Questão pergunta/gabarito |
| [`MaterialSlidesModal.tsx`](../components/material/MaterialSlidesModal.tsx) | Modal material |
| [`MaterialSlidesPlayer.tsx`](../components/material/MaterialSlidesPlayer.tsx) | Fit + zoom de leitura |
| [`app/layout.tsx`](../app/layout.tsx) | Viewport global |
| [`SimuladoRunnerClient.tsx`](../components/simulados/SimuladoRunnerClient.tsx) | Modelo A (pinch nativo) |
| [`lib/hooks/useCenterIfFitsScroll.ts`](../lib/hooks/useCenterIfFitsScroll.ts) | Centralização vertical ER |
