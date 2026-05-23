-- LP de marketing AVANT Pro (assinatura) — destino dos links «AVANT Pro» no header público.

DO $$
DECLARE
  tpl_id uuid;
BEGIN
  SELECT id INTO tpl_id FROM public.lp_templates WHERE slug = 'concurso_pro_v1' LIMIT 1;
  IF tpl_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.lp_pages (
    path, template_id, status, internal_name, config, seo, published_at, updated_at
  ) VALUES (
    'avant-pro',
    tpl_id,
    'ativo',
    'AVANT Pro — Assinatura',
    '{
      "concurso": {
        "cidade": "Todos os editais",
        "cargo": "Técnico em Enfermagem",
        "banca": "Múltiplas bancas",
        "nomeBanca": "banca do seu concurso",
        "vagas": "Ilimitado",
        "dataProva": "2026-12-31",
        "dataProvaFormatada": "O ano todo",
        "statusInscricoes": "Assinatura mensal",
        "remuneracao": "R$ 14,90/mês",
        "taxaInscricao": "Cancela quando quiser",
        "orgao": "EBSERH, prefeituras e demais"
      },
      "oferta": { "preco": "14,90" },
      "copy": {
        "headlinePrincipal": "Estude sem limite com questões reais e NeuroSlides no AVANT Pro",
        "subtitulo": "Assinatura mensal para Técnico em Enfermagem: Estudo Reverso após cada questão, revisão espaçada e plano diário adaptado ao seu desempenho.",
        "dores": [
          "Você trava no limite de 1 questão por dia e não consegue manter ritmo",
          "Estuda material genérico sem o padrão exato das bancas de concurso",
          "Erra questão e só lê gabarito — sem fixar o conceito na hora"
        ],
        "perigosBanca": [
          "Bancas cobram sequência de procedimentos — não só conceito isolado",
          "Duas alternativas quase certas: detalhes técnicos decidem a nota",
          "Biossegurança, farmacologia e SUS aparecem em todo edital de técnico"
        ],
        "listaBeneficios": [
          "Questões reais de EBSERH, prefeituras e bancas para Técnico em Enfermagem",
          "NeuroSlides após cada questão: Mapa Mental, Regra de Ouro, Fluxo Lógico e Zona de Perigo",
          "Diagnóstico imediato do erro — conceito, detalhe ou pegadinha de banca",
          "Revisão espaçada automática — sem planilha",
          "Plano diário adaptado ao seu desempenho",
          "Acesso completo à plataforma — todos os editais em destaque"
        ],
        "disclaimer": "Conteúdo focado em Conhecimentos Específicos de Enfermagem para Técnico, com acesso completo via assinatura AVANT Pro.",
        "disclaimerLegal": "O AVANT é uma plataforma de estudo independente. Não somos órgão público, banca examinadora nem afiliados a órgãos ou empresas de concurso."
      },
      "walkthrough": {
        "imagens": [
          "/images/campina-grande/walk-01.jpg",
          "/images/campina-grande/walk-02.jpg",
          "/images/campina-grande/walk-03.jpg",
          "/images/campina-grande/walk-04.jpg",
          "/images/campina-grande/walk-05.jpg",
          "/images/campina-grande/walk-06.jpg",
          "/images/campina-grande/walk-07.jpg",
          "/images/campina-grande/walk-08.jpg"
        ]
      }
    }'::jsonb,
    '{
      "title": "AVANT Pro — Assinatura para Técnico em Enfermagem | AVANT",
      "description": "Estudo sem limite com questões reais, Estudo Reverso e NeuroSlides. AVANT Pro por R$ 14,90/mês — cancela quando quiser.",
      "canonical": "/lp/avant-pro",
      "ogTitle": "AVANT Pro — Questões reais e NeuroSlides | AVANT",
      "ogDescription": "Assinatura mensal para Técnico em Enfermagem: estude sem limite com o método Estudo Reverso."
    }'::jsonb,
    now(),
    now()
  )
  ON CONFLICT (path) DO NOTHING;
END $$;
