import { execSync } from 'node:child_process';
import { HarnessExecutionForbiddenError } from '@/lib/scale/authenticatedHarness/harnessForbidden';

export function resolveRuntimeGitShaStrict(): string {
  try {
    const sha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    if (!sha) {
      throw new HarnessExecutionForbiddenError('git rev-parse HEAD retornou vazio.');
    }
    return sha;
  } catch (err) {
    if (err instanceof HarnessExecutionForbiddenError) throw err;
    throw new HarnessExecutionForbiddenError(
      'git rev-parse HEAD falhou; execução real exige checkout git verificável (sem SCALE_HARNESS_RUNTIME_GIT_SHA).',
    );
  }
}

export function getGitStatusPorcelain(): string {
  try {
    return execSync('git status --porcelain', { encoding: 'utf8' });
  } catch {
    throw new HarnessExecutionForbiddenError('git status --porcelain falhou.');
  }
}

export function assertGitWorktreeClean(porcelain: string): void {
  if (porcelain.trim()) {
    throw new HarnessExecutionForbiddenError(
      'worktree não limpo; commit, stash ou reverta alterações versionadas antes de --execute.',
    );
  }
}
