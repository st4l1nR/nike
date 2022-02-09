const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./src/components/**/*.{ts,tsx,js,jsx}",
    "./src/pages/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Oswald", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        sky: "#F6F6F6",
        brown: {
          400: "#92400E",
        },
      },
    },
  },
  safelist: [
    "bg-black",
    "bg-white",
    {
      pattern:
        /bg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|brown)-(100|200|300|400|500|600|700|800|900)/,
    },
  ],
  variants: {},
  plugins: [require("@tailwindcss/forms")],
};
