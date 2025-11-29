/* eslint-disable @typescript-eslint/no-require-imports */
// PostCSS config in CommonJS for tooling that loads CJS (Vitest/Vite during tests)
if (process.env.VITEST) {
  module.exports = {};
} else {
  module.exports = {
    plugins: [require("tailwindcss"), require("autoprefixer")],
  };
}
