/**
 * CinematicPlayer.js
 *
 * Drives the opening cinematic by reading scene config objects and
 * rendering them into the DOM scene container.
 *
 * Responsibilities:
 *  - Preload scene images
 *  - Advance through scenes in sequence
 *  - Apply camera transforms (zoom/pan via CSS transitions)
 *  - Schedule text beats
 *  - Handle skip (jump straight to DoomEngineBriefing)
 *  - Emit 'complete' when cinematic finishes
 */

import { wait } from '../core/utilities.js';
import { audioController } from '../core/AudioController.js';

export class CinematicPlayer extends EventTarget {
  /**
   * @param {HTMLElement} container   — #scene-container
   * @param {object[]}    scenes      — from scenesConfig.js
   */
  constructor(container, scenes) {
    super();
    this._container = container;
    this._scenes    = scenes;
    this._currentIndex = -1;
    this._abortController = null;
    this._isRunning = false;
    this._skipped = false;
  }

  /** Begin playing from scene 0. */
  async play() {
    if (this._isRunning) return;
    this._isRunning = true;
    this._skipped = false;
    this._abortController = new AbortController();
    const signal = this._abortController.signal;

    // Preload all image scenes
    await this._preloadImages();

    try {
      for (let i = 0; i < this._scenes.length; i++) {
        if (signal.aborted) break;
        this._currentIndex = i;
        await this._playScene(this._scenes[i], signal);
      }
    } catch (e) {
      if (e.name !== 'AbortError') throw e;
    } finally {
      this._isRunning = false;
    }

    this._emitComplete();
  }

  /** Skip remaining scenes and emit complete immediately. */
  skip() {
    if (!this._isRunning) return;
    this._skipped = true;
    this._abortController?.abort();
    // Clear the container immediately
    this._container.innerHTML = '';
  }

  get isRunning() { return this._isRunning; }

  // ─── Private ─────────────────────────────────────────────────────────────

  async _preloadImages() {
    const imageScenes = this._scenes.filter(s => s.type === 'image' && s.image);
    await Promise.allSettled(imageScenes.map(s => this._loadImage(s.image)));
  }

  _loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve; // resolve anyway — broken image shows nothing, not crash
      img.src = src;
    });
  }

  /**
   * Play one scene to completion.
   * Builds DOM, animates, waits, tears down.
   */
  async _playScene(scene, signal) {
    const el = this._buildSceneElement(scene);
    this._container.appendChild(el);

    // Trigger audio hook if present
    if (scene.audio && typeof audioController.play === 'function') {
      try {
        audioController.play(scene.audio);
      } catch (err) {
        console.warn('[CinematicPlayer] Audio cue skipped:', err);
      }
    }

    // Fade in
    await wait(30, signal); // allow browser to paint
    el.classList.add('visible');

    // Start camera animation for image scenes
    if (scene.type === 'image' && scene.camera) {
      this._startCameraAnimation(el, scene);
    }

    // Start color grade
    const grade = el.querySelector('.scene-grade');
    if (grade) {
      await wait(100, signal);
      grade.classList.add('visible');
      grade.style.opacity = '1';
    }

    // Schedule text beats
    const textSchedule = this._scheduleTextBeats(el, scene, signal);

    // Apply optional effects (shake, chromatic) — triggered mid-scene
    if (scene.effects?.includes('shake')) {
      this._scheduleEffect(el, 'shake', scene.duration * 0.55, signal);
    }
    if (scene.effects?.includes('chromatic')) {
      this._scheduleEffect(el.querySelector('.scene-image-layer') || el, 'chromatic', scene.duration * 0.55, signal);
    }

    // Wait for scene duration minus fade-out time
    const holdDuration = Math.max(0, scene.duration - scene.transition.out);
    await wait(holdDuration, signal);

    // Cancel pending text animations gracefully
    textSchedule.cancel();

    // Fade out
    el.style.transition = `opacity ${scene.transition.out}ms ease-in-out`;
    el.classList.remove('visible');
    await wait(scene.transition.out, signal);

    // Remove from DOM
    el.remove();
  }

  _buildSceneElement(scene) {
    const el = document.createElement('div');
    el.classList.add('cinematic-scene');
    el.id = `scene-${scene.id}`;
    el.style.transition = `opacity ${scene.transition.in}ms ease-in-out`;

    if (scene.type === 'black') {
      el.style.background = '#000';
      return el;
    }

    // Image layer
    if (scene.image) {
      const imageLayer = document.createElement('div');
      imageLayer.classList.add('scene-image-layer');
      imageLayer.style.backgroundImage = `url('${scene.image}')`;
      imageLayer.style.backgroundSize = 'cover';
      imageLayer.style.backgroundPosition = 'center';
      el.appendChild(imageLayer);
    }

    // Color grade overlay
    if (scene.grade) {
      const grade = document.createElement('div');
      grade.classList.add('scene-grade', scene.grade);
      el.appendChild(grade);
    }

    // Vignette
    const vignette = document.createElement('div');
    vignette.classList.add('scene-vignette');
    if (scene.vignette === 'heavy') vignette.classList.add('heavy');
    el.appendChild(vignette);

    // Text layer
    if (scene.textBeats?.length) {
      const textLayer = document.createElement('div');
      textLayer.classList.add('scene-text-layer');

      scene.textBeats.forEach((beat, i) => {
        const line = document.createElement('p');
        line.classList.add('scene-text-line');
        if (beat.accent) line.classList.add('accent');
        line.textContent = beat.text;
        line.id = `text-${scene.id}-${i}`;
        textLayer.appendChild(line);
      });

      el.appendChild(textLayer);
    }

    return el;
  }

  _startCameraAnimation(el, scene) {
    const imageLayer = el.querySelector('.scene-image-layer');
    if (!imageLayer) return;

    const { startScale, endScale, startX = 0, endX = 0, startY = 0, endY = 0 } = scene.camera;
    const duration = scene.duration;

    // Set initial transform
    imageLayer.style.transform = `scale(${startScale}) translate(${startX}%, ${startY}%)`;
    imageLayer.style.transition = 'none';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Apply eased camera move over the full scene duration
        imageLayer.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
        imageLayer.style.transform = `scale(${endScale}) translate(${endX}%, ${endY}%)`;
      });
    });
  }

  _scheduleTextBeats(el, scene, signal) {
    const timeouts = [];
    let cancelled = false;

    scene.textBeats?.forEach((beat, i) => {
      const id = setTimeout(() => {
        if (cancelled || signal.aborted) return;
        const lineEl = el.querySelector(`#text-${scene.id}-${i}`);
        if (lineEl) {
          lineEl.classList.add('visible');
        }
      }, beat.delay);
      timeouts.push(id);
    });

    return {
      cancel: () => {
        cancelled = true;
        timeouts.forEach(id => clearTimeout(id));
      }
    };
  }

  _scheduleEffect(el, effectClass, delay, signal) {
    const id = setTimeout(() => {
      if (signal.aborted) return;
      el.classList.add(effectClass);
      if (effectClass === 'shake') {
        // Auto-remove after animation completes
        el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
      }
    }, delay);
    return id;
  }

  _emitComplete() {
    this.dispatchEvent(new CustomEvent('complete', { detail: { skipped: this._skipped } }));
  }
}
