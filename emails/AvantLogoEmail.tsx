import { Section, Text } from '@react-email/components';
import {
  AVANT_LOGO_COLORS,
  AVANT_LOGO_DIMENSIONS,
  AVANT_LOGO_GRADIENTS,
  AVANT_LOGO_SHELL_SHADOW,
  getAvantLogoLockupPadding,
} from '@/lib/brand/avantLogoConstants';

const ICON = AVANT_LOGO_DIMENSIONS.icon.size;
const ICON_LETTER_SIZE = Math.round(ICON * 0.26);

/** Lockup e-mail: selo circular AE interlocked + AVANT / ENF. */
export function AvantLogoEmail() {
  const innerPad = getAvantLogoLockupPadding('lg');
  const shellPad = AVANT_LOGO_DIMENSIONS.lockupShell.padding;
  const innerRadius = AVANT_LOGO_DIMENSIONS.lockupInner.radius;
  const shellRadius = AVANT_LOGO_DIMENSIONS.lockupShell.radius;
  const gap = AVANT_LOGO_DIMENSIONS.lockupInner.gap;
  const barW = AVANT_LOGO_DIMENSIONS.lockupInner.accentBarWidth;
  const wordmarkSize = AVANT_LOGO_DIMENSIONS.wordmark.fontSize;
  const letterSpacing = AVANT_LOGO_DIMENSIONS.wordmark.letterSpacingPx;
  const subtitleLabel = AVANT_LOGO_DIMENSIONS.subtitle.label;

  return (
    <Section style={{ margin: 0, padding: 0 }}>
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        style={{ borderCollapse: 'separate', borderSpacing: 0 }}
      >
        <tbody>
          <tr>
            <td
              style={{
                padding: `${shellPad}px`,
                borderRadius: `${shellRadius}px`,
                background: AVANT_LOGO_GRADIENTS.shellBorder,
                boxShadow: AVANT_LOGO_SHELL_SHADOW.rest,
              }}
            >
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                border={0}
                style={{
                  borderCollapse: 'collapse',
                  backgroundColor: AVANT_LOGO_COLORS.lockupInnerBg,
                  borderRadius: `${innerRadius}px`,
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: innerPad }}>
                      <table
                        role="presentation"
                        cellPadding={0}
                        cellSpacing={0}
                        border={0}
                        style={{ borderCollapse: 'collapse' }}
                      >
                        <tbody>
                          <tr>
                            <td
                              width={barW}
                              style={{
                                width: `${barW}px`,
                                backgroundColor: AVANT_LOGO_COLORS.accentBar,
                                borderRadius: '1px',
                                verticalAlign: 'middle',
                              }}
                              aria-hidden
                            >
                              &nbsp;
                            </td>
                            <td style={{ width: `${gap}px` }} aria-hidden>
                              &nbsp;
                            </td>
                            <td
                              style={{
                                width: `${ICON}px`,
                                height: `${ICON}px`,
                                borderRadius: '50%',
                                background: AVANT_LOGO_COLORS.iconForestGradient,
                                verticalAlign: 'middle',
                                textAlign: 'center',
                              }}
                              aria-hidden
                            >
                              <Text
                                style={{
                                  margin: 0,
                                  padding: 0,
                                  fontFamily:
                                    '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                  fontSize: `${ICON_LETTER_SIZE}px`,
                                  fontWeight: 700,
                                  lineHeight: '1',
                                  letterSpacing: '-0.5px',
                                  color: '#ffffff',
                                  textAlign: 'center',
                                }}
                              >
                                AE
                              </Text>
                            </td>
                            <td style={{ width: `${gap}px` }} aria-hidden>
                              &nbsp;
                            </td>
                            <td style={{ verticalAlign: 'middle' }}>
                              {/* Mesmo lockup "AVANT enf" do emblema cobre/verde (sem gradiente — clientes de e-mail nao suportam background-clip:text de forma confiavel). */}
                              <Text
                                style={{
                                  margin: 0,
                                  padding: 0,
                                  fontFamily:
                                    '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                  fontSize: `${wordmarkSize}px`,
                                  fontWeight: 800,
                                  lineHeight: '1.05',
                                  letterSpacing: `${letterSpacing}px`,
                                  color: AVANT_LOGO_COLORS.wordmarkBrandBlueSolid,
                                }}
                              >
                                AVANT{' '}
                                <span style={{ color: AVANT_LOGO_COLORS.wordmarkEnfGreen }}>
                                  {subtitleLabel}
                                </span>
                              </Text>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}
