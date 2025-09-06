module.exports = {
  content: [
    './index.html',
    './js/**/*.{js,ts}'
  ],
  theme: {
    extend: {
      fontFamily: {
  sans: ['Inter', 'sans-serif'],
  arabic: ['"IBM Plex Sans Arabic"', 'Cairo', 'Tahoma', 'sans-serif']
      },
      colors: {
        'brand-red': '#D92323',
        'brand-dark': '#121212',
        'brand-gray': '#A0A0A0',
        'brand-light-gray': '#F5F5F5',
        'brand-card': '#1E1E1E'
      }
    }
  },
  plugins: []
};
