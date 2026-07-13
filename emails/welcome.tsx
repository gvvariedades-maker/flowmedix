import { Button, Heading, Section, Text } from '@react-email/components';

import { BaseLayout } from '@/emails/base-layout';
import { resolveWelcomeSalutation } from '@/lib/email/welcomeSalutation';

const ACCENT = '#00f2ff';
const BG = '#010409';
const CARD_BG = '#0d1117';
const SUCCESS = '#00ff88';

export type WelcomeEmailProps = {
  firstName: string;
};

function estudarUrl(): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim().replace(/\/$/, '');
  return base ? `${base}/estudar` : '/estudar';
}

/** Preview estático do e-mail de boas-vindas (envio real usa `EditableMessageEmail` + template). */
export function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  const name = resolveWelcomeSalutation(firstName);

  return (
    <BaseLayout preview="Bem-vindo ao AVANT Enf — estudo reverso para Técnico de Enfermagem" brandTagline="Estudo reverso · Técnico de Enfermagem">
      <Section
        style={{
          padding: '24px 22px',
          borderRadius: '16px',
          border: `1px solid ${ACCENT}28`,
          backgroundColor: CARD_BG,
        }}
      >
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

        <Heading
          as="h1"
          style={{
            margin: '0 0 16px',
            fontSize: '26px',
            fontWeight: 700,
            lineHeight: '1.25',
            letterSpacing: '-0.02em',
            color: '#ffffff',
          }}
        >
          Olá, {name}!
        </Heading>

        <Text style={{ margin: '0 0 12px', color: '#e2e8f0', fontSize: '16px', lineHeight: '26px' }}>
          Você entrou no AVANT Enf — estudo reverso feito para Técnicos de Enfermagem em concursos
          públicos. Cada questão vira um NeuroSlide que fixa o raciocínio clínico em poucos minutos.
        </Text>

        <Section
          style={{
            margin: '0 0 28px',
            padding: '16px 18px',
            borderRadius: '12px',
            border: `1px solid ${SUCCESS}33`,
            backgroundColor: `${SUCCESS}0d`,
          }}
        >
          <Text style={{ margin: 0, color: '#d1fae5', fontSize: '15px', lineHeight: '24px' }}>
            Mapas conceituais, regras de ouro e fluxos de decisão na ordem da sua banca — sem reler
            PDF inteiro.
          </Text>
        </Section>

        <Button
          href={estudarUrl()}
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
          Começar no AVANT Enf
        </Button>

        <Text style={{ margin: '24px 0 0', fontSize: '12px', lineHeight: '20px', color: '#94a3b8' }}>
          Dica: comece por uma questão da sua banca — o AVANT Enf monta os 4 NeuroSlides na hora.
        </Text>
      </Section>
    </BaseLayout>
  );
}

export default WelcomeEmail;
