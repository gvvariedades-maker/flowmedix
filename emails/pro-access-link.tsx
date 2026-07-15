import { Button, Heading, Text } from '@react-email/components';

import { BaseLayout } from '@/emails/base-layout';

export type ProAccessLinkEmailProps = {
  accessLink: string;
};

export function ProAccessLinkEmail({ accessLink }: ProAccessLinkEmailProps) {
  return (
    <BaseLayout preview="Seu acesso AVANT enf Pro está liberado">
      <Heading
        as="h1"
        style={{
          margin: '0 0 16px',
          fontSize: '24px',
          fontWeight: 600,
          color: '#ffffff',
        }}
      >
        Acesso AVANT enf Pro liberado
      </Heading>

      <Text style={{ margin: '0 0 12px', color: '#e2e8f0' }}>
        Seu pagamento foi confirmado. Clique no botão abaixo para entrar na plataforma — o link é
        pessoal e válido por tempo limitado.
      </Text>
      <Text style={{ margin: '0 0 28px', color: '#94a3b8', fontSize: '14px' }}>
        Se não encontrar este e-mail, verifique a caixa de spam.
      </Text>

      <Button
        href={accessLink}
        style={{
          backgroundColor: '#BEF264',
          color: '#010409',
          fontWeight: 700,
          borderRadius: '12px',
          padding: '14px 24px',
        }}
      >
        Entrar no AVANT enf
      </Button>
    </BaseLayout>
  );
}
