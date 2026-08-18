# Hook Composer → Fábrica — validação (Processo de Enfermagem)

| Campo | Valor |
|-------|--------|
| Pacote | Processo de Enfermagem |
| `pacote_prefix` | `processo-de-enfermagem` |
| Posição na ordem Fábrica | **2º** (após Saúde da Mulher) |
| `production_status` | `production_ready` (51/51 applied) |
| Validado em | 2026-08-08 |
| Contrato | [`docs/PROMPT_FABRICA_VISUAL_G2.md`](../docs/PROMPT_FABRICA_VISUAL_G2.md) § Pré-passo Composer |
| Banco | [`artifacts/composer-visual-bank.md`](composer-visual-bank.md) |

---

## Por que este pacote

Na ordem canônica Fábrica, **Saúde da Mulher** já tem `visual_gallery` `ready`/`pilot` nos ramos fortes — Composer **não** é pré-passo obrigatório para variant nova (só polish opcional).

**Próximo pacote** = Processo de Enfermagem. Playbook sem campo `visual_gallery` em nenhum ramo → tratar como **pending** (ausente = pending).

---

## Inventário gallery (playbook)

Fonte: `data/catalog-migration/handcraft-playbooks/processo-de-enfermagem.json` · briefs: `artifacts/l3-brief-processo-de-enfermagem-INDEX.md`.

| ramo | `visual_gallery` | Board / molde 4/4 existe? | Gate Composer | Ação Fábrica após PASS |
|------|------------------|---------------------------|---------------|-------------------------|
| `sae_documentacao` | ausente → **pending** | Sim (`sae-documentation` · `sae-reference-board` · `sae-decision-tap` · `norm-reveal`) | **Obrigatório** `Composer visual: sae_documentacao` | Reuso + polish + capture → gallery `ready` — **proibido** React novo |
| `sae_etapas` | ausente → **pending** | Sim (`sae-responsibility-matrix` + mesmos boards) | **Obrigatório** `Composer visual: sae_etapas` | Idem |
| `sae_exceto` | ausente → **pending** | Sim (mesmo stack; gesto tip. `isolate` / compare) | **Obrigatório** `Composer visual: sae_exceto` | Idem — preferir `LogicIsolateShell` se tap EXCETO |
| `sae_generico` | ausente | Âncora visual only / cauda | Composer longo **opcional** | `ok_generico` se cauda textual |

**Veredito do hook:** 3/3 ramos fortes exigem Composer **antes** de qualquer `Implementar molde:` ou variant nova. Como boards já existem, handoff esperado = **reuso + Modo A + gallery** (sem React).

---

## Disparos recomendados (próximas conversas)

```text
# 1) Pré-passo (1 ramo por chat ou lote sequencial)
Composer visual: sae_documentacao
Pacote: Processo de Enfermagem
@artifacts/composer-visual-bank.md
@docs/PROMPT_COMPOSER_VISUAL.md
@artifacts/l3-brief-processo-de-enfermagem-INDEX.md

# 2) Após ATELIER_PASS nos ramos fortes tocados
Fábrica visual G2: SUBTÓPICO: Processo de Enfermagem
@docs/PROMPT_FABRICA_VISUAL_G2.md
@artifacts/composer-fabrica-hook-processo-de-enfermagem.md
```

---

## Checklist DoD do hook (esta validação)

```text
[x] Ordem Fábrica: Mulher done (gallery ready) → Processo = próximo
[x] Playbook auditado: 0 visual_gallery → pending implícito
[x] Boards existentes → Composer precede; React novo bloqueado sem gesto novo
[x] Contrato documentado em PROMPT_FABRICA_VISUAL_G2 + PROMPT_COMPOSER_VISUAL
[ ] Execução Composer + Fábrica + visual_bar: pass — conversa operacional seguinte
[ ] Playbook visual_gallery atualizado + linha banco se elevou ouro
```

---

## Gestos sugeridos (banco → ramo)

| ramo | gesture_id sugerido (banco) | Primitives / shells |
|------|----------------------------|---------------------|
| `sae_documentacao` | `chip_body` ou `deck` | `LabelBodyRow` · `PillarDeck` · `BoardChrome` |
| `sae_etapas` | `rail` | `ProtocolRailRow` · `LogicRailShell` |
| `sae_exceto` | `isolate` | `LogicIsolateShell` · `AlertCallout` |

---

*Validação documental do Fase 3 (composer factory hook). Não substitui o report Fábrica com `visual_bar: pass` após execução.*
