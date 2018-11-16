import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default {
  input: './src/index.ts',
  output: [{
    file: 'dist/main.umd.js',
    format: 'umd',
    name: 'ReduxRequestMiddleware'
  },
  {
    file: 'dist/main.esm.js',
    format: 'esm',
    name: 'ReduxRequestMiddleware'
  }],
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    babel()
  ]
}