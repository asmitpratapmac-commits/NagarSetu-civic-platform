/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Explicit, deliberate palette (do not add blue hues here)
        surface: {
          DEFAULT: '#FAF8F3', // warm off-white background
          raised: '#FFFFFF',
          sunken: '#F1EEE6',
        },
        stone: {
          50: '#FAF9F6',
          100: '#F1EEE6',
          200: '#E4E0D5',
          300: '#CFC9B8',
          400: '#A9A28C',
          500: '#847C64',
          600: '#645D4A',
          700: '#4A4536',
          800: '#332F24',
          900: '#211E16',
        },
        char: {
          950: '#12140F',
          900: '#181B15',
          800: '#22261D',
          700: '#2E3327',
          600: '#3D4434',
        },
        emerald: {
          50: '#EAF6EE',
          100: '#CFEBD8',
          200: '#A0D7B2',
          300: '#6FC08C',
          400: '#469F6A',
          500: '#2E8055', // primary brand
          600: '#226644',
          700: '#1B5236',
          800: '#153F29',
          900: '#102E1E',
        },
        mint: {
          50: '#F1FAF4',
          100: '#DCF2E3',
          200: '#B7E4C7',
          300: '#8FD3A9',
          400: '#68C08D',
        },
        amber: {
          50: '#FDF4E4',
          100: '#FAE3B8',
          200: '#F3C879',
          300: '#E8A33D',
          400: '#C9812A',
          500: '#A5661F',
        },
        rust: {
          400: '#B0503A',
          500: '#8F3D2B',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(18,20,15,0.04), 0 1px 12px rgba(18,20,15,0.05)',
        raised: '0 4px 24px rgba(18,20,15,0.08)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
