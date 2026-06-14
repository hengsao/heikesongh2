/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#2f3137",
        cream: "#fff8ed",
        coral: "#ff8f70",
        blush: "#ffd9df",
        lavender: "#d9d3ff",
        skysoft: "#bfe9ff",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.9375rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.5rem" }],
        xl: ["1.375rem", { lineHeight: "1.625rem" }],
        "2xl": ["1.75rem", { lineHeight: "2rem" }],
        "3xl": ["2rem", { lineHeight: "2.25rem" }],
      },
      spacing: {
        18: "4.5rem",
        4.5: "1.125rem",
      },
      boxShadow: {
        glow: "0 20px 70px rgba(255, 143, 112, 0.18)",
        card: "0 1px 6px rgba(47, 49, 55, 0.05)",
        hover: "0 4px 16px rgba(47, 49, 55, 0.08)",
        nav: "0 1px 3px rgba(47, 49, 55, 0.04)",
        active: "0 0 0 1px rgba(47, 49, 55, 0.06)",
        pop: "0 8px 24px rgba(47, 49, 55, 0.12)",
      },
      borderRadius: {
        xs: "0.375rem",
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
      },
    },
  },
  plugins: [],
};
