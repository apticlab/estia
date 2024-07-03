import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue2';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '/src'),
        },
    },
    build: {
        sourcemap: true,
        lib: {
            entry: 'src/index.js', // Adjust the entry point to your plugin's main file
            name: 'estia', // The global variable name of your plugin
            fileName: (format) => `estia.${format}.js`, // Output file name
        },
        rollupOptions: {
            external: ['vue'], // Externalize deps that shouldn't be bundled into your library
            output: {
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },
});
