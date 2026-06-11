# ENFrente Enfermagem Continuada

| Campo | Valor |
|-------|-------|
| **ID roster** | B4 |
| **URL** | https://enfrenteenfermagem.com.br/ |
| **Categoria** | Nicho enfermagem — infoproduto / cursos + e-books |
| **Data da captura** | 2026-06-10 |
| **Auditor** | Playwright + agente AVANT |
| **Conta usada** | visitante (LP de vendas) |

> **Não é concorrente direto do AVANT** (não é banco de questões com app). Referência para **LP de infoproduto**, autoridade da professora, pricing com urgência e combos de material digital.

---

## Primeira impressão (3 palavras)

**Infoproduto · Urgência · Autoridade** — vitrine de cursos/e-books, ofertas relâmpago, bio longa da Profª Juliana Mello.

---

## Estrutura da LP

Fonte: [enfrenteenfermagem.com.br](https://enfrenteenfermagem.com.br/) — jun/2026.

### Hero

- Marca: **ENFRENTE ENFERMAGEM CONTINUADA**
- Promessa: *“GARANTA SUA APROVAÇÃO EM 2026”* — Preparação para Concursos e Residências
- Visual: banners “black-week” / oferta relâmpago

### Ofertas (cards empilhados)

| Produto | Preço | Destaque |
|---------|-------|----------|
| Curso completo enfermagem | ~~R$ 579,90~~ → 12× R$ 29,98 ou R$ 289,90 | 1 ano acesso ilimitado |
| Curso legislação SUS | ~~R$ 499,90~~ → 12× R$ 19,64 ou R$ 189,90 | Acesso vitalício |
| E-books individuais | a partir de R$ 14,90 | PDF, teoria + questões |
| Combo total e-books | 12× R$ 129,54 ou R$ 1.252,22 | Vitalício, todos os PDFs |

CTAs repetidos: **“CLIQUE AQUI E SAIBA MAIS”** / **“COMPRAR”**

### Bullets de produto (e-books)

- Conteúdo abrangente (específicas, SUS, epidemiologia)
- Teoria + questões gabaritadas
- Entrega digital por e-mail
- PDF imprimível

### Autoridade — Profª Juliana Mello

- 12 aprovações em concursos (5 em 1º lugar)
- 300k+ YouTube, 60k+ redes
- USP/EERP, gestão pública, ensino técnico
- Bio longa no rodapé da LP

### Rodapé

- “Ainda com dúvidas?” → Fale conosco
- Termos, privacidade, CNPJ

---

## Modo de cor

- [x] Claro (fundo claro + banners promocionais)
- [ ] Escuro
- [ ] Ambos

## Tokens observados (screenshot 2026-06-10)

| Token | Valor |
|-------|-------|
| Header / footer | `#222` charcoal |
| Fundo seção produtos | mint `#e0f7e9` |
| CTA primário | vermelho `#e60000` — “CLIQUE AQUI” / “COMPRAR” |
| CTA contato | verde WhatsApp `#34af23` |
| Logo / marca | verde + branco “EnFrente” |
| Badge urgência | vermelho “OFERTA RELÂMPAGO” |
| Texto | preto / cinza escuro |
| Raio cards | ~8–12px + sombra box |
| Tipografia | sans-serif (Roboto/Montserrat) |
| Layout | grid 3 colunas desktop → stack mobile |
| Personalidade | infoproduto promocional, não SaaS |

---

## Telhas

| ID | Desktop | Mobile | Notas |
|----|---------|--------|-------|
| T1 Landing | ☑ | ☑ | `screenshots/enfrente-enfermagem/T1-landing-*.png` |
| T2–T11 app | — | — | Sem app público auditável na URL principal |

---

## O que extrair como PADRÃO (para AVANT LP)

1. **Figura de autoridade** com credenciais numéricas (aprovações, alunos, concursos).
2. **Preço riscado + parcela** — âncora de valor antes do CTA.
3. **Escopo explícito** do que está incluso (1 ano, vitalício, PDF).
4. **FAQ / contato** no rodapé para reduzir fricção.

## O que REJEITAR

1. Estética **oferta relâmpago / black-week** — baixa confiança editorial.
2. Repetição de CTAs idênticos em cada card — parece landing genérica de curso.
3. Parede de texto na bio — AVANT deve resumir prova social.
4. Não há vitrine/player — **não usar como referência de área logada**.

---

## Comparativo com AVANT

| Aspecto | ENFrente | AVANT |
|---------|----------|-------|
| Modelo | Cursos + e-books PDF | Plataforma questões + Estudo Reverso |
| LP | Vitrine de produtos | Método + demo de questão |
| Público | Enfermeiro + residência | Técnico de enfermagem |
| Tom visual | Infoproduto promocional | Cyber Clinical (hoje) → editorial v2 |
| Diferencial | Profª + material impresso | NeuroSlides por questão |

---

## Scores T1 (preliminar)

| L | H | D | C | M | I | A | P | E | X |
|---|---|---|---|---|---|---|---|---|---|
| 3 | 3 | 2 | 3 | 4 | 2 | 3 | 4 | 3 | 2 |

_Legibilidade ok, mas hierarquia fraca (tudo grita “compre”); exclusividade baixa — template de infoproduto._

---

## Notas livres

Útil como **contraste negativo** na auditoria: mostra o que o AVANT v2 **não** deve parecer (Hotmart genérico), mesmo competindo no mesmo nicho de enfermagem/concursos.
