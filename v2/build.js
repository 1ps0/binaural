#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { minify } = require('terser'); // Optional for JS minification
const cssnano = require('cssnano'); // Optional for CSS minification
const postcss = require('postcss');

// Configuration
const config = {
  srcDir: './src',
  distDir: './dist',
  entry: {
    html: 'index.html',
    css: [
      'styles/base.css',
      'styles/components.css',
      'styles/responsive.css'
    ],
    js: [
      'js/core/state.js',
      'js/core/events.js', 
      'js/core/theme.js',
      'js/audio/audio-system.js',
      'js/audio/modules/carrier.js',
      'js/audio/modules/binaural.js',
      'js/audio/modules/solfeggio.js',
      'js/audio/modules/aleph.js',
      'js/data/frequency-system.js',
      'js/ui/ui-system.js',
      'js/ui/components.js',
      'js/main.js'
    ],
    // Place this in separate file so AudioWorklet can load it
    worklet: 'js/audio/worklets/aleph-processor.js'
  },
  minify: process.env.NODE_ENV === 'production'
};

// Make sure dist directory exists
if (!fs.existsSync(config.distDir)) {
  fs.mkdirSync(config.distDir, { recursive: true });
}

// Helper for reading files
function readFile(filePath) {
  return fs.readFileSync(path.join(config.srcDir, filePath), 'utf8');
}

// Bundle CSS
async function bundleCSS() {
  let css = '';
  
  for (const file of config.entry.css) {
    css += readFile(file) + '\n';
  }
  
  if (config.minify) {
    const result = await postcss([cssnano]).process(css, { from: undefined });
    css = result.css;
  }
  
  return css;
}

// Bundle JS
async function bundleJS() {
  let js = '';
  
  // Special handling for AudioWorklet processor
  const workletCode = readFile(config.entry.worklet);
  fs.writeFileSync(path.join(config.distDir, 'aleph-processor.js'), workletCode);
  
  // Bundle main JavaScript
  for (const file of config.entry.js) {
    js += readFile(file) + '\n';
  }
  
  if (config.minify) {
    const result = await minify(js);
    js = result.code;
  }
  
  return js;
}

// Combine into final HTML
async function buildHTML() {
  const htmlTemplate = readFile(config.entry.html);
  const css = await bundleCSS();
  const js = await bundleJS();
  
  // Replace placeholders in HTML template
  let finalHTML = htmlTemplate
    .replace('<!-- STYLES_PLACEHOLDER -->', `<style>\n${css}\n</style>`)
    .replace('<!-- SCRIPTS_PLACEHOLDER -->', `<script>\n${js}\n</script>`);
  
  fs.writeFileSync(path.join(config.distDir, 'index.html'), finalHTML);
  console.log('Build completed successfully!');
}

// Run the build
async function build() {
  try {
    await buildHTML();
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
