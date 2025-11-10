import next from "eslint-config-next";

const noopTailwindcssPlugin = {
  rules: {
    suggestCanonicalClasses: {
      meta: {
        docs: {
          description:
            "No-op placeholder while Tailwind 4 canonical class suggestions are disabled.",
        },
      },
      create: () => ({}),
    },
  },
};

const config = [
  {
    ignores: ["node_modules", ".next", "dist", "scripts"],
  },
  ...next,
  {
    plugins: {
      tailwindcss: noopTailwindcssPlugin,
    },
    rules: {
      "tailwindcss/suggestCanonicalClasses": "off",
    },
  },
];

export default config;
