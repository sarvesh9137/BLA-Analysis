/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                poppins: ['Poppins', 'sans-serif'],
            },
            colors: {
                primary: '#2E86C1', // Professional Blue from dashboard.py
                secondary: '#283747',
                accent: '#F4F6F6',
            }
        },
    },
    plugins: [],
}
