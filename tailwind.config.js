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
        soft: "0px 5px 15px rgba(0, 0, 0, 0.25)",
        "soft-top": "0px -5px 15px rgba(0, 0, 0, 0.25)",
        "diffuse-white": "0px 5px 10px rgba(255, 255, 255, 0.05)",
        "diffuse-top-white": "0px -5px 10px rgba(255, 255, 255, 0.05)",
        "soft-white": "0px 5px 15px rgba(255, 255, 255, 0.10)",
        "soft-top-white": "0px -5px 15px rgba(255, 255, 255, 0.10)",
      },
      colors: {
        zinc: {
          150: "rgb(236 236 238)",
        },
      },
      zIndex: {
        100: "100",
        top: "9999",
      },
    },
  },
  plugins: [],
};
