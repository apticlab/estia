import commonjs from '@rollup/plugin-commonjs' // Convert CommonJS modules to ES6
import buble from '@rollup/plugin-buble' // Transpile/polyfill with reasonable browser support
import autoExternal from 'rollup-plugin-auto-external'
import vue from 'rollup-plugin-vue' // Handle .vue SFC files
import { terser } from 'rollup-plugin-terser'
import scss from 'rollup-plugin-scss' // handles '.css' and '.scss'
import alias from '@rollup/plugin-alias'
import path from 'path'
import json from 'rollup-plugin-json'

const projectRoot = path.resolve(__dirname, '..')

export default {
  input: 'src/main.js', // Path relative to package.json
  output: [
    {
      name: 'Estia',
      exports: 'named',
      globals: {
        'is-plain-object': 'is-plain-object',
        'nanoid/non-secure': 'nanoid',
        'is-url': 'is-url',
        'v-lazy-image': 'v-lazy-image',
        axios: 'axios',
        vue: 'Vue',
        '@braid/vue-formulate': '@braid/vue-formulate',
        'v-calendar': 'v-calendar',
        'vue-window-size': 'vue-window-size',
        lodash: '_',
        moment: 'moment',
        'vue-i18n': 'vue-i18n',
        'vue2-daterange-picker': 'vue2-daterange-picker',
        'chart.js': 'chart.js',
        'popper.js': 'popper.js',
        vuex: 'vuex',
        'vue2-timepicker': 'vue2-timepicker',
        jquery: 'jquery',
      },
      sourcemap: false
    }
  ],
  external: ['nanoid/non-secure'],
  plugins: [
    alias({
      entries: {
        '@': path.resolve(projectRoot, 'src')
      }
    }),
    json({
      preferConst: true, // Default: false
      compact: true,
      namedExports: true
    }),
    scss(),
    commonjs(),
    autoExternal(),
    vue({
      css: true, // Dynamically inject css as a <style> tag
      compileTemplate: true // Explicitly convert template to render function
    }),
    buble({
      objectAssign: 'Object.assign',
      transforms: { asyncAwait: false }
    }) // Transpile to ES5,
  ]
}
