import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { validateAllEnv } from "@/lib/env";
import { TextSizeProvider } from "@/components/providers/TextSizeProvider";
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

// URL base para metadata (Open Graph, Twitter, etc.)
const getMetadataBase = () => {
  // Em produção, usar variável de ambiente ou detectar automaticamente
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return new URL(process.env.NEXT_PUBLIC_BASE_URL);
  }
  // Em desenvolvimento, usar localhost
  if (process.env.NODE_ENV === 'development') {
    return new URL('http://localhost:3000');
  }
  // Fallback: tentar detectar da URL atual (se disponível)
  return new URL('https://www.avant.enf.br');
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "AVANT - Plataforma de Estudo Reverso para Técnicos de Enfermagem",
  description:
    "Plataforma gratuita de estudo reverso para Técnicos de Enfermagem. Prepare-se para EBSERH, prefeituras e concursos com método, vitrine de assuntos e acompanhamento de desempenho.",
  keywords: [
    "técnico de enfermagem",
    "estudo reverso",
    "concursos enfermagem",
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
    description:
      "Plataforma gratuita de estudo reverso para Técnicos de Enfermagem. EBSERH, prefeituras e concursos.",
    type: "website",
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
        <TextSizeProvider>{children}</TextSizeProvider>
      </body>
    </html>
  );
}

