/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        panel: v('panel'),
        panel2: v('panel2'),
        line: v('line'),
        ink: v('ink'),
        muted: v('muted'),
        accent: v('accent'),
        m5: v('m5'),
        m6: v('m6'),
        m7: v('m7'),
        m8: v('m8'),
        good: v('good'),
        bad: v('bad'),
        warn: v('warn'),
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 rgb(var(--line) / 0.6), 0 8px 30px -12px rgb(0 0 0 / 0.25)',
      },
    },
  },
  plugins: [],
};
