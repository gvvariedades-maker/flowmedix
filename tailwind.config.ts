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
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config