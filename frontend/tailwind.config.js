/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0c',
        sidebar: '#111114',
        accent: '#3b82f6',
        danger: '#ef4444',
        success: '#22c55e',
        muted: '#71717a',
        border: '#1f1f23',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
