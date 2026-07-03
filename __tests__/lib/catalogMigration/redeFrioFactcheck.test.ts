import fs from 'node:fs';
import { join } from 'node:path';

import { lintRedeFrioFactcheck } from '@/lib/catalogMigration/redeFrioFactcheck';
import { matchClaimToGuideline } from '@/lib/catalogMigration/numericFactcheck';

describe('redeFrioFactcheck', () => {
  it('âncora AVANÇASP passa factcheck rede de frio', () => {
    const payload = JSON.parse(
      fs.readFileSync(
        join(process.cwd(), 'examples', 'questao-premium-avancasp-imunizacao-rede-frio-temperatura.json'),
        'utf8',
      ),
    );
    expect(lintRedeFrioFactcheck(payload)).toEqual([]);
  });

  it('matchClaim encontra armadilhas 0–2 e 8–12 na guideline tier A', () => {
    expect(matchClaimToGuideline('Imunização', '0 °C a 2 °C')?.id).toMatch(
      /rede-frio-(armadilha-0-2|abaixo-2)/,
    );
    expect(matchClaimToGuideline('Imunização', '8 °C a 12 °C')?.id).toMatch(
      /rede-frio-(armadilha-8-12|acima-8)/,
    );
    expect(matchClaimToGuideline('Imunização', 'congelamento')?.id).toMatch(/rede-frio|congel/i);
  });

  it('flagra golden sem decore 2–8 °C', () => {
    const issues = lintRedeFrioFactcheck({
      meta: {
        subtopico: 'Imunização',
        content_standard: 'golden-v1',
        pedagogical_branch: 'imunizacao_cadeia_frio',
        sources: [
          {
            tier: 'A',
            covers: ['cadeia de frio', '2 °C a 8 °C'],
          },
        ],
      },
      question_data: { instruction: 'Cadeia de frio — temperatura positiva' },
      reverse_study_slides: [
        {
          type: 'golden_rule',
          rows: [{ label: 'Faixa', value: '0 °C a 2 °C — regra geral' }],
        },
      ],
    });
    expect(issues.some((i) => i.code === 'rede_frio_golden_faixa_28')).toBe(true);
    expect(issues.some((i) => i.code === 'rede_frio_trap_as_correct')).toBe(true);
  });
});
