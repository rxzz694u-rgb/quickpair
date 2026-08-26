/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-page)',
        card: 'var(--bg-card)',
        subtle: 'var(--bg-subtle)',
        hover: 'var(--bg-hover)',
        text: {
          primary: 'var(--text-main)',
          secondary: 'var(--text-muted)',
          muted: 'var(--text-subtle)',
        },
        border: {
          DEFAULT: 'var(--border-main)',
          light: 'var(--border-light)',
        },
        accent: {
          DEFAULT: '#10B981', // Clean subtle emerald
          hover: '#059669',
          light: 'var(--accent-light)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'sheet': '0 -8px 30px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'composer': '16px',
        'btn': '11px',
        'sm-btn': '8px',
        'item': '12px',
      }
    },
  },
  plugins: [],
}
