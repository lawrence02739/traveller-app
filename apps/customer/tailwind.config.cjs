module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/shared/src/**/*.{ts,tsx}',
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          soft: 'var(--color-primary-soft)',
          strong: 'var(--color-primary-strong)',
          on: 'var(--color-on-primary)',
        },
        secondary: '#1B1B1B',
        page: 'var(--color-page-bg)',
        panel: {
          DEFAULT: 'var(--color-panel-bg)',
          muted: 'var(--color-panel-muted)',
        },
        border: 'var(--color-border)',
        title: 'var(--color-title)',
        body: 'var(--color-body)',
        subtle: 'var(--color-subtle)',
      },
      fontSize: {
        '2xs': ['0.7rem', '0.85rem'],
        'xs': ['0.8rem', '1.1rem'],
        'sm': ['0.95rem', '1.35rem'],
        'base': ['1.1rem', '1.6rem'],
        'lg': ['1.25rem', '1.85rem'],
        'xl': ['1.4rem', '2rem'],
        '2xl': ['1.75rem', '2.25rem'],
        '3xl': ['2.25rem', '2.75rem'],
        '4xl': ['3rem', '3.5rem'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
        premium: '0 20px 50px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl2': '1.25rem',
        'xl3': '2rem',
      },
    },
  },
  plugins: [],
};
