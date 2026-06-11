# AVANT Editorial v2 — Tokens (rascunho)

**Status:** **Aprovado** — Fases 0–7 concluídas (dashboard editorial + tag `avant/editorial-v2`, 2026-06-10). Landing/admin/e-mails pendentes (Fase 8).

**Decisão de cor:** não usar laranja QConcursos (`#FE6112`), teal Estudei (`#00CDA0`) nem âmbar Gabarita (`#F59B0A`). Manter **verde logo** `#8fe020` como CTA exclusivo.

**Princípio:** visual editorial premium (referência QConcursos / Estudei LP), assinatura exclusiva no **verde-limão do logo** e no momento **Estudo Reverso**.

---

## Comparativo Cyber v1 → Editorial v2

| Token | Cyber v1 (atual) | Editorial v2 (proposta) | Notas |
|-------|------------------|-------------------------|-------|
| `--color-surface-0` | `#010409` | `#f8fafc` | fundo app claro |
| `--color-surface-1` | `#06090f` | `#f1f5f9` | sidebar / strip |
| `--color-surface-2` | `#0d1117` | `#ffffff` | cards |
| `--color-surface-3` | `#111827` | `#e2e8f0` | hover / muted bg |
| `--color-border-subtle` | `rgba(255,255,255,0.05)` | `#e2e8f0` | |
| `--color-border-default` | `rgba(255,255,255,0.10)` | `#cbd5e1` | |
| `--color-border-strong` | `rgba(255,255,255,0.18)` | `#94a3b8` | |
| `--color-brand` | `#00f2ff` | `#8fe020` | verde logo AVANT |
| `--color-brand-dim` | cyan 12% | `rgba(143,224,32,0.12)` | |
| `--color-brand-text` | `#67e8f9` | `#3d6b0f` | texto em fundo claro |
| `--color-nav-active-bg` | violet 12% | `rgba(143,224,32,0.10)` | |
| `--color-nav-active-bar` | `#8b5cf6` | `#8fe020` | |
| `--color-nav-active-txt` | `#c4b5fd` | `#3d6b0f` | |
| `--color-success` | `#00ff88` | `#16a34a` | sem glow |
| `--color-danger` | `#ff0055` | `#dc2626` | sem glow |
| `--color-warning` | `#ffb800` | `#d97706` | |
| `--color-text-primary` | `#e6edf3` | `#0f172a` | |
| `--color-text-secondary` | `#8b949e` | `#64748b` | |
| `--color-text-tertiary` | `#484f58` | `#94a3b8` | |

---

## Modo escuro (opcional — toggle)

Se a auditoria aprovar “ambos” (estilo Estudei):

| Token | Valor dark |
|-------|------------|
| `--color-surface-0` | `#0f172a` |
| `--color-surface-2` | `#1e293b` |
| `--color-text-primary` | `#f1f5f9` |
| `--color-brand` | `#8fe020` (mantém) |

_Sem listras diagonais. Sem glassmorphism pesado._

---

## Tipografia (proposta)

| Uso | Fonte | Peso |
|-----|-------|------|
| UI / corpo | system-ui, Inter se já no projeto | 400–600 |
| Títulos | mesma família | 700 |
| Evitar | `font-black` + `uppercase tracking-widest` em massa | — |

---

## Raio e sombra

| Elemento | Cyber v1 | Editorial v2 |
|----------|----------|--------------|
| Card | `2.5rem` | `12px`–`16px` |
| Botão primário | `rounded-2xl` | `10px`–`12px` |
| Input | | `8px` |
| Sombra card | glow neon | `0 1px 3px rgba(15,23,42,0.08)` |
| Sombra elevada | | `0 4px 12px rgba(15,23,42,0.10)` |

---

## Componentes utilitários (mapeamento)

| Classe atual | Substituição proposta |
|--------------|----------------------|
| `.glass-panel` | `.card-elevated` — bg branco, border, shadow-sm |
| `.text-neon-gradient` | `.text-brand` ou título sólido + span verde |
| `.btn-option` | borda slate-200, hover brand/8%, sem glow |
| `.card-success-static` | bg green-50, border green-200 |
| `.card-error-static` | bg red-50, border red-200 |
| `body::before` listras | **remover** no tema claro |

---

## Logo

**Manter** `AvantLogo` e `avantLogoConstants.ts` — o verde-limão vira ponte entre Cyber v1 e Editorial v2.

Ajuste opcional pós-auditoria: lockup em fundo claro (wordmark mais escuro para contraste).

---

## NeuroSlides (exceção)

- Manter `SUBTOPIC_DESIGN_MAP` e templates `t01`–`t15`.
- Reduzir: `drop-shadow` neon, blur excessivo.
- Player reverso: pode manter fundo levemente mais escuro ou tint brand para “modo foco”.

---

## CSS vars — snippet de implementação (futuro)

```css
/* NÃO aplicar ainda — referência pós-aprovação */
:root[data-theme="editorial"] {
  --color-surface-0: #f8fafc;
  --color-surface-2: #ffffff;
  --color-brand: #8fe020;
  --color-text-primary: #0f172a;
  /* … */
}
```

Implementação real: editar bloco `:root` e `.dashboard-surface` em `app/globals.css`.

---

## Checklist de aprovação

- [ ] Contraste texto primário ≥ 4.5:1 em fundo surface-0
- [ ] CTA verde legível em fundo branco
- [ ] Estados erro/sucesso distinguíveis sem neon
- [ ] Aprovado no `RELATORIO-EXECUTIVO.md`
