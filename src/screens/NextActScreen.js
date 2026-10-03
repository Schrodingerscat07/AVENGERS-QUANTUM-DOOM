/**
 * NextActScreen.js
 *
 * Placeholder screen shown after clicking "Continue" on the Doom Engine briefing.
 * This will be replaced by actual Act 1 gameplay in a future implementation.
 */

import { wait } from '../core/utilities.js';

export class NextActScreen {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this._container = container;
    this._el = null;
  }

  async show() {
    this._el = this._build();
    this._container.appendChild(this._el);

    await wait(80);
    this._el.classList.add('visible');
  }

  destroy() {
    this._el?.remove();
    this._el = null;
  }

  _build() {
    const screen = document.createElement('div');
    screen.classList.add('next-act-screen');
    screen.id = 'next-act-screen';

    const actNumber = document.createElement('p');
    actNumber.classList.add('act-number');
    actNumber.textContent = 'ACT I';

    const actTitle = document.createElement('h1');
    actTitle.classList.add('act-title');
    actTitle.textContent = 'QUANTUM SEARCH';

    const actSubtitle = document.createElement('p');
    actSubtitle.classList.add('act-subtitle');
    actSubtitle.textContent = 'Coming next...';

    screen.appendChild(actNumber);
    screen.appendChild(actTitle);
    screen.appendChild(actSubtitle);

    return screen;
  }
}
