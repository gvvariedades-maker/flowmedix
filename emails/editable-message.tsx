import { Button, Heading, Text } from '@react-email/components';

import { BaseLayout } from '@/emails/base-layout';
import type { EmailTemplateContent } from '@/lib/email/templateContent';
import { resolveEmailCtaUrl } from '@/lib/email/templateContent';

const ACCENT = '#00f2ff';
const BG = '#010409';

export type EditableMessageEmailProps = {
  preview: string;
  content: EmailTemplateContent;
};

export function EditableMessageEmail({ preview, content }: EditableMessageEmailProps) {
  const ctaHref = resolveEmailCtaUrl(content.ctaUrl);
  const showCta = Boolean(content.ctaLabel?.trim() && ctaHref);

  return (
    <BaseLayout preview={preview}>
      <Heading
        as="h1"
        style={{
          margin: '0 0 16px',
          fontSize: '24px',
          fontWeight: 600,
          color: '#ffffff',
        }}
      >
        {content.headline}
      </Heading>

      <Text style={{ margin: '0 0 12px', color: '#e2e8f0' }}>{content.paragraph1}</Text>
      {content.paragraph2?.trim() ? (
        <Text style={{ margin: '0 0 28px', color: '#e2e8f0' }}>{content.paragraph2}</Text>
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
            fontWeight: 600,
            textDecoration: 'none',
            borderRadius: '8px',
          }}
        >
          {content.ctaLabel}
        </Button>
      ) : null}
    </BaseLayout>
  );
}

export default EditableMessageEmail;
