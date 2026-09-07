/** @type {import('tailwindcss').Config} */
// Der Kern muss mitgescannt werden: Card, Btn, Chip und die Größenvarianten stehen dort,
// und was Tailwind nicht sieht, generiert es auch nicht.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../kern/src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
