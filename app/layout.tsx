import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { validateAllEnv } from "@/lib/env";
import { JsonLd, type JsonLdObject } from "@/components/seo/JsonLd";
import { RegisterServiceWorker } from "@/components/pwa/RegisterServiceWorker";
import { GlobalErrorListeners } from "@/components/monitoring/GlobalErrorListeners";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/siteUrl";
import { BRAND_NAME } from "@/lib/brand/brandName";

// Validar variáveis de ambiente no startup (apenas no servidor)
if (typeof window === 'undefined') {
  try {
    validateAllEnv();
  } catch (error) {
    // Em desenvolvimento, mostrar erro claramente
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
    // Em produção, logar mas não quebrar (pode ser que esteja usando variáveis do Vercel)
    // O erro será capturado pelo health check
  }
}

const inter = Inter({ subsets: ["latin"] });

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = getSiteUrl();
const siteName = BRAND_NAME;
const siteDescription =
  "Questão real, diagnóstico do erro e NeuroSlides que ensinam exatamente o que você errou. Prepare-se para EBSERH, prefeituras e concursos de Técnico de Enfermagem.";

const siteStructuredData: JsonLdObject[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: siteName,
    url: siteUrl.toString(),
    description: siteDescription,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteName,
    url: siteUrl.toString(),
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    description: siteDescription,
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
    },
  },
];

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: `${BRAND_NAME} - Plataforma de Estudo Reverso para Técnicos de Enfermagem`,
  description: siteDescription,
  alternates: {
    canonical: '/',
  },
  keywords: [
    "técnico de enfermagem",
    "estudo reverso",
    "concursos enfermagem",
    "questões comentadas enfermagem",
    "ebserh",
    "prefeituras",
    "fundamentos de enfermagem",
    "coren",
    "questões enfermagem",
    "simulados técnico enfermagem",
  ],
  authors: [{ name: BRAND_NAME }],
  openGraph: {
    title: `${BRAND_NAME} - Plataforma de Estudo Reverso para Técnicos de Enfermagem`,
    description: siteDescription,
    url: getAbsoluteUrl('/'),
    siteName,
    locale: 'pt_BR',
    type: "website",
    images: [
      {
        url: '/brand/avant-logo-cover.png',
        width: 1536,
        height: 1024,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_NAME} - Estudo reverso para concursos de Enfermagem`,
    description: siteDescription,
    images: ['/brand/avant-logo-cover.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteName,
  },
  applicationName: siteName,
};

/** Celular: notch, barra de endereço, safe-area iOS, PWA */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f1f5f9' },
    { media: '(prefers-color-scheme: dark)', color: '#f1f5f9' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.className} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${dmSans.variable}`}
        suppressHydrationWarning
      >
        <JsonLd data={siteStructuredData} />
        <RegisterServiceWorker />
        <GlobalErrorListeners />
        {children}
      </body>
    </html>
  );
}

