/**
 * @jest-environment node
 */

import { GET } from '@/app/api/admin/laboratorio/catalog-audit/route';

jest.mock('@/lib/admin/requireAdmin', () => ({
  requireAdminApi: jest.fn(),
}));

jest.mock('@/lib/admin/catalogContentAudit', () => ({
  runCatalogContentAudit: jest.fn(),
}));

import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { runCatalogContentAudit } from '@/lib/admin/catalogContentAudit';

const mockRequireAdmin = requireAdminApi as jest.Mock;
const mockRunAudit = runCatalogContentAudit as jest.Mock;

describe('GET /api/admin/laboratorio/catalog-audit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna 401 quando não é admin', async () => {
    mockRequireAdmin.mockResolvedValue({
      error: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    });

    const res = await GET(new Request('https://avant.test/api/admin/laboratorio/catalog-audit'));
    expect(res.status).toBe(401);
  });

  it('retorna relatório com status warn quando há slides ausentes', async () => {
    mockRequireAdmin.mockResolvedValue({ admin: {} });
    mockRunAudit.mockResolvedValue({
      generated_at: new Date().toISOString(),
      catalog_total: 10,
      scanned_rows: 10,
      summary: {
        missing_slides: 2,
        slide_count_not_four: 0,
        missing_premium_type: 0,
        zod_invalid: 0,
        tecconcursos_reference: 0,
        fully_premium_package: 8,
      },
      issue_rows: [],
      sample_size: 20,
      sample_validation: [],
      notes: [],
    });

    const res = await GET(
      new Request('https://avant.test/api/admin/laboratorio/catalog-audit?sampleSize=5'),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('warn');
    expect(body.summary.missing_slides).toBe(2);
    expect(mockRunAudit).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ sampleSize: 5 }),
    );
  });
});
