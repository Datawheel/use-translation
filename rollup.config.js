import cleanup from "rollup-plugin-cleanup";
import license from "rollup-plugin-license";
import typescript from "@rollup/plugin-typescript";
import {execSync} from 'child_process';
import pkg from "./package.json";

const environment = process.env.NODE_ENV;
const inProduction = environment === "production";
const inDevelopment = environment === "development";

const sourcemap = inDevelopment ? "inline" : false;

const LICENSE_HEADER =
`${pkg.name} ${pkg.version} (${pkg.homepage})
rev ${execSync('git rev-parse --short HEAD')}
Copyright (c) Datawheel, LLC
Licensed under MIT`;

/** @return {import("rollup").RollupOptions} */
export default commandLineArgs => {
  return {
    input: "./index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        exports: "named",
        sourcemap
      },
      {
        file: pkg.module,
        format: "esm",
        exports: "named",
        sourcemap
      }
    ],
    external: Object.keys({...pkg.dependencies, ...pkg.peerDependencies}),
    plugins: [
      typescript({
        allowSyntheticDefaultImports: true
      }),
      license({
        banner: LICENSE_HEADER
      }),
      cleanup()
    ],
    watch: {
      include: ["src/**"],
      exclude: "node_modules/**",
      clearScreen: !inProduction
    }
  };
};
