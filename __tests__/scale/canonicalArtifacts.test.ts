import {
  loadCanonicalArtifactBinding,
  sha256HexOfGitBlobAtRef,
  sha256HexOfWorktreeFile,
} from '@/lib/scale/authenticatedHarness/canonicalArtifacts';

describe('canonicalArtifacts digests', () => {
  it('git blob digest é portável (LF) e difere de worktree no Windows quando CRLF', () => {
    const binding = loadCanonicalArtifactBinding('conservative');
    const gitEnvelope = sha256HexOfGitBlobAtRef(binding.envelope_relative_path);
    const gitAllowlist = sha256HexOfGitBlobAtRef(binding.allowlist_relative_path);
    expect(binding.envelope_digest_sha256).toBe(gitEnvelope);
    expect(binding.allowlist_digest_sha256).toBe(gitAllowlist);
    expect(gitEnvelope).toBe('07f7c3b34c29445b6c6b58b9bd73be646ae41123c07f3be0ff2018a846a85179');
    expect(gitAllowlist).toBe('088b5b0436d57affbee93d96009b6923df80ddb846fd2bb06a0860df9fabb93e');

    const wtEnvelope = sha256HexOfWorktreeFile(binding.envelope_relative_path);
    const wtAllowlist = sha256HexOfWorktreeFile(binding.allowlist_relative_path);
    if (process.platform === 'win32') {
      expect(wtEnvelope).toBe('19686ec5de20d514048b13ba2c678d26e26c864bdd263932b1c6d6c5be0d43d0');
      expect(wtAllowlist).toBe('d0025df987c8d3dfd7e8e5ed8665f1bed37f1659afccf366d0568553f3eefb45');
      expect(wtEnvelope).not.toBe(gitEnvelope);
    } else {
      expect(wtEnvelope).toBe(gitEnvelope);
      expect(wtAllowlist).toBe(gitAllowlist);
    }
  });
});
