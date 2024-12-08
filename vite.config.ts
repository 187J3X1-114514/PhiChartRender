import { defineConfig } from "vite";
import topLevelAwait from 'vite-plugin-top-level-await'
import GitRevisionVitePlugin from 'git-revision-vite-plugin';
import { readFile } from 'fs'
import { fileURLToPath } from "url";
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

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
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.startsWith('mdui-')
                }
            }
        }),
        vueJsx(),
        vueDevTools(),
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
        host: '0.0.0.0',
        watch: {
            ignored: ["**/src-tauri/**"],
        },
        headers: {
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
        }
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
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
}));
