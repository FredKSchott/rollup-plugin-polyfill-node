
export default {
	input: 'lib/index.js',
	external: [
		'path',
		'crypto',
		'@rollup/plugin-inject'
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
