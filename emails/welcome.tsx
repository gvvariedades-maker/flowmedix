import { Button, Heading, Text } from '@react-email/components';

import { BaseLayout } from '@/emails/base-layout';

const ACCENT = '#00f2ff';
const BG = '#010409';

export type WelcomeEmailProps = {
  firstName: string;
};

function dashboardUrl(): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim().replace(/\/$/, '');
  return base ? `${base}/dashboard` : '/dashboard';
}

export function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  const name = firstName.trim() || 'estudante';

  return (
    <BaseLayout preview="Bem-vindo ao Avant — comece com NeuroSlides">
      <Heading
        as="h1"
        style={{
          margin: '0 0 16px',
          fontSize: '24px',
          fontWeight: 600,
          color: '#ffffff',
        }}
      >
        Olá, {name}!
      </Heading>

      <Text style={{ margin: '0 0 12px', color: '#e2e8f0' }}>
        Bem-vindo ao Avant. Cada questão vira um NeuroSlide — estudo reverso visual que
        fixa o raciocínio clínico em poucos minutos.
      </Text>
      <Text style={{ margin: '0 0 28px', color: '#e2e8f0' }}>
        Mapas, regras de ouro e fluxos de decisão na ordem certa para a sua banca — sem
        reler PDF inteiro.
      </Text>

      <Button
        href={dashboardUrl()}
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
        Ir para o dashboard
      </Button>
    </BaseLayout>
  );
}

export default WelcomeEmail;
