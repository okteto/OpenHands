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
        primary: "var(--palette-neutral-9)", // nice yellow
        base: "var(--palette-neutral-3)", // dark background 
        "base-secondary": "var(--palette-neutral-1)", // lighter background (neutral-800); also used for tooltips
        danger: "var(--palette-red)",
        success: "var(--palette-green)",
        tertiary: "var(--palette-neutral-4)", // gray, used for inputs
        "tertiary-light": "var(--palette-red)", // lighter gray, used for borders and placeholder text
        content: "var(--palette-neutral-9)", // used mostly for text
        "content-2": "var(--palette-neutral-8)", // light gray

        "neutral-1100": "var(--palette-neutral-0)",
        "neutral-1000": "var(--palette-neutral-0)",
        "neutral-900": "var(--palette-neutral-1)",
        "neutral-800": "var(--palette-neutral-2)",
        "neutral-700": "var(--palette-neutral-3)", 
        "neutral-600": "var(--palette-neutral-4)",
        "neutral-500": "var(--palette-neutral-5)",
        "neutral-400": "var(--palette-neutral-6)",
        "neutral-300": "var(--palette-neutral-7)",

        "red-500": "var(--palette-red)"
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
            primary: "var(--palette-steel)", // blue
          },
        },
      },
    }),
    typography,
  ],
};
