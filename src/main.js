/**
 * main.js — Application entry point.
 *
 * Scene flow:
 *   LOADING
 *   → CINEMATIC          (opening: black / doom-throne / thor / avengers / earths / multiverse)
 *   → DOOM_BRIEFING      (classified TVA intel panel — The Doom Engine)
 *   → ACT2_DOOM_CINEMATIC (doom-winning.png — Doom Is Winning + Doom Weapon)
 *   → ACT2_THOR_CINEMATIC (thor-bifrost.png + thor-strombreaker.png — What Thor Has + Device)
 *   → UNIVERSE_SEARCH    (8-portal candidate realities — first interactive screen)
 *   → ACT_1              (future Grover gameplay — not yet implemented)
 */

import { gameState, GamePhase } from './core/GameState.js';
import { audioController } from './core/AudioController.js';
import { CinematicPlayer } from './cinematic/CinematicPlayer.js';
import { DoomEngineBriefing } from './cinematic/DoomEngineBriefing.js';
import { ParticleSystem } from './cinematic/ParticleSystem.js';
import { MultiverseChamberScreen } from './screens/MultiverseChamberScreen.js';
import { Act1StagesManager } from './screens/Act1StagesManager.js';
import {
  cinematicScenes,
  doomEngineBriefing,
  act2DoomScenes,
  act2ThorScenes,
} from './cinematic/scenesConfig.js';

// ── DOM references ────────────────────────────────────────────────────────────
const sceneContainer = document.getElementById('scene-container');
const particleCanvas  = document.getElementById('particle-canvas');
const skipBtn         = document.getElementById('skip-btn');

// ── Module instances ──────────────────────────────────────────────────────────
const particles = new ParticleSystem(particleCanvas);
let cinematicPlayer  = null;
let briefing         = null;
let universeSearch   = null;

// ── Boot ──────────────────────────────────────────────────────────────────────
async function boot() {
  audioController.init();
  gameState.setPhase(GamePhase.CINEMATIC);
  await startOpeningCinematic();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 1 — Opening Cinematic
// ═══════════════════════════════════════════════════════════════════════════════

async function startOpeningCinematic() {
  cinematicPlayer = new CinematicPlayer(sceneContainer, cinematicScenes);

  // Activate particles for multiverse collapse scene (~29.8 s offset)
  const collapseOffset = 29800;
  const particlesOn  = setTimeout(() => particles.activate(0.55), collapseOffset);
  const particlesOff = setTimeout(() => particles.deactivate(), collapseOffset + 9000);

  skipBtn.addEventListener('click', onSkipOpening, { once: true });
  document.addEventListener('keydown', onKeySkipOpening);

  cinematicPlayer.addEventListener('complete', () => {
    clearTimeout(particlesOn);
    clearTimeout(particlesOff);
    particles.deactivate();
    document.removeEventListener('keydown', onKeySkipOpening);
    onOpeningCinematicComplete(false);
  }, { once: true });

  cinematicPlayer.play();
}

function onKeySkipOpening(e) {
  if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
    e.preventDefault();
    onSkipOpening();
  }
}

function onSkipOpening() {
  if (!cinematicPlayer?.isRunning) return;
  document.removeEventListener('keydown', onKeySkipOpening);
  cinematicPlayer.skip();
  particles.deactivate();
  onOpeningCinematicComplete(true);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 2 — Doom Engine Briefing
// ═══════════════════════════════════════════════════════════════════════════════

function onOpeningCinematicComplete(wasSkipped) {
  skipBtn.classList.add('hidden');

  gameState.setPhase(GamePhase.DOOM_BRIEFING);
  briefing = new DoomEngineBriefing(sceneContainer, doomEngineBriefing);

  if (wasSkipped) {
    briefing.revealAll();
  } else {
    briefing.show();
  }

  briefing.addEventListener('continue', onBriefingContinue, { once: true });
}

async function onBriefingContinue() {
  // Fade out briefing
  const briefingEl = document.getElementById('doom-engine-briefing');
  if (briefingEl) {
    briefingEl.style.transition = 'opacity 800ms ease';
    briefingEl.style.opacity = '0';
    await new Promise(r => setTimeout(r, 850));
  }
  briefing.destroy();

  await startAct2DoomCinematic();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 3 — Act 2: Doom Is Winning / Doom Weapon (cinematic over doom-winning.png)
// ═══════════════════════════════════════════════════════════════════════════════

async function startAct2DoomCinematic() {
  gameState.setPhase(GamePhase.ACT2_DOOM_CINEMATIC);

  // Re-show skip button for this cinematic section
  skipBtn.classList.remove('hidden');

  cinematicPlayer = new CinematicPlayer(sceneContainer, act2DoomScenes);

  skipBtn.addEventListener('click', onSkipAct2Doom, { once: true });
  document.addEventListener('keydown', onKeySkipAct2Doom);

  cinematicPlayer.addEventListener('complete', () => {
    document.removeEventListener('keydown', onKeySkipAct2Doom);
    onAct2DoomComplete();
  }, { once: true });

  cinematicPlayer.play();
}

function onKeySkipAct2Doom(e) {
  if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
    e.preventDefault();
    onSkipAct2Doom();
  }
}

function onSkipAct2Doom() {
  if (!cinematicPlayer?.isRunning) return;
  document.removeEventListener('keydown', onKeySkipAct2Doom);
  cinematicPlayer.skip();
  onAct2DoomComplete();
}

function onAct2DoomComplete() {
  skipBtn.classList.add('hidden');
  startAct2ThorCinematic();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 4 — Act 2: What Thor Has / Thor's Device
// ═══════════════════════════════════════════════════════════════════════════════

async function startAct2ThorCinematic() {
  gameState.setPhase(GamePhase.ACT2_THOR_CINEMATIC);

  skipBtn.classList.remove('hidden');

  cinematicPlayer = new CinematicPlayer(sceneContainer, act2ThorScenes);

  skipBtn.addEventListener('click', onSkipAct2Thor, { once: true });
  document.addEventListener('keydown', onKeySkipAct2Thor);

  cinematicPlayer.addEventListener('complete', () => {
    document.removeEventListener('keydown', onKeySkipAct2Thor);
    onAct2ThorComplete();
  }, { once: true });

  cinematicPlayer.play();
}

function onKeySkipAct2Thor(e) {
  if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
    e.preventDefault();
    onSkipAct2Thor();
  }
}

function onSkipAct2Thor() {
  if (!cinematicPlayer?.isRunning) return;
  document.removeEventListener('keydown', onKeySkipAct2Thor);
  cinematicPlayer.skip();
  onAct2ThorComplete();
}

function onAct2ThorComplete() {
  skipBtn.classList.add('hidden');
  showMultiverseChamber();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 5 — Act 1A: Classical Multiverse Search
// ═══════════════════════════════════════════════════════════════════════════════

async function showMultiverseChamber() {
  gameState.setPhase(GamePhase.MULTIVERSE_CHAMBER);

  universeSearch = new MultiverseChamberScreen(sceneContainer);

  universeSearch.addEventListener('proceed_to_quantum', async (e) => {
    universeSearch.destroy();
    universeSearch = null;

    gameState.setPhase(GamePhase.QUANTUM_SEARCH);
    const act1Manager = new Act1StagesManager(sceneContainer);
    await act1Manager.show();
  }, { once: true });

  await universeSearch.show();
}

// ── Start ─────────────────────────────────────────────────────────────────────
boot().catch(err => console.error('[AVENGERS: QUANTUM DOOM] Boot error:', err));
