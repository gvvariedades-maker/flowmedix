#!/usr/bin/env npx tsx
/**
 * Popula subtopico_guideline_registry + guideline_source_candidates no Supabase.
 * Uso: npx tsx scripts/seed-subtopico-guideline-registry.ts [--dry-run]
 */
import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';

loadEnvConfig(process.cwd());

type Urgency = 'critical' | 'high' | 'medium' | 'low' | 'none';
type ExtractionStatus = 'pending' | 'in_progress' | 'extracted' | 'codified' | 'not_applicable';

type SourceCandidate = {
  source_id: string;
  tier: 'A' | 'B';
  issuer: string;
  title: string;
  year?: number;
  url?: string;
  priority: number;
  extraction_status?: ExtractionStatus;
  notes?: string;
};

type RegistryRow = {
  subtopico: string;
  topico: string;
  topico_ordem: number;
  subtopico_ordem: number;
  needs_official_data: boolean;
  urgency: Urgency;
  has_premium_builder: boolean;
  has_bespoke_molde: boolean;
  has_guideline_codified: boolean;
  guideline_table_id?: string;
  extraction_status: ExtractionStatus;
  primary_issuer?: string;
  extraction_notes?: string;
  rollout_priority?: number;
  sources: SourceCandidate[];
};

const REGISTRY: RegistryRow[] = [
  // 6.1 Fundamentos
  {
    subtopico: 'História da Enfermagem',
    topico: 'Fundamentos e Bases',
    topico_ordem: 1,
    subtopico_ordem: 1,
    needs_official_data: false,
    urgency: 'low',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'not_applicable',
    primary_issuer: 'COFEN / historiografia',
    extraction_notes: 'Conteúdo histórico-conceitual; sem tabela numérica obrigatória.',
    rollout_priority: 90,
    sources: [
      {
        source_id: 'cofen-codigo-etica-historia',
        tier: 'A',
        issuer: 'COFEN',
        title: 'Resoluções COFEN — marcos históricos da profissão',
        year: 2024,
        url: 'https://www.cofen.gov.br/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Noções de Anatomia',
    topico: 'Fundamentos e Bases',
    topico_ordem: 1,
    subtopico_ordem: 2,
    needs_official_data: false,
    urgency: 'low',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'not_applicable',
    extraction_notes: 'Conceitual; referência de anatomia básica.',
    rollout_priority: 85,
    sources: [],
  },
  {
    subtopico: 'Noções de Fisiologia',
    topico: 'Fundamentos e Bases',
    topico_ordem: 1,
    subtopico_ordem: 3,
    needs_official_data: false,
    urgency: 'low',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'not_applicable',
    rollout_priority: 84,
    sources: [],
  },
  {
    subtopico: 'Processo de Enfermagem',
    topico: 'Fundamentos e Bases',
    topico_ordem: 1,
    subtopico_ordem: 4,
    needs_official_data: true,
    urgency: 'medium',
    has_premium_builder: true,
    has_bespoke_molde: true,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'COFEN',
    extraction_notes: 'SAE, etapas, diagnósticos NANDA; normas COFEN para prova.',
    rollout_priority: 40,
    sources: [
      {
        source_id: 'cofen-res-sae',
        tier: 'A',
        issuer: 'COFEN',
        title: 'Resoluções COFEN — Sistematização da Assistência de Enfermagem',
        url: 'https://www.cofen.gov.br/',
        priority: 1,
      },
      {
        source_id: 'nanda-i-taxonomia',
        tier: 'B',
        issuer: 'NANDA International',
        title: 'Taxonomia NANDA-I (quando cobrada)',
        priority: 2,
      },
    ],
  },
  // 6.2 Farmacologia
  {
    subtopico: 'Farmacodinâmica e Farmacocinética',
    topico: 'Farmacologia e Medicamentos',
    topico_ordem: 2,
    subtopico_ordem: 5,
    needs_official_data: true,
    urgency: 'high',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'Anvisa / MS',
    rollout_priority: 35,
    sources: [
      {
        source_id: 'anvisa-bulas-referencia',
        tier: 'A',
        issuer: 'Anvisa',
        title: 'Bulário / RDC medicamentos — classes e efeitos',
        url: 'https://www.gov.br/anvisa/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Cálculo de Administração de Medicamentos e Infusões',
    topico: 'Farmacologia e Medicamentos',
    topico_ordem: 2,
    subtopico_ordem: 6,
    needs_official_data: true,
    urgency: 'critical',
    has_premium_builder: true,
    has_bespoke_molde: true,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'COFEN / Anvisa',
    extraction_notes: 'Fórmulas, equivalências, gotejamento, reconstituição — números críticos.',
    rollout_priority: 8,
    sources: [
      {
        source_id: 'cofen-admin-medicamentos',
        tier: 'A',
        issuer: 'COFEN',
        title: 'Normas de administração de medicamentos',
        url: 'https://www.cofen.gov.br/',
        priority: 1,
      },
      {
        source_id: 'anvisa-diluicao-reconstituicao',
        tier: 'A',
        issuer: 'Anvisa',
        title: 'Bulário — diluição e reconstituição',
        url: 'https://www.gov.br/anvisa/',
        priority: 2,
      },
    ],
  },
  {
    subtopico: 'Vias de Administração',
    topico: 'Farmacologia e Medicamentos',
    topico_ordem: 2,
    subtopico_ordem: 7,
    needs_official_data: true,
    urgency: 'medium',
    has_premium_builder: true,
    has_bespoke_molde: true,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'COFEN',
    rollout_priority: 25,
    sources: [
      {
        source_id: 'cofen-vias-administracao',
        tier: 'A',
        issuer: 'COFEN',
        title: 'Técnica e vias de administração de medicamentos',
        url: 'https://www.cofen.gov.br/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Cuidados na Administração de Medicamentos',
    topico: 'Farmacologia e Medicamentos',
    topico_ordem: 2,
    subtopico_ordem: 8,
    needs_official_data: true,
    urgency: 'critical',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'COFEN / Anvisa',
    extraction_notes: '5 certos, compatibilidade, horários, alta vigilância.',
    rollout_priority: 12,
    sources: [
      {
        source_id: 'cofen-cinco-certos',
        tier: 'A',
        issuer: 'COFEN',
        title: 'Administração segura — 5 certos e boas práticas',
        url: 'https://www.cofen.gov.br/',
        priority: 1,
      },
      {
        source_id: 'anvisa-farmacia-clinica',
        tier: 'A',
        issuer: 'Anvisa',
        title: 'RDC farmácia clínica / segurança do paciente',
        url: 'https://www.gov.br/anvisa/',
        priority: 2,
      },
    ],
  },
  // 6.3 Procedimentos
  {
    subtopico: 'Verificação de Sinais Vitais',
    topico: 'Procedimentos de Enfermagem',
    topico_ordem: 3,
    subtopico_ordem: 9,
    needs_official_data: true,
    urgency: 'critical',
    has_premium_builder: true,
    has_bespoke_molde: true,
    has_guideline_codified: true,
    guideline_table_id: 'sv-adulto-referencia',
    extraction_status: 'in_progress',
    primary_issuer: 'MS / COFEN / SBC',
    extraction_notes: 'Parcial em lib/guidelines/sinaisVitais.ts — expandir pediátrico, gestante, idoso.',
    rollout_priority: 2,
    sources: [
      {
        source_id: 'ms-sv-referencia',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Protocolos de aferição de sinais vitais',
        url: 'https://www.gov.br/saude/',
        priority: 1,
        extraction_status: 'in_progress',
      },
      {
        source_id: 'sv-adulto-referencia',
        tier: 'A',
        issuer: 'COFEN',
        title: 'Faixas de referência adulto — codificado',
        year: 2024,
        priority: 1,
        extraction_status: 'codified',
      },
      {
        source_id: 'sbc-pa-diretriz',
        tier: 'B',
        issuer: 'SBC',
        title: 'Diretriz brasileira de hipertensão — valores PA',
        priority: 2,
      },
    ],
  },
  {
    subtopico: 'Instalação e Manejo de Sondas',
    topico: 'Procedimentos de Enfermagem',
    topico_ordem: 3,
    subtopico_ordem: 10,
    needs_official_data: true,
    urgency: 'high',
    has_premium_builder: true,
    has_bespoke_molde: true,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'COFEN / MS',
    rollout_priority: 20,
    sources: [
      {
        source_id: 'cofen-sondas-normas',
        tier: 'A',
        issuer: 'COFEN',
        title: 'Normas técnicas — sondas nasogástricas, vesicais, retal',
        url: 'https://www.cofen.gov.br/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Oxigenoterapia e Cuidados Respiratórios',
    topico: 'Procedimentos de Enfermagem',
    topico_ordem: 3,
    subtopico_ordem: 11,
    needs_official_data: true,
    urgency: 'critical',
    has_premium_builder: true,
    has_bespoke_molde: true,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MS / SBPT',
    extraction_notes: 'Fluxos O2, dispositivos, SpO2 alvo, higiene brônquica.',
    rollout_priority: 10,
    sources: [
      {
        source_id: 'ms-oxigenoterapia',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Manual / protocolo de oxigenoterapia',
        url: 'https://www.gov.br/saude/',
        priority: 1,
      },
      {
        source_id: 'sbpt-oxigenoterapia',
        tier: 'B',
        issuer: 'SBPT',
        title: 'Diretrizes de oxigenoterapia domiciliar e hospitalar',
        priority: 2,
      },
    ],
  },
  {
    subtopico: 'Curativos e Manejo de Feridas',
    topico: 'Procedimentos de Enfermagem',
    topico_ordem: 3,
    subtopico_ordem: 12,
    needs_official_data: true,
    urgency: 'high',
    has_premium_builder: true,
    has_bespoke_molde: true,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'COFEN / MS',
    rollout_priority: 22,
    sources: [
      {
        source_id: 'cofen-curativos',
        tier: 'A',
        issuer: 'COFEN',
        title: 'Boas práticas em curativos e coberturas',
        url: 'https://www.cofen.gov.br/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Punção Venosa e Cuidados com Cateteres',
    topico: 'Procedimentos de Enfermagem',
    topico_ordem: 3,
    subtopico_ordem: 13,
    needs_official_data: true,
    urgency: 'high',
    has_premium_builder: true,
    has_bespoke_molde: true,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'Anvisa / COFEN',
    rollout_priority: 24,
    sources: [
      {
        source_id: 'anvisa-picc-cvc',
        tier: 'A',
        issuer: 'Anvisa',
        title: 'RDC dispositivos invasivos / cateteres',
        url: 'https://www.gov.br/anvisa/',
        priority: 1,
      },
      {
        source_id: 'cofen-puncao-venosa',
        tier: 'A',
        issuer: 'COFEN',
        title: 'Técnica de punção venosa periférica',
        url: 'https://www.cofen.gov.br/',
        priority: 2,
      },
    ],
  },
  {
    subtopico: 'Coleta de Exames Laboratoriais',
    topico: 'Procedimentos de Enfermagem',
    topico_ordem: 3,
    subtopico_ordem: 14,
    needs_official_data: true,
    urgency: 'critical',
    has_premium_builder: true,
    has_bespoke_molde: true,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MS / SBPC/ML',
    extraction_notes: 'Tubos, ordem de coleta, jejum, conservação — altamente numérico.',
    rollout_priority: 11,
    sources: [
      {
        source_id: 'ms-manual-coleta-sangue',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Manual de coleta de sangue venoso',
        url: 'https://www.gov.br/saude/',
        priority: 1,
      },
      {
        source_id: 'sbpc-ml-ordem-tubos',
        tier: 'B',
        issuer: 'SBPC/ML',
        title: 'Ordem de coleta e anticoagulantes',
        priority: 2,
      },
    ],
  },
  {
    subtopico: 'Mobilização e Posicionamento do Paciente',
    topico: 'Procedimentos de Enfermagem',
    topico_ordem: 3,
    subtopico_ordem: 15,
    needs_official_data: true,
    urgency: 'low',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'COFEN',
    rollout_priority: 70,
    sources: [
      {
        source_id: 'cofen-mobilizacao',
        tier: 'A',
        issuer: 'COFEN',
        title: 'Mobilização e prevenção de LPP',
        url: 'https://www.cofen.gov.br/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Procedimentos Diversos',
    topico: 'Procedimentos de Enfermagem',
    topico_ordem: 3,
    subtopico_ordem: 16,
    needs_official_data: true,
    urgency: 'low',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    extraction_notes: 'Bucket heterogêneo — extrair por tema quando classificar questões.',
    rollout_priority: 75,
    sources: [],
  },
  {
    subtopico: 'Feridas e Queimaduras',
    topico: 'Procedimentos de Enfermagem',
    topico_ordem: 3,
    subtopico_ordem: 17,
    needs_official_data: true,
    urgency: 'high',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MS / ABQUEIMAD',
    rollout_priority: 45,
    sources: [
      {
        source_id: 'ms-atendimento-queimaduras',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Protocolo de atendimento a queimaduras',
        url: 'https://www.gov.br/saude/',
        priority: 1,
      },
    ],
  },
  // 6.4 Biossegurança
  {
    subtopico: 'Processamento de Artigos e Produtos de Saúde',
    topico: 'Biossegurança e Controle de Infecção',
    topico_ordem: 4,
    subtopico_ordem: 18,
    needs_official_data: true,
    urgency: 'high',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'Anvisa',
    rollout_priority: 50,
    sources: [
      {
        source_id: 'anvisa-rdc-sterilization',
        tier: 'A',
        issuer: 'Anvisa',
        title: 'RDC processamento e esterilização de artigos',
        url: 'https://www.gov.br/anvisa/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Enfermagem em Central de Material e Esterilização (CME)',
    topico: 'Biossegurança e Controle de Infecção',
    topico_ordem: 4,
    subtopico_ordem: 19,
    needs_official_data: true,
    urgency: 'high',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'Anvisa / ABNT',
    rollout_priority: 55,
    sources: [
      {
        source_id: 'anvisa-cme-rdc',
        tier: 'A',
        issuer: 'Anvisa',
        title: 'RDC CME — ciclos, indicadores, áreas',
        url: 'https://www.gov.br/anvisa/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Medidas de Prevenção e Precaução de Contato',
    topico: 'Biossegurança e Controle de Infecção',
    topico_ordem: 4,
    subtopico_ordem: 20,
    needs_official_data: true,
    urgency: 'high',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'Anvisa / MS',
    rollout_priority: 30,
    sources: [
      {
        source_id: 'anvisa-precaucoes',
        tier: 'A',
        issuer: 'Anvisa',
        title: 'Precauções padrão e por transmissão',
        url: 'https://www.gov.br/anvisa/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Infecções no Contexto da Biossegurança',
    topico: 'Biossegurança e Controle de Infecção',
    topico_ordem: 4,
    subtopico_ordem: 21,
    needs_official_data: true,
    urgency: 'medium',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'Anvisa / MS',
    rollout_priority: 48,
    sources: [
      {
        source_id: 'anvisa-ir-as',
        tier: 'A',
        issuer: 'Anvisa',
        title: 'Segurança do paciente e IRAS',
        url: 'https://www.gov.br/anvisa/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Segurança do Paciente',
    topico: 'Biossegurança e Controle de Infecção',
    topico_ordem: 4,
    subtopico_ordem: 22,
    needs_official_data: true,
    urgency: 'high',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'Anvisa / MS',
    rollout_priority: 32,
    sources: [
      {
        source_id: 'anvisa-nsp',
        tier: 'A',
        issuer: 'Anvisa',
        title: 'Programa Nacional de Segurança do Paciente',
        url: 'https://www.gov.br/anvisa/',
        priority: 1,
      },
    ],
  },
  // 6.5 Saúde Pública
  {
    subtopico: 'Epidemiologia e Vigilância Epidemiológica',
    topico: 'Saúde Pública e Epidemiologia',
    topico_ordem: 5,
    subtopico_ordem: 23,
    needs_official_data: true,
    urgency: 'high',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MS',
    extraction_notes: 'Indicadores, notificação compulsória, tipos de vigilância.',
    rollout_priority: 18,
    sources: [
      {
        source_id: 'ms-portaria-notificacao',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Lista nacional de notificação compulsória',
        url: 'https://www.gov.br/saude/',
        priority: 1,
      },
      {
        source_id: 'ms-guia-vigilancia',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Guia de vigilância epidemiológica',
        url: 'https://www.gov.br/saude/',
        priority: 2,
      },
    ],
  },
  {
    subtopico: 'Promoção à Saúde e Prevenção de Agravos',
    topico: 'Saúde Pública e Epidemiologia',
    topico_ordem: 5,
    subtopico_ordem: 24,
    needs_official_data: true,
    urgency: 'medium',
    has_premium_builder: false,
    has_bespoke_molde: true,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'Legislação federal',
    rollout_priority: 28,
    sources: [
      {
        source_id: 'lei-8080-1990',
        tier: 'A',
        issuer: 'Presidência da República',
        title: 'Lei 8.080/1990 — princípios e diretrizes do SUS',
        year: 1990,
        url: 'https://www.planalto.gov.br/',
        priority: 1,
      },
      {
        source_id: 'lei-8142-1990',
        tier: 'A',
        issuer: 'Presidência da República',
        title: 'Lei 8.142/1990 — participação social',
        year: 1990,
        url: 'https://www.planalto.gov.br/',
        priority: 2,
      },
    ],
  },
  {
    subtopico: 'Imunização',
    topico: 'Saúde Pública e Epidemiologia',
    topico_ordem: 5,
    subtopico_ordem: 25,
    needs_official_data: true,
    urgency: 'critical',
    has_premium_builder: true,
    has_bespoke_molde: true,
    has_guideline_codified: true,
    guideline_table_id: 'pni-2025-intervalos',
    extraction_status: 'in_progress',
    primary_issuer: 'Ministério da Saúde / PNI',
    extraction_notes: 'Piloto IA ativo. Expandir calendário completo, doses, vias, cadeia de frio.',
    rollout_priority: 1,
    sources: [
      {
        source_id: 'pni-2025-intervalos',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Manual de Normas e Procedimentos para Vacinação — intervalos',
        year: 2025,
        url: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
        priority: 1,
        extraction_status: 'in_progress',
      },
      {
        source_id: 'pni-calendario-nacional',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Calendário Nacional de Vacinação',
        year: 2025,
        url: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
        priority: 2,
        extraction_status: 'pending',
      },
      {
        source_id: 'pni-cadeia-frio',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Manual da Rede de Frio — temperaturas e validade',
        priority: 3,
        extraction_status: 'pending',
      },
    ],
  },
  {
    subtopico: 'Atenção Básica / Saúde da Família',
    topico: 'Saúde Pública e Epidemiologia',
    topico_ordem: 5,
    subtopico_ordem: 26,
    needs_official_data: true,
    urgency: 'medium',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MS',
    rollout_priority: 38,
    sources: [
      {
        source_id: 'ms-pnab',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Política Nacional de Atenção Básica (PNAB)',
        url: 'https://www.gov.br/saude/',
        priority: 1,
      },
      {
        source_id: 'ms-cadernos-aps',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Cadernos de Atenção Básica',
        url: 'https://www.gov.br/saude/',
        priority: 2,
      },
    ],
  },
  // 6.6 Doenças Transmissíveis
  {
    subtopico: 'Infecções Sexualmente Transmissíveis (ISTs)',
    topico: 'Doenças Transmissíveis',
    topico_ordem: 6,
    subtopico_ordem: 27,
    needs_official_data: true,
    urgency: 'high',
    has_premium_builder: true,
    has_bespoke_molde: true,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MS',
    rollout_priority: 26,
    sources: [
      {
        source_id: 'ms-pcdt-ist',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'PCDT / protocolos clínicos — ISTs',
        url: 'https://www.gov.br/saude/',
        priority: 1,
      },
    ],
  },
  {
    subtopico:
      'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    topico: 'Doenças Transmissíveis',
    topico_ordem: 6,
    subtopico_ordem: 28,
    needs_official_data: true,
    urgency: 'high',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MS',
    rollout_priority: 33,
    sources: [
      {
        source_id: 'ms-guia-sarampo',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Guia de vigilância — sarampo e rubéola',
        url: 'https://www.gov.br/saude/',
        priority: 1,
      },
      {
        source_id: 'ms-covid-protocolos',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Protocolos COVID-19 / influenza',
        url: 'https://www.gov.br/saude/',
        priority: 2,
      },
    ],
  },
  {
    subtopico: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    topico: 'Doenças Transmissíveis',
    topico_ordem: 6,
    subtopico_ordem: 29,
    needs_official_data: true,
    urgency: 'high',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MS',
    rollout_priority: 42,
    sources: [
      {
        source_id: 'ms-manual-tb',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Manual de recomendações para controle da tuberculose',
        url: 'https://www.gov.br/saude/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Doenças Parasitárias e Zoonoses',
    topico: 'Doenças Transmissíveis',
    topico_ordem: 6,
    subtopico_ordem: 30,
    needs_official_data: true,
    urgency: 'medium',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MS',
    rollout_priority: 52,
    sources: [
      {
        source_id: 'ms-manual-zoonoses',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Manuais de vigilância — zoonoses e parasitoses',
        url: 'https://www.gov.br/saude/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis',
    topico: 'Doenças Transmissíveis',
    topico_ordem: 6,
    subtopico_ordem: 31,
    needs_official_data: true,
    urgency: 'none',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'not_applicable',
    extraction_notes: 'Bucket mesclado — reclassificar questões antes de extrair.',
    rollout_priority: 95,
    sources: [],
  },
  {
    subtopico: 'Questões Mescladas e Outras Doenças Agudas',
    topico: 'Doenças Transmissíveis',
    topico_ordem: 6,
    subtopico_ordem: 32,
    needs_official_data: true,
    urgency: 'none',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'not_applicable',
    extraction_notes: 'Sem questões no catálogo atual; manter para completude canônica.',
    rollout_priority: 99,
    sources: [],
  },
  {
    subtopico: 'Doenças Respiratórias Crônicas (Asma, DPOC)',
    topico: 'Doenças Transmissíveis',
    topico_ordem: 6,
    subtopico_ordem: 33,
    needs_official_data: true,
    urgency: 'medium',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MS / SBPT',
    rollout_priority: 60,
    sources: [
      {
        source_id: 'ms-pcdt-asma-dpoc',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'PCDT Asma e DPOC',
        url: 'https://www.gov.br/saude/',
        priority: 1,
      },
    ],
  },
  // 6.7 Cirúrgicas e Críticas
  {
    subtopico: 'Assistência Perioperatória (Inclui SRPA)',
    topico: 'Especialidades Cirúrgicas e Críticas',
    topico_ordem: 7,
    subtopico_ordem: 34,
    needs_official_data: true,
    urgency: 'high',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'COFEN / MS',
    rollout_priority: 44,
    sources: [
      {
        source_id: 'cofen-perioperatorio',
        tier: 'A',
        issuer: 'COFEN',
        title: 'Normas de enfermagem perioperatória',
        url: 'https://www.cofen.gov.br/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Enfermagem em Centro Cirúrgico',
    topico: 'Especialidades Cirúrgicas e Críticas',
    topico_ordem: 7,
    subtopico_ordem: 35,
    needs_official_data: true,
    urgency: 'high',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'Anvisa / COFEN',
    rollout_priority: 36,
    sources: [
      {
        source_id: 'anvisa-cc-rdc',
        tier: 'A',
        issuer: 'Anvisa',
        title: 'RDC centro cirúrgico e áreas assépticas',
        url: 'https://www.gov.br/anvisa/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Urgências e Emergências',
    topico: 'Especialidades Cirúrgicas e Críticas',
    topico_ordem: 7,
    subtopico_ordem: 36,
    needs_official_data: true,
    urgency: 'critical',
    has_premium_builder: true,
    has_bespoke_molde: true,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MS / ILCOR / AHA',
    extraction_notes: 'RCP, XABCDE, DEA, doses emergência — altamente protocolar.',
    rollout_priority: 3,
    sources: [
      {
        source_id: 'ms-urgencia-emergencia',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Protocolos de urgência e emergência — UPA',
        url: 'https://www.gov.br/saude/',
        priority: 1,
      },
      {
        source_id: 'ilcor-rcp-2020',
        tier: 'B',
        issuer: 'ILCOR / AHA',
        title: 'Diretrizes RCP 2020 — compressões e ventilação',
        year: 2020,
        priority: 2,
      },
      {
        source_id: 'ms-dea-protocolo',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Protocolo DEA / suporte básico de vida',
        priority: 3,
      },
    ],
  },
  // 6.8 Saúde Mental, Trabalho e Ciclos de Vida
  {
    subtopico: 'Enfermagem do Trabalho',
    topico: 'Saúde Mental, Trabalho e Ciclos de Vida',
    topico_ordem: 8,
    subtopico_ordem: 37,
    needs_official_data: true,
    urgency: 'medium',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MTE / MS',
    rollout_priority: 58,
    sources: [
      {
        source_id: 'nr-32-saude',
        tier: 'A',
        issuer: 'Ministério do Trabalho',
        title: 'NR-32 — Segurança em serviços de saúde',
        url: 'https://www.gov.br/trabalho-e-emprego/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Saúde Mental',
    topico: 'Saúde Mental, Trabalho e Ciclos de Vida',
    topico_ordem: 8,
    subtopico_ordem: 38,
    needs_official_data: true,
    urgency: 'medium',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MS',
    rollout_priority: 62,
    sources: [
      {
        source_id: 'ms-rede-atencao-psicossocial',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'RAPS / Cadernos de atenção psicossocial',
        url: 'https://www.gov.br/saude/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Saúde da Criança',
    topico: 'Saúde Mental, Trabalho e Ciclos de Vida',
    topico_ordem: 8,
    subtopico_ordem: 39,
    needs_official_data: true,
    urgency: 'critical',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MS / SBP',
    extraction_notes: 'APGAR, SV pediátrico, aleitamento, crescimento.',
    rollout_priority: 14,
    sources: [
      {
        source_id: 'ms-saude-crianca-caderno',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Caderneta da criança / Cadernos de atenção básica — pediatria',
        url: 'https://www.gov.br/saude/',
        priority: 1,
      },
      {
        source_id: 'sbp-sv-pediatrico',
        tier: 'B',
        issuer: 'SBP',
        title: 'Referências pediátricas — sinais vitais e APGAR',
        priority: 2,
      },
    ],
  },
  {
    subtopico: 'Saúde do Adolescente',
    topico: 'Saúde Mental, Trabalho e Ciclos de Vida',
    topico_ordem: 8,
    subtopico_ordem: 40,
    needs_official_data: true,
    urgency: 'medium',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MS',
    rollout_priority: 65,
    sources: [
      {
        source_id: 'ms-linha-cuidado-adolescente',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Linha de cuidado — saúde do adolescente',
        url: 'https://www.gov.br/saude/',
        priority: 1,
      },
    ],
  },
  {
    subtopico: 'Saúde da Mulher',
    topico: 'Saúde Mental, Trabalho e Ciclos de Vida',
    topico_ordem: 8,
    subtopico_ordem: 41,
    needs_official_data: true,
    urgency: 'critical',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'pending',
    primary_issuer: 'MS / FEBRASGO',
    extraction_notes: 'Pré-natal, parto, puerpério, planejamento reprodutivo — alto volume (262 questões).',
    rollout_priority: 4,
    sources: [
      {
        source_id: 'ms-linha-cuidado-gestante',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Linha de cuidado — gestante e puérpera',
        url: 'https://www.gov.br/saude/',
        priority: 1,
      },
      {
        source_id: 'ms-prenatal-ministerial',
        tier: 'A',
        issuer: 'Ministério da Saúde',
        title: 'Manual de gestação de alto risco / pré-natal',
        url: 'https://www.gov.br/saude/',
        priority: 2,
      },
      {
        source_id: 'febrasgo-diretrizes',
        tier: 'B',
        issuer: 'FEBRASGO',
        title: 'Diretrizes obstétricas (quando cobradas)',
        priority: 3,
      },
    ],
  },
  // Legado no catálogo (não canônico §9, mas presente no Supabase)
  {
    subtopico: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    topico: 'Legado / Mescladas',
    topico_ordem: 9,
    subtopico_ordem: 1,
    needs_official_data: true,
    urgency: 'none',
    has_premium_builder: false,
    has_bespoke_molde: false,
    has_guideline_codified: false,
    extraction_status: 'not_applicable',
    extraction_notes: '111 questões legadas — reclassificar para subtópico canônico antes de extrair.',
    rollout_priority: 96,
    sources: [],
  },
];

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (.env.local)');
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  if (!dryRun) {
    const { error: truncateSources } = await supabase
      .from('guideline_source_candidates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (truncateSources) throw truncateSources;

    const { error: truncateRegistry } = await supabase
      .from('subtopico_guideline_registry')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (truncateRegistry) throw truncateRegistry;
  }

  for (const row of REGISTRY) {
    const { sources, ...registry } = row;
    if (dryRun) {
      console.log(`[dry-run] ${registry.subtopico} (${registry.urgency}) — ${sources.length} fontes`);
      continue;
    }

    const { data: inserted, error } = await supabase
      .from('subtopico_guideline_registry')
      .insert(registry)
      .select('id')
      .single();

    if (error) throw new Error(`${registry.subtopico}: ${error.message}`);

    if (sources.length > 0) {
      const sourceRows = sources.map((s) => ({
        registry_id: inserted.id,
        source_id: s.source_id,
        tier: s.tier,
        issuer: s.issuer,
        title: s.title,
        year: s.year ?? null,
        url: s.url ?? null,
        priority: s.priority,
        extraction_status: s.extraction_status ?? 'pending',
        notes: s.notes ?? null,
      }));

      const { error: srcErr } = await supabase.from('guideline_source_candidates').insert(sourceRows);
      if (srcErr) throw new Error(`${registry.subtopico} sources: ${srcErr.message}`);
    }
  }

  if (!dryRun) {
    const { error: refreshErr } = await supabase.rpc('refresh_subtopico_guideline_counts');
    if (refreshErr) throw refreshErr;
    console.log(`Seed concluído: ${REGISTRY.length} subtópicos + contagens atualizadas.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
