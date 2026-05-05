module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
