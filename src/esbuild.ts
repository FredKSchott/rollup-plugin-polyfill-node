import { getModules } from "./modules";
import type * as esbuild from "esbuild";

export default function (options: {}): esbuild.Plugin {
  const mods = getModules();
  const modIds = Array.from(mods.keys());

  return {
    name: "node-polyfill",
    setup: function setup({ onLoad, onResolve }) {
      onResolve(
        {
          filter: /.*/,
        },
        async ({ path: id, importer }) => {
          if (!mods.has(id)) {
            return;
          }
          return {
            namespace: "polyfill-node",
            path: id,
          };
        }
      );
      onLoad(
        { filter: /.*/, namespace: "polyfill-node" },
        async ({ path: id }) => {
          if (mods.has(id)) {
            return {
              loader: "js",
              contents: mods.get(id),
            };
          }
        }
      );
    },
  };
}
