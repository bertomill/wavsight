import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#D1D5DB", // text-gray-300
            a: {
              color: "#8B4513",
              "&:hover": {
                color: "#A0522D",
              },
            },
            strong: {
              color: "white",
            },
            h1: {
              color: "white",
            },
            h2: {
              color: "white",
            },
            h3: {
              color: "white",
            },
            h4: {
              color: "white",
            },
            code: {
              color: "#D1D5DB",
            },
            blockquote: {
              color: "#D1D5DB",
              borderLeftColor: "#374151",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
