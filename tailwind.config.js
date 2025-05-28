/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'venice-red': '#ff3333',
        'venice-light': '#ff4d4d',
        'venice-dark': '#e60000',
        // New Venice Palette
        'venice-white': '#fdfcf8',
        'venice-cream': '#f3f0e7',
        'venice-off-cream': '#f2eee2',
        'venice-beige': '#ece8da',
        'venice-stone': '#b1a993',
        'venice-olive-brown': '#3f3a26',
        'venice-dark-olive': '#5c5330',
        'venice-deep-olive': '#5a4d14',
        'venice-bright-red': '#ea463b',
        'venice-muted-red': '#d94f38',
        'venice-peach': '#f4b2a2',
        'venice-coral': '#f47c63',
        // Existing gray shades
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