/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
      heading: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      'heading-xxl': ['clamp(2.625rem, 5.4vw, 5rem)',      { lineHeight: '1.02', letterSpacing: '-0.035em', fontWeight: '400' }],
      'heading-xl':  ['clamp(2.5rem, 5vw, 4.5rem)',        { lineHeight: '1.02', letterSpacing: '-0.035em', fontWeight: '400' }],
      'heading-lg':  ['clamp(2.125rem, 4.2vw, 3.75rem)',   { lineHeight: '1.04', letterSpacing: '-0.035em', fontWeight: '400' }],
      'heading-md':  ['clamp(2rem, 3.8vw, 3.375rem)',      { lineHeight: '1.06', letterSpacing: '-0.03em',  fontWeight: '400' }],
      'heading-sm':  ['clamp(1.75rem, 4vw, 3rem)',         { lineHeight: '1.06', letterSpacing: '-0.03em',  fontWeight: '400' }],
      'heading-xs':  ['clamp(1.375rem, 1.9vw, 1.625rem)',  { lineHeight: '1.15', letterSpacing: '-0.02em',  fontWeight: '400' }],

      'subtitle-lg': ['clamp(1.25rem, 1.8vw, 1.5rem)',     { lineHeight: '1.35', letterSpacing: '-0.01em',  fontWeight: '300' }],
      'subtitle-md': ['clamp(1.125rem, 1.6vw, 1.3125rem)', { lineHeight: '1.6',  letterSpacing: '0',        fontWeight: '400' }],
      'subtitle-sm': ['clamp(0.9375rem, 1.3vw, 1.125rem)', { lineHeight: '1.55', letterSpacing: '0',        fontWeight: '400' }],

      'body-lg': ['1.0625rem', { lineHeight: '1.75', letterSpacing: '0', fontWeight: '400' }],
      'body-md': ['1rem',      { lineHeight: '1.65', letterSpacing: '0', fontWeight: '400' }],
      'body-sm': ['0.9375rem', { lineHeight: '1.6',  letterSpacing: '0', fontWeight: '400' }],
      'body-xs': ['0.875rem',  { lineHeight: '1.5',  letterSpacing: '0', fontWeight: '400' }],

      'caption-md': ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '400' }],
      'caption-sm': ['0.75rem',   { lineHeight: '1.4', letterSpacing: '0', fontWeight: '400' }],
      'caption-xs': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '400' }],
    },
    borderRadius: {
      none: '0px',
      full: '9999px',
    },
    extend: {
      colors: {
        semantics: {
          success: { dark: '#267C35', DEFAULT: '#37B24D', lightest: '#EBF7ED' },
          alert:   { dark: '#CA7900', DEFAULT: '#FC9700', lightest: '#FFF4D8' },
          error:   { dark: '#8C1D1D', DEFAULT: '#EB0E0E', lightest: '#F9EBEA' },
        },

        ink: '#1D1D1B',
        stone: {
          800: '#3A3A36',
          600: '#6B6A66',
          500: '#7C7B78',
          400: '#B0AFAA',
          300: '#D9D6CF',
          200: '#E4E0D8',
          150: '#EEEAE3',
          100: '#F0F0EC',
          50:  '#FAFAF5',
        },
        sage: {
          900: '#2E3A33',
          700: '#4E5E55',
          600: '#556555',
          500: '#718471',
          300: '#B0BAA8',
          100: '#DCE2D5',
        },
        clay: {
          800: '#5E4F3F',
          600: '#8C7A66',
          300: '#D8C9B8',
          100: '#E8DDCF',
        },
        blush: '#F2EDE9',

        surface: {
          DEFAULT: '#FAFAF5',
          raised:  '#FFFFFF',
          sunken:  '#EEEAE3',
        },
        content: {
          DEFAULT: '#1D1D1B',
          muted:   '#3A3A36',
          subtle:  '#6B6A66',
          inverse: '#FAFAF5',
        },
        line: {
          DEFAULT: '#E4E0D8',
          strong:  '#D9D6CF',
        },
        accent: '#2E3A33',
      },
      maxWidth: {
        container:        '1440px',
        'container-lg':   '1200px',
        'container-text': '760px',
      },
      spacing: {
        gutter:       'clamp(1.25rem, 5vw, 4.5rem)',
        section:      'clamp(4rem, 9vw, 7.5rem)',
        'section-sm': 'clamp(2.5rem, 5vw, 4rem)',
        'section-lg': 'clamp(4.5rem, 10vw, 8.75rem)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
