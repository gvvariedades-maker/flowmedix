#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g46 (8 slugs · 17º lote urgencias_generico).
 * Inferência strict-v2: crise hipertensiva · pneumotórax · Glasgow TCE · amputação · epistaxe VF · hipoglicemia · avaliação primária ×2.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides as finalizeGenerico,
  glasgowDomainsRows,
  metaBase as metaGenerico,
  slideMeta as genericoSlideMeta,
  type Pack as GenericoPack,
  type Q as GenericoQ,
} from './lib/urgenciasGenericoGolden';
import {
  finalizeSlides as finalizeVf,
  metaBase as metaVf,
  slideMeta as vfSlideMeta,
  vfRows,
  type Pack as VfPack,
  type Q as VfQ,
} from './lib/urgenciasVfProtocoloGolden';

const LOTE = 'urgencias-g46';
const REVIEWER = 'handcraft-urgencias-g46';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const VF_FOOTER = 'Julgue I–IV antes de cruzar com A–E';

const CRISE_HIPERTENSIVA_CONDUTA = [
  { label: 'Definição', value: 'PA muito elevada — crise hipertensiva aguda', badge: 'hot' },
  { label: 'Conduta', value: 'Estabilizar PA gradualmente — meta pressórica segura', badge: 'ok' },
  { label: '× UTI imediata', value: 'Nem toda crise exige transferência imediata à UTI', badge: 'warn' },
  { label: '× Queda abrupta', value: 'Redução rápida demais — risco de perfusão cerebral', badge: 'warn' },
  { label: '× Só EV', value: 'Via depende de gravidade — não exclusivamente endovenosa', badge: 'info' },
];

const PNEUMOTORAX_TRAUMA = [
  { label: 'Mecanismo', value: 'Trauma torácico + ar no espaço pleural', badge: 'hot' },
  { label: 'Sinais', value: 'Dor pleurítica · dispneia · cianose · tosse', badge: 'ok' },
  { label: '× Líquido pleural', value: 'Acúmulo líquido — não ar no espaço pleural', badge: 'warn' },
  { label: '× Colecistite', value: 'Abdome superior — não trauma torácico agudo', badge: 'info' },
  { label: '× Angina', value: 'Isquemia miocárdica — sem trauma penetrante/contuso torácico', badge: 'warn' },
];

const AMPUTACAO_TRANSPORTE = [
  { label: 'Prioridade', value: 'Controlar sangramento · encaminhar vítima + segmento', badge: 'hot' },
  { label: 'Transporte', value: 'Segmento em saco plástico identificado + recipiente com gelo', badge: 'ok' },
  { label: '× Contato direto gelo', value: 'Gelo direto lesiona tecido — isolar com saco', badge: 'warn' },
  { label: '× Álcool gel', value: 'Não higienizar segmento amputado com álcool', badge: 'warn' },
  { label: '× Imersão SF', value: 'Mergulhar em soro — degrada viabilidade do tecido', badge: 'warn' },
];

const EPISTAXE_PS = [
  { label: 'Posição', value: 'Sentado · cabeça levemente flexionada à frente', badge: 'hot' },
  { label: 'Compressão', value: 'Compressão digital da narina por alguns minutos', badge: 'ok' },
  { label: 'Frio local', value: 'Compressa gelada no dorso nasal — vasoconstrição', badge: 'info' },
  { label: '× Assoar nariz', value: 'Após cessar sangramento — pode reiniciar epistaxe', badge: 'warn' },
  { label: '× Cabeça para trás', value: 'Deglutição de sangue — conduta clássica errada', badge: 'warn' },
];

const HIPOGLICEMIA_VRGC = [
  { label: 'Limiar', value: 'Glicemia capilar baixa define hipoglicemia', badge: 'hot' },
  { label: 'Consciente', value: 'Carboidrato oral — suco/refrigerante ou açúcar/mel', badge: 'ok' },
  { label: 'Volume', value: 'Porção oral de suco/refrigerante ou açúcar/mel', badge: 'ok' },
  { label: '× Limiar alto', value: 'Banca troca corte glicêmico do protocolo', badge: 'warn' },
  { label: '× Água isolada', value: 'Água adoçada isolada — tipo/volume distinto do gabarito', badge: 'info' },
];

const AVALIACAO_PRIMARIA_COMPONENTES = [
  { label: 'Sequência', value: 'Avaliação primária — vida antes de detalhes', badge: 'hot' },
  { label: 'Componentes', value: 'Responsividade · via aérea · ventilação · circulação · neurológico', badge: 'ok' },
  { label: '× Secundária', value: 'Exame cabeça-pés — avaliação secundária, não primária', badge: 'warn' },
  { label: '× Acesso/infusão', value: 'Punção precoce — após estabilizar funções vitais', badge: 'info' },
  { label: '× Só oximetria', value: 'Monitorização complementa — não substitui avaliação primária', badge: 'warn' },
];

const AVALIACAO_PRIMARIA_CENA = [
  { label: 'Objetivo primário', value: 'Identificar e corrigir ameaças imediatas à vida', badge: 'hot' },
  { label: 'Paciente crítico', value: 'Permanência mínima na cena — load and go', badge: 'ok' },
  { label: '× Só 1 SV alterado', value: 'Crítico não se define por um único sinal vital isolado', badge: 'warn' },
  { label: '× VAA proibida', value: 'Dispositivos de VAA podem ser necessários na cena', badge: 'warn' },
  { label: '× Sequelas futuras', value: 'Primária trata risco imediato — secundária foca lesões', badge: 'info' },
];

type GenericoEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };
type VfEntry = { branch: 'vf'; pack: VfPack; danger: Record<string, string> };
type HandcraftEntry = GenericoEntry | VfEntry;

const SPECS: Record<string, HandcraftEntry> = {
  'vunesp-enfermagem-urgencias-e-emergencias-1777103981770-3': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Crise hipertensiva — estabilizar PA gradualmente com meta inferior a 140/90 mmHg; evitar queda abrupta e condutas absolutistas',
      roi_error: 'crise_hipertensiva_estabilizacao_gradual',
      cluster: 'Crise hipertensiva — conduta de enfermagem',
      danger_footer: 'Gabarito C — estabilização gradual',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Crise hipertensiva',
          meta: genericoSlideMeta,
          items: [
            { label: 'Definição', detail: 'PA muito elevada — episódio agudo hipertensivo.', icon: 'Activity' },
            { label: 'Conduta', detail: 'Redução gradual da PA — meta pressórica segura.', icon: 'TrendingDown' },
            { label: 'Risco órgão-alvo', detail: 'Lesão aguda possível — monitorar e comunicar equipe.', icon: 'AlertTriangle' },
            { label: '× UTI automática', detail: 'Transferência depende de gravidade — não regra absoluta.', icon: 'Ban' },
            { label: 'Pegadinha — queda abrupta', detail: 'Banca induz UTI imediata ou redução rápida demais da PA.', icon: 'AlertTriangle' },
            { label: '× Queda rápida', detail: 'Prazo fixo de horas — perfusão cerebral em risco.', icon: 'XCircle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Crise hipertensiva — cuidado de enfermagem correto?',
            'Eliminar risco iminente de morte → UTI imediata — generalização excessiva.',
            'Eliminar queda abrupta em prazo fixo — não é padrão de estabilização.',
            'Eliminar ausência de risco de lesão aguda — há potencial de órgão-alvo.',
            'Eliminar tratamento estritamente EV — via depende do quadro.',
            'C estabilizar gradualmente PA — conduta adequada.',
            'Marcar C.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Crise hipertensiva — decore',
          meta: genericoSlideMeta,
          content: 'CRISE HIPERTENSIVA — CONDUTA',
          rows: CRISE_HIPERTENSIVA_CONDUTA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Risco iminente de morte com UTI imediata — generalização; crise hipertensiva nem sempre exige transferência direta à UTI.',
      B: 'Queda abrupta da PA em prazo fixo — pode comprometer perfusão cerebral e coronariana.',
      D: 'Negar risco de lesão aguda em órgão-alvo — crise hipertensiva pode evoluir com dano agudo.',
      E: 'Tratamento estritamente EV — via e velocidade dependem de urgência vs emergência hipertensiva.',
    },
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777103994618-4': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Trauma torácico com acúmulo de ar na região pleural — dor pleurítica, dispneia, cianose e tosse = pneumotórax',
      roi_error: 'pneumotorax_trauma_toracico',
      cluster: 'Trauma torácico — pneumotórax',
      danger_footer: 'Gabarito A — pneumotórax',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Trauma torácico — ar pleural',
          meta: genericoSlideMeta,
          items: [
            { label: 'Cenário', detail: 'Acidente automóvel · trauma de tórax · ar acumulado.', icon: 'Car' },
            { label: 'Sinais', detail: 'Dor ao respirar · dispneia · cianose · tosse.', icon: 'Wind' },
            { label: 'Diagnóstico', detail: 'Pneumotórax — ar no espaço pleural.', icon: 'Activity' },
            { label: '× Líquido pleural', detail: 'Acúmulo líquido — enunciado ancora ar, não líquido.', icon: 'Ban' },
            { label: '× Colecistite', detail: 'Abdome — não trauma torácico agudo.', icon: 'XCircle' },
            { label: 'Pegadinha — líquido × ar', detail: 'Banca troca pneumotórax por acúmulo líquido pleural.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Trauma de tórax com acúmulo de ar — diagnóstico típico?',
            'Sinais: dor pleurítica · dispneia · cianose · tosse.',
            'Ar no espaço pleural = pneumotórax.',
            'Eliminar colecistite · líquido pleural · hepatomegalia · angina.',
            'Marcar A — pneumotórax.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Pneumotórax — decore',
          meta: genericoSlideMeta,
          content: 'PNEUMOTÓRAX — TRAUMA',
          rows: PNEUMOTORAX_TRAUMA,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — pneumotorax trauma toracico',
          items: [
            {
              label: 'Letra B — colecistite',
              detail: 'Inflamação da vesícula biliar — quadro abdominal.',
              correct: 'Trauma torácico com ar pleural — diagnóstico é pneumotórax (A).',
            },
            {
              label: 'Letra C — líquido pleural',
              detail: 'Acúmulo líquido no espaço pleural — pegadinha ar × líquido.',
              correct: 'Enunciado ancora ar na região — banca troca pneumotórax por líquido pleural (A).',
            },
            {
              label: 'Letra D — hepatomegalia',
              detail: 'Aumento do fígado — não explica trauma torácico agudo.',
              correct: 'Dispneia e ar pleural apontam pneumotórax — gabarito A.',
            },
            {
              label: 'Letra E — angina',
              detail: 'Isquemia miocárdica sem trauma torácico penetrante/contuso.',
              correct: 'Trauma + ar pleural = pneumotórax — gabarito A.',
            },
          ],
          footer_rule: 'Gabarito A — pneumotórax',
        },
      ],
    },
    danger: {},
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777103994618-5': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Traumatismo craniano — avaliação do nível de consciência pela Escala de Coma de Glasgow (ocular · verbal · motora)',
      roi_error: 'glasgow_tce_instrumento',
      cluster: 'TCE — Escala de Glasgow (generico strict-v2)',
      danger_footer: 'Gabarito C — Escala de Glasgow',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'TCE — nível de consciência',
          meta: genericoSlideMeta,
          items: [
            { label: 'Cenário', detail: 'Traumatismo craniano — idosa em unidade de saúde.', icon: 'Brain' },
            { label: 'Glasgow', detail: 'Quantifica consciência — respostas ocular, verbal e motora.', icon: 'Eye' },
            { label: 'Uso', detail: 'Padrão em TCE e rebaixamento — letra D no XABCDE.', icon: 'Activity' },
            { label: '× Ramsay', detail: 'Sedação em UTI — não avaliação inicial de TCE.', icon: 'Ban' },
            { label: '× Bristol', detail: 'Consistência de fezes — não neurológico.', icon: 'XCircle' },
            { label: 'Pegadinha — escalas inventadas', detail: 'Banca troca Glasgow por Ramsay, Ritcher ou Bristol.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'TCE — instrumento para avaliar nível de consciência?',
            'Glasgow — padrão em trauma cranioencefálico.',
            'Eliminar Ramsay (sedação) · Ritcher (inventada) · PH (gasometria) · Bristol (fezes).',
            'Marcar C — Escala de Glasgow.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Glasgow no TCE',
          meta: genericoSlideMeta,
          content: 'TCE — GLASGOW',
          rows: glasgowDomainsRows([
            { label: '× Ramsay/PH', value: 'Sedação ou gasometria — não escala de consciência aguda', badge: 'warn' },
          ]),
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Escala de Ramsay — mede profundidade de sedação em UTI, não nível de consciência no TCE agudo.',
      B: 'Escala de Ritcher — nome inventado; Glasgow é o instrumento padrão em trauma craniano.',
      D: 'Escala de PH — refere-se a gasometria (pH), não avaliação neurológica de consciência.',
      E: 'Escala de Bristol — classifica consistência fecal — não instrumento neurológico de urgência.',
    },
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777103994618-7': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Amputação traumática — após controle do sangramento, transportar segmento em saco plástico identificado dentro de recipiente com gelo (sem contato direto)',
      roi_error: 'amputacao_transporte_saco_gelo',
      cluster: 'Primeiros socorros — amputação e transporte do segmento',
      danger_footer: 'Gabarito E — saco plástico + gelo indireto',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Amputação — transporte',
          meta: genericoSlideMeta,
          items: [
            { label: 'Prioridade', detail: 'Controlar sangramento · estabilizar vítima.', icon: 'Droplet' },
            { label: 'Segmento', detail: 'Saco plástico identificado + recipiente com gelo.', icon: 'Snowflake' },
            { label: 'Isolamento', detail: 'Gelo indireto — evita lesão por congelamento do tecido.', icon: 'Shield' },
            { label: '× Álcool gel', detail: 'Não higienizar segmento amputado com álcool.', icon: 'Ban' },
            { label: '× Imersão', detail: 'Não mergulhar em soro ou água — degrada viabilidade.', icon: 'XCircle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Amputação traumática de dedo — preparo do segmento para transporte?',
            'Após controle do sangramento — encaminhar vítima + parte amputada.',
            'Eliminar álcool gel · gaze seca isolada · imersão em SF gelado · gelo direto no segmento.',
            'E saco plástico identificado + recipiente com gelo — técnica correta.',
            'Marcar E.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Amputação — decore',
          meta: genericoSlideMeta,
          content: 'TRANSPORTE DO SEGMENTO',
          rows: AMPUTACAO_TRANSPORTE,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — amputacao transporte saco gelo',
          items: [
            {
              label: 'Letra A — álcool gel',
              detail: 'Higienizar segmento amputado com álcool gel.',
              correct: 'Não usar álcool no segmento — transporte em saco plástico + gelo indireto (E).',
            },
            {
              label: 'Letra B — gaze seca',
              detail: 'Envolver parte amputada apenas em gaze estéril seca.',
              correct: 'Gaze seca isolada não é padrão de resfriamento — gabarito E.',
            },
            {
              label: 'Letra C — imersão em soro',
              detail: 'Mergulhar segmento em soro fisiológico gelado.',
              correct: 'Imersão degrada tecido — saco plástico + gelo indireto (E).',
            },
            {
              label: 'Letra D — gelo direto',
              detail: 'Segmento envolvido diretamente em gelo.',
              correct: 'Contato direto com gelo lesiona tecido — isolar com saco (E).',
            },
          ],
          footer_rule: 'Gabarito E — saco plástico + gelo indireto',
        },
      ],
    },
    danger: {},
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104000896-1': {
    branch: 'vf',
    pack: {
      family: 'vf',
      guideline:
        'Epistaxe — posição sentada flexionada, compressão digital e compressa gelada; não assoar nariz após cessar sangramento',
      roi_error: 'epistaxe_vf_primeiros_socorros',
      cluster: 'Epistaxe — VF I/II/III corretos · IV incorreto',
      danger_footer: 'Gabarito B — I, II e III',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Epistaxe — V/F',
          meta: vfSlideMeta,
          items: [
            { label: 'Comando', detail: 'Julgar I–IV e montar combinação correta.', icon: 'Target' },
            { label: 'I — posição', detail: 'Sentado · cabeça levemente flexionada — verdadeiro.', icon: 'User' },
            { label: 'II — compressão', detail: 'Compressão digital da narina — verdadeiro.', icon: 'Hand' },
            { label: 'III — frio', detail: 'Compressa gelada no dorso nasal — verdadeiro.', icon: 'Snowflake' },
            { label: 'IV — assoar', detail: 'Assoar nariz após cessar — falso.', icon: 'Ban' },
            { label: 'Pegadinha — item IV', detail: 'Banca inclui assoar nariz como conduta correta.', icon: 'AlertTriangle' },
          ],
          footer_rule: VF_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: vfSlideMeta,
          steps: [
            'Epistaxe — julgar I a IV item a item.',
            'I posição sentada flexionada — verdadeiro.',
            'II compressão digital prolongada — verdadeiro.',
            'III compressa gelada no dorso nasal — verdadeiro.',
            'IV assoar nariz após cessar — falso (reinicia epistaxe).',
            'Combinação: I, II e III apenas — marcar B.',
          ],
          footer_rule: VF_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Epistaxe — decore V/F',
          meta: vfSlideMeta,
          content: 'EPISTAXE — PRIMEIROS SOCORROS',
          rows: vfRows([
            { roman: 'I', verdict: 'V', note: 'Sentado · cabeça flexionada à frente' },
            { roman: 'II', verdict: 'V', note: 'Compressão digital da narina' },
            { roman: 'III', verdict: 'V', note: 'Compressa gelada no dorso nasal' },
            { roman: 'IV', verdict: 'F', note: 'Não assoar nariz após cessar sangramento' },
          ]),
          footer_rule: VF_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: vfSlideMeta,
          content: 'PEGADINHAS — epistaxe VF',
          items: [
            {
              label: 'Letra A — incluir IV',
              detail: 'I, II, III e IV — aceita assoar nariz após cessar sangramento.',
              correct: 'IV é falsa — assoar pode reiniciar epistaxe; gabarito B (I, II e III).',
            },
            {
              label: 'Letra C — II, III e IV',
              detail: 'Omite I (posicionamento) e inclui IV (assoar).',
              correct: 'I é verdadeira e IV é falsa — gabarito B.',
            },
            {
              label: 'Letra D — só I e II',
              detail: 'Exclui III (compressa gelada) que é conduta correta.',
              correct: 'III é verdadeira — gabarito B inclui I, II e III.',
            },
            {
              label: 'Letra E — só III',
              detail: 'Isola apenas compressa gelada — ignora posição e compressão.',
              correct: 'I e II também corretos — gabarito B.',
            },
          ],
          footer_rule: VF_FOOTER,
        },
      ],
    },
    danger: {},
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104048047-6': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Hipoglicemia domiciliar — glicemia capilar baixa; conduta oral com suco/refrigerante ou açúcar/mel',
      roi_error: 'hipoglicemia_vrgc_conduta_domiciliar',
      cluster: 'Hipoglicemia DM — VRGC e carboidrato oral (protocolo VUNESP)',
      danger_footer: 'Gabarito D — limiar baixo + suco/refrigerante',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Hipoglicemia domiciliar',
          meta: genericoSlideMeta,
          items: [
            { label: 'Cenário', detail: 'Visita domiciliar · diabético insulinodependente · insulina sem café da manhã.', icon: 'User' },
            { label: 'Sinais', detail: 'Confusão · palidez · sudorese · tonturas · cefaleia — hipoglicemia.', icon: 'Activity' },
            { label: 'VRGC', detail: 'Glicemia capilar baixa — primeiros socorros no domicílio.', icon: 'Gauge' },
            { label: 'Conduta', detail: 'Carboidrato oral — suco/refrigerante ou açúcar/mel.', icon: 'Droplet' },
            { label: 'Pegadinha — limiar/volume', detail: 'Banca troca corte glicêmico ou tipo de carboidrato oral.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Hipoglicemia domiciliar — VRGC e conduta inicial?',
            'Limiar baixo de glicemia capilar — hipoglicemia.',
            'Consciente: carboidrato oral — suco/refrigerante ou açúcar/mel.',
            'Eliminar limiares altos · água adoçada isolada · colheres de sopa.',
            'Marcar D.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Hipoglicemia — decore',
          meta: genericoSlideMeta,
          content: 'VRGC + CONDUTA DOMICILIAR',
          rows: HIPOGLICEMIA_VRGC,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — hipoglicemia vrgc conduta domiciliar',
          items: [
            {
              label: 'Letra A — limiar alto + água',
              detail: 'Corte glicêmico elevado com água adoçada e colheres de sopa.',
              correct: 'Limiar e carboidrato oral divergem do protocolo cobrado — gabarito D.',
            },
            {
              label: 'Letra B — limiar intermediário',
              detail: 'Corte glicêmico intermediário com colheres de sopa.',
              correct: 'Valor de corte inadequado para hipoglicemia — gabarito D.',
            },
            {
              label: 'Letra C — suco adoçado excessivo',
              detail: 'Limiar intermediário com grande volume de suco adoçado.',
              correct: 'Corte e preparo distintos do gabarito — marcar D.',
            },
            {
              label: 'Letra E — limiar certo, conduta errada',
              detail: 'Limiar baixo correto, mas água adoçada com colheres de sopa.',
              correct: 'Conduta oral inadequada — suco/refrigerante ou açúcar/mel (D).',
            },
          ],
          footer_rule: 'Gabarito D — limiar baixo + suco/refrigerante',
        },
      ],
    },
    danger: {},
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104063550-4': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Avaliação primária pré-hospitalar — responsividade, permeabilidade de via aérea, ventilação, circulação e estado neurológico',
      roi_error: 'avaliacao_primaria_componentes',
      cluster: 'SAMU — avaliação primária (síncope + colisão)',
      danger_footer: 'Gabarito B — avaliação primária',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Avaliação primária',
          meta: genericoSlideMeta,
          items: [
            { label: 'Cenário', detail: 'Síncope ao volante · colisão · SAMU na cena.', icon: 'Ambulance' },
            { label: 'Primária', detail: 'Avaliar ameaças imediatas à vida — ABCDE.', icon: 'Activity' },
            { label: 'Componentes', detail: 'Responsividade · VAA · ventilação · circulação · neurológico.', icon: 'HeartPulse' },
            { label: '× Secundária', detail: 'Exame cabeça-pés — fase posterior.', icon: 'Ban' },
            { label: '× Acesso precoce', detail: 'Punção/infusão após estabilizar funções vitais.', icon: 'XCircle' },
            { label: 'Pegadinha — secundária × primária', detail: 'Banca troca avaliação primária por exame detalhado ou manobra única.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'SAMU na cena — avaliação primária consiste em quê?',
            'Primária = responsividade + via aérea + ventilação + circulação + neurológico.',
            'Eliminar punção precoce · exame cabeça-pés · manobra isolada · só monitorização.',
            'Marcar B.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Primária — decore',
          meta: genericoSlideMeta,
          content: 'AVALIAÇÃO PRIMÁRIA — SAMU',
          rows: AVALIACAO_PRIMARIA_COMPONENTES,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — avaliacao primaria componentes',
          items: [
            {
              label: 'Letra A — punção precoce',
              detail: 'Punção calibrosa e infusão de soro fisiológico.',
              correct: 'Acesso venoso não define avaliação primária — gabarito B.',
            },
            {
              label: 'Letra C — exame cabeça-pés',
              detail: 'Exame detalhado da cabeça aos pés.',
              correct: 'Avaliação secundária — não primária de ameaças à vida (B).',
            },
            {
              label: 'Letra D — corpo estranho',
              detail: 'Manobra de desobstrução por corpo estranho.',
              correct: 'Manobra específica — não escopo geral da primária (B).',
            },
            {
              label: 'Letra E — só monitorização',
              detail: 'Oximetria e glicemia capilar isoladas.',
              correct: 'Monitorização complementa — não substitui primária (B).',
            },
          ],
          footer_rule: 'Gabarito B — avaliação primária',
        },
      ],
    },
    danger: {},
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104063550-6': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Avaliação primária — paciente crítico exige permanência mínima na cena (load and go após estabilização inicial)',
      roi_error: 'avaliacao_primaria_tempo_cena_critico',
      cluster: 'Avaliação primária — tempo na cena do crítico',
      danger_footer: 'Gabarito D — Certo',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Primária — tempo na cena',
          meta: genericoSlideMeta,
          items: [
            { label: 'Comando', detail: 'Julgar qual afirmativa sobre avaliação primária está correta.', icon: 'Target' },
            { label: 'Afirmativa D', detail: 'Paciente crítico → tempo mínimo na cena.', icon: 'Ambulance' },
            { label: '× 1 SV alterado', detail: 'Um único sinal vital alterado não define crítico.', icon: 'Ban' },
            { label: '× VAA proibida', detail: 'Dispositivos de VAA podem ser necessários na cena.', icon: 'XCircle' },
            { label: 'Pegadinha — objetivo primário', detail: 'Banca confunde risco imediato com sequelas futuras ou SAMPLA.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Avaliação primária — julgar afirmativas.',
            'D: paciente crítico → tempo mínimo na cena — verdadeiro (load and go).',
            'Eliminar A (1 SV = crítico) · B (VAA proibida) · C (sequelas futuras) · E (SAMPLA só pelo paciente).',
            'Marcar D.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Primária — decore',
          meta: genericoSlideMeta,
          content: 'LOAD AND GO — CENA',
          rows: [
            { label: 'Crítico', value: 'Permanência mínima na cena após estabilização inicial', badge: 'hot' },
            { label: 'Princípio', value: 'Transporte rápido quando ameaça imediata persiste', badge: 'ok' },
            { label: '× 1 SV', value: 'Crítico não se define por um único parâmetro isolado', badge: 'warn' },
            { label: '× VAA banida', value: 'Abertura de via aérea pode ser necessária na cena', badge: 'warn' },
            { label: '× Sequelas', value: 'Primária corrige risco imediato — secundária detalha lesões', badge: 'info' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — avaliação primária C/E',
          items: [
            {
              label: 'Letra A — 1 SV alterado = crítico',
              detail: 'Considera crítico todo paciente com alteração de um único sinal vital.',
              correct: 'Crítico depende de ameaça imediata à vida — não um SV isolado; gabarito D.',
            },
            {
              label: 'Letra B — VAA desaconselhável',
              detail: 'Proíbe dispositivos de abertura de via aérea na cena.',
              correct: 'VAA pode ser necessária conforme condição — gabarito D (tempo mínimo na cena).',
            },
            {
              label: 'Letra C — sequelas futuras',
              detail: 'Objetivo primário é corrigir sequelas futuras do trauma.',
              correct: 'Primária corrige ameaças imediatas — sequelas são foco secundário; gabarito D.',
            },
            {
              label: 'Letra E — SAMPLA pelo paciente',
              detail: 'Entrevista SAMPLA deve ser respondida apenas pelo paciente.',
              correct: 'Acompanhante pode responder se paciente incapaz — gabarito D.',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
      ],
    },
    danger: {},
  },
};

function readQuestaoJson(path: string): unknown {
  const raw = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;

  for (const [slug, entry] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = readQuestaoJson(path);

    if (entry.branch === 'vf') {
      const q = raw as VfQ;
      const slides = finalizeVf(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaVf(
          q,
          entry.pack.family,
          entry.pack.guideline,
          slug,
          entry.pack.roi_error,
          entry.pack.cluster,
          REVIEWER,
        ),
        question_data: q.question_data,
        reverse_study_slides: slides,
        modulo_slug: q.modulo_slug ?? slug,
      };
      writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    } else {
      const q = raw as GenericoQ;
      const slides = finalizeGenerico(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaGenerico(
          q,
          entry.pack.family,
          entry.pack.guideline,
          slug,
          entry.pack.roi_error,
          entry.pack.cluster,
          REVIEWER,
        ),
        question_data: q.question_data,
        reverse_study_slides: slides,
        modulo_slug: q.modulo_slug ?? slug,
      };
      writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    }

    ok++;
    console.log(`[handcraft:urgencias-g46] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g46] total=${ok}`);
}

main();
