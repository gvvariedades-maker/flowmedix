export type ExfilPattern = {
  id: string;
  description: string;
  pattern: RegExp;
};

/** Static patterns for the DR runner and workflow only — keep narrow to avoid noise. */
export const DR_EXFIL_FORBIDDEN_PATTERNS: readonly ExfilPattern[] = [
  { id: 'set-x', description: 'set -x', pattern: /\bset\s+-x\b/ },
  { id: 'printenv', description: 'printenv', pattern: /\bprintenv\b/ },
  {
    id: 'echo-secret-var',
    description: 'echo $SECRET',
    pattern: /\becho\b[^\n]*\$[A-Za-z0-9_]*SECRET\b/,
  },
  {
    id: 'echo-secrets-context',
    description: 'echo de secrets GitHub',
    pattern: /\becho\b[^;\n]*\$\{\{\s*secrets\./i,
  },
  {
    id: 'console-authorization',
    description: 'console.log de headers Authorization',
    pattern: /console\.(log|info|debug|warn|error)\s*\([^)]*Authorization/i,
  },
  {
    id: 'upload-entire-workspace',
    description: 'upload-artifact do workspace inteiro',
    pattern: /upload-artifact[\s\S]{0,400}path:\s*['"]\.\/?['"]/,
  },
  { id: 'curl', description: 'curl para destino arbitrário', pattern: /\bcurl\b/ },
  { id: 'fetch-call', description: 'fetch arbitrário', pattern: /\bfetch\s*\(/ },
];

export type ExfilFinding = {
  id: string;
  description: string;
};

export function findExfilViolations(source: string): ExfilFinding[] {
  const findings: ExfilFinding[] = [];
  for (const item of DR_EXFIL_FORBIDDEN_PATTERNS) {
    item.pattern.lastIndex = 0;
    if (item.pattern.test(source)) {
      findings.push({ id: item.id, description: item.description });
    }
  }
  return findings;
}
