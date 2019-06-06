// @ts-ignore
import inject from 'rollup-plugin-inject';
import { builtinsResolver, NodePolyfillsOptions } from './modules';

export default function (opts: NodePolyfillsOptions = {}) {
  const injectPlugin = inject({
    'process': 'process',
    'Buffer': ['buffer', 'Buffer'],
    'global': require.resolve('../polyfills/global.js'),
  });
  const resolver = builtinsResolver(opts);
  return {
    ...injectPlugin,
    name: 'node-polyfills',
    resolveId(importee: string) {
      return resolver(importee);
    },
  };
}
