/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      boxShadow: {
        diffuse: "0px 5px 10px rgba(0, 0, 0, 0.05)",
        "diffuse-top": "0px -5px 10px rgba(0, 0, 0, 0.05)",
      },
      colors: {
        zinc: {
          150: "rgb(236 236 238)",
        },
      },
    },
  },
  plugins: [],
};
