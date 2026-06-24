import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Downgraded to a warning: our remaining hits are legitimate mount-time
      // syncs from a browser-only external store (URL params, sessionStorage,
      // initial fetch) in prerendered "use client" components. The rule's
      // suggested fix (lazy useState init) reads window during render and
      // causes hydration mismatches, so the effect is the correct pattern here.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
