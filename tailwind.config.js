/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./translate/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      colors: {
        primary: '#D4FF00',
        secondary: '#8FB4FF',
        background: '#F5F5F5',
        'text-primary': '#000000',
        'text-secondary': '#666666',
        border: '#CCCCCC',
      },
      boxShadow: {
        'soft': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'hover': '0 8px 32px rgba(0, 0, 0, 0.12)',
      }
    }
  },
  plugins: [],
}
