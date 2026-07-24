import fs from 'fs';
import path from 'path';
import { expect, type Page } from '@playwright/test';

export const PNI_IMUNIZACAO_BRANCHES = [
  'imunizacao_vf_intervalos',
  'imunizacao_calendario',
  'imunizacao_cadeia_frio',
  'imunizacao_exceto',
  'imunizacao_generico',
] as const;

/** Ramo Vias com pacote bespoke 4/4 (absorção / velocidade). */
export const VIAS_BESPOKE_BRANCHES = ['via_vf_absorcao'] as const;

/** Ramos Vias para regressão visual (bespoke + genéricos). */
export const VIAS_BRANCHES = [
  'via_vf_absorcao',
  'via_tecnica_admin',
  'via_generico',
] as const;

/** Ramos Língua Portuguesa — Crase (funil bespoke + genérico). */
export const PT_CRASE_BESPOKE_BRANCHES = ['pt_crase'] as const;

export const PT_CRASE_BRANCHES = ['pt_crase', 'pt_crase_generico'] as const;

export const PT_CLITIC_BESPOKE_BRANCHES = ['pt_pronomes_colocacao'] as const;

export const PT_CLITIC_BRANCHES = [
  'pt_pronomes_colocacao',
  'pt_pronomes_colocacao_generico',
] as const;

/** Ramos Língua Portuguesa — Termos da oração (matriz bespoke + genérico). */
export const PT_TERMOS_BESPOKE_BRANCHES = ['pt_termos_oracao'] as const;

export const PT_TERMOS_BRANCHES = ['pt_termos_oracao', 'pt_termos_oracao_generico'] as const;

/** Ramos Língua Portuguesa — Concordância (núcleo em foco bespoke + genérico). */
export const PT_CONCORDANCIA_BESPOKE_BRANCHES = ['pt_concordancia'] as const;

export const PT_CONCORDANCIA_BRANCHES = ['pt_concordancia', 'pt_concordancia_generico'] as const;

/** Ramos Língua Portuguesa — Verbos (ok_generico · linha do tempo verbal). */
export const PT_VERBOS_BESPOKE_BRANCHES = [] as const;

export const PT_VERBOS_BRANCHES = ['pt_verbos'] as const;

/** Ramos Língua Portuguesa — Denotação/conotação (ok_generico · lente literal × figurado). */
export const PT_DENOTACAO_BESPOKE_BRANCHES = [] as const;

export const PT_DENOTACAO_BRANCHES = ['pt_denotacao_conotacao'] as const;

/** Ramos Língua Portuguesa — Sinônimos, antônimos e polissemia (ok_generico). */
export const PT_SINONIMOS_BESPOKE_BRANCHES = [] as const;

export const PT_SINONIMOS_BRANCHES = ['pt_sinonimos_polissemia'] as const;

/** Ramos Língua Portuguesa — Orações coord./subord. (pt-period-rail bespoke + genérico). */
export const PT_ORACOES_BESPOKE_BRANCHES = ['pt_oracoes_subordinadas'] as const;

export const PT_ORACOES_BRANCHES = [
  'pt_oracoes_subordinadas',
  'pt_oracoes_subordinadas_generico',
] as const;

/** Ramos Saúde do Adolescente (ética bespoke + genéricos por eixo). */
export const ADOLESCENTE_BRANCHES = [
  'adolescente_etica_sigilo',
  'adolescente_antropometria',
  'adolescente_desenvolvimento',
  'adolescente_saude_mental',
  'adolescente_violencia_protecao',
  'adolescente_generico',
] as const;

/** Ramos SV com pacote bespoke vitals-panel (playbook § pedagogical_branches + clusters temperatura/FR). */
export const SINAIS_VITAIS_BRANCHES = [
  'vitals_pa_tecnica',
  'vitals_fc_faixas',
  'vitals_interpretacao',
  'vitals_vf_faixas',
  'vitals_exceto_tecnica',
  'vitals_temperatura',
  'vitals_fr_faixas',
  'vitals_generico',
] as const;

/** Ramo SV com pacote bespoke 4/4 (PA técnica + reference-board). */
export const SINAIS_VITAIS_BESPOKE_BRANCHES = ['vitals_pa_tecnica', 'vitals_exceto_tecnica'] as const;

/** Ramo PNI com pacote bespoke 4/4 (calendário ≠ cadeia frio ≠ V/F intervalos). */
export const PNI_BESPOKE_BRANCHES = [
  'imunizacao_vf_intervalos',
  'imunizacao_calendario',
  'imunizacao_cadeia_frio',
] as const;

/** Ramos CAM com pacote bespoke 4/4 (9 certos V/F + alto risco + EXCETO + documentação). */
export const CAM_BESPOKE_BRANCHES = [
  'cam_certos_vf_caso',
  'cam_alto_risco',
  'cam_exceto_conduta',
  'cam_documentacao',
] as const;

/** Ramos Punção com pacote bespoke 4/4. */
export const PUNCAO_BESPOKE_BRANCHES = [
  'puncao_flebite',
  'puncao_dispositivo',
  'puncao_exceto',
  'puncao_tempo',
  'puncao_periferica_antissepsia',
  'puncao_ipcs_cvc',
] as const;

/** Ramos Punção Venosa — regressão L3 (6 bespoke + genérico). */
export const PUNCAO_BRANCHES = [
  'puncao_flebite',
  'puncao_dispositivo',
  'puncao_exceto',
  'puncao_tempo',
  'puncao_periferica_antissepsia',
  'puncao_ipcs_cvc',
  'puncao_generico',
] as const;

/** Ramos Cuidados na Administração — regressão L3. */
export const CAM_BRANCHES = [
  'cam_certos_vf_caso',
  'cam_alto_risco',
  'cam_exceto_conduta',
  'cam_documentacao',
  'cam_generico',
] as const;

/** Ramos Urgências e Emergências — regressão L3 (13 pedagogical_branch). */
export const URGENCIAS_BRANCHES = [
  'urgencias_rcp_sbv',
  'urgencias_rcp_pediatrico',
  'urgencias_avc_iam',
  'urgencias_xabcde_trauma',
  'urgencias_choque',
  'urgencias_engasgo',
  'urgencias_exceto_conduta',
  'urgencias_vf_protocolo',
  'urgencias_convulsao',
  'urgencias_manchester_triagem',
  'urgencias_anafilaxia',
  'urgencias_queimadura',
  'urgencias_generico',
] as const;

/** Ramos Urgências com pacote bespoke 4/4 completo. */
export const URGENCIAS_BESPOKE_BRANCHES = [...URGENCIAS_BRANCHES] as const;

/** Ramos Saúde da Mulher — regressão L3 (4 ramos fortes bespoke 4/4). */
export const SAUDE_MULHER_BRANCHES = [
  'mulher_prenatal',
  'mulher_parto',
  'mulher_papanicolau',
  'mulher_mama',
] as const;

/** Ramos Saúde da Mulher com pacote bespoke 4/4 completo. */
export const SAUDE_MULHER_BESPOKE_BRANCHES = [...SAUDE_MULHER_BRANCHES] as const;

/** Ramos Saúde da Criança — regressão L3 (7 ramos bespoke 4/4). */
export const CRIANCA_BRANCHES = [
  'crianca_aleitamento_nutricao',
  'crianca_triagem_neonatal',
  'crianca_generico',
  'crianca_desidratacao',
  'crianca_aps_puericultura',
  'crianca_neonatologia',
  'crianca_desenvolvimento',
] as const;

/** Ramos Saúde da Criança com pacote bespoke 4/4 completo. */
export const CRIANCA_BESPOKE_BRANCHES = [...CRIANCA_BRANCHES] as const;

/** Ramos Processamento / CME — regressão L3 (5 ramos). */
export const PROCESSAMENTO_BRANCHES = [
  'cme_preparo_limpeza',
  'cme_autoclave_metodos',
  'cme_processamento_conceito',
  'cme_vf_ce',
  'cme_generico',
] as const;

/** Ramos Processamento com pacote reference_table / compare premium. */
export const PROCESSAMENTO_BESPOKE_BRANCHES = ['cme_autoclave_metodos', 'cme_vf_ce'] as const;

/** Ramos CME — alias semântico (mesmos 5 ramos que Processamento). */
export const CME_BRANCHES = [...PROCESSAMENTO_BRANCHES] as const;
export const CME_BESPOKE_BRANCHES = [...PROCESSAMENTO_BESPOKE_BRANCHES] as const;

/** Ramos Farmacodinâmica — regressão L3 (clínico bespoke + PK/PD VF + genérico). */
export const FARMACO_BRANCHES = [
  'farmaco_clinico_protocolo',
  'farmaco_pk_pd_vf',
  'farmaco_generico',
] as const;

/** Ramos Farmacodinâmica com pacote bespoke 4/4 (clínico EV + ADME journey). */
export const FARMACO_BESPOKE_BRANCHES = [
  'farmaco_clinico_protocolo',
  'farmaco_pk_pd_vf',
] as const;

/** Ramos Cálculo — regressão L3 (dose bespoke + conceito genérico; calc_generico cauda vazia no pacote). */
export const CALCULO_BRANCHES = ['calc_dose_equivalencia', 'calc_conceito'] as const;

/** Ramo Cálculo com pacote bespoke dose-* 4/4. */
export const CALCULO_BESPOKE_BRANCHES = ['calc_dose_equivalencia'] as const;

/** Ramos Doenças Respiratórias Crônicas — regressão L3 (5 ramos). */
export const RESPIRATORIO_BRANCHES = [
  'respiratorio_vf_asma_dpoc',
  'respiratorio_dpoc_oxigenio',
  'respiratorio_asma_crise',
  'respiratorio_tecnica_inalador',
  'respiratorio_generico',
] as const;

/** Ramos Respiratório com pacote bespoke duel-deck + spo2-board. */
export const RESPIRATORIO_BESPOKE_BRANCHES = [
  'respiratorio_vf_asma_dpoc',
  'respiratorio_dpoc_oxigenio',
] as const;

/** Ramos Infecções / Biossegurança — regressão L3 (2 ramos). */
export const BIOSSEG_BRANCHES = ['biosseg_iras_itu_cateter', 'biosseg_generico'] as const;

/** Ramos com molde bespoke 4/4 (ITU + genérico IRAS/precauções). */
export const BIOSSEG_BESPOKE_BRANCHES = [...BIOSSEG_BRANCHES] as const;

/** Ramos Doenças Bacterianas — regressão L3 (3 ramos). */
export const BACTERIANAS_BRANCHES = [
  'bacterianas_agente_etiologico',
  'bacterianas_tuberculose',
  'bacterianas_generico',
] as const;

/** Ramos com molde bespoke 4/4 (etiologia + TB vigilância). */
export const BACTERIANAS_BESPOKE_BRANCHES = [
  'bacterianas_agente_etiologico',
  'bacterianas_tuberculose',
] as const;

/** Ramos Assistência Perioperatória — regressão L3 (4 bespoke + cauda). */
export const PERIOPERATORIA_BRANCHES = [
  'perioperatorio_pre_operatorio',
  'perioperatorio_pos_operatorio',
  'perioperatorio_protocolo',
  'perioperatorio_vf',
  'perioperatorio_isc',
  'perioperatorio_generico',
] as const;

/** Ramos Perioperatória com pacote bespoke 4/4 (ramos fortes). */
export const PERIOPERATORIA_BESPOKE_BRANCHES = [
  'perioperatorio_pre_operatorio',
  'perioperatorio_pos_operatorio',
  'perioperatorio_protocolo',
  'perioperatorio_vf',
] as const;

/** Ramos Saúde Mental — regressão L3 (6 ramos). */
export const MENTAL_BRANCHES = [
  'mental_raps_legis',
  'mental_crise_caps',
  'mental_dependencia_tabagismo',
  'mental_depressao',
  'mental_aps_acolhimento',
  'mental_generico',
] as const;

/** Ramos Saúde Mental com molde bespoke (crise SAE-tap + legis bridge). */
export const MENTAL_BESPOKE_BRANCHES = ['mental_raps_legis', 'mental_crise_caps'] as const;

/** Ramos Processo de Enfermagem / SAE — regressão L3 (4 ramos). */
export const SAE_BRANCHES = [
  'sae_documentacao',
  'sae_etapas',
  'sae_exceto',
  'sae_generico',
] as const;

/** Ramos SAE com pacote bespoke 4/4 (molde_redesign — não ok_existente). */
export const SAE_BESPOKE_BRANCHES = [
  'sae_documentacao',
  'sae_etapas',
  'sae_exceto',
  'sae_generico',
] as const;

/** Ramos Curativos e Manejo de Feridas — regressão L3 (ramos fortes + LPP). */
export const CURATIVOS_BRANCHES = [
  'curativos_cobertura_selecao',
  'curativos_ferida_cirurgica',
  'curativos_lpp',
] as const;

/** Ramos Curativos com pacote bespoke/redesign 4/4 (ramos fortes). */
export const CURATIVOS_BESPOKE_BRANCHES = [
  'curativos_cobertura_selecao',
  'curativos_ferida_cirurgica',
] as const;

/** Ramos Feridas e Queimaduras — regressão L3 (8 ramos). */
export const FERIDAS_BRANCHES = [
  'feridas_grau_profundidade',
  'feridas_scq_calculo',
  'feridas_scq_regra9',
  'feridas_grande_queimado',
  'feridas_atendimento_inicial',
  'feridas_classificacao',
  'feridas_cicatrizacao',
  'feridas_curativo_tipo',
] as const;

/** Ramos Feridas com moldes burn-* bespoke (depth-deck + rule-nine-board). */
export const FERIDAS_BESPOKE_BRANCHES = [
  'feridas_grau_profundidade',
  'feridas_scq_calculo',
  'feridas_scq_regra9',
  'feridas_grande_queimado',
  'feridas_atendimento_inicial',
] as const;

/** Ramos História da Enfermagem — regressão L3 (4 ramos). */
export const HISTORIA_BRANCHES = [
  'historia_nightingale',
  'historia_humanizacao',
  'historia_comunicacao_etica',
  'historia_generico',
] as const;

/** Ramos Enfermagem do Trabalho — regressão L3 (5 ramos). */
export const TRABALHO_BRANCHES = [
  'trabalho_vf_nr32',
  'trabalho_pep_trap',
  'trabalho_nr15_reference',
  'trabalho_ergonomia',
  'trabalho_generico',
] as const;

/** Ramos Trabalho com pacote bespoke NR-32 4/4. */
export const TRABALHO_BESPOKE_BRANCHES = ['trabalho_vf_nr32', 'trabalho_pep_trap'] as const;

/** Ramos Segurança do Paciente — regressão L3 (5 ramos). */
export const SEGURANCA_BRANCHES = [
  'sp_identificacao',
  'sp_prevencao_quedas',
  'sp_eventos_adversos',
  'sp_metas_internacionais',
  'sp_generico',
] as const;

/** Ramos Segurança com pacote bespoke NSP 4/4 (ramos fortes ≥5 slugs). */
export const SEGURANCA_BESPOKE_BRANCHES = [
  'sp_identificacao',
  'sp_prevencao_quedas',
  'sp_eventos_adversos',
] as const;

/** Ramos Promoção à Saúde — regressão L3 (4 ramos cluster). */
export const PROMOCAO_BRANCHES = [
  'promocao_art4_composicao',
  'promocao_educacao_prevencao',
  'promocao_principios_direitos',
  'promocao_generico',
] as const;

/** Promoção — molde bespoke sus-art4-orbit (Art. 4º Lei 8.080). */
export const PROMOCAO_BESPOKE_BRANCHES = ['promocao_art4_composicao'] as const;

/** Ramos História com concept_map bridge (marcos / ética COFEN). */
export const HISTORIA_BESPOKE_BRANCHES = [
  'historia_nightingale',
  'historia_comunicacao_etica',
] as const;

export const MOBILE_NARROW_VIEWPORT = { width: 375, height: 812 } as const;
export const DESKTOP_VIEWPORT = { width: 1280, height: 900 } as const;
export const SLIDE_COUNT = 4;

export type VisualMoldRegressionSummary = {
  generated_at: string;
  pacote_prefix: string;
  pass: boolean;
  detail: string;
  branches: string[];
};

/** Artefato L3 para `audit:subtopico-quality` (shipGate.checkL3VisualMold). */
export function writeVisualMoldSummary(opts: {
  pacotePrefix: string;
  branches: readonly string[];
  pass?: boolean;
  detail?: string;
}): string {
  const outDir = path.join(process.cwd(), 'artifacts/visual-mold-regression');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'summary.json');
  const branchList = [...opts.branches];
  const summary: VisualMoldRegressionSummary = {
    generated_at: new Date().toISOString(),
    pacote_prefix: opts.pacotePrefix,
    pass: opts.pass ?? true,
    detail:
      opts.detail ??
      `Playwright L3 — ${branchList.length} branch(es): ${branchList.join(', ')}`,
    branches: branchList,
  };
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');
  return outPath;
}

export type VisualAnchorEntry = {
  pedagogical_branch: string;
  slug: string;
  lote: string;
  json_path: string;
};

export function loadVisualAnchors(): Record<string, VisualAnchorEntry> {
  const anchorsPath = path.join(process.cwd(), 'data/catalog-migration/visual-anchors.json');
  const raw = JSON.parse(fs.readFileSync(anchorsPath, 'utf8')) as {
    anchors: Record<string, VisualAnchorEntry>;
  };
  return raw.anchors;
}

export function loadAnchorFooterRules(jsonPath: string): string[] {
  const full = path.join(process.cwd(), jsonPath);
  const questao = JSON.parse(fs.readFileSync(full, 'utf8')) as {
    reverse_study_slides?: { footer_rule?: string }[];
  };
  const slides = questao.reverse_study_slides ?? [];
  return slides.map((s) => s.footer_rule?.trim() ?? '');
}

export const onboardingDismissScript = () => {
  const microtipKeys = [
    'reverse-study.option-elimination',
    'reverse-study.answer-before-feedback',
    'reverse-study.feedback-learning',
    'reverse-study.reverse-study-intro',
    'reverse-study.dots-meaning',
    'reverse-study.concept-map',
    'reverse-study.golden-rule',
    'reverse-study.logic-flow',
    'reverse-study.danger-zone',
    'reverse-study.study-completed',
  ];
  for (const key of microtipKeys) {
    window.localStorage.setItem(`avant.microtip.${key}`, 'true');
  }
  window.localStorage.setItem('avant-estudo-reverso-welcome-seen', 'true');
};

export async function gotoBranch(page: Page, branch: string): Promise<void> {
  await page.goto(`/dev/slide-mold-review?branch=${encodeURIComponent(branch)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 180_000,
  });
  await expect(page.getByTestId('slide-mold-review-root')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId('mold-player').getByTestId('lesson-scroll-body').first()).toBeVisible({
    timeout: 90_000,
  });
}

export async function expectSlidePanels(page: Page): Promise<void> {
  for (let i = 1; i <= SLIDE_COUNT; i++) {
    await expect(page.getByTestId(`mold-slide-${i}`)).toBeVisible({ timeout: 30_000 });
  }
  for (let i = 1; i <= SLIDE_COUNT; i++) {
    await page.getByTestId(`mold-slide-${i}`).scrollIntoViewIfNeeded();
  }
}

export async function screenshotSlidePanels(
  page: Page,
  branch: string,
  outDir: string,
  viewportLabel: 'desktop' | 'mobile-375' | 'mobile-375-dod',
): Promise<void> {
  fs.mkdirSync(outDir, { recursive: true });
  for (let i = 1; i <= SLIDE_COUNT; i++) {
    const panel = page.getByTestId(`mold-slide-${i}`);
    await panel.scrollIntoViewIfNeeded();
    await panel.screenshot({
      path: path.join(outDir, `${branch}-${viewportLabel}-slide${i}.png`),
      type: 'png',
    });
  }
}

/** DoD 375px — footer_rule legível e painel sem overflow horizontal. */
export async function assertSlidePanelsLegibleAt375(
  page: Page,
  footerRules: string[],
): Promise<void> {
  for (let i = 1; i <= SLIDE_COUNT; i++) {
    const panel = page.getByTestId(`mold-slide-${i}`);
    await panel.scrollIntoViewIfNeeded();
    await expect(panel).toBeVisible();

    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }

    await panel.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
      for (const child of el.querySelectorAll<HTMLElement>('*')) {
        if (child.scrollHeight > child.clientHeight + 2) {
          child.scrollTop = child.scrollHeight;
        }
      }
    });

    const overflowX = await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(overflowX).toBe(false);

    const footer = footerRules[i - 1];
    if (footer) {
      const needle = footer.slice(0, Math.min(18, footer.length)).trim();
      const text = (await panel.innerText()).toLowerCase();
      expect(text).toContain(needle.toLowerCase());
    }
  }
}
