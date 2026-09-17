import fs from 'node:fs';
import path from 'node:path';
import { validateAndNormalizeQuestao } from '@/lib/catalogMigration/validatePayload';

function highRiskRaw(): unknown {
  const file = path.join(
    process.cwd(),
    'examples/questao-premium-amauc-imunizacao-bcg-dose-a4.json',
  );
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

describe('validateAndNormalizeQuestao — mandatoryEditorialGate', () => {
  const slug = 'bcg-dose-test-slug';

  it('default bloqueia evidence_required no load', () => {
    const result = validateAndNormalizeQuestao(slug, highRiskRaw());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/evidence_required|risk_tier=alto/);
    }
  });

  it('mandatoryEditorialGate=false permite load; gate roda depois no apply', () => {
    const result = validateAndNormalizeQuestao(slug, highRiskRaw(), {
      mandatoryEditorialGate: false,
    });
    expect(result.ok).toBe(true);
  });

  it('anti-spoof continua ativo no load com mandatoryEditorialGate=false', () => {
    const raw = highRiskRaw() as { meta: Record<string, unknown> };
    raw.meta.evidence_approved = true;
    const result = validateAndNormalizeQuestao(slug, raw, {
      mandatoryEditorialGate: false,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/evidence_approved|spoof/i);
    }
  });
});
