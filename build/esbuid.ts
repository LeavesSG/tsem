import { build, stop } from "https://deno.land/x/esbuild@v0.17.18/mod.js";

(() => {
    const appName = getAppName();
    if (!appName) {
        console.warn("Please specify the lib folder name!");
        return;
    }
    buildApp(appName);
})();

function getAppName() {
    const [appName] = Deno.args;
    return appName;
}

async function buildApp(appName: string) {
    await build({
        bundle: true,
        format: "esm",
        outfile: `dist/${appName}.js`,
        entryPoints: [`libs/${appName}/src/mod.ts`],
        target: [
            "esnext",
        ],
        // banner: {
        //     js: await tryGetAppBanner(appName),
        // },
    });
    stop();
}

// async function tryGetAppBanner(appName: string) {
//     const bannerPath = `libs/${appName}/banner.txt`;
//     const file = await Deno.open(bannerPath, { read: true });
//     const fileInfo = await file.stat();

//     let banner = getDefaultBanner(appName);
//     if (fileInfo.isFile) {
//         const buf = new Uint8Array(fileInfo.size);
//         await file.read(buf);
//         banner = new TextDecoder().decode(buf);
//     }
//     file.close();
//     return banner;
// }

// function getDefaultBanner(appName: string) {
//     return `/**
//     * ${appName}
//     * @author Tianyi Liu <l.lty@outlook.com>
//     */`;
// }
