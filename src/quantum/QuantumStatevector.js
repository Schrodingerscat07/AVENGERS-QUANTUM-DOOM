/**
 * QuantumStatevector.js
 *
 * Mathematically rigorous statevector quantum simulator.
 * Supports:
 * - 15-qubit cross-reality search space (N = 32,768)
 * - Arbitrary N-qubit educational sandboxes (e.g. N = 64 for overshooting & complexity comparison)
 * - Exact real statevector simulation using Float64Array
 * - Phase tracking (0 rad vs pi rad)
 * - Phase oracle |x> -> (-1)^f(x) |x>
 * - Diffusion operator D = 2|s><s| - I (inversion about the mean)
 * - Real weighted random measurement sampling and wavefunction collapse
 * - Optimal iteration calculations and Grover rotation geometry
 */

export class QuantumStatevector {
  /**
   * @param {number} [nQubits=15]
   */
  constructor(nQubits = 15) {
    this.nQubits = nQubits;
    this.N = 1 << nQubits;
    this.amplitudes = new Float64Array(this.N);
    this.oracleQueries = 0;
    this.iterations = 0;
    this.history = []; // tracks probability progression per iteration

    this.initialize();
  }

  /**
   * Reset statevector to ground state |0...0>
   */
  initialize() {
    this.amplitudes.fill(0);
    this.amplitudes[0] = 1.0;
    this.oracleQueries = 0;
    this.iterations = 0;
    this.history = [];
    return this;
  }

  /**
   * Apply uniform Hadamard layer H^(⊗n).
   * Transforms |0...0> into |s> = (1/sqrt(N)) * sum(|x>).
   */
  applyHadamard() {
    const uniformAmp = 1.0 / Math.sqrt(this.N);
    this.amplitudes.fill(uniformAmp);
    this.iterations = 0;
    this.history = [];
    return this;
  }

  /**
   * Apply Phase Oracle:
   * |x> -> (-1)^f(x) |x>
   *
   * Crucial scientific property:
   * Changes the phase of marked states from 0 to pi (alpha -> -alpha),
   * but DOES NOT change the probability magnitude |alpha|^2.
   *
   * @param {Function} predicateFn - (stateIndex) => boolean
   * @returns {{ markedCount: number }}
   */
  applyPhaseOracle(predicateFn) {
    let markedCount = 0;
    const N = this.N;
    const amps = this.amplitudes;

    for (let x = 0; x < N; x++) {
      if (predicateFn(x)) {
        amps[x] = -amps[x];
        markedCount++;
      }
    }

    this.oracleQueries += markedCount > 0 ? 1 : 1; // 1 query per search iteration
    return { markedCount };
  }

  /**
   * Apply Diffusion Operator D = 2|s><s| - I:
   * Mathematically equivalent to inversion about the mean amplitude.
   * alpha_x -> 2 * mean(alpha) - alpha_x.
   *
   * @returns {{ mean: number }}
   */
  applyDiffusion() {
    const N = this.N;
    const amps = this.amplitudes;

    // 1. Calculate average amplitude across all computational basis states
    let sum = 0;
    for (let x = 0; x < N; x++) {
      sum += amps[x];
    }
    const mean = sum / N;

    // 2. Reflect every amplitude about the mean
    const twoMean = 2.0 * mean;
    for (let x = 0; x < N; x++) {
      amps[x] = twoMean - amps[x];
    }

    return { mean };
  }

  /**
   * Complete Grover Step: G = D * O
   * Phase Oracle followed by Diffusion.
   *
   * @param {Function} predicateFn
   * @returns {{ iteration: number, mean: number, markedCount: number, successProbability: number }}
   */
  groverStep(predicateFn) {
    const { markedCount } = this.applyPhaseOracle(predicateFn);
    const { mean } = this.applyDiffusion();
    this.iterations++;

    // Compute current total success probability of marked states
    let totalSuccessProb = 0;
    const N = this.N;
    const amps = this.amplitudes;
    for (let x = 0; x < N; x++) {
      if (predicateFn(x)) {
        totalSuccessProb += amps[x] * amps[x];
      }
    }

    this.history.push({
      iteration: this.iterations,
      successProbability: totalSuccessProb,
      mean,
    });

    return {
      iteration: this.iterations,
      mean,
      markedCount,
      successProbability: totalSuccessProb,
    };
  }

  /**
   * Sample from the probability distribution P(x) = |alpha_x|^2.
   * Collapses the statevector to the single measured basis state |x_sampled>.
   *
   * @param {Function} [rng=Math.random]
   * @returns {{ sampledState: number, probability: number }}
   */
  measure(rng = Math.random) {
    const N = this.N;
    const amps = this.amplitudes;

    // Calculate total norm (guarantee robust normalization against float drift)
    let norm = 0;
    for (let x = 0; x < N; x++) {
      norm += amps[x] * amps[x];
    }

    // Weighted random selection
    const threshold = rng() * norm;
    let cumulative = 0;
    let sampledState = N - 1;

    for (let x = 0; x < N; x++) {
      cumulative += amps[x] * amps[x];
      if (cumulative >= threshold) {
        sampledState = x;
        break;
      }
    }

    const measuredProb = (amps[sampledState] * amps[sampledState]) / norm;

    // Wavefunction collapse: state collapses to |sampledState>
    amps.fill(0);
    amps[sampledState] = 1.0;

    return {
      sampledState,
      probability: measuredProb,
    };
  }

  /**
   * Get probabilities array P(x) = alpha_x^2
   */
  getProbabilities() {
    const N = this.N;
    const probs = new Float32Array(N);
    const amps = this.amplitudes;
    for (let x = 0; x < N; x++) {
      probs[x] = amps[x] * amps[x];
    }
    return probs;
  }

  /**
   * Retrieve the highest probability states currently in superposition.
   *
   * @param {number} [topCount=10]
   * @returns {Array<{ index: number, amplitude: number, probability: number, phaseDeg: number }>}
   */
  getTopStates(topCount = 10) {
    const N = this.N;
    const amps = this.amplitudes;
    const states = [];

    for (let x = 0; x < N; x++) {
      const a = amps[x];
      const p = a * a;
      if (p > 0.000001) {
        states.push({
          index: x,
          amplitude: a,
          probability: p,
          phaseDeg: a < 0 ? 180 : 0,
        });
      }
    }

    states.sort((a, b) => b.probability - a.probability);
    return states.slice(0, topCount);
  }

  /**
   * Mathematical exact formula for optimal Grover iterations:
   * theta = arcsin(sqrt(M / N))
   * t_opt = round(pi / (4 * theta) - 0.5)
   */
  static calculateOptimalIterations(N, M) {
    if (M <= 0 || M >= N) return 0;
    const theta = Math.asin(Math.sqrt(M / N));
    const continuousOpt = Math.PI / (4 * theta) - 0.5;
    return Math.max(1, Math.round(continuousOpt));
  }

  /**
   * Theoretical success probability after t iterations:
   * P_success(t) = sin^2((2t + 1) * theta)
   */
  static calculateSuccessProbability(N, M, t) {
    if (M <= 0) return 0;
    if (M >= N) return 1;
    const theta = Math.asin(Math.sqrt(M / N));
    const angle = (2 * t + 1) * theta;
    const sinVal = Math.sin(angle);
    return sinVal * sinVal;
  }
}
