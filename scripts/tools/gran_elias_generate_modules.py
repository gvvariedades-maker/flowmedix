#!/usr/bin/env python3
"""Generate enriched module MD files from outlines + module metadata."""

from __future__ import annotations

import json
from pathlib import Path

BASE = Path(__file__).resolve().parents[2]
OUTLINE_BASE = BASE / "data/sources/lingua-portuguesa/gran-elias-essencial-temas-quentes/outlines"
MODULES_DIR = BASE / ".cursor/skills/professor-elias-santana-metodo/modules"

FNAME_MAP = {
    "M01": "M01-ortografia-enriquecido.md",
    "M02": "M02-morfologia-enriquecido.md",
    "M03": "M03-sujeito-enriquecido.md",
    "M04": "M04-predicacao-enriquecido.md",
    "M05": "M05-termos-nome-enriquecido.md",
    "M06": "M06-funcoes-ps-enriquecido.md",
    "M07": "M07-periodo-composto-enriquecido.md",
    "M08": "M08-pontuacao-enriquecido.md",
    "M09": "M09-colocacao-pronominal-enriquecido.md",
    "M10": "M10-vozes-se-enriquecido.md",
    "M11": "M11-crase-enriquecido.md",
    "M12": "M12-reescrita-enriquecido.md",
    "M13": "M13-concordancia-enriquecido.md",
    "M14": "M14-verbos-enriquecido.md",
    "M15": "M15-formacao-palavras-enriquecido.md",
    "M16": "M16-fonetica-enriquecido.md",
}

MODULES: dict[str, dict] = {
    "M01": {
        "name": "Ortografia e acentuação",
        "aulas_gc": "1–6",
        "pergunta_teste": "Onde está a sílaba tônica? É ditongo ou hiato?",
        "subtopico": "Ortografia e acentuação",
        "subtemas": "Prosódia; acentuação (oxítona, paroxítona, proparoxítona); acentos diferenciais; hífen e reforma; S/Z, X/CH, G/J",
        "decore": "Monossílabos tônicos (a, à, há); paroxítonas em ditongo; proparoxítonas sempre acentuadas",
        "danger": ["Ditongo × hiato", "Acento diferencial (pôde/pode)", "Hífen na reforma"],
        "concept_map": "Sílaba tônica · Regra por terminação · Ditongo/hiato",
        "golden_rule": "rows: terminações + hífen (casos de prova)",
    },
    "M02": {
        "name": "Morfologia",
        "aulas_gc": "7–12",
        "pergunta_teste": "O que esta palavra faz na oração?",
        "subtopico": "Morfologia",
        "subtemas": "Classes abertas/fechadas; substantivo, adjetivo, artigo, numeral; pronome, verbo; advérbio, preposição, conjunção",
        "decore": "Classes fechadas; pronomes relativos; conjunções coordenadas/subordinadas cobradas",
        "danger": ["Adjetivo × advérbio (-mente)", "Pronome × artigo", "Classe fora de contexto"],
        "concept_map": "Classe na frase · Flexão · Palavra vs função sintática",
        "golden_rule": "Tabela classes abertas/fechadas; pronomes por tipo",
    },
    "M03": {
        "name": "Sintaxe PS — Sujeito",
        "aulas_gc": "13–18",
        "pergunta_teste": "Verbo primeiro → Quem? (concorda com o verbo)",
        "subtopico": "Sintaxe do período simples",
        "subtemas": "Sujeito expresso (simples/composto); anteposto/posposto; elíptico; indeterminado; oração sem sujeito",
        "decore": "Tipos de sujeito + teste operacional (Quem?)",
        "danger": ["Elíptico × indeterminado", "Sujeito × predicativo", "Sem sujeito × indeterminado"],
        "concept_map": "Verbo primeiro · Quem? · Expresso×oculto · Elíptico×indeterminado",
        "golden_rule": "rows: tipos de sujeito + pergunta-teste",
        "skip_if_exists": True,
        "piloto": "examples/questao-premium-epice-portugues-sujeito-eliptico.json",
    },
    "M04": {
        "name": "Predicação verbal",
        "aulas_gc": "19–22",
        "pergunta_teste": "O verbo liga ou indica ação? O quê? A quem?",
        "subtopico": "Predicação verbal",
        "subtemas": "Verbo de ligação; transitividade; predicado verbal/nominal; complementos verbais e nominais",
        "decore": "Verbos de ligação + complementos típicos; transitividade em tabela",
        "danger": ["Transitivo × intransitivo", "Predicado verbal × nominal", "OD × predicativo do objeto"],
        "concept_map": "Ligação × ação · Transitividade · Complemento verbal",
        "golden_rule": "Verbos de ligação; transitividade (intrans./TD/TI/bitrans.)",
    },
    "M05": {
        "name": "Termos ligados ao nome",
        "aulas_gc": "23–25",
        "pergunta_teste": "Modifica qual nome? De quê?",
        "subtopico": "Termos ligados ao nome",
        "subtemas": "Adjunto adnominal; complemento nominal; aposto; vocativo",
        "decore": "Teste De quê? para CN; vocativo — vírgula",
        "danger": ["Adjunto adnominal × CN", "Aposto × adjunto", "Vocativo × sujeito"],
        "concept_map": "Nome-âncora · Adjunto × complemento · Aposto",
        "golden_rule": "CN = De quê? + prep.; vocativo isolado por vírgula",
    },
    "M06": {
        "name": "Demais funções sintáticas do PS",
        "aulas_gc": "26",
        "pergunta_teste": "O quê? / A quem? / Onde? / Por quem?",
        "subtopico": "Sintaxe do período simples",
        "subtemas": "OD, OI, adjunto adverbial, agente da passiva, predicativo",
        "decore": "Tabela funções + pergunta-teste por função",
        "danger": ["OD × OI", "Adjunto adverbial × OI", "Agente × sujeito na passiva"],
        "concept_map": "Funções após o verbo · Perguntas-teste",
        "golden_rule": "OD/OI/adjunto/agente — pergunta-teste",
    },
    "M07": {
        "name": "Período composto",
        "aulas_gc": "27–41",
        "pergunta_teste": "Que função / sentido liga as orações?",
        "subtopico": "Período composto",
        "subtemas": "Introdução PC; substantivas; adjetivas; adverbiais; coordenadas; reduzidas e justapostas",
        "decore": "Conectivos por valor semântico; mapa funções substantivas",
        "danger": ["Subjetiva × objetiva", "Restritiva × explicativa", "Coordenada × subordinada"],
        "concept_map": "Oração principal × subordinada · Sentido da ligação · Conectivo-chave",
        "golden_rule": "rows: conectivos + valor; funções substantivas",
        "outline_modules": ["M07", "M07a"],
        "extra_blocks": [
            {
                "title": "M07b — Orações subordinadas adjetivas (aulas 31–36)",
                "pergunta": "Restringe ou apenas explica o antecedente?",
                "danger": ["Restritiva (sem vírgula) × explicativa (vírgulas)", "QUE × QUEM × ONDE"],
            },
            {
                "title": "M07c — Orações adverbiais e coordenadas (aulas 37–39)",
                "pergunta": "Que sentido liga as orações? (causa, tempo, condição…)",
                "danger": ["Coordenada × subordinada", "Adversativa × concessiva"],
            },
            {
                "title": "M07d — Orações reduzidas e justapostas (aulas 40–41)",
                "pergunta": "Qual oração completa está subentendida?",
                "danger": ["Reduzida de infinitivo × gerúndio", "Justaposição × subordinação"],
            },
        ],
    },
    "M08": {
        "name": "Pontuação",
        "aulas_gc": "42–48",
        "pergunta_teste": "O que a vírgula isola? Muda o sentido sem ela?",
        "subtopico": "Pontuação",
        "subtemas": "Vírgula (enumeração, aposto, vocativo, intercalada); ponto e vírgula; dois-pontos; travessão",
        "decore": "Vírgula obrigatória: vocativo, aposto explicativo, oração intercalada",
        "danger": ["Vírgula obrigatória × facultativa", "Restritiva × explicativa", "Aposto × adjunto"],
        "concept_map": "Função da pontuação · Vírgula decisiva · Pegadinha de sentido",
        "golden_rule": "Casos de vírgula obrigatória/proibida",
        "essencial": False,
    },
    "M09": {
        "name": "Pronomes e colocação pronominal",
        "aulas_gc": "49–53",
        "pergunta_teste": "Há fator de próclise?",
        "subtopico": "Colocação pronominal",
        "subtemas": "Pronomes oblíquos; próclise, mesóclise, ênclise; fatores de atração",
        "decore": "Fatores de próclise (não, nunca, que, quem…); início de frase → ênclise",
        "danger": ["Próclise × ênclise", "Fator de atração ignorado", "Mesóclise no futuro do pretérito"],
        "concept_map": "Pronome oblíquo · Fatores de atração · Colocação",
        "golden_rule": "rows: fatores de próclise",
    },
    "M10": {
        "name": "Vozes verbais e SE",
        "aulas_gc": "54–57",
        "pergunta_teste": "SE = índice, partícula ou pronome? Quem pratica?",
        "subtopico": "Vozes verbais",
        "subtemas": "Voz ativa, passiva, reflexiva; SE índice, partícula apassivadora, pronome reflexivo",
        "decore": "Teste do SE em 3 funções + agente da ação",
        "danger": ["SE índice × partícula × pronome", "Passiva sintética × reflexiva"],
        "concept_map": "Voz verbal · Função do SE · Agente",
        "golden_rule": "SE: índice / partícula / pronome — teste operacional",
        "essencial": False,
    },
    "M11": {
        "name": "Crase",
        "aulas_gc": "58–62",
        "pergunta_teste": "A + A = crase? (prep. a + artigo feminino)",
        "subtopico": "Crase",
        "subtemas": "Crase obrigatória, proibida, facultativa; locuções; antes de feminino",
        "decore": "Proibida: antes de masculino, verbo, pronome pessoal; locuções femininas fixas",
        "danger": ["Obrigatória × proibida × facultativa", "Antes de verbo × nome feminino"],
        "concept_map": "Preposição A · Artigo A · Teste da crase",
        "golden_rule": "rows: obrigatória / proibida / facultativa",
        "l3": "pt_crase",
    },
    "M12": {
        "name": "Reescrita",
        "aulas_gc": "63–64",
        "pergunta_teste": "Mantém sentido, regência e tempo?",
        "subtopico": "Reescrita de frases",
        "subtemas": "Equivalência sintática; substituição de conectivos; voz ativa/passiva; nominalização",
        "decore": "Pares de equivalência cobrados (FGV)",
        "danger": ["Conectivo sinônimo falso", "Tempo verbal alterado"],
        "concept_map": "Equivalência · Conectivo · Tempo verbal",
        "golden_rule": "Pares ativo/passivo; conectivos equivalentes",
        "essencial": False,
        "banca": "FGV — nuance semântica",
    },
    "M13": {
        "name": "Concordância especial",
        "aulas_gc": "65–66",
        "pergunta_teste": "Qual o núcleo do sujeito? Com o que concorda?",
        "subtopico": "Concordância verbal e nominal",
        "subtemas": "Sujeito composto; porcentagem; partitivo; meio/meia; impessoais; ideológica",
        "decore": "Mais de um → singular; Um dos que → plural; Meio advérbio → invariável",
        "danger": ["Partitivo", "Meio advérbio × numeral", "Ideológica × gramatical"],
        "concept_map": "Núcleo concordante · Caso especial · Pegadinha de número",
        "golden_rule": "rows: casos especiais + regra",
        "essencial": False,
    },
    "M14": {
        "name": "Verbos (tempos, modos, conjugação)",
        "aulas_gc": "67–76",
        "pergunta_teste": "Tempo + modo + correlação temporal?",
        "subtopico": "Verbos",
        "subtemas": "Tempos e modos; conjugação regular/irregular; particípio; tempos compostos; correlação",
        "decore": "Irregularidades: haver, ir, vir, dar, ver, caber, trazer; particípios irregulares",
        "danger": ["Pretérito perfeito × imperfeito", "Particípio irregular", "Correlação temporal"],
        "concept_map": "Tempo verbal · Modo · Correlação",
        "golden_rule": "Tabela correlação temporal; particípios irregulares",
        "essencial": False,
    },
    "M15": {
        "name": "Formação de palavras",
        "aulas_gc": "77–78",
        "pergunta_teste": "Derivação ou composição?",
        "subtopico": "Formação de palavras",
        "subtemas": "Derivação prefixal/sufixal; composição; hibridismo; empréstimo",
        "decore": "Processos + exemplos de prova",
        "danger": ["Prefixo × sufixo", "Justaposição × aglutinação"],
        "concept_map": "Radical · Afixo · Composição",
        "golden_rule": "Derivação vs composição — teste",
        "essencial": False,
    },
    "M16": {
        "name": "Fonética e fonologia",
        "aulas_gc": "79–81",
        "pergunta_teste": "Quantos fonemas? Dígrafo ou duas letras?",
        "subtopico": "Fonética e fonologia",
        "subtemas": "Fonema, letra, sílaba; encontros vocálicos/consonantais; dígrafos",
        "decore": "Dígrafos cobrados; contagem de fonemas",
        "danger": ["Fonema × letra", "Ditongo × hiato (ponte M01)", "Dígrafo × encontro consonantal"],
        "concept_map": "Fonema · Sílaba · Dígrafo",
        "golden_rule": "Dígrafos + contagem fonêmica",
        "essencial": False,
    },
}


def load_outlines(module_ids: list[str]) -> list[dict]:
    items: list[dict] = []
    for mod in module_ids:
        folder = OUTLINE_BASE / mod
        if not folder.exists():
            continue
        for p in sorted(folder.glob("*.json")):
            if p.name.endswith("-manifest.json"):
                continue
            items.append(json.loads(p.read_text(encoding="utf-8")))
    return items


def lesson_section(outline: dict) -> str:
    title = outline.get("title", outline.get("slug", "Aula"))
    lines = [f"### {title}", ""]
    if outline.get("headings"):
        lines.append("**Eixos da aula (estrutura degravação):**")
        for h in outline["headings"][:12]:
            if h.upper() not in ("LÍNGUA PORTUGUESA", "GRAMÁTICA"):
                lines.append(f"- {h}")
        lines.append("")
    if outline.get("obs"):
        lines.append("**Obs. de prova:**")
        for o in outline["obs"][:5]:
            lines.append(f"- {o[:200]}")
        lines.append("")
    if outline.get("numbered_items"):
        lines.append("**Exemplos / itens numerados (reescrever no handcraft):**")
        for e in outline["numbered_items"][:6]:
            lines.append(f"- {e}")
        lines.append("")
    if outline.get("keywords"):
        lines.append(f"**Keywords:** {', '.join(outline['keywords'][:10])}")
        lines.append("")
    lines.append(
        "**→ NeuroSlides:** `concept_map` taxonomia · `golden_rule` decore · "
        "`logic_flow` eliminação · `danger_zone` distinção fina"
    )
    lines.append("")
    return "\n".join(lines)


def operational_table(meta: dict) -> str:
    rows = [
        ("**Gramática Completa**", f"aulas {meta['aulas_gc']}"),
        ("**Pergunta-teste**", meta["pergunta_teste"]),
        ("**Subtemas**", meta.get("subtemas", "—")),
        ("**Decore seletivo**", meta.get("decore", "—")),
        ("**`concept_map`**", meta.get("concept_map", "—")),
        ("**`golden_rule`**", meta.get("golden_rule", "—")),
        ("**`meta.subtopico`**", meta["subtopico"]),
    ]
    if meta.get("piloto"):
        rows.append(("**Piloto AVANT**", f"`{meta['piloto']}`"))
    if meta.get("banca"):
        rows.append(("**Banca típica**", meta["banca"]))
    lines = ["## Conteúdo operacional (Gramática Completa §4)", "", "| Campo | Conteúdo |", "|-------|----------|"]
    for k, v in rows:
        lines.append(f"| {k} | {v} |")
    lines.append("")
    return "\n".join(lines)


def generate_module(module_id: str, meta: dict) -> str:
    outline_mods = meta.get("outline_modules", [module_id])
    outlines = load_outlines(outline_mods)
    has_degr = bool(outlines)
    source = (
        "degravações Essencial Temas Quentes + Gramática Completa (crosswalk)"
        if has_degr
        else "Gramática Completa (syllabus público) — sem degravação no Essencial"
    )

    parts = [
        f"# {module_id} — {meta['name']} (enriquecido)",
        "",
        f"> **Fonte:** {source}",
        f"> **Pergunta-teste:** {meta['pergunta_teste']}",
        f"> **`meta.subtopico`:** {meta['subtopico']}",
        "",
    ]
    if meta.get("l3"):
        parts.append(f"> **L3:** `pedagogical_branch`: `{meta['l3']}`")
        parts.append("")

    parts.append(
        "Conteúdo **reescrito** para handcraft — não copiar frases da degravação nos slides."
    )
    parts.append("")
    parts.append(operational_table(meta))

    parts.extend(["## Distinções finas (`danger_zone`)", ""])
    for d in meta.get("danger", []):
        parts.append(f"- {d}")
    parts.append("")

    if outlines:
        parts.extend(["## Aulas — Essencial Temas Quentes (estrutura degravação)", ""])
        for o in outlines:
            parts.append(lesson_section(o))

    for block in meta.get("extra_blocks", []):
        parts.extend([
            f"## {block['title']}",
            "",
            f"**Pergunta-teste:** {block['pergunta']}",
            "",
            "**Distinções finas:**",
        ])
        for d in block.get("danger", []):
            parts.append(f"- {d}")
        parts.append("")
        parts.append(
            "**→ NeuroSlides:** aplicar mesma gramática de slots; sem degravação Essencial — "
            "usar exemplos bespoke da questão."
        )
        parts.append("")

    if not outlines and not meta.get("extra_blocks"):
        parts.extend([
            "## Sequência didática padrão",
            "",
            "Taxonomia em camadas → pergunta-teste → 2–4 exemplos → Obs. → questão de fixação.",
            "",
            "Índice mestre: [`reference-mapeamento-curso-completo.md`](../reference-mapeamento-curso-completo.md).",
            "",
        ])

    parts.extend([
        "## Checklist handcraft",
        "",
        f"- [ ] Pergunta-teste **{meta['pergunta_teste']}** explícita?",
        "- [ ] `logic_flow` com `reveal_mode: tap` e eliminação por motivo?",
        "- [ ] `danger_zone` com `correct` único por distrator?",
        "- [ ] Zero cópia de degravação; conteúdo bespoke da questão?",
        "",
    ])
    return "\n".join(parts)


def main() -> None:
    MODULES_DIR.mkdir(parents=True, exist_ok=True)
    written: list[str] = []

    for mod_id, meta in MODULES.items():
        out_file = MODULES_DIR / FNAME_MAP[mod_id]
        if meta.get("skip_if_exists") and out_file.exists():
            print(f"skip {out_file.name} (manual)")
            continue
        out_file.write_text(generate_module(mod_id, meta), encoding="utf-8")
        written.append(out_file.name)
        print(f"wrote {out_file.name}")

    index = [
        "# Índice — módulos enriquecidos (Elias / morfossintaxe)",
        "",
        "Mapa operacional para handcraft PT com método Gran. "
        "Outlines brutos: `data/sources/lingua-portuguesa/gran-elias-essencial-temas-quentes/outlines/`.",
        "",
    ]
    for mod_id in FNAME_MAP:
        fname = FNAME_MAP[mod_id]
        if (MODULES_DIR / fname).exists():
            name = MODULES[mod_id]["name"]
            index.append(f"- **[{mod_id} — {name}]({fname})**")
    index.extend([
        "",
        "Gerado por `scripts/tools/gran_elias_generate_modules.py`.",
        "Regerar após `gran_elias_extract_outlines.py`.",
    ])
    (MODULES_DIR / "README.md").write_text("\n".join(index), encoding="utf-8")
    print(f"Done — {len(written)} modules written (+ README)")


if __name__ == "__main__":
    main()
