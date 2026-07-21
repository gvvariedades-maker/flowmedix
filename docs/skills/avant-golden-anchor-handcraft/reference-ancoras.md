# Matriz family → âncora

Abra **1** arquivo. Copie a **gramática** (como ensina), nunca o texto.

| Família / recorte | Âncora (`examples/`) | O que imitar |
|-------------------|----------------------|--------------|
| `vf` (afirmativas I–IV) | `questao-premium-cpcon-vias-im-vf.json` | julgar item a item; combinação só no fluxo |
| `vf` (intervalos/normas PNI) | `questao-premium-cpcon-imunizacao-intervalos-vf.json` | pegadinha-âncora nomeada; padrão da banca |
| `certo_errado` (C/E 2 opções) | `questao-premium-cpcon-poliomielite-pfa-vf.json` | critério + faixa oficial |
| `certo_errado` / **EXCETO / INCORRETA** | `questao-premium-cetrede-vias-injetaveis-incorreta.json` · `questao-premium-idib-umirim-itu-cateter-exceto.json` · `questao-premium-agirh-imunizacao-incorreta-antibiotico.json` | distratores = por que é CORRETO; só o gabarito = a exceção |
| `protocolo` (parâmetros) | `questao-premium-urgencias-rcp.json` · `questao-premium-cpcon-urgencias-anafilaxia-epinefrina-im.json` | `rows` com números + fonte; pegadinha de inversão |
| `calc` | `questao-premium-idecan-calculo-equivalencias-gotas.json` | dados → fórmula → resultado; unidade |
| `legis` | `questao-premium-sus-lei-8080-cesgranrio.json` | lei/artigo; direito × dever × proibição |
| `conceito` | `questao-premium-fundatec-meningococica-3meses.json` · `questao-premium-consulpam-vias-absorcao-oral.json` | 3–6 conceitos; exclusão por termo-chave |
| `text_fragment` | `questao-premium-fepese-anotacao-enfermagem-sae.json` | ler caso → decisão ancorada no fragmento |
| PT — crase / lacunas | `questao-premium-vunesp-portugues-crase-lacunas-ioga.json` | funil por lacuna; trilho letra a letra no fluxo |

## Quando usar qual (matriz — múltiplas âncoras)

Use **só** se o pacote **não** tiver `golden_anchors_registry` ou entrada por `command`/`pedagogical_branch`.

| Recorte | Arquivo | Quando |
|---------|---------|--------|
| **EXCETO** CETREDE | `cetrede-vias-injetaveis-incorreta` | INCORRETA em vias/farmacologia parenteral (inversão fisiológica) |
| **EXCETO** IDIB | `idib-umirim-itu-cateter-exceto` | EXCETO em punção/CVC/ITU/biossegurança de dispositivo |
| **EXCETO** AGIRH | `agirh-imunizacao-incorreta-antibiotico` | EXCETO/INCORRETA em Imunização (conduta × antibiótico/vacina) |
| **protocolo** RCP | `urgencias-rcp` | Parâmetros numéricos AHA/SBV (30:2, profundidade, frequência) |
| **protocolo** anafilaxia | `cpcon-urgencias-anafilaxia-epinefrina-im` | Dose/via/sequência de epinefrina; I/II em afirmativas |
| **conceito** meningocócica | `fundatec-meningococica-3meses` | Definição/indicação/calendário isolado |
| **conceito** absorção | `consulpam-vias-absorcao-oral` | Comparar vias/velocidade de absorção |
| **C/E 2 opções** | `cpcon-poliomielite-pfa-vf` | Só 2 alternativas (Certo/Errado), não MCQ A–E |
| **PT crase** | `vunesp-portugues-crase-lacunas-ioga` | Lacunas múltiplas; colocação/concordância → `*-portugues-colocacao-trilho.json` etc. |

Comando **EXCETO** ou **INCORRETA** na prova → âncora EXCETO, mesmo se `family=certo_errado`.

## O que extrair da âncora (por família)

| family | Extrair (estrutura) |
|--------|---------------------|
| `vf` | steps I→II→III→IV; `danger_zone` por combinação/romano falso, não só "Letra B" |
| `certo_errado` + EXCETO | fluxo isola exceção; `danger_zone` B–E = conduta **correta** |
| `protocolo` | `golden_rule.rows` com número + `sources[].covers`; inversão de parâmetro no fluxo |
| `calc` | dados no `concept_map` → fórmula nos steps → unidade antes da letra |
| `legis` | artigo/dispositivo nas rows; direito × dever × proibição |
| `conceito` | 3–6 items; exclusão por termo-chave no fluxo |
| `text_fragment` | `concept_map` ancora no trecho do caso; decisão cita dado do fragmento |

---

## Prioridade de resolução

```text
1. handcraft-registry.json → golden_anchors_registry (por subtópico)
2. Entrada no registry: family + pedagogical_branch + command
3. Recorte desta matriz (comando / tema / branch)
4. FAMILY_GOLDEN_FILE[meta.family] em classifyFamily.ts — último recurso
```

### Fallback `FAMILY_GOLDEN_FILE` (só passo 4)

| family | Arquivo fallback | Matriz prefere (recorte) |
|--------|------------------|--------------------------|
| `protocolo` | `admtec-urgencias-rcp-30-2-aha2020.json` | `urgencias-rcp` ou anafilaxia (tema da questão) |
| `certo_errado` | `idecan-cme-rt-funcao-certo.json` | `poliomielite-pfa` (C/E 2 op) ou âncora EXCETO (MCQ) |
| Demais | Igual à matriz acima | — |

---

## Registries TE (`data/catalog-migration/`)

| Arquivo | Subtópico |
|---------|-----------|
| `vias-golden-anchors.json` | Vias de Administração |
| `imunizacao-golden-anchors.json` | Imunização |
| `puncao-venosa-e-cuidados-com-cateteres-golden-anchors.json` | Punção Venosa e Cuidados com Cateteres |
| `calculo-golden-anchors.json` | Cálculo de Administração de Medicamentos e Infusões |
| `cuidados-na-administracao-de-medicamentos-golden-anchors.json` | Cuidados na Administração de Medicamentos |
| `farmacodinamica-golden-anchors.json` | Farmacodinâmica e Farmacocinética |
| `urgencias-golden-anchors.json` | Urgências e Emergências |
| `saude-da-mulher-golden-anchors.json` | Saúde da Mulher |
| `sinais-vitais-anchor-registry.json` | Verificação de Sinais Vitais *(nome legado; não segue padrão `*-golden-anchors.json`)* |

Dentro do registry: filtrar por `family` → `command` (EXCETO, INCORRETA, V/F…) → `pedagogical_branch`.

**PT:** sem registry unificado — `anchor_glob` do playbook (`examples/questao-premium-*-portugues-*.json`) por tema + `brief-lingua-portuguesa`.

---

## Subtópico → resolver âncora

Fonte: `data/catalog-migration/handcraft-registry.json`. Pacotes **sem** registry usam `anchor_glob` + matriz § acima.

| Subtópico | Resolver |
|-----------|----------|
| Assistência Perioperatória (Inclui SRPA) | glob `*-perioperatoria-*` |
| Cálculo de Administração de Medicamentos e Infusões | `calculo-golden-anchors.json` |
| Cuidados na Administração de Medicamentos | `cuidados-na-administracao-de-medicamentos-golden-anchors.json` |
| Curativos e Manejo de Feridas | glob `*-curativos-*` |
| Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.) | glob `*-bacterianas*` |
| Doenças Respiratórias Crônicas (Asma, DPOC) | glob `*-respiratorio-*` |
| Enfermagem do Trabalho | glob `*-enfermagem-trabalho-*` |
| Enfermagem em Central de Material e Esterilização (CME) | glob `*-cme-*` |
| Farmacodinâmica e Farmacocinética | `farmacodinamica-golden-anchors.json` |
| Feridas e Queimaduras | glob `*-feridas-queimaduras-*` |
| História da Enfermagem | glob `*-historia-enfermagem-*` |
| Imunização | `imunizacao-golden-anchors.json` |
| Infecções no Contexto da Biossegurança | glob `*-infeccoes-biosseguranca-*` (+ `idib-umirim-itu-cateter-exceto` se EXCETO CVC) |
| Língua Portuguesa | glob `*-portugues-*` · ver § PT |
| Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis | glob `*-dtrans-*` |
| Processamento de Artigos e Produtos de Saúde | glob `*-processamento-*` |
| Processo de Enfermagem | glob `*-processo-de-enfermagem*` / `*-sae-*` |
| Promoção à Saúde e Prevenção de Agravos | glob `sus-lei-8080` / `*-sus-*` |
| Punção Venosa e Cuidados com Cateteres | `puncao-venosa-e-cuidados-com-cateteres-golden-anchors.json` |
| Saúde da Criança | glob `*-saude-crianca-*` |
| Saúde da Mulher | `saude-da-mulher-golden-anchors.json` |
| Saúde do Adolescente | glob `*-saude-adolescente-*` |
| Saúde Mental | glob `*-saude-mental*` |
| Segurança do Paciente | glob `*-seguranca-paciente-*` |
| Urgências e Emergências | `urgencias-golden-anchors.json` |
| Verificação de Sinais Vitais | `sinais-vitais-anchor-registry.json` |
| Vias de Administração | `vias-golden-anchors.json` |

**15 subtópicos canônicos ainda sem pacote no registry** (usar matriz + `examples/questao-premium-*` por tema quando existir): Noções de Anatomia · Noções de Fisiologia · Instalação e Manejo de Sondas · Oxigenoterapia e Cuidados Respiratórios · Coleta de Exames Laboratoriais · Mobilização e Posicionamento do Paciente · Procedimentos Diversos · Medidas de Prevenção e Precaução de Contato · Epidemiologia e Vigilância Epidemiológica · Atenção Básica / Saúde da Família · ISTs · Doenças Virais · Doenças Parasitárias e Zoonoses · Questões Mescladas e Outras Doenças Agudas · Enfermagem em Centro Cirúrgico.

Glob completo por pacote: campo `anchor_glob` em `handcraft-registry.json`.

Voltar ao fluxo: [`SKILL.md`](SKILL.md).
