/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Primary theme colors based on the palette
        primary: '#470031', // Dark Purple from palette - Primary, headers, buttons, logo
        accent: '#cfb570', // Gold from palette - Accents, hover effects, borders
        'soft-pink': {
          100: '#F8E4EB', // Soft Pink - Background, overlays (keeping same)
          200: '#F9D9E4', // Soft Pink variant (keeping same)
        },
        white: '#FFFFFF', // White - Text, buttons, spaces
        'dark-gray': '#333333', // Dark Gray - Body text, icons
        
        // Additional color variations based on palette
        'deep-purple': {
          50: '#F3E8FF',
          100: '#E9D5FF',
          200: '#D8B4FE',
          300: '#C084FC',
          400: '#A855F7',
          500: '#470031', // Primary from palette
          600: '#3A0028',
          700: '#2D001F',
          800: '#200016',
          900: '#13000D',
        },
        'gold': {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#F59E0B',
          500: '#cfb570', // Primary gold from palette
          600: '#C7AE6A', // Secondary gold from palette
          700: '#c2a14a', // Darker gold from palette
          800: '#dbc078', // Lighter gold from palette
          900: '#dcc996', // Lightest gold from palette
        },
        'purple': {
          50: '#F3E8FF',
          100: '#E9D5FF',
          200: '#D8B4FE',
          300: '#C084FC',
          400: '#A855F7',
          500: '#470031', // Main purple from palette
          600: '#3A0028',
          700: '#2D001F',
          800: '#200016',
          900: '#13000D',
        },
        'soft-pink': {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#F8E4EB', // Primary soft pink (keeping same)
          600: '#F9D9E4', // Secondary soft pink (keeping same)
          700: '#EC4899',
          800: '#BE185D',
          900: '#9D174D',
        },
      },
      fontFamily: {
        'script': ['var(--font-dancing-script)', 'cursive'],
        'sans': ['var(--font-poppins)', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
        'cormorant': ['Cormorant Garamond', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      }
      addUtilities(newUtilities)
    }
  ],
}
