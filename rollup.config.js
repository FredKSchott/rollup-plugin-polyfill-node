/** @returns {import("rollup").RollupOptions} */
export default {
	input: 'lib/index.js',
	external: [
		'path',
		'crypto',
		'@rollup/plugin-inject'
	],
	output: ['es','cjs'].map((format) => ({
		dir: `dist/${format==='es' ? 'es' : ''}`,
		exports: 'auto',
		format,
		preferConst: true,
		preserveModules: true,
	})),
};
