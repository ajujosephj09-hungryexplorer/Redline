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
    },
  },
  plugins: [],
} satisfies Config

