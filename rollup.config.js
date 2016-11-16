import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';

export default {
  moduleName: 'sass-module-importer',
  entry: './src/index.js',
  dest: './lib/index.js',
  plugins: [
    json(),
    buble(),
    resolve({
      jsnext: true,
      main: true,
    }),
    commonjs({
      extensions: ['.js', '.json'],
    }),
  ],
  format: 'cjs',
  external: ['es6-map', 'object-assign', 'resolve', 'resolve-bower', 'glob'],
  onwarn: () => null,
};
