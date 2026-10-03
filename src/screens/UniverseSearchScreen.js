/**
 * UniverseSearchScreen.js
 *
 * The first interactive scene — 8 candidate universes displayed as portals.
 * This is the SETUP for future Grover gameplay; no quantum mechanics yet.
 *
 * The player sees the problem: find a universe where the team can survive.
 * No solution is provided automatically.
 * The next implementation task will add actual interaction mechanics.
 */

import { wait } from '../core/utilities.js';

const UNIVERSE_COUNT = 8;

export class UniverseSearchScreen extends EventTarget {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    super();
    this._container = container;
    this._el = null;
    this._timeouts = [];
    // One universe is secretly the "valid" one — not revealed yet.
    // Index is fixed per-session; gameplay will determine how to find it.
    this._targetIndex = Math.floor(Math.random() * UNIVERSE_COUNT);
  }

  async show() {
    this._el = this._build();
    this._container.appendChild(this._el);

    await wait(80);
    this._el.classList.add('visible');

    // Stagger-reveal the portals
    this._staggerPortals();

    // Reveal the objective after portals have appeared
    const t = setTimeout(() => {
      const obj = this._el.querySelector('.search-objective');
      if (obj) obj.classList.add('visible');
    }, 1800);
    this._timeouts.push(t);
  }

  destroy() {
    this._timeouts.forEach(id => clearTimeout(id));
    this._el?.remove();
    this._el = null;
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  _build() {
    const screen = document.createElement('div');
    screen.classList.add('universe-search-screen');
    screen.id = 'universe-search-screen';

    // Header band
    const header = document.createElement('div');
    header.classList.add('uss-header');

    const tag = document.createElement('p');
    tag.classList.add('uss-tag');
    tag.textContent = 'ASGARDIAN SEARCH SYSTEM — CANDIDATE REALITIES';

    const title = document.createElement('h1');
    title.classList.add('uss-title');
    title.textContent = 'MULTIVERSE SCAN';

    header.appendChild(tag);
    header.appendChild(title);
    screen.appendChild(header);

    // Objective banner
    const objective = document.createElement('div');
    objective.classList.add('search-objective');

    const objIcon = document.createElement('span');
    objIcon.classList.add('obj-icon');
    objIcon.textContent = '▸';

    const objText = document.createElement('p');
    objText.classList.add('obj-text');
    objText.textContent = "Find a universe where the team can survive Doom's defense.";

    objective.appendChild(objIcon);
    objective.appendChild(objText);
    screen.appendChild(objective);

    // Portal grid
    const grid = document.createElement('div');
    grid.classList.add('universe-grid');

    for (let i = 0; i < UNIVERSE_COUNT; i++) {
      const portal = this._buildPortal(i);
      grid.appendChild(portal);
    }

    screen.appendChild(grid);

    // Status bar
    const status = document.createElement('div');
    status.classList.add('uss-status-bar');

    const statusLeft = document.createElement('span');
    statusLeft.textContent = `${UNIVERSE_COUNT} CANDIDATE REALITIES DETECTED`;

    const statusRight = document.createElement('span');
    statusRight.classList.add('uss-status-hint');
    statusRight.textContent = 'SELECT A UNIVERSE TO EXAMINE';

    status.appendChild(statusLeft);
    status.appendChild(statusRight);
    screen.appendChild(status);

    return screen;
  }

  _buildPortal(index) {
    const id = String(index + 1).padStart(2, '0');

    const portal = document.createElement('div');
    portal.classList.add('universe-portal');
    portal.id = `universe-${id}`;
    portal.setAttribute('data-index', index);
    portal.setAttribute('role', 'button');
    portal.setAttribute('tabindex', '0');
    portal.setAttribute('aria-label', `Universe ${id} — examine this candidate reality`);

    // Animated ring
    const ring = document.createElement('div');
    ring.classList.add('portal-ring');

    const ringInner = document.createElement('div');
    ringInner.classList.add('portal-ring-inner');
    ring.appendChild(ringInner);

    // Status indicator (all start as "unexamined")
    const dot = document.createElement('div');
    dot.classList.add('portal-dot');

    // Label
    const label = document.createElement('div');
    label.classList.add('portal-label');

    const labelNum = document.createElement('span');
    labelNum.classList.add('portal-num');
    labelNum.textContent = `UNIVERSE ${id}`;

    const labelStatus = document.createElement('span');
    labelStatus.classList.add('portal-status');
    labelStatus.textContent = 'UNEXAMINED';

    label.appendChild(labelNum);
    label.appendChild(labelStatus);

    portal.appendChild(ring);
    portal.appendChild(dot);
    portal.appendChild(label);

    // Click / keyboard interaction (placeholder — fires event for future gameplay)
    const handleSelect = () => {
      this.dispatchEvent(new CustomEvent('universeSelected', {
        detail: { index, id, isTarget: index === this._targetIndex }
      }));
    };
    portal.addEventListener('click', handleSelect);
    portal.addEventListener('keydown', e => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        handleSelect();
      }
    });

    return portal;
  }

  _staggerPortals() {
    const portals = this._el.querySelectorAll('.universe-portal');
    portals.forEach((portal, i) => {
      const t = setTimeout(() => {
        portal.classList.add('visible');
      }, 200 + i * 120);
      this._timeouts.push(t);
    });
  }
}
