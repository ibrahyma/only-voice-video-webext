import {defineConfig, PluginOption} from 'vite';
import {glob} from 'glob';
import copy from 'rollup-plugin-copy';
import path = require("path");
import fs = require("fs");

const OUTDIR = "build";

function watchAllFilesPlugin(): PluginOption {
    return {
        name: 'watch-all-files',
        buildStart: function () {
            const files = glob.sync('src/**/*.{html,css,ts}');
            for (const file of files) {
                this.addWatchFile(path.resolve(file));
            }
        }
    };
}

function getTsInputs(dir: string, input: Record<string,string> = {}) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.resolve(dir, ent.name);
        if (ent.isDirectory()) {
            getTsInputs(full, input);
        } else if (ent.isFile() && ent.name.endsWith('.ts')) {
            const key = path
                .relative(path.resolve(__dirname, 'src'), full)
                .replace(/\.ts$/, '');
            input[key] = full;
        }
    }
    return input;
}

export default defineConfig({
    plugins: [ watchAllFilesPlugin() ],
    build: {
        outDir: OUTDIR,
        emptyOutDir: true,
        cssCodeSplit: false,
        watch: {},
        terserOptions: {
            compress: {
                drop_console: false,
                drop_debugger: false
            }
        },
        rollupOptions: {
            input: getTsInputs(path.resolve(__dirname, 'src')),
            output: {
                entryFileNames: chunk => `${chunk.name}.js`,
                chunkFileNames: 'chunks/[name].js',
            },
            plugins: [
                copy({
                    targets: [
                        { src: 'src/**/*.{html,css}', dest: OUTDIR }
                    ],
                    hook: 'writeBundle',
                    flatten: false
                })
            ]
        }
    }
});
