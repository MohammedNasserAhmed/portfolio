module.exports = {
    content: ['./index.html', './ar/**/*.html', './js/**/*.{js,ts}'],
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
                'brand-card': '#1E1E1E',
                'glass-border': 'rgba(255, 255, 255, 0.08)',
                'glass-bg': 'rgba(255, 255, 255, 0.03)'
            },
            animation: {
                float: 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                }
            }
        }
    },
    plugins: []
};
