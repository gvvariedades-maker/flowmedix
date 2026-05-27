import { Section, Text } from '@react-email/components';
import {
  AVANT_LOGO_BOLT,
  AVANT_LOGO_COLORS,
  AVANT_LOGO_DIMENSIONS,
  AVANT_LOGO_GRADIENTS,
  AVANT_LOGO_SHELL_SHADOW,
  getAvantLogoLockupPadding,
} from '@/lib/brand/avantLogoConstants';

const ICON = AVANT_LOGO_DIMENSIONS.icon.size;
const ICON_RADIUS = AVANT_LOGO_DIMENSIONS.icon.radius;
const BOLT_H = Math.round(ICON * AVANT_LOGO_DIMENSIONS.icon.boltInsetRatio);
const BOLT_W = Math.round(BOLT_H * (AVANT_LOGO_BOLT.width / AVANT_LOGO_BOLT.height));

/** Lockup estático para clientes de e-mail (tabelas + estilos inline). */
export function AvantLogoEmail() {
  const innerPad = getAvantLogoLockupPadding('lg');
  const shellPad = AVANT_LOGO_DIMENSIONS.lockupShell.padding;
  const innerRadius = AVANT_LOGO_DIMENSIONS.lockupInner.radius;
  const shellRadius = AVANT_LOGO_DIMENSIONS.lockupShell.radius;
  const gap = AVANT_LOGO_DIMENSIONS.lockupInner.gap;
  const barW = AVANT_LOGO_DIMENSIONS.lockupInner.accentBarWidth;
  const wordmarkSize = AVANT_LOGO_DIMENSIONS.wordmark.fontSize;
  const letterSpacing = AVANT_LOGO_DIMENSIONS.wordmark.letterSpacingPx;

  return (
    <Section style={{ margin: 0, padding: 0 }}>
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        style={{
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
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
                                borderRadius: '2px',
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
                                borderRadius: `${ICON_RADIUS}px`,
                                background: AVANT_LOGO_GRADIENTS.icon,
                                verticalAlign: 'middle',
                                textAlign: 'center',
                                boxShadow: '0 4px 16px rgba(48, 24, 200, 0.35)',
                              }}
                              aria-hidden
                            >
                              <table
                                role="presentation"
                                cellPadding={0}
                                cellSpacing={0}
                                border={0}
                                align="center"
                                style={{
                                  margin: '0 auto',
                                  borderCollapse: 'collapse',
                                }}
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      align="center"
                                      valign="middle"
                                      style={{
                                        width: `${ICON}px`,
                                        height: `${ICON}px`,
                                        lineHeight: 0,
                                      }}
                                    >
                                      <svg
                                        width={BOLT_W}
                                        height={BOLT_H}
                                        viewBox={AVANT_LOGO_BOLT.viewBox}
                                        xmlns="http://www.w3.org/2000/svg"
                                        style={{ display: 'block', margin: '0 auto' }}
                                        aria-hidden
                                      >
                                        <defs>
                                          <linearGradient
                                            id="avant-email-bolt"
                                            x1="0%"
                                            y1="0%"
                                            x2="0%"
                                            y2="100%"
                                          >
                                            <stop
                                              offset="0%"
                                              stopColor={AVANT_LOGO_GRADIENTS.boltStops[0]}
                                            />
                                            <stop
                                              offset="52%"
                                              stopColor={AVANT_LOGO_GRADIENTS.boltStops[1]}
                                            />
                                            <stop
                                              offset="100%"
                                              stopColor={AVANT_LOGO_GRADIENTS.boltStops[2]}
                                            />
                                          </linearGradient>
                                        </defs>
                                        <polygon
                                          points={AVANT_LOGO_BOLT.polygon}
                                          fill="url(#avant-email-bolt)"
                                        />
                                      </svg>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                            <td style={{ width: `${gap}px` }} aria-hidden>
                              &nbsp;
                            </td>
                            <td style={{ verticalAlign: 'middle' }}>
                              <Text
                                style={{
                                  margin: 0,
                                  padding: 0,
                                  fontFamily:
                                    'Syne, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                  fontSize: `${wordmarkSize}px`,
                                  fontWeight: 900,
                                  lineHeight: '1',
                                  letterSpacing: `${letterSpacing}px`,
                                  textTransform: 'uppercase',
                                  color: AVANT_LOGO_GRADIENTS.boltStops[1],
                                }}
                              >
                                AVANT
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
