/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        sidebar: '#121214',
        accent: '#0284c7',
        border: '#27272a',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        muted: '#a1a1aa',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
