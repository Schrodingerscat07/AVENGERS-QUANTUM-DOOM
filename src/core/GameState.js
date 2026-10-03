/**
 * GameState — central state for scene progression and game lifecycle.
 * Keeps track of which act/scene is active and allows modules to subscribe.
 */

export const GamePhase = Object.freeze({
  LOADING:              'LOADING',
  CINEMATIC:            'CINEMATIC',
  DOOM_BRIEFING:        'DOOM_BRIEFING',
  ACT2_DOOM_CINEMATIC:  'ACT2_DOOM_CINEMATIC',   // Doom winning + weapon explanation
  ACT2_THOR_CINEMATIC:  'ACT2_THOR_CINEMATIC',   // What Thor has + device
  MULTIVERSE_CHAMBER:   'MULTIVERSE_CHAMBER',   // Act 1A — Classical Multiverse Search
  UNIVERSE_SEARCH:      'UNIVERSE_SEARCH',        // Legacy alias
  QUANTUM_SEARCH:       'QUANTUM_SEARCH',         // Act 1B-1P — Quantum Multiverse Hero Search
  ACT_1_COMPLETE:       'ACT_1_COMPLETE',
  ACT_1:                'ACT_1',                  // Legacy alias
});

class GameState {
  constructor() {
    this._phase = GamePhase.LOADING;
    this._listeners = [];
    this._sceneIndex = 0;
  }

  get phase() {
    return this._phase;
  }

  get sceneIndex() {
    return this._sceneIndex;
  }

  setPhase(phase) {
    if (this._phase === phase) return;
    const prev = this._phase;
    this._phase = phase;
    this._emit({ type: 'phaseChange', prev, next: phase });
  }

  setSceneIndex(index) {
    this._sceneIndex = index;
    this._emit({ type: 'sceneChange', index });
  }

  subscribe(listener) {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  _emit(event) {
    this._listeners.forEach(l => {
      try { l(event); } catch (e) { console.error('GameState listener error:', e); }
    });
  }
}

export const gameState = new GameState();
