import { formatErrorReportMetadataPreview } from '@/lib/admin/errorReports';
import { buildLessonErrorReportMetadata } from '@/lib/lesson/errorReportMetadata';

describe('buildLessonErrorReportMetadata', () => {
  it('inclui tipo de slide e subtópico no estudo reverso', () => {
    const metadata = buildLessonErrorReportMetadata({
      etapa: 'estudo',
      slideAtual: 2,
      totalSlides: 4,
      questionHash: 'hash-abc',
      selecionada: 'C',
      gabarito: { acertou: true, opcaoCorretaId: 'C' },
      meta: { topico: 'Farmacologia', subtopico: 'Vias de Administração', banca: 'CPCON', ano: '2024' },
      currentSlide: {
        type: 'logic_flow',
        steps: ['Passo 1'],
        meta: { subtopico: 'Vias de Administração' },
      },
    });

    expect(metadata.etapa).toBe('estudo');
    expect(metadata.slide_index).toBe(2);
    expect(metadata.slide_type).toBe('logic_flow');
    expect(metadata.slide_subtopico).toBe('Vias de Administração');
    expect(metadata.meta_banca).toBe('CPCON');
    expect(metadata.acertou).toBe(true);
  });
});

describe('formatErrorReportMetadataPreview', () => {
  it('monta resumo legível para triagem', () => {
    const preview = formatErrorReportMetadataPreview({
      etapa: 'estudo',
      slide_index: 1,
      slide_type: 'danger_zone',
      meta_subtopico: 'Imunização',
    });
    expect(preview).toContain('estudo');
    expect(preview).toContain('slide 2');
    expect(preview).toContain('danger_zone');
    expect(preview).toContain('Imunização');
  });
});
