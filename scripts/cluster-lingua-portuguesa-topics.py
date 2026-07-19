#!/usr/bin/env python3
"""
Extrai assuntos TecConcursos dos PDFs de Língua Portuguesa e agrupa em cards de estudo (titulo_aula).
Uso: python scripts/cluster-lingua-portuguesa-topics.py
Saída: artifacts/lingua-portuguesa-topic-cluster-report.json (+ .md)
"""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

import pypdf

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "data/sources/lingua-portuguesa"
OUT_JSON = ROOT / "artifacts/lingua-portuguesa-topic-cluster-report.json"
OUT_MD = ROOT / "artifacts/lingua-portuguesa-topic-cluster-report.md"

PDF_SOURCES = [
    ("portugues-caderno-2025-2026.pdf", 1, 200),
    ("portugues-caderno-2025-2026-q201-400.pdf", 201, 400),
    ("portugues-caderno-2025-2026-q401-600.pdf", 401, 600),
    ("portugues-caderno-2025-2026-q601-671.pdf", 601, 671),
]

HEADER_RE = re.compile(r"L.ngua Portuguesa \(Portugu.s\) - (.+?)\n", re.MULTILINE)
URL_RE = re.compile(r"www\.tecconcursos\.com\.br/questoes/(\d+)")

# Mapa governança: rótulo Tec (exato no PDF, UTF-8) → titulo_aula canônico (card vitrine / caderno)
TEC_TO_CARD: dict[str, str] = {
    "Tipologia e Gênero Textual": "Tipologia e gêneros textuais",
    "Coerência. Coesão (Anáfora, Catáfora, Uso dos Conectores - Pronomes Relativos, Conjunções, etc)": "Coesão, coerência e conectivos",
    "Artigo": "Classes de palavras",
    "Substantivo": "Classes de palavras",
    "Adjetivo": "Classes de palavras",
    "Advérbio": "Classes de palavras",
    "Preposição": "Classes de palavras",
    "Numeral": "Classes de palavras",
    "Conjunção": "Classes de palavras",
    "Questões Variadas de Classe de Palavras": "Classes de palavras",
    "Conjugação. Reconhecimento e Emprego dos Modos e Tempos Verbais": "Verbos — tempos, modos e vozes",
    "Locução Verbal": "Verbos — tempos, modos e vozes",
    "Correlação Verbal": "Verbos — tempos, modos e vozes",
    "Questões Variadas de Verbo": "Verbos — tempos, modos e vozes",
    "Vozes (Voz Passiva e Voz Ativa)": "Verbos — tempos, modos e vozes",
    "Colocação Pronominal": "Pronomes e colocação pronominal",
    "Pronomes Pessoais": "Pronomes e colocação pronominal",
    "Pronomes Relativos": "Pronomes e colocação pronominal",
    "Pronomes Possessivos": "Pronomes e colocação pronominal",
    "Pronomes Indefinidos": "Pronomes e colocação pronominal",
    "Questões Mescladas sobre Pronomes": "Pronomes e colocação pronominal",
    'Função Sintática dos Pronomes Pessoais Átonos': "Pronomes e colocação pronominal",
    "Frase, Oração e Período": "Frase, oração e período",
    "Sujeito": "Sujeito e predicado",
    "Predicado": "Sujeito e predicado",
    "Termos Acessórios (Adjunto Adnominal, Adjunto Adverbial e Aposto). Vocativo": "Termos da oração",
    "Termos Integrantes (Objeto Direto e Indireto, Complemento Nominal e Agente da Passiva)": "Termos da oração",
    "Adjunto adnominal x Complemento Nominal": "Termos da oração",
    "Funções Sintáticas dos Pronomes Relativos": "Termos da oração",
    "Orações Coordenadas": "Orações coordenadas e subordinadas",
    "Orações Subordinadas Adjetivas": "Orações coordenadas e subordinadas",
    "Orações Subordinadas Adverbiais": "Orações coordenadas e subordinadas",
    "Orações Subordinadas Substantivas": "Orações coordenadas e subordinadas",
    "Orações Reduzidas": "Orações coordenadas e subordinadas",
    "Questões Mescladas de Sintaxe": "Sintaxe — questões mescladas",
    "Concordância (Verbal e Nominal)": "Concordância verbal e nominal",
    "Regência Nominal e Verbal (Casos Gerais)": "Regência verbal e nominal",
    "Crase": "Crase",
    "Pontuação (Ponto, Vírgula, Travessão, Aspas, Parênteses, etc)": "Pontuação",
    "Sinônimos e Antônimos": "Sinônimos, antônimos e polissemia",
    "Polissemia": "Sinônimos, antônimos e polissemia",
    "Homônimos e Parônimos": "Sinônimos, antônimos e polissemia",
    "Denotação e Conotação": "Denotação, conotação e figuras de linguagem",
    'Vocábulo "Que"': 'Vocábulo "que" e partícula "se"',
    'Partícula "Se"': 'Vocábulo "que" e partícula "se"',
}

CARD_ORDER = [
    "Tipologia e gêneros textuais",
    "Coesão, coerência e conectivos",
    "Classes de palavras",
    "Verbos — tempos, modos e vozes",
    "Pronomes e colocação pronominal",
    "Frase, oração e período",
    "Sujeito e predicado",
    "Termos da oração",
    "Orações coordenadas e subordinadas",
    "Sintaxe — questões mescladas",
    "Concordância verbal e nominal",
    "Regência verbal e nominal",
    "Crase",
    "Pontuação",
    "Sinônimos, antônimos e polissemia",
    "Denotação, conotação e figuras de linguagem",
    'Vocábulo "que" e partícula "se"',
]

CARD_EIXO = {
    "Tipologia e gêneros textuais": "A — Texto",
    "Coesão, coerência e conectivos": "A — Texto",
    "Classes de palavras": "B — Morfologia",
    "Verbos — tempos, modos e vozes": "B — Morfologia",
    "Pronomes e colocação pronominal": "B — Morfologia",
    "Frase, oração e período": "C — Sintaxe",
    "Sujeito e predicado": "C — Sintaxe",
    "Termos da oração": "C — Sintaxe",
    "Orações coordenadas e subordinadas": "C — Sintaxe",
    "Sintaxe — questões mescladas": "C — Sintaxe",
    "Concordância verbal e nominal": "D — Norma",
    "Regência verbal e nominal": "D — Norma",
    "Crase": "D — Norma",
    "Pontuação": "D — Norma",
    "Sinônimos, antônimos e polissemia": "E — Vocabulário",
    "Denotação, conotação e figuras de linguagem": "E — Vocabulário",
    'Vocábulo "que" e partícula "se"': "E — Vocabulário",
}


def fix_encoding(text: str) -> str:
    for enc in ("latin-1", "cp1252"):
        try:
            return text.encode(enc).decode("utf-8")
        except (UnicodeDecodeError, UnicodeEncodeError):
            continue
    return text


def extract_questions() -> list[dict]:
    questions: list[dict] = []
    for filename, q_start, q_end in PDF_SOURCES:
        reader = pypdf.PdfReader(str(SOURCE_DIR / filename))
        text = "\n".join((page.extract_text() or "") for page in reader.pages)
        parts = re.split(r"(?=www\.tecconcursos\.com\.br/questoes/\d+)", text)
        for part in parts:
            url_match = URL_RE.search(part)
            header_match = HEADER_RE.search(part)
            if not url_match or not header_match:
                continue
            assunto = fix_encoding(header_match.group(1).strip())
            questions.append(
                {
                    "tec_id": url_match.group(1),
                    "source_file": filename,
                    "source_assunto_tec": assunto,
                }
            )
    return questions


def build_report(questions: list[dict]) -> dict:
    by_tec = Counter(q["source_assunto_tec"] for q in questions)
    unmapped = [a for a in by_tec if a not in TEC_TO_CARD]

    card_tec: dict[str, list[dict]] = defaultdict(list)
    for assunto, count in by_tec.items():
        card = TEC_TO_CARD.get(assunto, "UNMAPPED")
        card_tec[card].append({"source_assunto_tec": assunto, "count": count})

    study_cards = []
    for card in CARD_ORDER:
        items = sorted(card_tec.get(card, []), key=lambda x: (-x["count"], x["source_assunto_tec"]))
        total = sum(i["count"] for i in items)
        study_cards.append(
            {
                "titulo_aula": card,
                "modulo_nome": "Língua Portuguesa",
                "eixo": CARD_EIXO[card],
                "count": total,
                "pct": round(total / len(questions) * 1000) / 10 if questions else 0,
                "source_assuntos_tec": items,
                "status": (
                    "ok"
                    if 12 <= total <= 60
                    else ("merge_candidate" if total < 12 else "split_candidate")
                ),
            }
        )

    tec_rows = [
        {
            "source_assunto_tec": assunto,
            "count": count,
            "titulo_aula": TEC_TO_CARD.get(assunto, None),
        }
        for assunto, count in by_tec.most_common()
    ]

    return {
        "disciplina": "Língua Portuguesa",
        "modulo_nome": "Língua Portuguesa",
        "total_questoes": len(questions),
        "unique_assuntos_tec": len(by_tec),
        "study_cards_count": len(study_cards),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "classification_policy": "tema_real_no_handcraft; tec_label_como_source_assunto_tec; card_por_titulo_aula",
        "card_rules": {
            "min_questoes_por_card": 12,
            "max_questoes_por_card": 60,
            "merge_candidate": "count < 12 — fundir no handcraft se persistir",
            "split_candidate": "count > 60 — dividir no handcraft se persistir",
        },
        "unmapped_assuntos_tec": unmapped,
        "source_assuntos_tec": tec_rows,
        "study_cards": study_cards,
        "questions_index": questions,
    }


def write_markdown(report: dict) -> None:
    lines = [
        "# Língua Portuguesa — cluster de assuntos (PDF TecConcursos)",
        "",
        f"- **Questões:** {report['total_questoes']}",
        f"- **Assuntos Tec (rótulo PDF):** {report['unique_assuntos_tec']}",
        f"- **Cards de estudo (`titulo_aula`):** {report['study_cards_count']}",
        f"- **Gerado em:** {report['generated_at']}",
        "",
        "## Cards × rótulos Tec × contagem",
        "",
        "| Card (`titulo_aula`) | Eixo | Qtd | % | Status | Rótulos Tec fundidos |",
        "|----------------------|------|-----|---|--------|----------------------|",
    ]
    for card in report["study_cards"]:
        labels = "; ".join(f"{i['source_assunto_tec']} ({i['count']})" for i in card["source_assuntos_tec"])
        lines.append(
            f"| {card['titulo_aula']} | {card['eixo']} | {card['count']} | {card['pct']}% | {card['status']} | {labels} |"
        )

    lines.extend(
        [
            "",
            "## Todos os rótulos Tec (ordenados por volume)",
            "",
            "| Rótulo Tec | Qtd | Card |",
            "|------------|-----|------|",
        ]
    )
    for row in report["source_assuntos_tec"]:
        card = row["titulo_aula"] or "**UNMAPPED**"
        lines.append(f"| {row['source_assunto_tec']} | {row['count']} | {card} |")

    if report["unmapped_assuntos_tec"]:
        lines.extend(["", "## ⚠ Unmapped", ""])
        for a in report["unmapped_assuntos_tec"]:
            lines.append(f"- {a}")

    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    questions = extract_questions()
    if len(questions) != 671:
        raise SystemExit(f"Esperado 671 questões, extraído {len(questions)}")

    report = build_report(questions)
    if report["unmapped_assuntos_tec"]:
        raise SystemExit(f"Assuntos sem mapa: {report['unmapped_assuntos_tec']}")

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    write_markdown(report)

    print(f"[cluster:lingua-portuguesa] total={report['total_questoes']} tec={report['unique_assuntos_tec']} cards={report['study_cards_count']}")
    print(f"  json={OUT_JSON}")
    print(f"  md={OUT_MD}")
    for card in report["study_cards"]:
        flag = "" if card["status"] == "ok" else f" [{card['status']}]"
        print(f"  {card['count']:3d} ({card['pct']:4.1f}%) {card['titulo_aula']}{flag}")


if __name__ == "__main__":
    main()
