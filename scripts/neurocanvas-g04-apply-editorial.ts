#!/usr/bin/env tsx
/**
 * Gate de reprodutibilidade G0.4 — gerador/aplicador determinístico único.
 *
 * Motivo: o diretório de questões do catálogo é gitignored (.gitignore:60), logo os quatro
 * candidatos corrigidos do fechamento editorial G0.4 não seriam recriáveis a partir de arquivos
 * versionados. Este arquivo carrega o payload integral e é a única fonte versionada deles.
 *
 * Modos:
 *   --verify   materializa em catálogo temporário e confere os hashes semânticos (não escreve no real).
 *   --apply    escreve nas 11 cópias autorizadas do catálogo local.
 *   --keep-temp  preserva o diretório temporário do --verify.
 *
 * Salvaguardas do --apply, todas antes de qualquer escrita:
 *   1. cada payload passa por QuestaoCompletaSchema e precisa ter exatamente os 4 slides canônicos;
 *   2. só os 11 paths relativos de AUTHORIZED_RELATIVE_PATHS são aceitos;
 *   3. o path resolvido tem de ficar contido na raiz do catálogo;
 *   4. o hash atual de cada cópia tem de ser o hash anterior esperado, o hash novo, ou ausência;
 *   5. qualquer terceiro hash aborta a operação inteira — protege correção editorial mais recente;
 *   6. cópias já no hash novo são puladas (idempotência);
 *   7. escrita atômica (arquivo temporário no mesmo diretório + rename).
 *
 * Determinismo: serialização única `JSON.stringify(question, null, 2)` + newline.
 * Nunca toca em Supabase, manifests, registry, baseline ou constantes de gate.
 */
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';

import { canonicalJson } from '@/lib/neurocanvas/canonicalJson';
import { normalizeQuestionForComparison } from '@/lib/neurocanvas/canonicalCatalog';
import { QuestaoCompletaSchema } from '@/lib/validations';

/** Estado aceito de uma cópia antes da escrita: hash semântico anterior ou ausência do arquivo. */
export type PriorState = string;

export type G04Target = {
  lote: string;
  prior_semantic_sha256: PriorState;
};

export type G04EditorialPayload = {
  case_id: string;
  slug: string;
  decision: string;
  authority_manifest: string;
  targets: G04Target[];
  expected_semantic_sha256: string;
  expected_byte_sha256: string;
  question: Record<string, unknown>;
};

export const CANONICAL_SLIDE_TYPES = [
  'concept_map',
  'danger_zone',
  'golden_rule',
  'logic_flow',
] as const;

export const G04_EDITORIAL_PAYLOADS: G04EditorialPayload[] = [
  {
    "case_id": "nc-g03-5a0a557ebdec0f89",
    "slug": "ameosc-enfermagem-nocoes-de-fisiologia-1775448586547-7",
    "decision": "create_corrected_candidate",
    "authority_manifest": "data/catalog-migration/sinais-vitais-completo/manifest-handcraft.json",
    "targets": [
      {
        "lote": "nocoes-de-fisiologia-lote-01",
        "prior_semantic_sha256": "beae67f62b5d8a0c7c9ea026bed59272cc1937b56d9e34c0b1cb6318d40b2609"
      },
      {
        "lote": "sinais-vitais-completo",
        "prior_semantic_sha256": "7fdab5b4c7462b9db81a8ec9d5da3bd8c4f230c006bd8300497906500eff6a79"
      },
      {
        "lote": "verificacao-de-sinais-vitais-repair-lote-01",
        "prior_semantic_sha256": "7fdab5b4c7462b9db81a8ec9d5da3bd8c4f230c006bd8300497906500eff6a79"
      }
    ],
    "expected_semantic_sha256": "2c21cf9cb5c1e290076b935a4216447e0e25990de4e43848ae5b41b272d112ef",
    "expected_byte_sha256": "d17fa88bf74d9184a50105ef611f9c42d19e40091f666a7f96664be45fc32ecc",
    "question": {
      "meta": {
        "ano": "2025",
        "banca": "AMEOSC",
        "orgao": "Pref Guaraciaba (SC) / ESF",
        "prova": "Tec Enf (Pref Guaraciaba (SC))",
        "cargo_header": "Técnico de enfermagem",
        "topico": "Enfermagem",
        "subtopico": "Verificação de Sinais Vitais",
        "content_standard": "golden-v1",
        "family": "protocolo",
        "content_review": {
          "reviewed_at": "2026-07-27",
          "reviewer": "g04-editorial",
          "guideline_snapshot": "Pareamento AMEOSC (coluna da prova): Febre 38–39; estado febril 37,8–38; febrícula 37,5–37,7; normotermia até 37,4oC.",
          "exam_vs_current": "none"
        },
        "sources": [
          {
            "id": "ameosc-prova-001-2025-q4",
            "tier": "A",
            "issuer": "AMEOSC / selecao.net.br",
            "title": "PSS 001/2025 Pref. Guaraciaba — Prova TE Q4",
            "year": 2025,
            "url": "https://anexos.cdn.selecao.net.br/uploads/98/concursos/2451/anexos/74eda0be-3474-4115-8f01-88fb6c4ab627.zip",
            "covers": [
              "normotermia",
              "febrícula",
              "estado febril",
              "febre"
            ]
          },
          {
            "id": "ameosc-gabarito-2025-09-15",
            "tier": "A",
            "issuer": "AMEOSC",
            "title": "Gabarito definitivo 15/09/2025 — Prova 1 Q4 = D",
            "year": 2025,
            "url": "https://anexos.cdn.selecao.net.br/uploads/98/concursos/2451/anexos/7fb93fc3-cf32-4306-b084-42f8b606a0e1.pdf",
            "covers": [
              "gabarito D",
              "sequência 4-3-2-1"
            ]
          }
        ]
      },
      "question_data": {
        "instruction": "A temperatura corporal é um dos sinais vitais fundamentais para avaliação do estado de saúde de um paciente. Ela reflete o equilíbrio entre a produção e a perda\nde calor pelo corpo, sendo regulada principalmente pelo hipotálamo. Com base nas terminologias utilizadas, relacione a coluna 1 com a coluna 2.\nColuna 1\n(1)Normotermia\n(2)Febrícula\n(3)Estado febril\n(4)Febre\nColuna 2\n(__)Temperatura entre 38o e 39oC.\n(__)Temperatura entre 37,8o e 38oC.\n(__)Temperatura entre 37,5o e 37,7oC.\n(__)Temperatura entre 36o e 37,4oC.\nEm seguida, assinale a alternativa que apresenta a sequência CORRETA.",
        "options": [
          {
            "id": "A",
            "text": "2, 3, 4 e 1.",
            "is_correct": false
          },
          {
            "id": "B",
            "text": "4, 3, 1 e 2.",
            "is_correct": false
          },
          {
            "id": "C",
            "text": "1, 4, 3 e 2.",
            "is_correct": false
          },
          {
            "id": "D",
            "text": "4, 3, 2 e 1.",
            "is_correct": true
          }
        ]
      },
      "reverse_study_slides": [
        {
          "type": "concept_map",
          "slide_title": "Coluna térmica — o que casar",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Verificação de Sinais Vitais"
          },
          "items": [
            {
              "label": "Normotermia (1)",
              "detail": "Faixa da prova: 36o a 37,4oC (coluna da prova) na última lacuna.",
              "icon": "Thermometer"
            },
            {
              "label": "Febrícula (2)",
              "detail": "Faixa da prova: 37,5 °C a 37,7 °C.",
              "icon": "Activity"
            },
            {
              "label": "Estado febril (3)",
              "detail": "Faixa da prova: 37,8 °C a 38 °C.",
              "icon": "Flame"
            },
            {
              "label": "Febre (4)",
              "detail": "Faixa da prova: 38 °C a 39 °C na primeira lacuna.",
              "icon": "Thermometer"
            }
          ],
          "footer_rule": "Casa termo (coluna 1) com a faixa numérica (coluna 2), sem inverter limiares."
        },
        {
          "type": "logic_flow",
          "slide_title": "Pareamento 4 → 3 → 2 → 1",
          "reveal_mode": "tap",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Verificação de Sinais Vitais"
          },
          "steps": [
            "Identificar o comando: relacionar Coluna 1 (termos) com Coluna 2 (faixas).",
            "1ª lacuna (38–39 °C) → Febre = (4).",
            "2ª lacuna (37,8–38 °C) → Estado febril = (3).",
            "3ª lacuna (37,5–37,7 °C) → Febrícula = (2).",
            "4ª lacuna (36–37,4oC (coluna da prova)) → Normotermia = (1).",
            "Sequência montada: 4, 3, 2 e 1.",
            "Conferir alternativas: só D traz 4, 3, 2 e 1.",
            "Eliminar A (começa em 2), B (troca 2↔1 no fim), C (começa em 1).",
            "Marcar D — gabarito oficial AMEOSC Q4.",
            "Fixação: em pareamento térmico, leia as lacunas de cima para baixo e case 4→3→2→1 antes de olhar as letras."
          ],
          "footer_rule": "Ordem das lacunas da coluna 2 define a sequência; não reordene os termos."
        },
        {
          "type": "golden_rule",
          "slide_title": "Tabela de pareamento da prova",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Verificação de Sinais Vitais"
          },
          "content": "AMEOSC — temperatura corporal (Coluna 1 × Coluna 2)",
          "rows": [
            {
              "label": "38–39 °C",
              "value": "(4) Febre — faixa da coluna da prova",
              "sv_kind": "meta"
            },
            {
              "label": "37,8–38 °C",
              "value": "(3) Estado febril — faixa da coluna da prova",
              "sv_kind": "meta"
            },
            {
              "label": "37,5–37,7 °C",
              "value": "(2) Febrícula — faixa da coluna da prova",
              "sv_kind": "meta"
            },
            {
              "label": "4ª lacuna (normotermia)",
              "value": "(1) Normotermia — 36o a 37,4oC na coluna da prova",
              "sv_kind": "meta"
            }
          ],
          "footer_rule": "Decore a ordem das faixas na coluna 2: 4 → 3 → 2 → 1."
        },
        {
          "type": "danger_zone",
          "slide_title": "Distratores do pareamento",
          "bullet_style": "x_icon",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Verificação de Sinais Vitais"
          },
          "content": "PEGADINHAS — AMEOSC temperatura",
          "items": [
            {
              "label": "A — 2, 3, 4 e 1",
              "detail": "Começa pela febrícula na 1ª lacuna (38–39 °C).",
              "correct": "38–39 °C é Febre (4), não Febrícula (2)."
            },
            {
              "label": "B — 4, 3, 1 e 2",
              "detail": "Acerta as duas primeiras faixas e inverte normotermia/febrícula.",
              "correct": "36–37,4oC (coluna da prova) = (1); 37,5–37,7 °C = (2) — ordem final 2 e 1."
            },
            {
              "label": "C — 1, 4, 3 e 2",
              "detail": "Coloca normotermia na faixa de febre.",
              "correct": "1ª lacuna (38–39 °C) exige (4) Febre."
            },
            {
              "label": "Trocar febrícula × estado febril",
              "detail": "37,5–37,7 vs 37,8–38 são limiares vizinhos na prova.",
              "correct": "Estado febril = 37,8–38 (3); febrícula = 37,5–37,7 (2)."
            },
            {
              "label": "Em similares: inverter a coluna",
              "detail": "Transferência: outra banca troca a ordem das faixas na coluna 2.",
              "correct": "Sempre leia a coluna 2 de cima para baixo; não memorize só a letra D."
            }
          ],
          "footer_rule": "Só D preserva 4, 3, 2 e 1 sem inverter limiares vizinhos."
        }
      ],
      "modulo_slug": "ameosc-enfermagem-nocoes-de-fisiologia-1775448586547-7"
    }
  },
  {
    "case_id": "nc-g03-9c3c0a3a66aabf52",
    "slug": "educa-pb-enfermagem-nocoes-de-fisiologia-1775448599930-0",
    "decision": "create_corrected_candidate (item defeituoso: banca D vs técnico B)",
    "authority_manifest": "data/catalog-migration/sinais-vitais-completo/manifest-handcraft.json",
    "targets": [
      {
        "lote": "nocoes-de-fisiologia-lote-01",
        "prior_semantic_sha256": "d0b62a6b381f1db9b8dbd568cf4f7ece39f511bc5a6c26d0188e1230134abeaa"
      },
      {
        "lote": "sinais-vitais-completo",
        "prior_semantic_sha256": "98aa67ebfd46802fc7ae3c4ddb272c4346d88e1927d6342ea4cbac0e19690bbd"
      },
      {
        "lote": "verificacao-de-sinais-vitais-repair-lote-01",
        "prior_semantic_sha256": "98aa67ebfd46802fc7ae3c4ddb272c4346d88e1927d6342ea4cbac0e19690bbd"
      }
    ],
    "expected_semantic_sha256": "098fe3a41280911fec8e3961a42f74381fdae2e6a9413bfa31692eba558c8c06",
    "expected_byte_sha256": "57775b712e4ee5d3710f5f5cf46c87536396d8f8623c38c3c45f2da8e4631f46",
    "question": {
      "meta": {
        "ano": "2025",
        "banca": "Instituto EDUCA",
        "orgao": "Pref Pedras de Fogo",
        "prova": "TEf (Pedras de Fogo)",
        "cargo_header": "Técnico de enfermagem",
        "topico": "Enfermagem",
        "subtopico": "Verificação de Sinais Vitais",
        "content_standard": "golden-v1",
        "family": "protocolo",
        "content_review": {
          "reviewed_at": "2026-07-27",
          "reviewer": "g04-editorial",
          "guideline_snapshot": "POP HC-UFTM: FC adulta 60–100 bpm; bradipneia <12; taquipneia >20. Prova EDUCA Q34 chave D.",
          "exam_vs_current": "ITEM DEFEITUOSO: gabarito oficial EDUCA Q34=D (II e IV \"corretos\"); resposta técnica=B (II e IV clinicamente falsos — FC≠30–165; taquipneia≠FR<12)."
        },
        "sources": [
          {
            "id": "educa-prova-pedras-2025-q34",
            "tier": "A",
            "issuer": "Instituto EDUCA",
            "title": "Prova TE Pedras de Fogo 23/02/2025 — Q34",
            "year": 2025,
            "url": "https://educapb.com.br/wp-content/uploads/2025/02/Tecnico-em-Enfermagem.docxOKOK.pdf",
            "covers": [
              "sinais vitais",
              "FC",
              "FR",
              "taquipneia"
            ]
          },
          {
            "id": "educa-edital-014-2025-gabarito",
            "tier": "A",
            "issuer": "Instituto EDUCA",
            "title": "Edital Normativo 014/2025 — Q34 = D",
            "year": 2025,
            "url": "https://educapb.com.br/wp-content/uploads/2025/04/Edital-Normativo-no-14-2024-Retificacao-do-Gabarito-Oficial.pdf",
            "covers": [
              "gabarito D",
              "item defeituoso"
            ]
          },
          {
            "id": "pop-hc-uftm-sv-v6",
            "tier": "A",
            "issuer": "EBSERH / HC-UFTM",
            "title": "POP.HC-UFTM-DENF.003 v6 — sinais vitais",
            "year": 2025,
            "url": "https://www.gov.br/hubrasil/pt-br/hospitais-universitarios/regiao-sudeste/hc-uftm/documentos/procedimentos-e-rotinas-operacionais-padrao/pops/POP.HCUFTMDENF.003RotinadeRegistrodeSinaisVitaiseControlesversao6.pdf",
            "covers": [
              "FC 60–100",
              "taquipneia",
              "bradipneia"
            ]
          }
        ]
      },
      "question_data": {
        "instruction": "\"Os sinais vitais são parâmetros básicos que oferecem informações cruciais sobre as funções corporais relevantes, incluindo a temperatura corporal, a frequência\ncardíaca, a pressão arterial e a frequência respiratória. Esses indicadores funcionam como verdadeiros sentinelas, alertando para alterações que podem indicar problemas\nde saúde subjacentes ou emergentes.\"\nA respeito dos sinais vitais, suas definições e características, analise os itens a seguir:\nI- A temperatura corporal é um dos sinais vitais que reflete o equilíbrio térmico do corpo humano, essencial para o funcionamento adequado dos processos\nfisiológicos. A temperatura normal do corpo varia entre 36°C e 37°C.\nII- A frequência cardíaca (FC) é o número de batimentos do coração por minuto e é um dos sinais vitais que refletem o estado de saúde cardiovascular e a\ncapacidade do coração em bombear sangue para o corpo. A frequência normal em adultos em repouso varia entre 30 e 165 batimentos por minuto (bpm).\nIII- A pressão arterial (PA) é a força exercida pelo sangue nas paredes das artérias durante o ciclo cardíaco, sendo fundamental para o transporte de oxigênio e\nnutrientes pelo corpo. Ela é medida em dois valores: pressão sistólica e pressão diastólica. A unidade de medida é milímetros de mercúrio.\nIV- Taquipneia é quando a frequência respiratória é inferior a 12 respirações por minuto, o que pode ocorrer em casos de intoxicação, problemas neurológicos ou\ndistúrbios respiratórios.\nEstão INCORRETOS:",
        "options": [
          {
            "id": "A",
            "text": "O item I está correto e o item II errado.",
            "is_correct": false
          },
          {
            "id": "B",
            "text": "Os itens II e IV estão errados.",
            "is_correct": false
          },
          {
            "id": "C",
            "text": "O item III está correto.",
            "is_correct": false
          },
          {
            "id": "D",
            "text": "Os itens II e IV estão corretos.",
            "is_correct": true
          },
          {
            "id": "E",
            "text": "Os itens I e III estão corretos.",
            "is_correct": false
          }
        ]
      },
      "reverse_study_slides": [
        {
          "type": "concept_map",
          "slide_title": "Sinais vitais — banca × clínica",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Verificação de Sinais Vitais"
          },
          "items": [
            {
              "label": "Temperatura corporal (I)",
              "detail": "Equilíbrio térmico; temperatura normal 36°C a 37°C no item.",
              "icon": "Thermometer"
            },
            {
              "label": "Frequência cardíaca (II)",
              "detail": "Item cita 30 a 165 bpm — faixa clinicamente falsa para adulto em repouso.",
              "icon": "HeartPulse"
            },
            {
              "label": "Pressão arterial (III)",
              "detail": "Sistólica e diastólica em milímetros de mercúrio — correta.",
              "icon": "Activity"
            },
            {
              "label": "Frequência respiratória (IV)",
              "detail": "Chama taquipneia de FR inferior a 12 — inverte bradipneia.",
              "icon": "Wind"
            },
            {
              "label": "Pegadinha do item defeituoso",
              "detail": "A banca marca D (II e IV corretos) embora II e IV sejam erros clínicos.",
              "icon": "AlertTriangle"
            },
            {
              "label": "Sentinelas do enunciado",
              "detail": "Sinais vitais como sentinelas das funções corporais relevantes e alertas a problemas emergentes de saúde.",
              "icon": "Radar"
            }
          ],
          "footer_rule": "Parâmetros do enunciado: temperatura, frequência cardíaca, pressão arterial e frequência respiratória."
        },
        {
          "type": "logic_flow",
          "slide_title": "Como marcar D sem validar II/IV",
          "reveal_mode": "tap",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Verificação de Sinais Vitais"
          },
          "steps": [
            "Ler o texto sobre sinais vitais: temperatura corporal, frequência cardíaca, pressão arterial e frequência respiratória.",
            "Fixar parâmetros básicos do enunciado: batimentos do coração, paredes das artérias, oxigênio/nutrientes e intoxicação/distúrbios respiratórios.",
            "Analisar os itens I–IV e o comando Estão INCORRETOS / alternativas sobre corretos e errados.",
            "Julgar clinicamente: I aceitável (36°C–37°C); III correto (sistólica/diastólica em mmHg).",
            "Julgar clinicamente: II falso (30–165 bpm); IV falso (taquipneia ≠ inferior a 12).",
            "Registrar resposta técnica: Os itens II e IV estão errados → letra B.",
            "Abrir gabarito oficial retificado (Edital 014/2025): Q34 = D.",
            "Conferir texto de D: Os itens II e IV estão corretos — chave da banca.",
            "Marcar D na prova; marcar mentalmente ITEM DEFEITUOSO (banca D ≠ técnica B).",
            "Fixação: em item defeituoso de sinais vitais, separe chave oficial de FC/FR reais antes de estudar a tabela."
          ],
          "footer_rule": "Prova cobra D; POP/guideline cobram B — documentado em exam_vs_current."
        },
        {
          "type": "golden_rule",
          "slide_title": "Referência clínica (não a chave D)",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Verificação de Sinais Vitais"
          },
          "content": "EDUCA Q34 — estudar FC/FR corretos apesar do gabarito D",
          "rows": [
            {
              "label": "FC adulta (estudo)",
              "value": "60 a 100 bpm em repouso (não 30–165)",
              "sv_kind": "meta"
            },
            {
              "label": "FR — bradipneia",
              "value": "inferior a 12 respirações por minuto",
              "sv_kind": "meta"
            },
            {
              "label": "FR — taquipneia",
              "value": "frequência respiratória elevada (>20/min)",
              "sv_kind": "meta"
            },
            {
              "label": "PA (item III)",
              "value": "sistólica e diastólica em mmHg",
              "sv_kind": "meta"
            }
          ],
          "footer_rule": "Item defeituoso: chave oficial D; resposta técnica B — sem row de gabarito aqui."
        },
        {
          "type": "danger_zone",
          "slide_title": "Armadilhas deste item defeituoso",
          "bullet_style": "x_icon",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Verificação de Sinais Vitais"
          },
          "content": "PEGADINHAS — EDUCA sinais vitais (defeituoso)",
          "items": [
            {
              "label": "Decorar II como verdade clínica",
              "detail": "Frequência cardíaca 30 a 165 bpm no item \"correto\" da banca.",
              "correct": "Clinicamente falso; use 60 a 100 bpm no estudo — a chave D não valida a faixa."
            },
            {
              "label": "Aceitar IV como definição de taquipneia",
              "detail": "Item IV: frequência respiratória inferior a 12.",
              "correct": "Isso é bradipneia; taquipneia é FR elevada — resposta técnica seria B."
            },
            {
              "label": "Marcar B na prova EDUCA",
              "detail": "B descreve II e IV errados — leitura técnica correta.",
              "correct": "Na prova, a chave oficial é D; B fica como resposta técnica documentada."
            },
            {
              "label": "Em similares: confiar cegamente no gabarito",
              "detail": "Transferência: outra banca pode repetir faixas absurdas de FC/FR.",
              "correct": "Sempre confronte temperatura, frequência cardíaca, pressão arterial e frequência respiratória com POP/guideline."
            }
          ],
          "footer_rule": "Não confunda \"acertei a banca\" com \"aprendi FC/FR corretos\"."
        }
      ],
      "modulo_slug": "educa-pb-enfermagem-nocoes-de-fisiologia-1775448599930-0"
    }
  },
  {
    "case_id": "nc-g03-4cb9405b8309b9bc",
    "slug": "fenix-instituto-enfermagem-nocoes-de-anatomia-1775447762008-6",
    "decision": "create_corrected_candidate",
    "authority_manifest": "data/catalog-migration/nocoes-de-anatomia-lote-01/manifest.json",
    "targets": [
      {
        "lote": "nocoes-de-anatomia-lote-01",
        "prior_semantic_sha256": "1f02d5ac2cf3ae7abe88763fbee981277d36d02ff8dd850aea81196ed10a86a5"
      },
      {
        "lote": "urgencias-e-emergencias-repair-lote-02",
        "prior_semantic_sha256": "0ee47743e25ee761987910b2911f1345c382de3aad517d563be0dc579bc0ea1c"
      }
    ],
    "expected_semantic_sha256": "4171731266e5715b6b348857c5924030ecd5f9c459b89e52e415a9ae8513ce0c",
    "expected_byte_sha256": "8c9e5dd36a0df2a64afdd6df43a4fefb65e4dbe95a4dbd0c70df5f1447c7c903",
    "question": {
      "meta": {
        "ano": "2025",
        "banca": "Fênix Instituto",
        "orgao": "Enfermagem",
        "prova": "Tec (Pref BJ Serra)",
        "cargo_header": "Técnico de enfermagem",
        "topico": "Enfermagem",
        "subtopico": "Noções de Anatomia",
        "content_standard": "golden-v1",
        "family": "conceito",
        "content_review": {
          "reviewed_at": "2026-07-27",
          "reviewer": "g04-editorial",
          "guideline_snapshot": "QSD abdominal: fígado no quadrante superior direito; baço no QSE. Trauma hepático → risco hemorrágico.",
          "exam_vs_current": "none"
        },
        "sources": [
          {
            "id": "fenix-prova-bj-serra-2025-q21",
            "tier": "A",
            "issuer": "Instituto Fênix",
            "title": "CP 01/2025 Bom Jardim da Serra — TE Q21",
            "year": 2025,
            "url": "https://anexos.cdn.selecao.net.br/uploads/739/concursos/59/anexos/aadeb13b-621c-4364-89ad-0f2b9cb1ecf4.pdf",
            "covers": [
              "QSD",
              "fígado",
              "trauma abdominal"
            ]
          },
          {
            "id": "fenix-gabarito-2025-08-28",
            "tier": "A",
            "issuer": "Instituto Fênix",
            "title": "Gabarito definitivo 28/08/2025 — Q21 = B",
            "year": 2025,
            "url": "https://anexos.cdn.selecao.net.br/uploads/739/concursos/59/anexos/ea0cad3f-095d-463d-858f-d96e956ac305.pdf",
            "covers": [
              "gabarito B",
              "fígado"
            ]
          }
        ]
      },
      "question_data": {
        "instruction": "Em situações de trauma abdominal, o conhecimento anatômico permite ao profissional de enfermagem reconhecer riscos à vida associados à lesão de órgãos\ninternos. Dentre os órgãos listados a seguir, aquele localizado no quadrante superior direito do abdome, e que pode provocar hemorragia significativa se lesionado, é:",
        "options": [
          {
            "id": "A",
            "text": "Baço.",
            "is_correct": false
          },
          {
            "id": "B",
            "text": "Fígado.",
            "is_correct": true
          },
          {
            "id": "C",
            "text": "Estômago.",
            "is_correct": false
          },
          {
            "id": "D",
            "text": "Intestino Delgado.",
            "is_correct": false
          }
        ]
      },
      "reverse_study_slides": [
        {
          "type": "concept_map",
          "slide_title": "QSD — órgão e risco",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Noções de Anatomia"
          },
          "items": [
            {
              "label": "Comando",
              "detail": "Órgão no quadrante superior direito com risco de hemorragia significativa.",
              "icon": "Crosshair"
            },
            {
              "label": "Fígado",
              "detail": "Ocupa predominantemente o QSD; altamente vascularizado.",
              "icon": "MapPin"
            },
            {
              "label": "Baço (distrator)",
              "detail": "Situa-se no quadrante superior esquerdo — lado oposto.",
              "icon": "ArrowLeftRight"
            },
            {
              "label": "Estômago / delgado",
              "detail": "Não são o marco clássico de QSD com hemorragia maciça típica da prova.",
              "icon": "Ban"
            }
          ],
          "footer_rule": "Localização anatômica (QSD) + vascularização → fígado."
        },
        {
          "type": "logic_flow",
          "slide_title": "Eliminação por quadrante",
          "reveal_mode": "tap",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Noções de Anatomia"
          },
          "steps": [
            "Isolar os dois filtros do enunciado: quadrante superior direito + hemorragia significativa.",
            "Mapear baço → quadrante superior esquerdo → eliminar A.",
            "Mapear fígado → quadrante superior direito e rico em sangue → mantém B.",
            "Estômago: epigástrio/QSE predominante — não fecha o QSD da prova → eliminar C.",
            "Intestino delgado: alças difusas — não é o órgão-alvo do QSD → eliminar D.",
            "Confirmar: único órgão que casa QSD + risco hemorrágico clássico = fígado.",
            "Marcar B — gabarito oficial Fênix Q21.",
            "Fixação: em trauma abdominal de prova, case primeiro o quadrante (QSD/QSE) e só depois o risco de sangramento."
          ],
          "footer_rule": "Não desvie para via aérea/cervical: o discriminador é anatomia de quadrante."
        },
        {
          "type": "golden_rule",
          "slide_title": "Mapa rápido dos quadrantes",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Noções de Anatomia"
          },
          "content": "Trauma abdominal — órgãos-âncora",
          "rows": [
            {
              "label": "QSD",
              "value": "Fígado (hemorragia significativa)"
            },
            {
              "label": "QSE",
              "value": "Baço"
            },
            {
              "label": "Epigástrio / QSE",
              "value": "Estômago (não é o alvo QSD)"
            },
            {
              "label": "Difuso",
              "value": "Intestino delgado"
            }
          ],
          "footer_rule": "QSD + sangramento → pense fígado antes de baço."
        },
        {
          "type": "danger_zone",
          "slide_title": "Distratores anatômicos",
          "bullet_style": "x_icon",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Noções de Anatomia"
          },
          "content": "PEGADINHAS — Fênix QSD",
          "items": [
            {
              "label": "A — Baço",
              "detail": "Órgão também muito vascularizado e comum em trauma.",
              "correct": "Baço está no QSE, não no QSD pedido pelo enunciado."
            },
            {
              "label": "C — Estômago",
              "detail": "Pode sangrar, mas não é o marco de QSD da questão.",
              "correct": "O filtro espacial QSD elimina o estômago frente ao fígado."
            },
            {
              "label": "D — Intestino delgado",
              "detail": "Ocupa grande parte da cavidade abdominal.",
              "correct": "Não é o órgão tipicamente associado ao QSD com hemorragia maciça."
            },
            {
              "label": "Desviar para imobilização cervical",
              "detail": "Conteúdo de urgência sem âncora neste item.",
              "correct": "Aqui a prova cobra localização anatômica — mantenha o foco no QSD."
            },
            {
              "label": "Em similares: trocar fígado por baço",
              "detail": "Transferência: outra banca pergunta QSE e o aluno marca fígado por hábito.",
              "correct": "QSD → fígado; QSE → baço. Inverta o lado, inverta o órgão."
            }
          ],
          "footer_rule": "Lado errado (QSE) é a pegadinha nº 1 contra o fígado."
        }
      ],
      "modulo_slug": "fenix-instituto-enfermagem-nocoes-de-anatomia-1775447762008-6"
    }
  },
  {
    "case_id": "nc-g03-bb9561b352b9c629",
    "slug": "fgv-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1779572159431-6",
    "decision": "create_corrected_candidate",
    "authority_manifest": "data/catalog-migration/imunizacao-completo/manifest.json",
    "targets": [
      {
        "lote": "imunizacao-completo",
        "prior_semantic_sha256": "absent"
      },
      {
        "lote": "infeccoes-sexualmente-transmissiveis-ists-lote-01",
        "prior_semantic_sha256": "82c29db0e990b42aceab0d1f700cafadb7c6ed3516aa89acc77132df1e0707b6"
      },
      {
        "lote": "infeccoes-sexualmente-transmissiveis-ists-repair-lote-01",
        "prior_semantic_sha256": "144808ae88424f92646071ca16ad02b6bb3005a0fc880a410c0fdd1442d39edf"
      }
    ],
    "expected_semantic_sha256": "1f0e8dba8ae2e08f3e3623f5c1c5a79c675ca18f56e24f3bd83debd576b28175",
    "expected_byte_sha256": "bb306938fdf9579acb472cc440ea7dd3ab55ac23681111ae8fde494c880e9844",
    "question": {
      "meta": {
        "ano": "2025",
        "banca": "FGV",
        "orgao": "Enfermagem / Sem Especialidade",
        "prova": "Tec (EBSERH)",
        "cargo_header": "Técnico de enfermagem",
        "topico": "Enfermagem",
        "subtopico": "Imunização",
        "pedagogical_branch": "imunizacao_vf_intervalos",
        "content_standard": "golden-v1",
        "family": "vf",
        "content_review": {
          "reviewed_at": "2026-07-27",
          "reviewer": "g04-editorial",
          "guideline_snapshot": "NT MS 41/2024: rotina dose única; especiais 2/3 doses; resgate 15–19. Prova FGV Q33 = C (F–V–V–V).",
          "exam_vs_current": "none"
        },
        "sources": [
          {
            "id": "fgv-ebserh-g15-tipo1-q33",
            "tier": "A",
            "issuer": "FGV / EBSERH",
            "title": "Edital 03/2024 Grupo 15 Tipo 1 — Q33 HPV4",
            "year": 2025,
            "url": "https://conhecimento.fgv.br/sites/default/files/concursos/grupo-15-tecnico-em-enfermageme3cnmgp15-tipo-1.pdf",
            "covers": [
              "HPV4",
              "VF",
              "calendário"
            ]
          },
          {
            "id": "fgv-gabarito-definitivo-2025-04-14",
            "tier": "A",
            "issuer": "FGV",
            "title": "Gabarito definitivo 14/04/2025 — TE Tipo 1 Q33 = C",
            "year": 2025,
            "url": "https://conhecimento.fgv.br/sites/default/files/concursos/ebserrhassistencial2024_gabarito_definitivo.pdf",
            "covers": [
              "gabarito C",
              "F-V-V-V"
            ]
          },
          {
            "id": "ms-nt-41-2024-hpv",
            "tier": "A",
            "issuer": "Ministério da Saúde / DPNI",
            "title": "Nota Técnica nº 41/2024 — HPV",
            "year": 2024,
            "url": "https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/notas-tecnicas/2024/nota-tecnica-no-41-2024-cgici-dpni-svsa-ms",
            "covers": [
              "dose única",
              "abuso sexual",
              "resgate 15–19"
            ]
          }
        ]
      },
      "question_data": {
        "instruction": "O papilomavírus humano (HPV) é responsável por uma infecção sexualmente transmissível (IST) muito comum, relacionada ao câncer de colo de útero e outros tumores, tanto em mulheres quanto em homens. A vacina HPV4-recombinante está disponível no SUS. Essa disponibilidade deve ser divulgada, e a população deve ser estimulada a aderir a seu uso.\nSobre essa vacina, avalie as afirmativas a seguir e assinale (V) para a verdadeira e (F) para a falsa.\n( ) A vacina HPV4-recombinante é aplicada em meninos a partir de 12 anos de idade e em meninas a partir da menarca.\n( ) Para vítimas de abuso sexual, de 9 a 14 anos, a recomendação é de duas doses.\n( ) Para pessoas de 15 a 45 anos, a recomendação é de três doses, considerando o histórico vacinal contra o HPV.\n( ) Para os adolescentes não vacinados de 15 a 19 anos de idade, estratégias de resgate para a vacinação de dose única devem ser realizadas.\nAs afirmativas são, respectivamente,",
        "options": [
          {
            "id": "A",
            "text": "V – V – F – V.",
            "is_correct": false
          },
          {
            "id": "B",
            "text": "F – V – V – F.",
            "is_correct": false
          },
          {
            "id": "C",
            "text": "F – V – V – V.",
            "is_correct": true
          },
          {
            "id": "D",
            "text": "V – F – F – V.",
            "is_correct": false
          },
          {
            "id": "E",
            "text": "F – F – V – F.",
            "is_correct": false
          }
        ]
      },
      "reverse_study_slides": [
        {
          "type": "concept_map",
          "slide_title": "HPV4 — mapa V/F da prova",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Imunização"
          },
          "items": [
            {
              "label": "Afirmativa I — 12 anos / menarca",
              "detail": "FALSA. Critério etário da assertiva (meninos a partir de 12; meninas na menarca) não sustenta a indicação correta.",
              "icon": "XCircle"
            },
            {
              "label": "Afirmativa II — abuso 9–14 (2 doses)",
              "detail": "VERDADEIRA. Vítimas de abuso sexual de 9 a 14 anos: esquema de duas doses.",
              "icon": "Shield"
            },
            {
              "label": "Afirmativa III — 15–45 (3 doses + histórico)",
              "detail": "VERDADEIRA. Pessoas de 15 a 45 anos: três doses conforme histórico vacinal contra o HPV.",
              "icon": "Calendar"
            },
            {
              "label": "Afirmativa IV — resgate 15–19 dose única",
              "detail": "VERDADEIRA. Adolescentes não vacinados de 15 a 19 anos: estratégias de resgate em dose única.",
              "icon": "UserPlus"
            },
            {
              "label": "Pegadinha da I",
              "detail": "Quem aceita \"12 anos/menarca\" como rotina marca A ou D e perde o F inicial.",
              "icon": "AlertTriangle"
            }
          ],
          "footer_rule": "Julgue I–IV do HPV4 antes de montar F–V–V–V."
        },
        {
          "type": "logic_flow",
          "slide_title": "Montar F – V – V – V",
          "reveal_mode": "tap",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Imunização"
          },
          "steps": [
            "Separar as quatro afirmativas sobre a vacina HPV4-recombinante sem fundir III com IV.",
            "I: meninos a partir de 12 / meninas na menarca → F.",
            "II: vítimas de abuso sexual 9–14 em duas doses → V.",
            "III: 15–45 em três doses considerando histórico vacinal → V.",
            "IV: resgate 15–19 não vacinados em dose única → V.",
            "Sequência: F – V – V – V.",
            "Localizar a alternativa C com exatamente essa sequência.",
            "Eliminar A (I verdadeira), B (IV falsa), D (quase tudo invertido), E (II falsa).",
            "Marcar C — gabarito definitivo FGV Q33.",
            "Fixação: em V/F de HPV, teste primeiro a assertiva etária (I) e o resgate 15–19 (IV) antes de olhar combinações."
          ],
          "footer_rule": "Rotina ≠ abuso sexual ≠ 15–45 ≠ resgate — não generalize 2/3 doses."
        },
        {
          "type": "golden_rule",
          "slide_title": "Referência — HPV4 na prova",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Imunização"
          },
          "content": "DECORE — QUALIFICADORES HPV4 (SEM GABARITO)",
          "rows": [
            {
              "label": "I — critério 12 anos/menarca",
              "value": "Não usar como indicação correta da assertiva"
            },
            {
              "label": "II — abuso sexual 9–14",
              "value": "2 doses"
            },
            {
              "label": "III — 15–45 + histórico",
              "value": "3 doses conforme histórico vacinal"
            },
            {
              "label": "IV — resgate 15–19",
              "value": "Dose única em não vacinados"
            }
          ],
          "footer_rule": "NT 41/2024: preservar especiais e resgate; não generalizar esquemas."
        },
        {
          "type": "danger_zone",
          "slide_title": "Pegadinhas de calendário HPV",
          "bullet_style": "x_icon",
          "meta": {
            "topico": "Enfermagem",
            "subtopico": "Imunização"
          },
          "content": "PEGADINHAS — FGV HPV4",
          "items": [
            {
              "label": "A — V–V–F–V",
              "detail": "Aceita I (12 anos/menarca) e nega III.",
              "correct": "I é F; III é V — a sequência correta começa com F e mantém III verdadeira."
            },
            {
              "label": "B — F–V–V–F",
              "detail": "Nega o resgate 15–19 em dose única.",
              "correct": "IV é V: resgate de dose única deve ser ofertado aos não vacinados."
            },
            {
              "label": "D — V–F–F–V",
              "detail": "Inverte I/II/III em bloco.",
              "correct": "Só I é F; II e III são V — não troque abuso/15–45 por falso."
            },
            {
              "label": "Pegadinha da I (12 anos/menarca)",
              "detail": "Espelha o erro do concept_map: aceitar critério etário falso da assertiva.",
              "correct": "I é FALSA — quem valida 12 anos/menarca perde o F inicial de F–V–V–V."
            },
            {
              "label": "Em similares: generalizar 2 ou 3 doses",
              "detail": "Transferência: outra banca mistura rotina, abuso sexual e resgate.",
              "correct": "Cada assertiva tem qualificador próprio; não copie o esquema do vizinho."
            }
          ],
          "footer_rule": "Se a sequência não for F–V–V–V, reavalie I e IV primeiro."
        }
      ],
      "modulo_slug": "fgv-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1779572159431-6"
    }
  }
];

/** Únicos paths relativos que o modo --apply aceita escrever. */
export const AUTHORIZED_RELATIVE_PATHS: readonly string[] = [
  "imunizacao-completo/questions/fgv-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1779572159431-6.json",
  "infeccoes-sexualmente-transmissiveis-ists-lote-01/questions/fgv-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1779572159431-6.json",
  "infeccoes-sexualmente-transmissiveis-ists-repair-lote-01/questions/fgv-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1779572159431-6.json",
  "nocoes-de-anatomia-lote-01/questions/fenix-instituto-enfermagem-nocoes-de-anatomia-1775447762008-6.json",
  "nocoes-de-fisiologia-lote-01/questions/ameosc-enfermagem-nocoes-de-fisiologia-1775448586547-7.json",
  "nocoes-de-fisiologia-lote-01/questions/educa-pb-enfermagem-nocoes-de-fisiologia-1775448599930-0.json",
  "sinais-vitais-completo/questions/ameosc-enfermagem-nocoes-de-fisiologia-1775448586547-7.json",
  "sinais-vitais-completo/questions/educa-pb-enfermagem-nocoes-de-fisiologia-1775448599930-0.json",
  "urgencias-e-emergencias-repair-lote-02/questions/fenix-instituto-enfermagem-nocoes-de-anatomia-1775447762008-6.json",
  "verificacao-de-sinais-vitais-repair-lote-01/questions/ameosc-enfermagem-nocoes-de-fisiologia-1775448586547-7.json",
  "verificacao-de-sinais-vitais-repair-lote-01/questions/educa-pb-enfermagem-nocoes-de-fisiologia-1775448599930-0.json"
];

/** Serialização determinística — única forma aceita de escrever estes payloads. */
export function serializePayload(question: Record<string, unknown>): string {
  return `${JSON.stringify(question, null, 2)}\n`;
}

export function relativeTargetPath(lote: string, slug: string): string {
  return `${lote}/questions/${slug}.json`;
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/** Mesma definição de analyzeCatalogFile, sem precisar de arquivo em disco. */
export function semanticHashOf(question: Record<string, unknown>): string {
  return sha256Hex(canonicalJson(normalizeQuestionForComparison(question)));
}

function semanticHashOfFile(path: string): string {
  const raw = JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, '')) as Record<
    string,
    unknown
  >;
  return semanticHashOf(raw);
}

/** Valida os payloads contra o contrato de questão. Retorna a lista de erros (vazia = ok). */
export function validatePayloads(
  payloads: readonly G04EditorialPayload[] = G04_EDITORIAL_PAYLOADS,
): string[] {
  const errors: string[] = [];

  for (const payload of payloads) {
    const label = `${payload.slug}`;

    const parsed = QuestaoCompletaSchema.safeParse(payload.question);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .slice(0, 5)
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join(' | ');
      errors.push(`${label}: QuestaoCompletaSchema falhou — ${issues}`);
    }

    const slidesRaw =
      payload.question.reverse_study_slides ?? payload.question.study_slides;
    if (!Array.isArray(slidesRaw)) {
      errors.push(`${label}: sem reverse_study_slides`);
    } else if (slidesRaw.length !== 4) {
      errors.push(`${label}: ${slidesRaw.length} slides, esperado exatamente 4`);
    } else {
      const types = slidesRaw
        .map((s) => (s as { type?: unknown }).type)
        .filter((t): t is string => typeof t === 'string')
        .sort();
      const expected = [...CANONICAL_SLIDE_TYPES].sort();
      if (types.join(',') !== expected.join(',')) {
        errors.push(`${label}: tipos de slide ${types.join(',')}, esperado ${expected.join(',')}`);
      }
    }

    const semantic = semanticHashOf(payload.question);
    if (semantic !== payload.expected_semantic_sha256) {
      errors.push(
        `${label}: hash semântico do payload ${semantic} ≠ expected_semantic_sha256 ${payload.expected_semantic_sha256}`,
      );
    }

    const byte = sha256Hex(serializePayload(payload.question));
    if (byte !== payload.expected_byte_sha256) {
      errors.push(
        `${label}: hash byte do payload ${byte} ≠ expected_byte_sha256 ${payload.expected_byte_sha256}`,
      );
    }

    if (payload.targets.length === 0) errors.push(`${label}: sem targets`);
  }

  return errors;
}

export type PlanAction = 'write' | 'skip_already_current';

export type PlanEntry = {
  slug: string;
  relative_path: string;
  absolute_path: string;
  action: PlanAction;
  current_semantic_sha256: string | null;
  prior_semantic_sha256: PriorState;
  expected_semantic_sha256: string;
};

export type PlanOptions = {
  catalogRoot: string;
  payloads?: readonly G04EditorialPayload[];
  authorizedPaths?: readonly string[];
};

/**
 * Monta o plano de escrita conferindo allowlist, contenção e hash de cada cópia.
 * Lança antes de qualquer escrita se encontrar path não autorizado ou hash inesperado.
 */
export function planApply(options: PlanOptions): PlanEntry[] {
  const payloads = options.payloads ?? G04_EDITORIAL_PAYLOADS;
  const authorized = new Set(options.authorizedPaths ?? AUTHORIZED_RELATIVE_PATHS);
  const root = resolve(options.catalogRoot);
  const entries: PlanEntry[] = [];

  for (const payload of payloads) {
    for (const target of payload.targets) {
      const relativePath = relativeTargetPath(target.lote, payload.slug);

      if (!authorized.has(relativePath)) {
        throw new Error(`path não autorizado: ${relativePath}`);
      }

      const absolutePath = resolve(root, target.lote, 'questions', `${payload.slug}.json`);
      if (absolutePath !== root && !absolutePath.startsWith(root + sep)) {
        throw new Error(`path fora da raiz do catálogo: ${relativePath}`);
      }

      let current: string | null = null;
      if (existsSync(absolutePath)) {
        try {
          current = semanticHashOfFile(absolutePath);
        } catch (err) {
          throw new Error(
            `${relativePath}: arquivo existente ilegível — ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      let action: PlanAction;
      if (current === null) {
        action = 'write';
      } else if (current === payload.expected_semantic_sha256) {
        action = 'skip_already_current';
      } else if (current === target.prior_semantic_sha256) {
        action = 'write';
      } else {
        throw new Error(
          `${relativePath}: hash inesperado ${current}. Esperado o anterior ${target.prior_semantic_sha256} ou o novo ${payload.expected_semantic_sha256}. Abortado sem escrever nada — pode haver correção editorial mais recente.`,
        );
      }

      entries.push({
        slug: payload.slug,
        relative_path: relativePath,
        absolute_path: absolutePath,
        action,
        current_semantic_sha256: current,
        prior_semantic_sha256: target.prior_semantic_sha256,
        expected_semantic_sha256: payload.expected_semantic_sha256,
      });
    }
  }

  return entries;
}

function writeAtomic(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.tmp-${process.pid}-${Date.now()}`;
  try {
    writeFileSync(temp, contents, 'utf8');
    renameSync(temp, path);
  } catch (err) {
    if (existsSync(temp)) unlinkSync(temp);
    throw err;
  }
}

export type ApplyResult = {
  written: PlanEntry[];
  skipped: PlanEntry[];
  plan: PlanEntry[];
};

/** Valida tudo, planeja tudo e só então escreve. Nenhuma escrita parcial em caso de erro. */
export function applyPayloads(options: PlanOptions): ApplyResult {
  const payloads = options.payloads ?? G04_EDITORIAL_PAYLOADS;

  const validationErrors = validatePayloads(payloads);
  if (validationErrors.length) {
    throw new Error(`payload inválido, nada escrito:\n  - ${validationErrors.join('\n  - ')}`);
  }

  const plan = planApply(options);
  const bySlug = new Map(payloads.map((p) => [p.slug, p]));
  const written: PlanEntry[] = [];
  const skipped: PlanEntry[] = [];

  for (const entry of plan) {
    if (entry.action === 'skip_already_current') {
      skipped.push(entry);
      continue;
    }
    const payload = bySlug.get(entry.slug)!;
    writeAtomic(entry.absolute_path, serializePayload(payload.question));
    const after = semanticHashOfFile(entry.absolute_path);
    if (after !== payload.expected_semantic_sha256) {
      throw new Error(`${entry.relative_path}: hash pós-escrita ${after} ≠ esperado`);
    }
    written.push(entry);
  }

  return { written, skipped, plan };
}

function reportApply(result: ApplyResult): void {
  for (const entry of result.plan) {
    const tag = entry.action === 'write' ? 'ESCRITO' : 'PULADO ';
    console.log(`  ${tag} ${entry.relative_path}`);
  }
  console.log(
    `[G0.4-repro] ${result.written.length} escrito(s), ${result.skipped.length} pulado(s) por já estarem no hash novo.`,
  );
}

function verify(keepTemp: boolean): number {
  const tempRoot = mkdtempSync(join(tmpdir(), 'avant-g04-repro-'));

  try {
    const result = applyPayloads({ catalogRoot: tempRoot });

    console.log(`[G0.4-repro] catálogo temporário: ${tempRoot}`);
    console.log(
      `[G0.4-repro] ${G04_EDITORIAL_PAYLOADS.length} payloads · ${result.plan.length} cópias`,
    );
    console.log('');

    for (const payload of G04_EDITORIAL_PAYLOADS) {
      const mine = result.plan.filter((e) => e.slug === payload.slug);
      const hashes = new Set(mine.map((e) => semanticHashOfFile(e.absolute_path)));
      const bytes = new Set(mine.map((e) => sha256Hex(readFileSync(e.absolute_path, 'utf8'))));
      console.log(payload.slug);
      console.log(`  case_id            ${payload.case_id}`);
      console.log(`  esperado semantic  ${payload.expected_semantic_sha256}`);
      console.log(`  obtido   semantic  ${[...hashes].join(', ')}`);
      console.log(
        `  cópias             ${mine.length} · semantic únicos ${hashes.size} · byte únicos ${bytes.size}`,
      );
      const semanticOk = hashes.size === 1 && hashes.has(payload.expected_semantic_sha256);
      const byteOk = bytes.size === 1 && bytes.has(payload.expected_byte_sha256);
      console.log(`  ${semanticOk ? 'OK  ' : 'FAIL'} semantic · ${byteOk ? 'OK  ' : 'DIFF'} byte`);
      if (!semanticOk) {
        console.error(`[G0.4-repro] FALHA em ${payload.slug}`);
        return 1;
      }
      console.log('');
    }

    // Cross-check independente: o hash esperado está embutido neste arquivo, então
    // conferimos também contra o catálogo real, em modo somente-leitura.
    const realRoot = resolve(process.cwd(), 'data/catalog-migration');
    let crossChecked = 0;
    let crossFails = 0;
    for (const payload of G04_EDITORIAL_PAYLOADS) {
      for (const target of payload.targets) {
        const realPath = resolve(realRoot, target.lote, 'questions', `${payload.slug}.json`);
        if (!existsSync(realPath)) continue;
        crossChecked += 1;
        if (semanticHashOfFile(realPath) !== payload.expected_semantic_sha256) {
          crossFails += 1;
          console.error(`  CROSS-FAIL ${relativeTargetPath(target.lote, payload.slug)}`);
        }
      }
    }
    if (crossChecked === 0) {
      console.log('[G0.4-repro] cross-check: catálogo real ausente (estado versionado puro).');
    } else if (crossFails === 0) {
      console.log(
        `[G0.4-repro] cross-check: ${crossChecked} cópia(s) do catálogo real conferem com o payload versionado.`,
      );
    } else {
      console.error(`[G0.4-repro] cross-check FALHOU em ${crossFails}/${crossChecked} cópia(s).`);
      return 1;
    }

    console.log('[G0.4-repro] PASS: hashes semânticos reproduzidos a partir de arquivo versionado.');
    return 0;
  } finally {
    if (keepTemp) console.log(`[G0.4-repro] temporário preservado: ${tempRoot}`);
    else rmSync(tempRoot, { recursive: true, force: true });
  }
}

function applyLocal(): number {
  const catalogRoot = resolve(process.cwd(), 'data/catalog-migration');
  try {
    const result = applyPayloads({ catalogRoot });
    reportApply(result);
    return 0;
  } catch (err) {
    console.error(`[G0.4-repro] ABORTADO: ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  process.exitCode = apply ? applyLocal() : verify(args.includes('--keep-temp'));
}

const invokedAsCli = /neurocanvas-g04-apply-editorial\.[cm]?tsx?$/.test(process.argv[1] ?? '');
if (invokedAsCli) main();
