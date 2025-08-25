/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b1020",
        panel: "#111831",
        brand: "#7aa2ff",
        brand2: "#9d7aff",
        border: "rgba(255,255,255,.08)",
        muted: "#a8b3cf",
        text: "#e6ecff",
      },
      boxShadow: { card: "0 10px 24px rgba(0,0,0,.25)" },
      borderRadius: { xl2: "18px" },
    },
  },
  plugins: [],
};
