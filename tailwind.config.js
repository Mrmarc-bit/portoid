/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/resources/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--neutral-border-medium)",
        input: "var(--neutral-alpha-weak)",
        ring: "var(--brand-medium)",
        background: "var(--neutral-surface-mixed)",
        foreground: "var(--neutral-strong)",
        primary: {
          DEFAULT: "var(--brand-medium)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--neutral-alpha-medium)",
          foreground: "var(--neutral-strong)",
        },
        destructive: {
          DEFAULT: "var(--red-medium)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--neutral-alpha-weak)",
          foreground: "var(--neutral-weak)",
        },
        accent: {
          DEFAULT: "var(--neutral-alpha-weak)",
          foreground: "var(--neutral-strong)",
        },
        popover: {
          DEFAULT: "var(--neutral-surface-strong)",
          foreground: "var(--neutral-strong)",
        },
        card: {
          DEFAULT: "var(--neutral-surface-mixed)",
          foreground: "var(--neutral-strong)",
        },
      },
      borderRadius: {
        lg: "var(--radius-l, 12px)",
        md: "var(--radius-m, 8px)",
        sm: "var(--radius-s, 4px)",
      },
    },
  },
  corePlugins: {
    preflight: false, // Keep Once UI's reset intact
  },
  plugins: [],
}
