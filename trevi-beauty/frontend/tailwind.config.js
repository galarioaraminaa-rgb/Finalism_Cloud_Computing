/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        accent: ['"Cormorant Garamond"', 'serif'],
      },
      colors: {
        // New Trevi Beauty palette
        // blush = warm peach/apricot tones derived from the new palette
        blush: {
          50:  '#FFF2DB',   // lightest cream
          100: '#FBE4C4',   // soft champagne
          200: '#FAE3D9',   // warm blush
          300: '#FDD8CC',   // peach blush
          400: '#E7C485',   // golden amber
          500: '#d4a55a',   // deeper gold
          600: '#b8863b',   // warm brown-gold
          700: '#8c6228',   // deep amber
          800: '#614219',   // dark caramel
          900: '#3d280a',   // deep brown
        },
        // rose = warm brown/caramel tones for dark text
        rose: {
          50:  '#FFF2DB',
          100: '#FBE4C4',
          200: '#FAE3D9',
          300: '#e8c9a8',
          400: '#c8966a',
          500: '#a06840',
          600: '#7a4a28',
          700: '#5a3318',
          800: '#3e220d',
          900: '#2a1508',
          950: '#1a0d04',
        },
        // champagne = accent warm tones
        champagne: {
          50:  '#FFF2DB',
          100: '#FBE4C4',
          200: '#FAE3D9',
          300: '#FDD8CC',
          400: '#E7C485',
          500: '#d4a55a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      }
    },
  },
  plugins: [],
}
