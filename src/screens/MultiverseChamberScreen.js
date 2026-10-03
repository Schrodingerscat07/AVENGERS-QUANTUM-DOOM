/**
 * MultiverseChamberScreen.js
 *
 * Implements ACT 1A — CLASSICAL MULTIVERSE SEARCH:
 * 1. Multiverse Chamber with 8 candidate universe portals.
 * 2. Sequential physical scanning of candidate teams in 3D.
 * 3. Individual query tracking (one opened universe = one query).
 * 4. Specific, meaningful failure reasons for non-viable realities.
 * 5. Deterministic target resolution (Universe 07) with energized 3D climax.
 * 6. Search debrief highlighting the exponential brute-force search cost.
 * 7. Optional search replay.
 * 8. Strict black-and-white UI theme.
 */

import { UNIVERSES, evaluateUniverse } from '../core/universeData.js';
import { Universe3DViewer } from './Universe3DViewer.js';
import { audioController } from '../core/AudioController.js';
import { wait } from '../core/utilities.js';

export class MultiverseChamberScreen extends EventTarget {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    super();
    this._container = container;
    this._el = null;

    // Search state
    this._queriesUsed = 0;
    this._inspectedUniverses = new Map(); // id -> result
    this._currentUniverse = null;
    this._viewer3D = null;
    this._isScanning = false;
    this._targetUniverseId = '07';

    this._onKeyDown = (e) => this._handleKeyDown(e);
  }

  async show() {
    this._el = this._buildChamberDOM();
    this._container.appendChild(this._el);

    document.addEventListener('keydown', this._onKeyDown);

    await wait(60);
    this._el.classList.add('visible');

    // Stagger reveal portals
    const portals = this._el.querySelectorAll('.portal-card');
    portals.forEach((p, idx) => {
      setTimeout(() => p.classList.add('visible'), 150 + idx * 90);
    });
  }

  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
    this._closeUniverseView();
    this._el?.remove();
    this._el = null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DOM BUILDERS — CHAMBER VIEW
  // ═══════════════════════════════════════════════════════════════════════════

  _buildChamberDOM() {
    const root = document.createElement('div');
    root.classList.add('multiverse-chamber-screen');
    root.id = 'multiverse-chamber-screen';

    // Top Header & Stats
    const header = document.createElement('header');
    header.classList.add('chamber-header');

    const titleGroup = document.createElement('div');
    titleGroup.classList.add('header-title-group');

    const tag = document.createElement('p');
    tag.classList.add('header-tag');
    tag.textContent = 'ASGARDIAN SEARCH CHAMBER — CANDIDATE REALITIES';

    const h1 = document.createElement('h1');
    h1.classList.add('chamber-title');
    h1.textContent = 'MULTIVERSE SEARCH';

    titleGroup.appendChild(tag);
    titleGroup.appendChild(h1);
    header.appendChild(titleGroup);

    // Live Metrics Bar
    const metrics = document.createElement('div');
    metrics.classList.add('chamber-metrics');

    const searchSpace = this._createMetricItem('SEARCH SPACE', '8 UNIVERSES');
    this._metricQueries = this._createMetricItem('QUERIES USED', `${this._queriesUsed}`);
    this._metricChecked = this._createMetricItem('CHECKED', `${this._inspectedUniverses.size} / 8`);

    metrics.appendChild(searchSpace);
    metrics.appendChild(this._metricQueries);
    metrics.appendChild(this._metricChecked);
    header.appendChild(metrics);

    root.appendChild(header);

    // Mission & Defense Requirements Banner
    const missionBar = document.createElement('div');
    missionBar.classList.add('mission-bar');

    const missionTag = document.createElement('span');
    missionTag.classList.add('mission-badge');
    missionTag.textContent = 'MISSION';

    const missionText = document.createElement('span');
    missionText.classList.add('mission-desc');
    missionText.textContent = "Find a universe where the team can survive Doom's defense.";

    const profileToggle = document.createElement('button');
    profileToggle.classList.add('profile-toggle-btn');
    profileToggle.textContent = 'DOOM DEFENSE PROFILE ▸';
    profileToggle.addEventListener('click', () => {
      profilePanel.classList.toggle('open');
      profileToggle.textContent = profilePanel.classList.contains('open')
        ? 'DOOM DEFENSE PROFILE ▾'
        : 'DOOM DEFENSE PROFILE ▸';
    });

    missionBar.appendChild(missionTag);
    missionBar.appendChild(missionText);
    missionBar.appendChild(profileToggle);
    root.appendChild(missionBar);

    // Expandable Doom Defense Profile Drawer
    const profilePanel = document.createElement('div');
    profilePanel.classList.add('doom-profile-drawer');
    profilePanel.innerHTML = `
      <div class="drawer-inner">
        <p class="drawer-title">A successful team requires all three tactical parameters:</p>
        <div class="defense-req-list">
          <div class="req-chip"><span class="chip-code">[ MYSTIC COUNTER ]</span> Neutralizes Doom’s arcane eldritch shields</div>
          <div class="req-chip"><span class="chip-code">[ TECHNOLOGICAL COUNTER ]</span> Overrides Doom Engine computational core</div>
          <div class="req-chip"><span class="chip-code">[ DIMENSIONAL ANCHOR ]</span> Prevents team dissolution during multiverse collapse</div>
        </div>
      </div>
    `;
    root.appendChild(profilePanel);

    // 8 Portals Grid
    const grid = document.createElement('div');
    grid.classList.add('portals-grid');
    grid.id = 'portals-grid';

    UNIVERSES.forEach((uni) => {
      const card = this._buildPortalCard(uni);
      grid.appendChild(card);
    });

    root.appendChild(grid);

    // Bottom Status Bar
    const statusBar = document.createElement('footer');
    statusBar.classList.add('chamber-footer');
    statusBar.innerHTML = `
      <span class="footer-hint">CLICK A CANDIDATE REALITY TO EXAMINE THE TEAM IN 3D</span>
      <span class="footer-strategy">CLASSICAL STRATEGY: SEQUENTIAL BRUTE FORCE SCAN</span>
    `;
    root.appendChild(statusBar);

    return root;
  }

  _createMetricItem(label, val) {
    const item = document.createElement('div');
    item.classList.add('metric-item');
    item.innerHTML = `
      <span class="metric-label">${label}</span>
      <span class="metric-val">${val}</span>
    `;
    return item;
  }

  _buildPortalCard(uni) {
    const card = document.createElement('div');
    card.classList.add('portal-card');
    card.id = `portal-card-${uni.id}`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-id', uni.id);

    const prevResult = this._inspectedUniverses.get(uni.id);
    if (prevResult) {
      card.classList.add(prevResult.viable ? 'status-viable' : 'status-rejected');
    }

    // Rotating Portal Ring Animation
    const ringWrap = document.createElement('div');
    ringWrap.classList.add('portal-ring-wrap');
    ringWrap.innerHTML = `
      <div class="card-portal-ring"></div>
      <div class="card-portal-core"></div>
    `;

    // Portal ID and Code
    const meta = document.createElement('div');
    meta.classList.add('card-meta');

    const num = document.createElement('span');
    num.classList.add('card-universe-num');
    num.textContent = uni.name;

    const code = document.createElement('span');
    code.classList.add('card-universe-code');
    code.textContent = uni.code;

    meta.appendChild(num);
    meta.appendChild(code);

    // Team Preview Tags
    const teamPreview = document.createElement('div');
    teamPreview.classList.add('card-team-preview');
    uni.team.forEach(h => {
      const hBadge = document.createElement('span');
      hBadge.classList.add('card-hero-chip');
      hBadge.textContent = h.name;
      teamPreview.appendChild(hBadge);
    });

    // Inspection Status Indicator (pill capsule badge with glowing orb)
    let statusText = 'UNEXAMINED';
    let orbClass = 'unexamined';
    if (prevResult?.scanned) {
      statusText = prevResult.viable ? 'VIABLE' : 'REJECTED';
      orbClass = prevResult.viable ? 'viable' : 'rejected';
    } else if (prevResult?.visited) {
      statusText = 'EXAMINED';
      orbClass = 'examined';
    }

    const statusBadge = document.createElement('div');
    statusBadge.classList.add('card-status-badge');
    statusBadge.innerHTML = `<span class="status-orb ${orbClass}"></span>${statusText}`;

    card.appendChild(ringWrap);
    card.appendChild(meta);
    card.appendChild(teamPreview);
    card.appendChild(statusBadge);

    // Interactions
    card.addEventListener('mouseenter', () => audioController.playHover());
    card.addEventListener('click', () => this._openUniverse(uni));
    card.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this._openUniverse(uni);
      }
    });

    return card;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIVERSE INSPECTION VIEW (3D VIEWPORT & PHYSICAL SCANNER)
  // ═══════════════════════════════════════════════════════════════════════════

  async _openUniverse(universe) {
    if (this._isScanning) return;
    this._currentUniverse = universe;
    audioController.playSelect();

    // Mark as examined immediately if not previously recorded
    if (!this._inspectedUniverses.has(universe.id)) {
      const examData = { visited: true, scanned: false, viable: false };
      this._inspectedUniverses.set(universe.id, examData);
      this._updateChamberPortalCard(universe.id, examData);
      this._updateMetrics();
    }

    // Build modal / full screen universe viewport
    const viewContainer = document.createElement('div');
    viewContainer.classList.add('universe-inspection-overlay');
    viewContainer.id = 'universe-inspection-overlay';

    // 3D Canvas Mount Point
    const canvasWrap = document.createElement('div');
    canvasWrap.classList.add('universe-3d-wrap');

    // Loading Screen for Models
    const loadingScreen = document.createElement('div');
    loadingScreen.classList.add('universe-loading-layer');
    loadingScreen.innerHTML = `
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <p class="loader-title">INITIALIZING REALITY MANIFOLD...</p>
        <p class="loader-subtitle">STAGING 3D TIMELINE MATRIX</p>
        <div class="loader-progress-bar"><div class="progress-fill" id="model-progress-fill" style="width: 0%"></div></div>
        <p class="loader-pct" id="model-progress-text">0%</p>
      </div>
    `;

    // Inspection HUD
    const hud = document.createElement('div');
    hud.classList.add('inspection-hud');

    // HUD Top Bar
    const hudTop = document.createElement('div');
    hudTop.classList.add('hud-top');
    hudTop.innerHTML = `
      <div class="hud-universe-info">
        <span class="hud-tag">PARALLEL TIMELINE INSPECTION</span>
        <h2 class="hud-universe-title">${universe.name} <span class="hud-code">${universe.code}</span></h2>
        <p class="hud-universe-desc">${universe.description}</p>
      </div>
      <button class="hud-back-btn" id="hud-back-btn" aria-label="Return to Multiverse Chamber">✕ CLOSE [ESC]</button>
    `;

    // Team Roster Badges
    const teamBar = document.createElement('div');
    teamBar.classList.add('hud-team-bar');

    const teamHeader = document.createElement('div');
    teamHeader.classList.add('hud-team-header');
    teamHeader.textContent = 'DIMENSIONAL ROSTER';
    teamBar.appendChild(teamHeader);

    const teamChipsWrap = document.createElement('div');
    teamChipsWrap.classList.add('hud-team-chips');
    universe.team.forEach(h => {
      const chip = document.createElement('div');
      chip.classList.add('hud-hero-card');
      chip.innerHTML = `
        <span class="hero-name">${h.name}</span>
        <span class="hero-role">${h.role}</span>
      `;
      teamChipsWrap.appendChild(chip);
    });
    teamBar.appendChild(teamChipsWrap);

    // Scanner Widget Panel
    const scannerPanel = document.createElement('div');
    scannerPanel.classList.add('scanner-panel');
    scannerPanel.id = 'scanner-panel';

    const scanHeader = document.createElement('div');
    scanHeader.classList.add('scanner-header');
    scanHeader.innerHTML = `
      <span class="scanner-title">DOOM COMPATIBILITY SCAN</span>
      <span class="scanner-status" id="scanner-state-label">READY</span>
    `;

    const scanConditions = document.createElement('div');
    scanConditions.classList.add('scanner-conditions');
    scanConditions.innerHTML = `
      <div class="condition-row" id="cond-mystic">
        <span class="cond-name">MYSTIC COUNTER</span>
        <span class="cond-val" id="val-mystic">STANDBY</span>
      </div>
      <div class="condition-row" id="cond-tech">
        <span class="cond-name">TECHNOLOGICAL COUNTER</span>
        <span class="cond-val" id="val-tech">STANDBY</span>
      </div>
      <div class="condition-row" id="cond-dim">
        <span class="cond-name">DIMENSIONAL ANCHOR</span>
        <span class="cond-val" id="val-dim">STANDBY</span>
      </div>
    `;

    const scanFooter = document.createElement('div');
    scanFooter.classList.add('scanner-footer');
    scanFooter.id = 'scanner-footer';

    const scanBtn = document.createElement('button');
    scanBtn.classList.add('start-scan-btn');
    scanBtn.id = 'start-scan-btn';
    scanBtn.textContent = 'RUN COMPATIBILITY SCAN [1 QUERY]';
    scanBtn.addEventListener('click', () => this._runPhysicalScan(universe));

    scanFooter.appendChild(scanBtn);

    scannerPanel.appendChild(scanHeader);
    scannerPanel.appendChild(scanConditions);
    scannerPanel.appendChild(scanFooter);

    // Bottom HUD Row (holds team badges at bottom-left and scanner at bottom-right)
    const hudBottom = document.createElement('div');
    hudBottom.classList.add('hud-bottom');
    hudBottom.appendChild(teamBar);
    hudBottom.appendChild(scannerPanel);

    hud.appendChild(hudTop);
    hud.appendChild(hudBottom);

    viewContainer.appendChild(canvasWrap);
    viewContainer.appendChild(loadingScreen);
    viewContainer.appendChild(hud);

    this._el.appendChild(viewContainer);

    // Wire Close button
    viewContainer.querySelector('#hud-back-btn').addEventListener('click', () => {
      this._closeUniverseView();
    });

    await wait(40);
    viewContainer.classList.add('visible');

    // Mount 3D Three.js Universe Viewer
    this._viewer3D = new Universe3DViewer(canvasWrap, universe, (pct) => {
      const fill = loadingScreen.querySelector('#model-progress-fill');
      const text = loadingScreen.querySelector('#model-progress-text');
      if (fill) fill.style.width = `${pct}%`;
      if (text) text.textContent = `${pct}%`;
      if (pct >= 100) {
        setTimeout(() => {
          loadingScreen.classList.add('faded');
          setTimeout(() => loadingScreen.remove(), 400);
        }, 200);
      }
    });

    // If universe was previously inspected, show previous result immediately
    const prev = this._inspectedUniverses.get(universe.id);
    if (prev) {
      this._displayPreScannedResult(prev);
    }
  }

  _closeUniverseView() {
    if (this._isScanning) return;
    const overlay = document.getElementById('universe-inspection-overlay');
    if (!overlay) return;

    audioController.playTransition();
    overlay.classList.remove('visible');

    setTimeout(() => {
      this._viewer3D?.dispose();
      this._viewer3D = null;
      overlay.remove();
      this._currentUniverse = null;
    }, 400);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHYSICAL SEQUENTIAL SCANNER
  // ═══════════════════════════════════════════════════════════════════════════

  async _runPhysicalScan(universe) {
    if (this._isScanning) return;
    this._isScanning = true;

    // Increment queries
    this._queriesUsed++;
    this._updateMetrics();

    const scanBtn = document.getElementById('start-scan-btn');
    const stateLabel = document.getElementById('scanner-state-label');
    const valMystic = document.getElementById('val-mystic');
    const valTech = document.getElementById('val-tech');
    const valDim = document.getElementById('val-dim');
    const footer = document.getElementById('scanner-footer');

    if (scanBtn) {
      scanBtn.disabled = true;
      scanBtn.textContent = 'SCANNING REALITY...';
    }
    if (stateLabel) stateLabel.textContent = 'IN PROGRESS';

    // Evaluate candidate against Doom defense predicate
    const rawResult = evaluateUniverse(universe);
    const result = { ...rawResult, visited: true, scanned: true };
    this._inspectedUniverses.set(universe.id, result);
    this._updateChamberPortalCard(universe.id, result);
    this._updateMetrics();

    // STEP 1 — Mystic Counter Scan
    valMystic.textContent = 'SCANNING...';
    valMystic.className = 'cond-val scanning';
    audioController.playScanStep(0);
    await wait(800);

    if (result.mystic) {
      valMystic.textContent = '✓ DETECTED';
      valMystic.className = 'cond-val detected';
    } else {
      valMystic.textContent = '✕ ABSENT';
      valMystic.className = 'cond-val absent';
    }

    // STEP 2 — Technological Counter Scan
    valTech.textContent = 'SCANNING...';
    valTech.className = 'cond-val scanning';
    audioController.playScanStep(1);
    await wait(800);

    if (result.technology) {
      valTech.textContent = '✓ DETECTED';
      valTech.className = 'cond-val detected';
    } else {
      valTech.textContent = '✕ ABSENT';
      valTech.className = 'cond-val absent';
    }

    // STEP 3 — Dimensional Anchor Scan
    valDim.textContent = 'SCANNING...';
    valDim.className = 'cond-val scanning';
    audioController.playScanStep(2);
    await wait(800);

    if (result.dimensional) {
      valDim.textContent = '✓ DETECTED';
      valDim.className = 'cond-val detected';
    } else {
      valDim.textContent = '✕ ABSENT';
      valDim.className = 'cond-val absent';
    }

    await wait(500);

    // FINAL RESOLUTION
    if (result.viable) {
      // VIABLE UNIVERSE FOUND (Universe 07)
      audioController.playScanSuccess();
      this._viewer3D?.energize();

      if (stateLabel) {
        stateLabel.textContent = 'VIABLE';
        stateLabel.className = 'scanner-status viable';
      }

      footer.innerHTML = `
        <div class="result-box result-viable">
          <div class="result-tag">DOOM COMPATIBILITY</div>
          <div class="result-progress-bar">████████████████</div>
          <div class="result-verdict">VIABLE</div>
          <p class="result-msg">All three Doom defense parameters satisfied. Reality capable of sustaining counter-offensive.</p>
          <button class="proceed-summary-btn" id="proceed-summary-btn">PROCEED TO SEARCH DEBRIEF ▸</button>
        </div>
      `;

      document.getElementById('proceed-summary-btn')?.addEventListener('click', () => {
        this._closeUniverseView();
        setTimeout(() => this._showSearchDebrief(), 450);
      });
    } else {
      // FAILED UNIVERSE
      audioController.playScanFail();

      if (stateLabel) {
        stateLabel.textContent = 'REJECTED';
        stateLabel.className = 'scanner-status rejected';
      }

      footer.innerHTML = `
        <div class="result-box result-rejected">
          <div class="result-verdict">RESULT: NOT VIABLE</div>
          <p class="result-reason">${result.failureReason}</p>
          <button class="return-btn" id="return-btn">RETURN TO MULTIVERSE [ESC]</button>
        </div>
      `;

      document.getElementById('return-btn')?.addEventListener('click', () => {
        this._closeUniverseView();
      });
    }

    this._isScanning = false;
    this._updateMetrics();
  }

  _displayPreScannedResult(result) {
    const valMystic = document.getElementById('val-mystic');
    const valTech = document.getElementById('val-tech');
    const valDim = document.getElementById('val-dim');
    const stateLabel = document.getElementById('scanner-state-label');
    const footer = document.getElementById('scanner-footer');

    if (valMystic) {
      valMystic.textContent = result.mystic ? '✓ DETECTED' : '✕ ABSENT';
      valMystic.className = `cond-val ${result.mystic ? 'detected' : 'absent'}`;
    }
    if (valTech) {
      valTech.textContent = result.technology ? '✓ DETECTED' : '✕ ABSENT';
      valTech.className = `cond-val ${result.technology ? 'detected' : 'absent'}`;
    }
    if (valDim) {
      valDim.textContent = result.dimensional ? '✓ DETECTED' : '✕ ABSENT';
      valDim.className = `cond-val ${result.dimensional ? 'detected' : 'absent'}`;
    }
    if (stateLabel) {
      stateLabel.textContent = result.viable ? 'VIABLE' : 'REJECTED';
      stateLabel.className = `scanner-status ${result.viable ? 'viable' : 'rejected'}`;
    }

    if (footer) {
      if (result.viable) {
        footer.innerHTML = `
          <div class="result-box result-viable">
            <div class="result-tag">DOOM COMPATIBILITY</div>
            <div class="result-verdict">VIABLE</div>
            <button class="proceed-summary-btn" id="proceed-summary-btn">PROCEED TO SEARCH DEBRIEF ▸</button>
          </div>
        `;
        document.getElementById('proceed-summary-btn')?.addEventListener('click', () => {
          this._closeUniverseView();
          setTimeout(() => this._showSearchDebrief(), 450);
        });
      } else {
        footer.innerHTML = `
          <div class="result-box result-rejected">
            <div class="result-verdict">RESULT: NOT VIABLE</div>
            <p class="result-reason">${result.failureReason}</p>
            <button class="return-btn" id="return-btn">RETURN TO MULTIVERSE [ESC]</button>
          </div>
        `;
        document.getElementById('return-btn')?.addEventListener('click', () => {
          this._closeUniverseView();
        });
      }
    }
  }

  _updateMetrics() {
    if (this._metricQueries) {
      const qVal = this._metricQueries.querySelector('.metric-val');
      if (qVal) qVal.textContent = `${this._queriesUsed}`;
    }
    if (this._metricChecked) {
      const cVal = this._metricChecked.querySelector('.metric-val');
      if (cVal) cVal.textContent = `${this._inspectedUniverses.size} / 8`;
    }
  }

  _updateChamberPortalCard(id, result) {
    const card = document.getElementById(`portal-card-${id}`);
    if (!card) return;

    card.classList.remove('status-viable', 'status-rejected', 'status-examined');

    if (result.scanned) {
      card.classList.add(result.viable ? 'status-viable' : 'status-rejected');
    } else if (result.visited) {
      card.classList.add('status-examined');
    }

    const badge = card.querySelector('.card-status-badge');
    if (badge) {
      if (result.scanned) {
        badge.innerHTML = result.viable
          ? '<span class="status-orb viable"></span>VIABLE'
          : '<span class="status-orb rejected"></span>REJECTED';
      } else if (result.visited) {
        badge.innerHTML = '<span class="status-orb examined"></span>EXAMINED';
      } else {
        badge.innerHTML = '<span class="status-orb unexamined"></span>UNEXAMINED';
      }
    }
  }

  _handleKeyDown(e) {
    if (e.code === 'Escape') {
      if (this._currentUniverse && !this._isScanning) {
        this._closeUniverseView();
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEARCH DEBRIEF SCREEN — BRUTE FORCE COST REALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  async _showSearchDebrief() {
    audioController.playSelect();

    const debrief = document.createElement('div');
    debrief.classList.add('search-debrief-screen');
    debrief.id = 'search-debrief-screen';

    debrief.innerHTML = `
      <div class="debrief-content">
        <p class="debrief-tag">CLASSICAL BRUTE FORCE EVALUATION</p>
        <h2 class="debrief-title">SEARCH COMPLETE</h2>

        <div class="debrief-stats-grid">
          <div class="debrief-stat-card">
            <span class="dstat-label">SEARCH SPACE</span>
            <span class="dstat-val">8 UNIVERSES</span>
          </div>
          <div class="debrief-stat-card">
            <span class="dstat-label">UNIVERSES CHECKED</span>
            <span class="dstat-val" id="dstat-checked">${this._inspectedUniverses.size} / 8</span>
          </div>
          <div class="debrief-stat-card">
            <span class="dstat-label">QUERIES USED</span>
            <span class="dstat-val" id="dstat-queries">${this._queriesUsed}</span>
          </div>
        </div>

        <div class="debrief-narrative">
          <p class="narrative-line" id="debrief-line-1">${this._queriesUsed} universes. One answer.</p>
          <p class="narrative-line" id="debrief-line-2">But something is wrong.</p>
          <p class="narrative-line" id="debrief-line-3">If Doom can counter that universe... why limit ourselves to one?</p>
          <p class="narrative-line dramatic" id="debrief-line-4">Every reality has heroes. Let's search the heroes.</p>
        </div>

        <div class="debrief-actions" id="debrief-actions">
          <button class="stage-primary-btn" id="debrief-proceed-btn">ENTER MULTIVERSE HERO SEARCH ▸</button>
          <button class="debrief-replay-btn" id="debrief-replay-btn">↺ SEARCH AGAIN</button>
        </div>
      </div>
    `;

    this._el.appendChild(debrief);

    await wait(60);
    debrief.classList.add('visible');

    // Stagger narrative lines
    const lineDelays = [800, 2200, 4200, 6400];
    lineDelays.forEach((delay, idx) => {
      setTimeout(() => {
        const line = debrief.querySelector(`#debrief-line-${idx + 1}`);
        if (line) line.classList.add('visible');
      }, delay);
    });

    // Reveal actions after narrative
    setTimeout(() => {
      const actions = debrief.querySelector('#debrief-actions');
      if (actions) actions.classList.add('visible');
    }, 8200);

    // Proceed to Quantum Multiverse Hero Search
    debrief.querySelector('#debrief-proceed-btn').addEventListener('click', () => {
      audioController.playSelect();
      this.dispatchEvent(new CustomEvent('proceed_to_quantum', {
        detail: { queriesUsed: this._queriesUsed }
      }));
    });

    // Replay handler
    debrief.querySelector('#debrief-replay-btn').addEventListener('click', () => {
      this._resetSearch();
      debrief.remove();
    });
  }

  _resetSearch() {
    this._queriesUsed = 0;
    this._inspectedUniverses.clear();
    this._updateMetrics();

    // Reset portal cards
    UNIVERSES.forEach(u => {
      const card = document.getElementById(`portal-card-${u.id}`);
      if (card) {
        card.classList.remove('status-viable', 'status-rejected');
        const badge = card.querySelector('.card-status-badge');
        if (badge) badge.textContent = 'UNEXAMINED';
      }
    });

    audioController.playTransition();
  }
}
