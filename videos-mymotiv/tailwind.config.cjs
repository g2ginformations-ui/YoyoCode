/** @type {import('tailwindcss').Config} */
// « preflight » désactivé : la remise à zéro CSS de Tailwind ne doit pas modifier les autres vidéos du projet.
module.exports = { content: ["./src/**/*.{ts,tsx}"], corePlugins: { preflight: false }, theme: { extend: {} }, plugins: [] };
