/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/**/*.{ts,tsx}',
    './packages/shared/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
