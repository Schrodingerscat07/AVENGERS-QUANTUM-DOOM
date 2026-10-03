/**
 * Act1StagesManager.js
 *
 * Coordinates the full educational and narrative progression of ACT 1:
 * - ACT 1B: Realization ("A universe isn't the answer... Let's search the heroes")
 * - ACT 1C: Build the Multiverse Hero Search Space (24 heroes, 15 qubits, 12,144 teams)
 * - ACT 1D: First Quantum Experiment — Uniform Superposition (H^(⊗15))
 * - ACT 1E: The Doom Oracle — Marking Viable Teams (Phase Inversion)
 * - ACT 1F: Discover Phase — Quantum Lens inspection (0° vs 180°)
 * - ACT 1G: Diffusion / Resonance — Inversion about the mean (2*mean - alpha)
 * - ACT 1H: Interference & Amplitude Amplification — Grover Operator G = D * O
 * - ACT 1I: Measurement & Collapse — 3D Hero Manifestation
 * - ACT 1J: Intentionally Break the Algorithm — Overshooting Sandbox (N=64, M=1)
 * - ACT 1K: Classical vs Quantum Query Complexity — O(N) vs O(sqrt(N))
 * - ACT 1L: Multiple Valid Solutions (M=4)
 * - ACT 1M: Unknown Number of Solutions
 * - ACT 1N: Advanced Cross-Reality Team Search
 * - ACT 1O: Progressive Threshold Search (75 -> 85 -> 90 -> 95)
 * - ACT 1P: Final Act-1 Mission — Elite Team Manifestation in 3D
 * - ACT 1 END: Complete & Act 2 Teaser
 */

import {
  HERO_ROSTER,
  TOTAL_HEROES,
  decodeBasisState,
  evaluateCrossRealityTeam,
  countValidTeams,
} from '../quantum/heroRosterData.js';
import { QuantumStatevector } from '../quantum/QuantumStatevector.js';
import { QuantumConstellationViewer } from '../quantum/QuantumConstellationViewer.js';
import { HeroRosterPreview } from './HeroRosterPreview.js';
import { ScreenHeroModel } from './ScreenHeroModel.js';
import { Universe3DViewer } from './Universe3DViewer.js';
import { audioController } from '../core/AudioController.js';
import { wait } from '../core/utilities.js';

const CORE_GUIDE_STAGES = ['ACT_1B', 'ACT_1C', 'ACT_1D', 'ACT_1E', 'ACT_1F', 'ACT_1G', 'ACT_1H', 'ACT_1I'];
const QUANTUM_VISUAL_POINTS = 384;
const STAGE_GUIDANCE = {
  ACT_1B: { title: 'Choose what to search', action: 'Next: search combinations of heroes instead of checking more universes.' },
  ACT_1C: { title: 'Set up the candidate space', action: 'Next: initialize the register that represents every possible team.' },
  ACT_1D: { title: 'Give every state an equal starting chance', action: 'Click “Create equal starting state.” 12,144 states encode legal teams; the register has 32,768 total states.' },
  ACT_1E: { title: 'Mark the teams that meet the rules', action: 'Click “Mark viable teams.” The oracle flips their phase; it does not raise their probability yet.' },
  ACT_1F: { title: 'Read the phase change', action: 'The marked and unmarked teams are equally likely. Continue to see how interference changes that.' },
  ACT_1G: { title: 'Turn phase into a probability difference', action: 'Apply diffusion once. It reflects amplitudes around their average.' },
  ACT_1H: { title: 'Repeat the Grover search step', action: 'Click “Run one Grover step,” then watch the success probability rise before measuring.' },
  ACT_1I: { title: 'Measure one candidate', action: 'Measurement samples one team using its probability. A stronger peak makes a viable team more likely.' },
  ACT_1J: { title: 'Advanced lab: see why timing matters', action: 'Step the search past its peak, then reset. Too many iterations can lower success again.' },
  ACT_1K: { title: 'Advanced lab: compare query counts', action: 'Compare classical checks with Grover’s approximate √N oracle queries.' },
  ACT_1L: { title: 'Advanced lab: mark several answers', action: 'Run a Grover step and watch probability collect across multiple valid teams.' },
  ACT_1M: { title: 'Advanced lab: unknown answer count', action: 'Continue to the search strategy for when the number of marked teams is unknown.' },
  ACT_1N: { title: 'Advanced lab: search across realities', action: 'Continue to define a cross-reality team search.' },
  ACT_1O: { title: 'Advanced lab: tighten the success rule', action: 'Check each survival threshold in order, then launch the elite search.' },
  ACT_1P: { title: 'Advanced lab: find the elite team', action: 'Amplify the three elite configurations, then measure the register.' },
  ACT_1_COMPLETE: { title: 'Guided Grover search complete', action: 'Review the four ideas, or choose the advanced lab to explore limits and harder searches.' },
};

export class Act1StagesManager extends EventTarget {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    super();
    this._container = container;
    this._el = null;

    // Active stage
    this._stage = 'ACT_1B'; // start immediately after classical search

    // 15-qubit quantum simulator
    this.sim = new QuantumStatevector(15);
    // Sandbox 6-qubit simulator for Act 1J, 1K, 1L, 1M
    this.sandboxSim = new QuantumStatevector(6);

    this._constellation = null;
    this._heroPreview = null;
    this._dialogueHeroModel = null;
    this._viewer3D = null;
    this._currentThreshold = 75;
    this._quantumLensOpen = false;

    // Tracking
    this._classicalQueries = 7;
    this._quantumQueries = 0;
  }

  async show() {
    this._el = document.createElement('div');
    this._el.classList.add('act1-stages-container');
    this._el.id = 'act1-stages-container';
    this._container.appendChild(this._el);

    await wait(40);
    this._el.classList.add('visible');

    this._renderCurrentStage();
  }

  destroy() {
    this._constellation?.dispose();
    this._heroPreview?.dispose();
    this._dialogueHeroModel?.dispose();
    this._viewer3D?.dispose();
    this._el?.remove();
    this._el = null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE ROUTER
  // ═══════════════════════════════════════════════════════════════════════════

  _setStage(stage) {
    this._stage = stage;
    audioController.playTransition();
    this._renderCurrentStage();
  }

  _renderCurrentStage() {
    this._heroPreview?.dispose();
    this._heroPreview = null;
    this._dialogueHeroModel?.dispose();
    this._dialogueHeroModel = null;
    this._el.innerHTML = '';

    // Render Global Quantum Lens Button & Drawer
    this._renderQuantumLens();
    this._renderLearningGuide();

    switch (this._stage) {
      case 'ACT_1B':
        this._renderAct1B_Realization();
        break;
      case 'ACT_1C':
        this._renderAct1C_Roster();
        break;
      case 'ACT_1D':
        this._renderAct1D_Superposition();
        break;
      case 'ACT_1E':
        this._renderAct1E_Oracle();
        break;
      case 'ACT_1F':
        this._renderAct1F_Phase();
        break;
      case 'ACT_1G':
        this._renderAct1G_Diffusion();
        break;
      case 'ACT_1H':
        this._renderAct1H_Interference();
        break;
      case 'ACT_1I':
        this._renderAct1I_Measurement();
        break;
      case 'ACT_1J':
        this._renderAct1J_Overshoot();
        break;
      case 'ACT_1K':
        this._renderAct1K_Complexity();
        break;
      case 'ACT_1L':
        this._renderAct1L_Multiple();
        break;
      case 'ACT_1M':
        this._renderAct1M_Unknown();
        break;
      case 'ACT_1N':
        this._renderAct1N_TeamSearch();
        break;
      case 'ACT_1O':
        this._renderAct1O_Threshold();
        break;
      case 'ACT_1P':
        this._renderAct1P_FinalMission();
        break;
      case 'ACT_1_COMPLETE':
        this._renderAct1_Complete();
        break;
      default:
        this._renderAct1B_Realization();
    }

    if (['ACT_1D', 'ACT_1E', 'ACT_1G', 'ACT_1H', 'ACT_1I'].includes(this._stage)) {
      const visual = this._el.querySelector('.stage-interactive-screen');
      if (visual) {
        const legend = document.createElement('aside');
        legend.className = 'state-visual-legend';
        legend.innerHTML = `
          <span class="brief-kicker">HOW TO READ THE DOTS</span>
          <span><i class="legend-dot legend-dot-dim"></i> Teal = candidate state</span>
          <span><i class="legend-dot legend-dot-marked"></i> Gold = phase-marked as viable</span>
          <span><i class="legend-dot legend-dot-large"></i> Larger = more likely when measured</span>
        `;
        visual.appendChild(legend);
      }
    }
  }

  _renderLearningGuide() {
    const stageIndex = CORE_GUIDE_STAGES.indexOf(this._stage);
    const advancedStages = ['ACT_1J', 'ACT_1K', 'ACT_1L', 'ACT_1M', 'ACT_1N', 'ACT_1O', 'ACT_1P'];
    const advancedIndex = advancedStages.indexOf(this._stage);
    const guidance = STAGE_GUIDANCE[this._stage] || STAGE_GUIDANCE.ACT_1_COMPLETE;
    const label = stageIndex >= 0
      ? `GUIDED SEARCH · STEP ${stageIndex + 1} OF ${CORE_GUIDE_STAGES.length}`
      : advancedIndex >= 0
        ? `OPTIONAL ADVANCED LAB · ${advancedIndex + 1} OF ${advancedStages.length}`
        : 'SEARCH DEBRIEF';
    const progress = stageIndex >= 0
      ? ((stageIndex + 1) / CORE_GUIDE_STAGES.length) * 100
      : advancedIndex >= 0 ? ((advancedIndex + 1) / advancedStages.length) * 100 : 100;

    const guide = document.createElement('aside');
    guide.classList.add('learning-guide');
    guide.setAttribute('aria-live', 'polite');
    guide.innerHTML = `
      <div class="learning-guide-top">
        <span class="learning-guide-count">${label}</span>
        <span class="learning-guide-progress" aria-hidden="true"><span style="width:${progress}%"></span></span>
      </div>
      <strong class="learning-guide-title">${guidance.title}</strong>
      <p class="learning-guide-action">${guidance.action}</p>
    `;
    this._el.appendChild(guide);
    this._learningGuideAction = guide.querySelector('.learning-guide-action');
  }

  _setLearningHint(message) {
    if (this._learningGuideAction) this._learningGuideAction.textContent = message;
  }

  _mountThorDialogueModel(screen) {
    const container = screen.querySelector('.thor-screen-model');
    if (container) this._dialogueHeroModel = new ScreenHeroModel(container, HERO_ROSTER[0]);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1B — THE REALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1B_Realization() {
    const wrap = document.createElement('div');
    wrap.classList.add('stage-dialogue-screen', 'thor-dialogue-screen');
    wrap.innerHTML = `
      <div class="thor-screen-model" aria-label="Thor on the mission screen">
        <div class="thor-model-loader"><i></i><span class="thor-model-loading-text">THOR MATERIALIZING</span></div>
        <span class="thor-model-caption">EARTH-118 <b>◆</b> ASGARDIAN FRONT LINE</span>
      </div>
      <div class="dialogue-box">
        <p class="dialogue-tag">ACT 1B — THE REALIZATION</p>
        <h2 class="dialogue-speaker">THOR</h2>
        <div class="dialogue-lines">
          <p class="d-line visible">"One universe was enough to find a survivor."</p>
          <p class="d-line visible">"But not enough to find our strongest team."</p>
          <p class="d-line visible">"There are heroes in other realities."</p>
          <p class="d-line visible">"Why search for a universe..."</p>
          <p class="d-line visible dramatic">"...when we can search for the heroes themselves?"</p>
          <p class="d-line visible conclusion">"Let's search the multiverse."</p>
        </div>
        <button class="stage-primary-btn" id="btn-to-1c">
          NEXT: DEFINE THE HERO SEARCH SPACE ▸
        </button>
      </div>
    `;
    this._el.appendChild(wrap);
    this._mountThorDialogueModel(wrap);
    wrap.querySelector('#btn-to-1c').addEventListener('click', () => this._setStage('ACT_1C'));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1C — BUILD THE HERO SEARCH SPACE (QUANTUM ROSTER)
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1C_Roster() {
    const wrap = document.createElement('div');
    wrap.classList.add('stage-roster-screen');
    wrap.innerHTML = `
      <header class="stage-header roster-stage-header">
        <div>
          <span class="stage-tag">ACT 1C — DEFINE THE SEARCH</span>
          <h2 class="stage-title">WHAT TEAM CAN SURVIVE?</h2>
          <p class="roster-lede">We are searching for three distinct heroes who meet Doom’s defense rules.</p>
        </div>
        <div class="stage-metrics">
          <div class="metric-card"><span class="m-label">CANDIDATES</span><span class="m-val">24 HEROES</span></div>
          <div class="metric-card"><span class="m-label">SEARCH SPACE</span><span class="m-val">12,144 TEAMS</span></div>
        </div>
      </header>

      <div class="roster-main-layout">
      <aside class="roster-character-stage" aria-label="Selected character model">
        <div class="roster-character-model" id="thor-roster-preview" data-model-state="loading"></div>
      </aside>
      <section class="search-brief" aria-label="Search rules and quantum plan">
        <div class="search-rule">
          <span class="brief-kicker">THE RULE</span>
          <strong>Build a team of 3 different heroes</strong>
          <span>It must cover <b>MYSTIC</b>, <b>TECH</b> and <b>DIMENSIONAL</b>, with a survival score of 75 or higher.</span>
        </div>
        <div class="search-plan">
          <span class="brief-kicker">WHY THESE QUANTUM STEPS?</span>
          <div class="plan-flow">
            <div><b>1 · SHARE</b><span>Give every possible team an equal starting chance.</span></div>
            <div><b>2 · MARK</b><span>The oracle flips the phase of teams that pass the rule.</span></div>
            <div><b>3 · AMPLIFY</b><span>Diffusion turns that phase tag into a higher chance to find them.</span></div>
          </div>
          <p class="search-advantage"><b>Classical:</b> check teams one by one. <b>Grover:</b> about √(N/M) oracle checks in the ideal model, then measure. This app simulates the process.</p>
        </div>
      </section>

      <div class="roster-grid-wrap">
        <div class="roster-grid-heading">
          <div><span class="brief-kicker">YOUR SEARCH POOL</span><strong>24 HEROES · 12,144 POSSIBLE TEAMS</strong></div>
          <span class="roster-pool-note">Every combination stays in play</span>
        </div>
        <div class="roster-grid">
          ${HERO_ROSTER.map((h) => {
            const initials = h.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('');
            return `
              <button class="roster-hero-card" type="button" data-id="${h.id}" aria-pressed="${h.id === HERO_ROSTER[0].id}">
                <span class="hero-avatar" aria-hidden="true">${initials}</span>
                <div class="hero-card-copy">
                  <div class="hero-card-header"><span class="hero-reality-badge">${h.originReality}</span></div>
                  <h3 class="hero-card-name">${h.name}</h3>
                  <span class="hero-card-role">${h.roleTag}</span>
                  <div class="hero-card-counters">
                    ${h.attributes.mystic ? '<span class="counter-badge counter-mystic">MYSTIC</span>' : ''}
                    ${h.attributes.technology ? '<span class="counter-badge counter-tech">TECH</span>' : ''}
                    ${h.attributes.dimensional ? '<span class="counter-badge counter-dimensional">DIMENSIONAL</span>' : ''}
                  </div>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>
      </div>

      <footer class="stage-footer">
        <span class="footer-msg">Next: spread probability across the search space.</span>
        <button class="stage-primary-btn" id="btn-to-1d">NEXT: GIVE EVERY TEAM AN EQUAL CHANCE ▸</button>
      </footer>
    `;
    this._el.appendChild(wrap);

    this._heroPreview = new HeroRosterPreview(
      wrap.querySelector('#thor-roster-preview'),
      HERO_ROSTER[0]
    );

    wrap.querySelectorAll('.roster-hero-card').forEach((card) => {
      card.addEventListener('click', () => {
        const hero = HERO_ROSTER.find((entry) => String(entry.id) === card.dataset.id);
        if (!hero) return;

        wrap.querySelectorAll('.roster-hero-card').forEach((candidate) => {
          candidate.setAttribute('aria-pressed', String(candidate === card));
        });
        this._heroPreview?.showHero(hero);
      });
    });

    wrap.querySelector('#btn-to-1d').addEventListener('click', () => {
      audioController.playSelect();
      this._setStage('ACT_1D');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1D — UNIFORM SUPERPOSITION (H^(⊗15))
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1D_Superposition() {
    this.sim.initialize(); // start in |0...0>

    const wrap = document.createElement('div');
    wrap.classList.add('stage-interactive-screen');
    wrap.innerHTML = `
      <div class="quantum-viewport" id="quantum-viewport"></div>

      <div class="quantum-stage-hud">
        <div class="hud-panel-top">
          <span class="stage-tag">ACT 1D — FIRST QUANTUM DISCOVERY</span>
          <h2 class="stage-title">UNIFORM SUPERPOSITION</h2>
          <p class="stage-desc">We start with one blank state. Hadamard gates spread its amplitude evenly across all 32,768 register states, so no team gets a head start.</p>
        </div>

        <div class="hud-panel-bottom">
          <div class="hud-info-card">
            <span class="info-label">CURRENT STATE</span>
            <span class="info-val" id="sup-state-label">GROUND STATE |0...0></span>
            <span class="info-sub" id="sup-amp-label">AMPLITUDE: 1.0 on |0>, 0 on others</span>
          </div>
          <div class="hud-actions">
            <button class="stage-primary-btn" id="btn-apply-hadamard">CREATE EQUAL STARTING STATE · APPLY H</button>
            <button class="stage-secondary-btn" id="btn-to-1e" style="display: none">NEXT: MARK SAFE TEAMS WITH THE ORACLE ▸</button>
          </div>
        </div>
      </div>
    `;
    this._el.appendChild(wrap);

    const vp = wrap.querySelector('#quantum-viewport');
    this._constellation = new QuantumConstellationViewer(vp, QUANTUM_VISUAL_POINTS);
    this._constellation.updateFromState(this.sim.getProbabilities(), this.sim.amplitudes);

    const btnHadamard = wrap.querySelector('#btn-apply-hadamard');
    const btnNext = wrap.querySelector('#btn-to-1e');
    const stateLabel = wrap.querySelector('#sup-state-label');
    const ampLabel = wrap.querySelector('#sup-amp-label');

    btnHadamard.addEventListener('click', () => {
      audioController.playSelect();
      this.sim.applyHadamard();
      this._constellation.updateFromState(this.sim.getProbabilities(), this.sim.amplitudes);

      stateLabel.textContent = 'UNIFORM SUPERPOSITION |s>';
      ampLabel.textContent = 'AMPLITUDE: α = 1/√(32,768) ≈ 0.005524 across all 32,768 states';
      this._setLearningHint('All 32,768 register states now start equally; 12,144 encode legal teams. Next, the oracle marks the safe ones.');

      btnHadamard.disabled = true;
      btnHadamard.textContent = '✓ SUPERPOSITION ACTIVE';

      setTimeout(() => {
        btnNext.style.display = 'inline-block';
        audioController.playScanSuccess();
      }, 800);
    });

    btnNext.addEventListener('click', () => {
      this._constellation?.dispose();
      this._constellation = null;
      this._setStage('ACT_1E');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1E — THE DOOM ORACLE (MARKING)
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1E_Oracle() {
    this.sim.applyHadamard();

    const wrap = document.createElement('div');
    wrap.classList.add('stage-interactive-screen');
    wrap.innerHTML = `
      <div class="quantum-viewport" id="quantum-viewport"></div>

      <div class="quantum-stage-hud">
        <div class="hud-panel-top">
          <span class="stage-tag">ACT 1E — THE DOOM ORACLE</span>
          <h2 class="stage-title">PHASE MARKING PREDICATE</h2>
          <p class="stage-desc">The oracle checks the team rule. If a team passes, it flips that state’s phase (its amplitude sign). This tags the answer; its chance of being measured stays the same for now.</p>
        </div>

        <div class="hud-panel-bottom">
          <div class="hud-info-card">
            <span class="info-label">OBSERVATION</span>
            <span class="info-val" id="oracle-status">ALL CANDIDATES EQUAL AMPLITUDE</span>
            <span class="info-sub" id="oracle-hint">Does marking increase their probability? Test it.</span>
          </div>
          <div class="hud-actions">
          <button class="stage-primary-btn" id="btn-mark-oracle">MARK SAFE TEAMS · FLIP THEIR PHASE</button>
            <button class="stage-secondary-btn" id="btn-to-1f" style="display: none">NEXT: SEE WHY A PHASE FLIP MATTERS ▸</button>
          </div>
        </div>
      </div>
    `;
    this._el.appendChild(wrap);

    const vp = wrap.querySelector('#quantum-viewport');
    this._constellation = new QuantumConstellationViewer(vp, QUANTUM_VISUAL_POINTS);
    this._constellation.updateFromState(this.sim.getProbabilities(), this.sim.amplitudes);

    const btnMark = wrap.querySelector('#btn-mark-oracle');
    const btnNext = wrap.querySelector('#btn-to-1f');
    const statusLabel = wrap.querySelector('#oracle-status');
    const hintLabel = wrap.querySelector('#oracle-hint');

    btnMark.addEventListener('click', () => {
      audioController.playScanStep(1);

      // Oracle predicate for threshold 75
      const predicate = (x) => {
        const { h1, h2, h3, isValid } = decodeBasisState(x);
        if (!isValid) return false;
        return evaluateCrossRealityTeam(h1, h2, h3, 75).viable;
      };

      const { markedCount } = this.sim.applyPhaseOracle(predicate);
      this._constellation.updateFromState(this.sim.getProbabilities(), this.sim.amplitudes);

      statusLabel.textContent = `${markedCount} STATES PHASE-INVERTED`;
      hintLabel.textContent = 'NOTICE: Magnitude |α|² did NOT change. Probability remains identical.';
      this._setLearningHint(`${markedCount.toLocaleString()} teams were marked. Their chance is unchanged for now; the oracle changed only their phase.`);

      btnMark.disabled = true;
      btnMark.textContent = '✓ STATES MARKED (PHASE π)';

      setTimeout(() => {
        btnNext.style.display = 'inline-block';
      }, 700);
    });

    btnNext.addEventListener('click', () => {
      this._constellation?.dispose();
      this._constellation = null;
      this._setStage('ACT_1F');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1F — DISCOVER PHASE
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1F_Phase() {
    const wrap = document.createElement('div');
    wrap.classList.add('stage-dialogue-screen');
    wrap.innerHTML = `
      <div class="dialogue-box">
        <p class="dialogue-tag">ACT 1F — DISCOVER PHASE</p>
        <h2 class="dialogue-speaker">THE NATURE OF QUANTUM PHASE</h2>

        <div class="phase-comparison-grid">
          <div class="phase-card">
            <span class="pcard-label">UNMARKED CANDIDATE</span>
            <div class="phase-indicator arrow-right">→</div>
            <div class="pcard-stat"><span>AMPLITUDE:</span> <strong>+0.005524</strong></div>
            <div class="pcard-stat"><span>PHASE:</span> <strong>0° (0 rad)</strong></div>
            <div class="pcard-stat"><span>PROBABILITY |α|²:</span> <strong>0.0000305</strong></div>
          </div>
          <div class="phase-card marked-highlight">
            <span class="pcard-label">MARKED CANDIDATE (VIABLE TEAM)</span>
            <div class="phase-indicator arrow-left">←</div>
            <div class="pcard-stat"><span>AMPLITUDE:</span> <strong>-0.005524</strong></div>
            <div class="pcard-stat"><span>PHASE:</span> <strong>180° (π rad)</strong></div>
            <div class="pcard-stat"><span>PROBABILITY |α|²:</span> <strong>0.0000305</strong></div>
          </div>
        </div>

        <div class="dialogue-lines" style="margin-top: 20px">
          <p class="d-line visible">"The target did not grow in probability."</p>
          <p class="d-line visible dramatic">"Its amplitude became negative. Its phase flipped."</p>
          <p class="d-line visible">"Now we need an operation that turns phase difference into amplitude difference."</p>
        </div>

        <button class="stage-primary-btn" id="btn-to-1g" style="margin-top: 24px">
          NEXT: USE DIFFUSION TO CHANGE AMPLITUDES ▸
        </button>
      </div>
    `;
    this._el.appendChild(wrap);

    wrap.querySelector('#btn-to-1g').addEventListener('click', () => {
      audioController.playSelect();
      this._setStage('ACT_1G');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1G — DIFFUSION / RESONANCE
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1G_Diffusion() {
    // Continue from the oracle-marked state shown on the previous screen.

    const wrap = document.createElement('div');
    wrap.classList.add('stage-interactive-screen');
    wrap.innerHTML = `
      <div class="quantum-viewport" id="quantum-viewport"></div>

      <div class="quantum-stage-hud">
        <div class="hud-panel-top">
          <span class="stage-tag">ACT 1G — DIFFUSION OPERATOR</span>
          <h2 class="stage-title">INVERSION ABOUT THE MEAN</h2>
          <p class="stage-desc">Diffusion reflects every amplitude around the average. The oracle-tagged states then move above that average, so their measurement chances grow. The quantum lens shows the equation.</p>
        </div>

        <div class="hud-panel-bottom">
          <div class="hud-info-card">
            <span class="info-label">DIFFUSION STATUS</span>
            <span class="info-val" id="diff-status">AWAITING RESONANCE INVERSION</span>
          <span class="info-sub" id="diff-sub">This step changes amplitude, which changes measurement probability.</span>
          </div>
          <div class="hud-actions">
            <button class="stage-primary-btn" id="btn-apply-diffusion">APPLY DIFFUSION ONCE</button>
            <button class="stage-secondary-btn" id="btn-to-1h" style="display: none">NEXT: REPEAT THE FULL GROVER STEP ▸</button>
          </div>
        </div>
      </div>
    `;
    this._el.appendChild(wrap);

    const vp = wrap.querySelector('#quantum-viewport');
    this._constellation = new QuantumConstellationViewer(vp, QUANTUM_VISUAL_POINTS);
    this._constellation.updateFromState(this.sim.getProbabilities(), this.sim.amplitudes);

    const btnDiff = wrap.querySelector('#btn-apply-diffusion');
    const btnNext = wrap.querySelector('#btn-to-1h');
    const statusVal = wrap.querySelector('#diff-status');
    const subVal = wrap.querySelector('#diff-sub');

    btnDiff.addEventListener('click', () => {
      audioController.playSelect();
      const { mean } = this.sim.applyDiffusion();
      this._constellation.updateFromState(this.sim.getProbabilities(), this.sim.amplitudes);

      statusVal.textContent = 'AMPLITUDE REDISTRIBUTION COMPLETE';
      subVal.textContent = `Mean amplitude: ${mean.toFixed(6)}. Marked amplitudes inverted and amplified!`;
      this._setLearningHint('The marked team amplitudes rose above the average. A Grover step repeats the oracle and diffusion to build this signal.');

      btnDiff.disabled = true;
      btnDiff.textContent = '✓ DIFFUSION APPLIED';

      setTimeout(() => {
        btnNext.style.display = 'inline-block';
        audioController.playScanSuccess();
      }, 700);
    });

    btnNext.addEventListener('click', () => {
      this._constellation?.dispose();
      this._constellation = null;
      this._setStage('ACT_1H');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1H — INTERFERENCE & AMPLITUDE AMPLIFICATION
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1H_Interference() {
    // Start this repeatable experiment from a clean uniform state. The previous
    // screen showed one oracle + diffusion pair as separate teaching steps.
    this.sim.initialize();
    this.sim.applyHadamard();
    const predicate = (x) => {
      const { h1, h2, h3, isValid } = decodeBasisState(x);
      return isValid && evaluateCrossRealityTeam(h1, h2, h3, 75).viable;
    };
    const markedIndices = new Set();
    const visualStride = Math.max(1, Math.floor(this.sim.N / QUANTUM_VISUAL_POINTS));
    for (let point = 0; point < QUANTUM_VISUAL_POINTS; point++) {
      const state = point * visualStride;
      if (predicate(state)) markedIndices.add(state);
    }

    const wrap = document.createElement('div');
    wrap.classList.add('stage-interactive-screen');
    wrap.innerHTML = `
      <div class="quantum-viewport" id="quantum-viewport"></div>

      <div class="quantum-stage-hud">
        <div class="hud-panel-top">
          <span class="stage-tag">ACT 1H — GROVER OPERATOR G = D * O</span>
          <h2 class="stage-title">AMPLITUDE AMPLIFICATION</h2>
          <p class="stage-desc">One Grover step = oracle mark + diffusion. Repeating it raises the chance of measuring a passing team. Here N = 32,768 and M = 3,995, so the ideal query scale is about √(N/M) ≈ 3. This is a simulator, not a hardware speed test.</p>
        </div>

        <div class="hud-panel-bottom">
          <div class="hud-info-card">
            <span class="info-label">ITERATION TRACKER</span>
            <span class="info-val" id="iter-count">ITERATION 0</span>
            <span class="info-sub" id="iter-prob">SUCCESS PROBABILITY: ~12.2%</span>
          </div>
          <div class="hud-actions">
            <button class="stage-primary-btn" id="btn-grover-step">RUN ONE GROVER STEP · ORACLE + DIFFUSION</button>
            <button class="stage-secondary-btn" id="btn-to-1i" disabled>MEASURE AFTER ONE STEP ▸</button>
          </div>
        </div>
      </div>
    `;
    this._el.appendChild(wrap);

    const vp = wrap.querySelector('#quantum-viewport');
    this._constellation = new QuantumConstellationViewer(vp, QUANTUM_VISUAL_POINTS);
    this._constellation.updateFromState(this.sim.getProbabilities(), this.sim.amplitudes, markedIndices);

    const btnStep = wrap.querySelector('#btn-grover-step');
    const btnToMeasure = wrap.querySelector('#btn-to-1i');
    const countLabel = wrap.querySelector('#iter-count');
    const probLabel = wrap.querySelector('#iter-prob');

    btnStep.addEventListener('click', () => {
      audioController.playScanStep(this.sim.iterations % 3);
      const res = this.sim.groverStep(predicate);
      this._quantumQueries++;
      this._constellation.updateFromState(this.sim.getProbabilities(), this.sim.amplitudes, markedIndices);

      countLabel.textContent = `ITERATION ${res.iteration}`;
      probLabel.textContent = `SUCCESS PROBABILITY: ${(res.successProbability * 100).toFixed(1)}%`;
      btnToMeasure.disabled = false;
      btnToMeasure.textContent = 'NEXT: MEASURE THIS SEARCH STATE ▸';
      this._setLearningHint(`After ${res.iteration} Grover ${res.iteration === 1 ? 'step' : 'steps'}, viable-team probability is ${(res.successProbability * 100).toFixed(1)}%. Measure now, or run another step to compare.`);
    });

    btnToMeasure.addEventListener('click', () => {
      this._constellation?.dispose();
      this._constellation = null;
      this._setStage('ACT_1I');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1I — MEASUREMENT & 3D MANIFESTATION
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1I_Measurement() {
    const wrap = document.createElement('div');
    wrap.classList.add('stage-interactive-screen');
    wrap.innerHTML = `
      <div class="quantum-viewport" id="quantum-viewport"></div>

      <div class="quantum-stage-hud">
        <div class="hud-panel-top">
          <span class="stage-tag">ACT 1I — MEASUREMENT & COLLAPSE</span>
          <h2 class="stage-title">WAVEFUNCTION SAMPLING</h2>
          <p class="stage-desc">Quantum search does not guarantee the answer every time—it amplifies the probability distribution. Sampling collapses the superposition into a single reality.</p>
        </div>

        <div class="hud-panel-bottom" id="measure-controls">
          <div class="hud-info-card">
            <span class="info-label">CURRENT PROBABILITY</span>
            <span class="info-val">DISTRIBUTION READY</span>
            <span class="info-sub">Sampling weighted by P(x) = |α_x|²</span>
          </div>
          <div class="hud-actions">
        <button class="stage-primary-btn" id="btn-observe">MEASURE ONE TEAM FROM THE DISTRIBUTION</button>
          </div>
        </div>
      </div>
    `;
    this._el.appendChild(wrap);

    const vp = wrap.querySelector('#quantum-viewport');
    this._constellation = new QuantumConstellationViewer(vp, QUANTUM_VISUAL_POINTS);
    this._constellation.updateFromState(this.sim.getProbabilities(), this.sim.amplitudes);

    const btnObserve = wrap.querySelector('#btn-observe');
    btnObserve.addEventListener('click', async () => {
      audioController.playSelect();
      btnObserve.disabled = true;
      btnObserve.textContent = 'COLLAPSING WAVEFUNCTION...';

      // Perform real measurement
      const { sampledState, probability } = this.sim.measure();
      const { h1, h2, h3, isValid } = decodeBasisState(sampledState);
      const evalRes = isValid ? evaluateCrossRealityTeam(h1, h2, h3, 75) : { viable: false, score: 0 };

      // Animate 3D constellation collapse towards sampled point
      this._constellation.collapseTo(sampledState, async () => {
        audioController.playScanSuccess();
        await wait(600);
        this._constellation?.dispose();
        this._constellation = null;

        // Reveal the sampled team in 3D
        this._manifestSampledTeam(vp, h1, h2, h3, evalRes, 'ACT_1_COMPLETE');
      });
    });
  }

  _manifestSampledTeam(container, h1, h2, h3, evalRes, nextStage) {
    const hero1 = HERO_ROSTER[h1] || HERO_ROSTER[0];
    const hero2 = HERO_ROSTER[h2] || HERO_ROSTER[1];
    const hero3 = HERO_ROSTER[h3] || HERO_ROSTER[2];

    const teamData = {
      name: 'COLLAPSED QUANTUM CONFIGURATION',
      layout: [
        { hero: hero1, position: [0, 0, 0.4], rotation: [0, 0, 0], scaleMult: 1.0 },
        { hero: hero2, position: [-1.8, 0, -0.4], rotation: [0, 0.3, 0], scaleMult: 1.0 },
        { hero: hero3, position: [1.8, 0, -0.4], rotation: [0, -0.3, 0], scaleMult: 1.0 },
      ],
    };

    container.innerHTML = '';
    this._viewer3D = new Universe3DViewer(container, teamData);
    if (evalRes.viable) this._viewer3D.energize();

    const resultBox = document.createElement('div');
    resultBox.classList.add('measured-team-hud');
    resultBox.innerHTML = `
      <div class="result-banner ${evalRes.viable ? 'viable' : 'non-viable'}">
        <span class="r-status">${evalRes.viable ? '✓ VIABLE TEAM MEASURED' : '✕ NON-VIABLE CONFIGURATION'}</span>
        <h3 class="r-title">${hero1.name} [${hero1.originReality}] · ${hero2.name} [${hero2.originReality}] · ${hero3.name} [${hero3.originReality}]</h3>
        <p class="r-score">DOOM SURVIVAL SCORE: ${evalRes.score} / 100</p>
        <p class="r-lesson">${evalRes.viable ? 'The quantum search successfully boosted this candidate into the measurement threshold.' : 'Search not yet concentrated. Measuring too early can sample an unamplified state.'}</p>
        <button class="stage-primary-btn" id="btn-proceed-after-measure">NEXT: REVIEW THE GROVER SEARCH ▸</button>
      </div>
    `;
    container.appendChild(resultBox);

    resultBox.querySelector('#btn-proceed-after-measure').addEventListener('click', () => {
      this._viewer3D?.dispose();
      this._viewer3D = null;
      this._setStage(nextStage);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1J — INTENTIONALLY BREAK THE ALGORITHM (OVERSHOOTING SANDBOX)
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1J_Overshoot() {
    // 6-qubit model (N = 64, M = 1). Optimal is t_opt = 6 (~99.7%).
    this.sandboxSim = new QuantumStatevector(6);
    this.sandboxSim.applyHadamard();
    const markedState = 42;
    const isTarget = (x) => x === markedState;

    const wrap = document.createElement('div');
    wrap.classList.add('stage-interactive-screen');
    wrap.innerHTML = `
      <div class="stage-sandbox-panel">
        <header class="sandbox-header">
          <div>
            <span class="stage-tag">ACT 1J — DELIBERATELY OVERSHOOT</span>
            <h2 class="stage-title">THE GEOMETRY OF GROVER ROTATION</h2>
          </div>
          <div class="sandbox-stats">
            <span class="sstat">SEARCH SPACE: N = 64</span>
            <span class="sstat">MARKED: M = 1</span>
            <span class="sstat" id="opt-formula">THEORETICAL OPTIMUM: t = 6</span>
          </div>
        </header>

        <p class="sandbox-desc">Grover iterations are rotations in a 2D Hilbert subspace. Each step rotates by 2θ. Applying too many iterations rotates PAST the target!</p>

        <div class="sandbox-curve-wrap">
          <div class="curve-bars" id="curve-bars"></div>
        </div>

        <div class="sandbox-footer">
          <div class="step-counter">
            <span class="counter-num" id="current-iter-label">ITERATION: 0</span>
            <span class="counter-prob" id="current-prob-label">TARGET PROBABILITY: 1.56%</span>
            <span class="counter-warning" id="overshoot-warning"></span>
          </div>
          <div class="sandbox-actions">
            <button class="stage-primary-btn" id="btn-step-overshoot">APPLY GROVER STEP [+1]</button>
            <button class="stage-secondary-btn" id="btn-reset-overshoot">RESET TO t=0</button>
            <button class="stage-primary-btn" id="btn-to-1k" style="margin-left: auto">PROCEED TO QUERY COMPLEXITY ▸</button>
          </div>
        </div>
      </div>
    `;
    this._el.appendChild(wrap);

    const barsWrap = wrap.querySelector('#curve-bars');
    const btnStep = wrap.querySelector('#btn-step-overshoot');
    const btnReset = wrap.querySelector('#btn-reset-overshoot');
    const iterLabel = wrap.querySelector('#current-iter-label');
    const probLabel = wrap.querySelector('#current-prob-label');
    const warningLabel = wrap.querySelector('#overshoot-warning');

    const updateUI = () => {
      const t = this.sandboxSim.iterations;
      const prob = this.sandboxSim.amplitudes[markedState] ** 2;

      iterLabel.textContent = `ITERATION: ${t}`;
      probLabel.textContent = `TARGET PROBABILITY: ${(prob * 100).toFixed(1)}%`;

      if (t > 6) {
        warningLabel.textContent = '⚠ TOO FAR: Probability is decreasing! More is not always better.';
        warningLabel.className = 'counter-warning active';
      } else {
        warningLabel.textContent = '';
        warningLabel.className = 'counter-warning';
      }

      // Render probability history bars
      barsWrap.innerHTML = '';
      for (let i = 0; i <= Math.max(t, 10); i++) {
        const pAtI = QuantumStatevector.calculateSuccessProbability(64, 1, i);
        const bar = document.createElement('div');
        bar.classList.add('curve-bar-col');
        if (i === t) bar.classList.add('current');
        if (i === 6) bar.classList.add('optimal');
        bar.innerHTML = `
          <div class="bar-fill-track"><div class="bar-fill-level" style="height: ${pAtI * 100}%"></div></div>
          <span class="bar-t-label">t=${i}</span>
        `;
        barsWrap.appendChild(bar);
      }
    };

    updateUI();

    btnStep.addEventListener('click', () => {
      audioController.playScanStep(this.sandboxSim.iterations % 3);
      this.sandboxSim.groverStep(isTarget);
      updateUI();
    });

    btnReset.addEventListener('click', () => {
      this.sandboxSim.initialize().applyHadamard();
      updateUI();
    });

    wrap.querySelector('#btn-to-1k').addEventListener('click', () => {
      this._setStage('ACT_1K');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1K — CLASSICAL VS QUANTUM QUERY COMPLEXITY
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1K_Complexity() {
    const wrap = document.createElement('div');
    wrap.classList.add('stage-dialogue-screen');
    wrap.innerHTML = `
      <div class="dialogue-box" style="max-width: 800px">
        <p class="dialogue-tag">ACT 1K — QUERY COMPLEXITY COMPARISON</p>
        <h2 class="dialogue-speaker">ORACLE-QUERY COMPLEXITY FOR UNSTRUCTURED SEARCH</h2>

        <div class="complexity-comparison-grid">
          <div class="comp-col classical">
            <span class="comp-tag">CLASSICAL BRUTE FORCE</span>
            <span class="comp-big">O(N)</span>
            <p class="comp-desc">Candidate possibilities must be evaluated individually.</p>
            <div class="comp-stat"><span>N = 64 candidates</span><strong>Up to 64 queries</strong></div>
            <div class="comp-stat"><span>N = 32,768 candidates</span><strong>Up to 32,768 queries</strong></div>
          </div>
          <div class="comp-col quantum">
            <span class="comp-tag">QUANTUM GROVER SEARCH</span>
            <span class="comp-big">O(√N)</span>
            <p class="comp-desc">Amplitudes interfere constructively over the marked subspace.</p>
            <div class="comp-stat"><span>N = 64 candidates</span><strong>~6 Grover queries</strong></div>
            <div class="comp-stat"><span>N = 32,768 candidates</span><strong>~82 Grover queries</strong></div>
          </div>
        </div>

        <p class="comp-scientific-note">
          <strong>SCIENTIFIC PRECISION NOTE:</strong> This comparison specifically addresses <em>unstructured oracle queries</em>. Practical quantum advantage requires quantum fault-tolerance, error mitigation, and fast oracle evaluation.
        </p>

        <button class="stage-primary-btn" id="btn-to-1l" style="margin-top: 24px">
          EXPLORE MULTIPLE VALID SOLUTIONS (M = 4) ▸
        </button>
      </div>
    `;
    this._el.appendChild(wrap);

    wrap.querySelector('#btn-to-1l').addEventListener('click', () => {
      audioController.playSelect();
      this._setStage('ACT_1L');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1L — MULTIPLE VALID SOLUTIONS (M = 4)
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1L_Multiple() {
    this.sandboxSim = new QuantumStatevector(6);
    this.sandboxSim.applyHadamard();
    const marked = new Set([12, 25, 37, 50]); // M = 4
    const isMarked = (x) => marked.has(x);
    const tOpt = QuantumStatevector.calculateOptimalIterations(64, 4); // ~3

    const wrap = document.createElement('div');
    wrap.classList.add('stage-sandbox-panel');
    wrap.innerHTML = `
      <header class="sandbox-header">
        <div>
          <span class="stage-tag">ACT 1L — MULTIPLE VALID TEAMS</span>
          <h2 class="stage-title">AMPLIFYING THE MARKED SUBSPACE</h2>
        </div>
        <div class="sandbox-stats">
          <span class="sstat">SEARCH SPACE: N = 64</span>
          <span class="sstat">MARKED: M = 4</span>
          <span class="sstat">OPTIMAL ITERATIONS: t = ${tOpt}</span>
        </div>
      </header>

      <p class="sandbox-desc">"There was never only one path." Grover does NOT search for one special answer—it amplifies the ENTIRE marked subspace simultaneously!</p>

      <div class="multi-peaks-grid" id="multi-peaks-grid"></div>

      <div class="sandbox-footer">
        <div class="step-counter">
          <span class="counter-num" id="multi-iter-label">ITERATION: 0</span>
          <span class="counter-prob" id="multi-prob-label">TOTAL SUCCESS PROBABILITY: 6.25%</span>
        </div>
        <div class="sandbox-actions">
          <button class="stage-primary-btn" id="btn-step-multi">AMPLIFY [+1]</button>
          <button class="stage-primary-btn" id="btn-to-1m" style="margin-left: auto">UNKNOWN SOLUTIONS CHALLENGE ▸</button>
        </div>
      </div>
    `;
    this._el.appendChild(wrap);

    const peaksGrid = wrap.querySelector('#multi-peaks-grid');
    const iterLabel = wrap.querySelector('#multi-iter-label');
    const probLabel = wrap.querySelector('#multi-prob-label');

    const updateMultiUI = () => {
      iterLabel.textContent = `ITERATION: ${this.sandboxSim.iterations}`;
      let totalP = 0;
      marked.forEach(idx => totalP += this.sandboxSim.amplitudes[idx] ** 2);
      probLabel.textContent = `TOTAL SUCCESS PROBABILITY: ${(totalP * 100).toFixed(1)}%`;

      peaksGrid.innerHTML = Array.from(marked).map(idx => `
        <div class="peak-card">
          <span class="peak-id">CANDIDATE #${idx}</span>
          <span class="peak-val">${((this.sandboxSim.amplitudes[idx] ** 2) * 100).toFixed(1)}%</span>
          <div class="peak-bar"><div class="peak-fill" style="width: ${(this.sandboxSim.amplitudes[idx] ** 2) * 100}%"></div></div>
        </div>
      `).join('');
    };

    updateMultiUI();

    wrap.querySelector('#btn-step-multi').addEventListener('click', () => {
      audioController.playScanStep(1);
      this.sandboxSim.groverStep(isMarked);
      updateMultiUI();
    });

    wrap.querySelector('#btn-to-1m').addEventListener('click', () => {
      this._setStage('ACT_1M');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1M — UNKNOWN NUMBER OF SOLUTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1M_Unknown() {
    const wrap = document.createElement('div');
    wrap.classList.add('stage-dialogue-screen');
    wrap.innerHTML = `
      <div class="dialogue-box" style="max-width: 720px">
        <p class="dialogue-tag">ACT 1M — ADVANCED QUANTUM SEARCH</p>
        <h2 class="dialogue-speaker">WHEN THE SOLUTION COUNT IS UNKNOWN</h2>

        <div class="dialogue-lines">
          <p class="d-line visible">"In real quantum exploration, we rarely know how many solutions exist beforehand."</p>
          <p class="d-line visible dramatic">"If M is unknown, choosing a fixed iteration count risks overshooting."</p>
          <p class="d-line visible">"Quantum algorithms solve this using exponential schedule randomization or Quantum Counting."</p>
        </div>

        <div class="schedule-explainer">
          <span class="sched-tag">ADAPTIVE SCHEDULE PRINCIPLE</span>
          <p>Try iteration schedule: t = 1, then t = 2, then t = 4... sampling at each scale until the measured configuration satisfies the predicate.</p>
        </div>

        <button class="stage-primary-btn" id="btn-to-1n" style="margin-top: 24px">
          COMMENCE FULL 15-QUBIT HERO SEARCH ▸
        </button>
      </div>
    `;
    this._el.appendChild(wrap);

    wrap.querySelector('#btn-to-1n').addEventListener('click', () => {
      audioController.playSelect();
      this._setStage('ACT_1N');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1N — REAL CROSS-REALITY TEAM SEARCH
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1N_TeamSearch() {
    const wrap = document.createElement('div');
    wrap.classList.add('stage-dialogue-screen', 'thor-dialogue-screen');
    wrap.innerHTML = `
      <div class="thor-screen-model" aria-label="Thor on the mission screen">
        <div class="thor-model-loader"><i></i><span class="thor-model-loading-text">THOR MATERIALIZING</span></div>
        <span class="thor-model-caption">EARTH-118 <b>◆</b> ASGARDIAN FRONT LINE</span>
      </div>
      <div class="dialogue-box">
        <p class="dialogue-tag">ACT 1N — CROSS-REALITY COMPOSITION</p>
        <h2 class="dialogue-speaker">THOR</h2>

        <div class="dialogue-lines">
          <p class="d-line visible">"Doom has prepared a counter for every obvious team."</p>
          <p class="d-line visible">"So don't give him an obvious team."</p>
          <p class="d-line visible dramatic">"Search beyond the worlds they came from."</p>
          <p class="d-line visible conclusion">"Not one universe. Three heroes. Three realities. One team."</p>
        </div>

        <div class="roster-meta-banner">
          <span>15 QUBITS</span>
          <span>32,768 BASIS STATES</span>
          <span>12,144 VALID THREE-HERO COMPOSITIONS</span>
          <span>CROSS-REALITY: ENABLED</span>
        </div>

        <button class="stage-primary-btn" id="btn-to-1o" style="margin-top: 24px">
          START PROGRESSIVE THRESHOLD SEARCH ▸
        </button>
      </div>
    `;
    this._el.appendChild(wrap);
    this._mountThorDialogueModel(wrap);

    wrap.querySelector('#btn-to-1o').addEventListener('click', () => {
      audioController.playSelect();
      this._setStage('ACT_1O');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1O — PROGRESSIVE THRESHOLD SEARCH (75 -> 85 -> 90 -> 95)
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1O_Threshold() {
    const wrap = document.createElement('div');
    wrap.classList.add('stage-interactive-screen');
    wrap.innerHTML = `
      <div class="quantum-stage-hud">
        <div class="hud-panel-top">
          <span class="stage-tag">ACT 1O — PROGRESSIVE THRESHOLD SEARCH</span>
          <h2 class="stage-title">QUANTUM-ASSISTED THRESHOLD SEARCH</h2>
          <p class="stage-desc">Grover is not a black-box optimizer. It searches for states satisfying a defined predicate. By progressively raising the Doom Survival Threshold, we extract stronger cross-reality teams.</p>
        </div>

        <div class="threshold-stages-grid">
          <div class="thresh-card active" id="tc-75">
            <span class="tc-score">≥ 75</span>
            <span class="tc-name">BASELINE SURVIVORS</span>
            <span class="tc-count">3,995 Valid Teams</span>
            <button class="stage-secondary-btn tc-btn" data-thresh="75">AMPLIFY & MEASURE</button>
          </div>
          <div class="thresh-card" id="tc-85">
            <span class="tc-score">≥ 85</span>
            <span class="tc-name">ADVANCED COUNTER</span>
            <span class="tc-count">1,373 Valid Teams</span>
            <button class="stage-secondary-btn tc-btn" data-thresh="85">AMPLIFY & MEASURE</button>
          </div>
          <div class="thresh-card" id="tc-90">
            <span class="tc-score">≥ 90</span>
            <span class="tc-name">MASTER SYNERGY</span>
            <span class="tc-count">214 Valid Teams</span>
            <button class="stage-secondary-btn tc-btn" data-thresh="90">AMPLIFY & MEASURE</button>
          </div>
          <div class="thresh-card" id="tc-95">
            <span class="tc-score">≥ 95</span>
            <span class="tc-name">ELITE APEX TEAM</span>
            <span class="tc-count">3 Valid Teams</span>
            <button class="stage-primary-btn tc-btn" data-thresh="95">COMMENCE ELITE SEARCH</button>
          </div>
        </div>

        <div class="hud-panel-bottom" style="margin-top: 24px">
          <div class="hud-info-card">
            <span class="info-label">THRESHOLD STATUS</span>
            <span class="info-val" id="thresh-active-label">READY AT THRESHOLD ≥ 75</span>
            <span class="info-sub" id="thresh-sub-label">Raise threshold to narrow into the apex counter-offensive.</span>
          </div>
        </div>
      </div>
    `;
    this._el.appendChild(wrap);

    const buttons = wrap.querySelectorAll('.tc-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const thresh = parseInt(e.target.dataset.thresh, 10);
        if (thresh === 95) {
          this._setStage('ACT_1P');
        } else {
          audioController.playScanSuccess();
          wrap.querySelector('#thresh-active-label').textContent = `THRESHOLD ≥ ${thresh} VERIFIED`;
          wrap.querySelector('#thresh-sub-label').textContent = `Candidate identified. Ready to escalate to next threshold tier.`;
          const nextCard = wrap.querySelector(`#tc-${thresh === 75 ? 85 : 90}`);
          if (nextCard) nextCard.classList.add('active');
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1P — FINAL ACT-1 MISSION (ELITE TEAM MANIFESTATION)
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1P_FinalMission() {
    this.sim.applyHadamard();
    // Elite predicate: threshold 95 (only 3 teams in all 32,768 basis states)
    const elitePredicate = (x) => {
      const { h1, h2, h3, isValid } = decodeBasisState(x);
      return isValid && evaluateCrossRealityTeam(h1, h2, h3, 95).viable;
    };

    const wrap = document.createElement('div');
    wrap.classList.add('stage-interactive-screen');
    wrap.innerHTML = `
      <div class="quantum-viewport" id="quantum-viewport"></div>

      <div class="quantum-stage-hud">
        <div class="hud-panel-top">
          <span class="stage-tag">ACT 1P — FINAL ACT-1 MISSION</span>
          <h2 class="stage-title">ELITE CROSS-REALITY APEX SEARCH</h2>
          <p class="stage-desc">Search space: 12,144 valid teams. Doom Survival Threshold: 95. Exactly 3 configurations can withstand Doom's siege. Apply Grover iterations and observe.</p>
        </div>

        <div class="hud-panel-bottom" id="final-controls">
          <div class="hud-info-card">
            <span class="info-label">15-QUBIT REGISTER</span>
            <span class="info-val" id="final-state-info">SUPERPOSITION INITIALIZED</span>
            <span class="info-sub" id="final-iter-info">ITERATION: 0 | OPTIMAL: ~82</span>
          </div>
          <div class="hud-actions">
            <button class="stage-primary-btn" id="btn-final-amplify">⚡ AMPLIFY ELITE STATES [GROVER BATCH]</button>
            <button class="stage-primary-btn" id="btn-final-measure" style="display: none">👁 MANIFEST ELITE TEAM [OBSERVE]</button>
          </div>
        </div>
      </div>
    `;
    this._el.appendChild(wrap);

    const vp = wrap.querySelector('#quantum-viewport');
    this._constellation = new QuantumConstellationViewer(vp, QUANTUM_VISUAL_POINTS);
    this._constellation.updateFromState(this.sim.getProbabilities(), this.sim.amplitudes);

    const btnAmp = wrap.querySelector('#btn-final-amplify');
    const btnMeasure = wrap.querySelector('#btn-final-measure');
    const stateInfo = wrap.querySelector('#final-state-info');
    const iterInfo = wrap.querySelector('#final-iter-info');

    btnAmp.addEventListener('click', () => {
      audioController.playSelect();
      btnAmp.disabled = true;
      btnAmp.textContent = 'AMPLIFYING 15-QUBIT REGISTER...';

      // Run Grover iterations in batches to optimal ~82 iterations
      let currentT = 0;
      const stepInterval = setInterval(() => {
        for (let k = 0; k < 10 && currentT < 82; k++) {
          this.sim.groverStep(elitePredicate);
          currentT++;
          this._quantumQueries++;
        }

        this._constellation.updateFromState(this.sim.getProbabilities(), this.sim.amplitudes);
        iterInfo.textContent = `ITERATION: ${currentT} / 82`;
        audioController.playScanStep(currentT % 3);

        if (currentT >= 82) {
          clearInterval(stepInterval);
          stateInfo.textContent = 'PROBABILITY PEAK REACHED (99.9%)';
          btnAmp.style.display = 'none';
          btnMeasure.style.display = 'inline-block';
          audioController.playScanSuccess();
        }
      }, 50);
    });

    btnMeasure.addEventListener('click', () => {
      audioController.playSelect();
      btnMeasure.disabled = true;
      btnMeasure.textContent = 'COLLAPSING SEARCH SPACE...';

      // Measure
      const { sampledState } = this.sim.measure();
      const { h1, h2, h3 } = decodeBasisState(sampledState);
      const evalRes = evaluateCrossRealityTeam(h1, h2, h3, 95);

      this._constellation.collapseTo(sampledState, async () => {
        audioController.playScanSuccess();
        await wait(600);
        this._constellation?.dispose();
        this._constellation = null;

        // Final Manifestation Screen
        this._manifestFinalEliteTeam(vp, h1, h2, h3, evalRes);
      });
    });
  }

  _manifestFinalEliteTeam(container, h1, h2, h3, evalRes) {
    const hero1 = HERO_ROSTER[h1] || HERO_ROSTER[1]; // Iron Man
    const hero2 = HERO_ROSTER[h2] || HERO_ROSTER[3]; // Strange Supreme
    const hero3 = HERO_ROSTER[h3] || HERO_ROSTER[0]; // Thor

    const teamData = {
      name: 'THE ELITE CROSS-REALITY STRIKE TEAM',
      cameraFocusX: -1.35,
      layout: [
        { hero: hero1, position: [-1.9, 0, -0.3], rotation: [0, 0.35, 0], scaleMult: 1.0 },
        { hero: hero2, position: [0, 0.35, 0.4], rotation: [0, 0, 0], scaleMult: 1.05 },
        { hero: hero3, position: [1.9, 0, -0.3], rotation: [0, -0.35, 0], scaleMult: 1.0 },
      ],
    };

    container.innerHTML = '';
    const stageScreen = container.closest('.stage-interactive-screen');
    stageScreen?.classList.add('final-team-manifestation');
    const stageHud = stageScreen?.querySelector('.quantum-stage-hud');
    stageHud?.querySelector('.hud-panel-bottom')?.remove();
    const guideTitle = this._el.querySelector('.learning-guide-title');
    if (guideTitle) guideTitle.textContent = 'Elite team found';
    this._setLearningHint('Review the three discovered heroes, then continue to the debrief.');

    const banner = document.createElement('div');
    banner.classList.add('final-act1-hud');
    banner.innerHTML = `
      <div class="final-card">
        <span class="final-tag">ACT 1 COMPLETE — QUANTUM SEARCH SUCCESS</span>
        <h2 class="final-title">THE TEAM HAS BEEN FOUND</h2>
        <div class="final-model-status" role="status" aria-live="polite">
          <i></i><span id="final-model-status-label">MATERIALIZING THE 3D TEAM · 0%</span>
        </div>

        <div class="final-team-roster">
          <div class="fhero-slot">
            <span class="fhero-pos">SLOT 1: TACTICAL LEAD</span>
            <span class="fhero-name">${hero1.name}</span>
            <span class="fhero-reality">${hero1.originReality}</span>
          </div>
          <div class="fhero-slot">
            <span class="fhero-pos">SLOT 2: SPECIALIST</span>
            <span class="fhero-name">${hero2.name}</span>
            <span class="fhero-reality">${hero2.originReality}</span>
          </div>
          <div class="fhero-slot">
            <span class="fhero-pos">SLOT 3: FORCE / ANCHOR</span>
            <span class="fhero-name">${hero3.name}</span>
            <span class="fhero-reality">${hero3.originReality}</span>
          </div>
        </div>

        <div class="final-stats-row">
          <div class="fstat"><span>SURVIVAL SCORE</span><strong>${evalRes.score} / 100</strong></div>
          <div class="fstat"><span>VALID COMBINATIONS</span><strong>12,144</strong></div>
          <div class="fstat"><span>QUANTUM REGISTER</span><strong>15 QUBITS</strong></div>
          <div class="fstat"><span>GROVER ITERATIONS</span><strong>82</strong></div>
        </div>

        <div class="final-narrative">
          <p>"The universe wasn't the answer."</p>
          <p>"The team was."</p>
          <p class="final-conclusion">"And now... we need to make them work together."</p>
        </div>

        <button class="stage-primary-btn" id="btn-finish-act1">PROCEED TO DEBRIEF ▸</button>
      </div>
    `;
    (stageHud || stageScreen || container).appendChild(banner);

    const statusLabel = banner.querySelector('#final-model-status-label');
    this._viewer3D = new Universe3DViewer(container, teamData, (progress) => {
      if (!statusLabel) return;
      statusLabel.textContent = progress >= 100
        ? 'THE 3D TEAM IS ON THE FIELD'
        : `MATERIALIZING THE 3D TEAM · ${progress}%`;
    });
    this._viewer3D.energize();

    banner.querySelector('#btn-finish-act1').addEventListener('click', () => {
      this._viewer3D?.dispose();
      this._viewer3D = null;
      this._setStage('ACT_1_COMPLETE');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 1 COMPLETE — DEBRIEF & TEASER
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAct1_Complete() {
    const wrap = document.createElement('div');
    wrap.classList.add('stage-dialogue-screen');
    wrap.innerHTML = `
      <div class="dialogue-box" style="max-width: 720px">
        <p class="dialogue-tag">CAMPAIGN PROGRESSION</p>
        <h2 class="dialogue-speaker">ACT 1 COMPLETE</h2>

        <div class="dialogue-lines">
          <p class="d-line visible">A search problem has a set of candidates and a rule that identifies good answers.</p>
          <p class="d-line visible">Superposition gives candidates equal starting amplitudes. The oracle flips the phase of answers.</p>
          <p class="d-line visible">Diffusion and interference amplify those answers. Measurement samples one candidate.</p>
          <p class="d-line visible dramatic">Grover search can find a marked answer in about √N oracle queries, when the answer count is known.</p>
        </div>

        <div class="act2-teaser-box">
          <span class="act2-label">OPTIONAL NEXT</span>
          <h3 class="act2-title">ADVANCED GROVER LAB</h3>
          <p class="act2-desc">Explore overshooting, multiple answers, unknown answer counts, and stronger team thresholds.</p>
        </div>

        <div class="guided-complete-actions">
          <button class="stage-primary-btn" id="btn-advanced-lab">OPEN ADVANCED SEARCH LAB ▸</button>
          <button class="stage-secondary-btn" id="btn-replay-act1">REPLAY GUIDED GROVER SEARCH</button>
        </div>

        <p class="act2-sub">ACT 2 · QUANTUM COMMUNICATION · COMING NEXT</p>
      </div>
    `;
    this._el.appendChild(wrap);

    wrap.querySelector('#btn-replay-act1').addEventListener('click', () => {
      this._setStage('ACT_1B');
    });
    wrap.querySelector('#btn-advanced-lab').addEventListener('click', () => {
      this._setStage('ACT_1J');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUANTUM LENS (GLOBAL TECHNICAL INSPECTION DRAWER)
  // ═══════════════════════════════════════════════════════════════════════════

  _renderQuantumLens() {
    // Lens Toggle Button
    const lensToggle = document.createElement('button');
    lensToggle.classList.add('quantum-lens-toggle');
    lensToggle.id = 'quantum-lens-toggle';
    lensToggle.innerHTML = 'QUANTUM LENS ⊞';
    lensToggle.addEventListener('click', () => {
      this._quantumLensOpen = !this._quantumLensOpen;
      drawer.classList.toggle('open', this._quantumLensOpen);
      lensToggle.innerHTML = this._quantumLensOpen ? 'CLOSE LENS ✕' : 'QUANTUM LENS ⊞';
      if (this._quantumLensOpen) this._updateLensContent();
    });
    this._el.appendChild(lensToggle);

    // Lens Drawer
    const drawer = document.createElement('aside');
    drawer.classList.add('quantum-lens-drawer');
    drawer.id = 'quantum-lens-drawer';
    drawer.innerHTML = `
      <div class="lens-header">
        <span class="lens-tag">TECHNICAL INSPECTION</span>
        <h3 class="lens-title">QUANTUM STATE METRICS</h3>
      </div>
      <div class="lens-body" id="lens-body">
        <!-- populated dynamically -->
      </div>
    `;
    this._el.appendChild(drawer);
  }

  _updateLensContent() {
    const body = this._el.querySelector('#lens-body');
    if (!body) return;

    body.innerHTML = `
      <div class="lens-stat-block">
        <span class="lstat-label">LOGICAL REGISTER</span>
        <span class="lstat-val">15 QUBITS</span>
      </div>
      <div class="lens-stat-block">
        <span class="lstat-label">COMPUTATIONAL BASIS STATES</span>
        <span class="lstat-val">32,768 (2^15)</span>
      </div>
      <div class="lens-stat-block">
        <span class="lstat-label">VALID 3-HERO ENCODINGS</span>
        <span class="lstat-val">12,144 (24 × 23 × 22)</span>
      </div>
      <div class="lens-stat-block">
        <span class="lstat-label">INVALID / PADDING STATES</span>
        <span class="lstat-val">20,224</span>
      </div>
      <div class="lens-stat-block">
        <span class="lstat-label">CURRENT STAGE</span>
        <span class="lstat-val">${this._stage}</span>
      </div>
      <div class="lens-stat-block">
        <span class="lstat-label">GROVER ITERATIONS (t)</span>
        <span class="lstat-val">${this.sim.iterations}</span>
      </div>
      <div class="lens-stat-block">
        <span class="lstat-label">ORACLE QUERIES USED</span>
        <span class="lstat-val">${this.sim.oracleQueries}</span>
      </div>

      <div class="lens-circuit-card">
        <span class="lstat-label">LOGICAL CIRCUIT REPRESENTATION</span>
        <div class="circuit-diagram">
          |0⟩⊗15 ──[ H⊗15 ]───[ ORACLE: O ]───[ DIFFUSION: D ]───[ MEASURE ]
        </div>
      </div>

      <div class="lens-notes">
        <p><strong>Phase Oracle:</strong> S_f |x⟩ = (-1)^f(x) |x⟩ (inverts phase without altering magnitude |α|²).</p>
        <p><strong>Diffusion:</strong> D = 2|s⟩⟨s| - I (inversion about average amplitude).</p>
        <p><strong>Rotation:</strong> State evolves in 2D subspace by 2θ per iteration where sin²(θ) = M/N.</p>
      </div>
    `;
  }
}
