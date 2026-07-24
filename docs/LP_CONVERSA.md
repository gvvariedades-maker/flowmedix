# LP de alto impacto — prompt de conversa

Use em **conversa nova** de uma destas formas:

```text
LP: home
```

```text
LP: campina-grande
```

```text
LP: polish visual
```

ou anexe este arquivo (`@docs/LP_CONVERSA.md`) — equivalente a escrever `LP:` — e edite **só** a linha do trigger.

**Fundação (pesquisa):** [`LP_RESEARCH_CAPABILITY_MAP.md`](LP_RESEARCH_CAPABILITY_MAP.md) — 10 especialistas (Gardner, Laja, Wiebe, Goward, Wolf, Aagaard, Ash, Gilis, Ekman, Price) → capacidades C1–C16.

**Brief histórico home:** [`auditoria-visual-v2/LANDING-AVANT-v3.md`](auditoria-visual-v2/LANDING-AVANT-v3.md) (detalhe / síntese Estudei) — este runbook é a **fonte operacional**.

---

## Variantes do trigger

| Trigger | Quando |
|---------|--------|
| `LP: home` | Criar, reescrever ou auditar a landing `/` (copy + seções + conversão) |
| `LP: <path>` | LP de concurso `/lp/<path>` via CMS ou código (ex.: `campina-grande`) |
| `LP: polish visual` | Só tokens/shell/layout — **sem** reescrever CRO; skill `avant-ui-visual` + § Design |
| Anexar `@docs/LP_CONVERSA.md` + linha `LP:` | Mesmo que trigger curto |

**Não misturar nesta conversa:** handcraft de questões, moldes NeuroSlides (`Design visual:`), feature de app (`Feature:`).

| Quer… | Use |
|-------|-----|
| Só aparência vitrine/player | `Visual:` / `Polish vitrine` |
| Molde de slide | `Design visual:` / `Molde visual:` |
| LP com copy + conversão + design | **`LP:`** (este doc) |

---

## Instruções para o agente (não pedir confirmação — executar)

### Proibido

- Inventar paleta fora dos tokens AVANT (Editorial `#8fe020` + slate; Cyber `#010409` + cyan)
- Copy de **enfermeiro / nível superior** como se fosse para TE
- Escassez falsa (“últimas vagas” sem base); urgência só com **data de prova / status de inscrição reais**
- Mais de **um CTA primário** competindo no mesmo viewport
- Publicar LP concurso (`status: ativo`) sem o usuário pedir explicitamente **publicar** / **pode publicar**
- Commit / push / apply Stripe sem pedido explícito
- Duplicar tabelas de tokens neste runbook — apontar para `AVANT-VISUAL-DIRECTION-v3.md` / `globals.css`

### Ler antes de executar

| Arquivo | Quando |
|---------|--------|
| Este runbook | Sempre |
| [`LP_RESEARCH_CAPABILITY_MAP.md`](LP_RESEARCH_CAPABILITY_MAP.md) | 1ª vez / auditoria profunda |
| [`lib/marketing/landingCopy.ts`](../lib/marketing/landingCopy.ts) | `LP: home` |
| [`lib/lp/formDefaults.ts`](../lib/lp/formDefaults.ts) + `LpPageConfigSchema` em `lib/validations.ts` | `LP: <path>` |
| [`app/_components/LPConcurso.tsx`](../app/_components/LPConcurso.tsx) | Template CMS |
| [`components/lp/campina/LPCampinaV2.tsx`](../components/lp/campina/LPCampinaV2.tsx) | Golden de referência concurso |
| [`components/landing/LandingHomeClient.tsx`](../components/landing/LandingHomeClient.tsx) | Ordem de seções home |
| Tokens | `docs/auditoria-visual-v2/tokens/AVANT-VISUAL-DIRECTION-v3.md` · `app/globals.css` |

---

## Princípios AVANT (sempre)

1. **Um job por página** — home: signup/trial; LP concurso: checkout Pro (ou trial explícito). (C1 · Gardner)
2. **TE exclusivo** — linguagem, prova e posicionamento para Técnico em Enfermagem. (C6 · Wolf)
3. **Estudo reverso visível** — demo / NeuroSlides / método, não só features. (C9 · Gardner try-before-buy)
4. **Freemium → Pro** — microcopy “sem cartão” / limites freemium honestos. (C12 · Anxiety↓)
5. **Ética** — disclaimer: plataforma independente, não é órgão/banca. (C12)
6. **Design system** — home = Editorial claro + bloco cyber no preview; LP concurso = Cyber Clinical. (C16)

---

## Fase 0 — Brief 15 min (C7)

Antes de escrever copy ou layout, preencher (mesmo que curto):

| Campo | Home `/` | LP concurso |
|-------|----------|-------------|
| **Persona** | TE concursando, material genérico | TE do **edital X** (cidade/banca) |
| **Job da página** | Criar conta grátis / ver plano | Assinar Pro para **este** concurso (+ futuros) |
| **Fonte de tráfego** | Orgânico, brand, remarketing | Ads / WhatsApp / edital — mensagem deve **bater** (C3) |
| **Dor VoC (3)** | Material de enfermeiro; chute; gabarito e esquece | Genérico vs o que **esta banca** cobra |
| **Resultado emocional** | “Feito para mim / técnico” (self-image) | “Dá tempo / estou no trilho certo” |
| **Prova** | 5k+ questões, bancas, autoridade TE | Vagas, banca, data, taxa (dados reais do edital) |
| **CTA primário + microcopy** | `Testar grátis agora` + sem cartão | `Assinar … Pro — R$ X/mês` + cancela quando quiser |
| **Ansiedades a matar** | Preço, “serve pro meu concurso?”, cartão | “É golpe?”, escopo do Pro, prazo da prova |

**Gate:** não pular Fase 0 em LP nova. Em polish visual puro, pular copy — manter job e CTA.

---

## Anatomia canônica (C1–C4, C9–C15)

### Variante A — Home `/`

Ordem canônica (código: `LandingHomeClient`):

| # | Seção | Job | Capacidade |
|---|--------|-----|------------|
| 1 | Header + Hero | Value prop + CTA grátis | C2, C4, C8 |
| 2 | Trust strip | Credibilidade rápida | C10 |
| 3 | Problema (3 cards) | PAS — Problem | C5 |
| 4 | Comparativo | Agitation + contraste oferta | C5, C6 |
| 5 | Product chapter / demo | Try-before-buy | C9 |
| 6 | Método (passos) | Como funciona | C4 |
| 7 | Missão semanal | Diferencial retenção | C2 |
| 8 | Recursos | Benefícios escaneáveis | C15 |
| 9 | Autoridade | Trust TE | C10, C6 |
| 10 | Pricing | Oferta Pro vs grátis | C15 |
| 11 | FAQ | Anxiety↓ | C12 |
| 12 | CTA final + sticky | Fechar | C1, C8 |

**Copy canônica:** editar `lib/marketing/landingCopy.ts` (não espalhar strings mágicas).  
**Detalhe visual/histórico:** `LANDING-AVANT-v3.md`.

### Variante B — Concurso `/lp/<path>`

Ordem canônica (código: `LPConcurso` / golden Campina):

| # | Bloco | Fonte de dados |
|---|--------|----------------|
| 1 | Nav + CTA | `oferta.preco` |
| 2 | Hero (headline, subtítulo, cards edital, checkout, countdown) | `copy.*` + `concurso.*` |
| 3 | Métricas de impacto | vagas / dias / preço |
| 4 | 3 dores | `copy.dores` |
| 5 | Perigos da banca | `copy.perigosBanca` |
| 6 | Walkthrough / método (imagens) | `walkthrough.imagens` |
| 7 | Benefícios Pro | `copy.listaBeneficios` + defaults |
| 8 | Oferta + CTA | preço |
| 9 | Disclaimer + legal | `copy.disclaimer*` |

**CMS:** `/admin/landings` → `LpPageEditor` → schema `LpPageConfigSchema` / `LpPageSeoSchema`.  
**Public path:** `/lp/{path}` (`LpPathSchema`: `^[a-z0-9]+(?:-[a-z0-9]+)*$`).  
**Golden de referência:** `components/lp/campina/LPCampinaV2.tsx` (copy + urgência IDECAN).

---

## Framework de copy (C5–C6)

### PAS (Wiebe) — estrutura mínima

1. **Problem** — dor na voz do aluno (VoC), não jargão de marketing.  
2. **Agitation** — custo de continuar errado (prova, banca, tempo).  
3. **Solution** — AVANT / estudo reverso / Pro — **depois** da dor.

### Self-image TE (Wolf)

- Bom: “feito para Técnico”, “não para enfermeiro”, “técnico aprovado…”.  
- Ruim: “equipe de especialistas”, “material completo de enfermagem” ambíguo, tom de graduação.

### Headline (Aagaard)

Preferir **benefício claro** ao visitante. Evitar pergunta fraca no H1 (“Você quer passar?”) sem resposta imediata.  
CTA: design = **onde** clicar; copy = **por que** (`Começar meu…` / `Assinar…` / valor no botão).

### Campos CMS (concurso) — preencher todos

`headlinePrincipal`, `subtitulo`, 3× `dores`, 3× `perigosBanca`, `listaBeneficios[]`, `disclaimer`, `disclaimerLegal` + bloco `concurso` (cidade, banca, datas, vagas, remuneração, taxa, órgão) + SEO (`title` ≤120, `description` ≤320).

---

## Design de conversão (C8, C16)

| Regra | Home | LP concurso |
|-------|------|-------------|
| Skin | Editorial (`#f1f5f9`, CTA `#8fe020`) | Cyber (`#010409`, cyan) |
| 1 CTA primário / viewport | Sim | Sim |
| Sticky CTA mobile | `LandingStickyCta` | Nav / checkout sticky do template |
| Demo / preview | Bloco cyber do produto | `NeuroSlideCarousel` no hero |
| Contraste CTA | Squint test (Aagaard) | Idem |
| Mobile 375 | `pb-safe`, sem overflow-x | Idem |

**`LP: polish visual`:** alterar só layout/tokens/componentes; **não** reescrever `landingCopy` / CMS copy salvo pedido explícito. Skill: `avant-ui-visual` (shell); CRO continua neste doc.

---

## Auditoria LIFT rápida (C2–C4, C11–C13)

Antes de declarar pronto, responder em 6 linhas:

| Fator | Pergunta |
|-------|----------|
| **Value** | Em 5s fica claro o que é e para quem (TE)? |
| **Relevance** | Mensagem bate com o anúncio/edital/fonte de tráfego? |
| **Clarity** | H1 + CTA óbvios? Eyeflow sem ruído? |
| **Urgency** | Há motivo real de agir agora (prova/inscrição) — sem fake? |
| **Anxiety↓** | FAQ/microcopy matam cartão, golpe, “serve pra mim”? |
| **Distraction↓** | Links/CTAs secundários não roubam o job? |

---

## Anti-padrões (proibidos)

- CTA primário + secundário com mesmo peso visual  
- Hero com stats, preço, FAQ e form todos acima da dobra  
- Copy reciclada de outro concurso sem trocar banca/dores  
- “Últimas horas” sem data real  
- Roxo/teal drift (`#6735BC` / `#00CDA0`) ou indigo SaaS genérico  
- LP de concurso com skin Editorial “clara” sem motivo (quebra o golden Cyber)  
- Homepage completa no lugar de LP de campanha (Gardner: manda tráfego pago para página focada)

---

## Ship checklist

### Visual

- [ ] Desktop ~1440 e mobile 375 — sem overflow horizontal  
- [ ] Contraste AA; alvos ≥44px  
- [ ] Skin correta (Editorial home / Cyber LP)  
- [ ] 1 H1; CTA primário óbvio no squint test  

### CRO / copy

- [ ] Fase 0 brief preenchido  
- [ ] PAS + TE self-image  
- [ ] LIFT 6/6 respondido  
- [ ] Try-before-buy ou walkthrough presente  
- [ ] FAQ / microcopy anti-ansiedade  
- [ ] Disclaimer legal presente (concurso)  

### Técnico

- [ ] Home: strings em `landingCopy.ts`  
- [ ] Concurso: `LpPageConfigSchema` + `LpPageSeoSchema` validam  
- [ ] Path reservado ok (`lib/lp/reservedPaths.ts`)  
- [ ] SEO: title, description, canonical `/lp/...`  
- [ ] Checkout Pro funciona no fluxo existente (`useProCheckout`)  
- [ ] E2E visual home quando tocado: `e2e/audit-visual-editorial-v2.spec.ts` / helpers `landingE2e`  

### Publicação (só concurso)

1. Salvar rascunho no admin  
2. Preview `/lp/<path>` (se política do ambiente permitir)  
3. **Publicar só com pedido explícito** do usuário  

---

## Pós-ship (C14)

| Métrica | Home | LP concurso |
|---------|------|-------------|
| Primária | Conta criada / trial | Checkout Pro iniciado / pago |
| Secundária | Scroll até pricing; clique demo | Clique CTA; tempo até prova (contexto) |
| UTM | campanhas brand | `utm_campaign` no CMS |

Iterar com **hipótese** (Laja/Ekman): “Se trocarmos X (headline/CTA), Y sobe porque Z (VoC).” Não mudar cor de botão no escuro.

---

## Formato de entrega do agente

**[BRIEF]** — tabela Fase 0 (curta)  
**[DECISÃO]** — variante A/B + job + CTA  
**[DIFF]** — arquivos tocados (`landingCopy`, seções, CMS fields, `LPConcurso` / Campina)  
**[LIFT]** — 6 respostas  
**[SHIP]** — checklist; se concurso, “aguardando ‘pode publicar’” quando aplicável  

---

## Referências

| Doc / código | Papel |
|--------------|--------|
| [`LP_RESEARCH_CAPABILITY_MAP.md`](LP_RESEARCH_CAPABILITY_MAP.md) | Por que C1–C16 |
| [`LANDING-AVANT-v3.md`](auditoria-visual-v2/LANDING-AVANT-v3.md) | Brief histórico home |
| [`DESIGNER_FRONT_AVANT.md`](DESIGNER_FRONT_AVANT.md) | Trilho C — Landing/LP |
| `lib/marketing/landingCopy.ts` | Copy home |
| `app/(admin)/admin/landings/` | CMS |
| `lib/lp/*` | Pages, SEO, defaults |
| Skill `avant-ui-visual` | Polish visual **sem** CRO |
