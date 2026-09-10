'use strict';
// Loads the production bundle order into a vm context with browser doubles.
// Exposes $(expr) to read globals declared with const/let inside the context.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { config } = require('../build.js');
const { FakeAudioContext } = require('./fake-audio');

function fakeElement(tag = 'div') {
  const el = {
    tagName: tag.toUpperCase(), children: [], dataset: {}, style: {}, attributes: {},
    _html: '', textContent: '', value: '', disabled: false,
    classList: {
      _set: new Set(),
      add(c) { this._set.add(c); }, remove(c) { this._set.delete(c); },
      toggle(c, force) { if (force === undefined) force = !this._set.has(c); force ? this._set.add(c) : this._set.delete(c); return force; },
      contains(c) { return this._set.has(c); }
    },
    get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
    appendChild(c) { this.children.push(c); return c; },
    remove() {}, setAttribute(k, v) { this.attributes[k] = v; }, getAttribute(k) { return this.attributes[k]; },
    addEventListener() {}, removeEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    contains() { return false; }
  };
  return el;
}

function fakeDocument() {
  const doc = fakeElement('document');
  doc.documentElement = fakeElement('html');
  doc.body = fakeElement('body');
  doc.visibilityState = 'visible';
  doc.createElement = tag => fakeElement(tag);
  doc.createElementNS = (ns, tag) => Object.assign(fakeElement(tag), { createSVGRect() { return {}; } });
  doc.createDocumentFragment = () => fakeElement('fragment');
  doc.getElementById = () => null;
  return doc;
}

function createSandbox(opts = {}) {
  FakeAudioContext.reset();
  const store = new Map(Object.entries(opts.localStorage || {}));
  const localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k),
    clear: () => store.clear(),
    _store: store
  };
  const sandbox = {
    console: opts.quiet === false ? console : { log() {}, warn() {}, error() {}, info() {}, debug() {} },
    setTimeout: (fn, ms, ...a) => { const t = setTimeout(fn, ms, ...a); t.unref(); return t; },
    clearTimeout,
    setInterval: (fn, ms, ...a) => { const t = setInterval(fn, ms, ...a); t.unref(); return t; },
    clearInterval,
    localStorage,
    navigator: { hardwareConcurrency: 8 },
    performance: {},
    document: fakeDocument(),
    AudioContext: opts.webkitOnly ? undefined : FakeAudioContext,
    webkitAudioContext: FakeAudioContext,
    matchMedia: () => ({ matches: !!opts.prefersDark, addEventListener() {}, removeEventListener() {} }),
    MutationObserver: class { observe() {} disconnect() {} },
    ResizeObserver: class { observe() {} disconnect() {} },
    addEventListener() {}, removeEventListener() {}
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  for (const rel of config.entry.js) {
    const code = fs.readFileSync(path.join(config.srcDir, rel), 'utf8');
    vm.runInContext(code, sandbox, { filename: rel });
  }
  sandbox.$ = expr => vm.runInContext(expr, sandbox);
  sandbox.contexts = FakeAudioContext.instances;
  return sandbox;
}

module.exports = { createSandbox };
