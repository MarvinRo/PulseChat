/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ajuste conforme a estrutura do seu projeto
  ],
  darkMode: 'class', // Recomendado para controle de modo escuro
  theme: {
    extend: {
      fontFamily: {
        // Mapear as fontes para nomes semânticos
        'headline': ['Manrope', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'label': ['Inter', 'sans-serif'], // Label também usa Inter
        'sans': ['Inter', 'sans-serif'], // Define Inter como fonte padrão
      },
      colors: {
        // Mapear as escalas de cores com base na imagem
        primary: {
          50: '#E0F2FE',   // tons mais claros gerados
          100: '#BAE6FD',
          200: '#7DD3FC',
          300: '#38BDF8',
          400: '#0EA5E9',
          500: '#007AFF',  // VALOR BASE DA IMAGEM
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',  // tons mais escuros gerados
        },
        secondary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',  // VALOR BASE DA IMAGEM
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        tertiary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#D75600',  // VALOR BASE DA IMAGEM
          600: '#C2410C',
          700: '#9A3412',
          800: '#7C2D12',
          900: '#713F12',
          950: '#431407',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#2c2c2c',
          900: '#1c1b1b',
          950: '#121212',  // VALOR BASE DA IMAGEM (preto do fundo)
        },
      },
    },
  },
  plugins: [],
}