/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080b11',
        panel: 'rgba(17, 22, 34, 0.65)',
        card: 'rgba(30, 41, 59, 0.3)',
        border: 'rgba(255, 255, 255, 0.06)',
        accent: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          glow: 'rgba(99, 102, 241, 0.25)',
          subtle: 'rgba(99, 102, 241, 0.08)',
        },
        success: {
          DEFAULT: '#10b981',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.15)',
        },
        danger: '#ef4444',
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px',
      },
      backdropBlur: {
        panel: '16px',
        header: '20px',
      },
      boxShadow: {
        accent: '0 4px 20px rgba(99, 102, 241, 0.25)',
        'accent-sm': '0 0 10px rgba(99, 102, 241, 0.15)',
        warning: '0 4px 20px rgba(245, 158, 11, 0.15)',
      },
    },
  },
  plugins: [],
};
