# AVANT — arquivo Cyber Clinical v1

Ponto de restauração do **AVANT completo** (código + logo + marca) antes de qualquer rebrand ou landing tradicional.

**Data do arquivo:** 2026-06-10  
**Tag Git:** `avant/cyber-clinical-v1`

---

## Restaurar tudo pelo GitHub (recomendado)

A tag congela **todo o repositório** na data acima — landing, player, NeuroSlides, CSS, APIs, etc.

### Clonar essa versão

```bash
git clone https://github.com/SEU_USER/AVANT.git
cd AVANT
git checkout avant/cyber-clinical-v1
```

### No repo que você já tem

```bash
# Ver o que mudou desde o snapshot
git diff avant/cyber-clinical-v1

# Voltar o projeto inteiro para essa versão (cuidado: sobrescreve arquivos locais)
git checkout avant/cyber-clinical-v1 -- .

# Ou trabalhar numa branch separada
git checkout -b restore-cyber avant/cyber-clinical-v1
```

### Publicar a tag (após push)

```bash
git push origin avant/cyber-clinical-v1
```

---

## O que o Git **não** guarda

| Fora do repo | Ação |
|--------------|------|
| `.env` (Supabase, Stripe, Resend…) | Cópia segura no vault |
| Dados no Supabase (questões, usuários) | Backup do projeto Supabase |
| Secrets de produção | Nunca commitar no Git |

Migrations e schema versionados no repo voltam com o checkout da tag.

---

## Restaurar só logo/marca (sem checkout completo)

Use os arquivos nesta pasta quando quiser **apenas** o visual da marca, sem reverter o resto do código.

| Item | Caminho no arquivo | Fonte viva no repo |
|------|-------------------|-------------------|
| SVGs de marca | `brand/*.svg` | `public/brand/` |
| Ícone PWA | `brand/avant-pwa-icon.png` | `public/brand/avant-pwa-icon.png` |
| App icon (legado Next) | `brand/app-icon-legacy.png` | `app/icon.png` |
| Constantes (cores, raio, tamanhos) | `snapshots/avantLogoConstants.ts` | `lib/brand/avantLogoConstants.ts` |
| Componente React | `snapshots/AvantLogo.tsx` | `components/brand/AvantLogo.tsx` |
| Animação lockup | `snapshots/avant-logo-animation.css` | `app/globals.css` (`avantLogoPulse`) |

### Passos

1. Copiar `brand/*` → `public/brand/`
2. Alinhar `snapshots/avantLogoConstants.ts` com `lib/brand/avantLogoConstants.ts`
3. Alinhar `snapshots/AvantLogo.tsx` com `components/brand/AvantLogo.tsx`
4. Garantir `@keyframes avantLogoPulse` em `app/globals.css` (ver `snapshots/avant-logo-animation.css`)

Ou via tag, só os arquivos de marca:

```bash
git checkout avant/cyber-clinical-v1 -- public/brand lib/brand components/brand/AvantLogo.tsx
```

---

## Identidade do logo (referência rápida)

- **Ícone:** gradiente roxo `#3018c8` → `#180c80`, raio verde-limão `#d8ff70` → `#8fe020` → `#58b800`
- **Lockup:** barra accent `#8fe020`, fundo interno `#0d0d18`, wordmark Syne em gradiente verde
- **Variantes:** `icon` (só raio) e `lockup` (ícone + AVANT) — ver `AvantLogo.tsx`
- **Uso no site:** `PublicDarkSiteHeader`, login, register, e-mails

> **Nota:** `app/icon.png` pode diferir do `AvantLogo` React. O canônico no produto é **`AvantLogo` + `public/brand/`**.

---

## Arquivos-chave do visual Cyber Clinical (na tag)

- `app/globals.css` — tokens `--color-surface-*`, `--color-brand`, animação logo
- `tailwind.config.ts` — paleta `clinical.*`
- `components/landing/LandingHome.tsx` — landing dark
- `components/brand/AvantLogo.tsx` — logo React
- `lib/brand/avantLogoConstants.ts` — geometria e cores
- `public/brand/` — SVGs exportáveis
