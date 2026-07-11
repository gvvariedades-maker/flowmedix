#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g10 (8 slugs · urgencias_exceto_conduta).
 *
 *   npx tsx scripts/handcraft-urgencias-g10.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

import { dangerExceto, metaBase, slideMeta, type Q } from './lib/urgenciasExcetoGolden';

const LOTE = 'urgencias-g10';
const REVIEWER = 'handcraft-urgencias-g10';

type Spec = {
  family: 'protocolo' | 'conceito' | 'vf';
  guideline: string;
  roiError: string;
  cluster: string;
  buildSlides: (q: Q) => unknown[];
};

const SPECS: Record<string, Spec> = {
  // 1) TCE — avaliação primária XABCDE, EXCETO controle térmico
  'adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-7': {
    family: 'protocolo',
    guideline:
      'ATLS/XABCDE — avaliação primária prioriza via aérea, coluna cervical e neurológico; controle térmico é medida do "E" (exposição), coadjuvante, não ênfase primária isolada',
    roiError: 'tce_avaliacao_primaria_calor_corporal',
    cluster: 'TCE — hierarquia de ênfase na avaliação primária XABCDE',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'TCE — ênfase da avaliação primária',
        chip_label: 'TRAUMA',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail:
              'Trauma cranioencefálico — avaliação primária busca achados que ameaçam a vida de imediato, na ordem X-A-B-C-D-E.',
            icon: 'Brain',
          },
          {
            label: 'Via aérea + cervical',
            detail:
              'Garantir permeabilidade de via aérea e estabilização manual da coluna cervical são prioridades absolutas do X-A.',
            icon: 'Wind',
          },
          {
            label: 'Neurológico precoce',
            detail:
              'Avaliar a Escala de Coma de Glasgow logo no início detecta piora neurológica antes de outros sinais — prioridade do D.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — calor corporal',
            detail:
              'Prevenção da perda de calor é cuidado real, mas pertence ao "E" de exposição/ambiente — não é a ênfase da avaliação primária no TCE.',
            icon: 'Thermometer',
          },
          {
            label: 'Leitura do comando',
            detail:
              'EXCETO pede a opção que NÃO é ênfase da avaliação primária — três alternativas descrevem prioridades reais de vida.',
            icon: 'ScanSearch',
          },
        ],
        footer_rule: 'Via aérea + cervical + neuro > controle térmico na avaliação primária',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'TCE — avaliação primária com ênfase para, EXCETO: qual opção NÃO é prioridade do X-A-B-C-D-E?',
          'Eixo do comando: separar prioridade de vida imediata (X-A-B-C-D) do cuidado complementar (E).',
          'Testar letra A — estabilização manual da coluna cervical: prioridade absoluta do "X" em trauma → é ênfase real, eliminar.',
          'Testar letra B — permeabilidade de via aérea: prioridade do "A", sem ela não há sobrevida → é ênfase real, eliminar.',
          'Testar letra C — Glasgow precoce: prioridade do "D", detecta piora neurológica cedo → é ênfase real, eliminar.',
          'Resta letra D — prevenção da perda de calor corporal: pertence ao "E" de exposição, cuidado coadjuvante, não ênfase primária isolada.',
          'Marcar D.',
          'Fixação: em TCE, via aérea + cervical + neuro vêm antes do controle térmico na ênfase da avaliação primária.',
        ],
        footer_rule: 'Estratégia: separe prioridade de vida (X-A-B-C-D) do cuidado complementar (E)',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TCE — HIERARQUIA XABCDE',
        rows: [
          { label: 'X — Hemorragia exsanguinante', value: 'Controlar antes de qualquer outra medida', badge: 'hot' },
          { label: 'A — Via aérea + cervical', value: 'Permeabilidade e estabilização manual simultâneas', badge: 'ok' },
          { label: 'B — Respiração', value: 'Ventilação e oxigenação adequadas', badge: 'ok' },
          { label: 'C — Circulação', value: 'Controle de sangramento e perfusão', badge: 'ok' },
          { label: 'D — Neurológico', value: 'Glasgow precoce e seriado', badge: 'ok' },
          { label: 'E — Exposição', value: 'Despir, examinar e prevenir hipotermia — cuidado coadjuvante', badge: 'info' },
        ],
        footer_rule: 'Prevenção de calor corporal é o "E" — não a ênfase inicial do TCE',
      },
      dangerExceto(
        q,
        'EXCETO — ÊNFASE DA AVALIAÇÃO PRIMÁRIA NO TCE',
        {
          A: 'Estabilização manual da coluna cervical é conduta correta e prioridade do "X-A" no TCE — previne lesão medular secundária.',
          B: 'Garantir permeabilidade de via aérea é conduta correta e prioridade do "A" — sem ela não há oxigenação nem sobrevida.',
          C: 'Avaliar precocemente a Escala de Coma de Glasgow é conduta correta e prioridade do "D" — detecta piora neurológica antes de outros sinais.',
        },
        'Prevenção da perda de calor corporal é a exceção do enunciado — pertence ao "E" de exposição, cuidado coadjuvante, não à ênfase da avaliação primária no TCE.',
        'Gabarito D — controle térmico é coadjuvante, não ênfase primária',
      ),
    ],
  },

  // 2) Objeto perfurante cravado no abdome — por que não remover
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-2': {
    family: 'conceito',
    guideline:
      'Trauma penetrante — objeto empalado não deve ser removido no pré-hospitalar: pode estar tamponando vasos lesados; remoção só em centro cirúrgico controlado',
    roiError: 'objeto_perfurante_efeito_tampao',
    cluster: 'Trauma penetrante — por que não remover objeto empalado',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'Objeto perfurante — não remover',
        chip_label: 'TRAUMA',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail:
              'Objeto perfurante cravado no abdome — a regra de ouro do trauma é não remover no local, só em centro cirúrgico controlado.',
            icon: 'Target',
          },
          {
            label: 'Mecanismo correto',
            detail:
              'O próprio objeto pode estar tamponando (comprimindo) vasos sanguíneos lesados — removê-lo libera sangramento maciço.',
            icon: 'Shield',
          },
          {
            label: 'Pegadinha — temperatura',
            detail:
              'Frases sobre "reduzir/aumentar temperatura corporal causando vasoconstrição" são armadilhas — não é o mecanismo de proteção do objeto empalado.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — "inconsistência no enunciado"',
            detail:
              'Alternativas que alegam erro no enunciado tentam induzir a marcar por desconfiança, não por conhecimento técnico.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Objeto empalado tampona — retirar só em centro cirúrgico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Objeto perfurante cravado no abdome — por que não remover, exceto em centro cirúrgico?',
          'Eliminar letra A — temperatura corporal reduzida causando vasoconstrição não é o mecanismo de proteção do objeto.',
          'Eliminar letra C — aumento de temperatura intracorporal também não explica o tamponamento vascular.',
          'Eliminar letra D — não há inconsistência: a regra de não remover é real e reconhecida no trauma.',
          'Eliminar letra E — remoção em centro cirúrgico é justamente a exceção correta prevista no enunciado.',
          'Resta letra B — o objeto pode estar tamponando vasos sanguíneos lesados.',
          'Marcar B.',
          'Fixação: empalamento → não remover no local → tamponamento vascular → só retirar em cirurgia controlada.',
        ],
        footer_rule: 'Estratégia: buscar o mecanismo hemostático real, não a temperatura',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'OBJETO PERFURANTE — CONDUTA',
        rows: [
          { label: 'Regra geral', value: 'Não remover objeto empalado no pré-hospitalar', badge: 'hot' },
          { label: 'Motivo', value: 'Pode tamponar vasos sanguíneos lesados', badge: 'ok' },
          { label: 'Conduta', value: 'Estabilizar objeto no local, curativo ao redor, imobilizar', badge: 'ok' },
          { label: 'Exceção', value: 'Remoção só em centro cirúrgico, sob controle hemostático', badge: 'warn' },
          { label: 'Transporte', value: 'Manter objeto fixo até avaliação cirúrgica', badge: 'info' },
        ],
        footer_rule: 'Remover no local = liberar hemorragia maciça',
      },
      dangerExceto(
        q,
        'PEGADINHAS — OBJETO PERFURANTE (EFEITO TAMPÃO)',
        {
          A: 'A conduta correta reconhece que o objeto pode estar tamponando vasos sanguíneos lesados — a queda de temperatura corporal citada aqui não é o mecanismo real.',
          C: 'A conduta correta reconhece o tamponamento de vasos sanguíneos como motivo real — o aumento de temperatura intracorporal citado aqui não explica a manutenção do objeto.',
          D: 'A conduta correta é não remover o objeto empalado no local — não há inconsistência no enunciado, a regra é real e reconhecida em trauma.',
          E: 'A conduta correta reserva a remoção para o centro cirúrgico — não há inconsistência: essa é exatamente a exceção prevista no enunciado.',
        },
        'O objeto pode estar tamponando vasos sanguíneos lesados — por isso não deve ser removido, com exceção do momento em que já estiver em centro cirúrgico.',
        'Gabarito B — efeito tampão do objeto empalado',
      ),
    ],
  },

  // 3) Fratura exposta de fêmur — condutas XABCDE, EXCETO manipular fragmentos
  'fundatec-enfermagem-processo-de-enfermagem-1780006976703-3': {
    family: 'protocolo',
    guideline:
      'XABCDE trauma — fratura exposta: não manipular/reposicionar fragmentos ósseos no pré-hospitalar; imobilizar como encontrado',
    roiError: 'fratura_exposta_femur_nao_reposicionar',
    cluster: 'Fratura exposta de fêmur — condutas XABCDE, EXCETO manipulação de fragmentos',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'Fratura exposta de fêmur — conduta inicial',
        chip_label: 'TRAUMA',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail:
              'Fratura exposta de fêmur com sangramento ativo e hipoperfusão — atendimento inicial segue XABCDE.',
            icon: 'Bone',
          },
          {
            label: 'Pegadinha nomeada',
            detail:
              'Manipular e reposicionar fragmentos ósseos expostos para "alinhar e facilitar transporte" é conduta incorreta — pode lesionar vasos e nervos e agravar sangramento.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Eixo correto — hemostasia',
            detail:
              'Compressão direta com imobilização provisória controla hemorragia sem manipular o osso exposto.',
            icon: 'Hand',
          },
          {
            label: 'Eixo correto — prioridade',
            detail:
              'Controle hemorrágico é prioridade sobre intervenções secundárias — previne choque hipovolêmico.',
            icon: 'HeartPulse',
          },
          {
            label: 'Eixo correto — reserva',
            detail: 'Torniquete é reserva para hemorragia extrema quando a compressão direta não for suficiente.',
            icon: 'Shield',
          },
        ],
        footer_rule: 'Fratura exposta: imobilizar como encontrado, nunca reposicionar no local',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Fratura exposta de fêmur com hemorragia ativa — qual conduta NÃO é adequada no atendimento inicial (XABCDE)?',
          'Testar letra B — compressão direta e imobilização provisória: conduta correta e recomendada → eliminar.',
          'Testar letra C — priorizar controle hemorrágico antes de intervenções secundárias: prioridade real do protocolo → eliminar.',
          'Testar letra D — cobrir com curativo estéril e manter imobilizado: conduta correta → eliminar.',
          'Testar letra E — considerar torniquete em hemorragia extrema: conduta correta como último recurso → eliminar.',
          'Resta letra A — manipular e reposicionar fragmentos ósseos expostos para alinhar e facilitar transporte.',
          'Reposicionar fragmento exposto no local aumenta risco de lesão vascular/nervosa e contamina o foco — não é conduta inicial adequada.',
          'Marcar A.',
        ],
        footer_rule: 'Nunca reposicionar fragmento ósseo exposto no atendimento inicial',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'FRATURA EXPOSTA DE FÊMUR — XABCDE',
        rows: [
          { label: 'Prioridade', value: 'Controle hemorrágico antes de intervenções secundárias', badge: 'hot' },
          { label: 'Hemostasia', value: 'Compressão direta; torniquete se compressão insuficiente', badge: 'ok' },
          { label: 'Imobilização', value: 'Estabilizar o membro na posição encontrada', badge: 'ok' },
          { label: 'Cobertura', value: 'Curativo estéril sobre a ferida exposta', badge: 'ok' },
          { label: 'Nunca', value: 'Manipular ou reposicionar fragmentos ósseos no local', badge: 'warn' },
        ],
        footer_rule: 'Imobilizar e cobrir — não reposicionar o osso exposto',
      },
      dangerExceto(
        q,
        'EXCETO — CONDUTAS EM FRATURA EXPOSTA DE FÊMUR',
        {
          B: 'Compressão direta com imobilização provisória é conduta correta para controlar hemorragia sem manipular o osso.',
          C: 'Priorizar o controle hemorrágico antes de intervenções secundárias é conduta correta — reduz risco de choque hipovolêmico.',
          D: 'Cobrir a fratura com curativo estéril mantendo a imobilização é conduta correta até avaliação definitiva.',
          E: 'Considerar torniquete em hemorragia extrema quando a compressão direta não for suficiente é conduta correta e reconhecida.',
        },
        'Manipular e reposicionar fragmentos ósseos expostos para alinhar o membro é conduta incorreta nesse cenário — risco de lesão vascular/nervosa; a exceção correta é imobilizar como encontrado.',
        'Gabarito A — nunca reposicionar fragmento ósseo exposto',
      ),
    ],
  },

  // 4) Manobra cabeça-queixo — passos, EXCETO posição ereta
  'fundatec-enfermagem-urgencias-e-emergencias-1777104007115-6': {
    family: 'protocolo',
    guideline:
      'Manobra cabeça-queixo (head-tilt/chin-lift) — realizada com o paciente em decúbito dorsal, não em posição ereta',
    roiError: 'manobra_cabeca_queixo_posicao_supina',
    cluster: 'Via aérea — manobra cabeça-queixo, posicionamento do paciente',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'Manobra cabeça-queixo — passos',
        chip_label: 'VIA AÉREA',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail:
              'Manobra de inclinação da cabeça-elevação do queixo (head-tilt chin-lift) — técnica preferida para abrir via aérea sem suspeita de lesão cervical.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha nomeada',
            detail:
              '"Paciente em posição ereta" é armadilha — a manobra é executada com o paciente deitado em decúbito dorsal, nunca em pé ou sentado.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Eixo correto — testa',
            detail: 'Mão na testa com pressão suave para trás inclina a cabeça — passo padrão da técnica.',
            icon: 'Hand',
          },
          {
            label: 'Eixo correto — queixo',
            detail:
              'Dedos sob a parte óssea do queixo elevam e trazem a mandíbula para frente, sem comprimir tecidos moles.',
            icon: 'ScanSearch',
          },
          {
            label: 'Eixo correto — cuidado',
            detail: 'Evitar compressão dos tecidos moles sob o queixo previne obstrução iatrogênica da via aérea.',
            icon: 'Shield',
          },
        ],
        footer_rule: 'Head-tilt chin-lift exige paciente deitado — nunca em pé',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Manobra cabeça-queixo — quais passos são adequados, exceto qual?',
          'Testar letra B — mão na testa com pressão suave para inclinar a cabeça: passo correto da técnica → eliminar.',
          'Testar letra C — abrir a boca e puxar o lábio inferior com o polegar quando necessário: passo correto → eliminar.',
          'Testar letra D — dedos sob a parte óssea do queixo, elevar e trazer a mandíbula para frente: passo correto → eliminar.',
          'Testar letra E — não comprimir tecidos moles sob o queixo: cuidado correto e essencial → eliminar.',
          'Resta letra A — paciente em posição ereta: a manobra exige decúbito dorsal, não posição em pé.',
          'Marcar A.',
        ],
        footer_rule: 'A manobra é sempre feita com o paciente deitado',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HEAD-TILT CHIN-LIFT — DECORE',
        rows: [
          { label: 'Indicação', value: 'Abrir via aérea sem suspeita de lesão cervical', badge: 'hot' },
          { label: 'Posição', value: 'Decúbito dorsal — nunca em pé ou sentado', badge: 'warn' },
          { label: 'Testa', value: 'Pressão suave para trás', badge: 'ok' },
          { label: 'Queixo', value: 'Elevar mandíbula pela região óssea', badge: 'ok' },
          { label: 'Contraindicação relativa', value: 'Trauma cervical → jaw-thrust', badge: 'info' },
        ],
        footer_rule: 'Posição supina é pré-requisito da manobra',
      },
      dangerExceto(
        q,
        'EXCETO — PASSOS DA MANOBRA CABEÇA-QUEIXO',
        {
          B: 'Colocar a mão na testa e aplicar pressão suave para trás é conduta correta e passo padrão da técnica.',
          C: 'Abrir a boca e puxar o lábio inferior com o polegar quando necessário é conduta correta prevista na técnica.',
          D: 'Colocar os dedos sob a parte óssea do queixo, elevar e trazer a mandíbula para frente é conduta correta da manobra.',
          E: 'Não comprimir os tecidos moles sob o queixo é conduta correta — evita obstrução iatrogênica da via aérea.',
        },
        'O paciente em posição ereta é afirmativa incorreta — a manobra exige decúbito dorsal (deitado); essa é a exceção do enunciado.',
        'Gabarito A — manobra exige paciente deitado, não ereto',
      ),
    ],
  },

  // 5) IAM — atuação do técnico, EXCETO oxigênio como rotina
  'gama-enfermagem-urgencias-e-emergencias-1777104031822-6': {
    family: 'protocolo',
    guideline:
      'IAM — MS/AHA: oxigenoterapia não é rotina para todo paciente; indicada só se SpO2 baixa ou sinais de hipóxia/dispneia/IC — evitar hiperóxia em normoxêmico',
    roiError: 'iam_oxigenio_rotina_sem_hipoxemia',
    cluster: 'IAM — atuação do técnico de enfermagem, oxigenoterapia condicional',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'IAM — atuação do técnico',
        chip_label: 'URGÊNCIA',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail:
              'IAM por oclusão coronariana — a atuação do técnico de enfermagem combina monitorização, acesso venoso e suporte, sempre orientada por protocolo.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha nomeada',
            detail:
              'Administrar oxigênio "por cateter ou máscara, 5 litros/min" como rotina é armadilha — a diretriz atual reserva oxigênio para hipoxemia ou sinais de desconforto respiratório.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Eixo correto — ECG',
            detail: 'ECG de 12 derivações é ação imediata e obrigatória diante de suspeita de IAM.',
            icon: 'Activity',
          },
          {
            label: 'Eixo correto — acesso venoso',
            detail: 'Punção de acesso venoso periférico viabiliza medicação e fluidos de urgência.',
            icon: 'Syringe',
          },
          {
            label: 'Eixo correto — pós-cateterismo',
            detail:
              'Cuidados pós-cateterismo (retirada de introdutor, repouso, restrição de membro) seguem protocolo institucional de hemostasia femoral.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Oxigênio no IAM é condicional à hipoxemia — não é rotina para todos',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'IAM — atuação do técnico de enfermagem inclui todas as medidas abaixo, EXCETO: qual não é ação-padrão sem critério?',
          'Testar letra A — ECG com 12 derivações: ação padrão e imediata → eliminar.',
          'Testar letra B — puncionar acesso venoso periférico: ação padrão para viabilizar medicação → eliminar.',
          'Testar letra D — retirar introdutor conforme tempo protocolar por via femoral, orientar repouso e restrição do membro: conduta protocolar pós-cateterismo → eliminar.',
          'Resta letra C — administrar oxigênio por cateter ou máscara, ou conforme saturação: oxigênio não é automático para todo paciente com IAM.',
          'A diretriz atual reserva oxigênio para SpO2 baixa ou sinais de hipóxia — administrar sem esse critério é a exceção.',
          'Marcar C.',
        ],
        footer_rule: 'Oxigênio no IAM: só com hipoxemia ou desconforto respiratório documentado',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IAM — ATUAÇÃO DO TÉCNICO',
        rows: [
          { label: 'ECG', value: '12 derivações imediato à suspeita de IAM', badge: 'hot' },
          { label: 'Acesso venoso', value: 'Punção periférica para medicação e fluidos', badge: 'ok' },
          { label: 'Oxigênio', value: 'Só se SpO2 baixa ou sinais de hipóxia — não é rotina', badge: 'warn' },
          { label: 'Pós-cateterismo', value: 'Retirar introdutor conforme protocolo; repouso e restrição do membro', badge: 'ok' },
        ],
        footer_rule: 'Hiperóxia sem hipoxemia não é benefício no IAM',
      },
      dangerExceto(
        q,
        'EXCETO — ATUAÇÃO DO TÉCNICO NO IAM',
        {
          A: 'Realizar ECG com 12 derivações é conduta correta e ação padrão diante de suspeita de IAM.',
          B: 'Puncionar acesso venoso periférico é conduta correta e ação padrão para viabilizar medicação e fluidos de urgência.',
          D: 'Retirar o introdutor conforme o tempo protocolar por via femoral, com repouso e restrição do membro, é conduta correta pós-cateterismo.',
        },
        'Administrar oxigênio por cateter ou máscara como rotina fixa é conduta incorreta — é a exceção do enunciado, pois o oxigênio deve ser reservado para SpO2 baixa ou sinais de hipóxia.',
        'Gabarito C — oxigênio é condicional à hipoxemia, não rotina',
      ),
    ],
  },

  // 6) Classificação de risco com acolhimento — resultados esperados, EXCETO "exclusivamente ansiedade"
  'idecan-enfermagem-urgencias-e-emergencias-1780067013432-4': {
    family: 'conceito',
    guideline:
      'Acolhimento com Classificação de Risco (ACCR) — MS/HumanizaSUS: reduz mortes evitáveis, detecta agravamento, garante encaminhamento em rede; não se resume a reduzir ansiedade',
    roiError: 'accr_nao_e_so_ansiedade',
    cluster: 'Classificação de risco com acolhimento — resultados esperados',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'Classificação de risco — resultados esperados',
        chip_label: 'URGÊNCIA',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail:
              'Acolhimento com Classificação de Risco (ACCR) reorganiza o fluxo da urgência por gravidade, não por ordem de chegada.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha nomeada',
            detail:
              '"Diminuir exclusivamente a ansiedade dos usuários" reduz o ACCR a um efeito secundário — a política tem objetivos clínicos e organizacionais bem mais amplos.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Eixo correto — mortalidade',
            detail: 'Diminuir mortes evitáveis é objetivo central — priorizar quem tem risco real.',
            icon: 'HeartPulse',
          },
          {
            label: 'Eixo correto — triagem',
            detail:
              'Detectar casos que podem se agravar se o atendimento for postergado orienta a priorização.',
            icon: 'ScanSearch',
          },
          {
            label: 'Eixo correto — rede',
            detail:
              'Garantir encaminhamento responsável com acesso à rede assistencial é resultado esperado formal da política.',
            icon: 'Route',
          },
        ],
        footer_rule: 'ACCR: segurança clínica e fluxo em rede, não só conforto emocional',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Resultados esperados da classificação de risco com acolhimento — qual NÃO é o resultado esperado (ou está incompleto)?',
          'Testar letra A — diminuir mortes evitáveis: resultado central do ACCR → eliminar.',
          'Testar letra C — detectar casos que podem se agravar se postergados: função-chave da triagem → eliminar.',
          'Testar letra D — criar obrigatoriedade de encaminhamento responsável com acesso à rede: resultado formal da política → eliminar.',
          'Resta letra B — diminuir exclusivamente a ansiedade dos usuários: reduz o ACCR a um único efeito secundário, ignorando os objetivos clínicos.',
          'Marcar B.',
        ],
        footer_rule: 'Cuidado com advérbios como "exclusivamente" — reduzem o alcance real da política',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ACOLHIMENTO COM CLASSIFICAÇÃO DE RISCO',
        rows: [
          { label: 'Objetivo central', value: 'Diminuir mortes evitáveis por atraso no atendimento', badge: 'hot' },
          { label: 'Triagem', value: 'Detectar casos que podem se agravar se postergados', badge: 'ok' },
          { label: 'Fluxo em rede', value: 'Encaminhamento responsável com garantia de acesso', badge: 'ok' },
          { label: 'Efeito colateral', value: 'Reduz ansiedade — mas não é o único nem o principal resultado', badge: 'warn' },
        ],
        footer_rule: '"Exclusivamente" é a palavra que denuncia a alternativa errada',
      },
      dangerExceto(
        q,
        'EXCETO — RESULTADOS DA CLASSIFICAÇÃO DE RISCO',
        {
          A: 'Diminuir mortes evitáveis é afirmativa correta e resultado central esperado da classificação de risco com acolhimento.',
          C: 'Detectar casos que provavelmente se agravarão se o atendimento for postergado é afirmativa correta — função-chave da triagem por risco.',
          D: 'Criar obrigatoriedade de encaminhamento responsável com garantia de acesso à rede é afirmativa correta e resultado formal da política.',
        },
        'Reduzir o ACCR a "diminuir exclusivamente a ansiedade dos usuários" é afirmativa incorreta — é a exceção do enunciado, pois ignora os objetivos clínicos e organizacionais reais da política.',
        'Gabarito B — "exclusivamente" reduz indevidamente o alcance do ACCR',
      ),
    ],
  },

  // 7) Escala de Coma de Glasgow — parâmetros, EXCETO resposta respiratória
  'instituto-consulpam-enfermagem-exames-complementares-1779563674260-6': {
    family: 'conceito',
    guideline:
      'Escala de Coma de Glasgow — três domínios: abertura ocular, resposta verbal, melhor resposta motora; resposta respiratória não integra a escala',
    roiError: 'glasgow_nao_avalia_respiracao',
    cluster: 'Escala de Coma de Glasgow — domínios avaliados',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'Escala de Glasgow — domínios',
        chip_label: 'NEURO',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail:
              'Escala de Coma de Glasgow avalia nível de consciência por três domínios — não avalia parâmetros respiratórios.',
            icon: 'Brain',
          },
          {
            label: 'Pegadinha nomeada',
            detail:
              '"Resposta respiratória" parece clínica e plausível, mas não é domínio da Glasgow — pertence a outras escalas de trauma.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Eixo correto — ocular',
            detail: 'Abertura ocular — de espontânea a ausente, pontua de 4 a 1.',
            icon: 'Eye',
          },
          {
            label: 'Eixo correto — verbal',
            detail: 'Resposta verbal — de orientada a ausente, pontua de 5 a 1.',
            icon: 'MessageCircle',
          },
          {
            label: 'Eixo correto — motora',
            detail: 'Melhor resposta motora — de obedece a comandos a ausente, pontua de 6 a 1.',
            icon: 'Hand',
          },
        ],
        footer_rule: 'Glasgow = ocular + verbal + motora — sem componente respiratório',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'São parâmetros avaliados na Escala de Coma de Glasgow, EXCETO: qual não pertence à escala?',
          'Testar letra B — abertura ocular: domínio real da Glasgow → eliminar.',
          'Testar letra C — resposta verbal: domínio real da Glasgow → eliminar.',
          'Testar letra D — melhor resposta motora: domínio real da Glasgow → eliminar.',
          'Resta letra A — resposta respiratória: não é avaliada pela Escala de Coma de Glasgow.',
          'Marcar A.',
          'Fixação: Glasgow tem 3 domínios (ocular, verbal, motor) — respiração fica fora.',
        ],
        footer_rule: 'Decore os 3 domínios — não confunda com sinais vitais',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ESCALA DE COMA DE GLASGOW',
        rows: [
          { label: 'Abertura ocular', value: '4 (espontânea) a 1 (ausente)', badge: 'ok' },
          { label: 'Resposta verbal', value: '5 (orientada) a 1 (ausente)', badge: 'ok' },
          { label: 'Resposta motora', value: '6 (obedece comandos) a 1 (ausente)', badge: 'ok' },
          { label: 'Pontuação total', value: '3 a 15 pontos — soma dos três domínios', badge: 'hot' },
          { label: 'Coma profundo', value: '≤ 8 pontos', badge: 'warn' },
        ],
        footer_rule: 'Resposta respiratória não compõe a pontuação',
      },
      dangerExceto(
        q,
        'EXCETO — DOMÍNIOS DA ESCALA DE GLASGOW',
        {
          B: 'Abertura ocular é afirmativa correta — domínio real da Escala de Coma de Glasgow, pontuado de 1 a 4.',
          C: 'Resposta verbal é afirmativa correta — domínio real da escala, pontuado de 1 a 5.',
          D: 'Melhor resposta motora é afirmativa correta — domínio real da escala, pontuado de 1 a 6.',
        },
        'Resposta respiratória é afirmativa incorreta — é a exceção do enunciado, pois a Escala de Coma de Glasgow tem apenas três domínios: ocular, verbal e motor.',
        'Gabarito A — Glasgow não avalia respiração',
      ),
    ],
  },

  // 8) Protocolo ABCDE — vantagens, INCORRETA sobre esperar exames
  'avancasp-enfermagem-processo-de-enfermagem-1780002845055-5': {
    family: 'protocolo',
    guideline:
      'Protocolo ABCDE no trauma — avaliação e reanimação simultâneas; não se aguarda exame de imagem/laboratorial para iniciar manobras de socorro',
    roiError: 'abcde_nao_espera_exames',
    cluster: 'Protocolo ABCDE — vantagens, INCORRETA sobre espera de exames',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'Protocolo ABCDE — vantagens',
        chip_label: 'TRAUMA',
        meta: slideMeta,
        items: [
          {
            label: 'Enquadramento',
            detail: 'Protocolo ABCDE — atendimento sistematizado ao politraumatizado, prioriza risco imediato à vida.',
            icon: 'Target',
          },
          {
            label: 'Pegadinha nomeada',
            detail:
              '"Exige aguardar exames de imagem/laboratoriais antes de iniciar manobras de socorro" inverte a lógica do protocolo — o ABCDE existe para agir sem esperar exames.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Eixo correto — sequência',
            detail: 'Sequência lógica por risco imediato à vida é a essência do método.',
            icon: 'ListOrdered',
          },
          {
            label: 'Eixo correto — rapidez',
            detail: 'O ciclo completo do ABCDE ocorre em poucos minutos.',
            icon: 'Clock',
          },
          {
            label: 'Eixo correto — simultaneidade',
            detail:
              'Reanimação e avaliação diagnóstica ocorrem simultaneamente, não em sequência isolada; padronização facilita a comunicação da equipe.',
            icon: 'Users',
          },
        ],
        footer_rule: 'ABCDE age em paralelo — nunca espera resultado de exame para socorrer',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Vantagens do protocolo ABCDE — assinale a alternativa INCORRETA: qual contraria a lógica do método?',
          'Testar letra A — sequência lógica baseada em maior risco imediato à vida: vantagem real → eliminar.',
          'Testar letra B — processo ágil, executado em poucos minutos: vantagem real → eliminar.',
          'Testar letra C — reanimação simultânea à avaliação diagnóstica: vantagem real → eliminar.',
          'Testar letra D — padroniza atendimento e facilita comunicação da equipe: vantagem real → eliminar.',
          'Resta letra E — exige aguardar exames de imagem/laboratoriais antes de qualquer manobra de socorro: isso inverte a lógica do ABCDE, que age sem esperar exames.',
          'Marcar E.',
        ],
        footer_rule: 'Socorro imediato > espera por resultado de exame',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PROTOCOLO ABCDE — VANTAGENS',
        rows: [
          { label: 'Sequência', value: 'Por risco imediato à vida, não por ordem de exame', badge: 'hot' },
          { label: 'Velocidade', value: 'Avaliação completa em poucos minutos', badge: 'ok' },
          { label: 'Simultaneidade', value: 'Reanimação ocorre junto com a avaliação diagnóstica', badge: 'ok' },
          { label: 'Padronização', value: 'Facilita comunicação e ação da equipe', badge: 'ok' },
          { label: 'Nunca', value: 'Esperar exame de imagem/laboratorial para iniciar socorro', badge: 'warn' },
        ],
        footer_rule: 'ABCDE não espera diagnóstico de imagem para agir',
      },
      dangerExceto(
        q,
        'INCORRETA — VANTAGENS DO PROTOCOLO ABCDE',
        {
          A: 'A sequência lógica baseada em maior risco imediato à vida é conduta correta e vantagem real do protocolo ABCDE.',
          B: 'A agilidade do processo, executado em poucos minutos, é conduta correta e vantagem real do protocolo.',
          C: 'A reanimação ocorrer simultaneamente à avaliação diagnóstica é conduta correta e vantagem real do protocolo.',
          D: 'A padronização do atendimento, facilitando a comunicação da equipe, é conduta correta e vantagem real do protocolo.',
        },
        'O ABCDE não exige aguardar exames de imagem ou laboratoriais para iniciar manobras de socorro — reanimação e avaliação ocorrem em paralelo, sem espera.',
        'Gabarito E — ABCDE age sem esperar resultado de exame',
      ),
    ],
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, spec] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const slides = spec.buildSlides(raw);
    const out = {
      meta: metaBase(raw, spec.family, spec.guideline, slug, spec.roiError, spec.cluster, REVIEWER),
      question_data: raw.question_data,
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g10] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g10] total=${ok}`);
}

main();
