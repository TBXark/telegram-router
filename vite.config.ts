import { defineConfig } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { nodeExternals } from 'rollup-plugin-node-externals';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  plugins: [
    nodeResolve({
      preferBuiltins: true,
    }),
    typescript({
      declaration: true,
      declarationDir: './dist',
      rootDir: './src',
    }),
    nodeExternals(),
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    minify: false
  }
})
