import { Button, Heading, Section, Text } from '@react-email/components';

import { BaseLayout } from '@/emails/base-layout';
import type { EmailTemplateContent } from '@/lib/email/templateContent';
import { resolveEmailCtaUrl } from '@/lib/email/templateContent';

const ACCENT = '#00f2ff';
const BG = '#010409';
const CARD_BG = '#0d1117';
const SUCCESS = '#00ff88';
const MUTED = '#94a3b8';

export type EditableMessageEmailProps = {
  preview: string;
  content: EmailTemplateContent;
  /** Visual Cyber Clinical para boas-vindas. */
  variant?: 'default' | 'welcome';
};

export function EditableMessageEmail({
  preview,
  content,
  variant = 'default',
}: EditableMessageEmailProps) {
  const ctaHref = resolveEmailCtaUrl(content.ctaUrl);
  const showCta = Boolean(content.ctaLabel?.trim() && ctaHref);
  const isWelcome = variant === 'welcome';

  const body = (
    <>
      {isWelcome ? (
        <Text
          style={{
            margin: '0 0 20px',
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: '999px',
            border: `1px solid ${ACCENT}44`,
            backgroundColor: `${ACCENT}14`,
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: ACCENT,
          }}
        >
          Técnico de Enfermagem · Estudo Reverso
        </Text>
      ) : null}

      <Heading
        as="h1"
        style={{
          margin: '0 0 16px',
          fontSize: isWelcome ? '26px' : '24px',
          fontWeight: 700,
          lineHeight: '1.25',
          letterSpacing: '-0.02em',
          color: '#ffffff',
        }}
      >
        {content.headline}
      </Heading>

      <Text
        style={{
          margin: '0 0 12px',
          color: '#e2e8f0',
          fontSize: '16px',
          lineHeight: '26px',
        }}
      >
        {content.paragraph1}
      </Text>

      {content.paragraph2?.trim() ? (
        isWelcome ? (
          <Section
            style={{
              margin: '0 0 28px',
              padding: '16px 18px',
              borderRadius: '12px',
              border: `1px solid ${SUCCESS}33`,
              backgroundColor: `${SUCCESS}0d`,
            }}
          >
            <Text
              style={{
                margin: 0,
                color: '#d1fae5',
                fontSize: '15px',
                lineHeight: '24px',
              }}
            >
              {content.paragraph2}
            </Text>
          </Section>
        ) : (
          <Text style={{ margin: '0 0 28px', color: '#e2e8f0' }}>{content.paragraph2}</Text>
        )
      ) : (
        <Text style={{ margin: '0 0 28px', color: '#e2e8f0' }}>&nbsp;</Text>
      )}

      {showCta ? (
        <Button
          href={ctaHref}
          style={{
            display: 'inline-block',
            padding: '14px 28px',
            backgroundColor: ACCENT,
            color: BG,
            fontSize: '15px',
            fontWeight: 700,
            textDecoration: 'none',
            borderRadius: '12px',
            boxShadow: `0 0 24px ${ACCENT}44`,
          }}
        >
          {content.ctaLabel}
        </Button>
      ) : null}

      {isWelcome ? (
        <Text
          style={{
            margin: '24px 0 0',
            fontSize: '12px',
            lineHeight: '20px',
            color: MUTED,
          }}
        >
          Dica: comece por uma questão da sua banca — o AVANT monta os 4 NeuroSlides na hora.
        </Text>
      ) : null}
    </>
  );

  return (
    <BaseLayout preview={preview} brandTagline={isWelcome ? 'Estudo reverso · Técnico de Enfermagem' : undefined}>
      {isWelcome ? (
        <Section
          style={{
            padding: '24px 22px',
            borderRadius: '16px',
            border: `1px solid ${ACCENT}28`,
            backgroundColor: CARD_BG,
          }}
        >
          {body}
        </Section>
      ) : (
        body
      )}
    </BaseLayout>
  );
}

export default EditableMessageEmail;
