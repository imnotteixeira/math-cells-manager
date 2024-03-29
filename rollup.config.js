import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
	input: 'src/index.ts',
	output: {
		dir: 'dist',
		format: 'es',
        plugins: [terser()]
	},
    plugins: [typescript(), nodeResolve(), commonjs()],
    treeshake: {
        moduleSideEffects: false
    }
};