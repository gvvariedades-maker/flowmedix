#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g27 (7 slugs · urgencias_convulsao · lote final 7/7).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  convulsaoProtocolRows,
  finalizeSlides,
  metaBase,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasConvulsaoGolden';

const LOTE = 'urgencias-g27';
const REVIEWER = 'handcraft-urgencias-g27';

const CONVULSAO_L3_FOOTER = 'Crise epiléptica — proteger cabeça · não objeto na boca · PLS após';

const SPECS: Record<string, Pack> = {
  'adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-8': {
    family: 'protocolo',
    guideline: 'SBV/SAMU — convulsão: proteger cabeça · não introduzir objetos · PLS após',
    roi_error: 'objeto_boca_pano',
    cluster: 'Convulsão / crise epiléptica — conduta imediata',
    danger_footer: 'B = não introduzir objetos na boca',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Crise epiléptica — 1º socorros',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Crise epiléptica — ações prioritárias no atendimento imediato; assinalar a conduta correta.', icon: 'Target' },
          { label: 'Proteger', detail: 'Afastar objetos perigosos e amortecer a cabeça — sem imobilizar à força.', icon: 'Shield' },
          { label: 'Não fazer', detail: 'Não introduzir objetos na boca · não segurar a língua · não prender movimentos.', icon: 'Ban' },
          { label: 'Depois da crise', detail: 'Cronometrar duração · posição lateral de segurança se inconsciente com respiração.', icon: 'Clock' },
          { label: 'Pegadinha — pano na boca', detail: '“Pano na boca” parece cuidado — mas qualquer objeto na via aérea agrava.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Proteger sim · objeto na boca não',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: crise epiléptica — assinalar a conduta correta no atendimento imediato.',
          'Eixo segurança: proteger cabeça e ambiente — sem restringir movimentos involuntários.',
          'Eliminar conduta que introduz objeto na boca — pano ou dedo lesionam via aérea.',
          'Eliminar imobilização forçada — segurar a vítima não impede lesão e pode fraturar.',
          'Eliminar posicionamento confuso em decúbito dorsal como única regra.',
          'Resta orientação de não introduzir objetos durante a crise.',
          'Marcar B.',
          'Fixação: em convulsão, a banca premia o que NÃO fazer na boca.',
        ],
        footer_rule: 'Proteger cabeça ≠ objeto na boca',
      },
      {
        type: 'golden_rule',
        slide_title: 'Convulsão — decore',
        meta: slideMeta,
        content: 'CRISE EPILÉPTICA — SBV',
        rows: convulsaoProtocolRows(),
        footer_rule: 'Tempo + proteção — sem objeto oral',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CRISE EPILÉPTICA',
        items: [
          {
            label: 'Letra A — pano na boca',
            detail: 'Mistura proteção da cabeça (correta) com inserir pano para “não morder língua”.',
            correct: 'Proteger a cabeça é certo, mas introduzir pano na boca é proibido — pode obstruir via aérea.',
          },
          {
            label: 'Letra C — segurar a vítima',
            detail: 'Parece evitar trauma durante movimentos bruscos.',
            correct: 'Não imobilizar à força — afastar objetos e proteger a cabeça; prender aumenta risco de fratura.',
          },
          {
            label: 'Letra D — decúbito dorsal rígido',
            detail: 'Confunde posição pós-crise com manejo durante a crise.',
            correct: 'Durante a crise, proteger e não obstruir; após cessar, PLS se inconsciente com respiração.',
          },
        ],
        footer_rule: 'B = não introduzir objetos na boca',
      },
    ],
  },
  'fauel-enfermagem-urgencias-e-emergencias-1777104024064-0': {
    family: 'protocolo',
    guideline: 'Envenenamento infantil — sinais clínicos variados; não provocar vômito sem orientação',
    roi_error: 'envenenamento_sinais_infantil',
    cluster: 'Envenenamento infantil — reconhecimento de sinais',
    danger_footer: 'Gabarito D — quadro clínico amplo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Envenenamento infantil — sinais',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Intoxicação domiciliar em crianças — medicamentos, produtos de limpeza e plantas ao alcance.', icon: 'Target' },
          { label: 'Sinais variados', detail: 'Dor, vômito, diarreia, alteração neurológica e respiratória podem coexistir.', icon: 'Activity' },
          { label: 'Convulsão', detail: 'Pode aparecer entre os sintomas — mas a questão cobra o quadro clínico amplo.', icon: 'Zap' },
          { label: 'Pegadinha — provocar vômito', detail: 'Induzir vômito na ingestão parece “eliminar veneno” — conduta proscrita sem orientação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Envenenamento = reconhecer sinais · não automedicação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Envenenamento infantil — assinalar alternativa correta sobre o tema:',
          'Eliminar faixa etária errada — vítimas mais jovens que quatro a oito anos predominam.',
          'Eliminar plantas como metade dos casos — proporção exagerada nesta prova.',
          'Eliminar via cutânea como mais comum — ingestão predomina.',
          'Eliminar provocar vômito na ingestão — conduta perigosa sem orientação especializada.',
          'Sinais e sintomas amplos (incluindo convulsão) — marcar D.',
        ],
        footer_rule: 'Quadro clínico variado — não uma única via',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ENVENENAMENTO INFANTIL',
        rows: [
          { label: 'Ambiente', value: 'Maioria no domicílio — crianças pequenas', badge: 'ok' },
          { label: 'Sinais', value: 'Dor · vômito · diarreia · confusão · convulsão · cianose labial', badge: 'hot' },
          { label: 'Via comum', value: 'Ingestão — não pele como principal', badge: 'warn' },
          { label: 'Não fazer', value: 'Provocar vômito sem orientação do centro de intoxicação', badge: 'hot' },
        ],
        footer_rule: 'SAMU/CEATOX — não automedicação',
      },
      null as unknown,
    ],
  },
  'fepese-enfermagem-processo-de-enfermagem-1780002217274-4': {
    family: 'protocolo',
    guideline: 'Convulsão — lateralizar rosto para escoar secreções; não imobilizar nem fixar língua',
    roi_error: 'lateralizar_rosto_asfixia',
    cluster: 'Convulsão — cuidado durante a crise',
    danger_footer: 'Gabarito A — lateralizar rosto',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Convulsão — cuidado imediato',
        meta: slideMeta,
        items: [
          { label: 'Definição', detail: 'Contrações musculares desordenadas por descargas neuronais — pode haver perda de consciência.', icon: 'Zap' },
          { label: 'Via aérea', detail: 'Saliva e vômito ameaçam broncoaspiração — lateralizar rosto quando possível.', icon: 'Wind' },
          { label: 'Proteção', detail: 'Afastar objetos e proteger cabeça — sem prender o corpo.', icon: 'Shield' },
          { label: 'Pegadinha — segurar vítima', detail: 'Imobilizar movimentos parece proteger — aumenta risco de fratura.', icon: 'AlertTriangle' },
        ],
        footer_rule: CONVULSAO_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Convulsão — cuidado correto no atendimento:',
          'Eliminar segurar a vítima para impedir movimentos — não imobilizar à força.',
          'Eliminar fixar a língua lateralizada — não manipular via aérea.',
          'Eliminar oferecer só água após a crise — reavaliar consciência antes.',
          'Eliminar beliscões para interromper — estímulo doloroso não trata crise.',
          'Virar o rosto para o lado e evitar asfixia por secreções — marcar A.',
        ],
        footer_rule: CONVULSAO_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONVULSÃO — DURANTE A CRISE',
        rows: convulsaoProtocolRows([
          { label: 'Rosto', value: 'Lateralizar para escoar saliva/vômito', badge: 'hot' },
        ]),
        footer_rule: CONVULSAO_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'funtef-enfermagem-urgencias-e-emergencias-1777103970505-2': {
    family: 'protocolo',
    guideline: 'Crise convulsiva na UBS — lateralizar, proteger cabeça, afastar objetos, acionar médico',
    roi_error: 'ubs_lateralizar_proteger',
    cluster: 'Convulsão — crise na atenção básica (adolescente)',
    danger_footer: 'Gabarito B — lateralizar + proteger + chamar médico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Crise na UBS — conduta',
        meta: slideMeta,
        items: [
          { label: 'Cenário', detail: 'Adolescente em crise convulsiva na sala de espera — duas técnicas no local.', icon: 'Target' },
          { label: 'Proteger', detail: 'Lateralizar, proteger cabeça e retirar objetos perigosos do entorno.', icon: 'Shield' },
          { label: 'Equipe', detail: 'Uma profissional aciona o médico da unidade enquanto outra protege a vítima.', icon: 'Users' },
          { label: 'Pegadinha — cadeira de rodas', detail: 'Transportar durante a crise agrava risco — estabilizar no local primeiro.', icon: 'AlertTriangle' },
        ],
        footer_rule: CONVULSAO_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Crise convulsiva na UBS — conduta correta da equipe:',
          'Eliminar cadeira de rodas para consultório — não mover durante convulsão ativa.',
          'Eliminar “não fazer nada” — proteção e lateralização são obrigatórias.',
          'Eliminar lateralizar e segurar o corpo — imobilização forçada é proibida.',
          'Lateralizar, proteger cabeça, afastar objetos e chamar médico — marcar B.',
        ],
        footer_rule: CONVULSAO_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CRISE NA UNIDADE',
        rows: [
          { label: '1º', value: 'Lateralizar · proteger cabeça · afastar objetos', badge: 'hot' },
          { label: '2º', value: 'Acionar médico da unidade', badge: 'ok' },
          { label: 'Não', value: 'Transportar em cadeira de rodas durante crise', badge: 'warn' },
          { label: 'Não', value: 'Segurar corpo para impedir movimentos', badge: 'warn' },
        ],
        footer_rule: CONVULSAO_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'ivin-enfermagem-urgencias-e-emergencias-1777104056718-0': {
    family: 'protocolo',
    guideline: 'Hipoglicemia — náusea, sudorese e alteração de consciência; convulsão é complicação tardia',
    roi_error: 'hipoglicemia_sinais_classicos',
    cluster: 'Hipoglicemia — sinais e sintomas (cluster convulsão)',
    danger_footer: 'Gabarito C — náusea, sudorese, inconsciência',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hipoglicemia — reconhecimento',
        meta: slideMeta,
        items: [
          { label: 'Definição', detail: 'Queda da glicemia abaixo do limiar — comum em diabético em uso de insulina.', icon: 'Activity' },
          { label: 'Tríade clássica', detail: 'Sudorese, náusea e rebaixamento de consciência — sinais adrenérgicos + neurológicos.', icon: 'Droplet' },
          { label: 'Convulsão', detail: 'Pode ocorrer em hipoglicemia grave — mas não é o conjunto principal cobrado.', icon: 'Zap' },
          { label: 'Pegadinha — convulsão + febre', detail: 'Misturar convulsão com febre confunde hipoglicemia com infecção.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Hipoglicemia = medir glicemia · corrigir rápido',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Hipoglicemia — principais sinais e sintomas:',
          'Eliminar febre e cefaleia isoladas — não compõem o quadro típico.',
          'Eliminar bradicardia com sudorese — hipoglicemia costuma taquicardizar.',
          'Eliminar convulsões com febre — mistura com infecção, não tríade clássica.',
          'Eliminar febre com bradicardia e ataxia — padrão incompatível.',
          'Náusea, sudorese e inconsciência — marcar C.',
        ],
        footer_rule: 'Sudorese + neuro = pensar em glicemia baixa',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HIPOGLICEMIA — SINAIS',
        rows: [
          { label: 'Adrenérgicos', value: 'Sudorese · tremor · taquicardia · fome', badge: 'ok' },
          { label: 'Neurológicos', value: 'Confusão · irritabilidade · inconsciência', badge: 'hot' },
          { label: 'Grave', value: 'Convulsão ou coma — complicação tardia', badge: 'warn' },
          { label: 'Conduta', value: 'Glicemia capilar imediata · glicose se orientado', badge: 'info' },
        ],
        footer_rule: 'Medir antes de tratar às cegas',
      },
      null as unknown,
    ],
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104048047-7': {
    family: 'protocolo',
    guideline: 'Manobra abdominal da figura — bebê consciente com corpo estranho (não convulsão febril)',
    roi_error: 'manobra_convulsao_febril_pegadinha',
    cluster: 'Manobra × indicação — pegadinha convulsão febril',
    danger_footer: 'Gabarito A — manobra correta + bebê responsivo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Manobra × indicação',
        meta: slideMeta,
        items: [
          { label: 'Figura', detail: 'Complete: manobra de ___ em casos de ___.', icon: 'Target' },
          { label: 'Manobra abdominal', detail: 'Compressões para expulsar corpo estranho — vítima consciente.', icon: 'Hand' },
          { label: 'Bebê responsivo', detail: 'Sufocamento grave com vítima consciente — protocolo pediátrico.', icon: 'Baby' },
          { label: 'Pegadinha — convulsão febril', detail: 'Associar manobra abdominal à crise epiléptica é erro — convulsão exige proteção, não compressão.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Convulsão febril ≠ manobra da figura',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Complete a afirmação sobre a manobra da figura:',
          'Eliminar Valsalva em lactente inconsciente — manobra e estado de consciência errados.',
          'Eliminar Leopold para mecônio — manobra obstétrica, não primeiros socorros.',
          'Eliminar manobra abdominal em convulsão febril — crise epiléptica não recebe compressão abdominal.',
          'Eliminar Valsalva genérico — não é a manobra de desobstrução da figura.',
          'Manobra da figura em bebê responsivo com corpo estranho — marcar A.',
        ],
        footer_rule: 'Crise convulsiva — proteger cabeça, não manobra abdominal',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MANOBRA × CENÁRIO',
        rows: [
          { label: 'Figura', value: 'Compressão abdominal — corpo estranho, vítima consciente', badge: 'hot' },
          { label: '≠ convulsão', value: 'Crise epiléptica — proteger cabeça, afastar objetos', badge: 'warn' },
          { label: '≠ Leopold', value: 'Manobra obstétrica — palpação fetal', badge: 'info' },
          { label: '≠ Valsalva', value: 'Não trata crise convulsiva nem corpo estranho nesta figura', badge: 'warn' },
        ],
        footer_rule: 'Convulsão febril é distrator — não recebe manobra abdominal',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MANOBRA × CONVULSÃO',
        items: [
          {
            label: 'Letra B — Valsalva + lactente inconsciente',
            detail: 'Associa Valsalva a lactente inconsciente — manobra e nível de consciência errados.',
            correct: 'Valsalva não é a manobra da figura — lactente inconsciente exige outro protocolo pediátrico.',
          },
          {
            label: 'Letra C — Leopold / mecônio',
            detail: 'Leopold é manobra obstétrica de palpação — não primeiros socorros.',
            correct: 'Manobra obstétrica não se aplica a mecônio em orientação de primeiros socorros.',
          },
          {
            label: 'Letra D — convulsão febril',
            detail: 'Parece nomear manobra e cenário — mas convulsão febril não recebe compressão abdominal.',
            correct: 'Crise epiléptica exige proteger cabeça e afastar objetos — não manobra abdominal.',
          },
          {
            label: 'Letra E — Valsalva genérico',
            detail: 'Valsalva não corresponde à manobra demonstrada na figura.',
            correct: 'Valsalva não associa à manobra correta nem ao cenário do bebê responsivo.',
          },
        ],
        footer_rule: 'Gabarito A — manobra correta + bebê responsivo',
      },
    ],
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104070286-1': {
    family: 'protocolo',
    guideline: 'Orientações SAMU — parada cardíaca correta; convulsão sem lençóis nem calço na língua',
    roi_error: 'orientacao_samu_convulsao_lençol',
    cluster: 'Educação em saúde — pegadinha convulsão (lençol/calço)',
    danger_footer: 'Gabarito A — parada cardíaca + reanimação conforme SAMU',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Orientações ao usuário — SAMU',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Técnico de enfermagem orienta usuários dos serviços de saúde em acidentes na via pública ou domicílio — além de acionar o SAMU.',
            icon: 'Target',
          },
          {
            label: 'Parada cardíaca',
            detail: 'Desmaio sem pulso ou respiração — seguir regulação telefônica e iniciar compressões conforme SAMU.',
            icon: 'HeartPulse',
          },
          {
            label: 'Convulsão (distrator B)',
            detail: 'Crise epiléptica — lençóis e calço na língua são condutas erradas.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha — calço na língua',
            detail: 'Calço sob a língua parece evitar asfixia — proibido na crise convulsiva.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Convulsão: proteger cabeça · sem objeto oral',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Orientações educativas — qual está correta além do SAMU:',
          'Eliminar crise convulsiva com lençóis e calço na língua — imobilização e objeto oral proibidos.',
          'Eliminar osso exposto sentado com água — não oferecer líquido nem posição inadequada.',
          'Eliminar déficit neurológico focal com pernas elevadas — posição incorreta nesta orientação.',
          'Eliminar corpo estranho com punho nas costas isolado — sequência de desobstrução específica.',
          'Parada cardíaca em adulto — reanimação conforme regulação SAMU — marcar A.',
        ],
        footer_rule: 'Crise epiléptica: nunca calço na língua',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CRISE CONVULSIVA — MITOS',
        rows: convulsaoProtocolRows([
          { label: 'Lençol', value: 'Não imobilizar com lençóis — afastar objetos', badge: 'hot' },
          { label: 'Calço', value: 'Não colocar calço na língua — risco de lesão', badge: 'hot' },
        ]),
        footer_rule: 'Convulsão ≠ parada cardíaca — cada cenário tem protocolo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ORIENTAÇÃO SAMU',
        items: [
          {
            label: 'Letra B — lençóis e calço na língua',
            detail: 'Contrações musculares e salivação indicam crise convulsiva — mas lençóis e calço são proibidos.',
            correct: 'Crise convulsiva: não imobilizar com lençóis nem calço na língua — proteger cabeça e afastar objetos.',
          },
          {
            label: 'Letra C — fratura exposta sentada',
            detail: 'Atropelamento com osso exposto — sentar e oferecer água agrava o trauma.',
            correct: 'Osso exposto — não sentar nem oferecer água; estabilizar e acionar SAMU.',
          },
          {
            label: 'Letra D — déficit neurológico focal',
            detail: 'Formigamento unilateral e fala alterada sugerem evento neurológico — pernas elevadas não ajudam.',
            correct: 'Déficit neurológico focal — elevar pernas não é orientação correta nesta prova.',
          },
          {
            label: 'Letra E — corpo estranho',
            detail: 'Tosse e cianose com corpo estranho — punho nas costas isolado não fecha o protocolo.',
            correct: 'Corpo estranho — sequência de desobstrução específica; punho isolado não basta.',
          },
        ],
        footer_rule: 'Gabarito A — parada cardíaca + reanimação conforme SAMU',
      },
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'fauel-enfermagem-urgencias-e-emergencias-1777104024064-0': {
    A: 'Faixa etária incorreta — principais vítimas são menores de quatro anos, não quatro a oito.',
    B: 'Plantas tóxicas não representam quase metade dos casos notificados nesta prova.',
    C: 'Via de penetração mais comum é ingestão — não a pele.',
    E: 'Provocar vômito na ingestão é conduta perigosa sem orientação do centro de intoxicação.',
  },
  'fepese-enfermagem-processo-de-enfermagem-1780002217274-4': {
    B: 'Não imobilizar à força — afastar objetos e proteger cabeça sem prender movimentos.',
    C: 'Não manipular nem fixar a língua — risco de lesão e obstrução.',
    D: 'Após a crise, reavaliar consciência — não oferecer líquido automaticamente.',
    E: 'Estímulos dolorosos (beliscões) não interrompem descargas convulsivas.',
  },
  'funtef-enfermagem-urgencias-e-emergencias-1777103970505-2': {
    A: 'Não transportar em cadeira de rodas durante crise ativa — estabilizar no local.',
    C: 'Há conduta: lateralizar, proteger e acionar médico — não deixar passar sem cuidado.',
    D: 'Lateralizar sim, mas segurar o corpo é imobilização forçada — proibida.',
  },
  'ivin-enfermagem-urgencias-e-emergencias-1777104056718-0': {
    A: 'Febre e cefaleia isoladas não compõem o quadro típico de hipoglicemia.',
    B: 'Bradicardia não é sinal clássico — hipoglicemia costuma cursar com taquicardia e sudorese.',
    D: 'Convulsão pode ocorrer, mas febre não faz parte da tríade cobrada — náusea e sudorese sim.',
    E: 'Febre com bradicardia e ataxia não descrevem hipoglicemia aguda.',
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104070286-1': {
    B: 'Crise convulsiva: não imobilizar com lençóis nem calço na língua — proteger cabeça e afastar objetos.',
    C: 'Osso exposto — não sentar nem oferecer água; estabilizar e acionar SAMU.',
    D: 'Déficit neurológico focal — elevar pernas não é orientação correta nesta prova.',
    E: 'Corpo estranho — punho nas costas isolado não fecha o protocolo de desobstrução.',
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const slides = finalizeSlides(slug, raw, pack, DANGER_OVERRIDES);
    const out = {
      meta: metaBase(raw, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER),
      question_data: raw.question_data,
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g27] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g27] total=${ok}`);
}

main();
