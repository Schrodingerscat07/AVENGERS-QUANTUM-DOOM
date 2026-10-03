/**
 * ParticleSystem.js
 *
 * Renders very subtle floating particles on a canvas overlay.
 * Used during the multiverse collapse scene to add visual instability.
 * Lightweight: canvas-only, no external dependencies.
 */

export class ParticleSystem {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this._particles = [];
    this._animId = null;
    this._active = false;
    this._intensity = 0; // 0-1, transitions smoothly
    this._targetIntensity = 0;

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  /** Activate particle system with a given intensity (0-1). */
  activate(intensity = 0.4) {
    this._targetIntensity = Math.min(1, Math.max(0, intensity));
    if (!this._active) {
      this._active = true;
      this._canvas.classList.add('active');
      this._spawnParticles();
      this._loop();
    }
  }

  /** Deactivate and fade out. */
  deactivate() {
    this._targetIntensity = 0;
    this._canvas.classList.remove('active');
    // Let intensity naturally reduce; stop loop when intensity reaches 0
  }

  destroy() {
    this._active = false;
    if (this._animId) cancelAnimationFrame(this._animId);
    this._ctx?.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  // ─── Private ────────────────────────────────────────────────────────────

  _resize() {
    this._canvas.width  = window.innerWidth;
    this._canvas.height = window.innerHeight;
  }

  _spawnParticles() {
    const count = 80;
    for (let i = 0; i < count; i++) {
      this._particles.push(this._createParticle());
    }
  }

  _createParticle() {
    const w = this._canvas.width;
    const h = this._canvas.height;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.6 - 0.1,
      radius: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      life: Math.random(),
      maxLife: Math.random() * 200 + 100,
      hue: Math.random() > 0.7 ? 20 : 200, // orange or blue
    };
  }

  _loop() {
    if (!this._active) return;

    // Smoothly transition intensity
    this._intensity += (this._targetIntensity - this._intensity) * 0.02;

    const ctx = this._ctx;
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    // Update and draw particles
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;

      // Fade based on life progress
      const lifeRatio = p.life / p.maxLife;
      const fade = lifeRatio < 0.2 ? lifeRatio / 0.2
                 : lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2
                 : 1;

      const alpha = p.opacity * fade * this._intensity;
      if (alpha > 0.005) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }

      // Recycle dead particles
      if (p.life >= p.maxLife || p.y < -10) {
        this._particles[i] = this._createParticle();
        this._particles[i].y = this._canvas.height + 5; // start from bottom
      }
    }

    // Stop if intensity has dropped to near zero
    if (this._intensity < 0.005 && this._targetIntensity === 0) {
      this._active = false;
      return;
    }

    this._animId = requestAnimationFrame(() => this._loop());
  }
}
