/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ice': '#F5F5F5',
        'neon-cyan': '#00FFFF',
      },
      fontFamily: {
        'sans': ['Bebas Neue', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'walk-bear': 'walk-bear 20s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'walk-bear': {
          '0%': { transform: 'translateX(-10vw)' },
          '100%': { transform: 'translateX(110vw)' },
        }
      }
    },
  },
  plugins: [],
}
