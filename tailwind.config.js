/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          10: '#FFFFFF',
          20: '#F5F5F5',
          30: '#E5E5E5',
          40: '#D4D4D4',
          60: '#A3A3A3',
          70: '#737373',
          90: '#404040',
        },
        secondary: {
          10: '#F9FAFB',
        },
        tertiary: {
          10: '#FAFAFA',
          20: '#E5E5E5',
          30: '#D4D4D4',
          50: '#737373',
          70: '#525252',
          100: '#171717',
        },
        neutral: {
          20: '#E5E5E5',
          90: '#171717',
          100: '#000000',
        },
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'righteous': ['Righteous', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-black-white': 'linear-gradient(to bottom, #000000, #1a1a1a, #2d2d2d, #404040, #525252, #737373, #a3a3a3, #d4d4d4, #e5e5e5, #f5f5f5, #ffffff)',
        'gradient-dark': 'linear-gradient(to bottom, #000000, #171717, #262626, #404040)',
        'gradient-light': 'linear-gradient(to bottom, #ffffff, #f5f5f5, #e5e5e5, #d4d4d4)',
        'gradient-radial': 'radial-gradient(circle, #000000 0%, #262626 50%, #404040 100%)',
        'gradient-bw': 'linear-gradient(to bottom, #000000, #1a1a1a, #333333, #4d4d4d, #666666, #808080, #999999, #b3b3b3, #cccccc, #e6e6e6, #ffffff)',
      },
    },
  },
  plugins: [],
}

