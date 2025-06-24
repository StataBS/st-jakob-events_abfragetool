import plugin from 'tailwindcss/plugin'
import COLORS from './tailwind/colors'

const fontSize = {
  '9xl': ['128px', '128px'],
  '8xl': ['96px', '96px'],
  '7xl': ['72px', '72px'],
  '6xl': ['60px', '60px'],
  '5xl': ['48px', '48px'],
  '4xl': ['36px', '40px'],
  '3xl': ['30px', '34px'],
  '2xl': ['24px', '32px'],
  xl: ['20px', '28px'],
  lg: ['18px', '24px'],
  base: ['16px', '22px'],
  sm: ['14px', '20px'],
  xs: ['12px', '18px'],
}

const colors = Object.keys(COLORS).reduce<Record<string, string>>(
  (acc, color) => {
    const shades = COLORS[color]
    Object.entries(shades).forEach(([shade, hex]) => {
      acc[color + '-' + shade] = hex
    })
    return acc
  },
  {},
)

export default {
  content: [
    './components/**/*.{vue,ts,js}',
    './pages/**/*.{vue,ts,js}',
    './layouts/**/*.{vue,ts,js}',
    './helpers/**/*.{vue,ts,js}',
    './stories/**/*.{vue,ts,js}',
  ],
  safelist: ['h-0', 'sbdocs'],
  plugins: [
    /**
     * Various additional variants
     */
    plugin(function ({ addVariant }) {
      addVariant(
        'mobile-only',
        "@media screen and (max-width: theme('screens.md'))",
      )
      addVariant('not-last', '&:not(:last-child)')
      addVariant('not-first', '&:not(:first-child)')
    }),
  ],
  corePlugins: {
    textOpacity: false,
    container: false,
  },
  theme: {
    screens: {
      md: '768px',
      lg: '1024px',
      xl: '1210px',
      xxl: '2050px',
      xxxl: '3200px',
    },
    spacing: {
      220: '220px',
      140: '140px',
      120: '120px',
      100: '100px',
      90: '90px',
      80: '80px',
      70: '70px',
      60: '60px',
      50: '50px',
      40: '40px',
      30: '30px',
      25: '25px',
      20: '20px',
      15: '15px',
      10: '10px',
      5: '5px',
      3: '3px',
      2: '2px',
      1: '1px',
      0: '0px',
    },
    borderWidth: {
      DEFAULT: '1px',
      0: '0',
      2: '2px',
      3: '3px',
      4: '4px',
    },
    maxWidth: {
      reduced: '970px',
      // @todo: Consolidate sizing with container, max-width and other layout classes.
      prose: '836px',
      hero: '560px',
    },
    lineHeight: {
      none: 1,
      tight: 1.2,
      snug: 1.3,
      normal: 1.4,
    },
    fontSize,
    fontFamily: {
      sans: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
    borderRadius: {
      none: '0px',
      full: '9999px',
      large: '10px',
      DEFAULT: '4px',
    },
    colors: {
      // Monochrome colors.
      white: '#ffffff',
      current: 'currentColor',
      transparent: 'transparent',
      body: 'black',
      ...colors,

      // The dynamic CSS variable based primary color which is overriden by the Bettingen site at runtime.
      primary: {
        50: 'rgb(var(--color-primary-50) / <alpha-value>)',
        100: 'rgb(var(--color-primary-100) / <alpha-value>)',
        200: 'rgb(var(--color-primary-200) / <alpha-value>)',
        300: 'rgb(var(--color-primary-300) / <alpha-value>)',
        400: 'rgb(var(--color-primary-400) / <alpha-value>)',
        500: 'rgb(var(--color-primary-500) / <alpha-value>)',
        600: 'rgb(var(--color-primary-600) / <alpha-value>)',
        700: 'rgb(var(--color-primary-700) / <alpha-value>)',
        800: 'rgb(var(--color-primary-800) / <alpha-value>)',
        900: 'rgb(var(--color-primary-900) / <alpha-value>)',
      },
    },
    extend: {
      gap: {
        DEFAULT: '20px',
      },
      transitionDuration: {
        250: '250ms',
      },
      boxShadow: {
        'purple-600': '0 0 10px 0 #9156B4',
      },
    },
  },
}
