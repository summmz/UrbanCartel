import { build } from "esbuild";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: ["api/index.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "api/_bundle.mjs",
  alias: {
    "@shared": resolve(__dirname, "shared"),
    "@": resolve(__dirname, "client/src"),
  },
  external: [
    "mysql2",
    "fsevents",
    "vite",
    "esbuild",
  ],
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
});

console.log("API bundle built successfully");
