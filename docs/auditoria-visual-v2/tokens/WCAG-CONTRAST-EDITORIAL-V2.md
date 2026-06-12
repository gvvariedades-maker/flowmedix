# WCAG 2.1 AA — Editorial v2

**Data:** 2026-06-10  
**Script:** `node scripts/wcag-editorial-contrast.mjs`

---

## Resultado automatizado

| Par | FG | BG | Ratio | AA normal (4.5:1) | AA large/UI (3:1) |
|-----|----|----|-------|---------------------|-------------------|
| Texto primário / fundo app | `#0f172a` | `#f1f5f9` | **16.30:1** | PASS | PASS |
| Texto secundário / fundo app | `#475569` | `#f1f5f9` | **6.92:1** | PASS | PASS |
| Texto terciário / fundo app | `#94a3b8` | `#f1f5f9` | 2.34:1 | FAIL | FAIL |
| Brand text / card branco | `#3d6b0f` | `#ffffff` | **6.35:1** | PASS | PASS |
| CTA label / botão brand | `#1a2e05` | `#8fe020` | **8.94:1** | PASS | PASS |
| Sucesso (token) / card branco | `#16a34a` | `#ffffff` | 3.30:1 | FAIL | PASS |
| Sucesso text / card branco | `#15803d` | `#ffffff` | **5.02:1** | PASS | PASS |
| Perigo / card branco | `#dc2626` | `#ffffff` | **4.83:1** | PASS | PASS |
| Aviso (token) / card branco | `#d97706` | `#ffffff` | 3.19:1 | FAIL | PASS |
| Aviso text / card branco | `#b45309` | `#ffffff` | **5.02:1** | PASS | PASS |
| Outline btn / branco | `#334155` | `#ffffff` | **10.35:1** | PASS | PASS |

---

## Leitura e mitigação

### Aprovado para produção (pares críticos)

- Corpo e títulos: `--color-text-primary` em `--color-surface-0` / cards brancos.
- Labels secundários: `--color-text-secondary` `#475569` (6.92:1 em `#f1f5f9`).
- CTA primário: `#1a2e05` sobre `#8fe020` (8.94:1).
- Links/brand em texto: `--color-brand-text` `#3d6b0f`.
- Erro: `--color-danger` `#dc2626` em fundo claro.

### Uso restrito (não corpo 14px)

| Token | Uso seguro | Evitar |
|-------|------------|--------|
| `--color-text-tertiary` `#94a3b8` | Timestamps, placeholders decorativos com ícone | Parágrafos ou labels obrigatórios |
| `--color-success` `#16a34a` | Ícones/badges ≥18px, bordas | Texto corrido |
| `--color-warning` `#d97706` | Ícones/badges ≥18px | Texto corrido |

Para copy legível de sucesso/avisos, usar `--color-success-text` (`#15803d`) e `--color-warning-text` (`#b45309`) — ambos passam AA normal em branco.

### Melhoria futura (opcional)

- Elevar terciário para `#787f8a` (~3:1 em `#f8fafc`) se metadata precisar ser AA normal.

---

## Conclusão

**Pares de leitura principal e CTA passam WCAG AA.** Tokens terciário/success/warning “sólidos” são aceitos como cor de UI (ícone, borda, badge), com texto descritivo via variantes `-text` mais escuras já definidas no tema editorial.
