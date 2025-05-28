/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react";
import typography from "@tailwindcss/typography";
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--green)",
        secondary: "var(--navy)", 
        base: "var(--navy)",
        "base-secondary": "var(--navy)", // we keep it the same as base
        danger: "var(--red)",
        success: "var(--green)",
        tertiary: "var(--navy-a-bit-lighter)", // used for inputs
        "tertiary-light": "var(--navy-lighter)", // used for borders and placeholder text
        content: "var(--white)", // used mostly for text

        "neutral-1100": "var(--navy-extra-extra-dark)",
        "neutral-1000": "var(--navy-extra-dark)",
        "neutral-900": "var(--navy-dark)",
        "neutral-800": "var(--navy-darker)",
        "neutral-700": "var(--navy)",
        "neutral-600": "var(--navy-a-bit-lighter)",
        "neutral-500": "var(--navy-lighter)",
        "neutral-400": "var(--navy-light)",
        "neutral-300": "var(--navy-extra-light)",

        "red-500": "var(--red)",
      },
      borderRadius: {
        lg: "4px",
        xl: "4px",
      },
    },
    animation: {
      enter: "toastIn 400ms cubic-bezier(0.21, 1.02, 0.73, 1)",
      leave: "toastOut 100ms ease-in forwards",
    },
    keyframes: {
      toastIn: {
        "0%": {
          opacity: "0",
          transform: "translateY(-100%) scale(0.8)",
        },
        "80%": {
          opacity: "1",
          transform: "translateY(0) scale(1.02)",
        },
        "100%": {
          opacity: "1",
          transform: "translateY(0) scale(1)",
        },
      },
      toastOut: {
        "0%": {
          opacity: "1",
          transform: "translateY(0) scale(1)",
        },
        "100%": {
          opacity: "0",
          transform: "translateY(-100%) scale(0.9)",
        },
      },
      colors: {
        primary: "#C9B974", // nice yellow
        logo: "#CFB755", // color for logos and icons
        base: "#171717", // dark background (neutral-900)
        "base-secondary": "#262626", // lighter background (neutral-800); also used for tooltips
        danger: "#E76A5E",
        success: "#A5E75E",
        tertiary: "#454545", // gray, used for inputs
        "tertiary-light": "#B7BDC2", // lighter gray, used for borders and placeholder text
        content: "#ECEDEE", // light gray, used mostly for text
        "content-2": "#F9FBFE",
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      defaultTheme: "dark",
      layout: {
        radius: {
          small: "5px",
          large: "20px",
        },
      },
      themes: {
        dark: {
          colors: {
            primary: "#4465DB",
            logo: "#CFB755",
          },
        },
      },
    }),
    typography,
  ],
};
