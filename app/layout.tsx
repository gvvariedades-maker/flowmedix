import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { validateAllEnv } from "@/lib/env";
import { JsonLd, type JsonLdObject } from "@/components/seo/JsonLd";
import { TextSizeProvider } from "@/components/providers/TextSizeProvider";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/siteUrl";
import { buildTextSizeInitScript } from "@/lib/textSizePreference";

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

const siteUrl = getSiteUrl();
const siteName = "AVANT";
const siteDescription =
  "Estudo reverso para Técnicos de Enfermagem. Prepare-se para EBSERH, prefeituras e concursos com questões reais, diagnóstico de erro e revisão inteligente.";

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
  title: "AVANT - Plataforma de Estudo Reverso para Técnicos de Enfermagem",
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
  authors: [{ name: "AVANT" }],
  openGraph: {
    title: "AVANT - Plataforma de Estudo Reverso para Técnicos de Enfermagem",
    description: siteDescription,
    url: getAbsoluteUrl('/'),
    siteName,
    locale: 'pt_BR',
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: "AVANT - Estudo reverso para concursos de Enfermagem",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

/** Celular: notch, barra de endereço, safe-area iOS */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8fafc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Script
          id="avant-text-size-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: buildTextSizeInitScript() }}
        />
        <JsonLd data={siteStructuredData} />
        <TextSizeProvider>{children}</TextSizeProvider>
      </body>
    </html>
  );
}

