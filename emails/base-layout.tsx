import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { ReactNode } from 'react';

const BG = '#010409';
const ACCENT = '#00f2ff';
const MUTED = '#94a3b8';

export type BaseLayoutProps = {
  children: ReactNode;
  preview?: string;
};

export function BaseLayout({ children, preview }: BaseLayoutProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      {preview ? <Preview>{preview}</Preview> : null}
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: BG,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <Container
          style={{
            margin: '0 auto',
            padding: '40px 24px',
            maxWidth: '560px',
          }}
        >
          <Section style={{ marginBottom: '32px' }}>
            <Text
              style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: ACCENT,
              }}
            >
              Avant
            </Text>
          </Section>

          <Section
            style={{
              color: '#ffffff',
              fontSize: '16px',
              lineHeight: '26px',
            }}
          >
            {children}
          </Section>

          <Section
            style={{
              marginTop: '40px',
              paddingTop: '24px',
              borderTop: `1px solid ${ACCENT}22`,
            }}
          >
            <Text
              style={{
                margin: 0,
                fontSize: '12px',
                lineHeight: '20px',
                color: MUTED,
                textAlign: 'center',
              }}
            >
              © Avant — Estudo reverso para concursos
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
