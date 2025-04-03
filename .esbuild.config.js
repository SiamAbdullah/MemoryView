const esbuild = require('esbuild');
const chokidar = require('chokidar');

const watch = process.argv.includes('--watch');
const minify = !watch || process.argv.includes('--minify');
const prod = process.env.NODE_ENV === 'production';

function onRebuildReport(pkg, error, result) {
    const ts = new Date().toLocaleString();
    if (error) {
        console.log(`${ts}: ${pkg}: watch build failed:` /*, error*/);
    } else {
        console.log(`${ts}: ${pkg}: watch build succeeded:`, result);
    }
}

// Build the editor provider
const buildExtension = esbuild
    .build({
        entryPoints: ['src/extension.ts'],
        tsconfig: './tsconfig.json',
        bundle: true,
        external: ['vscode'],
        sourcemap: watch,
        minify: prod,
        platform: 'node',
        outfile: 'dist/extension.js'
    })
    .catch(() => process.exit(1));

// if (watch) {
//     chokidar.watch('./src/**/*').on('change', buildExtension);
// }

// Build the webview editors
esbuild
    .build({
        entryPoints: ['src/view/index.tsx'],
        tsconfig: './tsconfig.json',
        bundle: true,
        external: ['vscode'],
        sourcemap: watch ? 'inline' : false,
        minify: prod,
        platform: 'browser',
        outfile: 'dist/memview.js',
        plugins: [
            // svgr(),
            // linaria.default({
            //     sourceMap: prod
            // }),
        ]
    })
    .catch(() => process.exit(1));
