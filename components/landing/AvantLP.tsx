'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { DM_Sans, Sora } from 'next/font/google';
import { PublicDarkSiteHeader } from '@/components/layout/PublicDarkSiteHeader';

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const FONT_SORA = sora.style.fontFamily;
export const FONT_DM = dmSans.style.fontFamily;

const C = { bg: '#010409', cyan: '#00f2ff', emerald: '#00ff88', rose: '#ff0055' };

/** Screenshots em public/ss/ — nome do arquivo = conteúdo do slide. */
const SS = {
  apostilaGlasgow: '/ss/apostila-glasgow-densa.jpg',
  questao: '/ss/avant-questao-saude-mulher.jpg',
  flowMedicamento: '/ss/avant-flow-medicamento.jpg',
  flowHipodermo: '/ss/avant-flow-hipodermo.jpg',
  flowPcr: '/ss/avant-flow-pcr.jpg',
  conceptRcp: '/ss/avant-concept-rcp.jpg',
  conceptPuerperio: '/ss/avant-flow-puerperio.jpg',
  conceptPeriop: '/ss/avant-concept-map-roxo.jpg',
  dangerFlebite: '/ss/avant-danger-contraindicacao.jpg',
  goldenAps: '/ss/avant-golden-aps.jpg',
  goldenRcp: '/ss/avant-golden-rcp-rosa.jpg',
} as const;

const LP_STYLES = `
  *{box-sizing:border-box;margin:0;padding:0;}
  @keyframes avantLpFadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes avantLpPulse{0%,100%{opacity:1}50%{opacity:.4}}
  @media(max-width:768px){
    [data-grid]{grid-template-columns:1fr!important;}
    [data-grid-3]{grid-template-columns:1fr 1fr!important;}
  }
  @media(max-width:480px){
    [data-grid-3]{grid-template-columns:1fr!important;}
  }
`;

const PHONE_W = 360;
const PHONE_H = 700;

type FadeUpProps = {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
};

type PhoneMockupProps = {
  src: string;
  alt: string;
  glow?: string;
  style?: CSSProperties;
};

type HeroSlide = {
  src: string;
  glow: string;
  label: string;
};

type MecanismoStep = {
  num: string;
  title: string;
  body: string;
  src: string;
  glow: string;
};

type GaleriaItem = {
  id: string;
  src: string;
  tipo: string;
  tema: string;
  glow: string;
};

type FaqItem = {
  q: string;
  a: string;
};

type StatItem = {
  n: string;
  l: string;
  c: string;
};

function useInView(threshold = 0.1): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function FadeUp({ children, delay = 0, style = {} }: FadeUpProps) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity .7s ease ${delay}s,transform .7s cubic-bezier(.16,1,.3,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Bg() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: C.bg }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(rgba(0,242,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,242,255,.02) 1px,transparent 1px)`,
          backgroundSize: '52px 52px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -200,
          left: -200,
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: C.cyan,
          opacity: 0.055,
          filter: 'blur(150px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -150,
          right: -150,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: C.emerald,
          opacity: 0.04,
          filter: 'blur(140px)',
        }}
      />
    </div>
  );
}

function PhoneMockup({ src, alt, glow = C.cyan, style = {} }: PhoneMockupProps) {
  return (
    <div
      style={{
        borderRadius: 28,
        overflow: 'hidden',
        border: `1.5px solid ${glow}25`,
        boxShadow: `0 0 60px ${glow}20,0 32px 80px rgba(0,0,0,.6)`,
        background: '#080d16',
        ...style,
      }}
    >
      <div
        style={{
          padding: '8px 14px 4px',
          background: 'rgba(1,4,9,.9)',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
            <div
              key={color}
              style={{ width: 8, height: 8, borderRadius: '50%', background: color, opacity: 0.7 }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            background: 'rgba(255,255,255,.06)',
            borderRadius: 6,
            padding: '3px 10px',
            fontSize: 10,
            color: 'rgba(255,255,255,.3)',
            fontFamily: 'monospace',
          }}
        >
          avant.enf.br/estudar
        </div>
      </div>
      <Image
        src={src}
        alt={alt}
        width={PHONE_W}
        height={PHONE_H}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </div>
  );
}

function Hero() {
  // Ordem pedagógica dos 4 NeuroSlides (igual ao fluxo do estudo reverso)
  const slides: HeroSlide[] = [
    { src: SS.conceptRcp, glow: '#ff6b35', label: 'Mapa Conceitual' },
    { src: SS.goldenAps, glow: C.emerald, label: 'Regra de Ouro' },
    { src: SS.flowMedicamento, glow: C.cyan, label: 'Fluxo Lógico' },
    { src: SS.dangerFlebite, glow: C.rose, label: 'Zona de Perigo' },
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((prev) => (prev + 1) % 4), 3400);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '48px 28px 60px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: 1160, margin: '0 auto', width: '100%' }}>
        <div
          data-grid
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 999,
                marginBottom: 28,
                background: `${C.emerald}12`,
                border: `1px solid ${C.emerald}28`,
                color: C.emerald,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: FONT_SORA,
                animation: 'avantLpFadeUp .8s ease forwards',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: C.emerald,
                  animation: 'avantLpPulse 2s infinite',
                }}
              />
              Mais de 5.000 questões reais · 16.000 NeuroSlides · só para técnico
            </div>

            <h1
              style={{
                fontFamily: FONT_SORA,
                fontWeight: 800,
                fontSize: 'clamp(32px,4.2vw,54px)',
                lineHeight: 1.07,
                letterSpacing: '-.035em',
                marginBottom: 22,
                color: '#fff',
                animation: 'avantLpFadeUp .8s ease .05s both',
              }}
            >
              O único banco de questões{' '}
              <span
                style={{
                  background: `linear-gradient(135deg,${C.cyan},${C.emerald})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                feito por técnico,
              </span>{' '}
              para técnico de enfermagem.
            </h1>

            <p
              style={{
                fontSize: 17,
                color: '#7a8a9a',
                lineHeight: 1.75,
                marginBottom: 32,
                maxWidth: 460,
                fontFamily: FONT_DM,
                animation: 'avantLpFadeUp .8s ease .1s both',
              }}
            >
              Todo material que existe foi feito para enfermeiro — nível diferente, conteúdo diferente, e{' '}
              <strong style={{ color: '#c4d0dd' }}>muito do que você estuda não cai na sua prova.</strong> O Avant
              parte da questão que você errou, decompõe em 4 NeuroSlides e ensina só o que a banca cobra de técnico.
            </p>

            <div style={{ animation: 'avantLpFadeUp .8s ease .15s both' }}>
              <Link
                href="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '16px 32px',
                  borderRadius: 16,
                  fontSize: 16,
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontFamily: FONT_SORA,
                  color: '#000',
                  background: `linear-gradient(135deg,${C.cyan},${C.emerald})`,
                  boxShadow: `0 0 48px ${C.cyan}45`,
                  transition: 'transform .18s,box-shadow .18s',
                }}
              >
                Estudar minha primeira questão grátis →
              </Link>
              <p
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: '#2a3a4a',
                  fontFamily: FONT_DM,
                }}
              >
                1 questão grátis/dia · Sem cartão. Acesso imediato. Cancela quando quiser.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 24,
                flexWrap: 'wrap',
                animation: 'avantLpFadeUp .8s ease .2s both',
              }}
            >
              {slides.map((slide, index) => (
                <button
                  key={slide.label}
                  type="button"
                  onClick={() => setActive(index)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: `1px solid ${active === index ? `${slide.glow}50` : 'rgba(255,255,255,.08)'}`,
                    background: active === index ? `${slide.glow}15` : 'transparent',
                    color: active === index ? slide.glow : '#3a4a5a',
                    fontFamily: FONT_DM,
                    transition: 'all .2s ease',
                  }}
                >
                  {slide.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', minHeight: 480 }}>
            {slides.map((slide, index) => (
              <div
                key={slide.src}
                style={{
                  position: index === 0 ? 'relative' : 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  opacity: active === index ? 1 : 0,
                  transform:
                    active === index ? 'scale(1) translateY(0)' : 'scale(.97) translateY(10px)',
                  transition: 'opacity .45s ease,transform .45s cubic-bezier(.16,1,.3,1)',
                  pointerEvents: active === index ? 'auto' : 'none',
                }}
              >
                <PhoneMockup src={slide.src} alt={slide.label} glow={slide.glow} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Problema() {
  return (
    <section style={{ padding: '100px 28px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <FadeUp>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.15em',
              color: C.rose,
              marginBottom: 16,
              fontFamily: FONT_SORA,
            }}
          >
            O PROBLEMA QUE NINGUÉM FALA
          </p>
          <h2
            style={{
              fontFamily: FONT_SORA,
              fontWeight: 800,
              fontSize: 'clamp(26px,3.5vw,46px)',
              lineHeight: 1.1,
              letterSpacing: '-.03em',
              color: '#fff',
              marginBottom: 40,
            }}
          >
            Você não estuda pouco.
            <br />
            <span style={{ color: '#3a4a5a' }}>Você estuda o conteúdo errado.</span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div
            data-grid
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 }}
          >
            <div
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                border: '1px solid rgba(255,0,85,.2)',
                boxShadow: '0 0 40px rgba(255,0,85,.08)',
              }}
            >
              <div
                style={{
                  padding: '12px 18px',
                  background: 'rgba(255,0,85,.08)',
                  borderBottom: '1px solid rgba(255,0,85,.12)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.rose }} />
                <span style={{ fontSize: 11, color: C.rose, fontWeight: 700, fontFamily: FONT_SORA }}>
                  Material que você usa hoje
                </span>
              </div>
              <Image
                src={SS.apostilaGlasgow}
                alt="Apostila para enfermeiro — escala de Glasgow com colunas e notas que não caem em prova de técnico"
                width={520}
                height={400}
                style={{ width: '100%', height: 'auto', display: 'block', filter: 'brightness(.8) saturate(.55)' }}
              />
              <div
                style={{
                  padding: '12px 18px',
                  background: 'rgba(255,0,85,.05)',
                  fontSize: 12,
                  color: '#5a3040',
                  fontFamily: FONT_DM,
                }}
              >
                Feito para <strong style={{ color: C.rose }}>enfermeiro</strong> — nível e conteúdo diferentes do
                que a banca cobra de técnico
              </div>
            </div>

            <div
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                border: `1px solid ${C.emerald}25`,
                boxShadow: `0 0 40px ${C.emerald}10`,
              }}
            >
              <div
                style={{
                  padding: '12px 18px',
                  background: `${C.emerald}08`,
                  borderBottom: `1px solid ${C.emerald}15`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.emerald }} />
                <span style={{ fontSize: 11, color: C.emerald, fontWeight: 700, fontFamily: FONT_SORA }}>
                  Com o Avant
                </span>
              </div>
              <Image
                src={SS.flowMedicamento}
                alt="NeuroSlide Avant — Fluxo Lógico de administração de medicamento"
                width={520}
                height={400}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
              <div
                style={{
                  padding: '12px 18px',
                  background: `${C.emerald}04`,
                  fontSize: 12,
                  color: `${C.emerald}80`,
                  fontFamily: FONT_DM,
                }}
              >
                Questão real de <strong style={{ color: C.emerald }}>técnico</strong> — só o que cai na sua prova,
                decomposto em 4 slides
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div
            style={{
              borderRadius: 20,
              padding: '32px 36px',
              background: 'rgba(15,23,42,.65)',
              border: '1px solid rgba(255,255,255,.07)',
              backdropFilter: 'blur(14px)',
            }}
          >
            <p
              style={{
                fontSize: 19,
                color: '#7a8a9a',
                lineHeight: 1.75,
                fontFamily: FONT_DM,
                margin: 0,
              }}
            >
              Apostila de enfermagem tem tabela de Glasgow com 4 colunas, nota de rodapé de ATLS e 3 parágrafos que
              não caem na prova de técnico. Você passa horas nisso.{' '}
              <strong style={{ color: '#c4d0dd' }}>A questão real cobrou só a pontuação mínima.</strong> O Avant te
              mostra isso em 8 minutos. <strong style={{ color: C.cyan }}>Essa diferença é a aprovação.</strong>
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function Mecanismo() {
  const steps: MecanismoStep[] = [
    {
      num: '01',
      title: 'Você responde a questão real de técnico',
      body: 'Questões de bancas reais: IBFC, Selecon, MS (Sarmento), prefeituras. Categorizadas como técnico de enfermagem. Nunca mistura com prova de enfermeiro.',
      src: SS.questao,
      glow: C.cyan,
    },
    {
      num: '02',
      title: 'O Avant decompõe o erro em 4 NeuroSlides',
      body: 'Cada questão tem: Mapa Conceitual, Regra de Ouro, Fluxo Lógico e Zona de Perigo. Você vê exatamente onde a banca armou a pegadinha — e por que você caiu nela.',
      src: SS.dangerFlebite,
      glow: C.rose,
    },
    {
      num: '03',
      title: 'Você refaz. Acerta. Não esquece.',
      body: 'O método parte do erro, não do conteúdo. Você aprende pelo raciocínio. Na prova, quando a banca mudar o enunciado, você ainda acerta — porque entendeu, não decorou.',
      src: SS.goldenAps,
      glow: C.emerald,
    },
  ];

  return (
    <section style={{ padding: '100px 28px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <FadeUp>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.15em',
                color: C.cyan,
                marginBottom: 14,
                fontFamily: FONT_SORA,
              }}
            >
              COMO FUNCIONA
            </p>
            <h2
              style={{
                fontFamily: FONT_SORA,
                fontWeight: 800,
                fontSize: 'clamp(24px,3.5vw,44px)',
                lineHeight: 1.1,
                letterSpacing: '-.03em',
                color: '#fff',
                marginBottom: 14,
              }}
            >
              Não é videoaula. Não é flashcard.
              <br />
              <span style={{ color: '#3a4a5a' }}>É estudo reverso.</span>
            </h2>
            <p
              style={{
                fontSize: 16,
                color: '#4a5a6a',
                maxWidth: 520,
                margin: '0 auto',
                fontFamily: FONT_DM,
                lineHeight: 1.7,
              }}
            >
              Parte da questão que você errou — não de um capítulo que você talvez precise.
            </p>
          </div>
        </FadeUp>

        {steps.map((step, index) => (
          <FadeUp key={step.num} delay={index * 0.08}>
            <div
              data-grid
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 56,
                alignItems: 'center',
                marginBottom: 72,
                ...(index % 2 !== 0 ? { direction: 'rtl' } : {}),
              }}
            >
              <div style={{ direction: 'ltr' }}>
                <span
                  style={{
                    fontSize: 72,
                    fontWeight: 800,
                    fontFamily: FONT_SORA,
                    color: `${step.glow}18`,
                    lineHeight: 1,
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  {step.num}
                </span>
                <h3
                  style={{
                    fontFamily: FONT_SORA,
                    fontWeight: 800,
                    fontSize: 26,
                    color: '#fff',
                    marginBottom: 14,
                    letterSpacing: '-.02em',
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: 16, color: '#5a6a7a', lineHeight: 1.78, fontFamily: FONT_DM }}>{step.body}</p>
              </div>
              <div style={{ direction: 'ltr' }}>
                <PhoneMockup
                  src={step.src}
                  alt={step.title}
                  glow={step.glow}
                  style={{ maxWidth: 300, margin: '0 auto' }}
                />
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

function Galeria() {
  const items: GaleriaItem[] = [
    { id: 'mapa-rcp', src: SS.conceptRcp, tipo: 'Mapa Conceitual', tema: 'RCP — estrutura molecular', glow: '#ff6b35' },
    { id: 'regra-aps', src: SS.goldenAps, tipo: 'Regra de Ouro', tema: 'APS — centro ordenador', glow: C.emerald },
    { id: 'fluxo-med', src: SS.flowMedicamento, tipo: 'Fluxo Lógico', tema: 'Administração de medicamento', glow: C.cyan },
    { id: 'fluxo-hipo', src: SS.flowHipodermo, tipo: 'Fluxo Lógico', tema: 'Hipodermóclise — via subcutânea', glow: C.emerald },
    {
      id: 'perigo-flebite',
      src: SS.dangerFlebite,
      tipo: 'Zona de Perigo',
      tema: 'Flebite — fatores de risco',
      glow: C.rose,
    },
    { id: 'fluxo-pcr', src: SS.flowPcr, tipo: 'Fluxo Lógico', tema: 'Parada cardiorrespiratória', glow: '#ff69b4' },
    { id: 'mapa-puerperio', src: SS.conceptPuerperio, tipo: 'Mapa Conceitual', tema: 'Puerpério — fases', glow: '#c084fc' },
    { id: 'mapa-periop', src: SS.conceptPeriop, tipo: 'Mapa Conceitual', tema: 'Perioperatório — fases', glow: '#a855f7' },
    { id: 'regra-rcp', src: SS.goldenRcp, tipo: 'Regra de Ouro', tema: 'RCP — regra de ouro', glow: '#f43f5e' },
  ];

  return (
    <section style={{ padding: '80px 28px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeUp>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.15em',
                color: C.emerald,
                marginBottom: 12,
                fontFamily: FONT_SORA,
              }}
            >
              16.000 NEUROSLIDES
            </p>
            <h2
              style={{
                fontFamily: FONT_SORA,
                fontWeight: 800,
                fontSize: 'clamp(22px,3vw,40px)',
                color: '#fff',
                letterSpacing: '-.03em',
              }}
            >
              Cada questão. 4 slides. Nenhum conteúdo de enfermeiro.
            </h2>
          </div>
        </FadeUp>

        <div
          data-grid-3
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}
        >
          {items.map((item, index) => (
            <FadeUp key={item.id} delay={index * 0.05}>
              <div
                style={{
                  borderRadius: 18,
                  overflow: 'hidden',
                  border: `1px solid ${item.glow}18`,
                  background: 'rgba(10,15,26,.8)',
                  cursor: 'default',
                  transition: 'transform .3s ease,box-shadow .3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `0 20px 50px ${item.glow}22`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Image
                  src={item.src}
                  alt={item.tema}
                  width={360}
                  height={280}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <div style={{ padding: '12px 16px' }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '.12em',
                      color: item.glow,
                      fontFamily: FONT_SORA,
                    }}
                  >
                    {item.tipo.toUpperCase()}
                  </span>
                  <p style={{ fontSize: 12, color: '#5a6a7a', marginTop: 3, fontFamily: FONT_DM }}>{item.tema}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function Objecoes() {
  const [open, setOpen] = useState<number | null>(null);
  const items: FaqItem[] = [
    {
      q: '"Já tentei o QConcursos e não consegui manter."',
      a: 'O QConcursos te dá questão. Não te explica por que você errou. Sem entender o erro, você resolve 200 questões e continua errando as mesmas. O Avant parte do erro — por isso leva 8 minutos, não 2 horas.',
    },
    {
      q: '"Trabalho em escala 12x36, não tenho tempo para estudar."',
      a: 'O Avant foi construído por um técnico que trabalha em escala. Cada sessão tem duração de 8 minutos — o tempo de uma pausa. No celular, sem precisar ligar o notebook. Uma questão por plantão já é mais do que zero.',
    },
    {
      q: '"Não é o mesmo conteúdo que tem nas apostilas?"',
      a: 'Não. Todo conteúdo foi filtrado pelas questões reais de concurso de técnico. Se um tema não cai na prova de técnico, ele não está no Avant. Você não estuda tabela de ATLS se a banca só pergunta a pontuação mínima da Glasgow.',
    },
    {
      q: '"Mais um curso que vou pagar e não terminar."',
      a: "O Avant não tem módulos para terminar. Você entra, resolve uma questão, vê 4 slides, e pronto. Pode parar aí. A próxima vez, mais uma questão. O progresso é questão a questão — não existe 'parar no meio do curso'.",
    },
  ];

  return (
    <section style={{ padding: '100px 28px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <FadeUp>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.15em',
              color: C.rose,
              marginBottom: 12,
              fontFamily: FONT_SORA,
            }}
          >
            SUAS DÚVIDAS, RESPONDIDAS
          </p>
          <h2
            style={{
              fontFamily: FONT_SORA,
              fontWeight: 800,
              fontSize: 'clamp(24px,3.5vw,42px)',
              color: '#fff',
              letterSpacing: '-.03em',
              lineHeight: 1.1,
              marginBottom: 40,
            }}
          >
            Antes de fechar essa aba,
            <br />
            leia isso.
          </h2>
        </FadeUp>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item, index) => (
            <FadeUp key={item.q} delay={index * 0.07}>
              <div
                style={{
                  borderRadius: 18,
                  overflow: 'hidden',
                  border: `1px solid ${open === index ? `${C.cyan}30` : 'rgba(255,255,255,.07)'}`,
                  background: 'rgba(15,23,42,.6)',
                  backdropFilter: 'blur(12px)',
                  transition: 'border-color .2s ease',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(open === index ? null : index)}
                  style={{
                    width: '100%',
                    padding: '22px 28px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#c4d0dd',
                      fontFamily: FONT_SORA,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.q}
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      color: open === index ? C.cyan : '#3a4a5a',
                      transition: 'transform .25s ease',
                      transform: open === index ? 'rotate(45deg)' : 'rotate(0)',
                      flexShrink: 0,
                    }}
                  >
                    +
                  </span>
                </button>
                {open === index && (
                  <div style={{ padding: '0 28px 22px' }}>
                    <p style={{ fontSize: 15, color: '#5a6a7a', lineHeight: 1.78, fontFamily: FONT_DM }}>{item.a}</p>
                  </div>
                )}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function Fundador() {
  return (
    <section style={{ padding: '100px 28px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <FadeUp>
          <div
            style={{
              borderRadius: 28,
              padding: '48px',
              background: 'rgba(15,23,42,.75)',
              border: `1px solid ${C.cyan}18`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 0 80px ${C.cyan}06`,
            }}
          >
            <div
              data-grid
              style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 36, alignItems: 'start' }}
            >
              {/* TODO: substituir emoji pela foto real do fundador (<Image />) */}
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: `linear-gradient(135deg,${C.cyan}30,${C.emerald}30)`,
                  border: `2px solid ${C.cyan}35`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 44,
                }}
              >
                👨‍⚕️
              </div>

              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '.12em',
                    color: C.cyan,
                    marginBottom: 14,
                    fontFamily: FONT_SORA,
                  }}
                >
                  POR QUE O AVANT EXISTE
                </p>
                <blockquote
                  style={{
                    fontSize: 19,
                    color: '#9aaabb',
                    lineHeight: 1.78,
                    fontFamily: FONT_DM,
                    margin: '0 0 24px',
                    fontStyle: 'italic',
                  }}
                >
                  &quot;Sou técnico de enfermagem. Fui estudar para concurso e percebi que todo material disponível
                  era feito para enfermeiro. Nível diferente, conteúdo diferente — e eu passava horas estudando coisas
                  que não caíam na minha prova. Criei o Avant porque esse produto não existia, e eu precisava dele.&quot;
                </blockquote>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#fff',
                    fontFamily: FONT_SORA,
                    marginBottom: 4,
                  }}
                >
                  Fundador do Avant
                </p>
                <p style={{ fontSize: 13, color: '#3a4a5a', fontFamily: FONT_DM }}>
                  Técnico de Enfermagem · Criador do método NeuroSlide
                </p>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function PovaSocial() {
  const stats: StatItem[] = [
    { n: '5.000+', l: 'questões reais de técnico', c: C.cyan },
    { n: '16.000+', l: 'NeuroSlides disponíveis', c: C.emerald },
    { n: '4', l: 'slides por questão — sempre', c: '#a855f7' },
  ];

  return (
    <section style={{ padding: '80px 28px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <FadeUp>
          <div
            style={{
              borderRadius: 24,
              padding: '48px',
              background: `linear-gradient(135deg,rgba(0,242,255,.05),rgba(0,255,136,.03))`,
              border: `1px solid ${C.cyan}15`,
            }}
          >
            <div
              data-grid-3
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 40,
                textAlign: 'center',
                marginBottom: 40,
              }}
            >
              {stats.map((stat) => (
                <div key={stat.l}>
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: 800,
                      fontFamily: FONT_SORA,
                      background: `linear-gradient(135deg,${stat.c},${stat.c}70)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginBottom: 8,
                      lineHeight: 1,
                    }}
                  >
                    {stat.n}
                  </div>
                  <div style={{ fontSize: 13, color: '#3a4a5a', fontFamily: FONT_DM }}>{stat.l}</div>
                </div>
              ))}
            </div>

            <div
              style={{
                borderRadius: 16,
                padding: '24px',
                background: 'rgba(0,0,0,.3)',
                border: '1px solid rgba(255,255,255,.05)',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 13, color: '#2a3a4a', fontFamily: FONT_DM, margin: 0 }}>
                Espaço para depoimento real — nome completo · cargo · concurso prestado · cidade. Um depoimento
                verdadeiro vale mais que cinco genéricos.
              </p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function Oferta() {
  const features: Array<[string, string, string]> = [
    ['✓', 'Mais de 5.000 questões reais de técnico de enfermagem', C.emerald],
    ['✓', '16.000 NeuroSlides — 4 por questão', C.emerald],
    ['✓', 'Fluxo Lógico · Regra de Ouro · Zona de Perigo · Mapa Conceitual', C.emerald],
    ['✓', 'Acesso no celular — sem baixar app', C.emerald],
    ['✓', 'Apenas conteúdo que cai na prova de técnico', C.emerald],
  ];

  return (
    <section style={{ padding: '100px 28px 160px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 660, margin: '0 auto', textAlign: 'center' }}>
        <FadeUp>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.15em',
              color: C.emerald,
              marginBottom: 14,
              fontFamily: FONT_SORA,
            }}
          >
            COMECE HOJE
          </p>
          <h2
            style={{
              fontFamily: FONT_SORA,
              fontWeight: 800,
              fontSize: 'clamp(26px,4vw,50px)',
              color: '#fff',
              letterSpacing: '-.035em',
              lineHeight: 1.1,
              marginBottom: 18,
            }}
          >
            Estude a primeira questão
            <br />
            <span
              style={{
                background: `linear-gradient(135deg,${C.cyan},${C.emerald})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              agora, de graça.
            </span>
          </h2>
          <p
            style={{
              fontSize: 17,
              color: '#3a4a5a',
              lineHeight: 1.72,
              fontFamily: FONT_DM,
              marginBottom: 40,
            }}
          >
            Você não precisa decidir nada agora. Acesse, resolva uma questão real, veja os 4 NeuroSlides. Se não
            pensar <em style={{ color: '#7a8a9a' }}>&quot;era isso que eu tava errando&quot;</em>, não precisa continuar.
          </p>

          <div
            style={{
              borderRadius: 24,
              padding: '40px',
              background: 'rgba(15,23,42,.8)',
              border: `1px solid ${C.cyan}20`,
              backdropFilter: 'blur(16px)',
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginBottom: 32,
                textAlign: 'left',
              }}
            >
              {features.map(([icon, text, color]) => (
                <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 14, color: '#6a7a8a', fontFamily: FONT_DM, lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                marginBottom: 28,
                paddingTop: 24,
                borderTop: '1px solid rgba(255,255,255,.05)',
              }}
            >
              <span style={{ fontSize: 13, color: '#2a3a4a', fontFamily: FONT_DM }}>Acesso completo por</span>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  fontFamily: FONT_SORA,
                  background: `linear-gradient(135deg,${C.cyan},${C.emerald})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                }}
              >
                R$ 9,90<span style={{ fontSize: 28 }}>/mês</span>
              </div>
              <p style={{ fontSize: 12, color: '#2a3a4a', fontFamily: FONT_DM, marginTop: 6 }}>
                Cancela quando quiser. Sem multa. Sem fidelidade.
              </p>
            </div>

            <Link
              href="/register"
              style={{
                display: 'block',
                width: '100%',
                padding: '18px',
                borderRadius: 16,
                fontSize: 17,
                fontWeight: 800,
                textDecoration: 'none',
                textAlign: 'center',
                fontFamily: FONT_SORA,
                color: '#000',
                background: `linear-gradient(135deg,${C.cyan},${C.emerald})`,
                boxShadow: `0 0 56px ${C.cyan}50`,
                transition: 'transform .18s',
              }}
            >
              Quero estudar do jeito certo →
            </Link>
            <p style={{ marginTop: 12, fontSize: 12, color: '#1a2a3a', fontFamily: FONT_DM }}>
              Plano gratuito: 1 questão grátis/dia. Sem cartão para começar.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '28px',
        borderTop: '1px solid rgba(255,255,255,.04)',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontFamily: FONT_SORA,
          fontWeight: 800,
          fontSize: 18,
          background: `linear-gradient(135deg,${C.cyan},${C.emerald})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        AVANT
      </span>
      <p style={{ fontSize: 12, color: '#1a2a3a', marginTop: 6, fontFamily: FONT_DM }}>
        Feito por técnico de enfermagem para técnico de enfermagem.
      </p>
    </footer>
  );
}

export default function AvantLP() {
  return (
    <div
      className={`${sora.className} ${dmSans.className}`}
      style={{ fontFamily: FONT_DM, background: C.bg, minHeight: '100vh', overflowX: 'hidden' }}
    >
      <style dangerouslySetInnerHTML={{ __html: LP_STYLES }} />
      <Bg />
      <PublicDarkSiteHeader
        ctaLabel="Começar grátis"
        ctaLabelShort="Grátis"
        ctaLabelTight="Começar grátis →"
      />
      <Hero />
      <Problema />
      <Mecanismo />
      <Galeria />
      <Objecoes />
      <Fundador />
      <PovaSocial />
      <Oferta />
      <Footer />
    </div>
  );
}
