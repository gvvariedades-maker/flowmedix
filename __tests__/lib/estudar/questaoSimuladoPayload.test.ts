/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { fingerprintConteudoJson } from '@/lib/catalogMigration/contentFingerprint';
import { stampEfficacyContentFingerprint } from '@/lib/catalogMigration/commercialContentApproval';
import { clearCommercialRuntimeApprovalCache } from '@/lib/catalogMigration/commercialRuntimeGate';
import { buildSimuladoQuestaoPayload } from '@/lib/estudar/questaoSimuladoPayload';

const mockUserHasModuloAccess = jest.fn();
jest.mock('@/lib/concursos/entitlements', () => ({
  userHasModuloAccess: jest.fn((...args: unknown[]) => mockUserHasModuloAccess(...args)),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const SLUG = 'questao-simulado-slim';
const TITULO_AULA = 'Imunização';

const GOLDEN_IMUNIZACAO = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'examples/questao-premium-cpcon-imunizacao-intervalos-vf.json'),
    'utf8',
  ),
);

const conteudoJson = stampEfficacyContentFingerprint(
  GOLDEN_IMUNIZACAO,
  fingerprintConteudoJson(GOLDEN_IMUNIZACAO),
);

const conteudoJsonSemAprovacao = GOLDEN_IMUNIZACAO;

describe('buildSimuladoQuestaoPayload', () => {
  const prevGate = process.env.COMMERCIAL_RUNTIME_READINESS_GATE;

  beforeEach(() => {
    jest.clearAllMocks();
    clearCommercialRuntimeApprovalCache();
    process.env.COMMERCIAL_RUNTIME_READINESS_GATE = 'true';
  });

  afterEach(() => {
    if (prevGate === undefined) delete process.env.COMMERCIAL_RUNTIME_READINESS_GATE;
    else process.env.COMMERCIAL_RUNTIME_READINESS_GATE = prevGate;
  });

  it('retorna forbidden sem entitlement', async () => {
    mockUserHasModuloAccess.mockResolvedValue(false);

    const result = await buildSimuladoQuestaoPayload({
      slug: SLUG,
      userId: USER_ID,
      supabase: { from: jest.fn() } as never,
    });

    expect(result).toEqual({ status: 'forbidden' });
  });

  it('retorna not_found quando módulo não existe', async () => {
    mockUserHasModuloAccess.mockResolvedValue(true);
    const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ select });

    const result = await buildSimuladoQuestaoPayload({
      slug: SLUG,
      userId: USER_ID,
      supabase: { from } as never,
    });

    expect(result).toEqual({ status: 'not_found' });
    expect(from).toHaveBeenCalledWith('modulos_estudo');
    expect(select).toHaveBeenCalledWith('conteudo_json, titulo_aula');
  });

  it('retorna payload slim sem slides nem gabarito', async () => {
    mockUserHasModuloAccess.mockResolvedValue(true);
    const maybeSingle = jest.fn().mockResolvedValue({
      data: { conteudo_json: conteudoJson, titulo_aula: TITULO_AULA },
      error: null,
    });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ select });

    const result = await buildSimuladoQuestaoPayload({
      slug: SLUG,
      userId: USER_ID,
      supabase: { from } as never,
    });

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;

    expect(result.payload.dados.meta).toEqual(conteudoJson.meta);
    expect(result.payload.dados.question_data.options).toEqual(
      conteudoJson.question_data.options.map((option: { id: string; text: string }) => ({
        id: option.id,
        text: option.text,
      })),
    );
    expect(result.payload.dados).not.toHaveProperty('reverse_study_slides');
    expect(result.payload.dados).not.toHaveProperty('study_slides');
  });

  it('retorna forbidden com entitlement mas conteúdo sem aprovação comercial', async () => {
    mockUserHasModuloAccess.mockResolvedValue(true);
    const maybeSingle = jest.fn().mockResolvedValue({
      data: { conteudo_json: conteudoJsonSemAprovacao, titulo_aula: TITULO_AULA },
      error: null,
    });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ select });

    const result = await buildSimuladoQuestaoPayload({
      slug: SLUG,
      userId: USER_ID,
      supabase: { from } as never,
    });

    expect(result).toEqual({ status: 'forbidden' });
  });
});
