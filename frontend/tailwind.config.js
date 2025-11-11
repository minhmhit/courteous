/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: "#fdf8f3",
          100: "#f7ede0",
          200: "#eed9bf",
          300: "#e3bf98",
          400: "#d69d6f",
          500: "#cb7f4f",
          600: "#be6943",
          700: "#9e5439",
          800: "#7f4533",
          900: "#673a2b",
        },
        cream: {
          50: "#fdfcfb",
          100: "#faf7f4",
          200: "#f5efe8",
          300: "#ede3d8",
          400: "#e1d1c1",
          500: "#d4bca6",
          600: "#c5a489",
          700: "#b08968",
          800: "#8f6f55",
          900: "#745a46",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
