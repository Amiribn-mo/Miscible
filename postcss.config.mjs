const config = {
  plugins: {
    "@tailwindcss/postcss": {},  // ← Fixed: was "@tailwindcss/postcss" (missing leading @ in the key)
  },
};

export default config;