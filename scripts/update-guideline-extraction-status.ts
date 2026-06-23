import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';

loadEnvConfig(process.cwd());

/** Atualiza status de extração no Supabase após codificar em lib/guidelines/. */
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const updates: Array<{
    subtopico: string;
    registry: Partial<{
      extraction_status: string;
      has_guideline_codified: boolean;
      guideline_table_id: string;
    }>;
    sources: Array<{ source_id: string; extraction_status: string }>;
  }> = [
    {
      subtopico: 'Imunização',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'pni-2025-intervalos+pni-calendario-2025',
      },
      sources: [
        { source_id: 'pni-2025-intervalos', extraction_status: 'extracted' },
        { source_id: 'pni-calendario-nacional', extraction_status: 'extracted' },
        { source_id: 'pni-cadeia-frio', extraction_status: 'extracted' },
      ],
    },
    {
      subtopico: 'Verificação de Sinais Vitais',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'sv-adulto-referencia',
      },
      sources: [
        { source_id: 'ms-sv-referencia', extraction_status: 'extracted' },
        { source_id: 'sv-adulto-referencia', extraction_status: 'codified' },
      ],
    },
    {
      subtopico: 'Urgências e Emergências',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'urgencias-rcp-sbv-ms',
      },
      sources: [
        { source_id: 'ms-urgencia-emergencia', extraction_status: 'extracted' },
        { source_id: 'ilcor-rcp-2020', extraction_status: 'extracted' },
        { source_id: 'ms-dea-protocolo', extraction_status: 'extracted' },
      ],
    },
    {
      subtopico: 'Saúde da Mulher',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'sm-prenatal-baixo-risco-ms',
      },
      sources: [
        { source_id: 'ms-linha-cuidado-gestante', extraction_status: 'extracted' },
        { source_id: 'ms-prenatal-ministerial', extraction_status: 'extracted' },
      ],
    },
    {
      subtopico: 'Cálculo de Administração de Medicamentos e Infusões',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'calc-equivalencias-br',
      },
      sources: [
        { source_id: 'cofen-admin-medicamentos', extraction_status: 'extracted' },
        { source_id: 'anvisa-diluicao-reconstituicao', extraction_status: 'extracted' },
      ],
    },
    {
      subtopico: 'Oxigenoterapia e Cuidados Respiratórios',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'oxigenoterapia-dispositivos-ms',
      },
      sources: [
        { source_id: 'ms-oxigenoterapia', extraction_status: 'extracted' },
        { source_id: 'sbpt-oxigenoterapia', extraction_status: 'extracted' },
      ],
    },
    {
      subtopico: 'Coleta de Exames Laboratoriais',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'coleta-exames-sbpc-ml',
      },
      sources: [
        { source_id: 'ms-manual-coleta-sangue', extraction_status: 'extracted' },
        { source_id: 'sbpc-ml-ordem-tubos', extraction_status: 'extracted' },
      ],
    },
    {
      subtopico: 'Cuidados na Administração de Medicamentos',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'cuidados-admin-cofen',
      },
      sources: [
        { source_id: 'cofen-cinco-certos', extraction_status: 'extracted' },
        { source_id: 'anvisa-farmacia-clinica', extraction_status: 'extracted' },
      ],
    },
    {
      subtopico: 'Saúde da Criança',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'saude-crianca-ms+sv-adulto-referencia',
      },
      sources: [
        { source_id: 'ms-saude-crianca-caderno', extraction_status: 'extracted' },
        { source_id: 'sbp-sv-pediatrico', extraction_status: 'extracted' },
      ],
    },
    {
      subtopico: 'Farmacodinâmica e Farmacocinética',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'farmaco-adme-anvisa',
      },
      sources: [{ source_id: 'anvisa-bulas-referencia', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Vias de Administração',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'vias-administracao-cofen',
      },
      sources: [{ source_id: 'cofen-vias-administracao', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Curativos e Manejo de Feridas',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'curativos-lpp-npuap',
      },
      sources: [{ source_id: 'cofen-curativos', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Instalação e Manejo de Sondas',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'sondas-tecnica-cofen',
      },
      sources: [{ source_id: 'cofen-sondas-normas', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Punção Venosa e Cuidados com Cateteres',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'puncao-cateter-anvisa+coleta-exames-sbpc-ml',
      },
      sources: [
        { source_id: 'anvisa-picc-cvc', extraction_status: 'extracted' },
        { source_id: 'cofen-puncao-venosa', extraction_status: 'extracted' },
      ],
    },
    {
      subtopico: 'Infecções Sexualmente Transmissíveis (ISTs)',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'ists-prevencao-ms',
      },
      sources: [{ source_id: 'ms-pcdt-ist', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Processo de Enfermagem',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'sae-cofen-358',
      },
      sources: [
        { source_id: 'cofen-res-sae', extraction_status: 'extracted' },
        { source_id: 'nanda-i-taxonomia', extraction_status: 'extracted' },
      ],
    },
    {
      subtopico: 'Medidas de Prevenção e Precaução de Contato',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'biosseguranca-anvisa',
      },
      sources: [{ source_id: 'anvisa-precaucoes', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Infecções no Contexto da Biossegurança',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'biosseguranca-anvisa',
      },
      sources: [{ source_id: 'anvisa-ir-as', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Segurança do Paciente',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'biosseguranca-anvisa',
      },
      sources: [{ source_id: 'anvisa-nsp', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'doencas-virais-ms+pni-calendario-2025',
      },
      sources: [
        { source_id: 'ms-guia-sarampo', extraction_status: 'extracted' },
        { source_id: 'ms-covid-protocolos', extraction_status: 'extracted' },
      ],
    },
    {
      subtopico: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'tuberculose-ms+biosseguranca-anvisa',
      },
      sources: [{ source_id: 'ms-manual-tb', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Processamento de Artigos e Produtos de Saúde',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'cme-anvisa-rdc15',
      },
      sources: [{ source_id: 'anvisa-rdc-sterilization', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Enfermagem em Central de Material e Esterilização (CME)',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'cme-anvisa-rdc15',
      },
      sources: [{ source_id: 'anvisa-cme-rdc', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Assistência Perioperatória (Inclui SRPA)',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'perioperatorio-cirurgia-segura',
      },
      sources: [{ source_id: 'cofen-perioperatorio', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Enfermagem em Centro Cirúrgico',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'perioperatorio-cirurgia-segura',
      },
      sources: [{ source_id: 'anvisa-cc-rdc', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Epidemiologia e Vigilância Epidemiológica',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'epidemiologia-ms+pni-calendario-2025',
      },
      sources: [
        { source_id: 'ms-portaria-notificacao', extraction_status: 'extracted' },
        { source_id: 'ms-guia-vigilancia', extraction_status: 'extracted' },
      ],
    },
    {
      subtopico: 'Atenção Básica / Saúde da Família',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'atencao-basica-pnab',
      },
      sources: [
        { source_id: 'ms-pnab', extraction_status: 'extracted' },
        { source_id: 'ms-cadernos-aps', extraction_status: 'extracted' },
      ],
    },
    {
      subtopico: 'Doenças Respiratórias Crônicas (Asma, DPOC)',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'respiratorio-cronico-ms+oxigenoterapia-dispositivos-ms',
      },
      sources: [{ source_id: 'ms-pcdt-asma-dpoc', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Saúde Mental',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'saude-mental-ms',
      },
      sources: [{ source_id: 'ms-rede-atencao-psicossocial', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Promoção à Saúde e Prevenção de Agravos',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'promocao-saude-sus',
      },
      sources: [
        { source_id: 'lei-8080-1990', extraction_status: 'extracted' },
        { source_id: 'lei-8142-1990', extraction_status: 'extracted' },
      ],
    },
    {
      subtopico: 'Enfermagem do Trabalho',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'enfermagem-trabalho-nr32',
      },
      sources: [{ source_id: 'nr-32-saude', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Saúde do Adolescente',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'saude-adolescente-ms',
      },
      sources: [{ source_id: 'ms-linha-cuidado-adolescente', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Doenças Parasitárias e Zoonoses',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'parasitarias-zoonoses-ms',
      },
      sources: [{ source_id: 'ms-manual-zoonoses', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Feridas e Queimaduras',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'feridas-queimaduras-ms+curativos-lpp-npuap',
      },
      sources: [{ source_id: 'ms-atendimento-queimaduras', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Mobilização e Posicionamento do Paciente',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'mobilizacao-posicionamento+curativos-lpp-npuap',
      },
      sources: [{ source_id: 'cofen-mobilizacao', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'História da Enfermagem',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'historia-enfermagem-cofen',
      },
      sources: [{ source_id: 'cofen-codigo-etica-historia', extraction_status: 'extracted' }],
    },
    {
      subtopico: 'Noções de Anatomia',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'anatomia-terminologia',
      },
      sources: [],
    },
    {
      subtopico: 'Noções de Fisiologia',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'fisiologia-homeostase+sv-adulto-referencia',
      },
      sources: [],
    },
    {
      subtopico: 'Procedimentos Diversos',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id: 'procedimentos-diversos-assepsia+biosseguranca-anvisa',
      },
      sources: [],
    },
    {
      subtopico: 'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id:
          'doencas-virais-ms+tuberculose-ms+parasitarias-zoonoses-ms+ists-prevencao-ms+biosseguranca-anvisa',
      },
      sources: [],
    },
    {
      subtopico: 'Questões Mescladas e Outras Doenças Agudas',
      registry: {
        extraction_status: 'extracted',
        has_guideline_codified: true,
        guideline_table_id:
          'urgencias-rcp-sbv-ms+doencas-virais-ms+respiratorio-cronico-ms+feridas-queimaduras-ms',
      },
      sources: [],
    },
  ];

  for (const row of updates) {
    const { data: reg, error: regErr } = await supabase
      .from('subtopico_guideline_registry')
      .select('id')
      .eq('subtopico', row.subtopico)
      .single();

    if (regErr || !reg) {
      console.warn(`Registry não encontrado: ${row.subtopico}`, regErr?.message);
      continue;
    }

    const { error: updErr } = await supabase
      .from('subtopico_guideline_registry')
      .update({ ...row.registry, updated_at: new Date().toISOString() })
      .eq('id', reg.id);

    if (updErr) throw updErr;

    for (const src of row.sources) {
      const { error: srcErr } = await supabase
        .from('guideline_source_candidates')
        .update({
          extraction_status: src.extraction_status,
          extracted_at: new Date().toISOString(),
        })
        .eq('registry_id', reg.id)
        .eq('source_id', src.source_id);

      if (srcErr) console.warn(`Fonte ${src.source_id}:`, srcErr.message);
    }

    console.log(`Atualizado: ${row.subtopico}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
