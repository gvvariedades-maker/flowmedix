import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** ESLint 9 flat config a partir do pacote oficial Next (CommonJS). */
const eslintConfig = [
  {
    // Artefatos gerados (bundles do trace viewer, relatórios) — não são código do app.
    ignores: ['playwright-report/**', 'test-results/**', 'playwright/.cache/**'],
  },
  ...require('eslint-config-next'),
  {
    files: ['components/slides/variants/**/*.{ts,tsx}', 'components/slides/core/SlideLucideIcon.tsx'],
    rules: {
      // Moldes interativos resolvem ícones Lucide por nome em runtime — padrão intencional.
      'react-hooks/static-components': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
  {
    files: ['hooks/useCatalogStatsCountUp.ts'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default eslintConfig;
