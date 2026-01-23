import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // --- CORES CYBER CLINICAL ---
        clinical: {
          dark: "#010409",      // Preto OLED profundo
          card: "#0d1117",      // Card estilo GitHub Dark
          accent: "#00f2ff",    // Cyan Elétrico Neon
          success: "#00ff88",   // Verde Esmeralda Neon
          error: "#ff0055",     // Rosa Choque/Alerta
          muted: "#8b949e",
        },
        primary: { DEFAULT: "#00f2ff", foreground: "#010409" },
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 242, 255, 0.3)',
        'neon-green': '0 0 25px rgba(0, 255, 136, 0.4)',
        'neon-red': '0 0 25px rgba(255, 0, 85, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.2s ease-in-out 0s 2',
        'pop': 'pop 0.3s cubic-bezier(0.26, 0.53, 0.74, 1.48) forwards',
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        }
      },
      backgroundImage: {
        'circuit-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M10 10 L90 10 L90 90 L10 90 Z' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='10' cy='10' r='2' fill='white'/%3E%3C/svg%3E\")",
      },
      maskImage: {
        'radial-fade': 'radial-gradient(circle, black 30%, transparent 80%)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    // Cores Neon Dinâmicas (para suportar classes geradas em runtime)
    'bg-cyan-500/10',
    'bg-cyan-500/30',
    'bg-cyan-500/50',
    'border-cyan-500',
    'text-cyan-400',
    'bg-orange-500/10',
    'bg-orange-500/30',
    'bg-orange-500/50',
    'border-orange-500',
    'text-orange-400',
    'bg-fuchsia-500/10',
    'bg-fuchsia-500/30',
    'bg-fuchsia-500/50',
    'border-fuchsia-500',
    'text-fuchsia-400',
    'bg-lime-500/10',
    'bg-lime-500/30',
    'bg-lime-500/50',
    'border-lime-500',
    'text-lime-400',
    'bg-red-500/10',
    'bg-red-500/30',
    'bg-red-500/50',
    'border-red-500',
    'text-red-400',
    // Glow effects
    'shadow-[0_0_30px_rgba(34,211,238,0.3)]',
    'shadow-[0_0_50px_rgba(34,211,238,0.6)]',
    'shadow-[0_0_30px_rgba(249,115,22,0.3)]',
    'shadow-[0_0_50px_rgba(249,115,22,0.6)]',
    'shadow-[0_0_30px_rgba(232,121,249,0.3)]',
    'shadow-[0_0_50px_rgba(232,121,249,0.6)]',
    'shadow-[0_0_30px_rgba(190,242,100,0.3)]',
    'shadow-[0_0_50px_rgba(190,242,100,0.6)]',
    'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
    'shadow-[0_0_50px_rgba(239,68,68,0.6)]',
  ],
} satisfies Config

export default config