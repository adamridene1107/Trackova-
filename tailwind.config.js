export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Clash Display', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      animation: {
        'fade-up':    'fadeUp 0.32s ease forwards',
        'fade-in':    'fadeIn 0.22s ease forwards',
        'float':      'float 6s ease-in-out infinite',
        'pop':        'pop 0.18s ease',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:    { from: { opacity:'0', transform:'translateY(14px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        fadeIn:    { from: { opacity:'0' }, to: { opacity:'1' } },
        float:     { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-7px)' } },
        pop:       { '0%,100%': { transform:'scale(1)' }, '50%': { transform:'scale(1.12)' } },
        glowPulse: { '0%,100%': { opacity:'0.5' }, '50%': { opacity:'1' } },
        shimmer:   { '0%': { backgroundPosition:'-200% 0' }, '100%': { backgroundPosition:'200% 0' } },
      },
      boxShadow: {
        'glow-brand': '0 0 40px rgba(99,102,241,0.28)',
        'glow-soft':  '0 0 60px rgba(99,102,241,0.15)',
        'premium':    '0 32px 80px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset',
      },
      backgroundImage: {
        'grid-dark': 'radial-gradient(rgba(99,102,241,0.12) 1px, transparent 1px)',
        'noise':     "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
