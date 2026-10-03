/**
 * AudioController.js
 *
 * Provides synthesized procedural audio feedback using the Web Audio API.
 * Guarantees zero external network dependencies, no copyrighted files,
 * and immediate responsive sound design for the sci-fi multiverse search.
 */

export class AudioController {
  constructor() {
    this._context = null;
    this._muted = false;
  }

  async init() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && !this._context) {
        this._context = new AudioCtx();
      }
    } catch (e) {
      // Audio autoplay restrictions or headless environment
    }
  }

  _ensureContext() {
    if (!this._context) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this._context = new AudioCtx();
      } catch {}
    }
    if (this._context && this._context.state === 'suspended') {
      this._context.resume().catch(() => {});
    }
    return this._context;
  }

  /**
   * Play a named track or sound effect (e.g. 'doom-ambient', 'collapse-sting').
   * Safe fallback for any track ID.
   */
  play(trackId, options = {}) {
    if (this._muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    try {
      if (trackId === 'doom-ambient') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 5.0);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 5.2);
      } else if (trackId === 'collapse-sting') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 1.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.25);
      }
    } catch {}
  }

  /** Stop a named audio cue */
  stop(/* trackId */) {}

  /** Fade a track to a given volume over duration ms */
  fadeTo(/* trackId, targetVolume, durationMs */) {}

  get enabled() {
    return !!this._context && !this._muted;
  }

  /** Subtle tick when hovering a universe portal */
  playHover() {
    if (this._muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  /** Resonant low frequency engagement tone when selecting a universe */
  playSelect() {
    if (this._muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }

  /** Scanner evaluation chirp for each condition step */
  playScanStep(index = 0) {
    if (this._muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    try {
      const freqs = [520, 680, 840];
      const baseFreq = freqs[index % freqs.length];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  }

  /** Deep warning buzz when a universe is rejected */
  playScanFail() {
    if (this._muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    } catch {}
  }

  /** Ascending celebratory harmonic chord when viable universe 07 is verified */
  playScanSuccess() {
    if (this._muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880]; // A Major chord
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + 1.3);
      });
    } catch {}
  }

  /** Ambient whoosh when transitioning between views */
  playTransition() {
    if (this._muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.2);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  }

  setMuted(muted) {
    this._muted = muted;
  }
}

export const audioController = new AudioController();
