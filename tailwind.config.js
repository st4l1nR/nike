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
          500: "#78350f",
        },
      },
    },
    
  },
  safelist: [
    {pattern: /bg-(brown|green|blue|pink|gray)-(500)/}
  ],
  variants: {},
  plugins: [require("@tailwindcss/forms")],
};
