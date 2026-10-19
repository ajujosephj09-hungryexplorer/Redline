import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1e293b',
        severity: {
          critical: '#dc2626',
          moderate: '#f59e0b',
          clear: '#16a34a',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
} satisfies Config

