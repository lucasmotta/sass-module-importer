import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
  moduleName: 'relayout',
  entry: './src/index.js',
  dest: './lib/index.js',
  plugins: [
    babel(),
    commonjs(),
  ],
  external: [
    'fs', 'path', 'es6-map', 'object-assign', 'resolve', 'resolve-bower',
  ],
  format: 'cjs',
};
