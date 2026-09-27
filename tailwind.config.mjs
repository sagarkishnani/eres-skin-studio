/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
      heading: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      'heading-xxl': ['clamp(2.5rem, 5vw + 1rem, 4.25rem)',        { lineHeight: '1.1',  fontWeight: '500' }],
      'heading-xl':  ['clamp(2.25rem, 4.75vw + 0.75rem, 3.75rem)', { lineHeight: '1.1',  fontWeight: '500' }],
      'heading-lg':  ['clamp(2rem, 4.25vw + 0.5rem, 3.375rem)',    { lineHeight: '1.12', fontWeight: '500' }],
      'heading-md':  ['clamp(1.875rem, 3.5vw + 0.5rem, 3rem)',     { lineHeight: '1.14', fontWeight: '500' }],
      'heading-sm':  ['clamp(1.625rem, 3vw + 0.5rem, 2.5rem)',     { lineHeight: '1.16', fontWeight: '500' }],
      'heading-xs':  ['clamp(1.5rem, 2.25vw + 0.5rem, 2.125rem)',  { lineHeight: '1.2',  fontWeight: '500' }],

      'subtitle-lg': ['clamp(1.75rem, 2.5vw + 0.5rem, 2.375rem)',  { lineHeight: '1.1',  fontWeight: '500' }],
      'subtitle-md': ['clamp(1.5rem, 1.75vw + 0.5rem, 1.75rem)',   { lineHeight: '1.25', fontWeight: '500' }],
      'subtitle-sm': ['clamp(1.25rem, 1.25vw + 0.4rem, 1.375rem)', { lineHeight: '1.25', fontWeight: '500' }],

      'body-lg': ['20px', { lineHeight: '32px', fontWeight: '400' }],
      'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
      'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],

      'caption-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
    },
    extend: {
      colors: {
        brand: {
          primary: {
            darkest:  '#171D1A',
            dark:     '#232C26',
            DEFAULT:  '#2E3A33',
            light:    '#718471',
            lightest: '#DCE2D5',
          },
        },
        semantics: {
          success: { dark: '#267C35', DEFAULT: '#37B24D', lightest: '#EBF7ED' },
          alert:   { dark: '#CA7900', DEFAULT: '#FC9700', lightest: '#FFF4D8' },
          error:   { dark: '#8C1D1D', DEFAULT: '#EB0E0E', lightest: '#F9EBEA' },
        },
        greyscale: {
          darkest:  '#16181D',
          dark:     '#3F3F3F',
          DEFAULT:  '#717274',
          light:    '#E5E7EB',
          lightest: '#F2F3F5',
          white:    '#FFFFFF',
        },

        surface: {
          DEFAULT: '#FFFFFF',
          raised:  '#F7F8FA',
        },
        content: {
          DEFAULT: '#16181D',
          muted:   '#4B5563',
          subtle:  '#6B7280',
        },
        line: {
          DEFAULT: '#E5E7EB',
          strong:  '#CBD1D9',
        },
        /* Brand color readable on the page background; use text-accent, not a brand-primary step. */
        accent: '#232C26',
      },
      borderRadius: {
        sm: '4px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px',
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
