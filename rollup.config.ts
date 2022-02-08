import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  external: ["axios", "fp-ts", "io-ts", "tslib"],
  input: "./src/main.ts",
  output: [
    {
      file: "dist/main.js",
      sourcemap: true,
      format: "cjs",
    },
    {
      file: "dist/main.esm.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/main.jsnext.js",
      format: "module",
      sourcemap: true,
    },
  ],
  plugins: [typescript({ tsconfig: "./tsconfig.json" })],
});
