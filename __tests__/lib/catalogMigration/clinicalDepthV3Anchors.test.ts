import fs from 'node:fs';
import path from 'node:path';

describe('clinical-depth-v3 anchors registry', () => {
  it('registry aponta para example Fundatec válido', () => {
    const registryPath = path.join(
      process.cwd(),
      'data/catalog-migration/clinical-depth-v3-anchors.json',
    );
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8')) as {
      anchors: { exceto_clinical_v3: { file: string } };
    };
    const examplePath = path.join(process.cwd(), registry.anchors.exceto_clinical_v3.file);
    expect(fs.existsSync(examplePath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(examplePath, 'utf8')) as {
      meta?: { content_standard?: string; pedagogical_branch?: string };
    };
    expect(data.meta?.content_standard).toBe('golden-v1');
    expect(data.meta?.pedagogical_branch).toBe('perioperatorio_pos_operatorio');
  });
});
