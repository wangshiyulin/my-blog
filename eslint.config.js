import js from "@eslint/js";
import vue from "eslint-plugin-vue";

const browserGlobals = {
  window: "readonly",
  document: "readonly",
  navigator: "readonly",
  localStorage: "readonly",
  sessionStorage: "readonly",
  HTMLElement: "readonly",
  Event: "readonly",
  CustomEvent: "readonly",
  MutationObserver: "readonly",
  IntersectionObserver: "readonly",
  ResizeObserver: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  location: "readonly",
  history: "readonly",
  getComputedStyle: "readonly",
  matchMedia: "readonly",
  requestAnimationFrame: "readonly",
  cancelAnimationFrame: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  fetch: "readonly",
  performance: "readonly",
  Image: "readonly",
  Blob: "readonly",
  FormData: "readonly",
  FileReader: "readonly",
  crypto: "readonly",
  structuredClone: "readonly",
  ref: "readonly",
  computed: "readonly",
  watch: "readonly",
  nextTick: "readonly",
  onMounted: "readonly",
  onBeforeUnmount: "readonly",
  useData: "readonly",
  useRoute: "readonly",
  useRouter: "readonly",
};

const nodeGlobals = {
  process: "readonly",
  Buffer: "readonly",
  console: "readonly",
  globalThis: "readonly",
};

export default [
  {
    ignores: [
      "node_modules/**",
      ".vitepress/dist/**",
      ".vitepress/cache/**",
      ".vitepress/auto-imports.d.ts",
      ".vitepress/components.d.ts",
    ],
  },
  js.configs.recommended,
  ...vue.configs["flat/essential"],
  {
    files: ["**/*.{js,mjs,cjs}", "**/*.vue"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
        $message: "readonly",
      },
    },
    rules: {
      quotes: ["warn", "double", { avoidEscape: true, allowTemplateLiterals: true }],
      "no-console": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
    },
  },
];
