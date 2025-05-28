/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'venice-red': '#ff3333',
        'venice-light': '#ff4d4d',
        'venice-dark': '#e60000',
        gray: {
          750: '#2D3748',
          850: '#1A202C',
        },
      },
      animation: {
        scanMove: 'scanMove 2s ease-in-out infinite',
        scanPulse: 'scanPulse 2s infinite',
        modalFade: 'modalFade 0.2s ease-out',
      },
      keyframes: {
        scanMove: {
          '0%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(-100%)' }
        },
        scanPulse: {
          '0%, 100%': { opacity: 0 },
          '50%': { opacity: 1 },
        },
        modalFade: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};