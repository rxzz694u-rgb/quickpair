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
          DEFAULT: '#FF5B37', // Vibrant Sunset Coral (from inspiration images)
          hover: '#FF451D',
          light: 'var(--accent-light)',
          lilac: '#8B5CF6',
          yellow: '#F59E0B',
          cyan: '#0EA5E9',
        },
        coral: {
          50: '#FFF5F2',
          100: '#FFE9E4',
          500: '#FF5B37',
          600: '#FF451D',
          700: '#E03610',
        },
        lilac: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 10px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'pill': '0 8px 30px -4px rgba(0, 0, 0, 0.05), 0 4px 12px -2px rgba(0, 0, 0, 0.02)',
        'squircle': '0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'coral-glow': '0 10px 25px -3px rgba(255, 91, 55, 0.35), 0 4px 10px -2px rgba(255, 91, 55, 0.2)',
        'lilac-glow': '0 10px 25px -3px rgba(139, 92, 246, 0.35), 0 4px 10px -2px rgba(139, 92, 246, 0.2)',
        'sheet': '0 -10px 40px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'composer': '24px',
        'squircle': '22px',
        'btn': '14px',
        'pill': '9999px',
        'item': '16px',
      }
    },
  },
  plugins: [],
}
