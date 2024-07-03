/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      boxShadow: {
        diffuse: "0px 5px 20px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
};
