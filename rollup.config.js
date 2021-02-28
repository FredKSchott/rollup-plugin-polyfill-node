
export default {
	input: 'lib/esbuild.js',
	external: [
		'path',
		'crypto',
		'@rollup/plugin-inject',
		'esbuild'
	],
	output: [
		{
			format: 'es',
			file: 'dist/index.mjs',
			preferConst: true,
			exports: 'auto',
		},
		{
			format: 'cjs',
			file: 'dist/index.js',
			preferConst: true,
			exports: 'auto',
		}
	]
};
