/**
 * DoomEngineBriefing.js
 *
 * Renders the classified intelligence briefing screen that appears
 * immediately after the opening cinematic.
 *
 * Content is driven by the doomEngineBriefing config from scenesConfig.js.
 * Reveals lines progressively using CSS transitions timed by config delays.
 *
 * Emits 'continue' event when the player clicks Continue.
 */

import { wait } from '../core/utilities.js';

export class DoomEngineBriefing extends EventTarget {
  /**
   * @param {HTMLElement} container  — element to render into
   * @param {object}      config     — doomEngineBriefing from scenesConfig.js
   */
  constructor(container, config) {
    super();
    this._container = container;
    this._config = config;
    this._el = null;
    this._abortController = null;
    this._timeouts = [];
  }

  /** Build and mount the briefing UI, then begin the timed reveal. */
  async show() {
    this._abortController = new AbortController();
    const signal = this._abortController.signal;

    this._el = this._build();
    this._container.appendChild(this._el);

    await wait(80, signal);
    this._el.classList.add('visible');

    await this._revealContent(signal);
  }

  /** Immediately reveal all content (used when player skips cinematic). */
  revealAll() {
    if (!this._el) {
      this._el = this._build();
      this._container.appendChild(this._el);
    }
    // Cancel any pending timed reveals
    this._abortController?.abort();
    this._timeouts.forEach(id => clearTimeout(id));

    // Force-show everything
    this._el.classList.add('visible');
    this._el.querySelectorAll('.briefing-tag, .briefing-title, .briefing-line, .continue-section')
      .forEach(el => {
        el.classList.add('visible');
        el.style.transitionDelay = '0ms';
      });
  }

  /** Remove the briefing from DOM. */
  destroy() {
    this._abortController?.abort();
    this._timeouts.forEach(id => clearTimeout(id));
    this._el?.remove();
    this._el = null;
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  _build() {
    const cfg = this._config;

    const wrapper = document.createElement('div');
    wrapper.classList.add('doom-engine-briefing');
    wrapper.id = 'doom-engine-briefing';

    const content = document.createElement('div');
    content.classList.add('briefing-content');

    // Header
    const header = document.createElement('div');
    header.classList.add('briefing-header');

    const tag = document.createElement('p');
    tag.classList.add('briefing-tag');
    tag.id = 'briefing-tag';
    tag.textContent = cfg.tag;
    header.appendChild(tag);

    const title = document.createElement('h1');
    title.classList.add('briefing-title');
    title.id = 'briefing-title';
    cfg.title.forEach((word, i) => {
      if (i === cfg.titleAccentIndex) {
        const span = document.createElement('span');
        span.classList.add('accent-doom');
        span.textContent = word;
        title.appendChild(span);
      } else {
        title.appendChild(document.createTextNode(word));
      }
    });
    header.appendChild(title);
    content.appendChild(header);

    // Body lines
    const body = document.createElement('div');
    body.classList.add('briefing-body');

    cfg.lines.forEach(line => {
      const p = document.createElement('p');
      p.classList.add('briefing-line');
      p.id = line.id;
      if (line.dramatic) p.classList.add('dramatic');
      if (line.conclusion) p.classList.add('conclusion');
      p.textContent = line.text;
      body.appendChild(p);
    });

    content.appendChild(body);

    // Continue section
    const continueSection = document.createElement('div');
    continueSection.classList.add('continue-section');
    continueSection.id = 'continue-section';

    const actLabel = document.createElement('p');
    actLabel.classList.add('act-label');
    actLabel.textContent = 'ACT I — QUANTUM SEARCH';
    continueSection.appendChild(actLabel);

    const continueBtn = document.createElement('button');
    continueBtn.classList.add('continue-btn');
    continueBtn.id = 'continue-btn';
    continueBtn.textContent = 'CONTINUE';
    continueBtn.setAttribute('aria-label', 'Continue to Act 1');
    continueBtn.addEventListener('click', () => this._onContinue());
    continueSection.appendChild(continueBtn);

    content.appendChild(continueSection);
    wrapper.appendChild(content);

    return wrapper;
  }

  async _revealContent(signal) {
    const cfg = this._config;

    // Helper: reveal element at specific delay
    const revealAt = (id, delay) => {
      return new Promise(resolve => {
        const timeout = setTimeout(() => {
          if (signal.aborted) { resolve(); return; }
          const el = this._el?.querySelector(`#${id}`);
          if (el) el.classList.add('visible');
          resolve();
        }, delay);
        this._timeouts.push(timeout);
      });
    };

    // Reveal header elements first
    revealAt('briefing-tag', 200);
    revealAt('briefing-title', 600);

    // Reveal each briefing line at its configured delay
    cfg.lines.forEach(line => {
      revealAt(line.id, line.delay);
    });

    // Reveal continue section
    revealAt('continue-section', cfg.continueDelay);
  }

  _onContinue() {
    this.dispatchEvent(new CustomEvent('continue'));
  }
}
