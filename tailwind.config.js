/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff0f8',
          100: '#ffe0f3',
          200: '#ffc0e8',
          300: '#ff8fd5',
          400: '#ff4db8',
          500: '#f72585',
          600: '#e0006e',
          700: '#b8005b',
          800: '#960050',
          900: '#7a0045',
          950: '#4d0029',
        },
        purple: {
          50:  '#f5f0ff',
          100: '#ede0ff',
          200: '#dac0ff',
          300: '#bf8fff',
          400: '#a050ff',
          500: '#7209b7',
          600: '#6007a0',
          700: '#500585',
          800: '#3f046b',
          900: '#2d0350',
          950: '#1a0030',
        },
        dark: {
          50:  '#2a0040',
          100: '#220035',
          200: '#1a0028',
          300: '#13001e',
          400: '#0d0015',
          500: '#08000e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0d0015 0%, #1a0028 40%, #2d003a 100%)',
        'pink-glow': 'radial-gradient(ellipse at center, rgba(247,37,133,0.15) 0%, transparent 70%)',
        'purple-glow': 'radial-gradient(ellipse at center, rgba(114,9,183,0.2) 0%, transparent 70%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)',
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'scroll-right': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        'scroll-left': 'scroll-left 30s linear infinite',
        'scroll-left-slow': 'scroll-left 45s linear infinite',
        'scroll-right': 'scroll-right 35s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      boxShadow: {
        'glow-pink': '0 0 30px rgba(247, 37, 133, 0.4)',
        'glow-purple': '0 0 30px rgba(114, 9, 183, 0.4)',
        'glow-sm': '0 0 15px rgba(247, 37, 133, 0.3)',
        'card': '0 25px 50px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
