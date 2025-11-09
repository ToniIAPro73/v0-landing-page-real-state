import next from "eslint-config-next";

const config = [
  {
    ignores: ["node_modules", ".next", "dist"],
  },
  ...next,
  {
    rules: {
      "tailwindcss/suggestCanonicalClasses": "off",
    },
  },
];

export default config;
