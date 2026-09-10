#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const config = {
  srcDir: path.join(__dirname, 'src'),
  distDir: path.join(__dirname, 'dist'),
  deployTarget: path.join(__dirname, '..', 'index.html'),
  entry: {
    html: 'index.html',
    css: [
      'styles/base.css',
      'styles/components.css',
      'styles/responsive.css'
    ],
    // Concatenation order is the dependency order: each file may only
    // reference globals defined by files above it.
    js: [
      'js/core/state.js',
      'js/core/events.js',
      'js/core/theme.js',
      'js/data/frequency-system.js',
      'js/audio/audio-system.js',
      'js/audio/modules/aleph.js',
      'js/ui/components.js',
      'js/ui/ui-system.js',
      'js/main.js'
    ]
  },
  minify: process.env.NODE_ENV === 'production'
};

function readSrc(rel) {
  return fs.readFileSync(path.join(config.srcDir, rel), 'utf8');
}

async function bundleCSS() {
  let css = config.entry.css.map(readSrc).join('\n');
  if (config.minify) {
    const postcss = require('postcss');
    const cssnano = require('cssnano');
    css = (await postcss([cssnano]).process(css, { from: undefined })).css;
  }
  return css;
}

async function bundleJS() {
  let js = config.entry.js.map(readSrc).join('\n');
  if (config.minify) {
    const { minify } = require('terser');
    js = (await minify(js)).code;
  }
  return js;
}

async function buildHTML() {
  const [css, js] = await Promise.all([bundleCSS(), bundleJS()]);
  const html = readSrc(config.entry.html)
    .replace('<!-- STYLES_PLACEHOLDER -->', `<style>\n${css}\n</style>`)
    .replace('<!-- SCRIPTS_PLACEHOLDER -->', `<script>\n${js}\n</script>`);
  fs.mkdirSync(config.distDir, { recursive: true });
  const out = path.join(config.distDir, 'index.html');
  fs.writeFileSync(out, html);
  return out;
}

function deploy() {
  fs.copyFileSync(path.join(config.distDir, 'index.html'), config.deployTarget);
  return config.deployTarget;
}

async function main(argv) {
  const out = await buildHTML();
  console.log(`built ${path.relative(process.cwd(), out)}`);
  if (argv.includes('--deploy')) {
    const target = deploy();
    console.log(`deployed ${path.relative(process.cwd(), target)}`);
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
  });
}

module.exports = { config, readSrc, bundleCSS, bundleJS, buildHTML, deploy };
