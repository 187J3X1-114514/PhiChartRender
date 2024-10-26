import { defineConfig } from "vite";
import { internalIpV4 } from "internal-ip";
import topLevelAwait from 'vite-plugin-top-level-await'
import GitRevisionVitePlugin from 'git-revision-vite-plugin';
import { readFile } from 'fs'

function assetFileName(chunkInfo: any): string {
    var n = chunkInfo.name
    if (n!.split('.')[1] == 'css') {
        return 'O.o.css'
    }
    if (n!.endsWith('.js')) {
        return 'O.o.js'
    }
    return 'assets/[name][extname]'
}
const pj: any = await (async () => {
    return new Promise((r) => {
        readFile('package.json', 'utf-8', (_err: any, data: any) => {
            r(data.toString())
        });
    })
})()

export default defineConfig(async () => ({
    plugins: [
        topLevelAwait({
            promiseExportName: '__tla',
            promiseImportName: i => `__tla_${i}`
        }),
        GitRevisionVitePlugin()
    ],
    clearScreen: false,
    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                chunkFileNames: 'o.O.js',
                entryFileNames: 'o.O.js',
                assetFileNames: (chunkInfo: any) => assetFileName(chunkInfo),
            },
        },
    },
    server: {
        strictPort: true,
        watch: {
            ignored: ["**/src-tauri/**"],
        },
    },
    define: {
        GIT_COMMITHASH: "",
        "_PACKAGE_JSON": pj,
        "VES": pj.version,
        "ENV": process,
        "BUILD_TIME": Date.now()
    },
    optimizeDeps: {
        exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
    },
}));

