'use strict';
// Minimal Web Audio double. Records the graph and the last scheduled value of
// every AudioParam so tests can assert on routing and gain without a browser.

class FakeParam {
  constructor(value) { this.value = value; this.events = []; }
  setValueAtTime(v, t) { this.events.push(['set', v, t]); this.value = v; return this; }
  linearRampToValueAtTime(v, t) { this.events.push(['ramp', v, t]); this.value = v; return this; }
  exponentialRampToValueAtTime(v, t) { this.events.push(['exp', v, t]); this.value = v; return this; }
  cancelScheduledValues(t) { this.events.push(['cancel', t]); return this; }
}

class FakeNode {
  constructor(ctx, kind) {
    this.ctx = ctx; this.kind = kind; this.outputs = [];
    ctx.nodes.push(this);
  }
  connect(dest, output = 0, input = 0) {
    this.outputs.push({ dest, output, input });
    return dest;
  }
  disconnect() { this.outputs = []; }
}

class FakeGain extends FakeNode {
  constructor(ctx) { super(ctx, 'gain'); this.gain = new FakeParam(1); }
}

class FakeSource extends FakeNode {
  constructor(ctx, kind) { super(ctx, kind); this.startedAt = null; this.stoppedAt = null; }
  start(t = this.ctx.currentTime) {
    if (this.startedAt !== null) throw new Error('InvalidStateError: start() called twice');
    this.startedAt = t;
  }
  stop(t = this.ctx.currentTime) { this.stoppedAt = t; }
}

class FakeOscillator extends FakeSource {
  constructor(ctx) {
    super(ctx, 'oscillator');
    this.type = 'sine';
    this.frequency = new FakeParam(440);
    this.detune = new FakeParam(0);
  }
}

class FakeBufferSource extends FakeSource {
  constructor(ctx) { super(ctx, 'bufferSource'); this.buffer = null; this.loop = false; }
}

class FakeCompressor extends FakeNode {
  constructor(ctx) {
    super(ctx, 'compressor');
    this.threshold = new FakeParam(-24); this.knee = new FakeParam(30);
    this.ratio = new FakeParam(12); this.attack = new FakeParam(0.003);
    this.release = new FakeParam(0.25);
  }
}

class FakeBuffer {
  constructor(channels, length, sampleRate) {
    this.numberOfChannels = channels; this.length = length; this.sampleRate = sampleRate;
    this.duration = length / sampleRate;
    this.channels = Array.from({ length: channels }, () => new Float32Array(length));
  }
  getChannelData(i) { return this.channels[i]; }
  copyToChannel(src, i) { this.channels[i].set(src); }
}

class FakeAudioContext {
  constructor(options) {
    FakeAudioContext.instances.push(this);
    this.options = options;
    this.state = 'suspended';
    this.sampleRate = 48000;
    this.currentTime = 0;
    this.nodes = [];
    this.destination = new FakeNode(this, 'destination');
  }
  createGain() { return new FakeGain(this); }
  createOscillator() { return new FakeOscillator(this); }
  createBufferSource() { return new FakeBufferSource(this); }
  createChannelMerger(n = 6) { const m = new FakeNode(this, 'merger'); m.inputs = n; return m; }
  createDynamicsCompressor() { return new FakeCompressor(this); }
  createBuffer(c, l, sr) { return new FakeBuffer(c, l, sr); }
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
  close() { this.state = 'closed'; return Promise.resolve(); }
  sources() { return this.nodes.filter(n => n instanceof FakeSource); }
}
FakeAudioContext.instances = [];
FakeAudioContext.reset = () => { FakeAudioContext.instances = []; };

// Follow the first output of each node to the destination, multiplying every
// gain met on the way. Returns { gain, reached }.
function pathGain(node, depth = 0) {
  if (depth > 32) return { gain: NaN, reached: false };
  if (node.kind === 'destination') return { gain: 1, reached: true };
  const factor = node.kind === 'gain' ? node.gain.value : 1;
  if (node.outputs.length === 0) return { gain: factor, reached: false };
  const next = pathGain(node.outputs[0].dest, depth + 1);
  return { gain: factor * next.gain, reached: next.reached };
}

module.exports = { FakeAudioContext, FakeParam, FakeNode, FakeGain, FakeOscillator, FakeBufferSource, pathGain };
