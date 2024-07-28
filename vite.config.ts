import { defineConfig } from "vite";
import { internalIpV4 } from "internal-ip";
import topLevelAwait from 'vite-plugin-top-level-await'
import GitRevisionVitePlugin from 'git-revision-vite-plugin';
// @ts-expect-error
import { readFile } from 'fs'
// @ts-expect-error
const mobile = !!/android|ios/.exec(process.env.TAURI_ENV_PLATFORM);
function assetFileName(chunkInfo: any): string {
    var n = chunkInfo.name
    if (n!.split('.')[1] == 'css') {
        return 'O.o.css'
    }
    if (n!.endsWith('.js')) {
        return 'O.o-[hash].js'
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
                chunkFileNames: 'o.O-[hash].js',
                entryFileNames: 'o.O.js',
                assetFileNames: (chunkInfo: any) => assetFileName(chunkInfo),
            },
        },
    },
    server: {
        port: 1420,
        strictPort: true,
        host: mobile ? "192.168.1.4" : false,
        hmr: mobile
            ? {
                protocol: "ws",
                host: await internalIpV4(),
                port: 1421,
            }
            : undefined,
        watch: {
            ignored: ["**/src-tauri/**"],
        },
    },
    define: {
        GIT_COMMITHASH: "",
        "_PACKAGE_JSON": pj,
        "VES": pj.version,
        // @ts-expect-error
        "ENV": process,
        "BUILD_TIME": Date.now()
    },
    optimizeDeps: {
        exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
    },
}));

