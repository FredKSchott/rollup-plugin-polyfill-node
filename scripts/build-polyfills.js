const rollup = require('rollup');
const path = require('path');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const license = require('rollup-plugin-license');

async function main() {
  await Promise.all([
    bundleDependency('process-es6'),
    bundleDependency('buffer-es6'),
    bundleDependency('browserify-fs'),
    bundleDependency('crypto-browserify'),
  ])
}

async function bundleDependency(depName) {
  const bundle = await rollup.rollup({
    input: depName,
    plugins: [
      commonjs(),
      nodeResolve({
        browser: true,
        preferBuiltins: true
      }),
      // license({
      //   thirdParty: {
      //     output: path.join(__dirname, '..', 'polyfills', `LICENSE-${depName}.txt`),
      //     includePrivate: true, // Default is false.
      //     encoding: 'utf-8', // Default is utf-8.
      //   }
      // }),
      json(),
    ],
    external: [
      'crypto',
      'vm',
      'events',
      'path',
      'stream',
      'util',
      'buffer'
    ]
  });

  await bundle.write({
    format: 'esm',
    file: path.join('polyfills', depName + '.js')
  });
}

main();
