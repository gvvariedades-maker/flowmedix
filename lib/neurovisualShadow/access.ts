export function isNeuroVisualShadowPreviewEnabled(nodeEnv: string | undefined): boolean {
  return nodeEnv === 'development';
}
