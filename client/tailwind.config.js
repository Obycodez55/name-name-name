/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/src/**/*.{js,ts}" // Include shared types for intellisense
  ],
  darkMode: "class",
  future: {
    // Enable upcoming features for better performance
    hoverOnlyWhenSupported: true,
  },
  experimental: {
    // Enable modern features
    optimizeUniversalDefaults: true,
  },
  // Minimal config - most customization moved to CSS @theme
}