/**
 * Pre-commit (via husky): só arquivos staged.
 * - eslint --fix nos JS/TS staged
 * - typecheck (tsc --noEmit) uma vez se houver .ts/.tsx staged
 * check:architecture roda no .husky/pre-commit (repo inteiro).
 */
const config = {
  '*.{js,jsx,mjs,cjs,ts,tsx}': ['eslint --fix'],
  // Função: um único typecheck do projeto (não por arquivo; tsc precisa do tsconfig).
  '*.{ts,tsx}': () => 'npm run typecheck',
};

export default config;
